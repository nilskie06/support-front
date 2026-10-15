<template>
  <Layout>
    <PageHeader title="Permission Management" pageTitle="Settings" />

    <!-- Top KPI Metric Cards -->
    <BRow class="mb-4 g-3">
      <BCol xl="3" md="6">
        <BCard no-body class="card-animate shadow-sm border-0 h-100 kpi-card">
          <BCardBody class="d-flex align-items-center justify-content-between p-3">
            <div>
              <p class="text-uppercase fw-semibold text-muted fs-11 mb-1">Total Permissions</p>
              <h3 class="mb-0 fw-bold text-primary">
                <count-to :duration="800" :startVal="0" :endVal="stats.total"></count-to>
              </h3>
              <p class="mb-0 text-muted fs-12 mt-1">
                <span class="badge bg-primary-subtle text-primary me-1">
                  <i class="ri-key-2-line align-middle"></i> Permissions
                </span>
                Action authorities
              </p>
            </div>
            <div class="avatar-sm flex-shrink-0">
              <span class="avatar-title bg-primary-subtle text-primary rounded-circle fs-3">
                <i class="ri-key-2-line"></i>
              </span>
            </div>
          </BCardBody>
        </BCard>
      </BCol>

      <BCol xl="3" md="6">
        <BCard no-body class="card-animate shadow-sm border-0 h-100 kpi-card">
          <BCardBody class="d-flex align-items-center justify-content-between p-3">
            <div>
              <p class="text-uppercase fw-semibold text-muted fs-11 mb-1">Active Permissions</p>
              <h3 class="mb-0 fw-bold text-success">
                <count-to :duration="800" :startVal="0" :endVal="stats.active"></count-to>
              </h3>
              <p class="mb-0 text-muted fs-12 mt-1">
                <span class="badge bg-success-subtle text-success me-1">
                  <i class="ri-checkbox-circle-line align-middle"></i> In Use
                </span>
                Active in matrix
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
              <p class="text-uppercase fw-semibold text-muted fs-11 mb-1">Inactive Permissions</p>
              <h3 class="mb-0 fw-bold text-warning">
                <count-to :duration="800" :startVal="0" :endVal="stats.inactive"></count-to>
              </h3>
              <p class="mb-0 text-muted fs-12 mt-1">
                <span class="badge bg-warning-subtle text-warning me-1">
                  <i class="ri-pause-circle-line align-middle"></i> Inactive
                </span>
                Disabled guards
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
              <p class="text-uppercase fw-semibold text-muted fs-11 mb-1">Configured Roles</p>
              <h3 class="mb-0 fw-bold text-info">
                <count-to :duration="800" :startVal="0" :endVal="stats.total_roles"></count-to>
              </h3>
              <p class="mb-0 text-muted fs-12 mt-1">
                <span class="badge bg-info-subtle text-info me-1">
                  <i class="ri-shield-user-line align-middle"></i> Roles
                </span>
                Assigned in system
              </p>
            </div>
            <div class="avatar-sm flex-shrink-0">
              <span class="avatar-title bg-info-subtle text-info rounded-circle fs-3">
                <i class="ri-shield-user-line"></i>
              </span>
            </div>
          </BCardBody>
        </BCard>
      </BCol>
    </BRow>

    <!-- Main Card -->
    <BCard no-body class="shadow-sm border-0">
      <BCardHeader class="border-0 bg-transparent py-3">
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <!-- Left: Search Box -->
          <div class="d-flex align-items-center gap-2 flex-grow-1 flex-md-grow-0" style="min-width: 280px; max-width: 360px;">
            <div class="search-box w-100 position-relative">
              <input
                type="text"
                class="form-control search ps-4"
                placeholder="Search permission by name, description..."
                v-model="searchQuery"
                @input="fetchPermissions"
              />
              <i class="ri-search-line search-icon position-absolute top-50 start-0 translate-middle-y ms-2 text-muted"></i>
            </div>
          </div>

          <!-- Right: Filters & Action Buttons -->
          <div class="d-flex flex-wrap align-items-center gap-2">
            <!-- Status Filter Pills -->
            <div class="d-flex align-items-center gap-2 filter-pills-wrap" role="group">
              <button
                type="button"
                class="btn btn-sm rounded-2 filter-pill-btn"
                :class="statusFilter === 'all' ? 'btn-primary' : 'filter-pill-inactive'"
                @click="setStatusFilter('all')"
              >
                All ({{ stats.total }})
              </button>
              <button
                type="button"
                class="btn btn-sm rounded-2 filter-pill-btn"
                :class="statusFilter === 'active' ? 'btn-success' : 'filter-pill-inactive'"
                @click="setStatusFilter('active')"
              >
                Active ({{ stats.active }})
              </button>
              <button
                type="button"
                class="btn btn-sm rounded-2 filter-pill-btn"
                :class="statusFilter === 'inactive' ? 'btn-warning' : 'filter-pill-inactive'"
                @click="setStatusFilter('inactive')"
              >
                Inactive ({{ stats.inactive }})
              </button>
            </div>

            <!-- Role Matrix Link -->
            <router-link to="/settings/roles" class="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-1">
              <i class="ri-shield-user-line"></i>
              <span>Roles Matrix</span>
            </router-link>

            <!-- Create Permission Button -->
            <button
              type="button"
              class="btn btn-primary btn-sm d-inline-flex align-items-center gap-1"
              @click="openCreateModal"
            >
              <i class="ri-add-line fs-14"></i>
              <span>Create Permission</span>
            </button>
          </div>
        </div>
      </BCardHeader>

      <BCardBody class="pt-0">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading permissions...</span>
          </div>
          <p class="text-muted fs-13 mt-2">Loading permissions registry...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="permissions.length === 0" class="text-center py-5">
          <div class="avatar-lg mx-auto mb-3">
            <span class="avatar-title bg-light text-muted rounded-circle fs-1">
              <i class="ri-key-2-line"></i>
            </span>
          </div>
          <h5 class="fs-16 fw-semibold">No Permissions Found</h5>
          <p class="text-muted fs-13 mb-3">
            {{ searchQuery || statusFilter !== 'all' ? 'No permissions match your filter criteria.' : 'No permissions created yet.' }}
          </p>
          <button
            type="button"
            class="btn btn-primary btn-sm"
            @click="openCreateModal"
          >
            <i class="ri-add-line me-1"></i> Add First Permission
          </button>
        </div>

        <!-- Table -->
        <div v-else class="table-responsive">
          <table class="table align-middle table-nowrap table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th scope="col" style="width: 70px;">ID</th>
                <th scope="col">Permission Name</th>
                <th scope="col">Guard</th>
                <th scope="col">Description</th>
                <th scope="col" class="text-center">Assigned Roles</th>
                <th scope="col" class="text-center">Status</th>
                <th scope="col">Created</th>
                <th scope="col" class="text-end" style="width: 100px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="perm in permissions" :key="perm.permission_id" class="perm-row">
                <td class="fw-medium text-muted">
                  #{{ perm.permission_id }}
                </td>
                <td>
                  <div class="d-flex align-items-center">
                    <div class="avatar-xs flex-shrink-0 me-2">
                      <span class="avatar-title bg-primary-subtle text-primary rounded fs-13 font-monospace">
                        <i class="ri-key-line"></i>
                      </span>
                    </div>
                    <div>
                      <span class="fw-bold fs-13 text-uppercase font-monospace text-primary perm-name">
                        {{ perm.name }}
                      </span>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="badge bg-secondary-subtle text-secondary font-monospace">
                    {{ perm.guard_name || 'web' }}
                  </span>
                </td>
                <td>
                  <span class="text-muted fs-13">
                    {{ perm.description || '—' }}
                  </span>
                </td>
                <td class="text-center">
                  <span
                    class="badge rounded-pill px-2 py-1 fs-11"
                    :class="perm.stats?.roles_count > 0 ? 'bg-info-subtle text-info border border-info-subtle' : 'bg-light text-muted'"
                  >
                    <i class="ri-shield-user-line me-1"></i>
                    {{ perm.stats?.roles_count || 0 }} Roles
                  </span>
                </td>
                <td class="text-center">
                  <span
                    class="badge d-inline-flex align-items-center gap-1 px-2 py-1 fs-11"
                    :class="perm.status === 'active' ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-warning-subtle text-warning border border-warning-subtle'"
                  >
                    <i :class="perm.status === 'active' ? 'ri-checkbox-circle-fill' : 'ri-pause-circle-fill'"></i>
                    <span class="text-capitalize">{{ perm.status }}</span>
                  </span>
                </td>
                <td class="text-muted fs-12">
                  {{ perm.created_at || '—' }}
                </td>
                <td class="text-end">
                  <div class="d-flex align-items-center justify-content-end gap-1">
                    <button
                      type="button"
                      class="btn btn-sm btn-action-edit p-1"
                      @click="openEditModal(perm)"
                      title="Edit Permission"
                    >
                      <i class="ri-pencil-line"></i>
                    </button>
                    <button
                      type="button"
                      class="btn btn-sm btn-action-delete p-1"
                      @click="confirmDelete(perm)"
                      title="Delete Permission"
                    >
                      <i class="ri-delete-bin-line"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </BCardBody>
    </BCard>

    <!-- Create / Edit Modal -->
    <BModal
      v-model="modalShow"
      id="permissionModal"
      modal-class="zoomIn"
      class="v-modal-custom"
      :title="editingId ? 'Edit Permission' : 'Create Permission'"
      title-class="fw-bold fs-15 text-primary"
      header-class="p-3 bg-primary-subtle border-bottom"
      body-class="p-4"
      footer-class="p-3 border-top d-flex justify-content-end gap-2"
      hide-footer
      no-close-on-backdrop
      centered
    >
      <form @submit.prevent="submitForm">
        <div v-if="formError" class="alert alert-danger py-2 px-3 fs-13 mb-3 d-flex align-items-center gap-2">
          <i class="ri-error-warning-line fs-16 flex-shrink-0"></i>
          <span>{{ formError }}</span>
        </div>

        <!-- Permission Name -->
        <div class="mb-3">
          <label class="form-label fw-medium fs-13 required">Permission Name</label>
          <input
            type="text"
            class="form-control"
            :class="{ 'is-invalid': formErrors.name }"
            v-model="form.name"
            placeholder="e.g. view, add, edit, delete, modify, post, lock..."
            required
          />
          <div v-if="formErrors.name" class="invalid-feedback">
            {{ formErrors.name }}
          </div>
          <small class="text-muted fs-11">
            Standard identifier used in authorization checks and role matrix columns.
          </small>
        </div>

        <!-- Guard Name -->
        <div class="mb-3">
          <label class="form-label fw-medium fs-13">Guard Name</label>
          <input
            type="text"
            class="form-control"
            v-model="form.guard_name"
            placeholder="web"
          />
          <small class="text-muted fs-11">Default authentication guard (usually 'web' or 'api').</small>
        </div>

        <!-- Description -->
        <div class="mb-3">
          <label class="form-label fw-medium fs-13">Description</label>
          <textarea
            class="form-control"
            rows="2"
            v-model="form.description"
            placeholder="Brief explanation of what this permission grants..."
          ></textarea>
        </div>

        <!-- Status -->
        <div class="mb-4">
          <label class="form-label fw-medium fs-13">Status</label>
          <div class="d-flex align-items-center gap-3">
            <div class="form-check">
              <input
                class="form-check-input"
                type="radio"
                name="perm_status"
                id="perm_status_active"
                value="active"
                v-model="form.status"
              />
              <label class="form-check-label fs-13 cursor-pointer" for="perm_status_active">
                Active
              </label>
            </div>
            <div class="form-check">
              <input
                class="form-check-input"
                type="radio"
                name="perm_status"
                id="perm_status_inactive"
                value="inactive"
                v-model="form.status"
              />
              <label class="form-check-label fs-13 cursor-pointer" for="perm_status_inactive">
                Inactive
              </label>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="d-flex align-items-center justify-content-end gap-2 pt-3 border-top">
          <button
            type="button"
            class="btn btn-ghost-secondary"
            @click="modalShow = false"
            :disabled="submitting"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="btn btn-primary px-4"
            :disabled="submitting"
          >
            <span v-if="submitting" class="spinner-border spinner-border-sm me-1" role="status"></span>
            <i v-else class="ri-save-line me-1"></i>
            <span>{{ editingId ? 'Update Permission' : 'Create Permission' }}</span>
          </button>
        </div>
      </form>
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
  name: "PermissionManagement",
  components: {
    Layout,
    PageHeader,
    CountTo,
  },
  data() {
    return {
      loading: false,
      submitting: false,
      permissions: [],
      stats: {
        total: 0,
        active: 0,
        inactive: 0,
        total_roles: 0,
      },
      searchQuery: "",
      statusFilter: "all",
      modalShow: false,
      editingId: null,
      form: {
        name: "",
        guard_name: "web",
        description: "",
        status: "active",
      },
      formError: "",
      formErrors: {},
    };
  },
  computed: {
    apiBase() {
      return process.env.VUE_APP_AUTHDOMAIN || "http://localhost:8001/api";
    },
  },
  mounted() {
    this.fetchPermissions();
  },
  methods: {
    getAuthHeaders() {
      const token = localStorage.getItem("jwt") || localStorage.getItem("token");
      return token ? { Authorization: `Bearer ${token}` } : {};
    },

    setStatusFilter(status) {
      this.statusFilter = status;
      this.fetchPermissions();
    },

    async fetchPermissions() {
      this.loading = true;
      try {
        const params = {};
        if (this.searchQuery && this.searchQuery.trim()) {
          params.search = this.searchQuery.trim();
        }
        if (this.statusFilter !== "all") {
          params.status = this.statusFilter;
        }

        const response = await axios.get(`${this.apiBase}/permissions`, {
          params,
          headers: this.getAuthHeaders(),
        });

        this.permissions = response.data.data || [];
        if (response.data.stats) {
          this.stats = {
            total: response.data.stats.total || 0,
            active: response.data.stats.active || 0,
            inactive: response.data.stats.inactive || 0,
            total_roles: response.data.stats.total_roles || 0,
          };
        }
      } catch (err) {
        console.error("Failed to load permissions:", err);
        Swal.fire({
          icon: "error",
          title: "Network Error",
          text: err.response?.data?.message || "Failed to load permissions from server.",
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
        guard_name: "web",
        description: "",
        status: "active",
      };
      this.formError = "";
      this.formErrors = {};
      this.modalShow = true;
    },

    openEditModal(perm) {
      this.editingId = perm.permission_id;
      this.form = {
        name: perm.name || "",
        guard_name: perm.guard_name || "web",
        description: perm.description || "",
        status: perm.status || "active",
      };
      this.formError = "";
      this.formErrors = {};
      this.modalShow = true;
    },

    async submitForm() {
      this.formError = "";
      this.formErrors = {};

      if (!this.form.name || !this.form.name.trim()) {
        this.formErrors.name = "Permission name is required.";
        return;
      }

      this.submitting = true;
      try {
        const payload = {
          name: this.form.name.trim().toLowerCase(),
          guard_name: this.form.guard_name ? this.form.guard_name.trim() : "web",
          description: this.form.description ? this.form.description.trim() : null,
          status: this.form.status || "active",
        };

        if (this.editingId) {
          await axios.put(`${this.apiBase}/permissions/${this.editingId}`, payload, {
            headers: this.getAuthHeaders(),
          });
          Swal.fire({
            icon: "success",
            title: "Updated",
            text: "Permission updated successfully.",
            toast: true,
            position: "top-end",
            timer: 2500,
            showConfirmButton: false,
          });
        } else {
          await axios.post(`${this.apiBase}/permissions`, payload, {
            headers: this.getAuthHeaders(),
          });
          Swal.fire({
            icon: "success",
            title: "Created",
            text: "Permission created and available in role matrix.",
            toast: true,
            position: "top-end",
            timer: 2500,
            showConfirmButton: false,
          });
        }

        this.modalShow = false;
        await this.fetchPermissions();
      } catch (err) {
        if (err.response?.status === 422 && err.response?.data?.errors) {
          this.formErrors = err.response.data.errors;
          this.formError = Object.values(err.response.data.errors).flat().join(" ");
        } else {
          this.formError = err.response?.data?.message || "Failed to save permission.";
        }
      } finally {
        this.submitting = false;
      }
    },

    async confirmDelete(perm) {
      const result = await Swal.fire({
        title: "Delete Permission?",
        html: `Are you sure you want to delete permission <strong>"${perm.name.toUpperCase()}"</strong>?<br><small class="text-muted">This will remove this permission column from all assigned roles in the matrix.</small>`,
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
          await axios.delete(`${this.apiBase}/permissions/${perm.permission_id}`, {
            headers: this.getAuthHeaders(),
          });
          Swal.fire({
            icon: "success",
            title: "Deleted",
            text: "Permission deleted successfully.",
            toast: true,
            position: "top-end",
            timer: 2500,
            showConfirmButton: false,
          });
          await this.fetchPermissions();
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Delete Failed",
            text: err.response?.data?.message || "Failed to delete permission.",
            confirmButtonClass: "btn btn-primary",
            buttonsStyling: false,
          });
        }
      }
    },
  },
};
</script>

