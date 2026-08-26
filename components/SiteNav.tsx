import Link from "next/link";

/**
 * Her zaman görünen sabit üst menü. Sinematik pano izlensin diye kaydırmayı
 * beklemeden, ziyaretçi doğrudan para kazandıran sayfalara (kiralık, hizmet,
 * iletişim) ulaşabilsin. Koyu yarı-saydam + blur → hem koyu hero hem cork
 * zemin üstünde okunur.
 */
export default function SiteNav() {
  return (
    <nav className="sitenav" aria-label="Ana menü">
      <Link href="/" className="sitenav-brand">
        samsunkent<b>.</b>
      </Link>
      <div className="sitenav-links">
        <Link href="/kirala">Kiralık</Link>
        <Link href="/hizmetler">Hizmetler</Link>
        <Link href="/samsun-web-sitesi-yaptirma" className="hide-sm">Web</Link>
        <a href="#pano" className="sitenav-cta">İletişim</a>
      </div>
    </nav>
  );
}
