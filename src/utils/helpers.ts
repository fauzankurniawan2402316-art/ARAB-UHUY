/**
 * Robustly extracts the 11-character YouTube video ID from various URL formats
 * (watch?v=, youtu.be/, embed/, shorts/, live/, or raw ID).
 */
export function extractYoutubeVideoId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // If already a clean 11-character ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Regex covering standard YouTube URL variations
  const regExp = /(?:youtube(?:-nocookie)?\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = trimmed.match(regExp);
  if (match && match[1]) {
    return match[1];
  }

  // Fallback query parameter check
  const queryParamMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (queryParamMatch && queryParamMatch[1]) {
    return queryParamMatch[1];
  }

  return null;
}

/**
 * Converts any YouTube URL automatically to the standard embed format:
 * https://www.youtube.com/embed/VIDEO_ID
 */
export function getYoutubeEmbedUrl(url: string): string {
  if (!url) return '';
  const videoId = extractYoutubeVideoId(url);
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return url;
}

export function playArabicSpeech(text: string, rate: number = 0.9): Promise<void> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      resolve();
      return;
    }

    window.speechSynthesis.cancel();

    // Clean brackets or punctuation for clearer speech
    const cleanText = text.replace(/[\(\)\[\]\{\}]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ar-SA';
    utterance.rate = rate; // Slightly slower for clear istima' learning

    // Pick best Arabic voice if available
    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find((v) => v.lang.startsWith('ar') || v.lang.includes('Arabic'));
    if (arabicVoice) {
      utterance.voice = arabicVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    window.speechSynthesis.speak(utterance);
  });
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
