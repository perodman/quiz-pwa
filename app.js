let data;
let currentSubject, currentCategory, currentRegent;
let currentQuestion, currentYearEntry, currentRepeatItem, currentChallengeItem;
let repeatItems = JSON.parse(localStorage.getItem("repeatItems") || "[]");
let challengeStreak = 0;

/* LADDA DATA */
fetch("questions.json")
  .then(r => r.json())
  .then(json => {
    data = json;
    renderSubjects();
    showView("subject-view");
  });

/* VY-HANTERING */
function showView(id) {
  document.querySelectorAll(".view").forEach(v => v.classList.add("hidden"));
  const target = document.getElementById(id);
  if (target) target.classList.remove("hidden");
  window.scrollTo(0, 0);
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
function toggleAnswerSimple(displayId, btnId) {
  const el = document.getElementById(displayId);
  const btn = document.getElementById(btnId);
  const isHidden = el.classList.contains("invisible");
  el.classList.toggle("invisible", !isHidden);
  el.classList.toggle("visible", isHidden);
  btn.innerHTML = isHidden ? 'Dölj svar &nbsp; ✖' : 'Visa svar';
  btn.classList.toggle("active", isHidden);
}

function toggleChallengeAnswer() {
  document.getElementById("challenge-answer").classList.replace("invisible", "visible");
  document.getElementById("challenge-initial-controls").classList.add("hidden");
  document.getElementById("challenge-action-controls").classList.remove("hidden");
}

function resetUI(displayId, btnId) {
  const el = document.getElementById(displayId);
  const btn = document.getElementById(btnId);
  el.classList.replace("visible", "invisible");
  if (btn) {
    btn.innerHTML = "Visa svar";
    btn.classList.remove("active");
  }
}

/* MODES */
function showQuestion() {
  currentQuestion = currentRegent.questions[Math.floor(Math.random() * currentRegent.questions.length)];
  document.getElementById("question").textContent = currentQuestion.q;
  document.getElementById("answer").textContent = getAnswer(currentQuestion.year);
  resetUI("answer", "toggle-answer");
}

function showYear() {
  currentYearEntry = currentRegent.timeline[Math.floor(Math.random() * currentRegent.timeline.length)];
  document.getElementById("year-display").textContent = currentYearEntry.year;
  document.getElementById("year-answer").textContent = currentYearEntry.event;
  resetUI("year-answer", "toggle-year-answer");
}

function showChallenge() {
  // Slumpa antingen en fråga eller ett årtal för utmaningen
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
  
  document.getElementById("challenge-answer").classList.replace("visible", "invisible");
  document.getElementById("challenge-initial-controls").classList.remove("hidden");
  document.getElementById("challenge-action-controls").classList.add("hidden");
  document.getElementById("challenge-streak").textContent = challengeStreak;
}

function showRepeat() {
  if (repeatItems.length === 0) {
    document.getElementById("repeat-question").textContent = "Inga frågor kvar 🎉";
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

function handleChallenge(isKnown) {
  if (isKnown) {
    challengeStreak++;
  } else {
    challengeStreak = 0;
    // Lägg till i repetition automatiskt vid fel
    const item = currentChallengeItem.q 
      ? { type: "quiz", year: currentChallengeItem.year, q: currentChallengeItem.q }
      : { type: "year", year: currentChallengeItem.year };
    
    if (!repeatItems.some(r => r.year === item.year && r.type === item.type)) {
      repeatItems.push(item);
      localStorage.setItem("repeatItems", JSON.stringify(repeatItems));
    }
  }
  showChallenge();
}

function showTimeline() {
  const container = document.getElementById("timeline");
  container.innerHTML = "";
  currentRegent.timeline.forEach(t => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${t.year}</strong><span>${t.event}</span><br><div class="code-box">Kod: ${t.code || "—"}</div>`;
    container.appendChild(li);
  });
  showView("timeline-view");
}

/* LISTENERS */
document.getElementById("quiz-mode").onclick = () => { showQuestion(); showView("quiz-view"); };
document.getElementById("year-mode").onclick = () => { showYear(); showView("year-view"); };
document.getElementById("repeat-mode").onclick = () => { showRepeat(); showView("repeat-view"); };
document.getElementById("challenge-mode").onclick = () => { challengeStreak = 0; showChallenge(); showView("challenge-view"); };
document.getElementById("timeline-mode").onclick = showTimeline;

document.getElementById("toggle-answer").onclick = () => toggleAnswerSimple("answer", "toggle-answer");
document.getElementById("toggle-year-answer").onclick = () => toggleAnswerSimple("year-answer", "toggle-year-answer");
document.getElementById("toggle-repeat-answer").onclick = () => toggleAnswerSimple("repeat-answer", "toggle-repeat-answer");
document.getElementById("toggle-challenge-answer").onclick = toggleChallengeAnswer;

document.getElementById("next-question").onclick = showQuestion;
document.getElementById("next-year").onclick = showYear;
document.getElementById("next-repeat").onclick = showRepeat;

document.getElementById("mark-known").onclick = () => handleChallenge(true);
document.getElementById("mark-retry").onclick = () => handleChallenge(false);

document.getElementById("remove-repeat").onclick = () => {
  repeatItems = repeatItems.filter(r => !(r.year === currentRepeatItem.year && r.type === currentRepeatItem.type));
  localStorage.setItem("repeatItems", JSON.stringify(repeatItems));
  showRepeat();
};

/* BACK NAV */
document.getElementById("back-to-subjects").onclick = () => showView("subject-view");
document.getElementById("back-to-categories").onclick = () => showView("category-view");
document.getElementById("back-to-regents").onclick = () => showView("regent-view");
document.querySelectorAll("[id^='back-to-modes']").forEach(b => b.onclick = () => showView("mode-view"));
