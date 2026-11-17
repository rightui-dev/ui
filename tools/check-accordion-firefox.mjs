import { firefox } from '../../.tooling/exact/node_modules/playwright-core/index.mjs';
import { mkdirSync } from 'node:fs';
mkdirSync(new URL('../.exact/accordion-firefox/app-data',import.meta.url),{recursive:true});
const browser = await firefox.launchPersistentContext(new URL('../.exact/accordion-firefox/profile', import.meta.url).pathname, {headless:true, env:{...process.env,CFFIXED_USER_HOME:new URL('../.exact/accordion-firefox/app-data',import.meta.url).pathname}});
const page=await browser.newPage();
try {
 await page.goto(process.argv[2] ?? 'http://localhost:8792/docs/components/accordion');
 await page.waitForTimeout(1500);
 console.log('Firefox', await browser.browser().version(), 'interpolate-size:',await page.evaluate(()=>CSS.supports('interpolate-size','allow-keywords')));
 for (const width of [900,390]) {
  await page.setViewportSize({width,height:850});
  await page.waitForTimeout(300);
  for (const name of ['advanced-accordion','single-expansion']) {
   for (const closing of [true,false]) {
    const ids={panel:name+'-panel-0',trigger:name+'-trigger-0',next:name+'-trigger-1'};
    await page.locator('#'+ids.trigger).scrollIntoViewIfNeeded();
    await page.evaluate(ids=>{window.samples=[];const start=performance.now();function tick(){const el=document.getElementById(ids.panel);window.samples.push({t:performance.now()-start,h:el.getBoundingClientRect().height,y:document.getElementById(ids.next).getBoundingClientRect().top});if(performance.now()-start<650)requestAnimationFrame(tick)}tick()},ids);
    await page.locator('#'+ids.trigger).click();
    await page.waitForTimeout(700);
    const result=await page.evaluate(ids=>({frames:window.samples,open:document.getElementById(ids.trigger).getAttribute('aria-expanded'),inert:document.getElementById(ids.panel).inert,hidden:document.getElementById(ids.panel).getAttribute('aria-hidden')}),ids);
    const first=result.frames[0].h,last=result.frames.at(-1).h;
    const middle=result.frames.filter(f=>f.h>Math.min(first,last)+.2&&f.h<Math.max(first,last)-.2);
    console.log(JSON.stringify({width,name,closing,first,last,middle:middle.length}));
    if(middle.length<3||result.open!==(closing?'false':'true')||result.inert!==closing||(closing?last>.1:last<10)) throw Error('Accordion did not animate correctly');
    if(new Set(result.frames.map(f=>Math.round(f.y*10))).size<4)throw Error('Following trigger snapped');
   }
  }
 }
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.waitForTimeout(300);
 for(const name of ['advanced-accordion','single-expansion']){
  await page.locator('#'+name+'-trigger-0').click();
  await page.waitForTimeout(60);
  const r=await page.locator('#'+name+'-panel-0').evaluate(p=>({h:p.getBoundingClientRect().height,d:getComputedStyle(p).transitionDuration}));
  if(r.h!==0||r.d!=='0s')throw Error('Reduced motion not respected');
 }
 console.log('PASS: Firefox desktop/mobile, opening/closing, following items, reduced motion');
} finally {await browser.close()}
