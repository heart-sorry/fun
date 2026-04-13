import re, sys

data = open('index.html', 'r', encoding='utf-8-sig').read()
lines = data.split('\n')

# Find the broken sections by line content
new_lines = []
i = 0
skip_until_saveFriends = False
helpers_inserted = False
funcs_inserted = False

while i < len(lines):
    line = lines[i]
    
    # Insert helper functions after GIST_TOKEN line
    if not helpers_inserted and 'GIST_TOKEN' in line and 'const' in line:
        new_lines.append(line)
        # Insert all helper functions
        new_lines.append('')
        new_lines.append('// Pending queue')
        new_lines.append('function getPending() {')
        new_lines.append("  try { return JSON.parse(localStorage.getItem('msgs_pending') || '[]'); }")
        new_lines.append("  catch { return []; }")
        new_lines.append('}')
        new_lines.append('function setPending(arr) {')
        new_lines.append("  localStorage.setItem('msgs_pending', JSON.stringify(arr));")
        new_lines.append('}')
        new_lines.append('function addPending(msg) {')
        new_lines.append('  const p = getPending();')
        new_lines.append('  if (!p.find(m => m.id === msg.id)) p.push(msg);')
        new_lines.append('  setPending(p);')
        new_lines.append('}')
        new_lines.append('')
        new_lines.append('// Messages')
        new_lines.append('function getMessages() {')
        new_lines.append("  try { return JSON.parse(localStorage.getItem('msgs') || '[]'); }")
        new_lines.append("  catch { return []; }")
        new_lines.append('}')
        new_lines.append('function setMessages(arr) {')
        new_lines.append("  localStorage.setItem('msgs', JSON.stringify(arr));")
        new_lines.append('}')
        new_lines.append('')
        new_lines.append('// Friends')
        new_lines.append('function getFriends() {')
        new_lines.append("  try { return JSON.parse(localStorage.getItem('friends') || '[]'); }")
        new_lines.append("  catch { return []; }")
        new_lines.append('}')
        new_lines.append('function setFriends(arr) {')
        new_lines.append("  localStorage.setItem('friends', JSON.stringify(arr));")
        new_lines.append('}')
        helpers_inserted = True
        # Skip the empty helper section
        i += 1
        while i < len(lines):
            if lines[i].strip().startswith('// ==') or 'GREETINGS' in lines[i]:
                break
            i += 1
        continue
    
    # Replace truncated async with full functions
    if not funcs_inserted and line.strip() == 'async' and i > 0 and 'Gist' in lines[i-1]:
        # This is one of the broken async lines
        # Check which one by looking at the comment above
        if not funcs_inserted:
            # Insert all three functions at once
            new_lines.append('async function pushToGist() {')
            new_lines.append("  const token = localStorage.getItem('gist_token') || GIST_TOKEN;")
            new_lines.append('  if (!token) return false;')
            new_lines.append('  try {')
            new_lines.append('    const data = { messages, friends, updatedAt: new Date().toISOString() };')
            new_lines.append('    const res = await fetch(GIST_API, {')
            new_lines.append("      method: 'PATCH',")
            new_lines.append("      headers: { 'Authorization': 'token ' + token, 'Content-Type': 'application/json' },")
            new_lines.append("      body: JSON.stringify({ description: 'fun-data', files: { 'data.json': { content: JSON.stringify(data) } } })")
            new_lines.append('    });')
            new_lines.append('    return res.ok;')
            new_lines.append('  } catch (e) { return false; }')
            new_lines.append('}')
            new_lines.append('')
            new_lines.append('async function autoSync() {')
            new_lines.append("  const token = localStorage.getItem('gist_token') || GIST_TOKEN;")
            new_lines.append('  if (!token) return;')
            new_lines.append('  const pending = getPending();')
            new_lines.append('  if (pending.length === 0) return;')
            new_lines.append('  try {')
            new_lines.append("    const res = await fetch(GIST_RAW + '?t=' + Date.now());")
            new_lines.append('    if (res.ok) {')
            new_lines.append('      const cloud = await res.json();')
            new_lines.append('      const cloudMessages = Array.isArray(cloud) ? cloud : (cloud.messages || []);')
            new_lines.append('      const cloudFriends = cloud.friends || friends;')
            new_lines.append('      const cloudIds = new Set(cloudMessages.map(m => m.id));')
            new_lines.append('      const newOnes = pending.filter(m => !cloudIds.has(m.id));')
            new_lines.append('      if (newOnes.length > 0) {')
            new_lines.append('        messages = [...newOnes, ...cloudMessages].slice(0, 200);')
            new_lines.append('        friends = cloudFriends;')
            new_lines.append('        if (await pushToGist()) {')
            new_lines.append('          setPending([]);')
            new_lines.append('          renderMessages();')
            new_lines.append('          renderFriends();')
            new_lines.append('        }')
            new_lines.append('      }')
            new_lines.append('    }')
            new_lines.append('  } catch (e) {}')
            new_lines.append('}')
            new_lines.append('')
            new_lines.append('async function loadData() {')
            new_lines.append('  const localMsgs = getMessages();')
            new_lines.append('  const localFriends = getFriends();')
            new_lines.append('  if (localMsgs.length > 0) messages = localMsgs;')
            new_lines.append('  if (localFriends.length > 0) friends = localFriends;')
            new_lines.append('  try {')
            new_lines.append("    const res = await fetch(GIST_RAW + '?t=' + Date.now());")
            new_lines.append('    if (res.ok) {')
            new_lines.append('      const cloud = await res.json();')
            new_lines.append('      if (cloud.messages) {')
            new_lines.append('        messages = cloud.messages;')
            new_lines.append('        friends = cloud.friends || friends;')
            new_lines.append('        setMessages(messages);')
            new_lines.append('        setFriends(friends);')
            new_lines.append('        renderMessages();')
            new_lines.append('        renderFriends();')
            new_lines.append('        autoSync();')
            new_lines.append('        return;')
            new_lines.append('      }')
            new_lines.append('      if (Array.isArray(cloud)) {')
            new_lines.append('        messages = cloud;')
            new_lines.append('        setMessages(messages);')
            new_lines.append('        renderMessages();')
            new_lines.append('      }')
            new_lines.append('    }')
            new_lines.append('  } catch (e) {}')
            new_lines.append('  renderMessages();')
            new_lines.append('  renderFriends();')
            new_lines.append('}')
            funcs_inserted = True
        
        # Skip the current 'async' line and any following broken async lines
        i += 1
        while i < len(lines):
            stripped = lines[i].strip()
            if stripped == 'async' or stripped == '' or stripped.startswith('//'):
                if stripped.startswith('//') and 'saveFriends' not in stripped and 'Gist' not in stripped:
                    # Check if this is a comment for the next broken function
                    if 'async' in lines[i+1] if i+1 < len(lines) else False:
                        i += 1
                        continue
                    else:
                        break
                elif stripped == 'async':
                    i += 1
                    continue
                elif stripped == '':
                    i += 1
                    continue
                else:
                    break
            else:
                break
        continue
    
    new_lines.append(line)
    i += 1

result = '\n'.join(new_lines)
open('index.html', 'w', encoding='utf-8').write(result)
print(f'Done. Original: {len(lines)} lines, New: {len(new_lines)} lines')
