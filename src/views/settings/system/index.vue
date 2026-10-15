<template>
  <Layout>
    <PageHeader title="System Management" pageTitle="Settings" />

    <!-- Top KPI Metric Cards -->
    <BRow class="mb-4 g-3">
      <BCol xl="3" md="6">
        <BCard no-body class="card-animate shadow-sm border-0 h-100 kpi-card">
          <BCardBody class="d-flex align-items-center justify-content-between p-3">
            <div>
              <p class="text-uppercase fw-semibold text-muted fs-11 mb-1">Total Systems</p>
              <h3 class="mb-0 fw-bold text-primary">
                <count-to :duration="800" :startVal="0" :endVal="stats.total"></count-to>
              </h3>
              <p class="mb-0 text-muted fs-12 mt-1">
                <span class="badge bg-primary-subtle text-primary me-1">
                  <i class="ri-computer-line align-middle"></i> Systems
                </span>
                Application modules
              </p>
            </div>
            <div class="avatar-sm flex-shrink-0">
              <span class="avatar-title bg-primary-subtle text-primary rounded-circle fs-3">
                <i class="ri-computer-line"></i>
              </span>
            </div>
          </BCardBody>
        </BCard>
      </BCol>

      <BCol xl="3" md="6">
        <BCard no-body class="card-animate shadow-sm border-0 h-100 kpi-card">
          <BCardBody class="d-flex align-items-center justify-content-between p-3">
            <div>
              <p class="text-uppercase fw-semibold text-muted fs-11 mb-1">Active Systems</p>
              <h3 class="mb-0 fw-bold text-success">
                <count-to :duration="800" :startVal="0" :endVal="stats.active"></count-to>
              </h3>
              <p class="mb-0 text-muted fs-12 mt-1">
                <span class="badge bg-success-subtle text-success me-1">
                  <i class="ri-checkbox-circle-line align-middle"></i> Online
                </span>
                Accepting tickets
              </p>
            </div>
            <div class="avatar-sm flex-shrink-0">
              <span class="avatar-title bg-success-subtle text-success rounded-circle fs-3">
                <i class="ri-checkbox-circle-line"></i>
              </span>
            </div>
          </BCardBody>
        </BCard>
      </BCol>

      <BCol xl="3" md="6">
        <BCard no-body class="card-animate shadow-sm border-0 h-100 kpi-card">
          <BCardBody class="d-flex align-items-center justify-content-between p-3">
            <div>
              <p class="text-uppercase fw-semibold text-muted fs-11 mb-1">Inactive Systems</p>
              <h3 class="mb-0 fw-bold text-warning">
                <count-to :duration="800" :startVal="0" :endVal="stats.inactive"></count-to>
              </h3>
              <p class="mb-0 text-muted fs-12 mt-1">
                <span class="badge bg-warning-subtle text-warning me-1">
                  <i class="ri-pause-circle-line align-middle"></i> Disabled
                </span>
                Maintenance or sunset
              </p>
            </div>
            <div class="avatar-sm flex-shrink-0">
              <span class="avatar-title bg-warning-subtle text-warning rounded-circle fs-3">
                <i class="ri-pause-circle-line"></i>
              </span>
            </div>
          </BCardBody>
        </BCard>
      </BCol>

      <BCol xl="3" md="6">
        <BCard no-body class="card-animate shadow-sm border-0 h-100 kpi-card">
          <BCardBody class="d-flex align-items-center justify-content-between p-3">
            <div>
              <p class="text-uppercase fw-semibold text-muted fs-11 mb-1">Active Ratio</p>
              <h3 class="mb-0 fw-bold text-info">
                {{ activePercentage }}%
              </h3>
              <p class="mb-0 text-muted fs-12 mt-1">
                <span class="badge bg-info-subtle text-info me-1">
                  <i class="ri-pie-chart-line align-middle"></i> Health
                </span>
                Availability score
              </p>
            </div>
            <div class="avatar-sm flex-shrink-0">
              <span class="avatar-title bg-info-subtle text-info rounded-circle fs-3">
                <i class="ri-pie-chart-line"></i>
              </span>
            </div>
          </BCardBody>
        </BCard>
      </BCol>
    </BRow>

    <!-- Main Card -->
    <BCard no-body class="shadow-sm border-0 mb-4">
      <BCardHeader class="border-0 bg-transparent py-3">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div class="d-flex align-items-center gap-2">
            <div class="avatar-xs flex-shrink-0">
              <span class="avatar-title bg-primary-subtle text-primary rounded-circle fs-14">
                <i class="ri-terminal-window-line"></i>
              </span>
            </div>
            <div>
              <h5 class="card-title mb-0 fw-bold">System Catalog</h5>
              <span class="text-muted fs-12">
                Manage IT platforms, web portals, and software applications
              </span>
            </div>
          </div>

          <div class="d-flex align-items-center gap-2">
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
              :disabled="loading"
              @click="fetchSystems"
              title="Reload systems list"
            >
              <i class="ri-refresh-line" :class="{ 'ri-spin': loading }"></i>
              <span class="d-none d-sm-inline">Refresh</span>
            </button>

            <button
              type="button"
              class="btn btn-sm btn-primary d-flex align-items-center gap-1 shadow-sm"
              @click="openCreateModal"
            >
              <i class="ri-add-line fs-14"></i>
              <span>Add System</span>
            </button>
          </div>
        </div>
      </BCardHeader>

      <!-- Filter Toolbar -->
      <BCardBody class="border-top border-bottom border-dashed border-start-0 border-end-0 py-3 toolbar-container">
        <BRow class="g-3 align-items-center">
          <!-- Search Input -->
          <BCol xl="5" lg="6" sm="12">
            <div class="search-box">
              <input
                type="text"
                class="form-control search"
                placeholder="Search by code, system name..."
                v-model="searchQuery"
              />
              <i class="ri-search-line search-icon text-muted"></i>
              <button
                v-if="searchQuery"
                type="button"
                class="btn btn-sm btn-link position-absolute end-0 top-50 translate-middle-y text-muted text-decoration-none pe-2"
                @click="searchQuery = ''"
              >
                <i class="ri-close-line"></i>
              </button>
            </div>
          </BCol>

          <!-- Status Filter Pills (with space between) -->
          <BCol xl="4" lg="4" sm="12">
            <div class="d-flex align-items-center gap-2">
              <span class="fs-12 text-muted me-1 d-none d-md-inline">Status:</span>
              <div class="d-flex align-items-center gap-2 flex-wrap" role="group">
                <button
                  type="button"
                  class="btn btn-sm rounded-pill px-3 filter-pill-btn"
                  :class="statusFilter === 'all' ? 'btn-primary shadow-sm' : 'filter-pill-inactive'"
                  @click="statusFilter = 'all'"
                >
                  All ({{ stats.total }})
                </button>
                <button
                  type="button"
                  class="btn btn-sm rounded-pill px-3 filter-pill-btn"
                  :class="statusFilter === 'active' ? 'btn-success shadow-sm' : 'filter-pill-inactive'"
                  @click="statusFilter = 'active'"
                >
                  Active ({{ stats.active }})
                </button>
                <button
                  type="button"
                  class="btn btn-sm rounded-pill px-3 filter-pill-btn"
                  :class="statusFilter === 'inactive' ? 'btn-warning shadow-sm' : 'filter-pill-inactive'"
                  @click="statusFilter = 'inactive'"
                >
                  Inactive ({{ stats.inactive }})
                </button>
              </div>
            </div>
          </BCol>

          <BCol xl="3" lg="2" sm="12" class="text-sm-end text-muted fs-12">
            Showing {{ filteredSystems.length }} of {{ systems.length }} records
          </BCol>
        </BRow>
      </BCardBody>

      <!-- Table Content -->
      <BCardBody class="p-0">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading systems...</span>
          </div>
          <p class="text-muted mt-2 mb-0">Loading system records from server...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredSystems.length === 0" class="text-center py-5">
          <div class="avatar-lg mx-auto mb-3">
            <span class="avatar-title bg-light text-muted rounded-circle fs-1">
              <i class="ri-computer-line"></i>
            </span>
          </div>
          <h5 class="fw-semibold">No Systems Found</h5>
          <p class="text-muted fs-13 mb-3">
            {{ searchQuery || statusFilter !== 'all' ? 'No systems match the current filter or search criteria.' : 'No system records found in the database.' }}
          </p>
          <div class="d-flex justify-content-center gap-2">
            <button
              v-if="searchQuery || statusFilter !== 'all'"
              type="button"
              class="btn btn-sm btn-outline-secondary"
              @click="resetFilters"
            >
              Reset Filters
            </button>
            <button
              type="button"
              class="btn btn-sm btn-primary"
              @click="openCreateModal"
            >
              <i class="ri-add-line me-1"></i> Add System
            </button>
          </div>
        </div>

        <!-- Systems Table -->
        <div v-else class="table-responsive">
          <table class="table align-middle table-nowrap table-hover mb-0 system-table">
            <thead class="table-light text-muted text-uppercase fs-11">
              <tr>
                <th scope="col" style="width: 80px;" class="ps-3">ID</th>
                <th scope="col" style="width: 160px;">Code</th>
                <th scope="col" style="min-width: 320px;">System Name</th>
                <th scope="col" style="width: 140px;">Status</th>
                <th scope="col" style="width: 180px;">Created Date</th>
                <th scope="col" style="width: 120px;" class="text-end pe-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="system in filteredSystems" :key="system.id" class="system-row">
                <td class="ps-3 fw-semibold text-muted fs-12">
                  #{{ String(system.id).padStart(3, '0') }}
                </td>

                <!-- System Code -->
                <td>
                  <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 font-monospace fs-12 fw-bold">
                    {{ system.code }}
                  </span>
                </td>

                <!-- System Name -->
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <div class="avatar-xxs flex-shrink-0">
                      <span class="avatar-title bg-light text-primary rounded-circle fs-12 border">
                        <i class="ri-macbook-line"></i>
                      </span>
                    </div>
                    <div>
                      <h6 class="fs-13 fw-semibold mb-0 system-title">
                        {{ system.name }}
                      </h6>
                      <small class="text-muted fs-11" v-if="system.code">
                        Code: {{ system.code }}
                      </small>
                    </div>
                  </div>
                </td>

                <!-- Status -->
                <td>
                  <span
                    class="badge d-inline-flex align-items-center gap-1 px-2 py-1 fs-11"
                    :class="system.status === 'active' ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-warning-subtle text-warning border border-warning-subtle'"
                  >
                    <i :class="system.status === 'active' ? 'ri-checkbox-circle-fill' : 'ri-close-circle-fill'"></i>
                    <span class="text-capitalize">{{ system.status }}</span>
                  </span>
                </td>

                <!-- Created Date -->
                <td class="text-muted fs-12">
                  {{ formatDate(system.created_at) }}
                </td>

                <!-- Actions -->
                <td class="text-end pe-3">
                  <div class="d-flex align-items-center justify-content-end gap-1">
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-warning btn-icon"
                      @click="openApiKeysModal(system)"
                      title="Manage Integration API Keys"
                    >
                      <i class="ri-key-2-line fs-14"></i>
                    </button>
                    <button
                      type="button"
                      class="btn btn-sm btn-action-edit p-1"
                      @click="openEditModal(system)"
                      title="Edit System"
                    >
                      <i class="ri-pencil-line fs-14"></i>
                    </button>
                    <button
                      type="button"
                      class="btn btn-sm btn-action-delete p-1"
                      @click="confirmDelete(system)"
                      title="Delete System"
                    >
                      <i class="ri-delete-bin-line fs-14"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </BCardBody>
    </BCard>

    <!-- Modal: Create / Edit System -->
    <BModal
      v-model="modalShow"
      id="systemModal"
      modal-class="zoomIn"
      :title="editingId ? 'Edit System Details' : 'Register New System'"
      title-class="fw-bold fs-15"
      hide-footer
      header-class="p-3 bg-primary-subtle"
      class="v-modal-custom"
      centered
      body-class="p-4"
    >
      <form @submit.prevent="submitForm">
        <!-- Error Alert -->
        <div v-if="formError" class="alert alert-danger py-2 px-3 fs-13 mb-3 d-flex align-items-center gap-2">
          <i class="ri-error-warning-line fs-16"></i>
          <span>{{ formError }}</span>
        </div>

        <!-- Code Field -->
        <div class="mb-3">
          <label class="form-label fw-semibold fs-13 required">
            System Code
          </label>
          <div class="input-group">
            <span class="input-group-text bg-light text-muted">
              <i class="ri-hashtag"></i>
            </span>
            <input
              type="text"
              class="form-control text-uppercase font-monospace"
              placeholder="e.g. SYS-TMS, SYS-WMS, SYS-CRM"
              v-model="form.code"
              maxlength="50"
              required
              :class="{ 'is-invalid': formErrors.code }"
              @input="form.code = form.code.toUpperCase()"
            />
            <div v-if="formErrors.code" class="invalid-feedback">
              {{ formErrors.code }}
            </div>
          </div>
          <small class="text-muted fs-11">
            Unique identifier code. Automatically uppercase (e.g., SYS-TMS).
          </small>
        </div>

        <!-- Name Field -->
        <div class="mb-3">
          <label class="form-label fw-semibold fs-13 required">
            System Name
          </label>
          <div class="input-group">
            <span class="input-group-text bg-light text-muted">
              <i class="ri-computer-line"></i>
            </span>
            <input
              type="text"
              class="form-control"
              placeholder="e.g. Transportation Management System"
              v-model="form.name"
              maxlength="150"
              required
              :class="{ 'is-invalid': formErrors.name }"
            />
            <div v-if="formErrors.name" class="invalid-feedback">
              {{ formErrors.name }}
            </div>
          </div>
          <small class="text-muted fs-11">
            Display name of the application or module.
          </small>
        </div>

        <!-- Status Field -->
        <div class="mb-3">
          <label class="form-label fw-semibold fs-13">
            Operating Status
          </label>
          <div class="d-flex align-items-center gap-3 mt-1">
            <div class="form-check form-radio-success">
              <input
                class="form-check-input"
                type="radio"
                name="systemStatus"
                id="sysStatusActive"
                value="active"
                v-model="form.status"
              />
              <label class="form-check-label fs-13 fw-medium text-success" for="sysStatusActive">
                <i class="ri-checkbox-circle-fill me-1"></i> Active
              </label>
            </div>
            <div class="form-check form-radio-warning">
              <input
                class="form-check-input"
                type="radio"
                name="systemStatus"
                id="sysStatusInactive"
                value="inactive"
                v-model="form.status"
              />
              <label class="form-check-label fs-13 fw-medium text-warning" for="sysStatusInactive">
                <i class="ri-pause-circle-fill me-1"></i> Inactive
              </label>
            </div>
          </div>
        </div>

        <!-- Live Preview Card -->
        <div class="mb-4 p-3 rounded border preview-box">
          <label class="form-label fw-semibold fs-11 text-uppercase text-muted mb-2">
            Card Live Preview
          </label>
          <div class="p-2 rounded bg-light border d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2">
              <div class="avatar-xs flex-shrink-0">
                <span class="avatar-title bg-primary text-white rounded-circle fs-12">
                  <i class="ri-computer-line"></i>
                </span>
              </div>
              <div>
                <div class="fw-semibold fs-13 text-truncate preview-name" style="max-width: 250px;">
                  {{ form.name || 'System Name Here' }}
                </div>
                <div class="d-flex align-items-center gap-2 mt-1">
                  <span class="badge bg-primary-subtle text-primary font-monospace fs-10 px-1 py-0">
                    {{ form.code || 'SYS-CODE' }}
                  </span>
                </div>
              </div>
            </div>
            <span
              class="badge text-capitalize fs-10"
              :class="form.status === 'active' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'"
            >
              {{ form.status }}
            </span>
          </div>
        </div>

        <!-- Actions -->
        <div class="d-flex align-items-center justify-content-end gap-2 pt-2 border-top">
          <button
            type="button"
            class="btn btn-light"
            @click="modalShow = false"
            :disabled="submitting"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="btn btn-primary d-flex align-items-center gap-1"
            :disabled="submitting"
          >
            <span v-if="submitting" class="spinner-border spinner-border-sm" role="status"></span>
            <i v-else :class="editingId ? 'ri-save-line' : 'ri-check-line'"></i>
            <span>{{ editingId ? 'Save Changes' : 'Create System' }}</span>
          </button>
        </div>
      </form>
    </BModal>

    <BModal
      v-model="apiKeysModalShow"
      id="systemApiKeysModal"
      modal-class="zoomIn system-api-keys-modal"
      title="Integration API Keys"
      title-class="fw-bold fs-15"
      header-class="p-3 bg-warning-subtle"
      body-class="p-4"
      class="v-modal-custom"
      hide-footer
      centered
    >
      <p class="text-muted fs-12">{{ selectedSystem?.name }} can use keys to create tickets and enroll users.</p>
      <div v-if="newApiKey" class="alert alert-warning fs-12">
        <strong>Copy this key now:</strong>
        <div class="input-group input-group-sm mt-2"><input class="form-control font-monospace" readonly :value="newApiKey"><button class="btn btn-outline-secondary" @click="copyApiKey"><i class="ri-file-copy-line"></i></button></div>
      </div>
      <form class="border rounded p-3 mb-3" @submit.prevent="createApiKey">
        <label class="form-label fs-12 fw-semibold">Key name</label>
        <input v-model="apiKeyForm.name" class="form-control form-control-sm mb-2" required placeholder="e.g. Production integration">
        <label class="form-label fs-12 fw-semibold">Allowed actions</label>
        <div class="d-flex gap-3 flex-wrap fs-12 mb-3"><label><input v-model="apiKeyForm.abilities" type="checkbox" value="tickets.create"> Create tickets</label><label><input v-model="apiKeyForm.abilities" type="checkbox" value="users.enroll"> Enroll users</label><label><input v-model="apiKeyForm.abilities" type="checkbox" value="lookups.read"> Read lookups</label></div>
        <button class="btn btn-sm btn-primary" :disabled="apiKeysLoading || !apiKeyForm.abilities.length"><i class="ri-add-line me-1"></i> Generate Key</button>
      </form>
      <div v-if="apiKeysLoading" class="text-center py-3"><span class="spinner-border spinner-border-sm"></span></div>
      <div v-else-if="!apiKeys.length" class="text-muted fs-12 text-center py-2">No integration keys yet.</div>
      <div v-for="key in apiKeys" :key="key.id" class="d-flex justify-content-between align-items-center border-top py-2 fs-12"><div><strong>{{ key.name }}</strong><div class="text-muted font-monospace">{{ key.prefix }}••••</div></div><button v-if="!key.revoked_at" class="btn btn-sm btn-outline-danger btn-icon" title="Revoke key" @click="revokeApiKey(key)"><i class="ri-forbid-line"></i></button><span v-else class="badge bg-danger-subtle text-danger">Revoked</span></div>
      <div class="border-top mt-3 pt-3">
        <div class="d-flex justify-content-between mb-1"><strong class="fs-12">Simulation payloads</strong><span class="text-muted fs-11">Header: X-API-Key</span></div>
        <label class="form-label fs-11 mb-1">POST /api/integrations/tickets</label>
        <pre class="api-payload">{{ ticketPayloadExample }}</pre>
        <div class="text-muted fs-11 mb-2">Use <code>multipart/form-data</code> and append each file as <code>attachments[]</code> (up to 10 MB each).</div>
        <label class="form-label fs-11 mb-1">POST /api/integrations/users</label>
        <pre class="api-payload mb-0">{{ userPayloadExample }}</pre>
      </div>
    </BModal>
  </Layout>
