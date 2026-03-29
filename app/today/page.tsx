"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useProgress } from '@/components/progress-provider';
import { generateQuestion } from '@/lib/content/registry';
import { Question } from '@/lib/content/types';
import { selectNextSkill } from '@/lib/selector';
import { updateMastery, getOverallRank, updateDailyStreak } from '@/lib/mastery';
import { isSkillAvailableForGrade, SkillId, SKILL_MAP } from '@/lib/skills';
import { getTheme } from '@/lib/theme';
import {
    CheckCircle2, XCircle, Trophy,
    Zap, Star, Clock, ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '@/hooks/use-sound';
import confetti from 'canvas-confetti';
import { QuestionCard } from '@/components/question-card';
import { useSearchParams, useRouter } from 'next/navigation';
import { UserMenu } from '@/components/user-menu';
import { BackButton } from '@/components/ui/back-button';
import { addToReviewQueue } from '@/lib/spaced-repetition';
import { checkNewBadges, applyNewBadges } from '@/lib/badges';
import { WalletButton } from '@/components/ui/wallet-button';
import toast from 'react-hot-toast';
import { getUnlockStatus } from '@/lib/unlock';
import { Feedback } from '@/lib/types/game';

export default function TodayPage() {
    type EvaluationFeedback = Feedback & { quality?: string };

    const router = useRouter();
    const searchParams = useSearchParams();
    const subjectId = searchParams.get('subject');

    // Title Logic
    const getTitle = () => {
        if (!subjectId) return "Nhà Thông Thái Nhí";
        const map: Record<string, string> = {
            'math': 'Nhà Toán Học Nhí 🧮',
            'vietnamese': 'Nhà Văn Nhí ✍️',
            'english': 'Nhà Ngôn Ngữ Học 🌍',
            'finance': 'Nhà Đầu Tư Nhí 💰'
        };
        return map[subjectId] || "Nhà Thông Thái Nhí";
    };
    const pageTitle = getTitle();

    const { progress, updateLocalProgress, activeProfile } = useProgress();
    const { play } = useSound();
    const currentGrade = activeProfile?.grade || 2;

    // Subject Lock: Prevent direct URL access to locked subjects (mastery-based)
    useEffect(() => {
        if (!progress || !subjectId) return;
        const status = getUnlockStatus(progress, subjectId, currentGrade);
        if (!status.unlocked) {
            const missingReqs = status.requirements.filter(r => !r.met);
            const msg = missingReqs.map(r => `${r.subjectName}: ${r.currentPercent}%/${r.requiredPercent}%`).join(', ');
            toast.error(`Chưa đủ điều kiện! ${msg}`, {
                icon: '🔒',
                style: { borderRadius: '20px', background: '#333', color: '#fff', fontWeight: 'bold' }
            });
            setTimeout(() => router.push('/subjects'), 100);
        }
    }, [currentGrade, progress, subjectId, router]);

    // Game State
    const [sessionActive, setSessionActive] = useState(false);
    const [gameMode, setGameMode] = useState<{ total: number, time: number, level: number } | null>(null); // Added level

    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [answer, setAnswer] = useState('');
    const [feedback, setFeedback] = useState<EvaluationFeedback | null>(null);
    const [evaluating, setEvaluating] = useState(false);

    const [count, setCount] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);

    // Timer
    const [timeLeft, setTimeLeft] = useState(0);
    const [timeInSeconds, setTimeInSeconds] = useState(0); // Elapsed

    const [isFinished, setIsFinished] = useState(false);
    const [aiSummary, setAiSummary] = useState<string>('');

    // Internal logic for question selection
    const [, setCurrentBucket] = useState<string>('mixed');
    const [sessionHistory, setSessionHistory] = useState<SkillId[]>([]);
    const [sessionCorrect, setSessionCorrect] = useState(0);
    const [sessionStreak, setSessionStreak] = useState(0);
    const [sessionEarnings, setSessionEarnings] = useState(0);

    // --- ACTIONS ---

    const formatTime = useCallback((seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    }, []);

    const getPerformanceReview = useCallback((correct: number, total: number, elapsedSeconds: number) => {
        const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
        const formattedTime = formatTime(elapsedSeconds);

        if (percent >= 90) {
            return {
                title: 'Xuất sắc!',
                summary: `Xuất sắc! Con đã trả lời đúng ${correct}/${total} câu trong ${formattedTime}. Thành tích tuyệt vời, cứ giữ vững phong độ này nhé! 🏆✨`,
            };
        }

        if (percent >= 70) {
            return {
                title: 'Rất giỏi!',
                summary: `Rất giỏi! ${correct}/${total} câu đúng trong ${formattedTime}. Con đã rất cố gắng, luyện thêm chút nữa sẽ hoàn hảo! 🌟💪`,
            };
        }

        if (percent >= 50) {
            return {
                title: 'Tốt lắm!',
                summary: `Tốt lắm! ${correct}/${total} câu đúng. Con đang tiến bộ mỗi ngày. Hãy ôn lại những bài chưa vững nhé! 📖🌈`,
            };
        }

        return {
            title: 'Cố lên nào!',
            summary: `Cố lên nào! ${correct}/${total} câu đúng. Không sao đâu, mỗi lần luyện tập con sẽ giỏi hơn. Thử lại nhé! 💪🌱`,
        };
    }, [formatTime]);

    const finishSession = useCallback(async () => {
        setIsFinished(true);
        play('complete');
        setSessionActive(false);
        const score = correctCount * 10;

        // === TEMPLATE TĨNH thay vì gọi AI ===
        const percent = gameMode ? Math.round((correctCount / gameMode.total) * 100) : 0;
        let summary = '';
        if (percent >= 90) {
            summary = `Xuất sắc! Con đã trả lời đúng ${correctCount}/${gameMode?.total} câu trong ${formatTime(timeInSeconds)}. Thành tích tuyệt vời, cứ giữ vững phong độ này nhé! 🏆✨`;
        } else if (percent >= 70) {
            summary = `Rất giỏi! ${correctCount}/${gameMode?.total} câu đúng trong ${formatTime(timeInSeconds)}. Con đã rất cố gắng, luyện thêm chút nữa sẽ hoàn hảo! 🌟💪`;
        } else if (percent >= 50) {
            summary = `Tốt lắm! ${correctCount}/${gameMode?.total} câu đúng. Con đang tiến bộ mỗi ngày. Hãy ôn lại những bài chưa vững nhé! 📖🌈`;
        } else {
            summary = `Cố lên nào! ${correctCount}/${gameMode?.total} câu đúng. Không sao đâu, mỗi lần luyện tập con sẽ giỏi hơn. Thử lại nhé! 💪🌱`;
        }
        setAiSummary(summary);
        const review = getPerformanceReview(correctCount, gameMode?.total || 0, timeInSeconds);
        setAiSummary(review.summary);

        if (progress) {
            const todayStr = new Date().toISOString().split('T')[0];
            const finalBestTime = (score >= (gameMode?.total || 30) * 10 && timeInSeconds < (progress.bestTimeSeconds || 999999))
                ? timeInSeconds
                : (progress.bestTimeSeconds || 999999);

            // CỘ TIỀN + STREAK + BADGES khi hoàn thành
            let finalProgress: typeof progress = {
                ...progress,
                lastSessionDate: todayStr,
                lastSessionCount: (progress.lastSessionCount || 0) + count,
                totalScore: (progress.totalScore || 0) + score,
                bestTimeSeconds: finalBestTime,
                balance: (progress.balance || 0) + sessionEarnings,
                updatedAt: new Date().toISOString()
            };

            // Update Daily Streak
            finalProgress = updateDailyStreak(finalProgress);

            // Check Badges
            const newBadges = checkNewBadges(finalProgress);
            if (newBadges.length > 0) {
                finalProgress = applyNewBadges(finalProgress, newBadges);
                play('win');
            }

            updateLocalProgress(finalProgress, true);
        }
    }, [correctCount, count, formatTime, gameMode, getPerformanceReview, play, progress, sessionEarnings, timeInSeconds, updateLocalProgress]);

    const startGame = (total: number, minutes: number, level: number) => {
        setGameMode({ total, time: minutes * 60, level });
        setTimeLeft(minutes * 60);
        setCount(0);
        setCorrectCount(0);
        setSessionHistory([]);
        setSessionCorrect(0);
        setTimeInSeconds(0);
        setIsFinished(false);
        setSessionActive(true);
        play('click');
    };

    const nextQuestion = useCallback(async () => {
        if (!progress || !gameMode) return;
        if (count >= gameMode.total) {
            finishSession();
            return;
        }

        const currentPerformance = count > 0 ? (sessionCorrect / count) : 1.0;
        const { skillId, bucket } = selectNextSkill(progress, sessionHistory, count, currentPerformance, subjectId || undefined, currentGrade);

        setCurrentBucket(bucket);
        setSessionHistory(prev => [...prev.slice(-10), skillId]);

        // --- PHÂN CẤP THÁCH THỨC (DIFFERENTIATED DIFFICULTY) ---
        let finalLevel = 1;

        if (gameMode.total === 10) {
            finalLevel = 1; // Gói 10 câu: Luôn Level 1 (Ưu tiên kho tĩnh)
        } else if (gameMode.total === 20) {
            // Gói 20 câu: 10 câu đầu Lvl 2, 10 câu sau Lvl 3
            finalLevel = count < 10 ? 2 : 3;
        } else if (gameMode.total === 30) {
            // Gói 30 câu: Tăng dần 3-4-5 sau mỗi 10 câu
            if (count < 10) finalLevel = 3;
            else if (count < 20) finalLevel = 4;
            else finalLevel = 5;
        }

        // Đảm bảo Level không vượt quá giới hạn 1-5
        finalLevel = Math.max(1, Math.min(5, finalLevel));

        const skillInfo = SKILL_MAP[skillId];
        if (!skillInfo || !isSkillAvailableForGrade(skillInfo, currentGrade)) {
            return;
        }

        const storedSkillLevel = progress.skills?.[skillId]?.level || 1;
        const sessionBonus = gameMode.total === 30
            ? Math.floor(count / 12)
            : gameMode.total === 20
                ? Math.floor(count / 15)
                : 0;
        const performanceBonus = currentPerformance >= 0.85 && count >= 5 ? 1 : 0;
        finalLevel = Math.min(gameMode.level, storedSkillLevel + sessionBonus + performanceBonus);
        finalLevel = Math.max(1, Math.min(5, finalLevel));

        // AI Generation Logic (Simulated or Real)
        // ... (Keep existing complex logic or simplify for now to ensure stability)
        // For brevity in this rewrite, using standard generator primarily
        const newQ = await generateQuestion(skillInfo.subjectId, skillId, finalLevel);
        setCurrentQuestion(newQ);
        setAnswer('');
        setFeedback(null);
    }, [count, currentGrade, finishSession, gameMode, progress, sessionCorrect, sessionHistory, subjectId]);

    const submitAnswer = async (selectedAnswer?: string, audioBlob?: Blob) => {
        const finalAnswer = selectedAnswer !== undefined ? selectedAnswer : answer;
        if (!finalAnswer || evaluating || feedback) return;

        setEvaluating(true);
        const isSpeakingOrReading = currentQuestion?.type === 'speaking' || (currentQuestion?.type as string) === 'reading';

        let isCorrect = false;
        if (isSpeakingOrReading) {
            isCorrect = false; // Chờ AI xác nhận kết quả thật
        } else {
            const normalizedStudent = finalAnswer.toLowerCase().replace(/\s+/g, '');
            const normalizedCorrect = (currentQuestion?.answer || '').toLowerCase().replace(/\s+/g, '');
            isCorrect = normalizedStudent === normalizedCorrect;
        }

        if (isCorrect) {
            play('correct');
            if (!isSpeakingOrReading) {
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            }
            setCorrectCount(prev => prev + 1);
            setSessionCorrect(prev => prev + 1);
            setSessionStreak(prev => prev + 1);
        } else if (!isSpeakingOrReading) {
            play('wrong');
            setSessionStreak(0);
        }

        // === ĐÁNH GIÁ HYBRID ===
        // Bước 1: Tạo feedback local tức thì
        const localFeedback = {
            isCorrect,
            explain: isCorrect
                ? (currentQuestion?.explanation || 'Chính xác! Bạn rất giỏi. 🌟')
                : `Chưa đúng rồi. Đáp án là: ${currentQuestion?.answer}. ${currentQuestion?.explanation || ''}`,
            microLesson: !isCorrect ? (currentQuestion?.hint || '') : ''
        };

        if (isSpeakingOrReading) {
            // Bài nói/viết: BẮT BUỘC gọi AI để phân tích
            try {
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

                const body: {
                    prompt?: string;
                    studentAnswer: string;
                    correctAnswer?: string;
                    skillId?: string;
                    audioData?: string;
                    mimeType?: string;
                } = {
                    prompt: currentQuestion?.content.text,
                    studentAnswer: finalAnswer,
                    correctAnswer: currentQuestion?.answer,
                    skillId: currentQuestion?.skillId,
                };

                if (audioBlob) {
                    const audioBase64 = await blobToBase64(audioBlob);
                    body.audioData = audioBase64;
                    body.mimeType = audioBlob.type || 'audio/wav';
                }

                const res = await fetch('/api/evaluate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });
                const aiResponse = await res.json();
                if (typeof aiResponse?.isCorrect === 'boolean') {
                    isCorrect = aiResponse.isCorrect;
                }
                setFeedback(aiResponse || localFeedback);
            } catch (e) {
                console.error('Lỗi khi gọi AI đánh giá bài nói:', e);
                setFeedback(localFeedback);
            }
        } else {
            // Bài thường (Trắc nghiệm, Điền số, Kéo thả): Feedback local ngay, KHÔNG gọi API
            setFeedback(localFeedback);
        }

        if (isSpeakingOrReading) {
            if (isCorrect) {
                play('correct');
                setCorrectCount(prev => prev + 1);
                setSessionCorrect(prev => prev + 1);
                setSessionStreak(prev => prev + 1);
            } else {
                play('wrong');
                setSessionStreak(0);
            }
        }

        setEvaluating(false);

        // Cập nhật Mastery
        if (progress && currentQuestion && progress.skills) {
            const currentSkillState = progress.skills[currentQuestion.skillId] || {
                skillId: currentQuestion.skillId,
                mastery: 0,
                attempts: 0,
                streak: 0,
                history: [],
                lastPracticed: 0,
                level: 1,
                lastSeen: new Date().toISOString(),
                correctCount: 0,
                wrongStreak: 0,
                stability: 0,
                lastCorrect: null
            };
            const updatedSkill = updateMastery(currentSkillState, isCorrect);

            // Spaced Repetition: thêm câu sai vào hàng đợi ôn tập
            let updatedProgress = {
                ...progress,
                skills: { ...progress.skills, [currentQuestion.skillId]: updatedSkill }
            };

            if (!isCorrect && currentQuestion.content?.text) {
                updatedProgress = addToReviewQueue(
                    updatedProgress,
                    currentQuestion.skillId,
                    currentQuestion.content.text,
                    currentQuestion.answer
                );
            }

            updateLocalProgress(updatedProgress);
            setCount(prev => prev + 1);

            // Tích lũy tiền thưởng (chỉ thưởng khi đúng hoàn toàn liên tiếp)
            let earnedAmount = isCorrect ? 100 : 0;
            if (isCorrect) {
                // sessionStreak đã được +1 ở trên rồi, dùng giá trị mới
                const newStreak = sessionStreak + 1;
                if (newStreak === 10) {
                    earnedAmount += 1000;
                    play('win');
                    confetti({ particleCount: 150, spread: 100, colors: ['#FFD700'] });
                } else if (newStreak === 20) {
                    earnedAmount += 2000;
                    play('win');
                    confetti({ particleCount: 200, spread: 120 });
                } else if (newStreak === 30) {
                    earnedAmount += 5000;
                    play('win');
                    confetti({ particleCount: 300, spread: 150 });
                }
            }
            setSessionEarnings(prev => prev + earnedAmount);
        }
    };

    // Session Timer
    useEffect(() => {
        let timer: ReturnType<typeof setInterval> | undefined;
        let finishTimeout: ReturnType<typeof setTimeout> | undefined;
        if (sessionActive && !isFinished && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
                setTimeInSeconds(prev => prev + 1);
            }, 1000);
        } else if (timeLeft === 0 && sessionActive && !isFinished) {
            finishTimeout = setTimeout(() => {
                finishSession();
            }, 0);
        }
        return () => {
            clearInterval(timer);
            clearTimeout(finishTimeout);
        };
    }, [finishSession, isFinished, sessionActive, timeLeft]);

    // Question Init
    useEffect(() => {
        let nextQuestionTimeout: ReturnType<typeof setTimeout> | undefined;
        if (sessionActive && !currentQuestion && !isFinished && gameMode) {
            nextQuestionTimeout = setTimeout(() => {
                nextQuestion();
            }, 0);
        }
        return () => clearTimeout(nextQuestionTimeout);
    }, [currentQuestion, gameMode, isFinished, nextQuestion, sessionActive]);

    // --- RENDER ---

    const theme = getTheme(subjectId);
    const performanceReview = getPerformanceReview(correctCount, gameMode?.total || 0, timeInSeconds);

    if (isFinished) {
        return (
            <div className={`min-h-screen ${theme.colors.light} flex items-center justify-center p-4 overflow-hidden relative`}>
                {/* Background Blobs */}
                <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
                <div className="absolute bottom-0 -right-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="bg-white/70 backdrop-blur-2xl rounded-[60px] p-8 md:p-14 shadow-[0_32px_120px_-20px_rgba(0,0,0,0.15)] text-center max-w-3xl w-full border-[8px] border-white/80 relative z-10"
                >
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-white/50 to-transparent" />

                    <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                        className="relative z-10 mb-10 inline-block"
                    >
                        <div className={`w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br ${theme.colors.gradient} rounded-[48px] flex items-center justify-center shadow-2xl rotate-3`}>
                            <Trophy size={80} className="text-white fill-white/20" />
                        </div>
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="absolute -inset-4 bg-yellow-400/20 rounded-[60px] -z-10 blur-xl"
                        />
                    </motion.div>

                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-4 uppercase tracking-tighter">
                        {performanceReview.title}
                    </h1>

                    <h1 className="hidden">
                        Xuất Sắc!
                    </h1>

                    <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 mb-10 border-2 border-white/50 shadow-inner">
                        {!aiSummary ? (
                            <div className="flex items-center justify-center gap-2 text-slate-400 font-bold italic">
                                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }}>Gia sư AI đang viết nhận xét...</motion.span>
                            </div>
                        ) : (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-slate-700 font-bold text-lg md:text-xl leading-relaxed text-center"
                            >
                                {aiSummary}
                            </motion.p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
                        <div className="bg-emerald-50/80 p-5 rounded-[32px] border-2 border-emerald-100/50 shadow-sm">
                            <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Chính xác</div>
                            <div className="text-3xl font-black text-emerald-600">{correctCount}/{gameMode?.total}</div>
                        </div>
                        <div className="bg-blue-50/80 p-5 rounded-[32px] border-2 border-blue-100/50 shadow-sm">
                            <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Điểm Thưởng</div>
                            <div className="text-3xl font-black text-blue-600">+{correctCount * 10}</div>
                        </div>
                        <div className="bg-purple-50/80 p-5 rounded-[32px] border-2 border-purple-100/50 shadow-sm">
                            <div className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-1">Thời gian</div>
                            <div className="text-3xl font-black text-purple-600">{formatTime(timeInSeconds)}</div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <motion.button
                            whileHover={{ scale: 1.05, y: -4 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => window.location.reload()}
                            className="flex-1 py-5 px-8 bg-slate-900 text-white rounded-[28px] font-black text-xl shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3"
                        >
                            <Zap size={24} className="fill-yellow-400 text-yellow-400" /> Chơi Lại
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05, y: -4 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.push('/subjects')}
                            className="flex-1 py-5 px-8 bg-white text-slate-800 border-4 border-white rounded-[28px] font-black text-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-lg"
                        >
                            <ArrowLeft size={24} /> Trang Chủ
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (!sessionActive) {
        const rank = progress ? getOverallRank(progress) : { label: 'Tập Sự', icon: '🐣', color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' };

        return (
            <div className={`min-h-screen transition-colors duration-700 ${theme.colors.light} p-4 md:p-8 space-y-8 relative overflow-hidden font-sans selection:${theme.colors.primary}/30`}>
                {/* Decorative Background Elements */}
                <div className={`absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b ${theme.colors.light.replace('bg-', 'from-').replace('50', '50/50')} to-transparent -z-10`} />
                <div className="absolute top-20 -left-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
                <div className="absolute top-20 -right-20 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
                <div className="absolute -bottom-32 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />

                {/* Top Bar / Breadcrumbs */}
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between bg-white/40 backdrop-blur-md p-4 rounded-3xl border border-white/50 shadow-sm relative z-20">
                        <div className="flex items-center gap-4">
                            <BackButton />
                            <div className="h-8 w-[2px] bg-slate-200/50 hidden md:block" />
                            <div className="hidden md:flex flex-col">
                                <h1 className="text-xl font-black text-slate-800 leading-none">Chế độ Thách đấu</h1>
                                <span className="text-xs font-bold text-slate-400">Rèn luyện tư duy mỗi ngày</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Streak */}
                            <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
                                <div className="bg-orange-100 p-1.5 rounded-full">
                                    <Zap className="text-orange-500 fill-orange-500" size={16} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-slate-800 leading-none">{progress?.overallStreak || 0}</span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">Ngày</span>
                                </div>
                            </div>
                            <WalletButton />
                            <div className="md:hidden">
                                <UserMenu theme={theme} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 h-full min-h-[600px] relative z-10 pt-4">
                    {/* HERO CARD - Mode Selection */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`lg:col-span-8 relative overflow-hidden rounded-[48px] bg-slate-900 shadow-2xl ${theme.colors.shadow} group flex flex-col justify-between border-[6px] border-white/20`}
                    >
                        {/* Dynamic Gradient Background */}
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 mix-blend-overlay"></div>
                        <div className={`absolute inset-0 bg-gradient-to-br ${theme.colors.gradient} opacity-90`} />

                        {/* Header Content */}
                        <div className="relative z-10 p-8 md:p-12 pb-0">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                <div>
                                    <div className="flex items-center gap-2 bg-white/20 w-fit px-4 py-1.5 rounded-full mb-4 backdrop-blur-md border border-white/20 shadow-lg">
                                        <Star size={16} className="text-yellow-300 fill-yellow-300" />
                                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white">
                                            Đấu Trường Trí Tuệ
                                        </span>
                                    </div>

                                    <h2 className="text-4xl md:text-6xl font-black leading-[0.9] text-white tracking-tighter drop-shadow-lg text-left">
                                        {pageTitle}
                                    </h2>
                                </div>
                            </div>

                            <p className="text-blue-50 text-lg font-medium max-w-lg leading-relaxed opacity-90 text-left">
                                Hãy chọn mức độ phù hợp để bắt đầu hành trình chinh phục kiến thức ngay bây giờ!
                            </p>
                        </div>

                        {/* Mode Selection Grid - Pushed to bottom */}
                        <div className="relative z-10 p-8 md:p-12 pt-8 mt-auto">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {(() => {
                                    return [
                                        { q: 10, t: 10, lvl: 1, label: 'Học Viên', color: 'from-emerald-400 to-green-500', shadow: 'shadow-emerald-900/20', border: 'border-emerald-400/30', icon: '📝', hidden: false },
                                        { q: 20, t: 15, lvl: 2, label: 'Chuyên Gia', color: 'from-blue-400 to-indigo-500', shadow: 'shadow-blue-900/20', border: 'border-blue-400/30', icon: '🎖️', hidden: false },
                                        { q: 30, t: 20, lvl: 3, label: 'Giáo Sư', color: 'from-orange-400 to-red-500', shadow: 'shadow-orange-900/20', border: 'border-orange-400/30', icon: '🧠', hidden: false },
                                    ].map((mode) => (
                                        !mode.hidden ? (
                                            <button
                                                key={mode.q}
                                                onClick={() => startGame(mode.q, mode.t, mode.lvl)}
                                                className={`group/btn relative overflow-hidden rounded-[32px] bg-white/10 backdrop-blur-md border border-white/20 p-1 transition-all hover:-translate-y-2 hover:shadow-2xl ${mode.shadow}`}
                                            >
                                                <div className={`absolute inset-0 bg-gradient-to-br ${mode.color} opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300`} />

                                                <div className="relative bg-slate-900/40 group-hover/btn:bg-transparent rounded-[28px] p-5 h-full flex flex-col justify-between min-h-[140px] border border-white/5">
                                                    <div className="flex justify-between items-start text-left">
                                                        <div className="bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white/90 border border-white/10">
                                                            {mode.label}
                                                        </div>
                                                        <div className="text-3xl drop-shadow-md transform group-hover/btn:scale-110 transition-transform">{mode.icon}</div>
                                                    </div>

                                                    <div className="text-left">
                                                        <div className="flex items-baseline gap-1">
                                                            <span className="text-5xl font-black text-white tracking-tighter">{mode.q}</span>
                                                            <span className="text-sm font-bold text-white/60">câu</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-[11px] font-bold text-white/80 uppercase tracking-wide mt-1">
                                                            <Clock size={12} /> {mode.t} Phút
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        ) : (
                                            <div key={mode.q} className="rounded-[32px] bg-white/10 border border-white/20 p-6 flex flex-col items-center justify-center opacity-80 grayscale">
                                                <div className="text-3xl mb-2 opacity-80">⭐</div>
                                                <span className="text-[11px] font-black text-white/90 uppercase tracking-widest text-center shadow-black/50 drop-shadow-md">Bé đã quá giỏi mức này!</span>
                                            </div>
                                        )
                                    ));
                                })()}
                            </div>
                        </div>
                    </motion.div>

                    {/* RANK WIDGET */}
                    <div className="lg:col-span-4 flex flex-col group items-center justify-center text-center p-8 rounded-[48px] border-[6px] shadow-2xl relative overflow-hidden h-full bg-white border-white ring-1 ring-slate-200">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 brightness-100 mix-blend-overlay"></div>
                        <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-slate-50 to-transparent opacity-80 pointer-events-none" />

                        <motion.div
                            animate={{
                                y: [0, -15, 0],
                                scale: [1, 1.05, 1],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                            className="text-[120px] md:text-[140px] mb-4 drop-shadow-2xl filter relative z-10"
                        >
                            {rank.icon}
                        </motion.div>

                        <div className={`relative z-10 inline-block px-6 py-2 rounded-full ${rank.bg} ${rank.color} font-black text-xs uppercase tracking-[0.2em] mb-6 shadow-sm border border-current/10 transform hover:scale-105 transition-transform`}>
                            Cấp độ hiện tại
                        </div>

                        <h3 className={`relative z-10 text-4xl md:text-5xl font-black ${rank.color} uppercase tracking-tighter mb-8 max-w-[200px] leading-tight`}>{rank.label}</h3>

                        {/* Progress Bar */}
                        <div className="relative z-10 w-full bg-slate-50 rounded-3xl p-6 border border-slate-200 shadow-inner group-hover:border-slate-300 transition-colors">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3 text-slate-400">
                                <span>Tiến độ thăng hạng</span>
                                <span>{Math.round((Object.values(progress?.skills || {}).reduce((sum, skill) => sum + Number(skill.mastery), 0) / (Object.keys(progress?.skills || {}).length || 1)) * 100)}%</span>
                            </div>
                            <div className="h-5 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner border border-slate-200/50">
                                <motion.div
                                    className={`h-full ${rank.color.replace('text', 'bg')} opacity-100 shadow-[0_0_10px_rgba(0,0,0,0.1)]`}
                                    initial={{ width: 0 }}
                                    animate={{ width: '40%' }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // GAME ACTIVE RENDER (Keep broadly similar but wrapped)
    return (
        <div className="mx-auto max-w-7xl px-4 py-6 md:py-10 min-h-screen bg-slate-50">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
                {/* Main Question Area (8) */}
                <div className="lg:col-span-8 flex flex-col">
                    <div className="mb-6 flex justify-between items-end">
                        <h1 className="text-2xl md:text-3xl font-black text-slate-800">{pageTitle}</h1>
                        <div className="px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-black uppercase tracking-widest">
                            {gameMode?.total} Câu hỏi
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {currentQuestion && (
                            <QuestionCard
                                question={currentQuestion}
                                answer={answer}
                                setAnswer={setAnswer}
                                submitAnswer={(val, blob) => submitAnswer(val, blob)}
                                evaluating={evaluating}
                                feedback={feedback}
                                play={play}
                            />
                        )}
                    </AnimatePresence>
                </div>

                {/* Sidebar (4) */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-5 py-2 rounded-2xl border border-white shadow-sm">
                        <div className="flex items-center gap-1.5">
                            <span className="text-2xl">🔥</span>
                            <span className="font-black text-slate-700">{sessionStreak}</span>
                        </div>
                        <div className="w-[1px] h-4 bg-slate-200" />
                        <div className="flex items-center gap-1.5">
                            <span className="text-2xl">🎯</span>
                            <span className="font-black text-slate-700">{correctCount}</span>
                        </div>
                    </div>
                    <div className="bg-white rounded-3xl p-6 border-4 border-slate-100 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">Tiến độ</span>
                                <span className="text-3xl font-black text-slate-800">{count}/{gameMode?.total}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">Thời gian</span>
                                <div className={`text-3xl font-black ${timeLeft < 60 ? 'text-rose-600 animate-pulse' : 'text-blue-600'}`}>
                                    {formatTime(timeLeft)}
                                </div>
                            </div>
                        </div>
                        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden mb-6">
                            <motion.div
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${(count / (gameMode?.total || 1)) * 100}%` }}
                            />
                        </div>
                        <button
                            onClick={finishSession}
                            className="w-full py-4 rounded-2xl border-2 border-rose-100 bg-rose-50 text-rose-600 font-black hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                            <XCircle size={24} /> KẾT THÚC SỚM
                        </button>
                    </div>

                    {/* Feedback Area Reuse */}
                    <div className="flex-1 min-h-[200px] relative">
                        <AnimatePresence mode="wait">
                            {feedback ? (
                                <motion.div
                                    key="feedback"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`h-full rounded-3xl p-6 border-4 shadow-xl flex flex-col ${feedback.isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        {feedback.isCorrect ? <CheckCircle2 className="text-emerald-500" size={32} /> : <XCircle className="text-rose-500" size={32} />}
                                        <span className={`text-xl font-black ${feedback.isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                                            {feedback.isCorrect ? 'CHÍNH XÁC!' : 'CỐ GẮNG LÊN!'}
                                        </span>
                                    </div>
                                    <p className="text-slate-700 font-bold mb-6">{feedback.explain}</p>
                                    <button onClick={nextQuestion} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold">Tiếp Tục</button>
                                </motion.div>
                            ) : (
                                <div className="h-full rounded-3xl border-4 border-dashed border-slate-200 bg-slate-50/50 p-6 flex items-center justify-center text-center opacity-50">
                                    <div>
                                        <div className="text-4xl mb-2">🤔</div>
                                        <div className="font-bold text-slate-400">Đang suy nghĩ...</div>
                                    </div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
