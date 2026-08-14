import { NextResponse } from "next/server";
import { adminDb, checkPassword } from "../../../lib/db";

export const dynamic = "force-dynamic";

function authed(req: Request) {
  return checkPassword(req.headers.get("x-admin-key"));
}

export async function GET(req: Request) {
  if (!authed(req)) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const db = adminDb();
  if (!db) return NextResponse.json({ rentals: [], waitlist: [] });
  const { data, error } = await db
    .from("rentals")
    .select("*")
    .order("start_date", { ascending: true })
    .limit(1000);
  if (error) return NextResponse.json({ rentals: [], waitlist: [], warn: "Tablo yok mu? supabase-kiralama.sql çalıştır." });
  // Bekleme listesi (tablo yoksa sessizce boş).
  let waitlist: unknown[] = [];
  const wl = await db
    .from("waitlist")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (!wl.error) waitlist = wl.data || [];
  return NextResponse.json({ rentals: data || [], waitlist });
}

export async function POST(req: Request) {
  if (!authed(req)) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const db = adminDb();
  if (!db) return NextResponse.json({ error: "Sistem müsait değil" }, { status: 503 });
  const id = String(body.id || "");
  if (!id) return NextResponse.json({ error: "id gerekli" }, { status: 400 });
  try {
    switch (body.action) {
      case "confirm": {
        const { error } = await db.from("rentals").update({ status: "confirmed" }).eq("id", id);
        if (error) throw error;
        break;
      }
      case "cancel": {
        const { error } = await db.from("rentals").update({ status: "cancelled" }).eq("id", id);
        if (error) throw error;
        break;
      }
      case "pending": {
        const { error } = await db.from("rentals").update({ status: "pending" }).eq("id", id);
        if (error) throw error;
        break;
      }
      case "delete": {
        const { error } = await db.from("rentals").delete().eq("id", id);
        if (error) throw error;
        break;
      }
      case "wl_notified": {
        const { error } = await db.from("waitlist").update({ status: "notified" }).eq("id", id);
        if (error) throw error;
        break;
      }
      case "wl_waiting": {
        const { error } = await db.from("waitlist").update({ status: "waiting" }).eq("id", id);
        if (error) throw error;
        break;
      }
      case "wl_delete": {
        const { error } = await db.from("waitlist").delete().eq("id", id);
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
