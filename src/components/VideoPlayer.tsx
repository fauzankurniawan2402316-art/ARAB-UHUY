import React, { useState } from 'react';
import {
  Play,
  CheckCircle,
  Bookmark,
  Volume2,
  Clock,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Edit3,
} from 'lucide-react';
import { VideoLesson, UserProgress } from '../types';
import { getYoutubeEmbedUrl } from '../utils/helpers';
import { useData } from '../context/DataContext';

interface VideoPlayerProps {
  video: VideoLesson;
  onOpenNoteModal: (timestampSeconds?: number, timestampText?: string) => void;
  onOpenAiTutor: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  onOpenNoteModal,
  onOpenAiTutor,
}) => {
  const { userProgress, saveProgress, isBookmarked, toggleBookmark } = useData();
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isSaving, setIsSaving] = useState(false);

  const progress = userProgress[video.id] as UserProgress | undefined;
  const isCompleted = progress?.completed || false;
  const bookmarked = isBookmarked(video.id);

  const handleToggleCompleted = async () => {
    setIsSaving(true);
    try {
      await saveProgress(
        video.id,
        !isCompleted,
        progress?.quizCompleted || false,
        progress?.quizScore || 0,
        video.quiz.length,
        progress?.lastWatchedSeconds || 0
      );
    } finally {
      setIsSaving(false);
    }
  };

  const embedUrl = getYoutubeEmbedUrl(video.youtubeUrl);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Video Viewport */}
      <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={video.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
            <Play className="w-16 h-16 text-emerald-500 mb-3" />
            <p className="text-sm font-medium">Video player siap diputar</p>
          </div>
        )}
      </div>

      {/* Control & Action Bar */}
      <div className="p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {video.category}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                {video.level}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {video.duration}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {video.title}
            </h1>
            <p className="font-arabic text-emerald-800 text-lg sm:text-xl font-bold mt-1 text-right sm:text-left">
              {video.titleArabic}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
            <button
              onClick={() => toggleBookmark(video.id)}
              title={bookmarked ? 'Hapus dari favorit' : 'Simpan favorit'}
              className={`p-2.5 rounded-xl border transition cursor-pointer ${
                bookmarked
                  ? 'bg-amber-50 text-amber-700 border-amber-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>

            <button
              onClick={handleToggleCompleted}
              disabled={isSaving}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition cursor-pointer ${
                isCompleted
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle className={`w-4 h-4 ${isCompleted ? 'fill-white text-emerald-600' : 'text-emerald-700'}`} />
              <span>{isCompleted ? 'Selesai Disimak' : 'Tandai Selesai'}</span>
            </button>

            <button
              onClick={() => onOpenNoteModal()}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-slate-500" />
              <span>Catat</span>
            </button>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {video.description}
        </p>

        {/* Listening Training Mode Bar */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold text-slate-700">Tips Latihan Istima':</span>
            <span className="text-slate-500 hidden md:inline">
              Dengarkan minimal 2 kali: putaran pertama tanpa teks terjemahan, putaran kedua cek pemahaman dengan transkrip.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAiTutor}
              className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Tanya Ustadz AI</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