<style scoped>
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
  padding-left: 36px;
}
.search-box .search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
}

.perm-row {
  transition: background-color 0.15s ease;
}
.perm-row:hover {
  background-color: rgba(64, 81, 137, 0.03);
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

.filter-pills-wrap {
  display: flex !important;
  align-items: center;
  gap: 8px !important;
}

.filter-pill-btn {
  font-weight: 500;
  font-size: 0.8125rem;
  border-radius: 6px !important;
  padding: 0.28rem 0.65rem !important;
  margin: 0 !important;
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

.cursor-pointer {
  cursor: pointer;
}

.required:after {
  content: " *";
  color: #f06548;
}

/* Dark Mode Overrides */
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
  color: #ffffff !important;
}
[data-layout-mode="dark"] .perm-name,
html[data-layout-mode="dark"] .perm-name,
[data-bs-theme="dark"] .perm-name,
html[data-bs-theme="dark"] .perm-name {
  color: #60a5fa !important;
}

/* Modal Dark Mode & Visibility Fix */
#permissionModal .modal-content,
.v-modal-custom .modal-content {
  background-color: var(--vz-card-bg, #ffffff) !important;
  color: var(--vz-body-color, #212529) !important;
  z-index: 1060 !important;
  box-shadow: 0 10px 35px rgba(0, 0, 0, 0.45) !important;
}

[data-layout-mode="dark"] #permissionModal .modal-content,
[data-bs-theme="dark"] #permissionModal .modal-content,
html[data-bs-theme="dark"] #permissionModal .modal-content,
html[data-layout-mode="dark"] #permissionModal .modal-content {
  background-color: #212529 !important;
  color: #f8fafc !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
}

[data-layout-mode="dark"] #permissionModal .form-label,
[data-bs-theme="dark"] #permissionModal .form-label,
html[data-bs-theme="dark"] #permissionModal .form-label,
html[data-layout-mode="dark"] #permissionModal .form-label {
  color: #f1f5f9 !important;
}

[data-layout-mode="dark"] #permissionModal .form-control,
[data-bs-theme="dark"] #permissionModal .form-control,
html[data-bs-theme="dark"] #permissionModal .form-control,
html[data-layout-mode="dark"] #permissionModal .form-control {
  background-color: #1a1d21 !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
  color: #f8fafc !important;
}

[data-layout-mode="dark"] #permissionModal .form-check-label,
[data-bs-theme="dark"] #permissionModal .form-check-label,
html[data-bs-theme="dark"] #permissionModal .form-check-label,
html[data-layout-mode="dark"] #permissionModal .form-check-label {
  color: #e2e8f0 !important;
}
</style>
