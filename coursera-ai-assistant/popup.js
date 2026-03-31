// popup.js — Multi-provider AI support

// ── Provider Config ───────────────────────────────────────────────────────────
const PROVIDERS = {
  anthropic: {
    name: 'Anthropic Claude',
    hint: 'Get key at <a href="https://console.anthropic.com" target="_blank">console.anthropic.com</a>',
    models: [
      { id: 'claude-haiku-4-5-20251001',   label: 'Claude Haiku 4.5 (fastest)' },
      { id: 'claude-sonnet-4-5-20251022',  label: 'Claude Sonnet 4.5' },
      { id: 'claude-opus-4-5',             label: 'Claude Opus 4.5 (smartest)' },
      { id: '__custom__',                  label: '+ Custom model...' },
    ],
  },
  openai: {
    name: 'OpenAI',
    hint: 'Get key at <a href="https://platform.openai.com/api-keys" target="_blank">platform.openai.com</a>',
    models: [
      { id: 'gpt-4o-mini',   label: 'GPT-4o Mini (fast + cheap)' },
      { id: 'gpt-4o',        label: 'GPT-4o' },
      { id: 'gpt-4-turbo',   label: 'GPT-4 Turbo' },
      { id: 'o1-mini',       label: 'o1 Mini' },
      { id: '__custom__',    label: '+ Custom model...' },
    ],
  },
  gemini: {
    name: 'Google Gemini',
    hint: 'Get key at <a href="https://aistudio.google.com/app/apikey" target="_blank">aistudio.google.com</a>',
    models: [
      { id: 'gemini-2.0-flash',          label: 'Gemini 2.0 Flash (fastest)' },
      { id: 'gemini-2.0-flash-thinking', label: 'Gemini 2.0 Flash Thinking' },
      { id: 'gemini-1.5-pro',            label: 'Gemini 1.5 Pro' },
      { id: '__custom__',                label: '+ Custom model...' },
    ],
  },
  groq: {
    name: 'Groq (Ultra-fast)',
    hint: 'Get free key at <a href="https://console.groq.com" target="_blank">console.groq.com</a>',
    models: [
      { id: 'llama-3.3-70b-versatile',   label: 'Llama 3.3 70B (recommended)' },
      { id: 'llama-3.1-8b-instant',      label: 'Llama 3.1 8B (fastest)' },
      { id: 'mixtral-8x7b-32768',        label: 'Mixtral 8x7B' },
      { id: 'gemma2-9b-it',              label: 'Gemma 2 9B' },
      { id: '__custom__',                label: '+ Custom model...' },
    ],
  },
  custom: {
    name: 'Custom / Local',
    hint: 'Any OpenAI-compatible API (Ollama, LM Studio, Together AI, etc.)',
    models: [
      { id: '__custom__', label: 'Enter model name below...' },
    ],
  },
};

// ── State ─────────────────────────────────────────────────────────────────────
let currentProvider = 'anthropic';
let currentMode = 'explain';
let scannedQuestions = [];

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  await checkCoursera();
  setupListeners();
  await restoreLastResult();
  await restoreLastQuestions();
});

async function loadSettings() {
  const saved = await chrome.storage.local.get(['provider', 'model', 'apiKey', 'customModel', 'customEndpoint']);
  if (saved.provider) currentProvider = saved.provider;
  renderProviderUI(currentProvider);

  // Restore model selection
  const modelSel = document.getElementById('modelSelect');
  if (saved.model) {
    const opt = [...modelSel.options].find(o => o.value === saved.model);
    if (opt) modelSel.value = saved.model;
    else {
      // It might be a custom model
      modelSel.value = '__custom__';
      handleModelSelectChange(modelSel.value);
    }
  }

  if (saved.apiKey) document.getElementById('apiKey').value = saved.apiKey;
  if (saved.customModel) document.getElementById('customModel').value = saved.customModel;
  if (saved.customEndpoint) document.getElementById('customEndpoint').value = saved.customEndpoint;

  // Highlight active provider tab
  document.querySelectorAll('.ptab').forEach(t => {
    t.classList.toggle('active', t.dataset.provider === currentProvider);
  });
}

