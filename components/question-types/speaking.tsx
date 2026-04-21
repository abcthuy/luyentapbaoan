"use client";
import React, { useState } from 'react';
import { Lightbulb, Mic, Square, Play, RefreshCw, Volume2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRecording } from '@/hooks/use-recording';
import { normalizeDisplayText } from '@/lib/text';

interface SpeakingQuestionProps {
    text?: string;
    topic?: string;
    hint?: string;
    mode: 'reading' | 'speaking';
    onSubmitResponse?: (payload: { audioBlob?: Blob; textAnswer?: string; transcript?: string; tutorId?: string; duration?: number }) => void;
    disabled?: boolean;
}

export const SpeakingQuestion: React.FC<SpeakingQuestionProps> = ({
    text,
    topic,
    hint,
    mode,
    disabled,
    onSubmitResponse,
}) => {
    const [showHint, setShowHint] = useState(false);
    const [textFallback, setTextFallback] = useState('');
    const [tutorId, setTutorId] = useState<'ai' | 'tutor-1' | 'tutor-2'>('ai');
    const recorder = useRecording();

    const safeText = normalizeDisplayText(text);
    const safeTopic = normalizeDisplayText(topic || text);
    const safeHint = normalizeDisplayText(hint);
    const safeStartError = normalizeDisplayText(recorder.startError);

    const handleSubmit = () => {
        if (recorder.audioBlob) {
            onSubmitResponse?.({ 
                audioBlob: recorder.audioBlob,
                transcript: recorder.transcript,
                tutorId,
                duration: recorder.duration
            });
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
            <div className="bg-white rounded-[32px] shadow-xl border-4 border-slate-100 overflow-hidden relative">
                <div className="p-6 md:p-8 pb-8">
                    {mode === 'reading' && (
                        <div className="space-y-6">
                            <p className="text-2xl md:text-4xl font-black text-slate-800 leading-normal text-center whitespace-pre-line">
                                {safeText}
                            </p>
                        </div>
                    )}

                    {mode === 'speaking' && (
                        <div className="space-y-6">
                            <div className="p-8 bg-amber-50 rounded-[32px] border-2 border-amber-100 text-center">
                                <p className="text-2xl md:text-3xl font-black text-amber-800 leading-tight whitespace-pre-line">
                                    {safeTopic}
                                </p>
                            </div>

                            <div className="flex flex-col items-center">
                                <button
                                    onClick={() => setShowHint(!showHint)}
                                    className="flex items-center gap-2 text-amber-600 font-bold hover:text-amber-700 transition-colors"
                                >
                                    <Lightbulb size={20} />
                                    {showHint ? normalizeDisplayText('Ẩn gợi ý') : normalizeDisplayText('Xem gợi ý dàn ý')}
                                </button>

                                <AnimatePresence>
                                    {showHint && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden w-full max-w-lg"
                                        >
                                            <div className="mt-4 p-6 bg-white rounded-[32px] border-2 border-slate-100 text-slate-600 space-y-2 whitespace-pre-line text-left leading-relaxed">
                                                {safeHint ? (
                                                    <p>{safeHint}</p>
                                                ) : (
                                                    <>
                                                        <p>
                                                            <strong className="text-indigo-600">1. Mở bài:</strong> Giới thiệu vấn đề và quan điểm của con.
                                                        </p>
                                                        <p>
                                                            <strong className="text-indigo-600">2. Thân bài:</strong>
                                                        </p>
                                                        <ul className="list-disc list-inside pl-4 space-y-1 text-sm">
                                                            <li>Lý do thứ nhất...</li>
                                                            <li>Lý do thứ hai...</li>
                                                            <li>Ví dụ minh họa...</li>
                                                        </ul>
                                                        <p>
                                                            <strong className="text-indigo-600">3. Kết luận:</strong> Khẳng định lại ý kiến và lời khuyên.
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-slate-50 p-8 border-t-2 border-slate-100 flex flex-col items-center gap-6">
                    {recorder.startError && (
                        <div className="w-full max-w-2xl rounded-[32px] border-2 border-rose-200 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-700 text-center">
                            {safeStartError}
                        </div>
                    )}

                    {!recorder.hasRecorded ? (
                        <div className="flex flex-col items-center gap-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={recorder.isRecording ? recorder.stopRecording : recorder.startRecording}
                                disabled={disabled}
                                className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all relative ${recorder.isRecording ? 'bg-rose-500 text-white' : 'bg-white text-indigo-600 border-4 border-indigo-100'}`}
                            >
                                {recorder.isRecording && (
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className="absolute inset-0 rounded-full bg-rose-400/30"
                                    />
                                )}
                                {recorder.isRecording ? <Square size={32} fill="currentColor" /> : <Mic size={40} />}
                            </motion.button>
                            <span className={`font-black uppercase tracking-widest text-sm ${recorder.isRecording ? 'text-rose-600 animate-pulse' : 'text-slate-400'}`}>
                                {recorder.isRecording ? `${normalizeDisplayText('Đang ghi âm')} (${recorder.duration}s)...` : normalizeDisplayText('Nhấn để bắt đầu nói')}
                            </span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-6 w-full max-w-md">
                            <div className="w-full bg-white rounded-[32px] p-4 border-2 border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={recorder.playRecording}
                                        className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all"
                                    >
                                        {recorder.isPlayingBack ? <Volume2 className="animate-pulse" size={20} /> : <Play fill="currentColor" size={20} />}
                                    </button>
                                    <div>
                                        <div className="font-black text-slate-800 text-sm">{normalizeDisplayText('Bản ghi âm của bé')}</div>
                                        <div className="text-xs text-slate-400 font-bold">{recorder.duration} giây</div>
                                    </div>
                                </div>
                                <button
                                    onClick={recorder.resetRecording}
                                    className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                                    title="Ghi lại"
                                >
                                    <RefreshCw size={20} />
                                </button>
                            </div>

                            <div className="text-center text-sm text-slate-500 font-medium px-4">
                                Bé hãy nghe lại bản ghi âm. Nếu hài lòng, chọn người chấm và nhấn <strong className="text-emerald-600">Gửi Bài Chấm</strong>. Chưa ưng thì nhấn ↻ để ghi lại nhé!
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border-2 border-slate-200 p-1 flex items-center justify-center my-2">
                                <span className="text-xs font-black text-slate-400 px-3 uppercase hidden sm:inline-block">{normalizeDisplayText('Chọn người chấm:')}</span>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => setTutorId('ai')}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${tutorId === 'ai' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
                                    >
                                        Gia sư AI
                                    </button>
                                    <button
                                        onClick={() => setTutorId('tutor-1')}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${tutorId === 'tutor-1' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
                                    >
                                        Gia sư 1
                                    </button>
                                    <button
                                        onClick={() => setTutorId('tutor-2')}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${tutorId === 'tutor-2' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
                                    >
                                        Gia sư 2
                                    </button>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={handleSubmit}
                                disabled={disabled}
                                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black text-lg rounded-[32px] shadow-xl flex items-center justify-center gap-3 hover:from-emerald-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed border-b-4 border-emerald-700"
                            >
                                <Send size={20} />
                                {normalizeDisplayText('Gửi Bài Chấm')}
                            </motion.button>
                        </div>
                    )}

                    <div className="w-full max-w-2xl rounded-[32px] border-2 border-slate-200 bg-white p-5">
                        <div className="mb-3 text-center text-xs font-black uppercase tracking-widest text-slate-400">
                            {normalizeDisplayText('Không dùng mic? Nhập phần con muốn nói')}
                        </div>
                        <textarea
                            value={textFallback}
                            onChange={(e) => setTextFallback(e.target.value)}
                            disabled={disabled}
                            placeholder={
                                mode === 'reading'
                                    ? 'Con có thể gõ lại phần con đã đọc hoặc ghi chú nội dung chính...'
                                    : 'Con gõ nhanh ý chính hoặc bài nói của con vào đây...'
                            }
                            className="min-h-[120px] w-full resize-y rounded-[32px] border-2 border-slate-200 bg-slate-50 px-4 py-3 text-base font-medium text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white"
                        />
                        <button
                            type="button"
                            onClick={() => onSubmitResponse?.({ textAnswer: textFallback.trim(), tutorId })}
                            disabled={disabled || !textFallback.trim()}
                            className="mt-4 w-full rounded-[32px] bg-slate-900 px-5 py-3 text-base font-black text-white transition-all hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {normalizeDisplayText('Gửi Bài Bằng Chữ')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
