import { LocalStorage } from "@raycast/api";

const CONFIG_KEY = "searchConfig";

export interface SearchEngine {
  id: string;
  name: string;
  url: string;
  icon?: string;
}

export interface SearchGroup {
  id: string;
  name: string;
  engineIds: string[];
}

export interface SearchConfig {
  engines: SearchEngine[];
  groups: SearchGroup[];
  directSlots: Record<string, string>; // slot → engineId
  pickerSlots: Record<string, string>; // slot → groupId
}

const DEFAULT_ENGINES: SearchEngine[] = [
  {
    id: "youtube",
    name: "YouTube",
    url: "https://www.youtube.com/results?search_query=%s",
    icon: "🎬",
  },
  {
    id: "amazon",
    name: "Amazon UK",
    url: "https://www.amazon.co.uk/s?k=%s",
    icon: "📦",
  },
  {
    id: "maps",
    name: "Google Maps",
    url: "https://www.google.co.uk/maps/search/%s",
    icon: "🗺️",
  },
  {
    id: "perplexity",
    name: "Perplexity",
    url: "https://www.perplexity.ai/search?q=%s",
    icon: "🤖",
  },
  {
    id: "google",
    name: "Google",
    url: "https://www.google.com/search?q=%s",
    icon: "🔍",
  },
];

const DEFAULT_GROUPS: SearchGroup[] = [
  {
    id: "all",
    name: "All Search Engines",
    engineIds: ["youtube", "amazon", "maps", "perplexity", "google"],
  },
];

const DEFAULT_CONFIG: SearchConfig = {
  engines: DEFAULT_ENGINES,
  groups: DEFAULT_GROUPS,
  directSlots: {
    "1": "google",
    "2": "youtube",
    "3": "amazon",
    "4": "maps",
    "5": "perplexity",
  },
  pickerSlots: {
    "1": "all",
    "2": "",
    "3": "",
  },
};

export async function loadConfig(): Promise<SearchConfig> {
  const raw = await LocalStorage.getItem<string>(CONFIG_KEY);
  if (raw) {
    return JSON.parse(raw) as SearchConfig;
  }
  // First run - save and return defaults
  await saveConfig(DEFAULT_CONFIG);
  return DEFAULT_CONFIG;
}

export async function saveConfig(config: SearchConfig): Promise<void> {
  await LocalStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export function getEngineById(
  config: SearchConfig,
  id: string,
): SearchEngine | undefined {
  return config.engines.find((e) => e.id === id);
}

export function getGroupById(
  config: SearchConfig,
  id: string,
): SearchGroup | undefined {
  return config.groups.find((g) => g.id === id);
}

export function getEnginesInGroup(
  config: SearchConfig,
  groupId: string,
): SearchEngine[] {
  const group = getGroupById(config, groupId);
  if (!group) return [];
  return group.engineIds
    .map((id) => getEngineById(config, id))
    .filter((e): e is SearchEngine => e !== undefined);
}

export function buildSearchUrl(engine: SearchEngine, query: string): string {
  return engine.url.replace("%s", encodeURIComponent(query));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}
