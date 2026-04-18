// Tim Skill Chat Logic - 在线模式，调用本地 LM Studio

class TimChat {
    constructor() {
        // LM Studio 本地 API
        this.apiEndpoint = 'http://localhost:1234/v1/chat/completions';
        this.modelName = 'qwen3.5-2b:2';
        this.messages = [];
        this.isProcessing = false;

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
        // 检查连接
        await this.checkConnection();
        setInterval(() => this.checkConnection(), 30000);

        // 绑定事件
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

    async checkConnection() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            const response = await fetch('http://localhost:1234/v1/models', {
                method: 'GET',
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (response.ok) {
                this.isConnected = true;
                if (this.elements.statusDot) this.elements.statusDot.classList.remove('offline');
                if (this.elements.statusText) this.elements.statusText.textContent = '在线';
            } else {
                throw new Error('Not OK');
            }
        } catch (e) {
            this.isConnected = false;
            if (this.elements.statusDot) this.elements.statusDot.classList.add('offline');
            if (this.elements.statusText) this.elements.statusText.textContent = '未连接';
        }
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
                console.error('Failed to load chat history:', e);
            }
        }
    }

    saveHistory() {
        const toSave = this.messages.slice(-50);
        localStorage.setItem('tim-chat-history', JSON.stringify(toSave));
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

        if (!this.isConnected) {
            // 手机上用 alert 友好提示
            const msg = document.createElement('div');
            msg.className = 'message bot system-msg';
            msg.innerHTML = `<div class="message-text">⚠️ LM Studio 未运行，请先启动 LM Studio 并开启 Local Server</div>`;
            this.elements.messagesContainer.appendChild(msg);
            this.scrollToBottom();
            setTimeout(() => msg.remove(), 5000);
            return;
        }

        this.elements.input.value = '';
        this.renderMessage('user', text);
        this.messages.push({ role: 'user', content: text });

        this.isProcessing = true;
        this.elements.sendBtn.disabled = true;
        const typingEl = this.showTyping();

        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.modelName,
                    messages: [
                        { role: 'system', content: this.getSystemPrompt() },
                        ...this.messages.slice(-10)
                    ],
                    temperature: 0.8,
                    max_tokens: 500
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`API error ${response.status}: ${errText}`);
            }

            const data = await response.json();
            const reply = data.choices?.[0]?.message?.content || '额，出问题了';

            typingEl.remove();
            this.renderMessage('bot', reply);
            this.messages.push({ role: 'assistant', content: reply });
            this.saveHistory();

        } catch (error) {
            console.error('Chat error:', error);
            typingEl.remove();
            this.renderMessage('bot', '连接失败，请确认 LM Studio 正在运行并开启了 Local Server');
        } finally {
            this.isProcessing = false;
            this.elements.sendBtn.disabled = false;
            this.elements.input.focus();
        }
    }

    renderMessage(type, text, animate = true) {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;

        const time = new Date().toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
        });

        if (type === 'bot') {
            messageEl.innerHTML = `
                <div class="message-avatar">
                    <img src="./img/icon/avatar.jpg" alt="Tim">
                </div>
                <div class="message-content">
                    <div class="message-text">${this.escapeHtml(text)}</div>
                    <div class="message-time">${time}</div>
                </div>
            `;
        } else {
            messageEl.innerHTML = `
                <div class="message-avatar"></div>
                <div class="message-content">
                    <div class="message-text">${this.escapeHtml(text)}</div>
                    <div class="message-time">${time}</div>
                </div>
            `;
        }

        this.elements.messagesContainer.appendChild(messageEl);
        if (animate) this.scrollToBottom();
    }

    showTyping() {
        const typingEl = document.createElement('div');
        typingEl.className = 'message bot';
        typingEl.id = 'typing-message';
        typingEl.innerHTML = `
            <div class="message-avatar">
                <img src="./img/icon/avatar.jpg" alt="Tim">
            </div>
            <div class="message-content">
                <div class="message-text">
                    <div class="typing-indicator">
                        <span></span><span></span><span></span>
                    </div>
                </div>
            </div>
        `;
        this.elements.messagesContainer.appendChild(typingEl);
        this.scrollToBottom();
        return typingEl;
    }

    scrollToBottom() {
        setTimeout(() => {
            this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
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
