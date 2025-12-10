#!/usr/bin/env node
/**
 * Generate LLM TOC and inject into all llms.txt files
 *
 * Usage: node scripts/generate-llm-toc.js
 */

const fs = require('fs');
const path = require('path');

const PACKAGES = [
  { name: '@moxijs/core', srcPath: 'packages/core/src', llmsFile: 'packages/core/llms.txt' },
  { name: '@moxijs/ui', srcPath: 'packages/ui/src', llmsFile: 'packages/ui/llms.txt' },
];

const TOC_START = '<!-- TOC:START -->';
const TOC_END = '<!-- TOC:END -->';

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const result = { classes: [], interfaces: [] };

  const classRegex = /export\s+class\s+(\w+)(?:\s+extends\s+([\w<>,\s]+))?\s*\{/g;
  let match;

  while ((match = classRegex.exec(content)) !== null) {
    const className = match[1];
    const classStart = match.index + match[0].length;
    let braceCount = 1;
    let classEnd = classStart;

    for (let i = classStart; i < content.length && braceCount > 0; i++) {
      if (content[i] === '{') braceCount++;
      if (content[i] === '}') braceCount--;
      classEnd = i;
    }

    const classBody = content.substring(classStart, classEnd);
    const methods = extractMethods(classBody);
    result.classes.push({ name: className, methods });
  }

  const interfaceRegex = /export\s+interface\s+(\w+)/g;
  while ((match = interfaceRegex.exec(content)) !== null) {
    result.interfaces.push(match[1]);
  }

  return result;
}

function extractMethods(classBody) {
  const methods = new Set();
  const patterns = [
    /^\s{2}(?:public\s+)?(?:async\s+)?(\w+)\s*(?:<[^>]+>)?\s*\([^)]*\)/gm,
    /^\s{2}(?:public\s+)?get\s+(\w+)\s*\(\)/gm,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(classBody)) !== null) {
      const m = match[1];
      if (m !== 'constructor' && !m.startsWith('_')) methods.add(m);
    }
  }
  return Array.from(methods).sort();
}

function scanDirectory(dirPath) {
  const results = { classes: [], interfaces: [] };
  if (!fs.existsSync(dirPath)) return results;

  const scan = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scan(fullPath);
      } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
        const r = scanFile(fullPath);
        results.classes.push(...r.classes);
        results.interfaces.push(...r.interfaces);
      }
    }
  };
  scan(dirPath);
  return results;
}

function formatPackageTOC(results) {
  let toc = `**Classes:** `;
  toc += results.classes
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(c => `${c.name}(${c.methods.slice(0, 5).join(', ')}${c.methods.length > 5 ? '...' : ''})`)
    .join(' | ');
  toc += `\n**Interfaces:** ${results.interfaces.sort().join(', ')}\n`;
  return toc;
}

function injectTOC(filePath, toc) {
  if (!fs.existsSync(filePath)) {
    console.warn(`  Skipped: ${filePath} not found`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  const startIdx = content.indexOf(TOC_START);
  const endIdx = content.indexOf(TOC_END);

  if (startIdx !== -1 && endIdx !== -1) {
    content = content.substring(0, startIdx + TOC_START.length) +
              '\n' + toc +
              content.substring(endIdx);
  } else {
    const firstHeadingEnd = content.indexOf('\n', content.indexOf('#'));
    content = content.substring(0, firstHeadingEnd + 1) +
              '\n' + TOC_START + '\n' + toc + TOC_END + '\n' +
              content.substring(firstHeadingEnd + 1);
  }

  fs.writeFileSync(filePath, content);
  console.log(`  Updated: ${filePath}`);
}

function main() {
  const rootDir = process.cwd();
  console.log('Generating LLM TOCs...\n');

  // Generate combined TOC for root LLMS.txt
  let rootTOC = `## API Quick Reference\n`;
  rootTOC += `<!-- Auto-generated. Run: node scripts/generate-llm-toc.js -->\n\n`;

  for (const pkg of PACKAGES) {
    const results = scanDirectory(path.join(rootDir, pkg.srcPath));

    // Add to root TOC
    rootTOC += `### ${pkg.name}\n`;
    rootTOC += formatPackageTOC(results);
    rootTOC += '\n';

    // Inject package-specific TOC
    const pkgTOC = `## API Quick Reference\n<!-- Auto-generated -->\n` + formatPackageTOC(results);
    injectTOC(path.join(rootDir, pkg.llmsFile), pkgTOC);
  }

  // Inject root TOC
  injectTOC(path.join(rootDir, 'LLMS.txt'), rootTOC);

  console.log('\nDone!');
}

main();
