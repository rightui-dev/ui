import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

type Status = 'checked' | 'built' | 'blocked' | 'unsupported';
type Platform = 'ios' | 'macos' | 'web' | 'windows' | 'android';
type Kind = 'component' | 'ai' | 'block' | 'chart';
type Evidence = { id: string; description: string; url: string };
type CatalogItem = { slug: string; title: string; source: string };
type Matrix = {
  version: string; asOf: string; exactRevision: string;
  platforms: { key: Platform; label: string }[];
  statuses: Record<Status, { label: string; description: string }>;
  defaults: Record<Platform, Status>; evidence: Evidence[];
  overrides: { kind: Kind; slug: string; platform: Platform; status: Status; evidence: string[] }[];
};

export function compatibility(root = resolve(import.meta.dir, '..')) {
  const read = (path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8'));
  const matrix: Matrix = read('metadata/compatibility.json');
  const expected = ['ios', 'macos', 'web', 'windows', 'android'];
  if (matrix.platforms.map(p => p.key).join(',') !== expected.join(',')) throw new Error('Compatibility columns must stay iOS, macOS, Web, Windows, Android.');
  const definitions: [Kind, string, string][] = [
    ['component', 'Components', 'components'], ['ai', 'AI Elements', 'ai-elements'],
    ['block', 'Blocks', 'blocks'], ['chart', 'Charts', 'charts'],
  ];
  const evidence = new Map(matrix.evidence.map(item => [item.id, item]));
  if (evidence.size !== matrix.evidence.length) throw new Error('Duplicate compatibility evidence.');
  const applied = new Set<object>();
  const groups = definitions.map(([kind, title, file]) => ({
    id: file, title,
    rows: (read(`metadata/${file}.json`) as CatalogItem[]).map(item => {
      const statuses = { ...matrix.defaults };
      const rowEvidence = new Set<string>();
      const seen = new Set<string>();
      for (const override of matrix.overrides.filter(row => row.kind === kind && row.slug === item.slug)) {
        if (!expected.includes(override.platform) || !matrix.statuses[override.status]) throw new Error(`Invalid platform/status: ${item.slug}`);
        if (seen.has(override.platform)) throw new Error(`Duplicate compatibility override: ${item.slug}/${override.platform}`);
        if (!override.evidence.length || override.evidence.some(id => !evidence.has(id))) throw new Error(`Missing compatibility evidence: ${item.slug}`);
        seen.add(override.platform);
        override.evidence.forEach(id => rowEvidence.add(id));
        statuses[override.platform] = override.status;
        applied.add(override);
      }
      const href = kind === 'component' ? `/docs/components/${item.slug}` : kind === 'ai' ? `/docs/ai-elements/${item.slug}` : kind === 'block' ? `/view/${item.slug}` : `/source?file=${item.source}`;
      const labels = Object.fromEntries(expected.map(key => {
        const status = statuses[key as Platform];
        if (!matrix.statuses[status]) throw new Error(`Unknown default status: ${key}`);
        return [key, matrix.statuses[status].label];
      })) as Record<Platform, string>;
      return { id: `${kind}-${item.slug}`, title: kind === 'block' ? `${item.slug} — ${item.title}` : item.title, href, ...labels, evidence: [...rowEvidence] };
    }),
  }));
  if (applied.size !== matrix.overrides.length) throw new Error('Compatibility override names an unknown catalog entry.');
  return { matrix, groups };
}

export function compatibilityMarkdown(root = resolve(import.meta.dir, '..')): string {
  const { matrix, groups } = compatibility(root);
  const rows = groups.reduce((sum, group) => sum + group.rows.length, 0);
  const lines = [
    '# Compatibility', '',
    `${rows} catalog entries. Evidence recorded on ${matrix.asOf} against rightui ${matrix.version} and Exact \`${matrix.exactRevision}\`.`, '',
    'This records validation evidence, not full compatibility certification. Partial checks cover specific examples or interactions, not every variant. Built only means compilation succeeded, without a targeted interaction result.', '',
    'iOS validation is incomplete. Windows and Android are not supported.', '',
    '## Status legend', '',
    ...Object.values(matrix.statuses).map(status => `- **${status.label}:** ${status.description}`), '',
  ];
  for (const group of groups) {
    lines.push(`## ${group.title}`, '', `| Component | ${matrix.platforms.map(p => p.label).join(' | ')} |`, '| --- | --- | --- | --- | --- | --- |');
    for (const row of group.rows) {
      lines.push(`| ${row.title.replaceAll('|', '\\|')} | ${matrix.platforms.map(p => row[p.key]).join(' | ')} |`);
    }
    lines.push('');
  }
  lines.push('## Evidence', '', ...matrix.evidence.map(item => `- **${item.id}:** ${item.description} [Source](${item.url})`), '',
    'The machine-readable row-to-evidence mapping is in [metadata/compatibility.json](https://github.com/rightui-dev/ui/blob/main/metadata/compatibility.json). A successful build does not certify every interaction.', '');
  return lines.join('\n');
}

if (import.meta.main) {
  const root = resolve(import.meta.dir, '..');
  writeFileSync(resolve(root, 'docs/COMPATIBILITY.md'), compatibilityMarkdown(root));
  console.log('Generated docs/COMPATIBILITY.md from catalog and validation evidence.');
}
