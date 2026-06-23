# Accès Hôtel

Application web statique qui cartographie l'accessibilité des hôtels du Québec à partir du répertoire certifié [Kéroul](https://www.keroul.qc.ca). Chaque hôtel est positionné sur une carte et coloré selon sa cote d'accessibilité ; le panneau de détail affiche les critères mesurés, regroupés par **chambres** et **commodités**.

## Fonctionnalités

- Carte interactive de 476 hôtels évalués, colorés par cote (Accessible / Partiellement / Non accessible).
- Vue carte (CARTO Voyager) ou vue liste (tableau triable et accessible au clavier et au lecteur d'écran).
- Filtres en sélection multiple : cote, gamme de prix, besoins d'accessibilité précis (entrée de plain-pied, ascenseur, stationnement réservé, douche adaptée, barres d'appui, toilette universelle), services spécialisés (aveugles et malvoyants, sourds et malentendants, neurodivergents), groupe hôtelier, recherche par nom ou ville.
- Panneau de détail par hôtel : adresse, groupe, gamme de prix, nombre de chambres, services spécialisés, lien vers la fiche Kéroul, et tous les critères d'accessibilité.
- Commande vocale de navigation (Web Speech API ; Chrome, Brave, Edge ; dégradation propre ailleurs).
- Multilingue FR / EN / ES / DE / ZH. L'interface est traduite ; les critères Kéroul s'affichent en français tant que les dictionnaires de traduction (`js/tr_<lang>.js`) ne sont pas remplis, avec une bannière indiquant la traduction automatique. Voir « Traduction des critères » plus bas.
- FAQ et méthodologie expliquant la provenance des données et le calcul de la gamme de prix.
- Accessibilité : `aria-live` sur le compteur, `aria-pressed` sur les filtres, `aria-sort` sur le tableau, `lang` mis à jour selon la langue.

Support LSQ (langue des signes québécoise) : non implémenté pour l'instant ; nécessite des capsules vidéo signées à produire ou à sourcer.

## Données et droits

Les données d'accessibilité sont la propriété de [Kéroul](https://www.keroul.qc.ca). Cette application est non officielle, sans lien avec Kéroul, et sert uniquement à naviguer plus facilement leurs données. Aucune utilisation commerciale.

## Structure

```
.
├── index.html          page unique
├── css/style.css
├── js/
│   ├── app.js          logique (carte, liste, filtres, voix, détail)
│   ├── i18n.js         window.UI : chaînes d'interface FR/EN/ES/DE/ZH
│   ├── tr_en.js        window.TR.en : traductions des critères (placeholder)
│   ├── tr_es.js        window.TR.es (placeholder)
│   ├── tr_de.js        window.TR.de (placeholder)
│   ├── tr_zh.js        window.TR.zh (placeholder)
│   └── data.js         window.HOTELS = [...]  (données des 476 hôtels)
├── test/
│   └── validate.mjs    test d'intégrité des données (node test/validate.mjs)
└── vendor/
    ├── leaflet.js      Leaflet 1.9.4 (vendoré, version figée)
    └── leaflet.css
```

Les données sont chargées via une balise `<script>` (objet global `window.HOTELS`) plutôt que par `fetch`, donc l'application fonctionne aussi bien sur GitHub Pages qu'en ouvrant `index.html` directement dans un navigateur. Les tuiles cartographiques (CARTO) nécessitent une connexion internet.

## Traduction des critères

L'interface est traduite en cinq langues dans `js/i18n.js`. Les critères d'accessibilité de Kéroul (titres de sections, libellés, valeurs) sont traduits via `window.TR[lang]`, un dictionnaire `{ chaîne française: traduction }` par langue, chargé depuis `js/tr_<lang>.js`.

Ces fichiers sont actuellement des placeholders vides : en langue non française, les critères s'affichent en français (repli automatique) et une bannière signale la traduction automatique. Pour activer la traduction, remplir chaque `tr_<lang>.js` avec `window.TR.<lang> = { "Largeur libre de la porte ...": "Clear door width ...", ... }`. Aucune modification de code n'est requise.

## Lancer en local

Double-cliquer `index.html`, ou servir le dossier :

```bash
python3 -m http.server 8000
# puis http://localhost:8000
```

## Déployer sur GitHub Pages

```bash
git init && git add . && git commit -m "Carte accessibilite hotels Quebec"
git branch -M main
git remote add origin git@github.com:davebulaval/<nom-du-repo>.git
git push -u origin main
```

Puis, dans les réglages du dépôt : **Settings → Pages → Build and deployment → Source : Deploy from a branch → main / (root)**. Le fichier `.nojekyll` empêche tout traitement Jekyll. Le site sera servi à `https://davebulaval.github.io/<nom-du-repo>/`.

### Alternative : Vercel

Tier gratuit « Hobby » (usage personnel). `vercel` à la racine, ou importer le dépôt depuis l'interface Vercel ; aucun build requis (projet statique, output = racine).

## Données et méthodologie

- **Source d'accessibilité** : répertoire Kéroul (audits terrain mesurés ; cote valide 5 ans). Les critères sont extraits des fiches Kéroul.
- **Géolocalisation** : coordonnées issues des fiches Kéroul.
- **Cote** : `Accessible` = parcours complet conforme ; `Partiellement accessible` = chambres adaptées mais avec manquements mesurés ; `Non accessible` = pas de chambre conforme ou obstacles bloquants.

## Crédits

Données d'accessibilité : Kéroul. Fond cartographique : CARTO (tuiles Voyager, sur données OpenStreetMap). Cartographie : Leaflet.

## Licence

Le **code** de ce projet (index.html, css/, js/app.js, test/, scripts) est sous licence [MIT](LICENSE).

Les **données** (`js/data.js`) ne sont **pas** couvertes par la licence MIT : elles sont la propriété de [Kéroul](https://www.keroul.qc.ca), incluses uniquement pour permettre à cette application non officielle de les afficher. Aucune utilisation commerciale. Leaflet (`vendor/`) est sous licence BSD-2-Clause.
