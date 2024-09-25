import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import packageJson from '../package.json' assert { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const buildDir = path.join(__dirname, '../build');

fs.rmSync(buildDir, { recursive: true, force: true });
fs.mkdirSync(buildDir);

const { name, version } = packageJson;
const img = `${name}:${version}`;

console.log(`Building ${img} image`);

Bun.spawnSync({
  cmd: ['docker', 'build', '-t', img, '.'],
  stdio: ['ignore', 'inherit', 'inherit'],
  cwd: path.resolve(__dirname, '..'),
});

console.log(`Saving ${name}.tar file`);

const tarFile = path.join(buildDir, `${name}.tar`);

Bun.spawnSync({
  cmd: ['docker', 'save', '-o', tarFile, img],
  stdio: ['ignore', 'inherit', 'inherit'],
  cwd: path.resolve(__dirname, '..'),
});
