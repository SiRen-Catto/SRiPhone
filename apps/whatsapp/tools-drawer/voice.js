// voice.js - 语音功能模块

// 打开语音弹窗
function openVoiceModal() {
    document.getElementById('voice-modal').classList.add('active');
    // 关闭工具栏
    document.getElementById('tools-drawer').classList.remove('open');
}

// 关闭语音弹窗
function closeVoiceModal() {
    document.getElementById('voice-modal').classList.remove('active');
    // 清空输入框
    document.getElementById('voice-text').value = '';
    // 停止音脉动画
    stopPulseAnimation();
}

// 发送语音消息
function sendVoiceMessage() {
    const text = document.getElementById('voice-text').value.trim();
    if (!text || window.activeChatIndex === -1) return;
    
    const char = window.getCharacters()[window.activeChatIndex];
    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}`;
    
    // 计算模拟语音时长（根据文字长度）
    const duration = Math.max(1, Math.min(60, Math.ceil(text.length / 5)));
    
    // 构造语音消息格式
    const voiceText = `[VOICE: ${text}]`;
    
    window.chatHistory[char.name].push({ 
        sender: 'me', 
        text: voiceText, 
        time: timeStr,
        voiceDuration: duration
    });
    
    window.saveChatHistory(window.chatHistory);
    window.renderMessages(char.name);
    window.scrollToBottom();
    
    closeVoiceModal();
    // 不直接触发AI回复，保持和其他消息类型一致的行为
    // 如果需要AI回复，用户可以手动触发或等待系统自动处理
}

// 显示语音消息内容弹窗
function showVoiceDetail(text, event) {
    // 移除现有的弹窗
    const existing = document.querySelector('.voice-detail-note');
    if (existing) existing.remove();

    // 创建弹窗
    const note = document.createElement('div');
    note.className = 'voice-detail-note';
    note.innerHTML = `<strong>语音内容</strong><br>${text}`;
    document.body.appendChild(note);

    // 定位到语音消息下方，与礼物详情弹窗位置一致
    const rect = event.target.getBoundingClientRect();
    note.style.left = `${rect.left + rect.width / 2 - 100}px`;
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

// 音脉动画控制
let pulseAnimationInterval;

function startPulseAnimation() {
    const pulse = document.querySelector('.voice-pulse');
    if (!pulse) return;
    
    pulseAnimationInterval = setInterval(() => {
        const bars = pulse.querySelectorAll('.pulse-bar');
        bars.forEach((bar, index) => {
            const height = Math.random() * 20 + 5;
            bar.style.height = `${height}px`;
            bar.style.opacity = Math.random() * 0.7 + 0.3;
        });
    }, 200);
}

function stopPulseAnimation() {
    if (pulseAnimationInterval) {
        clearInterval(pulseAnimationInterval);
        pulseAnimationInterval = null;
    }
    
    // 重置所有音脉条
    const pulse = document.querySelector('.voice-pulse');
    if (pulse) {
        const bars = pulse.querySelectorAll('.pulse-bar');
        bars.forEach(bar => {
            bar.style.height = '5px';
            bar.style.opacity = '0.3';
        });
    }
}

// 监听输入框焦点，开始/停止音脉动画
document.addEventListener('DOMContentLoaded', () => {
    const voiceTextInput = document.getElementById('voice-text');
    if (voiceTextInput) {
        voiceTextInput.addEventListener('focus', startPulseAnimation);
        voiceTextInput.addEventListener('blur', stopPulseAnimation);
    }
});
