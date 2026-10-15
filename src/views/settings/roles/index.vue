<template>
  <Layout>
    <PageHeader :title="viewMode === 'matrix' ? activeRole?.name?.toUpperCase() + ' Permissions' : 'Role Management'" pageTitle="Settings" />

    <!-- =======================================================================
         VIEW MODE 1: ROLES LIST & MANAGEMENT
         ======================================================================= -->
    <template v-if="viewMode === 'list'">
      <!-- Top KPI Metric Cards -->
      <BRow class="mb-4 g-3">
        <BCol xl="3" md="6">
          <BCard no-body class="card-animate shadow-sm border-0 h-100 kpi-card">
            <BCardBody class="d-flex align-items-center justify-content-between p-3">
              <div>
                <p class="text-uppercase fw-semibold text-muted fs-11 mb-1">Total Roles</p>
                <h3 class="mb-0 fw-bold text-primary">
                  <count-to :duration="800" :startVal="0" :endVal="stats.total"></count-to>
                </h3>
                <p class="mb-0 text-muted fs-12 mt-1">
                  <span class="badge bg-primary-subtle text-primary me-1">
                    <i class="ri-shield-user-line align-middle"></i> Roles
                  </span>
                  Configured system roles
                </p>
              </div>
              <div class="avatar-sm flex-shrink-0">
                <span class="avatar-title bg-primary-subtle text-primary rounded-circle fs-3">
                  <i class="ri-shield-user-line"></i>
                </span>
              </div>
            </BCardBody>
          </BCard>
        </BCol>

        <BCol xl="3" md="6">
          <BCard no-body class="card-animate shadow-sm border-0 h-100 kpi-card">
            <BCardBody class="d-flex align-items-center justify-content-between p-3">
              <div>
                <p class="text-uppercase fw-semibold text-muted fs-11 mb-1">Active Roles</p>
                <h3 class="mb-0 fw-bold text-success">
                  <count-to :duration="800" :startVal="0" :endVal="stats.active"></count-to>
                </h3>
                <p class="mb-0 text-muted fs-12 mt-1">
                  <span class="badge bg-success-subtle text-success me-1">
                    <i class="ri-checkbox-circle-line align-middle"></i> Active
                  </span>
                  Assignable to users
                </p>
              </div>
              <div class="avatar-sm flex-shrink-0">
                <span class="avatar-title bg-success-subtle text-success rounded-circle fs-3">
                  <i class="ri-checkbox-circle-line"></i>
                </span>
              </div>
            </BCardBody>
          </BCard>
        </BCol>

        <BCol xl="3" md="6">
          <BCard no-body class="card-animate shadow-sm border-0 h-100 kpi-card">
            <BCardBody class="d-flex align-items-center justify-content-between p-3">
              <div>
                <p class="text-uppercase fw-semibold text-muted fs-11 mb-1">System Modules</p>
                <h3 class="mb-0 fw-bold text-warning">
                  <count-to :duration="800" :startVal="0" :endVal="stats.total_modules"></count-to>
                </h3>
                <p class="mb-0 text-muted fs-12 mt-1">
                  <span class="badge bg-warning-subtle text-warning me-1">
                    <i class="ri-apps-2-line align-middle"></i> Modules
                  </span>
                  Protected resources
                </p>
              </div>
              <div class="avatar-sm flex-shrink-0">
                <span class="avatar-title bg-warning-subtle text-warning rounded-circle fs-3">
                  <i class="ri-apps-2-line"></i>
                </span>
              </div>
            </BCardBody>
          </BCard>
        </BCol>

        <BCol xl="3" md="6">
          <BCard no-body class="card-animate shadow-sm border-0 h-100 kpi-card">
            <BCardBody class="d-flex align-items-center justify-content-between p-3">
              <div>
                <p class="text-uppercase fw-semibold text-muted fs-11 mb-1">Permission Types</p>
                <h3 class="mb-0 fw-bold text-info">
                  <count-to :duration="800" :startVal="0" :endVal="stats.total_permissions"></count-to>
                </h3>
                <p class="mb-0 text-muted fs-12 mt-1">
                  <span class="badge bg-info-subtle text-info me-1">
                    <i class="ri-key-2-line align-middle"></i> Authority
                  </span>
                  Registry operations
                </p>
              </div>
              <div class="avatar-sm flex-shrink-0">
                <span class="avatar-title bg-info-subtle text-info rounded-circle fs-3">
                  <i class="ri-key-2-line"></i>
                </span>
              </div>
            </BCardBody>
          </BCard>
        </BCol>
      </BRow>

      <!-- Roles List Card -->
      <BCard no-body class="shadow-sm border-0">
        <BCardHeader class="border-0 bg-transparent py-3">
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <!-- Search Box -->
            <div class="d-flex align-items-center gap-2 flex-grow-1 flex-md-grow-0" style="min-width: 280px; max-width: 360px;">
              <div class="search-box w-100 position-relative">
                <input
                  type="text"
                  class="form-control search ps-4"
                  placeholder="Search role by name, description..."
                  v-model="searchQuery"
                  @input="fetchRoles"
                />
                <i class="ri-search-line search-icon position-absolute top-50 start-0 translate-middle-y ms-2 text-muted"></i>
              </div>
            </div>

            <!-- Filters & Buttons -->
            <div class="d-flex flex-wrap align-items-center gap-2">
              <div class="d-flex align-items-center gap-2" role="group">
                <button
                  type="button"
                  class="btn btn-sm rounded-2 filter-pill-btn"
                  :class="statusFilter === 'all' ? 'btn-primary' : 'filter-pill-inactive'"
                  @click="setStatusFilter('all')"
                >
                  All ({{ stats.total }})
                </button>
                <button
                  type="button"
                  class="btn btn-sm rounded-2 filter-pill-btn"
                  :class="statusFilter === 'active' ? 'btn-success' : 'filter-pill-inactive'"
                  @click="setStatusFilter('active')"
                >
                  Active ({{ stats.active }})
                </button>
                <button
                  type="button"
                  class="btn btn-sm rounded-2 filter-pill-btn"
                  :class="statusFilter === 'inactive' ? 'btn-warning' : 'filter-pill-inactive'"
                  @click="setStatusFilter('inactive')"
                >
                  Inactive ({{ stats.inactive }})
                </button>
              </div>

              <router-link to="/settings/permissions" class="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1">
                <i class="ri-key-2-line"></i>
                <span>Permissions Registry</span>
              </router-link>

              <button
                type="button"
                class="btn btn-primary btn-sm d-inline-flex align-items-center gap-1"
                @click="openCreateModal"
              >
                <i class="ri-add-line fs-14"></i>
                <span>Create Role</span>
              </button>
            </div>
          </div>
        </BCardHeader>

        <BCardBody class="pt-0">
          <!-- Loading -->
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading roles...</span>
            </div>
            <p class="text-muted fs-13 mt-2">Loading system roles...</p>
          </div>

          <!-- Empty -->
          <div v-else-if="roles.length === 0" class="text-center py-5">
            <div class="avatar-lg mx-auto mb-3">
              <span class="avatar-title bg-light text-muted rounded-circle fs-1">
                <i class="ri-shield-user-line"></i>
              </span>
            </div>
            <h5 class="fs-16 fw-semibold">No Roles Found</h5>
            <p class="text-muted fs-13 mb-3">
              {{ searchQuery || statusFilter !== 'all' ? 'No roles match your filter criteria.' : 'No roles created yet.' }}
            </p>
            <button
              type="button"
              class="btn btn-primary btn-sm"
              @click="openCreateModal"
            >
              <i class="ri-add-line me-1"></i> Add First Role
            </button>
          </div>

          <!-- Table -->
          <div v-else class="table-responsive">
            <table class="table align-middle table-nowrap table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th scope="col" style="width: 70px;">ID</th>
                  <th scope="col">Role Name</th>
                  <th scope="col">Guard</th>
                  <th scope="col">Description</th>
                  <th scope="col" class="text-center">Accessible Modules</th>
                  <th scope="col" class="text-center">Permissions Assigned</th>
                  <th scope="col" class="text-center">Assigned Users</th>
                  <th scope="col" class="text-center">Status</th>
                  <th scope="col">Created</th>
                  <th scope="col" class="text-end" style="width: 130px;">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in roles" :key="r.role_id" class="role-row">
                  <td class="fw-medium text-muted">
                    #{{ r.role_id }}
                  </td>
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="avatar-xs flex-shrink-0 me-2">
                        <span class="avatar-title bg-primary text-white rounded-circle fs-12 fw-bold text-uppercase">
                          {{ r.name ? r.name[0] : 'R' }}
                        </span>
                      </div>
                      <div>
                        <span
                          class="fw-bold fs-13 text-dark role-name cursor-pointer"
                          @click="openMatrixView(r)"
                          title="Click to view & edit permissions matrix"
                        >
                          {{ r.name ? r.name.charAt(0).toUpperCase() + r.name.slice(1) : '' }}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="badge bg-secondary-subtle text-secondary font-monospace">
                      {{ r.guard_name || 'web' }}
                    </span>
                  </td>
                  <td>
                    <span class="text-muted fs-13">
                      {{ r.description || '—' }}
                    </span>
                  </td>
                  <td class="text-center">
                    <button
                      type="button"
                      class="btn btn-xs rounded-pill px-2 py-1 d-inline-flex align-items-center gap-1 permission-badge-btn"
                      :class="r.stats?.accessible_modules_count > 0 ? 'permission-badge-active' : 'permission-badge-empty'"
                      @click="openMatrixView(r)"
                      title="Click to configure Permissions Matrix"
                    >
                      <i class="ri-shield-keyhole-line"></i>
                      <span class="badge-text">{{ r.stats?.accessible_modules_count || 0 }}/{{ stats.total_modules }} Modules</span>
                    </button>
                  </td>
                  <td class="text-center">
                    <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 fs-11">
                      <i class="ri-key-2-line me-1"></i>
                      {{ r.stats?.permissions_count || 0 }} Rules
                    </span>
                  </td>
                  <td class="text-center">
                    <span class="badge bg-info-subtle text-info border border-info-subtle px-2 py-1 fs-11">
                      <i class="ri-user-line me-1"></i>
                      {{ r.stats?.users_count || 0 }} Users
                    </span>
                  </td>
                  <td class="text-center">
                    <span
                      class="badge d-inline-flex align-items-center gap-1 px-2 py-1 fs-11"
                      :class="r.status === 'active' ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-warning-subtle text-warning border border-warning-subtle'"
                    >
                      <i :class="r.status === 'active' ? 'ri-checkbox-circle-fill' : 'ri-pause-circle-fill'"></i>
                      <span class="text-capitalize">{{ r.status }}</span>
                    </span>
                  </td>
                  <td class="text-muted fs-12">
                    {{ r.created_at || '—' }}
                  </td>
                  <td class="text-end">
                    <div class="d-flex align-items-center justify-content-end gap-1">
                      <button
                        type="button"
                        class="btn btn-sm btn-action-perms p-1"
                        @click="openMatrixView(r)"
                        title="Permissions Matrix (Edit Modules & Permissions)"
                      >
                        <i class="ri-shield-keyhole-line"></i>
                      </button>
                      <button
                        type="button"
                        class="btn btn-sm btn-action-edit p-1"
                        @click="openEditModal(r)"
                        title="Edit Role"
                      >
                        <i class="ri-pencil-line"></i>
                      </button>
                      <button
                        type="button"
                        class="btn btn-sm btn-action-delete p-1"
                        @click="confirmDelete(r)"
                        :disabled="r.name === 'admin'"
                        :title="r.name === 'admin' ? 'Primary Admin role cannot be deleted' : 'Delete Role'"
                      >
                        <i class="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </BCardBody>
      </BCard>
    </template>

    <!-- =======================================================================
         VIEW MODE 2: ROLE PERMISSIONS MATRIX (EXACT MATCH OF SCREENSHOT)
         ======================================================================= -->
    <template v-else-if="viewMode === 'matrix'">
      <BRow class="g-3">
        <!-- Left Side: Role Profile Card (Matching Screenshot Left Column) -->
        <BCol xl="3" lg="4">
          <BCard no-body class="shadow-sm border-0 h-100">
            <BCardBody class="p-4 d-flex flex-column">
              <!-- Avatar Circle with Initial -->
              <div class="text-center mb-4">
                <div class="role-avatar-circle mx-auto mb-3 shadow-sm">
                  <span class="role-avatar-letter">
                    {{ activeRole?.name ? activeRole.name[0].toUpperCase() : 'A' }}
                  </span>
                </div>
                <h4 class="fw-bold mb-1 text-dark role-profile-name">
                  {{ activeRole?.name ? activeRole.name.charAt(0).toUpperCase() + activeRole.name.slice(1) : 'Role' }}
                </h4>
                <p class="text-muted fs-13 mb-0">Role</p>
              </div>

              <!-- Module & Permission Count Badges -->
              <div class="row g-2 mb-4">
                <div class="col-6">
                  <div class="p-3 rounded text-center stat-mini-card">
                    <h4 class="fw-bold text-warning mb-0 fs-18">
                      {{ matrixStats.accessible_modules }}
                    </h4>
                    <span class="fs-11 text-muted text-uppercase fw-semibold">modules</span>
                  </div>
                </div>
                <div class="col-6">
                  <div class="p-3 rounded text-center stat-mini-card">
                    <h4 class="fw-bold text-warning mb-0 fs-18">
                      {{ matrixStats.total_permissions }}
                    </h4>
                    <span class="fs-11 text-muted text-uppercase fw-semibold">permissions</span>
                  </div>
                </div>
              </div>

              <!-- Meta List -->
              <div class="d-flex align-items-center justify-content-between py-2 border-bottom">
                <span class="fs-13 text-muted d-flex align-items-center gap-1">
                  <i class="ri-calendar-line"></i> Created
                </span>
                <span class="fs-13 fw-semibold text-dark">
                  {{ activeRole?.created_at || 'Sep 30, 2026' }}
                </span>
              </div>

              <div class="d-flex align-items-center justify-content-between py-2 border-bottom mb-4">
                <span class="fs-13 text-muted d-flex align-items-center gap-1">
                  <i class="ri-checkbox-circle-line"></i> Status
                </span>
                <span class="badge bg-success-subtle text-success fs-12 px-2 py-1">
                  {{ activeRole?.status ? activeRole.status.charAt(0).toUpperCase() + activeRole.status.slice(1) : 'Active' }}
                </span>
              </div>

              <!-- Explanatory Text Callout -->
              <div class="mt-auto p-3 rounded info-callout">
                <p class="fs-12 text-muted mb-0">
                  Changes apply to every user with this role, in their Menu Access too. Extra access given to a specific user is kept.
                </p>
              </div>
            </BCardBody>
          </BCard>
        </BCol>

        <!-- Right Side: Permissions Matrix Table (Matching Screenshot Right Column) -->
        <BCol xl="9" lg="8">
          <BCard no-body class="shadow-sm border-0">
            <!-- Top Navigation & Action Header -->
            <BCardHeader class="border-0 bg-transparent py-3 px-4">
              <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
                <!-- Title & Back Button -->
                <div class="d-flex align-items-center gap-2">
                  <button
                    type="button"
                    class="btn btn-sm btn-ghost-secondary p-1 rounded-circle"
                    @click="closeMatrixView"
                    title="Back to roles list"
                  >
                    <i class="ri-arrow-left-line fs-18"></i>
                  </button>
                  <i class="ri-lock-2-line text-warning fs-18"></i>
                  <h5 class="fw-bold mb-0 text-dark role-header-title">
                    {{ activeRole?.name ? activeRole.name.charAt(0).toUpperCase() + activeRole.name.slice(1) : 'Role' }} permissions
                  </h5>
                </div>

                <!-- Copy to Roles Dropdown -->
                <div class="d-flex align-items-center gap-2">
                  <div class="dropdown">
                    <button
                      type="button"
                      class="btn btn-outline-primary btn-sm dropdown-toggle d-inline-flex align-items-center gap-1"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <i class="ri-file-copy-line"></i>
                      <span>Copy to roles</span>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end shadow">
                      <li class="dropdown-header text-uppercase fs-11">Copy current permissions to:</li>
                      <li v-for="target in otherRoles" :key="target.role_id">
                        <a
                          class="dropdown-item cursor-pointer fs-13"
                          @click="copyCurrentPermissionsTo(target)"
                        >
                          <i class="ri-shield-user-line me-1 text-primary"></i>
                          <span>{{ target.name ? target.name.charAt(0).toUpperCase() + target.name.slice(1) : '' }}</span>
                        </a>
                      </li>
                      <li><hr class="dropdown-divider"></li>
                      <li class="dropdown-header text-uppercase fs-11">Or copy into this role from:</li>
                      <li v-for="src in otherRoles" :key="'from_' + src.role_id">
                        <a
                          class="dropdown-item cursor-pointer fs-13 text-secondary"
                          @click="copyFromOtherRole(src)"
                        >
                          <i class="ri-download-2-line me-1 text-muted"></i>
                          <span>Import from {{ src.name ? src.name.charAt(0).toUpperCase() + src.name.slice(1) : '' }}</span>
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </BCardHeader>

            <BCardBody class="p-4 pt-0">
              <!-- Amber Banner Bar (Exact match from screenshot) -->
              <div class="p-3 rounded mb-3 matrix-banner d-flex flex-wrap align-items-center justify-content-between gap-3">
                <div class="d-flex align-items-baseline gap-2">
                  <span class="matrix-count-val">{{ matrixStats.accessible_modules }}</span>
                  <span class="fs-13 text-muted">/</span>
                  <span class="matrix-count-total">{{ matrixStats.total_modules }}</span>
                  <span class="fw-bold fs-14 matrix-count-label ms-1">modules accessible</span>
                  <span class="text-muted fs-12 ms-3 d-none d-md-inline matrix-banner-subtitle">
                    Ticking a menu ticks its submenus and parents; unticking a menu unticks its submenus.
                  </span>
                </div>

                <!-- Quick Set Buttons -->
                <div class="d-flex align-items-center gap-2">
                  <span class="fs-12 text-muted me-1">Quick set:</span>
                  <button
                    type="button"
                    class="btn btn-xs rounded-pill px-3 py-1 btn-quick-full d-inline-flex align-items-center gap-1"
                    @click="quickSetFullAccess"
                  >
                    <i class="ri-checkbox-circle-line"></i>
                    <span>Full access</span>
                  </button>
                  <button
                    type="button"
                    class="btn btn-xs rounded-pill px-3 py-1 btn-quick-view d-inline-flex align-items-center gap-1"
                    @click="quickSetViewOnly"
                  >
                    <i class="ri-eye-line"></i>
                    <span>View only</span>
                  </button>
                  <button
                    type="button"
                    class="btn btn-xs rounded-pill px-3 py-1 btn-quick-clear d-inline-flex align-items-center gap-1"
                    @click="quickSetClearAll"
                  >
                    <i class="ri-close-circle-line"></i>
                    <span>Clear all</span>
                  </button>
                </div>
              </div>

              <!-- Search & Controls Bar -->
              <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                <!-- Search Modules -->
                <div class="position-relative" style="width: 280px;">
                  <input
                    type="text"
                    class="form-control form-control-sm ps-4"
                    placeholder="Search modules..."
                    v-model="matrixSearchQuery"
                  />
                  <i class="ri-search-line position-absolute top-50 start-0 translate-middle-y ms-2 text-muted fs-13"></i>
                </div>

                <!-- Expand/Collapse & Show Other Permissions Toggle -->
                <div class="d-flex align-items-center gap-2">
                  <button
                    type="button"
                    class="btn btn-xs btn-light border"
                    @click="expandAllMenus"
                  >
                    <i class="ri-expand-up-down-line me-1"></i> Expand all
                  </button>
                  <button
                    type="button"
                    class="btn btn-xs btn-light border"
                    @click="collapseAllMenus"
                  >
                    <i class="ri-collapse-diagonal-line me-1"></i> Collapse all
                  </button>

                  <!-- Toggle Other Permissions (Exact match from screenshot) -->
                  <div class="form-check form-switch ms-2 d-flex align-items-center gap-2 mb-0">
                    <input
                      class="form-check-input cursor-pointer"
                      type="checkbox"
                      role="switch"
                      id="showOtherPermsSwitch"
                      v-model="showOtherPermissions"
                    />
                    <label class="form-check-label fs-12 text-muted cursor-pointer user-select-none" for="showOtherPermsSwitch">
                      Show other permissions ({{ otherPermissionsCount }})
                    </label>
                  </div>
                </div>
              </div>

              <!-- Matrix Loading State -->
              <div v-if="matrixLoading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading matrix...</span>
                </div>
                <p class="text-muted fs-13 mt-2">Loading permissions matrix...</p>
              </div>

              <!-- Permissions Matrix Table -->
              <div v-else class="matrix-table-container border rounded">
                <table class="table align-middle table-nowrap mb-0 matrix-table">
                  <thead class="matrix-thead sticky-top">
                    <tr>
                      <th scope="col" class="ps-3 py-2" style="min-width: 220px;">
                        <span class="fs-11 fw-bold text-uppercase text-muted">MODULE</span>
                      </th>

                      <!-- ALL Column Header -->
                      <th scope="col" class="text-center py-2" style="width: 55px;">
                        <span class="d-block fs-11 text-muted text-uppercase mb-1">ALL</span>
                        <div
                          class="custom-matrix-checkbox mx-auto"
                          :class="{
                            checked: isHeaderAllChecked('all'),
                            indeterminate: isHeaderIndeterminate('all')
                          }"
                          @click="toggleHeaderPermission('all')"
                          title="Toggle ALL permissions across all modules"
                        >
                          <i v-if="isHeaderAllChecked('all')" class="ri-check-line"></i>
                          <i v-else-if="isHeaderIndeterminate('all')" class="ri-subtract-line"></i>
                        </div>
                      </th>

                      <!-- Dynamic Active Permissions Columns -->
                      <th
                        v-for="perm in visiblePermissions"
                        :key="perm.permission_id"
                        scope="col"
                        class="text-center py-2"
                        style="width: 55px;"
                      >
                        <span class="d-block fs-11 text-muted text-uppercase mb-1 font-monospace">
                          {{ perm.name }}
                        </span>
                        <div
                          class="custom-matrix-checkbox mx-auto"
                          :class="{
                            checked: isHeaderAllChecked(perm.name),
                            indeterminate: isHeaderIndeterminate(perm.name)
                          }"
                          @click="toggleHeaderPermission(perm.name)"
                          :title="'Toggle ' + perm.name.toUpperCase() + ' across all modules'"
                        >
                          <i v-if="isHeaderAllChecked(perm.name)" class="ri-check-line"></i>
                          <i v-else-if="isHeaderIndeterminate(perm.name)" class="ri-subtract-line"></i>
                        </div>
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    <template v-for="node in filteredMenuTree" :key="node.id || node.menu_id">
                      <!-- Level 1: Parent / Root Menu Row -->
                      <tr class="matrix-row matrix-parent-row">
                        <td class="ps-3 py-2">
                          <div class="d-flex align-items-center">
                            <span
                              v-if="node.children && node.children.length > 0"
                              class="cursor-pointer me-2 text-muted expand-chevron"
                              @click="toggleMenuExpand(node)"
                            >
                              <i :class="isExpanded(node) ? 'ri-arrow-down-s-line fs-14' : 'ri-arrow-right-s-line fs-14'"></i>
                            </span>
                            <span v-else class="me-3"></span>

                            <i :class="node.icon || 'ri-folder-line'" class="me-2 text-warning fs-14"></i>
                            <span class="fw-bold fs-13 text-dark module-title">{{ node.name }}</span>

                            <span
                              v-if="isNeedsView(node)"
                              class="badge bg-warning-subtle text-warning ms-2 fs-10 px-1 py-0"
                            >
                              Needs View
                            </span>
                          </div>
                        </td>

                        <!-- Node ALL Checkbox -->
                        <td class="text-center py-2">
                          <div
                            class="custom-matrix-checkbox mx-auto"
                            :class="{
                              checked: isRowAllChecked(node),
                              indeterminate: isRowIndeterminate(node)
                            }"
                            @click="toggleRowAll(node)"
                          >
                            <i v-if="isRowAllChecked(node)" class="ri-check-line"></i>
                            <i v-else-if="isRowIndeterminate(node)" class="ri-subtract-line"></i>
                          </div>
                        </td>

                        <!-- Node Permission Checkboxes -->
                        <td
                          v-for="perm in visiblePermissions"
                          :key="perm.permission_id"
                          class="text-center py-2"
                        >
                          <div
                            class="custom-matrix-checkbox mx-auto"
                            :class="{ checked: getRolePerm(node, perm.name) }"
                            @click="togglePermission(node, perm.name)"
                          >
                            <i v-if="getRolePerm(node, perm.name)" class="ri-check-line"></i>
                          </div>
                        </td>
                      </tr>

                      <!-- Level 2: Children / Submenu Rows -->
                      <template v-if="isExpanded(node) && node.children && node.children.length > 0">
                        <template v-for="sub in node.children" :key="sub.id || sub.menu_id">
                          <tr class="matrix-row matrix-child-row">
                            <td class="py-2" style="padding-left: 2.75rem;">
                              <div class="d-flex align-items-center">
                                <span
                                  v-if="sub.children && sub.children.length > 0"
                                  class="cursor-pointer me-1 text-muted expand-chevron"
                                  @click="toggleMenuExpand(sub)"
                                >
                                  <i :class="isExpanded(sub) ? 'ri-arrow-down-s-line fs-13' : 'ri-arrow-right-s-line fs-13'"></i>
                                </span>
                                <span v-else class="me-2"></span>

                                <i :class="sub.icon || 'ri-checkbox-blank-circle-line'" class="me-2 text-muted fs-11"></i>
                                <span class="fs-13 text-secondary module-child-title">{{ sub.name }}</span>
                                <span
                                  v-if="isNeedsView(sub)"
                                  class="badge bg-warning-subtle text-warning ms-2 fs-10 px-1 py-0"
                                >
                                  Needs View
                                </span>
                              </div>
                            </td>

                            <!-- Child ALL -->
                            <td class="text-center py-2">
                              <div
                                class="custom-matrix-checkbox mx-auto"
                                :class="{
                                  checked: isRowAllChecked(sub),
                                  indeterminate: isRowIndeterminate(sub)
                                }"
                                @click="toggleRowAll(sub)"
                              >
                                <i v-if="isRowAllChecked(sub)" class="ri-check-line"></i>
                                <i v-else-if="isRowIndeterminate(sub)" class="ri-subtract-line"></i>
                              </div>
                            </td>

                            <!-- Child Permissions -->
                            <td
                              v-for="perm in visiblePermissions"
                              :key="perm.permission_id"
                              class="text-center py-2"
                            >
                              <div
                                class="custom-matrix-checkbox mx-auto"
                                :class="{ checked: getRolePerm(sub, perm.name) }"
                                @click="togglePermission(sub, perm.name)"
                              >
                                <i v-if="getRolePerm(sub, perm.name)" class="ri-check-line"></i>
                              </div>
                            </td>
                          </tr>

                          <!-- Level 3: Grandchildren Rows -->
                          <template v-if="isExpanded(sub) && sub.children && sub.children.length > 0">
                            <tr
                              v-for="gc in sub.children"
                              :key="gc.id || gc.menu_id"
                              class="matrix-row matrix-child-row"
                            >
                              <td class="py-2" style="padding-left: 4.25rem;">
                                <div class="d-flex align-items-center">
                                  <i :class="gc.icon || 'ri-checkbox-blank-circle-line'" class="me-2 text-muted fs-10"></i>
                                  <span class="fs-12 text-secondary module-child-title">{{ gc.name }}</span>
                                  <span
                                    v-if="isNeedsView(gc)"
                                    class="badge bg-warning-subtle text-warning ms-2 fs-10 px-1 py-0"
                                  >
                                    Needs View
                                  </span>
                                </div>
                              </td>

                              <!-- Grandchild ALL -->
                              <td class="text-center py-2">
                                <div
                                  class="custom-matrix-checkbox mx-auto"
                                  :class="{
                                    checked: isRowAllChecked(gc),
                                    indeterminate: isRowIndeterminate(gc)
                                  }"
                                  @click="toggleRowAll(gc)"
                                >
                                  <i v-if="isRowAllChecked(gc)" class="ri-check-line"></i>
                                  <i v-else-if="isRowIndeterminate(gc)" class="ri-subtract-line"></i>
                                </div>
                              </td>

                              <!-- Grandchild Permissions -->
                              <td
                                v-for="perm in visiblePermissions"
                                :key="perm.permission_id"
                                class="text-center py-2"
                              >
                                <div
                                  class="custom-matrix-checkbox mx-auto"
                                  :class="{ checked: getRolePerm(gc, perm.name) }"
                                  @click="togglePermission(gc, perm.name)"
                                >
                                  <i v-if="getRolePerm(gc, perm.name)" class="ri-check-line"></i>
                                </div>
                              </td>
                            </tr>
                          </template>
                        </template>
                      </template>
                    </template>
                  </tbody>
                </table>
              </div>

              <!-- Footer Bar (Exact match from screenshot: All changes saved / Save permissions) -->
              <div class="d-flex align-items-center justify-content-between pt-3 mt-3 border-top">
                <div class="d-flex align-items-center gap-2">
                  <i :class="hasUnsavedChanges ? 'ri-error-warning-line text-warning' : 'ri-check-double-line text-success'" class="fs-16"></i>
                  <span class="fs-13 fw-medium" :class="hasUnsavedChanges ? 'text-warning' : 'text-muted'">
                    {{ hasUnsavedChanges ? 'You have unsaved matrix permission changes.' : 'All changes saved' }}
                  </span>
                </div>

                <div class="d-flex align-items-center gap-2">
                  <button
                    type="button"
                    class="btn btn-ghost-secondary btn-sm"
                    @click="closeMatrixView"
                  >
                    Back to Roles
                  </button>
                  <button
                    type="button"
                    class="btn btn-warning btn-sm px-4 fw-bold d-inline-flex align-items-center gap-1 text-white btn-save-matrix"
                    @click="saveMatrixPermissions"
                    :disabled="savingMatrix"
                  >
                    <span v-if="savingMatrix" class="spinner-border spinner-border-sm me-1" role="status"></span>
                    <i v-else class="ri-save-line"></i>
                    <span>Save permissions</span>
                  </button>
                </div>
              </div>
            </BCardBody>
          </BCard>
        </BCol>
      </BRow>
    </template>

    <!-- Create / Edit Role Modal -->
    <BModal
      v-model="modalShow"
      id="roleModal"
      modal-class="zoomIn"
      class="v-modal-custom"
      :title="editingId ? 'Edit Role' : 'Create Role'"
      title-class="fw-bold fs-15 text-primary"
      header-class="p-3 bg-primary-subtle border-bottom"
      body-class="p-4"
      footer-class="p-3 border-top d-flex justify-content-end gap-2"
      hide-footer
      no-close-on-backdrop
      centered
    >
      <form @submit.prevent="submitRoleForm">
        <div v-if="formError" class="alert alert-danger py-2 px-3 fs-13 mb-3 d-flex align-items-center gap-2">
          <i class="ri-error-warning-line fs-16 flex-shrink-0"></i>
          <span>{{ formError }}</span>
        </div>

        <!-- Role Name -->
        <div class="mb-3">
          <label class="form-label fw-medium fs-13 required">Role Name</label>
          <input
            type="text"
            class="form-control"
            :class="{ 'is-invalid': formErrors.name }"
            v-model="form.name"
            placeholder="e.g. supervisor, agent, manager, auditor..."
            required
          />
          <div v-if="formErrors.name" class="invalid-feedback">
            {{ formErrors.name }}
          </div>
          <small class="text-muted fs-11">
            Role key identifier assigned to user accounts.
          </small>
        </div>

        <!-- Guard Name -->
        <div class="mb-3">
          <label class="form-label fw-medium fs-13">Guard Name</label>
          <input
            type="text"
            class="form-control"
            v-model="form.guard_name"
            placeholder="web"
          />
          <small class="text-muted fs-11">Default authentication guard (usually 'web' or 'api').</small>
        </div>

        <!-- Copy From Role (Only on Create) -->
        <div v-if="!editingId && roles.length > 0" class="mb-3">
          <label class="form-label fw-medium fs-13">Clone Permissions From Existing Role</label>
          <select class="form-select" v-model="form.copy_from_role_id">
            <option :value="null">-- Do not copy (Start blank) --</option>
            <option v-for="r in roles" :key="r.role_id" :value="r.role_id">
              {{ r.name.toUpperCase() }} ({{ r.stats?.accessible_modules_count || 0 }} modules)
            </option>
          </select>
          <small class="text-muted fs-11">Optionally pre-populate all module permissions from an existing role.</small>
        </div>

        <!-- Description -->
        <div class="mb-3">
          <label class="form-label fw-medium fs-13">Description</label>
          <textarea
            class="form-control"
            rows="2"
            v-model="form.description"
            placeholder="Role purpose and responsibility scope..."
          ></textarea>
        </div>

        <!-- Status -->
        <div class="mb-4">
          <label class="form-label fw-medium fs-13">Status</label>
          <div class="d-flex align-items-center gap-3">
            <div class="form-check">
              <input
                class="form-check-input"
                type="radio"
                name="role_status"
                id="role_status_active"
                value="active"
                v-model="form.status"
              />
              <label class="form-check-label fs-13 cursor-pointer" for="role_status_active">
                Active
              </label>
            </div>
            <div class="form-check">
              <input
                class="form-check-input"
                type="radio"
                name="role_status"
                id="role_status_inactive"
                value="inactive"
                v-model="form.status"
              />
              <label class="form-check-label fs-13 cursor-pointer" for="role_status_inactive">
                Inactive
              </label>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="d-flex align-items-center justify-content-end gap-2 pt-3 border-top">
          <button
            type="button"
            class="btn btn-ghost-secondary"
            @click="modalShow = false"
            :disabled="submitting"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="btn btn-primary px-4"
            :disabled="submitting"
          >
            <span v-if="submitting" class="spinner-border spinner-border-sm me-1" role="status"></span>
            <i v-else class="ri-save-line me-1"></i>
            <span>{{ editingId ? 'Update Role' : 'Create Role' }}</span>
          </button>
        </div>
      </form>
    </BModal>
  </Layout>
