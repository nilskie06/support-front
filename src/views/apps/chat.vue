<template>
  <Layout>
    <div v-if="!hasPermission" class="text-center py-5 my-5">
      <div class="spinner-border text-primary avatar-sm mb-3" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <h6 class="fs-14 fw-semibold text-muted mb-0">Verifying permissions...</h6>
    </div>
    <div v-else>
      <PageHeader title="Chat" pageTitle="Communication" />
      <div class="chat-shell card border-0 overflow-hidden">
      <div class="row g-0 h-100">
        <aside class="col-md-4 col-lg-3 border-end chat-sidebar">
          <div class="p-3 border-bottom"><h5 class="mb-1">Chats</h5><small class="text-success"><i class="ri-checkbox-blank-circle-fill"></i> {{ onlineCount }} online</small></div>
          <div class="p-2">
            <div class="position-relative">
              <input
                v-model="search"
                class="form-control pe-4"
                placeholder="Search people..."
                @keydown.esc="search = ''"
              />
              <button
                v-if="search"
                type="button"
                class="btn btn-link position-absolute top-50 end-0 translate-middle-y text-muted p-0 me-2 text-decoration-none shadow-none chat-search-clear"
                title="Clear search (Esc)"
                @click="search = ''"
              >
                <i class="ri-close-circle-fill fs-15"></i>
              </button>
            </div>
          </div>
          <div v-if="loadingSidebar" class="p-4 text-center text-muted">
            <div class="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
            <div class="small">Loading chats...</div>
          </div>
          <template v-else>
            <div class="px-3 pt-3 pb-1 text-uppercase fw-semibold text-muted fs-12 d-flex align-items-center justify-content-between">
              <span>Direct Messages</span>
              <span v-if="filteredUsers.length" class="badge bg-light text-muted">{{ filteredUsers.length }}</span>
            </div>
            <div class="list-group list-group-flush">
              <button v-for="user in filteredUsers" :key="user.id" class="list-group-item list-group-item-action d-flex gap-2 align-items-center" :class="{ active: selectedType === 'direct' && Number(selected?.id) === Number(user.id) }" @click="selectUser(user)">
                <span class="avatar-xs position-relative"><span class="avatar-title rounded-circle bg-primary-subtle text-primary">{{ initials(user) }}</span><span class="presence-dot" :class="{ online: isOnline(user.id) }"></span></span>
                <span class="text-start text-truncate"><strong class="d-block text-truncate">{{ displayName(user) }}</strong><small :class="selectedType === 'direct' && Number(selected?.id) === Number(user.id) ? 'text-white-50' : (isOnline(user.id) ? 'text-success' : 'text-muted')">{{ isOnline(user.id) ? 'Online' : 'Offline' }}</small></span>
                <span v-if="unread[user.id]" class="badge bg-danger rounded-pill ms-auto">{{ unread[user.id] }}</span>
              </button>
              <div v-if="!filteredUsers.length" class="p-3 text-center text-muted small">
                {{ search ? 'No people found.' : 'No direct conversations yet. Use search to find someone.' }}
              </div>
            </div>
            <div v-if="teams.length" class="px-3 pt-3 pb-1 text-uppercase fw-semibold text-muted fs-12">Channels · Teams</div>
            <div class="list-group list-group-flush">
              <button v-for="team in teams" :key="`team-${team.id}`" class="list-group-item list-group-item-action d-flex gap-2 align-items-center" :class="{ active: selectedType === 'team' && Number(selected?.id) === Number(team.id) }" @click="selectTeam(team)">
                <span class="avatar-xs"><span class="avatar-title rounded-circle bg-warning-subtle text-warning"><i class="ri-team-line"></i></span></span>
                <span class="text-start text-truncate flex-grow-1">
                  <strong class="d-block text-truncate">{{ team.name }}</strong>
                  <span class="channel-members" :aria-label="`${teamMembers(team).length} team members`">
                    <span v-for="member in teamMembers(team).slice(0, 4)" :key="member.id" class="channel-member-avatar" :title="displayName(member)">{{ initials(member) }}</span>
                    <span v-if="teamMembers(team).length > 4" class="channel-member-avatar channel-member-more">+{{ teamMembers(team).length - 4 }}</span>
                  </span>
                </span>
                <span v-if="unreadTeams[team.id]" class="badge bg-danger rounded-pill ms-auto">{{ unreadTeams[team.id] }}</span>
              </button>
            </div>
          </template>
        </aside>
        <main class="col-md-8 col-lg-9 d-flex flex-column chat-main position-relative" @dragover.prevent="dragOver = true" @dragleave.prevent="dragOver = false" @drop.prevent="addDroppedFiles">
          <div v-if="selected" class="p-3 border-bottom d-flex align-items-center justify-content-between"><div><h5 class="mb-0">{{ selectedType === 'team' ? selected.name : displayName(selected) }}</h5><small class="text-muted">{{ selectedType === 'team' ? 'Team channel · real-time' : 'Direct message · real-time' }}</small></div><button class="btn btn-soft-primary btn-icon rounded-circle" title="Conversation info" @click="showInfo = true"><i class="ri-information-line"></i></button></div>
          <div ref="messagesEl" class="flex-grow-1 p-3 chat-messages" @scroll="onMessagesScroll">
            <div v-if="!selected" class="h-100 d-flex align-items-center justify-content-center text-muted">Select a user to start a conversation.</div>
            <div v-else-if="loadingMessages" class="h-100 d-flex flex-column align-items-center justify-content-center text-muted">
              <div class="spinner-border text-primary mb-2" role="status"></div>
              <span>Loading messages...</span>
            </div>
            <template v-else>
              <!-- Load More Older Messages Top Indicator -->
              <div v-if="hasMoreMessages" class="text-center mb-3">
                <button
                  type="button"
                  class="btn btn-sm btn-soft-secondary rounded-pill px-3 py-1 fs-12"
                  :disabled="loadingMore"
                  @click="loadOlderMessages"
                >
                  <span v-if="loadingMore" class="spinner-border spinner-border-sm me-1" role="status"></span>
                  <i v-else class="ri-history-line me-1"></i>
                  <span>{{ loadingMore ? 'Loading older messages...' : 'Load older messages' }}</span>
                </button>
              </div>

              <div v-if="!messages.length" class="h-100 d-flex flex-column align-items-center justify-content-center text-muted">
                <i class="ri-chat-voice-line fs-1 mb-2 opacity-50"></i>
                <span>No messages yet. Say hello!</span>
              </div>
              <div
                v-for="message in messages"
                :key="message.id"
                class="d-flex mb-3 chat-row"
                :class="{
                  'justify-content-end': Number(message.sender_id) === Number(currentUser?.id),
                  'align-items-center': true
                }"
              >
                <div
                  class="chat-message-wrapper d-inline-flex align-items-center position-relative"
                  :class="{ mine: Number(message.sender_id) === Number(currentUser?.id) }"
                  @mouseenter="onMessageMouseEnter(message.id)"
                  @mouseleave="onMessageMouseLeave(message.id)"
                >
                  <!-- Quick Reaction Bar (docked on top or bottom of the bubble if near the top edge) -->
                  <div
                    v-if="activeReactionMessageId === message.id"
                    class="chat-reaction-pill shadow-lg"
                    :class="`placement-${reactionPillPlacement}`"
                    @mouseenter="onReactionPillMouseEnter(message.id, $event)"
                    @mouseleave="onMessageMouseLeave(message.id)"
                    @click.stop
                  >
                    <button
                      v-for="emoji in quickReactions"
                      :key="emoji"
                      type="button"
                      class="reaction-emoji-btn"
                      :class="{ active: hasUserReacted(message, emoji) }"
                      @click.stop="reactToMessage(message, emoji)"
                    >
                      {{ emoji }}
                    </button>
                    <button
                      type="button"
                      class="reaction-emoji-btn reaction-more-btn"
                      title="More emojis"
                      @click.stop="activeMoreEmojiMessageId = activeMoreEmojiMessageId === message.id ? null : message.id"
                    >
                      <i class="ri-add-line"></i>
                    </button>

                    <!-- Expanded Emoji Picker inside Reaction Bar -->
                    <div
                      v-if="activeMoreEmojiMessageId === message.id"
                      class="chat-reaction-more-popup shadow"
                      @click.stop
                    >
                      <button
                        v-for="emoji in emojis"
                        :key="`more-${emoji}`"
                        type="button"
                        class="reaction-emoji-btn"
                        :class="{ active: hasUserReacted(message, emoji) }"
                        @click.stop="reactToMessage(message, emoji)"
                      >
                        {{ emoji }}
                      </button>
                    </div>
                  </div>

                  <!-- Heart Trigger Button for Sent Messages (mine): sits on the left side of sent messages -->
                  <div
                    v-if="Number(message.sender_id) === Number(currentUser?.id)"
                    class="chat-reaction-trigger-wrap me-2"
                  >
                    <button
                      type="button"
                      class="btn btn-sm chat-heart-trigger rounded-circle"
                      :class="{ 'heart-filled': hasUserReacted(message, '💜') }"
                      title="Heart this message"
                      @click.stop="toggleHeartReaction(message)"
                      @mouseenter="onHeartMouseEnter(message.id, $event)"
                    >
                      <i
                        :class="hasUserReacted(message, '💜') ? 'ri-heart-fill fs-14 text-primary-purple' : 'ri-heart-line fs-14'"
                      ></i>
                    </button>
                  </div>

                  <div
                    class="chat-bubble-container position-relative"
                    :class="{ mine: Number(message.sender_id) === Number(currentUser?.id) }"
                  >
                    <!-- Chat Bubble -->
                    <div class="chat-bubble" :class="{ mine: Number(message.sender_id) === Number(currentUser?.id) }">
                    <div v-if="selectedType === 'team' && Number(message.sender_id) !== Number(currentUser?.id)" class="chat-sender-name small fw-bold text-primary mb-1">
                      {{ displayName(message.sender) }}
                    </div>
                    <div v-if="message.body" class="chat-text">{{ message.body }}</div>

                    <!-- Attachments Display -->
                    <div v-if="message.attachments && message.attachments.length" class="chat-attachments-wrap mt-2">
                      <!-- Image Grid / Thumbnails -->
                      <div
                        v-if="filterImages(message.attachments).length"
                        class="chat-image-grid mb-1"
                        :class="`grid-count-${Math.min(filterImages(message.attachments).length, 4)}`"
                      >
                        <div
                          v-for="(img, imgIdx) in filterImages(message.attachments)"
                          :key="`img-${img.path}-${imgIdx}`"
                          class="chat-image-thumb-wrapper"
                          @click="openImageLightbox(img)"
                        >
                          <img
                            :src="fileUrl(img)"
                            :alt="img.name"
                            class="chat-image-thumb"
                            loading="lazy"
                          />
                          <div class="chat-image-overlay">
                            <i class="ri-zoom-in-line fs-16"></i>
                          </div>
                        </div>
                      </div>

                      <!-- Non-image Files (Documents, PDFs, Archives, etc.) -->
                      <div v-if="filterNonImages(message.attachments).length" class="chat-files-list">
                        <a
                          v-for="(file, fIdx) in filterNonImages(message.attachments)"
                          :key="`file-${file.path}-${fIdx}`"
                          :href="fileUrl(file)"
                          target="_blank"
                          rel="noopener"
                          class="chat-file"
                        >
                          <i :class="fileIconClass(file)"></i>
                          <div class="chat-file-info text-truncate">
                            <span class="chat-file-name text-truncate d-block">{{ file.name }}</span>
                            <small class="chat-file-size text-muted">{{ fileSize(file.size) }}</small>
                          </div>
                          <i class="ri-download-2-line ms-auto fs-14 opacity-75"></i>
                        </a>
                      </div>
                    </div>

                    <div class="d-flex align-items-center justify-content-end gap-1 mt-1">
                      <small class="text-opacity-75">{{ time(message.created_at) }}</small>
                      <i
                        v-if="Number(message.sender_id) === Number(currentUser?.id)"
                        class="ri-check-double-line text-white-50 fs-11"
                      ></i>
                    </div>
                  </div>

                    <!-- Reactions Badges attached underneath the bubble -->
                    <div
                      v-if="message.reactions_summary && message.reactions_summary.length"
                      class="chat-reactions-badges"
                      :class="{ mine: Number(message.sender_id) === Number(currentUser?.id) }"
                    >
                      <button
                        v-for="reaction in message.reactions_summary"
                        :key="reaction.emoji"
                        type="button"
                        class="chat-reaction-chip"
                        :class="{
                          'chip-active': reaction.user_ids && reaction.user_ids.includes(Number(currentUser?.id)),
                          'is-single': !reaction.count || reaction.count <= 1
                        }"
                        :title="reactionTooltip(reaction)"
                        @click="reactToMessage(message, reaction.emoji)"
                      >
                        <span class="reaction-emoji">{{ reaction.emoji }}</span>
                        <span v-if="reaction.count > 1" class="reaction-count">{{ reaction.count }}</span>
                      </button>
                    </div>
                  </div>

                  <!-- Heart Trigger Button for Received Messages (not mine): sits on the right side of received messages -->
                  <div
                    v-if="Number(message.sender_id) !== Number(currentUser?.id)"
                    class="chat-reaction-trigger-wrap ms-2"
                  >
                    <button
                      type="button"
                      class="btn btn-sm chat-heart-trigger rounded-circle"
                      :class="{ 'heart-filled': hasUserReacted(message, '💜') }"
                      title="Heart this message"
                      @click.stop="toggleHeartReaction(message)"
                      @mouseenter="onHeartMouseEnter(message.id, $event)"
                    >
                      <i
                        :class="hasUserReacted(message, '💜') ? 'ri-heart-fill fs-14 text-primary-purple' : 'ri-heart-line fs-14'"
                      ></i>
                    </button>
                  </div>
                </div>
              </div>
            </template>
          </div>
          <form
            v-if="selected"
            class="p-3 border-top d-flex gap-2 align-items-end position-relative"
            @submit.prevent="send"
            @paste="onPaste"
          >
            <input ref="attachmentInput" class="d-none" type="file" multiple @change="addAttachments" />
            <button type="button" class="btn btn-soft-primary btn-icon" title="Attach files" @click="$refs.attachmentInput.click()">
              <i class="ri-attachment-2"></i>
            </button>
            <button type="button" class="btn btn-soft-primary btn-icon" title="Add emoji" @click="emojiOpen = !emojiOpen">
              <i class="ri-emotion-happy-line"></i>
            </button>
            <div v-if="emojiOpen" class="chat-emoji-picker">
              <button v-for="emoji in emojis" :key="emoji" type="button" @click="addEmoji(emoji)">{{ emoji }}</button>
            </div>
            <div class="flex-grow-1 position-relative">
              <div v-if="attachments.length" class="chat-attachments mb-2">
                <span
                  v-for="(file, index) in attachments"
                  :key="`${file.name}-${index}`"
                  class="chat-attachment-pill badge text-bg-light border"
                >
                  <img
                    v-if="attachmentPreview(file)"
                    :src="attachmentPreview(file)"
                    class="attachment-mini-thumb me-1"
                    alt="preview"
                  />
                  <i v-else class="ri-attachment-2"></i>
                  <span class="attachment-name text-truncate">{{ file.name }}</span>
                  <button type="button" class="btn-close ms-1" @click="removeAttachment(index)"></button>
                </span>
              </div>
              <textarea
                ref="draftTextarea"
                v-model="draft"
                class="form-control chat-input-textarea"
                rows="1"
                :placeholder="`Message ${selectedType === 'team' ? selected.name : displayName(selected)} (Enter to send, Shift + Enter for new line, Ctrl + V to paste screenshot)`"
                @keydown="onDraftKeydown"
                @paste="onPaste"
              ></textarea>
              <div v-if="showMentionPicker" class="chat-mention-picker">
                <button v-if="selectedType === 'team'" type="button" @click="insertMention('@everyone')">
                  <span class="mention-avatar bg-danger-subtle text-danger"><i class="ri-group-line"></i></span>
                  <span><strong>@everyone</strong><small>Notify all team members</small></span>
                </button>
                <button
                  v-for="member in mentionCandidates"
                  :key="member.id"
                  type="button"
                  @click="insertMention(`@${displayName(member)}`)"
                >
                  <span class="mention-avatar">{{ initials(member) }}</span>
                  <span><strong>{{ displayName(member) }}</strong><small>{{ member.email }}</small></span>
                </button>
              </div>
            </div>
            <button class="btn btn-primary btn-icon" :disabled="(!draft.trim() && !attachments.length) || sending">
              <span v-if="sending" class="spinner-border spinner-border-sm" role="status"></span>
              <i v-else class="ri-send-plane-2-fill"></i>
            </button>
          </form>
          <div v-if="dragOver && selected" class="chat-drop-overlay"><div><i class="ri-upload-cloud-2-line fs-1"></i><strong class="d-block mt-2">Drop files to attach</strong><small>Files will be added to this message.</small></div></div>
        </main>
      </div>
    </div>
    <div v-if="showInfo" class="chat-info-backdrop" @click.self="showInfo = false">
      <aside class="chat-info-drawer" aria-label="Conversation information">
        <header class="d-flex align-items-center justify-content-between p-3 border-bottom"><h5 class="mb-0">{{ selectedType === 'team' ? 'Team info' : 'Contact info' }}</h5><button class="btn btn-ghost-secondary btn-icon rounded-circle" aria-label="Close" @click="showInfo = false"><i class="ri-close-line"></i></button></header>
        <div class="p-4 text-center" v-if="selected"><span class="avatar-lg mb-3 d-inline-flex"><span class="avatar-title rounded-circle" :class="selectedType === 'team' ? 'bg-warning-subtle text-warning' : 'bg-primary-subtle text-primary'"><i v-if="selectedType === 'team'" class="ri-team-line fs-3"></i><template v-else>{{ initials(selected) }}</template></span></span><h5 class="mb-1">{{ selectedType === 'team' ? selected.name : displayName(selected) }}</h5><p v-if="selectedType === 'team'" class="text-muted mb-0">Private team channel</p><template v-else><p class="text-muted mb-2">{{ selected.email || 'No email address' }}</p><span class="badge" :class="isOnline(selected.id) ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'">{{ isOnline(selected.id) ? 'Online' : 'Offline' }}</span></template></div>
        <template v-if="selectedType === 'team' && selected"><div class="px-3 pb-2"><div class="border-top pt-3"><h6 class="text-uppercase text-muted fs-12 mb-2">Approvers ({{ selected.approvers?.length || 0 }})</h6><div v-if="selected.approvers?.length"><button v-for="member in selected.approvers" :key="`approver-${member.id}`" type="button" class="chat-member-row d-flex align-items-center gap-2 py-2 w-100" @click="openDirectMember(member)"><span class="avatar-xs"><span class="avatar-title rounded-circle bg-warning-subtle text-warning">{{ initials(member) }}</span></span><span class="flex-grow-1 text-start text-truncate"><strong class="d-block text-truncate">{{ displayName(member) }}</strong><small class="text-muted">{{ member.email }}</small></span><span class="badge bg-warning-subtle text-warning">Approver</span></button></div><p v-else class="small text-muted mb-3">No approver assigned.</p></div><div class="border-top pt-3"><h6 class="text-uppercase text-muted fs-12 mb-2">Participants ({{ selected.members?.length || 0 }})</h6><div v-if="selected.members?.length"><button v-for="member in selected.members" :key="`member-${member.id}`" type="button" class="chat-member-row d-flex align-items-center gap-2 py-2 w-100" @click="openDirectMember(member)"><span class="avatar-xs"><span class="avatar-title rounded-circle bg-primary-subtle text-primary">{{ initials(member) }}</span></span><span class="flex-grow-1 text-start text-truncate"><strong class="d-block text-truncate">{{ displayName(member) }}</strong><small class="text-muted">{{ member.email }}</small></span><span class="badge bg-primary-subtle text-primary">Member</span></button></div><p v-else class="small text-muted mb-0">No participants.</p></div></div></template>
      </aside>
    </div>

    <!-- Image Lightbox Modal Preview -->
    <div
      v-if="lightboxImage"
      class="chat-lightbox-backdrop"
      @click="closeImageLightbox"
    >
      <div class="chat-lightbox-content" @click.stop>
        <div class="chat-lightbox-header d-flex align-items-center justify-content-between">
          <div class="chat-lightbox-title text-truncate me-3">
            <span class="fw-semibold text-white d-block text-truncate">{{ lightboxImage.name }}</span>
            <small class="text-white-50">{{ fileSize(lightboxImage.size) }}</small>
          </div>
          <div class="d-flex align-items-center gap-2">
            <a
              :href="fileUrl(lightboxImage)"
              :download="lightboxImage.name"
              target="_blank"
              class="btn btn-sm btn-ghost-light btn-icon rounded-circle"
              title="Download image"
            >
              <i class="ri-download-2-line fs-16"></i>
            </a>
            <button
              type="button"
              class="btn btn-sm btn-ghost-light btn-icon rounded-circle"
              title="Close (Esc)"
              @click="closeImageLightbox"
            >
              <i class="ri-close-line fs-18"></i>
            </button>
          </div>
        </div>
        <div class="chat-lightbox-body">
          <img
            :src="fileUrl(lightboxImage)"
            :alt="lightboxImage.name"
            class="chat-lightbox-img"
          />
        </div>
      </div>
    </div>
    </div>
  </Layout>
