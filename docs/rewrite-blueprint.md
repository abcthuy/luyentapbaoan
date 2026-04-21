# Rewrite Blueprint

Tai lieu nay mo ta ban thiet ke rewrite cho mot du an moi dua tren he thong hien tai, nham dat muc tieu on dinh hon, de bao tri hon, it loi day chuyen hon, va co quy trinh release an toan hon.

## 1. Muc tieu rewrite

Du an moi phai dat duoc 6 muc tieu sau:

1. Tach ro UI, business logic, server API, va persistence.
2. Khong de client giu vai tro nguon su that cua toan bo du lieu.
3. Khong de mot provider lon quan ly qua nhieu trach nhiem.
4. Moi du lieu vao/ra deu duoc validate o bien he thong.
5. Loi o mot module khong lam sap toan bo app.
6. Co the kiem thu, deploy, rollback, va mo rong theo module.

## 2. Pham vi giu lai va pham vi lam lai

### Giu lai

- San pham cot loi: hoc sinh luyen tap, phu huynh theo doi, admin quan ly.
- 4 nhom mon hoc hien co: math, vietnamese, english, finance.
- Logic nghiep vu can giu gia tri: profile hoc sinh, tien thuong, leaderboard, bai tap, question bank, curriculum.
- Cac endpoint va module server dang di dung huong co the tham khao de tach logic.

### Lam lai

- State management phia client.
- Luong auth va session.
- Cau truc luu tru chinh.
- API contract giua client va server.
- Schema database va migration.
- Logging, monitoring, test, va release workflow.

## 3. Chan doan he thong hien tai

He thong hien tai dang co 5 van de kien truc chinh:

1. `AppStorage` gom qua nhieu trach nhiem.
   No dong vai tro vua la local cache, vua la cloud snapshot, vua la auth/session store, vua la admin payload, vua la parent-child directory.

2. Client dang gop qua nhieu logic quan trong.
   `components/progress-provider.tsx`, `hooks/use-auth.tsx`, va `hooks/use-profile.tsx` dang vua quan ly state, vua merge du lieu, vua goi API, vua xu ly auth/session, vua xu ly optimistic update.

3. Nguon su that du lieu chua ro rang.
   Du lieu co the den tu localStorage, cloud storage row, merge runtime, va server sanitation. Dieu nay de tao ra bug "khong biet gia tri nao moi la gia tri dung".

4. Model du lieu dang snapshot-based thay vi entity-based.
   Bang `math_progress` luu mot khoi JSON lon. Cach nay nhanh cho giai doan dau, nhung rat de phat sinh merge conflict, race condition, data drift, va kho kiem tra.

5. Luong bao mat va phan quyen chua du chat.
   Cho du da co huong chuyen dan sang server API, nhieu nghiep vu van mang dau an cua client-trusted architecture.

## 4. Nguyen tac kien truc cho ban moi

Ban moi phai tuan theo 8 nguyen tac:

1. Server la nguon su that cho du lieu ben vung.
2. Client chi giu view state va cache tam thoi.
3. Moi use case quan trong phai di qua service layer.
4. Moi request body va response payload phai co schema validate.
5. Moi module co boundary ro rang, khong import lon xon.
6. Khong dung mot JSON snapshot lam trung tam he thong.
7. Moi thay doi du lieu phai co audit fields va quy uoc xung dot.
8. Feature moi phai di kem smoke test hoac regression test toi thieu.

## 5. Kien truc muc tieu

De xuat dung van `Next.js App Router`, nhung doi to chuc code thanh 6 lop ro rang:

1. `app/`
   Route, layout, server actions nho, page composition.

2. `features/`
   Tung module nghiep vu doc lap:
   - `features/auth`
   - `features/profiles`
   - `features/practice`
   - `features/parents`
   - `features/admin`
   - `features/wallet`
   - `features/leaderboard`
   - `features/content`

3. `domains/`
   Kieu du lieu, rule, use case core, khong phu thuoc UI.

4. `server/`
   Repository, service, auth guard, db adapter, logging, event, scheduler.

5. `shared/`
   UI primitives, utils, constants, validation schemas, typed helpers.

6. `tests/`
   Unit, integration, smoke.

Mau cau truc:

```text
src/
  app/
  features/
    auth/
    profiles/
    practice/
    parents/
    admin/
    wallet/
    leaderboard/
    content/
  domains/
    account/
    learner/
    progress/
    curriculum/
    question/
    reward/
  server/
    auth/
    db/
    repositories/
    services/
    policies/
    jobs/
  shared/
    ui/
    lib/
    schemas/
    types/
  tests/
```

## 6. Kien truc du lieu de xuat

Thay vi luu mot `AppStorage` JSON lon la trung tam, tach thanh entity ro rang.

### 6.1 Entity cot loi

- `accounts`
  Tai khoan gia dinh hoac chu so huu.

- `users`
  Nguoi dung dang nhap he thong: admin, parent, owner.

