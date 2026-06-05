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

  const visibleTags = computed(() =>
    tags.value.filter((t) => !t.isHidden)
  )

  const reviewTags = computed(() =>
    tags.value.filter((t) => t.needsReview && t.status !== 'hidden')
  )

  const featuredTags = computed(() =>
    tags.value.filter((t) => t.isFeatured && !t.isHidden)
  )

  function persist() {
    saveTags(tags.value)
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
  }
})
