<script>
import axios from "axios";
import Layout from "@/layouts/main.vue";
import PageHeader from "@/components/page-header";

export default {
  components: { Layout, PageHeader },
  data() {
    return {
      loading: true,
      error: "",
      dashboard: {
        role: "",
        scope: "",
        summary: { total: 0, new: 0, active: 0, closed: 0, overdue: 0 },
        by_status: [],
        by_category: [],
        by_issue_type: [],
        by_ticket_issue_type: [],
        recent: [],
      },
    };
  },
  computed: {
    apiBase() {
      return process.env.VUE_APP_AUTHDOMAIN || "http://localhost:8001/api";
    },
    isAdmin() {
      return this.dashboard.role === "admin";
    },
    statusMaximum() {
      return Math.max(...this.dashboard.by_status.map((item) => item.count), 1);
    },
    categoryMaximum() {
      return Math.max(...this.dashboard.by_category.map((item) => item.count), 1);
    },
    issueTypeMaximum() {
      return Math.max(...this.dashboard.by_issue_type.map((item) => item.count), 1);
    },
    ticketIssueTypeMaximum() {
      return Math.max(...this.dashboard.by_ticket_issue_type.map((item) => item.count), 1);
    },
  },
  mounted() {
    this.loadAnalytics();
  },
  methods: {
    getAuthHeaders() {
      const token = localStorage.getItem("jwt") || localStorage.getItem("token");
      return token ? { Authorization: `Bearer ${token}` } : {};
    },
    async loadAnalytics() {
      this.loading = true;
      this.error = "";
      try {
        const { data } = await axios.get(`${this.apiBase}/tickets/analytics`, {
          headers: this.getAuthHeaders(),
        });
        this.dashboard = {
          ...this.dashboard,
          ...data,
          summary: { ...this.dashboard.summary, ...(data.summary || {}) },
        };
      } catch (error) {
        this.error = error.response?.data?.message || "Unable to load ticket analytics.";
      } finally {
        this.loading = false;
      }
    },
    formatDate(value) {
      if (!value) return "-";
      return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
    },
    progressWidth(value, maximum) {
      return `${Math.max(8, Math.round((value / maximum) * 100))}%`;
    },
    statusClass(status) {
      const value = String(status || "").toLowerCase();
      if (value.includes("cancel")) return "secondary";
      if (value.includes("closed") || value.includes("resolved") || value.includes("done")) return "success";
      if (value.includes("progress") || value.includes("testing")) return "warning";
      if (value.includes("new")) return "info";
      return "primary";
    },
  },
};
</script>

