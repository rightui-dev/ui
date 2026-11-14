import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createPackageTheme, createTheme, defaultTheme, themeAxes, themeOptions, themeTokens,
  type ThemeToken,
} from '../packages/ui/theme';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const includeSite = process.argv.includes('--site');
const inventoryPath = resolve(root, `docs/theme-structure${includeSite ? '-site' : ''}.json`);
const sourceRoots = ['packages/ui', 'examples', 'blocks', 'charts', 'patterns'];

export function validateTokens(tokens: readonly ThemeToken[]): string[] {
  const errors: string[] = [];
  const byName = new Map<string, ThemeToken>();
  for (const token of tokens) {
    if (byName.has(token.name)) errors.push(`Duplicate token ${token.name}`);
    byName.set(token.name, token);
    if (token.axis && !(token.axis in themeAxes)) errors.push(`Unknown axis on ${token.name}`);
    if (token.axis) for (const choice of themeOptions[token.axis]) {
      if (token.variants?.[choice] == null) errors.push(`Missing ${choice} branch on ${token.name}`);
    }
  }
  const refs = new Map<string, string[]>();
  for (const token of tokens) {
    const dependencies = new Set<string>();
    for (const value of [token.value, ...Object.values(token.variants ?? {})]) {
      if (token.kind === 'length' && /\b(?:calc|min|max|clamp)\(/.test(value) && /%|\b\d+(?:\.\d+)?(?:rem|em|[sld]?v[wh]|vmin|vmax)\b/.test(value)) {
        errors.push(`${token.name}: a composed length token must fold to px; keep viewport/relative math in a static Contract row`);
      }
      for (const match of value.matchAll(/\bui\.[a-z][a-z0-9-]*/g)) {
        const name = match[0];
        dependencies.add(name);
        if (!byName.has(name)) errors.push(`${token.name} references unknown ${name}`);
      }
      // A direct alias must preserve its kind. Expressions are admitted by Exact.
      const alias = byName.get(value);
      if (alias && alias.kind !== token.kind) errors.push(`${token.name} aliases ${alias.kind} as ${token.kind}`);
    }
    refs.set(token.name, [...dependencies]);
  }
  const visited = new Set<string>();
  const stack = new Set<string>();
  const visit = (name: string, path: string[]) => {
    if (stack.has(name)) { errors.push(`Token cycle: ${[...path, name].join(' -> ')}`); return; }
    if (visited.has(name)) return;
    stack.add(name);
    for (const next of refs.get(name) ?? []) visit(next, [...path, name]);
    stack.delete(name);
    visited.add(name);
  };
  for (const name of byName.keys()) visit(name, []);
  return errors;
}

type Attribute = { property: string; expression: string; line: number; node: string; section: string; owner: string };

/** Small lexical scanner, not a Contract parser: skips quoted prose and comments,
 * and keeps balanced conditional expressions rather than grepping entire lines. */
export function attributes(source: string): Attribute[] {
  const result: Attribute[] = [];
  let section = '';
  let owner = '';
  const skipString = (text: string, start: number) => {
    const quote = text[start];
    let i = start + 1;
    for (; i < text.length; i++) {
      if (text[i] === '\\') i++;
      else if (text[i] === quote) return i + 1;
    }
    return i;
  };
  for (const [line, text] of source.split('\n').entries()) {
    if (/^\S/.test(text)) [section, owner = ''] = text.split(/\s+/);
    const node = text.trimStart().match(/^[\w-]+/)?.[0] ?? '';
    for (let i = 0; i < text.length;) {
      if (text.slice(i, i + 2) === '//') break;
      if ('"\'`'.includes(text[i])) { i = skipString(text, i); continue; }
      const name = text.slice(i).match(/^[A-Za-z][\w-]*/)?.[0];
      if (!name) { i++; continue; }
      i += name.length;
      while (/\s/.test(text[i] ?? '') && i < text.length) i++;
      if (text[i] !== '=' || text[i + 1] === '=') continue;
      i++;
      while (/\s/.test(text[i] ?? '') && i < text.length) i++;
      const start = i;
      if ('"\'`'.includes(text[i] ?? '\0')) i = skipString(text, i);
      else if (text[i] === '(' || text[i] === '[') {
        let depth = 0;
        do {
          if ('"\'`'.includes(text[i])) { i = skipString(text, i); continue; }
          if (text[i] === '(' || text[i] === '[') depth++;
          if (text[i] === ')' || text[i] === ']') depth--;
          i++;
        } while (i < text.length && depth > 0);
      } else while (i < text.length && !/[\s,)]/.test(text[i])) i++;
      result.push({ property: name, expression: text.slice(start, i), line: line + 1, node, section, owner });
    }
  }
  return result;
}

