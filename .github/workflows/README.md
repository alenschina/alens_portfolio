# GitHub CI/CD 配置说明

本项目配置了完整的 CI/CD 工作流，包括代码检查、测试和自动部署。

## 工作流概览

### 1. CI 工作流 (`ci.yml`)
在每次推送到 `main` 或 `develop` 分支，以及创建 Pull Request 时触发：

- **代码检查**: ESLint + Prettier 格式检查
- **单元测试**: 运行 Vitest 测试套件
- **构建验证**: 确保应用能成功构建

### 2. 部署工作流 (`deploy.yml`)
在推送到 `main` 分支时自动触发，或手动触发：

- **构建应用**: 使用生产环境变量构建
- **部署到服务器**: 通过 SSH 部署到腾讯服务器
- **数据库迁移**: 自动执行 Prisma 数据库迁移
- **应用重启**: 使用 PM2 管理应用进程

## 配置步骤

### 第一步：配置 GitHub Secrets

在 GitHub 仓库设置中添加以下 Secrets（Settings → Secrets and variables → Actions）：

#### 必需 Secrets

| Secret 名称 | 说明 | 示例 |
|------------|------|------|
| `SSH_PRIVATE_KEY` | 服务器 SSH 私钥 | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `SSH_HOST` | 服务器 IP 地址或域名 | `123.456.789.0` 或 `your-domain.com` |
| `SSH_USER` | SSH 登录用户名 | `root` 或 `ubuntu` |
| `DEPLOY_PATH` | 服务器部署路径 | `/var/www/alens-portfolio` |
| `DATABASE_URL` | 数据库连接字符串 | `file:./prod.db` 或 PostgreSQL/MySQL 连接字符串 |
| `NEXTAUTH_SECRET` | NextAuth 密钥 | 随机生成的密钥（可使用 `openssl rand -base64 32`） |
| `NEXTAUTH_URL` | 应用访问地址 | `https://your-domain.com` |

#### 可选 Secrets（如果使用腾讯云 COS）

| Secret 名称 | 说明 |
|------------|------|
| `COS_SECRET_ID` | 腾讯云 COS SecretId |
| `COS_SECRET_KEY` | 腾讯云 COS SecretKey |
| `COS_BUCKET` | COS 存储桶名称 |
| `COS_REGION` | COS 区域（如 `ap-beijing`） |
| `COS_BASE_URL` | COS 访问域名 |

### 第二步：配置服务器环境

#### 1. 安装 Node.js 20

```bash
# 使用 nvm 安装 Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
node -v  # 应显示 v20.x.x
```

#### 2. 安装 PM2

```bash
npm install -g pm2
```

#### 3. 配置 SSH 密钥登录

在本地生成 SSH 密钥对（如果还没有）：

```bash
ssh-keygen -t ed25519 -C "github-actions"
```

将公钥添加到服务器的 `~/.ssh/authorized_keys`：

```bash
# 在服务器上
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "your-public-key" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

将私钥内容复制到 GitHub Secrets 的 `SSH_PRIVATE_KEY`。

#### 4. 创建部署目录

```bash
sudo mkdir -p /var/www/alens-portfolio
sudo chown -R $(whoami):$(whoami) /var/www/alens-portfolio
```

#### 5. 配置 Nginx（反向代理）

安装 Nginx：

```bash
sudo apt update
sudo apt install nginx
```

创建配置文件：

```bash
sudo nano /etc/nginx/sites-available/alens-portfolio
```

添加配置：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/alens-portfolio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 6. 配置 HTTPS（Let's Encrypt）

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 第三步：手动触发首次部署

1. 在 GitHub 仓库页面，进入 Actions 标签
2. 选择 "Deploy to Tencent Server" 工作流
3. 点击 "Run workflow" 按钮
4. 选择环境（production 或 staging）
5. 点击 "Run workflow"

## 常用操作

### 查看部署状态

在 GitHub 仓库页面的 Actions 标签中可以查看所有工作流的运行状态。

### 重启应用

如果需要手动重启应用，可以登录服务器执行：

```bash
pm2 reload alens-portfolio
```

### 查看应用日志

```bash
pm2 logs alens-portfolio
```

### 回滚部署

如果部署出现问题，可以通过以下方式回滚：

1. 在 GitHub 上找到之前的成功部署的 commit
2. 使用 "Revert" 功能创建回滚 PR
3. 合并 PR 后会自动触发新的部署

## 故障排查

### 部署失败：SSH 连接问题

- 检查 `SSH_HOST`、`SSH_USER`、`SSH_PRIVATE_KEY` 是否正确
- 确保服务器的 SSH 端口（默认 22）开放
- 检查服务器的 `~/.ssh/authorized_keys` 权限（应为 600）

### 部署失败：构建错误

- 检查 GitHub Secrets 中的环境变量是否正确设置
- 查看 Actions 日志获取详细错误信息

### 应用启动失败

- 登录服务器检查 PM2 日志：`pm2 logs alens-portfolio`
- 检查端口 3000 是否被占用：`lsof -i :3000`
- 检查环境变量文件是否正确生成：`cat /var/www/alens-portfolio/.env`

## 安全建议

1. **定期轮换 SSH 密钥**
2. **使用强密码的 NEXTAUTH_SECRET**
3. **限制服务器的 SSH 访问 IP**（可通过安全组配置）
4. **定期备份数据库文件**
5. **启用 GitHub 的分支保护规则**，要求 PR 审查后才能合并到 main
