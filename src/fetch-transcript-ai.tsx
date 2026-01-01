import {
  List,
  ActionPanel,
  Action,
  showToast,
  Toast,
  open,
  Clipboard,
  showHUD,
  closeMainWindow,
} from "@raycast/api";
import { useState, useEffect } from "react";
import {
  getYouTubeUrlFromClipboard,
  fetchTranscript,
  saveTranscript,
} from "./transcript-utils";

interface AIModel {
  id: string;
  name: string;
  icon: string;
  url: string;
}

const AI_MODELS: AIModel[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    icon: "🤖",
    url: "https://chat.openai.com/",
  },
  {
    id: "claude",
    name: "Claude",
    icon: "🧠",
    url: "https://claude.ai/new",
  },
  {
    id: "perplexity",
    name: "Perplexity",
    icon: "🔮",
    url: "https://www.perplexity.ai/",
  },
  {
    id: "gemini",
    name: "Gemini",
    icon: "✨",
    url: "https://gemini.google.com/app",
  },
  {
    id: "copilot",
    name: "Copilot",
    icon: "🪟",
    url: "https://copilot.microsoft.com/",
  },
];

export default function Command() {
  const [transcript, setTranscript] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTranscript() {
      const urlInfo = await getYouTubeUrlFromClipboard();
      if (!urlInfo) {
        setError("No YouTube URL found in clipboard");
        setIsLoading(false);
        return;
      }

      try {
        await showToast({
          style: Toast.Style.Animated,
          title: "Fetching transcript...",
        });

        const result = await fetchTranscript(urlInfo.videoUrl, urlInfo.videoId);
        setTranscript(result.transcript);
        setTitle(result.title);

        // Save to file
        await saveTranscript(result.transcript, result.title);

        await showToast({
          style: Toast.Style.Success,
          title: "Transcript ready",
          message: "Select an AI to continue",
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        await showToast({
          style: Toast.Style.Failure,
          title: "Failed to fetch transcript",
          message: message,
        });
      }

      setIsLoading(false);
    }

    loadTranscript();
  }, []);

  async function handleSelectAI(model: AIModel) {
    if (!transcript) return;

    // Copy transcript to clipboard
    await Clipboard.copy(transcript);

    // Close Raycast and open the AI
    await closeMainWindow();
    await open(model.url);

    await showHUD(`📋 Transcript copied. Opening ${model.name}...`);
  }

  if (error) {
    return (
      <List>
        <List.EmptyView title="Error" description={error} />
      </List>
    );
  }

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Select an AI model...">
      {transcript && (
        <List.Section title={`Transcript: ${title}`}>
          {AI_MODELS.map((model) => (
            <List.Item
              key={model.id}
              icon={model.icon}
              title={model.name}
              subtitle="Copy transcript & open"
              actions={
                <ActionPanel>
                  <Action
                    title={`Open ${model.name}`}
                    onAction={() => handleSelectAI(model)}
                  />
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      )}
    </List>
  );
}
