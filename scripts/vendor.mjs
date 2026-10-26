// Leaflet dosyalarını ve güncel fiyat verisini www klasörüne kopyalar (APK'ya gömülü yedek kopya)
import { cpSync, mkdirSync } from "node:fs";
mkdirSync("www/vendor/leaflet", { recursive: true });
cpSync("node_modules/leaflet/dist", "www/vendor/leaflet", { recursive: true });
mkdirSync("www/data", { recursive: true });
cpSync("data/fuel.json", "www/data/fuel.json");
cpSync("data/tolls.json", "www/data/tolls.json");
console.log("vendor ok");
