import { NextResponse } from "next/server";
import { adminDb } from "../../../../lib/db";

export const dynamic = "force-dynamic";

const ITEMS = ["ps5", "proj", "perde"];
const LABELS: Record<string, string> = { ps5: "PS5", proj: "Projeksiyon", perde: "Perde" };

async function notifyTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text }),
    });
  } catch {
    /* bildirim başarısız olsa da kayıt tutuldu */
  }
}

/** Dolu bir güne talip olan müşteriyi bekleme listesine ekler. */
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}));
    const items: string[] = Array.isArray(b.items)
      ? b.items.filter((x: unknown) => typeof x === "string" && ITEMS.includes(x))
      : [];
    const start = String(b.start_date || "");
    const days = Math.round(Number(b.days)) || null;
    const phone = String(b.customer_phone || "").trim();
    const name = String(b.customer_name || "").trim().slice(0, 80);
    const hp = String(b.hp || "");

    if (hp) return NextResponse.json({ ok: true }); // honeypot
    if (!items.length)
      return NextResponse.json({ error: "En az bir ürün seç." }, { status: 400 });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(start))
      return NextResponse.json({ error: "Tarih geçersiz." }, { status: 400 });
    if (phone.length < 7 || phone.length > 30)
      return NextResponse.json({ error: "Geçerli bir telefon gir." }, { status: 400 });

    const db = adminDb();
    if (!db)
      return NextResponse.json({ error: "Sistem şu an müsait değil." }, { status: 503 });

    const { error } = await db.from("waitlist").insert({
      items,
      start_date: start,
      days: days && days >= 1 && days <= 60 ? days : null,
      customer_name: name || null,
      customer_phone: phone.slice(0, 30),
    });
    if (error) throw error;

    await notifyTelegram(
      `🔖 BEKLEME LİSTESİ — dolu güne talep\n\n` +
        `• Ürün: ${items.map((i) => LABELS[i]).join(", ")}\n` +
        `• İstenen tarih: ${start}${days ? ` (${days} gün)` : ""}\n` +
        `• Ad: ${name || "—"}\n` +
        `• Tel: ${phone}\n\n` +
        `İptal olursa bu kişiyi ara. (sk-yonetim → Kiralamalar → Bekleme)`,
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Bir hata oldu, tekrar dene." }, { status: 500 });
  }
}
