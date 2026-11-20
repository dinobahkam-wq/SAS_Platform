import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {test} from "node:test";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const migration=read("supabase/migrations/20261120170000_platform_owner_members.sql");
const actions=read("src/app/admin/team/actions.ts");
const owner=read("src/lib/platform-owner.ts");
const admin=read("src/lib/supabase/team-admin.ts");
const form=read("src/components/admin-team-forms.tsx");
const page=read("src/app/admin/team/page.tsx");
const shell=read("src/components/admin-shell.tsx");
const layout=read("src/app/admin/layout.tsx");
const invite=read("src/app/auth/accept-invite/page.tsx");

test("owner bootstrap requires exactly one active admin and a protected immutable ownership record",()=>{
  assert.match(migration,/count\(\*\) from public\.user_roles where role='admin' and is_active/);
  assert.match(migration,/private\.platform_owner/);
  assert.match(migration,/user_id uuid not null unique references auth\.users/);
  assert.match(migration,/protect_platform_owner_role/);
  assert.match(migration,/on public\.user_roles/);
  assert.match(migration,/revoke all on private\.platform_owner from public, anon, authenticated/);
});

test("admin members cannot grant or revoke roles directly through old broad RLS",()=>{
  assert.match(migration,/drop policy if exists user_roles_admin_insert/);
  assert.match(migration,/drop policy if exists user_roles_admin_update/);
  assert.match(migration,/drop policy if exists user_roles_admin_delete/);
  for(const verb of ["insert","update","delete"])assert.match(migration,new RegExp("create policy user_roles_owner_"+verb));
  assert.match(migration,/public\.is_platform_owner\(\)/);
  assert.match(migration,/revoke execute on function public\.is_platform_owner\(\) from public, anon/);
});

test("server actions check unique owner and never expose service keys to browser",()=>{
  assert.match(owner,/await admin\.supabase\.rpc\("is_platform_owner"\)/);
  assert.match(actions,/await requirePlatformOwner\(\)/);
  assert.match(page,/await requirePlatformOwner\(\)/);
  assert.match(admin,/import "server-only"/);
  assert.match(admin,/process\.env\.SUPABASE_SERVICE_ROLE_KEY/);
  assert.doesNotMatch(admin,/NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(actions,/auth\.admin\.inviteUserByEmail/);
  assert.match(actions,/role:"admin",is_active:true/);
  assert.match(actions,/memberId===userId/);
});

test("only owner gets member-management navigation; invited members get the existing admin role",()=>{
  assert.match(layout,/is_platform_owner/);
  assert.match(shell,/user\.isOwner \?/);
  assert.match(shell,/href="\/admin\/team"/);
  assert.match(page,/InviteTeamForm/);
  assert.match(page,/MemberStatusForm/);
  assert.match(form,/useActionState/);
  assert.match(invite,/auth\.updateUser\(\{password\}\)/);
  assert.match(invite,/password\.length<12/);
});
