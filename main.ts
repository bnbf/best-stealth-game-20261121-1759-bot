// The Quiet Gallery — hand-in program (Node 22, standard library only).
// Copies game/ and screenshots/ from this repository into the output
// directory and writes dossier.json with buildDossier from the kit's
// vendored library, so the gate sees exactly what the scorer rebuilds.

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)));
const OUTPUT_DIR = resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');

const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
};

function listNamesSorted(dir: string): string[] {
  return readdirSync(dir).sort();
}

function copyTree(sourceDir: string, targetDir: string): void {
  mkdirSync(targetDir, { recursive: true });
  for (const name of listNamesSorted(sourceDir)) {
    const from = join(sourceDir, name);
    const to = join(targetDir, name);
    cpSync(from, to, { recursive: true });
  }
}

function main(): void {
  const gameDir = join(REPO_ROOT, 'game');
  const shotsDir = join(REPO_ROOT, 'screenshots');
  if (!existsSync(gameDir)) throw new Error('game/ is missing from the repository');
  if (!existsSync(shotsDir)) throw new Error('screenshots/ is missing from the repository');
  mkdirSync(OUTPUT_DIR, { recursive: true });
  copyTree(gameDir, join(OUTPUT_DIR, 'game'));
  copyTree(shotsDir, join(OUTPUT_DIR, 'screenshots'));
  const dossier = buildDossier(OUTPUT_DIR, DOSSIER_CAPS);
  writeFileSync(join(OUTPUT_DIR, 'dossier.json'), dossier);
  console.log(`wrote ${join(OUTPUT_DIR, 'dossier.json')} (${dossier.length} bytes)`);
}

main();
