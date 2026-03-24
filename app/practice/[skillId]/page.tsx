import { SKILL_MAP } from '@/lib/skills';
import PracticeClient from './PracticeClient';

export async function generateStaticParams() {
    return Object.keys(SKILL_MAP).map((skillId) => ({
        skillId: skillId,
    }));
}

export default function Page() {
    return <PracticeClient />;
}
