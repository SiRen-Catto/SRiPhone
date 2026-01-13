/* others/dynamicIsland.js */
// ==========================================
// 1. 自动注入 CSS 样式
// ==========================================
(function injectStyles() {
    const css = `
    /* ============================
        灵动岛 (Dynamic Island) Pro版
        ============================ */
        .notch-container {
        position: absolute;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 9000;
        width: 120px; /* 收起时稍宽一点容纳内容 */
        height: 35px;
        background: #000;
        border-radius: 20px;
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        color: white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        cursor: pointer;
        overflow: hidden; /* 关键：防止内容溢出 */
    }

    /* --- 1. 收起状态 (Mini Mode) --- */
    .notch-mini {
        width: 100%; height: 100%;
        display: flex; justify-content: space-between; align-items: center;
        padding: 0 6px;
        opacity: 1; transition: opacity 0.2s;
    }

    /* 微缩封面 (Mini) - IMG版 */
    .mini-cover {
        width: 24px; height: 24px; 
        border-radius: 50%;
        object-fit: cover; /* 关键：保持比例不拉伸 */
        flex-shrink: 0;    /* 关键：防止被挤扁 */
        border: 1px solid rgba(255,255,255,0.2);
        background-color: #333; /* 图片加载失败时的底色 */
        display: block;
    }

    /* 声波动画 */
    .mini-waveform {
        display: flex; gap: 2px; align-items: flex-end; height: 15px;
    }
    .wave-bar {
        width: 3px; background: #f7f7f7; border-radius: 2px;
        animation: wave 1s ease-in-out infinite;
        height: 3px;
    }
    .notch-container.playing .wave-bar { animation-play-state: running; }
    .notch-container:not(.playing) .wave-bar { animation-play-state: paused; height: 3px !important; }

    .wave-bar:nth-child(1) { animation-duration: 0.6s; height: 60%; }
    .wave-bar:nth-child(2) { animation-duration: 0.9s; height: 100%; }
    .wave-bar:nth-child(3) { animation-duration: 0.7s; height: 50%; }
    .wave-bar:nth-child(4) { animation-duration: 0.8s; height: 80%; }

    @keyframes wave {
        0%, 100% { height: 3px; }
        50% { height: 100%; }
    }

    /* --- 2. 展开状态 (Expanded Mode) - 紧凑优化版 --- */
    .notch-container.expanded {
        width: 92%;
        height: 140px; /* 保持高度不变 */
        border-radius: 32px; /* 圆角稍微加大一点，更圆润 */
        background: rgba(15, 15, 15, 0.95);
        backdrop-filter: blur(15px);
        box-shadow: 0 15px 40px rgba(0,0,0,0.6);
        border: 1px solid rgba(255,255,255,0.1);
        display: flex; 
        flex-direction: column;
    }

    /* 收起时隐藏Mini，展开时隐藏Expanded */
    .notch-container.expanded .notch-mini { opacity: 0; pointer-events: none; position: absolute; }

    .island-content {
        display: flex; flex-direction: column;
        width: 100%; height: 100%;
        /* 关键：减小内边距，给内容腾地儿 */
        padding: 18px 20px 10px 20px; 
        opacity: 0; transition: opacity 0.3s 0.1s;
        pointer-events: none;
        box-sizing: border-box;
    }
    .notch-container.expanded .island-content { opacity: 1; pointer-events: all; }

    /* 上半部分：封面和信息 */
    .island-top { 
        display: flex; gap: 12px; align-items: center; width: 100%; 
        height: 48px; /* 固定高度 */
    }

    /* 展开的大封面 (Large) - IMG版 */
    .album-art-large {
        width: 48px; height: 48px; 
        border-radius: 8px;
        object-fit: cover; /* 关键：保持比例不拉伸 */
        flex-shrink: 0;    /* 关键：防止被挤扁 */
        box-shadow: 0 4px 10px rgba(0,0,0,0.4);
        background-color: #333;
        display: block;
    }

    .song-info { flex: 1; overflow: hidden; display: flex; flex-direction: column; justify-content: center; }
    .song-title { font-size: 0.95rem; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #fff; line-height: 1.2; }
    .song-artist { font-size: 0.75rem; color: #888; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}

    /* 进度条 - 压缩上下间距 */
    .progress-area { 
        width: 100%; 
        margin-top: 12px; margin-bottom: 8px; /* 关键：减少间距 */
        display: flex; align-items: center; gap: 8px; 
    }
    .time-text { font-size: 0.6rem; color: #666; font-family: monospace; width: 30px; text-align: center;}
    .progress-bg { flex: 1; height: 4px; background: rgba(255,255,255,0.15); border-radius: 2px; position: relative; cursor: pointer; }
    .progress-fill { width: 0%; height: 100%; background: #fff; border-radius: 2px; }

    /* 控制区 - 关键优化 */
    .controls-row {
        display: flex; justify-content: space-between; align-items: center;
        flex: 1; /* 占据剩余空间 */
        padding-bottom: 5px; /* 给底部横条留点位置 */
    }

    /* 中间的主控制按钮 */
    .main-controls { 
        display: flex; gap: 25px; align-items: center; 
        position: absolute; left: 50%; transform: translateX(-50%); /* 绝对居中，防止被两边挤压 */
    }

    .control-btn { cursor: pointer; color: #ccc; transition: 0.2s; font-size: 1.2rem; } /* 默认图标变小 */
    .control-btn:hover { color: #fff; transform: scale(1.1); }

    /* 播放/暂停按钮稍微大一点 */
    .play-pause-btn { font-size: 1.6rem; color: #fff; } 

    /* 底部收起条 */
    .drag-handle {
        position: absolute; bottom: 6px; left: 50%; transform: translateX(-50%);
        width: 36px; height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px;
        pointer-events: none;
    }
    /* --- 音乐列表弹窗 (修正版) --- */
    .music-modal {
        position: absolute; top: 160px;
        left: 50%; transform: translateX(-50%);
        width: 85%; /*稍微改窄一点点，留出更多边距*/
        max-height: 300px;
        background: rgba(20, 20, 20, 0.95);
        border: 1px solid #333; border-radius: 15px;
        padding: 15px; z-index: 8999; color: #ddd;
        display: none; backdrop-filter: blur(10px);
        font-family: 'Courier New', Courier, monospace;
        box-shadow: 0 10px 40px rgba(0,0,0,0.8);
        box-sizing: border-box; /* 关键：防止padding撑大盒子 */
    }
    .music-modal.active { display: flex; flex-direction: column; animation: fadeIn 0.3s; }

    .modal-header { display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px dashed #555; padding-bottom: 5px; }

    .input-group { 
        display: flex; 
        gap: 8px; /* 间距微调 */
        margin-bottom: 10px; 
    }

    .music-input { 
        flex: 1; 
        min-width: 0; /* 关键修正：允许输入框缩小，不再撑爆屏幕 */
        background: #000; 
        border: 1px solid #444; 
        color: #fff; 
        padding: 6px; 
        font-size: 0.8rem; 
        outline: none;
        border-radius: 4px;
    }

    .music-input:focus { border-color: #888; }

    .song-list { overflow-y: auto; flex: 1; }
    .song-item { padding: 10px; border-bottom: 1px solid #333; font-size: 0.8rem; cursor: pointer; display: flex; justify-content: space-between;}
    .song-item:hover { background: #333; }
    .song-item.active { color: #4cd964; font-weight: bold; }

    `; // <--- 结束的反引号

    const style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
})();

