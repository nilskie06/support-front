<template>
  <Layout>
    <PageHeader title="Issue Severities" pageTitle="Settings" />

    <!-- Top KPI Metric Cards -->
    <BRow class="mb-4 g-3">
      <BCol xl="3" md="6">
        <BCard no-body class="card-animate shadow-sm border-0 h-100">
          <BCardBody class="d-flex align-items-center justify-content-between p-3">
            <div>
              <p class="text-uppercase fw-semibold text-muted fs-11 mb-1">Total Severities</p>
              <h3 class="mb-0 fw-bold text-primary">
                <count-to :duration="800" :startVal="0" :endVal="stats.total_severities"></count-to>
              </h3>
              <p class="mb-0 text-muted fs-12 mt-1">
                <span class="badge bg-primary-subtle text-primary me-1">
                  <i class="ri-shield-star-line align-middle"></i> Priority Levels
                </span>
              </p>
            </div>
            <div class="avatar-sm flex-shrink-0">
              <span class="avatar-title bg-primary-subtle text-primary rounded-circle fs-3">
                <i class="ri-shield-star-line"></i>
              </span>
            </div>
          </BCardBody>
        </BCard>
      </BCol>

      <BCol xl="3" md="6">
        <BCard no-body class="card-animate shadow-sm border-0 h-100">
          <BCardBody class="d-flex align-items-center justify-content-between p-3">
            <div>
              <p class="text-uppercase fw-semibold text-muted fs-11 mb-1">Active Levels</p>
              <h3 class="mb-0 fw-bold text-success">
                <count-to :duration="800" :startVal="0" :endVal="stats.active_severities"></count-to>
              </h3>
              <p class="mb-0 text-muted fs-12 mt-1">
                <span class="badge bg-success-subtle text-success me-1">
                  <i class="ri-checkbox-circle-line align-middle"></i> Enabled
                </span>
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
        <BCard no-body class="card-animate shadow-sm border-0 h-100">
          <BCardBody class="d-flex align-items-center justify-content-between p-3">
            <div>
              <p class="text-uppercase fw-semibold text-muted fs-11 mb-1">Disabled Levels</p>
              <h3 class="mb-0 fw-bold text-warning">
                <count-to :duration="800" :startVal="0" :endVal="stats.disabled_severities"></count-to>
              </h3>
              <p class="mb-0 text-muted fs-12 mt-1">
                <span class="badge bg-warning-subtle text-warning me-1">
                  <i class="ri-pause-circle-line align-middle"></i> Inactive
                </span>
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
        <BCard no-body class="card-animate shadow-sm border-0 h-100">
          <BCardBody class="d-flex align-items-center justify-content-between p-3">
            <div>
              <p class="text-uppercase fw-semibold text-muted fs-11 mb-1">Assigned Tickets</p>
              <h3 class="mb-0 fw-bold text-info">
                <count-to :duration="800" :startVal="0" :endVal="stats.total_tickets"></count-to>
              </h3>
              <p class="mb-0 text-muted fs-12 mt-1">
                <span class="badge bg-info-subtle text-info me-1">
                  <i class="ri-ticket-2-line align-middle"></i> Prioritized
                </span>
              </p>
            </div>
            <div class="avatar-sm flex-shrink-0">
              <span class="avatar-title bg-info-subtle text-info rounded-circle fs-3">
                <i class="ri-ticket-2-line"></i>
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
            <h5 class="card-title mb-0 fw-bold">Issue Severities Management (tkt_issue_severities)</h5>
            <span class="badge bg-secondary-subtle text-secondary">
              {{ severities.length }} Levels Configured
            </span>
          </div>

          <div class="d-flex align-items-center gap-2">
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary"
              :disabled="loading"
              @click="fetchSeverities"
              title="Reload severities from database"
            >
              <i class="ri-refresh-line" :class="{ 'ri-spin': loading }"></i>
            </button>

            <button
              type="button"
              class="btn btn-sm btn-primary d-flex align-items-center gap-1 shadow-sm"
              @click="openCreateModal"
            >
              <i class="ri-add-line fs-14"></i>
              <span>Create Severity</span>
            </button>
          </div>
        </div>
      </BCardHeader>

      <!-- Filter Toolbar -->
      <BCardBody class="border-top border-bottom border-dashed border-start-0 border-end-0 py-3 toolbar-container">
        <BRow class="g-3 align-items-center">
          <BCol xl="4" lg="5" sm="12">
            <div class="search-box">
              <input
                type="text"
                class="form-control search"
                placeholder="Search severity by name..."
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

          <BCol xl="3" lg="4" sm="6">
            <div class="d-flex align-items-center gap-2">
              <label class="form-label fs-12 fw-medium text-muted mb-0 flex-shrink-0">Status:</label>
              <select class="form-select form-select-sm" v-model="selectedStatusFilter">
                <option value="all">All Severities</option>
                <option value="active">Active Only</option>
                <option value="disabled">Disabled Only</option>
              </select>
            </div>
          </BCol>

          <BCol xl="5" lg="3" sm="6" class="text-sm-end text-muted fs-12">
            Showing {{ filteredSeverities.length }} of {{ severities.length }} levels
          </BCol>
        </BRow>
      </BCardBody>

      <!-- Table Content -->
      <BCardBody class="p-0">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading severities...</span>
          </div>
          <p class="text-muted mt-2 mb-0">Loading severities from database...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredSeverities.length === 0" class="text-center py-5">
          <div class="avatar-lg mx-auto mb-3">
            <span class="avatar-title bg-light text-muted rounded-circle fs-1">
              <i class="ri-shield-star-line"></i>
            </span>
          </div>
          <h5 class="fw-semibold">No Severities Found</h5>
          <p class="text-muted fs-13 mb-3">
            {{ searchQuery || selectedStatusFilter !== 'all' ? 'No records match your filters.' : 'No severities have been created yet.' }}
          </p>
          <button
            v-if="searchQuery || selectedStatusFilter !== 'all'"
            type="button"
            class="btn btn-sm btn-outline-secondary me-2"
            @click="resetFilters"
          >
            Clear Filters
          </button>
          <button
            type="button"
            class="btn btn-sm btn-primary"
            @click="openCreateModal"
          >
            <i class="ri-add-line me-1"></i> Add Severity
          </button>
        </div>

        <!-- Severities Table -->
        <div v-else class="table-responsive">
          <table class="table align-middle table-nowrap table-hover mb-0">
            <thead class="table-light text-muted text-uppercase fs-11">
              <tr>
                <th scope="col" style="width: 80px;" class="ps-3">ID</th>
                <th scope="col" style="width: 220px;">Severity Level</th>
                <th scope="col" style="width: 200px;">Color Token</th>
                <th scope="col" style="width: 140px;">Status</th>
                <th scope="col" style="width: 140px;">Linked Tickets</th>
                <th scope="col" style="width: 160px;">Created Date</th>
                <th scope="col" style="width: 110px;" class="text-end pe-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sev in filteredSeverities" :key="sev.id" class="severity-row">
                <td class="ps-3 fw-semibold text-muted fs-12">
                  #SEV-{{ String(sev.id).padStart(2, '0') }}
                </td>

                <td>
                  <div class="d-flex align-items-center gap-2">
                    <span
                      class="color-dot rounded-circle shadow-xs"
                      :style="getColorDotStyle(sev.color)"
                    ></span>
                    <span class="fs-13 fw-semibold text-dark">
                      {{ sev.name }}
                    </span>
                    <span :class="getBadgeClass(sev.color)">
                      {{ sev.name }}
                    </span>
                  </div>
                </td>

                <td>
                  <div class="d-flex align-items-center gap-2">
                    <span
                      class="color-preview-chip"
                      :style="getColorDotStyle(sev.color)"
                    ></span>
                    <code class="fs-12 fw-medium">
                      {{ sev.color || 'primary' }}
                    </code>
                  </div>
                </td>

                <td>
                  <span
                    class="badge"
                    :class="sev.enable ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'"
                  >
                    <i :class="sev.enable ? 'ri-checkbox-circle-line me-1' : 'ri-close-circle-line me-1'"></i>
                    {{ sev.enable ? 'Enabled' : 'Disabled' }}
                  </span>
                </td>

                <td>
                  <span
                    class="badge"
                    :class="sev.tickets_count > 0 ? 'bg-info-subtle text-info border border-info-subtle' : 'bg-light text-muted border border-light'"
                  >
                    <i class="ri-ticket-2-line me-1"></i>
                    {{ sev.tickets_count || 0 }} {{ sev.tickets_count === 1 ? 'Ticket' : 'Tickets' }}
                  </span>
                </td>

                <td class="text-muted fs-12">
                  {{ formatDate(sev.created_at) }}
                </td>

                <td class="text-end pe-3">
                  <div class="d-flex align-items-center justify-content-end gap-1">
                    <button
                      type="button"
                      class="btn btn-sm btn-soft-primary p-1"
                      @click="openEditModal(sev)"
                      title="Edit Severity"
                    >
                      <i class="ri-pencil-line fs-14"></i>
                    </button>
                    <button
                      type="button"
                      class="btn btn-sm btn-soft-danger p-1"
                      @click="confirmDelete(sev)"
                      title="Delete Severity"
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

    <!-- Modal: Create / Edit Issue Severity -->
    <BModal
      v-model="modalShow"
      id="severityModal"
      modal-class="zoomIn"
      :title="editingId ? 'Edit Severity Level' : 'Create Severity Level'"
      title-class="exampleModalLabel fw-bold fs-15"
      hide-footer
      header-class="p-3 bg-primary-subtle"
      class="v-modal-custom"
      centered
      body-class="p-4"
    >
      <form @submit.prevent="submitForm">
        <!-- Error alert -->
        <div v-if="formError" class="alert alert-danger py-2 px-3 fs-13 mb-3 d-flex align-items-center gap-2">
          <i class="ri-error-warning-line fs-16"></i>
          <span>{{ formError }}</span>
        </div>

        <!-- Name -->
        <div class="mb-3">
          <label class="form-label fw-semibold fs-13 required">
            Severity Name <span class="text-danger">*</span>
          </label>
          <input
            type="text"
            class="form-control"
            placeholder="e.g. Low, Medium, High, Critical, Urgent"
            v-model="form.name"
            maxlength="50"
            required
            :class="{ 'is-invalid': formErrors.name }"
          />
          <div v-if="formErrors.name" class="invalid-feedback">
            {{ formErrors.name }}
          </div>
          <small class="text-muted fs-11">
            Display name representing ticket urgency.
          </small>
        </div>

        <!-- Color Token Selection -->
        <div class="mb-3">
          <label class="form-label fw-semibold fs-13">Badge Color / Theme</label>
          <div class="d-flex align-items-center gap-2 mb-2">
            <select class="form-select" v-model="form.color">
              <option value="success">Success (Green - Low)</option>
              <option value="warning">Warning (Yellow/Orange - Medium)</option>
              <option value="danger">Danger (Red - High)</option>
              <option value="dark">Dark (Black - Critical)</option>
              <option value="info">Info (Cyan - Informational)</option>
              <option value="primary">Primary (Blue - Normal)</option>
              <option value="secondary">Secondary (Gray)</option>
            </select>
          </div>

          <!-- Color Preset Swatches -->
          <div class="d-flex flex-wrap gap-2 pt-1">
            <button
              v-for="preset in colorPresets"
              :key="preset.value"
              type="button"
              class="btn btn-sm"
              :class="[
                preset.btnClass,
                form.color === preset.value ? 'ring-active border border-2 border-dark' : 'opacity-75'
              ]"
              @click="form.color = preset.value"
              :title="preset.label"
            >
              {{ preset.label }}
            </button>
          </div>
        </div>

        <!-- Status Toggle -->
        <div class="mb-3">
          <div class="form-check form-switch form-switch-md">
            <input
              class="form-check-input"
              type="checkbox"
              id="severityEnableSwitch"
              v-model="form.enable"
            />
            <label class="form-check-label fw-medium ms-1" for="severityEnableSwitch">
              Active / Enabled
            </label>
          </div>
          <small class="text-muted fs-11">
            When enabled, users can select this severity when creating and editing tickets.
          </small>
        </div>

        <!-- Live Preview Box -->
        <div class="mb-4 p-3 rounded border preview-box">
          <label class="form-label fw-semibold fs-11 text-uppercase text-muted mb-2">
            Live Preview
          </label>
          <div class="d-flex align-items-center gap-2">
            <span :class="getBadgeClass(form.color)">
              {{ form.name || 'Sample Severity' }}
            </span>
            <span
              class="badge"
              :class="form.enable ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'"
            >
              {{ form.enable ? 'Enabled' : 'Disabled' }}
            </span>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="modal-footer v-modal-footer mt-4 pb-0 px-0">
          <div class="hstack gap-2 justify-content-end w-100">
            <button type="button" class="btn btn-ghost-secondary" @click="modalShow = false">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary d-flex align-items-center gap-1" :disabled="submitting">
              <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
              <i v-else :class="editingId ? 'ri-save-line' : 'ri-check-line'"></i>
              <span>{{ editingId ? 'Save Changes' : 'Create Severity' }}</span>
            </button>
          </div>
        </div>
      </form>
    </BModal>
  </Layout>
