// image.js - 图片功能模块

// 打开图片弹窗
function openImageModal() {
    document.getElementById('image-modal').classList.add('active');
    // 关闭工具栏
    document.getElementById('tools-drawer').classList.remove('open');
}

// 关闭图片弹窗
function closeImageModal() {
    document.getElementById('image-modal').classList.remove('active');
    // 清空输入框
    document.getElementById('image-desc').value = '';
}

// 发送图片消息
function sendImage() {
    const desc = document.getElementById('image-desc').value.trim();
    if (!desc) return; // 至少需要图片描述
    
    const imageText = `[IMAGE: ${desc}]`;
    document.getElementById('msg-input').value = imageText;
    closeImageModal();
    // 发送消息
    pushUserMessage();
}

// 显示图片详情弹窗
function showImageDetail(desc, event) {
    // 移除现有的弹窗
    const existing = document.querySelector('.image-detail-note');
    if (existing) existing.remove();

    // 创建弹窗
    const note = document.createElement('div');
    note.className = 'image-detail-note';
    note.innerHTML = `<strong>图片内容</strong><br>${desc}`;
    document.body.appendChild(note);

    // 定位到图片消息下方，与礼物详情弹窗位置一致
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
