/* settings/api.js */

// --- 模型记忆功能初始化 ---
document.addEventListener('DOMContentLoaded', () => {
    const modelSelect = document.getElementById('api-model');
    if (!modelSelect) return;

    // 1. 页面加载时：从本地存储读取上次选的模型
    const savedModel = localStorage.getItem('selected_gpt_model');
    
    // 如果之前存了模型，先把它加到选项里（哪怕还没 fetch），避免显示空白
    if (savedModel) {
        // 检查是否已存在（fetch 后可能有了，或者页面刚刷新还是空的）
        const optionExists = [...modelSelect.options].some(o => o.value === savedModel);
        if (!optionExists) {
            const opt = document.createElement('option');
            opt.value = savedModel;
            opt.text = savedModel;
            modelSelect.appendChild(opt);
        }
        modelSelect.value = savedModel;
    }

    // 2. 切换选项时：立即保存到本地存储
    modelSelect.addEventListener('change', function() {
        localStorage.setItem('selected_gpt_model', this.value);
    });
});

// --- API 功能函数 ---

async function fetchModels() {
    const urlInput = document.getElementById('api-url').value.replace(/\/$/, '');
    const keyInput = document.getElementById('api-key').value;
    const btn = document.querySelector('#api-modal .btn-small'); // 稍微修改了选择器以确保准确
    
    if(!urlInput) return showError("请输入 API 地址");
    
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; 
    btn.disabled = true;
    
    try {
        const res = await fetch(`${urlInput}/models`, { 
            headers: { 'Authorization': `Bearer ${keyInput}` } 
        });
        
        if(!res.ok) throw new Error(res.status);
        
        const data = await res.json();
        const select = document.getElementById('api-model');
        
        // 清空旧选项
        select.innerHTML = '';
        
        const list = Array.isArray(data.data) ? data.data : data;
        list.forEach(m => { 
            const opt = document.createElement('option'); 
            opt.value = m.id; 
            opt.text = m.id; 
            select.appendChild(opt); 
        });

        // Fetch 完后，如果之前存过模型且在列表中，自动选中它
        const savedModel = localStorage.getItem('selected_gpt_model');
        if (savedModel && list.some(m => m.id === savedModel)) {
            select.value = savedModel;
        }

        showError(`已获取 ${list.length} 个模型`); // 复用 showError 作为成功提示
        
    } catch(e) { 
        showError("连接失败: " + e.message); 
    } finally { 
        btn.innerHTML = originalText; 
        btn.disabled = false; 
    }
}

function saveApiSettings() {
    document.getElementById('save-msg').textContent = "保存中...";
    
    localStorage.setItem('chat_api_url', document.getElementById('api-url').value);
    localStorage.setItem('chat_api_key', document.getElementById('api-key').value);
    
    // 如果下拉框有值，也保存一下
    const modelVal = document.getElementById('api-model').value;
    if(modelVal) {
        localStorage.setItem('chat_api_model', modelVal); // 兼容旧逻辑
        localStorage.setItem('selected_gpt_model', modelVal); // 新逻辑
    }

    document.getElementById('save-msg').textContent = "已保存";
    
    // 1秒后关闭
    setTimeout(() => {
        // closeModal 是 index.html 全局定义的，可以直接调用
        if(typeof closeModal === 'function') {
            closeModal('api-modal');
        }
    }, 1000);
}
