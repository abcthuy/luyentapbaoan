-- Milestone 1
-- Curriculum schema + Math Grade 2 baseline seed
-- This file does not replace the existing JSON-based `math_progress` flow yet.
-- It creates a normalized curriculum model so later milestones can move selector
-- and progress logic onto explicit learning data.

begin;

create table if not exists public.curricula (
    id text primary key,
    subject_id text not null check (subject_id in ('math', 'english', 'vietnamese', 'finance')),
    grade integer not null check (grade between 1 and 12),
    name text not null,
    description text,
    academic_year text,
    version integer not null default 1 check (version >= 1),
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create unique index if not exists curricula_subject_grade_version_idx
    on public.curricula (subject_id, grade, version);

create table if not exists public.curriculum_phases (
    id text primary key,
    curriculum_id text not null references public.curricula(id) on delete cascade,
    code text not null,
    name text not null,
    semester integer not null check (semester in (1, 2)),
    order_index integer not null check (order_index > 0),
    starts_on date,
    ends_on date,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (curriculum_id, code)
);

create index if not exists curriculum_phases_curriculum_order_idx
    on public.curriculum_phases (curriculum_id, order_index);

create table if not exists public.curriculum_topics (
    id text primary key,
    curriculum_id text not null references public.curricula(id) on delete cascade,
    code text not null,
    name text not null,
    description text,
    order_index integer not null check (order_index > 0),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (curriculum_id, code)
);

create index if not exists curriculum_topics_curriculum_order_idx
    on public.curriculum_topics (curriculum_id, order_index);

create table if not exists public.curriculum_skills (
    id text primary key,
    curriculum_id text not null references public.curricula(id) on delete cascade,
    topic_id text not null references public.curriculum_topics(id) on delete cascade,
    phase_id text not null references public.curriculum_phases(id) on delete restrict,
    skill_code text not null,
    name text not null,
    description text,
    semester integer not null check (semester in (1, 2)),
    order_index integer not null check (order_index > 0),
    stage text not null check (stage in ('foundation', 'core', 'mixed', 'challenge')),
    difficulty_band text not null check (difficulty_band in ('foundation', 'standard', 'advanced', 'challenge')),
    difficulty_base integer not null default 1 check (difficulty_base between 1 and 5),
    min_attempts integer not null default 3 check (min_attempts >= 0),
    min_mastery_to_unlock_next numeric(4, 2) not null default 0.65 check (min_mastery_to_unlock_next >= 0 and min_mastery_to_unlock_next <= 1),
    question_types jsonb not null default '["mcq","input"]'::jsonb,
    is_core boolean not null default true,
    is_reviewable boolean not null default true,
    is_mixed_exam_eligible boolean not null default false,
    is_challenge boolean not null default false,
    source_strategy text not null default 'hybrid' check (source_strategy in ('static', 'generator', 'hybrid', 'ai-reviewed')),
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (curriculum_id, skill_code)
);

create index if not exists curriculum_skills_curriculum_order_idx
    on public.curriculum_skills (curriculum_id, order_index);

create index if not exists curriculum_skills_phase_idx
    on public.curriculum_skills (phase_id, order_index);

create table if not exists public.curriculum_skill_prerequisites (
    skill_id text not null references public.curriculum_skills(id) on delete cascade,
    prerequisite_skill_id text not null references public.curriculum_skills(id) on delete cascade,
    relation_type text not null default 'required' check (relation_type in ('required', 'recommended')),
    created_at timestamptz not null default now(),
    primary key (skill_id, prerequisite_skill_id),
    check (skill_id <> prerequisite_skill_id)
);

create table if not exists public.student_learning_state (
    profile_id text not null,
    curriculum_id text not null references public.curricula(id) on delete restrict,
    current_phase_id text references public.curriculum_phases(id) on delete set null,
    current_skill_id text references public.curriculum_skills(id) on delete set null,
    pace_mode text not null default 'standard' check (pace_mode in ('support', 'standard', 'fast')),
    learning_mode text not null default 'core' check (learning_mode in ('core', 'review', 'mixed', 'challenge', 'exam')),
    acceleration_level text not null default 'standard' check (acceleration_level in ('support', 'standard', 'advanced')),
    parent_override_mode boolean not null default false,
    notes text,
    updated_at timestamptz not null default now(),
    created_at timestamptz not null default now()
);

create table if not exists public.student_skill_progress (
    profile_id text not null,
    curriculum_skill_id text not null references public.curriculum_skills(id) on delete cascade,
    attempts integer not null default 0 check (attempts >= 0),
    correct_attempts integer not null default 0 check (correct_attempts >= 0),
    mastery numeric(4, 2) not null default 0 check (mastery >= 0 and mastery <= 1),
    status text not null default 'locked' check (status in ('locked', 'unlocked', 'learning', 'mastered', 'review')),
    last_attempt_at timestamptz,
    unlocked_at timestamptz,
    next_review_at timestamptz,
    updated_at timestamptz not null default now(),
    created_at timestamptz not null default now(),
    primary key (profile_id, curriculum_skill_id)
);

create index if not exists student_skill_progress_profile_status_idx
    on public.student_skill_progress (profile_id, status, mastery desc);

create index if not exists student_skill_progress_review_idx
    on public.student_skill_progress (profile_id, next_review_at);

create table if not exists public.question_sources (
    id text primary key,
    code text not null unique,
    name text not null,
    source_type text not null check (source_type in ('static', 'generator', 'hybrid', 'ai-reviewed')),
    handler_key text,
    description text,
    config jsonb not null default '{}'::jsonb,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.curriculum_skill_question_sources (
    id text primary key,
    curriculum_skill_id text not null references public.curriculum_skills(id) on delete cascade,
    question_source_id text not null references public.question_sources(id) on delete restrict,
    priority integer not null check (priority > 0),
    is_primary boolean not null default false,
    level_min integer not null default 1 check (level_min between 1 and 10),
    level_max integer not null default 5 check (level_max between 1 and 10 and level_max >= level_min),
    allowed_modes jsonb not null default '["core","review","mixed","challenge"]'::jsonb,
    config_override jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (curriculum_skill_id, question_source_id, priority)
);

create index if not exists curriculum_skill_question_sources_skill_priority_idx
    on public.curriculum_skill_question_sources (curriculum_skill_id, priority);

create table if not exists public.question_templates (
    id text primary key,
    curriculum_skill_id text not null references public.curriculum_skills(id) on delete cascade,
    question_source_id text references public.question_sources(id) on delete set null,
    code text not null,
    title text not null,
    template_kind text not null check (template_kind in ('static', 'generator-rule', 'prompt')),
    difficulty_level integer not null default 1 check (difficulty_level between 1 and 10),
    stage text check (stage in ('foundation', 'core', 'mixed', 'challenge')),
    prompt_template text,
    answer_strategy text not null default 'exact' check (answer_strategy in ('exact', 'normalized', 'manual-review', 'rubric')),
    metadata jsonb not null default '{}'::jsonb,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (curriculum_skill_id, code)
);

create index if not exists question_templates_skill_difficulty_idx
    on public.question_templates (curriculum_skill_id, difficulty_level, is_active);

create table if not exists public.question_bank (
    id text primary key,
    curriculum_skill_id text not null references public.curriculum_skills(id) on delete cascade,
    question_source_id text references public.question_sources(id) on delete set null,
    template_id text references public.question_templates(id) on delete set null,
    legacy_question_id text,
    difficulty_level integer not null default 1 check (difficulty_level between 1 and 10),
    stage text check (stage in ('foundation', 'core', 'mixed', 'challenge')),
    question_type text not null check (question_type in ('mcq', 'input', 'reading', 'speaking', 'listening')),
    content jsonb not null,
    canonical_answer text not null,
    explanation text,
    tags jsonb not null default '[]'::jsonb,
    quality_status text not null default 'approved' check (quality_status in ('draft', 'approved', 'disabled')),
    last_reviewed_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists question_bank_skill_difficulty_idx
    on public.question_bank (curriculum_skill_id, difficulty_level, quality_status);

create index if not exists question_bank_source_idx
    on public.question_bank (question_source_id, template_id);

comment on table public.curricula is
'Normalized curriculum root. One record per subject/grade/version.';

comment on table public.curriculum_phases is
'Curriculum timeline slices such as hk1_dau, hk2_giua. System date may suggest a phase, but student state decides the active phase.';

comment on table public.curriculum_skills is
'Curriculum-defined skills with explicit order, phase, stage, and unlock thresholds.';

comment on table public.student_learning_state is
'Student learning position and delivery mode. This is the source of truth for where the child should study now.';

comment on table public.student_skill_progress is
'Per-skill mastery and review state used by selector and spaced repetition.';

comment on table public.question_sources is
'Catalog of question providers such as static bank, local generator, or AI-reviewed source.';

comment on table public.curriculum_skill_question_sources is
'Per-skill source priority and mode constraints so selector/runtime can choose the right source without hardcoding every skill.';

comment on table public.question_templates is
'Reusable question blueprints and prompt rules tied to a curriculum skill.';

comment on table public.question_bank is
'Approved question instances stored in the database, linked back to curriculum skills and optional templates.';

insert into public.curricula (
    id,
    subject_id,
    grade,
    name,
    description,
    academic_year,
    version,
    is_active
) values (
    'curr-math-grade-2-v1',
    'math',
    2,
    'To?n l?p 2',
    'Curriculum baseline cho To?n l?p 2, dung lam mau chuan cho selector moi.',
    '2025-2026',
    1,
    true
)
on conflict (id) do update set
    name = excluded.name,
    description = excluded.description,
    academic_year = excluded.academic_year,
    version = excluded.version,
    is_active = excluded.is_active,
    updated_at = now();

insert into public.curriculum_phases (
    id,
    curriculum_id,
    code,
    name,
    semester,
    order_index
) values
    ('phase-math2-hk1-dau', 'curr-math-grade-2-v1', 'hk1_dau', '??u h?c k? 1', 1, 10),
    ('phase-math2-hk1-giua', 'curr-math-grade-2-v1', 'hk1_giua', 'Gi?a h?c k? 1', 1, 20),
    ('phase-math2-hk1-cuoi', 'curr-math-grade-2-v1', 'hk1_cuoi', 'Cu?i h?c k? 1', 1, 30),
    ('phase-math2-hk2-dau', 'curr-math-grade-2-v1', 'hk2_dau', '??u h?c k? 2', 2, 40),
    ('phase-math2-hk2-giua', 'curr-math-grade-2-v1', 'hk2_giua', 'Gi?a h?c k? 2', 2, 50),
    ('phase-math2-hk2-cuoi', 'curr-math-grade-2-v1', 'hk2_cuoi', 'Cu?i h?c k? 2', 2, 60)
on conflict (id) do update set
    code = excluded.code,
    name = excluded.name,
    semester = excluded.semester,
    order_index = excluded.order_index,
    updated_at = now();

insert into public.curriculum_topics (
    id,
    curriculum_id,
    code,
    name,
    description,
    order_index
) values
    ('topic-math2-so-hoc', 'curr-math-grade-2-v1', 'so-hoc', 'S? h?c v? ph?p t?nh', 'Tr?c c?t s? h?c, c?ng tr?, b?ng nh?n chia, b?i to?n l?i v?n.', 10),
    ('topic-math2-hinh-hoc', 'curr-math-grade-2-v1', 'hinh-hoc', 'H?nh h?c v? ?o l??ng', '?? d?i, th?i gian, nh?n bi?t v? thao t?c v?i h?nh c? b?n.', 20),
    ('topic-math2-tu-duy', 'curr-math-grade-2-v1', 'tu-duy', 'T? duy v? logic', 'Quy lu?t, b?ng s?, bi?u ?? v? b?i to?n t?ng h?p.', 30)
on conflict (id) do update set
    code = excluded.code,
    name = excluded.name,
    description = excluded.description,
    order_index = excluded.order_index,
    updated_at = now();

insert into public.curriculum_skills (
    id,
    curriculum_id,
    topic_id,
    phase_id,
    skill_code,
    name,
    semester,
    order_index,
    stage,
    difficulty_band,
    difficulty_base,
    min_attempts,
    min_mastery_to_unlock_next,
    question_types,
    is_core,
    is_reviewable,
    is_mixed_exam_eligible,
    is_challenge,
    source_strategy,
    metadata
) values
    ('skill-math2-a1', 'curr-math-grade-2-v1', 'topic-math2-so-hoc', 'phase-math2-hk1-dau', 'A1', 'C?u t?o s? v? so s?nh (<=1000)', 1, 10, 'foundation', 'foundation', 1, 3, 0.65, '["mcq","input"]'::jsonb, true, true, true, false, 'hybrid', '{"legacySkillId":"A1"}'::jsonb),
    ('skill-math2-a2', 'curr-math-grade-2-v1', 'topic-math2-so-hoc', 'phase-math2-hk1-dau', 'A2', 'C?ng tr? (<=1000)', 1, 20, 'core', 'standard', 2, 4, 0.68, '["input","mcq"]'::jsonb, true, true, true, false, 'hybrid', '{"legacySkillId":"A2"}'::jsonb),
    ('skill-math2-a3', 'curr-math-grade-2-v1', 'topic-math2-so-hoc', 'phase-math2-hk1-giua', 'A3', '?i?n s? c?n thi?u', 1, 30, 'core', 'standard', 2, 3, 0.68, '["input","mcq"]'::jsonb, true, true, true, false, 'hybrid', '{"legacySkillId":"A3"}'::jsonb),
    ('skill-math2-c1', 'curr-math-grade-2-v1', 'topic-math2-hinh-hoc', 'phase-math2-hk1-giua', 'C1', '?? d?i v? ???ng g?p kh?c', 1, 40, 'core', 'standard', 2, 3, 0.65, '["mcq","input"]'::jsonb, true, true, true, false, 'hybrid', '{"legacySkillId":"C1"}'::jsonb),
    ('skill-math2-d1', 'curr-math-grade-2-v1', 'topic-math2-hinh-hoc', 'phase-math2-hk1-giua', 'D1', 'H?nh h?c c? b?n', 1, 50, 'core', 'standard', 2, 3, 0.65, '["mcq"]'::jsonb, true, true, true, false, 'hybrid', '{"legacySkillId":"D1"}'::jsonb),
    ('skill-math2-b1', 'curr-math-grade-2-v1', 'topic-math2-so-hoc', 'phase-math2-hk1-cuoi', 'B1', 'L?i v?n 1 b??c', 1, 60, 'mixed', 'standard', 3, 4, 0.70, '["mcq","input"]'::jsonb, true, true, true, false, 'hybrid', '{"legacySkillId":"B1"}'::jsonb),
    ('skill-math2-a4', 'curr-math-grade-2-v1', 'topic-math2-so-hoc', 'phase-math2-hk2-dau', 'A4', 'B?ng nh?n chia 2 v? 5', 2, 70, 'core', 'standard', 3, 4, 0.70, '["input","mcq"]'::jsonb, true, true, true, false, 'hybrid', '{"legacySkillId":"A4"}'::jsonb),
    ('skill-math2-c2', 'curr-math-grade-2-v1', 'topic-math2-hinh-hoc', 'phase-math2-hk2-dau', 'C2', 'Th?i gian (gi? ph?t)', 2, 80, 'core', 'advanced', 3, 3, 0.68, '["mcq","input"]'::jsonb, true, true, true, false, 'hybrid', '{"legacySkillId":"C2"}'::jsonb),
    ('skill-math2-b2', 'curr-math-grade-2-v1', 'topic-math2-so-hoc', 'phase-math2-hk2-giua', 'B2', 'L?i v?n 2 b??c', 2, 90, 'mixed', 'advanced', 4, 5, 0.75, '["mcq","input"]'::jsonb, true, true, true, false, 'hybrid', '{"legacySkillId":"B2"}'::jsonb),
    ('skill-math2-d2', 'curr-math-grade-2-v1', 'topic-math2-tu-duy', 'phase-math2-hk2-giua', 'D2', 'Bi?u ?? tranh v? b?ng', 2, 100, 'mixed', 'advanced', 3, 3, 0.68, '["mcq","input"]'::jsonb, true, true, true, false, 'hybrid', '{"legacySkillId":"D2"}'::jsonb),
    ('skill-math2-e1', 'curr-math-grade-2-v1', 'topic-math2-tu-duy', 'phase-math2-hk2-giua', 'E1', 'Quy lu?t d?y s?', 2, 110, 'mixed', 'advanced', 3, 3, 0.70, '["mcq","input"]'::jsonb, true, true, true, false, 'hybrid', '{"legacySkillId":"E1"}'::jsonb),
    ('skill-math2-e2', 'curr-math-grade-2-v1', 'topic-math2-tu-duy', 'phase-math2-hk2-cuoi', 'E2', 'Bang o so (hang cot)', 2, 120, 'challenge', 'challenge', 4, 4, 0.78, '["mcq","input"]'::jsonb, false, true, true, true, 'hybrid', '{"legacySkillId":"E2"}'::jsonb),
    ('skill-math2-e3', 'curr-math-grade-2-v1', 'topic-math2-tu-duy', 'phase-math2-hk2-cuoi', 'E3', 'Thap so', 2, 130, 'challenge', 'challenge', 5, 5, 0.80, '["input","mcq"]'::jsonb, false, true, true, true, 'hybrid', '{"legacySkillId":"E3"}'::jsonb)
on conflict (id) do update set
    topic_id = excluded.topic_id,
    phase_id = excluded.phase_id,
    skill_code = excluded.skill_code,
    name = excluded.name,
    semester = excluded.semester,
    order_index = excluded.order_index,
    stage = excluded.stage,
    difficulty_band = excluded.difficulty_band,
    difficulty_base = excluded.difficulty_base,
    min_attempts = excluded.min_attempts,
    min_mastery_to_unlock_next = excluded.min_mastery_to_unlock_next,
    question_types = excluded.question_types,
    is_core = excluded.is_core,
    is_reviewable = excluded.is_reviewable,
    is_mixed_exam_eligible = excluded.is_mixed_exam_eligible,
    is_challenge = excluded.is_challenge,
    source_strategy = excluded.source_strategy,
    metadata = excluded.metadata,
    updated_at = now();

insert into public.curriculum_skill_prerequisites (
    skill_id,
    prerequisite_skill_id,
    relation_type
) values
    ('skill-math2-a2', 'skill-math2-a1', 'required'),
    ('skill-math2-a3', 'skill-math2-a2', 'required'),
    ('skill-math2-c1', 'skill-math2-a1', 'recommended'),
    ('skill-math2-d1', 'skill-math2-a1', 'recommended'),
    ('skill-math2-b1', 'skill-math2-a2', 'required'),
    ('skill-math2-a4', 'skill-math2-a2', 'required'),
    ('skill-math2-c2', 'skill-math2-c1', 'required'),
    ('skill-math2-b2', 'skill-math2-b1', 'required'),
    ('skill-math2-b2', 'skill-math2-a4', 'required'),
    ('skill-math2-d2', 'skill-math2-a3', 'recommended'),
    ('skill-math2-e1', 'skill-math2-a3', 'recommended'),
    ('skill-math2-e2', 'skill-math2-e1', 'required'),
    ('skill-math2-e3', 'skill-math2-e2', 'required')
on conflict (skill_id, prerequisite_skill_id) do update set
    relation_type = excluded.relation_type;

insert into public.question_sources (
    id,
    code,
    name,
    source_type,
    handler_key,
    description,
    config,
    is_active
) values
    ('qs-static-bank', 'static_bank', 'Static Question Bank', 'static', 'static-bank', 'Ngu?n c?u h?i t?nh ?? ???c duy?t.', '{"selection":"random-approved"}'::jsonb, true),
    ('qs-local-generator', 'local_generator', 'Local Generator', 'generator', 'local-generator', 'Sinh c?u h?i b?ng code trong repo.', '{"validation":"required"}'::jsonb, true),
    ('qs-hybrid-fallback', 'hybrid_fallback', 'Hybrid Fallback', 'hybrid', 'hybrid-fallback', 'Th? static tr??c, sau ?? t?i generator local.', '{"order":["static_bank","local_generator"]}'::jsonb, true),
    ('qs-ai-reviewed', 'ai_reviewed', 'AI Reviewed Source', 'ai-reviewed', 'ai-reviewed', 'Ngu?n AI ch? d?ng khi ???c b?t r? r?ng.', '{"humanReviewRequired":true}'::jsonb, false)
on conflict (id) do update set
    code = excluded.code,
    name = excluded.name,
    source_type = excluded.source_type,
    handler_key = excluded.handler_key,
    description = excluded.description,
    config = excluded.config,
    is_active = excluded.is_active,
    updated_at = now();

insert into public.curriculum_skill_question_sources (
    id,
    curriculum_skill_id,
    question_source_id,
    priority,
    is_primary,
    level_min,
    level_max,
    allowed_modes,
    config_override
) values
    ('skill-source-math2-a1-hybrid', 'skill-math2-a1', 'qs-hybrid-fallback', 1, true, 1, 5, '["core","review","mixed"]'::jsonb, '{}'::jsonb),
    ('skill-source-math2-a2-hybrid', 'skill-math2-a2', 'qs-hybrid-fallback', 1, true, 1, 5, '["core","review","mixed"]'::jsonb, '{}'::jsonb),
    ('skill-source-math2-a3-hybrid', 'skill-math2-a3', 'qs-hybrid-fallback', 1, true, 1, 5, '["core","review","mixed"]'::jsonb, '{}'::jsonb),
    ('skill-source-math2-b1-hybrid', 'skill-math2-b1', 'qs-hybrid-fallback', 1, true, 1, 5, '["core","review","mixed"]'::jsonb, '{"pedagogy":"one-step-word-problem"}'::jsonb),
    ('skill-source-math2-a4-hybrid', 'skill-math2-a4', 'qs-hybrid-fallback', 1, true, 1, 5, '["core","review","mixed"]'::jsonb, '{"allowedTables":[2,5]}'::jsonb),
    ('skill-source-math2-b2-hybrid', 'skill-math2-b2', 'qs-hybrid-fallback', 1, true, 1, 5, '["core","review","mixed"]'::jsonb, '{"pedagogy":"two-step-word-problem"}'::jsonb),
    ('skill-source-math2-c1-hybrid', 'skill-math2-c1', 'qs-hybrid-fallback', 1, true, 1, 5, '["core","review","mixed"]'::jsonb, '{}'::jsonb),
    ('skill-source-math2-c2-hybrid', 'skill-math2-c2', 'qs-hybrid-fallback', 1, true, 1, 5, '["core","review","mixed"]'::jsonb, '{"timeFormat":"grade2-friendly"}'::jsonb),
    ('skill-source-math2-d1-hybrid', 'skill-math2-d1', 'qs-hybrid-fallback', 1, true, 1, 5, '["core","review","mixed"]'::jsonb, '{}'::jsonb),
    ('skill-source-math2-d2-hybrid', 'skill-math2-d2', 'qs-hybrid-fallback', 1, true, 1, 5, '["review","mixed","exam"]'::jsonb, '{"usage":"mixed-assessment"}'::jsonb),
    ('skill-source-math2-e1-hybrid', 'skill-math2-e1', 'qs-hybrid-fallback', 1, true, 1, 5, '["review","mixed","exam"]'::jsonb, '{"usage":"mixed-assessment"}'::jsonb),
    ('skill-source-math2-e2-generator', 'skill-math2-e2', 'qs-local-generator', 1, true, 2, 5, '["challenge","mixed"]'::jsonb, '{"usage":"challenge"}'::jsonb),
    ('skill-source-math2-e3-generator', 'skill-math2-e3', 'qs-local-generator', 1, true, 2, 5, '["challenge","mixed"]'::jsonb, '{"usage":"challenge"}'::jsonb)
on conflict (id) do update set
    question_source_id = excluded.question_source_id,
    priority = excluded.priority,
    is_primary = excluded.is_primary,
    level_min = excluded.level_min,
    level_max = excluded.level_max,
    allowed_modes = excluded.allowed_modes,
    config_override = excluded.config_override,
    updated_at = now();

insert into public.question_templates (
    id,
    curriculum_skill_id,
    question_source_id,
    code,
    title,
    template_kind,
    difficulty_level,
    stage,
    prompt_template,
    answer_strategy,
    metadata,
    is_active
) values
    ('qt-math2-a4-core', 'skill-math2-a4', 'qs-local-generator', 'a4-core-table', 'B?ng nh?n chia 2 v? 5', 'generator-rule', 3, 'core', null, 'normalized', '{"allowedTables":[2,5]}'::jsonb, true),
    ('qt-math2-b1-core', 'skill-math2-b1', 'qs-local-generator', 'b1-core-word', 'L?i v?n 1 b??c', 'generator-rule', 3, 'core', null, 'normalized', '{"operationCount":1}'::jsonb, true),
    ('qt-math2-b2-mixed', 'skill-math2-b2', 'qs-local-generator', 'b2-two-step', 'L?i v?n 2 b??c', 'generator-rule', 4, 'mixed', null, 'normalized', '{"operationCount":2}'::jsonb, true),
    ('qt-math2-e2-challenge', 'skill-math2-e2', 'qs-local-generator', 'e2-challenge-grid', 'B?ng ? s? n?ng cao', 'generator-rule', 4, 'challenge', null, 'exact', '{"challenge":true}'::jsonb, true),
    ('qt-math2-e3-challenge', 'skill-math2-e3', 'qs-local-generator', 'e3-challenge-tower', 'Th?p s? n?ng cao', 'generator-rule', 5, 'challenge', null, 'exact', '{"challenge":true}'::jsonb, true)
on conflict (id) do update set
    question_source_id = excluded.question_source_id,
    code = excluded.code,
    title = excluded.title,
    template_kind = excluded.template_kind,
    difficulty_level = excluded.difficulty_level,
    stage = excluded.stage,
    prompt_template = excluded.prompt_template,
    answer_strategy = excluded.answer_strategy,
    metadata = excluded.metadata,
    is_active = excluded.is_active,
    updated_at = now();


insert into public.curricula (
    id,
    subject_id,
    grade,
    name,
    description,
    academic_year,
    version,
    is_active
) values
    ('curr-english-grade-2-v1', 'english', 2, 'Ti?ng Anh l?p 2', 'Curriculum mo rong cho Ti?ng Anh l?p 2.', '2025-2026', 1, true),
    ('curr-vietnamese-grade-2-v1', 'vietnamese', 2, 'Ti?ng Vi?t l?p 2', 'Curriculum mo rong cho Ti?ng Vi?t l?p 2.', '2025-2026', 1, true)
on conflict (id) do update set
    name = excluded.name,
    description = excluded.description,
    academic_year = excluded.academic_year,
    version = excluded.version,
    is_active = excluded.is_active,
    updated_at = now();

insert into public.curriculum_phases (
    id,
    curriculum_id,
    code,
    name,
    semester,
    order_index
) values
    ('phase-eng2-hk1-dau', 'curr-english-grade-2-v1', 'hk1_dau', '??u h?c k? 1', 1, 10),
    ('phase-eng2-hk1-giua', 'curr-english-grade-2-v1', 'hk1_giua', 'Gi?a h?c k? 1', 1, 20),
    ('phase-eng2-hk1-cuoi', 'curr-english-grade-2-v1', 'hk1_cuoi', 'Cu?i h?c k? 1', 1, 30),
    ('phase-eng2-hk2-dau', 'curr-english-grade-2-v1', 'hk2_dau', '??u h?c k? 2', 2, 40),
    ('phase-eng2-hk2-giua', 'curr-english-grade-2-v1', 'hk2_giua', 'Gi?a h?c k? 2', 2, 50),
    ('phase-eng2-hk2-cuoi', 'curr-english-grade-2-v1', 'hk2_cuoi', 'Cu?i h?c k? 2', 2, 60),
    ('phase-tv2-hk1-dau', 'curr-vietnamese-grade-2-v1', 'hk1_dau', '??u h?c k? 1', 1, 10),
    ('phase-tv2-hk1-giua', 'curr-vietnamese-grade-2-v1', 'hk1_giua', 'Gi?a h?c k? 1', 1, 20),
    ('phase-tv2-hk1-cuoi', 'curr-vietnamese-grade-2-v1', 'hk1_cuoi', 'Cu?i h?c k? 1', 1, 30),
    ('phase-tv2-hk2-dau', 'curr-vietnamese-grade-2-v1', 'hk2_dau', '??u h?c k? 2', 2, 40),
    ('phase-tv2-hk2-giua', 'curr-vietnamese-grade-2-v1', 'hk2_giua', 'Gi?a h?c k? 2', 2, 50),
    ('phase-tv2-hk2-cuoi', 'curr-vietnamese-grade-2-v1', 'hk2_cuoi', 'Cu?i h?c k? 2', 2, 60)
on conflict (id) do update set
    code = excluded.code,
    name = excluded.name,
    semester = excluded.semester,
    order_index = excluded.order_index,
    updated_at = now();

insert into public.curriculum_topics (
    id,
    curriculum_id,
    code,
    name,
    description,
    order_index
) values
    ('topic-eng2-vocab', 'curr-english-grade-2-v1', 'vocab', 'T? v?ng', 'T? v?ng quen thuoc va chu de gan gui.', 10),
    ('topic-eng2-phonics', 'curr-english-grade-2-v1', 'phonics', 'Ng? ?m', 'Nh?n bi?t ch? c?i v? ?m ??u c? b?n.', 20),
    ('topic-eng2-sentences', 'curr-english-grade-2-v1', 'sentences', 'M?u c?u', 'Ch?o h?i v? h?i ??p ??n gi?n.', 30),
    ('topic-eng2-skills', 'curr-english-grade-2-v1', 'skills', '4 k? n?ng', 'Nghe n?i ??c vi?t m?c ?? l?p 2.', 40),
    ('topic-tv2-doc', 'curr-vietnamese-grade-2-v1', 'doc', '??c v? c?m th?', '??c hi?u, th? v? ??c di?n c?m.', 10),
    ('topic-tv2-tu-cau', 'curr-vietnamese-grade-2-v1', 'tu-cau', 'Luy?n t? v? c?u', 'T? ng?, c?u v? d?u c?u c? b?n.', 20),
    ('topic-tv2-viet', 'curr-vietnamese-grade-2-v1', 'viet', 'Ch?nh t? v? vi?t', 'Ch?nh t?, k? chuy?n v? t? ng??i th?n.', 30),
    ('topic-tv2-noi', 'curr-vietnamese-grade-2-v1', 'noi', 'Nghe v? n?i', 'K? l?i vi?c ?? l?m v? gi?i thi?u ?? v?t.', 40)
on conflict (id) do update set
    code = excluded.code,
    name = excluded.name,
    description = excluded.description,
    order_index = excluded.order_index,
    updated_at = now();

insert into public.curriculum_skills (
    id,
    curriculum_id,
    topic_id,
    phase_id,
    skill_code,
    name,
    semester,
    order_index,
    stage,
    difficulty_band,
    difficulty_base,
    min_attempts,
    min_mastery_to_unlock_next,
    question_types,
    is_core,
    is_reviewable,
    is_mixed_exam_eligible,
    is_challenge,
    source_strategy,
    metadata
) values
    ('skill-eng2-hello', 'curr-english-grade-2-v1', 'topic-eng2-sentences', 'phase-eng2-hk1-dau', 'eng-hello', 'Greetings', 1, 10, 'foundation', 'foundation', 1, 3, 0.65, '["mcq","input"]'::jsonb, true, true, true, false, 'hybrid', '{"legacySkillId":"eng-hello"}'::jsonb),
    ('skill-eng2-colors', 'curr-english-grade-2-v1', 'topic-eng2-vocab', 'phase-eng2-hk1-dau', 'eng-colors', 'Colors', 1, 20, 'foundation', 'foundation', 1, 3, 0.65, '["mcq","input"]'::jsonb, true, true, true, false, 'hybrid', '{"legacySkillId":"eng-colors"}'::jsonb),
    ('skill-eng2-school', 'curr-english-grade-2-v1', 'topic-eng2-vocab', 'phase-eng2-hk1-dau', 'eng-school', 'School', 1, 30, 'foundation', 'standard', 1, 3, 0.65, '["mcq","input"]'::jsonb, true, true, true, false, 'hybrid', '{"legacySkillId":"eng-school"}'::jsonb),
    ('skill-eng2-phonics-a', 'curr-english-grade-2-v1', 'topic-eng2-phonics', 'phase-eng2-hk1-dau', 'eng-phonics-a', 'Letter A', 1, 40, 'foundation', 'foundation', 1, 2, 0.6, '["mcq","input"]'::jsonb, true, true, false, false, 'hybrid', '{"legacySkillId":"eng-phonics-a"}'::jsonb),
    ('skill-eng2-phonics-b', 'curr-english-grade-2-v1', 'topic-eng2-phonics', 'phase-eng2-hk1-giua', 'eng-phonics-b', 'Letter B', 1, 50, 'foundation', 'foundation', 1, 2, 0.6, '["mcq","input"]'::jsonb, true, true, false, false, 'hybrid', '{"legacySkillId":"eng-phonics-b"}'::jsonb),
    ('skill-eng2-family', 'curr-english-grade-2-v1', 'topic-eng2-vocab', 'phase-eng2-hk1-giua', 'eng-family', 'Family', 1, 60, 'core', 'standard', 2, 3, 0.68, '["mcq","input"]'::jsonb, true, true, true, false, 'hybrid', '{"legacySkillId":"eng-family"}'::jsonb),
    ('skill-eng2-name', 'curr-english-grade-2-v1', 'topic-eng2-sentences', 'phase-eng2-hk1-giua', 'eng-qa-name', 'What''s your name?', 1, 70, 'core', 'standard', 2, 3, 0.68, '["mcq","input"]'::jsonb, true, true, true, false, 'hybrid', '{"legacySkillId":"eng-qa-name"}'::jsonb),
    ('skill-eng2-phonics-c', 'curr-english-grade-2-v1', 'topic-eng2-phonics', 'phase-eng2-hk1-cuoi', 'eng-phonics-c', 'Letter C', 1, 80, 'core', 'standard', 2, 2, 0.62, '["mcq","input"]'::jsonb, true, true, false, false, 'hybrid', '{"legacySkillId":"eng-phonics-c"}'::jsonb),
    ('skill-eng2-list', 'curr-english-grade-2-v1', 'topic-eng2-skills', 'phase-eng2-hk1-cuoi', 'eng2-list', 'Listening: Colors & Numbers', 1, 90, 'core', 'standard', 2, 3, 0.68, '["listening","mcq"]'::jsonb, true, true, true, false, 'generator', '{"legacySkillId":"eng2-list"}'::jsonb),
    ('skill-eng2-read', 'curr-english-grade-2-v1', 'topic-eng2-skills', 'phase-eng2-hk2-dau', 'eng2-read', 'Reading: Short Sentences', 2, 100, 'core', 'standard', 2, 3, 0.68, '["reading","mcq"]'::jsonb, true, true, true, false, 'hybrid', '{"legacySkillId":"eng2-read"}'::jsonb),
    ('skill-eng2-write', 'curr-english-grade-2-v1', 'topic-eng2-skills', 'phase-eng2-hk2-giua', 'eng2-write', 'Writing: Simple Words', 2, 110, 'mixed', 'advanced', 3, 3, 0.7, '["input","mcq"]'::jsonb, true, true, true, false, 'hybrid', '{"legacySkillId":"eng2-write"}'::jsonb),
    ('skill-eng2-animals', 'curr-english-grade-2-v1', 'topic-eng2-vocab', 'phase-eng2-hk2-giua', 'eng-animals', 'Animals', 2, 120, 'core', 'standard', 2, 3, 0.68, '["mcq","input"]'::jsonb, true, true, true, false, 'hybrid', '{"legacySkillId":"eng-animals"}'::jsonb),
    ('skill-eng2-this-that', 'curr-english-grade-2-v1', 'topic-eng2-sentences', 'phase-eng2-hk2-cuoi', 'eng-qa-this-that', 'What''s this/that?', 2, 130, 'mixed', 'advanced', 3, 4, 0.72, '["mcq","input"]'::jsonb, true, true, true, false, 'hybrid', '{"legacySkillId":"eng-qa-this-that"}'::jsonb),
    ('skill-eng2-speak', 'curr-english-grade-2-v1', 'topic-eng2-skills', 'phase-eng2-hk2-cuoi', 'eng2-speak', 'Speaking: Introduce Yourself', 2, 140, 'challenge', 'challenge', 4, 2, 0.75, '["speaking","input"]'::jsonb, false, true, true, true, 'generator', '{"legacySkillId":"eng2-speak"}'::jsonb),
    ('skill-tv2-tu-ngu', 'curr-vietnamese-grade-2-v1', 'topic-tv2-tu-cau', 'phase-tv2-hk1-dau', 'tv2-tu-ngu', 'T? ch? s? v?t, ho?t ??ng, ??c ?i?m', 1, 10, 'foundation', 'foundation', 1, 3, 0.65, '["mcq","input"]'::jsonb, true, true, true, false, 'hybrid', '{"legacySkillId":"tv2-tu-ngu"}'::jsonb),
    ('skill-tv2-cau', 'curr-vietnamese-grade-2-v1', 'topic-tv2-tu-cau', 'phase-tv2-hk1-dau', 'tv2-cau', 'C?u gi?i thi?u, c?u n?u ho?t ??ng', 1, 20, 'foundation', 'standard', 1, 3, 0.65, '["mcq","input"]'::jsonb, true, true, true, false, 'hybrid', '{"legacySkillId":"tv2-cau"}'::jsonb),
    ('skill-tv2-doc-hieu', 'curr-vietnamese-grade-2-v1', 'topic-tv2-doc', 'phase-tv2-hk1-dau', 'tv2-doc-hieu', '??c hi?u v?n b?n ng?n', 1, 30, 'foundation', 'standard', 1, 3, 0.65, '["reading","mcq"]'::jsonb, true, true, true, false, 'hybrid', '{"legacySkillId":"tv2-doc-hieu"}'::jsonb),
    ('skill-tv2-dau-cau', 'curr-vietnamese-grade-2-v1', 'topic-tv2-tu-cau', 'phase-tv2-hk1-giua', 'tv2-dau-cau', 'D?u ch?m, ph?y, ch?m h?i', 1, 40, 'core', 'standard', 2, 3, 0.68, '["mcq","input"]'::jsonb, true, true, true, false, 'hybrid', '{"legacySkillId":"tv2-dau-cau"}'::jsonb),
    ('skill-tv2-tho', 'curr-vietnamese-grade-2-v1', 'topic-tv2-doc', 'phase-tv2-hk1-giua', 'tv2-tho', '??c th? v? ca dao', 1, 50, 'core', 'standard', 2, 3, 0.68, '["reading","mcq"]'::jsonb, true, true, true, false, 'hybrid', '{"legacySkillId":"tv2-tho"}'::jsonb),
    ('skill-tv2-doc-dien-cam', 'curr-vietnamese-grade-2-v1', 'topic-tv2-doc', 'phase-tv2-hk1-giua', 'tv2-doc-dien-cam', '??c di?n c?m', 1, 60, 'core', 'standard', 2, 2, 0.62, '["speaking","input"]'::jsonb, true, true, false, false, 'generator', '{"legacySkillId":"tv2-doc-dien-cam"}'::jsonb),
    ('skill-tv2-chinh-ta', 'curr-vietnamese-grade-2-v1', 'topic-tv2-viet', 'phase-tv2-hk1-cuoi', 'tv2-chinh-ta', 'Ph?n bi?t tr/ch, s/x, r/d/gi', 1, 70, 'core', 'standard', 2, 3, 0.68, '["mcq","input"]'::jsonb, true, true, true, false, 'hybrid', '{"legacySkillId":"tv2-chinh-ta"}'::jsonb),
    ('skill-tv2-noi-nghe', 'curr-vietnamese-grade-2-v1', 'topic-tv2-noi', 'phase-tv2-hk1-cuoi', 'tv2-noi-nghe', 'K? l?i vi?c ?? l?m', 1, 80, 'core', 'standard', 2, 2, 0.62, '["speaking","input"]'::jsonb, true, true, false, false, 'generator', '{"legacySkillId":"tv2-noi-nghe"}'::jsonb),
    ('skill-tv2-ke-chuyen', 'curr-vietnamese-grade-2-v1', 'topic-tv2-viet', 'phase-tv2-hk2-dau', 'tv2-ke-chuyen', 'Vi?t: K? chuy?n theo tranh', 2, 90, 'mixed', 'advanced', 3, 3, 0.7, '["input","mcq"]'::jsonb, true, true, true, false, 'hybrid', '{"legacySkillId":"tv2-ke-chuyen"}'::jsonb),
    ('skill-tv2-ta-nguoi', 'curr-vietnamese-grade-2-v1', 'topic-tv2-viet', 'phase-tv2-hk2-giua', 'tv2-ta-nguoi', 'Vi?t: T? ng??i th?n', 2, 100, 'mixed', 'advanced', 3, 3, 0.72, '["input","mcq"]'::jsonb, true, true, true, false, 'hybrid', '{"legacySkillId":"tv2-ta-nguoi"}'::jsonb),
    ('skill-tv2-thuyet-trinh', 'curr-vietnamese-grade-2-v1', 'topic-tv2-noi', 'phase-tv2-hk2-cuoi', 'tv2-thuyet-trinh', 'Gi?i thi?u ?? v?t/s?ch', 2, 110, 'challenge', 'challenge', 4, 2, 0.75, '["speaking","input"]'::jsonb, false, true, true, true, 'generator', '{"legacySkillId":"tv2-thuyet-trinh"}'::jsonb)
on conflict (id) do update set
    topic_id = excluded.topic_id,
    phase_id = excluded.phase_id,
    skill_code = excluded.skill_code,
    name = excluded.name,
    semester = excluded.semester,
    order_index = excluded.order_index,
    stage = excluded.stage,
    difficulty_band = excluded.difficulty_band,
    difficulty_base = excluded.difficulty_base,
    min_attempts = excluded.min_attempts,
    min_mastery_to_unlock_next = excluded.min_mastery_to_unlock_next,
    question_types = excluded.question_types,
    is_core = excluded.is_core,
    is_reviewable = excluded.is_reviewable,
    is_mixed_exam_eligible = excluded.is_mixed_exam_eligible,
    is_challenge = excluded.is_challenge,
    source_strategy = excluded.source_strategy,
    metadata = excluded.metadata,
    updated_at = now();

insert into public.curriculum_skill_prerequisites (
    skill_id,
    prerequisite_skill_id,
    relation_type
) values
    ('skill-eng2-colors', 'skill-eng2-hello', 'recommended'),
    ('skill-eng2-school', 'skill-eng2-colors', 'recommended'),
    ('skill-eng2-phonics-b', 'skill-eng2-phonics-a', 'required'),
    ('skill-eng2-family', 'skill-eng2-colors', 'recommended'),
    ('skill-eng2-name', 'skill-eng2-hello', 'required'),
    ('skill-eng2-phonics-c', 'skill-eng2-phonics-b', 'required'),
    ('skill-eng2-list', 'skill-eng2-name', 'required'),
    ('skill-eng2-read', 'skill-eng2-list', 'recommended'),
    ('skill-eng2-write', 'skill-eng2-read', 'required'),
    ('skill-eng2-animals', 'skill-eng2-family', 'recommended'),
    ('skill-eng2-this-that', 'skill-eng2-read', 'required'),
    ('skill-eng2-speak', 'skill-eng2-name', 'required'),
    ('skill-tv2-cau', 'skill-tv2-tu-ngu', 'required'),
    ('skill-tv2-doc-hieu', 'skill-tv2-tu-ngu', 'recommended'),
    ('skill-tv2-dau-cau', 'skill-tv2-cau', 'required'),
    ('skill-tv2-tho', 'skill-tv2-doc-hieu', 'recommended'),
    ('skill-tv2-doc-dien-cam', 'skill-tv2-tho', 'required'),
    ('skill-tv2-chinh-ta', 'skill-tv2-cau', 'required'),
    ('skill-tv2-noi-nghe', 'skill-tv2-doc-hieu', 'recommended'),
    ('skill-tv2-ke-chuyen', 'skill-tv2-doc-hieu', 'required'),
    ('skill-tv2-ta-nguoi', 'skill-tv2-ke-chuyen', 'required'),
    ('skill-tv2-thuyet-trinh', 'skill-tv2-noi-nghe', 'required')
on conflict (skill_id, prerequisite_skill_id) do update set
    relation_type = excluded.relation_type;

insert into public.curriculum_skill_question_sources (
    id,
    curriculum_skill_id,
    question_source_id,
    priority,
    is_primary,
    level_min,
    level_max,
    allowed_modes,
    config_override
) values
    ('skill-source-eng2-hello-hybrid', 'skill-eng2-hello', 'qs-hybrid-fallback', 1, true, 1, 3, '["core","review","mixed"]'::jsonb, '{}'::jsonb),
    ('skill-source-eng2-colors-hybrid', 'skill-eng2-colors', 'qs-hybrid-fallback', 1, true, 1, 3, '["core","review","mixed"]'::jsonb, '{"theme":"colors"}'::jsonb),
    ('skill-source-eng2-school-hybrid', 'skill-eng2-school', 'qs-hybrid-fallback', 1, true, 1, 3, '["core","review","mixed"]'::jsonb, '{"theme":"school"}'::jsonb),
    ('skill-source-eng2-phonics-a-hybrid', 'skill-eng2-phonics-a', 'qs-hybrid-fallback', 1, true, 1, 2, '["core","review"]'::jsonb, '{"letter":"A"}'::jsonb),
    ('skill-source-eng2-phonics-b-hybrid', 'skill-eng2-phonics-b', 'qs-hybrid-fallback', 1, true, 1, 2, '["core","review"]'::jsonb, '{"letter":"B"}'::jsonb),
    ('skill-source-eng2-family-hybrid', 'skill-eng2-family', 'qs-hybrid-fallback', 1, true, 1, 3, '["core","review","mixed"]'::jsonb, '{"theme":"family"}'::jsonb),
    ('skill-source-eng2-name-hybrid', 'skill-eng2-name', 'qs-hybrid-fallback', 1, true, 1, 3, '["core","review","mixed"]'::jsonb, '{"sentence":"name"}'::jsonb),
    ('skill-source-eng2-phonics-c-hybrid', 'skill-eng2-phonics-c', 'qs-hybrid-fallback', 1, true, 1, 2, '["core","review"]'::jsonb, '{"letter":"C"}'::jsonb),
    ('skill-source-eng2-list-generator', 'skill-eng2-list', 'qs-local-generator', 1, true, 1, 3, '["core","review","mixed"]'::jsonb, '{"skillType":"listening"}'::jsonb),
    ('skill-source-eng2-read-hybrid', 'skill-eng2-read', 'qs-hybrid-fallback', 1, true, 1, 3, '["core","review","mixed","exam"]'::jsonb, '{"skillType":"reading"}'::jsonb),
    ('skill-source-eng2-write-hybrid', 'skill-eng2-write', 'qs-hybrid-fallback', 1, true, 1, 3, '["review","mixed","exam"]'::jsonb, '{"skillType":"writing"}'::jsonb),
    ('skill-source-eng2-animals-hybrid', 'skill-eng2-animals', 'qs-hybrid-fallback', 1, true, 1, 3, '["core","review","mixed"]'::jsonb, '{"theme":"animals"}'::jsonb),
    ('skill-source-eng2-this-that-hybrid', 'skill-eng2-this-that', 'qs-hybrid-fallback', 1, true, 1, 3, '["core","review","mixed","exam"]'::jsonb, '{"sentence":"this-that"}'::jsonb),
    ('skill-source-eng2-speak-generator', 'skill-eng2-speak', 'qs-local-generator', 1, true, 1, 3, '["challenge","mixed"]'::jsonb, '{"skillType":"speaking"}'::jsonb),
    ('skill-source-tv2-tu-ngu-hybrid', 'skill-tv2-tu-ngu', 'qs-hybrid-fallback', 1, true, 1, 3, '["core","review","mixed"]'::jsonb, '{"focus":"vocab"}'::jsonb),
    ('skill-source-tv2-cau-hybrid', 'skill-tv2-cau', 'qs-hybrid-fallback', 1, true, 1, 3, '["core","review","mixed"]'::jsonb, '{"focus":"sentence"}'::jsonb),
    ('skill-source-tv2-doc-hieu-hybrid', 'skill-tv2-doc-hieu', 'qs-hybrid-fallback', 1, true, 1, 3, '["core","review","mixed","exam"]'::jsonb, '{"focus":"reading"}'::jsonb),
    ('skill-source-tv2-dau-cau-hybrid', 'skill-tv2-dau-cau', 'qs-hybrid-fallback', 1, true, 1, 3, '["core","review","mixed"]'::jsonb, '{"focus":"punctuation"}'::jsonb),
    ('skill-source-tv2-tho-hybrid', 'skill-tv2-tho', 'qs-hybrid-fallback', 1, true, 1, 3, '["core","review","mixed"]'::jsonb, '{"focus":"poetry"}'::jsonb),
    ('skill-source-tv2-doc-dien-cam-generator', 'skill-tv2-doc-dien-cam', 'qs-local-generator', 1, true, 1, 3, '["core","review"]'::jsonb, '{"skillType":"expressive-reading"}'::jsonb),
    ('skill-source-tv2-chinh-ta-hybrid', 'skill-tv2-chinh-ta', 'qs-hybrid-fallback', 1, true, 1, 3, '["core","review","mixed","exam"]'::jsonb, '{"focus":"spelling"}'::jsonb),
    ('skill-source-tv2-noi-nghe-generator', 'skill-tv2-noi-nghe', 'qs-local-generator', 1, true, 1, 3, '["core","review"]'::jsonb, '{"skillType":"speaking"}'::jsonb),
    ('skill-source-tv2-ke-chuyen-hybrid', 'skill-tv2-ke-chuyen', 'qs-hybrid-fallback', 1, true, 1, 3, '["review","mixed","exam"]'::jsonb, '{"focus":"story"}'::jsonb),
    ('skill-source-tv2-ta-nguoi-hybrid', 'skill-tv2-ta-nguoi', 'qs-hybrid-fallback', 1, true, 1, 3, '["review","mixed","exam"]'::jsonb, '{"focus":"description"}'::jsonb),
    ('skill-source-tv2-thuyet-trinh-generator', 'skill-tv2-thuyet-trinh', 'qs-local-generator', 1, true, 1, 3, '["challenge","mixed"]'::jsonb, '{"skillType":"speaking"}'::jsonb)
on conflict (id) do update set
    question_source_id = excluded.question_source_id,
    priority = excluded.priority,
    is_primary = excluded.is_primary,
    level_min = excluded.level_min,
    level_max = excluded.level_max,
    allowed_modes = excluded.allowed_modes,
    config_override = excluded.config_override,
    updated_at = now();

insert into public.question_templates (
    id,
    curriculum_skill_id,
    question_source_id,
    code,
    title,
    template_kind,
    difficulty_level,
    stage,
    prompt_template,
    answer_strategy,
    metadata,
    is_active
) values
    ('qt-eng2-hello-core', 'skill-eng2-hello', 'qs-hybrid-fallback', 'eng2-hello-core', 'Greetings basics', 'static', 1, 'foundation', null, 'normalized', '{"topic":"greetings"}'::jsonb, true),
    ('qt-eng2-list-core', 'skill-eng2-list', 'qs-local-generator', 'eng2-listen-core', 'Listening colors and numbers', 'generator-rule', 2, 'core', null, 'normalized', '{"skillType":"listening"}'::jsonb, true),
    ('qt-eng2-write-mixed', 'skill-eng2-write', 'qs-hybrid-fallback', 'eng2-write-simple', 'Simple writing prompts', 'generator-rule', 3, 'mixed', null, 'normalized', '{"skillType":"writing"}'::jsonb, true),
    ('qt-eng2-speak-challenge', 'skill-eng2-speak', 'qs-local-generator', 'eng2-speak-intro', 'Introduce yourself', 'generator-rule', 3, 'challenge', null, 'rubric', '{"skillType":"speaking"}'::jsonb, true),
    ('qt-tv2-doc-core', 'skill-tv2-doc-hieu', 'qs-hybrid-fallback', 'tv2-doc-short', '??c hi?u v?n b?n ng?n', 'static', 2, 'foundation', null, 'normalized', '{"skillType":"reading"}'::jsonb, true),
    ('qt-tv2-chinh-ta-core', 'skill-tv2-chinh-ta', 'qs-hybrid-fallback', 'tv2-spelling-core', 'Chinh ta co ban', 'generator-rule', 2, 'core', null, 'normalized', '{"focus":"spelling"}'::jsonb, true),
    ('qt-tv2-ke-chuyen-mixed', 'skill-tv2-ke-chuyen', 'qs-hybrid-fallback', 'tv2-story-mixed', 'Ke chuyen theo tranh', 'generator-rule', 3, 'mixed', null, 'rubric', '{"focus":"story"}'::jsonb, true),
    ('qt-tv2-thuyet-trinh-challenge', 'skill-tv2-thuyet-trinh', 'qs-local-generator', 'tv2-present-object', 'Gioi thieu do vat', 'generator-rule', 3, 'challenge', null, 'rubric', '{"focus":"speaking"}'::jsonb, true)
on conflict (id) do update set
    question_source_id = excluded.question_source_id,
    code = excluded.code,
    title = excluded.title,
    template_kind = excluded.template_kind,
    difficulty_level = excluded.difficulty_level,
    stage = excluded.stage,
    prompt_template = excluded.prompt_template,
    answer_strategy = excluded.answer_strategy,
    metadata = excluded.metadata,
    is_active = excluded.is_active,
    updated_at = now();

insert into public.curricula (
    id,
    subject_id,
    grade,
    name,
    description,
    academic_year,
    version,
    is_active
) values
    ('curr-finance-grade-2-v1', 'finance', 2, 'Tai chinh lop 2', 'Curriculum mo rong cho Tai chinh lop 2.', '2025-2026', 1, true)
on conflict (id) do update set
    name = excluded.name,
    description = excluded.description,
    academic_year = excluded.academic_year,
    version = excluded.version,
    is_active = excluded.is_active,
    updated_at = now();

insert into public.curriculum_phases (
    id,
    curriculum_id,
    code,
    name,
    semester,
    order_index
) values
    ('phase-fin2-hk1-dau', 'curr-finance-grade-2-v1', 'hk1_dau', '??u h?c k? 1', 1, 10),
    ('phase-fin2-hk1-giua', 'curr-finance-grade-2-v1', 'hk1_giua', 'Gi?a h?c k? 1', 1, 20),
    ('phase-fin2-hk1-cuoi', 'curr-finance-grade-2-v1', 'hk1_cuoi', 'Cu?i h?c k? 1', 1, 30),
    ('phase-fin2-hk2-dau', 'curr-finance-grade-2-v1', 'hk2_dau', '??u h?c k? 2', 2, 40),
    ('phase-fin2-hk2-giua', 'curr-finance-grade-2-v1', 'hk2_giua', 'Gi?a h?c k? 2', 2, 50),
    ('phase-fin2-hk2-cuoi', 'curr-finance-grade-2-v1', 'hk2_cuoi', 'Cu?i h?c k? 2', 2, 60)
on conflict (id) do update set
    code = excluded.code,
    name = excluded.name,
    semester = excluded.semester,
    order_index = excluded.order_index,
    updated_at = now();

insert into public.curriculum_topics (
    id,
    curriculum_id,
    code,
    name,
    description,
    order_index
) values
    ('topic-fin2-money', 'curr-finance-grade-2-v1', 'money', 'Lam quen voi tien', 'Nhan biet menh gia, so sanh gia tri va cong tien don gian.', 10),
    ('topic-fin2-spending', 'curr-finance-grade-2-v1', 'spending', 'Chi tieu thong minh', 'Mua sam don gian va phan biet can, muon.', 20),
    ('topic-fin2-saving', 'curr-finance-grade-2-v1', 'saving', 'Ti?t ki?m v? gi? tr? lao ??ng', 'Ti?t ki?m, m?c ti?u v? gi? tr? ngh? nghi?p.', 30)
on conflict (id) do update set
    code = excluded.code,
    name = excluded.name,
    description = excluded.description,
    order_index = excluded.order_index,
    updated_at = now();

insert into public.curriculum_skills (
    id,
    curriculum_id,
    topic_id,
    phase_id,
    skill_code,
    name,
    semester,
    order_index,
    stage,
    difficulty_band,
    difficulty_base,
    min_attempts,
    min_mastery_to_unlock_next,
    question_types,
    is_core,
    is_reviewable,
    is_mixed_exam_eligible,
    is_challenge,
    source_strategy,
    metadata
) values
    ('skill-fin2-c3', 'curr-finance-grade-2-v1', 'topic-fin2-money', 'phase-fin2-hk1-dau', 'C3', 'Nhan biet tien Viet Nam', 1, 10, 'foundation', 'foundation', 1, 3, 0.65, '["mcq","input"]'::jsonb, true, true, true, false, 'hybrid', '{"legacySkillId":"C3"}'::jsonb),
    ('skill-fin2-identify', 'curr-finance-grade-2-v1', 'topic-fin2-money', 'phase-fin2-hk1-dau', 'identify-money', 'Nhan biet to tien co ban', 1, 20, 'foundation', 'foundation', 1, 3, 0.65, '["mcq","input"]'::jsonb, true, true, true, false, 'hybrid', '{"legacySkillId":"identify-money"}'::jsonb),
    ('skill-fin2-compare', 'curr-finance-grade-2-v1', 'topic-fin2-money', 'phase-fin2-hk1-giua', 'compare-value', 'So sanh gia tri tien', 1, 30, 'core', 'standard', 2, 3, 0.68, '["mcq","input"]'::jsonb, true, true, true, false, 'hybrid', '{"legacySkillId":"compare-value"}'::jsonb),
    ('skill-fin2-money-sum', 'curr-finance-grade-2-v1', 'topic-fin2-money', 'phase-fin2-hk1-giua', 'money-sum', 'Cong tien don gian', 1, 40, 'core', 'standard', 2, 3, 0.68, '["input"]'::jsonb, true, true, true, false, 'generator', '{"legacySkillId":"money-sum"}'::jsonb),
    ('skill-fin2-need', 'curr-finance-grade-2-v1', 'topic-fin2-spending', 'phase-fin2-hk1-giua', 'need-vs-want', 'Can hay muon', 1, 50, 'foundation', 'foundation', 1, 3, 0.65, '["mcq","input"]'::jsonb, true, true, true, false, 'hybrid', '{"legacySkillId":"need-vs-want"}'::jsonb),
    ('skill-fin2-pig', 'curr-finance-grade-2-v1', 'topic-fin2-saving', 'phase-fin2-hk1-cuoi', 'saving-pig', 'Nuoi heo dat co ban', 1, 60, 'foundation', 'standard', 2, 3, 0.68, '["mcq","input"]'::jsonb, true, true, true, false, 'generator', '{"legacySkillId":"saving-pig"}'::jsonb),
    ('skill-fin2-shopping', 'curr-finance-grade-2-v1', 'topic-fin2-spending', 'phase-fin2-hk1-cuoi', 'fin2-shopping', 'Di cho: tinh tien 2 mon', 1, 70, 'core', 'standard', 2, 4, 0.7, '["input","mcq"]'::jsonb, true, true, true, false, 'generator', '{"legacySkillId":"fin2-shopping"}'::jsonb),
    ('skill-fin2-goal', 'curr-finance-grade-2-v1', 'topic-fin2-saving', 'phase-fin2-hk2-dau', 'saving-goal', 'Dat muc tieu tiet kiem', 2, 80, 'mixed', 'advanced', 3, 3, 0.72, '["input","mcq"]'::jsonb, true, true, true, false, 'generator', '{"legacySkillId":"saving-goal"}'::jsonb),
    ('skill-fin2-job', 'curr-finance-grade-2-v1', 'topic-fin2-saving', 'phase-fin2-hk2-giua', 'job-value', 'Ngh? nghi?p v? gi? tr? lao ??ng', 2, 90, 'core', 'standard', 2, 3, 0.68, '["mcq","input"]'::jsonb, true, true, true, false, 'hybrid', '{"legacySkillId":"job-value"}'::jsonb),
    ('skill-fin2-saving', 'curr-finance-grade-2-v1', 'topic-fin2-saving', 'phase-fin2-hk2-giua', 'fin2-saving', 'Heo dat: tap tiet kiem', 2, 100, 'mixed', 'advanced', 3, 3, 0.72, '["input","mcq"]'::jsonb, true, true, true, false, 'generator', '{"legacySkillId":"fin2-saving"}'::jsonb),
    ('skill-fin2-shopping-math', 'curr-finance-grade-2-v1', 'topic-fin2-spending', 'phase-fin2-hk2-cuoi', 'shopping-math', 'Di cho thong minh', 2, 110, 'challenge', 'challenge', 3, 4, 0.78, '["input","mcq"]'::jsonb, false, true, true, true, 'generator', '{"legacySkillId":"shopping-math"}'::jsonb)
on conflict (id) do update set
    topic_id = excluded.topic_id,
    phase_id = excluded.phase_id,
    skill_code = excluded.skill_code,
    name = excluded.name,
    semester = excluded.semester,
    order_index = excluded.order_index,
    stage = excluded.stage,
    difficulty_band = excluded.difficulty_band,
    difficulty_base = excluded.difficulty_base,
    min_attempts = excluded.min_attempts,
    min_mastery_to_unlock_next = excluded.min_mastery_to_unlock_next,
    question_types = excluded.question_types,
    is_core = excluded.is_core,
    is_reviewable = excluded.is_reviewable,
    is_mixed_exam_eligible = excluded.is_mixed_exam_eligible,
    is_challenge = excluded.is_challenge,
    source_strategy = excluded.source_strategy,
    metadata = excluded.metadata,
    updated_at = now();

insert into public.curriculum_skill_prerequisites (
    skill_id,
    prerequisite_skill_id,
    relation_type
) values
    ('skill-fin2-identify', 'skill-fin2-c3', 'required'),
    ('skill-fin2-compare', 'skill-fin2-identify', 'required'),
    ('skill-fin2-money-sum', 'skill-fin2-compare', 'required'),
    ('skill-fin2-need', 'skill-fin2-identify', 'recommended'),
    ('skill-fin2-pig', 'skill-fin2-need', 'required'),
    ('skill-fin2-shopping', 'skill-fin2-money-sum', 'required'),
    ('skill-fin2-goal', 'skill-fin2-pig', 'required'),
    ('skill-fin2-job', 'skill-fin2-need', 'recommended'),
    ('skill-fin2-saving', 'skill-fin2-goal', 'required'),
    ('skill-fin2-shopping-math', 'skill-fin2-shopping', 'required')
on conflict (skill_id, prerequisite_skill_id) do update set
    relation_type = excluded.relation_type;

insert into public.curriculum_skill_question_sources (
    id,
    curriculum_skill_id,
    question_source_id,
    priority,
    is_primary,
    level_min,
    level_max,
    allowed_modes,
    config_override
) values
    ('skill-source-fin2-c3-hybrid', 'skill-fin2-c3', 'qs-hybrid-fallback', 1, true, 1, 2, '["core","review","mixed"]'::jsonb, '{"focus":"denomination"}'::jsonb),
    ('skill-source-fin2-identify-hybrid', 'skill-fin2-identify', 'qs-hybrid-fallback', 1, true, 1, 2, '["core","review","mixed"]'::jsonb, '{"focus":"identify-money"}'::jsonb),
    ('skill-source-fin2-compare-hybrid', 'skill-fin2-compare', 'qs-hybrid-fallback', 1, true, 1, 2, '["core","review","mixed"]'::jsonb, '{"focus":"compare-value"}'::jsonb),
    ('skill-source-fin2-money-sum-generator', 'skill-fin2-money-sum', 'qs-local-generator', 1, true, 1, 2, '["core","review","mixed"]'::jsonb, '{"skillType":"money-sum","maxValue":50000}'::jsonb),
    ('skill-source-fin2-need-hybrid', 'skill-fin2-need', 'qs-hybrid-fallback', 1, true, 1, 2, '["core","review","mixed"]'::jsonb, '{"focus":"need-vs-want"}'::jsonb),
    ('skill-source-fin2-pig-generator', 'skill-fin2-pig', 'qs-local-generator', 1, true, 1, 2, '["core","review","mixed"]'::jsonb, '{"skillType":"saving-pig","maxValue":50000}'::jsonb),
    ('skill-source-fin2-shopping-generator', 'skill-fin2-shopping', 'qs-local-generator', 1, true, 1, 2, '["core","review","mixed","exam"]'::jsonb, '{"skillType":"shopping","maxItems":2,"maxValue":50000}'::jsonb),
    ('skill-source-fin2-goal-generator', 'skill-fin2-goal', 'qs-local-generator', 1, true, 1, 2, '["review","mixed","exam"]'::jsonb, '{"skillType":"saving-goal","maxValue":50000}'::jsonb),
    ('skill-source-fin2-job-hybrid', 'skill-fin2-job', 'qs-hybrid-fallback', 1, true, 1, 2, '["core","review","mixed"]'::jsonb, '{"focus":"job-value"}'::jsonb),
    ('skill-source-fin2-saving-generator', 'skill-fin2-saving', 'qs-local-generator', 1, true, 1, 2, '["review","mixed","exam"]'::jsonb, '{"skillType":"saving","maxValue":50000}'::jsonb),
    ('skill-source-fin2-shopping-math-generator', 'skill-fin2-shopping-math', 'qs-local-generator', 1, true, 1, 2, '["challenge","mixed","exam"]'::jsonb, '{"skillType":"shopping-math","exactComparisonOnly":true,"maxValue":50000}'::jsonb)
on conflict (id) do update set
    question_source_id = excluded.question_source_id,
    priority = excluded.priority,
    is_primary = excluded.is_primary,
    level_min = excluded.level_min,
    level_max = excluded.level_max,
    allowed_modes = excluded.allowed_modes,
    config_override = excluded.config_override,
    updated_at = now();

insert into public.question_templates (
    id,
    curriculum_skill_id,
    question_source_id,
    code,
    title,
    template_kind,
    difficulty_level,
    stage,
    prompt_template,
    answer_strategy,
    metadata,
    is_active
) values
    ('qt-fin2-c3-foundation', 'skill-fin2-c3', 'qs-hybrid-fallback', 'fin2-c3-foundation', 'Nhan biet menh gia co ban', 'static', 1, 'foundation', null, 'normalized', '{"focus":"denomination"}'::jsonb, true),
    ('qt-fin2-money-sum-core', 'skill-fin2-money-sum', 'qs-local-generator', 'fin2-money-sum-core', 'Cong tien don gian', 'generator-rule', 2, 'core', null, 'exact', '{"skillType":"money-sum","maxValue":50000}'::jsonb, true),
    ('qt-fin2-need-foundation', 'skill-fin2-need', 'qs-hybrid-fallback', 'fin2-need-core', 'Can hay muon co ban', 'static', 1, 'foundation', null, 'normalized', '{"focus":"need-vs-want"}'::jsonb, true),
    ('qt-fin2-shopping-core', 'skill-fin2-shopping', 'qs-local-generator', 'fin2-shopping-core', 'Tinh tien 2 mon', 'generator-rule', 2, 'core', null, 'exact', '{"skillType":"shopping","maxItems":2}'::jsonb, true),
    ('qt-fin2-goal-mixed', 'skill-fin2-goal', 'qs-local-generator', 'fin2-goal-mixed', 'Dat muc tieu tiet kiem', 'generator-rule', 2, 'mixed', null, 'exact', '{"skillType":"saving-goal","maxValue":50000}'::jsonb, true),
    ('qt-fin2-saving-mixed', 'skill-fin2-saving', 'qs-local-generator', 'fin2-saving-mixed', 'Heo dat tap tiet kiem', 'generator-rule', 2, 'mixed', null, 'exact', '{"skillType":"saving","maxValue":50000}'::jsonb, true),
    ('qt-fin2-shopping-challenge', 'skill-fin2-shopping-math', 'qs-local-generator', 'fin2-shopping-challenge', 'Di cho thong minh', 'generator-rule', 3, 'challenge', null, 'exact', '{"skillType":"shopping-math","exactComparisonOnly":true}'::jsonb, true)
on conflict (id) do update set
    question_source_id = excluded.question_source_id,
    code = excluded.code,
    title = excluded.title,
    template_kind = excluded.template_kind,
    difficulty_level = excluded.difficulty_level,
    stage = excluded.stage,
    prompt_template = excluded.prompt_template,
    answer_strategy = excluded.answer_strategy,
    metadata = excluded.metadata,
    is_active = excluded.is_active,
    updated_at = now();
commit;
