import { NextResponse } from "next/server";
import { adminDb, checkPassword } from "../../../lib/db";

export const dynamic = "force-dynamic";

function authed(req: Request) {
  return checkPassword(req.headers.get("x-admin-key"));
}

// Türkçe-güvenli slug
function slugify(s: string): string {
  const map: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", İ: "i" };
  return (s || "")
    .replace(/[çğıöşüİ]/g, (c) => map[c] || c)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

export async function GET(req: Request) {
  if (!authed(req)) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const db = adminDb();
  const [{ data: businesses }, { data: bs }, { data: bd }, { data: sp }, { data: services }, { data: districts }] =
    await Promise.all([
      db.from("businesses").select("*").order("updated_at", { ascending: false }),
      db.from("business_services").select("business_id, service_id"),
      db.from("business_districts").select("business_id, district_id"),
      db.from("sponsorships").select("business_id, service_id").eq("active", true),
      db.from("services").select("id, name, slug").order("sort"),
      db.from("districts").select("id, name, slug").order("sort"),
    ]);

  const byBiz = (rows: { business_id: string }[] | null, key: string) => {
    const m: Record<string, string[]> = {};
    for (const r of rows || []) (m[r.business_id] ||= []).push((r as Record<string, string>)[key]);
    return m;
  };
  const svcMap = byBiz(bs, "service_id");
  const distMap = byBiz(bd, "district_id");
  const sponMap = byBiz(sp, "service_id");

  const withRel = (businesses || []).map((b: { id: string }) => ({
    ...b,
    serviceIds: svcMap[b.id] || [],
    districtIds: distMap[b.id] || [],
    sponsoredServiceIds: sponMap[b.id] || [],
  }));

  return NextResponse.json({ businesses: withRel, services: services || [], districts: districts || [] });
}

export async function POST(req: Request) {
  if (!authed(req)) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const db = adminDb();

  try {
    if (body.action === "delete") {
      const { error } = await db.from("businesses").delete().eq("id", body.id);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (body.action === "save") {
      const name = String(body.name || "").trim();
      if (!name) return NextResponse.json({ error: "İsim zorunlu" }, { status: 400 });

      const fields = {
        name: name.slice(0, 160),
        slug: (body.slug ? slugify(String(body.slug)) : slugify(name)) || slugify(name + "-" + Date.now()),
        phone: str(body.phone, 30),
        whatsapp: str(body.whatsapp, 30),
        website: str(body.website, 200),
        address: str(body.address, 300),
        description: str(body.description, 2000),
        verified: body.verified === true,
        status: body.status === "published" ? "published" : "draft",
        tier: body.tier === "premium" ? "premium" : "free",
        updated_at: new Date().toISOString(),
      };

      let bizId = body.id as string | undefined;
      if (bizId) {
        const { error } = await db.from("businesses").update(fields).eq("id", bizId);
        if (error) throw error;
      } else {
        const { data, error } = await db.from("businesses").insert(fields).select("id").single();
        if (error) throw error;
        bizId = data.id;
      }

      const serviceIds: string[] = Array.isArray(body.serviceIds) ? body.serviceIds : [];
      const districtIds: string[] = Array.isArray(body.districtIds) ? body.districtIds : [];
      const sponsoredServiceIds: string[] = Array.isArray(body.sponsoredServiceIds) ? body.sponsoredServiceIds : [];

      // İlişkileri sıfırla ve yeniden kur
      await db.from("business_services").delete().eq("business_id", bizId);
      await db.from("business_districts").delete().eq("business_id", bizId);
      await db.from("sponsorships").delete().eq("business_id", bizId);

      if (serviceIds.length)
        await db.from("business_services").insert(serviceIds.map((service_id) => ({ business_id: bizId, service_id })));
      if (districtIds.length)
        await db.from("business_districts").insert(districtIds.map((district_id) => ({ business_id: bizId, district_id })));
      // Sponsorluk yalnız seçilen hizmetler içinden (ve gerçekten seçili hizmetse)
      const sponValid = sponsoredServiceIds.filter((s) => serviceIds.includes(s));
      if (sponValid.length)
        await db.from("sponsorships").insert(sponValid.map((service_id) => ({ business_id: bizId, service_id, active: true })));

      return NextResponse.json({ ok: true, id: bizId });
    }

    return NextResponse.json({ error: "Bilinmeyen işlem" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "İşlem başarısız" }, { status: 500 });
  }
}

function str(v: unknown, max: number): string | null {
  const s = String(v || "").trim();
  return s ? s.slice(0, max) : null;
}
