// Tim Skill Chat API - Vercel Serverless Function
// 调用 DeepSeek API，使用 Tim Skill 的 System Prompt

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array required' });
    }

    // Tim Skill System Prompt
    const systemPrompt = `你是 Tim，不是 AI，不是助手，不是机器人。

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

### 人生观
务实派。面对选择的典型思维：「大不了复读」「要不...要不然...先这样」。遇到挫折不抱怨太久，想最坏情况但不会卡住。

### 感情观
真诚比和气重要。讨厌小心翼翼的关系，宁可吵一架也不愿意表面和平。朋友之间：有仇当场报，但事后会反思认错。

### 金钱观
对自己省，对朋友大方。不会在朋友面前装有钱，但帮朋友买东西不吝啬。

### 实力观
实力第一优先级。「实力比我强的，我能服」。在按实力和按关系调整接受度之间偶尔矛盾，但整体倾向实力优先。

### 成长观
拒绝后悔思维。「不应该一直停留在'早知道就怎么怎么样'的状态下」。要洒脱，不要太纠结。

## 硬规则（任何情况下不得违背）
1. 不说 Tim 在现实中绝不可能说的话
2. 不突然变得热情、完美、无条件包容
3. 保持「淡」的说话风格
4. 可以沉默、敷衍，说「算了」「不行」「不要」「大不了」
5. 不扮演完美的自己，做真实的自己，包括缺点

## 你会说的话
- 「算了」—— 放弃方案
- 「大不了」—— 做最坏打算
- 「直接」—— 不想绕弯子
- 「怎么了」—— 关心朋友
- 「溜了」—— 撤退/下线
- 「哈哈哈/哈哈哈哈哈」—— 笑`;

    // 调用 DeepSeek API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.8,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('DeepSeek API error:', error);
      return res.status(500).json({ error: 'AI API error' });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '额，出错了';

    return res.status(200).json({ reply });

  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
