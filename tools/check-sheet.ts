import { cpSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

const root = resolve(import.meta.dir, '..');
const sdk = resolve(root, process.env.EXACT ?? '../.tooling/exact');
const version = JSON.parse(readFileSync(resolve(root, 'packages/ui/package.json'), 'utf8')).version;
const archive = resolve(root, `dist/rightui-ui-${version}.tgz`);
const app = mkdtempSync(resolve(tmpdir(), 'rightui-sheet-check-'));
const run = (args: string[], cwd: string) => {
  const result = Bun.spawnSync([process.execPath, ...args], {
    cwd, env: { ...process.env, EXACT: sdk, EXACT_FEEDBACK: '0' }, stdout: 'inherit', stderr: 'inherit',
  });
  if (result.exitCode !== 0) throw new Error(`Sheet check failed: ${args.join(' ')}`);
};
run(['tools/package-ui.ts'], root);
cpSync(resolve(root, 'tools/fixtures/sheet'), app, { recursive: true });
writeFileSync(resolve(app, 'package.json'), JSON.stringify({ name: 'rightui-sheet-check', private: true, dependencies: { '@rightui/ui': `file:${archive}` } }, null, 2));
writeFileSync(resolve(app, 'bunfig.toml'), '[install]\nminimumReleaseAgeExcludes = ["@rightui/ui"]\n');
run(['install', '--ignore-scripts'], app);
const installed = resolve(app, 'node_modules/@rightui/ui');
if (JSON.parse(readFileSync(resolve(installed, 'package.json'), 'utf8')).version !== version) throw new Error('Wrong package version installed.');
cpSync(resolve(installed, 'assets'), resolve(app, 'assets'), { recursive: true });
cpSync(resolve(installed, 'ui.tamber'), resolve(app, 'app.tamber'));
cpSync(resolve(root, 'examples/sheet.contract'), resolve(app, 'sheet-demo.contract'));
writeFileSync(resolve(app, 'exact.mjs'), `import { run } from ${JSON.stringify(resolve(sdk, 'scripts/app-cli.mjs'))};\nprocess.exit(await run({ dir: import.meta.dir, name: "sheet-check", exact2: ${JSON.stringify(sdk)}, args: process.argv.slice(2) }));\n`);
run(['exact.mjs', 'web-build', '--out', 'dist'], app);
run(['exact.mjs', 'test', 'web'], app);
console.log(`Sheet archive installed, built and tested: ${app}`);
