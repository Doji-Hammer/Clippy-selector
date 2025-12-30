import {
  showToast,
  Toast,
  getPreferenceValues,
  open,
  Clipboard,
  showHUD,
} from "@raycast/api";
import { execFile } from "child_process";
import { promisify } from "util";
import { promises as fs } from "fs";
import path from "path";
import os from "os";

const execFileAsync = promisify(execFile);

interface Preferences {
  transcriptFolder: string;
  transcriptLanguage: string;
}

// YouTube URL patterns
const YOUTUBE_PATTERNS = [
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
  /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
];

function extractVideoId(url: string): string | null {
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function sanitizeFilename(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 200);
}

async function findYtDlp(): Promise<string> {
  const possiblePaths = [
    "/opt/homebrew/bin/yt-dlp",
    "/usr/local/bin/yt-dlp",
    "/usr/bin/yt-dlp",
    path.join(os.homedir(), ".local/bin/yt-dlp"),
  ];

  for (const ytdlpPath of possiblePaths) {
    try {
      await fs.access(ytdlpPath);
      return ytdlpPath;
    } catch {
      // Continue to next path
    }
  }

  // Try PATH
  try {
    const { stdout } = await execFileAsync("which", ["yt-dlp"]);
    return stdout.trim();
  } catch {
    throw new Error("yt-dlp not found. Install it with: brew install yt-dlp");
  }
}

function parseVttToText(vttContent: string): string {
  const lines = vttContent.split("\n");
  const textLines: string[] = [];
  let lastLine = "";

  for (const line of lines) {
    // Skip WebVTT header, timestamps, and empty lines
    if (
      line.startsWith("WEBVTT") ||
      line.startsWith("Kind:") ||
      line.startsWith("Language:") ||
      line.match(/^\d{2}:\d{2}:\d{2}/) ||
      line.match(/^[\d:.]+\s*-->/) ||
      line.trim() === ""
    ) {
      continue;
    }

    // Remove HTML tags and clean up
    const cleanLine = line
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .trim();

    // Skip duplicates (common in auto-generated captions)
    if (cleanLine && cleanLine !== lastLine) {
      textLines.push(cleanLine);
      lastLine = cleanLine;
    }
  }

  return textLines.join("\n");
}

export default async function Command() {
  const prefs = getPreferenceValues<Preferences>();
  const downloadFolder =
    prefs.transcriptFolder || path.join(os.homedir(), "Downloads");
  const language = prefs.transcriptLanguage || "en";

  // Read URL from clipboard
  const clipboardText = await Clipboard.readText();
  if (!clipboardText?.trim()) {
    await showHUD("Clipboard is empty");
    return;
  }

  const videoId = extractVideoId(clipboardText.trim());
  if (!videoId) {
    await showHUD("No YouTube URL found in clipboard");
    return;
  }

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    await showToast({
      style: Toast.Style.Animated,
      title: "Fetching transcript...",
    });

    // Find yt-dlp
    const ytdlpPath = await findYtDlp();

    // Create temp directory for subtitle files
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "yt-transcript-"));

    try {
      // Fetch video title first
      const { stdout: titleOutput } = await execFileAsync(ytdlpPath, [
        "--get-title",
        "--no-warnings",
        videoUrl,
      ]);
      const videoTitle = titleOutput.trim() || videoId;

      // Download subtitles
      const subtitlePath = path.join(tempDir, "subtitle");
      await execFileAsync(ytdlpPath, [
        "--write-auto-sub",
        "--sub-lang",
        language,
        "--skip-download",
        "--sub-format",
        "vtt",
        "-o",
        subtitlePath,
        "--no-warnings",
        videoUrl,
      ]);

      // Find the downloaded subtitle file
      const files = await fs.readdir(tempDir);
      const vttFile = files.find((f) => f.endsWith(".vtt"));

      if (!vttFile) {
        throw new Error("No transcript available for this video");
      }

      // Read and parse VTT
      const vttContent = await fs.readFile(
        path.join(tempDir, vttFile),
        "utf-8",
      );
      const transcript = parseVttToText(vttContent);

      if (!transcript.trim()) {
        throw new Error("Transcript is empty");
      }

      // Save to file
      const sanitizedTitle = sanitizeFilename(videoTitle);
      const filename = path.join(
        downloadFolder,
        `${sanitizedTitle}_transcript.txt`,
      );

      // Ensure download folder exists
      await fs.mkdir(downloadFolder, { recursive: true });
      await fs.writeFile(filename, transcript);

      await showToast({
        style: Toast.Style.Success,
        title: "Transcript saved",
        message: sanitizedTitle,
        primaryAction: {
          title: "Open File",
          onAction: () => open(filename),
        },
        secondaryAction: {
          title: "Open Folder",
          onAction: () => open(downloadFolder),
        },
      });
    } finally {
      // Clean up temp directory
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message.includes("yt-dlp")) {
      await showToast({
        style: Toast.Style.Failure,
        title: "yt-dlp not found",
        message: "Install with: brew install yt-dlp",
      });
    } else {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to fetch transcript",
        message: message,
      });
    }
  }
}
