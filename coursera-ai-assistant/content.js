// content.js — Coursera, Google Forms, Microsoft Forms

let answerData = [];

// ── Detect platform ───────────────────────────────────────────────────────────
function getPlatform() {
  const h = location.hostname;
  if (h.includes('coursera.org')) return 'coursera';
  if (h.includes('google.com'))   return 'google';
  if (h.includes('forms.office.com') || h.includes('forms.microsoft.com')) return 'microsoft';
  return 'unknown';
}

// ── Inject CSS ────────────────────────────────────────────────────────────────
function injectCSS() {
  if (document.getElementById('cai-style')) return;
  const s = document.createElement('style');
  s.id = 'cai-style';
  s.textContent = `
    /* Coursera */
    .rc-Option.cai-answer {
      outline: 2.5px solid #6af7a0 !important;
      border-radius: 8px !important;
      background: rgba(106,247,160,0.08) !important;
    }
    /* Google Forms */
    .cai-gf-answer {
      outline: 2.5px solid #6af7a0 !important;
      border-radius: 8px !important;
      background: rgba(106,247,160,0.08) !important;
    }
    /* Microsoft Forms */
    .cai-ms-answer {
      outline: 2.5px solid #6af7a0 !important;
      border-radius: 4px !important;
      background: rgba(106,247,160,0.08) !important;
    }
    .cai-badge {
      display: inline-block !important;
      background: #6af7a0 !important;
      color: #0a0a0f !important;
      font-size: 9px !important;
      font-weight: 800 !important;
      padding: 1px 6px !important;
      border-radius: 10px !important;
      margin-left: 8px !important;
      pointer-events: none !important;
      vertical-align: middle !important;
      font-family: monospace !important;
    }
  `;
  document.head.appendChild(s);
}

// ── Messages ──────────────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'TOGGLE_HIGHLIGHT') {
    document.getElementById('cai-panel') ? removeAll() : injectPanel();
  }
  if (msg.type === 'AI_ANSWERS') {
    processAnswers(msg.text, msg.questions);
  }
});

// ── Floating panel ────────────────────────────────────────────────────────────
function injectPanel(html) {
  if (document.getElementById('cai-panel')) {
    if (html) document.getElementById('caiBody').innerHTML = html;
    return;
  }
  const panel = document.createElement('div');
  panel.id = 'cai-panel';
  panel.innerHTML = `
    <div class="cai-header">
      <span>🎓 Quiz AI</span>
      <button class="cai-close" id="caiClose">✕</button>
    </div>
    <div class="cai-body" id="caiBody">
      ${html || '<p style="color:#8888aa;font-size:12px">Solve with AI in the popup to see answers here.</p>'}
    </div>
  `;
  document.body.appendChild(panel);
  document.getElementById('caiClose').addEventListener('click', removeAll);
  makeDraggable(panel);
}

function removeAll() {
  document.querySelectorAll('.cai-answer, .cai-gf-answer, .cai-ms-answer').forEach(el => {
    el.classList.remove('cai-answer', 'cai-gf-answer', 'cai-ms-answer');
  });
  document.querySelectorAll('.cai-badge').forEach(el => el.remove());
  answerData = [];
  document.getElementById('cai-panel')?.remove();
}

// ── Process AI response ───────────────────────────────────────────────────────
function processAnswers(aiText, questions) {
  injectCSS();
  const matches = [...aiText.matchAll(/Answer:\s*([A-D])/gi)];

  let html = '<div style="font-size:12px;line-height:1.9">';
  if (matches.length) {
    html += `<div style="color:#7c6af7;font-weight:bold;margin-bottom:6px">✓ ${matches.length} answer(s) found</div>`;
    matches.forEach((m, i) => {
      html += `<div>Q${i+1}: <span style="color:#6af7a0;font-weight:bold;background:rgba(106,247,160,0.15);padding:1px 6px;border-radius:4px">${m[1].toUpperCase()}</span></div>`;
    });
    html += '<hr style="border-color:#1e1e2e;margin:8px 0">';
  }
  html += aiText
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/Answer:\s*([A-D])\b/gi, '<span style="color:#6af7a0;font-weight:bold">Answer: $1</span>')
    .replace(/\n/g, '<br>');
  html += '</div>';

  injectPanel(html);
  if (matches.length) clickAndHighlight(matches, questions);
}

// ── Click + highlight based on platform ──────────────────────────────────────
function clickAndHighlight(matches, questions) {
  const platform = getPlatform();

  if (platform === 'coursera') handleCoursera(matches);
  else if (platform === 'google') handleGoogleForms(matches, questions);
  else if (platform === 'microsoft') handleMicrosoftForms(matches, questions);
}