</template>

<script>
import { CountTo } from "vue3-count-to";
import Layout from "@/layouts/main.vue";
import PageHeader from "@/components/page-header";
import Swal from "sweetalert2";
import axios from "axios";

export default {
  name: "RoleManagement",
  components: {
    Layout,
    PageHeader,
    CountTo,
  },
  data() {
    return {
      viewMode: "list", // 'list' | 'matrix'
      loading: false,
      submitting: false,
      matrixLoading: false,
      savingMatrix: false,
      hasUnsavedChanges: false,
      roles: [],
      stats: {
        total: 0,
        active: 0,
        inactive: 0,
        total_permissions: 0,
        total_modules: 0,
      },
      searchQuery: "",
      statusFilter: "all",
      modalShow: false,
      editingId: null,
      form: {
        name: "",
        guard_name: "web",
        description: "",
        status: "active",
        copy_from_role_id: null,
      },
      formError: "",
      formErrors: {},

      // Matrix State (Matching Screenshot)
      activeRole: null,
      matrixPermissions: [],
      matrixMenus: [],
      matrixMenuTree: [],
      roleMatrix: {}, // roleMatrix[menu_id][perm_name] = true
      otherRoles: [],
      matrixStats: {
        total_modules: 0,
        accessible_modules: 0,
        total_permissions: 0,
      },
      matrixSearchQuery: "",
      expandedMenuIds: [],
      showOtherPermissions: false,
    };
  },
  computed: {
    apiBase() {
      return process.env.VUE_APP_AUTHDOMAIN || "http://localhost:8001/api";
    },

    // Core 5 permissions vs extended permissions
    corePermissionNames() {
      return ["view", "add", "edit", "modify", "delete"];
    },

    visiblePermissions() {
      if (this.showOtherPermissions) {
        return this.matrixPermissions;
      }
      return this.matrixPermissions.filter((p) =>
        this.corePermissionNames.includes(p.name.toLowerCase())
      );
    },

    otherPermissionsCount() {
      const extra = this.matrixPermissions.filter(
        (p) => !this.corePermissionNames.includes(p.name.toLowerCase())
      );
      return extra.length;
    },

    filteredMenuTree() {
      const tree = this.matrixMenuTree || [];
      if (!this.matrixSearchQuery || !this.matrixSearchQuery.trim()) {
        return tree;
      }

      const q = this.matrixSearchQuery.toLowerCase().trim();

      const filterNode = (node) => {
        const nameMatches = Boolean(node.name && node.name.toLowerCase().includes(q));
        const codeMatches = Boolean(node.code && node.code.toLowerCase().includes(q));

        let matchingChildren = [];
        if (node.children && node.children.length > 0) {
          matchingChildren = node.children.map(filterNode).filter(Boolean);
        }

        if (nameMatches || codeMatches || matchingChildren.length > 0) {
          return {
            ...node,
            children: matchingChildren.length > 0 ? matchingChildren : (node.children || []),
          };
        }
        return null;
      };

      return tree.map(filterNode).filter(Boolean);
    },
  },
  mounted() {
    this.fetchRoles();
  },
  methods: {
    getAuthHeaders() {
      const token = localStorage.getItem("jwt") || localStorage.getItem("token");
      return token ? { Authorization: `Bearer ${token}` } : {};
    },

    setStatusFilter(status) {
      this.statusFilter = status;
      this.fetchRoles();
    },

    getMenuId(item) {
      if (!item) return null;
      if (typeof item === "number") return item;
      return Number(item.id || item.menu_id);
    },

    normalizeMenuTree(tree) {
      if (!Array.isArray(tree)) return [];
      return tree.map((node) => {
        const id = this.getMenuId(node);
        const rawChildren = node.all_children || node.allChildren || node.children || [];
        return {
          ...node,
          id: id,
          menu_id: id,
          children: this.normalizeMenuTree(rawChildren),
        };
      });
    },

    /* =========================================================================
       Roles List & Management
       ========================================================================= */
    async fetchRoles() {
      this.loading = true;
      try {
        const params = {};
        if (this.searchQuery && this.searchQuery.trim()) {
          params.search = this.searchQuery.trim();
        }
        if (this.statusFilter !== "all") {
          params.status = this.statusFilter;
        }

        const response = await axios.get(`${this.apiBase}/roles`, {
          params,
          headers: this.getAuthHeaders(),
        });

        this.roles = response.data.data || [];
        if (response.data.stats) {
          this.stats = {
            total: response.data.stats.total || 0,
            active: response.data.stats.active || 0,
            inactive: response.data.stats.inactive || 0,
            total_permissions: response.data.stats.total_permissions || 0,
            total_modules: response.data.stats.total_modules || 0,
          };
        }
      } catch (err) {
        console.error("Failed to load roles:", err);
        Swal.fire({
          icon: "error",
          title: "Network Error",
          text: err.response?.data?.message || "Failed to load roles from server.",
          toast: true,
          position: "top-end",
          timer: 3500,
          showConfirmButton: false,
        });
      } finally {
        this.loading = false;
      }
    },

    openCreateModal() {
      this.editingId = null;
      this.form = {
        name: "",
        guard_name: "web",
        description: "",
        status: "active",
        copy_from_role_id: null,
      };
      this.formError = "";
      this.formErrors = {};
      this.modalShow = true;
    },

    openEditModal(role) {
      this.editingId = role.role_id;
      this.form = {
        name: role.name || "",
        guard_name: role.guard_name || "web",
        description: role.description || "",
        status: role.status || "active",
        copy_from_role_id: null,
      };
      this.formError = "";
      this.formErrors = {};
      this.modalShow = true;
    },

    async submitRoleForm() {
      this.formError = "";
      this.formErrors = {};

      if (!this.form.name || !this.form.name.trim()) {
        this.formErrors.name = "Role name is required.";
        return;
      }

      this.submitting = true;
      try {
        const payload = {
          name: this.form.name.trim().toLowerCase(),
          guard_name: this.form.guard_name ? this.form.guard_name.trim() : "web",
          description: this.form.description ? this.form.description.trim() : null,
          status: this.form.status || "active",
          copy_from_role_id: this.form.copy_from_role_id || null,
        };

        if (this.editingId) {
          await axios.put(`${this.apiBase}/roles/${this.editingId}`, payload, {
            headers: this.getAuthHeaders(),
          });
          Swal.fire({
            icon: "success",
            title: "Updated",
            text: "Role updated successfully.",
            toast: true,
            position: "top-end",
            timer: 2500,
            showConfirmButton: false,
          });
        } else {
          await axios.post(`${this.apiBase}/roles`, payload, {
            headers: this.getAuthHeaders(),
          });
          Swal.fire({
            icon: "success",
            title: "Created",
            text: "Role created successfully with permissions.",
            toast: true,
            position: "top-end",
            timer: 2500,
            showConfirmButton: false,
          });
        }

        this.modalShow = false;
        await this.fetchRoles();
      } catch (err) {
        if (err.response?.status === 422 && err.response?.data?.errors) {
          this.formErrors = err.response.data.errors;
          this.formError = Object.values(err.response.data.errors).flat().join(" ");
        } else {
          this.formError = err.response?.data?.message || "Failed to save role.";
        }
      } finally {
        this.submitting = false;
      }
    },

    async confirmDelete(role) {
      if (role.name === "admin") {
        Swal.fire({
          icon: "warning",
          title: "Protected Role",
          text: "The primary Admin role cannot be deleted.",
        });
        return;
      }

      const result = await Swal.fire({
        title: "Delete Role?",
        html: `Are you sure you want to delete role <strong>"${role.name.toUpperCase()}"</strong>?<br><small class="text-muted">This will remove all module permission rules associated with this role.</small>`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Delete",
        cancelButtonText: "Cancel",
        confirmButtonClass: "btn btn-danger w-xs me-2",
        cancelButtonClass: "btn btn-ghost-secondary w-xs",
        buttonsStyling: false,
        showCloseButton: true,
      });

      if (result.isConfirmed) {
        try {
          await axios.delete(`${this.apiBase}/roles/${role.role_id}`, {
            headers: this.getAuthHeaders(),
          });
          Swal.fire({
            icon: "success",
            title: "Deleted",
            text: "Role deleted successfully.",
            toast: true,
            position: "top-end",
            timer: 2500,
            showConfirmButton: false,
          });
          await this.fetchRoles();
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Delete Failed",
            text: err.response?.data?.message || "Failed to delete role.",
            confirmButtonClass: "btn btn-primary",
            buttonsStyling: false,
          });
        }
      }
    },

    /* =========================================================================
       Role Permissions Matrix Mode (Matching Screenshot)
       ========================================================================= */
    async openMatrixView(role) {
      this.activeRole = role;
      this.viewMode = "matrix";
      this.hasUnsavedChanges = false;
      this.matrixSearchQuery = "";
      this.matrixLoading = true;

      try {
        const response = await axios.get(`${this.apiBase}/roles/${role.role_id}/matrix`, {
          headers: this.getAuthHeaders(),
        });

        const data = response.data;
        this.activeRole = data.role;
        this.matrixPermissions = data.permissions || [];
        this.matrixMenus = (data.menus || []).map((m) => ({
          ...m,
          id: this.getMenuId(m),
          menu_id: this.getMenuId(m),
        }));
        this.matrixMenuTree = this.normalizeMenuTree(data.menu_tree || []);
        this.roleMatrix = data.matrix || {};
        this.otherRoles = data.other_roles || [];
        this.updateMatrixStats();
        this.expandAllMenus();
      } catch (err) {
        console.error("Failed to load role permissions matrix:", err);
        Swal.fire({
          icon: "error",
          title: "Failed to Load Matrix",
          text: err.response?.data?.message || "Could not load permissions matrix.",
        });
        this.viewMode = "list";
      } finally {
        this.matrixLoading = false;
      }
    },

    closeMatrixView() {
      if (this.hasUnsavedChanges) {
        Swal.fire({
          title: "Unsaved Changes",
          text: "You have unsaved changes in this permissions matrix. Are you sure you want to exit?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Exit Without Saving",
          cancelButtonText: "Stay",
          confirmButtonClass: "btn btn-warning w-xs me-2",
          cancelButtonClass: "btn btn-primary w-xs",
          buttonsStyling: false,
        }).then((res) => {
          if (res.isConfirmed) {
            this.viewMode = "list";
            this.fetchRoles();
          }
        });
      } else {
        this.viewMode = "list";
        this.fetchRoles();
      }
    },

    updateMatrixStats() {
      const menuIds = Object.keys(this.roleMatrix);
      let totalPerms = 0;
      let accessibleCount = 0;

      menuIds.forEach((mId) => {
        const perms = this.roleMatrix[mId] || {};
        const pKeys = Object.keys(perms).filter((k) => Boolean(perms[k]));
        totalPerms += pKeys.length;
        if (perms.view) {
          accessibleCount++;
        }
      });

      this.matrixStats = {
        total_modules: this.matrixMenus.length,
        accessible_modules: accessibleCount,
        total_permissions: totalPerms,
      };
    },

    getRolePerm(menuOrId, permName) {
      const id = this.getMenuId(menuOrId);
      if (!id) return false;
      const key = permName.toLowerCase();
      return Boolean(this.roleMatrix[id]?.[key]);
    },

    isExpanded(menuOrId) {
      const id = this.getMenuId(menuOrId);
      return this.expandedMenuIds.includes(id);
    },

    toggleMenuExpand(menuOrId) {
      const id = this.getMenuId(menuOrId);
      if (!id) return;
      const idx = this.expandedMenuIds.indexOf(id);
      if (idx !== -1) {
        this.expandedMenuIds.splice(idx, 1);
      } else {
        this.expandedMenuIds.push(id);
      }
    },

    expandAllMenus() {
      const ids = (this.matrixMenus || []).map((m) => this.getMenuId(m)).filter(Boolean);
      this.expandedMenuIds = [...ids];
    },

    collapseAllMenus() {
      this.expandedMenuIds = [];
    },

    isNeedsView(menu) {
      const id = this.getMenuId(menu);
      if (!id) return false;
      const m = this.roleMatrix[id];
      if (!m) return false;
      const hasWrite = Object.keys(m).some((k) => k !== "view" && Boolean(m[k]));
      return hasWrite && !m.view;
    },

    // Row ALL Checkbox logic
    isRowAllChecked(menu) {
      const id = this.getMenuId(menu);
      if (!id) return false;
      const m = this.roleMatrix[id] || {};
      const perms = this.visiblePermissions;
      const isSelfAll = perms.every((p) => Boolean(m[p.name.toLowerCase()]));
      if (!isSelfAll) return false;

      if (menu.children && menu.children.length > 0) {
        return menu.children.every((child) => this.isRowAllChecked(child));
      }
      return true;
    },

    isRowIndeterminate(menu) {
      if (this.isRowAllChecked(menu)) return false;
      const id = this.getMenuId(menu);
      if (!id) return false;
      const m = this.roleMatrix[id] || {};
      const perms = this.visiblePermissions;
      const hasAnySelf = perms.some((p) => Boolean(m[p.name.toLowerCase()]));
      if (hasAnySelf) return true;

      if (menu.children && menu.children.length > 0) {
        return menu.children.some(
          (child) => this.isRowAllChecked(child) || this.isRowIndeterminate(child)
        );
      }
      return false;
    },

    toggleRowAll(menu) {
      const currentlyAll = this.isRowAllChecked(menu);
      const nextVal = !currentlyAll;
      const updated = { ...this.roleMatrix };
      const perms = this.visiblePermissions;

      const applyToNode = (node) => {
        const id = this.getMenuId(node);
        if (!id) return;
        if (!updated[id]) {
          updated[id] = {};
        }
        perms.forEach((p) => {
          updated[id][p.name.toLowerCase()] = nextVal;
        });

        if (node.children && node.children.length > 0) {
          node.children.forEach(applyToNode);
        }
      };

      applyToNode(menu);
      this.roleMatrix = updated;

      // If turning ON, ensure parent has VIEW
      const parentId = Number(menu.parent_id || 0);
      if (nextVal && parentId > 0) {
        this.ensureParentView(parentId);
      }

      this.hasUnsavedChanges = true;
      this.updateMatrixStats();
    },

    togglePermission(menu, permName) {
      const id = this.getMenuId(menu);
      if (!id) return;
      const pKey = permName.toLowerCase();
      const updated = { ...this.roleMatrix };

      if (!updated[id]) {
        updated[id] = {};
      }

      const current = Boolean(updated[id][pKey]);
      const nextVal = !current;

      const setNodePerm = (node, p, val) => {
        const nodeId = this.getMenuId(node);
        if (!nodeId) return;
        if (!updated[nodeId]) {
          updated[nodeId] = {};
        }
        updated[nodeId][p] = val;

        // If turning write permission ON, automatically turn view ON
        if (val && p !== "view") {
          updated[nodeId]["view"] = true;
        }

        // If turning view OFF, turn all write permissions OFF
        if (!val && p === "view") {
          Object.keys(updated[nodeId]).forEach((k) => {
            updated[nodeId][k] = false;
          });
        }

        // Cascade down to children
        if (node.children && node.children.length > 0) {
          node.children.forEach((c) => setNodePerm(c, p, val));
        }
      };

      setNodePerm(menu, pKey, nextVal);
      this.roleMatrix = updated;

      // Cascade up to parent
      const parentId = Number(menu.parent_id || 0);
      if (nextVal && parentId > 0) {
        this.ensureParentView(parentId);
      }

      this.hasUnsavedChanges = true;
      this.updateMatrixStats();
    },

    ensureParentView(parentId) {
      const pId = Number(parentId || 0);
      if (!pId) return;
      const updated = { ...this.roleMatrix };
      if (!updated[pId]) {
        updated[pId] = {};
      }
      updated[pId]["view"] = true;
      this.roleMatrix = updated;

      const parentMenu = (this.matrixMenus || []).find((m) => this.getMenuId(m) === pId);
      if (parentMenu && parentMenu.parent_id && Number(parentMenu.parent_id) > 0) {
        this.ensureParentView(Number(parentMenu.parent_id));
      }
    },

    // Header Column Checkbox logic
    isHeaderAllChecked(permName) {
      const menus = this.matrixMenus || [];
      if (menus.length === 0) return false;
      const perms = this.visiblePermissions;

      if (permName === "all") {
        return menus.every((m) => {
          const id = this.getMenuId(m);
          const row = this.roleMatrix[id] || {};
          return perms.every((p) => Boolean(row[p.name.toLowerCase()]));
        });
      }

      const pKey = permName.toLowerCase();
      return menus.every((m) => {
        const id = this.getMenuId(m);
        return Boolean(this.roleMatrix[id]?.[pKey]);
      });
    },

    isHeaderIndeterminate(permName) {
      if (this.isHeaderAllChecked(permName)) return false;
      const menus = this.matrixMenus || [];
      const perms = this.visiblePermissions;

      if (permName === "all") {
        return menus.some((m) => {
          const id = this.getMenuId(m);
          const row = this.roleMatrix[id] || {};
          return perms.some((p) => Boolean(row[p.name.toLowerCase()]));
        });
      }

      const pKey = permName.toLowerCase();
      return menus.some((m) => {
        const id = this.getMenuId(m);
        return Boolean(this.roleMatrix[id]?.[pKey]);
      });
    },

    toggleHeaderPermission(permName) {
      const currentlyAll = this.isHeaderAllChecked(permName);
      const nextVal = !currentlyAll;
      const menus = this.matrixMenus || [];
      const perms = this.visiblePermissions;
      const updated = { ...this.roleMatrix };

      menus.forEach((m) => {
        const id = this.getMenuId(m);
        if (!id) return;
        if (!updated[id]) {
          updated[id] = {};
        }

        if (permName === "all") {
          perms.forEach((p) => {
            updated[id][p.name.toLowerCase()] = nextVal;
          });
        } else {
          const pKey = permName.toLowerCase();
          updated[id][pKey] = nextVal;

          if (nextVal && pKey !== "view") {
            updated[id]["view"] = true;
          }
          if (!nextVal && pKey === "view") {
            Object.keys(updated[id]).forEach((k) => {
              updated[id][k] = false;
            });
          }
        }
      });

      this.roleMatrix = updated;
      this.hasUnsavedChanges = true;
      this.updateMatrixStats();
    },

    // Quick Set Buttons (Matching Screenshot)
    quickSetFullAccess() {
      const updated = {};
      const menus = this.matrixMenus || [];
      const perms = this.matrixPermissions || [];

      menus.forEach((m) => {
        const id = this.getMenuId(m);
        if (!id) return;
        updated[id] = {};
        perms.forEach((p) => {
          updated[id][p.name.toLowerCase()] = true;
        });
      });

      this.roleMatrix = updated;
      this.hasUnsavedChanges = true;
      this.updateMatrixStats();

      Swal.fire({
        icon: "success",
        title: "Full Access Set",
        text: "Granted all permissions for all modules in this role.",
        toast: true,
        position: "top-end",
        timer: 2000,
        showConfirmButton: false,
      });
    },

    quickSetViewOnly() {
      const updated = {};
      const menus = this.matrixMenus || [];

      menus.forEach((m) => {
        const id = this.getMenuId(m);
        if (!id) return;
        updated[id] = { view: true };
      });

      this.roleMatrix = updated;
      this.hasUnsavedChanges = true;
      this.updateMatrixStats();

      Swal.fire({
        icon: "info",
        title: "View Only Set",
        text: "Enabled VIEW permission for all modules; write permissions cleared.",
        toast: true,
        position: "top-end",
        timer: 2000,
        showConfirmButton: false,
      });
    },

    quickSetClearAll() {
      this.roleMatrix = {};
      this.hasUnsavedChanges = true;
      this.updateMatrixStats();

      Swal.fire({
        icon: "warning",
        title: "Permissions Cleared",
        text: "All module permissions have been unchecked for this role.",
        toast: true,
        position: "top-end",
        timer: 2000,
        showConfirmButton: false,
      });
    },

    // Copy to roles feature
    async copyCurrentPermissionsTo(targetRole) {
      const result = await Swal.fire({
        title: `Copy to ${targetRole.name.toUpperCase()}?`,
        html: `Are you sure you want to overwrite all module permissions of <strong>"${targetRole.name.toUpperCase()}"</strong> with the permissions of <strong>"${this.activeRole.name.toUpperCase()}"</strong>?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, Copy",
        cancelButtonText: "Cancel",
        confirmButtonClass: "btn btn-primary w-xs me-2",
        cancelButtonClass: "btn btn-ghost-secondary w-xs",
        buttonsStyling: false,
      });

      if (result.isConfirmed) {
        try {
          // If current matrix has unsaved changes, save first or copy directly
          await axios.post(`${this.apiBase}/roles/${targetRole.role_id}/copy-from`, {
            source_role_id: this.activeRole.role_id,
          }, {
            headers: this.getAuthHeaders(),
          });

          Swal.fire({
            icon: "success",
            title: "Permissions Copied",
            text: `Permissions successfully cloned to ${targetRole.name.toUpperCase()}.`,
            toast: true,
            position: "top-end",
            timer: 2500,
            showConfirmButton: false,
          });
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Copy Failed",
            text: err.response?.data?.message || "Failed to copy permissions.",
          });
        }
      }
    },

    async copyFromOtherRole(sourceRole) {
      const result = await Swal.fire({
        title: `Import from ${sourceRole.name.toUpperCase()}?`,
        html: `Are you sure you want to overwrite this role's permissions with the permissions from <strong>"${sourceRole.name.toUpperCase()}"</strong>?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, Import",
        cancelButtonText: "Cancel",
        confirmButtonClass: "btn btn-warning w-xs me-2",
        cancelButtonClass: "btn btn-ghost-secondary w-xs",
        buttonsStyling: false,
      });

      if (result.isConfirmed) {
        try {
          const response = await axios.post(`${this.apiBase}/roles/${this.activeRole.role_id}/copy-from`, {
            source_role_id: sourceRole.role_id,
          }, {
            headers: this.getAuthHeaders(),
          });

          if (response.data && response.data.data) {
            this.roleMatrix = response.data.data.matrix || {};
            this.updateMatrixStats();
            this.hasUnsavedChanges = false;
          }

          Swal.fire({
            icon: "success",
            title: "Imported",
            text: `Imported permissions from ${sourceRole.name.toUpperCase()}.`,
            toast: true,
            position: "top-end",
            timer: 2500,
            showConfirmButton: false,
          });
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Import Failed",
            text: err.response?.data?.message || "Failed to import permissions.",
          });
        }
      }
    },

    // Save Matrix to Server
    async saveMatrixPermissions() {
      this.savingMatrix = true;
      try {
        const assignments = [];
        const permMapByName = {};
        (this.matrixPermissions || []).forEach((p) => {
          permMapByName[p.name.toLowerCase()] = p.permission_id;
        });

        Object.keys(this.roleMatrix).forEach((mId) => {
          const perms = this.roleMatrix[mId] || {};
          Object.keys(perms).forEach((pName) => {
            if (perms[pName] && permMapByName[pName]) {
              assignments.push({
                menu_id: Number(mId),
                permission_id: permMapByName[pName],
              });
            }
          });
        });

        await axios.post(`${this.apiBase}/roles/${this.activeRole.role_id}/matrix`, {
          assignments,
        }, {
          headers: this.getAuthHeaders(),
        });

        this.hasUnsavedChanges = false;
        this.updateMatrixStats();
        window.dispatchEvent(new CustomEvent("menus-updated"));

        Swal.fire({
          icon: "success",
          title: "All Changes Saved",
          text: `Permissions matrix for ${this.activeRole.name.toUpperCase()} successfully saved to database.`,
          toast: true,
          position: "top-end",
          timer: 2500,
          showConfirmButton: false,
        });
      } catch (err) {
        console.error("Failed to save matrix:", err);
        Swal.fire({
          icon: "error",
          title: "Save Failed",
          text: err.response?.data?.message || "Failed to save permissions matrix.",
        });
      } finally {
        this.savingMatrix = false;
      }
    },
  },
};
</script>

