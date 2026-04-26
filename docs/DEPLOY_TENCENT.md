# 腾讯云部署指南

这个项目是一个 `Next.js 14` 应用，包含：

- 静态页面
- 动态页面
- App Router
- `src/app/api/llm/chat/route.ts` 服务端代理

因此最稳妥、最少踩坑的部署方式不是纯静态托管，而是：

**腾讯云 Lighthouse 轻量应用服务器 + Node.js + PM2 + Nginx**

---

## 推荐配置

适合当前版本的最低建议：

- 地域：选靠近你目标用户的中国大陆地域
- 系统：`Ubuntu 22.04 LTS`
- 配置：`2核 4G` 起步
- 磁盘：`50G` 足够

如果只是作品集和早期测试，`2核 2G` 也能跑，但余量会比较小。

---

## 1. 初始化服务器

登录服务器后执行：

```bash
sudo apt update
sudo apt install -y nginx git
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

确认版本：

```bash
node -v
npm -v
pm2 -v
nginx -v
```

---

## 2. 拉取项目

```bash
cd /var/www
sudo mkdir -p devils-advocate
sudo chown -R $USER:$USER /var/www/devils-advocate
cd /var/www/devils-advocate
git clone https://github.com/ssz-666/devils-advocate.git .
```

---

## 3. 配置环境变量

在项目根目录创建 `.env.production`：

```bash
cp .env.example .env.production
```

建议至少填写：

```env
NEXT_PUBLIC_APP_URL=https://fanfangbianyou.cn/
NEXT_PUBLIC_BRAND_NAME=Devil's Advocate
NEXT_PUBLIC_DEFAULT_PROVIDER=deepseek
NEXT_PUBLIC_ENABLE_HOSTED_DEEPSEEK=true
DEEPSEEK_API_KEY=你的新DeepSeek服务端密钥
HOSTNAME=0.0.0.0
PORT=3000
```

说明：

- `DEEPSEEK_API_KEY` 必须放服务端，不要放前端源码
- `NEXT_PUBLIC_APP_URL` 要写最终对外访问地址
- 你现在的正式分享域名就是 `https://fanfangbianyou.cn/`

---

## 4. 安装依赖并构建

```bash
npm install
npm run build
```

如果构建成功，说明部署环境已经满足。

---

## 5. 用 PM2 启动

项目根目录已提供：

- `ecosystem.config.cjs`

启动命令：

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

查看运行状态：

```bash
pm2 status
pm2 logs devils-advocate
```

---

## 6. 配置 Nginx 反代

仓库已提供示例配置：

- `deploy/nginx/devils-advocate.conf`

复制到 Nginx：

```bash
sudo cp deploy/nginx/devils-advocate.conf /etc/nginx/sites-available/devils-advocate
sudo ln -s /etc/nginx/sites-available/devils-advocate /etc/nginx/sites-enabled/devils-advocate
sudo nginx -t
sudo systemctl reload nginx
```

当前示例配置已经按你的域名写好：

```nginx
server_name fanfangbianyou.cn www.fanfangbianyou.cn;
```

如果你只是先用 IP 测试，也可以临时改成：

```nginx
server_name _;
```

---

## 7. 配 HTTPS

域名解析到服务器后，推荐用 `certbot`：

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d fanfangbianyou.cn -d www.fanfangbianyou.cn
```

---

## 8. 放行防火墙

如果你启用了 UFW：

```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

腾讯云控制台的安全组也要放行：

- `22`
- `80`
- `443`

---

## 9. 更新发布

后续每次更新代码：

```bash
cd /var/www/devils-advocate
git pull origin main
npm install
npm run build
pm2 restart devils-advocate
```

---

## 10. 国内上线注意事项

如果你的用户主要在中国大陆：

- 自定义域名比裸 IP 更适合长期使用
- 正式公开运营建议考虑 ICP 备案
- 你现在用了服务端代理 DeepSeek，务必关注调用量与限流

建议下一步尽快补：

- 登录体系
- 访问频率限制
- 使用日志
- 异常 IP 封禁

---

## 最简上线路径

如果你想今天就先跑起来，最短路径是：

1. 买一台腾讯云 Lighthouse Ubuntu 服务器
2. 按这份文档装 Node / Nginx / PM2
3. 拉代码
4. 填 `.env.production`
5. `npm run build`
6. `pm2 start ecosystem.config.cjs`
7. 配 Nginx
8. 绑定域名与 HTTPS

这样就能得到一个比 Vercel 更适合中国大陆访问的正式版本。
