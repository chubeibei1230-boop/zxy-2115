<script setup lang="ts">
import { computed } from 'vue'
import type { Role } from '@/types'
import { useRoleStore } from '@/stores/roleStore'
import { useTagStore } from '@/stores/tagStore'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useClipboard } from '@/composables/useClipboard'

const roleStore = useRoleStore()
const tagStore = useTagStore()
const { copyText } = useClipboard()

const props = defineProps<{
  totalCount: number
}>()

const emit = defineEmits<{
  'selection-changed': []
}>()

const selectedCount = computed(() => tagStore.selectedCount)
const hasSelection = computed(() => tagStore.hasSelection)
const isAllSelected = computed(() => selectedCount.value === props.totalCount && props.totalCount > 0)

const canManageStatus = computed(() =>
  roleStore.currentRole === 'manager' || roleStore.currentRole === 'assistant'
)

const canUseBatchActions = computed(() =>
  roleStore.currentRole === 'manager'
)

const riskCount = computed(() =>
  tagStore.selectedTags.filter((t) => t.riskNote && t.riskNote.trim()).length
)

const riskTags = computed(() =>
  tagStore.selectedTags.filter((t) => t.riskNote && t.riskNote.trim())
)

const underReviewCount = computed(() =>
  tagStore.selectedTags.filter((t) => t.status === 'under_review').length
)

const hiddenCount = computed(() =>
  tagStore.selectedTags.filter((t) => t.status === 'hidden' || t.isHidden).length
)

function toggleSelectAll() {
  if (isAllSelected.value) {
    tagStore.deselectAll()
  } else {
    const ids = tagStore.visibleTags.map((t) => t.id)
    tagStore.selectAll(ids)
  }
  emit('selection-changed')
}

function clearSelection() {
  tagStore.deselectAll()
  emit('selection-changed')
}

