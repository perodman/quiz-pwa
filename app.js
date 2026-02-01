let data;
let currentSubject, currentCategory, currentRegent;
let currentQuestion, currentYearEntry, currentRepeatItem, currentChallengeItem;
let repeatItems = JSON.parse(localStorage.getItem("repeatItems") || "[]");
let challengeStreak = 0;
let isSoundEnabled = true;
let viewHistory = ["subject-view"];

/* LJUDMOTOR */
function playSuccessSound() {
    if (!isSoundEnabled) return;
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); 
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1); 
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.3);
    } catch(e) { console.log("Ljud kunde inte spelas."); }
}

/* INIT */
fetch("questions.json").then(r => r.json()).then(json => {
    data = json;
    renderSubjects();
    updateTrackers();
    showView("subject-view");
});

/* VY-HANTERING */
function showView(id) {
    document.querySelectorAll(".view").forEach(v => v.classList.add("hidden"));
    document.getElementById(id).classList.remove("hidden");
    
    const nav = document.getElementById("nav-header");
    if (id === "subject-view") {
        nav.classList.add("hidden");
        viewHistory = ["subject-view"]; 
    } else {
        nav.classList.remove("hidden");
        if (viewHistory[viewHistory.length - 1] !== id) viewHistory.push(id);
    }
    window.scrollTo(0, 0);
    updateTrackers();
}

/* NAVIGERING */
document.getElementById("global-home").onclick = () => showView("subject-view");
document.getElementById("global-back").onclick = () => {
    if (viewHistory.length > 1) {
        viewHistory.pop(); 
        const prev = viewHistory[viewHistory.length - 1];
        document.querySelectorAll(".view").forEach(v => v.classList.add("hidden"));
        document.getElementById(prev).classList.remove("hidden");
        if (prev === "subject-view") document.getElementById("nav-header").classList.add("hidden");
    }
};

document.getElementById("sound-toggle").onclick = function() {
    isSoundEnabled = !isSoundEnabled;
    this.textContent = isSoundEnabled ? "🔊" : "🔇";
    this.classList.toggle("sound-off", !isSoundEnabled);
};

/* TRACKERS */
function updateTrackers() {
    const badge = document.getElementById("repeat-badge");
    const count = repeatItems.length;
    if (badge) {
        badge.textContent = count;
        badge.classList.toggle("hidden", count === 0);
    }
    const ct = document.getElementById("repeat-counter-text");
    if(ct) ct.textContent = count > 0 ? `${count} händelser kvar!` : "";
}

/* RENDERING */
function renderSubjects() {
    const container = document.getElementById("subjects");
    container.innerHTML = "";
    data.subjects.forEach(s => {
        const b = document.createElement("button");
        b.textContent = s.name;
        b.onclick = () => { currentSubject = s; renderCategories(); showView("category-view"); };
        container.appendChild(b);
    });
}

function renderCategories() {
    const container = document.getElementById("categories");
    container.innerHTML = "";
    currentSubject.categories.forEach(c => {
        const b = document.createElement("button");
        b.textContent = c.name;
        b.onclick = () => { currentCategory = c; renderRegents(); showView("regent-view"); };
        container.appendChild(b);
    });
}

function renderRegents() {
    const container = document.getElementById("regents");
    container.innerHTML = "";
    currentCategory.regents.forEach(r => {
        const b = document.createElement("button");
        b.textContent = r.name;
        b.onclick = () => { 
            currentRegent = r; 
            document.getElementById("regent-title").textContent = r.name;
            showView("mode-view"); 
        };
        container.appendChild(b);
    });
}

/* QUIZ LOGIK */
function toggleAnswer(displayId, btnId) {
    const el = document.getElementById(displayId);
    const btn = document.getElementById(btnId);
    const isHidden = el.classList.contains("invisible");
    el.classList.replace(isHidden ? "invisible" : "visible", isHidden ? "visible" : "invisible");
    btn.innerHTML = isHidden ? 'Dölj svar &nbsp; ✖' : 'Visa svar 📖';
    btn.classList.toggle("active", isHidden);
}

function resetUI(displayId, btnId) {
    const el = document.getElementById(displayId);
    const btn = document.getElementById(btnId);
    if (el) { el.classList.add("invisible"); el.classList.remove("visible"); }
    if (btn) { btn.innerHTML = "Visa svar 📖"; btn.classList.remove("active"); }
}

function updateRepeatBtnUI(btnId, item) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    const exists = repeatItems.some(r => r.year === item.year && (item.q ? r.q === item.q : true));
    btn.innerHTML = exists ? "Repetera! ✅" : "Repetera? 🔁";
    btn.className = exists ? "full-btn repeat-btn-active" : "full-btn repeat-btn-inactive";
}

/* MODES */
function showQuestion() {
    currentQuestion = currentRegent.questions[Math.floor(Math.random() * currentRegent.questions.length)];
    document.getElementById("question").textContent = currentQuestion.q;
    document.getElementById("answer").textContent = getAnswer(currentQuestion.year);
    resetUI("answer", "toggle-answer");
    updateRepeatBtnUI("mark-repeat", { year: currentQuestion.year, q: currentQuestion.q });
}

