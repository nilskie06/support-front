import { createWebHistory, createRouter } from "vue-router";
import axios from 'axios';
import routes from './routes';
import appConfig from "../../app.config";
import store from '@/state/store';
import { applyUserPreferences } from '@/helpers/themeConfig';

const router = createRouter({
  history: createWebHistory(),
  routes,
  // Use the HTML5 history API (i.e. normal-looking routes)
  // instead of routes with hashes (e.g. example.com/#/about).
  mode: 'history',
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0, left: 0 };
    }
  },
});

const getCachedUser = () => {
  try {
    const rawUser = sessionStorage.getItem('authUser') || localStorage.getItem('user');
    return rawUser ? JSON.parse(rawUser) : null;
  } catch (error) {
    return null;
  }
};

const clearAuthenticatedSession = () => {
  localStorage.removeItem('jwt');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.removeItem('authUser');
  sessionStorage.removeItem('user_menu_permissions');
};

let sessionRefreshRequest = null;

const refreshAuthenticatedSession = (apiBase) => {
  if (sessionRefreshRequest) return sessionRefreshRequest;

  sessionRefreshRequest = axios.get(`${apiBase}/user`)
    .then((response) => {
      const user = response.data.user || response.data;
      if (!user) return;

      localStorage.setItem('userdata', JSON.stringify(user));
      localStorage.setItem('userid', user.id);
      localStorage.setItem('user', JSON.stringify(user));
      sessionStorage.setItem('authUser', JSON.stringify(user));
      applyUserPreferences({
        theme_config: user.theme_config,
        layout_config: user.layout_config,
      });

      if (user.role !== 'admin') {
        return axios.get(`${apiBase}/user/menu-access`).then((permRes) => {
          if (permRes.data?.menus) {
            sessionStorage.setItem('user_menu_permissions', JSON.stringify(permRes.data.menus));
          }
        });
      }
    })
    .catch((error) => {
      // Do not log a user out for a temporary network failure.  Only an invalid
      // session should clear the local session while the page is already open.
      if ([401, 403].includes(error.response?.status)) {
        clearAuthenticatedSession();
        if (router.currentRoute.value.meta?.authRequired) {
          router.replace({ name: 'login', query: { redirectFrom: router.currentRoute.value.fullPath } });
        }
      }
    })
    .finally(() => {
      sessionRefreshRequest = null;
    });

  return sessionRefreshRequest;
};

