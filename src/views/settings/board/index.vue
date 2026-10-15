<template>
  <Layout>
    <PageHeader title="Category Management" pageTitle="Settings" />

    <!-- Top KPI Metric Cards -->
    <BRow class="mb-4 g-3">
      <BCol xl="3" md="6">
        <BCard no-body class="card-animate shadow-sm border-0 h-100">
          <BCardBody class="d-flex align-items-center justify-content-between p-3">
            <div>
              <p class="text-uppercase fw-semibold text-muted fs-11 mb-1">Total Categories</p>
              <h3 class="mb-0 fw-bold text-primary">
                <count-to :duration="800" :startVal="0" :endVal="stats.total_boards"></count-to>
              </h3>
              <p class="mb-0 text-muted fs-12 mt-1">
                <span class="badge bg-primary-subtle text-primary me-1">
                  <i class="ri-git-branch-line align-middle"></i> Workflows
                </span>
              </p>
            </div>
            <div class="avatar-sm flex-shrink-0">
              <span class="avatar-title bg-primary-subtle text-primary rounded-circle fs-3">
                <i class="ri-artboard-line"></i>
              </span>
            </div>
          </BCardBody>
        </BCard>
      </BCol>

      <BCol xl="3" md="6">
        <BCard no-body class="card-animate shadow-sm border-0 h-100">
          <BCardBody class="d-flex align-items-center justify-content-between p-3">
            <div>
              <p class="text-uppercase fw-semibold text-muted fs-11 mb-1">Active Workflows</p>
              <h3 class="mb-0 fw-bold text-success">
                <count-to :duration="800" :startVal="0" :endVal="stats.active_boards"></count-to>
              </h3>
              <p class="mb-0 text-muted fs-12 mt-1">
                <span class="badge bg-success-subtle text-success me-1">
                  <i class="ri-checkbox-circle-line align-middle"></i> Operational
                </span>
              </p>
            </div>
            <div class="avatar-sm flex-shrink-0">
              <span class="avatar-title bg-success-subtle text-success rounded-circle fs-3">
                <i class="ri-toggle-line"></i>
              </span>
            </div>
          </BCardBody>
        </BCard>
      </BCol>

      <BCol xl="3" md="6">
        <BCard no-body class="card-animate shadow-sm border-0 h-100">
          <BCardBody class="d-flex align-items-center justify-content-between p-3">
            <div>
              <p class="text-uppercase fw-semibold text-muted fs-11 mb-1">Configured Statuses</p>
              <h3 class="mb-0 fw-bold text-warning">
                <count-to :duration="800" :startVal="0" :endVal="stats.total_statuses"></count-to>
              </h3>
              <p class="mb-0 text-muted fs-12 mt-1">
                <span class="badge bg-warning-subtle text-warning me-1">
                  <i class="ri-node-tree align-middle"></i> Pipeline Stages
                </span>
              </p>
            </div>
            <div class="avatar-sm flex-shrink-0">
              <span class="avatar-title bg-warning-subtle text-warning rounded-circle fs-3">
                <i class="ri-flow-chart"></i>
              </span>
            </div>
          </BCardBody>
        </BCard>
      </BCol>

      <BCol xl="3" md="6">
        <BCard no-body class="card-animate shadow-sm border-0 h-100">
          <BCardBody class="d-flex align-items-center justify-content-between p-3">
            <div>
              <p class="text-uppercase fw-semibold text-muted fs-11 mb-1">System Tickets</p>
              <h3 class="mb-0 fw-bold text-info">
                <count-to :duration="800" :startVal="0" :endVal="stats.total_tickets"></count-to>
              </h3>
              <p class="mb-0 text-muted fs-12 mt-1">
                <span class="badge bg-info-subtle text-info me-1">
                  <i class="ri-ticket-2-line align-middle"></i> Routed
                </span>
              </p>
            </div>
            <div class="avatar-sm flex-shrink-0">
              <span class="avatar-title bg-info-subtle text-info rounded-circle fs-3">
                <i class="ri-customer-service-2-line"></i>
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
            <h5 class="card-title mb-0 fw-bold">Categories & Workflow Pipelines</h5>
            <span class="badge bg-secondary-subtle text-secondary">
              {{ boards.length }} Categories Configured
            </span>
          </div>

          <div class="d-flex align-items-center gap-2">
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary"
              :disabled="loading"
              @click="fetchBoards"
              title="Reload categories from database"
            >
              <i class="ri-refresh-line" :class="{ 'ri-spin': loading }"></i>
            </button>

            <button
              type="button"
              class="btn btn-sm btn-primary d-flex align-items-center gap-1 shadow-sm"
              @click="openCreateBoardModal"
            >
              <i class="ri-add-line fs-14"></i>
              <span>Create Category</span>
            </button>
          </div>
        </div>
      </BCardHeader>

      <!-- Filter Toolbar -->
      <BCardBody class="border-top border-bottom border-dashed border-start-0 border-end-0 py-3 toolbar-container">
        <BRow class="g-3 align-items-center">
          <BCol xl="5" lg="6" sm="12">
            <div class="search-box">
              <input
                type="text"
                class="form-control search"
                placeholder="Search categories by name or workflow status..."
                v-model="searchQuery"
              />
              <i class="ri-search-line search-icon text-muted"></i>
              <button
                v-if="searchQuery"
                type="button"
                class="btn btn-sm btn-link position-absolute end-0 top-50 translate-middle-y text-muted text-decoration-none pe-2"
                @click="searchQuery = ''"
              >
                <i class="ri-close-line"></i>
              </button>
            </div>
          </BCol>

          <BCol xl="3" lg="3" sm="6">
            <select class="form-select" v-model="filterStatus">
                <option value="All">All Category Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
            </select>
          </BCol>

          <BCol xl="4" lg="3" sm="6" class="text-end">
            <span class="text-muted fs-13">
              Showing <strong>{{ filteredBoards.length }}</strong> of {{ boards.length }} records
            </span>
          </BCol>
        </BRow>
      </BCardBody>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="text-muted mt-2 mb-0">Loading categories and workflow statuses...</p>
      </div>

      <!-- Table Body -->
      <BCardBody v-else class="p-0">
        <div class="table-responsive">
          <table class="table align-middle table-hover mb-0">
            <thead class="table-light text-muted">
              <tr>
                <th scope="col" style="width: 70px" class="ps-3">#ID</th>
                <th scope="col" style="min-width: 200px">Category Name</th>
                <th scope="col" style="min-width: 190px">Department</th>
                <th scope="col">Status</th>
                <th scope="col" style="min-width: 320px">Workflow Stages (Sequence)</th>
                <th scope="col">Stages Count</th>
                <th scope="col">Last Updated</th>
                <th scope="col" class="text-end pe-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="board in filteredBoards" :key="board.id">
                <td class="ps-3 fw-bold text-muted">#{{ board.id }}</td>
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <div class="avatar-xs flex-shrink-0">
                      <span class="avatar-title bg-primary-subtle text-primary rounded-circle fs-14">
                        <i class="ri-artboard-2-line"></i>
                      </span>
                    </div>
                    <div>
                      <h6 class="fs-14 mb-0 fw-semibold text-body">{{ board.name }}</h6>
                      <small class="text-muted">ID: #{{ board.id }}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <span v-if="board.department" class="text-body fs-13">
                    {{ board.department.code ? `${board.department.code} - ` : '' }}{{ board.department.name }}
                  </span>
                  <span v-else class="text-muted fs-13">All Departments</span>
                </td>
                <td>
                  <span
                    class="badge px-2 py-1 text-uppercase"
                    :class="board.status ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-danger-subtle text-danger border border-danger-subtle'"
                  >
                    {{ board.status ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td>
                  <!-- Interactive Pipeline Steps Preview -->
                  <div class="d-flex align-items-center gap-1 flex-wrap">
                    <template v-if="board.statuses && board.statuses.length">
                      <div
                        v-for="(st, idx) in board.statuses"
                        :key="st.id"
                        class="d-flex align-items-center"
                      >
                        <span
                          class="badge px-2 py-1 fs-11 text-uppercase cursor-pointer shadow-none d-inline-flex align-items-center gap-1"
                          :class="getStatusBadgeClass(st.color)"
                          :style="getStatusBadgeStyle(st.color)"
                          :title="`Order #${st.order} · Type: ${formatTypeName(st.type)}`"
                          @click="openManagePipelineModal(board)"
                        >
                          <span
                            class="d-inline-block rounded-circle"
                            :style="{ backgroundColor: resolveStatusHexColor(st.color), width: '6px', height: '6px' }"
                          ></span>
                          {{ st.name }}
                        </span>
                        <i
                          v-if="idx < board.statuses.length - 1"
                          class="ri-arrow-right-s-line text-muted mx-1 fs-12"
                        ></i>
                      </div>
                    </template>
                    <span v-else class="text-muted fs-12 fst-italic">No stages configured</span>
                  </div>
                </td>
                <td>
                  <span class="badge bg-secondary-subtle text-body border border-secondary-subtle">
                    {{ board.statuses ? board.statuses.length : 0 }} Steps
                  </span>
                </td>
                <td class="text-muted fs-12">
                  {{ formatDate(board.updated_at || board.created_at) }}
                </td>
                <td class="text-end pe-3">
                  <div class="d-flex align-items-center justify-content-end gap-1">
                    <button
                      type="button"
                      class="btn btn-sm btn-workflow"
                      @click="openManagePipelineModal(board)"
                      title="Manage workflow stages"
                    >
                      <i class="ri-flow-chart"></i>
                      <span class="d-none d-md-inline">Workflow</span>
                    </button>

                    <button
                      type="button"
                      class="btn btn-sm btn-ghost-secondary"
                      @click="openEditBoardModal(board)"
                      title="Edit category name and status"
                    >
                      <i class="ri-pencil-line"></i>
                    </button>

                    <button
                      type="button"
                      class="btn btn-sm btn-ghost-danger"
                      @click="confirmDeleteBoard(board)"
                      title="Delete board"
                    >
                      <i class="ri-delete-bin-line"></i>
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Empty State -->
              <tr v-if="filteredBoards.length === 0">
                <td colspan="8" class="text-center py-5">
                  <lottie
                    class="avatar-xl mx-auto"
                    colors="primary:#405189,secondary:#0ab39c"
                    :options="defaultOptions"
                    :height="100"
                    :width="100"
                  />
                  <h5 class="mt-3 fw-bold">No Categories Found</h5>
                  <p class="text-muted mb-3 fs-13">
                    No categories matched your filter criteria.
                  </p>
                  <button type="button" class="btn btn-sm btn-soft-primary" @click="resetFilters">
                    <i class="ri-filter-off-line me-1"></i> Reset Filters
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </BCardBody>
    </BCard>

    <!-- Modal: Create / Edit Category -->
    <BModal
      v-model="boardModalShow"
      id="boardModal"
      modal-class="zoomIn"
      :title="editingBoard ? 'Edit Category #' + boardForm.id : 'Create New Category'"
      title-class="exampleModalLabel fw-bold"
      hide-footer
      header-class="p-3 bg-primary-subtle"
      class="v-modal-custom"
      centered
    >
      <form @submit.prevent="handleBoardFormSubmit" autocomplete="off">
        <div class="mb-3">
          <label for="boardName" class="form-label fw-semibold">Category Name <span class="text-danger">*</span></label>
          <input
            type="text"
            id="boardName"
            class="form-control"
            placeholder="e.g. IT Helpdesk Workflow, Bug Tracking Pipeline"
            v-model="boardForm.name"
            :class="{ 'is-invalid': boardSubmitted && !boardForm.name }"
          />
          <div class="invalid-feedback">Please enter a category name.</div>
        </div>

        <div class="mb-3">
          <label for="boardDepartment" class="form-label fw-semibold">Department</label>
          <select id="boardDepartment" class="form-select" v-model="boardForm.department_id">
            <option :value="null">All Departments</option>
            <option v-for="department in departments" :key="department.id" :value="department.id">
              {{ department.code ? `${department.code} - ` : '' }}{{ department.name }}
            </option>
          </select>
          <small class="text-muted">Optionally limit this category to a department.</small>
        </div>

        <div class="mb-3">
          <div class="form-check form-switch form-switch-md">
            <input
              class="form-check-input"
              type="checkbox"
              id="boardStatusSwitch"
              v-model="boardForm.status"
            />
            <label class="form-check-label fw-semibold ms-2" for="boardStatusSwitch">
              Active Workflow Status
            </label>
          </div>
          <small class="text-muted d-block mt-1">
              When enabled, tickets can be routed through this category's stages.
          </small>
        </div>

        <div v-if="!editingBoard" class="mb-3">
          <label class="form-label fw-semibold">Initial Workflow Template</label>
          <select class="form-select" v-model="boardForm.template">
            <option value="standard">Standard 4-Step (New ➜ Open ➜ In Progress ➜ Closed)</option>
            <option value="simple">Simple 3-Step (To Do ➜ Doing ➜ Done)</option>
            <option value="dev">Software QA (Triage ➜ In Dev ➜ QA Review ➜ Deployed)</option>
            <option value="blank">Custom (Empty Board)</option>
          </select>
        </div>

        <div class="modal-footer v-modal-footer mt-4 pb-0 px-0">
          <div class="hstack gap-2 justify-content-end w-100">
            <button type="button" class="btn btn-ghost-secondary" @click="boardModalShow = false">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary d-flex align-items-center gap-1" :disabled="submittingBoard">
              <span v-if="submittingBoard" class="spinner-border spinner-border-sm me-1"></span>
              <i v-else :class="editingBoard ? 'ri-save-line' : 'ri-check-line'"></i>
              <span>{{ editingBoard ? 'Save Changes' : 'Create Category' }}</span>
            </button>
          </div>
        </div>
      </form>
    </BModal>

    <!-- Modal: Workflow Pipeline Manager (Stages Editor for Selected Category) -->
    <BModal
      v-model="pipelineModalShow"
      id="pipelineModal"
      modal-class="zoomIn"
      :title="`Manage Workflow Pipeline — ${selectedBoard?.name || ''}`"
      title-class="exampleModalLabel fw-bold"
      hide-footer
      header-class="p-3 bg-primary-subtle"
      class="v-modal-custom"
      size="lg"
      centered
    >
      <div v-if="selectedBoard">
        <!-- Subtitle & Add Stage Button -->
        <div class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
          <div>
            <p class="text-muted fs-13 mb-0">
              Stages for Category <strong>#{{ selectedBoard.id }}</strong> ({{ selectedBoard.name }}). Tickets progress sequentially through these statuses.
            </p>
          </div>
          <button
            type="button"
            class="btn btn-sm btn-primary d-flex align-items-center gap-1 shadow-sm flex-shrink-0"
            @click="openAddStatusModal"
          >
            <i class="ri-add-line fs-14"></i>
            <span>Add Stage</span>
          </button>
        </div>

        <!-- Pipeline Sequence Visualizer -->
        <div class="mb-4">
          <div class="d-flex align-items-center justify-content-between mb-1">
            <label class="form-label fw-semibold fs-12 text-uppercase text-muted mb-0">Sequence Flow Preview</label>
            <span class="badge bg-secondary-subtle text-muted fs-11">
              {{ selectedBoard.statuses ? selectedBoard.statuses.length : 0 }} Stages in Flow
            </span>
          </div>
          <div class="p-3 rounded border sequence-flow-preview-box d-flex align-items-center gap-2 flex-wrap">
            <template v-if="selectedBoard.statuses && selectedBoard.statuses.length">
              <div
                v-for="(st, idx) in selectedBoard.statuses"
                :key="st.id"
                class="d-flex align-items-center"
              >
                <div class="sequence-flow-chip">
                  <span
                    class="d-inline-block rounded-circle flex-shrink-0"
                    :style="{
                      backgroundColor: resolveStatusHexColor(st.color),
                      width: '8px',
                      height: '8px',
                      boxShadow: `0 0 6px ${resolveStatusHexColor(st.color)}66`
                    }"
                  ></span>
                  <span class="fs-12 fw-bold sequence-flow-name">{{ st.name }}</span>
                  <span
                    v-if="st.type"
                    class="badge-type-mini"
                    :class="getTypeBadgeClass(st.type)"
                  >
                    {{ formatTypeName(st.type) }}
                  </span>
                </div>
                <i
                  v-if="idx < selectedBoard.statuses.length - 1"
                  class="ri-arrow-right-line sequence-flow-arrow mx-1 fs-14"
                ></i>
              </div>
            </template>
            <span v-else class="text-muted fs-12">No workflow stages defined yet. Click "Add Stage" above.</span>
          </div>
        </div>

        <!-- Stages List with Move Up/Down & Edit/Delete -->
        <div class="table-responsive border rounded mb-3">
          <table class="table align-middle table-hover mb-0">
            <thead class="table-light text-muted fs-12 sequence-table-head">
              <tr>
                <th style="width: 50px">Order</th>
                <th>Stage Name</th>
                <th>Color Badge</th>
                <th>Type</th>
                <th>Notifications</th>
                <th class="text-end pe-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(status, index) in selectedBoard.statuses" :key="status.id">
                <td class="fw-bold text-muted">#{{ status.order }}</td>
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <span
                      class="d-inline-block rounded-circle flex-shrink-0"
                      :style="{
                        backgroundColor: resolveStatusHexColor(status.color),
                        width: '10px',
                        height: '10px',
                        boxShadow: `0 0 6px ${resolveStatusHexColor(status.color)}66`
                      }"
                    ></span>
                    <span class="fw-semibold text-body">{{ status.name }}</span>
                  </div>
                </td>
                <td>
                  <span
                    class="badge px-2 py-1 text-uppercase"
                    :class="getStatusBadgeClass(status.color)"
                    :style="getStatusBadgeStyle(status.color)"
                  >
                    {{ status.color }}
                  </span>
                </td>
                <td>
                  <span
                    class="badge-type"
                    :class="getTypeBadgeClass(status.type)"
                  >
                    <i :class="getTypeIconClass(status.type)"></i>
                    {{ formatTypeName(status.type) }}
                  </span>
                </td>
                <td>
                  <div class="d-flex align-items-center gap-1 fs-11 flex-wrap">
                    <span
                      class="badge"
                      :class="status.notify_creator ? 'bg-primary-subtle text-primary border border-primary-subtle' : 'bg-secondary-subtle text-muted border border-secondary-subtle'"
                      title="Notify Ticket Creator"
                    >
                      <i class="ri-user-line me-1"></i>Creator
                    </span>
                    <span
                      class="badge"
                      :class="status.notify_followers ? 'bg-info-subtle text-info border border-info-subtle' : 'bg-secondary-subtle text-muted border border-secondary-subtle'"
                      title="Notify Ticket Followers"
                    >
                      <i class="ri-user-follow-line me-1"></i>Followers
                    </span>
                    <span
                      class="badge"
                      :class="status.notify_assignees ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-secondary-subtle text-muted border border-secondary-subtle'"
                      title="Notify Assignees"
                    >
                      <i class="ri-team-line me-1"></i>Assignees
                    </span>
                  </div>
                </td>
                <td class="text-end pe-3">
                  <div class="d-flex align-items-center justify-content-end gap-1">
                    <!-- Move Up -->
                    <button
                      type="button"
                      class="btn btn-sm btn-ghost-secondary p-1"
                      :disabled="index === 0"
                      @click="moveStatus(index, -1)"
                      title="Move Up"
                    >
                      <i class="ri-arrow-up-s-line fs-14"></i>
                    </button>

                    <!-- Move Down -->
                    <button
                      type="button"
                      class="btn btn-sm btn-ghost-secondary p-1"
                      :disabled="index === selectedBoard.statuses.length - 1"
                      @click="moveStatus(index, 1)"
                      title="Move Down"
                    >
                      <i class="ri-arrow-down-s-line fs-14"></i>
                    </button>

                    <!-- Edit Status -->
                    <button
                      type="button"
                      class="btn btn-sm btn-ghost-primary p-1"
                      @click="openEditStatusModal(status)"
                      title="Edit Stage"
                    >
                      <i class="ri-pencil-line fs-14"></i>
                    </button>

                    <!-- Delete Status -->
                    <button
                      type="button"
                      class="btn btn-sm btn-ghost-danger p-1"
                      @click="confirmDeleteStatus(status)"
                      title="Delete Stage"
                    >
                      <i class="ri-delete-bin-line fs-14"></i>
                    </button>
                  </div>
                </td>
              </tr>

              <tr v-if="!selectedBoard.statuses || selectedBoard.statuses.length === 0">
                <td colspan="6" class="text-center py-4 text-muted">
                  No stages found for this category.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="modal-footer v-modal-footer mt-3 pb-0 px-0">
          <div class="hstack gap-2 justify-content-end w-100">
            <button type="button" class="btn btn-ghost-secondary" @click="pipelineModalShow = false">
              Done
            </button>
          </div>
        </div>
      </div>
    </BModal>

    <!-- Modal: Add / Edit Single Status (Stage) -->
    <BModal
      v-model="statusModalShow"
      id="statusModal"
      modal-class="zoomIn"
      :title="editingStatus ? 'Edit Stage #' + statusForm.id : 'Add New Workflow Stage'"
      title-class="exampleModalLabel fw-bold"
      hide-footer
      header-class="p-3 bg-primary-subtle"
      class="v-modal-custom"
      centered
    >
      <form @submit.prevent="handleStatusFormSubmit" autocomplete="off">
        <div class="mb-3">
          <label for="statusName" class="form-label fw-semibold">Stage Name <span class="text-danger">*</span></label>
          <input
            type="text"
            id="statusName"
            class="form-control"
            placeholder="e.g. Under Investigation, Client Review, Awaiting Deployment"
            v-model="statusForm.name"
            :class="{ 'is-invalid': statusSubmitted && !statusForm.name }"
          />
          <div class="invalid-feedback">Please enter a stage name.</div>
        </div>

        <!-- Color Swatch Picker -->
        <div class="mb-3">
          <div class="d-flex align-items-center justify-content-between mb-1">
            <label class="form-label fw-semibold mb-0">Badge Theme Color</label>
            <div class="d-flex align-items-center gap-1">
              <input
                type="color"
                class="form-control form-control-color p-0 border-0"
                style="width: 24px; height: 24px; cursor: pointer;"
                v-model="statusForm.color"
                title="Custom Hex Color"
              />
              <span class="fs-12 text-muted font-monospace">{{ statusForm.color }}</span>
            </div>
          </div>
          <div class="d-flex align-items-center gap-2 flex-wrap mt-2">
            <button
              v-for="c in colorOptions"
              :key="c.id"
              type="button"
              class="color-swatch-btn"
              :style="{ backgroundColor: resolveStatusHexColor(c.id) }"
              :class="{ 'active-swatch': statusForm.color === c.id }"
              @click="statusForm.color = c.id"
              :title="c.label"
            >
              <i v-if="statusForm.color === c.id" class="ri-check-line fw-bold text-white fs-13"></i>
            </button>
          </div>
        </div>

        <!-- Stage Type -->
        <div class="mb-3">
          <label for="statusType" class="form-label fw-semibold">Stage Category / Type</label>
          <select id="statusType" class="form-select" v-model="statusForm.type">
            <option :value="null">None / Unassigned</option>
            <option value="acknowledge">Acknowledge (Initial Intake)</option>
            <option value="assigned">Assigned (Assigned to Engineer)</option>
            <option value="in-progress">In Progress (Active Development)</option>
            <option value="it-testing">IT Testing (Internal Verification)</option>
            <option value="user-testing">User Testing (UAT / Client Review)</option>
            <option value="re-do">Re-Do (Fixes & Rework)</option>
            <option value="resolved">Resolved (Accepted / Solved)</option>
            <option value="deployed">Deployed (Production Release)</option>
            <option value="closed">Closed (Final Sign-off)</option>
            <option value="cancelled">Cancelled (Abandoned)</option>
            <option value="open">Open (General)</option>
          </select>
        </div>

        <!-- Notification Toggles -->
        <div class="mb-3 p-3 rounded border sequence-flow-preview-box">
          <label class="form-label fw-semibold fs-12 text-uppercase text-muted mb-2">Automated Event Triggers</label>
          <div class="d-flex flex-column gap-2">
            <div class="form-check form-switch">
              <input
                class="form-check-input"
                type="checkbox"
                id="notifyCreator"
                v-model="statusForm.notify_creator"
              />
              <label class="form-check-label fs-13" for="notifyCreator">
                Notify Ticket Creator when moved to this stage
              </label>
            </div>

            <div class="form-check form-switch">
              <input
                class="form-check-input"
                type="checkbox"
                id="notifyAssignees"
                v-model="statusForm.notify_assignees"
              />
              <label class="form-check-label fs-13" for="notifyAssignees">
                Notify Assigned Team Members when moved to this stage
              </label>
            </div>

            <div class="form-check form-switch">
              <input
                class="form-check-input"
                type="checkbox"
                id="notifyFollowers"
                v-model="statusForm.notify_followers"
              />
              <label class="form-check-label fs-13" for="notifyFollowers">
                Notify Ticket Watchers / Followers
              </label>
            </div>
          </div>
        </div>

        <div class="modal-footer v-modal-footer mt-4 pb-0 px-0">
          <div class="hstack gap-2 justify-content-end w-100">
            <button type="button" class="btn btn-ghost-secondary" @click="statusModalShow = false">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary d-flex align-items-center gap-1" :disabled="submittingStatus">
              <span v-if="submittingStatus" class="spinner-border spinner-border-sm me-1"></span>
              <i v-else :class="editingStatus ? 'ri-save-line' : 'ri-check-line'"></i>
              <span>{{ editingStatus ? 'Save Stage' : 'Add Stage' }}</span>
            </button>
          </div>
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
import Lottie from "@/components/widgets/lottie.vue";
import animationData from "@/components/widgets/msoeawqm.json";
import { getSystemConfiguration } from "@/helpers/themeConfig";