// ==========================================
// 2. 原有的 JS 逻辑
// ==========================================
// 下面接着写你 dynamicIsland.js 原本的内容...
// function handleIslandClick(event) { ...

// 等待 DOM 加载完成，防止找不到元素
document.addEventListener('DOMContentLoaded', () => {
    initDynamicIsland();
});

// 定义全局变量，以便 HTML 中的 onclick 能调用
let handleIslandClick, togglePlay, prevSong, nextSong, seekAudio, toggleMusicModal, addMusic, playSpecific, deleteSong;

function initDynamicIsland() {
    const audio = document.getElementById('global-audio');
    const island = document.getElementById('dynamic-island');
    
    // 元素获取
    const els = {
        miniCover: document.getElementById('mini-cover'),
        largeCover: document.getElementById('music-cover'),
        title: document.getElementById('music-title'),
        artist: document.getElementById('music-artist'),
        playBtn: document.getElementById('play-btn'),
        progress: document.getElementById('music-progress'),
        currTime: document.getElementById('curr-time'),
        totalTime: document.getElementById('total-time'),
        modal: document.getElementById('music-modal'),
        playlist: document.getElementById('playlist-container'),
        addName: document.getElementById('add-music-name'),
        addUrl: document.getElementById('add-music-url'),
        addCover: document.getElementById('add-music-cover')
    };

    let playlist = JSON.parse(localStorage.getItem('my_playlist')) || [
        { name: "Lofi Chill", artist: "Unknown", url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Arps/Chad_Crouch_-_Elips.mp3", cover: "https://i.pinimg.com/564x/24/68/3b/24683b547285220c4c47f7d18a096c4a.jpg" }
    ];
    let currentSongIndex = 0;
    let isExpanded = false;

    // --- 核心功能函数 ---

    function initPlayer() {
        if (playlist.length > 0) loadSong(0, false); 
        renderPlaylist();
    }

    // 1. 交互逻辑：点击岛屿
    handleIslandClick = function(e) {
        // 如果点击的是控制按钮或弹窗，不处理岛屿的伸缩
        if (e.target.closest('.control-btn') || e.target.closest('.progress-bg')) return;
        toggleIsland();
    };

    function toggleIsland() {
        isExpanded = !isExpanded;
        if (isExpanded) {
            island.classList.add('expanded');
        } else {
            island.classList.remove('expanded');
            els.modal.classList.remove('active'); // 收起岛屿时关闭列表
        }
    }

    // 2. 播放核心
    function loadSong(index, autoPlay = true) {
        if (index < 0 || index >= playlist.length) return;
        currentSongIndex = index;
        const song = playlist[index];
        
        audio.src = song.url;
        
        const defaultCover = "https://cdn-icons-png.flaticon.com/512/10606/10606037.png";
        let coverUrl = (song.cover && song.cover.trim() !== "") ? song.cover : defaultCover;

        els.miniCover.src = coverUrl;
        els.largeCover.src = coverUrl;
        
        els.title.textContent = song.name;
        els.artist.textContent = song.artist || 'Unknown';
        
        renderPlaylist();

        if (autoPlay) {
            audio.play().catch(e => console.log("Auto-play prevented"));
            updatePlayState(true);
        } else {
            updatePlayState(false);
        }
    }

    togglePlay = function(e) {
        if(e) e.stopPropagation();
        if (audio.paused) {
            audio.play();
            updatePlayState(true);
        } else {
            audio.pause();
            updatePlayState(false);
        }
    };

    function updatePlayState(isPlaying) {
        if (isPlaying) {
            island.classList.add('playing'); 
            els.playBtn.className = 'fas fa-pause control-btn play-pause-btn';
        } else {
            island.classList.remove('playing'); 
            els.playBtn.className = 'fas fa-play control-btn play-pause-btn';
        }
    }

    nextSong = function(e) {
        if(e) e.stopPropagation();
        let nextIndex = (currentSongIndex + 1) % playlist.length;
        loadSong(nextIndex);
    };

    prevSong = function(e) {
        if(e) e.stopPropagation();
        let prevIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
        loadSong(prevIndex);
    };

    // 3. 进度条与时间
    function formatTime(s) {
        if(isNaN(s)) return "0:00";
        const mins = Math.floor(s / 60);
        const secs = Math.floor(s % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    audio.addEventListener('timeupdate', () => {
        const percent = (audio.currentTime / audio.duration) * 100;
        els.progress.style.width = percent + '%';
        els.currTime.textContent = formatTime(audio.currentTime);
        els.totalTime.textContent = formatTime(audio.duration);
    });
    
    audio.addEventListener('ended', () => nextSong());

    seekAudio = function(e) {
        e.stopPropagation();
        const width = e.currentTarget.clientWidth;
        const clickX = e.offsetX;
        const duration = audio.duration;
        audio.currentTime = (clickX / width) * duration;
    };

    // 4. 列表管理
    toggleMusicModal = function(e) {
        if(e) e.stopPropagation();
        els.modal.classList.toggle('active');
    };

    function renderPlaylist() {
        els.playlist.innerHTML = '';
        playlist.forEach((song, index) => {
            const div = document.createElement('div');
            div.className = `song-item ${index === currentSongIndex ? 'active' : ''}`;
            div.innerHTML = `
                <span onclick="playSpecific(${index})">${index + 1}. ${song.name}</span>
                <span style="color:#a00; padding:0 10px;" onclick="deleteSong(${index}, event)">×</span>
            `;
            els.playlist.appendChild(div);
        });
    }

    playSpecific = function(index) {
        loadSong(index);
    };

    addMusic = function() {
        const name = els.addName.value;
        const url = els.addUrl.value;
        const cover = els.addCover.value;
        if (name && url) {
            playlist.push({ name, artist: "Unknown", url, cover });
            localStorage.setItem('my_playlist', JSON.stringify(playlist));
            renderPlaylist();
            els.addName.value = '';
            els.addUrl.value = '';
            els.addCover.value = '';
        }
    };

    deleteSong = function(index, e) {
        e.stopPropagation();
        
        // 调用 index.html 里定义的 showConfirm
        if (typeof window.showConfirm === 'function') {
            window.showConfirm(`Remove "${playlist[index].name}"?`, () => {
                playlist.splice(index, 1);
                localStorage.setItem('my_playlist', JSON.stringify(playlist));
                renderPlaylist();
            }, "REMOVE SONG");
        } else {
            // 降级处理：如果没有 showConfirm，直接删除
            if(confirm('Delete this song?')) {
                playlist.splice(index, 1);
                localStorage.setItem('my_playlist', JSON.stringify(playlist));
                renderPlaylist();
            }
        }
    };

    // 启动
    initPlayer();
}