async function checkCoursera() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const dot = document.getElementById('statusDot');
  const text = document.getElementById('statusText');
  const url = tab?.url || '';
  if (url.includes('coursera.org')) {
    dot.classList.add('on');
    text.textContent = '✓ Coursera detected — ready!';
  } else if (url.includes('docs.google.com/forms')) {
    dot.classList.add('on');
    text.textContent = '✓ Google Forms detected — ready!';
  } else if (url.includes('forms.office.com') || url.includes('forms.microsoft.com')) {
    dot.classList.add('on');
    text.textContent = '✓ Microsoft Forms detected — ready!';
  } else {
    text.textContent = 'Navigate to Coursera, Google Forms or MS Forms';
  }
}

// ── Render provider UI ────────────────────────────────────────────────────────
function renderProviderUI(provider) {
  const cfg = PROVIDERS[provider];
  const modelSel = document.getElementById('modelSelect');

  // Populate model dropdown
  modelSel.innerHTML = cfg.models.map(m => `<option value="${m.id}">${m.label}</option>`).join('');

  // Show/hide custom model input
  handleModelSelectChange(modelSel.value);

  // Show/hide custom endpoint
  document.getElementById('endpointRow').classList.toggle('visible', provider === 'custom');

  // Provider hint
  document.getElementById('providerHint').innerHTML = cfg.hint || '';

  // Placeholder for API key
  const keyPlaceholders = {
    anthropic: 'sk-ant-api03-...',
    openai: 'sk-...',
    gemini: 'AIza...',
    groq: 'gsk_...',
    custom: 'API key (or leave blank for local)',
  };
  document.getElementById('apiKey').placeholder = keyPlaceholders[provider] || 'API key...';
}

function handleModelSelectChange(val) {
  document.getElementById('customModelRow').classList.toggle('visible', val === '__custom__');
}

// ── Setup Listeners ───────────────────────────────────────────────────────────
function setupListeners() {
  // Provider tabs
  document.querySelectorAll('.ptab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.ptab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentProvider = tab.dataset.provider;
      renderProviderUI(currentProvider);
    });
  });

  // Model select change
  document.getElementById('modelSelect').addEventListener('change', e => {
    handleModelSelectChange(e.target.value);
  });

  // Toggle API key visibility
  document.getElementById('toggleVis').addEventListener('click', () => {
    const inp = document.getElementById('apiKey');
    inp.type = inp.type === 'password' ? 'text' : 'password';
  });

  // Save settings
  document.getElementById('saveBtn').addEventListener('click', async () => {
    const modelSel = document.getElementById('modelSelect');
    const rawKey = document.getElementById('apiKey').value;
    // Strip invisible/non-ASCII chars that sneak in when copy-pasting API keys
    const cleanKey = rawKey.replace(/[^\x20-\x7E]/g, '').trim();
    await chrome.storage.local.set({
      provider: currentProvider,
      model: modelSel.value,
      apiKey: cleanKey,
      customModel: document.getElementById('customModel').value.trim(),
      customEndpoint: document.getElementById('customEndpoint').value.trim(),
    });
    showToast('Settings saved!');
  });

  // Mode buttons
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMode = btn.dataset.mode;
    });
  });

  document.getElementById('scanBtn').addEventListener('click', scanPage);
  document.getElementById('solveBtn').addEventListener('click', solveWithAI);
  document.getElementById('highlightBtn').addEventListener('click', highlightAnswers);
}

// ── Restore last scanned questions ───────────────────────────────────────────
async function restoreLastQuestions() {
  const { lastQuestions } = await chrome.storage.local.get('lastQuestions');
  if (lastQuestions?.length) scannedQuestions = lastQuestions;
}

// ── Restore last result on popup open ────────────────────────────────────────
async function restoreLastResult() {
  const { lastResult, lastResultTime } = await chrome.storage.local.get(['lastResult', 'lastResultTime']);
  if (!lastResult) return;
  // Only restore if less than 30 minutes old
  if (Date.now() - (lastResultTime || 0) > 30 * 60 * 1000) return;
  showResult('<div style="color:var(--muted);font-size:9px;margin-bottom:8px">↩ Last result restored</div>' + formatResponse(lastResult));
}

