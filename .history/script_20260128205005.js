const inputText = document.getElementById('inputText');
const summarizeBtn = document.getElementById('summarizeBtn');
const summaryEl = document.getElementById('summary');
const historyList = document.getElementById('historyList');
const themeSelector = document.getElementById('themeSelector');

// ========================
// CONFIGURATION
// ========================
const GEMINI_API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your actual key
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

// ========================
// MAIN SUMMARIZATION FUNCTION
// ========================
async function summarizeText(text) {
  summaryEl.textContent = '⏳ Analyzing text with AI...';
  
  try {
    // First try Gemini AI
    const aiSummary = await summarizeWithGemini(text);
    
    if (aiSummary) {
      summaryEl.textContent = aiSummary;
      saveHistory(text, aiSummary);
    } else {
      // Fallback to local algorithm if AI fails
      summaryEl.textContent = '⚠️ AI service busy. Using local summary...';
      const localSummary = generateSmartFallback(text);
      summaryEl.textContent = localSummary;
      saveHistory(text, localSummary);
    }
    
  } catch (error) {
    console.error('Summarization error:', error);
    summaryEl.textContent = '❌ Error: ' + error.message + 
                           '\n\nUsing local summary instead...';
    const localSummary = generateSmartFallback(text);
    summaryEl.textContent = localSummary;
    saveHistory(text, localSummary);
  }
}

// ========================
// GEMINI AI SUMMARIZATION
// ========================
async function summarizeWithGemini(text) {
  // Truncate very long texts (Gemini has token limits)
  const truncatedText = text.length > 10000 ? text.substring(0, 10000) + '...' : text;
  
  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `Please provide a concise summary of the following text. Focus on the main points and key information. Return only the summary, no additional text.\n\nTEXT TO SUMMARIZE:\n${truncatedText}`
        }]
      }],
      generationConfig: {
        temperature: 0.3,
        topK: 1,
        topP: 1,
        maxOutputTokens: 500,
      }
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'API request failed');
  }
  
  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

// ========================
// FALLBACK ALGORITHM
// ========================
function generateSmartFallback(text) {
  const cleanText = text.replace(/\s+/g, ' ').trim();
  const paragraphs = cleanText.split(/\n+/).filter(p => p.trim().length > 20);
  
  if (paragraphs.length === 0) return 'No meaningful text to summarize.';
  if (paragraphs.length === 1) {
    return cleanText.length > 300 ? cleanText.substring(0, 300) + '...' : cleanText;
  }
  
  // Take first paragraph (introduction) and last paragraph (conclusion)
  const firstPara = paragraphs[0];
  const lastPara = paragraphs[paragraphs.length - 1];
  
  // Avoid duplication if first and last are similar
  if (paragraphs.length > 2 && firstPara !== lastPara) {
    return `${firstPara.substring(0, 150)}... ${lastPara.substring(0, 150)}...`;
  }
  
  return firstPara.substring(0, 300) + '...';
}

// ========================
// EVENT LISTENERS & UI
// ========================
summarizeBtn.addEventListener('click', () => {
  const text = inputText.value.trim();
  if (!text) {
    summaryEl.textContent = '⚠️ Please enter some text to summarize.';
    return;
  }
  if (text.length < 50) {
    summaryEl.textContent = '⚠️ Text is too short to summarize. Please enter at least 50 characters.';
    return;
  }
  if (text.length > 20000) {
    summaryEl.textContent = '⚠️ Text is too long. Maximum 20,000 characters.';
    return;
  }
  summarizeText(text);
});

// Enter key support
inputText.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    summarizeBtn.click();
  }
});

// ========================
// HISTORY FUNCTIONS
// ========================
function saveHistory(original, summary) {
  const histories = JSON.parse(localStorage.getItem('summaries')) || [];
  histories.unshift({ 
    original: original.substring(0, 80), 
    summary: summary.substring(0, 200),
    timestamp: new Date().toLocaleTimeString()
  });
  localStorage.setItem('summaries', JSON.stringify(histories.slice(0, 10)));
  renderHistory();
}

function renderHistory() {
  const histories = JSON.parse(localStorage.getItem('summaries')) || [];
  historyList.innerHTML = '';
  histories.forEach((h, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${h.original}${h.original.length >= 80 ? '...' : ''}</strong>
      <br><small>${h.timestamp}</small>
    `;
    li.title = 'Click to view summary';
    li.onclick = () => {
      summaryEl.textContent = h.summary + (h.summary.length >= 200 ? '...' : '');
      inputText.value = h.original + (h.original.length >= 80 ? '...' : '');
    };
    historyList.appendChild(li);
  });
}

// ========================
// THEME MANAGEMENT
// ========================
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

// Initialize
loadTheme();
renderHistory();

// Add loading indicator style
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0% { opacity: 0.6; }
    50% { opacity: 1; }
    100% { opacity: 0.6; }
  }
  .loading {
    animation: pulse 1.5s infinite;
    font-style: italic;
  }
`;
document.head.appendChild(style);