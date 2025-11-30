import * as fs from 'fs';
import * as path from 'path';

/**
 * Test to ensure type definitions are generated correctly
 * This prevents regressions where types end up in the wrong location
 * or critical exports are missing.
 */
describe('Type Definitions', () => {
  const libTypesDir = path.join(__dirname, '../lib/types');
  const indexDtsPath = path.join(libTypesDir, 'index.d.ts');
  const packageJsonPath = path.join(__dirname, '../package.json');

  describe('Type definition file structure', () => {
    it('should have lib/types/index.d.ts (not lib/types/src/index.d.ts)', () => {
      expect(fs.existsSync(indexDtsPath)).toBe(true);
      
      // Ensure it's NOT in the wrong location
      const wrongPath = path.join(libTypesDir, 'src', 'index.d.ts');
      expect(fs.existsSync(wrongPath)).toBe(false);
    });

    it('should have expected type definition directories', () => {
      expect(fs.existsSync(path.join(libTypesDir, 'main'))).toBe(true);
      expect(fs.existsSync(path.join(libTypesDir, 'library'))).toBe(true);
      expect(fs.existsSync(path.join(libTypesDir, 'ui'))).toBe(true);
    });

    it('should NOT have src subdirectory in lib/types', () => {
      const srcDir = path.join(libTypesDir, 'src');
      if (fs.existsSync(srcDir)) {
        // If src exists, it should only contain test files, not the main index
        const srcIndexPath = path.join(srcDir, 'index.d.ts');
        expect(fs.existsSync(srcIndexPath)).toBe(false);
      }
    });
  });

  describe('Type definition exports', () => {
    let indexDtsContent: string;

    beforeAll(() => {
      if (!fs.existsSync(indexDtsPath)) {
        throw new Error(`Type definitions not found at ${indexDtsPath}. Run 'npm run build' first.`);
      }
      indexDtsContent = fs.readFileSync(indexDtsPath, 'utf-8');
    });

    it('should export AsEntity type', () => {
      expect(indexDtsContent).toContain('export type { AsEntity');
      expect(indexDtsContent).toMatch(/export type.*AsEntity.*from/);
    });

    it('should export MoxiLogic type', () => {
      expect(indexDtsContent).toContain('export type {');
      expect(indexDtsContent).toMatch(/MoxiLogic/);
    });

    it('should export core types', () => {
      expect(indexDtsContent).toContain('Logic');
      expect(indexDtsContent).toContain('asEntity');
      expect(indexDtsContent).toContain('MoxiEntity');
    });

    it('should export UI types', () => {
      expect(indexDtsContent).toContain('UIComponent');
      expect(indexDtsContent).toContain('UILabel');
      expect(indexDtsContent).toContain('UIButton');
    });

    it('should export library types', () => {
      expect(indexDtsContent).toContain('StateMachine');
      expect(indexDtsContent).toContain('StateLogic');
      expect(indexDtsContent).toContain('asSprite');
      expect(indexDtsContent).toContain('asText');
    });
  });

  describe('Package.json configuration', () => {
    let packageJson: any;

    beforeAll(() => {
      const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
      packageJson = JSON.parse(packageJsonContent);
    });

    it('should point types field to lib/types/index.d.ts', () => {
      expect(packageJson.types).toBe('lib/types/index.d.ts');
    });

    it('should NOT point to lib/types/src/index.d.ts', () => {
      expect(packageJson.types).not.toBe('lib/types/src/index.d.ts');
      expect(packageJson.types).not.toContain('/src/');
    });
  });

  describe('Type definition file content structure', () => {
    let indexDtsContent: string;

    beforeAll(() => {
      if (!fs.existsSync(indexDtsPath)) {
        throw new Error(`Type definitions not found at ${indexDtsPath}. Run 'npm run build' first.`);
      }
      indexDtsContent = fs.readFileSync(indexDtsPath, 'utf-8');
    });

    it('should import from relative paths (not from src/)', () => {
      // Should import from './main/', './library/', './ui/' not './src/main/'
      expect(indexDtsContent).toMatch(/from ['"]\.\/main\//);
      expect(indexDtsContent).toMatch(/from ['"]\.\/library\//);
      expect(indexDtsContent).toMatch(/from ['"]\.\/ui\//);

      // Should NOT import from './src/'
      expect(indexDtsContent).not.toMatch(/from ['"]\.\/src\//);
    });

    it('should have proper export statements', () => {
      expect(indexDtsContent).toContain('export type');
      expect(indexDtsContent).toContain('export {');
      expect(indexDtsContent).toContain('export default');
    });
  });
});

