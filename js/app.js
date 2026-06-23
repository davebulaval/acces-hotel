/* Carte d'accessibilite des hotels du Quebec - donnees Kéroul.
   Fond cartographique CARTO Voyager (tuiles) ; filtres multi-selection cote et prix. */
(function () {
  "use strict";
  var H = window.HOTELS || [];
  var COL = {
    "Accessible": "#1b7f4d",
    "Partiellement accessible": "#d39e00",
    "Non accessible": "#c0392b"
  };
  var BADGE = {
    "Accessible": "b-acc",
    "Partiellement accessible": "b-part",
    "Non accessible": "b-non"
  };

  function esc(s) {
    return (s == null ? "" : String(s)).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  // retire les asterisques (marqueurs de note Kéroul) et espaces parasites
  function clean(s) {
    return (s == null ? "" : String(s)).replace(/\s*\*+/g, "").trim();
  }
  // ----- Carte -----
  var map = L.map("map", { preferCanvas: true, minZoom: 5, maxZoom: 18, zoomControl: true });
  L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
    subdomains: "abcd", maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>'
  }).addTo(map);

  var layer = L.layerGroup().addTo(map);
  var markers = [];
  H.forEach(function (d, i) {
    var m = L.circleMarker([d.lat, d.lng], {
      radius: 6, color: "#fff", weight: 1,
      fillColor: COL[d.c] || "#888", fillOpacity: 0.92
    });
    m._idx = i;
    m.on("click", function () { showDetail(d); });
    m.bindTooltip(d.n, { direction: "top", offset: [0, -4] });
    markers.push(m);
  });

  // Legende
  var lg = L.control({ position: "bottomright" });
  lg.onAdd = function () {
    var el = L.DomUtil.create("div", "legend");
    el.innerHTML =
      '<span class="dot" style="background:#1b7f4d"></span>Accessible<br>' +
      '<span class="dot" style="background:#d39e00"></span>Partiellement<br>' +
      '<span class="dot" style="background:#c0392b"></span>Non accessible';
    return el;
  };
  lg.addTo(map);

  // Cadre verrouille sur le sud du Quebec (ou se trouvent les hotels)
  if (H.length) {
    var lats = H.map(function (d) { return d.lat; });
    var lngs = H.map(function (d) { return d.lng; });
    var b = L.latLngBounds(
      [Math.min.apply(null, lats), Math.min.apply(null, lngs)],
      [Math.max.apply(null, lats), Math.max.apply(null, lngs)]
    ).pad(0.08);
    map.fitBounds(b);
    map.setMaxBounds(b.pad(0.35));
  } else {
    map.setView([47.2, -71.5], 6);
  }

  // ----- Filtres (multi-selection cote et prix ; ensemble vide = aucune contrainte) -----
  var fCotes = new Set();
  var fPrices = new Set();
  var fg = "all", fq = "";
  function pass(d) {
    if (fCotes.size && !fCotes.has(d.c)) return false;
    if (fPrices.size && !fPrices.has(d.pr)) return false;
    if (fg !== "all" && d.g !== fg) return false;
    if (fq) {
      var s = (d.n + " " + d.v).toLowerCase();
      if (s.indexOf(fq) === -1) return false;
    }
    return true;
  }
  // ordre de dessin : non-acc dessous, accessible au-dessus (valeurs > 0 pour eviter le piege 0||9)
  var DRAW = { "Non accessible": 1, "Partiellement accessible": 2, "Accessible": 3 };
  function render() {
    layer.clearLayers();
    var n = 0;
    var idx = markers.map(function (m, i) { return i; })
      .filter(function (i) { return pass(H[i]); })
      .sort(function (a, c) { return (DRAW[H[a].c] || 9) - (DRAW[H[c].c] || 9); });
    idx.forEach(function (i) { markers[i].addTo(layer); n++; });
    document.getElementById("count").textContent =
      n + " hôtel" + (n > 1 ? "s" : "") + " affiché" + (n > 1 ? "s" : "");
  }

  // ----- Panneau de detail -----
  function critList(crits) {
    return '<ul class="crit">' + crits.map(function (c) {
      var vals = (c.v || []).map(function (x) { return esc(clean(x)); }).join(" &middot; ");
      var lab = c.l ? "<b>" + esc(clean(c.l)) + "</b>" + (vals ? " : " : "") : "";
      return '<li><span class="cd ' + (c.p || "neutre") + '"></span>' +
        '<span class="cl">' + lab + vals + "</span></li>";
    }).join("") + "</ul>";
  }
  function showDetail(d) {
    var el = document.getElementById("detail");
    var html = '<h2 class="dh">' + esc(d.n) + "</h2>";
    html += '<div class="badges">' +
      '<span class="badge ' + (BADGE[d.c] || "") + '">' + esc(d.c) + "</span>" +
      (d.pr ? '<span class="badge b-price">' + esc(d.pr) + "</span>" : "") +
      (d.g && d.g.indexOf("Independant") !== 0
        ? '<span class="badge b-grp">' + esc(d.g) + "</span>" : "") +
      "</div>";
    html += '<p class="meta">' + esc(d.adr) + (d.adr ? ", " : "") + esc(d.v) +
      " &middot; " + esc(d.r) +
      (d.ch ? " &middot; " + esc(d.ch) + " chambres" : "") + "</p>";
    html += '<a class="ficheBtn" href="' + esc(d.u) + '" target="_blank" rel="noopener">Voir la fiche complète sur Kéroul &#8599;</a>';

    // criteres regroupes
    var groups = { "Chambres": [], "Commodités": [] };
    (d.sec || []).forEach(function (s) {
      (groups[s.grp] || groups["Commodités"]).push(s);
    });
    if (!(d.sec && d.sec.length)) {
      html += '<p class="nodet">Détails par critère non publiés par Kéroul pour cet établissement.</p>';
    } else {
      ["Chambres", "Commodités"].forEach(function (g) {
        if (!groups[g].length) return;
        html += '<div class="grpsec"><h3>' + g + "</h3>";
        groups[g].forEach(function (s) {
          html += '<div class="sect"><p class="st">' + esc(clean(s.t)) + "</p>" + critList(s.crit) + "</div>";
        });
        html += "</div>";
      });
    }
    el.innerHTML = html;
    el.scrollTop = 0;
  }

  // ----- Branchements UI -----
  // Cote : multi-selection (Tous = aucune contrainte)
  var segBtns = Array.prototype.slice.call(document.querySelectorAll("#coteSeg button"));
  function syncCotes() {
    segBtns.forEach(function (b) {
      var c = b.getAttribute("data-c");
      b.classList.toggle("on", c === "all" ? fCotes.size === 0 : fCotes.has(c));
    });
  }
  segBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var c = btn.getAttribute("data-c");
      if (c === "all") fCotes.clear();
      else if (fCotes.has(c)) fCotes.delete(c);
      else fCotes.add(c);
      syncCotes(); render();
    });
  });

  // Groupe : selection simple
  var sel = document.getElementById("grpSel");
  Array.from(new Set(H.map(function (d) { return d.g; }))).sort().forEach(function (g) {
    var o = document.createElement("option");
    o.value = g; o.textContent = g; sel.appendChild(o);
  });
  sel.addEventListener("change", function () { fg = sel.value; render(); });

  // Prix : multi-selection par puces (Toutes = aucune contrainte). Tri par gamme reelle.
  function prRank(t) {
    var m = (t || "").match(/\$+/g) || [];
    if (!m.length) return 99;
    var s = m.reduce(function (a, x) { return a + x.length; }, 0);
    return s / m.length;
  }
  var prChips = document.getElementById("prChips");
  if (prChips) {
    var prBtns = [];
    function mkChip(label, val, on) {
      var c = document.createElement("button");
      c.type = "button"; c.className = "chip" + (on ? " on" : "");
      c.textContent = label; c.setAttribute("data-pr", val);
      prChips.appendChild(c); prBtns.push(c);
    }
    mkChip("Toutes", "all", true);
    Array.from(new Set(H.map(function (d) { return d.pr; }).filter(Boolean)))
      .sort(function (a, b) { return prRank(a) - prRank(b); })
      .forEach(function (t) { mkChip(t, t, false); });
    function syncPrices() {
      prBtns.forEach(function (b) {
        var p = b.getAttribute("data-pr");
        b.classList.toggle("on", p === "all" ? fPrices.size === 0 : fPrices.has(p));
      });
    }
    prChips.addEventListener("click", function (e) {
      var btn = e.target.closest ? e.target.closest("button") : null;
      if (!btn || !prChips.contains(btn)) return;
      var p = btn.getAttribute("data-pr");
      if (p === "all") fPrices.clear();
      else if (fPrices.has(p)) fPrices.delete(p);
      else fPrices.add(p);
      syncPrices(); render();
    });
  }

  document.getElementById("q").addEventListener("input", function (e) {
    fq = e.target.value.trim().toLowerCase(); render();
  });

  // FAQ / methodologie
  var faq = document.getElementById("faq");
  var faqBtn = document.getElementById("faqBtn");
  if (faq && faqBtn) {
    faqBtn.addEventListener("click", function () { faq.hidden = false; });
    faq.querySelectorAll("[data-close]").forEach(function (el) {
      el.addEventListener("click", function () { faq.hidden = true; });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") faq.hidden = true;
    });
  }

  render();
})();
