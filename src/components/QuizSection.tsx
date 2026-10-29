import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  RotateCcw,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { QuizQuestion, VideoLesson, UserProgress } from '../types';
import { useData } from '../context/DataContext';

interface QuizSectionProps {
  video: VideoLesson;
}

export const QuizSection: React.FC<QuizSectionProps> = ({ video }) => {
  const { userProgress, saveProgress } = useData();
  const questions = video.quiz || [];

  const existingProgress = userProgress[video.id] as UserProgress | undefined;

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState<boolean>(existingProgress?.quizCompleted || false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSelectOption = (qIndex: number, optIndex: number) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [qIndex]: optIndex,
    }));
  };

  const calculateScore = () => {
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        correctCount++;
      }
    });
    return {
      correctCount,
      total: questions.length,
      percentage: Math.round((correctCount / (questions.length || 1)) * 100),
    };
  };

  const handleSubmitQuiz = async () => {
    const { percentage } = calculateScore();
    setSubmitted(true);
    setIsSaving(true);
    try {
      await saveProgress(
        video.id,
        existingProgress?.completed || false,
        true,
        percentage,
        questions.length,
        existingProgress?.lastWatchedSeconds || 0
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setSubmitted(false);
  };

  const allAnswered = questions.length > 0 && Object.keys(selectedAnswers).length === questions.length;
  const scoreData = calculateScore();

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-5">
      {/* Quiz Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-arabic text-lg font-bold text-emerald-800">اخْتِبَارُ الاِسْتِمَاعِ</span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Kuis Pemahaman Istima'
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Jawab pertanyaan berdasarkan percakapan yang Anda dengar dalam animasi.
          </p>
        </div>

        {submitted && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-900">
                Skor Anda: {existingProgress?.quizScore ?? scoreData.percentage}%
              </span>
            </div>
            <button
              onClick={handleResetQuiz}
              className="p-2 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1 transition cursor-pointer"
              title="Ulangi Kuis"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Ulangi</span>
            </button>
          </div>
        )}
      </div>

      {/* Questions List */}
      <div className="space-y-5">
        {questions.map((q, qIndex) => {
          const selected = selectedAnswers[qIndex];
          const isCorrect = selected === q.correctAnswer;
          return (
            <div
              key={q.id}
              className={`p-4 sm:p-5 rounded-2xl border transition ${
                submitted
                  ? isCorrect
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : 'bg-rose-50/50 border-rose-200'
                  : 'bg-slate-50/70 border-slate-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {qIndex + 1}
                </span>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                    {q.question}
                  </h3>

                  {/* Options */}
                  <div className="mt-3.5 space-y-2">
                    {q.options.map((opt, optIndex) => {
                      const isChosen = selected === optIndex;
                      const isOptionCorrect = optIndex === q.correctAnswer;

                      let optionStyle = 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50';
                      if (submitted) {
                        if (isOptionCorrect) {
                          optionStyle = 'bg-emerald-100/90 text-emerald-950 border-emerald-400 font-semibold';
                        } else if (isChosen && !isOptionCorrect) {
                          optionStyle = 'bg-rose-100/90 text-rose-950 border-rose-400 font-semibold';
                        } else {
                          optionStyle = 'bg-slate-50 text-slate-400 border-slate-200';
                        }
                      } else if (isChosen) {
                        optionStyle = 'bg-emerald-50 text-emerald-900 border-emerald-500 font-semibold ring-2 ring-emerald-500/20';
                      }

                      return (
                        <button
                          key={optIndex}
                          type="button"
                          onClick={() => handleSelectOption(qIndex, optIndex)}
                          disabled={submitted}
                          className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm flex items-center justify-between gap-3 transition cursor-pointer disabled:cursor-default ${optionStyle}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded-md border flex items-center justify-center text-[10px] font-bold">
                              {String.fromCharCode(65 + optIndex)}
                            </span>
                            <span>{opt}</span>
                          </div>

                          {submitted && isOptionCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                          {submitted && isChosen && !isOptionCorrect && (
                            <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation after submit */}
                  {submitted && (
                    <div className="mt-3 p-3 rounded-xl bg-white/80 border border-slate-200 text-xs text-slate-600">
                      <p className="font-semibold text-slate-700 mb-0.5">Penjelasan:</p>
                      <p>{q.explanation}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      {!submitted && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            {Object.keys(selectedAnswers).length} dari {questions.length} soal dijawab
          </p>

          <button
            onClick={handleSubmitQuiz}
            disabled={!allAnswered || isSaving}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            <span>{isSaving ? 'Menyimpan ke Firestore...' : 'Periksa Jawaban Kuis'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
