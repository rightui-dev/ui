import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { alignLatest, assertArchiveIdentity, main, newerBeta, sha256, validateInputs, verifyArchive, verifyPublished } from './publish-npm.mjs';

const version = '0.4.0-beta.1';
const manifest = { name: '@rightui/ui', version, publishConfig: { tag: 'beta', access: 'public', registry: 'https://registry.npmjs.org' }, repository: { url: 'https://github.com/rightui-dev/ui.git' } };
test('archive propagation retries reads but rejects changed bytes and permanent errors immediately', async () => {
  const published = { dist: { tarball: 'https://registry.npmjs.org/@rightui/ui/-/ui-test.tgz' } };
  let reads = 0, waits = 0;
  await verifyPublished(published, sha256('exact archive'), {
    request: async () => ++reads < 3 ? new Response(null, { status: 404 }) : new Response('exact archive'),
    wait: async () => { waits++; },
  });
  assert.equal(reads, 3); assert.equal(waits, 2);
  for (const response of [new Response('wrong bytes'), new Response(null, { status: 403 })]) {
    await assert.rejects(verifyPublished(published, sha256('exact archive'), {
      request: async () => response, wait: async () => { assert.fail('Permanent failures must not retry'); },
    }), /differs|HTTP 403/);
  }
  waits = 0;
  await assert.rejects(verifyPublished(published, sha256('exact archive'), {
    request: async () => new Response(null, { status: 404 }), wait: async () => { waits++; },
  }), /not available yet/);
  assert.equal(waits, 119);
});
test('publication inputs reject injection, unstable versions and abbreviated commits', () => {
  for (const bad of ['0.4.0', '1.0.0-beta.1', '0.4.0-beta.0', '0.4.0-beta.1; echo unsafe']) {
    assert.throws(() => validateInputs({ version: bad, source: 'a'.repeat(40), digest: 'b'.repeat(64) }));
  }
  assert.throws(() => validateInputs({ version, source: 'main', digest: 'b'.repeat(64) }));
  assert.throws(() => assertArchiveIdentity({ ...manifest, name: '@other/ui' }, version));
  assert.throws(() => assertArchiveIdentity({ ...manifest, publishConfig: { ...manifest.publishConfig, tag: 'latest' } }, version));
});
test('beta ordering cannot move the public beta tag backwards', () => {
  assert.equal(newerBeta('0.4.0-beta.10', '0.4.0-beta.9'), true);
  assert.equal(newerBeta('0.4.0-beta.1', '0.3.0-beta.99'), true);
  assert.equal(newerBeta('0.3.0-beta.99', '0.4.0-beta.1'), false);
  assert.equal(newerBeta(version, version), false);
});
test('publication promotes the verified beta to latest and a retry does not rewrite tags', async () => {
  let tags = { beta: version, latest: '0.2.0-beta.5' }, writes = 0;
  const operations = { readTags: async () => ({ ...tags }), setLatest: async selected => { writes++; tags.latest = selected; } };
  await alignLatest(version, operations);
  assert.deepEqual(tags, { beta: version, latest: version });
  await alignLatest(version, operations);
  assert.equal(writes, 1);
});
test('repair resumes after a rejected tag write, and never rolls a newer release back', async () => {
  let tags = { beta: version, latest: '0.2.0-beta.5' }, writes = 0;
  const readTags = async () => ({ ...tags });
  await assert.rejects(alignLatest(version, { readTags, setLatest: async () => { throw new Error('OIDC dist-tag permission missing'); } }), /permission missing/);
  await alignLatest(version, { readTags, setLatest: async selected => { writes++; tags.latest = selected; } });
  assert.equal(writes, 1);
  for (const changed of [
    { beta: '0.4.0-beta.2', latest: '0.4.0-beta.2' },
    { beta: version, latest: '0.4.0-beta.2' },
    { beta: version, latest: '1.0.0' },
  ]) {
    tags = changed;
    await assert.rejects(alignLatest(version, { readTags, setLatest: async () => { writes++; } }), /Refusing/);
  }
  assert.equal(writes, 1);
});
test('tag verification tolerates stale registry reads without repeating the write', async () => {
  let reads = 0, writes = 0, waits = 0;
  const tags = await alignLatest(version, {
    readTags: async () => ({ beta: version, latest: ++reads < 4 ? '0.2.0-beta.5' : version }),
    setLatest: async () => { writes++; },
    wait: async milliseconds => { assert.equal(milliseconds, 5000); waits++; },
  });
  assert.deepEqual(tags, { beta: version, latest: version });
  assert.equal(writes, 1);
  assert.equal(waits, 2);
});
test('tag verification is bounded and refuses a concurrently changed latest', async () => {
  let writes = 0, waits = 0;
  await assert.rejects(alignLatest(version, {
    readTags: async () => ({ beta: version, latest: '0.2.0-beta.5' }),
    setLatest: async () => { writes++; },
    wait: async () => { waits++; },
  }), /both match/);
  assert.equal(writes, 1);
  assert.equal(waits, 11);
  let reads = 0;
  await assert.rejects(alignLatest(version, {
    readTags: async () => ({ beta: version, latest: ++reads === 1 ? '0.2.0-beta.5' : '0.5.0-beta.1' }),
    setLatest: async () => {},
    wait: async () => { assert.fail('Concurrent changes must fail immediately'); },
  }), /both match/);
});
test('a concurrent beta change is reported after promotion instead of claiming success', async () => {
  let tags = { beta: version, latest: '0.2.0-beta.5' };
  await assert.rejects(alignLatest(version, { readTags: async () => ({ ...tags }), setLatest: async selected => {
    tags = { beta: '0.4.0-beta.2', latest: selected };
  } }), /both match/);
});
test('the publication entry point refuses a local process before any network action', async () => {
  const original = { ...process.env };
  try {
    process.env.RELEASE_VERSION = version;
    process.env.RELEASE_SOURCE_SHA = 'a'.repeat(40);
    process.env.RELEASE_SHA256 = 'b'.repeat(64);
    delete process.env.GITHUB_ACTIONS;
    await assert.rejects(main(), /only in the authorized GitHub Actions/);
  } finally {
    for (const key of Object.keys(process.env)) if (!(key in original)) delete process.env[key];
    Object.assign(process.env, original);
  }
});
test('archive bytes must match both the digest and the complete committed package', () => {
  const root = mkdtempSync(resolve(tmpdir(), 'rightui-publish-test-'));
  const run = args => execFileSync(args[0], args.slice(1), { cwd: root, stdio: 'pipe' }).toString().trim();
  try {
    mkdirSync(resolve(root, 'packages/ui'), { recursive: true });
    writeFileSync(resolve(root, 'packages/ui/package.json'), JSON.stringify(manifest));
    writeFileSync(resolve(root, 'packages/ui/button.contract'), 'component Button\n');
    run(['git', 'init', '-q']); run(['git', 'add', '.']);
    run(['git', '-c', 'user.name=Test', '-c', 'user.email=test@example.invalid', 'commit', '-qm', 'fixture']);
    const source = run(['git', 'rev-parse', 'HEAD']);
    mkdirSync(resolve(root, 'package'));
    const pack = () => { run(['tar', '-czf', 'archive.tgz', 'package']); return { version, source, digest: sha256(readFileSync(resolve(root, 'archive.tgz'))) }; };
    writeFileSync(resolve(root, 'package/package.json'), JSON.stringify(manifest));
    writeFileSync(resolve(root, 'package/button.contract'), 'component Button\n');
    const input = pack(), archive = resolve(root, 'archive.tgz');
    assert.equal(verifyArchive(archive, input, root).version, version);
    assert.throws(() => verifyArchive(archive, { ...input, digest: '0'.repeat(64) }, root), /checksum/);
    writeFileSync(resolve(root, 'package/button.contract'), 'tampered');
    assert.throws(() => verifyArchive(archive, pack(), root), /differs from tagged sources/);
    rmSync(resolve(root, 'package/button.contract'));
    assert.throws(() => verifyArchive(archive, pack(), root), /complete published source/);
    writeFileSync(resolve(root, 'package/.npmrc'), 'fake-secret');
    assert.throws(() => verifyArchive(archive, pack(), root), /Unexpected archive path/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
