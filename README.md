# Clippy Selector (Clipboard History)

A Raycast extension for clipboard management, quick search, and YouTube transcript utilities.

## Features

### 📋 Clipboard Management
- **Browse History** - View and search clipboard entries with timestamps
- **Cycle Clipboard** - Cycle through recent entries with a single hotkey (no UI, just press repeatedly)

### 🔍 Quick Search
- **Quick Search 1-5** - Instantly search clipboard text with your configured engine
- **Search Picker 1-3** - Choose from a group of search engines
- **URL Detection** - If clipboard contains a URL, opens it directly instead of searching
- **Manage Search Engines** - Full UI to add/edit/remove engines, create groups, and assign slots

### 📺 YouTube Transcripts
- **Fetch YouTube Transcript** - Download transcript from a YouTube URL in your clipboard
- **Transcript to AI** - Fetch transcript and open it with your preferred AI model (ChatGPT, Claude, Perplexity, Gemini, Copilot)

## Installation

### Prerequisites
- [Raycast](https://raycast.com/) installed
- [Node.js](https://nodejs.org/) 18+ and npm
- For YouTube transcripts: [yt-dlp](https://github.com/yt-dlp/yt-dlp) (`brew install yt-dlp`)

### Install from Source

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd Clippy-selector
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Import into Raycast:
   ```bash
   npm run dev
   ```
   
   Or manually import:
   - Open Raycast
   - Run `Import Extension`
   - Select the `Clippy-selector` folder

### Development Mode

To run in development mode with hot reload:
```bash
npm run dev
```

## Commands

| Command | Mode | Description |
|---------|------|-------------|
| Browse History | View | View clipboard entries in searchable list |
| Cycle Clipboard | No-view | Cycle through last 10 entries with repeated presses |
| Quick Search 1-5 | No-view | Search clipboard text with configured engine |
| Search Picker 1-3 | View | Pick from configured search group |
| Manage Search Engines | View | Configure engines, groups, and slots |
| Fetch YouTube Transcript | No-view | Download transcript from YouTube URL in clipboard |
| Transcript to AI | View | Fetch transcript and open with AI model |

## Configuration

### Preferences

| Preference | Default | Description |
|------------|---------|-------------|
| Max history items | 50 | Maximum clipboard entries to store |
| Poll interval | 500ms | How often to check for new clipboard content |
| Cycle limit | 10 | Max entries to cycle through |
| Cycle timeout | 2000ms | Time window for consecutive cycle presses |
| Transcript folder | ~/Downloads | Where to save YouTube transcripts |
| Transcript language | en | Preferred language for transcripts |

### Search Engine Setup

1. Open "Manage Search Engines"
2. Add engines with URL containing `%s` placeholder
3. Create groups to organize engines
4. Assign engines to Quick Search slots (1-5)
5. Assign groups to Search Picker slots (1-3)

**Default Engines:**
- Google, YouTube, Amazon UK, Google Maps, Perplexity

## Usage Examples

### Cycle Clipboard
1. Copy several items
2. Press your Cycle Clipboard hotkey repeatedly
3. Each press shows the next item and copies it to clipboard
4. Stop pressing - next press starts from the beginning

### Quick Search
1. Copy some text (or a URL)
2. Press Quick Search 1 (or 2-5)
3. Opens your browser with search results (or navigates to URL directly)

### YouTube Transcript
1. Copy a YouTube video URL
2. Run "Transcript to AI"
3. Select an AI model
4. Transcript is copied to clipboard and AI opens

## Project Structure

```
Clippy-selector/
├── assets/
│   └── extension-icon.png    # Extension icon
├── src/
│   ├── index.tsx             # Browse History command
│   ├── cycle.ts              # Cycle Clipboard command
│   ├── clipboard.ts          # Clipboard storage logic
│   ├── watcher.ts            # Clipboard polling
│   ├── utils.ts              # Utility functions
│   ├── search-engines.ts     # Search engine config
│   ├── search-direct.ts      # Quick search logic
│   ├── search-direct-*.ts    # Individual slot commands
│   ├── search-picker.tsx     # Search picker UI
│   ├── search-picker-*.tsx   # Individual picker commands
│   ├── manage-searches.tsx   # Search engine management UI
│   ├── fetch-transcript.ts   # YouTube transcript command
│   ├── fetch-transcript-ai.tsx  # Transcript to AI command
│   └── transcript-utils.ts   # Transcript helper functions
├── package.json              # Extension manifest
├── tsconfig.json             # TypeScript config
└── README.md                 # This file
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Build the extension |
| `npm run dev` | Run in development mode with hot reload |
| `npm run lint` | Run ESLint and Prettier checks |
| `npm run fix-lint` | Auto-fix linting issues |
| `npm run publish` | Publish to Raycast Store |

## Troubleshooting

### Extension not appearing in Raycast
- Make sure you've run `npm run build` or `npm run dev`
- Try importing the extension manually via Raycast's "Import Extension" command

### Clipboard not being tracked
- Check that the "Browse History" command has been run at least once
- Verify the poll interval preference is set correctly

### YouTube transcript fails
- Ensure yt-dlp is installed: `brew install yt-dlp`
- Check that the video has captions/transcripts available
- Verify the transcript language preference matches available languages

## License

MIT

## Author

Doji-Hammer
