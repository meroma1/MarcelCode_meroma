# Guide de déploiement Marcel'IA Proxy sur Windows Server

Ce guide explique comment déployer le proxy Marcel'IA sur Windows Server.

**En bref** : Le proxy est une **application Node.js** qui tourne dans **Docker** (avec PostgreSQL et Redis). Le **build** (`docker-compose build` / `up`) sert à **lancer cette application**. **IIS** n’héberge pas le code : c’est un **reverse proxy** optionnel devant le proxy (HTTPS → redirection vers le proxy sur `localhost:3000`). Voir la section *Comprendre le déploiement : Build Docker vs IIS* pour le détail.

## Prérequis

- **Windows Server 2019 ou plus récent** (recommandé : Windows Server 2022)
- **Docker Desktop pour Windows** OU **Docker Engine avec WSL2**
- Accès administrateur au serveur
- Clés API : Anthropic (obligatoire), OpenAI (optionnel pour transcription)

## Option 1 : Docker Desktop (Recommandé)

### Installation

1. **Télécharger Docker Desktop** :
   - Téléchargez depuis : https://www.docker.com/products/docker-desktop/
   - Installez Docker Desktop pour Windows Server

2. **Activer WSL2** (si pas déjà fait) :
   ```powershell
   # Exécuter en tant qu'administrateur
   wsl --install
   # Redémarrer le serveur si nécessaire
   ```

3. **Vérifier l'installation** :
   ```powershell
   docker --version
   docker-compose --version
   ```

### Déploiement

1. **Cloner le repository** :
   ```powershell
   git clone <votre-repo>
   cd MarcelCode_meroma\docker
   ```

2. **Configurer les variables d'environnement** :
   ```powershell
   Copy-Item .env.production.example .env
   notepad .env  # Éditer avec vos valeurs
   ```

3. **Déployer avec le script** :
   ```powershell
   .\deploy.ps1 production
   ```

   Ou manuellement :
   ```powershell
   docker-compose build
   docker-compose up -d
   docker-compose exec proxy npx prisma migrate deploy --schema=packages/proxy/src/prisma/schema.prisma
   ```

## Option 2 : Docker Engine avec WSL2 (Sans Docker Desktop)

### Installation

1. **Installer WSL2** :
   ```powershell
   # En tant qu'administrateur
   wsl --install
   Restart-Computer
   ```

2. **Installer Docker Engine dans WSL2** :
   ```bash
   # Dans WSL2 (Ubuntu)
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER
   ```

3. **Installer Docker Compose** :
   ```bash
   sudo apt-get update
   sudo apt-get install docker-compose-plugin
   ```

### Déploiement

1. **Dans WSL2** :
   ```bash
   git clone <votre-repo>
   cd MarcelCode_meroma/docker
   cp .env.production.example .env
   nano .env  # Éditer avec vos valeurs
   
   docker compose build
   docker compose up -d
   docker compose exec proxy npx prisma migrate deploy --schema=packages/proxy/src/prisma/schema.prisma
   ```

## Configuration du pare-feu Windows

Ouvrez le port 3000 dans le pare-feu Windows :