const visual = /^(?:color|background(?:-color|-image)?|fill|stroke(?:-width|-dasharray|-dashoffset)?|(?:fill|stop)-opacity|stop-color|opacity|font(?:-size|-family|-weight|-style)?|line-height|letter-spacing|border(?:-(?:top|right|bottom|left))?(?:-width|-color|-style|-radius)?|(?:min-|max-)?(?:width|height)|padding(?:-(?:top|right|bottom|left))?|margin(?:-(?:top|right|bottom|left))?|(?:row-|column-)?gap|box-shadow|text-shadow|transition|animation(?:-duration|-delay|-timing-function)?|outline(?:-width|-color)?|top|right|bottom|left|inset|transform|translate|scale|rotate)$/;
const geometry = /^(?:(?:min-|max-)?(?:width|height)|top|right|bottom|left|inset|transform|translate|scale|rotate)$/;
const svgNodes = new Set(['svg', 'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'stop']);
const reasons = {
  geometry: 'Viewport, preview, media, chart or algorithm geometry. Review together with interaction math; not a density claim.',
  'svg-geometry': 'SVG coordinate-system geometry, not a page spacing or CSS radius decision.',
  'chart-coordinates': 'Tooltip anchor is aligned to the fixed chart coordinate system (228/230). It must change with that coordinate system, not with UI density.',
  'responsive-geometry': 'Viewport threshold and clamp multiplier select a responsive layout. Actual spacing inside this expression uses shared tokens; thresholds do not scale with density.',
  'native-chrome': 'The native macOS title lane reserves 150px on each side for OS traffic lights and history actions; its inset follows the host titlebar-area geometry, independently of UI density.',
  'site-layout': 'Site composition: 96rem maximum canvas, 20rem reserved documentation column, and 14rem search-label span. These reading/layout widths are independent of control density; their insets use shared spacing tokens.',
  'hidden-test-node': 'Invisible, aria-hidden dashboard counter keeps a one-pixel frame for test discovery; it is neither a separator nor a visible control.',
  'supplied-icon': 'The supplied iPhone and desktop SVG paths retain their original 0.85 ink opacity. Their tint follows currentColor; this exception is limited to these two PlatformIcon assets.',
  'fixed-media': 'The AppDrop QR image keeps its white surrounding quiet zone in every theme so its fixed dark modules remain scannable. This exception applies only to the view immediately containing that QR asset.',
  pattern: 'Explicit border or line pattern recipe. Exact Tamber has no generic string/enum token.',
  semantics: 'Intrinsic layout, inheritance, transparent paint, reset or full/hidden state endpoint.',
  typography: 'Semantic italic/normal distinction; real font faces remain required.',
  'sdk-motion': 'Exact currently rejects number/length tokens in these keyframe rows. Geometry or opacity must remain literal; durations and easing are still shared tokens.',
  'needs-review': 'Unclassified visual decision: move to a shared token or document a specific exception.',
};
type Category = keyof typeof reasons;
type Observation = { file: string; property: string; value: string; category: Category };

export function classify(attribute: Attribute, value: string, file: string, source = ''): Category {
  if (/^(?:0(?:px|rem|em|%)?|100%|auto|none|inherit|unset|initial|transparent|currentColor|currentcolor|normal|stretch|max-content|min-content|fit-content)$/.test(value)) return 'semantics';
  if (value === '1' && /^(?:opacity|scale)$/.test(attribute.property)) return 'semantics';
  if (value === '1' && file === 'blocks/dashboard.contract' && /^(?:width|height)$/.test(attribute.property)) return 'hidden-test-node';
  if (file === '../landing/apps/site/components/try-app.contract' && attribute.owner === 'TryIPhone'
    && attribute.node === 'view' && attribute.property === 'background-color' && value === '#ffffff'
    && /^\s+image "assets\/brand\/appdrop-iphone-qr\.svg"(?:\s|$)/.test(source.split('\n')[attribute.line] ?? '')) return 'fixed-media';
  if (file === '../landing/apps/site/components/try-app.contract' && attribute.owner === 'PlatformIcon'
    && attribute.node === 'path' && attribute.property === 'fill-opacity' && value === '0.85'
    && /path d="(?:M7\.32617 57\.6855|M5\.67188 47\.1367)/.test(source.split('\n')[attribute.line - 1] ?? '')
    && (source.split('\n')[attribute.line - 1] ?? '').includes('fill="currentColor"')) return 'supplied-icon';
  if (/^(?:0(?:px)?|auto)(?:\s+(?:0(?:px)?|auto)){1,3}$/.test(value)) return 'semantics';
  // Sidebar follows the existing header breakpoint, burger width and text insets.
  if (file === '../landing/tools/app.contract.template' && attribute.property === 'left'
    && value === 'calc(max(ui.space-24, (100vw - 96rem) / 2) + clamp(0px, (1100px - 100vw) * 1000, 32px) + ui.space-8 - ui.space-12)') return 'site-layout';
  if (/\bui\./.test(value) && /100vw\s*-/.test(value)) {
    const withoutThresholds = value.replace(/100vw\s*-\s*\d+px/g, 'viewport-threshold');
    if (!/\b[1-9]\d*(?:\.\d+)?(?:px|rem|em|ms)\b/.test(withoutThresholds)) return 'responsive-geometry';
    if (['../landing/tools/app.contract.template', '../landing/apps/site/components/page-insets.contract'].includes(file)) {
      const withoutLayoutWidths = withoutThresholds.replace(/\b(?:96|20|14)rem\b/g, 'layout-width');
      if (!/\b[1-9]\d*(?:\.\d+)?(?:px|rem|em|ms)\b/.test(withoutLayoutWidths)) return 'site-layout';
    }
  }
  if (file === '../landing/tools/app.contract.template' && attribute.node === 'row'
    && ((['left', 'right'].includes(attribute.property) && value === '150')
      || (attribute.property === 'padding-left' && value === 'env(titlebar-area-x, 0px)'))) return 'native-chrome';
  if (['../landing/tools/app.contract.template', '../landing/apps/site/components/blocks.contract'].includes(file)
    && attribute.property === 'padding'
    && /^(?:0|ui\.space-24) clamp\(0px, \(1100px - 100vw\) \* 1000, ui\.space-16\)$/.test(value)) return 'responsive-geometry';
  if (/^(?:solid|dashed|dotted|double)$/.test(value)) return 'pattern';
  if (attribute.property === 'font-style' && /^(?:italic|normal)$/.test(value)) return 'typography';
  if (attribute.section === 'keyframes' && /^(?:opacity|translate|scale|rotate)$/.test(attribute.property)) return 'sdk-motion';
  if (svgNodes.has(attribute.node) && /^(?:width|height|stroke-dasharray|stroke-dashoffset)$/.test(attribute.property)) return 'svg-geometry';
  if (file === 'packages/ui/chart.contract' && attribute.node === 'svg' && attribute.property === 'left' && value === '5') return 'svg-geometry';
  if (attribute.property === 'top' && [
    'packages/ui/area-chart.contract:230',
    'packages/ui/chart-series.contract:230',
    'packages/ui/chart.contract:228',
  ].includes(`${file}:${value}`)) return 'chart-coordinates';
  if (geometry.test(attribute.property)) {
    if (/calc\([^)]*(?:\+|-)\s*[1-9]\d*(?:\.\d+)?(?:px|rem)/.test(value)) return 'needs-review';
    if (/^(?:top|right|bottom|left)$/.test(attribute.property) && /^\d+(?:px|rem)?$/.test(value)) return 'needs-review';
    if (value === '0.0625rem') return 'needs-review';
    return 'geometry';
  }
  return 'needs-review';
}

function files(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (['node_modules', 'dist', 'target', '.exact', '.git'].includes(entry.name)) return [];
    const path = resolve(directory, entry.name);
    if (relative(root, path) === 'examples/native/app.contract') return [];
    return entry.isDirectory() ? files(path) : path.endsWith('.contract') ? [path] : [];
  });
}

