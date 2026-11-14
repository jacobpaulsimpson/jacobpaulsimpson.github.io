const STATUS_LABEL = {
  "published": "Published",
  "accepted": "Accepted",
  "under-review": "Under review",
  "preprint": "Preprint",
  "in-preparation": "In preparation",
};
const LINK_ICON = {
  "IEEE Xplore": "ai ai-ieee",
  arXiv: "ai ai-arxiv",
  PDF: "fa-solid fa-file-pdf",
  Slides: "fa-solid fa-person-chalkboard",
  Poster: "fa-solid fa-thumbtack",
  Code: "fa-brands fa-github",
  Paper: "fa-solid fa-file-lines",
};
const CACHE_HOURS = 12;
const LOCATION_SEPARATOR = ' <span class="pub-separator" aria-hidden="true">|</span> ';

function escapeHtml(s) {
  return s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

function renderAuthors(authors) {
  return authors
    .map(a => (a.startsWith("*") ? `<span class="me">${escapeHtml(a.slice(1))}</span>` : escapeHtml(a)))
    .join(", ");
}

function citeLabel(n) {
  return `<i class="fa-solid fa-quote-right"></i> ${n} citation${n === 1 ? "" : "s"}`;
}

function renderVenueImage(item) {
  if (!item.image) return "";
  const tone = ["dark", "photo"].includes(item.imageTone) ? ` pub-image--${item.imageTone}` : "";
  const year = item.imageYear ? `<span class="pub-image-year">${escapeHtml(String(item.imageYear))}</span>` : "";
  const alt = escapeHtml(item.imageAlt || item.venue || item.event || "Venue logo");
  // The viewBox excludes only the original file's blank margins, keeping the artwork intact.
  const artwork = item.imageViewBox
    ? `<svg class="pub-logo" viewBox="${escapeHtml(item.imageViewBox)}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${alt}">
        <image href="${escapeHtml(item.image)}" width="${item.imageWidth}" height="${item.imageHeight}"></image>
      </svg>`
    : `<img class="pub-logo" src="${escapeHtml(item.image)}" alt="${alt}" loading="lazy" decoding="async">`;
  return `<div class="pub-image${tone}">
    <div class="pub-logo-lockup${year ? " pub-logo-lockup--year" : ""}">${artwork}${year}</div>
  </div>`;
}

function renderPublications(list) {
  let lastYear = null;
  PUBLICATIONS.forEach((p, i) => {
    if (p.year !== lastYear) {
      const y = document.createElement("div");
      y.className = "year-label";
      y.dataset.year = p.year;
      y.textContent = p.year;
      list.appendChild(y);
      lastYear = p.year;
    }
    const links = Object.entries(p.links || {})
      .filter(([, url]) => url)
      .map(([name, url]) => `<a class="pub-link" href="${/^https?:/.test(url) ? url
          : `pdf.html?file=${encodeURIComponent(url)}&title=${encodeURIComponent(`${name} — ${p.title}`)}`}" target="_blank" rel="noopener">
          <i class="${LINK_ICON[name] || "fa-solid fa-link"}"></i> ${name}</a>`)
      .join("");
    const venue = p.venue ? `<em>${escapeHtml(p.venue)}</em>` : "";
    const locationDate = [p.location, p.year].filter(Boolean).map(v => escapeHtml(String(v))).join(LOCATION_SEPARATOR);
    const el = document.createElement("article");
    el.className = p.image ? "pub pub-with-image" : "pub";
    el.dataset.year = p.year;
    el.dataset.type = p.type || "";
    el.dataset.search = [p.title, p.venue, p.location, ...p.authors].join(" ").toLowerCase();
    el.innerHTML = `
      ${renderVenueImage(p)}
      <div class="pub-content">
      <div class="pub-top">
        <span class="badge ${p.status}">${STATUS_LABEL[p.status] || p.status}</span>
        <span class="cites" id="cites-${i}" title="Citations (INSPIRE-HEP)">${citeLabel(p.citations ?? 0)}</span>
      </div>
      <h3 class="pub-title">${escapeHtml(p.title)}</h3>
      <p class="pub-authors">${renderAuthors(p.authors)}</p>
      <p class="pub-venue">${venue}<span class="pub-location-date">${locationDate}</span></p>
      <div class="pub-links">${links}</div>
      </div>`;
    list.appendChild(el);
  });
}

function initFilters(list, years) {
  const search = document.getElementById("pub-search");
  const year = document.getElementById("pub-year");
  const typeButtons = document.querySelectorAll(".type-filter button");
  if (!search) return;
  let type = "";

  [...new Set(years)].sort((a, b) => b - a)
    .forEach(y => year.insertAdjacentHTML("beforeend", `<option value="${y}">${y}</option>`));

  function apply() {
    const q = search.value.trim().toLowerCase();
    let shown = 0;
    list.querySelectorAll(".pub").forEach(el => {
      const ok = (!q || q.split(/\s+/).every(w => el.dataset.search.includes(w)))
        && (!year.value || el.dataset.year === year.value)
        && (!type || el.dataset.type === type);
      el.hidden = !ok;
      if (ok) shown++;
    });
    list.querySelectorAll(".year-label").forEach(label => {
      label.hidden = !list.querySelector(`.pub[data-year="${label.dataset.year}"]:not([hidden])`);
    });
    document.getElementById("pub-empty").hidden = shown > 0;
  }

  search.addEventListener("input", apply);
  year.addEventListener("change", () => {
    document.getElementById("pub-year-label").textContent = year.options[year.selectedIndex].text;
    apply();
  });
  typeButtons.forEach(b => b.addEventListener("click", () => {
    typeButtons.forEach(x => {
      x.classList.toggle("on", x === b);
      x.setAttribute("aria-pressed", String(x === b));
    });
    type = b.dataset.type;
    apply();
  }));
  typeButtons.forEach(b => b.setAttribute("aria-pressed", String(b.classList.contains("on"))));
}

function validCitationCount(n) {
  return Number.isSafeInteger(n) && n >= 0;
}

function readCache(key) {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    const age = v && Date.now() - v.t;
    if (v && validCitationCount(v.n) && Number.isFinite(v.t)
        && age >= 0 && age < CACHE_HOURS * 3600e3) return v.n;
  } catch (e) {}
  return null;
}
function writeCache(key, n) {
  try { localStorage.setItem(key, JSON.stringify({ n, t: Date.now() })); } catch (e) {}
}

