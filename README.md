# 🎓 Quiz AI Assistant

A Chrome extension that uses AI to help you understand and answer quiz questions on **Coursera**, **Google Forms**, and **Microsoft Forms**.

---

## ✨ Features

- 🔍 **Auto-scans** quiz pages and extracts all questions + options
- 🤖 **Asks AI** to explain, hint, or answer each question
- ✅ **Highlights** the correct answer directly on the page
- 💾 **Persists results** — answers stay visible even after closing the popup
- 🛡️ **Injection-proof** — detects and strips prompt injection attacks embedded in pages
- 🌐 **Works on 3 platforms** — Coursera, Google Forms, Microsoft Forms

---

## 🤖 Supported AI Providers

| Provider | Free? | Best For |
|----------|-------|----------|
| ⚡ **Groq** | ✅ Free | Fastest — recommended for beginners |
| 💎 **Gemini** | ✅ Free tier | Google's AI, great quality |
| 🤖 **Claude** (Anthropic) | Paid | Most accurate |
| 🟢 **OpenAI** | Paid | GPT-4o |
| 🔧 **Custom** | Depends | Ollama, LM Studio, Together AI, any OpenAI-compatible API |

---

## 🚀 Installation

### Step 1 — Download & Unzip
Download the ZIP and extract the `quiz-ai-assistant` folder to somewhere permanent on your computer (e.g. `Documents/quiz-ai-assistant`). Don't delete it after installing.

### Step 2 — Load in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer Mode** (toggle in the top-right corner)
3. Click **"Load unpacked"**
4. Select the extracted `quiz-ai-assistant` folder
5. The 🎓 icon will appear in your Chrome toolbar

### Step 3 — Pin the Extension
Click the 🧩 puzzle icon in Chrome toolbar → click the 📌 pin next to **Quiz AI Assistant**

---

## 🔑 Getting a Free API Key (Groq — Recommended)

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up for a free account
3. Go to **API Keys** → click **Create API Key**
4. Copy the key (starts with `gsk_...`)
5. Open the extension → select **⚡ Groq** tab → paste key → click **💾 Save Settings**

> **Other providers:**
> - Gemini: [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
> - Anthropic: [console.anthropic.com](https://console.anthropic.com)
> - OpenAI: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

---

## 📖 How to Use

### On Coursera
1. Open a graded quiz or assignment
2. Click the 🎓 extension icon
3. Click **🔍 Scan Page for Questions**
4. Choose a mode (see below)
5. Click **🤖 Solve with AI**
6. Answers are highlighted on the page automatically

### On Google Forms
1. Open a Google Form with multiple choice questions
2. Same steps as above — the extension auto-detects Google Forms

### On Microsoft Forms
1. Open a Microsoft Form quiz
2. Same steps — auto-detected as well

---

## 🎛️ Response Modes

| Mode | What it does |
|------|-------------|
| 📖 **Explain** | Gives the correct answer AND explains why — best for learning |
| 💡 **Hint Only** | Guides you toward the answer without giving it away |
| ✅ **Full Answer** | States the answer directly with a one-line explanation |

---

## 🖊️ Highlight Answers Button

Click **Highlight Answers** to toggle a floating panel on the page that shows the AI's answers alongside a green `✓ AI` badge on the correct option. The panel is draggable — move it anywhere on the screen.

---

## 🔧 Custom / Local AI

To use a local model (e.g. Ollama running on your machine):
1. Select the **🔧 Custom** tab
2. Enter your model name (e.g. `llama3`, `mistral`)
3. Enter your base URL (e.g. `http://localhost:11434/v1`)
4. Leave API key blank for local models
5. Click Save

---

## 🗂️ File Structure

```
quiz-ai-assistant/
├── manifest.json       # Extension config & permissions
├── popup.html          # Extension popup UI
├── popup.js            # Popup logic, question extraction, AI calls
├── background.js       # Service worker — handles all AI API calls
├── content.js          # Injected into quiz pages — clicking & highlighting
├── overlay.css         # Styles for the floating panel on quiz pages
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## ❓ Troubleshooting

| Problem | Fix |
|---------|-----|
| "No questions detected" | Make sure the quiz is fully loaded and questions are visible on screen |
| "sanitizePrompt is not defined" | Reload the extension at `chrome://extensions/` |
| API key error | Re-paste your key (invisible characters can sneak in when copying) — click Save again |
| Answers not highlighting | The page may have re-rendered — click Solve with AI again |
| Extension not detecting page | Make sure you're on the quiz page itself, not the course home |

---

## 🔒 Privacy

- Your API key is stored **locally** in Chrome's storage — never sent anywhere except directly to the AI provider you choose
- No data is collected, logged, or stored on any server
- The extension only activates on Coursera, Google Forms, and Microsoft Forms pages

---

## 📋 Permissions Explained

| Permission | Why it's needed |
|-----------|----------------|
| `activeTab` | Read the current tab's URL to detect which platform you're on |
| `scripting` | Inject the question scanner into quiz pages |
| `storage` | Save your API key and last results locally |
| Host permissions | Make API calls to your chosen AI provider |

---

## 🛠️ Built With

- Vanilla JavaScript (no frameworks)
- Chrome Extensions Manifest V3
- Anthropic / OpenAI / Gemini / Groq APIs

---

*Made with ❤️ — questions, issues or improvements? Rebuild it with Claude at claude.ai*
