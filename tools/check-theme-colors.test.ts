import { describe, expect, test } from 'bun:test';
import { themeTokens, type ThemeSettings } from '../packages/ui/theme';

type RGB = [number, number, number];
const tokens = new Map(themeTokens.map(token => [token.name, token]));

function color(name: string, preset: ThemeSettings['preset'], scheme: 'light' | 'dark'): RGB {
  const token = tokens.get(name);
  if (!token) throw new Error(`Missing color token ${name}`);
  const value = token.axis === 'preset' ? token.variants![preset] : token.value;
  if (tokens.has(value)) return color(value, preset, scheme);
  const pair = /^light-dark\((#[\da-f]{6}), (#[\da-f]{6})\)$/i.exec(value);
  if (!pair) throw new Error(`Contrast check needs an opaque light/dark pair: ${name} = ${value}`);
  const hex = pair[scheme === 'light' ? 1 : 2];
  return [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16) / 255) as RGB;
}

function luminance(rgb: RGB): number {
  const linear = rgb.map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

function contrast(a: RGB, b: RGB): number {
  const [low, high] = [luminance(a), luminance(b)].sort((a, b) => a - b);
  return (high + 0.05) / (low + 0.05);
}

for (const preset of ['rose', 'amber', 'violet'] as const) for (const scheme of ['light', 'dark'] as const) {
  describe(`${preset} ${scheme}`, () => {
    test('main and muted text reach 4.5:1 on the authored reading surfaces', () => {
      for (const background of ['background', 'surface', 'muted', 'sidebar', 'metric-shade', 'outline', 'tab-active']) {
        const backdrop = color(`ui.${background}`, preset, scheme);
        for (const foreground of ['foreground', 'muted-foreground']) {
          expect(contrast(color(`ui.${foreground}`, preset, scheme), backdrop)).toBeGreaterThanOrEqual(4.5);
        }
      }
    });

    test('primary button text reaches 4.5:1 in resting and hover states', () => {
      const foreground = color('ui.primary-foreground', preset, scheme);
      const primary = color('ui.primary', preset, scheme);
      expect(contrast(foreground, primary)).toBeGreaterThanOrEqual(4.5);
      // Evaluate the shared primary-hover recipe's alpha blend on each surface.
      expect(tokens.get('ui.primary-hover')!.value).toBe('color-mix(in srgb, ui.primary 90%, transparent)');
      for (const background of ['background', 'surface', 'muted', 'sidebar']) {
        const backdrop = color(`ui.${background}`, preset, scheme);
        const hover = primary.map((value, index) => value * 0.9 + backdrop[index] * 0.1) as RGB;
        expect(contrast(foreground, hover)).toBeGreaterThanOrEqual(4.5);
      }
    });

    test('focus and opaque chart colors remain distinct from page and card backgrounds', () => {
      for (const background of ['background', 'surface']) {
        const backdrop = color(`ui.${background}`, preset, scheme);
        expect(contrast(color('ui.focus', preset, scheme), backdrop)).toBeGreaterThanOrEqual(3);
        for (let series = 1; series <= 5; series++) expect(contrast(color(`ui.chart-${series}`, preset, scheme), backdrop)).toBeGreaterThanOrEqual(3);
      }
    });
  });
}
