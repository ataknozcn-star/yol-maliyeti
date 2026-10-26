(function(){
"use strict";
const $=id=>document.getElementById(id);
const TL=n=>Math.round(n).toLocaleString("tr-TR")+" ₺";
const TL2=n=>n.toLocaleString("tr-TR",{minimumFractionDigits:2,maximumFractionDigits:2})+" ₺";
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

const REMOTE="https://raw.githubusercontent.com/ataknozcn-star/yol-maliyeti/main/data/";
const PHOTON="https://photon.komoot.io/api/";
const NOMINATIM="https://nominatim.openstreetmap.org/reverse";
const OSRM="https://router.project-osrm.org/route/v1/driving/";

/* 81 il: anahtar (Petrol Ofisi tablosuyla aynı), görünen ad, il merkezi koordinatı */
const IL=[
["ADANA","Adana",37.00,35.32],["ADIYAMAN","Adıyaman",37.76,38.28],["AFYON","Afyonkarahisar",38.76,30.54],["AGRI","Ağrı",39.72,43.05],
["AKSARAY","Aksaray",38.37,34.03],["AMASYA","Amasya",40.65,35.83],["ANKARA","Ankara",39.93,32.86],["ANTALYA","Antalya",36.89,30.71],
["ARDAHAN","Ardahan",41.11,42.70],["ARTVIN","Artvin",41.18,41.82],["AYDIN","Aydın",37.85,27.84],["BALIKESIR","Balıkesir",39.65,27.88],
["BARTIN","Bartın",41.63,32.34],["BATMAN","Batman",37.88,41.13],["BAYBURT","Bayburt",40.26,40.23],["BILECIK","Bilecik",40.14,29.98],
["BINGOL","Bingöl",38.88,40.50],["BITLIS","Bitlis",38.40,42.11],["BOLU","Bolu",40.74,31.61],["BURDUR","Burdur",37.72,30.29],
["BURSA","Bursa",40.19,29.06],["CANAKKALE","Çanakkale",40.15,26.41],["CANKIRI","Çankırı",40.60,33.62],["CORUM","Çorum",40.55,34.95],
["DENIZLI","Denizli",37.78,29.09],["DIYARBAKIR","Diyarbakır",37.91,40.24],["DUZCE","Düzce",40.84,31.16],["EDIRNE","Edirne",41.68,26.56],
["ELAZIG","Elazığ",38.68,39.22],["ERZINCAN","Erzincan",39.75,39.49],["ERZURUM","Erzurum",39.90,41.27],["ESKISEHIR","Eskişehir",39.78,30.52],
["GAZIANTEP","Gaziantep",37.07,37.38],["GIRESUN","Giresun",40.91,38.39],["GUMUSHANE","Gümüşhane",40.46,39.48],["HAKKARI","Hakkari",37.58,43.74],
["HATAY","Hatay",36.20,36.16],["IGDIR","Iğdır",39.92,44.04],["ISPARTA","Isparta",37.76,30.55],
["ISTANBUL (AVRUPA)","İstanbul (Avrupa)",41.04,28.86],["ISTANBUL (ANADOLU)","İstanbul (Anadolu)",40.99,29.18],
["IZMIR","İzmir",38.42,27.14],["KAHRAMANMARAS","Kahramanmaraş",37.58,36.94],["KARABUK","Karabük",41.20,32.62],["KARAMAN","Karaman",37.18,33.22],
["KARS","Kars",40.60,43.10],["KASTAMONU","Kastamonu",41.38,33.78],["KAYSERI","Kayseri",38.73,35.48],["KILIS","Kilis",36.72,37.12],
["KIRIKKALE","Kırıkkale",39.85,33.51],["KIRKLARELI","Kırklareli",41.73,27.22],["KIRSEHIR","Kırşehir",39.15,34.16],["KOCAELI","Kocaeli",40.77,29.92],
["KONYA","Konya",37.87,32.48],["KUTAHYA","Kütahya",39.42,29.98],["MALATYA","Malatya",38.35,38.31],["MANISA","Manisa",38.61,27.43],
["MARDIN","Mardin",37.31,40.74],["MERSIN","Mersin",36.81,34.64],["MUGLA","Muğla",37.22,28.36],["MUS","Muş",38.74,41.49],
["NEVSEHIR","Nevşehir",38.62,34.71],["NIGDE","Niğde",37.97,34.68],["ORDU","Ordu",40.98,37.88],["OSMANIYE","Osmaniye",37.07,36.25],
["RIZE","Rize",41.02,40.52],["SAKARYA","Sakarya",40.78,30.40],["SAMSUN","Samsun",41.29,36.33],["SANLIURFA","Şanlıurfa",37.16,38.79],
["SIIRT","Siirt",37.93,41.94],["SINOP","Sinop",42.03,35.15],["SIRNAK","Şırnak",37.52,42.46],["SIVAS","Sivas",39.75,37.02],
["TEKIRDAG","Tekirdağ",40.98,27.51],["TOKAT","Tokat",40.31,36.55],["TRABZON","Trabzon",41.00,39.72],["TUNCELI","Tunceli",39.11,39.55],
["USAK","Uşak",38.68,29.41],["VAN","Van",38.50,43.38],["YALOVA","Yalova",40.65,29.27],["YOZGAT","Yozgat",39.82,34.81],["ZONGULDAK","Zonguldak",41.45,31.79]];
const ILN=Object.fromEntries(IL.map(x=>[x[0],x[1]]));

/* il adı (OSM'den gelen) → anahtar */
const norm=s=>String(s||"").toLocaleUpperCase("tr-TR").replace(/İ/g,"I").replace(/Ş/g,"S").replace(/Ğ/g,"G").replace(/Ü/g,"U").replace(/Ö/g,"O").replace(/Ç/g,"C").replace(/ PROVINCE| ILI$/,"").trim();
const NAME2KEY={};IL.forEach(([k,n])=>{NAME2KEY[norm(n)]=k;});NAME2KEY["AFYONKARAHISAR"]="AFYON";
function bosphorusLon(lat){return 28.98+Math.max(0,Math.min(0.25,(lat-41.0)*0.55));}
function istSide(lat,lon){return lon<bosphorusLon(lat)?"ISTANBUL (AVRUPA)":"ISTANBUL (ANADOLU)";}
function keyFromName(state,lat,lon){
  const n=norm(state);
  if(n==="ISTANBUL")return istSide(lat,lon);
  return NAME2KEY[n]||nearestIl(lat,lon);
}
function hav(a,b,c,d){const R=6371,r=Math.PI/180,x=(c-a)*r,y=(d-b)*r;const h=Math.sin(x/2)**2+Math.cos(a*r)*Math.cos(c*r)*Math.sin(y/2)**2;return 2*R*Math.asin(Math.sqrt(h));}
function nearestIl(lat,lon){
  let best=null,bd=1e9;
  for(const [k,,a,b] of IL){const d=hav(lat,lon,a,b);if(d<bd){bd=d;best=k;}}
  if(best&&best.startsWith("ISTANBUL"))return istSide(lat,lon);
  return best;
}

/* köprüler: orta nokta koordinatları */
const BRIDGES=[
  {id:"fsm_15temmuz",name:"Fatih Sultan Mehmet Köprüsü",lat:41.0911,lon:29.0610,eastOnly:true},
  {id:"fsm_15temmuz",name:"15 Temmuz Şehitler Köprüsü",lat:41.0453,lon:29.0342,eastOnly:true},
  {id:"yss",name:"Yavuz Sultan Selim Köprüsü",lat:41.2027,lon:29.1115},
  {id:"osmangazi",name:"Osmangazi Köprüsü",lat:40.7531,lon:29.5146},
  {id:"canakkale_1915",name:"1915 Çanakkale Köprüsü",lat:40.3565,lon:26.6363}
];

const CLS_F=[1,1.6,2.2,2.8,3.4,0.45];
const DEF_CONS=[[7,6,9,15],[9,8,11,20],[22,20,26,0],[30,28,34,0],[35,33,40,0],[4.5,4,5,6]];
const FUEL_NAMES=["Benzin","Dizel","LPG","Elektrik"];
const PER_KM_OTHER=0.9; /* tabloda olmayan ücretli yol için TL/km tahmini */

let PRICES={fuel:{p:{}},tolls:{items:[]}};

/* --- kalıcı ayarlar --- */
const S_KEY="ym.app.v1";
const DEFAULT={round:false,avoid:false,vclass:0,ftype:0,cons:7,tank:50,reserve:15,kwh:10,pax:1,wear:0,food:0,park:0,hotel:0,other:0,
  places:{from:null,via:null,to:null},route:null};
let st=JSON.parse(JSON.stringify(DEFAULT));
try{const o=JSON.parse(localStorage.getItem(S_KEY)||"null");if(o)st=Object.assign(st,o);}catch(e){}
const save=()=>{try{localStorage.setItem(S_KEY,JSON.stringify(st));}catch(e){}};
const nums=["vclass","ftype","cons","tank","reserve","kwh","pax","wear","food","park","hotel","other"];
function fillForm(){$("round").checked=st.round;$("avoid").checked=st.avoid;nums.forEach(k=>$(k).value=st[k]);
  ["from","via","to"].forEach(k=>{const p=st.places[k];$(k).value=p?p.label:"";});}
function readForm(){st.round=$("round").checked;st.avoid=$("avoid").checked;
  nums.forEach(k=>{const v=parseFloat($(k).value);st[k]=isFinite(v)?v:0;});
  st.vclass=Math.min(5,Math.max(0,Math.round(st.vclass)));st.ftype=Math.min(3,Math.max(0,Math.round(st.ftype)));st.pax=Math.max(1,Math.round(st.pax||1));}

/* --- harita --- */
const map=L.map("map",{zoomControl:false,attributionControl:true}).setView([39.2,33.5],5);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"© OpenStreetMap"}).addTo(map);
L.control.zoom({position:"bottomright"}).addTo(map);
const markers={};let routeLine=null;
function mkIcon(k){return L.divIcon({className:"",html:`<div class="mk ${k}"></div>`,iconSize:[18,18],iconAnchor:[9,9]});}
function drawMarkers(){
  ["from","via","to"].forEach(k=>{
    const p=st.places[k];
    if(markers[k]){map.removeLayer(markers[k]);delete markers[k];}
    if(p){markers[k]=L.marker([p.lat,p.lon],{icon:mkIcon(k),draggable:true}).addTo(map);
      markers[k].on("dragend",async e=>{const ll=e.target.getLatLng();await setFromCoords(k,ll.lat,ll.lng);});}
  });
}
function fitAll(){
  const pts=["from","via","to"].map(k=>st.places[k]).filter(Boolean).map(p=>[p.lat,p.lon]);
  if(routeLine)map.fitBounds(routeLine.getBounds(),{padding:[24,24]});
  else if(pts.length>1)map.fitBounds(pts,{padding:[30,30]});
  else if(pts.length===1)map.setView(pts[0],13);
}

