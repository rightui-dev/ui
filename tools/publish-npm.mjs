import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { appendFileSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

export const betaPattern = /^0\.(0|[1-9]\d*)\.(0|[1-9]\d*)-beta\.[1-9]\d*$/;
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const run = (args, options = {}) => execFileSync(args[0], args.slice(1), { maxBuffer: 32 * 1024 * 1024, ...options });

export function validateInputs({ version, source, digest }) {
  if (!betaPattern.test(version ?? '')) throw new Error('An exact 0.x.y-beta.N version is required.');
  if (!/^[a-f0-9]{40}$/.test(source ?? '')) throw new Error('A full source commit is required.');
  if (!/^[a-f0-9]{64}$/.test(digest ?? '')) throw new Error('A SHA-256 digest is required.');
}

export function assertArchiveIdentity(manifest, version) {
  if (manifest.name !== '@rightui/ui' || manifest.version !== version || manifest.private ||
      manifest.publishConfig?.tag !== 'beta' || manifest.publishConfig?.access !== 'public' ||
      manifest.publishConfig?.registry !== 'https://registry.npmjs.org' ||
      manifest.repository?.url !== 'https://github.com/rightui-dev/ui.git') {
    throw new Error('Archive identity or publishing policy differs from @rightui/ui beta.');
  }
}

export function newerBeta(candidate, previous) {
  if (!betaPattern.test(candidate) || !betaPattern.test(previous)) throw new Error('Invalid beta comparison.');
  const parts = value => value.split(/[.-]/).filter(part => part !== 'beta').map(BigInt);
  const a = parts(candidate), b = parts(previous);
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] > b[i];
  return false;
}

export async function alignLatest(version, { readTags, setLatest, wait = delay }) {
  const before = await readTags();
  if (before.beta !== version) throw new Error(`Refusing to promote ${version}: npm beta is ${before.beta}.`);
  if (before.latest && before.latest !== version && (!betaPattern.test(before.latest) || newerBeta(before.latest, version))) {
    throw new Error(`Refusing to replace a newer or stable latest tag (${before.latest}).`);
  }
  if (before.latest !== version) await setLatest(version);
  for (let attempt = 0; attempt < 12; attempt++) {
    const after = await readTags();
    if (after.beta === version && after.latest === version) return after;
    // npm can briefly serve the old tags after accepting the write. Only wait
    // for that exact previous state; a concurrent release must still fail.
    if (after.beta !== version || after.latest !== before.latest) break;
    if (attempt < 11) await wait(5000);
  }
  throw new Error('npm beta and latest must both match the validated release. Retry after checking npm state.');
}

