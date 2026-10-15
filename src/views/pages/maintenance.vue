<script>
import axios from "axios";
import { getSystemLogo, fetchAndApplySystemConfiguration } from "@/helpers/themeConfig";

export default {
  name: "MaintenancePage",
  data() {
    return {
      checking: false,
      statusMessage: "",
      systemLogo: getSystemLogo(),
      systemConfig: null,
    };
  },
  computed: {
    currentUser() {
      try {
        const raw = sessionStorage.getItem("authUser") || localStorage.getItem("user");
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    },
    appName() {
      return this.systemConfig?.app_name || "AAI Support Desk";
    },
    supportEmail() {
      return this.systemConfig?.support_email || "support@aai.com.ph";
    },
    hotline() {
      return this.systemConfig?.hotline || null;
    },
  },
  mounted() {
    this.loadConfig();
  },
  methods: {
    loadConfig() {
      try {
        const raw = localStorage.getItem("velzon_system_general_config");
        if (raw) {
          this.systemConfig = JSON.parse(raw);
          if (this.systemConfig.system_logo) {
            this.systemLogo = this.systemConfig.system_logo;
          }
        }
      } catch (e) {
        this.systemConfig = null;
      }
    },
    async checkStatus() {
      this.checking = true;
      this.statusMessage = "";
      try {
        const apiBase = process.env.VUE_APP_AUTHDOMAIN || "http://localhost:8001/api";
        const res = await axios.get(`${apiBase}/system-branding`);
        const config = res.data?.data;
        if (config) {
          localStorage.setItem("velzon_system_general_config", JSON.stringify(config));
          this.systemConfig = config;
          if (!config.maintenance_mode) {
            // Maintenance is over!
            await fetchAndApplySystemConfiguration();
            this.$router.push("/");
            return;
          }
        }
        this.statusMessage = "Maintenance is still active. Please check back in a few moments.";
      } catch (err) {
        this.statusMessage = "Unable to reach server. Please try again shortly.";
      } finally {
        this.checking = false;
      }
    },
    logout() {
      localStorage.removeItem("jwt");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("authUser");
      sessionStorage.removeItem("user_menu_permissions");
      this.$router.push("/login");
    },
  },
};
</script>

<template>
  <div class="auth-page-wrapper auth-bg-cover py-5 d-flex justify-content-center align-items-center min-vh-100">
    <div class="bg-overlay"></div>

    <div class="auth-page-content overflow-hidden pt-lg-4">
      <BContainer>
        <BRow class="justify-content-center">
          <BCol xl="7" lg="8" md="10">
            <BCard no-body class="card-bg-fill border-0 shadow-lg rounded-4 overflow-hidden">
              <!-- Top Banner Header -->
              <div class="card-header bg-warning bg-opacity-10 border-0 py-3 text-center">
                <span class="badge bg-warning text-dark fs-11 px-3 py-1 rounded-pill text-uppercase fw-bold shadow-sm">
                  <i class="ri-tools-fill me-1"></i> Maintenance Mode Active
                </span>
              </div>

              <BCardBody class="p-4 p-md-5 text-center">
                <!-- Branding Logo -->
                <div class="mb-4">
                  <img
                    v-if="systemLogo"
                    :src="systemLogo"
                    alt="Logo"
                    class="img-fluid mb-2"
                    style="max-height: 52px; object-fit: contain;"
                  />
                  <h4 class="fw-bold text-body mt-2 mb-0">{{ appName }}</h4>
                </div>

                <!-- Illustration / Icon -->
                <div class="mb-4">
                  <img
                    src="@/assets/images/maintenance.png"
                    alt="Maintenance"
                    class="img-fluid"
                    style="max-height: 180px;"
                  />
                </div>

                <!-- Content -->
                <h2 class="display-6 fw-bold text-body mb-2">System Under Maintenance</h2>
                <p class="text-muted fs-14 mb-4 mx-auto" style="max-width: 520px;">
                  We are currently performing scheduled maintenance and updates on the system.
                  Regular user access is temporarily paused to ensure data integrity.
                  The system will be back online as soon as upgrades are complete.
                </p>

                <!-- Status alert if checked -->
                <div v-if="statusMessage" class="alert alert-warning alert-border-left fs-13 mb-4 text-start">
                  <i class="ri-alert-line me-1 align-middle"></i> {{ statusMessage }}
                </div>

                <!-- Logged In User Info -->
                <div v-if="currentUser" class="alert alert-light border border-dashed rounded-3 p-3 mb-4 text-start">
                  <div class="d-flex align-items-center justify-content-between mb-1">
                    <span class="text-muted fs-12">Logged-in Account:</span>
                    <strong class="text-body fs-13">{{ currentUser.name || currentUser.email }}</strong>
                  </div>
                  <div class="d-flex align-items-center justify-content-between">
                    <span class="text-muted fs-12">Account Role:</span>
                    <span class="badge bg-secondary-subtle text-secondary font-monospace text-uppercase">
                      {{ currentUser.role || 'user' }}
                    </span>
                  </div>
                </div>

                <!-- Actions -->
                <div class="d-flex justify-content-center gap-2 flex-wrap">
                  <button
                    type="button"
                    class="btn btn-primary px-4 shadow-sm"
                    :disabled="checking"
                    @click="checkStatus"
                  >
                    <span v-if="checking" class="spinner-border spinner-border-sm me-1" role="status"></span>
                    <i v-else class="ri-refresh-line me-1 align-middle"></i>
                    <span>Check Status & Refresh</span>
                  </button>

                  <button
                    v-if="currentUser"
                    type="button"
                    class="btn btn-outline-danger px-4"
                    @click="logout"
                  >
                    <i class="ri-logout-box-r-line me-1 align-middle"></i>
                    <span>Sign Out</span>
                  </button>

                  <router-link
                    v-else
                    to="/login"
                    class="btn btn-outline-secondary px-4"
                  >
                    <i class="ri-shield-keyhole-line me-1 align-middle"></i>
                    <span>Admin Login</span>
                  </router-link>
                </div>

                <!-- Support Contact Footer -->
                <div class="mt-4 pt-3 border-top border-light text-muted fs-12">
                  <span>Need urgent assistance? Contact support at </span>
                  <a :href="`mailto:${supportEmail}`" class="text-primary fw-medium">{{ supportEmail }}</a>
                  <span v-if="hotline"> &bull; Hotline: <strong class="text-body">{{ hotline }}</strong></span>
                </div>
              </BCardBody>

              <div class="card-footer bg-light py-2 text-center text-muted fs-11">
                &copy; {{ new Date().getFullYear() }} {{ appName }}. All rights reserved.
              </div>
            </BCard>
          </BCol>
        </BRow>
      </BContainer>
    </div>
  </div>
</template>

<style scoped>
.auth-bg-cover {
  background: linear-gradient(135deg, #1f2430 0%, #0e121a 100%);
}
.card-bg-fill {
  background: #ffffff;
}
[data-bs-theme="dark"] .card-bg-fill,
[data-layout-mode="dark"] .card-bg-fill {
  background: #212529;
}
</style>