/* --- yer arama (Photon) --- */
let timers={},reqId={};
function setStatus(t){$("status").textContent=t;}
async function search(k){
  const q=$(k).value.trim(); const box=$(k+"-sugg");
  if(q.length<3){box.innerHTML="";return;}
  const coords=parseCoords(q);
  if(coords){box.innerHTML="";await setFromCoords(k,coords.lat,coords.lon);return;}
  const id=(reqId[k]=(reqId[k]||0)+1);
  box.innerHTML=`<div class="msg">Aranıyor…</div>`;
  try{
    const c=map.getCenter();
    const url=`${PHOTON}?q=${encodeURIComponent(q)}&limit=6&bbox=25.5,35.7,45,42.3&lat=${c.lat.toFixed(3)}&lon=${c.lng.toFixed(3)}`;
    const r=await fetch(url); const j=await r.json(); if(id!==reqId[k])return;
    const list=(j.features||[]).filter(f=>f.properties&&f.properties.country&&/T(ü|u)rk|Türkiye|Turkey/i.test(f.properties.country)).map(f=>{
      const pr=f.properties,[lon,lat]=f.geometry.coordinates;
      const name=pr.name||[pr.street,pr.housenumber].filter(Boolean).join(" ")||pr.district||pr.city;
      const detail=[pr.street&&pr.name?pr.street:"",pr.district||pr.locality,pr.county||pr.city,pr.state].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join(", ");
      return {label:name,detail,lat,lon,il:keyFromName(pr.state||pr.city,lat,lon)};
    });
    box._list=list;
    box.innerHTML=list.length?list.map((p,i)=>`<button type="button" data-i="${i}">${esc(p.label)}<small>${esc(p.detail)}</small></button>`).join(""):`<div class="msg">Bulunamadı. İlçe ya da il adını ekleyin veya haritadan seçin.</div>`;
  }catch(e){if(id===reqId[k])box.innerHTML=`<div class="msg">İnternet bağlantısı yok ya da arama servisine ulaşılamadı.</div>`;}
}
["from","via","to"].forEach(k=>{
  $(k).addEventListener("input",()=>{clearTimeout(timers[k]);if(!$(k).value.trim()){st.places[k]=null;$(k+"-sugg").innerHTML="";drawMarkers();save();return;}timers[k]=setTimeout(()=>search(k),450);});
  $(k).addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();clearTimeout(timers[k]);search(k);}});
  $(k+"-sugg").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;const p=$(k+"-sugg")._list[+b.dataset.i];choose(k,p);});
});
function choose(k,p){
  st.places[k]=p;$(k).value=p.label+(p.detail?", "+p.detail.split(",").slice(-2).join(",").trim():"");$(k+"-sugg").innerHTML="";
  st.route=null;if(routeLine){map.removeLayer(routeLine);routeLine=null;}
  drawMarkers();fitAll();save();render();
}
function parseCoords(q){
  const m=q.match(/@(-?\d{1,2}\.\d+),\s*(-?\d{1,3}\.\d+)/)||q.match(/[?&](?:q|query|ll)=(-?\d{1,2}\.\d+),\s*(-?\d{1,3}\.\d+)/)||q.match(/^\s*(-?\d{1,2}\.\d+)\s*[,;\s]\s*(-?\d{1,3}\.\d+)\s*$/);
  if(!m)return null;const lat=+m[1],lon=+m[2];return (lat>35&&lat<43&&lon>25&&lon<45.5)?{lat,lon}:null;
}
async function setFromCoords(k,lat,lon){
  let p={label:`${lat.toFixed(5)}, ${lon.toFixed(5)}`,detail:"",lat,lon,il:nearestIl(lat,lon)};
  try{
    const r=await fetch(`${NOMINATIM}?format=jsonv2&lat=${lat}&lon=${lon}&zoom=17&accept-language=tr`);
    const j=await r.json();const a=j.address||{};
    const name=j.name||[a.road,a.house_number].filter(Boolean).join(" ")||a.neighbourhood||a.suburb||p.label;
    p.label=name;p.detail=[a.suburb||a.neighbourhood,a.town||a.county||a.city_district,a.province||a.state].filter(Boolean).join(", ");
    p.il=keyFromName(a.province||a.state,lat,lon);
  }catch(e){}
  choose(k,p);
}

