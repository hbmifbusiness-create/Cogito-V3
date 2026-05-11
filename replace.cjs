const fs = require('fs');
const files = ['src/App.tsx', 'src/components/HomeView.tsx'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/all_brands/g, 'brand_landing');
  content = content.replace(/all_projects/g, 'project_landing');
  content = content.replace(/all_events/g, 'event_landing');
  content = content.replace(/all_tasks/g, 'task_landing');
  
  // also handle "home" tabs
  content = content.replace(/"statistics"/g, 'currentView === "home" ? "home_statistics" : "statistics"');
  fs.writeFileSync(file, content);
});
