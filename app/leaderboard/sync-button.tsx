"use client";

import { useState } from "react";
import { AlertCircle, Check, RefreshCw } from "lucide-react";

type SyncStatus = "idle" | "loading" | "success" | "error";

export function LeaderboardSyncButton() {
    const [status, setStatus] = useState<SyncStatus>("idle");
    const [count, setCount] = useState(0);

    const handleSync = async () => {
        const syncId = localStorage.getItem("math_sync_id") || "";
        const username = prompt("Nhap tai khoan admin de dong bo bang xep hang:");
        if (!username) return;

        const pin = prompt("Nhap PIN admin:");
        if (!pin) return;

        setStatus("loading");

        try {
            const response = await fetch("/api/admin/leaderboard-sync", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    syncId,
                    username,
                    pin,
                }),
            });

            const payload = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(payload.error || "Dong bo that bai");
            }

            setCount(Number(payload.count || 0));
            setStatus("success");
            setTimeout(() => {
                setStatus("idle");
                window.location.reload();
            }, 1500);
        } catch (error) {
            console.error(error);
            setStatus("error");
        }
    };

    return (
        <button
            onClick={handleSync}
            disabled={status === "loading"}
            className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200 disabled:opacity-60"
        >
            {status === "loading" ? <RefreshCw size={16} className="animate-spin" /> : null}
            {status === "success" ? <Check size={16} className="text-green-600" /> : null}
            {status === "error" ? <AlertCircle size={16} className="text-red-600" /> : null}
            {status === "idle" ? <RefreshCw size={16} /> : null}

            {status === "idle" ? "Lam moi du lieu" : null}
            {status === "loading" ? "Dang dong bo..." : null}
            {status === "success" ? `Da cap nhat ${count} be` : null}
            {status === "error" ? "Loi!" : null}
        </button>
    );
}
