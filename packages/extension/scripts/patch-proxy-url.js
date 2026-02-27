/**
 * Patch or restore the default proxy URL in package.json before/after packaging.
 * Usage:
 *   MARCELIA_PROXY_URL=https://marcelia.mon-domaine.com node scripts/patch-proxy-url.js --save   # before build
 *   node scripts/patch-proxy-url.js --restore   # after build
 */
const fs = require('fs');
const path = require('path');

const packagePath = path.join(__dirname, '..', 'package.json');
const bakPath = path.join(__dirname, '..', '.proxy-url.bak');

function readPackage() {
  return JSON.parse(fs.readFileSync(packagePath, 'utf8'));
}

function writePackage(pkg) {
  fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
}

if (process.argv.includes('--save')) {
  const pkg = readPackage();
  const key = 'contributes';
  const config = pkg[key]?.configuration?.properties?.['marcelia.proxyUrl'];
  if (!config) {
    console.error('patch-proxy-url: marcelia.proxyUrl not found in package.json');
    process.exit(1);
  }
  const url = process.env.MARCELIA_PROXY_URL;
  fs.writeFileSync(bakPath, config.default || '', 'utf8');
  if (url && url.trim()) {
    config.default = url.trim();
    writePackage(pkg);
    console.log('patch-proxy-url: default proxy URL set to', config.default);
  }
} else if (process.argv.includes('--restore')) {
  if (!fs.existsSync(bakPath)) return;
  const pkg = readPackage();
  const config = pkg.contributes?.configuration?.properties?.['marcelia.proxyUrl'];
  if (config) {
    config.default = fs.readFileSync(bakPath, 'utf8') || 'http://localhost:3000';
    writePackage(pkg);
    console.log('patch-proxy-url: default proxy URL restored');
  }
  fs.unlinkSync(bakPath);
} else {
  console.error('Usage: MARCELIA_PROXY_URL=<url> node patch-proxy-url.js --save');
  console.error('       node patch-proxy-url.js --restore');
  process.exit(1);
}
