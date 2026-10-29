import React, { useState } from 'react';
import {
  Sparkles,
  Headphones,
  CheckCircle,
  ShieldCheck,
  Lock,
  UserCheck,
  BookOpen,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginGate: React.FC = () => {
  const { loginWithGoogle, loginAsAdminCredentials } = useAuth();
  const [activeTab, setActiveTab] = useState<'google' | 'admin'>('google');
  const [adminUsername, setAdminUsername] = useState('FAUZANKRN');
  const [adminPassword, setAdminPassword] = useState('#Fauzan220306');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Gagal masuk dengan Google. Pastikan popup tidak diblokir browser.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const res = await loginAsAdminCredentials(adminUsername, adminPassword);
      if (!res.success) {
        setErrorMsg(res.error || 'Autentikasi admin gagal.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Terjadi kesalahan sistem saat verifikasi admin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillAdminCredentials = () => {
    setAdminUsername('FAUZANKRN');
    setAdminPassword('#Fauzan220306');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Decorative background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header Bar */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold text-xl shadow-lg shadow-emerald-500/30">
            <span className="font-arabic">إ</span>
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight">Maharah Istima'</span>
            <span className="block text-xs text-emerald-400 font-arabic">مَهَارَةُ الاِسْتِمَاعِ</span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-emerald-200/80 bg-emerald-900/40 border border-emerald-700/50 px-3 py-1.5 rounded-full backdrop-blur-md">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Akses Terproteksi Firebase Auth & Firestore</span>
        </div>
      </header>

      {/* Hero Content & Login Box */}
      <main className="relative z-10 max-w-6xl mx-auto w-full px-6 py-8 flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16">
        {/* Left Column: Educational Pitch */}
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
            <Headphones className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Kumpulan Video Animasi Pembelajaran Bahasa Arab</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Asah Kepekaan Menyimak{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
              Bahasa Arab
            </span>{' '}
            dengan Animasi Interaktif
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
            Platform edukatif modern khusus untuk menguasai <strong className="text-white font-semibold">Maharah Istima' (Keterampilan Mendengar)</strong> melalui animasi kartun otentik, transkrip dwibahasa berharakat lengkap, latihan kuis pemahaman, dan bantuan tutor cerdas Gemini AI.
          </p>

          {/* Key Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto lg:mx-0 pt-2">
            <div className="flex items-start gap-2.5 text-left bg-white/5 border border-white/10 p-3 rounded-2xl backdrop-blur-sm">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white">Video Animasi Kartun</p>
                <p className="text-xs text-slate-300">Dialog bertema sekolah, pasar, rumah, & cita-cita.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-left bg-white/5 border border-white/10 p-3 rounded-2xl backdrop-blur-sm">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white">Transkrip Berharakat</p>
                <p className="text-xs text-slate-300">Dapat disembunyikan untuk menguji ketajaman dengar.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-left bg-white/5 border border-white/10 p-3 rounded-2xl backdrop-blur-sm">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white">Kuis Istima' Interaktif</p>
                <p className="text-xs text-slate-300">Skor & progres tersimpan otomatis di Firestore.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-left bg-white/5 border border-white/10 p-3 rounded-2xl backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white">Ustadz AI (Gemini 3.8)</p>
                <p className="text-xs text-slate-300">Bedah makharijul huruf & tata bahasa Nahwu/Shorof.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Login Card */}
        <div className="w-full max-w-md bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Selamat Datang
            </h2>
            <p className="text-xs text-emerald-300/80 mt-1">
              Silakan masuk untuk mengakses materi dan melacak hasil belajar Anda
            </p>
          </div>

          {/* Tab Switcher: Siswa (Google) vs Admin (FAUZANKRN) */}
          <div className="flex p-1 bg-slate-800/80 rounded-2xl border border-slate-700 mb-6">
            <button
              type="button"
              onClick={() => {
                setActiveTab('google');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'google'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Masuk Google</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('admin');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Login Admin</span>
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Google Login Tab */}
          {activeTab === 'google' ? (
            <div className="space-y-4">
              <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-4 text-center">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Gunakan akun Google Anda untuk masuk dengan mudah. Seluruh riwayat menyimak, catatan, dan progres kuis Anda akan tersimpan di cloud Firebase Firestore.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-3.5 px-4 rounded-2xl transition shadow-lg shadow-white/10 flex items-center justify-center gap-3 cursor-pointer group disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.67v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.16z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.93 6.72-4.93z"
                  />
                </svg>
                <span className="text-sm">
                  {isSubmitting ? 'Menghubungkan...' : 'Masuk dengan Google'}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <p className="text-[11px] text-slate-400 text-center">
                *Akun pengajar/admin (fauzan.kurniawan.2402316@students.um.ac.id) otomatis mendapatkan akses administrator.
              </p>
            </div>
          ) : (
            /* Admin Login Tab (FAUZANKRN) */
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-2xl p-3 text-xs text-indigo-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-indigo-300">Kredensial Admin Bawaan:</span>
                  <button
                    type="button"
                    onClick={fillAdminCredentials}
                    className="text-[10px] text-indigo-400 underline hover:text-white cursor-pointer font-bold"
                  >
                    Gunakan Otomatis
                  </button>
                </div>
                <p>Username: <code className="bg-indigo-900/60 px-1 py-0.5 rounded font-mono text-white">FAUZANKRN</code></p>
                <p>Password: <code className="bg-indigo-900/60 px-1 py-0.5 rounded font-mono text-white">#Fauzan220306</code></p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Username Admin
                </label>
                <input
                  type="text"
                  required
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="FAUZANKRN"
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password Admin
                </label>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-2xl transition shadow-lg shadow-indigo-600/30 text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>{isSubmitting ? 'Memverifikasi...' : 'Masuk sebagai Admin FAUZANKRN'}</span>
              </button>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <span className="text-[11px] text-slate-500">
              Pengembangan Maharah Istima' Pendidikan Bahasa Arab
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-6 py-4 text-center text-xs text-slate-300">
        <p>© 2025 Maharah Istima' - Media Pembelajaran Animasi Bahasa Arab Interaktif.</p>
      </footer>
    </div>
  );
};
