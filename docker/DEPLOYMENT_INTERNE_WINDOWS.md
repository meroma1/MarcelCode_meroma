# Déploiement interne (Windows Server + Docker, sans HTTPS)

Procédure pour faire tourner le proxy Marcel'IA en interne, sans IIS ni HTTPS.

> **Alternative plus rapide** : Si vous n’êtes pas obligé d’héberger sur une machine Windows interne, le déploiement sur **Railway** est en général **beaucoup plus rapide** (quelques minutes, HTTPS inclus, sans WSL2 ni Docker Desktop). Voir **[DEPLOYMENT_RAILWAY.md](./DEPLOYMENT_RAILWAY.md)**.

---

## Cas : Windows Server 2019 avec Docker Engine uniquement

Sur **Windows Server 2019**, si seul **Docker Engine** est installé (sans Docker Desktop), il fonctionne en **conteneurs Windows**. Les images du projet (Node, Postgres, Redis) sont des images **Linux**, donc le build échoue avec « no matching manifest for windows/amd64 ». Il n’existe pas de bouton « Switch to Linux containers » sans Docker Desktop.

**Solution recommandée** : installer **WSL2** puis faire tourner **Docker (et Docker Compose) dans une distribution Linux (ex. Ubuntu)**. Tout le déploiement se fait depuis WSL2. Voir la section **[Déploiement via WSL2 (Docker Engine seul)**](#deploiement-via-wsl2-windows-server--docker-engine-seul) plus bas.

---

## 1. Prérequis sur le serveur

- Windows Server 2019 ou 2022
- **Docker** installé et démarré (Docker Desktop **ou** Docker dans WSL2 — voir section dédiée si vous n’avez que Docker Engine)
- **Docker Compose** : soit intégré (`docker compose`), soit standalone (`docker-compose`). Si la commande `docker compose` renvoie *'compose' is not a docker command*, installez le binaire standalone (voir ci‑dessous).
- Accès au repo (clone ou copie du projet)

### Installer Docker Compose standalone (si nécessaire)

Si `docker compose` ne fonctionne pas et que `docker-compose` n’est pas reconnu :

**Option A – Téléchargement automatique (PowerShell en administrateur)**  
Adaptez la version si besoin (ex. `v2.24.0`) sur https://github.com/docker/compose/releases :

```powershell
$url = "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-windows-x86_64.exe"
$dest = "C:\Program Files\Docker\docker-compose.exe"
# Si le dossier n'existe pas : New-Item -ItemType Directory -Path "C:\Program Files\Docker" -Force
Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing
docker-compose --version
```

**Option B – Manuel**  
1. Allez sur https://github.com/docker/compose/releases  
2. Téléchargez **docker-compose-windows-x86_64.exe** pour la dernière release  
3. Renommez en **docker-compose.exe** et placez-le dans un dossier du PATH (ex. `C:\Program Files\Docker\` ou `C:\Windows\System32`)  
4. Ouvrez une **nouvelle** PowerShell et testez : `docker-compose --version`

---

## 2. Préparer le projet

Ouvrir PowerShell et aller dans le dossier docker :

```powershell
cd C:\Chemin\Vers\MarcelCode_meroma\docker
```

(Remplacez par le chemin réel de votre clone.)

---

## 3. Fichier `.env`

Créer le fichier `.env` à partir de l’exemple :

```powershell
Copy-Item .env.production.example .env
notepad .env
```

À adapter pour l’usage **interne sans HTTPS** :

- **ANTHROPIC_API_KEY** : votre clé Anthropic (obligatoire)
- **OPENAI_API_KEY** : optionnel (transcription vocale)
- **REQUIRE_AUTH** : mettre `false` si vous n’utilisez pas Azure AD en interne
- **CORS_ORIGIN** : mettre `*` pour accepter les connexions depuis n’importe quelle machine du réseau, ou l’IP du serveur, ex. `http://192.168.1.10:3000`
- **POSTGRES_PASSWORD** : un mot de passe pour la base (ex. `marcelia_interne`)
- **AZURE_*** : vous pouvez laisser des valeurs factices si `REQUIRE_AUTH=false`

Exemple minimal pour l’interne :

```env
ANTHROPIC_API_KEY=sk-ant-votre-cle
OPENAI_API_KEY=sk-votre-cle-optionnel
REQUIRE_AUTH=false
CORS_ORIGIN=*
POSTGRES_PASSWORD=marcelia_interne
```

Sauvegarder et fermer.

---

## 4. Lancer le proxy avec Docker

Dans le même dossier `docker` :

**Sur Windows**, Docker Desktop récent utilise `docker compose` (avec un espace) plutôt que `docker-compose`. Utilisez :

```powershell
docker compose build
docker compose up -d
```

Puis appliquer les migrations de la base :

```powershell
docker compose exec proxy npx prisma migrate deploy --schema=packages/proxy/src/prisma/schema.prisma
```

Vérifier que les conteneurs tournent :

```powershell
docker compose ps
```

> Si vous avez l’ancienne commande standalone : `docker-compose build`, `docker-compose up -d`, etc.

---

## 5. Ouvrir le port 3000 dans le pare-feu

En PowerShell **en tant qu’administrateur** :

```powershell
New-NetFirewallRule -DisplayName "MarcelIA Proxy" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

Les postes du réseau pourront alors joindre le serveur sur le port 3000.

---

## 6. Erreur « no matching manifest for windows/amd64 »

Si le build affiche :  
`no matching manifest for windows/amd64 10.0.17763 in the manifest list entries`

Docker est en mode **Windows containers**. Les images du projet (node, postgres, redis) sont des images **Linux**. Il faut passer en **Linux containers** :

### Option A – Icône Docker dans la barre des tâches

1. À droite de la barre des tâches, près de l’horloge : cliquer sur la **petite flèche ^** (ou « Afficher les icônes masquées ») pour ouvrir le panneau des icônes cachées.
2. Clic droit sur l’icône **Docker** (baleine) → **« Switch to Linux containers... »** (ou « Passer aux conteneurs Linux »).
3. Attendre le redémarrage de Docker, puis relancer : `.\docker-compose.exe build`

### Option B – Depuis l’application Docker Desktop

1. Ouvrir **Docker Desktop** depuis le menu Démarrer (rechercher « Docker Desktop »).
2. Une fois la fenêtre ouverte : **Paramètres** (roue dentée) → **General** (ou **Général**).
3. Vérifier que **« Use the WSL 2 based engine »** est coché (recommandé).
4. S’il existe une option du type **« Use Windows containers »** : la **décocher** pour utiliser les conteneurs Linux.
5. Cliquer sur **Apply & Restart**, puis relancer le build.

### Option C – Windows Server avec Docker Engine seul (pas de Docker Desktop)

Sur **Windows Server 2019**, avec uniquement **Docker Engine**, il n’y a pas d’icône ni de bascule « Switch to Linux containers ». Il faut faire tourner Docker (et le projet) dans **WSL2**. Suivre la section **[Déploiement via WSL2](#deploiement-via-wsl2-windows-server--docker-engine-seul)** ci-dessous.

---

## Déploiement via WSL2 (Windows Server + Docker Engine seul)

Cette procédure s’adresse à un **Windows Server 2019** où seul **Docker Engine** est installé. On installe WSL2, une distribution Linux (Ubuntu), puis Docker et Docker Compose **dans** Linux. Le proxy tourne ainsi en conteneurs Linux.

### Étape 1 : Activer WSL sur Windows Server 2019

Sur **Windows Server 2019**, la commande `wsl` n’existe pas tant que WSL n’est pas installé. Il faut activer les composants requis **à la main**.

En **PowerShell en tant qu’administrateur** :

```powershell
# 1. Activer le sous-système Linux et la plateforme de machines virtuelles
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux, VirtualMachinePlatform
```

**Redémarrer le serveur**, puis rouvrir PowerShell en administrateur :

```powershell
# 2. Télécharger et installer la mise à jour du noyau WSL 2
Invoke-WebRequest -Uri "https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi" -OutFile "$env:TEMP\wsl_update_x64.msi" -UseBasicParsing
Start-Process "msiexec.exe" -ArgumentList "/i $env:TEMP\wsl_update_x64.msi /quiet" -Wait -NoNewWindow

# 3. Télécharger Ubuntu (package pour WSL)
$ubuntuPath = "$env:USERPROFILE\UbuntuWSL"
New-Item -ItemType Directory -Path $ubuntuPath -Force
Invoke-WebRequest -Uri "https://aka.ms/wslubuntu2204" -OutFile "$ubuntuPath\Ubuntu2204.appx" -UseBasicParsing
```

Installer Ubuntu : sur Windows Server, `Add-AppxPackage` échoue souvent. **Ne pas utiliser** `Expand-Archive` (le format du paquet provoque « Zip 64 End of Central Directory… »). Utiliser **tar** (fourni avec Windows) :

```powershell
cd $ubuntuPath

# 1. Extraire avec tar (gère les paquets .appx / .zip du Store)
tar -xf .\Ubuntu2204.appx
# Si vous aviez renommé en .zip :
# tar -xf .\Ubuntu2204.zip

# 2. Entrer dans le dossier créé (nom peut varier)
cd (Get-ChildItem -Directory | Select-Object -First 1).FullName
# Ou manuellement : cd Ubuntu2204_extract (ou le nom affiché par dir)

# 3. Trouver le fichier .appx x64
dir
$appx = Get-ChildItem -Filter "*x64*.appx" -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $appx) { $appx = Get-ChildItem -Filter "*.appx" | Select-Object -First 1 }

# 4. Dossier final pour Ubuntu
$finalDir = "C:\Users\$env:USERNAME\UbuntuWSL\Ubuntu"
New-Item -ItemType Directory -Path $finalDir -Force

# 5. Extraire le .appx avec tar (pas Expand-Archive)
tar -xf $appx.FullName -C $finalDir

# 6. Ajouter au PATH
$userPath = [System.Environment]::GetEnvironmentVariable("Path", "User")
if ($userPath -notlike "*$finalDir*") {
  [System.Environment]::SetEnvironmentVariable("Path", $userPath + ";$finalDir", "User")
}
```

**Ouvrir une nouvelle session** PowerShell. Lancer Ubuntu : `C:\Users\ROMEONGBE\UbuntuWSL\Ubuntu\ubuntu.exe` (ou `ubuntu` si le PATH est à jour). Au premier lancement, créer un utilisateur et un mot de passe.

**Si `tar` échoue** (« Error opening archive » ou « Failed to open ») : le fichier peut être absent, corrompu ou dans un format que tar ne lit pas. À faire :

1. **Vérifier que le fichier existe** : `dir C:\Users\ROMEONGBE\UbuntuWSL` (vérifier le nom exact : `Ubuntu2204.appx` ou `Ubuntu2204.zip`).
2. **Retélécharger** vers un chemin sans espaces, puis réessayer `tar -xf .\Ubuntu2204.appx` depuis ce dossier.
3. **Utiliser 7-Zip** : installer https://www.7-zip.org/ puis en PowerShell :
   ```powershell
   & "C:\Program Files\7-Zip\7z.exe" x "C:\Users\ROMEONGBE\UbuntuWSL\Ubuntu2204.appx" -o"C:\Users\ROMEONGBE\UbuntuWSL\Ubuntu_extract"
   ```
   Aller dans `Ubuntu_extract`, repérer le fichier *x64*.appx, puis :
   ```powershell
   & "C:\Program Files\7-Zip\7z.exe" x "chemin\complet\vers\fichier_x64.appx" -o"C:\Users\ROMEONGBE\UbuntuWSL\Ubuntu"
   ```
   Ajouter `C:\Users\ROMEONGBE\UbuntuWSL\Ubuntu` au PATH et lancer `ubuntu.exe`.

### Étape 2 : Installer Docker et Docker Compose dans Ubuntu (WSL2)

Ouvrir **Ubuntu** (WSL2) et exécuter.

**Méthode recommandée (script officiel)** — si les paquets « docker-ce » sont introuvables avec la méthode manuelle :

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
sudo service docker start
```

**Méthode manuelle** (dépôt Docker pour Ubuntu 22.04 « jammy ») — à utiliser si le script `get.docker.com` échoue avec une erreur de clé GPG :

```bash
# Nettoyer un éventuel dépôt Docker mal configuré
sudo rm -f /etc/apt/sources.list.d/docker.list

# Installer les prérequis et la clé GPG Docker
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Ajouter le dépôt (jammy = Ubuntu 22.04)
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu jammy stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo service docker start
sudo usermod -aG docker $USER
```

Vérifier :

```bash
docker --version
docker compose version
```

**Si après `sudo service docker start` vous avez encore « Cannot connect to the Docker daemon »** : vous êtes peut‑être en **WSL1**. Docker a besoin de **WSL2**. Vérifier avec `uname -r` : un noyau **4.x** indique souvent WSL1, un **5.x** WSL2. Passer Ubuntu en WSL2 (PowerShell en admin sur Windows) : `wsl --set-version Ubuntu 2`, puis redémarrer Ubuntu et relancer `sudo service docker start`.

### Étape 3 : Accéder au projet depuis WSL2

Le disque Windows est monté sous `/mnt/`. Si le projet est par exemple en `D:\MarcelCode_meroma` :

```bash
cd /mnt/d/MarcelCode_meroma/docker
```

(Adapter la lettre : `D:` → `/mnt/d/`, `C:` → `/mnt/c/`.)

Créer le fichier `.env` à partir de l’exemple et l’éditer :

```bash
cp .env.production.example .env
nano .env
```

Renseigner au minimum : `ANTHROPIC_API_KEY`, `REQUIRE_AUTH=false`, `CORS_ORIGIN=*`, `POSTGRES_PASSWORD`.

### Étape 4 : Lancer le proxy dans WSL2

Toujours dans le dossier `docker` sous WSL2 :

```bash
sudo docker compose build
sudo docker compose up -d
sudo docker compose exec proxy npx prisma migrate deploy --schema=packages/proxy/src/prisma/schema.prisma
```

(Si vous avez fait `usermod -aG docker $USER` et reconnecté la session WSL, vous pouvez omettre `sudo`.)

Vérifier :

```bash
sudo docker compose ps
curl -s http://localhost:3000/health
```

### Étape 5 : Accès depuis Windows et depuis le réseau

- **Depuis le serveur Windows** : dans un navigateur ou PowerShell, tester `http://localhost:3000/health`. (WSL2 expose souvent les ports sur localhost Windows.)
- **Depuis d’autres PC du réseau** : ouvrir le **port 3000** dans le pare-feu Windows (voir section 5 du guide). Si `localhost:3000` depuis Windows ne répond pas, il peut être nécessaire d’ajouter une règle de **redirection de port** (portproxy) depuis Windows vers WSL2 ; en cas de besoin, documenter l’IP de l’interface WSL2 et la règle `netsh interface portproxy`.

Les postes clients VS Code utiliseront l’**IP du serveur Windows** dans **Marcel'IA: Proxy Url** : `http://IP-DU-SERVEUR:3000`.

---

## 7. Vérifier depuis le serveur

```powershell
Invoke-WebRequest -Uri http://localhost:3000/health
```

La réponse doit indiquer un statut OK (et du JSON type `{"status":"ok"}`).

---

## 8. Configurer VS Code sur les postes utilisateurs

Sur chaque PC où l’extension Marcel'IA est installée :

1. Ouvrir les paramètres VS Code (`Ctrl+,`)
2. Rechercher **Marcel'IA: Proxy Url**
3. Mettre l’URL du serveur en **HTTP** (pas HTTPS), par exemple :
   - `http://192.168.1.10:3000`  
   (remplacer par l’IP ou le nom DNS interne du serveur)
4. Si vous n’utilisez pas l’auth Azure : activer **Marcel'IA: Dev Mode** (ou laisser la config qui désactive l’auth selon votre `.env`).

Les utilisateurs pourront alors utiliser le chat Marcel'IA en pointant vers ce serveur interne.

---

## Résumé

| Étape | Action |
|-------|--------|
| 1 | Docker Desktop installé et démarré |
| 2 | Aller dans le dossier `docker` du projet |
| 3 | Créer `.env` avec `REQUIRE_AUTH=false`, `CORS_ORIGIN=*`, clés API, mot de passe Postgres |
| 4 | `docker compose build` puis `docker compose up -d` puis migration Prisma (ou `docker-compose` si installé) |
| 5 | Règle pare-feu : autoriser le port 3000 (TCP entrant) |
| 6 | Tester `http://localhost:3000/health` sur le serveur |
| 7 | Si erreur « no matching manifest for windows/amd64 » : passer Docker en **Linux containers** |
| 8 | Sur les postes : paramètre **Proxy Url** = `http://IP-OU-NOM-DU-SERVEUR:3000` |

Pas besoin d’IIS ni de HTTPS pour un usage interne.
