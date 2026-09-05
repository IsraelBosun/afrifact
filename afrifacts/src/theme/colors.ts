/**
 * The colour system.
 *
 * Every screen holds ONE category family plus neutrals. The app feels vibrant
 * because the colour changes as you swipe, not because any single screen is busy.
 *
 * Each family has three stops:
 *   light — the card fill on a typographic card
 *   mid   — pills, accents, active states
 *   dark  — text on a light fill, and the panel colour on a photo card
 *
 * Text on a coloured fill uses the dark stop from the SAME family.
 * Never black, never grey.
 */

import type { Category } from '@/src/types/fact';

export interface ColorFamily {
  light: string;
  mid: string;
  dark: string;
}

export const categoryColors: Record<Category, ColorFamily> = {
  Culture: { light: '#9FE1CB', mid: '#0F6E56', dark: '#04342C' },
  History: { light: '#F5C4B3', mid: '#993C1D', dark: '#4A1B0C' },
  Business: { light: '#CECBF6', mid: '#534AB7', dark: '#26215C' },
  Food: { light: '#F4C0D1', mid: '#993556', dark: '#4B1528' },
  Sports: { light: '#B5D4F4', mid: '#185FA5', dark: '#042C53' },
};

/** Streak flames, daily-goal moments, and the amber accent generally. */
export const amber: ColorFamily = { light: '#FAC775', mid: '#854F0B', dark: '#633806' };

/** The logo mark and the active tab. The one colour that never changes with category. */
export const brandGreen = '#1D9E75';

/** Quiz answer feedback. Correct and wrong, nothing else. */
export const feedback = {
  correct: '#1D9E75',
  correctFill: '#D6F2E7',
  wrong: '#C4462F',
  wrongFill: '#F7DCD6',
} as const;

/**
 * Neutrals, sampled from the design PDF.
 * The app is warm off-white, not white, and near-black is green-tinted.
 */
export const neutrals = {
  light: {
    background: '#FFFFFF',
    /** Page ground behind cards, and the deep-dive reading surface. */
    surface: '#FBF3E8',
    surfaceAlt: '#F1EEE6',
    border: '#E4E0D6',
    text: '#141915',
    textMuted: '#6B7268',
    textFaint: '#A9A69A',
    inverseText: '#FBF3E8',
    tabBar: '#FFFFFF',
    tabInactive: '#A9A69A',
  },
  dark: {
    background: '#0E100F',
    surface: '#141915',
    surfaceAlt: '#1C2019',
    border: '#2A2F28',
    text: '#FBF3E8',
    textMuted: '#A9A69A',
    textFaint: '#6B7268',
    inverseText: '#0E100F',
    tabBar: '#141915',
    tabInactive: '#6B7268',
  },
} as const;

/**
 * Tint fills behind category-tinted chips and pills on a light ground.
 * Sampled from the chip row in the PDF.
 */
export const categoryTint: Record<Category, string> = {
  Culture: '#E1F5EE',
  History: '#FAECE7',
  Business: '#EEEDFE',
  Food: '#FBEAF0',
  Sports: '#E6F1FB',
};

/** Deep green used for "For You" chip text and score screens. */
export const deepGreen = '#085041';

export type ColorScheme = keyof typeof neutrals;

/** Resolve a category to its family. Falls back to Culture for unknown values. */
export function familyFor(category: Category): ColorFamily {
  return categoryColors[category] ?? categoryColors.Culture;
}