/* haritadan seçim */
let pickKey=null;
document.querySelector(".stops").addEventListener("click",e=>{
  const b=e.target.closest(".mini");if(!b)return;
  if(b.dataset.act==="map"){pickKey=b.dataset.k;$("pickText").textContent=`${({from:"Kalkış",via:"Ara durak",to:"Varış"})[pickKey]} için haritaya dokunun`;$("pickBanner").hidden=false;window.scrollTo({top:0,behavior:"smooth"});}
  if(b.dataset.act==="gps")useGps();
});
$("pickCancel").addEventListener("click",()=>{pickKey=null;$("pickBanner").hidden=true;});
map.on("click",e=>{if(!pickKey)return;const k=pickKey;pickKey=null;$("pickBanner").hidden=true;setFromCoords(k,e.latlng.lat,e.latlng.lng);});
function useGps(){
  if(!navigator.geolocation){setStatus("Bu cihazda konum alınamıyor.");return;}
  setStatus("Konum alınıyor…");
  navigator.geolocation.getCurrentPosition(p=>{setStatus("");setFromCoords("from",p.coords.latitude,p.coords.longitude);},
    err=>setStatus(err.code===1?"Konum izni verilmedi. Ayarlar > Uygulamalar > Yol Maliyeti > İzinler'den açabilirsiniz.":"Konum alınamadı; GPS'in açık olduğundan emin olun."),
    {enableHighAccuracy:true,timeout:15000,maximumAge:60000});
}

