let data;
let currentSubject;
let currentQuestion;

const subjectsDiv = document.getElementById("subjects");
const questionEl = document.getElementById("question");
const answerEl = document.getElementById("answer");

fetch("questions.json")
  .then(response => response.json())
  .then(json => {
    data = json;
    renderSubjects();
  });

function renderSubjects() {
  subjectsDiv.innerHTML = "";
  data.subjects.forEach(subject => {
    const btn = document.createElement("button");
    btn.textContent = subject.name;
    btn.onclick = () => startQuiz(subject);
    subjectsDiv.appendChild(btn);
  });
}

function startQuiz(subject) {
  currentSubject = subject;
  document.getElementById("subject-view").classList.add("hidden");
  document.getElementById("quiz-view").classList.remove("hidden");
  nextQuestion();
}

function nextQuestion() {
  const questions = currentSubject.questions;
  currentQuestion =
    questions[Math.floor(Math.random() * questions.length)];

  questionEl.textContent = currentQuestion.q;
  answerEl.textContent = currentQuestion.a;
  answerEl.classList.add("hidden");
}

document.getElementById("show-answer").onclick = () => {
  answerEl.classList.remove("hidden");
};

document.getElementById("next-question").onclick = nextQuestion;

document.getElementById("back").onclick = () => {
  document.getElementById("quiz-view").classList.add("hidden");
  document.getElementById("subject-view").classList.remove("hidden");
};
