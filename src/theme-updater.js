const fs = require('fs');
const path = require('path');

const files = [
  'Sidebar.jsx',
  'Navbar.jsx',
  'StudyTimer.jsx',
  'PomodoroTimer.jsx',
  'YouTubePlayer.jsx',
  'SearchModal.jsx',
  'CreateProfileModal.jsx',
  'Toast.jsx',
  'ProgressBar.jsx'
];

const basePath = 'a:/DS/src/components';

const replacements = [
  // Backgrounds
  { regex: /#fffdf7/g, replacement: '#18181f' },
  { regex: /#f7f1e3/g, replacement: '#18181f' },
  { regex: /#fcf8f0/g, replacement: '#18181f' },
  { regex: /#fff9db/g, replacement: '#18181f' },
  { regex: /linear-gradient\(145deg, #18181f, #18181f\)/g, replacement: 'linear-gradient(145deg, #191922, #111116)' },
  { regex: /linear-gradient\(145deg, #fffdf7, #f7f1e3\)/g, replacement: 'linear-gradient(145deg, #191922, #111116)' },
  { regex: /rgba\(36,30,23,0\.85\)/g, replacement: 'rgba(0,0,0,0.85)' },
  { regex: /rgba\(36,30,23,0\.95\)/g, replacement: 'rgba(0,0,0,0.95)' },

  // Texts
  { regex: /#241e17/g, replacement: '#f5f5f7' },
  { regex: /#1b263b/g, replacement: '#f2d894' },
  { regex: /#6e6458/g, replacement: '#94a3b8' },
  { regex: /#cbd5e1/g, replacement: '#cbd5e1' }, // if any

  // Borders
  { regex: /#e2d6c1/g, replacement: 'rgba(255,255,255,0.08)' },
  { regex: /#d4c4a8/g, replacement: 'rgba(255,255,255,0.08)' },
  
  // Accents
  { regex: /#c49235/g, replacement: '#d8a442' },
  { regex: /#a07420/g, replacement: '#9e7518' },
];

files.forEach(file => {
  const filePath = path.join(basePath, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    replacements.forEach(r => {
      content = content.replace(r.regex, r.replacement);
    });
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  } else {
    console.log(`File not found: ${file}`);
  }
});