/* --- güzergah (OSRM) --- */
$("go").addEventListener("click",calcRoute);
async function calcRoute(){
  readForm();
  const P=st.places; if(!P.from||!P.to){setStatus("Kalkış ve varış noktasını seçin.");return;}
  const pts=[P.from,P.via,P.to].filter(Boolean);
  const coord=pts.map(p=>`${p.lon.toFixed(6)},${p.lat.toFixed(6)}`).join(";");
  $("go").disabled=true;setStatus("Güzergah hesaplanıyor…");
  try{
    let j=null,excluded=false;
    const base=`${OSRM}${coord}?overview=full&geometries=geojson&steps=true`;
    if(st.avoid){try{const r=await fetch(base+"&exclude=toll");j=await r.json();if(j.code!=="Ok")j=null;else excluded=true;}catch(e){j=null;}}
    if(!j){const r=await fetch(base);j=await r.json();}
    if(j.code!=="Ok"||!j.routes||!j.routes.length){setStatus("Bu noktalar arasında yol bulunamadı.");return;}
    const R=j.routes[0];
    st.route=analyse(R,pts);
    if(st.avoid&&!excluded&&st.route.tolls.length)st.route.note="Ücretsiz alternatif bulunamadı; ücretli yollar dahil.";
    setStatus("");save();drawRoute();render();
  }catch(e){setStatus("İnternet bağlantısı yok ya da yol servisine ulaşılamadı. Tekrar deneyin.");}
  finally{$("go").disabled=false;}
}
function drawRoute(){
  if(routeLine){map.removeLayer(routeLine);routeLine=null;}
  if(!st.route||!st.route.geo)return;
  routeLine=L.polyline(st.route.geo,{color:getComputedStyle(document.documentElement).getPropertyValue("--route").trim()||"#0a6b47",weight:5,opacity:.85}).addTo(map);
  fitAll();
}
function analyse(R,pts){
  const coords=R.geometry.coordinates.map(([lon,lat])=>[lat,lon]);
  /* kümülatif km, OSRM toplamına ölçeklenir */
  const cum=[0];for(let i=1;i<coords.length;i++)cum.push(cum[i-1]+hav(coords[i-1][0],coords[i-1][1],coords[i][0],coords[i][1]));
  const totKm=R.distance/1000, sc=cum[cum.length-1]>0?totKm/cum[cum.length-1]:1; for(let i=0;i<cum.length;i++)cum[i]*=sc;
  /* geçilen iller: ~3 km'de bir örnekle, il değişimlerini kaydet */
  const way=[{il:pts[0].il||nearestIl(coords[0][0],coords[0][1]),km:0}];let lastKm=-99,cur=way[0].il,enter=0,candidate=null,candKm=0;
  for(let i=0;i<coords.length;i++){
    if(cum[i]-lastKm<3&&i!==coords.length-1)continue;lastKm=cum[i];
    const il=nearestIl(coords[i][0],coords[i][1]);
    if(il!==cur){ if(candidate===il&&cum[i]-candKm>=8){way.push({il,km:Math.round(candKm+5)});cur=il;candidate=null;} else if(candidate!==il){candidate=il;candKm=cum[i];} }
    else candidate=null;
  }
  const endIl=pts[pts.length-1].il||nearestIl(coords[coords.length-1][0],coords[coords.length-1][1]);
  if(way[way.length-1].il!==endIl)way.push({il:endIl,km:Math.max(way[way.length-1].km,Math.round(totKm-5))});
  way.push({il:endIl,km:totKm});
  const T=detectTolls(R,coords,cum,totKm);
  const p0=pts[0],p1=pts[pts.length-1];
  return {title:`${p0.label} → ${p1.label}`,km:Math.round(totKm),minutes:Math.round(R.duration/60),geo:coords.filter((_,i)=>i%Math.max(1,Math.floor(coords.length/1500))===0||i===coords.length-1),
    waypoints:way,tolls:T.go,tollsBack:T.back,note:T.note};
}

