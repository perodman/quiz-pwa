let data;
let currentSubject, currentCategory, currentRegent;
let currentQuestion, currentYearEntry, currentRepeatItem;
let repeatItems = JSON.parse(localStorage.getItem("repeatItems") || "[]");

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
    // Vi sätter ingen klass här så att CSS-fixen #subjects button biter
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

/* SVARSLOGIK MED KRYSS-SYMBOL */
function toggleAnswer(displayId, btnId) {
  const el = document.getElementById(displayId);
  const btn = document.getElementById(btnId);
  const isHidden = el.classList.contains("invisible");
  
  el.classList.toggle("invisible", !isHidden);
  el.classList.toggle("visible", isHidden);
  
  if (isHidden) {
    btn.innerHTML = 'Dölj svar &nbsp; ✖'; // Lägger till mörkt kryss
    btn.classList.add("active");
  } else {
    btn.innerHTML = 'Visa svar';
    btn.classList.remove("active");
  }
}

function resetUI(displayId, btnId) {
  const el = document.getElementById(displayId);
  const btn = document.getElementById(btnId);
  el.classList.add("invisible");
  el.classList.remove("visible");
  btn.innerHTML = "Visa svar";
  btn.classList.remove("active");
}

/* MODES */
function showQuestion() {
  currentQuestion = currentRegent.questions[Math.floor(Math.random() * currentRegent.questions.length)];
  document.getElementById("question").textContent = currentQuestion.q;
  document.getElementById("answer").textContent = getAnswer(currentQuestion.year);
  resetUI("answer", "toggle-answer");
  updateRepeatBtn("mark-repeat", { type: "quiz", year: currentQuestion.year, q: currentQuestion.q });
}

function showYear() {
  currentYearEntry = currentRegent.timeline[Math.floor(Math.random() * currentRegent.timeline.length)];
  document.getElementById("year-display").textContent = currentYearEntry.year;
  document.getElementById("year-answer").textContent = currentYearEntry.event;
  resetUI("year-answer", "toggle-year-answer");
  updateRepeatBtn("mark-repeat-year", { type: "year", year: currentYearEntry.year });
}

function showRepeat() {
  const qEl = document.getElementById("repeat-question");
  if (repeatItems.length === 0) {
    qEl.textContent = "Inga frågor kvar 🎉";
    document.getElementById("repeat-answer").textContent = "";
    return;
  }
  currentRepeatItem = repeatItems[Math.floor(Math.random() * repeatItems.length)];
  qEl.textContent = currentRepeatItem.type === "quiz" ? currentRepeatItem.q : `Vad hände ${currentRepeatItem.year}?`;
  document.getElementById("repeat-answer").textContent = getAnswer(currentRepeatItem.year);
  resetUI("repeat-answer", "toggle-repeat-answer");
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

/* HELPERS */
function getAnswer(year) {
  const entry = currentRegent.timeline.find(t => t.year === year);
  return entry ? entry.event : "Svar saknas";
}

function updateRepeatBtn(id, item) {
  const exists = repeatItems.some(r => r.year === item.year && r.type === item.type);
  document.getElementById(id).innerHTML = exists ? "Repetera? ✅" : "Repetera? 🔁";
}

function toggleRepeat(item) {
  const index = repeatItems.findIndex(r => r.year === item.year && r.type === item.type);
  if (index > -1) repeatItems.splice(index, 1);
  else repeatItems.push(item);
  localStorage.setItem("repeatItems", JSON.stringify(repeatItems));
}

/* LISTENERS */
document.getElementById("quiz-mode").onclick = () => { showQuestion(); showView("quiz-view"); };
document.getElementById("year-mode").onclick = () => { showYear(); showView("year-view"); };
document.getElementById("repeat-mode").onclick = () => { showRepeat(); showView("repeat-view"); };
document.getElementById("timeline-mode").onclick = showTimeline;

document.getElementById("toggle-answer").onclick = () => toggleAnswer("answer", "toggle-answer");
document.getElementById("toggle-year-answer").onclick = () => toggleAnswer("year-answer", "toggle-year-answer");
document.getElementById("toggle-repeat-answer").onclick = () => toggleAnswer("repeat-answer", "toggle-repeat-answer");

document.getElementById("next-question").onclick = showQuestion;
document.getElementById("next-year").onclick = showYear;
document.getElementById("next-repeat").onclick = showRepeat;

document.getElementById("mark-repeat").onclick = () => {
  toggleRepeat({ type: "quiz", year: currentQuestion.year, q: currentQuestion.q });
  updateRepeatBtn("mark-repeat", { type: "quiz", year: currentQuestion.year });
};
document.getElementById("mark-repeat-year").onclick = () => {
  toggleRepeat({ type: "year", year: currentYearEntry.year });
  updateRepeatBtn("mark-repeat-year", { type: "year", year: currentYearEntry.year });
};
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
