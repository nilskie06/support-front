import store from "@/state/store";
import { applySidebarColorToDom } from "./sidebarHelper";
export { applySidebarColorToDom } from "./sidebarHelper";

export const COLOR_PRESETS = [
  { id: "default", name: "Galaxy Indigo", hex: "#405189", rgb: "64, 81, 137" },
  { id: "emerald", name: "Emerald Teal", hex: "#0ab39c", rgb: "10, 179, 156" },
  { id: "sapphire", name: "Sapphire Blue", hex: "#299cdb", rgb: "41, 156, 219" },
  { id: "crimson", name: "Crimson Coral", hex: "#f06548", rgb: "240, 101, 72" },
  { id: "amber", name: "Amber Gold", hex: "#f7b84b", rgb: "247, 184, 75" },
  { id: "purple", name: "Royal Purple", hex: "#7b38d8", rgb: "123, 56, 216" },
  { id: "rose", name: "Modern Rose", hex: "#ec4899", rgb: "236, 72, 153" },
  { id: "slate", name: "Dark Charcoal", hex: "#343a40", rgb: "52, 58, 64" },
];

export const BUTTON_RADIUS_OPTIONS = [
  { id: "square", name: "Square", value: "0px" },
  { id: "subtle", name: "Subtle (4px)", value: "4px" },
  { id: "rounded", name: "Rounded (8px)", value: "8px" },
  { id: "pill", name: "Pill (50px)", value: "50px" },
];

export const BUTTON_WEIGHT_OPTIONS = [
  { id: "400", name: "Regular (400)" },
  { id: "500", name: "Medium (500)" },
  { id: "600", name: "Semi-Bold (600)" },
  { id: "700", name: "Bold (700)" },
];

export const BUTTON_HOVER_OPTIONS = [
  { id: "none", name: "Flat" },
  { id: "lift", name: "Subtle Lift" },
  { id: "glow", name: "Color Glow" },
];

export const INPUT_RADIUS_OPTIONS = [
  { id: "square", name: "Square (0px)", value: "0px" },
  { id: "subtle", name: "Subtle (4px)", value: "4px" },
  { id: "rounded", name: "Rounded (8px)", value: "8px" },
  { id: "pill", name: "Smooth Pill (20px)", value: "20px" },
];

export const INPUT_BORDER_WIDTH_OPTIONS = [
  { id: "1px", name: "Default (1px)" },
  { id: "2px", name: "Bold (2px)" },
];

export const INPUT_STYLE_OPTIONS = [
  { id: "default", name: "Standard Card" },
  { id: "subtle", name: "Soft Tinted" },
];

export const INPUT_FOCUS_RING_OPTIONS = [
  { id: "primary", name: "Accent Glow" },
  { id: "subtle", name: "Subtle Ring" },
  { id: "minimal", name: "Clean Line" },
];

export const CHECKBOX_RADIUS_OPTIONS = [
  { id: "square", name: "Square", value: "0px" },
  { id: "subtle", name: "Rounded", value: "4px" },
  { id: "circle", name: "Circular", value: "50%" },
];

export const CHECKBOX_SIZE_OPTIONS = [
  { id: "compact", name: "Compact (15px)", value: "15px" },
  { id: "default", name: "Standard (18px)", value: "18px" },
  { id: "large", name: "Large (22px)", value: "22px" },
];

export const CHECKBOX_BORDER_OPTIONS = [
  { id: "1px", name: "Light (1px)" },
  { id: "1.5px", name: "Default (1.5px)" },
  { id: "2px", name: "Bold (2px)" },
];

export const DEFAULT_THEME_CONFIG = {
  presetColor: "default",
  primaryColor: "#405189",

  buttonRadius: "rounded",
  buttonWeight: "600",
  buttonHoverEffect: "lift",

  inputRadius: "rounded",
  inputBorderWidth: "1px",
  inputStyle: "default",
  inputFocusRing: "primary",

  checkboxRadius: "subtle",
  checkboxSize: "default",
  checkboxBorderWidth: "1.5px",
};

const THEME_STORAGE_KEY = "velzon_system_theme_config";

export function hexToRgb(hex) {
  let c = hex.replace("#", "").trim();
  if (c.length === 3) {
    c = c.split("").map((ch) => ch + ch).join("");
  }
  if (c.length !== 6) {
    return "64, 81, 137";
  }
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

export function getThemeConfig() {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_THEME_CONFIG, ...parsed };
    }
  } catch (e) {
    console.error("Failed to parse stored theme config:", e);
  }
  return { ...DEFAULT_THEME_CONFIG };
}

