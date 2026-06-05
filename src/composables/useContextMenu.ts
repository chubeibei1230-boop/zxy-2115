import { ref, onMounted, onUnmounted } from 'vue'
import type { ContextMenuState } from '@/types'

export function useContextMenu() {
  const menuState = ref<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    tagId: null,
  })

  function openMenu(event: MouseEvent, tagId: string) {
    event.preventDefault()
    event.stopPropagation()
    menuState.value = {
      visible: true,
      x: event.clientX,
      y: event.clientY,
      tagId,
    }
  }

  function closeMenu() {
    menuState.value.visible = false
    menuState.value.tagId = null
  }

  function handleClickOutside() {
    if (menuState.value.visible) {
      closeMenu()
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })

  return { menuState, openMenu, closeMenu }
}
