// app.js
const cfg = window.MUSEUM_CONFIG || { title: "My Drawing Museum", subtitle: "" };
let items = Array.isArray(window.MUSEUM_ITEMS) ? window.MUSEUM_ITEMS.slice() : [];

const grid = document.getElementById("grid");
const search = document.getElementById("search");
const sort = document.getElementById("sort");

document.getElementById("siteTitle").textContent = cfg.title || "My Drawing Museum";
document.getElementById("siteSubtitle").textContent = cfg.subtitle || "";
document.getElementById("year").textContent = new Date().getFullYear();

const lightbox = document.getElementById("lightbox");
const lbClose = document.getElementById("lbClose");
const lbImg = document.getElementById("lbImg");
const lbTitle = document.getElementById("lbTitle");
const lbDesc = document.getElementById("lbDesc");
const lbMeta = document.getElementById("lbMeta");

function esc(s){ return (s ?? "").toString(); }

function openLightbox(item){
  lbImg.src = item.image;
  lbImg.alt = item.title || "Artwork";
  lbTitle.textContent = item.title || "Untitled";
  lbDesc.textContent = item.description || "";
  const metaBits = [];
  if (item.date) metaBits.push(item.date);
  if (Array.isArray(item.tags) && item.tags.length) metaBits.push(item.tags.join(" • "));
  lbMeta.textContent = metaBits.join("  —  ");

  lightbox.classList.add("show");
  lightbox.setAttribute("aria-hidden", "false");
}

function closeLightbox(){
  lightbox.classList.remove("show");
  lightbox.setAttribute("aria-hidden", "true");
  lbImg.src = "";
}

lbClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeLightbox();
});

function matches(item, q){
  if (!q) return true;
  const hay = `${item.title ?? ""} ${item.description ?? ""} ${(item.tags || []).join(" ")}`.toLowerCase();
  return hay.includes(q.toLowerCase());
}

function sortItems(list, mode){
  const byDate = (a,b) => (a.date || "").localeCompare(b.date || "");
  const byTitle = (a,b) => (a.title || "").localeCompare(b.title || "");
  const sorted = list.slice();

  if (mode === "oldest") sorted.sort(byDate);
  else if (mode === "newest") sorted.sort((a,b) => -byDate(a,b));
  else if (mode === "za") sorted.sort((a,b) => -byTitle(a,b));
  else sorted.sort(byTitle);

  return sorted;
}

function render(){
  const q = search.value.trim();
  const filtered = items.filter(it => matches(it, q));
  const sorted = sortItems(filtered, sort.value);

  grid.innerHTML = "";

  if (sorted.length === 0){
    const empty = document.createElement("div");
    empty.style.gridColumn = "1 / -1";
    empty.style.padding = "18px";
    empty.style.color = "rgba(232,241,255,.7)";
    empty.textContent = "No matches. Try a different search.";
    grid.appendChild(empty);
    return;
  }

  for (const item of sorted){
    const card = document.createElement("article");
    card.className = "card";
    card.tabIndex = 0;

    const img = document.createElement("img");
    img.className = "thumb";
    img.loading = "lazy";
    img.src = esc(item.image);
    img.alt = esc(item.title || "Artwork");
    card.appendChild(img);

    const body = document.createElement("div");
    body.className = "cardBody";

    const h = document.createElement("h3");
    h.className = "cardTitle";
    h.textContent = item.title || "Untitled";
    body.appendChild(h);

    const d = document.createElement("p");
    d.className = "cardDesc";
    d.textContent = item.description || "";
    body.appendChild(d);

    const meta = document.createElement("div");
    meta.className = "meta";

    if (item.date){
      const t = document.createElement("span");
      t.className = "tag";
      t.textContent = item.date;
      meta.appendChild(t);
    }

    if (Array.isArray(item.tags)){
      for (const tag of item.tags.slice(0, 4)){
        const s = document.createElement("span");
        s.className = "tag";
        s.textContent = tag;
        meta.appendChild(s);
      }
    }

    body.appendChild(meta);
    card.appendChild(body);

    const open = () => openLightbox(item);
    card.addEventListener("click", open);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") open();
    });

    grid.appendChild(card);
  }
}

search.addEventListener("input", render);
sort.addEventListener("change", render);

render();
