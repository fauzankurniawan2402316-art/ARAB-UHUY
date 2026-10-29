export function getYoutubeEmbedUrl(url: string): string {
  if (!url) return '';
  
  // If already embed URL
  if (url.includes('youtube.com/embed/')) {
    return url;
  }

  // Handle standard watch?v= format
  const watchMatch = url.match(/[?&]v=([^&#]+)/);
  if (watchMatch && watchMatch[1]) {
    return `https://www.youtube-nocookie.com/embed/${watchMatch[1]}?rel=0&modestbranding=1`;
  }

  // Handle youtu.be/ format
  const shortMatch = url.match(/youtu\.be\/([^?&#]+)/);
  if (shortMatch && shortMatch[1]) {
    return `https://www.youtube-nocookie.com/embed/${shortMatch[1]}?rel=0&modestbranding=1`;
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
