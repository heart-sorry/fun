// 功能扩展模块 - 图片上传、多纪念日、分享功能

// ==================== 图片上传功能 ====================

// 上传图片到服务器
async function uploadImage(file, friendName, caption = '') {
  try {
    // 将文件转换为 base64
    const base64 = await fileToBase64(file);
    
    const response = await fetch(`${WORKER_URL}/api/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        friendName,
        imageData: base64,
        caption
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      return result.photoId;
    }
    throw new Error('Upload failed');
  } catch (e) {
    console.error('图片上传失败:', e);
    alert('图片上传失败，请重试');
    return null;
  }
}

// 文件转 base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 获取朋友的照片
async function getFriendPhotos(friendName) {
  try {
    const friend = friends.find(f => f.name === friendName);
    if (!friend || !friend.photos) return [];
    
    // 获取每张照片的详情
    const photos = [];
    for (const photo of friend.photos) {
      const response = await fetch(`${WORKER_URL}/api/photo/${photo.id}`);
      if (response.ok) {
        const photoData = await response.json();
        photos.push(photoData);
      }
    }
    return photos;
  } catch (e) {
    console.error('获取照片失败:', e);
    return [];
  }
}

// 删除照片
async function deletePhoto(photoId) {
  try {
    const response = await fetch(`${WORKER_URL}/api/photo/${photoId}`, {
      method: 'DELETE'
    });
    return response.ok;
  } catch (e) {
    console.error('删除照片失败:', e);
    return false;
  }
}

// ==================== 多纪念日功能 ====================

// 纪念日类型配置
const ANNIVERSARY_TYPES = {
  birthday: { name: '生日', icon: '🎂', color: 'birthday' },
  meet: { name: '相识纪念日', icon: '🤝', color: 'meet' },
  love: { name: '恋爱纪念日', icon: '💕', color: 'love' },
  wedding: { name: '结婚纪念日', icon: '💍', color: 'love' },
  other: { name: '其他纪念日', icon: '📅', color: 'love' }
};

// 计算倒计时
function calculateCountdown(targetDate) {
  const target = new Date(targetDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  
  const diff = target - today;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  
  return days;
}

// 获取下一个生日日期（考虑年份）
function getNextBirthday(birthdayDate) {
  const today = new Date();
  const birthDate = new Date(birthdayDate);
  let nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
  
  if (nextBirthday < today) {
    nextBirthday.setFullYear(today.getFullYear() + 1);
  }
  
  return nextBirthday.toISOString().split('T')[0];
}

// 渲染所有纪念日
async function renderAnniversaries() {
  const container = document.getElementById('anniversarySection');
  if (!container) return;
  
  // 加载设置
  let anniversaries = [];
  try {
    const response = await fetch(`${WORKER_URL}/api/anniversaries`);
    if (response.ok) {
      const settings = await response.json();
      anniversaries = settings.anniversaries || [];
    }
  } catch (e) {
    console.log('加载纪念日设置失败:', e);
  }
  
  // 添加朋友的生日
  friends.forEach(friend => {
    if (friend.birthday) {
      anniversaries.push({
        type: 'birthday',
        name: `${friend.name}的生日`,
        date: getNextBirthday(friend.birthday),
        icon: '🎂',
        originalDate: friend.birthday
      });
    }
  });
  
  // 按倒计时排序
  anniversaries.sort((a, b) => {
    const daysA = calculateCountdown(a.date);
    const daysB = calculateCountdown(b.date);
    return daysA - daysB;
  });
  
  // 渲染前3个最近的纪念日
  container.innerHTML = anniversaries.slice(0, 3).map(ann => {
    const days = calculateCountdown(ann.date);
    const config = ANNIVERSARY_TYPES[ann.type] || ANNIVERSARY_TYPES.other;
    const icon = ann.icon || config.icon;
    
    let statusText = '';
    if (days > 0) {
      statusText = `还有 ${days} 天`;
    } else if (days === 0) {
      statusText = '就是今天！';
    } else {
      statusText = `已过 ${Math.abs(days)} 天`;
    }
    
    return `
      <div class="anniversary-card ${config.color}" onclick="showAnniversaryDetail('${ann.name}', '${ann.date}', '${ann.type}')">
        <div class="a-icon">${icon}</div>
        <div class="a-title">${ann.name}</div>
        <div class="a-countdown">${statusText}</div>
        <div class="a-date">${ann.date}</div>
      </div>
    `;
  }).join('');
}

// 显示纪念日详情
function showAnniversaryDetail(name, date, type) {
  const days = calculateCountdown(date);
  let message = '';
  
  if (days > 0) {
    message = `距离${name}还有 ${days} 天！`;
  } else if (days === 0) {
    message = `🎉 今天就是${name}！祝你快乐！`;
  } else {
    message = `${name}已经过去了 ${Math.abs(days)} 天`;
  }
  
  alert(message);
}

// 保存纪念日设置
async function saveAnniversarySettings(anniversaries) {
  try {
    const response = await fetch(`${WORKER_URL}/api/anniversaries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anniversaries })
    });
    return response.ok;
  } catch (e) {
    console.error('保存纪念日设置失败:', e);
    return false;
  }
}

// ==================== 分享功能 ====================

// 生成分享卡片
async function generateShareCard(friendName) {
  try {
    const response = await fetch(`${WORKER_URL}/api/share/${encodeURIComponent(friendName)}`);
    if (!response.ok) throw new Error('Failed to generate share');
    
    const shareData = await response.json();
    return shareData;
  } catch (e) {
    console.error('生成分享卡片失败:', e);
    return null;
  }
}

// 复制分享链接
async function copyShareLink(friendName) {
  const shareData = await generateShareCard(friendName);
  if (!shareData) {
    alert('生成分享链接失败');
    return;
  }
  
  const shareUrl = `${window.location.origin}/?share=${shareData.shareId}`;
  
  try {
    await navigator.clipboard.writeText(shareUrl