<script>
export default {
  name: "Error403",
  computed: {
    currentUser() {
      try {
        const raw = sessionStorage.getItem("authUser") || localStorage.getItem("user");
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    },
    blockedPath() {
      return this.$route.query.redirectFrom || this.$route.query.path || "";
    },
  },
  methods: {
    goBack() {
      if (window.history.length > 1) {
        this.$router.back();
      } else {
        this.$router.push("/");
      }
    },
  },
};
</script>

<template>
  <div class="auth-page-wrapper auth-bg-cover py-5 d-flex justify-content-center align-items-center min-vh-100">
    <div class="bg-overlay"></div>
    <div class="auth-page-content overflow-hidden pt-lg-5">
      <BContainer>
        <BRow class="justify-content-center">
          <BCol xl="6" lg="8" md="10">
            <BCard no-body class="overflow-hidden card-bg-fill shadow-lg border-0 rounded-4">
              <div class="card-header bg-danger bg-opacity-10 border-0 py-3 text-center">
                <span class="badge bg-danger fs-11 px-3 py-1 rounded-pill text-uppercase">
                  <i class="ri-shield-keyhole-line me-1"></i> Access Restricted
                </span>
              </div>
              <BCardBody class="p-4 p-md-5 text-center">
                <div class="mb-4">
                  <div class="avatar-lg mx-auto bg-danger-subtle text-danger rounded-circle d-flex align-items-center justify-content-center shadow-sm" style="width: 80px; height: 80px;">
                    <i class="ri-lock-2-line display-4"></i>
                  </div>
                </div>

                <h1 class="display-5 fw-bold text-danger mb-2">403</h1>
                <h4 class="text-uppercase fw-semibold mb-3">Access Denied & Permissions Blocked</h4>
                
                <p class="text-muted mb-4 fs-14">
                  You do not have the required permissions to view or access this module
                  <code v-if="blockedPath" class="text-danger fw-semibold px-2 py-1 bg-danger-subtle rounded ms-1">{{ blockedPath }}</code>.
                  Access has been restricted in accordance with your assigned role and menu permissions.
                </p>

                <div v-if="currentUser" class="alert alert-light border border-dashed rounded-3 p-3 mb-4 text-start">
                  <div class="d-flex align-items-center justify-content-between mb-1">
                    <span class="text-muted fs-12">Current Account:</span>
                    <strong class="text-body fs-13">{{ currentUser.name || currentUser.username || currentUser.email }}</strong>
                  </div>
                  <div class="d-flex align-items-center justify-content-between">
                    <span class="text-muted fs-12">Assigned Role:</span>
                    <span class="badge bg-secondary-subtle text-secondary font-monospace text-uppercase">{{ currentUser.role || 'user' }}</span>
                  </div>
                </div>

                <div class="d-flex justify-content-center gap-2 flex-wrap">
                  <button type="button" @click="goBack" class="btn btn-outline-secondary px-4">
                    <i class="ri-arrow-left-line me-1 align-middle"></i> Go Back
                  </button>
                  <router-link to="/" class="btn btn-primary px-4">
                    <i class="ri-home-4-line me-1 align-middle"></i> Back to Dashboard
                  </router-link>
                </div>
              </BCardBody>
              <div class="card-footer bg-light py-2 text-center text-muted fs-11">
                If you believe this is an error, please request elevated access from your System Administrator.
              </div>
            </BCard>
          </BCol>
        </BRow>
      </BContainer>
    </div>
  </div>
</template>

<style scoped>
.auth-bg-cover {
  background: linear-gradient(135deg, #1f2430 0%, #0e121a 100%);
}
.card-bg-fill {
  background: #ffffff;
}
[data-bs-theme="dark"] .card-bg-fill,
[data-layout-mode="dark"] .card-bg-fill {
  background: #212529;
}
</style>
