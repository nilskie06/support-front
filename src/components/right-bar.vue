<script>
localStorage.setItem("rightbar_isopen", false);
import { layoutMethods, layoutComputed } from "@/state/helpers";
import simpleBar from "simplebar-vue";
import {
  COLOR_PRESETS,
  BUTTON_RADIUS_OPTIONS,
  BUTTON_WEIGHT_OPTIONS,
  BUTTON_HOVER_OPTIONS,
  INPUT_RADIUS_OPTIONS,
  INPUT_BORDER_WIDTH_OPTIONS,
  INPUT_STYLE_OPTIONS,
  INPUT_FOCUS_RING_OPTIONS,
  CHECKBOX_RADIUS_OPTIONS,
  CHECKBOX_SIZE_OPTIONS,
  CHECKBOX_BORDER_OPTIONS,
  getThemeConfig,
  saveThemeConfig,
  resetThemeConfig,
} from "@/helpers/themeConfig";

/**
 * Right sidebar component
 */

export default {
  data() {
    return {
      show: false,
      showGradients: false,
      resetLayoutMode: {},
      activeTab: "components", // 'components' | 'layout'
      themeConfig: getThemeConfig(),
      colorPresets: COLOR_PRESETS,
      buttonRadiusOptions: BUTTON_RADIUS_OPTIONS,
      buttonWeightOptions: BUTTON_WEIGHT_OPTIONS,
      buttonHoverOptions: BUTTON_HOVER_OPTIONS,
      inputRadiusOptions: INPUT_RADIUS_OPTIONS,
      inputBorderWidthOptions: INPUT_BORDER_WIDTH_OPTIONS,
      inputStyleOptions: INPUT_STYLE_OPTIONS,
      inputFocusRingOptions: INPUT_FOCUS_RING_OPTIONS,
      checkboxRadiusOptions: CHECKBOX_RADIUS_OPTIONS,
      checkboxSizeOptions: CHECKBOX_SIZE_OPTIONS,
      checkboxBorderOptions: CHECKBOX_BORDER_OPTIONS,
      demoInputText: "Dashboard & Tickets",
      demoTextareaText: "Multi-line input reflecting chosen border radius and focus ring styling.",
      demoCheckbox: true,
      demoSwitch: true,
    };
  },
  beforeCreate() {
    // console.log(
    //   "this.resetLayoutMode",
    //   (this.resetLayoutMode = this.$store.state.layout)
    // );
    localStorage.setItem(
      "resetValue",
      JSON.stringify(this.$store.state.layout)
    );
    localStorage.setItem(
      "resetValue",
      JSON.stringify(this.$store.state.layout)
    );
  },

  methods: {
    ...layoutMethods,
    click() {
      this.show = !this.show;
    },
    topFunction() {
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    },

    resizeWindow() {
      var windowSize = document.documentElement.clientWidth;
      if (windowSize >= 1025) {
        if (
          document.documentElement.getAttribute("data-layout") === "vertical"
        ) {
          document.documentElement.setAttribute(
            "data-sidebar-size",
            this.$store.state.layout.sidebarSize
          );
        }
        if (
          document.documentElement.getAttribute("data-layout") === "semibox"
        ) {
          document.documentElement.setAttribute(
            "data-sidebar-size",
            this.$store.state.layout.sidebarSize
          );
        }
        if (
          document.documentElement.getAttribute("data-sidebar-visibility") ===
          "show" &&
          document.querySelector(".hamburger-icon")
        ) {
          document.querySelector(".hamburger-icon").classList.remove("open");
        }
      } else if (windowSize < 1025 && windowSize > 767) {
        document.body.classList.remove("twocolumn-panel");
        if (
          document.documentElement.getAttribute("data-layout") === "vertical"
        ) {
          document.documentElement.setAttribute("data-sidebar-size", "sm");
        }
        if (
          document.documentElement.getAttribute("data-layout") === "semibox"
        ) {
          document.documentElement.setAttribute("data-sidebar-size", "sm");
        }
        if (document.querySelector(".hamburger-icon")) {
          document.querySelector(".hamburger-icon").classList.add("open");
        }
      } else if (windowSize <= 767) {
        document.body.classList.remove("vertical-sidebar-enable");
        document.body.classList.add("twocolumn-panel");
        if (
          document.documentElement.getAttribute("data-layout") !== "horizontal"
        ) {
          document.documentElement.setAttribute("data-sidebar-size", "lg");
        }
        if (document.querySelector(".hamburger-icon")) {
          document.querySelector(".hamburger-icon").classList.add("open");
        }
      }
    },

    resetLayout() {
      let reset = JSON.parse(localStorage.getItem("resetValue"));
      document.documentElement.setAttribute("data-sidebar-size", "lg");
      this.changeMode({ mode: reset.mode });
      this.changeSidebarColor({ sidebarColor: reset.sidebarColor });
      this.changeLayoutType({ layoutType: reset.layoutType });
      this.changeTopbar({ topbar: reset.topbar });
      this.changeLayoutWidth({ layoutWidth: reset.layoutWidth });
      this.changeSidebarSize({ sidebarSize: reset.sidebarSize });
      this.changeSidebarImage({ sidebarImage: reset.sidebarImage });
      this.changeSidebarColor({ sidebarColor: reset.sidebarColor });
      this.changePreloader({ preloader: reset.preloader });
      this.changeSidebarView({ sidebarView: reset.sidebarView });
      this.changeVisibility({ visibility: reset.visibility });
      this.changePosition({ position: reset.position });

    },

    gradiantColor() {
      this.changeSidebarColor({ sidebarColor: "gradient" });
    },

    onSideBarColorClick(color) {
      if (color !== "gradient") {
        this.showGradients = false;
      } else {
        this.showGradients = true;
        this.gradiantColor();
      }
    },

    setThemeProp(key, value) {
      this.themeConfig[key] = value;
      saveThemeConfig(this.themeConfig);
    },

    selectPresetColor(preset) {
      this.themeConfig.presetColor = preset.id;
      this.themeConfig.primaryColor = preset.hex;
      saveThemeConfig(this.themeConfig);
    },

    onCustomColorInput(event) {
      this.themeConfig.presetColor = "custom";
      this.themeConfig.primaryColor = event.target.value;
      saveThemeConfig(this.themeConfig);
    },

    resetComponentStyles() {
      const def = resetThemeConfig();
      this.themeConfig = { ...def };
    },
  },
  mounted() {
    window.addEventListener("app-theme-changed", (e) => {
      if (e && e.detail) {
        this.themeConfig = { ...e.detail };
      }
    });

    let backtoTop = document.getElementById("back-to-top");

    if (backtoTop) {
      backtoTop = document.getElementById("back-to-top");
      window.onscroll = function () {
        if (
          document.body.scrollTop > 100 ||
          document.documentElement.scrollTop > 100
        ) {
          backtoTop.style.display = "block";
        } else {
          backtoTop.style.display = "none";
        }
      };
    }
    var setpreloader = document.getElementById("preloader");
    if (
      localStorage.getItem("data-preloader") &&
      localStorage.getItem("data-preloader") == "enable"
    ) {
      document.documentElement.setAttribute("data-preloader", "enable");
      if (setpreloader) {
        setTimeout(function () {
          setpreloader.style.opacity = "0";
          setpreloader.style.visibility = "hidden";
        }, 1000);
      }
    } else {
      document.documentElement.setAttribute("data-preloader", "disable");
      if (setpreloader) {
        setpreloader.style.opacity = "0";
        setpreloader.style.visibility = "hidden";
      }
    }
    if (document.getElementById("collapseBgGradient")) {
      Array.from(
        document.querySelectorAll("#collapseBgGradient .form-check input")
      ).forEach(function () {
        if (document.querySelector("[data-bs-target='#collapseBgGradient']")) {
          document
            .querySelector("[data-bs-target='#collapseBgGradient']")
            .addEventListener("click", function () {
              document.getElementById("sidebar-color-gradient").click();
            });
        }
      });
      Array.from(document.querySelectorAll("[name='data-sidebar']")).forEach(
        function (elem) {
          if (
            document.querySelector("[data-bs-target='#collapseBgGradient']")
          ) {
            if (
              document.querySelector(
                "#collapseBgGradient .form-check input:checked"
              )
            ) {
              document
                .querySelector("[data-bs-target='#collapseBgGradient']")
                .classList.add("active");
            } else {
              document
                .querySelector("[data-bs-target='#collapseBgGradient']")
                .classList.remove("active");
              document
                .getElementById("collapseBgGradient")
                .classList.remove("show");
            }

            elem.addEventListener("change", function () {
              if (
                document.querySelector(
                  "#collapseBgGradient .form-check input:checked"
                )
              ) {
                document
                  .querySelector("[data-bs-target='#collapseBgGradient']")
                  .classList.add("active");
              } else {
                document
                  .getElementById("collapseBgGradient")
                  .classList.remove("show");
                document
                  .querySelector("[data-bs-target='#collapseBgGradient']")
                  .classList.remove("active");
              }
            });
          }
        }
      );
    }
  },
  computed: {
    ...layoutComputed,
    layoutType: {
      get() {
        return this.$store ? this.$store.state.layout.layoutType : {} || {};
      },
      set(layout) {
        localStorage.setItem("rightbar_isopen", true);
        this.changeLayoutType({ layoutType: layout });
        document.querySelector(".hamburger-icon").classList.remove("open");
      },
    },
    preloader: {
      get() {
        return this.$store ? this.$store.state.layout.preloader : {} || {};
      },
      set(preloader) {
        return this.changePreloader({
          preloader: preloader,
        });
      },
    },
    mode: {
      get() {
        return this.$store ? this.$store.state.layout.mode : {} || {};
      },
      set(mode) {
        if (mode == "dark") {
          this.changeMode({ mode: mode });
          this.changeTopbar({ topbar: "light" });
        } else {
          this.changeMode({ mode: mode });
          this.changeTopbar({ topbar: "light" });
        }
      },
    },
    sidebarSize: {
      get() {
        return this.$store ? this.$store.state.layout.sidebarSize : {} || {};
      },
      set(type) {
        return this.changeSidebarSize({
          sidebarSize: type,
        });
      },
    },
    layoutWidth: {
      get() {
        return this.$store ? this.$store.state.layout.layoutWidth : {} || {};
      },
      set(width) {
        if (width == "boxed") {
          this.changeLayoutWidth({ layoutWidth: width });
          this.changeSidebarSize({ sidebarSize: "sm-hover" });
        } else {
          this.changeLayoutWidth({ layoutWidth: width });
          this.changeSidebarSize({ sidebarSize: "lg" });
        }
      },
    },
    position: {
      get() {
        return this.$store ? this.$store.state.layout.position : {} || {};
      },
      set(position) {
        return this.changePosition({
          position: position,
        });
      },
    },
    topbar: {
      get() {
        return this.$store ? this.$store.state.layout.topbar : {} || {};
      },
      set(topbar) {
        this.changeTopbar({
          topbar: topbar,
        });
      },
    },
    sidebarView: {
      get() {
        return this.$store ? this.$store.state.layout.sidebarView : {} || {};
      },
      set(sidebarView) {
        return this.changeSidebarView({
          sidebarView: sidebarView,
        });
      },
    },
    sidebarColor: {
      get() {
        return this.$store ? this.$store.state.layout.sidebarColor : {} || {};
      },
      set(sidebarColor) {
        console.log(
          "this.$store.state.layout.sidebarColor",
          this.$store.state.layout.sidebarColor
        );
        return this.changeSidebarColor({
          sidebarColor: sidebarColor,
        });
      },
    },

    visibility: {
      get() {
        return this.$store ? this.$store.state.layout.visibility : {} || {};
      },
      set(visibility) {
        if (visibility == "hidden") {
          document.querySelector(".hamburger-icon").classList.add("open");
        } else {
          document.querySelector(".hamburger-icon").classList.remove("open");
        }
        this.changeVisibility({
          visibility: visibility,
        });
      },
    },
    bodybg: {
      get() {
        return this.$store ? this.$store.state.layout.bodybg : {} || {};
      },
      set(bodybg) {
        document.documentElement.setAttribute ("data-body-image" , bodybg)
         this.changeBodybg({
          bodybg: bodybg,
        });
      },
    },
  },

  watch: {
    mode: {
      immediate: true,
      deep: true,
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          switch (newVal) {
            case "dark":
              document.documentElement.setAttribute("data-bs-theme", "dark");
              break;
            case "light":
              document.documentElement.setAttribute("data-bs-theme", "light");
              break;
          }
        }
      },
    },
    preloader: {
      immediate: true,
      deep: true,
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          switch (newVal) {
            case "enable":
              document.documentElement.setAttribute("data-preloader", "enable");
              break;
            case "disable":
              document.documentElement.setAttribute(
                "data-preloader",
                "disable"
              );
              break;
          }
          localStorage.setItem("data-preloader", newVal);
        }
      },
    },
    layoutType: {
      immediate: true,
      deep: true,
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          switch (newVal) {
            case "horizontal":
              document.documentElement.setAttribute(
                "data-layout",
                "horizontal"
              );
              break;
            case "vertical":
              document.documentElement.setAttribute("data-layout", "vertical");
              break;
            case "twocolumn":
              document.documentElement.setAttribute("data-layout", "twocolumn");
              break;
            case "semibox":
              document.documentElement.setAttribute("data-layout", "semibox");
              break;
          }
        }
      },
    },
    layoutWidth: {
      immediate: true,
      deep: true,
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          switch (newVal) {
            case "fluid":
              document.documentElement.setAttribute(
                "data-layout-width",
                "fluid"
              );
              break;
            case "boxed":
              document.documentElement.setAttribute(
                "data-layout-width",
                "boxed"
              );
              break;
          }
        }
      },
    },
    position: {
      immediate: true,
      deep: true,
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          switch (newVal) {
            case "fixed":
              document.documentElement.setAttribute(
                "data-layout-position",
                "fixed"
              );
              break;
            case "scrollable":
              document.documentElement.setAttribute(
                "data-layout-position",
                "scrollable"
              );
              break;
          }
        }
      },
    },
    topbar: {
      immediate: true,
      deep: true,
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          switch (newVal) {
            case "light":
              document.documentElement.setAttribute("data-topbar", "light");
              break;
            case "dark":
              document.documentElement.setAttribute("data-topbar", "dark");
              break;
          }
        }
      },
    },
    sidebarSize: {
      immediate: true,
      deep: true,
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          switch (newVal) {
            case "lg":
              document.documentElement.setAttribute("data-sidebar-size", "lg");
              break;
            case "sm":
              document.documentElement.setAttribute("data-sidebar-size", "sm");
              break;
            case "md":
              document.documentElement.setAttribute("data-sidebar-size", "md");
              break;
            case "sm-hover":
              document.documentElement.setAttribute(
                "data-sidebar-size",
                "sm-hover"
              );
              break;
          }
        }
      },
    },
    sidebarView: {
      immediate: true,
      deep: true,
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          switch (newVal) {
            case "detached":
              document.documentElement.setAttribute(
                "data-layout-style",
                "detached"
              );
              break;
            case "default":
              document.documentElement.setAttribute(
                "data-layout-style",
                "default"
              );
              break;
          }
        }
      },
    },
    sidebarColor: {
      immediate: true,
      deep: true,
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          switch (newVal) {
            case "dark":
              document.documentElement.setAttribute("data-sidebar", "dark");
              break;
            case "light":
              document.documentElement.setAttribute("data-sidebar", "light");
              break;
            case "gradient":
              document.documentElement.setAttribute("data-sidebar", "gradient");
              break;
            case "gradient-2":
              document.documentElement.setAttribute(
                "data-sidebar",
                "gradient-2"
              );
              break;
            case "gradient-3":
              document.documentElement.setAttribute(
                "data-sidebar",
                "gradient-3"
              );
              break;
            case "gradient-4":
              document.documentElement.setAttribute(
                "data-sidebar",
                "gradient-4"
              );
              break;
          }
        }
      },
    },
    sidebarImage: {
      immediate: true,
      deep: true,
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          switch (newVal) {
            case "img-1":
              document.documentElement.setAttribute(
                "data-sidebar-image",
                "img-1"
              );
              break;
            case "img-2":
              document.documentElement.setAttribute(
                "data-sidebar-image",
                "img-2"
              );
              break;
            case "img-3":
              document.documentElement.setAttribute(
                "data-sidebar-image",
                "img-3"
              );
              break;
            case "img-4":
              document.documentElement.setAttribute(
                "data-sidebar-image",
                "img-4"
              );
              break;
            case "none":
              document.documentElement.setAttribute(
                "data-sidebar-image",
                "none"
              );
              break;
          }
        }
      },
    },
    visibility: {
      immediate: true,
      deep: true,
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          switch (newVal) {
            case "show":
              document.documentElement.setAttribute(
                "data-sidebar-visibility",
                "show"
              );
              break;
            case "hidden":
              document.documentElement.setAttribute(
                "data-sidebar-visibility",
                "hidden"
              );
              break;
          }
        }
      },
    },
    bodybg: {
      immediate: true,
      deep: true,
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          switch (newVal) {
            case "img-1":
              sessionStorage.setItem("data-sidebabodyr-image", "img-1");
              document.documentElement.setAttribute("data-body-image", "img-1");
              if (document.getElementById("theme-settings-offcanvas")) {
                document.documentElement.removeAttribute("data-sidebar-image");
              }
              break;
            case "img-2":
              sessionStorage.setItem("data-body-image", "img-2");
              document.documentElement.setAttribute("data-body-image", "img-2");
              break;
            case "img-3":
              sessionStorage.setItem("data-body-image", "img-3");
              document.documentElement.setAttribute("data-body-image", "img-3");
              break;
            case "none":
              sessionStorage.setItem("data-body-image", "none");
              document.documentElement.setAttribute("data-body-image", "none");
              break;

            default:
              if (sessionStorage.getItem("data-body-image") && sessionStorage.getItem("data-body-image") == "img-1") {
                sessionStorage.setItem("data-body-image", "img-1");
                document.documentElement.setAttribute("data-body-image", "img-1");

                if (document.getElementById("theme-settings-offcanvas")) {
                  document.getElementById("sidebar-img").style.display = "none";
                  document.documentElement.removeAttribute("data-sidebar-image");
                }
              } else if (sessionStorage.getItem("data-body-image") == "img-2") {
                sessionStorage.setItem("data-body-image", "img-2");
                document.documentElement.setAttribute("data-body-image", "img-2");
              } else if (sessionStorage.getItem("data-body-image") == "img-3") {
                sessionStorage.setItem("data-body-image", "img-3");
                document.documentElement.setAttribute("data-body-image", "img-3");
              } else if (sessionStorage.getItem("data-body-image") == "none") {
                sessionStorage.setItem("data-body-image", "none");
                document.documentElement.setAttribute("data-body-image", "none");
              }
              break;
          }
        }
      },
    },
  },
  components: { simpleBar },
};
</script>

