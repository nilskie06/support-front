<template>
  <Layout>
    <PageHeader title="Integration API" pageTitle="Settings" />
    <BCard class="border-0 shadow-sm"><BCardBody>
      <h5 class="mb-1">External system integration</h5><p class="text-muted fs-13">Use a System API Key in <code>X-API-Key</code> to create tickets, enroll users, and retrieve ticket configuration.</p>
      <div class="alert alert-info fs-12 mb-4"><strong>Base URL:</strong> {{ apiBase }} &nbsp; • &nbsp; API keys are created from <router-link to="/settings/system">System Management</router-link>.</div>
      <BRow class="g-3"><BCol lg="6"><div class="border rounded p-3 h-100"><h6>Create ticket</h6><code>POST /api/integrations/tickets</code><p class="text-muted fs-12 mt-2 mb-0">Send multipart/form-data. Attach files with <code>attachments[]</code>.</p></div></BCol><BCol lg="6"><div class="border rounded p-3 h-100"><h6>Enroll user</h6><code>POST /api/integrations/users</code><p class="text-muted fs-12 mt-2 mb-2">Required: <code>name</code>, <code>email</code>, and <code>password</code>. <code>username</code> and <code>clone_user_id</code> are optional.</p><div class="alert alert-primary py-2 px-3 fs-12 mb-0"><strong>Default enrollment:</strong> Standard User role, Active status, access synchronized from the Standard User role, and the issuing system assigned as the user’s default system. Add <code>clone_user_id</code> to copy an existing user’s role, access, and assignments.</div></div></BCol></BRow>
    </BCardBody></BCard>
    <BCard class="border-0 shadow-sm"><BCardHeader class="bg-transparent border-bottom p-0"><ul class="nav nav-tabs nav-tabs-custom nav-primary border-0 px-3 pt-2" role="tablist"><li class="nav-item"><a class="nav-link py-3 fs-13 cursor-pointer" :class="{ active: requestTab === 'ticket' }" @click="requestTab = 'ticket'"><i class="ri-ticket-2-line me-1 align-bottom"></i> Create Ticket</a></li><li class="nav-item"><a class="nav-link py-3 fs-13 cursor-pointer" :class="{ active: requestTab === 'user' }" @click="requestTab = 'user'"><i class="ri-user-add-line me-1 align-bottom"></i> Enroll User</a></li></ul></BCardHeader><BCardBody>
      <div v-if="requestTab === 'ticket'">
        <p class="text-muted fs-12">Use <code>multipart/form-data</code> when sending attachments. Add one or more files as <code>attachments[]</code>; each file may be up to 10 MB.</p>
        <pre class="api-example mb-0">POST {{ apiBase }}/integrations/tickets
X-API-Key: your_system_api_key
Content-Type: application/json

{
  "subject": "Unable to access Warehouse Management System",
  "summary": "The warehouse page displays an access denied error.",
  "board_id": 1,
  "system": "SYS-WMS",
  "module": "warehouse",
  "tkt_type_id": 12,
  "issue_type_id": 7,
  "type_other": null,
  "issue_severity_id": 2,
  "board_status_id": 1,
  "date_encountered": "2026-10-15",
  "duration_from": null,
  "duration_to": null,
  "frequency": "Once",
  "url": "https://external-system.example.com/warehouse",
  "department_id": 1,
  "group_id": null,
  "assignees": [2],
  "assigned_groups": [],
  "followers": [3],
  "follower_groups": [],
  "tagged_groups": []
}

// For files, use multipart/form-data and append attachments[] for every file.</pre>
      </div>
      <div v-else>
        <p class="text-muted fs-12">Create a user with Standard User defaults, or add a user ID to clone its role, access, and assignments.</p>
        <pre class="api-example mb-0">POST {{ apiBase }}/integrations/users
X-API-Key: your_system_api_key
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane.doe@company.com",
  "username": "jane.doe",
  "password": "secure-password",
  "clone_user_id": 12
}

// Remove clone_user_id for a Standard User. When supplied, it copies that user's
// role, status, menu access, and entity assignments.</pre>
        <label class="form-label fs-12 fw-semibold mt-3">Success response · 201 Created</label>
        <pre class="api-example mb-0">{
  "success": true,
  "message": "User enrolled successfully.",
  "data": {
    "id": 25,
    "name": "Jane Doe",
    "email": "jane.doe@company.com",
    "role": "users",
    "status": "active",
    "assignments": [],
    "menu_access": []
  }
}</pre>
      </div>
    </BCardBody></BCard>
    <BCard class="border-0 shadow-sm"><BCardHeader><h5 class="mb-0">Configuration lookup endpoint</h5></BCardHeader><BCardBody>
      <label class="form-label fw-semibold fs-13">Select data to retrieve</label>
      <BRow class="g-2 mb-3"><BCol md="4"><select v-model="resource" class="form-select"><option v-for="item in resources" :key="item.value" :value="item.value">{{ item.label }}</option></select></BCol><BCol md="6"><input v-model="apiKey" type="password" name="integration-api-key" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" class="form-control" placeholder="Paste System API key"></BCol><BCol md="2"><button class="btn btn-primary w-100" :disabled="loading || !apiKey" @click="loadLookup">{{ loading ? 'Loading…' : 'Run' }}</button></BCol></BRow>
      <pre class="api-example mb-2">GET {{ apiBase }}/integrations/lookups/{{ resource }}
X-API-Key: your_system_api_key</pre>
      <div v-if="error" class="alert alert-danger py-2 fs-12">{{ error }}</div>
      <label class="form-label fs-12 fw-semibold">Result JSON</label><pre class="api-example result-json mb-0">{{ lookupResult }}</pre>
    </BCardBody></BCard>
  </Layout>
</template>
<script>
import Layout from "@/layouts/main.vue";
import PageHeader from "@/components/page-header";
import axios from "axios";
export default { name: "IntegrationSettings", components: { Layout, PageHeader }, data: () => ({ requestTab: "ticket", resource: "systems", apiKey: "", loading: false, error: "", result: { data: [] }, resources: [{ value: "categories", label: "Categories" }, { value: "ticket-types", label: "Ticket Types" }, { value: "issue-types", label: "Issue Types" }, { value: "systems", label: "Systems" }, { value: "departments", label: "Departments" }, { value: "stations", label: "Stations" }, { value: "severities", label: "Severities" }] }), computed: { apiBase() { return process.env.VUE_APP_AUTHDOMAIN || "http://localhost:8001/api"; }, lookupResult() { return JSON.stringify(this.result, null, 2); } }, methods: { async loadLookup() { this.loading = true; this.error = ""; try { const response = await axios.get(`${this.apiBase}/integrations/lookups/${this.resource}`, { headers: { "X-API-Key": this.apiKey } }); this.result = response.data; } catch (error) { this.result = { data: [] }; this.error = error.response?.data?.message || "Unable to retrieve lookup data."; } finally { this.loading = false; } } } };
</script>
<style scoped>.api-example { padding: 1rem; border-radius: .3rem; background: #1f2937; color: #e5e7eb; font-size: 12px; }.result-json { max-height: 360px; overflow: auto; }</style>
