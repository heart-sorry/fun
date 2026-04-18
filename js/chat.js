// Tim Skill Chat Logic

class TimChat {
    constructor() {
        this.messages = [];
        this.isProcessing = false;
        this.apiEndpoint = '/api/chat'; // Vercel Serverless Function

        this.elements = {
            messagesContainer: document.getElementById('chat-messages'),
            input: document.getElementById('chat-input'),
            sendBtn: document.getElementById('send-btn'),
            loadingOverlay: document.getElementById('loading-overlay')
        };

        this.init();
    }

    init() {
        // 绑定事件
        this.elements.sendBtn.addEventListener('click', () => this.sendMessage());
        this.elements.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // 聚焦输入框
        this.elements.input.focus();

        // 从 localStorage 恢复聊天记录
        this.loadHistory();
    }

    loadHistory() {
        const saved = localStorage.getItem('tim-chat-history');
        if (saved) {
            try {
                this.messages = JSON.parse(saved);
                // 只恢复最近 20 条
                const recent = this.messages.slice(-20);
                this.messages = [];
                recent.forEach(msg => {
                    if (msg.role === 'user') {
                        this.renderMessage('user', msg.content, false);
                    } else {
                        this.renderMessage('bot', msg.content, false);
                    }
                    this.messages.push(msg);
                });
                this.scrollToBottom();
            } catch (e) {
                console.error('Failed to load chat history:', e);
            }
        }
    }

    saveHistory() {
        // 只保存最近 50 条
        const toSave = this.messages.slice(-50);
        localStorage.setItem('tim-chat-history', JSON.stringify(toSave));
    }

    async sendMessage() {
        const text = this.elements.input.value.trim();
        if (!text || this.isProcessing) return;

        // 清空输入框
        this.elements.input.value = '';

        // 渲染用户消息
        this.renderMessage('user', text);
        this.messages.push({ role: 'user', content: text });

        // 显示加载状态
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
                    messages: this.messages.slice(-10) // 只发送最近 10 条上下文
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            const reply = data.reply || '额，出问题了';

            // 移除打字动画
            typingEl.remove();

            // 渲染回复
            this.renderMessage('bot', reply);
            this.messages.push({ role: 'assistant', content: reply });

            // 保存历史
            this.saveHistory();

        } catch (error) {
            console.error('Chat error:', error);
            typingEl.remove();
            this.renderMessage('bot', '网络有点问题，晚点再试试');
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

        if (animate) {
            this.scrollToBottom();
        }
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
                        <span></span>
                        <span></span>
                        <span></span>
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

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    window.timChat = new TimChat();
});
