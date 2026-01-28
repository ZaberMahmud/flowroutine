const inputText = document.getElementById('inputText');
const summarizeBtn = document.getElementById('summarizeBtn');
const summaryEl = document.getElementById('summary');
const historyList = document.getElementById('historyList');
const themeSelector = document.getElementById('themeSelector');

/**
 * Summarize the input text using a free public API
 */
async function summarizeText(text) {
  summaryEl.textContent = '⏳ summarizing...';

  try {
    // ------------------------------
    // OPTION 1: Free browser-friendly summarizer API
    // ------------------------------
    const res = await fetch("https://api.summarizepaper.com/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    const summary = data.summary || '⚠️ could not summarize this text.';
    summaryEl.textContent = summary;

    saveHistory(text, summary);

    // ------------------------------
    // OPTION 2: OpenAI summarizer (for later, requires API key & vercel serverless function)
    // ------------------------------
    // const res = await fetch("/api/summarize", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ text }),
    // });
    // const data = await res.json();
    // summaryEl.textContent = data.summary;
    // saveHistory(text, data.summary);

  } catch (err) {
    summaryEl.textContent = '❌ error fetching summary.';
    console.error(err);
  }
}

summarizeBtn.addEventListener('click', () => {
  const text = inputText.value.trim();
  if (!text) return;
  summarizeText(text);
});

function saveHistory(original, summary) {
  const histories = JSON.parse(localStorage.getItem('summaries')) || [];
  histories.unshift({ original, summary });
  localStorage.setItem('summaries', JSON.stringify(histories.slice(0, 5))); // keep last 5
  renderHistory();
}

function renderHistory() {
  const histories = JSON.parse(localStorage.getItem('summaries')) || [];
  historyList.innerHTML = '';
  histories.forEach((h) => {
    const li = document.createElement('li');
    li.textContent = h.original.slice(0, 60) + '...';
    li.onclick = () => (summaryEl.textContent = h.summary);
    historyList.appendChild(li);
  });
}

// theme switching
themeSelector.addEventListener('change', (e) => {
  const theme = e.target.value;
  document.body.className = theme;
  localStorage.setItem('theme', theme);
});

function loadTheme() {
  const theme = localStorage.getItem('theme') || 'dark';
  document.body.className = theme;
  themeSelector.value = theme;
}

loadTheme();
renderHistory();
