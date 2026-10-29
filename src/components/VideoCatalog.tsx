import React, { useState } from 'react';
import {
  Play,
  CheckCircle2,
  Bookmark,
  Clock,
  Sparkles,
  Filter,
} from 'lucide-react';
import { VideoLesson } from '../types';
import { useData } from '../context/DataContext';

interface VideoCatalogProps {
  videos: VideoLesson[];
  activeVideo: VideoLesson | null;
  onSelectVideo: (video: VideoLesson) => void;
  searchQuery: string;
}

export const VideoCatalog: React.FC<VideoCatalogProps> = ({
  videos,
  activeVideo,
  onSelectVideo,
  searchQuery,
}) => {
  const { userProgress, isBookmarked, toggleBookmark } = useData();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  const categories = [
    'all',
    'Percakapan Sehari-hari',
    'Pendidikan & Sekolah',
    'Aktivitas Sehari-hari',
    'Keluarga & Rumah',
    'Cita-cita & Profesi',
  ];

  const levels = [
    'all',
    "Pemula (Mubtadi')",
    "Menengah (Mutawassith)",
    "Lanjutan (Mutaqaddim)",
  ];

  const filtered = videos.filter((v) => {
    const matchesSearch =
      !searchQuery ||
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.titleArabic.includes(searchQuery) ||
      v.titleIndo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || v.category === selectedCategory;

    const matchesLevel =
      selectedLevel === 'all' || v.level === selectedLevel;

    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Kategori Tema:
            </span>
          </div>

          {/* Level Filter */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <span className="text-xs text-slate-500 font-medium">Tingkat:</span>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">Semua Tingkat</option>
              {levels.slice(1).map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Scrollable Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 px-3 py-1.5 rounded-xl font-medium transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
              }`}
            >
              {cat === 'all' ? 'Semua Topik' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Video Cards Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500">
          <p className="text-sm font-semibold">Tidak ada video yang cocok dengan pencarian.</p>
          <p className="text-xs text-slate-400 mt-1">Coba ubah kata kunci atau filter kategori.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((video) => {
            const isActive = activeVideo?.id === video.id;
            const progress = userProgress[video.id];
            const isCompleted = progress?.completed;
            const bookmarked = isBookmarked(video.id);

            return (
              <div
                key={video.id}
                onClick={() => onSelectVideo(video)}
                className={`group bg-white rounded-3xl border overflow-hidden shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'border-slate-200/90 hover:border-emerald-300'
                }`}
              >
                <div>
                  {/* Thumbnail Container */}
                  <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

                    {/* Duration badge */}
                    <span className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-xs text-white text-[11px] font-mono px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{video.duration}</span>
                    </span>

                    {/* Bookmark Toggle */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(video.id);
                      }}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-xs transition"
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-emerald-600/90 text-white flex items-center justify-center shadow-lg shadow-emerald-600/40 group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                    </div>

                    {/* Completed Ribbon */}
                    {isCompleted && (
                      <div className="absolute top-2.5 left-2.5 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Selesai</span>
                      </div>
                    )}
                  </div>

                  {/* Metadata & Title */}
                  <div className="p-4 sm:p-5 space-y-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {video.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {video.level}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-emerald-800 transition line-clamp-2">
                      {video.titleIndo || video.title}
                    </h3>

                    <p className="font-arabic text-emerald-900 text-sm font-bold text-right line-clamp-1">
                      {video.titleArabic}
                    </p>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {video.description}
                    </p>
                  </div>
                </div>

                {/* Footer Features summary */}
                <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{video.dialogueScript?.length || 0} Baris Dialog</span>
                  <span>•</span>
                  <span>{video.vocabulary?.length || 0} Mufradat</span>
                  <span>•</span>
                  <span>{video.quiz?.length || 0} Soal Kuis</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
