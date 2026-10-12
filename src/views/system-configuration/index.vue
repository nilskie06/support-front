<template>
  <Layout>
    <PageHeader title="System Configuration" pageTitle="Configuration" />

    <!-- Summary / Quick Stats Cards -->
    <BRow class="mb-4 g-3">
      <BCol xl="3" md="6">
        <BCard no-body class="card-animate shadow-sm border-0 h-100">
          <BCardBody class="d-flex align-items-center justify-content-between p-3">
            <div>
              <p class="text-uppercase fw-semibold text-muted fs-11 mb-1">Active Brand Color</p>
              <div class="d-flex align-items-center gap-2">
                <span
                  class="d-inline-block rounded-circle border shadow-sm"
                  :style="{ backgroundColor: themeConfig.primaryColor, width: '18px', height: '18px' }"
                ></span>
                <h5 class="mb-0 fw-bold font-monospace fs-14">{{ themeConfig.primaryColor }}</h5>
              </div>
            </div>
            <div class="avatar-sm flex-shrink-0">
              <span class="avatar-title bg-primary-subtle text-primary rounded-circle fs-4">
                <i class="ri-palette-line"></i>
              </span>
            </div>
          </BCardBody>
        </BCard>
      </BCol>

      <BCol xl="3" md="6">
        <BCard no-body class="card-animate shadow-sm border-0 h-100">
          <BCardBody class="d-flex align-items-center justify-content-between p-3">
            <div>
              <p class="text-uppercase fw-semibold text-muted fs-11 mb-1">Button Styling</p>
              <h5 class="mb-0 fw-bold text-capitalize fs-14">
                {{ themeConfig.buttonRadius }} · {{ getButtonWeightLabel(themeConfig.buttonWeight) }}
              </h5>
            </div>
            <div class="avatar-sm flex-shrink-0">
              <span class="avatar-title bg-info-subtle text-info rounded-circle fs-4">
                <i class="ri-checkbox-blank-line"></i>
              </span>
            </div>
          </BCardBody>
        </BCard>
      </BCol>

      <BCol xl="3" md="6">
        <BCard no-body class="card-animate shadow-sm border-0 h-100">
          <BCardBody class="d-flex align-items-center justify-content-between p-3">
            <div>
              <p class="text-uppercase fw-semibold text-muted fs-11 mb-1">Form Inputs & Checkbox</p>
              <h5 class="mb-0 fw-bold text-capitalize fs-14">
                {{ themeConfig.inputRadius }} / {{ themeConfig.checkboxRadius }}
              </h5>
            </div>
            <div class="avatar-sm flex-shrink-0">
              <span class="avatar-title bg-warning-subtle text-warning rounded-circle fs-4">
                <i class="ri-input-cursor-move"></i>
              </span>
            </div>
          </BCardBody>
        </BCard>
      </BCol>

      <BCol xl="3" md="6">
        <BCard no-body class="card-animate shadow-sm border-0 h-100">
          <BCardBody class="d-flex align-items-center justify-content-between p-3">
            <div>
              <p class="text-uppercase fw-semibold text-muted fs-11 mb-1">Global Storage Sync</p>
              <div class="d-flex align-items-center gap-1">
                <span class="badge fs-12" :class="configurationSyncClass">
                  <i class="me-1" :class="configurationSyncIcon"></i> {{ configurationSyncLabel }}
                </span>
              </div>
            </div>
            <div class="avatar-sm flex-shrink-0">
              <span class="avatar-title bg-success-subtle text-success rounded-circle fs-4">
                <i class="ri-refresh-line"></i>
              </span>
            </div>
          </BCardBody>
        </BCard>
      </BCol>
    </BRow>

    <!-- Main Workspace: Split Columns (Configuration Tabs + Live Interactive Sandbox) -->
    <BRow class="g-4">
      <!-- Left Column: Configuration Controls -->
      <BCol lg="7" xl="8">
        <BCard no-body class="border-0 shadow-sm">
          <!-- Card Header Navigation Tabs -->
          <BCardHeader class="bg-transparent border-bottom p-0">
            <ul class="nav nav-tabs nav-tabs-custom nav-success border-0 px-3 pt-2" role="tablist">
              <li class="nav-item">
                <a
                  class="nav-link py-3 fs-13 cursor-pointer"
                  :class="{ active: currentTab === 'theme' }"
                  @click="currentTab = 'theme'"
                >
                  <i class="ri-palette-line me-1 align-bottom"></i> Theme & Colors
                </a>
              </li>
              <li class="nav-item">
                <a
                  class="nav-link py-3 fs-13 cursor-pointer"
                  :class="{ active: currentTab === 'buttons' }"
                  @click="currentTab = 'buttons'"
                >
                  <i class="ri-cursor-line me-1 align-bottom"></i> Buttons
                </a>
              </li>
              <li class="nav-item">
                <a
                  class="nav-link py-3 fs-13 cursor-pointer"
                  :class="{ active: currentTab === 'inputs' }"
                  @click="currentTab = 'inputs'"
                >
                  <i class="ri-edit-line me-1 align-bottom"></i> Inputs & Textarea
                </a>
              </li>
              <li class="nav-item">
                <a
                  class="nav-link py-3 fs-13 cursor-pointer"
                  :class="{ active: currentTab === 'checkboxes' }"
                  @click="currentTab = 'checkboxes'"
                >
                  <i class="ri-checkbox-line me-1 align-bottom"></i> Checkboxes & Switches
                </a>
              </li>
              <li class="nav-item">
                <a
                  class="nav-link py-3 fs-13 cursor-pointer"
                  :class="{ active: currentTab === 'general' }"
                  @click="currentTab = 'general'"
                >
                  <i class="ri-settings-3-line me-1 align-bottom"></i> General Info
                </a>
              </li>
              <li class="nav-item">
                <a
                  class="nav-link py-3 fs-13 cursor-pointer"
                  :class="{ active: currentTab === 'backup' }"
                  @click="currentTab = 'backup'"
                >
                  <i class="ri-database-2-line me-1 align-bottom"></i> Backup & Reset
                </a>
              </li>
            </ul>
          </BCardHeader>

          <BCardBody class="p-4">
            <!-- TAB 1: THEME & COLORS -->
            <div v-show="currentTab === 'theme'">
              <div class="mb-4">
                <h5 class="fw-bold mb-1">System Color Palette</h5>
                <p class="text-muted fs-13">
                  Select a pre-tuned color preset or specify a brand hex color. The primary color controls buttons, active navigation items, focus glow rings, and accents throughout the application.
                </p>
              </div>

              <!-- Color Presets -->
              <div class="mb-4">
                <label class="form-label fw-semibold fs-13 mb-2">Preset Palettes</label>
                <BRow class="g-3">
                  <BCol sm="6" md="3" v-for="preset in colorPresets" :key="preset.id">
                    <div
                      class="palette-card border rounded p-3 cursor-pointer transition-all h-100"
                      :class="{ 'border-primary shadow-sm bg-primary-subtle': themeConfig.presetColor === preset.id }"
                      @click="selectPreset(preset)"
                    >
                      <div class="d-flex align-items-center justify-content-between mb-2">
                        <span
                          class="rounded-circle shadow-sm"
                          :style="{ backgroundColor: preset.hex, width: '28px', height: '28px', display: 'inline-block' }"
                        ></span>
                        <i
                          v-if="themeConfig.presetColor === preset.id"
                          class="ri-checkbox-circle-fill text-primary fs-18"
                        ></i>
                      </div>
                      <h6 class="fs-13 fw-semibold mb-1">{{ preset.name }}</h6>
                      <span class="text-muted fs-11 font-monospace">{{ preset.hex }}</span>
                    </div>
                  </BCol>
                </BRow>
              </div>

              <!-- Custom Color Picker -->
              <div class="mb-4 p-3 bg-light rounded border">
                <label class="form-label fw-semibold fs-13 mb-1">Custom Brand Color</label>
                <p class="text-muted fs-12 mb-3">Choose any custom hex code to align with company branding guidelines.</p>
                <div class="row g-2 align-items-center">
                  <div class="col-auto">
                    <input
                      type="color"
                      class="form-control form-control-color p-1 cursor-pointer"
                      :value="themeConfig.primaryColor"
                      @input="onCustomColorChange"
                      style="width: 50px; height: 38px;"
                    />
                  </div>
                  <div class="col-sm-4">
                    <div class="input-group">
                      <span class="input-group-text font-monospace fs-12">HEX</span>
                      <input
                        type="text"
                        class="form-control font-monospace text-uppercase"
                        :value="themeConfig.primaryColor"
                        @change="onCustomColorChange"
                        placeholder="#405189"
                      />
                    </div>
                  </div>
                  <div class="col-auto">
                    <span class="badge bg-primary-subtle text-primary p-2 fs-12">
                      RGB: {{ currentRgb }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- TAB 2: BUTTONS -->
            <div v-show="currentTab === 'buttons'">
              <div class="mb-4">
                <h5 class="fw-bold mb-1">Button Typography & Corner Geometry</h5>
                <p class="text-muted fs-13">
                  Customize the curvature, weight, and interactive hover motion applied to all primary, secondary, and outline buttons across every view.
                </p>
              </div>

              <!-- Button Corner Radius -->
              <div class="mb-4">
                <label class="form-label fw-semibold fs-13 mb-2">Corner Radius</label>
                <BRow class="g-3">
                  <BCol sm="6" md="3" v-for="opt in buttonRadiusOptions" :key="opt.id">
                    <div
                      class="style-choice-card border rounded p-3 text-center cursor-pointer transition-all"
                      :class="{ 'border-primary bg-primary-subtle text-primary shadow-sm': themeConfig.buttonRadius === opt.id }"
                      @click="setOption('buttonRadius', opt.id)"
                    >
                      <div class="preview-btn-mock mx-auto mb-2" :style="{ borderRadius: opt.value }"></div>
                      <h6 class="fs-13 fw-semibold mb-0">{{ opt.name }}</h6>
                      <small class="text-muted fs-11">{{ opt.value }}</small>
                    </div>
                  </BCol>
                </BRow>
              </div>

              <!-- Button Font Weight -->
              <div class="mb-4">
                <label class="form-label fw-semibold fs-13 mb-2">Font Weight</label>
                <BRow class="g-3">
                  <BCol sm="6" md="3" v-for="opt in buttonWeightOptions" :key="opt.id">
                    <div
                      class="style-choice-card border rounded p-3 text-center cursor-pointer transition-all"
                      :class="{ 'border-primary bg-primary-subtle text-primary shadow-sm': themeConfig.buttonWeight === opt.id }"
                      @click="setOption('buttonWeight', opt.id)"
                    >
                      <span class="fs-16 d-block mb-1" :style="{ fontWeight: opt.id }">Aa Button</span>
                      <small class="fs-12 fw-semibold">{{ opt.name }}</small>
                    </div>
                  </BCol>
                </BRow>
              </div>

              <!-- Button Hover Animation -->
              <div class="mb-4">
                <label class="form-label fw-semibold fs-13 mb-2">Hover Motion Effect</label>
                <BRow class="g-3">
                  <BCol md="4" v-for="opt in buttonHoverOptions" :key="opt.id">
                    <div
                      class="style-choice-card border rounded p-3 text-center cursor-pointer transition-all"
                      :class="{ 'border-primary bg-primary-subtle text-primary shadow-sm': themeConfig.buttonHoverEffect === opt.id }"
                      @click="setOption('buttonHoverEffect', opt.id)"
                    >
                      <i class="ri-cursor-fill fs-20 d-block mb-1"></i>
                      <h6 class="fs-13 fw-semibold mb-0">{{ opt.name }}</h6>
                      <small class="text-muted fs-11">
                        {{ opt.id === 'lift' ? 'Smooth elevation on hover' : opt.id === 'glow' ? 'Luminous brand aura glow' : 'Subtle flat transition' }}
                      </small>
                    </div>
                  </BCol>
                </BRow>
              </div>
            </div>

            <!-- TAB 3: INPUTS & TEXTAREA -->
            <div v-show="currentTab === 'inputs'">
              <div class="mb-4">
                <h5 class="fw-bold mb-1">Form Input & Textarea Appearance</h5>
                <p class="text-muted fs-13">
                  Configure the shape, border thickness, background tone, and focus outline effects for text fields, search bars, textareas, and select dropdowns.
                </p>
              </div>

              <!-- Corner Radius -->
              <div class="mb-4">
                <label class="form-label fw-semibold fs-13 mb-2">Corner Radius</label>
                <BRow class="g-3">
                  <BCol sm="6" md="3" v-for="opt in inputRadiusOptions" :key="opt.id">
                    <div
                      class="style-choice-card border rounded p-3 text-center cursor-pointer transition-all"
                      :class="{ 'border-primary bg-primary-subtle text-primary shadow-sm': themeConfig.inputRadius === opt.id }"
                      @click="setOption('inputRadius', opt.id)"
                    >
                      <div class="preview-input-mock mx-auto mb-2" :style="{ borderRadius: opt.value }"></div>
                      <h6 class="fs-13 fw-semibold mb-0">{{ opt.name }}</h6>
                      <small class="text-muted fs-11">{{ opt.value }}</small>
                    </div>
                  </BCol>
                </BRow>
              </div>

              <!-- Border Thickness -->
              <div class="mb-4">
                <label class="form-label fw-semibold fs-13 mb-2">Border Thickness</label>
                <BRow class="g-3">
                  <BCol sm="6" v-for="opt in inputBorderWidthOptions" :key="opt.id">
                    <div
                      class="style-choice-card border rounded p-3 text-center cursor-pointer transition-all"
                      :class="{ 'border-primary bg-primary-subtle text-primary shadow-sm': themeConfig.inputBorderWidth === opt.id }"
                      @click="setOption('inputBorderWidth', opt.id)"
                    >
                      <div class="preview-border-mock mx-auto mb-2" :style="{ borderWidth: opt.id }"></div>
                      <h6 class="fs-13 fw-semibold mb-0">{{ opt.name }}</h6>
                    </div>
                  </BCol>
                </BRow>
              </div>

              <!-- Focus Ring Style -->
              <div class="mb-4">
                <label class="form-label fw-semibold fs-13 mb-2">Focus Ring Glow</label>
                <BRow class="g-3">
                  <BCol md="4" v-for="opt in inputFocusRingOptions" :key="opt.id">
                    <div
                      class="style-choice-card border rounded p-3 text-center cursor-pointer transition-all"
                      :class="{ 'border-primary bg-primary-subtle text-primary shadow-sm': themeConfig.inputFocusRing === opt.id }"
                      @click="setOption('inputFocusRing', opt.id)"
                    >
                      <i class="ri-flashlight-line fs-20 d-block mb-1"></i>
                      <h6 class="fs-13 fw-semibold mb-0">{{ opt.name }}</h6>
                      <small class="text-muted fs-11">
                        {{ opt.id === 'primary' ? 'Vibrant theme color halo' : opt.id === 'subtle' ? 'Gentle translucent border' : 'Minimal border shift' }}
                      </small>
                    </div>
                  </BCol>
                </BRow>
              </div>
            </div>

            <!-- TAB 4: CHECKBOXES & SWITCHES -->
            <div v-show="currentTab === 'checkboxes'">
              <div class="mb-4">
                <h5 class="fw-bold mb-1">Checkbox, Radio & Switch Controls</h5>
                <p class="text-muted fs-13">
                  Control the corner curvature, element scale, and border thickness for checkboxes, radio options, and boolean switches.
                </p>
              </div>

              <!-- Checkbox Radius -->
              <div class="mb-4">
                <label class="form-label fw-semibold fs-13 mb-2">Corner Shape</label>
                <BRow class="g-3">
                  <BCol md="4" v-for="opt in checkboxRadiusOptions" :key="opt.id">
                    <div
                      class="style-choice-card border rounded p-3 text-center cursor-pointer transition-all"
                      :class="{ 'border-primary bg-primary-subtle text-primary shadow-sm': themeConfig.checkboxRadius === opt.id }"
                      @click="setOption('checkboxRadius', opt.id)"
                    >
                      <div class="preview-check-mock mx-auto mb-2" :style="{ borderRadius: opt.value }">
                        <i class="ri-check-line text-white fs-12"></i>
                      </div>
                      <h6 class="fs-13 fw-semibold mb-0">{{ opt.name }}</h6>
                      <small class="text-muted fs-11">{{ opt.value }}</small>
                    </div>
                  </BCol>
                </BRow>
              </div>

              <!-- Size -->
              <div class="mb-4">
                <label class="form-label fw-semibold fs-13 mb-2">Size / Scale</label>
                <BRow class="g-3">
                  <BCol md="4" v-for="opt in checkboxSizeOptions" :key="opt.id">
                    <div
                      class="style-choice-card border rounded p-3 text-center cursor-pointer transition-all"
                      :class="{ 'border-primary bg-primary-subtle text-primary shadow-sm': themeConfig.checkboxSize === opt.id }"
                      @click="setOption('checkboxSize', opt.id)"
                    >
                      <div
                        class="preview-check-mock mx-auto mb-2"
                        :style="{ width: opt.value, height: opt.value, borderRadius: '4px' }"
                      >
                        <i class="ri-check-line text-white fs-10"></i>
                      </div>
                      <h6 class="fs-13 fw-semibold mb-0">{{ opt.name }}</h6>
                    </div>
                  </BCol>
                </BRow>
              </div>

              <!-- Border Width -->
              <div class="mb-4">
                <label class="form-label fw-semibold fs-13 mb-2">Border Width</label>
                <BRow class="g-3">
                  <BCol md="4" v-for="opt in checkboxBorderOptions" :key="opt.id">
                    <div
                      class="style-choice-card border rounded p-3 text-center cursor-pointer transition-all"
                      :class="{ 'border-primary bg-primary-subtle text-primary shadow-sm': themeConfig.checkboxBorderWidth === opt.id }"
                      @click="setOption('checkboxBorderWidth', opt.id)"
                    >
                      <div
                        class="mx-auto mb-2 rounded bg-white border border-secondary"
                        :style="{ width: '22px', height: '22px', borderWidth: opt.id + ' !important' }"
                      ></div>
                      <h6 class="fs-13 fw-semibold mb-0">{{ opt.name }}</h6>
                    </div>
                  </BCol>
                </BRow>
              </div>
            </div>

            <!-- TAB 5: GENERAL INFO -->
            <div v-show="currentTab === 'general'">
              <div class="mb-4">
                <h5 class="fw-bold mb-1">General System Information</h5>
                <p class="text-muted fs-13">
                  Metadata and general organizational configuration parameters for this system deployment.
                </p>
              </div>

              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Application Name</label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="generalConfig.appName"
                    placeholder="Velzon Support Portal"
                  />
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold">Organization / Company</label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="generalConfig.companyName"
                    placeholder="Enterprise Global"
                  />
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold">Support Helpdesk Email</label>
                  <input
                    type="email"
                    class="form-control"
                    v-model="generalConfig.supportEmail"
                    placeholder="support@example.com"
                  />
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold">Hotline Number</label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="generalConfig.hotline"
                    placeholder="+1 (800) 555-0199"
                  />
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold">Default Timezone</label>
                  <select class="form-select" v-model="generalConfig.timezone">
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                    <option value="Asia/Singapore">Asia/Singapore (GMT+8)</option>
                    <option value="America/New_York">America/New York (EST/EDT)</option>
                    <option value="Europe/London">Europe/London (GMT/BST)</option>
                  </select>
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold">Date Format</label>
                  <select class="form-select" v-model="generalConfig.dateFormat">
                    <option value="YYYY-MM-DD">YYYY-MM-DD (2026-10-09)</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY (09/10/2026)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (10/09/2026)</option>
                  </select>
                </div>

                <div class="col-12 mt-4">
                  <div class="border-top pt-3">
                    <h6 class="fw-bold mb-1">Footer Content</h6>
                    <p class="text-muted fs-12 mb-0">
                      Available placeholders: <code>{year}</code>, <code>{appName}</code>, and
                      <code>{companyName}</code>.
                    </p>
                  </div>
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold">Copyright Text</label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="generalConfig.footerCopyrightText"
                    placeholder="{year} © {appName}."
                  />
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold">Footer Credit</label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="generalConfig.footerCreditText"
                    placeholder="Design & Develop by {companyName}"
                  />
                </div>

                <div class="col-12 mt-3">
                  <div class="p-3 bg-light rounded border d-flex align-items-center justify-content-between">
                    <div>
                      <h6 class="mb-1 fw-bold">Maintenance Mode</h6>
                      <p class="text-muted fs-12 mb-0">
                        When enabled, non-admin users will see an operational maintenance notice.
                      </p>
                    </div>
                    <div class="form-check form-switch form-switch-md">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        v-model="generalConfig.maintenanceMode"
                      />
                    </div>
                  </div>
                </div>

                <div class="col-12 mt-3">
                  <button
                    type="button"
                    class="btn btn-primary btn-sm"
                    :disabled="savingGeneral || loadingConfiguration"
                    @click="saveGeneralConfig"
                  >
                    <span v-if="savingGeneral" class="spinner-border spinner-border-sm me-1"></span>
                    <i v-else class="ri-save-line me-1"></i>
                    {{ savingGeneral ? "Saving..." : "Save General Settings" }}
                  </button>
                </div>
              </div>
            </div>

            <!-- TAB 6: BACKUP & RESET -->
            <div v-show="currentTab === 'backup'">
              <div class="mb-4">
                <h5 class="fw-bold mb-1">Configuration Backup, Export & Reset</h5>
                <p class="text-muted fs-13">
                  Export system styling configuration as JSON, import from a file, or reset back to default system settings.
                </p>
              </div>

              <div class="row g-3">
                <div class="col-md-6">
                  <div class="card border p-3 h-100">
                    <div class="d-flex align-items-center gap-2 mb-2">
                      <i class="ri-download-cloud-line fs-20 text-primary"></i>
                      <h6 class="mb-0 fw-semibold">Export Configuration</h6>
                    </div>
                    <p class="text-muted fs-12 mb-3">
                      Download the current theme colors, button geometry, and form styles as a JSON file.
                    </p>
                    <button type="button" class="btn btn-outline-primary btn-sm mt-auto" @click="exportConfig">
                      <i class="ri-file-download-line me-1"></i> Export JSON
                    </button>
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="card border p-3 h-100">
                    <div class="d-flex align-items-center gap-2 mb-2">
                      <i class="ri-upload-cloud-line fs-20 text-success"></i>
                      <h6 class="mb-0 fw-semibold">Import Configuration</h6>
                    </div>
                    <p class="text-muted fs-12 mb-3">
                      Paste a previously exported JSON config to restore styles instantly.
                    </p>
                    <button type="button" class="btn btn-outline-success btn-sm mt-auto" @click="showImportModal = true">
                      <i class="ri-file-upload-line me-1"></i> Import JSON
                    </button>
                  </div>
                </div>

                <div class="col-12 mt-2">
                  <div class="card border border-danger-subtle bg-danger-subtle p-3">
                    <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
                      <div>
                        <h6 class="mb-1 text-danger fw-bold">
                          <i class="ri-alert-line me-1"></i> Factory Reset
                        </h6>
                        <p class="text-muted fs-12 mb-0">
                          Revert all buttons, theme colors, form inputs, and checkboxes back to template factory defaults.
                        </p>
                      </div>
                      <button type="button" class="btn btn-danger btn-sm" @click="confirmFactoryReset">
                        <i class="ri-refresh-line me-1"></i> Reset All Settings
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </BCardBody>
        </BCard>
      </BCol>

      <!-- Right Column: Interactive Live Sandbox Playground -->
      <BCol lg="5" xl="4">
        <div class="sticky-top" style="top: 85px; z-index: 10;">
          <BCard no-body class="border-0 shadow-sm overflow-hidden">
            <BCardHeader class="bg-primary text-white py-3 d-flex align-items-center justify-content-between">
              <div>
                <h6 class="mb-0 text-white fw-bold">
                  <i class="ri-airplay-line me-1"></i> Live Sandbox Playground
                </h6>
                <small class="text-white-50 fs-11">Updates simultaneously across page</small>
              </div>
              <span class="badge bg-white text-primary fw-semibold fs-10 text-uppercase">Live Preview</span>
            </BCardHeader>

            <BCardBody class="p-3">
              <!-- Interactive Button Gallery -->
              <div class="mb-3">
                <label class="form-label fs-11 fw-semibold text-uppercase text-muted mb-2">Button Styles</label>
                <div class="d-flex flex-wrap gap-2 mb-2">
                  <button type="button" class="btn btn-primary btn-sm">Primary</button>
                  <button type="button" class="btn btn-soft-primary btn-sm">Soft Theme</button>
                  <button type="button" class="btn btn-outline-primary btn-sm">Outline</button>
                </div>
                <div class="d-flex flex-wrap gap-2">
                  <button type="button" class="btn btn-success btn-sm">Success</button>
                  <button type="button" class="btn btn-danger btn-sm">Danger</button>
                  <button type="button" class="btn btn-secondary btn-sm">Secondary</button>
                </div>
              </div>

              <hr class="my-3 opacity-25" />

              <!-- Interactive Form Input -->
              <div class="mb-3">
                <label class="form-label fs-11 fw-semibold text-uppercase text-muted mb-1">Text Field & Search</label>
                <div class="input-group input-group-sm mb-2">
                  <span class="input-group-text"><i class="ri-search-line"></i></span>
                  <input
                    type="text"
                    class="form-control"
                    v-model="playground.inputText"
                    placeholder="Search query..."
                  />
                </div>

                <label class="form-label fs-11 fw-semibold text-uppercase text-muted mb-1">Select Dropdown</label>
                <select class="form-select form-select-sm" v-model="playground.selectValue">
                  <option value="1">Option One · Standard Priority</option>
                  <option value="2">Option Two · High Priority</option>
                  <option value="3">Option Three · Critical Escalation</option>
                </select>
              </div>

              <!-- Interactive Textarea -->
              <div class="mb-3">
                <label class="form-label fs-11 fw-semibold text-uppercase text-muted mb-1">Textarea</label>
                <textarea
                  class="form-control form-control-sm"
                  rows="2"
                  v-model="playground.textareaText"
                  placeholder="Type any multi-line notes here..."
                ></textarea>
              </div>

              <hr class="my-3 opacity-25" />

              <!-- Interactive Checkboxes & Switches -->
              <div>
                <label class="form-label fs-11 fw-semibold text-uppercase text-muted mb-2">Checkboxes & Switches</label>
                <div class="row g-2 align-items-center">
                  <div class="col-6">
                    <div class="form-check">
                      <input
                        class="form-check-input cursor-pointer"
                        type="checkbox"
                        id="playCheck1"
                        v-model="playground.check1"
                      />
                      <label class="form-check-label fs-12 ms-1 cursor-pointer" for="playCheck1">
                        Checked Box
                      </label>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="form-check">
                      <input
                        class="form-check-input cursor-pointer"
                        type="checkbox"
                        id="playCheck2"
                        v-model="playground.check2"
                      />
                      <label class="form-check-label fs-12 ms-1 cursor-pointer" for="playCheck2">
                        Unchecked
                      </label>
                    </div>
                  </div>
                  <div class="col-6 mt-2">
                    <div class="form-check form-switch">
                      <input
                        class="form-check-input cursor-pointer"
                        type="checkbox"
                        id="playSwitch1"
                        v-model="playground.switch1"
                      />
                      <label class="form-check-label fs-12 ms-1 cursor-pointer" for="playSwitch1">
                        Active Switch
                      </label>
                    </div>
                  </div>
                  <div class="col-6 mt-2">
                    <div class="form-check form-switch">
                      <input
                        class="form-check-input cursor-pointer"
                        type="checkbox"
                        id="playSwitch2"
                        v-model="playground.switch2"
                      />
                      <label class="form-check-label fs-12 ms-1 cursor-pointer" for="playSwitch2">
                        Toggle Switch
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Quick Notification Sample -->
              <div class="mt-4 p-2 bg-light rounded border fs-12 d-flex align-items-center gap-2">
                <i class="ri-information-line text-primary fs-16"></i>
                <span class="text-muted">Changes saved here apply universally across all dashboard and ticket views.</span>
              </div>
            </BCardBody>
          </BCard>
        </div>
      </BCol>
    </BRow>

    <!-- JSON Import Modal -->
    <BModal
      v-model="showImportModal"
      title="Import Theme Configuration"
      title-class="fw-bold"
      header-class="p-3 bg-light"
      hide-footer
    >
      <div>
        <label class="form-label fs-12 fw-semibold">Paste JSON Configuration Content</label>
        <textarea
          class="form-control font-monospace fs-12 mb-3"
          rows="8"
          v-model="importJsonText"
          placeholder='{ "presetColor": "emerald", "primaryColor": "#0ab39c", ... }'
        ></textarea>
        <div class="d-flex justify-content-end gap-2">
          <button type="button" class="btn btn-light btn-sm" @click="showImportModal = false">
            Cancel
          </button>
          <button type="button" class="btn btn-primary btn-sm" @click="applyImportedConfig">
            <i class="ri-check-line me-1"></i> Apply Configuration
          </button>
        </div>
      </div>
    </BModal>
  </Layout>
</template>

<script>
import Layout from "@/layouts/main.vue";
import PageHeader from "@/components/page-header.vue";
import axios from "axios";
import Swal from "sweetalert2";
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
  hexToRgb,
} from "@/helpers/themeConfig";