// API based Authentication & Maintenance Mode Guard.  Navigation is deliberately
// synchronous: cached user/configuration grants immediate route changes while the
// API refresh happens in the background.
router.beforeEach((routeTo, routeFrom, next) => {
  const apiBase = process.env.VUE_APP_AUTHDOMAIN || 'http://localhost:8001/api';

  // 1. Resolve Maintenance Mode Status
  let isMaintenance = false;
  try {
    const rawCfg = localStorage.getItem("velzon_system_general_config");
    if (rawCfg) {
      const cfg = JSON.parse(rawCfg);
      isMaintenance = Boolean(cfg.maintenance_mode);
    } else {
      // Do not make the address bar wait for a public configuration request.
      void axios.get(`${apiBase}/system-branding`).then((brandRes) => {
        if (brandRes.data?.data) {
          localStorage.setItem("velzon_system_general_config", JSON.stringify(brandRes.data.data));
        }
      }).catch(() => {});
    }
  } catch (e) {
    isMaintenance = false;
  }

  // Check stored user role (for admin bypass)
  const cachedUser = getCachedUser();
  const storedUserRole = cachedUser?.role || null;

  const isMaintenancePage = routeTo.path === '/pages/maintenance' || routeTo.path === '/maintenance';
  const isAuthOrBypassPage = ['/login', '/logout', '/auth/logout', '/auth/logout-cover'].includes(routeTo.path);

  // Enforce Maintenance Mode:
  if (isMaintenance) {
    if (storedUserRole === 'admin') {
      // Admin is exempt; if visiting maintenance page, take admin to home
      if (isMaintenancePage) {
        return next({ path: '/' });
      }
    } else {
      // Regular users and unauthenticated guests:
      if (isMaintenancePage) {
        return next();
      }
      if (isAuthOrBypassPage) {
        return next();
      }
      // Redirect regular users to the maintenance notice page
      return next({ path: '/pages/maintenance' });
    }
  } else {
    // Maintenance is disabled; bounce away from maintenance notice
    if (isMaintenancePage) {
      return next({ path: '/' });
    }
  }

  // 2. Allow public error pages and unauthenticated routes without blocking
  const bypassPaths = [
    '/auth/403',
    '/403',
    '/errors/403',
    '/auth/404',
    '/404',
    '/auth/500',
    '/500',
    '/login',
    '/register',
    '/forgot-password',
    '/pages/maintenance',
    '/maintenance',
  ];
  if (bypassPaths.includes(routeTo.path)) {
    return next();
  }

  const authRequired = routeTo.matched.some((route) => route.meta.authRequired);
  if (!authRequired) {
    return next();
  }

  const token = localStorage.getItem('jwt') || localStorage.getItem('token');
  if (!token) {
    return next({ name: 'login', query: { redirectFrom: routeTo.fullPath } });
  }

  axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;

  const user = cachedUser;

  // Refresh the profile and menu permissions after navigation has been accepted.
  // The cached session remains the source for this guard, so route changes never
  // wait on a network round trip.
  void refreshAuthenticatedSession(apiBase);

  if (!user) {
    return next({ name: 'login', query: { redirectFrom: routeTo.fullPath } });
  }

  applyUserPreferences({
    theme_config: user.theme_config,
    layout_config: user.layout_config,
  });

  // Double check maintenance mode from the cached configuration.
  if (isMaintenance && user.role !== 'admin') {
    return next({ path: '/pages/maintenance' });
  }

  // 3. Admins have unrestricted access to all routes
  if (user.role === 'admin') {
    return next();
  }

  // 4. For non-admin accounts: enforce cached menu access permissions.  A
  // missing cache is populated by the background refresh above, not by blocking.
  let userPermissions = null;
  try {
    const cached = sessionStorage.getItem('user_menu_permissions');
    if (cached) userPermissions = JSON.parse(cached);
  } catch (e) {
    userPermissions = null;
  }

  if (userPermissions && Array.isArray(userPermissions)) {
      const targetPath = routeTo.path.replace(/\/+$/, '').toLowerCase();
      const matchedPaths = (routeTo.matched || []).map((r) =>
        (r.path || '').replace(/\/+$/, '').toLowerCase()
      );

      // Check Menu Management path: /settings/menus, /settings/menu, /menu
      const isMenuManagementPath =
        targetPath === '/settings/menus' ||
        targetPath === '/settings/menu' ||
        targetPath === '/menu' ||
        matchedPaths.includes('/menu');

      if (isMenuManagementPath) {
        const menuEntry = userPermissions.find(
          (m) =>
            m.code === 'menu_management' ||
            (m.url && m.url.replace(/\/+$/, '').toLowerCase() === '/menu')
        );
        if (!menuEntry || !menuEntry.can_view) {
          return next({
            path: '/auth/403',
            query: { redirectFrom: routeTo.fullPath },
          });
        }
      }

      // Check User Management path: /settings/users
      const isUserSettingsPath =
        targetPath === '/settings/users' ||
        targetPath.startsWith('/settings/users/') ||
        matchedPaths.includes('/settings/users');

      if (isUserSettingsPath) {
        const userMenu = userPermissions.find(
          (m) =>
            m.code === 'user-settings' ||
            (m.url && m.url.replace(/\/+$/, '').toLowerCase() === '/settings/users')
        );
        if (!userMenu || !userMenu.can_view) {
          return next({
            path: '/auth/403',
            query: { redirectFrom: routeTo.fullPath },
          });
        }
      }

      // Generic matched menu check
      const matchingMenu = userPermissions.find((m) => {
        if (!m.url || m.url === '#' || m.url === '/') return false;
        const menuPath = m.url.replace(/\/+$/, '').toLowerCase();
        if (targetPath === menuPath || targetPath.startsWith(menuPath + '/')) return true;
        if (matchedPaths.includes(menuPath)) return true;
        return false;
      });

      if (matchingMenu && matchingMenu.can_view === false) {
        return next({
          path: '/auth/403',
          query: { redirectFrom: routeTo.fullPath },
        });
      }
  }

  next();
});

router.beforeEach((routeTo, routeFrom, next) => {
  if (process.env.VUE_APP_DEFAULT_AUTH === "firebase") {
    const authRequired = routeTo.matched.some((route) => route.meta.authRequired);
    if (!authRequired) return next();

    if (store.getters['auth/loggedIn']) {
      return store.dispatch('auth/validate').then((validUser) => {
        validUser ? next() : redirectToLogin();
      });
    }

    const redirectToLogin = () => {
      next({ name: 'login', query: { redirectFrom: routeTo.fullPath } });
    };

    redirectToLogin();
  } else {
    const publicPages = [
      '/login',
      '/register',
      '/forgot-password',
      '/auth/403',
      '/403',
      '/errors/403',
      '/auth/404',
      '/404',
      '/auth/500',
      '/500',
      '/pages/maintenance',
      '/maintenance',
    ];
    const authpage = !publicPages.includes(routeTo.path);
    const loggeduser = localStorage.getItem('user');

    if (authpage && !loggeduser) {
      return next('/login');
    }

    next();
  }
});

router.beforeResolve(async (routeTo, routeFrom, next) => {
  try {
    for (const route of routeTo.matched) {
      await new Promise((resolve, reject) => {
        if (route.meta && route.meta.beforeResolve) {
          route.meta.beforeResolve(routeTo, routeFrom, (...args) => {
            if (args.length) {
              next(...args);
              reject(new Error('Redirected'));
            } else {
              resolve();
            }
          });
        } else {
          resolve();
        }
      });
    }
  } catch (error) {
    return;
  }
  document.title =
    (routeTo.meta?.title || "Page Not Found") + " | " + appConfig.title;
  next();
});

export default router;
