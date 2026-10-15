<template>
  <Layout>
    <PageHeader title="General Report" pageTitle="Reports" />

    <BCard no-body class="shadow-sm border-0">
      <BCardHeader class="border-0 bg-transparent py-3">
        <div class="d-flex align-items-center justify-content-between gap-2 flex-wrap">
          <div>
            <h5 class="card-title mb-1 fw-bold">General Ticket Report</h5>
            <p class="text-muted mb-0 fs-13">Review ticket activity, ownership, priority, and completion details.</p>
          </div>
          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-sm btn-outline-success btn-icon" type="button" :disabled="loading || !filteredTickets.length" title="Download XLSX" @click="exportExcel">
              <i class="ri-file-excel-2-line"></i>
            </button>
            <button class="btn btn-sm btn-outline-secondary btn-icon" type="button" :disabled="loading" title="Refresh report" @click="loadReport">
              <i class="ri-refresh-line" :class="{ 'ri-spin': loading }"></i>
            </button>
          </div>
        </div>
      </BCardHeader>

      <BCardBody class="py-3 report-filters">
        <BRow class="g-2 align-items-end">
          <BCol lg="3" md="6">
            <label class="form-label fs-12 mb-1">Search</label>
            <input v-model="filters.search" class="form-control form-control-sm" placeholder="Name, email, summary..." />
          </BCol>
          <BCol lg="2" md="6">
            <label class="form-label fs-12 mb-1">Category</label>
            <select v-model="filters.board_id" class="form-select form-select-sm">
              <option value="All">All Categories</option>
              <option v-for="board in lookups.boards" :key="board.id" :value="String(board.id)">{{ board.name }}</option>
            </select>
          </BCol>
          <BCol lg="2" md="6">
            <label class="form-label fs-12 mb-1">Department</label>
            <select v-model="filters.department_id" class="form-select form-select-sm">
              <option value="All">All Departments</option>
              <option v-for="department in lookups.departments" :key="department.id" :value="String(department.id)">{{ department.name }}</option>
            </select>
          </BCol>
          <BCol lg="2" md="6">
            <label class="form-label fs-12 mb-1">Priority</label>
            <select v-model="filters.severity" class="form-select form-select-sm">
              <option value="All">All Priorities</option>
              <option v-for="severity in lookups.severities" :key="severity.id" :value="String(severity.id)">{{ severity.name }}</option>
            </select>
          </BCol>
          <BCol lg="3" md="6">
            <label class="form-label fs-12 mb-1">Date Encountered</label>
            <div class="d-flex gap-1">
              <input v-model="filters.date_from" type="date" class="form-control form-control-sm" />
              <input v-model="filters.date_to" type="date" class="form-control form-control-sm" />
            </div>
          </BCol>
          <BCol lg="2" md="6">
            <label class="form-label fs-12 mb-1">Type</label>
            <select v-model="filters.type" class="form-select form-select-sm">
              <option value="All">All Types</option>
              <option v-for="type in lookups.tkt_types" :key="type.id" :value="String(type.id)">{{ type.name || type.code }}</option>
            </select>
          </BCol>
          <BCol lg="2" md="6">
            <label class="form-label fs-12 mb-1">Status</label>
            <select v-model="filters.status" class="form-select form-select-sm">
              <option value="All">All Statuses</option>
              <option v-for="status in lookups.statuses" :key="status.id" :value="String(status.id)">{{ status.name }}</option>
            </select>
          </BCol>
          <BCol lg="2" md="6">
            <label class="form-label fs-12 mb-1">Accepted / Rejected</label>
            <select v-model="filters.acceptance" class="form-select form-select-sm">
              <option value="All">All</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="pending">Pending</option>
            </select>
          </BCol>
          <BCol lg="2" md="6">
            <button type="button" class="btn btn-sm btn-outline-secondary w-100" @click="resetFilters">
              <i class="ri-filter-off-line me-1"></i> Clear Filters
            </button>
          </BCol>
        </BRow>
      </BCardBody>

      <BCardBody class="p-0">
        <div class="report-grid-wrap">
          <BaseAgGridVue
            class="report-grid"
            style="width: 100%; height: 100%;"
            :column-defs="columnDefs"
            :row-data="filteredTickets"
            :default-col-def="defaultColDef"
            :loading="loading || loadingMore"
            :pagination="false"
            :suppress-pagination-panel="true"
            :suppress-column-virtualisation="true"
            :suppress-drag-leave-hides-columns="true"
            :ensure-dom-order="true"
            :suppress-column-move-animation="true"
            :animate-rows="false"
            :header-height="48"
            domLayout="normal"
            :theme="reportGridTheme"
            @grid-ready="onGridReady"
            @body-scroll="onGridScroll"
          />
          <div v-if="loadingMore" class="report-load-more">
            <span class="spinner-border spinner-border-sm text-primary me-2"></span>Loading more records...
          </div>
        </div>
      </BCardBody>
    </BCard>
  </Layout>