function showYear() {
    currentYearEntry = currentRegent.timeline[Math.floor(Math.random() * currentRegent.timeline.length)];
    document.getElementById("year-display").textContent = currentYearEntry.year;
    document.getElementById("year-answer").textContent = currentYearEntry.event;
    resetUI("year-answer", "toggle-year-answer");
    updateRepeatBtnUI("mark-repeat-year", { year: currentYearEntry.year });
}

function showChallenge() {
    const isYear = Math.random() > 0.5;
    if (isYear) {
        currentChallengeItem = currentRegent.timeline[Math.floor(Math.random() * currentRegent.timeline.length)];
        document.getElementById("challenge-question").textContent = `Vad hände år ${currentChallengeItem.year}?`;
        document.getElementById("challenge-answer").textContent = currentChallengeItem.event;
    } else {
        const q = currentRegent.questions[Math.floor(Math.random() * currentRegent.questions.length)];
        currentChallengeItem = q;
        document.getElementById("challenge-question").textContent = q.q;
        document.getElementById("challenge-answer").textContent = getAnswer(q.year);
    }
    resetUI("challenge-answer");
    document.getElementById("challenge-initial-controls").classList.remove("hidden");
    document.getElementById("challenge-action-controls").classList.add("hidden");
    document.getElementById("challenge-streak").textContent = challengeStreak;
}

function showRepeat() {
    if (repeatItems.length === 0) {
        document.getElementById("repeat-question").textContent = "Allt klart! 🎉";
        document.getElementById("repeat-answer").textContent = "";
        return;
    }
    currentRepeatItem = repeatItems[Math.floor(Math.random() * repeatItems.length)];
    document.getElementById("repeat-question").textContent = currentRepeatItem.q || `Händelsen år ${currentRepeatItem.year}`;
    document.getElementById("repeat-answer").textContent = getAnswer(currentRepeatItem.year);
    resetUI("repeat-answer", "toggle-repeat-answer");
}

function getAnswer(year) {
    const entry = currentRegent.timeline.find(t => t.year === year);
    return entry ? entry.event : "Svar saknas";
}

/* LISTENERS */
document.getElementById("quiz-mode").onclick = () => { showQuestion(); showView("quiz-view"); };
document.getElementById("year-mode").onclick = () => { showYear(); showView("year-view"); };
document.getElementById("repeat-mode").onclick = () => { showRepeat(); showView("repeat-view"); };
document.getElementById("challenge-mode").onclick = () => { challengeStreak = 0; showChallenge(); showView("challenge-view"); };
document.getElementById("timeline-mode").onclick = () => {
    const container = document.getElementById("timeline");
    container.innerHTML = "";
    currentRegent.timeline.forEach(t => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${t.year}</strong><br>${t.event}<div class="code-box">Kod: ${t.code || "—"}</div>`;
        container.appendChild(li);
    });
    showView("timeline-view");
};

document.getElementById("toggle-answer").onclick = () => toggleAnswer("answer", "toggle-answer");
document.getElementById("toggle-year-answer").onclick = () => toggleAnswer("year-answer", "toggle-year-answer");
document.getElementById("toggle-repeat-answer").onclick = () => toggleAnswer("repeat-answer", "toggle-repeat-answer");
document.getElementById("toggle-challenge-answer").onclick = () => {
    document.getElementById("challenge-answer").classList.replace("invisible", "visible");
    document.getElementById("challenge-initial-controls").classList.add("hidden");
    document.getElementById("challenge-action-controls").classList.remove("hidden");
};

document.getElementById("next-question").onclick = showQuestion;
document.getElementById("next-year").onclick = showYear;
document.getElementById("next-repeat").onclick = showRepeat;

function toggleRepeat(item) {
    const idx = repeatItems.findIndex(r => r.year === item.year && (item.q ? r.q === item.q : true));
    if (idx > -1) repeatItems.splice(idx, 1);
    else repeatItems.push(item);
    localStorage.setItem("repeatItems", JSON.stringify(repeatItems));
    updateTrackers();
}

document.getElementById("mark-repeat").onclick = () => { toggleRepeat({year: currentQuestion.year, q: currentQuestion.q}); updateRepeatBtnUI("mark-repeat", currentQuestion); };
document.getElementById("mark-repeat-year").onclick = () => { toggleRepeat({year: currentYearEntry.year}); updateRepeatBtnUI("mark-repeat-year", currentYearEntry); };

document.getElementById("mark-known").onclick = () => { challengeStreak++; playSuccessSound(); showChallenge(); };
document.getElementById("mark-retry").onclick = () => { 
    challengeStreak = 0; 
    const item = currentChallengeItem.q ? {year: currentChallengeItem.year, q: currentChallengeItem.q} : {year: currentChallengeItem.year};
    if (!repeatItems.some(r => r.year === item.year && (item.q ? r.q === item.q : true))) {
        repeatItems.push(item);
        localStorage.setItem("repeatItems", JSON.stringify(repeatItems));
    }
    showChallenge(); 
};

document.getElementById("remove-repeat").onclick = () => {
    repeatItems = repeatItems.filter(r => !(r.year === currentRepeatItem.year && (currentRepeatItem.q ? r.q === currentRepeatItem.q : true)));
    localStorage.setItem("repeatItems", JSON.stringify(repeatItems));
    showRepeat();
};
