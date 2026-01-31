// tools.js - 工具栏基础功能模块

// 切换工具栏显示/隐藏
function toggleTools() { toolsDrawer.classList.toggle('open'); }

// 关闭工具栏
function closeTools() { toolsDrawer.classList.remove('open'); }

// 重新生成AI回复
function actionRegenerate() {
    if (activeChatIndex === -1) return;
    const char = getCharacters()[activeChatIndex];
    const msgs = chatHistory[char.name];
    let lastUserIndex = -1;
    for (let i = msgs.length - 1; i >= 0; i--) {
        if (msgs[i].sender === 'me') {
            lastUserIndex = i;
            break;
        }
    }
    if (lastUserIndex === -1) return;
    chatHistory[char.name] = msgs.slice(0, lastUserIndex + 1);
    saveChatHistory(chatHistory);
    renderMessages(char.name);
    closeTools();
    triggerAIResponse(char);
}

// 切换选择模式
function toggleSelectionMode() {
    isSelectionMode = !isSelectionMode;
    selectedIndices.clear();
    closeTools(); 
    if (isSelectionMode) {
        normalControls.style.display = 'none';
        selectionControls.classList.add('active');
        document.getElementById('sel-count').textContent = '0 selected';
    } else {
        normalControls.style.display = 'flex';
        selectionControls.classList.remove('active');
        const char = getCharacters()[activeChatIndex];
        renderMessages(char.name); 
    }
}

// 删除选中的消息
function deleteSelectedMessages() {
    if (activeChatIndex === -1 || selectedIndices.size === 0) return;
    const char = getCharacters()[activeChatIndex];
    const msgs = chatHistory[char.name];
    const newMsgs = msgs.filter((_, idx) => !selectedIndices.has(idx));
    chatHistory[char.name] = newMsgs;
    saveChatHistory(chatHistory);
    toggleSelectionMode(); 
}