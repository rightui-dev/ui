/** RightUI theme source. No browser or Node API is required by this module. */
export const themeOptions = {
  preset: ['neutral', 'indigo', 'forest', 'rose', 'amber', 'violet'],
  density: ['comfortable', 'compact'],
  radius: ['default', 'sharp', 'round'],
  font: ['sans', 'serif', 'mono'],
} as const;
export type ThemeSettings = { -readonly [Key in keyof typeof themeOptions]: (typeof themeOptions)[Key][number] };
export const defaultTheme: ThemeSettings = { preset: 'neutral', density: 'comfortable', radius: 'default', font: 'sans' };
export const themeAxes = { preset: 'ui-preset', density: 'ui-density', radius: 'ui-radius' } as const;
export type ThemeAxis = keyof typeof themeAxes;
export const themeLayout = { heroTitle: { small: '2rem', medium: '2.5rem', large: '3rem' }, heroDescription: { small: '1rem', medium: '1.125rem' }, breakpoints: { medium: 768, large: 1200, buildFlow: 1280, compactBrand: 359 } } as const;
type Kind = 'color' | 'length' | 'number' | 'box-shadow' | 'duration' | 'easing' | 'family';
export type ThemeToken = { name: string; kind: Kind; value: string; axis?: ThemeAxis; variants?: Record<string, string> };
const neutral = {
  "ui.background": "light-dark(#ffffff, #0a0a0a)",
  "ui.foreground": "light-dark(#000000, #fafafa)",
  "ui.surface": "light-dark(#ffffff, #171717)",
  "ui.muted": "light-dark(#f5f5f5, #262626)",
  "ui.muted-foreground": "light-dark(#737373, #a3a3a3)",
  "ui.border": "light-dark(#e5e5e5, #ffffff1a)",
  "ui.primary": "light-dark(#000000, #e5e5e5)",
  "ui.primary-foreground": "light-dark(#fafafa, #171717)",
  "ui.danger": "light-dark(#e7000b, #ff6467)",
  "ui.success": "light-dark(#15803d, #4ade80)",
  "ui.overlay": "#00000080 scheme=fixed",
  "ui.ring": "light-dark(#a3a3a380, #73737380)",
  "ui.focus": "light-dark(#a3a3a3, #737373)",
  "ui.wheel-cursor": "#ffffff scheme=fixed",
  "ui.wheel-outline": "#000000 scheme=fixed",
  "ui.sidebar": "light-dark(#fafafa, #171717)",
  "ui.input": "light-dark(#e5e5e5, #ffffff26)",
  "ui.shadow": "light-dark(#0000000d, #00000026)",
  "ui.metric-shade": "light-dark(#f0f0f0, #171717)",
  "ui.on-danger": "#ffffff scheme=fixed",
  "ui.destructive": "light-dark(#e7000b, #ff646799)",
  "ui.tab-active": "light-dark(#ffffff, rgb(255 255 255 / 4.5%))",
  "ui.tab-active-border": "light-dark(transparent, #ffffff26)",
  "ui.shadow-sm": "#0000001a scheme=fixed",
  "ui.primary-hover": "light-dark(#000000e6, #e5e5e5e6)",
  "ui.secondary-hover": "light-dark(#f5f5f5cc, #262626cc)",
  "ui.outline": "light-dark(#ffffff, #ffffff0b)",
  "ui.outline-hover": "light-dark(#f5f5f5, #ffffff13)",
  "ui.ghost-hover": "light-dark(#f5f5f5, #26262680)",
  "ui.destructive-hover": "light-dark(#e7000be6, #ff64678a)",
  "ui.tab-inactive": "light-dark(#00000099, #a1a1a1)",
  "ui.chart-grid": "light-dark(#e5e5e580, #ffffff0d)",
  "ui.tab-count": "light-dark(#7373734d, #a1a1a14d)",
  "ui.sidebar-label": "light-dark(#000000b3, #fafafab3)",
  "ui.trace-shimmer": "light-dark(#d4d4d4, #fafafa)",
  "ui.code-foreground": "light-dark(#24292e, #e1e4e8)",
  "ui.code-keyword": "light-dark(#d73a49, #f97583)",
  "ui.code-string": "light-dark(#032f62, #9ecbff)",
  "ui.code-function": "light-dark(#6f42c1, #b392f0)",
  "ui.code-number": "light-dark(#005cc5, #79b8ff)",
  "ui.code-comment": "light-dark(#6a737d, #959da5)",
  "ui.code-type": "light-dark(#22863a, #85e89d)",
  "ui.code-property": "light-dark(#005cc5, #79b8ff)",
  "ui.code-highlight": "light-dark(#0969da0d, #388bfd26)",
  "ui.code-added-background": "light-dark(#dafbe1, #2ea04326)",
  "ui.code-removed-background": "light-dark(#ffebe9, #f8514926)",
  "ui.code-destructive-background": "light-dark(#fff1f0, #f851491a)"
} as Record<string, string>;
const presets: Record<ThemeSettings['preset'], Record<string, string>> = {
  neutral: {},
  indigo: {
    'ui.background': 'light-dark(#f8fafc, #090e1a)', 'ui.foreground': 'light-dark(#111827, #eef2ff)',
    'ui.surface': 'light-dark(#ffffff, #131c30)', 'ui.muted': 'light-dark(#e8eefc, #1e2a43)',
    'ui.muted-foreground': 'light-dark(#52627b, #a5b4d2)', 'ui.border': 'light-dark(#cbd5e8, #33415f)',
    'ui.primary': 'light-dark(#4338ca, #a5b4fc)', 'ui.primary-foreground': 'light-dark(#ffffff, #14183c)',
    'ui.ring': 'light-dark(#6366f180, #a5b4fc80)', 'ui.focus': 'light-dark(#4f46e5, #a5b4fc)',
    'ui.sidebar': 'light-dark(#eef2ff, #10182a)', 'ui.input': 'light-dark(#b8c5e0, #3b4a6a)',
    'ui.metric-shade': 'light-dark(#e8eefc, #131c30)',
  },
  forest: {
    'ui.background': 'light-dark(#f6f7f0, #10170f)', 'ui.foreground': 'light-dark(#1d2b18, #edf4e7)',
    'ui.surface': 'light-dark(#fdfef8, #1a2518)', 'ui.muted': 'light-dark(#e7ecd9, #293625)',
    'ui.muted-foreground': 'light-dark(#5b6850, #afbea2)', 'ui.border': 'light-dark(#c8d1b8, #405039)',
    'ui.primary': 'light-dark(#3f6212, #bef264)', 'ui.primary-foreground': 'light-dark(#ffffff, #20300c)',
    'ui.ring': 'light-dark(#65a30d80, #bef26480)', 'ui.focus': 'light-dark(#4d7c0f, #bef264)',
    'ui.sidebar': 'light-dark(#eef1e4, #162013)', 'ui.input': 'light-dark(#bdc9ab, #4a5a42)',
    'ui.metric-shade': 'light-dark(#e7ecd9, #1a2518)',
  },
  rose: {
    'ui.background': 'light-dark(#fff8fa, #190b10)', 'ui.foreground': 'light-dark(#381320, #ffe4ec)',
    'ui.surface': 'light-dark(#fffdfd, #29131c)', 'ui.muted': 'light-dark(#fce7ef, #3c1c2b)',
    'ui.muted-foreground': 'light-dark(#875064, #d9a5b7)', 'ui.border': 'light-dark(#e9bfce, #683448)',
    'ui.primary': 'light-dark(#be123c, #fda4af)', 'ui.primary-foreground': 'light-dark(#ffffff, #4c0519)',
    'ui.ring': 'light-dark(#e11d4880, #fda4af80)', 'ui.focus': 'light-dark(#be123c, #fda4af)',
    'ui.sidebar': 'light-dark(#fff0f5, #221017)', 'ui.input': 'light-dark(#d9a4b7, #794059)',
    'ui.metric-shade': 'light-dark(#fce7ef, #29131c)',
    'ui.tab-active': 'light-dark(#fffdfd, #4a2434)', 'ui.tab-active-border': 'light-dark(transparent, #683448)',
    'ui.tab-inactive': 'light-dark(#875064, #d9a5b7)', 'ui.outline': 'light-dark(#fffdfd, #29131c)',
    'ui.outline-hover': 'light-dark(#fce7ef, #3c1c2b)', 'ui.trace-shimmer': 'light-dark(#d78aa5, #ffe4ec)',
    'ui.code-foreground': 'light-dark(#381320, #ffe4ec)', 'ui.code-comment': 'light-dark(#875064, #d9a5b7)',
  },
  amber: {
    'ui.background': 'light-dark(#fffbf2, #1b1208)', 'ui.foreground': 'light-dark(#3b260b, #fff1d6)',
    'ui.surface': 'light-dark(#fffef9, #2b1d0e)', 'ui.muted': 'light-dark(#f9ecd0, #3c2a13)',
    'ui.muted-foreground': 'light-dark(#79603a, #d4ba8e)', 'ui.border': 'light-dark(#e7cda0, #6b4c26)',
    'ui.primary': 'light-dark(#92400e, #fcd34d)', 'ui.primary-foreground': 'light-dark(#ffffff, #451a03)',
    'ui.ring': 'light-dark(#d9770680, #fcd34d80)', 'ui.focus': 'light-dark(#b45309, #fcd34d)',
    'ui.sidebar': 'light-dark(#fff5e0, #24190c)', 'ui.input': 'light-dark(#d7b47c, #7d5a2e)',
    'ui.metric-shade': 'light-dark(#f9ecd0, #2b1d0e)',
    'ui.tab-active': 'light-dark(#fffef9, #4c3519)', 'ui.tab-active-border': 'light-dark(transparent, #6b4c26)',
    'ui.tab-inactive': 'light-dark(#79603a, #d4ba8e)', 'ui.outline': 'light-dark(#fffef9, #2b1d0e)',
    'ui.outline-hover': 'light-dark(#f9ecd0, #3c2a13)', 'ui.trace-shimmer': 'light-dark(#d5ad63, #fff1d6)',
    'ui.code-foreground': 'light-dark(#3b260b, #fff1d6)', 'ui.code-comment': 'light-dark(#79603a, #d4ba8e)',
  },
  violet: {
    'ui.background': 'light-dark(#faf5ff, #160b24)', 'ui.foreground': 'light-dark(#2e1065, #faf5ff)',
    'ui.surface': 'light-dark(#fefaff, #21112f)', 'ui.muted': 'light-dark(#f3e8ff, #301647)',
    'ui.muted-foreground': 'light-dark(#6b21a8, #d8b4fe)', 'ui.border': 'light-dark(#d8b4fe, #583570)',
    'ui.primary': 'light-dark(#7e22ce, #c084fc)', 'ui.primary-foreground': 'light-dark(#ffffff, #21112f)',
    'ui.ring': 'light-dark(#9333ea80, #c084fc80)', 'ui.focus': 'light-dark(#7e22ce, #c084fc)',
    'ui.sidebar': 'light-dark(#f3e8ff, #1c0f2b)', 'ui.input': 'light-dark(#c99bec, #6b3f85)',
    'ui.metric-shade': 'light-dark(#f3e8ff, #21112f)',
    'ui.tab-active': 'light-dark(#fefaff, #40205a)', 'ui.tab-active-border': 'light-dark(transparent, #583570)',
    'ui.tab-inactive': 'light-dark(#6b21a8, #d8b4fe)', 'ui.outline': 'light-dark(#fefaff, #21112f)',
    'ui.outline-hover': 'light-dark(#f3e8ff, #301647)', 'ui.trace-shimmer': 'light-dark(#c084fc, #faf5ff)',
    'ui.code-foreground': 'light-dark(#2e1065, #faf5ff)', 'ui.code-comment': 'light-dark(#6b21a8, #d8b4fe)',
  },
};
const tokens: ThemeToken[] = [];
function token(name: string, kind: Kind, value: string, axis?: ThemeAxis, variants?: Record<string, string>) { tokens.push({ name: `ui.${name}`, kind, value, ...(axis ? { axis, variants } : {}) }); }
// Foundations hold literal decisions. Public role tokens below are aliases.
for (const [name, value] of Object.entries(neutral)) {
  const short = name.slice(3);
  token(`palette-${short}`, 'color', value, 'preset', Object.fromEntries(themeOptions.preset.map(preset => [preset, presets[preset][name] ?? value])));
  token(short, 'color', `ui.palette-${short}`);
}
const role = (name: string, value: string) => { const found = tokens.find(t => t.name === `ui.${name}`); if (found) found.value = value; };
role('primary-hover', 'color-mix(in srgb, ui.primary 90%, transparent)');
role('secondary-hover', 'color-mix(in srgb, ui.muted 80%, transparent)');
role('outline-hover', 'light-dark(ui.muted, ui.palette-outline-hover)');
role('ghost-hover', 'light-dark(ui.muted, color-mix(in srgb, ui.muted 50.19607843137255%, transparent))');
role('destructive-hover', 'color-mix(in srgb, ui.destructive 90%, transparent)');
role('chart-grid', 'color-mix(in srgb, ui.border 50%, transparent)');
role('sidebar-label', 'color-mix(in srgb, ui.foreground 70%, transparent)');
role('tab-count', 'color-mix(in srgb, ui.muted-foreground 30%, transparent)');
const chartPalettes: Record<ThemeSettings['preset'], readonly [string, string, string, string, string]> = {
  neutral: ['light-dark(#2563eb, #60a5fa)', 'light-dark(#0ea5e9, #38bdf8)', 'light-dark(#7c3aed, #c4b5fd)', 'light-dark(#ea580c, #fdba74)', 'light-dark(#16a34a, #86efac)'],
  indigo: ['light-dark(#4f46e5, #a5b4fc)', 'light-dark(#7c3aed, #c4b5fd)', 'light-dark(#0284c7, #7dd3fc)', 'light-dark(#db2777, #f9a8d4)', 'light-dark(#0f766e, #5eead4)'],
  forest: ['light-dark(#4d7c0f, #bef264)', 'light-dark(#16a34a, #86efac)', 'light-dark(#ca8a04, #fde047)', 'light-dark(#0d9488, #5eead4)', 'light-dark(#c2410c, #fdba74)'],
  rose: ['light-dark(#be123c, #fda4af)', 'light-dark(#db2777, #f9a8d4)', 'light-dark(#9333ea, #d8b4fe)', 'light-dark(#ea580c, #fdba74)', 'light-dark(#0f766e, #5eead4)'],
  amber: ['light-dark(#b45309, #fcd34d)', 'light-dark(#a16207, #fde68a)', 'light-dark(#c2410c, #fdba74)', 'light-dark(#4d7c0f, #bef264)', 'light-dark(#0e7490, #67e8f9)'],
  violet: ['light-dark(#7e22ce, #c084fc)', 'light-dark(#a21caf, #f0abfc)', 'light-dark(#4f46e5, #a5b4fc)', 'light-dark(#be185d, #f9a8d4)', 'light-dark(#0369a1, #7dd3fc)'],
};
for (const [index, value] of chartPalettes.neutral.entries()) {
  token(`palette-chart-${index + 1}`, 'color', value, 'preset', Object.fromEntries(themeOptions.preset.map(preset => [preset, chartPalettes[preset][index]])));
  token(`chart-${index + 1}`, 'color', `ui.palette-chart-${index + 1}`);
}
for (const [name,value] of Object.entries({muted:'0.12',soft:'0.25',strong:'0.8'})) token(`chart-opacity-${name}`, 'number', value);
token('foundation-space-unit', 'length', '1px', 'density', {comfortable:'1px',compact:'0.75px'});
for (const n of [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,16,18,19,20,22,24,26,28,30,32,34,36,40,44,48,56,60,64,80,96]) token(`space-${n}`, 'length', `calc(ui.foundation-space-unit * ${n})`);
token('foundation-radius', 'length', '10px', 'radius', {default:'10px',sharp:'0px',round:'16px'});
for (const [name,scale] of Object.entries({'sm':0.6,'md':0.8,'lg':1,'xl':1.4,'2xl':1.8,'3xl':2.2,'4xl':2.6,'checkbox':0.4,'detail':0.2,'inline':0.4})) token(`radius-${name}`, 'length', `calc(ui.foundation-radius * ${scale})`);
for (const [name,target] of Object.entries({'control':'lg','item':'md','menu':'lg','popover':'lg','panel':'xl'})) token(`radius-${name}`, 'length', `ui.radius-${target}`);
token('radius', 'length', 'ui.radius-control'); token('panel-radius', 'length', 'ui.radius-panel');
token('radius-full', 'length', '9999px'); token('radius-none', 'length', '0px'); token('radius-flat', 'length', 'ui.radius-none');
for (const [name,scale] of Object.entries({'control':1.8,'item':1.4,'menu':1.8,'popover':2.2,'panel':2.4,'bubble':2.2,'checkbox':0.5})) token(`ai-radius-${name}`, 'length', `calc(ui.foundation-radius * ${scale})`);
for (const [name, value] of Object.entries({sans:'"Geist", system-ui, sans-serif',serif:'"Newsreader", serif',mono:'monospace'})) {
  token(`foundation-font-${name}`, 'family', value);
  token(`font-${name}`, 'family', `ui.foundation-font-${name}`);
}
token('foundation-font-body', 'family', 'ui.font-sans');
token('font-body', 'family', 'ui.foundation-font-body'); token('font-code','family','ui.foundation-font-code'); token('foundation-font-code','family','monospace');
for (const [name,value] of Object.entries({xs:'0.75rem',sm:'0.875rem',base:'1rem',lg:'1.125rem',xl:'1.25rem','2xl':'1.5rem','3xl':'1.875rem','4xl':'2.25rem'})) { token(`foundation-text-${name}`, 'length', value); token(`text-${name}`, 'length', `ui.foundation-text-${name}`); }
token('type','length','ui.text-sm');
for (const [name,value] of Object.entries({regular:'400',medium:'500',semibold:'600',bold:'700'})) token(`weight-${name}`,'number',value);
for (const [name,value] of Object.entries({tight:'1.2',normal:'1.5',relaxed:'1.75',control:'1.428571',code:'1.625'})) token(`leading-${name}`,'number',value);
for (const [name,values] of Object.entries({xs:[24,20],sm:[32,28],default:[36,32],lg:[40,36]})) { token(`foundation-control-${name}`,'length',`${values[0]}px`,'density',{comfortable:`${values[0]}px`,compact:`${values[1]}px`});token(`control-${name}`,'length',`ui.foundation-control-${name}`); }
token('control','length','ui.control-default');
for (const [name,target] of Object.entries({xs:'xs',sm:'xs',default:'sm',lg:'default'})) token(`ai-control-${name}`,'length',`ui.control-${target}`);
// Keep the original comfortable AI small control at 28px.
tokens.find(t=>t.name==='ui.ai-control-sm')!.value='calc(ui.control-sm - 4px)';
token('foundation-border-width','length','1px'); token('border-width','length','ui.foundation-border-width'); token('border-input-width','length','ui.border-width'); token('border-strong-width','length','calc(ui.border-width * 2)');
token('foundation-focus-width','length','3px');token('focus-width','length','ui.foundation-focus-width');
token('foundation-icon-stroke','length','1.75px');token('icon-stroke','length','ui.foundation-icon-stroke');token('stroke-width','length','ui.icon-stroke');token('stroke-strong','length','calc(ui.icon-stroke * 1.7142857142857142)'); token('stroke-standard','length','calc(ui.icon-stroke * 1.1428571428571428)');
token('opacity-disabled','number','0.5');
for (const [name,value] of Object.entries({fast:'150ms',normal:'200ms',slow:'300ms'})) token(`duration-${name}`,'duration',value);
token('easing','easing','ease');
token('shadow-control','box-shadow','0 1px 2px 0 ui.shadow');token('shadow-panel','box-shadow','0 1px 3px 0 ui.shadow');token('shadow-menu','box-shadow','0 4px 12px 0 ui.shadow');token('shadow-focus','box-shadow','0 0 0 ui.focus-width ui.ring');
token('card-inset','length','ui.space-24');token('card-gap','length','ui.space-24');token('control-gap','length','ui.space-8');
token('hero-title-small','length',themeLayout.heroTitle.small);token('hero-title-medium','length',themeLayout.heroTitle.medium);token('hero-title-large','length',themeLayout.heroTitle.large);
token('hero-description-small','length',themeLayout.heroDescription.small);token('hero-description-medium','length',themeLayout.heroDescription.medium);
for (const n of [4,5,6,7,8,10,16,32,64]) token(`space-negative-${n}`,'length',`calc(ui.space-${n} * -1)`);
token('space-menu-inset','length','calc(ui.foundation-space-unit * 7.25)');
for (const [name,value] of Object.entries({caption:'0.8125rem',tiny:'0.8rem',display:'3rem','hero-sm':'2rem','6xl':'3.75rem'})) token(`text-${name}`,'length',value);
token('weight-heavy','number','800');
for (const [name,value] of Object.entries({solid:'1',none:'1',snug:'1.4',heading:'1.333333',compact:'1.375',label:'1.375'})) token(`leading-${name}`,'number',value);
for (const [name,value] of Object.entries({thin:'1',medium:'1.5',detail:'1.75'})) token(`stroke-${name}`,'length',`calc(ui.icon-stroke * ${Number(value) / 1.75})`);
token('icon-stroke-soft','length','calc(ui.icon-stroke * 0.9714285714285714)'); token('chart-ring-width','length','24px');
token('touch-target','length','44px'); token('radius-xs','length','calc(ui.foundation-radius * 0.3)');token('radius-card','length','calc(ui.foundation-radius * 1.2)');
token('tracking-display','length','-0.04em');token('tracking-heading','length','-0.025em');token('opacity-muted','number','0.5');token('opacity-soft','number','0.7');
token('shadow-focus-inset','box-shadow','inset 0 0 0 ui.focus-width ui.ring');token('shadow-focus-strong','box-shadow','0 0 0 calc(ui.focus-width + 1px) ui.ring');token('shadow-background-ring','box-shadow','0 0 0 ui.border-strong-width ui.background');token('shadow-border','box-shadow','0 0 0 ui.border-width ui.border');token('shadow-preview','box-shadow','0 20px 40px 0 ui.shadow');
token('duration-spin','duration','1s');token('easing-linear','easing','linear');
token('media-paper','color','#ffffff scheme=fixed');token('media-ink','color','#000000 scheme=fixed');
for (const [name,target] of Object.entries({'hero-title-sm':'hero-title-small','hero-title-md':'hero-title-medium','hero-title-lg':'hero-title-large','hero-description-sm':'hero-description-small','hero-description-md':'hero-description-medium'})) token(name,'length',`ui.${target}`);
token('leading-metric','number','ui.leading-tight');
for (const [name,value] of Object.entries({'sidebar-width':'16rem','sidebar-width-compact':'3rem','sidebar-width-mail':'21.875rem','sidebar-width-floating':'19rem','sidebar-width-wide':'18rem','sidebar-width-dashboard':'288px'})) token(name,'length',value);
for (const [name,value] of Object.entries({'2xs':'0.6875rem',md:'0.9375rem'})) token(`text-${name}`,'length',value);
for (const [name,value] of Object.entries({copy:'1.6',detail:'1.65',prompt:'1.7',hero:'1.55',display:'1.1'})) token(`leading-${name}`,'number',value);
for (const [name,value] of Object.entries({hero:'-0.05em',label:'0.04em',wide:'0.1em'})) token(`tracking-${name}`,'length',value);
for (const [name,value] of Object.entries({subtle:'0.4',faint:'0.2',quiet:'0.6'})) token(`opacity-${name}`,'number',value);
token('duration-enter','duration','500ms');token('duration-shimmer','duration','2s');
token('duration-availability','duration','1800ms');
token('radius-feature','length','calc(ui.foundation-radius * 2.4)');
token('feature-card-inset','length','ui.space-20');token('feature-card-gap','length','ui.space-24');
token('inset-card-inset','length','ui.space-16');token('inset-card-gap','length','ui.space-12');
for (const index of [1,2,3]) {
  token(`chart-${index}-gradient-start`, 'color', `color-mix(in srgb, ui.chart-${index} 80%, transparent)`);
  token(`chart-${index}-gradient-end`, 'color', `color-mix(in srgb, ui.chart-${index} 10%, transparent)`);
}
token('chart-opacity-bar','number','0.45');token('chart-opacity-area','number','0.4');
token('chart-primary-gradient-start','color','color-mix(in srgb, ui.primary 80%, transparent)');
token('chart-primary-gradient-end','color','color-mix(in srgb, ui.primary 10%, transparent)');
token('duration-tooltip-delay','duration','700ms');token('duration-instant','duration','1ms');
// Switch geometry uses complete length aliases so dynamic style branches remain typed.
token('switch-track-width','length','ui.space-32');
token('switch-track-height','length','ui.space-18');
token('switch-thumb-size','length','ui.space-16');
token('switch-inset','length','ui.space-1');
token('switch-thumb-on','length','calc(ui.switch-track-width - ui.switch-inset - ui.switch-thumb-size)');
token('tabs-height-horizontal-compact','length','calc(ui.space-32 - ui.space-6 - ui.border-width)');
token('tabs-height-horizontal-default','length','calc(ui.space-36 - ui.space-6 - ui.border-width)');
token('tabs-height-vertical-compact','length','calc(ui.space-24 + ui.border-width * 2)');
token('tabs-height-vertical-default','length','calc(ui.space-28 + ui.border-width * 2)');
// Avatar geometry and surfaces share the foundation scale and semantic roles.
for (const [name, value] of Object.entries({
  'avatar-sm': 'ui.space-24', 'avatar-size': 'ui.space-32', 'avatar-lg': 'ui.space-40',
  'avatar-radius': 'ui.radius-full', 'avatar-border-width': 'ui.border-width',
  'avatar-badge-sm': 'ui.space-8', 'avatar-badge-size': 'ui.space-10', 'avatar-badge-lg': 'ui.space-12',
  'avatar-overlap': 'ui.space-negative-8', 'avatar-menu-width': 'calc(ui.space-64 * 2)',
})) token(name, 'length', value);
token('avatar-border', 'color', 'ui.border');
token('avatar-background', 'color', 'ui.muted');
token('avatar-foreground', 'color', 'ui.muted-foreground');
token('avatar-ring', 'box-shadow', 'ui.shadow-background-ring');
export const themeTokens: readonly ThemeToken[] = tokens;
export function normalizeTheme(input: Partial<ThemeSettings> = {}): ThemeSettings {
  const result = {...defaultTheme};
  for (const key of Object.keys(themeOptions) as (keyof ThemeSettings)[]) if ((themeOptions[key] as readonly string[]).includes(input[key] ?? '')) (result as Record<string,string>)[key] = input[key]!;
  return result;
}
export function themeMode(input: Partial<ThemeSettings> = {}): string { const value=normalizeTheme(input);return (Object.keys(themeAxes) as ThemeAxis[]).map(key=>`${themeAxes[key]}=${value[key]}`).join(' '); }
function declarations(settings: ThemeSettings, interactive: boolean): string {
  return tokens.map(token => {
    const value = token.name === 'ui.foundation-font-body' ? `ui.font-${settings.font}` : token.axis ? token.variants?.[settings[token.axis]] ?? token.value : token.value;
    const whens = interactive && token.axis ? Object.entries(token.variants ?? {}).filter(([choice,next])=>choice!==settings[token.axis!] && next!==value).map(([choice,next])=>`    when ${themeAxes[token.axis!]}=${choice}: ${next}`).join('\n') : '';
    return `  ${token.name}: ${token.kind} = ${value}`+(whens ? '\n'+whens : '');
  }).join('\n');
}
/** Autonomous package tokens: package designs cannot declare axes in this Exact pin. */
export function createPackageTheme(): string { return '// Generated by tools/generate-theme.ts from packages/ui/theme.ts.\ntamber ui\ntheme\n'+declarations(defaultTheme,false)+'\n'; }
/** Paste into app.tamber. Exact replaces an overridden token including all its branches. */
export function createTheme(options: Partial<ThemeSettings> & {interactive?: boolean; fontPath?: string; italicFontPath?: string; serifFontPath?: string; serifItalicFontPath?: string; includeFont?: boolean} = {}): string {
  const settings=normalizeTheme(options);const interactive=options.interactive ?? false;
  const axes=interactive ? '\naxes\n'+(Object.keys(themeAxes) as ThemeAxis[]).map(key=>`  ${themeAxes[key]} = ${[settings[key],...themeOptions[key].filter(v=>v!==settings[key])].join(' | ')}`).join('\n')+'\n' : '';
  const fontPath=options.fontPath ?? 'assets/fonts/Geist.ttf';
  const italicFontPath=options.italicFontPath ?? 'assets/fonts/Geist-Italic.ttf';
  const serifFontPath=options.serifFontPath ?? 'assets/fonts/Newsreader.ttf';
  const serifItalicFontPath=options.serifItalicFontPath ?? 'assets/fonts/Newsreader-Italic.ttf';
  const declaration=createFontDeclaration(fontPath,italicFontPath,serifFontPath,serifItalicFontPath);
  const font=options.includeFont===false ? '' : '// In app.contract declare:\n'+declaration.trimEnd().split('\n').map(line=>line ? '// '+line : '//').join('\n')+'\n';
  const accent = interactive ? (presets[settings.preset]?.['ui.primary'] ?? neutral['ui.primary']) : 'ui.primary';
  return '// RightUI theme. Copy the bundled Geist and Newsreader fonts and their licenses from @rightui/ui/assets/fonts.\n// Light/dark/system is controlled separately by setScheme().\n// In App, provide uiFont = "theme" to use this configuration\'s body family.\ntamber app\n'+axes+'\ntheme\n  AccentColor = '+accent+'\n'+declarations(settings,interactive)+'\n'+font;
}

export function createFontDeclaration(fontPath='assets/fonts/Geist.ttf', italicFontPath='assets/fonts/Geist-Italic.ttf', serifFontPath='assets/fonts/Newsreader.ttf', serifItalicFontPath='assets/fonts/Newsreader-Italic.ttf'): string {
  if (/["\r\n]/.test(fontPath+italicFontPath+serifFontPath+serifItalicFontPath)) throw Error('Invalid font path');
  return `font "Geist"\n  100 900 = "${fontPath}"\n  100 900 italic = "${italicFontPath}"\n\nfont "Newsreader"\n  200 800 = "${serifFontPath}"\n  200 800 italic = "${serifItalicFontPath}"\n`;
}
