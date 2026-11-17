-- Add approval timestamp (date/time) without disrupting existing data.
-- Safe to run multiple times (IF NOT EXISTS). Existing rows remain unchanged.

alter table public.registrations
  add column if not exists approved_at timestamptz;

alter table public.archived_registrations
  add column if not exists approved_at timestamptz;

-- Optional backfill: use archived_at as best proxy for previously approved archived records.
update public.archived_registrations
set approved_at = archived_at
where invitation_status = 'Approved'
  and approved_at is null;

-- Optional indexes for filtering/sorting by approval time.
create index if not exists idx_registrations_approved_at
  on public.registrations (approved_at);

create index if not exists idx_archived_registrations_approved_at
  on public.archived_registrations (approved_at);