- `students`
  Ho so hoc sinh.

- `student_credentials`
  PIN hoc sinh, hash rieng, versioned.

- `parents`
  Ho so phu huynh.

- `parent_student_links`
  Quan he parent-child.

- `student_progress`
  Tong hop thong ke hoc tap theo hoc sinh.

- `student_skill_mastery`
  Mastery theo skill.

- `student_wallets`
  So du, tiet kiem.

- `wallet_transactions`
  Lich su thu chi.

- `inventory_items`
  Vat pham da mua / cho duyet.

- `question_bank`
  Ngan hang cau hoi co duyet.

- `question_templates`
  Mau sinh cau hoi.

- `curricula`
  Chuong trinh.

- `curriculum_skills`
  Skill trong chuong trinh.

- `practice_sessions`
  Luot hoc va ket qua.

- `leaderboard_snapshots`
  Bang xep hang da tong hop.

### 6.2 Du lieu nen de JSON

Van co the dung JSON cho cac truong co cau truc mem:

- `question_bank.content`
- `question_templates.prompt_config`
- `practice_sessions.answer_payload`
- `student_progress.badges`

Nhung khong dung JSON blob de chua toan bo account state.

## 7. Auth va phan quyen

Ban moi can quy dinh ro actor:

- `owner`
  Quan ly tai khoan gia dinh.

- `admin`
  Quan tri noi dung va van hanh.

- `parent`
  Theo doi va duyet phan thuong.

- `student`
  Dang nhap bang profile/PIN de hoc.

### 7.1 Session

- Web session cho owner/admin/parent.
- Student session tach rieng, scope theo student id.
- Session token do server cap.
- Client khong tu ghi "ai dang dang nhap" vao localStorage de lam nguon su that.

### 7.2 Authorization

Moi API phai co guard ro:

- `requireAdmin`
- `requireOwner`
- `requireParentOfStudent`
- `requireStudentSession`

Khong dua vao payload tu client de quyet dinh quyen.

## 8. Question engine

Question engine moi nen co 3 tang fallback ro rang:

1. Approved question bank.
2. Static/generated deterministic fallback.
3. AI generation co validate schema va content rules.

Moi tang phai tra ve cung mot `QuestionDTO`.

### 8.1 Rule

- Validate truoc khi luu va truoc khi tra ve.
- Tuyen bo ro `question_type`, `subject_id`, `skill_code`, `difficulty_level`.
- Tach prompt generation khoi route handler.
- Luu telemetry cho AI failures, invalid output, fallback rate.

## 9. State management phia client

Khong lap lai `progress-provider` theo kieu mot context om het.

De xuat:

- Server components cho du lieu doc.
- Query layer typed cho fetch/update.
- Context chi dung cho view state cuc bo.
- Moi feature tu quan ly state cua no.

### 9.1 Nhung gi client duoc giu

- UI preferences.
- Tam luu thao tac dang nhap lieu.
- Cache ket qua query trong pham vi hop ly.
- Offline queue neu sau nay can, nhung phai tach rieng thanh mot module.

### 9.2 Nhung gi client khong duoc giu la nguon su that

- Danh sach hoc sinh toan cuc.
- Quan he parent-child.
- Admin credentials.
- Leaderboard canonical data.
- Tong tien va transaction ledger chinh.

## 10. API design

API moi nen theo use case, khong theo "dump storage".