</template>

<script>
import { CountTo } from "vue3-count-to";
import Layout from "@/layouts/main.vue";
import PageHeader from "@/components/page-header";
import Swal from "sweetalert2";
import axios from "axios";

export default {
  name: "SystemSettings",
  components: {
    Layout,
    PageHeader,
    CountTo,
  },
  data() {
    return {
      loading: false,
      submitting: false,
      systems: [],
      stats: {
        total: 0,
        active: 0,
        inactive: 0,
      },
      searchQuery: "",
      statusFilter: "all",
      modalShow: false,
      editingId: null,
      form: {
        code: "",
        name: "",
        status: "active",
      },
      formError: "",
      formErrors: {},
      apiKeysModalShow: false,
      apiKeysLoading: false,
      selectedSystem: null,
      apiKeys: [],
      newApiKey: "",
      apiKeyForm: { name: "", abilities: ["tickets.create", "users.enroll", "lookups.read"] },
    };
  },
  computed: {
    apiBase() {
      return process.env.VUE_APP_AUTHDOMAIN || "http://localhost:8001/api";
    },

    activePercentage() {
      if (!this.stats.total) return 0;
      return Math.round((this.stats.active / this.stats.total) * 100);
    },
    ticketPayloadExample() { return JSON.stringify({ subject: "Sample integration ticket", summary: "Created from an external integration.", module: "integration", board_id: 1, tkt_type_id: 1, issue_type_id: 1, type_other: null, board_status_id: 1, issue_severity_id: 1, date_encountered: new Date().toISOString().slice(0, 10), duration_from: null, duration_to: null, frequency: "Once", url: "https://source-system.example/context", issue_group: null, group_id: null, assignees: [2], assigned_groups: [], followers: [2], follower_groups: [], tagged_groups: [] }, null, 2); },
    userPayloadExample() { return JSON.stringify({ name: "Integration User", email: "integration.user@example.com", username: "integration.user", password: "ChangeMe123!" }, null, 2); },

    filteredSystems() {
      let result = this.systems;

      // Status filter
      if (this.statusFilter !== "all") {
        result = result.filter((s) => s.status === this.statusFilter);
      }

      // Search query
      if (this.searchQuery && this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase().trim();
        result = result.filter((s) => {
          return (
            (s.code && s.code.toLowerCase().includes(q)) ||
            (s.name && s.name.toLowerCase().includes(q)) ||
            String(s.id).includes(q)
          );
        });
      }

      return result;
    },
  },
  mounted() {
    this.fetchSystems();
  },
  methods: {
    getAuthHeaders() {
      const token = localStorage.getItem("jwt") || localStorage.getItem("token");
      return token ? { Authorization: `Bearer ${token}` } : {};
    },

    resetFilters() {
      this.searchQuery = "";
      this.statusFilter = "all";
    },

    async fetchSystems() {
      this.loading = true;
      try {
        const response = await axios.get(`${this.apiBase}/systems`, {
          headers: this.getAuthHeaders(),
        });
        this.systems = response.data.data || [];
        if (response.data.stats) {
          this.stats = {
            total: response.data.stats.total || 0,
            active: response.data.stats.active || 0,
            inactive: response.data.stats.inactive || 0,
          };
        } else {
          this.stats = {
            total: this.systems.length,
            active: this.systems.filter((s) => s.status === "active").length,
            inactive: this.systems.filter((s) => s.status === "inactive").length,
          };
        }
      } catch (err) {
        console.error("Failed to fetch systems:", err);
        Swal.fire({
          icon: "error",
          title: "Network Error",
          text: err.response?.data?.message || "Failed to load systems from server.",
          toast: true,
          position: "top-end",
          timer: 3500,
          showConfirmButton: false,
        });
      } finally {
        this.loading = false;
      }
    },

    openCreateModal() {
      this.editingId = null;
      this.form = {
        code: "",
        name: "",
        status: "active",
      };
      this.formError = "";
      this.formErrors = {};
      this.modalShow = true;
    },

    openEditModal(system) {
      this.editingId = system.id;
      this.form = {
        code: system.code || "",
        name: system.name || "",
        status: system.status || "active",
      };
      this.formError = "";
      this.formErrors = {};
      this.modalShow = true;
    },

    async openApiKeysModal(system) {
      this.selectedSystem = system;
      this.apiKeysModalShow = true;
      this.newApiKey = "";
      this.apiKeyForm = { name: "", abilities: ["tickets.create", "users.enroll", "lookups.read"] };
      this.apiKeysLoading = true;
      try { const response = await axios.get(`${this.apiBase}/systems/${system.id}/api-keys`, { headers: this.getAuthHeaders() }); this.apiKeys = response.data.data || []; } finally { this.apiKeysLoading = false; }
    },

    async createApiKey() {
      if (!this.selectedSystem) return;
      this.apiKeysLoading = true;
      try {
        const response = await axios.post(`${this.apiBase}/systems/${this.selectedSystem.id}/api-keys`, this.apiKeyForm, { headers: this.getAuthHeaders() });
        this.newApiKey = response.data.api_key || "";
        this.apiKeys.unshift(response.data.data);
        this.apiKeyForm = { name: "", abilities: ["tickets.create", "users.enroll", "lookups.read"] };
      } finally { this.apiKeysLoading = false; }
    },

    async revokeApiKey(key) {
      await axios.delete(`${this.apiBase}/api-keys/${key.id}`, { headers: this.getAuthHeaders() });
      key.revoked_at = new Date().toISOString();
    },

    async copyApiKey() { await navigator.clipboard?.writeText(this.newApiKey); },

    async submitForm() {
      this.formError = "";
      this.formErrors = {};

      if (!this.form.code || !this.form.code.trim()) {
        this.formErrors.code = "System code is required.";
      }
      if (!this.form.name || !this.form.name.trim()) {
        this.formErrors.name = "System name is required.";
      }

      if (Object.keys(this.formErrors).length > 0) {
        return;
      }

      this.submitting = true;
      try {
        const payload = {
          code: this.form.code.trim().toUpperCase(),
          name: this.form.name.trim(),
          status: this.form.status || "active",
        };

        if (this.editingId) {
          // Update
          await axios.put(
            `${this.apiBase}/systems/${this.editingId}`,
            payload,
            {
              headers: this.getAuthHeaders(),
            }
          );

          Swal.fire({
            icon: "success",
            title: "Updated",
            text: "System details updated successfully.",
            toast: true,
            position: "top-end",
            timer: 2500,
            showConfirmButton: false,
          });
        } else {
          // Create
          await axios.post(
            `${this.apiBase}/systems`,
            payload,
            {
              headers: this.getAuthHeaders(),
            }
          );

          Swal.fire({
            icon: "success",
            title: "Created",
            text: "System registered successfully.",
            toast: true,
            position: "top-end",
            timer: 2500,
            showConfirmButton: false,
          });
        }

        this.modalShow = false;
        await this.fetchSystems();
      } catch (err) {
        if (err.response?.status === 422 && err.response?.data?.errors) {
          this.formErrors = err.response.data.errors;
          this.formError = Object.values(err.response.data.errors).flat().join(" ");
        } else {
          this.formError = err.response?.data?.message || "Failed to save system.";
        }
      } finally {
        this.submitting = false;
      }
    },

    async confirmDelete(system) {
      const result = await Swal.fire({
        title: "Delete System?",
        html: `Are you sure you want to delete <strong>"${system.name}" (${system.code})</strong>?<br><small class="text-muted">This action will soft-delete the record.</small>`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Delete",
        cancelButtonText: "Cancel",
        confirmButtonClass: "btn btn-danger w-xs me-2",
        cancelButtonClass: "btn btn-ghost-secondary w-xs",
        buttonsStyling: false,
        showCloseButton: true,
      });

      if (result.isConfirmed) {
        try {
          await axios.delete(`${this.apiBase}/systems/${system.id}`, {
            headers: this.getAuthHeaders(),
          });
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "System deleted successfully.",
            toast: true,
            position: "top-end",
            timer: 2500,
            showConfirmButton: false,
          });
          await this.fetchSystems();
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Delete Failed",
            text: err.response?.data?.message || "Failed to delete system.",
            confirmButtonClass: "btn btn-primary",
            buttonsStyling: false,
          });
        }
      }
    },

    formatDate(dateStr) {
      if (!dateStr) return "-";
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    },
  },
};
</script>

