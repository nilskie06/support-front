<script>
import {
  required,
  helpers
} from "@vuelidate/validators";

import {
  authMethods,
  authFackMethods,
  notificationMethods,
} from "@/state/helpers";
import { getFirebaseBackend } from "@/authUtils";
import { getSystemLogo, getSystemConfiguration, fetchAndApplySystemConfiguration } from "@/helpers/themeConfig";

export default {
  data() {
    return {
      email: "",
      password: "",
      submitted: false,
      authError: null,
      tryingToLogIn: false,
      isAuthError: false,
      processing: false,
      showPassword: false,
      systemLogo: getSystemLogo(),
      systemConfig: getSystemConfiguration(),
    };
  },
  validations: {
    email: {
      required: helpers.withMessage("Email or username is required", required),
    },
    password: {
      required: helpers.withMessage("Password is required", required),
    },
  },
  computed: {
    appName() {
      return this.systemConfig?.app_name || "Support Desk";
    },
    companyName() {
      return this.systemConfig?.company_name || "COMPANY SERVICE PORTAL";
    },
    loginBanner() {
      const banner = this.systemConfig?.layout_config?.login_banner || {};
      return {
        status: banner.status || "All support systems operational",
        title: banner.title || "One service desk.",
        highlight: banner.highlight || "Every team moving",
        description: banner.description || "Request the help you need, from software delivery and infrastructure to facilities care and repairs.",
      };
    },
  },
  async mounted() {
    document.documentElement.classList.add("support-login-active");
    document.body.classList.add("support-login-active");
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
    document.documentElement.classList.remove("support-login-active");
    document.body.classList.remove("support-login-active");
    window.removeEventListener("system-configuration-updated", this.handleSystemConfigUpdated);
  },
  methods: {
    ...authMethods,
    ...authFackMethods,
    ...notificationMethods,

    handleSystemConfigUpdated(e) {
      if (e?.detail) {
        this.systemConfig = e.detail;
        this.systemLogo = e.detail.system_logo || null;
      }
    },

    async signinapi() {
      if (!this.email || !this.password) {
        this.authError = "Please enter your email and password.";
        return;
      }

      this.processing = true;
      this.authError = null;

      try {
        await getFirebaseBackend().loginUser(this.email, this.password);
        const redirect = this.$route.query.redirectFrom || { name: "default" };
        await this.$router.push(redirect);
      } catch (error) {
        this.authError = typeof error === "string" ? error : (error?.message || "Invalid credentials.");
      } finally {
        this.processing = false;
      }
    },

    // Try to log the user in with the username
    // and password they provided.
    tryToLogIn() {
      this.processing = true;
      this.submitted = true;
      // stop here if form is invalid
      this.$touch;

      if (this.$invalid) {
        return;
      } else {
        if (process.env.VUE_APP_DEFAULT_AUTH === "firebase") {
          this.tryingToLogIn = true;
          // Reset the authError if it existed.
          this.authError = null;
          return (
            this.logIn({
              email: this.email,
              password: this.password,
            })
              // eslint-disable-next-line no-unused-vars
              .then((token) => {
                this.tryingToLogIn = false;
                this.isAuthError = false;
                // Redirect to the originally requested page, or to the home page
                this.$router.push({
                  path: '/'
                });
              })
              .catch((error) => {
                this.tryingToLogIn = false;
                this.authError = error ? error : "";
                this.isAuthError = true;
                this.processing = false;
              })
          );
        } else {
          return this.signinapi();
        }
      }
    },

  },
};
</script>

