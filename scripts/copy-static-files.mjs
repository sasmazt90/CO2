import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const distDir = path.join(projectRoot, 'dist');
const staticFiles = ['app-ads.txt'];

if (!existsSync(distDir)) {
  process.exit(0);
}

for (const fileName of staticFiles) {
  const sourcePath = path.join(projectRoot, fileName);
  const targetPath = path.join(distDir, fileName);

  if (!existsSync(sourcePath)) {
    continue;
  }

  mkdirSync(path.dirname(targetPath), { recursive: true });
  copyFileSync(sourcePath, targetPath);
}
