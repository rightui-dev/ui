import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createPackageTheme } from '../packages/ui/theme';
const output=resolve(import.meta.dir,'../packages/ui/ui.tamber');
const next=createPackageTheme();
if (process.argv.includes('--check')) {
  if(readFileSync(output,'utf8')!==next)throw Error('ui.tamber is stale; run bun tools/generate-theme.ts');
  console.log('RightUI theme source and package tokens agree.');
} else {writeFileSync(output,next);console.log('Generated ui.tamber from the shared theme source.');}
