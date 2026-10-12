<script>
import axios from "axios";

const DEFAULT_FOOTER_CONFIGURATION = {
  appName: "Velzon Support Portal",
  companyName: "Enterprise Global Inc.",
  copyrightText: "{year} © {appName}.",
  creditText: "Design & Develop by {companyName}",
};

export default {
  name: "AppFooter",
  data() {
    return {
      footerConfiguration: { ...DEFAULT_FOOTER_CONFIGURATION },
    };
  },
  computed: {
    apiBase() {
      return process.env.VUE_APP_AUTHDOMAIN || "http://localhost:8001/api";
    },
    copyrightText() {
      return this.formatFooterText(this.footerConfiguration.copyrightText);
    },
    creditText() {
      return this.formatFooterText(this.footerConfiguration.creditText);
    },
  },
  mounted() {
    window.addEventListener("system-configuration-updated", this.handleConfigurationUpdated);
    this.fetchFooterConfiguration();
  },
  beforeUnmount() {
    window.removeEventListener("system-configuration-updated", this.handleConfigurationUpdated);
  },
  methods: {
    getAuthHeaders() {
      const token = localStorage.getItem("jwt") || localStorage.getItem("token");
      return token ? { Authorization: `Bearer ${token}` } : {};
    },
    async fetchFooterConfiguration() {
      try {
        const response = await axios.get(`${this.apiBase}/system-configuration`, {
          headers: this.getAuthHeaders(),
        });
        this.applyConfiguration(response.data.data);
      } catch (error) {
        console.warn("Failed to load footer configuration:", error);
      }
    },
    handleConfigurationUpdated(event) {
      if (event?.detail) {
        this.applyConfiguration(event.detail);
      }
    },
    applyConfiguration(configuration) {
      this.footerConfiguration = {
        appName: configuration.app_name || DEFAULT_FOOTER_CONFIGURATION.appName,
        companyName: configuration.company_name || DEFAULT_FOOTER_CONFIGURATION.companyName,
        copyrightText:
          configuration.footer_copyright_text || DEFAULT_FOOTER_CONFIGURATION.copyrightText,
        creditText: configuration.footer_credit_text || DEFAULT_FOOTER_CONFIGURATION.creditText,
      };
    },
    formatFooterText(template) {
      const replacements = {
        year: String(new Date().getFullYear()),
        appName: this.footerConfiguration.appName,
        companyName: this.footerConfiguration.companyName,
      };

      return Object.entries(replacements).reduce(
        (text, [placeholder, value]) =>
          text.replace(new RegExp(`\\{${placeholder}\\}`, "g"), () => value),
        template
      );
    },
  },
};
</script>

<template>
  <footer class="footer border-top">
    <BContainer fluid>
      <BRow>
        <BCol sm="6">
          {{ copyrightText }}
        </BCol>
        <BCol sm="6">
          <div class="text-sm-end d-none d-sm-block">
            {{ creditText }}
          </div>
        </BCol>
      </BRow>
    </BContainer>
  </footer>
</template>
