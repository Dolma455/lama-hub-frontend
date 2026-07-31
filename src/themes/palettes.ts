export interface PaletteDef {
  id: string;
  name: string;
  /** 4 representative hex colors shown as swatches in the picker */
  swatches: [string, string, string, string];
  isDark: boolean;
  vars: Record<string, string>;
}

// ─── Helper: build rgba from hex ──────────────────────────────
function rgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ─── Palette factory helpers ───────────────────────────────────
function darkPalette(
  id: string,
  name: string,
  bgBase: string,        // bg-primary (deep charcoal/dark neutral with micro tint)
  bgCard: string,        // bg-card (subtle dark container)
  bgSidebar: string,     // bg-sidebar
  accent: string,        // primary accent
  accentSecondary: string, // secondary mixed accent color
  textPrimary: string,   // --text-primary
  textSecondary: string, // --text-secondary
  textMuted: string,     // --text-muted
  swatches: [string, string, string, string],
  textOnAccent = '#ffffff',
): PaletteDef {
  return {
    id, name, swatches, isDark: true,
    vars: {
      '--bg-primary': bgBase,
      '--bg-secondary': bgCard,
      '--bg-card': bgCard,
      '--bg-sidebar': bgSidebar,
      // Reduced opacity for dim, subtle, non-distracting containers
      '--bg-input': rgba(accent, 0.04),
      '--bg-hover': rgba(accent, 0.08),
      '--border-color': rgba(accent, 0.12),
      '--border-subtle': rgba(accentSecondary, 0.08), // mixed secondary color in borders!
      '--text-primary': textPrimary,
      '--text-secondary': textSecondary,
      '--text-muted': textMuted,
      '--text-on-accent': textOnAccent,
      '--accent': accent,
      '--accent-dark': accentSecondary,
      '--accent-light': accentSecondary, // multi-color mix
      '--accent-muted': rgba(accent, 0.06),
      '--accent-muted-border': rgba(accentSecondary, 0.16), // mixed secondary accent border!
      '--accent-blush': rgba(accentSecondary, 0.04),
      '--danger': '#f87171',
      '--success': '#4ade80',
      '--watermark-opacity': '0.18',
      '--watermark-color': textSecondary, // Bright pastel tint for elegant dark mode visibility
      '--shadow-card': `0 2px 20px rgba(0, 0, 0, 0.8)`,
      '--shadow-nav': `0 1px 0 rgba(255, 255, 255, 0.05)`,
    },
  };
}

function lightPalette(
  id: string,
  name: string,
  bgBase: string,        // bg-primary (clean soft off-white)
  bgCard: string,        // bg-card
  bgSidebar: string,     // bg-sidebar
  accent: string,        // primary accent
  accentSecondary: string, // secondary mixed accent color
  textPrimary: string,
  textSecondary: string,
  textMuted: string,
  swatches: [string, string, string, string],
  textOnAccent = '#ffffff',
): PaletteDef {
  return {
    id, name, swatches, isDark: false,
    vars: {
      '--bg-primary': bgBase,
      '--bg-secondary': bgSidebar,
      '--bg-card': bgCard,
      '--bg-sidebar': bgSidebar,
      // Dim, low opacity tint for light mode containers
      '--bg-input': rgba(accent, 0.03),
      '--bg-hover': rgba(accent, 0.06),
      '--border-color': rgba(accent, 0.1),
      '--border-subtle': rgba(accentSecondary, 0.06), // mixed secondary color border!
      '--text-primary': textPrimary,
      '--text-secondary': textSecondary,
      '--text-muted': textMuted,
      '--text-on-accent': textOnAccent,
      '--accent': accent,
      '--accent-dark': accentSecondary,
      '--accent-light': accentSecondary, // multi-color mix
      '--accent-muted': rgba(accent, 0.05),
      '--accent-muted-border': rgba(accentSecondary, 0.12), // mixed secondary border tint
      '--accent-blush': rgba(accentSecondary, 0.03),
      '--danger': '#dc2626',
      '--success': '#16a34a',
      '--watermark-opacity': '0.14',
      '--watermark-color': accent, // Crisp accent tint for light mode visibility
      '--shadow-card': `0 1px 10px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.04)`,
      '--shadow-nav': `0 1px 0 rgba(0, 0, 0, 0.05)`,
    },
  };
}