<template>
  <Layout>
    <PageHeader title="Ticket Analytics" pageTitle="Dashboards" />

    <div v-if="loading" class="analytics-loading" role="status" aria-label="Loading ticket analytics">
      <span></span>
    </div>

    <BAlert v-if="error" show variant="danger" class="d-flex justify-content-between align-items-center">
      <span>{{ error }}</span>
      <BButton variant="soft-danger" size="sm" @click="loadAnalytics">Retry</BButton>
    </BAlert>

    <BCard no-body class="mb-4 analytics-intro">
      <BCardBody class="d-flex flex-wrap align-items-center gap-3">
        <div class="flex-grow-1">
          <div class="d-flex align-items-center gap-2">
            <h5 class="mb-1">Support ticket overview</h5>
            <BSpinner v-if="loading" small variant="primary" label="Loading"></BSpinner>
          </div>
          <p class="text-muted mb-0">{{ dashboard.scope || "Loading the ticket scope for your role…" }}</p>
        </div>
        <BButton variant="primary" to="/tickets/list"><i class="ri-ticket-2-line me-1"></i> View Tickets</BButton>
      </BCardBody>
    </BCard>

    <BRow class="g-3 mb-4">
      <BCol md="6" xl="3" v-for="card in [
        { label: 'Visible Tickets', value: dashboard.summary.total, icon: 'ri-ticket-2-line', tone: 'primary' },
        { label: 'New Tickets', value: dashboard.summary.new, icon: 'ri-add-circle-line', tone: 'info' },
        { label: 'Active Work', value: dashboard.summary.active, icon: 'ri-time-line', tone: 'warning' },
        { label: 'Closed / Resolved', value: dashboard.summary.closed, icon: 'ri-checkbox-circle-line', tone: 'success' },
      ]" :key="card.label">
        <BCard no-body class="h-100 analytics-stat">
          <BCardBody class="d-flex align-items-center">
            <div class="avatar-sm flex-shrink-0">
              <span :class="`avatar-title rounded-circle bg-${card.tone}-subtle text-${card.tone} fs-3`"><i :class="card.icon"></i></span>
            </div>
            <div class="ms-3">
              <p class="text-muted mb-1">{{ card.label }}</p>
              <h3 class="mb-0">{{ loading ? '–' : card.value }}</h3>
            </div>
          </BCardBody>
        </BCard>
      </BCol>
    </BRow>

    <BRow class="g-4">
      <BCol xl="4">
        <BCard no-body class="mb-4">
          <BCardHeader class="d-flex justify-content-between align-items-center"><h5 class="card-title mb-0">Ticket Status</h5><BBadge variant="soft-danger">{{ dashboard.summary.overdue }} overdue</BBadge></BCardHeader>
          <BCardBody v-if="loading" class="text-muted">Loading status breakdown…</BCardBody>
          <BCardBody v-else-if="!dashboard.by_status.length" class="text-muted text-center py-5">No visible tickets.</BCardBody>
          <BCardBody v-else class="pt-3">
            <div v-for="item in dashboard.by_status" :key="item.name" class="mb-3">
              <div class="d-flex justify-content-between mb-1"><span>{{ item.name }}</span><strong>{{ item.count }}</strong></div>
              <div class="progress" style="height: 7px"><div :class="`progress-bar bg-${statusClass(item.name)}`" :style="{ width: progressWidth(item.count, statusMaximum) }"></div></div>
            </div>
          </BCardBody>
        </BCard>
        <BCard no-body>
          <BCardHeader><h5 class="card-title mb-0">Tickets by Issue Type</h5></BCardHeader>
          <BCardBody v-if="loading" class="text-muted">Loading issue-type breakdown…</BCardBody>
          <BCardBody v-else-if="!dashboard.by_ticket_issue_type.length" class="text-muted text-center py-4">No issue-type data available.</BCardBody>
          <BCardBody v-else class="pt-3">
            <div v-for="item in dashboard.by_ticket_issue_type" :key="item.name" class="mb-3">
              <div class="d-flex justify-content-between gap-3 mb-1"><span class="text-truncate" :title="item.name">{{ item.name }}</span><strong>{{ item.count }}</strong></div>
              <div class="progress" style="height: 7px"><div class="progress-bar bg-secondary" :style="{ width: progressWidth(item.count, ticketIssueTypeMaximum) }"></div></div>
            </div>
          </BCardBody>
        </BCard>
      </BCol>

      <BCol xl="4">
        <BCard no-body class="mb-4">
          <BCardHeader><h5 class="card-title mb-0">Tickets by Category</h5></BCardHeader>
          <BCardBody v-if="loading" class="text-muted">Loading category breakdown…</BCardBody>
          <BCardBody v-else-if="!dashboard.by_category.length" class="text-muted text-center py-5">No category data available.</BCardBody>
          <BCardBody v-else class="pt-3">
            <div v-for="item in dashboard.by_category" :key="item.name" class="mb-3">
              <div class="d-flex justify-content-between gap-3 mb-1"><span class="text-truncate" :title="item.name">{{ item.name }}</span><strong>{{ item.count }}</strong></div>
              <div class="progress" style="height: 7px"><div class="progress-bar bg-primary" :style="{ width: progressWidth(item.count, categoryMaximum) }"></div></div>
            </div>
          </BCardBody>
        </BCard>
        <BCard no-body>
          <BCardHeader><h5 class="card-title mb-0">Tickets by Type</h5></BCardHeader>
          <BCardBody v-if="loading" class="text-muted">Loading issue-type breakdown…</BCardBody>
          <BCardBody v-else-if="!dashboard.by_issue_type.length" class="text-muted text-center py-4">No issue-type data available.</BCardBody>
          <BCardBody v-else class="pt-3">
            <div v-for="item in dashboard.by_issue_type" :key="item.name" class="mb-3">
              <div class="d-flex justify-content-between gap-3 mb-1"><span class="text-truncate" :title="item.name">{{ item.name }}</span><strong>{{ item.count }}</strong></div>
              <div class="progress" style="height: 7px"><div class="progress-bar bg-info" :style="{ width: progressWidth(item.count, issueTypeMaximum) }"></div></div>
            </div>
          </BCardBody>
        </BCard>
      </BCol>

      <BCol xl="4">
        <BCard no-body class="h-100">
          <BCardHeader class="d-flex align-items-center justify-content-between">
            <h5 class="card-title mb-0">Recent Tickets</h5>
            <BButton variant="soft-primary" size="sm" to="/tickets/list">View More <i class="ri-arrow-right-line ms-1"></i></BButton>
          </BCardHeader>
          <BCardBody class="p-0">
            <div v-if="loading" class="text-muted p-4">Loading recent tickets…</div>
            <div v-else-if="!dashboard.recent.length" class="text-muted text-center py-5">No visible tickets.</div>
            <router-link v-else v-for="ticket in dashboard.recent" :key="ticket.id" :to="`/tickets/details?id=${ticket.id}`" class="analytics-ticket d-flex align-items-center gap-2 text-reset text-decoration-none">
              <div class="flex-grow-1 overflow-hidden"><small class="text-primary fw-medium">{{ ticket.ref_no }}</small><div class="text-truncate fw-medium" :title="ticket.subject">{{ ticket.subject }}</div><small class="text-muted">{{ formatDate(ticket.date_encountered || ticket.created_at) }}</small></div>
              <BBadge :variant="statusClass(ticket.status)" class="flex-shrink-0">{{ ticket.status }}</BBadge>
            </router-link>
          </BCardBody>
        </BCard>
      </BCol>
    </BRow>
  </Layout>
</template>

<style scoped>
.analytics-intro { border-left: 4px solid var(--vz-primary); }
.analytics-loading { height: 3px; overflow: hidden; margin: -1rem 0 1rem; background: var(--vz-border-color); }
.analytics-loading span { display: block; width: 40%; height: 100%; background: var(--vz-primary); animation: analytics-loading-slide 1s ease-in-out infinite; }
.analytics-stat { border: 1px solid var(--vz-border-color); }
.analytics-ticket { padding: .8rem 1rem; border-bottom: 1px solid var(--vz-border-color); }
.analytics-ticket:hover { background: var(--vz-light); }
[data-bs-theme="dark"] .analytics-ticket:hover, [data-layout-mode="dark"] .analytics-ticket:hover { background: rgba(255,255,255,.04); }
@keyframes analytics-loading-slide { from { transform: translateX(-110%); } to { transform: translateX(280%); } }
</style>