export function applyThemeToDom(config) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  // 1. Primary Color and RGB
  let color = config.primaryColor || "#405189";
  let rgb = hexToRgb(color);

  if (config.presetColor !== "custom") {
    const preset = COLOR_PRESETS.find((p) => p.id === config.presetColor);
    if (preset) {
      color = preset.hex;
      rgb = preset.rgb;
    }
  }

  root.style.setProperty("--vz-primary", color);
  root.style.setProperty("--vz-primary-rgb", rgb);
  root.style.setProperty("--app-primary", color);
  root.style.setProperty("--app-primary-rgb", rgb);

  // 2. Buttons
  const btnRadiusItem = BUTTON_RADIUS_OPTIONS.find((r) => r.id === config.buttonRadius);
  const btnRadius = btnRadiusItem ? btnRadiusItem.value : "8px";
  root.style.setProperty("--app-btn-radius", btnRadius);
  root.style.setProperty("--app-btn-font-weight", config.buttonWeight || "600");

  if (config.buttonHoverEffect === "lift") {
    root.style.setProperty("--app-btn-hover-transform", "translateY(-2px)");
    root.style.setProperty("--app-btn-hover-shadow", "0 4px 10px rgba(0, 0, 0, 0.12)");
  } else if (config.buttonHoverEffect === "glow") {
    root.style.setProperty("--app-btn-hover-transform", "none");
    root.style.setProperty("--app-btn-hover-shadow", `0 0 14px rgba(${rgb}, 0.45)`);
  } else {
    root.style.setProperty("--app-btn-hover-transform", "none");
    root.style.setProperty("--app-btn-hover-shadow", "none");
  }

  // 3. Form Input & Textarea
  const inputRadiusItem = INPUT_RADIUS_OPTIONS.find((r) => r.id === config.inputRadius);
  const inputRadius = inputRadiusItem ? inputRadiusItem.value : "8px";
  root.style.setProperty("--app-input-radius", inputRadius);
  root.style.setProperty("--app-input-border-width", config.inputBorderWidth || "1px");

  if (config.inputStyle === "subtle") {
    root.style.setProperty("--app-input-bg", "var(--vz-light)");
  } else {
    root.style.setProperty("--app-input-bg", "var(--vz-input-bg, var(--vz-card-bg))");
  }

  if (config.inputFocusRing === "primary") {
    root.style.setProperty("--app-input-focus-ring", `0 0 0 0.22rem rgba(${rgb}, 0.22)`);
  } else if (config.inputFocusRing === "subtle") {
    root.style.setProperty("--app-input-focus-ring", `0 0 0 0.15rem rgba(${rgb}, 0.12)`);
  } else {
    root.style.setProperty("--app-input-focus-ring", "none");
  }

  // 4. Checkbox, Radio & Switch
  const checkRadiusItem = CHECKBOX_RADIUS_OPTIONS.find((r) => r.id === config.checkboxRadius);
  const checkRadius = checkRadiusItem ? checkRadiusItem.value : "4px";
  root.style.setProperty("--app-check-radius", checkRadius);

  const checkSizeItem = CHECKBOX_SIZE_OPTIONS.find((s) => s.id === config.checkboxSize);
  const checkSize = checkSizeItem ? checkSizeItem.value : "18px";
  root.style.setProperty("--app-check-size", checkSize);
  root.style.setProperty("--app-check-border-width", config.checkboxBorderWidth || "1.5px");

  // Broadcast event for reactive components
  window.dispatchEvent(
    new CustomEvent("app-theme-changed", { detail: config })
  );
}

let themeSyncTimer = null;

export function syncThemeConfigToServer(config) {
  const token = localStorage.getItem("jwt") || localStorage.getItem("token");
  if (!token) return;

  clearTimeout(themeSyncTimer);
  themeSyncTimer = setTimeout(() => {
    const apiBase = process.env.VUE_APP_AUTHDOMAIN || "http://localhost:8001/api";
    fetch(`${apiBase}/user/preferences`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ theme_config: config }),
    }).catch((e) => console.warn("Failed to sync theme config to user preferences:", e));
  }, 600);
}

