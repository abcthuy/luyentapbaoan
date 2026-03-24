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
}

export const useRecording = (): UseRecordingReturn => {
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const [hasRecorded, setHasRecorded] = useState(false);
    const [isPlayingBack, setIsPlayingBack] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [startError, setStartError] = useState<string | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const stopMicrophone = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
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
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

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
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const resetRecording = () => {
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
        setAudioBlob(null);
        setHasRecorded(false);
        setDuration(0);
        setStartError(null);
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
        audioBlob
    };
};
