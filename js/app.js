/* Accès Hôtel - carte d'accessibilite des hotels du Quebec (donnees Kéroul).
   Fond CARTO Voyager ; filtres multi-selection (cote, prix, besoins, services) ;
   vue carte/liste ; commande vocale ; i18n FR/EN/ES/DE/ZH (criteres via window.TR). */
(function () {
  "use strict";
  var H = window.HOTELS || [];
  var I = window.I18N;
  var COL = { "Accessible": "#1b7f4d", "Partiellement accessible": "#d39e00", "Non accessible": "#c0392b" };
  var BADGE = { "Accessible": "b-acc", "Partiellement accessible": "b-part", "Non accessible": "b-non" };

  function esc(s) {
    return (s == null ? "" : String(s)).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function clean(s) { return (s == null ? "" : String(s)).replace(/\s*\*+/g, "").trim(); }
  function norm(s) { return (s || "").toLowerCase(); }

  // ----- Detection des besoins d'accessibilite (heuristique sur d.sec) -----
  function eachCrit(d, fn) {
    (d.sec || []).forEach(function (s) {
      s.crit.forEach(function (c) { fn(s, c); });
    });
  }
  function critText(d) {
    var parts = [];
    eachCrit(d, function (s, c) {
      parts.push(norm(s.t)); if (c.l) parts.push(norm(c.l));
      (c.v || []).forEach(function (v) { parts.push(norm(v)); });
    });
    return parts.join(" || ");
  }
  // un besoin = predicat sur l'hotel (true si satisfait, polarite non negative)
  var NEEDS = {
    plain: function (d) {
      return (d.sec || []).some(function (s) {
        return s.crit.some(function (c) {
          return c.p !== "neg" && (c.v || []).some(function (v) {
            return /plain-pied|sans seuil|sans marche/i.test(v);
          });
        });
      });
    },
    asc: function (d) {
      return (d.sec || []).some(function (s) {
        if (!/ascenseur/i.test(s.t)) return false;
        return s.crit.some(function (c) { return c.p !== "neg"; }) || s.crit.length === 0;
      }) || (d.sec || []).some(function (s) {
        return s.crit.some(function (c) { return /ascenseur/i.test(c.l || "") && c.p !== "neg"; });
      });
    },
    park: function (d) {
      return (d.sec || []).some(function (s) {
        return s.crit.some(function (c) {
          return (c.v || []).some(function (v) {
            return /place.{0,4}r.serv/i.test(v) && !/aucune/i.test(v);
          });
        });
      });
    },
    shower: function (d) {
      return (d.sec || []).some(function (s) {
        return s.crit.some(function (c) {
          return (c.v || []).some(function (v) {
            return /douche/i.test(v) && /(italienne|sans seuil|banc|plain-pied)/i.test(v);
          });
        });
      });
    },
    bars: function (d) {
      return (d.sec || []).some(function (s) {
        return s.crit.some(function (c) {
          var hit = /barre.{0,3}d.appui/i.test(c.l || "") ||
            (c.v || []).some(function (v) { return /barre.{0,3}d.appui/i.test(v); });
          return hit && c.p !== "neg";
        });
      });
    },
    wc: function (d) {
      return (d.sec || []).some(function (s) { return /toilette universelle/i.test(s.t); });
    }
  };
  // pre-calcul des besoins par hotel
  H.forEach(function (d) {
    d._need = {};
    Object.keys(NEEDS).forEach(function (k) { d._need[k] = NEEDS[k](d); });
  });

  // ----- Carte -----
  var map = L.map("map", { preferCanvas: true, minZoom: 5, maxZoom: 18, zoomControl: true, attributionControl: true });
  L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
    subdomains: "abcd", maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>'
  }).addTo(map);
  var layer = L.layerGroup().addTo(map);
  var markers = H.map(function (d) {
    var m = L.circleMarker([d.lat, d.lng], { radius: 6, color: "#fff", weight: 1, fillColor: COL[d.c] || "#888", fillOpacity: 0.92 });
    m.on("click", function () { showDetail(d); });
    m.bindTooltip(d.n, { direction: "top", offset: [0, -4] });
    return m;
  });
  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function () { var el = L.DomUtil.create("div", "legend"); el.id = "legendBox"; return el; };
  legend.addTo(map);
  function paintLegend() {
    var el = document.getElementById("legendBox"); if (!el) return;
    el.innerHTML = I.cotes.map(function (c) {
      return '<span class="dot" style="background:' + COL[c] + '"></span>' + esc(I.cote(c));
    }).join("<br>");
  }
  if (H.length) {
    var lats = H.map(function (d) { return d.lat; }), lngs = H.map(function (d) { return d.lng; });
    var b = L.latLngBounds([Math.min.apply(null, lats), Math.min.apply(null, lngs)],
      [Math.max.apply(null, lats), Math.max.apply(null, lngs)]).pad(0.08);
    map.fitBounds(b); map.setMaxBounds(b.pad(0.35));
  } else { map.setView([47.2, -71.5], 6); }

  // ----- Etat des filtres -----
  var fCotes = new Set(), fPrices = new Set(), fNeeds = new Set(), fSvc = new Set();
  var fg = "all", fq = "", view = "map", sortKey = "n", sortDir = 1;

  function pass(d) {
    if (fCotes.size && !fCotes.has(d.c)) return false;
    if (fPrices.size && !fPrices.has(d.pr)) return false;
    if (fg !== "all" && d.g !== fg) return false;
    if (fNeeds.size) { for (var k of fNeeds) { if (!d._need[k]) return false; } }
    if (fSvc.size) { for (var s of fSvc) { if (!d[s]) return false; } }
    if (fq) {
      var hay = norm(d.n + " " + d.v + " " + d.r);
      if (hay.indexOf(fq) === -1) return false;
    }
    return true;
  }

  var DRAW = { "Non accessible": 1, "Partiellement accessible": 2, "Accessible": 3 };
  function filtered() { return H.filter(pass); }

  function render() {
    var list = filtered();
    // carte
    layer.clearLayers();
    list.slice().sort(function (a, c) { return (DRAW[a.c] || 9) - (DRAW[c.c] || 9); })
      .forEach(function (d) { markers[H.indexOf(d)].addTo(layer); });
    // compteur (annonce aria-live)
    var msg = I.t("count")(list.length);
    document.getElementById("count").textContent = msg;
    // liste
    if (view === "list") renderList(list);
    return list;
  }

  // ----- Vue liste (tableau accessible) -----
  function renderList(list) {
    var box = document.getElementById("list");
    var cols = [
      { k: "n", label: I.t("colName") }, { k: "v", label: I.t("colCity") },
      { k: "c", label: I.t("colCote") }, { k: "pr", label: I.t("colPrice") },
      { k: "ch", label: I.t("colRooms") }
    ];
    var rows = list.slice().sort(function (a, b) {
      var x = a[sortKey], y = b[sortKey];
      if (sortKey === "c") { x = DRAW[a.c] || 0; y = DRAW[b.c] || 0; }
      if (sortKey === "pr") { x = (a.pr || "").length; y = (b.pr || "").length; }
      if (x == null) x = sortKey === "ch" ? -1 : "";
      if (y == null) y = sortKey === "ch" ? -1 : "";
      if (x < y) return -1 * sortDir; if (x > y) return 1 * sortDir; return 0;
    });
    var thead = "<tr>" + cols.map(function (c) {
      var aria = sortKey === c.k ? (sortDir === 1 ? "ascending" : "descending") : "none";
      return '<th scope="col" aria-sort="' + aria + '"><button class="thbtn" data-k="' + c.k + '">' +
        esc(c.label) + '<span class="sortar">' + (sortKey === c.k ? (sortDir === 1 ? " ↑" : " ↓") : "") + "</span></button></th>";
    }).join("") + "</tr>";
    var tbody = rows.map(function (d) {
      var i = H.indexOf(d);
      return '<tr tabindex="0" data-i="' + i + '">' +
        "<td>" + esc(d.n) + "</td>" +
        "<td>" + esc(d.v) + "</td>" +
        '<td><span class="cdot ' + (BADGE[d.c] || "") + '"></span>' + esc(I.cote(d.c)) + "</td>" +
        '<td class="mono">' + esc(d.pr || "-") + "</td>" +
        '<td class="num">' + (d.ch != null ? d.ch : "-") + "</td></tr>";
    }).join("");
    box.innerHTML = '<table class="htable"><caption class="visually-hidden">' + esc(I.t("title")) +
      "</caption><thead>" + thead + "</thead><tbody>" + tbody + "</tbody></table>";
  }

  // ----- Panneau de detail -----
  function critList(crits) {
    return '<ul class="crit">' + crits.map(function (c) {
      var vals = (c.v || []).map(function (x) { return esc(I.tr(clean(x))); }).join(" &middot; ");
      var lab = c.l ? "<b>" + esc(I.tr(clean(c.l))) + "</b>" + (vals ? " : " : "") : "";
      return '<li><span class="cd ' + (c.p || "neutre") + '"></span><span class="cl">' + lab + vals + "</span></li>";
    }).join("") + "</ul>";
  }
  function showDetail(d) {
    var el = document.getElementById("detail");
    var svc = [];
    if (d.sv) svc.push(I.t("services").sv);
    if (d.sa) svc.push(I.t("services").sa);
    if (d.sn) svc.push(I.t("services").sn);
    var html = '<h2 class="dh">' + esc(d.n) + "</h2>";
    html += '<div class="badges"><span class="badge ' + (BADGE[d.c] || "") + '">' + esc(I.cote(d.c)) + "</span>" +
      (d.pr ? '<span class="badge b-price">' + esc(d.pr) + "</span>" : "") +
      (d.g && d.g.indexOf("Independant") !== 0 ? '<span class="badge b-grp">' + esc(d.g) + "</span>" : "") +
      "</div>";
    if (svc.length) {
      html += '<div class="badges">' + svc.map(function (s) {
        return '<span class="badge b-svc">' + esc(s) + "</span>";
      }).join("") + "</div>";
    }
    html += '<p class="meta">' + esc(d.adr) + (d.adr ? ", " : "") + esc(d.v) + " &middot; " + esc(d.r) +
      (d.ch != null ? " &middot; " + d.ch + " " + esc(I.t("rooms")) : "") + "</p>";
    html += '<a class="ficheBtn" href="' + esc(d.u) + '" target="_blank" rel="noopener">' + esc(I.t("fiche")) + " ↗</a>";
    var groups = { "Chambres": [], "Commodités": [] };
    (d.sec || []).forEach(function (s) { (groups[s.grp] || groups["Commodités"]).push(s); });
    if (!(d.sec && d.sec.length)) {
      html += '<p class="nodet">' + esc(I.t("nodet")) + "</p>";
    } else {
      [["Chambres", "grpChambres"], ["Commodités", "grpCommodites"]].forEach(function (g) {
        if (!groups[g[0]].length) return;
        html += '<div class="grpsec"><h3>' + esc(I.t(g[1])) + "</h3>";
        groups[g[0]].forEach(function (s) {
          html += '<div class="sect"><p class="st">' + esc(I.tr(clean(s.t))) + "</p>" + critList(s.crit) + "</div>";
        });
        html += "</div>";
      });
    }
    el.innerHTML = html; el.scrollTop = 0;
  }

  // ----- Construction des puces et libelles -----
  function chipHTML(label, val, on, attr) {
    return '<button type="button" class="chip' + (on ? " on" : "") + '" ' + attr + '="' + esc(val) +
      '" aria-pressed="' + (on ? "true" : "false") + '">' + esc(label) + "</button>";
  }
  function prRank(t) {
    var m = (t || "").match(/\$+/g) || []; if (!m.length) return 99;
    return m.reduce(function (a, x) { return a + x.length; }, 0) / m.length;
  }
  var priceTiers = Array.from(new Set(H.map(function (d) { return d.pr; }).filter(Boolean)))
    .sort(function (a, b) { return prRank(a) - prRank(b); });

  function buildChips() {
    // prix
    var pr = document.getElementById("prChips");
    pr.innerHTML = chipHTML(I.t("priceAll"), "all", fPrices.size === 0, "data-pr") +
      priceTiers.map(function (t) { return chipHTML(t, t, fPrices.has(t), "data-pr"); }).join("");
    // besoins
    var needs = I.t("needs");
    document.getElementById("needChips").innerHTML = Object.keys(needs).map(function (k) {
      return chipHTML(needs[k], k, fNeeds.has(k), "data-need");
    }).join("");
    // services
    var svc = I.t("services");
    document.getElementById("svcChips").innerHTML = ["sv", "sa", "sn"].map(function (k) {
      return chipHTML(svc[k], k, fSvc.has(k), "data-svc");
    }).join("");
  }

  // ----- Application de la langue a l'interface statique -----
  function applyLang() {
    document.documentElement.lang = I.lang;
    var U = window.UI[I.lang];
    // textes data-i18n
    document.querySelectorAll("[data-i18n]").forEach(function (n) {
      var v = U[n.getAttribute("data-i18n")];
      if (typeof v === "string") n.textContent = v;
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (n) {
      var v = U[n.getAttribute("data-i18n-ph")];
      if (typeof v === "string") n.setAttribute("placeholder", v);
    });
    // cotes : libelle court sur les boutons du segment
    document.querySelectorAll("#coteSeg button[data-c]").forEach(function (btn) {
      var c = btn.getAttribute("data-c");
      var span = btn.querySelector(".lbl");
      if (c === "all") { if (span) span.textContent = U.coteAll; }
      else if (span) span.textContent = U.coteShort[c] || c;
    });
    // groupe : premiere option
    var go = document.querySelector("#grpSel option[value='all']");
    if (go) go.textContent = U.allGroups;
    // bascule vue
    document.querySelector("#viewSeg button[data-view='map'] .lbl").textContent = U.viewMap;
    document.querySelector("#viewSeg button[data-view='list'] .lbl").textContent = U.viewList;
    // voix
    var vb = document.getElementById("voiceBtn"); if (vb) vb.setAttribute("aria-label", U.voice);
    // banniere auto-traduction
    var at = document.getElementById("autotrans");
    at.textContent = U.autotrans; at.hidden = (I.lang === "fr");
    paintLegend();
    buildChips();
  }

  // ----- Branchements UI -----
  // Langue
  var langSel = document.getElementById("langSel");
  I.langs.forEach(function (l) {
    var o = document.createElement("option"); o.value = l; o.textContent = window.UI[l].lang;
    langSel.appendChild(o);
  });
  langSel.value = I.lang;
  langSel.addEventListener("change", function () {
    I.lang = langSel.value; applyLang(); render();
    // un detail ouvert se re-traduit au prochain clic (comportement simple et previsible)
  });

  // Cote (multi)
  document.querySelectorAll("#coteSeg button[data-c]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var c = btn.getAttribute("data-c");
      if (c === "all") fCotes.clear();
      else if (fCotes.has(c)) fCotes.delete(c); else fCotes.add(c);
      syncSeg(); render();
    });
  });
  function syncSeg() {
    document.querySelectorAll("#coteSeg button[data-c]").forEach(function (b) {
      var c = b.getAttribute("data-c");
      var on = c === "all" ? fCotes.size === 0 : fCotes.has(c);
      b.classList.toggle("on", on); b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  // Groupe
  var grpSel = document.getElementById("grpSel");
  Array.from(new Set(H.map(function (d) { return d.g; }))).sort().forEach(function (g) {
    var o = document.createElement("option"); o.value = g; o.textContent = g; grpSel.appendChild(o);
  });
  grpSel.addEventListener("change", function () { fg = grpSel.value; render(); });

  // Puces (prix / besoins / services) - delegation
  function chipHandler(containerId, set, attr) {
    document.getElementById(containerId).addEventListener("click", function (e) {
      var btn = e.target.closest ? e.target.closest("button.chip") : null;
      if (!btn || !this.contains(btn)) return;
      var v = btn.getAttribute(attr);
      if (v === "all") set.clear();
      else if (set.has(v)) set.delete(v); else set.add(v);
      buildChips(); render();
    });
  }
  chipHandler("prChips", fPrices, "data-pr");
  chipHandler("needChips", fNeeds, "data-need");
  chipHandler("svcChips", fSvc, "data-svc");

  // Recherche
  document.getElementById("q").addEventListener("input", function (e) {
    fq = norm(e.target.value.trim()); render();
  });

  // Bascule carte / liste
  document.querySelectorAll("#viewSeg button[data-view]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      view = btn.getAttribute("data-view");
      document.querySelectorAll("#viewSeg button").forEach(function (b) {
        var on = b === btn; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      document.getElementById("map").hidden = (view !== "map");
      document.getElementById("list").hidden = (view !== "list");
      if (view === "map") { map.invalidateSize(); }
      render();
    });
  });

  // Liste : tri par en-tete + ouverture ligne (clavier + clic)
  var listBox = document.getElementById("list");
  listBox.addEventListener("click", function (e) {
    var th = e.target.closest ? e.target.closest(".thbtn") : null;
    if (th) {
      var k = th.getAttribute("data-k");
      if (sortKey === k) sortDir = -sortDir; else { sortKey = k; sortDir = 1; }
      renderList(filtered()); return;
    }
    var tr = e.target.closest ? e.target.closest("tr[data-i]") : null;
    if (tr) showDetail(H[+tr.getAttribute("data-i")]);
  });
  listBox.addEventListener("keydown", function (e) {
    if (e.key !== "Enter") return;
    var tr = e.target.closest ? e.target.closest("tr[data-i]") : null;
    if (tr) { e.preventDefault(); showDetail(H[+tr.getAttribute("data-i")]); }
  });

  // FAQ
  var faq = document.getElementById("faq"), faqBtn = document.getElementById("faqBtn");
  if (faq && faqBtn) {
    faqBtn.addEventListener("click", function () { faq.hidden = false; });
    faq.querySelectorAll("[data-close]").forEach(function (el) {
      el.addEventListener("click", function () { faq.hidden = true; });
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") faq.hidden = true; });
  }

  // ----- Commande vocale (Web Speech API ; progressive enhancement) -----
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var voiceBtn = document.getElementById("voiceBtn"), voiceMsg = document.getElementById("voiceMsg");
  if (!SR) { if (voiceBtn) voiceBtn.hidden = true; }
  else {
    var SLOC = { fr: "fr-CA", en: "en-CA", es: "es-ES", de: "de-DE", zh: "zh-CN" };
    var rec = new SR(); rec.continuous = false; rec.interimResults = false;
    var cities = Array.from(new Set(H.map(function (d) { return norm(d.v); })));
    var regions = Array.from(new Set(H.map(function (d) { return norm(d.r); })));
    voiceBtn.addEventListener("click", function () {
      rec.lang = SLOC[I.lang] || "fr-CA";
      try { rec.start(); voiceBtn.classList.add("listening"); voiceMsg.textContent = I.t("voiceOn"); } catch (e) { /* deja en cours */ }
    });
    rec.onresult = function (ev) {
      var said = norm(ev.results[0][0].transcript);
      voiceMsg.textContent = I.t("voiceHeard") + said;
      applyVoice(said);
    };
    rec.onend = function () { voiceBtn.classList.remove("listening"); };
    rec.onerror = function () { voiceBtn.classList.remove("listening"); voiceMsg.textContent = ""; };
    function applyVoice(said) {
      var did = false;
      // bascule vue
      if (/\b(liste|list|lista|liste|列表)\b/.test(said)) { setView("list"); did = true; }
      if (/\b(carte|map|mapa|karte|地图)\b/.test(said)) { setView("map"); did = true; }
      // reinitialiser
      if (/(r.initialis|reset|restablec|zur.cksetz|重置)/.test(said)) {
        fCotes.clear(); fPrices.clear(); fNeeds.clear(); fSvc.clear(); fg = "all";
        grpSel.value = "all"; fq = ""; document.getElementById("q").value = "";
        syncSeg(); buildChips(); render(); return;
      }
      // cotes
      if (/non.?access|not access|no acces|nicht|非无障碍/.test(said)) { fCotes.add("Non accessible"); did = true; }
      else if (/partiel|partial|parcial|teilw|部分/.test(said)) { fCotes.add("Partiellement accessible"); did = true; }
      else if (/access|无障碍|barrierefrei/.test(said)) { fCotes.add("Accessible"); did = true; }
      // ville / region
      cities.forEach(function (c) { if (c.length > 3 && said.indexOf(c) !== -1) { fq = c; document.getElementById("q").value = c; did = true; } });
      if (!did) regions.forEach(function (r) { if (r.length > 3 && said.indexOf(r) !== -1) { fq = r; document.getElementById("q").value = r; did = true; } });
      if (did) { syncSeg(); render(); }
    }
    function setView(v) {
      var btn = document.querySelector("#viewSeg button[data-view='" + v + "']");
      if (btn) btn.click();
    }
  }

  // ----- Init -----
  applyLang();
  render();
})();
