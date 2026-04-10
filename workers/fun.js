// Cloudflare Worker - 数据存储 API
// KV Namespace: fun-kv
// R2 Bucket: fun-images (可选，用于图片存储)

const HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

// 默认数据
const DEFAULT_FRIENDS = [
  { 
    avatar: "🌟", 
    name: "朋友A", 
    tag: "最好的朋友", 
    message: "（搜索显示的话）", 
    meetDate: "2024-01-01",
    birthday: "2000-01-01",
    photos: [],
    secretCode: "暗号A", 
    secretMessage: "（暗号专属的悄悄话）" 
  },
  { 
    avatar: "🌈", 
    name: "朋友B", 
    tag: "老朋友", 
    message: "（搜索显示的话）", 
    meetDate: "2023-06-15",
    birthday: "1999-06-15",
    photos: [],
    secretCode: "暗号B", 
    secretMessage: "（暗号专属的悄悄话）" 
  }
];

const DEFAULT_MESSAGES = [];

const DEFAULT_SETTINGS = {
  anniversaries: [
    { type: 'love', name: '恋爱纪念日', date: '2025-12-25', icon: '💕' },
    { type: 'meet', name: '相识纪念日', date: '2023-01-01', icon: '🤝' }
  ]
};

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

    // 获取单个朋友详情
    if (path.startsWith('/api/friends/') && request.method === 'GET') {
      const name = decodeURIComponent(path.split('/')[3]);
      let friends = await FUN_KV.get('friends');
      friends = friends ? JSON.parse(friends) : DEFAULT_FRIENDS;
      const friend = friends.find(f => f.name === name);
      if (friend) {
        return new Response(JSON.stringify(friend), { headers: HEADERS });
      }
      return new Response(JSON.stringify({ error: 'Friend not found' }), { status: 404, headers: HEADERS });
    }

    // 上传图片（存储在 KV 中，使用 base64）
    if (path === '/api/upload' && request.method === 'POST') {
      const body = await request.json();
      const { friendName, imageData, caption } = body;
      
      // 生成唯一ID
      const photoId = `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 存储图片数据
      const photoData = {
        id: photoId,
        friendName,
        imageData,
        caption: caption || '',
        uploadedAt: new Date().toISOString()
      };
      
      await FUN_KV.put(`photo:${photoId}`, JSON.stringify(photoData));
      
      // 更新朋友的照片列表
      let friends = await FUN_KV.get('friends');
      friends = friends ? JSON.parse(friends) : DEFAULT_FRIENDS;
      const friendIndex = friends.findIndex(f => f.name === friendName);
      if (friendIndex !== -1) {
        if (!friends[friendIndex].photos) friends[friendIndex].photos = [];
        friends[friendIndex].photos.push({
          id: photoId,
          caption: caption || '',
          uploadedAt: photoData.uploadedAt
        });
        await FUN_KV.put('friends', JSON.stringify(friends));
      }
      
      return new Response(JSON.stringify({ success: true, photoId }), { headers: HEADERS });
    }

    // 获取图片
    if (path.startsWith('/api/photo/') && request.method === 'GET') {
      const photoId = path.split('/')[3];
      const photoData = await FUN_KV.get(`photo:${photoId}`);
      if (photoData) {
        return new Response(photoData, { headers: HEADERS });
      }
      return new Response(JSON.stringify({ error: 'Photo not found' }), { status: 404, headers: HEADERS });
    }

    // 删除图片
    if (path.startsWith('/api/photo/') && request.method === 'DELETE') {
      const photoId = path.split('/')[3];
      const photoData = await FUN_KV.get(`photo:${photoId}`);
      if (photoData) {
        const photo = JSON.parse(photoData);
        // 从朋友的照片列表中移除
        let friends = await FUN_KV.get('friends');
        friends = friends ? JSON.parse(friends) : DEFAULT_FRIENDS;
        const friendIndex = friends.findIndex(f => f.name === photo.friendName);
        if (friendIndex !== -1 && friends[friendIndex].photos) {
          friends[friendIndex].photos = friends[friendIndex].photos.filter(p => p.id !== photoId);
          await FUN_KV.put('friends', JSON.stringify(friends));
        }
        // 删除图片数据
        await FUN_KV.delete(`photo:${photoId}`);
        return new Response(JSON.stringify({ success: true }), { headers: HEADERS });
      }
      return new Response(JSON.stringify({ error: 'Photo not found' }), { status: 404, headers: HEADERS });
    }

    // 获取纪念日设置
    if (path === '/api/anniversaries' && request.method === 'GET') {
      let settings = await FUN_KV.get('settings');
      if (!settings) {
        settings = JSON.stringify(DEFAULT_SETTINGS);
        await FUN_KV.put('settings', settings);
      }
      return new Response(settings, { headers: HEADERS });
    }

    // 保存纪念日设置
    if (path === '/api/anniversaries' && request.method === 'POST') {
      const body = await request.json();
      await FUN_KV.put('settings', JSON.stringify(body));
      return new Response(JSON.stringify({ success: true }), { headers: HEADERS });
    }

    // 获取分享数据（用于生成分享卡片）
    if (path.startsWith('/api/share/') && request.method === 'GET') {
      const friendName = decodeURIComponent(path.split('/')[3]);
      let friends = await FUN_KV.get('friends');
      friends = friends ? JSON.parse(friends) : DEFAULT_FRIENDS;
      const friend = friends.find(f => f.name === friendName);
      
      if (friend) {
        // 生成分享数据（不包含敏感信息）
        const shareData = {
          name: friend.name,
          avatar: friend.avatar,
          tag: friend.tag,
          message: friend.message,
          meetDate: friend.meetDate,
          shareId: `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString()
        };
        
        // 存储分享数据（24小时过期）
        await FUN_KV.put(`share:${shareData.shareId}`, JSON.stringify(shareData), { expirationTtl: 86400 });
        
        return new Response(JSON.stringify(shareData), { headers: HEADERS });
      }
      return new Response(JSON.stringify({ error: 'Friend not found' }), { status: 404, headers: HEADERS });
    }

    // 通过分享ID获取分享数据
    if (path.startsWith('/api/share/view/') && request.method === 'GET') {
      const shareId = path.split('/')[4];
      const shareData = await FUN_KV.get(`share:${shareId}`);
      if (shareData) {
        return new Response(shareData, { headers: HEADERS });
      }
      return new Response(JSON.stringify({ error: 'Share link expired or not found' }), { status: 404, headers: HEADERS });
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
      messages.push({
        ...body,
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString()
      });
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
