# 如何在非同一局域网内访问 SmallText 网站

如果您需要在不在同一个局域网内也能访问和操作 SmallText 网站，可以使用内网穿透技术。以下是几种常用的内网穿透方案：

## 方案一：使用 Cloudflare Tunnel（推荐，免费且稳定）

### 步骤 1：安装 Cloudflare Tunnel

1. 访问 [Cloudflare Zero Trust](https://dash.cloudflare.com/sign-up/zero-trust) 并注册账号
2. 创建一个团队
3. 安装 `cloudflared` 客户端：

   - Windows：
     ```powershell
     choco install cloudflared
     ```
   - macOS：
     ```bash
     brew install cloudflared
     ```
   - Linux：
     ```bash
     curl -L --output cloudflared https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
     chmod +x cloudflared
     ```

### 步骤 2：创建隧道

1. 在 Cloudflare 控制台中，进入「Access」→「Tunnels」
2. 点击「Create a tunnel」
3. 命名您的隧道，点击「Save tunnel」
4. 复制「Install and run cloudflared」命令
5. 在您的服务器上运行该命令

### 步骤 3：配置路由

1. 在 Cloudflare 控制台中，点击「Configure」
2. 添加一个公共主机名（例如：smalltext.yourdomain.com）
3. 设置服务类型为 HTTP，URL 为 `http://localhost:8000`
4. 点击「Save tunnel」

现在您可以通过配置的公共域名访问 SmallText 网站了！

## 方案二：使用 frp（开源，免费）

### 步骤 1：准备一台公网服务器

您需要一台具有公网 IP 的服务器，用于运行 frp 服务端。

### 步骤 2：下载 frp

1. 访问 [frp 发布页面](https://github.com/fatedier/frp/releases) 下载最新版本
2. 在公网服务器上解压 frp
3. 在您的本地电脑上解压 frp

### 步骤 3：配置 frp 服务端

1. 修改公网服务器上的 `frps.ini`：
   ```ini
   [common]
   bind_port = 7000
   ```

2. 启动 frp 服务端：
   ```bash
   ./frps -c ./frps.ini
   ```

### 步骤 4：配置 frp 客户端

1. 修改本地电脑上的 `frpc.ini`：
   ```ini
   [common]
   server_addr = 您的公网服务器 IP
   server_port = 7000

   [smalltext]
   type = http
   local_ip = 127.0.0.1
   local_port = 8000
   remote_port = 8080
   ```

2. 启动 frp 客户端：
   ```bash
   ./frpc -c ./frpc.ini
   ```

现在您可以通过 `http://您的公网服务器 IP:8080` 访问 SmallText 网站了！

## 方案三：使用 ngrok（简单，但免费版有限制）

### 步骤 1：注册 ngrok 账号

访问 [ngrok 官网](https://ngrok.com/) 注册账号

### 步骤 2：获取 authtoken

1. 登录 ngrok 控制台
2. 进入「Your Authtoken」页面
3. 复制您的 authtoken

### 步骤 3：安装并运行 ngrok

1. 安装 ngrok：
   ```bash
   npm install -g ngrok
   ```

2. 配置 authtoken：
   ```bash
   ngrok authtoken 您的authtoken
   ```

3. 启动隧道：
   ```bash
   ngrok http 8000
   ```

4. 在输出中找到转发地址（例如：`https://xxxx-xx-xx-xx-xx.ngrok-free.app`）

现在您可以通过该转发地址访问 SmallText 网站了！

## 方案四：使用花生壳（简单易用，有免费版）

### 步骤 1：下载花生壳客户端

访问 [花生壳官网](https://hsk.oray.com/) 下载并安装花生壳客户端

### 步骤 2：注册账号并登录

1. 注册花生壳账号
2. 登录花生壳客户端

### 步骤 3：创建映射

1. 点击「添加映射」
2. 设置映射信息：
   - 应用名称：SmallText
   - 应用类型：HTTP
   - 内网主机：127.0.0.1
   - 内网端口：8000
3. 点击「确定」

### 步骤 4：获取访问地址

创建映射后，花生壳会生成一个访问地址，您可以使用该地址访问 SmallText 网站。

## 注意事项

1. 确保您的本地 HTTP 服务器正在运行（端口 8000）
2. 防火墙设置：确保您的本地防火墙允许外部访问端口 8000
3. 安全性：公网访问会带来安全风险，请确保：
   - 使用强密码
   - 定期更新密码
   - 考虑限制访问 IP
   - 如可能，使用 HTTPS

## 本地 HTTP 服务器启动命令

确保您已经在 `smalltext` 目录下：

```bash
python -m http.server 8000 --bind 0.0.0.0
```

## 常见问题

### 问题 1：无法访问公网地址

- 检查本地 HTTP 服务器是否正在运行
- 检查内网穿透工具是否正常运行
- 检查防火墙设置
- 检查路由配置是否正确

### 问题 2：访问速度慢

- 尝试更换内网穿透工具
- 选择更近的服务器节点
- 考虑升级到付费版以获得更好的性能

### 问题 3：连接不稳定

- 检查网络连接
- 尝试重启内网穿透工具
- 检查服务器负载

通过以上任一方案，您都可以在不在同一个局域网内也能访问和操作 SmallText 网站。祝您使用愉快！