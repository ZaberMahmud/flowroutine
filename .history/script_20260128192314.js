const inputText = document.getElementById('inputText');
const summarizeBtn = document.getElementById('summarizeBtn');
const summaryEl = document.getElementById('summary');
const historyList = document.getElementById('historyList');
const themeSelector = document.getElementById('themeSelector');

async function summarizeText(text) {
  summaryEl.textContent = '⏳ summarizing...';

  try {
    // use a free summarization api (no key required)
    const res = await fetch('https://api.smmry.com/&SM_API_INPUT=' + encodeURIComponent(text));
    const data = await res.text();

    // smmry api returns plain text summary
    const summary = data || '⚠️ could not summarize this text.';
    summaryEl.textContent = summary;

    saveHistory(text, summary);
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

// theme
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
