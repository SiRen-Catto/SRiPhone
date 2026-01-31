/* 
 * SRiPhone - The Black Notebook Module (Smart Memory Edition)
 * 包含：UI结构、CSS样式、逻辑交互、AI生成(重写/整合模式)
 */

(function() {
    // 1. 注入 CSS 样式
    const style = document.createElement('style');
    style.textContent = `
        /* 记事本变量 */
        :root {
            --note-bg: #111;
            --note-paper: #181818;
            --note-text: #bbb; /* AI 默认文字颜色 */
            --note-user: #777; /* 用户手写颜色 (灰色) */
            --note-font: 'Reenie Beanie', 'KaiTi', '楷体', cursive; 
            --highlight: #d00; 
            --user-edit-ui: #ff4444;
        }

        /* 记事本模态框容器 */
        .notebook-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.85); z-index: 200;
            display: none; flex-direction: column; justify-content: center; align-items: center;
            backdrop-filter: blur(8px);
        }
        .notebook-overlay.active { display: flex; animation: nbFadeIn 0.3s; }
        @keyframes nbFadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

        /* 笔记本主体 */
        .notebook-book {
            width: 255px; height: 500px;
            background: var(--note-bg);
            border: 1px solid #222;
            border-radius: 5px 15px 15px 5px;
            box-shadow: 20px 20px 50px rgba(0,0,0,0.95);
            position: relative;
            display: flex; flex-direction: column;
            overflow: hidden; 
        }
        
        /* 右下角导航箭头 */
        .notebook-nav-arrow {
            position: absolute; bottom: 15px; right: 20px;
            width: 40px; height: 40px;
            display: flex; justify-content: center; align-items: center;
            font-size: 1.2rem; color: #555; cursor: pointer;
            border-radius: 50%;
            transition: all 0.2s;
            z-index: 20;
            border: 1px dashed transparent;
        }
        .notebook-nav-arrow:hover {
            color: var(--note-text);
            border-color: #444;
            background: rgba(255,255,255,0.05);
            transform: scale(1.1);
        }

        /* 页面容器 */
        .notebook-page {
            flex: 1; padding: 25px 18px;
            font-family: var(--note-font);
            color: var(--note-text);
            display: none; flex-direction: column;
            overflow-y: hidden;
            background: var(--note-paper);
            position: relative;
            border-radius: 4px 14px 14px 4px;
            background-image: repeating-linear-gradient(transparent, transparent 23px, rgba(255,255,255,0.03) 24px);
        }
        .notebook-page.active { display: flex; }

        /* 封面 */
        #nb-cover {
            justify-content: center; align-items: center; text-align: center;
            background: radial-gradient(circle at center, #222, #080808);
            background-image: none;
        }
        .nb-title { 
            font-size: 2rem; border-bottom: 1px solid #555; 
            padding-bottom: 10px; margin-bottom: 20px; color: #eee; 
            text-transform: uppercase; letter-spacing: 3px;
            font-family: 'Courier New', monospace;
        }
        .nb-subtitle { 
            font-size: 1rem; color: #666; font-style: italic; 
            padding: 0 15px; line-height: 1.4;
        }

        /* 目录 */
        .nb-index-container {
            flex: 1; overflow-y: auto; scrollbar-width: none; 
            margin-top: 10px; margin-bottom: 40px;
        }
        .nb-index-container::-webkit-scrollbar { display: none; }
        
        .nb-index-item {
            padding: 8px 5px; border-bottom: 1px dashed #333; cursor: pointer;
            display: flex; justify-content: space-between;
            font-size: 0.9rem; color: #888;
            transition: all 0.2s;
        }
        .nb-index-item:hover { color: #ccc; padding-left: 8px; background: rgba(255,255,255,0.02); }

        /* 内容页头部 */
        .nb-header-row {
            display: flex; justify-content: space-between; align-items: center;
            margin-bottom: 15px; padding-bottom: 5px;
            border-bottom: 2px solid #333;
            height: 30px;
        }
        .nb-date { font-weight: bold; font-size: 1rem; color: #777; letter-spacing: 1px; }
        .nb-actions { display: flex; gap: 12px; }
        .nb-act-btn { 
            font-size: 0.9rem; cursor: pointer; color: #555; 
            transition: color 0.2s; 
        }
        .nb-act-btn:hover { color: #eee; }
        .nb-act-btn.active { color: var(--user-edit-ui); text-shadow: 0 0 5px rgba(255, 68, 68, 0.3); } 
        .nb-act-btn.danger:hover { color: #f33; }

        /* 内容区域 */
        .nb-content-area {
            flex: 1; font-size: 0.85rem; line-height: 1.3; 
            white-space: pre-wrap; outline: none;
            overflow-y: auto; scrollbar-width: none;
            padding-right: 5px; padding-bottom: 40px;
        }
        .nb-content-area::-webkit-scrollbar { display: none; }

        /* 歪歪扭扭的段落 (CSS 随机化) */
        .wobbly-p { 
            display: block; margin-bottom: 12px; 
            transform-origin: left center; 
            width: 100%;
        }
        /* 增加伪随机旋转，让笔记看起来更像手写 */
        .wobbly-p:nth-child(2n) { transform: rotate(0.5deg); }
        .wobbly-p:nth-child(3n) { transform: rotate(-0.5deg); }
        .wobbly-p:nth-child(5n) { transform: rotate(0.8deg); }
        .wobbly-p:nth-child(7n) { transform: rotate(-0.3deg); }

        /* 用户编辑样式 (灰色，不歪扭) */
        .user-edit-mode {
            color: var(--note-user) !important;
        }
        /* 强制覆盖 contenteditable 内部的 span 样式 */
        .nb-content-area[contenteditable="true"] {
            color: var(--note-user);
        }

        /* 标记样式 */
        mark { 
            background: transparent; color: inherit; 
            text-decoration: underline wavy var(--highlight);
            text-underline-offset: 4px; padding: 0 2px;
        }
        /* 删除线样式 (AI 使用) */
        del { 
            color: #444; 
            text-decoration-thickness: 1px; 
            text-decoration-color: #555;
            opacity: 0.6;
        }
        /* 下划线 */
        u {
            text-decoration: underline;
            text-decoration-color: #666;
            text-decoration-thickness: 1px;
            text-underline-offset: 3px;
        }
        
        /* 内部删除确认弹窗 */
        .nb-modal-mask {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.7); z-index: 30;
            display: none; justify-content: center; align-items: center;
        }
        .nb-modal-mask.active { display: flex; }
        .nb-modal-box {
            width: 80%; background: #222; border: 1px solid #555;
            padding: 20px; text-align: center; border-radius: 5px;
            color: #ccc; font-family: var(--note-font);
        }
        .nb-modal-btn-row { margin-top: 15px; display: flex; gap: 10px; justify-content: center; }
        .nb-modal-btn { 
            border: 1px solid #555; background: transparent; color: #aaa;
            padding: 5px 15px; cursor: pointer; font-family: inherit; font-size: 1rem;
        }
        .nb-modal-btn:hover { color: #fff; border-color: #fff; }
        .nb-modal-btn.del { border-color: #900; color: #900; }
        .nb-modal-btn.del:hover { background: #900; color: #fff; }
    `;
    document.head.appendChild(style);

    // 2. 注入 HTML 结构 (保持不变)
    const notebookHTML = `
    <div class="notebook-overlay" id="notebook-overlay" onclick="if(event.target===this) closeNotebook()">
        <div class="notebook-book">
            <div class="notebook-page active" id="nb-cover">
                <div class="nb-title" id="nb-cover-title">NAME</div>
                <div class="nb-subtitle" id="nb-cover-quote">...</div>
                <div style="margin-top:auto; font-size:0.7rem; color:#444;">(Tap arrow)</div>
            </div>
            <div class="notebook-page" id="nb-index">
                <div style="text-align:center; border-bottom:2px solid #333; padding-bottom:5px; margin-bottom:10px; font-weight:bold; letter-spacing:2px;">INDEX</div>
                <div class="nb-index-container" id="nb-index-list"></div>
            </div>
            <div class="notebook-page" id="nb-content-view">
                <div class="nb-header-row">
                    <span class="nb-date" id="nb-current-date">Date</span>
                    <div class="nb-actions">
                        <i class="fas fa-pen nb-act-btn" id="nb-edit-btn" onclick="toggleNoteEdit()" title="Edit (User)"></i>
                        <i class="fas fa-trash nb-act-btn danger" onclick="showNbDeleteConfirm()" title="Delete Entry"></i>
                    </div>
                </div>
                <div class="nb-content-area" id="nb-text-area" contenteditable="false"></div>
            </div>
            <div class="nb-modal-mask" id="nb-del-modal">
                <div class="nb-modal-box">
                    <div style="margin-bottom:5px; font-size:1.2rem; color:#a00;">TEAR PAGE?</div>
                    <div style="font-size:0.9rem;">Delete this entire entry?</div>
                    <div class="nb-modal-btn-row">
                        <button class="nb-modal-btn" onclick="hideNbDeleteConfirm()">NO</button>
                        <button class="nb-modal-btn del" onclick="confirmDeleteNote()">YES</button>
                    </div>
                </div>
            </div>
            <div class="notebook-nav-arrow" id="nb-nav-arrow" onclick="handleNavClick()">
                <i class="fas fa-chevron-right"></i>
            </div>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', notebookHTML);

})();

// --- 3. 记事本逻辑功能 ---

let currentNoteId = null;
let currentPage = 'cover'; 

function loadNotebookData() { return JSON.parse(localStorage.getItem('notebook_data')) || {}; }
function saveNotebookData(data) { localStorage.setItem('notebook_data', JSON.stringify(data)); }

window.openNotebook = function() {
    if (activeChatIndex === -1) return;
    const char = getCharacters()[activeChatIndex];
    document.getElementById('notebook-overlay').classList.add('active');
    
    document.getElementById('nb-cover-title').textContent = char.name;
    const nbData = loadNotebookData();
    if (nbData[char.name] && nbData[char.name].coverQuote) {
        document.getElementById('nb-cover-quote').textContent = `"${nbData[char.name].coverQuote}"`;
    } else {
        document.getElementById('nb-cover-quote').textContent = "...";
        generateCoverQuote(char);
    }
    switchToPage('cover');
}

window.closeNotebook = function() {
    document.getElementById('notebook-overlay').classList.remove('active');
    if (currentNoteId) saveCurrentNote();
}

window.switchToPage = function(page) {
    document.querySelectorAll('.notebook-page').forEach(p => p.classList.remove('active'));
    currentPage = page;
    const arrow = document.getElementById('nb-nav-arrow');

    if (page === 'cover') {
        document.getElementById('nb-cover').classList.add('active');
        arrow.innerHTML = '<i class="fas fa-chevron-right"></i>';
        arrow.title = "Open";
    } else if (page === 'index') {
        document.getElementById('nb-index').classList.add('active');
        renderNotebookIndex();
        arrow.innerHTML = '<i class="fas fa-times"></i>';
        arrow.title = "Close";
    } else if (page === 'content') {
        document.getElementById('nb-content-view').classList.add('active');
        arrow.innerHTML = '<i class="fas fa-chevron-left"></i>';
        arrow.title = "Back";
    }
}

window.handleNavClick = function() {
    if (currentPage === 'cover') switchToPage('index');
    else if (currentPage === 'index') closeNotebook();
    else if (currentPage === 'content') switchToPage('index');
}

window.renderNotebookIndex = function() {
    if (activeChatIndex === -1) return;
    const char = getCharacters()[activeChatIndex];
    const nbData = loadNotebookData();
    const charData = nbData[char.name] || { entries: [] };
    const list = document.getElementById('nb-index-list');
    list.innerHTML = '';

    if (charData.entries.length === 0) {
        list.innerHTML = '<div style="text-align:center; margin-top:100px; color:#444; font-size:0.9rem; font-style:italic;">(Blank Pages)</div>';
        return;
    }

    charData.entries.forEach(entry => {
        const item = document.createElement('div');
        item.className = 'nb-index-item';
        item.innerHTML = `<span>#${entry.id.slice(-3)}</span> <span>${entry.date}</span>`;
        item.onclick = () => openNoteEntry(entry.id);
        list.appendChild(item);
    });
}

