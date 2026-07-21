import { NextResponse } from "next/server";
import { adminDb, checkPassword } from "../../../lib/db";

export const dynamic = "force-dynamic";

function authed(req: Request) {
  return checkPassword(req.headers.get("x-admin-key"));
}

function num(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export async function GET(req: Request) {
  if (!authed(req)) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const db = adminDb();
  const [{ data: stok }, { data: hesap }] = await Promise.all([
    db.from("stok").select("*").order("sort", { ascending: true }).order("created_at", { ascending: false }),
    db.from("hesap").select("*").order("durum", { ascending: true }).order("tarih", { ascending: false }),
  ]);
  return NextResponse.json({ stok: stok || [], hesap: hesap || [] });
}

export async function POST(req: Request) {
  if (!authed(req)) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const db = adminDb();
  try {
    switch (b.action) {
      // ---- STOK ----
      case "stok_create": {
        const { error } = await db.from("stok").insert({
          ad: String(b.ad || "").slice(0, 200),
          maliyet: num(b.maliyet),
          satis_fiyati: num(b.satis_fiyati),
          adet: Math.round(num(b.adet)),
          platform: b.platform ? String(b.platform).slice(0, 100) : null,
          not_alani: b.not_alani ? String(b.not_alani).slice(0, 500) : null,
          sort: Math.round(num(b.sort)),
        });
        if (error) throw error;
        break;
      }
      case "stok_update": {
        const { error } = await db
          .from("stok")
          .update({
            ad: String(b.ad || "").slice(0, 200),
            maliyet: num(b.maliyet),
            satis_fiyati: num(b.satis_fiyati),
            adet: Math.round(num(b.adet)),
            platform: b.platform ? String(b.platform).slice(0, 100) : null,
            not_alani: b.not_alani ? String(b.not_alani).slice(0, 500) : null,
            sort: Math.round(num(b.sort)),
          })
          .eq("id", b.id);
        if (error) throw error;
        break;
      }
      case "stok_delete": {
        const { error } = await db.from("stok").delete().eq("id", b.id);
        if (error) throw error;
        break;
      }
      // ---- HESAP (borç / alacak) ----
      case "hesap_create": {
        const { error } = await db.from("hesap").insert({
          tur: b.tur === "alacak" ? "alacak" : "borc",
          kisi: b.kisi ? String(b.kisi).slice(0, 120) : null,
          tutar: num(b.tutar),
          aciklama: b.aciklama ? String(b.aciklama).slice(0, 500) : null,
          durum: b.durum === "odendi" ? "odendi" : "bekliyor",
          ...(b.tarih ? { tarih: String(b.tarih).slice(0, 10) } : {}),
        });
        if (error) throw error;
        break;
      }
      case "hesap_update": {
        const { error } = await db
          .from("hesap")
          .update({
            tur: b.tur === "alacak" ? "alacak" : "borc",
            kisi: b.kisi ? String(b.kisi).slice(0, 120) : null,
            tutar: num(b.tutar),
            aciklama: b.aciklama ? String(b.aciklama).slice(0, 500) : null,
            durum: b.durum === "odendi" ? "odendi" : "bekliyor",
            ...(b.tarih ? { tarih: String(b.tarih).slice(0, 10) } : {}),
          })
          .eq("id", b.id);
        if (error) throw error;
        break;
      }
      case "hesap_toggle": {
        const { error } = await db
          .from("hesap")
          .update({ durum: b.durum === "odendi" ? "odendi" : "bekliyor" })
          .eq("id", b.id);
        if (error) throw error;
        break;
      }
      case "hesap_delete": {
        const { error } = await db.from("hesap").delete().eq("id", b.id);
        if (error) throw error;
        break;
      }
      default:
        return NextResponse.json({ error: "Bilinmeyen işlem" }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "İşlem başarısız" }, { status: 500 });
  }
}
