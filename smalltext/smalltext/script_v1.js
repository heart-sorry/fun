// 延迟获取DOM元素，直到页面完全加载
let loginBtn, logoutBtn, toggleMusicBtnLogin, toggleMusicBtnMain;
let usernameInput, passwordInput, loginMessage, loginContainer;
let mainContent, backgroundMusic;

// 从外部文件获取用户数据（users/userData.js）
// 这里使用全局变量 usersContent，它是在 userData.js 中定义的

// 将用户对象转换为数组，方便查找和验证
const validUsers = Object.values(usersContent);

// 显示用户特定内容
async function showUserContent(user) {
    try {
        // 从对应用户文件夹加载content.json文件
        const response = await fetch(`users/${user.username}/content.json`);
        
        if (!response.ok) {
            throw new Error(`HTTP错误！状态：${response.status}`);
        }
        
        const content = await response.json();
        
        // 更新页面标题和消息
        const titleElement = document.getElementById('user-title');
        const messageElement = document.getElementById('user-message');
        const featuresList = document.getElementById('user-features');
        
        if (titleElement) titleElement.textContent = content.title;
        if (messageElement) messageElement.textContent = content.message;
        
        // 更新功能列表
        if (featuresList) {
            // 清空现有列表
            featuresList.innerHTML = '';
            
            // 添加新的功能列表项
            content.features.forEach(feature => {
                const li = document.createElement('li');
                li.textContent = feature;
                featuresList.appendChild(li);
            });
        }
    } catch (error) {
        console.error('加载用户内容失败:', error);
        // 显示默认错误信息
        const titleElement = document.getElementById('user-title');
        const messageElement = document.getElementById('user-message');
        const featuresList = document.getElementById('user-features');
        
        if (titleElement) titleElement.textContent = '内容加载失败';
        if (messageElement) messageElement.textContent = '无法加载用户特定内容，请稍后重试。';
        if (featuresList) featuresList.innerHTML = '';
    }
}

// 播放背景音乐函数 - 添加检查确保音频元素有src时才尝试播放
function playBackgroundMusic() {
    // 检查是否有音频源
    if (!backgroundMusic.src || backgroundMusic.src === window.location.href) {
        console.log('没有可用的音乐文件');
        updateMusicButtonsText();
        return;
    }
    
    // 由于浏览器策略限制，音频通常需要用户交互才能播放
    // 这里在登录按钮点击事件中尝试播放
    backgroundMusic.volume = 0.3; // 设置音量为30%
    
    backgroundMusic.play().then(() => {
        console.log('背景音乐开始播放');
        updateMusicButtonsText();
    }).catch(error => {
        console.log('无法自动播放音乐:', error);
        // 在控制台提示用户可能需要手动交互
    });
}

// 更新所有音乐控制按钮的文本 - 适配没有音乐文件的情况
function updateMusicButtonsText() {
    // 检查是否有音频源
    if (!backgroundMusic.src || backgroundMusic.src === window.location.href) {
        const btnText = '无音乐文件';
        if (toggleMusicBtnLogin) toggleMusicBtnLogin.textContent = btnText;
        if (toggleMusicBtnMain) toggleMusicBtnMain.textContent = btnText;
        return;
    }
    
    const btnText = backgroundMusic.paused ? '播放音乐' : '暂停音乐';
    if (toggleMusicBtnLogin) toggleMusicBtnLogin.textContent = btnText;
    if (toggleMusicBtnMain) toggleMusicBtnMain.textContent = btnText;
}

// 切换音乐播放/暂停 - 添加检查确保音频元素有src时才尝试播放
function toggleMusic() {
    // 检查是否有音频源
    if (!backgroundMusic.src || backgroundMusic.src === window.location.href) {
        console.log('没有可用的音乐文件');
        return;
    }
    
    if (backgroundMusic.paused) {
        backgroundMusic.play().then(() => {
            updateMusicButtonsText();
        }).catch(error => {
            console.log('播放音乐失败:', error);
        });
    } else {
        backgroundMusic.pause();
        updateMusicButtonsText();
    }
}

// 尝试在页面加载时播放音乐 - 适配没有音乐文件的情况
function initMusicPlayback() {
    // 检查是否有音频源
    if (!backgroundMusic.src || backgroundMusic.src === window.location.href) {
        console.log('没有可用的音乐文件');
        updateMusicButtonsText();
        return;
    }
    
    // 由于浏览器策略限制，音频通常需要用户交互才能播放
    // 尝试直接播放
    playBackgroundMusic();
    
    // 为body添加点击事件监听器，确保在用户交互后能播放音乐
    document.body.addEventListener('click', function() {
        if (backgroundMusic.paused) {
            playBackgroundMusic();
        }
    }, { once: true }); // 只执行一次
}

// 页面加载时的提示和音乐初始化
window.addEventListener('load', function() {
    console.log('页面加载完成');
    
    try {
        // 页面完全加载后获取所有DOM元素
        loginBtn = document.getElementById('login-btn');
        logoutBtn = document.getElementById('logout-btn');
        toggleMusicBtnLogin = document.getElementById('toggle-music-login');
        toggleMusicBtnMain = document.getElementById('toggle-music-main');
        usernameInput = document.getElementById('username');
        passwordInput = document.getElementById('password');
        loginMessage = document.getElementById('login-message');
        loginContainer = document.querySelector('.login-container');
        mainContent = document.getElementById('main-content');
        backgroundMusic = document.getElementById('background-music');
        
        // 重新绑定所有事件监听器
        if (loginBtn) {
            loginBtn.addEventListener('click', async function() {
                const username = usernameInput.value.trim();
                const password = passwordInput.value.trim();
                
                // 验证输入
                if (!username || !password) {
                    loginMessage.textContent = '请输入用户名和密码';
                    return;
                }
                
                // 查找用户
                const currentUser = validUsers.find(user => 
                    user.username === username && user.password === password
                );
                
                if (currentUser) {
                    loginMessage.textContent = '登录成功！';
                    loginMessage.style.color = '#2ecc71';
                    
                    // 显示主内容，隐藏登录容器
                    loginContainer.style.display = 'none';
                    mainContent.classList.remove('hidden');
                    
                    // 显示用户特定内容（异步加载）
                    await showUserContent(currentUser);
                    
                    // 确保音乐在登录后继续播放（如果之前被暂停且有音乐文件）
                    if (backgroundMusic.paused) {
                        playBackgroundMusic();
                    }
                } else {
                    loginMessage.textContent = '用户名或密码错误';
                    loginMessage.style.color = '#e74c3c';
                }
            });
        }
        
        // 为两个音乐控制按钮添加事件监听器
        if (toggleMusicBtnLogin) {
            toggleMusicBtnLogin.addEventListener('click', toggleMusic);
        }
        if (toggleMusicBtnMain) {
            toggleMusicBtnMain.addEventListener('click', toggleMusic);
        }
        
        // 退出登录功能
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                // 重置表单
                usernameInput.value = '';
                passwordInput.value = '';
                loginMessage.textContent = '';
                
                // 显示登录容器，隐藏主内容
                loginContainer.style.display = 'block';
                mainContent.classList.add('hidden');
                
                // 更新音乐按钮文本
                updateMusicButtonsText();
            });
        }
        
        // 添加键盘事件监听，按Enter键可以登录
        if (passwordInput && loginBtn) {
            passwordInput.addEventListener('keypress', function(event) {
                if (event.key === 'Enter') {
                    loginBtn.click();
                }
            });
        }
        
        // 初始化音乐播放
        initMusicPlayback();
    } catch (error) {
        console.error('页面初始化时发生错误:', error);
    }
});