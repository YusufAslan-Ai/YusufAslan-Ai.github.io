(function () {
  var grid = document.querySelector("[data-ig-grid]");
  if (!grid) return;
  var en = document.documentElement.lang === "en" || grid.getAttribute("data-lang") === "en";
  var label = { reel: "Reels", carousel: en ? "Carousel" : "Kaydırmalı", image: en ? "Post" : "Gönderi" };
  fetch("/assets/instagram/feed.json", { cache: "no-cache" })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) {
      if (!d || !d.posts || !d.posts.length) return;
      grid.innerHTML = "";
      d.posts.slice(0, 6).forEach(function (p) {
        var a = document.createElement("a");
        a.className = "ig-item ig-" + p.type;
        a.href = p.url; a.target = "_blank"; a.rel = "noopener";
        a.setAttribute("aria-label", (label[p.type] || "") + ": " + (p.alt || "Instagram"));
        var img = document.createElement("img");
        img.src = p.image; img.alt = p.alt || ""; img.loading = "lazy"; img.decoding = "async";
        a.appendChild(img);
        var badge = document.createElement("span");
        badge.className = "ig-badge"; badge.setAttribute("aria-hidden", "true");
        badge.innerHTML = p.type === "reel"
          ? '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg>'
          : p.type === "carousel"
          ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="7" y="7" width="13" height="13" rx="2"/><path d="M4 16V6a2 2 0 0 1 2-2h10"/></svg>'
          : "";
        if (badge.innerHTML) a.appendChild(badge);
        grid.appendChild(a);
      });
      grid.closest(".ig-band").classList.add("ig-ready");
    })
    .catch(function () {});
})();
