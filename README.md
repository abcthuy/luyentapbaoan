# Bao An Practice App

Ung dung Next.js cho hoc sinh, phu huynh va admin, da duoc harden de on dinh hon khi deploy production.

## Lenh chinh

```bash
npm run dev
npm run build
npm run lint -- .
npm run db:check
npm run db:backup
npm run db:cleanup:verified
```

## Bien moi truong can co

Trong `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
GEMINI_API_KEY=...
GEMINI_MODEL=...
```

`SUPABASE_SERVICE_ROLE_KEY` can thiet neu muon dung cac API admin an toan hon va khoa policy production.

## Luong van hanh an toan

1. Kiem tra suc khoe:
   `GET /api/health`
2. Backup DB:
   `npm run db:backup`
3. Kiem tra DB:
   `npm run db:check`
4. Neu can, cleanup co kiem soat:
   `npm run db:cleanup:verified`
5. Build truoc deploy:
   `npm run build`

## Ghi chu bao mat

- `leaderboard` nen duoc public read-only.
- `math_progress` khong nen de client ghi truc tiep ve lau dai.
- Cac tac vu admin nhay cam nen di qua API server su dung service role key.
- File [supabase_setup.sql](/D:/phân%20mềm%20tự%20làm%20mới/luyentapbaoan/supabase_setup.sql) da duoc cap nhat theo huong an toan hon, nhung chi nen ap khi luong ghi server-side da san sang.

## Tai lieu workflow

- [Production Hardening Workflow](/D:/phân%20mềm%20tự%20làm%20mới/luyentapbaoan/docs/production-hardening-workflow.md)
