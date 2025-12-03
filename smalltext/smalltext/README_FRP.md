# SmallText 网站 - FRP 内网穿透指南

## 什么是 FRP？
FRP (Fast Reverse Proxy) 是一个开源的内网穿透工具，可以将您的本地服务暴露到公网，支持 HTTP、HTTPS、TCP 等多种协议。

## 准备工作

### 1. 下载 FRP

访问 [FRP 官方 GitHub](https://github.com/fatedier/frp/releases) 下载适合您系统的版本：

- **Windows 客户端**: 下载 `frp_xxx_windows_amd64.zip`
- **Linux 服务器**: 下载 `frp_xxx_linux_amd64.tar.gz`

### 2. 解压文件

解压下载的压缩包，您将看到以下文件：
- `frpc`: 客户端可执行文件（用于您的电脑）
- `frpc.ini`: 客户端配置文件
- `frps`: 服务器端可执行文件（用于公网服务器）
- `frps.ini`: 服务器端配置文件

## 方案选择

### 方案 A: 使用公共 FRP 服务器（简单，但安全性较低）

1. **寻找公共 FRP 服务器**
   - 在网上搜索 "免费 FRP 服务器" 或 "公共 FRP 服务器"
   - 选择一个可靠的公共 FRP 服务器，获取服务器地址、端口和认证信息

2. **配置客户端**
   - 修改 `frpc.ini` 文件：
     ```ini
     [common]
     server_addr = 公共服务器地址
     server_port = 公共服务器端口
     token = 服务器提供的token（如果有）

     [smalltext]
     type = http
     local_ip = 127.0.0.1
     local_port = 8000
     custom_domains = 您想要的域名（如果服务器支持）
     # 或使用 subdomain（如果服务器支持）
     # subdomain = smalltext
     ```

3. **启动客户端**
   - 在命令行中运行：
     ```bash
     frpc -c frpc.ini
     ```

### 方案 B: 自己搭建 FRP 服务器（安全，推荐）

1. **获取一台公网服务器**
   - 您可以从阿里云、腾讯云、华为云等云服务提供商购买一台便宜的 VPS
   - 推荐配置：1核CPU + 1GB内存 + 10GB硬盘即可

2. **配置服务器端**
   - 将 `frps` 和 `frps.ini` 上传到您的公网服务器
   - 修改 `frps.ini` 文件：
     ```ini
     [common]
     bind_port = 7000      # FRP服务端口
     vhost_http_port = 80  # HTTP服务端口
     token = 123456        # 认证token，建议设置复杂密码
     ```

3. **启动服务器端**
   - 在服务器上运行：
     ```bash
     nohup ./frps -c frps.ini > frps.log 2>&1 &
     ```

4. **配置客户端**
   - 修改您电脑上的 `frpc.ini` 文件：
     ```ini
     [common]
     server_addr = 您的服务器IP
     server_port = 7000
     token = 123456  # 与服务器相同的token

     [smalltext]
     type = http
     local_ip = 127.0.0.1
     local_port = 8000
     custom_domains = 您的域名（如果有）
     # 或使用 subdomain（如果服务器支持）
     # subdomain = smalltext
     ```

5. **启动客户端**
   - 在命令行中运行：
     ```bash
     frpc -c frpc.ini
     ```

## 使用方法

### 1. 确保本地 HTTP 服务器正在运行

在 SmallText 网站目录下运行：
```bash
python -m http.server 8000 --bind 0.0.0.0
```

### 2. 启动 FRP 客户端

根据您选择的方案，启动 FRP 客户端。

### 3. 访问网站

- 如果您使用了自定义域名：在浏览器中输入 `http://您的域名`
- 如果您使用了 subdomain：在浏览器中输入 `http://subdomain.服务器IP`
- 如果您使用了公共服务器：根据服务器提供的地址访问

## 配置示例

### 客户端配置文件 (`frpc.ini`)

```ini
[common]
server_addr = 1.2.3.4          # 服务器IP或域名
server_port = 7000             # 服务器端口
token = your_secure_token      # 认证token

[smalltext_http]
type = http
local_ip = 127.0.0.1
local_port = 8000
custom_domains = smalltext.yourdomain.com

[smalltext_https]              # 可选，如需HTTPS支持
type = https
local_ip = 127.0.0.1
local_port = 8000
custom_domains = smalltext.yourdomain.com
```

### 服务器端配置文件 (`frps.ini`)

```ini
[common]
bind_port = 7000               # FRP服务端口
bind_udp_port = 7001           # UDP端口
vhost_http_port = 80           # HTTP服务端口
vhost_https_port = 443         # HTTPS服务端口
dashboard_port = 7500          # 管理面板端口
dashboard_user = admin         # 管理面板用户名
dashboard_pwd = admin123       # 管理面板密码
token = your_secure_token      # 认证token
max_pool_count = 5             # 最大连接池数量
log_file = ./frps.log          # 日志文件
log_level = info               # 日志级别
log_max_days = 3               # 日志保留天数
```

## 注意事项

1. **安全性**
   - 不要使用过于简单的 token
   - 建议使用 HTTPS 协议
   - 定期更新 FRP 版本

2. **性能**
   - 公共 FRP 服务器可能会有带宽限制
   - 自己搭建的服务器性能取决于您的服务器配置

3. **稳定性**
   - 公共 FRP 服务器可能不稳定
   - 自己搭建的服务器需要确保服务器正常运行

## 常见问题

### Q: 无法访问网站怎么办？
A: 检查以下几点：
   - 本地 HTTP 服务器是否正在运行
   - FRP 客户端和服务器是否正常连接
   - 防火墙是否开放了相关端口
   - 域名解析是否正确

### Q: 网站访问速度很慢？
A: 可能的原因：
   - 公共 FRP 服务器带宽有限
   - 服务器与您的网络连接不稳定
   - 您的本地网络上传速度较慢

### Q: 如何配置 HTTPS？
A: 
   1. 为您的域名申请 SSL 证书
   2. 在服务器端配置 HTTPS 端口
   3. 在客户端配置 HTTPS 类型的隧道

## 其他内网穿透方案

除了 FRP，您还可以尝试其他内网穿透工具：

- **Cloudflare Tunnel**: 免费、稳定、安全，推荐使用
- **ngrok**: 简单易用，但免费版有访问次数限制
- **花生壳**: 商业软件，有免费版本，适合新手

详细使用方法请参考 `README_PUBLIC_ACCESS.md` 文件。

## 测试账号

- **管理员账号**: admin / admin123
- **普通用户账号**: user1 / user1123

## 联系信息

如果您在使用过程中遇到问题，可以参考以下资源：
- [FRP 官方文档](https://gofrp.org/docs/)
- [FRP GitHub 仓库](https://github.com/fatedier/frp)
