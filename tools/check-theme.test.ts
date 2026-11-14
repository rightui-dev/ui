import { describe, expect, test } from 'bun:test';
import { attributes, classify, literalValues, runtimeTokenErrors, validateTokens } from './check-theme';
import { createFontDeclaration, createTheme, normalizeTheme, themeAxes, themeMode, themeOptions, themeTokens, type ThemeToken } from '../packages/ui/theme';

describe('theme dependency guard', () => {
  test('rejects missing references, cycles and incompatible aliases', () => {
    const tokens: ThemeToken[] = [
      { name: 'ui.a', kind: 'length', value: 'ui.b' },
      { name: 'ui.b', kind: 'length', value: 'ui.a' },
      { name: 'ui.color', kind: 'color', value: 'ui.a' },
      { name: 'ui.missing', kind: 'length', value: 'calc(ui.unknown * 2)' },
    ];
    const errors = validateTokens(tokens).join('\n');
    expect(errors).toContain('Token cycle');
    expect(errors).toContain('aliases length as color');
    expect(errors).toContain('unknown ui.unknown');
  });

  test('requires a complete variant table before exporting runtime choices', () => {
    expect(validateTokens([{ name: 'ui.size', kind: 'length', value: '1px', axis: 'density', variants: { comfortable: '1px' } }])).toContain('Missing compact branch on ui.size');
  });

  test('rejects viewport math in a length alias instead of promising a broken workaround', () => {
    expect(validateTokens([{ name: 'ui.offset', kind: 'length', value: 'calc(100% - 24px)' }]).join('\n')).toContain('must fold to px');
  });
});

describe('Exact dynamic token resolution regression', () => {
  test('rejects the Switch calc expression and conditional padding calc sides', () => {
    const source = 'view left=(checked ? "calc(100% - ui.space-1 - ui.space-16)" : "ui.space-1")\nview padding=(wide ? "calc(ui.space-4 * 2) ui.space-16" : "ui.space-4 ui.space-16")';
    expect(runtimeTokenErrors(source)).toHaveLength(2);
  });

  test('accepts complete aliases and shorthands split into bare-token sides', () => {
    const source = 'view left=(checked ? "ui.space-16" : "ui.space-1") padding=(wide ? "ui.space-8 ui.space-16" : "ui.space-4 ui.space-12") border-width=(thick ? "ui.border-strong-width" : "param.outlineWidth")';
    expect(runtimeTokenErrors(source)).toEqual([]);
  });

  test('rejects conditional classes because Exact expands their math into dynamic rows', () => {
    const source = 'style Wide\n  left="calc(100% - ui.space-16)"\nstyle Off\n  left="ui.space-1"\ncomponent App\n  view\n    view class=(wide ? Wide : Off)';
    expect(runtimeTokenErrors(source)[0].message).toContain('conditional class Wide');
  });

  test('accepts static formulas and statically applied classes', () => {
    const source = 'style Wide\n  left="calc(100% - ui.space-16)"\ncomponent App\n  view\n    view class=Wide padding="calc(ui.space-4 * 2) ui.space-16"';
    expect(runtimeTokenErrors(source)).toEqual([]);
  });

  test('rejects named widths embedded in border or shadow strings', () => {
    const source = 'view border=(on ? "ui.border-width solid ui.border" : "0") box-shadow=(on ? "0 0 0 ui.border-width ui.border" : "none")';
    const errors = runtimeTokenErrors(source);
    expect(errors).toHaveLength(2);
    expect(errors[0].message).toContain('longhands');
    expect(errors[1].message).toContain('complete shadow token');
  });

  test('preserves the distinct color and motion resolvers', () => {
    const source = 'view border=(on ? "1px solid ui.border" : "0") box-shadow=(on ? "ui.shadow-control" : "none")\nview box-shadow=(on ? "0 0 0 1px ui.border" : "none") transition=(on ? "opacity ui.duration-fast ui.easing" : "none") color=(on ? "color-mix(in srgb, ui.primary 50%, transparent)" : "ui.foreground")';
    expect(runtimeTokenErrors(source)).toEqual([]);
  });
});

describe('Contract source regression scan', () => {
  test('the QR quiet-zone exception does not admit unrelated white surfaces', () => {
    const source = 'component TryIPhone\n  view\n    view background-color="#ffffff"\n      image "assets/brand/appdrop-iphone-qr.svg" width=208 height=208';
    const row = attributes(source).find(row => row.property === 'background-color')!;
    const file = '../landing/apps/site/components/try-app.contract';
    expect(classify(row, '#ffffff', file, source)).toBe('fixed-media');
    expect(classify(row, '#ffffff', file, source.replace('appdrop-iphone-qr.svg', 'other.svg'))).toBe('needs-review');
    expect(classify({ ...row, owner: 'AnotherCard' }, '#ffffff', file, source)).toBe('needs-review');
    expect(classify(row, '#ffffff', 'another.contract', source)).toBe('needs-review');
  });

  test('ignores quoted prose and comments, preserves nested conditional rows', () => {
    const source = 'text "Documentation says padding=99" font-family="ui.font-body" // color="#abc"\nview border=(state == "label" ? "ui.border" : (busy ? "transparent" : "ui.input"))';
    const rows = attributes(source);
    expect(rows.map(row => row.property)).toEqual(['font-family', 'border']);
    expect(literalValues(rows[1].expression)).toEqual(['ui.border', 'transparent', 'ui.input']);
  });

  test('does not confuse condition strings and computed SVG ids with colors', () => {
    expect(literalValues('(name == "Quick Create" ? "ui.primary" : "none")')).toEqual(['ui.primary', 'none']);
    expect(literalValues('("url(#" + id + "-gradient)")')).toEqual([]);
    expect(literalValues('(open ? 0.5 : 1)')).toEqual(['0.5', '1']);
  });
});

