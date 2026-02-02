// settings.js - 聊天设置功能模块

// 聊天设置数据结构
const chatSettings = {
    // 默认设置
    default: {
        messageMemoryCount: 200, // AI聊天消息记忆条数
        // 其他设置项将在这里添加
    }
};

// 当前聊天的设置
let currentChatSettings = {};

// 打开聊天设置便签条
function openChatSettings() {
    if (activeChatIndex === -1) return;
    
    const char = getCharacters()[activeChatIndex];
    
    // 加载当前聊天的设置，如果没有则使用默认设置
    const savedSettings = loadChatSettings(char.name);
    currentChatSettings = { ...chatSettings.default, ...savedSettings };
    
    // 显示设置便签条
    document.getElementById('settings-note-overlay').classList.add('active');
    
    // 生成设置内容
    renderSettingsContent(char.name);
}

// 关闭聊天设置便签条
function closeChatSettings() {
    document.getElementById('settings-note-overlay').classList.remove('active');
}

// 渲染设置内容
function renderSettingsContent(charName) {
    const content = document.getElementById('settings-note-content');
    content.innerHTML = '';
    
    // AI聊天消息记忆条数设置
    const memoryItem = document.createElement('div');
    memoryItem.className = 'settings-item';
    memoryItem.innerHTML = `
        <label for="setting-memory-count">AI聊天消息记忆条数</label>
        <input type="number" id="setting-memory-count" min="1" max="1000" value="${currentChatSettings.messageMemoryCount}">
        <div style="font-size: 0.7rem; color: var(--text-dim); margin-top: 5px; font-style: italic;">
            设置AI在回复时会参考的历史消息条数。数值越大，AI能记住的对话越多，但可能影响响应速度。
        </div>
    `;
    content.appendChild(memoryItem);
    
    // 其他设置项可以在这里添加
    // 例如：
    // const otherItem = document.createElement('div');
    // otherItem.className = 'settings-item';
    // otherItem.innerHTML = `...`;
    // content.appendChild(otherItem);
}

// 保存聊天设置
function saveChatSettings() {
    if (activeChatIndex === -1) return;
    
    const char = getCharacters()[activeChatIndex];
    
    // 获取设置值
    const memoryCount = parseInt(document.getElementById('setting-memory-count').value) || 200;
    
    // 更新当前设置
    currentChatSettings.messageMemoryCount = memoryCount;
    
    // 保存到本地存储
    saveChatSettingsToStorage(char.name, currentChatSettings);
    
    // 关闭设置便签条
    closeChatSettings();
    
    // 可以在这里添加保存成功的提示
    console.log(`已保存 ${char.name} 的聊天设置`);
}

// 加载聊天设置
function loadChatSettings(charName) {
    const settingsData = JSON.parse(localStorage.getItem('whatsapp_chat_settings')) || {};
    return settingsData[charName] || {};
}

// 保存聊天设置到本地存储
function saveChatSettingsToStorage(charName, settings) {
    const settingsData = JSON.parse(localStorage.getItem('whatsapp_chat_settings')) || {};
    settingsData[charName] = settings;
    localStorage.setItem('whatsapp_chat_settings', JSON.stringify(settingsData));
}

// 获取聊天设置（供其他模块使用）
function getChatSettings(charName) {
    return loadChatSettings(charName);
}
