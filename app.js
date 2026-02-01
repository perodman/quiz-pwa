let data;
let currentSubject, currentCategory, currentRegent;
let currentQuestion, currentYearEntry, currentRepeatItem;
let repeatItems = JSON.parse(localStorage.getItem("repeatItems") || "[]");

/* --- 1. LADDA DATA --- */
fetch("questions.json")
  .then(r => r.json())
  .then(json => {
    data = json;
    renderSubjects();
    showView("subject-view");
  });

/* --- 2. VY-KONTROLL --- */
function showView(id) {
  document.querySelectorAll(".view").forEach(v => v.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
  window.scrollTo(0, 0);
}

/* --- 3. RENDERING AV KATEGORIER & VAL --- */
function renderSubjects() {
  const subjectsDiv = document.getElementById("subjects");
  subjectsDiv.innerHTML = "";
  data.subjects.forEach(s => {
    const b = document.createElement("button");
    b.textContent = s.name;
    b.onclick = () => { 
      currentSubject = s; 
      renderCategories(); 
      showView("category-view"); 
    };
    subjectsDiv.appendChild(b);
  });
}

function renderCategories() {
  const categoriesDiv = document.getElementById("categories");
  categoriesDiv.innerHTML = "";
  currentSubject.categories.forEach(c => {
    const b = document.createElement("button");
    b.textContent = c.name;
    b.onclick = () => { 
      currentCategory = c; 
      renderRegents(); 
      showView("regent-view"); 
    };
    categoriesDiv.appendChild(b);
  });
}

function renderRegents() {
  const regentsDiv = document.getElementById("regents");
  regentsDiv.innerHTML = "";
  currentCategory.regents.forEach(r => {
    const b = document.createElement("button");
    b.textContent = r.name;
    b.onclick = () => { 
      currentRegent = r; 
      document.getElementById("regent-title").textContent = r.name; 
      showView("mode-view"); 
    };
    regentsDiv.appendChild(b);
  });
}

/* --- 4. LOGIK FÖR VISA/DÖLJ SVAR --- */
function handleToggleAnswer(displayId, btnId) {
  const el = document.getElementById(displayId);
  const btn = document.getElementById(btnId);
  
  if (el.classList.contains("invisible")) {
    el.classList.remove("invisible");
    el.classList.add("visible");
    btn.textContent = "Dölj svar";
    btn.classList.add("active");
  } else {
    el.classList.add("invisible");
    el.classList.remove("visible");
    btn.textContent = "Visa svar";
    btn.classList.remove("active");
  }
}

function resetToggle(displayId, btnId) {
  const el = document.getElementById(displayId);
  const btn = document.getElementById(btnId);
  el.classList.add("invisible");
  el.classList.remove("visible");
  btn.textContent = "Visa svar";
  btn.classList.remove("active");
}

/* --- 5. QUIZ-FUNKTIONER --- */

// Vanligt Quiz
function showQuestion() {
  currentQuestion = currentRegent.questions[Math.floor(Math.random() * currentRegent.questions.length)];
  document.getElementById("question").textContent = currentQuestion.q;
  document.getElementById("answer").textContent = getAnswer(currentQuestion.year);
  resetToggle("answer", "toggle-answer");
  updateRepeatButton(document.getElementById("mark-repeat"), { type: "quiz", year: currentQuestion.year, q: currentQuestion.q });
}

// Årtalsquiz (Vad hände?)
function showYear() {
  currentYearEntry = currentRegent.timeline[Math.floor(Math.random() * currentRegent.timeline.length)];
  document.getElementById("year-display").textContent = currentYearEntry.year;
  document.getElementById("year-answer").textContent = currentYearEntry.event;
  resetToggle("year-answer", "toggle-year-answer");
  updateRepeatButton(document.getElementById("mark-repeat-year"), { type: "year", year: currentYearEntry.year });
}

// Repetitionsläge
function showRepeat() {
  const qEl = document.getElementById("repeat-question");
  const aEl = document.getElementById("repeat-answer");
  
  if (repeatItems.length === 0) {
    qEl.textContent = "Inga frågor kvar i repetition 🎉";
    aEl.textContent = "";
    return;
  }
  
  currentRepeatItem = repeatItems[Math.floor(Math.random() * repeatItems.length)];
  qEl.textContent = currentRepeatItem.type === "quiz" ? currentRepeatItem.q : `Vad hände ${currentRepeatItem.year}?`;
  aEl.textContent = getAnswer(currentRepeatItem.year);
  resetToggle("repeat-answer", "toggle-repeat-answer");
}

// Tidslinje (Sicksack / Roadmap)
function showTimeline() {
  const timelineEl = document.getElementById("timeline");
  timelineEl.innerHTML = "";
  currentRegent.timeline.forEach(t => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${t.year}</strong>
      <span>${t.event}</span>
      <br>
      <div class="code-box">Minneskod: ${t.code || "Saknas"}</div>
    `;
    timelineEl.appendChild(li);
  });
  showView("timeline-view");
}

/* --- 6. HJÄLPFUNKTIONER (REPETITION) --- */
function toggleRepeat(item) {
  const exists = repeatItems.some(r => r.type === item.type && r.year === item.year);
  if (exists) {
    repeatItems = repeatItems.filter(r => !(r.type === item.type && r.year === item.year));
  } else {
    repeatItems.push({ ...item });
  }
  localStorage.setItem("repeatItems", JSON.stringify(repeatItems));
}

function updateRepeatButton(btn, item) {
  const exists = repeatItems.some(r => r.type === item.type && r.year === item.year);
  btn.innerHTML = exists ? "Repetera? ✅" : "Repetera? 🔁";
}

function getAnswer(year) {
  const entry = currentRegent.timeline.find(t => t.year === year);
  return entry ? entry.event : "Svar saknas";
}

/* --- 7. EVENT LISTENERS --- */

// Gå till olika lägen
document.getElementById("quiz-mode").onclick = () => { showQuestion(); showView("quiz-view"); };
document.getElementById("year-mode").onclick = () => { showYear(); showView("year-view"); };
document.getElementById("timeline-mode").onclick = showTimeline;
document.getElementById("repeat-mode").onclick = () => { showRepeat(); showView("repeat-view"); };

// Visa svar-knappar
document.getElementById("toggle-answer").onclick = () => handleToggleAnswer("answer", "toggle-answer");
document.getElementById("toggle-year-answer").onclick = () => handleToggleAnswer("year-answer", "toggle-year-answer");
document.getElementById("toggle-repeat-answer").onclick = () => handleToggleAnswer("repeat-answer", "toggle-repeat-answer");

// Nästa-knappar
document.getElementById("next-question").onclick = showQuestion;
document.getElementById("next-year").onclick = showYear;
document.getElementById("next-repeat").onclick = showRepeat;

// Lägg till/ta bort från repetition
document.getElementById("mark-repeat").onclick = () => {
  toggleRepeat({ type: "quiz", year: currentQuestion.year, q: currentQuestion.q });
  updateRepeatButton(document.getElementById("mark-repeat"), { type: "quiz", year: currentQuestion.year });
};

document.getElementById("mark-repeat-year").onclick = () => {
  toggleRepeat({ type: "year", year: currentYearEntry.year });
  updateRepeatButton(document.getElementById("mark-repeat-year"), { type: "year", year: currentYearEntry.year });
};

document.getElementById("remove-repeat").onclick = () => {
  repeatItems = repeatItems.filter(r => !(r.type === currentRepeatItem.type && r.year === currentRepeatItem.year));
  localStorage.setItem("repeatItems", JSON.stringify(repeatItems));
  showRepeat();
};

/* --- 8. TILLBAKA-NAVIGERING --- */
document.getElementById("back-to-subjects").onclick = () => showView("subject-view");
document.getElementById("back-to-categories").onclick = () => showView("category-view");
document.getElementById("back-to-regents").onclick = () => showView("regent-view");
document.querySelectorAll("[id^='back-to-modes']").forEach(btn => {
  btn.onclick = () => showView("mode-view");
});
