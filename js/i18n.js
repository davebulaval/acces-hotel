/* i18n : dictionnaire d'interface (FR base, EN/ES/DE/ZH).
   Les criteres Kéroul sont traduits via window.TR (charge depuis tr_<lang>.js).
   "Accès Hôtel", noms d'hotels, villes, regions et groupes ne se traduisent pas. */
(function () {
  "use strict";
  window.TR = window.TR || {};
  var COTES = ["Accessible", "Partiellement accessible", "Non accessible"];

  window.UI = {
    fr: {
      lang: "Français", tagline: "L'accueil, vu de près",
      title: "Hôtels accessibles du Québec",
      subtitle: "476 établissements audités sur place par Kéroul. La couleur du point indique la cote d'accessibilité.",
      faqBtn: "FAQ et méthodologie",
      search: "Rechercher un hôtel ou une ville",
      allGroups: "Tous les groupes hôteliers",
      coteLabel: "Cote d'accessibilité (sélection multiple)",
      coteAll: "Tous", coteShort: { "Accessible": "Acc.", "Partiellement accessible": "Part.", "Non accessible": "Non" },
      cote: { "Accessible": "Accessible", "Partiellement accessible": "Partiellement accessible", "Non accessible": "Non accessible" },
      priceLabel: "Gamme de prix (sélection multiple)", priceAll: "Toutes",
      needsLabel: "Besoins d'accessibilité (sélection multiple)",
      needs: { plain: "Entrée de plain-pied", asc: "Ascenseur", park: "Stationnement réservé", shower: "Douche adaptée", bars: "Barres d'appui", wc: "Toilette universelle" },
      servicesLabel: "Services spécialisés (sélection multiple)",
      services: { sv: "Aveugles et malvoyants", sa: "Sourds et malentendants", sn: "Neurodivergents" },
      count: function (n) { return n + " hôtel" + (n > 1 ? "s" : "") + " affiché" + (n > 1 ? "s" : ""); },
      viewMap: "Carte", viewList: "Liste",
      voice: "Commande vocale", voiceOn: "À l'écoute...", voiceHeard: "Compris : ", voiceNoSupport: "Commande vocale non disponible dans ce navigateur",
      reset: "Réinitialiser",
      colName: "Nom", colCity: "Ville", colCote: "Cote", colPrice: "Prix", colRooms: "Chambres",
      rooms: "chambres", fiche: "Voir la fiche complète sur Kéroul",
      nodet: "Détails par critère non publiés par Kéroul pour cet établissement.",
      empty: "Sélectionnez un hôtel sur la carte ou dans la liste pour voir ses critères d'accessibilité.",
      grpChambres: "Chambres", grpCommodites: "Commodités",
      autotrans: "Traduction automatique, susceptible de contenir des erreurs. Les données restent celles de Kéroul (français).",
      infoSummary: "Comprendre les cotes et les critères"
    },
    en: {
      lang: "English", tagline: "Hospitality, up close",
      title: "Accessible hotels in Quebec",
      subtitle: "476 establishments audited on site by Kéroul. The dot colour shows the accessibility rating.",
      faqBtn: "FAQ and methodology",
      search: "Search a hotel or a city",
      allGroups: "All hotel groups",
      coteLabel: "Accessibility rating (multiple choice)",
      coteAll: "All", coteShort: { "Accessible": "Acc.", "Partiellement accessible": "Part.", "Non accessible": "No" },
      cote: { "Accessible": "Accessible", "Partiellement accessible": "Partially accessible", "Non accessible": "Not accessible" },
      priceLabel: "Price range (multiple choice)", priceAll: "All",
      needsLabel: "Accessibility needs (multiple choice)",
      needs: { plain: "Step-free entrance", asc: "Elevator", park: "Reserved parking", shower: "Adapted shower", bars: "Grab bars", wc: "Universal washroom" },
      servicesLabel: "Specialized services (multiple choice)",
      services: { sv: "Blind and low vision", sa: "Deaf and hard of hearing", sn: "Neurodivergent" },
      count: function (n) { return n + " hotel" + (n > 1 ? "s" : "") + " shown"; },
      viewMap: "Map", viewList: "List",
      voice: "Voice command", voiceOn: "Listening...", voiceHeard: "Heard: ", voiceNoSupport: "Voice command not available in this browser",
      reset: "Reset",
      colName: "Name", colCity: "City", colCote: "Rating", colPrice: "Price", colRooms: "Rooms",
      rooms: "rooms", fiche: "See the full record on Kéroul",
      nodet: "Per-criterion details not published by Kéroul for this establishment.",
      empty: "Select a hotel on the map or in the list to see its accessibility criteria.",
      grpChambres: "Rooms", grpCommodites: "Amenities",
      autotrans: "Automatic translation, may contain errors. The data remains Kéroul's (French).",
      infoSummary: "Understanding the ratings and criteria"
    },
    es: {
      lang: "Español", tagline: "La acogida, de cerca",
      title: "Hoteles accesibles de Quebec",
      subtitle: "476 establecimientos auditados in situ por Kéroul. El color del punto indica la calificación de accesibilidad.",
      faqBtn: "Preguntas y metodología",
      search: "Buscar un hotel o una ciudad",
      allGroups: "Todos los grupos hoteleros",
      coteLabel: "Calificación de accesibilidad (selección múltiple)",
      coteAll: "Todos", coteShort: { "Accessible": "Acc.", "Partiellement accessible": "Parc.", "Non accessible": "No" },
      cote: { "Accessible": "Accesible", "Partiellement accessible": "Parcialmente accesible", "Non accessible": "No accesible" },
      priceLabel: "Gama de precios (selección múltiple)", priceAll: "Todas",
      needsLabel: "Necesidades de accesibilidad (selección múltiple)",
      needs: { plain: "Entrada sin escalones", asc: "Ascensor", park: "Estacionamiento reservado", shower: "Ducha adaptada", bars: "Barras de apoyo", wc: "Baño universal" },
      servicesLabel: "Servicios especializados (selección múltiple)",
      services: { sv: "Ciegos y baja visión", sa: "Sordos y con dificultad auditiva", sn: "Neurodivergentes" },
      count: function (n) { return n + " hotel" + (n > 1 ? "es" : "") + " mostrado" + (n > 1 ? "s" : ""); },
      viewMap: "Mapa", viewList: "Lista",
      voice: "Comando de voz", voiceOn: "Escuchando...", voiceHeard: "Entendido: ", voiceNoSupport: "Comando de voz no disponible en este navegador",
      reset: "Restablecer",
      colName: "Nombre", colCity: "Ciudad", colCote: "Calificación", colPrice: "Precio", colRooms: "Habitaciones",
      rooms: "habitaciones", fiche: "Ver la ficha completa en Kéroul",
      nodet: "Kéroul no publica detalles por criterio para este establecimiento.",
      empty: "Seleccione un hotel en el mapa o en la lista para ver sus criterios de accesibilidad.",
      grpChambres: "Habitaciones", grpCommodites: "Servicios",
      autotrans: "Traducción automática, puede contener errores. Los datos siguen siendo de Kéroul (en francés).",
      infoSummary: "Entender las calificaciones y los criterios"
    },
    de: {
      lang: "Deutsch", tagline: "Gastfreundschaft, aus der Nähe",
      title: "Barrierefreie Hotels in Quebec",
      subtitle: "476 von Kéroul vor Ort geprüfte Betriebe. Die Punktfarbe zeigt die Barrierefreiheitsbewertung.",
      faqBtn: "FAQ und Methodik",
      search: "Hotel oder Stadt suchen",
      allGroups: "Alle Hotelgruppen",
      coteLabel: "Barrierefreiheitsbewertung (Mehrfachauswahl)",
      coteAll: "Alle", coteShort: { "Accessible": "Barr.", "Partiellement accessible": "Teilw.", "Non accessible": "Nein" },
      cote: { "Accessible": "Barrierefrei", "Partiellement accessible": "Teilweise barrierefrei", "Non accessible": "Nicht barrierefrei" },
      priceLabel: "Preisklasse (Mehrfachauswahl)", priceAll: "Alle",
      needsLabel: "Barrierefreiheitsbedarf (Mehrfachauswahl)",
      needs: { plain: "Schwellenloser Eingang", asc: "Aufzug", park: "Reservierter Parkplatz", shower: "Angepasste Dusche", bars: "Haltegriffe", wc: "Universelle Toilette" },
      servicesLabel: "Spezialdienste (Mehrfachauswahl)",
      services: { sv: "Blinde und sehbehinderte", sa: "Gehörlose und schwerhörige", sn: "Neurodivergente" },
      count: function (n) { return n + " Hotel" + (n > 1 ? "s" : "") + " angezeigt"; },
      viewMap: "Karte", viewList: "Liste",
      voice: "Sprachbefehl", voiceOn: "Höre zu...", voiceHeard: "Verstanden: ", voiceNoSupport: "Sprachbefehl in diesem Browser nicht verfügbar",
      reset: "Zurücksetzen",
      colName: "Name", colCity: "Stadt", colCote: "Bewertung", colPrice: "Preis", colRooms: "Zimmer",
      rooms: "Zimmer", fiche: "Vollständigen Eintrag bei Kéroul ansehen",
      nodet: "Kéroul veröffentlicht für diesen Betrieb keine Details je Kriterium.",
      empty: "Wählen Sie ein Hotel auf der Karte oder in der Liste, um die Kriterien zu sehen.",
      grpChambres: "Zimmer", grpCommodites: "Ausstattung",
      autotrans: "Automatische Übersetzung, kann Fehler enthalten. Die Daten stammen weiterhin von Kéroul (Französisch).",
      infoSummary: "Bewertungen und Kriterien verstehen"
    },
    zh: {
      lang: "中文", tagline: "贴近的接待",
      title: "魁北克无障碍酒店",
      subtitle: "476 家由 Kéroul 实地评估的场所。圆点颜色表示无障碍评级。",
      faqBtn: "常见问题与方法",
      search: "搜索酒店或城市",
      allGroups: "所有酒店集团",
      coteLabel: "无障碍评级（可多选）",
      coteAll: "全部", coteShort: { "Accessible": "无障碍", "Partiellement accessible": "部分", "Non accessible": "否" },
      cote: { "Accessible": "无障碍", "Partiellement accessible": "部分无障碍", "Non accessible": "非无障碍" },
      priceLabel: "价格区间（可多选）", priceAll: "全部",
      needsLabel: "无障碍需求（可多选）",
      needs: { plain: "无台阶入口", asc: "电梯", park: "预留停车位", shower: "无障碍淋浴", bars: "扶手", wc: "通用卫生间" },
      servicesLabel: "专项服务（可多选）",
      services: { sv: "视障人士", sa: "听障人士", sn: "神经多样性人士" },
      count: function (n) { return "显示 " + n + " 家酒店"; },
      viewMap: "地图", viewList: "列表",
      voice: "语音指令", voiceOn: "聆听中...", voiceHeard: "识别到：", voiceNoSupport: "此浏览器不支持语音指令",
      reset: "重置",
      colName: "名称", colCity: "城市", colCote: "评级", colPrice: "价格", colRooms: "客房",
      rooms: "间客房", fiche: "在 Kéroul 查看完整记录",
      nodet: "Kéroul 未公布该场所的逐项标准细节。",
      empty: "在地图或列表中选择一家酒店以查看其无障碍标准。",
      grpChambres: "客房", grpCommodites: "设施",
      autotrans: "机器翻译，可能存在错误。数据仍归 Kéroul 所有（法语原文）。",
      infoSummary: "了解评级与标准"
    }
  };

  // langue active
  window.I18N = {
    lang: "fr",
    langs: ["fr", "en", "es", "de", "zh"],
    cotes: COTES,
    t: function (key) { return (window.UI[this.lang] || window.UI.fr)[key]; },
    // traduit une chaine de critere Kéroul vers la langue active (repli = FR original)
    tr: function (s) {
      if (this.lang === "fr") return s;
      var d = window.TR[this.lang];
      return (d && d[s]) || s;
    },
    // traduit un libelle de cote
    cote: function (c) { return ((window.UI[this.lang] || window.UI.fr).cote || {})[c] || c; }
  };
})();
