-- SamsunKent — Pano veritabanı şeması
-- Supabase → SQL Editor'e yapıştırıp "Run" de.

-- 1) Duyuru notları (admin panelinden yönetilir)
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text default '',
  is_active boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

-- 2) Formdan gelen mesajlar (telefon + mesaj) — gizli
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  message text,
  source text,
  created_at timestamptz not null default now()
);

-- RLS (satır güvenliği) aç
alter table public.announcements enable row level security;
alter table public.messages enable row level security;

-- Public site YALNIZCA aktif duyuruları okuyabilir
grant select on public.announcements to anon, authenticated;
drop policy if exists "public read active announcements" on public.announcements;
create policy "public read active announcements"
  on public.announcements for select
  using (is_active = true);

-- messages: anon'a HİÇBİR yetki yok.
-- RLS açık + policy yok => anon tüm işlemlerde engellenir.
-- Mesajlar yalnızca sunucudaki service_role (admin API) tarafından okunur/yazılır.

-- Başlangıç için örnek bir duyuru
insert into public.announcements (title, body, sort) values
  ('25 iş ortağı kuaför aranıyor',
   'Dermalys dermokozmetik için Samsun''dan 25 salon alıyoruz. Kazançlı ortaklık, sınırlı kontenjan. İlgileniyorsan telefonunu bırak — arayayım.',
   0);
