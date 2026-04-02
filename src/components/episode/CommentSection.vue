<template>
  <div :class="s.comments">
    <div :class="s.header">
      <h3 :class="s.title">评论 <span :class="s.count">(1.2k)</span></h3>
      <div :class="s.inputArea">
        <el-input 
          v-model="newComment" 
          placeholder="发一条友善的评论吧..." 
          :class="s.input"
        >
          <template #append>
            <el-button type="primary">发送</el-button>
          </template>
        </el-input>
      </div>
    </div>

    <div :class="s.list">
      <div v-for="c in comments" :key="c.id" :class="s.item">
        <el-avatar :src="c.avatar" :size="32" />
        <div :class="s.content">
          <div :class="s.author">{{ c.author }} <span :class="s.time">{{ c.time }}</span></div>
          <p :class="s.text">{{ c.text }}</p>
          <div :class="s.actions">
            <el-button link size="small" :icon="ChatLineSquare">回复</el-button>
            <el-button link size="small" :icon="Pointer">点赞 {{ c.likes }}</el-button>
          </div>
        </div>
      </div>
    </div>

    <div :class="s.footer">
      <el-button link :icon="ArrowDown" v-if="!isExpanded" @click="isExpanded = true">展开更多评论</el-button>
      <el-button link :icon="ArrowUp" v-else @click="isExpanded = false">收起评论</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ChatLineSquare, Pointer, ArrowDown, ArrowUp } from '@element-plus/icons-vue';
import s from './CommentSection.module.scss';

const newComment = ref('');
const isExpanded = ref(false);

const comments = ref([
  { id: '1', author: '小鱼儿', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', time: '2小时前', text: '这剧情也太燃了吧！反击看得我热血沸腾！', likes: 125 },
  { id: '2', author: '代码诗人', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2', time: '4小时前', text: '特效很到位，期待下一集！', likes: 88 },
  { id: '3', author: '吃瓜群众', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3', time: '5小时前', text: '终于等到更新了，火速围观。', likes: 42 },
  { id: '4', author: '设计大拿', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4', time: '6小时前', text: '这UI设计得不错，看着很舒服。', likes: 21 },
  { id: '5', author: '路人甲', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5', time: '8小时前', text: '打卡留名。', likes: 10 }
]);
</script>