/* --- ücretli yol tespiti: KGM giriş-çıkış gişe tabloları --- */
function fastKm(a,b,c,d){const x=(d-b)*Math.cos((a+c)*Math.PI/360),y=c-a;return Math.sqrt(x*x+y*y)*111.2;}
function nearestOnRoute(coords,cum,lat,lon,bbox){
  let bd=1e9,bk=0;
  for(let i=0;i<coords.length;i++){const p=coords[i];if(Math.abs(p[0]-lat)>0.05||Math.abs(p[1]-lon)>0.07)continue;const d=fastKm(p[0],p[1],lat,lon);if(d<bd){bd=d;bk=cum[i];}}
  return {d:bd,km:bk};
}
function tollIntervals(R){
  const toll=[],mw=[],ref={};let pos=0;
  const add=(arr,a,b)=>{const l=arr[arr.length-1];if(l&&a-l[1]<1.5)l[1]=b;else arr.push([a,b]);};
  (R.legs||[]).forEach(leg=>(leg.steps||[]).forEach(s=>{
    const d=(s.distance||0)/1000;
    const cls=[].concat(...(s.intersections||[]).map(x=>x.classes||[]));
    const isToll=cls.includes("toll");
    const refs=[...String(s.ref||"").matchAll(/\bO-?\s?(\d{1,2})\b/gi)].map(m=>+m[1]);
    const isMw=isToll||cls.includes("motorway")||refs.length>0||/otoyol/i.test(String(s.name||""));
    if(d>0){if(isToll)add(toll,pos,pos+d);if(isMw)add(mw,pos,pos+d);refs.forEach(r=>add(ref[r]||(ref[r]=[]),pos,pos+d));}
    pos+=d;
  }));
  return {toll,mw,ref};
}
/* her KGM tablosunun yol numarası (OSM ref) */
const SYS_REF={anadolu_otoyolu:[4],avrupa_otoyolu:[3],kmo_avrupa:[7],kuzey_cevre_yss:[7],kmo_anadolu:[7],gebze_bursa:[5],bursa_izmir:[5],malkara_canakkale:[6],
  ankara_nigde:[21],nigde_mersin:[21,51],adana_gaziantep:[52,53],gaziantep_sanliurfa:[54],izmir_aydin:[31],aydin_denizli:[31],izmir_cesme:[32],menemen_candarli:[33]};