export default {
  components: {
    Layout,
    PageHeader,
    CountTo,
    lottie: Lottie,
  },
  data() {
    return {
      loading: false,
      boards: [],
      departments: [],
      stats: {
        total_boards: 0,
        active_boards: 0,
        total_statuses: 0,
        total_tickets: 0,
      },

      systemConfig: getSystemConfiguration() || null,

      searchQuery: "",
      filterStatus: "All",

      defaultOptions: {
        animationData: animationData,
      },

      // Board Modal State
      boardModalShow: false,
      editingBoard: false,
      submittingBoard: false,
      boardSubmitted: false,
      boardForm: {
        id: null,
        name: "",
        status: true,
        department_id: null,
        template: "standard",
      },

      // Pipeline Modal State
      pipelineModalShow: false,
      selectedBoard: null,

      // Status Modal State
      statusModalShow: false,
      editingStatus: false,
      submittingStatus: false,
      statusSubmitted: false,
      statusForm: {
        id: null,
        name: "",
        color: "#f5365c",
        type: "open",
        notify_creator: false,
        notify_assignees: false,
        notify_followers: false,
      },

      colorOptions: [
        { id: "#f5365c", label: "Crimson Rose (#f5365c)" },
        { id: "#405189", label: "Navy Indigo (#405189)" },
        { id: "#0ab39c", label: "Teal Emerald (#0ab39c)" },
        { id: "#f7b84b", label: "Amber Yellow (#f7b84b)" },
        { id: "#299cdb", label: "Sky Blue (#299cdb)" },
        { id: "primary", label: "Primary Blue" },
        { id: "info", label: "Info Cyan" },
        { id: "warning", label: "Warning Amber" },
        { id: "danger", label: "Danger Coral" },
        { id: "success", label: "Success Green" },
        { id: "dark", label: "Dark Charcoal" },
        { id: "secondary", label: "Secondary Slate" },
      ],
    };
  },
  computed: {
    apiBase() {
      return process.env.VUE_APP_AUTHDOMAIN || "http://localhost:8001/api";
    },

    filteredBoards() {
      let result = [...this.boards];

      if (this.searchQuery && this.searchQuery.trim() !== "") {
        const q = this.searchQuery.toLowerCase().trim();
        result = result.filter((b) => {
          const nameMatch = (b.name || "").toLowerCase().includes(q);
          const statusMatch = (b.statuses || []).some((st) =>
            (st.name || "").toLowerCase().includes(q)
          );
          return nameMatch || statusMatch;
        });
      }

      if (this.filterStatus !== "All") {
        const isActive = this.filterStatus === "Active";
        result = result.filter((b) => Boolean(b.status) === isActive);
      }

      return result;
    },
  },
  mounted() {
    this.fetchBoards();
    this.fetchDepartments();
  },
  methods: {
    getAuthHeaders() {
      const token = localStorage.getItem("jwt") || localStorage.getItem("token");
      return token ? { Authorization: `Bearer ${token}` } : {};
    },

    async fetchBoards() {
      this.loading = true;
      try {
        const response = await axios.get(`${this.apiBase}/boards`, {
          headers: this.getAuthHeaders(),
        });
        if (response.data) {
          this.boards = response.data.data || [];
          if (response.data.stats) {
            this.stats = response.data.stats;
          }
        }
      } catch (err) {
        console.error("Failed to fetch boards:", err);
        Swal.fire({
          icon: "error",
          title: "Failed to load boards",
          text: err.response?.data?.message || err.message,
          confirmButtonClass: "btn btn-primary",
        });
      } finally {
        this.loading = false;
      }
    },

    async fetchDepartments() {
      try {
        const response = await axios.get(`${this.apiBase}/departments?status=active`, {
          headers: this.getAuthHeaders(),
        });
        this.departments = response.data?.data || [];
      } catch (err) {
        console.error("Failed to fetch departments:", err);
      }
    },

    resetFilters() {
      this.searchQuery = "";
      this.filterStatus = "All";
    },

    openCreateBoardModal() {
      this.editingBoard = false;
      this.boardSubmitted = false;
      this.boardForm = {
        id: null,
        name: "",
        status: true,
        department_id: null,
        template: "standard",
      };
      this.boardModalShow = true;
    },

    openEditBoardModal(board) {
      this.editingBoard = true;
      this.boardSubmitted = false;
      this.boardForm = {
        id: board.id,
        name: board.name,
        status: Boolean(board.status),
        department_id: board.department_id || null,
        template: "standard",
      };
      this.boardModalShow = true;
    },

    async handleBoardFormSubmit() {
      this.boardSubmitted = true;
      if (!this.boardForm.name.trim()) return;

      this.submittingBoard = true;
      try {
        if (this.editingBoard && this.boardForm.id) {
          await axios.put(
            `${this.apiBase}/boards/${this.boardForm.id}`,
            {
              name: this.boardForm.name,
              status: this.boardForm.status,
              department_id: this.boardForm.department_id,
            },
            { headers: this.getAuthHeaders() }
          );

          Swal.fire({
            icon: "success",
            title: "Board Updated",
            text: "Board details have been saved.",
            timer: 1800,
            showConfirmButton: false,
          });
        } else {
          let customStatuses = [];
          if (this.boardForm.template === "simple") {
            customStatuses = [
              { name: "To Do", color: "info", type: "open" },
              { name: "Doing", color: "warning", type: "progress" },
              { name: "Done", color: "success", type: "closed" },
            ];
          } else if (this.boardForm.template === "dev") {
            customStatuses = [
              { name: "Triage", color: "info", type: "open" },
              { name: "In Development", color: "warning", type: "progress" },
              { name: "QA Review", color: "primary", type: "review" },
              { name: "Deployed", color: "success", type: "closed" },
            ];
          } else if (this.boardForm.template === "blank") {
            customStatuses = [];
          }

          await axios.post(
            `${this.apiBase}/boards`,
            {
              name: this.boardForm.name,
              status: this.boardForm.status,
              department_id: this.boardForm.department_id,
              statuses: customStatuses.length > 0 ? customStatuses : undefined,
            },
            { headers: this.getAuthHeaders() }
          );

          Swal.fire({
            icon: "success",
            title: "Board Created",
            text: "New board workflow created successfully.",
            timer: 1800,
            showConfirmButton: false,
          });
        }

        this.boardModalShow = false;
        await this.fetchBoards();
      } catch (err) {
        console.error("Board save error:", err);
        Swal.fire({
          icon: "error",
          title: "Save Failed",
          text: err.response?.data?.message || err.message,
        });
      } finally {
        this.submittingBoard = false;
      }
    },

    async confirmDeleteBoard(board) {
      const result = await Swal.fire({
        title: `Delete "${board.name}"?`,
        text: "This action will permanently remove this board and its workflow statuses.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#f06548",
        cancelButtonColor: "#74788d",
        confirmButtonText: "Yes, Delete Board",
      });

      if (result.isConfirmed) {
        try {
          await axios.delete(`${this.apiBase}/boards/${board.id}`, {
            headers: this.getAuthHeaders(),
          });

          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Board has been deleted.",
            timer: 1800,
            showConfirmButton: false,
          });
          await this.fetchBoards();
        } catch (err) {
          console.error("Board delete error:", err);
          Swal.fire({
            icon: "error",
            title: "Cannot Delete Board",
            text: err.response?.data?.message || err.message,
          });
        }
      }
    },

    openManagePipelineModal(board) {
      this.selectedBoard = JSON.parse(JSON.stringify(board));
      this.pipelineModalShow = true;
    },

    openAddStatusModal() {
      this.editingStatus = false;
      this.statusSubmitted = false;
      this.statusForm = {
        id: null,
        name: "",
        color: "primary",
        type: "open",
        notify_creator: false,
        notify_assignees: false,
        notify_followers: false,
      };
      this.statusModalShow = true;
    },

    openEditStatusModal(status) {
      this.editingStatus = true;
      this.statusSubmitted = false;
      this.statusForm = {
        id: status.id,
        name: status.name,
        color: status.color || "primary",
        type: status.type || "open",
        notify_creator: Boolean(status.notify_creator),
        notify_assignees: Boolean(status.notify_assignees),
        notify_followers: Boolean(status.notify_followers),
      };
      this.statusModalShow = true;
    },

    async handleStatusFormSubmit() {
      this.statusSubmitted = true;
      if (!this.statusForm.name.trim() || !this.selectedBoard) return;

      this.submittingStatus = true;
      try {
        if (this.editingStatus && this.statusForm.id) {
          const res = await axios.put(
            `${this.apiBase}/boards/${this.selectedBoard.id}/statuses/${this.statusForm.id}`,
            this.statusForm,
            { headers: this.getAuthHeaders() }
          );

          // Update local state
          const idx = this.selectedBoard.statuses.findIndex((s) => s.id === this.statusForm.id);
          if (idx !== -1) {
            this.selectedBoard.statuses.splice(idx, 1, res.data.data);
          }
        } else {
          const res = await axios.post(
            `${this.apiBase}/boards/${this.selectedBoard.id}/statuses`,
            this.statusForm,
            { headers: this.getAuthHeaders() }
          );

          if (!this.selectedBoard.statuses) this.selectedBoard.statuses = [];
          this.selectedBoard.statuses.push(res.data.data);
        }

        this.statusModalShow = false;
        await this.fetchBoards();

        // Update selectedBoard reference from fresh boards list
        const refreshed = this.boards.find((b) => b.id === this.selectedBoard.id);
        if (refreshed) this.selectedBoard = JSON.parse(JSON.stringify(refreshed));
      } catch (err) {
        console.error("Status save error:", err);
        Swal.fire({
          icon: "error",
          title: "Save Failed",
          text: err.response?.data?.message || err.message,
        });
      } finally {
        this.submittingStatus = false;
      }
    },

    async confirmDeleteStatus(status) {
      const result = await Swal.fire({
        title: `Delete Stage "${status.name}"?`,
        text: "Are you sure you want to delete this stage?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#f06548",
        cancelButtonColor: "#74788d",
        confirmButtonText: "Yes, Delete",
      });

      if (result.isConfirmed) {
        try {
          await axios.delete(
            `${this.apiBase}/boards/${this.selectedBoard.id}/statuses/${status.id}`,
            { headers: this.getAuthHeaders() }
          );

          const idx = this.selectedBoard.statuses.findIndex((s) => s.id === status.id);
          if (idx !== -1) {
            this.selectedBoard.statuses.splice(idx, 1);
          }
          await this.fetchBoards();
        } catch (err) {
          console.error("Delete status error:", err);
          Swal.fire({
            icon: "error",
            title: "Cannot Delete Stage",
            text: err.response?.data?.message || err.message,
          });
        }
      }
    },

    async moveStatus(index, direction) {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= this.selectedBoard.statuses.length) return;

      const items = [...this.selectedBoard.statuses];
      const temp = items[index];
      items[index] = items[targetIndex];
      items[targetIndex] = temp;

      // Reassign order
      items.forEach((item, idx) => {
        item.order = idx + 1;
      });

      this.selectedBoard.statuses = items;

      const payload = {
        orders: items.map((st) => ({ id: st.id, order: st.order })),
      };

      try {
        await axios.post(
          `${this.apiBase}/boards/${this.selectedBoard.id}/statuses/reorder`,
          payload,
          { headers: this.getAuthHeaders() }
        );
        await this.fetchBoards();
      } catch (err) {
        console.error("Failed to reorder statuses:", err);
      }
    },

    formatDate(dateStr) {
      if (!dateStr) return "-";
      try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const day = String(d.getDate()).padStart(2, "0");
        return `${day} ${months[d.getMonth()]}, ${d.getFullYear()}`;
      } catch {
        return dateStr;
      }
    },

    resolveStatusHexColor(color) {
      if (!color) return "#405189";
      const c = color.trim().toLowerCase();
      if (c.startsWith("#")) return color.trim();
      const map = {
        primary: "#405189",
        info: "#299cdb",
        warning: "#f7b84b",
        danger: "#f06548",
        success: "#0ab39c",
        dark: "#212529",
        secondary: "#878a99",
      };
      return map[c] || "#405189";
    },

    getStatusBadgeClass(color) {
      if (color && color.trim().startsWith("#")) {
        return "badge-custom-hex";
      }
      const c = (color || "").toLowerCase();
      if (c === "info") return "bg-info-subtle text-info border border-info-subtle";
      if (c === "primary") return "bg-primary-subtle text-primary border border-primary-subtle";
      if (c === "warning") return "bg-warning-subtle text-warning border border-warning-subtle";
      if (c === "danger") return "bg-danger-subtle text-danger border border-danger-subtle";
      if (c === "success") return "bg-success-subtle text-success border border-success-subtle";
      if (c === "dark") return "bg-dark-subtle text-body border border-secondary-subtle";
      return "bg-secondary-subtle text-secondary border border-secondary-subtle";
    },

    getStatusBadgeStyle(color) {
      if (color && color.trim().startsWith("#")) {
        const hex = color.trim();
        return {
          backgroundColor: `${hex}26`,
          color: hex,
          borderColor: `${hex}66`,
          borderWidth: "1px",
          borderStyle: "solid",
        };
      }
      return {};
    },

    formatTypeName(type) {
      if (!type || !type.trim()) return "None";
      const t = type.trim().toLowerCase();
      const map = {
        acknowledge: "Acknowledge",
        assigned: "Assigned",
        "in-progress": "In Progress",
        progress: "In Progress",
        "it testing": "IT Testing",
        "it-testing": "IT Testing",
        "user-testing": "User Testing",
        review: "Review",
        "re-do": "Re-Do",
        resolved: "Resolved",
        accepted: "Accepted",
        deployed: "Deployed",
        close: "Close",
        closed: "Closed",
        cancelled: "Cancelled",
        open: "Open",
      };
      return map[t] || (t.charAt(0).toUpperCase() + t.slice(1));
    },

    getTypeBadgeClass(type) {
      if (!type || !type.trim()) return "badge-type-none";
      const t = type.trim().toLowerCase();
      if (t === "acknowledge" || t === "open") return "badge-type-acknowledge";
      if (t === "assigned") return "badge-type-assigned";
      if (t === "in-progress" || t === "progress") return "badge-type-progress";
      if (t === "it testing" || t === "it-testing") return "badge-type-it-testing";
      if (t === "user-testing" || t === "review") return "badge-type-testing";
      if (t === "re-do") return "badge-type-redo";
      if (t === "resolved" || t === "accepted") return "badge-type-resolved";
      if (t === "deployed") return "badge-type-deployed";
      if (t === "close" || t === "closed") return "badge-type-closed";
      if (t === "cancelled") return "badge-type-cancelled";
      return "badge-type-default";
    },

    getTypeIconClass(type) {
      if (!type || !type.trim()) return "ri-subtract-line";
      const t = type.trim().toLowerCase();
      if (t === "acknowledge" || t === "open") return "ri-checkbox-circle-line";
      if (t === "assigned") return "ri-user-shared-line";
      if (t === "in-progress" || t === "progress") return "ri-loader-4-line";
      if (t === "it testing" || t === "it-testing") return "ri-cpu-line";
      if (t === "user-testing" || t === "review") return "ri-flask-line";
      if (t === "re-do") return "ri-restart-line";
      if (t === "resolved" || t === "accepted") return "ri-check-double-line";
      if (t === "deployed") return "ri-rocket-line";
      if (t === "close" || t === "closed") return "ri-lock-2-line";
      if (t === "cancelled") return "ri-close-circle-line";
      return "ri-node-tree";
    },

    getDotColorClass(color) {
      const c = (color || "").toLowerCase();
      if (c === "info") return "bg-info";
      if (c === "primary") return "bg-primary";
      if (c === "warning") return "bg-warning";
      if (c === "danger") return "bg-danger";
      if (c === "success") return "bg-success";
      if (c === "dark") return "bg-dark";
      return "bg-secondary";
    },
  },
};
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.shadow-xs {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* Sequence Flow Visualizer Preview */
.sequence-flow-preview-box {
  background-color: var(--vz-input-bg, rgba(255, 255, 255, 0.03)) !important;
  border-color: var(--vz-border-color, rgba(255, 255, 255, 0.12)) !important;
}

[data-bs-theme="dark"] .sequence-flow-preview-box {
  background-color: rgba(255, 255, 255, 0.03) !important;
  border-color: rgba(255, 255, 255, 0.12) !important;
}

[data-bs-theme="light"] .sequence-flow-preview-box {
  background-color: #f8f9fa !important;
  border-color: #e9ebec !important;
}

.sequence-flow-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.35rem 0.65rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  transition: all 0.15s ease-in-out;
  border: 1px solid transparent;
}