export function saveThemeConfig(config, syncToServer = true) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(config));
    applyThemeToDom(config);
    if (syncToServer) {
      syncThemeConfigToServer(config);
    }
  } catch (e) {
    console.error("Failed to save theme config:", e);
  }
}

export function resetThemeConfig() {
  saveThemeConfig({ ...DEFAULT_THEME_CONFIG }, true);
  return { ...DEFAULT_THEME_CONFIG };
}

export function applyUserPreferences(preferences) {
  if (!preferences || typeof preferences !== "object") return;
  if (preferences.theme_config && Object.keys(preferences.theme_config).length > 0) {
    saveThemeConfig(preferences.theme_config, false);
  }
  if (preferences.layout_config && Object.keys(preferences.layout_config).length > 0) {
    store.commit("layout/RESTORE_LAYOUT", preferences.layout_config);
  }
}

export function getSystemConfiguration() {
  try {
    const raw = localStorage.getItem("velzon_system_general_config");
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse stored system configuration:", e);
  }
  return null;
}

export function getSystemLogo() {
  const config = getSystemConfiguration();
  return config?.system_logo || null;
}

export function isMaintenanceModeActive() {
  const config = getSystemConfiguration();
  return Boolean(config?.maintenance_mode);
}

export async function fetchAndApplySystemConfiguration() {
  try {
    const apiBase = process.env.VUE_APP_AUTHDOMAIN || "http://localhost:8001/api";
    const token = localStorage.getItem("jwt") || localStorage.getItem("token");
    const endpoint = token ? `${apiBase}/system-configuration` : `${apiBase}/system-branding`;
    const headers = {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const response = await fetch(endpoint, { headers });
    if (!response.ok) return null;

    const data = await response.json();
    const config = data.data;
    if (!config) return null;

    localStorage.setItem("velzon_system_general_config", JSON.stringify(config));

    // Base default theme from system-wide configuration
    let themeConfig = {
      presetColor: config.preset_color || "default",
      primaryColor: config.primary_color || "#405189",
      buttonRadius: config.button_radius || "rounded",
      buttonWeight: config.button_weight || "600",
      buttonHoverEffect: config.button_hover_effect || "lift",
      inputRadius: config.input_radius || "rounded",
      inputBorderWidth: config.input_border_width || "1px",
      inputStyle: config.input_style || "default",
      inputFocusRing: config.input_focus_ring || "primary",
      checkboxRadius: config.checkbox_radius || "subtle",
      checkboxSize: config.checkbox_size || "default",
      checkboxBorderWidth: config.checkbox_border_width || "1.5px",
    };

    let layoutConfig = (config.layout_config && typeof config.layout_config === "object")
      ? config.layout_config
      : null;

    // Check if logged-in user has personal customizer preferences
    if (token) {
      try {
        const userPrefRes = await fetch(`${apiBase}/user/preferences`, { headers });
        if (userPrefRes.ok) {
          const userPrefData = await userPrefRes.json();
          const userPrefs = userPrefData.data;
          if (userPrefs?.theme_config && Object.keys(userPrefs.theme_config).length > 0) {
            themeConfig = { ...themeConfig, ...userPrefs.theme_config };
          }
          if (userPrefs?.layout_config && Object.keys(userPrefs.layout_config).length > 0) {
            layoutConfig = userPrefs.layout_config;
          }
        }
      } catch (prefErr) {
        console.warn("Failed to fetch user preferences, falling back to system defaults:", prefErr);
      }
    }

    saveThemeConfig(themeConfig, false);

    if (layoutConfig) {
      store.commit("layout/RESTORE_LAYOUT", layoutConfig);
    }

    window.dispatchEvent(
      new CustomEvent("system-configuration-updated", { detail: config })
    );

    return config;
  } catch (err) {
    console.warn("Failed to fetch system configuration:", err);
    return null;
  }
}

export function initAppTheme() {
  const config = getThemeConfig();
  applyThemeToDom(config);
  try {
    const rawLayout = localStorage.getItem("velzon_layout_shell_config");
    if (rawLayout) {
      const parsed = JSON.parse(rawLayout);
      if (parsed.sidebarColor) {
        applySidebarColorToDom(parsed.sidebarColor);
      }
    }
  } catch (e) {
    console.error("Failed to apply initial sidebar color:", e);
  }
  fetchAndApplySystemConfiguration();
  return config;
}
