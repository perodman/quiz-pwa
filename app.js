let data, currentSubject, currentCategory, currentRegent, currentQuestion, currentYearEntry, currentRepeatItem, currentChallengeItem;
let repeatItems = JSON.parse(localStorage.getItem("repeatItems") || "[]");
let challengeStreak = 0;
let isSoundEnabled = true;
let viewHistory = ["subject-view"];
let audioCtx;

// --- SPLASH LOGIK ---
window.addEventListener('load', () => {
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        splash.style.opacity = '0';
        setTimeout(() => splash.classList.add('hidden'), 500);
    }, 1000); // Visas i 1 sekund
});

function initAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
}
document.body.addEventListener('click', initAudio, { once: true });

function haptic() {
    if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(10);
}

async function playSuccessSound() {
    if (!isSoundEnabled) return;
    initAudio();
    const now = audioCtx.currentTime;
    const playTone = (freq, start, dur) => {
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.frequency.setValueAtTime(freq, start);
        g.gain.setValueAtTime(0, start);
        g.gain.linearRampToValueAtTime(0.1, start + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, start + dur);
        osc.connect(g); g.connect(audioCtx.destination);
        osc.start(start); osc.stop(start + dur);
    };
    playTone(523, now, 0.2); 
    playTone(659, now + 0.1, 0.2); 
    playTone(783, now + 0.2, 0.4);
}

fetch("questions.json")
    .then(r => r.json())
    .then(json => {
        data = json;
        renderSubjects();
        updateTrackers();
        showView("subject-view");
    });

function showView(id) {
    document.querySelectorAll(".view").forEach(v => v.classList.add("hidden"));
    document.getElementById(id).classList.remove("hidden");
    const backBtnArea = document.getElementById("nav-header");
    if (id === "subject-view") {
        backBtnArea.classList.add("hidden");
        viewHistory = ["subject-view"];
    } else {
        backBtnArea.classList.remove("hidden");
        if (viewHistory[viewHistory.length - 1] !== id) viewHistory.push(id);
    }
    window.scrollTo(0, 0);
}

document.getElementById("global-home").onclick = () => { haptic(); showView("subject-view"); };
document.getElementById("global-back").onclick = () => {
    haptic();
    if (viewHistory.length > 1) {
        viewHistory.pop();
        const prev = viewHistory[viewHistory.length - 1];
        document.querySelectorAll(".view").forEach(v => v.classList.add("hidden"));
        document.getElementById(prev).classList.remove("hidden");
        if (prev === "subject-view") document.getElementById("nav-header").classList.add("hidden");
    }
};

function renderSubjects() {
    const container = document.getElementById("subjects");
    container.innerHTML = "";
    data.subjects.forEach(s => {
        const b = document.createElement("button");
        b.textContent = s.name;
        b.onclick = () => { haptic(); currentSubject = s; renderCategories(); showView("category-view"); };
        container.appendChild(b);
    });
}

function renderCategories() {
    const container = document.getElementById("categories");
    container.innerHTML = "";
    currentSubject.categories.forEach(c => {
        const b = document.createElement("button");
        b.textContent = c.name;
        b.onclick = () => { haptic(); currentCategory = c; renderRegents(); showView("regent-view"); };
        container.appendChild(b);
    });
}

function renderRegents() {
    const container = document.getElementById("regents");
    container.innerHTML = "";
    currentCategory.regents.forEach(r => {
        const b = document.createElement("button");
        b.textContent = r.name;
        b.onclick = () => { haptic(); currentRegent = r; document.getElementById("regent-title").textContent = r.name; showView("mode-view"); };
        container.appendChild(b);
    });
}

function toggleAnswer(displayId, btnId) {
    haptic();
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

function getAnswer(year) {
    const entry = currentRegent.timeline.find(t => t.year === year);
    return entry ? entry.event : "Svar saknas";
}

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
        updateTrackers(); return;
    }
    currentRepeatItem = repeatItems[Math.floor(Math.random() * repeatItems.length)];
    document.getElementById("repeat-question").textContent = !currentRepeatItem.q ? `Vad hände år ${currentRepeatItem.year}?` : currentRepeatItem.q;
    document.getElementById("repeat-answer").textContent = getAnswer(currentRepeatItem.year);
    resetUI("repeat-answer", "toggle-repeat-answer");
}

