<script>
import axios from 'axios';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { layoutMethods } from "@/state/helpers";

import simplebar from "simplebar-vue";

import i18n from "../i18n";
import { getSystemLogo } from "@/helpers/themeConfig";

/**
 * Nav-bar Component
 */
export default {
  data() {
    return {
      systemLogo: getSystemLogo(),
      currentUser: null,
      systems: [],
      loadingSystems: false,
      systemSearch: "",
      newTickets: [],
      loadingNewTickets: false,
      ticketSearch: "",
      ticketSearchResults: [],
      ticketSearchLoading: false,
      ticketSearchOpen: false,
      ticketSearchTimer: null,
      notifications: [],
      unreadNotifications: 0,
      notificationEcho: null,

      languages: [{
        flag: require("@/assets/images/flags/us.svg"),
        language: "en",
        title: "English",
      },
      {
        flag: require("@/assets/images/flags/spain.svg"),
        language: "sp",
        title: "Española",
      },
      {
        flag: require("@/assets/images/flags/germany.svg"),
        language: "gr",
        title: "Deutsche",
      },
      {
        flag: require("@/assets/images/flags/italy.svg"),
        language: "it",
        title: "italiana",
      },
      {
        flag: require("@/assets/images/flags/russia.svg"),
        language: "ru",
        title: "русский",
      },
      {
        flag: require("@/assets/images/flags/china.svg"),
        language: "ch",
        title: "中國人",
      },
      {
        flag: require("@/assets/images/flags/french.svg"),
        language: "fr",
        title: "Français",
      },
      {
        flag: require("@/assets/images/flags/ae.svg"),
        language: "ar",
        title: "Arabic",
      },
      ],
      lan: i18n.locale,
      text: null,
      flag: null,
      value: null,
      myVar: 1,
    };
  },
  components: {
    simplebar
  },

  methods: {
    ...layoutMethods,
    loadCurrentUser() {
      const rawUser = sessionStorage.getItem('authUser') || localStorage.getItem('user');

      try {
        this.currentUser = rawUser ? JSON.parse(rawUser) : null;
      } catch (error) {
        console.warn('Failed to load the authenticated user for the navigation bar:', error);
        this.currentUser = null;
      }
    },
    handleSystemConfigUpdated(event) {
      if (event?.detail && event.detail.system_logo !== undefined) {
        this.systemLogo = event.detail.system_logo || null;
      }
    },
    isCustomDropdown() {
      //Search bar
      var searchOptions = document.getElementById("search-close-options");
      var dropdown = document.getElementById("search-dropdown");
      var searchInput = document.getElementById("search-options");

      if (!searchInput || !searchOptions || !dropdown) {
        return;
      }

      searchInput.addEventListener("focus", () => {
        var inputLength = searchInput.value.length;
        if (inputLength > 0) {
          dropdown.classList.add("show");
          searchOptions.classList.remove("d-none");
        } else {
          dropdown.classList.remove("show");
          searchOptions.classList.add("d-none");
        }
      });

      searchInput.addEventListener("keyup", () => {
        var inputLength = searchInput.value.length;
        if (inputLength > 0) {
          dropdown.classList.add("show");
          searchOptions.classList.remove("d-none");
        } else {
          dropdown.classList.remove("show");
          searchOptions.classList.add("d-none");
        }
      });

      searchOptions.addEventListener("click", () => {
        searchInput.value = "";
        dropdown.classList.remove("show");
        searchOptions.classList.add("d-none");
      });

      document.body.addEventListener("click", (e) => {
        if (e.target && e.target.getAttribute && e.target.getAttribute("id") !== "search-options") {
          dropdown.classList.remove("show");
          searchOptions.classList.add("d-none");
        }
      });
    },
    toggleHamburgerMenu() {
      var windowSize = document.documentElement.clientWidth;
      let layoutType = document.documentElement.getAttribute("data-layout");

      document.documentElement.setAttribute("data-sidebar-visibility", "show");
      let visiblilityType = document.documentElement.getAttribute("data-sidebar-visibility");

      if (windowSize > 767) {
        const hamburger = document.querySelector(".hamburger-icon");
        if (hamburger) {
          hamburger.classList.toggle("open");
        }
      }

      //For collapse horizontal menu
      if (
        document.documentElement.getAttribute("data-layout") === "horizontal"
      ) {
        document.body.classList.contains("menu") ?
          document.body.classList.remove("menu") :
          document.body.classList.add("menu");
      }

      //For collapse vertical menu

      if (visiblilityType === "show" && (layoutType === "vertical" || layoutType === "semibox")) {
        if (windowSize < 1025 && windowSize > 767) {
          document.body.classList.remove("vertical-sidebar-enable");
          document.documentElement.getAttribute("data-sidebar-size") == "sm" ?
            document.documentElement.setAttribute("data-sidebar-size", "") :
            document.documentElement.setAttribute("data-sidebar-size", "sm");
        } else if (windowSize > 1025) {
          document.body.classList.remove("vertical-sidebar-enable");
          document.documentElement.getAttribute("data-sidebar-size") == "lg" ?
            document.documentElement.setAttribute("data-sidebar-size", "sm") :
            document.documentElement.setAttribute("data-sidebar-size", "lg");
        } else if (windowSize <= 767) {
          document.body.classList.add("vertical-sidebar-enable");
          document.documentElement.setAttribute("data-sidebar-size", "lg");
        }
      }

      //Two column menu
      if (document.documentElement.getAttribute("data-layout") == "twocolumn") {
        document.body.classList.contains("twocolumn-panel") ?
          document.body.classList.remove("twocolumn-panel") :
          document.body.classList.add("twocolumn-panel");
      }
    },
    toggleMenu() {
      this.$parent.toggleMenu();
    },
    toggleRightSidebar() {
      this.$parent.toggleRightSidebar();
    },
    initFullScreen() {
      document.body.classList.toggle("fullscreen-enable");
      if (
        !document.fullscreenElement &&
        /* alternative standard method */
        !document.mozFullScreenElement &&
        !document.webkitFullscreenElement
      ) {
        // current working methods
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
          document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
          document.documentElement.webkitRequestFullscreen(
            Element.ALLOW_KEYBOARD_INPUT
          );
        }
      } else {
        if (document.cancelFullScreen) {
          document.cancelFullScreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen();
        }
      }
    },
    setLanguage(locale, country, flag) {
      this.lan = locale;
      this.text = country;
      this.flag = flag;
      const langImg = document.getElementById("header-lang-img");
      if (langImg) {
        langImg.setAttribute("src", flag);
      }
      i18n.global.locale = locale;
    },
    toggleDarkMode() {

      if (document.documentElement.getAttribute("data-bs-theme") == "dark") {
        document.documentElement.setAttribute("data-bs-theme", "light");
      } else {
        document.documentElement.setAttribute("data-bs-theme", "dark");
      }

      const mode = document.documentElement.getAttribute("data-bs-theme")
      this.changeMode({
        mode: mode,
      });
    },
    async fetchNewTickets() {
      const token = localStorage.getItem('jwt') || localStorage.getItem('token');
      if (!token) {
        this.newTickets = [];
        return;
      }

      this.loadingNewTickets = true;
      try {
        const apiBase = process.env.VUE_APP_AUTHDOMAIN || 'http://localhost:8001/api';
        const response = await axios.get(`${apiBase}/tickets`, {
          params: { status: 'New', per_page: 5, sort_by: 'id', sort_direction: 'desc' },
          headers: { Authorization: `Bearer ${token}` },
        });
        this.newTickets = Array.isArray(response.data?.data) ? response.data.data.slice(0, 5) : [];
      } catch (error) {
        console.warn('Unable to load new tickets in the topbar:', error);
        this.newTickets = [];
      } finally {
        this.loadingNewTickets = false;
      }
    },
    async fetchNotifications() {
      const token = localStorage.getItem('jwt') || localStorage.getItem('token');
      if (!token) return;
      try {
        const apiBase = process.env.VUE_APP_AUTHDOMAIN || 'http://localhost:8001/api';
        const response = await axios.get(`${apiBase}/notifications`, { headers: { Authorization: `Bearer ${token}` } });
        this.notifications = response.data?.data || [];
        this.unreadNotifications = Number(response.data?.unread_count || 0);
      } catch (error) {
        console.warn('Unable to load notifications:', error);
      }
    },
    connectNotifications() {
      const token = localStorage.getItem('jwt') || localStorage.getItem('token');
      if (!token || !this.currentUser?.id || this.notificationEcho) return;
      const apiBase = process.env.VUE_APP_AUTHDOMAIN || 'http://localhost:8001/api';
      const apiOrigin = apiBase.replace(/\/api$/, '');
      window.Pusher = Pusher;
      this.notificationEcho = new Echo({
        broadcaster: 'reverb',
        key: process.env.VUE_APP_REVERB_APP_KEY || '6cs4kv9gbevi13pdhqoh',
        wsHost: process.env.VUE_APP_REVERB_HOST === 'localhost' ? '127.0.0.1' : (process.env.VUE_APP_REVERB_HOST || '127.0.0.1'),
        wsPort: Number(process.env.VUE_APP_REVERB_PORT || 8081),
        wssPort: Number(process.env.VUE_APP_REVERB_PORT || 8081),
        forceTLS: false,
        enabledTransports: ['ws', 'wss'],
        authEndpoint: `${apiOrigin}/broadcasting/auth`,
        auth: { headers: { Authorization: `Bearer ${token}` } },
      });
      this.notificationEcho.private(`App.Models.User.${this.currentUser.id}`)
        .notification((notification) => {
          this.notifications.unshift({ id: notification.id || `${Date.now()}`, data: notification, created_at: new Date().toISOString(), read_at: null });
          this.notifications = this.notifications.slice(0, 20);
          this.unreadNotifications += 1;
        });
    },
    isMessageNotification(notification) {
      return ['comment', 'chat'].includes(notification?.data?.kind);
    },
    messageNotifications() {
      return this.notifications.filter((notification) => this.isMessageNotification(notification));
    },
    unreadMessageCount() {
      return this.messageNotifications().filter((notification) => !notification.read_at).length;
    },
    async openNotification(notification) {
      const token = localStorage.getItem('jwt') || localStorage.getItem('token');
      const apiBase = process.env.VUE_APP_AUTHDOMAIN || 'http://localhost:8001/api';
      if (!notification.read_at && token) {
        await axios.post(`${apiBase}/notifications/${notification.id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } });
        notification.read_at = new Date().toISOString();
        this.unreadNotifications = Math.max(0, this.unreadNotifications - 1);
      }
      if (notification.data?.url) this.$router.push(notification.data.url);
    },
    formatTicketDate(value) {
      if (!value) return 'New ticket';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return 'New ticket';
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    },
    async fetchSystems() {
      this.loadingSystems = true;
      try {
        const apiBase = process.env.VUE_APP_AUTHDOMAIN || 'http://localhost:8001/api';
        const token = localStorage.getItem('jwt') || localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        let userSystems = [];
        try {
          const res = await axios.get(`${apiBase}/user/systems`, { headers });
          if (res.data && Array.isArray(res.data.data)) {
            userSystems = res.data.data;
          }
        } catch (e) {
          console.warn('Direct /user/systems call failed, attempting client fallback:', e);
        }

        if (userSystems.length > 0) {
          this.systems = userSystems;
        } else {
          // Client fallback from user assignments
          const rawUser = sessionStorage.getItem('authUser') || localStorage.getItem('user');
          let systemAssignments = [];
          let assignedCodes = [];
          if (rawUser) {
            try {
              const u = JSON.parse(rawUser);
              systemAssignments = (u.assignments || []).filter(a => a.reference === 'system');
              assignedCodes = systemAssignments.map(a => a.reference_code);
            } catch (err) {
              console.warn('Failed to parse user assignments for system access:', err);
              systemAssignments = [];
              assignedCodes = [];
            }
          }

          if (assignedCodes.length > 0) {
            const allRes = await axios.get(`${apiBase}/systems`, { headers });
            const allList = allRes.data.data || allRes.data || [];
            this.systems = allList
              .filter(s => assignedCodes.includes(s.code))
              .map(s => {
                const match = systemAssignments.find(a => a.reference_code === s.code);
                return {
                  ...s,
                  is_default: match ? Boolean(match.default) : false,
                };
              });
          } else {
            this.systems = [];
          }
        }
      } catch (err) {
        console.error('Failed to load systems in nav-bar:', err);
        this.systems = [];
      } finally {
        this.loadingSystems = false;
      }
    },
    getSystemIcon(code = '') {
      const c = String(code).toUpperCase();
      if (c.includes('TMS') || c.includes('TRANSPORT') || c.includes('LOGISTIC')) return 'ri-truck-line';
      if (c.includes('WMS') || c.includes('WAREHOUSE')) return 'ri-store-2-line';
      if (c.includes('CRM') || c.includes('CUSTOMER')) return 'ri-user-star-line';
      if (c.includes('HRIS') || c.includes('HR') || c.includes('EMPLOYEE')) return 'ri-team-line';
      if (c.includes('TKT') || c.includes('TICKET')) return 'ri-ticket-2-line';
      if (c.includes('LEGACY') || c.includes('BILLING') || c.includes('INVOICE')) return 'ri-archive-line';
      if (c.includes('FINANCE') || c.includes('ACC')) return 'ri-money-dollar-circle-line';
      return 'ri-server-line';
    },
    getSystemAvatarClass(code = '') {
      const c = String(code).toUpperCase();
      if (c.includes('TMS')) return 'bg-primary-subtle text-primary';
      if (c.includes('WMS')) return 'bg-success-subtle text-success';
      if (c.includes('CRM')) return 'bg-info-subtle text-info';
      if (c.includes('HRIS')) return 'bg-warning-subtle text-warning';
      if (c.includes('TKT')) return 'bg-danger-subtle text-danger';
      if (c.includes('LEGACY')) return 'bg-secondary-subtle text-secondary';
      return 'bg-primary-subtle text-primary';
    },
    scheduleTicketSearch() {
      clearTimeout(this.ticketSearchTimer);
      const query = this.ticketSearch.trim();
      this.ticketSearchOpen = Boolean(query);
      this.ticketSearchResults = [];
      if (!query) return;
      this.ticketSearchTimer = setTimeout(() => this.searchTickets(query), 250);
    },
    async searchTickets(query) {
      this.ticketSearchLoading = true;
      try {
        const apiBase = process.env.VUE_APP_AUTHDOMAIN || 'http://localhost:8001/api';
        const token = localStorage.getItem('jwt') || localStorage.getItem('token');
        const response = await axios.get(`${apiBase}/tickets`, {
          params: { search: query, per_page: 5 },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (this.ticketSearch.trim() === query) {
          this.ticketSearchResults = response.data?.data || [];
        }
      } catch (error) {
        console.error('Ticket search failed:', error);
        this.ticketSearchResults = [];
      } finally {
        this.ticketSearchLoading = false;
      }
    },
    clearTicketSearch() {
      clearTimeout(this.ticketSearchTimer);
      this.ticketSearch = '';
      this.ticketSearchResults = [];
      this.ticketSearchOpen = false;
    },
    viewTicketSearchResult(ticket) {
      this.clearTicketSearch();
      this.$router.push(`/tickets/details?id=${ticket.id}`);
    },
    viewAllTicketSearchResults() {
      const query = this.ticketSearch.trim();
      this.ticketSearchOpen = false;
      this.$router.push({ path: '/tickets/list', query: query ? { search: query } : {} });
    },
  },

  computed: {
    isAdmin() {
      return String(this.currentUser?.role || '').toLowerCase() === 'admin';
    },
    filteredSystems() {
      if (!this.systemSearch.trim()) return this.systems;
      const q = this.systemSearch.toLowerCase();
      return this.systems.filter((s) =>
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.code && s.code.toLowerCase().includes(q))
      );
    },
    currentUserName() {
      return this.currentUser?.displayName || this.currentUser?.fullname || this.currentUser?.name || this.currentUser?.username || this.currentUser?.email || 'User';
    },
    currentUserRole() {
      return this.currentUser?.role || 'User';
    },
    currentUserInitials() {
      const name = this.currentUserName.trim();
      const parts = name.split(/\s+/).filter(Boolean);

      if (parts.length > 1) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }

      return name.slice(0, 2).toUpperCase();
    },
  },
  mounted() {
    if (process.env.VUE_APP_I18N_LOCALE) {
      this.flag = process.env.VUE_APP_I18N_LOCALE;
      this.languages.forEach((item) => {
        if (item.language == this.flag) {
          const langImg = document.getElementById("header-lang-img");
          if (langImg) {
            langImg.setAttribute("src", item.flag);
          }
        }
      });
    }

    document.addEventListener("scroll", function () {
      var pageTopbar = document.getElementById("page-topbar");
      if (pageTopbar) {
        document.body.scrollTop >= 50 || document.documentElement.scrollTop >= 50 ? pageTopbar.classList.add(
          "topbar-shadow") : pageTopbar.classList.remove("topbar-shadow");
      }
    });
    if (document.getElementById("topnav-hamburger-icon"))
      document
        .getElementById("topnav-hamburger-icon")
        .addEventListener("click", this.toggleHamburgerMenu);

    this.loadCurrentUser();
    this.fetchNotifications();
    this.connectNotifications();
    window.addEventListener("notifications-updated", this.fetchNotifications);
    this.fetchSystems();
    this.fetchNewTickets();
    window.addEventListener("system-configuration-updated", this.handleSystemConfigUpdated);
    window.addEventListener("systems-updated", this.fetchSystems);
    window.addEventListener("menus-updated", this.loadCurrentUser);
    window.addEventListener("tickets-updated", this.fetchNewTickets);
    window.addEventListener("storage", this.loadCurrentUser);
  },
  unmounted() {
    clearTimeout(this.ticketSearchTimer);
    this.notificationEcho?.disconnect();
    window.removeEventListener("notifications-updated", this.fetchNotifications);
    window.removeEventListener("system-configuration-updated", this.handleSystemConfigUpdated);
    window.removeEventListener("systems-updated", this.fetchSystems);
    window.removeEventListener("menus-updated", this.loadCurrentUser);
    window.removeEventListener("tickets-updated", this.fetchNewTickets);
    window.removeEventListener("storage", this.loadCurrentUser);
  },
};
</script>

<template>
  <header id="page-topbar">
    <div class="layout-width">
      <div class="navbar-header">
        <div class="d-flex">
          <!-- LOGO -->
          <div class="navbar-brand-box horizontal-logo">
            <router-link to="/" class="logo logo-dark">
              <span class="logo-sm">
                <img v-if="systemLogo" :src="systemLogo" alt="Logo" class="sidebar-logo-sm" />
                <img v-else src="@/assets/images/logo-sm.png" alt="" height="22" />
              </span>
              <span class="logo-lg">
                <img v-if="systemLogo" :src="systemLogo" alt="Logo" class="sidebar-logo-lg" />
                <img v-else src="@/assets/images/logo-dark.png" alt="" height="17" />
              </span>
            </router-link>

            <router-link to="/" class="logo logo-light">
              <span class="logo-sm">
                <img v-if="systemLogo" :src="systemLogo" alt="Logo" class="sidebar-logo-sm" />
                <img v-else src="@/assets/images/logo-sm.png" alt="" height="22" />
              </span>
              <span class="logo-lg">
                <img v-if="systemLogo" :src="systemLogo" alt="Logo" class="sidebar-logo-lg" />
                <img v-else src="@/assets/images/logo-light.png" alt="" height="17" />
              </span>
            </router-link>
          </div>

          <button type="button" class="btn btn-sm px-3 fs-16 header-item vertical-menu-btn topnav-hamburger"
            id="topnav-hamburger-icon">
            <span class="hamburger-icon">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>

          <!-- App Search-->
          <form class="app-search d-none d-md-block" @submit.prevent="viewAllTicketSearchResults">
            <div class="position-relative">
              <input v-model="ticketSearch" type="text" class="form-control" placeholder="Search tickets..." autocomplete="off" id="search-options" @input="scheduleTicketSearch" @focus="ticketSearchOpen = Boolean(ticketSearch.trim())" />
              <span class="mdi mdi-magnify search-widget-icon"></span>
            </div>
            <div class="dropdown-menu dropdown-menu-lg" :class="{ show: ticketSearchOpen }" id="search-dropdown">
              <simplebar data-simplebar style="max-height: 320px">
                <div class="dropdown-header">
                  <h6 class="text-overflow text-muted mb-0 text-uppercase">
                    Ticket results
                  </h6>
                </div>
                <div v-if="ticketSearchLoading" class="dropdown-item text-muted fs-12 py-3"><span class="spinner-border spinner-border-sm me-2" role="status"></span>Searching tickets…</div>
                <button v-for="ticket in ticketSearchResults" :key="ticket.id" type="button" class="dropdown-item notify-item text-wrap py-2" @mousedown.prevent="viewTicketSearchResult(ticket)"><div class="d-flex align-items-start gap-2"><span class="avatar-xs flex-shrink-0"><span class="avatar-title rounded-circle bg-primary-subtle text-primary"><i class="ri-ticket-2-line"></i></span></span><div class="flex-grow-1 min-w-0"><strong class="d-block fs-12 text-primary">{{ ticket.ref_no }}</strong><span class="d-block text-truncate fs-13">{{ ticket.subject }}</span><small class="d-block text-muted text-truncate">{{ ticket.summary }}</small></div></div></button>
                <div v-if="!ticketSearchLoading && !ticketSearchResults.length" class="dropdown-item text-muted fs-12 py-3">No tickets found by reference, subject, or summary.</div>
              </simplebar>

              <div class="text-center pt-3 pb-1">
                <button type="button" class="btn btn-primary btn-sm" @mousedown.prevent="viewAllTicketSearchResults">View all ticket results <i class="ri-arrow-right-line ms-1"></i></button>
              </div>
            </div>
          </form>
        </div>

        <div class="d-flex align-items-center">
          <BDropdown class="dropdown d-md-none topbar-head-dropdown header-item" variant="ghost-secondary" dropstart
            :offset="{ alignmentAxis: 55, crossAxis: 15, mainAxis: 0 }"
            toggle-class="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle show  arrow-none"
            menu-class="dropdown-menu-lg dropdown-menu-end p-0">
            <template #button-content>
              <i class="bx bx-search fs-22"></i>
            </template>
            <BDropdownItem aria-labelledby="page-header-search-dropdown">
              <form class="p-3">
                <div class="form-group m-0">
                  <div class="input-group">
                    <input type="text" class="form-control" placeholder="Search ..." aria-label="Recipient's username" />
                    <BButton variant="primary" type="submit">
                      <i class="mdi mdi-magnify"></i>
                    </BButton>
                  </div>
                </div>
              </form>
            </BDropdownItem>
          </BDropdown>

          <BDropdown class="dropdown" variant="ghost-secondary" dropstart
            :offset="{ alignmentAxis: 55, crossAxis: 15, mainAxis: -50 }"
            toggle-class="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle arrow-none"
            menu-class="dropdown-menu-end">
            <template #button-content> <img id="header-lang-img" src="@/assets/images/flags/us.svg" alt="Header Language"
                height="20" class="rounded">
            </template>
            <BLink href="javascript:void(0);" class="dropdown-item notify-item language py-2"
              v-for="(entry, key) in languages" :data-lang="entry.language" :title="entry.title"
              @click="setLanguage(entry.language, entry.title, entry.flag)" :key="key">
              <img :src="entry.flag" alt="user-image" class="me-2 rounded" height="18">
              <span class="align-middle">{{ entry.title }}</span>
            </BLink>
          </BDropdown>

          <BDropdown class="dropdown" variant="ghost-secondary" dropstart
            :offset="{ alignmentAxis: 57, crossAxis: 0, mainAxis: -42 }"
            toggle-class="btn-icon btn-topbar rounded-circle mode-layout ms-1 arrow-none"
            menu-class="p-0 dropdown-menu-end dropdown-menu-lg">
            <template #button-content>
              <i class="bx bx-category-alt fs-22"></i>
            </template>
            <div class="p-3 border-top-0 dropdown-head border-start-0 border-end-0 border-dashed border">
              <BRow class="align-items-center">
                <BCol>
                  <div class="d-flex align-items-center gap-2">
                    <h6 class="m-0 fw-semibold fs-15">System Access</h6>
                    <span v-if="systems.length" class="badge bg-primary-subtle text-primary rounded-pill fs-11">
                      {{ systems.length }}
                    </span>
                  </div>
                </BCol>
                <BCol v-if="isAdmin" cols="auto">
                  <router-link to="/settings/system" class="btn btn-sm btn-soft-primary">
                    Manage Systems
                    <i class="ri-arrow-right-s-line align-middle"></i>
                  </router-link>
                </BCol>
              </BRow>
            </div>

            <!-- Optional filter input if > 4 systems -->
            <div v-if="systems.length > 4" class="px-3 pt-2 pb-1 border-bottom border-light">
              <div class="position-relative">
                <input
                  v-model="systemSearch"
                  type="text"
                  class="form-control form-control-sm ps-4"
                  placeholder="Filter accessible systems..."
                />
                <i class="ri-search-line position-absolute top-50 start-0 translate-middle-y ms-2 text-muted fs-12"></i>
              </div>
            </div>

            <!-- Loading state -->
            <div v-if="loadingSystems" class="p-4 text-center">
              <div class="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
              <p class="fs-12 text-muted mb-0">Checking system access...</p>
            </div>

            <!-- Empty state -->
            <div v-else-if="filteredSystems.length === 0" class="p-4 text-center text-muted">
              <i class="ri-shield-keyhole-line fs-28 d-block mb-2 text-warning"></i>
              <h6 class="fs-13 fw-semibold mb-1">No System Access Assigned</h6>
              <p class="fs-11 text-muted mb-0">Contact your administrator to grant access to system modules.</p>
            </div>

            <!-- Systems Grid -->
            <simplebar v-else style="max-height: 310px;" class="p-2">
              <BRow class="g-1">
                <BCol cols="6" v-for="system in filteredSystems" :key="system.id">
                  <router-link
                    :to="{ path: '/tickets', query: { system: system.code } }"
                    class="dropdown-icon-item position-relative text-decoration-none p-2 rounded d-flex flex-column align-items-center justify-content-center h-100"
                    :title="`${system.name} (${system.code})`"
                  >
                    <!-- Status & Default Badges -->
                    <div class="position-absolute top-0 end-0 mt-1 me-2 d-flex align-items-center gap-1">
                      <span
                        v-if="system.is_default"
                        class="badge bg-warning-subtle text-warning px-1 py-0 rounded"
                        style="font-size: 8px; line-height: 1.1;"
                        title="Default Assigned System"
                      >
                        DEFAULT
                      </span>
                      <span
                        class="badge rounded-circle p-0"
                        :class="system.status === 'active' ? 'bg-success' : 'bg-secondary'"
                        style="width: 7px; height: 7px;"
                        :title="system.status"
                      ></span>
                    </div>

                    <!-- Icon / Badge -->
                    <div class="avatar-xs mb-1">
                      <span
                        class="avatar-title rounded-3 fs-16 shadow-sm"
                        :class="getSystemAvatarClass(system.code)"
                      >
                        <i :class="getSystemIcon(system.code)"></i>
                      </span>
                    </div>

                    <!-- System Code -->
                    <span class="fw-semibold text-body fs-12 text-truncate w-100 text-center mb-0">
                      {{ system.code }}
                    </span>
                    <!-- System Name -->
                    <span
                      class="text-muted text-truncate w-100 text-center"
                      style="font-size: 11px; line-height: 1.2;"
                    >
                      {{ system.name }}
                    </span>
                  </router-link>
                </BCol>
              </BRow>
            </simplebar>

            <div v-if="isAdmin" class="p-2 border-top text-center bg-light-subtle">
              <router-link to="/settings/users" class="text-primary fs-12 fw-medium text-decoration-none">
                <i class="ri-user-settings-line me-1 align-middle"></i> View My Assigned Roles & Entities
              </router-link>
            </div>
          </BDropdown>

          <BDropdown variant="ghost-secondary" dropstart :offset="{ alignmentAxis: 57, crossAxis: 0, mainAxis: -42 }"
            class="ms-1 dropdown" toggle-class="btn-icon btn-topbar rounded-circle mode-layout arrow-none"
            menu-class="dropdown-menu-xl dropdown-menu-end p-0" auto-close="outside" @show="fetchNewTickets">
            <template #button-content>
              <i class="ri-ticket-2-line fs-22"></i>
              <span v-if="newTickets.length" class="position-absolute topbar-badge fs-10 translate-middle badge rounded-pill bg-info">{{ newTickets.length }}</span>
            </template>

            <div class="p-3 border-top-0 border-start-0 dropdown-head border-end-0 border-dashed border dropdown-menu-xl">
              <BRow class="align-items-center">
                <BCol><h6 class="m-0 fs-16 fw-semibold">New Tickets</h6></BCol>
                <BCol cols="auto"><BBadge variant="info-subtle" class="bg-info-subtle text-info fs-13">{{ newTickets.length }} New</BBadge></BCol>
              </BRow>
            </div>
            <simplebar data-simplebar style="max-height: 300px">
              <div v-if="loadingNewTickets" class="p-4 text-center text-muted"><span class="spinner-border spinner-border-sm me-2"></span>Loading tickets…</div>
              <div v-else-if="!newTickets.length" class="p-4 text-center text-muted">
                <div class="avatar-md mx-auto mb-3"><span class="avatar-title bg-info-subtle text-info fs-28 rounded-circle"><i class="ri-ticket-2-line"></i></span></div>
                <h6 class="mb-1">No new tickets</h6>
                <p class="mb-0 fs-12">You are all caught up.</p>
              </div>
              <router-link v-else v-for="ticket in newTickets" :key="ticket.id" :to="`/tickets/details?id=${ticket.id}`" class="d-flex align-items-center gap-2 dropdown-item text-wrap px-3 py-2">
                <span class="avatar-sm flex-shrink-0"><span class="avatar-title rounded-circle bg-primary-subtle text-primary"><i class="ri-ticket-2-line"></i></span></span>
                <span class="flex-grow-1 min-w-0">
                  <span class="d-flex justify-content-between gap-2"><strong class="fs-12 text-primary">{{ ticket.ref_no || `#${ticket.id}` }}</strong><span class="badge bg-info-subtle text-info">NEW</span></span>
                  <span class="d-block text-truncate text-body fs-13" :title="ticket.subject">{{ ticket.subject }}</span>
                  <small class="text-muted">{{ formatTicketDate(ticket.created_at || ticket.date_encountered) }}</small>
                </span>
              </router-link>
            </simplebar>
            <div class="p-2 border-top text-center bg-light-subtle">
              <router-link to="/tickets/list" class="text-primary fs-12 fw-medium text-decoration-none"><i class="ri-list-check-2 me-1"></i>View All Tickets</router-link>
            </div>
          </BDropdown>

          <div class="ms-1 header-item d-none d-sm-flex">
            <BButton type="button" variant="ghost-secondary" class="btn-icon btn-topbar rounded-circle"
              data-toggle="fullscreen" @click="initFullScreen">
              <i class="bx bx-fullscreen fs-22"></i>
            </BButton>
          </div>

          <div class="ms-1 header-item d-none d-sm-flex">
            <BButton type="button" variant="ghost-secondary" class="btn-icon btn-topbar rounded-circle light-dark-mode"
              @click="toggleDarkMode">
              <i class="bx bx-moon fs-22"></i>
            </BButton>
          </div>

          <BDropdown variant="ghost-dark" dropstart class="ms-1 dropdown"
            :offset="{ alignmentAxis: 57, crossAxis: 0, mainAxis: -42 }"
            toggle-class="btn-icon btn-topbar rounded-circle arrow-none" id="page-header-notifications-dropdown"
            menu-class="dropdown-menu-lg dropdown-menu-end p-0" auto-close="outside">
            <template #button-content>
              <i class='bx bx-bell fs-22'></i>
              <span v-if="unreadNotifications" class="position-absolute topbar-badge fs-10 translate-middle badge rounded-pill bg-danger"><span
                  class="notification-badge">{{ unreadNotifications }}</span><span class="visually-hidden">unread
                  messages
                </span>
              </span>
            </template>
            <div class="dropdown-head bg-primary bg-pattern rounded-top dropdown-menu-lg">
              <div class="p-3">
                <BRow class="align-items-center">
                  <BCol>
                    <h6 class="m-0 fs-16 fw-semibold text-white">
                      Notifications
                    </h6>
                  </BCol>
                  <BCol cols="auto" class="dropdown-tabs">
                    <BBadge variant="light-subtle" class="bg-light-subtle text-body fs-13"> {{ unreadNotifications }} New</BBadge>
                  </BCol>
                </BRow>
              </div>
            </div>
            <BTabs nav-class="dropdown-tabs nav-tab-custom bg-primary px-2 pt-2">
              <BTab :title="`All (${notifications.length})`" class="tab-pane fade py-2 ps-2 show" id="all-noti-tab" role="tabpanel">
                <simplebar data-simplebar style="max-height: 300px" class="pe-2">
                  <BLink v-for="notification in notifications" :key="notification.id" href="#" class="text-reset notification-item d-block dropdown-item position-relative" @click.prevent="openNotification(notification)">
                    <div class="d-flex align-items-start"><div class="avatar-xs me-3 flex-shrink-0"><span class="avatar-title bg-primary-subtle text-primary rounded-circle"><i class="ri-ticket-2-line"></i></span></div><div class="flex-grow-1"><h6 class="mt-0 mb-1 fs-13 fw-semibold">{{ notification.data?.subject || notification.data?.ref_no || 'Ticket update' }}</h6><p class="mb-1 fs-13 text-muted">{{ notification.data?.message }}</p><small class="text-muted"><i class="mdi mdi-clock-outline"></i> {{ formatTicketDate(notification.created_at) }}</small></div><span v-if="!notification.read_at" class="badge bg-primary-subtle text-primary">New</span></div>
                  </BLink>
                  <div v-if="!notifications.length" class="text-center text-muted py-4">No notifications yet</div>
                  <div v-if="false">
                  <div class="text-reset notification-item d-block dropdown-item position-relative">
                    <div class="d-flex">
                      <div class="avatar-xs me-3 flex-shrink-0">
                        <span class="avatar-title bg-info-subtle text-info rounded-circle fs-16">
                          <i class="bx bx-badge-check"></i>
                        </span>
                      </div>
                      <div class="flex-grow-1">
                        <BLink href="#!" class="stretched-link">
                          <h6 class="mt-0 mb-2 lh-base">
                            Your <b>Elite</b> author Graphic Optimization
                            <span class="text-secondary">reward</span> is
                            ready!
                          </h6>
                        </BLink>
                        <p class="mb-0 fs-11 fw-medium text-uppercase text-muted">
                          <span><i class="mdi mdi-clock-outline"></i> Just 30 sec ago</span>
                        </p>
                      </div>
                      <div class="px-2 fs-15">
                        <input class="form-check-input" type="checkbox" />
                      </div>
                    </div>
                  </div>

                  <div class="text-reset notification-item d-block dropdown-item position-relative">
                    <div class="d-flex">
                      <img src="@/assets/images/users/avatar-2.jpg" class="me-3 rounded-circle avatar-xs flex-shrink-0"
                        alt="user-pic" />
                      <div class="flex-grow-1">
                        <BLink href="#!" class="stretched-link">
                          <h6 class="mt-0 mb-1 fs-13 fw-semibold">
                            Angela Bernier
                          </h6>
                        </BLink>
                        <div class="fs-13 text-muted">
                          <p class="mb-1">
                            Answered to your comment on the cash flow forecast's graph 🔔.
                          </p>
                        </div>
                        <p class="mb-0 fs-11 fw-medium text-uppercase text-muted">
                          <span><i class="mdi mdi-clock-outline"></i> 48 min ago</span>
                        </p>
                      </div>
                      <div class="px-2 fs-15">
                        <input class="form-check-input" type="checkbox" />
                      </div>
                    </div>
                  </div>

                  <div class="text-reset notification-item d-block dropdown-item position-relative">
                    <div class="d-flex">
                      <div class="avatar-xs me-3 flex-shrink-0">
                        <span class="avatar-title bg-danger-subtle text-danger rounded-circle fs-16">
                          <i class="bx bx-message-square-dots"></i>
                        </span>
                      </div>
                      <div class="flex-grow-1">
                        <BLink href="#!" class="stretched-link">
                          <h6 class="mt-0 mb-2 fs-13 lh-base">
                            You have received <b class="text-success">20</b> new messages in the conversation
                          </h6>
                        </BLink>
                        <p class="mb-0 fs-11 fw-medium text-uppercase text-muted">
                          <span><i class="mdi mdi-clock-outline"></i> 2 hrs
                            ago</span>
                        </p>
                      </div>
                      <div class="px-2 fs-15">
                        <input class="form-check-input" type="checkbox" />
                      </div>
                    </div>
                  </div>

                  <div class="text-reset notification-item d-block dropdown-item position-relative">
                    <div class="d-flex">
                      <img src="@/assets/images/users/avatar-8.jpg" class="me-3 rounded-circle avatar-xs flex-shrink-0"
                        alt="user-pic" />
                      <div class="flex-grow-1">
                        <BLink href="#!" class="stretched-link">
                          <h6 class="mt-0 mb-1 fs-13 fw-semibold">
                            Maureen Gibson
                          </h6>
                        </BLink>
                        <div class="fs-13 text-muted">
                          <p class="mb-1">
                            We talked about a project on linkedin.
                          </p>
                        </div>
                        <p class="mb-0 fs-11 fw-medium text-uppercase text-muted">
                          <span><i class="mdi mdi-clock-outline"></i> 4 hrs
                            ago</span>
                        </p>
                      </div>
                      <div class="px-2 fs-15">
                        <input class="form-check-input" type="checkbox" />
                      </div>
                    </div>
                  </div>

                  <div class="my-3 text-center">
                    <BButton type="button" variant="soft-success">
                      View All Notifications
                      <i class="ri-arrow-right-line align-middle"></i>
                    </BButton>
                  </div>
                  </div>
                </simplebar>
              </BTab>

              <BTab :title="`Messages (${unreadMessageCount()})`" class="tab-pane fade py-2 ps-2" id="messages-tab" role="tabpanel"
                aria-labelledby="messages-tab">
                <simplebar data-simplebar style="max-height: 300px" class="pe-2">
                  <BLink v-for="notification in messageNotifications()" :key="notification.id" href="#" class="text-reset notification-item d-block dropdown-item position-relative" @click.prevent="openNotification(notification)">
                    <div class="d-flex align-items-start"><div class="avatar-xs me-3 flex-shrink-0"><span class="avatar-title bg-info-subtle text-info rounded-circle"><i class="ri-chat-3-line"></i></span></div><div class="flex-grow-1"><h6 class="mb-1 fs-13" :class="notification.read_at ? 'fw-medium' : 'fw-bold'">{{ notification.data?.subject || notification.data?.ref_no }}</h6><p class="mb-1 fs-13 text-muted">{{ notification.data?.message }}</p><small class="text-muted">{{ formatTicketDate(notification.created_at) }}</small></div><span v-if="!notification.read_at" class="badge bg-danger rounded-pill ms-2">New</span></div>
                  </BLink>
                  <div v-if="!messageNotifications().length" class="text-center text-muted py-4">No messages yet</div>
                  <div v-if="false">
                  <div class="text-reset notification-item d-block dropdown-item">
                    <div class="d-flex">
                      <img src="@/assets/images/users/avatar-3.jpg" class="me-3 rounded-circle avatar-xs"
                        alt="user-pic" />
                      <div class="flex-grow-1">
                        <BLink href="#!" class="stretched-link">
                          <h6 class="mt-0 mb-1 fs-13 fw-semibold">
                            James Lemire
                          </h6>
                        </BLink>
                        <div class="fs-13 text-muted">
                          <p class="mb-1">
                            We talked about a project on linkedin.
                          </p>
                        </div>
                        <p class="mb-0 fs-11 fw-medium text-uppercase text-muted">
                          <span><i class="mdi mdi-clock-outline"></i> 30 min ago</span>
                        </p>
                      </div>
                      <div class="px-2 fs-15">
                        <input class="form-check-input" type="checkbox" />
                      </div>
                    </div>
                  </div>

                  <div class="text-reset notification-item d-block dropdown-item">
                    <div class="d-flex">
                      <img src="@/assets/images/users/avatar-2.jpg" class="me-3 rounded-circle avatar-xs"
                        alt="user-pic" />
                      <div class="flex-grow-1">
                        <BLink href="#!" class="stretched-link">
                          <h6 class="mt-0 mb-1 fs-13 fw-semibold">
                            Angela Bernier
                          </h6>
                        </BLink>
                        <div class="fs-13 text-muted">
                          <p class="mb-1">
                            Answered to your comment on the cash flow
                            forecast's graph 🔔.
                          </p>
                        </div>
                        <p class="mb-0 fs-11 fw-medium text-uppercase text-muted">
                          <span><i class="mdi mdi-clock-outline"></i> 2 hrs
                            ago</span>
                        </p>
                      </div>
                      <div class="px-2 fs-15">
                        <input class="form-check-input" type="checkbox" />
                      </div>
                    </div>
                  </div>

                  <div class="text-reset notification-item d-block dropdown-item">
                    <div class="d-flex">
                      <img src="@/assets/images/users/avatar-6.jpg" class="me-3 rounded-circle avatar-xs"
                        alt="user-pic" />
                      <div class="flex-grow-1">
                        <BLink href="#!" class="stretched-link">
                          <h6 class="mt-0 mb-1 fs-13 fw-semibold">
                            Kenneth Brown
                          </h6>
                        </BLink>
                        <div class="fs-13 text-muted">
                          <p class="mb-1">
                            Mentionned you in his comment on 📃 invoice
                            #12501.
                          </p>
                        </div>
                        <p class="mb-0 fs-11 fw-medium text-uppercase text-muted">
                          <span><i class="mdi mdi-clock-outline"></i> 10 hrs
                            ago</span>
                        </p>
                      </div>
                      <div class="px-2 fs-15">
                        <input class="form-check-input" type="checkbox" />
                      </div>
                    </div>
                  </div>

                  <div class="text-reset notification-item d-block dropdown-item">
                    <div class="d-flex">
                      <img src="@/assets/images/users/avatar-8.jpg" class="me-3 rounded-circle avatar-xs"
                        alt="user-pic" />
                      <div class="flex-grow-1">
                        <BLink href="#!" class="stretched-link">
                          <h6 class="mt-0 mb-1 fs-13 fw-semibold">
                            Maureen Gibson
                          </h6>
                        </BLink>
                        <div class="fs-13 text-muted">
                          <p class="mb-1">
                            We talked about a project on linkedin.
                          </p>
                        </div>
                        <p class="mb-0 fs-11 fw-medium text-uppercase text-muted">
                          <span><i class="mdi mdi-clock-outline"></i> 3 days
                            ago</span>
                        </p>
                      </div>
                      <div class="px-2 fs-15">
                        <input class="form-check-input" type="checkbox" />
                      </div>
                    </div>
                  </div>

                  <div class="my-3 text-center">
                    <BButton type="button" variant="soft-success">
                      View All Messages
                      <i class="ri-arrow-right-line align-middle"></i>
                    </BButton>
                  </div>
                  </div>
                </simplebar>
              </BTab>

              <BTab :title="`Alerts (${notifications.filter(notification => !isMessageNotification(notification)).length})`" class="p-4">
                <simplebar data-simplebar style="max-height: 300px" class="pe-2">
                  <BLink v-for="notification in notifications.filter(item => !isMessageNotification(item))" :key="notification.id" href="#" class="text-reset notification-item d-block dropdown-item position-relative" @click.prevent="openNotification(notification)">
                    <div class="d-flex align-items-start"><div class="avatar-xs me-3 flex-shrink-0"><span class="avatar-title bg-warning-subtle text-warning rounded-circle"><i class="ri-notification-3-line"></i></span></div><div class="flex-grow-1"><h6 class="mb-1 fs-13 fw-semibold">{{ notification.data?.subject || notification.data?.ref_no }}</h6><p class="mb-1 fs-13 text-muted">{{ notification.data?.message }}</p><small class="text-muted">{{ formatTicketDate(notification.created_at) }}</small></div><span v-if="!notification.read_at" class="badge bg-primary-subtle text-primary">New</span></div>
                  </BLink>
                  <div v-if="!notifications.some(item => !isMessageNotification(item))" class="w-25 w-sm-50 pt-3 mx-auto">
                    <img src="@/assets/images/svg/bell.svg" class="img-fluid" alt="user-pic" />
                  </div>
                  <div v-if="!notifications.some(item => !isMessageNotification(item))" class="text-center pb-5 mt-2">
                    <h6 class="fs-18 fw-semibold lh-base">
                      Hey! You have no any notifications
                    </h6>
                  </div>
                </simplebar>
              </BTab>
            </BTabs>
            <simplebar v-if="false" data-simplebar style="max-height: 330px" class="p-2">
              <BLink v-for="notification in notifications" :key="notification.id" href="#" class="text-reset notification-item d-block dropdown-item position-relative" @click.prevent="openNotification(notification)">
                <div class="d-flex align-items-start">
                  <div class="avatar-xs me-3 flex-shrink-0"><span class="avatar-title bg-primary-subtle text-primary rounded-circle"><i class="ri-ticket-2-line"></i></span></div>
                  <div class="flex-grow-1"><h6 class="mb-1 fs-13 fw-semibold">{{ notification.data?.subject || notification.data?.ref_no || 'Ticket update' }}</h6><p class="mb-1 fs-13 text-muted">{{ notification.data?.message }}</p><small class="text-muted"><i class="mdi mdi-clock-outline"></i> {{ formatTicketDate(notification.created_at) }}</small></div>
                  <span v-if="!notification.read_at" class="badge bg-primary-subtle text-primary">New</span>
                </div>
              </BLink>
              <div v-if="!notifications.length" class="text-center text-muted py-4"><i class="ri-notification-off-line fs-24 d-block mb-2"></i>No notifications yet</div>
            </simplebar>
          </BDropdown>

          <BDropdown variant="link" class="ms-sm-3 header-item topbar-user" toggle-class="rounded-circle arrow-none"
            menu-class="dropdown-menu-end" :offset="{ alignmentAxis: -14, crossAxis: 0, mainAxis: 0 }">
            <template #button-content>
              <span class="d-flex align-items-center">
                <span class="rounded-circle header-profile-user avatar-initials" :title="currentUserName">
                  {{ currentUserInitials }}
                </span>
                <span class="text-start ms-xl-2">
                  <span class="d-none d-xl-inline-block ms-1 fw-semibold user-name-text">{{ currentUserName }}</span>
                  <span class="d-none d-xl-block ms-1 fs-12 user-name-sub-text">{{ currentUserRole }}</span>
                </span>
              </span>
            </template>
            <h6 class="dropdown-header">Welcome {{ currentUserName }}!</h6>
            <router-link class="dropdown-item" to="/pages/profile"><i
                class="mdi mdi-account-circle text-muted fs-16 align-middle me-1"></i>
              <span class="align-middle"> Profile</span>
            </router-link>
            <router-link class="dropdown-item" to="/chat">
              <i class=" mdi mdi-message-text-outline text-muted fs-16 align-middle me-1"></i>
              <span class="align-middle"> Messages</span>
            </router-link>
            <div class="dropdown-divider"></div>
            <router-link class="dropdown-item" to="/pages/profile-setting">
              <i class="mdi mdi-cog-outline text-muted fs-16 align-middle me-1"></i>
              <span class="align-middle"> Settings</span>
            </router-link>
            <router-link class="dropdown-item" to="/auth/lockscreen-basic"><i
                class="mdi mdi-lock text-muted fs-16 align-middle me-1"></i>
              <span class="align-middle"> Lock screen</span>
            </router-link>
            <router-link class="dropdown-item" to="/logout"><i class="mdi mdi-logout text-muted fs-16 align-middle me-1"></i>
              <span class="align-middle" data-key="t-logout"> Logout</span>
            </router-link>
          </BDropdown>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.sidebar-logo-lg {
  max-height: 28px;
  max-width: 140px;
  object-fit: contain;
  vertical-align: middle;
}
.sidebar-logo-sm {
  max-height: 22px;
  max-width: 26px;
  object-fit: contain;
  vertical-align: middle;
}
.avatar-initials {
  align-items: center;
  background-color: var(--vz-primary-bg-subtle);
  color: var(--vz-primary);
  display: inline-flex;
  font-size: 0.7rem;
  font-weight: 700;
  justify-content: center;
}
</style>
