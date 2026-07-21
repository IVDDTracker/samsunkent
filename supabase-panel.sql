-- ============================================================
-- PATRON PANELİ — hareket defteri (alım / satış)
-- Supabase SQL Editor'de bir kere çalıştır.
-- DIŞARI KAPALI: RLS açık, public policy yok. Sadece service_role okur/yazar.
-- ============================================================

create table if not exists public.hareket (
  id          uuid primary key default gen_random_uuid(),
  tur         text not null,                    -- 'alim' | 'satis'
  urun_id     text,
  urun_ad     text,
  adet        integer not null default 0,
  birim_fiyat numeric(12,2) not null default 0, -- alım: KDV dahil alış · satış: girilen KDV dahil satış fiyatı
  tutar       numeric(12,2) not null default 0, -- birim_fiyat × adet
  tarih       date not null default current_date,
  created_at  timestamptz not null default now()
);

alter table public.hareket enable row level security;

-- Önceki denemelerden stok/hesap tabloların kaldıysa zararsız, boş dururlar.
-- İstersen: drop table if exists public.stok; drop table if exists public.hesap;