<style scoped>
.kpi-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
}

.search-box {
  position: relative;
}
.search-box .search {
  padding-left: 36px;
}
.search-box .search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
}

.role-row {
  transition: background-color 0.15s ease;
}
.role-row:hover {
  background-color: rgba(64, 81, 137, 0.03);
}

.role-name {
  transition: color 0.15s ease;
}
.role-row:hover .role-name {
  color: #ea580c !important;
}

.btn-action-edit,
.btn-action-perms {
  color: #405189;
  background-color: rgba(64, 81, 137, 0.08);
  border: none;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}
.btn-action-perms {
  color: #d97706;
  background-color: rgba(217, 119, 6, 0.1);
}
.btn-action-perms:hover {
  background-color: #f59e0b;
  color: #ffffff;
}
.btn-action-edit:hover {
  background-color: #405189;
  color: #ffffff;
}

.btn-action-delete {
  color: #f06548;
  background-color: rgba(240, 101, 72, 0.08);
  border: none;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}
.btn-action-delete:hover {
  background-color: #f06548;
  color: #ffffff;
}

.filter-pill-btn {
  font-weight: 500;
  font-size: 0.8125rem;
  transition: all 0.2s ease;
}
.filter-pill-inactive {
  background-color: #f3f6f9;
  border: 1px solid #ced4da;
  color: #495057;
}
.filter-pill-inactive:hover {
  background-color: #e9ecef;
  color: #212529;
  border-color: #adb5bd;
}