describe('portable configuration', () => {
  test('static export preserves aliases and selected values without application axes', () => {
    const output = createTheme({ preset: 'forest', density: 'compact', radius: 'sharp', font: 'serif' });
    expect(output).not.toContain('\naxes\n');
    expect(output).not.toContain('\n    when ');
    expect(output).toContain('ui.foundation-radius: length = 0px');
    expect(output).toContain('ui.radius: length = ui.radius-control');
    expect(output).toContain('ui.foundation-space-unit: length = 0.75px');
    expect(output).toContain('ui.foundation-font-body: family = ui.font-serif');
    expect(output).toContain('ui.foundation-font-serif: family = "Newsreader", serif');
    expect(output).toContain('AccentColor = ui.primary');
  });

  test('runtime export keeps the platform accent independent from app axes', () => {
    const output = createTheme({ preset: 'forest', interactive: true });
    expect(output).toContain('ui-preset = forest | neutral | indigo | rose | amber | violet');
    expect(output).toContain('when ui-preset=neutral:');
    expect(output).toContain('AccentColor = light-dark(#3f6212, #bef264)');
  });

  test('all six presets export complete choices within the 64-combination Exact limit', () => {
    const combinations = (Object.keys(themeAxes) as (keyof typeof themeAxes)[]).reduce((count, key) => count * themeOptions[key].length, 1);
    expect(combinations).toBe(36);
    expect(combinations).toBeLessThanOrEqual(64);
    expect(validateTokens(themeTokens)).toEqual([]);
    for (const preset of themeOptions.preset) {
      expect(normalizeTheme({ preset }).preset).toBe(preset);
      const output = createTheme({ preset, interactive: true });
      expect(output).toContain(`${themeAxes.preset} = ${[preset, ...themeOptions.preset.filter(value => value !== preset)].join(' | ')}`);
      const staticOutput = createTheme({ preset });
      expect(staticOutput).not.toContain('\naxes\n');
      expect(staticOutput).not.toContain('\n    when ');
    }
  });

  test('invalid imported preferences fall back before creating a mode value', () => {
    const settings = normalizeTheme({ preset: 'unexpected' as never, density: 'compact' });
    expect(settings.preset).toBe('neutral');
    expect(themeMode(settings)).toBe('ui-preset=neutral ui-density=compact ui-radius=default');
  });

  test('three font choices remain static families outside the design axes', () => {
    expect(themeOptions.font).toEqual(['sans', 'serif', 'mono']);
    expect(themeAxes).not.toHaveProperty('font');
    for (const font of themeOptions.font) {
      expect(normalizeTheme({ font }).font).toBe(font);
      const output = createTheme({ font, interactive: true });
      expect(output).not.toContain('ui-font');
      expect(output).toContain(`ui.foundation-font-body: family = ui.font-${font}`);
      expect(output).toContain('provide uiFont = "theme"');
      expect(themeMode({ font })).toBe(themeMode());
    }
  });

  test('font declaration includes a real italic face and rejects injected declarations', () => {
    expect(createFontDeclaration()).toContain('100 900 italic = "assets/fonts/Geist-Italic.ttf"');
    expect(createFontDeclaration()).toContain('font "Newsreader"\n  200 800 = "assets/fonts/Newsreader.ttf"\n  200 800 italic = "assets/fonts/Newsreader-Italic.ttf"');
    expect(createTheme({ serifFontPath: 'type/Reading.ttf', serifItalicFontPath: 'type/Reading-Italic.ttf' })).toContain('200 800 italic = "type/Reading-Italic.ttf"');
    expect(createFontDeclaration('a.ttf', 'b.ttf', 'c.ttf', 'd.ttf')).toContain('200 800 italic = "d.ttf"');
    expect(() => createFontDeclaration('bad"\ncomponent App')).toThrow();
    expect(() => createTheme({ italicFontPath: 'bad"\n' })).toThrow();
    expect(() => createTheme({ serifFontPath: 'bad"\n' })).toThrow();
    expect(() => createFontDeclaration('a.ttf', 'b.ttf', 'c.ttf', 'bad"\n')).toThrow();
  });
});
