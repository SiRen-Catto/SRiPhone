// others/tutorial.js

(function() {
    // 1. 注入教程界面的 CSS
    const style = document.createElement('style');
    style.textContent = `
        .tutorial-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(5, 5, 5, 0.6);
            backdrop-filter: blur(10px); 
            -webkit-backdrop-filter: blur(10px);
            color: var(--text-main);
            z-index: 9000; /* 盖住屏幕和底栏，但在挂坠之下 */
            border-radius: 36px; /* 适配手机圆角 */
            padding: 40px 20px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            align-items: center;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.4s ease;
            overflow-y: auto;
        }
        body.light-mode .tutorial-overlay {
            background-color: rgba(240, 240, 240, 0.6); /* 浅色半透明 */
        }
        .tutorial-overlay.active {
            opacity: 1;
            pointer-events: auto;
        }

        .tutorial-content {
            width: 100%;
            max-width: 340px;
            text-align: left;
            line-height: 1.6;
            font-size: 14px;
        }

        .tutorial-content h2 {
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 10px;
            margin-bottom: 20px;
            text-align: center;
        }

        .tutorial-content h3 {
            color: var(--text-dim);
            margin-top: 20px;
            font-size: 16px;
        }
        
        /* 隐藏滚动条但保留功能 */
        .tutorial-overlay::-webkit-scrollbar {
            width: 0px;
        }
    `;
    document.head.appendChild(style);

    // 2. 创建教程界面的 HTML
    function createTutorialInterface() {
        const phoneContainer = document.querySelector('.phone-container');
        if (!phoneContainer) return;

        const overlay = document.createElement('div');
        overlay.className = 'tutorial-overlay';
        overlay.id = 'tutorialOverlay';
        
        // 这里编写教程内容
        overlay.innerHTML = `
            <div class="tutorial-content">
                <h2>SRiPhone 使用指南</h2>
                <p>再次点击🖤返回手机</p>
                <br><br>
                <p style="text-align:center; color:var(--text-dim); font-size:12px;">
                    没想好怎么装修
                </p>
                <br>
                <p style="text-align:center; color:var(--text-dim); font-size:12px;">
                    Designed by SiRen
                </p>
            </div>
        `;

        phoneContainer.appendChild(overlay);
    }

    // 初始化
    window.addEventListener('DOMContentLoaded', createTutorialInterface);

    // 暴露全局方法供 pendant.js 调用
    window.SRTutorial = {
        show: function() {
            const overlay = document.getElementById('tutorialOverlay');
            if (overlay) overlay.classList.add('active');
        },
        hide: function() {
            const overlay = document.getElementById('tutorialOverlay');
            if (overlay) overlay.classList.remove('active');
        },
        isOpen: function() {
            const overlay = document.getElementById('tutorialOverlay');
            return overlay && overlay.classList.contains('active');
        }
    };
})();
