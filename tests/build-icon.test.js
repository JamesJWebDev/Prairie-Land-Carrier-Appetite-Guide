import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const projectRoot = path.resolve(__dirname, '..');
const iconPath = path.join(projectRoot, 'assets', 'icon.ico');

describe('build-icon script', () => {
  it('generates assets/icon.ico when run', () => {
    execSync('node scripts/build-icon.js', { cwd: projectRoot, stdio: 'pipe' });
    expect(fs.existsSync(iconPath)).toBe(true);
  });

  it('produces a non-empty .ico file', () => {
    if (!fs.existsSync(iconPath)) {
      execSync('node scripts/build-icon.js', { cwd: projectRoot, stdio: 'pipe' });
    }
    const stat = fs.statSync(iconPath);
    expect(stat.size).toBeGreaterThan(100);
  });
});
