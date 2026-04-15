/**
 * 学习计划 v4 — Gist 直写 + token 存 localStorage
 *
 * 架构：
 *   读取 → 公开 Gist API，无需认证，任何人可见进度
 *   写入 → 用 localStorage 里的 PAT 直接 PATCH Gist
 *   首次使用 → 弹出输入框让 owner 填入 PAT（只存本地，不进代码）
 *
 * 安全性：
 *   - 代码仓库里零 token
 *   - 其他访客只能读，无法写
 *   - PAT 只需 gist scope
 */

(function () {
    const GIST_ID   = '6b52e4fa1e68d7ce2afb3807a181c686';
    const GIST_FILE = 'study-plan.json';
    const GIST_URL  = 'https://api.github.com/gists/' + GIST_ID;
    const TOKEN_KEY = 'aurora_gist_token';   // localStorage key for PAT
    const CACHE_KEY = 'aurora_study_cache';  // localStorage key for state cache

    let currentCat = 'website';
    let gistState  = null;

    // ─────────────────────────────────────────
    // 任务数据
    // ─────────────────────────────────────────
    const defaultTasks = {
        website: [
            {
                section: 'HTML / CSS',
                items: [
                    { text: 'HTML 标签语义化（header/nav/article/section）', path: 'MDN Web Docs / freeCodeCamp' },
                    { text: 'CSS Flexbox + Grid 布局系统', path: 'CSS-Tricks / 崔皓Web布局课' },
                    { text: 'CSS 动画（transition / @keyframes）', path: 'MDN / CSS动画实战' },
                ]
            },
            {
                section: 'JavaScript',
                items: [
                    { text: 'ES6+ 语法（let/const/箭头函数/async-await）', path: 'MDN / 廖雪峰JS教程' },
                    { text: 'DOM 操作与事件监听', path: 'MDN Web Docs' },
                    { text: 'Fetch API + 异步编程', path: 'MDN Fetch指南' },
                    { text: 'localStorage / sessionStorage 本地存储', path: 'MDN Storage API' },
                ]
            },
            {
                section: 'Git 工作流',
                items: [
                    { text: 'Git 分支管理（feature/dev/main）', path: '廖雪峰Git教程 / Git官方文档' },
                    { text: '规范 commit message（Conventional Commits）', path: 'GitHub Commit规范' },
                    { text: 'Pull Request 协作流程', path: 'GitHub 官方教程' },
                ]
            },
            {
                section: '前端框架',
                items: [
                    { text: 'Astro 或 Next.js 静态/SSR站点框架', path: 'Astro官方文档 / Next.js官方文档' },
                    { text: 'Markdown 博客系统搭建', path: 'Astro Content Collections' },
                    { text: 'Tailwind CSS 快速样式开发', path: 'Tailwind CSS官方文档' },
                ]
            },
        ],
        hardware: [
            {
                section: '电路基础',
                items: [
                    { text: '欧姆定律 / KCL / KVL 基础电路分析', path: 'B站电路原理课 / 《电路》教材' },
                    { text: '常用元器件（电阻/电容/二极管/三极管）', path: '杜洋元件视频 / 立创硬件学堂' },
                    { text: '看懂电路原理图和 PCB 布线', path: '立创 EDA 教学视频' },
                ]
            },
            {
                section: 'STM32 嵌入式',
                items: [
                    { text: 'C 语言指针 / 结构体 / 位操作', path: '郝斌C语言 / 《C Primer Plus》' },
                    { text: 'GPIO：点亮 LED → 按键输入 → 外部中断', path: 'B站江协科技 STM32入门' },
                    { text: '定时器：定时器中断 / PWM 输出 / 输入捕获', path: '正点原子 STM32教程' },
                    { text: 'ADC：读取光敏/电位器/温度传感器', path: '正点原子 / 野火教程' },
                    { text: 'UART 串口：与电脑双向通信', path: '江协科技 / 串口调试助手使用' },
                    { text: 'I2C 总线：驱动 0.96 寸 OLED 屏幕', path: '正点原子 I2C章节' },
                ]
            },
            {
                section: '电赛实战',
                items: [
                    { text: '常用模块：电机驱动 / 舵机 / 编码器', path: '立创开源平台 / B站电赛项目' },
                    { text: '信号处理：运放电路 / 滤波 / 波形生成', path: '唐老师讲电赛 / 《模拟电子技术》' },
                    { text: '往届赛题分析（省赛/国赛）', path: '全国大学生电子设计竞赛官网' },
                ]
            },
        ],
        ai: [
            {
                section: 'Python 基础',
                items: [
                    { text: 'Python 基础语法（廖雪峰 / 黑马程序员）', path: '廖雪峰Python教程 / B站视频' },
                    { text: 'pip / conda 环境管理', path: 'conda官方文档' },
                    { text: 'requests / json / 文件操作实战', path: 'Python官方文档' },
                ]
            },
            {
                section: '大模型基础',
                items: [
                    { text: 'Transformer 架构核心思想（Attention 机制）', path: '李沐《动手学深度学习》/ B站讲解视频' },
                    { text: 'Tokenizer 分词原理', path: 'Hugging Face Tokenizer文档' },
                    { text: 'Prompt Engineering（系统提示词 / Few-shot）', path: 'OpenAI官方指南 / Anthropic Prompt课程' },
                ]
            },
            {
                section: '本地模型部署',
                items: [
                    { text: 'LM Studio / Ollama 部署 Qwen 系列模型', path: 'LM Studio官网 / Ollama官网' },
                    { text: 'GGUF 量化原理（FP16 → INT8 → INT4）', path: 'llama.cpp GitHub / GPTQ论文' },
                    { text: '用 Python 调用本地模型 API（OpenAI兼容接口）', path: 'transformers文档 / LM Studio API' },
                ]
            },
            {
                section: '微调训练（Qwen2.5-3B）',
                items: [
                    { text: '准备"成为我"数据集（微信/QQ聊天记录 → JSONL）', path: '自己整理 / 数据清洗脚本' },
                    { text: 'QLoRA 微调环境搭建（conda + transformers + peft）', path: 'Hugging Face PEFT文档 / 知乎教程' },
                    { text: 'LoRA 微调 Qwen2.5-3B 并测试效果', path: 'GitHub qlora / Qwen官方' },
                    { text: '用微调后的模型回答"你是谁"验证个性', path: 'LM Studio / llama.cpp' },
                ]
            },
            {
                section: '边缘 AI（进阶）',
                items: [
                    { text: 'ONNX 模型导出与跨平台部署', path: 'ONNX官网 / PyTorch→ONNX教程' },
                    { text: 'TensorRT / ONNX Runtime GPU 推理加速', path: 'NVIDIA TensorRT文档' },
                    { text: 'YOLO 目标检测模型部署（RTX 5060 实操）', path: 'Ultralytics YOLOv8文档' },
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

    function getToken() {
        return localStorage.getItem(TOKEN_KEY) || '';
    }

    function isOwner() {
        return !!getToken();
    }

    // ─────────────────────────────────────────
    // Gist 读取（公开，无需 token）
    // ─────────────────────────────────────────
    function loadFromGist() {
        return fetch(GIST_URL, {
            headers: { 'Accept': 'application/vnd.github.v3+json' }
        })
        .then(function (r) { return r.json(); })
        .then(function (data) {
            var f = data.files && data.files[GIST_FILE];
            if (f && f.content) {
                try { return JSON.parse(f.content); } catch (e) {}
            }
            return buildDefaultState();
        })
        .catch(function () {
            var cached = localStorage.getItem(CACHE_KEY);
            return cached ? JSON.parse(cached) : buildDefaultState();
        });
    }

    // ─────────────────────────────────────────
    // Gist 写入（需要 token，只有 owner 能做）
    // ─────────────────────────────────────────
    function saveToGist(state) {
        var token = getToken();
        if (!token) return Promise.resolve();

        var body = JSON.stringify({
            files: {
                [GIST_FILE]: { content: JSON.stringify(state, null, 2) }
            }
        });

        return fetch(GIST_URL, {
            method: 'PATCH',
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': 'token ' + token,
                'Content-Type': 'application/json'
            },
            body: body
        })
        .then(function (r) {
            if (!r.ok) throw new Error('Gist write failed: ' + r.status);
            // 更新本地缓存
            try { localStorage.setItem(CACHE_KEY, JSON.stringify(state)); } catch (e) {}
        });
    }

    // ─────────────────────────────────────────
    // 进度条
    // ─────────────────────────────────────────
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

    // ─────────────────────────────────────────
    // 渲染任务列表
    // ─────────────────────────────────────────
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

        // 非 owner 提示
        if (!isOwner()) {
            $content.append(
                '<div class="study-readonly-tip">' +
                '<i class="fa-solid fa-eye"></i> 访客模式 · 仅可查看' +
                '</div>'
            );
        }
    }

    // ─────────────────────────────────────────
    // 打勾切换
    // ─────────────────────────────────────────
    function toggleItem(text, cat) {
        if (!gistState || !isOwner()) return;
        gistState[cat][text] = !gistState[cat][text];
        var nowDone = gistState[cat][text];

        renderTasks(cat, gistState);
        renderProgress(gistState);

        // 乐观更新本地缓存
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(gistState)); } catch (e) {}

        // 异步写 Gist
        saveToGist(gistState).then(function () {
            showToast(nowDone ? '✅ 已完成并同步' : '⭕ 已取消并同步', nowDone ? 'success' : 'info');
        }).catch(function () {
            showToast('⚠️ 本地已更新，云端同步失败', 'warning');
        });
    }

    function showToast(msg, type) {
        if (typeof iziToast !== 'undefined') {
            iziToast.show({ timeout: 2000, message: msg, color: type === 'success' ? 'green' : type === 'warning' ? 'yellow' : 'blue' });
        }
    }

    // ─────────────────────────────────────────
    // Token 设置弹窗（owner 首次使用）
    // ─────────────────────────────────────────
    function showTokenPrompt() {
        var existing = getToken();
        var html =
            '<div id="token-prompt-overlay" style="' +
                'position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9999;' +
                'display:flex;align-items:center;justify-content:center;">' +
            '<div style="background:#1e1e2e;border-radius:16px;padding:28px 32px;width:360px;' +
                        'box-shadow:0 8px 32px rgba(0,0,0,.5);color:#cdd6f4;">' +
                '<div style="font-size:18px;font-weight:700;margin-bottom:8px;">🔑 设置 Gist Token</div>' +
                '<div style="font-size:13px;color:#a6adc8;margin-bottom:16px;">' +
                    '仅需 <code style="background:#313244;padding:2px 6px;border-radius:4px;">gist</code> 权限的 Classic PAT。' +
                    '只存在你的浏览器 localStorage，不会上传到任何地方。' +
                '</div>' +
                '<input id="token-input" type="password" placeholder="ghp_xxxxxxxxxxxx" ' +
                    'style="width:100%;padding:10px 14px;border-radius:8px;border:1px solid #45475a;' +
                           'background:#313244;color:#cdd6f4;font-size:14px;outline:none;box-sizing:border-box;" ' +
                    'value="' + escHtml(existing) + '">' +
                '<div style="display:flex;gap:10px;margin-top:16px;">' +
                    '<button id="token-save" style="flex:1;padding:10px;border-radius:8px;border:none;' +
                        'background:#89b4fa;color:#1e1e2e;font-weight:700;cursor:pointer;">保存</button>' +
                    '<button id="token-cancel" style="flex:1;padding:10px;border-radius:8px;border:none;' +
                        'background:#45475a;color:#cdd6f4;cursor:pointer;">取消</button>' +
                '</div>' +
                (existing ? '<div style="margin-top:12px;text-align:center;">' +
                    '<span id="token-clear" style="font-size:12px;color:#f38ba8;cursor:pointer;">清除 Token（切换为访客模式）</span>' +
                '</div>' : '') +
            '</div></div>';

        $('body').append(html);

        $('#token-save').on('click', function () {
            var val = $('#token-input').val().trim();
            if (val) {
                localStorage.setItem(TOKEN_KEY, val);
                $('#token-prompt-overlay').remove();
                showToast('✅ Token 已保存，刷新后生效', 'success');
                // 重新渲染以启用打勾
                if (gistState) renderTasks(currentCat, gistState);
            }
        });
        $('#token-cancel').on('click', function () { $('#token-prompt-overlay').remove(); });
        $('#token-clear').on('click', function () {
            localStorage.removeItem(TOKEN_KEY);
            $('#token-prompt-overlay').remove();
            showToast('已切换为访客模式', 'info');
            if (gistState) renderTasks(currentCat, gistState);
        });
        // Enter 键保存
        $('#token-input').on('keydown', function (e) {
            if (e.key === 'Enter') $('#token-save').click();
        });
    }

    // ─────────────────────────────────────────
    // 打开 / 关闭
    // ─────────────────────────────────────────
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

    function closeStudyPlan() {
        $('#study-box').fadeOut(200);
    }

    // ─────────────────────────────────────────
    // 初始化
    // ─────────────────────────────────────────
    $(function () {
        $('#open-study-plan').on('click', openStudyPlan);
        $('#close-study').on('click', closeStudyPlan);
        $('#study-box').on('click', function (e) {
            if (e.target === this) closeStudyPlan();
        });
        $(document).on('keydown', function (e) {
            if (e.key === 'Escape' && $('#study-box').is(':visible')) closeStudyPlan();
        });

        // 分类 tab
        $('.study-tab').on('click', function () {
            currentCat = $(this).data('cat');
            $('.study-tab').removeClass('active');
            $(this).addClass('active');
            if (gistState) renderTasks(currentCat, gistState);
        });

        // 长按标题 3 秒 → 弹出 token 设置（隐藏入口，只有 owner 知道）
        var pressTimer = null;
        $('#study-box').on('mousedown touchstart', '.study-title', function () {
            pressTimer = setTimeout(function () { showTokenPrompt(); }, 3000);
        }).on('mouseup mouseleave touchend', '.study-title', function () {
            clearTimeout(pressTimer);
        });
    });
})();
