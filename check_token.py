import urllib.request, re, time

time.sleep(60)  # wait for deployment

data = urllib.request.urlopen('https://heart-sorry.github.io/fun/').read().decode('utf-8')
m = re.search(r"const GIST_TOKEN = '([^']*)'", data)
if m and m.group(1):
    print(f"GIST_TOKEN: INJECTED ({m.group(1)[:6]}...)")
else:
    print("GIST_TOKEN: EMPTY - still not injected")
