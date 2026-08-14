-- ============================================================
-- Büyük Ekran Kiralama — BEKLEME LİSTESİ (dolu gün talebi)
-- Supabase SQL Editor'de bir kez çalıştır.
-- Dolu bir güne talip olan müşteri telefonunu bırakır:
--   • İptal olursa aranır, boşluk anında dolar.
--   • Kaçan talep ölçülür → 2. set kararının verisi.
-- Tüm erişim /api üzerinden (service_role); public erişim RLS ile kapalı.
-- ============================================================

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  items text[] not null,                       -- {'ps5','proj','perde'}
  start_date date not null,
  days int,
  customer_name text,
  customer_phone text not null,
  note text,
  status text not null default 'waiting'
    check (status in ('waiting','notified','done'))
);

create index if not exists waitlist_date_idx   on public.waitlist (start_date);
create index if not exists waitlist_status_idx on public.waitlist (status);

alter table public.waitlist enable row level security;
-- Public policy YOK → doğrudan anon erişim kapalı; yalnızca sunucu API (service_role).
