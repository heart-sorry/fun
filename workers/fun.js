// Cloudflare Worker - 数据存储 API
// KV Namespace: fun-kv

const HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

// 默认数据
const DEFAULT_FRIENDS = [
  { avatar: "🌟", name: "朋友A", tag: "最好的朋友", message: "（搜索显示的话）", meetDate: "2024-01-01", secretCode: "暗号A", secretMessage: "（暗号专属的悄悄话）" },
  { avatar: "🌈", name: "朋友B", tag: "老朋友", message: "（搜索显示的话）", meetDate: "2023-06-15", secretCode: "暗号B", secretMessage: "（暗号专属的悄悄话）" }
];

const DEFAULT_MESSAGES = [];

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // CORS 预检
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: HEADERS });
  }

  try {
    // 获取朋友数据
    if (path === '/api/friends' && request.method === 'GET') {
      let friends = await FUN_KV.get('friends');
      if (!friends) {
        friends = JSON.stringify(DEFAULT_FRIENDS);
        await FUN_KV.put('friends', friends);
      }
      return new Response(friends, { headers: HEADERS });
    }

    // 保存朋友数据
    if (path === '/api/friends' && request.method === 'POST') {
      const body = await request.json();
      await FUN_KV.put('friends', JSON.stringify(body));
      return new Response(JSON.stringify({ success: true }), { headers: HEADERS });
    }

    // 获取留言
    if (path === '/api/messages' && request.method === 'GET') {
      let messages = await FUN_KV.get('messages');
      if (!messages) {
        messages = JSON.stringify(DEFAULT_MESSAGES);
        await FUN_KV.put('messages', messages);
      }
      return new Response(messages, { headers: HEADERS });
    }

    // 添加留言
    if (path === '/api/messages' && request.method === 'POST') {
      const body = await request.json();
      let messages = await FUN_KV.get('messages');
      messages = messages ? JSON.parse(messages) : [];
      messages.push(body);
      if (messages.length > 100) messages = messages.slice(-100);
      await FUN_KV.put('messages', JSON.stringify(messages));
      return new Response(JSON.stringify({ success: true }), { headers: HEADERS });
    }

    // 清除留言
    if (path === '/api/messages' && request.method === 'DELETE') {
      await FUN_KV.put('messages', JSON.stringify([]));
      return new Response(JSON.stringify({ success: true }), { headers: HEADERS });
    }

    // 健康检查
    if (path === '/api/health' && request.method === 'GET') {
      return new Response(JSON.stringify({ status: 'ok', kv: 'connected' }), { headers: HEADERS });
    }

    return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404, headers: HEADERS });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: HEADERS });
  }
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});
