<template>
  <Layout>
    <PageHeader title="Station Management" pageTitle="Settings" />

    <!-- Top KPI Metric Cards -->
    <BRow class="mb-4 g-3">
      <BCol xl="3" md="6">
        <BCard no-body class="card-animate shadow-sm border-0 h-100 kpi-card">
          <BCardBody class="d-flex align-items-center justify-content-between p-3">
            <div>
              <p class="text-uppercase fw-semibold text-muted fs-11 mb-1">Total Stations</p>
              <h3 class="mb-0 fw-bold text-primary">
                <count-to :duration="800" :startVal="0" :endVal="stats.total"></count-to>
              </h3>
              <p class="mb-0 text-muted fs-12 mt-1">
                <span class="badge bg-primary-subtle text-primary me-1">
                  <i class="ri-map-pin-range-line align-middle"></i> Stations
                </span>
                Freight & cargo hubs
              </p>
            </div>
            <div class="avatar-sm flex-shrink-0">
              <span class="avatar-title bg-primary-subtle text-primary rounded-circle fs-3">
                <i class="ri-map-pin-range-line"></i>
              </span>
            </div>
          </BCardBody>
        </BCard>
      </BCol>

      <BCol xl="3" md="6">
        <BCard no-body class="card-animate shadow-sm border-0 h-100 kpi-card">
          <BCardBody class="d-flex align-items-center justify-content-between p-3">
            <div>
              <p class="text-uppercase fw-semibold text-muted fs-11 mb-1">Active Stations</p>
              <h3 class="mb-0 fw-bold text-success">
                <count-to :duration="800" :startVal="0" :endVal="stats.active"></count-to>
              </h3>
              <p class="mb-0 text-muted fs-12 mt-1">
                <span class="badge bg-success-subtle text-success me-1">
                  <i class="ri-checkbox-circle-line align-middle"></i> Operational
                </span>
                Handling shipments
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
              <p class="text-uppercase fw-semibold text-muted fs-11 mb-1">Inactive Stations</p>
              <h3 class="mb-0 fw-bold text-warning">
                <count-to :duration="800" :startVal="0" :endVal="stats.inactive"></count-to>
              </h3>
              <p class="mb-0 text-muted fs-12 mt-1">
                <span class="badge bg-warning-subtle text-warning me-1">
                  <i class="ri-pause-circle-line align-middle"></i> Inactive
                </span>
                Decommissioned hubs
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
                  <i class="ri-pie-chart-line align-middle"></i> Readiness
                </span>
                Logistics network score
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
                <i class="ri-map-pin-line"></i>
              </span>
            </div>
            <div>
              <h5 class="card-title mb-0 fw-bold">Station Directory</h5>
              <span class="text-muted fs-12">
                Manage logistics stations, gateway points, and regional freight branches
              </span>
            </div>
          </div>

          <div class="d-flex align-items-center gap-2">
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
              :disabled="loading"
              @click="fetchStations"
              title="Reload stations list"
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
              <span>Add Station</span>
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
                placeholder="Search by code, station name..."
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

          <!-- Status Filter Pills (with clean spacing) -->
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
            Showing {{ filteredStations.length }} of {{ stations.length }} records
          </BCol>
        </BRow>
      </BCardBody>

      <!-- Table Content -->
      <BCardBody class="p-0">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading stations...</span>
          </div>
          <p class="text-muted mt-2 mb-0">Loading station records from server...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredStations.length === 0" class="text-center py-5">
          <div class="avatar-lg mx-auto mb-3">
            <span class="avatar-title bg-light text-muted rounded-circle fs-1">
              <i class="ri-map-pin-range-line"></i>
            </span>
          </div>
          <h5 class="fw-semibold">No Stations Found</h5>
          <p class="text-muted fs-13 mb-3">
            {{ searchQuery || statusFilter !== 'all' ? 'No stations match the current filter or search criteria.' : 'No station records found in the database.' }}
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
              <i class="ri-add-line me-1"></i> Add Station
            </button>
          </div>
        </div>

        <!-- Stations Table -->
        <div v-else class="table-responsive">
          <table class="table align-middle table-nowrap table-hover mb-0 station-table">
            <thead class="table-light text-muted text-uppercase fs-11">
              <tr>
                <th scope="col" style="width: 80px;" class="ps-3">ID</th>
                <th scope="col" style="width: 160px;">Code</th>
                <th scope="col" style="min-width: 320px;">Station Name</th>
                <th scope="col" style="width: 140px;">Status</th>
                <th scope="col" style="width: 180px;">Created Date</th>
                <th scope="col" style="width: 120px;" class="text-end pe-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="station in filteredStations" :key="station.id" class="station-row">
                <td class="ps-3 fw-semibold text-muted fs-12">
                  #{{ String(station.id).padStart(3, '0') }}
                </td>

                <!-- Station Code -->
                <td>
                  <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 font-monospace fs-12 fw-bold">
                    {{ station.code }}
                  </span>
                </td>

                <!-- Station Name -->
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <div class="avatar-xxs flex-shrink-0">
                      <span class="avatar-title bg-light text-primary rounded-circle fs-12 border">
                        <i class="ri-building-line"></i>
                      </span>
                    </div>
                    <div>
                      <h6 class="fs-13 fw-semibold mb-0 station-title">
                        {{ station.name }}
                      </h6>
                      <small class="text-muted fs-11" v-if="station.code">
                        Code: {{ station.code }}
                      </small>
                    </div>
                  </div>
                </td>

                <!-- Status -->
                <td>
                  <span
                    class="badge d-inline-flex align-items-center gap-1 px-2 py-1 fs-11"
                    :class="station.status === 'active' ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-warning-subtle text-warning border border-warning-subtle'"
                  >
                    <i :class="station.status === 'active' ? 'ri-checkbox-circle-fill' : 'ri-close-circle-fill'"></i>
                    <span class="text-capitalize">{{ station.status }}</span>
                  </span>
                </td>

                <!-- Created Date -->
                <td class="text-muted fs-12">
                  {{ formatDate(station.created_at) }}
                </td>

                <!-- Actions -->
                <td class="text-end pe-3">
                  <div class="d-flex align-items-center justify-content-end gap-1">
                    <button
                      type="button"
                      class="btn btn-sm btn-action-edit p-1"
                      @click="openEditModal(station)"
                      title="Edit Station"
                    >
                      <i class="ri-pencil-line fs-14"></i>
                    </button>
                    <button
                      type="button"
                      class="btn btn-sm btn-action-delete p-1"
                      @click="confirmDelete(station)"
                      title="Delete Station"
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

    <!-- Modal: Create / Edit Station -->
    <BModal
      v-model="modalShow"
      id="stationModal"
      modal-class="zoomIn"
      :title="editingId ? 'Edit Station Details' : 'Register New Station'"
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
            Station Code
          </label>
          <div class="input-group">
            <span class="input-group-text bg-light text-muted">
              <i class="ri-hashtag"></i>
            </span>
            <input
              type="text"
              class="form-control text-uppercase font-monospace"
              placeholder="e.g. STN-MNL, STN-CEB, STN-CRK"
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
            Unique station/hub code. Automatically uppercase (e.g., STN-MNL).
          </small>
        </div>

        <!-- Name Field -->
        <div class="mb-3">
          <label class="form-label fw-semibold fs-13 required">
            Station Name
          </label>
          <div class="input-group">
            <span class="input-group-text bg-light text-muted">
              <i class="ri-map-pin-line"></i>
            </span>
            <input
              type="text"
              class="form-control"
              placeholder="e.g. Manila Central Logistics Station"
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
            Full display name of the logistics hub or freight station.
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
                name="stationStatus"
                id="stnStatusActive"
                value="active"
                v-model="form.status"
              />
              <label class="form-check-label fs-13 fw-medium text-success" for="stnStatusActive">
                <i class="ri-checkbox-circle-fill me-1"></i> Active
              </label>
            </div>
            <div class="form-check form-radio-warning">
              <input
                class="form-check-input"
                type="radio"
                name="stationStatus"
                id="stnStatusInactive"
                value="inactive"
                v-model="form.status"
              />
              <label class="form-check-label fs-13 fw-medium text-warning" for="stnStatusInactive">
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
                  <i class="ri-map-pin-range-line"></i>
                </span>
              </div>
              <div>
                <div class="fw-semibold fs-13 text-truncate preview-name" style="max-width: 250px;">
                  {{ form.name || 'Station Name Here' }}
                </div>
                <div class="d-flex align-items-center gap-2 mt-1">
                  <span class="badge bg-primary-subtle text-primary font-monospace fs-10 px-1 py-0">
                    {{ form.code || 'STN-CODE' }}
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
            <span>{{ editingId ? 'Save Changes' : 'Create Station' }}</span>
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
  name: "StationSettings",
  components: {
    Layout,
    PageHeader,
    CountTo,
  },
  data() {
    return {
      loading: false,
      submitting: false,
      stations: [],
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

    filteredStations() {
      let result = this.stations;

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
    this.fetchStations();
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

    async fetchStations() {
      this.loading = true;
      try {
        const response = await axios.get(`${this.apiBase}/stations`, {
          headers: this.getAuthHeaders(),
        });
        this.stations = response.data.data || [];
        if (response.data.stats) {
          this.stats = {
            total: response.data.stats.total || 0,
            active: response.data.stats.active || 0,
            inactive: response.data.stats.inactive || 0,
          };
        } else {
          this.stats = {
            total: this.stations.length,
            active: this.stations.filter((s) => s.status === "active").length,
            inactive: this.stations.filter((s) => s.status === "inactive").length,
          };
        }
      } catch (err) {
        console.error("Failed to fetch stations:", err);
        Swal.fire({
          icon: "error",
          title: "Network Error",
          text: err.response?.data?.message || "Failed to load stations from server.",
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

    openEditModal(station) {
      this.editingId = station.id;
      this.form = {
        code: station.code || "",
        name: station.name || "",
        status: station.status || "active",
      };
      this.formError = "";
      this.formErrors = {};
      this.modalShow = true;
    },

    async submitForm() {
      this.formError = "";
      this.formErrors = {};

      if (!this.form.code || !this.form.code.trim()) {
        this.formErrors.code = "Station code is required.";
      }
      if (!this.form.name || !this.form.name.trim()) {
        this.formErrors.name = "Station name is required.";
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
            `${this.apiBase}/stations/${this.editingId}`,
            payload,
            {
              headers: this.getAuthHeaders(),
            }
          );

          Swal.fire({
            icon: "success",
            title: "Updated",
            text: "Station details updated successfully.",
            toast: true,
            position: "top-end",
            timer: 2500,
            showConfirmButton: false,
          });
        } else {
          // Create
          await axios.post(
            `${this.apiBase}/stations`,
            payload,
            {
              headers: this.getAuthHeaders(),
            }
          );

          Swal.fire({
            icon: "success",
            title: "Created",
            text: "Station registered successfully.",
            toast: true,
            position: "top-end",
            timer: 2500,
            showConfirmButton: false,
          });
        }

        this.modalShow = false;
        await this.fetchStations();
      } catch (err) {
        if (err.response?.status === 422 && err.response?.data?.errors) {
          this.formErrors = err.response.data.errors;
          this.formError = Object.values(err.response.data.errors).flat().join(" ");
        } else {
          this.formError = err.response?.data?.message || "Failed to save station.";
        }
      } finally {
        this.submitting = false;
      }
    },

    async confirmDelete(station) {
      const result = await Swal.fire({
        title: "Delete Station?",
        html: `Are you sure you want to delete <strong>"${station.name}" (${station.code})</strong>?<br><small class="text-muted">This action will soft-delete the record.</small>`,
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
          await axios.delete(`${this.apiBase}/stations/${station.id}`, {
            headers: this.getAuthHeaders(),
          });
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Station deleted successfully.",
            toast: true,
            position: "top-end",
            timer: 2500,
            showConfirmButton: false,
          });
          await this.fetchStations();
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Delete Failed",
            text: err.response?.data?.message || "Failed to delete station.",
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

.station-table th {
  border-bottom-width: 1px;
  letter-spacing: 0.03em;
}

.station-row {
  transition: background-color 0.15s ease;
}

.station-row:hover {
  background-color: rgba(64, 81, 137, 0.03);
}

.station-title {
  color: #212529;
  transition: color 0.15s ease;
}

.station-row:hover .station-title {
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
[data-layout-mode="dark"] .station-row:hover,
html[data-layout-mode="dark"] .station-row:hover,
[data-bs-theme="dark"] .station-row:hover,
html[data-bs-theme="dark"] .station-row:hover {
  background-color: rgba(255, 255, 255, 0.03);
}

[data-layout-mode="dark"] .station-title,
html[data-layout-mode="dark"] .station-title,
[data-bs-theme="dark"] .station-title,
html[data-bs-theme="dark"] .station-title {
  color: #ced4da;
}

[data-layout-mode="dark"] .station-row:hover .station-title,
html[data-layout-mode="dark"] .station-row:hover .station-title,
[data-bs-theme="dark"] .station-row:hover .station-title,
html[data-bs-theme="dark"] .station-row:hover .station-title {
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
