
export const colors = ['#006fff', '#009020', '#f59700', '#7c3aed', '#830000', '#2a00c3', '#00bba2'];
export const tabs = getFromStorage() || [];
export const todaysDate = new Date();
export const checkmarkAudio = new Audio('../assets/audio/checkmark.mp3');
export const weekdays = [
  "Sunday", "Monday", "Tuesday", "Wednesday",
  "Thursday", "Friday", "Saturday"
];
export const months = [
  "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
];

export function saveToStorage() {
  localStorage.setItem('tabs-array', JSON.stringify(tabs));
}

export function getFromStorage() {
  return JSON.parse(localStorage.getItem('tabs-array'));
}

export function getFormattedDate(date) {
  return `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}`;
}

export function checkmarkTask(taskE, tasks, renderTasks, tabObj) {
  let taskIndex;
  document.querySelectorAll('.task').forEach((taskElem, index) => {
    if (taskElem === taskE) {
      taskIndex = index;
    }
  });
  const taskObj = tasks[taskIndex];

  taskE.classList.add('display-none');

  document.querySelector('.popup-message').innerHTML = `
    <div class="text">You Completed "${taskObj.name}"</div>
    <button class="undo-btn">Undo</button>
  `;

  document.querySelector('.popup-message').classList.remove('hidden');
  document.querySelector('.popup-message .undo-btn').addEventListener('click', undoBtn);

  function undoBtn() {
    taskObj.isCompleted = false;
    document.querySelector('.popup-message').classList.add('hidden');
    updateCalendar(taskObj.points, getFormattedDate(todaysDate), false, taskIndex, tabObj);
    saveToStorage();
    renderTasks(tasks);
    document.querySelector('.popup-message .undo-btn').removeEventListener('click', undoBtn);
  }

  if (window.timeoutId) {
    clearTimeout(window.timeoutId);
  }

  window.timeoutId = setTimeout(() => {
    if (document.querySelectorAll('.task')[taskIndex].classList.contains('display-none')) {
      tasks.splice(taskIndex, 1);
      document.querySelector('.popup-message').classList.add('hidden');
      saveToStorage()
      renderTasks(tasks);
    }
  }, 10_000);
}

export function getMaxStreak(pointsObj, todaysDate, startDate) {
  let date = new Date(todaysDate);
  let streakCount = 0;
  let maxStreak = 0;
  
  while (new Date(date).getTime() >= new Date(startDate).getTime() - 5 * 3600_000) {
    if (pointsObj[getFormattedDate(date)] > 0) {
      streakCount++;
      if (streakCount > maxStreak) {
        maxStreak = streakCount;
      }
    } else {
      streakCount = 0;
    }
    date = new Date(date.getTime() - 24 * 3600_000);
  }
  return maxStreak;
}

export function getActiveStreak(pointsObj, todaysDate) {
  let newDate = new Date(todaysDate - 24 * 3600_000);
  let streakCount = 0;
  while (pointsObj[getFormattedDate(newDate)] > 0) {
    streakCount++;
    newDate = new Date(newDate - 24 * 3600_000);
  }

  if (pointsObj[getFormattedDate(new Date(todaysDate))] > 0) {
    streakCount++;
  }

  return streakCount;
}

export function updateCalendarStats(tabObj) {
  const pointsArray = Object.values(tabObj.points);

  let maxPoints = 0;
  for (let i = 0; i < pointsArray.length; i++) {
    if (pointsArray[i] > maxPoints) {
      maxPoints = pointsArray[i];
    }
  }
  tabObj.activityCalendar.maxPoints = maxPoints;
  tabObj.activityCalendar.currentPoints = tabObj.points[getFormattedDate(todaysDate)] ?? 0;
  tabObj.activityCalendar.activeStreak = getActiveStreak(tabObj.points, todaysDate);
  tabObj.activityCalendar.maxStreak = getMaxStreak(tabObj.points, todaysDate, tabObj.startDate);
}

export function updateCalendar(points, date, isCompleted, taskIndex, tabObj) {
  if (isCompleted) {
    tabObj.points[date] = (tabObj.points[date] ?? 0) + points;
    tabObj.tasks[taskIndex].markedDate = date;

  } else {
    const date = tabObj.tasks[taskIndex].markedDate;

    tabObj.points[date] = (tabObj.points[date] ?? 0) - points;
  }
  renderCalendar(tabObj.activityCalendar, tabObj);
}

