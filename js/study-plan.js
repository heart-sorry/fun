/**
 * 学习计划功能 v3（GitHub Actions 方案）
 * 三条线：🌐 个人网站 | ⚡ 电赛硬件 | 🤖 本地大模型
 * 勾选状态 → GitHub Gist（任何人可读）
 * 写入 → GitHub Actions workflow（需 repository_dispatch PAT）
 * PAT 存在 GitHub Secrets，仓库内不可见
 */

(function () {
    const GIST_ID = '6b52e4fa1e68d7ce2afb3807a181c686';
    const GIST_URL = 'https://api.github.com/gists/' + GIST_ID;
    const WORKFLOW_TOKEN = ''; // ← 在 GitHub Secrets 中配置，不在代码里
    const WORKFLOW_REPO = 'heart-sorry/fun';
    const WORKFLOW_EVENT = 'study-plan-update';
    const STORAGE_KEY = 'aurora_study_local';
    let currentCat = 'website';
    let gistState = null;

    // ===== 任务数据 =====
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
                    { text: 'ES6+ 语法（let / const / 箭头函数 / async-await）', path: 'MDN / 廖雪峰JS教程' },
                    { text: 'DOM 操作与事件监听', path: 'MDN Web Docs' },
                    { text: 'Fetch API + 异步编程', path: 'MDN Fetch指南' },
                    { text: 'localStorage / sessionStorage 本地存储', path: 'MDN Storage API' },
                ]
            },
            {
                section: 'Git 工作流',
                items: [
                    { text: 'Git 分支管理（feature / dev / main）', path: '廖雪峰Git教程 / Git官方文档' },
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
                    { text: 'LoRA 微调 Qwen2.5-3B 并测试效果', path: 'GitHub: lllyasviel/qlora-papers / Qwen官方' },
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

    // ===== 初始化默认状态 =====
    function buildDefaultState() {
        var state = {};
        for (var cat in defaultTasks) {
            state[cat] = {};
            for (var si = 0; si < defaultTasks[cat].length; si++) {
                var items = defaultTasks[cat][si].items;
                for (var ii = 0; ii < items.length; ii++) {
                    state[cat][items[ii].text] = false;
                }
            }
        }
        return state;
    }

    // ===== 读取 Gist（公开，无需认证）=====
    function loadFromGist() {
        return fetch(GIST_URL, {
            method: 'GET',
            headers: { 'Accept': 'application/vnd.github.v3+json' }
        })
        .then(function (r) { return r.json(); })
        .then(function (data) {
            if (data.files && data.files['study-plan.json'] && data.files['study-plan.json'].content) {
                try {
                    return JSON.parse(data.files['study-plan.json'].content);
                } catch (e) {
                    return buildDefaultState();
                }
            }
            return buildDefaultState();
        })
        .catch(function () {
            try {
                var cached = localStorage.getItem(STORAGE_KEY);
                return cached ? JSON.parse(cached) : buildDefaultState();
            } catch (e2) {
                return buildDefaultState();
            }
        });
    }

    // ===== 触发 Actions workflow 更新 Gist =====
    function syncToGist(state) {
        var stateJson = JSON.stringify(state);
        // 缓存到本地，防止网络失败后数据丢失
        try { localStorage.setItem(STORAGE_KEY, stateJson); } catch (e) {}

        fetch('https://api.github.com/repos/' + WORKFLOW_REPO + '/dispatches', {
            method: 'POST',
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': 'Bearer ' + WORKFLOW_TOKEN,
                'Content-Type': 'application/json',
                'X-GitHub-Api-Version': '2022-11-28'
            },
            body: JSON.stringify({
                event_type: WORKFLOW_EVENT,
                client_payload: { state: stateJson }
            })
        }).catch(function (err) {
            console.warn('Actions trigger failed:', err);
        });
    }

    // ===== 进度条 =====
    function renderProgress(state) {
        var total = 0, done = 0;
        for (var cat in state) {
            for (var k in state[cat]) {
                total++;
                if (state[cat][k]) done++;
            }
        }
        $('#study-progress-text').text('已完成 ' + done + ' / ' + total + ' 项');
    }

    // ===== 渲染任务列表 =====
    function renderTasks(cat, state) {
        var sections = defaultTasks[cat] || [];
        var catState = state[cat] || {};
        var $content = $('#study-content');
        $content.empty();

        for (var si = 0; si < sections.length; si++) {
            var section = sections[si];
            $('<div class="study-section-title">' + escHtml(section.section) + '</div>').appendTo($content);
            for (var ii = 0; ii < section.items.length; ii++) {
                var item = section.items[ii];
                var done = !!catState[item.text];
                var $item = $(
                    '<div class="study-item' + (done ? ' done' : '') + '" data-text="' + escHtml(item.text) + '">' +
                        '<div class="study-checkbox"><i class="fa-solid fa-check"></i></div>' +
                        '<div class="study-item-content">' +
                            '<div class="study-item-text">' + escHtml(item.text) + '</div>' +
                            '<div class="study-item-path">📖 ' + escHtml(item.path) + '</div>' +
                        '</div>' +
                    '</div>'
                );
                $item.on('click', (function (theItem) {
                    return function () { toggleItem(theItem.text, cat); };
                })(item));
                $content.append($item);
            }
        }
    }

    function escHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // ===== 打勾切换 =====
    function toggleItem(text, cat) {
        if (!gistState) return;
        gistState[cat][text] = !gistState[cat][text];
        renderTasks(cat, gistState);
        renderProgress(gistState);
        syncToGist(gistState); // 异步触发 Actions → 写 Gist
        iziToast.show({
            timeout: 1500,
            icon: gistState[cat][text] ? 'fa-solid fa-check-circle' : 'fa-solid fa-circle',
            message: gistState[cat][text] ? '✅ 已同步' : '⭕ 已取消'
        });
    }

    // ===== 打开/关闭 =====
    function openStudyPlan() {
        $('#study-box').fadeIn(200);
        $('#study-content').css({ opacity: 0 });

        if (gistState) {
            renderProgress(gistState);
            renderTasks(currentCat, gistState);
            setTimeout(function () { $('#study-content').css({ opacity: 1 }); }, 50);
        } else {
            $('#study-progress-text').text('加载中…');
            $('#study-content').html('<div class="study-empty">从云端同步中…</div>');
            loadFromGist().then(function (state) {
                gistState = state;
                renderProgress(state);
                renderTasks(currentCat, state);
                setTimeout(function () { $('#study-content').css({ opacity: 1 }); }, 50);
            });
        }
    }

    function closeStudyPlan() {
        $('#study-box').fadeOut(200);
    }

    // ===== 初始化 =====
    $(function () {
        $('#open-study-plan').on('click', openStudyPlan);
        $('#close-study').on('click', closeStudyPlan);
        $('#study-box').on('click', function (e) {
            if (e.target === this) closeStudyPlan();
        });
        $(document).on('keydown', function (e) {
            if (e.key === 'Escape' && $('#study-box').is(':visible') === true) {
                closeStudyPlan();
            }
        });
        $('.study-tab').on('click', function () {
            var cat = $(this).data('cat');
            currentCat = cat;
            $('.study-tab').removeClass('active');
            $(this).addClass('active');
            if (gistState) renderTasks(cat, gistState);
        });
    });
})();