</template>

<script>
import axios from "axios";
import Layout from "@/layouts/main.vue";
import PageHeader from "@/components/page-header";
import { appGridTheme } from "@/helpers/agGrid";
import { AgGridVue as BaseAgGridVue } from "ag-grid-vue3";

export default {
  name: "GeneralReport",
  components: { Layout, PageHeader, BaseAgGridVue },
  data() {
    return {
      loading: false,
      loadingMore: false,
      currentPage: 1,
      batchSize: 50,
      hasMore: true,
      gridApi: null,
      filterReloadTimer: null,
      autoSizeTimer: null,
      reportGridTheme: appGridTheme,
      tickets: [],
      lookups: { boards: [], departments: [], stations: [], severities: [], types: [], tkt_types: [], statuses: [] },
      filters: { search: "", board_id: "All", department_id: "All", severity: "All", type: "All", status: "All", acceptance: "All", date_from: "", date_to: "" },
    };
  },
  computed: {
    apiBase() { return process.env.VUE_APP_AUTHDOMAIN || "http://localhost:8001/api"; },
    defaultColDef() {
      return {
        sortable: true,
        resizable: true,
        filter: true,
        wrapHeaderText: false,
        autoHeaderHeight: false,
        minWidth: 130,
      };
    },
    columnDefs() {
      return [
        { headerName: "Timestamp", field: "created_at", valueFormatter: (p) => this.formatDateTime(p.value), width: 175, minWidth: 175 },
        { headerName: "Name", valueGetter: (p) => p.data?.creator?.fullname || p.data?.creator?.name || "-", width: 170, minWidth: 170 },
        { headerName: "Email address / Contact", valueGetter: (p) => p.data?.creator?.email || "-", width: 210, minWidth: 210 },
        { headerName: "Summary", valueGetter: (p) => p.data?.subject || "-", width: 280, minWidth: 240 },
        { headerName: "Location of problem", valueGetter: (p) => this.locationOfProblem(p.data), width: 180, minWidth: 180 },
        { headerName: "Ticket Type", valueGetter: (p) => p.data?.tkt_type?.name || p.data?.tkt_type?.code || "-", width: 150, minWidth: 150 },
        { headerName: "Issue Type", valueGetter: (p) => p.data?.issue_type?.issue_desc || p.data?.type_name || "-", width: 160, minWidth: 160 },
        { headerName: "Priority", valueGetter: (p) => p.data?.issueSeverity?.name || p.data?.severity_name || "-", width: 120, minWidth: 120 },
        { headerName: "Date Needed", valueGetter: (p) => this.formatDate(p.data?.date_needed || p.data?.duration_to), width: 140, minWidth: 140 },
        { headerName: "More details", valueGetter: (p) => p.data?.summary || "-", width: 360, minWidth: 300, maxWidth: 460, wrapText: true, autoHeight: true },
        { headerName: "Department", valueGetter: (p) => this.assignedDepartmentName(p.data), width: 190, minWidth: 190 },
        { headerName: "Actual Date of Completion", valueGetter: (p) => this.formatDateTime(p.data?.closed_at), width: 210, minWidth: 210 },
        { headerName: "Completion Turn Around", valueGetter: (p) => this.turnaround(p.data), width: 180, minWidth: 180 },
        { headerName: "Accepted or Rejected", valueGetter: (p) => this.acceptanceLabel(p.data), width: 170, minWidth: 170 },
      ];
    },
    filteredTickets() {
      const f = this.filters;
      return this.tickets.filter((ticket) => {
        const q = f.search.trim().toLowerCase();
        const text = [ticket.subject, ticket.summary, ticket.creator?.name, ticket.creator?.fullname, ticket.creator?.email, ticket.system].join(" ").toLowerCase();
        const date = ticket.date_encountered || "";
        const acceptance = this.acceptanceValue(ticket);
        return (!q || text.includes(q)) &&
          (f.board_id === "All" || String(ticket.board_id || ticket.board_status?.board_id) === f.board_id) &&
          (f.department_id === "All" || String(ticket.department_id) === f.department_id) &&
          (f.severity === "All" || String(ticket.issue_severity_id) === f.severity) &&
          (f.type === "All" || String(ticket.tkt_type_id) === f.type) &&
          (f.status === "All" || String(ticket.board_status_id) === f.status) &&
          (f.acceptance === "All" || acceptance === f.acceptance) &&
          (!f.date_from || date >= f.date_from) && (!f.date_to || date <= f.date_to);
      });
    },
  },
  watch: {
    filteredTickets() {
      this.scheduleAutoSize();
    },
    filters: {
      deep: true,
      handler() {
        clearTimeout(this.filterReloadTimer);
        this.filterReloadTimer = setTimeout(() => this.loadReport(), 250);
      },
    },
  },
  mounted() { this.loadReport(); },
  methods: {
    headers() { const token = localStorage.getItem("jwt") || localStorage.getItem("token"); return token ? { Authorization: `Bearer ${token}` } : {}; },
    onGridReady(params) {
      this.gridApi = params.api;
      params.api.addEventListener("firstDataRendered", () => this.scheduleAutoSize());
      params.api.addEventListener("gridSizeChanged", () => this.scheduleAutoSize());
      this.scheduleAutoSize();
    },
    scheduleAutoSize() {
      clearTimeout(this.autoSizeTimer);
      this.autoSizeTimer = setTimeout(() => {
        if (!this.gridApi || this.gridApi.isDestroyed?.()) return;
        this.gridApi.refreshHeader?.();
      }, 80);
    },
    exportExcel() {
      if (!this.gridApi || !this.filteredTickets.length) return;
      const stamp = new Date().toISOString().slice(0, 10);
      this.gridApi.exportDataAsExcel({
        fileName: `general-report-${stamp}.xlsx`,
        sheetName: "General Report",
      });
    },
    onGridScroll(event) {
      const range = event?.api?.getVerticalPixelRange?.();
      if (range && range.bottom >= range.top + (event.api.getDisplayedRowCount() * 46) - 600) this.loadNextPage();
    },
    reportParams() {
      const f = this.filters;
      return {
        page: this.currentPage,
        per_page: this.batchSize,
        search: f.search || undefined,
        board_id: f.board_id !== "All" ? f.board_id : undefined,
        status: f.status !== "All" ? f.status : undefined,
        severity: f.severity !== "All" ? f.severity : undefined,
        date: f.date_from && f.date_to ? `${f.date_from} to ${f.date_to}` : (f.date_from || undefined),
      };
    },
    async loadReport() {
      if (this.loading) return;
      this.loading = true;
      this.loadingMore = false;
      this.currentPage = 1;
      this.hasMore = true;
      this.tickets = [];
      try {
        const [tickets, lookups] = await Promise.all([
          axios.get(`${this.apiBase}/tickets`, { params: this.reportParams(), headers: this.headers() }),
          axios.get(`${this.apiBase}/tickets/lookups`, { headers: this.headers() }),
        ]);
        this.tickets = tickets.data?.data || [];
        const meta = tickets.data?.meta || {};
        this.hasMore = Number(meta.current_page || 1) < Number(meta.last_page || 1);
        this.currentPage = this.hasMore ? 2 : 1;
        this.lookups = { ...this.lookups, ...(lookups.data || {}) };
      } catch (error) {
        console.error("Failed to load report:", error);
      } finally { this.loading = false; }
    },
    async loadNextPage() {
      if (this.loading || this.loadingMore || !this.hasMore) return;
      this.loadingMore = true;
      try {
        const response = await axios.get(`${this.apiBase}/tickets`, { params: this.reportParams(), headers: this.headers() });
        this.tickets = [...this.tickets, ...(response.data?.data || [])];
        const meta = response.data?.meta || {};
        this.hasMore = Number(meta.current_page || this.currentPage) < Number(meta.last_page || this.currentPage);
        this.currentPage += 1;
      } catch (error) {
        console.error("Failed to load more report records:", error);
      } finally {
        this.loadingMore = false;
      }
    },
    resetFilters() { this.filters = { search: "", board_id: "All", department_id: "All", severity: "All", type: "All", status: "All", acceptance: "All", date_from: "", date_to: "" }; },
    formatDate(value) { if (!value) return "-"; const date = new Date(value); return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); },
    formatDateTime(value) { if (!value) return "-"; const date = new Date(value); return Number.isNaN(date.getTime()) ? value : date.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }); },
    departmentName(id) { return this.lookups.departments.find((department) => Number(department.id) === Number(id))?.name || "-"; },
    assignedDepartmentName(ticket) {
      if (ticket.department_id) return this.departmentName(ticket.department_id);
      const assignments = ticket.creator?.assigned_departments || ticket.creator?.assignedDepartments || [];
      const assignment = assignments.find((item) => Boolean(item.default)) || assignments[0];
      return this.lookups.departments.find(
        (department) => String(department.code) === String(assignment?.reference_code)
      )?.name || assignment?.reference_code || "-";
    },
    locationOfProblem(ticket) {
      const stations = ticket.creator?.assigned_stations || ticket.creator?.assignedStations || [];
      const station = stations.find((item) => Boolean(item.default)) || stations[0];
      const stationName = this.lookups.stations.find(
        (item) => String(item.code) === String(station?.reference_code)
      )?.name;
      return stationName || station?.reference_code || ticket.system || ticket.url || "-";
    },
    acceptanceValue(ticket) {
      const status = String(ticket.board_status?.name || ticket.status_name || ticket.status || "").toLowerCase();
      if (status === "new") return "pending";
      if (status.includes("cancel") || status.includes("reject")) return "rejected";
      return "accepted";
    },
    acceptanceLabel(ticket) {
      const value = this.acceptanceValue(ticket);
      return value === "pending" ? "" : value.replace(/^./, (char) => char.toUpperCase());
    },
    acceptanceClass(ticket) { const value = this.acceptanceValue(ticket); return value === "accepted" ? "bg-success-subtle text-success" : value === "rejected" ? "bg-danger-subtle text-danger" : "bg-warning-subtle text-warning"; },
    severityClass(value) { const name = String(value || "").toLowerCase(); return name.includes("high") || name.includes("critical") ? "bg-danger-subtle text-danger" : name.includes("medium") ? "bg-warning-subtle text-warning" : "bg-success-subtle text-success"; },
    turnaround(ticket) { if (!ticket.created_at || !ticket.closed_at) return "-"; const days = Math.max(0, Math.round((new Date(ticket.closed_at) - new Date(ticket.created_at)) / 86400000)); return `${days} day${days === 1 ? "" : "s"}`; },
  },
};
</script>

