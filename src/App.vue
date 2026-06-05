<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import type { TagStatus } from '@/types'
import { useRoleStore } from '@/stores/roleStore'
import { useTagStore } from '@/stores/tagStore'
import { useKeyboard } from '@/composables/useKeyboard'
import { useContextMenu } from '@/composables/useContextMenu'
import { useClipboard } from '@/composables/useClipboard'
import { ElMessage, ElMessageBox } from 'element-plus'
import RoleSelector from '@/components/RoleSelector.vue'
import SearchBar from '@/components/SearchBar.vue'
import TagCard from '@/components/TagCard.vue'
import ContextMenu from '@/components/ContextMenu.vue'
import TagFormDialog from '@/components/TagFormDialog.vue'
import ReviewDrawer from '@/components/ReviewDrawer.vue'
import ShortcutBar from '@/components/ShortcutBar.vue'

const roleStore = useRoleStore()
const tagStore = useTagStore()
const { menuState, openMenu, closeMenu } = useContextMenu()
const { copied, copyText } = useClipboard()

const searchQuery = ref('')
const statusFilter = ref<TagStatus | ''>('')
const selectedTagId = ref<string | null>(null)
const formVisible = ref(false)
const editTagId = ref<string | null>(null)
const reviewVisible = ref(false)
const searchBarRef = ref<InstanceType<typeof SearchBar> | null>(null)

const filteredTags = computed(() =>
  tagStore.searchTags(searchQuery.value, statusFilter.value || undefined)
)

const selectedTag = computed(() =>
  selectedTagId.value ? tagStore.getTagById(selectedTagId.value) : null
)

function selectTag(id: string) {
  selectedTagId.value = id
}

function openForm(tagId?: string) {
  if (roleStore.currentRole !== 'manager') return
  editTagId.value = tagId ?? null
  formVisible.value = true
}

function handleCardContextmenu(e: MouseEvent, tagId: string) {
  selectedTagId.value = tagId
  openMenu(e, tagId)
}

async function handleMenuAction(key: string, tagId: string) {
  closeMenu()
  const tag = tagStore.getTagById(tagId)
  if (!tag) return

  switch (key) {
    case 'copy': {
      const text = `${tag.name} (${tag.code})\n分类: ${tag.category}\n价格: ¥${tag.price.toFixed(2)}\n${tag.description}`
      await copyText(text)
      ElMessage.success({ message: '短签信息已复制', duration: 1500 })
      break
    }
    case 'feature':
      tagStore.toggleFeatured(tagId)
      ElMessage.success({
        message: tag.isFeatured ? '已取消主推' : '已设为主推',
        duration: 1500,
      })
      break
    case 'review':
      tagStore.moveToReview(tagId)
      ElMessage.success({ message: '已移入复核队列', duration: 1500 })
      break
    case 'hide':
      await ElMessageBox.confirm('确定要隐藏该条目吗？', '隐藏确认', {
        confirmButtonText: '确定隐藏',
        cancelButtonText: '取消',
        type: 'warning',
      })
      tagStore.hideTag(tagId)
      if (selectedTagId.value === tagId) selectedTagId.value = null
      ElMessage.success({ message: '条目已隐藏', duration: 1500 })
      break
  }
}

function toggleSelectedStatus() {
  if (roleStore.currentRole !== 'assistant') return
  if (selectedTagId.value) {
    tagStore.toggleStatus(selectedTagId.value)
    const tag = tagStore.getTagById(selectedTagId.value)
    ElMessage.success({
      message: tag?.status === 'on_shelf' ? '已上架' : '已下架',
      duration: 1500,
    })
  }
}

async function handleDelete() {
  if (roleStore.currentRole !== 'manager' || !selectedTagId.value) return
  try {
    await ElMessageBox.confirm('确定要删除该短签吗？此操作不可撤销。', '删除确认', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'error',
    })
    tagStore.deleteTag(selectedTagId.value)
    selectedTagId.value = null
    ElMessage.success({ message: '短签已删除', duration: 1500 })
  } catch {}
}

