# Clipboard History

A Raycast extension for clipboard management, quick search, and YouTube transcript utilities.

## Features

### Clipboard Management
- **Browse History** - View and search clipboard entries with timestamps
- **Cycle Clipboard** - Cycle through recent entries with a single hotkey (no UI, just press repeatedly)

### Quick Search
- **Quick Search 1-5** - Instantly search clipboard text with your configured engine
- **Search Picker 1-3** - Choose from a group of search engines
- **URL Detection** - If clipboard contains a URL, opens it directly instead of searching
- **Manage Search Engines** - Full UI to add/edit/remove engines, create groups, and assign slots

### YouTube Transcripts
- **Fetch YouTube Transcript** - Download transcript from a YouTube URL in your clipboard
- **Transcript to AI** - Fetch transcript and open it with your preferred AI model (ChatGPT, Claude, Perplexity, Gemini, Copilot)

## Installation

1. Install from Raycast Store, or clone and run `npm install && npm run dev`
2. For YouTube transcripts, install yt-dlp:
   ```bash
   brew install yt-dlp
   ```

## Commands

| Command | Description |
|---------|-------------|
| Browse History | View clipboard entries in searchable list |
| Cycle Clipboard | Cycle through last 10 entries with repeated presses |
| Quick Search 1-5 | Search clipboard text with configured engine |
| Search Picker 1-3 | Pick from configured search group |
| Manage Search Engines | Configure engines, groups, and slots |
| Fetch YouTube Transcript | Download transcript from YouTube URL in clipboard |
| Transcript to AI | Fetch transcript and open with AI model |

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

## Author

Doji-Hammer

## License

MIT
