async function summarizeText(text) {
  summaryEl.textContent = '⏳ summarizing...';
  
  try {
    // Option A: TextAnalysis API (free, no key needed)
    const response = await fetch('https://api.text-analysis.ai/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        max_sentences: 3
      })
    });
    
    if (!response.ok) {
      throw new Error('API request failed');
    }
    
    const data = await response.json();
    const summary = data.summary || data.text || 'No summary generated.';
    summaryEl.textContent = summary;
    saveHistory(text, summary);
    
  } catch (err) {
    // If API fails, use a simple fallback algorithm
    summaryEl.textContent = '⚠️ API unavailable. Using basic summary...';
    const basicSummary = generateBasicSummary(text);
    summaryEl.textContent = basicSummary;
    saveHistory(text, basicSummary);
  }
}

// Fallback function if API fails
function generateBasicSummary(text) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const wordCount = text.split(/\s+/).length;
  
  // Simple algorithm: take first 2-3 sentences for long text, or truncate for short text
  if (wordCount > 100) {
    return sentences.slice(0, 3).join('. ') + '.';
  } else if (wordCount > 50) {
    return sentences.slice(0, 2).join('. ') + '.';
  } else {
    return text.substring(0, 150) + (text.length > 150 ? '...' : '');
  }
}