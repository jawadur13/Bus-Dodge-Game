const FlagQuizGame = {
    mode: null,
    allCountries: [],
    availableCountries: [],
    usedCodes: new Set(),
    currentCountry: null,
    options: [],
    score: 0,
    lives: 3,
    maxLives: 3,
    timer: 60,
    timerInterval: null,
    running: false,
    awaitingNext: false,

    init() {
        this.allCountries = COUNTRIES.slice();
    },

    start(mode) {
        this.mode = mode;
        this.usedCodes = new Set();
        this.score = 0;
        this.lives = 3;
        this.timer = 60;
        this.running = true;
        this.awaitingNext = false;

        document.getElementById('modeScreen').style.display = 'none';
        document.getElementById('quizArea').style.display = 'flex';
        document.getElementById('quizOverlay').style.display = 'none';

        if (mode === 'timeattack') {
            document.getElementById('timerDisplay').style.display = 'inline';
            document.getElementById('livesDisplay').style.display = 'none';
            this.startTimer();
        } else if (mode === 'survival') {
            document.getElementById('livesDisplay').style.display = 'inline';
            document.getElementById('timerDisplay').style.display = 'none';
        } else {
            document.getElementById('timerDisplay').style.display = 'none';
            document.getElementById('livesDisplay').style.display = 'none';
        }

        this.updateHUD();
        this.loadQuestion();
    },

    loadQuestion() {
        this.availableCountries = this.allCountries.filter(c => !this.usedCodes.has(c.code));
        if (this.availableCountries.length === 0) {
            this.usedCodes.clear();
            this.availableCountries = this.allCountries.slice();
        }

        const idx = Math.floor(Math.random() * this.availableCountries.length);
        this.currentCountry = this.availableCountries[idx];
        this.usedCodes.add(this.currentCountry.code);

        const wrongPool = this.allCountries.filter(c => c.code !== this.currentCountry.code);
        const shuffPool = wrongPool.slice().sort(() => Math.random() - 0.5);
        const wrongOptions = shuffPool.slice(0, 3);

        this.options = [this.currentCountry, ...wrongOptions];
        this.shuffle(this.options);

        this.displayMap();
        this.displayFlags();
        this.updateHUD();
    },

    shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    },

    async displayMap() {
        const container = document.getElementById('mapContainer');
        container.innerHTML = '<div class="map-loading">Loading map...</div>';
        const code = this.currentCountry.code.toLowerCase();
        try {
            const resp = await fetch(`maps/${code}.svg`);
            if (!resp.ok) throw new Error('Not found');
            let svgText = await resp.text();
            svgText = svgText.replace(/<\?xml[^>]*\?>/i, '');
            svgText = svgText.replace(/<!DOCTYPE[^>]*>/i, '');
            container.innerHTML = svgText;
            const svg = container.querySelector('svg');
            if (svg) {
                svg.removeAttribute('width');
                svg.removeAttribute('height');
                svg.style.display = 'block';
                svg.style.maxWidth = '100%';
                svg.style.maxHeight = '100%';
                svg.style.width = '100%';
                svg.style.height = '100%';
                svg.setAttribute('viewBox', svg.getAttribute('viewBox') || '0 0 100 100');
                const elements = svg.querySelectorAll('path, polygon, rect, circle, ellipse, line, polyline, g');
                elements.forEach(el => {
                    el.style.fill = '#000';
                    el.style.stroke = 'none';
                });
            }
        } catch (e) {
            container.innerHTML = '<div class="map-na">Map not available</div>';
        }
    },

    displayFlags() {
        const grid = document.getElementById('flagGrid');
        grid.innerHTML = '';
        this.options.forEach(country => {
            const btn = document.createElement('button');
            btn.className = 'flag-btn';
            btn.innerHTML = `
                <img src="${country.flag}" alt="${country.name}" class="flag-img" loading="lazy">
                <span class="flag-name">${country.name}</span>
            `;
            btn.addEventListener('click', () => this.handleAnswer(country.code));
            grid.appendChild(btn);
        });
    },

    handleAnswer(code) {
        if (this.awaitingNext || !this.running) return;
        this.awaitingNext = true;

        const correct = code === this.currentCountry.code;
        const buttons = document.querySelectorAll('.flag-btn');

        buttons.forEach(btn => {
            btn.disabled = true;
            const name = btn.querySelector('.flag-name').textContent;
            if (name === this.currentCountry.name) {
                btn.classList.add('correct');
            } else if (!correct && name === this.allCountries.find(c => c.code === code)?.name) {
                btn.classList.add('wrong');
            }
        });

        if (correct) {
            this.score++;
            playScoreSound();
        } else {
            playGameOverSound();
            if (this.mode === 'survival') {
                this.lives--;
                this.updateHUD();
                if (this.lives <= 0) {
                    setTimeout(() => this.showGameOver(), 1000);
                    return;
                }
            }
        }

        this.updateHUD();
        if (this.mode === 'timeattack' && this.timer <= 0) return;
        setTimeout(() => this.nextQuestion(), 1500);
    },

    nextQuestion() {
        this.awaitingNext = false;
        if (this.running) this.loadQuestion();
    },

    startTimer() {
        this.timer = 60;
        this.updateTimerBar();
        this.timerInterval = setInterval(() => {
            this.timer--;
            this.updateTimerBar();
            if (this.timer <= 0) {
                clearInterval(this.timerInterval);
                this.showGameOver();
            }
        }, 1000);
    },

    updateTimerBar() {
        const pct = Math.max(0, (this.timer / 60) * 100);
        const bar = document.getElementById('timerBar');
        if (bar) bar.style.width = pct + '%';
        const txt = document.getElementById('timerText');
        if (txt) txt.textContent = this.timer + 's';
    },

    updateHUD() {
        const scoreEl = document.getElementById('quizScore');
        if (scoreEl) scoreEl.textContent = this.score;
        if (this.mode === 'survival') {
            const hearts = document.getElementById('hearts');
            if (hearts) {
                hearts.textContent = '❤️'.repeat(this.lives) + '🖤'.repeat(this.maxLives - this.lives);
            }
        }
    },

    showGameOver() {
        this.running = false;
        this.awaitingNext = false;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        stopMusic();

        const overlay = document.getElementById('quizOverlay');
        overlay.innerHTML = `
            <h2>Game Over</h2>
            <p>Final Score: <strong style="color:#f5c400">${this.score}</strong></p>
            <p style="color:#aaa;font-size:13px;margin:0 0 16px">Mode: ${this.mode.charAt(0).toUpperCase() + this.mode.slice(1)}</p>
            <button class="overlay-btn" id="quizRestartBtn">Play Again</button>
            <button class="overlay-btn" id="quizMenuBtn" style="margin-left:8px">Back to Menu</button>
        `;
        overlay.style.display = 'flex';
        document.getElementById('quizRestartBtn').addEventListener('click', () => this.start(this.mode));
        document.getElementById('quizMenuBtn').addEventListener('click', goBackToMenu);
    },

    stop() {
        this.running = false;
        this.awaitingNext = false;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        document.getElementById('quizOverlay').style.display = 'none';
    }
};
