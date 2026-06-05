<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { MaterialTag } from '@/types'
import { CATEGORY_OPTIONS } from '@/types'
import { useTagStore } from '@/stores/tagStore'

const props = defineProps<{
  visible: boolean
  editTag: MaterialTag | null
}>()

const emit = defineEmits<{
  'update:visible': [val: boolean]
  saved: []
}>()

const tagStore = useTagStore()

const isEdit = computed(() => !!props.editTag)

const form = ref({
  name: '',
  code: '',
  category: '',
  description: '',
  price: 0,
  riskNote: '',
  status: 'off_shelf' as MaterialTag['status'],
})

watch(() => props.visible, (val) => {
  if (val && props.editTag) {
    form.value = {
      name: props.editTag.name,
      code: props.editTag.code,
      category: props.editTag.category,
      description: props.editTag.description,
      price: props.editTag.price,
      riskNote: props.editTag.riskNote,
      status: props.editTag.status,
    }
  } else if (val) {
    form.value = {
      name: '',
      code: '',
      category: '',
      description: '',
      price: 0,
      riskNote: '',
      status: 'off_shelf',
    }
  }
})

function handleClose() {
  emit('update:visible', false)
}

function handleSave() {
  if (!form.value.name || !form.value.code || !form.value.category) {
    return
  }

  if (isEdit.value && props.editTag) {
    tagStore.updateTag(props.editTag.id, { ...form.value })
  } else {
    tagStore.addTag({ ...form.value })
  }

  emit('saved')
  emit('update:visible', false)
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="isEdit ? '编辑短签' : '新增短签'"
    width="520px"
    :close-on-click-modal="false"
    class="tag-form-dialog"
    @close="handleClose"
  >
    <el-form :model="form" label-width="80px" label-position="top" class="tag-form">
      <div class="form-row">
        <el-form-item label="材料名称" required>
          <el-input v-model="form.name" placeholder="如：手工植鞣牛皮" />
        </el-form-item>
        <el-form-item label="编号" required>
          <el-input v-model="form.code" placeholder="如：LTH-001" />
        </el-form-item>
      </div>

      <div class="form-row">
        <el-form-item label="分类" required>
          <el-select v-model="form.category" placeholder="选择分类">
            <el-option
              v-for="cat in CATEGORY_OPTIONS"
              :key="cat"
              :label="cat"
              :value="cat"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="价格 (¥)">
          <el-input-number v-model="form.price" :min="0" :precision="2" :step="1" />
        </el-form-item>
      </div>

      <el-form-item label="描述">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="材料详细描述…"
        />
      </el-form-item>

      <el-form-item label="风险提示">
        <el-input
          v-model="form.riskNote"
          type="textarea"
          :rows="2"
          placeholder="如需标注风险提示，请在此填写…"
        />
      </el-form-item>

      <el-form-item v-if="isEdit" label="状态">
        <el-select v-model="form.status">
          <el-option label="已上架" value="on_shelf" />
          <el-option label="已下架" value="off_shelf" />
          <el-option label="待复核" value="under_review" />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSave">
          {{ isEdit ? '保存修改' : '创建短签' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 20px;
}

.tag-form {
  :deep(.el-form-item__label) {
    font-family: $font-body;
    font-weight: 600;
    font-size: 13px;
    color: $color-dark;
    padding-bottom: 4px;
  }

  :deep(.el-input__wrapper),
  :deep(.el-textarea__inner),
  :deep(.el-select .el-input__wrapper) {
    border-radius: $radius-sm;
    border-color: $color-border;

    &:hover {
      border-color: $color-warm-brown;
    }
  }

  :deep(.el-input-number) {
    width: 100%;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;

  :deep(.el-button) {
    border-radius: $radius-sm;
    font-family: $font-body;
  }

  :deep(.el-button--primary) {
    background-color: $color-warm-brown;
    border-color: $color-warm-brown;

    &:hover {
      background-color: lighten($color-warm-brown, 8%);
    }
  }
}
</style>
