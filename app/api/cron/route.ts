import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const RSS_FEEDS = [
  "https://news.google.com/rss/search?q=Samsun+haber&hl=tr&gl=TR&ceid=TR:tr",
  "https://news.google.com/rss/search?q=Samsunspor&hl=tr&gl=TR&ceid=TR:tr",
  "https://news.google.com/rss/search?q=Samsun+ekonomi&hl=tr&gl=TR&ceid=TR:tr",
  "https://news.google.com/rss/search?q=Samsun+belediye&hl=tr&gl=TR&ceid=TR:tr",
];

// ══════════════════════════════════════════════════
// SAMSUN BİLGİ TABANI
// ══════════════════════════════════════════════════
const SAMSUN_KNOWLEDGE = `
Sen samsunkent.com için Samsun haberleri yazıyorsun. Aşağıdaki bilgileri MUTLAKA doğru kullan:

━━━ SAMSUNSPOR ━━━
- Tam adı: Samsunspor Kulübü
- Renkler: KIRMIZI ve BEYAZ (yeşil, sarı, mavi DEĞIL)
- Lakap: Kırmızı Şimşekler
- Stadyum: Samsun 19 Mayıs Stadyumu (kapasite: 33.000)
- Kuruluş: 1965
- Lig: Süper Lig
- Taraftar grubu: Kızıl Şimşekler
- Rakipler: Trabzonspor (en büyük rakip - Karadeniz derbisi)

━━━ SAMSUN COĞRAFYASİ ━━━
- Karadeniz kıyısında, Türkiye'nin kuzeyinde
- Nüfus: yaklaşık 1.4 milyon
- Plaka kodu: 55
- Türkiye'nin 14. büyük şehri

━━━ İLÇELER ━━━
- İlkadım (merkez, en kalabalık)
- Atakum (sahil, modern)
- Canik (orta)
- Tekkeköy (sanayi)
- Bafra (pirinç, tütün üretimi)
- Çarşamba (tarım, pide)
- Terme (Terme çayı)
- Alaçam
- 19 ilçe toplamda

━━━ TARİHİ YERLER ━━━
- Amisos Tepesi (antik kent)
- Bandırma Vapuru Müzesi (Atatürk'ün Samsun'a çıktığı gemi)
- Atatürk Müzesi (Atatürk'ün kaldığı ev)
- Gazi Müzesi
- Samsun Arkeoloji ve Etnografya Müzesi

━━━ TARİH ━━━
- 19 Mayıs 1919: Atatürk Samsun'a çıktı, Kurtuluş Savaşı başladı
- Bu nedenle 19 Mayıs Gençlik ve Spor Bayramı Samsun ile özdeşleşmiştir
- Antik çağda Amisos adıyla bilinirdi

━━━ EKONOMİ ━━━
- Samsun Limanı: Karadeniz'in en büyük limanlarından
- Tarım: Tütün, fındık, pirinç (özellikle Bafra pirinci)
- Sanayi: Tekkeköy OSB
- Ticaret merkezi

━━━ ÜNİVERSİTELER ━━━
- Ondokuz Mayıs Üniversitesi (OMÜ) - en büyük, kampüs şehir içinde
- Samsun Üniversitesi

━━━ ULAŞIM ━━━
- Çarşamba Havalimanı (şehre 25 km)
- Samsun Garı (tren)
- SAMULAŞ (şehir içi ulaşım - otobüs ve tramvay)
- Samsun-Sivas demiryolu hattı (yapım aşamasında)

━━━ KÜLTÜR VE MUTFAK ━━━
- Hamsi: Karadeniz'in simgesi balığı
- Pide: Özellikle Çarşamba pidesi ünlü
- Kuymak: Mısır unu ve tereyağıyla yapılan yöresel yemek
- Karadeniz çayı

━━━ MEŞHUR İSİMLER ━━━
- Bandırma Vapuru Müzesi - Atatürk'ün Samsun'a gelişini simgeler
- Amisos Tepesi - şehrin simgesi

━━━ ÖNEMLİ UYARILAR ━━━
- Samsunspor rengi KESİNLİKLE kırmızı-beyaz, ASLA yeşil değil
- "Kırmızı Şimşekler" lakabı kullan, başka lakap kullanma
- Trabzonspor farklı bir şehir (Trabzon), Samsunspor ile karıştırma
- OMÜ = Ondokuz Mayıs Üniversitesi, tam adını yaz
`;

const CAT_MAP: Record<string, string> = {
  spor: "spor", futbol: "spor", samsunspor: "spor", mac: "spor", gol: "spor",
  ekonomi: "ekonomi", yatirim: "ekonomi", fabrika: "ekonomi", ihracat: "ekonomi", ticaret: "ekonomi",
  kultur: "kultur", sanat: "kultur", muzik: "kultur", tiyatro: "kultur", festival: "kultur",
  saglik: "saglik", hastane: "saglik", doktor: "saglik", tedavi: "saglik",
  egitim: "egitim", universite: "egitim", okul: "egitim", omu: "egitim",
  turizm: "turizm", tatil: "turizm", plaj: "turizm", muzee: "turizm",
  ulasim: "ulasim", trafik: "ulasim", yol: "ulasim", otobus: "ulasim", ucus: "ulasim",
};

