const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { removeBackground } = require('@imgly/background-removal-node');

const rawDir = path.resolve('public/cars-raw');
const destDir = path.resolve('public/cars-cut');
fs.mkdirSync(destDir, { recursive: true });

const skip = /hatch|debug|^bg-/i;

(async () => {
  const files = fs.readdirSync(rawDir).filter((name) => name.endsWith('.jpg') && !skip.test(name));
  for (const file of files) {
    const out = path.join(destDir, file.replace(/\.jpg$/i, '.png'));
    if (fs.existsSync(out) && fs.statSync(out).size > 50000) {
      console.log('skip', file);
      continue;
    }
    try {
      const blob = await removeBackground(pathToFileURL(path.join(rawDir, file)), { model: 'small' });
      const buf = Buffer.from(await blob.arrayBuffer());
      fs.writeFileSync(out, buf);
      console.log('ok', file, buf.length);
    } catch (err) {
      console.log('fail', file, err.message);
    }
  }
})();
