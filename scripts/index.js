import './shared.js';
import { tabs, todaysDate, getFormattedDate, saveToStorage, checkmarkAudio, weekdays, months, getActiveStreak, getMaxStreak } from './data/tabs.js';

renderProgressOverview();
renderTasks();
renderEvents();
renderCalendar();




















/* FUNCTION DECLARATIONS */

function renderCalendar() {
  const firstMonth = todaysDate.getMonth() > 5 ? 6 : 0;
  const points = getCalendarPoints();
  const monthsData = [
    { days: [] },
    { days: [] },
    { days: [] },
    { days: [] },
    { days: [] },
    { days: [] },
  ];
  const startDate = getStartDate();
  const maxPoints = isFinite(Math.max(...Object.values(points))) 
    ? Math.max(...Object.values(points))
    : 0;
  const currentPoints = points[getFormattedDate(todaysDate)] ?? 0;
  const maxStreak = getMaxStreak(points, todaysDate, getFormattedDate(new Date(startDate)));
  const activeStreak = getActiveStreak(points, todaysDate);



  for (let i = 0; i < 6; i++) {
    const daysCount = new Date(todaysDate.getFullYear(), firstMonth + i + 1, 0).getDate();

    monthsData[i].name = months[firstMonth + i].slice(0, 3);

    for (let j = 0; j < daysCount; j++) {
      const date = new Date(todaysDate.getFullYear(), firstMonth + i, j + 1);

      if (j === 0) {
        monthsData[i].startDay = date.getDay();
      }

      monthsData[i].days.push({ date: getFormattedDate(date) });
    }
  }



  /* render */
  let monthsHtml = '';
  monthsData.forEach((month) => {
    let daysHtml = '';

    document.querySelector('.activity-calendar > .heading').innerHTML = `Activity Calendar — ${todaysDate.getFullYear()}`;
    month.days.forEach((day) => {
      const dayPoints = points[day.date] || 0;
      const isToday = day.date === getFormattedDate(todaysDate);
      const date = new Date(day.date);

      daysHtml += `
        <div class="day color${Math.round(dayPoints / (maxPoints || 1) * 9) + 1}${isToday ? ' today' : ''}" data-date="${day.date}">
          <div class="date-preview">${dayPoints} points — ${weekdays[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}</div>
        </div>
      `;
    });

    monthsHtml += `
      <div class="month" style="--start-day: ${month.startDay + 1};">
        <h2 class="heading">${month.name}</h2>
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
        <span class="value">${maxStreak}</span>
      </div>
      <div class="active-streak">
        <span class="name">Active Streak</span>
        <span class="value">${activeStreak}</span>
      </div>
      <div class="max-points">
        <span class="name">Max Points</span>
        <span class="value">${maxPoints}</span>
      </div>
      <div class="current-points">
        <span class="name">Current Points</span>
        <span class="value">${currentPoints}</span>
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

function getStartDate() {
  let date;
  tabs.forEach((tab) => {
    if (!date || new Date(tab.startDate) < new Date(date)) {
      date = tab.startDate;
    }
  });
  return date;
}

function getCalendarPoints() {
  const points = {};

  tabs.forEach((tab) => {
    for (let [key, value] of Object.entries(tab.points)) {
      if (!(key in points)) {
        points[key] = value;
      } else {
        points[key] += value;
      }
    }
  });
  return points;
}

function renderEvents() {
  let html = '';
  const events = [];

  tabs.forEach((tab) => {
    let eventCount = 0;

    tab.events.forEach((event) => {
      let isEmpty = false;
      const eventClone = structuredClone(event);
      eventClone.color = tab.color;

      if(eventCount < 2 && (!eventClone.date || new Date(eventClone.date) >= todaysDate)){
        events.push(eventClone);
      }
    });
  });

  events.sort((event, nextEvent) => {
    if(!event.date || new Date(event.date) > new Date(nextEvent.date)) {
      return 1;
    }
    return -1;
  });

  console.log(events)

  for (let [, event] of events.entries()) {
    const { name, date, color } = event;
    const dateObj = new Date(date);

    if (!!date) {

      const daysLeft = Math.round((dateObj - todaysDate.getTime()) / (24 * 3600_000));
      const dateString = `${weekdays[dateObj.getDay()].slice(0, 3)}, ${dateObj.getDate()} ${months[dateObj.getMonth()].slice(0, 3)} ${dateObj.getFullYear()} — ${daysLeft} days left`;

      html += `
        <div class="event" style="--tab-color: ${color}">
          <div class="event-date" >${dateString}</div>
          <div class="left">
            <div class="color-circle"></div>
            <div class="event-name">${name}</div>
          </div>
        </div>
      `;
    } else {

      html += `
        <div class="event" style="--tab-color: ${color}">
          <div class="left">
            <div class="color-circle"></div>
            <div class="event-name">${name}</div>
          </div>
        </div>
      `;
    }
  }
  if (events.length === 0) {
    html += `
      <div class="no-events-box">
        No events upcoming
      </div>
    `;
  }
  document.querySelector('.events-content').innerHTML = html;
}

function renderTasks() {

  let html = '';
  let haveTask = false;

  tabs.forEach((tab) => {
    for (let [, task] of tab.tasks.entries()) {
      if (!task.isCompleted) {
        haveTask = true;
        const { url, isCompleted, name } = task;

        html += `
          <div class="task ${url ? '' : 'no-url'}" style="--tab-color: ${tab.color};" data-tab-index="${tabs.indexOf(tab)}" data-task-index="${tab.tasks.indexOf(task)}">
            <label class="task-checkbox">
              <input type="checkbox" name="checkbox" class="task-checkbox-input" ${isCompleted ? 'checked' : ''} />
            </label>
            <div class="task-name">${name}</div>
            <a href="${url ?? 'javascript:void(0)'}" target="_blank" tabIndex>
              <button class="task-url">
                <svg  viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g id="Interface / External_Link">
                    <path id="Vector"
                      d="M10.0002 5H8.2002C7.08009 5 6.51962 5 6.0918 5.21799C5.71547 5.40973 5.40973 5.71547 5.21799 6.0918C5 6.51962 5 7.08009 5 8.2002V15.8002C5 16.9203 5 17.4801 5.21799 17.9079C5.40973 18.2842 5.71547 18.5905 6.0918 18.7822C6.5192 19 7.07899 19 8.19691 19H15.8031C16.921 19 17.48 19 17.9074 18.7822C18.2837 18.5905 18.5905 18.2839 18.7822 17.9076C19 17.4802 19 16.921 19 15.8031V14M20 9V4M20 4H15M20 4L13 11"
                      stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </g>
                </svg>
              </button>
            </a>
          </div>
        `;
        break;
      }
    }
  });
  if (!haveTask) {
    html = `
      <div class="no-tasks-box">
        No tasks pending
      </div>
    `;
  }

  document.querySelector('.tasks-content').innerHTML = html;

  document.querySelectorAll('.task').forEach((taskE) => {
    const tabIndex = taskE.dataset.tabIndex;
    const taskIndex = taskE.dataset.taskIndex;
    const popupMessageE = document.querySelector('.popup-message');

    taskE.querySelector('input[type="checkbox"]').addEventListener('input', (e) => {
      if (tabs[tabIndex].tasks[taskIndex].isCompleted) {
        tabs[tabIndex].tasks[taskIndex].isCompleted = false;

      } else {
        checkmarkAudio.currentTime = 0;
        checkmarkAudio.play();

        tabs[tabIndex].tasks[taskIndex].isCompleted = true;
        tabs[tabIndex].points[getFormattedDate(todaysDate)] += tabs[tabIndex].tasks[taskIndex].points;
        tabs[tabIndex].tasks[taskIndex].markedDate = getFormattedDate(todaysDate);
        taskE.classList.add('display-none');
        popupMessageE.innerHTML = `
          <div class="text">You Completed "${tabs[tabIndex].tasks[taskIndex].name}"</div>
          <button class="undo-btn">Undo</button>
        `;
        document.querySelector('.undo-btn').addEventListener('click', untick);
        popupMessageE.classList.remove('hidden');
        renderTasks();
        setTimeout(() => {
          if(taskE.classList.contains('display-none')) {
            taskE.remove();
            popupMessageE.classList.add('hidden');
          }
        }, 6000)
      }

      saveToStorage();
      renderProgressOverview();

      function untick() {

        tabs[tabIndex].tasks[taskIndex].isCompleted = false;
        e.target.checked = false;
        popupMessageE.classList.add('hidden');

        tabs[tabIndex].points[tabs[tabIndex].tasks[taskIndex].markedDate] -= tabs[tabIndex].tasks[taskIndex].points;

        renderTasks();
        saveToStorage();
        renderProgressOverview();
        
        document.querySelector('.undo-btn').removeEventListener('click', untick);
      }
    });
  });
}

function renderProgressOverview() {
  let obtPoints = 0;
  let remainPoints = 0;
  tabs.forEach((tab) => {
    obtPoints += tab.points[getFormattedDate(todaysDate)] ?? 0;
    tab.tasks.forEach((task) => {
      if (!task.isCompleted) {
        remainPoints += task.points;
      }
    });
  });
  const totalPoints = obtPoints + remainPoints;
  let html = '';
  const containerWidth = Math.round(+getComputedStyle(document.querySelector('.progress-bar-wrapper')).width.slice(0, -2));

  tabs.forEach((tab) => {
    const tabWidth = Math.round(containerWidth * ((tab.points[getFormattedDate(todaysDate)] ?? 0) / (totalPoints || 1)));
    html += `
      <div class="progress-bar" style="width:${tabWidth + 'px'}; --tab-color:${tab.color};">
        <div class="preview">${tab.name}, ${tab.points[getFormattedDate(todaysDate)] ?? 0} points, ${Math.round((tab.points[getFormattedDate(todaysDate)] ?? 0) * 100 / (totalPoints || 1))}%</div>
      </div>
    `;
  });

  document.querySelector('.progress-overview > .text').innerHTML = Math.round(100 * obtPoints / (totalPoints || 1)) + '%'
  document.querySelector('.progress-bar-wrapper').innerHTML = html;
}