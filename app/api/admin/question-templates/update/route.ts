import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCredentials } from "@/lib/server/admin-auth";
import { updateQuestionTemplate } from "@/lib/server/question-management-admin";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => null) as {
            syncId?: string;
            username?: string;
            pin?: string;
            templateId?: string;
            title?: string;
            difficultyLevel?: number;
            stage?: "foundation" | "core" | "mixed" | "challenge" | null;
            promptTemplate?: string | null;
            answerStrategy?: "exact" | "normalized" | "manual-review" | "rubric";
            metadata?: Record<string, unknown>;
            isActive?: boolean;
        } | null;

        const syncId = body?.syncId?.trim();
        const username = body?.username?.trim();
        const pin = body?.pin?.trim();
        const templateId = body?.templateId?.trim();
        const title = body?.title?.trim();
        const difficultyLevel = typeof body?.difficultyLevel === 'number' ? body.difficultyLevel : 1;
        const stage = body?.stage ?? null;
        const promptTemplate = body?.promptTemplate?.trim() || null;
        const answerStrategy = body?.answerStrategy || 'exact';
        const metadata = body?.metadata && typeof body.metadata === 'object' ? body.metadata : {};
        const isActive = body?.isActive !== false;

        if (!syncId || !username || !pin || !templateId || !title) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const isAuthorized = await verifyAdminCredentials({ syncId, username, pin });
        if (!isAuthorized) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await updateQuestionTemplate({
            templateId,
            title,
            difficultyLevel,
            stage,
            promptTemplate,
            answerStrategy,
            metadata,
            isActive,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Admin question template update failed:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update template" }, { status: 500 });
    }
}
