const DEFAULT_FRIENDS = [
  {avatar: "🌟", name: "朋友A", tag: "最好的朋友", message: "（搜索显示的话）", meetDate: "2024-01-01", secretCode: "暗号A", secretMessage: "（暗号专属的悄悄话）"},
  {avatar: "🌈", name: "朋友B", tag: "老朋友", message: "（搜索显示的话）", meetDate: "2023-06-15", secretCode: "暗号B", secretMessage: "（暗号专属的悄悄话）"}
];

let dataStore = {
  friends: DEFAULT_FRIENDS,
  messages: []
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  try {
    if (req.method === 'GET') {
      if (action === 'friends') {
        return res.status(200).json(dataStore.friends);
      }
      if (action === 'messages') {
        return res.status(200).json(dataStore.messages);
      }
    }

    if (req.method === 'POST') {
      if (action === 'friends') {
        dataStore.friends = req.body;
        return res.status(200).json({ success: true });
      }
      if (action === 'messages') {
        dataStore.messages.push(req.body);
        if (dataStore.messages.length > 100) {
          dataStore.messages = dataStore.messages.slice(-100);
        }
        return res.status(200).json({ success: true });
      }
    }

    if (req.method === 'DELETE' && action === 'messages') {
      dataStore.messages = [];
      return res.status(200).json({ success: true });
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}