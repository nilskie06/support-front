import { applySidebarColorToDom } from '@/helpers/sidebarHelper';

const LAYOUT_STORAGE_KEY = 'velzon_layout_shell_config';

export const defaultLayoutState = {
  layoutType: 'vertical',
  layoutWidth: 'fluid',
  sidebarSize: 'lg',
  topbar: 'light',
  mode: 'dark',
  position: 'fixed',
  sidebarView: 'default',
  sidebarColor: 'dark',
  sidebarImage: 'none',
  preloader: 'disable',
  visibility: 'show'
};

function loadStoredLayout() {
  try {
    const raw = localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const restored = {};
      Object.keys(defaultLayoutState).forEach((key) => {
        if (parsed[key] !== undefined && parsed[key] !== null) {
          restored[key] = parsed[key];
        }
      });
      return restored;
    }
  } catch (e) {
    console.error('Failed to load stored layout config:', e);
  }
  return {};
}

let syncTimer = null;

function collectLayout(state) {
  const data = {};
  Object.keys(defaultLayoutState).forEach((key) => {
    data[key] = state[key];
  });
  return data;
}

function saveLocal(state) {
  try {
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(collectLayout(state)));
  } catch (e) {
    console.error('Failed to save layout config:', e);
  }
}

function syncLayoutToServer(layout) {
  const token = localStorage.getItem('jwt') || localStorage.getItem('token');
  if (!token) return;

  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    const apiBase = process.env.VUE_APP_AUTHDOMAIN || 'http://localhost:8001/api';
    fetch(`${apiBase}/user/preferences`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ layout_config: layout }),
    }).catch((e) => console.warn('Failed to sync layout config to user preferences:', e));
  }, 600);
}

function persistLayout(state) {
  saveLocal(state);
  syncLayoutToServer(collectLayout(state));
}

export const state = { ...defaultLayoutState, ...loadStoredLayout() };

export const mutations = {
  RESTORE_LAYOUT(state, config) {
    Object.keys(defaultLayoutState).forEach((key) => {
      if (config && config[key] !== undefined && config[key] !== null) {
        state[key] = config[key];
      }
    });
    saveLocal(state);
    if (state.sidebarColor) {
      applySidebarColorToDom(state.sidebarColor);
    }
  },
  CHANGE_LAYOUT(state, layoutType) {
    state.layoutType = layoutType;
    persistLayout(state);
  },
  CHANGE_LAYOUT_WIDTH(state, layoutWidth) {
    state.layoutWidth = layoutWidth;
    persistLayout(state);
  },
  CHANGE_SIDEBAR_TYPE(state, sidebarSize) {
    state.sidebarSize = sidebarSize;
    persistLayout(state);
  },
  CHANGE_TOPBAR(state, topbar) {
    state.topbar = topbar;
    persistLayout(state);
  },
  CHANGE_MODE(state, mode) {
    state.mode = mode;
    persistLayout(state);
  },
  CHANGE_POSITION(state, position) {
    state.position = position;
    persistLayout(state);
  },
  CHANGE_SIDEBAR_VIEW(state, sidebarView) {
    state.sidebarView = sidebarView;
    persistLayout(state);
  },
  CHANGE_SIDEBAR_COLOR(state, sidebarColor) {
    state.sidebarColor = sidebarColor;
    persistLayout(state);
    applySidebarColorToDom(sidebarColor);
  },
  CHANGE_SIDEBAR_IMAGE(state, sidebarImage) {
    state.sidebarImage = sidebarImage;
    persistLayout(state);
  },
  CHANGE_PRELOADER(state, preloader) {
    state.preloader = preloader;
    persistLayout(state);
  },
  CHANGE_VISIBILITY(state, visibility) {
    state.visibility = visibility;
    persistLayout(state);
  }
};

export const actions = {
  changeLayoutType({ commit }, { layoutType }) {
    commit('CHANGE_LAYOUT', layoutType);
    document.body.removeAttribute("style");
  },

  changeLayoutWidth({ commit }, { layoutWidth }) {
    commit('CHANGE_LAYOUT_WIDTH', layoutWidth);
  },

  changeSidebarSize({ commit }, { sidebarSize }) {
    commit('CHANGE_SIDEBAR_TYPE', sidebarSize);
  },

  changeTopbar({ commit }, { topbar }) {
    commit('CHANGE_TOPBAR', topbar);
  },

  changeMode({ commit }, { mode }) {
    commit('CHANGE_MODE', mode);
  },

  changePosition({ commit }, { position }) {
    commit('CHANGE_POSITION', position);
  },

  changeSidebarView({ commit }, { sidebarView }) {
    commit('CHANGE_SIDEBAR_VIEW', sidebarView);
  },

  changeSidebarColor({ commit }, { sidebarColor }) {
    commit('CHANGE_SIDEBAR_COLOR', sidebarColor);
  },

  changePreloader({ commit }, { preloader }) {
    commit('CHANGE_PRELOADER', preloader);
  },

  changeBodybg({ commit }, { bodybg }) {
    commit('CHANGE_BODYBG', bodybg);
  },

  changeVisibility({ commit }, { visibility }) {
    commit('CHANGE_VISIBILITY', visibility);
  }
};