.cursor-pointer {
  cursor: pointer;
}
.required:after {
  content: " *";
  color: #f06548;
}

/* User Table Pill Buttons */
.permission-badge-btn {
  font-size: 11px !important;
  font-weight: 600 !important;
  transition: all 0.2s ease !important;
  line-height: 1.2 !important;
}
.permission-badge-active {
  background-color: rgba(245, 158, 11, 0.12) !important;
  border: 1px solid #f59e0b !important;
  color: #b45309 !important;
}
.permission-badge-active i {
  color: #d97706 !important;
}
.permission-badge-active:hover {
  background-color: #f59e0b !important;
  color: #ffffff !important;
}
.permission-badge-active:hover i,
.permission-badge-active:hover .badge-text {
  color: #ffffff !important;
}

.permission-badge-empty {
  background-color: transparent !important;
  border: 1px solid #6c757d !important;
  color: #6c757d !important;
}
.permission-badge-empty i {
  color: #6c757d !important;
}
.permission-badge-empty:hover {
  background-color: #6c757d !important;
  color: #ffffff !important;
}
.permission-badge-empty:hover i,
.permission-badge-empty:hover .badge-text {
  color: #ffffff !important;
}

/* =========================================================================
   Matrix Mode Styles (Exact match of Screenshot)
   ========================================================================= */
