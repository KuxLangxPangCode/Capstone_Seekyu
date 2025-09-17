// take-exam.js
// Gamified exam for SeekYu - modularized and mountable
(function(global){
  const DEFAULT_QUESTIONS = [
    {q:'What is the first action when you find an unauthorized person on site?', choices:['Ask for ID and escort out','Call your supervisor immediately','Observe and report with details','Ignore — wait for instructions'], a:2, h:'Think documentation and accountability.'},
    {q:'Best way to secure a small fire before backup arrives?', choices:['Use water if electrical','Use nearest extinguisher','Call fire services only','Open windows to ventilate'], a:1, h:"Use what's provided on site."},
    {q:'When should you write an incident report?', choices:['Only if someone is injured','For all notable incidents','Only when requested by client','Never'], a:1, h:'Keeps the company protected and informed.'},
    {q:'A suspicious package is found. You should:', choices:['Open it to check contents','Isolate area and call authorities','Throw it away','Ignore it'], a:1, h:'Safety first; specialists handle it.'},
    {q:'Patrol frequency should be based on:', choices:['Client preference only','Random schedule + risk assessment','Only at shift start','Never patrol'], a:1, h:'Randomized patrols reduce predictability.'},
    {q:'If a co-worker is asleep on duty you should:', choices:['Wake them and report','Ignore it','Wake, then log and report','Confront aggressively'], a:2, h:'Documented escalation is preferred.'},
    {q:'Best practice for keys and access cards:', choices:['Share with co-workers','Keep them secure and logged','Leave them at the gate','Discard after shift'], a:1, h:'Chain of custody matters.'},
    {q:'A minor altercation occurs; you should first:', choices:['Physically intervene immediately','Record details and attempt de-escalation','Call media','Leave scene'], a:1, h:'Calm, safe de-escalation first.'},
    {q:'If you need to detain a suspect you should:', choices:['Use reasonable force and call police','Hold them indefinitely','Release them immediately','Ask bystanders to handle'], a:0, h:'Follow policy and law.'},
    {q:'What information is essential on an incident report?', choices:['Only your name','Time, location, people involved, actions taken','Just the date','Only the client name'], a:1, h:'Make it actionable.'}
  ];

  const LB_KEY = 'seekyu_exam_leaderboard_v1';

  // small template helper
  function el(tag, attrs = {}, html = '') {
    const e = document.createElement(tag);
    Object.keys(attrs).forEach(k => {
      if(k === 'cls') e.className = attrs[k];
      else if(k === 'text') e.textContent = attrs[k];
      else e.setAttribute(k, attrs[k]);
    });
    if (html) e.innerHTML = html;
    return e;
  }

  // safe escape
  function esc(s){ return String(s).replace(/[&<>\"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c])); }

  // build UI into container
  function buildUI(container){
    container.innerHTML = ''; // clear

    const rootWrap = el('div', {cls:'exam-card bg-white rounded-lg shadow p-6'});
    // Start screen
    const start = el('div', {cls:'gx-start'});
    start.appendChild(el('div', {cls:'flex items-center justify-between'}, '<h2 class="text-xl font-bold">Guarding Skills — Gamified Exam</h2><div class="text-sm text-slate-500">Earn XP, badges & climb the leaderboard</div>'));
    start.appendChild(el('p', {cls:'text-slate-600 mt-2'}, '10 sample questions • lives • streak multiplier • hints & skip'));
    // controls area
    const grid = el('div', {cls:'mt-6 grid grid-cols-1 md:grid-cols-3 gap-4'});
    const left = el('div', {cls:'col-span-2'});
    left.innerHTML = '<div class="bg-slate-50 rounded p-4"><p class="text-sm">Rules:</p><ul class="list-disc pl-5 text-sm text-slate-600 leading-6"><li>Correct = points + time bonus.</li><li>Hints reduce time bonus. Skip costs a life.</li><li>Streak increases multiplier.</li></ul></div>';
    const right = el('div', {cls:'bg-white border rounded p-4'});
    right.innerHTML = '<div class="mb-3"><label class="block text-sm text-slate-600">Select Difficulty</label><select id="gx-difficulty" class="w-full px-3 py-2 rounded border bg-slate-50"><option value="easy">Easy — slower timer</option><option value="normal" selected>Normal</option><option value="hard">Hard — faster timer</option></select></div><div><label class="block text-sm text-slate-600">Display Name (leaderboard)</label><input id="gx-player-name" class="w-full px-3 py-2 rounded border bg-slate-50" placeholder="Your name or call sign" /></div>';

    grid.appendChild(left); grid.appendChild(right);
    start.appendChild(grid);

    const startBtns = el('div', {cls:'mt-6 flex gap-2'});
    startBtns.appendChild(el('button', {cls:'px-4 py-2 rounded bg-indigo-600 text-white', id:'gx-start-btn'}, 'Start Exam'));
    startBtns.appendChild(el('button', {cls:'px-4 py-2 rounded bg-slate-200', id:'gx-practice-btn'}, 'Practice (no leaderboard)'));
    startBtns.appendChild(el('button', {cls:'ml-auto px-3 py-2 rounded bg-slate-100', id:'gx-view-leaderboard'}, 'View Leaderboard'));
    start.appendChild(startBtns);

    // Exam screen
    const exam = el('div', {cls:'hidden gx-exam'});
    exam.innerHTML = `
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-4">
          <div class="text-sm text-slate-600">Score</div>
          <div id="gx-score" class="text-xl font-bold text-indigo-600">0</div>
          <div class="px-2 py-1 rounded bg-slate-100 text-sm text-slate-700">Streak: <span id="gx-streak">0</span></div>
          <div class="px-2 py-1 rounded bg-red-100 text-sm text-red-700">Lives: <span id="gx-lives">3</span></div>
        </div>
        <div>
          <div class="text-sm text-slate-600">Question <span id="gx-qindex">1</span>/<span id="gx-qt">10</span></div>
          <div class="w-48 bg-slate-100 rounded overflow-hidden mt-1"><div id="gx-progress" class="h-2 bg-indigo-500 w-0"></div></div>
        </div>
      </div>
      <div class="bg-slate-50 rounded p-4 mb-4">
        <div class="flex items-center justify-between">
          <div>
            <div id="gx-question" class="text-lg font-semibold text-slate-800"></div>
            <div id="gx-hint" class="text-sm text-slate-500 mt-1"></div>
          </div>
          <div class="text-sm text-slate-600">Time: <span id="gx-timer">20</span>s</div>
        </div>
      </div>
      <div id="gx-choices" class="grid grid-cols-1 md:grid-cols-2 gap-3"></div>
      <div class="mt-4 flex gap-2">
        <button id="gx-hint-btn" class="px-3 py-2 rounded bg-yellow-400 text-black">Use Hint (-points)</button>
        <button id="gx-skip-btn" class="px-3 py-2 rounded bg-slate-200">Skip (-life)</button>
        <div class="ml-auto"><button id="gx-quit" class="px-3 py-2 rounded bg-red-500 text-white">Quit</button></div>
      </div>
    `;

    // Results
    const res = el('div', {cls:'hidden gx-results text-center'});
    res.innerHTML = `
      <h3 class="text-2xl font-bold">Exam Complete</h3>
      <p class="text-slate-600 mt-2">Your score</p>
      <div id="gx-final-score" class="text-4xl font-extrabold text-indigo-600 mt-4">0</div>
      <div class="mt-3">Badge: <span id="gx-badge" class="font-semibold text-slate-800">-</span></div>
      <div class="mt-4 flex items-center justify-center gap-2">
        <button id="gx-save" class="px-4 py-2 rounded bg-emerald-600 text-white">Save to Leaderboard</button>
        <button id="gx-retry" class="px-4 py-2 rounded bg-slate-200">Retry</button>
        <button id="gx-back" class="px-4 py-2 rounded bg-slate-100">Back</button>
      </div>
    `;

    // Leaderboard modal
    const leaderModal = el('div', {cls:'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 hidden', id:'gx-leaderboard'});
    leaderModal.innerHTML = `<div class="bg-white rounded-lg p-4 w-full max-w-2xl"><div class="flex items-center justify-between mb-3"><h4 class="font-semibold">Leaderboard</h4><button id="gx-leader-close" class="text-slate-500">✕</button></div><div id="gx-leader-list" class="space-y-2 text-sm max-h-96 overflow-auto"></div><div class="mt-3 flex justify-end"><button id="gx-clear-lb" class="px-3 py-2 rounded bg-red-600 text-white text-sm">Clear</button></div></div>`;

    // confetti container
    const confetti = el('div', {cls:'confetti hidden', id:'gx-confetti'});
    confetti.style.position = 'relative'; confetti.style.height = '0';

    rootWrap.appendChild(start);
    rootWrap.appendChild(exam);
    rootWrap.appendChild(res);
    rootWrap.appendChild(leaderModal);
    rootWrap.appendChild(confetti);

    container.appendChild(rootWrap);

    return { start, exam, res, leaderModal, confetti };
  }

  // core logic
  function createExamController(containerEl, options = {}) {
    const ui = buildUI(containerEl);
    const get = id => containerEl.querySelector('#' + id);

    // DOM refs
    const btnStart = containerEl.querySelector('#gx-start-btn');
    const btnPractice = containerEl.querySelector('#gx-practice-btn');
    const viewLbBtn = containerEl.querySelector('#gx-view-leaderboard');

    const nameInput = containerEl.querySelector('#gx-player-name');
    const diffSel = containerEl.querySelector('#gx-difficulty');

    const scoreEl = containerEl.querySelector('#gx-score');
    const streakEl = containerEl.querySelector('#gx-streak');
    const livesEl = containerEl.querySelector('#gx-lives');
    const qIndexEl = containerEl.querySelector('#gx-qindex');
    const qTotalEl = containerEl.querySelector('#gx-qt');
    const questionEl = containerEl.querySelector('#gx-question');
    const hintEl = containerEl.querySelector('#gx-hint');
    const timerEl = containerEl.querySelector('#gx-timer');
    const choicesEl = containerEl.querySelector('#gx-choices');
    const progressEl = containerEl.querySelector('#gx-progress');

    const hintBtn = containerEl.querySelector('#gx-hint-btn');
    const skipBtn = containerEl.querySelector('#gx-skip-btn');
    const quitBtn = containerEl.querySelector('#gx-quit');

    const finalScoreEl = containerEl.querySelector('#gx-final-score');
    const badgeEl = containerEl.querySelector('#gx-badge');
    const saveBtn = containerEl.querySelector('#gx-save');
    const retryBtn = containerEl.querySelector('#gx-retry');
    const backBtn = containerEl.querySelector('#gx-back');

    const lbList = containerEl.querySelector('#gx-leader-list');
    const lbClose = containerEl.querySelector('#gx-leader-close');
    const clearLbBtn = containerEl.querySelector('#gx-clear-lb');
    const leaderModal = containerEl.querySelector('#gx-leaderboard');
    const confetti = containerEl.querySelector('#gx-confetti');

    // state
    let questions = [];
    let index = 0;
    let score = 0;
    let streak = 0;
    let lives = 3;
    let timer = null;
    let timeLeft = 20;
    let baseTime = 20;
    let practice = false;

    function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]] } return a; }

    function confettiBurst(){
      confetti.innerHTML = '';
      const colors = ['#ef4444','#f97316','#f59e0b','#10b981','#3b82f6','#8b5cf6'];
      for(let i=0;i<40;i++){
        const elDiv = document.createElement('div');
        elDiv.style.width = (6+Math.random()*10)+'px';
        elDiv.style.height = (8+Math.random()*12)+'px';
        elDiv.style.background = colors[Math.floor(Math.random()*colors.length)];
        elDiv.style.position = 'absolute';
        elDiv.style.left = Math.random()*100 + '%';
        elDiv.style.top = Math.random()*20 + '%';
        elDiv.style.opacity = 0.95;
        confetti.appendChild(elDiv);
        elDiv.animate([{transform:'translateY(0) rotate(0)', opacity:1},{transform:'translateY(600px) rotate(720deg)', opacity:0}], {duration:900+Math.random()*1000, easing:'cubic-bezier(.2,.8,.2,1)'});
      }
      confetti.classList.remove('hidden');
      setTimeout(()=>confetti.classList.add('hidden'),1400);
    }

    function getDiff(){ const v = diffSel.value; if(v==='easy') return {time:30, lives:4}; if(v==='hard') return {time:12, lives:2}; return {time:20, lives:3}; }

    function startExam(isPractice){
      practice = !!isPractice;
      const cfg = getDiff();
      baseTime = cfg.time; lives = cfg.lives;
      score = 0; streak = 0; index = 0;
      questions = shuffle((options.questions || DEFAULT_QUESTIONS).slice()).slice(0,10);
      qTotalEl.textContent = questions.length;
      scoreEl.textContent = score; streakEl.textContent = streak; livesEl.textContent = lives;
      // toggle screens
      containerEl.querySelector('.gx-start').classList.add('hidden');
      containerEl.querySelector('.gx-results').classList.add('hidden');
      containerEl.querySelector('.gx-exam').classList.remove('hidden');
      showQ();
    }

    function showQ(){
      clearInterval(timer);
      const q = questions[index];
      qIndexEl.textContent = index+1;
      questionEl.textContent = q.q;
      hintEl.textContent = '';
      timeLeft = baseTime; timerEl.textContent = timeLeft;
      choicesEl.innerHTML = '';
      q.choices.forEach((c,i)=>{
        const b = document.createElement('button');
        b.className = 'choice-btn text-left px-4 py-3 rounded border bg-white hover:bg-slate-50';
        b.textContent = c;
        b.onclick = ()=> select(i);
        choicesEl.appendChild(b);
      });
      progressEl.style.width = ((index)/questions.length)*100 + '%';
      timer = setInterval(()=>{
        timeLeft--; timerEl.textContent = timeLeft;
        if(timeLeft<=0){ clearInterval(timer); wrong('Time up'); }
      },1000);
    }

    function select(ch){
      clearInterval(timer);
      const q = questions[index];
      if(ch === q.a){
        const base = 100;
        const timeBonus = Math.round(timeLeft*2);
        const multiplier = 1 + Math.min(1, streak*0.25);
        const pts = Math.round((base + timeBonus)*multiplier);
        score += pts;
        streak++;
        confettiBurst();
      } else {
        wrong('Wrong');
      }
      next();
    }

    function wrong(){
      streak = 0;
      lives = Math.max(0, lives-1);
      score = Math.max(0, score - 25);
      livesEl.textContent = lives;
      scoreEl.textContent = score;
      if(lives<=0) finish();
    }

    function next(){
      index++;
      if(index >= questions.length) { finish(); return; }
      showQ();
    }

    function useHint(){
      const q = questions[index];
      hintEl.textContent = 'HINT: ' + q.h;
      timeLeft = Math.max(3, Math.floor(timeLeft/2));
      timerEl.textContent = timeLeft;
    }

    function skip(){
      clearInterval(timer);
      lives = Math.max(0, lives-1);
      streak = 0;
      if(lives<=0){ finish(); return; }
      index++;
      if(index >= questions.length){ finish(); return; }
      showQ();
    }

    function finish(){
      clearInterval(timer);
      containerEl.querySelector('.gx-exam').classList.add('hidden');
      containerEl.querySelector('.gx-results').classList.remove('hidden');
      finalScoreEl.textContent = score;
      const badge = score >= 800 ? 'Expert Guard' : score >= 600 ? 'Advanced Guard' : score >= 400 ? 'Intermediate Guard' : 'Rookie Guard';
      badgeEl.textContent = badge;
      if(score >= 400) confettiBurst();
      sessionStorage.setItem('gx_last', JSON.stringify({name: nameInput.value || (options.playerName || 'Anonymous'), score, badge}));
    }

    // leaderboard management
    function loadLB(){ try { return JSON.parse(localStorage.getItem(LB_KEY) || '[]'); } catch(e){ return []; } }
    function saveLB(){
      const last = JSON.parse(sessionStorage.getItem('gx_last') || '{}');
      if(typeof last.score === 'undefined') return alert('No result to save.');
      const entry = { name: (nameInput.value || last.name || 'Anonymous').slice(0,30), score: last.score, badge: last.badge, date: new Date().toISOString() };
      const lb = loadLB(); lb.push(entry); lb.sort((a,b)=>b.score-a.score);
      localStorage.setItem(LB_KEY, JSON.stringify(lb.slice(0,50)));
      renderLB();
      alert('Saved to leaderboard');
    }
    function renderLB(){
      const lb = loadLB();
      if(lb.length===0){ lbList.innerHTML = '<div class="text-slate-500">No scores yet</div>'; return; }
      lbList.innerHTML = lb.map((e,i)=>`<div class="flex justify-between items-center p-2 rounded border"><div><div class="font-medium">${i+1}. ${esc(e.name)}</div><div class="text-xs text-slate-500">${esc(e.badge)} · ${new Date(e.date).toLocaleString()}</div></div><div class="text-lg font-semibold text-indigo-600">${e.score}</div></div>`).join('');
    }
    function clearLB(){ if(!confirm('Clear leaderboard?')) return; localStorage.removeItem(LB_KEY); renderLB(); }

    // bindings
    btnStart.addEventListener('click', ()=> startExam(false));
    btnPractice.addEventListener('click', ()=> startExam(true));
    hintBtn.addEventListener('click', useHint);
    skipBtn.addEventListener('click', skip);
    quitBtn.addEventListener('click', ()=> { if(confirm('Quit exam? progress lost.')) location.reload(); });

    saveBtn.addEventListener('click', saveLB);
    retryBtn.addEventListener('click', ()=> { containerEl.querySelector('.gx-results').classList.add('hidden'); containerEl.querySelector('.gx-start').classList.remove('hidden'); });
    backBtn.addEventListener('click', ()=> { location.reload(); });

    viewLbBtn.addEventListener('click', ()=> { renderLB(); leaderModal.classList.remove('hidden'); });
    lbClose.addEventListener('click', ()=> leaderModal.classList.add('hidden'));
    clearLbBtn.addEventListener('click', clearLB);

    renderLB();

    return {
      startExam: ()=> startExam(false),
      practice: ()=> startExam(true),
      renderLeaderboard: renderLB
    };
  }

  // Public API
  const SeekYuExam = {
    /**
     * init options:
     *  - containerId (string) - id of element to mount into (default: 'gx-exam-root')
     *  - questions (array) - optional custom questions (same shape as DEFAULT_QUESTIONS)
     *  - playerName (string) - default player name
     *  - autoShowOnNav (bool) - if true, installs showSection fallback for host pages
     */
    init(options = {}) {
      const containerId = options.containerId || 'gx-exam-root';
      const container = document.getElementById(containerId);
      if(!container) {
        console.error('SeekYuExam: container #' + containerId + ' not found.');
        return null;
      }
      // attach controller
      const controller = createExamController(container, options);
      // fallback compatibility for showSection: keep exam container visible when requested
      if(options.autoShowOnNav !== false && typeof window.showSection !== 'function') {
        window.showSection = function(id){
          document.querySelectorAll('.content-section').forEach(s=> s.classList.remove('active'));
          const el = document.getElementById(id);
          if(el) el.classList.add('active');
        };
      }
      return controller;
    }
  };

  global.SeekYuExam = SeekYuExam;

})(window);
