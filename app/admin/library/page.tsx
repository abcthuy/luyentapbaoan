"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { clearAdminSession, hasActiveAdminSession, touchAdminSession } from "@/lib/admin-session";
import { useProgress } from "@/components/progress-provider";

export default function AdminLibraryPage() {
    const router = useRouter();
    const { storage, isInitialized } = useProgress();

    useEffect(() => {
        if (!isInitialized) return;
        const isAuthorized = Boolean(storage?.adminAccount?.pin) && hasActiveAdminSession();
        if (!isAuthorized) {
            clearAdminSession();
            router.replace("/admin?next=/admin/question-sources");
            return;
        }
        touchAdminSession();
        router.replace("/admin/question-sources");
    }, [isInitialized, router, storage]);

    return <div className="flex min-h-screen items-center justify-center bg-slate-50 font-bold text-slate-500">Đang chuyển tới Ngân hàng câu hỏi...</div>;
}