export async function registry(path) {
  const response = await fetch(`https://registry.npmjs.org/@rightui%2Fui${path}`, {
    headers: { 'Cache-Control': 'no-cache' }, signal: AbortSignal.timeout(30000),
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`npm registry returned HTTP ${response.status}.`);
  return response.json();
}

export async function verifyPublished(manifest, digest) {
  const url = new URL(manifest.dist.tarball);
  if (url.origin !== 'https://registry.npmjs.org') throw new Error('Unexpected npm archive origin.');
  const response = await fetch(url, { signal: AbortSignal.timeout(60000) });
  if (!response.ok || sha256(Buffer.from(await response.arrayBuffer())) !== digest) {
    throw new Error('Published archive differs from the locally validated archive.');
  }
}

export function verifyArchive(archive, { version, source, digest }, cwd) {
  validateInputs({ version, source, digest });
  if (sha256(readFileSync(archive)) !== digest) throw new Error('Archive checksum mismatch.');
  const tar = args => run(['tar', ...args, '-f', archive], { cwd });
  const files = tar(['-tz']).toString().trim().split('\n').filter(name => !name.endsWith('/'));
  if (new Set(files).size !== files.length || files.length === 0 || files.length > 1000) throw new Error('Invalid archive entry list.');
  const allowed = /^package\/(?:[^/]+\.contract|ui\.tamber|theme\.ts|package\.json|README\.md|CHANGELOG\.md|LICENSE|THIRD_PARTY_NOTICES\.md|assets\/.+|docs\/[^/]+\.md)$/;
  for (const name of files) {
    if (!allowed.test(name) || name.split('/').some(part => part === '..' || part.startsWith('.'))) {
      throw new Error(`Unexpected archive path: ${name}`);
    }
  }
  const expected = run(['git', 'ls-tree', '-r', '--name-only', source, '--', 'packages/ui'], { cwd }).toString().trim().split('\n')
    .map(name => `package/${name.slice('packages/ui/'.length)}`).filter(name => allowed.test(name));
  if (JSON.stringify([...files].sort()) !== JSON.stringify(expected.sort())) throw new Error('Archive does not contain the complete published source file set.');
  // Read entries without extraction; symlinks and hardlinks are never package payloads.
  if (tar(['-tvz']).toString().split('\n').filter(Boolean).some(line => !['-', 'd'].includes(line[0]))) {
    throw new Error('Archive contains non-regular entries.');
  }
  const extract = name => run(['tar', '-xOzf', archive, name], { cwd });
  const manifest = JSON.parse(extract('package/package.json').toString());
  assertArchiveIdentity(manifest, version);
  for (const name of files) {
    const committed = run(['git', 'show', `${source}:packages/ui/${name.slice(8)}`], { cwd });
    if (!committed.equals(extract(name))) throw new Error(`Archive differs from tagged sources: ${name}`);
  }
  return manifest;
}

export async function main() {
  const inputs = { version: process.env.RELEASE_VERSION, source: process.env.RELEASE_SOURCE_SHA, digest: process.env.RELEASE_SHA256 };
  validateInputs(inputs);
  if (process.env.GITHUB_ACTIONS !== 'true' || process.env.GITHUB_REPOSITORY !== 'rightui-dev/ui' ||
      process.env.GITHUB_REF !== 'refs/heads/main' || !process.env.ACTIONS_ID_TOKEN_REQUEST_URL) {
    throw new Error('npm publication runs only in the authorized GitHub Actions OIDC workflow.');
  }
  const cwd = resolve(fileURLToPath(new URL('..', import.meta.url)));
  const tag = `v${inputs.version}`;
  if (run(['git', 'cat-file', '-t', `refs/tags/${tag}`], { cwd }).toString().trim() !== 'tag' ||
      run(['git', 'rev-parse', `${tag}^{commit}`], { cwd }).toString().trim() !== inputs.source) {
    throw new Error('Annotated release tag does not match the requested source commit.');
  }
  run(['git', 'merge-base', '--is-ancestor', inputs.source, 'origin/main'], { cwd });
  const release = JSON.parse(run(['gh', 'api', `repos/rightui-dev/ui/releases/tags/${tag}`]).toString());
  if (release.draft || !release.prerelease) throw new Error('A published GitHub prerelease is required.');
  const directory = mkdtempSync(resolve(tmpdir(), 'rightui-publish-'));
  const name = `rightui-ui-${inputs.version}.tgz`;
  run(['gh', 'release', 'download', tag, '--repo', 'rightui-dev/ui', '--pattern', name, '--dir', directory]);
  const archive = resolve(directory, name);
  verifyArchive(archive, inputs, cwd);
  const before = await registry('');
  const existing = await registry(`/${inputs.version}`);
  if (process.env.RELEASE_TAGS_ONLY === 'true' && !existing) throw new Error('Tag repair requires an already published version; no package was published.');
  if (existing) {
    await verifyPublished(existing, inputs.digest);
  } else {
    const current = before?.['dist-tags']?.beta;
    if (current && !newerBeta(inputs.version, current)) throw new Error(`Refusing to move beta backwards from ${current}.`);
    run(['npm', 'publish', archive, '--tag', 'beta', '--access', 'public', '--ignore-scripts', '--provenance'], { stdio: 'inherit' });
  }
  let published;
  // npm may accept a publish, then process it asynchronously for several minutes.
  // Read only during propagation: never issue a second publish in this wait.
  for (let attempt = 0; attempt < 120; attempt++) {
    published = await registry(`/${inputs.version}`);
    if (published) break;
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  if (!published) throw new Error('npm publication is not visible yet; retry this workflow to reconcile.');
  await verifyPublished(published, inputs.digest);
  await alignLatest(inputs.version, {
    readTags: async () => (await registry(''))?.['dist-tags'] ?? {},
    setLatest: version => run(['npm', 'dist-tag', 'add', `@rightui/ui@${version}`, 'latest'], { stdio: 'inherit' }),
  });
  const summary = `Verified @rightui/ui@${inputs.version}; beta and latest both select this release.\n\nSource: ${inputs.source}\n\nSHA-256: ${inputs.digest}\n\nNo web/native build or deployment ran in GitHub Actions.\n`;
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
  console.log(summary);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
