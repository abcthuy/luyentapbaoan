import { NextRequest, NextResponse } from 'next/server';
import { CurriculumApiPayload } from '@/lib/curriculum';
import { SubjectId } from '@/lib/content/types';
import { getServerSupabase } from '@/lib/server/supabase-admin';

export async function GET(req: NextRequest) {
    const subjectId = req.nextUrl.searchParams.get('subjectId')?.trim() as SubjectId | undefined;
    const grade = Number(req.nextUrl.searchParams.get('grade') || 0);
    const profileId = req.nextUrl.searchParams.get('profileId')?.trim() || '';

    if (!subjectId || !grade) {
        return NextResponse.json({ enabled: false, reason: 'Missing subjectId or grade' } satisfies CurriculumApiPayload);
    }

    try {
        const supabase = getServerSupabase();

        const { data: curriculum, error: curriculumError } = await supabase
            .from('curricula')
            .select('*')
            .eq('subject_id', subjectId)
            .eq('grade', grade)
            .eq('is_active', true)
            .order('version', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (curriculumError) {
            throw curriculumError;
        }

        if (!curriculum) {
            return NextResponse.json({ enabled: false, reason: 'Curriculum not found' } satisfies CurriculumApiPayload);
        }

        const [phasesResult, skillsResult, prerequisitesResult, studentStateResult] = await Promise.all([
            supabase.from('curriculum_phases').select('*').eq('curriculum_id', curriculum.id).order('order_index', { ascending: true }),
            supabase.from('curriculum_skills').select('*').eq('curriculum_id', curriculum.id).order('order_index', { ascending: true }),
            supabase.from('curriculum_skill_prerequisites').select('*'),
            profileId
                ? supabase.from('student_learning_state').select('*').eq('profile_id', profileId).eq('curriculum_id', curriculum.id).maybeSingle()
                : Promise.resolve({ data: null, error: null }),
        ]);

        if (phasesResult.error) throw phasesResult.error;
        if (skillsResult.error) throw skillsResult.error;
        if (prerequisitesResult.error) throw prerequisitesResult.error;
        if ('error' in studentStateResult && studentStateResult.error) throw studentStateResult.error;

        const skillIds = new Set((skillsResult.data || []).map((skill) => skill.id));
        const prerequisites = (prerequisitesResult.data || []).filter((row) => skillIds.has(row.skill_id) && skillIds.has(row.prerequisite_skill_id));

        return NextResponse.json({
            enabled: true,
            curriculum,
            phases: phasesResult.data || [],
            skills: skillsResult.data || [],
            prerequisites,
            studentState: 'data' in studentStateResult ? studentStateResult.data : null,
        } satisfies CurriculumApiPayload);
    } catch (error) {
        console.warn('Curriculum API fallback:', error);
        return NextResponse.json({ enabled: false, reason: 'Curriculum tables unavailable' } satisfies CurriculumApiPayload);
    }
}

