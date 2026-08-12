-- ============================================================
-- SAMSUNKENT — HİZMET REHBERİ (yerel hizmet keşif katmanı)
-- Supabase → SQL Editor'e yapıştırıp bir kere "Run" de.
-- Mevcut RLS modelinin uzantısı: public YALNIZCA yayında/aktif veriyi okur,
-- tüm yazımlar + contact_events sunucudaki service_role ile yapılır.
-- ============================================================

-- ----- HİZMETLER (kategori) --------------------------------
create table if not exists public.services (
  id                uuid primary key default gen_random_uuid(),
  slug              text unique not null,          -- /hizmetler/evden-eve-nakliyat
  name              text not null,
  "group"           text,                          -- Ev & Tamir, Otomotiv… (yalnız nav etiketi)
  intro             text default '',               -- 2-3 cümle gerçek giriş
  h1                text,
  meta_title        text,
  meta_desc         text,
  district_relevant boolean not null default false,-- ilçe sayfaları anlamlı mı?
  faq               jsonb  default '[]'::jsonb,     -- [{q,a}] — gerçek, elle yazılır
  howto             jsonb  default '[]'::jsonb,     -- [{title,body}] nasıl seçilir / süreç
  sort              int    not null default 0,
  active            boolean not null default true,
  created_at        timestamptz not null default now()
);

-- ----- İLÇELER ---------------------------------------------
create table if not exists public.districts (
  id    uuid primary key default gen_random_uuid(),
  slug  text unique not null,
  name  text not null,
  sort  int  not null default 0
);

