"use client";

// İstemci tarafı temas-aksiyonu izleyici.
// Kullanıcı akışını asla bloklamaz: sendBeacon (varsa) ya da keepalive fetch.

export type ContactEvent =
  | "business_impression"
  | "business_profile_view"
  | "phone_click"
  | "whatsapp_click"
  | "directions_click"
  | "website_click";

export interface TrackPayload {
  event_type: ContactEvent;
  business_id?: string;
  service_id?: string;
  district?: string;
  position?: number;
  sponsored?: boolean;
}

// Oturum başına anonim id — impression'ları tekilleştirmek için (kişisel veri değil).
function sessionHash(): string {
  try {
    const k = "sk_sid";
    let v = sessionStorage.getItem(k);
    if (!v) {
      v = (crypto.randomUUID?.() || Math.random().toString(36).slice(2)) as string;
      sessionStorage.setItem(k, v);
    }
    return v;
  } catch {
    return "";
  }
}

export function track(p: TrackPayload): void {
  try {
    const body = JSON.stringify({
      ...p,
      session_hash: sessionHash(),
      landing_page: typeof location !== "undefined" ? location.pathname : undefined,
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
    } else {
      fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true });
    }
  } catch {
    /* sessizce geç */
  }
}