</template>

<script>
import axios from 'axios';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import Layout from '@/layouts/main.vue';
import PageHeader from '@/components/page-header';

export default {
  name: 'ChatPage',
  components: { Layout, PageHeader },
  data() {
    return {
      hasPermission: true,
      users: [],
      teams: [],
      selected: null,
      selectedType: 'direct',
      messages: [],
      draft: '',
      attachments: [],
      dragOver: false,
      emojiOpen: false,
      emojis: ['😀', '😁', '😂', '😍', '😎', '👍', '👎', '🙏', '🎉', '✅', '❤️', '🔥'],
      quickReactions: ['💜', '😆', '😮', '🥺', '😡', '👍'],
      hoveredMessageId: null,
      activeReactionMessageId: null,
      activeMoreEmojiMessageId: null,
      reactionTimer: null,
      search: '',
      sending: false,
      loadingSidebar: true,
      loadingMessages: false,
      echo: null,
      currentUser: null,
      unread: {},
      unreadTeams: {},
      onlineUserIds: [],
      showInfo: false,
      lightboxImage: null,
      hasMoreMessages: false,
      loadingMore: false,
      oldestMessageId: null,
      reactionPillPlacement: 'top', // 'top' or 'bottom'
    };
  },
  computed: {
    apiBase() { return process.env.VUE_APP_AUTHDOMAIN || 'http://localhost:8001/api'; },
    filteredUsers() {
      const query = this.search.toLowerCase().trim();
      return this.users.filter((user) => {
        const matchesQuery = !query || this.displayName(user).toLowerCase().includes(query);
        if (!matchesQuery) return false;
        // When searching, allow finding any user so the person can start a new chat.
        // Otherwise, only show users who already have a conversation or unread messages, or who are currently selected.
        if (query) return true;
        const isSelected = this.selectedType === 'direct' && Number(this.selected?.id) === Number(user.id);
        const hasUnread = Boolean(this.unread[user.id]);
        return Boolean(user.has_conversation) || isSelected || hasUnread;
      });
    },
    onlineCount() { return this.onlineUserIds.filter((id) => Number(id) !== Number(this.currentUser?.id)).length; },
    showMentionPicker() { return /(^|\s)@[\w]*$/.test(this.draft); },
    mentionCandidates() { const query = (this.draft.match(/@([\w]*)$/)?.[1] || '').toLowerCase(); const candidates = this.selectedType === 'team' ? this.teamMembers(this.selected || {}) : [this.selected].filter(Boolean); return candidates.filter((member) => Number(member.id) !== Number(this.currentUser?.id) && this.displayName(member).toLowerCase().includes(query)); },
  },
  methods: {
    token() { return localStorage.getItem('jwt') || localStorage.getItem('token') || sessionStorage.getItem('jwt') || sessionStorage.getItem('token'); },
    headers() { const token = this.token(); return token ? { Authorization: `Bearer ${token}` } : {}; },
    displayName(user) { return user?.fullname || user?.name || user?.email || 'User'; },
    initials(user) { return this.displayName(user).split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase(); },
    teamMembers(team) { const members = [...(team.members || []), ...(team.approvers || [])]; return members.filter((member, index) => members.findIndex((item) => Number(item.id) === Number(member.id)) === index); },
    time(value) { return new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); },
    fileUrl(attachment) { return `${this.apiBase.replace(/\/api$/, '')}/storage/${attachment.path}`; },
    fileSize(size) { if (!size) return ''; const units = ['B', 'KB', 'MB', 'GB']; const index = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1); return `${(size / (1024 ** index)).toFixed(index ? 1 : 0)} ${units[index]}`; },
    isImageAttachment(attachment) {
      if (!attachment) return false;
      if (attachment.mime_type && attachment.mime_type.startsWith('image/')) return true;
      const path = (attachment.path || attachment.name || '').toLowerCase();
      return /\.(png|jpe?g|gif|webp|svg|bmp|avif)$/.test(path);
    },
    filterImages(attachments) {
      if (!Array.isArray(attachments)) return [];
      return attachments.filter((att) => this.isImageAttachment(att));
    },
    filterNonImages(attachments) {
      if (!Array.isArray(attachments)) return [];
      return attachments.filter((att) => !this.isImageAttachment(att));
    },
    openImageLightbox(image) {
      this.lightboxImage = image;
    },
    closeImageLightbox() {
      this.lightboxImage = null;
    },
    fileIconClass(file) {
      const name = (file?.name || file?.path || '').toLowerCase();
      if (/\.(pdf)$/.test(name)) return 'ri-file-pdf-line fs-20 text-danger';
      if (/\.(docx?|odt|txt|rtf)$/.test(name)) return 'ri-file-text-line fs-20 text-primary';
      if (/\.(xlsx?|csv|ods)$/.test(name)) return 'ri-file-excel-line fs-20 text-success';
      if (/\.(pptx?|key)$/.test(name)) return 'ri-file-ppt-line fs-20 text-warning';
      if (/\.(zip|rar|7z|tar|gz)$/.test(name)) return 'ri-file-zip-line fs-20 text-secondary';
      return 'ri-file-3-line fs-20 text-muted';
    },
    addAttachmentFiles(files) {
      if (!files || !files.length) return;
      const validFiles = Array.from(files).filter(Boolean);
      this.attachments = [...this.attachments, ...validFiles];
    },
    attachmentPreview(file) {
      if (!file || !file.type || !file.type.startsWith('image/')) return null;
      if (!this.previewUrls) this.previewUrls = new WeakMap();
      if (!this.previewUrls.has(file)) {
        try {
          this.previewUrls.set(file, URL.createObjectURL(file));
        } catch (e) {
          return null;
        }
      }
      return this.previewUrls.get(file);
    },
    onPaste(event) {
      if (!this.selected) return;
      const clipboardData = event.clipboardData || window.clipboardData;
      if (!clipboardData) return;

      const items = clipboardData.items;
      const pastedFiles = [];

      if (items && items.length) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.kind === 'file') {
            const blob = item.getAsFile();
            if (blob) {
              // If it's a screenshot with generic or missing name, give it a timestamped name
              let name = blob.name;
              if (!name || name === 'image.png' || name === 'blob') {
                const ext = (blob.type && blob.type.split('/')[1]) || 'png';
                const now = new Date();
                const pad = (n) => String(n).padStart(2, '0');
                const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
                name = `screenshot_${timestamp}.${ext}`;
              }
              const namedFile = new File([blob], name, { type: blob.type });
              pastedFiles.push(namedFile);
            }
          }
        }
      } else if (clipboardData.files && clipboardData.files.length) {
        pastedFiles.push(...Array.from(clipboardData.files));
      }

      if (pastedFiles.length) {
        // If files/screenshots were pasted, attach them
        this.addAttachmentFiles(pastedFiles);
        this.$swal?.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: pastedFiles.length === 1 ? 'Screenshot / image attached' : `${pastedFiles.length} files attached`,
          showConfirmButton: false,
          timer: 1800,
        });
      }
    },
    addAttachments(event) {
      this.addAttachmentFiles(event.target.files);
      event.target.value = '';
    },
    addDroppedFiles(event) {
      this.dragOver = false;
      const files = Array.from(event.dataTransfer?.files || []);
      if (files.length) this.addAttachmentFiles(files);
    },
    addEmoji(emoji) { this.draft += emoji; this.emojiOpen = false; },
    insertMention(mention) { this.draft = this.draft.replace(/(^|\s)@[\w]*$/, `$1${mention} `); },
    removeAttachment(index) {
      const removed = this.attachments[index];
      if (removed && this.previewUrls && this.previewUrls.has(removed)) {
        try {
          URL.revokeObjectURL(this.previewUrls.get(removed));
        } catch (e) {
          // ignore
        }
      }
      this.attachments.splice(index, 1);
    },
    isOnline(userId) { return this.onlineUserIds.some((id) => Number(id) === Number(userId)); },
    setPresence(user, online) {
      const id = Number(user?.id || user);
      if (!id) return;
      const current = this.onlineUserIds.filter((userId) => Number(userId) !== id);
      this.onlineUserIds = online ? [...current, id] : current;
    },
    addMessage(message) { if (!message || this.messages.some((item) => Number(item.id) === Number(message.id))) return; this.messages.push(message); this.$nextTick(this.scrollBottom); },
    async loadUsers() {
      try {
        const response = await axios.get(`${this.apiBase}/chat/users`, { headers: this.headers() });
        this.users = response.data.data || [];
      } catch (e) {
        if (e.response?.status === 403) {
          this.hasPermission = false;
          this.$router.replace({ path: '/auth/403', query: { redirectFrom: '/chat' } });
          return;
        }
        console.warn('Failed to load chat users:', e);
      }
    },
    async loadTeams() {
      try {
        const response = await axios.get(`${this.apiBase}/chat/teams`, { headers: this.headers() });
        this.teams = response.data.data || [];
        this.teams.forEach((team) => {
          this.echo?.private(`chat.team.${team.id}`)
            .listen('.chat.message', (event) => this.receiveMessage(event.message))
            .listen('.chat.reaction', (event) => this.onReactionUpdated(event));
        });
      } catch (e) {
        if (e.response?.status === 403) {
          this.hasPermission = false;
          this.$router.replace({ path: '/auth/403', query: { redirectFrom: '/chat' } });
          return;
        }
        console.warn('Failed to load chat teams:', e);
      }
    },
    async fetchInitialUnread() {
      try {
        const response = await axios.get(`${this.apiBase}/notifications`, { headers: this.headers() });
        const chatUnread = response.data?.chat_unread || {};
        const unreadDirect = { ...(chatUnread.direct || {}) };
        const unreadTeams = { ...(chatUnread.team || {}) };

        // If a conversation is already actively open, keep its unread count cleared
        if (this.selected) {
          if (this.selectedType === 'direct') {
            delete unreadDirect[this.selected.id];
          } else if (this.selectedType === 'team') {
            delete unreadTeams[this.selected.id];
          }
        }

        this.unread = unreadDirect;
        this.unreadTeams = unreadTeams;
      } catch (e) {
        console.warn('Failed to load chat notification unread counts:', e);
      }
    },
    async loadMessages(showLoading = false) {
      if (!this.selected) return;
      if (showLoading) {
        this.loadingMessages = true;
      }
      const params = this.selectedType === 'team'
        ? { group_id: this.selected.id, limit: 30 }
        : { user_id: this.selected.id, limit: 30 };
      try {
        const response = await axios.get(`${this.apiBase}/chat/messages`, { params, headers: this.headers() });
        const incoming = response.data.data || [];

        if (showLoading || !this.messages.length) {
          this.messages = incoming;
          this.hasMoreMessages = Boolean(response.data?.has_more);
          this.oldestMessageId = response.data?.oldest_id || (incoming[0]?.id ?? null);
          this.$nextTick(this.scrollBottom);
        } else {
          // Background polling: merge new incoming messages without replacing existing older messages
          const existingMap = new Map(this.messages.map((m) => [Number(m.id), m]));
          incoming.forEach((msg) => {
            existingMap.set(Number(msg.id), msg);
          });
          // Sort messages by id ascending
          this.messages = Array.from(existingMap.values()).sort((a, b) => Number(a.id) - Number(b.id));
        }

        // While actively viewing this chat, make sure unread counter stays 0 and read status is synced
        const activeId = this.selected.id;
        const hasUnread = this.selectedType === 'team' ? Boolean(this.unreadTeams[activeId]) : Boolean(this.unread[activeId]);
        if (hasUnread) {
          if (this.selectedType === 'team') {
            this.unreadTeams = { ...this.unreadTeams, [activeId]: 0 };
          } else {
            this.unread = { ...this.unread, [activeId]: 0 };
          }
          await this.markConversationRead(this.selectedType, activeId);
        }
      } catch (e) {
        console.warn('Failed to load messages:', e);
      } finally {
        if (showLoading) {
          this.loadingMessages = false;
        }
      }
    },
    async loadOlderMessages() {
      if (!this.selected || this.loadingMore || !this.hasMoreMessages || !this.oldestMessageId) return;
      this.loadingMore = true;
      const container = this.$refs.messagesEl;
      const prevScrollHeight = container ? container.scrollHeight : 0;
      const prevScrollTop = container ? container.scrollTop : 0;

      const params = {
        limit: 30,
        before_id: this.oldestMessageId,
        ...(this.selectedType === 'team' ? { group_id: this.selected.id } : { user_id: this.selected.id }),
      };

      try {
        const response = await axios.get(`${this.apiBase}/chat/messages`, { params, headers: this.headers() });
        const older = response.data.data || [];
        this.hasMoreMessages = Boolean(response.data?.has_more);
        if (older.length) {
          this.oldestMessageId = response.data?.oldest_id || older[0].id;

          // Deduplicate and prepend older messages
          const existingIds = new Set(this.messages.map((m) => Number(m.id)));
          const uniqueOlder = older.filter((m) => !existingIds.has(Number(m.id)));
          this.messages = [...uniqueOlder, ...this.messages];

          // Maintain scroll position so chat does not jump
          this.$nextTick(() => {
            if (container) {
              const newScrollHeight = container.scrollHeight;
              container.scrollTop = prevScrollTop + (newScrollHeight - prevScrollHeight);
            }
          });
        }
      } catch (e) {
        console.warn('Failed to load older messages:', e);
      } finally {
        this.loadingMore = false;
      }
    },
    onMessagesScroll() {
      const container = this.$refs.messagesEl;
      if (!container) return;
      // When scrolled near the top (less than 40px), auto-load older messages
      if (container.scrollTop < 40 && this.hasMoreMessages && !this.loadingMore && !this.loadingMessages) {
        this.loadOlderMessages();
      }
    },
    async markConversationRead(type, id) {
      try {
        if (type === 'team') {
          this.unreadTeams = { ...this.unreadTeams, [id]: 0 };
        } else {
          this.unread = { ...this.unread, [id]: 0 };
        }
        const payload = type === 'team' ? { group_id: id } : { user_id: id };
        await axios.post(`${this.apiBase}/notifications/chat/read`, payload, { headers: this.headers() });
        window.dispatchEvent(new CustomEvent('notifications-updated'));
      } catch (e) {
        console.warn('Failed to mark chat notifications read:', e);
      }
    },
    async selectUser(user) {
      this.showInfo = false;
      this.selectedType = 'direct';
      this.selected = user;
      this.unread = { ...this.unread, [user.id]: 0 };
      this.messages = [];
      this.hasMoreMessages = false;
      this.oldestMessageId = null;
      await Promise.all([
        this.loadMessages(true),
        this.markConversationRead('direct', user.id),
      ]);
    },
    async selectTeam(team) {
      this.showInfo = false;
      this.selectedType = 'team';
      this.selected = team;
      this.unreadTeams = { ...this.unreadTeams, [team.id]: 0 };
      this.messages = [];
      this.hasMoreMessages = false;
      this.oldestMessageId = null;
      await Promise.all([
        this.loadMessages(true),
        this.markConversationRead('team', team.id),
      ]);
    },
    async openDirectMember(member) {
      if (Number(member.id) === Number(this.currentUser?.id)) return;
      this.showInfo = false;
      await this.selectUser(member);
    },
    scrollBottom() { const element = this.$refs.messagesEl; if (element) element.scrollTop = element.scrollHeight; },
    onDraftKeydown(event) {
      if (event.key === 'Enter') {
        if (event.shiftKey) {
          // Shift + Enter: allow default behavior to insert a newline
          return;
        }

        // Enter alone: prevent default newline and send message
        event.preventDefault();
        if (!this.sending && (this.draft.trim() || this.attachments.length)) {
          this.send();
        }
      }
    },
    async send() {
      if ((!this.draft.trim() && !this.attachments.length) || !this.selected) return;
      this.sending = true;
      try {
        const form = new FormData();
        form.append(this.selectedType === 'team' ? 'group_id' : 'recipient_id', this.selected.id);
        form.append('body', this.draft.trim());
        this.attachments.forEach((file) => form.append('attachments[]', file));
        const response = await axios.post(`${this.apiBase}/chat/messages`, form, { headers: this.headers() });
        this.addMessage(response.data.data);
        if (this.selectedType === 'direct') {
          const directUser = this.users.find((u) => Number(u.id) === Number(this.selected.id));
          if (directUser) directUser.has_conversation = true;
        }
        this.draft = '';
        this.attachments = [];
      } finally {
        this.sending = false;
      }
    },
    receiveMessage(message) {
      if (!message.group_id && message.sender_id) {
        const senderUser = this.users.find((u) => Number(u.id) === Number(message.sender_id));
        if (senderUser) senderUser.has_conversation = true;
      }

      const isCurrentTeam = this.selectedType === 'team' && Number(message.group_id) === Number(this.selected?.id);
      const isCurrentDirect = this.selectedType === 'direct' && Number(message.sender_id) === Number(this.selected?.id);

      if (isCurrentTeam || isCurrentDirect) {
        this.addMessage(message);
        if (isCurrentTeam) {
          this.markConversationRead('team', this.selected.id);
        } else {
          this.markConversationRead('direct', this.selected.id);
        }
      } else {
        if (message.group_id) {
          this.unreadTeams = { ...this.unreadTeams, [message.group_id]: (this.unreadTeams[message.group_id] || 0) + 1 };
        } else {
          this.unread = { ...this.unread, [message.sender_id]: (this.unread[message.sender_id] || 0) + 1 };
        }
        window.dispatchEvent(new CustomEvent('notifications-updated'));
      }
      this.$swal?.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: message.group_name
          ? `[${message.group_name}] ${this.displayName(message.sender)}`
          : `New message from ${this.displayName(message.sender)}`,
        showConfirmButton: false,
        timer: 2500,
      });
    },
    connect() {
      if (!this.token() || !this.currentUser?.id) return;
      window.Pusher = Pusher;
      const reverbHost = process.env.VUE_APP_REVERB_HOST === 'localhost' ? '127.0.0.1' : (process.env.VUE_APP_REVERB_HOST || '127.0.0.1');
      this.echo = new Echo({
        broadcaster: 'reverb',
        key: process.env.VUE_APP_REVERB_APP_KEY || '6cs4kv9gbevi13pdhqoh',
        wsHost: reverbHost,
        wsPort: Number(process.env.VUE_APP_REVERB_PORT || 8081),
        wssPort: Number(process.env.VUE_APP_REVERB_PORT || 8081),
        forceTLS: false,
        enabledTransports: ['ws', 'wss'],
        authEndpoint: `${this.apiBase.replace(/\/api$/, '')}/broadcasting/auth`,
        auth: { headers: this.headers() },
      });
      this.echo.private(`chat.user.${this.currentUser.id}`)
        .listen('.chat.message', (event) => this.receiveMessage(event.message))
        .listen('.chat.reaction', (event) => this.onReactionUpdated(event));
      this.echo.join('chat.presence')
        .here((users) => { this.onlineUserIds = users.map((user) => Number(user.id)); })
        .joining((user) => this.setPresence(user, true))
        .leaving((user) => this.setPresence(user, false));
    },
    onMessageMouseEnter(messageId) {
      this.hoveredMessageId = messageId;
      if (this.reactionTimer) {
        clearTimeout(this.reactionTimer);
        this.reactionTimer = null;
      }
    },
    onHeartMouseEnter(messageId, event) {
      if (this.reactionTimer) {
        clearTimeout(this.reactionTimer);
        this.reactionTimer = null;
      }
      this.hoveredMessageId = messageId;
      this.calculatePlacement(event);
      this.activeReactionMessageId = messageId;
    },
    onReactionPillMouseEnter(messageId, event) {
      if (this.reactionTimer) {
        clearTimeout(this.reactionTimer);
        this.reactionTimer = null;
      }
      this.hoveredMessageId = messageId;
      if (!this.activeReactionMessageId) {
        this.calculatePlacement(event);
      }
      this.activeReactionMessageId = messageId;
    },
    calculatePlacement(event) {
      try {
        const target = event?.currentTarget || event?.target;
        const container = this.$refs.messagesEl;
        if (target && container) {
          const targetRect = target.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          // If less than 65px between target top and chat container top, place pill below
          const spaceAbove = targetRect.top - containerRect.top;
          this.reactionPillPlacement = spaceAbove < 65 ? 'bottom' : 'top';
          return;
        }
      } catch (e) {
        // fallback
      }
      this.reactionPillPlacement = 'top';
    },
    onMessageMouseLeave(messageId) {
      if (this.hoveredMessageId === messageId) {
        this.hoveredMessageId = null;
      }
      if (this.reactionTimer) {
        clearTimeout(this.reactionTimer);
      }
      this.reactionTimer = setTimeout(() => {
        if (!this.activeMoreEmojiMessageId) {
          this.activeReactionMessageId = null;
        }
      }, 350);
    },
    toggleReactionPicker(messageId) {
      if (this.reactionTimer) {
        clearTimeout(this.reactionTimer);
        this.reactionTimer = null;
      }
      if (this.activeReactionMessageId === messageId) {
        this.activeReactionMessageId = null;
        this.activeMoreEmojiMessageId = null;
      } else {
        this.activeReactionMessageId = messageId;
        this.activeMoreEmojiMessageId = null;
      }
    },
    toggleHeartReaction(message) {
      if (this.reactionTimer) {
        clearTimeout(this.reactionTimer);
        this.reactionTimer = null;
      }
      this.activeReactionMessageId = null;
      this.activeMoreEmojiMessageId = null;
      this.reactToMessage(message, '💜');
    },
    hasUserReacted(message, emoji) {
      const summary = message.reactions_summary || [];
      const item = summary.find((r) => r.emoji === emoji);
      return Boolean(item && item.user_ids && item.user_ids.includes(Number(this.currentUser?.id)));
    },
    reactionTooltip(reaction) {
      const names = (reaction.users || []).map((u) => u.name);
      if (!names.length) return reaction.emoji;
      return `${names.join(', ')} reacted with ${reaction.emoji}`;
    },
    async reactToMessage(message, emoji) {
      this.activeReactionMessageId = null;
      this.activeMoreEmojiMessageId = null;

      // Optimistic update
      const userId = Number(this.currentUser?.id);
      const userName = this.displayName(this.currentUser);
      const currentList = [...(message.reactions_summary || [])];
      const existingIdx = currentList.findIndex((r) => r.emoji === emoji);

      if (existingIdx !== -1) {
        const existing = { ...currentList[existingIdx] };
        const hasReacted = existing.user_ids.includes(userId);
        if (hasReacted) {
          existing.count -= 1;
          existing.user_ids = existing.user_ids.filter((id) => id !== userId);
          existing.users = (existing.users || []).filter((u) => u.id !== userId);
          if (existing.count <= 0) {
            currentList.splice(existingIdx, 1);
          } else {
            currentList[existingIdx] = existing;
          }
        } else {
          existing.count += 1;
          existing.user_ids = [...existing.user_ids, userId];
          existing.users = [...(existing.users || []), { id: userId, name: userName }];
          currentList[existingIdx] = existing;
        }
      } else {
        currentList.push({
          emoji,
          count: 1,
          user_ids: [userId],
          users: [{ id: userId, name: userName }],
        });
      }
      message.reactions_summary = currentList;

      try {
        const response = await axios.post(
          `${this.apiBase}/chat/messages/${message.id}/reactions`,
          { emoji },
          { headers: this.headers() }
        );
        message.reactions_summary = response.data.reactions;
      } catch (e) {
        console.warn('Failed to toggle reaction:', e);
      }
    },
    onReactionUpdated(event) {
      if (!event || !event.message_id) return;
      const target = this.messages.find((m) => Number(m.id) === Number(event.message_id));
      if (target) {
        target.reactions_summary = event.reactions;
      }
    },
    applyRouteQuerySelection() {
      const targetUserId = this.$route.query?.user;
      const targetTeamId = this.$route.query?.team;
      if (targetUserId) {
        const found = this.users.find((u) => Number(u.id) === Number(targetUserId));
        if (found) this.selectUser(found);
      } else if (targetTeamId) {
        const found = this.teams.find((t) => Number(t.id) === Number(targetTeamId));
        if (found) this.selectTeam(found);
      }
    },
  },
  watch: {
    '$route.query': {
      handler() {
        this.applyRouteQuerySelection();
      },
      deep: true,
    },
  },
  async mounted() {
    try {
      this.currentUser = JSON.parse(sessionStorage.getItem('authUser') || localStorage.getItem('user') || 'null');
    } catch (error) {
      this.currentUser = null;
    }

    // Component-level permission guard
    if (this.currentUser && this.currentUser.role !== 'admin') {
      try {
        const rawPerms = sessionStorage.getItem('user_menu_permissions');
        if (rawPerms) {
          const perms = JSON.parse(rawPerms);
          const chatMenu = perms.find((m) => m.code === 'chat' || (m.url && m.url.replace(/\/+$/, '').toLowerCase() === '/chat'));
          if (chatMenu && !chatMenu.can_view) {
            this.hasPermission = false;
            this.$nextTick(() => {
              this.$router.replace({ path: '/auth/403', query: { redirectFrom: '/chat' } });
            });
            return;
          }
        }
      } catch (e) {
        console.warn('Failed to verify chat permissions:', e);
      }
    }

    this.connect();
    this.loadingSidebar = true;
    try {
      await Promise.all([this.loadUsers(), this.loadTeams(), this.fetchInitialUnread()]);
    } catch (e) {
      if (e.response?.status === 403) {
        this.hasPermission = false;
        this.$router.replace({ path: '/auth/403', query: { redirectFrom: '/chat' } });
        return;
      }
    } finally {
      this.loadingSidebar = false;
    }
    this.applyRouteQuerySelection();
    this.onDocumentClick = (e) => {
      if (!e.target.closest('.chat-reaction-pill') && !e.target.closest('.chat-reaction-trigger')) {
        this.activeReactionMessageId = null;
        this.activeMoreEmojiMessageId = null;
      }
    };
    document.addEventListener('click', this.onDocumentClick);
    this.onKeydown = (e) => {
      if (e.key === 'Escape' && this.lightboxImage) {
        this.closeImageLightbox();
      }
    };
    document.addEventListener('keydown', this.onKeydown);
    this.onWindowPaste = (e) => {
      // If user is focused on an unrelated input (e.g., search user/team), do not intercept
      if (e.target && e.target.tagName === 'INPUT' && e.target !== this.$refs.draftTextarea) {
        return;
      }
      this.onPaste(e);
    };
    window.addEventListener('paste', this.onWindowPaste);
  },
  unmounted() {
    this.echo?.disconnect();
    if (this.onDocumentClick) {
      document.removeEventListener('click', this.onDocumentClick);
    }
    if (this.onKeydown) {
      document.removeEventListener('keydown', this.onKeydown);
    }
    if (this.onWindowPaste) {
      window.removeEventListener('paste', this.onWindowPaste);
    }
  },
};
</script>