// ─────────────────────────────────────────────────────────────
// PALETTES (Dimmer backgrounds, subtle tint, mixed accent colors)
// ─────────────────────────────────────────────────────────────
export const PALETTES: PaletteDef[] = [

  // ─── DARK THEMES ──────────────────────────────────────────

  // 1. Pure Dark (default)
  darkPalette(
    'dark', 'Pure Dark',
    '#0a0a0f', '#111118', '#0d0d14',
    '#818cf8', '#c084fc', // Indigo + Purple mix
    '#f8fafc', '#c7d2fe', '#94a3b8',
    ['#0a0a0f', '#111118', '#818cf8', '#c084fc'],
    '#ffffff',
  ),

  // 2. Light Pink (Dark) - Dim, subtle dark rose charcoal
  darkPalette(
    'light-pink-dark', 'Blush Pink (Dark)',
    '#0f0b0e', '#161115', '#120d11',
    '#f472b6', '#38bdf8', // Pink + Sky Blue mix
    '#ffffff', '#fbcfe8', '#cbd5e1',
    ['#0f0b0e', '#161115', '#f472b6', '#38bdf8'],
    '#0f0b0e',
  ),

  // 3. Red (Dark) - Dim, dark charcoal with crimson & amber mix
  darkPalette(
    'red-dark', 'Crimson Red (Dark)',
    '#0f0a0a', '#171010', '#120c0c',
    '#f87171', '#fbbf24', // Red + Amber mix
    '#ffffff', '#fca5a5', '#cbd5e1',
    ['#0f0a0a', '#171010', '#f87171', '#fbbf24'],
    '#ffffff',
  ),

  // 4. Yellow (Dark) - Dim charcoal with amber & emerald mix
  darkPalette(
    'yellow-dark', 'Amber Gold (Dark)',
    '#0f0e08', '#17150c', '#12110a',
    '#facc15', '#34d399', // Yellow + Emerald mix
    '#ffffff', '#fde047', '#cbd5e1',
    ['#0f0e08', '#17150c', '#facc15', '#34d399'],
    '#0f0e08',
  ),

  // 5. Purple (Dark) - Dim charcoal with purple & cyan mix
  darkPalette(
    'purple-dark', 'Royal Purple (Dark)',
    '#0c0a12', '#14111c', '#100e17',
    '#c084fc', '#38bdf8', // Purple + Cyan mix
    '#ffffff', '#e9d5ff', '#cbd5e1',
    ['#0c0a12', '#14111c', '#c084fc', '#38bdf8'],
    '#ffffff',
  ),

  // 6. Violet Night — #321E48 #43637E #65DCD5 #D9FFF4
  darkPalette(
    'violet-night', 'Violet Night',
    '#0c0a14', '#14111f', '#100d1a',
    '#65DCD5', '#c084fc', // Teal + Violet mix
    '#ffffff', '#a8f5f0', '#88a4b8',
    ['#321E48', '#43637E', '#65DCD5', '#D9FFF4'],
    '#0a1f1e',
  ),

  // 7. Ocean Warm — #E5CB90 #FFF3C8 #34A99D #458393
  darkPalette(
    'ocean-warm', 'Ocean Warm',
    '#080f12', '#10171b', '#0c1216',
    '#34A99D', '#f59e0b', // Teal + Warm Amber mix
    '#FFF3C8', '#f2db9d', '#8abec9',
    ['#458393', '#34A99D', '#E5CB90', '#FFF3C8'],
    '#051d1a',
  ),

  // 8. Midnight Slate — #0F3040 #464858 #A56F63 #D99B7F
  darkPalette(
    'midnight-slate', 'Midnight Slate',
    '#080e14', '#10161f', '#0c1219',
    '#D99B7F', '#38bdf8', // Terracotta + Slate Cyan mix
    '#ffffff', '#f0bd9e', '#a88982',
    ['#0F3040', '#464858', '#A56F63', '#D99B7F'],
    '#1c0a03',
  ),

  // 9. Urban Contrast — #000000 #233D4D #FE7F2D #EAECF0
  darkPalette(
    'urban-contrast', 'Urban Contrast',
    '#000000', '#101418', '#0c0e12',
    '#FE7F2D', '#38bdf8', // Orange + Slate Blue mix
    '#ffffff', '#cbd5e1', '#94a3b8',
    ['#000000', '#233D4D', '#FE7F2D', '#EAECF0'],
    '#000000',
  ),

  // 10. Electric Dreams — #9FA1FF #B5BAFF #AEE2FF #D9F9DF
  darkPalette(
    'electric-dreams', 'Electric Dreams',
    '#070710', '#0f0f1c', '#0b0b17',
    '#9FA1FF', '#34d399', // Electric Indigo + Emerald mix
    '#ffffff', '#c7d2fe', '#93c5fd',
    ['#0f1020', '#9FA1FF', '#AEE2FF', '#D9F9DF'],
    '#09091b',
  ),

  // 11. Candy Pop — #9ED3DC #FEFD99 #FCB7C7 #CA6180
  darkPalette(
    'candy-pop', 'Candy Pop',
    '#0c080e', '#160e19', '#110b14',
    '#f472b6', '#38bdf8', // Pink + Cyan mix
    '#fef08a', '#9ed3dc', '#f4a2b8',
    ['#9ED3DC', '#FEFD99', '#FCB7C7', '#CA6180'],
    '#180310',
  ),

  // 12. Nordic Frost
  darkPalette(
    'nordic-frost', 'Nordic Frost',
    '#090d1a', '#10162b', '#0c1122',
    '#38bdf8', '#818cf8', // Sky Blue + Indigo mix
    '#ffffff', '#93c5fd', '#94a3b8',
    ['#0b1329', '#13203e', '#38bdf8', '#7dd3fc'],
    '#041629',
  ),

  // 13. Emerald Forest
  darkPalette(
    'emerald-forest', 'Emerald Forest',
    '#060f0b', '#0e1a14', '#0a140f',
    '#34d399', '#38bdf8', // Mint + Sky Blue mix
    '#ffffff', '#a7f3d0', '#6ee7b7',
    ['#041a12', '#0a2e20', '#10b981', '#6ee7b7'],
    '#022416',
  ),

  // 14. Cyberpunk Neon
  darkPalette(
    'cyberpunk-neon', 'Cyberpunk Neon',
    '#0a0512', '#140a21', '#0f071a',
    '#f43f5e', '#38bdf8', // Neon Rose + Cyan mix
    '#ffffff', '#38bdf8', '#fb7185',
    ['#0d021a', '#18052e', '#f43f5e', '#38bdf8'],
    '#ffffff',
  ),

  // 15. Sunset Glow
  darkPalette(
    'sunset-glow', 'Sunset Glow',
    '#0e0812', '#180f1e', '#130b18',
    '#fb923c', '#c084fc', // Warm Orange + Purple mix
    '#ffffff', '#fdba74', '#f472b6',
    ['#180b1e', '#24122d', '#f97316', '#fb923c'],
    '#1f0802',
  ),


  // ─── LIGHT THEMES ─────────────────────────────────────────

  // 16. Pure Light
  lightPalette(
    'light', 'Pure Light',
    '#fcfcfd', '#ffffff', '#f4f4f7',
    '#4338ca', '#818cf8', // Indigo + Soft Lavender mix
    '#0f172a', '#1e1b4b', '#475569',
    ['#ffffff', '#f8fafc', '#4338ca', '#1e1b4b'],
    '#ffffff',
  ),

  // 17. Light Pink (Light)
  lightPalette(
    'light-pink-light', 'Blush Pink (Light)',
    '#faf5f8', '#ffffff', '#f5ebf1',
    '#db2777', '#8b5cf6', // Pink + Purple mix
    '#0f172a', '#9d174d', '#475569',
    ['#fff0f5', '#fce7f3', '#db2777', '#f472b6'],
    '#ffffff',
  ),

  // 18. Red (Light)
  lightPalette(
    'red-light', 'Crimson Red (Light)',
    '#faf5f5', '#ffffff', '#f5eaea',
    '#dc2626', '#f59e0b', // Red + Amber mix
    '#0f172a', '#991b1b', '#475569',
    ['#fff5f5', '#ffe4e4', '#dc2626', '#f87171'],
    '#ffffff',
  ),

  // 19. Yellow (Light)
  lightPalette(
    'yellow-light', 'Amber Gold (Light)',
    '#fcfbfa', '#ffffff', '#f7f4ea',
    '#d97706', '#10b981', // Amber + Emerald mix
    '#0f172a', '#854d0e', '#475569',
    ['#fefce8', '#fef9c3', '#d97706', '#facc15'],
    '#ffffff',
  ),

  // 20. Purple (Light)
  lightPalette(
    'purple-light', 'Royal Purple (Light)',
    '#faf7fd', '#ffffff', '#f3edfa',
    '#9333ea', '#0284c7', // Purple + Blue mix
    '#0f172a', '#6b21a8', '#475569',
    ['#faf5ff', '#f3e8ff', '#9333ea', '#c084fc'],
    '#ffffff',
  ),

  // 21. Soft Blossom — #FBEFEF #FFE2E2 #F5CBCB #C5B3D3
  lightPalette(
    'soft-blossom', 'Soft Blossom',
    '#faf6f6', '#ffffff', '#f5ebeb',
    '#8b5cf6', '#ec4899', // Lavender + Pink mix
    '#2e1038', '#6b21a8', '#581c87',
    ['#FBEFEF', '#FFE2E2', '#F5CBCB', '#C5B3D3'],
    '#ffffff',
  ),

  // 22. Rose Gold
  lightPalette(
    'rose-gold', 'Rose Gold',
    '#faf5f6', '#ffffff', '#f5e8ea',
    '#e11d48', '#d97706', // Rose + Warm Gold mix
    '#1c050c', '#881337', '#64748b',
    ['#fffafb', '#fff2f5', '#e11d48', '#fb7185'],
    '#ffffff',
  ),

  // 23. Matcha Latte
  lightPalette(
    'matcha-latte', 'Matcha Latte',
    '#f5f8f5', '#ffffff', '#eaf1ea',
    '#15803d', '#0284c7', // Sage Green + Sky Blue mix
    '#09170e', '#14532d', '#475569',
    ['#f4f7f4', '#eaf0ea', '#15803d', '#86efac'],
    '#ffffff',
  ),

  // 24. Ocean Breeze
  lightPalette(
    'ocean-breeze', 'Ocean Breeze',
    '#f4f8fa', '#ffffff', '#e9f2f7',
    '#0284c7', '#8b5cf6', // Sky Blue + Violet mix
    '#071e2b', '#0369a1', '#475569',
    ['#f0f9ff', '#e0f2fe', '#0284c7', '#7dd3fc'],
    '#ffffff',
  ),

  // 25. Lavender Mist
  lightPalette(
    'lavender-mist', 'Lavender Mist',
    '#f7f5fa', '#ffffff', '#eeeaf5',
    '#7c3aed', '#ec4899', // Lavender + Pink mix
    '#140e2b', '#5b21b6', '#475569',
    ['#f5f3ff', '#ede9fe', '#7c3aed', '#c4b5fd'],
    '#ffffff',
  ),
];

export const DEFAULT_PALETTE_ID = 'dark';

export function getPalette(id: string): PaletteDef {
  return PALETTES.find((p) => p.id === id) ?? PALETTES[0];
}

/** Apply a palette's CSS variables directly to :root */
export function applyPalette(palette: PaletteDef): void {
  const root = document.documentElement;
  for (const [key, value] of Object.entries(palette.vars)) {
    root.style.setProperty(key, value);
  }
  // Set color-scheme for browser UI (scrollbars, inputs etc.)
  root.setAttribute('data-palette', palette.id);
  root.style.colorScheme = palette.isDark ? 'dark' : 'light';
}
