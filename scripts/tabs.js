import './shared.js';
import {
  tabs, saveToStorage, todaysDate, getFormattedDate, checkmarkTask, updateCalendar, renderCalendar, weekdays, months,
  hideEventsSection,
  showEventsSection,
  checkmarkAudio
} from './data/tabs.js';

const urlParams = new URLSearchParams(window.location.search);
export const tabIndex = urlParams.get("tabIndex");
/* TASK DECLARATIONS */
const requiredTaskInputEs = Array.from(document.querySelectorAll('.add-task-popup .required'));
const charCountTaskE = document.querySelector('.add-task-popup .char-count');
const createTaskBtnE = document.querySelector('.create-task-btn');
const removeTaskPopupBtnE = document.querySelector('.add-task-popup-cover .close-popup-btn');
/* EVENT DECLARATIONS */
const requiredEventInputEs = Array.from(document.querySelectorAll('.add-event-popup .required'));
const charCountEventE = document.querySelector('.add-event-popup .char-count');
const createEventBtnE = document.querySelector('.create-event-btn');
const removeEventPopupBtnE = document.querySelector('.add-event-popup-cover .close-popup-btn');

if (+tabIndex > tabs.length - 1 || +tabIndex < 0 || isNaN(+tabIndex) || !Number.isFinite(+tabIndex) || tabIndex === null) {

  document.querySelector('main').innerHTML = `
    <div class='no-tabs-box'>Select a Tab!</div>
  `;
} else {
  document.querySelectorAll('.tab')[tabIndex].classList.add('selected');
  document.querySelector('.tab-title').innerHTML = tabs[tabIndex].name;
  document.querySelector('.title-elem').innerHTML = `Task Manager - ${tabs[tabIndex].name}`;
  renderTasks(tabs[tabIndex].tasks);
  renderEvents(tabs[tabIndex].events);
  renderCalendar(tabs[+tabIndex].activityCalendar, tabs[tabIndex]);
  document.querySelector('main').setAttribute('style', `--tab-color: ${tabs[tabIndex].color}`);

  document.querySelector('.delete-tab-btn').addEventListener('click', () => {
    document.querySelector('.delete-tab-confirm-popup-cover .cancel-btn').addEventListener('click', removePopup);

    document.querySelector('.delete-tab-confirm-popup-cover').addEventListener('click', removePopup);

    document.querySelector('.delete-tab-confirm-popup').addEventListener('click', e => { e.stopPropagation() });

    document.querySelector('.delete-tab-confirm-popup-cover').classList.remove('display-none');

    document.querySelector('.delete-tab-confirm-popup .description').innerHTML = `Type "${tabs[tabIndex].name}" to Delete the Tab.`;

    document.documentElement.classList.add('no-scroll');

    function deleteItem() {
      if (document.querySelector('.delete-tab-confirm-popup input').value === tabs[tabIndex].name) {
        tabs.splice(tabIndex, 1);
        saveToStorage();
        window.location.href = './index.html';
        document.querySelector('.delete-tab-confirm-popup-cover').classList.add('display-none');
        document.querySelector('.delete-tab-confirm-popup-cover').classList.remove('no-scroll');
        document.querySelector('.delete-tab-confirm-popup .delete-btn')
          .removeEventListener('click', deleteItem);
      } else {
        document.querySelector('.delete-tab-confirm-popup input').setAttribute('required', '');
      }
    }
    document.querySelector('.delete-tab-confirm-popup .delete-btn')
      .addEventListener('click', deleteItem);

    document.querySelector('.delete-tab-confirm-popup input')
      .addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          deleteItem();
        }
      })

    function removePopup() {
      document.querySelector('.delete-tab-confirm-popup .delete-btn')
        .removeEventListener('click', deleteItem);
      document.querySelector('.delete-tab-confirm-popup-cover').classList.add('display-none');
      document.querySelector('.delete-tab-confirm-popup-cover').classList.remove('no-scroll');
      document.querySelector('.delete-tab-confirm-popup input').value = '';
      document.querySelector('.delete-tab-confirm-popup input').removeAttribute('required');
    }
  });



  /* ADD TASK POPUP */
  document.querySelector('.add-task-btn').addEventListener('click', () => {
    document.documentElement.classList.add('no-scroll');
    document.querySelector('.add-task-popup-cover').classList.remove('display-none');
    document.querySelector('.add-task-popup input').focus();
    charCountTaskE.innerHTML = '0/40'
  });

  updateCharCount(charCountTaskE, requiredTaskInputEs[0])
  requiredTaskInputEs[0].addEventListener('input', () => {
    updateCharCount(charCountTaskE, requiredTaskInputEs[0]);
  });

  document.querySelectorAll('.add-task-popup-cover .single-input').forEach((inputContE) => {
    /* HANDLE VALIDITY */
    const inputE = inputContE.querySelector('input');

    inputContE.querySelector('.error-text').innerHTML = inputE.validationMessage;
    inputE.removeAttribute('required');
    inputE.addEventListener('input', () => {
      handleValidity();
    });

    function handleValidity() {
      if (inputE.classList.contains('required')) {
        inputE.setAttribute('required', '');
      }
      if (!inputE.validity.valid) {
        inputContE.querySelector('.error-text').innerHTML = inputE.validationMessage;
      }
      if (Array.from(document.querySelectorAll('.single-input input')).some((inputE) => {
        return !inputE.validity.valid;
      })) {
        createTaskBtnE.setAttribute('disabled', '');
      } else {
        createTaskBtnE.removeAttribute('disabled');
      }
    }
  });
  createTaskBtnE.addEventListener('click', () => {
    for (let i = 0; i < requiredTaskInputEs.length; i++) {
      const requiredInputE = requiredTaskInputEs[i];
      if (requiredInputE.value === '') {
        requiredInputE.focus()
        requiredInputE.setAttribute('required', '');
        requiredInputE.nextElementSibling.innerHTML = requiredInputE.validationMessage;
        createTaskBtnE.setAttribute('disabled', '');
        return;
      }
    }
    createTask(requiredTaskInputEs[0].value.trim(), +requiredTaskInputEs[1].value, document.querySelectorAll('.add-task-popup-cover .single-input input')[2].value.trim(), tabIndex);
    removePopup('.add-task-popup-cover', '.create-task-btn');
  });

  removeTaskPopupBtnE.addEventListener('click', () => {
    removePopup('.add-task-popup-cover', '.create-task-btn')
  });

  document.querySelector('.add-task-popup-cover').addEventListener('click', () => {
    removePopup('.add-task-popup-cover', '.create-task-btn');
  });

  document.querySelectorAll('.add-task-popup-cover .single-input input').forEach((inputE) => {
    inputE.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        createTaskBtnE.click();
      }
    })
  });
  document.querySelector('.add-task-popup').addEventListener('click', (e) => {
    e.stopPropagation();
  });


  /* EVENT */

  document.querySelector('.add-event-btn').addEventListener('click', () => {
    document.documentElement.classList.add('no-scroll');
    document.querySelector('.add-event-popup-cover').classList.remove('display-none');
    document.querySelector('.add-event-popup input').focus()
  });

  document.querySelectorAll('.add-event-popup-cover input')[1].setAttribute('min', getFormattedDate(todaysDate))

  updateCharCount(charCountEventE, requiredEventInputEs[0])
  requiredEventInputEs[0].addEventListener('input', () => {
    updateCharCount(charCountEventE, requiredEventInputEs[0]);
  });

  document.querySelectorAll('.add-event-popup-cover .single-input').forEach((inputContE) => {
    /* HANDLE VALIDITY */
    const inputE = inputContE.querySelector('input');

    inputContE.querySelector('.error-text').innerHTML = inputE.validationMessage;
    inputE.removeAttribute('required');
    inputE.addEventListener('input', () => {
      handleValidity();
    });

    function handleValidity() {
      if (inputE.classList.contains('required')) {
        inputE.setAttribute('required', '');
      }
      if (!inputE.validity.valid) {
        inputContE.querySelector('.error-text').innerHTML = inputE.validationMessage;
      }
      if (Array.from(document.querySelectorAll('.single-input input')).some((inputE) => {
        return !inputE.validity.valid;
      })) {
        createEventBtnE.setAttribute('disabled', '');
      } else {
        createEventBtnE.removeAttribute('disabled');
      }
    }
  });

  createEventBtnE.addEventListener('click', () => {
    for (let i = 0; i < requiredEventInputEs.length; i++) {
      const requiredInputE = requiredEventInputEs[i];
      if (requiredInputE.value === '') {
        requiredInputE.focus()
        requiredInputE.setAttribute('required', '');
        requiredInputE.nextElementSibling.innerHTML = requiredInputE.validationMessage;
        createEventBtnE.setAttribute('disabled', '');
        return;
      }
    }
    createEvent(requiredEventInputEs[0].value, document.querySelectorAll('.add-event-popup-cover input')[1].value, tabIndex);
    removePopup('.add-event-popup-cover', '.create-event-btn');
  });

  removeEventPopupBtnE.addEventListener('click', () => {
    removePopup('.add-event-popup-cover', '.create-event-btn');
  });

  document.querySelector('.add-event-popup-cover').addEventListener('click', () => {
    removePopup('.add-event-popup-cover', '.create-event-btn');
  });

  document.querySelectorAll('.add-event-popup-cover .single-input input').forEach((inputE) => {
    inputE.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        createEventBtnE.click();
      }
    })
  });

  document.querySelector('.add-event-popup').addEventListener('click', (e) => {
    e.stopPropagation();
  });
}


