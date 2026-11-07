/* RunTrack service worker. File update karo to V ka number badha do. */
const V="runtrack-v4",SHELL=["./","index.html","manifest.webmanifest","icons/icon-192.png","icons/icon-512.png"],
CDN=["https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js","https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(async c=>{await c.addAll(SHELL);await Promise.all(CDN.map(u=>c.add(u).catch(()=>{})))}).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V&&x!=="tiles-v1").map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
 const r=e.request;if(r.method!=="GET")return;const h=new URL(r.url).hostname;
 if(r.mode==="navigate")return e.respondWith(netFirst(r));
 if(h==="tile.openstreetmap.org")return e.respondWith(swr(r,"tiles-v1",400));
 if(h===location.hostname||h==="cdnjs.cloudflare.com"||h==="fonts.googleapis.com"||h==="fonts.gstatic.com")e.respondWith(swr(r,V,0,r.mode==="navigate"));
});
async function swr(r,name,max,nav){
 const c=await caches.open(name),hit=await c.match(r,{ignoreSearch:!!nav});
 const net=fetch(r).then(x=>{if(x&&(x.ok||x.type==="opaque")){c.put(r,x.clone());if(max)trim(c,max)}return x}).catch(()=>null);
 if(hit)return hit;const x=await net;if(x)return x;
 return nav?(await c.match("index.html")||Response.error()):Response.error()}
async function trim(c,max){const k=await c.keys();if(k.length>max)await c.delete(k[0])}
async function netFirst(r){const c=await caches.open(V);try{const x=await fetch(r);if(x.ok)c.put(r,x.clone());return x}catch(e){return(await c.match(r,{ignoreSearch:true}))||(await c.match("index.html"))||Response.error()}}
