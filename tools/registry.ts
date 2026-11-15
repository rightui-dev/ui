import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
import { createHash } from 'node:crypto';
const root = resolve(import.meta.dir, '..');
const read = (path:string) => readFileSync(resolve(root,path),'utf8');
export function buildRegistry() {
  const uiExports = JSON.parse(read('packages/ui/package.json')).exports;
  const components = JSON.parse(read('metadata/components.json'));
  const aiElements = JSON.parse(read('metadata/ai-elements.json'));
  const charts = JSON.parse(read('metadata/charts.json'));
  const blocks = JSON.parse(read('metadata/blocks.json'));
  const files:Record<string,{path:string,content:string,sha256:string,encoding?:"base64"}>= {};
  function scan(dir:string) {
    for(const item of readdirSync(resolve(root,dir),{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))) {
      if(item.name.startsWith('.')||['node_modules','target','dist','generated','Cargo.lock'].includes(item.name))continue;
      const path=dir?`${dir}/${item.name}`:item.name;
      if(item.isDirectory())scan(path);
      else if(path.startsWith('packages/ui/assets/') && /\.(ttf|otf|woff2?|png|jpg)$/.test(item.name)) {
        const bytes=readFileSync(resolve(root,path));files[path]={path,content:bytes.toString('base64'),encoding:'base64',sha256:createHash('sha256').update(bytes).digest('hex')};
      }
      else if(item.name === 'LICENSE' || /^OFL(?:-[A-Za-z0-9]+)?\.txt$/.test(item.name) || /\.(contract|tamber|ts|rs|toml|json|md|css)$/.test(item.name)) {
        const content=read(path);files[path]={path,content,sha256:createHash('sha256').update(content).digest('hex')};
      }
    }
  }
  scan('');
  const closure=(initial:string[])=>{
    const found=new Set<string>();
    const add=(path:string)=>{
      if(found.has(path))return;
      if(!files[path])throw new Error(`Missing registry dependency: ${path}`);
      found.add(path);
      for (const match of files[path].content.matchAll(/"(assets\/avatars\/[^"]+)"/g)) add(`packages/ui/${match[1]}`);
      if(path==='packages/ui/overlay-layer.contract') { add('packages/ui/assets/sheet.css'); add('packages/ui/docs/OVERLAYS.md'); }
      if(path==='packages/ui/sheet.contract') { add('packages/ui/assets/sheet.css'); add('packages/ui/docs/SHEET.md'); }
      for(const m of files[path].content.matchAll(/^use .+ from "([^"]+)"/gm)) {
        if(m[1].startsWith('.'))add(relative(root,resolve(root,dirname(path),m[1])));
        else if(m[1]==='@rightui/ui')add('packages/ui/index.contract');
        else if(m[1].startsWith('@rightui/ui/')) {
          const target=uiExports['./'+m[1].slice('@rightui/ui/'.length)];
          if(typeof target!=='string')throw new Error(`Unknown public UI entry: ${m[1]}`);
          add(relative(root,resolve(root,'packages/ui',target)));
        }
        else if(m[1].startsWith('@rightui/registry/'))add(m[1].replace('@rightui/registry/','')+'.contract');
      }
    };
    initial.forEach(add);add('packages/ui/ui.tamber');add('packages/ui/theme.ts');add('packages/ui/assets/fonts/Geist.ttf');add('packages/ui/assets/fonts/Geist-Italic.ttf');add('packages/ui/assets/fonts/Newsreader.ttf');add('packages/ui/assets/fonts/Newsreader-Italic.ttf');add('packages/ui/assets/fonts/OFL.txt');add('packages/ui/assets/fonts/OFL-Italic.txt');add('packages/ui/assets/fonts/OFL-Newsreader.txt');add('packages/ui/assets/fonts/provenance.json');add('LICENSE');add('THIRD_PARTY_NOTICES.md');return [...found].sort();
  };
  const result={schema:'rightui-contract/v1',name:'rightui',aiElements:aiElements.map((c:any)=>({...c,files:closure([c.source])})),components:components.map((c:any)=>({...c,files:closure([c.source,c.example])})),blocks:blocks.map((b:any)=>({...b,files:closure([b.source])})),charts:charts.map((c:any)=>({...c,files:closure([c.source])})),files:Object.values(files)};
  mkdirSync(resolve(root,'generated'),{recursive:true});writeFileSync(resolve(root,'generated/registry.json'),JSON.stringify(result,null,2)+'\n');
  return result;
}
if(import.meta.main){const r=buildRegistry();console.log(`${r.components.length} components, ${r.blocks.length} blocks, ${r.charts.length} charts, ${r.files.length} source files`);}
