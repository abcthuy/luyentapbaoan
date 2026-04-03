import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCredentials } from "@/lib/server/admin-auth";
import { fetchQuestionSourceAdminPayload } from "@/lib/server/question-management-admin";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => null) as {
            syncId?: string;
            username?: string;
            pin?: string;
            subjectId?: string;
            grade?: number;
        } | null;

        const syncId = body?.syncId?.trim();
        const username = body?.username?.trim();
        const pin = body?.pin?.trim();
        const subjectId = body?.subjectId?.trim();
        const grade = typeof body?.grade === 'number' ? body.grade : 0;

        if (!syncId || !username || !pin || !subjectId || !grade) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const isAuthorized = await verifyAdminCredentials({ syncId, username, pin });
        if (!isAuthorized) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const payload = await fetchQuestionSourceAdminPayload(subjectId as never, grade);
        if (!payload) {
            return NextResponse.json({ error: "Curriculum not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, payload });
    } catch (error) {
        console.error("Admin question source list failed:", error);
        return NextResponse.json({ error: "Failed to load question source config" }, { status: 500 });
    }
}
