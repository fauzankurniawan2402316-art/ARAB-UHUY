export interface DialogueLine {
  id: string;
  speaker: string;
  arabic: string;
  translation: string;
  timestamp: string; // e.g. "00:15"
  seconds?: number;
}

export interface VocabularyItem {
  id: string;
  arabic: string;
  transliteration: string;
  indonesian: string;
  wordType: 'Isim' | 'Fi\'il' | 'Harf';
  exampleSentence?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface VideoLesson {
  id: string;
  title: string;
  titleArabic: string;
  titleIndo: string;
  description: string;
  category: string;
  level: 'Pemula (Mubtadi\')' | 'Menengah (Mutawassith)' | 'Lanjutan (Mutaqaddim)';
  youtubeUrl: string;
  duration: string;
  thumbnailUrl: string;
  dialogueScript: DialogueLine[];
  vocabulary: VocabularyItem[];
  quiz: QuizQuestion[];
  createdAt: string;
  viewsCount?: number;
}

export interface UserProgress {
  videoId: string;
  completed: boolean;
  quizCompleted: boolean;
  quizScore: number;
  totalQuestions: number;
  lastWatchedSeconds: number;
  updatedAt: string;
}

export interface UserNote {
  id: string;
  videoId: string;
  videoTitle: string;
  timestampSeconds?: number;
  timestampText?: string;
  content: string;
  createdAt: string;
}

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'student' | 'admin';
  createdAt: string;
  lastLoginAt: string;
  isAdminAccount?: boolean;
}
