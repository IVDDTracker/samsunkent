-- ============================================================
-- Büyük Ekran Kiralama — rezervasyon tablosu
-- Supabase SQL Editor'de bir kez çalıştır.
-- Tüm erişim /api/kiralama üzerinden (service_role) yapılır;
-- doğrudan public erişim RLS ile kapalıdır.
-- ============================================================

create table if not exists public.rentals (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  items text[] not null,                       -- {'ps5','proj','perde'}
  start_date date not null,
  days int not null check (days between 1 and 60),
  end_date date not null,
  customer_name text,
  customer_phone text not null,
  total int,                                   -- tahmini tutar (TL)
  payment text,                                -- 'kapida-nakit' | 'kapida-kart'
  note text,
  status text not null default 'pending'
    check (status in ('pending','confirmed','cancelled'))
);

create index if not exists rentals_dates_idx  on public.rentals (start_date, end_date);
create index if not exists rentals_status_idx on public.rentals (status);

alter table public.rentals enable row level security;
-- Not: Public policy YOK → doğrudan anon erişim kapalı.
-- Rezervasyon oluşturma ve okuma yalnızca sunucu tarafı API (service_role) ile.
