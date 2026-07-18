import { NextResponse } from "next/server";
import { adminDb } from "../../../lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const phone = String(body.phone || "").trim();
    const message = String(body.message || "").trim();
    const source = String(body.source || "").trim().slice(0, 200);
    const hp = String(body.hp || "");

    // Honeypot: bot doldurursa sessizce başarı dön, kaydetme.
    if (hp) return NextResponse.json({ ok: true });

    if (!phone || phone.length < 7 || phone.length > 30) {
      return NextResponse.json({ error: "Geçerli bir telefon numarası gir." }, { status: 400 });
    }

    const db = adminDb();
    const { error } = await db.from("messages").insert({
      phone: phone.slice(0, 30),
      message: message ? message.slice(0, 2000) : null,
      source: source || null,
    });
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Gönderilemedi, biraz sonra tekrar dene." }, { status: 500 });
  }
}
