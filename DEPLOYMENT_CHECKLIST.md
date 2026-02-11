# CI/CD 部署配置清单

## 文件说明

本次配置的 CI/CD 包含以下文件：

| 文件 | 说明 |
|------|------|
| `.github/workflows/ci.yml` | 持续集成：代码检查、测试、构建 |
| `.github/workflows/deploy.yml` | 持续部署：部署到腾讯服务器 |
| `.github/workflows/README.md` | 详细配置说明文档 |
| `ecosystem.config.js` | PM2 进程管理配置 |

---

## 快速配置步骤

### 1. 配置 GitHub Secrets

在 GitHub 仓库页面：
**Settings → Secrets and variables → Actions → New repository secret**

添加以下必需的 Secrets：

```
SSH_PRIVATE_KEY     # 服务器 SSH 私钥
SSH_HOST            # 服务器 IP 或域名
SSH_USER            # SSH 用户名（如 root 或 ubuntu）
DEPLOY_PATH         # 部署路径（默认：/var/www/alens-portfolio）
DATABASE_URL        # 数据库连接字符串
NEXTAUTH_SECRET     # NextAuth 密钥（生成：openssl rand -base64 32）
NEXTAUTH_URL        # 网站域名（如 https://your-domain.com）
```

可选（如果使用腾讯云 COS）：
```
COS_SECRET_ID
COS_SECRET_KEY
COS_BUCKET
COS_REGION
COS_BASE_URL
```

---

### 2. 配置服务器

#### 安装 Node.js 20
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### 安装 PM2
```bash
sudo npm install -g pm2
```

#### 配置 SSH 密钥登录
在本地电脑执行：
```bash
cat ~/.ssh/id_ed25519.pub
# 复制输出内容
```

在服务器上执行：
```bash
mkdir -p ~/.ssh
echo "粘贴刚才复制的公钥" >> ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

#### 创建部署目录
```bash
sudo mkdir -p /var/www/alens-portfolio
sudo chown -R $(whoami):$(whoami) /var/www/alens-portfolio
sudo mkdir -p /var/log/pm2
```

---

### 3. 配置 Nginx（推荐）

安装 Nginx：
```bash
sudo apt update
sudo apt install nginx
```

创建配置文件：
```bash
sudo nano /etc/nginx/sites-available/alens-portfolio
```

粘贴以下内容：
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

---

### 4. 配置 HTTPS（可选但推荐）

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

### 5. 首次部署

推送到 main 分支会自动触发部署：
```bash
git add .
git commit -m "Add CI/CD configuration"
git push origin main
```

或在 GitHub Actions 页面手动触发：
1. 打开 GitHub 仓库
2. 点击 Actions 标签
3. 选择 "Deploy to Tencent Server"
4. 点击 "Run workflow"

---

## 验证部署

### 检查 GitHub Actions 状态
- 打开 GitHub 仓库 → Actions 标签
- 查看工作流运行状态

### 检查服务器应用状态
```bash
# SSH 登录服务器
ssh root@your-server-ip

# 查看 PM2 状态
pm2 status

# 查看应用日志
pm2 logs alens-portfolio

# 查看应用是否监听端口
ss -tlnp | grep 3000
```

### 访问网站
```
http://your-domain.com
```

---

## 常见问题

### Q: Actions 显示 "SSH connection failed"
**A:** 检查 SSH_PRIVATE_KEY、SSH_HOST、SSH_USER 是否正确，以及服务器是否允许 SSH 登录

### Q: 部署成功但网站无法访问
**A:** 检查：
- PM2 进程是否运行：`pm2 status`
- 端口是否开放：`sudo ufw allow 3000`
- Nginx 配置是否正确

### Q: 数据库迁移失败
**A:** 确保 DATABASE_URL 正确，且服务器上有写权限

---

## 后续维护

### 更新代码并重新部署
只需推送到 main 分支即可自动部署：
```bash
git push origin main
```

### 手动重启应用
```bash
pm2 reload alens-portfolio
```

### 查看日志
```bash
pm2 logs alens-portfolio
# 或查看日志文件
tail -f /var/log/pm2/alens-portfolio-error.log
```
