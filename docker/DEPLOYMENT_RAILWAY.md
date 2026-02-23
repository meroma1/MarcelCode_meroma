# Déployer le proxy Marcel'IA sur Railway

**Railway** est une alternative **plus rapide** au déploiement sur Windows Server : pas de WSL2, pas de Docker Desktop à configurer, pas de pare-feu manuel. En quelques minutes vous avez une URL HTTPS prête pour l’extension.

---

## Pourquoi Railway plutôt que Windows Server ?

| Critère | Windows Server (interne) | Railway |
|--------|---------------------------|--------|
| **Temps de mise en place** | Long (Docker, WSL2 éventuel, pare-feu, .env) | Quelques minutes (GitHub + clics) |
| **HTTPS** | À configurer (IIS ou reverse proxy) | Inclus (URL `*.railway.app`) |
| **PostgreSQL / Redis** | À gérer dans Docker | Ajout en un clic, variables injectées |
| **Mises à jour** | `git pull` + `docker compose build` sur le serveur | Déploiement automatique au push (CI/CD) |
| **Idéal pour** | Réseau interne strict, pas d’accès internet | Démo, équipe distribuée, usage interne avec URL publique |

Si vous n’êtes **pas obligé** d’héberger sur une machine Windows interne, Railway est en général le choix le plus simple et le plus rapide.

---

## Prérequis

