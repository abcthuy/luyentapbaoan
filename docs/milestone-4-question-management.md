# Milestone 4: Question Management Schema

Milestone 4 mo rong he du lieu nhieu bang de noi `curriculum_skill` voi nguon cau hoi, template, va ngan hang cau hoi duoc duyet.

## Muc tieu

- Khong de runtime phai hardcode qua nhieu quy tac chon nguon cau hoi.
- Biet ro moi skill dang dung:
  - `static bank`
  - `local generator`
  - `hybrid fallback`
  - `ai-reviewed`
- Dat nen de sau nay them giao dien admin ma khong doi lai schema.

## Nguyen tac

- CSDL chi quan:
  - catalog nguon cau hoi
  - cau hinh nguon cho tung skill
  - template / blueprint
  - ngan hang cau hoi da duyet
- Code van quan:
  - generator implementation
  - answer checking
  - question validation
  - selector runtime

## Bang moi

### `question_sources`

Catalog nguon cau hoi.

Moi row mo ta mot nguon nhu:
- `static_bank`
- `local_generator`
- `hybrid_fallback`
- `ai_reviewed`

Thuoc tinh chinh:
- `source_type`
- `handler_key`
- `config`
- `is_active`

### `curriculum_skill_question_sources`

Noi `curriculum_skill` voi mot hay nhieu nguon cau hoi theo thu tu uu tien.

Thuoc tinh chinh:
- `priority`
- `is_primary`
- `level_min`, `level_max`
- `allowed_modes`
- `config_override`

Bang nay giup runtime tra loi cac cau hoi nhu:
- skill nay uu tien static hay generator
- mode `challenge` co duoc dung nguon nay khong
- level nao duoc phep dung nguon nay

### `question_templates`

Luu template / blueprint duoc duyet cho skill.

Dung cho:
- rule generator
- prompt template
- static blueprint

Thuoc tinh chinh:
- `template_kind`
- `difficulty_level`
- `stage`
- `answer_strategy`
- `metadata`

### `question_bank`

Luu question instance da duyet.

Moi cau hoi co the gan voi:
- `curriculum_skill_id`
- `question_source_id`
- `template_id`

Thuoc tinh chinh:
- `difficulty_level`
- `stage`
- `question_type`
- `content`
- `canonical_answer`
- `quality_status`

## Seed hien tai cho Toan lop 2

Milestone 4 seed:
- 4 `question_sources` mau
- mapping nguon cho 13 skill `Toan lop 2`
- 5 `question_templates` mau cho cac skill trong tam:
  - `A4`
  - `B1`
  - `B2`
  - `E2`
  - `E3`

Huong seed hien tai:
- skill co ban: uu tien `hybrid_fallback`
- skill challenge: uu tien `local_generator`
- AI reviewed duoc tao san trong schema nhung mac dinh chua bat

## Vai tro trong lo trinh

Milestone 4 khong thay engine bang DB.

No chi dat nen de cac buoc sau co the:
1. doc cau hinh nguon cau hoi tu DB
2. quan ly template va bank bang admin
3. mo rong nhieu lop / nhieu mon ma it sua code hon

## Chua lam trong milestone nay

- chua dua toan bo static question bank vao bang `question_bank`
- chua co API doc `question_sources` / `question_templates`
- chua co admin UI quan ly template va bank
- chua cho runtime uu tien query `question_bank` tu DB

## Buoc tiep theo sau Milestone 4

1. Tao model runtime de doc `question_sources` cho tung skill.
2. Them API admin de xem va sua source mapping.
3. Chi khi Toan lop 2 chay on dinh moi migrate them mon/lop khac.
