/**
 * Helper to extract YouTube Video ID from any standard link format:
 * - youtu.be/VIDEO_ID
 * - youtube.com/watch?v=VIDEO_ID
 * - youtube.com/embed/VIDEO_ID
 * - youtube-nocookie.com/embed/VIDEO_ID
 * - youtube.com/shorts/VIDEO_ID
 * - Raw 11-char ID
 */
export function extractYoutubeVideoId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // If already a clean 11-character video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Check youtu.be/ID format
  const youtuBeMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (youtuBeMatch && youtuBeMatch[1]) {
    return youtuBeMatch[1];
  }

  // Check watch?v=ID format
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch && watchMatch[1]) {
    return watchMatch[1];
  }

  // Check embed/ID format (youtube.com or youtube-nocookie.com)
  const embedMatch = trimmed.match(/(?:youtube(?:-nocookie)?\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (embedMatch && embedMatch[1]) {
    return embedMatch[1];
  }

  // General regex covering remaining paths (shorts/ID, v/ID, live/ID)
  const generalMatch = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|shorts|live)\/))([a-zA-Z0-9_-]{11})/);
  if (generalMatch && generalMatch[1]) {
    return generalMatch[1];
  }

  return null;
}

/**
 * Checks whether the URL is a direct video file (.mp4, .webm, .ogg)
 */
export function isDirectVideoUrl(url: string): boolean {
  if (!url) return false;
  const cleanUrl = url.trim().toLowerCase().split('?')[0];
  return cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.webm') || cleanUrl.endsWith('.ogg');
}

/**
 * Converts any YouTube URL to the privacy-enhanced embed domain:
 * https://www.youtube-nocookie.com/embed/VIDEO_ID
 */
export function getYoutubeEmbedUrl(url: string): string {
  if (!url) return '';
  const videoId = extractYoutubeVideoId(url);
  if (videoId) {
    return `https://www.youtube-nocookie.com/embed/${videoId}`;
  }
  return url;
}

/**
 * Returns standard YouTube watch URL for direct browser fallback
 */
export function getYoutubeWatchUrl(url: string): string {
  if (!url) return '';
  const videoId = extractYoutubeVideoId(url);
  if (videoId) {
    return `https://www.youtube.com/watch?v=${videoId}`;
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
