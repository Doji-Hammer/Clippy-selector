/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Max history items - Maximum number of clipboard entries to store */
  "maxItems": string,
  /** Poll interval (ms) - How often to check for new clipboard content */
  "pollInterval": string,
  /** Cycle limit - Maximum number of entries to cycle through */
  "cycleLimit": string,
  /** Cycle timeout (ms) - Time window for consecutive cycle presses before resetting */
  "cycleTimeout": string,
  /** Transcript folder - Where to save YouTube transcripts */
  "transcriptFolder": string,
  /** Transcript language - Preferred language code for transcripts (e.g., en, es, fr) */
  "transcriptLanguage": string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `index` command */
  export type Index = ExtensionPreferences & {}
  /** Preferences accessible in the `cycle` command */
  export type Cycle = ExtensionPreferences & {}
  /** Preferences accessible in the `manage-searches` command */
  export type ManageSearches = ExtensionPreferences & {}
  /** Preferences accessible in the `search-direct-1` command */
  export type SearchDirect1 = ExtensionPreferences & {}
  /** Preferences accessible in the `search-direct-2` command */
  export type SearchDirect2 = ExtensionPreferences & {}
  /** Preferences accessible in the `search-direct-3` command */
  export type SearchDirect3 = ExtensionPreferences & {}
  /** Preferences accessible in the `search-direct-4` command */
  export type SearchDirect4 = ExtensionPreferences & {}
  /** Preferences accessible in the `search-direct-5` command */
  export type SearchDirect5 = ExtensionPreferences & {}
  /** Preferences accessible in the `search-picker-1` command */
  export type SearchPicker1 = ExtensionPreferences & {}
  /** Preferences accessible in the `search-picker-2` command */
  export type SearchPicker2 = ExtensionPreferences & {}
  /** Preferences accessible in the `search-picker-3` command */
  export type SearchPicker3 = ExtensionPreferences & {}
  /** Preferences accessible in the `fetch-transcript` command */
  export type FetchTranscript = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `index` command */
  export type Index = {}
  /** Arguments passed to the `cycle` command */
  export type Cycle = {}
  /** Arguments passed to the `manage-searches` command */
  export type ManageSearches = {}
  /** Arguments passed to the `search-direct-1` command */
  export type SearchDirect1 = {}
  /** Arguments passed to the `search-direct-2` command */
  export type SearchDirect2 = {}
  /** Arguments passed to the `search-direct-3` command */
  export type SearchDirect3 = {}
  /** Arguments passed to the `search-direct-4` command */
  export type SearchDirect4 = {}
  /** Arguments passed to the `search-direct-5` command */
  export type SearchDirect5 = {}
  /** Arguments passed to the `search-picker-1` command */
  export type SearchPicker1 = {}
  /** Arguments passed to the `search-picker-2` command */
  export type SearchPicker2 = {}
  /** Arguments passed to the `search-picker-3` command */
  export type SearchPicker3 = {}
  /** Arguments passed to the `fetch-transcript` command */
  export type FetchTranscript = {}
}