<template>
  <main class="support-login-page">
    <div class="ambient ambient-one"></div>
    <div class="ambient ambient-two"></div>
    <div class="support-grid"></div>

    <section class="login-shell">
      <div class="story-panel">
        <router-link to="/" class="brand" :aria-label="appName + ' home'">
          <img :src="systemLogo || '/aai_logo.png'" :alt="appName" class="brand-logo" />
          <span>
            <strong>{{ appName }}</strong>
            <small>{{ companyName }}</small>
          </span>
        </router-link>

        <div class="story-content">
          <div class="service-status">
            <span class="status-pulse"></span>
            {{ loginBanner.status }}
          </div>

          <h1>{{ loginBanner.title }}<br /><span>{{ loginBanner.highlight }}</span> forward.</h1>
          <p class="story-copy">
            {{ loginBanner.description }}
          </p>

          <div class="service-catalog">
            <div class="service-group">
              <div class="service-group-title"><i class="ri-code-s-slash-line"></i> Technology support</div>
              <div class="service-chips">
                <span><i class="ri-code-box-line"></i> Software development</span>
                <span><i class="ri-bug-line"></i> Bugs &amp; fixes</span>
                <span><i class="ri-lightbulb-flash-line"></i> Innovation</span>
                <span><i class="ri-refresh-line"></i> System enhancement</span>
                <span><i class="ri-server-line"></i> Server maintenance</span>
                <span><i class="ri-wifi-line"></i> Wi-Fi &amp; network</span>
              </div>
            </div>
            <div class="service-group">
              <div class="service-group-title facilities"><i class="ri-building-2-line"></i> Facilities support</div>
              <div class="service-chips">
                <span><i class="ri-tools-line"></i> General repairs</span>
                <span><i class="ri-brush-line"></i> Cleaning</span>
                <span><i class="ri-drop-line"></i> Plumbing</span>
                <span><i class="ri-temp-cold-line"></i> AC repair</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div class="form-panel">
        <div class="form-panel-inner">
          <div class="mobile-brand">
            <img :src="systemLogo || '/aai_logo.png'" :alt="appName" class="brand-logo" />
            <span><strong>{{ appName }}</strong><small>{{ companyName }}</small></span>
          </div>

          <div class="secure-label"><i class="ri-shield-check-line"></i> Secure company portal</div>
          <h2>Welcome back</h2>
          <p class="form-intro">Sign in to manage requests, updates, and conversations.</p>

          <b-alert v-model="authError" variant="danger" class="auth-alert" dismissible>{{ authError }}</b-alert>

          <form class="login-form" @submit.prevent="signinapi">
            <div class="field-group">
              <label for="email">Email or username</label>
              <div class="field-control">
                <i class="ri-at-line field-leading-icon"></i>
                <input type="text" id="email" placeholder="name@company.com or username" v-model="email" autocomplete="username" />
              </div>
            </div>

            <div class="field-group">
              <div class="field-label-row">
                <label for="password-input">Password</label>
                <router-link to="/forgot-password">Forgot password?</router-link>
              </div>
              <div class="field-control">
                <i class="ri-lock-2-line field-leading-icon"></i>
                <input :type="showPassword ? 'text' : 'password'" id="password-input" placeholder="Enter your password"
                  v-model="password" autocomplete="current-password" />
                <button class="password-toggle" type="button" @click="showPassword = !showPassword"
                  :aria-label="showPassword ? 'Hide password' : 'Show password'">
                  <i :class="showPassword ? 'ri-eye-off-line' : 'ri-eye-line'"></i>
                </button>
              </div>
            </div>

            <div class="form-options">
              <label class="remember-option" for="auth-remember-check">
                <input type="checkbox" id="auth-remember-check" />
                <span>Keep me signed in</span>
              </label>
              <span class="protected-text"><i class="ri-lock-line"></i> Protected session</span>
            </div>

            <button class="sign-in-button" type="submit" :disabled="processing">
              <span>{{ processing ? "Connecting..." : "Enter Support Desk" }}</span>
              <i v-if="!processing" class="ri-arrow-right-line"></i>
              <span v-else class="button-spinner"></span>
            </button>
          </form>

          <div class="help-note">
            <span><i class="ri-question-line"></i></span>
            <p><strong>Need help signing in?</strong> Contact AAI IT support for account assistance.</p>
          </div>

          <footer>
            &copy; {{ new Date().getFullYear() }} AAI <span></span> Powered by AAI IT
          </footer>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
