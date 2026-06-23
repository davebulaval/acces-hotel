/* Test d'integrite des donnees de l'app (data.js).
   Lance : node test/validate.mjs  -> sort code 1 si une assertion echoue.
   Verifie de la vraie logique : bornes geo du Quebec, valeurs de cote permises,
   format des gammes de prix, coherence des sections, unicite, etc. */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = readFileSync(join(root, "js/data.js"), "utf8");

// charge window.HOTELS sans navigateur
const g = {};
new Function("window", src)(g);
const H = g.HOTELS;

let fails = 0;
const ok = (cond, msg) => { if (!cond) { console.error("FAIL:", msg); fails++; } };

// 1. structure de base
ok(Array.isArray(H), "HOTELS doit etre un tableau");
ok(H.length === 476, `476 hotels attendus, recu ${H.length}`);

const COTES = new Set(["Accessible", "Partiellement accessible", "Non accessible"]);
const PR = /^\$+(-\$+)?$/;            // $, $$$, $$-$$$ ...
const QC = { latMin: 44.9, latMax: 50.4, lngMin: -79.8, lngMax: -61.4 };

const slugs = new Set();
let withPrice = 0, withRooms = 0, withSections = 0, hasYear = 0;

for (const d of H) {
  const tag = d && d.n ? d.n : "(sans nom)";
  ok(d.n && typeof d.n === "string", `nom manquant: ${tag}`);
  ok(COTES.has(d.c), `cote invalide pour ${tag}: ${d.c}`);

  // geo dans les bornes du Quebec
  ok(typeof d.lat === "number" && d.lat >= QC.latMin && d.lat <= QC.latMax,
    `lat hors Quebec pour ${tag}: ${d.lat}`);
  ok(typeof d.lng === "number" && d.lng >= QC.lngMin && d.lng <= QC.lngMax,
    `lng hors Quebec pour ${tag}: ${d.lng}`);

  // url -> slug unique
  ok(typeof d.u === "string" && d.u.indexOf("/etablissement/") !== -1, `url invalide: ${tag}`);
  const slug = d.u.split("/etablissement/")[1];
  ok(slug && !slugs.has(slug), `slug duplique ou vide: ${slug}`);
  slugs.add(slug);

  // prix : soit absent, soit format symbolique valide
  if (d.pr != null) { ok(PR.test(d.pr), `format de prix invalide pour ${tag}: ${d.pr}`); withPrice++; }

  // chambres : entier positif si present
  if (d.ch != null) { ok(Number.isInteger(d.ch) && d.ch > 0, `nb chambres invalide pour ${tag}: ${d.ch}`); withRooms++; }

  // l'annee de construction NE DOIT PLUS etre dans les donnees du site
  if (d.an !== undefined || d.ans !== undefined) hasYear++;

  // sections coherentes
  if (Array.isArray(d.sec) && d.sec.length) {
    withSections++;
    for (const s of d.sec) {
      ok(typeof s.t === "string", `section sans titre pour ${tag}`);
      ok(["Chambres", "Commodités"].includes(s.grp), `groupe de section invalide pour ${tag}: ${s.grp}`);
      ok(Array.isArray(s.crit) && s.crit.length > 0, `section sans critere pour ${tag}: ${s.t}`);
      for (const c of s.crit) {
        ok(["pos", "neg", "neutre"].includes(c.p), `polarite invalide pour ${tag}: ${c.p}`);
      }
    }
  }
}

ok(hasYear === 0, `l'annee de construction ne doit plus figurer dans data.js (trouve dans ${hasYear} entrees)`);

// seuils de couverture attendus (regressions si la donnee se vide)
ok(withPrice >= 470, `couverture prix trop basse: ${withPrice}/476`);
ok(withRooms >= 460, `couverture chambres trop basse: ${withRooms}/476`);
ok(withSections >= 350, `couverture criteres trop basse: ${withSections}/476`);

// au moins un hotel de chaque cote (les 3 doivent exister)
for (const c of COTES) ok(H.some(d => d.c === c), `aucun hotel avec la cote: ${c}`);

console.log(`${H.length} hotels | prix ${withPrice} | chambres ${withRooms} | criteres ${withSections}`);
if (fails) { console.error(`\n${fails} assertion(s) en echec`); process.exit(1); }
console.log("OK: toutes les assertions passent.");
