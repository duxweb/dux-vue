# 认证提供者

认证提供者是 DVHA 中负责处理用户身份验证和授权的核心组件。它提供了一个统一的接口来处理登录、登出、注册、密码重置等认证流程，支持多种认证方式和多管理端独立认证。

## 什么是认证提供者？

认证提供者是一个实现了特定接口的对象，它定义了如何处理用户的认证流程。DVHA 通过认证提供者来执行所有的认证操作，包括：

- **用户登录** (login)
- **用户登出** (logout)
- **认证检查** (check)
- **用户注册** (register)
- **忘记密码** (forgotPassword)
- **重置密码** (updatePassword)
- **错误处理** (onError)

## 简单认证提供者

DVHA 内置了 `simpleAuthProvider`，适用于开发和测试：

```typescript
import { simpleAuthProvider } from '@duxweb/dvha-core'

const config: IConfig = {
  authProvider: simpleAuthProvider(),
  // ... 其他配置
}

// 或者使用自定义配置
const authProvider = simpleAuthProvider({
  apiPath: {
    login: '/auth/login',        // 自定义登录接口路径
    check: '/auth/check',        // 自定义认证检查路径
    logout: '/auth/logout',      // 自定义登出接口路径
    register: '/auth/register',  // 自定义注册接口路径
    forgotPassword: '/auth/forgot',  // 自定义忘记密码路径
    updatePassword: '/auth/reset'    // 自定义重置密码路径
  },
  routePath: {
    login: '/login',             // 登录页面路径
    index: '/dashboard'          // 登录成功后跳转路径
  },
  dataProviderName: 'default'    // 指定使用的数据提供者名称
})
```

::: tip
`simpleAuthProvider` 是一个基于标准认证流程的简单实现，支持基本的登录、登出和认证检查功能，适合快速开始和原型开发。在开发环境中，它会接受任意用户名和密码的登录。
:::

## 认证提供者接口

```typescript
interface IAuthProvider {
  // 用户登录 (必需)
  login: (params: any, manage: IManageHook) => Promise<IAuthLoginResponse>

  // 认证检查 (必需)
  check: (params?: any, manage?: IManageHook) => Promise<IAuthCheckResponse>

  // 用户登出 (必需)
  logout: (params?: any, manage?: IManageHook) => Promise<IAuthLogoutResponse>

  // 用户注册 (必需)
  register: (params: any, manage?: IManageHook) => Promise<IAuthLoginResponse>

  // 忘记密码 (必需)
  forgotPassword: (params: any, manage?: IManageHook) => Promise<IAuthActionResponse>

  // 重置密码 (必需)
  updatePassword: (params: any, manage?: IManageHook) => Promise<IAuthActionResponse>

  // 错误处理 (必需)
  onError: (error?: any) => Promise<IAuthErrorResponse>
}
```

::: warning 重要变更
在最新版本中，认证提供者的所有方法都是必需的。如果某个功能不需要实现，可以返回适当的错误响应而不是省略该方法。
:::

## 参数说明

### 通用参数

每个认证提供者方法都接收以下参数：

- **params**: 请求参数对象，包含具体的操作数据
- **manage**: 当前管理端实例，提供 API URL 构建等功能

### 登录参数

```typescript
// 登录参数示例
interface LoginParams {
  username: string           // 用户名
  password: string           // 密码
  captcha?: string          // 验证码（可选）
  rememberMe?: boolean      // 记住登录状态（可选）
  [key: string]: any        // 其他自定义字段
}
```

### 注册参数

```typescript
// 注册参数示例
interface RegisterParams {
  username: string           // 用户名
  email: string             // 邮箱
  password: string          // 密码
  confirmPassword: string   // 确认密码
  [key: string]: any        // 其他自定义字段
}
```

### 密码重置参数

```typescript
// 忘记密码参数示例
interface ForgotPasswordParams {
  email: string             // 邮箱地址
}

// 重置密码参数示例
interface UpdatePasswordParams {
  token: string             // 重置令牌
  password: string          // 新密码
  confirmPassword: string   // 确认新密码
}
```

## 返回格式

### 基础响应格式

```typescript
interface IAuthActionResponse {
  success: boolean          // 操作是否成功
  message?: string          // 响应消息
  redirectTo?: string       // 重定向地址
  [key: string]: unknown    // 其他自定义字段
}
```

### 登录响应格式

```typescript
interface IAuthLoginResponse extends IAuthActionResponse {
  data?: IUserState         // 用户状态数据
}
```

### 检查响应格式

```typescript
interface IAuthCheckResponse extends IAuthActionResponse {
  data?: IUserState         // 用户状态数据
  logout?: boolean          // 是否需要登出
}
```

### 登出响应格式

```typescript
interface IAuthLogoutResponse extends IAuthActionResponse {
  logout?: boolean          // 是否需要清除状态
}
```

### 错误响应格式

```typescript
interface IAuthErrorResponse {
  logout?: boolean          // 是否需要登出
  redirectTo?: string       // 重定向地址
  error?: any               // 错误信息
}
```

### 用户状态格式

```typescript
interface IUserState {
  token?: string             // 认证令牌
  permissions?: string[]     // 用户权限列表
  info?: Record<string, any> // 用户信息
  [key: string]: any         // 其他自定义字段
}
```

## 响应示例

### 登录成功响应

```typescript
{
  success: true,
  message: "登录成功",
  redirectTo: "/admin",
  data: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    permissions: ["user.read", "user.write"],
    info: {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      avatar: "https://example.com/avatar.jpg"
    }
  }
}
```

### 登录失败响应

```typescript
{
  success: false,
  message: "用户名或密码错误"
}
```

### 认证检查成功响应