.role-avatar-circle {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px rgba(234, 88, 12, 0.35);
}
.role-avatar-letter {
  color: #ffffff;
  font-size: 34px;
  font-weight: 800;
  line-height: 1;
}

.stat-mini-card {
  background-color: #fff9f0;
  border: 1px solid #ffedd5;
}

.info-callout {
  background-color: rgba(64, 81, 137, 0.04);
  border: 1px dashed rgba(64, 81, 137, 0.2);
}

/* Amber Banner matching screenshot */
.matrix-banner {
  background-color: #fff9f0;
  border: 1.5px solid #fed7aa;
}
.matrix-count-val,
.matrix-count-total {
  color: #ea580c;
  font-size: 1.6rem;
  font-weight: 800;
  line-height: 1;
}
.matrix-count-label {
  color: #1e293b;
  font-size: 1.05rem;
}
.matrix-banner-subtitle {
  color: #64748b;
}

/* Quick Set Buttons matching screenshot */
.btn-quick-full,
.btn-quick-view {
  background-color: #ffffff;
  border: 1.5px solid #ea580c;
  color: #c2410c;
  font-weight: 600;
  transition: all 0.15s ease;
}
.btn-quick-full:hover,
.btn-quick-view:hover {
  background-color: #ea580c;
  color: #ffffff;
}

