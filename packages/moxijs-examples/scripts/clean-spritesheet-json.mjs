#!/usr/bin/env node
/**
 * Clean up spritesheet JSON files by removing redundant fields
 * - Removes 'rotated' if false
 * - Removes 'trimmed' if false
 * - Removes 'spriteSourceSize' (we only use sourceSize)
 */

import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: node clean-spritesheet-json.mjs <path-to-spritesheet.json>');
  process.exit(1);
}

const inputPath = args[0];

// Read the JSON file
const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

// Track statistics
let stats = {
  totalFrames: 0,
  removedRotated: 0,
  removedTrimmed: 0,
  removedSpriteSourceSize: 0,
};

// Clean up each frame
for (const frameName in data.frames) {
  const frame = data.frames[frameName];
  stats.totalFrames++;

  // Remove 'rotated' if false
  if (frame.rotated === false) {
    delete frame.rotated;
    stats.removedRotated++;
  }

  // Remove 'trimmed' if false
  if (frame.trimmed === false) {
    delete frame.trimmed;
    stats.removedTrimmed++;
  }

  // Remove 'spriteSourceSize' (we only use sourceSize)
  if (frame.spriteSourceSize) {
    delete frame.spriteSourceSize;
    stats.removedSpriteSourceSize++;
  }
}

// Write the cleaned JSON back
const outputPath = inputPath.replace('.json', '.cleaned.json');
fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

// Print statistics
console.log('✅ Cleanup complete!');
console.log(`📊 Statistics:`);
console.log(`   Total frames: ${stats.totalFrames}`);
console.log(`   Removed 'rotated': ${stats.removedRotated}`);
console.log(`   Removed 'trimmed': ${stats.removedTrimmed}`);
console.log(`   Removed 'spriteSourceSize': ${stats.removedSpriteSourceSize}`);
console.log(`\n📁 Output: ${outputPath}`);

// Calculate file size reduction
const originalSize = fs.statSync(inputPath).size;
const cleanedSize = fs.statSync(outputPath).size;
const reduction = ((originalSize - cleanedSize) / originalSize * 100).toFixed(1);
console.log(`💾 File size: ${originalSize} bytes → ${cleanedSize} bytes (${reduction}% reduction)`);