// ── COURSERA ──────────────────────────────────────────────────────────────────
function handleCoursera(matches) {
  const allInputs = [...document.querySelectorAll('input[name^="autoGradableResponseId"]')];
  const groups = new Map();
  allInputs.forEach(inp => {
    if (!groups.has(inp.name)) groups.set(inp.name, []);
    groups.get(inp.name).push(inp);
  });
  const groupList = [...groups.values()];

  answerData = [];
  groupList.forEach((inputs, qIndex) => {
    const match = matches[qIndex];
    if (!match) return;
    const idx = match[1].toUpperCase().charCodeAt(0) - 65;
    const inp = inputs[idx];
    if (!inp) return;
    inp.closest('label')?.click();
    answerData.push({ platform: 'coursera', inputId: inp.id });
  });

  [50, 150, 300, 600, 1000].forEach(ms => setTimeout(applyHighlights, ms));
  const obs = new MutationObserver(applyHighlights);
  obs.observe(document.body, { childList: true, subtree: true, attributeFilter: ['class'] });
  setTimeout(() => obs.disconnect(), 5000);
}

// ── GOOGLE FORMS ──────────────────────────────────────────────────────────────
function handleGoogleForms(matches, questions) {
  const items = [...document.querySelectorAll('[role="listitem"].Qr7Oae')];

  answerData = [];
  items.forEach((item, qIndex) => {
    const match = matches[qIndex];
    if (!match) return;
    const idx = match[1].toUpperCase().charCodeAt(0) - 65;

    const optionEls = [...item.querySelectorAll('[role="radio"], [role="checkbox"]')];
    const target = optionEls[idx];
    if (!target) return;

    // Click the option
    target.click();
    target.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    answerData.push({ platform: 'google', el: target });

    // Highlight immediately + re-apply
    highlightGoogleOption(target);
  });

  [100, 300, 600].forEach(ms => setTimeout(() => {
    answerData.filter(d => d.platform === 'google').forEach(d => highlightGoogleOption(d.el));
  }, ms));
}

function highlightGoogleOption(el) {
  if (!el) return;
  // Highlight the container div (parent of role=radio)
  const container = el.closest('.nWQGrd') || el.closest('[data-value]') || el.parentElement;
  if (container && !container.classList.contains('cai-gf-answer')) {
    container.classList.add('cai-gf-answer');
  }
  el.classList.add('cai-gf-answer');
  if (!el.querySelector('.cai-badge')) {
    const badge = document.createElement('span');
    badge.className = 'cai-badge';
    badge.textContent = '✓ AI';
    el.appendChild(badge);
  }
}

// ── MICROSOFT FORMS ───────────────────────────────────────────────────────────
function handleMicrosoftForms(matches, questions) {
  const items = [...document.querySelectorAll('[data-automation-id="questionItem"]')];

  answerData = [];
  items.forEach((item, qIndex) => {
    const match = matches[qIndex];
    if (!match) return;
    const idx = match[1].toUpperCase().charCodeAt(0) - 65;

    const choiceItems = [...item.querySelectorAll('[data-automation-id="choiceItem"]')];
    const target = choiceItems[idx];
    if (!target) return;

    // MS Forms has real <input role="radio"> inside — click the label
    const input = target.querySelector('input[role="radio"], input[role="checkbox"], input[type="radio"], input[type="checkbox"]');
    const label = target.querySelector('label') || target;

    label.click();
    if (input && !input.checked) {
      input.click();
      input.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    answerData.push({ platform: 'microsoft', el: target });
    highlightMsOption(target);
  });

  [100, 300, 600].forEach(ms => setTimeout(() => {
    answerData.filter(d => d.platform === 'microsoft').forEach(d => highlightMsOption(d.el));
  }, ms));
}

function highlightMsOption(el) {
  if (!el) return;
  if (!el.classList.contains('cai-ms-answer')) el.classList.add('cai-ms-answer');
  const label = el.querySelector('label') || el;
  if (!label.querySelector('.cai-badge')) {
    const badge = document.createElement('span');
    badge.className = 'cai-badge';
    badge.textContent = '✓ AI';
    label.appendChild(badge);
  }
}

// ── Apply Coursera highlights (after React re-render) ─────────────────────────
function applyHighlights() {
  answerData.filter(d => d.platform === 'coursera').forEach(({ inputId }) => {
    const inp = document.getElementById(inputId);
    if (!inp) return;
    const rcOption = inp.closest('.rc-Option');
    if (rcOption && !rcOption.classList.contains('cai-answer')) rcOption.classList.add('cai-answer');
    const label = inp.closest('label');
    if (label && !label.querySelector('.cai-badge')) {
      const badge = document.createElement('span');
      badge.className = 'cai-badge';
      badge.textContent = '✓ AI';
      label.appendChild(badge);
    }
  });
}

// ── Draggable ─────────────────────────────────────────────────────────────────
function makeDraggable(el) {
  const header = el.querySelector('.cai-header');
  let x = 0, y = 0;
  header.onmousedown = e => {
    e.preventDefault();
    x = e.clientX; y = e.clientY;
    document.onmousemove = e => {
      el.style.left = (el.offsetLeft + e.clientX - x) + 'px';
      el.style.top  = (el.offsetTop  + e.clientY - y) + 'px';
      el.style.right = 'auto';
      x = e.clientX; y = e.clientY;
    };
    document.onmouseup = () => { document.onmousemove = null; document.onmouseup = null; };
  };
}
