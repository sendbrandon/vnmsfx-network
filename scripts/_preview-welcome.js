// Render the Season Pass welcome email with a sample name (dev only; not deployed).
const fs = require('fs'), path = require('path');
const src = fs.readFileSync(path.join(__dirname, '..', 'api', 'season-pass.js'), 'utf8');
const drops = require('../api/_drops.js');
const m = { exports: {} };
new Function('require', 'module', 'exports', src + ';module.exports={welcomeHtml,welcomeText};')(require, m, m.exports);
const d = drops.DROPS[0];
fs.writeFileSync(process.argv[2], m.exports.welcomeHtml(process.argv[3] || 'Maya', d, true));
console.log(m.exports.welcomeText(process.argv[3] || 'Maya', d, true));
