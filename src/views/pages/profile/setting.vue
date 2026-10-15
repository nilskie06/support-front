<script>
import axios from 'axios';
import Layout from '@/layouts/main.vue';
import PageHeader from '@/components/page-header';

export default {
  name: 'ProfileSettingPage',
  components: { Layout, PageHeader },
  data() { return { form: { fullname: '', username: '', email: '' }, user: null, loading: false, saving: false }; },
  computed: {
    apiBase() { return process.env.VUE_APP_AUTHDOMAIN || 'http://localhost:8001/api'; },
    initials() { return (this.form.fullname || this.form.email || 'User').split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase(); },
    role() { return this.user?.role ? `${this.user.role.charAt(0).toUpperCase()}${this.user.role.slice(1)}` : 'User'; },
  },
  methods: {
    headers() { const token = localStorage.getItem('jwt') || localStorage.getItem('token'); return token ? { Authorization: `Bearer ${token}` } : {}; },
    populate(user) { this.user = user; this.form = { fullname: user.fullname || user.name || '', username: user.username || '', email: user.email || '' }; },
    async loadProfile() { try { const response = await axios.get(`${this.apiBase}/user`, { headers: this.headers(), timeout: 8000 }); this.populate(response.data.user || response.data); } catch (error) { console.warn('Unable to refresh profile from the API:', error); } },
    async saveProfile() { this.saving = true; try { const response = await axios.put(`${this.apiBase}/user/profile`, this.form, { headers: this.headers() }); const user = response.data.data; this.populate(user); localStorage.setItem('user', JSON.stringify(user)); sessionStorage.setItem('authUser', JSON.stringify(user)); window.dispatchEvent(new CustomEvent('user-profile-updated', { detail: user })); this.$swal?.fire({ icon: 'success', title: 'Profile updated', timer: 1400, showConfirmButton: false }); } catch (error) { const message = error.response?.data?.message || Object.values(error.response?.data?.errors || {}).flat()[0] || 'Unable to update your profile.'; this.$swal?.fire({ icon: 'error', title: 'Save failed', text: message }); } finally { this.saving = false; } },
  },
  mounted() { try { const cached = JSON.parse(sessionStorage.getItem('authUser') || localStorage.getItem('user') || 'null'); if (cached) this.populate(cached); } catch (error) { console.warn('Unable to load the cached profile:', error); } this.loadProfile(); },
};
</script>

<template>
  <Layout>
    <PageHeader title="Profile Settings" pageTitle="Account" />
    <BRow class="justify-content-center">
      <BCol xl="9" xxl="8">
        <BCard no-body class="border-0 shadow-sm">
          <BCardBody class="p-4 p-md-5">
            <div class="d-flex align-items-center gap-3 mb-4 pb-4 border-bottom">
              <span class="avatar-lg"><span class="avatar-title rounded-circle bg-primary-subtle text-primary fs-4">{{ initials }}</span></span>
              <div><h5 class="mb-1">{{ form.fullname || 'Your profile' }}</h5><p class="text-muted mb-0"><span class="badge bg-primary-subtle text-primary me-1">{{ role }}</span> Manage your account details</p></div>
            </div>
            <div v-if="loading" class="py-5 text-center text-muted"><span class="spinner-border spinner-border-sm me-2"></span>Loading profile...</div>
            <form v-else @submit.prevent="saveProfile">
              <BRow class="g-3"><BCol md="6"><label class="form-label">Full name <span class="text-danger">*</span></label><input v-model.trim="form.fullname" class="form-control" required maxlength="255" /></BCol><BCol md="6"><label class="form-label">Username</label><input v-model.trim="form.username" class="form-control" maxlength="255" placeholder="Optional username" /></BCol><BCol md="12"><label class="form-label">Email address <span class="text-danger">*</span></label><input v-model.trim="form.email" type="email" class="form-control" required maxlength="255" /></BCol><BCol md="6"><label class="form-label">Role</label><input :value="role" class="form-control" disabled /></BCol><BCol md="6"><label class="form-label">Account status</label><input :value="user?.status || 'Active'" class="form-control text-capitalize" disabled /></BCol></BRow>
              <div class="mt-4 pt-3 border-top text-end"><BButton type="submit" variant="primary" :disabled="saving"><span v-if="saving" class="spinner-border spinner-border-sm me-1"></span><i v-else class="ri-save-line me-1"></i>{{ saving ? 'Saving...' : 'Save Changes' }}</BButton></div>
            </form>
          </BCardBody>
        </BCard>
      </BCol>
    </BRow>
  </Layout>
</template>
