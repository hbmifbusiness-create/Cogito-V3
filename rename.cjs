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

  // SmartDropdown -> Dropdown
  content = content.replace(/SmartDropdown/g, 'Dropdown');
  // CustomCalendarPicker -> DatePicker
  content = content.replace(/CustomCalendarPicker/g, 'DatePicker');
  // UniversalEntityModal -> ModalDialog
  content = content.replace(/UniversalEntityModal/g, 'ModalDialog');
  // PlannerSideMenu -> Sidebar
  content = content.replace(/PlannerSideMenu/g, 'Sidebar');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
