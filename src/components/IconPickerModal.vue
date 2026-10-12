<template>
  <BModal
    v-model="isOpen"
    id="iconPickerModal"
    modal-class="zoomIn"
    title="Choose an Icon"
    title-class="exampleModalLabel fw-semibold text-primary d-flex align-items-center gap-2"
    header-class="p-3 bg-light border-bottom"
    class="v-modal-custom"
    size="xl"
    hide-footer
    centered
  >
    <div class="icon-picker-container">
      <!-- Top Bar: Libraries & Search -->
      <div class="row g-2 mb-3">
        <!-- Library Tabs -->
        <div class="col-12 col-lg-7">
          <div class="nav-pills-scrollable">
            <ul class="nav nav-pills nav-customs nav-danger flex-nowrap" role="tablist">
              <li
                v-for="lib in libraries"
                :key="lib.id"
                class="nav-item flex-shrink-0"
              >
                <a
                  class="nav-link cursor-pointer py-1 px-3 fs-13 d-flex align-items-center text-nowrap"
                  :class="{ active: selectedLibrary === lib.id }"
                  @click="setLibrary(lib.id)"
                >
                  <span>{{ lib.name }}</span>
                  <span
                    class="badge ms-1 tab-count-badge"
                    :class="selectedLibrary === lib.id ? 'tab-badge-active' : 'tab-badge-inactive'"
                  >
                    {{ lib.countBadge }}
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <!-- Category Dropdown (for Remix or general) -->
        <div class="col-12 col-sm-6 col-lg-2" v-if="selectedLibrary === 'remix' || selectedLibrary === 'all'">
          <select class="form-select form-select-sm" v-model="selectedCategory" @change="currentPage = 1">
            <option v-for="cat in remixCategories" :key="cat" :value="cat">
              {{ cat }}
            </option>
          </select>
        </div>

        <!-- Search Input -->
        <div :class="(selectedLibrary === 'remix' || selectedLibrary === 'all') ? 'col-12 col-sm-6 col-lg-3' : 'col-12 col-lg-5'">
          <div class="input-group input-group-sm">
            <span class="input-group-text"><i class="ri-search-line"></i></span>
            <input
              type="text"
              class="form-control"
              placeholder="Search icons (e.g. home, user, chart)..."
              v-model="searchQuery"
              @input="currentPage = 1"
            />
            <button
              v-if="searchQuery"
              class="btn btn-outline-secondary"
              type="button"
              @click="clearSearch"
            >
              <i class="ri-close-line"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Icon Statistics & Quick Info -->
      <div class="d-flex align-items-center justify-content-between mb-2 px-1">
        <span class="text-muted fs-12">
          Found <strong>{{ filteredIcons.length.toLocaleString() }}</strong> matching icons
          <span v-if="filteredIcons.length > pageSize" class="ms-1">
            (Showing page {{ currentPage }} of {{ totalPages }})
          </span>
        </span>
        <span class="text-muted fs-12 d-none d-sm-inline">
          Click an icon to preview, or double-click to select immediately
        </span>
      </div>

      <!-- Icons Display Grid -->
      <div class="icon-grid-wrapper border rounded p-2 mb-3 bg-light-subtle">
        <div v-if="paginatedIcons.length === 0" class="text-center py-5">
          <i class="ri-search-eye-line display-4 text-muted mb-2 d-block"></i>
          <h5 class="text-muted">No icons match "{{ searchQuery }}"</h5>
          <p class="text-muted fs-13 mb-3">Try searching for other terms like 'home', 'user', 'settings', or clear your search.</p>
          <button type="button" class="btn btn-sm btn-outline-primary" @click="clearSearch">
            Reset Search
          </button>
        </div>

        <div v-else class="row g-2 icon-grid-row">
          <div
            v-for="icon in paginatedIcons"
            :key="icon.className"
            class="col-4 col-sm-4 col-md-3 col-lg-2"
          >
            <div
              class="icon-card text-center p-2 rounded cursor-pointer border h-100 d-flex flex-column align-items-center justify-content-center transition-all"
              :class="{
                'border-primary bg-primary-subtle text-primary shadow-sm': activeIcon === icon.className,
                'icon-card-default': activeIcon !== icon.className,
              }"
              @click="selectIconPreview(icon.className)"
              @dblclick="confirmIconSelection(icon.className)"
              :title="icon.className"
            >
              <div class="icon-preview-box mb-1">
                <i :class="[icon.className, 'fs-24']"></i>
              </div>
              <div class="icon-label text-truncate w-100 fs-11" :title="icon.shortName || icon.name">
                {{ icon.shortName || icon.name }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination Controls -->
      <div v-if="totalPages > 1" class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <div class="btn-group btn-group-sm">
          <button
            type="button"
            class="btn btn-outline-secondary d-none d-sm-inline-block"
            :disabled="currentPage === 1"
            @click="currentPage = 1"
          >
            <i class="ri-skip-back-mini-line"></i> First
          </button>
          <button
            type="button"
            class="btn btn-outline-secondary"
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            <i class="ri-arrow-left-s-line"></i> Prev
          </button>
        </div>

        <div class="d-flex align-items-center gap-1">
          <span class="fs-12 text-muted">Page {{ currentPage }} / {{ totalPages }}</span>
          <div class="btn-group btn-group-sm d-none d-md-inline-flex">
            <button
              v-for="p in visiblePages"
              :key="p"
              type="button"
              class="btn"
              :class="p === currentPage ? 'btn-primary' : 'btn-outline-secondary'"
              @click="currentPage = p"
            >
              {{ p }}
            </button>
          </div>
        </div>

        <div class="btn-group btn-group-sm">
          <button
            type="button"
            class="btn btn-outline-secondary"
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >
            Next <i class="ri-arrow-right-s-line"></i>
          </button>
          <button
            type="button"
            class="btn btn-outline-secondary d-none d-sm-inline-block"
            :disabled="currentPage === totalPages"
            @click="currentPage = totalPages"
          >
            Last <i class="ri-skip-forward-mini-line"></i>
          </button>
        </div>
      </div>

      <!-- Footer / Selected Preview -->
      <div class="d-flex align-items-center justify-content-between p-2 p-sm-3 bg-light rounded border flex-wrap gap-2">
        <div class="d-flex align-items-center gap-2 gap-sm-3 overflow-hidden">
          <div
            class="selected-avatar rounded d-flex align-items-center justify-content-center border flex-shrink-0"
          >
            <i :class="[activeIcon || 'ri-question-mark', 'fs-22 text-primary']"></i>
          </div>
          <div class="overflow-hidden">
            <div class="fs-11 text-muted">Selected:</div>
            <code class="fs-12 fw-semibold text-primary text-truncate d-block">{{ activeIcon || 'None' }}</code>
          </div>
        </div>

        <div class="hstack gap-2 ms-auto">
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary"
            @click="closePicker"
          >
            Cancel
          </button>
          <button
            type="button"
            class="btn btn-sm btn-primary"
            :disabled="!activeIcon"
            @click="confirmIconSelection(activeIcon)"
          >
            <i class="ri-check-line me-1"></i> Apply
          </button>
        </div>
      </div>
    </div>
  </BModal>
</template>

<script>
import {
  getFullIconCatalog,
  ICON_LIBRARIES,
  REMIX_CATEGORIES,
} from "@/helpers/iconCatalog";

export default {
  name: "IconPickerModal",
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    currentIcon: {
      type: String,
      default: "",
    },
  },
  emits: ["update:modelValue", "select"],
  data() {
    return {
      libraries: ICON_LIBRARIES,
      remixCategories: REMIX_CATEGORIES,
      selectedLibrary: "all",
      selectedCategory: "All Categories",
      searchQuery: "",
      currentPage: 1,
      pageSize: 72,
      activeIcon: "",
      allIcons: [],
    };
  },
  computed: {
    isOpen: {
      get() {
        return this.modelValue;
      },
      set(val) {
        this.$emit("update:modelValue", val);
      },
    },
    filteredIcons() {
      let list = this.allIcons;

      // Filter by library
      if (this.selectedLibrary !== "all") {
        list = list.filter((i) => i.library === this.selectedLibrary);
      }

      // Filter by category if remix or all
      if (
        this.selectedCategory !== "All Categories" &&
        (this.selectedLibrary === "remix" || this.selectedLibrary === "all")
      ) {
        list = list.filter((i) => i.category === this.selectedCategory);
      }

      // Search query filtering
      const query = this.searchQuery.trim().toLowerCase();
      if (query) {
        list = list.filter((i) => {
          return (
            i.name.toLowerCase().includes(query) ||
            (i.tags && i.tags.includes(query))
          );
        });
      }

      return list;
    },
    totalPages() {
      return Math.ceil(this.filteredIcons.length / this.pageSize) || 1;
    },
    paginatedIcons() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.filteredIcons.slice(start, start + this.pageSize);
    },
    visiblePages() {
      const pages = [];
      const total = this.totalPages;
      const current = this.currentPage;
      let start = Math.max(1, current - 2);
      let end = Math.min(total, current + 2);

      if (end - start < 4) {
        if (start === 1) {
          end = Math.min(total, start + 4);
        } else if (end === total) {
          start = Math.max(1, end - 4);
        }
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    },
  },
  watch: {
    modelValue(val) {
      if (val) {
        if (this.allIcons.length === 0) {
          this.allIcons = getFullIconCatalog();
        }
        this.activeIcon = this.currentIcon || "ri-menu-line";
      }
    },
    currentIcon(val) {
      if (val) {
        this.activeIcon = val;
      }
    },
  },
  mounted() {
    this.activeIcon = this.currentIcon || "";
  },
  methods: {
    setLibrary(libId) {
      this.selectedLibrary = libId;
      this.currentPage = 1;
    },
    clearSearch() {
      this.searchQuery = "";
      this.currentPage = 1;
    },
    selectIconPreview(className) {
      this.activeIcon = className;
    },
    confirmIconSelection(className) {
      this.$emit("select", className);
      this.isOpen = false;
    },
    closePicker() {
      this.isOpen = false;
    },
  },
};
</script>

