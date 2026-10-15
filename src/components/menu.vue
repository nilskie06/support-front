<script>
import axios from "axios";
import { layoutComputed } from "@/state/helpers";

export default {
  name: "SidebarMenu",
  data() {
    return {
      menuList: [],
      loading: false,
      settings: {
        minScrollbarLength: 60,
      },
    };
  },
  computed: {
    ...layoutComputed,
    layoutType: {
      get() {
        return this.$store ? this.$store.state.layout.layoutType : {} || {};
      },
    },
    apiBase() {
      return process.env.VUE_APP_AUTHDOMAIN || "http://localhost:8001/api";
    },
  },
  watch: {
    $route: {
      handler: "onRoutechange",
      immediate: true,
      deep: true,
    },
  },
  mounted() {
    // 1. Instantly load cached menus if available to avoid layout shift
    const userId = localStorage.getItem("userid");
    const userCacheKey = userId ? `app_sidebar_menus_${userId}` : "app_sidebar_menus";
    const cached = localStorage.getItem(userCacheKey) || localStorage.getItem("app_sidebar_menus");
    if (cached) {
      try {
        this.menuList = JSON.parse(cached);
        this.$nextTick(() => {
          this.initCollapses();
          this.initActiveMenu();
        });
      } catch (e) {
        console.error("Error reading cached menus:", e);
      }
    }

    // 2. Fetch live user access menus
    this.fetchMenus();

    // 3. Listen for changes saved in /menu, /settings/users, or /settings/roles
    window.addEventListener("menus-updated", this.fetchMenus);

    if (this.rmenu === "vertical" && this.layoutType === "twocolumn") {
      document.documentElement.setAttribute("data-layout", "vertical");
    }

    const overlay = document.getElementById("overlay");
    if (overlay) {
      overlay.addEventListener("click", () => {
        document.body.classList.remove("vertical-sidebar-enable");
      });
    }

    window.addEventListener("resize", this.handleResize);
  },
  unmounted() {
    window.removeEventListener("menus-updated", this.fetchMenus);
    window.removeEventListener("resize", this.handleResize);
  },
  methods: {
    handleResize() {
      if (this.layoutType === "twocolumn") {
        const windowSize = document.documentElement.clientWidth;
        if (windowSize < 767) {
          document.documentElement.setAttribute("data-layout", "vertical");
          this.rmenu = "vertical";
          localStorage.setItem("rmenu", "vertical");
        } else {
          document.documentElement.setAttribute("data-layout", "vertical");
          this.rmenu = "twocolumn";
          localStorage.setItem("rmenu", "twocolumn");
          setTimeout(() => {
            this.initActiveMenu();
          }, 50);
        }
      }
    },

    getAuthHeaders() {
      const token = localStorage.getItem("jwt") || localStorage.getItem("token");
      return token ? { Authorization: `Bearer ${token}` } : {};
    },

    filterSidebarMenus(list) {
      if (!Array.isArray(list)) return [];
      return list
        .filter((item) => {
          // Status must be active and set as a side menu
          const isStatusActive = item.status === undefined || Boolean(item.status);
          const isSideMenu = item.is_side_menu === undefined || Boolean(item.is_side_menu);
          if (!isStatusActive || !isSideMenu) return false;

          // Check user access permission: if can_view is explicitly present and false, hide
          if (item.can_view !== undefined && !item.can_view) return false;

          return true;
        })
        .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
        .map((item) => {
          const rawChildren = item.all_children || item.children || [];
          return {
            ...item,
            children: this.filterSidebarMenus(rawChildren),
          };
        })
        .filter((item) => {
          // If this is a dropdown container with '#' or empty URL and has no accessible children remaining, hide it
          const isDropdownContainer = !item.url || item.url === "#" || item.url === "javascript:void(0);";
          const hasChildren = item.children && item.children.length > 0;
          if (isDropdownContainer && !hasChildren) {
            return false;
          }
          return true;
        });
    },

    async fetchMenus() {
      this.loading = true;
      try {
        const token = localStorage.getItem("jwt") || localStorage.getItem("token");
        const headers = this.getAuthHeaders();
        let tree = [];

        // If user is authenticated, load their specific accessible menu tree
        if (token) {
          try {
            const res = await axios.get(`${this.apiBase}/user/menu-access`, { headers });
            if (res.data && res.data.menu_tree) {
              tree = res.data.menu_tree;
            }
            if (res.data && res.data.menus) {
              sessionStorage.setItem("user_menu_permissions", JSON.stringify(res.data.menus));
            }
          } catch (accessErr) {
            console.warn("Could not fetch user-specific menu access, falling back to /menus:", accessErr);
          }
        }

        // Fallback or unauthenticated: load general menus
        if (!tree || tree.length === 0) {
          const response = await axios.get(`${this.apiBase}/menus`, { headers });
          tree = response.data.data || [];
        }

        const filtered = this.filterSidebarMenus(tree);
        this.menuList = filtered;

        const userId = localStorage.getItem("userid");
        const userCacheKey = userId ? `app_sidebar_menus_${userId}` : "app_sidebar_menus";
        localStorage.setItem(userCacheKey, JSON.stringify(filtered));
        localStorage.setItem("app_sidebar_menus", JSON.stringify(filtered));

        this.$nextTick(() => {
          this.initCollapses();
          this.initActiveMenu();
        });
      } catch (err) {
        console.error("Failed to load menus for sidebar:", err);
      } finally {
        this.loading = false;
      }
    },

    initCollapses() {
      const collapses = document.querySelectorAll(".navbar-nav .collapse");
      if (!collapses || collapses.length === 0) return;

      collapses.forEach((collapse) => {
        // Prevent re-binding duplicate listeners
        if (collapse.dataset.boundCollapse) return;
        collapse.dataset.boundCollapse = "true";

        // Hide sibling collapses on show
        collapse.addEventListener("show.bs.collapse", (e) => {
          e.stopPropagation();
          const closestCollapse = collapse.parentElement.closest(".collapse");
          if (closestCollapse) {
            const siblingCollapses = closestCollapse.querySelectorAll(".collapse");
            siblingCollapses.forEach((siblingCollapse) => {
              if (siblingCollapse !== collapse && siblingCollapse.classList.contains("show")) {
                siblingCollapse.classList.remove("show");
                this.setCollapseExpanded(siblingCollapse, false);
              }
            });
          }
        });

        // Hide child collapses on hide
        collapse.addEventListener("hide.bs.collapse", (e) => {
          e.stopPropagation();
          const childCollapses = collapse.querySelectorAll(".collapse");
          childCollapses.forEach((childCollapse) => {
            childCollapse.classList.remove("show");
            this.setCollapseExpanded(childCollapse, false);
          });
        });
      });
    },

    setCollapseExpanded(collapse, isExpanded) {
      const trigger = collapse.previousElementSibling;
      if (trigger?.matches('[data-bs-toggle="collapse"]')) {
        trigger.setAttribute("aria-expanded", String(isExpanded));
      }
    },

    onRoutechange(ele) {
      this.initActiveMenu(ele ? ele.path : null);
      if (document.getElementsByClassName("mm-active").length > 0) {
        const currentPosition = document.getElementsByClassName("mm-active")[0].offsetTop;
        if (currentPosition > 500 && this.$refs.isSimplebar) {
          this.$refs.isSimplebar.value.getScrollElement().scrollTop = currentPosition + 300;
        }
      }
    },

    initActiveMenu(customPath) {
      const pathName = customPath || window.location.pathname;
      const ul = document.getElementById("navbar-nav");
      if (!ul) return;

      const items = Array.from(ul.querySelectorAll("a.nav-link"));
      const activeItems = items.filter((x) => x.classList.contains("active"));
      this.removeActivation(activeItems);

      const matchingMenuItem = items.find((x) => {
        const href = x.getAttribute("href");
        return href && href !== "#" && href !== "javascript:void(0);" && href === pathName;
      });

      if (matchingMenuItem) {
        this.activateParentDropdown(matchingMenuItem);
      }
    },

    removeActivation(items) {
      items.forEach((item) => {
        if (item.classList.contains("menu-link")) {
          if (!item.classList.contains("active")) {
            item.setAttribute("aria-expanded", "false");
          }
          if (item.nextElementSibling) {
            item.nextElementSibling.classList.remove("show");
          }
        }
        if (item?.classList?.contains("nav-link")) {
          if (item?.nextElementSibling) {
            item?.nextElementSibling?.classList?.remove("show");
          }
          item.setAttribute("aria-expanded", "false");
        }
        item.classList.remove("active");
      });
    },

    activateParentDropdown(item) {
      item.classList.add("active");
      const parentCollapseDiv = item.closest(".collapse.menu-dropdown");
      if (parentCollapseDiv) {
        parentCollapseDiv.classList.add("show");
        if (parentCollapseDiv.parentElement && parentCollapseDiv.parentElement.children[0]) {
          parentCollapseDiv.parentElement.children[0].classList.add("active");
          parentCollapseDiv.parentElement.children[0].setAttribute("aria-expanded", "true");
        }

        const grandParentCollapse = parentCollapseDiv.parentElement.closest(".collapse.menu-dropdown");
        if (grandParentCollapse) {
          grandParentCollapse.classList.add("show");
          if (grandParentCollapse.parentElement && grandParentCollapse.parentElement.children[0]) {
            grandParentCollapse.parentElement.children[0].classList.add("active");
            grandParentCollapse.parentElement.children[0].setAttribute("aria-expanded", "true");
          }
        }
        return false;
      }
      return false;
    },
  },
};
</script>