```powershell
# En tant qu'administrateur
New-NetFirewallRule -DisplayName "MarcelIA Proxy" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

Ou via l'interface graphique :
1. Ouvrez "Pare-feu Windows Defender avec sécurité avancée"
2. Cliquez sur "Règles de trafic entrant" → "Nouvelle règle"
3. Sélectionnez "Port" → TCP → 3000
4. Autoriser la connexion
5. Appliquez à tous les profils

## Comprendre le déploiement : Build Docker vs IIS

| Étape | Rôle | Où ça tourne |
|-------|------|----------------|
| **Build Docker** (`docker-compose build` / `docker-compose up -d`) | Construit et **lance** l’application Marcel'IA (proxy Node.js + PostgreSQL + Redis). C’est **l’application elle-même**. | Dans des **conteneurs Docker** (ou WSL2). Le proxy écoute sur **http://localhost:3000**. |
| **IIS** (optionnel) | Ne fait **pas** tourner le code du proxy. IIS sert uniquement de **reverse proxy** : il reçoit les requêtes HTTPS (port 443) et les **redirige** vers le proxy qui tourne déjà sur `localhost:3000`. | Service Windows **IIS** (site ou application) en frontal. |

En résumé :
- Le **build du proxy** sert à **déployer l’application** (Node.js + BDD + Redis) dans Docker. Ce n’est **pas** un déploiement “sur un site IIS”.
- **IIS** n’héberge pas le code du proxy ; il se place **devant** le proxy pour exposer HTTPS et (optionnel) un nom de domaine.

Schéma du flux :

```
[Client VS Code]  →  HTTPS (443)  →  [IIS - reverse proxy]  →  HTTP (localhost:3000)  →  [Proxy Marcel'IA dans Docker]
```

Sans IIS : les clients peuvent accéder directement au proxy en **http://IP-du-serveur:3000** (après ouverture du pare-feu). Avec IIS : les clients utilisent **https://votre-domaine.com** et IIS transmet au proxy sur 3000.

---

## Configuration IIS comme Reverse Proxy (Optionnel)

IIS ne remplace pas Docker : le proxy doit déjà tourner (via `docker-compose up -d`). IIS sert uniquement à exposer le service en HTTPS devant ce proxy.

1. **Installer ARR (Application Request Routing)** :
   - Téléchargez depuis : https://www.iis.net/downloads/microsoft/application-request-routing
   - Installez le module

2. **Configurer le reverse proxy** :
   - Ouvrez IIS Manager
   - Créez un nouveau site (ou utilisez un site existant)
   - Ajoutez une règle de réécriture d’URL qui envoie tout le trafic vers le proxy :
     ```
     Pattern: ^(.*)
     Rewrite URL: http://localhost:3000/{R:1}
     ```
   - Ainsi : `https://votre-site.com/api/...` → `http://localhost:3000/api/...`

3. **Configurer HTTPS** :
   - Installez un certificat SSL dans IIS
   - Configurez les bindings HTTPS (port 443)

## Variables d'environnement importantes

Dans votre fichier `.env`, configurez :

```env
# URL publique de votre serveur (pour CORS)
CORS_ORIGIN=https://votre-domaine.com,https://*.votre-domaine.com

# Ou pour un accès direct par IP
CORS_ORIGIN=http://VOTRE-IP:3000

# Authentification (activez en production)
REQUIRE_AUTH=true

# Mot de passe PostgreSQL (changez-le !)
POSTGRES_PASSWORD=votre-mot-de-passe-securise
```

## Vérification

### Tester depuis le serveur

```powershell
# Test de santé
Invoke-WebRequest -Uri http://localhost:3000/health

# Devrait retourner : {"status":"ok"}
```

### Tester depuis une machine distante

```powershell
# Depuis une autre machine
Invoke-WebRequest -Uri http://VOTRE-SERVEUR-IP:3000/health
```

## Gestion des services

### Voir les logs

```powershell
docker-compose logs -f proxy
```

### Redémarrer les services

```powershell
docker-compose restart
```

### Arrêter les services

```powershell
docker-compose down
```

### Mettre à jour

```powershell
git pull
docker-compose build proxy
docker-compose up -d proxy
```

## Dépannage

### Erreur : "Cannot connect to the Docker daemon"

**Solution** : Vérifiez que le service Docker est démarré :
```powershell
Get-Service docker
Start-Service docker
```

### Erreur : "WSL 2 installation is incomplete"

**Solution** : Installez WSL2 complètement :
```powershell
wsl --install
wsl --update
Restart-Computer
```

### Erreur : Port 3000 déjà utilisé

**Solution** : Changez le port dans `docker-compose.yml` :
```yaml
ports:
  - "3001:3000"  # Utilisez 3001 au lieu de 3000
```

Puis mettez à jour `CORS_ORIGIN` et l'URL dans VS Code.

### Les conteneurs ne démarrent pas

**Solution** : Vérifiez les logs :
```powershell
docker-compose logs
docker ps -a
```

### Problème de permissions avec les volumes

**Solution** : Les volumes Docker sur Windows utilisent des chemins virtuels. Si vous avez des problèmes, vérifiez que Docker Desktop a accès aux lecteurs nécessaires dans les paramètres.

## Configuration de l'extension VS Code

Sur chaque machine cliente, configurez l'URL du proxy :

1. Ouvrez VS Code
2. Paramètres (`Ctrl+,`)
3. Recherchez "Marcel'IA: Proxy Url"
4. Entrez : `http://VOTRE-SERVEUR-IP:3000` ou `https://votre-domaine.com`

## Sécurité

- ✅ Changez `POSTGRES_PASSWORD` en production
- ✅ Utilisez HTTPS avec IIS ou un reverse proxy
- ✅ Configurez `CORS_ORIGIN` pour limiter les domaines autorisés
- ✅ Activez `REQUIRE_AUTH=true` en production
- ✅ Ne commitez jamais le fichier `.env`
- ✅ Utilisez un pare-feu pour limiter l'accès au port 3000 si nécessaire

## Performance

Pour de meilleures performances sur Windows Server :

1. **Allouez suffisamment de ressources à Docker** :
   - Dans Docker Desktop : Settings → Resources
   - CPU : Au moins 2 cœurs
   - RAM : Au moins 4 GB

2. **Utilisez WSL2** plutôt que Hyper-V si possible

3. **Surveillez les ressources** :
   ```powershell
   docker stats
   ```

## Support

Pour plus d'aide, consultez :
- `DEPLOYMENT.md` pour la documentation générale
- Les logs Docker : `docker-compose logs -f`
