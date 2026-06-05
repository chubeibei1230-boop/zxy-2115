## 1. 架构设计

```mermaid
flowchart TD
    subgraph "前端层"
        A["Vue3 组件"] --> B["Pinia 状态管理"]
        A --> C["Composables 逻辑复用"]
        B --> D["localStorage 持久化"]
    end
    subgraph "组件层"
        E["RoleSelector 角色选择"] --> A
        F["TagCard 短签卡片"] --> A
        G["ContextMenu 右键菜单"] --> A
        H["TagForm 新增/编辑弹窗"] --> A
        I["ReviewDrawer 复核队列"] --> A
        J["ShortcutBar 快捷键提示"] --> A
    end
    subgraph "交互层"
        K["useKeyboard 快捷键"] --> C
        L["useContextMenu 右键菜单"] --> C
        M["useRole 角色管理"] --> C
    end
```

纯前端架构，无后端服务，数据存储于 localStorage。

## 2. 技术说明

- **前端框架**：Vue3@3 + TypeScript@5 + Vite@6
- **UI 组件库**：Element Plus@2
- **状态管理**：Pinia@2（含 localStorage 持久化插件）
- **样式方案**：SCSS + CSS Variables（主题色系统）
- **构建工具**：Vite@6
- **后端**：无
- **数据存储**：localStorage（前端持久化）

## 3. 路由定义

| 路由 | 用途 |
|------|------|
| / | 短签列表主页（含角色选择、搜索、卡片网格、右键菜单） |

单页应用，无需多路由，通过组件状态切换展示不同视图。

## 4. 数据模型

### 4.1 数据模型定义

```mermaid
erDiagram
    Tag {
        string id PK
        string name
        string code
        string category
        string description
        number price
        boolean isFeatured
        boolean isHidden
        string status
        string riskNote
        boolean needsReview
        string createdAt
        string updatedAt
    }
```

### 4.2 数据类型定义

```typescript
type Role = 'manager' | 'assistant' | 'reviewer'

type TagStatus = 'on_shelf' | 'off_shelf' | 'under_review' | 'hidden'

interface MaterialTag {
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
```

## 5. 组件结构

```
src/
├── App.vue
├── main.ts
├── types/
│   └── index.ts
├── stores/
│   ├── tagStore.ts
│   └── roleStore.ts
├── composables/
│   ├── useKeyboard.ts
│   ├── useContextMenu.ts
│   └── useClipboard.ts
├── components/
│   ├── RoleSelector.vue
│   ├── SearchBar.vue
│   ├── TagCard.vue
│   ├── TagGrid.vue
│   ├── ContextMenu.vue
│   ├── TagFormDialog.vue
│   ├── ReviewDrawer.vue
│   └── ShortcutBar.vue
├── styles/
│   ├── variables.scss
│   └── global.scss
└── data/
    └── mockTags.ts
```