const CAT_TONES: Record<string, string> = {
  spor: "Enerjik ve taraftar hissi veren bir dille yaz. Samsunspor icin gururlu ol. Kirmizi Simsekler lakabini kullan.",
  ekonomi: "Analitik ve bilgilendirici yaz. Rakamlari ve Samsun ekonomisine katkisini vurgula.",
  kultur: "Sicak ve davetkar bir dille yaz. Samsun kulturunu ve zenginligini one cikar.",
  saglik: "Bilgilendirici ve guven verici yaz. Net ve anlasilir ol.",
  egitim: "Bilgilendirici yaz. OMU'nun Turk egitimindeki yerini vurgula.",
  turizm: "Ozendirici ve cekici yaz. Samsunun dogal ve tarihi guzelliklerini one cikar.",
  ulasim: "Net ve pratik yaz. Samsun halkinin isine yarayacak bilgileri one cikar.",
  gundem: "Tarafsiz, net ve kisa yaz. Profesyonel gazetecilik dili kullan.",
};

function detectCategory(text: string): string {
  const lower = text.toLowerCase();
  for (const [keyword, cat] of Object.entries(CAT_MAP)) {
    if (lower.includes(keyword)) return cat;
  }
  return "gundem";
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ğ]/g, "g").replace(/[ü]/g, "u").replace(/[ş]/g, "s")
    .replace(/[ı]/g, "i").replace(/[ö]/g, "o").replace(/[ç]/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) + "-" + Date.now();
}

async function rewriteWithClaude(title: string, summary: string, category: string) {
  const tone = CAT_TONES[category] || CAT_TONES.gundem;

  const prompt = `${SAMSUN_KNOWLEDGE}

━━━ GÖREV ━━━
Kategori: ${category.toUpperCase()}
Ton: ${tone}

Kaynak başlık: ${title}
Kaynak özet: ${summary}

KURALLLAR:
- Haber ajansı adı YAZMA (IHA, AA, Onedio, Sabah, Hürriyet vs)
- Link veya URL YAZMA
- Kaynak site adı YAZMA  
- Sadece Samsun ile ilgili yaz
- Türkçe yaz, Türkçe karakterleri doğru kullan
- Samsunspor için MUTLAKA kırmızı-beyaz ve Kırmızı Şimşekler de
- Yukarıdaki bilgi tabanına AYKIRI bilgi YAZMA

Sadece JSON döndür, başka hiçbir şey yazma:
{"title": "SEO uyumlu Türkçe başlık", "summary": "2-3 cümle özet", "content": "3-4 paragraf haber metni"}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }]
    })
  });

  const data = await response.json();
  const text = data.content?.[0]?.text || "";

  try {
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return { title, summary, content: summary };
  }
}

export async function GET() {
  let processed = 0;

  for (const feedUrl of RSS_FEEDS) {
    try {
      const res = await fetch(feedUrl, { next: { revalidate: 0 } });
      if (!res.ok) continue;

      const xml = await res.text();
      const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

      for (const item of items.slice(0, 3)) {
        const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) ||
                           item.match(/<title>(.*?)<\/title>/);
        const descMatch = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) ||
                          item.match(/<description>(.*?)<\/description>/);

        const title = titleMatch?.[1] || "";
        const desc = descMatch?.[1] || "";

        if (!title || title.length < 10) continue;

        const combined = (title + " " + desc).toLowerCase();
        if (!combined.includes("samsun")) continue;

        // Temizle
        const cleanTitle = title
          .replace(/<[^>]+>/g, "")
          .replace(/\s*-\s*([\w\s]+)$/, "") // "- Kaynak Adı" kaldır
          .trim();
        const cleanDesc = desc
          .replace(/<[^>]+>/g, "")
          .replace(/https?:\/\/\S+/g, "")
          .slice(0, 400)
          .trim();

        if (!cleanTitle || cleanTitle.length < 10) continue;

        const category = detectCategory(cleanTitle + " " + cleanDesc);
        const rewritten = await rewriteWithClaude(cleanTitle, cleanDesc, category);
        const slug = slugify(rewritten.title);

        const { error } = await supabase.from("news_articles").insert({
          slug,
          title: rewritten.title,
          summary: rewritten.summary,
          content: rewritten.content,
          category,
          is_approved: false,
          cover_image: null,
        });

        if (!error) processed++;

        await new Promise(r => setTimeout(r, 600));
      }
    } catch (e) {
      console.error(feedUrl, e);
    }
  }

  return NextResponse.json({ success: true, processed });
}
