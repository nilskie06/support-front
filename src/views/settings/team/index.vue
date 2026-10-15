<template>
  <Layout>
    <PageHeader title="Team Management" pageTitle="Settings" />

    <BCard no-body class="shadow-sm border-0">
      <BCardHeader class="border-0 bg-transparent py-3">
        <div class="d-flex align-items-center justify-content-between gap-2 flex-wrap">
          <div>
            <h5 class="card-title mb-1 fw-bold">Teams & Groups</h5>
            <p class="text-muted mb-0 fs-13">Manage departments, approvers, companies, and team members.</p>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-outline-secondary" type="button" :disabled="loading" @click="fetchGroups">
              <i class="ri-refresh-line" :class="{ 'ri-spin': loading }"></i>
            </button>
            <button class="btn btn-sm btn-primary" type="button" @click="openCreate">
              <i class="ri-group-line me-1"></i> Create Team
            </button>
          </div>
        </div>
      </BCardHeader>

      <BCardBody class="py-3">
        <div class="search-box" style="max-width: 420px">
          <input v-model="search" class="form-control search" placeholder="Search teams or groups..." />
          <i class="ri-search-line search-icon text-muted"></i>
        </div>
      </BCardBody>

      <BCardBody class="p-0">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary"></div>
          <p class="text-muted mt-2 mb-0">Loading teams...</p>
        </div>
        <div v-else-if="filteredGroups.length === 0" class="text-center py-5 text-muted">
          No teams or groups found.
        </div>
        <div v-else class="table-responsive">
          <table class="table align-middle table-hover mb-0">
            <thead class="table-light text-muted text-uppercase fs-11">
              <tr>
                <th class="ps-3">Team / Group Name</th>
                <th>Department</th>
                <th>Company</th>
                <th>Group Approver</th>
                <th>Members</th>
                <th class="text-end pe-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="group in filteredGroups" :key="group.id">
                <td class="ps-3 fw-semibold">{{ group.name }}</td>
                <td>{{ group.department?.name || 'All Departments' }}</td>
                <td>
                  <span v-for="company in group.companies || []" :key="company.id" class="badge bg-primary-subtle text-primary me-1">
                    {{ company.name }}
                  </span>
                  <span v-if="!group.companies?.length" class="text-muted">All Companies</span>
                </td>
                <td>
                  <span
                    v-for="approver in group.approvers || []"
                    :key="approver.id"
                    class="team-user-avatar bg-warning-subtle text-warning"
                    :title="userName(approver)"
                  >
                    {{ userInitials(approver) }}
                  </span>
                  <span v-if="!group.approvers?.length" class="text-muted">Not assigned</span>
                </td>
                <td>
                  <div v-if="group.members?.length" class="team-user-avatar-group">
                    <span
                      v-for="member in (group.members || []).slice(0, 5)"
                      :key="member.id"
                      class="team-user-avatar bg-primary-subtle text-primary"
                      :title="userName(member)"
                    >
                      {{ userInitials(member) }}
                    </span>
                    <span v-if="group.members.length > 5" class="team-user-avatar team-user-more" :title="`${group.members.length - 5} more members`">
                      +{{ group.members.length - 5 }}
                    </span>
                  </div>
                  <span v-else class="text-muted">None</span>
                </td>
                <td class="text-end pe-3">
                  <button class="btn btn-sm btn-ghost-secondary me-1" type="button" title="Edit" @click="openEdit(group)">
                    <i class="ri-pencil-line"></i>
                  </button>
                  <button class="btn btn-sm btn-ghost-danger" type="button" title="Delete" @click="removeGroup(group)">
                    <i class="ri-delete-bin-line"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </BCardBody>
    </BCard>

    <BModal
      v-model="modalShow"
      id="teamModal"
      modal-class="zoomIn team-modal"
      :title="editingId ? 'Edit Team / Group' : 'Create Team / Group'"
      title-class="fw-bold fs-15"
      hide-footer
      header-class="p-3 bg-primary-subtle"
      class="v-modal-custom"
      centered
      body-class="p-4"
    >
      <form @submit.prevent="submit">
        <div v-if="formError" class="alert alert-danger py-2">{{ formError }}</div>
        <div class="mb-3">
          <label class="form-label fw-semibold">Team Name or Group Name <span class="text-danger">*</span></label>
          <input v-model.trim="form.name" class="form-control" required placeholder="e.g. IT Support Team" />
        </div>
        <div class="mb-3">
          <label class="form-label fw-semibold">Department</label>
          <select v-model="form.department_id" class="form-select">
            <option :value="null">All Departments</option>
            <option v-for="department in lookups.departments" :key="department.id" :value="department.id">{{ department.name }}</option>
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label fw-semibold">Company</label>
          <Multiselect
            v-model="form.company_ids"
            :options="companyOptions"
            mode="tags"
            searchable
            :close-on-select="false"
            :clear-on-select="false"
            placeholder="Select companies"
            no-options-text="No companies found"
          />
        </div>
        <div class="mb-3">
          <label class="form-label fw-semibold">Group Approver</label>
          <Multiselect
            v-model="form.approver_ids"
            :options="memberOptions"
            mode="tags"
            searchable
            :close-on-select="false"
            :clear-on-select="false"
            placeholder="Search and select approvers"
            no-options-text="No matching users found"
          />
          <small class="text-muted">Select one or more approvers. All approvers are automatically added as members.</small>
        </div>
        <div class="mb-3">
          <label class="form-label fw-semibold">Members</label>
          <Multiselect
            v-model="form.member_ids"
            :options="memberOptions"
            mode="tags"
            searchable
            :close-on-select="false"
            :clear-on-select="false"
            placeholder="Search and select members"
            no-options-text="No matching users found"
          />
        </div>
        <div class="d-flex justify-content-end gap-2 border-top pt-3">
          <button type="button" class="btn btn-ghost-secondary" @click="modalShow = false">Cancel</button>
          <button type="submit" class="btn btn-primary" :disabled="submitting">
            <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
            {{ editingId ? 'Save Changes' : 'Create Team' }}
          </button>
        </div>
      </form>
    </BModal>
  </Layout>
