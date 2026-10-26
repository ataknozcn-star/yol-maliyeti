// Petrol Ofisi'nin 81 il pompa fiyatı tablosunu çeker ve data/fuel.json'a yazar.
// Her hücrede iki sayı var: KDV dahil ve KDV hariç. Büyük olan (KDV dahil) alınır.
// Sütun sırası: Kurşunsuz 95, Diesel, Gazyağı, Kalorifer Yakıtı, Fuel Oil, Otogaz.
import { readFileSync, writeFileSync } from "node:fs";

const URL = "https://www.petrolofisi.com.tr/en/fuels-prices";
const OUT = "data/fuel.json";

const old = JSON.parse(readFileSync(OUT, "utf8"));
const keys = Object.keys(old.p);

const res = await fetch(URL, {
  headers: {
    "User-Agent": "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36",
    "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.8",
  },
});
if (!res.ok) { console.error("HTTP", res.status); process.exit(0); }
const html = await res.text();

const text = html
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/&nbsp;|&#160;/g, " ")
  .replace(/&amp;/g, "&")
  .replace(/\s+/g, " ")
  .toUpperCase();

const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const num = s => parseFloat(s.replace(",", "."));
const cell = String.raw`(\d+[.,]\d+)\s+(\d+[.,]\d+)\s+TL\s*/\s*(?:LT|KG)\s*\+?\s*KDV`;
const rowRe = k => new RegExp(String.raw`(?:^|\s)${esc(k)}\s+` + Array(6).fill(cell).join(String.raw`\s+`));

const p = {};
let fresh = 0;
for (const k of keys) {
  const m = text.match(rowRe(k));
  if (!m) { p[k] = old.p[k]; continue; }
  const pick = i => Math.max(num(m[1 + i * 2]), num(m[2 + i * 2]));
  const row = [pick(0), pick(1), pick(5)];
  const ok = row[0] > 30 && row[0] < 250 && row[1] > 30 && row[1] < 250 && row[2] > 15 && row[2] < 120;
  if (ok) { p[k] = row; fresh++; } else p[k] = old.p[k];
}

console.log(`parsed ${fresh}/${keys.length}`);
if (fresh < 70) { console.error("Too few rows parsed; keeping previous file."); process.exit(0); }

const changed = JSON.stringify(p) !== JSON.stringify(old.p);
const now = new Date().toLocaleString("sv-SE", { timeZone: "Europe/Istanbul" }).replace(" ", "T") + "+03:00";
writeFileSync(OUT, JSON.stringify({ ...old, updatedAt: now, checkedAt: now, p }, null, 1) + "\n");
console.log(changed ? "prices changed" : "prices unchanged (timestamp refreshed)");