/** Only literal result arms count. Strings in a condition or in a computed
 * URL/id are data, not visual decisions. Exact validates computed rows. */
export function literalValues(expression: string): string[] {
  let text = expression.trim();
  if (text.startsWith('(') && text.endsWith(')')) text = text.slice(1, -1).trim();
  if (/^"(?:\\.|[^"\\])*"$/.test(text)) return [JSON.parse(text)];
  if (/^-?(?:\d*\.)?\d+$/.test(text)) return [text];
  let depth = 0, question = -1, nested = 0;
  for (let i = 0; i < text.length; i++) {
    if ('"\'`'.includes(text[i])) {
      const quote = text[i++];
      for (; i < text.length; i++) {
        if (text[i] === '\\') i++;
        else if (text[i] === quote) break;
      }
      continue;
    }
    if ('([{'.includes(text[i])) depth++;
    if (')]}'.includes(text[i])) depth--;
    if (depth !== 0) continue;
    if (text[i] === '?') { if (question === -1) question = i; else nested++; }
    if (text[i] === ':' && question !== -1) {
      if (nested) nested--;
      else return [...literalValues(text.slice(question + 1, i)), ...literalValues(text.slice(i + 1))];
    }
  }
  return [];
}

const measuredProperty = /^(?:(?:min-|max-)?(?:width|height)|(?:padding|margin|inset)(?:-(?:top|right|bottom|left))?|top|right|bottom|left|(?:row-|column-)?gap|font-size|font-weight|line-height|letter-spacing|(?:border(?:-(?:top|right|bottom|left))?)-(?:width|radius)|stroke-width|opacity|flex-grow|flex-shrink)$/;
const sideShorthands = new Set(['padding', 'margin', 'inset', 'gap', 'border-width', 'border-radius']);
const tokenName = /^(?:ui|param)\.[A-Za-z_][\w-]*$/;

