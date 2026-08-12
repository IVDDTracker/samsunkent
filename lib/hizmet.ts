import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Hizmet rehberi veri katmanı.
// Guarded client: env yoksa null döner (build/dev çökmez, sayfa boş durumu render eder).

let _client: SupabaseClient | null | undefined;
export function publicDb(): SupabaseClient | null {
  if (_client !== undefined) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  _client = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  return _client;
}
export const hizmetConfigured = () =>
  !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// ----- Tipler ----------------------------------------------
export interface FaqItem { q: string; a: string; }
export interface HowtoItem { title: string; body: string; }

export interface Service {
  id: string;
  slug: string;
  name: string;
  group: string | null;
  intro: string;
  h1: string | null;
  meta_title: string | null;
  meta_desc: string | null;
  district_relevant: boolean;
  faq: FaqItem[];
  howto: HowtoItem[];
  sort: number;
  active: boolean;
}

export interface District { id: string; slug: string; name: string; sort: number; }

export interface Business {
  id: string;
  slug: string;
  name: string;
  phone: string | null;
  whatsapp: string | null;
  website: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  description: string | null;
  verified: boolean;
  status: string;
  tier: string;
  hours: Record<string, string> | null;
  gallery: string[];
  updated_at: string;
}

// İşletme + ilişkileri (kart ve profil için)
export interface BusinessFull extends Business {
  services: { id: string; slug: string; name: string }[];
  districts: { id: string; slug: string; name: string }[];
  sponsored: boolean; // bu hizmet bağlamında sponsorlu mu
}

// ----- Sorgular --------------------------------------------
export async function getService(slug: string): Promise<Service | null> {
  const db = publicDb();
  if (!db) return null;
  try {
    const { data } = await db.from("services").select("*").eq("slug", slug).eq("active", true).single();
    return data ? normalizeService(data) : null;
  } catch {
    return null;
  }
}

export async function getActiveServices(): Promise<Service[]> {
  const db = publicDb();
  if (!db) return [];
  try {
    const { data } = await db.from("services").select("*").eq("active", true).order("sort");
    return (data || []).map(normalizeService);
  } catch {
    return [];
  }
}

export async function getDistricts(): Promise<District[]> {
  const db = publicDb();
  if (!db) return [];
  try {
    const { data } = await db.from("districts").select("*").order("sort");
    return (data as District[]) || [];
  } catch {
    return [];
  }
}

// Bir hizmete ait YAYINDAKİ işletmeler + ilişkileri + sponsorluk bayrağı.
export async function getBusinessesForService(service: Service): Promise<BusinessFull[]> {
  const db = publicDb();
  if (!db) return [];
  try {
    const { data: links } = await db
      .from("business_services")
      .select("business_id")
      .eq("service_id", service.id);
    const ids = (links || []).map((l: { business_id: string }) => l.business_id);
    if (ids.length === 0) return [];

    const { data: rows } = await db
      .from("businesses")
      .select("*")
      .in("id", ids)
      .eq("status", "published");
    const businesses = (rows || []) as Business[];
    if (businesses.length === 0) return [];

    const bizIds = businesses.map((b) => b.id);
    const [{ data: svcLinks }, { data: distLinks }, { data: spons }] = await Promise.all([
      db.from("business_services").select("business_id, services(id,slug,name)").in("business_id", bizIds),
      db.from("business_districts").select("business_id, districts(id,slug,name)").in("business_id", bizIds),
      db.from("sponsorships").select("business_id").eq("service_id", service.id).eq("active", true),
    ]);

    const sponSet = new Set((spons || []).map((s: { business_id: string }) => s.business_id));
    const svcMap = groupRel(svcLinks, "services");
    const distMap = groupRel(distLinks, "districts");

    return businesses.map((b) => ({
      ...b,
      gallery: Array.isArray(b.gallery) ? b.gallery : [],
      services: svcMap[b.id] || [],
      districts: distMap[b.id] || [],
      sponsored: sponSet.has(b.id),
    }));
  } catch {
    return [];
  }
}

