<script>
export default {
  name: "Error404Basic",
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
  <div class="auth-page-wrapper pt-5">
    <div class="auth-page-content">
      <BContainer>
        <BRow>
          <BCol lg="12">
            <div class="text-center pt-4">
              <div class="mb-3">
                <img src="@/assets/images/error.svg" alt="" class="error-basic-img move-animation" style="max-height: 240px;">
              </div>
              <div>
                <h1 class="display-1 fw-bold text-primary">404</h1>
                <h3 class="text-uppercase fw-semibold">Sorry, Page Not Found 😭</h3>
                <p class="text-muted mb-2 fs-15">
                  The page you are looking for is not available or does not exist.
                </p>
                <p v-if="$route.path" class="text-muted mb-4 fs-13">
                  Requested URL: <code class="text-danger bg-danger-subtle px-2 py-1 rounded">{{ $route.path }}</code>
                </p>
                <div class="d-flex justify-content-center gap-2">
                  <button type="button" @click="goBack" class="btn btn-outline-secondary px-3">
                    <i class="ri-arrow-left-line me-1 align-middle"></i> Go Back
                  </button>
                  <router-link to="/" class="btn btn-primary px-3">
                    <i class="mdi mdi-home me-1 align-middle"></i> Back to Home
                  </router-link>
                </div>
              </div>
            </div>
          </BCol>
        </BRow>
      </BContainer>
    </div>

    <footer class="footer">
      <BContainer>
        <BRow>
          <BCol lg="12">
            <div class="text-center">
              <p class="mb-0 text-muted">&copy; {{ new Date().getFullYear() }} Velzon. All rights reserved.</p>
            </div>
          </BCol>
        </BRow>
      </BContainer>
    </footer>
  </div>
</template>