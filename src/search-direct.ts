import { Clipboard, open, showHUD } from "@raycast/api";
import { loadConfig, getEngineById, buildSearchUrl } from "./search-engines";

// Check if text looks like a URL
function isUrl(text: string): boolean {
  const trimmed = text.trim();
  // Match common URL patterns
  const urlPattern = /^(https?:\/\/|www\.)[^\s]+\.[^\s]+/i;
  return urlPattern.test(trimmed);
}

// Normalize URL (add https:// if missing)
function normalizeUrl(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith("www.")) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

export async function searchDirect(slot: string) {
  const config = await loadConfig();
  const engineId = config.directSlots[slot];

  if (!engineId) {
    await showHUD(`Slot ${slot} not configured`);
    return;
  }

  const engine = getEngineById(config, engineId);
  if (!engine) {
    await showHUD(`Engine not found: ${engineId}`);
    return;
  }

  const clipboardText = await Clipboard.readText();
  if (!clipboardText?.trim()) {
    await showHUD("Clipboard is empty");
    return;
  }

  const text = clipboardText.trim();

  // If clipboard contains a URL, open it directly
  if (isUrl(text)) {
    const directUrl = normalizeUrl(text);
    await open(directUrl);
    await showHUD(`🔗 Opening: ${text.slice(0, 50)}...`);
    return;
  }

  // Otherwise, use the search engine
  const url = buildSearchUrl(engine, text);
  await open(url);
  await showHUD(
    `${engine.icon || "🔍"} ${engine.name}: ${text.slice(0, 20)}...`,
  );
}

// Individual slot commands
export async function searchDirect1() {
  await searchDirect("1");
}

export async function searchDirect2() {
  await searchDirect("2");
}

export async function searchDirect3() {
  await searchDirect("3");
}

export async function searchDirect4() {
  await searchDirect("4");
}

export async function searchDirect5() {
  await searchDirect("5");
}
