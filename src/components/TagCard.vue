<script setup lang="ts">
import type { MaterialTag } from '@/types'
import { STATUS_LABELS } from '@/types'

const props = defineProps<{
  tag: MaterialTag
  selected: boolean
  multiSelectMode?: boolean
}>()

const emit = defineEmits<{
  contextmenu: [e: MouseEvent]
  click: []
  toggleSelect: []
}>()

const statusColors: Record<string, string> = {
  on_shelf: 'on-shelf',
  off_shelf: 'off-shelf',
  under_review: 'under-review',
  hidden: 'hidden',
}

function handleCheckboxClick(e: MouseEvent) {
  e.stopPropagation()
  emit('toggleSelect')
}
</script>

<template>
  <div
    :class="['tag-card', { selected, featured: tag.isFeatured, 'multi-select': multiSelectMode }]"
    @click="$emit('click')"
    @contextmenu="$emit('contextmenu', $event)"
  >
    <div v-if="multiSelectMode" class="checkbox-wrapper" @click="handleCheckboxClick">
      <div :class="['card-checkbox', { checked: selected }]">
        <span v-if="selected" class="check-icon">✓</span>
      </div>
    </div>

    <div class="card-header">
      <span class="tag-code">{{ tag.code }}</span>
      <span :class="['status-badge', statusColors[tag.status]]">
        {{ STATUS_LABELS[tag.status] }}
      </span>
    </div>

    <div class="card-body">
      <h3 class="tag-name">
        <span v-if="tag.isFeatured" class="featured-star">★</span>
        {{ tag.name }}
      </h3>
      <span class="tag-category">{{ tag.category }}</span>
    </div>

    <p class="tag-desc">{{ tag.description }}</p>

    <div v-if="tag.riskNote" class="risk-note">
      <span class="risk-icon">⚠</span>
      {{ tag.riskNote }}
    </div>

    <div class="card-footer">
      <span class="tag-price">¥{{ tag.price.toFixed(2) }}</span>
      <span class="tag-date">{{ tag.updatedAt }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.tag-card {
  background: $color-card-bg;
  border-radius: $radius-lg;
  padding: 20px;
  border: 1px solid $color-border;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  overflow: hidden;

  &.multi-select {
    padding-left: 52px;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: transparent;
    transition: background 0.3s ease;
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: $shadow-hover;
    border-color: rgba(139, 111, 78, 0.3);
  }

  &.selected {
    border-color: $color-warm-brown;
    box-shadow: 0 0 0 2px rgba(139, 111, 78, 0.2);

    &::before {
      background: $color-warm-brown;
    }
  }

  &.featured {
    border-color: rgba(196, 112, 75, 0.3);

    &::before {
      background: $color-terracotta;
    }
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.tag-code {
  font-family: $font-display;
  font-size: 12px;
  font-weight: 600;
  color: $color-warm-brown;
  background: rgba(139, 111, 78, 0.08);
  padding: 3px 10px;
  border-radius: $radius-sm;
  letter-spacing: 0.04em;
}

.status-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
  letter-spacing: 0.03em;

  &.on-shelf {
    background: rgba(107, 142, 107, 0.12);
    color: $color-moss-green;
  }

  &.off-shelf {
    background: rgba(155, 155, 155, 0.12);
    color: $color-smoke;
  }

  &.under-review {
    background: rgba(196, 112, 75, 0.12);
    color: $color-terracotta;
  }

  &.hidden {
    background: rgba(155, 155, 155, 0.08);
    color: #bbb;
  }
}

.card-body {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 8px;
}

.tag-name {
  font-family: $font-display;
  font-size: 18px;
  font-weight: 700;
  color: $color-dark;
  line-height: 1.3;
}

.featured-star {
  color: $color-terracotta;
  font-size: 16px;
}

.tag-category {
  font-size: 12px;
  color: $color-warm-brown;
  background: rgba(139, 111, 78, 0.06);
  padding: 2px 8px;
  border-radius: $radius-sm;
  white-space: nowrap;
}

.tag-desc {
  font-size: 13px;
  color: #7a6b5d;
  line-height: 1.6;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.risk-note {
  font-size: 12px;
  color: $color-terracotta;
  background: rgba(196, 112, 75, 0.06);
  border: 1px solid rgba(196, 112, 75, 0.12);
  border-radius: $radius-sm;
  padding: 6px 10px;
  margin-bottom: 12px;
  display: flex;
  align-items: flex-start;
  gap: 6px;
  line-height: 1.5;

  .risk-icon {
    flex-shrink: 0;
    font-size: 13px;
  }
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid rgba(232, 213, 192, 0.5);
}

.tag-price {
  font-family: $font-display;
  font-size: 18px;
  font-weight: 700;
  color: $color-terracotta;
}

.tag-date {
  font-size: 11px;
  color: $color-smoke;
}

.checkbox-wrapper {
  position: absolute;
  left: 16px;
  top: 20px;
  z-index: 2;
}

.card-checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid $color-border;
  border-radius: 4px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    border-color: $color-warm-brown;
  }

  &.checked {
    background: $color-warm-brown;
    border-color: $color-warm-brown;
  }
}

.check-icon {
  color: white;
  font-size: 12px;
  font-weight: bold;
  line-height: 1;
}
</style>
