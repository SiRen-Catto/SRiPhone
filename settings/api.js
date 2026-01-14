/* settings/api.js */

// --- API 预设管理 ---
const API_PRESETS_KEY = 'api_presets';
const CURRENT_PRESET_KEY = 'current_api_preset';

// 获取所有预设
function getApiPresets() {
    const presets = localStorage.getItem(API_PRESETS_KEY);
    return presets ? JSON.parse(presets) : {};
}

// 保存所有预设
function saveApiPresets(presets) {
    localStorage.setItem(API_PRESETS_KEY, JSON.stringify(presets));
}

// 渲染预设列表
function renderApiPresetsList() {
    const presets = getApiPresets();
    const currentPreset = localStorage.getItem(CURRENT_PRESET_KEY);
    const list = document.getElementById('api-presets-list');
    
    list.innerHTML = '';
    
    if (Object.keys(presets).length === 0) {
        list.innerHTML = '<div style="padding: 10px; text-align: center; color: var(--text-dim); font-size: 0.8rem;">暂无预设</div>';
        return;
    }
    
    Object.entries(presets).forEach(([name, config]) => {
        const item = document.createElement('div');
        item.className = `api-preset-item ${name === currentPreset ? 'active' : ''}`;
        item.innerHTML = `
            <span style="flex: 1; cursor: pointer;" onclick="loadApiPreset('${name}')">${name}</span>
            <span class="api-preset-delete" onclick="deleteApiPreset('${name}', event)">删除</span>
        `;
        list.appendChild(item);
    });
}

// 保存为预设
window.saveApiPreset = function() {
    const presetName = document.getElementById('api-preset-name').value.trim();
    if (!presetName) {
        showInfo('请输入预设名', 'warning');
        return;
    }
    
    const url = document.getElementById('api-url').value;
    const key = document.getElementById('api-key').value;
    const model = document.getElementById('api-model').value;
    
    if (!url || !key) {
        showInfo('请先填写 API 地址和密钥', 'error');
        return;
    }
    
    const presets = getApiPresets();
    presets[presetName] = { url, key, model };
    saveApiPresets(presets);
    
    localStorage.setItem(CURRENT_PRESET_KEY, presetName);
    document.getElementById('api-preset-name').value = '';
    
    renderApiPresetsList();
    showInfo(`预设 "${presetName}" 已保存`);
};

// 加载预设
window.loadApiPreset = function(presetName) {
    const presets = getApiPresets();
    const preset = presets[presetName];
    
    if (!preset) {
        showInfo('预设不存在', 'error');
        return;
    }
    
    document.getElementById('api-url').value = preset.url;
    document.getElementById('api-key').value = preset.key;
    document.getElementById('api-model').value = preset.model || '';
    
    localStorage.setItem(CURRENT_PRESET_KEY, presetName);
    renderApiPresetsList();
    showInfo(`已加载预设 "${presetName}"`);
};

// 删除预设
window.deleteApiPreset = function(presetName, event) {
    event.stopPropagation();
    
    window.showConfirmOrAlert(`删除预设 "${presetName}"？`, () => {
        const presets = getApiPresets();
        delete presets[presetName];
        saveApiPresets(presets);
        
        if (localStorage.getItem(CURRENT_PRESET_KEY) === presetName) {
            localStorage.removeItem(CURRENT_PRESET_KEY);
        }
        
        renderApiPresetsList();
        showInfo(`预设 "${presetName}" 已删除`);
    }, '删除预设');
};

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
    
    // 3. 初始化预设列表
    renderApiPresetsList();
});

// --- API 功能函数 ---

async function fetchModels() {
    const urlInput = document.getElementById('api-url').value.replace(/\/$/, '');
    const keyInput = document.getElementById('api-key').value;
    const btn = document.querySelector('#api-modal button[onclick="fetchModels()"]');
    
    if(!urlInput) return showInfo("请输入 API 地址", 'error');
    
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 获取模型'; 
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

        showInfo(`已获取 ${list.length} 个模型`);
        
    } catch(e) { 
        showInfo("连接失败: " + e.message, 'error'); 
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
