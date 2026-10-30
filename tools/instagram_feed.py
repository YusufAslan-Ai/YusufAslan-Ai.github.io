"""Behold JSON akışından son Instagram gönderilerini alır, görselleri siteye kaydeder.

GitHub Actions günde bir kez çalıştırır (.github/workflows/instagram.yml).
Çıktı: assets/instagram/feed.json + assets/instagram/<id>.jpg
Böylece site her ziyaretçide Behold'a istek atmaz (ücretsiz plan sınırına takılmaz).
"""
import json, os, sys, urllib.request

FEED_URL = "https://feeds.behold.so/ZFwJEwKGyVTRV9wy2tl9"
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "assets", "instagram")
MAX_POSTS = 6

def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "yusufaslann.com feed sync"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()

def main():
    data = json.loads(get(FEED_URL))
    posts = (data.get("posts") or [])[:MAX_POSTS]
    if not posts:
        print("Akış boş geldi, mevcut dosyalar korunuyor."); return
    os.makedirs(OUT_DIR, exist_ok=True)
    out, keep = [], set()
    for p in posts:
        size = (p.get("sizes") or {}).get("medium") or {}
        src = size.get("mediaUrl") or p.get("thumbnailUrl") or p.get("mediaUrl")
        if not src:
            continue
        name = f"{p['id']}.jpg"
        path = os.path.join(OUT_DIR, name)
        if not os.path.exists(path):
            with open(path, "wb") as f:
                f.write(get(src))
        keep.add(name)
        caption = (p.get("prunedCaption") or p.get("caption") or "").strip()
        first_line = caption.split("\n")[0][:140]
        out.append({
            "id": p["id"],
            "url": p.get("permalink"),
            "image": f"/assets/instagram/{name}",
            "type": "reel" if p.get("mediaType") == "VIDEO" else ("carousel" if p.get("mediaType") == "CAROUSEL_ALBUM" else "image"),
            "alt": first_line,
            "date": p.get("timestamp"),
        })
    for f in os.listdir(OUT_DIR):
        if f.endswith(".jpg") and f not in keep:
            os.remove(os.path.join(OUT_DIR, f))
    with open(os.path.join(OUT_DIR, "feed.json"), "w", encoding="utf-8") as f:
        json.dump({"username": data.get("username") or "yusufaslancom", "posts": out}, f, ensure_ascii=False, indent=1)
    print(f"{len(out)} gönderi yazıldı.")

if __name__ == "__main__":
    sys.exit(main())
