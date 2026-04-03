import { NextRequest, NextResponse } from "next/server";
import { QuestionBankRow } from "@/lib/question-management";
import { verifyAdminCredentials } from "@/lib/server/admin-auth";
import { importQuestionBankEntries } from "@/lib/server/question-management-admin";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => null) as {
            syncId?: string;
            username?: string;
            pin?: string;
            dryRun?: boolean;
            rows?: Array<{
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
            }>;
        } | null;

        const syncId = body?.syncId?.trim();
        const username = body?.username?.trim();
        const pin = body?.pin?.trim();
        const rows = Array.isArray(body?.rows) ? body.rows : [];
        const dryRun = Boolean(body?.dryRun);

        if (!syncId || !username || !pin || rows.length === 0) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const isAuthorized = await verifyAdminCredentials({ syncId, username, pin });
        if (!isAuthorized) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const report = await importQuestionBankEntries({
            dryRun,
            rows: rows.map((row) => ({
                questionId: row.questionId?.trim(),
                curriculumSkillId: row.curriculumSkillId?.trim() || '',
                questionSourceId: row.questionSourceId?.trim() || null,
                templateId: row.templateId?.trim() || null,
                legacyQuestionId: row.legacyQuestionId?.trim() || null,
                difficultyLevel: typeof row.difficultyLevel === 'number' ? row.difficultyLevel : 1,
                stage: row.stage || null,
                questionType: row.questionType || 'mcq',
                content: row.content && typeof row.content === 'object' ? row.content : {},
                canonicalAnswer: row.canonicalAnswer?.trim() || '',
                explanation: row.explanation?.trim() || null,
                tags: Array.isArray(row.tags) ? row.tags.map((tag) => String(tag || '').trim()).filter(Boolean) : null,
                qualityStatus: row.qualityStatus || 'draft',
            })),
        });

        return NextResponse.json({ success: report.errorCount === 0, dryRun, report });
    } catch (error) {
        console.error('Admin question bank import failed:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to import question bank entries' }, { status: 500 });
    }
}
