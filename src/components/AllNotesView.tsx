import React from 'react';
import { Bookmark, Clock, Trash2, ArrowUpRight, BookOpen } from 'lucide-react';
import { useData } from '../context/DataContext';
import { VideoLesson } from '../types';

interface AllNotesViewProps {
  onSelectVideo: (video: VideoLesson) => void;
}

export const AllNotesView: React.FC<AllNotesViewProps> = ({ onSelectVideo }) => {
  const { userNotes, deleteNote, videos } = useData();

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-arabic text-xl font-bold text-emerald-800">مُذَكِّرَاتِي الدِّرَاسِيَّةُ</span>
            <h1 className="text-xl font-bold text-slate-900">
              Koleksi Catatan Belajar Istima'
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Seluruh catatan pribadi, dikte kata baru, dan pengamatan mendengar tersimpan aman di cloud.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-semibold self-start sm:self-auto">
          {userNotes.length} Catatan Tersimpan
        </div>
      </div>

      {/* Notes Grid */}
      {userNotes.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">Belum Ada Catatan Belajar</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Saat Anda menyimak video animasi percakapan, gunakan tombol "Catat" untuk mencatat kosakata baru atau aturan makhraj huruf yang Anda dengar.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userNotes.map((note) => {
            const linkedVideo = videos.find((v) => v.id === note.videoId);

            return (
              <div
                key={note.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:border-emerald-300 transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition line-clamp-1">
                        {note.videoTitle}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(note.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    <button
                      onClick={() => deleteNote(note.id)}
                      title="Hapus catatan ini"
                      className="text-slate-300 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {note.timestampText && (
                    <div className="mt-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <Clock className="w-3 h-3" />
                        <span>Timestamp: {note.timestampText}</span>
                      </span>
                    </div>
                  )}

                  <p className="mt-3 text-xs sm:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {note.content}
                  </p>
                </div>

                {linkedVideo && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => onSelectVideo(linkedVideo)}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 transition cursor-pointer"
                    >
                      <span>Buka Materi Video Ini</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