const tagIdList = computed(() => filteredTags.value.map((t) => t.id))

useKeyboard({
  onNew: () => openForm(),
  onSearch: () => searchBarRef.value?.focus(),
  onToggleStatus: toggleSelectedStatus,
  onReview: () => {
    if (roleStore.currentRole === 'reviewer') reviewVisible.value = true
  },
  onContextMenu: () => {
    if (selectedTagId.value) {
      const el = document.querySelector(`[data-tag-id="${selectedTagId.value}"]`)
      if (el) {
        const rect = el.getBoundingClientRect()
        openMenu(
          new MouseEvent('contextmenu', {
            clientX: rect.right - 20,
            clientY: rect.top + 20,
          }),
          selectedTagId.value
        )
      }
    }
  },
  onEscape: () => {
    closeMenu()
    formVisible.value = false
    reviewVisible.value = false
  },
  onArrowUp: () => {
    if (tagIdList.value.length === 0) return
    const idx = selectedTagId.value ? tagIdList.value.indexOf(selectedTagId.value) : -1
    const newIdx = idx <= 0 ? tagIdList.value.length - 1 : idx - 1
    selectedTagId.value = tagIdList.value[newIdx]
  },
  onArrowDown: () => {
    if (tagIdList.value.length === 0) return
    const idx = selectedTagId.value ? tagIdList.value.indexOf(selectedTagId.value) : -1
    const newIdx = idx >= tagIdList.value.length - 1 ? 0 : idx + 1
    selectedTagId.value = tagIdList.value[newIdx]
  },
  onEnter: () => {
    if (selectedTagId.value && roleStore.currentRole === 'manager') {
      openForm(selectedTagId.value)
    }
  },
})

const editTagData = computed(() =>
  editTagId.value ? tagStore.getTagById(editTagId.value) ?? null : null
)

const statusOptions = [
  { label: '全部状态', value: '' },
  { label: '已上架', value: 'on_shelf' },
  { label: '已下架', value: 'off_shelf' },
  { label: '待复核', value: 'under_review' },
  { label: '已隐藏', value: 'hidden' },
]

const reviewCount = computed(() => tagStore.reviewTags.length)
</script>

