<script setup lang="ts">
import type { ContextMenuState, Role } from '@/types'
import { CONTEXT_MENU_ITEMS } from '@/types'
import { computed } from 'vue'
import { useRoleStore } from '@/stores/roleStore'
import {
  CopyDocument,
  Star,
  Checked,
  Hide,
} from '@element-plus/icons-vue'

const props = defineProps<{
  menuState: ContextMenuState
}>()

const emit = defineEmits<{
  action: [key: string, tagId: string]
}>()

const roleStore = useRoleStore()

const iconMap: Record<string, any> = {
  CopyDocument,
  Star,
  Checked,
  Hide,
}

const visibleItems = computed(() =>
  CONTEXT_MENU_ITEMS.filter((item) => item.roles.includes(roleStore.currentRole as Role))
)

const menuStyle = computed(() => ({
  left: `${props.menuState.x}px`,
  top: `${menuTop.value}px`,
}))

const menuTop = computed(() => {
  const estimatedHeight = visibleItems.value.length * 40 + 16
  if (props.menuState.y + estimatedHeight > window.innerHeight) {
    return props.menuState.y - estimatedHeight
  }
  return props.menuState.y
})

function onAction(key: string) {
  if (props.menuState.tagId) {
    emit('action', key, props.menuState.tagId)
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="context-menu">
      <div
        v-if="menuState.visible"
        class="context-menu"
        :style="menuStyle"
        @click.stop
      >
        <div class="menu-inner">
          <button
            v-for="item in visibleItems"
            :key="item.key"
            class="menu-item"
            @click="onAction(item.key)"
          >
            <el-icon :size="16">
              <component :is="iconMap[item.icon]" />
            </el-icon>
            <span>{{ item.label }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.context-menu {
  position: fixed;
  z-index: 3000;
  min-width: 180px;
}

.menu-inner {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-radius: $radius-md;
  border: 1px solid $color-border;
  box-shadow: $shadow-lg;
  padding: 6px;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  border: none;
  border-radius: $radius-sm;
  background: transparent;
  color: $color-dark;
  font-family: $font-body;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;

  .el-icon {
    color: $color-warm-brown;
  }

  &:hover {
    background: $color-hover;
    color: $color-warm-brown;
  }
}

.context-menu-enter-active {
  transition: all 0.15s ease;
}

.context-menu-leave-active {
  transition: all 0.1s ease;
}

.context-menu-enter-from,
.context-menu-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