/* FUNCTION DECLARATION */
/* FUNCTION DECLARATION */
/* FUNCTION DECLARATION */
/* FUNCTION DECLARATION */
/* FUNCTION DECLARATION */

function removePopup(query, createBtnQuery) {
  document.querySelectorAll(`${query} .single-input input`).forEach((inputE) => {
    inputE.value = '';
    inputE.removeAttribute('required');
  });
  document.querySelector(query).classList.add('display-none');
  document.documentElement.classList.remove('no-scroll');
  document.querySelector(createBtnQuery).removeAttribute('disabled')
}

function updateCharCount(charCountE, inputE) {
  charCountE.innerText = `${inputE.value.length}/${inputE.maxLength}`;
}

function makeDeletePopupInteractive(array, index, renderFunc, itemType) {
  document.querySelector('.delete-confirm-popup-cover .cancel-btn').addEventListener('click', () => {
    document.querySelector('.delete-confirm-popup .delete-btn')
      .removeEventListener('click', deleteItem);
    removeDeleteConfirmPopup();
  });
  document.querySelector('.delete-confirm-popup-cover').addEventListener('click', () => {
    document.querySelector('.delete-confirm-popup .delete-btn')
      .removeEventListener('click', deleteItem);
    removeDeleteConfirmPopup();
  });

  document.querySelector('.delete-confirm-popup').addEventListener('click', (e) => {
    e.stopPropagation();
  });

  document.querySelector('.delete-confirm-popup-cover').classList.remove('display-none');
  document.querySelector('.delete-confirm-popup .heading').innerHTML = `Delete ${itemType}?`;
  document.querySelector('.delete-confirm-popup .description').innerHTML = `Are you sure? You want to delete "${array[index].name}"`;
  document.documentElement.classList.add('no-scroll');

  function deleteItem() {
    array.splice(index, 1);
    saveToStorage();
    renderFunc(array);
    removeDeleteConfirmPopup();
    document.querySelector('.delete-confirm-popup .delete-btn')
      .removeEventListener('click', deleteItem);
  }
  document.querySelector('.delete-confirm-popup .delete-btn')
    .addEventListener('click', deleteItem);
}

