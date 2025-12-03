from pyngrok import ngrok, conf
import time
import webbrowser
import os

def main():
    print("=== SmallText 内网穿透工具 ===")
    print("正在创建ngrok隧道...")
    
    try:
        # 尝试创建HTTP隧道，指向本地8000端口
        public_url = ngrok.connect(8000, "http")
        
        print(f"\n✅ ngrok隧道已成功创建！")
        print(f"📡 公网访问地址: {public_url}")
        print(f"\n📱 不同WiFi下的手机可以直接访问上述地址")
        print(f"💡 请确保您的本地HTTP服务器正在运行 (端口8000)")
        print("\n按Ctrl+C停止隧道...")
        
        # 自动在浏览器中打开公网地址
        webbrowser.open(str(public_url))
        
        # 更新index.html中的公网访问地址
        update_index_html(str(public_url))
        
        # 保持脚本运行
        while True:
            time.sleep(1)
            
    except Exception as e:
        error_msg = str(e)
        print(f"\n❌ 创建隧道失败: {error_msg}")
        
        if "authentication failed" in error_msg:
            print("\n🔑 认证错误解决方案：")
            print("1. 访问 https://dashboard.ngrok.com/get-started/your-authtoken")
            print("2. 注册/登录ngrok账号")
            print("3. 复制您的Auth Token")
            print("4. 编辑ngrok_tunnel.py文件，取消第6行注释并粘贴您的token")
            print("   例如：ngrok.set_auth_token(\"your_token_here\")")
        elif "connection refused" in error_msg:
            print("\n🔌 连接被拒绝：")
            print("1. 请检查本地HTTP服务器是否正在运行")
            print("2. 确保服务器监听端口为8000")
            print("3. 运行命令: python -m http.server 8000 --bind 0.0.0.0")
        else:
            print("\n📝 请查看错误信息并尝试解决")
        
        # 关闭隧道
        ngrok.kill()
        print("\n隧道已关闭")

def update_index_html(public_url):
    """更新index.html中的公网访问地址"""
    try:
        index_path = os.path.join(os.path.dirname(__file__), "index.html")
        with open(index_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        # 替换公网访问地址
        import re
        new_content = re.sub(r'公网访问地址：<strong>.*?</strong>', f'公网访问地址：<strong>{public_url}</strong>', content)
        
        with open(index_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        
        print(f"\n📄 index.html已更新，公网地址已自动填入")
        
    except Exception as e:
        print(f"\n⚠️ 更新index.html失败: {e}")

if __name__ == "__main__":
    main()