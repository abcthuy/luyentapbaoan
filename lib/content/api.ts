import { Question, SubjectId } from './types';

/** Max time to wait for AI API before falling back to local content */
const API_TIMEOUT_MS = 4000;

function resolveQuestionApiBaseUrl() {
    if (typeof window !== 'undefined') {
        return window.location.origin;
    }

    const configuredUrl = process.env.NEXT_PUBLIC_APP_URL
        || process.env.NEXT_PUBLIC_SITE_URL
        || process.env.VERCEL_URL;

    if (!configuredUrl) {
        return null;
    }

    return configuredUrl.startsWith('http') ? configuredUrl : `https://${configuredUrl}`;
}

export async function tryQuestionApi(subjectId: SubjectId, skillId: string, level: number): Promise<Question | null> {
    const baseUrl = resolveQuestionApiBaseUrl();
    if (!baseUrl) {
        return null;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    try {
        const studentInfo = typeof window !== 'undefined'
            ? JSON.parse(localStorage.getItem('math-mastery-profiles') || '{}').activeProfile
            : null;

        const res = await fetch(`${baseUrl}/api/question`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
                skillId,
                level,
                subjectId,
                mastery: 0,
                studentName: studentInfo?.name || 'Be',
                studentInterest: studentInfo?.avatar || 'hoc tap'
            })
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            console.error('API response not ok', res.status, errData.details || errData.error);
            return null;
        }

        return await res.json();
    } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') {
            console.warn(`API timeout (${API_TIMEOUT_MS}ms) for ${skillId} — using local fallback`);
        } else {
            console.error(`AI Gen failed for ${skillId} via ${baseUrl}/api/question`, e);
        }
        return null;
    } finally {
        clearTimeout(timeoutId);
    }
}
