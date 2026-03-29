# Supabase Policy Rollout

Tai lieu nay dung cho buoc rollout policy production an toan.

## Dieu kien truoc khi apply

- Build moi nhat da deploy thanh cong.
- `/api/health` tra ve `supabaseClientConfigured: true`.
- Moi write path chinh da di qua server API:
  - `/api/account/register`
  - `/api/account/login`
  - `/api/account/sync`
  - `/api/account/reward`
  - `/api/admin/*`
- Da backup DB gan nhat.
- Co quyen SQL Editor hoac service role tren project Supabase production.

## Kiem tra truoc rollout

1. Chay `npm run db:backup`
2. Chay `npm run db:check`
3. Deploy ban code moi nhat
4. Smoke test nhanh:
   - `/`
   - `/login`
   - `/profiles`
   - `/leaderboard`
   - `/admin`
   - `/login/parent`
   - `/api/health`

## Apply policy

Chay file [apply-secure-policies.sql](/D:/phân%20mềm%20tự%20làm%20mới/luyentapbaoan/scripts/sql/apply-secure-policies.sql) trong Supabase SQL Editor.

Sau khi apply:
- `leaderboard` chi con public select
- `math_progress` khong con public write

## Smoke test sau apply

1. Dang ky tai khoan moi
2. Dang nhap tai khoan cu
3. Lam mot bai va kiem tra diem co dong bo
4. Them/xoa hoc vien trong admin
5. Them/xoa/gan phu huynh trong admin
6. Duyet mot reward
7. Mo leaderboard va kiem tra doc cong khai van hoat dong

## Dau hieu can rollback ngay

- Dang ky khong tao duoc account
- Dang nhap thanh cong nhung khong luu session
- Hoan thanh bai hoc nhung diem khong dong bo
- Admin users/parents thao tac that bai hang loat
- API tra 401/403/500 bat thuong sau rollout

## Rollback

Chay file [rollback-public-policies.sql](/D:/phân%20mềm%20tự%20làm%20mới/luyentapbaoan/scripts/sql/rollback-public-policies.sql) trong Supabase SQL Editor.

Sau rollback:
- DB tro lai che do public all access tam thoi
- Ung dung se hoat dong lai theo kieu cu neu co route nao con sot

## Sau rollout on dinh

- Chay lai `npm run db:check`
- Ghi nhan thoi gian rollout va backup id
- Len ke hoach buoc tiep theo: hash PIN va bo sung auth/rate-limit cho API
