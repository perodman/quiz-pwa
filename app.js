let data;
let currentSubject, currentCategory, currentRegent;
let currentQuestion, currentYearEntry, currentRepeatItem;
let repeatItems = JSON.parse(localStorage.getItem("repeatItems") || "[]");
let streak = 0;

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
function toggleAnswer(displayId, btnId, controlsToShowId, controlsToHideId) {
  const el = document.getElementById(displayId);
  const btn = document.getElementById(btnId);
  el.classList.remove("invisible");
  el.classList.add("visible");
  btn.innerHTML = 'Dölj svar &nbsp; ✖';
  btn.classList.add("active");
  
  document.getElementById(controlsToHideId).classList.add("hidden");
  document.getElementById(controlsToShowId).classList.remove("hidden");
}

function resetQuizUI(displayId, btnId, initialId, actionId) {
  const el = document.getElementById(displayId);
  const btn = document.getElementById(btnId);
  el.classList.add("invisible");
  el.classList.remove("visible");
  btn.innerHTML = "Visa svar";
  btn.classList.remove("active");
  
  document.getElementById(initialId).classList.remove("hidden");
  document.getElementById(actionId).classList.add("hidden");
}

/* MODES */
function showQuestion() {
  currentQuestion = currentRegent.questions[Math.floor(Math.random() * currentRegent.questions.length)];
  document.getElementById("question").textContent = currentQuestion.q;
  document.getElementById("answer").textContent = getAnswer(currentQuestion.year);
  resetQuizUI("answer", "toggle-answer", "quiz-initial-controls", "quiz-action-controls");
  document.getElementById("quiz-streak").textContent = streak;
}

function showYear() {
  currentYearEntry = currentRegent.timeline[Math.floor(Math.random() * currentRegent.timeline.length)];
  document.getElementById("year-display").textContent = currentYearEntry.year;
  document.getElementById("year-answer").textContent = currentYearEntry.event;
  resetQuizUI("year-answer", "toggle-year-answer", "year-initial-controls", "year-action-controls");
  document.getElementById("year-streak").textContent = streak;
}

function showRepeat() {
  if (repeatItems.length === 0) {
    document.getElementById("repeat-question").textContent = "Inga frågor kvar 🎉";
    document.getElementById("repeat-answer").textContent = "";
    document.getElementById("repeat-action-controls").classList.add("hidden");
    document.getElementById("repeat-initial-controls").classList.remove("hidden");
    return;
  }
  currentRepeatItem = repeatItems[Math.floor(Math.random() * repeatItems.length)];
  document.getElementById("repeat-question").textContent = currentRepeatItem.type === "quiz" ? currentRepeatItem.q : `Vad hände ${currentRepeatItem.year}?`;
  document.getElementById("repeat-answer").textContent = getAnswer(currentRepeatItem.year);
  resetQuizUI("repeat-answer", "toggle-repeat-answer", "repeat-initial-controls", "repeat-action-controls");
}

/* STREAK & REPEAT LOGIC */
function handleResponse(isKnown, type) {
  if (isKnown) {
    streak++;
  } else {
    streak = 0;
    // Lägg till i repetition om det inte redan finns
    const item = type === 'quiz' 
      ? { type: "quiz", year: currentQuestion.year, q: currentQuestion.q }
      : { type: "year", year: currentYearEntry.year };
    
    const exists = repeatItems.some(r => r.year === item.year && r.type === item.type);
    if (!exists) {
      repeatItems.push(item);
      localStorage.setItem("repeatItems", JSON.stringify(repeatItems));
    }
  }
  
  if (type === 'quiz') showQuestion();
  else showYear();
}

/* HELPERS */
function getAnswer(year) {
  const entry = currentRegent.timeline.find(t => t.year === year);
  return entry ? entry.event : "Svar saknas";
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
document.getElementById("quiz-mode").onclick = () => { streak = 0; showQuestion(); showView("quiz-view"); };
document.getElementById("year-mode").onclick = () => { streak = 0; showYear(); showView("year-view"); };
document.getElementById("repeat-mode").onclick = () => { showRepeat(); showView("repeat-view"); };
document.getElementById("timeline-mode").onclick = showTimeline;

// Toggle Listeners
document.getElementById("toggle-answer").onclick = () => toggleAnswer("answer", "toggle-answer", "quiz-action-controls", "quiz-initial-controls");
document.getElementById("toggle-year-answer").onclick = () => toggleAnswer("year-answer", "toggle-year-answer", "year-action-controls", "year-initial-controls");
document.getElementById("toggle-repeat-answer").onclick = () => toggleAnswer("repeat-answer", "toggle-repeat-answer", "repeat-action-controls", "repeat-initial-controls");

// Action Listeners
document.getElementById("mark-known").onclick = () => handleResponse(true, 'quiz');
document.getElementById("mark-retry").onclick = () => handleResponse(false, 'quiz');
document.getElementById("mark-known-year").onclick = () => handleResponse(true, 'year');
document.getElementById("mark-retry-year").onclick = () => handleResponse(false, 'year');

document.getElementById("next-repeat").onclick = showRepeat;
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