<template>
  <div>
    <div id="preloader">
      <div id="status">
        <div class="spinner-border text-primary avatar-sm" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>

    <BButton variant="primary" @click="topFunction" class="btn-icon" id="back-to-top">
      <i class="ri-arrow-up-line"></i>
    </BButton>

    <div class="customizer-setting" @click="click">
      <div class="btn-primary rounded-pill shadow-lg btn btn-icon btn-lg p-2" data-bs-toggle="offcanvas" data-bs-target="#theme-settings-offcanvas" aria-controls="theme-settings-offcanvas" id="mdi-cog">
        <i class="mdi mdi-spin mdi-cog-outline fs-22"></i>
      </div>
    </div>
    <BOffcanvas class="border-0" id="theme-settings-offcanvas" header-class="d-flex align-items-center bg-primary bg-gradient p-3" body-class="p-0" footer-class="border-top p-3 text-center" placement="end" v-model="show">
      <template #header>
        <div class="me-2">
          <h5 class="m-0 me-2 text-white">Theme & UI Customizer</h5>
        </div>
        <button type="button" class="btn-close btn-close-white ms-auto" id="customizerclose-btn" @click="click"></button>
      </template>

      <!-- Customizer Mode Tabs -->
      <div class="px-3 pt-3 pb-2 border-bottom bg-light">
        <ul class="nav nav-pills nav-justified p-1 bg-white rounded shadow-sm">
          <li class="nav-item">
            <a
              href="javascript:void(0);"
              class="nav-link py-2 fs-13 fw-semibold cursor-pointer"
              :class="{ active: activeTab === 'components' }"
              @click="activeTab = 'components'"
            >
              <i class="ri-palette-line me-1 align-middle"></i> Component Styles
            </a>
          </li>
          <li class="nav-item">
            <a
              href="javascript:void(0);"
              class="nav-link py-2 fs-13 fw-semibold cursor-pointer"
              :class="{ active: activeTab === 'layout' }"
              @click="activeTab = 'layout'"
            >
              <i class="ri-layout-line me-1 align-middle"></i> Layout & Shell
            </a>
          </li>
        </ul>
      </div>

      <simpleBar class="h-100">
        <!-- Component Styles Tab -->
        <div v-show="activeTab === 'components'" class="p-4">
          <!-- Live Preview Sandbox -->
          <div class="card border border-primary-subtle shadow-sm mb-4">
            <div class="card-header bg-primary-subtle py-2 d-flex align-items-center justify-content-between">
              <span class="fs-12 fw-bold text-uppercase text-primary">
                <i class="ri-eye-line me-1 align-middle"></i> Live Preview Sandbox
              </span>
              <span class="badge bg-primary fs-10 text-uppercase">Real-time</span>
            </div>
            <div class="card-body p-3">
              <!-- Buttons Demo -->
              <div class="mb-3">
                <label class="form-label fs-11 text-muted text-uppercase fw-semibold mb-1">Buttons</label>
                <div class="d-flex flex-wrap gap-2">
                  <button type="button" class="btn btn-primary btn-sm">Primary</button>
                  <button type="button" class="btn btn-soft-primary btn-sm">Soft</button>
                  <button type="button" class="btn btn-outline-primary btn-sm">Outline</button>
                </div>
              </div>

              <!-- Form Input Demo -->
              <div class="mb-3">
                <label class="form-label fs-11 text-muted text-uppercase fw-semibold mb-1">Form Input</label>
                <input
                  type="text"
                  class="form-control form-control-sm"
                  v-model="demoInputText"
                  placeholder="Type to test input..."
                />
              </div>

              <!-- Form Textarea Demo -->
              <div class="mb-3">
                <label class="form-label fs-11 text-muted text-uppercase fw-semibold mb-1">Textarea</label>
                <textarea
                  class="form-control form-control-sm"
                  rows="2"
                  v-model="demoTextareaText"
                  placeholder="Test textarea styling..."
                ></textarea>
              </div>

              <!-- Checkbox & Switch Demo -->
              <div>
                <label class="form-label fs-11 text-muted text-uppercase fw-semibold mb-1">Checkbox & Switch</label>
                <div class="d-flex align-items-center gap-3">
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="demoCheckbox"
                      v-model="demoCheckbox"
                    />
                    <label class="form-check-label fs-12 ms-1 cursor-pointer" for="demoCheckbox">Checkbox</label>
                  </div>
                  <div class="form-check form-switch">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="demoSwitch"
                      v-model="demoSwitch"
                    />
                    <label class="form-check-label fs-12 ms-1 cursor-pointer" for="demoSwitch">Switch</label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 1. System Theme Colors -->
          <div class="mb-4">
            <div class="d-flex align-items-center justify-content-between mb-1">
              <h6 class="mb-0 fw-semibold text-uppercase fs-12">System Theme Color</h6>
              <span class="badge bg-light text-muted border fs-11 font-monospace">{{ themeConfig.primaryColor }}</span>
            </div>
            <p class="text-muted fs-12 mb-2">Applies to buttons, links, accents, active states & form rings across all pages.</p>
            
            <div class="d-flex flex-wrap gap-2 mb-3">
              <button
                v-for="preset in colorPresets"
                :key="preset.id"
                type="button"
                class="theme-swatch-btn"
                :class="{ active: themeConfig.presetColor === preset.id }"
                :style="{ backgroundColor: preset.hex }"
                :title="preset.name"
                @click="selectPresetColor(preset)"
              >
                <i v-if="themeConfig.presetColor === preset.id" class="ri-check-line text-white fs-14"></i>
              </button>
            </div>

            <div class="d-flex align-items-center gap-2">
              <input
                type="color"
                class="form-control form-control-color p-1 cursor-pointer"
                :value="themeConfig.primaryColor"
                @input="onCustomColorInput"
                title="Choose custom brand color"
                style="width: 44px; height: 36px;"
              />
              <div class="input-group input-group-sm">
                <span class="input-group-text">HEX</span>
                <input
                  type="text"
                  class="form-control"
                  :value="themeConfig.primaryColor"
                  @change="onCustomColorInput"
                  placeholder="#405189"
                />
              </div>
            </div>
          </div>

          <!-- 2. Buttons Configuration -->
          <div class="mb-4">
            <h6 class="mb-1 fw-semibold text-uppercase fs-12">Buttons</h6>
            <p class="text-muted fs-12 mb-2">Configure corner radius, typography weight, and hover response.</p>

            <label class="form-label fs-11 text-muted text-uppercase fw-semibold mb-1">Corner Radius</label>
            <BRow class="g-2 mb-3">
              <BCol cols="6" v-for="opt in buttonRadiusOptions" :key="opt.id">
                <div
                  class="border rounded p-2 text-center cursor-pointer transition-all"
                  :class="{ 'border-primary bg-primary-subtle text-primary fw-semibold': themeConfig.buttonRadius === opt.id }"
                  @click="setThemeProp('buttonRadius', opt.id)"
                >
                  <span class="fs-12">{{ opt.name }}</span>
                </div>
              </BCol>
            </BRow>

            <label class="form-label fs-11 text-muted text-uppercase fw-semibold mb-1">Font Weight</label>
            <BRow class="g-2 mb-3">
              <BCol cols="6" v-for="opt in buttonWeightOptions" :key="opt.id">
                <div
                  class="border rounded p-2 text-center cursor-pointer transition-all"
                  :class="{ 'border-primary bg-primary-subtle text-primary fw-semibold': themeConfig.buttonWeight === opt.id }"
                  @click="setThemeProp('buttonWeight', opt.id)"
                >
                  <span class="fs-12">{{ opt.name }}</span>
                </div>
              </BCol>
            </BRow>

            <label class="form-label fs-11 text-muted text-uppercase fw-semibold mb-1">Hover Animation</label>
            <BRow class="g-2">
              <BCol cols="4" v-for="opt in buttonHoverOptions" :key="opt.id">
                <div
                  class="border rounded p-2 text-center cursor-pointer transition-all"
                  :class="{ 'border-primary bg-primary-subtle text-primary fw-semibold': themeConfig.buttonHoverEffect === opt.id }"
                  @click="setThemeProp('buttonHoverEffect', opt.id)"
                >
                  <span class="fs-11">{{ opt.name }}</span>
                </div>
              </BCol>
            </BRow>
          </div>

          <!-- 3. Form Input & Textarea Configuration -->
          <div class="mb-4">
            <h6 class="mb-1 fw-semibold text-uppercase fs-12">Form Inputs & Textarea</h6>
            <p class="text-muted fs-12 mb-2">Configures inputs, textareas, and select elements across the whole application.</p>

            <label class="form-label fs-11 text-muted text-uppercase fw-semibold mb-1">Corner Radius</label>
            <BRow class="g-2 mb-3">
              <BCol cols="6" v-for="opt in inputRadiusOptions" :key="opt.id">
                <div
                  class="border rounded p-2 text-center cursor-pointer transition-all"
                  :class="{ 'border-primary bg-primary-subtle text-primary fw-semibold': themeConfig.inputRadius === opt.id }"
                  @click="setThemeProp('inputRadius', opt.id)"
                >
                  <span class="fs-12">{{ opt.name }}</span>
                </div>
              </BCol>
            </BRow>

            <label class="form-label fs-11 text-muted text-uppercase fw-semibold mb-1">Border Thickness</label>
            <BRow class="g-2 mb-3">
              <BCol cols="6" v-for="opt in inputBorderWidthOptions" :key="opt.id">
                <div
                  class="border rounded p-2 text-center cursor-pointer transition-all"
                  :class="{ 'border-primary bg-primary-subtle text-primary fw-semibold': themeConfig.inputBorderWidth === opt.id }"
                  @click="setThemeProp('inputBorderWidth', opt.id)"
                >
                  <span class="fs-12">{{ opt.name }}</span>
                </div>
              </BCol>
            </BRow>

            <label class="form-label fs-11 text-muted text-uppercase fw-semibold mb-1">Focus Ring Style</label>
            <BRow class="g-2">
              <BCol cols="4" v-for="opt in inputFocusRingOptions" :key="opt.id">
                <div
                  class="border rounded p-2 text-center cursor-pointer transition-all"
                  :class="{ 'border-primary bg-primary-subtle text-primary fw-semibold': themeConfig.inputFocusRing === opt.id }"
                  @click="setThemeProp('inputFocusRing', opt.id)"
                >
                  <span class="fs-11">{{ opt.name }}</span>
                </div>
              </BCol>
            </BRow>
          </div>

          <!-- 4. Checkbox & Switch Configuration -->
          <div class="mb-4">
            <h6 class="mb-1 fw-semibold text-uppercase fs-12">Checkboxes & Switches</h6>
            <p class="text-muted fs-12 mb-2">Controls shape, size and border width for checkboxes, radios and toggle switches.</p>

            <label class="form-label fs-11 text-muted text-uppercase fw-semibold mb-1">Corner Shape</label>
            <BRow class="g-2 mb-3">
              <BCol cols="4" v-for="opt in checkboxRadiusOptions" :key="opt.id">
                <div
                  class="border rounded p-2 text-center cursor-pointer transition-all"
                  :class="{ 'border-primary bg-primary-subtle text-primary fw-semibold': themeConfig.checkboxRadius === opt.id }"
                  @click="setThemeProp('checkboxRadius', opt.id)"
                >
                  <span class="fs-12">{{ opt.name }}</span>
                </div>
              </BCol>
            </BRow>

            <label class="form-label fs-11 text-muted text-uppercase fw-semibold mb-1">Size</label>
            <BRow class="g-2 mb-3">
              <BCol cols="4" v-for="opt in checkboxSizeOptions" :key="opt.id">
                <div
                  class="border rounded p-2 text-center cursor-pointer transition-all"
                  :class="{ 'border-primary bg-primary-subtle text-primary fw-semibold': themeConfig.checkboxSize === opt.id }"
                  @click="setThemeProp('checkboxSize', opt.id)"
                >
                  <span class="fs-11">{{ opt.name }}</span>
                </div>
              </BCol>
            </BRow>

            <label class="form-label fs-11 text-muted text-uppercase fw-semibold mb-1">Border Thickness</label>
            <BRow class="g-2">
              <BCol cols="4" v-for="opt in checkboxBorderOptions" :key="opt.id">
                <div
                  class="border rounded p-2 text-center cursor-pointer transition-all"
                  :class="{ 'border-primary bg-primary-subtle text-primary fw-semibold': themeConfig.checkboxBorderWidth === opt.id }"
                  @click="setThemeProp('checkboxBorderWidth', opt.id)"
                >
                  <span class="fs-12">{{ opt.name }}</span>
                </div>
              </BCol>
            </BRow>
          </div>

          <div class="pt-2 mb-3">
            <button
              type="button"
              class="btn btn-outline-danger btn-sm w-100"
              @click="resetComponentStyles"
            >
              <i class="ri-refresh-line me-1"></i> Reset Component Styles
            </button>
          </div>
        </div>

        <!-- Layout & Shell Tab -->
        <div v-show="activeTab === 'layout'" class="p-4">
          <h6 class="mb-0 fw-semibold text-uppercase">Layout</h6>
          <p class="text-muted">Choose your layout</p>

          <BRow class="gy-3">
            <BCol cols="4">
              <div class="form-check card-radio">
                <input id="customizer-layout01" name="data-layout" type="radio" value="vertical" class="form-check-input" v-model="layoutType" />
                <label class="form-check-label p-0 avatar-md w-100" for="customizer-layout01">
                  <span class="d-flex gap-1 h-100">
                    <span class="flex-shrink-0">
                      <span class="bg-light d-flex h-100 flex-column gap-1 p-1">
                        <span class="d-block p-1 px-2 bg-primary-subtle rounded mb-2"></span>
                        <span class="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                        <span class="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                        <span class="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                      </span>
                    </span>
                    <span class="flex-grow-1">
                      <span class="d-flex h-100 flex-column">
                        <span class="bg-light d-block p-1"></span>
                        <span class="bg-light d-block p-1 mt-auto"></span>
                      </span>
                    </span>
                  </span>
                </label>
              </div>
              <h5 class="fs-13 text-center mt-2">Vertical</h5>
            </BCol>
            <BCol cols="4">
              <div class="form-check card-radio">
                <input id="customizer-layout02" name="data-layout" type="radio" value="horizontal" class="form-check-input" v-model="layoutType" />
                <label class="form-check-label p-0 avatar-md w-100" for="customizer-layout02">
                  <span class="d-flex h-100 flex-column gap-1">
                    <span class="bg-light d-flex p-1 gap-1 align-items-center">
                      <span class="d-block p-1 bg-primary-subtle rounded me-1"></span>
                      <span class="d-block p-1 pb-0 px-2 bg-primary-subtle ms-auto"></span>
                      <span class="d-block p-1 pb-0 px-2 bg-primary-subtle"></span>
                    </span>
                    <span class="bg-light d-block p-1"></span>
                    <span class="bg-light d-block p-1 mt-auto"></span>
                  </span>
                </label>
              </div>
              <h5 class="fs-13 text-center mt-2">Horizontal</h5>
            </BCol>
            <BCol cols="4">
              <div class="form-check card-radio">
                <input id="customizer-layout03" name="data-layout" type="radio" value="twocolumn" class="form-check-input" v-model="layoutType" />
                <label class="form-check-label p-0 avatar-md w-100" for="customizer-layout03">
                  <span class="d-flex gap-1 h-100">
                    <span class="flex-shrink-0">
                      <span class="bg-light d-flex h-100 flex-column gap-1">
                        <span class="d-block p-1 bg-primary-subtle mb-2"></span>
                        <span class="d-block p-1 pb-0 bg-primary-subtle"></span>
                        <span class="d-block p-1 pb-0 bg-primary-subtle"></span>
                        <span class="d-block p-1 pb-0 bg-primary-subtle"></span>
                      </span>
                    </span>
                    <span class="flex-shrink-0">
                      <span class="bg-light d-flex h-100 flex-column gap-1 p-1">
                        <span class="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                        <span class="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                        <span class="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                        <span class="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                      </span>
                    </span>
                    <span class="flex-grow-1">
                      <span class="d-flex h-100 flex-column">
                        <span class="bg-light d-block p-1"></span>
                        <span class="bg-light d-block p-1 mt-auto"></span>
                      </span>
                    </span>
                  </span>
                </label>
              </div>
              <h5 class="fs-13 text-center mt-2">Two Column</h5>
            </BCol>
            <BCol cols="4">
              <div class="form-check card-radio">
                <input id="customizer-layout04" name="data-layout" type="radio" value="semibox" class="form-check-input" v-model="layoutType" />
                <label class="form-check-label p-0 avatar-md w-100" for="customizer-layout04">
                  <span class="d-flex gap-1 h-100">
                    <span class="flex-shrink-0 p-1">
                      <span class="bg-light d-flex h-100 flex-column gap-1 p-1">
                        <span class="d-block p-1 px-2 bg-primary-subtle rounded mb-2"></span>
                        <span class="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                        <span class="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                        <span class="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                      </span>
                    </span>
                    <span class="flex-grow-1">
                      <span class="d-flex h-100 flex-column pt-1 pe-2">
                        <span class="bg-light d-block p-1"></span>
                        <span class="bg-light d-block p-1 mt-auto"></span>
                      </span>
                    </span>
                  </span>
                </label>
              </div>
              <h5 class="fs-13 text-center mt-2">Semi Box</h5>
            </BCol>
          </BRow>

          <h6 class="mt-4 mb-0 fw-semibold text-uppercase">Color Scheme</h6>
          <p class="text-muted">Choose Light or Dark Scheme.</p>

          <div class="colorscheme-cardradio">
            <BRow>
              <BCol cols="4">
                <div class="form-check card-radio">
                  <input class="form-check-input" type="radio" name="data-bs-theme" id="layout-mode-light" value="light" v-model="mode" />
                  <label class="form-check-label p-0 avatar-md w-100" for="layout-mode-light">
                    <span class="d-flex gap-1 h-100">
                      <span class="flex-shrink-0">
                        <span class="bg-light d-flex h-100 flex-column gap-1 p-1">
                          <span class="d-block p-1 px-2 bg-primary-subtle rounded mb-2"></span>
                          <span class="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                          <span class="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                          <span class="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                        </span>
                      </span>
                      <span class="flex-grow-1">
                        <span class="d-flex h-100 flex-column">
                          <span class="bg-light d-block p-1"></span>
                          <span class="bg-light d-block p-1 mt-auto"></span>
                        </span>
                      </span>
                    </span>
                  </label>
                </div>
                <h5 class="fs-13 text-center mt-2">Light</h5>
              </BCol>

              <BCol cols="4">
                <div class="form-check card-radio dark">
                  <input class="form-check-input" v-model="mode" type="radio" name="data-bs-theme" id="layout-mode-dark" value="dark" />
                  <label class="form-check-label p-0 avatar-md w-100 bg-dark" for="layout-mode-dark">
                    <span class="d-flex gap-1 h-100">
                      <span class="flex-shrink-0">
                        <span class="bg-white bg-opacity-10 d-flex h-100 flex-column gap-1 p-1">
                          <span class="d-block p-1 px-2 bg-white bg-opacity-10 rounded mb-2"></span>
                          <span class="d-block p-1 px-2 pb-0 bg-white bg-opacity-10"></span>
                          <span class="d-block p-1 px-2 pb-0 bg-white bg-opacity-10"></span>
                          <span class="d-block p-1 px-2 pb-0 bg-white bg-opacity-10"></span>
                        </span>
                      </span>
                      <span class="flex-grow-1">
                        <span class="d-flex h-100 flex-column">
                          <span class="bg-white bg-opacity-10 d-block p-1"></span>
                          <span class="bg-white bg-opacity-10 d-block p-1 mt-auto"></span>
                        </span>
                      </span>
                    </span>
                  </label>
                </div>
                <h5 class="fs-13 text-center mt-2">Dark</h5>
              </BCol>
            </BRow>
          </div>
          <div id="sidebar-visibility" v-if="layoutType == 'semibox'">
            <h6 class="mt-4 mb-0 fw-semibold text-uppercase">
              Sidebar Visibility
            </h6>
            <p class="text-muted">Choose show or Hidden sidebar.</p>

            <BRow>
              <BCol cols="4">
                <div class="form-check card-radio">
                  <input class="form-check-input" type="radio" name="data-sidebar-visibility" id="sidebar-visibility-show" value="show" v-model="visibility" />
                  <label class="form-check-label p-0 avatar-md w-100" for="sidebar-visibility-show">
                    <span class="d-flex gap-1 h-100">
                      <span class="flex-shrink-0 p-1">
                        <span class="bg-light d-flex h-100 flex-column gap-1 p-1">
                          <span class="d-block p-1 px-2 bg-primary-subtle rounded mb-2"></span>
                          <span class="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                          <span class="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                          <span class="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                        </span>
                      </span>
                      <span class="flex-grow-1">
                        <span class="d-flex h-100 flex-column pt-1 pe-2">
                          <span class="bg-light d-block p-1"></span>
                          <span class="bg-light d-block p-1 mt-auto"></span>
                        </span>
                      </span>
                    </span>
                  </label>
                </div>
                <h5 class="fs-13 text-center mt-2">Show</h5>
              </BCol>
              <BCol cols="4">
                <div class="form-check card-radio">
                  <input class="form-check-input" type="radio" name="data-sidebar-visibility" id="sidebar-visibility-hidden" value="hidden" v-model="visibility" />
                  <label class="form-check-label p-0 avatar-md w-100 px-2" for="sidebar-visibility-hidden">
                    <span class="d-flex gap-1 h-100">
                      <span class="flex-grow-1">
                        <span class="d-flex h-100 flex-column pt-1 px-2">
                          <span class="bg-light d-block p-1"></span>
                          <span class="bg-light d-block p-1 mt-auto"></span>
                        </span>
                      </span>
                    </span>
                  </label>
                </div>
                <h5 class="fs-13 text-center mt-2">Hidden</h5>
              </BCol>
            </BRow>
          </div>

          <div v-if="layoutType == 'vertical' || layoutType == 'horizontal'" id="layout-width">
            <h6 class="mt-4 mb-0 fw-semibold text-uppercase">Layout Width</h6>
            <p class="text-muted">Choose Fluid or Boxed layout.</p>

            <BRow>
              <BCol cols="4">
                <div class="form-check card-radio">
                  <input class="form-check-input" type="radio" v-model="layoutWidth" name="data-layout-width" id="layout-width-fluid" value="fluid" />
                  <label class="form-check-label p-0 avatar-md w-100" for="layout-width-fluid">
                    <span class="d-flex gap-1 h-100">
                      <span class="flex-shrink-0">
                        <span class="bg-light d-flex h-100 flex-column gap-1 p-1">
                          <span class="d-block p-1 px-2 bg-primary-subtle rounded mb-2"></span>
                          <span class="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                          <span class="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                          <span class="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                        </span>
                      </span>
                      <span class="flex-grow-1">
                        <span class="d-flex h-100 flex-column">
                          <span class="bg-light d-block p-1"></span>
                          <span class="bg-light d-block p-1 mt-auto"></span>
                        </span>
                      </span>
                    </span>
                  </label>
                </div>
                <h5 class="fs-13 text-center mt-2">Fluid</h5>
              </BCol>
              <BCol cols="4">
                <div class="form-check card-radio">
                  <input class="form-check-input" type="radio" v-model="layoutWidth" name="data-layout-width" id="layout-width-boxed" value="boxed" />
                  <label class="form-check-label p-0 avatar-md w-100 px-2" for="layout-width-boxed">
                    <span class="d-flex gap-1 h-100 border-start border-end">
                      <span class="flex-shrink-0">
                        <span class="bg-light d-flex h-100 flex-column gap-1 p-1">
                          <span class="d-block p-1 px-2 bg-primary-subtle rounded mb-2"></span>
                          <span class="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                          <span class="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                          <span class="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                        </span>
                      </span>
                      <span class="flex-grow-1">
                        <span class="d-flex h-100 flex-column">
                          <span class="bg-light d-block p-1"></span>
                          <span class="bg-light d-block p-1 mt-auto"></span>
                        </span>
                      </span>
                    </span>
                  </label>
                </div>
                <h5 class="fs-13 text-center mt-2">Boxed</h5>
              </BCol>
            </BRow>
          </div>

          <div v-if="layoutType != 'twocolumn'" id="layout-position">
            <h6 class="mt-4 mb-0 fw-semibold text-uppercase">
              Layout Position
            </h6>
            <p class="text-muted">
              Choose Fixed or Scrollable Layout Position.
            </p>

            <div class="btn-group radio" role="group">
              <input type="radio" class="btn-check" name="data-layout-position" id="layout-position-fixed" value="fixed" v-model="position" />
              <label class="btn btn-light w-sm" for="layout-position-fixed">Fixed</label>

              <input type="radio" class="btn-check" name="data-layout-position" id="layout-position-scrollable" value="scrollable" v-model="position" />
              <label class="btn btn-light w-sm ms-0" for="layout-position-scrollable">Scrollable</label>
            </div>
          </div>
          <h6 class="mt-4 mb-0 fw-semibold text-uppercase">Topbar Color</h6>
          <p class="text-muted">Choose Light or Dark Topbar Color.</p>

          <BRow>
            <BCol cols="4">
              <div class="form-check card-radio">
                <input class="form-check-input" type="radio" name="data-topbar" id="topbar-color-light" value="light" v-model="topbar" />
                <label class="form-check-label p-0 avatar-md w-100" for="topbar-color-light">
                  <span class="d-flex gap-1 h-100">
                    <span class="flex-shrink-0">
                      <span class="bg-light d-flex h-100 flex-column gap-1 p-1">
                        <span class="d-block p-1 px-2 bg-primary-subtle rounded mb-2"></span>

                        <span class="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                        <span class="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                        <span class="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                      </span>
                    </span>
                    <span class="flex-grow-1">
                      <span class="d-flex h-100 flex-column">
                        <span class="bg-light d-block p-1"></span>
                        <span class="bg-light d-block p-1 mt-auto"></span>
                      </span>
                    </span>
                  </span>
                </label>
              </div>
              <h5 class="fs-13 text-center mt-2">Light</h5>
            </BCol>
            <BCol cols="4">
              <div class="form-check card-radio">
                <input class="form-check-input" type="radio" name="data-topbar" id="topbar-color-dark" value="dark" v-model="topbar" />
                <label class="form-check-label p-0 avatar-md w-100" for="topbar-color-dark">
                  <span class="d-flex gap-1 h-100">
                    <span class="flex-shrink-0">
                      <span class="bg-light d-flex h-100 flex-column gap-1 p-1">
                        <span class="d-block p-1 px-2 bg-primary-subtle rounded mb-2"></span>

                        <span class="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                        <span class="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                        <span class="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                      </span>
                    </span>
                    <span class="flex-grow-1">
                      <span class="d-flex h-100 flex-column">
                        <span class="bg-primary d-block p-1"></span>
                        <span class="bg-light d-block p-1 mt-auto"></span>
                      </span>
                    </span>
                  </span>
                </label>
              </div>
              <h5 class="fs-13 text-center mt-2">Dark</h5>
            </BCol>
          </BRow>
          <div v-if="layoutType == 'vertical' ||
            (layoutType == 'semibox' && visibility == 'show')
            " id="sidebar-size">
            <h6 class="mt-4 mb-0 fw-semibold text-uppercase">Sidebar Size</h6>
            <p class="text-muted">Choose a size of Sidebar.</p>

            <BRow>
              <BCol cols="4">
                <div class="form-check sidebar-setting card-radio">
                  <input class="form-check-input" type="radio" name="data-sidebar-size" id="sidebar-size-default" v-model="sidebarSize" value="lg" />
                  <label class="form-check-label p-0 avatar-md w-100" for="sidebar-size-default">
                    <span class="d-flex gap-1 h-100">
                      <span class="flex-shrink-0">
                        <span class="bg-light d-flex h-100 flex-column gap-1 p-1">
                          <span class="d-block p-1 px-2 bg-primary-subtle rounded mb-2"></span>

                          <span class="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                          <span class="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                          <span class="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                        </span>
                      </span>
                      <span class="flex-grow-1">
                        <span class="d-flex h-100 flex-column">
                          <span class="bg-light d-block p-1"></span>
                          <span class="bg-light d-block p-1 mt-auto"></span>
                        </span>
                      </span>
                    </span>
                  </label>
                </div>
                <h5 class="fs-13 text-center mt-2">Default</h5>
              </BCol>

              <BCol cols="4">
                <div class="form-check sidebar-setting card-radio">
                  <input class="form-check-input" type="radio" name="data-sidebar-size" id="sidebar-size-compact" v-model="sidebarSize" value="md" />
                  <label class="form-check-label p-0 avatar-md w-100" for="sidebar-size-compact">
                    <span class="d-flex gap-1 h-100">
                      <span class="flex-shrink-0">
                        <span class="bg-light d-flex h-100 flex-column gap-1 p-1">
                          <span class="d-block p-1 bg-primary-subtle rounded mb-2"></span>
                          <span class="d-block p-1 pb-0 bg-primary-subtle"></span>
                          <span class="d-block p-1 pb-0 bg-primary-subtle"></span>
                          <span class="d-block p-1 pb-0 bg-primary-subtle"></span>
                        </span>
                      </span>
                      <span class="flex-grow-1">
                        <span class="d-flex h-100 flex-column">
                          <span class="bg-light d-block p-1"></span>
                          <span class="bg-light d-block p-1 mt-auto"></span>
                        </span>
                      </span>
                    </span>
                  </label>
                </div>
                <h5 class="fs-13 text-center mt-2">Compact</h5>
              </BCol>

              <BCol cols="4">
                <div class="form-check sidebar-setting card-radio">
                  <input class="form-check-input" v-model="sidebarSize" type="radio" name="data-sidebar-size" id="sidebar-size-small" value="sm" />
                  <label class="form-check-label p-0 avatar-md w-100" for="sidebar-size-small">
                    <span class="d-flex gap-1 h-100">
                      <span class="flex-shrink-0">
                        <span class="bg-light d-flex h-100 flex-column gap-1">
                          <span class="d-block p-1 bg-primary-subtle mb-2"></span>
                          <span class="d-block p-1 pb-0 bg-primary-subtle"></span>
                          <span class="d-block p-1 pb-0 bg-primary-subtle"></span>
                          <span class="d-block p-1 pb-0 bg-primary-subtle"></span>
                        </span>
                      </span>
                      <span class="flex-grow-1">
                        <span class="d-flex h-100 flex-column">
                          <span class="bg-light d-block p-1"></span>
                          <span class="bg-light d-block p-1 mt-auto"></span>
                        </span>
                      </span>
                    </span>
                  </label>
                </div>
                <h5 class="fs-13 text-center mt-2">Small (Icon View)</h5>
              </BCol>

              <BCol cols="4">
                <div class="form-check sidebar-setting card-radio">
                  <input class="form-check-input" v-model="sidebarSize" type="radio" name="data-sidebar-size" id="sidebar-size-small-hover" value="sm-hover" />
                  <label class="form-check-label p-0 avatar-md w-100" for="sidebar-size-small-hover">
                    <span class="d-flex gap-1 h-100">
                      <span class="flex-shrink-0">
                        <span class="bg-light d-flex h-100 flex-column gap-1">
                          <span class="d-block p-1 bg-primary-subtle mb-2"></span>
                          <span class="d-block p-1 pb-0 bg-primary-subtle"></span>
                          <span class="d-block p-1 pb-0 bg-primary-subtle"></span>
                          <span class="d-block p-1 pb-0 bg-primary-subtle"></span>
                        </span>
                      </span>
                      <span class="flex-grow-1">
                        <span class="d-flex h-100 flex-column">
                          <span class="bg-light d-block p-1"></span>
                          <span class="bg-light d-block p-1 mt-auto"></span>
                        </span>
                      </span>
                    </span>
                  </label>
                </div>
                <h5 class="fs-13 text-center mt-2">Small Hover View</h5>
              </BCol>
            </BRow>
          </div>

          <div v-if="layoutType == 'vertical'" id="sidebar-view">
            <h6 class="mt-4 mb-0 fw-semibold text-uppercase">Sidebar View</h6>
            <p class="text-muted">Choose Default or Detached Sidebar view.</p>

            <BRow>
              <BCol cols="4">
                <div class="form-check sidebar-setting card-radio">
                  <input class="form-check-input" v-model="sidebarView" type="radio" name="data-layout-style" id="sidebar-view-default" value="default" />
                  <label class="form-check-label p-0 avatar-md w-100" for="sidebar-view-default">
                    <span class="d-flex gap-1 h-100">
                      <span class="flex-shrink-0">
                        <span class="bg-light d-flex h-100 flex-column gap-1 p-1">
                          <span class="d-block p-1 px-2 bg-primary-subtle rounded mb-2"></span>

                          <span class="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                          <span class="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                          <span class="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                        </span>
                      </span>
                      <span class="flex-grow-1">
                        <span class="d-flex h-100 flex-column">
                          <span class="bg-light d-block p-1"></span>
                          <span class="bg-light d-block p-1 mt-auto"></span>
                        </span>
                      </span>
                    </span>
                  </label>
                </div>
                <h5 class="fs-13 text-center mt-2">Default</h5>
              </BCol>
              <BCol cols="4">
                <div class="form-check sidebar-setting card-radio">
                  <input class="form-check-input" v-model="sidebarView" type="radio" name="data-layout-style" id="sidebar-view-detached" value="detached" />
                  <label class="form-check-label p-0 avatar-md w-100" for="sidebar-view-detached">
                    <span class="d-flex h-100 flex-column">
                      <span class="bg-light d-flex p-1 gap-1 align-items-center px-2">
                        <span class="d-block p-1 bg-primary-subtle rounded me-1"></span>
                        <span class="d-block p-1 pb-0 px-2 bg-primary-subtle ms-auto"></span>

                        <span class="d-block p-1 pb-0 px-2 bg-primary-subtle"></span>
                      </span>
                      <span class="d-flex gap-1 h-100 p-1 px-2">
                        <span class="flex-shrink-0">
                          <span class="bg-light d-flex h-100 flex-column gap-1 p-1">
                            <span class="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                            <span class="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                            <span class="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                          </span>
                        </span>
                      </span>
                      <span class="bg-light d-block p-1 mt-auto px-2"></span>
                    </span>
                  </label>
                </div>
                <h5 class="fs-13 text-center mt-2">Detached</h5>
              </BCol>
            </BRow>
          </div>

          <div v-if="layoutType == 'vertical' ||
            layoutType === 'twocolumn' ||
            (layoutType === 'semibox' && visibility === 'show')
            " id="sidebar-color">
            <h6 class="mt-4 mb-0 fw-semibold text-uppercase">Sidebar Color</h6>
            <p class="text-muted">Choose Ligth or Dark Sidebar Color.</p>

            <BRow>
              <BCol cols="4">
                <div class="form-check sidebar-setting card-radio">
                  <input class="form-check-input" v-model="sidebarColor" type="radio" name="data-sidebar" id="sidebar-color-light" value="light" @click="onSideBarColorClick('light')" />
                  <label class="form-check-label p-0 avatar-md w-100" for="sidebar-color-light">
                    <span class="d-flex gap-1 h-100">
                      <span class="flex-shrink-0">
                        <span class="bg-white border-end d-flex h-100 flex-column gap-1 p-1">
                          <span class="d-block p-1 px-2 bg-primary-subtle rounded mb-2"></span>

                          <span class="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                          <span class="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                          <span class="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                        </span>
                      </span>
                      <span class="flex-grow-1">
                        <span class="d-flex h-100 flex-column">
                          <span class="bg-light d-block p-1"></span>
                          <span class="bg-light d-block p-1 mt-auto"></span>
                        </span>
                      </span>
                    </span>
                  </label>
                </div>
                <h5 class="fs-13 text-center mt-2">Light</h5>
              </BCol>
              <BCol cols="4">
                <div class="form-check sidebar-setting card-radio">
                  <input class="form-check-input" v-model="sidebarColor" type="radio" name="data-sidebar" id="sidebar-color-dark" value="dark" @click="onSideBarColorClick('dark')" />
                  <label class="form-check-label p-0 avatar-md w-100" for="sidebar-color-dark">
                    <span class="d-flex gap-1 h-100">
                      <span class="flex-shrink-0">
                        <span class="bg-primary d-flex h-100 flex-column gap-1 p-1">
                          <span class="d-block p-1 px-2 bg-white bg-opacity-10 rounded mb-2"></span>
                          <span class="d-block p-1 px-2 pb-0 bg-white bg-opacity-10"></span>
                          <span class="d-block p-1 px-2 pb-0 bg-white bg-opacity-10"></span>
                          <span class="d-block p-1 px-2 pb-0 bg-white bg-opacity-10"></span>
                        </span>
                      </span>
                      <span class="flex-grow-1">
                        <span class="d-flex h-100 flex-column">
                          <span class="bg-light d-block p-1"></span>
                          <span class="bg-light d-block p-1 mt-auto"></span>
                        </span>
                      </span>
                    </span>
                  </label>
                </div>
                <h5 class="fs-13 text-center mt-2">Dark</h5>
              </BCol>
              <BCol cols="4">
                <!-- -->
                <button class="btn btn-link avatar-md w-100 p-0 overflow-hidden border collapsed " type="button" v-b-toggle="'collapseBgGradient'" @click="onSideBarColorClick('gradient')">
                  <span class="d-flex gap-1 h-100">
                    <span class="flex-shrink-0">
                      <span class="bg-vertical-gradient d-flex h-100 flex-column gap-1 p-1">
                        <span class="d-block p-1 px-2 bg-white bg-opacity-10 rounded mb-2"></span>
                        <span class="d-block p-1 px-2 pb-0 bg-white bg-opacity-10"></span>
                        <span class="d-block p-1 px-2 pb-0 bg-white bg-opacity-10"></span>
                        <span class="d-block p-1 px-2 pb-0 bg-white bg-opacity-10"></span>
                      </span>
                    </span>
                    <span class="flex-grow-1">
                      <span class="d-flex h-100 flex-column">
                        <span class="bg-light d-block p-1"></span>
                        <span class="bg-light d-block p-1 mt-auto"></span>
                      </span>
                    </span>
                  </span>
                </button>
                <h5 class="fs-13 text-center mt-2">Gradient</h5>
              </BCol>
            </BRow>
            <BCollapse v-if="showGradients" id="collapseBgGradient">
              <div class="d-flex gap-2 flex-wrap img-switch p-2 px-3 bg-light rounded">
                <div class="form-check sidebar-setting card-radio">
                  <input class="form-check-input" type="radio" v-model="sidebarColor" name="data-sidebar" id="sidebar-color-gradient" value="gradient" />
                  <label class="form-check-label p-0 avatar-xs rounded-circle" for="sidebar-color-gradient">
                    <span class="avatar-title rounded-circle bg-vertical-gradient"></span>
                  </label>
                </div>
                <div class="form-check sidebar-setting card-radio">
                  <input class="form-check-input" type="radio" v-model="sidebarColor" name="data-sidebar" id="sidebar-color-gradient-2" value="gradient-2" />
                  <label class="form-check-label p-0 avatar-xs rounded-circle" for="sidebar-color-gradient-2">
                    <span class="avatar-title rounded-circle bg-vertical-gradient-2"></span>
                  </label>
                </div>
                <div class="form-check sidebar-setting card-radio">
                  <input class="form-check-input" type="radio" v-model="sidebarColor" name="data-sidebar" id="sidebar-color-gradient-3" value="gradient-3" />
                  <label class="form-check-label p-0 avatar-xs rounded-circle" for="sidebar-color-gradient-3">
                    <span class="avatar-title rounded-circle bg-vertical-gradient-3"></span>
                  </label>
                </div>
                <div class="form-check sidebar-setting card-radio">
                  <input class="form-check-input" type="radio" v-model="sidebarColor" name="data-sidebar" id="sidebar-color-gradient-4" value="gradient-4" />
                  <label class="form-check-label p-0 avatar-xs rounded-circle" for="sidebar-color-gradient-4">
                    <span class="avatar-title rounded-circle bg-vertical-gradient-4"></span>
                  </label>
                </div>
              </div>
            </BCollapse>
          </div>

          <div id="preloader-menu">
            <h6 class="mt-4 mb-0 fw-semibold text-uppercase">Preloader</h6>
            <p class="text-muted">Choose a preloader.</p>

            <BRow>
              <BCol cols="4">
                <div class="form-check sidebar-setting card-radio">
                  <input class="form-check-input" v-model="preloader" type="radio" name="data-preloader" id="preloader-view-custom" value="enable" />
                  <label class="form-check-label p-0 avatar-md w-100" for="preloader-view-custom">
                    <span class="d-flex gap-1 h-100">
                      <span class="flex-shrink-0">
                        <span class="bg-light d-flex h-100 flex-column gap-1 p-1">
                          <span class="d-block p-1 px-2 bg-primary-subtle rounded mb-2"></span>
                          <span class="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                          <span class="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                          <span class="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                        </span>
                      </span>
                      <span class="flex-grow-1">
                        <span class="d-flex h-100 flex-column">
                          <span class="bg-light d-block p-1"></span>
                          <span class="bg-light d-block p-1 mt-auto"></span>
                        </span>
                      </span>
                    </span>
                    <div id="status" class="d-flex align-items-center justify-content-center">
                      <div class="spinner-border text-primary avatar-xxs m-auto" role="status">
                        <span class="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  </label>
                </div>
                <h5 class="fs-13 text-center mt-2">Enable</h5>
              </BCol>
              <BCol cols="4">
                <div class="form-check sidebar-setting card-radio">
                  <input class="form-check-input" v-model="preloader" type="radio" name="data-preloader" id="preloader-view-none" value="disable" />
                  <label class="form-check-label p-0 avatar-md w-100" for="preloader-view-none">
                    <span class="d-flex gap-1 h-100">
                      <span class="flex-shrink-0">
                        <span class="bg-light d-flex h-100 flex-column gap-1 p-1">
                          <span class="d-block p-1 px-2 bg-primary-subtle rounded mb-2"></span>
                          <span class="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                          <span class="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                          <span class="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                        </span>
                      </span>
                      <span class="flex-grow-1">
                        <span class="d-flex h-100 flex-column">
                          <span class="bg-light d-block p-1"></span>
                          <span class="bg-light d-block p-1 mt-auto"></span>
                        </span>
                      </span>
                    </span>
                  </label>
                </div>
                <h5 class="fs-13 text-center mt-2">Disable</h5>
              </BCol>
            </BRow>
          </div>
          <div id="body-img">
            <h6 class="mt-4 mb-0 fw-semibold text-uppercase">Background Image</h6>
            <p class="text-muted">Choose a body background image.</p>

            <BRow>
              <BCol cols="4">
                <div class="form-check sidebar-setting card-radio">
                  <input class="form-check-input" v-model="bodybg" type="radio" name="data-body-image" id="body-img-none" value="none">
                  <label class="form-check-label p-0 avatar-md w-100" data-body-image="none" for="body-img-none">
                    <span class="d-flex gap-1 h-100">
                      <span class="flex-shrink-0">
                        <span class="bg-light d-flex h-100 flex-column gap-1 p-1">
                          <span class="d-block p-1 px-2 bg-primary-subtle rounded mb-2"></span>
                          <span class="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                          <span class="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                          <span class="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                        </span>
                      </span>
                      <span class="flex-grow-1">
                        <span class="d-flex h-100 flex-column">
                          <span class="bg-light d-block p-1"></span>
                          <span class="bg-light d-block p-1 mt-auto"></span>
                        </span>
                      </span>
                    </span>
                  </label>
                </div>
                <h5 class="fs-13 text-center mt-2">None</h5>
              </BCol>
              <BCol cols="4">
                <div class="form-check sidebar-setting card-radio">
                  <input class="form-check-input" v-model="bodybg" type="radio" name="data-body-image" id="body-img-one" value="img-1">
                  <label class="form-check-label p-0 avatar-md w-100"  for="body-img-one">
                  </label>
                </div>
                <h5 class="fs-13 text-center mt-2">One</h5>
              </BCol>

              <BCol cols="4">
                <div class="form-check sidebar-setting card-radio">
                  <input class="form-check-input" v-model="bodybg" type="radio" name="data-body-image" id="body-img-two" value="img-2">
                  <label class="form-check-label p-0 avatar-md w-100"  for="body-img-two">
                  </label>
                </div>
                <h5 class="fs-13 text-center mt-2">Two</h5>
              </BCol>

              <BCol cols="4">
                <div class="form-check sidebar-setting card-radio">
                  <input class="form-check-input" v-model="bodybg" type="radio" name="data-body-image" id="body-img-three" value="img-3">
                  <label class="form-check-label p-0 avatar-md w-100" for="body-img-three">
                  </label>
                </div>
                <h5 class="fs-13 text-center mt-2">Three</h5>
              </BCol>
            </BRow>
          </div>
        </div>
      </simpleBar>
      <template #footer>
        <BRow class="g-2">
          <BCol cols="6">
            <BButton type="button" variant="light" class="w-100 fs-12" id="reset-layout" @click="resetLayout">
              <i class="ri-refresh-line me-1"></i> Reset Layout
            </BButton>
          </BCol>
          <BCol cols="6">
            <BButton type="button" variant="soft-danger" class="w-100 fs-12" @click="resetComponentStyles">
              <i class="ri-format-clear me-1"></i> Reset Styles
            </BButton>
          </BCol>
        </BRow>
      </template>
    </BOffcanvas>
  </div>
</template>

<style lang="scss">
.b-overlay-wrap {
  .b-overlay {
    z-index: 1005 !important;
  }
}

.cursor-pointer {
  cursor: pointer;
}

.transition-all {
  transition: all 0.2s ease-in-out;
}
</style>