function cssParts(value: string): string[] {
  let depth = 0, start = 0;
  const result: string[] = [];
  for (let i = 0; i <= value.length; i++) {
    if (value[i] === '(') depth++;
    if (value[i] === ')') depth--;
    if (i === value.length || depth === 0 && /\s/.test(value[i])) {
      if (i > start) result.push(value.slice(start, i));
      start = i + 1;
    }
  }
  return result;
}

/** JS target's measured-row map resolves a complete token name only. Shorthand
 * sides are split before that map; conditional classes become bound rows too.
 * Color and motion rows have separate resolvers, so do not reject them here. */
export function runtimeTokenErrors(source: string): { line: number; message: string }[] {
  const rows = attributes(source);
  const errors: { line: number; message: string }[] = [];
  const kinds = new Map(themeTokens.map(token => [token.name, token.kind]));
  const inspect = (row: Attribute, forceDynamic = false, useLine = row.line, context = '') => {
    const dynamic = forceDynamic || !/^"(?:\\.|[^"\\])*"$/.test(row.expression.trim());
    for (const value of literalValues(row.expression)) {
      const references = [...value.matchAll(/\b(?:ui|param)\.[A-Za-z_][\w-]*/g)].map(match => match[0]);
      if (!references.length) continue;
      const prefix = `${context}${row.property}=${JSON.stringify(value)}`;
      if (/^border(?:-(?:top|right|bottom|left))?$/.test(row.property) && references.some(ref => kinds.get(ref) === 'length')) {
        errors.push({ line: useLine, message: `${prefix}: named border widths require border-width/style/color longhands` });
      }
      if (/^(?:box-shadow|text-shadow)$/.test(row.property) && references.some(ref => kinds.get(ref) === 'length')) {
        errors.push({ line: useLine, message: `${prefix}: put named shadow lengths inside one complete shadow token` });
      }
      if (!dynamic || !measuredProperty.test(row.property)) continue;
      const parts = sideShorthands.has(row.property) ? cssParts(value) : [value];
      for (const part of parts) {
        if (/\b(?:ui|param)\.[a-z]/.test(part) && !tokenName.test(part.trim())) {
          errors.push({ line: useLine, message: `${prefix}: dynamic measured rows resolve only a complete token name; use a px-foldable alias or a separate view with a static expression` });
          break;
        }
      }
    }
  };
  for (const row of rows) inspect(row);
  for (const use of rows.filter(row => row.property === 'class' && /[?(]/.test(row.expression))) {
    const choices = new Set(use.expression.match(/\b[A-Z][A-Za-z0-9_]*/g) ?? []);
    for (const row of rows.filter(row => row.section === 'style' && choices.has(row.owner))) {
      inspect(row, true, use.line, `conditional class ${row.owner} (${row.line}): `);
    }
  }
  return errors;
}

