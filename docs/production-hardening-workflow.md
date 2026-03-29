# Production Hardening Workflow

Tai lieu nay la luong xu ly end-to-end de dua he thong hien tai sang trang thai on dinh va an toan hon cho production.

## Muc tieu

1. Giu ung dung chay on dinh, khong trang trang khi gap du lieu ban.
2. Khong lam mat du lieu cu.
3. Dua cac tac vu nhay cam tu client sang server.
4. Chuan bi de khoa policy Supabase an toan ma khong lam app gay.
5. Tao quy trinh backup, check, cleanup, deploy, rollback ro rang.

## Hien trang da hoan thanh

- Da nang cap framework va dependency chinh.
- Da co health endpoint: `GET /api/health`.
- Da co backup DB va cleanup co kiem soat.
- Da cleanup du lieu rac xac minh tren DB that.
- Da co API server cho leaderboard sync admin.
- Da harden mot phan xu ly du lieu trong client.

## Nguyen tac van hanh

1. Khong cleanup DB that khi chua backup.
2. Khong ap policy khoa `math_progress` truoc khi luong ghi server-side san sang.
3. Moi thay doi production deu theo thu tu:
   backup -> check -> code change -> build -> deploy -> smoke test -> DB verify.
4. Moi tac vu admin nhay cam phai di qua API server, khong ghi truc tiep tu client.

## Luong tong the

### Buoc 1: Khoa baseline va backup

Muc tieu:
- Co diem khoi phuc neu deploy hoac cleanup gap su co.

Thuc hien:
- Chay `npm run db:backup`
- Luu file backup trong thu muc `backups/`
- Ghi lai ngay gio backup va deploy commit

Pass:
- Co file backup JSON moi
- Co the doc duoc so row `math_progress` va `leaderboard`

Rollback:
- Dung file backup de khoi phuc bang SQL editor hoac script restore ve sau

### Buoc 2: Kiem tra DB truoc thay doi

Muc tieu:
- Biet chinh xac DB dang co van de gi.

Thuc hien:
- Chay `npm run db:check`
- Ghi lai:
  - record rong
  - duplicate leaderboard
  - parent-child cross-record

Pass:
- Bao cao DB doc duoc day du

Neu phat hien loi:
- Neu la record rac da xac minh, chay `npm run db:cleanup:verified`
- Neu la du lieu that nhung bat thuong, dung lai va xac minh bang tay

### Buoc 3: Chuyen tac vu nhay cam sang server

Muc tieu:
- Giam phu thuoc vao anon client write
- Chuan bi khoa policy Supabase

Tac vu can uu tien:

1. Leaderboard sync
   Trang thai:
   - Da xong qua `POST /api/admin/leaderboard-sync`

2. Admin user management
   Can chuyen cac tac vu sau sang API:
   - doi PIN hoc vien
   - xoa profile ghost
   - tao profile moi trong account hien tai

3. Parent management
   Can chuyen cac tac vu sau sang API:
   - them parent
   - xoa parent
   - gan child cho parent

4. Account write path
   Can chuyen cac tac vu sau sang API:
   - register
   - login flow co update `familyCredentials`
   - sync progress
   - update profile visibility / grade / pin
   - process reward approval

File lien quan:
- [hooks/use-auth.tsx](/D:/phÃ¢n%20má»m%20tá»±%20lÃ m%20má»›i/luyentapbaoan/hooks/use-auth.tsx)
- [hooks/use-profile.tsx](/D:/phÃ¢n%20má»m%20tá»±%20lÃ m%20má»›i/luyentapbaoan/hooks/use-profile.tsx)
- [components/progress-provider.tsx](/D:/phÃ¢n%20má»m%20tá»±%20lÃ m%20má»›i/luyentapbaoan/components/progress-provider.tsx)
- [app/admin/users/page.tsx](/D:/phÃ¢n%20má»m%20tá»±%20lÃ m%20má»›i/luyentapbaoan/app/admin/users/page.tsx)
- [app/admin/parents/page.tsx](/D:/phÃ¢n%20má»m%20tá»±%20lÃ m%20má»›i/luyentapbaoan/app/admin/parents/page.tsx)

Pass:
- Client khong con goi `.from('math_progress').update/insert/delete` cho cac tac vu nhay cam
- API server dung `SUPABASE_SERVICE_ROLE_KEY` hoac trusted flow

