-- ============================================================
-- PATRON PANELİ — hareket defteri (alım / satış / ödeme)
-- Supabase SQL Editor'de bir kere çalıştır.
-- Bu tablo DIŞARI KAPALI: RLS açık, public policy yok.
-- Yalnızca service_role (sunucu API'si) okur/yazar.
-- ============================================================

create table if not exists public.hareket (
  id         uuid primary key default gen_random_uuid(),
  tur        text not null,                 -- 'alim' | 'satis' | 'odeme'
  urun_id    text,                          -- katalog id (alım/satış için)
  urun_ad    text,                          -- görüntü için anlık kopya
  adet       integer not null default 0,    -- alım/satış adedi
  tutar      numeric(12,2) not null default 0, -- alim: eklenen borç · satis: net kâr · odeme: ödenen tutar
  kisi       text,                          -- ödeme için (ör. Hakan)
  not_alani  text,
  tarih      date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.hareket enable row level security;

-- Not: Önceki denemeden 'stok' / 'hesap' tabloların kaldıysa sorun değil,
-- boş dururlar. İstersen şunlarla silebilirsin:
--   drop table if exists public.stok;
--   drop table if exists public.hesap;
