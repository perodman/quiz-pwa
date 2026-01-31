let data;
let currentSubject;
let currentCategory;
let currentRegent;

let activeQuestions = [];
let activeTimeline = [];
let currentQuestion;
let currentYearEntry;

/* ELEMENTS */
const subjectsDiv = document.getElementById("subjects");
const categoriesDiv = document.getElementById("categories");
const regentsDiv = document.getElementById("regents");

const questionEl = document.getElementById("question");
const answerEl = document.getElementById("answer");

const yearDisplay = document.getElementById("year-display");
const yearAnswer = document.getElementById("year-answer");
const yearCodeEl = document.getElementById("year-code");

const timelineEl = document.getElementById("timeline");

/* LOAD DATA */
fetch("questions.json")
  .then(r => r.json())
  .then(json => {
    data = json;
    renderSubjects();
  });

/* VIEW HANDLER */
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
      activeQuestions = r.questions || [];
      activeTimeline = r.timeline || [];
      document.getElementById("regent-title").textContent = r.name;
      showView("mode-view");
    };
    regentsDiv.appendChild(b);
  });
}

/* QUIZ – NY LOGIK */
function showQuestion() {
  if (activeQuestions.length === 0) {
    questionEl.textContent = "Inga frågor.";
    answerEl.textContent = "";
    return;
  }

  currentQuestion =
    activeQuestions[Math.floor(Math.random() * activeQuestions.length)];

  questionEl.textContent = currentQuestion.q;

  // 🔑 HÄMTA SVAR FRÅN TIMELINE
  const entry = activeTimeline.find(
    t => t.year === currentQuestion.year
  );

  answerEl.textContent = entry
    ? entry.event
    : "Ingen information hittades för detta år.";

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

/* YEAR QUIZ (oförändrat) */
function showYear() {
  if (activeTimeline.length === 0) return;

  currentYearEntry =
    activeTimeline[Math.floor(Math.random() * activeTimeline.length)];

  yearDisplay.textContent = currentYearEntry.year;
  yearAnswer.textContent = currentYearEntry.event;
  yearCodeEl.textContent = currentYearEntry.code || "–";

  yearAnswer.classList.add("hidden");
  yearCodeEl.classList.add("hidden");

  document.getElementById("toggle-year-answer").textContent = "Visa svar";
  document.getElementById("toggle-year-code").textContent = "Visa kod";
}

document.getElementById("year-quiz-mode").onclick = () => {
  showYear();
  showView("year-quiz-view");
};

document.getElementById("toggle-year-answer").onclick = () => {
  const hidden = yearAnswer.classList.toggle("hidden");
  document.getElementById("toggle-year-answer").textContent =
    hidden ? "Visa svar" : "Dölj svar";
};

document.getElementById("toggle-year-code").onclick = () => {
  const hidden = yearCodeEl.classList.toggle("hidden");
  document.getElementById("toggle-year-code").textContent =
    hidden ? "Visa kod" : "Dölj kod";
};

document.getElementById("next-year").onclick = showYear;

/* TIMELINE */
document.getElementById("timeline-mode").onclick = () => {
  timelineEl.innerHTML = "";

  activeTimeline
    .sort((a, b) => a.year - b.year)
    .forEach(t => {
      const li = document.createElement("li");

      const text = document.createElement("div");
      text.textContent = `${t.year} – ${t.event}`;

      const code = document.createElement("div");
      code.textContent = t.code || "–";
      code.classList.add("hidden", "code-box");

      const btn = document.createElement("button");
      btn.textContent = "Visa kod";
      btn.onclick = () => {
        const hidden = code.classList.toggle("hidden");
        btn.textContent = hidden ? "Visa kod" : "Dölj kod";
      };

      li.appendChild(text);
      li.appendChild(btn);
      li.appendChild(code);
      timelineEl.appendChild(li);
    });

  showView("timeline-view");
};

/* BACK BUTTONS */
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
