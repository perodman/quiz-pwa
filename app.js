let data;

let currentSubject;
let currentCategory;
let currentRegent;

let currentQuestion;
let currentYearEntry;
let currentRepeatItem;

let repeatItems = JSON.parse(localStorage.getItem("repeatItems") || "[]");

/* ELEMENTS */
const subjectsDiv = document.getElementById("subjects");
const categoriesDiv = document.getElementById("categories");
const regentsDiv = document.getElementById("regents");

const questionEl = document.getElementById("question");
const answerEl = document.getElementById("answer");

const yearDisplay = document.getElementById("year-display");
const yearAnswer = document.getElementById("year-answer");

const timelineEl = document.getElementById("timeline");

const repeatQuestionEl = document.getElementById("repeat-question");
const repeatAnswerEl = document.getElementById("repeat-answer");

const markRepeatQuizBtn = document.getElementById("mark-repeat");
const markRepeatYearBtn = document.getElementById("mark-repeat-year");

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
  document.querySelectorAll(".view").forEach(v =>
    v.classList.add("hidden")
  );
  const target = document.getElementById(id);
  target.classList.remove("hidden");
  window.scrollTo(0, 0); // Scrolla upp för bäst animationseffekt
}

/* SUBJECTS */
function renderSubjects() {
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

/* CATEGORIES */
function renderCategories() {
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

/* REGENTS */
function renderRegents() {
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

/* QUIZ LOGIC */
function showQuestion() {
  currentQuestion =
    currentRegent.questions[Math.floor(Math.random() * currentRegent.questions.length)];

  questionEl.textContent = currentQuestion.q;
  answerEl.textContent = getAnswer(currentQuestion.year);
  answerEl.classList.add("hidden");

  updateRepeatButton(markRepeatQuizBtn, {
    type: "quiz",
    year: currentQuestion.year
  });
}

function showYear() {
  currentYearEntry =
    currentRegent.timeline[Math.floor(Math.random() * currentRegent.timeline.length)];

  yearDisplay.textContent = `Vad hände ${currentYearEntry.year}?`;
  yearAnswer.textContent = currentYearEntry.event;
  yearAnswer.classList.add("hidden");

  updateRepeatButton(markRepeatYearBtn, {
    type: "year",
    year: currentYearEntry.year
  });
}

function showTimeline() {
  timelineEl.innerHTML = "";
  currentRegent.timeline.forEach(t => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${t.year}</strong> – ${t.event}`;
    const code = document.createElement("div");
    code.className = "code-box";
    code.textContent = `Minneskod: ${t.code || "—"}`;
    li.appendChild(code);
    timelineEl.appendChild(li);
  });
  showView("timeline-view");
}

function showRepeat() {
  if (repeatItems.length === 0) {
    repeatQuestionEl.textContent = "Inga repetitionsfrågor kvar 🎉";
    repeatAnswerEl.textContent = "";
    return;
  }

  currentRepeatItem =
    repeatItems[Math.floor(Math.random() * repeatItems.length)];

  repeatQuestionEl.textContent =
    currentRepeatItem.type === "quiz"
      ? currentRepeatItem.q
      : `Vad hände ${currentRepeatItem.year}?`;

  repeatAnswerEl.textContent = getAnswer(currentRepeatItem.year);
  repeatAnswerEl.classList.add("hidden");
}

/* HELPERS */
function toggleRepeat(item) {
  const exists = repeatItems.some(
    r => r.type === item.type && r.year === item.year
  );

  repeatItems = exists
    ? repeatItems.filter(r => !(r.type === item.type && r.year === item.year))
    : [...repeatItems, { ...item, q: item.q || "" }];

  localStorage.setItem("repeatItems", JSON.stringify(repeatItems));
}

function updateRepeatButton(btn, item) {
  const exists = repeatItems.some(
    r => r.type === item.type && r.year === item.year
  );
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

document.getElementById("toggle-answer").onclick = () => answerEl.classList.toggle("hidden");
document.getElementById("toggle-year-answer").onclick = () => yearAnswer.classList.toggle("hidden");
document.getElementById("toggle-repeat-answer").onclick = () => repeatAnswerEl.classList.toggle("hidden");

document.getElementById("next-question").onclick = showQuestion;
document.getElementById("next-year").onclick = showYear;
document.getElementById("next-repeat").onclick = showRepeat;

markRepeatQuizBtn.onclick = () => {
  toggleRepeat({ type: "quiz", year: currentQuestion.year, q: currentQuestion.q });
  updateRepeatButton(markRepeatQuizBtn, { type: "quiz", year: currentQuestion.year });
};

markRepeatYearBtn.onclick = () => {
  toggleRepeat({ type: "year", year: currentYearEntry.year });
  updateRepeatButton(markRepeatYearBtn, { type: "year", year: currentYearEntry.year });
};

document.getElementById("remove-repeat").onclick = () => {
  repeatItems = repeatItems.filter(
    r => !(r.type === currentRepeatItem.type && r.year === currentRepeatItem.year)
  );
  localStorage.setItem("repeatItems", JSON.stringify(repeatItems));
  showRepeat();
};

/* BACK NAVIGATION */
document.getElementById("back-to-subjects").onclick = () => showView("subject-view");
document.getElementById("back-to-categories").onclick = () => showView("category-view");
document.getElementById("back-to-regents").onclick = () => showView("regent-view");
document.getElementById("back-to-modes").onclick = () => showView("mode-view");
document.getElementById("back-to-modes-2").onclick = () => showView("mode-view");
document.getElementById("back-to-modes-3").onclick = () => showView("mode-view");
document.getElementById("back-to-modes-4").onclick = () => showView("mode-view");
