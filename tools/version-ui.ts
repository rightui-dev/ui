import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { checkVersion, requireBeta, versionDocs } from './check-version';

export function versionUI(root: string, next: string): void {
  requireBeta(next);
  const current = checkVersion(root);
  if (Bun.semver.order(next, current) <= 0) throw new Error('The next beta must be newer than the current version.');
  const tag = Bun.spawnSync(['git', 'rev-parse', '--verify', '--quiet', `refs/tags/v${next}`], { cwd: root });
  if (tag.exitCode === 0) throw new Error(`Tag v${next} already exists; released versions are immutable.`);

  const changelogPath = resolve(root, 'packages/ui/CHANGELOG.md');
  const changelog = readFileSync(changelogPath, 'utf8');
  const unreleased = changelog.match(/^## Unreleased\r?\n([\s\S]*?)(?=^## |$(?![\s\S]))/m);
  const notes = unreleased?.[1].trim();
  if (!notes || !notes.replace(/<!--[\s\S]*?-->/g, '').trim()) {
    throw new Error('Write release notes under ## Unreleased in packages/ui/CHANGELOG.md first.');
  }

  const paths = ['packages/ui/package.json', 'packages/ui/CHANGELOG.md', 'bun.lock', ...versionDocs];
  const original = new Map(paths.map(path => [path, existsSync(resolve(root, path)) ? readFileSync(resolve(root, path)) : null]));
  const run = (args: string[], cwd: string) => {
    const result = Bun.spawnSync([process.execPath, ...args], { cwd, stdout: 'pipe', stderr: 'pipe' });
    if (result.exitCode !== 0) throw new Error(result.stderr.toString() || `bun ${args.join(' ')} failed.`);
  };
  try {
    run(['pm', 'version', next, '--no-git-tag-version'], resolve(root, 'packages/ui'));
    run(['install', '--lockfile-only', '--ignore-scripts'], root);
    for (const path of versionDocs) {
      writeFileSync(resolve(root, path), original.get(path)!.toString().replaceAll(current, next));
    }
    const date = new Date().toISOString().slice(0, 10);
    writeFileSync(changelogPath, changelog.replace(unreleased![0], `## Unreleased\n\n## [${next}] - ${date}\n\n${notes}\n\n`));
    checkVersion(root);
  } catch (error) {
    for (const [path, content] of original) {
      if (content) writeFileSync(resolve(root, path), content);
      else if (existsSync(resolve(root, path))) unlinkSync(resolve(root, path));
    }
    throw error;
  }
  console.log(`Prepared ${next}. Validate with bun run check:package, then commit and tag v${next}.`);
}

if (import.meta.main) {
  const next = process.argv[2];
  if (!next || process.argv.length !== 3) throw new Error('Usage: bun run version:ui 0.1.0-beta.2');
  versionUI(resolve(import.meta.dir, '..'), next);
}
