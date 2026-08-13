import { NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb, checkPassword } from "../../../lib/db";

export const dynamic = "force-dynamic";

const LABELS: Record<string, string> = { ps5: "PS5", proj: "Projeksiyon", perde: "Perde" };

/**
 * Webhook doğrulama secret'ı.
 * Elle TELEGRAM_WEBHOOK_SECRET tanımlıysa onu kullanır; değilse bot token'dan
 * deterministik türetir (ekstra env gerekmez). Hem register hem doğrulama
 * aynı değeri ürettiği için uyumlu çalışır.
 */
function webhookSecret(): string | null {
  const explicit = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (explicit) return explicit;
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return null;
  return "wh" + crypto.createHash("sha256").update(token).digest("hex").slice(0, 48);
}

async function tg(method: string, body: Record<string, unknown>) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return null;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return await res.json().catch(() => null);
  } catch {
    return null;
  }
}

/**
 * Telegram webhook alıcısı.
 * Rezervasyon bildirimindeki "✅ Onayla / ❌ Reddet" butonlarına basılınca
 * Telegram buraya callback_query gönderir; ilgili rezervasyonun durumunu günceller.
 * Güvenlik: Telegram'ın secret_token header'ı doğrulanır + chat_id eşleşmesi aranır.
 */
export async function POST(req: Request) {
  const secret = webhookSecret();
  // Secret üretilemiyorsa (token yok) webhook'u aç bırakma.
  if (!secret) return NextResponse.json({ ok: true });
  if (req.headers.get("x-telegram-bot-api-secret-token") !== secret) {
    return NextResponse.json({ ok: true }); // sessizce yut, 200 dön
  }

  const update = await req.json().catch(() => ({}));
  const cq = update.callback_query;
  if (!cq) return NextResponse.json({ ok: true });

  // Yalnızca yetkili sohbetten gelen aksiyonu kabul et.
  const allowedChat = process.env.TELEGRAM_CHAT_ID;
  const chatId = cq.message?.chat?.id;
  if (allowedChat && String(chatId) !== String(allowedChat)) {
    await tg("answerCallbackQuery", { callback_query_id: cq.id, text: "Yetkisiz." });
    return NextResponse.json({ ok: true });
  }

  const data: string = String(cq.data || "");
  const [op, id] = data.split(":");
  if ((op !== "c" && op !== "x") || !id) {
    await tg("answerCallbackQuery", { callback_query_id: cq.id });
    return NextResponse.json({ ok: true });
  }

  let statusText = "";
  try {
    const db = adminDb();
    const newStatus = op === "c" ? "confirmed" : "cancelled";
    const { data: row, error } = await db
      .from("rentals")
      .update({ status: newStatus })
      .eq("id", id)
      .select("items,start_date,end_date,days,customer_phone,status")
      .single();
    if (error || !row) throw error || new Error("bulunamadı");
    statusText = op === "c" ? "✅ ONAYLANDI" : "❌ REDDEDİLDİ";

    // Toast bildirim
    await tg("answerCallbackQuery", {
      callback_query_id: cq.id,
      text: op === "c" ? "Onaylandı ✅" : "Reddedildi ❌",
    });

    // Mesajı güncelle: durumu ekle, butonları kaldır (tekrar basılamasın)
    const origText = cq.message?.text || "Rezervasyon";
    const summary =
      `\n\n${statusText}` +
      (op === "c"
        ? `\n${row.items.map((i: string) => LABELS[i] || i).join(", ")} · ${row.start_date} (${row.days} gün) dolu olarak işaretlendi.`
        : `\n${row.start_date}–${row.end_date} tekrar müsait.`);
    await tg("editMessageText", {
      chat_id: chatId,
      message_id: cq.message?.message_id,
      text: origText + summary,
      reply_markup: { inline_keyboard: [] },
    });
  } catch {
    await tg("answerCallbackQuery", { callback_query_id: cq.id, text: "İşlem başarısız — panelden dene." });
  }

  return NextResponse.json({ ok: true });
}

/**
 * Kurulum yardımcıları (admin parolası gerekir):
 *   /api/telegram?action=register&key=PAROLA  → webhook'u kaydeder
 *   /api/telegram?action=info&key=PAROLA       → mevcut webhook durumunu gösterir
 *   /api/telegram?action=delete&key=PAROLA     → webhook'u siler
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const action = url.searchParams.get("action") || "info";
  const key = url.searchParams.get("key") || req.headers.get("x-admin-key");
  if (!checkPassword(key)) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const secret = webhookSecret();
  if (!token) return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN eksik." }, { status: 400 });

  if (action === "register") {
    if (!secret) return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN eksik." }, { status: 400 });
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
    const hookUrl = `https://${host}/api/telegram`;
    const r = await tg("setWebhook", {
      url: hookUrl,
      secret_token: secret,
      allowed_updates: ["callback_query"],
      drop_pending_updates: true,
    });
    return NextResponse.json({ registered: hookUrl, telegram: r });
  }
  if (action === "delete") {
    const r = await tg("deleteWebhook", { drop_pending_updates: true });
    return NextResponse.json({ deleted: true, telegram: r });
  }
  // info
  const r = await tg("getWebhookInfo", {});
  return NextResponse.json({ telegram: r });
}
