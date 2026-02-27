# Empaquetage de l’extension Marcel'IA (.vsix)

## Build avec l’URL du proxy par défaut

Pour que les postes n’aient pas à configurer **Marcel'IA: Proxy Url** après installation, vous pouvez définir l’URL **au moment du build** :

```bash
cd packages/extension
MARCELIA_PROXY_URL=https://marcelia.votre-domaine.com npm run package:vsix
```

Sous **PowerShell** (Windows) :

```powershell
cd packages\extension
$env:MARCELIA_PROXY_URL="https://marcelia.votre-domaine.com"; npm run package:vsix
```

Le fichier **marcelia.vsix** généré aura alors cette URL comme **valeur par défaut** pour le paramètre Proxy Url. Les utilisateurs pourront toujours la modifier dans les paramètres VS Code.

- Sans `MARCELIA_PROXY_URL`, la valeur par défaut reste `http://localhost:3000`.
- Le script restaure la valeur d’origine dans `package.json` après le build (pour ne pas modifier le dépôt).
