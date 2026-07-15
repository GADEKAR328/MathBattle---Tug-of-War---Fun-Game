(function(){
  const ROPE_RANGE = 150;
  const STEP = 20;

  let ropePos = 0;
  let score1 = 0, score2 = 0;
  let gameOver = false;
  let entry1 = '', entry2 = '';
  let current1 = null, current2 = null;
  let soundOn = true;
  let teamName1 = 'Team 1', teamName2 = 'Team 2';

  const rig = document.getElementById('rig');
  const scoreEl1 = document.getElementById('score1');
  const scoreEl2 = document.getElementById('score2');
  const panel1 = document.getElementById('panel1');
  const panel2 = document.getElementById('panel2');
  const disp1 = document.getElementById('disp1');
  const disp2 = document.getElementById('disp2');
  const ropePhoto = document.getElementById('ropePhoto');
  const startOverlay = document.getElementById('startOverlay');
  const overlay = document.getElementById('overlay');
  const soundBtn = document.getElementById('soundBtn');
  const loginOverlay = document.getElementById('loginOverlay');
  const loginBtn = document.getElementById('loginBtn');
  const welcomeSub = document.getElementById('welcomeSub');
  const installBtn = document.getElementById('installBtn');
  const changeTeamsBtn = document.getElementById('changeTeamsBtn');

  /* ---------- audio ---------- */
  let actx = null;
  function ctx(){
    if(!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
    if(actx.state === 'suspended') actx.resume();
    return actx;
  }
  function tone(freq, start, dur, type, vol){
    const c = ctx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol || 0.18, c.currentTime + start);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + start + dur);
    osc.connect(gain); gain.connect(c.destination);
    osc.start(c.currentTime + start);
    osc.stop(c.currentTime + start + dur + 0.02);
  }
  function playCorrect(){
    if(!soundOn) return;
    tone(120, 0, 0.12, 'sine', 0.25);
    tone(523, 0.02, 0.1, 'triangle', 0.16);
    tone(659, 0.1, 0.14, 'triangle', 0.16);
  }
  function playWrong(){
    if(!soundOn) return;
    tone(160, 0, 0.22, 'sawtooth', 0.14);
  }
  function playWin(){
    if(!soundOn) return;
    [523,659,784,1046].forEach((f,i) => tone(f, i*0.14, 0.22, 'triangle', 0.2));
  }
  soundBtn.addEventListener('click', () => {
    soundOn = !soundOn;
    soundBtn.textContent = soundOn ? '🔊 Sound On' : '🔇 Sound Off';
    soundBtn.classList.toggle('muted', !soundOn);
    if(soundOn) ctx();
  });

  function randInt(min, max){ return Math.floor(Math.random() * (max - min + 1)) + min; }

  function makeQuestion(){
    const ops = ['+','-','x'];
    const op = ops[randInt(0,2)];
    let a, b, answer;
    if(op === '+'){ a = randInt(2,12); b = randInt(2,12); answer = a+b; }
    else if(op === '-'){ a = randInt(5,18); b = randInt(1,a); answer = a-b; }
    else { a = randInt(2,9); b = randInt(2,9); answer = a*b; }
    return { text: `${a} ${op} ${b} = ?`, answer };
  }

  function buildKeypad(container, team){
    container.innerHTML = '';
    const layout = ['1','2','3','4','5','6','7','8','9','C','0','✓'];
    layout.forEach(k => {
      const btn = document.createElement('button');
      btn.className = 'key' + (k==='C' ? ' clear' : '') + (k==='✓' ? ' submit' : '');
      btn.textContent = k;
      btn.onclick = () => { ctx(); handleKey(team, k); };
      container.appendChild(btn);
    });
  }

  function handleKey(team, k){
    if(gameOver) return;
    let entry = team === 1 ? entry1 : entry2;
    const panel = team === 1 ? panel1 : panel2;
    if(panel.classList.contains('disabled')) return;

    if(k === 'C'){ entry = ''; }
    else if(k === '✓'){ submitAnswer(team); return; }
    else { if(entry.length < 3) entry += k; }

    if(team === 1){ entry1 = entry; disp1.textContent = entry1 || '\u00A0'; }
    else { entry2 = entry; disp2.textContent = entry2 || '\u00A0'; }
  }

  function submitAnswer(team){
    const entry = team === 1 ? entry1 : entry2;
    const current = team === 1 ? current1 : current2;
    const disp = team === 1 ? disp1 : disp2;
    if(entry === '') return;
    const val = parseInt(entry, 10);
    if(val === current.answer){
      disp.classList.add('right');
      playCorrect();
      if(team === 1){ score1++; scoreEl1.textContent = score1; pull(-STEP); flashPhoto('pulling-left'); }
      else { score2++; scoreEl2.textContent = score2; pull(STEP); flashPhoto('pulling-right'); }
      setTimeout(() => {
        disp.classList.remove('right');
        if(team===1){ entry1=''; disp1.textContent='\u00A0'; } else { entry2=''; disp2.textContent='\u00A0'; }
        if(!gameOver) renderQuestion(team);
      }, 350);
    } else {
      playWrong();
      disp.classList.add('shake');
      setTimeout(() => {
        disp.classList.remove('shake');
        if(team===1){ entry1=''; disp1.textContent='\u00A0'; } else { entry2=''; disp2.textContent='\u00A0'; }
      }, 320);
    }
  }

  function renderQuestion(team){
    const q = makeQuestion();
    if(team === 1){ current1 = q; document.getElementById('q1').textContent = q.text; entry1=''; disp1.textContent='\u00A0'; }
    else { current2 = q; document.getElementById('q2').textContent = q.text; entry2=''; disp2.textContent='\u00A0'; }
  }

  function flashPhoto(cls){
    ropePhoto.classList.remove('pulling-left', 'pulling-right');
    void ropePhoto.getBoundingClientRect();
    ropePhoto.classList.add(cls);
    setTimeout(() => ropePhoto.classList.remove(cls), 400);
  }

  function pull(delta){
    ropePos += delta;
    if(ropePos < -ROPE_RANGE) ropePos = -ROPE_RANGE;
    if(ropePos > ROPE_RANGE) ropePos = ROPE_RANGE;
    rig.style.left = `calc(50% + ${ropePos}px)`;
    if(ropePos <= -ROPE_RANGE){ endGame(1); }
    else if(ropePos >= ROPE_RANGE){ endGame(2); }
  }

  function endGame(winner){
    if(gameOver) return;
    gameOver = true;
    panel1.classList.add('disabled');
    panel2.classList.add('disabled');
    setTimeout(() => showWinner(winner), 500);
  }

  function showWinner(winner){
    playWin();
    document.getElementById('finalBoys').textContent = teamName1 + ': ' + score1;
    document.getElementById('finalGirls').textContent = teamName2 + ': ' + score2;
    const title = document.getElementById('winTitle');
    const sub = document.getElementById('winSub');
    if(winner === 1){
      title.textContent = teamName1 + ' Wins! 🎉';
      sub.textContent = 'The rope crossed the ' + teamName1 + ' goal line!';
      spawnConfetti('#2f6fed');
    } else {
      title.textContent = teamName2 + ' Wins! 🎉';
      sub.textContent = 'The rope crossed the ' + teamName2 + ' goal line!';
      spawnConfetti('#ef4a4a');
    }
    overlay.classList.add('show');
  }

  function spawnConfetti(color){
    const colors = [color, '#ffd166', '#39b869', '#8a6fd8', '#2f6fed', '#ef4a4a'];
    const card = document.getElementById('winCard');
    for(let i = 0; i < 26; i++){
      const p = document.createElement('div');
      p.className = 'confetti-piece';
      p.style.left = Math.random()*100 + '%';
      p.style.background = colors[randInt(0, colors.length-1)];
      p.style.animationDuration = (1.2 + Math.random()*1.2) + 's';
      p.style.animationDelay = (Math.random()*0.5) + 's';
      card.appendChild(p);
    }
  }

  function applyTeamNames(){
    document.getElementById('chipName1').textContent = teamName1;
    document.getElementById('chipName2').textContent = teamName2;
    document.getElementById('head1').textContent = teamName1.toUpperCase();
    document.getElementById('head2').textContent = teamName2.toUpperCase();
    document.getElementById('goalLabel1').textContent = '◀ ' + teamName1.toUpperCase() + ' GOAL';
    document.getElementById('goalLabel2').textContent = teamName2.toUpperCase() + ' GOAL ▶';
  }

  function startGame(){
    ropePos = 0; score1 = 0; score2 = 0; gameOver = false;
    entry1 = ''; entry2 = '';
    rig.style.left = '50%';
    scoreEl1.textContent = '0'; scoreEl2.textContent = '0';
    overlay.classList.remove('show');
    document.querySelectorAll('.confetti-piece').forEach(el => el.remove());
    panel1.classList.remove('disabled'); panel2.classList.remove('disabled');
    buildKeypad(document.getElementById('pad1'), 1);
    buildKeypad(document.getElementById('pad2'), 2);
    renderQuestion(1); renderQuestion(2);
  }

  document.getElementById('startBtn').addEventListener('click', () => {
    ctx();
    const n1 = document.getElementById('teamNameInput1').value.trim();
    const n2 = document.getElementById('teamNameInput2').value.trim();
    teamName1 = n1 || 'Team 1';
    teamName2 = n2 || 'Team 2';
    applyTeamNames();
    startOverlay.classList.remove('show');
    startGame();
  });

  document.getElementById('restartBtn').addEventListener('click', startGame);
  document.getElementById('playAgainBtn').addEventListener('click', startGame);

  changeTeamsBtn.addEventListener('click', () => {
    document.getElementById('teamNameInput1').value = teamName1;
    document.getElementById('teamNameInput2').value = teamName2;
    welcomeSub.textContent = 'Update your team names';
    panel1.classList.add('disabled'); panel2.classList.add('disabled');
    startOverlay.classList.add('show');
  });

  /* ---------- login / splash screen ---------- */
  (function spawnOrbs(){
    const colors = ['#2f6fed', '#ef4a4a', '#ffd166', '#39b869', '#8a6fd8'];
    for(let i = 0; i < 18; i++){
      const o = document.createElement('div');
      o.className = 'orb';
      const size = 8 + Math.random() * 22;
      o.style.width = size + 'px';
      o.style.height = size + 'px';
      o.style.left = Math.random() * 100 + '%';
      o.style.background = `radial-gradient(circle at 30% 30%, ${colors[randInt(0,colors.length-1)]}, rgba(255,255,255,0))`;
      o.style.animationDuration = (6 + Math.random() * 8) + 's';
      o.style.animationDelay = (Math.random() * 8) + 's';
      loginOverlay.appendChild(o);
    }
  })();

  loginBtn.addEventListener('click', () => {
    loginOverlay.classList.add('hide');
    startOverlay.classList.add('show');
  });

  /* ---------- installable desktop/mobile app (PWA) ---------- */
  (function setupInstallable(){
    if('serviceWorker' in navigator){
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  })();

  let deferredInstallPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    installBtn.classList.add('show');
  });
  installBtn.addEventListener('click', async () => {
    if(!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    installBtn.classList.remove('show');
  });
  window.addEventListener('appinstalled', () => {
    installBtn.classList.remove('show');
  });
})();
