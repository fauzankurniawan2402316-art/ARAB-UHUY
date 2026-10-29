import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();

app.use(express.json({ limit: '10mb' }));

// CORS headers
app.use((_req: Request, res: Response, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (_req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in server environment');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Maharah Istima API',
    timestamp: new Date().toISOString(),
  });
});

// AI Tutor Chat for Maharah Istima'
app.post('/api/ai/ask', async (req: Request, res: Response) => {
  try {
    const { message, videoContext, history } = req.body;
    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const ai = getGeminiClient();

    const systemInstruction = `Anda adalah "Ustadz Istima' AI", asisten dan guru pembelajaran Bahasa Arab interaktif khusus untuk mengasah Maharah Istima' (keterampilan menyimak/mendengar).
Tujuan utama Anda:
1. Membantu siswa memahami apa yang mereka dengar dari video animasi pembelajaran bahasa Arab.
2. Jelaskan kosa kata (mufradat), susunan tata bahasa (Nahwu & Shorof), intonasi, dan makharijul huruf dengan ramah, komunikatif, dan terstruktur.
3. Selalu sertakan harakat lengkap pada kata/kalimat Arab (tasykil) agar siswa dapat membaca dan membandingkan dengan audio yang didengar.
4. Gunakan bahasa Indonesia yang mudah dipahami, sopan, dan memotivasi siswa (Thalabah).
${videoContext ? `Konteks Video Saat Ini:
- Judul: ${videoContext.title || ''} (${videoContext.titleArabic || ''})
- Kategori: ${videoContext.category || ''}
- Tingkat: ${videoContext.level || ''}
- Ringkasan Percakapan: ${videoContext.description || ''}
- Transkrip yang dipelajari: ${JSON.stringify(videoContext.dialogueScript || []).slice(0, 1500)}` : ''}`;

    let conversationPrompt = '';
    if (Array.isArray(history) && history.length > 0) {
      conversationPrompt += 'Riwayat percakapan sebelumnya:\n';
      history.slice(-6).forEach((h: { sender: string; text: string }) => {
        conversationPrompt += `${h.sender === 'user' ? 'Siswa' : 'Ustadz AI'}: ${h.text}\n`;
      });
      conversationPrompt += '\n';
    }
    conversationPrompt += `Pertanyaan Siswa: ${message}\nJawaban Ustadz AI:`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: conversationPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'Maaf, saya tidak dapat memproses jawaban saat ini. Silakan coba lagi.';
    res.json({ reply });
  } catch (error: any) {
    console.error('Error in /api/ai/ask:', error);
    res.status(500).json({
      error: error?.message || 'Gagal menghubungi server Gemini AI',
    });
  }
});

// AI Sentence Deep Analysis (I'rab, Mufradat, Harakat, Listening Tip)
app.post('/api/ai/analyze-sentence', async (req: Request, res: Response) => {
  try {
    const { sentence, videoTitle } = req.body;
    if (!sentence) {
      res.status(400).json({ error: 'Sentence is required' });
      return;
    }

    const ai = getGeminiClient();

    const prompt = `Analisis kalimat bahasa Arab berikut ini yang didengar dari percakapan animasi "${videoTitle || 'Pembelajaran Istima'}":
"${sentence}"

Berikan analisis dalam format JSON murni dengan struktur berikut:
{
  "arabicWithHarakat": "Kalimat berharakat lengkap",
  "transliteration": "Transliterasi latin",
  "indonesianTranslation": "Terjemahan bahasa Indonesia yang tepat dan luwes",
  "wordBreakdown": [
    {
      "word": "Kata berharakat",
      "root": "Akar kata / Tashrif asal (jika relevan)",
      "wordType": "Isim / Fi'il (Madhi/Mudhari'/Amr) / Harf",
      "meaning": "Arti kata dalam konteks kalimat",
      "listeningTip": "Hal yang perlu diperhatikan saat mendengar kata ini (misal: nun sukun, idgham, ta' marbuthah, panjang-pendek mad)"
    }
  ],
  "grammaticalStructure": "Penjelasan singkat struktur Nahwu/tata bahasa (misal: Jumlah Fi'liyyah yang terdiri dari Fi'il, Fa'il, dan Maf'ul bih)",
  "culturalContext": "Konteks penggunaan kalimat ini dalam percakapan sehari-hari penutur Arab"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    let resultJson;
    try {
      resultJson = JSON.parse(response.text || '{}');
    } catch {
      resultJson = { raw: response.text };
    }

    res.json({ analysis: resultJson });
  } catch (error: any) {
    console.error('Error in /api/ai/analyze-sentence:', error);
    res.status(500).json({
      error: error?.message || 'Gagal menganalisis kalimat',
    });
  }
});

// AI Lesson Generator for Admin (Generates complete Istima' lesson package)
app.post('/api/ai/generate-lesson', async (req: Request, res: Response) => {
  try {
    const { topic, level, customPrompt } = req.body;
    if (!topic) {
      res.status(400).json({ error: 'Topic is required' });
      return;
    }

    const ai = getGeminiClient();

    const prompt = `Anda adalah ahli kurikulum Bahasa Arab untuk Maharah Istima' (Keterampilan Mendengar/Menyimak).
Buatlah paket materi pembelajaran video animasi bahasa Arab lengkap untuk topik: "${topic}" dengan tingkat kesulitan: "${level || 'Pemula / Mubtadi'}".
${customPrompt ? `Catatan tambahan dari guru: ${customPrompt}` : ''}

Keluarkan format JSON murni dengan struktur persis seperti ini:
{
  "titleArabic": "Judul materi dalam bahasa Arab berharakat",
  "titleIndo": "Judul materi dalam bahasa Indonesia",
  "description": "Deskripsi pembelajaran dan tujuan istima'",
  "category": "Kategori (contoh: Percakapan Sehari-hari / Sekolah / Keluarga / Pasar / Profesi / Wisata)",
  "dialogueScript": [
    {
      "speaker": "Nama Tokoh (contoh: أَحْمَدُ atau فَاطِمَةُ)",
      "arabic": "Teks percakapan Arab berharakat lengkap",
      "translation": "Terjemahan Indonesia",
      "timestamp": "00:10"
    }
  ],
  "vocabulary": [
    {
      "arabic": "Kata berharakat",
      "transliteration": "Transliterasi latin",
      "indonesian": "Arti kata",
      "wordType": "Isim / Fi'il / Harf"
    }
  ],
  "quiz": [
    {
      "question": "Pertanyaan pemahaman istima' berdasarkan percakapan di atas",
      "options": ["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"],
      "correctAnswer": 0,
      "explanation": "Penjelasan mengapa jawaban tersebut benar berdasar audio percakapan"
    }
  ]
}
Pastikan minimal 6 baris percakapan interaktif, 6 mufradat penting, dan 4 pertanyaan kuis pemahaman istima'.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.5,
      },
    });

    const lessonData = JSON.parse(response.text || '{}');
    res.json({ lesson: lessonData });
  } catch (error: any) {
    console.error('Error in /api/ai/generate-lesson:', error);
    res.status(500).json({
      error: error?.message || 'Gagal menghasilkan materi pelajaran otomatis',
    });
  }
});

export default app;
