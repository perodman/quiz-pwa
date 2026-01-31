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
const toggleAnswerBtn = document.getElementById("toggle-answer");

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

/* REGENTS */
function renderRegents() {
  regentsDiv.innerHTML = "";

  currentCategory.regents.forEach(regent => {
    const button = document.createElement("button");
    button.textContent = regent.name;

    button.onclick = () => {
      currentRegent = regent;
      document.getElementById("regent-title").textContent = regent.name;
      showView("mode-view");
    };

    regentsDiv.appendChild(button);
  });
}

/* QUIZ */
function showQuestion() {
  const q = currentRegent.questions;
  currentQuestion = q[Math.floor(Math.random() * q.length)];
  questionEl.textContent = currentQuestion.q;
  answerEl.textContent = currentQuestion.a;
  answerEl.classList.add("hidden");
  toggleAnswerBtn.textContent = "Visa svar";
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

/* TIMELINE */
document.getElementById("timeline-mode").onclick = () => {
  timelineEl.innerHTML = "";
  currentRegent.timeline.forEach(t => {
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
