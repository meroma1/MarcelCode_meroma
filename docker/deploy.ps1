# Script de déploiement Marcel'IA Proxy pour PowerShell
# Usage: .\deploy.ps1 [production|dev]

param(
    [string]$Env = "production"
)

$ErrorActionPreference = "Stop"

$ComposeFile = "docker-compose.yml"
if ($Env -eq "dev") {
    $ComposeFile = "docker-compose.dev.yml"
}

Write-Host "🚀 Déploiement Marcel'IA Proxy en mode: $Env" -ForegroundColor Cyan

# Vérifier que Docker est installé
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker n'est pas installé." -ForegroundColor Red
    Write-Host "   Sur Windows Server, installez Docker Desktop ou Docker Engine avec WSL2." -ForegroundColor Yellow
    Write-Host "   Voir DEPLOYMENT_WINDOWS.md pour les instructions détaillées." -ForegroundColor Yellow
    exit 1
}

# Vérifier que Docker est en cours d'exécution
try {
    docker ps | Out-Null
} catch {
    Write-Host "❌ Docker n'est pas démarré. Démarrez le service Docker." -ForegroundColor Red
    Write-Host "   PowerShell (admin): Start-Service docker" -ForegroundColor Yellow
    exit 1
}

# Utiliser "docker compose" (plugin) si disponible, sinon "docker-compose" (standalone)
$ComposeArgs = @("-f", $ComposeFile)
$ComposeInvoke = @("docker-compose") + $ComposeArgs
& docker compose version 2>&1 | Out-Null
if ($?) { $ComposeInvoke = @("docker", "compose") + $ComposeArgs }

# Vérifier que le fichier .env existe
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  Le fichier .env n'existe pas." -ForegroundColor Yellow
    if ($Env -eq "production") {
        Write-Host "📋 Création du fichier .env à partir de .env.production.example..." -ForegroundColor Yellow
        Copy-Item ".env.production.example" ".env"
        Write-Host "✏️  Veuillez éditer le fichier .env avec vos valeurs avant de continuer." -ForegroundColor Yellow
        exit 1
    } else {
        Write-Host "📋 Création du fichier .env à partir de .env.example..." -ForegroundColor Yellow
        Copy-Item ".env.example" ".env"
    }
}

# Construire les images
Write-Host "🔨 Construction des images Docker..." -ForegroundColor Cyan
& $ComposeInvoke[0] $ComposeInvoke[1..($ComposeInvoke.Length-1)] build

# Démarrer les services
Write-Host "🚀 Démarrage des services..." -ForegroundColor Cyan
& $ComposeInvoke[0] $ComposeInvoke[1..($ComposeInvoke.Length-1)] up -d

# Attendre que les services soient prêts
Write-Host "⏳ Attente du démarrage des services..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# Initialiser la base de données
Write-Host "🗄️  Initialisation de la base de données..." -ForegroundColor Cyan
& $ComposeInvoke[0] $ComposeInvoke[1..($ComposeInvoke.Length-1)] exec -T proxy npx prisma generate --schema=packages/proxy/src/prisma/schema.prisma 2>&1 | Out-Null
& $ComposeInvoke[0] $ComposeInvoke[1..($ComposeInvoke.Length-1)] exec -T proxy npx prisma migrate deploy --schema=packages/proxy/src/prisma/schema.prisma 2>&1 | Out-Null

# Vérifier le statut
Write-Host "✅ Vérification du statut..." -ForegroundColor Cyan
& $ComposeInvoke[0] $ComposeInvoke[1..($ComposeInvoke.Length-1)] ps

Write-Host ""
Write-Host "✅ Déploiement terminé !" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Pour voir les logs :" -ForegroundColor Cyan
$logCmd = if ($ComposeInvoke[1] -eq "compose") { "docker compose" } else { "docker-compose" }
Write-Host "   $logCmd -f $ComposeFile logs -f proxy"
Write-Host ""
Write-Host "🌐 Le proxy est accessible sur : http://localhost:3000" -ForegroundColor Cyan
Write-Host "   (ou l'URL configurée dans votre .env)"
Write-Host ""
Write-Host "📝 N'oubliez pas de configurer l'extension VS Code pour pointer vers ce serveur :" -ForegroundColor Yellow
Write-Host "   Paramètres → Marcel'IA: Proxy Url → http://VOTRE-SERVEUR:3000"
