"use client";
import { useEffect, useRef } from "react";
import { track, type ContactEvent } from "../lib/track";
import { telHref, waHref } from "../lib/phone";
import type { BusinessFull } from "../lib/hizmet";

interface Props {
  business: BusinessFull;
  serviceId?: string;
  district?: string;
  position?: number;
  sponsored?: boolean;
}

// Yerel firma keşif kartı. Temas aksiyonlarını ölçer (lead iddiası yok).
export default function BusinessCard({ business: b, serviceId, district, position, sponsored }: Props) {
  const ref = useRef<HTMLElement>(null);
  const seen = useRef(false);

  // Görünür olduğunda bir kez impression.
  useEffect(() => {
    const el = ref.current;
    if (!el || seen.current) return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting && !seen.current) {
          seen.current = true;
          fire("business_impression");
          io.disconnect();
        }
      }
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function fire(event_type: ContactEvent) {
    track({ event_type, business_id: b.id, service_id: serviceId, district, position, sponsored });
  }

  const tel = telHref(b.phone);
  const wa = waHref(b.whatsapp);
  const districtNames = b.districts.map((d) => d.name);
  const locLabel = districtNames.length ? districtNames.slice(0, 2).join(", ") : "Samsun";

  return (
    <article className="hz-biz" ref={ref}>
      {sponsored && <span className="hz-spon-lbl">Sponsorlu</span>}
      <div className="hz-biz-top">
        <div className="hz-biz-name">{b.name}</div>
        {b.verified && (
          <span className="hz-verified" title="Samsunkent kimlik/faaliyet teyidi — tavsiye veya garanti değildir">
            <span className="tick">✓</span> Doğrulandı
          </span>
        )}
      </div>
      <p className="hz-biz-loc">{locLabel}{districtNames.length ? " · Samsun" : ""}</p>

      {b.services.length > 0 && (
        <div className="hz-tags">
          {b.services.slice(0, 4).map((s) => (
            <span className="hz-tag2" key={s.id}>{s.name}</span>
          ))}
        </div>
      )}

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

      <a className="hz-profil" href={`/firma/${b.slug}`} onClick={() => fire("business_profile_view")}>
        Profili gör →
      </a>
    </article>
  );
}