function removeDeleteConfirmPopup() {
  document.querySelector('.delete-confirm-popup-cover').classList.add('display-none');
  document.documentElement.classList.remove('no-scroll');
}

/** 
 * @param {string} eventName
 * @param {string} eventDate
 * @param {number} tabIndex
*/
function createEvent(eventName, eventDate, tabIndex) {
  let isEmpty = true;
  for (let [index, item] of tabs[tabIndex].events.entries()) {
    if (!item.date || item.date && new Date(eventDate).getTime() <= new Date(item.date).getTime()) {
      tabs[tabIndex].events.splice(index, 0, {
        name: eventName,
        date: eventDate
      });
      isEmpty = false;
      break;
    }
  }
  if (isEmpty) {
    tabs[tabIndex].events.push({
      name: eventName,
      date: eventDate
    });
  }

  saveToStorage();
  renderEvents(tabs[tabIndex].events);
}
/** 
 * @param {string} taskName
 * @param {number} taskPoints
 * @param {string} taskURL
 * @param {number} tabIndex
*/
function createTask(taskName, taskPoints, taskURL, tabIndex) {
  tabs[tabIndex].tasks
    .unshift({
      name: taskName,
      points: taskPoints,
      url: taskURL,
      isCompleted: false,
    });

  saveToStorage();
  renderTasks(tabs[tabIndex].tasks);
}

