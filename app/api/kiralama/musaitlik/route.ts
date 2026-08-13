import { NextResponse } from "next/server";
import { adminDb } from "../../../../lib/db";

export const dynamic = "force-dynamic";

/**
 * Aktif (pending/confirmed) rezervasyonlardan, bugünden itibaren dolu olan
 * günleri ürün bazında döner. Takvim bu bilgiyle dolu günleri kapatır.
 * Tablo yoksa / hata olursa boş döner (her gün müsait kabul edilir).
 */
export async function GET() {
  const empty = { ps5: [] as string[], proj: [] as string[], perde: [] as string[] };
  try {
    const db = adminDb();
    if (!db) return NextResponse.json({ booked: empty });
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await db
      .from("rentals")
      .select("items,start_date,end_date")
      .in("status", ["pending", "confirmed"])
      .gte("end_date", today);
    if (error) return NextResponse.json({ booked: empty });

    const booked: Record<string, string[]> = { ps5: [], proj: [], perde: [] };
    (data || []).forEach((r: { items: string[]; start_date: string; end_date: string }) => {
      const d = new Date(r.start_date + "T00:00:00");
      const end = new Date(r.end_date + "T00:00:00");
      while (d <= end) {
        const iso = d.toISOString().slice(0, 10);
        (r.items || []).forEach((it) => {
          if (booked[it] && !booked[it].includes(iso)) booked[it].push(iso);
        });
        d.setDate(d.getDate() + 1);
      }
    });
    return NextResponse.json({ booked });
  } catch {
    return NextResponse.json({ booked: empty });
  }
}
