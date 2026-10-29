/* =========================================================
   ID CARD MANAGER 
   ========================================================= */

// Toggle input visibility when radio changes
function toggleCustomUrlInput() {
  const customRadio = document.querySelector('input[name="qrType"][value="custom"]');
  const customWrapper = document.getElementById('customUrlWrapper');
  if (customWrapper) {
    customWrapper.style.display = customRadio && customRadio.checked ? 'block' : 'none';
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  // Triggers fetch immediately on page load via your single promise
  const schoolDetails = await getSetting();

  // 1. Existing styling appliers
  if (typeof applyTemplateToCard === 'function') applyTemplateToCard(schoolDetails.template);
  if (typeof applyColorToCard === 'function') applyColorToCard(schoolDetails.color);
  if (typeof applyLogoToCard === 'function') applyLogoToCard(schoolDetails.logoUrl);
  if (typeof applyCoverToCard === 'function') applyCoverToCard(schoolDetails.coverUrl);

  // 2. Refill dynamic checkboxes using saved settings from getSetting()
  const savedFront = Array.isArray(schoolDetails.frontFields) ? schoolDetails.frontFields : DEFAULT_FRONT_KEYS;
  const savedBack = Array.isArray(schoolDetails.backFields) ? schoolDetails.backFields : DEFAULT_BACK_KEYS;
  initCardFieldSelectors(savedFront, savedBack);

  // 3. Populate QR Target Controls
  const qrType = schoolDetails.qrType || 'default';
  const customUrl = schoolDetails.qrCustomUrl || '';

  const radioToSelect = document.querySelector(`input[name="qrType"][value="${qrType}"]`);
  if (radioToSelect) radioToSelect.checked = true;

  const customUrlInput = document.getElementById('qrCustomUrl');
  if (customUrlInput) customUrlInput.value = customUrl;

  toggleCustomUrlInput();
});
/// Excluded Short Keys
const EXCLUDED_KEYS = ['y', 'z', 'A', 'B', 'D'];

// Standard Default Selected Keys (3 for Front, 4 for Back)
const DEFAULT_FRONT_KEYS = ['i', 'b', 'h']; // admissionNo, dob, class
const DEFAULT_BACK_KEYS = ['e', 'f', 'd', 'g'];  // fatherName, motherName, studentContact, address

// Sample Data for Live Card Preview
const SAMPLE_PREVIEW_DATA = {
  fullName: "PATHIRANA MUDALIGE DON KAVINDU LAKSHAN",
  dob: "14/08/2012",
  gender: "Male",
  studentContact: "0712345678",
  fatherName: "Pathirana Mudalige Don Sunil",
  motherName: "Silva Kumari",
  address: "No. 45, Temple Road, Kalubowila, Dehiwala",
  class: "Grade 10-B",
  admissionNo: "ADM-8921",
  birthCertNo: "COL/2012/54821",
  admissionYear: "2018",
  admissionGrade: "Grade 1",
  positionsHeld: "Junior Prefect",
  discipline: "Satisfactory",
  medical: "Asthma (Mild)",
  fatherNic: "753210984V",
  motherNic: "786543210V",
  guardianName: "Pathirana Mudalige Don Sunil",
  guardianNic: "753210984V",
  gnDivision: "535 - Kalubowila",
  dsDivision: "Dehiwala",
  lowIncome: "No",
  aswesuma: "Not Eligible",
  siblings: "1"
};

// Convert camelCase keys to clean UI Labels
function formatLabel(key) {
  const customMap = {
    dob: "Birthday",
    admissionNo: "Adm No",
    birthCertNo: "Birth Cert No",
    fatherNic: "Father NIC",
    motherNic: "Mother NIC",
    guardianNic: "Guardian NIC",
    gnDivision: "GN Division",
    dsDivision: "DS Division",
    fatherName:"Father",
    motherName:"Mother"
    
  };

  if (customMap[key]) return customMap[key];

  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, str => str.toUpperCase());
}

// Render dynamic checkboxes
function initCardFieldSelectors(savedFrontKeys = DEFAULT_FRONT_KEYS, savedBackKeys = DEFAULT_BACK_KEYS) {
  const frontContainer = document.getElementById('frontFieldsContainer');
  const backContainer = document.getElementById('backFieldsContainer');

  if (!frontContainer || !backContainer) return;

  frontContainer.innerHTML = '';
  backContainer.innerHTML = '';

  const studentMap = MODULE_FIELD_MAPS.students;

  Object.keys(studentMap).forEach(shortKey => {
    if (EXCLUDED_KEYS.includes(shortKey)) return;

    const fieldName = studentMap[shortKey];
    const labelText = formatLabel(fieldName);

    // Front Checkbox
    const frontChecked = savedFrontKeys.includes(shortKey) ? 'checked' : '';
    frontContainer.insertAdjacentHTML('beforeend', `
      <label class="checkbox-item">
        <input type="checkbox" name="frontFields" value="${shortKey}" ${frontChecked} onchange="updateCardPreview()">
        <span>${labelText}</span>
      </label>
    `);

    // Back Checkbox
    const backChecked = savedBackKeys.includes(shortKey) ? 'checked' : '';
    backContainer.insertAdjacentHTML('beforeend', `
      <label class="checkbox-item">
        <input type="checkbox" name="backFields" value="${shortKey}" ${backChecked} onchange="updateCardPreview()">
        <span>${labelText}</span>
      </label>
    `);
  });

  updateCardPreview();
}