async function updateCitations() {
  const showStats = counts => {
    const total = counts.reduce((a, b) => a + b, 0);
    const sorted = [...counts].sort((a, b) => b - a);
    const h = sorted.filter((c, k) => c >= k + 1).length;
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set("stat-citations", total);
    set("stat-h", h);
    set("stat-papers", PUBLICATIONS.length);
  };
  // Known counts are available immediately, including when the network is offline.
  showStats(PUBLICATIONS.map(p => validCitationCount(p.citations) ? p.citations : 0));
  const counts = await Promise.all(PUBLICATIONS.map(async (p, i) => {
    let n = validCitationCount(p.citations) ? p.citations : 0;
    if (p.arxiv) {
      const key = `inspire:${p.arxiv}`;
      const cached = readCache(key);
      if (cached !== null) {
        n = cached;
      } else {
        try {
          const r = await fetch(`https://inspirehep.net/api/arxiv/${p.arxiv}?fields=citation_count`, {
            signal: AbortSignal.timeout(5000),
          });
          if (r.ok) {
            const data = await r.json();
            const c = data?.metadata?.citation_count;
            if (validCitationCount(c)) {
              n = c;
              writeCache(key, n);
            }
          }
        } catch (e) { /* offline or rate-limited: keep fallback */ }
      }
    }
    const badge = document.getElementById(`cites-${i}`);
    badge.innerHTML = citeLabel(n);
    badge.title = "INSPIRE-HEP citations; saved counts are shown when live data is unavailable";
    return n;
  }));
  showStats(counts);
}

document.querySelectorAll(".year-now").forEach(el => (el.textContent = new Date().getFullYear()));
function linkHtml(name, url, title) {
  const href = /^https?:/.test(url) || url.endsWith(".html") ? url
    : `pdf.html?file=${encodeURIComponent(url)}&title=${encodeURIComponent(`${name} — ${title}`)}`;
  const external = !url.endsWith(".html");
  return `<a class="pub-link" href="${href}"${external ? ' target="_blank" rel="noopener"' : ""}>
    <i class="${LINK_ICON[name] || "fa-solid fa-link"}"></i> ${name}</a>`;
}

function renderTalks(list) {
  let lastYear = null;
  TALKS.forEach(t => {
    if (t.year !== lastYear) {
      list.insertAdjacentHTML("beforeend", `<div class="year-label" data-year="${t.year}">${t.year}</div>`);
      lastYear = t.year;
    }
    const links = Object.entries(t.links || {}).filter(([, u]) => u)
      .map(([name, url]) => linkHtml(name, url, t.title)).join("");
    const type = t.kind.split(" ")[0].toLowerCase();   // "contributed", "invited", "poster", ...
    const search = [t.title, t.kind, t.event, t.location, t.date].join(" ").toLowerCase();
    list.insertAdjacentHTML("beforeend", `
      <article class="pub${t.image ? " pub-with-image" : ""}" data-year="${t.year}" data-type="${type}" data-search="${escapeHtml(search)}">
        ${renderVenueImage(t)}
        <div class="pub-content">
        <div class="pub-top">
          <span class="badge kind-${type}">${escapeHtml(t.kind)}</span>
          ${t.upcoming ? '<span class="badge under-review">Upcoming</span>' : ""}
        </div>
        <h3 class="pub-title">${escapeHtml(t.title)}</h3>
        <p class="pub-venue"><em>${escapeHtml(t.event)}</em><span class="pub-location-date">${escapeHtml(t.location)}${LOCATION_SEPARATOR}${escapeHtml(t.date)}</span></p>
        <div class="pub-links">${links}</div>
        </div>
      </article>`);
  });
}

const talkList = document.getElementById("talk-list");
if (talkList && typeof TALKS !== "undefined") {
  renderTalks(talkList);
  initFilters(talkList, TALKS.map(t => t.year));
}

const pubList = document.getElementById("pub-list");
if (pubList) {
  renderPublications(pubList);
  initFilters(pubList, PUBLICATIONS.map(p => p.year));
  updateCitations();
}

// Hide contact links that still have a placeholder URL (kept visible on localhost for previewing).
if (!["localhost", "127.0.0.1"].includes(location.hostname)) {
  document.querySelectorAll('.links a[href*="REPLACE-ME"]').forEach(a => a.remove());
}