:global(html.support-login-active),
:global(body.support-login-active) {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.support-login-page {
  --ink: #ffffff;
  --muted: #a7a7aa;
  --panel-ink: #1b1b1d;
  --panel-muted: #71717a;
  --brand-red: #d10a11;
  --brand-red-dark: #8f070b;
  position: relative;
  height: 100vh;
  height: 100svh;
  box-sizing: border-box;
  overflow: hidden;
  display: grid;
  place-items: center;
  padding: 0;
  background: #09090b;
  font-family: inherit;
}

.support-grid {
  position: absolute;
  inset: 0;
  opacity: 0.13;
  background-image: linear-gradient(rgba(211, 29, 35, 0.18) 1px, transparent 1px),
    linear-gradient(90deg, rgba(211, 29, 35, 0.18) 1px, transparent 1px);
  background-size: 42px 42px;
  mask-image: linear-gradient(to right, black, transparent 72%);
}

.ambient {
  position: absolute;
  border-radius: 999px;
  filter: blur(12px);
  pointer-events: none;
}

.ambient-one {
  width: 520px;
  height: 520px;
  top: -220px;
  left: -130px;
  background: radial-gradient(circle, rgba(209, 10, 17, 0.24), transparent 68%);
}

.ambient-two {
  width: 620px;
  height: 620px;
  right: -280px;
  bottom: -320px;
  background: radial-gradient(circle, rgba(145, 10, 15, 0.24), transparent 68%);
}

.login-shell {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: none;
  height: 100vh;
  height: 100svh;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(410px, 0.9fr);
  overflow: hidden;
}

.story-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 48px 54px 42px;
  color: var(--ink);
  background: linear-gradient(145deg, rgba(24, 24, 27, 0.96), rgba(10, 10, 12, 0.88));
}

.story-panel::after {
  content: "";
  position: absolute;
  width: 340px;
  height: 340px;
  right: -120px;
  top: 180px;
  border: 1px solid rgba(209, 10, 17, 0.16);
  border-radius: 50%;
  box-shadow: 0 0 0 55px rgba(209, 10, 17, 0.035), 0 0 0 110px rgba(255, 255, 255, 0.018);
}

.brand,
.mobile-brand {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 13px;
  color: var(--ink);
  text-decoration: none;
}

.brand-logo {
  width: 92px;
  height: 44px;
  object-fit: contain;
  object-position: left center;
}

.brand strong,
.mobile-brand strong {
  display: block;
  font-size: 15px;
  letter-spacing: 0.015em;
  line-height: 1;
}

.brand small,
.mobile-brand small {
  display: block;
  margin-top: 5px;
  color: #a1a1aa;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.2em;
}

.story-content {
  position: relative;
  z-index: 1;
  margin: auto 0;
  padding: 48px 0 40px;
}

