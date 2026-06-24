/**
 * Aurora Design Tokens
 * Based on the Naturalist Specimen Design System (Style.md)
 *
 * A 19th-century lithographic specimen plate aesthetic:
 * warm cream paper, muted earthy accents, taxonomic labeling.
 */

export const colors = {
  // Core palette
  bgPaper: "#F4EFE1",
  bgPaperAlt: "#EDE6D6",
  ink: "#2B241C",
  inkSoft: "#6B5E4F",
  accentTerracotta: "#B5482F",
  accentOlive: "#5C6B4A",
  accentSlate: "#5C7A8A",
  accentMustard: "#D9A632",
  line: "#D8CDB8",
  white: "#FFFFFF",
  transparent: "transparent",

  // Semantic aliases
  primary: "#B5482F",
  success: "#5C6B4A",
  info: "#5C7A8A",
  warning: "#D9A632",
  error: "#B5482F",

  // Opacity variants (for tags/status pills)
  accentOliveLight: "rgba(92, 107, 74, 0.15)",
  accentSlateLight: "rgba(92, 122, 138, 0.15)",
  accentMustardLight: "rgba(217, 166, 50, 0.15)",
  accentTerracottaLight: "rgba(181, 72, 47, 0.10)",
} as const;

export const typography = {
  display: {
    fontFamily: "Fraunces_400Regular",
    semiBold: "Fraunces_600SemiBold",
    bold: "Fraunces_700Bold",
  },
  body: {
    fontFamily: "Inter_400Regular",
    medium: "Inter_500Medium",
    semiBold: "Inter_600SemiBold",
  },
  caption: {
    fontFamily: "IBMPlexMono_400Regular",
  },
} as const;

export const fontSizes = {
  h1: 32,
  h2: 24,
  h3: 20,
  bodyLarge: 18,
  body: 16,
  bodySmall: 14,
  caption: 12,
  captionSmall: 10,
} as const;

export const lineHeights = {
  h1: 40,
  h2: 32,
  h3: 28,
  bodyLarge: 28,
  body: 24,
  bodySmall: 20,
  caption: 16,
  captionSmall: 14,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 4,
  md: 6,
  lg: 12,
  pill: 100,
} as const;

export const borders = {
  hairline: {
    borderWidth: 1,
    borderColor: colors.line,
  },
} as const;

// Animation constants (per Style.md: 200-300ms ease-out)
export const motion = {
  fast: 150,
  normal: 250,
  slow: 300,
  gentle: 600,
  easing: "ease-out" as const,
} as const;
