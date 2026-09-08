import { tabs, saveToStorage, todaysDate, getFormattedDate, colors } from './data/tabs.js';

renderTabs(tabs);

/* TAB DELCARATIONS */
const requiredTabInputEs = Array.from(document.querySelectorAll('.add-tab-popup .required'));
const charCountTabE = document.querySelector('.add-tab-popup .char-count');
const createTabBtnE = document.querySelector('.create-tab-btn');
const removeTabPopupBtnE = document.querySelector('.add-tab-popup-cover .close-popup-btn');
const months = [
  "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
];

/* ADD TAB POPUP */
document.querySelector('.add-tab-btn').addEventListener('click', () => {
  if (tabs.length < 10) {
    document.documentElement.classList.add('no-scroll');
    document.querySelector('.add-tab-popup-cover').classList.remove('display-none');
    document.querySelector('.add-tab-popup input').focus();
  }
});


updateCharCount(charCountTabE, requiredTabInputEs[0])
requiredTabInputEs[0].addEventListener('input', () => {
  updateCharCount(charCountTabE, requiredTabInputEs[0]);
});

document.querySelectorAll('.add-tab-popup-cover .single-input').forEach((inputContE) => {
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
      createTabBtnE.setAttribute('disabled', '');
    } else {
      createTabBtnE.removeAttribute('disabled');
    }
  }
});
createTabBtnE.addEventListener('click', () => {
  for (let i = 0; i < requiredTabInputEs.length; i++) {
    const requiredInputE = requiredTabInputEs[i];
    if (requiredInputE.value === '') {
      requiredInputE.focus()
      requiredInputE.setAttribute('required', '');
      requiredInputE.nextElementSibling.innerHTML = requiredInputE.validationMessage;
      createTabBtnE.setAttribute('disabled', '');
      return;
    }
  }
  createTab(requiredTabInputEs[0].value.trim(), document.querySelector('select').value);
  window.location.href = `./tabs.html?tabIndex=${tabs.length - 1}`;
  removePopup('.add-tab-popup-cover');
});

removeTabPopupBtnE.addEventListener('click', () => {
  removePopup('.add-tab-popup-cover')
});

document.querySelector('.add-tab-popup-cover').addEventListener('click', () => {
  removePopup('.add-tab-popup-cover');
});

document.querySelectorAll('.add-tab-popup-cover .single-input input').forEach((inputE) => {
  inputE.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      createTabBtnE.click();
    }
  })
});
document.querySelector('.add-tab-popup').addEventListener('click', (e) => {
  e.stopPropagation();
});


let html = '';
colors.forEach((color) => {
  html += `
    <option value="${color}" style="background-color: ${color};">${color}</option>
  `;
})

document.querySelector('.color-select-container').innerHTML = html;


/* FUNCTION DECLARATIONS */
function updateCharCount(charCountE, inputE) {
  charCountE.innerText = `${inputE.value.length}/${inputE.maxLength}`;
}

function removePopup(query) {
  document.querySelectorAll(`${query} .single-input input`).forEach((inputE) => {
    inputE.value = '';
    inputE.removeAttribute('required');
  });
  document.querySelector(query).classList.add('display-none');
  document.documentElement.classList.remove('no-scroll');
  createTabBtnE.removeAttribute('disabled')
}

/** 
 * @param {string} tabName
 * @param {string} tabColor
*/
function createTab(eventName, tabColor) {
  const tabObj = {
    name: eventName,
    color: tabColor,
    tasks: [],
    events: [],
    activityCalendar: {
      maxStreak: 0,
      activeStreak: 0,
      maxPoints: 0,
      currentPoints: 0,
      months: [
        { days: [] },
        { days: [] },
        { days: [] },
        { days: [] },
        { days: [] },
        { days: [] },
      ]
    },
    points: {},
  }
  tabObj.startDate = getFormattedDate(todaysDate);

  tabs.push(tabObj);

  saveToStorage();
  renderTabs(tabs);
}

function renderTabs(tabs) {
  let html = '';
  tabs.forEach((tab, index) => {
    const { name, color } = tab;
    html += `
    <a href='./tabs.html?tabIndex=${index}' tabindex='-1'>
      <button class="tab">
        <span class="color-circle" style="background-color: ${color};"></span><span>${name}</span>
      </button>
    </a>
      `;
  });
  document.querySelector('.tabs-container').innerHTML = html;
}