// DailyDermo ürün kataloğu — patron panelinde kullanılır.
// alis  = birim alış (KDV'siz) → 1 adet alınca Hakan'a eklenen borç
// kar   = 1 satıştan net kâr (Premium fiyat; KDV + %17 komisyon + ~83₺ kargo düşülmüş)
// Kaynak: hepsiburada-kar-hesabi.xlsx. Fiyat değişirse burayı güncelle.

export interface Urun {
  id: string;
  ad: string;
  alis: number;
  kar: number;
}

export const URUNLER: Urun[] = [
  { id: "clina",           ad: "Clina Tea Tree Jel",        alis: 272.22, kar: 187.72 },
  { id: "nialiss",         ad: "Nialiss Krem",              alis: 310.0,  kar: 185.76 },
  { id: "antidandruff",    ad: "Antidandruff Şampuan",      alis: 319.44, kar: 182.29 },
  { id: "fibrolex",        ad: "Fibrolex Jel",              alis: 350.0,  kar: 181.58 },
  { id: "antihairloss_sm", ad: "Anti-Hairloss Şampuan 300ml", alis: 372.21, kar: 177.28 },
  { id: "antiblemish",     ad: "Anti Blemish Leke Krem",    alis: 486.11, kar: 170.84 },
  { id: "antihairloss_sp", ad: "Anti-Hairloss Sprey 60ml",  alis: 438.88, kar: 170.31 },
  { id: "sunscreen",       ad: "Sun Screen SPF50+",         alis: 533.33, kar: 165.41 },
];

export const urunById = (id: string) => URUNLER.find((u) => u.id === id);