// Helper to get currently checked short keys from DOM
function getSelectedFieldKeys(name) {
  return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(cb => cb.value);
}

// Live update the ID Card DOM preview
function updateCardPreview() {
  const frontBody = document.getElementById('frontCardBody');
  const backBody = document.getElementById('backCardBody');
  const studentMap = MODULE_FIELD_MAPS.students;

  // 1. Update Front Card
  if (frontBody) {
    const selectedFrontKeys = getSelectedFieldKeys('frontFields');
    frontBody.innerHTML = selectedFrontKeys.map(shortKey => {
      const fieldName = studentMap[shortKey];
      const label = formatLabel(fieldName);
      const val = SAMPLE_PREVIEW_DATA[fieldName] || 'N/A';
      return `
        <div class="info-row">
          <span class="label">${label}:</span>
          <span class="value">${val}</span>
        </div>
      `;
    }).join('');
  }

  // 2. Update Back Card
  if (backBody) {
    const selectedBackKeys = getSelectedFieldKeys('backFields');
    backBody.innerHTML = selectedBackKeys.map(shortKey => {
      const fieldName = studentMap[shortKey];
      const label = formatLabel(fieldName);
      const val = SAMPLE_PREVIEW_DATA[fieldName] || 'N/A';
      return `
        <p><strong>${label}:</strong> <span>${val}</span></p>
      `;
    }).join('');
  }
}

async function saveSetting() {
  if (!schoolId) {
    console.error("School ID missing!");
    return;
  }

  const frontCard = document.getElementById('frontCard');
  const selectElem = document.getElementById('templateSelect');

  const color = frontCard ? frontCard.getAttribute('data-color') || DEFAULT_COLOR : DEFAULT_COLOR;
  const template = selectElem ? selectElem.value || DEFAULT_TEMPLATE : DEFAULT_TEMPLATE;
  
  // Field Selections
  const frontFields = getSelectedFieldKeys('frontFields');
  const backFields = getSelectedFieldKeys('backFields');

  // QR Target Settings
  const selectedQrType = document.querySelector('input[name="qrType"]:checked')?.value || 'default';
  const qrCustomUrl = document.getElementById('qrCustomUrl')?.value.trim() || '';

  const payload = {
    template: template,
    color: color,
    frontFields: frontFields,
    backFields: backFields,
    qrType: selectedQrType,
    qrCustomUrl: qrCustomUrl,
    updatedAt: firebase.database.ServerValue.TIMESTAMP
  };

  try {
    db.goOnline()
    // 1. Save directly under details in Firebase
    await db.ref(`schools/${schoolId}/details`).update(payload);

    // 2. Save merged record back to IndexedDB
    if (typeof syncEngine !== 'undefined' && syncEngine) {
      const existingData = (await syncEngine.getSchoolDetails()) || {};
      
      const updatedLocalRecord = {
        ...existingData,
        id: 'info',
        template: template,
        color: color,
        frontFields: frontFields,
        backFields: backFields,
        qrType: selectedQrType,
        qrCustomUrl: qrCustomUrl
      };

      syncEngine.saveToIDB('schoolDetails', updatedLocalRecord);
    }

    console.log("Settings saved successfully.");
    alertbox("Settings saved successfully!", "success");
  } catch (err) {
    console.error("Failed to save settings:", err);
    alertbox("Error saving settings.", "error");
  }finally{
    db.goOffline()
  }
}

async function loadSavedSettings() {
  let savedFrontKeys = DEFAULT_FRONT_KEYS;
  let savedBackKeys = DEFAULT_BACK_KEYS;

  if (!schoolId) {
    console.error("School ID missing!");
    // Render defaults if schoolId is not available yet
    initCardFieldSelectors(savedFrontKeys, savedBackKeys);
    return;
  }

  try {
    db.goOnline()
    // 1. Fetch saved details directly from Firebase Realtime Database
    const snapshot = await db.ref(`schools/${schoolId}/details`).once('value');
    const details = snapshot.val();

    if (details) {
      // Restore saved template selection
      if (details.template) {
        const selectElem = document.getElementById('templateSelect');
        if (selectElem) selectElem.value = details.template;
      }

      // Restore saved color theme attribute
      if (details.color) {
        const frontCard = document.getElementById('frontCard');
        const backCard = document.getElementById('backCard');
        if (frontCard) frontCard.setAttribute('data-color', details.color);
        if (backCard) backCard.setAttribute('data-color', details.color);
      }

      // Restore saved checkbox fields arrays
      if (Array.isArray(details.frontFields)) {
        savedFrontKeys = details.frontFields;
      }
      if (Array.isArray(details.backFields)) {
        savedBackKeys = details.backFields;
      }
    }
  } catch (err) {
    console.error("Failed to load saved card settings from Firebase:", err);
  }finally{
    db.goOffline()
  }

  // 2. Render checkboxes with saved (or default) selections and update preview
  initCardFieldSelectors(savedFrontKeys, savedBackKeys);
}