function updateTrackers() {
    const badge = document.getElementById("repeat-badge");
    const count = repeatItems.length;
    if (badge) { badge.textContent = count; badge.classList.toggle("hidden", count === 0); }
    const ct = document.getElementById("repeat-counter-text");
    if (ct) {
        ct.textContent = count > 0 ? `${count} ${count === 1 ? "händelse" : "händelser"} kvar` : "Inga händelser kvar";
    }
}

function updateRepeatBtnUI(btnId, item) {
    const btn = document.getElementById(btnId); if (!btn) return;
    const exists = repeatItems.some(r => r.year === item.year && (item.q ? r.q === item.q : true));
    btn.innerHTML = exists ? "Repetera! ✅" : "Repetera? 🔁";
    btn.className = exists ? "full-btn repeat-btn-active" : "full-btn repeat-btn-inactive";
}

function toggleRepeat(item) {
    const idx = repeatItems.findIndex(r => r.year === item.year && (item.q ? r.q === item.q : true));
    if (idx > -1) repeatItems.splice(idx, 1); else repeatItems.push(item);
    localStorage.setItem("repeatItems", JSON.stringify(repeatItems));
    updateTrackers();
}

document.getElementById("quiz-mode").onclick = () => { haptic(); showQuestion(); showView("quiz-view"); };
document.getElementById("year-mode").onclick = () => { haptic(); showYear(); showView("year-view"); };
document.getElementById("repeat-mode").onclick = () => { haptic(); showRepeat(); showView("repeat-view"); };
document.getElementById("challenge-mode").onclick = () => { haptic(); challengeStreak = 0; showChallenge(); showView("challenge-view"); };
document.getElementById("timeline-mode").onclick = () => {
    haptic();
    const container = document.getElementById("timeline");
    container.innerHTML = "";
    currentRegent.timeline.forEach(t => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${t.year}</strong><br>${t.event}`;
        container.appendChild(li);
    });
    showView("timeline-view");
};

document.getElementById("toggle-answer").onclick = () => toggleAnswer("answer", "toggle-answer");
document.getElementById("toggle-year-answer").onclick = () => toggleAnswer("year-answer", "toggle-year-answer");
document.getElementById("toggle-repeat-answer").onclick = () => toggleAnswer("repeat-answer", "toggle-repeat-answer");
document.getElementById("toggle-challenge-answer").onclick = () => {
    haptic(); document.getElementById("challenge-answer").classList.replace("invisible", "visible");
    document.getElementById("challenge-initial-controls").classList.add("hidden");
    document.getElementById("challenge-action-controls").classList.remove("hidden");
};

document.getElementById("next-question").onclick = () => { haptic(); showQuestion(); };
document.getElementById("next-year").onclick = () => { haptic(); showYear(); };
document.getElementById("next-repeat").onclick = () => { haptic(); showRepeat(); };
document.getElementById("mark-known").onclick = () => { haptic(); challengeStreak++; playSuccessSound(); showChallenge(); };
document.getElementById("mark-retry").onclick = () => { haptic(); challengeStreak = 0; toggleRepeat(currentChallengeItem); showChallenge(); };
document.getElementById("mark-repeat").onclick = () => { toggleRepeat({year: currentQuestion.year, q: currentQuestion.q}); updateRepeatBtnUI("mark-repeat", currentQuestion); };
document.getElementById("mark-repeat-year").onclick = () => { toggleRepeat({year: currentYearEntry.year}); updateRepeatBtnUI("mark-repeat-year", currentYearEntry); };
document.getElementById("remove-repeat").onclick = () => { haptic(); repeatItems = repeatItems.filter(r => !(r.year === currentRepeatItem.year && (currentRepeatItem.q ? r.q === currentRepeatItem.q : true))); localStorage.setItem("repeatItems", JSON.stringify(repeatItems)); updateTrackers(); showRepeat(); };

document.getElementById("sound-toggle").onclick = () => {
    isSoundEnabled = !isSoundEnabled;
    document.getElementById("sound-toggle").textContent = isSoundEnabled ? "🔊" : "🔇";
    haptic();
};
