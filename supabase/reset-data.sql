-- StudyHub: wipe all study data, keep the schema and your login account.
-- Run in Supabase Dashboard > SQL Editor > New Query.
--
-- WARNING: this is irreversible. Every assignment, exam, note, task,
-- schedule event and subject is deleted, for every user in the project.
-- Your auth account and the table structure are left untouched.

truncate table
  note_files,
  notes,
  assignments,
  exams,
  tasks,
  schedule_events,
  subjects
cascade;

-- Uploaded note attachments live in Storage, not in these tables. Removing the
-- rows below makes them unreachable from the app; to also delete the underlying
-- files, empty the "note-files" bucket from Dashboard > Storage.
delete from storage.objects where bucket_id = 'note-files';

-- On the next sign-in the app re-seeds DEFAULT_SUBJECTS from src/constants.js,
-- which is empty by default -- so expect to add your courses again with
-- "+ Course" unless you have filled that list in.