// Trigger load on page startup or after schoolId is initialized
document.addEventListener('DOMContentLoaded', () => {
  loadSavedSettings();
});

// Apply Color Theme to DOM
function applyColorToCard(colorName) {
  const frontCard = document.getElementById('frontCard');
  const backCard = document.getElementById('backCard');

  if (frontCard) frontCard.setAttribute('data-color', colorName);
  if (backCard) backCard.setAttribute('data-color', colorName);

  // Update Active Swatch UI
  document.querySelectorAll('.color-box').forEach(btn => {
    btn.classList.toggle('active', btn.classList.contains(`color-${colorName}`));
  });
}

// Apply Template Theme to DOM
function applyTemplateToCard(templateId) {
  const frontCard = document.getElementById('frontCard');
  const backCard = document.getElementById('backCard');
  const selectElem = document.getElementById('templateSelect');

  const cleanClasses = (el) => {
    el.className = el.className.replace(/\btpl-\S+/g, '').trim();
    el.classList.add(templateId);
  };

  if (frontCard) cleanClasses(frontCard);
  if (backCard) cleanClasses(backCard);
  if (selectElem) selectElem.value = templateId;
}

// Handlers for UI Events (Applies locally; click saveSetting() button to sync to Firebase)
function applyAndSaveColor(colorName) {
  applyColorToCard(colorName);
}

function applyAndSaveTemplate(templateId) {
  applyTemplateToCard(templateId);
}

function applyLogoToCard(logoUrl) {
  console.log(logoUrl)
  const idLogo = document.getElementById('idLogo');
  if (idLogo && logoUrl) {
    idLogo.src = logoUrl+'?c';
  }
}

function applyCoverToCard(coverUrl) {
  const frontCard = document.getElementById('frontCard');
  if (!frontCard) return;

  // Ensure frontCard is positioned so the absolute background works
  if (getComputedStyle(frontCard).position === 'static') {
    frontCard.style.position = 'relative';
  }
  frontCard.style.overflow = 'hidden';

  // Find or create the background image element inside the card
  let bgImg = frontCard.querySelector('.card-bg-image');
  let gradientOverlay = frontCard.querySelector('.card-gradient-overlay');

  if (coverUrl) {
    if (!bgImg) {
      bgImg = document.createElement('img');
      bgImg.className = 'card-bg-image';
      bgImg.crossOrigin = 'anonymous'; // <--- THIS FIXES THE CORS ISSUE
      bgImg.style.cssText = 'position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center; z-index: 0;';
      frontCard.prepend(bgImg);
    }
    bgImg.src = coverUrl+'?c';

    if (!gradientOverlay) {
      gradientOverlay = document.createElement('div');
      gradientOverlay.className = 'card-gradient-overlay';
      gradientOverlay.style.cssText = 'position: absolute; inset: 0; background: linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.9)); z-index: 0; pointer-events: none;';
      frontCard.insertBefore(gradientOverlay, bgImg.nextSibling);
    }

    // Ensure your actual card content wrapper has z-index: 2 so it sits above the background & gradient
  } else {
    if (bgImg) bgImg.remove();
    if (gradientOverlay) gradientOverlay.remove();
    frontCard.style.background = '';
  }
}

auth.onAuthStateChanged(user => {
  const isLoginPage = window.location.pathname.endsWith('admin.html');
  if (!user && navigator.onLine && !isLoginPage) {
    window.location.href = 'admin.html';
  }
});
window.addEventListener("DOMContentLoaded", () => {
  new QRCode(document.getElementById("qrcode"), {
    text: "ID Sample",
    width: 90,
    height: 90,
    colorDark : "#000000",
    colorLight : "#ffffff",
    correctLevel : QRCode.CorrectLevel.H
  });

  if (typeof getSetting === 'function') {
    getSetting();
  }
});

function onTemplateChange(templateClass) {
  document.querySelectorAll('.id-card').forEach(card => {
    card.className = card.className.replace(/\btpl-\S+/g, '');
    card.classList.add(templateClass);
  });
}

// Handle color preset changes live in DOM
function onColorChange(colorName) {
  document.querySelectorAll('.id-card').forEach(card => {
    card.setAttribute('data-color', colorName);
  });
  document.querySelectorAll('.color-box').forEach(box => {
    box.classList.toggle('active', box.classList.contains(`color-${colorName}`));
  });
}