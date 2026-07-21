import { NextResponse } from "next/server";
import { adminDb, checkPassword } from "../../../lib/db";
import { URUNLER, urunById } from "../../../lib/urunler";

export const dynamic = "force-dynamic";

function authed(req: Request) {
  return checkPassword(req.headers.get("x-admin-key"));
}

function posInt(v: unknown) {
  const n = Math.round(Number(v));
  return Number.isFinite(n) && n > 0 ? n : 0;
}
function posNum(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
}
function tarih(v: unknown) {
  return v ? { tarih: String(v).slice(0, 10) } : {};
}

export async function GET(req: Request) {
  if (!authed(req)) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const db = adminDb();
  const { data: hareket } = await db
    .from("hareket")
    .select("*")
    .order("tarih", { ascending: false })
    .order("created_at", { ascending: false });
  return NextResponse.json({ urunler: URUNLER, hareket: hareket || [] });
}

export async function POST(req: Request) {
  if (!authed(req)) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const db = adminDb();
  try {
    switch (b.action) {
      // ---- ALIM: "şu üründen X aldım" → borç ekle (adet × alış) ----
      case "alim": {
        const u = urunById(String(b.urun_id));
        const adet = posInt(b.adet);
        if (!u || !adet) return NextResponse.json({ error: "Ürün / adet geçersiz" }, { status: 400 });
        const { error } = await db.from("hareket").insert({
          tur: "alim",
          urun_id: u.id,
          urun_ad: u.ad,
          adet,
          tutar: +(u.alis * adet).toFixed(2),
          not_alani: b.not_alani ? String(b.not_alani).slice(0, 300) : null,
          ...tarih(b.tarih),
        });
        if (error) throw error;
        break;
      }
      // ---- SATIŞ: "X sattım" → net kâr (adet × kâr) ----
      case "satis": {
        const u = urunById(String(b.urun_id));
        const adet = posInt(b.adet);
        if (!u || !adet) return NextResponse.json({ error: "Ürün / adet geçersiz" }, { status: 400 });
        const { error } = await db.from("hareket").insert({
          tur: "satis",
          urun_id: u.id,
          urun_ad: u.ad,
          adet,
          tutar: +(u.kar * adet).toFixed(2),
          not_alani: b.not_alani ? String(b.not_alani).slice(0, 300) : null,
          ...tarih(b.tarih),
        });
        if (error) throw error;
        break;
      }
      // ---- ÖDEME: "Hakan'a X ödedim" → borçtan düş ----
      case "odeme": {
        const tutar = posNum(b.tutar);
        if (!tutar) return NextResponse.json({ error: "Tutar geçersiz" }, { status: 400 });
        const { error } = await db.from("hareket").insert({
          tur: "odeme",
          tutar,
          kisi: b.kisi ? String(b.kisi).slice(0, 120) : "Hakan",
          not_alani: b.not_alani ? String(b.not_alani).slice(0, 300) : null,
          ...tarih(b.tarih),
        });
        if (error) throw error;
        break;
      }
      case "delete": {
        const { error } = await db.from("hareket").delete().eq("id", b.id);
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