const DEFAULT_GENERAL_CONFIG = {
  appName: "Velzon Support Portal",
  companyName: "Enterprise Global Inc.",
  supportEmail: "support@enterprise.com",
  hotline: "+1 (800) 555-0199",
  timezone: "Asia/Singapore",
  dateFormat: "YYYY-MM-DD",
  maintenanceMode: false,
  footerCopyrightText: "{year} © {appName}.",
  footerCreditText: "Design & Develop by {companyName}",
};

export default {
  name: "SystemConfigurationPage",
  components: {
    Layout,
    PageHeader,
  },
  data() {
    return {
      currentTab: "theme",
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

      generalConfig: { ...DEFAULT_GENERAL_CONFIG },
      loadingConfiguration: false,
      savingGeneral: false,
      savingTheme: false,
      configurationSyncError: false,
      themeSaveTimer: null,

      playground: {
        inputText: "Support Dashboard & CRM",
        selectValue: "1",
        textareaText: "Real-time configurable system styles across the entire page.",
        check1: true,
        check2: false,
        switch1: true,
        switch2: false,
      },

      showImportModal: false,
      importJsonText: "",
    };
  },
  computed: {
    apiBase() {
      return process.env.VUE_APP_AUTHDOMAIN || "http://localhost:8001/api";
    },
    currentRgb() {
      return hexToRgb(this.themeConfig.primaryColor || "#405189");
    },
    configurationSyncLabel() {
      if (this.loadingConfiguration) return "Loading...";
      if (this.savingGeneral || this.savingTheme) return "Saving...";
      if (this.configurationSyncError) return "Sync Failed";
      return "Live & Persistent";
    },
    configurationSyncClass() {
      if (this.configurationSyncError) return "bg-danger-subtle text-danger";
      if (this.loadingConfiguration || this.savingGeneral || this.savingTheme) {
        return "bg-warning-subtle text-warning";
      }
      return "bg-success-subtle text-success";
    },
    configurationSyncIcon() {
      if (this.loadingConfiguration || this.savingGeneral || this.savingTheme) {
        return "ri-loader-4-line";
      }
      return this.configurationSyncError ? "ri-error-warning-line" : "ri-check-double-line";
    },
  },
  mounted() {
    window.addEventListener("app-theme-changed", this.handleThemeChanged);
    this.fetchSystemConfiguration();
  },
  beforeUnmount() {
    window.removeEventListener("app-theme-changed", this.handleThemeChanged);
    clearTimeout(this.themeSaveTimer);
  },
  methods: {
    getAuthHeaders() {
      const token = localStorage.getItem("jwt") || localStorage.getItem("token");
      return token ? { Authorization: `Bearer ${token}` } : {};
    },

    handleThemeChanged(event) {
      if (event?.detail) {
        this.themeConfig = { ...event.detail };
      }
    },

    async fetchSystemConfiguration() {
      this.loadingConfiguration = true;
      this.configurationSyncError = false;

      try {
        const response = await axios.get(`${this.apiBase}/system-configuration`, {
          headers: this.getAuthHeaders(),
        });
        const configuration = response.data.data;

        this.generalConfig = this.mapGeneralConfiguration(configuration);
        this.themeConfig = this.mapThemeConfiguration(configuration);
        saveThemeConfig(this.themeConfig);
      } catch (error) {
        this.configurationSyncError = true;
        console.error("Failed to load system configuration:", error);
        Swal.fire({
          icon: "error",
          title: "Configuration Unavailable",
          text: this.getErrorMessage(error, "Failed to load system configuration from the server."),
        });
      } finally {
        this.loadingConfiguration = false;
      }
    },

    async saveGeneralConfig() {
      this.savingGeneral = true;
      this.configurationSyncError = false;

      try {
        const response = await axios.put(
          `${this.apiBase}/system-configuration`,
          this.generalConfigurationPayload(),
          { headers: this.getAuthHeaders() }
        );
        this.generalConfig = this.mapGeneralConfiguration(response.data.data);
        window.dispatchEvent(
          new CustomEvent("system-configuration-updated", { detail: response.data.data })
        );
        Swal.fire({
          icon: "success",
          title: "Settings Saved",
          text: "General system information has been saved to the server.",
          timer: 1800,
          showConfirmButton: false,
        });
      } catch (error) {
        this.configurationSyncError = true;
        Swal.fire({
          icon: "error",
          title: "Unable to Save",
          text: this.getErrorMessage(error, "Failed to save the general settings."),
        });
      } finally {
        this.savingGeneral = false;
      }
    },

    setOption(key, value) {
      this.themeConfig[key] = value;
      saveThemeConfig(this.themeConfig);
      this.queueThemeSave();
    },

    selectPreset(preset) {
      this.themeConfig.presetColor = preset.id;
      this.themeConfig.primaryColor = preset.hex;
      saveThemeConfig(this.themeConfig);
      this.queueThemeSave();
    },

    onCustomColorChange(event) {
      this.themeConfig.presetColor = "custom";
      this.themeConfig.primaryColor = event.target.value.trim();
      saveThemeConfig(this.themeConfig);
      this.queueThemeSave();
    },

    queueThemeSave() {
      clearTimeout(this.themeSaveTimer);
      this.themeSaveTimer = setTimeout(() => this.persistThemeConfig(), 300);
    },

    async persistThemeConfig() {
      this.savingTheme = true;
      this.configurationSyncError = false;

      try {
        const response = await axios.put(
          `${this.apiBase}/system-configuration`,
          this.themeConfigurationPayload(),
          { headers: this.getAuthHeaders() }
        );
        this.themeConfig = this.mapThemeConfiguration(response.data.data);
        saveThemeConfig(this.themeConfig);

        return true;
      } catch (error) {
        this.configurationSyncError = true;
        Swal.fire({
          icon: "error",
          title: "Unable to Save Theme",
          text: this.getErrorMessage(error, "Failed to save the theme configuration."),
        });

        return false;
      } finally {
        this.savingTheme = false;
      }
    },

    getButtonWeightLabel(weight) {
      const match = BUTTON_WEIGHT_OPTIONS.find((w) => w.id === weight);
      return match ? match.name : weight;
    },

    async confirmFactoryReset() {
      const result = await Swal.fire({
        title: "Reset All System Styles?",
        text: "This will revert your theme colors, buttons, form inputs, and checkboxes back to template factory defaults.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#f06548",
        cancelButtonColor: "#74788d",
        confirmButtonText: "Yes, Reset to Default",
      });

      if (!result.isConfirmed) return;

      clearTimeout(this.themeSaveTimer);
      const previousTheme = { ...this.themeConfig };
      const defaults = resetThemeConfig();
      this.themeConfig = { ...defaults };

      if (await this.persistThemeConfig()) {
        Swal.fire({
          icon: "success",
          title: "Factory Defaults Restored",
          text: "System styles have been reset successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        this.themeConfig = previousTheme;
        saveThemeConfig(previousTheme);
      }
    },

    exportConfig() {
      const jsonStr = JSON.stringify(this.themeConfig, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `system-theme-config-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
    },

    async applyImportedConfig() {
      let parsed;

      try {
        parsed = JSON.parse(this.importJsonText);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Invalid JSON",
          text: "Please provide valid JSON styling configuration.",
        });

        return;
      }

      if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
        Swal.fire({
          icon: "error",
          title: "Invalid Configuration",
          text: "The imported JSON must contain a configuration object.",
        });

        return;
      }

      clearTimeout(this.themeSaveTimer);
      const previousTheme = { ...this.themeConfig };
      this.themeConfig = { ...this.themeConfig, ...parsed };
      saveThemeConfig(this.themeConfig);

      if (await this.persistThemeConfig()) {
        this.showImportModal = false;
        this.importJsonText = "";
        Swal.fire({
          icon: "success",
          title: "Configuration Applied",
          text: "The imported styling settings were applied successfully.",
          timer: 1800,
          showConfirmButton: false,
        });
      } else {
        this.themeConfig = previousTheme;
        saveThemeConfig(previousTheme);
      }
    },

    mapGeneralConfiguration(configuration) {
      return {
        appName: configuration.app_name,
        companyName: configuration.company_name,
        supportEmail: configuration.support_email,
        hotline: configuration.hotline,
        timezone: configuration.timezone,
        dateFormat: configuration.date_format,
        maintenanceMode: configuration.maintenance_mode,
        footerCopyrightText: configuration.footer_copyright_text,
        footerCreditText: configuration.footer_credit_text,
      };
    },

    mapThemeConfiguration(configuration) {
      return {
        presetColor: configuration.preset_color,
        primaryColor: configuration.primary_color,
        buttonRadius: configuration.button_radius,
        buttonWeight: configuration.button_weight,
        buttonHoverEffect: configuration.button_hover_effect,
        inputRadius: configuration.input_radius,
        inputBorderWidth: configuration.input_border_width,
        inputStyle: configuration.input_style,
        inputFocusRing: configuration.input_focus_ring,
        checkboxRadius: configuration.checkbox_radius,
        checkboxSize: configuration.checkbox_size,
        checkboxBorderWidth: configuration.checkbox_border_width,
      };
    },

    generalConfigurationPayload() {
      return {
        app_name: this.generalConfig.appName,
        company_name: this.generalConfig.companyName,
        support_email: this.generalConfig.supportEmail,
        hotline: this.generalConfig.hotline,
        timezone: this.generalConfig.timezone,
        date_format: this.generalConfig.dateFormat,
        maintenance_mode: this.generalConfig.maintenanceMode,
        footer_copyright_text: this.generalConfig.footerCopyrightText,
        footer_credit_text: this.generalConfig.footerCreditText,
      };
    },

    themeConfigurationPayload() {
      return {
        preset_color: this.themeConfig.presetColor,
        primary_color: this.themeConfig.primaryColor,
        button_radius: this.themeConfig.buttonRadius,
        button_weight: this.themeConfig.buttonWeight,
        button_hover_effect: this.themeConfig.buttonHoverEffect,
        input_radius: this.themeConfig.inputRadius,
        input_border_width: this.themeConfig.inputBorderWidth,
        input_style: this.themeConfig.inputStyle,
        input_focus_ring: this.themeConfig.inputFocusRing,
        checkbox_radius: this.themeConfig.checkboxRadius,
        checkbox_size: this.themeConfig.checkboxSize,
        checkbox_border_width: this.themeConfig.checkboxBorderWidth,
      };
    },

    getErrorMessage(error, fallbackMessage) {
      const errors = error.response?.data?.errors;
      if (errors) {
        const firstField = Object.keys(errors)[0];
        if (firstField && errors[firstField]?.length) return errors[firstField][0];
      }

      return error.response?.data?.message || fallbackMessage;
    },
  },
};
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.transition-all {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.palette-card:hover,
.style-choice-card:hover {
  transform: translateY(-2px);
  border-color: var(--vz-primary) !important;
}

.preview-btn-mock {
  width: 48px;
  height: 22px;
  background-color: var(--vz-primary);
  opacity: 0.85;
}

.preview-input-mock {
  width: 58px;
  height: 22px;
  border: 1px solid var(--vz-border-color);
  background-color: var(--vz-card-bg);
}

.preview-border-mock {
  width: 60px;
  height: 24px;
  border-style: solid;
  border-color: var(--vz-primary);
  border-radius: 4px;
}

.preview-check-mock {
  width: 22px;
  height: 22px;
  background-color: var(--vz-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
