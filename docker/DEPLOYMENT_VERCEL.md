# Déployer le proxy Marcel'IA sur Vercel ?

## Réponse courte

**C’est possible en théorie**, mais avec des **contraintes fortes** et des **adaptations**. Pour un proxy avec chat en streaming, base de données et Redis, un hébergement **Node.js classique** (Railway, Render, Fly.io, Docker/VPS) est en général **mieux adapté** que Vercel.

---

## Pourquoi c’est délicat sur Vercel

| Aspect | Proxy Marcel'IA | Vercel |
|--------|------------------|--------|
| **Type d’app** | Serveur Express **long-running** (écoute sur un port, connexions persistantes). | **Serverless** : une fonction par requête, pas de processus qui tourne en continu. |
| **Streaming (chat)** | Réponses **SSE** (`text/event-stream`) qui peuvent durer longtemps (plusieurs dizaines de secondes). | Timeout des fonctions : **10 s** (Hobby), **60 s** (Pro), **300 s** (Enterprise). Une réponse plus longue est coupée. |
| **Base de données** | **PostgreSQL** + **Prisma** (connexions persistantes possibles). | Connexions persistantes déconseillées ; il faut une base externe + **connection pooler** (ex. Neon, Vercel Postgres). |
| **Redis** | **ioredis** (connexion persistante). | Pas de Redis inclus ; il faut un Redis externe (ex. **Upstash**) compatible serverless. |

En résumé : le proxy est pensé pour un **serveur Node.js toujours allumé** ; Vercel exécute des **fonctions courtes et sans état**. On peut adapter, mais avec des limites (surtout sur la durée du streaming).

---

## Ce qu’il faudrait faire pour Vercel

1. **Exposer Express en serverless**  
   Utiliser un adapter (ex. `@vercel/node`) pour qu’une seule fonction Vercel reçoive toutes les requêtes et les envoie à l’app Express (une entrée du type `api/index.ts` qui appelle `createApp()` et utilise `req`/`res`).

2. **Base de données**  
   Utiliser une base **externe** (Neon, Vercel Postgres, etc.) avec une **chaîne de connexion “pooler”** (Prisma recommande un pooler en serverless). Adapter la config Prisma et les variables d’environnement.

3. **Redis**  
   Remplacer ou configurer le client pour utiliser un Redis **serverless** (ex. Upstash) avec API HTTP ou client compatible court cycle de vie.

4. **Streaming**  
   Garder le SSE tel quel dans la fonction. Attention : si une réponse dépasse le **timeout** de la fonction (60 s en Pro), la connexion sera coupée côté Vercel. Pour des réponses très longues, ce n’est pas viable.

5. **Upload de fichiers (transcription)**  
   Vérifier les **limites de taille** et de durée des fonctions Vercel ; multer devra s’exécuter dans la même fonction (pas de processus séparé).

6. **Variables d’environnement**  
   Tout mettre dans les env Vercel (ANTHROPIC_API_KEY, OPENAI_API_KEY, DATABASE_URL, REDIS_URL, etc.).

---

## Recommandation

- **Pour tester / petit usage** : une tentative sur Vercel est possible si vous acceptez les limites (timeout 60 s sur le streaming, cold starts, config DB/Redis externe).
- **Pour un usage sérieux / production** : déployer le **même code** (sans le réécrire en “serverless first”) sur une plateforme qui fait tourner un **serveur Node.js** :
  - **Railway**
  - **Render** (Web Service)
  - **Fly.io**
  - **VPS** (Ubuntu/Debian) + Docker (voir `DEPLOYMENT.md`)

Ces options gardent le modèle actuel du proxy (Express + streaming long + PostgreSQL + Redis) sans plafond de durée de réponse ni adaptation serverless.

---

## En résumé

| Question | Réponse |
|----------|--------|
| Peut-on déployer le proxy sur Vercel ? | Oui, en adaptant (adapter Express, DB externe, Redis externe). |
| Le dossier `dist` suffit-il sur Vercel ? | Non : Vercel ne “lance” pas un binaire Node ; il faut une **fonction** (entrypoint) qui appelle l’app Express. |
| Le chat en streaming marchera bien ? | Seulement si les réponses restent **sous le timeout** (ex. 60 s). Sinon, la connexion sera coupée. |
| Meilleure option pour ce proxy ? | Hébergement **Node.js long-running** (Railway, Render, Fly.io ou Docker sur un serveur). |

Si vous voulez, on peut détailler les étapes concrètes pour **une** de ces plateformes (par ex. Railway ou Render) plutôt que Vercel.