<style scoped>
:global(.system-api-keys-modal) { z-index: 1080 !important; }
:global(.modal-backdrop:has(+ .system-api-keys-modal)) { z-index: 1075 !important; }
.api-payload { max-height: 150px; overflow: auto; padding: .65rem; border-radius: .25rem; background: #1f2937; color: #e5e7eb; font-size: 11px; }

.kpi-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
}

.search-box {
  position: relative;
}
.search-box .search {
  padding-left: 38px;
}
.search-box .search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
}

.system-table th {
  border-bottom-width: 1px;
  letter-spacing: 0.03em;
}

.system-row {
  transition: background-color 0.15s ease;
}

.system-row:hover {
  background-color: rgba(64, 81, 137, 0.03);
}

.system-title {
  color: #212529;
  transition: color 0.15s ease;
}

.system-row:hover .system-title {
  color: #405189;
}

.avatar-xxs {
  width: 1.8rem;
  height: 1.8rem;
}

.btn-action-edit {
  color: #405189;
  background-color: rgba(64, 81, 137, 0.08);
  border: none;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}
.btn-action-edit:hover {
  background-color: #405189;
  color: #ffffff;
}

.btn-action-delete {
  color: #f06548;
  background-color: rgba(240, 101, 72, 0.08);
  border: none;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}
