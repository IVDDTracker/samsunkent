import { NextResponse } from "next/server";
import { adminDb } from "../../../lib/db";

export const dynamic = "force-dynamic";

const ITEMS = ["ps5", "proj", "perde"];
const LABELS: Record<string, string> = {
  ps5: "PS5",
  proj: "Projeksiyon",
  perde: "Perde",
};

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
    /* bildirim başarısız olsa da rezervasyon kaydedildi */
  }
}

function addDays(iso: string, n: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}));
    const items: string[] = Array.isArray(b.items)
      ? b.items.filter((x: unknown) => typeof x === "string" && ITEMS.includes(x))
      : [];
    const start = String(b.start_date || "");
    const days = Math.round(Number(b.days));
    const phone = String(b.customer_phone || "").trim();
    const name = String(b.customer_name || "").trim().slice(0, 80);
    const total = Math.round(Number(b.total)) || null;
    const payment = ["kapida-nakit", "kapida-kart"].includes(b.payment)
      ? b.payment
      : null;
    const note = String(b.note || "").slice(0, 500);
    const hp = String(b.hp || "");

    if (hp) return NextResponse.json({ ok: true }); // honeypot
    if (!items.length)
      return NextResponse.json({ error: "En az bir ürün seç." }, { status: 400 });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(start))
      return NextResponse.json({ error: "Tarih geçersiz." }, { status: 400 });
    if (!(days >= 1 && days <= 60))
      return NextResponse.json({ error: "Gün sayısı geçersiz." }, { status: 400 });
    if (phone.length < 7 || phone.length > 30)
      return NextResponse.json({ error: "Geçerli bir telefon gir." }, { status: 400 });

    const end = addDays(start, days - 1);
    const db = adminDb();
    if (!db)
      return NextResponse.json({ error: "Sistem şu an müsait değil." }, { status: 503 });

    // Çakışma kontrolü: tarih aralığı örtüşen + aynı üründen içeren aktif rezervasyon
    const { data: existing, error: qErr } = await db
      .from("rentals")
      .select("items,start_date,end_date")
      .in("status", ["pending", "confirmed"])
      .lte("start_date", end)
      .gte("end_date", start);
    if (qErr) throw qErr;

    const clash = (existing || []).some((r: { items: string[] }) =>
      (r.items || []).some((it) => items.includes(it)),
    );
    if (clash)
      return NextResponse.json(
        { error: "Seçtiğin günlerde bu ürün(ler) dolu. Lütfen başka tarih seç." },
        { status: 409 },
      );

    const { error } = await db.from("rentals").insert({
      items,
      start_date: start,
      days,
      end_date: end,
      customer_name: name || null,
      customer_phone: phone.slice(0, 30),
      total,
      payment,
      note: note || null,
    });
    if (error) throw error;

    await notifyTelegram(
      `🎮 Yeni KİRALAMA rezervasyonu\n\n` +
        `• Ürün: ${items.map((i) => LABELS[i]).join(", ")}\n` +
        `• Tarih: ${start} (${days} gün, bitiş ${end})\n` +
        `• Tutar: ${total ? "₺" + total.toLocaleString("tr-TR") : "—"}\n` +
        `• Ödeme: ${payment === "kapida-kart" ? "Kapıda kart" : "Kapıda nakit"}\n` +
        `• Ad: ${name || "—"}\n` +
        `• Tel: ${phone}\n\n` +
        `Teyit için müşteriyi ara. (sk-yonetim panelinden onayla)`,
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Bir hata oldu, tekrar dene." }, { status: 500 });
  }
}
