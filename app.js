let data;

let currentSubject = null;
let currentCategory = null;
let currentRegent = null;

let currentQuestion = null;
let currentYearEntry = null;

/* ELEMENT */
const subjectsDiv = document.getElementById("subjects");
const categoriesDiv = document.getElementById("categories");
const regentsDiv = document.getElementById("regents");

const questionEl = document.getElementById("question");
const answerEl = document.getElementById("answer");

const yearDisplay = document.getElementById("year-display");
const yearAnswer = document.getElementById("year-answer");

const timelineEl = document.getElementById("timeline");

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

  data.subjects.forEach(subject => {
    const btn = document.createElement("button");
    btn.textContent = subject.name;
    btn.className = "choice-btn";

    btn.onclick = () => {
      currentSubject = subject;
      renderCategories();
      showView("category-view");
    };

    subjectsDiv.appendChild(btn);
  });
}

/* CATEGORIES */
function renderCategories() {
  categoriesDiv.innerHTML = "";

  currentSubject.categories.forEach(category => {
    const btn = document.createElement("button");
    btn.textContent = category.name;
    btn.className = "choice-btn";

    btn.onclick = () => {
      currentCategory = category;
      renderRegents();
      showView("regent-view");
    };

    categoriesDiv.appendChild(btn);
  });
}

/* REGENTS */
function renderRegents() {
  regentsDiv.innerHTML = "";

  currentCategory.regents.forEach(regent => {
    const btn = document.createElement("button");
    btn.textContent = regent.name;
    btn.className = "choice-btn";

    btn.onclick = () => {
      currentRegent = regent;
      document.getElementById("regent-title").textContent = regent.name;
      showView("mode-view");
    };

    regentsDiv.appendChild(btn);
  });
}

/* QUIZ */
function showQuestion() {
  currentQuestion =
    currentRegent.questions[
      Math.floor(Math.random() * currentRegent.questions.length)
    ];

  questionEl.textContent = currentQuestion.q;
  answerEl.textContent = getAnswer(currentQuestion.year);
  answerEl.classList.add("hidden");
}

/* YEAR QUIZ */
function showYear() {
  currentYearEntry =
    currentRegent.timeline[
      Math.floor(Math.random() * currentRegent.timeline.length)
    ];

  yearDisplay.textContent = `Vad hände ${currentYearEntry.year}?`;
  yearAnswer.textContent = currentYearEntry.event;
  yearAnswer.classList.add("hidden");
}

/* TIMELINE */
document.getElementById("timeline-mode").onclick = () => {
  timelineEl.innerHTML = "";

  currentRegent.timeline.forEach(t => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${t.year}</strong> – ${t.event}`;

    if (t.code) {
      const code = document.createElement("div");
      code.className = "code-box";
      code.textContent = `Minneskod: ${t.code}`;
      li.appendChild(code);
    }

    timelineEl.appendChild(li);
  });

  showView("timeline-view");
};

/* NAV */
document.getElementById("quiz-mode").onclick = () => {
  showQuestion();
  showView("quiz-view");
};

document.getElementById("year-mode").onclick = () => {
  showYear();
  showView("year-view");
};

document.getElementById("toggle-answer").onclick = () =>
  answerEl.classList.toggle("hidden");

document.getElementById("toggle-year-answer").onclick = () =>
  yearAnswer.classList.toggle("hidden");

document.getElementById("next-question").onclick = showQuestion;
document.getElementById("next-year").onclick = showYear;

/* BACK */
document.getElementById("back-to-subjects").onclick = () =>
  showView("subject-view");

document.getElementById("back-to-categories").onclick = () =>
  showView("category-view");

document.getElementById("back-to-regents").onclick = () =>
  showView("regent-view");

document.getElementById("back-to-modes").onclick = () =>
  showView("mode-view");

document.getElementById("back-to-modes-2").onclick = () =>
  showView("mode-view");

document.getElementById("back-to-modes-3").onclick = () =>
  showView("mode-view");

/* HELPERS */
function getAnswer(year) {
  const entry = currentRegent.timeline.find(t => t.year === year);
  return entry ? entry.event : "—";
}
