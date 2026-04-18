// Tim Skill Chat Logic
// PC：优先直连 LM Studio（localhost:1234）
// 手机/外网：自动走 Vercel API（/api/chat），需要先在 Vercel 部署

class TimChat {
    constructor() {
        this.apiEndpoint = '/api/chat'; // Vercel serverless（手机用）
        this.localEndpoint = 'http://localhost:1234/v1/chat/completions'; // LM Studio（PC用）
        this.modelName = 'qwen3.5-2b:2';
        this.messages = [];
        this.isProcessing = false;
        this.isLocalAvailable = false;
        this.mode = 'checking'; // 'local' | 'online' | 'offline'

        this.elements = {
            messagesContainer: document.getElementById('chat-messages'),
            input: document.getElementById('chat-input'),
            sendBtn: document.getElementById('send-btn'),
            loadingOverlay: document.getElementById('loading-overlay'),
            statusDot: document.getElementById('status-dot') || null,
            statusText: document.getElementById('status-text') || null
        };

        this.init();
    }

    async init() {
        await this.detectMode();
        setInterval(() => this.detectMode(), 20000);

        this.elements.sendBtn.addEventListener('click', () => this.sendMessage());
        this.elements.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        this.elements.input.focus();
        this.loadHistory();
    }

    async detectMode() {
        // 并行检测：本地 + LAN，找到任一可用就走对应模式
        const tasks = [
            fetch('http://localhost:1234/v1/models', {
                method: 'GET',
                signal: AbortSignal.timeout(2000)
            }).then(r => ({ ok: r.ok, mode: 'local', base: 'http://localhost:1234' })),

            fetch('http://10.164.252.18:1234/v1/models', {
                method: 'GET',
                signal: AbortSignal.timeout(2000)
            }).then(r => ({ ok: r.ok, mode: 'lan', base: 'http://10.164.252.18:1234' }))
        ];

        try {
            const result = await Promise.any(tasks);
            if (result.ok) {
                this.lanEndpoint = result.base + '/v1/chat/completions';
                this.isLocalAvailable = true;
                this.mode = result.mode;
                this._updateStatus();
            }
        } catch (e) {
            this.isLocalAvailable = false;
            this.mode = 'online';
            this._updateStatus();
        }
    }

    _updateStatus() {
        if (!this.elements.statusDot || !this.elements.statusText) return;
        this.elements.statusDot.classList.remove('offline');
        const modeMap = { local: '本地模型', lan: 'LAN模型', online: '在线API' };
        this.elements.statusText.textContent = modeMap[this.mode] || '检查中';

        // 更新头部的徽章
        const badge = document.querySelector('.chat-badge span');
        if (badge) badge.textContent = modeMap[this.mode] || '检查中';

        // 更新底部提示
        const hint = document.querySelector('.chat-hint span');
        const hintMap = { local: 'Tim 数字镜像 · 本地模型运行', lan: 'Tim 数字镜像 · LAN模型运行', online: 'Tim 数字镜像 · 在线API运行' };
        if (hint) hint.textContent = hintMap[this.mode] || '';
    }

    getActiveEndpoint() {
        if (this.isLocalAvailable) return this.localEndpoint;
        if (this.lanEndpoint) return this.lanEndpoint;
        return this.apiEndpoint; // fallback to online
    }

    isModelAvailable() {
        return this.isLocalAvailable || !!this.lanEndpoint;
    }

    loadHistory() {
        const saved = localStorage.getItem('tim-chat-history');
        if (saved) {
            try {
                this.messages = JSON.parse(saved);
                const recent = this.messages.slice(-20);
                this.messages = [];
                recent.forEach(msg => {
                    this.renderMessage(msg.role === 'user' ? 'user' : 'bot', msg.content, false);
                    this.messages.push(msg);
                });
                this.scrollToBottom();
            } catch (e) {
                console.error('load history error:', e);
            }
        }
    }

    saveHistory() {
        localStorage.setItem('tim-chat-history', JSON.stringify(this.messages.slice(-50)));
    }

