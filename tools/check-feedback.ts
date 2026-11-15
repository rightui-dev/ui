import { cpSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

const root = resolve(import.meta.dir, '..');
const sdk = resolve(root, process.env.EXACT ?? '../.tooling/exact');
const version = JSON.parse(readFileSync(resolve(root, 'packages/ui/package.json'), 'utf8')).version;
const app = mkdtempSync(resolve(tmpdir(), 'rightui-feedback-check-'));
const run = (args: string[], cwd: string) => {
  const result = Bun.spawnSync([process.execPath, ...args], {
    cwd, env: { ...process.env, EXACT: sdk, EXACT_FEEDBACK: '0' }, stdout: 'inherit', stderr: 'inherit',
  });
  if (result.exitCode !== 0) throw new Error(`Feedback check failed: ${args.join(' ')}`);
};
run(['tools/package-ui.ts'], root);
cpSync(resolve(root, 'tools/fixtures/feedback'), app, { recursive: true });
writeFileSync(resolve(app, 'package.json'), JSON.stringify({ name: 'rightui-feedback-check', private: true, dependencies: { '@rightui/ui': `file:${resolve(root, `dist/rightui-ui-${version}.tgz`)}` } }, null, 2));
writeFileSync(resolve(app, 'bunfig.toml'), '[install]\nminimumReleaseAgeExcludes = ["@rightui/ui"]\n');
run(['install', '--ignore-scripts'], app);
const installed = resolve(app, 'node_modules/@rightui/ui');
if (JSON.parse(readFileSync(resolve(installed, 'package.json'), 'utf8')).version !== version) throw new Error('Wrong package installed.');
cpSync(resolve(installed, 'assets'), resolve(app, 'assets'), { recursive: true });
cpSync(resolve(installed, 'ui.tamber'), resolve(app, 'app.tamber'));
for (const slug of ['toast', 'tooltip', 'hover-card']) cpSync(resolve(root, `examples/${slug}.contract`), resolve(app, `${slug}-demo.contract`));
writeFileSync(resolve(app, 'exact.mjs'), `import { run } from ${JSON.stringify(resolve(sdk, 'scripts/app-cli.mjs'))};\nprocess.exit(await run({ dir: import.meta.dir, name: "feedback-check", exact2: ${JSON.stringify(sdk)}, args: process.argv.slice(2) }));\n`);
run(['exact.mjs', 'web-build', '--out', 'dist'], app);
run(['exact.mjs', 'test', 'web'], app);
console.log(`Feedback archive installed, built and tested: ${app}`);
