import { NextResponse } from "next/server";
import { adminDb, checkPassword } from "../../../lib/db";

export const dynamic = "force-dynamic";

function authed(req: Request) {
  return checkPassword(req.headers.get("x-admin-key"));
}

function slugify(s: string): string {
  const map: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", İ: "i" };
  return (s || "")
    .replace(/[çğıöşüİ]/g, (c) => map[c] || c)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

// FAQ/howto dizilerini güvenli normalize et
function cleanFaq(v: unknown): { q: string; a: string }[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((r) => ({ q: String((r as Record<string, unknown>)?.q || "").trim().slice(0, 300), a: String((r as Record<string, unknown>)?.a || "").trim().slice(0, 1000) }))
    .filter((r) => r.q && r.a)
    .slice(0, 12);
}
function cleanHowto(v: unknown): { title: string; body: string }[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((r) => ({ title: String((r as Record<string, unknown>)?.title || "").trim().slice(0, 160), body: String((r as Record<string, unknown>)?.body || "").trim().slice(0, 600) }))
    .filter((r) => r.title && r.body)
    .slice(0, 10);
}

export async function GET(req: Request) {
  if (!authed(req)) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const db = adminDb();
  const { data } = await db.from("services").select("*").order("sort");
  return NextResponse.json({ services: data || [] });
}

export async function POST(req: Request) {
  if (!authed(req)) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const db = adminDb();

  try {
    if (body.action === "delete") {
      const { error } = await db.from("services").delete().eq("id", body.id);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (body.action === "save") {
      const name = String(body.name || "").trim();
      if (!name) return NextResponse.json({ error: "İsim zorunlu" }, { status: 400 });

      const fields = {
        name: name.slice(0, 120),
        slug: (body.slug ? slugify(String(body.slug)) : slugify(name)) || slugify(name + "-" + Date.now()),
        group: body.group ? String(body.group).trim().slice(0, 60) : null,
        intro: String(body.intro || "").trim().slice(0, 600),
        h1: body.h1 ? String(body.h1).trim().slice(0, 160) : null,
        meta_title: body.meta_title ? String(body.meta_title).trim().slice(0, 200) : null,
        meta_desc: body.meta_desc ? String(body.meta_desc).trim().slice(0, 320) : null,
        district_relevant: body.district_relevant === true,
        faq: cleanFaq(body.faq),
        howto: cleanHowto(body.howto),
        sort: Number.isFinite(body.sort) ? Number(body.sort) : 0,
        active: body.active !== false,
      };

      if (body.id) {
        const { error } = await db.from("services").update(fields).eq("id", body.id);
        if (error) throw error;
      } else {
        const { error } = await db.from("services").insert(fields);
        if (error) throw error;
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Bilinmeyen işlem" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "İşlem başarısız (slug benzersiz olmalı)" }, { status: 500 });
  }
}
