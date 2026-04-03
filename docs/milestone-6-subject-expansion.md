# Milestone 6: Subject Expansion

Milestone 6 mo rong he curriculum-driven sang cac mon khac sau khi `Toan lop 2` da on dinh.

## Nguyen tac mo rong

- Khong mo rong dong loat tat ca mon.
- Chi them mon da co du 3 lop:
  - `course structure`
  - `question coverage` (static/generator)
  - `validation` du an hien tai co the chap nhan
- Van giu:
  - CSDL quan curriculum + question management
  - code quan generator + answer checking + validation

## Mon du dieu kien trong dot nay

### `Tieng Anh lop 2`

Da co:
- course grade 2 trong `lib/content/courses/english.ts`
- static bank lon trong `lib/content/static/english.ts`
- generator cho nghe, noi, doc, viet trong `lib/content/generators/english.ts`

Huong curriculum:
- HK1 dau: greetings, colors, school, phonics A-B
- HK1 giua: family, phonics C, what's your name
- HK1 cuoi: reading/listening/writing co ban
- HK2: animals, this/that, speaking & mixed practice

### `Tieng Viet lop 2`

Da co:
- course grade 2 trong `lib/content/courses/vietnamese.ts`
- static bank lon trong `lib/content/static/vietnamese.ts`
- generator cho doc hieu, tu-cau, viet, noi trong `lib/content/generators/vietnamese.ts`

Huong curriculum:
- HK1 dau: tu ngu, cau, doc hieu co ban
- HK1 giua: dau cau, tho, doc dien cam
- HK1 cuoi: chinh ta, noi-nghe
- HK2: ke chuyen, ta nguoi, thuyet trinh, mixed practice

### `Tai chinh lop 2`

Da co:
- course grade 2 trong `lib/content/courses/finance.ts`
- static bank lon trong `lib/content/static/finance.ts`
- generator cho nhan biet tien, mua sam, tiet kiem trong `lib/content/generators/finance.ts`
- rule validation rieng trong `lib/content/finance-grade2-rules.ts`

Huong curriculum:
- HK1 dau: nhan biet menh gia, so sanh gia tri, cong tien don gian
- HK1 giua: phan biet `can` va `muon`, heo dat co ban
- HK1 cuoi: mua sam 2 mon va tinh tong chi phi
- HK2: muc tieu tiet kiem, gia tri nghe nghiep, bai toan mua sam/tiet kiem tong hop

## Kiem tra M6

Them script:
- `npm run check:expansion`

Script nay kiem tra cho `English 2`, `Vietnamese 2` va `Tai chinh 2`:
- moi skill phai co it nhat static bank hoac generator
- cau hoi mau sinh ra khong duoc bi validation error

## Ghi chu van hanh

- Sau khi cap nhat SQL seed, can chay lai file `scripts/sql/create-curriculum-schema.sql` tren Supabase.
- Trang admin `question-sources` da co the chuyen giua:
  - `Toan 2`
  - `Anh 2`
  - `Viet 2`
  - `Tai chinh 2`
