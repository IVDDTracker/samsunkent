"use client";
import { useEffect } from "react";
import { track } from "../lib/track";
import { telHref, waHref } from "../lib/phone";

interface Props {
  businessId: string;
  serviceId?: string;
  phone?: string | null;
  whatsapp?: string | null;
  website?: string | null;
  mapsHref: string;
}

// Profil temas aksiyonları — profil görüntüleme + tüm tıklamalar ölçülür.
export default function ProfileActions({ businessId, serviceId, phone, whatsapp, website, mapsHref }: Props) {
  useEffect(() => {
    track({ event_type: "business_profile_view", business_id: businessId, service_id: serviceId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tel = telHref(phone);
  const wa = waHref(whatsapp);
  const fire = (event_type: Parameters<typeof track>[0]["event_type"]) =>
    track({ event_type, business_id: businessId, service_id: serviceId });

  return (
    <div className="hz-actions">
      <div className="hz-cta" style={!wa ? { gridTemplateColumns: "1fr" } : undefined}>
        {tel ? (
          <a className="hz-ara" href={tel} onClick={() => fire("phone_click")}>
            <svg viewBox="0 0 24 24"><path d="M6.6 10.8a15.5 15.5 0 006.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 013 4c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.3 1l-2.1 2.2z"/></svg>
            Ara
          </a>
        ) : (
          <span className="hz-ara" style={{ opacity: 0.5, cursor: "default" }}>Telefon yok</span>
        )}
        {wa && (
          <a className="hz-wa" href={wa} target="_blank" rel="noopener noreferrer"
             aria-label="WhatsApp'tan yaz" onClick={() => fire("whatsapp_click")}>
            <svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 00-8.5 15.3L2 22l4.8-1.5A10 10 0 1012 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 .9-2.2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.4.6c-.2.2-.3.4-.1.7.2.3.9 1.4 1.9 2.3 1.3 1.1 2.3 1.4 2.6 1.6.3.1.5.1.7-.1l.7-.8c.2-.3.4-.2.6-.1l1.8.9c.3.1.5.2.5.4.1.2.1.7-.1 1.2z"/></svg>
          </a>
        )}
      </div>
      <div className="hz-sec">
        <a href={mapsHref} target="_blank" rel="noopener noreferrer" onClick={() => fire("directions_click")}>🧭 Yol tarifi</a>
        {website && (
          <a href={website} target="_blank" rel="noopener noreferrer" onClick={() => fire("website_click")}>🌐 Web sitesi</a>
        )}
      </div>
    </div>
  );
}
