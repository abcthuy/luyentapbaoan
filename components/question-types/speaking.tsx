"use client";
import React, { useState } from 'react';
import { Lightbulb, Mic, Square, Play, RefreshCw, Volume2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRecording } from '@/hooks/use-recording';

interface SpeakingQuestionProps {
    text?: string;       // Content to read
    topic?: string;      // Topic to discuss
    hint?: string;       // Dynamic hint/outline
    mode: 'reading' | 'speaking';
    onSubmitRecording?: (audioBlob: Blob) => void;
    disabled?: boolean;
}

export const SpeakingQuestion: React.FC<SpeakingQuestionProps> = ({
    text,
    topic,
    hint,
    mode,
    disabled,
    onSubmitRecording
}) => {
    const [showHint, setShowHint] = useState(false);
    const recorder = useRecording();

    const handleSubmit = () => {
        if (recorder.audioBlob) {
            onSubmitRecording?.(recorder.audioBlob);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
            {/* 1. Context / Stage Area */}
            <div className="bg-white rounded-[40px] shadow-xl border-4 border-slate-100 overflow-hidden relative">
                {/* Content Body */}
                <div className="p-6 md:p-8 pb-8">
                    {mode === 'reading' && (
                        <div className="space-y-6">
                            <p className="text-2xl md:text-4xl font-black text-slate-800 leading-normal text-center whitespace-pre-line">
                                {text}
                            </p>
                        </div>
                    )}

                    {mode === 'speaking' && (
                        <div className="space-y-6">
                            <div className="p-8 bg-amber-50 rounded-3xl border-2 border-amber-100 text-center">
                                <p className="text-2xl md:text-3xl font-black text-amber-800 leading-tight">
                                    {topic || text}
                                </p>
                            </div>

                            {/* Scaffolding / Hints */}
                            <div className="flex flex-col items-center">
                                <button
                                    onClick={() => setShowHint(!showHint)}
                                    className="flex items-center gap-2 text-amber-600 font-bold hover:text-amber-700 transition-colors"
                                >
                                    <Lightbulb size={20} />
                                    {showHint ? 'Ẩn gợi ý' : 'Xem gợi ý dàn ý'}
                                </button>

                                <AnimatePresence>
                                    {showHint && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden w-full max-w-lg"
                                        >
                                            <div className="mt-4 p-6 bg-white rounded-2xl border-2 border-slate-100 text-slate-600 space-y-2 whitespace-pre-line text-left leading-relaxed">
                                                {hint ? (
                                                    <p>{hint}</p>
                                                ) : (
                                                    <>
                                                        <p><strong className="text-indigo-600">1. Mở bài:</strong> Giới thiệu vấn đề và quan điểm của con.</p>
                                                        <p><strong className="text-indigo-600">2. Thân bài:</strong></p>
                                                        <ul className="list-disc list-inside pl-4 space-y-1 text-sm">
                                                            <li>Lý do thứ nhất...</li>
                                                            <li>Lý do thứ hai...</li>
                                                            <li>Ví dụ minh họa...</li>
                                                        </ul>
                                                        <p><strong className="text-indigo-600">3. Kết luận:</strong> Khẳng định lại ý kiến và lời khuyên.</p>
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

                {/* Recording Controls Area - Integrated */}
                <div className="bg-slate-50 p-8 border-t-2 border-slate-100 flex flex-col items-center gap-6">
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
                                {recorder.isRecording ? `Đang ghi âm (${recorder.duration}s)...` : 'Nhấn để bắt đầu nói'}
                            </span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-6 w-full max-w-md">
                            {/* Playback Card */}
                            <div className="w-full bg-white rounded-2xl p-4 border-2 border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={recorder.playRecording}
                                        className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all"
                                    >
                                        {recorder.isPlayingBack ? <Volume2 className="animate-pulse" size={20} /> : <Play fill="currentColor" size={20} />}
                                    </button>
                                    <div>
                                        <div className="font-black text-slate-800 text-sm">Bản ghi âm của bé</div>
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

                            {/* Instruction text */}
                            <div className="text-center text-sm text-slate-500 font-medium px-4">
                                🎧 Bé hãy nghe lại bản ghi âm. Nếu hài lòng, nhấn <strong className="text-emerald-600">Gửi Bài Chấm</strong>. Chưa ưng thì nhấn ↻ để ghi lại nhé!
                            </div>

                            {/* Submit Button */}
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={handleSubmit}
                                disabled={disabled}
                                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black text-lg rounded-2xl shadow-xl flex items-center justify-center gap-3 hover:from-emerald-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed border-b-4 border-emerald-700"
                            >
                                <Send size={20} />
                                Gửi Bài Chấm
                            </motion.button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
