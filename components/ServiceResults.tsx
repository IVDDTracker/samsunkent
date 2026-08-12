"use client";
import { useMemo, useState } from "react";
import BusinessCard from "./BusinessCard";
import type { BusinessFull, District } from "../lib/hizmet";

interface Props {
  serviceId: string;
  sponsored: BusinessFull[];
  organic: BusinessFull[];
  districts: District[];
}

// Sonuç adası: ilçe filtresi + Sponsorlu (ayrı, etiketli) ve Organik bloklar.
// Organik sıra sunucuda hesaplandı (verification+completeness+freshness); burada
// yalnız filtreleniyor — sıralama korunur. tier/ödeme HİÇ kullanılmaz.
export default function ServiceResults({ serviceId, sponsored, organic, districts }: Props) {
  const [dist, setDist] = useState<string | null>(null);

  // Yalnız içinde işletme olan ilçeleri çipe koy.
  const activeDistricts = useMemo(() => {
    const present = new Set<string>();
    [...sponsored, ...organic].forEach((b) => b.districts.forEach((d) => present.add(d.slug)));
    return districts.filter((d) => present.has(d.slug));
  }, [sponsored, organic, districts]);

  const match = (b: BusinessFull) => !dist || b.districts.some((d) => d.slug === dist);
  const spon = sponsored.filter(match);
  const org = organic.filter(match);
  const total = spon.length + org.length;

  const distName = dist ? districts.find((d) => d.slug === dist)?.name : null;

  return (
    <>
      {activeDistricts.length > 0 && (
        <div className="hz-filters">
          <div className="hz-frow" role="group" aria-label="İlçe filtresi">
            <span className="hz-flabel">İlçe</span>
            <button className="hz-chip" aria-pressed={dist === null} onClick={() => setDist(null)}>Tümü</button>
            {activeDistricts.map((d) => (
              <button key={d.slug} className="hz-chip" aria-pressed={dist === d.slug} onClick={() => setDist(d.slug)}>
                {d.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="hz-rmeta">
        <span className="hz-count"><b>{total}</b> firma{distName ? ` · ${distName}` : ""}</span>
        <span className="hz-sort">Samsunkent sıralaması</span>
      </div>

      {total === 0 && (
        <div className="hz-empty">
          Bu {distName ? `ilçede (${distName})` : "hizmette"} henüz yayında firma yok.
          {distName && <> <button className="hz-chip" style={{ marginTop: 10 }} onClick={() => setDist(null)}>Tümünü göster</button></>}
        </div>
      )}

      {spon.length > 0 && (
        <>
          <div className="hz-blocklbl">Sponsorlu</div>
          <div className="hz-list">
            {spon.map((b, i) => (
              <BusinessCard key={b.id} business={b} serviceId={serviceId} district={dist ?? undefined} position={i} sponsored />
            ))}
          </div>
        </>
      )}

      {org.length > 0 && (
        <>
          {spon.length > 0 && <div className="hz-blocklbl">Firmalar</div>}
          <div className="hz-list">
            {org.map((b, i) => (
              <BusinessCard key={b.id} business={b} serviceId={serviceId} district={dist ?? undefined} position={i} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
