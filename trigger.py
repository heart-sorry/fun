data = open('index.html', 'r', encoding='utf-8-sig').read()
old = "Token 从 GitHub Secrets 注入"
new = "Token 从 GitHub Secrets 注入 v2"
data = data.replace(old, new)
open('index.html', 'w', encoding='utf-8').write(data)
print('Done')
