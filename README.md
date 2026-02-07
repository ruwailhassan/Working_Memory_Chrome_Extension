# Working Memory Chrome Extension

A Chrome-compatible extension that injects a persistent **Working Memory** side panel into the ChatGPT UI, keeping a visible Now Stack (max 7 items) and enabling checkpoint compression, archives, and prompt injection.

## Features
- **Side panel UI** with a Now Stack (max 7 bullets) and inline editing.
- **Checkpoint**: compresses the last N user/assistant messages into ≤7 bullets with ≤12 words each.
- **Archive (Vault)**: store past stacks locally and restore them later.
- **Copy as Prompt**: copy the stack + instruction block to your clipboard.
- **Prompt injection toggle**: optionally prepends the Working Memory block to your next message.
- **Persistence**: uses `chrome.storage.local` to survive reloads.

## Folder Structure
- `ui/`: Shadow DOM panel rendering.
- `storage/`: local persistence helpers.
- `compression/`: local compression + optional API compression.

## Installation (Chrome)
1. Open Chrome and go to `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select this repository folder.
4. Navigate to `https://chat.openai.com/`.

## Usage
- Click **Checkpoint** to summarize the last N messages into the Now Stack.
- Toggle **Prompt injection** to prepend the stack to your next message.
- Click **Archive** to save the current stack in the Vault.
- Click **Copy as Prompt** to copy the stack + instructions.

## API Compression (Optional)
- Enable **Use API compression** and enter your OpenAI API key + model.
- If the API fails, the extension falls back to local compression.

## What Works / What’s Next
**What works**
- Persistent, editable Now Stack with pin/protect toggles (stored but not yet used in compression).
- Checkpoint compression (local + optional API).
- Vault archive/restore.
- Prompt injection toggle and copy-to-clipboard.

**What’s next**
- Add per-item pin/protect logic to influence compression.
- Improve ChatGPT DOM selectors for future UI changes.
- Add optional panel resize/collapse controls.
