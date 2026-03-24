"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Pen, Trash2, X } from 'lucide-react';

interface ScratchpadProps {
    onClose: () => void;
}

export function Scratchpad({ onClose }: ScratchpadProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const color = '#2563eb'; // Blue-600
    const lineWidth = 3;
    const [tool, setTool] = useState<'pen' | 'eraser'>('pen');

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size to match parent
        const resizeCanvas = () => {
            const parent = canvas.parentElement;
            if (parent) {
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight;
                // Restore logic could be added here if needed, but for now we clear on resize
            }
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        return () => window.removeEventListener('resize', resizeCanvas);
    }, []);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        setIsDrawing(true);
        const { x, y } = getCoordinates(e, canvas);

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
        ctx.lineWidth = tool === 'eraser' ? 20 : lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { x, y } = getCoordinates(e, canvas);
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const getCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;

        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    return (
        <div className="absolute inset-0 z-50 bg-white/5 backdrop-blur-sm flex flex-col">
            <div className="flex items-center justify-between p-2 bg-slate-900 text-white rounded-t-3xl mx-4 mt-4 shadow-xl">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setTool('pen')}
                        className={`p-2 rounded-lg transition-colors ${tool === 'pen' ? 'bg-blue-600' : 'hover:bg-slate-700'}`}
                    >
                        <Pen size={18} />
                    </button>
                    <button
                        onClick={() => setTool('eraser')}
                        className={`p-2 rounded-lg transition-colors ${tool === 'eraser' ? 'bg-rose-600' : 'hover:bg-slate-700'}`}
                    >
                        <Eraser size={18} />
                    </button>
                    <div className="h-6 w-px bg-slate-700 mx-2" />
                    <button onClick={clearCanvas} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white">
                        <Trash2 size={18} />
                    </button>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white">
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 relative mx-4 mb-4 border-2 border-slate-900/10 rounded-b-3xl overflow-hidden shadow-2xl bg-white cursor-crosshair">
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="touch-none w-full h-full"
                />
            </div>
        </div>
    );
}
