let data;
let currentSubject;
let currentRegent;

const subjectsDiv = document.getElementById("subjects");
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
  document.querySelectorAll(".view").forEach(v => {
    v.style.display = "none";
  });
  document.getElementById(id).style.display = "block";
}

/* SUBJECT */
function renderSubjects() {
  subjectsDiv.innerHTML = "";

  data.subjects.forEach(subject => {
    const btn = document.createElement("button");
    btn.textContent = subject.name;
    btn.onclick = () => {
      currentSubject = subject;
      renderRegents();
      show("regent-view");
    };
    subjectsDiv.appendChild(btn);
  });
}

/* REGENTS */
function renderRegents() {
  regentsDiv.innerHTML = "";

  currentSubject.categories[0].regents.forEach(regent => {
    const btn = document.createElement("button");
    btn.textContent = regent.name;
    btn.onclick = () => {
      currentRegent = regent;
      show("quiz-view");
      showQuestion();
    };
    regentsDiv.appendChild(btn);
  });
}

/* QUIZ */
function showQuestion() {
  const q =
    currentRegent.questions[
      Math.floor(Math.random() * currentRegent.questions.length)
    ];

  questionEl.textContent = q.q;

  const answer =
    currentRegent.timeline.find(t => t.year === q.year)?.event || "";

  answerEl.textContent = answer;
  answerEl.style.display = "none";
}

document.getElementById("show-answer").onclick = () => {
  answerEl.style.display = "block";
};

document.getElementById("next-question").onclick = showQuestion;

document.getElementById("back-to-subjects").onclick = () => {
  show("subject-view");
};

document.getElementById("back-to-regents").onclick = () => {
  show("regent-view");
};
