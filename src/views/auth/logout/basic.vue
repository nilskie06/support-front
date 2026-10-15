<script>
import animationData from "@/components/widgets/hzomhqxz.json";
import Lottie from "@/components/widgets/lottie.vue";
import { getSystemConfiguration, getSystemLogo, fetchAndApplySystemConfiguration } from "@/helpers/themeConfig";

export default {
  data() {
    return {
      defaultOptions: {
        animationData: animationData,
      },
      systemLogo: null,
      systemConfig: null,
    };
  },
  components: {
    lottie: Lottie,
  },
  computed: {
    appName() {
      return this.systemConfig?.app_name || "Support Desk";
    },
    companyName() {
      return this.systemConfig?.company_name || "";
    },
    footerCopyright() {
      const year = new Date().getFullYear();
      if (this.systemConfig?.footer_copyright_text) {
        let text = this.systemConfig.footer_copyright_text;
        if (text.includes("{year}")) text = text.replace(/{year}/g, year);
        if (text.includes("{appName}")) text = text.replace(/{appName}/g, this.appName);
        return text;
      }
      return `© ${year} ${this.appName}. All rights reserved.`;
    },
  },
  async mounted() {
    this.systemLogo = getSystemLogo();
    this.systemConfig = getSystemConfiguration();
    window.addEventListener("system-configuration-updated", this.handleSystemConfigUpdated);

    const freshConfig = await fetchAndApplySystemConfiguration();
    if (freshConfig) {
      this.systemConfig = freshConfig;
      this.systemLogo = freshConfig.system_logo || null;
    }
  },
  beforeUnmount() {
    window.removeEventListener("system-configuration-updated", this.handleSystemConfigUpdated);
  },
  methods: {
    handleSystemConfigUpdated(e) {
      if (e?.detail) {
        this.systemConfig = e.detail;
        this.systemLogo = e.detail.system_logo || null;
      }
    },
  },
};
</script>

<template>
  <main class="support-logout-page">
    <div class="ambient ambient-one"></div>
    <div class="ambient ambient-two"></div>
    <div class="support-grid"></div>

    <div class="logout-shell">
      <!-- MAIN LOGOUT CARD -->
      <div class="logout-card text-center">
        <div class="mb-4">
          <router-link to="/" class="brand-badge d-inline-flex align-items-center text-decoration-none">
            <div class="logo-box">
              <img v-if="systemLogo" :src="systemLogo" alt="System Logo" class="brand-logo-img" />
              <img v-else src="/aai_logo.png" alt="AAI Logo" class="brand-logo-img" />
            </div>
          </router-link>
        </div>
        <!-- Security Status Pill -->
        <div class="mb-3">
          <span class="session-badge">
            <i class="ri-shield-check-fill me-1 text-success"></i> Session Securely Ended
          </span>
        </div>

        <!-- Animated Graphic -->
        <div class="animation-container d-flex justify-content-center align-items-center mb-2">
          <lottie
            colors="primary:#d10a11,secondary:#405189"
            :options="defaultOptions"
            :height="160"
            :width="160"
          />
        </div>

        <!-- Heading & Copy -->
        <h3 class="logout-heading">You are Logged Out</h3>
        <p class="logout-copy">
          Thank you for using <strong class="text-white">{{ appName }}</strong>.<br />
          Your session credentials have been cleared and your account is secure.
        </p>

        <!-- Primary Action -->
        <div class="mt-4 pt-1">
          <router-link to="/login" class="btn btn-signin w-100">
            <i class="ri-login-box-line me-2 fs-16 align-middle"></i> Sign In to Account
          </router-link>
        </div>

        <!-- Quick Links -->
        <div class="quick-links mt-3 pt-1 d-flex justify-content-center align-items-center gap-3">
          <router-link to="/login" class="link-subtle">
            <i class="ri-user-follow-line me-1"></i> Switch Account
          </router-link>
          <span class="divider-dot">•</span>
          <a href="mailto:support@example.com" class="link-subtle">
            <i class="ri-customer-service-2-line me-1"></i> IT Help Desk
          </a>
        </div>
      </div>

      <!-- FOOTER -->
      <footer class="logout-footer text-center mt-4">
        <p class="mb-0">{{ footerCopyright }}</p>
      </footer>
    </div>
  </main>
</template>

<style scoped>
.support-logout-page {
  --brand-red: #d10a11;
  --brand-red-dark: #8f070b;
  position: relative;
  min-height: 100vh;
  box-sizing: border-box;
  overflow: hidden;
  display: grid;
  place-items: center;
  padding: 32px 16px;
  background: #09090b;
  font-family: inherit;
}

.support-grid {
  position: absolute;
  inset: 0;
  opacity: 0.12;
  background-image: linear-gradient(rgba(211, 29, 35, 0.18) 1px, transparent 1px),
    linear-gradient(90deg, rgba(211, 29, 35, 0.18) 1px, transparent 1px);
  background-size: 42px 42px;
  mask-image: radial-gradient(circle at center, black 40%, transparent 85%);
  pointer-events: none;
}

.ambient {
  position: absolute;
  border-radius: 999px;
  filter: blur(80px);
  pointer-events: none;
}

.ambient-one {
  width: 520px;
  height: 520px;
  top: -200px;
  left: -120px;
  background: radial-gradient(circle, rgba(209, 10, 17, 0.22), transparent 68%);
}

.ambient-two {
  width: 560px;
  height: 560px;
  right: -200px;
  bottom: -220px;
  background: radial-gradient(circle, rgba(64, 81, 137, 0.25), transparent 70%);
}

.logout-shell {
  position: relative;
  z-index: 2;
  width: min(480px, 100%);
  margin: auto;
}

.brand-badge {
  padding: 0;
}

.logo-box {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
}

.brand-logo-img {
  max-height: 38px;
  max-width: 150px;
  object-fit: contain;
  display: block;
}

.brand-title {
  color: #ffffff;
  font-size: 1.22rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.brand-subtitle {
  color: rgba(255, 255, 255, 0.52);
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  display: block;
  margin-top: 2px;
}

.logout-card {
  background: rgba(18, 18, 22, 0.78);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 38px 32px 34px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.55), 0 0 35px rgba(209, 10, 17, 0.08);
  transition: border-color 0.3s ease;
}

.session-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(34, 197, 94, 0.12);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.24);
  border-radius: 999px;
  padding: 5px 14px;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.animation-container {
  min-height: 150px;
}

.logout-heading {
  color: #ffffff;
  font-size: 1.48rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 8px;
}

.logout-copy {
  color: #a1a1aa;
  font-size: 0.92rem;
  line-height: 1.55;
  margin-bottom: 0;
}

.btn-signin {
  background: linear-gradient(135deg, #d10a11 0%, #9e070d 100%);
  border: none;
  color: #ffffff;
  padding: 13px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.98rem;
  box-shadow: 0 8px 24px rgba(209, 10, 17, 0.35);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.btn-signin:hover {
  background: linear-gradient(135deg, #e5121a 0%, #b5080f 100%);
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(209, 10, 17, 0.48);
  color: #ffffff;
}

.link-subtle {
  color: #71717a;
  font-size: 0.82rem;
  text-decoration: none;
  transition: color 0.2s ease;
  display: inline-flex;
  align-items: center;
}

.link-subtle:hover {
  color: #e4e4e7;
}

.divider-dot {
  color: #3f3f46;
  font-size: 0.75rem;
}

.logout-footer {
  color: #52525b;
  font-size: 0.82rem;
  position: relative;
  z-index: 2;
}
</style>
