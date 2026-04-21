# Feature Inventory

Tai lieu nay liet ke toan bo tinh nang nghiep vu dang ton tai trong project hien tai, gom:

- tinh nang dang co
- route/page lien quan
- API lien quan
- muc do uu tien cho ban rewrite moi
- de xuat: giu, hoan, bo, hay thiet ke lai

Muc dich cua tai lieu nay la "dong bang pham vi" truoc khi scaffold project moi.

## 1. Nhom nguoi dung hien co

He thong hien tai co 4 nhom actor:

1. `student`
   Hoc sinh vao bang profile, co the co PIN rieng.

2. `family account`
   Tai khoan dang nhap/chu so huu de dong bo storage va quan ly profile.

3. `parent`
   Phu huynh co PIN rieng, duyet phan thuong va xem diem yeu.

4. `admin`
   Quan tri he thong, quan ly hoc sinh, phu huynh, question bank.

## 2. Inventory theo nhom tinh nang

## 2.1 Identity va access

### F-01 Family account login/register

- Mo ta:
  Dang nhap hoac dang ky tai khoan gia dinh bang `username + pin`.
- UI:
  - `/login`
  - `components/auth/login-screen.tsx`
- API:
  - `POST /api/account/login`
  - `POST /api/account/register`
- Trang thai rewrite:
  `KEEP-P1`
- Ghi chu:
  Can giu, nhung rewrite theo session server-side ro rang hon.

### F-02 Student profile selection

- Mo ta:
  Chon profile hoc sinh de vao hoc.
- UI:
  - `/profiles`
- Hanh vi:
  - hien tat ca profile
  - mo profile co PIN
  - cho phep chuyen sang cloud profile khac source
- Trang thai rewrite:
  `KEEP-P1`
- Ghi chu:
  Day la entry point hoc sinh, bat buoc giu.

### F-03 Student profile PIN

- Mo ta:
  PIN bao ve tung ho so hoc sinh.
- UI:
  - `/profiles`
  - `/subjects` phan cai dat
- API:
  - `POST /api/admin/profiles/pin`
- Trang thai rewrite:
  `KEEP-P1`
- Ghi chu:
  Nen tach credential hoc sinh thanh bang rieng.

### F-04 Admin setup/login/session

- Mo ta:
  Tao admin ban dau, dang nhap admin, giu session admin theo thiet bi.
- UI:
  - `/admin`
  - `/admin/password`
  - `/admin/dashboard`
- Trang thai rewrite:
  `KEEP-P1`
- Ghi chu:
  Bat buoc thiet ke lai session va guard, khong dua vao local/session storage lam nguon su that.

### F-05 Parent login/session

- Mo ta:
  Phu huynh chon tai khoan va dang nhap bang PIN.
- UI:
  - `/login/parent`
  - `/parent/dashboard`
- Trang thai rewrite:
  `KEEP-P1`
- Ghi chu:
  Can giu, nhung rewrite theo parent auth/session thuc su.

## 2.2 Student learning flow

### F-06 Subject dashboard

- Mo ta:
  Man hinh chon mon hoc sau khi hoc sinh vao profile.
- UI:
  - `/subjects`
- Hanh vi:
  - chon mon `math`, `vietnamese`, `english`, `finance`
  - hien progress theo mon
  - doi lop
  - bat/tat hien thi leaderboard
  - doi/xoa PIN profile
- Trang thai rewrite:
  `KEEP-P1`
- Ghi chu:
  Nen giu, day la home page nghiep vu cua hoc sinh.

### F-07 Subject unlock progression

- Mo ta:
  Mon sau bi khoa neu mastery cac mon truoc chua dat.
- UI:
  - `/subjects`
  - `/today`
  - `/report`
- Trang thai rewrite:
  `KEEP-P1`
- Ghi chu:
  Logic progression nen chuyen thanh domain rule test duoc.

### F-08 Today challenge mode

- Mo ta:
  Phien hoc theo mon, co che do 10/20/30 cau, co timer, tinh streak va tong ket.
- UI:
  - `/today?subject=...`
- API:
  - `GET /api/curriculum`
  - `POST /api/question`
  - `POST /api/evaluate`
- Trang thai rewrite:
  `KEEP-P1`
- Ghi chu:
  Day la core learning loop, bat buoc giu.

### F-09 Practice-by-skill mode

- Mo ta:
  Luyen rieng tung skill theo phien 10 cau.
- UI:
  - `/practice`
  - `/practice/[skillId]`
