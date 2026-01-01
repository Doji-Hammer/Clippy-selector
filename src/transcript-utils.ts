import { Clipboard, getPreferenceValues } from "@raycast/api";
import { execFile } from "child_process";
import { promisify } from "util";
import { promises as fs } from "fs";
import path from "path";
import os from "os";

const execFileAsync = promisify(execFile);

export interface TranscriptPreferences {
  transcriptFolder: string;
  transcriptLanguage: string;
}

export interface TranscriptResult {
  transcript: string;
  title: string;
  filename: string;
}

// YouTube URL patterns
const YOUTUBE_PATTERNS = [
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
  /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
];

export function extractVideoId(url: string): string | null {
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function sanitizeFilename(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 200);
}

export async function findYtDlp(): Promise<string> {
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

export function parseVttToText(vttContent: string): string {
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

export async function getYouTubeUrlFromClipboard(): Promise<{
  videoId: string;
  videoUrl: string;
} | null> {
  const clipboardText = await Clipboard.readText();
  if (!clipboardText?.trim()) {
    return null;
  }

  const videoId = extractVideoId(clipboardText.trim());
  if (!videoId) {
    return null;
  }

  return {
    videoId,
    videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
  };
}

export async function fetchTranscript(
  videoUrl: string,
  videoId: string,
): Promise<{ transcript: string; title: string }> {
  const prefs = getPreferenceValues<TranscriptPreferences>();
  const language = prefs.transcriptLanguage || "en";

  const ytdlpPath = await findYtDlp();
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "yt-transcript-"));

  try {
    // Fetch video title first
    const { stdout: titleOutput } = await execFileAsync(ytdlpPath, [
      "--get-title",
      "--no-warnings",
      videoUrl,
    ]);
    const title = titleOutput.trim() || videoId;

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
    const vttContent = await fs.readFile(path.join(tempDir, vttFile), "utf-8");
    const transcript = parseVttToText(vttContent);

    if (!transcript.trim()) {
      throw new Error("Transcript is empty");
    }

    return { transcript, title };
  } finally {
    // Clean up temp directory
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

export async function saveTranscript(
  transcript: string,
  title: string,
): Promise<string> {
  const prefs = getPreferenceValues<TranscriptPreferences>();
  const downloadFolder =
    prefs.transcriptFolder || path.join(os.homedir(), "Downloads");

  const sanitizedTitle = sanitizeFilename(title);
  const filename = path.join(
    downloadFolder,
    `${sanitizedTitle}_transcript.txt`,
  );

  await fs.mkdir(downloadFolder, { recursive: true });
  await fs.writeFile(filename, transcript);

  return filename;
}
