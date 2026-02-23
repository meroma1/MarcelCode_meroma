# Marcel'IA Proxy - Déploiement

Ce dossier contient les configurations Docker pour déployer le proxy Marcel'IA.

## Fichiers

- `docker-compose.dev.yml` : Configuration pour le développement local
- `docker-compose.yml` : Configuration pour la production
- `.env.production.example` : Exemple de variables d'environnement pour la production
- `DEPLOYMENT.md` : Guide complet de déploiement (Linux)
- `DEPLOYMENT_WINDOWS.md` : Guide spécifique pour Windows Server
- `DEPLOYMENT_INTERNE_WINDOWS.md` : Déploiement interne sans HTTPS (Windows Server + Docker)
- `DEPLOYMENT_OPENSOURCE.md` : Serveurs et plateformes open source compatibles
- `DEPLOYMENT_VERCEL.md` : Déploiement sur Vercel (contraintes et alternatives)
- `deploy.sh` : Script de déploiement pour Linux/Mac
- `deploy.ps1` : Script de déploiement pour Windows/PowerShell

## Développement local

```bash
# Démarrer les services
docker-compose -f docker-compose.dev.yml up -d

# Voir les logs
docker-compose -f docker-compose.dev.yml logs -f proxy

# Arrêter les services
docker-compose -f docker-compose.dev.yml down
```

## Production

Voir `DEPLOYMENT.md` pour le guide complet de déploiement sur un serveur distant.

### Démarrage rapide

```bash
# 1. Configurer les variables d'environnement
cp .env.production.example .env
# Éditer .env avec vos valeurs

# 2. Démarrer les services
docker-compose up -d

# 3. Initialiser la base de données
docker-compose exec proxy npx prisma migrate deploy --schema=packages/proxy/src/prisma/schema.prisma
```

## Configuration de l'extension VS Code

Sur chaque machine cliente, configurez l'URL du proxy dans VS Code :

1. Ouvrez les paramètres (`Ctrl+,`)
2. Recherchez "Marcel'IA: Proxy Url"
3. Entrez l'URL de votre serveur : `https://votre-serveur.com` ou `http://IP:3000`
