let data;
let currentSubject;
let currentCategory;
let currentRegent;
let currentQuestion;

const subjectsDiv = document.getElementById("subjects");
const categoriesDiv = document.getElementById("categories");
const regentsDiv = document.getElementById("regents");

const regentTitle = document.getElementById("regent-title");
const questionEl = document.getElementById("question");
const answerEl = document.getElementById("answer");
const timelineEl = document.getElementById("timeline");

fetch("questions.json")
  .then(res => res.json())
  .then(json => {
    data = json;
    renderSubjects();
  });

function showView(viewId) {
  document.querySelectorAll("div[id$='view']").forEach(v =>
    v.classList.add("hidden")
  );
  document.getElementById(viewId).classList.remove("hidden");
}

/* ===== SUBJECTS ===== */
function renderSubjects() {
  subjectsDiv.innerHTML = "";
  data.subjects.forEach(subject => {
    const btn = document.createElement("button");
    btn.textContent = subject.name;
    btn.onclick = () => {
      currentSubject = subject;
      renderCategories();
      showView("category-view");
    };
    subjectsDiv.appendChild(btn);
  });
}

/* ===== CATEGORIES ===== */
function renderCategories() {
  categoriesDiv.innerHTML = "";
  currentSubject.categories.forEach(category => {
    const btn = document.createElement("button");
    btn.textContent = category.name;
    btn.onclick = () => {
      currentCategory = category;
      renderRegents();
      showView("regent-view");
    };
    categoriesDiv.appendChild(btn);
  });
}

/* ===== REGENTS ===== */
function renderRegents() {
  regentsDiv.innerHTML = "";
  currentCategory.regents.forEach(regent => {
    const btn = document.createElement("button");
    btn.textContent = `${regent.name} (${regent.regeringstid})`;

    if (!regent.hasDetails) {
      btn.disabled = true;
      btn.textContent += " 🔒";
    } else {
      btn.onclick = () => {
        currentRegent = regent;
        regentTitle.textContent = regent.name;
        showView("mode-view");
      };
    }

    regentsDiv.appendChild(btn);
  });
}

/* ===== QUIZ ===== */
function showQuestion() {
  const questions = currentRegent.questions;
  currentQuestion =
    questions[Math.floor(Math.random() * questions.length)];

  questionEl.textContent = currentQuestion.q;
  answerEl.textContent = currentQuestion.a;
  answerEl.classList.add("hidden");
}

document.getElementById("quiz-mode").onclick = () => {
  showQuestion();
  showView("quiz-view");
};

document.getElementById("show-answer").onclick = () => {
  const hidden = answerEl.classList.toggle("hidden");
  document.getElementById("show-answer").textContent =
    hidden ? "Visa svar" : "Dölj svar";
};

document.getElementById("next-question").onclick = showQuestion;

/* ===== TIMELINE ===== */
document.getElementById("timeline-mode").onclick = () => {
  timelineEl.innerHTML = "";

  currentRegent.timeline.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.year} – ${item.event}`;
    timelineEl.appendChild(li);
  });

  showView("timeline-view");
};

/* ===== BACK BUTTONS ===== */
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

/* ===== PWA ===== */
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}
