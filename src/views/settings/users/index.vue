<template>
  <Layout>
    <div v-if="!hasPermission" class="text-center py-5 my-5">
      <div class="spinner-border text-primary avatar-sm mb-3" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <h6 class="fs-14 fw-semibold text-muted mb-0">Verifying permissions...</h6>
    </div>
    <div v-else>
      <PageHeader title="User Management" pageTitle="Settings" />

    <!-- Top KPI Metric Cards -->
    <BRow class="mb-4 g-3">
      <BCol xl="3" md="6">
        <BCard no-body class="card-animate shadow-sm border-0 h-100 kpi-card">
          <BCardBody class="d-flex align-items-center justify-content-between p-3">
            <div>
              <p class="text-uppercase fw-semibold text-muted fs-11 mb-1">Total Users</p>
              <h3 class="mb-0 fw-bold text-primary">
                <count-to :duration="800" :startVal="0" :endVal="stats.total"></count-to>
              </h3>
              <p class="mb-0 text-muted fs-12 mt-1">
                <span class="badge bg-primary-subtle text-primary me-1">
                  <i class="ri-user-line align-middle"></i> Accounts
                </span>
                <span>{{ stats.admin || 0 }} Admins, {{ stats.users || 0 }} Users</span>
              </p>
            </div>
            <div class="avatar-sm flex-shrink-0">
              <span class="avatar-title bg-primary-subtle text-primary rounded-circle fs-3">
                <i class="ri-user-settings-line"></i>
              </span>
            </div>
          </BCardBody>
        </BCard>
      </BCol>

      <BCol xl="3" md="6">
        <BCard no-body class="card-animate shadow-sm border-0 h-100 kpi-card">
          <BCardBody class="d-flex align-items-center justify-content-between p-3">
            <div>
              <p class="text-uppercase fw-semibold text-muted fs-11 mb-1">Active Accounts</p>
              <h3 class="mb-0 fw-bold text-success">
                <count-to :duration="800" :startVal="0" :endVal="stats.active"></count-to>
              </h3>
              <p class="mb-0 text-muted fs-12 mt-1">
                <span class="badge bg-success-subtle text-success me-1">
                  <i class="ri-checkbox-circle-line align-middle"></i> Enabled
                </span>
                Can sign in & access
              </p>
            </div>
            <div class="avatar-sm flex-shrink-0">
              <span class="avatar-title bg-success-subtle text-success rounded-circle fs-3">
                <i class="ri-user-follow-line"></i>
              </span>
            </div>
          </BCardBody>
        </BCard>
      </BCol>

      <BCol xl="3" md="6">
        <BCard no-body class="card-animate shadow-sm border-0 h-100 kpi-card">
          <BCardBody class="d-flex align-items-center justify-content-between p-3">
            <div>
              <p class="text-uppercase fw-semibold text-muted fs-11 mb-1">Inactive Accounts</p>
              <h3 class="mb-0 fw-bold text-warning">
                <count-to :duration="800" :startVal="0" :endVal="stats.inactive"></count-to>
              </h3>
              <p class="mb-0 text-muted fs-12 mt-1">
                <span class="badge bg-warning-subtle text-warning me-1">
                  <i class="ri-pause-circle-line align-middle"></i> Disabled
                </span>
                Suspended login
              </p>
            </div>
            <div class="avatar-sm flex-shrink-0">
              <span class="avatar-title bg-warning-subtle text-warning rounded-circle fs-3">
                <i class="ri-user-unfollow-line"></i>
              </span>
            </div>
          </BCardBody>
        </BCard>
      </BCol>

      <BCol xl="3" md="6">
        <BCard no-body class="card-animate shadow-sm border-0 h-100 kpi-card">
          <BCardBody class="d-flex align-items-center justify-content-between p-3">
            <div>
              <p class="text-uppercase fw-semibold text-muted fs-11 mb-1">Assigned Entities</p>
              <h3 class="mb-0 fw-bold text-info">
                <count-to :duration="800" :startVal="0" :endVal="stats.assigned"></count-to>
              </h3>
              <p class="mb-0 text-muted fs-12 mt-1">
                <span class="badge bg-info-subtle text-info me-1">
                  <i class="ri-links-line align-middle"></i> Mapped
                </span>
                With routing access
              </p>
            </div>
            <div class="avatar-sm flex-shrink-0">
              <span class="avatar-title bg-info-subtle text-info rounded-circle fs-3">
                <i class="ri-link-m"></i>
              </span>
            </div>
          </BCardBody>
        </BCard>
      </BCol>
    </BRow>

    <!-- Main Card -->
    <BCard no-body class="shadow-sm border-0 mb-4">
      <BCardHeader class="border-0 bg-transparent py-3">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div class="d-flex align-items-center gap-2">
            <div class="avatar-xs flex-shrink-0">
              <span class="avatar-title bg-primary-subtle text-primary rounded-circle fs-14">
                <i class="ri-team-line"></i>
              </span>
            </div>
            <div>
              <h5 class="card-title mb-0 fs-15 fw-bold">User Directory</h5>
              <p class="text-muted fs-12 mb-0">Manage roles, menu access permissions, and multiple company assignments</p>
            </div>
          </div>
          <div class="d-flex align-items-center gap-2">
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary btn-icon"
              @click="fetchUsers"
              :disabled="loading"
              title="Refresh users"
            >
              <i class="ri-refresh-line" :class="{ 'ri-spin': loading }"></i>
            </button>
            <button
              type="button"
              class="btn btn-sm btn-primary d-flex align-items-center gap-1 shadow-sm"
              @click="openCreateModal"
            >
              <i class="ri-user-add-line fs-14"></i>
              <span>New User</span>
            </button>
          </div>
        </div>
      </BCardHeader>

      <!-- Filter Toolbar -->
      <BCardBody class="border-top border-bottom py-3 bg-light-subtle">
        <BRow class="g-3 align-items-center">
          <!-- Search box -->
          <BCol xl="4" lg="4" sm="12">
            <div class="search-box">
              <input
                type="text"
                class="form-control form-control-sm search"
                placeholder="Search by name, email, or username..."
                v-model="searchQuery"
              />
              <i class="ri-search-line search-icon text-muted"></i>
            </div>
          </BCol>

          <!-- Status Filter Dropdown -->
          <BCol xl="3" lg="3" sm="6">
            <div class="d-flex align-items-center gap-2">
              <span class="fs-12 text-muted text-nowrap fw-medium">Status:</span>
              <div class="input-group input-group-sm">
                <span class="input-group-text bg-light border-end-0 text-muted">
                  <i class="ri-checkbox-circle-line"></i>
                </span>
                <select v-model="statusFilter" class="form-select form-select-sm border-start-0">
                  <option value="all">All Statuses ({{ stats.total }})</option>
                  <option value="active">Active ({{ stats.active }})</option>
                  <option value="inactive">Inactive ({{ stats.inactive }})</option>
                </select>
              </div>
            </div>
          </BCol>

          <!-- Role Filter Dropdown -->
          <BCol xl="3" lg="3" sm="6">
            <div class="d-flex align-items-center gap-2">
              <span class="fs-12 text-muted text-nowrap fw-medium">Role:</span>
              <div class="input-group input-group-sm">
                <span class="input-group-text bg-light border-end-0 text-muted">
                  <i class="ri-shield-user-line"></i>
                </span>
                <select
                  class="form-select form-select-sm border-start-0"
                  v-model="roleFilter"
                >
                  <option value="all">All Roles ({{ users.length }})</option>
                  <option
                    v-for="r in filterableRoles"
                    :key="r.name"
                    :value="r.name"
                  >
                    {{ getRoleLabel(r.name) }} ({{ stats[r.name] || 0 }})
                  </option>
                </select>
              </div>
            </div>
          </BCol>

          <BCol xl="2" lg="2" sm="12" class="text-sm-end text-muted fs-12">
            Showing {{ filteredUsers.length }} of {{ users.length }} accounts
          </BCol>
        </BRow>
      </BCardBody>

      <!-- Table Content -->
      <BCardBody class="p-0">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary avatar-sm" role="status">
            <span class="visually-hidden">Loading users...</span>
          </div>
          <p class="text-muted mt-2 fs-13">Loading users and permissions from database...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredUsers.length === 0" class="text-center py-5">
          <div class="avatar-lg mx-auto mb-3">
            <span class="avatar-title bg-light text-muted rounded-circle fs-24">
              <i class="ri-user-search-line"></i>
            </span>
          </div>
          <h5 class="fs-16 fw-semibold">No Users Found</h5>
          <p class="text-muted fs-13 mb-3">
            {{ searchQuery || statusFilter !== 'all' || roleFilter !== 'all' ? 'No user accounts match your search or filter parameters.' : 'No users have been registered yet.' }}
          </p>
          <div class="d-flex align-items-center justify-content-center gap-2">
            <button
              v-if="searchQuery || statusFilter !== 'all' || roleFilter !== 'all'"
              type="button"
              class="btn btn-sm btn-outline-secondary"
              @click="resetFilters"
            >
              <i class="ri-close-line me-1"></i> Clear Filters
            </button>
            <button
              type="button"
              class="btn btn-sm btn-primary"
              @click="openCreateModal"
            >
              <i class="ri-user-add-line me-1"></i> Add User
            </button>
          </div>
        </div>

        <!-- Users Table -->
        <div v-else-if="false" class="table-responsive">
          <table class="table align-middle table-hover mb-0 user-table">
            <thead class="table-light text-muted text-uppercase fs-11">
              <tr>
                <th scope="col" style="min-width: 220px;" class="ps-3">User</th>
                <th scope="col" style="width: 100px;">Role</th>
                <th scope="col" style="width: 100px;">Status</th>
                <th scope="col" style="min-width: 160px;">Menu Access</th>
                <th scope="col" style="min-width: 170px;">Assigned Companies</th>
                <th scope="col" style="min-width: 170px;">Assigned Departments</th>
                <th scope="col" style="min-width: 170px;">Assigned Stations</th>
                <th scope="col" style="min-width: 170px;">Assigned Systems</th>
                <th scope="col" style="min-width: 170px;">Assigned Categories</th>
                <th scope="col" style="width: 120px;" class="text-end pe-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user.id" class="user-row">
                <!-- User Profile Column -->
                <td class="ps-3">
                  <div class="d-flex align-items-center gap-2">
                    <div class="avatar-xs flex-shrink-0">
                      <span class="avatar-title bg-primary-subtle text-primary rounded-circle fs-13 fw-semibold">
                        {{ getInitials(user.name || user.fullname) }}
                      </span>
                    </div>
                    <div>
                      <h6 class="fs-13 fw-semibold mb-0 user-name">
                        {{ user.fullname || user.name }}
                      </h6>
                      <div class="text-muted fs-11 d-flex align-items-center gap-2">
                        <span><i class="ri-mail-line me-1"></i>{{ user.email }}</span>
                        <span v-if="user.username" class="badge badge-username">@{{ user.username }}</span>
                      </div>
                    </div>
                  </div>
                </td>

                <!-- Role -->
                <td>
                  <span
                    class="badge d-inline-flex align-items-center gap-1 px-2 py-1 fs-11 text-capitalize"
                    :class="getRoleBadgeClass(user.role)"
                  >
                    <i :class="user.role === 'admin' ? 'ri-shield-user-line' : 'ri-user-line'"></i>
                    <span>{{ user.role || 'users' }}</span>
                  </span>
                </td>

                <!-- Status -->
                <td>
                  <span
                    class="badge d-inline-flex align-items-center gap-1 px-2 py-1 fs-11"
                    :class="user.status === 'active' ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-warning-subtle text-warning border border-warning-subtle'"
                  >
                    <i :class="user.status === 'active' ? 'ri-checkbox-circle-fill' : 'ri-close-circle-fill'"></i>
                    <span class="text-capitalize">{{ user.status }}</span>
                  </span>
                </td>

                <!-- Menu Access (Matrix Quick Link) -->
                <td>
                  <button
                    type="button"
                    class="btn btn-xs rounded-pill px-2 py-1 d-inline-flex align-items-center gap-1 permission-badge-btn"
                    :class="getUserAccessibleCount(user) > 0 ? 'permission-badge-active' : 'permission-badge-empty'"
                    @click="openPermissionsTabForUser(user)"
                    title="Click to configure Menu Access & Permissions"
                  >
                    <i class="ri-shield-keyhole-line"></i>
                    <span class="badge-text">{{ getUserAccessibleCount(user) }}/{{ totalMenuCount }} Modules</span>
                  </button>
                </td>

                <!-- Assigned Companies -->
                <td>
                  <div class="d-flex flex-wrap gap-1">
                    <template v-if="getAssignmentsByRef(user, 'company').length > 0">
                      <span
                        v-for="item in getAssignmentsByRef(user, 'company')"
                        :key="item.id"
                        class="badge px-2 py-1 fs-11 font-monospace"
                        :class="item.default ? 'bg-primary text-white' : 'bg-primary-subtle text-primary border border-primary-subtle'"
                        :title="item.default ? 'Default Company' : 'Assigned Company'"
                      >
                        <i v-if="item.default" class="ri-star-fill text-warning me-1"></i>
                        {{ item.reference_code }}
                      </span>
                    </template>
                    <span v-else class="text-muted fs-12 fst-italic">None</span>
                  </div>
                </td>

                <!-- Assigned Departments -->
                <td>
                  <div class="d-flex flex-wrap gap-1">
                    <template v-if="getAssignmentsByRef(user, 'department').length > 0">
                      <span
                        v-for="item in getAssignmentsByRef(user, 'department')"
                        :key="item.id"
                        class="badge px-2 py-1 fs-11 font-monospace"
                        :class="item.default ? 'bg-info text-white' : 'bg-info-subtle text-info border border-info-subtle'"
                        :title="item.default ? 'Default Department' : 'Assigned Department'"
                      >
                        <i v-if="item.default" class="ri-star-fill text-warning me-1"></i>
                        {{ item.reference_code }}
                      </span>
                    </template>
                    <span v-else class="text-muted fs-12 fst-italic">None</span>
                  </div>
                </td>

                <!-- Assigned Stations -->
                <td>
                  <div class="d-flex flex-wrap gap-1">
                    <template v-if="getAssignmentsByRef(user, 'station').length > 0">
                      <span
                        v-for="item in getAssignmentsByRef(user, 'station')"
                        :key="item.id"
                        class="badge px-2 py-1 fs-11 font-monospace"
                        :class="item.default ? 'bg-secondary text-white' : 'bg-secondary-subtle text-secondary border border-secondary-subtle'"
                        :title="item.default ? 'Default Station' : 'Assigned Station'"
                      >
                        <i v-if="item.default" class="ri-star-fill text-warning me-1"></i>
                        {{ item.reference_code }}
                      </span>
                    </template>
                    <span v-else class="text-muted fs-12 fst-italic">None</span>
                  </div>
                </td>

                <!-- Assigned Systems -->
                <td>
                  <div class="d-flex flex-wrap gap-1">
                    <template v-if="getAssignmentsByRef(user, 'system').length > 0">
                      <span
                        v-for="item in getAssignmentsByRef(user, 'system')"
                        :key="item.id"
                        class="badge px-2 py-1 fs-11 font-monospace"
                        :class="item.default ? 'badge-system-default' : 'badge-system-regular'"
                        :title="item.default ? 'Default System' : 'Assigned System'"
                      >
                        <i v-if="item.default" class="ri-star-fill text-warning me-1"></i>
                        {{ item.reference_code }}
                      </span>
                    </template>
                    <span v-else class="text-muted fs-12 fst-italic">None</span>
                  </div>
                </td>

                <!-- Assigned Categories -->
                <td>
                  <div class="d-flex flex-wrap gap-1">
                    <template v-if="getAssignmentsByRef(user, 'category').length > 0">
                      <span
                        v-for="item in getAssignmentsByRef(user, 'category')"
                        :key="item.id"
                        class="badge px-2 py-1 fs-11"
                        :class="item.default ? 'bg-primary text-white' : 'bg-primary-subtle text-primary border border-primary-subtle'"
                        :title="item.default ? 'Default Category' : 'Assigned Category'"
                      >
                        <i v-if="item.default" class="ri-star-fill text-warning me-1"></i>
                        {{ getCategoryName(item.reference_code) }}
                      </span>
                    </template>
                    <span v-else class="text-muted fs-12 fst-italic">None</span>
                  </div>
                </td>

                <!-- Actions -->
                <td class="text-end pe-3">
                  <div class="d-flex align-items-center justify-content-end gap-1">
                    <button
                      type="button"
                      class="btn btn-sm btn-action-perms p-1"
                      @click="openPermissionsTabForUser(user)"
                      title="Menu Access & Permissions Matrix"
                    >
                      <i class="ri-shield-keyhole-line"></i>
                    </button>
                    <button
                      type="button"
                      class="btn btn-sm btn-action-edit p-1"
                      @click="openEditModal(user)"
                      title="Edit User & Assignments"
                    >
                      <i class="ri-pencil-line"></i>
                    </button>
                    <button
                      type="button"
                      class="btn btn-sm btn-action-delete p-1"
                      @click="confirmDelete(user)"
                      :disabled="user.id === 1"
                      :title="user.id === 1 ? 'Primary Admin cannot be deleted' : 'Delete User'"
                    >
                      <i class="ri-delete-bin-line"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="users-grid-wrap">
          <AgGridVue
            class="users-grid"
            style="width: 100%; height: 100%;"
            item-name="users"
            :show-caption="false"
            :column-defs="userColumnDefs"
            :row-data="userGridRows"
            :default-col-def="userGridDefaultColDef"
            :loading="loading"
            :pagination="false"
            :suppress-pagination-panel="true"
            :suppress-column-virtualisation="true"
            :suppress-drag-leave-hides-columns="true"
            :ensure-dom-order="true"
            :suppress-cell-focus="true"
            :suppress-column-move-animation="true"
            :animate-rows="false"
            :header-height="48"
            :row-height="58"
            @grid-ready="onUsersGridReady"
          />
        </div>
      </BCardBody>
    </BCard>

    <!-- Modal: Create / Edit User, Roles, Menu Access & Entity Assignments -->
    <BModal
      v-model="modalShow"
      id="userModal"
      modal-class="zoomIn"
      :title="editingId ? 'Edit User & Entity Assignments' : 'Register New User'"
      title-class="fw-bold fs-15"
      hide-footer
      header-class="p-3 bg-primary-subtle"
      class="v-modal-custom"
      size="xl"
      centered
      body-class="p-4"
    >
      <form @submit.prevent="submitForm">
        <!-- Error Alert -->
        <div v-if="formError" class="alert alert-danger py-2 px-3 fs-13 mb-3 d-flex align-items-center gap-2">
          <i class="ri-error-warning-line fs-16"></i>
          <span>{{ formError }}</span>
        </div>

        <!-- Navigation Tabs inside Modal -->
        <ul class="nav nav-pills nav-customs nav-danger flex-nowrap overflow-x-auto mb-3 p-1 rounded modal-nav-tabs" role="tablist">
          <li class="nav-item">
            <a
              class="nav-link fs-13"
              :class="{ active: activeTab === 'account' }"
              href="javascript:void(0);"
              @click="activeTab = 'account'"
            >
              <i class="ri-user-3-line me-1"></i> Account Details
            </a>
          </li>
          <li class="nav-item">
            <a
              class="nav-link fs-13"
              :class="{ active: activeTab === 'menu_access' }"
              href="javascript:void(0);"
              @click="activeTab = 'menu_access'"
            >
              <i class="ri-shield-keyhole-line me-1"></i> Menu Access
              <span
                v-if="totalMenuCount"
                class="badge rounded-pill ms-1 menu-access-badge"
                :class="activeTab === 'menu_access' ? 'active-badge' : 'inactive-badge'"
                :style="activeTab === 'menu_access' ? 'color: #1e1b4b !important; background-color: #ffffff !important; font-weight: 800 !important;' : 'color: #f59e0b !important; background-color: rgba(245, 158, 11, 0.15) !important; font-weight: 700 !important;'"
              >
                {{ accessibleMenuCount }}/{{ totalMenuCount }}
              </span>
            </a>
          </li>
          <li class="nav-item">
            <a
              class="nav-link fs-13"
              :class="{ active: activeTab === 'companies' }"
              href="javascript:void(0);"
              @click="activeTab = 'companies'"
            >
              <i class="ri-building-line me-1"></i> Companies ({{ selectedCompanies.length }})
            </a>
          </li>
          <li class="nav-item">
            <a
              class="nav-link fs-13"
              :class="{ active: activeTab === 'departments' }"
              href="javascript:void(0);"
              @click="activeTab = 'departments'"
            >
              <i class="ri-community-line me-1"></i> Departments ({{ selectedDepartments.length }})
            </a>
          </li>
          <li class="nav-item">
            <a
              class="nav-link fs-13"
              :class="{ active: activeTab === 'stations' }"
              href="javascript:void(0);"
              @click="activeTab = 'stations'"
            >
              <i class="ri-map-pin-range-line me-1"></i> Stations ({{ selectedStations.length }})
            </a>
          </li>
          <li class="nav-item">
            <a
              class="nav-link fs-13"
              :class="{ active: activeTab === 'systems' }"
              href="javascript:void(0);"
              @click="activeTab = 'systems'"
            >
              <i class="ri-computer-line me-1"></i> Systems ({{ selectedSystems.length }})
            </a>
          </li>
          <li class="nav-item">
            <a
              class="nav-link fs-13"
              :class="{ active: activeTab === 'categories' }"
              href="javascript:void(0);"
              @click="activeTab = 'categories'"
            >
              <i class="ri-git-branch-line me-1"></i> Categories ({{ selectedCategories.length }})
            </a>
          </li>
        </ul>

        <!-- Tab 1: Account Details -->
        <div v-show="activeTab === 'account'">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label fw-semibold fs-13 required">Full Name</label>
              <input
                type="text"
                class="form-control"
                placeholder="e.g. John Doe"
                v-model="form.name"
                required
                :class="{ 'is-invalid': formErrors.name }"
              />
              <div v-if="formErrors.name" class="invalid-feedback">{{ formErrors.name }}</div>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold fs-13 required">Email Address</label>
              <input
                type="email"
                class="form-control"
                placeholder="name@company.com"
                v-model="form.email"
                required
                :class="{ 'is-invalid': formErrors.email }"
              />
              <div v-if="formErrors.email" class="invalid-feedback">{{ formErrors.email }}</div>
            </div>

            <div class="col-md-4">
              <label class="form-label fw-semibold fs-13">Username</label>
              <input
                type="text"
                class="form-control"
                placeholder="e.g. jdoe"
                v-model="form.username"
                :class="{ 'is-invalid': formErrors.username }"
              />
              <div v-if="formErrors.username" class="invalid-feedback">{{ formErrors.username }}</div>
            </div>

            <div class="col-md-4">
              <label class="form-label fw-semibold fs-13">User Role</label>
              <select class="form-select" v-model="form.role" @change="onRoleChanged">
                <option v-for="r in availableRoles" :key="r.name" :value="r.name">
                  {{ r.label }}
                </option>
              </select>
              <small class="text-muted fs-11">
                Roles configured from <router-link to="/settings/roles" class="text-primary fw-medium">Roles Management</router-link>
              </small>
            </div>

            <div class="col-md-4">
              <label class="form-label fw-semibold fs-13" :class="{ required: !editingId }">
                Password {{ editingId ? '(leave blank to keep unchanged)' : '' }}
              </label>
              <input
                type="password"
                class="form-control"
                placeholder="Min 6 characters"
                v-model="form.password"
                :required="!editingId"
                :class="{ 'is-invalid': formErrors.password }"
              />
              <div v-if="formErrors.password" class="invalid-feedback">{{ formErrors.password }}</div>
            </div>

            <div class="col-md-12">
              <label class="form-label fw-semibold fs-13">Account Status</label>
              <div class="d-flex align-items-center gap-3">
                <div class="form-check form-radio-success">
                  <input
                    class="form-check-input"
                    type="radio"
                    name="userStatus"
                    id="usrActive"
                    value="active"
                    v-model="form.status"
                  />
                  <label class="form-check-label fs-13 fw-medium text-success" for="usrActive">
                    <i class="ri-checkbox-circle-fill me-1"></i> Active
                  </label>
                </div>
                <div class="form-check form-radio-warning">
                  <input
                    class="form-check-input"
                    type="radio"
                    name="userStatus"
                    id="usrInactive"
                    value="inactive"
                    v-model="form.status"
                  />
                  <label class="form-check-label fs-13 fw-medium text-warning" for="usrInactive">
                    <i class="ri-pause-circle-fill me-1"></i> Inactive
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 2: Menu Access & Permissions (Matching Screenshot) -->
        <div v-show="activeTab === 'menu_access'">
          <!-- Top Orange Banner -->
          <div class="matrix-banner d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3 p-3 rounded">
            <div>
              <div class="d-flex align-items-baseline gap-1">
                <span class="matrix-count-val">{{ accessibleMenuCount }}</span>
                <span class="matrix-count-total">/{{ totalMenuCount }}</span>
                <strong class="matrix-count-label ms-1">modules accessible</strong>
              </div>
              <div class="matrix-banner-subtitle text-muted fs-12 mt-1">
                Ticking a menu ticks its submenus and parents; unticking a menu unticks its submenus. Changes are customized for this user; Sync from Role replaces the current selections.
              </div>
            </div>

            <!-- Quick Set Pill Buttons -->
            <div class="d-flex align-items-center gap-2 flex-wrap">
              <span class="text-muted fs-12 fw-medium me-1">Quick set:</span>
              <button
                type="button"
                class="btn btn-sm btn-primary rounded-pill px-3 shadow-none"
                @click="syncRolePermissions(true)"
                :title="'Sync permissions from ' + getRoleLabel(form.role) + ' role'"
              >
                <i class="ri-refresh-line me-1"></i> Sync from Role ({{ getRoleLabel(form.role) }})
              </button>
              <button
                type="button"
                class="btn btn-sm btn-quick-full rounded-pill px-3 shadow-none"
                @click="quickSetFullAccess"
              >
                <i class="ri-shield-check-line me-1"></i> Full access
              </button>
              <button
                type="button"
                class="btn btn-sm btn-quick-view rounded-pill px-3 shadow-none"
                @click="quickSetViewOnly"
              >
                <i class="ri-eye-line me-1"></i> View only
              </button>
              <button
                type="button"
                class="btn btn-sm btn-quick-clear rounded-pill px-3 shadow-none"
                @click="quickSetClearAll"
              >
                <i class="ri-close-circle-line me-1"></i> Clear all
              </button>
            </div>
          </div>

          <!-- Search & Expand Toolbar -->
          <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
            <div class="search-box" style="max-width: 320px; width: 100%;">
              <input
                type="text"
                class="form-control form-control-sm search"
                placeholder="Search modules..."
                v-model="menuSearchQuery"
              />
              <i class="ri-search-line search-icon text-muted"></i>
            </div>
            <div class="d-flex align-items-center gap-2">
              <button
                type="button"
                class="btn btn-sm btn-light border py-1 px-2 fs-12"
                @click="expandAllMenus"
              >
                <i class="ri-expand-up-down-line me-1"></i> Expand all
              </button>
              <button
                type="button"
                class="btn btn-sm btn-light border py-1 px-2 fs-12"
                @click="collapseAllMenus"
              >
                <i class="ri-collapse-diagonal-line me-1"></i> Collapse all
              </button>
              <button
                type="button"
                class="btn btn-sm btn-light border p-1 px-2"
                @click="resetMenuSearch"
                title="Reset module list"
              >
                <i class="ri-refresh-line"></i>
              </button>
            </div>
          </div>

          <!-- Permissions Matrix Table -->
          <div class="table-responsive border rounded matrix-table-container">
            <table class="table table-sm align-middle mb-0 matrix-table">
              <thead class="matrix-thead">
                <tr>
                  <th scope="col" class="ps-3" style="min-width: 250px;">MODULE</th>
                  <th scope="col" class="text-center" style="width: 70px;">
                    <span class="d-block fs-11 text-muted text-uppercase mb-1">ALL</span>
                    <div
                      class="custom-matrix-checkbox mx-auto"
                      :class="{
                        checked: isHeaderAllChecked('all'),
                        indeterminate: isHeaderIndeterminate('all')
                      }"
                      @click="toggleHeaderPermission('all')"
                      title="Toggle ALL permissions for all modules"
                    >
                      <i v-if="isHeaderAllChecked('all')" class="ri-check-line"></i>
                      <i v-else-if="isHeaderIndeterminate('all')" class="ri-subtract-line"></i>
                    </div>
                  </th>
                  <th scope="col" class="text-center" style="width: 70px;">
                    <span class="d-block fs-11 text-muted text-uppercase mb-1">VIEW</span>
                    <div
                      class="custom-matrix-checkbox mx-auto"
                      :class="{
                        checked: isHeaderAllChecked('can_view'),
                        indeterminate: isHeaderIndeterminate('can_view')
                      }"
                      @click="toggleHeaderPermission('can_view')"
                      title="Toggle VIEW for all modules"
                    >
                      <i v-if="isHeaderAllChecked('can_view')" class="ri-check-line"></i>
                      <i v-else-if="isHeaderIndeterminate('can_view')" class="ri-subtract-line"></i>
                    </div>
                  </th>
                  <th scope="col" class="text-center" style="width: 70px;">
                    <span class="d-block fs-11 text-muted text-uppercase mb-1">ADD</span>
                    <div
                      class="custom-matrix-checkbox mx-auto"
                      :class="{
                        checked: isHeaderAllChecked('can_add'),
                        indeterminate: isHeaderIndeterminate('can_add')
                      }"
                      @click="toggleHeaderPermission('can_add')"
                      title="Toggle ADD for all modules"
                    >
                      <i v-if="isHeaderAllChecked('can_add')" class="ri-check-line"></i>
                      <i v-else-if="isHeaderIndeterminate('can_add')" class="ri-subtract-line"></i>
                    </div>
                  </th>
                  <th scope="col" class="text-center" style="width: 70px;">
                    <span class="d-block fs-11 text-muted text-uppercase mb-1">EDIT</span>
                    <div
                      class="custom-matrix-checkbox mx-auto"
                      :class="{
                        checked: isHeaderAllChecked('can_edit'),
                        indeterminate: isHeaderIndeterminate('can_edit')
                      }"
                      @click="toggleHeaderPermission('can_edit')"
                      title="Toggle EDIT for all modules"
                    >
                      <i v-if="isHeaderAllChecked('can_edit')" class="ri-check-line"></i>
                      <i v-else-if="isHeaderIndeterminate('can_edit')" class="ri-subtract-line"></i>
                    </div>
                  </th>
                  <th scope="col" class="text-center" style="width: 70px;">
                    <span class="d-block fs-11 text-muted text-uppercase mb-1">DELETE</span>
                    <div
                      class="custom-matrix-checkbox mx-auto"
                      :class="{
                        checked: isHeaderAllChecked('can_delete'),
                        indeterminate: isHeaderIndeterminate('can_delete')
                      }"
                      @click="toggleHeaderPermission('can_delete')"
                      title="Toggle DELETE for all modules"
                    >
                      <i v-if="isHeaderAllChecked('can_delete')" class="ri-check-line"></i>
                      <i v-else-if="isHeaderIndeterminate('can_delete')" class="ri-subtract-line"></i>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <template v-for="node in filteredMenuTree" :key="node.id || node.menu_id">
                  <!-- Parent / Root Menu Row -->
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

                    <!-- ALL Checkbox -->
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

                    <!-- VIEW Checkbox -->
                    <td class="text-center py-2">
                      <div
                        class="custom-matrix-checkbox mx-auto"
                        :class="{ checked: getMenuPerm(node, 'can_view') }"
                        @click="togglePermission(node, 'can_view')"
                      >
                        <i v-if="getMenuPerm(node, 'can_view')" class="ri-check-line"></i>
                      </div>
                    </td>

                    <!-- ADD Checkbox -->
                    <td class="text-center py-2">
                      <div
                        class="custom-matrix-checkbox mx-auto"
                        :class="{ checked: getMenuPerm(node, 'can_add') }"
                        @click="togglePermission(node, 'can_add')"
                      >
                        <i v-if="getMenuPerm(node, 'can_add')" class="ri-check-line"></i>
                      </div>
                    </td>

                    <!-- EDIT Checkbox -->
                    <td class="text-center py-2">
                      <div
                        class="custom-matrix-checkbox mx-auto"
                        :class="{ checked: getMenuPerm(node, 'can_edit') }"
                        @click="togglePermission(node, 'can_edit')"
                      >
                        <i v-if="getMenuPerm(node, 'can_edit')" class="ri-check-line"></i>
                      </div>
                    </td>

                    <!-- DELETE Checkbox -->
                    <td class="text-center py-2">
                      <div
                        class="custom-matrix-checkbox mx-auto"
                        :class="{ checked: getMenuPerm(node, 'can_delete') }"
                        @click="togglePermission(node, 'can_delete')"
                      >
                        <i v-if="getMenuPerm(node, 'can_delete')" class="ri-check-line"></i>
                      </div>
                    </td>
                  </tr>

                  <!-- Children / Submenus Rows -->
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

                        <!-- Child VIEW -->
                        <td class="text-center py-2">
                          <div
                            class="custom-matrix-checkbox mx-auto"
                            :class="{ checked: getMenuPerm(sub, 'can_view') }"
                            @click="togglePermission(sub, 'can_view')"
                          >
                            <i v-if="getMenuPerm(sub, 'can_view')" class="ri-check-line"></i>
                          </div>
                        </td>

                        <!-- Child ADD -->
                        <td class="text-center py-2">
                          <div
                            class="custom-matrix-checkbox mx-auto"
                            :class="{ checked: getMenuPerm(sub, 'can_add') }"
                            @click="togglePermission(sub, 'can_add')"
                          >
                            <i v-if="getMenuPerm(sub, 'can_add')" class="ri-check-line"></i>
                          </div>
                        </td>

                        <!-- Child EDIT -->
                        <td class="text-center py-2">
                          <div
                            class="custom-matrix-checkbox mx-auto"
                            :class="{ checked: getMenuPerm(sub, 'can_edit') }"
                            @click="togglePermission(sub, 'can_edit')"
                          >
                            <i v-if="getMenuPerm(sub, 'can_edit')" class="ri-check-line"></i>
                          </div>
                        </td>

                        <!-- Child DELETE -->
                        <td class="text-center py-2">
                          <div
                            class="custom-matrix-checkbox mx-auto"
                            :class="{ checked: getMenuPerm(sub, 'can_delete') }"
                            @click="togglePermission(sub, 'can_delete')"
                          >
                            <i v-if="getMenuPerm(sub, 'can_delete')" class="ri-check-line"></i>
                          </div>
                        </td>
                      </tr>

                      <!-- Grandchildren / Level 3 Rows -->
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

                          <!-- GrandChild ALL -->
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

                          <!-- GrandChild VIEW -->
                          <td class="text-center py-2">
                            <div
                              class="custom-matrix-checkbox mx-auto"
                              :class="{ checked: getMenuPerm(gc, 'can_view') }"
                              @click="togglePermission(gc, 'can_view')"
                            >
                              <i v-if="getMenuPerm(gc, 'can_view')" class="ri-check-line"></i>
                            </div>
                          </td>

                          <!-- GrandChild ADD -->
                          <td class="text-center py-2">
                            <div
                              class="custom-matrix-checkbox mx-auto"
                              :class="{ checked: getMenuPerm(gc, 'can_add') }"
                              @click="togglePermission(gc, 'can_add')"
                            >
                              <i v-if="getMenuPerm(gc, 'can_add')" class="ri-check-line"></i>
                            </div>
                          </td>

                          <!-- GrandChild EDIT -->
                          <td class="text-center py-2">
                            <div
                              class="custom-matrix-checkbox mx-auto"
                              :class="{ checked: getMenuPerm(gc, 'can_edit') }"
                              @click="togglePermission(gc, 'can_edit')"
                            >
                              <i v-if="getMenuPerm(gc, 'can_edit')" class="ri-check-line"></i>
                            </div>
                          </td>

                          <!-- GrandChild DELETE -->
                          <td class="text-center py-2">
                            <div
                              class="custom-matrix-checkbox mx-auto"
                              :class="{ checked: getMenuPerm(gc, 'can_delete') }"
                              @click="togglePermission(gc, 'can_delete')"
                            >
                              <i v-if="getMenuPerm(gc, 'can_delete')" class="ri-check-line"></i>
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
        </div>

        <!-- Tab 3: Companies Assignment -->
          <div v-show="activeTab === 'companies'">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="fs-12 text-muted">Select companies to assign this user. Designate one as Default:</span>
            <div class="d-flex align-items-center gap-3">
              <label class="form-check form-check-sm mb-0 cursor-pointer">
                <input
                  class="form-check-input"
                  type="checkbox"
                  :checked="areAllEntitiesSelected('company', lookups.companies)"
                  :disabled="lookups.companies.length === 0"
                  @change="toggleAllEntitySelections('company', lookups.companies)"
                />
                <span class="form-check-label fs-12 fw-medium">Check all</span>
              </label>
              <span class="badge bg-primary-subtle text-primary">{{ selectedCompanies.length }} Selected</span>
            </div>
          </div>

          <div class="entity-assignment-list p-2 rounded border">
            <div v-if="lookups.companies.length === 0" class="text-muted text-center py-3 fs-13">
              No active companies found.
            </div>
            <div
              v-for="co in lookups.companies"
              :key="co.code"
              class="d-flex align-items-center justify-content-between p-2 rounded entity-item mb-1"
              :class="{ 'entity-selected': isEntitySelected('company', co.code) }"
            >
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  :id="'co_' + co.code"
                  :checked="isEntitySelected('company', co.code)"
                  @change="toggleEntitySelection('company', co.code)"
                />
                <label class="form-check-label fw-medium fs-13 ms-1 cursor-pointer" :for="'co_' + co.code">
                  <span class="badge bg-primary-subtle text-primary font-monospace me-2">{{ co.code }}</span>
                  <span>{{ co.name }}</span>
                </label>
              </div>

              <!-- Default Selector -->
              <div v-if="isEntitySelected('company', co.code)" class="d-flex align-items-center gap-1">
                <button
                  type="button"
                  class="btn btn-xs rounded-pill"
                  :class="isEntityDefault('company', co.code) ? 'btn-warning text-dark fw-bold' : 'btn-outline-secondary'"
                  @click="setEntityDefault('company', co.code)"
                  title="Set as Default Company"
                >
                  <i class="ri-star-fill me-1" v-if="isEntityDefault('company', co.code)"></i>
                  <span>{{ isEntityDefault('company', co.code) ? 'Default' : 'Make Default' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 4: Departments Assignment -->
        <div v-show="activeTab === 'departments'">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="fs-12 text-muted">Select departments to assign this user. Designate one as Default:</span>
            <span class="badge bg-info-subtle text-info">{{ selectedDepartments.length }} Selected</span>
          </div>

          <div class="entity-assignment-list p-2 rounded border">
            <div v-if="lookups.departments.length === 0" class="text-muted text-center py-3 fs-13">
              No active departments found.
            </div>
            <div
              v-for="dep in lookups.departments"
              :key="dep.code"
              class="d-flex align-items-center justify-content-between p-2 rounded entity-item mb-1"
              :class="{ 'entity-selected': isEntitySelected('department', dep.code) }"
            >
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  :id="'dep_' + dep.code"
                  :checked="isEntitySelected('department', dep.code)"
                  @change="toggleEntitySelection('department', dep.code)"
                />
                <label class="form-check-label fw-medium fs-13 ms-1 cursor-pointer" :for="'dep_' + dep.code">
                  <span class="badge bg-info-subtle text-info font-monospace me-2">{{ dep.code }}</span>
                  <span>{{ dep.name }}</span>
                </label>
              </div>

              <!-- Default Selector -->
              <div v-if="isEntitySelected('department', dep.code)" class="d-flex align-items-center gap-1">
                <button
                  type="button"
                  class="btn btn-xs rounded-pill"
                  :class="isEntityDefault('department', dep.code) ? 'btn-warning text-dark fw-bold' : 'btn-outline-secondary'"
                  @click="setEntityDefault('department', dep.code)"
                  title="Set as Default Department"
                >
                  <i class="ri-star-fill me-1" v-if="isEntityDefault('department', dep.code)"></i>
                  <span>{{ isEntityDefault('department', dep.code) ? 'Default' : 'Make Default' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 5: Categories Assignment -->
        <div v-show="activeTab === 'categories'">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="fs-12 text-muted">Select categories to assign this user.</span>
            <div class="d-flex align-items-center gap-3">
              <label class="form-check form-check-sm mb-0 cursor-pointer">
                <input
                  class="form-check-input"
                  type="checkbox"
                  :checked="areAllEntitiesSelected('category', lookups.boards)"
                  :disabled="lookups.boards.length === 0"
                  @change="toggleAllEntitySelections('category', lookups.boards)"
                />
                <span class="form-check-label fs-12 fw-medium">Check all</span>
              </label>
              <span class="badge bg-primary-subtle text-primary">{{ selectedCategories.length }} Selected</span>
            </div>
          </div>

          <div class="entity-assignment-list p-2 rounded border">
            <div v-if="lookups.boards.length === 0" class="text-muted text-center py-3 fs-13">
              No active categories found.
            </div>
            <div
              v-for="category in lookups.boards"
              :key="category.id"
              class="d-flex align-items-center justify-content-between p-2 rounded entity-item mb-1"
              :class="{ 'entity-selected': isEntitySelected('category', String(category.id)) }"
            >
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  :id="'category_' + category.id"
                  :checked="isEntitySelected('category', String(category.id))"
                  @change="toggleEntitySelection('category', String(category.id))"
                />
                <label class="form-check-label fw-medium fs-13 ms-1 cursor-pointer" :for="'category_' + category.id">
                  <span class="badge bg-primary-subtle text-primary font-monospace me-2">#{{ category.id }}</span>
                  <span>{{ category.name }}</span>
                </label>
              </div>

              <div v-if="isEntitySelected('category', String(category.id))" class="d-flex align-items-center gap-1">
                <button
                  type="button"
                  class="btn btn-xs rounded-pill"
                  :class="isEntityDefault('category', String(category.id)) ? 'btn-warning text-dark fw-bold' : 'btn-outline-secondary'"
                  @click="setEntityDefault('category', String(category.id))"
                  title="Set as Default Category"
                >
                  <i class="ri-star-fill me-1" v-if="isEntityDefault('category', String(category.id))"></i>
                  <span>{{ isEntityDefault('category', String(category.id)) ? 'Default' : 'Make Default' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 6: Stations Assignment -->
        <div v-show="activeTab === 'stations'">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="fs-12 text-muted">Select stations to assign this user. Designate one as Default:</span>
            <span class="badge bg-secondary-subtle text-secondary">{{ selectedStations.length }} Selected</span>
          </div>

          <div class="entity-assignment-list p-2 rounded border">
            <div v-if="lookups.stations.length === 0" class="text-muted text-center py-3 fs-13">
              No active stations found.
            </div>
            <div
              v-for="stn in lookups.stations"
              :key="stn.code"
              class="d-flex align-items-center justify-content-between p-2 rounded entity-item mb-1"
              :class="{ 'entity-selected': isEntitySelected('station', stn.code) }"
            >
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  :id="'stn_' + stn.code"
                  :checked="isEntitySelected('station', stn.code)"
                  @change="toggleEntitySelection('station', stn.code)"
                />
                <label class="form-check-label fw-medium fs-13 ms-1 cursor-pointer" :for="'stn_' + stn.code">
                  <span class="badge bg-secondary-subtle text-secondary font-monospace me-2">{{ stn.code }}</span>
                  <span>{{ stn.name }}</span>
                </label>
              </div>

              <!-- Default Selector -->
              <div v-if="isEntitySelected('station', stn.code)" class="d-flex align-items-center gap-1">
                <button
                  type="button"
                  class="btn btn-xs rounded-pill"
                  :class="isEntityDefault('station', stn.code) ? 'btn-warning text-dark fw-bold' : 'btn-outline-secondary'"
                  @click="setEntityDefault('station', stn.code)"
                  title="Set as Default Station"
                >
                  <i class="ri-star-fill me-1" v-if="isEntityDefault('station', stn.code)"></i>
                  <span>{{ isEntityDefault('station', stn.code) ? 'Default' : 'Make Default' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 7: Systems Assignment -->
        <div v-show="activeTab === 'systems'">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="fs-12 text-muted">Select systems to assign this user. Designate one as Default:</span>
            <div class="d-flex align-items-center gap-3">
              <label class="form-check form-check-sm mb-0 cursor-pointer">
                <input
                  class="form-check-input"
                  type="checkbox"
                  :checked="areAllEntitiesSelected('system', lookups.systems)"
                  :disabled="lookups.systems.length === 0"
                  @change="toggleAllEntitySelections('system', lookups.systems)"
                />
                <span class="form-check-label fs-12 fw-medium">Check all</span>
              </label>
              <span class="badge badge-system-regular px-2 py-1">{{ selectedSystems.length }} Selected</span>
            </div>
          </div>

          <div class="entity-assignment-list p-2 rounded border">
            <div v-if="lookups.systems.length === 0" class="text-muted text-center py-3 fs-13">
              No active systems found.
            </div>
            <div
              v-for="sys in lookups.systems"
              :key="sys.code"
              class="d-flex align-items-center justify-content-between p-2 rounded entity-item mb-1"
              :class="{ 'entity-selected': isEntitySelected('system', sys.code) }"
            >
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  :id="'sys_' + sys.code"
                  :checked="isEntitySelected('system', sys.code)"
                  @change="toggleEntitySelection('system', sys.code)"
                />
                <label class="form-check-label fw-medium fs-13 ms-1 cursor-pointer" :for="'sys_' + sys.code">
                  <span class="badge badge-system-regular font-monospace me-2">{{ sys.code }}</span>
                  <span>{{ sys.name }}</span>
                </label>
              </div>

              <!-- Default Selector -->
              <div v-if="isEntitySelected('system', sys.code)" class="d-flex align-items-center gap-1">
                <button
                  type="button"
                  class="btn btn-xs rounded-pill"
                  :class="isEntityDefault('system', sys.code) ? 'btn-warning text-dark fw-bold' : 'btn-outline-secondary'"
                  @click="setEntityDefault('system', sys.code)"
                  title="Set as Default System"
                >
                  <i class="ri-star-fill me-1" v-if="isEntityDefault('system', sys.code)"></i>
                  <span>{{ isEntityDefault('system', sys.code) ? 'Default' : 'Make Default' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Live Preview Summary Bar -->
        <div class="mt-4 p-3 rounded border preview-box">
          <label class="form-label fw-semibold fs-11 text-uppercase text-muted mb-2">
            Live Configuration Summary
          </label>
          <div class="d-flex flex-wrap gap-2 align-items-center">
            <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 fs-11">
              Role: {{ getRoleLabel(form.role) }}
            </span>
            <span class="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1 fs-11">
              <i class="ri-shield-keyhole-line me-1"></i> Modules: {{ accessibleMenuCount }}/{{ totalMenuCount }}
            </span>
            <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 fs-11">
              Companies: {{ selectedCompanies.length }}
            </span>
            <span class="badge bg-info-subtle text-info border border-info-subtle px-2 py-1 fs-11">
              Departments: {{ selectedDepartments.length }}
            </span>
            <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 fs-11">
              Categories: {{ selectedCategories.length }}
            </span>
            <span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-1 fs-11">
              Stations: {{ selectedStations.length }}
            </span>
            <span class="badge badge-system-regular border px-2 py-1 fs-11">
              Systems: {{ selectedSystems.length }}
            </span>
          </div>
        </div>

        <!-- Actions -->
        <div class="d-flex align-items-center justify-content-end gap-2 pt-3 border-top mt-3">
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
            <span>{{ editingId ? 'Save Changes' : 'Create User' }}</span>
          </button>
        </div>
      </form>
    </BModal>
    </div>
  </Layout>
</template>

<script>
import { CountTo } from "vue3-count-to";
import Layout from "@/layouts/main.vue";
import PageHeader from "@/components/page-header";
import Swal from "sweetalert2";
import axios from "axios";
import { AgGridVue } from "@/helpers/agGrid";

export default {
  name: "UserSettings",
  components: {
    Layout,
    PageHeader,
    CountTo,
    AgGridVue,
  },
  data() {
    return {
      hasPermission: true,
      loading: false,
      submitting: false,
      users: [],
      stats: {
        total: 0,
        active: 0,
        inactive: 0,
        assigned: 0,
        admin: 0,
        users: 0,
      },
      lookups: {
        companies: [],
        departments: [],
        boards: [],
        stations: [],
        systems: [],
        roles: ["admin", "users"],
        permissions: ["view", "add", "edit", "delete"],
        menus: [],
        menu_tree: [],
      },
      searchQuery: "",
      statusFilter: "all",
      roleFilter: "all",
      modalShow: false,
      editingId: null,
      activeTab: "account",
      form: {
        name: "",
        email: "",
        username: "",
        password: "",
        status: "active",
        role: "users",
      },
      userAssignments: [], // Array of { reference, reference_code, default }
      userMenuAccess: {}, // Map of menuId => { menu_id, can_view, can_add, can_edit, can_delete }
      menuSearchQuery: "",
      expandedMenuIds: [],
      formError: "",
      formErrors: {},
      usersGridApi: null,
    };
  },
  computed: {
    apiBase() {
      return process.env.VUE_APP_AUTHDOMAIN || "http://localhost:8001/api";
    },

    availableRoles() {
      if (this.lookups.roles && this.lookups.roles.length > 0) {
        return this.lookups.roles;
      }
      return [
        { role_id: 1, name: "admin", label: "Administrator (Full Access)" },
        { role_id: 4, name: "users", label: "Standard User" },
      ];
    },

    filterableRoles() {
      return (this.availableRoles || []).filter((r) => r && r.name);
    },

    totalMenuCount() {
      return (this.lookups.menus || []).length;
    },

    accessibleMenuCount() {
      const keys = Object.keys(this.userMenuAccess);
      return keys.filter((k) => Boolean(this.userMenuAccess[k]?.can_view)).length;
    },

    selectedCompanies() {
      return this.userAssignments.filter((a) => a.reference === "company");
    },

    selectedDepartments() {
      return this.userAssignments.filter((a) => a.reference === "department");
    },

    selectedCategories() {
      return this.userAssignments.filter((a) => a.reference === "category");
    },

    selectedStations() {
      return this.userAssignments.filter((a) => a.reference === "station");
    },

    selectedSystems() {
      return this.userAssignments.filter((a) => a.reference === "system");
    },

    filteredUsers() {
      let result = this.users;

      // Status filter
      if (this.statusFilter !== "all") {
        result = result.filter((u) => u.status === this.statusFilter);
      }

      // Role filter
      if (this.roleFilter !== "all") {
        result = result.filter((u) => (u.role || "users") === this.roleFilter);
      }

      // Search query
      if (this.searchQuery && this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase().trim();
        result = result.filter((u) => {
          return (
            (u.name && u.name.toLowerCase().includes(q)) ||
            (u.fullname && u.fullname.toLowerCase().includes(q)) ||
            (u.email && u.email.toLowerCase().includes(q)) ||
            (u.username && u.username.toLowerCase().includes(q))
          );
        });
      }

      return result;
    },

    userGridRows() {
      return this.filteredUsers.map((user) => ({
        ...user,
        display_name: user.fullname || user.name || "Unnamed user",
        display_role: user.role || "users",
        display_status: user.status || "inactive",
        menu_access_label: `${this.getUserAccessibleCount(user)}/${this.totalMenuCount} Modules`,
        companies_label: this.getAssignmentLabel(user, "company"),
        departments_label: this.getAssignmentLabel(user, "department"),
        stations_label: this.getAssignmentLabel(user, "station"),
        systems_label: this.getAssignmentLabel(user, "system"),
        categories_label: this.getAssignmentLabel(user, "category"),
      }));
    },

    userGridDefaultColDef() {
      return {
        sortable: true,
        resizable: true,
        filter: true,
        minWidth: 120,
      };
    },

    userColumnDefs() {
      return [
        {
          headerName: "User",
          field: "display_name",
          pinned: "left",
          lockPinned: true,
          headerClass: "users-grid-pinned-header",
          cellClass: "users-grid-pinned-cell",
          headerStyle: { backgroundColor: "var(--users-grid-pinned-bg, #ffffff)" },
          cellStyle: { backgroundColor: "var(--users-grid-pinned-bg, #ffffff)" },
          width: 270,
          minWidth: 230,
          cellRenderer: (params) => this.renderUserGridIdentity(params),
          tooltip: (params) => params.data?.email || "",
        },
        {
          headerName: "Role",
          field: "display_role",
          width: 130,
          cellRenderer: (params) => this.renderUserGridBadge(params, "role"),
        },
        {
          headerName: "Status",
          field: "display_status",
          width: 130,
          cellRenderer: (params) => this.renderUserGridBadge(params, "status"),
        },
        {
          headerName: "Menu Access",
          field: "menu_access_label",
          minWidth: 155,
          cellRenderer: (params) => this.renderMenuAccessButton(params),
        },
        { headerName: "Assigned Companies", field: "companies_label", minWidth: 190, cellRenderer: (params) => this.renderAssignmentCell(params, "company"), tooltip: (params) => params.value || "None" },
        { headerName: "Assigned Departments", field: "departments_label", minWidth: 200, cellRenderer: (params) => this.renderAssignmentCell(params, "department"), tooltip: (params) => params.value || "None" },
        { headerName: "Assigned Stations", field: "stations_label", minWidth: 180, cellRenderer: (params) => this.renderAssignmentCell(params, "station"), tooltip: (params) => params.value || "None" },
        { headerName: "Assigned Systems", field: "systems_label", minWidth: 180, cellRenderer: (params) => this.renderAssignmentCell(params, "system"), tooltip: (params) => params.value || "None" },
        { headerName: "Assigned Categories", field: "categories_label", minWidth: 190, cellRenderer: (params) => this.renderAssignmentCell(params, "category"), tooltip: (params) => params.value || "None" },
        {
          headerName: "Actions",
          field: "id",
          pinned: "right",
          lockPinned: true,
          headerClass: "users-grid-pinned-header",
          cellClass: "users-grid-pinned-cell",
          headerStyle: { backgroundColor: "var(--users-grid-pinned-bg, #ffffff)" },
          cellStyle: { backgroundColor: "var(--users-grid-pinned-bg, #ffffff)" },
          width: 166,
          minWidth: 166,
          maxWidth: 166,
          sortable: false,
          filter: false,
          cellRenderer: (params) => this.renderUserGridActions(params),
        },
      ];
    },

    filteredMenuTree() {
      const tree = this.lookups.menu_tree || [];
      if (!this.menuSearchQuery || !this.menuSearchQuery.trim()) {
        return tree;
      }

      const q = this.menuSearchQuery.toLowerCase().trim();

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
    // Component-level permission guard
    const rawUser = sessionStorage.getItem("authUser") || localStorage.getItem("user");
    if (rawUser) {
      try {
        const u = JSON.parse(rawUser);
        if (u.role !== "admin") {
          const rawPerms = sessionStorage.getItem("user_menu_permissions");
          if (rawPerms) {
            const perms = JSON.parse(rawPerms);
            const userMenu = perms.find(
              (m) =>
                m.code === "user-settings" ||
                (m.url && m.url.toLowerCase().includes("/settings/users"))
            );
            if (userMenu && !userMenu.can_view) {
              this.hasPermission = false;
              this.$nextTick(() => {
                this.$router.replace({
                  path: "/auth/403",
                  query: { redirectFrom: "/settings/users" },
                });
              });
              return;
            }
          }
        }
      } catch (e) {
        console.warn("Failed to check user permissions in mounted:", e);
      }
    }

    this.fetchLookups();
    this.fetchUsers();
  },
  methods: {
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

    getAuthHeaders() {
      const token = localStorage.getItem("jwt") || localStorage.getItem("token");
      return token ? { Authorization: `Bearer ${token}` } : {};
    },

    resetFilters() {
      this.searchQuery = "";
      this.statusFilter = "all";
      this.roleFilter = "all";
    },

    getInitials(name) {
      if (!name) return "U";
      const parts = name.trim().split(" ");
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    },

    getAssignmentsByRef(user, ref) {
      if (!user || !user.assignments) return [];
      return user.assignments.filter((a) => a.reference === ref);
    },

    getAssignmentLabel(user, ref) {
      const assignments = this.getAssignmentsByRef(user, ref);
      if (!assignments.length) return "None";
      return assignments
        .map((item) => {
          const label = ref === "category"
            ? this.getCategoryName(item.reference_code)
            : item.reference_code;
          return `${item.default ? "★ " : ""}${label}`;
        })
        .join(", ");
    },

    makeGridButton(iconClass, title, className, handler, disabled = false) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = className;
      button.title = title;
      button.disabled = disabled;
      const icon = document.createElement("i");
      icon.className = iconClass;
      button.appendChild(icon);
      if (!disabled) {
        button.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          handler();
        });
      }
      return button;
    },

    renderUserGridIdentity(params) {
      const user = params.data || {};
      const root = document.createElement("div");
      root.className = "users-grid-identity";
      const avatar = document.createElement("span");
      avatar.className = "users-grid-avatar";
      avatar.textContent = this.getInitials(user.display_name);
      const details = document.createElement("div");
      details.className = "users-grid-details";
      const name = document.createElement("span");
      name.className = "users-grid-name";
      name.textContent = user.display_name;
      const meta = document.createElement("span");
      meta.className = "users-grid-meta";
      meta.textContent = user.username ? `${user.email || ""}  @${user.username}` : (user.email || "—");
      details.append(name, meta);
      root.append(avatar, details);
      return root;
    },

    renderUserGridBadge(params, type) {
      const badge = document.createElement("span");
      const value = String(params.value || "");
      const isActive = value === "active";
      const isAdmin = value === "admin";
      badge.className = `users-grid-badge ${type === "status"
        ? (isActive ? "is-active" : "is-inactive")
        : (isAdmin ? "is-admin" : "is-user")}`;
      badge.textContent = value || "—";
      return badge;
    },

    renderMenuAccessButton(params) {
      const user = params.data;
      const button = document.createElement("button");
      button.type = "button";
      button.className = `users-grid-access ${this.getUserAccessibleCount(user) > 0 ? "has-access" : ""}`;
      button.title = "Configure Menu Access & Permissions";
      const icon = document.createElement("i");
      icon.className = "ri-shield-keyhole-line";
      const label = document.createElement("span");
      label.textContent = params.value;
      button.append(icon, label);
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.openPermissionsTabForUser(user);
      });
      return button;
    },

    renderAssignmentCell(params, ref) {
      const assignments = this.getAssignmentsByRef(params.data, ref);
      const root = document.createElement("div");
      root.className = "users-grid-assignments";
      if (!assignments.length) {
        root.classList.add("is-empty");
        root.textContent = "None";
        return root;
      }

      assignments.slice(0, 2).forEach((item) => {
        const chip = document.createElement("span");
        chip.className = `users-grid-assignment-chip ${item.default ? "is-default" : ""}`;
        const label = ref === "category"
          ? this.getCategoryName(item.reference_code)
          : item.reference_code;
        chip.textContent = `${item.default ? "★ " : ""}${label}`;
        root.appendChild(chip);
      });
      if (assignments.length > 2) {
        const more = document.createElement("span");
        more.className = "users-grid-assignment-more";
        more.textContent = `+${assignments.length - 2}`;
        root.appendChild(more);
      }
      return root;
    },

    renderUserGridActions(params) {
      const user = params.data;
      const root = document.createElement("div");
      root.className = "users-grid-actions";
      root.append(
        this.makeGridButton("ri-shield-keyhole-line", "Menu Access & Permissions Matrix", "btn btn-sm btn-icon btn-outline-warning users-grid-action-perms", () => this.openPermissionsTabForUser(user)),
        this.makeGridButton("ri-file-copy-line", "Clone User Access & Assignments", "btn btn-sm btn-icon btn-outline-secondary users-grid-action-clone", () => this.cloneUser(user)),
        this.makeGridButton("ri-pencil-line", "Edit User & Assignments", "btn btn-sm btn-icon btn-outline-primary users-grid-action-edit", () => this.openEditModal(user)),
        this.makeGridButton("ri-delete-bin-line", user.id === 1 ? "Primary Admin cannot be deleted" : "Delete User", "btn btn-sm btn-icon btn-outline-danger users-grid-action-delete", () => this.confirmDelete(user), user.id === 1)
      );
      return root;
    },

    onUsersGridReady(params) {
      this.usersGridApi = params.api;
    },

    getCategoryName(categoryId) {
      const category = (this.lookups.boards || []).find(
        (item) => String(item.id) === String(categoryId)
      );
      return category ? category.name : `Category #${categoryId}`;
    },

    getUserAccessibleCount(user) {
      if (!user) return 0;
      if (user.role === "admin") {
        return this.totalMenuCount || 0;
      }
      if (!user.menu_access && !user.menuAccess) return 0;
      const accesses = user.menu_access || user.menuAccess || [];
      return accesses.filter((a) => Boolean(a.can_view)).length;
    },

    async fetchLookups() {
      try {
        const response = await axios.get(`${this.apiBase}/users/lookups`, {
          headers: this.getAuthHeaders(),
        });
        const rawMenus = response.data.menus || [];
        const normalizedMenus = rawMenus.map((m) => {
          const id = this.getMenuId(m);
          return {
            ...m,
            id,
            menu_id: id,
          };
        });
        const rawRoleList = response.data.role_list || response.data.roles || [];
        const normalizedRoles = rawRoleList.map((r) => {
          if (typeof r === "string") {
            const name = r.toLowerCase();
            let label = name;
            if (name === "admin") label = "Administrator (Full Access)";
            else if (name === "users") label = "Standard User";
            else label = name.charAt(0).toUpperCase() + name.slice(1);
            return {
              role_id: name,
              name: name,
              label: label,
            };
          }
          const name = (r.name || "").toLowerCase();
          let label = r.name;
          if (name === "admin") {
            label = "Administrator (Full Access)";
          } else if (name === "users") {
            label = "Standard User";
          } else {
            label = name.charAt(0).toUpperCase() + name.slice(1) + (r.description ? ` (${r.description})` : "");
          }
          return {
            role_id: r.role_id,
            name: name,
            label: label,
            description: r.description,
          };
        });

        this.lookups = {
          companies: response.data.companies || [],
          departments: response.data.departments || [],
          boards: response.data.boards || [],
          stations: response.data.stations || [],
          systems: response.data.systems || [],
          roles: normalizedRoles,
          permissions: response.data.permissions || ["view", "add", "edit", "delete"],
          menus: normalizedMenus,
          menu_tree: this.normalizeMenuTree(response.data.menu_tree || []),
        };
        // By default expand all root menus
        this.expandAllMenus();
      } catch (err) {
        console.error("Failed to load user lookups:", err);
      }
    },

    async fetchUsers() {
      this.loading = true;
      try {
        const response = await axios.get(`${this.apiBase}/users`, {
          headers: this.getAuthHeaders(),
        });
        this.users = response.data.data || [];
        if (response.data.stats) {
          this.stats = {
            ...response.data.stats,
            total: response.data.stats.total || 0,
            active: response.data.stats.active || 0,
            inactive: response.data.stats.inactive || 0,
            assigned: response.data.stats.assigned || 0,
            admin: response.data.stats.admin || 0,
            users: response.data.stats.users || 0,
          };
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
        if (err.response?.status === 403) {
          this.hasPermission = false;
          this.$nextTick(() => {
            this.$router.replace({
              path: "/auth/403",
              query: { redirectFrom: "/settings/users" },
            });
          });
          return;
        }
        Swal.fire({
          icon: "error",
          title: "Network Error",
          text: err.response?.data?.message || "Failed to load users from server.",
          toast: true,
          position: "top-end",
          timer: 3500,
          showConfirmButton: false,
        });
      } finally {
        this.loading = false;
      }
    },

    /* =========================================================================
       Entity Assignments (Companies, Departments, Stations, Systems)
       ========================================================================= */
    isEntitySelected(reference, code) {
      return this.userAssignments.some(
        (a) => a.reference === reference && a.reference_code === code
      );
    },

    isEntityDefault(reference, code) {
      const match = this.userAssignments.find(
        (a) => a.reference === reference && a.reference_code === code
      );
      return match ? Boolean(match.default) : false;
    },

    areAllEntitiesSelected(reference, entities = []) {
      return entities.length > 0 && entities.every((entity) => {
        const code = String(entity.code ?? entity.id);
        return this.isEntitySelected(reference, code);
      });
    },

    toggleAllEntitySelections(reference, entities = []) {
      const codes = entities.map((entity) => String(entity.code ?? entity.id));
      if (!codes.length) return;

      if (this.areAllEntitiesSelected(reference, entities)) {
        this.userAssignments = this.userAssignments.filter((item) => item.reference !== reference);
        return;
      }

      const existingDefault = this.userAssignments.find(
        (item) => item.reference === reference && item.default
      )?.reference_code;
      const selected = this.userAssignments.filter((item) => item.reference === reference);
      const selectedCodes = new Set(selected.map((item) => item.reference_code));
      codes.forEach((code) => {
        if (!selectedCodes.has(code)) {
          selected.push({ reference, reference_code: code, default: false });
        }
      });
      const defaultCode = existingDefault || selected[0]?.reference_code;
      selected.forEach((item) => { item.default = item.reference_code === defaultCode; });
      this.userAssignments = [
        ...this.userAssignments.filter((item) => item.reference !== reference),
        ...selected,
      ];
    },

    toggleEntitySelection(reference, code) {
      const idx = this.userAssignments.findIndex(
        (a) => a.reference === reference && a.reference_code === code
      );
      if (idx !== -1) {
        this.userAssignments.splice(idx, 1);
      } else {
        const currentRefItems = this.userAssignments.filter((a) => a.reference === reference);
        const isDefault = currentRefItems.length === 0;
        this.userAssignments.push({
          reference,
          reference_code: code,
          default: isDefault,
        });
      }
    },

    setEntityDefault(reference, code) {
      this.userAssignments.forEach((a) => {
        if (a.reference === reference) {
          a.default = a.reference_code === code;
        }
      });
    },

    /* =========================================================================
       Menu Access & Permissions (Matching Screenshot)
       ========================================================================= */
    initUserMenuAccess(existingAccess = []) {
      const map = {};
      const menus = this.lookups.menus || [];
      const accessByMenuId = {};

      (existingAccess || []).forEach((acc) => {
        const id = this.getMenuId(acc);
        if (id) {
          accessByMenuId[id] = acc;
        }
      });

      const isAdmin = this.form.role === "admin";

      menus.forEach((m) => {
        const id = this.getMenuId(m);
        if (!id) return;
        const found = accessByMenuId[id];
        map[id] = {
          menu_id: id,
          can_view: found ? Boolean(found.can_view) : isAdmin,
          can_add: found ? Boolean(found.can_add) : isAdmin,
          can_edit: found ? Boolean(found.can_edit) : isAdmin,
          can_delete: found ? Boolean(found.can_delete) : isAdmin,
        };
      });

      this.userMenuAccess = map;
    },

    getMenuPerm(menuOrId, perm) {
      const id = this.getMenuId(menuOrId);
      if (!id) return false;
      return Boolean(this.userMenuAccess[id]?.[perm]);
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
      const ids = (this.lookups.menus || []).map((m) => this.getMenuId(m)).filter(Boolean);
      this.expandedMenuIds = [...ids];
    },

    collapseAllMenus() {
      this.expandedMenuIds = [];
    },

    resetMenuSearch() {
      this.menuSearchQuery = "";
      this.expandAllMenus();
    },

    isNeedsView(menu) {
      const id = this.getMenuId(menu);
      if (!id) return false;
      const m = this.userMenuAccess[id];
      if (!m) return false;
      const hasWrite = m.can_add || m.can_edit || m.can_delete;
      return hasWrite && !m.can_view;
    },

    // Row ALL Checkbox logic
    isRowAllChecked(menu) {
      const id = this.getMenuId(menu);
      if (!id) return false;
      const m = this.userMenuAccess[id];
      if (!m) return false;
      const isSelfAll = Boolean(m.can_view && m.can_add && m.can_edit && m.can_delete);
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
      const m = this.userMenuAccess[id];
      const hasAnySelf = m && Boolean(m.can_view || m.can_add || m.can_edit || m.can_delete);
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
      const updated = { ...this.userMenuAccess };

      const applyToNode = (node) => {
        const id = this.getMenuId(node);
        if (!id) return;
        if (!updated[id]) {
          updated[id] = { menu_id: id };
        }
        updated[id].can_view = nextVal;
        updated[id].can_add = nextVal;
        updated[id].can_edit = nextVal;
        updated[id].can_delete = nextVal;

        if (node.children && node.children.length > 0) {
          node.children.forEach(applyToNode);
        }
      };

      applyToNode(menu);

      // Reassign for Vue reactivity
      this.userMenuAccess = updated;

      // If turning ON, ensure parent has view access
      const parentId = Number(menu.parent_id || 0);
      if (nextVal && parentId > 0) {
        this.ensureParentView(parentId);
      }
    },

    togglePermission(menu, perm) {
      const id = this.getMenuId(menu);
      if (!id) return;

      const updated = { ...this.userMenuAccess };

      if (!updated[id]) {
        updated[id] = {
          menu_id: id,
          can_view: false,
          can_add: false,
          can_edit: false,
          can_delete: false,
        };
      }

      const current = Boolean(updated[id][perm]);
      const nextVal = !current;

      const setNodePerm = (node, p, val) => {
        const nodeId = this.getMenuId(node);
        if (!nodeId) return;
        if (!updated[nodeId]) {
          updated[nodeId] = { menu_id: nodeId };
        }
        updated[nodeId][p] = val;

        // If turning write permission ON, automatically turn view ON
        if (val && p !== "can_view") {
          updated[nodeId].can_view = true;
        }

        // If turning view OFF, turn all write permissions OFF
        if (!val && p === "can_view") {
          updated[nodeId].can_add = false;
          updated[nodeId].can_edit = false;
          updated[nodeId].can_delete = false;
        }

        // Cascade down to children
        if (node.children && node.children.length > 0) {
          node.children.forEach((c) => setNodePerm(c, p, val));
        }
      };

      setNodePerm(menu, perm, nextVal);

      // Reassign for Vue reactivity
      this.userMenuAccess = updated;

      // Cascade up to parent
      const parentId = Number(menu.parent_id || 0);
      if (nextVal && parentId > 0) {
        this.ensureParentView(parentId);
      }
    },

    ensureParentView(parentId) {
      const pId = Number(parentId || 0);
      if (!pId) return;
      const updated = { ...this.userMenuAccess };
      if (!updated[pId]) {
        updated[pId] = { menu_id: pId };
      }
      updated[pId].can_view = true;
      this.userMenuAccess = updated;

      // Find grandparent
      const parentMenu = (this.lookups.menus || []).find((m) => this.getMenuId(m) === pId);
      if (parentMenu && parentMenu.parent_id && Number(parentMenu.parent_id) > 0) {
        this.ensureParentView(Number(parentMenu.parent_id));
      }
    },

    // Header Column Checkbox logic
    isHeaderAllChecked(perm) {
      const menus = this.lookups.menus || [];
      if (menus.length === 0) return false;

      if (perm === "all") {
        return menus.every((m) => {
          const id = this.getMenuId(m);
          const acc = this.userMenuAccess[id];
          return acc && acc.can_view && acc.can_add && acc.can_edit && acc.can_delete;
        });
      }

      return menus.every((m) => {
        const id = this.getMenuId(m);
        return Boolean(this.userMenuAccess[id]?.[perm]);
      });
    },

    isHeaderIndeterminate(perm) {
      if (this.isHeaderAllChecked(perm)) return false;
      const menus = this.lookups.menus || [];

      if (perm === "all") {
        return menus.some((m) => {
          const id = this.getMenuId(m);
          const acc = this.userMenuAccess[id];
          return acc && (acc.can_view || acc.can_add || acc.can_edit || acc.can_delete);
        });
      }

      return menus.some((m) => {
        const id = this.getMenuId(m);
        return Boolean(this.userMenuAccess[id]?.[perm]);
      });
    },

    toggleHeaderPermission(perm) {
      const currentlyAll = this.isHeaderAllChecked(perm);
      const nextVal = !currentlyAll;
      const menus = this.lookups.menus || [];
      const updated = { ...this.userMenuAccess };

      menus.forEach((m) => {
        const id = this.getMenuId(m);
        if (!id) return;
        if (!updated[id]) {
          updated[id] = { menu_id: id };
        }
        if (perm === "all") {
          updated[id].can_view = nextVal;
          updated[id].can_add = nextVal;
          updated[id].can_edit = nextVal;
          updated[id].can_delete = nextVal;
        } else {
          updated[id][perm] = nextVal;
          if (nextVal && perm !== "can_view") {
            updated[id].can_view = true;
          }
          if (!nextVal && perm === "can_view") {
            updated[id].can_add = false;
            updated[id].can_edit = false;
            updated[id].can_delete = false;
          }
        }
      });

      this.userMenuAccess = updated;
    },

    // Quick set actions (matching screenshot buttons)
    quickSetFullAccess() {
      const menus = this.lookups.menus || [];
      const updated = { ...this.userMenuAccess };
      menus.forEach((m) => {
        const id = this.getMenuId(m);
        if (!id) return;
        updated[id] = {
          menu_id: id,
          can_view: true,
          can_add: true,
          can_edit: true,
          can_delete: true,
        };
      });
      this.userMenuAccess = updated;
      Swal.fire({
        icon: "success",
        title: "Full Access Set",
        text: "Granted all VIEW, ADD, EDIT, DELETE permissions for all modules.",
        toast: true,
        position: "top-end",
        timer: 2000,
        showConfirmButton: false,
      });
    },

    quickSetViewOnly() {
      const menus = this.lookups.menus || [];
      const updated = { ...this.userMenuAccess };
      menus.forEach((m) => {
        const id = this.getMenuId(m);
        if (!id) return;
        updated[id] = {
          menu_id: id,
          can_view: true,
          can_add: false,
          can_edit: false,
          can_delete: false,
        };
      });
      this.userMenuAccess = updated;
      Swal.fire({
        icon: "info",
        title: "View Only Set",
        text: "Enabled VIEW permission for all modules; cleared add, edit, and delete permissions.",
        toast: true,
        position: "top-end",
        timer: 2000,
        showConfirmButton: false,
      });
    },

    quickSetClearAll() {
      const menus = this.lookups.menus || [];
      const updated = { ...this.userMenuAccess };
      menus.forEach((m) => {
        const id = this.getMenuId(m);
        if (!id) return;
        updated[id] = {
          menu_id: id,
          can_view: false,
          can_add: false,
          can_edit: false,
          can_delete: false,
        };
      });
      this.userMenuAccess = updated;
      Swal.fire({
        icon: "warning",
        title: "Permissions Cleared",
        text: "All module access permissions have been unticked.",
        toast: true,
        position: "top-end",
        timer: 2000,
        showConfirmButton: false,
      });
    },

    getRoleBadgeClass(role) {
      const r = (role || "users").toLowerCase();
      if (r === "admin") {
        return "bg-primary-subtle text-primary border border-primary-subtle";
      }
      if (r === "supervisor") {
        return "bg-info-subtle text-info border border-info-subtle";
      }
      if (r === "agent") {
        return "bg-success-subtle text-success border border-success-subtle";
      }
      return "bg-secondary-subtle text-secondary border border-secondary-subtle";
    },

    getRoleLabel(roleName) {
      if (!roleName) return "Standard User";
      const r = (this.availableRoles || []).find(
        (item) => (item.name || "").toLowerCase() === String(roleName).toLowerCase()
      );
      if (r) return r.name ? (r.name.charAt(0).toUpperCase() + r.name.slice(1)) : (r.label || roleName);
      return roleName.charAt(0).toUpperCase() + roleName.slice(1);
    },

    async syncRolePermissions(showToast = false) {
      if (!this.form.role) return;

      if (this.form.role === "admin") {
        this.quickSetFullAccess();
        if (showToast) {
          Swal.fire({
            icon: "success",
            title: "Full Access Synced",
            text: "All modules set to full access for Administrator.",
            toast: true,
            position: "top-end",
            timer: 2000,
            showConfirmButton: false,
          });
        }
        return;
      }

      const roleName = this.form.role.toLowerCase();
      let roleObj = (this.availableRoles || []).find(
        (r) => (r.name || "").toLowerCase() === roleName
      );

      // If roleObj wasn't found or missing a valid role_id, attempt to fetch roles directly from the API
      if (!roleObj || !roleObj.role_id) {
        try {
          const rolesRes = await axios.get(`${this.apiBase}/roles`, {
            headers: this.getAuthHeaders(),
          });
          const rawRoles = rolesRes.data?.data || rolesRes.data || [];
          roleObj = rawRoles.find((r) => (r.name || "").toLowerCase() === roleName);
        } catch (e) {
          console.warn("Could not fetch roles for matrix sync:", e);
        }
      }

      const roleId = roleObj?.role_id || (roleName === "users" ? 4 : null);

      if (roleId) {
        try {
          const res = await axios.get(`${this.apiBase}/roles/${roleId}/matrix`, {
            headers: this.getAuthHeaders(),
          });
          // Support both res.data.matrix and res.data.data.matrix
          const matrix = res.data?.matrix || res.data?.data?.matrix || {};
          const updated = {};
          (this.lookups.menus || []).forEach((m) => {
            const mId = this.getMenuId(m);
            if (!mId) return;
            const perms = matrix[mId] || {};
            updated[mId] = {
              menu_id: mId,
              can_view: Boolean(perms.view),
              can_add: Boolean(perms.add),
              can_edit: Boolean(perms.edit),
              can_delete: Boolean(perms.delete),
            };
          });
          this.userMenuAccess = updated;

          if (showToast) {
            Swal.fire({
              icon: "success",
              title: "Permissions Synced",
              text: `Menu access permissions synced with ${this.getRoleLabel(this.form.role)} role.`,
              toast: true,
              position: "top-end",
              timer: 2000,
              showConfirmButton: false,
            });
          }
          return;
        } catch (e) {
          console.warn("Could not load role matrix:", e);
          if (showToast) {
            Swal.fire({
              icon: "error",
              title: "Sync Failed",
              text: e.response?.data?.message || "Could not fetch permissions matrix for this role.",
              toast: true,
              position: "top-end",
              timer: 2500,
              showConfirmButton: false,
            });
          }
        }
      } else if (showToast) {
        Swal.fire({
          icon: "warning",
          title: "Role Not Found",
          text: `Could not find a role ID for "${this.form.role}".`,
          toast: true,
          position: "top-end",
          timer: 2500,
          showConfirmButton: false,
        });
      }
    },

    async onRoleChanged() {
      await this.syncRolePermissions(true);
    },

    /* =========================================================================
       Modal Dialog Lifecycle & Form Submission
       ========================================================================= */
    openCreateModal() {
      this.editingId = null;
      this.activeTab = "account";
      this.form = {
        name: "",
        email: "",
        username: "",
        password: "",
        status: "active",
        role: "users",
      };
      this.userAssignments = [];
      this.initUserMenuAccess([]);
      this.syncRolePermissions(false);
      this.menuSearchQuery = "";
      this.expandAllMenus();
      this.formError = "";
      this.formErrors = {};
      this.modalShow = true;
    },

    async cloneUser(user) {
      await this.openEditModal(user);
      this.editingId = null;
      this.activeTab = "account";
      this.form = {
        ...this.form,
        name: "",
        email: "",
        username: "",
        password: "",
      };
      this.formError = "";
      this.formErrors = {};
    },

    async openEditModal(user, targetTab = "account") {
      this.editingId = user.id;
      this.activeTab = targetTab;
      this.form = {
        name: user.fullname || user.name || "",
        email: user.email || "",
        username: user.username || "",
        password: "",
        status: user.status || "active",
        role: user.role || "users",
      };
      this.userAssignments = (user.assignments || []).map((a) => ({
        reference: a.reference,
        reference_code: a.reference_code,
        default: Boolean(a.default),
      }));

      // Initialize menu access
      this.initUserMenuAccess(user.menu_access || user.menuAccess || []);

      // If user has menu_access endpoint, fetch fresh data
      try {
        const response = await axios.get(`${this.apiBase}/users/${user.id}/menu-access`, {
          headers: this.getAuthHeaders(),
        });
        if (response.data && response.data.menus) {
          this.lookups.menus = response.data.menus.map((m) => {
            const id = this.getMenuId(m);
            return {
              ...m,
              id,
              menu_id: id,
            };
          });
          this.initUserMenuAccess(response.data.menus);
          if (response.data.menu_tree) {
            this.lookups.menu_tree = this.normalizeMenuTree(response.data.menu_tree);
          }
        }
      } catch (err) {
        console.warn("Using local user menu access data:", err);
      }

      this.menuSearchQuery = "";
      this.expandAllMenus();
      this.formError = "";
      this.formErrors = {};
      this.modalShow = true;
    },

    openPermissionsTabForUser(user) {
      this.openEditModal(user, "menu_access");
    },

    async refreshCurrentUserMenuAccess(updatedUserId) {
      const rawUser = sessionStorage.getItem("authUser") || localStorage.getItem("user");
      if (!rawUser) return;

      let currentUser;
      try {
        currentUser = JSON.parse(rawUser);
      } catch (error) {
        console.warn("Unable to refresh the current user's menu access:", error);
        return;
      }

      if (Number(currentUser.id) !== Number(updatedUserId)) return;

      try {
        const response = await axios.get(`${this.apiBase}/user/menu-access`, {
          headers: this.getAuthHeaders(),
        });
        const menus = response.data?.menus || [];
        sessionStorage.setItem("user_menu_permissions", JSON.stringify(menus));

        currentUser.menuAccess = menus.map((menu) => ({
          menu_id: menu.id || menu.menu_id,
          can_view: Boolean(menu.can_view),
          can_add: Boolean(menu.can_add),
          can_edit: Boolean(menu.can_edit),
          can_delete: Boolean(menu.can_delete),
        }));
        currentUser.menu_access = currentUser.menuAccess;
        sessionStorage.setItem("authUser", JSON.stringify(currentUser));
        localStorage.setItem("user", JSON.stringify(currentUser));
      } catch (error) {
        console.warn("Unable to refresh the current user's menu access:", error);
      }
    },

    async submitForm() {
      this.formError = "";
      this.formErrors = {};

      if (!this.form.name || !this.form.name.trim()) {
        this.formErrors.name = "Full name is required.";
      }
      if (!this.form.email || !this.form.email.trim()) {
        this.formErrors.email = "Email is required.";
      }
      if (!this.editingId && (!this.form.password || this.form.password.length < 6)) {
        this.formErrors.password = "Password of at least 6 characters is required.";
      }

      if (Object.keys(this.formErrors).length > 0) {
        this.activeTab = "account";
        return;
      }

      this.submitting = true;
      try {
        const menuAccessArray = Object.values(this.userMenuAccess).map((item) => ({
          menu_id: item.menu_id,
          can_view: Boolean(item.can_view),
          can_add: Boolean(item.can_add),
          can_edit: Boolean(item.can_edit),
          can_delete: Boolean(item.can_delete),
        }));

        const payload = {
          name: this.form.name.trim(),
          email: this.form.email.trim(),
          username: this.form.username ? this.form.username.trim() : null,
          status: this.form.status || "active",
          role: this.form.role || "users",
          assignments: this.userAssignments,
          menu_access: menuAccessArray,
        };

        if (this.form.password) {
          payload.password = this.form.password;
        }

        if (this.editingId) {
          // Update
          await axios.put(`${this.apiBase}/users/${this.editingId}`, payload, {
            headers: this.getAuthHeaders(),
          });
          await this.refreshCurrentUserMenuAccess(this.editingId);

          Swal.fire({
            icon: "success",
            title: "Updated",
            text: "User account, role, permissions, and entity assignments saved.",
            toast: true,
            position: "top-end",
            timer: 2500,
            showConfirmButton: false,
          });
        } else {
          // Create
          await axios.post(`${this.apiBase}/users`, payload, {
            headers: this.getAuthHeaders(),
          });

          Swal.fire({
            icon: "success",
            title: "Created",
            text: "User registered with assigned entities and menu permissions.",
            toast: true,
            position: "top-end",
            timer: 2500,
            showConfirmButton: false,
          });
        }

        this.modalShow = false;
        await this.fetchUsers();
        window.dispatchEvent(new CustomEvent("menus-updated"));
      } catch (err) {
        if (err.response?.status === 422 && err.response?.data?.errors) {
          this.formErrors = err.response.data.errors;
          this.formError = Object.values(err.response.data.errors).flat().join(" ");
        } else {
          this.formError = err.response?.data?.message || "Failed to save user.";
        }
      } finally {
        this.submitting = false;
      }
    },

    async confirmDelete(user) {
      if (user.id === 1) {
        Swal.fire({
          icon: "warning",
          title: "Protected Account",
          text: "The primary administrator account cannot be deleted.",
        });
        return;
      }

      const result = await Swal.fire({
        title: "Delete User?",
        html: `Are you sure you want to delete <strong>"${user.name}" (${user.email})</strong>?<br><small class="text-muted">This will revoke all entity assignments and menu permissions.</small>`,
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
          await axios.delete(`${this.apiBase}/users/${user.id}`, {
            headers: this.getAuthHeaders(),
          });
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "User account deleted successfully.",
            toast: true,
            position: "top-end",
            timer: 2500,
            showConfirmButton: false,
          });
          await this.fetchUsers();
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Delete Failed",
            text: err.response?.data?.message || "Failed to delete user.",
            confirmButtonClass: "btn btn-primary",
            buttonsStyling: false,
          });
        }
      }
    },
  },
};
</script>

<style scoped>
.users-grid-wrap {
  height: min(64vh, 680px);
  min-height: 420px;
  border-top: 1px solid var(--vz-border-color, #e9ebf0);
}

.users-grid-wrap :deep(.app-grid),
.users-grid-wrap :deep(.app-grid__grid) { height: 100%; }

.users-grid-wrap :deep(.app-grid__grid .ag-root-wrapper) { border-radius: 0 !important; }

:global(.users-grid) { --users-grid-pinned-bg: #ffffff; }
:global([data-bs-theme="dark"] .users-grid),
:global([data-layout-mode="dark"] .users-grid) { --users-grid-pinned-bg: #1f2937; }
:global(html .users-grid .ag-pinned-left-header),
:global(html .users-grid .ag-pinned-right-header),
:global(html .users-grid .ag-pinned-left-cols-viewport),
:global(html .users-grid .ag-pinned-right-cols-viewport),
:global(html .users-grid .ag-pinned-left-cols-container),
:global(html .users-grid .ag-pinned-right-cols-container) {
  z-index: 20 !important;
  background-color: var(--users-grid-pinned-bg) !important;
  opacity: 1 !important;
}
:global(html .users-grid .users-grid-pinned-header),
:global(html .users-grid .users-grid-pinned-cell) {
  background-color: var(--users-grid-pinned-bg) !important;
  background-image: none !important;
  opacity: 1 !important;
}
.users-grid :deep(.ag-header-cell-text) { font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }
.users-grid :deep(.ag-cell) { display: flex; align-items: center; overflow: hidden; }
.users-grid :deep(.users-grid-identity),
.users-grid :deep(.users-grid-actions) { display: flex; align-items: center; }
.users-grid :deep(.users-grid-identity) { gap: 9px; min-width: 0; width: 100%; }
.users-grid :deep(.users-grid-avatar) { display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 50%; flex: 0 0 30px; color: #405189; background: rgba(64, 81, 137, 0.12); font-size: 11px; font-weight: 700; }
.users-grid :deep(.users-grid-details) { min-width: 0; display: flex; flex: 1 1 auto; flex-direction: column; line-height: 1.25; }
.users-grid :deep(.users-grid-name) { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 600; }
.users-grid :deep(.users-grid-meta) { overflow: hidden; color: var(--vz-secondary-color, #878a99); font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
.users-grid :deep(.users-grid-badge) { display: inline-flex; align-items: center; width: fit-content; border-radius: 4px; padding: 3px 7px; font-size: 11px; font-weight: 700; line-height: 1.2; text-transform: capitalize; }
.users-grid :deep(.users-grid-badge.is-admin) { color: #405189; background: rgba(64, 81, 137, 0.12); }
.users-grid :deep(.users-grid-badge.is-user), .users-grid :deep(.users-grid-badge.is-active) { color: #0ab39c; background: rgba(10, 179, 156, 0.12); }
.users-grid :deep(.users-grid-badge.is-inactive) { color: #f7b84b; background: rgba(247, 184, 75, 0.14); }
.users-grid :deep(.users-grid-access) { display: inline-flex; align-items: center; gap: 4px; border: 1px solid rgba(135, 138, 153, .2); border-radius: 4px; padding: 3px 7px; color: var(--vz-secondary-color, #878a99); background: rgba(135, 138, 153, .08); font-size: 10px; font-weight: 700; line-height: 1.25; white-space: nowrap; }
.users-grid :deep(.users-grid-access.has-access) { color: #405189; border-color: rgba(64, 81, 137, .18); background: rgba(64, 81, 137, .1); }
.users-grid :deep(.users-grid-actions) { justify-content: flex-end; gap: 5px; width: 100%; }
.users-grid :deep(.users-grid-actions .btn) { width: 28px; height: 28px; padding: 0 !important; flex: 0 0 28px; }
.users-grid :deep(.users-grid-assignments) { display: flex; align-items: center; gap: 4px; min-width: 0; overflow: hidden; white-space: nowrap; }
.users-grid :deep(.users-grid-assignments.is-empty) { color: var(--vz-secondary-color, #878a99); font-size: 12px; font-style: italic; }
.users-grid :deep(.users-grid-assignment-chip) { display: inline-block; max-width: 104px; overflow: hidden; border: 1px solid rgba(64, 81, 137, 0.13); border-radius: 4px; padding: 3px 6px; color: #405189; background: rgba(64, 81, 137, 0.07); font-family: monospace; font-size: 10px; font-weight: 700; line-height: 1.1; text-overflow: ellipsis; white-space: nowrap; }
.users-grid :deep(.users-grid-assignment-chip.is-default) { color: #fff; background: #405189; border-color: #405189; }
.users-grid :deep(.users-grid-assignment-more) { display: inline-flex; align-items: center; justify-content: center; min-width: 23px; height: 21px; border-radius: 50%; color: #405189; background: rgba(64, 81, 137, 0.12); font-size: 10px; font-weight: 700; }

/* Cell renderers are created by AG Grid, outside Vue's scoped DOM. */
:global(.users-grid .ag-cell) { display: flex; align-items: center; overflow: hidden; }
:global(.users-grid .users-grid-identity), :global(.users-grid .users-grid-actions) { display: flex; align-items: center; }
:global(.users-grid .users-grid-identity) { gap: 9px; min-width: 0; width: 100%; }
:global(.users-grid .users-grid-avatar) { display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 50%; flex: 0 0 30px; color: #405189; background: rgba(64, 81, 137, .12); font-size: 11px; font-weight: 700; }
:global(.users-grid .users-grid-details) { display: flex; flex: 1 1 auto; flex-direction: column; min-width: 0; line-height: 1.25; }
:global(.users-grid .users-grid-name), :global(.users-grid .users-grid-meta) { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
:global(.users-grid .users-grid-name) { font-weight: 600; }
:global(.users-grid .users-grid-meta) { color: var(--vz-secondary-color, #878a99); font-size: 11px; }
:global(.users-grid .users-grid-badge) { display: inline-flex; width: fit-content; border-radius: 4px; padding: 3px 7px; font-size: 11px; font-weight: 700; line-height: 1.2; text-transform: capitalize; }
:global(.users-grid .users-grid-badge.is-admin) { color: #405189; background: rgba(64, 81, 137, .12); }
:global(.users-grid .users-grid-badge.is-user), :global(.users-grid .users-grid-badge.is-active) { color: #0ab39c; background: rgba(10, 179, 156, .12); }
:global(.users-grid .users-grid-badge.is-inactive) { color: #f7b84b; background: rgba(247, 184, 75, .14); }
:global(.users-grid .users-grid-access) { display: inline-flex; align-items: center; gap: 4px; border: 1px solid rgba(135, 138, 153, .2); border-radius: 4px; padding: 3px 7px; color: var(--vz-secondary-color, #878a99); background: rgba(135, 138, 153, .08); font-size: 10px; font-weight: 700; line-height: 1.25; white-space: nowrap; }
:global(.users-grid .users-grid-access.has-access) { color: #405189; border-color: rgba(64, 81, 137, .18); background: rgba(64, 81, 137, .1); }
:global(.users-grid .users-grid-actions) { justify-content: flex-end; gap: 5px; width: 100%; }
:global(.users-grid .users-grid-actions .btn) { width: 28px; height: 28px; padding: 0 !important; flex: 0 0 28px; }
:global(.users-grid .users-grid-assignments) { display: flex; align-items: center; gap: 4px; min-width: 0; overflow: hidden; white-space: nowrap; }
:global(.users-grid .users-grid-assignments.is-empty) { color: var(--vz-secondary-color, #878a99); font-size: 12px; font-style: italic; }
:global(.users-grid .users-grid-assignment-chip) { display: inline-block; max-width: 104px; overflow: hidden; border: 1px solid rgba(64, 81, 137, .13); border-radius: 4px; padding: 3px 6px; color: #405189; background: rgba(64, 81, 137, .07); font-family: monospace; font-size: 10px; font-weight: 700; line-height: 1.1; text-overflow: ellipsis; white-space: nowrap; }
:global(.users-grid .users-grid-assignment-chip.is-default) { color: #fff; background: #405189; border-color: #405189; }
:global(.users-grid .users-grid-assignment-more) { display: inline-flex; align-items: center; justify-content: center; min-width: 23px; height: 21px; border-radius: 50%; color: #405189; background: rgba(64, 81, 137, .12); font-size: 10px; font-weight: 700; }

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
  padding-left: 38px;
}
.search-box .search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
}

.user-table th {
  border-bottom-width: 1px;
  letter-spacing: 0.03em;
}

.user-row {
  transition: background-color 0.15s ease;
}

.user-row:hover {
  background-color: rgba(64, 81, 137, 0.03);
}

.user-name {
  color: #212529;
  transition: color 0.15s ease;
}

.user-row:hover .user-name {
  color: #405189;
}

.avatar-xs {
  width: 2rem;
  height: 2rem;
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

/* User Table: Menu Access Pill Button (High Contrast in Light & Dark Mode) */
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

/* Dark Mode Overrides for Menu Access Pill */
[data-layout-mode="dark"] .permission-badge-active,
html[data-layout-mode="dark"] .permission-badge-active,
[data-bs-theme="dark"] .permission-badge-active,
html[data-bs-theme="dark"] .permission-badge-active {
  background-color: rgba(245, 158, 11, 0.22) !important;
  border: 1.5px solid #fbbf24 !important;
  color: #fef08a !important; /* Bright high-contrast yellow in dark mode */
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

.modal-nav-tabs {
  background-color: #f1f5f9;
  border-radius: 8px;
  gap: 2px;
  display: flex !important;
  flex-wrap: nowrap !important;
  overflow-x: auto !important;
  white-space: nowrap !important;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.modal-nav-tabs::-webkit-scrollbar {
  display: none;
}
.modal-nav-tabs .nav-item {
  flex-shrink: 0 !important;
}
.modal-nav-tabs .nav-link {
  white-space: nowrap !important;
  padding: 0.45rem 0.75rem !important;
  font-size: 13px !important;
  display: inline-flex !important;
  align-items: center !important;
  transition: all 0.15s ease-in-out;
}
[data-layout-mode="dark"] .modal-nav-tabs,
html[data-layout-mode="dark"] .modal-nav-tabs,
[data-bs-theme="dark"] .modal-nav-tabs,
html[data-bs-theme="dark"] .modal-nav-tabs {
  background-color: rgba(255, 255, 255, 0.04) !important;
}

/* Menu Access Badge Styles with Dark Mode Protection */
.modal-nav-tabs .menu-access-badge {
  display: inline-flex !important;
  align-items: center !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  padding: 2px 7px !important;
  border-radius: 9999px !important;
  line-height: 1.2 !important;
  transition: all 0.15s ease-in-out;
}
.modal-nav-tabs .menu-access-badge.active-badge,
.modal-nav-tabs .nav-link.active .menu-access-badge {
  background-color: #ffffff !important;
  color: #1e1b4b !important; /* High-contrast dark ink on white pill */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25) !important;
}
.modal-nav-tabs .menu-access-badge.inactive-badge,
.modal-nav-tabs .nav-link:not(.active) .menu-access-badge {
  background-color: rgba(245, 158, 11, 0.15) !important;
  color: #d97706 !important;
  border: 1px solid rgba(245, 158, 11, 0.3) !important;
}

[data-layout-mode="dark"] .modal-nav-tabs .menu-access-badge.active-badge,
html[data-layout-mode="dark"] .modal-nav-tabs .menu-access-badge.active-badge,
[data-bs-theme="dark"] .modal-nav-tabs .menu-access-badge.active-badge,
html[data-bs-theme="dark"] .modal-nav-tabs .menu-access-badge.active-badge,
[data-layout-mode="dark"] .modal-nav-tabs .nav-link.active .menu-access-badge,
html[data-layout-mode="dark"] .modal-nav-tabs .nav-link.active .menu-access-badge,
[data-bs-theme="dark"] .modal-nav-tabs .nav-link.active .menu-access-badge,
html[data-bs-theme="dark"] .modal-nav-tabs .nav-link.active .menu-access-badge {
  background-color: #ffffff !important;
  color: #1e1b4b !important; /* Bold solid dark text in dark mode */
  font-weight: 800 !important;
}

[data-layout-mode="dark"] .modal-nav-tabs .menu-access-badge.inactive-badge,
html[data-layout-mode="dark"] .modal-nav-tabs .menu-access-badge.inactive-badge,
[data-bs-theme="dark"] .modal-nav-tabs .menu-access-badge.inactive-badge,
html[data-bs-theme="dark"] .modal-nav-tabs .menu-access-badge.inactive-badge,
[data-layout-mode="dark"] .modal-nav-tabs .nav-link:not(.active) .menu-access-badge,
html[data-layout-mode="dark"] .modal-nav-tabs .nav-link:not(.active) .menu-access-badge,
[data-bs-theme="dark"] .modal-nav-tabs .nav-link:not(.active) .menu-access-badge,
html[data-bs-theme="dark"] .modal-nav-tabs .nav-link:not(.active) .menu-access-badge {
  background-color: rgba(245, 158, 11, 0.25) !important;
  color: #fde047 !important;
  border-color: rgba(245, 158, 11, 0.5) !important;
  font-weight: 700 !important;
}

.entity-assignment-list {
  max-height: 250px;
  overflow-y: auto;
}

.entity-item {
  transition: background 0.15s ease;
}
.entity-item:hover {
  background-color: rgba(64, 81, 137, 0.05);
}
.entity-selected {
  background-color: rgba(64, 81, 137, 0.08);
}

.cursor-pointer {
  cursor: pointer;
}

.preview-box {
  background: rgba(64, 81, 137, 0.03);
  border-color: rgba(64, 81, 137, 0.15) !important;
}

/* Status Filter Pill Buttons */
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

/* Username Badge */
.badge-username {
  background-color: #f3f6f9;
  color: #6c757d;
  border: 1px solid #e9ebec;
}

/* System Badges */
.badge-system-default {
  background-color: #212529;
  color: #ffffff;
  border: 1px solid #212529;
}

.badge-system-regular {
  background-color: #f3f6f9;
  color: #212529;
  border: 1px solid #ced4da;
}

/* ==========================================================================
   Menu Access & Permissions Matrix Styles (Matching Screenshot)
   ========================================================================== */
.matrix-banner {
  background-color: #fff9f0;
  border: 1.5px solid #fed7aa;
}

.matrix-count-val {
  color: #ea580c;
  font-size: 1.6rem;
  font-weight: 800;
  line-height: 1;
}

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

/* Quick Set Buttons */
.btn-quick-full {
  background-color: #ffffff;
  border: 1.5px solid #ea580c;
  color: #c2410c;
  font-weight: 600;
}
.btn-quick-full:hover {
  background-color: #ea580c;
  color: #ffffff;
}

.btn-quick-view {
  background-color: #ffffff;
  border: 1.5px solid #ea580c;
  color: #c2410c;
  font-weight: 600;
}
.btn-quick-view:hover {
  background-color: #ea580c;
  color: #ffffff;
}

.btn-quick-clear {
  background-color: #ffffff;
  border: 1.5px solid #ef4444;
  color: #dc2626;
  font-weight: 600;
}
.btn-quick-clear:hover {
  background-color: #ef4444;
  color: #ffffff;
}

/* Permissions Matrix Table */
.matrix-table-container {
  max-height: 480px;
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

/* Dark Mode Overrides */
[data-layout-mode="dark"] .user-row:hover,
html[data-layout-mode="dark"] .user-row:hover,
[data-bs-theme="dark"] .user-row:hover,
html[data-bs-theme="dark"] .user-row:hover {
  background-color: rgba(255, 255, 255, 0.03);
}

[data-layout-mode="dark"] .user-name,
html[data-layout-mode="dark"] .user-name,
[data-bs-theme="dark"] .user-name,
html[data-bs-theme="dark"] .user-name {
  color: #ced4da;
}

[data-layout-mode="dark"] .user-row:hover .user-name,
html[data-layout-mode="dark"] .user-row:hover .user-name,
[data-bs-theme="dark"] .user-row:hover .user-name,
html[data-bs-theme="dark"] .user-row:hover .user-name {
  color: #fff;
}

[data-layout-mode="dark"] .entity-item:hover,
html[data-layout-mode="dark"] .entity-item:hover,
[data-bs-theme="dark"] .entity-item:hover,
html[data-bs-theme="dark"] .entity-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

[data-layout-mode="dark"] .entity-selected,
html[data-layout-mode="dark"] .entity-selected,
[data-bs-theme="dark"] .entity-selected,
html[data-bs-theme="dark"] .entity-selected {
  background-color: rgba(255, 255, 255, 0.08);
}

[data-layout-mode="dark"] .preview-box,
html[data-layout-mode="dark"] .preview-box,
[data-bs-theme="dark"] .preview-box,
html[data-bs-theme="dark"] .preview-box {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.1) !important;
}

/* Dark Mode Filter Pills & Buttons */
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
  border-color: rgba(255, 255, 255, 0.4) !important;
  color: #ffffff !important;
}

[data-layout-mode="dark"] .btn-outline-secondary,
html[data-layout-mode="dark"] .btn-outline-secondary,
[data-bs-theme="dark"] .btn-outline-secondary,
html[data-bs-theme="dark"] .btn-outline-secondary {
  color: #ced4da !important;
  border-color: rgba(255, 255, 255, 0.22) !important;
  background-color: rgba(255, 255, 255, 0.04) !important;
}

[data-layout-mode="dark"] .badge-username,
html[data-layout-mode="dark"] .badge-username,
[data-bs-theme="dark"] .badge-username,
html[data-bs-theme="dark"] .badge-username {
  background-color: rgba(255, 255, 255, 0.08) !important;
  color: #ced4da !important;
  border-color: rgba(255, 255, 255, 0.14) !important;
}

[data-layout-mode="dark"] .badge-system-default,
html[data-layout-mode="dark"] .badge-system-default,
[data-bs-theme="dark"] .badge-system-default,
html[data-bs-theme="dark"] .badge-system-default {
  background-color: #495057 !important;
  color: #ffffff !important;
  border-color: rgba(255, 255, 255, 0.3) !important;
}

[data-layout-mode="dark"] .badge-system-regular,
html[data-layout-mode="dark"] .badge-system-regular,
[data-bs-theme="dark"] .badge-system-regular,
html[data-bs-theme="dark"] .badge-system-regular {
  background-color: rgba(255, 255, 255, 0.1) !important;
  color: #f8f9fa !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
}

/* Dark Mode Matrix Styles */
[data-layout-mode="dark"] .matrix-banner,
html[data-layout-mode="dark"] .matrix-banner,
[data-bs-theme="dark"] .matrix-banner,
html[data-bs-theme="dark"] .matrix-banner {
  background-color: rgba(234, 88, 12, 0.1) !important;
  border-color: rgba(234, 88, 12, 0.3) !important;
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

[data-layout-mode="dark"] .matrix-banner-subtitle,
html[data-layout-mode="dark"] .matrix-banner-subtitle,
[data-bs-theme="dark"] .matrix-banner-subtitle,
html[data-bs-theme="dark"] .matrix-banner-subtitle {
  color: #94a3b8 !important;
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
html[data-bs-theme="dark"] .module-title {
  color: #e2e8f0 !important;
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

.required:after {
  content: " *";
  color: #f06548;
}
</style>