.btn-quick-clear {
  background-color: #ffffff;
  border: 1.5px solid #ef4444;
  color: #dc2626;
  font-weight: 600;
  transition: all 0.15s ease;
}
.btn-quick-clear:hover {
  background-color: #ef4444;
  color: #ffffff;
}

/* Permissions Matrix Table */
.matrix-table-container {
  max-height: 520px;
  overflow-y: auto;
}

.matrix-thead th {
  background-color: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
  padding: 8px 12px;
}

.matrix-row {
  transition: background-color 0.15s ease;
}
.matrix-row:hover {
  background-color: rgba(245, 158, 11, 0.04);
}

.matrix-parent-row {
  background-color: rgba(248, 250, 252, 0.5);
  font-weight: 600;
}

.matrix-child-row {
  border-top: 1px dashed #f1f5f9;
}

.expand-chevron {
  width: 16px;
  display: inline-block;
}

/* Orange Custom Matrix Checkbox (Exact Match from Screenshot) */
.custom-matrix-checkbox {
  width: 19px;
  height: 19px;
  border-radius: 4px;
  border: 2px solid #cbd5e1;
  background-color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  user-select: none;
  font-size: 13px;
  font-weight: bold;
  color: transparent;
}
.custom-matrix-checkbox:hover {
  border-color: #ea580c;
  box-shadow: 0 0 0 2px rgba(234, 88, 12, 0.15);
}
.custom-matrix-checkbox.checked {
  background-color: #ea580c !important;
  border-color: #ea580c !important;
  color: #ffffff !important;
}
.custom-matrix-checkbox.indeterminate {
  background-color: #ea580c !important;
  border-color: #ea580c !important;
  color: #ffffff !important;
}

