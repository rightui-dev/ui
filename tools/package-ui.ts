import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { checkVersion } from './check-version';

const root = resolve(import.meta.dir, '..');
const destination = resolve(root, 'dist');
const manifest = JSON.parse(readFileSync(resolve(root, 'packages/ui/package.json'), 'utf8'));
checkVersion(root);
const tag = `refs/tags/v${manifest.version}`;
if (Bun.spawnSync(['git', 'rev-parse', '--verify', '--quiet', tag], { cwd: root }).exitCode === 0) {
  const changed = Bun.spawnSync(['git', 'diff', '--exit-code', tag, '--', 'packages/ui'], { cwd: root, stdout: 'pipe' });
  const untracked = Bun.spawnSync(['git', 'ls-files', '--others', '--exclude-standard', 'packages/ui'], { cwd: root, stdout: 'pipe' });
  if (changed.exitCode !== 0 || untracked.exitCode !== 0 || untracked.stdout.toString().trim()) {
    throw new Error(`Package sources changed since v${manifest.version}. Prepare a new beta before packing.`);
  }
}
mkdirSync(destination, { recursive: true });

const packed = Bun.spawnSync([
  process.execPath, 'pm', 'pack', '--ignore-scripts', '--destination', destination,
], { cwd: resolve(root, 'packages/ui'), stdout: 'inherit', stderr: 'inherit' });
if (packed.exitCode !== 0) process.exit(packed.exitCode);

const name = `rightui-ui-${manifest.version}.tgz`;
const archive = resolve(destination, name);
const sha256 = createHash('sha256').update(readFileSync(archive)).digest('hex');
writeFileSync(`${archive}.sha256`, `${sha256}  ${name}\n`);
console.log(`Install in an Exact app: bun add ${archive}`);
console.log(`SHA-256: ${sha256}`);
