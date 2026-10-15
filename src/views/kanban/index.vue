<template>
  <Layout>
    <PageHeader title="Kanban Board" pageTitle="Tickets" />

    <!-- Top Board Control & Metrics Bar -->
    <BCard no-body class="shadow-sm border-0 mb-3">
      <BCardBody class="p-3">
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <!-- Board Selector & Current Board Info -->
          <div class="d-flex align-items-center flex-wrap gap-3">
            <div class="d-flex align-items-center gap-2">
              <div class="avatar-sm flex-shrink-0">
                <span class="avatar-title bg-primary-subtle text-primary rounded-circle fs-18">
                  <i class="ri-artboard-2-line"></i>
                </span>
              </div>
              <div>
                <div class="d-flex align-items-center gap-2">
                  <h5 class="fs-16 fw-bold mb-0 text-body">
                    {{ currentBoard?.name || 'Loading Board...' }}
                  </h5>
                  <span
                    v-if="currentBoard"
                    class="badge px-2 py-1 fs-11 text-uppercase"
                    :class="currentBoard.status ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'"
                  >
                    {{ currentBoard.status ? 'Active' : 'Inactive' }}
                  </span>
                </div>
                <small class="text-muted">
                  Workflow Pipeline with <strong>{{ stages.length }}</strong> stages &bull;
                  <strong>{{ totalBoardTickets }}</strong> tickets
                </small>
              </div>
            </div>


          </div>

          <!-- Quick Actions & Global Add -->
          <div class="d-flex align-items-center gap-2 ms-auto flex-wrap">
            <button
              type="button"
              class="btn btn-sm btn-outline-primary btn-icon kanban-refresh-btn shadow-sm"
              :disabled="loading"
              @click="reloadBoardData"
              title="Refresh tickets and stages"
              aria-label="Refresh tickets and stages"
            >
              <i class="ri-refresh-line" :class="{ 'ri-spin': loading }"></i>
            </button>

            <button
              type="button"
              class="btn btn-sm btn-primary d-flex align-items-center gap-1 shadow-sm"
              v-if="ticketAccess.add"
              :disabled="loading || !ticketAccess.add"
              @click="openCreateTicketModal()"
            >
              <i class="ri-add-line fs-14"></i>
              <span>Create Ticket</span>
            </button>
          </div>
        </div>

        <!-- Filter & Search Sub-bar -->
        <div class="pt-2 mt-2">
          <BRow class="g-2 align-items-center">
            <!-- Search -->
            <BCol xl="3" lg="5" md="6" sm="12">
              <div class="search-box">
                <input
                  type="text"
                  class="form-control form-control-sm search"
                  placeholder="Search ref no, subject, summary, module..."
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

            <!-- Board Filter -->
            <BCol xl="2" lg="2" md="3" sm="6">
              <select
                class="form-select form-select-sm"
                :value="currentBoard?.id || ''"
                aria-label="Select board"
                @change="switchBoardById($event.target.value)"
              >
                <option value="" disabled>Select Board</option>
                <option v-for="board in boardsList" :key="board.id" :value="board.id">
                  {{ board.name }}
                </option>
              </select>
            </BCol>

            <!-- Type Filter -->
            <BCol xl="2" lg="2" md="3" sm="6">
              <select class="form-select form-select-sm" v-model="filterType">
                <option value="All">All {{ isSystemBoard ? 'Ticket Types' : 'Issue Types' }}</option>
                <option v-for="typ in typeFilterOptions" :key="typ.value" :value="typ.value">
                  {{ typ.label }}
                </option>
              </select>
            </BCol>

            <!-- Issue Type Filter -->
            <BCol xl="2" lg="2" md="3" sm="6">
              <select class="form-select form-select-sm" v-model="filterIssueType">
                <option value="All">All Issue Types</option>
                <option v-for="typ in lookups.types" :key="typ.issue_id" :value="typ.issue_desc">
                  {{ typ.issue_desc }}
                </option>
              </select>
            </BCol>

            <!-- Priority / Severity Filter -->
            <BCol xl="2" lg="2" md="3" sm="6">
              <select class="form-select form-select-sm" v-model="filterSeverity">
                <option value="All">All Severities</option>
                <option v-for="sev in lookups.severities" :key="sev.id" :value="sev.name">
                  {{ sev.name }} Priority
                </option>
              </select>
            </BCol>

            <BCol xl="1" lg="2" class="text-end ms-auto">
              <span class="text-muted fs-12">
                Showing <strong>{{ totalFilteredTickets }}</strong> tickets
              </span>
            </BCol>
          </BRow>
        </div>
      </BCardBody>
    </BCard>

    <!-- Loading State -->
    <div v-if="loading && (!stages || stages.length === 0)" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="text-muted mt-2 mb-0">Loading board workflow stages and tickets...</p>
    </div>

    <div v-else-if="!ticketAccess.view" class="alert alert-warning d-flex align-items-center gap-2 mt-3">
      <i class="ri-lock-line fs-18"></i>
      <span>You do not have permission to view the Kanban Board.</span>
    </div>

    <!-- Empty Board Notice -->
    <div
      v-else-if="!stages || stages.length === 0"
      class="text-center py-5 card rounded shadow-sm border"
    >
      <i class="ri-artboard-line display-4 text-muted mb-3 d-inline-block"></i>
      <h5 class="fw-bold">No Workflow Stages Found</h5>
      <p class="text-muted mb-3">
        The board <strong>{{ currentBoard?.name }}</strong> does not have any workflow stages configured yet.
      </p>
    </div>

    <!-- Kanban Columns Board Container -->
    <div v-else class="kanban-board-container pb-4">
      <div class="kanban-scroll-track d-flex align-items-start gap-3">
        <!-- Render Each Workflow Stage in its sequence order -->
        <div
          v-for="stage in stages"
          :key="stage.id"
          class="kanban-column flex-shrink-0"
          :class="{
            'kanban-column-disabled': isStageDisabledDuringDrag(stage),
            'kanban-column-next-stage': isStageNextDuringDrag(stage)
          }"
        >
          <!-- Column Header Card -->
          <div
            class="kanban-column-header shadow-sm rounded-top border p-2 mb-2"
            :class="{
              'border-success': isStageNextDuringDrag(stage),
              'border-danger-subtle opacity-75': isStageDisabledDuringDrag(stage)
            }"
            :style="{ borderTop: `3px solid ${resolveStatusHexColor(stage.color)} !important` }"
          >
            <div class="d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center gap-2 min-w-0">
                <span
                  class="stage-color-dot rounded-circle flex-shrink-0"
                  :style="{ backgroundColor: resolveStatusHexColor(stage.color) }"
                ></span>
                <span
                  class="fs-13 fw-bold text-uppercase text-truncate mb-0"
                  :title="stage.name"
                >
                  {{ stage.name }}
                </span>
                <span
                  v-if="isStageNextDuringDrag(stage)"
                  class="badge bg-success text-white fs-10 px-1 py-0 animate-pulse"
                >
                  <i class="ri-arrow-right-line me-1"></i>Next
                </span>
                <span
                  v-else-if="isStageDisabledDuringDrag(stage)"
                  class="badge bg-danger-subtle text-danger fs-10 px-1 py-0"
                  title="Skipping to this stage is not permitted"
                >
                  <i class="ri-forbid-line"></i>
                </span>
              </div>

              <div class="d-flex align-items-center gap-1 ms-auto">
                <span
                  class="badge rounded-pill fs-11"
                  :style="{
                    backgroundColor: `${resolveStatusHexColor(stage.color)}20`,
                    color: resolveStatusHexColor(stage.color),
                    border: `1px solid ${resolveStatusHexColor(stage.color)}40`
                  }"
                >
                  {{ getStageTickets(stage.id).length }}
                </span>
              </div>
            </div>

            <!-- Stage metadata sub-strip -->
            <div class="d-flex align-items-center justify-content-between mt-1 pt-1 border-top kanban-sub-divider fs-11 text-muted">
              <span>Step #{{ stage.order }}</span>
              <span
                v-if="stage.type"
                class="badge badge-stage-type text-uppercase px-1 py-0 fs-10"
              >
                {{ stage.type }}
              </span>
            </div>
          </div>

          <!-- Draggable Tickets Column Body -->
          <div class="kanban-cards-wrapper px-1">
            <draggable
              :list="stageTicketsMap[stage.id]"
              group="tickets-group"
              item-key="id"
              class="kanban-drag-area"
              :data-stage-id="stage.id"
              :empty-insert-threshold="15"
              :move="checkMovePermission"
              @start="onDragStart"
              @end="onDragEnd"
              @change="(event) => onTicketDragChange(event, stage)"
            >
              <!-- Ticket Card Component -->
              <div
                v-for="ticket in stageTicketsMap[stage.id]"
                :key="ticket.id"
                :data-ticket-id="ticket.id"
                class="kanban-card card border shadow-sm mb-2 cursor-pointer"
                @click="openTicketDetails(ticket)"
              >
                <div class="card-body p-3">
                  <!-- Header: Ref No & Priority & Actions -->
                  <div class="d-flex align-items-center justify-content-between mb-2">
                    <span class="badge bg-primary-subtle text-primary border border-primary-subtle fw-medium fs-11">
                      #{{ ticket.ref_no || `TKT-${ticket.id}` }}
                    </span>

                    <div class="d-flex align-items-center gap-1" @click.stop>
                      <span
                        class="badge px-2 py-1 fs-10 text-uppercase"
                        :class="getSeverityBadgeClass(ticket.severity_name)"
                      >
                        {{ ticket.severity_name || 'Medium' }}
                      </span>

                      <!-- Card Dropdown Menu -->
                      <BDropdown
                        variant="link"
                        size="sm"
                        toggle-class="text-muted p-0 shadow-none border-0 arrow-none"
                        menu-class="dropdown-menu-end"
                      >
                        <template #button-content>
                          <i class="ri-more-2-fill fs-14"></i>
                        </template>
                        <BDropdownItem v-if="ticketAccess.view" @click="openTicketDetails(ticket)">
                          <i class="ri-eye-line me-2 text-primary"></i> View Details
                        </BDropdownItem>
                        <BDropdownItem v-if="ticketAccess.edit" @click="openEditTicketModal(ticket)">
                          <i class="ri-pencil-line me-2 text-warning"></i> Edit Ticket
                        </BDropdownItem>
                        <BDropdownDivider />
                        <BDropdownItem v-if="ticketAccess.delete" @click="deleteTicket(ticket)" class="text-danger">
                          <i class="ri-delete-bin-line me-2"></i> Delete
                        </BDropdownItem>
                      </BDropdown>
                    </div>
                  </div>

                  <!-- Subject / Title -->
                  <h6 class="fs-13 fw-semibold text-body mb-1 text-truncate-2" :title="ticket.subject">
                    {{ ticket.subject }}
                  </h6>

                  <!-- Summary Snippet -->
                  <p class="fs-12 text-muted mb-2 text-truncate-2">
                    {{ ticket.summary || 'No description provided.' }}
                  </p>

                  <!-- Tags: System & Module -->
                  <div class="d-flex flex-wrap align-items-center gap-1 mb-2">
                    <span
                      v-if="ticket.system"
                      class="badge bg-secondary-subtle text-secondary fs-10"
                    >
                      <i class="ri-computer-line me-1"></i>{{ ticket.system }}
                    </span>
                    <span
                      v-if="ticket.type_name && ticket.type_name !== 'General'"
                      class="badge bg-primary-subtle text-primary fs-10"
                    >
                      {{ ticket.type_name }}
                    </span>
                  </div>

                  <!-- Card Footer: Date & Assignees -->
                  <div class="d-flex align-items-center justify-content-between pt-2 border-top kanban-sub-divider fs-11 text-muted">
                    <div class="d-flex align-items-center gap-1">
                      <i class="ri-calendar-line"></i>
                      <span>{{ formatDate(ticket.date_encountered || ticket.created_at) }}</span>
                    </div>

                    <!-- Assignees with perfect circular 2-character initials avatar -->
                    <div class="avatar-group" v-if="ticket.assignees && ticket.assignees.length">
                      <span
                        v-for="user in ticket.assignees.slice(0, 3)"
                        :key="user.id"
                        class="avatar-group-item avatar-user-circle"
                        :title="user.fullname || user.name"
                      >
                        <span
                          class="avatar-initials-badge"
                          :class="getUserAvatarClass(user)"
                        >
                          {{ getUserInitials(user) }}
                        </span>
                      </span>
                      <span
                        v-if="ticket.assignees.length > 3"
                        class="avatar-group-item avatar-user-circle avatar-initials-badge bg-secondary-subtle text-secondary"
                      >
                        +{{ ticket.assignees.length - 3 }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Empty Stage Placeholder -->
              <div
                v-if="!stageTicketsMap[stage.id] || stageTicketsMap[stage.id].length === 0"
                class="empty-column-placeholder text-center p-3 rounded border border-dashed text-muted mb-2"
              >
                <i class="ri-inbox-line fs-18 mb-1 d-block opacity-50"></i>
                <span class="fs-11">No tickets in this stage</span>
              </div>
            </draggable>
          </div>
        </div>

        <!-- Optional Unassigned / Backlog Column if any tickets have no valid board stage -->
        <div
          v-if="unassignedTickets.length > 0"
          class="kanban-column flex-shrink-0"
        >
          <div class="kanban-column-header shadow-sm rounded-top border p-2 mb-2 border-top border-warning">
            <div class="d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center gap-2 min-w-0">
                <span class="stage-color-dot rounded-circle bg-warning"></span>
                <span class="fs-13 fw-bold text-uppercase text-truncate mb-0">Unassigned / Backlog</span>
                <span class="badge bg-warning-subtle text-warning rounded-pill fs-11">
                  {{ unassignedTickets.length }}
                </span>
              </div>
            </div>
            <div class="mt-1 pt-1 border-top kanban-sub-divider fs-11 text-muted">
              <span>Tickets not assigned to this board</span>
            </div>
          </div>

          <div class="kanban-cards-wrapper px-1">
            <draggable
              :list="unassignedTickets"
              group="tickets-group"
              item-key="id"
              class="kanban-drag-area"
              data-stage-id="unassigned"
              :empty-insert-threshold="15"
              :move="checkMovePermission"
              @start="onDragStart"
              @end="onDragEnd"
              @change="(event) => onTicketDragChange(event, null)"
            >
              <div
                v-for="ticket in unassignedTickets"
                :key="ticket.id"
                :data-ticket-id="ticket.id"
                class="kanban-card card border shadow-sm mb-2 cursor-pointer"
                @click="openTicketDetails(ticket)"
              >
                <div class="card-body p-3">
                  <div class="d-flex align-items-center justify-content-between mb-2">
                    <span class="badge bg-primary-subtle text-primary border border-primary-subtle fw-medium fs-11">
                      #{{ ticket.ref_no || `TKT-${ticket.id}` }}
                    </span>
                    <span
                      class="badge px-2 py-1 fs-10 text-uppercase"
                      :class="getSeverityBadgeClass(ticket.severity_name)"
                    >
                      {{ ticket.severity_name || 'Medium' }}
                    </span>
                  </div>
                  <h6 class="fs-13 fw-semibold text-body mb-1 text-truncate-2">
                    {{ ticket.subject }}
                  </h6>
                  <p class="fs-12 text-muted mb-2 text-truncate-2">
                    {{ ticket.summary }}
                  </p>
                  <div class="d-flex align-items-center justify-content-between pt-2 border-top kanban-sub-divider fs-11 text-muted">
                    <div class="d-flex align-items-center gap-1">
                      <i class="ri-calendar-line"></i>
                      <span>{{ formatDate(ticket.date_encountered || ticket.created_at) }}</span>
                    </div>

                    <!-- Assignees with perfect circular 2-character initials avatar -->
                    <div class="avatar-group" v-if="ticket.assignees && ticket.assignees.length">
                      <span
                        v-for="user in ticket.assignees.slice(0, 3)"
                        :key="user.id"
                        class="avatar-group-item avatar-user-circle"
                        :title="user.fullname || user.name"
                      >
                        <span
                          class="avatar-initials-badge"
                          :class="getUserAvatarClass(user)"
                        >
                          {{ getUserInitials(user) }}
                        </span>
                      </span>
                      <span
                        v-if="ticket.assignees.length > 3"
                        class="avatar-group-item avatar-user-circle avatar-initials-badge bg-secondary-subtle text-secondary"
                      >
                        +{{ ticket.assignees.length - 3 }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </draggable>
          </div>
        </div>
      </div>
    </div>

    <!-- Create / Edit Ticket Modal -->
    <BModal
      v-model="ticketModalShow"
      id="ticketModal"
      modal-class="zoomIn"
      :title="isEditing ? 'Edit Ticket' : 'Create Ticket'"
      title-class="exampleModalLabel fw-bold fs-16"
      header-class="p-3 bg-primary-subtle"
      class="v-modal-custom"
      size="lg"
      centered
      hide-footer
      no-close-on-backdrop
    >
      <form @submit.prevent="saveTicketForm">
        <BRow class="g-3">
          <BCol lg="12">
            <label class="form-label fs-13 fw-medium">Subject <span class="text-danger">*</span></label>
            <input
              type="text"
              class="form-control"
              v-model="ticketForm.subject"
              placeholder="Brief summary of the issue or task"
              required
            />
          </BCol>

          <BCol lg="12">
            <label class="form-label fs-13 fw-medium">Detailed Summary <span class="text-danger">*</span></label>
            <textarea
              class="form-control"
              rows="3"
              v-model="ticketForm.summary"
              placeholder="Describe the issue, steps to reproduce, or requirements..."
              required
            ></textarea>
          </BCol>

          <BCol lg="6" sm="12">
            <label class="form-label fs-13 fw-medium">Workflow Stage (Status)</label>
            <select class="form-select" v-model="ticketForm.board_status_id">
              <option v-for="st in stages" :key="st.id" :value="st.id">
                {{ st.name }} (Step #{{ st.order }})
              </option>
            </select>
          </BCol>

          <BCol lg="6" sm="12">
            <label class="form-label fs-13 fw-medium">Priority / Severity</label>
            <select class="form-select" v-model="ticketForm.issue_severity_id">
              <option v-for="sev in lookups.severities" :key="sev.id" :value="sev.id">
                {{ sev.name }}
              </option>
            </select>
          </BCol>

          <BCol lg="6" sm="12">
            <label class="form-label fs-13 fw-medium">Issue Type</label>
            <select class="form-select" v-model="ticketForm.issue_type_id">
              <option v-for="typ in lookups.types" :key="typ.issue_id" :value="typ.issue_id">
                {{ typ.issue_desc }}
              </option>
            </select>
          </BCol>

          <BCol lg="6" sm="12">
            <label class="form-label fs-13 fw-medium">System <span class="text-danger">*</span></label>
            <select class="form-select" v-model="ticketForm.system" required>
              <option value="" disabled>Select System</option>
              <option
                v-for="sys in lookups.systems"
                :key="sys.id"
                :value="sys.code || sys.name"
              >
                {{ sys.name }} ({{ sys.code }})
              </option>
            </select>
          </BCol>

          <BCol lg="6" sm="12">
            <label class="form-label fs-13 fw-medium">Date Encountered</label>
            <input
              type="date"
              class="form-control"
              v-model="ticketForm.date_encountered"
            />
          </BCol>

          <!-- Drag & Drop File Attachment -->
          <BCol lg="12">
            <div>
              <label class="form-label fs-13 fw-medium d-flex align-items-center justify-content-between mb-1">
                <span><i class="ri-attachment-2 me-1"></i> File Attachment</span>
                <span class="text-muted fs-11 fw-normal">Max 10MB per file</span>
              </label>

              <!-- Drag & Drop Area -->
              <div
                class="ticket-dropzone rounded p-3 text-center border-dashed position-relative cursor-pointer"
                :class="{ 'dropzone-active': isFileDragOver }"
                @dragover.prevent="isFileDragOver = true"
                @dragleave.prevent="isFileDragOver = false"
                @drop.prevent="handleFileDrop"
                @click="triggerFileInput"
              >
                <input
                  type="file"
                  ref="fileInputRef"
                  multiple
                  class="d-none"
                  @change="handleFileSelect"
                />
                <div class="py-2">
                  <div class="mb-2">
                    <i class="ri-upload-cloud-2-line display-5 text-primary opacity-75"></i>
                  </div>
                  <h6 class="fs-13 fw-semibold mb-1">
                    Drag &amp; Drop File Attachment here or <span class="text-primary text-decoration-underline">browse</span>
                  </h6>
                  <p class="text-muted fs-11 mb-0">
                    Supports PNG, JPG, PDF, DOCX, TXT, LOG, ZIP
                  </p>
                </div>
              </div>

              <!-- Attachment Previews List -->
              <div v-if="attachedFiles.length > 0" class="vstack gap-2 mt-2">
                <div
                  v-for="(file, idx) in attachedFiles"
                  :key="idx"
                  class="border rounded p-2 d-flex align-items-center justify-content-between bg-light-subtle"
                >
                  <div class="d-flex align-items-center gap-2 min-w-0">
                    <div class="avatar-xs flex-shrink-0">
                      <span class="avatar-title bg-primary-subtle text-primary rounded fs-16">
                        <i :class="getFileIconClass(file.name)"></i>
                      </span>
                    </div>
                    <div class="min-w-0">
                      <h6 class="fs-12 mb-0 text-truncate" :title="file.name">{{ file.name }}</h6>
                      <small class="text-muted fs-10">{{ formatFileSize(file.size) }}</small>
                    </div>
                  </div>
                  <button
                    type="button"
                    class="btn btn-sm btn-ghost-danger p-1 rounded-circle"
                    @click.stop="removeAttachedFile(idx)"
                    title="Remove file"
                  >
                    <i class="ri-close-line fs-14"></i>
                  </button>
                </div>
              </div>
            </div>
          </BCol>

          <!-- Assigned Team Members (below the Drag & Drop File Attachment) -->
          <BCol lg="12">
            <div>
              <label class="form-label fs-13 fw-medium">Assigned Team Members</label>
              <Multiselect
                v-model="ticketForm.assignees"
                mode="tags"
                :close-on-select="false"
                :searchable="true"
                :options="lookups.users.map((u) => ({ value: u.id, label: u.fullname || u.name }))"
                placeholder="Select assignees"
              />
            </div>
          </BCol>
        </BRow>

        <div class="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
          <button type="button" class="btn btn-light" @click="ticketModalShow = false">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary" :disabled="submitting">
            <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
            <span>{{ isEditing ? 'Save Changes' : 'Create Ticket' }}</span>
          </button>
        </div>
      </form>
    </BModal>

    <!-- Ticket Quick View Detail Modal -->
    <BModal
      v-model="detailModalShow"
      id="detailModal"
      modal-class="zoomIn"
      :title="`Ticket Details #${activeTicket?.ref_no || activeTicket?.id}`"
      title-class="exampleModalLabel fw-bold fs-16"
      header-class="p-3 bg-primary-subtle"
      class="v-modal-custom"
      size="lg"
      centered
      hide-footer
    >
      <div v-if="activeTicket" class="ticket-detail-content">
        <!-- Title & Badges -->
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 pb-2 border-bottom">
          <div>
            <h5 class="fw-bold text-body mb-1">{{ activeTicket.subject }}</h5>
            <small class="text-muted">
              Reference: <strong class="text-primary">{{ activeTicket.ref_no }}</strong> &bull;
              Created: {{ formatDate(activeTicket.created_at) }}
            </small>
          </div>
          <div class="d-flex align-items-center gap-2">
            <span
              class="badge px-2 py-1 fs-12 text-uppercase"
              :class="getStatusBadgeClass(activeTicket.status_color)"
              :style="getStatusBadgeStyle(activeTicket.status_color)"
            >
              {{ activeTicket.status_name || 'Open' }}
            </span>
            <span
              class="badge px-2 py-1 fs-12 text-uppercase"
              :class="getSeverityBadgeClass(activeTicket.severity_name)"
            >
              {{ activeTicket.severity_name || 'Medium' }}
            </span>
          </div>
        </div>

        <!-- Summary -->
        <div class="mb-4">
          <h6 class="fs-12 text-uppercase text-muted fw-bold mb-2">Summary & Description</h6>
          <div class="p-3 rounded text-body fs-13 whitespace-pre-wrap detail-summary-box">
            {{ activeTicket.summary }}
          </div>
        </div>

        <!-- Metadata Grid -->
        <BRow class="g-3 mb-4">
          <BCol md="4" sm="6">
            <div class="p-2 border rounded meta-box">
              <span class="fs-11 text-muted text-uppercase d-block mb-1">System</span>
              <strong class="fs-13 text-body">{{ activeTicket.system || 'N/A' }}</strong>
            </div>
          </BCol>
          <BCol md="4" sm="6">
            <div class="p-2 border rounded meta-box">
              <span class="fs-11 text-muted text-uppercase d-block mb-1">Module</span>
              <strong class="fs-13 text-body">{{ activeTicket.module || 'N/A' }}</strong>
            </div>
          </BCol>
          <BCol md="4" sm="6">
            <div class="p-2 border rounded meta-box">
              <span class="fs-11 text-muted text-uppercase d-block mb-1">Issue Type</span>
              <strong class="fs-13 text-body">{{ activeTicket.type_name || 'General' }}</strong>
            </div>
          </BCol>
          <BCol md="4" sm="6">
            <div class="p-2 border rounded meta-box">
              <span class="fs-11 text-muted text-uppercase d-block mb-1">Date Encountered</span>
              <strong class="fs-13 text-body">{{ formatDate(activeTicket.date_encountered) }}</strong>
            </div>
          </BCol>
          <BCol md="4" sm="6">
            <div class="p-2 border rounded meta-box">
              <span class="fs-11 text-muted text-uppercase d-block mb-1">Reported By</span>
              <strong class="fs-13 text-body">{{ activeTicket.creator?.fullname || activeTicket.creator?.name || 'Admin' }}</strong>
            </div>
          </BCol>
          <BCol md="4" sm="6">
            <div class="p-2 border rounded meta-box">
              <span class="fs-11 text-muted text-uppercase d-block mb-1">Assigned To</span>
              <div class="d-flex align-items-center gap-1 flex-wrap">
                <span
                  v-for="u in activeTicket.assignees || []"
                  :key="u.id"
                  class="badge bg-primary-subtle text-primary fs-11"
                >
                  {{ u.fullname || u.name }}
                </span>
                <span v-if="!activeTicket.assignees || activeTicket.assignees.length === 0" class="text-muted fs-12">
                  Unassigned
                </span>
              </div>
            </div>
          </BCol>
        </BRow>

        <!-- Actions -->
        <div class="d-flex justify-content-between align-items-center pt-3 border-top">
          <router-link
            :to="`/tickets/details?id=${activeTicket.id}`"
            class="btn btn-sm btn-outline-primary"
          >
            <i class="ri-external-link-line me-1"></i> Open Full Ticket Page
          </router-link>

          <div class="d-flex gap-2">
            <button
              type="button"
              class="btn btn-sm btn-outline-warning"
              v-if="ticketAccess.edit"
              @click="detailModalShow = false; openEditTicketModal(activeTicket)"
            >
              <i class="ri-pencil-line me-1"></i> Edit
            </button>
            <button
              type="button"
              class="btn btn-sm btn-secondary"
              @click="detailModalShow = false"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </BModal>
  </Layout>
</template>

<script>
import axios from "axios";
import Swal from "sweetalert2";
import { VueDraggableNext } from "vue-draggable-next";
import Multiselect from "@vueform/multiselect";
import "@vueform/multiselect/themes/default.css";
import Layout from "@/layouts/main.vue";
import PageHeader from "@/components/page-header";

export default {
  name: "KanbanBoard",
  components: {
    Layout,
    PageHeader,
    draggable: VueDraggableNext,
    Multiselect,
  },
  data() {
    return {
      loading: true,
      ticketRequestId: 0,
      boardsList: [],
      currentBoard: null,
      stages: [],
      tickets: [],
      stageTicketsMap: {},
      unassignedTickets: [],

      // Dragging tracking state
      isDragging: false,
      draggingTicket: null,

      // Filters
      searchQuery: "",
      filterSeverity: "All",
      filterType: "All",
      filterIssueType: "All",

      // Lookups
      lookups: {
        severities: [],
        types: [],
        users: [],
        systems: [],
        tktTypes: [],
      },
      menuPermissions: null,

      // Modal states
      ticketModalShow: false,
      detailModalShow: false,
      isEditing: false,
      submitting: false,
      activeTicket: null,
      attachedFiles: [],
      isFileDragOver: false,

      ticketForm: {
        id: null,
        subject: "",
        summary: "",
        board_status_id: null,
        issue_severity_id: null,
        issue_type_id: null,
        system: "Web",
        module: "tickets",
        date_encountered: "",
        assignees: [],
      },
    };
  },
  computed: {
    apiBase() {
      return process.env.VUE_APP_AUTHDOMAIN || "http://localhost:8001/api";
    },

    totalBoardTickets() {
      return this.tickets.length;
    },

    totalFilteredTickets() {
      let count = 0;
      Object.values(this.stageTicketsMap).forEach((list) => {
        count += (list || []).length;
      });
      count += (this.unassignedTickets || []).length;
      return count;
    },

    isSystemBoard() {
      return String(this.currentBoard?.name || '').toLowerCase() === 'system' || Number(this.currentBoard?.id) === 1;
    },

    typeFilterOptions() {
      if (this.isSystemBoard) {
        return this.lookups.tktTypes
          .filter((type) => type.board_id == null || Number(type.board_id) === Number(this.currentBoard?.id))
          .map((type) => ({ value: type.name, label: type.name }));
      }
      return this.lookups.types
        .filter((type) => type.board_id == null || type.board_id === "" || Number(type.board_id) === Number(this.currentBoard?.id))
        .map((type) => ({ value: type.issue_desc, label: type.issue_desc }));
    },

    ticketAccess() {
      const rawUser = sessionStorage.getItem("authUser") || localStorage.getItem("user");
      let user = null;
      try { user = rawUser ? JSON.parse(rawUser) : null; } catch (error) { user = null; }
      if (String(user?.role || "").toLowerCase() === "admin") {
        return { view: true, add: true, edit: true, delete: true };
      }
      try {
        const permissions = this.menuPermissions || JSON.parse(sessionStorage.getItem("user_menu_permissions") || "[]");
        const menus = permissions.map((menu) => ({
          ...menu,
          code: String(menu.code || "").toLowerCase(),
          url: String(menu.url || "").replace(/\/+$/, "").toLowerCase(),
        }));
        const kanbanMenu = menus.find((menu) => menu.code.includes("kanban")) || menus.find((menu) => menu.url === "/kanban");
        return {
          view: Boolean(kanbanMenu?.can_view),
          add: Boolean(kanbanMenu?.can_add),
          edit: Boolean(kanbanMenu?.can_edit),
          delete: Boolean(kanbanMenu?.can_delete),
        };
      } catch (error) {
        return { view: false, add: false, edit: false, delete: false };
      }
    },

    currentUserId() {
      const rawUser = sessionStorage.getItem("authUser") || localStorage.getItem("user");
      try { return rawUser ? Number(JSON.parse(rawUser).id) : null; } catch (error) { return null; }
    },

    isAdmin() {
      const rawUser = sessionStorage.getItem("authUser") || localStorage.getItem("user");
      try { return String(JSON.parse(rawUser || "{}").role || "").toLowerCase() === "admin"; } catch (error) { return false; }
    },
  },
  watch: {
    "$route.query.board"(newBoard) {
      if (newBoard) {
        this.selectBoardByQuery(newBoard);
      }
    },
    searchQuery() {
      this.distributeTicketsToStages();
    },
    filterSeverity() {
      this.distributeTicketsToStages();
    },
    filterType() {
      this.distributeTicketsToStages();
    },
    filterIssueType() {
      this.distributeTicketsToStages();
    },
  },
  async mounted() {
    await Promise.all([
      this.loadMenuPermissions(),
      this.fetchLookups(),
    ]);
    await this.fetchBoards();
  },
  methods: {
    getAuthHeaders() {
      const token = localStorage.getItem("jwt") || localStorage.getItem("token");
      return token ? { Authorization: `Bearer ${token}` } : {};
    },

    async loadMenuPermissions() {
      if (!this.getAuthHeaders().Authorization) return;
      try {
        const response = await axios.get(`${this.apiBase}/user/menu-access`, { headers: this.getAuthHeaders() });
        this.menuPermissions = response.data?.menus || [];
        sessionStorage.setItem("user_menu_permissions", JSON.stringify(this.menuPermissions));
      } catch (error) {
        this.menuPermissions = null;
      }
    },

    formatDate(d) {
      if (!d) return "N/A";
      try {
        const date = new Date(d);
        if (isNaN(date.getTime())) return d;
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      } catch (e) {
        return d;
      }
    },

    getUserInitials(user) {
      if (!user) return "??";
      const name = (user.fullname || user.name || "").trim();
      if (!name) return "??";
      const parts = name.split(/\s+/).filter(Boolean);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    },

    getUserAvatarClass(user) {
      const palette = [
        "bg-primary-subtle text-primary",
        "bg-success-subtle text-success",
        "bg-info-subtle text-info",
        "bg-warning-subtle text-warning",
        "bg-danger-subtle text-danger",
        "bg-secondary-subtle text-secondary",
      ];
      const id = Number(user?.id) || 0;
      return palette[id % palette.length];
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
      if (c === "info") return "bg-info-subtle text-info";
      if (c === "primary") return "bg-primary-subtle text-primary";
      if (c === "warning") return "bg-warning-subtle text-warning";
      if (c === "danger") return "bg-danger-subtle text-danger";
      if (c === "success") return "bg-success-subtle text-success";
      return "bg-secondary-subtle text-secondary";
    },

    getStatusBadgeStyle(color) {
      if (color && color.trim().startsWith("#")) {
        const hex = color.trim();
        return {
          backgroundColor: `${hex}20`,
          color: hex,
          border: `1px solid ${hex}40`,
        };
      }
      return {};
    },

    getSeverityBadgeClass(sev) {
      const s = (sev || "").toLowerCase();
      if (s === "critical" || s === "high") return "bg-danger-subtle text-danger border border-danger-subtle";
      if (s === "medium") return "bg-warning-subtle text-warning border border-warning-subtle";
      if (s === "low") return "bg-success-subtle text-success border border-success-subtle";
      return "bg-secondary-subtle text-secondary";
    },

    async fetchLookups() {
      try {
        const res = await axios.get(`${this.apiBase}/tickets/lookups`, {
          headers: this.getAuthHeaders(),
        });
        if (res.data) {
          this.lookups.severities = res.data.severities || [];
          this.lookups.types = res.data.types || [];
          this.lookups.users = res.data.users || [];
          this.lookups.systems = res.data.systems || [];
          this.lookups.tktTypes = res.data.tkt_types || [];
        }

        try {
          const sysRes = await axios.get(`${this.apiBase}/user/systems`, {
            headers: this.getAuthHeaders(),
          });
          if (sysRes.data?.data && sysRes.data.data.length > 0) {
            this.lookups.systems = sysRes.data.data;
          }
        } catch (e) {
          // Keep existing systems from lookups
        }
      } catch (e) {
        console.error("Failed to load ticket lookups:", e);
      }
    },

    async fetchBoards() {
      this.loading = true;
      try {
        const res = await axios.get(`${this.apiBase}/boards`, {
          headers: this.getAuthHeaders(),
        });
        this.boardsList = res.data?.data || [];

        // Determine which board to load
        const targetBoardParam = this.$route.query.board || this.getDefaultCategoryId() || "system";
        await this.selectBoardByQuery(targetBoardParam);
      } catch (err) {
        console.error("Error fetching boards:", err);
      } finally {
        this.loading = false;
      }
    },

    getDefaultCategoryId() {
      const rawUser = sessionStorage.getItem("authUser") || localStorage.getItem("user");
      try {
        const user = rawUser ? JSON.parse(rawUser) : null;
        const assignment = (user?.assignments || []).find(
          (item) => item.reference === "category" && Boolean(item.default)
        );
        return assignment?.reference_code ? Number(assignment.reference_code) : null;
      } catch (error) {
        return null;
      }
    },

    async selectBoardByQuery(queryStr) {
      if (!this.boardsList.length) return;

      const q = String(queryStr).toLowerCase().trim();
      let matched = null;

      // 1. Match by numeric ID
      if (!isNaN(q) && Number(q) > 0) {
        matched = this.boardsList.find((b) => b.id === Number(q));
      }

      // 2. Match by exact board name
      if (!matched) {
        matched = this.boardsList.find(
          (b) => b.name.toLowerCase() === q
        );
      }

      // 3. Match by partial board name
      if (!matched) {
        matched = this.boardsList.find((b) =>
          b.name.toLowerCase().includes(q)
        );
      }

      // 4. Default to first active board or first board
      if (!matched) {
        matched = this.boardsList.find((b) => b.status) || this.boardsList[0];
      }

      if (matched) {
        if (Number(this.currentBoard?.id) === Number(matched.id)) return;
        this.currentBoard = matched;
        this.filterType = "All";
        this.filterIssueType = "All";
        this.stages = (matched.statuses || []).slice().sort((a, b) => a.order - b.order);
        await this.fetchTicketsForBoard();
      }
    },

    async switchBoard(board) {
      this.currentBoard = board;
      this.filterType = "All";
      this.filterIssueType = "All";
      this.stages = (board.statuses || []).slice().sort((a, b) => a.order - b.order);

      // Update URL query
      const boardQuery = board.name.toLowerCase();
      if (String(this.$route.query.board || "").toLowerCase() !== boardQuery) {
        await this.$router.push({
          path: "/kanban",
          query: { board: boardQuery },
        });
      }

      await this.fetchTicketsForBoard();
    },

    async switchBoardById(boardId) {
      const board = this.boardsList.find((item) => Number(item.id) === Number(boardId));
      if (board) await this.switchBoard(board);
    },

    async reloadBoardData() {
      this.loading = true;
      try {
        // Refresh the board details
        if (this.currentBoard) {
          const bRes = await axios.get(`${this.apiBase}/boards/${this.currentBoard.id}`, {
            headers: this.getAuthHeaders(),
          });
          if (bRes.data?.data) {
            this.currentBoard = bRes.data.data;
            this.stages = (bRes.data.data.statuses || []).slice().sort((a, b) => a.order - b.order);
          }
        }
        await this.fetchTicketsForBoard();
      } catch (e) {
        console.error("Failed to reload board data:", e);
      } finally {
        this.loading = false;
      }
    },

    async fetchTicketsForBoard() {
      if (!this.currentBoard) return;
      const requestId = ++this.ticketRequestId;
      const boardId = this.currentBoard.id;
      if (!this.ticketAccess.view) {
        this.tickets = [];
        this.distributeTicketsToStages();
        this.loading = false;
        return;
      }
      this.loading = true;
      try {
        const res = await axios.get(`${this.apiBase}/tickets`, {
          params: {
            per_page: "all",
            board: boardId,
            assigned_to_me: 1,
          },
          headers: this.getAuthHeaders(),
        });

        if (requestId !== this.ticketRequestId) return;
        this.tickets = res.data?.data || [];
        this.distributeTicketsToStages();
      } catch (e) {
        if (requestId !== this.ticketRequestId) return;
        console.error("Failed to load tickets for board:", e);
      } finally {
        if (requestId === this.ticketRequestId) this.loading = false;
      }
    },

    getFilteredTickets() {
      let result = this.tickets;

      // Filter by search query
      if (this.searchQuery && this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase().trim();
        result = result.filter((t) => {
          return (
            (t.ref_no && t.ref_no.toLowerCase().includes(q)) ||
            (t.subject && t.subject.toLowerCase().includes(q)) ||
            (t.summary && t.summary.toLowerCase().includes(q)) ||
            (t.system && t.system.toLowerCase().includes(q)) ||
            (t.module && t.module.toLowerCase().includes(q))
          );
        });
      }

      // Filter by severity
      if (this.filterSeverity && this.filterSeverity !== "All") {
        result = result.filter(
          (t) => (t.severity_name || "").toLowerCase() === this.filterSeverity.toLowerCase()
        );
      }

      // Filter by type
      if (this.filterType && this.filterType !== "All") {
        result = result.filter(
          (t) => (this.isSystemBoard ? (t.tkt_type?.name || "") : (t.type_name || "")).toLowerCase() === this.filterType.toLowerCase()
        );
      }

      if (this.filterIssueType && this.filterIssueType !== "All") {
        result = result.filter(
          (t) => (t.issue_type?.issue_desc || t.type_name || "").toLowerCase() === this.filterIssueType.toLowerCase()
        );
      }

      return result;
    },

    distributeTicketsToStages() {
      const filtered = this.getFilteredTickets();
      const stageMap = {};
      const validStageIds = new Set(this.stages.map((s) => s.id));

      this.stages.forEach((st) => {
        stageMap[st.id] = [];
      });

      const unassigned = [];

      filtered.forEach((ticket) => {
        if (ticket.board_status_id && validStageIds.has(ticket.board_status_id)) {
          stageMap[ticket.board_status_id].push(ticket);
        } else {
          unassigned.push(ticket);
        }
      });

      this.stageTicketsMap = stageMap;
      this.unassignedTickets = unassigned;
    },

    getStageTickets(stageId) {
      return this.stageTicketsMap[stageId] || [];
    },

    onDragStart(evt) {
      const ticketId = evt.item?.getAttribute("data-ticket-id");
      if (ticketId) {
        this.draggingTicket = this.tickets.find((t) => String(t.id) === String(ticketId)) || null;
      }
      this.isDragging = true;
    },

    onDragEnd() {
      this.draggingTicket = null;
      this.isDragging = false;
    },

    checkMovePermission(evt) {
      if (!this.ticketAccess.edit) return false;
      const draggedTicket = evt.draggedContext?.element || this.draggingTicket;
      if (!draggedTicket) return true;
      if (!this.isAdmin && !(draggedTicket.assignees || []).some((user) => Number(user.id) === this.currentUserId)) return false;

      if (!this.draggingTicket) {
        this.draggingTicket = draggedTicket;
        this.isDragging = true;
      }

      // Determine destination stage
      let targetStage = null;
      const toStageId = evt.to?.getAttribute("data-stage-id");

      if (toStageId && toStageId !== "unassigned") {
        targetStage = this.stages.find((s) => String(s.id) === String(toStageId));
      } else if (evt.relatedContext?.list) {
        targetStage = this.stages.find((s) => this.stageTicketsMap[s.id] === evt.relatedContext.list);
      }

      // Determine current stage of dragged ticket
      const currentStatusId = draggedTicket.board_status_id;
      const currentStage = currentStatusId
        ? this.stages.find((s) => s.id === currentStatusId)
        : null;

      return this.isStageMoveAllowed(currentStage, targetStage);
    },

    isStageMoveAllowed(currentStage, targetStage) {
      // 1. Same stage reorder is always allowed
      if (currentStage && targetStage && currentStage.id === targetStage.id) {
        return true;
      }
      if (!currentStage && !targetStage) {
        return true;
      }

      // 2. Dragging from unassigned
      if (!currentStage) {
        // Can only drag to first stage
        if (targetStage && this.stages.length > 0 && targetStage.id === this.stages[0].id) {
          return true;
        }
        return false;
      }

      // 3. Dragging from a workflow stage to unassigned is not permitted
      if (!targetStage) {
        return false;
      }

      // 4. Dragging between workflow stages
      const currentIndex = this.stages.findIndex((s) => s.id === currentStage.id);
      const targetIndex = this.stages.findIndex((s) => s.id === targetStage.id);

      if (currentIndex === -1 || targetIndex === -1) {
        return false;
      }

      // If current stage has no next step (terminal stage like CLOSE or CANCELLED)
      if (currentStage.has_next_step === false) {
        return false;
      }

      // Rule: Drag below next stage is not permitted!
      // Immediate next stage index is currentIndex + 1
      if (targetIndex > currentIndex + 1) {
        return false;
      }

      return true;
    },

    getNextStage(stage) {
      if (!stage || !this.stages || this.stages.length === 0) return null;
      const idx = this.stages.findIndex((s) => s.id === stage.id);
      if (idx !== -1 && idx < this.stages.length - 1 && stage.has_next_step) {
        return this.stages[idx + 1];
      }
      return null;
    },

    isStageNextDuringDrag(stage) {
      if (!this.isDragging || !this.draggingTicket) return false;
      const currentStatusId = this.draggingTicket.board_status_id;
      if (!currentStatusId) {
        // From unassigned, next is first stage
        return this.stages.length > 0 && this.stages[0].id === stage.id;
      }
      const currentStage = this.stages.find((s) => s.id === currentStatusId);
      if (!currentStage || currentStage.has_next_step === false) return false;
      const currentIndex = this.stages.findIndex((s) => s.id === currentStage.id);
      const targetIndex = this.stages.findIndex((s) => s.id === stage.id);
      return targetIndex === currentIndex + 1;
    },

    isStageDisabledDuringDrag(stage) {
      if (!this.isDragging || !this.draggingTicket) return false;
      const currentStatusId = this.draggingTicket.board_status_id;
      if (!currentStatusId) {
        // From unassigned, everything except first stage is disabled
        return this.stages.length > 0 && this.stages[0].id !== stage.id;
      }
      const currentStage = this.stages.find((s) => s.id === currentStatusId);
      if (!currentStage) return false;
      if (stage.id === currentStage.id) return false; // same stage is not disabled

      const currentIndex = this.stages.findIndex((s) => s.id === currentStage.id);
      const targetIndex = this.stages.findIndex((s) => s.id === stage.id);

      // Terminal stage cannot move forward
      if (currentStage.has_next_step === false && targetIndex > currentIndex) {
        return true;
      }

      // Below next stage is disabled
      return targetIndex > currentIndex + 1;
    },

    async onTicketDragChange(event, targetStage) {
      if (!this.ticketAccess.edit) return;
      if (!event.added) return;

      const ticket = event.added.element;
      if (!this.isAdmin && !(ticket.assignees || []).some((user) => Number(user.id) === this.currentUserId)) {
        this.distributeTicketsToStages();
        return;
      }
      const destinationStage = targetStage || this.stages.find(
        (stage) => Number(stage.id) === Number(event.to?.getAttribute("data-stage-id"))
      );
      const currentStatusId = ticket.board_status_id;
      const currentStage = currentStatusId
        ? this.stages.find((s) => s.id === currentStatusId)
        : null;

      const targetStageName = String(destinationStage?.name || destinationStage?.status_name || "")
        .toLowerCase()
        .replace(/[-_]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      let durationValues = null;
      if (["in progress", "inprogress"].includes(targetStageName) && (!ticket.duration_from || !ticket.duration_to)) {
        const today = new Date();
        const defaultFrom = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
        const durationPrompt = await Swal.fire({
          title: "Set ticket duration",
          html: `
            <div class="text-start">
              <label for="kanban-duration-from" class="form-label">Duration From <span class="text-danger">*</span></label>
              <input id="kanban-duration-from" type="date" class="form-control kanban-duration-input" value="${ticket.duration_from || defaultFrom}">
              <label for="kanban-duration-to" class="form-label">Duration To <span class="text-danger">*</span></label>
              <input id="kanban-duration-to" type="date" class="form-control kanban-duration-input" value="${ticket.duration_to || ""}">
            </div>`,
          showCancelButton: true,
          confirmButtonText: "Move to In Progress",
          cancelButtonText: "Cancel",
          focusConfirm: false,
          buttonsStyling: false,
          customClass: {
            popup: "kanban-duration-swal",
            confirmButton: "btn btn-primary mx-1",
            cancelButton: "btn btn-light mx-1",
          },
          preConfirm: () => {
            const from = document.getElementById("kanban-duration-from")?.value;
            const to = document.getElementById("kanban-duration-to")?.value;
            if (!from || !to) {
              Swal.showValidationMessage("Duration From and Duration To are required.");
              return false;
            }
            if (to < from) {
              Swal.showValidationMessage("Duration To cannot be earlier than Duration From.");
              return false;
            }
            return { from, to };
          },
        });
        if (!durationPrompt.isConfirmed) {
          this.distributeTicketsToStages();
          return;
        }
        durationValues = durationPrompt.value;
      }

      // Validate transition rule
      if (!this.isStageMoveAllowed(currentStage, destinationStage)) {
        // Rollback immediately
        this.distributeTicketsToStages();

        const nextStage = currentStage
          ? this.getNextStage(currentStage)
          : (this.stages[0] || null);

        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3500,
          timerProgressBar: true,
        });

        Toast.fire({
          icon: "warning",
          title: "Movement Not Permitted",
          text: nextStage
            ? `Tickets cannot skip stages. This ticket can only advance to "${nextStage.name}".`
            : "This ticket has reached its final stage and cannot advance further.",
        });
        return;
      }

      const oldStatusId = ticket.board_status_id;
      const oldDurationFrom = ticket.duration_from;
      const oldDurationTo = ticket.duration_to;
      const newStatusId = destinationStage ? destinationStage.id : null;

      // Optimistic update local object
      ticket.board_status_id = newStatusId;
      if (durationValues) {
        ticket.duration_from = durationValues.from;
        ticket.duration_to = durationValues.to;
      }
      if (destinationStage) {
        ticket.status_name = destinationStage.name;
        ticket.status_color = destinationStage.color;
      }

      try {
        const payload = {
          board_status_id: newStatusId,
          ...(durationValues ? {
            duration_from: durationValues.from,
            duration_to: durationValues.to,
          } : {}),
        };

        await axios.put(`${this.apiBase}/tickets/${ticket.id}`, payload, {
          headers: this.getAuthHeaders(),
        });

        // Discreet success toast
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true,
        });

        Toast.fire({
          icon: "success",
          title: `Moved #${ticket.ref_no || ticket.id} to ${destinationStage?.name || "Unassigned"}`,
        });
      } catch (err) {
        console.error("Failed to update ticket status on drag:", err);
        // Rollback on failure
        ticket.board_status_id = oldStatusId;
        ticket.duration_from = oldDurationFrom;
        ticket.duration_to = oldDurationTo;
        this.distributeTicketsToStages();

        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: err.response?.data?.message || "Could not move ticket. Please try again.",
          confirmButtonClass: "btn btn-primary",
        });
      }
    },

    openCreateTicketModal(stageId = null) {
      this.$router.push({
        path: "/tickets/new",
        query: { return: "kanban", ...(stageId ? { stage_id: stageId } : {}) },
      });
    },

    openEditTicketModal(ticket) {
      if (this.ticketAccess.edit && ticket && ticket.id) {
        this.$router.push({
          path: "/tickets/edit",
          query: { id: ticket.id, return: "kanban" },
        });
      }
    },

    triggerFileInput() {
      if (this.$refs.fileInputRef) {
        this.$refs.fileInputRef.click();
      }
    },

    handleFileDrop(e) {
      this.isFileDragOver = false;
      const files = Array.from(e.dataTransfer.files || []);
      this.addFiles(files);
    },

    handleFileSelect(e) {
      const files = Array.from(e.target.files || []);
      this.addFiles(files);
    },

    addFiles(files) {
      files.forEach((f) => {
        if (!this.attachedFiles.some((existing) => existing.name === f.name && existing.size === f.size)) {
          this.attachedFiles.push(f);
        }
      });
    },

    removeAttachedFile(idx) {
      this.attachedFiles.splice(idx, 1);
    },

    formatFileSize(bytes) {
      if (!bytes || bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    },

    getFileIconClass(name) {
      if (!name) return "ri-file-line";
      const ext = name.split(".").pop().toLowerCase();
      if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return "ri-image-line";
      if (["pdf"].includes(ext)) return "ri-file-pdf-line";
      if (["doc", "docx"].includes(ext)) return "ri-file-word-line";
      if (["xls", "xlsx", "csv"].includes(ext)) return "ri-file-excel-line";
      if (["zip", "rar", "7z", "tar"].includes(ext)) return "ri-file-zip-line";
      if (["txt", "log"].includes(ext)) return "ri-file-text-line";
      return "ri-file-line";
    },

    openTicketDetails(ticket) {
      if (!this.ticketAccess.view || !ticket?.id) return;
      this.$router.push({ path: "/tickets/details", query: { id: ticket.id } });
    },

    async saveTicketForm() {
      if (!this.ticketForm.subject || !this.ticketForm.summary) return;

      this.submitting = true;
      try {
        const payload = new FormData();
        payload.append("subject", this.ticketForm.subject);
        payload.append("summary", this.ticketForm.summary);
        if (this.ticketForm.board_status_id) {
          payload.append("board_status_id", this.ticketForm.board_status_id);
        }
        if (this.ticketForm.issue_severity_id) {
          payload.append("issue_severity_id", this.ticketForm.issue_severity_id);
        }
        if (this.ticketForm.issue_type_id) {
          payload.append("issue_type_id", this.ticketForm.issue_type_id);
        }
        payload.append("system", this.ticketForm.system || "");
        payload.append("module", this.ticketForm.module || "tickets");
        if (this.ticketForm.date_encountered) {
          payload.append("date_encountered", this.ticketForm.date_encountered);
        }

        (this.ticketForm.assignees || []).forEach((userId, i) => {
          payload.append(`assignees[${i}]`, userId);
        });

        this.attachedFiles.forEach((file) => {
          payload.append("attachments[]", file);
        });

        if (this.isEditing && this.ticketForm.id) {
          payload.append("_method", "PUT");
          const res = await axios.post(`${this.apiBase}/tickets/${this.ticketForm.id}`, payload, {
            headers: {
              ...this.getAuthHeaders(),
              "Content-Type": "multipart/form-data",
            },
          });
          const updated = res.data?.data;
          const idx = this.tickets.findIndex((t) => t.id === updated.id);
          if (idx !== -1) {
            this.tickets[idx] = updated;
          }
        } else {
          const res = await axios.post(`${this.apiBase}/tickets`, payload, {
            headers: {
              ...this.getAuthHeaders(),
              "Content-Type": "multipart/form-data",
            },
          });
          if (res.data?.data) {
            this.tickets.unshift(res.data.data);
          }
        }

        this.distributeTicketsToStages();
        this.ticketModalShow = false;

        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2500,
        });

        Toast.fire({
          icon: "success",
          title: this.isEditing ? "Ticket updated successfully" : "Ticket created successfully",
        });
      } catch (err) {
        console.error("Failed to save ticket:", err);
        Swal.fire({
          icon: "error",
          title: "Submission Error",
          text: err.response?.data?.message || err.message,
          confirmButtonClass: "btn btn-primary",
        });
      } finally {
        this.submitting = false;
      }
    },

    async deleteTicket(ticket) {
      if (!this.ticketAccess.delete) return;
      const confirm = await Swal.fire({
        title: "Delete Ticket?",
        text: `Are you sure you want to delete #${ticket.ref_no || ticket.id}? This cannot be undone.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it",
      });

      if (!confirm.isConfirmed) return;

      try {
        await axios.delete(`${this.apiBase}/tickets/${ticket.id}`, {
          headers: this.getAuthHeaders(),
        });

        this.tickets = this.tickets.filter((t) => t.id !== ticket.id);
        this.distributeTicketsToStages();

        if (this.detailModalShow && this.activeTicket?.id === ticket.id) {
          this.detailModalShow = false;
        }

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Ticket has been deleted.",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (err) {
        console.error("Failed to delete ticket:", err);
        Swal.fire({
          icon: "error",
          title: "Failed to delete",
          text: err.response?.data?.message || "Could not delete ticket.",
        });
      }
    },
  },
};
</script>

<style scoped>
.kanban-refresh-btn {
  width: 32px;
  min-width: 32px;
  height: 32px;
  padding: 0;
}
.kanban-duration-swal {
  border-radius: .5rem;
  padding: 1.5rem;
}
.kanban-duration-swal .swal2-title {
  color: var(--vz-heading-color, var(--vz-body-color));
  font-size: 1.25rem;
  font-weight: 600;
}
.kanban-duration-swal .kanban-duration-input {
  width: 100%;
  margin: 0 0 1rem;
  min-height: 42px;
  color: var(--vz-body-color);
  border-color: var(--vz-border-color);
  background-color: var(--vz-input-bg, var(--vz-card-bg));
}
.kanban-duration-swal .kanban-duration-input:focus {
  border-color: var(--vz-primary);
  box-shadow: 0 0 0 .2rem color-mix(in srgb, var(--vz-primary) 18%, transparent);
}
[data-bs-theme="dark"] .kanban-duration-swal,
[data-layout-mode="dark"] .kanban-duration-swal {
  background: var(--vz-card-bg, #212529);
}
.kanban-board-container {
  overflow-x: auto;
  min-height: calc(100vh - 280px);
  padding-bottom: 20px;
}

.kanban-scroll-track {
  display: flex;
  align-items: flex-start;
  min-width: max-content;
}

.kanban-column {
  width: 310px;
  min-width: 310px;
}

.kanban-column-header {
  background-color: var(--vz-card-bg, #ffffff);
  border-color: var(--vz-border-color, #e9ebec) !important;
  color: var(--vz-body-color, #212529);
}

[data-bs-theme="dark"] .kanban-column-header,
[data-layout-mode="dark"] .kanban-column-header {
  background-color: var(--vz-card-bg-fill, #212529) !important;
  border-color: var(--vz-border-color, rgba(255, 255, 255, 0.08)) !important;
  color: #ced4da !important;
}

.stage-color-dot {
  width: 9px;
  height: 9px;
  display: inline-block;
}

.kanban-sub-divider {
  border-color: var(--vz-border-color, rgba(0, 0, 0, 0.08)) !important;
}

[data-bs-theme="dark"] .kanban-sub-divider,
[data-layout-mode="dark"] .kanban-sub-divider {
  border-color: rgba(255, 255, 255, 0.08) !important;
}

.badge-stage-type {
  background-color: rgba(var(--vz-dark-rgb, 33, 37, 41), 0.06);
  color: var(--vz-muted, #878a99);
}

[data-bs-theme="dark"] .badge-stage-type,
[data-layout-mode="dark"] .badge-stage-type {
  background-color: rgba(255, 255, 255, 0.08) !important;
  color: #a2a6b7 !important;
}

.kanban-cards-wrapper {
  min-height: 400px;
  max-height: calc(100vh - 340px);
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
}

.kanban-cards-wrapper::-webkit-scrollbar {
  width: 5px;
}
.kanban-cards-wrapper::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.15);
  border-radius: 4px;
}

[data-bs-theme="dark"] .kanban-cards-wrapper::-webkit-scrollbar-thumb,
[data-layout-mode="dark"] .kanban-cards-wrapper::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.15);
}

.kanban-drag-area {
  min-height: 120px;
}

.kanban-card {
  background-color: var(--vz-card-bg, #ffffff);
  border-color: var(--vz-border-color, rgba(0, 0, 0, 0.08)) !important;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  border-radius: 8px;
}

[data-bs-theme="dark"] .kanban-card,
[data-layout-mode="dark"] .kanban-card {
  background-color: var(--vz-card-bg-fill, #212529) !important;
  border-color: var(--vz-border-color, rgba(255, 255, 255, 0.08)) !important;
}

.kanban-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08) !important;
}

[data-bs-theme="dark"] .kanban-card:hover,
[data-layout-mode="dark"] .kanban-card:hover {
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.45) !important;
}

.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.empty-column-placeholder {
  background-color: rgba(var(--vz-dark-rgb, 33, 37, 41), 0.02);
  border-color: var(--vz-border-color, rgba(0, 0, 0, 0.1)) !important;
}

[data-bs-theme="dark"] .empty-column-placeholder,
[data-layout-mode="dark"] .empty-column-placeholder {
  background-color: rgba(255, 255, 255, 0.02) !important;
  border-color: rgba(255, 255, 255, 0.08) !important;
  color: #878a99 !important;
}

.whitespace-pre-wrap {
  white-space: pre-wrap;
}

.badge-custom-hex {
  border-radius: 4px;
}

/* Modal dark mode styling */
[data-bs-theme="dark"] .ticket-detail-content .detail-summary-box,
[data-layout-mode="dark"] .ticket-detail-content .detail-summary-box {
  background-color: rgba(255, 255, 255, 0.04) !important;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

[data-bs-theme="dark"] .ticket-detail-content .meta-box,
[data-layout-mode="dark"] .ticket-detail-content .meta-box {
  border-color: rgba(255, 255, 255, 0.08) !important;
  background-color: rgba(255, 255, 255, 0.02);
}

/* Perfect circular avatar badge styling */
.avatar-user-circle {
  width: 24px !important;
  height: 24px !important;
  min-width: 24px !important;
  min-height: 24px !important;
  aspect-ratio: 1 / 1 !important;
  border-radius: 50% !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  overflow: hidden !important;
  padding: 0 !important;
  border: 2px solid var(--vz-card-bg-fill, var(--vz-card-bg, #ffffff)) !important;
  box-sizing: border-box !important;
  flex-shrink: 0 !important;
}

[data-bs-theme="dark"] .avatar-user-circle,
[data-layout-mode="dark"] .avatar-user-circle {
  border-color: #212529 !important;
}

.avatar-initials-badge {
  width: 100% !important;
  height: 100% !important;
  aspect-ratio: 1 / 1 !important;
  border-radius: 50% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 9.5px !important;
  font-weight: 700 !important;
  letter-spacing: -0.3px !important;
  line-height: 1 !important;
  text-transform: uppercase !important;
  user-select: none !important;
}

/* Drag and Drop Permissions & Visual Feedback */
.kanban-column.kanban-column-disabled {
  opacity: 0.45;
  filter: grayscale(35%);
  transition: opacity 0.2s ease, filter 0.2s ease;
}

.kanban-column.kanban-column-disabled .kanban-drag-area {
  cursor: not-allowed !important;
}

.kanban-column.kanban-column-next-stage {
  transition: all 0.2s ease;
}

.kanban-column.kanban-column-next-stage .kanban-column-header {
  box-shadow: 0 0 12px rgba(10, 179, 156, 0.3) !important;
  border-color: #0ab39c !important;
}

.kanban-column.kanban-column-next-stage .kanban-drag-area {
  background-color: rgba(10, 179, 156, 0.04);
  border-radius: 6px;
}

@keyframes nextPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.85;
  }
}

.animate-pulse {
  animation: nextPulse 1.2s infinite ease-in-out;
}
</style>

<style>
/* Global Velzon modal styling for Kanban */
.swal2-popup.kanban-duration-swal {
  border-radius: .5rem;
  padding: 1.5rem;
}
.swal2-popup.kanban-duration-swal .swal2-title {
  color: var(--vz-heading-color, var(--vz-body-color));
  font-size: 1.25rem;
  font-weight: 600;
}
.swal2-popup.kanban-duration-swal .kanban-duration-input {
  width: 100%;
  margin: 0 0 1rem;
  min-height: 42px;
  color: var(--vz-body-color);
  border-color: var(--vz-border-color);
  background-color: var(--vz-input-bg, var(--vz-card-bg));
}
.swal2-popup.kanban-duration-swal .kanban-duration-input:focus {
  border-color: var(--vz-primary);
  box-shadow: 0 0 0 .2rem rgba(64, 81, 137, .18);
}
[data-bs-theme="dark"] .swal2-popup.kanban-duration-swal,
[data-layout-mode="dark"] .swal2-popup.kanban-duration-swal {
  background: var(--vz-card-bg, #212529);
}
.v-modal-custom .modal-dialog {
  z-index: 1056 !important;
}

.v-modal-custom .modal-content {
  z-index: 1057 !important;
  background-color: var(--vz-card-bg, #ffffff) !important;
  color: var(--vz-body-color, #212529) !important;
  border-radius: 8px !important;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3) !important;
}

[data-bs-theme="dark"] .v-modal-custom .modal-content,
[data-layout-mode="dark"] .v-modal-custom .modal-content {
  background-color: #212529 !important;
  color: #ced4da !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  box-shadow: 0 10px 45px rgba(0, 0, 0, 0.85) !important;
}

[data-bs-theme="dark"] .v-modal-custom .modal-header,
[data-layout-mode="dark"] .v-modal-custom .modal-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
}

[data-bs-theme="dark"] .v-modal-custom .form-control,
[data-bs-theme="dark"] .v-modal-custom .form-select,
[data-layout-mode="dark"] .v-modal-custom .form-control,
[data-layout-mode="dark"] .v-modal-custom .form-select {
  background-color: #2a3036 !important;
  border-color: rgba(255, 255, 255, 0.14) !important;
  color: #f3f6f9 !important;
}

[data-bs-theme="dark"] .v-modal-custom .form-control:focus,
[data-bs-theme="dark"] .v-modal-custom .form-select:focus,
[data-layout-mode="dark"] .v-modal-custom .form-control:focus,
[data-layout-mode="dark"] .v-modal-custom .form-select:focus {
  background-color: #2a3036 !important;
  border-color: #405189 !important;
  color: #ffffff !important;
}

[data-bs-theme="dark"] .v-modal-custom .form-label,
[data-layout-mode="dark"] .v-modal-custom .form-label {
  color: #ced4da !important;
}

/* Ticket Dropzone Styling */
.ticket-dropzone {
  border: 2px dashed var(--vz-border-color, #e9ebec);
  background-color: rgba(var(--vz-light-rgb, 243, 246, 249), 0.5);
  transition: all 0.2s ease-in-out;
}

.ticket-dropzone:hover,
.ticket-dropzone.dropzone-active {
  border-color: #405189 !important;
  background-color: rgba(64, 81, 137, 0.06) !important;
}

[data-bs-theme="dark"] .ticket-dropzone,
[data-layout-mode="dark"] .ticket-dropzone {
  border-color: rgba(255, 255, 255, 0.15) !important;
  background-color: rgba(255, 255, 255, 0.02) !important;
}

[data-bs-theme="dark"] .ticket-dropzone:hover,
[data-bs-theme="dark"] .ticket-dropzone.dropzone-active,
[data-layout-mode="dark"] .ticket-dropzone:hover,
[data-layout-mode="dark"] .ticket-dropzone.dropzone-active {
  border-color: #405189 !important;
  background-color: rgba(64, 81, 137, 0.12) !important;
}
</style>
