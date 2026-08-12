import { NextResponse } from "next/server";
import { adminDb } from "../../../lib/db";

export const dynamic = "force-dynamic";

// TEMAS AKSİYONU kaydı — "lead"/"müşteri" İDDİASI YOK, ölçülen tıklamadır.
const ALLOWED = new Set([
  "business_impression",
  "business_profile_view",
  "phone_click",
  "whatsapp_click",
  "directions_click",
  "website_click",
]);

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const event_type = String(body.event_type || "");
    if (!ALLOWED.has(event_type)) {
      return NextResponse.json({ error: "geçersiz event" }, { status: 400 });
    }

    // Env yoksa sessizce başarı dön (site tracking olmadan da çalışır).
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ ok: true });
    }

    const db = adminDb();
    await db.from("contact_events").insert({
      business_id: body.business_id || null,
      service_id: body.service_id || null,
      district: body.district ? String(body.district).slice(0, 80) : null,
      landing_page: body.landing_page ? String(body.landing_page).slice(0, 200) : null,
      position: Number.isFinite(body.position) ? Number(body.position) : null,
      sponsored: body.sponsored === true,
      event_type,
      session_hash: body.session_hash ? String(body.session_hash).slice(0, 64) : null,
    });

    return NextResponse.json({ ok: true });
  } catch {
    // Tracking asla kullanıcı akışını bozmaz.
    return NextResponse.json({ ok: true });
  }
}
