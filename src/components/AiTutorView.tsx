import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Volume2,
  RefreshCw,
  HelpCircle,
  BookOpen,
} from 'lucide-react';
import { VideoLesson } from '../types';
import { playArabicSpeech } from '../utils/helpers';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface AiTutorViewProps {
  currentVideo?: VideoLesson | null;
}

export const AiTutorView: React.FC<AiTutorViewProps> = ({ currentVideo }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: `أَهْلًا وَسَهْلًا! Saya adalah **Ustadz Istima' AI**. Saya siap membantu Anda mengasah kepekaan telinga dalam menyimak percakapan bahasa Arab (Maharah Istima').

Anda dapat bertanya tentang:
1. Cara membedakan pengucapan huruf yang mirip (seperti س dan ص, atau ح dan هـ).
2. Makna dan tata bahasa (Nahwu & Shorof) dari dialog yang baru saja Anda tonton.
3. Tips mendengarkan kata dalam lafaz bersambung (Wasal/Waqaf).
4. Simulasi percakapan interaktif!

Apa yang ingin Anda tanyakan seputar materi ${currentVideo ? `"${currentVideo.title}"` : 'bahasa Arab'}?`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          videoContext: currentVideo || undefined,
          history: messages.slice(-6).map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal menghubungi Ustadz AI');
      }

      const data = await response.json();
      const aiReply: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'Maaf, saya tidak dapat menjawab saat ini.',
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiReply]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: `Mohon maaf, terjadi kendala: ${err?.message || 'Server Gemini AI sedang sibuk'}. Silakan coba lagi.`,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeakArabic = async (msgId: string, text: string) => {
    // Extract Arabic parts from message if any
    const arabicMatch = text.match(/[\u0600-\u06FF\s،؛؟]+/g);
    const arabicText = arabicMatch ? arabicMatch.join(' ') : text;
    setPlayingId(msgId);
    try {
      await playArabicSpeech(arabicText);
    } finally {
      setPlayingId(null);
    }
  };

  const quickPrompts = [
    'Jelaskan makhraj huruf yang sering tertukar pada tema ini',
    'Bedah kalimat pertama dari dialog video ini secara Nahwu',
    'Uji pemahaman istima saya dengan 2 pertanyaan baru',
    'Tips menyimak kata yang dibaca cepat oleh penutur asli',
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col h-[78vh] overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 via-teal-50 to-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Ustadz Istima' AI</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                Gemini 3.8 Flash
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Tutor interaktif khusus keterampilan mendengar & kaidah bahasa Arab
            </p>
          </div>
        </div>

        {currentVideo && (
          <div className="hidden sm:block text-right text-xs">
            <span className="text-slate-400">Konteks Video:</span>
            <p className="font-semibold text-slate-700 truncate max-w-xs">
              {currentVideo.title}
            </p>
          </div>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          const isSpeaking = playingId === m.id;

          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs shrink-0 ${
                  isUser
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-emerald-600 text-white shadow-xs'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-slate-900 text-white rounded-tr-none'
                    : 'bg-slate-50 border border-slate-200/90 text-slate-800 rounded-tl-none shadow-2xs'
                }`}
              >
                <div className="whitespace-pre-wrap selection:bg-emerald-300 selection:text-slate-900">
                  {m.text}
                </div>

                <div
                  className={`flex items-center justify-between gap-2 mt-2 pt-2 border-t ${
                    isUser ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-400'
                  } text-[10px]`}
                >
                  <span>{m.timestamp}</span>

                  {!isUser && (
                    <button
                      onClick={() => handleSpeakArabic(m.id, m.text)}
                      disabled={isSpeaking}
                      title="Lafalkan teks Arab dalam pesan ini"
                      className="text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>{isSpeaking ? 'Memutar audio...' : 'Lafalkan Arab'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-none p-3.5 text-xs text-slate-500 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]"></div>
              <span className="ml-1 font-medium">Ustadz AI sedang menyusun penjelasan...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-[11px] font-semibold text-slate-400 shrink-0">Contoh:</span>
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(p)}
            className="shrink-0 bg-white hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 px-3 py-1 rounded-full text-slate-600 transition cursor-pointer"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-4 bg-white border-t border-slate-100">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Tanyakan kata yang didengar, tata bahasa, atau minta latihan istima'..."
            className="flex-1 bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-2xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Kirim</span>
          </button>
        </form>
      </div>
    </div>
  );
};