export function renderCalendar(calendar, tab) {
  let monthsHtml = '';
  let maxPoints = 0;
  const firstMonth = todaysDate.getMonth() > 5 ? 6 : 0;

  for (let i = 0; i < tab.activityCalendar.months.length; i++) {
    const monthObj = tab.activityCalendar.months[i];
    const daysCount = new Date(todaysDate.getFullYear(), firstMonth + i + 1, 0).getDate();

    monthObj.name = months[firstMonth + i].slice(0, 3);
    monthObj.startDay = new Date(todaysDate.getFullYear(), firstMonth + i, 1).getDay();
    monthObj.days = [];
    for (let j = 0; j < daysCount; j++) {
      const date = new Date(todaysDate.getFullYear(), firstMonth + i, j + 1);
      const daysObj = monthObj.days;

      daysObj.push({
        date: getFormattedDate(date)
      });
    }

  }

  updateCalendarStats(tab);
  document.querySelector('.activity-calendar .heading').innerHTML = `Activity Calendar — ${new Date(calendar.months[0].days[0].date).getFullYear()}`

  calendar.months.forEach((month) => {
    month.days.forEach((day) => {
      const dayPoints = tab.points[day.date] ?? 0;
      if (dayPoints > maxPoints) {
        maxPoints = dayPoints;
      }
    });
  });

  calendar.months.forEach((month) => {
    let daysHtml = '';
    month.days.forEach((day) => {
      const date = new Date(day.date);
      const dayPoints = tab.points[day.date] ?? 0;
      let isToday = false;
      if (new Date(day.date).getFullYear() === todaysDate.getFullYear() && new Date(day.date).getMonth() === todaysDate.getMonth() && new Date(day.date).getDate() === todaysDate.getDate()) {
        isToday = true;
      }


      daysHtml += `
        <div class="day color${Math.round(dayPoints / (maxPoints || 1) * 9) + 1}${isToday ? ' today' : ''}" data-date="${day.date}">
          <div class="date-preview">${dayPoints} points — ${weekdays[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}</div>
        </div>
      `;
    });
    monthsHtml += `
      <div class="month" style="--start-day: ${month.startDay + 1};">
        <h2 class="heading">${month.name.slice(0, 3)}</h2>
        <div class="days">
          ${daysHtml}
        </div>
      </div>
    `;
  });


  document.querySelector('.calendar-content').innerHTML = `
    <div class="todays-stats">
      <div class="max-streak">
        <span class="name">Max Streak</span>
        <span class="value">${calendar.maxStreak}</span>
      </div>
      <div class="active-streak">
        <span class="name">Active Streak</span>
        <span class="value">${calendar.activeStreak}</span>
      </div>
      <div class="max-points">
        <span class="name">Max Points</span>
        <span class="value">${calendar.maxPoints}</span>
      </div>
      <div class="current-points">
        <span class="name">Current Points</span>
        <span class="value">${calendar.currentPoints}</span>
      </div>
    </div>
    <div class="year-container">
      <div class="months-container">
        <div class="days-bar">
          <span>Su</span>
          <span>Mo</span>
          <span>Tu</span>
          <span>We</span>
          <span>Th</span>
          <span>Fr</span>
          <span>Sa</span>
        </div>
        <div class="months-content">
          ${monthsHtml}
        </div>
      </div>
      <div class="points-levels">
        <span>less</span>
        <div class="color1"></div>
        <div class="color2"></div>
        <div class="color3"></div>
        <div class="color4"></div>
        <div class="color5"></div>
        <div class="color6"></div>
        <div class="color7"></div>
        <div class="color8"></div>
        <div class="color9"></div>
        <div class="color10"></div>
        <span>more</span>
      </div>
    </div>
  `;
}

export function hideEventsSection() {
  document.querySelector('.events-content').classList.add('display-none');
  document.querySelector('.add-event-btn').classList.add('display-none');
  document.querySelector('.events').classList.add('hidden-section');
}
export function showEventsSection() {
  document.querySelector('.events-content').classList.remove('display-none');
  document.querySelector('.add-event-btn').classList.remove('display-none');
  document.querySelector('.events').classList.remove('hidden-section');
}