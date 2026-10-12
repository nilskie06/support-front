<template>
  <Layout>
    <PageHeader title="Menu Management" pageTitle="Configuration" />

    <!-- Stat widgets -->
    <BRow class="mb-3">
      <BCol xl="3" md="6">
        <BCard no-body class="card-animate shadow-sm border-0">
          <BCardBody class="d-flex align-items-center justify-content-between">
            <div>
              <p class="text-uppercase fw-semibold text-muted fs-12 mb-1">Total Menus</p>
              <h4 class="mb-0 fw-bold">{{ flatList.length }}</h4>
            </div>
            <div class="avatar-sm flex-shrink-0">
              <span class="avatar-title bg-primary-subtle text-primary rounded-circle fs-3">
                <i class="ri-menu-2-line"></i>
              </span>
            </div>
          </BCardBody>
        </BCard>
      </BCol>

      <BCol xl="3" md="6">
        <BCard no-body class="card-animate shadow-sm border-0">
          <BCardBody class="d-flex align-items-center justify-content-between">
            <div>
              <p class="text-uppercase fw-semibold text-muted fs-12 mb-1">Root Categories</p>
              <h4 class="mb-0 fw-bold text-info">{{ menuTree.length }}</h4>
            </div>
            <div class="avatar-sm flex-shrink-0">
              <span class="avatar-title bg-info-subtle text-info rounded-circle fs-3">
                <i class="ri-folder-line"></i>
              </span>
            </div>
          </BCardBody>
        </BCard>
      </BCol>

      <BCol xl="3" md="6">
        <BCard no-body class="card-animate shadow-sm border-0">
          <BCardBody class="d-flex align-items-center justify-content-between">
            <div>
              <p class="text-uppercase fw-semibold text-muted fs-12 mb-1">Submenus</p>
              <h4 class="mb-0 fw-bold text-warning">{{ totalSubmenus }}</h4>
            </div>
            <div class="avatar-sm flex-shrink-0">
              <span class="avatar-title bg-warning-subtle text-warning rounded-circle fs-3">
                <i class="ri-node-tree"></i>
              </span>
            </div>
          </BCardBody>
        </BCard>
      </BCol>

      <BCol xl="3" md="6">
        <BCard no-body class="card-animate shadow-sm border-0">
          <BCardBody class="d-flex align-items-center justify-content-between">
            <div>
              <p class="text-uppercase fw-semibold text-muted fs-12 mb-1">Active in Sidebar</p>
              <h4 class="mb-0 fw-bold text-success">{{ activeSidebarMenus }}</h4>
            </div>
            <div class="avatar-sm flex-shrink-0">
              <span class="avatar-title bg-success-subtle text-success rounded-circle fs-3">
                <i class="ri-checkbox-circle-line"></i>
              </span>
            </div>
          </BCardBody>
        </BCard>
      </BCol>
    </BRow>

    <!-- Main Card -->
    <BCard no-body class="shadow-sm border-0">
      <BCardHeader class="border-bottom p-3">
        <div class="menu-toolbar">
          <div class="menu-toolbar-title">
            <div class="d-flex align-items-center gap-2">
              <h5 class="card-title mb-0">Menu Hierarchy</h5>
              <span class="badge bg-primary-subtle text-primary">tkt_menus</span>
            </div>
            <span v-if="hasUnsavedChanges" class="badge bg-warning text-dark animate-pulse">
              <i class="ri-alert-line me-1"></i>Unsaved
            </span>
          </div>

          <div class="menu-toolbar-controls">
            <div class="menu-toolbar-actions">
              <button
                type="button"
                class="btn btn-sm btn-outline-secondary"
                @click="toggleAllExpansion"
                :title="allExpanded ? 'Collapse All' : 'Expand All'"
              >
                <i :class="allExpanded ? 'ri-contract-up-down-line' : 'ri-expand-up-down-line'"></i>
                <span class="d-none d-sm-inline ms-1">{{ allExpanded ? 'Collapse' : 'Expand' }}</span>
              </button>

              <button
                type="button"
                class="btn btn-sm"
                :class="hasUnsavedChanges ? 'btn-success' : 'btn-outline-success'"
                :disabled="savingOrder || !hasUnsavedChanges"
                @click="saveHierarchy"
              >
                <span v-if="savingOrder" class="spinner-border spinner-border-sm"></span>
                <i v-else class="ri-save-line"></i>
                <span class="ms-1">Save</span>
              </button>

              <button
                type="button"
                class="btn btn-sm btn-outline-primary"
                @click="fetchMenus"
                :disabled="loading"
                title="Refresh from server"
              >
                <i class="ri-refresh-line" :class="{ 'spin-icon': loading }"></i>
              </button>

              <button type="button" class="btn btn-sm btn-primary" @click="openCreateModal(0)">
                <i class="ri-add-line me-1"></i> Add Menu
              </button>
            </div>

            <!-- Search input -->
            <div class="search-box">
              <input
                type="text"
                class="form-control form-control-sm search"
                placeholder="Search menus..."
                v-model="searchQuery"
              />
              <i class="ri-search-line search-icon"></i>
            </div>
          </div>
        </div>
      </BCardHeader>

      <BCardBody class="p-2 p-sm-3">
        <!-- Loading state -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="text-muted mt-2 mb-0">Loading menu hierarchy from tkt_menus...</p>
        </div>

        <!-- Empty state -->
        <div v-else-if="!filteredTree.length" class="text-center py-5">
          <div class="avatar-lg mx-auto mb-3">
            <div class="avatar-title bg-light text-primary rounded-circle fs-24">
              <i class="ri-node-tree"></i>
            </div>
          </div>
          <h5 class="fw-semibold">No Menus Found</h5>
          <p class="text-muted mb-3">
            {{ searchQuery ? 'No menus match your search criteria.' : 'No menus currently exist in tkt_menus table.' }}
          </p>
          <button type="button" class="btn btn-primary btn-sm" @click="openCreateModal(0)">
            <i class="ri-add-line me-1"></i> Create First Menu
          </button>
        </div>

        <!-- Draggable Nested Tree -->
        <div v-else class="menu-hierarchy-wrapper">
          <div class="drag-hint alert alert-info py-2 px-3 mb-3 d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2">
            <div class="d-flex align-items-center gap-2">
              <i class="ri-information-line fs-16 flex-shrink-0"></i>
              <span class="fs-13">
                <strong>Drag and drop</strong> menus using handle (<i class="ri-drag-move-2-fill"></i>) to reorder or nest submenus.
              </span>
            </div>
            <span class="badge bg-info-subtle text-info flex-shrink-0">{{ filteredTree.length }} root items</span>
          </div>

          <menu-item-node
            :items="filteredTree"
            :level="0"
            :expanded-ids="expandedIds"
            @add-child="openCreateModal($event.id)"
            @edit="openEditModal($event)"
            @delete="confirmDelete($event)"
            @change="handleDragChange"
            @toggle-expand="toggleNodeExpand"
          />
        </div>
      </BCardBody>
    </BCard>

    <!-- Create / Edit Modal -->
    <BModal
      v-model="modalOpen"
      id="menuModal"
      modal-class="zoomIn"
      :title="isEditing ? 'Edit Menu' : 'Add New Menu'"
      title-class="exampleModalLabel fw-semibold text-primary"
      header-class="p-3 bg-light"
      class="v-modal-custom"
      size="lg"
      hide-footer
      centered
    >
      <form @submit.prevent="saveMenu">
        <BRow class="g-3">
          <!-- Parent Menu -->
          <BCol md="6">
            <label class="form-label fw-semibold">Parent Menu</label>
            <select class="form-select" v-model="form.parent_id">
              <option :value="0">None (Top-Level Root Menu)</option>
              <option
                v-for="p in availableParents"
                :key="p.id"
                :value="p.id"
              >
                {{ getIndentedName(p) }}
              </option>
            </select>
            <div class="form-text">Choose None to place at top level, or select an existing parent for submenus.</div>
          </BCol>

          <!-- Menu Name -->
          <BCol md="6">
            <label class="form-label fw-semibold">Menu Name <span class="text-danger">*</span></label>
            <input
              type="text"
              class="form-control"
              v-model="form.name"
              placeholder="e.g. Dashboard, Invoices, Settings"
              required
              @input="onNameChange"
            />
          </BCol>

          <!-- Menu Code -->
          <BCol md="6">
            <label class="form-label fw-semibold">Unique Code <span class="text-danger">*</span></label>
            <div class="input-group">
              <span class="input-group-text"><i class="ri-code-s-slash-line"></i></span>
              <input
                type="text"
                class="form-control"
                v-model="form.code"
                placeholder="e.g. dashboard_analytics"
                required
              />
            </div>
            <div class="form-text">Identifier used for permissions or state routing.</div>
          </BCol>

          <!-- URL / Route -->
          <BCol md="6">
            <label class="form-label fw-semibold">URL / Route Path</label>
            <div class="input-group">
              <span class="input-group-text"><i class="ri-link"></i></span>
              <input
                type="text"
                class="form-control"
                v-model="form.url"
                placeholder="e.g. /menu, /tickets/list, #"
              />
            </div>
          </BCol>

          <!-- Icon -->
          <BCol md="6">
            <div class="d-flex align-items-center justify-content-between mb-1">
              <label class="form-label fw-semibold mb-0">Icon Class</label>
              <button
                type="button"
                class="btn btn-sm btn-subtle-primary py-0 px-2 fs-12 d-flex align-items-center gap-1"
                @click="showIconPicker = true"
              >
                <i class="ri-apps-2-line"></i> Browse All Icons
              </button>
            </div>
            <div class="input-group">
              <button
                type="button"
                class="input-group-text btn btn-light"
                @click="showIconPicker = true"
                title="Click to browse all available icons"
              >
                <i :class="form.icon || 'ri-menu-line'" class="fs-16 text-primary"></i>
              </button>
              <input
                type="text"
                class="form-control"
                v-model="form.icon"
                placeholder="e.g. ri-dashboard-line, mdi mdi-home, bx bx-cog"
              />
              <button
                type="button"
                class="btn btn-outline-secondary"
                @click="showIconPicker = true"
                title="Browse all icons dialog"
              >
                <i class="ri-search-line"></i> Pick
              </button>
            </div>
            <!-- Quick Icon Suggestions + Browse All Trigger -->
            <div class="mt-2 d-flex flex-wrap align-items-center gap-1">
              <span class="fs-11 text-muted me-1">Popular:</span>
              <span
                v-for="ic in popularIcons"
                :key="ic"
                class="badge bg-light text-body border cursor-pointer icon-chip"
                :class="{ 'border-primary text-primary bg-primary-subtle': form.icon === ic }"
                @click="form.icon = ic"
                :title="ic"
              >
                <i :class="ic"></i>
              </span>
              <span
                class="badge bg-primary-subtle text-primary border border-primary cursor-pointer icon-chip ms-auto"
                @click="showIconPicker = true"
                title="Browse all 9,500+ available icons"
              >
                <i class="ri-more-fill me-1"></i> All Icons
              </span>
            </div>
          </BCol>

          <!-- Order -->
          <BCol md="6">
            <label class="form-label fw-semibold">Order / Position</label>
            <input
              type="number"
              class="form-control"
              v-model.number="form.order"
              min="0"
              placeholder="0"
            />
          </BCol>

          <!-- Status & Sidebar visibility switches -->
          <BCol md="6">
            <div class="form-check form-switch form-switch-md mt-2">
              <input
                class="form-check-input"
                type="checkbox"
                id="menuStatusSwitch"
                v-model="form.status"
              />
              <label class="form-check-label fw-semibold" for="menuStatusSwitch">
                Active Status
              </label>
            </div>
            <div class="form-text">Inactive menus won't be shown to end users.</div>
          </BCol>

          <BCol md="6">
            <div class="form-check form-switch form-switch-md mt-2">
              <input
                class="form-check-input"
                type="checkbox"
                id="menuSidebarSwitch"
                v-model="form.is_side_menu"
              />
              <label class="form-check-label fw-semibold" for="menuSidebarSwitch">
                Show in Sidebar Navigation
              </label>
            </div>
            <div class="form-text">Include in main sidebar menu layout.</div>
          </BCol>
        </BRow>

        <div class="modal-footer v-modal-footer mt-4 pb-0">
          <div class="hstack gap-2 justify-content-end">
            <BButton type="button" variant="light" @click="modalOpen = false">
              Cancel
            </BButton>
            <BButton
              type="submit"
              variant="primary"
              :disabled="submitting"
            >
              <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
              {{ isEditing ? 'Update Menu' : 'Create Menu' }}
            </BButton>
          </div>
        </div>
      </form>
    </BModal>

    <!-- Full Icon Picker Modal -->
    <IconPickerModal
      v-model="showIconPicker"
      :current-icon="form.icon"
      @select="onIconSelected"
    />
  </Layout>
