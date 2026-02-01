let data;
let currentSubject, currentCategory, currentRegent;
let currentQuestion, currentYearEntry, currentRepeatItem, currentChallengeItem;
let repeatItems = JSON.parse(localStorage.getItem("repeatItems") || "[]");
let challengeStreak = 0;

/* LADDA DATA */
fetch("questions.json").then(r => r.json()).then(json => {
    data = json;
    renderSubjects();
    updateTrackers();
    showView("subject-view");
});

/* VY-HANTERING */
function showView(id) {
    document.querySelectorAll(".view").forEach(v => v.classList.add("hidden"));
    const target = document.getElementById(id);
    if (target) target.classList.remove("hidden");
    window.scrollTo(0, 0);
    updateTrackers();
}

/* TRACKERS */
function updateTrackers() {
    const badge = document.getElementById("repeat-badge");
    const counterText = document.getElementById("repeat-counter-text");
    const count = repeatItems.length;

    if (count > 0) {
        badge.textContent = count;
        badge.classList.remove("hidden");
        if(counterText) counterText.textContent = `${count} händelser kvar att repetera!`;
    } else {
        badge.classList.add("hidden");
        if(counterText) counterText.textContent = "";
    }
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

/* SVARSLOGIK */
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
    el.classList.add("invisible"); el.classList.remove("visible");
    if (btn) { btn.innerHTML = "Visa svar 📖"; btn.classList.remove("active"); }
}

/* REPEAT BUTTON LOGIC */
function updateRepeatBtnUI(btnId, item) {
    const btn = document.getElementById(btnId);
    const exists = repeatItems.some(r => r.year === item.year && (item.q ? r.q === item.q : true));
    
    if (exists) {
        btn.innerHTML = "Repetera! ✅";
        btn.className = "full-btn repeat-btn-active";
    } else {
        btn.innerHTML = "Repetera? 🔁";
        btn.className = "full-btn repeat-btn-inactive";
    }
}

/* MODES */
function showQuestion() {
    currentQuestion = currentRegent.questions[Math.floor(Math.random() * currentRegent.questions.length)];
    document.getElementById("question").textContent = currentQuestion.q;
    document.getElementById("answer").textContent = getAnswer(currentQuestion.year);
    resetUI("answer", "toggle-answer");
    updateRepeatBtnUI("mark-repeat", { type: "quiz", year: currentQuestion.year, q: currentQuestion.q });
}

function showYear() {
    currentYearEntry = currentRegent.timeline[Math.floor(Math.random() * currentRegent.timeline.length)];
    document.getElementById("year-display").textContent = currentYearEntry.year;
    document.getElementById("year-answer").textContent = currentYearEntry.event;
    resetUI("year-answer", "toggle-year-answer");
    updateRepeatBtnUI("mark-repeat-year", { type: "year", year: currentYearEntry.year });
}

function showChallenge() {
    const isYearMode = Math.random() > 0.5;
    if (isYearMode) {
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
    updateTrackers();
    if (repeatItems.length === 0) {
        document.getElementById("repeat-question").textContent = "Inga frågor kvar! 🎉";
        document.getElementById("repeat-answer").textContent = "";
        return;
    }
    currentRepeatItem = repeatItems[Math.floor(Math.random() * repeatItems.length)];
    document.getElementById("repeat-question").textContent = currentRepeatItem.type === "quiz" ? currentRepeatItem.q : `Vad hände ${currentRepeatItem.year}?`;
    document.getElementById("repeat-answer").textContent = getAnswer(currentRepeatItem.year);
    resetUI("repeat-answer", "toggle-repeat-answer");
}

/* HELPERS */
function getAnswer(year) {
    const entry = currentRegent.timeline.find(t => t.year === year);
    return entry ? entry.event : "Svar saknas";
}

function toggleRepeat(item, btnId) {
    const index = repeatItems.findIndex(r => r.year === item.year && (item.q ? r.q === item.q : true));
    if (index > -1) repeatItems.splice(index, 1);
    else repeatItems.push(item);
    localStorage.setItem("repeatItems", JSON.stringify(repeatItems));
    updateRepeatBtnUI(btnId, item);
    updateTrackers();
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
        li.innerHTML = `<strong>${t.year}</strong><span>${t.event}</span><br><div class="code-box">Kod: ${t.code || "—"}</div>`;
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

document.getElementById("mark-repeat").onclick = () => toggleRepeat({ type: "quiz", year: currentQuestion.year, q: currentQuestion.q }, "mark-repeat");
document.getElementById("mark-repeat-year").onclick = () => toggleRepeat({ type: "year", year: currentYearEntry.year }, "mark-repeat-year");

document.getElementById("mark-known").onclick = () => { challengeStreak++; showChallenge(); };
document.getElementById("mark-retry").onclick = () => { 
    challengeStreak = 0; 
    const item = currentChallengeItem.q ? { type: "quiz", year: currentChallengeItem.year, q: currentChallengeItem.q } : { type: "year", year: currentChallengeItem.year };
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

document.querySelectorAll("[id^='back-to-']").forEach(b => b.onclick = (e) => {
    const target = e.target.id.split("-")[2];
    if (target === "subjects") showView("subject-view");
    else if (target === "categories") showView("category-view");
    else if (target === "regents") showView("regent-view");
    else showView("mode-view");
});
