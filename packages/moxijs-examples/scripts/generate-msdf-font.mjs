#!/usr/bin/env node
/**
 * MSDF Font Generator for MoxiJS
 *
 * Generates MSDF (Multi-channel Signed Distance Field) fonts for crisp text rendering
 * at any scale. MSDF fonts are loaded by PixiJS v8 and rendered with special shaders.
 *
 * Usage:
 *   node scripts/generate-msdf-font.mjs <input-font.ttf> [output-name]
 *
 * Examples:
 *   node scripts/generate-msdf-font.mjs assets/fonts/Roboto-Regular.ttf Roboto
 *   node scripts/generate-msdf-font.mjs assets/fonts/pixel_operator/PixelOperator8.ttf PixelOperator8-MSDF
 */
import { spawn } from 'child_process';
import { existsSync, mkdirSync, writeFileSync, unlinkSync } from 'fs';
import { basename, join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');

// Character set for font generation - written to temp file to avoid shell escaping issues
const CHAR_SET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 !@#$%^&*()-=_+[]{}|;:\'",.<>?/\\`~';

// Output directory for generated MSDF fonts
const OUTPUT_DIR = join(PROJECT_ROOT, 'assets/fonts/msdf');

const inputFont = process.argv[2];
const outputName = process.argv[3] || basename(inputFont, '.ttf').replace(/[^a-zA-Z0-9]/g, '-');

if (!inputFont) {
  console.log(`
MSDF Font Generator for MoxiJS
==============================

Usage: node scripts/generate-msdf-font.mjs <input-font.ttf> [output-name]

Examples:
  node scripts/generate-msdf-font.mjs assets/fonts/Roboto-Regular.ttf Roboto
  node scripts/generate-msdf-font.mjs assets/fonts/pixel_operator/PixelOperator8.ttf PixelOperator8-MSDF

Output:
  Files will be generated in: public/assets/fonts/msdf/
  - <output-name>.json  (font metrics)
  - <output-name>.png   (MSDF texture atlas)
`);
  process.exit(1);
}

// Resolve input path relative to project root
const inputPath = join(PROJECT_ROOT, inputFont);

if (!existsSync(inputPath)) {
  console.error(`Error: Font file not found: ${inputPath}`);
  process.exit(1);
}

// Create output directory if needed
if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`Created output directory: ${OUTPUT_DIR}`);
}

const outputPath = join(OUTPUT_DIR, outputName);

// Write charset to temp file to avoid shell escaping issues
const charsetFile = join(PROJECT_ROOT, '.msdf-charset.txt');
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
  cwd: PROJECT_ROOT,
  stdio: 'inherit'
});

child.on('close', (code) => {
  // Clean up temp file
  try { unlinkSync(charsetFile); } catch {}

  if (code === 0) {
    console.log(`\n✅ MSDF font generated successfully!`);
    console.log(`\nUsage in code:`);
    console.log(`  await Assets.load('assets/fonts/msdf/${outputName}.json');`);
    console.log(`  const text = new BitmapText({ text: 'Hello', style: { fontFamily: '${outputName}' } });`);
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
