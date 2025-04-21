/**
 * Component Dependency Analyzer
 * 
 * This script helps identify dependencies between components to prevent breaking changes
 * when removing files.
 * 
 * Usage:
 * node scripts/analyze-dependencies.js [component-path]
 * 
 * Example:
 * node scripts/analyze-dependencies.js src/components/CounterComponent.tsx
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');

// Process arguments
const targetComponent = process.argv[2];

if (!targetComponent) {
  console.error('Please provide a component path to analyze.');
  console.log('Example: node scripts/analyze-dependencies.js src/components/CounterComponent.tsx');
  process.exit(1);
}

const componentName = path.basename(targetComponent).replace(/\.[jt]sx?$/, '');

console.log(`\n🔍 Analyzing dependencies for component: ${componentName}\n`);

// Find all imports of the component
function findImports() {
  try {
    const result = execSync(`grep -r "import.*${componentName}" ${SRC_DIR} --include="*.tsx" --include="*.jsx" --include="*.ts" --include="*.js"`, { encoding: 'utf-8' });
    
    console.log('Files importing this component:');
    console.log('-----------------------------');
    
    const files = result.split('\n')
      .filter(line => line.trim() && !line.includes(targetComponent))
      .map(line => {
        const [file, ...rest] = line.split(':');
        return { file, importStatement: rest.join(':').trim() };
      });
    
    if (files.length === 0) {
      console.log('No imports found. This component may be unused.');
    } else {
      files.forEach(({ file, importStatement }) => {
        console.log(`- ${file}\n  ${importStatement}\n`);
      });
    }
    
    return files;
  } catch (error) {
    console.log('No imports found. This component may be unused.');
    return [];
  }
}

// Check for usage beyond imports (JSX tags, function calls)
function findUsages(files) {
  if (files.length === 0) return;
  
  console.log('Component usage analysis:');
  console.log('------------------------');
  
  files.forEach(({ file }) => {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const usageRegex = new RegExp(`<${componentName}[\\s/>]|${componentName}\\(`, 'g');
      const matches = content.match(usageRegex) || [];
      
      console.log(`- ${file}: ${matches.length} usage(s)`);
      
      if (matches.length > 0) {
        // Extract a few lines around each usage for context
        matches.forEach(match => {
          const index = content.indexOf(match);
          const linesBefore = content.substring(0, index).split('\n');
          const lineNumber = linesBefore.length;
          
          // Get 3 lines of context before and after
          const startLine = Math.max(0, lineNumber - 3);
          const endLine = lineNumber + 3;
          const contextLines = content.split('\n').slice(startLine, endLine);
          
          console.log(`  Usage at line ${lineNumber}:`);
          contextLines.forEach((line, i) => {
            const currentLine = startLine + i + 1;
            const marker = currentLine === lineNumber ? '> ' : '  ';
            console.log(`  ${marker}${currentLine}: ${line.trim()}`);
          });
          console.log('');
        });
      }
    } catch (error) {
      console.error(`  Error analyzing ${file}: ${error.message}`);
    }
  });
}

// Run the analysis
const importingFiles = findImports();
findUsages(importingFiles);

console.log(`\n✅ Dependency analysis complete for ${componentName}\n`);
console.log('Recommendation:');
console.log('--------------');

if (importingFiles.length === 0) {
  console.log('This component appears to be unused and can likely be safely removed.');
} else {
  console.log(`Before removing this component, update the following files to remove dependencies:`);
  importingFiles.forEach(({ file }) => {
    console.log(`- ${file}`);
  });
}

console.log('\nSafety Checklist:');
console.log('---------------');
console.log('☐ Remove all imports of the component');
console.log('☐ Replace component usage with alternatives');
console.log('☐ Run build to verify no errors');
console.log('☐ Then remove the component file'); 