</template>

<script>
import { CountTo } from "vue3-count-to";
import axios from "axios";
import Swal from "sweetalert2";
import Layout from "@/layouts/main.vue";
import PageHeader from "@/components/page-header.vue";

export default {
  name: "IssueSeveritiesSettings",
  components: {
    Layout,
    PageHeader,
    CountTo,
  },
  data() {
    return {
      severities: [],
      loading: false,
      searchQuery: "",
      selectedStatusFilter: "all",

      stats: {
        total_severities: 0,
        total_tickets: 0,
        active_severities: 0,
        disabled_severities: 0,
      },

      modalShow: false,
      editingId: null,
      submitting: false,
      formError: "",
      formErrors: {},

      form: {
        name: "",
        color: "primary",
        enable: true,
      },

      colorPresets: [
        { value: "success", label: "Low", btnClass: "btn-soft-success" },
        { value: "warning", label: "Medium", btnClass: "btn-soft-warning" },
        { value: "danger", label: "High", btnClass: "btn-soft-danger" },
        { value: "dark", label: "Critical", btnClass: "btn-soft-dark" },
        { value: "info", label: "Info", btnClass: "btn-soft-info" },
        { value: "primary", label: "Primary", btnClass: "btn-soft-primary" },
      ],
    };
  },
  computed: {
    apiBase() {
      return process.env.VUE_APP_AUTHDOMAIN || "http://localhost:8001/api";
    },
    filteredSeverities() {
      let result = this.severities;

      if (this.selectedStatusFilter === "active") {
        result = result.filter((s) => Boolean(s.enable));
      } else if (this.selectedStatusFilter === "disabled") {
        result = result.filter((s) => !s.enable);
      }

      if (this.searchQuery && this.searchQuery.trim()) {
        const q = this.searchQuery.trim().toLowerCase();
        result = result.filter((s) => s.name?.toLowerCase().includes(q));
      }

      return result;
    },
  },
  mounted() {
    this.fetchSeverities();
  },
  methods: {
    getAuthHeaders() {
      const token =
        sessionStorage.getItem("jwt") ||
        localStorage.getItem("jwt") ||
        sessionStorage.getItem("token") ||
        localStorage.getItem("token");
      return token ? { Authorization: `Bearer ${token}` } : {};
    },

    async fetchSeverities() {
      this.loading = true;
      try {
        const res = await axios.get(`${this.apiBase}/severities`, {
          headers: this.getAuthHeaders(),
        });
        this.severities = res.data.data || [];
        if (res.data.stats) {
          this.stats = {
            total_severities: res.data.stats.total_severities ?? this.severities.length,
            total_tickets: res.data.stats.total_tickets ?? 0,
            active_severities: res.data.stats.active_severities ?? this.severities.filter((s) => s.enable).length,
            disabled_severities: res.data.stats.disabled_severities ?? this.severities.filter((s) => !s.enable).length,
          };
        } else {
          this.stats = {
            total_severities: this.severities.length,
            total_tickets: 0,
            active_severities: this.severities.filter((s) => s.enable).length,
            disabled_severities: this.severities.filter((s) => !s.enable).length,
          };
        }
      } catch (err) {
        console.error("Failed to load severities:", err);
        Swal.fire({
          icon: "error",
          title: "Network Error",
          text: err.response?.data?.message || "Failed to load severities from server.",
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
        name: "",
        color: "primary",
        enable: true,
      };
      this.formError = "";
      this.formErrors = {};
      this.modalShow = true;
    },

    openEditModal(sev) {
      this.editingId = sev.id;
      this.form = {
        name: sev.name,
        color: sev.color || "primary",
        enable: Boolean(sev.enable),
      };
      this.formError = "";
      this.formErrors = {};
      this.modalShow = true;
    },

    async submitForm() {
      this.formError = "";
      this.formErrors = {};

      if (!this.form.name || !this.form.name.trim()) {
        this.formErrors.name = "Severity name is required.";
        return;
      }

      this.submitting = true;
      try {
        const payload = {
          name: this.form.name.trim(),
          color: this.form.color || "primary",
          enable: Boolean(this.form.enable),
        };

        if (this.editingId) {
          await axios.put(`${this.apiBase}/severities/${this.editingId}`, payload, {
            headers: this.getAuthHeaders(),
          });
          Swal.fire({
            icon: "success",
            title: "Updated",
            text: "Severity updated successfully.",
            toast: true,
            position: "top-end",
            timer: 2500,
            showConfirmButton: false,
          });
        } else {
          await axios.post(`${this.apiBase}/severities`, payload, {
            headers: this.getAuthHeaders(),
          });
          Swal.fire({
            icon: "success",
            title: "Created",
            text: "Severity created successfully.",
            toast: true,
            position: "top-end",
            timer: 2500,
            showConfirmButton: false,
          });
        }

        this.modalShow = false;
        await this.fetchSeverities();
      } catch (err) {
        if (err.response?.status === 422 && err.response?.data?.errors) {
          this.formErrors = err.response.data.errors;
          this.formError = Object.values(err.response.data.errors).flat().join(" ");
        } else {
          this.formError = err.response?.data?.message || "Failed to save severity.";
        }
      } finally {
        this.submitting = false;
      }
    },

    async confirmDelete(sev) {
      if (sev.tickets_count > 0) {
        Swal.fire({
          icon: "warning",
          title: "Cannot Delete Severity",
          html: `The severity <strong>"${sev.name}"</strong> is currently assigned to <strong>${sev.tickets_count} ticket(s)</strong>.<br><br>Please reassign those tickets before deleting this severity.`,
          confirmButtonText: "Understood",
          confirmButtonClass: "btn btn-primary",
          buttonsStyling: false,
        });
        return;
      }

      const result = await Swal.fire({
        title: "Delete Severity?",
        html: `Are you sure you want to delete <strong>"${sev.name}"</strong>?<br><small class="text-muted">This action cannot be undone.</small>`,
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
          await axios.delete(`${this.apiBase}/severities/${sev.id}`, {
            headers: this.getAuthHeaders(),
          });
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Severity deleted successfully.",
            toast: true,
            position: "top-end",
            timer: 2500,
            showConfirmButton: false,
          });
          await this.fetchSeverities();
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Delete Failed",
            text: err.response?.data?.message || "Failed to delete severity.",
            confirmButtonClass: "btn btn-primary",
          });
        }
      }
    },

    resetFilters() {
      this.searchQuery = "";
      this.selectedStatusFilter = "all";
    },

    getBadgeClass(color) {
      const c = String(color || "primary").toLowerCase();
      if (c === "success") return "badge bg-success-subtle text-success fs-12 px-2 py-1";
      if (c === "warning") return "badge bg-warning-subtle text-warning fs-12 px-2 py-1";
      if (c === "danger") return "badge bg-danger-subtle text-danger fs-12 px-2 py-1";
      if (c === "dark") return "badge bg-dark-subtle text-dark fs-12 px-2 py-1";
      if (c === "info") return "badge bg-info-subtle text-info fs-12 px-2 py-1";
      if (c === "secondary") return "badge bg-secondary-subtle text-secondary fs-12 px-2 py-1";
      return "badge bg-primary-subtle text-primary fs-12 px-2 py-1";
    },

    getColorDotStyle(color) {
      const c = String(color || "primary").toLowerCase();
      const map = {
        success: "#0ab39c",
        warning: "#f7b84b",
        danger: "#f06548",
        dark: "#212529",
        info: "#299cdb",
        primary: "#405189",
        secondary: "#878a99",
      };
      const bg = map[c] || c;
      return { backgroundColor: bg };
    },

    formatDate(val) {
      if (!val) return "—";
      try {
        const d = new Date(val);
        return d.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      } catch (e) {
        return val;
      }
    },
  },
};
</script>

<style scoped>
.preview-box {
  background-color: var(--vz-card-bg, #ffffff);
  border-color: var(--vz-border-color, #e9ebec) !important;
}

.search-box .search-icon {
  position: absolute;
  top: 50%;
  left: 12px;
  transform: translateY(-50%);
  pointer-events: none;
}

.search-box .search {
  padding-left: 36px;
}

.color-dot {
  width: 10px;
  height: 10px;
  display: inline-block;
}

.color-preview-chip {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  display: inline-block;
}

.severity-row:hover {
  background-color: rgba(var(--vz-primary-rgb, 64, 81, 137), 0.04);
}
</style>
