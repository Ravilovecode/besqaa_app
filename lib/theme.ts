// Besqaa brand palette — dark navy + gold, matching the app mockups.
export const theme = {
  colors: {
    bg: '#0a1024',
    bgElevated: '#111a36',
    card: '#141d3d',
    cardBorder: '#232f57',
    surface: '#1a2447',
    gold: '#d4af37',
    goldBright: '#e6c24d',
    goldSoft: 'rgba(212, 175, 55, 0.14)',
    text: '#f3f5fd',
    textMuted: '#9aa3c7',
    textDim: '#6b7399',
    white: '#ffffff',
    danger: '#ef6a6a',
    dangerSoft: 'rgba(239, 106, 106, 0.14)',
    success: '#4ec78e',
    strike: '#6b7399',
    inputBg: '#0e1730',
  },
  radius: {
    sm: 10,
    md: 16,
    lg: 22,
    pill: 999,
  },
  spacing: (n: number) => n * 4,
};

export type Theme = typeof theme;
