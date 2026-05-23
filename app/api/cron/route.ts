export const dynamic = "force-dynamic";
export const maxDuration = 60;
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";
export const maxDuration = 60;


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

const SAMSUN_BILGI = `
Sen samsunkent.com icin Samsun haberleri yaziyorsun. Asagidaki bilgileri MUTLAKA dogru kullan:

=== SAMSUNSPOR ===
- Tam adi: Samsunspor Kulubu
- Renkler: KIRMIZI ve BEYAZ (yesil, sari, mavi DEGIL - bu cok ONEMLI)
- Lakap: Kirmizi Simsekler (Yesil Simsekler, Mavi Simsekler DEGIL)
- Stadyum: Samsun 19 Mayis Statyumu, kapasitesi 33.000
- Kurulus: 1965
- Lig: Super Lig
- En buyuk rakip: Trabzonspor (Karadeniz derbisi)
- Taraftar grubu: Kizil Simsekler

=== SAMSUN HAKKINDA ===
- Karadeniz kiyisinda, Turkiye'nin kuzeyinde bir sehir
- Nufus: yaklasik 1.4 milyon
- Plaka kodu: 55
- 19 Mayis 1919: Ataturk Samsun'a cikti, Kurtulus Savasi basladi
- Bu nedenle 19 Mayis Genclik ve Spor Bayrami Samsun ile ozdeslesir

=== ILCELER ===
- Ilkadim (merkez, en kalabalik)
- Atakum (sahil, modern)
- Canik
- Tekkekoy (sanayi)
- Bafra (pirinc, tutun)
- Carsamba (tarim, pide)
- Terme, Alacam ve diger ilceler

=== TARIHI VE KULTUREL YERLER ===
- Amisos Tepesi (antik kent, sehrin simgesi)
- Bandirma Vapuru Muzesi (Ataturk'un Samsun'a ciktigi gemi)
- Ataturk Muzesi (Ataturk'un kaldigi ev)
- 19 Mayis Meydani

=== EKONOMI ===
- Samsun Limani: Karadeniz'in en buyuk limanlarindan
- Tarim: Tutun, findik, pirinc (Bafra pirinci unlu)
- Sanayi: Tekkekoy OSB

=== UNIVERSITELER ===
- Ondokuz Mayis Universitesi (OMU) - en buyuk
- Samsun Universitesi

=== ULASIM ===
- Carsamba Havalimanı (sehre 25 km)
- SAMULAS (sehir ici ulasim - otobus ve tramvay)
- Samsun Gari

=== MUTFAK ===
- Hamsi: Karadeniz'in simgesi baligi
- Pide: Ozellikle Carsamba pidesi meshur
- Kuymak: Misir unu ve tereyagiyla yapilan yoresel yemek

=== ONEMLI UYARILAR ===
- Samsunspor rengi KESINLIKLE kirmizi-beyaz, ASLA yesil degil
- "Kirmizi Simsekler" lakabini kullan
- Trabzonspor farkli bir sehir (Trabzon), Samsunspor ile karistirma
- OMU = Ondokuz Mayis Universitesi
- Haber ajansi adi YAZMA (IHA, AA, Onedio vs)
- Link veya URL YAZMA
- Turkce yaz, karakterleri dogru kullan
`;

const CAT_MAP: Record<string,string> = {
  spor:"spor", futbol:"spor", samsunspor:"spor", mac:"spor",
  ekonomi:"ekonomi", yatirim:"ekonomi", fabrika:"ekonomi", ihracat:"ekonomi",
  kultur:"kultur", sanat:"kultur", festival:"kultur",
  saglik:"saglik", hastane:"saglik",
  egitim:"egitim", universite:"egitim", okul:"egitim",
  turizm:"turizm", tatil:"turizm", plaj:"turizm",
  ulasim:"ulasim", trafik:"ulasim", yol:"ulasim",
};

const CAT_TONES: Record<string,string> = {
  spor:"Enerjik ve taraftar hissi veren bir dille yaz. Samsunspor icin gururlu ol. KIRMIZI-BEYAZ takimimiz de. Kirmizi Simsekler lakabini kullan.",
  ekonomi:"Analitik ve bilgilendirici yaz. Samsun ekonomisine katkisini vurgula.",
  kultur:"Sicak ve davetkar bir dille yaz.",
  saglik:"Bilgilendirici ve guven verici yaz.",
  egitim:"Bilgilendirici yaz.",
  turizm:"Ozendirici yaz. Samsunun guzelliklerini one cikar.",
  ulasim:"Net ve pratik yaz.",
  gundem:"Tarafsiz, net ve kisa yaz. Gazetecilik dili kullan.",
};

function detectCategory(text: string): string {
  const lower = text.toLowerCase();
  for (const [keyword, cat] of Object.entries(CAT_MAP)) {
    if (lower.includes(keyword)) return cat;
  }
  return "gundem";
}

function slugify(text: string): string {
  return text.toLowerCase()
    .replace(/[ğ]/g,"g").replace(/[ü]/g,"u").replace(/[ş]/g,"s")
    .replace(/[ı]/g,"i").replace(/[ö]/g,"o").replace(/[ç]/g,"c")
    .replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")
    .slice(0,80) + "-" + Date.now();
}

async function rewriteWithClaude(title: string, summary: string, category: string) {
  const tone = CAT_TONES[category] || CAT_TONES.gundem;
  const prompt = `${SAMSUN_BILGI}

=== GOREV ===
Kategori: ${category.toUpperCase()}
Ton: ${tone}

Kaynak baslik: ${title}
Kaynak ozet: ${summary}

Sadece JSON don, baska hicbir sey yazma:
{"title": "SEO uyumlu Turkce baslik (ajans adi olmadan)", "summary": "2-3 cumle ozet", "content": "3-4 paragraf haber metni"}`;

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
    return JSON.parse(text.replace(/```json|```/g,"").trim());
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
        const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || item.match(/<title>(.*?)<\/title>/);
        const descMatch = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) || item.match(/<description>(.*?)<\/description>/);

        const rawTitle = titleMatch?.[1] || "";
        const rawDesc = descMatch?.[1] || "";

        if (!rawTitle || rawTitle.length < 10) continue;

        const combined = (rawTitle + " " + rawDesc).toLowerCase();
        if (!combined.includes("samsun")) continue;

        const cleanTitle = rawTitle.replace(/<[^>]+>/g,"").replace(/\s*-\s*[\w\s]+\.com.*$/,"").replace(/\s*\|\s*[\w\s]+$/,"").trim();
        const cleanDesc = rawDesc.replace(/<[^>]+>/g,"").replace(/https?:\/\/\S+/g,"").slice(0,400).trim();

        if (!cleanTitle || cleanTitle.length < 10) continue;

        const category = detectCategory(cleanTitle + " " + cleanDesc);
        const rewritten = await rewriteWithClaude(cleanTitle, cleanDesc, category);
        const slug = slugify(rewritten.title);

        const { error } = await supabase.from("news_articles").insert({
          slug, title: rewritten.title, summary: rewritten.summary,
          content: rewritten.content, category,
          is_approved: false, cover_image: null,
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
