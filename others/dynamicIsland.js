/* others/dynamicIsland.js */

(function() {
    // ==========================================
    // 1. 注入 CSS 样式 (已修改 Modal 部分)
    // ==========================================
    const css = `
        /* 灵动岛 (Dynamic Island) Pro版 */
        .notch-container {
            position: absolute;
            top: 15px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 9000;
            width: 120px;
            height: 35px;
            background: #000;
            border-radius: 20px;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            color: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            cursor: pointer;
            overflow: hidden;
        }

        /* --- Mini Mode --- */
        .notch-mini {
            width: 100%; height: 100%;
            display: flex; justify-content: space-between; align-items: center;
            padding: 0 6px;
            opacity: 1; transition: opacity 0.2s;
        }
        .mini-cover {
            width: 24px; height: 24px; border-radius: 50%;
            object-fit: cover; flex-shrink: 0;
            border: 1px solid rgba(255,255,255,0.2);
            background-color: #333; display: block;
            transition: transform 0.3s ease;
        }
        /* 旋转动画 */
        @keyframes rotate-cover {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .notch-container.playing .mini-cover {
            animation: rotate-cover 8s linear infinite;
        }
        .notch-container:not(.playing) .mini-cover {
            animation-play-state: paused;
        }
        .mini-waveform { display: flex; gap: 2px; align-items: flex-end; height: 15px; }
        .wave-bar {
            width: 3px; background: #f7f7f7; border-radius: 2px;
            animation: wave 1s ease-in-out infinite; height: 3px;
        }
        .notch-container.playing .wave-bar { animation-play-state: running; }
        .notch-container:not(.playing) .wave-bar { animation-play-state: paused; height: 3px !important; }
        .wave-bar:nth-child(1) { animation-duration: 0.6s; height: 60%; }
        .wave-bar:nth-child(2) { animation-duration: 0.9s; height: 100%; }
        .wave-bar:nth-child(3) { animation-duration: 0.7s; height: 50%; }
        .wave-bar:nth-child(4) { animation-duration: 0.8s; height: 80%; }
        @keyframes wave { 0%, 100% { height: 3px; } 50% { height: 100%; } }

        /* --- Expanded Mode --- */
        .notch-container.expanded {
            width: 80%; height: 135px; border-radius: 32px;
            background: rgba(15, 15, 15, 0.95);
            backdrop-filter: blur(15px);
            box-shadow: 0 15px 40px rgba(0,0,0,0.6);
            border: 1px solid rgba(255,255,255,0.1);
            display: flex; flex-direction: column;
        }
        .notch-container.expanded .notch-mini { opacity: 0; pointer-events: none; position: absolute; }
        .island-content {
            display: flex; flex-direction: column;
            width: 100%; height: 80%;
            padding: 18px 20px 10px 20px;
            opacity: 0; transition: opacity 0.3s 0.1s;
            pointer-events: none; box-sizing: border-box;
        }
        .notch-container.expanded .island-content { opacity: 1; pointer-events: all; }
        .island-top { display: flex; gap: 12px; align-items: center; width: 100%; height: 48px; }
        .album-art-large {
            width: 48px; height: 48px; border-radius: 8px;
            object-fit: cover; flex-shrink: 0;
            box-shadow: 0 4px 10px rgba(0,0,0,0.4);
            background-color: #333; display: block;
        }
        .song-info { flex: 1; overflow: hidden; display: flex; flex-direction: column; justify-content: center; }
        .song-title { font-size: 0.95rem; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #fff; line-height: 1.2; }
        .song-artist { font-size: 0.75rem; color: #888; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
        .progress-area { width: 100%; margin-top: 12px; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
        .time-text { font-size: 0.6rem; color: #666; font-family: monospace; width: 30px; text-align: center;}
        .progress-bg { flex: 1; height: 4px; background: rgba(255,255,255,0.15); border-radius: 2px; position: relative; cursor: pointer; }
        .progress-fill { width: 0%; height: 100%; background: #fff; border-radius: 2px; }
        .controls-row { display: flex; justify-content: space-between; align-items: center; flex: 1; padding-bottom: 5px; }
        .main-controls { display: flex; gap: 25px; align-items: center; position: absolute; left: 50%; transform: translateX(-50%); }
        .control-btn { cursor: pointer; color: #ccc; transition: 0.2s; font-size: 1.2rem; }
        .control-btn:hover { color: #fff; transform: scale(1.1); }
        .play-pause-btn { font-size: 1.6rem; color: #fff; }
        .drag-handle { position: absolute; bottom: 6px; left: 50%; transform: translateX(-50%); width: 36px; height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px; pointer-events: none; }

        /* --- Music Modal (New Style) --- */
        .music-modal {
            position: absolute; 
            top: 155px; /* 紧贴灵动岛下方 */
            left: 50%; 
            transform: translateX(-50%) scale(0.95); /* 初始稍微缩小 */
            width: 90%; /* 稍微加宽，与岛对齐 */
            max-height: 320px;
            
            /* 玻璃拟态风格 */
            background: rgba(0, 0, 0, 0.85); 
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255,255,255,0.08); /* 极细的微光边框 */
            
            border-radius: 32px; /* 大圆角 */
            padding: 20px; 
            z-index: 8999; 
            color: #eee;
            display: none; 
            font-family: 'Courier New', Courier, monospace;
            box-shadow: 0 20px 50px rgba(0,0,0,0.6); /* 更深邃的阴影 */
            box-sizing: border-box;
            flex-direction: column;
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.32, 0.72, 0, 1);
        }
        
        .music-modal.active { 
            display: flex; 
            opacity: 1;
            transform: translateX(-50%) scale(1);
        }

        .input-group { display: flex; gap: 8px; margin-bottom: 8px; }
        
        /* 柔和的输入框 */
        .music-input { 
            flex: 1; 
            min-width: 0; 
            background: rgba(255,255,255,0.1); /* 半透明背景 */
            border: none; /* 去掉边框 */
            color: #fff; 
            padding: 4px 10px; 
            font-size: 1rem; 
            outline: none;
            border-radius: 12px; /* 圆角输入框 */
            transition: background 0.2s;
        }
        .music-input:focus { background: rgba(255,255,255,0.15); }
        .music-input::placeholder { color: rgba(255,255,255,0.3); }

        /* 添加按钮 */
        .modal-add-btn {
            background: rgba(255,255,255,0.15);
            color: #fff;
            border: none;
            border-radius: 12px;
            padding: 0 15px;
            cursor: pointer;
            font-weight: bold;
            transition: background 0.2s;
        }
        .modal-add-btn:hover { background: rgba(255,255,255,0.3); }

        .song-list { 
            overflow-y: auto; 
            flex: 1; 
            margin-top: 5px;
            padding-right: 5px; /* 给滚动条留点空隙 */
        }
        
        /* 隐藏滚动条但保留功能 */
        .song-list::-webkit-scrollbar { width: 4px; }
        .song-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 2px; }
        .song-list::-webkit-scrollbar-track { background: transparent; }

        .song-item { 
            padding: 6px 10px; 
            border-bottom: 1px solid rgba(255,255,255,0.05); /* 极淡的分隔线 */
            font-size: 0.8rem; 
            cursor: pointer; 
            display: flex; 
            justify-content: space-between;
            border-radius: 8px;
            transition: background 0.2s;
        }
        .song-item:hover { background: rgba(255,255,255,0.08); }
        .song-item.active { color:rgb(76, 132, 217); font-weight: bold; }
        .song-item:last-child { border-bottom: none; }
    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    // ==========================================
    // 2. 注入 HTML 结构 (更新了按钮的 class)
    // ==========================================
    function createDynamicIslandHTML() {
        const phoneContainer = document.querySelector('.phone-container');
        if (!phoneContainer) return;
        if (document.getElementById('dynamic-island')) return;

        const audio = document.createElement('audio');
        audio.id = 'global-audio';
        audio.style.display = 'none';
        phoneContainer.appendChild(audio);

        const island = document.createElement('div');
        island.id = 'dynamic-island';
        island.className = 'notch-container';
        island.setAttribute('onclick', 'window.handleIslandClick(event)');

        island.innerHTML = `
            <!-- Mini Mode -->
            <div class="notch-mini">
                <img id="mini-cover" class="mini-cover" src="" alt="cover">
                <div class="mini-waveform">
                    <div class="wave-bar"></div>
                    <div class="wave-bar"></div>
                    <div class="wave-bar"></div>
                    <div class="wave-bar"></div>
                </div>
            </div>

            <!-- Expanded Mode -->
            <div class="island-content">
                <div class="island-top">
                    <img id="music-cover" class="album-art-large" src="" alt="cover">
                    <div class="song-info">
                        <div id="music-title" class="song-title">Song Title</div>
                        <div id="music-artist" class="song-artist">Artist</div>
                    </div>
                    <div class="mini-waveform">
                        <div class="wave-bar"></div>
                        <div class="wave-bar"></div>
                        <div class="wave-bar"></div>
                        <div class="wave-bar"></div>
                    </div>
                </div>

                <div class="progress-area">
                    <span id="curr-time" class="time-text">0:00</span>
                    <div class="progress-bg" onclick="window.seekAudio(event)">
                        <div id="music-progress" class="progress-fill"></div>
                    </div>
                    <span id="total-time" class="time-text">0:00</span>
                </div>

                <div class="controls-row">
                    <i class="fas fa-list control-btn" onclick="window.toggleMusicModal(event)"></i>
                    <div class="main-controls">
                        <i class="fas fa-backward control-btn" onclick="window.prevSong(event)"></i>
                        <i id="play-btn" class="fas fa-play control-btn play-pause-btn" onclick="window.togglePlay(event)"></i>
                        <i class="fas fa-forward control-btn" onclick="window.nextSong(event)"></i>
                    </div>
                    <i class="fas fa-ellipsis-h control-btn"></i>
                </div>
                
                <div class="drag-handle"></div>
            </div>

            <!-- Playlist Modal (Updated Style) -->
            <div id="music-modal" class="music-modal" onclick="event.stopPropagation()">
                <div class="input-group">
                    <input type="text" id="add-music-name" class="music-input" placeholder="Name">
                    <input type="text" id="add-music-artist" class="music-input" placeholder="Artist">
                </div>
                <div class="input-group">
                    <input type="text" id="add-music-url" class="music-input" placeholder="MP3 URL">
                </div>
                <div class="input-group">
                    <input type="text" id="add-music-cover" class="music-input" placeholder="Cover URL (Optional)">
                    <button onclick="window.addMusic()" class="modal-add-btn">Add</button>
                </div>
                <div id="playlist-container" class="song-list"></div>
            </div>
        `;

        phoneContainer.appendChild(island);
    }

    // ==========================================
    // 3. 逻辑初始化
    // ==========================================
    function initDynamicIsland() {
        createDynamicIslandHTML();

        const audio = document.getElementById('global-audio');
        const island = document.getElementById('dynamic-island');
        
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
            addArtist: document.getElementById('add-music-artist'),
            addUrl: document.getElementById('add-music-url'),
            addCover: document.getElementById('add-music-cover')
        };

        let playlist = JSON.parse(localStorage.getItem('my_playlist')) || [
            { name: "505", artist: "Arctic Monkeys", url: "http://music.163.com/song/media/outer/url?id=16502047.mp3", cover: "https://xffkws.iflytek.com/group1/M00/EA/40/rB_aXmlnR3qAf5yZAABRS7rGAU0628.png" }
        ];
        let currentSongIndex = 0;
        let isExpanded = false;

        function initPlayer() {
            if (playlist.length > 0) loadSong(0, false); 
            renderPlaylist();
        }

        window.handleIslandClick = function(e) {
            if (e.target.closest('.control-btn') || e.target.closest('.progress-bg') || e.target.closest('.music-modal')) return;
            toggleIsland();
        };

        function toggleIsland() {
            isExpanded = !isExpanded;
            if (isExpanded) {
                island.classList.add('expanded');
            } else {
                island.classList.remove('expanded');
                els.modal.classList.remove('active');
            }
        }

        function loadSong(index, autoPlay = true) {
            if (index < 0 || index >= playlist.length) return;
            currentSongIndex = index;
            const song = playlist[index];
            
            // 检查音频链接有效性
            audio.src = song.url;
            audio.onerror = function() {
                console.warn(`音频链接失效: ${song.url}`);
                // 尝试下一个歌曲
                if (playlist.length > 1) {
                    let nextIndex = (currentSongIndex + 1) % playlist.length;
                    loadSong(nextIndex);
                }
            };
            
            const defaultCover = "https://cdn-icons-png.flaticon.com/512/10606/10606037.png";
            let coverUrl = (song.cover && song.cover.trim() !== "") ? song.cover : defaultCover;

            // 检查封面链接有效性
            els.miniCover.onerror = function() {
                console.warn(`封面链接失效: ${coverUrl}`);
                els.miniCover.src = defaultCover;
            };
            els.largeCover.onerror = function() {
                console.warn(`封面链接失效: ${coverUrl}`);
                els.largeCover.src = defaultCover;
            };
            
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

        window.togglePlay = function(e) {
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

        window.nextSong = function(e) {
            if(e) e.stopPropagation();
            let nextIndex = (currentSongIndex + 1) % playlist.length;
            loadSong(nextIndex);
        };

        window.prevSong = function(e) {
            if(e) e.stopPropagation();
            let prevIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
            loadSong(prevIndex);
        };

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
        
        audio.addEventListener('ended', () => window.nextSong());

        window.seekAudio = function(e) {
            e.stopPropagation();
            const width = e.currentTarget.clientWidth;
            const clickX = e.offsetX;
            const duration = audio.duration;
            audio.currentTime = (clickX / width) * duration;
        };

        window.toggleMusicModal = function(e) {
            if(e) e.stopPropagation();
            els.modal.classList.toggle('active');
        };

        function renderPlaylist() {
            els.playlist.innerHTML = '';
            playlist.forEach((song, index) => {
                const div = document.createElement('div');
                div.className = `song-item ${index === currentSongIndex ? 'active' : ''}`;
                div.innerHTML = `
                    <span onclick="window.playSpecific(${index})">${index + 1}. ${song.name}-${song.artist || 'Unknown'}</span>
                    <span style="color:#ff5555; padding:0 10px; opacity:0.7;" onclick="window.deleteSong(${index}, event)">✕</span>
                `;
                els.playlist.appendChild(div);
            });
        }

        window.playSpecific = function(index) {
            loadSong(index);
        };

        window.addMusic = function() {
            const name = els.addName.value;
            const artist = els.addArtist.value || "Unknown";
            const url = els.addUrl.value;
            const cover = els.addCover.value;
            if (name && url) {
                playlist.push({ name, artist, url, cover });
                localStorage.setItem('my_playlist', JSON.stringify(playlist));
                renderPlaylist();
                els.addName.value = '';
                els.addArtist.value = '';
                els.addUrl.value = '';
                els.addCover.value = '';
            }
        };

        window.deleteSong = function(index, e) {
            e.stopPropagation();
            if (typeof window.showConfirm === 'function') {
                window.showConfirm(`Remove "${playlist[index].name}"?`, () => {
                    playlist.splice(index, 1);
                    localStorage.setItem('my_playlist', JSON.stringify(playlist));
                    renderPlaylist();
                }, "REMOVE SONG");
            } else {
                if(confirm('Delete this song?')) {
                    playlist.splice(index, 1);
                    localStorage.setItem('my_playlist', JSON.stringify(playlist));
                    renderPlaylist();
                }
            }
        };

        initPlayer();
    }

    document.addEventListener('DOMContentLoaded', initDynamicIsland);
})();
