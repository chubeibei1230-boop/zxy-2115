<script setup lang="ts">
import { computed } from 'vue'
import { useTagStore } from '@/stores/tagStore'
import { useRoleStore } from '@/stores/roleStore'
import { STATUS_LABELS } from '@/types'
import { Check, Close } from '@element-plus/icons-vue'

const tagStore = useTagStore()
const roleStore = useRoleStore()

const reviewItems = computed(() => tagStore.reviewTags)

const isReviewer = computed(() => roleStore.currentRole === 'reviewer')

defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [val: boolean]
}>()

function handleConfirm(id: string) {
  tagStore.confirmReview(id)
}

function handleReject(id: string) {
  tagStore.rejectReview(id)
}
</script>

<template>
  <el-drawer
    :model-value="visible"
    title="待复核队列"
    direction="rtl"
    size="420px"
    class="review-drawer"
    @close="emit('update:visible', false)"
  >
    <div class="review-list">
      <div v-if="reviewItems.length === 0" class="empty-state">
        <span class="empty-icon">📋</span>
        <p>暂无待复核条目</p>
      </div>

      <div
        v-for="tag in reviewItems"
        :key="tag.id"
        class="review-item"
      >
        <div class="review-header">
          <span class="review-code">{{ tag.code }}</span>
          <span class="review-status">{{ STATUS_LABELS[tag.status] }}</span>
        </div>

        <h4 class="review-name">{{ tag.name }}</h4>
        <span class="review-category">{{ tag.category }}</span>

        <div v-if="tag.riskNote" class="review-risk">
          <span class="risk-icon">⚠</span>
          <span>{{ tag.riskNote }}</span>
        </div>

        <div v-if="isReviewer" class="review-actions">
          <el-button
            type="success"
            :icon="Check"
            size="small"
            @click="handleConfirm(tag.id)"
          >
            确认通过
          </el-button>
          <el-button
            type="danger"
            :icon="Close"
            size="small"
            plain
            @click="handleReject(tag.id)"
          >
            退回修改
          </el-button>
        </div>

        <div v-else class="review-hint">
          切换至复核人身份以执行操作
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.review-list {
  padding: 0 4px;
}

.empty-state {
  text-align: center;
  padding: 48px 20px;
  color: $color-smoke;

  .empty-icon {
    font-size: 40px;
    display: block;
    margin-bottom: 12px;
  }

  p {
    font-size: 14px;
  }
}

.review-item {
  background: $color-card-bg;
  border: 1px solid $color-border;
  border-radius: $radius-md;
  padding: 16px;
  margin-bottom: 12px;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: $shadow-md;
  }
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.review-code {
  font-family: $font-display;
  font-size: 12px;
  font-weight: 600;
  color: $color-warm-brown;
  background: rgba(139, 111, 78, 0.08);
  padding: 2px 8px;
  border-radius: 4px;
}

.review-status {
  font-size: 11px;
  color: $color-terracotta;
  background: rgba(196, 112, 75, 0.1);
  padding: 2px 8px;
  border-radius: 10px;
}

.review-name {
  font-family: $font-display;
  font-size: 16px;
  font-weight: 700;
  color: $color-dark;
  margin-bottom: 4px;
}

.review-category {
  font-size: 12px;
  color: $color-warm-brown;
  background: rgba(139, 111, 78, 0.06);
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
  margin-bottom: 10px;
}

.review-risk {
  font-size: 12px;
  color: $color-terracotta;
  background: rgba(196, 112, 75, 0.06);
  border: 1px solid rgba(196, 112, 75, 0.12);
  border-radius: $radius-sm;
  padding: 8px 10px;
  margin-bottom: 12px;
  display: flex;
  align-items: flex-start;
  gap: 6px;
  line-height: 1.5;

  .risk-icon {
    flex-shrink: 0;
  }
}

.review-actions {
  display: flex;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid rgba(232, 213, 192, 0.5);

  :deep(.el-button) {
    border-radius: $radius-sm;
    font-family: $font-body;
    font-size: 12px;
  }

  :deep(.el-button--success) {
    background-color: $color-moss-green;
    border-color: $color-moss-green;
  }
}

.review-hint {
  font-size: 12px;
  color: $color-smoke;
  text-align: center;
  padding-top: 10px;
  border-top: 1px solid rgba(232, 213, 192, 0.5);
}
</style>
