<template>
  <Layout>
    <PageHeader title="Ticket Types" pageTitle="Settings" />

    <!-- Top KPI Metric Cards -->
    <BRow class="mb-4 g-3">
      <BCol xl="3" md="6">
        <BCard no-body class="card-animate shadow-sm border-0 h-100">
          <BCardBody class="d-flex align-items-center justify-content-between p-3">
            <div>
              <p class="text-uppercase fw-semibold text-muted fs-11 mb-1">Total Ticket Types</p>
              <h3 class="mb-0 fw-bold text-primary">
                <count-to :duration="800" :startVal="0" :endVal="stats.total_types"></count-to>
              </h3>
              <p class="mb-0 text-muted fs-12 mt-1">
                <span class="badge bg-primary-subtle text-primary me-1">
                  <i class="ri-price-tag-3-line align-middle"></i> All Boards
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
              <p class="text-uppercase fw-semibold text-muted fs-11 mb-1">Facilities Types</p>
              <h3 class="mb-0 fw-bold text-success">
                <count-to :duration="800" :startVal="0" :endVal="stats.facilities_types"></count-to>
              </h3>
              <p class="mb-0 text-muted fs-12 mt-1">
                <span class="badge bg-success-subtle text-success me-1">
                  <i class="ri-building-2-line align-middle"></i> Facilities
                </span>
              </p>
            </div>
            <div class="avatar-sm flex-shrink-0">
              <span class="avatar-title bg-success-subtle text-success rounded-circle fs-3">
                <i class="ri-building-2-line"></i>
              </span>
            </div>
          </BCardBody>
        </BCard>
      </BCol>

      <BCol xl="3" md="6">
        <BCard no-body class="card-animate shadow-sm border-0 h-100">
          <BCardBody class="d-flex align-items-center justify-content-between p-3">
            <div>
              <p class="text-uppercase fw-semibold text-muted fs-11 mb-1">Linked Tickets</p>
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
              <p class="text-uppercase fw-semibold text-muted fs-11 mb-1">Boards In System</p>
              <h3 class="mb-0 fw-bold text-warning">
                <count-to :duration="800" :startVal="0" :endVal="stats.boards_count"></count-to>
              </h3>
              <p class="mb-0 text-muted fs-12 mt-1">
                <span class="badge bg-warning-subtle text-warning me-1">
                  <i class="ri-dashboard-line align-middle"></i> Active Boards
                </span>
              </p>
            </div>
            <div class="avatar-sm flex-shrink-0">
              <span class="avatar-title bg-warning-subtle text-warning rounded-circle fs-3">
                <i class="ri-dashboard-line"></i>
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
            <h5 class="card-title mb-0 fw-bold">Ticket Types Management (tkt_type)</h5>
            <span class="badge bg-secondary-subtle text-secondary">
              {{ tktTypes.length }} Types Configured
            </span>
          </div>

          <div class="d-flex align-items-center gap-2">
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary"
              :disabled="loading"
              @click="fetchTypes"
              title="Reload ticket types from database"
            >
              <i class="ri-refresh-line" :class="{ 'ri-spin': loading }"></i>
            </button>

            <button
              type="button"
              class="btn btn-sm btn-soft-primary d-flex align-items-center gap-1 shadow-sm"
              @click="quickRegisterAllSystems"
              title="Register all active systems into tkt_type for System board"
            >
              <i class="ri-computer-line fs-14"></i>
              <span>Register All Systems</span>
            </button>

            <button
              type="button"
              class="btn btn-sm btn-primary d-flex align-items-center gap-1 shadow-sm"
              @click="openCreateModal"
            >
              <i class="ri-add-line fs-14"></i>
              <span>Create Ticket Type</span>
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
                placeholder="Search by code or type name..."
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
              <label class="form-label fs-12 fw-medium text-muted mb-0 flex-shrink-0">Board:</label>
              <select class="form-select form-select-sm" v-model="selectedBoardFilter">
                <option value="all">All Boards</option>
                <option v-for="b in boards" :key="b.id" :value="b.id">
                  {{ b.name }}
                </option>
              </select>
            </div>
          </BCol>

          <BCol xl="5" lg="3" sm="6" class="text-sm-end text-muted fs-12">
            Showing {{ filteredTypes.length }} of {{ tktTypes.length }} types
          </BCol>
        </BRow>
      </BCardBody>

      <!-- Table Content -->
      <BCardBody class="p-0">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading ticket types...</span>
          </div>
          <p class="text-muted mt-2 mb-0">Loading ticket types from database...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredTypes.length === 0" class="text-center py-5">
          <div class="avatar-lg mx-auto mb-3">
            <span class="avatar-title bg-light text-muted rounded-circle fs-1">
              <i class="ri-price-tag-3-line"></i>
            </span>
          </div>
          <h5 class="fw-semibold">No Ticket Types Found</h5>
          <p class="text-muted fs-13 mb-3">
            {{ searchQuery || selectedBoardFilter !== 'all' ? 'No records match your filters.' : 'No ticket types have been created yet.' }}
          </p>
          <button
            v-if="searchQuery || selectedBoardFilter !== 'all'"
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
            <i class="ri-add-line me-1"></i> Add Ticket Type
          </button>
        </div>

        <!-- Ticket Types Table -->
        <div v-else class="table-responsive">
          <table class="table align-middle table-nowrap table-hover mb-0">
            <thead class="table-light text-muted text-uppercase fs-11">
              <tr>
                <th scope="col" style="width: 80px;" class="ps-3">ID</th>
                <th scope="col" style="width: 160px;">Code</th>
                <th scope="col">Name</th>
                <th scope="col" style="width: 180px;">Assigned Board</th>
                <th scope="col" style="width: 140px;">Linked Tickets</th>
                <th scope="col" style="width: 160px;">Created Date</th>
                <th scope="col" style="width: 110px;" class="text-end pe-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="type in filteredTypes" :key="type.id" class="type-row">
                <td class="ps-3 fw-semibold text-muted fs-12">
                  #TYP-{{ String(type.id).padStart(2, '0') }}
                </td>

                <td>
                  <span class="badge bg-primary-subtle text-primary font-monospace fs-12 px-2 py-1">
                    {{ type.code }}
                  </span>
                </td>

                <td>
                  <div class="d-flex align-items-center gap-2">
                    <div class="avatar-xxs flex-shrink-0">
                      <span class="avatar-title bg-info-subtle text-info rounded-circle fs-12">
                        <i :class="getTypeIcon(type.code)"></i>
                      </span>
                    </div>
                    <span class="fs-13 fw-semibold text-dark type-name">
                      {{ type.name }}
                    </span>
                  </div>
                </td>

                <td>
                  <span
                    class="badge"
                    :class="getBoardBadgeClass(type.board?.name || type.board_id)"
                  >
                    <i class="ri-dashboard-line me-1"></i>
                    {{ type.board?.name || (type.board_id ? ('Board #' + type.board_id) : 'Global / None') }}
                  </span>
                </td>

                <td>
                  <span
                    class="badge"
                    :class="type.tickets_count > 0 ? 'bg-info-subtle text-info border border-info-subtle' : 'bg-light text-muted border border-light'"
                  >
                    <i class="ri-ticket-2-line me-1"></i>
                    {{ type.tickets_count || 0 }} {{ type.tickets_count === 1 ? 'Ticket' : 'Tickets' }}
                  </span>
                </td>

                <td class="text-muted fs-12">
                  {{ formatDate(type.created_at) }}
                </td>

                <td class="text-end pe-3">
                  <div class="d-flex align-items-center justify-end gap-1 justify-content-end">
                    <button
                      type="button"
                      class="btn btn-sm btn-soft-primary p-1"
                      @click="openEditModal(type)"
                      title="Edit Type"
                    >
                      <i class="ri-pencil-line fs-14"></i>
                    </button>
                    <button
                      type="button"
                      class="btn btn-sm btn-soft-danger p-1"
                      @click="confirmDelete(type)"
                      title="Delete Type"
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

    <!-- Modal: Create / Edit Ticket Type -->
    <BModal
      v-model="modalShow"
      id="tktTypeModal"
      modal-class="zoomIn"
      :title="editingId ? 'Edit Ticket Type' : 'Create Ticket Type'"
      title-class="exampleModalLabel fw-bold fs-15"
      hide-footer
      header-class="p-3 bg-primary-subtle"
      class="v-modal-custom"
      centered
      body-class="p-4"
      lazy
    >
      <form @submit.prevent="submitForm">
        <!-- Error alert -->
        <div v-if="formError" class="alert alert-danger py-2 px-3 fs-13 mb-3 d-flex align-items-center gap-2">
          <i class="ri-error-warning-line fs-16"></i>
          <span>{{ formError }}</span>
        </div>

        <!-- Code -->
        <div class="mb-3">
          <label class="form-label fw-semibold fs-13 required">
            Type Code <span class="text-danger">*</span>
          </label>
          <input
            type="text"
            class="form-control text-uppercase font-monospace"
            placeholder="e.g. PLUMBING, LIGHTING, HEAT_AC, PESTS"
            v-model="form.code"
            maxlength="50"
            required
            :class="{ 'is-invalid': formErrors.code }"
          />
          <div v-if="formErrors.code" class="invalid-feedback">
            {{ formErrors.code }}
          </div>
          <small class="text-muted fs-11">
            Unique identifier code (e.g. PLUMBING, SECURITY, OTHER).
          </small>
        </div>

        <!-- Name -->
        <div class="mb-3">
          <label class="form-label fw-semibold fs-13 required">
            Type Name <span class="text-danger">*</span>
          </label>
          <input
            type="text"
            class="form-control"
            placeholder="e.g. Plumbing, Lighting, Heat/AC, Pests"
            v-model="form.name"
            maxlength="100"
            required
            :class="{ 'is-invalid': formErrors.name }"
          />
          <div v-if="formErrors.name" class="invalid-feedback">
            {{ formErrors.name }}
          </div>
          <small class="text-muted fs-11">
            Friendly display name shown in forms and tickets.
          </small>
        </div>

        <!-- Board Selection -->
        <div class="mb-3">
          <label class="form-label fw-semibold fs-13">
            Assigned Board
          </label>
          <select class="form-select" v-model="form.board_id" @change="onModalBoardChange">
            <option :value="null">-- Global / No Board --</option>
            <option v-for="b in boards" :key="b.id" :value="b.id">
              {{ b.name }}
            </option>
          </select>
          <small class="text-muted fs-11">
            Select which board this type belongs to (e.g. System, Facilities, Support).
          </small>
        </div>

        <!-- If System Board: Allow selecting all systems and registering in tkt_type -->
        <div v-if="isModalSystemBoard && !editingId" class="mb-3 p-3 rounded bg-light-subtle border">
          <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
            <label class="form-label fw-semibold fs-13 mb-0 text-primary d-flex align-items-center gap-1">
              <i class="ri-computer-line"></i> Select from Systems
            </label>
            <div class="form-check form-check-inline mb-0">
              <input
                type="checkbox"
                class="form-check-input"
                id="modalSelectAllSystems"
                v-model="selectAllSystems"
                @change="onToggleSelectAllSystems"
              />
              <label class="form-check-label fs-12 fw-semibold text-primary" for="modalSelectAllSystems">
                Select All Systems
              </label>
            </div>
          </div>

          <p class="text-muted fs-12 mb-2">
            Select systems to automatically register them into <code>tkt_type</code> for the System board:
          </p>

          <div class="row g-2 mb-2">
            <div
              v-for="sys in availableSystems"
              :key="sys.id"
              class="col-md-6 col-12"
            >
              <div
                class="form-check p-2 rounded border"
                :class="{
                  'bg-primary-subtle border-primary': selectedSystemIds.includes(sys.id),
                  'bg-light': !selectedSystemIds.includes(sys.id)
                }"
                style="cursor: pointer;"
                @click="toggleSystemSelection(sys)"
              >
                <input
                  class="form-check-input ms-1 me-2"
                  type="checkbox"
                  :value="sys.id"
                  v-model="selectedSystemIds"
                  :id="'modal_sys_' + sys.id"
                  @click.stop="toggleSystemSelection(sys)"
                />
                <label class="form-check-label fs-12 fw-semibold mb-0" :for="'modal_sys_' + sys.id" style="cursor: pointer;">
                  <span class="badge bg-secondary-subtle text-secondary me-1 font-monospace">{{ sys.code }}</span>
                  <span>{{ sys.name }}</span>
                </label>
              </div>
            </div>
          </div>

          <div v-if="selectedSystemIds.length > 0" class="alert alert-info py-2 px-3 fs-12 mb-0 d-flex align-items-center gap-2">
            <i class="ri-information-line fs-14"></i>
            <span>
              <strong>{{ selectedSystemIds.length }}</strong> system(s) selected to be registered in <code>tkt_type</code>.
            </span>
          </div>
        </div>

        <!-- Live Preview Box -->
        <div class="mb-4 p-3 rounded border preview-box">
          <label class="form-label fw-semibold fs-11 text-uppercase text-muted mb-2">
            Live Preview
          </label>
          <div class="d-flex align-items-center gap-2">
            <span class="badge bg-primary-subtle text-primary font-monospace fs-12 px-2 py-1">
              {{ form.code || 'CODE' }}
            </span>
            <span class="fs-13 fw-semibold text-dark">
              {{ form.name || 'Sample Type Name' }}
            </span>
            <span
              v-if="form.board_id"
              class="badge bg-info-subtle text-info fs-11"
            >
              {{ getBoardName(form.board_id) }}
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
              <span>
                {{ editingId ? 'Save Changes' : (selectedSystemIds.length > 1 ? `Register ${selectedSystemIds.length} Systems` : (selectedSystemIds.length === 1 ? 'Register System Type' : 'Create Ticket Type')) }}
              </span>
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
  name: "TicketTypeSettings",
  components: {
    Layout,
    PageHeader,
    CountTo,
  },
  data() {
    return {
      tktTypes: [],
      boards: [],
      loading: false,
      searchQuery: "",
      selectedBoardFilter: "all",

      stats: {
        total_types: 0,
        total_tickets: 0,
        facilities_types: 0,
        boards_count: 0,
      },

      modalShow: false,
      editingId: null,
      submitting: false,
      formError: "",
      formErrors: {},

      form: {
        code: "",
        name: "",
        board_id: 3, // default to Facilities
      },

      availableSystems: [],
      selectedSystemIds: [],
      selectAllSystems: false,
    };
  },
  computed: {
    apiBase() {
      return process.env.VUE_APP_AUTHDOMAIN || "http://localhost:8001/api";
    },
    isModalSystemBoard() {
      const b = this.boards.find((x) => x.id === Number(this.form.board_id));
      return (b?.name?.toLowerCase() === "system") || Number(this.form.board_id) === 1;
    },
    filteredTypes() {
      let result = this.tktTypes;

      if (this.selectedBoardFilter !== "all") {
        result = result.filter(
          (t) => Number(t.board_id) === Number(this.selectedBoardFilter)
        );
      }

      if (this.searchQuery && this.searchQuery.trim()) {
        const q = this.searchQuery.trim().toLowerCase();
        result = result.filter(
          (t) =>
            t.name?.toLowerCase().includes(q) ||
            t.code?.toLowerCase().includes(q)
        );
      }

      return result;
    },
  },
  mounted() {
    this.fetchBoards();
    this.fetchTypes();
    this.fetchSystems();
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

    async fetchBoards() {
      try {
        const res = await axios.get(`${this.apiBase}/boards`, {
          headers: this.getAuthHeaders(),
        });
        if (res.data?.data) {
          this.boards = res.data.data;
        } else if (Array.isArray(res.data)) {
          this.boards = res.data;
        }
      } catch (err) {
        console.warn("Failed to load boards:", err);
        // Fallback boards
        this.boards = [
          { id: 1, name: "System" },
          { id: 2, name: "Support" },
          { id: 3, name: "Facilities" },
        ];
      }
    },

    async fetchTypes() {
      this.loading = true;
      try {
        const res = await axios.get(`${this.apiBase}/tkt-types`, {
          headers: this.getAuthHeaders(),
        });
        this.tktTypes = res.data.data || [];
        if (res.data.stats) {
          this.stats = {
            total_types: res.data.stats.total_types ?? this.tktTypes.length,
            total_tickets: res.data.stats.total_tickets ?? 0,
            facilities_types: res.data.stats.facilities_types ?? 0,
            boards_count: res.data.stats.boards_count ?? this.boards.length,
          };
        } else {
          this.stats = {
            total_types: this.tktTypes.length,
            total_tickets: 0,
            facilities_types: this.tktTypes.filter((t) => Number(t.board_id) === 3).length,
            boards_count: this.boards.length,
          };
        }
      } catch (err) {
        console.error("Failed to load ticket types:", err);
        Swal.fire({
          icon: "error",
          title: "Network Error",
          text: err.response?.data?.message || "Failed to load ticket types from server.",
          toast: true,
          position: "top-end",
          timer: 3500,
          showConfirmButton: false,
        });
      } finally {
        this.loading = false;
      }
    },

    async fetchSystems() {
      try {
        const res = await axios.get(`${this.apiBase}/systems`, {
          headers: this.getAuthHeaders(),
        });
        const list = res.data?.data || res.data || [];
        this.availableSystems = list.filter((s) => s.status === "active" || s.status === 1 || !s.status);
      } catch (err) {
        console.warn("Failed to load systems:", err);
      }
    },

    openCreateModal() {
      this.editingId = null;
      this.selectedSystemIds = [];
      this.selectAllSystems = false;
      const facilitiesBoard = this.boards.find((b) => b.name?.toLowerCase() === "facilities");
      this.form = {
        code: "",
        name: "",
        board_id: facilitiesBoard ? facilitiesBoard.id : 3,
      };
      this.formError = "";
      this.formErrors = {};
      this.modalShow = true;
    },

    openEditModal(type) {
      this.editingId = type.id;
      this.selectedSystemIds = [];
      this.selectAllSystems = false;
      this.form = {
        code: type.code,
        name: type.name,
        board_id: type.board_id,
      };
      this.formError = "";
      this.formErrors = {};
      this.modalShow = true;
    },

    onModalBoardChange() {
      this.selectedSystemIds = [];
      this.selectAllSystems = false;
      this.formError = "";
    },

    onToggleSelectAllSystems() {
      if (this.selectAllSystems) {
        this.selectedSystemIds = this.availableSystems.map((s) => s.id);
      } else {
        this.selectedSystemIds = [];
      }
      this.syncSystemFormValues();
    },

    toggleSystemSelection(sys) {
      const idx = this.selectedSystemIds.indexOf(sys.id);
      if (idx > -1) {
        this.selectedSystemIds.splice(idx, 1);
      } else {
        this.selectedSystemIds.push(sys.id);
      }
      this.selectAllSystems =
        this.selectedSystemIds.length > 0 &&
        this.selectedSystemIds.length === this.availableSystems.length;
      this.syncSystemFormValues();
    },

    syncSystemFormValues() {
      if (this.selectedSystemIds.length === 1) {
        const single = this.availableSystems.find((s) => s.id === this.selectedSystemIds[0]);
        if (single) {
          this.form.code = single.code;
          this.form.name = single.name;
        }
      } else if (this.selectedSystemIds.length > 1) {
        this.form.code = "ALL_SYSTEMS";
        this.form.name = `All Systems (${this.selectedSystemIds.length} Selected)`;
      }
    },

    async quickRegisterAllSystems() {
      const systemBoard = this.boards.find((b) => b.name?.toLowerCase() === "system");
      const boardId = systemBoard ? systemBoard.id : 1;

      const result = await Swal.fire({
        title: "Register All Systems?",
        html: `Register all active systems into <strong>tkt_type</strong> for the <strong>System</strong> board?<br><small class="text-muted">Existing entries will be updated without duplicates.</small>`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, Register All",
        cancelButtonText: "Cancel",
        confirmButtonClass: "btn btn-primary w-xs me-2",
        cancelButtonClass: "btn btn-ghost-secondary w-xs",
        buttonsStyling: false,
      });

      if (result.isConfirmed) {
        try {
          const res = await axios.post(
            `${this.apiBase}/tkt-types/register-systems`,
            { board_id: boardId },
            { headers: this.getAuthHeaders() }
          );
          Swal.fire({
            icon: "success",
            title: "Systems Registered!",
            text: res.data?.message || "All systems registered in ticket types successfully.",
            toast: true,
            position: "top-end",
            timer: 3000,
            showConfirmButton: false,
          });
          await this.fetchTypes();
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Registration Failed",
            text: err.response?.data?.message || "Failed to register systems.",
            confirmButtonClass: "btn btn-primary",
          });
        }
      }
    },

    async submitForm() {
      this.formError = "";
      this.formErrors = {};

      // If System board and multiple systems or all systems selected: bulk register
      if (this.isModalSystemBoard && this.selectedSystemIds.length > 0) {
        this.submitting = true;
        try {
          const res = await axios.post(
            `${this.apiBase}/tkt-types/register-systems`,
            {
              system_ids: this.selectedSystemIds,
              board_id: this.form.board_id || 1,
            },
            {
              headers: this.getAuthHeaders(),
            }
          );
          Swal.fire({
            icon: "success",
            title: "Systems Registered!",
            text: res.data?.message || `${this.selectedSystemIds.length} system(s) registered successfully.`,
            toast: true,
            position: "top-end",
            timer: 3000,
            showConfirmButton: false,
          });
          this.modalShow = false;
          await this.fetchTypes();
        } catch (err) {
          this.formError = err.response?.data?.message || "Failed to register systems.";
        } finally {
          this.submitting = false;
        }
        return;
      }

      if (!this.form.code || !this.form.code.trim()) {
        this.formErrors.code = "Type code is required.";
        return;
      }
      if (!this.form.name || !this.form.name.trim()) {
        this.formErrors.name = "Type name is required.";
        return;
      }

      this.submitting = true;
      try {
        const payload = {
          code: this.form.code.trim().toUpperCase(),
          name: this.form.name.trim(),
          board_id: this.form.board_id ? Number(this.form.board_id) : null,
        };

        if (this.editingId) {
          await axios.put(`${this.apiBase}/tkt-types/${this.editingId}`, payload, {
            headers: this.getAuthHeaders(),
          });
          Swal.fire({
            icon: "success",
            title: "Updated",
            text: "Ticket type updated successfully.",
            toast: true,
            position: "top-end",
            timer: 2500,
            showConfirmButton: false,
          });
        } else {
          await axios.post(`${this.apiBase}/tkt-types`, payload, {
            headers: this.getAuthHeaders(),
          });
          Swal.fire({
            icon: "success",
            title: "Created",
            text: "Ticket type created successfully.",
            toast: true,
            position: "top-end",
            timer: 2500,
            showConfirmButton: false,
          });
        }

        this.modalShow = false;
        await this.fetchTypes();
      } catch (err) {
        if (err.response?.status === 422 && err.response?.data?.errors) {
          this.formErrors = err.response.data.errors;
          this.formError = Object.values(err.response.data.errors).flat().join(" ");
        } else {
          this.formError = err.response?.data?.message || "Failed to save ticket type.";
        }
      } finally {
        this.submitting = false;
      }
    },

    async confirmDelete(type) {
      if (type.tickets_count > 0) {
        Swal.fire({
          icon: "warning",
          title: "Cannot Delete Ticket Type",
          html: `The ticket type <strong>"${type.name}"</strong> is currently assigned to <strong>${type.tickets_count} ticket(s)</strong>.<br><br>Please reassign those tickets before deleting this type.`,
          confirmButtonText: "Understood",
          confirmButtonClass: "btn btn-primary",
          buttonsStyling: false,
        });
        return;
      }

      const result = await Swal.fire({
        title: "Delete Ticket Type?",
        html: `Are you sure you want to delete <strong>"${type.name}" (${type.code})</strong>?<br><small class="text-muted">This action can be reversed by an administrator.</small>`,
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
          await axios.delete(`${this.apiBase}/tkt-types/${type.id}`, {
            headers: this.getAuthHeaders(),
          });
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Ticket type deleted successfully.",
            toast: true,
            position: "top-end",
            timer: 2500,
            showConfirmButton: false,
          });
          await this.fetchTypes();
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Delete Failed",
            text: err.response?.data?.message || "Failed to delete ticket type.",
            confirmButtonClass: "btn btn-primary",
          });
        }
      }
    },

    resetFilters() {
      this.searchQuery = "";
      this.selectedBoardFilter = "all";
    },

    getBoardName(boardId) {
      const b = this.boards.find((x) => x.id === Number(boardId));
      return b ? b.name : `Board #${boardId}`;
    },

    getBoardBadgeClass(boardName) {
      const name = String(boardName || "").toLowerCase();
      if (name.includes("facilities")) return "bg-success-subtle text-success";
      if (name.includes("system")) return "bg-primary-subtle text-primary";
      if (name.includes("support")) return "bg-info-subtle text-info";
      return "bg-secondary-subtle text-secondary";
    },

    getTypeIcon(code) {
      const c = String(code || "").toUpperCase();
      if (c.includes("PLUMB")) return "ri-drop-line";
      if (c.includes("LIGHT")) return "ri-lightbulb-line";
      if (c.includes("HEAT") || c.includes("AC")) return "ri-temp-hot-line";
      if (c.includes("PEST")) return "ri-bug-line";
      if (c.includes("SEC")) return "ri-shield-check-line";
      if (c.includes("CLEAN")) return "ri-brush-line";
      return "ri-price-tag-3-line";
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

.type-row:hover {
  background-color: rgba(var(--vz-primary-rgb, 64, 81, 137), 0.04);
}
</style>
