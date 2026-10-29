import React, { useState } from 'react';
import { Bookmark, Trash2, Plus, Clock, Save, Edit3 } from 'lucide-react';
import { UserNote, VideoLesson } from '../types';
import { useData } from '../context/DataContext';

interface NotesSectionProps {
  video: VideoLesson;
  defaultTimestampSeconds?: number;
  defaultTimestampText?: string;
}

export const NotesSection: React.FC<NotesSectionProps> = ({
  video,
  defaultTimestampSeconds,
  defaultTimestampText,
}) => {
  const { userNotes, saveNote, deleteNote } = useData();
  const [content, setContent] = useState('');
  const [timestampText, setTimestampText] = useState(defaultTimestampText || '');
  const [isSaving, setIsSaving] = useState(false);

  // Filter notes for current video
  const currentVideoNotes = userNotes.filter((n) => n.videoId === video.id);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSaving(true);
    try {
      await saveNote(video.id, video.title, content.trim(), defaultTimestampSeconds, timestampText);
      setContent('');
      setTimestampText('');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="font-arabic text-lg font-bold text-emerald-800">مُفَكِّرَتِي الشَّخْصِيَّةُ</span>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Catatan Belajar Istima' Saya
          </h2>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {currentVideoNotes.length} Catatan tersimpan
        </span>
      </div>

      {/* Input Note Form */}
      <form onSubmit={handleAddNote} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <div className="flex items-center justify-between gap-3">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tulis Catatan / Dikte Kosakata yang Didengar:</span>
          </label>

          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="00:15"
              value={timestampText}
              onChange={(e) => setTimestampText(e.target.value)}
              className="w-16 bg-white border border-slate-200 px-2 py-1 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        <textarea
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Contoh: Pada menit 00:28 ada ungkapan 'فُرْصَةٌ سَعِيدَةٌ' yang sering dipakai saat pertama kali berkenalan..."
          className="w-full bg-white border border-slate-200 p-3 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!content.trim() || isSaving}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Menyimpan...' : 'Simpan Catatan'}</span>
          </button>
        </div>
      </form>

      {/* Notes List */}
      <div className="space-y-3 pt-2">
        {currentVideoNotes.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            Belum ada catatan untuk materi ini. Tulis kosakata baru atau kesan mendengar Anda!
          </div>
        ) : (
          currentVideoNotes.map((note) => (
            <div
              key={note.id}
              className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-slate-50 transition flex items-start justify-between gap-3 group"
            >
              <div className="space-y-1">
                {note.timestampText && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    <Clock className="w-3 h-3" />
                    <span>{note.timestampText}</span>
                  </span>
                )}
                <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {note.content}
                </p>
                <p className="text-[10px] text-slate-400">
                  {new Date(note.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              <button
                onClick={() => deleteNote(note.id)}
                title="Hapus catatan"
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
