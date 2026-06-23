# Accès Hôtel

Application web statique qui cartographie l'accessibilité des hôtels du Québec à partir du répertoire certifié [Kéroul](https://www.keroul.qc.ca). Chaque hôtel est positionné sur une carte et coloré selon sa cote d'accessibilité ; le panneau de détail affiche les critères mesurés, regroupés par **chambres** et **commodités**.

## Fonctionnalités

- Carte interactive de 476 hôtels évalués, colorés par cote (Accessible / Partiellement / Non accessible).
- Fond cartographique CARTO Voyager (tuiles), vue cadrée et verrouillée sur le Québec.
- Filtres : cote (sélection multiple), gamme de prix (sélection multiple), groupe hôtelier, recherche par nom ou ville.
- Panneau de détail par hôtel : adresse, groupe, gamme de prix, nombre de chambres, lien vers la fiche Kéroul, et tous les critères d'accessibilité (stationnement, entrée, ascenseur, toilette universelle, unité d'hébergement, salle de bain, piscine, etc.).
- FAQ et méthodologie expliquant la provenance des données et le calcul de la gamme de prix.

## Données et droits

Les données d'accessibilité sont la propriété de [Kéroul](https://www.keroul.qc.ca). Cette application est non officielle, sans lien avec Kéroul, et sert uniquement à naviguer plus facilement leurs données. Aucune utilisation commerciale.

## Structure

```
.
├── index.html          page unique
├── css/style.css
├── js/
│   ├── app.js          logique (carte, filtres, détail)
│   └── data.js         window.HOTELS = [...]  (données des 476 hôtels)
├── test/
│   └── validate.mjs    test d'intégrité des données (node test/validate.mjs)
└── vendor/
    ├── leaflet.js      Leaflet 1.9.4 (vendoré, version figée)
    └── leaflet.css
```

Les données sont chargées via une balise `<script>` (objet global `window.HOTELS`) plutôt que par `fetch`, donc l'application fonctionne aussi bien sur GitHub Pages qu'en ouvrant `index.html` directement dans un navigateur. Les tuiles cartographiques (CARTO) nécessitent une connexion internet.

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
