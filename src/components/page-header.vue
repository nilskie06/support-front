<script>
import { isMaintenanceModeActive, getSystemConfiguration, fetchAndApplySystemConfiguration } from "@/helpers/themeConfig";

export default {
  name: "PageHeader",
  props: {
    title: {
      type: String,
      default: "",
    },
    pageTitle: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      isMaintenanceMode: isMaintenanceModeActive(),
      isAdmin: false,
      maintenanceMessage: "",
    };
  },
  computed: {
    maintenanceNotice() {
      if (this.maintenanceMessage) {
        return this.maintenanceMessage;
      }
      if (this.isAdmin) {
        return "Non-admin user access is currently redirected to the Maintenance notice.";
      }
      return "The system is currently operating in maintenance mode. Some features may be restricted.";
    },
  },
  mounted() {
    this.checkUserRole();
    this.checkMaintenance();
    window.addEventListener("system-configuration-updated", this.handleConfigUpdated);
    window.addEventListener("storage", this.handleStorageChange);
  },
  beforeUnmount() {
    window.removeEventListener("system-configuration-updated", this.handleConfigUpdated);
    window.removeEventListener("storage", this.handleStorageChange);
  },
  methods: {
    checkUserRole() {
      try {
        const raw = sessionStorage.getItem("authUser") || localStorage.getItem("user");
        if (raw) {
          const u = JSON.parse(raw);
          this.isAdmin = u.role === "admin";
        } else {
          this.isAdmin = false;
        }
      } catch (e) {
        this.isAdmin = false;
      }
    },
    async checkMaintenance() {
      this.isMaintenanceMode = isMaintenanceModeActive();
      const config = getSystemConfiguration();
      if (!config) {
        const fetched = await fetchAndApplySystemConfiguration();
        if (fetched) {
          this.isMaintenanceMode = Boolean(fetched.maintenance_mode);
          this.maintenanceMessage = fetched.maintenance_message || "";
        }
      } else {
        this.maintenanceMessage = config.maintenance_message || "";
      }
    },
    handleConfigUpdated(event) {
      if (event?.detail) {
        if (event.detail.maintenance_mode !== undefined) {
          this.isMaintenanceMode = Boolean(event.detail.maintenance_mode);
        }
        if (event.detail.maintenance_message !== undefined) {
          this.maintenanceMessage = event.detail.maintenance_message || "";
        }
      } else {
        this.checkMaintenance();
      }
      this.checkUserRole();
    },
    handleStorageChange(event) {
      if (event.key === "velzon_system_general_config" || event.key === "user") {
        this.checkMaintenance();
        this.checkUserRole();
      }
    },
  },
};
</script>

<template>
  <BRow>
    <BCol cols="12">
      <div class="page-title-box d-sm-flex align-items-center justify-content-between bg-transparent">
        <h4 class="mb-sm-0">{{ title }}</h4>
        <div class="page-title-right">
          <ol class="breadcrumb m-0">
            <li class="breadcrumb-item">
              <BLink href="javascript: void(0);">{{ pageTitle }}</BLink>
            </li>
            <li class="breadcrumb-item active">{{ title }}</li>
          </ol>
        </div>
      </div>

      <!-- Maintenance Message Banner below page-header -->
      <div
        v-if="isMaintenanceMode"
        class="maintenance-mode-banner d-flex flex-wrap align-items-center justify-content-between px-3 py-2 bg-warning text-dark rounded mb-3 fs-12 fw-semibold shadow-sm"
        role="alert"
      >
        <div class="d-flex align-items-center gap-2">
          <i class="ri-tools-fill fs-14"></i>
          <span>
            <strong>MAINTENANCE MODE IS ACTIVE:</strong> {{ maintenanceNotice }}
          </span>
        </div>
        <router-link
          v-if="isAdmin"
          to="/system-configuration"
          class="btn btn-dark btn-sm py-0 px-2 fs-11 fw-medium text-white shadow-none mt-1 mt-sm-0 text-nowrap"
        >
          Manage in System Configuration
        </router-link>
      </div>
    </BCol>
  </BRow>
</template>

<style scoped>
.maintenance-mode-banner {
  border: 1px solid rgba(0, 0, 0, 0.08);
}
</style>
