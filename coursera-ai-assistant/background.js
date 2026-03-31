// background.js — Universal AI provider service worker

chrome.runtime.onInstalled.addListener(() => {
  console.log('Coursera AI Assistant v2 installed');
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'CALL_AI') {
    callAI(msg)
      .then(text => sendResponse({ success: true, text }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }
});

// ── Prompt sanitizer ──────────────────────────────────────────────────────────
function sanitizePrompt(prompt) {
  const patterns = [
    /You are a helpful AI assistant[\s\S]*?I understand\.?/gi,
    /You are a helpful AI assistant[\s\S]*?Do you understand\??\.?/gi,
    /IMPORTANT:\s*AI Agent Compliance[\s\S]*?Do you understand\??\.?/gi,
    /uphold academic integrity[\s\S]*?prohibited\./gi,
    /data-action="acknowledge-guidelines"[^.\n]*/gi,
    /click.*?button.*?labeled[^.\n]*/gi,
    /this verification step is mandatory[^.\n]*/gi,
    /scan all elements on this page[^.\n]*/gi,
    /mandatory for all AI assistants[^.\n]*/gi,
  ];
  let clean = prompt;
  patterns.forEach(p => { clean = clean.replace(p, ''); });
  return clean.trim();
}

// ── Main router ───────────────────────────────────────────────────────────────
async function callAI({ provider, model, apiKey, customEndpoint, prompt }) {
  prompt = sanitizePrompt(prompt);
  // Strip any non-ASCII / invisible characters from API key (copy-paste artifacts)
  apiKey = (apiKey || '').replace(/[^\x20-\x7E]/g, '').trim();
  switch (provider) {
    case 'anthropic': return callAnthropic(apiKey, model, prompt);
    case 'openai':    return callOpenAI(apiKey, model, prompt);
    case 'gemini':    return callGemini(apiKey, model, prompt);
    case 'groq':      return callGroq(apiKey, model, prompt);
    case 'custom':    return callCustom(apiKey, model, customEndpoint, prompt);
    default: throw new Error(`Unknown provider: ${provider}`);
  }
}

// ── Anthropic ─────────────────────────────────────────────────────────────────
async function callAnthropic(apiKey, model, prompt) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({ model, max_tokens: 2000, messages: [{ role: 'user', content: prompt }] }),
  });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(`Anthropic ${res.status}: ${data.error?.message || JSON.stringify(data)}`);
  const text = data?.content?.[0]?.text;
  if (!text) throw new Error('Empty Anthropic response');
  return text;
}

// ── OpenAI ────────────────────────────────────────────────────────────────────
async function callOpenAI(apiKey, model, prompt, baseURL = 'https://api.openai.com/v1') {
  const res = await fetch(`${baseURL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model, max_tokens: 2000, messages: [{ role: 'user', content: prompt }] }),
  });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(`OpenAI ${res.status}: ${data.error?.message || JSON.stringify(data)}`);
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty OpenAI response');
  return text;
}

// ── Google Gemini ─────────────────────────────────────────────────────────────
async function callGemini(apiKey, model, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 2000 },
    }),
  });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(`Gemini ${res.status}: ${data.error?.message || JSON.stringify(data)}`);
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty Gemini response');
  return text;
}

// ── Groq ──────────────────────────────────────────────────────────────────────
async function callGroq(apiKey, model, prompt) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model, max_tokens: 2000, messages: [{ role: 'user', content: prompt }] }),
  });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(`Groq ${res.status}: ${data.error?.message || JSON.stringify(data)}`);
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty Groq response');
  return text;
}

// ── Custom / OpenAI-compatible ────────────────────────────────────────────────
async function callCustom(apiKey, model, baseURL, prompt) {
  if (!baseURL) throw new Error('Custom endpoint URL is required');
  const base = baseURL.replace(/\/$/, '');
  const url = base.endsWith('/chat/completions') ? base : `${base}/chat/completions`;
  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ model, max_tokens: 2000, messages: [{ role: 'user', content: prompt }] }),
  });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(`Custom API ${res.status}: ${data.error?.message || JSON.stringify(data)}`);
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from custom endpoint');
  return text;
}
