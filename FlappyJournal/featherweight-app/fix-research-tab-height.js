import fs from 'fs';

// Read the CSS file
const cssPath = './src/components/research/EnhancedResearchTab.css';
let css = fs.readFileSync(cssPath, 'utf8');

// Replace height: 100vh with height: 100% for the main container
css = css.replace(
  /\.enhanced-research-tab\s*{([^}]*?)height:\s*100vh;/,
  '.enhanced-research-tab {$1height: 100%;'
);

// Write back
fs.writeFileSync(cssPath, css);
console.log('Fixed research tab height to use 100% instead of 100vh');
