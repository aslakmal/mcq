/* =========================================================
   ID CARD MANAGER 
   ========================================================= */
const DEFAULT_TEMPLATE = 'tpl-modern';
const DEFAULT_COLOR = 'blue';
// Boot setup
// Variable to store the cached Promise
let settingsPromise = null;

// Fetch settings from Firebase (caches the Promise)
function getSetting() {
  if (!settingsPromise) {
    settingsPromise = (async () => {
      if (!schoolId) return { template: DEFAULT_TEMPLATE, color: DEFAULT_COLOR };

      try {
        const snapshot = await db.ref(`schools/${schoolId}/details`).once("value");
        const data = snapshot.val();
        if (data) {
          return data;
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      }

      return { template: DEFAULT_TEMPLATE, color: DEFAULT_COLOR };
    })();
  }
  return settingsPromise;
}

document.addEventListener("DOMContentLoaded", async () => {
  // Triggers fetch immediately on page load
  const schoolDetails = await getSetting();

  // Safely call styling functions if they exist on the current page
  applyTemplateToCard(schoolDetails.template);
  applyColorToCard(schoolDetails.color);
  applyLogoToCard(schoolDetails.logoUrl);
  applyCoverToCard(schoolDetails.coverUrl);
});
/// Excluded Short Keys
const EXCLUDED_KEYS = ['y', 'z', 'A', 'B', 'D'];

// Standard Default Selected Keys (3 for Front, 4 for Back)
const DEFAULT_FRONT_KEYS = ['i', 'b', 'h']; // admissionNo, dob, class
const DEFAULT_BACK_KEYS = ['e', 'f', 'd', 'g'];  // fatherName, motherName, studentContact, address

// Sample Data for Live Card Preview
const SAMPLE_PREVIEW_DATA = {
  fullName: "JOHN DOE",
  dob: "12/05/2012",
  gender: "Male",
  studentContact: "0771234567",
  fatherName: "Robert Doe",
  motherName: "Jane Doe",
  address: "123 School Lane, City",
  class: "10-A",
  admissionNo: "ADM-4502",
  birthCertNo: "BC-998811",
  admissionYear: "2018",
  admissionGrade: "Grade 1",
  positionsHeld: "Prefect",
  discipline: "Good",
  medical: "None",
  fatherNic: "851234567V",
  motherNic: "875643210V",
  guardianName: "Robert Doe",
  guardianNic: "851234567V",
  gnDivision: "GN-102",
  dsDivision: "DS-Puttalam",
  lowIncome: "No",
  aswesuma: "Eligible",
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

// Updated saveSettings function
async function saveSetting() {
  if (!schoolId) {
    console.error("School ID missing!");
    return;
  }

  const frontCard = document.getElementById('frontCard');
  const selectElem = document.getElementById('templateSelect');

  const color = frontCard ? frontCard.getAttribute('data-color') || DEFAULT_COLOR : DEFAULT_COLOR;
  const template = selectElem ? selectElem.value || DEFAULT_TEMPLATE : DEFAULT_TEMPLATE;

  // Get active selected short keys
  const frontFields = getSelectedFieldKeys('frontFields');
  const backFields = getSelectedFieldKeys('backFields');

  const payload = {
    template: template,
    color: color,
    frontFields: frontFields,
    backFields: backFields,
    updatedAt: firebase.database.ServerValue.TIMESTAMP
  };

  try {
    // 1. Save to Firebase details
    await db.ref(`schools/${schoolId}/details`).update(payload);

    // 2. Save to IndexedDB
    if (typeof syncEngine !== 'undefined' && syncEngine) {
      const existingData = (await syncEngine.getSchoolDetails()) || {};

      const updatedLocalRecord = {
        ...existingData,
        id: 'info',
        template: template,
        color: color,
        frontFields: frontFields,
        backFields: backFields
      };

      syncEngine.saveToIDB('schoolDetails', updatedLocalRecord);
    }

    console.log("Settings and field options saved successfully.");
    alertbox("Settings saved successfully!", "success");
  } catch (err) {
    console.error("Failed to save settings:", err);
    alertbox("Error saving settings.", "error");
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // If loading existing settings from IndexedDB/Firebase:
  // initCardFieldSelectors(savedData.frontFields, savedData.backFields);
  initCardFieldSelectors();
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
    idLogo.src = logoUrl;
  }
}

function applyCoverToCard(coverUrl) {
  const frontCard = document.getElementById('frontCard');
  if (frontCard) {
    if (coverUrl) {
      // Applies the background image with the white fade overlay
      frontCard.style.background = `linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.9)), url('${coverUrl}')`;
      frontCard.style.backgroundSize = 'cover';
      frontCard.style.backgroundPosition = 'center';
    } else {
      // Clears the background if no URL is provided
      frontCard.style.background = '';
    }
  }
}

