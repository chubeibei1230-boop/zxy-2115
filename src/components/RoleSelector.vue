<script setup lang="ts">
import type { Role } from '@/types'
import { ROLE_LABELS } from '@/types'
import { useRoleStore } from '@/stores/roleStore'

const roleStore = useRoleStore()

const roles: Role[] = ['manager', 'assistant', 'reviewer']

const roleIcons: Record<Role, string> = {
  manager: '👑',
  assistant: '🏪',
  reviewer: '🔍',
}
</script>

<template>
  <div class="role-selector">
    <span class="role-title">当前身份</span>
    <div class="role-buttons">
      <button
        v-for="role in roles"
        :key="role"
        :class="['role-btn', { active: roleStore.currentRole === role }]"
        @click="roleStore.setRole(role)"
      >
        <span class="role-icon">{{ roleIcons[role] }}</span>
        <span class="role-label">{{ ROLE_LABELS[role] }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.role-selector {
  display: flex;
  align-items: center;
  gap: 16px;
}

.role-title {
  font-family: $font-display;
  font-size: 13px;
  font-weight: 600;
  color: $color-warm-brown;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  white-space: nowrap;
}

.role-buttons {
  display: flex;
  gap: 4px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: $radius-lg;
  padding: 4px;
  border: 1px solid $color-border;
}

.role-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border: none;
  border-radius: $radius-md;
  background: transparent;
  color: $color-smoke;
  font-family: $font-body;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
  white-space: nowrap;

  .role-icon {
    font-size: 16px;
  }

  &:hover {
    color: $color-warm-brown;
    background: rgba(139, 111, 78, 0.06);
  }

  &.active {
    background: $color-warm-brown;
    color: $color-cream;
    box-shadow: $shadow-sm;

    .role-label {
      font-weight: 600;
    }
  }
}
</style>
