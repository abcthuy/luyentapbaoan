import { ProgressData } from './mastery';
import { SKILL_MAP } from './skills';
import { getOverallRank } from './mastery';

export type BadgeCategory = 'milestone' | 'streak' | 'subject' | 'performance' | 'economy' | 'rank' | 'special';

export interface BadgeDefinition {
    id: string;
    name: string;
    icon: string;
    description: string;
    category: BadgeCategory;
    check: (progress: ProgressData) => boolean;
}

// Helper: đếm số câu đúng theo môn
function countCorrectBySubject(p: ProgressData, subjectId: string): number {
    return Object.values(p.skills).reduce((sum, s) => {
        const info = SKILL_MAP[s.skillId];
        return sum + (info?.subjectId === subjectId ? s.correctCount : 0);
    }, 0);
}

// Helper: đếm tổng câu đúng
function countTotalCorrect(p: ProgressData): number {
    return Object.values(p.skills).reduce((sum, s) => sum + (s.correctCount || 0), 0);
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
    // ===========================
    // === MILESTONE (Cột Mốc) ===  6 badges
    // ===========================
    {
        id: 'first_session', name: 'Ngày Đầu Tiên', icon: '🌱',
        description: 'Hoàn thành phiên học đầu tiên',
        category: 'milestone',
        check: (p) => (p.lastSessionCount || 0) > 0
    },
    {
        id: 'level_up_first', name: 'Tiến Bộ', icon: '📈',
        description: 'Đạt Cấp độ 2 ở bất kỳ kỹ năng nào',
        category: 'milestone',
        check: (p) => Object.values(p.skills).some(s => s.level >= 2)
    },
    {
        id: 'skill_master_1', name: 'Bậc Thầy Kỹ Năng', icon: '🎓',
        description: 'Đạt Cấp độ 5 ở 1 kỹ năng',
        category: 'milestone',
        check: (p) => Object.values(p.skills).some(s => s.level >= 5)
    },
    {
        id: 'skill_master_5', name: 'Đa Tài', icon: '🌈',
        description: 'Đạt Cấp độ 5 ở 5 kỹ năng khác nhau',
        category: 'milestone',
        check: (p) => Object.values(p.skills).filter(s => s.level >= 5).length >= 5
    },
    {
        id: 'skill_master_10', name: 'Thập Toàn Thập Mỹ', icon: '🏅',
        description: 'Đạt Cấp độ 5 ở 10 kỹ năng',
        category: 'milestone',
        check: (p) => Object.values(p.skills).filter(s => s.level >= 5).length >= 10
    },
    {
        id: 'skill_master_20', name: 'Nhà Bác Học Nhí', icon: '🔬',
        description: 'Đạt Cấp độ 5 ở 20 kỹ năng',
        category: 'milestone',
        check: (p) => Object.values(p.skills).filter(s => s.level >= 5).length >= 20
    },

    // ===========================
    // === SUBJECT (Môn Học)    ===  11 badges
    // ===========================
    {
        id: 'math_warrior', name: 'Chiến Binh Toán', icon: '⚔️',
        description: 'Trả lời đúng 100 câu Toán',
        category: 'subject',
        check: (p) => countCorrectBySubject(p, 'math') >= 100
    },
    {
        id: 'math_expert', name: 'Thiên Tài Toán Học', icon: '🧠',
        description: 'Trả lời đúng 1000 câu Toán',
        category: 'subject',
        check: (p) => countCorrectBySubject(p, 'math') >= 1000
    },
    {
        id: 'math_legend', name: 'Huyền Thoại Số Học', icon: '♾️',
        description: 'Trả lời đúng 3000 câu Toán',
        category: 'subject',
        check: (p) => countCorrectBySubject(p, 'math') >= 3000
    },
    {
        id: 'viet_writer', name: 'Nhà Văn Nhí', icon: '✍️',
        description: 'Trả lời đúng 50 câu Tiếng Việt',
        category: 'subject',
        check: (p) => countCorrectBySubject(p, 'vietnamese') >= 50
    },
    {
        id: 'viet_master', name: 'Bậc Thầy Ngôn Ngữ', icon: '🖋️',
        description: 'Trả lời đúng 250 câu Tiếng Việt',
        category: 'subject',
        check: (p) => countCorrectBySubject(p, 'vietnamese') >= 250
    },
    {
        id: 'viet_legend', name: 'Trạng Nguyên Văn Chương', icon: '📜',
        description: 'Trả lời đúng 1000 câu Tiếng Việt',
        category: 'subject',
        check: (p) => countCorrectBySubject(p, 'vietnamese') >= 1000
    },
    {
        id: 'eng_star', name: 'Ngôi Sao Tiếng Anh', icon: '🇬🇧',
        description: 'Trả lời đúng 50 câu Tiếng Anh',
        category: 'subject',
        check: (p) => countCorrectBySubject(p, 'english') >= 50
    },
    {
        id: 'eng_master', name: 'Đại Sứ Ngôn Ngữ', icon: '🌐',
        description: 'Trả lời đúng 500 câu Tiếng Anh',
        category: 'subject',
        check: (p) => countCorrectBySubject(p, 'english') >= 500
    },
    {
        id: 'finance_wiz', name: 'Phù Thủy Tài Chính', icon: '🏦',
        description: 'Trả lời đúng 50 câu Tài chính',
        category: 'subject',
        check: (p) => countCorrectBySubject(p, 'finance') >= 50
    },
    {
        id: 'finance_tycoon', name: 'Ông Trùm Tài Chính', icon: '🤑',
        description: 'Trả lời đúng 300 câu Tài chính',
        category: 'subject',
        check: (p) => countCorrectBySubject(p, 'finance') >= 300
    },
    {
        id: 'all_rounder', name: 'Toàn Diện', icon: '🌟',
        description: 'Đúng ít nhất 50 câu ở MỖI môn học',
        category: 'subject',
        check: (p) => ['math', 'vietnamese', 'english', 'finance'].every(id => countCorrectBySubject(p, id) >= 50)
    },

    // ===========================
    // === ELOQUENCE (Hùng biện & Giao tiếp) ===
    // ===========================
    {
        id: 'voice_vietnamese', name: 'Giọng Đọc Truyền Cảm', icon: '🎤',
        description: 'Hoàn thành 5 bài Đọc Diễn Cảm (Tiếng Việt)',
        category: 'subject',
        check: (p) => {
            const skillIds = Object.keys(p.skills || {}).filter(id => id.includes('doc-dien-cam'));
            return skillIds.reduce((sum, id) => sum + (p.skills[id]?.attempts || 0), 0) >= 5;
        }
    },
    {
        id: 'orator_vietnamese', name: 'Nhà Hùng Biện Nhí', icon: '🗣️',
        description: 'Hoàn thành 5 bài Hùng Biện (Tiếng Việt)',
        category: 'subject',
        check: (p) => {
            const skillIds = Object.keys(p.skills || {}).filter(id => id.includes('hung-bien'));
            return skillIds.reduce((sum, id) => sum + (p.skills[id]?.attempts || 0), 0) >= 5;
        }
    },
    {
        id: 'voice_english', name: 'English Speaker', icon: '🎙️',
        description: 'Hoàn thành 5 bài Đọc Tiếng Anh',
        category: 'subject',
        check: (p) => {
            const skillIds = Object.keys(p.skills || {}).filter(id => id.includes('eng-speak'));
            return skillIds.reduce((sum, id) => sum + (p.skills[id]?.attempts || 0), 0) >= 5;
        }
    },
    {
        id: 'orator_english', name: 'Story Explorer', icon: '📖',
        description: 'Hoàn thành 5 bài Story Quest Tiếng Anh',
        category: 'subject',
        check: (p) => {
            const skillIds = Object.keys(p.skills || {}).filter(id => id.includes('eng-story-quest'));
            return skillIds.reduce((sum, id) => sum + (p.skills[id]?.attempts || 0), 0) >= 5;
        }
    },

    // ===========================
    // === STREAK (Bền Bỉ)     ===  7 badges
    // ===========================
    {
        id: 'streak_3', name: 'Chăm Chỉ', icon: '📚',
        description: '3 ngày học liên tục',
        category: 'streak',
        check: (p) => (p.dailyStreak || 0) >= 3
    },
    {
        id: 'streak_7', name: 'Kiên Trì', icon: '🔥',
        description: '7 ngày học liên tục',
        category: 'streak',
        check: (p) => (p.dailyStreak || 0) >= 7
    },
    {
        id: 'streak_14', name: 'Bền Bỉ', icon: '💪',
        description: '14 ngày học liên tục',
        category: 'streak',
        check: (p) => (p.dailyStreak || 0) >= 14
    },
    {
        id: 'streak_30', name: 'Huyền Thoại', icon: '💎',
        description: '30 ngày học liên tục',
        category: 'streak',
        check: (p) => (p.dailyStreak || 0) >= 30
    },
    {
        id: 'streak_60', name: 'Siêu Nhân', icon: '🦸',
        description: '60 ngày học liên tục',
        category: 'streak',
        check: (p) => (p.dailyStreak || 0) >= 60
    },
    {
        id: 'streak_100', name: 'Bất Bại', icon: '👑',
        description: '100 ngày học liên tục',
        category: 'streak',
        check: (p) => (p.dailyStreak || 0) >= 100
    },
    {
        id: 'streak_365', name: 'Trọn Năm Kiên Trì', icon: '🌍',
        description: '365 ngày học liên tục — Cả năm không nghỉ!',
        category: 'streak',
        check: (p) => (p.dailyStreak || 0) >= 365
    },

    // ===========================
    // === PERFORMANCE (Kỹ năng)==  7 badges (tăng từ 2)
    // ===========================
    {
        id: 'perfect_10', name: 'Hoàn Hảo', icon: '⭐',
        description: '10 câu đúng liên tục trong 1 skill',
        category: 'performance',
        check: (p) => Object.values(p.skills).some(s => s.streak >= 10)
    },
    {
        id: 'perfect_20', name: 'Siêu Chính Xác', icon: '🎯',
        description: '20 câu đúng liên tục trong 1 skill',
        category: 'performance',
        check: (p) => Object.values(p.skills).some(s => s.streak >= 20)
    },
    {
        id: 'perfect_50', name: 'Không Sai Một Câu', icon: '💯',
        description: '50 câu đúng liên tục — Phi thường!',
        category: 'performance',
        check: (p) => Object.values(p.skills).some(s => s.streak >= 50)
    },
    {
        id: 'speed_demon', name: 'Vua Tốc Độ', icon: '⚡',
        description: 'Hoàn thành thách đấu dưới 3 phút',
        category: 'performance',
        check: (p) => (p.bestTimeSeconds || 999999) < 180
    },
    {
        id: 'total_500_correct', name: 'Chinh Phục 500', icon: '🏔️',
        description: 'Trả lời đúng tổng cộng 500 câu',
        category: 'performance',
        check: (p) => countTotalCorrect(p) >= 500
    },
    {
        id: 'total_2000_correct', name: 'Chinh Phục 2000', icon: '🗻',
        description: 'Trả lời đúng tổng cộng 2.000 câu',
        category: 'performance',
        check: (p) => countTotalCorrect(p) >= 2000
    },
    {
        id: 'total_5000_correct', name: 'Chinh Phục 5000', icon: '🌋',
        description: 'Trả lời đúng tổng cộng 5.000 câu — Huyền thoại!',
        category: 'performance',
        check: (p) => countTotalCorrect(p) >= 5000
    },

    // ===========================
    // === ECONOMY (Tài Chính)  ===  6 badges (tăng từ 3)
    // ===========================
    {
        id: 'first_earn', name: 'Đồng Tiền Đầu Tiên', icon: '🪙',
        description: 'Kiếm được đồng tiền đầu tiên',
        category: 'economy',
        check: (p) => ((p.balance || 0) + (p.savings || 0)) > 0
    },
    {
        id: 'saver_50k', name: 'Tiết Kiệm Giỏi', icon: '💰',
        description: 'Tích lũy tổng 50.000 VND',
        category: 'economy',
        check: (p) => ((p.balance || 0) + (p.savings || 0)) >= 50000
    },
    {
        id: 'saver_100k', name: 'Đại Gia Nhí', icon: '💸',
        description: 'Tích lũy tổng 100.000 VND',
        category: 'economy',
        check: (p) => ((p.balance || 0) + (p.savings || 0)) >= 100000
    },
    {
        id: 'saver_500k', name: 'Triệu Phú Nhí', icon: '💎',
        description: 'Tích lũy tổng 500.000 VND',
        category: 'economy',
        check: (p) => ((p.balance || 0) + (p.savings || 0)) >= 500000
    },
    {
        id: 'shopper', name: 'Mua Sắm Thông Minh', icon: '🛍️',
        description: 'Mua 3 món đồ từ cửa hàng',
        category: 'economy',
        check: (p) => (p.inventory || []).length >= 3
    },
    {
        id: 'shopper_pro', name: 'Nhà Sưu Tầm', icon: '🎁',
        description: 'Mua 10 món đồ từ cửa hàng',
        category: 'economy',
        check: (p) => (p.inventory || []).length >= 10
    },

    // ===========================
    // === RANK (Danh Hiệu)    ===  2 badges
    // ===========================
    {
        id: 'rank_expert', name: 'Chuyên Gia', icon: '🧑‍🔬',
        description: 'Đạt danh hiệu Chuyên Gia',
        category: 'rank',
        check: (p) => {
            const rank = getOverallRank(p);
            return rank.label === 'Chuyên Gia' || rank.label === 'Trạng Nguyên';
        }
    },
    {
        id: 'rank_champion', name: 'Trạng Nguyên', icon: '🏆',
        description: 'Đạt danh hiệu Trạng Nguyên',
        category: 'rank',
        check: (p) => getOverallRank(p).label === 'Trạng Nguyên'
    },

    // ===========================
    // === SPECIAL (Đặc Biệt)  ===  6 badges (MỚI)
    // ===========================
    {
        id: 'unlock_english', name: 'Mở Khóa Tiếng Anh', icon: '🔓',
        description: 'Mở khóa thành công môn Tiếng Anh',
        category: 'special',
        check: (p) => {
            const mathSkills = Object.values(SKILL_MAP).filter(s => s.subjectId === 'math');
            const vietSkills = Object.values(SKILL_MAP).filter(s => s.subjectId === 'vietnamese');
            if (mathSkills.length === 0 || vietSkills.length === 0) return false;
            const mathProf = mathSkills.filter(s => p.skills?.[s.id]?.mastery >= 0.5).length / mathSkills.length * 100;
            const vietProf = vietSkills.filter(s => p.skills?.[s.id]?.mastery >= 0.5).length / vietSkills.length * 100;
            return mathProf >= 25 && vietProf >= 25;
        }
    },
    {
        id: 'unlock_finance', name: 'Mở Khóa Tài Chính', icon: '🗝️',
        description: 'Mở khóa thành công môn Tài Chính',
        category: 'special',
        check: (p) => {
            return ['math', 'vietnamese', 'english'].every(subId => {
                const skills = Object.values(SKILL_MAP).filter(s => s.subjectId === subId);
                if (skills.length === 0) return false;
                return skills.filter(s => p.skills?.[s.id]?.mastery >= 0.5).length / skills.length * 100 >= 40;
            });
        }
    },
    {
        id: 'total_1000', name: 'Vượt Nghìn', icon: '🎯',
        description: 'Đạt 1.000 Điểm Tổng',
        category: 'special',
        check: (p) => (p.totalScore || 0) >= 1000
    },
    {
        id: 'total_10000', name: 'Vạn Lý Trường Thành', icon: '🏰',
        description: 'Đạt 10.000 Điểm Tổng',
        category: 'special',
        check: (p) => (p.totalScore || 0) >= 10000
    },
    {
        id: 'mastery_all_50', name: 'Nửa Đường Vinh Quang', icon: '🛤️',
        description: '50% kỹ năng trong app đạt mức Khá',
        category: 'special',
        check: (p) => {
            const all = Object.values(SKILL_MAP);
            if (all.length === 0) return false;
            return all.filter(s => p.skills?.[s.id]?.mastery >= 0.5).length / all.length >= 0.5;
        }
    },
    {
        id: 'mastery_all_100', name: 'Hoàn Thành 100%', icon: '🌟',
        description: 'Tất cả kỹ năng đạt mức Khá — Phi thường!',
        category: 'special',
        check: (p) => {
            const all = Object.values(SKILL_MAP);
            if (all.length === 0) return false;
            return all.filter(s => p.skills?.[s.id]?.mastery >= 0.5).length === all.length;
        }
    },
];

/** Kiểm tra và trả về danh sách badges MỚI đạt được */
export function checkNewBadges(progress: ProgressData): string[] {
    const currentBadges = progress.badges || [];
    const newBadges: string[] = [];

    for (const badge of BADGE_DEFINITIONS) {
        if (!currentBadges.includes(badge.id) && badge.check(progress)) {
            newBadges.push(badge.id);
        }
    }

    return newBadges;
}

/** Lấy thông tin badge theo ID */
export function getBadgeInfo(badgeId: string): BadgeDefinition | undefined {
    return BADGE_DEFINITIONS.find(b => b.id === badgeId);
}

/** Trả về progress đã cập nhật badges */
export function applyNewBadges(progress: ProgressData, newBadgeIds: string[]): ProgressData {
    if (newBadgeIds.length === 0) return progress;
    return {
        ...progress,
        badges: [...(progress.badges || []), ...newBadgeIds]
    };
}
