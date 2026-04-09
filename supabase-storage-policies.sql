-- Run this AFTER creating the "note-files" bucket via the Dashboard UI
-- (Storage > New Bucket > name: "note-files" > Private > Create)

-- Drop old policies if they exist
do $$ begin
  drop policy if exists "Users upload own files" on storage.objects;
  drop policy if exists "Users view own files" on storage.objects;
  drop policy if exists "Users update own files" on storage.objects;
  drop policy if exists "Users delete own files" on storage.objects;
end $$;

-- INSERT: users can upload files into their own folder (userId/noteId/filename)
create policy "Users upload own files" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'note-files'
    and (string_to_array(name, '/'))[1] = auth.uid()::text
  );

-- SELECT: users can view/download their own files
create policy "Users view own files" on storage.objects
  for select to authenticated using (
    bucket_id = 'note-files'
    and (string_to_array(name, '/'))[1] = auth.uid()::text
  );

-- UPDATE: needed for some upload operations
create policy "Users update own files" on storage.objects
  for update to authenticated using (
    bucket_id = 'note-files'
    and (string_to_array(name, '/'))[1] = auth.uid()::text
  );

-- DELETE: users can remove their own files
create policy "Users delete own files" on storage.objects
  for delete to authenticated using (
    bucket_id = 'note-files'
    and (string_to_array(name, '/'))[1] = auth.uid()::text
  );
