-- 新用户注册时自动创建家庭并成为 owner
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  new_family_id uuid;
begin
  insert into families (name, created_by)
  values ('我的家庭', new.id)
  returning id into new_family_id;

  insert into family_members (family_id, user_id, role, status)
  values (new_family_id, new.id, 'owner', 'active');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
