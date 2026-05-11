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

  // Replace fractional tailwind classes
  const replacements = [
    [/p-1\.5/g, 'p-2'],
    [/px-1\.5/g, 'px-2'],
    [/py-1\.5/g, 'py-2'],
    [/pt-1\.5/g, 'pt-2'],
    [/pb-1\.5/g, 'pb-2'],
    [/pl-1\.5/g, 'pl-2'],
    [/pr-1\.5/g, 'pr-2'],

    [/p-2\.5/g, 'p-3'], // or 2
    [/px-2\.5/g, 'px-3'],
    [/py-2\.5/g, 'py-2'], // using py-2 to maintain sizes
    [/pt-2\.5/g, 'pt-2'],
    [/pb-2\.5/g, 'pb-2'],
    [/pl-2\.5/g, 'pl-2'],
    [/pr-2\.5/g, 'pr-2'],

    [/p-0\.5/g, 'p-1'],
    [/px-0\.5/g, 'px-1'],
    [/py-0\.5/g, 'py-1'],
    [/pt-0\.5/g, 'pt-1'],
    [/pb-0\.5/g, 'pb-1'],
    [/pl-0\.5/g, 'pl-1'],
    [/pr-0\.5/g, 'pr-1'],

    [/gap-1\.5/g, 'gap-2'],
    [/gap-2\.5/g, 'gap-2'],
    [/gap-0\.5/g, 'gap-1'],
    
    [/mt-0\.5/g, 'mt-1'],
    [/mb-0\.5/g, 'mb-1'],
    [/ml-0\.5/g, 'ml-1'],
    [/mr-0\.5/g, 'mr-1'],
    [/mt-1\.5/g, 'mt-2'],
    [/mb-1\.5/g, 'mb-2'],
    [/ml-1\.5/g, 'ml-2'],
    [/mr-1\.5/g, 'mr-2'],

    // Replaces explicit pixel values that are not multiples of 4 if easily identifiable, e.g. px-[10px]
    // We can do this manually if needed
  ];

  replacements.forEach(([regex, repl]) => {
    content = content.replace(regex, repl);
  });

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
