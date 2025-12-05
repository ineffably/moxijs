#!/usr/bin/env node
/**
 * MSDF Font Generator for MoxiJS
 *
 * Generates MSDF (Multi-channel Signed Distance Field) fonts for crisp text rendering
 * at any scale. MSDF fonts are loaded by PixiJS v8 and rendered with special shaders.
 *
 * Usage:
 *   npm run generate-msdf-font -- <input.ttf> [output-dir] [output-name]
 *
 * Examples:
 *   npm run generate-msdf-font -- fonts/Roboto.ttf ./assets/msdf Roboto
 *   npm run generate-msdf-font -- fonts/PixelOperator8.ttf ./msdf
 */
import { spawn } from 'child_process';
import { existsSync, mkdirSync, writeFileSync, unlinkSync } from 'fs';
import { basename, join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Character set for font generation - written to temp file to avoid shell escaping issues
const CHAR_SET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 !@#$%^&*()-=_+[]{}|;:\'",.<>?/\\`~';

const inputFont = process.argv[2];
const outputDir = process.argv[3] || '.';
const outputName = process.argv[4] || basename(inputFont || '', '.ttf').replace(/[^a-zA-Z0-9]/g, '-');

if (!inputFont) {
  console.log(`
MSDF Font Generator for MoxiJS
==============================

Generates MSDF (Multi-channel Signed Distance Field) fonts for crisp text
rendering at any scale. Uses msdf-bmfont-xml under the hood.

Usage:
  npm run generate-msdf-font -- <input.ttf> [output-dir] [output-name]

Arguments:
  input.ttf       Path to TTF font file (required)
  output-dir      Output directory (default: current directory)
  output-name     Output file name without extension (default: derived from input)

Examples:
  npm run generate-msdf-font -- fonts/Roboto.ttf ./assets/msdf Roboto
  npm run generate-msdf-font -- fonts/PixelOperator8.ttf ./msdf

Output:
  - <output-name>.json  (font metrics for PixiJS)
  - <output-name>.png   (MSDF texture atlas)

Usage in code:
  import { Assets } from 'pixi.js';
  import { asMSDFText } from '@moxijs/core';

  await Assets.load('path/to/font.json');
  const text = asMSDFText({
    text: 'Hello',
    style: { fontFamily: 'FontName', fontSize: 24 }
  });
`);
  process.exit(1);
}

// Resolve paths relative to current working directory
const cwd = process.cwd();
const inputPath = resolve(cwd, inputFont);
const outputDirPath = resolve(cwd, outputDir);

if (!existsSync(inputPath)) {
  console.error(`Error: Font file not found: ${inputPath}`);
  process.exit(1);
}

// Create output directory if needed
if (!existsSync(outputDirPath)) {
  mkdirSync(outputDirPath, { recursive: true });
  console.log(`Created output directory: ${outputDirPath}`);
}

const outputPath = join(outputDirPath, outputName);

// Write charset to temp file to avoid shell escaping issues
const charsetFile = join(cwd, '.msdf-charset.txt');
writeFileSync(charsetFile, CHAR_SET);

console.log('\nGenerating MSDF font...');
console.log(`Input:  ${inputPath}`);
console.log(`Output: ${outputPath}.json + ${outputPath}.png\n`);

// Use spawn with array args to avoid shell escaping
const args = [
  'msdf-bmfont',
  '-f', 'json',           // Output format (PixiJS reads JSON)
  '-o', outputPath,       // Output path (without extension)
  '-t', 'msdf',           // Field type: msdf, sdf, or psdf
  '--pot',                // Power of two texture
  '--smart-size',         // Auto-size texture
  '-s', '48',             // Font size in atlas
  '-r', '4',              // Distance range
  '-m', '2048,2048',      // Max texture size
  '-p', '2',              // Padding
  '--charset-file', charsetFile,
  inputPath
];

const child = spawn('npx', args, {
  cwd: cwd,
  stdio: 'inherit'
});

child.on('close', (code) => {
  // Clean up temp file
  try { unlinkSync(charsetFile); } catch {}

  if (code === 0) {
    console.log(`\n✅ MSDF font generated successfully!`);
    console.log(`\nUsage in code:`);
    console.log(`  import { asMSDFText } from '@moxijs/core';`);
    console.log(`  await Assets.load('${outputDir}/${outputName}.json');`);
    console.log(`  const text = asMSDFText({ text: 'Hello', style: { fontFamily: '${outputName}', fontSize: 24 } });`);
  } else {
    console.error(`\n❌ Failed to generate MSDF font (exit code: ${code})`);
    process.exit(1);
  }
});

child.on('error', (error) => {
  try { unlinkSync(charsetFile); } catch {}
  console.error('\n❌ Failed to generate MSDF font');
  console.error(error.message);
  process.exit(1);
});
