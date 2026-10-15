import { reactive } from 'vue';

export const routeLoading = reactive({
  isLoading: false,
  message: 'Loading...',
  showOverlay: false,
  timer: null,

  start(message = 'Loading...') {
    this.isLoading = true;
    this.message = message;
    if (this.timer) {
      clearTimeout(this.timer);
    }
    // Show full overlay spinner if navigation takes longer than 120ms
    this.timer = setTimeout(() => {
      if (this.isLoading) {
        this.showOverlay = true;
      }
    }, 120);
  },

  done() {
    this.isLoading = false;
    this.showOverlay = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  },
});