<style scoped>
.chat-shell { height: calc(100vh - 180px); min-height: 560px; }
.chat-sidebar, .chat-main { height: 100%; }
.chat-messages {
  overflow: auto;
  background: var(--vz-light, #f7f7fb);
  padding-top: 1.25rem !important;
  padding-bottom: 1.25rem !important;
}
.chat-bubble {
  max-width: 100%;
  padding: .65rem .95rem;
  background: var(--vz-card-bg, #fff);
  color: var(--vz-body-color, #212529);
  border: 1px solid var(--vz-border-color, #e9ebec);
  border-radius: 1.15rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, .08);
}
.chat-bubble.mine {
  background: #5b45b2;
  color: #ffffff;
  border-color: #523ea3;
  border-top-right-radius: .35rem;
}
.chat-bubble:not(.mine) {
  border-top-left-radius: .35rem;
}
.chat-bubble small { display: block; opacity: .75; margin-top: .25rem; font-size: .7rem; }
.chat-attachments-wrap {
  width: 100%;
  max-width: 380px;
}
.chat-image-grid {
  display: grid;
  gap: 6px;
  width: 100%;
}
.chat-image-grid.grid-count-1 {
  grid-template-columns: 1fr;
}
.chat-image-grid.grid-count-2 {
  grid-template-columns: repeat(2, 1fr);
}
.chat-image-grid.grid-count-3 {
  grid-template-columns: repeat(3, 1fr);
}
.chat-image-grid.grid-count-4 {
  grid-template-columns: repeat(2, 1fr);
}
.chat-image-thumb-wrapper {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.08);
  cursor: pointer;
  aspect-ratio: 16 / 11;
  max-height: 220px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: transform .18s ease, box-shadow .18s ease;
}
.chat-image-grid.grid-count-1 .chat-image-thumb-wrapper {
  aspect-ratio: auto;
  max-height: 280px;
}
.chat-image-thumb-wrapper:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.16);
}
.chat-image-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform .25s ease;
}
.chat-image-thumb-wrapper:hover .chat-image-thumb {
  transform: scale(1.04);
}
.chat-image-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
  color: #ffffff;
  opacity: 0;
  backdrop-filter: blur(2px);
  transition: opacity .2s ease;
}
.chat-image-thumb-wrapper:hover .chat-image-overlay {
  opacity: 1;
}

