import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PALETTES, DEFAULT_PALETTE_ID, getPalette, applyPalette, type PaletteDef } from '../themes/palettes';

interface ThemeState {
  paletteId: string;
  palette: PaletteDef;
  setPalette: (id: string) => void;
  /** Called once on app mount to rehydrate the saved palette */
  initTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      paletteId: DEFAULT_PALETTE_ID,
      palette: getPalette(DEFAULT_PALETTE_ID),

      setPalette: (id: string) => {
        const palette = getPalette(id);
        applyPalette(palette);
        set({ paletteId: id, palette });
      },

      initTheme: () => {
        const palette = getPalette(get().paletteId);
        applyPalette(palette);
      },
    }),
    {
      name: 'lama-hub-theme',
      // Only persist the id, not the whole palette object
      partialize: (state) => ({ paletteId: state.paletteId }),
      // On rehydration, re-derive palette from id
      onRehydrateStorage: () => (state) => {
        if (state) {
          const palette = getPalette(state.paletteId);
          state.palette = palette;
          applyPalette(palette);
        }
      },
    }
  )
);

// Expose palette list for the picker UI
export { PALETTES };
