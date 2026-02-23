# Serveurs et plateformes open source pour déployer le proxy Marcel'IA

Le proxy Marcel'IA s'exécute dans Docker (Node.js, PostgreSQL, Redis). Vous pouvez le déployer sur n'importe quel serveur ou plateforme open source capable d'exécuter **Docker** et **Docker Compose**.

---

## 1. Systèmes d'exploitation serveur (OS)

| OS | Licence | Remarques |
|----|---------|-----------|
| **Ubuntu Server** | Open source (GPL) | Très répandu, excellente doc, LTS recommandé (22.04, 24.04) |
| **Debian** | Open source (GPL) | Stable, léger, idéal pour serveurs |
| **Rocky Linux** / **AlmaLinux** | Open source (GPL) | Successeurs de CentOS, orientés entreprise |
| **Fedora Server** | Open source (GPL) | À jour, bon support Podman/Docker |
| **openSUSE Leap** | Open source (GPL) | Solide, outillage YaST |
| **Proxmox VE** (hyperviseur) | Open source (AGPL) | Héberge des VMs/containers ; installez une VM Ubuntu/Debian puis Docker dedans |

**Recommandation** : **Ubuntu Server LTS** ou **Debian** pour la simplicité et la communauté.

---

## 2. Conteneurisation

| Solution | Licence | Usage avec Marcel'IA |
|----------|---------|----------------------|
| **Docker Engine** + **Docker Compose** | Apache 2.0 | Méthode standard du projet : `docker-compose up -d` |
| **Podman** + **Podman Compose** | Apache 2.0 | Compatible avec les commandes Docker ; pas de daemon root |
| **containerd** + **nerdctl** | Apache 2.0 | Léger ; utilise les mêmes images Docker |

Le projet est livré avec des fichiers **Docker** et **Docker Compose** ; tout environnement capable de lancer ces commandes convient.

---

## 3. Orchestration (optionnel, pour plusieurs nœuds)

| Plateforme | Licence | Quand l'utiliser |
|------------|---------|-------------------|
| **Kubernetes** (K8s) | Apache 2.0 | Gros déploiements, haute dispo, plusieurs nœuds |
| **Docker Swarm** | Apache 2.0 | Plus simple que K8s, intégré à Docker |
| **Nomad** (HashiCorp) | MPL 2.0 | Orchestration simple, multi-région |

Pour un seul serveur, **Docker Compose** suffit. K8s/Swarm/Nomad deviennent utiles si vous scalez sur plusieurs machines.

---

## 4. Reverse proxy et HTTPS (recommandé en production)

| Logiciel | Licence | Rôle |
|----------|---------|------|
| **Nginx** | BSD 2-clause | Reverse proxy, SSL, cache, très répandu |
| **Traefik** | MIT | Reverse proxy orienté conteneurs, certificats Let's Encrypt automatiques |
| **Caddy** | Apache 2.0 | Configuration simple, HTTPS automatique |
| **HAProxy** | GPL / HAProxy Enterprise) | Load balancer et reverse proxy performant |

En production, placez **Nginx**, **Traefik** ou **Caddy** devant le proxy pour exposer une URL propre et gérer HTTPS.

---

## 5. Hébergement / PaaS self‑hostés (tout‑en‑un)

Ces plateformes open source gèrent serveur, Docker et souvent domaine/SSL pour vous.

| Plateforme | Licence | Description |
|------------|---------|-------------|
| **Coolify** | AGPL v3 | PaaS self‑hosté (type Heroku/Vercel), déploiement par Git, SSL, très simple |
| **CapRover** | Apache 2.0 | PaaS léger, interface web, déploiement d’apps Docker |
| **Dokku** | MIT | PaaS minimaliste, style Heroku, basé sur Docker |
| **Caprover** (variante) | Apache 2.0 | Similaire à CapRover |
| **Portainer** | Zlib | Interface web pour gérer Docker (pas un PaaS complet, mais très pratique) |

Vous déployez le proxy comme une “app” Docker ; la plateforme gère le réseau et éventuellement le HTTPS.

---

## 6. Virtualisation / cloud privé

| Solution | Licence | Rôle |
|----------|---------|------|
| **Proxmox VE** | AGPL v3 | Hyperviseur : créez une VM (ex. Ubuntu), installez Docker dedans |
| **XCP-ng** | GPL v2 | Hyperviseur type Xen, alternative à Proxmox |
| **OpenStack** | Apache 2.0 | Cloud IaaS ; créez une VM puis Docker + Compose à l’intérieur |

Le proxy lui‑même ne dépend pas de l’hyperviseur : il suffit d’avoir une VM avec Docker (et Docker Compose).

---

## 7. Résumé : choix rapide

- **Un seul serveur, simple** : **Ubuntu Server** ou **Debian** + **Docker** + **Docker Compose** (+ **Nginx** ou **Caddy** pour HTTPS).  
  → Suivre `DEPLOYMENT.md`.

- **Un seul serveur, avec interface** : **Coolify** ou **CapRover** sur Ubuntu/Debian, déployer le proxy comme app Docker.

- **Windows** : **Windows Server** + Docker Desktop (ou WSL2 + Docker).  
  → Suivre `DEPLOYMENT_WINDOWS.md`.

- **Plusieurs serveurs / haute dispo** : **Kubernetes** ou **Docker Swarm** ; déployer le stack (proxy + Postgres + Redis) via manifests ou stack Swarm.

En résumé : tout **serveur open source** qui peut exécuter **Docker** et **Docker Compose** peut héberger le proxy Marcel'IA ; le reste (OS, reverse proxy, orchestration) est affaire de préférence et de taille de déploiement.
