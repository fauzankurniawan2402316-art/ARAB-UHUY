import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Bookmark,
  Sparkles,
  ShieldAlert,
  LogOut,
  User,
  Menu,
  X,
  Search,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

interface NavbarProps {
  currentTab: 'videos' | 'progress' | 'notes' | 'ai-tutor' | 'admin';
  setCurrentTab: (tab: 'videos' | 'progress' | 'notes' | 'ai-tutor' | 'admin') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  searchQuery,
  setSearchQuery,
}) => {
  const { userProfile, isAdmin, logout } = useAuth();
  const { bookmarks, userNotes } = useData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentTab('videos')}
              className="flex items-center gap-3 text-left group transition cursor-pointer"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
                <span className="font-arabic font-bold text-xl leading-none">إ</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-slate-900 tracking-tight">
                    Maharah Istima'
                  </span>
                  <span className="font-arabic text-emerald-700 text-sm font-semibold px-2 py-0.5 bg-emerald-50 rounded-md border border-emerald-200">
                    مَهَارَةُ الاِسْتِمَاعِ
                  </span>
                </div>
                <p className="text-xs text-slate-500 hidden sm:block">
                  Koleksi Animasi Pembelajaran Bahasa Arab Interaktif
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex items-center flex-1 max-w-xs mx-6">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari materi atau topik Arab..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 pl-9.5 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1.5">
            <button
              onClick={() => setCurrentTab('videos')}
              className={`px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 transition cursor-pointer ${
                currentTab === 'videos'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>Koleksi Video</span>
            </button>

            <button
              onClick={() => setCurrentTab('progress')}
              className={`px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 transition cursor-pointer ${
                currentTab === 'progress'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>Progres Belajar</span>
            </button>

            <button
              onClick={() => setCurrentTab('notes')}
              className={`px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 transition cursor-pointer relative ${
                currentTab === 'notes'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Bookmark className="w-4 h-4 text-amber-600" />
              <span>Catatan ({userNotes.length})</span>
            </button>

            <button
              onClick={() => setCurrentTab('ai-tutor')}
              className={`px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 transition cursor-pointer ${
                currentTab === 'ai-tutor'
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'text-slate-700 bg-emerald-50/80 hover:bg-emerald-100/70 border border-emerald-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400 fill-amber-300" />
              <span>Ustadz AI</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setCurrentTab('admin')}
                className={`px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  currentTab === 'admin'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-indigo-500" />
                <span>Panel Admin</span>
              </button>
            )}
          </nav>

          {/* User Profile & Logout Button */}
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              {userProfile?.photoURL ? (
                <img
                  src={userProfile.photoURL}
                  alt={userProfile.displayName}
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-emerald-500"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                  {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
              )}
              <div className="text-left text-xs">
                <p className="font-semibold text-slate-800 truncate max-w-[120px]">
                  {userProfile?.displayName || 'Santri'}
                </p>
                <div className="flex items-center gap-1">
                  {isAdmin ? (
                    <span className="text-[10px] uppercase font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.2 rounded">
                      Admin
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500">
                      Siswa Istima'
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              title="Keluar dari akun"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 hover:text-rose-800 border border-rose-200 rounded-xl transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{loggingOut ? 'Keluar...' : 'Keluar'}</span>
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-5 space-y-2">
          {/* Mobile Search */}
          <div className="relative w-full mb-3">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari materi Arab..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 pl-9.5 pr-4 py-2 rounded-xl text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setCurrentTab('videos');
                setMobileMenuOpen(false);
              }}
              className={`p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
                currentTab === 'videos' ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-slate-700 bg-slate-50'
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>Koleksi Video</span>
            </button>

            <button
              onClick={() => {
                setCurrentTab('progress');
                setMobileMenuOpen(false);
              }}
              className={`p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
                currentTab === 'progress' ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-slate-700 bg-slate-50'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>Progres Belajar</span>
            </button>

            <button
              onClick={() => {
                setCurrentTab('notes');
                setMobileMenuOpen(false);
              }}
              className={`p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
                currentTab === 'notes' ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-slate-700 bg-slate-50'
              }`}
            >
              <Bookmark className="w-4 h-4 text-amber-600" />
              <span>Catatan ({userNotes.length})</span>
            </button>

            <button
              onClick={() => {
                setCurrentTab('ai-tutor');
                setMobileMenuOpen(false);
              }}
              className={`p-3 rounded-xl text-sm font-semibold flex items-center gap-2 ${
                currentTab === 'ai-tutor' ? 'bg-emerald-600 text-white' : 'text-slate-800 bg-emerald-50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400 fill-amber-300" />
              <span>Ustadz AI</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => {
                  setCurrentTab('admin');
                  setMobileMenuOpen(false);
                }}
                className={`col-span-2 p-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 ${
                  currentTab === 'admin' ? 'bg-indigo-600 text-white' : 'text-indigo-700 bg-indigo-50'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Panel Admin (Kelola Materi)</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
