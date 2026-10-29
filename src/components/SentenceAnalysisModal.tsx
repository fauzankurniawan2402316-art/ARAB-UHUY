import React, { useEffect, useState } from 'react';
import { X, Sparkles, Volume2, BookOpen, CheckCircle, Lightbulb } from 'lucide-react';
import { playArabicSpeech } from '../utils/helpers';

interface WordBreakdown {
  word: string;
  root?: string;
  wordType: string;
  meaning: string;
  listeningTip?: string;
}

interface SentenceAnalysis {
  arabicWithHarakat: string;
  transliteration?: string;
  indonesianTranslation: string;
  wordBreakdown?: WordBreakdown[];
  grammaticalStructure?: string;
  culturalContext?: string;
}

interface SentenceAnalysisModalProps {
  sentence: string | null;
  videoTitle: string;
  onClose: () => void;
}

export const SentenceAnalysisModal: React.FC<SentenceAnalysisModalProps> = ({
  sentence,
  videoTitle,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<SentenceAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!sentence) return;

    let isMounted = true;
    setLoading(true);
    setError(null);
    setAnalysis(null);

    fetch('/api/ai/analyze-sentence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sentence, videoTitle }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Gagal menganalisis kalimat.');
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setAnalysis(data.analysis);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err?.message || 'Terjadi kesalahan saat memproses bedah kalimat.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [sentence, videoTitle]);

  if (!sentence) return null;

  const handlePronounce = async () => {
    setIsPlaying(true);
    try {
      await playArabicSpeech(analysis?.arabicWithHarakat || sentence);
    } finally {
      setIsPlaying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 via-teal-50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Bedah Linguistik & Istima' (Gemini AI)
              </h3>
              <p className="text-xs text-slate-500 truncate max-w-xs sm:max-w-md">
                Analisis mendalam kalimat dari percakapan animasi
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
              <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-semibold text-slate-800">
                Ustadz AI sedang membedah kata dan kaidah kalimat...
              </p>
              <p className="text-xs text-slate-400">
                Memeriksa harakat, akar kata (tashrif), dan tips makhraj huruf istima'
              </p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          ) : analysis ? (
            <>
              {/* Highlight Arabic sentence */}
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4.5 text-right">
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={handlePronounce}
                    disabled={isPlaying}
                    className="p-1.5 px-2.5 rounded-lg text-xs font-semibold bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isPlaying ? 'Memutar...' : 'Dengarkan'}</span>
                  </button>
                  <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
                    Teks Arab Berharakat
                  </span>
                </div>

                <p className="font-arabic text-2xl sm:text-3xl font-bold text-emerald-950 leading-relaxed">
                  {analysis.arabicWithHarakat || sentence}
                </p>

                {analysis.transliteration && (
                  <p className="text-xs text-slate-500 italic font-mono mt-1 text-left">
                    {analysis.transliteration}
                  </p>
                )}

                <div className="mt-3 pt-3 border-t border-emerald-200/70 text-left">
                  <p className="text-xs font-semibold text-slate-500 uppercase">Arti Bahasa Indonesia:</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">
                    "{analysis.indonesianTranslation}"
                  </p>
                </div>
              </div>

              {/* Word by Word Breakdown */}
              {analysis.wordBreakdown && analysis.wordBreakdown.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <span>Rincian Kosakata (Mufradat) per Kata:</span>
                  </h4>

                  <div className="space-y-2.5">
                    {analysis.wordBreakdown.map((wb, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-arabic text-xl font-bold text-slate-900 min-w-[70px] text-right">
                            {wb.word}
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                {wb.wordType}
                              </span>
                              {wb.root && (
                                <span className="text-[10px] text-slate-400 font-mono">
                                  Asal: {wb.root}
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-semibold text-slate-700 mt-0.5">
                              {wb.meaning}
                            </p>
                          </div>
                        </div>

                        {wb.listeningTip && (
                          <div className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] text-slate-500 max-w-xs">
                            <span className="font-semibold text-teal-700">Fokus Dengar: </span>
                            {wb.listeningTip}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Grammatical Structure & Context */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {analysis.grammaticalStructure && (
                  <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-200 text-xs">
                    <p className="font-bold text-teal-900 flex items-center gap-1.5 mb-1">
                      <CheckCircle className="w-4 h-4 text-teal-600" />
                      <span>Kaidah Tata Bahasa (Nahwu):</span>
                    </p>
                    <p className="text-slate-700 leading-relaxed">
                      {analysis.grammaticalStructure}
                    </p>
                  </div>
                )}

                {analysis.culturalContext && (
                  <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs">
                    <p className="font-bold text-amber-900 flex items-center gap-1.5 mb-1">
                      <Lightbulb className="w-4 h-4 text-amber-600" />
                      <span>Konteks Penggunaan:</span>
                    </p>
                    <p className="text-slate-700 leading-relaxed">
                      {analysis.culturalContext}
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
