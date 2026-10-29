import React, { useState } from 'react';
import { Volume2, BookA, Filter } from 'lucide-react';
import { VocabularyItem } from '../types';
import { playArabicSpeech } from '../utils/helpers';

interface VocabularySectionProps {
  vocabulary: VocabularyItem[];
}

export const VocabularySection: React.FC<VocabularySectionProps> = ({ vocabulary }) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [playingId, setPlayingId] = useState<string | null>(null);

  const handlePronounce = async (item: VocabularyItem) => {
    setPlayingId(item.id);
    try {
      await playArabicSpeech(item.arabic);
    } finally {
      setPlayingId(null);
    }
  };

  const filteredItems = filterType === 'all'
    ? vocabulary
    : vocabulary.filter((v) => v.wordType === filterType);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-arabic text-lg font-bold text-emerald-800">الْمُفْرَدَاتُ الْهَامَّةُ</span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Mufradat & Kosakata Penting
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Kumpulan kosakata kunci yang diucapkan dalam animasi.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs self-start sm:self-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
              filterType === 'all' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Semua ({vocabulary.length})
          </button>
          <button
            onClick={() => setFilterType('Isim')}
            className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
              filterType === 'Isim' ? 'bg-emerald-600 text-white font-semibold shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Isim (Benda)
          </button>
          <button
            onClick={() => setFilterType("Fi'il")}
            className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
              filterType === "Fi'il" ? 'bg-teal-600 text-white font-semibold shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Fi'il (Kerja)
          </button>
          <button
            onClick={() => setFilterType('Harf')}
            className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
              filterType === 'Harf' ? 'bg-amber-600 text-white font-semibold shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Harf (Huruf)
          </button>
        </div>
      </div>

      {/* Vocabulary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredItems.map((item) => {
          const isPlaying = playingId === item.id;
          return (
            <div
              key={item.id}
              className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-4 flex flex-col justify-between hover:bg-emerald-50/30 hover:border-emerald-200 transition group"
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                    item.wordType === 'Isim'
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.wordType === "Fi'il"
                      ? 'bg-teal-100 text-teal-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {item.wordType}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePronounce(item)}
                    disabled={isPlaying}
                    title="Dengarkan pelafalan kata ini"
                    className={`p-1.5 rounded-lg border transition cursor-pointer ${
                      isPlaying
                        ? 'bg-emerald-600 text-white border-emerald-600 animate-pulse'
                        : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Arabic Word */}
              <div className="mt-2 text-right">
                <p className="font-arabic text-2xl font-bold text-slate-800 group-hover:text-emerald-900 transition-colors">
                  {item.arabic}
                </p>
                <p className="text-xs text-slate-400 italic font-mono mt-0.5">
                  {item.transliteration}
                </p>
              </div>

              {/* Indonesian Meaning */}
              <div className="mt-3 pt-2.5 border-t border-slate-200/70">
                <p className="text-xs font-semibold text-slate-800">
                  {item.indonesian}
                </p>
                {item.exampleSentence && (
                  <p className="font-arabic text-xs text-slate-600 mt-1 text-right">
                    مثال: {item.exampleSentence}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
