-- AfriFacts, in its own schema.
--
-- Run this once in the Supabase SQL editor. It is idempotent: every
-- statement is `if not exists` or `or replace`, so re-running it after an
-- edit is safe and will not touch data.
--
-- WHY A SCHEMA AND NOT `public`
--
-- This project is shared with other work. Nine tables called `sources`,
-- `images` and `reviews` dropped into `public` are ambiguous the day
-- something else needs those names. A schema also lets rights be granted
-- once, here, rather than per table forever.
--
-- After running this you MUST expose the schema to the API:
--   Dashboard -> Settings -> API -> Exposed schemas -> add `afrifacts`
-- Until you do, every query returns "relation does not exist", which
-- reads like a typo rather than a setting.

create schema if not exists afrifacts;

-- =====================================================================
-- WHAT THE APP READS
-- =====================================================================

/*
  One row per fact, shaped exactly like the `Fact` type in
  afrifacts/src/types/fact.ts.

  deep_dive, source and image stay as jsonb rather than being flattened
  into columns. That is deliberate: the app's data layer is one file, and
  a row that already matches the type it renders means the phase-2 swap
  changes a query and nothing else. Flattening would buy queryability the
  app never uses and cost a mapping layer nobody wants to maintain.

  `image` is null for a fact with no photograph — a designed value, not a
  gap. The typographic card is a real variant.
*/
create table if not exists afrifacts.facts (
  id            text primary key,
  country       text        not null,
  category      text        not null,
  fact          text        not null,
  deep_dive     jsonb       not null,
  source        jsonb       not null,
  image         jsonb,
  fact_number   integer     not null,
  related_ids   text[]      not null default '{}',
  -- Approved, and passing the validator. The app filters on this, so a
  -- fact can be pulled from the feed without deleting anything.
  published     boolean     not null default false,
  updated_at    timestamptz not null default now()
);

create index if not exists facts_country_category_idx
  on afrifacts.facts (country, category) where published;

/*
  Quiz questions. Three per fact.

  The two checks are here rather than only in JavaScript because a
  malformed question is not a bad row, it is a crash on the quiz screen:
  the app indexes options by correct_index and renders exactly four
  buttons.
*/
create table if not exists afrifacts.quiz_questions (
  id            text primary key,
  fact_id       text     not null references afrifacts.facts(id) on delete cascade,
  question      text     not null,
  options       text[]   not null check (array_length(options, 1) = 4),
  correct_index smallint not null check (correct_index between 0 and 3),
  explanation   text     not null
);

create index if not exists quiz_fact_idx on afrifacts.quiz_questions (fact_id);

-- =====================================================================
-- WHAT ONLY THE STUDIO TOUCHES
--
-- None of the below is readable by the app. The anon role gets no
-- policy on these tables, and a table with RLS on and no policy returns
-- nothing to everyone except service_role, which bypasses RLS entirely.
-- =====================================================================

/*
  The evidence. One row per source, because a fact may rest on several
  and §7 says a press or reference source cannot carry one alone.

  `passage` is the verbatim quote the fact was extracted from. No
  passage, no fact — that rule is the reason this table exists rather
  than a `source_url` column on facts.
*/
create table if not exists afrifacts.fact_sources (
  fact_id    text     not null references afrifacts.facts(id) on delete cascade,
  ordinal    smallint not null,
  citation   text     not null,
  short_name text,
  -- 'peer-reviewed' | 'institutional' | 'press' | 'reference'
  tier       text     not null,
  -- A DOI, an ISBN and page, an enwiki revision, or a content hash. A
  -- URL alone is not enough: a dead link is indistinguishable from no
  -- source.
  locator    jsonb,
  passage    text     not null,
  primary key (fact_id, ordinal)
);

create table if not exists afrifacts.provenance (
  fact_id       text primary key references afrifacts.facts(id) on delete cascade,
  -- 'pipeline' or 'hand'
  origin        text not null,
  -- prior probability / specificity / explicability, each 1-5
  surprise      jsonb,
  -- volatile or settled, and when to look again
  decay         jsonb,
  -- lineage back to the candidate this fact was made from
  candidate_key text,
  created_at    timestamptz
);

