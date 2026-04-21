import { Injectable, signal } from '@angular/core';
import { updatePrimaryPalette } from '@primeuix/themes';

export const THEME_STORAGE_KEY = 'app:theme-primary';

export const SUPPORTED_COLORS = [
  'indigo',
  'blue',
  'sky',
  'cyan',
  'teal',
  'emerald',
  'green',
  'amber',
  'orange',
  'red',
  'rose',
  'pink',
  'violet',
  'purple',
] as const;

export type ThemeColor = (typeof SUPPORTED_COLORS)[number];

export interface ColorOption {
  code: ThemeColor;
  label: string;
  swatch: string;
}

export const COLOR_OPTIONS: ColorOption[] = [
  { code: 'indigo', label: 'Indigo', swatch: '#6366f1' },
  { code: 'blue', label: 'Blue', swatch: '#3b82f6' },
  { code: 'sky', label: 'Sky', swatch: '#0ea5e9' },
  { code: 'cyan', label: 'Cyan', swatch: '#06b6d4' },
  { code: 'teal', label: 'Teal', swatch: '#14b8a6' },
  { code: 'emerald', label: 'Emerald', swatch: '#10b981' },
  { code: 'green', label: 'Green', swatch: '#22c55e' },
  { code: 'amber', label: 'Amber', swatch: '#f59e0b' },
  { code: 'orange', label: 'Orange', swatch: '#f97316' },
  { code: 'red', label: 'Red', swatch: '#ef4444' },
  { code: 'rose', label: 'Rose', swatch: '#f43f5e' },
  { code: 'pink', label: 'Pink', swatch: '#ec4899' },
  { code: 'violet', label: 'Violet', swatch: '#8b5cf6' },
  { code: 'purple', label: 'Purple', swatch: '#a855f7' },
];

export function paletteFor(color: ThemeColor): Record<number, string> {
  const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  return Object.fromEntries(shades.map((s) => [s, `{${color}.${s}}`]));
}

export function loadInitialPrimary(): ThemeColor {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && (SUPPORTED_COLORS as readonly string[]).includes(stored)) {
      return stored as ThemeColor;
    }
  } catch {
    // storage unavailable — fall through
  }
  return 'indigo';
}

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly current = signal<ThemeColor>(loadInitialPrimary());

  constructor() {
    updatePrimaryPalette(paletteFor(this.current()));
  }

  set(color: ThemeColor): void {
    updatePrimaryPalette(paletteFor(color));
    this.current.set(color);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, color);
    } catch {
      // storage unavailable — ignore
    }
  }
}
