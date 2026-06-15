const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.swift')) results.push(file);
    }
  });
  return results;
}

const files = walk('node_modules/expo-modules-jsi/apple/Sources');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  if (content.includes('weak var')) {
    // Replace 'weak var' with 'nonisolated(unsafe) weak var'
    // But be careful not to duplicate it if it already has nonisolated(unsafe)
    if (!content.includes('nonisolated(unsafe) weak var')) {
      content = content.replace(/weak var/g, 'nonisolated(unsafe) weak var');
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed Sendable:', file);
  }
});
