import { NextResponse } from "next/server";
import { adminDb, checkPassword } from "../../../lib/db";

export const dynamic = "force-dynamic";

function authed(req: Request) {
  return checkPassword(req.headers.get("x-admin-key"));
}

export async function GET(req: Request) {
  if (!authed(req)) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const db = adminDb();
  const [{ data: announcements }, { data: messages }] = await Promise.all([
    db.from("announcements").select("*").order("sort", { ascending: true }).order("created_at", { ascending: false }),
    db.from("messages").select("*").order("created_at", { ascending: false }).limit(500),
  ]);
  return NextResponse.json({ announcements: announcements || [], messages: messages || [] });
}

export async function POST(req: Request) {
  if (!authed(req)) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const db = adminDb();
  try {
    switch (body.action) {
      case "create": {
        const { error } = await db.from("announcements").insert({
          title: String(body.title || "").slice(0, 200),
          body: String(body.body || "").slice(0, 3000),
          is_active: true,
          sort: Number(body.sort) || 0,
        });
        if (error) throw error;
        break;
      }
      case "update": {
        const { error } = await db
          .from("announcements")
          .update({
            title: String(body.title || "").slice(0, 200),
            body: String(body.body || "").slice(0, 3000),
            is_active: !!body.is_active,
            sort: Number(body.sort) || 0,
          })
          .eq("id", body.id);
        if (error) throw error;
        break;
      }
      case "delete": {
        const { error } = await db.from("announcements").delete().eq("id", body.id);
        if (error) throw error;
        break;
      }
      case "delete_message": {
        const { error } = await db.from("messages").delete().eq("id", body.id);
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
