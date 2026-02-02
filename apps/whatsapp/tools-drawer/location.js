// location.js - 位置功能模块

// 打开位置弹窗
function openLocationModal() {
    document.getElementById('location-modal').classList.add('active');
    // 关闭工具栏
    document.getElementById('tools-drawer').classList.remove('open');
}

// 关闭位置弹窗
function closeLocationModal() {
    document.getElementById('location-modal').classList.remove('active');
    // 清空输入
    document.getElementById('location-name').value = '';
    document.getElementById('location-distance').value = '';
}

// 发送位置
function sendLocation() {
    const name = document.getElementById('location-name').value.trim();
    const distance = document.getElementById('location-distance').value.trim() || '';
    if (!name) return; // 至少需要位置名称
    const locationText = `[LOC: ${name}, ${distance}]`;
    document.getElementById('msg-input').value = locationText;
    closeLocationModal();
    // 发送消息
    pushUserMessage();
    const char = getCharacters()[activeChatIndex];
}