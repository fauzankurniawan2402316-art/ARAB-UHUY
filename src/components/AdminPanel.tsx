import React, { useState } from 'react';
import {
  ShieldAlert,
  Plus,
  Sparkles,
  Trash2,
  Edit2,
  CheckCircle,
  Video,
  List,
  Save,
  X,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { VideoLesson, DialogueLine, VocabularyItem, QuizQuestion } from '../types';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

export const AdminPanel: React.FC = () => {
  const { videos, addVideo, updateVideo, deleteVideo } = useData();
  const { userProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [titleArabic, setTitleArabic] = useState('');
  const [titleIndo, setTitleIndo] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Percakapan Sehari-hari');
  const [level, setLevel] = useState<'Pemula (Mubtadi\')' | 'Menengah (Mutawassith)' | 'Lanjutan (Mutaqaddim)'>('Pemula (Mubtadi\')');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [duration, setDuration] = useState('04:00');
  const [thumbnailUrl, setThumbnailUrl] = useState('https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80');

  // AI Generator state
  const [aiTopic, setAiTopic] = useState('');
  const [aiLevel, setAiLevel] = useState('Pemula (Mubtadi\')');
  const [aiCustomPrompt, setAiCustomPrompt] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiSuccessMsg, setAiSuccessMsg] = useState<string | null>(null);

  // Dialogues, Vocab, Quizzes
  const [dialogues, setDialogues] = useState<DialogueLine[]>([
    {
      id: 'd-1',
      speaker: 'أَحْمَدُ',
      arabic: 'السَّلَامُ عَلَيْكُمْ يَا صَدِيقِي!',
      translation: 'Semoga keselamatan tercurah untukmu wahai temanku!',
      timestamp: '00:05',
      seconds: 5,
    },
  ]);

  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([
    {
      id: 'v-1',
      arabic: 'صَدِيقٌ',
      transliteration: 'Shadīq',
      indonesian: 'Teman',
      wordType: 'Isim',
    },
  ]);

  const [quizzes, setQuizzes] = useState<QuizQuestion[]>([
    {
      id: 'q-1',
      question: 'Siapa yang mengucapkan salam pertama kali?',
      options: ['Ahmad', 'Ali', 'Zaid', 'Umar'],
      correctAnswer: 0,
      explanation: 'Ahmad memulai percakapan dengan salam.',
    },
  ]);

  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const resetForm = () => {
    setTitle('');
    setTitleArabic('');
    setTitleIndo('');
    setDescription('');
    setCategory('Percakapan Sehari-hari');
    setLevel('Pemula (Mubtadi\')');
    setYoutubeUrl('');
    setDuration('04:00');
    setThumbnailUrl('https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80');
    setDialogues([]);
    setVocabulary([]);
    setQuizzes([]);
    setEditingId(null);
    setIsEditing(false);
  };

  const handleEditVideo = (v: VideoLesson) => {
    setEditingId(v.id);
    setTitle(v.title);
    setTitleArabic(v.titleArabic);
    setTitleIndo(v.titleIndo);
    setDescription(v.description);
    setCategory(v.category);
    setLevel(v.level);
    setYoutubeUrl(v.youtubeUrl);
    setDuration(v.duration);
    setThumbnailUrl(v.thumbnailUrl);
    setDialogues(v.dialogueScript || []);
    setVocabulary(v.vocabulary || []);
    setQuizzes(v.quiz || []);
    setIsEditing(true);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // AI Auto-Generate Lesson
  const handleGenerateWithAi = async () => {
    if (!aiTopic.trim()) return;
    setIsGeneratingAi(true);
    setAiSuccessMsg(null);

    try {
      const response = await fetch('/api/ai/generate-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiTopic,
          level: aiLevel,
          customPrompt: aiCustomPrompt,
        }),
      });

      if (!response.ok) throw new Error('Gagal membuat materi dengan AI.');

      const data = await response.json();
      const lesson = data.lesson;

      if (lesson) {
        setTitle(`${lesson.titleArabic} - ${lesson.titleIndo}`);
        setTitleArabic(lesson.titleArabic || '');
        setTitleIndo(lesson.titleIndo || '');
        setDescription(lesson.description || '');
        if (lesson.category) setCategory(lesson.category);
        if (Array.isArray(lesson.dialogueScript)) {
          setDialogues(
            lesson.dialogueScript.map((d: any, idx: number) => ({
              id: `ai-d-${idx}`,
              speaker: d.speaker || 'المُتَحَدِّثُ',
              arabic: d.arabic || '',
              translation: d.translation || '',
              timestamp: d.timestamp || `00:${(idx * 15).toString().padStart(2, '0')}`,
              seconds: idx * 15,
            }))
          );
        }
        if (Array.isArray(lesson.vocabulary)) {
          setVocabulary(
            lesson.vocabulary.map((v: any, idx: number) => ({
              id: `ai-v-${idx}`,
              arabic: v.arabic || '',
              transliteration: v.transliteration || '',
              indonesian: v.indonesian || '',
              wordType: v.wordType || 'Isim',
            }))
          );
        }
        if (Array.isArray(lesson.quiz)) {
          setQuizzes(
            lesson.quiz.map((q: any, idx: number) => ({
              id: `ai-q-${idx}`,
              question: q.question || '',
              options: q.options || ['Pilihan A', 'Pilihan B', 'Pilihan C', 'Pilihan D'],
              correctAnswer: q.correctAnswer || 0,
              explanation: q.explanation || '',
            }))
          );
        }

        if (!youtubeUrl) {
          setYoutubeUrl('https://www.youtube.com/watch?v=0kH8R40_zI4');
        }

        setIsEditing(true);
        setAiSuccessMsg('Berhasil menghasilkan materi pembelajaran lengkap dengan Gemini AI! Silakan periksa atau sesuaikan di bawah.');
      }
    } catch (err: any) {
      alert(err?.message || 'Terjadi kesalahan saat memanggil Gemini AI');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !youtubeUrl.trim()) {
      alert('Judul dan URL video wajib diisi.');
      return;
    }

    const payload = {
      title,
      titleArabic,
      titleIndo,
      description,
      category,
      level,
      youtubeUrl,
      duration,
      thumbnailUrl,
      dialogueScript: dialogues,
      vocabulary,
      quiz: quizzes,
    };

    if (editingId) {
      await updateVideo({
        ...payload,
        id: editingId,
        createdAt: new Date().toISOString(),
      });
      setSaveStatus('Video berhasil diperbarui!');
    } else {
      await addVideo(payload);
      setSaveStatus('Video animasi baru berhasil ditambahkan ke Firestore!');
    }

    setTimeout(() => {
      setSaveStatus(null);
      resetForm();
    }, 1500);
  };

  // Add line to dialogue
  const addDialogueLine = () => {
    setDialogues((prev) => [
      ...prev,
      {
        id: `d-${Date.now()}`,
        speaker: 'الشَّخْصِيَّةُ',
        arabic: '',
        translation: '',
        timestamp: '00:00',
        seconds: 0,
      },
    ]);
  };

  // Add vocabulary item
  const addVocabItem = () => {
    setVocabulary((prev) => [
      ...prev,
      {
        id: `v-${Date.now()}`,
        arabic: '',
        transliteration: '',
        indonesian: '',
        wordType: 'Isim',
      },
    ]);
  };

  // Add quiz item
  const addQuizItem = () => {
    setQuizzes((prev) => [
      ...prev,
      {
        id: `q-${Date.now()}`,
        question: 'Pertanyaan istima baru...',
        options: ['Opsi A', 'Opsi B', 'Opsi C', 'Opsi D'],
        correctAnswer: 0,
        explanation: 'Penjelasan jawaban...',
      },
    ]);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Admin Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Panel Administrator
                </h1>
                <span className="text-xs font-mono font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-400/40 px-2 py-0.5 rounded-md">
                  FAUZANKRN
                </span>
              </div>
              <p className="text-xs text-indigo-200/80 mt-0.5">
                Kelola koleksi video animasi Maharah Istima', transkrip, mufradat, dan kuis.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs bg-slate-800/80 border border-slate-700 px-4 py-2 rounded-2xl">
            <div>
              <p className="text-slate-400">Total Video</p>
              <p className="font-bold text-white text-base">{videos.length}</p>
            </div>
            <div className="w-px h-8 bg-slate-700 mx-2"></div>
            <div>
              <p className="text-slate-400">Hak Akses</p>
              <p className="font-bold text-emerald-400 text-base">Super Admin</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant Generator for Admins */}
      <div className="bg-gradient-to-br from-white to-emerald-50/50 rounded-3xl border border-emerald-200/80 shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              🪄 Generator Materi Otomatis (Gemini 3.8 AI)
            </h2>
            <p className="text-xs text-slate-500">
              Cukup masukkan topik bahasa Arab, Gemini akan membuatkan transkrip berharakat, mufradat, dan kuis istima' dalam 1 klik!
            </p>
          </div>
        </div>

        {aiSuccessMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{aiSuccessMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <input
              type="text"
              placeholder="Contoh: Berbelanja Obat di Apotek / Percakapan di Bandara / Bertamu ke Rumah Teman"
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              className="w-full bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <select
              value={aiLevel}
              onChange={(e) => setAiLevel(e.target.value)}
              className="w-full bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Pemula (Mubtadi')">Pemula (Mubtadi')</option>
              <option value="Menengah (Mutawassith)">Menengah (Mutawassith)</option>
              <option value="Lanjutan (Mutaqaddim)">Lanjutan (Mutaqaddim)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleGenerateWithAi}
            disabled={!aiTopic.trim() || isGeneratingAi}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{isGeneratingAi ? 'Gemini sedang menyusun materi...' : 'Buat Materi Otomatis dengan AI'}</span>
          </button>
        </div>
      </div>

      {/* Editor Form (Add / Edit Video) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {editingId ? 'Edit Materi Video Animasi' : 'Tambah Video Animasi Baru'}
            </h2>
          </div>

          {isEditing && (
            <button
              onClick={resetForm}
              className="px-3 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Batal</span>
            </button>
          )}
        </div>

        {saveStatus && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{saveStatus}</span>
          </div>
        )}

        <form onSubmit={handleSaveVideo} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Judul Lengkap Video
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="التعارف - Perkenalan di Sekolah"
                className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Judul Arab (Berharakat)
              </label>
              <input
                type="text"
                value={titleArabic}
                onChange={(e) => setTitleArabic(e.target.value)}
                placeholder="التَّعَارُفُ فِي الْمَدْرَسَةِ"
                className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs sm:text-sm font-arabic text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Judul Indonesia
              </label>
              <input
                type="text"
                value={titleIndo}
                onChange={(e) => setTitleIndo(e.target.value)}
                placeholder="Perkenalan di Sekolah"
                className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                YouTube URL Video Animasi
              </label>
              <input
                type="text"
                required
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Percakapan Sehari-hari">Percakapan Sehari-hari</option>
                <option value="Pendidikan & Sekolah">Pendidikan & Sekolah</option>
                <option value="Aktivitas Sehari-hari">Aktivitas Sehari-hari</option>
                <option value="Keluarga & Rumah">Keluarga & Rumah</option>
                <option value="Cita-cita & Profesi">Cita-cita & Profesi</option>
                <option value="Kesehatan & RS">Kesehatan & RS</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tingkat
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Pemula (Mubtadi')">Pemula (Mubtadi')</option>
                  <option value="Menengah (Mutawassith)">Menengah (Mutawassith)</option>
                  <option value="Lanjutan (Mutaqaddim)">Lanjutan (Mutaqaddim)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Durasi
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="04:15"
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Deskripsi Singkat & Target Maharah Istima'
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan alur animasi dan apa yang dilatih dalam video ini..."
              className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Sub-Editor: Dialogues */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Transkrip Dialog Percakapan ({dialogues.length} Baris)
              </span>
              <button
                type="button"
                onClick={addDialogueLine}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Baris</span>
              </button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {dialogues.map((d, idx) => (
                <div key={d.id} className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      placeholder="Nama Tokoh (contoh: أَحْمَدُ)"
                      value={d.speaker}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDialogues((prev) => prev.map((item, i) => (i === idx ? { ...item, speaker: val } : item)));
                      }}
                      className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg text-xs font-arabic w-36"
                    />

                    <input
                      type="text"
                      placeholder="Timestamp (contoh: 00:15)"
                      value={d.timestamp}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDialogues((prev) => prev.map((item, i) => (i === idx ? { ...item, timestamp: val } : item)));
                      }}
                      className="bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg text-xs font-mono w-20"
                    />

                    <button
                      type="button"
                      onClick={() => setDialogues((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Teks Arab berharakat..."
                    value={d.arabic}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDialogues((prev) => prev.map((item, i) => (i === idx ? { ...item, arabic: val } : item)));
                    }}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-sm font-arabic text-right"
                  />

                  <input
                    type="text"
                    placeholder="Terjemahan bahasa Indonesia..."
                    value={d.translation}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDialogues((prev) => prev.map((item, i) => (i === idx ? { ...item, translation: val } : item)));
                    }}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs text-slate-700"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Sub-Editor: Mufradat */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Daftar Kosakata Mufradat ({vocabulary.length} Kata)
              </span>
              <button
                type="button"
                onClick={addVocabItem}
                className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Kosakata</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {vocabulary.map((v, idx) => (
                <div key={v.id} className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <select
                      value={v.wordType}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setVocabulary((prev) => prev.map((item, i) => (i === idx ? { ...item, wordType: val } : item)));
                      }}
                      className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-[11px]"
                    >
                      <option value="Isim">Isim</option>
                      <option value="Fi'il">Fi'il</option>
                      <option value="Harf">Harf</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => setVocabulary((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Kata Arab..."
                    value={v.arabic}
                    onChange={(e) => {
                      const val = e.target.value;
                      setVocabulary((prev) => prev.map((item, i) => (i === idx ? { ...item, arabic: val } : item)));
                    }}
                    className="w-full bg-slate-50 border border-slate-200 px-2.5 py-1 rounded text-sm font-arabic text-right"
                  />

                  <input
                    type="text"
                    placeholder="Arti bahasa Indonesia..."
                    value={v.indonesian}
                    onChange={(e) => {
                      const val = e.target.value;
                      setVocabulary((prev) => prev.map((item, i) => (i === idx ? { ...item, indonesian: val } : item)));
                    }}
                    className="w-full bg-slate-50 border border-slate-200 px-2.5 py-1 rounded text-xs"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Sub-Editor: Quiz Questions */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Soal Kuis Istima' ({quizzes.length} Pertanyaan)
              </span>
              <button
                type="button"
                onClick={addQuizItem}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Soal</span>
              </button>
            </div>

            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {quizzes.map((q, qIdx) => (
                <div key={q.id} className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">Soal #{qIdx + 1}</span>
                    <button
                      type="button"
                      onClick={() => setQuizzes((prev) => prev.filter((_, i) => i !== qIdx))}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Pertanyaan pemahaman istima'..."
                    value={q.question}
                    onChange={(e) => {
                      const val = e.target.value;
                      setQuizzes((prev) => prev.map((item, i) => (i === qIdx ? { ...item, question: val } : item)));
                    }}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-1.5">
                        <input
                          type="radio"
                          name={`correct-${qIdx}`}
                          checked={q.correctAnswer === optIdx}
                          onChange={() => {
                            setQuizzes((prev) => prev.map((item, i) => (i === qIdx ? { ...item, correctAnswer: optIdx } : item)));
                          }}
                        />
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const val = e.target.value;
                            setQuizzes((prev) =>
                              prev.map((item, i) =>
                                i === qIdx
                                  ? {
                                      ...item,
                                      options: item.options.map((o, oi) => (oi === optIdx ? val : o)),
                                    }
                                  : item
                              )
                            );
                          }}
                          className="flex-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
            )}

            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{editingId ? 'Simpan Perubahan Video' : 'Simpan Video Baru ke Firestore'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Existing Videos Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-slate-900">
          Daftar Video Animasi Tersedia ({videos.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase">
                <th className="py-3 px-4">Video</th>
                <th className="py-3 px-4">Kategori & Tingkat</th>
                <th className="py-3 px-4">Dialog & Kuis</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {videos.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-slate-900">{v.title}</p>
                    <p className="font-arabic text-emerald-800 text-sm mt-0.5">{v.titleArabic}</p>
                  </td>
                  <td className="py-3.5 px-4 space-y-1">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {v.category}
                    </span>
                    <span className="block text-slate-500 text-[11px]">{v.level}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <p>{v.dialogueScript?.length || 0} Baris Dialog</p>
                    <p className="text-[11px] text-slate-400">{v.quiz?.length || 0} Soal Kuis</p>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleEditVideo(v)}
                      title="Edit materi"
                      className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Yakin ingin menghapus materi "${v.title}"?`)) {
                          deleteVideo(v.id);
                        }
                      }}
                      title="Hapus video"
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
