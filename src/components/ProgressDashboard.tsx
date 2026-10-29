import React from 'react';
import {
  CheckCircle2,
  Award,
  BookOpen,
  Clock,
  Bookmark,
  TrendingUp,
  Play,
  RotateCcw,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { VideoLesson } from '../types';

interface ProgressDashboardProps {
  onSelectVideo: (video: VideoLesson) => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ onSelectVideo }) => {
  const { videos, userProgress, userNotes, bookmarks } = useData();
  const { userProfile } = useAuth();

  const totalVideos = videos.length;
  const progressList = Object.values(userProgress);
  const completedVideosCount = progressList.filter((p) => p.completed).length;
  const completedQuizzesCount = progressList.filter((p) => p.quizCompleted).length;

  const totalScores = progressList.reduce((acc, curr) => acc + (curr.quizScore || 0), 0);
  const averageScore = completedQuizzesCount > 0 ? Math.round(totalScores / completedQuizzesCount) : 0;

  const completionPercentage = totalVideos > 0 ? Math.round((completedVideosCount / totalVideos) * 100) : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
              Laporan Hasil Belajar Istima'
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              Ahlan wa Sahlan, {userProfile?.displayName || 'Santri'}!
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-xl">
              Terus latih pendengaran Anda terhadap kosa kata, intonasi, dan kaidah bahasa Arab melalui kumpulan video animasi interaktif.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center shrink-0">
            <p className="text-xs text-emerald-200">Kelulusan Materi</p>
            <p className="text-3xl font-black text-white mt-0.5">{completionPercentage}%</p>
            <p className="text-[11px] text-emerald-300/80">
              {completedVideosCount} dari {totalVideos} Video
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Video Disimak</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">
              {completedVideosCount} <span className="text-xs text-slate-400 font-normal">/ {totalVideos}</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Rata-rata Kuis</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">
              {averageScore}% <span className="text-xs text-slate-400 font-normal">({completedQuizzesCount} kuis)</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Catatan Istima'</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">
              {userNotes.length} <span className="text-xs text-slate-400 font-normal">catatan</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Tersimpan Favorit</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">
              {bookmarks.length} <span className="text-xs text-slate-400 font-normal">video</span>
            </p>
          </div>
        </div>
      </div>

      {/* Video Progress List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-slate-900">
          Status Per Video Pembelajaran
        </h2>

        <div className="space-y-3">
          {videos.map((v) => {
            const prog = userProgress[v.id];
            const isCompleted = prog?.completed || false;
            const hasQuiz = prog?.quizCompleted || false;

            return (
              <div
                key={v.id}
                className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-emerald-50/30 transition group"
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isCompleted ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition">
                      {v.title}
                    </h3>
                    <p className="font-arabic text-emerald-900 text-xs font-semibold mt-0.5">
                      {v.titleArabic}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700">{v.category}</span>
                      <span>•</span>
                      <span>{v.level}</span>
                      <span>•</span>
                      <span>{v.duration}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  {hasQuiz ? (
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Skor Kuis</span>
                      <p className="text-sm font-bold text-emerald-700">{prog?.quizScore}%</p>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">Belum Kuis</span>
                  )}

                  <button
                    onClick={() => onSelectVideo(v)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>{isCompleted ? 'Simak Lagi' : 'Mulai Menyimak'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
