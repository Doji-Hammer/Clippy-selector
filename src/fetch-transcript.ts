import { showToast, Toast, open, Clipboard, showHUD } from "@raycast/api";
import {
  getYouTubeUrlFromClipboard,
  fetchTranscript,
  saveTranscript,
} from "./transcript-utils";

export default async function Command() {
  // Read URL from clipboard
  const urlInfo = await getYouTubeUrlFromClipboard();
  if (!urlInfo) {
    await showHUD("No YouTube URL found in clipboard");
    return;
  }

  try {
    await showToast({
      style: Toast.Style.Animated,
      title: "Fetching transcript...",
    });

    const { transcript, title } = await fetchTranscript(
      urlInfo.videoUrl,
      urlInfo.videoId,
    );

    // Save to file
    const filename = await saveTranscript(transcript, title);

    // Copy to clipboard
    await Clipboard.copy(transcript);

    await showToast({
      style: Toast.Style.Success,
      title: "Transcript saved & copied",
      message: title,
      primaryAction: {
        title: "Open File",
        onAction: () => open(filename),
      },
    });
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
