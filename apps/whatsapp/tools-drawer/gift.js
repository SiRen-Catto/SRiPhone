// gift.js - 礼物功能模块

// 打开礼物弹窗
function openGiftModal() {
    document.getElementById('gift-modal').classList.add('active');
    // 关闭工具栏
    document.getElementById('tools-drawer').classList.remove('open');
}

// 关闭礼物弹窗
function closeGiftModal() {
    document.getElementById('gift-modal').classList.remove('active');
}

// 发送礼物
function sendGift() {
    const name = document.getElementById('gift-name').value.trim();
    const desc = document.getElementById('gift-desc').value.trim() || '无';
    const price = document.getElementById('gift-price').value.trim();
    if (!name || !price) return; // 至少需要名称和价格
    const giftText = `[GIFT: ${name}, ${price}, ${desc}]`;
    document.getElementById('msg-input').value = giftText;
    closeGiftModal();
    // 清空输入
    document.getElementById('gift-name').value = '';
    document.getElementById('gift-desc').value = '';
    document.getElementById('gift-price').value = '';
    // 发送消息，但不触发AI回复
    pushUserMessage();
}

// 显示礼物详情便签条
function showGiftDetail(name, price, desc, event) {
    // 移除现有的便签条
    const existing = document.querySelector('.gift-note');
    if (existing) existing.remove();

    // 创建便签条
    const note = document.createElement('div');
    note.className = 'gift-note';
    note.innerHTML = `<strong>${name}</strong><br>价格: ${price}￥<br>${desc}`;
    document.body.appendChild(note);

    // 定位到礼物消息下方
    const rect = event.target.getBoundingClientRect();
    note.style.top = `${rect.bottom + 10}px`;

    // 显示
    setTimeout(() => note.classList.add('active'), 10);

    // 点击其他地方关闭
    const closeNote = (e) => {
        if (!note.contains(e.target)) {
            note.classList.remove('active');
            setTimeout(() => note.remove(), 300);
            document.removeEventListener('click', closeNote);
        }
    };
    setTimeout(() => document.addEventListener('click', closeNote), 10);
}
