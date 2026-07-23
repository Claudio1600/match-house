export const colors = {
  background: "#FFFFFF",
  surface: "#F7F7F5",
  surfaceElevated: "#FFFFFF",
  border: "rgba(0,0,0,0.08)",
  borderStrong: "rgba(0,0,0,0.16)",
  textPrimary: "#1A1A1A",
  textSecondary: "#6B6B6B",
  textMuted: "#ADADAD",
  smash: "#1D9E75",
  smashBg: "#E1F5EE",
  pass: "#E24B4A",
  passBg: "#FCEBEB",
  accent: "#1A1A1A",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 6,
  md: 12,
  lg: 20,
  full: 999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: "500" as const },
  h2: { fontSize: 22, fontWeight: "500" as const },
  h3: { fontSize: 18, fontWeight: "500" as const },
  body: { fontSize: 15, fontWeight: "400" as const, lineHeight: 22 },
  caption: { fontSize: 12, fontWeight: "400" as const },
  label: { fontSize: 11, fontWeight: "500" as const, letterSpacing: 0.5 },
};