```typescript
{
  success: true,
  message: "认证有效",
  data: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    info: {
      id: 1,
      name: "John Doe",
      email: "john@example.com"
    }
  }
}
```

### 认证检查失败响应

```typescript
{
  success: false,
  message: "认证已过期",
  logout: true,
  redirectTo: "/login"
}
```

### 登出响应

```typescript
{
  success: true,
  message: "登出成功",
  redirectTo: "/login",
  logout: true
}
```

## 配置认证提供者

### 基本配置

```typescript
import type { IConfig } from '@duxweb/dvha-core'
import { createDux, simpleAuthProvider } from '@duxweb/dvha-core'

const config: IConfig = {
  manages: [
    {
      name: 'admin',
      title: '管理后台',
      routePrefix: '/admin',
      // ... 其他配置
    }
  ],
  authProvider: simpleAuthProvider(),  // 使用简单认证提供者
}
```

### 自定义认证提供者

```typescript
import type { IAuthProvider } from '@duxweb/dvha-core'

const customAuthProvider: IAuthProvider = {
  login: async (params, manage) => {
    // 您的登录逻辑
    // 使用 manage.getApiUrl('/login') 构建登录 URL
    return {
      success: true,
      message: '登录成功',
      redirectTo: '/admin',
      data: {
        token: 'your-token',
        info: { /* 用户信息 */ }
      }
    }
  },

  check: async (params, manage) => {
    // 您的认证检查逻辑
    return {
      success: true,
      data: { /* 用户状态 */ }
    }
  },

  logout: async (params, manage) => {
    // 您的登出逻辑
    return {
      success: true,
      redirectTo: '/login',
      logout: true
    }
  },

  register: async (params, manage) => {
    // 您的注册逻辑
    return {
      success: true,
      message: '注册成功',
      redirectTo: '/admin',
      data: {
        token: 'new-user-token',
        info: { /* 新用户信息 */ }
      }
    }
  },

  forgotPassword: async (params, manage) => {
    // 您的忘记密码逻辑
    return {
      success: true,
      message: '重置邮件已发送'
    }
  },

  updatePassword: async (params, manage) => {
    // 您的重置密码逻辑
    return {
      success: true,
      message: '密码重置成功',
      redirectTo: '/login'
    }
  },

  onError: async (error) => {
    // 您的错误处理逻辑
    if (error.status === 401) {
      return {
        logout: true,
        redirectTo: '/login',
        error
      }
    }
    return { logout: false, error }
  }
}

const config: IConfig = {
  authProvider: customAuthProvider,
  // ... 其他配置
}
```

### 多管理端认证提供者

不同的管理端可以使用不同的认证提供者：

```typescript
const config: IConfig = {
  manages: [
    {
      name: 'admin',
      authProvider: simpleAuthProvider({
        apiPath: {
          login: '/admin/login',
          check: '/admin/check'
        },
        routePath: {
          login: '/admin/login',
          index: '/admin'
        }
      }),      // 管理端专用
      // ... 其他配置
    },
    {
      name: 'merchant',
      authProvider: simpleAuthProvider({
        apiPath: {
          login: '/merchant/login',
          check: '/merchant/check'
        },
        routePath: {
          login: '/merchant/login',
          index: '/merchant'
        }
      }),   // 商户端专用
      // ... 其他配置
    }
  ],
  authProvider: simpleAuthProvider(),         // 全局后备
}
```

## URL 构建

在认证提供者中，使用 `manage.getApiUrl()` 方法构建完整的 API URL：

```typescript
// 登录接口
const loginUrl = manage.getApiUrl('/login')
// 结果: https://api.example.com/admin/login

// 认证检查接口
const checkUrl = manage.getApiUrl('/check')
// 结果: https://api.example.com/admin/check
```

## 路由守卫

DVHA 自动为需要认证的路由添加守卫，通过 `meta.authorization` 控制：

```typescript
const routes = [
  {
    name: 'admin.login',
    path: 'login',
    component: () => import('./pages/login.vue'),
    meta: {
      authorization: false,    // 不需要认证
    }
  },
  {
    name: 'admin.dashboard',
    path: 'dashboard',
    component: () => import('./pages/dashboard.vue'),
    // meta.authorization 默认为 true，需要认证
  }
]
```

## 错误处理

`onError` 方法用于处理全局的认证错误：

```typescript
onError: async (error) => {
  // 401 未授权 - 需要重新登录
  if (error.status === 401) {
    return {
      logout: true,
      redirectTo: '/login',
      error
    }
  }

  // 403 权限不足 - 可选择是否登出
  if (error.status === 403) {
    return {
      logout: false,  // 不登出，显示权限不足提示
      error
    }
  }

  // 其他错误
  return {
    logout: false,
    error
  }
}
```

## 安全建议

### Token 管理

- 建议将 token 存储在 httpOnly cookie 中以提高安全性
- 实现 token 自动刷新机制
- 设置合理的 token 过期时间

### 认证检查

- 在应用启动时执行认证检查
- 定期检查 token 有效性
- 自动判断过期时间并返回新的 Token
- 在 API 请求失败时自动处理认证错误

## 下一步

了解如何在组件中使用认证功能：

- 🔑 [用户登录 (useLogin)](/hooks/auth/useLogin) - 实现登录功能
- 🚪 [用户登出 (useLogout)](/hooks/auth/useLogout) - 实现登出功能
- ✅ [认证检查 (useCheck)](/hooks/auth/useCheck) - 检查认证状态
- 📝 [用户注册 (useRegister)](/hooks/auth/useRegister) - 实现注册功能
- 🔒 [获取认证信息 (useGetAuth)](/hooks/auth/useGetAuth) - 获取当前用户信息