// ── Scan Page ─────────────────────────────────────────────────────────────────
async function scanPage() {
  setLoading(true, 'Scanning page...');
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Pick extractor based on current page
  const url = tab.url || '';
  const extractor = url.includes('docs.google.com/forms') ? extractGoogleForms
                  : url.includes('forms.office.com') || url.includes('forms.microsoft.com') ? extractMSForms
                  : extractQuestions; // Coursera default

  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: extractor,
  });

  scannedQuestions = results?.[0]?.result || [];
  setLoading(false);

  if (!scannedQuestions.length) {
    const probe = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const host = location.hostname;
        if (host.includes('google.com')) {
          const items = document.querySelectorAll('[role="listitem"].Qr7Oae');
          const radios = document.querySelectorAll('[role="radio"],[role="checkbox"]');
          return { platform: 'Google Forms', items: items.length, radios: radios.length,
                   firstItem: items[0]?.innerText?.slice(0,100) };
        }
        if (host.includes('forms.office.com') || host.includes('forms.microsoft.com')) {
          const items = document.querySelectorAll('[data-automation-id="questionItem"]');
          const choices = document.querySelectorAll('[data-automation-id="choiceItem"]');
          return { platform: 'Microsoft Forms', items: items.length, choices: choices.length,
                   firstItem: items[0]?.innerText?.slice(0,100) };
        }
        const radio = document.querySelectorAll('input[name^="autoGradableResponseId"]');
        const blocks = document.querySelectorAll('div.css-1hhf6i');
        return { platform: 'Coursera', radio: radio.length, blocks: blocks.length };
      }
    });
    const d = probe?.[0]?.result || {};
    showResult(
      `⚠️ No questions detected on <b>${d.platform||'this page'}</b>.<br><br>` +
      Object.entries(d).filter(([k])=>k!=='platform').map(([k,v])=>`${k}: <b>${v}</b>`).join('<br>') +
      `<br><br><small>Make sure the quiz/form is fully loaded and questions are visible.</small>`
    );
    return;
  }

  let html = `<strong style="color:var(--accent)">Found ${scannedQuestions.length} question(s):</strong><br><br>`;
  scannedQuestions.forEach((q, i) => {
    html += `<b>${i+1}.</b> ${truncate(q.question, 90)}<br>`;
    q.options?.forEach(o => { html += `&nbsp;&nbsp;◦ ${truncate(o, 65)}<br>`; });
    html += '<br>';
  });
  showResult(html);
  showToast(`${scannedQuestions.length} questions found!`);
  // Persist scanned questions so they survive popup close
  await chrome.storage.local.set({ lastQuestions: scannedQuestions });
}

// ── Solve with AI ─────────────────────────────────────────────────────────────
async function solveWithAI() {
  if (!scannedQuestions.length) { showResult('⚠️ Scan the page first.'); return; }
  const saved = await chrome.storage.local.get(['provider','model','apiKey','customModel','customEndpoint']);
  if (!saved.apiKey && saved.provider !== 'custom') { showResult('⚠️ Enter your API key and save settings first.'); return; }

  const modelId = saved.model === '__custom__' ? saved.customModel : saved.model;
  if (!modelId) { showResult('⚠️ Select or enter a model name.'); return; }

  setLoading(true, `Asking ${PROVIDERS[saved.provider || 'anthropic']?.name || 'AI'}...`);

  const result = await chrome.runtime.sendMessage({
    type: 'CALL_AI',
    provider: saved.provider || 'anthropic',
    model: modelId,
    apiKey: saved.apiKey,
    customEndpoint: saved.customEndpoint,
    prompt: buildPrompt(scannedQuestions, currentMode),
  });

  setLoading(false);

  if (!result.success) {
    showResult(`❌ Error: <small>${result.error}</small>`);
    return;
  }

  showResult(formatResponse(result.text));

  // Persist result so it survives popup close/reopen
  await chrome.storage.local.set({ lastResult: result.text, lastResultTime: Date.now() });

  // Always send to content script floating panel (all modes)
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const platform = (tab.url||'').includes('docs.google.com/forms') ? 'google'
                 : (tab.url||'').includes('forms.office.com') || (tab.url||'').includes('forms.microsoft.com') ? 'microsoft'
                 : 'coursera';
  chrome.tabs.sendMessage(tab.id, { type: 'AI_ANSWERS', text: result.text, questions: scannedQuestions, platform });
}

// ── Highlight Answers ─────────────────────────────────────────────────────────
async function highlightAnswers() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_HIGHLIGHT' });
  showToast('Highlight toggled on page');
}

