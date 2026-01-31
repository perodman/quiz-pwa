let data;
let currentSubject;
let currentCategory;
let currentRegent;

let activeQuestions = [];
let activeTimeline = [];
let currentQuestion;

/* ELEMENT */
const subjectsDiv = document.getElementById("subjects");
const categoriesDiv = document.getElementById("categories");
const regentsDiv = document.getElementById("regents");

const questionEl = document.getElementById("question");
const answerEl = document.getElementById("answer");
const timelineEl = document.getElementById("timeline");

const yearDisplay = document.getElementById("year-display");
const yearAnswer = document.getElementById("year-answer");

/* CODE MODE */
const regentCodeEl = document.getElementById("regent-code");
const yearCodeEl = document.getElementById("year-code");
const codeYearEl = document.getElementById("code-year");

/* LOAD */
fetch("questions.json")
  .then(r => r.json())
  .then(json => {
    data = json;
    renderSubjects();
  });

/* VIEW */
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
      activeQuestions = regent.questions || [];
      activeTimeline = regent.timeline || [];
      document.getElementById("regent-title").textContent = regent.name;
      showView("mode-view");
    };
    regentsDiv.appendChild(b);
  });
}

/* QUIZ */
function showQuestion() {
  if (activeQuestions.length === 0) {
    questionEl.textContent = "Inga frågor.";
    return;
  }
  currentQuestion =
    activeQuestions[Math.floor(Math.random() * activeQuestions.length)];
  questionEl.textContent = currentQuestion.q;
  answerEl.textContent = currentQuestion.a;
  answerEl.classList.add("hidden");
  document.getElementById("toggle-answer").textContent = "Visa svar";
}

document.getElementById("quiz-mode").onclick = () => {
  showQuestion();
  showView("quiz-view");
};

document.getElementById("toggle-answer").onclick = () => {
  const hidden = answerEl.classList.toggle("hidden");
  document.getElementById("toggle-answer").textContent =
    hidden ? "Visa svar" : "Dölj svar";
};

document.getElementById("next-question").onclick = showQuestion;

/* CODE MODE */
function showCodeYear() {
  if (activeTimeline.length === 0) {
    codeYearEl.textContent = "–";
    yearCodeEl.textContent = "";
    return;
  }

  const entry =
    activeTimeline[Math.floor(Math.random() * activeTimeline.length)];

  codeYearEl.textContent = entry.year;
  yearCodeEl.textContent = entry.code || "–";
  yearCodeEl.classList.add("hidden");
  document.getElementById("toggle-year-code").textContent = "Visa årskod";
}

document.getElementById("code-mode").onclick = () => {
  regentCodeEl.textContent = currentRegent.mnemonic || "–";
  regentCodeEl.classList.add("hidden");
  document.getElementById("toggle-regent-code").textContent = "Visa kod";

  showCodeYear();
  showView("code-view");
};

document.getElementById("toggle-regent-code").onclick = () => {
  const hidden = regentCodeEl.classList.toggle("hidden");
  document.getElementById("toggle-regent-code").textContent =
    hidden ? "Visa kod" : "Dölj kod";
};

document.getElementById("toggle-year-code").onclick = () => {
  const hidden = yearCodeEl.classList.toggle("hidden");
  document.getElementById("toggle-year-code").textContent =
    hidden ? "Visa årskod" : "Dölj årskod";
};

document.getElementById("next-code-year").onclick = showCodeYear;

/* TIMELINE */
document.getElementById("timeline-mode").onclick = () => {
  timelineEl.innerHTML = "";
  activeTimeline.forEach(t => {
    const li = document.createElement("li");
    li.textContent = `${t.year} – ${t.event}`;
    timelineEl.appendChild(li);
  });
  showView("timeline-view");
};

/* BACK */
document.getElementById("back-to-subjects").onclick = () => showView("subject-view");
document.getElementById("back-to-categories").onclick = () => showView("category-view");
document.getElementById("back-to-regents").onclick = () => showView("regent-view");
document.getElementById("back-to-modes").onclick = () => showView("mode-view");
document.getElementById("back-to-modes-2").onclick = () => showView("mode-view");
document.getElementById("back-to-modes-3").onclick = () => showView("mode-view");
document.getElementById("back-to-modes-code").onclick = () => showView("mode-view");
