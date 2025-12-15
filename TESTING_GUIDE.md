# 测试指南

## ✅ **服务器状态检查**

服务器已在 http://localhost:3000 成功启动
- ✓ Next.js 编译完成
- ✓ Turbopack 加速
- ✓ 所有依赖加载完成

---

## 🔍 **功能测试清单**

### 1. 前台首页测试
**访问**: http://localhost:3000

- [ ] 页面正常加载
- [ ] 显示作品集图片轮播
- [ ] 导航栏显示（HOME、PORTFOLIO、WORKS、ABOUT、CONTACT）
- [ ] 图片自动轮播（5秒间隔）
- [ ] 点击导航可切换分类

### 2. 后台登录测试
**访问**: http://localhost:3000/admin/login

- [ ] 自动重定向到登录页（说明中间件工作正常）
- [ ] 输入管理员凭据：
  - 邮箱: `admin@alens.com`
  - 密码: `admin123`
- [ ] 点击"Sign In"按钮
- [ ] 成功跳转到仪表盘

### 3. 仪表盘测试
**访问**: http://localhost:3000/admin/dashboard

- [ ] 显示统计数据：
  - Categories（分类数量）
  - Images（图片数量）
  - Navigation Items（导航项数量）
- [ ] 侧边栏导航正常工作

### 4. 导航管理测试
**访问**: http://localhost:3000/admin/navigation

- [ ] 显示导航层级结构
- [ ] 顶级菜单项（HOME、PORTFOLIO、WORKS、ABOUT、CONTACT）
- [ ] 二级菜单项（ARCHITECTURE、LANDSCAPE、PORTRAIT 等）

### 5. 分类管理测试
**访问**: http://localhost:3000/admin/categories

- [ ] 显示所有分类卡片
- [ ] 每个分类显示：
  - 分类名称
  - 图片数量
  - Slug
  - 排序顺序
  - 状态（Active/Inactive）

### 6. 图片管理测试
**访问**: http://localhost:3000/admin/images

- [ ] 显示图片网格视图
- [ ] 每个图片卡片显示：
  - 缩略图预览
  - Alt 文本
  - 所属分类
  - 轮播图标记（蓝色）
  - 可见性状态（绿色=显示，灰色=隐藏）

---

## 🐛 **常见问题解决**

### Q: 页面显示空白
**A**: 检查浏览器控制台是否有错误，或尝试刷新页面

### Q: 登录失败
**A**: 确保已运行种子脚本创建管理员账户
```bash
node prisma/seed.js
```

### Q: 图片无法加载
**A**: 图片使用 Unsplash CDN，需要网络连接

### Q: 统计数据为 0
**A**: 检查数据库是否存在
```bash
ls prisma/dev.db
```

---

## 🔧 **API 测试**

您也可以直接测试 API 端点：

### 获取导航列表
```bash
curl http://localhost:3000/api/navigation
```

### 获取分类列表
```bash
curl http://localhost:3000/api/categories
```

### 获取图片列表
```bash
curl http://localhost:3000/api/images
```

---

## 📊 **预期结果**

- **分类数量**: 8 个
- **图片数量**: 29 张
- **导航项**: 5 个顶级菜单
- **轮播图**: 5 张（首页分类）

---

## 🚀 **下一步**

完成测试后，您可以继续开发：

1. **重构前台页面** - 将 `page.tsx` 改为使用 API 数据
2. **增强管理功能** - 添加创建/编辑表单
3. **实现拖拽排序** - 使用 @dnd-kit
4. **添加图片上传** - 使用 react-dropzone

---

*测试指南 v1.0 - 2025-12-15*
