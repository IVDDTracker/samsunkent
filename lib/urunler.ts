// DailyDermo ürün kataloğu — patron paneli.
// alis = KDV DAHİL birim alış fiyatı → 1 adet alınca borca eklenen tutar.
// Satış fiyatı sabit değil (platforma göre değişir), o yüzden satışta elle girilir.
// Fiyat değişirse burayı güncelle.

export interface Urun {
  id: string;
  ad: string;
  alis: number; // KDV dahil alış
}

export const URUNLER: Urun[] = [
  { id: "clina",           ad: "Clina Tea Tree Jel",          alis: 326.66 },
  { id: "nialiss",         ad: "Nialiss Krem",                alis: 372.0 },
  { id: "antidandruff",    ad: "Antidandruff Şampuan",        alis: 383.33 },
  { id: "fibrolex",        ad: "Fibrolex Jel",                alis: 420.0 },
  { id: "antihairloss_sm", ad: "Anti-Hairloss Şampuan 300ml", alis: 446.65 },
  { id: "antihairloss_sp", ad: "Anti-Hairloss Sprey 60ml",    alis: 526.66 },
  { id: "antiblemish",     ad: "Anti Blemish Leke Krem",      alis: 583.33 },
  { id: "sunscreen",       ad: "Sun Screen SPF50+",           alis: 640.0 },
];

export const urunById = (id: string) => URUNLER.find((u) => u.id === id);
