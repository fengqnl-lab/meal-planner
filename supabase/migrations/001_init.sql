-- ============================================================
-- 家庭
-- ============================================================
create table families (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 家庭成员
-- ============================================================
create table family_members (
  id           uuid primary key default gen_random_uuid(),
  family_id    uuid not null references families(id) on delete cascade,
  user_id      uuid references auth.users(id) on delete cascade,
  invite_email text,
  role         text not null default 'member' check (role in ('owner', 'member')),
  status       text not null default 'active' check (status in ('active', 'pending')),
  joined_at    timestamptz not null default now(),
  unique (family_id, user_id)
);

-- ============================================================
-- 菜谱
-- ============================================================
create table recipes (
  id          uuid primary key default gen_random_uuid(),
  family_id   uuid not null references families(id) on delete cascade,
  name        text not null,
  description text,
  ingredients jsonb not null default '[]',  -- [{name, amount, unit}]
  steps       jsonb not null default '[]',  -- [{order, content}]
  tags        text[] not null default '{}',
  image_url   text,
  created_by  uuid not null references auth.users(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- updated_at 自动更新
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger recipes_updated_at
  before update on recipes
  for each row execute function set_updated_at();

-- ============================================================
-- 菜单规划
-- ============================================================
create table menu_plans (
  id         uuid primary key default gen_random_uuid(),
  family_id  uuid not null references families(id) on delete cascade,
  date       date not null,
  meal_type  text not null check (meal_type in ('lunch', 'dinner')),
  recipe_id  uuid references recipes(id) on delete set null,
  note       text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique (family_id, date, meal_type)
);

-- ============================================================
-- 搜索索引
-- ============================================================
create index recipes_family_id_idx on recipes(family_id);
create index recipes_tags_idx on recipes using gin(tags);
create index menu_plans_family_date_idx on menu_plans(family_id, date);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table families       enable row level security;
alter table family_members enable row level security;
alter table recipes        enable row level security;
alter table menu_plans     enable row level security;

-- 辅助函数：当前用户所属的 family_id
create or replace function my_family_id()
returns uuid language sql security definer stable as $$
  select family_id from family_members
  where user_id = auth.uid() and status = 'active'
  limit 1;
$$;

-- families：只能看/改自己家庭
create policy "families_select" on families for select
  using (id = my_family_id());

create policy "families_insert" on families for insert
  with check (created_by = auth.uid());

create policy "families_update" on families for update
  using (created_by = auth.uid());

-- family_members：同家庭成员可查；owner 可插入邀请
create policy "members_select" on family_members for select
  using (family_id = my_family_id());

create policy "members_insert" on family_members for insert
  with check (
    family_id = my_family_id()
    and exists (
      select 1 from family_members
      where family_id = my_family_id()
        and user_id = auth.uid()
        and role = 'owner'
    )
  );

create policy "members_delete" on family_members for delete
  using (
    family_id = my_family_id()
    and exists (
      select 1 from family_members
      where family_id = my_family_id()
        and user_id = auth.uid()
        and role = 'owner'
    )
  );

-- recipes：同家庭可读；创建者可改删
create policy "recipes_select" on recipes for select
  using (family_id = my_family_id());

create policy "recipes_insert" on recipes for insert
  with check (family_id = my_family_id() and created_by = auth.uid());

create policy "recipes_update" on recipes for update
  using (family_id = my_family_id() and created_by = auth.uid());

create policy "recipes_delete" on recipes for delete
  using (family_id = my_family_id() and created_by = auth.uid());

-- menu_plans：同家庭可读写
create policy "menu_select" on menu_plans for select
  using (family_id = my_family_id());

create policy "menu_insert" on menu_plans for insert
  with check (family_id = my_family_id() and created_by = auth.uid());

create policy "menu_update" on menu_plans for update
  using (family_id = my_family_id());

create policy "menu_delete" on menu_plans for delete
  using (family_id = my_family_id());
