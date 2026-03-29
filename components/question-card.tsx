
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Question } from '@/lib/content/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Volume2, VolumeX, Pencil, Play, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { Scratchpad } from './ui/scratchpad';
import { VirtualNumPad } from './ui/virtual-numpad';
import { DragDropQuestion } from './question-types/drag-drop';
import { MatchingQuestion } from './question-types/matching';
import { DrawingQuestion } from './question-types/drawing';
import { SpeakingQuestion } from './question-types/speaking';
import { Feedback } from '@/lib/types/game';
import { SoundType } from '@/hooks/use-sound';

interface QuestionCardProps {
    question: Question;
    answer: string;
    setAnswer: (val: string) => void;
    submitAnswer: (val?: string, audioBlob?: Blob) => void;
    evaluating: boolean;
    feedback: Feedback | null;
    play: (sound: SoundType) => void;
}

// ========== TTS STORY LISTENER COMPONENT ==========
function StoryListener({ storyText, questionText, onReady }: {
    storyText: string;
    questionText: string;
    onReady: () => void;
}) {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [hasListened, setHasListened] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [showText, setShowText] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    // Voice & Speed settings
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoiceIdx, setSelectedVoiceIdx] = useState(0);
    const [speed, setSpeed] = useState(0.85);
    const speedOptions = [
        { label: '🐢 Chậm', value: 0.6 },
        { label: '🚶 Thường', value: 0.85 },
        { label: '🏃 Nhanh', value: 1.1 },
    ];

    // Load English voices
    useEffect(() => {
        if (typeof window === 'undefined' || !window.speechSynthesis) return;
        const loadVoices = () => {
            const all = window.speechSynthesis.getVoices();
            const en = all.filter(v => v.lang.startsWith('en'));
            if (en.length > 0) {
                setVoices(en);
                const pref = en.findIndex(v => v.name.includes('Google') || v.name.includes('Female') || v.name.includes('Samantha'));
                if (pref >= 0) setSelectedVoiceIdx(pref);
            }
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
        return () => { window.speechSynthesis?.cancel(); };
    }, []);

    const speak = useCallback(() => {
        if (typeof window === 'undefined' || !window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        setIsPaused(false);

        const utterance = new SpeechSynthesisUtterance(storyText);
        utterance.lang = 'en-US';
        utterance.rate = speed;
        utterance.pitch = 1.1;
        if (voices.length > 0 && voices[selectedVoiceIdx]) utterance.voice = voices[selectedVoiceIdx];

        utterance.onstart = () => { setIsSpeaking(true); setHasStarted(true); };
        utterance.onend = () => { setIsSpeaking(false); setIsPaused(false); setHasListened(true); onReady(); };
        utterance.onerror = () => { setIsSpeaking(false); setIsPaused(false); setHasListened(true); onReady(); };

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    }, [storyText, onReady, speed, voices, selectedVoiceIdx]);

    const pauseSpeaking = () => { window.speechSynthesis.pause(); setIsPaused(true); setIsSpeaking(false); };
    const resumeSpeaking = () => { window.speechSynthesis.resume(); setIsPaused(false); setIsSpeaking(true); };
    const stopSpeaking = () => { window.speechSynthesis.cancel(); setIsSpeaking(false); setIsPaused(false); };

    return (
        <div className="w-full mb-6">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-4"
            >
                {/* Speaker Icon */}
                <div className={`relative p-6 rounded-full transition-all duration-500 ${isSpeaking ? 'bg-gradient-to-br from-blue-500 to-purple-600' :
                    isPaused ? 'bg-amber-500' :
                        hasListened ? 'bg-emerald-500' :
                            'bg-slate-300'
                    }`}>
                    {isSpeaking && (
                        <>
                            <motion.div
                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="absolute inset-0 rounded-full bg-blue-400/30"
                            />
                            <motion.div
                                animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                                className="absolute inset-0 rounded-full bg-purple-400/20"
                            />
                        </>
                    )}
                    <Volume2 size={40} className="text-white relative z-10" />
                </div>

                {/* Status Text */}
                <div className="text-center">
                    {isSpeaking ? (
                        <motion.p
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-lg font-black text-blue-600"
                        >
                            🎧 Đang đọc truyện... Bé lắng nghe nhé!
                        </motion.p>
                    ) : isPaused ? (
                        <p className="text-lg font-black text-amber-600">
                            ⏸️ Đã dừng — Bấm &quot;Nghe tiếp&quot; khi bé sẵn sàng!
                        </p>
                    ) : hasListened ? (
                        <p className="text-lg font-black text-emerald-600">
                            ✅ Đã nghe xong! Bé trả lời câu hỏi bên dưới nhé!
                        </p>
                    ) : (
                        <p className="text-lg font-bold text-slate-500">
                            🎧 Bấm nút bên dưới khi bé sẵn sàng nghe truyện!
                        </p>
                    )}
                </div>

                {/* ⚙️ Voice & Speed Settings — only before start or when paused */}
                {(!hasStarted || isPaused) && (
                    <div className="w-full max-w-sm">
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="flex items-center gap-2 mx-auto px-4 py-2 rounded-xl bg-slate-50 text-slate-500 text-xs font-bold hover:bg-slate-100 transition-all"
                        >
                            ⚙️ {showSettings ? 'Ẩn cài đặt' : 'Giọng đọc & Tốc độ'}
                        </button>
                        <AnimatePresence>
                            {showSettings && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="mt-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                                        {/* Voice */}
                                        {voices.length > 0 && (
                                            <div>
                                                <label className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1 block">🎤 Giọng đọc</label>
                                                <select
                                                    value={selectedVoiceIdx}
                                                    onChange={(e) => setSelectedVoiceIdx(Number(e.target.value))}
                                                    className="w-full rounded-xl border-2 border-slate-200 bg-white p-2.5 text-sm font-bold text-slate-700 outline-none focus:border-blue-400"
                                                >
                                                    {voices.map((v, i) => (
                                                        <option key={i} value={i}>{v.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                        {/* Speed */}
                                        <div>
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 block">⏱️ Tốc độ</label>
                                            <div className="flex gap-2">
                                                {speedOptions.map((opt) => (
                                                    <button
                                                        key={opt.value}
                                                        onClick={() => setSpeed(opt.value)}
                                                        className={`flex-1 py-2 rounded-xl font-black text-xs transition-all ${speed === opt.value
                                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                                            : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-blue-300'
                                                            }`}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {/* Controls */}
                <div className="flex flex-wrap gap-3 justify-center">
                    {!hasStarted && !isSpeaking && !isPaused ? (
                        /* === BIG START BUTTON === */
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={speak}
                            className="flex items-center gap-3 px-8 py-4 rounded-3xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-black text-lg shadow-xl hover:shadow-2xl transition-all"
                        >
                            <Play size={24} fill="white" /> Sẵn sàng nghe! 🎧
                        </motion.button>
                    ) : isSpeaking ? (
                        /* === PLAYING: Pause + Stop === */
                        <button
                            onClick={pauseSpeaking}
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-100 text-amber-700 font-black text-sm hover:bg-amber-200 transition-all active:scale-95"
                        >
                            <VolumeX size={18} /> Dừng lại
                        </button>
                    ) : isPaused ? (
                        /* === PAUSED: Resume + Restart === */
                        <>
                            <button
                                onClick={resumeSpeaking}
                                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-100 text-emerald-700 font-black text-sm hover:bg-emerald-200 transition-all active:scale-95"
                            >
                                <Play size={18} /> Nghe tiếp
                            </button>
                            <button
                                onClick={() => { stopSpeaking(); speak(); }}
                                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-100 text-blue-600 font-black text-sm hover:bg-blue-200 transition-all active:scale-95"
                            >
                                <RotateCcw size={18} /> Nghe lại từ đầu
                            </button>
                        </>
                    ) : (
                        /* === FINISHED: Replay === */
                        <button
                            onClick={speak}
                            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-100 text-blue-600 font-black text-sm hover:bg-blue-200 transition-all active:scale-95"
                        >
                            <RotateCcw size={18} /> Nghe lại
                        </button>
                    )}
                    <button
                        onClick={() => setShowText(!showText)}
                        className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 text-slate-600 font-black text-sm hover:bg-slate-200 transition-all active:scale-95"
                    >
                        {showText ? <EyeOff size={18} /> : <Eye size={18} />}
                        {showText ? 'Ẩn truyện' : 'Xem truyện'}
                    </button>
                </div>

                {/* Story Text (toggleable) */}
                <AnimatePresence>
                    {showText && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="w-full overflow-hidden"
                        >
                            <div className="mt-2 p-6 bg-blue-50 rounded-3xl border-2 border-blue-100 text-left">
                                <p className="text-base md:text-lg font-bold text-slate-700 whitespace-pre-line leading-relaxed">
                                    📖 {storyText}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Question */}
                {hasListened && questionText && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full mt-2"
                    >
                        <div className="text-2xl md:text-3xl font-black text-indigo-700 text-center px-4">
                            ❓ {questionText}
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}

// ========== HELPER: Parse Story Quest text ==========
function parseStoryText(fullText: string): { storyText: string; questionText: string } | null {
    if (!fullText) return null;

    // Pattern: "📖 Story:\n\"...\"\n\n❓ ..." or "✏️ ..." or "🤔 ..."
    // Try splitting by any of the question markers
    const markers = ['❓', '✏️', '🤔'];
    let storyPart = '';
    let questionPart = '';
    let found = false;

    for (const marker of markers) {
        const idx = fullText.indexOf(marker);
        if (idx >= 0) {
            storyPart = fullText.substring(0, idx);
            questionPart = fullText.substring(idx + marker.length).trim();
            found = true;
            break;
        }
    }

    if (!found) {
        // Fallback: try to split on "Story:" and take everything after the quoted text
        const storyMatch = fullText.match(/📖\s*Story:\s*\n?"([^"]+)"/);
        if (storyMatch) {
            storyPart = storyMatch[0];
            questionPart = fullText.substring(fullText.indexOf(storyMatch[0]) + storyMatch[0].length).trim();
            found = true;
        }
    }

    if (!found) return null;

    // Clean story text: remove "📖 Story:\n" prefix and quotes
    storyPart = storyPart
        .replace(/📖\s*Story:\s*/i, '')
        .replace(/^[""\n]+|[""\n]+$/g, '')
        .trim();

    // Clean question text: remove "(Type your answer)" suffix
    questionPart = questionPart
        .replace(/\(Type your answer\)/i, '')
        .trim();

    return { storyText: storyPart, questionText: questionPart };
}

function isNumericInputQuestion(question: Question): boolean {
    if (question.type !== 'input') return false;
    if (question.subjectId !== 'math' && question.subjectId !== 'finance') return false;

    const normalizedAnswer = (question.answer || '')
        .toLowerCase()
        .replace(/\s+/g, '');

    if (!normalizedAnswer) return false;

    return /^[-+]?[\d.,/%()*/]+(?:cm|mm|m|km|g|kg|ml|l|đ|dong)?$/.test(normalizedAnswer);
}

export function QuestionCard({
    question,
    answer,
    setAnswer,
    submitAnswer,
    evaluating,
    feedback,
    play
}: QuestionCardProps) {
    const [showScratchpad, setShowScratchpad] = useState(false);
    const [showNumPad, setShowNumPad] = useState(false);
    const [readyStoryQuestionId, setReadyStoryQuestionId] = useState<string | null>(null);

    const isStoryQuest = question.skillId?.includes('story-quest');
    const isListening = question.type === 'listening';
    const parsedStory = isStoryQuest ? parseStoryText(question.content.text || '') : 
                        isListening ? { storyText: question.content.audio || question.content.text || '', questionText: '' } : null;
    const showTTSListener = !!parsedStory && (isStoryQuest || isListening);
    const usesVirtualNumPad = isNumericInputQuestion(question);

    const storyReady = readyStoryQuestionId === question.id;

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={question.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="bg-white rounded-[40px] border-4 border-slate-100 p-6 md:p-12 shadow-2xl flex-1 flex flex-col justify-center min-h-[500px] relative overflow-hidden"

            >
                {/* Tools Toggle */}
                <div className="absolute top-4 right-4 flex gap-2 z-40">
                    <button
                        onClick={() => setShowScratchpad(!showScratchpad)}
                        className={`p-3 rounded-xl transition-all ${showScratchpad ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                        title="Bảng nháp"
                    >
                        <Pencil size={20} />
                    </button>
                </div>

                {/* Scratchpad Overlay */}
                {showScratchpad && (
                    <Scratchpad onClose={() => setShowScratchpad(false)} />
                )}
                {/* Question Header - Always show instruction if present */}
                <div className="flex flex-col items-center justify-center w-full">
                    {question.instruction && (
                        <div className="text-sm md:text-lg font-black mb-6 text-center text-slate-400 uppercase tracking-widest border-b-2 border-slate-100 pb-2">
                            {question.instruction}
                        </div>
                    )}

                    {/* STORY QUEST & LISTENING: TTS Listener */}
                    {showTTSListener && parsedStory ? (
                        <StoryListener
                            storyText={parsedStory.storyText}
                            questionText={parsedStory.questionText}
                            onReady={() => setReadyStoryQuestionId(question.id)}
                        />
                    ) : (
                        /* Normal question text display */
                        ((question.type as string) !== 'speaking' && (question.type as string) !== 'reading') && (
                            <div className={`font-black mb-10 text-center text-indigo-700 leading-snug w-full px-4 whitespace-pre-line ${(question.content.text?.length || 0) > 200 ? 'text-lg md:text-xl text-left font-bold' : (question.content.text?.length || 0) > 50 ? 'text-2xl md:text-4xl text-left md:text-center' : 'text-4xl md:text-6xl'}`}>
                                {question.content.text}
                            </div>
                        )
                    )}
                </div>

                {/* Interactions - For Story Quest & Listening, only show options after listening */}
                {(!showTTSListener || storyReady) && (
                    <>
                        {question.type === 'mcq' || question.type === 'listening' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                {question.content.options?.map((opt) => (
                                    <button
                                        key={opt}
                                        onClick={() => {
                                            play('click');
                                            submitAnswer(opt);
                                        }}
                                        disabled={evaluating || !!feedback}
                                        className={`rounded-2xl border-4 p-6 text-xl md:text-3xl font-black transition-all transform hover:-translate-y-1 hover:shadow-lg active:translate-y-0 ${feedback && opt === question.answer ? 'border-emerald-500 bg-emerald-100 text-emerald-700 shadow-emerald-200' :
                                            feedback && opt === answer && opt !== question.answer ? 'border-rose-500 bg-rose-100 text-rose-700 shadow-rose-200' :
                                                'border-slate-100 bg-slate-50 text-slate-700 hover:border-blue-400 hover:bg-white'
                                            }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        ) : question.type === 'drag-drop' ? (
                            <div className="flex flex-col items-center gap-6 w-full">
                                <DragDropQuestion
                                    items={question.content.items || []}
                                    onReorder={(newOrder) => setAnswer(newOrder.join(','))}
                                    disabled={evaluating || !!feedback}
                                />
                                <button
                                    onClick={() => submitAnswer()}
                                    disabled={!answer || evaluating}
                                    className="rounded-3xl bg-slate-900 px-12 py-4 text-xl font-black text-white shadow-xl hover:bg-blue-600 hover:shadow-blue-200 active:scale-95 transition-all mt-4"
                                >
                                    Chốt Đáp Án
                                </button>
                            </div>
                        ) : ((question.type as string) === 'speaking' || (question.type as string) === 'reading') ? (
                            <div className="flex flex-col items-center gap-6 w-full">
                                <SpeakingQuestion
                                    text={question.content.text}
                                    topic={question.content.text}
                                    hint={question.hint}
                                    mode={question.type as 'speaking' | 'reading'}
                                    onSubmitRecording={(blob) => {
                                        setAnswer("Đã ghi âm thành công");
                                        submitAnswer("Đã ghi âm thành công", blob);
                                    }}
                                    disabled={evaluating || !!feedback}
                                />
                            </div>
                        ) : question.type === 'match' ? (
                            <div className="flex flex-col items-center gap-6 w-full">
                                <MatchingQuestion
                                    pairs={question.content.pairs || []}
                                    onMatch={(matches) => {
                                        setAnswer(matches.join(','));
                                    }}
                                    disabled={evaluating || !!feedback}
                                />
                                <button
                                    onClick={() => submitAnswer()}
                                    disabled={!answer || evaluating}
                                    className="rounded-3xl bg-slate-900 px-12 py-4 text-xl font-black text-white shadow-xl hover:bg-blue-600 hover:shadow-blue-200 active:scale-95 transition-all mt-4"
                                >
                                    Nộp Bài
                                </button>
                            </div>
                        ) : question.type === 'drawing' ? (
                            <div className="flex flex-col items-center gap-6 w-full">
                                <DrawingQuestion
                                    mode={question.content.drawingMode || 'coloring'}
                                    onAnswer={(data) => setAnswer(data)}
                                    disabled={evaluating || !!feedback}
                                    content={{
                                        totalParts: 4,
                                        cols: 2
                                    }}
                                />
                                <button
                                    onClick={() => submitAnswer()}
                                    disabled={!answer || evaluating}
                                    className="rounded-3xl bg-slate-900 px-12 py-4 text-xl font-black text-white shadow-xl hover:bg-blue-600 hover:shadow-blue-200 active:scale-95 transition-all mt-4"
                                >
                                    Hoàn Thành
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-6 w-full max-w-lg mx-auto">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={answer}
                                        onChange={(e) => setAnswer(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && submitAnswer()}
                                        onFocus={() => {
                                            if (usesVirtualNumPad) {
                                                setShowNumPad(true);
                                            }
                                        }}
                                        onClick={() => {
                                            if (usesVirtualNumPad) {
                                                setShowNumPad(true);
                                            }
                                        }}
                                        disabled={evaluating || !!feedback}
                                        readOnly={usesVirtualNumPad}
                                        inputMode={usesVirtualNumPad ? 'none' : 'text'}
                                        className="w-full rounded-3xl border-4 border-slate-200 bg-slate-50 p-6 text-center text-5xl md:text-7xl font-black outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all text-slate-800 placeholder-slate-300"
                                        placeholder="?"
                                        autoFocus
                                    />
                                </div>

                                {/* Virtual NumPad */}
                                <AnimatePresence>
                                    {usesVirtualNumPad && showNumPad && !feedback && !evaluating && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                        >
                                            <VirtualNumPad
                                                value={answer}
                                                onChange={setAnswer}
                                                onSubmit={() => submitAnswer()}
                                                disabled={evaluating || !!feedback}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Chỉ hiện nút "Trả lời" khi bảng số KHÔNG hiện */}
                                {!usesVirtualNumPad && !feedback && !evaluating && (
                                    <button
                                        onClick={() => submitAnswer()}
                                        disabled={!answer || evaluating}
                                        className="rounded-3xl bg-slate-900 p-6 text-2xl font-black text-white shadow-xl hover:bg-blue-600 hover:shadow-blue-200 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Trả lời
                                    </button>
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* Loading State Overlay */}
                {evaluating && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                        <Loader2 size={60} className="text-blue-600 animate-spin mb-4" />
                        <p className="text-xl font-black text-blue-800 animate-pulse">Đang chấm bài...</p>
                    </div>
                )}
            </motion.div>
        </AnimatePresence >
    );
}

