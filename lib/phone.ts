// Saf telefon yardımcıları (supabase import etmez → client/server güvenli).

// TR numarasını wa.me için normalize et: 90XXXXXXXXXX
export function normalizeTr(raw?: string | null): string {
  if (!raw) return "";
  let d = raw.replace(/[^\d]/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("0")) d = "90" + d.slice(1);
  else if (d.startsWith("90")) { /* zaten ülke kodlu */ }
  else if (d.length === 10) d = "90" + d; // 5XXXXXXXXX
  return d;
}

export function telHref(phone?: string | null): string | undefined {
  const d = (phone || "").replace(/[^\d+]/g, "");
  return d ? `tel:${d}` : undefined;
}

export function waHref(wa?: string | null): string | undefined {
  const d = normalizeTr(wa);
  return d ? `https://wa.me/${d}` : undefined;
}

// Google Maps yol tarifi linki
export function mapsHref(name: string, address?: string | null, lat?: number | null, lng?: number | null): string {
  if (typeof lat === "number" && typeof lng === "number") {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }
  const q = encodeURIComponent([name, address, "Samsun"].filter(Boolean).join(" "));
  return `https://www.google.com/maps/dir/?api=1&destination=${q}`;
}
