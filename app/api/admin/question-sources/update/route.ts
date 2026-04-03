import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCredentials } from "@/lib/server/admin-auth";
import { updateSkillQuestionSourceMapping } from "@/lib/server/question-management-admin";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => null) as {
            syncId?: string;
            username?: string;
            pin?: string;
            mappingId?: string;
            curriculumSkillId?: string;
            questionSourceId?: string;
            priority?: number;
            isPrimary?: boolean;
            levelMin?: number;
            levelMax?: number;
            allowedModes?: string[];
            configOverride?: Record<string, unknown>;
        } | null;

        const syncId = body?.syncId?.trim();
        const username = body?.username?.trim();
        const pin = body?.pin?.trim();
        const curriculumSkillId = body?.curriculumSkillId?.trim();
        const questionSourceId = body?.questionSourceId?.trim();
        const priority = typeof body?.priority === 'number' ? body.priority : 1;
        const isPrimary = Boolean(body?.isPrimary);
        const levelMin = typeof body?.levelMin === 'number' ? body.levelMin : 1;
        const levelMax = typeof body?.levelMax === 'number' ? body.levelMax : 5;
        const allowedModes = Array.isArray(body?.allowedModes) ? body.allowedModes.map((item) => String(item).trim()).filter(Boolean) : [];
        const configOverride = body?.configOverride && typeof body.configOverride === 'object' ? body.configOverride : {};

        if (!syncId || !username || !pin || !curriculumSkillId || !questionSourceId || allowedModes.length === 0) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const isAuthorized = await verifyAdminCredentials({ syncId, username, pin });
        if (!isAuthorized) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await updateSkillQuestionSourceMapping({
            mappingId: body?.mappingId?.trim(),
            curriculumSkillId,
            questionSourceId,
            priority,
            isPrimary,
            levelMin,
            levelMax,
            allowedModes,
            configOverride,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Admin question source update failed:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update question source config" }, { status: 500 });
    }
}
