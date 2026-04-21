import { useState, useRef, useEffect } from 'react';

export interface UseRecordingReturn {
    isRecording: boolean;
    hasRecorded: boolean;
    duration: number;
    audioUrl: string | null;
    startError: string | null;
    isPlayingBack: boolean;
    startRecording: () => Promise<void>;
    stopRecording: () => void;
    resetRecording: () => void;
    playRecording: () => void;
    audioBlob: Blob | null;
    transcript: string;
}

// Thêm type declarations cho SpeechRecognition
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

export const useRecording = (): UseRecordingReturn => {
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const [hasRecorded, setHasRecorded] = useState(false);
    const [isPlayingBack, setIsPlayingBack] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [startError, setStartError] = useState<string | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [transcript, setTranscript] = useState('');

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recognitionRef = useRef<any>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const stopMicrophone = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch(e) {}
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (audioUrl) URL.revokeObjectURL(audioUrl);
            if (timerRef.current) clearInterval(timerRef.current);
            stopMicrophone();
        };
    }, [audioUrl]);

    const startRecording = async () => {
        setStartError(null);
        try {
            if (typeof window === 'undefined' || !navigator?.mediaDevices?.getUserMedia) {
                setStartError("Thiết bị này chưa hỗ trợ ghi âm trong trình duyệt.");
                return;
            }
            if (typeof MediaRecorder === 'undefined') {
                setStartError("Trình duyệt chưa hỗ trợ MediaRecorder. Bé có thể dùng ô nhập chữ thay thế.");
                return;
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];
            setTranscript('');

            // Setup Speech Recognition
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = 'vi-VN'; // Mặc định nhận diện tiếng Việt

                recognition.onresult = (event: any) => {
                    let currentTranscript = '';
                    for (let i = 0; i < event.results.length; ++i) {
                        currentTranscript += event.results[i][0].transcript;
                    }
                    setTranscript(currentTranscript);
                };

                recognition.onerror = (event: any) => {
                    console.warn("Speech recognition error", event.error);
                };

                recognitionRef.current = recognition;
                try {
                    recognition.start();
                } catch(e) {
                    console.warn("Could not start speech recognition", e);
                }
            }

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const actualMime = mediaRecorder.mimeType || 'audio/webm';
                const blob = new Blob(audioChunksRef.current, { type: actualMime });
                setAudioBlob(blob);
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);
                setHasRecorded(true);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setHasRecorded(false);
            setDuration(0);

            // Timer
            timerRef.current = setInterval(() => {
                setDuration(prev => {
                    if (prev >= 300) { // 5 mins limit
                        stopRecording();
                        return 300;
                    }
                    return prev + 1;
                });
            }, 1000);

        } catch (err) {
            console.error("Error accessing microphone:", err);
            setStartError("Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch(e) {}
            }
        }
    };

    const resetRecording = () => {
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
        setAudioBlob(null);
        setHasRecorded(false);
        setDuration(0);
        setStartError(null);
        setIsPlayingBack(false);
        setTranscript('');
    };

    const playRecording = () => {
        if (isPlayingBack || !audioUrl) return;

        const audio = new Audio(audioUrl);
        audioPlayerRef.current = audio;
        setIsPlayingBack(true);

        audio.onended = () => setIsPlayingBack(false);
        audio.play().catch(e => {
            console.error("Playback failed", e);
            setIsPlayingBack(false);
        });
    };

    return {
        isRecording,
        hasRecorded,
        duration,
        audioUrl,
        startError,
        isPlayingBack,
        startRecording,
        stopRecording,
        resetRecording,
        playRecording,
        audioBlob,
        transcript
    };
};
