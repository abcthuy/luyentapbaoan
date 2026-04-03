# Question System Boundary

## Muc tieu

Chot ro ranh gioi giua `code` va `database` de he thong cau hoi khong bi chong cheo khi mo rong nhieu mon va nhieu lop.

Nguyen tac chinh:

- `Code giu engine`
- `Database giu noi dung`

## 1. Nhom file giu lai trong code

Day la cac file thuoc `engine`, `rule`, `selector`, `validation`. Khong dua toan bo cac phan nay vao DB.

### Generator va runtime content

- [lib/content/registry.ts](/D:/phân%20m?m%20t?%20làm%20m?i/luyentapbaoan/lib/content/registry.ts)
- [lib/content/generators/math.ts](/D:/phân%20m?m%20t?%20làm%20m?i/luyentapbaoan/lib/content/generators/math.ts)
- [lib/content/generators/english.ts](/D:/phân%20m?m%20t?%20làm%20m?i/luyentapbaoan/lib/content/generators/english.ts)
- [lib/content/generators/vietnamese.ts](/D:/phân%20m?m%20t?%20làm%20m?i/luyentapbaoan/lib/content/generators/vietnamese.ts)
- [lib/content/generators/finance.ts](/D:/phân%20m?m%20t?%20làm%20m?i/luyentapbaoan/lib/content/generators/finance.ts)

Ly do giu trong code:

- day la logic sinh cau hoi
- can test duoc
- can review duoc
- khong phu hop de luu thanh du lieu thuan trong DB

### Validation va rule su pham

- [lib/content/validation.ts](/D:/phân%20m?m%20t?%20làm%20m?i/luyentapbaoan/lib/content/validation.ts)
- [lib/content/math-grade2-rules.ts](/D:/phân%20m?m%20t?%20làm%20m?i/luyentapbaoan/lib/content/math-grade2-rules.ts)
- [lib/content/finance-grade2-rules.ts](/D:/phân%20m?m%20t?%20làm%20m?i/luyentapbaoan/lib/content/finance-grade2-rules.ts)
- [lib/content/import-rules.ts](/D:/phân%20m?m%20t?%20làm%20m?i/luyentapbaoan/lib/content/import-rules.ts)

Ly do giu trong code:

- la luat nghiep vu
- phai version control ro rang
- can duoc goi trong runtime va import

### Kieu du lieu va helper he thong

- [lib/content/types.ts](/D:/phân%20m?m%20t?%20làm%20m?i/luyentapbaoan/lib/content/types.ts)
- [lib/content/library-word.ts](/D:/phân%20m?m%20t?%20làm%20m?i/luyentapbaoan/lib/content/library-word.ts)
- [lib/content/library.ts](/D:/phân%20m?m%20t?%20làm%20m?i/luyentapbaoan/lib/content/library.ts)
- [lib/question-management.ts](/D:/phân%20m?m%20t?%20làm%20m?i/luyentapbaoan/lib/question-management.ts)
- [lib/server/question-management-admin.ts](/D:/phân%20m?m%20t?%20làm%20m?i/luyentapbaoan/lib/server/question-management-admin.ts)

Ly do giu trong code:

- day la lop ket noi giua admin, runtime va DB
- khong phai noi dung hoc tap can quan tri tay

### Curriculum va course structure tam thoi

- [lib/content/courses/math.ts](/D:/phân%20m?m%20t?%20làm%20m?i/luyentapbaoan/lib/content/courses/math.ts)
- [lib/content/courses/english.ts](/D:/phân%20m?m%20t?%20làm%20m?i/luyentapbaoan/lib/content/courses/english.ts)
- [lib/content/courses/vietnamese.ts](/D:/phân%20m?m%20t?%20làm%20m?i/luyentapbaoan/lib/content/courses/vietnamese.ts)
- [lib/content/courses/finance.ts](/D:/phân%20m?m%20t?%20làm%20m?i/luyentapbaoan/lib/content/courses/finance.ts)

Trang thai:

- van giu trong code de lam seed va fallback
- khong duoc xem la noi quan tri noi dung cuoi cung nua

## 2. Nhom du lieu dua vao DB

Day la noi dung can quan tri, nhap lieu, sua, import va mo rong bang admin.

### Bang DB da dung lam nguon noi dung

- `question_bank`
- `question_templates`
- `question_sources`
- `curriculum_skill_question_sources`

Y nghia:

- `question_bank`: cau hoi that su de hoc
- `question_templates`: mau cau hoi co the tai su dung
- `question_sources`: xac dinh nguon cua skill
- `curriculum_skill_question_sources`: mapping skill -> source

### Luong dang di vao DB

- nhap cau hoi truc tiep trong admin
- import Word `.docx`
- sua cau hoi trong admin
- template va source mapping

File lien quan:

