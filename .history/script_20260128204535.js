const inputText = document.getElementById('inputText');
const summarizeBtn = document.getElementById('summarizeBtn');
const summaryEl = document.getElementById('summary');
const historyList = document.getElementById('historyList');
const themeSelector = document.getElementById('themeSelector');

async function summarizeText(text) {
  summaryEl.textContent = '⏳ summarizing...';
  
  // Simulate API delay for better UX
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const summary = generateSmartSummary(text);
  summaryEl.textContent = summary;
  saveHistory(text, summary);
}

function generateSmartSummary(text) {
  const cleanText = text.replace(/\s+/g, ' ').trim();
  const wordCount = cleanText.split(/\s+/).length;
  
  // For very short text, return as is
  if (wordCount < 30) return cleanText;
  
  // Split into paragraphs
  const paragraphs = cleanText.split(/\n+/).filter(p => p.trim().length > 0);
  
  // If it's already a short paragraph, return truncated version
  if (paragraphs.length === 1) {
    return cleanText.substring(0, 250) + (cleanText.length > 250 ? '...' : '');
  }
  
  // For multiple paragraphs, take key sentences
  const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText];
  
  if (sentences.length <= 3) {
    return cleanText;
  }
  
  // Extract key sentences (first, important middle, last)
  let keySentences = [];
  
  // Always include first sentence
  if (sentences[0]) keySentences.push(sentences[0]);
  
  // Include a middle sentence
  if (sentences.length >= 5) {
    const middleIdx = Math.floor(sentences.length / 2);
    keySentences.push(sentences[middleIdx]);
  }
  
  // Include last sentence if meaningful
  const lastSentence = sentences[sentences.length - 1];
  if (lastSentence.split(' ').length > 4) {
    keySentences.push(lastSentence);
  }
  
  const summary = keySentences.join(' ');
  return summary.substring(0, 300) + (summary.length > 300 ? '...' : '');
}

summarizeBtn.addEventListener('click', () => {
  const text = inputText.value.trim();
  if (!text) {
    summaryEl.textContent = '⚠️ Please enter some text to summarize.';
    return;
  }
  if (text.length < 20) {
    summaryEl.textContent = '⚠️ Text is too short to summarize.';
    return;
  }
  summarizeText(text);
});

function saveHistory(original, summary) {
  const histories = JSON.parse(localStorage.getItem('summaries')) || [];
  histories.unshift({ 
    original: original.substring(0, 100), 
    summary: summary.substring(0, 150) 
  });
  localStorage.setItem('summaries', JSON.stringify(histories.slice(0, 5)));
  renderHistory();
}

function renderHistory() {
  const histories = JSON.parse(localStorage.getItem('summaries')) || [];
  historyList.innerHTML = '';
  histories.forEach((h) => {
    const li = document.createElement('li');
    li.textContent = h.original + (h.original.length >= 100 ? '...' : '');
    li.title = 'Click to view summary';
    li.onclick = () => {
      summaryEl.textContent = h.summary + (h.summary.length >= 150 ? '...' : '');
      inputText.value = h.original + (h.original.length >= 100 ? '...' : '');
    };
    historyList.appendChild(li);
  });
}

// Theme switching
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

// Add Enter key support
inputText.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    summarizeBtn.click();
  }
});