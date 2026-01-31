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

const repeatQuestionEl = document.getElementById("repeat-question");
const repeatAnswerEl = document.getElementById("repeat-answer");

/* FETCH */
fetch("questions.json")
  .then(r => r.json())
  .then(json => {
    data = json;
    renderSubjects();
    showView("subject-view");
  });

/* VIEW */
function showView(id) {
  document.querySelectorAll("div[id$='view']").forEach(v =>
    v.classList.add("hidden")
  );
  document.getElementById(id).classList.remove("hidden");
}

/* SUBJECTS */
function renderSubjects() {
  subjectsDiv.innerHTML = "";
  data.subjects.forEach(s => {
    const btn = document.createElement("button");
    btn.textContent = s.name;
    btn.onclick = () => {
      currentSubject = s;
      renderCategories();
      showView("category-view");
    };
    subjectsDiv.appendChild(btn);
  });
}

/* CATEGORIES */
function renderCategories() {
  categoriesDiv.innerHTML = "";
  currentSubject.categories.forEach(c => {
    const btn = document.createElement("button");
    btn.textContent = c.name;
    btn.onclick = () => {
      currentCategory = c;
      renderRegents();
      showView("regent-view");
    };
    categoriesDiv.appendChild(btn);
  });
}

/* REGENTS */
function renderRegents() {
  regentsDiv.innerHTML = "";
  currentCategory.regents.forEach(r => {
    const btn = document.createElement("button");
    btn.textContent = r.name;
    btn.onclick = () => {
      currentRegent = r;
      document.getElementById("regent-title").textContent = r.name;
      showView("mode-view");
    };
    regentsDiv.appendChild(btn);
  });
}

/* QUIZ */
function showQuestion() {
  currentQuestion =
    currentRegent.questions[Math.floor(Math.random() * currentRegent.questions.length)];
  questionEl.textContent = currentQuestion.q;
  answerEl.textContent = getAnswer(currentQuestion.year);
  answerEl.classList.add("hidden");
}

document.getElementById("mark-repeat").onclick = () => {
  toggleRepeat({ type: "quiz", year: currentQuestion.year, q: currentQuestion.q });
};

/* YEAR QUIZ */
function showYear() {
  currentYearEntry =
    currentRegent.timeline[Math.floor(Math.random() * currentRegent.timeline.length)];
  yearDisplay.textContent = `Vad hände ${currentYearEntry.year}?`;
  yearAnswer.textContent = currentYearEntry.event;
  yearAnswer.classList.add("hidden");
}

document.getElementById("mark-repeat-year").onclick = () => {
  toggleRepeat({ type: "year", year: currentYearEntry.year });
};

/* REPEAT */
function showRepeat() {
  if (repeatItems.length === 0) {
    repeatQuestionEl.textContent = "Inga repetitionsfrågor kvar 🎉";
    repeatAnswerEl.textContent = "";
    return;
  }

  currentRepeatItem =
    repeatItems[Math.floor(Math.random() * repeatItems.length)];

  if (currentRepeatItem.type === "quiz") {
    repeatQuestionEl.textContent = currentRepeatItem.q;
  } else {
    repeatQuestionEl.textContent = `Vad hände ${currentRepeatItem.year}?`;
  }

  repeatAnswerEl.textContent = getAnswer(currentRepeatItem.year);
  repeatAnswerEl.classList.add("hidden");
}

document.getElementById("remove-repeat").onclick = () => {
  repeatItems = repeatItems.filter(
    r => !(r.type === currentRepeatItem.type && r.year === currentRepeatItem.year)
  );
  localStorage.setItem("repeatItems", JSON.stringify(repeatItems));
  showRepeat();
};

/* HELPERS */
function toggleRepeat(item) {
  const exists = repeatItems.some(
    r => r.type === item.type && r.year === item.year
  );

  if (!exists) repeatItems.push(item);
  else repeatItems = repeatItems.filter(
    r => !(r.type === item.type && r.year === item.year)
  );

  localStorage.setItem("repeatItems", JSON.stringify(repeatItems));
}

function getAnswer(year) {
  const entry = currentRegent.timeline.find(t => t.year === year);
  return entry ? entry.event : "—";
}

/* MODES */
document.getElementById("quiz-mode").onclick = () => {
  showQuestion();
  showView("quiz-view");
};

document.getElementById("year-mode").onclick = () => {
  showYear();
  showView("year-view");
};

document.getElementById("repeat-mode").onclick = () => {
  showRepeat();
  showView("repeat-view");
};

/* TOGGLES */
document.getElementById("toggle-answer").onclick = () =>
  answerEl.classList.toggle("hidden");

document.getElementById("toggle-year-answer").onclick = () =>
  yearAnswer.classList.toggle("hidden");

document.getElementById("toggle-repeat-answer").onclick = () =>
  repeatAnswerEl.classList.toggle("hidden");

/* NEXT */
document.getElementById("next-question").onclick = showQuestion;
document.getElementById("next-year").onclick = showYear;
document.getElementById("next-repeat").onclick = showRepeat;

/* BACK */
document.getElementById("back-to-subjects").onclick = () => showView("subject-view");
document.getElementById("back-to-categories").onclick = () => showView("category-view");
document.getElementById("back-to-regents").onclick = () => showView("regent-view");
document.getElementById("back-to-modes").onclick = () => showView("mode-view");
document.getElementById("back-to-modes-2").onclick = () => showView("mode-view");
document.getElementById("back-to-modes-3").onclick = () => showView("mode-view");