<template>
  <BContainer fluid>
    <div id="two-column-menu"></div>

    <template v-if="layoutType === 'vertical' || layoutType === 'semibox'">
      <ul class="navbar-nav h-100" id="navbar-nav">
        <li class="menu-title">
          <span data-key="t-menu">{{ $t("t-menu") || "Menu" }}</span>
        </li>

        <!-- Loading indicator -->
        <li v-if="loading && menuList.length === 0" class="nav-item px-3 py-2 text-muted">
          <div class="d-flex align-items-center gap-2 fs-12">
            <span class="spinner-border spinner-border-sm text-primary"></span>
            <span>Loading menus...</span>
          </div>
        </li>

        <!-- Dynamic Menu Items from tkt_menus -->
        <template v-for="item in menuList" :key="item.id">
          <!-- 1. Single Root Item (no children) -->
          <li v-if="!item.children || item.children.length === 0" class="nav-item">
            <a
              v-if="!item.url || item.url === '#' || item.url.startsWith('http')"
              :href="item.url || 'javascript:void(0);'"
              :target="item.url && item.url.startsWith('http') ? '_blank' : null"
              class="nav-link menu-link"
            >
              <i :class="item.icon || 'ri-menu-line'"></i>
              <span>{{ item.name }}</span>
            </a>
            <router-link
              v-else
              :to="item.url"
              class="nav-link menu-link"
            >
              <i :class="item.icon || 'ri-menu-line'"></i>
              <span>{{ item.name }}</span>
            </router-link>
          </li>

          <!-- 2. Root Item with Dropdown Children -->
          <li v-else class="nav-item">
            <a
              class="nav-link menu-link"
              :href="'#sidebar_' + item.id"
              data-bs-toggle="collapse"
              role="button"
              aria-expanded="false"
              :aria-controls="'sidebar_' + item.id"
            >
              <i :class="item.icon || 'ri-apps-2-line'"></i>
              <span>{{ item.name }}</span>
            </a>
            <div class="collapse menu-dropdown" :id="'sidebar_' + item.id">
              <ul class="nav nav-sm flex-column">
                <li
                  v-for="sub in item.children"
                  :key="sub.id"
                  class="nav-item"
                >
                  <!-- Sub-item WITH deeper children (Level 3) -->
                  <template v-if="sub.children && sub.children.length">
                    <a
                      class="nav-link"
                      :href="'#sidebar_sub_' + sub.id"
                      data-bs-toggle="collapse"
                      role="button"
                      aria-expanded="false"
                      :aria-controls="'sidebar_sub_' + sub.id"
                    >
                      <i v-if="sub.icon" :class="sub.icon" class="me-1"></i>
                      <span>{{ sub.name }}</span>
                    </a>
                    <div class="collapse menu-dropdown" :id="'sidebar_sub_' + sub.id">
                      <ul class="nav nav-sm flex-column">
                        <li
                          v-for="deep in sub.children"
                          :key="deep.id"
                          class="nav-item"
                        >
                          <a
                            v-if="!deep.url || deep.url === '#' || deep.url.startsWith('http')"
                            :href="deep.url || 'javascript:void(0);'"
                            :target="deep.url && deep.url.startsWith('http') ? '_blank' : null"
                            class="nav-link"
                          >
                            <i v-if="deep.icon" :class="deep.icon" class="me-1"></i>
                            <span>{{ deep.name }}</span>
                          </a>
                          <router-link
                            v-else
                            :to="deep.url"
                            class="nav-link"
                          >
                            <i v-if="deep.icon" :class="deep.icon" class="me-1"></i>
                            <span>{{ deep.name }}</span>
                          </router-link>
                        </li>
                      </ul>
                    </div>
                  </template>

                  <!-- Sub-item WITHOUT deeper children -->
                  <template v-else>
                    <a
                      v-if="!sub.url || sub.url === '#' || sub.url.startsWith('http')"
                      :href="sub.url || 'javascript:void(0);'"
                      :target="sub.url && sub.url.startsWith('http') ? '_blank' : null"
                      class="nav-link"
                    >
                      <i v-if="sub.icon" :class="sub.icon" class="me-1"></i>
                      <span>{{ sub.name }}</span>
                    </a>
                    <router-link
                      v-else
                      :to="sub.url"
                      class="nav-link"
                    >
                      <i v-if="sub.icon" :class="sub.icon" class="me-1"></i>
                      <span>{{ sub.name }}</span>
                    </router-link>
                  </template>
                </li>
              </ul>
            </div>
          </li>
        </template>
      </ul>
    </template>
  </BContainer>
</template>
