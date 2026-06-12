const GAMES = [
    { id: 'dodge', name: 'Dodge Game', desc: 'Dodge the Minecraft cars!', icon: '🚗', unlocked: true },
    { id: 'flagquiz', name: 'World Flag Match', desc: 'Match flags to country outlines!', icon: '🌍', unlocked: true },
    { id: 'p1', name: 'Coming Soon', desc: 'New game on the way!', icon: '🔒', unlocked: false },
    { id: 'p2', name: 'Coming Soon', desc: 'New game on the way!', icon: '🔒', unlocked: false },
];

function showScreen(name) {
    document.getElementById('passwordScreen').style.display = 'none';
    document.getElementById('hubScreen').style.display = 'none';
    document.getElementById('gameArea').style.display = 'none';
    document.getElementById('modeScreen').style.display = 'none';
    document.getElementById('quizArea').style.display = 'none';

    if (name === 'password') {
        document.getElementById('passwordScreen').style.display = 'flex';
    } else if (name === 'hub') {
        document.getElementById('hubScreen').style.display = 'flex';
    } else if (name === 'game') {
        document.getElementById('gameArea').style.display = 'flex';
    } else if (name === 'mode') {
        document.getElementById('modeScreen').style.display = 'flex';
    } else if (name === 'quiz') {
        document.getElementById('quizArea').style.display = 'flex';
    }
}

function goBackToMenu() {
    DodgeGame.stop();
    FlagQuizGame.stop();
    showScreen('hub');
}

function renderHub() {
    const grid = document.getElementById('hubGrid');
    grid.innerHTML = '';
    GAMES.forEach(g => {
        const card = document.createElement('div');
        card.className = 'hub-card' + (g.unlocked ? '' : ' locked');
        card.innerHTML = `
            <div class="hub-icon">${g.icon}</div>
            <div class="hub-name">${g.name}</div>
            <div class="hub-desc">${g.desc}</div>
            ${g.unlocked ? '<button class="hub-play-btn">Play</button>' : '<div class="hub-locked-label">🔒</div>'}
        `;
        if (g.unlocked) {
            card.querySelector('.hub-play-btn').addEventListener('click', () => startGame(g.id));
        }
        grid.appendChild(card);
    });
}

function startGame(id) {
    if (id === 'dodge') {
        showScreen('game');
        DodgeGame.init(document.getElementById('gc'));
        DodgeGame.resetOverlay();
        document.getElementById('overlay').style.display = 'flex';
    } else if (id === 'flagquiz') {
        showScreen('mode');
    }
}

function checkPassword() {
    const input = document.getElementById('passwordInput');
    const error = document.getElementById('passwordError');
    if (input.value.toLowerCase() === 'afnan') {
        input.value = '';
        error.textContent = '';
        renderHub();
        showScreen('hub');
    } else {
        error.textContent = 'Incorrect password';
        input.value = '';
        input.focus();
    }
}

document.querySelectorAll('.mode-card').forEach(card => {
    card.addEventListener('click', () => {
        const mode = card.dataset.mode;
        FlagQuizGame.init();
        FlagQuizGame.start(mode);
    });
});

document.getElementById('modeBackBtn').addEventListener('click', goBackToMenu);
document.getElementById('quizBackBtn').addEventListener('click', goBackToMenu);

document.getElementById('passwordBtn').addEventListener('click', checkPassword);
document.getElementById('passwordInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') checkPassword();
});

document.getElementById('backBtn').addEventListener('click', goBackToMenu);

showScreen('password');