/* File attachments styling */
.chat-files-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}
.chat-file {
  display: flex;
  align-items: center;
  gap: .65rem;
  padding: .5rem .75rem;
  color: inherit;
  background: rgba(0, 0, 0, .05);
  border: 1px solid rgba(0, 0, 0, .08);
  border-radius: .65rem;
  text-decoration: none;
  transition: background .15s ease, border-color .15s ease, transform .15s ease;
}
.chat-bubble.mine .chat-file {
  background: rgba(255, 255, 255, .15);
  border-color: rgba(255, 255, 255, .2);
  color: #ffffff;
}
.chat-file:hover {
  background: rgba(0, 0, 0, .08);
  transform: translateY(-1px);
}
.chat-bubble.mine .chat-file:hover {
  background: rgba(255, 255, 255, .24);
}
.chat-file-info {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
}
.chat-file-name {
  font-size: .82rem;
  font-weight: 500;
}
.chat-file-size {
  font-size: .7rem;
}
.chat-bubble.mine .chat-file-size {
  color: rgba(255, 255, 255, .75) !important;
}
.chat-attachments { display: flex; flex-wrap: wrap; gap: .45rem; }
.chat-attachment-pill {
  display: inline-flex;
  align-items: center;
  max-width: 240px;
  padding: .3rem .55rem;
  border-radius: .45rem;
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0, 0, 0, .06);
}
.attachment-mini-thumb {
  width: 20px;
  height: 20px;
  object-fit: cover;
  border-radius: 4px;
}
.chat-attachment-pill .attachment-name {
  max-width: 170px;
}
.chat-attachments .btn-close { width: .45rem; height: .45rem; font-size: .55rem; vertical-align: middle; }

