import agGridBundle from "./ag-grid-enterprise/dist/ag-grid-enterprise.js";

// Shared AG Grid Enterprise API for all Vue pages.
export const agGrid = agGridBundle?.default || agGridBundle;

export function installAgGrid(app) {
  if (typeof window !== "undefined") {
    window.agGrid = agGrid;
  }

  app.config.globalProperties.$agGrid = agGrid;
  app.provide("agGrid", agGrid);

  return agGrid;
}

export default agGrid;