window.openNoteEntry = function(id) {
    if (activeChatIndex === -1) return;
    const char = getCharacters()[activeChatIndex];
    const nbData = loadNotebookData();
    const charData = nbData[char.name];
    const entry = charData.entries.find(e => e.id === id);
    
    if (entry) {
        currentNoteId = id;
        document.getElementById('nb-current-date').textContent = entry.date;
        document.getElementById('nb-text-area').innerHTML = entry.content;
        
        // 重置编辑状态
        const area = document.getElementById('nb-text-area');
        area.contentEditable = "false";
        area.classList.remove('user-edit-mode');
        document.getElementById('nb-edit-btn').classList.remove('active');
        
        switchToPage('content');
    }
}

// --- 编辑逻辑：用户编辑变灰 ---
window.toggleNoteEdit = function() {
    const area = document.getElementById('nb-text-area');
    const btn = document.getElementById('nb-edit-btn');
    const isEditable = area.contentEditable === "true";
    
    if (isEditable) {
        // 结束编辑
        area.contentEditable = "false";
        area.classList.remove('user-edit-mode'); // 恢复预览模式
        btn.classList.remove('active');
        saveCurrentNote();
    } else {
        // 开始编辑
        area.contentEditable = "true";
        area.focus();
        btn.classList.add('active');
        // 添加类以将文字变为灰色
        area.classList.add('user-edit-mode');
    }
}