function inIntervals(iv,km,m){return iv.some(([a,b])=>km>=a-m&&km<=b+m);}
function sysPrice(sys,a,b,c){
  const M=sys.m&&sys.m[String(c+1)];if(!M)return null;
  let v=M[a]&&M[a][b];if(v==null)v=M[b]&&M[b][a];
  return v==null?null:v;
}
function detectTolls(R,coords,cum,totKm){
  const IV=tollIntervals(R),iv=IV.toll,hasTollTags=iv.length>0,mw=IV.mw;
  const lats=coords.map(p=>p[0]),lons=coords.map(p=>p[1]);
  const bb=[Math.min(...lats)-0.05,Math.max(...lats)+0.05,Math.min(...lons)-0.07,Math.max(...lons)+0.07];
  const go=[],back=[],covered=[];
  const systems=(PRICES.tolls&&PRICES.tolls.systems)||{};
  const bridgeIncl={go:{},back:{}};
  for(const [sid,sys] of Object.entries(systems)){
    const refs=SYS_REF[sid]||[];
    let zones=[].concat(...refs.map(r=>IV.ref[r]||[]));
    const byRef=zones.length>0;
    if(!byRef){ if(refs.length)continue; zones=hasTollTags?iv:mw; }  /* yol bu otoyolu hiç kullanmıyor */
    if(!zones.length)continue;
    const hits=[];
    (sys.pos||[]).forEach((p,gi)=>{
      if(!p||p[0]<bb[0]||p[0]>bb[1]||p[1]<bb[2]||p[1]>bb[3])return;
      const n=nearestOnRoute(coords,cum,p[0],p[1]);
      if(n.d<(byRef?1.2:0.6))hits.push({gi,km:n.km,d:n.d});
    });
    if(hits.length<2)continue;
    /* her kesintisiz otoyol bölümünde ilk gişe giriş, son gişe çıkış */
    zones.slice().sort((x,y)=>x[0]-y[0]).forEach(([za,zb])=>{
      const H=hits.filter(h=>h.km>=za-1.5&&h.km<=zb+1.5).sort((x,y)=>x.km-y.km);
      if(H.length<2)return;
      const first=H[0].km,last=H[H.length-1].km;
      if(last-first<2)return;
      const A=H.filter(h=>h.km-first<0.5).map(h=>h.gi),B=H.filter(h=>last-h.km<0.5).map(h=>h.gi);
      let best=null;
      for(const a of A)for(const b of B){if(a===b)continue;const v=sysPrice(sys,a,b,0);if(v!=null&&(!best||v<best.v))best={a,b,v};}
      if(!best)return;
      const span=Math.round(last-first);
      const mk=(a,b)=>({sys:sid,a,b,label:`${sys.name}`,sub:`${sys.gates[a]} → ${sys.gates[b]}`,km:span,on:true});
      go.push(mk(best.a,best.b));back.push(mk(best.b,best.a));
      covered.push([first,last]);
      if(sys.bridge){
        if(sys.bridgeGate==null){bridgeIncl.go[sys.bridge]=true;bridgeIncl.back[sys.bridge]=true;}
        else{ if(best.b===sys.bridgeGate)bridgeIncl.go[sys.bridge]=true; if(best.a===sys.bridgeGate)bridgeIncl.back[sys.bridge]=true; }
      }
    });
  }
  /* köprüler */
  for(const b of BRIDGES){
    let bi=-1,bd=1e9;for(let i=0;i<coords.length;i++){const d=fastKm(coords[i][0],coords[i][1],b.lat,b.lon);if(d<bd){bd=d;bi=i;}}
    if(bd>0.6)continue;
    const a=coords[Math.max(0,bi-15)],c=coords[Math.min(coords.length-1,bi+15)],east=c[1]>a[1];
    const item={id:b.id,label:b.name+(b.eastOnly?" (Avrupa→Asya)":""),frac:1,on:true};
    covered.push([cum[bi]-2,cum[bi]+2]);
    if(b.eastOnly){ if(east)go.unshift(item);else back.unshift({...item}); continue; }
    if(!bridgeIncl.go[b.id])go.unshift(item);
    if(!bridgeIncl.back[b.id])back.unshift({...item});
  }
  /* tablolarla karşılanmayan ücretli kısım */
  let other=0;
  for(const [a,b] of iv){let len=b-a;for(const [c,d] of covered){const o=Math.max(0,Math.min(b,d+1.5)-Math.max(a,c-1.5));len-=o;}if(len>3)other+=len;}
  let note="";
  if(other>3){const t={id:"other",label:"Diğer ücretli yol",amount1:Math.round(other*PER_KM_OTHER),frac:1,on:true,km:Math.round(other)};go.push(t);back.push({...t});note="Bir kısım ücretli yol KGM tablolarında eşleşmedi; o kısım tahmini.";}
  return {go,back,note};
}

/* --- ücret ve yakıt hesabı --- */
function tollItem(id){return (PRICES.tolls.items||[]).find(t=>t.id===id);}
function clsPrice(it){const c=it.c||[];let v=c[st.vclass],est=false;if(v==null){v=(c[0]||0)*CLS_F[st.vclass];est=true;}return {v,est};}
function tollAmount(t){
  if(t.custom!=null)return {amt:t.custom,est:false};
  if(t.id==="other")return {amt:(t.amount1||0)*CLS_F[st.vclass],est:true};
  if(t.sys){
    const sys=((PRICES.tolls&&PRICES.tolls.systems)||{})[t.sys];if(!sys)return {amt:0,est:true};
    let v=sysPrice(sys,t.a,t.b,st.vclass),est=false;
    if(v==null){v=(sysPrice(sys,t.a,t.b,0)||0)*CLS_F[st.vclass];est=true;}
    return {amt:v,est};
  }
  const it=tollItem(t.id);if(!it)return {amt:0,est:true};
  const a=clsPrice(it);
  if(t.combo){ /* köprü tam + otoyolun kalan kısmı oransal */
    const br=tollItem(t.combo.bridge);const b=br?clsPrice(br):{v:0,est:true};
    if(t.combo.frac>=1)return {amt:Math.max(a.v,b.v),est:a.est||!!it.est};
    return {amt:b.v+Math.max(0,a.v-b.v)*t.combo.frac,est:true};
  }
  const f=t.frac==null?1:t.frac;
  return {amt:a.v*f,est:a.est||f<1||!!it.est};
}
function fuelPrice(key,ft){
  const p=PRICES.fuel.p||{};let row=p[key];
  if(!row){const v=Object.values(p);return v.length?v.reduce((a,r)=>a+r[ft],0)/v.length:0;}
  return row[ft];
}
function simulate(points){
  const r=st.cons/100,C=Math.max(5,st.tank),reserve=C*Math.min(.6,Math.max(0,st.reserve/100)),ft=st.ftype;
  const buys=[{il:points[0].il,L:C,price:fuelPrice(points[0].il,ft),start:true,km:0}];let fuel=C;
  for(let i=0;i<points.length-1;i++){
    let need=Math.max(0,points[i+1].km-points[i].km)*r;
    if(i>0&&fuel-need<reserve&&C-fuel>0.5){buys.push({il:points[i].il,L:C-fuel,price:fuelPrice(points[i].il,ft),km:points[i].km});fuel=C;}
    let g=0;while(need>fuel-reserve+1e-9&&g++<50){need-=(fuel-reserve);buys.push({il:points[i].il,L:C-reserve,price:fuelPrice(points[i].il,ft),km:points[i].km,mid:true});fuel=C;}
    fuel-=need;
  }
  const paid=buys.reduce((a,b)=>a+b.L*b.price,0);
  let left=Math.max(0,fuel),leftCost=0;for(let j=buys.length-1;j>=0&&left>1e-9;j--){const t=Math.min(left,buys[j].L);leftCost+=t*buys[j].price;left-=t;}
  return {buys,paid,used:paid-leftCost,usedL:points[points.length-1].km*r,leftL:Math.max(0,fuel)};
}
function tripPoints(){
  const w=(st.route&&st.route.waypoints||[]).slice().sort((a,b)=>a.km-b.km);
  if(!w.length||!st.round)return w;
  const T=w[w.length-1].km;return w.concat(w.slice(0,-1).reverse().map(p=>({il:p.il,km:T+(T-p.km)})));
}