-- ----- İŞLETMELER ------------------------------------------
-- ÖNEMLİ: verified ve tier BİRBİRİNDEN BAĞIMSIZ iki eksendir.
--   verified = Samsunkent'in kimlik/faaliyet teyidi. SATIN ALINAMAZ.
--   tier     = profil zenginliği (free|premium). Premium ✓ rozeti VERMEZ,
--              ve organik sıralamada FAKTÖR DEĞİLDİR.
create table if not exists public.businesses (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,               -- /firma/[slug]
  name        text not null,
  phone       text,
  whatsapp    text,
  website     text,
  address     text,
  lat         double precision,
  lng         double precision,
  description text,
  verified    boolean not null default false,     -- Samsunkent teyidi (para ile gelmez)
  status      text    not null default 'draft',    -- 'draft' | 'published'
  tier        text    not null default 'free',     -- 'free' | 'premium' (✓ ile İLGİSİZ)
  hours       jsonb,                                -- güvenilir çalışma saatleri (varsa)
  gallery     jsonb   default '[]'::jsonb,          -- premium galeri
  updated_at  timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

-- ----- M:N — işletme ↔ hizmet ------------------------------
create table if not exists public.business_services (
  business_id uuid references public.businesses(id) on delete cascade,
  service_id  uuid references public.services(id)   on delete cascade,
  primary key (business_id, service_id)
);

-- ----- M:N — işletme ↔ hizmet verdiği ilçe -----------------
create table if not exists public.business_districts (
  business_id uuid references public.businesses(id) on delete cascade,
  district_id uuid references public.districts(id)  on delete cascade,
  primary key (business_id, district_id)
);

-- ----- SPONSORLUK ------------------------------------------
-- Sponsorlu sonuçlar AYRI ve açık "Sponsorlu" etiketli blokta gösterilir.
-- Organik sıralamayı ETKİLEMEZ.
create table if not exists public.sponsorships (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  service_id  uuid references public.services(id)   on delete set null,
  district_id uuid references public.districts(id)  on delete set null,
  starts      date not null default current_date,
  ends        date,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ----- TEMAS AKSİYONLARI (contact_events) ------------------
-- Ölçtüğümüz TEK şey temas aksiyonudur — "lead" / "müşteri" İDDİASI YOK.
-- Dışa kapalı: RLS açık, public policy yok. Yalnız service_role (sunucu /api/track) yazar.
create table if not exists public.contact_events (
  id            uuid primary key default gen_random_uuid(),
  business_id   uuid,
  service_id    uuid,
  district      text,
  landing_page  text,
  position      int,
  sponsored     boolean not null default false,
  event_type    text not null,   -- business_impression | business_profile_view |
                                  -- phone_click | whatsapp_click | directions_click | website_click
  session_hash  text,
  created_at    timestamptz not null default now()
);

-- ----- İNDEKSLER -------------------------------------------
create index if not exists idx_businesses_status       on public.businesses(status);
create index if not exists idx_bsvc_service             on public.business_services(service_id);
create index if not exists idx_bdist_district           on public.business_districts(district_id);
create index if not exists idx_sponsor_active           on public.sponsorships(active);
create index if not exists idx_contact_biz_time         on public.contact_events(business_id, created_at);
create index if not exists idx_contact_type_time        on public.contact_events(event_type, created_at);

-- ============================================================
-- RLS (satır güvenliği)
-- ============================================================
alter table public.services           enable row level security;
alter table public.districts          enable row level security;
alter table public.businesses         enable row level security;
alter table public.business_services  enable row level security;
alter table public.business_districts enable row level security;
alter table public.sponsorships       enable row level security;
alter table public.contact_events     enable row level security;

grant select on public.services, public.districts, public.businesses,
               public.business_services, public.business_districts, public.sponsorships
  to anon, authenticated;

-- Public yalnız AKTİF hizmetleri görür
drop policy if exists "read active services" on public.services;
create policy "read active services" on public.services
  for select using (active = true);

-- İlçeler herkese açık (faktüel veri)
drop policy if exists "read districts" on public.districts;
create policy "read districts" on public.districts for select using (true);

-- Public yalnız YAYINDAKİ işletmeleri görür
drop policy if exists "read published businesses" on public.businesses;
create policy "read published businesses" on public.businesses
  for select using (status = 'published');

-- Bağlantı (join) tabloları: yalnız id çiftleri, okunması zararsız
drop policy if exists "read business_services" on public.business_services;
create policy "read business_services" on public.business_services for select using (true);
drop policy if exists "read business_districts" on public.business_districts;
create policy "read business_districts" on public.business_districts for select using (true);

-- Sponsorluk: yalnız aktif kayıtlar
drop policy if exists "read active sponsorships" on public.sponsorships;
create policy "read active sponsorships" on public.sponsorships
  for select using (active = true);

-- contact_events: policy YOK → anon tüm işlemlerde engellidir.
-- Yalnız sunucudaki service_role (RLS baypas) yazar/okur.

-- ============================================================
-- BAŞLANGIÇ VERİSİ — yalnız faktüel/gerçek (uydurma işletme YOK)
-- ============================================================

-- Samsun ilçeleri (faktüel)
insert into public.districts (slug, name, sort) values
  ('atakum',     'Atakum',     0),
  ('ilkadim',    'İlkadım',    1),
  ('canik',      'Canik',      2),
  ('tekkekoy',   'Tekkeköy',   3),
  ('bafra',      'Bafra',      4),
  ('carsamba',   'Çarşamba',   5),
  ('terme',      'Terme',      6),
  ('vezirkopru', 'Vezirköprü', 7)
on conflict (slug) do nothing;

-- Pilot hizmet: Evden Eve Nakliyat (gerçek, faydalı içerik)
insert into public.services (slug, name, "group", intro, h1, meta_title, meta_desc, district_relevant, faq, howto, sort)
values (
  'evden-eve-nakliyat',
  'Evden Eve Nakliyat',
  'Nakliyat',
  'Samsun''da güvenilir nakliyatçıları senin için topladık. İlçene göre süz, doğrudan ara ya da WhatsApp''tan yaz.',
  'Samsun Evden Eve Nakliyat Firmaları',
  'Samsun Evden Eve Nakliyat Firmaları | Güvenilir & Yakın',
  'Samsun''da evden eve nakliyat firmaları: ilçene göre süz, doğrula, telefon veya WhatsApp ile hemen iletişime geç. Samsunkent yerel rehberi.',
  true,
  '[
    {"q":"Evden eve nakliyat fiyatları neye göre değişir?","a":"Eşya miktarı, kat/asansör durumu, mesafe ve paketleme hizmeti fiyatı belirler. Samsunkent fiyat uydurmaz — teklifi doğrudan firmadan al."},
    {"q":"\"Doğrulandı\" rozeti ne demek?","a":"Samsunkent ekibinin firmanın iletişim ve faaliyet bilgisini teyit ettiği anlamına gelir. Bir tavsiye veya kalite garantisi değildir."},
    {"q":"Şehirlerarası taşınma için de uygun mu?","a":"\"Şehirlerarası\" etiketli firmalar Samsun dışına taşıma yapar. Filtreden bu türü seçerek listeyi daraltabilirsin."}
  ]'::jsonb,
  '[
    {"title":"En az iki firmadan keşif iste","body":"Taşınma tarihinden önce yerinde keşif, en doğru fiyatı verir. Telefonda net fiyat veren firmaya temkinli yaklaş."},
    {"title":"Sigortalı taşıma olduğunu sor","body":"Eşyaların hasara karşı güvence altında olup olmadığını önceden netleştir."},
    {"title":"Asansör gerekiyorsa önceden belirt","body":"Yüksek kat ve dar merdivenlerde asansörlü taşıma hem hızlı hem güvenli olur."}
  ]'::jsonb,
  0
)
on conflict (slug) do nothing;

-- İşletmeler: BOŞ. Yalnız gerçek, teyit edilmiş firmalar panelden eklenecek.