- [app/admin/question-sources/page.tsx](/D:/phân%20m?m%20t?%20làm%20m?i/luyentapbaoan/app/admin/question-sources/page.tsx)
- [app/api/admin/question-bank/upsert/route.ts](/D:/phân%20m?m%20t?%20làm%20m?i/luyentapbaoan/app/api/admin/question-bank/upsert/route.ts)
- [app/api/admin/question-bank/import/route.ts](/D:/phân%20m?m%20t?%20làm%20m?i/luyentapbaoan/app/api/admin/question-bank/import/route.ts)
- [app/api/admin/question-sources/list/route.ts](/D:/phân%20m?m%20t?%20làm%20m?i/luyentapbaoan/app/api/admin/question-sources/list/route.ts)
- [scripts/sql/create-curriculum-schema.sql](/D:/phân%20m?m%20t?%20làm%20m?i/luyentapbaoan/scripts/sql/create-curriculum-schema.sql)

## 3. Nhom dang o code nhung can migrate dan sang DB

Day la phan quan trong nhat cua Lo trinh 1.

### Static question bank

Can migrate dan:

- [lib/content/static/math.ts](/D:/phân%20m?m%20t?%20làm%20m?i/luyentapbaoan/lib/content/static/math.ts)
- [lib/content/static/vietnamese.ts](/D:/phân%20m?m%20t?%20làm%20m?i/luyentapbaoan/lib/content/static/vietnamese.ts)
- [lib/content/static/english.ts](/D:/phân%20m?m%20t?%20làm%20m?i/luyentapbaoan/lib/content/static/english.ts)
- [lib/content/static/finance.ts](/D:/phân%20m?m%20t?%20làm%20m?i/luyentapbaoan/lib/content/static/finance.ts)
- [lib/content/static/index.ts](/D:/phân%20m?m%20t?%20làm%20m?i/luyentapbaoan/lib/content/static/index.ts)

Ly do can migrate:

- kho noi dung lon
- hay can sua
- can dung lai trong admin
- can de phu huynh/import Word quan ly

Nguyen tac:

- khong xoa ngay
- migrate theo dot
- runtime van fallback ve code trong giai doan chuyen doi

## 4. Thu tu migrate de khong vo he thong

### Dot 1

- `Toan lop 2`
- uu tien cac skill dang hoc nhieu
- doi chieu voi curriculum DB truoc khi import

### Dot 2

- `Tieng Viet lop 2`

### Dot 3

- `Tieng Anh lop 2`

### Dot 4

- `Tai chinh lop 2`

Sau khi xong lop 2 moi mo sang lop 3.

## 5. Rule van hanh tu bay gio

- moi cau hoi moi phai vao `question_bank`
- khong them static question moi vao `lib/content/static/*` neu khong phai seed/fallback
- generator va validation tiep tuc viet trong code
- course file trong code chi dong vai tro seed/fallback cho den khi curriculum DB hoan toan thay the

## 6. Danh sach file can uu tien xu ly tiep

### Uu tien 1

- [lib/content/static/math.ts](/D:/phân%20m?m%20t?%20làm%20m?i/luyentapbaoan/lib/content/static/math.ts)
- [lib/content/static/vietnamese.ts](/D:/phân%20m?m%20t?%20làm%20m?i/luyentapbaoan/lib/content/static/vietnamese.ts)

### Uu tien 2

- [lib/content/static/english.ts](/D:/phân%20m?m%20t?%20làm%20m?i/luyentapbaoan/lib/content/static/english.ts)
- [lib/content/static/finance.ts](/D:/phân%20m?m%20t?%20làm%20m?i/luyentapbaoan/lib/content/static/finance.ts)

### Giu nguyen, khong migrate

- [lib/content/generators/math.ts](/D:/phân%20m?m%20t?%20làm%20m?i/luyentapbaoan/lib/content/generators/math.ts)
- [lib/content/generators/english.ts](/D:/phân%20m?m%20t?%20làm%20m?i/luyentapbaoan/lib/content/generators/english.ts)
- [lib/content/generators/vietnamese.ts](/D:/phân%20m?m%20t?%20làm%20m?i/luyentapbaoan/lib/content/generators/vietnamese.ts)
- [lib/content/generators/finance.ts](/D:/phân%20m?m%20t?%20làm%20m?i/luyentapbaoan/lib/content/generators/finance.ts)
- [lib/content/validation.ts](/D:/phân%20m?m%20t?%20làm%20m?i/luyentapbaoan/lib/content/validation.ts)
- [lib/content/import-rules.ts](/D:/phân%20m?m%20t?%20làm%20m?i/luyentapbaoan/lib/content/import-rules.ts)

## 7. Ket luan cho repo nay

Trang thai hien tai da dung huong:

- `DB` da la noi nhap va sua cau hoi moi
- `code` van giu engine va fallback
- `static bank` la nhom can migrate tiep theo

Nghia la Lo trinh 1 da chot duoc:

- cai giu lai trong code
- cai dua vao DB
- cai migrate dan
- thu tu migrate an toan