- Un compte [Railway](https://railway.app/) (gratuit pour commencer)
- Le dépôt **MarcelCode_meroma** sur GitHub (ou GitLab)
- Vos clés API : **Anthropic** (obligatoire), **OpenAI** (optionnel)

---

## Guide pas à pas (dans l’ordre)

Suivez les étapes dans l’ordre. Comptez environ 10–15 minutes.

---

### Étape 1 : Créer le projet et connecter GitHub

1. Allez sur **[railway.app](https://railway.app/)** et connectez-vous avec **GitHub**.
2. Cliquez sur **« New Project »**.
3. Choisissez **« Deploy from GitHub repo »** (ou **« Add GitHub repo »** selon l’interface).
4. Autorisez Railway sur votre compte GitHub si demandé, puis sélectionnez le dépôt **MarcelCode_meroma**.
5. Validez. Railway crée un **service** à partir du dépôt (premier déploiement peut échouer tant que le Dockerfile n’est pas configuré — c’est normal).

---

### Étape 2 : Ajouter PostgreSQL

1. Dans le **tableau de bord** du projet, cliquez sur **« + New »** (ou **« Add service »**).
2. Choisissez **« Database »** → **« Add PostgreSQL »**.
3. Un nouveau service **PostgreSQL** apparaît. Railway lui attribue automatiquement une variable **`DATABASE_URL`** (ou `DATABASE_PRIVATE_URL`). Vous n’avez rien à copier pour l’instant.

---

### Étape 3 : Ajouter Redis

1. Cliquez à nouveau sur **« + New »**.
2. Choisissez **« Database »** → **« Add Redis »** (ou **Redis** selon la liste).
3. Un service **Redis** est créé avec une variable du type **`REDIS_URL`** ou **`REDIS_PRIVATE_URL`**.

---

### Étape 4 : Configurer le service proxy (celui déployé depuis GitHub)

1. Cliquez sur le **service qui vient du dépôt** (souvent nommé comme votre repo, ex. **MarcelCode_meroma**), pas sur Postgres ni Redis.
2. Allez dans l’onglet **« Variables »** (parfois dans le panneau de droite ou sous **Settings** selon la vue).

**Si l’onglet Variables est vide** : c’est normal. Il n’y a rien tant que vous n’ajoutez pas de variables. Cherchez l’un de ces éléments sur la page :
- Un bouton **« New Variable »** ou **« + New Variable »**
- Un bouton **« Add Variable »** ou une icône **« + »**
- Un lien ou onglet **« RAW Editor »** (permet de coller tout un fichier `.env` d’un coup)

En bas ou en haut de la liste (même vide), vous devriez voir une de ces actions. Si vous ne voyez vraiment aucun bouton, essayez **Settings** (roue dentée) du service puis **Variables**, ou agrandir la fenêtre (sur petit écran certains boutons sont masqués).

3. **Référencer la base et Redis** (pour que le proxy reçoive `DATABASE_URL` et `REDIS_URL`) :
   - Cliquez sur **« + New Variable »** ou **« Add Reference »** / **« Variable »**.
   - Pour **PostgreSQL** : choisissez **« Add variable reference »** (ou **Reference**), puis sélectionnez le **service PostgreSQL** et la variable **`DATABASE_URL`** (ou `DATABASE_PRIVATE_URL`). Nommez la variable **`DATABASE_URL`** dans le service proxy.
   - Pour **Redis** : même chose — référencez le service **Redis** et la variable **`REDIS_URL`** (ou `REDIS_PRIVATE_URL`). Nom de la variable côté proxy : **`REDIS_URL`**.

4. **Dockerfile** : Railway doit utiliser le Dockerfile du proxy.
   - Si vous voyez un champ **« Dockerfile path »** ou **« Dockerfile Path »** dans **Settings** → **Build** : mettez **`packages/proxy/Dockerfile`**.
   - Sinon, dans **Variables**, ajoutez une variable :
     - **Nom** : `RAILWAY_DOCKERFILE_PATH`
     - **Valeur** : `packages/proxy/Dockerfile`

5. **Root Directory** (obligatoire pour le monorepo) : dans **Settings** → **Build** (ou **General**), cherchez **« Root Directory »** ou **« Répertoire racine »** / **« Source »**. Il doit être **vide** (ou `.`). **Ne mettez pas** `packages/proxy` : sinon Railway ne clone que ce dossier, le package `@marcelia/shared` est absent et le build échoue avec « Impossible de trouver le module '@marcelia/shared' ».

---

### Étape 5 : Ajouter les autres variables d’environnement

Toujours dans **Variables** du **service proxy**, ajoutez :

| Variable | Valeur | Obligatoire |
|----------|--------|-------------|
| `ANTHROPIC_API_KEY` | Votre clé Anthropic (`sk-ant-...`) | Oui |
| `OPENAI_API_KEY` | Votre clé OpenAI ou laisser vide | Non (pour transcription) |
| `NODE_ENV` | `production` | Recommandé |
| `CORS_ORIGIN` | `*` (démo) ou `https://votre-domaine.com` | Oui |
| `REQUIRE_AUTH` | `false` (sans Azure) ou `true` | Oui |

Si vous utilisez **Azure AD** (`REQUIRE_AUTH=true`), ajoutez aussi :

- `AZURE_TENANT_ID`
- `AZURE_CLIENT_ID`
- `AZURE_AUDIENCE` (ex. `api://marcelia`)

**Liste complète des variables du service proxy** (il faut bien toutes les avoir) :

| Variable | Comment l’ajouter | Obligatoire |
|----------|-------------------|-------------|
| `DATABASE_URL` | **Référence** au service PostgreSQL (étape 4) — ne pas copier depuis votre `.env` | Oui |
| `REDIS_URL` | **Référence** au service Redis (étape 4) — ne pas copier depuis votre `.env` | Oui |
| `RAILWAY_DOCKERFILE_PATH` | Valeur : `packages/proxy/Dockerfile` | Oui |
| `ANTHROPIC_API_KEY` | Copier depuis votre `.env` (votre clé `sk-ant-...`) | Oui |
| `OPENAI_API_KEY` | Copier depuis votre `.env` ou laisser vide | Non |
| `NODE_ENV` | `production` | Recommandé |
| `CORS_ORIGIN` | Copier depuis votre `.env` (ex. `*` ou votre domaine) | Oui |
| `REQUIRE_AUTH` | Copier depuis votre `.env` (ex. `false`) | Oui |
| `AZURE_*` (si auth) | Copier depuis votre `.env` si `REQUIRE_AUTH=true` | Si auth |

En résumé : **d’abord** ajouter `DATABASE_URL` et `REDIS_URL` en **référence** (étape 4), **puis** ajouter les autres (clés API, CORS, etc.) en les copiant depuis votre `.env` ou en les saisissant.

**Quand vous cliquez « Ajouter variable »** : Railway peut afficher **« ENV »** ou **« Environment »** — choisissez **Production**. Puis remplissez **Nom** et **Valeur**. Pour `DATABASE_URL` et `REDIS_URL`, utilisez toujours l’option **Reference** (lier au service Postgres / Redis), pas une valeur collée.

**Option rapide – RAW Editor** : vous pouvez coller au format `.env` les variables que vous copiez depuis votre `.env` (ANTHROPIC_API_KEY, CORS_ORIGIN, REQUIRE_AUTH, etc.). **Dans le RAW Editor vous ne pouvez pas créer de référence** : `DATABASE_URL` et `REDIS_URL` doivent être ajoutées **à part**, via le bouton « New Variable » + « Add Reference » (ou équivalent). Si le RAW Editor accepte la syntaxe Railway, vous pouvez aussi ajouter : `DATABASE_URL=${{ NomDuServicePostgres.DATABASE_URL }}` et `REDIS_URL=${{ NomDuServiceRedis.REDIS_URL }}` en remplaçant par les noms réels des services dans votre projet.

---

### Étape 6 : Exposer l’URL (domaine public)

1. Dans le **service proxy**, allez dans **« Settings »**.
2. Descendez jusqu’à la section **« Réseautage »** (ou **Networking** / **Public Networking**).
3. **Ne pas cliquer sur « + Proxy TCP »** : ce bouton expose en TCP brut, pas en HTTP. Pour Marcel'IA il faut un domaine HTTP.
4. Cliquez sur **« Générer le domaine »** (ou **Generate Domain** / **Add domain** selon la langue).
5. Si Railway demande un **port** : saisir **3000** (le proxy Marcel'IA écoute sur le port 3000).
6. **Après avoir cliqué** : Railway affiche **« Le domaine public sera généré »**. C’est normal — le domaine est en cours de création. Attendez quelques secondes, puis :
   - **Rafraîchir la page** (F5) et retourner dans **Settings** → **Networking** : une ligne avec le domaine (ex. `xxx.up.railway.app`) peut apparaître dans la liste des domaines.
   - Ou aller dans l’onglet **Variables** du même service et chercher **`RAILWAY_PUBLIC_DOMAIN`** : la valeur est la partie domaine de l’URL ; l’URL complète est **`https://`** + cette valeur.
6. **Si le message « Le domaine public sera généré » reste affiché longtemps** : ne pas attendre qu’il change. Fermez la fenêtre ou l’onglet si besoin, puis :
   - **Variables** : ouvrez l’onglet **Variables** du service proxy et cherchez **`RAILWAY_PUBLIC_DOMAIN`**. Si elle existe, l’URL est **`https://`** + sa valeur.
   - **Réseautage** : rafraîchissez la page (F5), retournez dans **Settings** → **Réseautage** ; une ligne avec le domaine peut apparaître même si le message n’a pas disparu.
   - **Déploiement** : si aucun déploiement n’est encore en **Succès** / **Active**, le domaine peut n’être visible qu’après un premier déploiement réussi. Déclenchez un **Redeploy** puis revérifiez Variables ou Réseautage.
7. **Le domaine peut s’afficher même si le déploiement a échoué** : dans ce cas, l’URL (ex. `xxx.up.railway.app`) est visible mais l’application ne répond pas tant qu’un déploiement n’a pas réussi. Il faut corriger la cause de l’échec puis **Redeploy** (voir « Déploiement a échoué » ci-dessous).
8. **Si vous ne voyez toujours pas l’URL** : sur le tableau de bord, cliquez sur la **carte du service** : l’URL peut s’afficher en bas (lien « Open » / « Visit »).
9. Notez l’URL (format **`https://quelquechose.up.railway.app`**) pour l’étape 8 (vérification).
10. Vérifiez que le **port** cible du domaine est **3000** (éditable via l’icône crayon à côté du domaine si Railway le propose).

---

### Étape 7 : Déployer et lancer les migrations

1. Déclenchez un **nouveau déploiement** : onglet **« Deployments »** → **« Redeploy »** (ou poussez un commit sur la branche connectée). Railway va rebuilder avec le Dockerfile `packages/proxy/Dockerfile`.
2. Attendez que le statut soit **« Success »** / **« Active »**.
3. **Migrations Prisma** (une seule fois après le premier déploiement réussi) :
   - **Option A** : Dans Railway, ouvrez le service proxy → onglet **« Settings »** ou **« Deploy »**. S’il existe **« Run command »** / **« One-off »** / **« Shell »**, exécutez :
     ```bash
     npx prisma migrate deploy --schema=packages/proxy/src/prisma/schema.prisma
     ```
   - **Option B** : En local, à la racine du repo, avec la **même** `DATABASE_URL` que Railway (copiez-la depuis le service PostgreSQL → Variables) :
     ```bash
     cd c:\Users\romeongbe\Documents\GitHub\MarcelCode_meroma
     set DATABASE_URL=postgresql://...   # coller l’URL depuis Railway
     npx prisma migrate deploy --schema=packages/proxy/src/prisma/schema.prisma
     ```
     (Sous PowerShell : `$env:DATABASE_URL="postgresql://..."; npx prisma migrate deploy --schema=packages/proxy/src/prisma/schema.prisma`)

---

### Étape 8 : Vérifier et configurer l’extension

1. Dans le navigateur, ouvrez : **`https://votre-domaine.up.railway.app/health`**.  
   Vous devez voir : `{"status":"ok"}` (ou similaire).
2. Dans **VS Code** : **Paramètres** (`Ctrl+,`) → rechercher **« Marcel'IA: Proxy Url »** → mettez **`https://votre-domaine.up.railway.app`** (sans `/health`).
3. Testez le chat Marcel'IA dans VS Code ; il doit passer par le proxy Railway.

---

## En cas de problème

- **« Impossible de trouver le module '@marcelia/shared' »** (sur Railway) : Railway utilise **Railpack** et ne build que le proxy, sans builder **shared** avant. Le dépôt contient maintenant un fichier **`railpack.json`** à la racine qui impose l’ordre : build shared → prisma generate → build proxy. **Faites un commit + push** (fichiers `railpack.json` et éventuellement `package.json` avec `build:proxy` mis à jour), puis **Redeploy**. Si vous utilisiez un Dockerfile (`RAILWAY_DOCKERFILE_PATH`), vérifiez aussi que **Root Directory** est vide (racine du dépôt).
- **Déploiement a échoué** : le domaine peut déjà s’afficher, mais l’app ne répond pas tant qu’un déploiement n’a pas réussi. Ouvrez l’onglet **Deployments** du service proxy, cliquez sur le déploiement en échec, puis **View logs** (ou **Logs**). Causes fréquentes :
  - **Build** : `RAILWAY_DOCKERFILE_PATH=packages/proxy/Dockerfile` absent ou mal orthographié ; **Root Directory doit rester vide** (racine du repo).
  - **Runtime** : `DATABASE_URL` ou `REDIS_URL` manquant ou incorrect — doivent être des **références** aux services PostgreSQL et Redis.
  - **Variables** : `ANTHROPIC_API_KEY` ou autre variable obligatoire manquante. Corrigez puis **Redeploy**.
- **Build échoue (Docker)** : vérifiez que `RAILWAY_DOCKERFILE_PATH=packages/proxy/Dockerfile` est bien défini et que la racine du repo est bien utilisée (Root Directory vide).
- **Erreur de connexion à la base** : vérifiez que `DATABASE_URL` est bien une **reference** au service PostgreSQL (pas une chaîne saisie à la main).
- **Erreur Redis** : idem, `REDIS_URL` doit référencer le service Redis. Si Railway expose `REDIS_PRIVATE_URL`, référencez celle-ci mais nommez la variable `REDIS_URL` dans le proxy.
- **502 / Service Unavailable** : attendez 1–2 min après le déploiement ; si ça persiste, consultez les **logs** du service proxy (onglet **Deployments** → clic sur le déploiement → **View logs**).

---

## Résumé (checklist)

| # | Action |
|---|--------|
| 1 | Projet Railway → Deploy from GitHub (MarcelCode_meroma) |
| 2 | + New → Database → Add PostgreSQL |
| 3 | + New → Database → Add Redis |
| 4 | Service proxy : `RAILWAY_DOCKERFILE_PATH` = `packages/proxy/Dockerfile` ; référencer `DATABASE_URL` et `REDIS_URL` |
| 5 | Variables : `ANTHROPIC_API_KEY`, `CORS_ORIGIN`, `REQUIRE_AUTH`, etc. |
| 6 | Generate Domain (URL HTTPS) |
| 7 | Redeploy puis migrations Prisma (one-off ou en local) |
| 8 | Tester `/health` et configurer **Marcel'IA: Proxy Url** dans VS Code |

Après ça, chaque **push** sur la branche connectée déclenche un nouveau déploiement.
