# Yol Maliyeti

Kalkış ve varış noktası seçildiğinde yakıt, otoyol-köprü ücretleri ve yol masraflarını hesaplayan Android uygulaması.

- **Harita ve güzergah:** OpenStreetMap, Photon (adres arama), OSRM (yol). Haritaya dokunarak, GPS ile ya da Google Haritalar koordinatı yapıştırarak nokta seçilebilir.
- **Yakıt:** Depo dolu çıkılır; yakıt yedek seviyeye inmeden yol üstündeki ilk ilde, o ilin pompa fiyatından dolum yapılır. Fiyatlar Petrol Ofisi'nin 81 il tablosundan her sabah 06:30'da `data/fuel.json` dosyasına çekilir.
- **Geçiş ücretleri:** KGM 2026 tarifeleri (`data/tolls.json`). Köprüler tam ücretle; otoyolun bir kısmı kullanılıyorsa ücret mesafeye göre tahmin edilir ve "tahmini" diye işaretlenir.

## APK

`main` dalına her gönderimde GitHub Actions APK derler ve **Releases** sayfasına koyar. Telefondan son sürümdeki `yol-maliyeti.apk` dosyasını indirip kurun.
