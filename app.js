let data;
let currentSubject;
let currentCategory;
let currentRegent;

let currentQuestion;

/* 🔗 AKTIV DATAKÄLLA */
let activeQuestions = [];
let activeTimeline = [];

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
  data.subjects.forEach(subject => {
    const b = document.createElement("button");
    b.textContent = subject.name;
    b.onclick = () => {
      currentSubject = subject;
      renderCategories();
      showView("category-view");
    };
    subjectsDiv.appendChild(b);
  });
}

/* CATEGORY */
function renderCategories() {
  categoriesDiv.innerHTML = "";
  currentSubject.categories.forEach(category => {
    const b = document.createElement("button");
    b.textContent = category.name;
    b.onclick = () => {
      currentCategory = category;
      renderRegents();
      showView("regent-view");
    };
    categoriesDiv.appendChild(b);
  });
}

/* REGENTS + SAMTLIGA */
function renderRegents() {
  regentsDiv.innerHTML = "";

  /* 🔀 SAMTLIGA REGENTER */
  const allBtn = document.createElement("button");
  allBtn.textContent = "🔀 Samtliga regenter";
  allBtn.onclick = () => {
    activeQuestions = [];
    activeTimeline = [];

    currentCategory.regents.forEach(r => {
      if (r.questions) {
        r.questions.forEach(q =>
          activeQuestions.push({ ...q, from: r.name })
        );
      }
      if (r.timeline) {
        r.timeline.forEach(t =>
          activeTimeline.push({ ...t, regent: r.name })
        );
      }
    });

    document.getElementById("regent-title").textContent = "Samtliga regenter";
    showView("mode-view");
  };
  regentsDiv.appendChild(allBtn);

  /* ENSKILDA REGENTER */
  currentCategory.regents.forEach(regent => {
    const b = document.createElement("button");
    b.textContent = regent.name;
    b.onclick = () => {
      currentRegent = regent;
      activeQuestions = regent.questions || [];
      activeTimeline = (regent.timeline || []).map(t => ({
        ...t,
        regent: regent.name
      }));
      document.getElementById("regent-title").textContent = regent.name;
      showView("mode-view");
    };
    regentsDiv.appendChild(b);
  });
}

/* 🧠 QUIZ */
function showQuestion() {
  if (!activeQuestions || activeQuestions.length === 0) {
    questionEl.textContent = "Inga frågor ännu.";
    answerEl.textContent = "";
    return;
  }

  currentQuestion =
    activeQuestions[Math.floor(Math.random() * activeQuestions.length)];

  questionEl.textContent = currentQuestion.q;

  if (currentQuestion.from) {
    questionEl.textContent += `\n(${currentQuestion.from})`;
  }

  answerEl.textContent = currentQuestion.a;
  answerEl.classList.add("hidden");
  document.getElementById("toggle-answer").textContent = "Visa svar";
}

/* 📅 ÅRTALSQUIZ */
function showYear() {
  if (!activeTimeline || activeTimeline.length === 0) {
    yearDisplay.textContent = "–";
    yearAnswer.textContent = "Ingen data.";
    return;
  }

  // unika år
  const years = [...new Set(activeTimeline.map(t => t.year))];

  // slumpa år
  const year = years[Math.floor(Math.random() * years.length)];

  // alla händelser detta år
  const events = activeTimeline.filter(t => t.year === year);

  yearDisplay.textContent = year;

  yearAnswer.innerHTML = events
    .map(e => `• ${e.event} <em>(${e.regent})</em>`)
    .join("<br><br>");

  yearAnswer.classList.add("hidden");
  document.getElementById("toggle-year-answer").textContent = "Visa svar";
}

/* 📜 TIMELINE */
function showTimeline() {
  timelineEl.innerHTML = "";
  activeTimeline
    .sort((a, b) => a.year - b.year)
    .forEach(t => {
      const li = document.createElement("li");
      li.textContent = `${t.year} – ${t.event} (${t.regent})`;
      timelineEl.appendChild(li);
    });
}

/* BUTTONS */
document.getElementById("quiz-mode").onclick = () => {
  showQuestion();
  showView("quiz-view");
};

document.getElementById("timeline-mode").onclick = () => {
  showTimeline();
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
