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
      // ---- ALIM: ürün + adet → borç (KDV dahil alış × adet), stok artar ----
      case "alim": {
        const u = urunById(String(b.urun_id));
        const adet = posInt(b.adet);
        if (!u || !adet) return NextResponse.json({ error: "Ürün / adet geçersiz" }, { status: 400 });
        const { error } = await db.from("hareket").insert({
          tur: "alim",
          urun_id: u.id,
          urun_ad: u.ad,
          adet,
          birim_fiyat: u.alis,
          tutar: +(u.alis * adet).toFixed(2),
        });
        if (error) throw error;
        break;
      }
      // ---- SATIŞ: ürün + adet + KDV dahil satış fiyatı → gelir, stoktan düşer ----
      case "satis": {
        const u = urunById(String(b.urun_id));
        const adet = posInt(b.adet);
        const fiyat = posNum(b.fiyat);
        if (!u || !adet || !fiyat) return NextResponse.json({ error: "Ürün / adet / fiyat geçersiz" }, { status: 400 });
        const { error } = await db.from("hareket").insert({
          tur: "satis",
          urun_id: u.id,
          urun_ad: u.ad,
          adet,
          birim_fiyat: fiyat,
          tutar: +(fiyat * adet).toFixed(2),
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
