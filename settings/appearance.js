/* settings/appearance.js */

// --- 主题设置 ---
function setTheme(themeName) {
    const body = document.body;
    themeName === 'light' ? body.classList.add('light-mode') : body.classList.remove('light-mode');
    localStorage.setItem('app_theme', themeName);
}

// 初始化主题 (立即执行)
if (localStorage.getItem('app_theme') === 'light') {
    document.body.classList.add('light-mode');
}

// --- 字体管理系统 ---
function getSavedFonts() { 
    return JSON.parse(localStorage.getItem('custom_fonts')) || []; 
}

function initFonts() {
    const fonts = getSavedFonts();
    const styleTag = document.getElementById('custom-font-styles');
    let cssRules = '';
    
    // 注入 @font-face
    fonts.forEach(font => { 
        cssRules += `@font-face { font-family: '${font.name}'; src: url('${font.url}'); }`; 
    });
    styleTag.textContent = cssRules;

    // 应用当前选中的字体
    const activeFont = localStorage.getItem('active_font_name');
    if (activeFont && activeFont !== 'Default') {
        document.documentElement.style.setProperty('--main-font', `'${activeFont}', sans-serif`);
    } else {
        document.documentElement.style.setProperty('--main-font', "'Courier New', Courier, monospace");
    }
}

function renderFontList() {
    const container = document.getElementById('font-list-container');
    const fonts = getSavedFonts();
    const activeFont = localStorage.getItem('active_font_name') || 'Default';
    
    container.innerHTML = '';
    
    // 默认字体选项
    const defaultItem = document.createElement('div');
    defaultItem.className = `font-item ${activeFont === 'Default' ? 'active' : ''}`;
    defaultItem.innerHTML = `<div style="flex:1" onclick="switchFont('Default')"><span style="font-weight:bold;font-size:0.85rem">系统默认</span><br><span style="font-size:0.7rem;color:var(--text-dim)">Courier New</span></div>`;
    container.appendChild(defaultItem);

    // 自定义字体列表
    fonts.forEach((font, index) => {
        const item = document.createElement('div');
        item.className = `font-item ${activeFont === font.name ? 'active' : ''}`;
        item.innerHTML = `<div style="flex:1" onclick="switchFont('${font.name}')"><span style="font-weight:bold;font-size:0.85rem">${font.name}</span><br><span style="font-size:0.7rem;color:var(--text-dim)">Preview Text</span></div><div class="delete-font-btn" onclick="deleteFont(${index})"><i class="fas fa-trash"></i></div>`;
        container.appendChild(item);
    });
}

function switchFont(fontName) {
    localStorage.setItem('active_font_name', fontName);
    if (fontName === 'Default') {
        document.documentElement.style.setProperty('--main-font', "'Courier New', Courier, monospace");
    } else {
        document.documentElement.style.setProperty('--main-font', `'${fontName}', sans-serif`);
    }
    renderFontList();
}

function addCustomFont() {
    const nameInput = document.getElementById('new-font-name');
    const urlInput = document.getElementById('new-font-url');
    
    const name = nameInput.value.trim();
    const url = urlInput.value.trim();

    if (!name || !url) return showInfo('请填写完整', 'warning'); // showInfo 在 index.html 中定义
    
    const fonts = getSavedFonts();
    if (fonts.some(f => f.name === name)) return showInfo('名称已存在', 'warning');
    
    fonts.push({ name, url });
    localStorage.setItem('custom_fonts', JSON.stringify(fonts));
    
    nameInput.value = '';
    urlInput.value = '';
    
    initFonts(); 
    renderFontList(); 
    switchFont(name);
}

function deleteFont(index) {
    const fonts = getSavedFonts();
    const deletedName = fonts[index].name;
    
    fonts.splice(index, 1);
    localStorage.setItem('custom_fonts', JSON.stringify(fonts));
    
    if (localStorage.getItem('active_font_name') === deletedName) {
        switchFont('Default');
    }
    
    initFonts(); 
    renderFontList();
}

// 初始化执行
initFonts();