[data-bs-theme="dark"] .sequence-flow-chip {
  background-color: #1f2736 !important;
  border-color: rgba(255, 255, 255, 0.16) !important;
  color: #ffffff !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

[data-bs-theme="dark"] .sequence-flow-chip:hover {
  background-color: #273144 !important;
  border-color: rgba(255, 255, 255, 0.25) !important;
  color: #ffffff !important;
}

[data-bs-theme="dark"] .sequence-flow-chip .sequence-flow-name {
  color: #ffffff !important;
}

[data-bs-theme="dark"] .sequence-flow-arrow {
  color: #878a99 !important;
}

[data-bs-theme="light"] .sequence-flow-chip {
  background-color: #ffffff !important;
  border-color: #e2e5e8 !important;
  color: #212529 !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

[data-bs-theme="light"] .sequence-flow-chip:hover {
  background-color: #fdfdfd !important;
  border-color: #ced4da !important;
}

[data-bs-theme="light"] .sequence-flow-chip .sequence-flow-name {
  color: #212529 !important;
}

[data-bs-theme="light"] .sequence-flow-arrow {
  color: #98a6ad !important;
}

/* Type Column Badges (Dark Mode & Light Mode Compatible) */
.badge-type {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.32rem 0.6rem;
  font-size: 0.72rem;
  font-weight: 600;
  border-radius: 4px;
  line-height: 1.2;
  text-transform: capitalize;
  border: 1px solid transparent;
  transition: all 0.15s ease;
}

.badge-type-mini {
  display: inline-block;
  font-size: 0.65rem;
  padding: 0.1rem 0.35rem;
  border-radius: 3px;
  font-weight: 600;
  letter-spacing: 0.3px;
  border: 1px solid transparent;
  line-height: 1;
}

.badge-type-acknowledge,
.badge-type-open {
  background-color: rgba(41, 156, 219, 0.14) !important;
  color: #299cdb !important;
  border-color: rgba(41, 156, 219, 0.3) !important;
}

.badge-type-assigned {
  background-color: rgba(101, 87, 247, 0.14) !important;
  color: #8c7cf0 !important;
  border-color: rgba(101, 87, 247, 0.32) !important;
}

.badge-type-progress,
.badge-type-in-progress {
  background-color: rgba(247, 184, 75, 0.14) !important;
  color: #f7b84b !important;
  border-color: rgba(247, 184, 75, 0.32) !important;
}

.badge-type-it-testing {
  background-color: rgba(2, 168, 181, 0.14) !important;
  color: #02a8b5 !important;
  border-color: rgba(2, 168, 181, 0.32) !important;
}

.badge-type-testing,
.badge-type-user-testing,
.badge-type-review {
  background-color: rgba(14, 165, 233, 0.14) !important;
  color: #0ea5e9 !important;
  border-color: rgba(14, 165, 233, 0.32) !important;
}

.badge-type-redo {
  background-color: rgba(240, 101, 72, 0.14) !important;
  color: #f06548 !important;
  border-color: rgba(240, 101, 72, 0.32) !important;
}

.badge-type-resolved,
.badge-type-accepted {
  background-color: rgba(10, 179, 156, 0.14) !important;
  color: #0ab39c !important;
  border-color: rgba(10, 179, 156, 0.32) !important;
}

.badge-type-deployed {
  background-color: rgba(64, 81, 137, 0.16) !important;
  color: #6a82d4 !important;
  border-color: rgba(64, 81, 137, 0.35) !important;
}

.badge-type-closed,
.badge-type-close {
  background-color: rgba(135, 138, 153, 0.14) !important;
  color: #9599ad !important;
  border-color: rgba(135, 138, 153, 0.28) !important;
}

.badge-type-cancelled {
  background-color: rgba(240, 101, 72, 0.16) !important;
  color: #f06548 !important;
  border-color: rgba(240, 101, 72, 0.35) !important;
}

.badge-type-none,
.badge-type-default {
  background-color: rgba(135, 138, 153, 0.1) !important;
  color: #878a99 !important;
  border-color: rgba(135, 138, 153, 0.2) !important;
}

/* Modal Dark Mode Theme Enhancements */
[data-bs-theme="dark"] .modal-content {
  background-color: var(--vz-modal-bg, #1a2234) !important;
  border-color: var(--vz-border-color, rgba(255, 255, 255, 0.12)) !important;
  color: var(--vz-body-color, #e9ebec) !important;
}

[data-bs-theme="dark"] .modal-header.bg-primary-subtle {
  background-color: rgba(64, 81, 137, 0.15) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
}

[data-bs-theme="dark"] .sequence-table-head th {
  background-color: rgba(255, 255, 255, 0.04) !important;
  color: #878a99 !important;
  border-color: rgba(255, 255, 255, 0.08) !important;
}

[data-bs-theme="dark"] .table-hover tbody tr:hover {
  background-color: rgba(255, 255, 255, 0.03) !important;
}

[data-bs-theme="dark"] .table td,
[data-bs-theme="dark"] .table th {
  border-color: rgba(255, 255, 255, 0.08) !important;
}

.color-swatch-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.color-swatch-btn:hover {
  transform: scale(1.1);
}

.active-swatch {
  border-color: var(--vz-primary, #405189) !important;
  box-shadow: 0 0 0 2px rgba(var(--vz-primary-rgb, 64, 81, 137), 0.3);
}

/* System Configuration & Theme Overrides (Prevents light background glitches) */
.form-control,
.form-select,
.search-box .form-control {
  background-color: var(--app-input-bg, var(--vz-input-bg, var(--vz-card-bg))) !important;
  border-color: var(--vz-input-border, var(--vz-border-color)) !important;
  color: var(--vz-body-color) !important;
  border-radius: var(--app-input-radius, 8px) !important;
  border-width: var(--app-input-border-width, 1px) !important;
}

.search-box .form-control::placeholder {
  color: var(--vz-input-placeholder-color, rgba(255, 255, 255, 0.5)) !important;
}

.search-box .form-control:focus,
.form-control:focus,
.form-select:focus {
  border-color: var(--vz-primary) !important;
  box-shadow: var(--app-input-focus-ring, 0 0 0 0.22rem rgba(var(--vz-primary-rgb), 0.22)) !important;
}

.btn {
  border-radius: var(--app-btn-radius, 8px);
}

.form-check-input {
  border-radius: var(--app-check-radius, 4px) !important;
  border-width: var(--app-check-border-width, 1.5px) !important;
}

.toolbar-container {
  background-color: transparent !important;
}

/* Workflow Button & Action Buttons (Dark Mode & Light Mode High Contrast) */
.btn-workflow {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: 600;
  font-size: 0.78rem;
  padding: 0.32rem 0.65rem;
  border-radius: var(--app-btn-radius, 6px);
  transition: all 0.2s ease-in-out;
}

[data-bs-theme="dark"] .btn-workflow,
[data-bs-theme="dark"] .btn-soft-primary {
  background-color: rgba(64, 81, 137, 0.3) !important;
  color: #9ab0ff !important;
  border: 1px solid rgba(154, 176, 255, 0.45) !important;
}

[data-bs-theme="dark"] .btn-workflow i,
[data-bs-theme="dark"] .btn-soft-primary i {
  color: #9ab0ff !important;
}

[data-bs-theme="dark"] .btn-workflow:hover,
[data-bs-theme="dark"] .btn-soft-primary:hover {
  background-color: #405189 !important;
  color: #ffffff !important;
  border-color: #5c74c9 !important;
  box-shadow: 0 0 12px rgba(154, 176, 255, 0.45) !important;
}

[data-bs-theme="dark"] .btn-workflow:hover i,
[data-bs-theme="dark"] .btn-soft-primary:hover i {
  color: #ffffff !important;
}

[data-bs-theme="light"] .btn-workflow,
[data-bs-theme="light"] .btn-soft-primary {
  background-color: rgba(64, 81, 137, 0.1) !important;
  color: #405189 !important;
  border: 1px solid rgba(64, 81, 137, 0.25) !important;
}

[data-bs-theme="light"] .btn-workflow:hover,
[data-bs-theme="light"] .btn-soft-primary:hover {
  background-color: #405189 !important;
  color: #ffffff !important;
  border-color: #405189 !important;
}

[data-bs-theme="dark"] .btn-ghost-secondary {
  color: #b0b8c4 !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  background-color: rgba(255, 255, 255, 0.04) !important;
}

[data-bs-theme="dark"] .btn-ghost-secondary:hover {
  background-color: rgba(255, 255, 255, 0.12) !important;
  color: #ffffff !important;
  border-color: rgba(255, 255, 255, 0.25) !important;
}

[data-bs-theme="dark"] .btn-ghost-primary {
  color: #9ab0ff !important;
  border: 1px solid rgba(154, 176, 255, 0.25) !important;
  background-color: rgba(64, 81, 137, 0.15) !important;
}

[data-bs-theme="dark"] .btn-ghost-primary:hover {
  background-color: #405189 !important;
  color: #ffffff !important;
}

[data-bs-theme="dark"] .btn-ghost-danger {
  color: #ff6b6b !important;
  border: 1px solid rgba(255, 107, 107, 0.25) !important;
  background-color: rgba(255, 107, 107, 0.06) !important;
}

[data-bs-theme="dark"] .btn-ghost-danger:hover {
  background-color: #f06548 !important;
  color: #ffffff !important;
}
</style>
