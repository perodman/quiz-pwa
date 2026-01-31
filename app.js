function renderRegents() {
  regentsDiv.innerHTML = "";

  // 🔀 Samtliga regenter
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

  // Enskilda regenter
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