/* Lightbox Modal */
.chat-lightbox-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(10, 14, 23, 0.88);
  backdrop-filter: blur(6px);
  padding: 1.5rem;
  animation: lightboxFadeIn .18s ease-out;
}
.chat-lightbox-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  background: #181d28;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.6);
  animation: lightboxZoomIn .2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.chat-lightbox-header {
  padding: .75rem 1rem;
  background: rgba(255, 255, 255, 0.04);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.chat-lightbox-body {
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  max-height: calc(90vh - 65px);
}
.chat-lightbox-img {
  max-width: 100%;
  max-height: calc(85vh - 75px);
  object-fit: contain;
  border-radius: 8px;
}
@keyframes lightboxFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes lightboxZoomIn {
  from { transform: scale(0.92); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.chat-member-row { border: 0; background: transparent; color: inherit; border-radius: .35rem; }
.chat-member-row:hover { background: var(--vz-light, #f7f7fb); }
.chat-drop-overlay { position: absolute; inset: 0; z-index: 5; display: flex; align-items: center; justify-content: center; background: rgba(64, 81, 137, .92); color: #fff; text-align: center; pointer-events: none; }
.chat-emoji-picker { position: absolute; bottom: calc(100% - .5rem); left: 3.75rem; z-index: 8; display: grid; grid-template-columns: repeat(6, 1fr); gap: .15rem; width: 220px; padding: .5rem; background: var(--vz-card-bg, #fff); border: 1px solid var(--vz-border-color, #e9ebec); border-radius: .5rem; box-shadow: 0 .5rem 1rem rgba(0, 0, 0, .15); }
.chat-emoji-picker button { padding: .3rem; border: 0; background: transparent; border-radius: .3rem; font-size: 1.15rem; }
.chat-emoji-picker button:hover { background: var(--vz-light, #f3f6f9); transform: scale(1.15); }
.chat-mention-picker { position: absolute; bottom: calc(100% + .35rem); left: 0; z-index: 8; width: min(100%, 300px); padding: .35rem; background: var(--vz-card-bg, #fff); border: 1px solid var(--vz-border-color, #e9ebec); border-radius: .5rem; box-shadow: 0 .5rem 1rem rgba(0, 0, 0, .15); }
.chat-mention-picker button { display: flex; align-items: center; width: 100%; gap: .5rem; padding: .4rem; color: inherit; border: 0; border-radius: .35rem; background: transparent; text-align: left; }
.chat-mention-picker button:hover { background: var(--vz-light, #f3f6f9); }
.chat-mention-picker strong, .chat-mention-picker small { display: block; line-height: 1.2; }.chat-mention-picker small { color: var(--vz-secondary-color, #878a99); font-size: .72rem; }.mention-avatar { display: inline-flex; align-items: center; justify-content: center; flex: 0 0 26px; width: 26px; height: 26px; border-radius: 50%; background: var(--vz-primary-bg-subtle, #e8eaf6); color: var(--vz-primary, #405189); font-size: .65rem; font-weight: 700; }
.channel-members { display: flex; align-items: center; height: 18px; margin-top: .25rem; }
.channel-member-avatar { display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; margin-left: -4px; border: 1px solid var(--vz-card-bg, #fff); border-radius: 50%; background: var(--vz-primary-bg-subtle, #e8eaf6); color: var(--vz-primary, #405189); font-size: 7px; font-weight: 700; }
.channel-member-avatar:first-child { margin-left: 0; }
.channel-member-more { background: var(--vz-light, #f3f6f9); color: var(--vz-secondary-color, #878a99); }
.list-group-item.active .channel-member-avatar { border-color: var(--vz-primary, #405189); background: rgba(255, 255, 255, .22); color: #fff; }
.channel-member-avatar:hover { position: relative; z-index: 2; transform: translateY(-1px) scale(1.12); box-shadow: 0 0 0 3px rgba(64, 81, 137, .16), 0 0 10px rgba(64, 81, 137, .45); transition: transform .15s ease, box-shadow .15s ease; }
.chat-info-backdrop { position: fixed; inset: 0; z-index: 1060; background: rgba(15, 23, 42, .62); }
.chat-info-drawer { position: absolute; top: 0; right: 0; width: min(100%, 360px); height: 100%; background: var(--vz-card-bg, #fff); color: var(--vz-body-color, #212529); box-shadow: -8px 0 24px rgba(0, 0, 0, .16); animation: chatDrawerIn .18s ease-out; overflow-y: auto; }
@keyframes chatDrawerIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
.presence-dot { position: absolute; right: -1px; bottom: -1px; width: 10px; height: 10px; border: 2px solid var(--vz-card-bg, #fff); border-radius: 50%; background: #94a3b8; }
.presence-dot.online { background: #10b981; }
:global([data-bs-theme="dark"]) .chat-messages, :global([data-layout-mode="dark"]) .chat-messages { background: var(--vz-body-bg, #071d33); }
:global([data-bs-theme="dark"]) .chat-bubble:not(.mine), :global([data-layout-mode="dark"]) .chat-bubble:not(.mine) { background: #1d2938; color: #e8eef8; border-color: #31435a; }
:global([data-bs-theme="dark"]) .chat-bubble:not(.mine) .chat-file,
:global([data-layout-mode="dark"]) .chat-bubble:not(.mine) .chat-file {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
  color: #e2e8f0;
}
:global([data-bs-theme="dark"]) .chat-bubble:not(.mine) .chat-file:hover,
:global([data-layout-mode="dark"]) .chat-bubble:not(.mine) .chat-file:hover {
  background: rgba(255, 255, 255, 0.12);
}
:global([data-bs-theme="dark"]) .chat-info-drawer,
:global([data-layout-mode="dark"]) .chat-info-drawer {
  background-color: #1a1d21 !important;
  color: #ced4da !important;
  border-left: 1px solid rgba(255, 255, 255, 0.12) !important;
  box-shadow: -8px 0 24px rgba(0, 0, 0, 0.6) !important;
}
:global([data-bs-theme="dark"]) .chat-info-drawer header,
:global([data-layout-mode="dark"]) .chat-info-drawer header {
  border-bottom-color: rgba(255, 255, 255, 0.12) !important;
}
:global([data-bs-theme="dark"]) .chat-info-drawer h5,
:global([data-layout-mode="dark"]) .chat-info-drawer h5,
:global([data-bs-theme="dark"]) .chat-info-drawer strong,
:global([data-layout-mode="dark"]) .chat-info-drawer strong {
  color: #f3f6f9 !important;
}
:global([data-bs-theme="dark"]) .chat-info-drawer .border-top,
:global([data-layout-mode="dark"]) .chat-info-drawer .border-top {
  border-top-color: rgba(255, 255, 255, 0.12) !important;
}
:global([data-bs-theme="dark"]) .chat-info-drawer .chat-member-row:hover,
:global([data-layout-mode="dark"]) .chat-info-drawer .chat-member-row:hover {
  background-color: rgba(255, 255, 255, 0.06) !important;
}
:global([data-bs-theme="dark"]) .chat-info-drawer .btn-ghost-secondary,
:global([data-layout-mode="dark"]) .chat-info-drawer .btn-ghost-secondary {
  color: #ced4da !important;
}
:global([data-bs-theme="dark"]) .chat-info-drawer .btn-ghost-secondary:hover,
:global([data-layout-mode="dark"]) .chat-info-drawer .btn-ghost-secondary:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
  color: #ffffff !important;
}
.chat-search-clear {
  line-height: 1;
  opacity: .6;
  transition: opacity .15s ease, transform .15s ease;
}
.chat-search-clear:hover {
  opacity: 1;
  transform: translateY(-50%) scale(1.1);
}
.chat-text {
  white-space: pre-wrap;
  word-break: break-word;
}
.chat-input-textarea {
  resize: none;
  min-height: 38px;
  max-height: 120px;
  overflow-y: auto;
}

/* Reactions Styling */
.chat-row {
  position: relative;
}
.chat-message-wrapper {
  position: relative;
  max-width: 82%;
  display: inline-flex;
  align-items: center;
}
.chat-bubble-container {
  display: inline-flex;
  flex-direction: column;
  max-width: 100%;
}
.chat-bubble-container.mine {
  align-items: flex-end;
}
.chat-bubble-container:not(.mine) {
  align-items: flex-start;
}

/* Viber-style Heart outline trigger button: always visible */
.chat-reaction-trigger-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  opacity: 1;
}
.chat-heart-trigger {
  width: 28px;
  height: 28px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(30, 34, 45, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: #a78bfa;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.22);
  transition: transform .15s ease, background .15s ease, border-color .15s ease, color .15s ease;
}
.chat-heart-trigger:hover {
  background: #252836;
  color: #c4b5fd;
  border-color: #8b5cf6;
  transform: scale(1.12);
}
.chat-heart-trigger.heart-filled {
  background: #2b2347;
  border-color: #8b5cf6;
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.45);
}
.text-primary-purple {
  color: #a78bfa !important;
}

/* Viber/Messenger style Floating Reaction Pill positioned directly over the trigger and bubble */
.chat-reaction-pill {
  position: absolute;
  z-index: 1050;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: #20242f;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 9999px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
}
.chat-reaction-pill.placement-top {
  bottom: calc(100% + 6px);
  animation: reactionPillPopTop .18s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.chat-reaction-pill.placement-bottom {
  top: calc(100% + 6px);
  animation: reactionPillPopBottom .18s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.chat-message-wrapper.mine .chat-reaction-pill {
  right: 0;
}
.chat-message-wrapper:not(.mine) .chat-reaction-pill {
  left: 0;
}
/* Invisible hover bridge to prevent mouseleave while moving cursor into the pill */
.chat-reaction-pill.placement-top::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  height: 14px;
}
.chat-reaction-pill.placement-bottom::after {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  height: 14px;
}
@keyframes reactionPillPopTop {
  0% { transform: scale(0.6) translateY(6px); opacity: 0; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}
@keyframes reactionPillPopBottom {
  0% { transform: scale(0.6) translateY(-6px); opacity: 0; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}

.reaction-emoji-btn {
  background: transparent;
  border: 0;
  font-size: 20px;
  line-height: 1;
  padding: 4px 6px;
  border-radius: 9999px;
  cursor: pointer;
  transition: transform .12s cubic-bezier(0.34, 1.56, 0.64, 1), background .12s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.reaction-emoji-btn:hover {
  transform: scale(1.35) translateY(-2px);
  background: rgba(255, 255, 255, 0.15);
}
.reaction-emoji-btn.active {
  background: rgba(139, 92, 246, 0.35);
  box-shadow: 0 0 0 2px #a78bfa;
}

.reaction-more-btn {
  width: 28px;
  height: 28px;
  padding: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.14);
  color: #e2e8f0;
  font-size: 15px;
}
.reaction-more-btn:hover {
  background: rgba(255, 255, 255, 0.28);
  color: #fff;
  transform: scale(1.15);
}

/* Expanded emoji popup from + button */
.chat-reaction-more-popup {
  position: absolute;
  right: 0;
  z-index: 1060;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 4px;
  width: 220px;
  padding: 8px;
  background: #2a2e39;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
}
.chat-reaction-pill.placement-top .chat-reaction-more-popup {
  bottom: calc(100% + 6px);
}
.chat-reaction-pill.placement-bottom .chat-reaction-more-popup {
  top: calc(100% + 6px);
}

/* Reaction Badges / Chips displayed below the bubble */
.chat-reactions-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: -6px;
  position: relative;
  z-index: 2;
}
.chat-reactions-badges.mine {
  justify-content: flex-end;
}
.chat-reactions-badges:not(.mine) {
  justify-content: flex-start;
}
.chat-reaction-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  height: 24px;
  padding: 0 7px;
  min-width: 24px;
  font-size: 12px;
  background: var(--vz-card-bg, #ffffff);
  border: 1px solid var(--vz-border-color, #e9ebec);
  border-radius: 9999px;
  color: var(--vz-body-color, #212529);
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all .15s ease;
  line-height: 1;
}
.chat-reaction-chip.is-single {
  width: 24px;
  height: 24px;
  min-width: 24px;
  padding: 0;
  border-radius: 50%;
  aspect-ratio: 1 / 1;
}
.chat-reaction-chip:hover {
  transform: translateY(-1px) scale(1.08);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.16);
}
.chat-reaction-chip.chip-active {
  background: #ede9fe;
  border-color: #8b5cf6;
  color: #5b21b6;
  font-weight: 600;
}
:global([data-bs-theme="dark"]) .chat-reaction-chip,
:global([data-layout-mode="dark"]) .chat-reaction-chip {
  background: #1e293b;
  border-color: #334155;
  color: #e2e8f0;
}
:global([data-bs-theme="dark"]) .chat-reaction-chip.chip-active,
:global([data-layout-mode="dark"]) .chat-reaction-chip.chip-active {
  background: #312e81;
  border-color: #818cf8;
  color: #e0e7ff;
}
.reaction-emoji {
  font-size: 13px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.reaction-count {
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
}
</style>