.service-status {
  width: fit-content;
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 26px;
  padding: 8px 13px;
  border: 1px solid rgba(84, 225, 195, 0.19);
  border-radius: 999px;
  color: #a9e8db;
  background: rgba(30, 171, 146, 0.08);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.status-pulse {
  position: relative;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4ce1a8;
  box-shadow: 0 0 0 5px rgba(76, 225, 168, 0.1);
}

.story-content h1 {
  max-width: 580px;
  margin: 0;
  font-size: clamp(42px, 4.2vw, 64px);
  font-weight: 700;
  letter-spacing: -0.045em;
  line-height: 1.02;
}

.story-content h1 span {
  color: transparent;
  background: linear-gradient(90deg, #ff676c, #c90007);
  background-clip: text;
  -webkit-background-clip: text;
}

.story-copy {
  max-width: 590px;
  margin: 22px 0 26px;
  color: #b3b3ba;
  font-size: 15px;
  line-height: 1.75;
}

.service-catalog { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; max-width: 630px; }
.service-group { padding: 14px; border: 1px solid rgba(255, 255, 255, .1); border-radius: 14px; background: rgba(255, 255, 255, .025); }
.service-group-title { display: flex; align-items: center; gap: 7px; margin-bottom: 11px; color: #ff7478; font-size: 11px; font-weight: 800; letter-spacing: .07em; text-transform: uppercase; }
.service-group-title.facilities { color: #67d9c0; }
.service-chips { display: flex; flex-wrap: wrap; gap: 7px; }
.service-chips span { display: inline-flex; align-items: center; gap: 5px; padding: 5px 7px; border-radius: 6px; color: #d7d7dc; background: rgba(255, 255, 255, .06); font-size: 10px; line-height: 1.2; }
.service-chips i { color: #ff7478; font-size: 12px; }.service-group:nth-child(2) .service-chips i { color: #67d9c0; }

.support-features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.feature-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feature-icon {
  width: 35px;
  height: 35px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  color: #ff696e;
  background: rgba(255, 255, 255, 0.035);
  font-size: 17px;
}

.feature-item strong,
.feature-item small {
  display: block;
}

.feature-item strong {
  margin-bottom: 5px;
  color: #f2f2f3;
  font-size: 12px;
}

.feature-item small {
  color: #96969f;
  font-size: 10px;
  line-height: 1.5;
}

.form-panel {
  display: grid;
  place-items: center;
  padding: 54px 58px;
  color: var(--panel-ink);
  background: #fafafa;
}

.form-panel-inner {
  width: min(100%, 390px);
}

.mobile-brand {
  display: none;
  margin-bottom: 38px;
  color: var(--panel-ink);
}

.secure-label {
  width: fit-content;
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 15px;
  color: #b30c12;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.secure-label i {
  font-size: 15px;
}

.form-panel h2 {
  margin: 0;
  color: #18181b;
  font-size: 37px;
  font-weight: 750;
  letter-spacing: -0.035em;
}

.form-intro {
  margin: 10px 0 31px;
  color: var(--panel-muted);
  font-size: 14px;
  line-height: 1.6;
}

.auth-alert {
  margin-bottom: 22px;
  font-size: 12px;
}

.field-group {
  margin-bottom: 20px;
}

.field-group label {
  margin-bottom: 8px;
  color: #29292d;
  font-size: 12px;
  font-weight: 700;
}

.field-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.field-label-row a {
  margin-bottom: 8px;
  color: #c10c12;
  font-size: 11px;
  font-weight: 650;
  text-decoration: none;
}

.field-label-row a:hover {
  color: #8f070b;
}

.field-control {
  position: relative;
}

.field-control input {
  width: 100%;
  height: 52px;
  padding: 0 47px;
  border: 1px solid #dedee2;
  border-radius: 13px;
  outline: 0;
  color: #222225;
  background: #fff;
  font-size: 13px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.field-control input::placeholder {
  color: #a7a7af;
}

.field-control input:focus {
  border-color: #d10a11;
  box-shadow: 0 0 0 4px rgba(209, 10, 17, 0.09);
}

.field-leading-icon,
.password-toggle {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}

.field-leading-icon {
  left: 17px;
  color: #888892;
  font-size: 17px;
}

.password-toggle {
  right: 10px;
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 9px;
  color: #808089;
  background: transparent;
  font-size: 17px;
}

.password-toggle:hover {
  color: #b30c12;
  background: #f7eded;
}

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 3px 0 25px;
}

.remember-option {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #5f5f66;
  font-size: 11px;
  cursor: pointer;
}

.remember-option input {
  width: 15px;
  height: 15px;
  accent-color: #d10a11;
}

.protected-text {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #9999a2;
  font-size: 9px;
}

.sign-in-button {
  width: 100%;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border: 0;
  border-radius: 13px;
  color: #fff;
  background: linear-gradient(110deg, #9e080d, #d10a11 58%, #ed3237);
  box-shadow: 0 13px 30px rgba(163, 9, 15, 0.26);
  font-size: 13px;
  font-weight: 750;
  letter-spacing: 0.01em;
  transition: transform 0.2s, box-shadow 0.2s;
}

.sign-in-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 16px 36px rgba(163, 9, 15, 0.34);
}

.sign-in-button:disabled {
  cursor: wait;
  opacity: 0.76;
}

.sign-in-button i {
  font-size: 18px;
}

.button-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}

.help-note {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 30px;
  padding: 13px 15px;
  border: 1px solid #e6e6e9;
  border-radius: 12px;
  background: #f6f3f3;
}

.help-note > span {
  width: 30px;
  height: 30px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 9px;
  color: #bd0d13;
  background: #f3e1e2;
}

.help-note p {
  margin: 0;
  color: #77777f;
  font-size: 10px;
  line-height: 1.5;
}

.help-note strong {
  display: block;
  color: #37373c;
  font-size: 10px;
}

.form-panel footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  margin-top: 31px;
  color: #a1a1aa;
  font-size: 9px;
  font-weight: 650;
  letter-spacing: 0.045em;
  text-transform: uppercase;
}

.form-panel footer span {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: #b4b4bc;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 991.98px) {
  .support-login-page {
    padding: 0;
  }

  .login-shell {
    width: 100%;
    height: 100vh;
    height: 100svh;
    min-height: auto;
    grid-template-columns: 1fr;
  }

  .story-panel {
    display: none;
  }

  .form-panel {
    min-height: 0;
    padding: 48px 54px;
  }

  .mobile-brand {
    display: inline-flex;
  }
}

@media (max-width: 575.98px) {
  .support-login-page {
    display: block;
    height: 100vh;
    height: 100svh;
    min-height: 100svh;
    padding: 0;
    overflow-x: hidden;
    overflow-y: auto;
    scrollbar-width: none;
    background: #fafafa;
  }

  .support-login-page::-webkit-scrollbar {
    display: none;
  }

  .support-grid,
  .ambient {
    display: none;
  }

  .login-shell {
    width: 100%;
    height: auto;
    min-height: 100vh;
    min-height: 100svh;
    border: 0;
    border-radius: 0;
    box-shadow: none;
  }

  .form-panel {
    min-height: 100vh;
    min-height: 100svh;
    place-items: start center;
    padding: max(20px, env(safe-area-inset-top)) 22px max(16px, env(safe-area-inset-bottom));
  }

  .form-panel-inner {
    width: 100%;
  }

  .mobile-brand {
    margin-bottom: 27px;
  }

  .brand-logo {
    width: 82px;
    height: 38px;
  }

  .mobile-brand strong {
    font-size: 14px;
  }

  .mobile-brand small {
    margin-top: 4px;
    font-size: 8px;
  }

  .secure-label {
    margin-bottom: 10px;
  }

  .form-panel h2 {
    font-size: 30px;
  }

  .form-intro {
    margin: 7px 0 20px;
    font-size: 13px;
    line-height: 1.5;
  }

  .auth-alert {
    margin-bottom: 15px;
  }

  .field-group {
    margin-bottom: 14px;
  }

  .field-group label,
  .field-label-row a {
    margin-bottom: 6px;
  }

  .field-control input {
    height: 48px;
    border-radius: 12px;
  }

  .form-options {
    align-items: flex-start;
    margin: 1px 0 18px;
  }

  .sign-in-button {
    height: 52px;
  }

  .help-note {
    margin-top: 18px;
    padding: 10px 12px;
  }

  .form-panel footer {
    margin-top: 16px;
  }

  .protected-text {
    display: none;
  }
}

@media (max-width: 575.98px) and (max-height: 700px) {
  .form-panel {
    padding-top: max(14px, env(safe-area-inset-top));
  }

  .mobile-brand {
    margin-bottom: 18px;
  }

  .form-intro {
    margin-bottom: 14px;
  }

  .field-group {
    margin-bottom: 12px;
  }

  .help-note {
    margin-top: 14px;
  }

  .form-panel footer {
    margin-top: 12px;
  }
}
</style>