</template>

<script>
import axios from "axios";
import Swal from "sweetalert2";
import Multiselect from "@vueform/multiselect";
import "@vueform/multiselect/themes/default.css";
import Layout from "@/layouts/main.vue";
import PageHeader from "@/components/page-header";

export default {
  name: "TeamSettings",
  components: { Layout, PageHeader, Multiselect },
  data() {
    return {
      loading: false,
      submitting: false,
      groups: [],
      search: "",
      modalShow: false,
      editingId: null,
      formError: "",
      lookups: { departments: [], companies: [], users: [] },
      form: { name: "", department_id: null, approver_ids: [], company_ids: [], member_ids: [] },
    };
  },
  computed: {
    apiBase() {
      return process.env.VUE_APP_AUTHDOMAIN || "http://localhost:8001/api";
    },
    filteredGroups() {
      const query = this.search.trim().toLowerCase();
      if (!query) return this.groups;
      return this.groups.filter((group) => (group.name || "").toLowerCase().includes(query));
    },
    availableMembers() {
      if (!this.form.department_id) return this.lookups.users;
      const department = this.lookups.departments.find(
        (item) => Number(item.id) === Number(this.form.department_id)
      );
      if (!department) return this.lookups.users;

      return this.lookups.users.filter((user) =>
        (user.assigned_departments || user.assignedDepartments || []).some(
          (assignment) => String(assignment.reference_code) === String(department.code)
        )
      );
    },
    companyOptions() {
      return this.lookups.companies.map((company) => ({
        value: company.id,
        label: company.code ? `${company.code} - ${company.name}` : company.name,
      }));
    },
    memberOptions() {
      return this.availableMembers.map((user) => ({
        value: user.id,
        label: this.userName(user),
      }));
    },
  },
  mounted() {
    this.fetchLookups();
    this.fetchGroups();
  },
  methods: {
    emptyForm() {
      return { name: "", department_id: null, approver_ids: [], company_ids: [], member_ids: [] };
    },
    headers() {
      const token = localStorage.getItem("jwt") || localStorage.getItem("token");
      return token ? { Authorization: `Bearer ${token}` } : {};
    },
    userName(user) {
      return user ? (user.fullname || user.name || user.email) : "";
    },
    userInitials(user) {
      const name = this.userName(user).trim();
      if (!name) return "?";
      const parts = name.split(/\s+/).filter(Boolean);
      return (parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : name.slice(0, 2)).toUpperCase();
    },
    async fetchLookups() {
      try {
        const response = await axios.get(`${this.apiBase}/groups/lookups`, { headers: this.headers() });
        this.lookups = {
          departments: response.data?.departments || [],
          companies: response.data?.companies || [],
          users: response.data?.users || [],
        };
      } catch (error) {
        this.formError = error.response?.data?.message || "Failed to load team lookups.";
      }
    },
    async fetchGroups() {
      this.loading = true;
      try {
        const response = await axios.get(`${this.apiBase}/groups`, { headers: this.headers() });
        this.groups = response.data?.data || [];
      } catch (error) {
        Swal.fire({ icon: "error", title: "Failed to load teams", text: error.response?.data?.message || error.message });
      } finally {
        this.loading = false;
      }
    },
    openCreate() {
      this.editingId = null;
      this.form = this.emptyForm();
      this.formError = "";
      this.modalShow = true;
    },
    openEdit(group) {
      this.editingId = group.id;
      this.form = {
        name: group.name || "",
        department_id: group.department_id || null,
        approver_ids: (group.approvers || []).map((approver) => approver.id),
        company_ids: (group.companies || []).map((company) => company.id),
        member_ids: (group.members || []).map((member) => member.id),
      };
      this.formError = "";
      this.modalShow = true;
    },
    async submit() {
      this.submitting = true;
      this.formError = "";
      const memberIds = [...new Set([...(this.form.member_ids || []), ...(this.form.approver_ids || [])])];
      try {
        const payload = { ...this.form, member_ids: memberIds };
        const request = this.editingId
          ? axios.put(`${this.apiBase}/groups/${this.editingId}`, payload, { headers: this.headers() })
          : axios.post(`${this.apiBase}/groups`, payload, { headers: this.headers() });
        await request;
        this.modalShow = false;
        await this.fetchGroups();
        Swal.fire({ icon: "success", title: "Saved", text: "Team saved successfully.", toast: true, position: "top-end", timer: 1800, showConfirmButton: false });
      } catch (error) {
        this.formError = error.response?.data?.message || "Failed to save team.";
      } finally {
        this.submitting = false;
      }
    },
    async removeGroup(group) {
      const result = await Swal.fire({ title: `Delete ${group.name}?`, icon: "warning", showCancelButton: true, confirmButtonText: "Delete" });
      if (!result.isConfirmed) return;
      try {
        await axios.delete(`${this.apiBase}/groups/${group.id}`, { headers: this.headers() });
        await this.fetchGroups();
      } catch (error) {
        Swal.fire({ icon: "error", title: "Delete failed", text: error.response?.data?.message || error.message });
      }
    },
  },
};
</script>

<style>
.team-modal {
  z-index: 1060 !important;
}

.team-modal .modal-dialog {
  z-index: 1061 !important;
}

.team-user-avatar-group {
  display: inline-flex;
  align-items: center;
}

.team-user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  border: 2px solid var(--vz-card-bg, #fff);
  margin-left: -5px;
}

.team-user-avatar:first-child {
  margin-left: 0;
}

.team-user-more {
  background: var(--vz-light, #f3f6f9);
  color: var(--vz-secondary-color, #6c757d);
}
</style>