<style scoped>
.icon-picker-container {
  min-height: 400px;
}

.icon-grid-wrapper {
  max-height: 380px;
  overflow-y: auto;
  overflow-x: hidden;
}

.nav-pills-scrollable {
  display: flex;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 2px;
}

.nav-pills-scrollable::-webkit-scrollbar {
  height: 3px;
}

.nav-pills-scrollable::-webkit-scrollbar-thumb {
  background: var(--vz-border-color, #e9ebec);
  border-radius: 4px;
}

/* Tab badges styling for both Light and Dark modes */
.tab-count-badge {
  font-size: 11px;
  font-weight: 600;
  border-radius: 4px;
  padding: 0.22em 0.55em;
  transition: all 0.2s ease;
  line-height: 1.2;
}

/* Inactive Tab Badge */
.tab-badge-inactive {
  background-color: var(--vz-light, #f3f6f9);
  color: var(--vz-body-color, #495057);
  border: 1px solid var(--vz-border-color, #e9ebec);
}

[data-bs-theme="dark"] .tab-badge-inactive,
[data-layout-mode="dark"] .tab-badge-inactive {
  background-color: rgba(255, 255, 255, 0.12) !important;
  color: #e9ecef !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
}

/* Active Tab Badge */
.tab-badge-active {
  background-color: rgba(255, 255, 255, 0.28) !important;
  color: #ffffff !important;
  border: 1px solid rgba(255, 255, 255, 0.45) !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* Icon Cards */
.icon-card {
  transition: all 0.15s ease-in-out;
  border-radius: 6px;
  min-height: 76px;
}

.icon-card-default {
  background-color: var(--vz-card-bg-custom, var(--vz-card-bg, #ffffff));
  border-color: var(--vz-border-color, #e9ebec);
  color: var(--vz-body-color, #212529);
}

.icon-card .icon-label {
  color: var(--vz-muted, #878a99);
}

.icon-card:hover {
  border-color: var(--vz-primary, #405189) !important;
  background-color: var(--vz-light, #f3f6f9) !important;
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.08);
}

[data-bs-theme="dark"] .icon-card-default {
  background-color: rgba(255, 255, 255, 0.03);
  border-color: var(--vz-border-color, rgba(255, 255, 255, 0.1));
  color: #ced4da;
}

[data-bs-theme="dark"] .icon-card:hover {
  background-color: rgba(255, 255, 255, 0.08) !important;
}

.selected-avatar {
  width: 44px;
  height: 44px;
  background-color: var(--vz-card-bg, #ffffff);
  border-color: var(--vz-border-color, #e9ebec);
}

[data-bs-theme="dark"] .selected-avatar {
  background-color: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.15);
}

.cursor-pointer {
  cursor: pointer;
}

/* Select & option dark mode support */
.form-select {
  color-scheme: light dark;
}

[data-bs-theme="dark"] .form-select {
  color-scheme: dark;
  background-color: #212529 !important;
  color: #ced4da !important;
  border-color: #32383e !important;
}

[data-bs-theme="dark"] .form-select option {
  background-color: #212529 !important;
  color: #ced4da !important;
}
</style>