<style scoped>
.report-filters { background: var(--vz-light, #f8f9fa); }
.report-grid-wrap { height: calc(100vh - 330px); min-height: 420px; position: relative; }
.report-grid {
  width: 100%;
  height: 100%;
}
.report-load-more { min-height: 34px; padding: 8px; text-align: center; font-size: 12px; }
:deep(.report-grid-wrap .app-grid) { height: 100%; }
:deep(.report-grid-wrap .app-grid__grid) { height: 100%; }
:deep(.report-grid .ag-root-wrapper) {
  border-color: var(--vz-border-color, #e9ebf0);
  border-radius: 0;
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
  overflow: hidden;
}
:deep(.report-grid .ag-header-cell-text) {
  color: var(--vz-secondary-color, #9aa1af);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
:deep(.report-grid .ag-header-cell-label) {
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  line-height: 1.2;
}
:deep(.report-grid .ag-header-cell-text) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
:deep(.report-grid .ag-cell) { white-space: normal; line-height: 1.35; }
:deep(.report-grid .ag-row) { min-height: 42px; }
:deep(.report-grid .ag-row-hover) { background-color: var(--vz-light, #f8f9fa); }
[data-bs-theme="dark"] :deep(.report-grid .ag-header-cell-text) { color: #8b93a5; }
[data-bs-theme="dark"] :deep(.report-grid .ag-row-hover) { background-color: rgba(255, 255, 255, 0.04); }
</style>
