data = open('index.html', 'r', encoding='utf-8-sig').read()
funcs = ['openCurtain', 'pushToGist', 'autoSync', 'loadData', 'getPending', 'setPending', 'addPending', 'getMessages', 'setMessages', 'getFriends', 'setFriends']
for f in funcs:
    found = f'function {f}' in data
    print(f'{f}: {"OK" if found else "MISSING"}')
