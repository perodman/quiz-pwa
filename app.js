let data;
let currentSubject, currentCategory, currentRegent;
let currentQuestion, currentYearEntry, currentRepeatItem;
let repeatItems = JSON.parse(localStorage.getItem("repeatItems") || "[]");

/* ELEMENTS */
const subjectsDiv = document.getElementById("subjects");
const categoriesDiv = document.getElementById("categories");
const regentsDiv = document.getElementById("regents");
const timelineEl = document.getElementById("timeline");

/* FETCH */
fetch("questions.json")
  .then(r => r.json())
  .then(json => {
    data = json;
    renderSubjects();
    showView("subject-view");
  });

/* VIEW CONTROL */
function showView(id) {
  document.querySelectorAll(".view").forEach(v => v.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
  window.scrollTo(0, 0);
}

/* RENDER SELECTIONS */
function renderSubjects() {
  subjectsDiv.innerHTML = "";
  data.subjects.forEach(s => {
    const b = document.createElement("button");
    b.textContent = s.name;
    b.onclick = () => { currentSubject = s; renderCategories(); showView("category-view"); };
    subjectsDiv.appendChild(b);
  });
}

function renderCategories() {
  categoriesDiv.innerHTML = "";
  currentSubject.categories.forEach(c => {
    const b = document.createElement("button");
    b.textContent = c.name;
    b.onclick = () => { currentCategory = c; renderRegents(); showView("regent-view"); };
    categoriesDiv.appendChild(b);
  });
}

function renderRegents() {
  regentsDiv.innerHTML = "";
  currentCategory.regents.forEach(r => {
    const b = document.createElement("button");
    b.textContent = r.name;
    b.onclick = () => { currentRegent = r; document.getElementById("regent-title").textContent = r.name; showView("mode-view"); };
    regentsDiv.appendChild(b);
  });
}

/* TOGGLE LOGIC */
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

/* QUIZ LOGIC */
function showQuestion() {
  currentQuestion = currentRegent.questions[Math.floor(Math.random() * currentRegent.questions.length)];
  document.getElementById("question").textContent = currentQuestion.q;
  document.getElementById("answer").textContent = getAnswer(currentQuestion.year);
  resetToggle("answer", "toggle-answer");
  updateRepeatButton(document.getElementById("mark-repeat"), { type: "quiz", year: currentQuestion.year });
}

function showYear() {
  currentYearEntry = currentRegent.timeline[Math.floor(Math.random() * currentRegent.timeline.length)];
  // Här visar vi nu bara siffran för att det ska se snyggt ut med den nya designen
  document.getElementById("year-display").textContent = currentYearEntry.year;
  document.getElementById("year-answer").textContent = currentYearEntry.event;
  resetToggle("year-answer", "toggle-year-answer");
  updateRepeatButton(document.getElementById("mark-repeat-year"), { type: "year", year: currentYearEntry.year });
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
  resetToggle("repeat-answer", "toggle-repeat-answer");
}

function showTimeline() {
  timelineEl.innerHTML = "";
  currentRegent.timeline.forEach(t => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${t.year}</strong> – ${t.event}<div class="code-box">Minneskod: ${t.code || "—"}</div>`;
    timelineEl.appendChild(li);
  });
  showView("timeline-view");
}

/* HELPERS */
function toggleRepeat(item) {
  const exists = repeatItems.some(r => r.type === item.type && r.year === item.year);
  repeatItems = exists ? repeatItems.filter(r => !(r.type === item.type && r.year === item.year)) : [...repeatItems, { ...item, q: item.q || "" }];
  localStorage.setItem("repeatItems", JSON.stringify(repeatItems));
}

function updateRepeatButton(btn, item) {
  const exists = repeatItems.some(r => r.type === item.type && r.year === item.year);
  btn.innerHTML = exists ? "Repetera? ✅" : "Repetera? 🔁";
}

function getAnswer(year) {
  const entry = currentRegent.timeline.find(t => t.year === year);
  return entry ? entry.event : "—";
}

/* EVENT LISTENERS */
document.getElementById("quiz-mode").onclick = () => { showQuestion(); showView("quiz-view"); };
document.getElementById("year-mode").onclick = () => { showYear(); showView("year-view"); };
document.getElementById("timeline-mode").onclick = showTimeline;
document.getElementById("repeat-mode").onclick = () => { showRepeat(); showView("repeat-view"); };

document.getElementById("toggle-answer").onclick = () => handleToggleAnswer("answer", "toggle-answer");
document.getElementById("toggle-year-answer").onclick = () => handleToggleAnswer("year-answer", "toggle-year-answer");
document.getElementById("toggle-repeat-answer").onclick = () => handleToggleAnswer("repeat-answer", "toggle-repeat-answer");

document.getElementById("next-question").onclick = showQuestion;
document.getElementById("next-year").onclick = showYear;
document.getElementById("next-repeat").onclick = showRepeat;

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

/* BACK NAVIGATION */
document.getElementById("back-to-subjects").onclick = () => showView("subject-view");
document.getElementById("back-to-categories").onclick = () => showView("category-view");
document.getElementById("back-to-regents").onclick = () => showView("regent-view");
document.querySelectorAll("[id^='back-to-modes']").forEach(btn => btn.onclick = () => showView("mode-view"));
