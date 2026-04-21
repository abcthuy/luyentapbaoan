"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProgress } from '@/components/progress-provider';
import { generateQuestion, resetQuestionSessionTracker } from '@/lib/content/registry';
import { BackButton } from '@/components/ui/back-button';
import { Question } from '@/lib/content/types';
import { updateMastery, updateDailyStreak } from '@/lib/mastery';
import { calculateReward } from '@/lib/scoring';
import { isSkillAvailableForGrade, SKILL_MAP, SkillId } from '@/lib/skills';
import { CheckCircle2, XCircle, Loader2, ChevronRight, Trophy, PauseCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '@/hooks/use-sound';
import confetti from 'canvas-confetti';
import { Feedback } from '@/lib/types/game';
import { GameContainer } from '@/components/games/GameContainer';
import { addToReviewQueue } from '@/lib/spaced-repetition';
import { checkNewBadges, applyNewBadges } from '@/lib/badges';
import { BadgeDisplay } from '@/components/BadgeDisplay';
import { isAnswerCorrect } from '@/lib/answer-check';
import { normalizeDisplayText } from '@/lib/text';
import { EvaluatorPersona, evaluateReadingLocally } from '@/lib/mock-evaluator';

export default function PracticeClient() {
    type EvaluationFeedback = Feedback & { quality?: string };

    const params = useParams();
    const router = useRouter();
    const skillId = params.skillId as SkillId;

    const { progress, updateLocalProgress, activeProfile } = useProgress();
    const { play } = useSound();
    const currentGrade = activeProfile?.grade || 2;

    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [answer, setAnswer] = useState('');
    const [feedback, setFeedback] = useState<EvaluationFeedback | null>(null);
    const [evaluating, setEvaluating] = useState(false);
    const [, setSeenPrompts] = useState<Set<string>>(new Set());

    // Practice Session Stats
    const [sessionCorrect, setSessionCorrect] = useState(0);
    const [sessionTotal, setSessionTotal] = useState(0);
    const [streak, setStreak] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [sessionEarnings, setSessionEarnings] = useState(0);

    // Track initial mastery
    const [startMastery, setStartMastery] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
    const [newBadgeIds, setNewBadgeIds] = useState<string[]>([]);

    const hasLoadedRef = React.useRef(false);
    const isMountedRef = React.useRef(true);

    // Cleanup on unmount
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Play complete sound exactly once when finished
    useEffect(() => {
        if (isFinished && sessionCorrect > 0) {
            play('complete');
        }
    }, [isFinished, sessionCorrect, play]);

    const getRequestedLevelCap = useCallback((questionSkillId: SkillId) => {
        const info = SKILL_MAP[questionSkillId];
        if (!info) return 5;
        if (info.subjectId === 'english') return 2;
        return 5;
    }, []);

    const nextQuestion = useCallback(async () => {
        if (!progress || isLoadingQuestion) return;

        if (sessionTotal >= 10) {
            setIsFinished(true);
            return;
        }

        setIsLoadingQuestion(true);

        // === ADAPTIVE DIFFICULTY ===
        let skillLevel = progress.skills?.[skillId]?.level || 1;
        const sessionLevelBonus = Math.floor(sessionTotal / 3);
        skillLevel = Math.min(skillLevel + sessionLevelBonus, 5);

        const skillInfo = SKILL_MAP[skillId];
        if (!skillInfo || !isSkillAvailableForGrade(skillInfo, currentGrade)) {
            setIsLoadingQuestion(false);
            router.push('/subjects');
            return;
        }

        const currentAccuracy = sessionTotal > 0 ? (sessionCorrect / sessionTotal) : 1;
        const adaptiveLevelBonus =
            sessionTotal >= 8 && currentAccuracy >= 0.9 ? 2 :
                sessionTotal >= 5 && currentAccuracy >= 0.8 ? 1 : 0;
        skillLevel = Math.min(skillLevel + adaptiveLevelBonus, 5);
        skillLevel = Math.min(skillLevel, getRequestedLevelCap(skillId));

        try {
            const newQ = await generateQuestion(skillInfo.subjectId as 'math' | 'english' | 'vietnamese' | 'finance', skillId, skillLevel);
            if (!isMountedRef.current) return;

            if (newQ && newQ.content?.text && !newQ.id.startsWith('err-')) {
                setCurrentQuestion(newQ);
                setSeenPrompts(prev => {
                    const next = new Set(prev);
                    next.add(newQ.content.text);
                    return next;
                });
                setAnswer('');
                setFeedback(null);
                setShowHint(false);
            } else {
                setCurrentQuestion({
                    id: `err-${Date.now()}`,
                    subjectId: skillInfo.subjectId || 'vietnamese',
                    skillId,
                    type: 'mcq',
                    instruction: 'Đang tải...',
                    content: { text: 'Hệ thống đang bận, bé thử lại sau nhé!' },
                    answer: '0'
                });
            }
        } catch (e) {
            console.error('Question loading failed:', e);
        } finally {
            if (isMountedRef.current) setIsLoadingQuestion(false);
        }
    }, [currentGrade, getRequestedLevelCap, isLoadingQuestion, play, progress, router, sessionCorrect, sessionTotal, skillId]);

    // Skill reset effect
    useEffect(() => {
        resetQuestionSessionTracker();

        hasLoadedRef.current = false;
        setIsFinished(false);
        setSessionTotal(0);
        setSessionCorrect(0);
        setStreak(0);
        setSessionEarnings(0);
        setFeedback(null);
        setEvaluating(false);
    }, [skillId]);

    useEffect(() => {
        if (!progress || !skillId) return;
        if (!hasLoadedRef.current) {
            setStartMastery(progress.skills?.[skillId]?.mastery || 0);
            nextQuestion();
            hasLoadedRef.current = true;
        }
    }, [nextQuestion, progress, skillId]);

    const blobToBase64 = (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                const base64Data = base64String.split(',')[1];
                resolve(base64Data);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const submitAnswer = async (selectedAnswer?: string, audioBlob?: Blob, transcript?: string, selectedTutorId?: string, recordingDuration?: number) => {
        const finalAnswer = selectedAnswer !== undefined ? selectedAnswer : answer;
        if (!finalAnswer && !transcript && !audioBlob) return;
        if (evaluating || feedback) return;

        setEvaluating(true);

        const isSpeakingOrReading = currentQuestion?.type === 'speaking' || currentQuestion?.type === 'reading';
        let isCorrect = false;

        if (isSpeakingOrReading) {
            isCorrect = false; // Wait for AI
        } else {
            isCorrect = currentQuestion ? isAnswerCorrect(currentQuestion, finalAnswer) : false;
        }

        if (isCorrect) {
            play('correct');
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
            setSessionCorrect(prev => prev + 1);
            setStreak(prev => prev + 1);
        } else if (!isSpeakingOrReading) {
            play('wrong');
            setStreak(0);
        }
        setSessionTotal(prev => prev + 1);

        const localFeedback = {
            isCorrect,
            explain: isCorrect
                ? normalizeDisplayText(currentQuestion?.explanation || 'Chính xác! Giỏi lắm!')
                : normalizeDisplayText(`Chưa đúng rồi. Đáp án là: ${currentQuestion?.answer}. ${currentQuestion?.explanation || ''}`),
            microLesson: !isCorrect ? normalizeDisplayText(currentQuestion?.hint || '') : ''
        };

        let quality = '';

        if (isSpeakingOrReading) {
            const actualTutorId = selectedTutorId || 'ai';
            if (actualTutorId !== 'ai') {
                // Local Heuristic Evaluation (Không dùng AI)
                const expectedText = currentQuestion?.content?.text || currentQuestion?.content?.audio || '';
                const actualDuration = recordingDuration || Math.max(3, (transcript || finalAnswer).split(' ').length / 1.5);
                
                const localRes = evaluateReadingLocally(actualTutorId as EvaluatorPersona, transcript || finalAnswer, expectedText, actualDuration);
                
                isCorrect = localRes.isCorrect;
                quality = localRes.quality;
                
                setFeedback({
                    ...localRes,
                    explain: normalizeDisplayText(localRes.explain),
                    microLesson: normalizeDisplayText(localRes.microLesson)
                });
            } else {
                // AI Evaluation
                try {
                    const body: any = {
                        prompt: currentQuestion?.content.text,
                        studentAnswer: finalAnswer,
                        correctAnswer: currentQuestion?.answer,
                        skillId: currentQuestion?.skillId,
                    };

                if (audioBlob) {
                    body.audioData = await blobToBase64(audioBlob);
                    body.mimeType = audioBlob.type || 'audio/webm';
                }

                const res = await fetch('/api/evaluate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });
                
                const aiResponse = await res.json();
                
                if (!isMountedRef.current || isFinished) return;

                if (typeof aiResponse?.isCorrect === 'boolean') {
                    isCorrect = aiResponse.isCorrect;
                }
                if (aiResponse?.quality) quality = aiResponse.quality;

                setFeedback(aiResponse ? { ...aiResponse, explain: normalizeDisplayText(aiResponse.explain || localFeedback.explain), microLesson: normalizeDisplayText(aiResponse.microLesson || '') } : localFeedback);
            } catch (e) {
                console.error('AI evaluate failed:', e);
                if (isMountedRef.current && !isFinished) setFeedback(localFeedback);
            }
        }
    } else {
        setFeedback(localFeedback);
    }

        if (isSpeakingOrReading && isMountedRef.current && !isFinished) {
            if (isCorrect) {
                play('correct');
                setSessionCorrect(prev => prev + 1);
                setStreak(prev => prev + 1);
            } else {
                play('wrong');
                setStreak(0);
            }
        }

        if (isMountedRef.current) setEvaluating(false);

        // Update Mastery
        if (progress && currentQuestion) {
            const currentSkillState = (progress.skills && progress.skills[currentQuestion.skillId]) || {
                skillId: currentQuestion.skillId,
                mastery: 0,
                stability: 0,
                lastSeen: new Date().toISOString(),
                attempts: 0,
                correctCount: 0,
                wrongStreak: 0,
                streak: 0,
                level: 1,
                lastCorrect: null
            };

            const updatedSkill = updateMastery(currentSkillState, isCorrect);
            let updatedProgress = {
                ...progress,
                skills: { ...(progress.skills || {}), [currentQuestion.skillId]: updatedSkill }
            };

            if (!isCorrect && currentQuestion.content?.text) {
                updatedProgress = addToReviewQueue(updatedProgress, currentQuestion.skillId, currentQuestion.content.text, currentQuestion.answer);
            }

            let earnedAmount = 0;
            if (isCorrect) {
                const currentSkillLevel = progress.skills?.[skillId]?.level || 1;
                const reward = calculateReward(currentQuestion.skillId, quality, currentSkillLevel);
                earnedAmount = reward.amount;

                // Streak Bonuses
                if (streak + 1 === 10) earnedAmount += 1000;
                else if (streak + 1 === 20) earnedAmount += 2000;
                else if (streak + 1 === 30) earnedAmount += 5000;
                
                if (streak + 1 >= 10 && (streak + 1) % 10 === 0) {
                    play('win');
                    confetti({ particleCount: 150, spread: 100, colors: ['#FFD700'] });
                }
            }

            setSessionEarnings(prev => prev + earnedAmount);
            updateLocalProgress(updatedProgress);

            if (sessionTotal + 1 === 10) {
                const finalEarnings = sessionEarnings + earnedAmount;
                let finalProgress = {
                    ...updatedProgress,
                    balance: (updatedProgress.balance || 0) + finalEarnings
                };
                finalProgress = updateDailyStreak(finalProgress);
                const newBadges = checkNewBadges(finalProgress);
                if (newBadges.length > 0) {
                    finalProgress = applyNewBadges(finalProgress, newBadges);
                    setNewBadgeIds(newBadges);
                    play('win');
                }
                updateLocalProgress(finalProgress);
            }
        }
    };

    const handleExit = () => {
        play('click');
        setEvaluating(false);
        setFeedback(null);
        setIsFinished(true);
    };

    if (!progress || !skillId || !SKILL_MAP[skillId]) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
                <h2 className="text-2xl font-black text-slate-400 mb-4">Không tìm thấy bài học này</h2>
                <button
                    onClick={() => router.push('/subjects')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-colors"
                >
                    Về danh sách môn học
                </button>
            </div>
        );
    }

    const skillInfo = SKILL_MAP[skillId];
    const skillLevel = progress.skills?.[skillId]?.level || 1;
    const activeLevel = Math.min(skillLevel + Math.floor(sessionTotal / 3), getRequestedLevelCap(skillId));
    const currentMastery = progress.skills?.[skillId]?.mastery || 0;
    const masteryGain = Math.round((currentMastery - startMastery) * 100);

    if (isFinished) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white max-w-lg w-full rounded-[40px] shadow-2xl p-8 md:p-12 text-center"
                >
                    <div className="flex justify-center mb-6">
                        <div className="bg-indigo-100 p-6 rounded-full text-indigo-600">
                            <Trophy size={60} />
                        </div>
                    </div>

                    <h1 className="text-3xl font-black text-slate-900 mb-2">Hoàn thành phiên luyện tập!</h1>
                    <p className="text-slate-500 font-medium mb-8">Bạn đã rất cố gắng hôm nay.</p>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100">
                            <div className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Số câu đúng</div>
                            <div className="text-4xl font-black text-emerald-600">{sessionCorrect}/{sessionTotal}</div>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100">
                            <div className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Tiến bộ</div>
                            <div className={`text-4xl font-black ${masteryGain >= 0 ? 'text-indigo-600' : 'text-slate-600'}`}>
                                {masteryGain > 0 ? '+' : ''}{masteryGain}%
                            </div>
                        </div>
                    </div>

                    {newBadgeIds.length > 0 && (
                        <div className="mb-8">
                            <div className="text-sm font-black text-orange-400 uppercase tracking-widest mb-4">Huy hiệu mới nhận!</div>
                            <BadgeDisplay progress={progress} newBadgeIds={newBadgeIds} />
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => router.push(`/today?subject=${skillInfo.subjectId}`)}
                            className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black text-xl hover:bg-black transition-all shadow-xl active:scale-95"
                        >
                            Về trang môn học
                        </button>
                        <button
                            onClick={() => {
                                setSessionTotal(0);
                                setSessionCorrect(0);
                                setStreak(0);
                                setSessionEarnings(0);
                                setFeedback(null);
                                setIsFinished(false);
                                hasLoadedRef.current = false;
                            }}
                            className="w-full py-4 rounded-2xl bg-white border-2 border-slate-200 text-slate-600 font-black text-lg hover:bg-slate-50 transition-all active:scale-95"
                        >
                            Luyện tiếp
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-6 md:py-10 min-h-screen bg-slate-50">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <BackButton onClick={handleExit} />
                            <div>
                                <h1 className="text-xl md:text-2xl font-black text-slate-800">{skillInfo.name}</h1>
                                <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                                    <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-md text-xs uppercase tracking-wider border border-orange-200">
                                        Level {activeLevel} ({activeLevel < 3 ? 'Cơ bản' : activeLevel < 5 ? 'Vận dụng' : 'Vận dụng cao'})
                                    </span>
                                    <span>• Chế độ Luyện tập</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {isLoadingQuestion ? (
                        <div className="w-full aspect-[4/3] bg-white rounded-3xl border-2 border-slate-100 flex flex-col items-center justify-center p-8 shadow-sm">
                            <Loader2 size={48} className="text-blue-500 animate-spin mb-4" />
                            <p className="text-slate-400 font-bold animate-pulse">Đang tải câu hỏi tiếp theo...</p>
                        </div>
                    ) : currentQuestion && (
                        <GameContainer
                            mode="standard"
                            question={currentQuestion}
                            answer={answer}
                            setAnswer={setAnswer}
                            submitAnswer={submitAnswer}
                            evaluating={evaluating}
                            feedback={feedback}
                            streak={streak}
                            play={play}
                        />
                    )}
                </div>

                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="bg-white rounded-3xl p-6 border-4 border-slate-100 shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                            <div className="text-left w-full">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-1">Tiến độ bài học</span>
                                <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                                    <div
                                        className="bg-blue-500 h-full rounded-full transition-all duration-500"
                                        style={{ width: `${((sessionTotal) / 10) * 100}%` }}
                                    />
                                </div>
                                <div className="text-right mt-1 text-slate-400 text-xs font-bold">{Math.min(sessionTotal + 1, 10)}/10</div>
                            </div>
                        </div>

                        <button
                            onClick={handleExit}
                            className="w-full py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-600 font-black hover:bg-slate-200 hover:text-slate-900 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <PauseCircle size={24} />
                            TẠM NGHỈ & LƯU LẠI
                        </button>
                    </div>

                    <div className="flex-1 min-h-[200px] relative">
                        <AnimatePresence mode="wait">
                            {feedback ? (
                                <motion.div
                                    key="feedback"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className={`h-full rounded-3xl p-6 border-4 shadow-xl flex flex-col ${feedback.isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        {feedback.isCorrect ? (
                                            <CheckCircle2 size={40} className="text-emerald-500" />
                                        ) : (
                                            <XCircle size={40} className="text-rose-500" />
                                        )}
                                        <span className={`text-2xl font-black ${feedback.isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                                            {feedback.isCorrect ? 'CHÍNH XÁC!' : 'SAI RỒI!'}
                                        </span>
                                    </div>

                                    <div className="flex-1 overflow-y-auto mb-4">
                                        <p className="text-lg font-bold text-slate-700 leading-relaxed mb-4">
                                            {normalizeDisplayText(feedback.explain)}
                                        </p>
                                        {!feedback.isCorrect && feedback.microLesson && (
                                            <div className="bg-white/60 p-4 rounded-xl border border-rose-200">
                                                <p className="text-sm text-rose-800 italic">{normalizeDisplayText(feedback.microLesson)}</p>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => {
                                            nextQuestion();
                                        }}
                                        className={`w-full py-4 rounded-2xl text-xl font-black text-white shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95 ${feedback.isCorrect ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'}`}
                                    >
                                        Tiếp tục <ChevronRight size={24} />
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="hint-area"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="h-full rounded-3xl border-4 border-dashed border-slate-200 bg-slate-50/50 p-6 flex flex-col items-center justify-center text-center"
                                >
                                    {showHint ? (
                                        <div className="bg-amber-100 p-6 rounded-2xl border-2 border-amber-200 w-full animate-in fade-in zoom-in">
                                            <span className="text-4xl mb-2 block">?</span>
                                            <p className="text-amber-900 font-bold text-lg">{normalizeDisplayText(currentQuestion?.hint)}</p>
                                        </div>
                                    ) : (
                                        <div className="opacity-50">
                                            <div className="text-6xl mb-4">...</div>
                                            <p className="font-bold text-slate-400">Đang chờ câu trả lời...</p>
                                            <button
                                                onClick={() => setShowHint(true)}
                                                className="mt-6 text-blue-500 font-black hover:text-blue-700 underline decoration-2 underline-offset-4"
                                            >
                                                Cần gợi ý?
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
