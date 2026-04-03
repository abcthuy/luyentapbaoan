# Lo trinh 5 - Cleanup va On dinh

## Muc tieu

Lam gon he thong cau hoi sau khi da co DB-backed `question_bank`, nhung van giu seed/fallback toi thieu de an toan khi van hanh.

Nguyen tac:

- khong xoa vo dieu kien cac file static cu
- tach ro `seed/history` va `runtime fallback`
- runtime chi giu lai fallback toi thieu cho nhung phan chua migrate
- moi thay doi cleanup deu phai co script check di kem

## Trang thai da lam

### 1. Toan lop 2 da migrate vao DB

- Script: [scripts/migrate-static-math2-to-db.js](/D:/phân%20m?m%20t?%20làm%20m?i/luyentapbaoan/scripts/migrate-static-math2-to-db.js)
- Ket qua: 170 cau hoi static Toan lop 2 da duoc dua vao `question_bank`

### 2. Runtime da uu tien DB truoc

- [app/api/question/route.ts](/D:/phân%20m?m%20t?%20làm%20m?i/luyentapbaoan/app/api/question/route.ts)
- [lib/server/question-runtime.ts](/D:/phân%20m?m%20t?%20làm%20m?i/luyentapbaoan/lib/server/question-runtime.ts)
- [lib/content/registry.ts](/D:/phân%20m?m%20t?%20làm%20m?i/luyentapbaoan/lib/content/registry.ts)

Thu tu hien tai:

1. `question_bank` trong DB
2. generator/local fallback
3. static fallback toi thieu
4. AI fallback neu can

### 3. Runtime static fallback da duoc thu hep

- [lib/content/static/index.ts](/D:/phân%20m?m%20t?%20làm%20m?i/luyentapbaoan/lib/content/static/index.ts)

Da tach 2 snapshot:

- `getStaticQuestionBankSnapshot()`
  Dung cho seed/export/kiem tra day du
- `getRuntimeStaticQuestionBankSnapshot()`
  Dung cho fallback khi chay that

Cac skill Toan lop 2 da co trong static bank va da migrate (`A4`, `B2`, `D2`, `E1`) da bi loai khoi runtime static fallback.

Dieu nay co nghia la:

- file static van con trong repo de doi chieu va seed
- runtime khong tiep tuc dua cac skill Toan lop 2 tro lai duong fallback cu nua

### 4. Script check cleanup da duoc them

- [scripts/check-static-cleanup.js](/D:/phân%20m?m%20t?%20làm%20m?i/luyentapbaoan/scripts/check-static-cleanup.js)
- lenh: `npm run check:static-cleanup`

Script nay xac nhan:

- static snapshot day du van con du lieu Toan lop 2
- runtime snapshot khong con cac skill da migrate
- cleanup khong vo tinh xoa seed du lieu goc

## Rule van hanh tu day

- static bank da migrate xong thi khong duoc giu trong runtime fallback nua
- static file goc chi dong vai tro `seed/history`
- neu can fallback cho skill da migrate, uu tien generator truoc khi nghi den static
- moi dot migrate sau deu phai cap nhat cleanup check tuong ung

## Dot tiep theo nen cleanup

1. `Tieng Viet lop 2`
2. `Tieng Anh lop 2`
3. `Tai chinh lop 2`

Moi dot se lap lai 3 buoc:

1. migrate static vao DB
2. cho runtime uu tien DB
3. loai nhom skill do khoi runtime static fallback

