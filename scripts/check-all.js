import { execSync } from 'child_process';
import fs from 'fs';

const OUTPUT_FILE = 'nexterror.md';

// Run a shell command and return the result with a title. For Next.js build, treat 'Compiled successfully' as no errors.
function runCommand(cmd, title, isNextBuild = false) {
  let output = '';
  try {
    output = execSync(cmd, { encoding: 'utf-8', stdio: 'pipe' });
    if (isNextBuild) {
      // If build is successful (contains 'Compiled successfully'), treat as no errors
      if (output.includes('Compiled successfully')) {
        output = 'No errors found.';
      }
    } else {
      if (!output.trim()) output = 'No errors found.';
    }
  } catch (err) {
    output = (err.stdout ? err.stdout.toString() : '') + (err.stderr ? err.stderr.toString() : '');
    if (!output.trim()) output = err.message;
  }
  return { title, output: output.trim() };
}

const results = [];

// Sử dụng cùng pattern với lệnh lint trong package.json
const eslintResult = runCommand('npx eslint src/app src/client src/server src/shared --no-error-on-unmatched-pattern --format stylish', 'ESLint Errors');
const tscResult = runCommand('npx tsc --noEmit', 'TypeScript Errors');
const nextResult = runCommand('npx next build', 'Next.js Build Errors', true);

results.push(eslintResult, tscResult, nextResult);

const content = results
  .map(r => `## ${r.title}\n\n${r.output}\n`).join('\n');

fs.writeFileSync(OUTPUT_FILE, content, 'utf-8');

console.log(`\nAll errors reported to ${OUTPUT_FILE}`); 