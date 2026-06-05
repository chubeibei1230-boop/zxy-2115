export type Role = 'manager' | 'assistant' | 'reviewer'

export type TagStatus = 'on_shelf' | 'off_shelf' | 'under_review' | 'hidden'

export interface MaterialTag {
  id: string
  name: string
  code: string
  category: string
  description: string
  price: number
  isFeatured: boolean
  isHidden: boolean
  status: TagStatus
  riskNote: string
  needsReview: boolean
  createdAt: string
  updatedAt: string
}

export interface ContextMenuState {
  visible: boolean
  x: number
  y: number
  tagId: string | null
}

export const ROLE_LABELS: Record<Role, string> = {
  manager: '主理人',
  assistant: '店员',
  reviewer: '复核人',
}

export const STATUS_LABELS: Record<TagStatus, string> = {
  on_shelf: '已上架',
  off_shelf: '已下架',
  under_review: '待复核',
  hidden: '已隐藏',
}

export const CATEGORY_OPTIONS = [
  '布艺',
  '皮革',
  '木材',
  '金属',
  '陶瓷',
  '纸张',
  '珠饰',
  '线绳',
  '染料',
  '工具',
]

export const CONTEXT_MENU_ITEMS = [
  { key: 'copy', label: '复制短签', icon: 'CopyDocument', roles: ['manager', 'assistant', 'reviewer'] as Role[] },
  { key: 'feature', label: '设为主推', icon: 'Star', roles: ['manager'] as Role[] },
  { key: 'review', label: '移入复核', icon: 'Checked', roles: ['manager'] as Role[] },
  { key: 'hide', label: '隐藏条目', icon: 'Hide', roles: ['manager'] as Role[] },
]