create table if not exists afrifacts.reviews (
  fact_id     text primary key,
  status      text not null,
  reviewer    text,
  reviewed_at timestamptz
);

create table if not exists afrifacts.images (
  fact_id    text primary key references afrifacts.facts(id) on delete cascade,
  file       text not null,
  status     text not null,
  reasoning  text,
  decided_by text,
  decided_at date,
  refused    jsonb
);

/*
  Every image ever offered, with its licence and credit.

  This is the only record of who owns a picture and under what terms.
  Losing it turns a published photo card into a licence breach rather
  than a rerun, which is why it lives in data/ locally and here rather
  than being treated as regenerable.
*/
create table if not exists afrifacts.image_candidates (
  file            text primary key,
  url             text not null,
  description_url text,
  width           integer,
  height          integer,
  license         text,
  license_id      text,
  artist          text,
  description     text,
  via             text,
  thumbnail       text
);

/*
  The seed list. Chosen by hand — §7: automate extraction from chosen
  sources, never automate the choosing.
*/
create table if not exists afrifacts.sources (
  slug   text primary key,
  kind   text not null,
  title  text,
  url    text,
  tier   text,
  -- What the reviewer was looking for when they added it, fed into the
  -- extraction prompt.
  wanted text
);

/*
  What has been mined, at which revision, by which model.

  Not reproducible: deleting it costs a full re-run at full price,
  because an unchanged document is skipped only if this says it was
  already done.
*/
create table if not exists afrifacts.ledger (
  slug        text not null,
  stage       text not null,
  revision_id text,
  model       text,
  candidates  integer,
  rejected    integer,
  at          timestamptz,
  primary key (slug, stage)
);

-- =====================================================================
-- ACCESS
-- =====================================================================

alter table afrifacts.facts            enable row level security;
alter table afrifacts.quiz_questions   enable row level security;
alter table afrifacts.fact_sources     enable row level security;
alter table afrifacts.provenance       enable row level security;
alter table afrifacts.reviews          enable row level security;
alter table afrifacts.images           enable row level security;
alter table afrifacts.image_candidates enable row level security;
alter table afrifacts.sources          enable row level security;
alter table afrifacts.ledger           enable row level security;

grant usage on schema afrifacts to anon, authenticated;

-- The app reads two tables and nothing else. Not even a select grant
-- exists on the rest, so a mistake in a policy cannot expose a passage.
grant select on afrifacts.facts, afrifacts.quiz_questions to anon, authenticated;

/*
  The writer.

  service_role bypasses Row Level Security, which is not the same thing
  as having privileges — it still needs an ordinary grant, and Postgres
  refuses with "permission denied for schema" without one. Supabase
  grants this automatically for `public` and not for a schema you create
  yourself, so leaving it out is the natural mistake: the schema is
  exposed, the key is right, and every request is still a 403.

  The `alter default privileges` lines are what stop this recurring. A
  table added to this schema later would otherwise arrive ungranted and
  fail exactly the same way, long after anyone remembers why.
*/
grant usage on schema afrifacts to service_role;
grant all privileges on all tables in schema afrifacts to service_role;
grant all privileges on all sequences in schema afrifacts to service_role;
alter default privileges in schema afrifacts grant all on tables to service_role;
alter default privileges in schema afrifacts grant all on sequences to service_role;

drop policy if exists "read published facts" on afrifacts.facts;
create policy "read published facts"
  on afrifacts.facts for select
  to anon, authenticated
  using (published);

/*
  A question is readable only if its fact is.

  Without the subquery, pulling a fact from the feed by setting
  published = false would leave its three questions answerable — and a
  quiz question carries the fact in its explanation.
*/
drop policy if exists "read quiz for published facts" on afrifacts.quiz_questions;
create policy "read quiz for published facts"
  on afrifacts.quiz_questions for select
  to anon, authenticated
  using (
    exists (
      select 1 from afrifacts.facts f
      where f.id = quiz_questions.fact_id and f.published
    )
  );
