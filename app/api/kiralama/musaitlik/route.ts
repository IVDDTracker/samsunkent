import { NextResponse } from "next/server";
import { adminDb } from "../../../../lib/db";

export const dynamic = "force-dynamic";

/**
 * Aktif (pending/confirmed) rezervasyonlardan, bugünden itibaren dolu olan
 * günleri ürün bazında döner. Takvim bu bilgiyle dolu günleri kapatır.
 *
 * Not: Filtre (status + bitiş ≥ bugün) sorguda değil JS'te yapılır — panelin
 * çalışan okuma deseniyle (basit select) aynı, böylece PostgREST filtre
 * uyuşmazlıkları sonucu sessizce boş dönme sorunu yaşanmaz. Tarih döngüsü
 * UTC ile yürür (sunucu saat dilimi ne olursa olsun gün kaymaz).
 * Tablo yoksa / hata olursa boş döner (her gün müsait kabul edilir).
 */
export async function GET() {
  const empty = { ps5: [] as string[], proj: [] as string[], perde: [] as string[] };
  try {
    const db = adminDb();
    const today = new Date().toISOString().slice(0, 10); // UTC, "YYYY-MM-DD"
    const { data, error } = await db
      .from("rentals")
      .select("items,start_date,end_date,status")
      .limit(1000);
    if (error) return NextResponse.json({ booked: empty });

    const booked: Record<string, string[]> = { ps5: [], proj: [], perde: [] };
    (data || []).forEach(
      (r: { items: string[]; start_date: string; end_date: string; status: string }) => {
        // Yalnızca aktif rezervasyonlar günü kapatır; geçmiş rezervasyonlar atlanır.
        if (r.status !== "pending" && r.status !== "confirmed") return;
        if (!r.start_date || !r.end_date || r.end_date < today) return;

        // start_date..end_date arasını UTC ile gez (gün kayması olmaz).
        const d = new Date(r.start_date + "T00:00:00Z");
        const end = new Date(r.end_date + "T00:00:00Z");
        while (d <= end) {
          const iso = d.toISOString().slice(0, 10);
          (r.items || []).forEach((it) => {
            if (booked[it] && !booked[it].includes(iso)) booked[it].push(iso);
          });
          d.setUTCDate(d.getUTCDate() + 1);
        }
      },
    );
    return NextResponse.json({ booked });
  } catch {
    return NextResponse.json({ booked: empty });
  }
}
