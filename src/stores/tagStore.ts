import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { MaterialTag, TagStatus } from '@/types'
import mockTags from '@/data/mockTags'

const STORAGE_KEY = 'craft-tag-manager-tags'

function loadTags(): MaterialTag[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {}
  return [...mockTags]
}

function saveTags(tags: MaterialTag[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tags))
}

export const useTagStore = defineStore('tag', () => {
  const tags = ref<MaterialTag[]>(loadTags())
  const selectedTagIds = ref<Set<string>>(new Set())
  const lastSelectedIndex = ref<number | null>(null)

  const visibleTags = computed(() =>
    tags.value.filter((t) => !t.isHidden)
  )

  const reviewTags = computed(() =>
    tags.value.filter((t) => t.needsReview && t.status !== 'hidden')
  )

  const featuredTags = computed(() =>
    tags.value.filter((t) => t.isFeatured && !t.isHidden)
  )

  const selectedTags = computed(() =>
    tags.value.filter((t) => selectedTagIds.value.has(t.id))
  )

  const selectedCount = computed(() => selectedTagIds.value.size)

  const hasSelection = computed(() => selectedTagIds.value.size > 0)

  function persist() {
    saveTags(tags.value)
  }

  function selectTag(id: string) {
    selectedTagIds.value.add(id)
  }

  function deselectTag(id: string) {
    selectedTagIds.value.delete(id)
  }

  function toggleTagSelection(id: string) {
    if (selectedTagIds.value.has(id)) {
      selectedTagIds.value.delete(id)
    } else {
      selectedTagIds.value.add(id)
    }
  }

  function selectAll(ids: string[]) {
    selectedTagIds.value = new Set(ids)
  }

  function deselectAll() {
    selectedTagIds.value.clear()
    lastSelectedIndex.value = null
  }

  function isTagSelected(id: string): boolean {
    return selectedTagIds.value.has(id)
  }

  function batchToggleStatus(ids: string[], targetStatus: 'on_shelf' | 'off_shelf') {
    const now = new Date().toISOString().slice(0, 10)
    ids.forEach((id) => {
      const tag = tags.value.find((t) => t.id === id)
      if (tag && tag.status !== 'under_review' && tag.status !== 'hidden' && !tag.isHidden) {
        tag.status = targetStatus
        tag.updatedAt = now
      }
    })
    persist()
  }

  function batchMoveToReview(ids: string[]) {
    const now = new Date().toISOString().slice(0, 10)
    ids.forEach((id) => {
      const tag = tags.value.find((t) => t.id === id)
      if (tag) {
        tag.needsReview = true
        tag.status = 'under_review'
        tag.isHidden = false
        tag.updatedAt = now
      }
    })
    persist()
  }

  function batchHideTags(ids: string[]) {
    const now = new Date().toISOString().slice(0, 10)
    ids.forEach((id) => {
      const tag = tags.value.find((t) => t.id === id)
      if (tag) {
        tag.isHidden = true
        tag.status = 'hidden'
        tag.updatedAt = now
      }
    })
    persist()
  }

  function getSelectedSummary(): string {
    return selectedTags.value
      .map((tag) => `${tag.name} (${tag.code})\n分类: ${tag.category}\n价格: ¥${tag.price.toFixed(2)}\n${tag.description}`)
      .join('\n\n---\n\n')
  }

  function addTag(tag: Omit<MaterialTag, 'id' | 'createdAt' | 'updatedAt' | 'isFeatured' | 'isHidden' | 'needsReview'>) {
    const now = new Date().toISOString().slice(0, 10)
    const newTag: MaterialTag = {
      ...tag,
      id: Date.now().toString(),
      isFeatured: false,
      isHidden: false,
      needsReview: false,
      createdAt: now,
      updatedAt: now,
    }
    tags.value.unshift(newTag)
    persist()
  }

  function updateTag(id: string, data: Partial<MaterialTag>) {
    const idx = tags.value.findIndex((t) => t.id === id)
    if (idx !== -1) {
      const merged: Partial<MaterialTag> = { ...data }
      if (merged.status) {
        if (merged.status === 'under_review') {
          merged.needsReview = true
        } else {
          merged.needsReview = false
        }
        if (merged.status === 'hidden') {
          merged.isHidden = true
        } else {
          merged.isHidden = false
        }
      }
      tags.value[idx] = {
        ...tags.value[idx],
        ...merged,
        updatedAt: new Date().toISOString().slice(0, 10),
      }
      persist()
    }
  }

  function deleteTag(id: string) {
    tags.value = tags.value.filter((t) => t.id !== id)
    persist()
  }

  function toggleFeatured(id: string) {
    const tag = tags.value.find((t) => t.id === id)
    if (tag) {
      tag.isFeatured = !tag.isFeatured
      tag.updatedAt = new Date().toISOString().slice(0, 10)
      persist()
    }
  }

  function toggleStatus(id: string, allowAll: boolean = false) {
    const tag = tags.value.find((t) => t.id === id)
    if (tag) {
      if (!allowAll && (tag.status === 'under_review' || tag.status === 'hidden' || tag.isHidden)) {
        return
      }
      tag.status = tag.status === 'on_shelf' ? 'off_shelf' : 'on_shelf'
      tag.updatedAt = new Date().toISOString().slice(0, 10)
      persist()
    }
  }

  function moveToReview(id: string) {
    const tag = tags.value.find((t) => t.id === id)
    if (tag) {
      tag.needsReview = true
      tag.status = 'under_review'
      tag.isHidden = false
      tag.updatedAt = new Date().toISOString().slice(0, 10)
      persist()
    }
  }

  function hideTag(id: string) {
    const tag = tags.value.find((t) => t.id === id)
    if (tag) {
      tag.isHidden = true
      tag.status = 'hidden'
      tag.updatedAt = new Date().toISOString().slice(0, 10)
      persist()
    }
  }

  function unhideTag(id: string) {
    const tag = tags.value.find((t) => t.id === id)
    if (tag) {
      tag.isHidden = false
      tag.status = 'off_shelf'
      tag.updatedAt = new Date().toISOString().slice(0, 10)
      persist()
    }
  }

  function confirmReview(id: string) {
    const tag = tags.value.find((t) => t.id === id)
    if (tag) {
      tag.needsReview = false
      tag.status = 'on_shelf'
      tag.isHidden = false
      tag.updatedAt = new Date().toISOString().slice(0, 10)
      persist()
    }
  }

  function rejectReview(id: string) {
    const tag = tags.value.find((t) => t.id === id)
    if (tag) {
      tag.needsReview = false
      tag.status = 'off_shelf'
      tag.isHidden = false
      tag.updatedAt = new Date().toISOString().slice(0, 10)
      persist()
    }
  }

  function searchTags(query: string, statusFilter?: TagStatus): MaterialTag[] {
    const q = query.toLowerCase().trim()
    return tags.value.filter((t) => {
      if (t.isHidden && statusFilter !== 'hidden') return false
      if (statusFilter && t.status !== statusFilter) return false
      if (!q) return true
      return (
        t.name.toLowerCase().includes(q) ||
        t.code.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      )
    })
  }

  function getTagById(id: string) {
    return tags.value.find((t) => t.id === id)
  }

  return {
    tags,
    visibleTags,
    reviewTags,
    featuredTags,
    selectedTags,
    selectedCount,
    hasSelection,
    lastSelectedIndex,
    addTag,
    updateTag,
    deleteTag,
    toggleFeatured,
    toggleStatus,
    moveToReview,
    hideTag,
    unhideTag,
    confirmReview,
    rejectReview,
    searchTags,
    getTagById,
    selectTag,
    deselectTag,
    toggleTagSelection,
    selectAll,
    deselectAll,
    isTagSelected,
    batchToggleStatus,
    batchMoveToReview,
    batchHideTags,
    getSelectedSummary,
  }
})