- API:
  - `POST /api/question`
  - `POST /api/evaluate`
- Trang thai rewrite:
  `KEEP-P1`
- Ghi chu:
  Bat buoc giu, nhung co the ra sau `Today mode` neu can cat pham vi MVP.

### F-10 Question engine

- Mo ta:
  Lay cau hoi tu:
  - question bank duyet
  - static fallback
  - AI generation fallback
- API:
  - `POST /api/question`
- Trang thai rewrite:
  `KEEP-P1`
- Ghi chu:
  Can giu theo 3 tang fallback, nhung tach route handler khoi generation logic.

### F-11 AI evaluation cho speaking/reading

- Mo ta:
  Goi AI de danh gia bai noi/doc va tra feedback.
- API:
  - `POST /api/evaluate`
- Trang thai rewrite:
  `KEEP-P2`
- Ghi chu:
  Nen giu, nhung co the dua vao dot 2 neu muon on dinh phien ban dau bang MCQ/input truoc.

### F-12 Mastery progression

- Mo ta:
  Update mastery, level, streak, wrong streak, stability.
- Code hien tai:
  - `lib/mastery.ts`
- Trang thai rewrite:
  `KEEP-P1`
- Ghi chu:
  Bat buoc giu. Nen viet unit test ngay tu dau.

### F-13 Review queue / spaced repetition

- Mo ta:
  Dua cau sai vao hang doi on lai.
- Code hien tai:
  - `lib/spaced-repetition.ts`
- UI:
  - `/today`
  - `/practice/[skillId]`
- Trang thai rewrite:
  `KEEP-P2`
- Ghi chu:
  Co gia tri, nhung co the hoan sau khi core practice on.

### F-14 Badges va achievement

- Mo ta:
  Gan huy hieu theo tien do hoc tap.
- UI:
  - `/subjects`
  - `/practice/[skillId]`
- Trang thai rewrite:
  `KEEP-P2`
- Ghi chu:
  Nen giu, nhung khong can la phan dau tien cua rewrite.

### F-15 Progress report

- Mo ta:
  Bao cao theo mon, hoc ky, muc mastery, rank tong.
- UI:
  - `/report`
- Trang thai rewrite:
  `KEEP-P2`
- Ghi chu:
  Nen giu, vi phu huynh/hoc sinh can nhin thay tien bo.

## 2.3 Finance va reward

### F-16 Wallet overview

- Mo ta:
  Man hinh vi tien cua hoc sinh.
- UI:
  - `/wallet`
- Hanh vi:
  - xem so du
  - xem tong tai san
  - xem streak diem danh
- Trang thai rewrite:
  `KEEP-P2`
- Ghi chu:
  Co gia tri san pham cao, nhung khong phai khoi dau rewrite.

### F-17 Daily attendance reward

- Mo ta:
  Diem danh moi ngay nhan thuong va moc thuong 10/20/30 ngay.
- UI:
  - `/wallet`
- Trang thai rewrite:
  `KEEP-P2`

### F-18 Shop purchase request

- Mo ta:
  Hoc sinh dung so du de mua vat pham, vat pham vao trang thai `pending`.
- UI:
  - `/wallet`
- Trang thai rewrite:
  `KEEP-P2`

### F-19 Savings / piggy bank / bank deposit

- Mo ta:
  Heo dat, muc tieu tiet kiem, gui tiet kiem ky han.
- UI:
  - `/wallet`
- Trang thai rewrite:
  `DEFER-P3`
- Ghi chu:
  Day la nhom tinh nang vui va hay, nhung co the hoan sau khi core hoc + reward on.

### F-20 Transaction history

- Mo ta:
  Lich su thu chi, gui rut, mua sam.
- UI:
  - `/wallet`
- Trang thai rewrite:
  `KEEP-P2`

### F-21 Parent reward approval

- Mo ta:
  Phu huynh duyet/tu choi mon qua dang cho duyet.
- UI:
  - `/parent/dashboard`
- API:
  - `POST /api/account/reward`
- Trang thai rewrite:
  `KEEP-P2`
- Ghi chu:
  Rat quan trong neu muon giu mo hinh hoc + thuong.

## 2.4 Parent workflow

### F-22 Parent dashboard

- Mo ta:
  Phu huynh xem hoc sinh dang quan ly, muc yeu, va reward pending.
- UI:
  - `/parent/dashboard`
- Trang thai rewrite:
  `KEEP-P2`

### F-23 Parent-child linking

- Mo ta:
  Gan va go hoc sinh cho phu huynh.
