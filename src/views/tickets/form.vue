<script>
import Multiselect from "@vueform/multiselect";
import "@vueform/multiselect/themes/default.css";
import flatPickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.css";
import Swal from "sweetalert2";
import axios from "axios";

import Layout from "@/layouts/main.vue";
import PageHeader from "@/components/page-header";
import {
  getSystemConfiguration,
  fetchAndApplySystemConfiguration,
} from "@/helpers/themeConfig";

export default {
  name: "TicketForm",
  components: {
    Layout,
    PageHeader,
    Multiselect,
    flatPickr,
  },
  data() {
    return {
      isEdit: false,
      ticketId: null,
      ticketCreatorId: null,
      loading: false,
      submitting: false,
      submitted: false,
      systemConfig: getSystemConfiguration() || null,

      dateConfig: {
        enableTime: false,
        dateFormat: "Y-m-d",
        altInput: true,
        altFormat: "d M, Y",
      },
      fallbackBoards: [
        { id: 1, name: "System" },
        { id: 2, name: "Support" },
        { id: 3, name: "Facilities" },
      ],

      lookups: {
        statuses: [],
        severities: [],
        types: [],
        users: [],
        menus: [],
        systems: [],
        boards: [],
        tkt_types: [],
        groups: [],
      },

      attachedFiles: [],
      existingAttachments: [],
      isFileDragOver: false,
      maxAttachmentSize: 25 * 1024 * 1024,

      form: {
        id: null,
        ref_no: "",
        subject: "",
        summary: "",
        board_id: 1,
        system: "",
        module: "tickets",
        board_status_id: null,
        issue_severity_id: null,
        issue_type_id: null,
        tkt_type_id: null,
        type_other: "",
        url: "",
        date_encountered: new Date().toISOString().split("T")[0],
        duration_to: "",
        frequency: "Once",
        assignees: [],
        followers: [],
      },
    };
  },
  computed: {
    apiBase() {
      return process.env.VUE_APP_AUTHDOMAIN || "http://localhost:8001/api";
    },
    pageTitleText() {
      if (this.isEdit) {
        return this.form.ref_no ? `Edit Ticket #${this.form.ref_no}` : "Edit Ticket";
      }
      return "Create New Ticket";
    },
    currentBoard() {
      const bList = (this.lookups.boards && this.lookups.boards.length) ? this.lookups.boards : this.fallbackBoards;
      return bList.find((b) => b.id === Number(this.form.board_id));
    },
    currentBoardName() {
      return this.currentBoard?.name || "Board";
    },
    isSystemBoard() {
      const name = this.currentBoard?.name?.toLowerCase();
      return name === "system" || Number(this.form.board_id) === 1;
    },
    usesTktType() {
      return !this.isSystemBoard;
    },
    isFacilities() {
      const name = this.currentBoard?.name?.toLowerCase();
      return name === "facilities" || Number(this.form.board_id) === 3;
    },
    isSupport() {
      const name = this.currentBoard?.name?.toLowerCase();
      return name === "support" || Number(this.form.board_id) === 2;
    },
    boardTypes() {
      const currentBoardId = Number(this.form.board_id);
      return (this.lookups.tkt_types || []).filter(
        (t) => Number(t.board_id) === currentBoardId || this.isGlobalTktType(t)
      );
    },
    availableIssueTypes() {
      const currentBoardId = Number(this.form.board_id);
      return (this.lookups.types || []).filter(
        (type) => this.isGlobalIssueType(type) || Number(type.board_id) === currentBoardId
      );
    },
    assignedSystemTicketTypes() {
      return this.getAssignedSystemTicketTypes();
    },
    facilitiesTypes() {
      return this.boardTypes;
    },
    selectedTktType() {
      return this.boardTypes.find((t) => t.id === Number(this.form.tkt_type_id));
    },
    isOtherTypeSelected() {
      const selected = this.selectedTktType;
      return selected?.code === "OTHER" || selected?.name?.toLowerCase() === "other";
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
    observerOptions() {
      return [
        ...this.lookups.users.map((user) => ({
          value: `user:${user.id}`,
          label: user.fullname || user.name,
        })),
        ...this.lookups.groups.map((group) => ({
          value: `group:${group.id}`,
          label: group.name,
        })),
      ];
    },
  },
  watch: {
    "$route.query.id"(newId) {
      this.initFormMode(newId);
    },
    "$route.params.id"(newId) {
      this.initFormMode(newId);
    },
  },
  async mounted() {
    const id = this.$route.params.id || this.$route.query.id;
    this.isEdit = Boolean(id);
    this.ticketId = id || null;
    this.loading = Boolean(id);
    this.loadSystemConfig();
    await this.fetchLookups();
    await this.initFormMode(id);
  },
  methods: {
    getAuthHeaders() {
      const token = localStorage.getItem("jwt") || localStorage.getItem("token");
      return token ? { Authorization: `Bearer ${token}` } : {};
    },

    restoreCurrentObserver(removed) {
      const currentObserver = this.currentUserId ? `user:${this.currentUserId}` : null;
      const removedValue = typeof removed === "string" ? removed : removed?.value;
      const isCreator = this.isEdit
        ? Number(this.ticketCreatorId) === this.currentUserId
        : Boolean(this.currentUserId);
      if (isCreator && currentObserver && removedValue === currentObserver) {
        this.$nextTick(() => {
          if (!this.form.followers.includes(currentObserver)) {
            this.form.followers.push(currentObserver);
          }
        });
      }
    },

    getDefaultTicketTypeId() {
      const jobRequestForm = this.availableIssueTypes.find((type) =>
        String(type.issue_desc || type.name || type.code || "")
          .trim()
          .toLowerCase() === "job request form"
      );
      return jobRequestForm?.issue_id || this.availableIssueTypes[0]?.issue_id || null;
    },

    getDefaultCategoryId() {
      const rawUser = sessionStorage.getItem("authUser") || localStorage.getItem("user");
      try {
        const user = rawUser ? JSON.parse(rawUser) : null;
        const assignment = (user?.assignments || []).find(
          (item) => item.reference === "category" && Boolean(item.default)
        );
        return assignment?.reference_code ? Number(assignment.reference_code) : null;
      } catch (error) {
        return null;
      }
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

    getAssignedSystemTicketTypes(boardId = Number(this.form.board_id)) {
      const assignedCodes = new Set(
        (this.lookups.systems || []).map((system) =>
          String(system.code || "").trim().toUpperCase()
        )
      );
      return (this.lookups.tkt_types || []).filter(
        (type) => {
          if (this.isGlobalTktType(type)) return true;
          return (
            Number(type.board_id) === Number(boardId) &&
            assignedCodes.has(String(type.code || "").trim().toUpperCase())
          );
        }
      );
    },

    isGlobalTktType(type) {
      return type?.board_id === null || type?.board_id === undefined || type?.board_id === "";
    },

    getDefaultSystemTicketTypeId(boardId = Number(this.form.board_id)) {
      const defaultSystem = (this.lookups.systems || []).find((system) => system.is_default);
      const defaultCode = String(defaultSystem?.code || "").trim().toUpperCase();
      const systemTypes = this.getAssignedSystemTicketTypes(boardId);
      const matchingType = systemTypes.find(
        (type) => String(type.code || "").trim().toUpperCase() === defaultCode
      );
      return (
        matchingType?.id ||
        systemTypes.find((type) => !this.isGlobalTktType(type))?.id ||
        systemTypes[0]?.id ||
        null
      );
    },

    syncSystemFromTicketType() {
      const selectedType = this.assignedSystemTicketTypes.find(
        (type) => Number(type.id) === Number(this.form.tkt_type_id)
      );
      this.form.system = selectedType?.code || selectedType?.name || "";
    },

    async loadSystemConfig() {
      try {
        const config = await fetchAndApplySystemConfiguration();
        if (config) {
          this.systemConfig = config;
          if (config.date_format === "MM/DD/YYYY") {
            this.dateConfig.altFormat = "m/d/Y";
          } else if (config.date_format === "DD/MM/YYYY") {
            this.dateConfig.altFormat = "d/m/Y";
          } else if (config.date_format === "YYYY-MM-DD") {
            this.dateConfig.altFormat = "Y-m-d";
          }
        }
      } catch (e) {
        console.warn("Failed to load system config in ticket form:", e);
      }
    },

    async fetchLookups() {
      try {
        const res = await axios.get(`${this.apiBase}/tickets/lookups`, {
          headers: this.getAuthHeaders(),
        });
        if (res.data) {
          this.lookups = {
            statuses: res.data.statuses || [],
            severities: res.data.severities || [],
            types: res.data.types || [],
            users: res.data.users || [],
            menus: res.data.menus || [],
            systems: res.data.systems || [],
            boards: res.data.boards || [],
            tkt_types: res.data.tkt_types || [],
            groups: res.data.groups || [],
          };
        }

        // Fetch user assigned systems
        try {
          const sysRes = await axios.get(`${this.apiBase}/user/systems`, {
            headers: this.getAuthHeaders(),
          });
          if (Array.isArray(sysRes.data?.data)) {
            this.lookups.systems = sysRes.data.data;
          }
        } catch (e) {
          // Keep systems from lookups
        }

        // Ensure tkt_types are loaded
        if (!this.lookups.tkt_types || this.lookups.tkt_types.length === 0) {
          try {
            const typesRes = await axios.get(`${this.apiBase}/tkt-types`, {
              headers: this.getAuthHeaders(),
            });
            if (typesRes.data?.data && typesRes.data.data.length > 0) {
              this.lookups.tkt_types = typesRes.data.data;
            }
          } catch (e) {
            console.warn("Failed to fetch tkt-types from api:", e);
          }
        }

        // Set defaults if creating new
        if (!this.isEdit) {
          const defaultSys =
            (this.lookups.systems || []).find((s) => s.is_default) ||
            (this.lookups.systems || [])[0];
          if (defaultSys && !this.form.system && !this.isFacilities) {
            this.form.system = defaultSys.code || defaultSys.name;
          }
          if (this.lookups.severities.length > 0 && !this.form.issue_severity_id) {
            this.form.issue_severity_id = this.lookups.severities[0].id;
          }
          if (this.lookups.types.length > 0 && !this.form.issue_type_id) {
            this.form.issue_type_id = this.getDefaultTicketTypeId();
          }
        }
      } catch (err) {
        console.error("Failed to fetch lookups:", err);
      }
    },

    async initFormMode(id) {
      if (id) {
        this.isEdit = true;
        this.ticketId = id;
        await this.loadTicket(id);
      } else {
        this.isEdit = false;
        this.ticketId = null;
        this.ticketCreatorId = this.currentUserId;
        this.resetForm();
      }
    },

    onBoardChange() {
      if (!this.availableIssueTypes.some((type) => Number(type.issue_id) === Number(this.form.issue_type_id))) {
        this.form.issue_type_id = this.getDefaultTicketTypeId();
      }
      if (this.usesTktType) {
        this.form.system = this.currentBoardName || "Support";
        this.form.issue_type_id = this.getDefaultTicketTypeId();
        if (this.boardTypes.length > 0) {
          this.form.tkt_type_id = this.boardTypes[0].id;
        } else {
          this.form.tkt_type_id = null;
        }
        this.form.type_other = "";
        this.form.url = "";
      } else {
        this.form.tkt_type_id = this.getDefaultSystemTicketTypeId();
        this.syncSystemFromTicketType();
        this.form.type_other = "";
        this.form.issue_type_id = this.getDefaultTicketTypeId();
      }
    },

    isGlobalIssueType(type) {
      return type?.board_id === null || type?.board_id === undefined || type?.board_id === "";
    },

    resetForm() {
      const defaultSys =
        (this.lookups.systems || []).find((s) => s.is_default) ||
        (this.lookups.systems || [])[0];

      let initBoardId = this.getDefaultCategoryId() || 1;
      if (this.$route.query.board_id) {
        initBoardId = Number(this.$route.query.board_id);
      } else if (this.$route.query.board) {
        const bName = this.$route.query.board.toLowerCase();
        const found = (this.lookups.boards && this.lookups.boards.length ? this.lookups.boards : this.fallbackBoards).find(
          (b) => b.name.toLowerCase() === bName
        );
        if (found) {
          initBoardId = found.id;
        } else if (bName === "support") {
          initBoardId = 2;
        } else if (bName === "facilities") {
          initBoardId = 3;
        }
      }

      const boardObj = (this.lookups.boards && this.lookups.boards.length ? this.lookups.boards : this.fallbackBoards).find(
        (b) => b.id === initBoardId
      );
      const isSys = (boardObj?.name?.toLowerCase() === "system") || initBoardId === 1;
      const initialTypes = (this.lookups.tkt_types || []).filter((t) => Number(t.board_id) === initBoardId);

      this.form = {
        id: null,
        ref_no: "",
        subject: "",
        summary: "",
        board_id: initBoardId,
        system: !isSys ? (boardObj?.name || "Support") : (defaultSys ? (defaultSys.code || defaultSys.name) : ""),
        module: "tickets",
        board_status_id: this.$route.query.stage_id ? Number(this.$route.query.stage_id) : null,
        issue_severity_id: this.lookups.severities[0]?.id || null,
        issue_type_id: this.getDefaultTicketTypeId(),
        tkt_type_id: isSys ? this.getDefaultSystemTicketTypeId(initBoardId) : (initialTypes[0]?.id || null),
        type_other: "",
        url: "",
        date_encountered: new Date().toISOString().split("T")[0],
        duration_to: "",
        frequency: "Once",
        assignees: [],
        followers: this.currentUserId ? [`user:${this.currentUserId}`] : [],
      };
      this.attachedFiles = [];
      this.existingAttachments = [];
      this.submitted = false;
      if (isSys) {
        this.syncSystemFromTicketType();
      }
    },

    async loadTicket(id) {
      this.loading = true;
      try {
        const res = await axios.get(`${this.apiBase}/tickets/${id}`, {
          headers: this.getAuthHeaders(),
        });
        const ticket = res.data?.data;
        if (ticket) {
          this.ticketCreatorId = ticket.created_by || null;
          if (!this.isAdmin && Number(ticket.created_by) !== this.currentUserId) {
            await Swal.fire({
              icon: "warning",
              title: "Edit Not Allowed",
              text: "Only the ticket owner can edit this ticket.",
              confirmButtonClass: "btn btn-primary",
            });
            await this.$router.replace(`/tickets/details?id=${ticket.id}`);
            return;
          }
          const status = String(ticket.status_name || ticket.board_status?.name || "").toLowerCase();
          if (!this.isAdmin && status !== "new") {
            await Swal.fire({
              icon: "warning",
              title: "Edit Not Allowed",
              text: "Only tickets with NEW status can be edited.",
              confirmButtonClass: "btn btn-primary",
            });
            await this.$router.replace(`/tickets/details?id=${ticket.id}`);
            return;
          }
          this.form = {
            id: ticket.id,
            ref_no: ticket.ref_no || "",
            subject: ticket.subject || "",
            summary: ticket.summary || "",
            board_id: ticket.board_id || (ticket.system === "Facilities" ? 3 : 1),
            system: ticket.system || "",
            module: ticket.module || "tickets",
            board_status_id: ticket.board_status_id || null,
            issue_severity_id: ticket.issue_severity_id || null,
            issue_type_id: ticket.issue_type_id || null,
            tkt_type_id: ticket.tkt_type_id || null,
            type_other: ticket.type_other || "",
            url: ticket.url || "",
            date_encountered: ticket.date_encountered ? ticket.date_encountered.substring(0, 10) : "",
            duration_to: ticket.duration_to ? ticket.duration_to.substring(0, 10) : "",
            frequency: ticket.frequency || "Once",
            assignees: [
              ...(ticket.assignees || []).map((u) => `user:${u.id}`),
              ...(ticket.group_id ? [`group:${ticket.group_id}`] : []),
            ],
            followers: [
              ...(ticket.tagged_users || []).map((u) => `user:${u.id}`),
              ...(ticket.tagged_groups || []).map((g) => `group:${g.id}`),
            ],
          };
          if (Number(ticket.created_by) === this.currentUserId && this.currentUserId) {
            this.form.followers = [...new Set([...this.form.followers, `user:${this.currentUserId}`])];
          }
          this.existingAttachments = ticket.attachments || [];
        }
      } catch (err) {
        console.error("Failed to load ticket:", err);
        Swal.fire({
          icon: "error",
          title: "Error Loading Ticket",
          text: err.response?.data?.message || "Could not retrieve ticket details.",
          confirmButtonClass: "btn btn-primary",
        }).then(() => {
          this.$router.push("/tickets/list");
        });
      } finally {
        this.loading = false;
      }
    },

    onNonSystemToggleChange() {
      if (this.isNonSystem) {
        if (!this.nonSystemOptions.some((o) => o.value === this.form.system)) {
          this.form.system = "Facilities";
        }
      } else {
        const defaultSys =
          (this.lookups.systems || []).find((s) => s.is_default) ||
          (this.lookups.systems || [])[0];
        this.form.system = defaultSys ? (defaultSys.code || defaultSys.name) : "";
      }
    },

    triggerFileInput() {
      if (this.$refs.fileInputRef) {
        this.$refs.fileInputRef.click();
      }
    },

    handleFileDrop(e) {
      this.isFileDragOver = false;
      const files = Array.from(e.dataTransfer.files || []);
      this.addFiles(files);
    },

    handleFileSelect(e) {
      const files = Array.from(e.target.files || []);
      this.addFiles(files);
    },

    addFiles(files) {
      const oversizedFiles = files.filter((file) => file.size > this.maxAttachmentSize);
      if (oversizedFiles.length) {
        Swal.fire({
          icon: "warning",
          title: "Attachment too large",
          text: `Each attachment must be 25 MB or smaller. Remove ${oversizedFiles.map((file) => file.name).join(", ")} and try again.`,
        });
      }

      files.forEach((f) => {
        if (f.size <= this.maxAttachmentSize && !this.attachedFiles.some((existing) => existing.name === f.name && existing.size === f.size)) {
          this.attachedFiles.push(f);
        }
      });
    },

    removeAttachedFile(idx) {
      this.attachedFiles.splice(idx, 1);
    },

    async removeExistingAttachment(att, idx) {
      const confirmed = await Swal.fire({
        title: "Remove attachment?",
        text: `Delete "${att.filename}"?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete",
        confirmButtonClass: "btn btn-danger",
        cancelButtonClass: "btn btn-light",
      });

      if (!confirmed.isConfirmed) return;

      try {
        await axios.delete(`${this.apiBase}/tickets/${this.ticketId}/attachments/${att.id}`, {
          headers: this.getAuthHeaders(),
        });
        this.existingAttachments.splice(idx, 1);
        Swal.fire({
          icon: "success",
          title: "Removed",
          text: "Attachment has been removed.",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (e) {
        // Fallback local splice if endpoint isn't present
        this.existingAttachments.splice(idx, 1);
      }
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

    async handleSubmit() {
      this.submitted = true;
      if (
        !this.form.subject ||
        !this.form.summary ||
        !this.form.issue_type_id ||
        !this.form.date_encountered ||
        !(this.form.followers || []).length
      ) {
        return;
      }

      if (this.usesTktType) {
        if (!this.form.tkt_type_id) {
          return;
        }
      } else {
        if (!this.form.system || !this.form.tkt_type_id) {
          return;
        }
      }

      if (this.isOtherTypeSelected && !this.form.type_other) {
        return;
      }

      this.submitting = true;
      try {
        const payload = new FormData();
        payload.append("subject", this.form.subject);
        payload.append("summary", this.form.summary);
        payload.append("module", this.form.module || "tickets");
        if (this.form.board_id) {
          payload.append("board_id", this.form.board_id);
        }

        if (this.usesTktType) {
          payload.append("system", this.currentBoardName || "Support");
          if (this.form.tkt_type_id) {
            payload.append("tkt_type_id", this.form.tkt_type_id);
          }
          if (this.form.issue_type_id) {
            payload.append("issue_type_id", this.form.issue_type_id);
          }
        } else {
          payload.append("system", this.form.system);
          payload.append("tkt_type_id", this.form.tkt_type_id);
          if (this.form.issue_type_id) {
            payload.append("issue_type_id", this.form.issue_type_id);
          }
        }

        if (this.isOtherTypeSelected && this.form.type_other) {
          payload.append("type_other", this.form.type_other);
        }

        if (this.form.board_status_id) {
          payload.append("board_status_id", this.form.board_status_id);
        }
        if (this.form.issue_severity_id) {
          payload.append("issue_severity_id", this.form.issue_severity_id);
        }
        if (this.form.date_encountered) {
          payload.append("date_encountered", this.form.date_encountered);
        }
        if (this.form.duration_to) {
          payload.append("duration_to", this.form.duration_to);
        }
        if (this.isSystemBoard && this.form.url?.trim()) {
          payload.append("url", this.form.url.trim());
        }
        payload.append("frequency", this.form.frequency || "Once");

        const followerUsers = (this.form.followers || [])
          .filter((value) => String(value).startsWith("user:"))
          .map((value) => Number(String(value).replace("user:", "")));
        const followerGroups = (this.form.followers || [])
          .filter((value) => String(value).startsWith("group:"))
          .map((value) => Number(String(value).replace("group:", "")));
        followerUsers.forEach((userId, i) => payload.append(`followers[${i}]`, userId));
        followerGroups.forEach((groupId, i) => payload.append(`follower_groups[${i}]`, groupId));

        const responsibleUsers = (this.form.assignees || [])
          .filter((value) => String(value).startsWith("user:"))
          .map((value) => Number(String(value).replace("user:", "")));
        const responsibleGroups = (this.form.assignees || [])
          .filter((value) => String(value).startsWith("group:"))
          .map((value) => Number(String(value).replace("group:", "")));
        responsibleUsers.forEach((userId, i) => payload.append(`assignees[${i}]`, userId));
        responsibleGroups.forEach((groupId, i) => {
          payload.append(`assigned_groups[${i}]`, groupId);
          payload.append(`follower_groups[${followerGroups.length + i}]`, groupId);
          payload.append(`tagged_groups[${followerGroups.length + i}]`, groupId);
        });
        if (responsibleGroups[0]) payload.append("group_id", responsibleGroups[0]);

        this.attachedFiles.forEach((file) => {
          payload.append("attachments[]", file);
        });

        if (this.isEdit && this.ticketId) {
          await axios.post(`${this.apiBase}/tickets/${this.ticketId}`, payload, {
            headers: this.getAuthHeaders(),
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
            headers: this.getAuthHeaders(),
          });
          Swal.fire({
            icon: "success",
            title: "Created!",
            text: "New ticket has been created successfully.",
            timer: 2000,
            showConfirmButton: false,
          });
        }

        // Navigate back to ticket list or kanban
        if (this.$route.query.return === "kanban") {
          this.$router.push("/kanban");
        } else {
          this.$router.push("/tickets/list");
        }
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

    handleCancel() {
      if (this.$route.query.return === "kanban") {
        this.$router.push("/kanban");
      } else {
        this.$router.push("/tickets/list");
      }
    },
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="pageTitleText" pageTitle="Tickets" />

    <!-- Main Form Card -->
    <BRow class="justify-content-center">
      <BCol lg="10" xl="9">
        <BCard no-body class="shadow-sm border-0">
          <BCardHeader class="border-0 bg-light-subtle py-3 px-4 d-flex align-items-center justify-content-between gap-3">
            <div class="d-flex align-items-center gap-2">
              <div class="avatar-xs flex-shrink-0">
                <span class="avatar-title bg-primary-subtle text-primary rounded-circle fs-16">
                  <i :class="isEdit ? 'ri-edit-2-line' : 'ri-ticket-2-line'"></i>
                </span>
              </div>
              <div>
                <h5 class="card-title mb-0 fw-bold">
                  {{ isEdit ? 'Update Ticket Details' : 'Ticket Information' }}
                </h5>
                <small class="text-muted">
                  {{ isEdit ? 'Modify ticket attributes and manage attachments.' : 'Create a new support ticket and assign it to team members.' }}
                </small>
              </div>
            </div>
            <div class="ms-auto d-flex flex-column align-items-end gap-1">
              <button
                type="button"
                class="btn btn-sm btn-primary d-flex align-items-center gap-1 shadow-sm"
                @click="handleCancel"
              >
                <i class="ri-arrow-left-line"></i>
                <span>Back to Tickets</span>
              </button>
              <small class="text-muted fs-12 text-end">
                Fields marked with <span class="text-danger fw-bold">*</span> are mandatory
              </small>
            </div>
          </BCardHeader>

          <BCardBody class="p-4">
            <div v-if="loading" class="alert alert-primary d-flex align-items-center gap-2 py-2 mb-3" role="status">
              <span class="spinner-border spinner-border-sm flex-shrink-0" aria-hidden="true"></span>
              <span>Loading ticket data&hellip;</span>
            </div>

            <form @submit.prevent="handleSubmit" autocomplete="off" :aria-busy="loading">
              <fieldset
                class="ticket-form-fieldset"
                :class="{ 'ticket-form-loading': loading }"
                :disabled="loading || submitting"
              >
              <BRow class="g-3">
                <!-- Subject / Title * (At top) -->
                <BCol lg="6">
                  <div>
                    <label for="ticketSubject" class="form-label fw-semibold">
                      Subject / Title <span class="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      id="ticketSubject"
                      class="form-control"
                      placeholder="Brief summary of the issue or feature request"
                      v-model="form.subject"
                      :class="{ 'is-invalid': submitted && !form.subject }"
                      required
                    />
                    <div class="invalid-feedback">Please enter a ticket subject.</div>
                  </div>
                </BCol>

                <!-- Category Selection (System, Support, Facilities) -->
                <BCol lg="6">
                  <div>
                    <label for="ticketBoard" class="form-label fw-semibold">
                      Category <span class="text-danger">*</span>
                    </label>
                    <select
                      id="ticketBoard"
                      class="form-select"
                      v-model="form.board_id"
                      @change="onBoardChange"
                      required
                    >
                      <option
                        v-for="b in (lookups.boards && lookups.boards.length ? lookups.boards : fallbackBoards)"
                        :key="b.id"
                        :value="b.id"
                      >
                        {{ b.name }}
                      </option>
                    </select>
                  </div>
                </BCol>

                <!-- Summary / Description * (Moved below Subject / Title) -->
                <BCol lg="12">
                  <div>
                    <label for="ticketSummary" class="form-label fw-semibold">
                      Summary / Description <span class="text-danger">*</span>
                    </label>
                    <textarea
                      id="ticketSummary"
                      class="form-control"
                      rows="5"
                      placeholder="Detailed description of the bug, steps to reproduce, or user requirements..."
                      v-model="form.summary"
                      :class="{ 'is-invalid': submitted && !form.summary }"
                      required
                    ></textarea>
                    <div class="invalid-feedback">Please provide a summary or description.</div>
                  </div>
                </BCol>

                <!-- Ticket Type (tkt_issue_types) -->
                <BCol lg="6" md="6" sm="12">
                  <div>
                    <label for="ticketType" class="form-label fw-semibold">
                      Ticket Type <span class="text-danger">*</span>
                    </label>
                    <select
                      id="ticketType"
                      class="form-select"
                      v-model="form.issue_type_id"
                      :class="{ 'is-invalid': submitted && !form.issue_type_id }"
                      required
                    >
                      <option :value="null" disabled>Select Ticket Type</option>
                      <option v-for="type in availableIssueTypes" :key="type.issue_id" :value="type.issue_id">
                        {{ type.issue_desc }}
                      </option>
                    </select>
                    <div v-if="submitted && !form.issue_type_id" class="invalid-feedback">
                      Please select a ticket type.
                    </div>
                  </div>
                </BCol>

                <!-- Board-specific type (tkt_type) -->
                <BCol lg="6" md="6" sm="12">
                  <div>
                    <label for="boardSpecificType" class="form-label fw-semibold">
                      {{ isSystemBoard ? 'System' : 'Issue Type' }} <span class="text-danger">*</span>
                    </label>
                    <select
                      id="boardSpecificType"
                      class="form-select"
                      v-model="form.tkt_type_id"
                      @change="isSystemBoard ? syncSystemFromTicketType() : null"
                      :class="{ 'is-invalid': submitted && !form.tkt_type_id }"
                      required
                    >
                      <option :value="null" disabled>
                        Select {{ isSystemBoard ? 'System' : currentBoardName + ' Issue Type' }}
                      </option>
                      <option
                        v-for="type in (isSystemBoard ? assignedSystemTicketTypes : boardTypes)"
                        :key="type.id"
                        :value="type.id"
                      >
                        {{ type.name }}<template v-if="isSystemBoard"> ({{ type.code }})</template>
                      </option>
                    </select>
                    <div class="invalid-feedback">
                      Please select {{ isSystemBoard ? 'an assigned system' : 'an issue type' }}.
                    </div>
                  </div>
                </BCol>

                <!-- If 'Other' is selected: shown immediately after Issue Type -->
                <BCol lg="12" cols="12" v-if="isOtherTypeSelected">
                  <div>
                    <label for="boardTypeOther" class="form-label fw-semibold">
                      Please specify other type <span class="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      id="boardTypeOther"
                      class="form-control"
                      placeholder="Enter custom type..."
                      v-model="form.type_other"
                      :class="{ 'is-invalid': submitted && !form.type_other }"
                      required
                    />
                    <div class="invalid-feedback">Please specify the type.</div>
                  </div>
                </BCol>

                <!-- Severity / Priority -->
                <BCol lg="6" md="6" sm="12">
                  <div>
                    <label for="ticketSeverity" class="form-label fw-semibold">
                      Severity / Priority
                    </label>
                    <select id="ticketSeverity" class="form-select" v-model="form.issue_severity_id">
                      <option v-for="sev in lookups.severities" :key="sev.id" :value="sev.id">
                        {{ sev.name }}
                      </option>
                    </select>
                  </div>
                </BCol>

                <!-- Frequency -->
                <BCol :lg="isFacilities ? 6 : 6" md="6" sm="12">
                  <div>
                    <label for="ticketFrequency" class="form-label fw-semibold">
                      Frequency
                    </label>
                    <select id="ticketFrequency" class="form-select" v-model="form.frequency">
                      <option value="Once">Once</option>
                      <option value="Daily">Daily</option>
                      <option value="Always">Always</option>
                      <option value="Random">Random</option>
                    </select>
                  </div>
                </BCol>

                <!-- Date Encountered -->
                <BCol :lg="isSystemBoard ? 4 : 6">
                  <div>
                    <label for="ticketEncountered" class="form-label fw-semibold">
                      Date Encountered <span class="text-danger">*</span>
                    </label>
                    <div class="input-group">
                      <flat-pickr
                        id="ticketEncountered"
                        :config="dateConfig"
                        placeholder="Select encountered date"
                        class="form-control"
                        v-model="form.date_encountered"
                        :class="{ 'is-invalid': submitted && !form.date_encountered }"
                        required
                      />
                      <span class="input-group-text" aria-hidden="true">
                        <i class="ri-calendar-line"></i>
                      </span>
                    </div>
                    <div class="invalid-feedback">Please select the date encountered.</div>
                  </div>
                </BCol>

                <!-- Date Needed (optional) -->
                <BCol :lg="isSystemBoard ? 4 : 6">
                  <div>
                    <label for="ticketDateNeeded" class="form-label fw-semibold">Date Needed</label>
                    <div class="input-group">
                      <flat-pickr
                        id="ticketDateNeeded"
                        :config="dateConfig"
                        placeholder="Select needed date (optional)"
                        class="form-control"
                        v-model="form.duration_to"
                      />
                      <span class="input-group-text" aria-hidden="true">
                        <i class="ri-calendar-line"></i>
                      </span>
                    </div>
                  </div>
                </BCol>

                <!-- URL / Context (System board only) -->
                <BCol lg="4" v-if="isSystemBoard">
                  <div>
                    <label for="ticketUrl" class="form-label fw-semibold">URL / Context</label>
                    <input
                      id="ticketUrl"
                      type="text"
                      class="form-control"
                      placeholder="Paste a URL or enter relevant context"
                      v-model="form.url"
                      maxlength="255"
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

                    <!-- Dropzone -->
                    <div
                      class="ticket-dropzone rounded p-4 text-center border-dashed position-relative cursor-pointer"
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
                          <i class="ri-upload-cloud-2-line display-4 text-primary opacity-75"></i>
                        </div>
                        <h6 class="fs-14 fw-semibold mb-1">
                          Drag &amp; Drop File Attachment here or <span class="text-primary text-decoration-underline">browse</span>
                        </h6>
                        <p class="text-muted fs-12 mb-0">
                          Supports PNG, JPG, PDF, DOCX, TXT, LOG, ZIP
                        </p>
                      </div>
                    </div>

                    <!-- Newly Added Files -->
                    <div v-if="attachedFiles.length > 0" class="vstack gap-2 mt-3">
                      <span class="fs-12 fw-semibold text-muted text-uppercase">New Uploads ({{ attachedFiles.length }})</span>
                      <div
                        v-for="(file, idx) in attachedFiles"
                        :key="idx"
                        class="border rounded p-2 px-3 d-flex align-items-center justify-content-between bg-light-subtle shadow-xs"
                      >
                        <div class="d-flex align-items-center gap-2 min-w-0">
                          <div class="avatar-xs flex-shrink-0">
                            <span class="avatar-title bg-primary-subtle text-primary rounded fs-16">
                              <i :class="getFileIconClass(file.name)"></i>
                            </span>
                          </div>
                          <div class="min-w-0">
                            <h6 class="fs-13 mb-0 text-truncate" :title="file.name">{{ file.name }}</h6>
                            <small class="text-muted fs-11">{{ formatFileSize(file.size) }}</small>
                          </div>
                        </div>
                        <button
                          type="button"
                          class="btn btn-sm btn-ghost-danger p-1 rounded-circle"
                          @click.stop="removeAttachedFile(idx)"
                          title="Remove file"
                        >
                          <i class="ri-close-line fs-16"></i>
                        </button>
                      </div>
                    </div>

                    <!-- Existing Attachments (in edit mode) -->
                    <div v-if="isEdit && existingAttachments.length > 0" class="vstack gap-2 mt-3">
                      <span class="fs-12 fw-semibold text-muted text-uppercase">Existing Attachments ({{ existingAttachments.length }})</span>
                      <div
                        v-for="(att, idx) in existingAttachments"
                        :key="att.id"
                        class="border rounded p-2 px-3 d-flex align-items-center justify-content-between bg-light-subtle shadow-xs"
                      >
                        <div class="d-flex align-items-center gap-2 min-w-0">
                          <div class="avatar-xs flex-shrink-0">
                            <span class="avatar-title bg-info-subtle text-info rounded fs-16">
                              <i :class="getFileIconClass(att.filename)"></i>
                            </span>
                          </div>
                          <div class="min-w-0">
                            <h6 class="fs-13 mb-0 text-truncate" :title="att.filename">{{ att.filename }}</h6>
                            <small class="text-muted fs-11">Uploaded file</small>
                          </div>
                        </div>
                        <div class="d-flex align-items-center gap-1">
                          <a
                            v-if="att.path"
                            :href="`${apiBase}/../storage/${att.path}`"
                            target="_blank"
                            class="btn btn-sm btn-ghost-primary p-1 rounded-circle"
                            title="Download/View file"
                          >
                            <i class="ri-download-2-line fs-16"></i>
                          </a>
                          <button
                            type="button"
                            class="btn btn-sm btn-ghost-danger p-1 rounded-circle"
                            @click.stop="removeExistingAttachment(att, idx)"
                            title="Delete attachment"
                          >
                            <i class="ri-delete-bin-line fs-16"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </BCol>

                <!-- Observers and Responsible Assignment -->
                <BCol lg="12">
                  <div>
                    <label class="form-label fw-semibold">
                      Observers (Tagged Users or Groups) <span class="text-danger">*</span>
                    </label>
                    <Multiselect
                      v-model="form.followers"
                      mode="tags"
                      :close-on-select="false"
                      :searchable="true"
                      :options="observerOptions"
                      label="label"
                      track-by="value"
                      placeholder="Select observers to tag"
                      @remove="restoreCurrentObserver"
                    />
                    <div v-if="submitted && !(form.followers || []).length" class="invalid-feedback d-block">
                      Please select at least one observer.
                    </div>
                  </div>
                </BCol>

                <BCol v-if="(form.assignees || []).length" lg="6">
                  <div>
                    <label class="form-label fw-semibold">Responsible (User or Group)</label>
                    <Multiselect
                      v-model="form.assignees"
                      mode="tags"
                      :close-on-select="false"
                      :searchable="true"
                      :options="observerOptions"
                      label="label"
                      track-by="value"
                      placeholder="Select responsible user or group"
                    />
                  </div>
                </BCol>

                <BCol lg="12">
                  <hr class="form-section-divider" />
                </BCol>

              </BRow>

              <!-- Actions Bottom Bar -->
              <div class="d-flex align-items-center justify-content-end gap-2 mt-4 pt-3 border-top">
                <button
                  type="button"
                  class="btn btn-light px-4"
                  @click="handleCancel"
                  :disabled="submitting"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="btn btn-primary d-inline-flex align-items-center gap-1 px-4 shadow-sm"
                  :disabled="loading || submitting"
                >
                  <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
                  <i v-else :class="isEdit ? 'ri-save-line' : 'ri-check-line'"></i>
                  <span>{{ isEdit ? 'Save Changes' : 'Create Ticket' }}</span>
                </button>
              </div>
              </fieldset>
            </form>
          </BCardBody>
        </BCard>
      </BCol>
    </BRow>
  </Layout>
</template>

<style scoped>
.ticket-form-fieldset {
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}

.ticket-form-fieldset.ticket-form-loading {
  pointer-events: none;
  cursor: wait;
}

.form-section-divider {
  border-color: var(--vz-border-color);
  opacity: 0.75;
  margin: 0.25rem 0;
}

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

.cursor-pointer {
  cursor: pointer;
}

.shadow-xs {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>
