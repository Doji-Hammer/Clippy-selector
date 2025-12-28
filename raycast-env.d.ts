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
  "cycleTimeout": string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `index` command */
  export type Index = ExtensionPreferences & {}
  /** Preferences accessible in the `restore-1` command */
  export type Restore1 = ExtensionPreferences & {}
  /** Preferences accessible in the `restore-2` command */
  export type Restore2 = ExtensionPreferences & {}
  /** Preferences accessible in the `restore-3` command */
  export type Restore3 = ExtensionPreferences & {}
  /** Preferences accessible in the `restore-4` command */
  export type Restore4 = ExtensionPreferences & {}
  /** Preferences accessible in the `cycle` command */
  export type Cycle = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `index` command */
  export type Index = {}
  /** Arguments passed to the `restore-1` command */
  export type Restore1 = {}
  /** Arguments passed to the `restore-2` command */
  export type Restore2 = {}
  /** Arguments passed to the `restore-3` command */
  export type Restore3 = {}
  /** Arguments passed to the `restore-4` command */
  export type Restore4 = {}
  /** Arguments passed to the `cycle` command */
  export type Cycle = {}
}

