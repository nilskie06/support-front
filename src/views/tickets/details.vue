<script>
import axios from "axios";
import Swal from "sweetalert2";
import Multiselect from "@vueform/multiselect";
import "@vueform/multiselect/themes/default.css";
import Layout from "@/layouts/main.vue";
import PageHeader from "@/components/page-header";

export default {
  name: "TicketDetails",
  components: { Layout, PageHeader, Multiselect },
  data() {
    return {
      ticket: {
        comments: [],
        logs: [],
        resolutions: [],
        attachments: [],
        assignees: [],
        tagged_users: [],
        tagged_groups: [],
      },
      loading: true,
      error: "",
      commentMessage: "",
      activityTab: "comments",
      replyingTo: null,
      commentSubmitting: false,
      commentError: "",
      commentFiles: [],
      commentDragOver: false,
      commentTemplateOpen: false,
      commentTemplateSearch: "",
      mentionOpen: false,
      mentionQuery: "",
      commentTemplates: [
        {
          title: "Acknowledge — Looking into it",
          body: "Hi {{requester_name}}, Thanks for reporting ticket {{ref_no}}. I am looking into it now and will follow up shortly.",
        },
        {
          title: "Need more info",
          body: "Hi {{requester_name}}, To investigate {{ref_no}} effectively I need a bit more information: - When did this start? - What error did you see?",
        },
        {
          title: "Ready for user testing",
          body: "Hi {{requester_name}}, The fix for {{ref_no}} is deployed. Please verify on your end and let us know if everything looks good.",
        },
      ],
      referenceCopied: false,
      assignmentModal: false,
      assignmentSubmitting: false,
      assignmentError: "",
      assignmentLookups: { users: [], groups: [] },
      assignmentForm: { assignees: [], followers: [] },
      assignmentListModal: false,
      assignmentListType: "assignees",
      boardStatuses: [],
      statusUpdating: false,
      statusError: "",
      menuPermissions: [],
      resolutionModal: false,
      resolutionSubmitting: false,
      resolutionError: "",
      resolutionForm: {
        resolution: "",
        root_cause: "",
        prevent_recurrence: "",
      },
      resolutionFiles: [],
      resolutionDragOver: false,
      durationTimer: null,
      durationNow: Date.now(),
      durationSubmitting: false,
      durationError: "",
      durationForm: { duration_from: "", duration_to: "" },
      attachmentPreviewModal: false,
      attachmentPreviewFile: null,
    };
  },
  computed: {
    apiBase() {
      return process.env.VUE_APP_AUTHDOMAIN || "http://localhost:8001/api";
    },
    ticketId() {
      return this.$route.query.id;
    },
    pageTitle() {
      return this.ticket?.ref_no ? `Ticket #${this.ticket.ref_no}` : "Ticket Details";
    },
    boardName() {
      const names = { 1: "System", 2: "Support", 3: "Facilities" };
      return names[Number(this.ticket?.board_id)] || "Unassigned";
    },
    statusClass() {
      const color = this.ticket?.board_status?.color || this.ticket?.status_color || "secondary";
      return color.startsWith("#") || color.startsWith("rgb") ? "status-stage-custom" : `bg-${color}`;
    },
    statusBadgeStyle() {
      const color = this.ticket?.board_status?.color || this.ticket?.status_color;
      if (!color || (!color.startsWith("#") && !color.startsWith("rgb"))) return {};
      return {
        backgroundColor: color,
        borderColor: color,
        color: "#fff",
      };
    },
    assigneePeople() {
      const items = [];
      const assignedGroup = this.ticket?.group;
      if (assignedGroup) {
        const found = (this.assignmentLookups.groups || []).find((g) => Number(g.id) === Number(assignedGroup.id));
        items.push({
          ...assignedGroup,
          members: (assignedGroup.members && assignedGroup.members.length) ? assignedGroup.members : (found?.members || []),
          observerType: "group",
          role: "Group",
          isGroup: true,
        });
      } else if (this.ticket?.group_id) {
        const found = (this.assignmentLookups.groups || []).find((g) => Number(g.id) === Number(this.ticket.group_id));
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
            id: this.ticket.group_id,
            name: `Group #${this.ticket.group_id}`,
            members: [],
            observerType: "group",
            role: "Group",
            isGroup: true,
          });
        }
      }
      (this.ticket?.assignees || []).forEach((user) => {
        items.push({
          ...user,
          observerType: "user",
        });
      });
      return items;
    },
    observerPeople() {
      const assignedGroupId = this.ticket?.group?.id || this.ticket?.group_id;
      return [
        ...(this.ticket?.tagged_users || []).map((user) => ({ ...user, observerType: "user" })),
        ...(this.ticket?.tagged_groups || [])
          .filter((group) => Number(group.id) !== Number(assignedGroupId))
          .map((group) => {
            const found = (this.assignmentLookups.groups || []).find((g) => Number(g.id) === Number(group.id));
            return {
              ...group,
              members: (group.members && group.members.length) ? group.members : (found?.members || []),
              observerType: "group",
              role: "Group",
              isGroup: true,
            };
          }),
      ];
    },
    ticketResolutions() {
      return this.ticket?.resolutions || (this.ticket?.resolution ? [this.ticket.resolution] : []);
    },
    attachmentBaseUrl() {
      return this.apiBase.replace(/\/api$/, "");
    },
    currentUserId() {
      try {
        const raw = sessionStorage.getItem("authUser") || localStorage.getItem("user");
        return raw ? Number(JSON.parse(raw).id) : null;
      } catch (error) {
        return null;
      }
    },
    isAdmin() {
      try {
        const raw = sessionStorage.getItem("authUser") || localStorage.getItem("user");
        const user = raw ? JSON.parse(raw) : null;
        return String(user?.role || "").toLowerCase() === "admin";
      } catch (error) {
        return false;
      }
    },
    ticketMenuPermission() {
      try {
        const permissions = this.menuPermissions.length
          ? this.menuPermissions
          : JSON.parse(sessionStorage.getItem("user_menu_permissions") || "[]");
        return permissions.map((menu) => ({
          ...menu,
          code: String(menu.code || "").toLowerCase(),
          url: String(menu.url || "").replace(/\/+$/, "").toLowerCase(),
        })).find((menu) =>
          ["ticket_list", "ticket-list", "tickets-list"].includes(menu.code)
          || String(menu.code || "").includes("ticket")
          || menu.url === "/tickets"
          || menu.url.startsWith("/tickets/")
        ) || null;
      } catch (error) {
        return null;
      }
    },
    canViewTicket() {
      return this.isAdmin || Boolean(this.ticketMenuPermission?.can_view);
    },
    canAddByPermission() {
      return this.isAdmin || Boolean(this.ticketMenuPermission?.can_add);
    },
    canEditByPermission() {
      return this.isAdmin || Boolean(this.ticketMenuPermission?.can_edit);
    },
    canEditTicket() {
      const status = String(this.ticket?.status_name || this.ticket?.board_status?.name || "").toLowerCase();
      return this.isAdmin || (this.canEditByPermission && this.isTicketOwner && status === "new");
    },
    isTicketOwner() {
      return Boolean(this.currentUserId && Number(this.ticket?.created_by) === this.currentUserId);
    },
    isTicketAssignee() {
      return Boolean(this.currentUserId && (this.ticket?.assignees || []).some((user) => Number(user.id) === this.currentUserId));
    },
    canChangeStatus() {
      return this.isAdmin || Boolean(
        this.canEditByPermission
        && this.currentUserId
        && this.isTicketAssignee
      );
    },
    canManageResolution() {
      return this.isAdmin || (this.canAddByPermission && this.canChangeStatus);
    },
    canManageAssignments() {
      return this.isAdmin;
    },
    canPostComment() {
      return this.canViewTicket && Boolean(this.currentUserId);
    },
    assignmentListTitle() {
      return this.assignmentListType === "observers" ? "Observers" : "Assigned To";
    },
    assignmentListItems() {
      if (this.assignmentListType === "observers") return this.observerPeople;
      return this.assigneePeople;
    },
    filteredCommentTemplates() {
      const query = this.commentTemplateSearch.trim().toLowerCase();
      if (!query) return this.commentTemplates;
      return this.commentTemplates.filter((template) =>
        `${template.title} ${template.body}`.toLowerCase().includes(query)
      );
    },
    mentionOptions() {
      const people = [
        ...this.assigneePeople.map((person) => ({ ...person, mentionType: person.observerType === "group" ? "Group" : "Assignee" })),
        ...this.observerPeople.map((person) => ({ ...person, mentionType: person.observerType === "group" ? "Group" : "Observer" })),
      ];
      const unique = new Map(people.map((person) => [`${person.mentionType}-${person.id}`, person]));
      const query = this.mentionQuery.trim().toLowerCase();
      return Array.from(unique.values()).filter((person) => !query || this.observerName(person).toLowerCase().includes(query));
    },
    historyGroups() {
      const groups = new Map();
      (this.ticket?.logs || []).forEach((log) => {
        const activityDate = log.created_at || log.processed_at;
        const key = this.timelineDateKey(activityDate);
        if (!groups.has(key)) groups.set(key, { key, date: activityDate, logs: [] });
        groups.get(key).logs.push(log);
      });
      const startValue = this.ticket?.created_at || this.ticket?.date_encountered;
      if (startValue) {
        const startDate = new Date(startValue);
        if (!Number.isNaN(startDate.getTime())) {
          const startKey = this.timelineDateKey(startValue);
          if (!groups.has(startKey)) groups.set(startKey, { key: startKey, date: startValue, logs: [] });
        }
      }
      return Array.from(groups.values()).sort((a, b) => {
        if (a.key === "unknown") return 1;
        if (b.key === "unknown") return -1;
        return a.key.localeCompare(b.key);
      });
    },
    boardStatusOptions() {
      return this.boardStatuses.filter((status) => Number(status.board_id) === Number(this.ticket?.board_id));
    },
    durationSeconds() {
      const startValue = this.ticket?.duration_from || this.ticket?.created_at || this.ticket?.date_encountered;
      const start = startValue ? new Date(startValue).getTime() : 0;
      if (!start) return 0;

      // A completed duration is measured from its start date to its end date.
      // Without an end date, it remains a live counter from Date Reported.
      const hasCompletedDurationRange = Boolean(this.ticket?.duration_from && this.ticket?.duration_to);
      const configuredEnd = hasCompletedDurationRange
        ? new Date(this.ticket.duration_to).getTime()
        : 0;
      // Date inputs have no time portion. If the selected end date is the same
      // day as the start (or is invalid), the ticket is still active and the
      // timer must continue from the reported timestamp.
      const end = Number.isFinite(configuredEnd) && configuredEnd > start
        ? configuredEnd
        : this.durationNow;
      return Math.max(0, Math.floor((end - start) / 1000));
    },
    durationParts() {
      let remaining = this.durationSeconds;
      const days = Math.floor(remaining / 86400);
      remaining %= 86400;
      const hours = Math.floor(remaining / 3600);
      remaining %= 3600;
      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;
      return [days, hours, minutes, seconds].map((value) => String(value).padStart(2, "0"));
    },
    canUpdateDuration() {
      return this.isAdmin || (this.canEditByPermission && (this.isTicketOwner || this.isTicketAssignee));
    },
    assignmentOptions() {
      return [
        ...(this.assignmentLookups.users || []).map((user) => ({
          value: `user:${user.id}`,
          label: user.fullname || user.name || user.email,
        })),
        ...(this.assignmentLookups.groups || []).map((group) => ({
          value: `group:${group.id}`,
          label: group.name,
        })),
      ];
    },
    currentAssigneeTokens() {
      return new Set([
        ...(this.ticket?.assignees || []).map((user) => `user:${user.id}`),
        ...(this.ticket?.group_id ? [`group:${this.ticket.group_id}`] : []),
      ]);
    },
    currentFollowerTokens() {
      return new Set([
        ...(this.ticket?.tagged_users || []).map((user) => `user:${user.id}`),
        ...(this.ticket?.tagged_groups || []).map((group) => `group:${group.id}`),
      ]);
    },
    availableAssigneeOptions() {
      return this.assignmentOptions.filter((option) => !this.currentAssigneeTokens.has(option.value));
    },
    availableFollowerOptions() {
      return this.assignmentOptions.filter((option) => !this.currentFollowerTokens.has(option.value));
    },
  },
  watch: {
    ticketId() {
      this.fetchTicket();
    },
    activityTab(tab) {
      if (tab === "comments") this.$nextTick(() => this.scrollCommentsToLatest());
    },
  },
  async mounted() {
    await this.loadMenuPermissions();
    this.fetchTicket();
    document.addEventListener("click", this.handleOutsideTemplateClick);
    this.durationTimer = window.setInterval(() => {
      this.durationNow = Date.now();
    }, 1000);
  },
  beforeUnmount() {
    if (this.durationTimer) window.clearInterval(this.durationTimer);
    document.removeEventListener("click", this.handleOutsideTemplateClick);
  },
  methods: {
    getAuthHeaders() {
      const token = localStorage.getItem("jwt") || localStorage.getItem("token");
      return token ? { Authorization: `Bearer ${token}` } : {};
    },
    async fetchTicket() {
      if (!this.ticketId) {
        this.error = "A ticket ID is required.";
        this.loading = false;
        return;
      }

      this.loading = true;
      this.error = "";
      if (!this.canViewTicket) {
        this.error = "You do not have permission to view ticket details.";
        this.loading = false;
        return;
      }
      try {
        const response = await axios.get(`${this.apiBase}/tickets/${this.ticketId}`, {
          headers: this.getAuthHeaders(),
        });
        this.ticket = response.data?.data || null;
        if (!this.ticket) this.error = "Ticket not found.";
        this.durationForm = {
          duration_from: this.ticket?.duration_from ? this.ticket.duration_from.substring(0, 10) : "",
          duration_to: this.ticket?.duration_to ? this.ticket.duration_to.substring(0, 10) : "",
        };
        await this.loadBoardStatuses();
        this.$nextTick(() => this.scrollCommentsToLatest());
      } catch (error) {
        this.error = error.response?.data?.message || "Unable to load the ticket.";
      } finally {
        this.loading = false;
      }
    },
    async loadBoardStatuses() {
      try {
        const response = await axios.get(`${this.apiBase}/tickets/lookups`, {
          headers: this.getAuthHeaders(),
        });
        this.boardStatuses = response.data?.statuses || [];
        if (response.data?.groups) {
          this.assignmentLookups.groups = response.data.groups;
        }
        if (response.data?.users) {
          this.assignmentLookups.users = response.data.users;
        }
      } catch (error) {
        this.boardStatuses = [];
      }
    },
    async loadMenuPermissions() {
      if (!this.getAuthHeaders().Authorization || this.isAdmin) return;
      try {
        const response = await axios.get(`${this.apiBase}/user/menu-access`, {
          headers: this.getAuthHeaders(),
        });
        this.menuPermissions = response.data?.menus || [];
        sessionStorage.setItem("user_menu_permissions", JSON.stringify(this.menuPermissions));
      } catch (error) {
        this.menuPermissions = [];
      }
    },
    async changeStatus(event) {
      const boardStatusId = Number(event.target.value);
      if (!boardStatusId || !this.canChangeStatus) return;

      const selectedStatus = this.boardStatusOptions.find((status) => Number(status.id) === boardStatusId);
      if (String(selectedStatus?.name || "").toLowerCase() === "in progress" &&
          (!this.durationForm.duration_from || !this.durationForm.duration_to)) {
        this.statusError = "Duration From and Duration To are required before moving the ticket to IN PROGRESS.";
        event.target.value = this.ticket.board_status_id;
        return;
      }

      const confirmation = await Swal.fire({
        title: "Update ticket status?",
        text: `Move this ticket to ${selectedStatus?.name || "the selected stage"}?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Update Status",
        cancelButtonText: "Cancel",
        customClass: { confirmButton: "btn btn-primary mx-1", cancelButton: "btn btn-light mx-1" },
        buttonsStyling: false,
      });
      if (!confirmation.isConfirmed) {
        event.target.value = this.ticket.board_status_id;
        return;
      }

      this.statusUpdating = true;
      this.statusError = "";
      try {
        await axios.put(`${this.apiBase}/tickets/${this.ticket.id}`, {
          board_status_id: boardStatusId,
        }, { headers: this.getAuthHeaders() });
        await this.fetchTicket();
      } catch (error) {
        this.statusError = error.response?.data?.message || "Unable to update the ticket status.";
      } finally {
        this.statusUpdating = false;
      }
    },
    async updateDuration() {
      if (!this.canUpdateDuration) return;
      if (!this.durationForm.duration_from || !this.durationForm.duration_to) {
        this.durationError = "Duration From and Duration To are required.";
        return;
      }
      this.durationSubmitting = true;
      this.durationError = "";
      try {
        await axios.put(`${this.apiBase}/tickets/${this.ticket.id}`, this.durationForm, {
          headers: this.getAuthHeaders(),
        });
        await this.fetchTicket();
      } catch (error) {
        this.durationError = error.response?.data?.message || "Unable to update the ticket duration.";
      } finally {
        this.durationSubmitting = false;
      }
    },
    openResolutionModal() {
      if (!this.canManageResolution) return;
      this.resolutionError = "";
      this.resolutionForm = {
        resolution: "",
        root_cause: "",
        prevent_recurrence: "",
      };
      this.resolutionFiles = [];
      this.resolutionDragOver = false;
      this.resolutionModal = true;
    },
    handleResolutionFiles(event) {
      this.resolutionFiles = [...this.resolutionFiles, ...Array.from(event.target.files || [])];
      event.target.value = "";
    },
    handleResolutionDrop(event) {
      this.resolutionDragOver = false;
      this.resolutionFiles = [...this.resolutionFiles, ...Array.from(event.dataTransfer.files || [])];
    },
    removeResolutionFile(index) {
      this.resolutionFiles.splice(index, 1);
    },
    async saveResolution() {
      if (!this.canManageResolution) return;
      this.resolutionSubmitting = true;
      this.resolutionError = "";
      try {
        const payload = new FormData();
        Object.entries(this.resolutionForm).forEach(([key, value]) => payload.append(key, value || ""));
        this.resolutionFiles.forEach((file) => payload.append("attachments[]", file));
        await axios.post(`${this.apiBase}/tickets/${this.ticket.id}/resolution`, payload, {
          headers: this.getAuthHeaders(),
        });
        this.resolutionModal = false;
        await this.fetchTicket();
      } catch (error) {
        this.resolutionError = error.response?.data?.message || "Unable to save the ticket resolution.";
      } finally {
        this.resolutionSubmitting = false;
      }
    },
    async deleteResolution(resolution) {
      if (!resolution?.id || !this.canDeleteResolution(resolution)) return;
      const confirmation = await Swal.fire({
        title: "Delete resolution?",
        text: "This will also delete its attachments.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        customClass: { confirmButton: "btn btn-danger mx-1", cancelButton: "btn btn-light mx-1" },
        buttonsStyling: false,
      });
      if (!confirmation.isConfirmed) return;

      this.resolutionError = "";
      try {
        await axios.delete(`${this.apiBase}/tickets/${this.ticket.id}/resolution/${resolution.id}`, {
          headers: this.getAuthHeaders(),
        });
        await this.fetchTicket();
      } catch (error) {
        this.resolutionError = error.response?.data?.message || "Unable to delete the ticket resolution.";
      }
    },
    canDeleteResolution(resolution) {
      return this.isAdmin || (this.currentUserId && Number(resolution?.created_by) === this.currentUserId);
    },
    canDeleteComment(comment) {
      return this.isAdmin || (this.currentUserId && Number(comment?.user_id) === this.currentUserId);
    },
    async deleteComment(comment) {
      if (!comment?.id || !this.canDeleteComment(comment)) return;
      const confirmation = await Swal.fire({
        title: "Delete comment?",
        text: "This will also delete its attachments.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        customClass: { confirmButton: "btn btn-danger mx-1", cancelButton: "btn btn-light mx-1" },
        buttonsStyling: false,
      });
      if (!confirmation.isConfirmed) return;

      try {
        await axios.delete(`${this.apiBase}/tickets/${this.ticket.id}/comments/${comment.id}`, {
          headers: this.getAuthHeaders(),
        });
        this.ticket.comments = (this.ticket.comments || []).filter((item) => item.id !== comment.id);
      } catch (error) {
        this.commentError = error.response?.data?.message || "Unable to delete the comment.";
      }
    },
    formatDate(value) {
      if (!value) return "—";
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return value;
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    },
    attachmentUrl(attachment) {
      return `${this.attachmentBaseUrl}/storage/${attachment.path}`;
    },
    previewAttachment(attachment) {
      this.attachmentPreviewFile = attachment;
      this.attachmentPreviewModal = true;
    },
    attachmentExtension(attachment) {
      return String(attachment?.extension || attachment?.filename?.split(".").pop() || "")
        .toLowerCase()
        .replace(/^\./, "");
    },
    attachmentPreviewKind(attachment) {
      const extension = this.attachmentExtension(attachment);
      if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico"].includes(extension)) return "image";
      if (["mp4", "webm", "ogg", "mov"].includes(extension)) return "video";
      if (["mp3", "wav", "m4a", "aac", "flac"].includes(extension)) return "audio";
      if (extension === "pdf") return "pdf";
      if (["txt", "csv", "json", "xml", "log", "md", "html", "css", "js", "ts"].includes(extension)) return "text";
      return "file";
    },
    observerName(observer) {
      return observer.fullname || observer.name || observer.email || "Observer";
    },
    initials(person) {
      const name = this.observerName(person).trim();
      const parts = name.split(/\s+/).filter(Boolean);
      if (!parts.length) return "?";
      if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    },
    groupMembers(group) {
      if (!group) return [];
      if (Array.isArray(group.members) && group.members.length) {
        return group.members;
      }
      const found = (this.assignmentLookups.groups || []).find((g) => Number(g.id) === Number(group.id));
      return found?.members || [];
    },
    formatRole(role) {
      return String(role || "User")
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
    },
    async copyReference() {
      const reference = this.ticket?.ref_no || `#${this.ticket?.id || ""}`;
      try {
        await navigator.clipboard.writeText(reference);
        this.referenceCopied = true;
        window.setTimeout(() => { this.referenceCopied = false; }, 1500);
      } catch (error) {
        this.referenceCopied = false;
      }
    },
    async openAssignmentModal() {
      if (!this.canManageAssignments) return;
      this.assignmentError = "";
      this.assignmentForm = {
        assignees: [],
        followers: [],
      };
      this.assignmentModal = true;
      try {
        const response = await axios.get(`${this.apiBase}/tickets/lookups`, {
          headers: this.getAuthHeaders(),
        });
        this.assignmentLookups = {
          users: response.data?.users || [],
          groups: response.data?.groups || [],
        };
      } catch (error) {
        this.assignmentError = error.response?.data?.message || "Unable to load assignment options.";
      }
    },
    openAssignmentList(type) {
      this.assignmentListType = type;
      this.assignmentListModal = true;
    },
    async saveAssignments() {
      if (!this.canManageAssignments) return;
      this.assignmentSubmitting = true;
      this.assignmentError = "";
      try {
        const newAssignees = this.assignmentForm.assignees
          .filter((value) => value.startsWith("user:"))
          .map((value) => Number(value.slice(5)));
        const newResponsibleGroups = this.assignmentForm.assignees
          .filter((value) => value.startsWith("group:"))
          .map((value) => Number(value.slice(6)));
        const newFollowers = this.assignmentForm.followers
          .filter((value) => value.startsWith("user:"))
          .map((value) => Number(value.slice(5)));
        const newFollowerGroups = this.assignmentForm.followers
          .filter((value) => value.startsWith("group:"))
          .map((value) => Number(value.slice(6)));

        const assignees = [
          ...(this.ticket.assignees || []).map((user) => user.id),
          ...newAssignees,
        ];
        const responsibleGroups = [
          ...(this.ticket.group_id ? [this.ticket.group_id] : []),
          ...newResponsibleGroups,
        ];
        const followers = [
          ...(this.ticket.tagged_users || []).map((user) => user.id),
          ...newFollowers,
        ];
        const followerGroups = [
          ...(this.ticket.tagged_groups || []).map((group) => group.id),
          ...newFollowerGroups,
          ...newResponsibleGroups,
        ];

        await axios.put(`${this.apiBase}/tickets/${this.ticket.id}`, {
          assignees,
          group_id: responsibleGroups[0] || null,
          assigned_groups: responsibleGroups,
          followers,
          follower_groups: followerGroups,
          tagged_groups: followerGroups,
        }, { headers: this.getAuthHeaders() });

        this.assignmentModal = false;
        await this.fetchTicket();
      } catch (error) {
        this.assignmentError = error.response?.data?.message || "Unable to save assignment changes.";
      } finally {
        this.assignmentSubmitting = false;
      }
    },
    beginReply(comment) {
      this.replyingTo = comment;
      this.commentError = "";
      this.commentFiles = [];
      this.$nextTick(() => this.$refs.commentInput?.focus());
    },
    cancelReply() {
      this.replyingTo = null;
      this.commentError = "";
      this.commentFiles = [];
    },
    updateMentionQuery() {
      const match = this.commentMessage.match(/(?:^|\s)@([^\s@]*)$/);
      this.mentionOpen = Boolean(match);
      this.mentionQuery = match ? match[1] : "";
    },
    selectMention(person) {
      const name = this.observerName(person);
      this.commentMessage = this.commentMessage.replace(/(?:^|\s)@([^\s@]*)$/, (match) => `${match.startsWith(" ") ? " " : ""}@${name} `);
      this.mentionOpen = false;
      this.mentionQuery = "";
      this.$nextTick(() => this.$refs.commentInput?.focus());
    },
    scrollCommentsToLatest() {
      const panel = this.$refs.commentsPanel;
      if (panel) panel.scrollTop = panel.scrollHeight;
    },
    handleCommentFiles(event) {
      this.commentFiles = [...this.commentFiles, ...Array.from(event.target.files || [])];
      event.target.value = "";
    },
    handleCommentDrop(event) {
      this.commentDragOver = false;
      this.commentFiles = [...this.commentFiles, ...Array.from(event.dataTransfer.files || [])];
    },
    removeCommentFile(index) {
      this.commentFiles.splice(index, 1);
    },
    useCommentTemplate(template) {
      const requester = this.observerName(this.ticket?.creator || {});
      const reference = this.ticket?.ref_no || `#${this.ticket?.id || ""}`;
      this.commentMessage = template.body
        .replaceAll("{{requester_name}}", requester)
        .replaceAll("{{ref_no}}", reference);
      this.commentTemplateOpen = false;
      this.commentTemplateSearch = "";
      this.$nextTick(() => this.$refs.commentInput?.focus());
    },
    handleOutsideTemplateClick(event) {
      if (this.commentTemplateOpen && !event.target.closest(".comment-input-wrap")) {
        this.commentTemplateOpen = false;
        this.commentTemplateSearch = "";
      }
    },
    async postComment() {
      if (!this.canPostComment) return;
      const message = this.commentMessage.trim();
      if (!message) {
        this.commentError = "Enter a comment before posting.";
        return;
      }

      this.commentSubmitting = true;
      this.commentError = "";
      try {
        const payload = new FormData();
        payload.append("message", message);
        if (this.replyingTo?.id) payload.append("parent_id", this.replyingTo.id);
        this.commentFiles.forEach((file) => payload.append("attachments[]", file));
        const response = await axios.post(`${this.apiBase}/tickets/${this.ticket.id}/comments`, payload, {
          headers: this.getAuthHeaders(),
        });
        this.ticket.comments = [...(this.ticket.comments || []), response.data.data];
        await this.fetchTicket();
        this.commentMessage = "";
        this.replyingTo = null;
        this.commentFiles = [];
      } catch (error) {
        this.commentError = error.response?.data?.message || "Unable to post the comment.";
      } finally {
        this.commentSubmitting = false;
      }
    },
    formatDateTime(value) {
      if (!value) return "—";
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return value;
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    },
    formatTimelineTime(value) {
      if (!value) return "—";
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return value;
      return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    },
    formatTimelineDay(value) {
      if (!value) return "—";
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return value;
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    },
    timelineDateKey(value) {
      if (!value) return "unknown";
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return "unknown";
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    },
    timelineStatusStyle(log) {
      const color = log.board_status_color;
      if (!color) return {};
      return { color: color.startsWith("#") ? color : undefined };
    },
    formatTimelineYear(value) {
      if (!value) return "";
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return "";
      return date.toLocaleDateString("en-US", { year: "numeric" });
    },
    formatRelativeTime(value) {
      if (!value) return "—";
      const timestamp = new Date(value).getTime();
      if (Number.isNaN(timestamp)) return "—";

      const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
      if (seconds < 60) return "Just now";
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes} min ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
      const days = Math.floor(hours / 24);
      return `${days} day${days === 1 ? "" : "s"} ago`;
    },
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="pageTitle" pageTitle="Tickets" />

    <div :class="{ 'ticket-page-loading': loading }">
      <div v-if="loading" class="ticket-loading-bar" role="status" aria-label="Loading ticket details">
        <span></span>
      </div>

    <BCard v-if="error" no-body class="border-0 shadow-sm">
      <BCardBody class="text-center py-5">
        <div class="avatar-md mx-auto mb-3">
          <span class="avatar-title bg-danger-subtle text-danger rounded-circle fs-2">
            <i class="ri-error-warning-line"></i>
          </span>
        </div>
        <h5 class="mb-2">Unable to show ticket details</h5>
        <p class="text-muted mb-3">{{ error }}</p>
        <router-link to="/tickets/list" class="btn btn-primary">Back to Tickets</router-link>
      </BCardBody>
    </BCard>

    <template v-if="!error && ticket">
      <BCard no-body class="border-0 shadow-sm mb-4 overflow-hidden">
        <BCardBody class="p-4">
          <div class="d-flex align-items-start justify-content-between gap-3 flex-wrap">
            <div class="d-flex align-items-start gap-3">
              <div class="avatar-sm flex-shrink-0">
                <span class="avatar-title bg-primary-subtle text-primary rounded-circle fs-4">
                  <i class="ri-ticket-2-line"></i>
                </span>
              </div>
              <div>
                <div class="d-flex align-items-center gap-2 flex-wrap mb-1">
                  <h4 class="mb-0 fw-semibold ticket-reference font-monospace">{{ ticket.ref_no || `#${ticket.id}` }}</h4>
                  <button type="button" class="ticket-reference-copy btn btn-sm btn-icon" :title="referenceCopied ? 'Copied' : 'Copy reference'" :aria-label="referenceCopied ? 'Copied' : 'Copy reference'" @click="copyReference">
                    <i :class="referenceCopied ? 'ri-check-line text-success' : 'ri-clipboard-line text-primary'"></i>
                  </button>
                </div>
                <div class="ticket-header-meta text-muted fs-13">
                  <i class="ri-dashboard-line me-1"></i>{{ boardName }}
                  <span class="mx-2">•</span>
                  <span><strong>Create Date:</strong> {{ formatDate(ticket.created_at) }}</span>
                  <span><strong>Due Date:</strong> {{ ticket.duration_to ? formatDate(ticket.duration_to) : '-' }}</span>
                  <span class="badge" :class="statusClass" :style="statusBadgeStyle">{{ ticket.status_name || "Open" }}</span>
                  <span v-if="ticket.severity_name" class="badge" :class="`bg-${ticket.severity_color || 'secondary'}-subtle text-${ticket.severity_color || 'secondary'}`">{{ ticket.severity_name }}</span>
                </div>
              </div>
            </div>
            <div class="d-flex gap-2">
              <router-link to="/tickets/list" class="btn btn-light btn-sm">
                <i class="ri-arrow-left-line me-1"></i>Back to Tickets
              </router-link>
              <router-link v-if="canEditTicket" :to="`/tickets/edit/${ticket.id}`" class="btn btn-primary btn-sm">
                <i class="ri-pencil-line me-1"></i>Edit
              </router-link>
            </div>
          </div>
        </BCardBody>
      </BCard>

      <BRow class="g-4">
        <BCol xxl="8">
          <BCard no-body class="border-0 shadow-sm h-100">
            <BCardBody class="p-4">
              <h5 class="card-title mb-2">Subject</h5>
              <h6 class="mb-3 fw-semibold">{{ ticket.subject || "No subject provided." }}</h6>
              <div class="border-top mb-3"></div>
              <h5 class="card-title mb-3">Description</h5>
              <p class="text-muted mb-0 description-text">{{ ticket.summary || "No description provided." }}</p>

              <div v-if="ticket.url" class="mt-4 pt-3 border-top">
                <h6 class="text-uppercase text-muted fs-11 mb-2">URL / Context</h6>
                <a :href="ticket.url" target="_blank" rel="noopener" class="link-primary text-break">
                  <i class="ri-external-link-line me-1"></i>{{ ticket.url }}
                </a>
              </div>

              <div class="mt-4 pt-3 border-top">
                <div class="d-flex align-items-center justify-content-between mb-3">
                  <h5 class="card-title mb-0">Ticket Resolution</h5>
                  <div class="d-flex align-items-center gap-2">
                    <span v-if="ticketResolutions.length" class="badge bg-success-subtle text-success">{{ ticketResolutions.length }} entr{{ ticketResolutions.length === 1 ? 'y' : 'ies' }}</span>
                    <button v-if="canManageResolution" type="button" class="btn btn-primary btn-sm" @click="openResolutionModal">
                      <i class="ri-add-line me-1"></i>Add Resolution
                    </button>
                  </div>
                </div>
                <div v-if="ticketResolutions.length" class="ticket-resolution-grid">
                  <div v-for="(resolution, index) in ticketResolutions" :key="resolution.id || index" class="ticket-resolution-entry border rounded p-3">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <span class="fw-semibold fs-13">Resolution {{ index + 1 }}</span>
                      <div class="d-flex align-items-center gap-2">
                        <small class="text-muted">{{ formatDateTime(resolution.created_at) }}</small>
                        <button v-if="canDeleteResolution(resolution)" type="button" class="btn btn-sm btn-ghost-danger p-0" title="Delete resolution" @click="deleteResolution(resolution)">
                          <i class="ri-delete-bin-line"></i>
                        </button>
                      </div>
                    </div>
                    <div v-if="resolution.resolution">
                      <div class="text-muted fs-11 text-uppercase mb-1">Resolution</div>
                      <p class="mb-2 description-text">{{ resolution.resolution }}</p>
                    </div>
                    <div v-if="resolution.root_cause">
                      <div class="text-muted fs-11 text-uppercase mb-1">Root Cause</div>
                      <p class="mb-2 description-text">{{ resolution.root_cause }}</p>
                    </div>
                    <div v-if="resolution.prevent_recurrence">
                      <div class="text-muted fs-11 text-uppercase mb-1">Prevent Recurrence</div>
                      <p class="mb-0 description-text">{{ resolution.prevent_recurrence }}</p>
                    </div>
                    <div v-if="resolution.attachments?.length" class="mt-2">
                      <div class="text-muted fs-11 text-uppercase mb-1">Attachments</div>
                      <div class="vstack gap-1">
                        <button v-for="attachment in resolution.attachments" :key="attachment.id" type="button" class="btn btn-link link-primary fs-12 text-truncate p-0 text-start" @click="previewAttachment(attachment)">
                          <i class="ri-attachment-2 me-1 text-primary"></i>{{ attachment.filename }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <p v-else class="text-muted fs-13 mb-0">No resolution recorded.</p>
              </div>

              <div class="mt-4 pt-3 border-top">
                <ul class="nav nav-tabs ticket-activity-tabs mb-3" role="tablist">
                  <li class="nav-item" role="presentation">
                    <button type="button" class="nav-link" :class="{ active: activityTab === 'comments' }" @click="activityTab = 'comments'">
                      Comments <span class="badge bg-light text-muted ms-1">{{ ticket.comments?.length || 0 }}</span>
                    </button>
                  </li>
                  <li class="nav-item" role="presentation">
                    <button type="button" class="nav-link" :class="{ active: activityTab === 'history' }" @click="activityTab = 'history'">
                      History <span class="badge bg-light text-muted ms-1">{{ ticket.logs?.length || 0 }}</span>
                    </button>
                  </li>
                </ul>

                <div v-if="activityTab === 'comments'" ref="commentsPanel" class="ticket-comments-panel">
                <div v-if="ticket.comments?.length" class="vstack gap-3">
                  <div v-for="comment in ticket.comments" :key="comment.id" class="comment-item rounded border p-3" :class="{ 'ms-md-4': comment.parent_id }">
                    <div class="d-flex align-items-start gap-2">
                      <span class="avatar-xs flex-shrink-0">
                        <span class="avatar-title bg-primary-subtle text-primary rounded-circle">
                          {{ observerName(comment.author).charAt(0).toUpperCase() }}
                        </span>
                      </span>
                      <div class="flex-grow-1 min-w-0">
                        <div class="d-flex align-items-center gap-2 flex-wrap mb-1">
                          <span class="fw-semibold fs-13">{{ observerName(comment.author) }}</span>
                          <span v-if="comment.type === 'follow_up'" class="badge bg-info-subtle text-info">Follow-up</span>
                          <span v-if="comment.is_internal" class="badge bg-warning-subtle text-warning">Internal</span>
                          <small class="text-muted ms-auto">{{ formatDateTime(comment.created_at) }}</small>
                          <button v-if="canDeleteComment(comment)" type="button" class="btn btn-sm btn-ghost-danger p-0" title="Delete comment" @click="deleteComment(comment)">
                            <i class="ri-delete-bin-line"></i>
                          </button>
                        </div>
                        <p class="mb-0 text-muted comment-message">{{ comment.message || "—" }}</p>
                        <div v-if="comment.attachments?.length" class="vstack gap-1 mt-2">
                          <button v-for="attachment in comment.attachments" :key="attachment.id" type="button" class="btn btn-link link-primary fs-12 text-truncate p-0 text-start" @click="previewAttachment(attachment)">
                            <i class="ri-attachment-2 me-1 text-primary"></i>{{ attachment.filename }}
                          </button>
                        </div>
                        <button v-if="canPostComment" type="button" class="btn btn-link btn-sm p-0 mt-2" @click="beginReply(comment)">
                          <i class="ri-reply-line me-1"></i>Reply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <p v-else class="text-muted fs-13 mb-0">No comments yet.</p>

                <form v-if="canPostComment" class="mt-3" @submit.prevent="postComment">
                  <div v-if="replyingTo" class="d-flex align-items-center justify-content-between bg-light rounded px-3 py-2 mb-2 fs-12">
                    <span>Replying to <strong>{{ observerName(replyingTo.author) }}</strong></span>
                    <button type="button" class="btn btn-sm btn-link text-muted p-0" @click="cancelReply">Cancel</button>
                  </div>
                  <div
                    class="comment-input-wrap"
                    :class="{ 'dropzone-active': commentDragOver }"
                    @dragover.prevent="commentDragOver = true"
                    @dragleave.prevent="commentDragOver = false"
                    @drop.prevent="handleCommentDrop"
                  >
                    <div v-if="commentTemplateOpen" class="comment-template-popover">
                      <input v-model="commentTemplateSearch" type="search" class="form-control form-control-sm mb-2" placeholder="Search templates..." />
                      <button v-for="template in filteredCommentTemplates" :key="template.title" type="button" class="comment-template-item" @click="useCommentTemplate(template)">
                        <span class="fw-semibold d-block">{{ template.title }} <span class="badge bg-primary-subtle text-primary">SHARED</span></span>
                        <span class="text-muted d-block">{{ template.body }}</span>
                      </button>
                      <div v-if="!filteredCommentTemplates.length" class="text-muted fs-12 p-2">No templates found.</div>
                    </div>
                    <textarea
                      ref="commentInput"
                      v-model="commentMessage"
                      @input="updateMentionQuery"
                      class="form-control comment-composer-textarea"
                      rows="3"
                      :placeholder="replyingTo ? 'Write a reply...' : 'Write a comment...'"
                      :disabled="commentSubmitting"
                    ></textarea>
                    <div v-if="mentionOpen && mentionOptions.length" class="comment-mention-popover">
                      <button v-for="person in mentionOptions" :key="`${person.mentionType}-${person.id}`" type="button" class="comment-mention-item" @click="selectMention(person)">
                        <span class="ticket-avatar">{{ initials(person) }}</span>
                        <span class="min-w-0 text-start">
                          <span class="fw-semibold d-block text-truncate">{{ observerName(person) }}</span>
                          <small class="text-muted">{{ person.mentionType }}</small>
                        </span>
                      </button>
                    </div>
                    <div class="comment-composer-actions">
                      <label class="btn btn-light btn-sm btn-icon rounded-circle" title="Attach files">
                        <i class="ri-attachment-2 text-primary"></i>
                        <input ref="commentFileInput" type="file" class="d-none" multiple @change="handleCommentFiles" />
                      </label>
                      <button type="button" class="btn btn-light btn-sm btn-icon rounded-circle" title="Quick comment templates" @click="commentTemplateOpen = !commentTemplateOpen">
                        <i class="ri-chat-3-line text-primary"></i>
                      </button>
                    </div>
                  </div>
                  <div v-if="commentFiles.length" class="d-flex flex-wrap gap-1 mt-2">
                    <span v-for="(file, index) in commentFiles" :key="`${file.name}-${index}`" class="badge bg-light text-dark border">
                      {{ file.name }} <button type="button" class="btn btn-link text-danger p-0 ms-1" @click.stop="removeCommentFile(index)"><i class="ri-close-line"></i></button>
                    </span>
                  </div>
                  <div v-if="commentError" class="text-danger fs-12 mt-1">{{ commentError }}</div>
                  <div class="text-end mt-2">
                    <button type="submit" class="btn btn-primary btn-sm" :disabled="commentSubmitting">
                      <span v-if="commentSubmitting" class="spinner-border spinner-border-sm me-1"></span>
                      <i v-else class="ri-send-plane-2-line me-1"></i>
                      {{ replyingTo ? 'Post Reply' : 'Post Comment' }}
                    </button>
                  </div>
                </form>
                </div>

                <div v-else class="ticket-history-timeline">
                  <div v-if="historyGroups.length" class="ticket-left-timeline">
                    <div v-for="group in historyGroups" :key="group.key" class="ticket-timeline-day">
                      <div class="ticket-timeline-date">{{ formatDate(group.date) }}</div>
                      <div class="ticket-timeline-events">
                        <div v-for="log in group.logs" :key="log.id" class="ticket-timeline-item">
                          <span class="ticket-timeline-marker"><i :class="log.is_status_update ? 'ri-refresh-line' : 'ri-history-line'"></i></span>
                          <div class="ticket-timeline-content">
                            <div class="d-flex align-items-center justify-content-between gap-2 flex-wrap">
                              <span class="ticket-timeline-status" :style="timelineStatusStyle(log)">{{ log.board_status_name || (log.is_status_update ? ticket.status_name : 'UPDATE') }}</span>
                              <small class="text-muted">{{ formatRelativeTime(log.created_at || log.processed_at) }} · {{ formatTimelineTime(log.created_at || log.processed_at) }}</small>
                            </div>
                            <div class="d-flex align-items-center gap-1 mt-1 text-muted fs-12">
                              <i class="ri-user-line"></i>
                              <span>{{ log.processed_by_name || 'System' }}</span>
                            </div>
                            <p class="mb-0 mt-2 text-muted comment-message">{{ log.description }}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p v-else class="text-muted fs-13 mb-0">No history recorded yet.</p>
                </div>
              </div>
            </BCardBody>
          </BCard>
        </BCol>

        <BCol xxl="4">
          <BCard no-body class="border-0 shadow-sm mb-4">
            <BCardHeader class="bg-transparent border-bottom">
              <h5 class="card-title mb-0">Ticket Details</h5>
            </BCardHeader>
            <BCardBody class="p-0">
              <div class="table-responsive">
                <table class="table table-borderless align-middle mb-0 ticket-details-table">
                  <tbody>
                    <tr><td class="text-muted ps-3">Board</td><td class="fw-medium pe-3 text-end">{{ boardName }}</td></tr>
                    <tr>
                      <td class="text-muted ps-3">Assigned To</td>
                      <td class="pe-3">
                        <div class="d-flex justify-content-end">
                          <div v-if="assigneePeople.length" class="ticket-avatar-group" aria-label="Assigned people">
                            <span
                              v-for="assignee in assigneePeople.slice(0, 5)"
                              :key="`${assignee.observerType || 'user'}-${assignee.id}`"
                              class="ticket-avatar"
                              :class="{ 'bg-info-subtle text-info': assignee.observerType === 'group' }"
                              :title="observerName(assignee) + (assignee.observerType === 'group' ? ' (Group)' : '')"
                            >
                              <i v-if="assignee.observerType === 'group'" class="ri-team-line"></i>
                              <template v-else>{{ initials(assignee) }}</template>
                            </span>
                            <button v-if="assigneePeople.length > 5" type="button" @click="openAssignmentList('assignees')" class="ticket-avatar ticket-avatar-more" title="View all assignees">+{{ assigneePeople.length - 5 }}</button>
                            <button v-if="canManageAssignments" type="button" @click="openAssignmentModal" class="ticket-avatar ticket-avatar-add" title="Add assignee" aria-label="Add assignee">+</button>
                          </div>
                          <button v-else-if="canManageAssignments" type="button" @click="openAssignmentModal" class="ticket-avatar ticket-avatar-add" title="Add assignee" aria-label="Add assignee">+</button>
                          <button type="button" class="btn btn-sm btn-icon btn-soft-primary rounded-circle ms-1" title="View assigned users and groups" aria-label="View assigned users and groups" @click="openAssignmentList('assignees')">
                            <i class="mdi mdi-format-list-text"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td class="text-muted ps-3">Observers</td>
                      <td class="pe-3">
                        <div class="d-flex justify-content-end">
                          <div v-if="observerPeople.length" class="ticket-avatar-group" aria-label="Observers">
                            <span v-for="observer in observerPeople.slice(0, 5)" :key="`${observer.observerType}-${observer.id}`" class="ticket-avatar" :title="observerName(observer)">{{ initials(observer) }}</span>
                            <button v-if="observerPeople.length > 5" type="button" @click="openAssignmentList('observers')" class="ticket-avatar ticket-avatar-more" title="View all observers">+{{ observerPeople.length - 5 }}</button>
                            <button v-if="canManageAssignments" type="button" @click="openAssignmentModal" class="ticket-avatar ticket-avatar-add" title="Add observer" aria-label="Add observer">+</button>
                          </div>
                          <button v-else-if="canManageAssignments" type="button" @click="openAssignmentModal" class="ticket-avatar ticket-avatar-add" title="Add observer" aria-label="Add observer">+</button>
                          <button type="button" class="btn btn-sm btn-icon btn-soft-primary rounded-circle ms-1" title="View observers" aria-label="View observers" @click="openAssignmentList('observers')">
                            <i class="mdi mdi-format-list-text"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td class="text-muted ps-3">Status</td>
                      <td class="fw-medium pe-3 text-end">
                        <select
                          v-if="canChangeStatus && boardStatusOptions.length"
                          class="form-select form-select-sm ticket-status-select"
                          :value="ticket.board_status_id"
                          :disabled="statusUpdating"
                          @change="changeStatus"
                        >
                          <option v-for="status in boardStatusOptions" :key="status.id" :value="status.id">
                            {{ status.name }}
                          </option>
                        </select>
                        <span v-else class="badge" :class="statusClass" :style="statusBadgeStyle">{{ ticket.status_name || "—" }}</span>
                        <div v-if="statusError" class="text-danger fs-11 mt-1">{{ statusError }}</div>
                      </td>
                    </tr>
                    <tr><td class="text-muted ps-3">Ticket Type</td><td class="fw-medium pe-3 text-end">{{ ticket.issue_type?.issue_desc || ticket.type_name || "—" }}</td></tr>
                    <tr><td class="text-muted ps-3">{{ boardName === 'System' ? 'System' : 'Issue Type' }}</td><td class="fw-medium pe-3 text-end">{{ ticket.tkt_type?.name || "—" }}</td></tr>
                    <tr><td class="text-muted ps-3">Date Encountered</td><td class="fw-medium pe-3 text-end">{{ formatDate(ticket.date_encountered) }}</td></tr>
                    <tr><td class="text-muted ps-3">Date Needed</td><td class="fw-medium pe-3 text-end">{{ formatDate(ticket.duration_to) }}</td></tr>
                    <tr><td class="text-muted ps-3">Priority</td><td class="fw-medium pe-3 text-end"><span class="badge" :class="`bg-${ticket.severity_color || 'secondary'}-subtle text-${ticket.severity_color || 'secondary'}`">{{ ticket.severity_name || "—" }}</span></td></tr>
                    <tr><td class="text-muted ps-3">Create Date</td><td class="fw-medium pe-3 text-end">{{ formatDate(ticket.created_at) }}</td></tr>
                    <tr><td class="text-muted ps-3">Last Activity</td><td class="fw-medium pe-3 text-end">{{ formatRelativeTime(ticket.updated_at) }}</td></tr>
                    <tr><td class="text-muted ps-3">Frequency</td><td class="fw-medium pe-3 text-end">{{ ticket.frequency || "—" }}</td></tr>
                    <tr><td class="text-muted ps-3">Reported By</td><td class="fw-medium pe-3 text-end">{{ ticket.creator ? observerName(ticket.creator) : "—" }}</td></tr>
                    <tr><td class="text-muted ps-3">Date Reported</td><td class="fw-medium pe-3 text-end">{{ formatDateTime(ticket.created_at) }}</td></tr>
                  </tbody>
                </table>
              </div>
            </BCardBody>
          </BCard>

          <BCard no-body class="border-0 shadow-sm mb-4 ticket-duration-card">
            <BCardBody class="p-3">
              <h6 class="text-center fw-bold mb-3">TICKET DURATION</h6>
              <div class="ticket-duration-clock mx-auto mb-3" aria-label="Running duration clock"></div>
              <div class="ticket-duration-counter mb-4">
                <div v-for="(part, index) in durationParts" :key="index" class="text-center">
                  <div class="ticket-duration-number">{{ part }}</div>
                  <small>{{ ['DAYS', 'HRS', 'MIN', 'SEC'][index] }}</small>
                </div>
              </div>
              <form v-if="canUpdateDuration" @submit.prevent="updateDuration">
                <div class="row g-2">
                  <div class="col-6">
                    <label class="form-label fs-12 fw-semibold">Duration From</label>
                    <input v-model="durationForm.duration_from" type="date" class="form-control form-control-sm" required :disabled="!canUpdateDuration || durationSubmitting" />
                  </div>
                  <div class="col-6">
                    <label class="form-label fs-12 fw-semibold">Duration To</label>
                    <input v-model="durationForm.duration_to" type="date" class="form-control form-control-sm" required :disabled="!canUpdateDuration || durationSubmitting" />
                  </div>
                </div>
                <div v-if="durationError" class="text-danger fs-12 mt-2">{{ durationError }}</div>
                <button v-if="canUpdateDuration" type="submit" class="btn btn-primary btn-sm w-100 mt-2" :disabled="durationSubmitting">
                  <span v-if="durationSubmitting" class="spinner-border spinner-border-sm me-1"></span>Update
                </button>
              </form>
            </BCardBody>
          </BCard>

          <BCard no-body class="border-0 shadow-sm">
            <BCardHeader class="bg-transparent border-bottom">
              <h5 class="card-title mb-0">Files Attachment</h5>
            </BCardHeader>
            <BCardBody>
              <div v-if="ticket.attachments?.length" class="vstack gap-2">
                <button v-for="attachment in ticket.attachments" :key="attachment.id" type="button" class="btn btn-link d-flex align-items-center border rounded p-2 text-reset text-start w-100" @click="previewAttachment(attachment)">
                  <i class="ri-attachment-2 fs-18 text-primary me-2"></i>
                  <span class="text-truncate flex-grow-1">{{ attachment.filename }}</span>
                  <i class="ri-eye-line ms-2 text-muted"></i>
                </button>
              </div>
              <p v-else class="text-muted fs-13 mb-0">No attachments.</p>
            </BCardBody>
          </BCard>
        </BCol>
      </BRow>
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
                    <div class="fw-semibold text-truncate">{{ observerName(person) }}</div>
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
                        {{ initials(member) }}
                      </span>
                      <div class="min-w-0">
                        <div class="fs-13 fw-medium text-truncate">{{ observerName(member) }}</div>
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
                  {{ initials(person) }}
                </span>
                <div class="min-w-0 flex-grow-1">
                  <div class="fw-semibold text-truncate">{{ observerName(person) }}</div>
                  <div v-if="person.email" class="text-muted fs-11 text-truncate">{{ person.email }}</div>
                  <span class="badge bg-light text-muted border mt-1">{{ formatRole(person.role || 'User') }}</span>
                </div>
              </div>
            </template>
          </div>
        </div>
        <p v-else class="text-muted mb-3">No {{ assignmentListType === 'observers' ? 'observers' : 'assignees' }} assigned.</p>
        <div class="text-end mt-3">
          <button v-if="canManageAssignments" type="button" class="btn btn-primary btn-sm" @click="assignmentListModal = false; openAssignmentModal()">
            <i class="ri-add-line me-1"></i>Add
          </button>
        </div>
      </BModal>

      <div v-if="attachmentPreviewModal && attachmentPreviewFile" class="ticket-attachment-preview-overlay" @click.self="attachmentPreviewModal = false">
        <div class="ticket-attachment-preview-dialog" role="dialog" aria-modal="true" :aria-label="attachmentPreviewFile.filename">
          <div class="d-flex align-items-center justify-content-between gap-2 border-bottom px-3 py-2">
            <h5 class="mb-0 text-truncate">{{ attachmentPreviewFile.filename }}</h5>
            <button type="button" class="btn btn-sm btn-icon rounded-circle" aria-label="Close preview" @click="attachmentPreviewModal = false">
              <i class="ri-close-line fs-18"></i>
            </button>
          </div>
          <div class="ticket-attachment-preview p-3">
          <img v-if="attachmentPreviewKind(attachmentPreviewFile) === 'image'" :src="attachmentUrl(attachmentPreviewFile)" :alt="attachmentPreviewFile.filename" class="ticket-preview-image" />
          <video v-else-if="attachmentPreviewKind(attachmentPreviewFile) === 'video'" :src="attachmentUrl(attachmentPreviewFile)" controls class="ticket-preview-media"></video>
          <audio v-else-if="attachmentPreviewKind(attachmentPreviewFile) === 'audio'" :src="attachmentUrl(attachmentPreviewFile)" controls class="w-100"></audio>
          <iframe v-else :src="attachmentUrl(attachmentPreviewFile)" :title="attachmentPreviewFile.filename" class="ticket-preview-frame"></iframe>
          <div class="d-flex justify-content-between align-items-center gap-2 mt-3">
            <span class="text-muted text-truncate">{{ attachmentPreviewFile.filename }}</span>
            <a :href="attachmentUrl(attachmentPreviewFile)" target="_blank" rel="noopener" class="btn btn-primary btn-sm flex-shrink-0">
              <i class="ri-download-2-line me-1"></i>Open / Download
            </a>
          </div>
          </div>
        </div>
      </div>

      <BModal
        v-model="resolutionModal"
        title="Add Ticket Resolution"
        centered
        hide-footer
        modal-class="ticket-assignment-modal"
      >
        <form @submit.prevent="saveResolution">
          <div class="mb-3">
            <label class="form-label fw-semibold">Resolution</label>
            <textarea v-model="resolutionForm.resolution" class="form-control" rows="4" placeholder="Describe how the ticket was resolved."></textarea>
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Root Cause</label>
            <textarea v-model="resolutionForm.root_cause" class="form-control" rows="3" placeholder="What caused the issue?"></textarea>
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Prevent Recurrence</label>
            <textarea v-model="resolutionForm.prevent_recurrence" class="form-control" rows="3" placeholder="What will prevent this from happening again?"></textarea>
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Resolution Attachments</label>
            <div
              class="ticket-dropzone resolution-dropzone rounded p-3 text-center border-dashed position-relative cursor-pointer"
              :class="{ 'dropzone-active': resolutionDragOver }"
              @dragover.prevent="resolutionDragOver = true"
              @dragleave.prevent="resolutionDragOver = false"
              @drop.prevent="handleResolutionDrop"
              @click="$refs.resolutionFileInput.click()"
            >
              <input ref="resolutionFileInput" type="file" class="d-none" multiple @change="handleResolutionFiles" />
              <i class="ri-upload-cloud-2-line fs-24 text-primary"></i>
              <div class="fs-12 mt-1">Drag &amp; drop files here or <span class="text-primary text-decoration-underline">browse</span></div>
            </div>
            <div v-if="resolutionFiles.length" class="vstack gap-1 mt-2">
              <div v-for="(file, index) in resolutionFiles" :key="`${file.name}-${index}`" class="d-flex align-items-center justify-content-between border rounded px-2 py-1 fs-12">
                <span class="text-truncate">{{ file.name }}</span>
                <button type="button" class="btn btn-sm btn-link text-danger p-0 ms-2" @click.stop="removeResolutionFile(index)"><i class="ri-close-line"></i></button>
              </div>
            </div>
          </div>
          <div v-if="resolutionError" class="alert alert-danger py-2 mb-3">{{ resolutionError }}</div>
          <div class="d-flex justify-content-end gap-2">
            <button type="button" class="btn btn-light" @click="resolutionModal = false" :disabled="resolutionSubmitting">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="resolutionSubmitting">
              <span v-if="resolutionSubmitting" class="spinner-border spinner-border-sm me-1"></span>
              <i v-else class="ri-save-line me-1"></i>Save Resolution
            </button>
          </div>
        </form>
      </BModal>

      <BModal
        v-model="assignmentModal"
        title="Manage Ticket Assignment"
        centered
        hide-footer
        modal-class="ticket-assignment-modal"
      >
        <form @submit.prevent="saveAssignments">
          <div class="mb-3">
            <label class="form-label fw-semibold">Add Assignees (Type User or Group Name)</label>
            <Multiselect
              v-model="assignmentForm.assignees"
              mode="tags"
              :options="availableAssigneeOptions"
              :close-on-select="false"
              :searchable="true"
              label="label"
              track-by="value"
              placeholder="Select users or groups"
            />
          </div>

          <div class="mb-3">
            <label class="form-label fw-semibold">Add Followers (Type User or Group Name)</label>
            <Multiselect
              v-model="assignmentForm.followers"
              mode="tags"
              :options="availableFollowerOptions"
              :close-on-select="false"
              :searchable="true"
              label="label"
              track-by="value"
              placeholder="Select users or groups"
            />
            <div class="form-text">Followers receive updates but are not assigned responsibility.</div>
          </div>

          <div v-if="assignmentError" class="alert alert-danger py-2 mb-3">{{ assignmentError }}</div>

          <div class="d-flex justify-content-end gap-2">
            <button type="button" class="btn btn-light" @click="assignmentModal = false" :disabled="assignmentSubmitting">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="assignmentSubmitting">
              <span v-if="assignmentSubmitting" class="spinner-border spinner-border-sm me-1"></span>
              <i v-else class="ri-save-line me-1"></i>Save Changes
            </button>
          </div>
        </form>
      </BModal>
    </template>
    </div>
  </Layout>
</template>

<style>
.description-text,
.comment-message { white-space: pre-line; line-height: 1.7; }
.description-text {
  display: block;
  width: 100%;
  max-width: 100%;
  overflow-wrap: anywhere;
  word-break: break-word;
}
.ticket-loading-bar {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1100;
  width: 100%;
  height: 3px;
  overflow: hidden;
  background: transparent;
}
.ticket-loading-bar span {
  display: block;
  width: 35%;
  height: 100%;
  background: var(--vz-primary, #405189);
  animation: ticket-loading-slide 1.2s ease-in-out infinite;
}
.ticket-attachment-preview { min-height: 180px; }
.ticket-attachment-preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 20000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(0, 0, 0, .72);
}
.ticket-attachment-preview-dialog {
  width: min(1100px, 100%);
  max-height: 92vh;
  overflow: hidden;
  border: 1px solid var(--vz-border-color);
  border-radius: .5rem;
  background: var(--vz-card-bg, #fff);
  box-shadow: 0 1rem 3rem rgba(0, 0, 0, .35);
}
.ticket-preview-image,
.ticket-preview-media,
.ticket-preview-frame {
  display: block;
  width: 100%;
  max-height: 65vh;
  border: 1px solid var(--vz-border-color);
  border-radius: .35rem;
  object-fit: contain;
  background: var(--vz-body-bg, #f8f9fa);
}
.ticket-preview-image { height: auto; }
.ticket-preview-media { height: 65vh; }
.ticket-preview-frame { height: 65vh; }
.ticket-page-loading button,
.ticket-page-loading input,
.ticket-page-loading textarea,
.ticket-page-loading select {
  pointer-events: none;
  opacity: .55;
}
@keyframes ticket-loading-slide {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(180%); }
  100% { transform: translateX(300%); }
}
.ticket-activity-tabs .nav-link {
  color: var(--vz-secondary-color);
  border: 0;
  border-bottom: 2px solid transparent;
  padding: .5rem .75rem;
}
.ticket-activity-tabs .nav-link.active {
  color: var(--vz-primary);
  border-bottom-color: var(--vz-primary);
  background: transparent;
}
.ticket-left-timeline { position: relative; isolation: isolate; margin-left: 1.25rem; padding: .5rem 0 1rem 4.75rem; }
.ticket-left-timeline::before {
  content: "";
  position: absolute;
  top: 1.75rem;
  bottom: 1.75rem;
  left: 2.25rem;
  z-index: 0;
  width: 2px;
  background: var(--vz-border-color);
}
.ticket-timeline-day { position: relative; z-index: 1; }
.ticket-timeline-day + .ticket-timeline-day { margin-top: 2rem; }
.ticket-timeline-date {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 6.5rem;
  height: 6.5rem;
  min-height: 6.5rem;
  flex: 0 0 6.5rem;
  margin-left: -5.75rem;
  border-radius: 50%;
  background: var(--vz-primary-bg-subtle, #eef0f7);
  color: var(--vz-primary, #405189);
  font-size: .8rem;
  font-weight: 600;
  text-align: center;
}
[data-bs-theme="dark"] .ticket-timeline-date,
[data-layout-mode="dark"] .ticket-timeline-date {
  /* Opaque surface masks the connector line beneath the date bubble. */
  background: #171e3a;
}
.ticket-timeline-events { margin-top: 1.35rem; }
.ticket-timeline-item { position: relative; display: flex; gap: .75rem; padding-bottom: 1.25rem; }
.ticket-timeline-item:last-child { padding-bottom: 0; }
.ticket-timeline-time {
  position: absolute;
  top: .2rem;
  left: -1.85rem;
  width: max-content;
  color: var(--vz-body-color);
  font-size: .75rem;
  line-height: 1.2;
  white-space: nowrap;
  text-align: left;
  transform: translateX(.75rem);
}
.ticket-timeline-marker {
  position: absolute;
  left: -2.75rem;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: .75rem;
  height: .75rem;
  border: 2px solid var(--vz-card-bg, #fff);
  border-radius: 50%;
  background: var(--vz-success, #0ab39c);
  color: transparent;
  font-size: 0;
}
.ticket-timeline-content {
  width: 100%;
  position: relative;
  border: 1px solid var(--vz-border-color);
  border-radius: .35rem;
  background: var(--vz-card-bg, #fff);
  padding: 1rem 1.25rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, .03);
}
.ticket-timeline-status {
  color: var(--vz-primary, #405189);
  font-size: .75rem;
  font-weight: 700;
  letter-spacing: .04em;
  text-transform: uppercase;
}
.ticket-history-timeline {
  max-height: 560px;
  overflow-y: auto;
  padding-right: .5rem;
  scrollbar-width: thin;
}
.ticket-comments-panel {
  max-height: 560px;
  overflow-y: auto;
  padding-right: .5rem;
  scrollbar-width: thin;
}
.ticket-comments-panel > form {
  position: sticky;
  bottom: 0;
  z-index: 20;
  margin-right: -.5rem;
  padding: .75rem 0 0;
  background-color: #fff !important;
  opacity: 1 !important;
}
.ticket-comments-panel::-webkit-scrollbar { width: 4px; }
.ticket-comments-panel::-webkit-scrollbar-track { background: transparent; }
.ticket-comments-panel::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: var(--vz-secondary-bg, #ced4da);
}
.ticket-history-timeline::-webkit-scrollbar { width: 4px; }
.ticket-history-timeline::-webkit-scrollbar-track { background: transparent; }
.ticket-history-timeline::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: var(--vz-secondary-bg, #ced4da);
}
.ticket-timeline-content::before {
  content: "";
  position: absolute;
  top: .9rem;
  left: -.45rem;
  width: .8rem;
  height: .8rem;
  border-left: 1px solid var(--vz-border-color);
  border-bottom: 1px solid var(--vz-border-color);
  background: var(--vz-card-bg, #fff);
  transform: rotate(45deg);
}
.ticket-timeline-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: .35rem;
  background: var(--vz-primary-bg-subtle, #eef0f7);
  color: var(--vz-primary, #405189);
  font-size: .7rem;
  font-weight: 700;
}

.ticket-avatar-group {
  display: inline-flex;
  align-items: center;
  padding-left: 4px;
}

.ticket-avatar {
  width: 30px;
  height: 30px;
  margin-left: -4px;
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

.ticket-avatar-more {
  background: var(--vz-light, #f3f6f9);
  color: var(--vz-secondary-color, #878a99);
}

.ticket-avatar-add {
  margin-left: 2px;
  border: 1px solid var(--vz-border-color, #e9ebec);
  background: var(--vz-light, #f3f6f9);
  color: var(--vz-primary, #405189);
  font-size: 18px;
  font-weight: 400;
}

.ticket-details-table > tbody > tr > td {
  padding-top: 0.45rem;
  padding-bottom: 0.45rem;
}

.ticket-resolution-grid {
  display: grid;
  gap: 0.9rem;
}

.ticket-resolution-entry {
  border-color: var(--vz-border-color) !important;
}

.ticket-header-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.45rem 0.9rem;
}

.ticket-reference {
  color: var(--vz-primary, #405189);
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.ticket-reference-copy {
  width: 24px;
  height: 24px;
  padding: 0;
  border-radius: 50%;
}

.comment-input-wrap {
  position: relative;
  z-index: 30;
  isolation: isolate;
  background-color: #fff;
}

.comment-input-wrap.dropzone-active .comment-composer-textarea {
  border-color: var(--vz-primary, #405189);
  background: var(--vz-primary-bg-subtle, #e9eafc);
}

.comment-composer-textarea {
  border-radius: 14px;
  resize: vertical;
  padding-bottom: 2.6rem;
  background-color: #fff !important;
  opacity: 1 !important;
}

[data-bs-theme="dark"] .ticket-comments-panel > form,
[data-layout-mode="dark"] .ticket-comments-panel > form,
[data-bs-theme="dark"] .comment-composer-textarea,
[data-layout-mode="dark"] .comment-composer-textarea {
  background-color: var(--vz-card-bg, #212529) !important;
}
[data-bs-theme="dark"] .comment-input-wrap,
[data-layout-mode="dark"] .comment-input-wrap {
  background-color: var(--vz-card-bg, #212529);
}
[data-bs-theme="dark"] .comment-composer-textarea,
[data-layout-mode="dark"] .comment-composer-textarea {
  color: #e9eef5 !important;
  border-color: #34495e;
}
[data-bs-theme="dark"] .comment-composer-textarea::placeholder,
[data-layout-mode="dark"] .comment-composer-textarea::placeholder {
  color: #9aa9bd;
}
[data-bs-theme="dark"] .comment-composer-actions .btn-light,
[data-layout-mode="dark"] .comment-composer-actions .btn-light {
  background-color: #082d5c;
  border-color: #123f75;
}

.comment-composer-actions {
  position: absolute;
  left: 8px;
  bottom: 8px;
  display: inline-flex;
  gap: 4px;
}

.comment-template-popover {
  position: absolute;
  z-index: 10001 !important;
  left: 0;
  bottom: calc(100% + 8px);
  width: min(360px, 100%);
  max-height: 360px;
  overflow-y: auto;
  padding: 10px;
  border: 1px solid var(--vz-border-color);
  border-radius: 8px;
  background-color: #ffffff !important;
  color: #212529;
  opacity: 1 !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.14);
}

.comment-template-item {
  display: block;
  width: 100%;
  padding: 8px 10px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  text-align: left;
  font-size: 12px;
  overflow-wrap: anywhere;
}

.comment-template-item:hover {
  background: var(--vz-light, #f3f6f9);
}
.comment-mention-popover {
  position: absolute;
  left: 8px;
  bottom: calc(100% + 8px);
  z-index: 20000;
  width: min(300px, calc(100% - 16px));
  max-height: 220px;
  overflow-y: auto;
  padding: 6px;
  border: 1px solid var(--vz-border-color);
  border-radius: 8px;
  background-color: #fff !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, .14);
}
.comment-mention-item {
  display: flex;
  align-items: center;
  width: 100%;
  gap: .5rem;
  padding: .4rem .5rem;
  border: 0;
  border-radius: 6px;
  background: transparent;
}
.comment-mention-item:hover { background: var(--vz-light, #f3f6f9); }
[data-bs-theme="dark"] .comment-mention-popover,
[data-layout-mode="dark"] .comment-mention-popover {
  background-color: var(--vz-card-bg, #212529) !important;
}

[data-bs-theme="dark"] .comment-template-popover,
[data-layout-mode="dark"] .comment-template-popover {
  background-color: #212529 !important;
  color: #f3f6f9;
}

.ticket-duration-card {
  border: 1px solid var(--vz-border-color) !important;
}

.ticket-duration-clock {
  position: relative;
  width: 62px;
  height: 62px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--vz-primary, #405189);
  border-radius: 50%;
  color: var(--vz-primary, #405189);
}

.ticket-duration-clock::before {
  content: "";
  position: absolute;
  left: calc(50% - 1px);
  bottom: 50%;
  width: 2px;
  height: 21px;
  border-radius: 2px;
  background: var(--vz-primary, #405189);
  transform-origin: bottom center;
  animation: ticket-clock-tick 60s steps(60, end) infinite;
}

.ticket-duration-clock::after {
  content: "";
  position: absolute;
  width: 6px;
  height: 6px;
  left: calc(50% - 3px);
  top: calc(50% - 3px);
  border-radius: 50%;
  background: var(--vz-primary, #405189);
}

@keyframes ticket-clock-tick {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.ticket-duration-counter {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.ticket-duration-number {
  padding: 8px 4px;
  border-radius: 6px;
  background: var(--vz-primary, #405189);
  color: #aebcff;
  font-size: 24px;
  font-weight: 700;
}

.ticket-duration-counter small {
  display: block;
  margin-top: 4px;
  color: var(--vz-secondary-color, #878a99);
  font-size: 9px;
  font-weight: 700;
}

.ticket-assignment-modal {
  z-index: 1060 !important;
}

.ticket-assignment-modal .modal-dialog {
  z-index: 1056 !important;
}

.ticket-assignment-modal .modal-content {
  background-color: var(--vz-card-bg, #ffffff) !important;
  color: var(--vz-body-color, #212529) !important;
  border: 1px solid var(--vz-border-color, #e9ebec) !important;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3) !important;
}

[data-bs-theme="dark"] .ticket-assignment-modal .modal-content,
[data-layout-mode="dark"] .ticket-assignment-modal .modal-content {
  background-color: #212529 !important;
  color: #ced4da !important;
  border-color: rgba(255, 255, 255, 0.12) !important;
}

[data-bs-theme="dark"] .ticket-assignment-modal .form-label,
[data-layout-mode="dark"] .ticket-assignment-modal .form-label {
  color: #f3f6f9 !important;
}

[data-bs-theme="dark"] .ticket-assignment-modal .multiselect,
[data-layout-mode="dark"] .ticket-assignment-modal .multiselect {
  background: #2a3036 !important;
  border-color: rgba(255, 255, 255, 0.14) !important;
  color: #f3f6f9 !important;
}

.ticket-group-card {
  background: var(--vz-card-bg, #ffffff);
  border: 1px solid var(--vz-border-color, #e9ebec);
  transition: all 0.2s ease;
}

[data-bs-theme="dark"] .ticket-group-card,
[data-layout-mode="dark"] .ticket-group-card {
  background: #1e2429;
  border-color: rgba(255, 255, 255, 0.1);
}

.ticket-member-item {
  background: var(--vz-light, #f8f9fa);
  border: 1px solid var(--vz-border-color, #e9ebec);
  border-radius: 6px;
  transition: all 0.15s ease-in-out;
}

.ticket-member-item:hover {
  background: var(--vz-secondary-bg, #f3f6f9);
}

[data-bs-theme="dark"] .ticket-member-item,
[data-layout-mode="dark"] .ticket-member-item {
  background: #272d34;
  border-color: rgba(255, 255, 255, 0.08);
}

[data-bs-theme="dark"] .ticket-member-item:hover,
[data-layout-mode="dark"] .ticket-member-item:hover {
  background: #2f363f;
}
</style>
