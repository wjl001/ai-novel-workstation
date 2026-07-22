<template>
  <div class="comment-system" :class="{ collapsed: isCollapsed }">
    <!-- 评论面板头部 -->
    <div class="panel-header">
      <span class="panel-title">评论</span>
      <span class="comment-count">{{ comments.length }}</span>
      <button @click="onToggle" class="close-btn">✕</button>
    </div>

    <!-- 评论列表 -->
    <div v-if="!isCollapsed" class="panel-content">
      <!-- 添加评论 -->
      <div class="comment-input">
        <textarea
          v-model="newComment"
          placeholder="添加评论..."
          class="comment-textarea"
          rows="2"
          @keydown.enter.exact.prevent="onAddComment"
        ></textarea>
        <div class="input-actions">
          <button @click="onAddComment" class="send-btn">发送</button>
        </div>
      </div>

      <!-- 评论列表 -->
      <div class="comment-list">
        <div v-if="comments.length === 0" class="empty-comments">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <p>暂无评论</p>
        </div>

        <div v-else v-for="comment in comments" :key="comment.id" class="comment-item">
          <div class="comment-header">
            <div class="comment-author">
              <div class="author-avatar">{{ comment.author.charAt(0).toUpperCase() }}</div>
              <span class="author-name">{{ comment.author }}</span>
              <span class="comment-time">{{ formatTime(comment.created) }}</span>
            </div>
            <button @click="onDeleteComment(comment.id)" class="delete-comment-btn">×</button>
          </div>
          <div class="comment-body">
            {{ comment.content }}
          </div>
          <!-- 回复列表 -->
          <div v-if="comment.replies && comment.replies.length > 0" class="replies">
            <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
              <span class="reply-author">{{ reply.author }}</span>
              <span class="reply-content">{{ reply.content }}</span>
            </div>
          </div>
          <!-- 回复输入 -->
          <div class="reply-input">
            <input
              v-model="replyText[comment.id]"
              @keydown.enter.exact.prevent="onReply(comment.id)"
              type="text"
              placeholder="回复..."
              class="reply-textarea"
            />
            <button @click="onReply(comment.id)" class="reply-btn">回复</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCanvasStore } from '../../store/canvas'

const props = defineProps<{ show?: boolean }>()
const emit = defineEmits<{ 'close': [] }>()

const canvasStore = useCanvasStore()
const isCollapsed = ref(!props.show)
const newComment = ref('')
const replyText = ref<Record<string, string>>({})

const comments = computed(() => canvasStore.comments)

function onToggle() {
  isCollapsed.value = !isCollapsed.value
  if (isCollapsed.value) emit('close')
}

function onAddComment() {
  if (!newComment.value.trim()) return
  const position = canvasStore.viewport
  canvasStore.addComment(newComment.value, undefined, position)
  newComment.value = ''
}

function onReply(commentId: string) {
  const text = replyText.value[commentId]
  if (!text?.trim()) return
  canvasStore.replyComment(commentId, text)
  replyText.value[commentId] = ''
}

function onDeleteComment(commentId: string) {
  canvasStore.removeComment(commentId)
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return `${date.getMonth() + 1}/${date.getDate()}`
}
</script>

<style scoped>
.comment-system {
  width: 300px;
  height: 100%;
  background: #ffffff;
  border-left: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: width 0.2s ease;
}
.comment-system.collapsed { width: 0; padding: 0; overflow: hidden; }

.panel-header {
  height: 48px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}
.panel-title { font-size: 14px; font-weight: 600; color: #1e293b; flex: 1; }
.comment-count {
  font-size: 12px;
  background: #6366f1;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  margin-right: 8px;
}
.close-btn {
  width: 24px; height: 24px;
  display: flex; align-items: center; justify-content: center;
  border: none; background: transparent; border-radius: 4px;
  cursor: pointer; color: #64748b; font-size: 16px;
}
.close-btn:hover { background: #f1f5f9; }

.panel-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

.comment-input {
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
}
.comment-textarea {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 13px;
  resize: none;
  outline: none;
  font-family: inherit;
}
.comment-textarea:focus { border-color: #6366f1; }
.input-actions { margin-top: 8px; display: flex; justify-content: flex-end; }
.send-btn {
  padding: 6px 16px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}
.send-btn:hover { background: #4f46e5; }

.comment-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.empty-comments {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #94a3b8;
}
.empty-comments p { margin: 8px 0; font-size: 13px; }

.comment-item {
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 8px;
}
.comment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.comment-author {
  display: flex;
  align-items: center;
  gap: 6px;
}
.author-avatar {
  width: 24px; height: 24px;
  background: #6366f1;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
}
.author-name { font-size: 12px; font-weight: 500; color: #1e293b; }
.comment-time { font-size: 11px; color: #94a3b8; }
.delete-comment-btn {
  width: 18px; height: 18px;
  display: flex; align-items: center; justify-content: center;
  border: none; background: transparent; color: #cbd5e1;
  cursor: pointer; font-size: 14px;
}
.delete-comment-btn:hover { color: #ef4444; }

.comment-body {
  font-size: 13px;
  color: #334155;
  line-height: 1.5;
  margin-bottom: 8px;
}

.replies { margin-left: 30px; margin-bottom: 8px; }
.reply-item {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
}
.reply-author { font-weight: 500; color: #475569; margin-right: 6px; }

.reply-input {
  display: flex;
  gap: 6px;
  margin-top: 8px;
}
.reply-textarea {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 12px;
  outline: none;
}
.reply-btn {
  padding: 6px 10px;
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}
.reply-btn:hover { background: #e2e8f0; }
</style>
