const fs = require('fs');
const file = 'C:/Users/ujjwa/Downloads/frontend/src/pages/Dashboard.tsx';
let content = fs.readFileSync(file, 'utf8');
const target = 'localStorage.setItem("user_logged_moods", JSON.stringify(stored));';
const replacement = 'localStorage.setItem("user_logged_moods", JSON.stringify(stored));\n    window.dispatchEvent(new Event("storage"));';
if (content.includes(target) && !content.includes('window.dispatchEvent(new Event("storage"))')) {
  content = content.replace(target, replacement);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Added storage event dispatch to Dashboard.tsx');
} else {
  console.log('Already present or target not found');
}
