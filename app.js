let data;
let currentRegent;
let currentQuestion;
let currentYearEntry;
let currentRepeatItem;

let repeatItems = JSON.parse(localStorage.getItem("repeatItems") || "[]");

/* ELEMENTS */
const questionEl = document.getElementById("question");
const answerEl = document.getElementById("answer");
const yearDisplay = document.getElementById("year-display");
const yearAnswer = document.getElementById("year-answer");

const repeatQuestionEl = document.getElementById("repeat-question");
const repeatAnswerEl = document.getElementById("repeat-answer");

/* FETCH */
fetch("questions.json")
  .then(r => r.json())
  .then(json => {
    data = json;
    showView("subject-view"); // STARTAR ALLTID HÄR
  });

function showView(id) {
  document.querySelectorAll("div[id$='view']").forEach(v =>
    v.classList.add("hidden")
  );
  document.getElementById(id).classList.remove("hidden");
}

/* QUIZ */
function showQuestion() {
  currentQuestion =
    currentRegent.questions[Math.floor(Math.random() * currentRegent.questions.length)];
  questionEl.textContent = currentQuestion.q;
  answerEl.textContent = getAnswer(currentQuestion.year);
  answerEl.classList.add("hidden");
}

document.getElementById("mark-repeat").onclick = () => {
  toggleRepeat({ type: "quiz", ...currentQuestion });
};

/* YEAR QUIZ */
function showYear() {
  currentYearEntry =
    currentRegent.timeline[Math.floor(Math.random() * currentRegent.timeline.length)];
  yearDisplay.textContent = `Vad hände ${currentYearEntry.year}?`;
  yearAnswer.textContent = currentYearEntry.event;
  yearAnswer.classList.add("hidden");
}

document.getElementById("mark-repeat-year").onclick = () => {
  toggleRepeat({ type: "year", year: currentYearEntry.year });
};

/* REPEAT */
function showRepeat() {
  if (repeatItems.length === 0) {
    repeatQuestionEl.textContent = "Inga repetitionsfrågor kvar 🎉";
    repeatAnswerEl.textContent = "";
    return;
  }

  currentRepeatItem =
    repeatItems[Math.floor(Math.random() * repeatItems.length)];

  if (currentRepeatItem.type === "quiz") {
    repeatQuestionEl.textContent = currentRepeatItem.q;
  } else {
    repeatQuestionEl.textContent = `Vad hände ${currentRepeatItem.year}?`;
  }

  repeatAnswerEl.textContent = getAnswer(currentRepeatItem.year);
  repeatAnswerEl.classList.add("hidden");
}

document.getElementById("remove-repeat").onclick = () => {
  repeatItems = repeatItems.filter(
    r => !(r.type === currentRepeatItem.type && r.year === currentRepeatItem.year)
  );
  localStorage.setItem("repeatItems", JSON.stringify(repeatItems));
  showRepeat();
};

/* HELPERS */
function toggleRepeat(item) {
  const exists = repeatItems.some(
    r => r.type === item.type && r.year === item.year
  );

  if (!exists) repeatItems.push(item);
  else repeatItems = repeatItems.filter(
    r => !(r.type === item.type && r.year === item.year)
  );

  localStorage.setItem("repeatItems", JSON.stringify(repeatItems));
}

function getAnswer(year) {
  const entry = currentRegent.timeline.find(t => t.year === year);
  return entry ? entry.event : "—";
}

/* BUTTONS */
document.getElementById("quiz-mode").onclick = () => {
  showQuestion();
  showView("quiz-view");
};

document.getElementById("year-mode").onclick = () => {
  showYear();
  showView("year-view");
};

document.getElementById("repeat-mode").onclick = () => {
  showRepeat();
  showView("repeat-view");
};

document.getElementById("toggle-answer").onclick = () =>
  answerEl.classList.toggle("hidden");

document.getElementById("toggle-year-answer").onclick = () =>
  yearAnswer.classList.toggle("hidden");

document.getElementById("toggle-repeat-answer").onclick = () =>
  repeatAnswerEl.classList.toggle("hidden");

document.getElementById("next-question").onclick = showQuestion;
document.getElementById("next-year").onclick = showYear;
document.getElementById("next-repeat").onclick = showRepeat;

document.getElementById("back-to-modes").onclick = () => showView("mode-view");
document.getElementById("back-to-modes-2").onclick = () => showView("mode-view");
document.getElementById("back-to-modes-3").onclick = () => showView("mode-view");