- UI:
  - `/admin/parents`
- API:
  - `POST /api/admin/parents/assign`
  - `POST /api/admin/parents/unassign`
- Trang thai rewrite:
  `KEEP-P1`
- Ghi chu:
  Can co trong data model moi ngay tu dau.

## 2.5 Leaderboard va social proof

### F-24 Global leaderboard

- Mo ta:
  Bang xep hang top 100, theo tong diem va diem mon.
- UI:
  - `/leaderboard`
- API:
  - doc truc tiep bang `leaderboard`
  - `POST /api/admin/leaderboard-sync`
- Trang thai rewrite:
  `KEEP-P2`
- Ghi chu:
  Nen giu, nhung co the den sau auth + progress.

### F-25 Top 5 preview tren man hinh profile

- Mo ta:
  Hien top 5 ngay man hinh chon profile.
- UI:
  - `/profiles`
- Trang thai rewrite:
  `DEFER-P3`
- Ghi chu:
  Khong phai tinh nang cot loi cho dot dau.

## 2.6 Admin operations

### F-26 Admin dashboard

- Mo ta:
  Man hinh dieu huong cac cong cu admin.
- UI:
  - `/admin/dashboard`
- Trang thai rewrite:
  `KEEP-P1`

### F-27 Admin password change

- Mo ta:
  Doi PIN admin.
- UI:
  - `/admin/password`
- Trang thai rewrite:
  `KEEP-P1`

### F-28 Admin student management

- Mo ta:
  Tim hoc sinh, tao hoc sinh, doi PIN, xoa hoc sinh.
- UI:
  - `/admin/users`
- API:
  - `POST /api/admin/profiles/create`
  - `POST /api/admin/profiles/pin`
  - `POST /api/admin/profiles/delete`
- Trang thai rewrite:
  `KEEP-P1`

### F-29 Admin parent management

- Mo ta:
  Tao phu huynh, xoa phu huynh, gan/go hoc sinh.
- UI:
  - `/admin/parents`
- API:
  - `POST /api/admin/parents/create`
  - `POST /api/admin/parents/delete`
  - `POST /api/admin/parents/assign`
  - `POST /api/admin/parents/unassign`
- Trang thai rewrite:
  `KEEP-P1`

### F-30 Question bank management

- Mo ta:
  Quan ly skill mapping, template, import Word, import JSON, sua cau hoi.
- UI:
  - `/admin/question-sources`
- API:
  - `GET /api/admin/question-sources/list`
  - `POST /api/admin/question-sources/update`
  - `POST /api/admin/question-templates/update`
  - `POST /api/admin/question-bank/import`
  - `POST /api/admin/question-bank/upsert`
- Trang thai rewrite:
  `KEEP-P2`
- Ghi chu:
  Tinh nang nay lon. Dot dau co the chi giu read + import don gian, roi nang cap sau.

## 2.7 Sync, storage, operational

### F-31 Account storage sync

- Mo ta:
  Dong bo storage len cloud theo `syncId`.
- API:
  - `GET /api/account/storage`
  - `POST /api/account/sync`
  - `GET /api/account/list`
- Trang thai rewrite:
  `REDESIGN-P1`
- Ghi chu:
  Khong giu nguyen cach snapshot blob. Rewrite thanh entity-based persistence.

### F-32 Health check

- Mo ta:
  Check env va service role.
- API:
  - `GET /api/health`
- Trang thai rewrite:
  `KEEP-P1`

### F-33 Curriculum-driven selection

- Mo ta:
  Tai context curriculum theo mon/lop/profile.
- API:
  - `GET /api/curriculum`
- Trang thai rewrite:
  `KEEP-P2`

## 3. Tinh nang nen bo hoac thiet ke lai

### R-01 App reset bang master keyword tren UI

- Noi dung:
  Nut reset ung dung o man admin login.
- Trang thai rewrite:
  `DROP`
- Ly do:
  Nguy hiem, de lam mat du lieu, khong nen ton tai tren UI production.

### R-02 Local/session storage la session chinh

- Noi dung:
  Admin session, parent session, current user, sync id, profile session dua nhieu vao browser storage.
- Trang thai rewrite:
  `DROP-AS-ARCHITECTURE`
- Ly do:
  Can thay bang auth/session server-side.

### R-03 JSON blob `AppStorage` lam nguon su that

- Noi dung:
  Toan bo account state duoc merge/sanitize tu mot blob lon.
