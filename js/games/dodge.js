const MINECRAFT_FACES = ['creeper', 'steve', 'zombie', 'enderman'];

const DodgeGame = {
    canvas: null,
    ctx: null,
    W: 0,
    H: 0,
    bus: null,
    enemies: [],
    score: 0,
    running: false,
    animId: null,
    spawnTimer: null,
    roadOffset: 0,
    difficulty: 1,
    keys: {},
    brotherImg: null,

    init(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.W = canvas.width;
        this.H = canvas.height;
        this.brotherImg = new Image();
        this.brotherImg.src = 'assets/afnan-driving.png';
        this.bindControls();
    },

    bindControls() {
        document.addEventListener('keydown', e => {
            this.keys[e.key] = true;
            if (['ArrowLeft', 'ArrowRight', 'a', 'd'].includes(e.key)) e.preventDefault();
        });
        document.addEventListener('keyup', e => { this.keys[e.key] = false; });

        this.holdButton('leftBtn', 'ArrowLeft');
        this.holdButton('rightBtn', 'ArrowRight');
    },

    holdButton(id, key) {
        const btn = document.getElementById(id);
        if (!btn) return;
        btn.addEventListener('mousedown', () => this.keys[key] = true);
        btn.addEventListener('mouseup', () => this.keys[key] = false);
        btn.addEventListener('mouseleave', () => this.keys[key] = false);
        btn.addEventListener('touchstart', e => { e.preventDefault(); this.keys[key] = true; });
        btn.addEventListener('touchend', e => { e.preventDefault(); this.keys[key] = false; });
    },

    resetOverlay() {
        const overlay = document.getElementById('overlay');
        overlay.innerHTML = `
            <h2>Afnan's Car</h2>
            <p>Dodge the Minecraft cars as long as you can!</p>
            <button class="overlay-btn" id="startBtn">Start Game</button>
        `;
        document.getElementById('startBtn').addEventListener('click', () => this.start());
    },

    start() {
        this.bus = { x: this.W / 2 - 20, y: this.H - 110, w: 40, h: 70, speed: 7 };
        this.enemies = [];
        this.score = 0;
        this.running = true;
        this.roadOffset = 0;
        this.difficulty = 1;
        document.getElementById('overlay').style.display = 'none';
        if (this.animId) cancelAnimationFrame(this.animId);
        clearTimeout(this.spawnTimer);
        stopMusic();
        playStartSound();
        setTimeout(startMusic, 600);
        this.scheduleSpawn();
        this.loop();
    },

    stop() {
        this.running = false;
        clearTimeout(this.spawnTimer);
        stopMusic();
        if (this.animId) cancelAnimationFrame(this.animId);
    },

    scheduleSpawn() {
        const interval = Math.max(600, 1500 - this.score * 8);
        this.spawnTimer = setTimeout(() => {
            if (this.running) {
                this.spawnEnemy();
                this.scheduleSpawn();
            }
        }, interval);
    },

    spawnEnemy() {
        let margin = 20;
        let x = margin + Math.random() * (this.W - 40 - margin * 2);
        let speed = 3 + this.difficulty * 0.5 + Math.random() * 1.5;
        let face = MINECRAFT_FACES[Math.floor(Math.random() * MINECRAFT_FACES.length)];
        this.enemies.push({ x, y: -80, w: 40, h: 70, speed, faceType: face });
    },

    drawRoad() {
        const ctx = this.ctx;
        ctx.fillStyle = '#4a4a4a';
        ctx.fillRect(0, 0, this.W, this.H);

        ctx.strokeStyle = '#666';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, this.H); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(this.W, 0); ctx.lineTo(this.W, this.H); ctx.stroke();

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.setLineDash([40, 30]);
        ctx.lineDashOffset = -this.roadOffset;
        ctx.beginPath(); ctx.moveTo(this.W / 3, 0); ctx.lineTo(this.W / 3, this.H); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(this.W * 2 / 3, 0); ctx.lineTo(this.W * 2 / 3, this.H); ctx.stroke();
        ctx.setLineDash([]);
    },

    drawLamborghini(x, y, w, h) {
        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.roundRect(x + 3, y + 3, w, h, 8);
        ctx.fill();

        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.moveTo(x + 2, y + 4);
        ctx.lineTo(x + w - 2, y + 4);
        ctx.lineTo(x + w - 9, y + h - 6);
        ctx.quadraticCurveTo(x + w / 2, y + h + 2, x + 9, y + h - 6);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#c8a500';
        ctx.beginPath();
        ctx.moveTo(x + 6, y + 14);
        ctx.lineTo(x + w - 6, y + 14);
        ctx.lineTo(x + w - 10, y + h - 14);
        ctx.quadraticCurveTo(x + w / 2, y + h - 8, x + 10, y + h - 14);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#222';
        for (let i = 0; i < 5; i++) {
            ctx.fillRect(x + 6 + i * 7, y + 6, 3, 6);
        }

        ctx.fillStyle = '#a0d8f0';
        ctx.beginPath();
        ctx.moveTo(x + w / 2 - 8, y + h - 26);
        ctx.quadraticCurveTo(x + w / 2, y + h - 22, x + w / 2 + 8, y + h - 26);
        ctx.lineTo(x + w - 13, y + h - 6);
        ctx.lineTo(x + 13, y + h - 6);
        ctx.closePath();
        ctx.fill();

        if (this.brotherImg.complete && this.brotherImg.naturalWidth > 0) {
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(x - 4, y - 14, w + 8, h + 18, 10);
            ctx.clip();
            ctx.drawImage(this.brotherImg, x - 8, y - 22, w + 16, h + 30);
            ctx.restore();
        }

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(x + 10, y + h - 5);
        ctx.lineTo(x + 16, y + h - 1);
        ctx.lineTo(x + 10, y + h - 1);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x + w - 10, y + h - 5);
        ctx.lineTo(x + w - 16, y + h - 1);
        ctx.lineTo(x + w - 10, y + h - 1);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#e03030';
        ctx.fillRect(x + 4, y + 6, 6, 3);
        ctx.fillRect(x + w - 10, y + 6, 6, 3);

        ctx.fillStyle = '#222';
        ctx.fillRect(x + 1, y + 14, 4, 12);
        ctx.fillRect(x + w - 5, y + 14, 4, 12);
        ctx.fillRect(x + 1, y + h - 32, 4, 12);
        ctx.fillRect(x + w - 5, y + h - 32, 4, 12);
    },

    drawMinecraftFace(cx, cy, size, type) {
        const ctx = this.ctx;
        const p = size / 8;
        function px(i, j, c) { ctx.fillStyle = c; ctx.fillRect(cx + i * p, cy + j * p, p, p); }

        if (type === 'creeper') {
            ctx.fillStyle = '#4a9c3a'; ctx.fillRect(cx, cy, size, size);
            const d = '#1a1a1a';
            px(2,1,d); px(3,1,d); px(4,1,d); px(5,1,d);
            px(2,2,d); px(5,2,d); px(2,3,d); px(3,3,d); px(4,3,d); px(5,3,d);
            px(1,5,d); px(2,5,d); px(3,5,d); px(4,5,d); px(5,5,d); px(6,5,d);
            px(1,6,d); px(6,6,d);
        } else if (type === 'steve') {
            ctx.fillStyle = '#c8956a'; ctx.fillRect(cx, cy, size, size);
            const hair = '#5a3a1a';
            px(0,0,hair); px(1,0,hair); px(2,0,hair); px(3,0,hair); px(4,0,hair); px(5,0,hair); px(6,0,hair); px(7,0,hair);
            px(0,1,hair); px(7,1,hair); px(0,2,hair); px(7,2,hair);
            px(0,3,hair); px(2,3,hair); px(5,3,hair); px(7,3,hair);
            px(2,4,'#5a7a9c'); px(3,4,'#fff'); px(4,4,'#fff'); px(5,4,'#5a7a9c');
            px(2,5,'#c8956a'); px(3,5,'#c8956a'); px(4,5,'#c8956a'); px(5,5,'#c8956a');
            px(2,6,'#222'); px(3,6,'#222'); px(4,6,'#222'); px(5,6,'#222');
        } else if (type === 'zombie') {
            ctx.fillStyle = '#3a7a3a'; ctx.fillRect(cx, cy, size, size);
            const d = '#1a4a1a';
            px(2,1,d); px(3,1,d); px(4,1,d); px(5,1,d);
            px(1,2,d); px(2,2,'#e03030'); px(3,2,d); px(4,2,d); px(5,2,'#e03030'); px(6,2,d);
            px(1,3,d); px(6,3,d);
            px(2,5,d); px(3,5,d); px(4,5,d); px(5,5,d);
            px(1,6,d); px(2,6,d); px(5,6,d); px(6,6,d);
        } else {
            ctx.fillStyle = '#1a1a2a'; ctx.fillRect(cx, cy, size, size);
            px(1,1,'#9a40d0'); px(2,1,'#9a40d0'); px(5,1,'#9a40d0'); px(6,1,'#9a40d0');
            px(1,2,'#9a40d0'); px(6,2,'#9a40d0');
            px(2,3,'#ff40ff'); px(3,3,'#222'); px(4,3,'#222'); px(5,3,'#ff40ff');
            px(2,4,'#ff40ff'); px(3,4,'#222'); px(4,4,'#222'); px(5,4,'#ff40ff');
            px(1,5,'#9a40d0'); px(2,5,'#9a40d0'); px(5,5,'#9a40d0'); px(6,5,'#9a40d0');
            px(1,6,'#9a40d0'); px(6,6,'#9a40d0');
        }
    },

    drawMinecraftEnemy(x, y, w, h, faceType) {
        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.roundRect(x + 2, y + 2, w, h, 6);
        ctx.fill();

        ctx.fillStyle = '#8a4a2a';
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 6);
        ctx.fill();

        ctx.fillStyle = '#6a3a1a';
        ctx.fillRect(x + 2, y + 4, w - 4, 12);

        ctx.fillStyle = '#4a2a1a';
        ctx.fillRect(x + 2, y + h - 16, w - 4, 12);

        ctx.fillStyle = '#a0d8f0';
        ctx.fillRect(x + 5, y + h - 10, 8, 4);
        ctx.fillRect(x + w - 13, y + h - 10, 8, 4);

        ctx.fillStyle = '#222';
        ctx.fillRect(x + 1, y + 18, 4, 14);
        ctx.fillRect(x + w - 5, y + 18, 4, 14);
        ctx.fillRect(x + 1, y + h - 36, 4, 14);
        ctx.fillRect(x + w - 5, y + h - 36, 4, 14);

        const faceSize = w - 10;
        const faceX = x + 5;
        const faceY = y + 20;
        ctx.globalAlpha = 0.9;
        this.drawMinecraftFace(faceX, faceY, faceSize, faceType);
        ctx.globalAlpha = 1;
    },

    drawHUD() {
        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.beginPath(); ctx.roundRect(8, 8, 110, 32, 6); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '500 15px sans-serif';
        ctx.fillText('Score: ' + this.score, 18, 29);

        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.beginPath(); ctx.roundRect(this.W - 100, 8, 92, 38, 6); ctx.fill();
        ctx.fillStyle = '#ffd700';
        ctx.font = '500 13px sans-serif';
        ctx.fillText('Level ' + Math.floor(this.difficulty), this.W - 86, 22);
        ctx.fillStyle = '#aaa';
        ctx.font = '500 11px sans-serif';
        ctx.fillText('Best: ' + this.getHighScore(), this.W - 86, 36);
    },

    getHighScore() {
        return parseInt(localStorage.getItem('afnanHighScore')) || 0;
    },

    setHighScore(val) {
        localStorage.setItem('afnanHighScore', val);
    },

    showGameOver() {
        this.running = false;
        clearTimeout(this.spawnTimer);
        stopMusic();
        playGameOverSound();

        let high = this.getHighScore();
        if (this.score > high) { high = this.score; this.setHighScore(high); }

        const overlay = document.getElementById('overlay');
        overlay.innerHTML = `
            <h2>Game Over</h2>
            <p>You scored <strong style="color:#f5c400">${this.score}</strong> points!</p>
            <p style="color:#aaa;font-size:13px;margin:0 0 16px">Best: ${high}</p>
            <button class="overlay-btn" id="restartBtn">Play Again</button>
            <button class="overlay-btn" id="menuBtn" style="margin-left:8px">Back to Menu</button>
        `;
        overlay.style.display = 'flex';
        document.getElementById('restartBtn').addEventListener('click', () => this.start());
        document.getElementById('menuBtn').addEventListener('click', goBackToMenu);
    },

    loop() {
        if (!this.running) return;

        this.roadOffset = (this.roadOffset + 4) % 70;
        this.difficulty = 1 + this.score / 30;

        if (this.keys['ArrowLeft'] || this.keys['a']) this.bus.x = Math.max(0, this.bus.x - this.bus.speed);
        if (this.keys['ArrowRight'] || this.keys['d']) this.bus.x = Math.min(this.W - this.bus.w, this.bus.x + this.bus.speed);

        this.drawRoad();
        this.drawLamborghini(this.bus.x, this.bus.y, this.bus.w, this.bus.h);

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            let e = this.enemies[i];
            e.y += e.speed;
            this.drawMinecraftEnemy(e.x, e.y, e.w, e.h, e.faceType);

            if (e.y > this.H) {
                this.enemies.splice(i, 1);
                this.score++;
                playScoreSound();
                continue;
            }

            if (
                this.bus.x < e.x + e.w - 4 &&
                this.bus.x + this.bus.w - 4 > e.x + 4 &&
                this.bus.y < e.y + e.h - 4 &&
                this.bus.y + this.bus.h - 4 > e.y + 4
            ) {
                this.showGameOver();
                return;
            }
        }

        this.drawHUD();
        this.animId = requestAnimationFrame(() => this.loop());
    }
};
