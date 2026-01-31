// transfer.js - 转账功能模块

let currentTransfer = null;

// 打开转账弹窗
function openTransferModal() {
    document.getElementById('transfer-modal').classList.add('active');
    // 关闭工具栏
    document.getElementById('tools-drawer').classList.remove('open');
}

// 关闭转账弹窗
function closeTransferModal() {
    document.getElementById('transfer-modal').classList.remove('active');
}

// 发送转账
function sendTransfer() {
    const amount = document.getElementById('transfer-amount').value.trim();
    const note = document.getElementById('transfer-note').value.trim() || '无';
    if (!amount || parseFloat(amount) <= 0) return; // 至少需要金额
    const transferText = `[TRANSFER: ${amount}, ${note}]`;
    document.getElementById('msg-input').value = transferText;
    closeTransferModal();
    // 清空输入
    document.getElementById('transfer-amount').value = '';
    document.getElementById('transfer-note').value = '';
    // 发送消息
    pushUserMessage();
}

// 关闭转账处理弹窗
function closeTransferActionModal() {
    document.getElementById('transfer-action-modal').classList.remove('active');
    currentTransfer = null;
}

// 接受转账
function acceptTransfer() {
    if (!currentTransfer) return;
    const char = getCharacters()[activeChatIndex];
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    chatHistory[char.name].push({ 
        sender: 'me', 
        text: `[TRANSFER_ACCEPTED: ${currentTransfer.amount}, ${currentTransfer.note}]`, 
        time: timeStr 
    });
    saveChatHistory(chatHistory);
    renderMessages(char.name);
    scrollToBottom();
    closeTransferActionModal();
}

// 拒绝转账
function rejectTransfer() {
    if (!currentTransfer) return;
    const char = getCharacters()[activeChatIndex];
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    chatHistory[char.name].push({ 
        sender: 'me', 
        text: `[TRANSFER_REJECTED: ${currentTransfer.amount}, ${currentTransfer.note}]`, 
        time: timeStr 
    });
    saveChatHistory(chatHistory);
    renderMessages(char.name);
    scrollToBottom();
    closeTransferActionModal();
    triggerAIResponse(char);
}