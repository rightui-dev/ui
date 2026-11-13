import { copyFileSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

const root = resolve(import.meta.dir, '..');
const sdk = resolve(root, process.env.EXACT ?? '../.tooling/exact');
const manifest = JSON.parse(readFileSync(resolve(root, 'packages/ui/package.json'), 'utf8'));
let archive = resolve(root, `dist/rightui-ui-${manifest.version}.tgz`);
const registry = process.argv[2] === '--registry';
if (process.argv.length > 3 || (process.argv[2] && !registry)) throw new Error('Usage: bun tools/check-package.ts [--registry]');

function run(args: string[], cwd: string): void {
  const result = Bun.spawnSync(args, {
    cwd, env: { ...process.env, EXACT: sdk, EXACT_FEEDBACK: '0' },
    stdout: 'inherit', stderr: 'inherit',
  });
  if (result.exitCode !== 0) process.exit(result.exitCode || 1);
}

if (!existsSync(resolve(sdk, 'scripts/exact.mjs'))) throw new Error('Run bun run native:setup, or set EXACT to the pinned SDK.');
const directory = mkdtempSync(resolve(tmpdir(), 'rightui-package-'));
if (registry) {
  run(['npm', 'pack', `${manifest.name}@${manifest.version}`, '--pack-destination', directory, '--ignore-scripts'], directory);
  archive = resolve(directory, `rightui-ui-${manifest.version}.tgz`);
} else {
  run([process.execPath, 'tools/package-ui.ts'], root);
}
const listing = Bun.spawnSync(['tar', '-tzf', archive], { stdout: 'pipe', stderr: 'inherit' });
if (listing.exitCode !== 0) process.exit(listing.exitCode || 1);
const files = listing.stdout.toString().trim().split('\n');
for (const file of ['package.json', 'index.contract', 'button.contract', 'ui.tamber', 'assets/fonts/Geist.ttf', 'assets/fonts/OFL.txt', 'LICENSE', 'README.md', 'CHANGELOG.md', 'THIRD_PARTY_NOTICES.md']) {
  if (!files.includes(`package/${file}`)) throw new Error(`Package is missing ${file}`);
}
if (files.some(file => !/^package\/(?:[^/]+\.contract|ui\.tamber|package\.json|README\.md|CHANGELOG\.md|LICENSE|THIRD_PARTY_NOTICES\.md|assets\/.+)$/.test(file))) {
  throw new Error('Package contains files outside the distribution allowlist.');
}

const app = resolve(directory, 'app');
console.log(`Isolated package check: ${app}`);
run([process.execPath, resolve(sdk, 'scripts/exact.mjs'), 'new', app, '--name', 'rightui Package Check', '--bundle-id', 'dev.rightui.packagecheck'], directory);
if (registry) {
  // This isolated release check must be able to install the package just published.
  // Exempt only this package; keep the user's age gate for every other dependency.
  writeFileSync(resolve(app, 'bunfig.toml'), `[install]\nminimumReleaseAgeExcludes = [${JSON.stringify(manifest.name)}]\n`);
}
run([process.execPath, 'add', '--exact', registry ? `${manifest.name}@${manifest.version}` : archive], app);
const installed = resolve(app, 'node_modules/@rightui/ui');
const installedManifest = JSON.parse(readFileSync(resolve(installed, 'package.json'), 'utf8'));
if (installedManifest.name !== manifest.name || installedManifest.version !== manifest.version) {
  throw new Error('The installed package identity must match the requested version.');
}
if (lstatSync(installed).isSymbolicLink() || !realpathSync(installed).startsWith(realpathSync(app) + '/')) {
  throw new Error('The package must be installed from the tarball, without a workspace or global Bun link.');
}
for (const file of ['app.contract', 'app.ts']) copyFileSync(resolve(root, 'integrations/typescript', file), resolve(app, file));
mkdirSync(resolve(app, 'assets/fonts'), { recursive: true });
for (const file of ['Geist.ttf', 'OFL.txt']) copyFileSync(resolve(installed, 'assets/fonts', file), resolve(app, 'assets/fonts', file));
writeFileSync(resolve(app, 'app.test.contract'), `test "installed package renders and handles a press"
  size 800x600
  clock data
  expect text "counter" == "0"
  tap "increment"
  expect text "counter" == "1"
  expect no failures
`);
run([process.execPath, 'exact.mjs', 'contract', 'types', 'app.contract', '-o', 'app.contract.d.ts'], app);
run([process.execPath, 'exact.mjs', 'web-build', '--out', 'dist'], app);
run([process.execPath, 'exact.mjs', 'test', 'web'], app);
console.log(`Package installed from ${registry ? 'npm' : 'the archive'}, built and tested successfully: ${app}`);
