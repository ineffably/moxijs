#!/usr/bin/env npx ts-node
/**
 * Dry Run Publish Script
 * Simulates the GitHub Actions publish workflow locally
 *
 * Usage:
 *   npx ts-node scripts/dry-run-publish.ts [bump] [package]
 *   npm run publish:dry-run -- patch both
 */

import { execSync, spawnSync } from 'child_process';
import { mkdtempSync, rmSync, readFileSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';

// Colors for terminal output
const colors = {
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  blue: (s: string) => `\x1b[34m${s}\x1b[0m`,
  cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
};

type BumpType = 'patch' | 'minor' | 'major';
type PackageChoice = 'both' | 'core' | 'ui';

interface PackageJson {
  name: string;
  version: string;
}

const ROOT_DIR = resolve(__dirname, '..');

function run(cmd: string, options: { cwd?: string; silent?: boolean } = {}): string {
  const { cwd = ROOT_DIR, silent = false } = options;
  try {
    const result = execSync(cmd, { cwd, encoding: 'utf-8', stdio: silent ? 'pipe' : 'inherit' });
    return result || '';
  } catch (error: any) {
    if (error.stdout) return error.stdout;
    throw error;
  }
}

function runCapture(cmd: string, cwd: string = ROOT_DIR): string {
  return execSync(cmd, { cwd, encoding: 'utf-8' }).trim();
}

function readPackageJson(pkgDir: string): PackageJson {
  const pkgPath = join(ROOT_DIR, pkgDir, 'package.json');
  return JSON.parse(readFileSync(pkgPath, 'utf-8'));
}

function calculateNewVersion(currentVersion: string, bump: BumpType): string {
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  switch (bump) {
    case 'major': return `${major + 1}.0.0`;
    case 'minor': return `${major}.${minor + 1}.0`;
    case 'patch': return `${major}.${minor}.${patch + 1}`;
  }
}

function testPackage(
  pkg: 'core' | 'ui',
  bump: BumpType,
  tempDir: string
): { success: boolean; currentVersion: string; newVersion: string } {
  const pkgDir = `packages/${pkg}`;
  const pkgName = `@moxijs/${pkg}`;
  const fullPkgDir = join(ROOT_DIR, pkgDir);

  console.log(colors.cyan(`\nTesting ${pkgName}...`));

  // Get versions
  const pkgJson = readPackageJson(pkgDir);
  const currentVersion = pkgJson.version;
  const newVersion = calculateNewVersion(currentVersion, bump);

  console.log(`  Current: ${currentVersion} → New: ${colors.yellow(newVersion)}`);

  // Show package contents
  console.log(colors.blue('  Package contents:'));
  const dryRunOutput = runCapture(`npm pack --dry-run 2>&1`, fullPkgDir);
  dryRunOutput.split('\n').slice(0, 15).forEach(line => console.log(`    ${line}`));

  // Pack the package
  console.log(colors.blue('  Creating tarball...'));
  run('npm pack --quiet', { cwd: fullPkgDir, silent: true });

  // Find the tarball
  const tarball = runCapture(`ls -1 *.tgz | head -1`, fullPkgDir);
  const tarballPath = join(fullPkgDir, tarball);

  // Test installation in temp directory
  console.log(colors.blue('  Testing installation...'));
  const testDir = join(tempDir, `test-${pkg}`);
  run(`mkdir -p ${testDir}`, { silent: true });
  run('npm init -y --quiet', { cwd: testDir, silent: true });

  try {
    run(`npm install ${tarballPath} --quiet 2>/dev/null`, { cwd: testDir, silent: true });
  } catch {
    // npm install may return non-zero but still work
  }

  // Test import
  const importTest = spawnSync('node', ['-e', `require('${pkgName}')`], { cwd: testDir });
  const success = importTest.status === 0;

  if (success) {
    console.log(colors.green(`  ✓ ${pkgName} imports successfully`));
  } else {
    console.log(colors.red(`  ✗ ${pkgName} failed to import`));
    if (importTest.stderr) {
      console.log(colors.red(`    ${importTest.stderr.toString()}`));
    }
  }

  // Cleanup tarball
  rmSync(tarballPath, { force: true });

  return { success, currentVersion, newVersion };
}

async function main() {
  const args = process.argv.slice(2);
  const bump: BumpType = (args[0] as BumpType) || 'patch';
  const packageChoice: PackageChoice = (args[1] as PackageChoice) || 'both';

  if (!['patch', 'minor', 'major'].includes(bump)) {
    console.error(colors.red(`Invalid bump type: ${bump}. Use patch, minor, or major.`));
    process.exit(1);
  }

  if (!['both', 'core', 'ui'].includes(packageChoice)) {
    console.error(colors.red(`Invalid package: ${packageChoice}. Use both, core, or ui.`));
    process.exit(1);
  }

  console.log(colors.blue('━'.repeat(58)));
  console.log(colors.blue('  📦 DRY RUN PUBLISH - Simulating workflow'));
  console.log(colors.blue(`  Bump: ${colors.yellow(bump)}  Package: ${colors.yellow(packageChoice)}`));
  console.log(colors.blue('━'.repeat(58)));

  // Create temp directory
  const tempDir = mkdtempSync(join(tmpdir(), 'moxijs-dry-run-'));

  try {
    // Step 1: Build
    console.log(colors.yellow('\n[1/5] Building packages...'));
    run('npm run build');
    console.log(colors.green('✓ Build complete'));

    // Step 2: Tests
    console.log(colors.yellow('\n[2/5] Running tests...'));
    run('npm run test:ci');
    console.log(colors.green('✓ Tests passed'));

    // Step 3 & 4: Validate packages
    const results: { pkg: string; success: boolean; currentVersion: string; newVersion: string }[] = [];

    if (packageChoice === 'both' || packageChoice === 'core') {
      console.log(colors.yellow('\n[3/5] Validating @moxijs/core...'));
      const result = testPackage('core', bump, tempDir);
      results.push({ pkg: 'core', ...result });
    } else {
      console.log(colors.yellow('\n[3/5] Skipping @moxijs/core (not selected)'));
    }

    if (packageChoice === 'both' || packageChoice === 'ui') {
      console.log(colors.yellow('\n[4/5] Validating @moxijs/ui...'));
      const result = testPackage('ui', bump, tempDir);
      results.push({ pkg: 'ui', ...result });
    } else {
      console.log(colors.yellow('\n[4/5] Skipping @moxijs/ui (not selected)'));
    }

    // Check for failures
    const failures = results.filter(r => !r.success);
    if (failures.length > 0) {
      console.log(colors.red('\n✗ Validation failed for:'));
      failures.forEach(f => console.log(colors.red(`  - @moxijs/${f.pkg}`)));
      process.exit(1);
    }

    // Step 5: Git status
    console.log(colors.yellow('\n[5/5] Checking git status...'));
    const gitStatus = runCapture('git status --porcelain');
    if (gitStatus) {
      console.log(colors.yellow('  ⚠ Uncommitted changes detected:'));
      gitStatus.split('\n').forEach(line => console.log(`    ${line}`));
    } else {
      console.log(colors.green('  ✓ Working directory clean'));
    }

    // Summary
    console.log(colors.blue('\n' + '━'.repeat(58)));
    console.log(colors.green('✅ DRY RUN COMPLETE - All validations passed!'));
    console.log('');
    console.log('If this were a real publish, the workflow would:');
    results.forEach(r => {
      console.log(`  • Bump @moxijs/${r.pkg} ${r.currentVersion} → ${colors.green(r.newVersion)}`);
      console.log(`  • Publish @moxijs/${r.pkg} to npm`);
      console.log(`  • Create git tag ${r.pkg}@${r.newVersion}`);
    });
    console.log(colors.blue('━'.repeat(58)));

  } finally {
    // Cleanup temp directory
    rmSync(tempDir, { recursive: true, force: true });
  }
}

main().catch(err => {
  console.error(colors.red('Error:'), err.message);
  process.exit(1);
});
