export const SIDEBAR_HEX_PRESETS = [
  { name: "Slate Navy", hex: "#1e293b" },
  { name: "Midnight Navy", hex: "#0f172a" },
  { name: "Charcoal Dark", hex: "#1a1d21" },
  { name: "Royal Purple", hex: "#2e1065" },
  { name: "Deep Indigo", hex: "#1e1b4b" },
  { name: "Forest Green", hex: "#064e3b" },
  { name: "Wine Burgundy", hex: "#4a044e" },
  { name: "Warm Espresso", hex: "#1c1917" },
];

export function isHexColor(color) {
  return typeof color === "string" && color.trim().startsWith("#");
}

export function isColorDark(hex) {
  if (!hex || typeof hex !== "string") return true;
  const clean = hex.replace("#", "").trim();
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  if (full.length !== 6) return true;
  const r = parseInt(full.substring(0, 2), 16) || 0;
  const g = parseInt(full.substring(2, 4), 16) || 0;
  const b = parseInt(full.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq < 155;
}

export function applySidebarColorToDom(color) {
  if (typeof document === "undefined" || !document.documentElement) return;
  if (!color || typeof color !== "string") return;

  const root = document.documentElement;

  if (color.startsWith("#")) {
    const isDark = isColorDark(color);

    root.setAttribute("data-sidebar", isDark ? "dark" : "light");
    root.setAttribute("data-sidebar-custom", "true");
    root.style.setProperty("--vz-vertical-menu-bg", color);
    root.style.setProperty(
      "--vz-vertical-menu-border",
      isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)"
    );
    root.style.setProperty(
      "--vz-twocolumn-menu-iconview-bg",
      isDark ? "rgba(0, 0, 0, 0.18)" : "rgba(0, 0, 0, 0.05)"
    );
  } else {
    root.removeAttribute("data-sidebar-custom");
    root.style.removeProperty("--vz-vertical-menu-bg");
    root.style.removeProperty("--vz-vertical-menu-border");
    root.style.removeProperty("--vz-twocolumn-menu-iconview-bg");

    switch (color) {
      case "dark":
        root.setAttribute("data-sidebar", "dark");
        break;
      case "light":
        root.setAttribute("data-sidebar", "light");
        break;
      case "gradient":
        root.setAttribute("data-sidebar", "gradient");
        break;
      case "gradient-2":
        root.setAttribute("data-sidebar", "gradient-2");
        break;
      case "gradient-3":
        root.setAttribute("data-sidebar", "gradient-3");
        break;
      case "gradient-4":
        root.setAttribute("data-sidebar", "gradient-4");
        break;
      default:
        root.setAttribute("data-sidebar", color);
        break;
    }
  }
}
