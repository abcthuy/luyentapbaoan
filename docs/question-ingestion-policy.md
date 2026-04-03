# Question Ingestion Policy

## Muc tieu

Tu thoi diem nay, moi cau hoi moi cua du an phai di vao `question_bank` trong database, khong mo rong them kho cau hoi moi trong code.

## Rule chinh

### 1. Luong duoc phep

- Nhap truc tiep trong admin
- Import Word `.docx`
- Import qua API `question-bank/import`
- Sua cau hoi trong admin va luu lai vao DB

### 2. Luong khong duoc xem la noi dung moi chinh thuc

- them tay cau hoi moi vao `lib/content/static/*`
- dung `customContentLibrary` nhu nguon noi dung chinh
- mo rong kho static bank trong code de phuc vu van hanh hang ngay

### 3. Vai tro cua code

Code chi con:

- generator
- validation
- answer checking
- rule su pham
- static fallback/seed tam thoi

### 4. Vai tro cua DB

DB la noi luu:

- question bank moi
- template
- source mapping
- metadata va trang thai cau hoi

## Kiem tra tu dong

Can chay:

- `npm run check:content-boundary`

Script nay dam bao:

- khong co them luong ghi moi vao static question bank ngoai cac script legacy da biet
- khong co tham chieu moi toi `customContentLibrary` ngoai nhom file tuong thich cu

## Ghi chu migration

- `lib/content/static/*` van duoc giu lam fallback trong giai doan hien tai
- `customContentLibrary` van duoc giu de tuong thich du lieu cu
- nhung ca hai khong duoc xem la dich den cho noi dung moi
