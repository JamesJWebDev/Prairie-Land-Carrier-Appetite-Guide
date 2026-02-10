/**
 * Builds a Windows .ico from assets/prairie-land-logo.png.
 * Logo is fit inside each size with transparent padding (no stretch).
 * Run before pack so the exe and shortcuts use the Prairie Land icon.
 */
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const pngToIco = require('png-to-ico');

const ASSETS = path.join(__dirname, '..', 'assets');
const LOGO_PNG = path.join(ASSETS, 'prairie-land-logo.png');
const ICON_ICO = path.join(ASSETS, 'icon.ico');
const SIZES = [256, 48, 32, 16];

async function main() {
  const buffers = [];
  for (const size of SIZES) {
    const buf = await sharp(LOGO_PNG)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();
    buffers.push(buf);
  }
  const ico = await pngToIco(buffers);
  fs.writeFileSync(ICON_ICO, ico);
  console.log('Wrote', path.relative(process.cwd(), ICON_ICO));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
