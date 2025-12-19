# 编码规范文档 (Coding Standards)

## 📋 概述

本文档定义了 Alens Photography Portfolio 项目的编码规范，确保代码风格一致性、可读性和可维护性。

## 🎯 目录

1. [TypeScript 规范](#typescript-规范)
2. [React 组件规范](#react-组件规范)
3. [文件命名规范](#文件命名规范)
4. [代码格式化](#代码格式化)
5. [ESLint 规则](#eslint-规则)
6. [注释规范](#注释规范)
7. [Git 提交规范](#git-提交规范)

---

## TypeScript 规范

### 1.1 类型定义

```typescript
// ✅ 使用 interface 定义对象类型
interface User {
  id: string
  name: string
  email: string
}

// ✅ 使用 type 定义联合类型或复杂类型
type Status = 'pending' | 'approved' | 'rejected'

// ✅ 使用 enum 定义枚举
enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  SUPER_ADMIN = 'SUPER_ADMIN'
}
```

### 1.2 变量命名

```typescript
// ✅ 使用 camelCase
const userName = 'John Doe'
const isActive = true
const maxItems = 100

// ✅ 常量使用 UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3
const API_BASE_URL = 'https://api.example.com'

// ✅ 布尔值使用 is/has/can 前缀
const isLoading = true
const hasPermission = false
const canEdit = true
```

### 1.3 函数命名

```typescript
// ✅ 使用 camelCase，以动词开头
function getUserById(id: string): User | null {
  // implementation
}

function validateEmail(email: string): boolean {
  // implementation
}

function handleSubmit(event: Event): void {
  // implementation
}
```

### 1.4 接口和类型命名

```typescript
// ✅ 使用 PascalCase
interface UserProfile {
  // properties
}

type UserProfileProps = {
  // properties
}

// ✅ 组件 Props 命名规范
interface ComponentNameProps {
  title: string
  onSubmit: () => void
  disabled?: boolean
}
```

### 1.5 泛型命名

```typescript
// ✅ 使用有意义的泛型参数名
function createApiResponse<T>(): ApiResponse<T> {
  // implementation
}

interface ContainerProps<T> {
  items: T[]
  renderItem: (item: T) => React.ReactNode
}
```

### 1.6 禁止使用的模式

```typescript
// ❌ 避免 any 类型
// 错误示例
function process(data: any): any {
  return data
}

// ✅ 正确示例
function process<T>(data: T): T {
  return data
}

// ❌ 避免没有返回类型的函数
function handleClick() {
  // implementation
}

// ✅ 正确示例
function handleClick(): void {
  // implementation
}
```

---

## React 组件规范

### 2.1 组件命名

```typescript
// ✅ 使用 PascalCase
export function UserProfile() {
  return <div>...</div>
}

// ✅ 组件文件名使用 PascalCase
// UserProfile.tsx
// ImageForm.tsx
// CategorySelector.tsx
```

### 2.2 组件结构

```typescript
// ✅ 组件文件结构顺序
import React from 'react'
import { Component } from '@/components/ui/component'

// Types
interface ComponentProps {
  // props
}

// Constants
const DEFAULT_VALUE = 'default'

// Component
export function Component({ prop1, prop2 }: ComponentProps) {
  // Hooks
  const [state, setState] = useState()

  // Effects
  useEffect(() => {
    // logic
  }, [])

  // Event handlers
  const handleClick = () => {}

  // Render
  return (
    <div>
      {/* content */}
    </div>
  )
}
```

### 2.3 Hooks 命名

```typescript
// ✅ 自定义 Hook 使用 use 前缀
export function useUser() {
  // implementation
}

export function useApi(endpoint: string) {
  // implementation
}

export function useFileUpload() {
  // implementation
}
```

### 2.4 Props 传递

```typescript
// ✅ 优先使用对象解构
interface Props {
  title: string
  onSubmit: () => void
}

function Component({ title, onSubmit }: Props) {
  // implementation
}

// ❌ 避免使用 props.title
function Component(props: Props) {
  return <div>{props.title}</div>
}
```

### 2.5 事件处理命名

```typescript
// ✅ 使用 handle 前缀 + 事件名
const handleSubmit = () => {}
const handleChange = () => {}
const handleClick = () => {}

// ✅ 使用 on 前缀命名 prop
interface Props {
  onSubmit: () => void
  onChange: (value: string) => void
}
```

---

## 文件命名规范

### 3.1 组件文件

```
// ✅ 使用 PascalCase
UserProfile.tsx
ImageForm.tsx
CategorySelector.tsx

// ✅ 页面组件使用 lowercase
page.tsx
layout.tsx
error.tsx
```

### 3.2 Hook 文件

```
// ✅ 使用 camelCase，以 use 开头
useUser.ts
useApi.ts
useFileUpload.ts
useCategorySelection.ts
```

### 3.3 工具函数文件

```
// ✅ 使用 camelCase
apiClient.ts
validation.ts
errorHandler.ts
audit.ts
```

### 3.4 类型定义文件

```
// ✅ 使用 camelCase
types.ts
user.types.ts
api.types.ts
```

### 3.5 常量文件

```
// ✅ 使用 UPPER_SNAKE_CASE
CONSTANTS.ts
API_ENDPOINTS.ts
```

### 3.6 配置文件

```
// ✅ 配置文件使用 lowercase
eslint.config.mjs
prettierrc
next.config.ts
tsconfig.json
```

---

## 代码格式化

### 4.1 缩进和空格

```typescript
// ✅ 使用 2 空格缩进
function MyComponent() {
  const [state, setState] = useState()

  return (
    <div>
      <span>Content</span>
    </div>
  )
}
```

### 4.2 引号

```typescript
// ✅ 使用单引号
const name = 'John Doe'

// ✅ JSX 属性使用双引号
<div className="container">
  <span title="tooltip">Text</span>
</div>
```

### 4.3 分号

```typescript
// ✅ 始终使用分号
const value = 'test'
const result = process(value)
```

### 4.4 对象和数组

```typescript
// ✅ 对象属性省略引号（除非需要）
const user = {
  name: 'John',
  age: 30,
  'role-id': 'admin' // 特殊字符需要引号
}

// ✅ 尾随逗号
const users = [
  'John',
  'Jane',
  'Bob',
]

// ✅ 简短对象使用单行
const user = { name: 'John', age: 30 }

// ✅ 较长对象使用多行
const user = {
  name: 'John',
  age: 30,
  email: 'john@example.com',
  role: 'admin'
}
```

### 4.5 函数

```typescript
// ✅ 使用箭头函数
const getUser = (id: string) => {
  return userService.getById(id)
}

// ✅ 简短函数使用隐式返回
const double = (x: number) => x * 2

// ✅ 函数参数超过 3 个时使用对象
function createUser({
  name,
  email,
  role,
  age
}: CreateUserParams) {
  // implementation
}
```

---

## ESLint 规则

### 5.1 启用的规则

- `@typescript-eslint/no-unused-vars` - 禁止未使用的变量
- `@typescript-eslint/no-explicit-any` - 禁止 `any` 类型
- `react-hooks/rules-of-hooks` - Hook 使用规则
- `react-hooks/exhaustive-deps` - useEffect 依赖检查
- `import/order` - 导入顺序
- `no-console` - 控制台输出限制
- `eqeqeq` - 强制使用 `===`
- `prefer-const` - 优先使用 `const`

### 5.2 忽略模式

```typescript
// ✅ 使用 _ 前缀忽略未使用参数
function handleSubmit(_event: Event) {
  // event is not used
}

// ✅ 允许 console.log 在开发环境
console.log('Debug info') // 开发环境允许
console.error('Error') // 始终允许
```

---

## 注释规范

### 6.1 函数注释

```typescript
/**
 * 获取用户信息
 * @param id - 用户 ID
 * @returns 用户对象或 null
 */
function getUserById(id: string): User | null {
  // implementation
}
```

### 6.2 组件注释

```typescript
/**
 * 用户资料组件
 * 显示用户的基本信息和头像
 */
export function UserProfile() {
  // implementation
}
```

### 6.3 Hook 注释

```typescript
/**
 * 自定义 Hook，用于管理文件上传
 * 提供上传进度、错误处理和状态管理
 */
export function useFileUpload() {
  // implementation
}
```

### 6.4 TODO 注释

```typescript
// TODO: 实现用户认证功能
// TODO-FIXME: 修复上传进度显示问题
// FIXME: 解决内存泄漏问题
```

---

## Git 提交规范

### 7.1 提交消息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 7.2 类型 (Type)

- `feat` - 新功能
- `fix` - 修复
- `refactor` - 重构
- `docs` - 文档更新
- `style` - 代码格式化
- `test` - 测试相关
- `chore` - 构建过程或辅助工具的变动
- `perf` - 性能优化
- `security` - 安全相关

### 7.3 示例

```bash
feat(auth): add user login functionality

Implement user authentication with JWT tokens
- Add login API endpoint
- Add token validation middleware
- Add logout functionality

Closes #123
```

---

## 工具使用

### 8.1 格式化代码

```bash
# 格式化所有代码
npm run format

# 检查格式是否符合规范
npm run format:check
```

### 8.2 Lint 检查

```bash
# 检查并自动修复
npm run lint

# 仅检查，不修复
npx eslint src
```

### 8.3 TypeScript 类型检查

```bash
# 检查类型
npx tsc --noEmit
```

---

## 最佳实践

### 9.1 组件最佳实践

1. 保持组件小而专注
2. 提取业务逻辑到自定义 Hook
3. 使用 TypeScript 严格模式
4. 避免不必要的嵌套
5. 优先使用函数式组件

### 9.2 性能最佳实践

1. 使用 `React.memo` 避免不必要的重渲染
2. 使用 `useMemo` 和 `useCallback` 缓存计算结果
3. 合理使用 `useEffect` 清理函数
4. 避免在 render 中创建对象

### 9.3 安全最佳实践

1. 验证所有用户输入
2. 使用类型安全的数据获取
3. 避免直接操作 DOM
4. 使用安全的 API 调用

---

## 附录

### A.1 工具配置

- **ESLint**: `eslint.config.mjs`
- **Prettier**: `.prettierrc`
- **TypeScript**: `tsconfig.json`

### A.2 推荐 VS Code 扩展

- ESLint
- Prettier - Code formatter
- TypeScript Hero
- Auto Rename Tag
- Tailwind CSS IntelliSense

### A.3 参考资源

- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [React 官方文档](https://react.dev/)
- [ESLint 规则](https://eslint.org/docs/rules/)
- [Prettier 选项](https://prettier.io/docs/en/options.html)

---

## 总结

遵循这些编码规范将帮助我们：

✅ 保持代码风格一致性
✅ 提高代码可读性
✅ 减少代码审查时间
✅ 降低维护成本
✅ 提高团队协作效率

如有疑问或建议，请随时提出，共同完善编码规范！