- Trang thai rewrite:
  `DROP-AS-DATA-MODEL`
- Ly do:
  Day la mot trong cac nguyen nhan chinh gay loi day chuyen.

### R-04 Prompt PIN admin bang `window.prompt`

- Noi dung:
  Nhieu thao tac admin yeu cau nhap lai PIN bang popup trinh duyet.
- Trang thai rewrite:
  `REPLACE`
- Ly do:
  Nen dung re-auth flow co kiem soat hon.

## 4. Muc uu tien cho ban rewrite

### P1: Bat buoc co trong dot 1

- Family account login/register
- Student profile selection
- Student profile PIN
- Admin setup/login/session
- Parent login/session
- Subject dashboard
- Subject unlock progression
- Today challenge mode
- Practice-by-skill mode
- Question engine
- Mastery progression
- Parent-child linking
- Admin dashboard
- Admin password change
- Admin student management
- Admin parent management
- Health check
- Persistence moi thay cho account storage snapshot

### P2: Nen co trong dot 2

- AI evaluation cho speaking/reading
- Review queue
- Badges
- Progress report
- Wallet overview
- Daily attendance reward
- Shop purchase request
- Transaction history
- Parent reward approval
- Parent dashboard
- Global leaderboard
- Question bank management
- Curriculum-driven selection

### P3: Co the hoan

- Piggy bank
- Savings goal
- Bank deposit
- Top 5 preview tren man hinh profile

## 5. Route inventory hien tai

### Public / student

- `/`
- `/profiles`
- `/subjects`
- `/today`
- `/practice`
- `/practice/[skillId]`
- `/report`
- `/wallet`
- `/leaderboard`
- `/math`
- `/vietnamese`
- `/english`
- `/finance`

### Auth / access

- `/login`
- `/login/parent`
- `/admin`

### Parent

- `/parent/dashboard`

### Admin

- `/admin/dashboard`
- `/admin/password`
- `/admin/users`
- `/admin/parents`
- `/admin/question-sources`
- `/admin/library`

## 6. API inventory hien tai

### Core learning

- `GET /api/health`
- `GET /api/curriculum`
- `POST /api/question`
- `POST /api/evaluate`

### Account

- `POST /api/account/login`
- `POST /api/account/register`
- `GET /api/account/storage`
- `POST /api/account/sync`
- `GET /api/account/list`
- `POST /api/account/reward`

### Admin student

- `POST /api/admin/profiles/create`
- `POST /api/admin/profiles/pin`
- `POST /api/admin/profiles/delete`

### Admin parent

- `POST /api/admin/parents/create`
- `POST /api/admin/parents/delete`
- `POST /api/admin/parents/assign`
- `POST /api/admin/parents/unassign`

### Admin content

- `GET /api/admin/question-sources/list`
- `POST /api/admin/question-sources/update`
- `POST /api/admin/question-templates/update`
- `POST /api/admin/question-bank/import`
- `POST /api/admin/question-bank/upsert`
- `POST /api/admin/leaderboard-sync`

## 7. MVP de xuat cho ban moi

Neu muon rewrite theo cach an toan va ra duoc ban dung som, MVP nen gom:

1. Auth co ban:
   family account, student profile, admin, parent.

2. Student core loop:
   profile -> subjects -> today/practice -> save progress.

3. Data core:
   students, parents, parent-student-links, progress, skill mastery.

4. Admin core:
   student CRUD, parent CRUD, link/unlink.

5. Question core:
   question bank + static fallback.

6. Van hanh:
   health check, logging co ban, test smoke co ban.

Nhung muc sau co the dua vao milestone tiep theo:

- AI speaking evaluation
- wallet day du
- reward approval day du
- report nang cao
- leaderboard day du
- question bank tooling day du

## 8. Quyet dinh chot pham vi

Ket luan de thi cong rewrite:

- Ban moi khong nen co muc tieu "copy 100% project cu".
- Ban moi nen giu 100% core loop hoc va quan ly.
- Ban moi nen tri hoan mot phan gamification tai chinh de tap trung vao do on dinh.
- Ban moi phai thay data model snapshot blob bang entity model.
- Ban moi phai co auth/session dung nghia truoc khi lam tinh nang dep va phu.

## 9. Buoc tiep theo de xuat

Sau tai lieu nay, buoc hop ly nhat la:

1. Viet `data-schema-draft.md` cho schema moi.
2. Chot `api-contract-draft.md` cho P1.
3. Scaffold project rewrite moi theo blueprint va inventory da dong bang.