export function scanSources(): { observations: Observation[]; errors: string[]; count: number } {
  const observations = new Map<string, Observation>();
  const errors: string[] = [];
  const names = new Set(themeTokens.map(token => token.name));
  const paths = sourceRoots.flatMap(path => files(resolve(root, path)));
  if (includeSite) {
    const site = resolve(root, '../landing');
    if (!existsSync(site)) throw new Error('--site requires the sibling landing checkout');
    paths.push(...files(resolve(site, 'apps/site/components')), resolve(site, 'tools/app.contract.template'));
  }
  for (const path of paths) {
    const text = readFileSync(path, 'utf8');
    errors.push(...runtimeTokenErrors(text).map(error => `${relative(root, path)}:${error.line} ${error.message}`));
    for (const attribute of attributes(text)) {
    if (!visual.test(attribute.property)) continue;
    for (const ref of attribute.expression.matchAll(/\bui\.[a-z][a-z0-9-]*/g)) {
      if (!names.has(ref[0])) errors.push(`${relative(root, path)}:${attribute.line} unknown ${ref[0]}`);
    }
    const strings = literalValues(attribute.expression);
    for (const value of strings) {
      if (/\b(?:ui|param)\.[a-z]/.test(value) && !/#|\b[1-9]\d*(?:\.\d+)?(?:px|rem|em|ms)\b/.test(value)) continue;
      const file = relative(root, path);
      const observation = { file, property: attribute.property, value, category: classify(attribute, value, file, text) };
      if (observation.category === 'semantics') continue;
      observations.set(JSON.stringify(observation), observation);
    }
    }
  }
  return { observations: [...observations.values()].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))), errors, count: paths.length };
}

function main() {
  const errors = validateTokens(themeTokens);
  const combinations = (Object.keys(themeAxes) as (keyof typeof themeAxes)[]).reduce((count, key) => count * themeOptions[key].length, 1);
  if (combinations > 64) errors.push(`Exact supports at most 64 mode combinations; found ${combinations}`);
  if (new Set(Object.values(themeAxes)).size !== Object.keys(themeAxes).length) errors.push('Duplicate axis names');
  const expectedAliases = { 'ui.radius': 'ui.radius-control', 'ui.panel-radius': 'ui.radius-panel' };
  for (const [name, target] of Object.entries(expectedAliases)) {
    if (themeTokens.find(token => token.name === name)?.value !== target) errors.push(`Legacy alias ${name} must point to ${target}`);
  }
  if (readFileSync(resolve(root, 'packages/ui/ui.tamber'), 'utf8') !== createPackageTheme()) errors.push('Generated ui.tamber is stale');
  const exported = createTheme(defaultTheme);
  if (/\naxes\n|\n\s+when /.test(exported)) errors.push('Static export unexpectedly includes mode branches');
  const fonts = resolve(root, 'packages/ui/assets/fonts');
  const provenance = JSON.parse(readFileSync(resolve(fonts, 'provenance.json'), 'utf8'));
  for (const [file, evidence] of Object.entries(provenance) as [string, { sha256: string; source: string; commit: string; license: string; licenseSha256?: string }][]) {
    const digest = createHash('sha256').update(readFileSync(resolve(fonts, file))).digest('hex');
    if (digest !== evidence.sha256) errors.push(`Font checksum changed: ${file}`);
    if (!evidence.source.includes(evidence.commit)) errors.push(`Font source is not pinned: ${file}`);
    if (!readFileSync(resolve(fonts, evidence.license), 'utf8').includes('SIL OPEN FONT LICENSE')) errors.push(`Font license is missing: ${file}`);
    if (evidence.licenseSha256 && createHash('sha256').update(readFileSync(resolve(fonts, evidence.license))).digest('hex') !== evidence.licenseSha256) errors.push(`Font license checksum changed: ${file}`);
  }
  const source = scanSources();
  errors.push(...source.errors);
  const inventory = { schema: 'rightui-theme-structure/v1', scope: [...sourceRoots, ...(includeSite ? ['../landing/apps/site/components', '../landing/tools/app.contract.template'] : [])], reasons, observations: source.observations };
  if (process.argv.includes('--write-inventory')) {
    writeFileSync(inventoryPath, JSON.stringify(inventory, null, 2) + '\n');
  } else if (JSON.stringify(JSON.parse(readFileSync(inventoryPath, 'utf8'))) !== JSON.stringify(inventory)) {
    errors.push('Structural inventory changed; inspect bun tools/check-theme.ts --write-inventory diff and resolve needs-review entries');
  }
  const unreviewed = source.observations.filter(entry => entry.category === 'needs-review');
  for (const entry of unreviewed.slice(0, 25)) errors.push(`${entry.file}: ${entry.property}=${JSON.stringify(entry.value)} needs review`);
  if (unreviewed.length > 25) errors.push(`${unreviewed.length - 25} additional visual decisions need review; see docs/theme-structure.json`);
  if (errors.length) {
    console.error(errors.join('\n'));
    process.exitCode = 1;
    return;
  }
  console.log(`${themeTokens.length} tokens; ${combinations} combinations; ${source.count} Contract files; aliases, generation, fonts and structural inventory checked.`);
}

if (import.meta.main) main();
