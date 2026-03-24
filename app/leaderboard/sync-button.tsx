"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { AppStorage, getOverallRank } from '@/lib/mastery';
import { getSubjectScore } from '@/lib/scoring';
import { RefreshCw, Check, AlertCircle } from 'lucide-react';

interface LeaderboardEntry {
    id: string;
    name: string;
    total_score: number;
    last_score: number;
    best_time: number;
    tier: string;
    is_public: boolean;
    math_score: number;
    vietnamese_score: number;
    english_score: number;
    finance_score: number;
    updated_at: string;
}

export function LeaderboardSyncButton() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [count, setCount] = useState(0);

    const handleSync = async () => {
        setStatus('loading');
        try {
            // 1. Fetch all raw progress
            const { data: progressRows, error } = await supabase
                .from('math_progress')
                .select('*');

            if (error) throw error;
            if (!progressRows) return;

            const updates: LeaderboardEntry[] = [];

            // 2. Process each user storage
            for (const row of progressRows) {
                const storage = row.data as AppStorage;
                if (!storage || !storage.profiles) continue;

                // 3. Extract profiles
                for (const profile of storage.profiles) {
                    if (profile.isPublic === false) continue;

                    const rank = getOverallRank(profile.progress);
                    const math = getSubjectScore(profile.progress, 'math');
                    const vietnamese = getSubjectScore(profile.progress, 'vietnamese');
                    const english = getSubjectScore(profile.progress, 'english');
                    const finance = getSubjectScore(profile.progress, 'finance');

                    updates.push({
                        id: profile.id,
                        name: profile.name,
                        total_score: profile.progress.totalScore || 0,
                        last_score: profile.progress.lastSessionScore || 0,
                        best_time: profile.progress.bestTimeSeconds || 999999,
                        tier: rank?.label || 'Tập sự',
                        is_public: true,
                        math_score: math,
                        vietnamese_score: vietnamese,
                        english_score: english,
                        finance_score: finance,
                        updated_at: new Date().toISOString()
                    });
                }
            }

            // 4. Deduplicate by name (keep highest total_score)
            const deduped = new Map<string, LeaderboardEntry>();
            for (const entry of updates) {
                const key = entry.name.toLowerCase().trim();
                const existing = deduped.get(key);
                if (!existing || entry.total_score > existing.total_score) {
                    deduped.set(key, entry);
                }
            }

            // Filter out zero-score entries (empty/test accounts)
            const finalUpdates = Array.from(deduped.values()).filter(e => e.total_score > 0);

            // 5. Batch Upsert
            if (finalUpdates.length > 0) {
                const { error: upsertError } = await supabase
                    .from('leaderboard')
                    .upsert(finalUpdates);

                if (upsertError) throw upsertError;
            }

            // 6. Clean up zero-score entries from leaderboard
            await supabase
                .from('leaderboard')
                .delete()
                .eq('total_score', 0);

            // Also clean up duplicate names (keep only the one with highest score)
            // This handles legacy duplicates already in the database
            const { data: allLeaderboard } = await supabase
                .from('leaderboard')
                .select('id, name, total_score')
                .order('total_score', { ascending: false });

            if (allLeaderboard) {
                const bestByName = new Map<string, string>();
                const idsToDelete: string[] = [];
                for (const entry of allLeaderboard) {
                    const nameKey = entry.name.toLowerCase().trim();
                    if (!bestByName.has(nameKey)) {
                        bestByName.set(nameKey, entry.id);
                    } else {
                        idsToDelete.push(entry.id);
                    }
                }
                if (idsToDelete.length > 0) {
                    await supabase
                        .from('leaderboard')
                        .delete()
                        .in('id', idsToDelete);
                }
            }

            setCount(finalUpdates.length);
            setStatus('success');
            setTimeout(() => {
                setStatus('idle');
                window.location.reload(); // Reload to show new data
            }, 2000);

        } catch (e) {
            console.error(e);
            setStatus('error');
        }
    };

    return (
        <button
            onClick={handleSync}
            disabled={status === 'loading'}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-medium transition-colors"
        >
            {status === 'loading' && <RefreshCw size={16} className="animate-spin" />}
            {status === 'success' && <Check size={16} className="text-green-600" />}
            {status === 'error' && <AlertCircle size={16} className="text-red-600" />}

            {status === 'idle' && <RefreshCw size={16} />}
            {status === 'idle' ? 'Làm mới dữ liệu' :
                status === 'loading' ? 'Đang đồng bộ...' :
                    status === 'success' ? `Đã cập nhật ${count} bé` : 'Lỗi!'}
        </button>
    );
}