async function handleBatchOnShelf() {
  if (underReviewCount.value > 0 || hiddenCount.value > 0) {
    try {
      await ElMessageBox.confirm(
        `选中的 ${selectedCount.value} 条短签中，有 ${underReviewCount.value} 条待复核、${hiddenCount.value} 条已隐藏，这些条目将被跳过。确定继续上架吗？`,
        '批量上架确认',
        {
          confirmButtonText: '确定上架',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
    } catch {
      return
    }
  }
  const ids = tagStore.selectedTags.map((t) => t.id)
  tagStore.batchToggleStatus(ids, 'on_shelf')
  ElMessage.success({ message: `已批量上架 ${selectedCount.value - underReviewCount.value - hiddenCount.value} 条短签`, duration: 2000 })
  emit('selection-changed')
}

async function handleBatchOffShelf() {
  if (underReviewCount.value > 0 || hiddenCount.value > 0) {
    try {
      await ElMessageBox.confirm(
        `选中的 ${selectedCount.value} 条短签中，有 ${underReviewCount.value} 条待复核、${hiddenCount.value} 条已隐藏，这些条目将被跳过。确定继续下架吗？`,
        '批量下架确认',
        {
          confirmButtonText: '确定下架',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
    } catch {
      return
    }
  }
  const ids = tagStore.selectedTags.map((t) => t.id)
  tagStore.batchToggleStatus(ids, 'off_shelf')
  ElMessage.success({ message: `已批量下架 ${selectedCount.value - underReviewCount.value - hiddenCount.value} 条短签`, duration: 2000 })
  emit('selection-changed')
}

async function handleBatchMoveToReview() {
  let confirmMessage = `确定将选中的 ${selectedCount.value} 条短签移入复核队列吗？`
  
  if (riskCount.value > 0) {
    const riskList = riskTags.value
      .map((t) => `  · ${t.name} (${t.code}): ${t.riskNote}`)
      .join('\n')
    confirmMessage += `\n\n⚠ 以下 ${riskCount.value} 条短签含风险提示：\n${riskList}`
  }
  
  if (hiddenCount.value > 0) {
    confirmMessage += `\n\nℹ 其中 ${hiddenCount.value} 条已隐藏条目将在移入后重新显示。`
  }

  try {
    await ElMessageBox.confirm(confirmMessage, '批量移入复核确认', {
      confirmButtonText: '确定移入',
      cancelButtonText: '取消',
      type: riskCount.value > 0 ? 'warning' : 'info',
      dangerouslyUseHTMLString: false,
      customStyle: {
        whiteSpace: 'pre-line',
      },
    })
  } catch {
    return
  }
  const ids = tagStore.selectedTags.map((t) => t.id)
  tagStore.batchMoveToReview(ids)
  ElMessage.success({ message: `已将 ${selectedCount.value} 条短签移入复核队列`, duration: 2000 })
  emit('selection-changed')
}

async function handleBatchHide() {
  try {
    await ElMessageBox.confirm(
      `确定隐藏选中的 ${selectedCount.value} 条短签吗？隐藏后将不在列表中显示。`,
      '批量隐藏确认',
      {
        confirmButtonText: '确定隐藏',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
  } catch {
    return
  }
  const ids = tagStore.selectedTags.map((t) => t.id)
  tagStore.batchHideTags(ids)
  tagStore.deselectAll()
  ElMessage.success({ message: `已隐藏 ${selectedCount.value} 条短签`, duration: 2000 })
  emit('selection-changed')
}

async function handleCopySummary() {
  const summary = tagStore.getSelectedSummary()
  await copyText(summary)
  ElMessage.success({ message: '已复制选中短签摘要', duration: 1500 })
}
</script>

<template>
  <div class="batch-action-bar">
    <div class="bar-left">
      <div class="select-all-wrapper" @click="toggleSelectAll">
        <div :class="['select-all-checkbox', { checked: isAllSelected, indeterminate: hasSelection && !isAllSelected }]">
          <span v-if="isAllSelected" class="check-icon">✓</span>
          <span v-else-if="hasSelection && !isAllSelected" class="indeterminate-icon">─</span>
        </div>
        <span class="select-all-text">全选</span>
      </div>

      <div class="selected-info">
        <span class="selected-count">已选 <strong>{{ selectedCount }}</strong> 条</span>
        <span v-if="riskCount > 0" class="risk-warning">
          <span class="warning-icon">⚠</span>
          {{ riskCount }} 条含风险提示
        </span>
      </div>

      <el-button v-if="hasSelection" link type="primary" size="small" @click="clearSelection">
        清除选择
      </el-button>
    </div>

    <div class="bar-right">
      <template v-if="canManageStatus">
        <el-button
          type="success"
          size="default"
          :disabled="!hasSelection"
          @click="handleBatchOnShelf"
        >
          批量上架
        </el-button>
        <el-button
          size="default"
          :disabled="!hasSelection"
          @click="handleBatchOffShelf"
        >
          批量下架
        </el-button>
      </template>

      <template v-if="canUseBatchActions">
        <el-button
          type="warning"
          size="default"
          :disabled="!hasSelection"
          @click="handleBatchMoveToReview"
        >
          移入复核
        </el-button>
        <el-button
          type="danger"
          size="default"
          :disabled="!hasSelection"
          @click="handleBatchHide"
        >
          隐藏条目
        </el-button>
      </template>

      <el-button
        size="default"
        :disabled="!hasSelection"
        @click="handleCopySummary"
      >
        复制摘要
      </el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.batch-action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: linear-gradient(135deg, rgba(139, 111, 78, 0.08), rgba(196, 112, 75, 0.06));
  border: 1px solid rgba(139, 111, 78, 0.15);
  border-radius: $radius-lg;
  margin-bottom: 20px;
  gap: 16px;
  flex-wrap: wrap;
}

.bar-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.select-all-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.select-all-checkbox {
  width: 18px;
  height: 18px;
  border: 2px solid $color-border;
  border-radius: 4px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    border-color: $color-warm-brown;
  }

  &.checked, &.indeterminate {
    background: $color-warm-brown;
    border-color: $color-warm-brown;
  }
}

.check-icon, .indeterminate-icon {
  color: white;
  font-size: 11px;
  font-weight: bold;
  line-height: 1;
}

.select-all-text {
  font-size: 13px;
  color: $color-dark;
  font-weight: 500;
}

.selected-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.selected-count {
  font-size: 13px;
  color: $color-smoke;

  strong {
    color: $color-warm-brown;
    font-size: 15px;
    font-weight: 700;
  }
}

.risk-warning {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: $color-terracotta;
  background: rgba(196, 112, 75, 0.08);
  padding: 4px 10px;
  border-radius: $radius-sm;
}

.warning-icon {
  font-size: 12px;
}

.bar-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

:deep(.el-button) {
  border-radius: $radius-md;
  font-weight: 500;
}
</style>
