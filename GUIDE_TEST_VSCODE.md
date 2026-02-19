# Guide détaillé : Tester l'extension VS Code

Ce guide explique étape par étape comment tester l'extension Marcel'IA dans VS Code en mode développement.

## 📋 Prérequis

Avant de commencer, assurez-vous que :
- ✅ Le proxy backend tourne (Docker Compose démarré)
- ✅ La base de données est initialisée (migrations Prisma effectuées)
- ✅ VS Code est installé

---

## 🎯 Étape 6 : Build et tester l'extension VS Code

### Partie A : Build l'extension

**1. Ouvrir un terminal dans VS Code**

- Ouvrez VS Code à la **racine du projet** (`MarcelCode_meroma`)
- Ouvrez un terminal intégré : `Terminal > New Terminal` ou `Ctrl+`` (backtick)

**2. Build les packages nécessaires**

Dans le terminal, exécutez :

```bash
# Build le package shared (types partagés)
npm run build:shared

# Build l'extension VS Code
npm run build:extension
```

**Résultat attendu :**
- Le dossier `packages/shared/dist/` est créé avec les fichiers compilés
- Le dossier `packages/extension/dist/` est créé avec l'extension compilée
- Pas d'erreurs dans le terminal

---

### Partie B : Lancer l'extension en mode debug

**1. Ouvrir le dossier de l'extension**

- Dans VS Code, ouvrez le dossier `packages/extension`
- **Important** : Vous devez être dans le dossier `packages/extension`, pas à la racine du projet

**Comment faire :**
- `File > Open Folder...`
- Naviguez vers `C:\Users\romeongbe\Documents\GitHub\MarcelCode_meroma\packages\extension`
- Cliquez sur "Select Folder"

**2. Vérifier la configuration de debug**

- Ouvrez le fichier `.vscode/launch.json` dans `packages/extension`
- Vous devriez voir une configuration "Run Marcel'IA Extension"

**3. Lancer le debug**

**Méthode 1 : Avec le raccourci clavier**
- Appuyez sur **F5** (ou **F9** selon votre configuration)

**Méthode 2 : Via le menu**
- Allez dans `Run > Start Debugging`
- Ou cliquez sur l'icône de debug dans la barre latérale gauche
- Sélectionnez "Run Marcel'IA Extension" dans la liste déroulante
- Cliquez sur le bouton vert "Play"

**4. Attendre le démarrage**

- VS Code va compiler l'extension automatiquement
- Une **nouvelle fenêtre VS Code** va s'ouvrir
- Cette nouvelle fenêtre s'appelle "Extension Development Host"
- C'est dans cette fenêtre que vous allez tester l'extension

**Résultat attendu :**
- Une nouvelle fenêtre VS Code s'ouvre
- Le titre de la fenêtre contient "[Extension Development Host]"
- Un message peut apparaître : "Marcel'IA: Mode développement activé (proxy local)"

---

### Partie C : Tester l'extension

**1. Vérifier que l'extension est chargée**

Dans la nouvelle fenêtre VS Code (Extension Development Host) :

**Option 1 : Via l'icône dans la barre latérale**
- Regardez la barre latérale gauche
- Vous devriez voir une icône "Marcel'IA" (🤖 ou une icône personnalisée)
- Cliquez dessus pour ouvrir le panneau Marcel'IA

**Option 2 : Via la palette de commandes**
- Appuyez sur `Ctrl+Shift+P` (ou `Cmd+Shift+P` sur Mac)
- Tapez "Marcel'IA"
- Vous devriez voir plusieurs commandes :
  - `Marcel'IA: Ouvrir le Chat`
  - `Marcel'IA: Revue de Code`
  - `Marcel'IA: Expliquer le Code`
  - etc.

**Option 3 : Via la barre de statut**
- Regardez en bas à droite de VS Code
- Vous devriez voir "🤖 Marcel'IA" dans la barre de statut
- Cliquez dessus pour ouvrir le chat

**2. Configurer l'extension pour le mode dev**

**Important** : Pour tester en local, vous devez configurer l'extension :

- Appuyez sur `Ctrl+,` (ou `Cmd+,` sur Mac) pour ouvrir les Settings
- Dans la barre de recherche, tapez "marcelia"
- Vous devriez voir les paramètres de Marcel'IA

**Configurez :**
- `Marcelia: Proxy Url` : `http://localhost:3000`
- `Marcelia: Dev Mode` : ✅ **Cochez cette case** (très important !)

**Alternative : Éditer directement le fichier settings.json**

- Appuyez sur `Ctrl+Shift+P`
- Tapez "Preferences: Open User Settings (JSON)"
- Ajoutez ou modifiez :

```json
{
  "marcelia.proxyUrl": "http://localhost:3000",
  "marcelia.devMode": true
}
```

**3. Tester le chat**

- Ouvrez le chat Marcel'IA (via l'icône ou `Ctrl+Shift+P` > "Marcel'IA: Ouvrir le Chat")
- Le panneau de chat devrait s'ouvrir à gauche ou à droite
- Tapez un message de test, par exemple : "Bonjour, peux-tu m'aider ?"
- Appuyez sur Entrée

**Résultat attendu :**
- Le message est envoyé au proxy backend
- Si le proxy fonctionne, vous devriez recevoir une réponse (si vous avez configuré une clé API Anthropic)
- Si vous n'avez pas de clé API, vous pouvez quand même tester la connexion

**4. Tester les commandes contextuelles**

