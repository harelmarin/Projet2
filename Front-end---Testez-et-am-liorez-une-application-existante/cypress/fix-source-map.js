const fs = require('fs');

const file = 'dist/e2e/browser/main.js.map';
const map = JSON.parse(fs.readFileSync(file, 'utf8'));
map.sources = map.sources.map(source => '../../../' + source);
fs.writeFileSync(file, JSON.stringify(map));
