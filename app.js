let data;
let currentSubject;
let currentCategory;
let currentRegent;
let currentQuestion;
let currentYearEntry;

/* ELEMENT */
const subjectsDiv = document.getElementById("subjects");
const categoriesDiv = document.getElementById("categories");
const regentsDiv = document.getElementById("regents");

const questionEl = document.getElementById("question");
const answerEl = document.getElementById("answer");
const timelineEl = document.getElementById("timeline");

const yearDisplay = document.getElementById("year-display");
const yearAnswer = document.getElementById("year-answer");

/* LOAD DATA */
fetch("questions.json")
  .then(r => r.json())
  .then(json => {
    data = json;
    renderSubjects();
  });

/* VIEW HANDLING */
function showView(id) {
  document.querySelectorAll("div[id$='view']").forEach(v =>
    v.classList.add("hidden")
  );
  document.getElementById(id).classList.remove("hidden");
}

/* SUBJECT */
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

/* CATEGORY */
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

  currentCategory.regents.forEach(regent => {
    const b = document.createElement("button");
    b.textContent = regent.name;
    b.onclick = () => {
      currentRegent = regent;
      document.getElementById("regent-title").textContent = regent.name;
      showView("mode-view");
    };
    regentsDiv.appendChild(b);
  });
}

/* QUIZ */
function showQuestion() {
  const qs = currentRegent.questions;
  if (!qs || qs.length === 0) {
    questionEl.textContent = "Inga frågor ännu.";
    answerEl.textContent = "";
    return;
  }
  currentQuestion = qs[Math.floor(Math.random() * qs.length)];
  questionEl.textContent = currentQuestion.q;
  answerEl.textContent = currentQuestion.a;
  answerEl.classList.add("hidden");
  document.getElementById("toggle-answer").textContent = "Visa svar";
}

/* YEAR QUIZ */
function showYear() {
  const timeline = currentRegent.timeline;
  if (!timeline || timeline.length === 0) {
    yearDisplay.textContent = "–";
    yearAnswer.textContent = "Ingen data.";
    return;
  }

  currentYearEntry =
    timeline[Math.floor(Math.random() * timeline.length)];

  yearDisplay.textContent = currentYearEntry.year;
  yearAnswer.textContent =
    currentYearEntry.event + `\n\n(Regent: ${currentRegent.name})`;

  yearAnswer.classList.add("hidden");
  document.getElementById("toggle-year-answer").textContent = "Visa svar";
}

/* BUTTONS */
document.getElementById("quiz-mode").onclick = () => {
  showQuestion();
  showView("quiz-view");
};

document.getElementById("timeline-mode").onclick = () => {
  timelineEl.innerHTML = "";
  currentRegent.timeline.forEach(t => {
    const li = document.createElement("li");
    li.textContent = `${t.year} – ${t.event}`;
    timelineEl.appendChild(li);
  });
  showView("timeline-view");
};

document.getElementById("year-quiz-mode").onclick = () => {
  showYear();
  showView("year-quiz-view");
};

document.getElementById("toggle-answer").onclick = () => {
  const hidden = answerEl.classList.toggle("hidden");
  document.getElementById("toggle-answer").textContent =
    hidden ? "Visa svar" : "Dölj svar";
};

document.getElementById("toggle-year-answer").onclick = () => {
  const hidden = yearAnswer.classList.toggle("hidden");
  document.getElementById("toggle-year-answer").textContent =
    hidden ? "Visa svar" : "Dölj svar";
};

document.getElementById("next-question").onclick = showQuestion;
document.getElementById("next-year").onclick = showYear;

/* BACK */
document.getElementById("back-to-subjects").onclick = () => showView("subject-view");
document.getElementById("back-to-categories").onclick = () => showView("category-view");
document.getElementById("back-to-regents").onclick = () => showView("regent-view");
document.getElementById("back-to-modes").onclick = () => showView("mode-view");
document.getElementById("back-to-modes-2").onclick = () => showView("mode-view");
document.getElementById("back-to-modes-3").onclick = () => showView("mode-view");
