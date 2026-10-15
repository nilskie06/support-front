<script>
import axios from 'axios';

export default {
  data() {
    return { password: '', currentUser: null, error: '', unlocking: false };
  },
  computed: {
    name() { return this.currentUser?.fullname || this.currentUser?.name || this.currentUser?.email || 'User'; },
    initials() { return this.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase(); },
  },
  mounted() {
    try { this.currentUser = JSON.parse(sessionStorage.getItem('authUser') || localStorage.getItem('user') || 'null'); } catch (error) { this.currentUser = null; }
  },
  methods: {
    async unlock() {
      if (!this.password) { this.error = 'Password is required.'; return; }
      this.unlocking = true; this.error = '';
      try {
        const token = localStorage.getItem('jwt') || localStorage.getItem('token');
        await axios.post(`${process.env.VUE_APP_AUTHDOMAIN || 'http://localhost:8001/api'}/user/unlock`, { password: this.password }, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        this.$router.push('/');
      } catch (error) {
        this.error = error.response?.data?.errors?.password?.[0] || error.response?.data?.message || 'Unable to unlock the screen.';
      } finally { this.unlocking = false; }
    },
  },
};
</script>

<template>
  <div class="auth-page-wrapper min-vh-100 d-flex align-items-center">
    <div class="lock-grid"></div>
    <div class="lock-ambient lock-ambient-one"></div>
    <div class="lock-ambient lock-ambient-two"></div>
    <BContainer>
      <BRow class="justify-content-center">
        <BCol md="7" lg="5" xl="4">
          <BCard no-body class="border-0 shadow-sm lock-card">
            <BCardBody class="p-4 p-sm-5 text-center">
              <span class="avatar-lg mb-3 d-inline-flex"><span class="avatar-title rounded-circle bg-primary-subtle text-primary fs-4">{{ initials }}</span></span>
              <h4 class="mb-1">{{ name }}</h4>
              <p class="text-muted mb-4">Screen is locked</p>
              <form @submit.prevent="unlock">
                <label class="form-label text-start d-block" for="userpassword">Password</label>
                <input id="userpassword" v-model="password" type="password" class="form-control" :class="{ 'is-invalid': error }" autocomplete="current-password" placeholder="Enter password" required @input="error = ''">
                <div v-if="error" class="invalid-feedback d-block text-start">{{ error }}</div>
                <BButton variant="primary" class="w-100 mt-3" type="submit" :disabled="unlocking"><span v-if="unlocking" class="spinner-border spinner-border-sm me-1"></span><i v-else class="ri-lock-unlock-line me-1"></i>{{ unlocking ? 'Unlocking...' : 'Unlock' }}</BButton>
              </form>
              <router-link to="/logout" class="btn btn-link text-muted mt-3">Sign in as another user</router-link>
            </BCardBody>
          </BCard>
        </BCol>
      </BRow>
    </BContainer>
  </div>
</template>

<style scoped>
.auth-page-wrapper { position: relative; overflow: hidden; background: #09090b; }
.auth-page-wrapper :deep(.container) { position: relative; z-index: 1; }
.lock-grid { position: absolute; inset: 0; opacity: .13; background-image: linear-gradient(rgba(211, 29, 35, .18) 1px, transparent 1px), linear-gradient(90deg, rgba(211, 29, 35, .18) 1px, transparent 1px); background-size: 42px 42px; mask-image: linear-gradient(to right, black, transparent 72%); }
.lock-ambient { position: absolute; border-radius: 50%; filter: blur(12px); pointer-events: none; }
.lock-ambient-one { top: -220px; left: -130px; width: 520px; height: 520px; background: radial-gradient(circle, rgba(209, 10, 17, .24), transparent 68%); }
.lock-ambient-two { right: -280px; bottom: -320px; width: 620px; height: 620px; background: radial-gradient(circle, rgba(145, 10, 15, .24), transparent 68%); }
.lock-card { background: #f8fafc; color: #1e293b; }
.lock-card :deep(.form-label), .lock-card :deep(h4) { color: #1e293b; }
.lock-card :deep(.text-muted) { color: #64748b !important; }
.lock-card :deep(.form-control) { background: #fff; color: #0f172a; border-color: #cbd5e1; }
.lock-card :deep(.form-control::placeholder) { color: #94a3b8; opacity: 1; }
.lock-card :deep(.form-control:focus) { background: #fff; color: #0f172a; border-color: var(--vz-primary, #405189); box-shadow: 0 0 0 .2rem rgba(64, 81, 137, .15); }
</style>
