import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export const versionDocs = ['README.md', 'docs/INSTALLATION.md', 'packages/ui/README.md'];

export function requireBeta(version: string): void {
  if (!/^0\.(0|[1-9]\d*)\.(0|[1-9]\d*)-beta\.[1-9]\d*$/.test(version)) {
    throw new Error('Use a 0.x.y-beta.N version (N starts at 1). Stable releases are not enabled.');
  }
}

export function checkVersion(root: string): string {
  const manifest = JSON.parse(readFileSync(resolve(root, 'packages/ui/package.json'), 'utf8'));
  const version = manifest.version;
  requireBeta(version);
  if (manifest.publishConfig?.tag !== 'beta') throw new Error('The npm publish channel must remain beta.');
  const lock = Bun.JSONC.parse(readFileSync(resolve(root, 'bun.lock'), 'utf8')) as any;
  if (lock.workspaces['packages/ui'].version !== version) throw new Error('bun.lock does not match the UI version.');
  const changelog = readFileSync(resolve(root, 'packages/ui/CHANGELOG.md'), 'utf8');
  if (changelog.match(/^## \[([^\]]+)\]/m)?.[1] !== version) throw new Error('The latest changelog entry must match the UI version.');
  for (const path of versionDocs) {
    const text = readFileSync(resolve(root, path), 'utf8');
    const archives = [...text.matchAll(/rightui-ui-([^\s`/]+)\.tgz/g)];
    if (!archives.length || archives.some(match => match[1] !== version)) {
      throw new Error(`${path} must use the current versioned archive.`);
    }
  }
  return version;
}

if (import.meta.main) console.log(`Version checked: ${checkVersion(resolve(import.meta.dir, '..'))}`);
