import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCredentials } from "@/lib/server/admin-auth";
import { upsertQuestionBankEntry } from "@/lib/server/question-management-admin";
import { QuestionBankRow } from "@/lib/question-management";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => null) as {
            syncId?: string;
            username?: string;
            pin?: string;
            questionId?: string;
            curriculumSkillId?: string;
            questionSourceId?: string | null;
            templateId?: string | null;
            legacyQuestionId?: string | null;
            difficultyLevel?: number;
            stage?: QuestionBankRow['stage'];
            questionType?: QuestionBankRow['question_type'];
            content?: Record<string, unknown>;
            canonicalAnswer?: string;
            explanation?: string | null;
            tags?: string[] | null;
            qualityStatus?: QuestionBankRow['quality_status'];
        } | null;

        const syncId = body?.syncId?.trim();
        const username = body?.username?.trim();
        const pin = body?.pin?.trim();
        const curriculumSkillId = body?.curriculumSkillId?.trim();
        const canonicalAnswer = body?.canonicalAnswer?.trim();
        const difficultyLevel = typeof body?.difficultyLevel === 'number' ? body.difficultyLevel : 1;
        const questionType = body?.questionType || 'mcq';
        const qualityStatus = body?.qualityStatus || 'draft';
        const content = body?.content && typeof body.content === 'object' ? body.content : null;

        if (!syncId || !username || !pin || !curriculumSkillId || !canonicalAnswer || !content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const isAuthorized = await verifyAdminCredentials({ syncId, username, pin });
        if (!isAuthorized) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const questionId = await upsertQuestionBankEntry({
            questionId: body?.questionId?.trim(),
            curriculumSkillId,
            questionSourceId: body?.questionSourceId?.trim() || null,
            templateId: body?.templateId?.trim() || null,
            legacyQuestionId: body?.legacyQuestionId?.trim() || null,
            difficultyLevel,
            stage: body?.stage || null,
            questionType,
            content,
            canonicalAnswer,
            explanation: body?.explanation?.trim() || null,
            tags: Array.isArray(body?.tags) ? body.tags.map((tag) => String(tag || '').trim()).filter(Boolean) : null,
            qualityStatus,
        });

        return NextResponse.json({ success: true, questionId });
    } catch (error) {
        console.error('Admin question bank upsert failed:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to save question bank entry' }, { status: 500 });
    }
}
