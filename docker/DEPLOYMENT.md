# Guide de déploiement Marcel'IA Proxy

Ce guide explique comment déployer le proxy Marcel'IA sur un serveur distant pour que plusieurs machines puissent utiliser l'extension VS Code.

> **Note** : Pour un déploiement **rapide** (sans serveur à gérer), préférez **[Railway](./DEPLOYMENT_RAILWAY.md)**. Pour Windows Server, consultez [`DEPLOYMENT_WINDOWS.md`](./DEPLOYMENT_WINDOWS.md) ou [`DEPLOYMENT_INTERNE_WINDOWS.md`](./DEPLOYMENT_INTERNE_WINDOWS.md). Pour une liste de serveurs et plateformes open source compatibles, voir [`DEPLOYMENT_OPENSOURCE.md`](./DEPLOYMENT_OPENSOURCE.md).

## Prérequis

- Serveur Linux avec Docker et Docker Compose installés (ou Windows Server avec Docker Desktop/WSL2)
- Accès SSH au serveur (ou RDP pour Windows Server)
- Clés API : Anthropic (obligatoire), OpenAI (optionnel pour transcription)

## Étapes de déploiement

### 1. Préparer le serveur

```bash
# Sur votre serveur, clonez le repository
git clone <votre-repo>
cd MarcelCode_meroma/docker
```

### 2. Configurer les variables d'environnement

```bash
# Copier le fichier d'exemple
cp .env.production.example .env

# Éditer le fichier .env avec vos valeurs
nano .env  # ou votre éditeur préféré
```

**Variables importantes à configurer :**

- `ANTHROPIC_API_KEY` : Votre clé API Anthropic (obligatoire)
- `OPENAI_API_KEY` : Votre clé API OpenAI (optionnel, pour transcription vocale)
- `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `AZURE_AUDIENCE` : Configuration Azure AD
- `POSTGRES_PASSWORD` : **Changez le mot de passe par défaut !**
- `CORS_ORIGIN` : Liste des domaines autorisés (ex: `https://votre-domaine.com,https://*.votre-domaine.com`)
- `REQUIRE_AUTH=true` : Active l'authentification Azure AD en production

### 3. Construire et démarrer les services

```bash
# Construire les images
docker-compose build

# Démarrer les services en arrière-plan
docker-compose up -d

# Vérifier que tout fonctionne
docker-compose ps
docker-compose logs -f proxy
```

### 4. Initialiser la base de données

```bash
# Générer le client Prisma
docker-compose exec proxy npx prisma generate --schema=packages/proxy/src/prisma/schema.prisma

# Appliquer les migrations
docker-compose exec proxy npx prisma migrate deploy --schema=packages/proxy/src/prisma/schema.prisma

# (Optionnel) Charger les données initiales
docker-compose exec proxy npm run db:seed -w packages/proxy
```

### 5. Configurer le pare-feu

Ouvrez le port 3000 sur votre serveur :

```bash
# Exemple avec ufw (Ubuntu)
sudo ufw allow 3000/tcp

# Ou configurez votre pare-feu cloud (AWS Security Group, Azure NSG, etc.)
```

### 6. Configurer un reverse proxy (recommandé)

Pour la production, utilisez Nginx ou Traefik comme reverse proxy avec HTTPS :

**Exemple Nginx :**

```nginx
server {
    listen 443 ssl;
    server_name marcelia.votre-domaine.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 7. Configurer l'extension VS Code sur les machines clientes

Sur chaque machine où l'extension est installée :

1. Ouvrez les paramètres VS Code (`Ctrl+,`)
2. Recherchez "Marcel'IA: Proxy Url"
3. Modifiez la valeur pour pointer vers votre serveur :
   ```
   https://marcelia.votre-domaine.com
   ```
   ou
   ```
   http://IP-DU-SERVEUR:3000
   ```

4. Désactivez le mode dev si nécessaire :
   - Recherchez "Marcel'IA: Dev Mode"
   - Décochez la case (ou mettez `false` dans settings.json)

## Vérification

### Tester depuis une machine cliente

```bash
# Test de santé
curl http://votre-serveur:3000/health

# Devrait retourner : {"status":"ok"}
```

### Vérifier les logs

```bash
# Logs du proxy
docker-compose logs -f proxy

# Logs de tous les services
docker-compose logs -f
```

## Maintenance

### Mettre à jour le proxy

```bash
cd docker
git pull
docker-compose build proxy
docker-compose up -d proxy
```

### Sauvegarder la base de données

```bash
# Créer une sauvegarde
docker-compose exec postgres pg_dump -U marcelia marcelia > backup_$(date +%Y%m%d).sql

# Restaurer une sauvegarde
docker-compose exec -T postgres psql -U marcelia marcelia < backup_20260220.sql
```

### Redémarrer les services

```bash
docker-compose restart
```

## Sécurité

- ✅ Changez `POSTGRES_PASSWORD` en production
- ✅ Utilisez HTTPS avec un reverse proxy
- ✅ Configurez `CORS_ORIGIN` pour limiter les domaines autorisés
- ✅ Activez `REQUIRE_AUTH=true` en production
- ✅ Ne commitez jamais le fichier `.env`
- ✅ Utilisez des secrets Docker ou un gestionnaire de secrets pour les clés API

## Dépannage

### Le proxy ne démarre pas

```bash
# Vérifier les logs
docker-compose logs proxy

# Vérifier que les variables d'environnement sont chargées
docker-compose exec proxy env | grep ANTHROPIC_API_KEY
```

### Erreur de connexion depuis l'extension

- Vérifiez que le port 3000 est accessible depuis l'extérieur
- Vérifiez la configuration `CORS_ORIGIN`
- Vérifiez que `marcelia.proxyUrl` dans VS Code pointe vers le bon serveur

### Base de données non initialisée

```bash
# Réinitialiser la base de données
docker-compose down -v
docker-compose up -d
docker-compose exec proxy npx prisma migrate deploy --schema=packages/proxy/src/prisma/schema.prisma
```