function renderEvents(events) {
  let html = '';
  events.forEach((event) => {
    const { name, date } = event;
    const daysLeft = Math.round((new Date(date).getTime() - todaysDate.getTime()) / 24 / 3600_000);
    const eventDate = new Date(date);
    const dateString = date ? `${weekdays[eventDate.getDay()].slice(0, 3)} ${eventDate.getDate()} ${months[eventDate.getMonth()].slice(0, 3)} ${eventDate.getFullYear()} — ${daysLeft < 0 ? '0' : daysLeft} days left` : '' ;

    if (new Date(date) - 5 * 3600_000 >= new Date(todaysDate) || !date) {
      html += `
        <div class="event">
          <div class="event-date${dateString ? '' : 'display-none'}" >${dateString}</div>
          <div class="left">
            <div class="color-circle"></div>
            <div class="event-name">${name}</div>
          </div>
          <div class="right">
            <button class='delete-event-btn delete-btn'>
              <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110.61 122.88"><title>trash</title><path d="M39.27,58.64a4.74,4.74,0,1,1,9.47,0V93.72a4.74,4.74,0,1,1-9.47,0V58.64Zm63.6-19.86L98,103a22.29,22.29,0,0,1-6.33,14.1,19.41,19.41,0,0,1-13.88,5.78h-45a19.4,19.4,0,0,1-13.86-5.78l0,0A22.31,22.31,0,0,1,12.59,103L7.74,38.78H0V25c0-3.32,1.63-4.58,4.84-4.58H27.58V10.79A10.82,10.82,0,0,1,38.37,0H72.24A10.82,10.82,0,0,1,83,10.79v9.62h23.35a6.19,6.19,0,0,1,1,.06A3.86,3.86,0,0,1,110.59,24c0,.2,0,.38,0,.57V38.78Zm-9.5.17H17.24L22,102.3a12.82,12.82,0,0,0,3.57,8.1l0,0a10,10,0,0,0,7.19,3h45a10.06,10.06,0,0,0,7.19-3,12.8,12.8,0,0,0,3.59-8.1L93.37,39ZM71,20.41V12.05H39.64v8.36ZM61.87,58.64a4.74,4.74,0,1,1,9.47,0V93.72a4.74,4.74,0,1,1-9.47,0V58.64Z"/></svg>
            </button>
          </div>
        </div>
      `;
    }
  });
  if (events.length === 0) {
    html += `
      <div class="no-events-box">
        No events exist in this tab
      </div>
    `;
  }
  document.querySelector('.events-content').innerHTML = html;
  /* DELETE BUTTON */
  document.querySelectorAll('.delete-event-btn').forEach((deleteEventBtnE, index) => {
    deleteEventBtnE.addEventListener('click', () => {
      makeDeletePopupInteractive(tabs[tabIndex].events, index, renderEvents, 'Event');
    });
  });

  /* HIDE SHOW BUTTON */
  document.querySelector('.hide-show-btn').addEventListener('click', () => {
    if (document.querySelector('.events').classList.contains('hidden-section')) {
      showEventsSection();
      tabs[tabIndex].isEventsHidden = false;
    } else {
      hideEventsSection();
      tabs[tabIndex].isEventsHidden = true;
    }
    saveToStorage();
  });

  if (tabs[tabIndex].isEventsHidden) {
    hideEventsSection();
  } else {
    showEventsSection();
  }
}

