-- ============================================================
-- Purchases table + receipt storage
-- Run this in the Supabase SQL editor AFTER 001_initial_schema.sql
-- ============================================================

create table purchases (
  id                   uuid primary key default uuid_generate_v4(),
  name                 text not null,
  purchase_date        date not null,
  amount               numeric(12,2) not null,
  currency             text not null default 'USD',
  description          text,
  vendor               text,
  category             text,
  assigned_to          text,
  warranty_id          text,
  warranty_expires     date,
  receipt_url          text,
  warranty_receipt_url text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create trigger purchases_updated_at
  before update on purchases for each row execute function update_updated_at();

alter table purchases enable row level security;

create policy "Authenticated can read purchases"
  on purchases for select using (auth.role() = 'authenticated');

create policy "Finance admin and super admin can insert purchases"
  on purchases for insert with check (get_user_role() in ('super_admin', 'finance_admin'));

create policy "Finance admin and super admin can update purchases"
  on purchases for update using (get_user_role() in ('super_admin', 'finance_admin'));

create policy "Super admin can delete purchases"
  on purchases for delete using (get_user_role() = 'super_admin');

-- ============================================================
-- Storage bucket for receipt images
-- ============================================================

insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', true)
on conflict (id) do nothing;

create policy "Authenticated can view receipts"
  on storage.objects for select
  using (bucket_id = 'receipts' and auth.role() = 'authenticated');

create policy "Finance admin and super admin can upload receipts"
  on storage.objects for insert
  with check (bucket_id = 'receipts' and get_user_role() in ('super_admin', 'finance_admin'));

create policy "Super admin can delete receipt files"
  on storage.objects for delete
  using (bucket_id = 'receipts' and get_user_role() = 'super_admin');
