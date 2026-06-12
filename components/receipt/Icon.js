import React from "react";
import Svg, { Path, Circle, G } from "react-native-svg";
import { colors } from "../../theme/receipt";

// Custom line-icon set for the Tactile Receipt system. 24px grid, single stroke.
// No emoji anywhere in the UI. Each icon is a render function of the shared stroke props.
const ICONS = {
  home: (p) => <Path {...p} d="M3 11l9-7 9 7M5 10v10h14V10" />,
  list: (p) => <Path {...p} d="M4 6h16M4 12h16M4 18h11" />,
  chart: (p) => <Path {...p} d="M5 20V10M12 20V4M19 20v-7" />,
  settings: (p) => (
    <G {...p}>
      <Path d="M4 8h16M4 16h16" />
      <Circle cx="9" cy="8" r="2.1" />
      <Circle cx="15" cy="16" r="2.1" />
    </G>
  ),
  send: (p) => <Path {...p} d="M5 12h13M12 6l6 6-6 6" />,
  plus: (p) => <Path {...p} d="M12 5v14M5 12h14" />,
  link: (p) => (
    <Path {...p} d="M9 15l6-6M9.5 6.5l1.8-1.8a3.6 3.6 0 0 1 5.1 5.1L14 11.6M10 12.4l-2.4 2.4a3.6 3.6 0 0 1-5.1-5.1L4.5 7.5" />
  ),
  pencil: (p) => <Path {...p} d="M14.5 5.5l4 4M4 20l1-4L16 5l3 3L8 19l-4 1z" />,
  trash: (p) => <Path {...p} d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13M10 11v6M14 11v6" />,
  save: (p) => <Path {...p} d="M5 4h11l3 3v13H5zM8 4v5h7V4M8 14h8v6H8z" />,
  check: (p) => <Path {...p} d="M5 12l5 5 9-11" />,
  swap: (p) => <Path {...p} d="M5 8h12l-3-3M19 16H7l3 3" />,
  share: (p) => <Path {...p} d="M12 15V4M8.5 7L12 3.5 15.5 7M5 13v6a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-6" />,
  download: (p) => <Path {...p} d="M12 4v11M8 11l4 4 4-4M5 19h14" />,
  alert: (p) => <Path {...p} d="M12 4l9 16H3zM12 10v4M12 17.5v.2" />,
  receipt: (p) => (
    <Path {...p} d="M6 3l1.4 1.4L9 3l1.5 1.4L12 3l1.5 1.4L15 3l1.5 1.4L18 3v18l-1.5-1.4L15 21l-1.5-1.4L12 21l-1.5-1.4L9 21l-1.6-1.4L6 21zM9 8h6M9 12h6M9 16h4" />
  ),
  coffee: (p) => <Path {...p} d="M5 9h12v4a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4zM17 10h2a2 2 0 0 1 0 4h-2M8 3v2.5M11 3v2.5" />,
  cart: (p) => (
    <G {...p}>
      <Path d="M3 4h2l2 12h11M7 8h13l-1.5 6H8.5" />
      <Circle cx="9" cy="20" r="1.3" />
      <Circle cx="17" cy="20" r="1.3" />
    </G>
  ),
  taxi: (p) => (
    <G {...p}>
      <Path d="M4 16v-4l2-5h12l2 5v4M4 16h16M9 7V5h6v2" />
      <Circle cx="8" cy="14.5" r="1" />
      <Circle cx="16" cy="14.5" r="1" />
    </G>
  ),
  // brand mark — filled, not stroked
  google: (p) => (
    <Path
      fill={p.stroke}
      d="M21 12.2c0-.6 0-1.2-.1-1.7H12v3.4h5.1a4.4 4.4 0 0 1-1.9 2.9v2.4h3.1c1.8-1.7 2.7-4.1 2.7-7zM12 21c2.5 0 4.6-.8 6.2-2.3l-3.1-2.4c-.8.6-2 1-3.1 1-2.4 0-4.4-1.6-5.1-3.8H3.7v2.4A9 9 0 0 0 12 21zM6.9 13.5a5.4 5.4 0 0 1 0-3.4V7.7H3.7a9 9 0 0 0 0 8.1zM12 6.6c1.3 0 2.5.5 3.5 1.4l2.6-2.6A9 9 0 0 0 3.7 7.7l3.2 2.4C7.6 8 9.6 6.6 12 6.6z"
    />
  ),
};

const CATEGORY_ICON = {
  מזון: "coffee",
  אוכל: "coffee",
  תחבורה: "taxi",
  קניות: "cart",
  סופר: "cart",
};

export function iconForCategory(category = "") {
  for (const key of Object.keys(CATEGORY_ICON)) {
    if (category.includes(key)) return CATEGORY_ICON[key];
  }
  return "receipt";
}

export default function Icon({ name, size = 22, color = colors.ink, strokeWidth = 1.85 }) {
  const render = ICONS[name] || ICONS.receipt;
  const stroke =
    name === "google"
      ? { stroke: color }
      : { stroke: color, strokeWidth, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {render(stroke)}
    </Svg>
  );
}
