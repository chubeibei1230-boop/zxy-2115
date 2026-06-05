<script setup lang="ts">
import { ref, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const query = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
  query.value = val
})

function onInput(val: string) {
  query.value = val
  emit('update:modelValue', val)
}

defineExpose({
  focus: () => {
    const input = document.querySelector('.search-input .el-input__inner') as HTMLInputElement
    input?.focus()
  },
})
</script>

<template>
  <div class="search-input">
    <el-input
      :model-value="query"
      placeholder="搜索材料名称、编号或分类…"
      :prefix-icon="Search"
      clearable
      @update:model-value="onInput"
    />
    <kbd class="shortcut-badge">Ctrl+K</kbd>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.search-input {
  position: relative;
  width: 360px;

  :deep(.el-input__wrapper) {
    border-radius: $radius-lg;
    background: rgba(255, 255, 255, 0.7);
    border: 1px solid $color-border;
    box-shadow: $shadow-sm;
    transition: all 0.25s ease;

    &:hover {
      border-color: $color-warm-brown;
    }

    &.is-focus {
      border-color: $color-warm-brown;
      box-shadow: 0 0 0 3px rgba(139, 111, 78, 0.12);
    }
  }

  :deep(.el-input__inner) {
    font-family: $font-body;
    font-size: 14px;
    color: $color-dark;

    &::placeholder {
      color: $color-smoke;
    }
  }
}

.shortcut-badge {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-family: $font-body;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(139, 111, 78, 0.08);
  color: $color-warm-brown;
  border: 1px solid rgba(139, 111, 78, 0.15);
  pointer-events: none;
  line-height: 1.4;
}
</style>