<template>
  <div class="app-layout">
    <header class="app-header">
      <div class="header-left">
        <h1 class="app-title">
          <span class="title-icon">✂</span>
          手作短签
        </h1>
      </div>

      <div class="header-center">
        <RoleSelector />
      </div>

      <div class="header-right">
        <SearchBar ref="searchBarRef" v-model="searchQuery" />

        <el-select
          v-model="statusFilter"
          class="status-filter"
          size="default"
        >
          <el-option
            v-for="opt in statusOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>

        <el-button
          v-if="roleStore.currentRole === 'manager'"
          type="primary"
          class="add-btn"
          @click="openForm()"
        >
          + 新增短签
        </el-button>

        <el-badge :value="reviewCount" :hidden="reviewCount === 0">
          <el-button
            class="review-btn"
            @click="reviewVisible = true"
          >
            复核队列
          </el-button>
        </el-badge>
      </div>
    </header>

    <main class="app-main">
      <div v-if="filteredTags.length === 0" class="empty-state">
        <span class="empty-icon">🏷</span>
        <h3>暂无短签数据</h3>
        <p v-if="roleStore.currentRole === 'manager'">按 Ctrl+N 创建第一个短签</p>
      </div>

      <div v-else class="tag-grid">
        <TransitionGroup name="grid">
          <TagCard
            v-for="tag in filteredTags"
            :key="tag.id"
            :tag="tag"
            :selected="tag.id === selectedTagId"
            :data-tag-id="tag.id"
            @click="selectTag(tag.id)"
            @contextmenu="handleCardContextmenu($event, tag.id)"
          />
        </TransitionGroup>
      </div>

      <div v-if="selectedTag && roleStore.currentRole === 'manager'" class="detail-panel">
        <div class="detail-header">
          <h3>{{ selectedTag.name }}</h3>
          <div class="detail-actions">
            <el-button size="small" @click="openForm(selectedTag.id)">编辑</el-button>
            <el-button size="small" type="danger" plain @click="handleDelete">删除</el-button>
          </div>
        </div>
        <div class="detail-body">
          <div class="detail-row">
            <span class="detail-label">编号</span>
            <span>{{ selectedTag.code }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">分类</span>
            <span>{{ selectedTag.category }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">价格</span>
            <span>¥{{ selectedTag.price.toFixed(2) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">描述</span>
            <span>{{ selectedTag.description }}</span>
          </div>
          <div v-if="selectedTag.riskNote" class="detail-row risk">
            <span class="detail-label">风险</span>
            <span>⚠ {{ selectedTag.riskNote }}</span>
          </div>
        </div>
      </div>
    </main>

    <ContextMenu
      :menu-state="menuState"
      @action="handleMenuAction"
    />

    <TagFormDialog
      v-model:visible="formVisible"
      :edit-tag="editTagData"
      @saved="ElMessage.success({ message: '短签已保存', duration: 1500 })"
    />

    <ReviewDrawer v-model:visible="reviewVisible" />

    <ShortcutBar />
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-bottom: 50px;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
  background: rgba(253, 246, 236, 0.9);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid $color-border;
  position: sticky;
  top: 0;
  z-index: 50;
  gap: 24px;
}

.header-left {
  flex-shrink: 0;
}

.app-title {
  font-family: $font-display;
  font-size: 22px;
  font-weight: 700;
  color: $color-dark;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;

  .title-icon {
    font-size: 20px;
  }
}

.header-center {
  flex-shrink: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.status-filter {
  width: 130px;

  :deep(.el-input__wrapper) {
    border-radius: $radius-md;
    border-color: $color-border;
  }
}

.add-btn {
  border-radius: $radius-md;
  font-family: $font-body;
  font-weight: 600;
  background-color: $color-warm-brown;
  border-color: $color-warm-brown;

  &:hover {
    background-color: lighten($color-warm-brown, 8%);
  }
}

.review-btn {
  border-radius: $radius-md;
  font-family: $font-body;
  border-color: $color-border;
  color: $color-warm-brown;

  &:hover {
    border-color: $color-warm-brown;
    color: $color-warm-brown;
  }
}

.app-main {
  flex: 1;
  padding: 28px 32px;
  display: flex;
  gap: 24px;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: $color-smoke;
  padding: 80px 20px;

  .empty-icon {
    font-size: 56px;
    display: block;
    margin-bottom: 16px;
  }

  h3 {
    font-family: $font-display;
    font-size: 20px;
    font-weight: 600;
    color: $color-warm-brown;
    margin-bottom: 8px;
  }

  p {
    font-size: 14px;
  }
}

.tag-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  align-content: start;
}

.grid-enter-active {
  transition: all 0.3s ease;
}

.grid-leave-active {
  transition: all 0.2s ease;
}

.grid-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.grid-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.detail-panel {
  width: 320px;
  flex-shrink: 0;
  background: $color-card-bg;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  padding: 20px;
  height: fit-content;
  position: sticky;
  top: 80px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid $color-border;

  h3 {
    font-family: $font-display;
    font-size: 18px;
    font-weight: 700;
    color: $color-dark;
  }

  .detail-actions {
    display: flex;
    gap: 6px;
  }
}

.detail-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-row {
  display: flex;
  gap: 12px;
  font-size: 13px;
  line-height: 1.6;

  &.risk {
    color: $color-terracotta;
  }
}

.detail-label {
  flex-shrink: 0;
  width: 48px;
  font-weight: 600;
  color: $color-smoke;
}

@media (max-width: 1200px) {
  .app-header {
    flex-wrap: wrap;
    gap: 12px;
  }

  .detail-panel {
    display: none;
  }
}

@media (max-width: 900px) {
  .tag-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }

  .header-right {
    flex-wrap: wrap;
  }
}
</style>
