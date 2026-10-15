<template>
  <div id="app-root">
    <router-view></router-view>
  </div>
</template>

<script>
import { isMaintenanceModeActive } from '@/helpers/themeConfig';

export default {
  name: 'App',
  data() {
    return {
      isMaintenanceMode: isMaintenanceModeActive(),
      isAdmin: false,
    };
  },
  watch: {
    $route() {
      this.checkUserRole();
      this.checkMaintenance();
    },
  },
  mounted() {
    this.checkUserRole();
    this.checkMaintenance();
    window.addEventListener('system-configuration-updated', this.handleConfigUpdated);
  },
  unmounted() {
    window.removeEventListener('system-configuration-updated', this.handleConfigUpdated);
  },
  methods: {
    checkUserRole() {
      try {
        const raw = sessionStorage.getItem('authUser') || localStorage.getItem('user');
        if (raw) {
          const u = JSON.parse(raw);
          this.isAdmin = u.role === 'admin';
        } else {
          this.isAdmin = false;
        }
      } catch (e) {
        this.isAdmin = false;
      }
    },
    checkMaintenance() {
      this.isMaintenanceMode = isMaintenanceModeActive();
    },
    handleConfigUpdated(event) {
      if (event?.detail && event.detail.maintenance_mode !== undefined) {
        this.isMaintenanceMode = Boolean(event.detail.maintenance_mode);
        this.checkUserRole();
        if (this.isMaintenanceMode && !this.isAdmin) {
          const currentPath = this.$route.path;
          if (currentPath !== '/pages/maintenance' && currentPath !== '/maintenance') {
            this.$router.push('/pages/maintenance');
          }
        }
      }
    },
  },
};
</script>

<style>
</style>