.btn-save-matrix {
  background-color: #ea580c !important;
  border-color: #ea580c !important;
  transition: all 0.2s ease;
}
.btn-save-matrix:hover {
  background-color: #c2410c !important;
  border-color: #c2410c !important;
}

/* =========================================================================
   Dark Mode Overrides (Crisp High-Contrast Visibility)
   ========================================================================= */
[data-layout-mode="dark"] .permission-badge-active,
html[data-layout-mode="dark"] .permission-badge-active,
[data-bs-theme="dark"] .permission-badge-active,
html[data-bs-theme="dark"] .permission-badge-active {
  background-color: rgba(245, 158, 11, 0.22) !important;
  border: 1.5px solid #fbbf24 !important;
  color: #fef08a !important;
}
[data-layout-mode="dark"] .permission-badge-active i,
html[data-layout-mode="dark"] .permission-badge-active i,
[data-bs-theme="dark"] .permission-badge-active i,
html[data-bs-theme="dark"] .permission-badge-active i {
  color: #facc15 !important;
}
[data-layout-mode="dark"] .permission-badge-active .badge-text,
html[data-layout-mode="dark"] .permission-badge-active .badge-text,
[data-bs-theme="dark"] .permission-badge-active .badge-text,
html[data-bs-theme="dark"] .permission-badge-active .badge-text {
  color: #fef08a !important;
  font-weight: 700 !important;
}

