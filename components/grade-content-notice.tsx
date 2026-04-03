import type { SubjectId } from '@/lib/content/types';
import { getHighestPublishedGradeForSubject } from '@/lib/grades';

const SUBJECT_LABELS: Record<SubjectId, string> = {
    math: 'Toán',
    vietnamese: 'Tiếng Việt',
    english: 'Tiếng Anh',
    finance: 'Tài chính',
};

interface GradeContentNoticeProps {
    subjectId: SubjectId;
    grade: number;
}

export function GradeContentNotice({ subjectId, grade }: GradeContentNoticeProps) {
    const publishedGrade = getHighestPublishedGradeForSubject(subjectId);

    if (grade <= publishedGrade) {
        return null;
    }

    return (
        <div className="max-w-4xl mx-auto mb-8 rounded-[28px] border border-amber-200 bg-amber-50/90 px-5 py-4 text-left shadow-sm">
            <div className="text-sm font-black uppercase tracking-[0.2em] text-amber-600">Dang cap nhat noi dung</div>
            <div className="mt-1 text-lg font-bold text-slate-900">
                {SUBJECT_LABELS[subjectId]} lớp {grade} chưa có ngân hàng câu hỏi chính thức.
            </div>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                Hệ thống đã sẵn sàng khung dữ liệu để nâng cấp lớp {grade}. Hiện tại môn này mới có nội dung xuất bản đến lớp {publishedGrade}, nên mình sẽ hiển thị rõ trạng thái chờ thay vì để giao diện trống hoặc chạy sai.
            </p>
        </div>
    );
}
