let data;
let currentSubject;
let currentCategory;
let currentRegent;
let currentQuestion;
let currentYearEntry;

let repeatQuestions = JSON.parse(localStorage.getItem("repeatQuestions") || "[]");

const subjectsDiv = document.getElementById("subjects");
const categoriesDiv = document.getElementById("categories");
const regentsDiv = document.getElementById("regents");

const questionEl = document.getElementById("question");
const answerEl = document.getElementById("answer");
const toggleAnswerBtn = document.getElementById("toggle-answer");
const markRepeatBtn = document.getElementById("mark-repeat");

const yearDisplay = document.getElementById("year-display");
const yearAnswer = document.getElementById("year-answer");

const timelineEl = document.getElementById("timeline");

const repeatQuestionEl = document.getElementById("repeat-question");
const repeatAnswerEl = document.getElementById("repeat-answer");

/* FETCH DATA */
fetch("questions.json")
  .then(r => r.json())
  .then(json => {
    data = json;
    renderSubjects();
  });

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

/* REGENT */
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

/* QUIZ */
function showQuestion() {
  const qs = currentRegent.questions;
  currentQuestion = qs[Math.floor(Math.random() * qs.length)];

  questionEl.textContent = currentQuestion.q;

  const yearData = currentRegent.timeline.find(t => t.year === currentQuestion.year);
  answerEl.textContent = yearData ? yearData.event : "—";

  answerEl.classList.add("hidden");
  toggleAnswerBtn.textContent = "Visa svar";

  updateRepeatIcon();
}

function updateRepeatIcon() {
  const exists = repeatQuestions.some(q => q.q === currentQuestion.q);
  markRepeatBtn.textContent = exists ? "🔁✅" : "🔁";
}

document.getElementById("quiz-mode").onclick = () => {
  showQuestion();
  showView("quiz-view");
};

toggleAnswerBtn.onclick = () => {
  const hidden = answerEl.classList.toggle("hidden");
  toggleAnswerBtn.textContent = hidden ? "Visa svar" : "Dölj svar";
};

document.getElementById("next-question").onclick = showQuestion;

markRepeatBtn.onclick = () => {
  const index = repeatQuestions.findIndex(q => q.q === currentQuestion.q);

  if (index === -1) {
    repeatQuestions.push(currentQuestion);
  } else {
    repeatQuestions.splice(index, 1);
  }

  localStorage.setItem("repeatQuestions", JSON.stringify(repeatQuestions));
  updateRepeatIcon();
};

/* YEAR QUIZ */
function showYear() {
  currentYearEntry =
    currentRegent.timeline[Math.floor(Math.random() * currentRegent.timeline.length)];

  yearDisplay.textContent = `Vad hände ${currentYearEntry.year}?`;
  yearAnswer.textContent = currentYearEntry.event;
  yearAnswer.classList.add("hidden");
}

document.getElementById("year-mode").onclick = () => {
  showYear();
  showView("year-view");
};

document.getElementById("toggle-year-answer").onclick = () => {
  yearAnswer.classList.toggle("hidden");
};

document.getElementById("next-year").onclick = showYear;

/* TIMELINE */
document.getElementById("timeline-mode").onclick = () => {
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
};

/* REPEAT */
function showRepeat() {
  if (repeatQuestions.length === 0) {
    repeatQuestionEl.textContent = "Inga markerade frågor ännu.";
    repeatAnswerEl.textContent = "";
    return;
  }
  const q = repeatQuestions[Math.floor(Math.random() * repeatQuestions.length)];
  repeatQuestionEl.textContent = q.q;

  const yearData = currentRegent.timeline.find(t => t.year === q.year);
  repeatAnswerEl.textContent = yearData ? yearData.event : "—";
  repeatAnswerEl.classList.add("hidden");
}

document.getElementById("repeat-mode").onclick = () => {
  showRepeat();
  showView("repeat-view");
};

document.getElementById("toggle-repeat-answer").onclick = () => {
  repeatAnswerEl.classList.toggle("hidden");
};

document.getElementById("next-repeat").onclick = showRepeat;

/* BACK */
document.getElementById("back-to-subjects").onclick = () => showView("subject-view");
document.getElementById("back-to-categories").onclick = () => showView("category-view");
document.getElementById("back-to-regents").onclick = () => showView("regent-view");
document.getElementById("back-to-modes").onclick = () => showView("mode-view");
document.getElementById("back-to-modes-2").onclick = () => showView("mode-view");
document.getElementById("back-to-modes-3").onclick = () => showView("mode-view");
document.getElementById("back-to-modes-3b").onclick = () => showView("mode-view");
document.getElementById("back-to-modes-4").onclick = () => showView("mode-view");
