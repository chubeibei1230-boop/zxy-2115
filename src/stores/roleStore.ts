import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Role } from '@/types'
import { ROLE_LABELS } from '@/types'

export const useRoleStore = defineStore('role', () => {
  const currentRole = ref<Role>('manager')

  const roleLabel = computed(() => ROLE_LABELS[currentRole.value])

  function setRole(role: Role) {
    currentRole.value = role
  }

  return { currentRole, roleLabel, setRole }
})
