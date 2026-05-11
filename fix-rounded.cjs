const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(/\brounded-[a-zA-Z0-9\[\]\-]+\b/g, 'rounded-none');
fs.writeFileSync('src/App.tsx', code);
