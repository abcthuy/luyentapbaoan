"use client";

import SubjectDashboard from '@/components/subject-dashboard';

export default function MathDashboardPage() {
    return (
        <SubjectDashboard
            subjectId="math"
            subjectName="Toán Học"
            mapLink="/math"
            arenaLink="/today?subject=math"
            themeColor="blue"
        />
    );
}