- Ouvrez un fichier de code (par exemple, un fichier `.ts` ou `.js`)
- Sélectionnez quelques lignes de code
- Clic droit sur la sélection
- Vous devriez voir dans le menu contextuel :
  - `Marcel'IA: Revue de Code`
  - `Marcel'IA: Expliquer le Code`
  - `Marcel'IA: Générer des Tests`
  - `Marcel'IA: Générer la Documentation`

- Cliquez sur une de ces options pour tester

---

## 🔍 Vérifier que tout fonctionne

### Vérifier la connexion au proxy

**1. Voir les logs du proxy**

Dans votre terminal principal (où Docker Compose tourne) :

```bash
docker-compose -f docker/docker-compose.dev.yml logs -f proxy
```

**2. Tester depuis VS Code**

- Ouvrez le chat Marcel'IA
- Envoyez un message
- Regardez les logs du proxy : vous devriez voir une requête arriver

**3. Vérifier les erreurs**

Si quelque chose ne fonctionne pas :

**Dans VS Code (fenêtre Extension Development Host) :**
- Ouvrez `View > Output`
- Dans la liste déroulante en haut, sélectionnez "Log (Extension Host)"
- Cherchez les erreurs ou messages de Marcel'IA

**Dans la fenêtre de développement (celle où vous avez appuyé sur F5) :**
- Regardez le terminal "Debug Console"
- Les erreurs de l'extension y apparaîtront

---

## 🛠️ Dépannage

### L'extension ne se lance pas (F5 ne fait rien)

**Solution :**
1. Vérifiez que vous êtes dans le dossier `packages/extension`
2. Vérifiez que le fichier `.vscode/launch.json` existe
3. Essayez de rebuild : `npm run build:extension`
4. Redémarrez VS Code

### La nouvelle fenêtre s'ouvre mais l'extension n'apparaît pas

**Solution :**
1. Vérifiez les logs dans "Output > Log (Extension Host)"
2. Vérifiez que `marcelia.devMode` est bien à `true`
3. Vérifiez que `marcelia.proxyUrl` est bien `http://localhost:3000`
4. Vérifiez que le proxy tourne : `curl http://localhost:3000/health`

### Le chat ne se connecte pas au proxy

**Solution :**
1. Vérifiez que Docker Compose est démarré : `docker-compose ps`
2. Vérifiez que le proxy répond : `curl http://localhost:3000/health`
3. Vérifiez les logs du proxy pour voir les erreurs
4. Vérifiez la configuration dans VS Code (proxyUrl et devMode)

### Erreur "Cannot find module"

**Solution :**
1. Rebuild l'extension : `npm run build:extension`
2. Redémarrez le debug (arrêtez avec Shift+F5, puis relancez avec F5)

---

## 📝 Résumé des étapes

1. ✅ Build l'extension : `npm run build:shared && npm run build:extension`
2. ✅ Ouvrir le dossier `packages/extension` dans VS Code
3. ✅ Appuyer sur **F5** pour lancer le debug
4. ✅ Une nouvelle fenêtre VS Code s'ouvre
5. ✅ Configurer `marcelia.devMode = true` et `marcelia.proxyUrl = http://localhost:3000`
6. ✅ Tester le chat et les commandes

---

## 🎓 Comprendre le mode debug VS Code

**Pourquoi une nouvelle fenêtre ?**

Quand vous appuyez sur F5, VS Code lance l'extension dans un environnement isolé appelé "Extension Development Host". C'est comme si vous aviez installé l'extension, mais en mode développement.

**Avantages :**
- Vous pouvez modifier le code et voir les changements en temps réel
- Les erreurs apparaissent dans la console de debug
- Vous pouvez utiliser les breakpoints pour déboguer

**Comment arrêter le debug ?**

- Dans la fenêtre de développement (celle où vous avez appuyé sur F5)
- Appuyez sur **Shift+F5** ou cliquez sur le bouton "Stop" dans la barre de debug

---

## 💡 Astuces

**Hot reload automatique**

Si vous modifiez le code de l'extension pendant que le debug tourne :
- Arrêtez le debug (Shift+F5)
- Rebuild : `npm run build:extension`
- Relancez le debug (F5)

**Ou utilisez le mode watch :**

Dans un terminal séparé :
```bash
cd packages/extension
npm run dev
```

Cela va compiler automatiquement à chaque modification. Ensuite, dans VS Code, utilisez la configuration "Run Marcel'IA Extension (no build)" qui ne rebuild pas avant de lancer.

**Tester avec des fichiers réels**

- Ouvrez un projet de code dans la nouvelle fenêtre VS Code
- Testez les fonctionnalités sur du vrai code
- C'est plus réaliste que de tester sur des fichiers vides

---

## ✅ Checklist de test

- [ ] L'extension se lance sans erreur (F5 fonctionne)
- [ ] La nouvelle fenêtre VS Code s'ouvre
- [ ] L'icône Marcel'IA apparaît dans la barre latérale
- [ ] Le chat s'ouvre quand on clique sur l'icône
- [ ] Les commandes apparaissent dans la palette (Ctrl+Shift+P)
- [ ] Le menu contextuel contient les options Marcel'IA
- [ ] Le chat se connecte au proxy (pas d'erreur de connexion)
- [ ] Les messages sont envoyés et reçus correctement
- [ ] Les commandes contextuelles fonctionnent (review, explain, etc.)

Une fois tous ces points vérifiés, votre extension fonctionne correctement ! 🎉
