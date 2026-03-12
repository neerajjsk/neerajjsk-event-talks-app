document.addEventListener('DOMContentLoaded', () => {
  const scheduleContainer = document.getElementById('schedule');
  const searchInput = document.getElementById('searchInput');
  let talks = [];

  fetch('/api/talks')
    .then(response => response.json())
    .then(data => {
      talks = data;
      renderSchedule(talks);
    })
    .catch(error => {
      console.error('Error fetching talks:', error);
      scheduleContainer.innerHTML = '<p>Could not load schedule. Please try again later.</p>';
    });

  searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredTalks = talks.filter(talk => 
      talk.category.some(cat => cat.toLowerCase().includes(searchTerm))
    );
    renderSchedule(filteredTalks);
  });

  function formatTime(date) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  function renderSchedule(talksToRender) {
    scheduleContainer.innerHTML = '';
    let currentTime = new Date();
    currentTime.setHours(10, 0, 0, 0);

    talks.forEach((talk, index) => {
      const talkElement = document.createElement('div');
      talkElement.classList.add('talk');

      const startTime = new Date(currentTime);
      const endTime = new Date(startTime.getTime() + talk.duration * 60000);

      if (talksToRender.includes(talk)) {
        talkElement.innerHTML = `
          <div class="time">${formatTime(startTime)} - ${formatTime(endTime)}</div>
          <h2>${talk.title}</h2>
          <div class="speakers">By: ${talk.speakers.join(', ')}</div>
          <p>${talk.description}</p>
          <div class="category">
            ${talk.category.map(cat => `<span>${cat}</span>`).join('')}
          </div>
        `;
        scheduleContainer.appendChild(talkElement);
      }
      
      currentTime = new Date(endTime.getTime() + 10 * 60000); // 10 minute break

      if (index === 2) { // Lunch break after the 3rd talk
        const breakElement = document.createElement('div');
        breakElement.classList.add('break');
        const breakStartTime = new Date(currentTime);
        const breakEndTime = new Date(breakStartTime.getTime() + 60 * 60000);
        breakElement.innerHTML = `
          <div class="time">${formatTime(breakStartTime)} - ${formatTime(breakEndTime)}</div>
          <h2>Lunch Break</h2>
        `;
        scheduleContainer.appendChild(breakElement);
        currentTime = breakEndTime;
      }
    });
  }
});