</template>

<script>
import axios from 'axios';
import Layout from '@/layouts/main.vue';
import PageHeader from '@/components/page-header.vue';
import MenuItemNode from './MenuItemNode.vue';
import IconPickerModal from '@/components/IconPickerModal.vue';

export default {
  name: 'MenuManagementPage',
  components: {
    Layout,
    PageHeader,
    MenuItemNode,
    IconPickerModal,
  },
  data() {
    return {
      menuTree: [],
      flatList: [],
      loading: false,
      savingOrder: false,
      submitting: false,
      hasUnsavedChanges: false,
      searchQuery: '',
      allExpanded: true,
      expandedIds: {},

      modalOpen: false,
      showIconPicker: false,
      isEditing: false,
      editingId: null,

      form: {
        name: '',
        code: '',
        parent_id: 0,
        icon: 'ri-menu-line',
        url: '',
        order: 0,
        status: true,
        is_side_menu: true,
      },

      popularIcons: [
        'ri-dashboard-2-line',
        'ri-ticket-2-line',
        'ri-folder-line',
        'ri-file-list-3-line',
        'ri-settings-4-line',
        'ri-user-line',
        'ri-group-line',
        'ri-shield-keyhole-line',
        'ri-bar-chart-2-line',
        'ri-calendar-line',
        'ri-chat-3-line',
        'ri-mail-line',
        'ri-notification-3-line',
        'ri-apps-line',
      ],
    };
  },
  computed: {
    apiBase() {
      return process.env.VUE_APP_AUTHDOMAIN || 'http://localhost:8001/api';
    },
    totalSubmenus() {
      return this.flatList.filter((m) => m.parent_id && m.parent_id !== 0).length;
    },
    activeSidebarMenus() {
      return this.flatList.filter((m) => m.status && m.is_side_menu).length;
    },
    filteredTree() {
      if (!this.searchQuery.trim()) {
        return this.menuTree;
      }
      const query = this.searchQuery.toLowerCase();
      return this.filterTree(this.menuTree, query);
    },
    availableParents() {
      if (!this.isEditing) {
        return this.flatList;
      }
      // Filter out self and any descendants when editing
      const excludedIds = new Set();
      const collectDescendants = (id) => {
        excludedIds.add(id);
        const children = this.flatList.filter((m) => m.parent_id === id);
        children.forEach((c) => collectDescendants(c.id));
      };
      collectDescendants(this.editingId);
      return this.flatList.filter((m) => !excludedIds.has(m.id));
    },
  },
  mounted() {
    this.fetchMenus();
  },
  methods: {
    getAuthHeaders() {
      const token = localStorage.getItem('jwt') || localStorage.getItem('token');
      return token ? { Authorization: `Bearer ${token}` } : {};
    },

    async fetchMenus() {
      this.loading = true;
      try {
        const response = await axios.get(`${this.apiBase}/menus`, {
          headers: this.getAuthHeaders(),
        });
        this.menuTree = response.data.data || [];
        this.flatList = response.data.flat || [];
        this.hasUnsavedChanges = false;
        this.initializeExpandedState();
      } catch (error) {
        console.error('Failed to fetch menus:', error);
        this.showToast('Failed to load menus from server', 'error');
      } finally {
        this.loading = false;
      }
    },

    initializeExpandedState() {
      const map = {};
      const traverse = (items) => {
        items.forEach((item) => {
          map[item.id] = true;
          if (item.all_children && item.all_children.length) {
            traverse(item.all_children);
          }
        });
      };
      traverse(this.menuTree);
      this.expandedIds = map;
      this.allExpanded = true;
    },

    toggleNodeExpand(id) {
      this.expandedIds = {
        ...this.expandedIds,
        [id]: !this.expandedIds[id],
      };
    },

    toggleAllExpansion() {
      const targetState = !this.allExpanded;
      const updated = {};
      this.flatList.forEach((m) => {
        updated[m.id] = targetState;
      });
      this.expandedIds = updated;
      this.allExpanded = targetState;
    },

    handleDragChange() {
      this.hasUnsavedChanges = true;
    },

    async saveHierarchy() {
      this.savingOrder = true;
      try {
        const response = await axios.post(
          `${this.apiBase}/menus/reorder`,
          { items: this.menuTree },
          { headers: this.getAuthHeaders() }
        );
        this.menuTree = response.data.data || [];
        this.flatList = response.data.flat || [];
        this.hasUnsavedChanges = false;
        this.showToast('Menu hierarchy and order updated successfully!', 'success');
        window.dispatchEvent(new CustomEvent('menus-updated'));
      } catch (error) {
        console.error('Failed to save hierarchy:', error);
        this.showToast('Failed to save menu order', 'error');
      } finally {
        this.savingOrder = false;
      }
    },

    openCreateModal(parentId = 0) {
      this.isEditing = false;
      this.editingId = null;
      this.form = {
        name: '',
        code: '',
        parent_id: parentId,
        icon: 'ri-menu-line',
        url: '',
        order: this.suggestNextOrder(parentId),
        status: true,
        is_side_menu: true,
      };
      this.modalOpen = true;
    },

    openEditModal(item) {
      this.isEditing = true;
      this.editingId = item.id;
      this.form = {
        name: item.name,
        code: item.code,
        parent_id: item.parent_id || 0,
        icon: item.icon || 'ri-menu-line',
        url: item.url || '',
        order: item.order || 0,
        status: !!item.status,
        is_side_menu: !!item.is_side_menu,
      };
      this.modalOpen = true;
    },

    onNameChange() {
      if (!this.isEditing && !this.form.code) {
        this.form.code = this.form.name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_+|_+$/g, '');
      }
    },

    suggestNextOrder(parentId) {
      const siblings = this.flatList.filter((m) => (m.parent_id || 0) === parentId);
      if (!siblings.length) return 1;
      const maxOrder = Math.max(...siblings.map((m) => m.order || 0));
      return maxOrder + 1;
    },

    getIndentedName(menu) {
      let depth = 0;
      let curr = menu;
      while (curr && curr.parent_id) {
        depth++;
        curr = this.flatList.find((m) => m.id === curr.parent_id);
      }
      const prefix = depth > 0 ? '— '.repeat(depth) : '';
      return `${prefix}${menu.name} (${menu.code})`;
    },

    async saveMenu() {
      if (!this.form.name.trim()) {
        this.showToast('Menu name is required', 'error');
        return;
      }

      this.submitting = true;
      try {
        if (this.isEditing) {
          await axios.put(`${this.apiBase}/menus/${this.editingId}`, this.form, {
            headers: this.getAuthHeaders(),
          });
          this.showToast('Menu updated successfully!', 'success');
        } else {
          await axios.post(`${this.apiBase}/menus`, this.form, {
            headers: this.getAuthHeaders(),
          });
          this.showToast('Menu created successfully!', 'success');
        }
        this.modalOpen = false;
        await this.fetchMenus();
        window.dispatchEvent(new CustomEvent('menus-updated'));
      } catch (error) {
        const msg = error.response?.data?.message || 'Error saving menu item';
        this.showToast(msg, 'error');
      } finally {
        this.submitting = false;
      }
    },

    async confirmDelete(item) {
      const childCount = item.all_children ? item.all_children.length : 0;
      const text = childCount > 0
        ? `"${item.name}" has ${childCount} nested submenu(s) which will also be deleted!`
        : `Are you sure you want to delete "${item.name}"?`;

      if (this.$swal) {
        const result = await this.$swal.fire({
          title: 'Delete Menu?',
          text: text,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#6c757d',
          confirmButtonText: 'Yes, delete it!',
        });
        if (result.isConfirmed) {
          await this.deleteMenu(item.id);
        }
      } else {
        if (window.confirm(`${text}\n\nProceed with deletion?`)) {
          await this.deleteMenu(item.id);
        }
      }
    },

    async deleteMenu(id) {
      try {
        await axios.delete(`${this.apiBase}/menus/${id}`, {
          headers: this.getAuthHeaders(),
        });
        this.showToast('Menu deleted successfully', 'success');
        await this.fetchMenus();
        window.dispatchEvent(new CustomEvent('menus-updated'));
      } catch (error) {
        console.error('Delete error:', error);
        this.showToast('Failed to delete menu', 'error');
      }
    },

    filterTree(items, query) {
      const result = [];
      items.forEach((item) => {
        const matchesSelf =
          item.name.toLowerCase().includes(query) ||
          (item.code && item.code.toLowerCase().includes(query)) ||
          (item.url && item.url.toLowerCase().includes(query));

        const matchedChildren = item.all_children
          ? this.filterTree(item.all_children, query)
          : [];

        if (matchesSelf || matchedChildren.length) {
          result.push({
            ...item,
            all_children: matchedChildren.length ? matchedChildren : item.all_children,
          });
        }
      });
      return result;
    },

    showToast(message, icon = 'success') {
      if (this.$swal) {
        this.$swal.fire({
          toast: true,
          position: 'top-end',
          icon: icon,
          title: message,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      } else {
        alert(message);
      }
    },

    onIconSelected(selectedIconClass) {
      this.form.icon = selectedIconClass;
    },
  },
};
</script>

<style scoped>
.menu-hierarchy-wrapper {
  background: var(--vz-card-bg, #fff);
  border-radius: 8px;
}

.menu-toolbar,
.menu-toolbar-title,
.menu-toolbar-controls,
.menu-toolbar-actions {
  display: flex;
  align-items: center;
}

.menu-toolbar {
  min-height: 34px;
  gap: 16px;
}

.menu-toolbar-title {
  flex: 0 0 auto;
  gap: 10px;
}

.menu-toolbar-controls {
  min-width: 0;
  margin-left: auto;
  gap: 12px;
}

.menu-toolbar-actions {
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
}

.search-box {
  position: relative;
  flex: 0 0 250px;
  width: 250px;
}

.search-box .search-icon {
  position: absolute;
  top: 50%;
  left: 10px;
  transform: translateY(-50%);
  color: var(--vz-muted, #878a99);
}

.search-box .search {
  padding-left: 32px;
}

@media (max-width: 991.98px) {
  .menu-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .menu-toolbar-title {
    justify-content: space-between;
  }

  .menu-toolbar-controls {
    width: 100%;
    margin-left: 0;
  }

  .menu-toolbar-actions {
    justify-content: flex-start;
  }

  .search-box {
    margin-left: auto;
  }
}

@media (max-width: 575.98px) {
  .menu-toolbar-controls {
    align-items: stretch;
    flex-direction: column-reverse;
  }

  .menu-toolbar-actions {
    width: 100%;
  }

  .menu-toolbar-actions .btn-primary {
    margin-left: auto;
  }

  .search-box {
    flex-basis: auto;
    width: 100%;
    margin-left: 0;
  }
}

.icon-chip {
  cursor: pointer;
  padding: 5px 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  background-color: var(--vz-light, #f3f6f9);
  color: var(--vz-body-color, #495057);
  border-color: var(--vz-border-color, #e9ebec);
}

.icon-chip:hover {
  background: var(--vz-primary, #405189) !important;
  color: #fff !important;
}

[data-bs-theme="dark"] .icon-chip {
  background-color: rgba(255, 255, 255, 0.08) !important;
  color: #ced4da !important;
  border-color: rgba(255, 255, 255, 0.15) !important;
}

.spin-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

.animate-pulse {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Dark theme support for select dropdown and options */
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
