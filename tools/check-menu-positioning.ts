import { cpSync, mkdtempSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';

const root = resolve(import.meta.dir, '..');
const sdk = resolve(root, process.env.EXACT ?? '../.tooling/exact');
const app = mkdtempSync(resolve(tmpdir(), 'rightui-menu-check-'));
cpSync(resolve(root, 'tools/fixtures/menus'), app, { recursive: true });
cpSync(resolve(root, 'packages/ui'), resolve(app, 'node_modules/@rightui/ui'), { recursive: true });
for (const name of ['dropdown-menu', 'navigation-menu']) {
  cpSync(resolve(root, `examples/${name}.contract`), resolve(app, `${name.replace('-menu', '')}-demo.contract`));
}
cpSync(resolve(root, 'packages/ui/assets'), resolve(app, 'assets'), { recursive: true });
cpSync(resolve(root, 'packages/ui/ui.tamber'), resolve(app, 'app.tamber'));
writeFileSync(resolve(app, 'package.json'), JSON.stringify({ name: 'rightui-menu-check', private: true }));
writeFileSync(resolve(app, 'app.json'), JSON.stringify({ name: 'Menu check', id: 'dev.rightui.menucheck', app: { name: 'Menu check', id: 'dev.rightui.menucheck' }, data: ['rightui-font', 'rightui-sheet'] }));
writeFileSync(resolve(app, 'app.ts'), "export const grants = '';\nexport const answer = () => { throw new Error('No data sources'); };\n");
writeFileSync(resolve(app, 'exact.mjs'), `import { run } from ${JSON.stringify(resolve(sdk, 'scripts/app-cli.mjs'))};\nprocess.exit(await run({dir:import.meta.dir,name:'menu-check',exact2:${JSON.stringify(sdk)},args:process.argv.slice(2)}));\n`);
console.log(`Menu fixture: ${app}`);
const build = Bun.spawnSync([process.execPath, 'exact.mjs', 'web-build', '--out', 'dist'], { cwd: app, env: { ...process.env, EXACT_FEEDBACK: '0' }, stdout: 'inherit', stderr: 'inherit' });
assert.equal(build.exitCode, 0, 'Menu fixture compiles');
const server = Bun.serve({ port: 0, hostname: '127.0.0.1', fetch(request) {
  const pathname = decodeURIComponent(new URL(request.url).pathname);
  const file = resolve(app, 'dist', pathname === '/' ? 'index.html' : pathname.slice(1));
  return existsSync(file) ? new Response(Bun.file(file)) : new Response('Not found', { status: 404 });
} });
const { suiteBrowser } = await import(resolve(sdk, 'scripts/agent-launch.mjs'));
const engine = process.env.RIGHTUI_BROWSER ?? 'chromium';
const browser = await suiteBrowser(engine, engine === 'firefox'
  ? { env: { ...process.env, CFFIXED_USER_HOME: mkdtempSync(resolve(tmpdir(), 'rightui-firefox-data-')) } }
  : {});
try {
  for (const width of [1280, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    page.on('pageerror', error => { throw error; });
    await page.goto(server.url.href);
    await page.waitForFunction(() => globalThis.exact?.ready);
    const settle = () => page.waitForTimeout(450);
    const geometry = (trigger: string, panel: string) => page.evaluate(([trigger, panel]) => {
      const a = document.getElementById(trigger)!.getBoundingClientRect();
      const b = document.getElementById(panel)!.getBoundingClientRect();
      return { left: b.left - a.left, right: b.right - a.right, x: b.x, end: b.right, width: b.width, viewport: innerWidth };
    }, [trigger, panel]);
    for (const right of [false, true]) {
      if (right) await page.locator('#outside').click();
      for (const [trigger, panel] of [['parity-dropdown', 'parity-dropdown-menu'], ['simple', 'simple-menu'], ['links', 'links-menu'], ['popover', 'popover-content'], ['legacy', 'legacy-content']]) {
        await page.locator(`#${trigger}`).click();
        await settle();
        const box = await geometry(trigger, panel);
        assert.ok(Math.abs(right ? box.right : box.left) < 1, `${width} ${trigger} ${right ? 'right' : 'left'}: ${JSON.stringify(box)}`);
        assert.ok(box.x >= 0 && box.end <= width + 1, 'Panel stays in viewport');
        await page.keyboard.press('Escape');
        await settle();
      }
    }
    await page.locator('#outside').click();
    await page.locator('#site-navigation-start').hover();
    await settle();
    await page.evaluate(() => { globalThis.menuPanel = document.getElementById('site-navigation-content'); });
    for (const section of ['components', 'resources', 'start']) {
      await page.evaluate(() => {
        globalThis.menuFrames = [];
        const start = performance.now();
        const sample = () => {
          const panel = document.getElementById('site-navigation-content');
          const box = panel?.getBoundingClientRect();
          globalThis.menuFrames.push({ x: box?.x, width: box?.width, open: panel?.matches(':popover-open') });
          if (performance.now() - start < 400) requestAnimationFrame(sample);
        };
        sample();
      });
      await page.locator(`#site-navigation-${section}`).hover();
      await settle();
      const box = await geometry(`site-navigation-${section}`, 'site-navigation-content');
      assert.ok(Math.abs(box.left) < 1 || Math.abs(box.right) < 1, `Navigation edge: ${JSON.stringify(box)}`);
      assert.ok(box.x >= -1 && box.end <= width + 1, `Navigation containment: ${JSON.stringify(box)}`);
      const sample = await page.evaluate(() => ({ same: globalThis.menuPanel === document.getElementById('site-navigation-content'), frames: globalThis.menuFrames }));
      assert.equal(sample.same, true, 'Shared panel identity');
      assert.ok(sample.frames.every(frame => frame.open && frame.width > 0), 'No disappearing panel during transfer');
      if (width === 1280) {
        const from = sample.frames[0].x, to = sample.frames.at(-1).x;
        assert.ok(Math.abs(from - to) > 2, 'Panel travels to the next button');
        assert.ok(sample.frames.some(frame => frame.x > Math.min(from, to) + 1 && frame.x < Math.max(from, to) - 1), 'Panel slides through intermediate positions');
      }
    }
    await page.locator('#site-navigation-start').focus();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Escape');
    await settle();
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'site-navigation-start', 'Escape restores active trigger focus');
    for (const method of ['trigger', 'outside', 'escape']) {
      await page.locator('#popover').click();
      await settle();
      if (method === 'trigger') await page.locator('#popover').click();
      if (method === 'outside') await page.mouse.click(width - 4, 4);
      if (method === 'escape') await page.keyboard.press('Escape');
      const ghosts = await page.evaluate(async () => {
        const frames = [];
        for (let i = 0; i < 15; i++) {
          await new Promise(requestAnimationFrame);
          frames.push([...document.querySelectorAll('[popover]')].filter(node => node.matches(':popover-open') || node.getBoundingClientRect().height > 0).length);
        }
        return frames;
      });
      assert.ok(ghosts.every(count => count === 0), `Popover closes without a visible ghost (${method})`);
    }
    await page.locator('#outside').click();
    await page.locator('#site-navigation-components').hover();
    await settle();
    const rightNav = await geometry('site-navigation-components', 'site-navigation-content');
    assert.ok(Math.abs(rightNav.left) < 1 || Math.abs(rightNav.right) < 1, 'Right-side navigation stays trigger-aligned');
    assert.ok(rightNav.x >= -1 && rightNav.end <= width + 1, 'Right-side navigation stays visible');
    await page.keyboard.press('Escape');
    await settle();
    await page.locator('#outside').click();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.locator('#site-navigation-start').hover();
    await settle();
    await page.locator('#site-navigation-components').hover();
    const reduced = await page.evaluate(() => {
      const panel = document.getElementById('site-navigation-content');
      return { animations: panel.getAnimations().filter(animation => animation.playState === 'running').length, layout: panel.style.getPropertyValue('--exact-layout-transition') };
    });
    assert.equal(reduced.animations, 0, 'Reduced motion does not slide');
    assert.ok(!reduced.layout || reduced.layout === 'none', 'Reduced motion disables layout transition');
    if (width === 1280) {
      await page.setViewportSize({ width: 390, height: 900 });
      await settle();
      const resized = await geometry('site-navigation-components', 'site-navigation-content');
      assert.ok(resized.x >= -1 && resized.end <= 391, `Open panel follows resize: ${JSON.stringify(resized)}`);
    }
    assert.deepEqual(await page.evaluate(() => (globalThis.exact?.journal ?? []).filter(line => /refused|poisoned|unavailable|failed/i.test(line))), [], 'No runtime refusals');
    console.log(`Menu positioning, shared-panel motion and Popover dismissal passed at ${width}px`);
    await page.close();
  }
} finally {
  await browser.close();
  await browser.browser.close();
  server.stop(true);
}
