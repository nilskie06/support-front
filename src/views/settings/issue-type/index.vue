<template>
  <Layout>
    <PageHeader title="Issue Types" pageTitle="Settings" />

    <!-- Top KPI Metric Cards -->
    <BRow class="mb-4 g-3">
      <BCol xl="3" md="6">
        <BCard no-body class="card-animate shadow-sm border-0 h-100">
          <BCardBody class="d-flex align-items-center justify-content-between p-3">
            <div>
              <p class="text-uppercase fw-semibold text-muted fs-11 mb-1">Total Issue Types</p>
              <h3 class="mb-0 fw-bold text-primary">
                <count-to :duration="800" :startVal="0" :endVal="stats.total_types"></count-to>
              </h3>
              <p class="mb-0 text-muted fs-12 mt-1">
                <span class="badge bg-primary-subtle text-primary me-1">
                  <i class="ri-price-tag-3-line align-middle"></i> Catalog
                </span>
              </p>
            </div>
            <div class="avatar-sm flex-shrink-0">
              <span class="avatar-title bg-primary-subtle text-primary rounded-circle fs-3">
                <i class="ri-price-tag-3-line"></i>
              </span>
            </div>
          </BCardBody>
        </BCard>
      </BCol>

      <BCol xl="3" md="6">
        <BCard no-body class="card-animate shadow-sm border-0 h-100">
          <BCardBody class="d-flex align-items-center justify-content-between p-3">
            <div>
              <p class="text-uppercase fw-semibold text-muted fs-11 mb-1">Active Categories</p>
              <h3 class="mb-0 fw-bold text-success">
                <count-to :duration="800" :startVal="0" :endVal="stats.active_types"></count-to>
              </h3>
              <p class="mb-0 text-muted fs-12 mt-1">
                <span class="badge bg-success-subtle text-success me-1">
                  <i class="ri-checkbox-circle-line align-middle"></i> In Use
                </span>
              </p>
            </div>
            <div class="avatar-sm flex-shrink-0">
              <span class="avatar-title bg-success-subtle text-success rounded-circle fs-3">
                <i class="ri-folder-check-line"></i>
              </span>
            </div>
          </BCardBody>
        </BCard>
      </BCol>

      <BCol xl="3" md="6">
        <BCard no-body class="card-animate shadow-sm border-0 h-100">
          <BCardBody class="d-flex align-items-center justify-content-between p-3">
            <div>
              <p class="text-uppercase fw-semibold text-muted fs-11 mb-1">Associated Tickets</p>
              <h3 class="mb-0 fw-bold text-info">
                <count-to :duration="800" :startVal="0" :endVal="stats.total_tickets"></count-to>
              </h3>
              <p class="mb-0 text-muted fs-12 mt-1">
                <span class="badge bg-info-subtle text-info me-1">
                  <i class="ri-ticket-2-line align-middle"></i> Routed
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

      <BCol xl="3" md="6">
        <BCard no-body class="card-animate shadow-sm border-0 h-100">
          <BCardBody class="d-flex align-items-center justify-content-between p-3">
            <div>
              <p class="text-uppercase fw-semibold text-muted fs-11 mb-1">Top Volume Type</p>
              <h4 class="mb-0 fw-bold text-warning text-truncate" style="max-width: 170px;" :title="stats.most_common">
                {{ stats.most_common || 'None' }}
              </h4>
              <p class="mb-0 text-muted fs-12 mt-1">
                <span class="badge bg-warning-subtle text-warning me-1">
                  <i class="ri-fire-line align-middle"></i> High Demand
                </span>
              </p>
            </div>
            <div class="avatar-sm flex-shrink-0">
              <span class="avatar-title bg-warning-subtle text-warning rounded-circle fs-3">
                <i class="ri-fire-line"></i>
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
            <h5 class="card-title mb-0 fw-bold">Issue Types Catalog</h5>
            <span class="badge bg-secondary-subtle text-secondary">
              {{ issueTypes.length }} Types Configured
            </span>
          </div>

          <div class="d-flex align-items-center gap-2">
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary"
              :disabled="loading"
              @click="fetchIssueTypes"
              title="Reload issue types from database"
            >
              <i class="ri-refresh-line" :class="{ 'ri-spin': loading }"></i>
            </button>

            <button
              type="button"
              class="btn btn-sm btn-primary d-flex align-items-center gap-1 shadow-sm"
              @click="openCreateModal"
            >
              <i class="ri-add-line fs-14"></i>
              <span>Create Issue Type</span>
            </button>
          </div>
        </div>
      </BCardHeader>

      <!-- Filter Toolbar -->
      <BCardBody class="border-top border-bottom border-dashed border-start-0 border-end-0 py-3 toolbar-container">
        <BRow class="g-3 align-items-center">
          <BCol xl="5" lg="6" sm="12">
            <div class="search-box">
              <input
                type="text"
                class="form-control search"
                placeholder="Search issue types by description or keywords..."
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
          <BCol xl="7" lg="6" sm="12" class="text-sm-end text-muted fs-12">
            Showing {{ filteredTypes.length }} of {{ issueTypes.length }} issue types
          </BCol>
        </BRow>
      </BCardBody>

      <!-- Table Content -->
      <BCardBody class="p-0">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading issue types...</span>
          </div>
          <p class="text-muted mt-2 mb-0">Loading issue types from server...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredTypes.length === 0" class="text-center py-5">
          <div class="avatar-lg mx-auto mb-3">
            <span class="avatar-title bg-light text-muted rounded-circle fs-1">
              <i class="ri-price-tag-3-line"></i>
            </span>
          </div>
          <h5 class="fw-semibold">No Issue Types Found</h5>
          <p class="text-muted fs-13 mb-3">
            {{ searchQuery ? 'No records match your search criteria "' + searchQuery + '"' : 'No issue types have been created yet.' }}
          </p>
          <button
            v-if="searchQuery"
            type="button"
            class="btn btn-sm btn-outline-secondary me-2"
            @click="searchQuery = ''"
          >
            Clear Search Filter
          </button>
          <button
            type="button"
            class="btn btn-sm btn-primary"
            @click="openCreateModal"
          >
            <i class="ri-add-line me-1"></i> Add Issue Type
          </button>
        </div>

        <!-- Issue Types Table -->
        <div v-else class="table-responsive">
          <table class="table align-middle table-nowrap table-hover mb-0">
            <thead class="table-light text-muted text-uppercase fs-11">
              <tr>
                <th scope="col" style="width: 80px;" class="ps-3">ID</th>
                <th scope="col" style="width: 180px;">Category</th>
                <th scope="col" style="width: 280px;">Issue Type</th>
                <th scope="col" style="width: 180px;">Color Token</th>
                <th scope="col" style="width: 160px;">Linked Tickets</th>
                <th scope="col" style="width: 180px;">Updated At</th>
                <th scope="col" style="width: 110px;" class="text-end pe-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="type in filteredTypes" :key="type.issue_id" class="issue-type-row">
                <td class="ps-3 fw-semibold text-muted fs-12 issue-id-col">
                  #IT-{{ String(type.issue_id).padStart(2, '0') }}
                </td>

                <td>
                  <span v-if="type.board" class="badge bg-primary-subtle text-primary border border-primary-subtle">
                    {{ type.board.name }}
                  </span>
                  <span v-else class="badge bg-secondary-subtle text-secondary border border-secondary-subtle">Global</span>
                </td>

                <td>
                  <div class="d-flex align-items-center gap-2">
                    <span
                      class="color-dot rounded-circle shadow-xs"
                      :style="{ backgroundColor: type.color || '#405189' }"
                    ></span>
                    <span class="fs-13 fw-semibold type-name">
                      {{ type.issue_desc }}
                    </span>
                  </div>
                </td>

                <td>
                  <div class="d-flex align-items-center gap-2">
                    <span
                      class="color-preview-chip"
                      :style="{ backgroundColor: type.color || '#405189' }"
                    ></span>
                    <code class="fs-12 fw-medium color-code">
                      {{ type.color || '#405189' }}
                    </code>
                  </div>
                </td>

                <td>
                  <span
                    class="badge"
                    :class="type.tickets_count > 0 ? 'badge-tickets-active bg-info-subtle text-info border border-info-subtle' : 'badge-tickets-zero bg-light text-muted border border-light'"
                  >
                    <i class="ri-ticket-2-line me-1"></i>
                    {{ type.tickets_count }} {{ type.tickets_count === 1 ? 'Ticket' : 'Tickets' }}
                  </span>
                </td>

                <td class="text-muted fs-12 updated-at-col">
                  {{ formatDate(type.updated_at || type.created_at) }}
                </td>

                <td class="text-end pe-3">
                  <div class="d-flex align-items-center justify-content-end gap-1">
                    <button
                      type="button"
                      class="btn btn-sm btn-action-edit p-1"
                      @click="openEditModal(type)"
                      title="Edit Issue Type"
                    >
                      <i class="ri-pencil-line fs-14"></i>
                    </button>
                    <button
                      type="button"
                      class="btn btn-sm btn-action-delete p-1"
                      @click="confirmDelete(type)"
                      title="Delete Issue Type"
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

    <!-- Modal: Create / Edit Issue Type -->
    <BModal
      v-model="modalShow"
      id="issueTypeModal"
      modal-class="zoomIn"
      :title="editingId ? 'Edit Issue Type' : 'Create Issue Type'"
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

        <!-- Issue Description -->
        <div class="mb-3">
          <label class="form-label fw-semibold fs-13 required">
            Issue Type Description
          </label>
          <input
            type="text"
            class="form-control"
            placeholder="e.g. Bug / Defect, Feature Request, Security Vulnerability"
            v-model="form.issue_desc"
            maxlength="50"
            required
            :class="{ 'is-invalid': formErrors.issue_desc }"
          />
          <div v-if="formErrors.issue_desc" class="invalid-feedback">
            {{ formErrors.issue_desc }}
          </div>
          <small class="text-muted fs-11">
            Max 50 characters. Must be unique across issue types.
          </small>
        </div>

        <div class="mb-3">
          <label for="issueTypeBoard" class="form-label fw-semibold fs-13">Category</label>
          <select id="issueTypeBoard" class="form-select" v-model="form.board_id">
            <option :value="null">Global (All Categories)</option>
            <option v-for="board in boards" :key="board.id" :value="board.id">
              {{ board.name }}
            </option>
          </select>
          <small class="text-muted fs-11">Optionally assign this issue type to a category.</small>
        </div>

        <!-- Color Selector -->
        <div class="mb-3">
          <label class="form-label fw-semibold fs-13">Badge Accent Color</label>
          <div class="d-flex align-items-center gap-2 mb-2">
            <input
              type="color"
              class="form-control form-control-color"
              v-model="form.color"
              style="width: 48px; height: 38px; padding: 2px;"
              title="Pick custom color"
            />
            <input
              type="text"
              class="form-control"
              v-model="form.color"
              placeholder="#405189"
              maxlength="20"
            />
          </div>

          <!-- Color Swatch Presets -->
          <div class="d-flex flex-wrap gap-2 pt-1">
            <button
              v-for="swatch in presetColors"
              :key="swatch"
              type="button"
              class="swatch-btn rounded-circle border-0"
              :style="{ backgroundColor: swatch }"
              :class="{ 'active-swatch': form.color?.toLowerCase() === swatch.toLowerCase() }"
              @click="form.color = swatch"
              :title="swatch"
            ></button>
          </div>
        </div>

        <!-- Live Preview Box -->
        <div class="mb-4 p-3 rounded border preview-box">
          <label class="form-label fw-semibold fs-11 text-uppercase text-muted mb-2">
            Live Preview
          </label>
          <div class="d-flex align-items-center gap-2">
            <span
              class="badge px-3 py-2 fs-12 fw-medium d-inline-flex align-items-center gap-2"
              :style="{
                backgroundColor: form.color || '#405189',
                color: '#ffffff'
              }"
            >
              <i class="ri-price-tag-3-fill"></i>
              {{ form.issue_desc || 'Sample Issue Type' }}
            </span>

            <span
              class="badge px-2 py-1 fs-11"
              :style="{
                backgroundColor: (form.color || '#405189') + '22',
                color: form.color || '#405189',
                border: '1px solid ' + (form.color || '#405189') + '55'
              }"
            >
              Soft Style
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
              <span>{{ editingId ? 'Save Changes' : 'Create Issue Type' }}</span>
            </button>
          </div>
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
  name: "IssueTypesSettings",
  components: {
    Layout,
    PageHeader,
    CountTo,
  },
  data() {
    return {
      loading: false,
      submitting: false,
      issueTypes: [],
      boards: [],
      stats: {
        total_types: 0,
        active_types: 0,
        total_tickets: 0,
        most_common: "None",
      },
      searchQuery: "",
      modalShow: false,
      editingId: null,
      form: {
        issue_desc: "",
        color: "#405189",
        board_id: null,
      },
      formError: "",
      formErrors: {},
      presetColors: [
        "#f06548", // Coral Red (Bug / Defect)
        "#405189", // Slate Navy (Feature Request)
        "#299cdb", // Sky Blue (UI / UX)
        "#ffbe0c", // Amber Yellow (Performance)
        "#d03b3b", // Crimson (Security)
        "#0ab39c", // Emerald Teal (General Inquiry)
        "#6559cc", // Indigo Purple
        "#f17153", // Deep Orange
        "#f768b1", // Vibrant Pink
        "#3577f1", // Royal Blue
      ],
    };
  },
  computed: {
    apiBase() {
      return process.env.VUE_APP_AUTHDOMAIN || "http://localhost:8001/api";
    },

    filteredTypes() {
      if (!this.searchQuery) return this.issueTypes;
      const q = this.searchQuery.toLowerCase().trim();
      return this.issueTypes.filter((t) => {
        return (
          (t.issue_desc && t.issue_desc.toLowerCase().includes(q)) ||
          (t.color && t.color.toLowerCase().includes(q)) ||
          String(t.issue_id).includes(q)
        );
      });
    },
  },
  mounted() {
    this.fetchIssueTypes();
    this.fetchBoards();
  },
  methods: {
    getAuthHeaders() {
      const token = localStorage.getItem("jwt") || localStorage.getItem("token");
      return token ? { Authorization: `Bearer ${token}` } : {};
    },

    async fetchIssueTypes() {
      this.loading = true;
      try {
        const response = await axios.get(`${this.apiBase}/issue-types`, {
          headers: this.getAuthHeaders(),
        });
        this.issueTypes = response.data.data || [];
        if (response.data.stats) {
          this.stats = {
            total_types: response.data.stats.total_types || 0,
            active_types: response.data.stats.active_types || 0,
            total_tickets: response.data.stats.total_tickets || 0,
            most_common: response.data.stats.most_common || "None",
          };
        }
      } catch (err) {
        console.error("Failed to fetch issue types:", err);
        Swal.fire({
          icon: "error",
          title: "Network Error",
          text: err.response?.data?.message || "Failed to load issue types from server.",
          toast: true,
          position: "top-end",
          timer: 3500,
          showConfirmButton: false,
        });
      } finally {
        this.loading = false;
      }
    },

    async fetchBoards() {
      try {
        const response = await axios.get(`${this.apiBase}/boards`, {
          headers: this.getAuthHeaders(),
        });
        this.boards = response.data?.data || [];
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    },

    openCreateModal() {
      this.editingId = null;
      this.form = {
        issue_desc: "",
        color: "#405189",
        board_id: null,
      };
      this.formError = "";
      this.formErrors = {};
      this.modalShow = true;
    },

    openEditModal(type) {
      this.editingId = type.issue_id;
      this.form = {
        issue_desc: type.issue_desc,
        color: type.color || "#405189",
        board_id: type.board_id || null,
      };
      this.formError = "";
      this.formErrors = {};
      this.modalShow = true;
    },

    async submitForm() {
      this.formError = "";
      this.formErrors = {};

      if (!this.form.issue_desc || !this.form.issue_desc.trim()) {
        this.formErrors.issue_desc = "Issue description is required.";
        return;
      }

      this.submitting = true;
      try {
        if (this.editingId) {
          // Update
          await axios.put(
            `${this.apiBase}/issue-types/${this.editingId}`,
            {
              issue_desc: this.form.issue_desc.trim(),
              color: this.form.color || "#405189",
              board_id: this.form.board_id,
            },
            {
              headers: this.getAuthHeaders(),
            }
          );

          Swal.fire({
            icon: "success",
            title: "Updated",
            text: "Issue type updated successfully.",
            toast: true,
            position: "top-end",
            timer: 2500,
            showConfirmButton: false,
          });
        } else {
          // Create
          await axios.post(
            `${this.apiBase}/issue-types`,
            {
              issue_desc: this.form.issue_desc.trim(),
              color: this.form.color || "#405189",
              board_id: this.form.board_id,
            },
            {
              headers: this.getAuthHeaders(),
            }
          );

          Swal.fire({
            icon: "success",
            title: "Created",
            text: "Issue type created successfully.",
            toast: true,
            position: "top-end",
            timer: 2500,
            showConfirmButton: false,
          });
        }

        this.modalShow = false;
        await this.fetchIssueTypes();
      } catch (err) {
        if (err.response?.status === 422 && err.response?.data?.errors) {
          this.formErrors = err.response.data.errors;
          this.formError = Object.values(err.response.data.errors).flat().join(" ");
        } else {
          this.formError = err.response?.data?.message || "Failed to save issue type.";
        }
      } finally {
        this.submitting = false;
      }
    },

    async confirmDelete(type) {
      if (type.tickets_count > 0) {
        Swal.fire({
          icon: "warning",
          title: "Cannot Delete Issue Type",
          html: `The issue type <strong>"${type.issue_desc}"</strong> is currently assigned to <strong>${type.tickets_count} ticket(s)</strong>.<br><br>Please reassign those tickets before deleting this type.`,
          confirmButtonText: "Understood",
          confirmButtonClass: "btn btn-primary",
          buttonsStyling: false,
        });
        return;
      }

      const result = await Swal.fire({
        title: "Delete Issue Type?",
        html: `Are you sure you want to delete <strong>"${type.issue_desc}"</strong>?<br><small class="text-muted">This action cannot be undone.</small>`,
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
          await axios.delete(`${this.apiBase}/issue-types/${type.issue_id}`, {
            headers: this.getAuthHeaders(),
          });
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Issue type deleted successfully.",
            toast: true,
            position: "top-end",
            timer: 2500,
            showConfirmButton: false,
          });
          await this.fetchIssueTypes();
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Delete Failed",
            text: err.response?.data?.message || "Failed to delete issue type.",
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
.color-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  flex-shrink: 0;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.color-preview-chip {
  display: inline-block;
  width: 22px;
  height: 22px;
  border-radius: 4px;
  flex-shrink: 0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.color-code {
  color: var(--vz-body-color, #495057);
  background-color: var(--vz-light, #f3f6f9);
  padding: 2px 6px;
  border-radius: 4px;
}

.type-name {
  color: var(--vz-heading-color, var(--vz-body-color, #212529));
  font-weight: 600;
  letter-spacing: 0.15px;
}

.btn-action-edit {
  color: #405189;
  border-radius: 4px;
  background: transparent;
  border: 1px solid transparent;
  transition: all 0.15s ease;
}

.btn-action-edit:hover {
  background-color: rgba(64, 81, 137, 0.12);
  color: #3577f1;
}

.btn-action-delete {
  color: #f06548;
  border-radius: 4px;
  background: transparent;
  border: 1px solid transparent;
  transition: all 0.15s ease;
}

.btn-action-delete:hover {
  background-color: rgba(240, 101, 72, 0.12);
  color: #ea5436;
}

.swatch-btn {
  width: 26px;
  height: 26px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  outline: none;
}

.swatch-btn:hover {
  transform: scale(1.18);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
}

.swatch-btn.active-swatch {
  transform: scale(1.15);
  box-shadow: 0 0 0 2px #fff, 0 0 0 4px var(--vz-primary, #405189);
}

.preview-box {
  background: var(--vz-card-bg-custom, #f8f9fa);
  border-color: var(--vz-border-color, #e9ebec) !important;
}

.required::after {
  content: " *";
  color: var(--vz-danger, #f06548);
}

.issue-type-row {
  transition: background-color 0.15s ease;
}

.issue-type-row:hover {
  background-color: rgba(var(--vz-primary-rgb, 64, 81, 137), 0.03);
}

/* Dark mode adjustments (Scoped) */
[data-layout-mode="dark"] .type-name,
[data-bs-theme="dark"] .type-name {
  color: #f3f6f9 !important;
}

[data-layout-mode="dark"] .issue-type-row:hover .type-name,
[data-bs-theme="dark"] .issue-type-row:hover .type-name {
  color: #9ab0ff !important;
}

[data-layout-mode="dark"] .preview-box,
[data-bs-theme="dark"] .preview-box {
  background: #212529 !important;
  border-color: #32383e !important;
}

[data-layout-mode="dark"] .color-code,
[data-bs-theme="dark"] .color-code {
  color: #ced4da !important;
  background-color: rgba(255, 255, 255, 0.08) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

[data-layout-mode="dark"] .badge-tickets-active,
[data-bs-theme="dark"] .badge-tickets-active {
  background-color: rgba(41, 156, 219, 0.22) !important;
  color: #5ed0fa !important;
  border-color: rgba(41, 156, 219, 0.45) !important;
}

[data-layout-mode="dark"] .badge-tickets-zero,
[data-bs-theme="dark"] .badge-tickets-zero {
  background-color: rgba(255, 255, 255, 0.05) !important;
  color: #878a99 !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}

[data-layout-mode="dark"] .btn-action-edit,
[data-bs-theme="dark"] .btn-action-edit {
  color: #9ab0ff !important;
}

[data-layout-mode="dark"] .btn-action-edit:hover,
[data-bs-theme="dark"] .btn-action-edit:hover {
  background-color: rgba(154, 176, 255, 0.2) !important;
  color: #ffffff !important;
}

[data-layout-mode="dark"] .btn-action-delete,
[data-bs-theme="dark"] .btn-action-delete {
  color: #ff7b72 !important;
}

[data-layout-mode="dark"] .btn-action-delete:hover,
[data-bs-theme="dark"] .btn-action-delete:hover {
  background-color: rgba(255, 123, 114, 0.2) !important;
  color: #ffffff !important;
}

[data-layout-mode="dark"] .swatch-btn.active-swatch,
[data-bs-theme="dark"] .swatch-btn.active-swatch {
  box-shadow: 0 0 0 2px #212529, 0 0 0 4px #9ab0ff;
}
</style>

<!-- Unscoped global theme override ensuring dark mode selectors pierce through -->
<style>
[data-layout-mode="dark"] .type-name,
[data-bs-theme="dark"] .type-name,
html[data-layout-mode="dark"] .type-name {
  color: #f3f6f9 !important;
}

[data-layout-mode="dark"] .btn-action-edit,
[data-bs-theme="dark"] .btn-action-edit,
html[data-layout-mode="dark"] .btn-action-edit {
  color: #9ab0ff !important;
}

[data-layout-mode="dark"] .btn-action-delete,
[data-bs-theme="dark"] .btn-action-delete,
html[data-layout-mode="dark"] .btn-action-delete {
  color: #ff7b72 !important;
}

/* Modal dark mode styling */
[data-layout-mode="dark"] #issueTypeModal .modal-content,
[data-bs-theme="dark"] #issueTypeModal .modal-content,
html[data-layout-mode="dark"] #issueTypeModal .modal-content {
  background-color: #1a1d29 !important;
  border: 1px solid rgba(255, 255, 255, 0.18) !important;
  box-shadow: 0 15px 45px rgba(0, 0, 0, 0.75) !important;
  color: #f3f6f9 !important;
}

[data-layout-mode="dark"] #issueTypeModal .modal-header,
[data-bs-theme="dark"] #issueTypeModal .modal-header,
html[data-layout-mode="dark"] #issueTypeModal .modal-header {
  background-color: rgba(64, 81, 137, 0.25) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12) !important;
}

[data-layout-mode="dark"] #issueTypeModal .modal-title,
[data-bs-theme="dark"] #issueTypeModal .modal-title,
html[data-layout-mode="dark"] #issueTypeModal .modal-title {
  color: #ffffff !important;
}

[data-layout-mode="dark"] #issueTypeModal .form-label,
[data-bs-theme="dark"] #issueTypeModal .form-label,
html[data-layout-mode="dark"] #issueTypeModal .form-label {
  color: #e9ecef !important;
}

[data-layout-mode="dark"] #issueTypeModal .form-control,
[data-bs-theme="dark"] #issueTypeModal .form-control,
html[data-layout-mode="dark"] #issueTypeModal .form-control {
  background-color: #212538 !important;
  border: 1px solid rgba(255, 255, 255, 0.18) !important;
  color: #ffffff !important;
}

[data-layout-mode="dark"] #issueTypeModal .form-control:focus,
[data-bs-theme="dark"] #issueTypeModal .form-control:focus,
html[data-layout-mode="dark"] #issueTypeModal .form-control:focus {
  border-color: #9ab0ff !important;
  box-shadow: 0 0 0 0.2rem rgba(154, 176, 255, 0.25) !important;
  color: #ffffff !important;
}

[data-layout-mode="dark"] #issueTypeModal .preview-box,
[data-bs-theme="dark"] #issueTypeModal .preview-box,
html[data-layout-mode="dark"] #issueTypeModal .preview-box {
  background-color: #151824 !important;
  border: 1px solid rgba(255, 255, 255, 0.14) !important;
}

[data-layout-mode="dark"] #issueTypeModal .btn-ghost-secondary,
[data-bs-theme="dark"] #issueTypeModal .btn-ghost-secondary,
html[data-layout-mode="dark"] #issueTypeModal .btn-ghost-secondary {
  color: #ced4da !important;
  background-color: rgba(255, 255, 255, 0.08) !important;
}

[data-layout-mode="dark"] #issueTypeModal .btn-ghost-secondary:hover,
[data-bs-theme="dark"] #issueTypeModal .btn-ghost-secondary:hover,
html[data-layout-mode="dark"] #issueTypeModal .btn-ghost-secondary:hover {
  background-color: rgba(255, 255, 255, 0.15) !important;
  color: #ffffff !important;
}

[data-layout-mode="dark"] #issueTypeModal .btn-close,
[data-bs-theme="dark"] #issueTypeModal .btn-close,
html[data-layout-mode="dark"] #issueTypeModal .btn-close {
  filter: invert(1) grayscale(100%) brightness(200%) !important;
}
</style>
