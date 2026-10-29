import React, { useState } from 'react';
import {
  Volume2,
  Eye,
  EyeOff,
  Sparkles,
  Clock,
  Check,
  MessageSquare,
} from 'lucide-react';
import { DialogueLine } from '../types';
import { playArabicSpeech } from '../utils/helpers';

interface InteractiveTranscriptProps {
  dialogueScript: DialogueLine[];
  videoTitle: string;
  onAnalyzeSentence: (sentence: string) => void;
  onAddNoteAtTimestamp: (seconds?: number, text?: string) => void;
}

export const InteractiveTranscript: React.FC<InteractiveTranscriptProps> = ({
  dialogueScript,
  videoTitle,
  onAnalyzeSentence,
  onAddNoteAtTimestamp,
}) => {
  const [showTranslations, setShowTranslations] = useState<boolean>(true);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const handlePlayAudio = async (line: DialogueLine) => {
    setPlayingId(line.id);
    try {
      await playArabicSpeech(line.arabic);
    } finally {
      setPlayingId(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-arabic text-lg font-bold text-emerald-800">النَّصُّ الْحِوَارِيُّ</span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Transkrip Percakapan Dwibahasa
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Dengarkan dialog kalimat per kalimat. Klik tombol audio untuk melatih pelafalan makhraj huruf.
          </p>
        </div>

        {/* Translation Toggle for Istima' Test Mode */}
        <button
          onClick={() => setShowTranslations(!showTranslations)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto ${
            showTranslations
              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              : 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
          }`}
          title="Sembunyikan terjemahan untuk menguji apakah Anda memahami dari pendengaran murni"
        >
          {showTranslations ? (
            <>
              <EyeOff className="w-3.5 h-3.5 text-slate-500" />
              <span>Mode Uji Istima' (Sembunyikan Arti)</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5 text-amber-700" />
              <span>Tampilkan Kembali Terjemahan</span>
            </>
          )}
        </button>
      </div>

      {/* Transcript List */}
      <div className="space-y-3.5 divide-y divide-slate-100">
        {dialogueScript.map((line, index) => {
          const isPlaying = playingId === line.id;
          return (
            <div
              key={line.id}
              className={`pt-3.5 first:pt-0 group transition rounded-2xl p-3 hover:bg-emerald-50/40 border border-transparent hover:border-emerald-100`}
            >
              <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                {/* Speaker pill & timestamp */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-100 to-teal-100 border border-emerald-200 text-emerald-800 flex items-center justify-center font-arabic font-bold text-sm shrink-0">
                    {line.speaker.charAt(0)}
                  </div>
                  <div>
                    <span className="font-arabic font-bold text-sm text-emerald-900 block leading-tight">
                      {line.speaker}
                    </span>
                    <button
                      onClick={() => onAddNoteAtTimestamp(line.seconds, line.timestamp)}
                      className="text-[11px] text-slate-400 hover:text-emerald-700 font-mono flex items-center gap-1 transition"
                      title="Klik untuk membuat catatan di timestamp ini"
                    >
                      <Clock className="w-3 h-3" />
                      <span>{line.timestamp}</span>
                    </button>
                  </div>
                </div>

                {/* Actions: Play Speech & AI Sentence Breakdown */}
                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  <button
                    onClick={() => handlePlayAudio(line)}
                    disabled={isPlaying}
                    title="Dengarkan pengucapan fasih kalimat ini"
                    className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                      isPlaying
                        ? 'bg-emerald-600 text-white animate-pulse'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span className="text-[11px]">{isPlaying ? 'Memutar...' : 'Lafalkan'}</span>
                  </button>

                  <button
                    onClick={() => onAnalyzeSentence(line.arabic)}
                    title="Analisis tata bahasa (Nahwu/Shorof) & tips mendengar dengan AI"
                    className="p-2 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 flex items-center gap-1 transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="text-[11px] hidden sm:inline">Bedah AI</span>
                  </button>
                </div>
              </div>

              {/* Arabic Dialogue Text (Prominent with Harakat) */}
              <div className="mt-2.5 text-right font-arabic text-xl sm:text-2xl font-bold text-slate-800 leading-loose selection:bg-emerald-200">
                {line.arabic}
              </div>

              {/* Indonesian Translation (Toggleable) */}
              {showTranslations ? (
                <div className="mt-2 text-xs sm:text-sm text-slate-600 bg-slate-50/80 rounded-xl px-3.5 py-2 border border-slate-100">
                  <span className="font-semibold text-slate-500 text-[11px] uppercase mr-1.5">Artinya:</span>
                  {line.translation}
                </div>
              ) : (
                <div className="mt-2 text-[11px] text-amber-700 bg-amber-50 rounded-xl px-3 py-1.5 border border-amber-200 italic flex items-center gap-2">
                  <span>🔒 Mode Uji Istima' aktif. Tebak maknanya sebelum menyalakan terjemahan.</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