.btn-action-delete:hover {
  background-color: #f06548;
  color: #ffffff;
}

.preview-box {
  background: rgba(64, 81, 137, 0.03);
  border-color: rgba(64, 81, 137, 0.15) !important;
}

/* Status Filter Pill Buttons */
.filter-pill-btn {
  font-weight: 500;
  font-size: 0.8125rem;
  transition: all 0.2s ease;
}

.filter-pill-inactive {
  background-color: #f3f6f9;
  border: 1px solid #ced4da;
  color: #495057;
}

.filter-pill-inactive:hover {
  background-color: #e9ecef;
  color: #212529;
  border-color: #adb5bd;
}

/* Dark Mode Overrides */
[data-layout-mode="dark"] .system-row:hover,
html[data-layout-mode="dark"] .system-row:hover,
[data-bs-theme="dark"] .system-row:hover,
html[data-bs-theme="dark"] .system-row:hover {
  background-color: rgba(255, 255, 255, 0.03);
}

[data-layout-mode="dark"] .system-title,
html[data-layout-mode="dark"] .system-title,
[data-bs-theme="dark"] .system-title,
html[data-bs-theme="dark"] .system-title {
  color: #ced4da;
}

[data-layout-mode="dark"] .system-row:hover .system-title,
html[data-layout-mode="dark"] .system-row:hover .system-title,
[data-bs-theme="dark"] .system-row:hover .system-title,
html[data-bs-theme="dark"] .system-row:hover .system-title {
  color: #fff;
}