/* --- çizim --- */
function render(){
  save();
  const R=st.route,elec=st.ftype===3;
  $("tankF").hidden=elec;$("resF").hidden=elec;$("kwhF").hidden=!elec;
  $("consLbl").textContent=elec?"Tüketim (kWh/100 km)":"Tüketim (L/100 km)";
  $("vehSum").textContent=`${["Otomobil","Minibüs","3 dingil","4-5 dingil","6+ dingil","Motosiklet"][st.vclass]} · ${FUEL_NAMES[st.ftype]} · ${st.cons}`;
  const extras=st.food+st.park+st.hotel+st.other;
  $("extSum").textContent=extras>0?TL(extras):(st.pax>1?`${st.pax} kişi`:"Yok");
  const opts=(PRICES.tolls.items||[]).map(t=>`<option value="${esc(t.id)}">${esc(t.name)}</option>`).join("");
  const cur=$("addSel").value;$("addSel").innerHTML=opts+`<option value="__custom">Diğer (tutarı yazın)</option>`;if(cur)$("addSel").value=cur;
  if(!R){$("routeTitle").textContent="Güzergah seçin";$("routeFacts").innerHTML=`<span>Kalkış ve varışı seçip hesaplayın.</span>`;
    ["tot","totSub","bar","legend","fuelList","fuelNote","tollList"].forEach(id=>$(id).innerHTML="");$("tot").textContent="—";return;}
  const km=st.round?R.km*2:R.km,mins=R.minutes*(st.round?2:1);
  $("routeTitle").textContent=R.title+(st.round?" ↔":"");
  $("routeFacts").innerHTML=`<span><b class="num">${km.toLocaleString("tr-TR")} km</b></span><span><b class="num">${Math.floor(mins/60)} sa ${mins%60} dk</b> sürüş</span>${R.note?`<span>${esc(R.note)}</span>`:""}`;
  let fuelCost=0;
  if(elec){const k=km*st.cons/100;fuelCost=k*st.kwh;
    $("fuelList").innerHTML=`<div class="li"><span class="kmtag">${km}</span><div>Toplam enerji<div class="meta">${k.toFixed(1)} kWh × ${TL2(st.kwh)}</div></div><div class="amt">${TL(fuelCost)}</div></div>`;
    $("fuelNote").textContent="Elektrikte il bazlı fiyat yok; girdiğiniz şarj fiyatı kullanıldı.";}
  else{const sim=simulate(tripPoints());fuelCost=sim.used;
    $("fuelList").innerHTML=sim.buys.map(b=>`<div class="li"><span class="kmtag">${Math.round(b.km)}</span><div>${b.start?"Çıkış · dolu depo":(b.mid?"Yol üstü dolum":"Dolum")} · ${esc(ILN[b.il]||b.il)}<div class="meta">${b.L.toFixed(1)} L × ${TL2(b.price)}</div></div><div class="amt">${TL(b.L*b.price)}</div></div>`).join("");
    $("fuelNote").textContent=`${sim.usedL.toFixed(1)} L ${FUEL_NAMES[st.ftype].toLowerCase()} yakılır; yolculuğa düşen pay ${TL(sim.used)}. Varışta depoda ${sim.leftL.toFixed(0)} L kalır, pompada ödenen toplam ${TL(sim.paid)}.`;}
  const groups=[["Gidiş",R.tolls||[]]];if(st.round)groups.push(["Dönüş",R.tollsBack||[]]);
  let tollCost=0,th="";
  groups.forEach(([g,list],gi)=>list.forEach((t,ti)=>{
    const a=tollAmount(t);if(t.on!==false)tollCost+=a.amt;
    th+=`<label class="li"><input type="checkbox" data-g="${gi}" data-i="${ti}" ${t.on!==false?"checked":""}><div>${esc(t.label)}<div class="meta">${t.sub?esc(t.sub)+" · ":""}${g}${t.km?` · ${t.km} km`:""} · ${a.est?'<span class="badge">tahmini</span>':'<span class="badge ok">KGM tarifesi</span>'}</div></div><div class="amt">${TL(a.amt)}</div></label>`;
  }));
  $("tollList").innerHTML=th||`<p class="note">Bu güzergahta ücretli geçiş bulunmadı.</p>`;
  const wear=km*st.wear,total=fuelCost+tollCost+wear+extras;
  $("tot").textContent=TL(total);
  $("totSub").innerHTML=(st.pax>1?`Kişi başı <b>${TL(total/st.pax)}</b><br>`:"")+(km?`${TL2(total/km)}/km`:"");
  const parts=[["Yakıt",fuelCost,"--fuel"],["Geçiş ücretleri",tollCost,"--toll"],["Ek masraflar",extras,"--extra"],["Aşınma, bakım",wear,"--wear"]];
  $("bar").innerHTML=parts.filter(p=>p[1]>0).map(p=>`<i style="width:${total?p[1]/total*100:0}%;background:var(${p[2]})"></i>`).join("");
  $("legend").innerHTML=parts.map(p=>`<div class="lrow"><span class="k"><span class="dot" style="background:var(${p[2]})"></span>${p[0]}</span><span class="v">${TL(p[1])}</span></div>`).join("");
}
$("tollList").addEventListener("change",e=>{const cb=e.target;if(!cb.dataset||cb.dataset.g==null)return;const list=cb.dataset.g==="0"?st.route.tolls:st.route.tollsBack;list[+cb.dataset.i].on=cb.checked;render();});
$("addBtn").addEventListener("click",()=>{
  if(!st.route)return;const id=$("addSel").value,amt=parseFloat($("addAmt").value),it=tollItem(id);
  const t={id:id==="__custom"?"custom":id,label:it?it.name:"Ek geçiş",frac:1,on:true};if(id==="__custom"||isFinite(amt))t.custom=isFinite(amt)?amt:0;
  st.route.tolls.push(t);st.route.tollsBack.push({...t});$("addAmt").value="";render();
});
["vclass","ftype"].forEach(id=>$(id).addEventListener("change",()=>{readForm();const d=DEF_CONS[st.vclass][st.ftype];if(!d){st.ftype=0;$("ftype").value=0;}st.cons=DEF_CONS[st.vclass][st.ftype];$("cons").value=st.cons;render();}));
document.querySelectorAll("#vehPanel input,#extPanel input,#round,#avoid").forEach(el=>el.addEventListener("input",()=>{readForm();render();}));
$("round").addEventListener("change",()=>{readForm();render();});