function renderTasks(tasks) {
  let html = '';
  let haveTask = false;
  const tasksClone = structuredClone(tasks);

  for (let [index, task] of tasksClone.entries()) {
    const { name, url, isCompleted, points } = task;
    if (isCompleted) {
      tasks.splice(index, 1);
      continue;
    }
    haveTask = true;
    html += `
      <div class="task ${url ? '' : 'no-url'}">
        <label class="task-checkbox">
          <input type="checkbox" name="checkbox" class="task-checkbox-input" ${isCompleted ? 'checked' : ''} />
        </label>
        <div class="task-name">${name}</div>
        <div class="task-points">${points}</div>
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
        <button class='delete-task-btn delete-btn'>
          <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110.61 122.88"><title>trash</title><path d="M39.27,58.64a4.74,4.74,0,1,1,9.47,0V93.72a4.74,4.74,0,1,1-9.47,0V58.64Zm63.6-19.86L98,103a22.29,22.29,0,0,1-6.33,14.1,19.41,19.41,0,0,1-13.88,5.78h-45a19.4,19.4,0,0,1-13.86-5.78l0,0A22.31,22.31,0,0,1,12.59,103L7.74,38.78H0V25c0-3.32,1.63-4.58,4.84-4.58H27.58V10.79A10.82,10.82,0,0,1,38.37,0H72.24A10.82,10.82,0,0,1,83,10.79v9.62h23.35a6.19,6.19,0,0,1,1,.06A3.86,3.86,0,0,1,110.59,24c0,.2,0,.38,0,.57V38.78Zm-9.5.17H17.24L22,102.3a12.82,12.82,0,0,0,3.57,8.1l0,0a10,10,0,0,0,7.19,3h45a10.06,10.06,0,0,0,7.19-3,12.8,12.8,0,0,0,3.59-8.1L93.37,39ZM71,20.41V12.05H39.64v8.36ZM61.87,58.64a4.74,4.74,0,1,1,9.47,0V93.72a4.74,4.74,0,1,1-9.47,0V58.64Z"/></svg>
        </button>
      </div>
    `;
  };
  if (!haveTask) {
    html += `
    <div class="no-tasks-box">
      No tasks exist in this tab
    </div>
    `;
  }
  document.querySelector('.tasks-content').innerHTML = html;
  /* CHECKBOX */
  document.querySelectorAll('.task-checkbox-input').forEach((taskCheckboxE, index) => {
    taskCheckboxE.addEventListener('input', () => {
      if (taskCheckboxE.checked) {
        checkmarkAudio.play();

        tabs[tabIndex].tasks[index].isCompleted = true;
        taskCheckboxE.parentElement.classList.add('checked')
        updateCalendar(tabs[tabIndex].tasks[index].points, getFormattedDate(todaysDate), true, index, tabs[tabIndex]);
        setTimeout(() => {
          checkmarkTask(document.querySelectorAll('.task')[index], tabs[tabIndex].tasks, renderTasks, tabs[tabIndex]);
          if (document.querySelectorAll('.task:not(.display-none)').length === 0) {
            document.querySelector('.tasks-content').innerHTML += `
            <div class="no-tasks-box">
              No tasks exist in this tab
            </div>
          `;
          }
        }, 100);
      } else {
        tabs[tabIndex].tasks[index].isCompleted = false;
        taskCheckboxE.parentElement.classList.remove('checked')
        updateCalendar(tabs[tabIndex].tasks[index].points, getFormattedDate(todaysDate), false, index, tabs[tabIndex]);
      }
      saveToStorage()
      renderCalendar(tabs[tabIndex].activityCalendar, tabs[tabIndex]);
    })
  });
  /* REMOVE BUTTON */
  document.querySelectorAll('.delete-task-btn').forEach((deleteTaskBtnE, index) => {
    deleteTaskBtnE.addEventListener('click', () => {
      makeDeletePopupInteractive(tabs[tabIndex].tasks, index, renderTasks, 'Task');
    });
  });
}