// ── Prompt Builder ────────────────────────────────────────────────────────────
function buildPrompt(questions, mode) {
  const qText = questions.map((q, i) => {
    let t = `Question ${i+1}: ${q.question}`;
    if (q.options?.length) t += '\nOptions:\n' + q.options.map((o,j) => `  ${String.fromCharCode(65+j)}) ${o}`).join('\n');
    return t;
  }).join('\n\n');

  if (mode === 'explain') return `You are a helpful tutor. For each question, state the correct answer (e.g. "Answer: B") and explain WHY it's correct in 2-3 sentences to help the student learn.\n\n${qText}`;
  if (mode === 'hint')    return `You are a tutor. Give a helpful hint for each question WITHOUT directly stating the answer. Focus on key concepts.\n\n${qText}`;
  return `For each question, state the correct answer (e.g. "Answer: B") with a one-sentence explanation.\n\n${qText}`;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatResponse(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/Answer:\s*([A-D])\b/gi, '<span class="answer-highlight">Answer: $1</span>')
    .replace(/\n/g, '<br>');
}

function showResult(html) {
  const box = document.getElementById('resultBox');
  box.innerHTML = html;
  box.classList.add('visible');
}

function setLoading(show, msg = 'Thinking...') {
  document.getElementById('loading').classList.toggle('visible', show);
  document.getElementById('loadingText').textContent = msg;
  if (show) document.getElementById('resultBox').classList.remove('visible');
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

function truncate(str, len) {
  return str?.length > len ? str.slice(0, len) + '…' : (str || '');
}

// ── Injectable: Google Forms ──────────────────────────────────────────────────
function extractGoogleForms() {
  const questions = [];
  const items = document.querySelectorAll('[role="listitem"].Qr7Oae');

  items.forEach(item => {
    // Question text is in role="heading" > .M7eMe span
    const headingEl = item.querySelector('[role="heading"] .M7eMe') ||
                      item.querySelector('[role="heading"]');
    const questionText = headingEl?.innerText?.trim();
    if (!questionText || questionText.length < 3) return;

    // Options have role="radio" or role="checkbox", value in data-value / aria-label
    const optionEls = [...item.querySelectorAll('[role="radio"], [role="checkbox"]')];
    if (!optionEls.length) return;

    const options = optionEls.map(o =>
      o.getAttribute('data-value') ||
      o.getAttribute('aria-label') ||
      o.innerText?.trim()
    ).filter(Boolean);

    if (options.length >= 2) {
      questions.push({ question: questionText, options, platform: 'google' });
    }
  });

  return questions;
}

// ── Injectable: Microsoft Forms ───────────────────────────────────────────────
function extractMSForms() {
  const questions = [];
  const items = document.querySelectorAll('[data-automation-id="questionItem"]');

  items.forEach(item => {
    // Question text inside .text-format-content within questionTitle
    const titleEl = item.querySelector('[data-automation-id="questionTitle"] .text-format-content') ||
                    item.querySelector('[data-automation-id="questionTitle"]');
    let questionText = titleEl?.innerText?.trim();
    if (!questionText) return;
    // Strip "1." ordinal prefix
    questionText = questionText.replace(/^\d+\.\s*/, '').replace(/\(\d+\s*Points?\)/i, '').trim();
    if (questionText.length < 3) return;

    // Options: [data-automation-id="choiceItem"], text from data-automation-value
    const choiceItems = [...item.querySelectorAll('[data-automation-id="choiceItem"]')];
    if (!choiceItems.length) return;

    const options = choiceItems.map(c =>
      c.querySelector('[data-automation-value]')?.getAttribute('data-automation-value') ||
      c.innerText?.trim()
    ).filter(Boolean);

    if (options.length >= 2) {
      questions.push({ question: questionText, options, platform: 'microsoft' });
    }
  });

  return questions;
}

// ── Injected into page (Coursera, Google Forms, Microsoft Forms) ─────────────
function extractQuestions() {
  const host = location.hostname;

  // ── GOOGLE FORMS ──────────────────────────────────────────────────────────
  if (host.includes('google.com')) {
    const questions = [];
    const items = document.querySelectorAll('[role="listitem"].Qr7Oae');

    items.forEach(item => {
      // Question text: role="heading" > SPAN.M7eMe
      const headingEl = item.querySelector('[role="heading"] .M7eMe') ||
                        item.querySelector('[role="heading"]');
      const questionText = headingEl?.innerText?.trim();
      if (!questionText || questionText.length < 3) return;

      // Options: divs with role="radio" or role="checkbox", value in data-value or aria-label
      const optionEls = item.querySelectorAll('[role="radio"], [role="checkbox"]');
      if (!optionEls.length) return;

      const options = [...optionEls].map(o =>
        o.getAttribute('data-value') ||
        o.getAttribute('aria-label') ||
        o.innerText?.trim()
      ).filter(Boolean);

      if (options.length >= 2) {
        questions.push({ question: questionText, options, platform: 'google', optionEls: [...optionEls] });
      }
    });

    return questions;
  }

  // ── MICROSOFT FORMS ───────────────────────────────────────────────────────
  if (host.includes('forms.office.com') || host.includes('forms.microsoft.com')) {
    const questions = [];
    const items = document.querySelectorAll('[data-automation-id="questionItem"]');

    items.forEach(item => {
      // Question text: .text-format-content inside questionTitle
      const titleEl = item.querySelector('[data-automation-id="questionTitle"] .text-format-content') ||
                      item.querySelector('[data-automation-id="questionTitle"]');
      let questionText = titleEl?.innerText?.trim();
      if (!questionText) return;
      // Strip ordinal "1." prefix
      questionText = questionText.replace(/^\d+\.\s*/, '').trim();
      if (questionText.length < 3) return;

      // Options: [data-automation-id="choiceItem"], value in data-automation-value on child span
      const choiceItems = item.querySelectorAll('[data-automation-id="choiceItem"]');
      if (!choiceItems.length) return;

      const options = [...choiceItems].map(c =>
        c.querySelector('[data-automation-value]')?.getAttribute('data-automation-value') ||
        c.innerText?.trim()
      ).filter(Boolean);

      if (options.length >= 2) {
        questions.push({ question: questionText, options, platform: 'microsoft', choiceItems: [...choiceItems] });
      }
    });

    return questions;
  }

  // ── COURSERA ──────────────────────────────────────────────────────────────
  const questions = [];

  function clean(text) {
    if (!text) return '';
    return text.replace(/^\d+\.\s*\n?Question\s+\d+\s*\n+/i, '').replace(/^\d+[.):\s]+/, '').trim();
  }

  // Strategy 1: confirmed class selectors
  const questionBlocks = document.querySelectorAll('div.css-1hhf6i');
  questionBlocks.forEach(block => {
    const questionEl = block.querySelector('div.css-gri5r8');
    if (!questionEl) return;
    const rawQuestion = clean(questionEl.innerText || '');
    if (!rawQuestion || rawQuestion.length < 5) return;
    const optionsWrapper = block.querySelector('div.css-1tfphom');
    if (!optionsWrapper) return;
    const inputs = [...optionsWrapper.querySelectorAll('input[name^="autoGradableResponseId"]')];
    if (!inputs.length) return;
    const optionTexts = inputs.map(inp => {
      const label = inp.closest('label');
      return (label ? label.innerText : inp.value || '').trim();
    }).filter(t => t && t.length > 0);
    if (optionTexts.length < 2) return;
    questions.push({ question: rawQuestion, options: [...new Set(optionTexts)], platform: 'coursera', inputName: inputs[0].name, inputIds: inputs.map(i => i.id) });
  });

  // Strategy 2: fallback via radio name
  if (!questions.length) {
    const allInputs = [...document.querySelectorAll('input[name^="autoGradableResponseId"]')];
    const groups = new Map();
    allInputs.forEach(inp => {
      if (!groups.has(inp.name)) groups.set(inp.name, []);
      groups.get(inp.name).push(inp);
    });
    groups.forEach(inputs => {
      const optionTexts = inputs.map(inp => (inp.closest('label')?.innerText || inp.value || '').trim()).filter(Boolean);
      let block = inputs[0];
      for (let i = 0; i < 15; i++) {
        block = block.parentElement;
        if (!block || block === document.body) break;
        if (block.classList.contains('css-1hhf6i')) break;
      }
      if (!block?.classList.contains('css-1hhf6i')) return;
      const questionEl = block.querySelector('div.css-gri5r8');
      const rawQuestion = clean(questionEl ? questionEl.innerText : '');
      if (!rawQuestion || rawQuestion.length < 5 || optionTexts.length < 2) return;
      questions.push({ question: rawQuestion, options: [...new Set(optionTexts)], platform: 'coursera', inputName: inputs[0].name, inputIds: inputs.map(i => i.id) });
    });
  }

  // Deduplicate
  const seen = new Set();
  return questions.filter(q => {
    const key = q.question.slice(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
