const { execSync } = require('child_process');
const fs = require('fs');

const OUTPUT_FILE = 'nexterror.md';

function runCommand(cmd, title) {
  let output = '';
  try {
    output = execSync(cmd, { encoding: 'utf-8', stdio: 'pipe' });
    if (!output.trim()) output = 'No errors.';
  } catch (err) {
    output = (err.stdout ? err.stdout.toString() : '') + (err.stderr ? err.stderr.toString() : '');
    if (!output.trim()) output = err.message;
  }
  return `## ${title}\n\n${output.trim()}\n`;
}

const results = [];

results.push(runCommand('npx eslint . --format stylish', 'ESLint Errors'));
results.push(runCommand('npx tsc --noEmit', 'TypeScript Errors'));
results.push(runCommand('npx next build', 'Next.js Build Errors'));

fs.writeFileSync(OUTPUT_FILE, results.join('\n'), 'utf-8');
console.log(`\nAll Errors Reported to nexterror.md ${OUTPUT_FILE}`); 