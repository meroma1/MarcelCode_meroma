#!/bin/bash

# Script de déploiement Marcel'IA Proxy
# Usage: ./deploy.sh [production|dev]

set -e

ENV=${1:-production}
COMPOSE_FILE="docker-compose.yml"

if [ "$ENV" = "dev" ]; then
  COMPOSE_FILE="docker-compose.dev.yml"
fi

echo "🚀 Déploiement Marcel'IA Proxy en mode: $ENV"

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
  echo "❌ Docker n'est pas installé. Veuillez installer Docker d'abord."
  exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
  echo "❌ Docker Compose n'est pas installé."
  exit 1
fi

# Vérifier que le fichier .env existe
if [ ! -f ".env" ]; then
  echo "⚠️  Le fichier .env n'existe pas."
  if [ "$ENV" = "production" ]; then
    echo "📋 Création du fichier .env à partir de .env.production.example..."
    cp .env.production.example .env
    echo "✏️  Veuillez éditer le fichier .env avec vos valeurs avant de continuer."
    exit 1
  else
    echo "📋 Création du fichier .env à partir de .env.example..."
    cp .env.example .env
  fi
fi

# Construire les images
echo "🔨 Construction des images Docker..."
docker-compose -f $COMPOSE_FILE build

# Démarrer les services
echo "🚀 Démarrage des services..."
docker-compose -f $COMPOSE_FILE up -d

# Attendre que les services soient prêts
echo "⏳ Attente du démarrage des services..."
sleep 10

# Initialiser la base de données
echo "🗄️  Initialisation de la base de données..."
docker-compose -f $COMPOSE_FILE exec -T proxy npx prisma generate --schema=packages/proxy/src/prisma/schema.prisma || true
docker-compose -f $COMPOSE_FILE exec -T proxy npx prisma migrate deploy --schema=packages/proxy/src/prisma/schema.prisma || echo "⚠️  Les migrations ont peut-être déjà été appliquées"

# Vérifier le statut
echo "✅ Vérification du statut..."
docker-compose -f $COMPOSE_FILE ps

echo ""
echo "✅ Déploiement terminé !"
echo ""
echo "📊 Pour voir les logs :"
echo "   docker-compose -f $COMPOSE_FILE logs -f proxy"
echo ""
echo "🌐 Le proxy est accessible sur : http://localhost:3000"
echo "   (ou l'URL configurée dans votre .env)"
echo ""
echo "📝 N'oubliez pas de configurer l'extension VS Code pour pointer vers ce serveur :"
echo "   Paramètres → Marcel'IA: Proxy Url → http://VOTRE-SERVEUR:3000"
