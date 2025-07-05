import fs from 'fs';

// Read the ResearchTab wrapper
const wrapperPath = './src/components/research/ResearchTab.tsx';
let wrapper = fs.readFileSync(wrapperPath, 'utf8');

// Add debugging
wrapper = `import React from 'react';
import EnhancedResearchTab from './EnhancedResearchTab';

export default function ResearchTab() {
  console.log('ResearchTab rendering');
  try {
    return <EnhancedResearchTab />;
  } catch (error) {
    console.error('Error rendering EnhancedResearchTab:', error);
    return <div style={{ padding: '20px', color: 'red' }}>Error loading Research Tab: {error.message}</div>;
  }
}`;

fs.writeFileSync(wrapperPath, wrapper);

// Also add debugging to EnhancedResearchTab
const enhancedPath = './src/components/research/EnhancedResearchTab.tsx';
let enhanced = fs.readFileSync(enhancedPath, 'utf8');

// Add console.log at the start of the component
enhanced = enhanced.replace(
  'export const EnhancedResearchTab: React.FC = () => {',
  `export const EnhancedResearchTab: React.FC = () => {
  console.log('EnhancedResearchTab component rendering');`
);

fs.writeFileSync(enhancedPath, enhanced);

console.log('Added debugging to research components');
