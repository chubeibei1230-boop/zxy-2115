import { onMounted, onUnmounted } from 'vue'

interface KeyboardBindings {
  onNew?: () => void
  onSearch?: () => void
  onToggleStatus?: () => void
  onReview?: () => void
  onContextMenu?: () => void
  onEscape?: () => void
  onArrowUp?: () => void
  onArrowDown?: () => void
  onEnter?: () => void
  onToggleMultiSelect?: () => void
  onSelectAll?: () => void
}

export function useKeyboard(bindings: KeyboardBindings) {
  function handleKeyDown(e: KeyboardEvent) {
    const tag = (e.target as HTMLElement).tagName
    const isInput = tag === 'INPUT' || tag === 'TEXTAREA'

    if (e.key === 'Escape') {
      bindings.onEscape?.()
      return
    }

    if (isInput) return

    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'n':
          e.preventDefault()
          bindings.onNew?.()
          return
        case 'k':
          e.preventDefault()
          bindings.onSearch?.()
          return
        case 'r':
          e.preventDefault()
          bindings.onReview?.()
          return
        case 'm':
          e.preventDefault()
          bindings.onContextMenu?.()
          return
        case 'b':
          e.preventDefault()
          bindings.onToggleMultiSelect?.()
          return
        case 'a':
          e.preventDefault()
          bindings.onSelectAll?.()
          return
      }
    }

    switch (e.key) {
      case ' ':
        e.preventDefault()
        bindings.onToggleStatus?.()
        break
      case 'ArrowUp':
        e.preventDefault()
        bindings.onArrowUp?.()
        break
      case 'ArrowDown':
        e.preventDefault()
        bindings.onArrowDown?.()
        break
      case 'Enter':
        bindings.onEnter?.()
        break
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
  })
}
