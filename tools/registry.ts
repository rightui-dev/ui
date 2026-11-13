import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
import { createHash } from 'node:crypto';
const root = resolve(import.meta.dir, '..');
const read = (path:string) => readFileSync(resolve(root,path),'utf8');
export function buildRegistry() {
  const components = JSON.parse(read('metadata/components.json'));
  const aiElements = JSON.parse(read('metadata/ai-elements.json'));
  const charts = JSON.parse(read('metadata/charts.json'));
  const blocks = JSON.parse(read('metadata/blocks.json'));
  const files:Record<string,{path:string,content:string,sha256:string}>= {};
  function scan(dir:string) {
    for(const item of readdirSync(resolve(root,dir),{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))) {
      if(item.name.startsWith('.')||['node_modules','target','dist','generated','Cargo.lock'].includes(item.name))continue;
      const path=dir?`${dir}/${item.name}`:item.name;
      if(item.isDirectory())scan(path);
      else if(item.name === 'LICENSE' || /\.(contract|tamber|ts|rs|toml|json|md)$/.test(item.name)) {
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
      for(const m of files[path].content.matchAll(/^use .+ from "([^"]+)"/gm)) {
        if(m[1].startsWith('.'))add(relative(root,resolve(root,dirname(path),m[1])));
        else if(m[1]==='@rightui/ui')add('packages/ui/index.contract');
        else if(m[1].startsWith('@rightui/registry/'))add(m[1].replace('@rightui/registry/','')+'.contract');
      }
    };
    initial.forEach(add);add('packages/ui/ui.tamber');add('LICENSE');add('THIRD_PARTY_NOTICES.md');return [...found].sort();
  };
  const result={schema:'rightui-contract/v1',name:'rightui',aiElements:aiElements.map((c:any)=>({...c,files:closure([c.source])})),components:components.map((c:any)=>({...c,files:closure([c.source,c.example])})),blocks:blocks.map((b:any)=>({...b,files:closure([b.source])})),charts:charts.map((c:any)=>({...c,files:closure([c.source])})),files:Object.values(files)};
  mkdirSync(resolve(root,'generated'),{recursive:true});writeFileSync(resolve(root,'generated/registry.json'),JSON.stringify(result,null,2)+'\n');
  return result;
}
if(import.meta.main){const r=buildRegistry();console.log(`${r.components.length} components, ${r.blocks.length} blocks, ${r.charts.length} charts, ${r.files.length} source files`);}
