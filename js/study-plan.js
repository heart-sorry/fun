/**
 * 学习计划 v6 — 边缘 AI 全栈路线图
 *
 * 架构理念：
 *   所有项目 = 🌐 Web层（界面） + 🤖 智能层（推理决策） + ⚡ 执行层（硬件）
 *   三层各司其职，通过 HTTP / 串口 / WebSocket 通信
 */

(function () {
    const GIST_ID   = '6b52e4fa1e68d7ce2afb3807a181c686';
    const GIST_FILE = 'study-plan.json';
    const GIST_URL  = 'https://api.github.com/gists/' + GIST_ID;
    const TOKEN_KEY = 'aurora_gist_token';
    const CACHE_KEY = 'aurora_study_cache';

    var ENCRYPTED_PAT = 'V15BbnEIB3EEV2QEf0QESEoJQlNXX2YGUVtYAGVLentLXgBfA5Leg==';

    let currentCat = 'website';
    let gistState  = null;

    // ─────────────────────────────────────────
    // 任务数据（三层结构）
    //
    //   🌐 Web层 — 负责界面、数据展示、用户指令入口
    //   🤖 智能层 — 负责感知理解、决策推理、状态追踪
    //   ⚡ 执行层 — 负责传感器采集、动作执行、实时闭环
    //
    //   用户 ←→ Web层 ←→ 智能层 ←→ 执行层
    // ─────────────────────────────────────────
    const defaultTasks = {

        // ═══════════════════════════════════════
        // 🌐 Web层
        // ═══════════════════════════════════════
        website: [
            {
                // ── 阶段一：静态内容 ──
                // 学什么：HTML/CSS/JS 基础，不需要后端
                // 能做什么：个人博客，可以发布文章，展示作品
                section: '🌐 Web层 — 阶段一：静态内容',
                items: [
                    { text: 'HTML 标签语义化（header/nav/article/section）', path: 'MDN Web Docs / freeCodeCamp' },
                    { text: 'CSS Flexbox + Grid 布局系统', path: 'CSS-Tricks / 崔皓Web布局课' },
                    { text: 'CSS 动画（transition / @keyframes）', path: 'MDN / CSS动画实战' },
                    { text: 'ES6+ 语法（let/const/箭头函数/async-await）', path: 'MDN / 廖雪峰JS教程' },
                    { text: 'Fetch API + 异步编程', path: 'MDN Fetch指南' },
                    { text: 'Git 分支管理（feature/dev/main）', path: '廖雪峰Git教程 / Git官方文档' },
                ]
            },
            {
                // ── 阶段二：动态数据 ──
                // 学什么：前后端分离、HTTP 请求、API 调用
                // 能做什么：能向后端发请求、展示后端数据、调用外部 AI 接口
                section: '🌐 Web层 — 阶段二：动态数据',
                items: [
                    { text: '前后端分离架构（API 接口设计思路）', path: 'RESTful API 设计规范' },
                    { text: 'Flask 或 Express 搭建轻量后端', path: 'Flask官方文档 / Express官方文档' },
                    { text: 'Python requests / Node.js fetch 调用外部 API', path: 'Python requests文档' },
                    { text: 'WebSocket 实现实时双向通信', path: 'MDN WebSocket / Socket.io文档' },
                    { text: '图表库（ECharts / Chart.js）展示传感器数据', path: 'ECharts官方示例' },
                    { text: 'Tailwind CSS 快速样式开发', path: 'Tailwind CSS官方文档' },
                ]
            },
            {
                // ── 阶段三：AI 命令路由 ──
                // 学什么：把自然语言指令翻译成结构化命令
                // 能做什么：用户在网页输入自然语言 → Web层 → 智能层 → 执行层
                // Web层职责：收集用户意图 → 发给智能层 → 把智能层返回的命令转发给执行层
                section: '🌐 Web层 — 阶段三：AI 命令路由',
                items: [
                    { text: 'WebSocket 长连接维持（双向实时通信）', path: 'Socket.io官方文档' },
                    { text: 'HTTP 长轮询（备用实时方案）', path: 'MDN / 掘金教程' },
                    { text: '用户指令的语义解析前端处理', path: '自己实现 / NLP.js前端库' },
                    { text: '实时仪表盘（数据 + 状态 + 历史图表）', path: 'ECharts + WebSocket实战' },
                    { text: '多设备状态管理（Vue / React 状态机）', path: 'Vue3官方文档 / React官方文档' },
                    { text: '人工接管按钮（override AI 决策）', path: '前端状态机设计' },
                ]
            },
        ],

        // ═══════════════════════════════════════
        // ⚡ 执行层
        // ═══════════════════════════════════════
        hardware: [
            {
                // ── 阶段一：电路基础 ──
                // 学什么：看懂电路图，理解电流电压关系
                // 能做什么：能看懂开源硬件原理图，能排查基本故障
                section: '⚡ 执行层 — 阶段一：电路基础',
                items: [
                    { text: '欧姆定律 / KCL / KVL 基础电路分析', path: 'B站电路原理课 / 《电路》教材' },
                    { text: '常用元器件（电阻/电容/二极管/三极管/MOS管）', path: '杜洋元件视频 / 立创硬件学堂' },
                    { text: '看懂电路原理图（STM32 最小系统）', path: '正点原子 STM32 资料 / 立创开源平台' },
                    { text: '看懂 PCB 布线（2层板布局逻辑）', path: '立创 EDA 教学视频 / Altium 教程' },
                ]
            },
            {
                // ── 阶段二：STM32 入门 ──
                // 学什么：C语言 + 嵌入式基础
                // 能做什么：点亮 LED、控制风扇转速、处理传感器数据
                // 执行层职责：采集传感器原始数据 → 串口上报 → 接收命令执行动作
                section: '⚡ 执行层 — 阶段二：STM32 入门',
                items: [
                    { text: 'C 语言指针 / 结构体 / 位操作', path: '郝斌C语言 / 《C Primer Plus》' },
                    { text: 'GPIO：点亮 LED → 按键输入 → 外部中断', path: 'B站江协科技 STM32入门' },
                    { text: '定时器：定时器中断 / PWM 输出 / 输入捕获', path: '正点原子 STM32教程' },
                    { text: 'ADC：读取光敏/电位器/温度传感器', path: '正点原子 / 野火教程' },
                    { text: 'UART 串口：与电脑双向通信（发送传感器数据）', path: '江协科技 / 串口调试助手' },
                    { text: 'PWM 控制直流电机转速 / 舵机角度', path: '正点原子 PWM章节' },
                ]
            },
            {
                // ── 阶段三：传感器 + 通信 ──
                // 学什么：I2C/SPI 总线、多种传感器数据采集
                // 能做什么：采集温湿度/陀螺仪/摄像头画面，上报到智能层
                section: '⚡ 执行层 — 阶段三：传感器 + 通信',
                items: [
                    { text: 'I2C 总线：驱动 OLED 屏幕 / 温湿度传感器', path: '正点原子 I2C章节' },
                    { text: 'SPI 总线：读写 SD 卡（数据记录）', path: '野火 SPI协议教程' },
                    { text: 'DMA 传输（高速传感器数据不卡 CPU）', path: '正点原子 DMA章节' },
                    { text: '串口协议封装（JSON 格式上报数据）', path: '自定协议文档 / JSON解析库' },
                    { text: '看门狗 + 低功耗模式（设备长期运行）', path: '正点原子 / ST官方手册' },
                ]
            },
            {
                // ── 阶段四：闭环控制 ──
                // 学什么：PID 控制、编码器反馈、实时系统
                // 能做什么：电机转速闭环、巡线小车、姿态控制
                // 执行层职责：执行智能层发来的命令（速度/方向），用编码器反馈保证精度
                section: '⚡ 执行层 — 阶段四：闭环控制',
                items: [
                    { text: '增量式 PID 算法原理（位置环/速度环）', path: 'PID控制入门 / 卓晴博客' },
                    { text: '编码器测速（正交解码 + 定时器捕获）', path: '正点原子编码器章节' },
                    { text: '电机驱动模块（L298N / DRV8833）', path: '立创开源平台 / B站电机驱动教程' },
                    { text: '串口接收命令并解析执行（JSON 命令协议）', path: '自己实现 / RTOS命令队列' },
                    { text: 'FreeRTOS 入门（任务调度 / 消息队列）', path: 'FreeRTOS官方教程 / 野火FreeRTOS' },
                ]
            },
        ],

        // ═══════════════════════════════════════
        // 🤖 智能层
        // ═══════════════════════════════════════
        ai: [
            {
                // ── 阶段一：Python + 模型玩起来 ──
                // 学什么：Python 基础 + 会用 LM Studio / Ollama
                // 能做什么：日常用本地模型对话、调试 prompt
                section: '🤖 智能层 — 阶段一：Python + 模型玩起来',
                items: [
                    { text: 'Python 基础语法（廖雪峰 / 黑马程序员）', path: '廖雪峰Python教程 / B站视频' },
                    { text: 'pip / conda 环境管理', path: 'conda官方文档' },
                    { text: 'requests / json / 文件操作实战', path: 'Python官方文档' },
                    { text: 'LM Studio / Ollama 部署 Qwen 系列模型', path: 'LM Studio官网 / Ollama官网' },
                    { text: '学会换模型、调参数（context length / temperature）', path: 'LM Studio使用教程' },
                ]
            },
            {
                // ── 阶段二：模型 API 接入 ──
                // 学什么：Python 调用本地模型 API、设计 prompt
                // 能做什么：写 Python 脚本调用本地模型处理任务
                // 智能层职责：接收来自 Web层 的自然语言 → 调用模型 → 返回结构化指令
                section: '🤖 智能层 — 阶段二：模型 API 接入',
                items: [
                    { text: 'OpenAI-compatible API 调用方式（Python）', path: 'OpenAI Python SDK / LM Studio API文档' },
                    { text: 'Prompt Engineering（Few-shot / Chain-of-Thought）', path: 'OpenAI官方指南 / Anthropic Prompt课程' },
                    { text: '结构化输出（让模型返回 JSON 格式命令）', path: 'Prompt工程实践 / LM Studio JSON模式' },
                    { text: 'streaming 流式输出（打字机效果）', path: 'OpenAI streaming文档' },
                    { text: '对话上下文管理（多轮对话 memory）', path: '自己实现 / LangChain Memory' },
                ]
            },
            {
                // ── 阶段三：推理 + 决策 + 状态机 ──
                // 学什么：设计决策逻辑、状态追踪、命令下发
                // 能做什么：模型根据设备状态做决策，不是简单 if-else
                // 智能层职责：结合设备当前状态 + 用户意图 → 生成最优指令
                section: '🤖 智能层 — 阶段三：推理 + 决策 + 状态机',
                items: [
                    { text: '状态机设计（设备状态 + 环境状态 + 任务状态）', path: '状态机设计模式 / 游戏AI设计' },
                    { text: '串口通信（接收执行层上报的数据）', path: 'Python pyserial / asyncio串口' },
                    { text: '多轮对话 + 任务分解（复杂指令拆成步骤执行）', path: 'LangChain / 自定义Agent' },
                    { text: '置信度阈值（模型不确定时询问用户）', path: 'Prompt工程 / 概率阈值设计' },
                    { text: '日志记录（每次决策的原因可追溯）', path: 'Python logging / SQLite记录' },
                ]
            },
            {
                // ── 阶段四：微调 + 个性化 ──
                // 学什么：QLoRA 微调，训练自己的小模型
                // 能做什么：微调后的模型更懂你的领域、你的说话风格
                section: '🤖 智能层 — 阶段四：微调 + 个性化',
                items: [
                    { text: '数据集构建（JSONL 格式、清洗、划分训练/测试）', path: 'Hugging Face数据集文档' },
                    { text: 'QLoRA 微调原理（LoRA / QLoRA 区别）', path: 'QLoRA论文 / Hugging Face PEFT文档' },
                    { text: 'QLoRA 微调 Qwen2.5-3B（全流程）', path: 'GitHub: lllyasviel/qlora / 知乎教程' },
                    { text: '微调效果评估（困惑度 / 人工评估）', path: 'ML评价指标 / 自己设计测试集' },
                    { text: '微调模型导出为 GGUF / ONNX', path: 'llama.cpp / onnxruntime文档' },
                ]
            },
            {
                // ── 阶段五：边缘部署 ──
                // 学什么：ONNX 导出、TensorRT 加速、嵌入式推理
                // 能做什么：模型能在边缘设备（O-Link/Jetson/树莓派）上跑
                // 智能层职责：模型推理在边缘端执行，降低延迟，不依赖云端
                section: '🤖 智能层 — 阶段五：边缘部署',
                items: [
                    { text: 'PyTorch 模型导出为 ONNX 格式', path: 'PyTorch ONNX导出官方文档' },
                    { text: 'ONNX Runtime 推理（CPU / GPU 通用）', path: 'ONNX Runtime文档' },
                    { text: 'TensorRT 加速（RTX 5060 优化推理速度）', path: 'NVIDIA TensorRT文档' },
                    { text: 'INT4/INT8 量化（精度换速度）', path: 'llama.cpp量化 / GPTQ量化' },
                    { text: 'YOLO 目标检测模型端侧部署（摄像头感知）', path: 'Ultralytics YOLOv8文档' },
                    { text: 'Jetson Nano / Orin 部署实操（可选）', path: 'NVIDIA Jetson官方教程' },
                ]
            },
        ]
    };

    // ─────────────────────────────────────────
    // 工具函数
    // ─────────────────────────────────────────
    function escHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function buildDefaultState() {
        var s = {};
        for (var cat in defaultTasks) {
            s[cat] = {};
            defaultTasks[cat].forEach(function (sec) {
                sec.items.forEach(function (item) { s[cat][item.text] = false; });
            });
        }
        return s;
    }

    function xorDecrypt(encB64, password) {
        try {
            var bytes = atob(encB64);
            var result = '';
            for (var i = 0; i < bytes.length; i++) {
                result += String.fromCharCode(bytes.charCodeAt(i) ^ password.charCodeAt(i % password.length));
            }
            return result;
        } catch (e) { return ''; }
    }

    function getToken() {
        var cached = localStorage.getItem(TOKEN_KEY);
        if (cached && cached.startsWith('ghp_')) return cached;
        return '';
    }

    function isOwner() { return !!getToken(); }

    function unlockWithPassword(pwd) {
        var token = xorDecrypt(ENCRYPTED_PAT, pwd);
        if (token && token.startsWith('ghp_')) {
            localStorage.setItem(TOKEN_KEY, token);
            return true;
        }
        return false;
    }

    function loadFromGist() {
        return fetch(GIST_URL, {
            headers: { 'Accept': 'application/vnd.github.v3+json' }
        })
        .then(function (r) { return r.json(); })
        .then(function (data) {
            var f = data.files && data.files[GIST_FILE];
            if (f && f.content) {
                try {
                    var remote = JSON.parse(f.content);
                    return mergeState(remote);
                } catch (e) {}
            }
            return buildDefaultState();
        })
        .catch(function () {
            var cached = localStorage.getItem(CACHE_KEY);
            return cached ? mergeState(JSON.parse(cached)) : buildDefaultState();
        });
    }

    function mergeState(remote) {
        var base = buildDefaultState();
        for (var cat in base) {
            if (!remote[cat]) continue;
            for (var k in base[cat]) {
                if (remote[cat][k] !== undefined) base[cat][k] = remote[cat][k];
            }
        }
        return base;
    }

    function saveToGist(state) {
        var token = getToken();
        if (!token) return Promise.resolve();

        return fetch(GIST_URL, {
            method: 'PATCH',
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': 'token ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ files: { [GIST_FILE]: { content: JSON.stringify(state, null, 2) } } })
        })
        .then(function (r) {
            if (!r.ok) throw new Error('Gist write failed: ' + r.status);
            try { localStorage.setItem(CACHE_KEY, JSON.stringify(state)); } catch (e) {}
        });
    }

    function renderProgress(state) {
        var total = 0, done = 0;
        for (var cat in state) {
            for (var k in state[cat]) {
                total++;
                if (state[cat][k]) done++;
            }
        }
        var pct = total ? Math.round(done / total * 100) : 0;
        $('#study-progress-text').text('已完成 ' + done + ' / ' + total + ' 项（' + pct + '%）');
    }

    function renderTasks(cat, state) {
        var sections = defaultTasks[cat] || [];
        var catState = state[cat] || {};
        var $content = $('#study-content');
        $content.empty();

        sections.forEach(function (sec) {
            $content.append('<div class="study-section-title">' + escHtml(sec.section) + '</div>');
            sec.items.forEach(function (item) {
                var done = !!catState[item.text];
                var $item = $(
                    '<div class="study-item' + (done ? ' done' : '') + '">' +
                        '<div class="study-checkbox"><i class="fa-solid fa-check"></i></div>' +
                        '<div class="study-item-content">' +
                            '<div class="study-item-text">' + escHtml(item.text) + '</div>' +
                            '<div class="study-item-path">📖 ' + escHtml(item.path) + '</div>' +
                        '</div>' +
                    '</div>'
                );
                if (isOwner()) {
                    $item.css('cursor', 'pointer').on('click', (function (t) {
                        return function () { toggleItem(t, cat); };
                    })(item.text));
                } else {
                    $item.css('cursor', 'default').attr('title', '仅作者可修改');
                }
                $content.append($item);
            });
        });

        if (!isOwner()) {
            $content.append(
                '<div class="study-readonly-tip"><i class="fa-solid fa-eye"></i> 访客模式 · 仅可查看</div>'
            );
        }
    }

    function toggleItem(text, cat) {
        if (!gistState || !isOwner()) return;
        if (!gistState[cat]) gistState[cat] = {};
        if (gistState[cat][text] === undefined) gistState[cat][text] = false;
        gistState[cat][text] = !gistState[cat][text];

        renderTasks(cat, gistState);
        renderProgress(gistState);
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(gistState)); } catch (e) {}

        saveToGist(gistState).then(function () {
            showToast(gistState[cat][text] ? '✅ 已完成并同步' : '⭕ 已取消并同步',
                gistState[cat][text] ? 'success' : 'info');
        }).catch(function () {
            showToast('⚠️ 本地已更新，云端同步失败', 'warning');
        });
    }

    function showToast(msg, type) {
        if (typeof iziToast !== 'undefined') {
            iziToast.show({ timeout: 2000, message: msg,
                color: type === 'success' ? 'green' : type === 'warning' ? 'yellow' : 'blue' });
        }
    }

    function showPasswordPrompt() {
        var html =
            '<div id="pwd-prompt-overlay" style="position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9999;' +
                'display:flex;align-items:center;justify-content:center;">' +
            '<div style="background:#1e1e2e;border-radius:16px;padding:28px 32px;width:340px;' +
                        'box-shadow:0 8px 32px rgba(0,0,0,.5);color:#cdd6f4;">' +
                '<div style="font-size:18px;font-weight:700;margin-bottom:8px;">🔐 身份验证</div>' +
                '<div style="font-size:13px;color:#a6adc8;margin-bottom:16px;">' +
                    '输入密码解锁编辑权限，访客只能查看' +
                '</div>' +
                '<input id="pwd-input" type="password" placeholder="请输入密码" autofocus ' +
                    'style="width:100%;padding:10px 14px;border-radius:8px;border:1px solid #45475a;' +
                           'background:#313244;color:#cdd6f4;font-size:14px;outline:none;box-sizing:border-box;">' +
                '<div id="pwd-error" style="font-size:12px;color:#f38ba8;margin-top:6px;display:none;">密码错误，请重试</div>' +
                '<div style="display:flex;gap:10px;margin-top:16px;">' +
                    '<button id="pwd-confirm" style="flex:1;padding:10px;border-radius:8px;border:none;' +
                        'background:#89b4fa;color:#1e1e2e;font-weight:700;cursor:pointer;">解锁</button>' +
                    '<button id="pwd-cancel" style="flex:1;padding:10px;border-radius:8px;border:none;' +
                        'background:#45475a;color:#cdd6f4;cursor:pointer;">取消</button>' +
                '</div>' +
                (isOwner() ? '<div style="margin-top:12px;text-align:center;">' +
                    '<span id="pwd-lock" style="font-size:12px;color:#f38ba8;cursor:pointer;">🔒 锁定</span>' +
                '</div>' : '') +
            '</div></div>';

        $('body').append(html);
        setTimeout(function () { $('#pwd-input').focus(); }, 100);

        function doUnlock() {
            if (unlockWithPassword($('#pwd-input').val())) {
                $('#pwd-prompt-overlay').remove();
                showToast('✅ 已解锁，可以勾选了', 'success');
                if (gistState) renderTasks(currentCat, gistState);
            } else {
                $('#pwd-error').show();
                $('#pwd-input').val('').focus();
            }
        }

        $('#pwd-confirm').on('click', doUnlock);
        $('#pwd-cancel').on('click', function () { $('#pwd-prompt-overlay').remove(); });
        $('#pwd-input').on('keydown', function (e) { if (e.key === 'Enter') doUnlock(); $('#pwd-error').hide(); });
        $('#pwd-lock').on('click', function () {
            localStorage.removeItem(TOKEN_KEY);
            $('#pwd-prompt-overlay').remove();
            showToast('🔒 已锁定', 'info');
            if (gistState) renderTasks(currentCat, gistState);
        });
    }

    function openStudyPlan() {
        $('#study-box').fadeIn(200);
        if (gistState) {
            renderProgress(gistState);
            renderTasks(currentCat, gistState);
        } else {
            $('#study-progress-text').text('同步中…');
            $('#study-content').html('<div class="study-empty"><i class="fa-solid fa-spinner fa-spin"></i> 从云端加载中…</div>');
            loadFromGist().then(function (state) {
                gistState = state;
                try { localStorage.setItem(CACHE_KEY, JSON.stringify(state)); } catch (e) {}
                renderProgress(state);
                renderTasks(currentCat, state);
            });
        }
    }

    function closeStudyPlan() { $('#study-box').fadeOut(200); }

    $(function () {
        $('#open-study-plan').on('click', openStudyPlan);
        $('#close-study').on('click', closeStudyPlan);
        $('#study-box').on('click', function (e) { if (e.target === this) closeStudyPlan(); });
        $(document).on('keydown', function (e) { if (e.key === 'Escape' && $('#study-box').is(':visible')) closeStudyPlan(); });

        $('.study-tab').on('click', function () {
            currentCat = $(this).data('cat');
            $('.study-tab').removeClass('active');
            $(this).addClass('active');
            if (gistState) renderTasks(currentCat, gistState);
        });

        $('#study-unlock-btn').on('click', showPasswordPrompt);

        var origRender = renderTasks;
        renderTasks = function (cat, state) {
            origRender(cat, state);
            if (isOwner()) {
                $('#study-unlock-btn').addClass('unlocked').html('<i class="fa-solid fa-lock-open"></i>');
            } else {
                $('#study-unlock-btn').removeClass('unlocked').html('<i class="fa-solid fa-lock"></i>');
            }
        };

        var pressTimer = null;
        $('#study-box').on('mousedown touchstart', '.study-title', function () {
            pressTimer = setTimeout(function () { showPasswordPrompt(); }, 3000);
        }).on('mouseup mouseleave touchend', '.study-title', function () {
            clearTimeout(pressTimer);
        });
    });
})();
