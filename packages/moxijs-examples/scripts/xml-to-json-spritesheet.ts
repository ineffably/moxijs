/**
 * XML to JSON Spritesheet Converter
 *
 * Converts TextureAtlas XML format to PixiJS JSON spritesheet format
 *
 * Usage:
 *   npx tsx scripts/xml-to-json-spritesheet.ts <input.xml> [output.json]
 *
 * Example:
 *   npx tsx scripts/xml-to-json-spritesheet.ts assets/ui-pack-scifi/spritesheet/uipackSpace_sheet.xml
 */

import * as fs from 'fs';
import * as path from 'path';

interface Frame {
  frame: { x: number; y: number; w: number; h: number };
  rotated: boolean;
  trimmed: boolean;
  spriteSourceSize: { x: number; y: number; w: number; h: number };
  sourceSize: { w: number; h: number };
}

interface SpritesheetJSON {
  frames: Record<string, Frame>;
  meta: {
    image: string;
    format: string;
    size: { w: number; h: number };
    scale: string;
  };
}

function parseXML(xmlContent: string): SpritesheetJSON {
  const lines = xmlContent.split('\n');
  const frames: Record<string, Frame> = {};
  let imagePath = 'sheet.png';

  for (const line of lines) {
    // Parse TextureAtlas tag for image path
    const atlasMatch = line.match(/imagePath="([^"]+)"/);
    if (atlasMatch) {
      imagePath = atlasMatch[1];
      continue;
    }

    // Parse SubTexture tags
    const nameMatch = line.match(/name="([^"]+)"/);
    const xMatch = line.match(/x="(\d+)"/);
    const yMatch = line.match(/y="(\d+)"/);
    const widthMatch = line.match(/width="(\d+)"/);
    const heightMatch = line.match(/height="(\d+)"/);

    if (nameMatch && xMatch && yMatch && widthMatch && heightMatch) {
      const name = nameMatch[1];
      const x = parseInt(xMatch[1]);
      const y = parseInt(yMatch[1]);
      const w = parseInt(widthMatch[1]);
      const h = parseInt(heightMatch[1]);

      frames[name] = {
        frame: { x, y, w, h },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w, h },
        sourceSize: { w, h }
      };
    }
  }

  return {
    frames,
    meta: {
      image: imagePath,
      format: 'RGBA8888',
      size: { w: 512, h: 512 },
      scale: '1'
    }
  };
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: npx tsx scripts/xml-to-json-spritesheet.ts <input.xml> [output.json]');
    process.exit(1);
  }

  const inputPath = args[0];
  const outputPath = args[1] || inputPath.replace('.xml', '.json');

  if (!fs.existsSync(inputPath)) {
    console.error(`Error: Input file not found: ${inputPath}`);
    process.exit(1);
  }

  console.log(`Converting ${inputPath} to ${outputPath}...`);

  const xmlContent = fs.readFileSync(inputPath, 'utf-8');
  const jsonData = parseXML(xmlContent);

  fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2));

  console.log(`✓ Successfully converted!`);
  console.log(`  Frames: ${Object.keys(jsonData.frames).length}`);
  console.log(`  Image: ${jsonData.meta.image}`);
  console.log(`  Output: ${outputPath}`);
}

main();