export async function getBusiness(slug: string): Promise<BusinessFull | null> {
  const db = publicDb();
  if (!db) return null;
  try {
    const { data: b } = await db.from("businesses").select("*").eq("slug", slug).eq("status", "published").single();
    if (!b) return null;
    const [{ data: svcLinks }, { data: distLinks }] = await Promise.all([
      db.from("business_services").select("business_id, services(id,slug,name)").eq("business_id", b.id),
      db.from("business_districts").select("business_id, districts(id,slug,name)").eq("business_id", b.id),
    ]);
    return {
      ...(b as Business),
      gallery: Array.isArray(b.gallery) ? b.gallery : [],
      services: (groupRel(svcLinks, "services")[b.id]) || [],
      districts: (groupRel(distLinks, "districts")[b.id]) || [],
      sponsored: false,
    };
  } catch {
    return null;
  }
}

// generateStaticParams için — env yoksa boş (dynamicParams devreye girer).
export async function getServiceSlugs(): Promise<string[]> {
  return (await getActiveServices()).map((s) => s.slug);
}
export async function getPublishedBusinessSlugs(): Promise<string[]> {
  const db = publicDb();
  if (!db) return [];
  try {
    const { data } = await db.from("businesses").select("slug").eq("status", "published");
    return (data || []).map((r: { slug: string }) => r.slug);
  } catch {
    return [];
  }
}

// ============================================================
// İNDEKSLENEBİLİRLİK KAPISI
// >=3 işletme TEK BAŞINA yetmez: minimum supply VE unique user value BİRLİKTE.
// ============================================================
export function serviceIsIndexable(service: Service, businessCount: number): boolean {
  const minSupply = businessCount >= 3;
  const uniqueValue =
    (service.intro?.trim().length ?? 0) >= 120 ||
    (Array.isArray(service.faq) && service.faq.length >= 2) ||
    (Array.isArray(service.howto) && service.howto.length >= 1);
  return minSupply && uniqueValue;
}

// ============================================================
// ORGANİK SIRALAMA
// SADECE kullanıcı-yararı sinyalleri: verification, completeness, freshness.
// (relevance & location filtreleme ile sağlanır.) tier/ödeme HİÇ kullanılmaz.
// Sponsorlu işletmeler bu listede DEĞİL — ayrı blokta gösterilir.
// ============================================================
export function completenessScore(b: BusinessFull): number {
  let s = 0;
  if (b.phone) s += 2;
  if (b.whatsapp) s += 2;
  if (b.website) s += 1;
  if (b.description && b.description.trim().length >= 40) s += 2;
  if (b.hours && Object.keys(b.hours).length > 0) s += 1;
  if (b.gallery.length > 0) s += 1;
  if (b.services.length > 0) s += 1;
  if (b.districts.length > 0) s += 1;
  return s; // 0..11
}

export function organicRank(businesses: BusinessFull[]): BusinessFull[] {
  const now = Date.now();
  const freshness = (b: BusinessFull) => {
    const days = (now - new Date(b.updated_at).getTime()) / 86_400_000;
    if (days <= 30) return 3;
    if (days <= 90) return 2;
    if (days <= 180) return 1;
    return 0;
  };
  const score = (b: BusinessFull) =>
    (b.verified ? 5 : 0) + completenessScore(b) + freshness(b);
  return [...businesses].sort((a, b) => score(b) - score(a));
}

// Sponsorlu / organik ayrımı — sayfa iki bloğu ayrı render eder.
export function splitSponsored(businesses: BusinessFull[]) {
  const sponsored = businesses.filter((b) => b.sponsored);
  const organic = organicRank(businesses.filter((b) => !b.sponsored));
  return { sponsored, organic };
}

// ----- yardımcılar -----------------------------------------
function normalizeService(d: Record<string, unknown>): Service {
  return {
    ...(d as unknown as Service),
    intro: (d.intro as string) || "",
    faq: Array.isArray(d.faq) ? (d.faq as FaqItem[]) : [],
    howto: Array.isArray(d.howto) ? (d.howto as HowtoItem[]) : [],
  };
}

type RelRow = { business_id: string } & Record<string, unknown>;
function groupRel(rows: RelRow[] | null, key: string): Record<string, { id: string; slug: string; name: string }[]> {
  const out: Record<string, { id: string; slug: string; name: string }[]> = {};
  for (const r of rows || []) {
    const rel = r[key] as { id: string; slug: string; name: string } | null;
    if (!rel) continue;
    (out[r.business_id] ||= []).push(rel);
  }
  return out;
}
