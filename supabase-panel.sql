-- ============================================================
-- PATRON PANELİ — stok + borç/alacak defteri
-- Supabase SQL Editor'de bir kere çalıştır.
-- Bu tablolar DIŞARI KAPALI: RLS açık, hiçbir public policy yok.
-- Yalnızca service_role (sunucu API'si) okur/yazar. Finansal veri güvende.
-- ============================================================

-- ---- STOK ----
create table if not exists public.stok (
  id           uuid primary key default gen_random_uuid(),
  ad           text not null,
  maliyet      numeric(12,2) not null default 0,   -- birim maliyet (senin alışın)
  satis_fiyati numeric(12,2) not null default 0,   -- birim satış fiyatı
  adet         integer not null default 0,          -- eldeki stok adedi
  platform     text,                                -- Hepsiburada / ikas / vb. (opsiyonel)
  not_alani    text,                                -- serbest not
  sort         integer not null default 0,
  created_at   timestamptz not null default now()
);

-- ---- BORÇ / ALACAK DEFTERİ ----
-- tur: 'borc'  = benim borcum (ör. Hakan'a)
--      'alacak' = benim alacağım (ör. Hepsiburada'dan)
create table if not exists public.hesap (
  id         uuid primary key default gen_random_uuid(),
  tur        text not null default 'borc',          -- 'borc' | 'alacak'
  kisi       text,                                   -- Hakan, Hepsiburada, ...
  tutar      numeric(12,2) not null default 0,
  aciklama   text,
  durum      text not null default 'bekliyor',       -- 'bekliyor' | 'odendi'
  tarih      date not null default current_date,
  created_at timestamptz not null default now()
);

-- RLS aç, POLICY EKLEME (anon erişemez; service_role zaten baypas eder)
alter table public.stok  enable row level security;
alter table public.hesap enable row level security;
