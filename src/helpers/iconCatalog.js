import { icons as remixIcons } from "@/views/icons/data-remix.js";
import { icons as mdiIcons } from "@/views/icons/data-material.js";
import boxiconsList from "./boxicons-list.json";

export const ICON_LIBRARIES = [
  { id: "all", name: "All Libraries", countBadge: "9,500+" },
  { id: "remix", name: "Remix Icons", countBadge: "2,100+" },
  { id: "material", name: "Material Design (MDI)", countBadge: "5,800+" },
  { id: "boxicons", name: "Boxicons", countBadge: "1,500+" },
];

export const REMIX_CATEGORIES = [
  "All Categories",
  "Buildings",
  "Business",
  "Communication",
  "Design",
  "Development",
  "Device",
  "Document",
  "Editor",
  "Finance",
  "Logos",
  "Map",
  "Media",
  "System",
  "User&Faces",
  "Weather",
  "Others",
];

let cachedCatalog = null;

export function getFullIconCatalog() {
  if (cachedCatalog) {
    return cachedCatalog;
  }

  const catalog = [];

  // 1. Remix Icons (Standard for sidebar navigation and Velzon theme)
  if (remixIcons) {
    Object.keys(remixIcons).forEach((category) => {
      const items = remixIcons[category];
      Object.keys(items).forEach((iconKey) => {
        const rawTags = items[iconKey];
        const tags = Array.isArray(rawTags) ? rawTags.join(" ") : "";
        if (category === "Editor") {
          catalog.push({
            className: `ri-${iconKey}`,
            name: `ri-${iconKey}`,
            shortName: iconKey,
            library: "remix",
            category: category,
            tags: `${iconKey} ${tags}`.toLowerCase(),
          });
        } else {
          catalog.push({
            className: `ri-${iconKey}-line`,
            name: `ri-${iconKey}-line`,
            shortName: `${iconKey} (line)`,
            library: "remix",
            category: category,
            tags: `${iconKey} line ${tags}`.toLowerCase(),
          });
          catalog.push({
            className: `ri-${iconKey}-fill`,
            name: `ri-${iconKey}-fill`,
            shortName: `${iconKey} (fill)`,
            library: "remix",
            category: category,
            tags: `${iconKey} fill ${tags}`.toLowerCase(),
          });
        }
      });
    });
  }

  // 2. Boxicons
  if (Array.isArray(boxiconsList)) {
    boxiconsList.forEach((cls) => {
      const cleanName = cls.replace(/^bx\s+/, "");
      catalog.push({
        className: cls,
        name: cls,
        shortName: cleanName,
        library: "boxicons",
        category: "General",
        tags: cleanName.replace(/-/g, " ").toLowerCase(),
      });
    });
  }

  // 3. Material Design Icons (MDI)
  if (Array.isArray(mdiIcons)) {
    mdiIcons.forEach((item) => {
      catalog.push({
        className: `mdi mdi-${item.name}`,
        name: `mdi mdi-${item.name}`,
        shortName: item.name,
        library: "material",
        category: "General",
        tags: item.name.replace(/-/g, " ").toLowerCase(),
      });
    });
  }

  cachedCatalog = catalog;
  return catalog;
}
