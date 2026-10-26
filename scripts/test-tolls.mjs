// Örnek güzergahlarda ücret tespitini dener (GitHub Actions'ta çalışır, OSRM'e erişim gerekir)
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const src = readFileSync("www/app.js", "utf8");
const pick = (name) => { const i = src.indexOf("function " + name + "("); if (i < 0) throw new Error(name); let j = src.indexOf("\nfunction ", i + 10); const k = src.indexOf("\n/* ---", i + 10); if (k > 0 && (j < 0 || k < j)) j = k; return src.slice(i, j); };
const constBlock = (name) => { const i = src.indexOf("const " + name + "="); const j = src.indexOf("];", i) + 2; return src.slice(i, j); };
const code = [constBlock("BRIDGES"), "const CLS_F=[1,1.6,2.2,2.8,3.4,0.45];const PER_KM_OTHER=0.9;",
  ...["hav","fastKm","nearestOnRoute","tollIntervals","inIntervals","sysPrice","detectTolls","tollItem","clsPrice","tollAmount"].map(pick)].join("\n");
const PRICES = { tolls: JSON.parse(readFileSync("data/tolls.json", "utf8")) };
const st = { vclass: 0 };
const api = new Function("PRICES", "st", code + "\nreturn {detectTolls,tollAmount,hav};")(PRICES, st);
const cases = [
  ["Dilovası → Balıkesir Batı", [[29.53, 40.78], [27.80, 39.63]]],
  ["Balıkesir → Kadıköy", [[27.88, 39.65], [29.03, 40.99]]],
  ["Taksim → Konak", [[28.985, 41.037], [27.1287, 38.4189]]],
  ["Kadıköy → Kızılay", [[29.03, 40.99], [32.854, 39.92]]],
  ["Esenyurt → Edirne", [[28.67, 41.03], [26.56, 41.68]]],
  ["Ankara → Niğde", [[32.85, 39.93], [34.68, 37.97]]],
  ["Aydın → Denizli", [[27.84, 37.85], [29.09, 37.78]]],
  ["Bursa → Gemlik (kısa)", [[29.06, 40.19], [29.16, 40.43]]],
  ["Kadıköy → Beşiktaş", [[29.03, 40.99], [29.0, 41.043]]],
];
const out = [];
for (const [name, pts] of cases) {
  try {
    const url = "https://router.project-osrm.org/route/v1/driving/" + pts.map(p => p.join(",")).join(";") + "?overview=full&geometries=geojson&steps=true";
    const j = await (await fetch(url)).json();
    const R = j.routes[0];
    const coords = R.geometry.coordinates.map(([lon, lat]) => [lat, lon]);
    const cum = [0]; for (let i = 1; i < coords.length; i++) cum.push(cum[i - 1] + api.hav(coords[i - 1][0], coords[i - 1][1], coords[i][0], coords[i][1]));
    const tot = R.distance / 1000, sc = tot / cum[cum.length - 1]; for (let i = 0; i < cum.length; i++) cum[i] *= sc;
    const T = api.detectTolls(R, coords, cum, tot);
    const fmt = l => l.map(t => `${t.label}${t.sub ? " [" + t.sub + "]" : ""} = ${Math.round(api.tollAmount(t).amt)}`);
    const sum = l => l.reduce((a, t) => a + api.tollAmount(t).amt, 0);
    let pos = 0; const steps = [];
    for (const st2 of R.legs[0].steps) { if (st2.distance > 1500) steps.push(`${Math.round(pos/1000)}km +${Math.round(st2.distance/1000)} ${st2.ref || "-"} ${st2.name || ""}`); pos += st2.distance; }
    out.push({ name, steps: name.startsWith("Esenyurt") || name.startsWith("Ankara") ? steps : undefined, km: Math.round(tot), go: fmt(T.go), goTotal: Math.round(sum(T.go)), back: fmt(T.back), backTotal: Math.round(sum(T.back)), note: T.note });
  } catch (e) { out.push({ name, error: String(e) }); }
  await new Promise(r => setTimeout(r, 1200));
}
mkdirSync("test", { recursive: true });
writeFileSync("test/tolls-result.json", JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
