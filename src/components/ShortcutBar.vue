<script setup lang="ts">
import { computed } from 'vue'
import type { Role } from '@/types'
import { useRoleStore } from '@/stores/roleStore'

const roleStore = useRoleStore()

const shortcuts = computed(() => {
  const role = roleStore.currentRole as Role
  const base = [
    { key: 'Ctrl+K', desc: '搜索' },
    { key: '↑↓', desc: '选择卡片' },
    { key: 'Esc', desc: '关闭弹窗' },
    { key: 'Ctrl+M', desc: '右键菜单' },
  ]

  if (role === 'manager') {
    return [
      { key: 'Ctrl+N', desc: '新增短签' },
      { key: 'Ctrl+B', desc: '批量整理' },
      { key: 'Shift+点击', desc: '连续选择' },
      { key: 'Ctrl+A', desc: '全选' },
      ...base,
    ]
  }

  if (role === 'assistant') {
    return [
      { key: '空格', desc: '切换上架' },
      { key: 'Ctrl+B', desc: '批量整理' },
      { key: 'Shift+点击', desc: '连续选择' },
      ...base,
    ]
  }

  if (role === 'reviewer') {
    return [
      { key: 'Ctrl+R', desc: '复核队列' },
      ...base,
    ]
  }

  return base
})
</script>

<template>
  <div class="shortcut-bar">
    <div class="shortcuts">
      <div
        v-for="item in shortcuts"
        :key="item.key"
        class="shortcut-item"
      >
        <kbd>{{ item.key }}</kbd>
        <span class="shortcut-desc">{{ item.desc }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.shortcut-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(253, 246, 236, 0.85);
  backdrop-filter: blur(12px);
  border-top: 1px solid $color-border;
  padding: 10px 32px;
}

.shortcuts {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
}

.shortcut-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

kbd {
  font-family: $font-body;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid $color-border;
  color: $color-warm-brown;
  box-shadow: 0 1px 0 $color-border;
  line-height: 1.5;
}

.shortcut-desc {
  font-size: 12px;
  color: $color-smoke;
}
</style>
