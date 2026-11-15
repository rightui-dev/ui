import { copyFileSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(import.meta.dir, '..');
const sdk = resolve(root, process.env.EXACT ?? '../.tooling/exact');
const manifest = JSON.parse(readFileSync(resolve(root, 'packages/ui/package.json'), 'utf8'));
let archive = resolve(root, `dist/rightui-ui-${manifest.version}.tgz`);
const options = process.argv.slice(2);
const archiveFlag = options.indexOf('--archive');
if (archiveFlag >= 0) {
  if (!options[archiveFlag + 1]) throw new Error('--archive requires a file path.');
  archive = resolve(options[archiveFlag + 1]);
  options.splice(archiveFlag, 2);
}
const registry = options.includes('--registry');
if (registry && archiveFlag >= 0) throw new Error('Choose --registry or --archive.');
const checkFonts = options.includes('--fonts');
if (new Set(options).size !== options.length || options.some(option => !['--registry', '--fonts'].includes(option))) {
  throw new Error('Usage: bun tools/check-package.ts [--registry | --archive file] [--fonts]');
}

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
} else if (archiveFlag < 0) {
  run([process.execPath, 'tools/package-ui.ts'], root);
}
const listing = Bun.spawnSync(['tar', '-tzf', archive], { stdout: 'pipe', stderr: 'inherit' });
if (listing.exitCode !== 0) process.exit(listing.exitCode || 1);
const files = listing.stdout.toString().trim().split('\n');
for (const file of ['package.json', 'index.contract', 'button.contract', 'typography-context.contract', 'ui.tamber', 'theme.ts', 'assets/fonts/Geist.ttf', 'assets/fonts/Geist-Italic.ttf', 'assets/fonts/Newsreader.ttf', 'assets/fonts/Newsreader-Italic.ttf', 'assets/fonts/OFL.txt', 'assets/fonts/OFL-Italic.txt', 'assets/fonts/OFL-Newsreader.txt', 'LICENSE', 'README.md', 'CHANGELOG.md', 'THIRD_PARTY_NOTICES.md', 'docs/MIGRATION-0.2.md', 'docs/CODE-BLOCK.md', 'docs/THEMING.md', 'docs/COMPONENT-COMPOSITION.md', 'docs/MARKDOWN.md', 'sheet.contract', 'assets/sheet.css', 'docs/SHEET.md', 'avatar-menu.contract', 'docs/AVATAR.md', 'assets/avatars/user-blue.png', 'assets/avatars/user-violet.png', 'assets/avatars/user-green.png', 'assets/avatars/provenance.json', 'assets/card/cover.jpg', 'assets/card/provenance.json', 'docs/COMPONENT-OPTIONS.md']) {
  if (!files.includes(`package/${file}`)) throw new Error(`Package is missing ${file}`);
}
if (files.some(file => !/^package\/(?:[^/]+\.contract|ui\.tamber|theme\.ts|package\.json|README\.md|CHANGELOG\.md|LICENSE|THIRD_PARTY_NOTICES\.md|assets\/.+|docs\/[^/]+\.md)$/.test(file))) {
  throw new Error('Package contains files outside the distribution allowlist.');
}

const app = resolve(directory, 'app');
console.log(`Isolated package check: ${app}`);
run([process.execPath, resolve(sdk, 'scripts/exact.mjs'), 'new', app, '--name', 'rightui Package Check', '--bundle-id', 'dev.rightui.packagecheck'], directory);
const appManifestPath = resolve(app, 'app.json');
const appManifest = JSON.parse(readFileSync(appManifestPath, 'utf8'));
appManifest.data = [...new Set([...(appManifest.data ?? []), 'rightui-font'])];
writeFileSync(appManifestPath, JSON.stringify(appManifest, null, 2) + '\n');
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
const cover = readFileSync(resolve(installed, 'assets/card/cover.jpg'));
const coverProvenance = JSON.parse(readFileSync(resolve(installed, 'assets/card/provenance.json'), 'utf8')).find((entry: any) => entry.file === 'cover.jpg');
if (cover.length !== 65427 || !coverProvenance || createHash('sha256').update(cover).digest('hex') !== coverProvenance.sha256) {
  throw new Error('Installed Card/AspectRatio cover does not match its provenance.');
}
for (const file of ['app.contract', 'app.ts']) copyFileSync(resolve(root, 'integrations/typescript', file), resolve(app, file));
mkdirSync(resolve(app, 'assets/fonts'), { recursive: true });
for (const file of ['Geist.ttf', 'Geist-Italic.ttf', 'Newsreader.ttf', 'Newsreader-Italic.ttf', 'OFL.txt', 'OFL-Italic.txt', 'OFL-Newsreader.txt']) copyFileSync(resolve(installed, 'assets/fonts', file), resolve(app, 'assets/fonts', file));
writeFileSync(resolve(app, 'app.test.contract'), `test "installed package renders and handles a press"
  size 800x600
  clock data
  expect text "counter" == "0"
  tap "increment"
  expect text "counter" == "1"
  expect no failures
`);
run([process.execPath, 'exact.mjs', 'contract', 'types', 'app.contract', '-o', 'app.contract.d.ts'], app);
if (checkFonts) {
  // Import the installed package's generator, so workspace files cannot hide a
  // missing export or an invalid configuration in the distributed archive.
  const resolveInstalled = createRequire(resolve(app, 'package.json'));
  const { createTheme, themeOptions } = await import(pathToFileURL(resolveInstalled.resolve('@rightui/ui/theme')).href);
  for (const font of ['sans', 'serif', 'mono']) {
    if (!themeOptions.font.includes(font)) throw new Error(`The installed theme generator is missing the ${font} font choice.`);
    writeFileSync(resolve(app, 'app.tamber'), createTheme({ font, interactive: false, includeFont: false }));
    console.log(`Checking imported ${font} configuration with the root uiFont="theme" provider.`);
    run([process.execPath, 'exact.mjs', 'web-build', '--out', `dist/${font}`], app);
    run([process.execPath, 'exact.mjs', 'test', 'web'], app);
  }
} else {
  run([process.execPath, 'exact.mjs', 'web-build', '--out', 'dist'], app);
  run([process.execPath, 'exact.mjs', 'test', 'web'], app);
}
console.log(`Package installed from ${registry ? 'npm' : 'the archive'}, built and tested${checkFonts ? ' with all three imported font configurations' : ''}: ${app}`);
