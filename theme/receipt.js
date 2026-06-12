// Tactile Receipt — design tokens
// The app is styled as a paper receipt: printed numbers (mono), handwritten voice
// (Amatic SC / Caveat), ink-navy as the voice, mustard as the action, stamp-red as warning.

export const colors = {
  ground: "#E7DFCE", // kraft screen background
  paper: "#FBF7EC", // receipt paper
  ruled: "#efe7d3", // faint ruled lines on paper
  tooth: "#E7DFCE", // torn-edge teeth (= ground, "bites" into paper)

  ink: "#1F3A5F", // primary voice
  inkSoft: "#3b6ea5", // secondary chart / accents
  gold: "#F4C542", // single action accent
  red: "#B23A2E", // warning / destructive stamp

  text: "#221f18", // primary text on paper
  sub: "#5f5946", // secondary text
  muted: "#9b9176", // tertiary / metadata
  dotted: "#c8bb9b", // leader-line dots
  field: "#d9cdb2", // input borders

  // chart palette
  chart: ["#1F3A5F", "#3b6ea5", "#B23A2E", "#F4C542", "#cdbfa3"],

  good: "#7bbf8a", // saved confirmation
  goodInk: "#0f2a18",
  warnBg: "#fbeede",
  warnBorder: "#e9b98e",
  warnText: "#8a4a25",
};

// Font family keys must match the names passed to useFonts() in App.js.
export const fonts = {
  // printed — numbers, dates, labels
  mono: "SplineSansMono_400Regular",
  monoMed: "SplineSansMono_500Medium",
  monoSemi: "SplineSansMono_600SemiBold",
  // handwritten voice
  handHe: "AmaticSC_700Bold", // Hebrew greetings / titles / AI notes
  handLat: "Caveat_700Bold", // Latin wordmark
  // body copy
  body: "Rubik_400Regular",
  bodyMed: "Rubik_500Medium",
  bodySemi: "Rubik_600SemiBold",
  bodyBold: "Rubik_700Bold",
};

export const radii = { sm: 5, md: 10, lg: 14, pill: 999 };

export const space = (n) => n * 4;

// shared text styles
export const type = {
  wordmark: { fontFamily: fonts.handLat, color: colors.ink, fontSize: 22 },
  greeting: { fontFamily: fonts.handHe, color: colors.text, fontSize: 26, lineHeight: 28 },
  title: { fontFamily: fonts.handHe, color: colors.text, fontSize: 28, lineHeight: 30 },
  label: {
    fontFamily: fonts.mono,
    color: colors.sub,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  total: { fontFamily: fonts.monoSemi, color: colors.ink, fontSize: 42, letterSpacing: -1 },
  amount: { fontFamily: fonts.monoMed, color: colors.text, fontSize: 16 },
  bodyText: { fontFamily: fonts.body, color: colors.text, fontSize: 14 },
  sub: { fontFamily: fonts.body, color: colors.sub, fontSize: 13 },
};