    getSystemPrompt() {
        return `你是 Tim（天行），不是 AI，不是助手，不是机器人。

## 核心身份
- 名字：Tim
- 年龄：18-19 岁，大一
- 大学：广东海洋大学，自动化专业
- 和三个大三学长一起住宿
- 目标方向：边缘AI全栈
- 所在城市：湛江

## 说话风格（必须遵守）
- 口头禅：「嗯」「来」「额」「好吧」「算了」「不对」「溜了」「怎么了」「晚安」
- 哈哈哈哈哈（5个哈为主）
- 短句为主，不用感叹号，不用句号
- 淡，不激动，不夸张
- 遇到惊讶的事也就「额」「哦」「好吧」

## 核心价值观
务实派，面对选择的典型思维：「大不了复读」「要不...要不然...先这样」。遇到挫折不抱怨太久，想最坏情况但不会卡住。

朋友之间：有仇当场报，但事后会反思认错。

对自己省，对朋友大方。不会在朋友面前装有钱，但帮朋友买东西不吝啬。

实力第一优先级。「实力比我强的，我能服」。

拒绝后悔思维。要洒脱，不要太纠结。

## 硬规则
1. 不说 Tim 在现实中绝不可能说的话
2. 不突然变得热情、完美、无条件包容
3. 保持「淡」的说话风格
4. 可以沉默、敷衍，说「算了」「不行」「不要」「大不了」
5. 不扮演完美的自己，做真实的自己，包括缺点

## 你会说的话
「算了」—— 放弃方案
「大不了」—— 做最坏打算
「直接」—— 不想绕弯子
「怎么了」—— 关心朋友
「溜了」—— 撤退/下线
「哈哈哈/哈哈哈哈哈」—— 笑`;
    }

    async sendMessage() {
        const text = this.elements.input.value.trim();
        if (!text || this.isProcessing) return;

        this.elements.input.value = '';
        this.renderMessage('user', text);
        this.messages.push({ role: 'user', content: text });

        this.isProcessing = true;
        this.elements.sendBtn.disabled = true;
        const typingEl = this.showTyping();

        try {
            if (!this.isModelAvailable()) {
                typingEl.remove();
                this.renderMessage('bot', '本地模型未启动，先开 LM Studio 吧');
                this.isProcessing = false;
                this.elements.sendBtn.disabled = false;
                this.elements.input.focus();
                return;
            }

            const endpoint = this.getActiveEndpoint();
            const isLocal = this.mode === 'local';
            const body = {
                model: this.modelName,
                messages: [
                    { role: 'system', content: this.getSystemPrompt() },
                    ...this.messages.slice(-10)
                ]
            };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`API error ${response.status}: ${errText.substring(0, 100)}`);
            }

            const data = await response.json();
            // Vercel API 返回 {reply: string}，LM Studio 返回 {choices:[{message:{content}}]}
            const isOnline = this.mode === 'online';
            const reply = isOnline
                ? (data.reply || '额，出问题了')
                : (data.choices?.[0]?.message?.content || '额，出问题了');

            typingEl.remove();
            this.renderMessage('bot', reply);
            this.messages.push({ role: 'assistant', content: reply });
            this.saveHistory();

        } catch (error) {
            console.error('Chat error:', error);
            typingEl.remove();
            this.renderMessage('bot', '出问题了，等会再试试吧');
        } finally {
            this.isProcessing = false;
            this.elements.sendBtn.disabled = false;
            this.elements.input.focus();
        }
    }

    renderMessage(type, text, animate = true) {
        const el = document.createElement('div');
        el.className = `message ${type}`;

        const time = new Date().toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
        });

        if (type === 'bot') {
            el.innerHTML = `
                <div class="message-avatar">
                    <img src="./img/icon/avatar.jpg" alt="Tim">
                </div>
                <div class="message-content">
                    <div class="message-text">${this.escapeHtml(text)}</div>
                    <div class="message-time">${time}</div>
                </div>`;
        } else {
            el.innerHTML = `
                <div class="message-avatar"></div>
                <div class="message-content">
                    <div class="message-text">${this.escapeHtml(text)}</div>
                    <div class="message-time">${time}</div>
                </div>`;
        }

        this.elements.messagesContainer.appendChild(el);
        if (animate) this.scrollToBottom();
    }

    showTyping() {
        const el = document.createElement('div');
        el.className = 'message bot';
        el.id = 'typing-message';
        el.innerHTML = `
            <div class="message-avatar">
                <img src="./img/icon/avatar.jpg" alt="Tim">
            </div>
            <div class="message-content">
                <div class="message-text">
                    <div class="typing-indicator">
                        <span></span><span></span><span></span>
                    </div>
                </div>
            </div>`;
        this.elements.messagesContainer.appendChild(el);
        this.scrollToBottom();
        return el;
    }

    scrollToBottom() {
        setTimeout(() => {
            this.elements.messagesContainer.scrollTop =
                this.elements.messagesContainer.scrollHeight;
        }, 50);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.timChat = new TimChat();
});
