/* ... (behåll all tidigare logik) ... */

function showTimeline() {
  timelineEl.innerHTML = "";
  currentRegent.timeline.forEach(t => {
    const li = document.createElement("li");
    // Vi lägger årtalet i en strong-tagg för att det ska poppa i den nya designen
    li.innerHTML = `
      <strong>${t.year}</strong>
      <span>${t.event}</span>
      <br>
      <div class="code-box">Minneskod: ${t.code || "Saknas"}</div>
    `;
    timelineEl.appendChild(li);
  });
  showView("timeline-view");
}

/* ... (behåll resten av filen) ... */
