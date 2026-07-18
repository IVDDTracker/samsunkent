import { supabase } from "../lib/supabase";
import type { Announcement } from "../lib/db";
import CorkBackground from "../components/CorkBackground";
import ContactForm from "../components/ContactForm";
import Footer from "../components/Footer";

export const dynamic = "force-dynamic";

const ROTS = ["1.6deg", "-2.2deg", "1.1deg", "-1.4deg", "2deg", "-1.1deg"];
const TONES = ["kraft", "sticky", "", "kraft", ""];

async function getAnnouncements(): Promise<Announcement[]> {
  try {
    const { data } = await supabase
      .from("announcements")
      .select("id,title,body,is_active,sort,created_at")
      .eq("is_active", true)
      .order("sort", { ascending: true })
      .order("created_at", { ascending: false });
    return (data as Announcement[]) || [];
  } catch {
    return [];
  }
}

function fmt(d: string) {
  try {
    return new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
  } catch {
    return "";
  }
}

export default async function HomePage() {
  const anns = await getAnnouncements();

  return (
    <>
      <CorkBackground />
      <div className="wrap">
        <header className="top">
          <div className="brand">
            samsunkent<span className="dot">.</span>
            <span className="tag">Mekân · Sokak · Gündem</span>
          </div>
          <span className="reach">
            <b>1M</b> aylık görüntüleme · Samsun
          </span>
        </header>

        {/* Manifesto — hero not (formsuz) */}
        <article className="note manifesto" style={{ "--rot": "-1.2deg" } as React.CSSProperties}>
          <span className="pin" />
          <span className="eyebrow">Manifesto</span>
          <h1>
            Buralıyım.
            <br />
            <span className="red">Buraları</span> biliyorum.
          </h1>
          <p className="lede">
            Mekânı, sokağı, gündemi — ne çıkarsa. Samsun&apos;u süssüz, filtresiz, olduğu gibi
            anlatırım. Reklam değil; gerçek. Bir şey mi döndü — kim bilecek? Ben bileceğim.
          </p>
          <p className="lede" style={{ marginTop: 14 }}>
            Sokaktan gelen ilk haber, ilk fırsat kanalda düşer. Sen de gel.
          </p>
          <a
            className="channel"
            href="https://www.instagram.com/channel/Abbvtcz5xxeoD7Cd/"
            target="_blank"
            rel="noopener noreferrer"
          >
            📣 Kanala katıl →
          </a>
          <div className="sign">— samsunkent</div>
        </article>

        <div className="board">
          {/* Sabit iş birliği notu */}
          <article className="note" style={{ "--rot": "1.6deg" } as React.CSSProperties}>
            <span className="pin navy" />
            <span className="eyebrow">İş birliği</span>
            <h3>Seni Samsun&apos;a duyuralım.</h3>
            <p>
              Markan, mekânın, işin — doğru kitleye, doğru dille. Telefonunu ve iki satır mesajını
              bırak, ben dönerim.
            </p>
            <ContactForm
              source="İş birliği"
              label="Ulaşayım"
              messagePlaceholder="Ne yapmak istiyorsun?"
            />
            <span className="meta">Genelde birkaç saat içinde dönerim.</span>
          </article>

          {/* Admin duyuru notları */}
          {anns.map((a, i) => {
            const tone = TONES[i % TONES.length];
            const rot = ROTS[i % ROTS.length];
            const navy = i % 2 === 1;
            return (
              <article
                key={a.id}
                className={`note ${tone}`}
                style={{ "--rot": rot } as React.CSSProperties}
              >
                <span className={`pin ${navy ? "navy" : ""}`} />
                <span className="eyebrow">Duyuru</span>
                <h3>{a.title}</h3>
                {a.body && <p>{a.body}</p>}
                <ContactForm source={a.title} messagePlaceholder="Notun / telefonun yanına iki satır" />
                <span className="meta">{fmt(a.created_at)}</span>
              </article>
            );
          })}
        </div>
      </div>
      <Footer />
    </>
  );
}
