/**
 * Run build-icon then electron-packager with an absolute icon path.
 * rcedit (used by packager on Windows) requires an absolute path to the .ico.
 */
const path = require('path');
const { execSync } = require('child_process');
const packager = require('electron-packager');

const appDir = path.join(__dirname, '..');
const appName = "Prairie Land Carrier's Appetite Guide";
const iconPath = path.resolve(appDir, 'assets', 'icon.ico');

async function main() {
  console.log('Building icon...');
  execSync('node scripts/build-icon.js', { cwd: appDir, stdio: 'inherit' });

  console.log('Packaging with icon:', iconPath);
  const paths = await packager({
    dir: appDir,
    name: appName,
    platform: 'win32',
    arch: 'x64',
    out: path.join(appDir, 'dist'),
    overwrite: true,
    ignore: /^\/dist/,
    icon: iconPath,
  });
  console.log('Wrote app to:', paths[0]);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
