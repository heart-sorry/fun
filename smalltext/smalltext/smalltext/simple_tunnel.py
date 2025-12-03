#!/usr/bin/env python3
"""
SmallText 简单内网穿透工具

这个工具使用 Python 和 Flask 实现一个简单的反向代理，可以将您的本地 SmallText 网站暴露到公网。
无需复杂配置，只需运行此脚本即可。

使用方法：
1. 确保您的本地 HTTP 服务器正在运行 (端口 8000)
2. 安装依赖：pip install flask requests
3. 运行此脚本：python simple_tunnel.py
4. 根据提示访问公网地址
"""

from flask import Flask, request, Response, send_from_directory
import requests
import time
import threading
import sys
import os

global local_server_url
local_server_url = "http://127.0.0.1:8000"

def check_local_server():
    """检查本地 SmallText 服务器是否正在运行"""
    try:
        response = requests.get(local_server_url, timeout=2)
        return response.status_code == 200
    except:
        return False

def get_public_ip():
    """获取当前主机的公网 IP 地址"""
    try:
        response = requests.get("https://api.ipify.org", timeout=5)
        return response.text.strip()
    except:
        return "无法获取公网 IP"

app = Flask(__name__)

@app.route('/', defaults={'path': ''}, methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
@app.route('/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
def proxy(path):
    """反向代理请求到本地 SmallText 服务器"""
    url = f"{local_server_url}/{path}"
    
    # 处理请求头
    headers = dict(request.headers)
    if 'Host' in headers:
        del headers['Host']
    
    try:
        # 转发请求到本地服务器
        if request.method == 'GET':
            response = requests.get(url, headers=headers, params=request.args, stream=True)
        elif request.method == 'POST':
            response = requests.post(url, headers=headers, data=request.form, json=request.json, stream=True)
        elif request.method == 'PUT':
            response = requests.put(url, headers=headers, data=request.form, json=request.json, stream=True)
        elif request.method == 'DELETE':
            response = requests.delete(url, headers=headers, params=request.args)
        elif request.method == 'OPTIONS':
            response = requests.options(url, headers=headers)
        else:
            return Response("Method not allowed", status=405)
        
        # 处理响应头
        response_headers = dict(response.headers)
        excluded_headers = ['content-encoding', 'content-length', 'transfer-encoding', 'connection']
        for header in excluded_headers:
            if header in response_headers:
                del response_headers[header]
        
        # 返回响应
        return Response(response.content, status=response.status_code, headers=response_headers)
    except Exception as e:
        return Response(f"代理错误: {str(e)}", status=500)

def start_server(port=8080):
    """启动 Flask 代理服务器"""
    print(f"\n🚀 代理服务器正在启动...")
    print(f"📡 本地代理地址: http://0.0.0.0:{port}")
    print(f"🌐 公网访问地址: http://{get_public_ip()}:{port}")
    print(f"\n📱 不同WiFi下的手机可以访问上述公网地址")
    print(f"💡 请确保您的路由器已配置端口映射 (外部端口 {port} -> 内部 IP:{port})")
    print("\n按 Ctrl+C 停止服务器...")
    
    try:
        app.run(host='0.0.0.0', port=port, debug=False, threaded=True)
    except KeyboardInterrupt:
        print("\n🛑 服务器正在关闭...")
        sys.exit(0)

def print_banner():
    """打印工具横幅"""
    banner = """
    ==============================================
             SmallText 简单内网穿透工具
    ==============================================
    """
    print(banner)

def print_usage():
    """打印使用说明"""
    usage = """
使用说明：
1. 确保您的本地 SmallText HTTP 服务器正在运行
   命令：python -m http.server 8000 --bind 0.0.0.0

2. 配置路由器端口映射
   - 登录您的路由器管理界面
   - 找到 "端口映射" 或 "虚拟服务器" 功能
   - 添加映射规则：
     外部端口：8080
     内部 IP：您电脑的局域网 IP (如 192.168.1.100)
     内部端口：8080
     协议：TCP

3. 运行此脚本
   命令：python simple_tunnel.py

4. 访问网站
   - 同一WiFi：http://您的局域网IP:8080
   - 不同WiFi：http://您的公网IP:8080
    """
    print(usage)

def check_dependencies():
    """检查必要的依赖是否已安装"""
    try:
        import flask
        import requests
        return True
    except ImportError:
        return False

def install_dependencies():
    """安装必要的依赖"""
    print("\n📦 正在安装必要的依赖...")
    os.system("pip install flask requests")
    print("✅ 依赖安装完成")

def main():
    """主函数"""
    print_banner()
    
    # 检查本地服务器是否正在运行
    print("🔍 正在检查本地 SmallText 服务器...")
    if not check_local_server():
        print("❌ 本地 SmallText 服务器未运行")
        print("💡 请先运行命令: python -m http.server 8000 --bind 0.0.0.0")
        print("   然后再运行此脚本")
        return
    
    print("✅ 本地 SmallText 服务器正在运行")
    
    # 检查依赖
    if not check_dependencies():
        install_dependencies()
    
    print_usage()
    
    # 启动代理服务器
    start_server()

if __name__ == "__main__":
    main()