### Buoc 4: Harden runtime va du lieu

Muc tieu:
- Du lieu xau khong lam app crash

Tac vu:
- Dung bo sanitize storage chung cho ca client va server
- Chuan hoa:
  - `profiles`
  - `parents`
  - `activeProfileId`
  - `childrenIds`
- API AI phai validate request body
- Route loi phai co fallback de nguoi dung con thao tac duoc

File lien quan:
- [components/progress-provider.tsx](/D:/phÃ¢n%20má»m%20tá»±%20lÃ m%20má»›i/luyentapbaoan/components/progress-provider.tsx)
- [lib/server/app-storage.ts](/D:/phÃ¢n%20má»m%20tá»±%20lÃ m%20má»›i/luyentapbaoan/lib/server/app-storage.ts)
- [app/api/question/route.ts](/D:/phÃ¢n%20má»m%20tá»±%20lÃ m%20má»›i/luyentapbaoan/app/api/question/route.ts)
- [app/api/evaluate/route.ts](/D:/phÃ¢n%20má»m%20tá»±%20lÃ m%20má»›i/luyentapbaoan/app/api/evaluate/route.ts)

Pass:
- `npm run build` pass
- `npm run lint -- .` chi con warning chap nhan duoc
- App mo duoc ngay ca khi DB co row data null / string loi

### Buoc 5: Ap security policy Supabase

Muc tieu:
- Khong de anon key doc/ghi full bang `math_progress`

Dieu kien truoc khi ap:
- Cac tac vu write chinh da di qua API server
- Da test smoke xong tren staging
- `SUPABASE_SERVICE_ROLE_KEY` da cau hinh dung tren env production

Thuc hien:
- Apply file [supabase_setup.sql](/D:/phÃ¢n%20má»m%20tá»±%20lÃ m%20má»›i/luyentapbaoan/supabase_setup.sql)

Ky vong sau khi ap:
- `leaderboard` public select only
- `math_progress` khong con public full access

Rollback:
- Neu app bi mat kha nang ghi, rollback bang cach:
  - tra policy ve tam thoi
  - hoac tat deploy va quay ve commit truoc

### Buoc 6: Deploy, smoke test, va monitoring

Muc tieu:
- Chot he thong o trang thai production co the van hanh

Truoc deploy:
- `npm run build`
- `npm run lint -- .`
- `npm run db:check`

Sau deploy:
- Check `GET /api/health`
- Smoke test:
  - `/`
  - `/login`
  - `/profiles`
  - `/leaderboard`
  - `/admin`
  - `/login/parent`
  - `/api/question`
  - `/api/evaluate`

Sau 15-30 phut:
- Chay lai `npm run db:check`
- Xac nhan khong tai phat:
  - row rong
  - leaderboard duplicate
  - parent-child cross-record

## Checklist ky thuat theo module

### Module: DB and scripts

- [x] `db:backup`
- [x] `db:check`
- [x] `db:cleanup:verified`
- [ ] tao script restore khi can

### Module: Admin secure API

- [x] leaderboard sync API
- [x] user update PIN API
- [x] delete ghost profile API
- [x] add profile API
- [x] add/delete parent API
- [x] assign child API

### Module: Account write API

- [x] register API
- [x] login/update session API
- [x] sync progress API
- [x] reward approval API
- [x] profile settings API

### Module: Client migration

- [x] leaderboard sync UI -> server API
- [x] admin users UI -> server API
- [x] admin parents UI -> server API
- [x] auth/profile hooks -> server API

### Module: Security

- [x] health endpoint
- [x] safer Supabase setup SQL
- [ ] ap policy production that
- [x] bo hien PIN plain text tren UI admin
- [ ] hash PIN ve lau dai

## Thu tu thuc thi de it rui ro nhat

1. Backup DB
2. Check DB
3. Migrate them cac write path sang server API
4. Build + lint
5. Deploy
6. Smoke test
7. Apply Supabase policy an toan
8. Smoke test lai
9. Check DB sau deploy

## Dinh nghia "hoan thanh"

He thong duoc xem la hoan thanh luong hardening khi:

- `math_progress` khong con full public access
- cac tac vu admin nhay cam khong con ghi truc tiep tu client
- DB check khong con row rong / duplicate / cross-record sai
- build pass, lint khong co error
- `/api/health` bao cac check can thiet o trang thai xanh



