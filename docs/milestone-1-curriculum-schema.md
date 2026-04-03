# Milestone 1: Curriculum Schema And Math Grade 2 Seed

Milestone 1 chot nen du lieu cho he thong hoc theo chuong trinh, thay vi tiep tuc suy doan tu metadata roi rac trong code.

## Muc tieu

- Dua `curriculum` vao CSDL de co the mo rong nhieu lop va nhieu mon.
- Tach `thoi gian he thong` khoi `tien do hoc that` cua be.
- Tao mot mau chuan cho `Toan lop 2`.
- Chua thay doi selector/runtime o milestone nay.

## Nguyen tac thiet ke

- CSDL quan `chuong trinh hoc`, `phase`, `skill`, `prerequisite`, `tien do hoc`.
- Code van quan `generator`, `answer checking`, `mastery`, `review scheduling`.
- `Ngay he thong` chi duoc dung de goi y phase, khong phai nguon quyet dinh duy nhat.
- Moi be co `student_learning_state` rieng theo tung curriculum de biet dang hoc den dau, hoc nhanh/cham ra sao, va buoi hoc dang o mode nao.

## Bang du lieu

### `curricula`

Luu bo chuong trinh hoc goc cho tung mon/lop/phien ban.

Thong tin chinh:
- `subject_id`, `grade`, `version`
- `academic_year`
- `is_active`

### `curriculum_phases`

Chia nam hoc thanh cac phase de selector biet nen uu tien noi dung nao.

Mau cho Toan lop 2:
- `hk1_dau`
- `hk1_giua`
- `hk1_cuoi`
- `hk2_dau`
- `hk2_giua`
- `hk2_cuoi`

### `curriculum_topics`

Nhom cac skill theo mach kien thuc, vi du:
- `so-hoc`
- `hinh-hoc`
- `tu-duy`

### `curriculum_skills`

La bang quan trong nhat cua curriculum. Moi skill can du:
- `phase_id`
- `topic_id`
- `skill_code`
- `name`
- `order_index`
- `stage`
- `difficulty_band`
- `difficulty_base`
- `min_attempts`
- `min_mastery_to_unlock_next`
- `question_types`
- `is_core`
- `is_reviewable`
- `is_mixed_exam_eligible`
- `is_challenge`

### `curriculum_skill_prerequisites`

Xac dinh bai tien quyet, de mo bai theo dung chuong trinh thay vi chi theo diem tong.

### `student_learning_state`

Luu vi tri hoc hien tai cua tung be theo tung curriculum.

Thong tin chinh:
- khoa chinh logic: `profile_id + curriculum_id`
- `current_phase_id`
- `current_skill_id`
- `pace_mode`
- `learning_mode`
- `acceleration_level`
- `parent_override_mode`

### `student_skill_progress`

Luu tien do thuc te theo tung skill.

Thong tin chinh:
- `attempts`
- `correct_attempts`
- `mastery`
- `status`
- `last_attempt_at`
- `next_review_at`

## Vi sao can ca `student_learning_state` va `student_skill_progress`

- `student_skill_progress` cho biet be da lam bai do tot den dau.
- `student_learning_state` cho biet he thong nen day be di huong nao tiep theo trong thoi diem hien tai.

Neu chi co progress ma khong co state, selector se kho phan biet:
- hom nay nen hoc dung phase hien tai
- hay quay lai va lo hong
- hay mo challenge cho be gioi

## Seed mau cho Toan lop 2

Milestone 1 seed bo mau `curr-math-grade-2-v1` voi:
- 6 phase cua nam hoc
- 3 topic lon
- 13 skill lop 2 dang co san trong repo
- prerequisite co ban de mo bai theo thu tu hoc hop ly

Thu tu seed dau tay:
1. `A1` Cau tao so va so sanh
2. `A2` Cong tru
3. `A3` Dien so con thieu
4. `C1` Do dai va duong gap khuc
5. `D1` Hinh hoc co ban
6. `B1` Loi van 1 buoc
7. `A4` Bang nhan/chia 2 va 5
8. `C2` Thoi gian
9. `B2` Loi van 2 buoc
10. `D2` Bieu do tranh/bang
11. `E1` Quy luat day so
12. `E2` Bang o so
13. `E3` Thap so

## Pham vi Milestone 1

Milestone 1 chi lam 3 viec:
- chot schema du lieu
- tao seed mau cho `Toan lop 2`
- dat nen cho `student learning state`

Chua lam trong milestone nay:
- chuyen selector sang doc DB
- chuyen app sang runtime moi
- lam admin UI quan ly curriculum

## Buoc tiep theo sau Milestone 1

1. Viet selector moi doc `curriculum` va `student state`.
2. Gan `question bank / generator` vao tung `curriculum_skill`.
3. Tinh ti le phan phoi noi dung theo mode:
- `core`
- `review`
- `mixed`
- `challenge`
4. Sau khi Toan lop 2 on dinh moi nhan sang cac mon/lop khac.