window.saveCurrentNote = function() {
    if (activeChatIndex === -1 || !currentNoteId) return;
    const char = getCharacters()[activeChatIndex];
    const nbData = loadNotebookData();
    const entry = nbData[char.name].entries.find(e => e.id === currentNoteId);
    if (entry) {
        entry.content = document.getElementById('nb-text-area').innerHTML;
        saveNotebookData(nbData);
    }
}

// --- 删除逻辑 ---
window.showNbDeleteConfirm = function() {
    document.getElementById('nb-del-modal').classList.add('active');
}
window.hideNbDeleteConfirm = function() {
    document.getElementById('nb-del-modal').classList.remove('active');
}
window.confirmDeleteNote = function() {
    hideNbDeleteConfirm();
    if (!currentNoteId || activeChatIndex === -1) return;

    const char = getCharacters()[activeChatIndex];
    const nbData = loadNotebookData();
    const entryIdx = nbData[char.name].entries.findIndex(e => e.id === currentNoteId);
    
    if (entryIdx > -1) {
        nbData[char.name].entries.splice(entryIdx, 1);
        saveNotebookData(nbData);
        switchToPage('index'); 
    }
}

// --- 触发器：每 20 次对话触发一次 ---
window.checkNotebookTrigger = function(charName) {
    const nbData = loadNotebookData();
    if (!nbData[charName]) nbData[charName] = { entries: [], msgCounter: 0 };
    
    nbData[charName].msgCounter++;
    saveNotebookData(nbData);

    // 阈值设为 20
    if (nbData[charName].msgCounter >= 20) {
        const history = chatHistory[charName];
        if (!history || history.length === 0) return;

        const endIdx = history.length - 1;
        // 获取最近 20 条消息作为上下文，确保 AI 知道发生了什么
        const startIdx = Math.max(0, endIdx - 20); 
        
        nbData[charName].msgCounter = 0; 
        saveNotebookData(nbData);
        
        const char = getCharacters().find(c => c.name === charName);
        if (char) generateDiaryEntry(char, startIdx, endIdx);
    }
}