[data-layout-mode="dark"] .preview-box,
html[data-layout-mode="dark"] .preview-box,
[data-bs-theme="dark"] .preview-box,
html[data-bs-theme="dark"] .preview-box {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.1) !important;
}

[data-layout-mode="dark"] .preview-box .bg-light,
html[data-layout-mode="dark"] .preview-box .bg-light,
[data-bs-theme="dark"] .preview-box .bg-light,
html[data-bs-theme="dark"] .preview-box .bg-light {
  background-color: rgba(255, 255, 255, 0.05) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}

[data-layout-mode="dark"] .preview-name,
html[data-layout-mode="dark"] .preview-name,
[data-bs-theme="dark"] .preview-name,
html[data-bs-theme="dark"] .preview-name {
  color: #fff;
}

[data-layout-mode="dark"] .filter-pill-inactive,
html[data-layout-mode="dark"] .filter-pill-inactive,
[data-bs-theme="dark"] .filter-pill-inactive,
html[data-bs-theme="dark"] .filter-pill-inactive {
  background-color: rgba(255, 255, 255, 0.08) !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
  color: #e9ecef !important;
}

[data-layout-mode="dark"] .filter-pill-inactive:hover,
html[data-layout-mode="dark"] .filter-pill-inactive:hover,
[data-bs-theme="dark"] .filter-pill-inactive:hover,
html[data-bs-theme="dark"] .filter-pill-inactive:hover {
  background-color: rgba(255, 255, 255, 0.16) !important;
  border-color: rgba(255, 255, 255, 0.4) !important;
  color: #ffffff !important;
}

.required:after {
  content: " *";
  color: #f06548;
}
</style>
