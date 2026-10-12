<template>
  <draggable
    :list="items"
    group="menu-hierarchy"
    :animation="200"
    ghost-class="menu-drag-ghost"
    drag-class="menu-drag-active"
    handle=".drag-handle"
    class="menu-drag-area"
    @change="handleDragChange"
  >
    <div
      v-for="item in items"
      :key="item.id"
      class="menu-tree-node"
      :class="{ 'has-children': item.all_children && item.all_children.length }"
    >
      <div class="menu-node-card">
        <!-- Main Top Row: Leading Controls, Title & Actions -->
        <div class="card-main-row">
          <div class="node-left">
            <span class="drag-handle" title="Drag to reorder or change parent">
              <i class="ri-drag-move-2-fill"></i>
            </span>

            <button
              v-if="item.all_children && item.all_children.length"
              type="button"
              class="toggle-btn"
              @click="toggleExpand(item.id)"
            >
              <i :class="isExpanded(item.id) ? 'ri-arrow-down-s-line' : 'ri-arrow-right-s-line'"></i>
            </button>
            <span v-else class="toggle-placeholder"></span>

            <div class="icon-avatar">
              <i :class="item.icon || 'ri-menu-line'"></i>
            </div>

            <div class="node-identity">
              <span class="node-name" :title="item.name">{{ item.name }}</span>
              <span class="code-badge d-none d-sm-inline"><code>{{ item.code }}</code></span>
            </div>
          </div>

          <!-- Actions -->
          <div class="node-actions">
            <button
              type="button"
              class="btn btn-sm btn-subtle-primary action-btn"
              title="Add Child Submenu"
              @click="$emit('add-child', item)"
            >
              <i class="ri-add-line"></i><span class="d-none d-md-inline ms-1">Add Submenu</span>
            </button>

            <button
              type="button"
              class="btn btn-sm btn-subtle-secondary action-btn"
              title="Edit Menu"
              @click="$emit('edit', item)"
            >
              <i class="ri-pencil-line"></i>
            </button>

            <button
              type="button"
              class="btn btn-sm btn-subtle-danger action-btn"
              title="Delete Menu"
              @click="$emit('delete', item)"
            >
              <i class="ri-delete-bin-line"></i>
            </button>
          </div>
        </div>

        <!-- Secondary Row: Badges & Metadata -->
        <div class="card-sub-row">
          <div class="node-badges">
            <span class="code-badge d-inline d-sm-none"><code>{{ item.code }}</code></span>
            <span
              class="badge"
              :class="item.is_side_menu ? 'bg-info-subtle text-info' : 'bg-secondary-subtle text-secondary'"
            >
              {{ item.is_side_menu ? 'Sidebar' : 'Hidden' }}
            </span>
            <span
              class="badge"
              :class="item.status ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'"
            >
              {{ item.status ? 'Active' : 'Inactive' }}
            </span>
          </div>

          <div class="node-meta">
            <span class="meta-url" v-if="item.url" :title="item.url">
              <i class="ri-link me-1"></i><span class="meta-url-text">{{ item.url }}</span>
            </span>
            <span class="meta-order">Order: {{ item.order }}</span>
            <span class="meta-depth">Level {{ level + 1 }}</span>
            <span v-if="item.all_children && item.all_children.length" class="meta-children">
              {{ item.all_children.length }} {{ item.all_children.length === 1 ? 'submenu' : 'submenus' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Recursive sub-level -->
      <div v-show="isExpanded(item.id)" class="nested-children-container">
        <menu-item-node
          v-if="item.all_children && item.all_children.length"
          :items="item.all_children"
          :level="level + 1"
          :expanded-ids="expandedIds"
          @add-child="$emit('add-child', $event)"
          @edit="$emit('edit', $event)"
          @delete="$emit('delete', $event)"
          @change="$emit('change')"
          @toggle-expand="$emit('toggle-expand', $event)"
        />
        <draggable
          v-else
          :list="item.all_children || (item.all_children = [])"
          group="menu-hierarchy"
          :animation="200"
          ghost-class="menu-drag-ghost"
          drag-class="menu-drag-active"
          handle=".drag-handle"
          class="menu-drag-area empty-drop-zone"
          @change="handleDragChange"
        >
          <div class="empty-drop-placeholder text-muted">
            <i class="ri-drag-drop-line me-1"></i> Drop submenus here
          </div>
        </draggable>
      </div>
    </div>
  </draggable>
</template>

<script>
import { VueDraggableNext } from 'vue-draggable-next';

export default {
  name: 'MenuItemNode',
  components: {
    draggable: VueDraggableNext,
  },
  props: {
    items: {
      type: Array,
      required: true,
    },
    level: {
      type: Number,
      default: 0,
    },
    expandedIds: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['add-child', 'edit', 'delete', 'change', 'toggle-expand'],
  methods: {
    isExpanded(id) {
      return this.expandedIds[id] !== false;
    },
    toggleExpand(id) {
      this.$emit('toggle-expand', id);
    },
    handleDragChange() {
      this.$emit('change');
    },
  },
};
</script>

<style scoped>
.menu-drag-area {
  min-height: 10px;
}

.menu-tree-node {
  margin-bottom: 8px;
}

.menu-node-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: var(--vz-card-bg, #fff);
  border: 1px solid var(--vz-border-color, #e9ebec);
  border-radius: 8px;
  padding: 8px 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
}

.menu-node-card:hover {
  border-color: var(--vz-primary, #405189);
  box-shadow: 0 4px 12px rgba(64, 81, 137, 0.08);
}

.card-main-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
}

.node-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.drag-handle {
  cursor: grab;
  color: var(--vz-muted, #878a99);
  font-size: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 6px;
  border-radius: 4px;
  touch-action: none;
}

.drag-handle:hover {
  background: var(--vz-light, #f3f3f9);
  color: var(--vz-primary, #405189);
}

.drag-handle:active {
  cursor: grabbing;
}

.toggle-btn {
  background: transparent;
  border: none;
  color: var(--vz-muted, #878a99);
  padding: 3px;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.toggle-btn:hover {
  background: var(--vz-light, #f3f3f9);
  color: var(--vz-primary, #405189);
}

.toggle-placeholder {
  width: 20px;
  display: inline-block;
  flex-shrink: 0;
}

.icon-avatar {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: rgba(64, 81, 137, 0.08);
  color: var(--vz-primary, #405189);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  flex-shrink: 0;
}

.node-identity {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  overflow: hidden;
}

.node-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--vz-body-color, #212529);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.code-badge code {
  font-size: 11px;
  background: var(--vz-light, #f3f3f9);
  color: var(--vz-secondary, #3577f1);
  padding: 2px 6px;
  border-radius: 4px;
}

.card-sub-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
  padding-left: 60px;
}

.node-badges {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.node-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: var(--vz-muted, #878a99);
  flex-wrap: wrap;
}

.meta-url {
  display: inline-flex;
  align-items: center;
  background: var(--vz-light, #f3f3f9);
  padding: 1px 6px;
  border-radius: 4px;
  max-width: 140px;
}

.meta-url-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.action-btn {
  min-width: 28px;
  height: 28px;
  padding: 2px 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.nested-children-container {
  margin-left: 24px;
  padding-left: 10px;
  border-left: 2px dashed var(--vz-border-color, #e9ebec);
  margin-top: 6px;
}

.empty-drop-zone {
  min-height: 36px;
  border: 1px dashed var(--vz-border-color, #ced4da);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.01);
  margin-bottom: 6px;
}

.empty-drop-placeholder {
  font-size: 12px;
  padding: 6px;
}

.menu-drag-ghost {
  opacity: 0.4;
  background: rgba(64, 81, 137, 0.1) !important;
  border: 2px dashed var(--vz-primary, #405189) !important;
}

.menu-drag-active {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
}

/* Mobile responsive adjustments */
@media (max-width: 768px) {
  .menu-node-card {
    padding: 8px 10px;
  }

  .card-sub-row {
    padding-left: 32px;
    gap: 6px;
  }

  .nested-children-container {
    margin-left: 12px;
    padding-left: 6px;
  }

  .icon-avatar {
    width: 28px;
    height: 28px;
    font-size: 15px;
  }

  .drag-handle {
    padding: 4px 5px;
    font-size: 16px;
  }

  .toggle-placeholder {
    width: 16px;
  }
}

@media (max-width: 576px) {
  .card-sub-row {
    padding-left: 0;
    margin-top: 2px;
  }

  .meta-url {
    max-width: 100px;
  }

  .action-btn {
    padding: 2px 6px;
  }
}
</style>
