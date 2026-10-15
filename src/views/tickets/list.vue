<script>
import { CountTo } from "vue3-count-to";
import Multiselect from "@vueform/multiselect";
import "@vueform/multiselect/themes/default.css";
import flatPickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.css";

import Layout from "@/layouts/main.vue";
import PageHeader from "@/components/page-header";
import Swal from "sweetalert2";
import axios from "axios";
import Lottie from "@/components/widgets/lottie.vue";
import animationData from "@/components/widgets/msoeawqm.json";
import animationData1 from "@/components/widgets/gsqxdxog.json";
import {
  getSystemConfiguration,
  fetchAndApplySystemConfiguration,
} from "@/helpers/themeConfig";
import { AgGridVue } from "@/helpers/agGrid";

export default {
  components: {
    Layout,
    PageHeader,
    CountTo,
    lottie: Lottie,
    Multiselect,
    flatPickr,
    AgGridVue,
  },
  data() {
    return {
      loading: false,
      submitting: false,
      modalShow: false,
      deleteModal: false,
      confirmTicketModal: false,
      confirmSubmitting: false,
      dataEdit: false,
      ticketToDelete: null,
      ticketToConfirm: null,
      confirmForm: {
        department_id: null,
        assignees: [],
        followers: [],
      },
      selectedIds: [],
      selectAll: false,
      menuPermissions: null,

      // System Configuration settings
      systemConfig: getSystemConfiguration() || null,

      // Flatpickr configs
      rangeDateConfig: {
        wrap: true,
        altFormat: "M j, Y",
        altInput: true,
        dateFormat: "Y-m-d",
        mode: "range",
      },
      dateConfig: {
        enableTime: false,
        dateFormat: "Y-m-d",
        altInput: true,
        altFormat: "d M, Y",
      },

      // Filters
      searchQuery: "",
      filterDate: null,
      filterBoard: "All",
      filterStatus: "All",
      filterPriority: "All",

      // Lazy loading
      currentPage: 1,
      batchSize: 25,
      hasMoreTickets: true,
      loadingMore: false,
      filterReloadTimer: null,
      sortColumn: "id",
      sortDirection: "desc",

      // Raw dataset & lookups from tkt_system_tickets API
      ticketsList: [],
      stats: {
        total: 0,
        pending: 0,
        closed: 0,
        new: 0,
      },
      lookups: {
        statuses: [],
        severities: [],
        types: [],
        users: [],
      menus: [],
      systems: [],
        boards: [],
        departments: [],
        groups: [],
      },

      // Lottie animations
      defaultOptions: {
        animationData: animationData,
      },
      defaultOptions1: {
        animationData: animationData1,
      },

      // Form validation & model
      submitted: false,
      attachedFiles: [],
      isFileDragOver: false,
      assignmentListModal: false,
      assignmentListType: "assignees",
      assignmentListTicket: null,
      event: {
        id: null,
        ref_no: "",
        subject: "",
        summary: "",
        system: "Web",
        module: "tickets",
        board_status_id: null,
        issue_severity_id: null,
        issue_type_id: null,
        date_encountered: "",
        duration_to: "",
        frequency: "Once",
        assignees: [],
      },
    };
  },
  computed: {
    apiBase() {
      return process.env.VUE_APP_AUTHDOMAIN || "http://localhost:8001/api";
    },

    portalAppName() {
      return this.systemConfig?.app_name || "Support Portal";
    },

    statusFilterOptions() {
      const options = [{ value: "All", label: "All Statuses" }];
      const statuses = (this.lookups.statuses || []).filter((st) =>
        this.filterBoard === "All" || String(st.board_id) === String(this.filterBoard)
      );
      const seen = new Set();
      if (statuses.length) {
        statuses.forEach((st) => {
          const key = String(st.name || "").toLowerCase();
          if (!key || seen.has(key)) return;
          seen.add(key);
          options.push({ value: st.name, label: st.name });
        });
      } else if (!this.lookups.statuses.length) {
        options.push(
          { value: "New", label: "New" },
          { value: "Open", label: "Open" },
          { value: "Inprogress", label: "Inprogress" },
          { value: "Closed", label: "Closed" }
        );
      }
      return options;
    },

    priorityFilterOptions() {
      const options = [{ value: "All", label: "All Priorities" }];
      if (this.lookups.severities && this.lookups.severities.length) {
        this.lookups.severities.forEach((sev) => {
          options.push({ value: sev.name, label: sev.name });
        });
      } else {
        options.push(
          { value: "Low", label: "Low" },
          { value: "Medium", label: "Medium" },
          { value: "High", label: "High" },
          { value: "Critical", label: "Critical" }
        );
      }
      return options;
    },

    boardFilterOptions() {
      return [
        { value: "All", label: "All Boards" },
        ...this.lookups.boards.map((board) => ({
          value: String(board.id),
          label: board.name,
        })),
      ];
    },

    ticketAccess() {
      const rawUser = sessionStorage.getItem("authUser") || localStorage.getItem("user");
      let user = null;

      try {
        user = rawUser ? JSON.parse(rawUser) : null;
      } catch (error) {
        console.warn("Unable to read the authenticated user for ticket permissions:", error);
      }

      if (user?.role === "admin") {
        return { view: true, add: true, edit: true, delete: true };
      }

      try {
        const permissions = this.menuPermissions || JSON.parse(sessionStorage.getItem("user_menu_permissions") || "[]");
        const normalizedMenus = permissions.map((menu) => ({
          ...menu,
          code: String(menu.code || "").toLowerCase(),
          url: String(menu.url || "").replace(/\/+$/, "").toLowerCase(),
        }));
        const ticketMenu = normalizedMenus.find((menu) =>
          menu.code === "ticket_list" || menu.code === "ticket-list" || menu.code === "tickets-list"
        ) || normalizedMenus.find((menu) => {
          const code = String(menu.code || "").toLowerCase();
          const url = String(menu.url || "").replace(/\/+$/, "").toLowerCase();
          return code.includes("ticket") || url === "/tickets" || url.startsWith("/tickets/");
        });

        return {
          view: Boolean(ticketMenu?.can_view),
          add: Boolean(ticketMenu?.can_add),
          edit: Boolean(ticketMenu?.can_edit),
          delete: Boolean(ticketMenu?.can_delete),
        };
      } catch (error) {
        console.warn("Unable to read ticket permissions:", error);
        return { view: false, add: false, edit: false, delete: false };
      }
    },

    hasTicketActions() {
      return this.ticketAccess.view || this.ticketAccess.edit || this.ticketAccess.delete;
    },

    assigneeOptions() {
      return [
        ...this.lookups.users.map((user) => ({
          value: `user:${user.id}`,
          label: user.fullname || user.name,
          kind: "User",
        })),
        ...this.lookups.groups.map((group) => ({
          value: `group:${group.id}`,
          label: group.name,
          kind: "Group",
        })),
      ];
    },

    assignmentListTitle() {
      const ref = this.assignmentListTicket?.ref_no ? ` (${this.assignmentListTicket.ref_no})` : "";
      return this.assignmentListType === "observers" ? `Observers${ref}` : `Assigned To${ref}`;
    },

    assignmentListItems() {
      if (!this.assignmentListTicket) return [];
      if (this.assignmentListType === "observers") {
        const assignedGroupId = this.assignmentListTicket?.group?.id || this.assignmentListTicket?.group_id;
        return [
          ...(this.assignmentListTicket?.tagged_users || []).map((user) => ({ ...user, observerType: "user" })),
          ...(this.assignmentListTicket?.tagged_groups || [])
            .filter((group) => Number(group.id) !== Number(assignedGroupId))
            .map((group) => {
              const found = (this.lookups.groups || []).find((g) => Number(g.id) === Number(group.id));
              return {
                ...group,
                members: (group.members && group.members.length) ? group.members : (found?.members || []),
                observerType: "group",
                role: "Group",
                isGroup: true,
              };
            }),
        ];
      }

      const items = [];
      const assignedGroup = this.assignmentListTicket?.group;
      if (assignedGroup) {
        const found = (this.lookups.groups || []).find((g) => Number(g.id) === Number(assignedGroup.id));
        items.push({
          ...assignedGroup,
          members: (assignedGroup.members && assignedGroup.members.length) ? assignedGroup.members : (found?.members || []),
          observerType: "group",
          role: "Group",
          isGroup: true,
        });
      } else if (this.assignmentListTicket?.group_id) {
        const found = (this.lookups.groups || []).find((g) => Number(g.id) === Number(this.assignmentListTicket.group_id));
        if (found) {
          items.push({
            ...found,
            members: found.members || [],
            observerType: "group",
            role: "Group",
            isGroup: true,
          });
        } else {
          items.push({
            id: this.assignmentListTicket.group_id,
            name: `Group #${this.assignmentListTicket.group_id}`,
            members: [],
            observerType: "group",
            role: "Group",
            isGroup: true,
          });
        }
      }
      (this.assignmentListTicket?.assignees || []).forEach((user) => {
        items.push({
          ...user,
          observerType: "user",
        });
      });
      return items;
    },

    confirmTicketCategory() {
      if (!this.ticketToConfirm) return "—";
      const board = this.ticketToConfirm.board
        || this.ticketToConfirm.board_status?.board
        || (this.lookups.boards || []).find(
          (b) => Number(b.id) === Number(this.ticketToConfirm.board_id)
        );
      if (board?.name) return board.name;
      const boardId = Number(this.ticketToConfirm.board_id || this.ticketToConfirm.board_status?.board_id);
      if (boardId === 1) return "System";
      if (boardId === 2) return "Support";
      if (boardId === 3) return "Facilities";
      return "—";
    },

    confirmAssigneeOptions() {
      return this.assigneeOptions;
    },

    isAdmin() {
      const rawUser = sessionStorage.getItem("authUser") || localStorage.getItem("user");
      try {
        const user = rawUser ? JSON.parse(rawUser) : null;
        return String(user?.role || "").toLowerCase() === "admin";
      } catch (error) {
        return false;
      }
    },

    currentUserId() {
      const rawUser = sessionStorage.getItem("authUser") || localStorage.getItem("user");
      try {
        const user = rawUser ? JSON.parse(rawUser) : null;
        return Number(user?.id || user?.user_id || 0) || null;
      } catch (error) {
        return null;
      }
    },

    filteredTickets() {
      let result = [...this.ticketsList];

      // Search Query filter
      if (this.searchQuery && this.searchQuery.trim() !== "") {
        const query = this.searchQuery.toLowerCase().trim();
        result = result.filter((item) => {
          const ref = (item.ref_no || "").toLowerCase();
          const subj = (item.subject || "").toLowerCase();
          const sum = (item.summary || "").toLowerCase();
          return ref.includes(query) || subj.includes(query) || sum.includes(query);
        });
      }

      // Board filter
      if (this.filterBoard && this.filterBoard !== "All") {
        result = result.filter((item) => {
          const boardId = item.board_status?.board_id || item.board_id;
          const legacySystemTicket = String(this.filterBoard) === "1"
            && String(item.system || "").toUpperCase().startsWith("SYS-");
          return String(boardId) === String(this.filterBoard) || legacySystemTicket;
        });
      }

      // Status filter
      if (this.filterStatus && this.filterStatus !== "All") {
        result = result.filter(
          (item) => (item.status_name || "").toLowerCase() === this.filterStatus.toLowerCase()
        );
      }

      // Priority / Severity filter
      if (this.filterPriority && this.filterPriority !== "All") {
        result = result.filter(
          (item) => (item.severity_name || "").toLowerCase() === this.filterPriority.toLowerCase()
        );
      }

      // Date range filter
      if (this.filterDate) {
        if (typeof this.filterDate === "string" && this.filterDate.includes(" to ")) {
          const [d1, d2] = this.filterDate.split(" to ");
          const startDate = new Date(d1);
          const endDate = new Date(d2);
          endDate.setHours(23, 59, 59, 999);
          result = result.filter((item) => {
            if (!item.date_encountered) return false;
            const tDate = new Date(item.date_encountered);
            return tDate >= startDate && tDate <= endDate;
          });
        } else if (typeof this.filterDate === "string") {
          const singleDate = new Date(this.filterDate).toDateString();
          result = result.filter((item) => {
            if (!item.date_encountered) return false;
            return new Date(item.date_encountered).toDateString() === singleDate;
          });
        }
      }

      // Sorting
      result.sort((a, b) => {
        let valA = a[this.sortColumn];
        let valB = b[this.sortColumn];

        if (this.sortColumn === "status") {
          valA = a.status_name;
          valB = b.status_name;
        } else if (this.sortColumn === "priority") {
          valA = a.severity_name;
          valB = b.severity_name;
        }

        if (valA === undefined || valA === null) valA = "";
        if (valB === undefined || valB === null) valB = "";

        if (typeof valA === "string") {
          const comparison = valA.localeCompare(String(valB));
          return this.sortDirection === "asc" ? comparison : -comparison;
        }

        return this.sortDirection === "asc" ? valA - valB : valB - valA;
      });

      return result;
    },

    displayTickets() {
      return this.filteredTickets;
    },

    canDeleteSelected() {
      return this.selectedIds.length > 0 && this.selectedIds.every((id) =>
        this.canDeleteTicket(this.tickets.find((ticket) => Number(ticket.id) === Number(id)))
      );
    },

    ticketGridColumnDefs() {
      const actionButtons = [];
      if (this.ticketAccess.view) actionButtons.push('<button type="button" class="btn btn-soft-primary btn-icon btn-sm" data-ticket-action="view" title="View"><i class="ri-eye-fill"></i></button>');
      return [
        {
          headerName: "Ref No",
          pinned: "left",
          valueGetter: (p) => p.data?.ref_no || p.data?.id || "-",
          width: 150,
          minWidth: 140,
          cellRenderer: (p) => {
            const reference = p.value || "-";
            if (!this.ticketAccess.view || !p.data?.id) return reference;
            const link = document.createElement("a");
            link.href = `/tickets/details?id=${p.data.id}`;
            link.className = "ticket-grid-reference";
            link.dataset.ticketAction = "view";
            link.title = `View ticket ${reference}`;
            link.textContent = reference;
            return link;
          },
        },
        {
          headerName: "Subject",
          field: "subject",
          width: 320,
          minWidth: 260,
          wrapText: false,
          autoHeight: false,
          cellClass: "ticket-grid-subject",
          tooltip: (p) => p.data?.subject || "",
        },
        {
          headerName: "Category",
          valueGetter: (p) => p.data?.board?.name || p.data?.board_status?.board?.name || "-",
          width: 155,
          minWidth: 135,
          tooltip: (p) => p.value || "",
        },
        { headerName: "Ticket Type", valueGetter: (p) => p.data?.issue_type?.issue_desc || p.data?.type_name || "—", width: 160, minWidth: 140 },
        { headerName: "Issue Type", valueGetter: (p) => p.data?.tkt_type?.name || p.data?.tkt_type?.code || "—", width: 180, minWidth: 150 },
        {
          headerName: "Assigned To",
          width: 150,
          minWidth: 130,
          cellClass: "cursor-pointer",
          cellRenderer: (p) => {
            const users = p.data?.assignees || [];
            const assignedGroup = p.data?.group;
            if (!users.length && !assignedGroup) return '<span class="text-muted fst-italic ticket-grid-clickable" data-ticket-action="view-assignees" title="Click to view assignees">Unassigned</span>';
            const items = [
              ...(assignedGroup ? [{ ...assignedGroup, isGroup: true }] : []),
              ...users,
            ];
            const visible = items.slice(0, 5).map((item) => {
              if (item.isGroup) {
                const name = item.name || "Group";
                return `<span class="ticket-grid-avatar bg-info-subtle text-info" title="Group: ${name.replace(/"/g, "&quot;")} (Click to view)"><i class="ri-team-line"></i></span>`;
              }
              const name = item.fullname || item.name || "";
              const initials = this.getUserInitials(item);
              return `<span class="ticket-grid-avatar" title="${name.replace(/"/g, "&quot;")} (Click to view)">${initials}</span>`;
            }).join("");
            const more = items.length > 5 ? `<span class="ticket-grid-avatar ticket-grid-avatar-more">+${items.length - 5}</span>` : "";
            return `<div class="ticket-grid-assignees ticket-grid-clickable" data-ticket-action="view-assignees" title="Click to view assignees">${visible}${more}</div>`;
          },
        },
        {
          headerName: "Observers",
          width: 150,
          minWidth: 130,
          cellClass: "cursor-pointer",
          cellRenderer: (p) => {
            const observers = [
              ...(p.data?.tagged_users || []).map((observer) => ({ ...observer, observerType: "User" })),
              ...(p.data?.tagged_groups || []).map((observer) => ({ ...observer, observerType: "Group" })),
            ];
            if (!observers.length) return '<span class="text-muted ticket-grid-clickable" data-ticket-action="view-observers" title="Click to view observers">—</span>';

            const visible = observers.slice(0, 5).map((observer) => {
              const name = observer.fullname || observer.name || observer.email || observer.observerType;
              if (observer.observerType === "Group") {
                return `<span class="ticket-grid-avatar bg-info-subtle text-info" title="${name.replace(/"/g, "&quot;")} (Group) - Click to view"><i class="ri-team-line"></i></span>`;
              }
              const initials = this.getUserInitials(observer);
              return `<span class="ticket-grid-avatar" title="${name.replace(/"/g, "&quot;")} - Click to view">${initials}</span>`;
            }).join("");
            const more = observers.length > 5 ? `<span class="ticket-grid-avatar ticket-grid-avatar-more">+${observers.length - 5}</span>` : "";
            return `<div class="ticket-grid-assignees ticket-grid-clickable" data-ticket-action="view-observers" title="Click to view observers">${visible}${more}</div>`;
          },
        },
        { headerName: "Encountered", valueGetter: (p) => this.formatDate(p.data?.date_encountered), width: 145, minWidth: 130 },
        { headerName: "Due Date", valueGetter: (p) => this.formatDate(p.data?.duration_to), width: 135, minWidth: 120 },
        { headerName: "Status", valueGetter: (p) => p.data?.status_name || "Open", width: 135, minWidth: 120 },
        {
          headerName: "Priority",
          valueGetter: (p) => p.data?.severity_name || "Medium",
          width: 125,
          minWidth: 110,
          cellRenderer: (p) => {
            const label = p.value || "Medium";
            const supported = new Set(["primary", "secondary", "success", "danger", "warning", "info", "dark"]);
            const configured = String(p.data?.severity_color || "").toLowerCase();
            const fallback = { low: "success", medium: "warning", high: "danger", critical: "danger" }[String(label).toLowerCase()] || "secondary";
            const color = supported.has(configured) ? configured : fallback;
            const badge = document.createElement("span");
            badge.className = `badge bg-${color}-subtle text-${color} ticket-grid-priority`;
            badge.textContent = label;
            return badge;
          },
        },
        {
          headerName: "Reported By",
          valueGetter: (p) => p.data?.creator?.fullname || p.data?.creator?.name || p.data?.creator?.email || "—",
          width: 190,
          minWidth: 160,
          tooltip: (p) => p.value || "",
        },
        {
          headerName: "Actions",
          sortable: false,
          filter: false,
          pinned: "right",
          width: 180,
          minWidth: 160,
          cellRenderer: (p) => {
            const edit = this.canEditTicket(p.data)
              ? '<button type="button" class="btn btn-soft-info btn-icon btn-sm" data-ticket-action="edit" title="Edit"><i class="ri-pencil-fill"></i></button>'
              : "";
            const confirm = this.isAdmin && String(p.data?.status_name || "").toLowerCase() === "new"
              ? '<button type="button" class="btn btn-soft-success btn-icon btn-sm" data-ticket-action="confirm" title="Confirm"><i class="ri-checkbox-circle-line"></i></button>'
              : "";
            const remove = this.canDeleteTicket(p.data)
              ? '<button type="button" class="btn btn-soft-danger btn-icon btn-sm" data-ticket-action="delete" title="Delete"><i class="ri-delete-bin-fill"></i></button>'
              : "";
            return `<div class="d-flex align-items-center gap-1">${actionButtons.join("")}${edit}${confirm}${remove}</div>`;
          },
        },
      ];
    },
  },
  watch: {
    filteredTickets() {
      this.selectedIds = [];
      this.selectAll = false;
    },
    searchQuery: "scheduleFilterReload",
    filterDate: "scheduleFilterReload",
    filterBoard: "handleBoardFilterChange",
    filterStatus: "scheduleFilterReload",
    filterPriority: "scheduleFilterReload",
  },
  mounted() {
    this.searchQuery = typeof this.$route?.query?.search === "string" ? this.$route.query.search : "";
    window.addEventListener("system-configuration-updated", this.handleSystemConfigUpdated);
    window.addEventListener("app-theme-changed", this.handleThemeChanged);
    window.addEventListener("scroll", this.handleWindowScroll, { passive: true });

    this.loadSystemConfiguration();
    this.fetchUserMenuAccess();
    this.fetchLookups();
    this.fetchTickets();
  },
  beforeUnmount() {
    window.removeEventListener("system-configuration-updated", this.handleSystemConfigUpdated);
    window.removeEventListener("app-theme-changed", this.handleThemeChanged);
    window.removeEventListener("scroll", this.handleWindowScroll);
    if (this.filterReloadTimer) clearTimeout(this.filterReloadTimer);
  },
  methods: {
    onGridCellClicked(params) {
      const action = params?.event?.target?.closest?.("[data-ticket-action]")?.dataset?.ticketAction;
      const ticket = params?.data;
      if (!ticket) return;

      const colHeader = params?.colDef?.headerName;
      if (action === "view-assignees" || colHeader === "Assigned To") {
        params.event?.preventDefault?.();
        this.openAssignmentListModal(ticket, "assignees");
        return;
      }
      if (action === "view-observers" || colHeader === "Observers") {
        params.event?.preventDefault?.();
        this.openAssignmentListModal(ticket, "observers");
        return;
      }

      if (!action) return;
      params.event?.preventDefault?.();
      if (action === "view") this.$router.push(`/tickets/details?id=${ticket.id}`);
      if (action === "edit" && this.canEditTicket(ticket)) this.openEditModal(ticket);
      if (action === "confirm") this.openConfirmTicketModal(ticket);
      if (action === "delete" && this.canDeleteTicket(ticket)) this.deleteModalToggle(ticket);
    },

    getAuthHeaders() {
      const token = localStorage.getItem("jwt") || localStorage.getItem("token");
      return token ? { Authorization: `Bearer ${token}` } : {};
    },

    canEditTicket(ticket) {
      const status = String(ticket?.status_name || ticket?.board_status?.name || "").toLowerCase();
      return Boolean(
        this.ticketAccess.edit
        && (this.isAdmin || (
          this.currentUserId
          && Number(ticket?.created_by) === this.currentUserId
          && status === "new"
        ))
      );
    },

    canDeleteTicket(ticket) {
      return Boolean(
        this.ticketAccess.delete
        && (this.isAdmin || (
          this.currentUserId
          && Number(ticket?.created_by) === this.currentUserId
        ))
      );
    },

    async fetchUserMenuAccess() {
      if (!this.getAuthHeaders().Authorization) return;

      try {
        const response = await axios.get(`${this.apiBase}/user/menu-access`, {
          headers: this.getAuthHeaders(),
        });
        this.menuPermissions = response.data?.menus || [];
        sessionStorage.setItem("user_menu_permissions", JSON.stringify(this.menuPermissions));
      } catch (error) {
        console.warn("Unable to refresh ticket menu permissions:", error);
      }
    },

    async loadSystemConfiguration() {
      const cached = getSystemConfiguration();
      if (cached) {
        this.applySystemConfig(cached);
      }
      try {
        const config = await fetchAndApplySystemConfiguration();
        if (config) {
          this.applySystemConfig(config);
        }
      } catch (e) {
        console.warn("Failed to load system config in tickets list:", e);
      }
    },

    handleSystemConfigUpdated(event) {
      if (event?.detail) {
        this.applySystemConfig(event.detail);
      }
    },

    handleThemeChanged() {
      this.$forceUpdate();
    },

    applySystemConfig(config) {
      this.systemConfig = config;
      if (config.date_format) {
        this.updateDateFormat(config.date_format);
      }
    },

    updateDateFormat(format) {
      if (format === "MM/DD/YYYY") {
        this.rangeDateConfig.altFormat = "m/d/Y";
        this.dateConfig.altFormat = "m/d/Y";
      } else if (format === "DD/MM/YYYY") {
        this.rangeDateConfig.altFormat = "d/m/Y";
        this.dateConfig.altFormat = "d/m/Y";
      } else if (format === "YYYY-MM-DD") {
        this.rangeDateConfig.altFormat = "Y-m-d";
        this.dateConfig.altFormat = "Y-m-d";
      }
    },

    async fetchLookups() {
      try {
        const response = await axios.get(`${this.apiBase}/tickets/lookups`, {
          headers: this.getAuthHeaders(),
        });
        if (response.data) {
          this.lookups = {
            statuses: response.data.statuses || [],
            severities: response.data.severities || [],
            types: response.data.types || [],
            users: response.data.users || [],
            menus: response.data.menus || [],
            systems: response.data.systems || [],
            boards: response.data.boards || [],
            departments: response.data.departments || [],
            groups: response.data.groups || [],
          };
        }

        // Also fetch user access systems
        try {
          const sysRes = await axios.get(`${this.apiBase}/user/systems`, {
            headers: this.getAuthHeaders(),
          });
          if (sysRes.data?.data && sysRes.data.data.length > 0) {
            this.lookups.systems = sysRes.data.data;
          }
        } catch (e) {
          // Keep systems from lookups
        }
      } catch (err) {
        console.error("Failed to load lookups:", err);
      }
    },

    scheduleFilterReload() {
      if (this.filterReloadTimer) clearTimeout(this.filterReloadTimer);
      this.filterReloadTimer = setTimeout(() => this.fetchTickets(), 300);
    },

    handleBoardFilterChange() {
      const statusIsAvailable = this.statusFilterOptions.some(
        (option) => option.value === "All" || option.value === this.filterStatus
      );
      if (!statusIsAvailable) this.filterStatus = "All";
      this.scheduleFilterReload();
    },

    async fetchTickets(loadMore = false) {
      if (loadMore) {
        if (this.loading || this.loadingMore || !this.hasMoreTickets) return;
        this.loadingMore = true;
      } else {
        this.loading = true;
        this.currentPage = 1;
        this.hasMoreTickets = true;
        this.ticketsList = [];
      }

      try {
        const response = await axios.get(`${this.apiBase}/tickets`, {
          params: {
            page: this.currentPage,
            per_page: this.batchSize,
            search: this.searchQuery || undefined,
            board_id: this.filterBoard !== "All" ? this.filterBoard : undefined,
            status: this.filterStatus !== "All" ? this.filterStatus : undefined,
            severity: this.filterPriority !== "All" ? this.filterPriority : undefined,
            date: this.filterDate || undefined,
            sort_by: this.sortColumn,
            sort_direction: this.sortDirection,
          },
          headers: this.getAuthHeaders(),
        });

        if (response.data && response.data.data) {
          const incoming = response.data.data;
          this.ticketsList = loadMore
            ? [...this.ticketsList, ...incoming]
            : incoming;
          const meta = response.data.meta || {};
          this.hasMoreTickets = Boolean(meta.current_page < meta.last_page);
          if (this.hasMoreTickets) this.currentPage += 1;
          if (response.data.stats) {
            this.stats = response.data.stats;
          } else {
            this.computeLocalStats();
          }
        }
      } catch (err) {
        console.error("Failed to load tickets:", err);
        Swal.fire({
          icon: "error",
          title: "Failed to load tickets",
          text: err.response?.data?.message || err.message,
          confirmButtonClass: "btn btn-primary",
        });
      } finally {
        this.loading = false;
        this.loadingMore = false;
      }
    },

    handleTicketScroll(event) {
      const element = event?.target;
      if (!element || this.loading || this.loadingMore || !this.hasMoreTickets) return;
      if (element.scrollHeight - element.scrollTop - element.clientHeight < 240) {
        this.fetchTickets(true);
      }
    },

    handleGridScroll(params) {
      const api = params?.api;
      if (!api || this.loading || this.loadingMore || !this.hasMoreTickets) return;
      const range = api.getVerticalPixelRange?.();
      const rowCount = api.getDisplayedRowCount?.() || 0;
      if (range && range.bottom >= Math.max(0, rowCount * 42 - 500)) this.fetchTickets(true);
    },

    handleWindowScroll() {
      if (this.loading || this.loadingMore || !this.hasMoreTickets) return;
      const remaining = document.documentElement.scrollHeight - (window.scrollY + window.innerHeight);
      if (remaining < 400) this.fetchTickets(true);
    },

    computeLocalStats() {
      this.stats = {
        total: this.ticketsList.length,
        pending: this.ticketsList.filter((t) =>
          ["inprogress", "pending", "open"].includes((t.status_name || "").toLowerCase())
        ).length,
        closed: this.ticketsList.filter(
          (t) => (t.status_name || "").toLowerCase() === "closed" || t.status === 0
        ).length,
        new: this.ticketsList.filter(
          (t) => (t.status_name || "").toLowerCase() === "new"
        ).length,
      };
    },

    onSort(col) {
      if (this.sortColumn === col) {
        this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
      } else {
        this.sortColumn = col;
        this.sortDirection = "asc";
      }
      this.fetchTickets();
    },

    resetFilters() {
      this.searchQuery = "";
      this.filterDate = null;
      this.filterBoard = "All";
      this.filterStatus = "All";
      this.filterPriority = "All";
      this.fetchTickets();
    },

    toggleSelectAll() {
      if (this.selectAll) {
        this.selectedIds = this.displayTickets.map((t) => t.id);
      } else {
        this.selectedIds = [];
      }
    },

    toggleRowSelection(id) {
      const idx = this.selectedIds.indexOf(id);
      if (idx > -1) {
        this.selectedIds.splice(idx, 1);
      } else {
        this.selectedIds.push(id);
      }
      this.selectAll =
        this.displayTickets.length > 0 &&
        this.displayTickets.every((t) => this.selectedIds.includes(t.id));
    },

    openCreateModal() {
      this.$router.push("/tickets/new");
    },

    openEditModal(ticket) {
      if (ticket && ticket.id) {
        this.$router.push({ path: "/tickets/edit", query: { id: ticket.id } });
      }
    },

    triggerFileInput() {
      this.$refs.fileInputRef?.click();
    },

    handleFileSelect(e) {
      const files = Array.from(e.target.files || []);
      this.addFiles(files);
      if (this.$refs.fileInputRef) {
        this.$refs.fileInputRef.value = "";
      }
    },

    handleFileDrop(e) {
      this.isFileDragOver = false;
      const files = Array.from(e.dataTransfer?.files || []);
      this.addFiles(files);
    },

    addFiles(files) {
      files.forEach((f) => {
        if (!this.attachedFiles.some((existing) => existing.name === f.name && existing.size === f.size)) {
          this.attachedFiles.push(f);
        }
      });
    },

    removeAttachedFile(idx) {
      this.attachedFiles.splice(idx, 1);
    },

    formatFileSize(bytes) {
      if (!bytes || bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    },

    getFileIconClass(name) {
      if (!name) return "ri-file-line";
      const ext = name.split(".").pop().toLowerCase();
      if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return "ri-image-line";
      if (["pdf"].includes(ext)) return "ri-file-pdf-line";
      if (["doc", "docx"].includes(ext)) return "ri-file-word-line";
      if (["xls", "xlsx", "csv"].includes(ext)) return "ri-file-excel-line";
      if (["zip", "rar", "7z", "tar"].includes(ext)) return "ri-file-zip-line";
      if (["txt", "log"].includes(ext)) return "ri-file-text-line";
      return "ri-file-line";
    },

    async handleFormSubmit() {
      this.submitted = true;
      if (!this.event.subject || !this.event.summary) {
        return;
      }

      this.submitting = true;
      try {
        const payload = new FormData();
        payload.append("subject", this.event.subject);
        payload.append("summary", this.event.summary);
        payload.append("system", this.event.system || "");
        payload.append("module", this.event.module || "tickets");
        if (this.event.board_status_id) {
          payload.append("board_status_id", this.event.board_status_id);
        }
        if (this.event.issue_severity_id) {
          payload.append("issue_severity_id", this.event.issue_severity_id);
        }
        if (this.event.issue_type_id) {
          payload.append("issue_type_id", this.event.issue_type_id);
        }
        if (this.event.date_encountered) {
          payload.append("date_encountered", this.event.date_encountered);
        }
        payload.append("frequency", this.event.frequency || "Once");

        (this.event.assignees || []).forEach((userId, i) => {
          payload.append(`assignees[${i}]`, userId);
        });

        this.attachedFiles.forEach((file) => {
          payload.append("attachments[]", file);
        });

        if (this.dataEdit && this.event.id) {
          payload.append("_method", "PUT");
          await axios.post(`${this.apiBase}/tickets/${this.event.id}`, payload, {
            headers: {
              ...this.getAuthHeaders(),
              "Content-Type": "multipart/form-data",
            },
          });
          Swal.fire({
            icon: "success",
            title: "Updated!",
            text: "Ticket has been updated successfully.",
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          await axios.post(`${this.apiBase}/tickets`, payload, {
            headers: {
              ...this.getAuthHeaders(),
              "Content-Type": "multipart/form-data",
            },
          });
          Swal.fire({
            icon: "success",
            title: "Created!",
            text: "New ticket has been created successfully.",
            timer: 2000,
            showConfirmButton: false,
          });
        }

        this.modalShow = false;
        await this.fetchTickets();
      } catch (err) {
        console.error("Form submit error:", err);
        Swal.fire({
          icon: "error",
          title: "Save Failed",
          text: err.response?.data?.message || err.message,
          confirmButtonClass: "btn btn-primary",
        });
      } finally {
        this.submitting = false;
      }
    },

    deleteModalToggle(ticket) {
      this.ticketToDelete = ticket;
      this.deleteModal = true;
    },

    openConfirmTicketModal(ticket) {
      if (!this.isAdmin || !ticket) return;
      this.ticketToConfirm = ticket;
      const isCreator = this.currentUserId && Number(ticket.created_by) === this.currentUserId;
      const currentObserver = isCreator ? [`user:${this.currentUserId}`] : [];
      this.confirmForm = {
        // Carry any existing assigned users and assigned group into assignees
        assignees: [
          ...(ticket.assignees || []).map((user) => `user:${user.id}`),
          ...(ticket.group_id ? [`group:${ticket.group_id}`] : []),
        ],
        followers: [
          // Existing observers/followers are retained as followers
          ...(ticket.tagged_users || []).map((user) => `user:${user.id}`),
          ...(ticket.tagged_groups || [])
            .filter((g) => Number(g.id) !== Number(ticket.group_id))
            .map((group) => `group:${group.id}`),
          ...currentObserver,
        ],
      };
      this.confirmForm.assignees = [...new Set(this.confirmForm.assignees)];
      this.confirmForm.followers = [...new Set(this.confirmForm.followers)];
      this.confirmTicketModal = true;
    },

    restoreCurrentObserver(removed) {
      const currentObserver = this.currentUserId ? `user:${this.currentUserId}` : null;
      const removedValue = typeof removed === "string" ? removed : removed?.value;
      const isCreator = this.ticketToConfirm
        && Number(this.ticketToConfirm.created_by) === this.currentUserId;
      if (isCreator && currentObserver && removedValue === currentObserver) {
        this.$nextTick(() => {
          if (!this.confirmForm.followers.includes(currentObserver)) {
            this.confirmForm.followers.push(currentObserver);
          }
        });
      }
    },

    async confirmTicketAssignment(action = "confirm_authorize") {
      if (!this.ticketToConfirm) return;
      if (action !== "reject" && !this.confirmForm.assignees.length) return;
      this.confirmSubmitting = true;
      try {
        const userAssignees = this.confirmForm.assignees
          .filter((value) => String(value).startsWith("user:"))
          .map((value) => Number(String(value).replace("user:", "")));
        const groupValues = this.confirmForm.assignees
          .filter((value) => String(value).startsWith("group:"))
          .map((value) => Number(String(value).replace("group:", "")));
        const followerUsers = this.confirmForm.followers
          .filter((value) => String(value).startsWith("user:"))
          .map((value) => Number(String(value).replace("user:", "")));
        const followerGroups = this.confirmForm.followers
          .filter((value) => String(value).startsWith("group:"))
          .map((value) => Number(String(value).replace("group:", "")));
        const isCreator = this.ticketToConfirm
          && Number(this.ticketToConfirm.created_by) === this.currentUserId;
        if (isCreator && this.currentUserId && !followerUsers.includes(this.currentUserId)) {
          followerUsers.push(this.currentUserId);
        }

        // All groups in assignees and followers are tagged in tkt_system_ticket_tagged_group
        const allTaggedGroups = [...new Set([...groupValues, ...followerGroups])];

        await axios.post(`${this.apiBase}/tickets/${this.ticketToConfirm.id}`, {
          assignees: userAssignees,
          assigned_groups: groupValues,
          group_id: groupValues[0] || null,
          followers: followerUsers,
          follower_groups: allTaggedGroups,
          tagged_groups: allTaggedGroups,
          workflow_action: action,
        }, {
          headers: {
            ...this.getAuthHeaders(),
            "Content-Type": "application/json",
          },
        });
        this.confirmTicketModal = false;
        this.ticketToConfirm = null;
        await this.fetchTickets();
        Swal.fire({
          icon: "success",
          title: "Ticket confirmed",
          text: "The ticket assignees and workflow were saved.",
          timer: 1800,
          showConfirmButton: false,
        });
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Confirmation failed",
          text: err.response?.data?.message || err.message,
          confirmButtonClass: "btn btn-primary",
        });
      } finally {
        this.confirmSubmitting = false;
      }
    },

    async confirmDelete() {
      if (!this.ticketToDelete) return;
      try {
        await axios.delete(`${this.apiBase}/tickets/${this.ticketToDelete.id}`, {
          headers: this.getAuthHeaders(),
        });
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Ticket record has been removed.",
          timer: 1800,
          showConfirmButton: false,
        });
        this.deleteModal = false;
        this.ticketToDelete = null;
        await this.fetchTickets();
      } catch (err) {
        console.error("Delete error:", err);
        Swal.fire({
          icon: "error",
          title: "Delete failed",
          text: err.response?.data?.message || err.message,
          confirmButtonClass: "btn btn-primary",
        });
      }
    },

    async deleteMultiple() {
      if (this.selectedIds.length === 0) {
        Swal.fire({
          title: "No tickets selected",
          text: "Please select at least one checkbox to delete.",
          icon: "info",
          confirmButtonClass: "btn btn-info",
        });
        return;
      }

      const result = await Swal.fire({
        title: "Delete selected tickets?",
        text: `Are you sure you want to delete ${this.selectedIds.length} tickets? This action cannot be undone.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete them!",
      });

      if (result.isConfirmed) {
        try {
          await axios.post(
            `${this.apiBase}/tickets/bulk-delete`,
            { ids: this.selectedIds },
            { headers: this.getAuthHeaders() }
          );
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: `${this.selectedIds.length} tickets have been deleted.`,
            timer: 2000,
            showConfirmButton: false,
          });
          this.selectedIds = [];
          this.selectAll = false;
          await this.fetchTickets();
        } catch (err) {
          console.error("Bulk delete error:", err);
          Swal.fire({
            icon: "error",
            title: "Bulk delete failed",
            text: err.response?.data?.message || err.message,
          });
        }
      }
    },

    formatDate(dateStr) {
      if (!dateStr) return "-";
      try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const day = String(d.getDate()).padStart(2, "0");
        const monthNum = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();

        const fmt = this.systemConfig?.date_format || "DD M, YYYY";
        if (fmt === "MM/DD/YYYY") {
          return `${monthNum}/${day}/${year}`;
        } else if (fmt === "DD/MM/YYYY") {
          return `${day}/${monthNum}/${year}`;
        } else if (fmt === "YYYY-MM-DD") {
          return `${year}-${monthNum}-${day}`;
        }
        return `${day} ${months[d.getMonth()]}, ${year}`;
      } catch {
        return dateStr;
      }
    },

    getStatusBadgeClass(status) {
      const s = (status || "").toLowerCase();
      if (s === "inprogress" || s === "in progress") return "bg-warning-subtle text-warning";
      if (s === "new") return "bg-info-subtle text-info";
      if (s === "open") return "bg-primary-subtle text-primary";
      if (s === "closed" || s === "resolved") return "bg-success-subtle text-success";
      return "bg-secondary-subtle text-secondary";
    },

    getSeverityBadgeClass(severity) {
      const sev = (severity || "").toLowerCase();
      if (sev === "critical") return "bg-dark";
      if (sev === "high") return "bg-danger";
      if (sev === "medium") return "bg-warning";
      if (sev === "low") return "bg-success";
      return "bg-secondary";
    },

    getUserAvatar(image) {
      if (image) {
        try {
          return require(`@/assets/images/users/${image}`);
        } catch (e) {
          // Fall back if file missing
        }
      }
      return require("@/assets/images/users/user-dummy-img.jpg");
    },

    getUserInitials(user) {
      const name = String(user?.fullname || user?.name || user?.email || "User").trim();
      const parts = name.split(/\s+/).filter(Boolean);
      if (parts.length > 1) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      return name.slice(0, 2).toUpperCase();
    },

    openAssignmentListModal(ticket, type = "assignees") {
      this.assignmentListTicket = ticket;
      this.assignmentListType = type;
      this.assignmentListModal = true;
    },

    groupMembers(group) {
      if (!group) return [];
      if (Array.isArray(group.members) && group.members.length) {
        return group.members;
      }
      const found = (this.lookups.groups || []).find((g) => Number(g.id) === Number(group.id));
      return found?.members || [];
    },

    formatRole(role) {
      return String(role || "User")
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
    },

    personName(person) {
      return person?.fullname || person?.name || person?.email || "User";
    },
  },
};
</script>

<template>
  <Layout>
    <PageHeader title="Tickets List" pageTitle="Tickets" />

    <!-- KPI Metric Cards (Connected to tkt_system_tickets) -->
    <BRow>
      <BCol xxl="3" sm="6">
        <BCard no-body class="card-animate shadow-sm border-0">
          <BCardBody>
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <p class="fw-semibold text-muted text-uppercase fs-12 mb-1">Total Tickets</p>
                <h3 class="mt-2 mb-0 ff-secondary fw-bold text-primary">
                  <count-to :duration="800" :startVal="0" :endVal="stats.total"></count-to>
                </h3>
                <p class="mb-0 text-muted fs-12 mt-2">
                  <span class="badge bg-primary-subtle text-primary me-1">
                    <i class="ri-ticket-2-line align-middle"></i> All Tickets
                  </span>
                </p>
              </div>
              <div class="avatar-sm flex-shrink-0">
                <span class="avatar-title bg-primary-subtle text-primary rounded-circle fs-3">
                  <i class="ri-ticket-2-line"></i>
                </span>
              </div>
            </div>
          </BCardBody>
        </BCard>
      </BCol>

      <BCol xxl="3" sm="6">
        <BCard no-body class="card-animate shadow-sm border-0">
          <BCardBody>
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <p class="fw-semibold text-muted text-uppercase fs-12 mb-1">Pending / In Progress</p>
                <h3 class="mt-2 mb-0 ff-secondary fw-bold text-warning">
                  <count-to :duration="800" :startVal="0" :endVal="stats.pending"></count-to>
                </h3>
                <p class="mb-0 text-muted fs-12 mt-2">
                  <span class="badge bg-warning-subtle text-warning me-1">
                    <i class="ri-time-line align-middle"></i> Active Resolution
                  </span>
                </p>
              </div>
              <div class="avatar-sm flex-shrink-0">
                <span class="avatar-title bg-warning-subtle text-warning rounded-circle fs-3">
                  <i class="mdi mdi-timer-sand"></i>
                </span>
              </div>
            </div>
          </BCardBody>
        </BCard>
      </BCol>

      <BCol xxl="3" sm="6">
        <BCard no-body class="card-animate shadow-sm border-0">
          <BCardBody>
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <p class="fw-semibold text-muted text-uppercase fs-12 mb-1">Closed Tickets</p>
                <h3 class="mt-2 mb-0 ff-secondary fw-bold text-success">
                  <count-to :duration="800" :startVal="0" :endVal="stats.closed"></count-to>
                </h3>
                <p class="mb-0 text-muted fs-12 mt-2">
                  <span class="badge bg-success-subtle text-success me-1">
                    <i class="ri-checkbox-circle-line align-middle"></i> Resolved
                  </span>
                </p>
              </div>
              <div class="avatar-sm flex-shrink-0">
                <span class="avatar-title bg-success-subtle text-success rounded-circle fs-3">
                  <i class="ri-check-double-line"></i>
                </span>
              </div>
            </div>
          </BCardBody>
        </BCard>
      </BCol>

      <BCol xxl="3" sm="6">
        <BCard no-body class="card-animate shadow-sm border-0">
          <BCardBody>
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <p class="fw-semibold text-muted text-uppercase fs-12 mb-1">New Tickets</p>
                <h3 class="mt-2 mb-0 ff-secondary fw-bold text-info">
                  <count-to :duration="800" :startVal="0" :endVal="stats.new"></count-to>
                </h3>
                <p class="mb-0 text-muted fs-12 mt-2">
                  <span class="badge bg-info-subtle text-info me-1">
                    <i class="ri-flashlight-line align-middle"></i> Unassigned / New
                  </span>
                </p>
              </div>
              <div class="avatar-sm flex-shrink-0">
                <span class="avatar-title bg-info-subtle text-info rounded-circle fs-3">
                  <i class="ri-sparkling-2-line"></i>
                </span>
              </div>
            </div>
          </BCardBody>
        </BCard>
      </BCol>
    </BRow>

    <!-- Main Table Card -->
    <BRow>
      <BCol lg="12">
        <BCard no-body id="ticketsList" class="shadow-sm border-0">
          <!-- Card Header -->
          <BCardHeader class="border-0 bg-transparent py-3">
            <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
              <div class="d-flex align-items-center gap-2">
                <h5 class="card-title mb-0 fw-bold">Support Tickets</h5>
                <span v-if="filteredTickets.length !== ticketsList.length" class="badge bg-secondary-subtle text-secondary">
                  Showing {{ filteredTickets.length }} of {{ ticketsList.length }}
                </span>
              </div>
              <div class="d-flex align-items-center gap-2">
                <!-- Delete Multiple Button -->
                <button
                  v-if="canDeleteSelected"
                  type="button"
                  class="btn btn-sm btn-soft-danger d-flex align-items-center gap-1 animate-pulse"
                  @click="deleteMultiple"
                >
                  <i class="ri-delete-bin-2-line"></i>
                  <span>Delete Selected ({{ selectedIds.length }})</span>
                </button>

                <!-- Refresh Button -->
                <button
                  type="button"
                  class="btn btn-sm btn-outline-secondary"
                  :disabled="loading"
                  @click="fetchTickets"
                  title="Reload from database"
                >
                  <i class="ri-refresh-line" :class="{ 'ri-spin': loading }"></i>
                </button>

                <!-- Create Ticket Button -->
                <button
                  v-if="ticketAccess.add"
                  type="button"
                  class="btn btn-sm btn-primary d-flex align-items-center gap-1 shadow-sm"
                  @click="openCreateModal"
                >
                  <i class="ri-add-line fs-14"></i>
                  <span>Create Ticket</span>
                </button>
              </div>
            </div>
          </BCardHeader>

          <!-- Filter Toolbar (Seamless Theme-Adaptive Background) -->
          <BCardBody class="border-top border-bottom border-dashed border-start-0 border-end-0 py-3 toolbar-container">
            <BRow class="g-3 align-items-center">
              <!-- Live Search Input -->
              <BCol xl="3" lg="4" sm="12">
                <div class="search-box">
                  <input
                    type="text"
                    class="form-control search"
                    placeholder="Search by reference, subject, or summary..."
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

              <!-- Date Range Filter (Flatpickr) -->
              <BCol xl="2" lg="2" sm="6">
                <div class="position-relative">
                  <i class="ri-calendar-line position-absolute top-50 start-0 translate-middle-y ms-3 text-muted date-filter-icon"></i>
                  <flat-pickr
                    v-model="filterDate"
                    :config="rangeDateConfig"
                    class="form-control ps-5"
                    placeholder="Select Date Range"
                  ></flat-pickr>
                </div>
              </BCol>

              <!-- Board Multiselect -->
              <BCol xl="2" lg="2" sm="6">
                <Multiselect
                  v-model="filterBoard"
                  :close-on-select="true"
                  :searchable="true"
                  :options="boardFilterOptions"
                  placeholder="Filter Board"
                />
              </BCol>

              <!-- Status Multiselect -->
              <BCol xl="2" lg="2" sm="6">
                <Multiselect
                  v-model="filterStatus"
                  :close-on-select="true"
                  :searchable="true"
                  :options="statusFilterOptions"
                  placeholder="Filter Status"
                />
              </BCol>

              <!-- Priority Multiselect -->
              <BCol xl="2" lg="2" sm="6">
                <Multiselect
                  v-model="filterPriority"
                  :close-on-select="true"
                  :searchable="true"
                  :options="priorityFilterOptions"
                  placeholder="Filter Priority"
                />
              </BCol>

              <!-- Reset Filters -->
              <BCol xl="1" lg="12" class="text-end">
                <button
                  type="button"
                  class="btn btn-soft-secondary w-100"
                  @click="resetFilters"
                  title="Reset all filters"
                >
                  <i class="ri-filter-off-line align-middle"></i>
                </button>
              </BCol>
            </BRow>
          </BCardBody>

          <!-- Table Content -->
          <BCardBody class="p-0">
            <!-- AG Grid table -->
            <div class="ticket-grid-wrap">
              <AgGridVue
                class="ticket-grid"
                style="width: 100%; height: min(62vh, 560px);"
                item-name="tickets"
                :show-caption="false"
                :row-data="displayTickets"
                :column-defs="ticketGridColumnDefs"
                :loading="loading || loadingMore"
                :pagination="false"
                :suppress-pagination-panel="true"
                :suppress-column-virtualisation="true"
                :suppress-drag-leave-hides-columns="true"
                :ensure-dom-order="true"
                :suppress-column-move-animation="true"
                @cell-clicked="onGridCellClicked"
                @body-scroll="handleGridScroll"
              />
            </div>

            <!-- Legacy table markup retained for fallback compatibility. -->
            <div v-if="false" class="table-responsive tickets-lazy-scroll" @scroll.passive="handleTicketScroll">
              <table class="table align-middle table-nowrap table-hover mb-0" id="ticketTable">
                <thead class="table-light text-muted">
                  <tr>
                    <th scope="col" style="width: 45px" class="ps-3">
                      <div class="form-check">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          id="checkAll"
                          v-model="selectAll"
                          @change="toggleSelectAll"
                        />
                      </div>
                    </th>
                    <th class="sort cursor-pointer" @click="onSort('ref_no')">
                      Ref No
                      <i v-if="sortColumn === 'ref_no'" :class="sortDirection === 'asc' ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'"></i>
                    </th>
                    <th class="sort cursor-pointer" @click="onSort('subject')" style="min-width: 250px">
                      Subject
                      <i v-if="sortColumn === 'subject'" :class="sortDirection === 'asc' ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'"></i>
                    </th>
                    <th>Issue Type</th>
                    <th>Assigned To</th>
                    <th class="sort cursor-pointer" @click="onSort('date_encountered')">
                      Encountered
                      <i v-if="sortColumn === 'date_encountered'" :class="sortDirection === 'asc' ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'"></i>
                    </th>
                    <th class="sort cursor-pointer" @click="onSort('duration_to')">
                      Due Date
                      <i v-if="sortColumn === 'duration_to'" :class="sortDirection === 'asc' ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'"></i>
                    </th>
                    <th class="sort cursor-pointer" @click="onSort('status')">
                      Status
                      <i v-if="sortColumn === 'status'" :class="sortDirection === 'asc' ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'"></i>
                    </th>
                    <th class="sort cursor-pointer" @click="onSort('priority')">
                      Priority
                      <i v-if="sortColumn === 'priority'" :class="sortDirection === 'asc' ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'"></i>
                    </th>
                    <th v-if="hasTicketActions" class="text-end pe-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="ticket in displayTickets"
                    :key="ticket.id"
                    :class="{ 'table-active': selectedIds.includes(ticket.id) }"
                  >
                    <td class="ps-3">
                      <div class="form-check">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          :checked="selectedIds.includes(ticket.id)"
                          @change="toggleRowSelection(ticket.id)"
                        />
                      </div>
                    </td>
                    <td class="fw-semibold text-primary">
                      <router-link :to="`/tickets/details?id=${ticket.id}`" class="link-primary fw-medium">
                        #{{ ticket.ref_no || ticket.id }}
                      </router-link>
                    </td>
                    <td>
                      <div class="d-flex flex-column">
                        <span class="fw-medium text-truncate ticket-subject" style="max-width: 320px" :title="ticket.subject">
                          {{ ticket.subject }}
                        </span>
                        <small class="text-truncate ticket-summary" style="max-width: 320px" :title="ticket.summary">
                          {{ ticket.summary }}
                        </small>
                      </div>
                    </td>
                    <td>
                      <span class="badge bg-primary-subtle text-primary">
                        {{ ticket.issue_type?.issue_desc || ticket.tkt_type?.name || ticket.type_name || '—' }}
                      </span>
                    </td>
                    <td>
                      <div v-if="ticket.assignees && ticket.assignees.length" class="avatar-group cursor-pointer" @click="openAssignmentListModal(ticket, 'assignees')" title="Click to view assignees">
                        <div
                          v-for="user in ticket.assignees.slice(0, 3)"
                          :key="user.id"
                          class="avatar-group-item"
                          :title="user.fullname || user.name"
                        >
                          <span class="avatar-title avatar-xxs rounded-circle bg-primary-subtle text-primary fs-10">
                            {{ getUserInitials(user) }}
                          </span>
                        </div>
                        <span
                          v-if="ticket.assignees.length > 3"
                          class="avatar-xxs avatar-title rounded-circle bg-light text-primary fs-10"
                        >
                          +{{ ticket.assignees.length - 3 }}
                        </span>
                      </div>
                      <span v-else class="text-muted fs-12 fst-italic cursor-pointer" @click="openAssignmentListModal(ticket, 'assignees')" title="Click to view assignees">Unassigned</span>
                    </td>
                    <td class="fs-12 text-muted">
                      {{ formatDate(ticket.date_encountered) }}
                    </td>
                    <td class="fs-12 text-muted">
                      {{ formatDate(ticket.duration_to) }}
                    </td>
                    <td>
                      <span
                        class="badge text-uppercase px-2 py-1"
                        :class="getStatusBadgeClass(ticket.status_name)"
                      >
                        {{ ticket.status_name || 'Open' }}
                      </span>
                    </td>
                    <td>
                      <span
                        class="badge text-uppercase px-2 py-1"
                        :class="getSeverityBadgeClass(ticket.severity_name)"
                      >
                        {{ ticket.severity_name || 'Medium' }}
                      </span>
                    </td>
                    <td v-if="hasTicketActions" class="text-end pe-3">
                      <div class="d-inline-flex align-items-center gap-1">
                        <router-link
                          v-if="ticketAccess.view"
                          :to="`/tickets/details?id=${ticket.id}`"
                          class="btn btn-soft-primary btn-icon btn-sm"
                          title="View details"
                          aria-label="View ticket details"
                        >
                          <i class="ri-eye-fill"></i>
                        </router-link>
                        <button
                          v-if="isAdmin && String(ticket.status_name || '').toLowerCase() === 'new'"
                          type="button"
                          class="btn btn-soft-success btn-icon btn-sm"
                          title="Confirm ticket and assign"
                          aria-label="Confirm ticket and assign"
                          @click="openConfirmTicketModal(ticket)"
                        >
                          <i class="ri-checkbox-circle-line"></i>
                        </button>
                        <button
                          v-if="canEditTicket(ticket)"
                          type="button"
                          class="btn btn-soft-info btn-icon btn-sm"
                          title="Edit ticket"
                          aria-label="Edit ticket"
                          @click="openEditModal(ticket)"
                        >
                          <i class="ri-pencil-fill"></i>
                        </button>
                        <button
                          v-if="canDeleteTicket(ticket)"
                          type="button"
                          class="btn btn-soft-danger btn-icon btn-sm"
                          title="Delete ticket"
                          aria-label="Delete ticket"
                          @click="deleteModalToggle(ticket)"
                        >
                          <i class="ri-delete-bin-fill"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- Empty State -->
              <div v-if="filteredTickets.length === 0" class="text-center py-5">
                <lottie
                  class="avatar-xl mx-auto"
                  colors="primary:#405189,secondary:#0ab39c"
                  :options="defaultOptions"
                  :height="100"
                  :width="100"
                />
                <h5 class="mt-3 fw-bold">No Matching Tickets Found</h5>
                <p class="text-muted mb-3 fs-13">
                  No records matched your current query or filters.
                </p>
                <button type="button" class="btn btn-sm btn-soft-primary" @click="resetFilters">
                  <i class="ri-filter-off-line me-1"></i> Clear Filters
                </button>
              </div>
            </div>

          </BCardBody>
        </BCard>
      </BCol>
    </BRow>

    <!-- Create / Edit Ticket Modal -->
    <BModal
      v-model="modalShow"
      id="showTicketModal"
      modal-class="zoomIn"
      :title="dataEdit ? 'Edit Ticket #' + event.ref_no : 'Create New Ticket'"
      title-class="exampleModalLabel fw-bold"
      hide-footer
      header-class="p-3 bg-primary-subtle"
      class="v-modal-custom"
      size="lg"
      centered
    >
      <form @submit.prevent="handleFormSubmit" autocomplete="off">
        <BRow class="g-3">
          <!-- Subject -->
          <BCol lg="12">
            <div>
              <label for="ticketSubject" class="form-label fw-semibold">Subject / Title <span class="text-danger">*</span></label>
              <input
                type="text"
                id="ticketSubject"
                class="form-control"
                placeholder="Brief summary of the issue or feature request"
                v-model="event.subject"
                :class="{ 'is-invalid': submitted && !event.subject }"
                required
              />
              <div class="invalid-feedback">Please enter a ticket subject.</div>
            </div>
          </BCol>

          <!-- Summary / Description (Moved below Subject / Title) -->
          <BCol lg="12">
            <div>
              <label for="ticketSummary" class="form-label fw-semibold">Summary / Description <span class="text-danger">*</span></label>
              <textarea
                id="ticketSummary"
                class="form-control"
                rows="4"
                placeholder="Detailed description of the bug, steps to reproduce, or user requirements..."
                v-model="event.summary"
                :class="{ 'is-invalid': submitted && !event.summary }"
                required
              ></textarea>
              <div class="invalid-feedback">Please provide a summary or description.</div>
            </div>
          </BCol>

          <!-- System (Wired to User Access Systems) -->
          <BCol lg="6">
            <div>
              <label for="ticketSystem" class="form-label fw-semibold">System <span class="text-danger">*</span></label>
              <select id="ticketSystem" class="form-select" v-model="event.system" required>
                <option value="" disabled>Select System</option>
                <option
                  v-for="sys in lookups.systems"
                  :key="sys.id"
                  :value="sys.code || sys.name"
                >
                  {{ sys.name }} ({{ sys.code }})
                </option>
              </select>
            </div>
          </BCol>

          <!-- Severity / Priority -->
          <BCol lg="6">
            <div>
              <label for="ticketSeverity" class="form-label fw-semibold">Severity / Priority</label>
              <select id="ticketSeverity" class="form-select" v-model="event.issue_severity_id">
                <option v-for="sev in lookups.severities" :key="sev.id" :value="sev.id">
                  {{ sev.name }}
                </option>
              </select>
            </div>
          </BCol>

          <!-- Issue Type -->
          <BCol lg="6">
            <div>
              <label for="ticketIssueType" class="form-label fw-semibold">Issue Type</label>
              <select id="ticketIssueType" class="form-select" v-model="event.issue_type_id">
                <option v-for="type in lookups.types" :key="type.issue_id" :value="type.issue_id">
                  {{ type.issue_desc }}
                </option>
              </select>
            </div>
          </BCol>

          <!-- Frequency -->
          <BCol lg="6">
            <div>
              <label for="ticketFrequency" class="form-label fw-semibold">Frequency</label>
              <select id="ticketFrequency" class="form-select" v-model="event.frequency">
                <option value="Once">Once</option>
                <option value="Daily">Daily</option>
                <option value="Always">Always</option>
                <option value="Random">Random</option>
              </select>
            </div>
          </BCol>

          <!-- Date Encountered -->
          <BCol lg="12">
            <div>
              <label for="ticketEncountered" class="form-label fw-semibold">Date Encountered</label>
              <flat-pickr
                id="ticketEncountered"
                :config="dateConfig"
                placeholder="Encountered Date"
                class="form-control"
                v-model="event.date_encountered"
              />
            </div>
          </BCol>

          <!-- Drag & Drop File Attachment -->
          <BCol lg="12">
            <div>
              <label class="form-label fw-semibold d-flex align-items-center justify-content-between mb-1">
                <span><i class="ri-attachment-2 me-1"></i> File Attachment</span>
                <span class="text-muted fs-11 fw-normal">Max 10MB per file</span>
              </label>

              <!-- Drag & Drop Area -->
              <div
                class="ticket-dropzone rounded p-3 text-center border-dashed position-relative cursor-pointer"
                :class="{ 'dropzone-active': isFileDragOver }"
                @dragover.prevent="isFileDragOver = true"
                @dragleave.prevent="isFileDragOver = false"
                @drop.prevent="handleFileDrop"
                @click="triggerFileInput"
              >
                <input
                  type="file"
                  ref="fileInputRef"
                  multiple
                  class="d-none"
                  @change="handleFileSelect"
                />
                <div class="py-2">
                  <div class="mb-2">
                    <i class="ri-upload-cloud-2-line display-5 text-primary opacity-75"></i>
                  </div>
                  <h6 class="fs-13 fw-semibold mb-1">
                    Drag &amp; Drop File Attachment here or <span class="text-primary text-decoration-underline">browse</span>
                  </h6>
                  <p class="text-muted fs-11 mb-0">
                    Supports PNG, JPG, PDF, DOCX, TXT, LOG, ZIP
                  </p>
                </div>
              </div>

              <!-- Attachment Previews List -->
              <div v-if="attachedFiles.length > 0" class="vstack gap-2 mt-2">
                <div
                  v-for="(file, idx) in attachedFiles"
                  :key="idx"
                  class="border rounded p-2 d-flex align-items-center justify-content-between bg-light-subtle"
                >
                  <div class="d-flex align-items-center gap-2 min-w-0">
                    <div class="avatar-xs flex-shrink-0">
                      <span class="avatar-title bg-primary-subtle text-primary rounded fs-16">
                        <i :class="getFileIconClass(file.name)"></i>
                      </span>
                    </div>
                    <div class="min-w-0">
                      <h6 class="fs-12 mb-0 text-truncate" :title="file.name">{{ file.name }}</h6>
                      <small class="text-muted fs-10">{{ formatFileSize(file.size) }}</small>
                    </div>
                  </div>
                  <button
                    type="button"
                    class="btn btn-sm btn-ghost-danger p-1 rounded-circle"
                    @click.stop="removeAttachedFile(idx)"
                    title="Remove file"
                  >
                    <i class="ri-close-line fs-14"></i>
                  </button>
                </div>
              </div>
            </div>
          </BCol>

          <!-- Assigned Team Members (below the Drag & Drop File Attachment) -->
          <BCol lg="12">
            <div>
              <label class="form-label fw-semibold">Assigned Team Members</label>
              <Multiselect
                v-model="event.assignees"
                mode="tags"
                :close-on-select="false"
                :searchable="true"
                :options="lookups.users.map((u) => ({ value: u.id, label: u.fullname || u.name }))"
                placeholder="Select assignees"
              />
            </div>
          </BCol>
        </BRow>

        <!-- Footer -->
        <div class="modal-footer v-modal-footer mt-4 pb-0 px-0">
          <div class="hstack gap-2 justify-content-end w-100">
            <button type="button" class="btn btn-light" @click="modalShow = false">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary d-flex align-items-center gap-1" :disabled="submitting">
              <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
              <i v-else :class="dataEdit ? 'ri-save-line' : 'ri-check-line'"></i>
              <span>{{ dataEdit ? 'Save Changes' : 'Create Ticket' }}</span>
            </button>
          </div>
        </div>
      </form>
    </BModal>

    <!-- Admin Ticket Confirmation / Assignment Modal -->
    <BModal
      v-model="confirmTicketModal"
      id="confirmTicketModal"
      modal-class="zoomIn"
          title="Ticket Assignment & Approval"
      title-class="exampleModalLabel fw-bold"
      hide-footer
      header-class="p-3 bg-success-subtle"
      size="lg"
      centered
    >
      <form @submit.prevent="confirmTicketAssignment" autocomplete="off">
        <div class="mb-3">
          <div class="text-muted fs-13">
            Confirm ticket <strong>#{{ ticketToConfirm?.ref_no || ticketToConfirm?.id }}</strong>
            and assign responsible assignees.
          </div>
        </div>

        <BRow class="g-3">
          <BCol lg="12">
            <label for="confirmTicketCategory" class="form-label fw-semibold">
              Category
            </label>
            <input
              type="text"
              id="confirmTicketCategory"
              class="form-control bg-light"
              :value="confirmTicketCategory"
              readonly
            />
          </BCol>

          <BCol lg="12">
            <label class="form-label fw-semibold">
              Add Assignees (Type User or Group Name) <span class="text-danger">*</span>
            </label>
            <Multiselect
              v-model="confirmForm.assignees"
              mode="tags"
              :close-on-select="false"
              :searchable="true"
              :options="confirmAssigneeOptions"
              :multiple="true"
              label="label"
              track-by="value"
              placeholder="Select a user or group"
              required
            />
            <div class="form-text">Assigned users or groups responsible for this ticket.</div>
          </BCol>

          <BCol lg="12">
            <label class="form-label fw-semibold">Add Followers (Type User or Group Name) <span class="text-danger">*</span></label>
            <Multiselect
              v-model="confirmForm.followers"
              mode="tags"
              :close-on-select="false"
              :searchable="true"
              :options="assigneeOptions"
              :multiple="true"
              label="label"
              track-by="value"
              placeholder="Select a follower or group"
              @remove="restoreCurrentObserver"
            />
            <div class="form-text">Followers receive updates but are not assigned responsibility.</div>
          </BCol>
        </BRow>

        <div class="modal-footer v-modal-footer mt-4 pb-0 px-0">
          <div class="ticket-workflow-actions d-flex flex-wrap gap-2 justify-content-end w-100">
            <button type="button" class="btn btn-soft-danger workflow-action-btn" :disabled="confirmSubmitting" @click="confirmTicketAssignment('reject')">
              <i class="ri-close-circle-fill me-1"></i> Reject
            </button>
            <button type="button" class="btn btn-primary workflow-action-btn" :disabled="confirmSubmitting" @click="confirmTicketAssignment('confirm_authorize')">
              <i class="ri-user-follow-fill me-1"></i> Confirm &amp; Authorize
            </button>
            <button type="button" class="btn btn-success workflow-action-btn" :disabled="confirmSubmitting" @click="confirmTicketAssignment('department_approval')">
              <i class="ri-file-check-fill me-1"></i> For Dept. Approval
            </button>
            <button type="button" class="btn btn-info workflow-action-btn" :disabled="confirmSubmitting" @click="confirmTicketAssignment('authorization')">
              <i class="ri-flashlight-fill me-1"></i> For Authorization
            </button>
            <button type="button" class="btn btn-light" :disabled="confirmSubmitting" @click="confirmTicketModal = false">Cancel</button>
          </div>
        </div>
      </form>
    </BModal>

    <!-- Delete Confirmation Modal -->
    <BModal
      v-model="deleteModal"
      modal-class="zoomIn"
      hide-footer
      no-close-on-backdrop
      centered
    >
      <div class="mt-2 text-center">
        <lottie
          class="avatar-xl mx-auto"
          colors="primary:#405189,secondary:#f06548"
          :options="defaultOptions1"
          :height="80"
          :width="80"
        />
        <div class="mt-4 pt-2 fs-15 mx-4 mx-sm-5">
          <h4 class="fw-bold">Delete Ticket?</h4>
          <p class="text-muted mx-4 mb-0">
            Are you sure you want to delete ticket
            <strong>#{{ ticketToDelete?.ref_no }}</strong>? This action cannot be undone.
          </p>
        </div>
      </div>
      <div class="d-flex gap-2 justify-content-center mt-4 mb-2">
        <button type="button" class="btn w-sm btn-light" @click="deleteModal = false">
          Cancel
        </button>
        <button type="button" class="btn w-sm btn-danger" @click="confirmDelete">
          Yes, Delete It!
        </button>
      </div>
    </BModal>

    <!-- Assignment / Observer List Modal -->
    <BModal
      v-model="assignmentListModal"
      :title="assignmentListTitle"
      centered
      hide-footer
      modal-class="ticket-assignment-modal"
    >
      <div v-if="assignmentListItems.length" class="vstack gap-2">
        <div
          v-for="person in assignmentListItems"
          :key="`${person.observerType || 'user'}-${person.id}`"
          class="ticket-assignment-card border rounded p-3"
          :class="{ 'ticket-group-card': person.observerType === 'group' }"
        >
          <!-- Group Card with Member List -->
          <template v-if="person.observerType === 'group'">
            <div class="d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center gap-2 min-w-0">
                <span class="ticket-avatar flex-shrink-0 bg-info-subtle text-info">
                  <i class="ri-team-line"></i>
                </span>
                <div class="min-w-0">
                  <div class="fw-semibold text-truncate">{{ personName(person) }}</div>
                  <div class="d-flex align-items-center gap-1 mt-1">
                    <span class="badge bg-light text-muted border">Group</span>
                    <span class="badge bg-primary-subtle text-primary border border-primary-subtle">
                      {{ groupMembers(person).length }} member{{ groupMembers(person).length === 1 ? '' : 's' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Inside the group card: list the members -->
            <div class="mt-3 pt-2 border-top">
              <div class="text-muted fs-11 text-uppercase fw-semibold mb-2 d-flex align-items-center">
                <i class="ri-group-line me-1 text-primary"></i>
                <span>Members ({{ groupMembers(person).length }})</span>
              </div>
              <div v-if="groupMembers(person).length" class="vstack gap-2">
                <div
                  v-for="member in groupMembers(person)"
                  :key="member.id"
                  class="d-flex align-items-center justify-content-between p-2 rounded ticket-member-item"
                >
                  <div class="d-flex align-items-center gap-2 min-w-0">
                    <span class="ticket-avatar flex-shrink-0" style="width: 28px; height: 28px; font-size: 10px;">
                      {{ getUserInitials(member) }}
                    </span>
                    <div class="min-w-0">
                      <div class="fs-13 fw-medium text-truncate">{{ personName(member) }}</div>
                      <div v-if="member.email" class="text-muted fs-11 text-truncate">{{ member.email }}</div>
                    </div>
                  </div>
                  <span v-if="member.role" class="badge bg-light text-muted border fs-11 flex-shrink-0 ms-2">
                    {{ formatRole(member.role) }}
                  </span>
                </div>
              </div>
              <div v-else class="text-muted fs-12 fst-italic py-1">
                No members registered in this group.
              </div>
            </div>
          </template>

          <!-- Individual User Card -->
          <template v-else>
            <div class="d-flex align-items-center gap-2">
              <span class="ticket-avatar flex-shrink-0">
                {{ getUserInitials(person) }}
              </span>
              <div class="min-w-0 flex-grow-1">
                <div class="fw-semibold text-truncate">{{ personName(person) }}</div>
                <div v-if="person.email" class="text-muted fs-11 text-truncate">{{ person.email }}</div>
                <span class="badge bg-light text-muted border mt-1">{{ formatRole(person.role || 'User') }}</span>
              </div>
            </div>
          </template>
        </div>
      </div>
      <p v-else class="text-muted mb-3">No {{ assignmentListType === 'observers' ? 'observers' : 'assignees' }} assigned.</p>
      <div class="text-end mt-3">
        <button type="button" class="btn btn-secondary btn-sm" @click="assignmentListModal = false">
          Close
        </button>
      </div>
    </BModal>
  </Layout>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
.avatar-xxs {
  height: 1.5rem;
  width: 1.5rem;
  min-width: 1.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
.avatar-group-item {
  display: inline-block;
  margin-left: -0.4rem;
}
.avatar-group-item:first-child {
  margin-left: 0;
}
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

/* System Configuration & Theme Overrides (Fix for light background on dark theme) */
.form-control,
.form-select,
.flatpickr-input,
.search-box .form-control {
  background-color: var(--app-input-bg, var(--vz-input-bg, var(--vz-card-bg))) !important;
  border-color: var(--vz-input-border, var(--vz-border-color)) !important;
  color: var(--vz-body-color) !important;
  border-radius: var(--app-input-radius, 8px) !important;
  border-width: var(--app-input-border-width, 1px) !important;
}

.search-box .form-control::placeholder,
.flatpickr-input::placeholder {
  color: var(--vz-input-placeholder-color, rgba(255, 255, 255, 0.5)) !important;
}

.search-box .form-control:focus,
.flatpickr-input:focus,
.form-control:focus,
.form-select:focus {
  border-color: var(--vz-primary) !important;
  box-shadow: var(--app-input-focus-ring, 0 0 0 0.22rem rgba(var(--vz-primary-rgb), 0.22)) !important;
}

.btn {
  border-radius: var(--app-btn-radius, 8px);
}

.form-check-input {
  border-radius: var(--app-check-radius, 4px) !important;
  border-width: var(--app-check-border-width, 1.5px) !important;
}

.toolbar-container {
  background-color: transparent !important;
}

.date-filter-icon {
  pointer-events: none;
  z-index: 1;
}

.ticket-subject {
  color: var(--vz-body-color);
}

.ticket-summary {
  color: var(--vz-secondary-color);
}

/* Keep the table in its own scroll area so lazy loading can trigger reliably. */
.tickets-lazy-scroll {
  height: min(62vh, 560px);
  min-height: 260px;
  overflow-x: auto;
  overflow-y: auto;
}

.tickets-lazy-scroll thead th {
  position: sticky;
  top: 0;
  z-index: 2;
  background-color: var(--vz-table-bg, var(--vz-card-bg)) !important;
}

.ticket-grid-wrap {
  height: min(62vh, 560px);
  min-height: 260px;
}

.ticket-grid-wrap .app-grid,
.ticket-grid-wrap .app-grid__grid {
  height: 100%;
}

.ticket-grid-wrap :deep(.app-grid__grid .ag-root-wrapper) {
  border-radius: 0 !important;
}

:deep(.ticket-grid-assignees) {
  display: inline-flex;
  align-items: center;
  min-width: 0;
}

:deep(.ticket-grid-subject),
:deep(.ticket-grid-subject .ag-cell-wrapper),
:deep(.ticket-grid-subject .ag-cell-value) {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.ticket-grid-reference) {
  color: var(--vz-link-color, var(--vz-primary));
  font-weight: 600;
  text-decoration: none;
}

:deep(.ticket-grid-reference:hover) {
  color: var(--vz-link-hover-color, var(--vz-primary));
  text-decoration: underline;
}

:deep(.ticket-grid-priority) {
  line-height: 1;
  text-transform: uppercase;
}

:deep(.ticket-grid-avatar) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin-left: -5px;
  border: 2px solid var(--vz-card-bg, #fff);
  border-radius: 50%;
  background: var(--vz-primary-bg-subtle, #e8ecf7);
  color: var(--vz-primary, #405189);
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
}

:deep(.ticket-grid-avatar:first-child) { margin-left: 0; }
:deep(.ticket-grid-avatar-more) { background: var(--vz-light, #f3f6f9); }

[data-bs-theme="dark"] .ticket-subject,
[data-layout-mode="dark"] .ticket-subject {
  color: #e6edf8 !important;
}

[data-bs-theme="dark"] .ticket-summary,
[data-layout-mode="dark"] .ticket-summary {
  color: #b7c5d9 !important;
}

/* Ticket Dropzone Styling */
.ticket-dropzone {
  border: 2px dashed var(--vz-border-color, #e9ebec);
  background-color: rgba(var(--vz-light-rgb, 243, 246, 249), 0.5);
  transition: all 0.2s ease-in-out;
}

.ticket-dropzone:hover,
.ticket-dropzone.dropzone-active {
  border-color: #405189 !important;
  background-color: rgba(64, 81, 137, 0.06) !important;
}

[data-bs-theme="dark"] .ticket-dropzone,
[data-layout-mode="dark"] .ticket-dropzone {
  border-color: rgba(255, 255, 255, 0.15) !important;
  background-color: rgba(255, 255, 255, 0.02) !important;
}

[data-bs-theme="dark"] .ticket-dropzone:hover,
[data-bs-theme="dark"] .ticket-dropzone.dropzone-active,
[data-layout-mode="dark"] .ticket-dropzone:hover,
[data-layout-mode="dark"] .ticket-dropzone.dropzone-active {
  border-color: #405189 !important;
  background-color: rgba(64, 81, 137, 0.12) !important;
}

:deep(.ticket-grid-clickable) {
  cursor: pointer;
}
:deep(.ticket-grid-clickable:hover .ticket-grid-avatar) {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.15);
}
</style>

<style>
/* Unscoped global styles for modal rendered into document.body */
.ticket-assignment-modal {
  z-index: 1060 !important;
}

.ticket-assignment-modal .modal-dialog {
  z-index: 1065 !important;
}

.ticket-assignment-modal .modal-content {
  background-color: #ffffff !important;
  color: #212529 !important;
  border: 1px solid rgba(0, 0, 0, 0.175) !important;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5) !important;
  opacity: 1 !important;
}

.ticket-assignment-modal .modal-header {
  border-bottom: 1px solid #e9ebec !important;
}

[data-bs-theme="dark"] .ticket-assignment-modal .modal-content,
[data-layout-mode="dark"] .ticket-assignment-modal .modal-content {
  background-color: #212529 !important;
  color: #e9edf4 !important;
  border: 1px solid rgba(255, 255, 255, 0.16) !important;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8) !important;
}

[data-bs-theme="dark"] .ticket-assignment-modal .modal-header,
[data-layout-mode="dark"] .ticket-assignment-modal .modal-header {
  border-bottom-color: rgba(255, 255, 255, 0.12) !important;
  color: #f3f6f9 !important;
}

[data-bs-theme="dark"] .ticket-assignment-modal .modal-title,
[data-layout-mode="dark"] .ticket-assignment-modal .modal-title {
  color: #f3f6f9 !important;
}

[data-bs-theme="dark"] .ticket-assignment-modal .btn-close,
[data-layout-mode="dark"] .ticket-assignment-modal .btn-close {
  filter: invert(1) grayscale(100%) brightness(200%) !important;
}

.ticket-assignment-modal .ticket-assignment-card {
  background-color: #ffffff !important;
  border: 1px solid #e9ebec !important;
}

[data-bs-theme="dark"] .ticket-assignment-modal .ticket-assignment-card,
[data-layout-mode="dark"] .ticket-assignment-modal .ticket-assignment-card {
  background-color: #2a3036 !important;
  border-color: rgba(255, 255, 255, 0.12) !important;
  color: #f3f6f9 !important;
}

.ticket-assignment-modal .ticket-group-card {
  background-color: #f8f9fa !important;
  border: 1px solid #e9ebec !important;
}

[data-bs-theme="dark"] .ticket-assignment-modal .ticket-group-card,
[data-layout-mode="dark"] .ticket-assignment-modal .ticket-group-card {
  background-color: #1e2429 !important;
  border-color: rgba(255, 255, 255, 0.14) !important;
}

.ticket-assignment-modal .ticket-member-item {
  background-color: #ffffff !important;
  border: 1px solid #e9ebec !important;
  border-radius: 6px;
  transition: all 0.15s ease-in-out;
}

.ticket-assignment-modal .ticket-member-item:hover {
  background-color: #f3f6f9 !important;
}

[data-bs-theme="dark"] .ticket-assignment-modal .ticket-member-item,
[data-layout-mode="dark"] .ticket-assignment-modal .ticket-member-item {
  background-color: #242a30 !important;
  border-color: rgba(255, 255, 255, 0.08) !important;
  color: #ced4da !important;
}

[data-bs-theme="dark"] .ticket-assignment-modal .ticket-member-item:hover,
[data-layout-mode="dark"] .ticket-assignment-modal .ticket-member-item:hover {
  background-color: #2d343c !important;
}

.ticket-assignment-modal .ticket-avatar {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--vz-card-bg, #fff);
  border-radius: 50%;
  background: var(--vz-primary-bg-subtle, #e9eafc);
  color: var(--vz-primary, #405189);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .02em;
  text-decoration: none;
}
</style>
