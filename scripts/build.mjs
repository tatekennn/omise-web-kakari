import { cp, mkdir, rm } from 'node:fs/promises';

const files = ['index.html', 'styles.css', 'script.js', 'favicon.svg', 'robots.txt'];
const directories = ['assets', 'samples'];
await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await Promise.all([
  ...files.map((file) => cp(file, `dist/${file}`)),
  ...directories.map((directory) => cp(directory, `dist/${directory}`, { recursive: true })),
]);
console.log(`Built ${files.length} files and ${directories.length} directories into dist/`);
