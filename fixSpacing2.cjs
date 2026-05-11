const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('dist')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  const replacements = [
    [/px-\[10px\]/g, 'px-2'], // 8px
    [/py-\[10px\]/g, 'py-2'],
    [/px-\[5px\]/g, 'px-1'], // 4px
    [/py-\[5px\]/g, 'py-1'],
    [/px-\[12px\]/g, 'px-3'], // 12px
    [/py-\[12px\]/g, 'py-3'],
    [/px-\[14px\]/g, 'px-3'], // 12px
    [/py-\[14px\]/g, 'py-3'],
    [/px-\[15px\]/g, 'px-4'], // 16px
    [/py-\[15px\]/g, 'py-4'],
    [/h-\[42px\]/g, 'h-10'], // 40px
    [/h-\[30px\]/g, 'h-8'], // 32px
    [/w-\[30px\]/g, 'w-8'],
    [/h-1.5/g, 'h-2'],
    [/w-1.5/g, 'w-2'],
  ];

  replacements.forEach(([regex, repl]) => {
    content = content.replace(regex, repl);
  });

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
