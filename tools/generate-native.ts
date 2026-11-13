import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dir, '..');
const read = (file: string) => JSON.parse(readFileSync(resolve(root, file), 'utf8'));
const entries = [
  ...read('metadata/components.json').map((item: any) => ({ ...item, id: `component-${item.slug}`, group: 'Components', demo: item.example })),
  ...read('metadata/ai-elements.json').map((item: any) => ({ ...item, id: `ai-${item.slug}`, group: 'AI Elements', demo: item.source })),
  ...read('metadata/blocks.json').map((item: any) => ({ ...item, id: `block-${item.slug}`, group: 'Blocks', demo: item.source })),
  ...read('metadata/charts.json').map((item: any) => ({ ...item, id: `chart-${item.slug}`, group: 'Charts', demo: item.source })),
];
const q = JSON.stringify;
const imports = entries.flatMap((entry, index) => entry.group === 'Blocks' ? [] : [`use Demo as Demo${index} from "@rightui/registry/${entry.demo.replace(/\.contract$/, '')}"`]);
const catalog = entries.map(entry => `DemoEntry(id=${q(entry.id)}, title=${q(entry.title)}, group=${q(entry.group)}, description=${q(entry.description ?? '')})`);
const branches = entries.map((entry, index) => {
  const call = entry.group === 'Blocks'
    ? `BlockPreview(slug=${q(entry.slug)}, width=width, reduced=reduced)`
    : `Demo${index}(width=width, reduced=reduced)`;
  return `    ${index === 0 ? 'if' : 'else if'} id == ${q(entry.id)}\n      ${call}`;
});
writeFileSync(resolve(root, 'examples/native/catalog.contract'), `${imports.join('\n')}
use BlockPreview from "./block-preview.contract"

shape DemoEntry
  id: string
  title: string
  group: string
  description: string

fn catalog(): DemoEntry[] = [${catalog.join(', ')}]

component DemoView
  props
    id: string
    width: number
    reduced: bool
  view
${branches.join('\n')}
`);
console.log(`Generated ${entries.length} native previews from the rightui catalog.`);
