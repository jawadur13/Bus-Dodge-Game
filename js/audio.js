let audioCtx = null;
let musicTimer = null;
let musicPlaying = false;

function getAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
}

function playNote(freq, start, dur, type, vol) {
    const ctx = getAudio();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type || 'square';
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol || 0.12, start);
    g.gain.exponentialRampToValueAtTime(0.001, start + dur);
    o.connect(g);
    g.connect(ctx.destination);
    o.start(start);
    o.stop(start + dur);
}

function playScoreSound() {
    const t = getAudio().currentTime;
    playNote(880, t, 0.08, 'square', 0.15);
    playNote(1100, t + 0.06, 0.12, 'square', 0.15);
}

function playGameOverSound() {
    const t = getAudio().currentTime;
    playNote(400, t, 0.2, 'sawtooth', 0.18);
    playNote(300, t + 0.18, 0.2, 'sawtooth', 0.18);
    playNote(200, t + 0.36, 0.4, 'sawtooth', 0.15);
}

function playStartSound() {
    const t = getAudio().currentTime;
    playNote(523, t, 0.1, 'square', 0.12);
    playNote(659, t + 0.08, 0.1, 'square', 0.12);
    playNote(784, t + 0.16, 0.1, 'square', 0.12);
    playNote(1047, t + 0.26, 0.25, 'square', 0.12);
}

function startMusic() {
    if (musicPlaying) return;
    musicPlaying = true;
    const ctx = getAudio();
    const bpm = 130;
    const beat = 60 / bpm;

    const melody = [
        [523, beat], [587, beat], [659, beat * 1.5], [523, beat / 2],
        [659, beat], [784, beat], [659, beat], [587, beat],
        [523, beat], [659, beat], [523, beat], [440, beat],
        [392, beat * 1.5], [440, beat / 2], [523, beat * 2],
        [659, beat], [784, beat], [880, beat * 1.5], [784, beat / 2],
        [659, beat], [784, beat], [659, beat], [587, beat],
        [523, beat], [587, beat], [659, beat], [523, beat],
        [440, beat * 1.5], [392, beat / 2], [523, beat * 2],
    ];
    const bassPattern = [131, 165, 196, 131, 165, 196, 220, 175];
    const bassBeat = beat * 2;

    function schedule() {
        if (!musicPlaying) return;
        const now = ctx.currentTime;
        let t = now + 0.05;
        for (const [f, d] of melody) {
            playNote(f, t, d * 0.7, 'square', 0.06);
            playNote(f / 4, t, d * 0.9, 'triangle', 0.05);
            t += d;
        }
        for (let i = 0; i < bassPattern.length; i++) {
            playNote(bassPattern[i], now + i * bassBeat, bassBeat * 0.8, 'triangle', 0.07);
        }
        const dur = t - now;
        musicTimer = setTimeout(schedule, dur * 1000 - 100);
    }
    schedule();
}

function stopMusic() {
    musicPlaying = false;
    if (musicTimer) { clearTimeout(musicTimer); musicTimer = null; }
}
