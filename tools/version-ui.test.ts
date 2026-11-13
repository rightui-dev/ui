import { afterEach, expect, test } from 'bun:test';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { checkVersion, versionDocs } from './check-version';
import { versionUI } from './version-ui';

const fixtures: string[] = [];
afterEach(() => { for (const root of fixtures.splice(0)) rmSync(root, { recursive: true, force: true }); });

function run(root: string, command: string[]): string {
  const result = Bun.spawnSync(command, { cwd: root, stdout: 'pipe', stderr: 'pipe' });
  if (result.exitCode !== 0) throw new Error(result.stderr.toString());
  return result.stdout.toString().trim();
}

function fixture(notes = '- Improve keyboard navigation.'): string {
  const root = mkdtempSync(resolve(tmpdir(), 'rightui-version-test-'));
  fixtures.push(root);
  for (const dir of ['packages/ui', 'docs', 'tools']) mkdirSync(resolve(root, dir), { recursive: true });
  writeFileSync(resolve(root, 'package.json'), JSON.stringify({ private: true, workspaces: ['packages/*'] }));
  writeFileSync(resolve(root, 'packages/ui/package.json'), JSON.stringify({ name: '@rightui/ui', version: '0.1.0-beta.1', publishConfig: { tag: 'beta' } }));
  writeFileSync(resolve(root, 'packages/ui/index.contract'), 'component Button\n  view\n    text "Button"\n');
  writeFileSync(resolve(root, 'packages/ui/CHANGELOG.md'), `# Changelog\n\n## Unreleased\n\n${notes}\n\n## [0.1.0-beta.1] - 2026-11-13\n\n- Initial beta.\n`);
  for (const path of versionDocs) writeFileSync(resolve(root, path), 'Install rightui-ui-0.1.0-beta.1.tgz\n');
  for (const path of ['check-version.ts', 'package-ui.ts']) copyFileSync(resolve(import.meta.dir, path), resolve(root, 'tools', path));
  run(root, [process.execPath, 'install', '--lockfile-only', '--ignore-scripts']);
  run(root, ['git', 'init', '-q']);
  run(root, ['git', 'config', 'user.name', 'Version Test']);
  run(root, ['git', 'config', 'user.email', 'version-test@example.invalid']);
  run(root, ['git', 'config', 'commit.gpgSign', 'false']);
  run(root, ['git', 'config', 'tag.gpgSign', 'false']);
  run(root, ['git', 'add', '.']);
  run(root, ['git', '-c', 'user.name=Version Test', '-c', 'user.email=version-test@example.invalid', 'commit', '-qm', 'fixture']);
  return root;
}

test('stable, repeated and older versions leave sources unchanged', () => {
  const root = fixture();
  for (const version of ['0.1.0', '1.0.0', '0.1.0-beta.1', '0.0.9-beta.1']) {
    expect(() => versionUI(root, version)).toThrow();
    expect(run(root, ['git', 'status', '--porcelain'])).toBe('');
  }
});

test('missing release notes block a beta bump', () => {
  const root = fixture('');
  expect(() => versionUI(root, '0.1.0-beta.2')).toThrow('Write release notes');
  expect(run(root, ['git', 'status', '--porcelain'])).toBe('');
});

test('a beta bump synchronizes package, lockfile, changelog and install commands without touching Git history', () => {
  const root = fixture();
  const head = run(root, ['git', 'rev-parse', 'HEAD']);
  versionUI(root, '0.1.0-beta.2');
  expect(checkVersion(root)).toBe('0.1.0-beta.2');
  expect(readFileSync(resolve(root, 'packages/ui/CHANGELOG.md'), 'utf8')).toContain('## Unreleased\n\n## [0.1.0-beta.2]');
  expect(run(root, ['git', 'rev-parse', 'HEAD'])).toBe(head);
  expect(run(root, ['git', 'tag', '--list'])).toBe('');
});

test('existing release tags cannot be reused', () => {
  const root = fixture();
  run(root, ['git', 'tag', '--no-sign', '-a', 'v0.1.0-beta.2', '-m', 'fixture']);
  expect(() => versionUI(root, '0.1.0-beta.2')).toThrow('already exists');
  expect(run(root, ['git', 'status', '--porcelain'])).toBe('');
});

test('packing rejects changed sources under an existing version tag', () => {
  const root = fixture();
  run(root, ['git', 'tag', '--no-sign', '-a', 'v0.1.0-beta.1', '-m', 'fixture']);
  writeFileSync(resolve(root, 'packages/ui/index.contract'), 'component Button\n  view\n    text "Changed"\n');
  const result = Bun.spawnSync([process.execPath, 'tools/package-ui.ts'], { cwd: root, stdout: 'pipe', stderr: 'pipe' });
  expect(result.exitCode).not.toBe(0);
  expect(result.stderr.toString()).toContain('Prepare a new beta');
  expect(existsSync(resolve(root, 'dist/rightui-ui-0.1.0-beta.1.tgz'))).toBe(false);
});
