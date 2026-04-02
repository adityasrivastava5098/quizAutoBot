# 🎓 Quiz AI Assistant

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-blue.svg)](https://chrome.google.com/webstore/detail/...)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![AI Supported](https://img.shields.io/badge/AI-Multi--Provider-green.svg)](#-configuration--ai-providers)

A powerful Chrome extension designed to help you understand and answer quiz questions on **Coursera**, **Google Forms**, and **Microsoft Forms** using advanced AI.

---

## ✨ Features

- 🔍 **Auto-scans** quiz pages and extracts all questions + options
- 🤖 **Multi-AI Support** — Use Groq, Gemini, Claude, OpenAI, or local models
- ✅ **Smart Highlighting** — Visualizes correct answers directly on the page
- 💾 **State Persistence** — Answers remain visible even after closing the popup
- 🛡️ **Injection-proof** — Advanced protection against prompt injection attacks
- 🌐 **Platform Native** — Optimized for Coursera, Google, and MS Forms

---

<details>
<summary>🚀 <b>Getting Started</b> (Quick Installation)</summary>

### Step 1 — Download & Unzip
Download the ZIP and extract the `quiz-ai-assistant` folder to a permanent location on your computer.

### Step 2 — Load in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer Mode** (top-right corner)
3. Click **"Load unpacked"** and select the extracted folder
4. Pin the extension by clicking the 🧩 puzzle icon → 📌 pin next to **Quiz AI Assistant**

### Step 3 — Get Your API Key (Groq Recommended)
1. Visit [console.groq.com](https://console.groq.com) and create a free account.
2. Generate an **API Key** (starts with `gsk_...`).
3. Open the extension → **⚡ Groq** tab → paste key → **💾 Save Settings**.

> **Other Keys:** [Gemini](https://aistudio.google.com/app/apikey) | [Anthropic](https://console.anthropic.com) | [OpenAI](https://platform.openai.com/api-keys)
</details>

<details>
<summary>📖 <b>Usage Guide</b> (How to use & Modes)</summary>

### How to Use
1. Open a quiz on **Coursera**, **Google Forms**, or **Microsoft Forms**.
2. Click the 🎓 icon and select **🔍 Scan Page for Questions**.
3. Choose your preferred **Response Mode** and click **🤖 Solve with AI**.
4. Use the **Highlight Answers** toggle to see a draggable panel with detailed explanations.

### Response Modes
| Mode | Description |
|------|-------------|
| 📖 **Explain** | Full answer + detailed reasoning (best for learning) |
| 💡 **Hint Only** | Strategic guidance without giving the answer away |
| ✅ **Full Answer** | Direct answer with a concise one-line summary |
</details>

<details>
<summary>⚙️ <b>Configuration & AI Providers</b></summary>

### Supported Providers
| Provider | Tier | Best For |
|----------|-------|----------|
| ⚡ **Groq** | ✅ Free | Maximum speed & low latency |
| 💎 **Gemini** | ✅ Free tier | High reasoning quality |
| 🤖 **Claude** | Paid | Ultimate accuracy |
| 🟢 **OpenAI** | Paid | Industry standard (GPT-4o) |

### Custom / Local AI
To use models like **Ollama** or **LM Studio**:
1. Select the **🔧 Custom** tab.
2. Enter your model name (e.g., `llama3`) and Base URL (e.g., `http://localhost:11434/v1`).
3. Leave the API key blank for local hostings and click **Save**.
</details>

<details>
<summary>🛠️ <b>Technical Details</b></summary>

### File Structure
```text
quiz-ai-assistant/
├── manifest.json       # Extension configuration
├── popup.html/js       # Extension UI & logic
├── background.js       # AI API orchestration
├── content.js          # Page interaction & highlighting
└── overlay.css         # Draggable UI styles
```

### Permissions Explained
- `activeTab` & `scripting`: Required to scan and highlight quiz content.
- `storage`: Safely stores your API keys and session results locally.
- `host permissions`: Allows the extension to communicate with AI providers.

### Built With
- Pure Vanilla JavaScript (Manifest V3)
- Modern CSS (Glassmorphism UI)
- Multiple LLM API Integrations
</details>

<details>
<summary>🆘 <b>Troubleshooting & Privacy</b></summary>

### Troubleshooting
- **No questions detected?** Ensure the quiz is fully loaded and visible.
- **API Error?** Verify your key and ensure you haven't exceeded rate limits.
- **Not highlighting?** Try clicking "Solve with AI" again if the page re-rendered.

### 🔒 Privacy First
- **Local Storage:** API keys never leave your machine except for direct AI calls.
- **Zero Tracking:** No data collection, telemetry, or external logging.
- **Scoped Access:** Only activates on explicitly supported quiz platforms.
</details>

---

<p align="center">Made with ❤️ for faster learning</p>
