// === 配置部分 ===
const FILE_LIST = [
  "PORT_FORWARDING_GUIDE.md",
  "README.md",
  "README_FRP.md",
  "README_MOBILE_ACCESS.md",
  "README_PUBLIC_ACCESS.md",
  "README_ROUTER_PORT_FORWARDING.md",
  "SECURITY.md"
];
// 如有新md文件请补充进此列表（或可配合构建自动生成）

// === 搜索与展示逻辑 ===
const root = 'smalltext/smalltext/';
const $input = document.getElementById('search-input');
const $result = document.getElementById('search-result');

// 缓存所有文件内容
let docs = [];

// 加载所有md文档内容
async function loadAllDocs() {
  docs = [];
  for (const fname of FILE_LIST) {
    try {
      const res = await fetch(root + fname);
      const text = await res.text();
      // 取首个非空行做title，后续为content
      const split = text.split('\n');
      const titleLine = split.find(l => l.trim());
      docs.push({
        fname,
        title: titleLine || fname,
        content: text
      });
    } catch(e) {
      // 跳过
    }
  }
}
// 模糊搜索匹配
function search(keyword) {
  const kw = keyword.trim().toLowerCase();
  if (!kw) return [];
  return docs.filter(doc =>
    doc.title.toLowerCase().includes(kw) ||
    doc.content.toLowerCase().includes(kw)
  );
}
// 结果高亮
function highlight(text, kw) {
  if (!kw) return text;
  return text.replace(new RegExp(`(${kw})`, 'ig'), `<mark>$1</mark>`);
}

// 渲染结果
function renderResults(list, keyword) {
  if (!keyword) {
    $result.innerHTML = '';
    return;
  }
  if (!list.length) {
    $result.innerHTML = '<p>没有找到匹配内容。</p>';
    return;
  }
  $result.innerHTML = `<ul class="search-list">${
    list.map(doc => {
      // 从内容中匹配到的第一行作为摘要
      let snippet = '';
      const lc = doc.content.toLowerCase();
      const idx = lc.indexOf(keyword.toLowerCase());
      if (idx > -1) {
        const lines = doc.content.split('\n');
        snippet = lines.find(line => line.toLowerCase().includes(keyword.toLowerCase())) || '';
      }
      return `
        <li>
          <a href="detail.html?file=${encodeURIComponent(doc.fname)}" target="_blank">
            ${highlight(doc.title, keyword)}
          </a>
          <div class="snippet">${highlight(snippet, keyword)}</div>
        </li>
      `;
    }).join('\n')}
  </ul>`;
}

// 绑定交互
$input.addEventListener('input', async function() {
  const kw = this.value.trim();
  if (!docs.length) await loadAllDocs();
  const resultList = search(kw);
  renderResults(resultList, kw);
});

// 启动时可预加载
window.addEventListener('DOMContentLoaded', loadAllDocs);