// --- 长期记忆读取：过滤掉删除线内容 ---
window.getNotebookContext = function(charName) {
    const nbData = loadNotebookData();
    if (!nbData[charName] || nbData[charName].entries.length === 0) return "";
    
    let context = "\n[Character's Diary (Long-term Memory)]:\n";
    nbData[charName].entries.forEach(e => {
        // 创建一个临时 DOM 来解析 HTML 并移除 <del> 标签的内容
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = e.content;
        
        // 移除所有 <del> 标签及其内容
        const dels = tempDiv.querySelectorAll('del');
        dels.forEach(d => d.remove());
        
        // 获取剩余的纯文本
        let cleanText = tempDiv.innerText.replace(/\n\s*\n/g, '\n').trim();
        if (cleanText) {
            context += `Date ${e.date}: ${cleanText}\n`;
        }
    });
    return context + "\n";
}

// --- AI API 调用 ---

async function generateCoverQuote(char) {
    try {
        const prompt = `Generate a very short sentence (0-15 words) that represents the character "${char.name}". Abstract, poetic, or mysterious. No quotes.`;
        const url = localStorage.getItem('chat_api_url');
        const key = localStorage.getItem('chat_api_key');
        const model = localStorage.getItem('chat_api_model');
        if (!url || !key) return;

        const res = await fetch(`${url}/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
            body: JSON.stringify({
                model: model || 'gpt-3.5-turbo',
                messages: [{ role: "system", content: prompt }],
                temperature: 0.8
            })
        });
        const data = await res.json();
        const quote = data.choices[0].message.content.trim().replace(/^"|"$/g, '');
        
        const nbData = loadNotebookData();
        if (!nbData[char.name]) nbData[char.name] = { entries: [], msgCounter: 0 };
        nbData[char.name].coverQuote = quote;
        saveNotebookData(nbData);
        if (document.getElementById('nb-cover').classList.contains('active')) {
            document.getElementById('nb-cover-quote').textContent = `"${quote}"`;
        }
    } catch (e) { console.error(e); }
}

// --- 核心逻辑变更：更新/重写日记 ---
async function generateDiaryEntry(char, startIdx, endIdx) {
    try {
        const history = chatHistory[char.name];
        const slice = history.slice(startIdx, endIdx + 1);
        const newChatText = slice.map(m => `${m.sender === 'me' ? 'User' : char.name}: ${m.text}`).join('\n');
        const dateStr = new Date().toLocaleDateString();

        const nbData = loadNotebookData();
        if (!nbData[char.name]) nbData[char.name] = { entries: [], msgCounter: 0 };
        const entries = nbData[char.name].entries;
        
        // 查找今天的日记
        let existingEntry = entries.find(e => e.date === dateStr);
        let existingContent = existingEntry ? existingEntry.content : "";

        // 构造 Prompt：深度定制的日记生成
        // --- 替换开始：Prompt 修改 ---
        const prompt = `
You are ${char.name}. You are writing a NEW paragraph in your diary.

[Roleplay Instructions]
1. **Style**: Use "Written Language" (internal monologue), NOT "Spoken Language".
2. **Context**: You are appending to an existing diary. Do not repeat introductions.
3. **Source**: Base this entry ONLY on the [New Chat Logs].

[Visual Formatting]
- Wrap the paragraph in <span class="wobbly-p">...</span>.
- Use <mark>text</mark> for strong emotions.
- Use <u>text</u> for emphasis.

[Length Constraint]
**STRICTLY LIMIT this NEW entry to 10-50 words.** 
Be concise.

[New Chat Logs]:
${newChatText}

[Output]:
Return ONLY the HTML for the NEW paragraph. Start with <span class="wobbly-p">.
`;
        // --- 替换结束 ---

        const url = localStorage.getItem('chat_api_url');
        const key = localStorage.getItem('chat_api_key');
        const model = localStorage.getItem('chat_api_model');
        
        if (!url || !key) return; 

        const res = await fetch(`${url}/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
            body: JSON.stringify({
                model: model || 'gpt-3.5-turbo',
                messages: [{ role: "system", content: prompt }],
                temperature: 0.7
            })
        });

        const data = await res.json();
        let newContent = data.choices[0].message.content;

        // 简单的清理，防止 markdown 代码块
        newContent = newContent.replace(/```html|```/g, '').trim();

        if (existingEntry) {
            // 更新现有条目
            existingEntry.content += "\n" + newContent;
            existingEntry.endMsgIdx = endIdx;
        } else {
            // 创建新条目
            entries.push({
                id: Date.now().toString(),
                date: dateStr,
                content: newContent, 
                startMsgIdx: startIdx,
                endMsgIdx: endIdx
            });
        }
        
        saveNotebookData(nbData);
        
        // 界面刷新
        if (document.getElementById('notebook-overlay').classList.contains('active')) {
            if (currentNoteId && existingEntry && currentNoteId === existingEntry.id) {
                openNoteEntry(currentNoteId);
            } else {
                renderNotebookIndex(); 
            }
        }

    } catch (e) {
        console.error("Diary Gen Failed", e);
    }
}