/* --- fiyatlar: GitHub'daki günlük güncel kopya, yoksa son kayıtlı, yoksa APK içindeki --- */
function fmtDate(s){try{return new Date(s).toLocaleString("tr-TR",{day:"numeric",month:"long",hour:"2-digit",minute:"2-digit"});}catch(e){return s||"";}}
function showFresh(src){const f=PRICES.fuel,t=PRICES.tolls;$("freshness").textContent=`Yakıt fiyatları: ${fmtDate(f.updatedAt)} · Geçiş ücretleri: ${fmtDate(t.updatedAt)}${src?" · "+src:""}`;}
async function getJSON(u){const r=await fetch(u,{cache:"no-store"});if(!r.ok)throw new Error(r.status);return r.json();}
async function loadPrices(force){
  let src="";
  try{const c=JSON.parse(localStorage.getItem("ym.prices")||"null");if(c&&c.fuel&&c.tolls){PRICES=c;src="kayıtlı kopya";}}catch(e){}
  if(!PRICES.fuel.updatedAt){try{PRICES={fuel:await getJSON("data/fuel.json"),tolls:await getJSON("data/tolls.json")};src="uygulama içi kopya";}catch(e){}}
  render();showFresh(src);
  try{
    const [f,t]=await Promise.all([getJSON(REMOTE+"fuel.json?t="+Date.now()),getJSON(REMOTE+"tolls.json?t="+Date.now())]);
    if(f&&f.p&&t&&t.items){PRICES={fuel:f,tolls:t};try{localStorage.setItem("ym.prices",JSON.stringify(PRICES));}catch(e){}render();showFresh("güncel");}
  }catch(e){if(force)showFresh("güncellenemedi, internet bağlantısını kontrol edin");}
}
$("refresh").addEventListener("click",()=>loadPrices(true));

fillForm();drawMarkers();drawRoute();if(!st.route)fitAll();loadPrices(false);render();
})();
