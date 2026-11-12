insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('sas-public-media','sas-public-media',true,10485760,array['image/jpeg','image/png','image/webp','image/avif']::text[])
on conflict (id) do nothing;

do $$
declare v_public boolean; v_limit bigint; v_mimes text[];
begin
  select b.public,b.file_size_limit,b.allowed_mime_types into v_public,v_limit,v_mimes
  from storage.buckets b where b.id='sas-public-media';
  if not found then raise exception 'sas-public-media bucket was not created'; end if;
  if v_public is distinct from true or v_limit is distinct from 10485760
     or not (v_mimes @> array['image/jpeg','image/png','image/webp','image/avif']::text[]) then
    raise exception 'Existing sas-public-media bucket settings do not match the approved design';
  end if;
end;
$$;

create policy sas_public_media_staff_list on storage.objects for select to authenticated
using (bucket_id='sas-public-media' and private.has_any_role(array['admin','editor','author']));
create policy sas_public_media_staff_upload on storage.objects for insert to authenticated
with check (bucket_id='sas-public-media' and private.has_any_role(array['admin','editor','author']));
create policy sas_public_media_admin_update on storage.objects for update to authenticated
using (bucket_id='sas-public-media' and private.has_any_role(array['admin']))
with check (bucket_id='sas-public-media' and private.has_any_role(array['admin']));
create policy sas_public_media_admin_delete on storage.objects for delete to authenticated
using (bucket_id='sas-public-media' and private.has_any_role(array['admin']));
