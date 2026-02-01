let data;
let currentSubject;
let currentCategory;
let currentRegent;

const subjectsDiv = document.getElementById("subjects");
const categoriesDiv = document.getElementById("categories");
const regentsDiv = document.getElementById("regents");

const questionEl = document.getElementById("question");
const answerEl = document.getElementById("answer");

fetch("questions.json")
  .then(res => res.json())
  .then(json => {
    data = json;
    renderSubjects();
    show("subject-view");
  });

function show(id) {
  document.querySelectorAll(".view").forEach(v => v.style.display = "none");
  document.getElementById(id).style.display = "block";
}

/* SUBJECT */
function renderSubjects() {
  subjectsDiv.innerHTML = "";
  data.subjects.forEach(s => {
    const btn = document.createElement("button");
    btn.textContent = s.name;
    btn.onclick = () => {
      currentSubject = s;
      renderCategories();
      show("category-view");
    };
    subjectsDiv.appendChild(btn);
  });
}

/* CATEGORY */
function renderCategories() {
  categoriesDiv.innerHTML = "";
  currentSubject.categories.forEach(c => {
    const btn = document.createElement("button");
    btn.textContent = c.name;
    btn.onclick = () => {
      currentCategory = c;
      renderRegents();
      show("regent-view");
    };
    categoriesDiv.appendChild(btn);
  });
}

/* REGENT */
function renderRegents() {
  regentsDiv.innerHTML = "";
  currentCategory.regents.forEach(r => {
    const btn = document.createElement("button");
    btn.textContent = r.name;
    btn.onclick = () => {
      currentRegent = r;
      document.getElementById("regent-title").textContent = r.name;
      show("quiz-view");
      showQuestion();
    };
    regentsDiv.appendChild(btn);
  });
}

/* QUIZ */
function showQuestion() {
  const q = currentRegent.questions[
    Math.floor(Math.random() * currentRegent.questions.length)
  ];
  questionEl.textContent = q.q;
  answerEl.textContent =
    currentRegent.timeline.find(t => t.year === q.year)?.event || "";
  answerEl.style.display = "none";
}

document.getElementById("show-answer").onclick = () => {
  answerEl.style.display = "block";
};

document.getElementById("next-question").onclick = showQuestion;

document.getElementById("back-to-subjects").onclick = () => show("subject-view");
document.getElementById("back-to-categories").onclick = () => show("category-view");
document.getElementById("back-to-regents").onclick = () => show("regent-view");
