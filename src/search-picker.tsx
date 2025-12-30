import {
  List,
  ActionPanel,
  Action,
  showHUD,
  closeMainWindow,
  Clipboard,
  open,
} from "@raycast/api";
import { useEffect, useState } from "react";
import {
  loadConfig,
  getEnginesInGroup,
  buildSearchUrl,
  SearchEngine,
} from "./search-engines";

interface PickerProps {
  slot: string;
}

export function SearchPicker({ slot }: PickerProps) {
  const [engines, setEngines] = useState<SearchEngine[]>([]);
  const [clipboardText, setClipboardText] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [groupName, setGroupName] = useState<string>("");

  useEffect(() => {
    async function init() {
      const config = await loadConfig();
      const groupId = config.pickerSlots[slot];

      if (!groupId) {
        await showHUD(`Picker slot ${slot} not configured`);
        return;
      }

      const group = config.groups.find((g) => g.id === groupId);
      if (group) {
        setGroupName(group.name);
      }

      const groupEngines = getEnginesInGroup(config, groupId);
      setEngines(groupEngines);

      const text = await Clipboard.readText();
      setClipboardText(text?.trim() || "");
      setIsLoading(false);
    }
    init();
  }, [slot]);

  async function handleSearch(engine: SearchEngine) {
    if (!clipboardText) {
      await showHUD("Clipboard is empty");
      return;
    }
    const url = buildSearchUrl(engine, clipboardText);
    await closeMainWindow();
    await open(url);
    await showHUD(`${engine.icon || "🔍"} ${engine.name}`);
  }

  if (!clipboardText && !isLoading) {
    return (
      <List>
        <List.EmptyView
          title="Clipboard is Empty"
          description="Copy some text first, then use this command"
        />
      </List>
    );
  }

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder={`Search "${clipboardText.slice(0, 30)}${clipboardText.length > 30 ? "..." : ""}"`}
    >
      <List.Section title={groupName || "Search Engines"}>
        {engines.map((engine) => (
          <List.Item
            key={engine.id}
            icon={engine.icon || "🔍"}
            title={engine.name}
            subtitle={engine.url.replace("%s", "...")}
            actions={
              <ActionPanel>
                <Action
                  title={`Search ${engine.name}`}
                  onAction={() => handleSearch(engine)}
                />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
    </List>
  );
}