### 10.1 Nhom account

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/student-login`
- `GET /api/me`

### 10.2 Nhom students

- `GET /api/students`
- `POST /api/students`
- `PATCH /api/students/:id`
- `DELETE /api/students/:id`

### 10.3 Nhom progress

- `GET /api/students/:id/progress`
- `POST /api/students/:id/practice-sessions`
- `POST /api/students/:id/mastery-events`

### 10.4 Nhom parents

- `GET /api/parents`
- `POST /api/parents`
- `POST /api/parents/:id/link-student`
- `POST /api/parents/:id/unlink-student`

### 10.5 Nhom rewards

- `POST /api/students/:id/reward-requests`
- `POST /api/reward-requests/:id/approve`
- `POST /api/reward-requests/:id/reject`

### 10.6 Nhom content/admin

- `GET /api/admin/question-sources`
- `POST /api/admin/question-bank/import`
- `POST /api/admin/question-bank/upsert`
- `POST /api/admin/question-templates/update`

## 11. Validation va error handling

Bat buoc co:

- Request schema.
- Response schema cho cac endpoint quan trong.
- Domain error types co ma loi ro rang.
- Error boundary cho page layer.
- Toast/notification map theo error code, khong map theo string tuy y.

Nhom ma loi de xuat:

- `AUTH_INVALID_CREDENTIALS`
- `AUTH_FORBIDDEN`
- `STUDENT_NOT_FOUND`
- `PARENT_LINK_CONFLICT`
- `QUESTION_INVALID_OUTPUT`
- `PERSISTENCE_CONFLICT`
- `RATE_LIMITED`

## 12. Logging, monitoring, audit

Ban moi phai co toi thieu:

- Request id cho moi request.
- Structured logs cho API va service layer.
- Audit log cho thao tac admin va parent.
- Metrics:
  - login failure rate
  - question generation fallback rate
  - sync failure rate
  - practice submit error rate
  - leaderboard rebuild duration

## 13. Test strategy

Khong cho rewrite xong roi moi nghi den test.

### 13.1 Unit tests

- Mastery calculation.
- Reward approval logic.
- Parent-child linking rules.
- Question validation rules.

### 13.2 Integration tests

- Student login -> practice -> save progress.
- Parent login -> approve reward.
- Admin import question bank.
- Leaderboard rebuild.

### 13.3 Smoke tests

- `/login`
- `/profiles` hoac student selector moi
- `/practice/[skillId]`
- `/parent/dashboard`
- `/admin`
- `/api/health`

## 14. Stack de xuat

Stack toi thieu cho ban moi:

- `Next.js` App Router
- `TypeScript`
- `Supabase` cho auth/data neu tiep tuc dung he sinh thai hien tai
- `Zod` cho schema validation
- `TanStack Query` hoac query layer tuong duong cho client data fetching
- `Vitest` cho unit/integration logic
- `Playwright` cho smoke E2E

Neu rewrite rat sau va muon quan ly schema chat hon, co the them:

- `Drizzle ORM` hoac `Prisma`

## 15. Ke hoach migration 5 giai doan

Khong rewrite bang cach copy het code cu sang project moi. Lam theo 5 giai doan:

### Giai doan 1: Discovery va domain freeze

- Liet ke toan bo feature dang co.
- Chot feature nao giu, feature nao bo, feature nao tri hoan.
- Ve lai data flow hien tai.
- Chot glossary: account, student, parent, profile, progress, reward, session.

Deliverable:
- Feature inventory
- Entity map
- API inventory

### Giai doan 2: Skeleton project moi

- Tao repo/app moi.
- Cai dat lint, format, test, env validation.
- Tao auth skeleton, db adapter, logging, error framework.
- Tao 2-3 page rong de test route flow.

Deliverable:
- Project build duoc
- CI co chay lint + test + build

### Giai doan 3: Core data va auth

- Tao schema database moi.
- Tao migration.
- Tao account/auth/role/session.
- Tao CRUD student va parent.

Deliverable:
- Dang nhap duoc
- Tao/sua/xoa hoc sinh duoc
- Link parent-child duoc

### Giai doan 4: Practice engine va rewards

- Port curriculum.
- Port question engine.
- Port mastery/progress.
- Port wallet/inventory/reward approval.

Deliverable:
- Hoc sinh hoc duoc
- Ket qua duoc luu dung
- Phu huynh duyet phan thuong duoc

### Giai doan 5: Admin, leaderboard, cutover

- Port admin content tools.
- Port leaderboard rebuild flow.
- Tao script migration du lieu cu sang schema moi.
- Chay song song staging.
- Chot cutover.

Deliverable:
- Admin van hanh duoc
- Leaderboard dung
- Co script import du lieu cu

## 16. Quy tac cutover

Chi duoc chuyen san xuat khi dat du 8 dieu kien:

1. Build pass.
2. Smoke tests pass.
3. Student login/practice luu du lieu pass.
4. Parent reward approval pass.
5. Admin content import pass.
6. Leaderboard rebuild pass.
7. Script migration data chay thanh cong tren ban sao staging.
8. Co rollback plan ro rang.

## 17. Thu tu lam viec de tranh sap du an

Thu tu uu tien de trien khai:

1. Dong bang nghiep vu.
2. Chot schema moi.
3. Chot auth va role.
4. Lam student/profile flow.
5. Lam practice submit flow.
6. Lam reward/wallet flow.
7. Lam parent dashboard.
8. Lam admin content flow.
9. Lam leaderboard.
10. Lam data migration.

Khong nen lam UI dep truoc khi auth, data model, va write path da on.

## 18. Dinh nghia "hoan thien"

Ban rewrite moi duoc xem la "hoan thien" khi:

- Khong con JSON blob la trung tam he thong.
- Khong con client-trusted write path cho du lieu nhay cam.
- Khong co provider trung tam om auth + sync + profile + admin + reward cung luc.
- Co test va smoke flow cho nghiep vu cot loi.
- Co migration du lieu cu.
- Co monitoring de biet loi dang xay ra o dau.

## 19. Quyet dinh thuc thi de xuat

Khuyen nghi thuc te:

- Khong sua tiep tren project nay de bien no thanh "ban cuoi".
- Tao mot project moi ben canh project nay.
- Dung project hien tai lam nguon tham chieu nghiep vu, khong lam khuon copy code.
- Chi port lai tung module sau khi da viet ro contract va test.

Neu di dung huong nay, buoc tiep theo nen la viet `feature inventory` va `data schema draft` cho ban moi, roi moi scaffold project rewrite.
