/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { LoginGate } from './components/LoginGate';
import { Navbar } from './components/Navbar';
import { VideoCatalog } from './components/VideoCatalog';
import { VideoPlayer } from './components/VideoPlayer';
import { InteractiveTranscript } from './components/InteractiveTranscript';
import { VocabularySection } from './components/VocabularySection';
import { QuizSection } from './components/QuizSection';
import { NotesSection } from './components/NotesSection';
import { ProgressDashboard } from './components/ProgressDashboard';
import { AllNotesView } from './components/AllNotesView';
import { AiTutorView } from './components/AiTutorView';
import { AdminPanel } from './components/AdminPanel';
import { SentenceAnalysisModal } from './components/SentenceAnalysisModal';
import { VideoLesson } from './types';
import {
  BookOpen,
  Headphones,
  CheckCircle,
  HelpCircle,
  Bookmark,
  Sparkles,
  LayoutGrid,
} from 'lucide-react';

const MainApplication: React.FC = () => {
  const { userProfile, isLoading, isAdmin } = useAuth();
  const { videos, activeVideo, setActiveVideo } = useData();

  const [currentTab, setCurrentTab] = useState<'videos' | 'progress' | 'notes' | 'ai-tutor' | 'admin'>('videos');
  const [searchQuery, setSearchQuery] = useState('');
  const [analyzingSentence, setAnalyzingSentence] = useState<string | null>(null);

  // Active sub-tab inside video learning view: 'transcript' | 'vocabulary' | 'quiz' | 'notes'
  const [videoSubTab, setVideoSubTab] = useState<'transcript' | 'vocabulary' | 'quiz' | 'notes'>('transcript');
  const [isCatalogView, setIsCatalogView] = useState(false);

  // If auth is still checking
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-center">
          <p className="font-arabic text-xl font-bold text-emerald-400">مَهَارَةُ الاِسْتِمَاعِ</p>
          <p className="text-sm text-slate-300 mt-1">Memuat Maharah Istima'...</p>
        </div>
      </div>
    );
  }

  // Wajib Login Gate: If no user profile, render LoginGate
  if (!userProfile) {
    return <LoginGate />;
  }

  const handleSelectVideo = (video: VideoLesson) => {
    setActiveVideo(video);
    setIsCatalogView(false);
    setCurrentTab('videos');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddNoteAtTimestamp = (_seconds?: number, text?: string) => {
    setVideoSubTab('notes');
  };

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col text-slate-900">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          if (tab === 'videos') setIsCatalogView(false);
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* TAB 1: Videos / Main Player */}
        {currentTab === 'videos' && (
          <div className="space-y-6">
            {/* View Switcher: Single Player vs Catalog Grid */}
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCatalogView(false)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    !isCatalogView
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Headphones className="w-3.5 h-3.5" />
                  <span>Ruang Simak Aktif</span>
                </button>

                <button
                  onClick={() => setIsCatalogView(true)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    isCatalogView
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Katalog Semua Video ({videos.length})</span>
                </button>
              </div>

              {activeVideo && !isCatalogView && (
                <span className="hidden sm:inline text-xs text-slate-500 font-medium">
                  Sedang menyimak: <strong className="text-slate-800">{activeVideo.titleIndo || activeVideo.title}</strong>
                </span>
              )}
            </div>

            {isCatalogView ? (
              <VideoCatalog
                videos={videos}
                activeVideo={activeVideo}
                onSelectVideo={handleSelectVideo}
                searchQuery={searchQuery}
              />
            ) : activeVideo ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left/Main Column: Video Player & SubTabs */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Video Player */}
                  <VideoPlayer
                    video={activeVideo}
                    onOpenNoteModal={() => setVideoSubTab('notes')}
                    onOpenAiTutor={() => setCurrentTab('ai-tutor')}
                  />

                  {/* SubTabs Navigation for Active Video */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-1.5 flex items-center justify-between gap-1 shadow-2xs overflow-x-auto text-xs font-semibold">
                    <button
                      onClick={() => setVideoSubTab('transcript')}
                      className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        videoSubTab === 'transcript'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Transkrip Dialog</span>
                    </button>

                    <button
                      onClick={() => setVideoSubTab('vocabulary')}
                      className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        videoSubTab === 'vocabulary'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Mufradat ({activeVideo.vocabulary?.length || 0})</span>
                    </button>

                    <button
                      onClick={() => setVideoSubTab('quiz')}
                      className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        videoSubTab === 'quiz'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <HelpCircle className="w-4 h-4" />
                      <span>Kuis Pemahaman</span>
                    </button>

                    <button
                      onClick={() => setVideoSubTab('notes')}
                      className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        videoSubTab === 'notes'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Bookmark className="w-4 h-4" />
                      <span>Catatan Saya</span>
                    </button>
                  </div>

                  {/* Active SubTab Component */}
                  {videoSubTab === 'transcript' && (
                    <InteractiveTranscript
                      dialogueScript={activeVideo.dialogueScript || []}
                      videoTitle={activeVideo.title}
                      onAnalyzeSentence={(sent) => setAnalyzingSentence(sent)}
                      onAddNoteAtTimestamp={handleAddNoteAtTimestamp}
                    />
                  )}

                  {videoSubTab === 'vocabulary' && (
                    <VocabularySection vocabulary={activeVideo.vocabulary || []} />
                  )}

                  {videoSubTab === 'quiz' && (
                    <QuizSection video={activeVideo} />
                  )}

                  {videoSubTab === 'notes' && (
                    <NotesSection video={activeVideo} />
                  )}
                </div>

                {/* Right Column: Playlist / Up Next & Quick AI Tutor card */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Quick AI Tutor Teaser Card */}
                  <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-5 shadow-md border border-emerald-500/20 space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-300" />
                      <h3 className="font-bold text-sm">Ada Kata yang Belum Dipahami?</h3>
                    </div>
                    <p className="text-xs text-emerald-100/80 leading-relaxed">
                      Tanyakan langsung kepada <strong>Ustadz AI</strong> untuk membedah kaidah tata bahasa, makhraj huruf, atau simulasi percakapan.
                    </p>
                    <button
                      onClick={() => setCurrentTab('ai-tutor')}
                      className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Buka Ustadz AI</span>
                    </button>
                  </div>

                  {/* Other Lessons in Collection */}
                  <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="text-sm font-bold text-slate-900">
                        Materi Video Lainnya
                      </h3>
                      <button
                        onClick={() => setIsCatalogView(true)}
                        className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer"
                      >
                        Lihat Semua
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {videos
                        .filter((v) => v.id !== activeVideo.id)
                        .slice(0, 5)
                        .map((v) => (
                          <div
                            key={v.id}
                            onClick={() => handleSelectVideo(v)}
                            className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-100 hover:border-emerald-200 transition cursor-pointer flex items-center gap-3 group"
                          >
                            <img
                              src={v.thumbnailUrl}
                              alt={v.title}
                              className="w-16 h-12 object-cover rounded-xl shrink-0 group-hover:scale-105 transition-transform"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-800 transition">
                                {v.titleIndo || v.title}
                              </p>
                              <p className="font-arabic text-[11px] text-emerald-800 truncate text-right">
                                {v.titleArabic}
                              </p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                                <span>{v.category}</span>
                                <span>•</span>
                                <span>{v.duration}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* TAB 2: Progress Dashboard */}
        {currentTab === 'progress' && (
          <ProgressDashboard onSelectVideo={handleSelectVideo} />
        )}

        {/* TAB 3: All Notes */}
        {currentTab === 'notes' && (
          <AllNotesView onSelectVideo={handleSelectVideo} />
        )}

        {/* TAB 4: AI Tutor */}
        {currentTab === 'ai-tutor' && (
          <div className="max-w-4xl mx-auto">
            <AiTutorView currentVideo={activeVideo} />
          </div>
        )}

        {/* TAB 5: Admin Panel */}
        {currentTab === 'admin' && isAdmin && (
          <AdminPanel />
        )}
      </main>

      {/* Sentence Deep Analysis Modal */}
      {analyzingSentence && (
        <SentenceAnalysisModal
          sentence={analyzingSentence}
          videoTitle={activeVideo?.title || 'Maharah Istima'}
          onClose={() => setAnalyzingSentence(null)}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2 text-xs text-slate-500">
          <p className="font-semibold text-slate-700">
            Aplikasi Kumpulan Video Animasi Pembelajaran Bahasa Arab untuk Maharah Istima'
          </p>
          <p className="text-slate-400 text-[11px]">
            Dilengkapi Firebase Auth, Firestore Data per Pengguna, Backend Express Vercel, dan Gemini 3.8 Flash AI.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <MainApplication />
      </DataProvider>
    </AuthProvider>
  );
}