[data-layout-mode="dark"] .permission-badge-empty,
html[data-layout-mode="dark"] .permission-badge-empty,
[data-bs-theme="dark"] .permission-badge-empty,
html[data-bs-theme="dark"] .permission-badge-empty {
  background-color: rgba(255, 255, 255, 0.04) !important;
  border-color: rgba(255, 255, 255, 0.25) !important;
  color: #cbd5e1 !important;
}
[data-layout-mode="dark"] .permission-badge-empty i,
html[data-layout-mode="dark"] .permission-badge-empty i,
[data-bs-theme="dark"] .permission-badge-empty i,
html[data-bs-theme="dark"] .permission-badge-empty i {
  color: #94a3b8 !important;
}
[data-layout-mode="dark"] .permission-badge-empty .badge-text,
html[data-layout-mode="dark"] .permission-badge-empty .badge-text,
[data-bs-theme="dark"] .permission-badge-empty .badge-text,
html[data-bs-theme="dark"] .permission-badge-empty .badge-text {
  color: #cbd5e1 !important;
}

[data-layout-mode="dark"] .stat-mini-card,
html[data-layout-mode="dark"] .stat-mini-card,
[data-bs-theme="dark"] .stat-mini-card,
html[data-bs-theme="dark"] .stat-mini-card {
  background-color: rgba(234, 88, 12, 0.12) !important;
  border-color: rgba(234, 88, 12, 0.3) !important;
}

[data-layout-mode="dark"] .matrix-banner,
html[data-layout-mode="dark"] .matrix-banner,
[data-bs-theme="dark"] .matrix-banner,
html[data-bs-theme="dark"] .matrix-banner {
  background-color: rgba(234, 88, 12, 0.1) !important;
  border-color: rgba(234, 88, 12, 0.35) !important;
}
[data-layout-mode="dark"] .matrix-count-val,
html[data-layout-mode="dark"] .matrix-count-val,
[data-bs-theme="dark"] .matrix-count-val,
html[data-bs-theme="dark"] .matrix-count-val {
  color: #fb923c !important;
}
[data-layout-mode="dark"] .matrix-count-label,
html[data-layout-mode="dark"] .matrix-count-label,
[data-bs-theme="dark"] .matrix-count-label,
html[data-bs-theme="dark"] .matrix-count-label {
  color: #f1f5f9 !important;
}

[data-layout-mode="dark"] .btn-quick-full,
html[data-layout-mode="dark"] .btn-quick-full,
[data-bs-theme="dark"] .btn-quick-full,
html[data-bs-theme="dark"] .btn-quick-full,
[data-layout-mode="dark"] .btn-quick-view,
html[data-layout-mode="dark"] .btn-quick-view,
[data-bs-theme="dark"] .btn-quick-view,
html[data-bs-theme="dark"] .btn-quick-view {
  background-color: rgba(234, 88, 12, 0.15) !important;
  border-color: #ea580c !important;
  color: #fdba74 !important;
}
[data-layout-mode="dark"] .btn-quick-full:hover,
html[data-layout-mode="dark"] .btn-quick-full:hover,
[data-bs-theme="dark"] .btn-quick-full:hover,
html[data-bs-theme="dark"] .btn-quick-full:hover,
[data-layout-mode="dark"] .btn-quick-view:hover,
html[data-layout-mode="dark"] .btn-quick-view:hover,
[data-bs-theme="dark"] .btn-quick-view:hover,
html[data-bs-theme="dark"] .btn-quick-view:hover {
  background-color: #ea580c !important;
  color: #ffffff !important;
}

[data-layout-mode="dark"] .btn-quick-clear,
html[data-layout-mode="dark"] .btn-quick-clear,
[data-bs-theme="dark"] .btn-quick-clear,
html[data-bs-theme="dark"] .btn-quick-clear {
  background-color: rgba(239, 68, 68, 0.15) !important;
  border-color: #ef4444 !important;
  color: #fca5a5 !important;
}

[data-layout-mode="dark"] .matrix-thead th,
html[data-layout-mode="dark"] .matrix-thead th,
[data-bs-theme="dark"] .matrix-thead th,
html[data-bs-theme="dark"] .matrix-thead th {
  background-color: #1e222d !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}

[data-layout-mode="dark"] .matrix-parent-row,
html[data-layout-mode="dark"] .matrix-parent-row,
[data-bs-theme="dark"] .matrix-parent-row,
html[data-bs-theme="dark"] .matrix-parent-row {
  background-color: rgba(255, 255, 255, 0.02) !important;
}

[data-layout-mode="dark"] .module-title,
html[data-layout-mode="dark"] .module-title,
[data-bs-theme="dark"] .module-title,
html[data-bs-theme="dark"] .module-title,
[data-layout-mode="dark"] .role-profile-name,
html[data-layout-mode="dark"] .role-profile-name,
[data-bs-theme="dark"] .role-profile-name,
html[data-bs-theme="dark"] .role-profile-name,
[data-layout-mode="dark"] .role-header-title,
html[data-layout-mode="dark"] .role-header-title,
[data-bs-theme="dark"] .role-header-title,
html[data-bs-theme="dark"] .role-header-title {
  color: #f1f5f9 !important;
}

[data-layout-mode="dark"] .module-child-title,
html[data-layout-mode="dark"] .module-child-title,
[data-bs-theme="dark"] .module-child-title,
html[data-bs-theme="dark"] .module-child-title {
  color: #cbd5e1 !important;
}

[data-layout-mode="dark"] .custom-matrix-checkbox,
html[data-layout-mode="dark"] .custom-matrix-checkbox,
[data-bs-theme="dark"] .custom-matrix-checkbox,
html[data-bs-theme="dark"] .custom-matrix-checkbox {
  background-color: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.25);
}

[data-layout-mode="dark"] .role-name,
html[data-layout-mode="dark"] .role-name,
[data-bs-theme="dark"] .role-name,
html[data-bs-theme="dark"] .role-name {
  color: #ced4da !important;
}
[data-layout-mode="dark"] .role-row:hover .role-name,
html[data-layout-mode="dark"] .role-row:hover .role-name,
[data-bs-theme="dark"] .role-row:hover .role-name,
html[data-bs-theme="dark"] .role-row:hover .role-name {
  color: #fb923c !important;
}

[data-layout-mode="dark"] .filter-pill-inactive,
html[data-layout-mode="dark"] .filter-pill-inactive,
[data-bs-theme="dark"] .filter-pill-inactive,
html[data-bs-theme="dark"] .filter-pill-inactive {
  background-color: rgba(255, 255, 255, 0.08) !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
  color: #e9ecef !important;
}
[data-layout-mode="dark"] .filter-pill-inactive:hover,
html[data-layout-mode="dark"] .filter-pill-inactive:hover,
[data-bs-theme="dark"] .filter-pill-inactive:hover,
html[data-bs-theme="dark"] .filter-pill-inactive:hover {
  background-color: rgba(255, 255, 255, 0.16) !important;
  color: #ffffff !important;
}

/* Modal Dark Mode & Visibility Fix */
#roleModal .modal-content,
.v-modal-custom .modal-content {
  background-color: var(--vz-card-bg, #ffffff) !important;
  color: var(--vz-body-color, #212529) !important;
  z-index: 1060 !important;
  box-shadow: 0 10px 35px rgba(0, 0, 0, 0.45) !important;
}

[data-layout-mode="dark"] #roleModal .modal-content,
[data-bs-theme="dark"] #roleModal .modal-content,
html[data-bs-theme="dark"] #roleModal .modal-content,
html[data-layout-mode="dark"] #roleModal .modal-content {
  background-color: #212529 !important;
  color: #f8fafc !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
}

[data-layout-mode="dark"] #roleModal .form-label,
[data-bs-theme="dark"] #roleModal .form-label,
html[data-bs-theme="dark"] #roleModal .form-label,
html[data-layout-mode="dark"] #roleModal .form-label {
  color: #f1f5f9 !important;
}

[data-layout-mode="dark"] #roleModal .form-control,
[data-bs-theme="dark"] #roleModal .form-control,
html[data-bs-theme="dark"] #roleModal .form-control,
html[data-layout-mode="dark"] #roleModal .form-control,
[data-layout-mode="dark"] #roleModal .form-select,
[data-bs-theme="dark"] #roleModal .form-select,
html[data-bs-theme="dark"] #roleModal .form-select,
html[data-layout-mode="dark"] #roleModal .form-select {
  background-color: #1a1d21 !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
  color: #f8fafc !important;
}

[data-layout-mode="dark"] #roleModal .form-check-label,
[data-bs-theme="dark"] #roleModal .form-check-label,
html[data-bs-theme="dark"] #roleModal .form-check-label,
html[data-layout-mode="dark"] #roleModal .form-check-label {
  color: #e2e8f0 !important;
}
</style>
