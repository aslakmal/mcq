if (!schoolId) {
  alertbox("Missing school ID in URL", "error")
}

document.getElementById('addStudentBtn').href = `student_register.html?school=${schoolId}`;
const instituteType = localStorage.getItem('instituteType') || '';

if (instituteType === 'tuition') {
  document.querySelector('.btn-bulk-price').style.display = 'block';
} 
let cachedStudents = [];

// SELECTION STATE MAP (Tracks checked students by ID)
let selectedStudentIds = new Set();

// PAGINATION STATE
let currentPage = 1;
let pageSize = 50;
let searchDebounceTimer = null;

// GENERATE CLASS OPTIONS (1A to 11E)
function generateClassOptions() {
  const classList = document.getElementById('classList');
  const sections = ['A', 'B', 'C', 'D', 'E'];
  let optionsHtml = '';

  for (let grade = 1; grade <= 11; grade++) {
    for (const sec of sections) {
      optionsHtml += `<option value="${grade}${sec}"></option>`;
    }
  }
  classList.innerHTML = optionsHtml;
}

function restoreSearchState() {
  const savedSearch = sessionStorage.getItem(`search_${schoolId}`) || '';
  const savedClass = sessionStorage.getItem(`class_${schoolId}`) || '';

  document.getElementById('searchInput').value = savedSearch;
  document.getElementById('classInput').value = savedClass;
}

async function initApp() {
  generateClassOptions();
  restoreSearchState();

  try {
    // 1. Initialize IndexedDB database connection
    await syncEngine.initIndexedDB();

    // 2. Render immediately from IndexedDB for instant UI load (0ms latency, 0 bytes)
   await syncEngine.syncStudents();
   await loadFromIndexedDBDirect();

  } catch (err) {
    console.warn("Network / Sync init skipped (Offline Mode):", err);
  }
}

function loadFromIndexedDBDirect() {
  return new Promise((resolve) => {
    // Rely on syncEngine's local reader to avoid direct raw IndexedDB boilerplate
    syncEngine.getLocalData('students').then((students) => {
      if (students && students.length > 0) {
        cachedStudents = students;
        cachedStudents.forEach(s => selectedStudentIds.add(s.id || s.key));
        renderStudentTable(cachedStudents);
      }
      resolve();
    }).catch(() => resolve());
  });
}

async function renderStudentTable(students) {
  const tbody = document.getElementById('studentTableBody');
  const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
  const classTerm = document.getElementById('classInput').value.toLowerCase().trim();


  // 1. Filter students

  const filtered = students.filter(s => {
    const matchesNameOrId = !searchTerm ||
      (s.name && s.name.toLowerCase().includes(searchTerm)) ||
      (s.id && s.id.toLowerCase().includes(searchTerm));

    let matchesClass = true;
    if (classTerm) {
      const term = classTerm.toLowerCase().trim();
      const studentClass = (s.class || "").toLowerCase().trim();

      if (term === "1") {
        // Create the regex once per filter execution, or keep it static
        const grade1Regex = /(^|\D)1(\D|$)/;
        matchesClass = grade1Regex.test(studentClass);
      } else {
        matchesClass = studentClass.includes(term);
      }
    }

    return matchesNameOrId && matchesClass;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-state">${(searchTerm || classTerm) ? 'No matching students found.' : 'No students registered yet.'}</td></tr>`;
    renderPagination(0, 0);
    updateSelectionCounter();
    return;
  }

  // 2. Paginate filtered data
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedItems = filtered.slice(startIndex, endIndex);

  // 3. Render Table Rows with ID attribute & Selection Checkbox
  tbody.innerHTML = paginatedItems.map(s => {
    const photoUrl = s.photoUrl ? getFullCloudinaryUrl(s.photoUrl) : 'img/user.svg';
    const key = s.id || s.key;
    const isChecked = selectedStudentIds.has(key) ? 'checked' : '';

    return `
        <tr id="${key}">
          <!--<td class="checkbox-col" data-label="Select">
            <input type="checkbox" class="custom-checkbox student-checkbox" value="${key}" ${isChecked} onchange="toggleStudentSelection('${key}', this.checked)">
          </td>-->
          <td data-label="Student">
            <div class="student-info" onclick="openDetails('${key}','${schoolId}')">
              <img src="${photoUrl}" class="avatar" alt="${escapeHtml(s.name)}">
              <div>
                <strong>${escapeHtml(s.name)}</strong>
              </div>
            </div>
          </td>
          <td data-label="ID"><span class="badge-id">${escapeHtml(s.id || 'N/A')}</span></td>
          <td data-label="Class">${escapeHtml(s.class || 'N/A')}</td>
         <!-- <td data-label="Contact">${escapeHtml(s.studentContact || 'N/A')}</td>-->
          <td data-label="Actions">
          <div class="actions">
          <input type="checkbox"
          class="custom-checkbox student-checkbox"
          value="${key}"
          ${isChecked}
          onchange="toggleStudentSelection('${key}', this.checked)"
          hidden>
   
   <button type="button"
           class="action-btn select-checkbox"
           title="Select"
           onclick="this.previousElementSibling.click()">
       <svg viewBox="0 0 24 24">
           <path d="M5 12.5l4 4L19 7.5"/>
       </svg>
   </button>
    <button onclick="openIdCardModalByKey('${key}', this)"
            class="action-btn view"
            title="View ID">
        <svg viewBox="0 0 24 24">
            <rect x="3" y="5" width="18" height="14" rx="2"/>
            <circle cx="8" cy="11" r="2"/>
            <path d="M12 10h6M12 14h4"/>
        </svg>
    </button>

    <button onclick="openDetails('${key}','${schoolId}')"
            class="action-btn details"
            title="Details">
        <svg viewBox="0 0 24 24">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/>
            <circle cx="12" cy="12" r="3"/>
        </svg>
    </button>

    <a href="student_edit.html?school=${schoolId}&id=${key}"
       class="action-btn edit"
       title="Edit">
        <svg viewBox="0 0 24 24">
            <path d="M4 20h4L19 9l-4-4L4 16v4z"/>
            <path d="M13.5 6.5l4 4"/>
        </svg>
    </a>

    <button onclick="confirmDelete('${key}', '${escapeHtml(s.name)}')"
            class="action-btn delete"
            title="Delete">
        <svg viewBox="0 0 24 24">
            <path d="M4 7h16"/>
            <path d="M9 7V4h6v3"/>
            <path d="M7 7l1 13h8l1-13"/>
            <path d="M10 11v5M14 11v5"/>
        </svg>
    </button>

</div>
          </td>
        </tr>
      `;
  }).join('');

  renderPagination(totalItems, totalPages, startIndex + 1, endIndex);
  updateSelectionCounter(paginatedItems);
 //syncSelectAllCheckboxState(paginatedItems);
}

// SELECTION MANAGEMENT FUNCTIONS
function toggleStudentSelection(id, isChecked) {
  if (isChecked) {
    selectedStudentIds.add(id);
  } else {
    selectedStudentIds.delete(id);
  }

  // Re-sync "Select All" header state for current page
  const visibleCheckboxes = Array.from(document.querySelectorAll('.student-checkbox'));
  const allChecked = visibleCheckboxes.length > 0 && visibleCheckboxes.every(cb => cb.checked);
  //document.getElementById('selectAllCheckbox').checked = allChecked;

  // Update text counter for visible rows
  const visibleSelectedCount = visibleCheckboxes.filter(cb => cb.checked).length;
  document.getElementById('selectedCountText').innerText = `${visibleSelectedCount} student(s) selected`;
}

function toggleSelectAll(masterCheckbox) {
  const isChecked = masterCheckbox.checked;

  // Get all visible checkboxes on the active page DOM
  const visibleCheckboxes = document.querySelectorAll('.student-checkbox');

  visibleCheckboxes.forEach(cb => {
    cb.checked = isChecked;
    const id = cb.value;

    if (isChecked) {
      selectedStudentIds.add(id);
    } else {
      selectedStudentIds.delete(id);
    }
  });

  // Re-calculate selection text based on DOM inputs currently shown
  const visibleCount = isChecked ? visibleCheckboxes.length : 0;
  document.getElementById('selectedCountText').innerText = `${visibleCount} student(s) selected`;
}

function syncSelectAllCheckboxState(visibleStudents = []) {
  const selectAllCb = document.getElementById('selectAllCheckbox');

  if (visibleStudents.length === 0) {
    selectAllCb.checked = false;
    return;
  }

  // Header box is checked ONLY if every item on the current page is checked
  const allVisibleSelected = visibleStudents.every(s =>
    selectedStudentIds.has(s.id || s.key)
  );

  selectAllCb.checked = allVisibleSelected;
}

function updateSelectionCounter(visibleStudents = []) {
  const selectedVisibleCount = visibleStudents.filter(s =>
    selectedStudentIds.has(s.id || s.key)
  ).length;

  document.getElementById('selectedCountText').innerText =
    `${selectedVisibleCount} student(s) selected`;
}

function renderPagination(totalItems, totalPages, start, end) {
  const infoText = document.getElementById('paginationInfo');
  const controlsContainer = document.getElementById('paginationControls');

  if (totalItems === 0) {
    infoText.innerText = 'Showing 0 of 0 students';
    controlsContainer.innerHTML = '';
    return;
  }

  infoText.innerText = `Showing ${start}-${end} of ${totalItems} students`;

  let paginationHtml = `<button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="goToPage(${currentPage - 1})">Prev</button>`;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      paginationHtml += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      paginationHtml += `<span style="padding: 0 4px; color: #a0aec0;">...</span>`;
    }
  }

  paginationHtml += `<button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="goToPage(${currentPage + 1})">Next</button>`;

  controlsContainer.innerHTML = paginationHtml;
}

function goToPage(page) {
  currentPage = page;
  renderStudentTable(cachedStudents);
}

function handleSearchInput() {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    const searchValue = document.getElementById('searchInput').value;
    const classValue = document.getElementById('classInput').value;

    sessionStorage.setItem(`search_${schoolId}`, searchValue);
    sessionStorage.setItem(`class_${schoolId}`, classValue);

    currentPage = 1;
    renderStudentTable(cachedStudents);
  }, 200);
}

document.getElementById('searchInput').addEventListener('input', handleSearchInput);
document.getElementById('classInput').addEventListener('input', handleSearchInput);

document.getElementById('pageSizeSelect').addEventListener('change', (e) => {
  pageSize = parseInt(e.target.value, 10);
  currentPage = 1;
  renderStudentTable(cachedStudents);
});

/* ==========================================================================
   BULK ACTIONS LOGIC (EXAM SCORES & CLASS CHANGE)
   ========================================================================== */

/* function getSelectedStudents() {
  const filtered = getFilteredStudents(cachedStudents);
  return filtered.filter(s => selectedStudentIds.has(s.id || s.key));
}*/

function getSelectedStudents() {
  // Grab all checked student checkboxes currently rendered in the table
  const checkedBoxes = Array.from(document.querySelectorAll('.student-checkbox:checked'));
  const visibleSelectedIds = new Set(checkedBoxes.map(cb => cb.value));

  // Filter cachedStudents to return only those visible, checked students
  return cachedStudents.filter(s => visibleSelectedIds.has(s.id || s.key));
}

/*  function getFilteredStudents(students = cachedStudents) {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const classTerm = document.getElementById('classInput').value.toLowerCase().trim();
  
    return students.filter(s => {
      const matchesNameOrId = !searchTerm ||
        (s.name && s.name.toLowerCase().includes(searchTerm)) ||
        (s.id && s.id.toLowerCase().includes(searchTerm));
  
      const matchesClass = !classTerm ||
        (s.class && s.class.toLowerCase().includes(classTerm));
  
      return matchesNameOrId && matchesClass;
    });
  }*/

// 1. BULK SCORE MODAL
/* ==========================================================================
   UPDATED BULK EXAM SCORE LOGIC (WITH INDEXEDDB / FIREBASE FALLBACK FETCH)
   ========================================================================== */

// Helper to fetch single student record from IndexedDB directly
function getStudentFromIDB(studentId) {
  return new Promise((resolve) => {
    const dbName = `SIS_${schoolId}`;
    const request = indexedDB.open(dbName);

    request.onsuccess = (e) => {
      const idb = e.target.result;
      if (!idb.objectStoreNames.contains('students')) {
        resolve(null);
        return;
      }

      const tx = idb.transaction('students', 'readonly');
      const store = tx.objectStore('students');
      const getReq = store.get(studentId);

      getReq.onsuccess = () => resolve(getReq.result || null);
      getReq.onerror = () => resolve(null);
    };

    request.onerror = () => resolve(null);
  });
}

// Opens modal & populates initial student list
async function openBulkScoreModal() {
  const schoolData = await getSetting();
  if(schoolData){populateExamDropdowns(schoolData.exams);}
  const selectedList = getSelectedStudents();
 
  if (selectedList.length === 0) {
    alertbox("Please select at least one student to add or edit exam scores.", "error");
    return;
  }
console.log(selectedList)
  const container = document.getElementById('bulkScoreStudentList');
  container.innerHTML = selectedList.map(s => {
    const key = s.id || s.key;
    const photoUrl = s.photoUrl ? getFullCloudinaryUrl(s.photoUrl) : 'img/user.svg';

    return `
    <div class="score-list-item" data-id="${key}">
      <div class="score-student-detail">
        <img src="${photoUrl}" class="avatar" alt="${escapeHtml(s.name)}">
        <div>
          <strong>${escapeHtml(s.name)}</strong>
          <div style="font-size: 0.78rem; color: #718096;">ID: ${escapeHtml(s.id || 'N/A')}</div>
        </div>
      </div>
      <div>
        <input type="number" min="0" max="100" class="score-input student-score-field" disabled placeholder="Score" data-id="${key}" oninput="validateScore(this)">
      </div>
    </div>
  `;
  }).join('');

  document.getElementById('bulkScoreModal').style.display = 'flex';

  // Auto fetch initial scores for selected semester & subject
  await fetchAndUpdateModalScores();
}
async function checkOptions() {
  const sem = document.getElementById('scoreSemesterSelect');
  const subject = document.getElementById('scoreSubjectSelect');
  if (sem.options.length <= 1||subject.options.length <= 1) {
    alertbox("Should add exams and subjects in principal dashboard","error");
}
}

// Fetches scores (IndexedDB -> Firebase -> Memory Fallback) when Semester/Subject dropdown changes
async function fetchAndUpdateModalScores() {
  const sem = document.getElementById('scoreSemesterSelect').value;
  const subject = document.getElementById('scoreSubjectSelect').value;
  const scoreInputs = document.querySelectorAll('.student-score-field');
  
  const enableInputs = sem !== "" && subject !== "";
  for (const input of scoreInputs) {
    input.disabled = !enableInputs;
    const studentId = input.getAttribute('data-id');
    let existingScore = null;

    // 1. Check IndexedDB first
    const idbStudent = await getStudentFromIDB(studentId);
    if (idbStudent && idbStudent.exam && idbStudent.exam[`${sem}`] && idbStudent.exam[`${sem}`][subject] !== undefined) {
      existingScore = idbStudent.exam[`${sem}`][subject];

    }


    // 3. Fallback to cached memory array
    if (existingScore === null) {
      const memoryStudent = cachedStudents.find(s => (s.id || s.key) === studentId);
      if (memoryStudent && memoryStudent.exam && memoryStudent.exam[`${sem}`] && memoryStudent.exam[`${sem}`][subject] !== undefined) {
        existingScore = memoryStudent.exam[`${sem}`][subject];
      }
    }

    // Populate score or leave clear for new entry
    input.value = existingScore !== null ? existingScore : '';
  }
}

// Writes updated scores to Firebase & updates local memory/cache
async function submitBulkScores() {
  const sem = document.getElementById('scoreSemesterSelect').value;
  const subject = document.getElementById('scoreSubjectSelect').value;
  const scoreInputs = document.querySelectorAll('.student-score-field');

  const updates = {};
  let validCount = 0;

  const now = Date.now();
  const userId = firebase.auth().currentUser ? firebase.auth().currentUser.uid : 'system';

  scoreInputs.forEach(input => {
    const studentId = input.getAttribute('data-id');
    const scoreVal = input.value.trim();

    if (scoreVal !== '') {
      const numericScore = Number(scoreVal);
      const basePath = `schools/${schoolId}/students/${studentId}`;

      // 1. Build multi-path update payload (z: exam, A: updatedAt, B: updatedBy)
      updates[`${basePath}/z/${sem}/${subject}`] = numericScore;
      updates[`${basePath}/A`] = firebase.database.ServerValue.TIMESTAMP;
      updates[`${basePath}/B`] = userId;

      // 2. Local memory state synchronization (readable keys)
      const studentObj = cachedStudents.find(s => (s.id || s.key) === studentId);
      if (studentObj) {
        if (!studentObj.exam) studentObj.exam = {};
        if (!studentObj.exam[`${sem}`]) studentObj.exam[`${sem}`] = {};

        studentObj.exam[`${sem}`][subject] = numericScore;
        studentObj.updatedAt = now;
        studentObj.updatedBy = userId;

        // 3. Save to local IndexedDB directly for instant offline persistence
        syncEngine.saveToIDB('students', studentObj);

      }
      validCount++;
    }
  });

  if (validCount === 0) {
    alertbox("Please enter a score for at least one student.", "error");
    return;
  }

  try {  
    db.goOnline();
    await db.ref().update(updates);
    alertbox(`Successfully saved/updated scores for ${validCount} student(s).`, "success");
  //  closeModal('bulkScoreModal');
  } catch (err) {
    alertbox("Failed to save scores: " + err.message, "error");
  }finally{
    db.goOffline();
  }
}

function openBulkClassModal() {
  const selectedList = getSelectedStudents();
  if (selectedList.length === 0) {
    alertbox("Please select at least one student to change class.", "error");
    return;
  }
  document.getElementById('newClassInput').value = '';
  document.getElementById('bulkClassModal').style.display = 'flex';
}

async function submitBulkClassChange() {
  const newClass = document.getElementById('newClassInput').value.trim().toUpperCase();
  if (!newClass) {
    alertbox("Please enter a valid class name.", "error");
    return;
  }

  const selectedList = getSelectedStudents();
  if (selectedList.length === 0) {
    alertbox("No students selected.", "error");
    return;
  }

  const updates = {};
  const now = Date.now();
  const userId = firebase.auth().currentUser ? firebase.auth().currentUser.uid : 'system';

  // 1. Build multi-path update payload using short keys (h: class, A: updatedAt, B: updatedBy)
  selectedList.forEach(s => {
    const key = s.id || s.key;
    const basePath = `schools/${schoolId}/students/${key}`;

    updates[`${basePath}/h`] = newClass;
    updates[`${basePath}/A`] = firebase.database.ServerValue.TIMESTAMP;
    updates[`${basePath}/B`] = userId;

    // 2. Update local in-memory student objects (with readable keys)
    s.class = newClass;
    s.updatedAt = now;
    s.updatedBy = userId;
    syncEngine.saveToIDB('students', s);

  });

  try {
    db.goOnline();
      await db.ref().update(updates);
    // 5. Re-render UI
    renderStudentTable(cachedStudents);
    alertbox(`Updated ${selectedList.length} student(s) to Class ${newClass}.`, "success");
    closeModal('bulkClassModal');

  } catch (err) {
    alertbox("Failed to update classes: " + err.message, "error");
  }finally{
    db.goOffline();
  }
}

function openBulkPriceModal() {
  const selectedList = getSelectedStudents();
  if (selectedList.length === 0) {
    alertbox("Please select at least one student to change class.", "error");
    return;
  }
  document.getElementById('newClassInput').value = '';
  document.getElementById('bulkPriceModal').style.display = 'flex';
}
async function submitBulkPriceChange() {
  const priceInput = document.getElementById('newPriceInput').value.trim();
  const newPrice = parseFloat(priceInput);

  if (isNaN(newPrice) || newPrice < 0) {
    alertbox("Please enter a valid price.", "error");
    return;
  }

  const selectedList = getSelectedStudents();
  if (selectedList.length === 0) {
    alertbox("No students selected.", "error");
    return;
  }

  const updates = {};
  const now = Date.now();
  const userId = firebase.auth().currentUser ? firebase.auth().currentUser.uid : 'system';

  // 1. Build multi-path update payload using short keys (C: classFee, A: updatedAt, B: updatedBy)
  selectedList.forEach(s => {
    const key = s.id || s.key;
    const basePath = `schools/${schoolId}/students/${key}`;

    updates[`${basePath}/C`] = newPrice;
    updates[`${basePath}/A`] = firebase.database.ServerValue.TIMESTAMP;
    updates[`${basePath}/B`] = userId;

    // 2. Update local in-memory student objects (with readable keys)
    s.classFee = newPrice;
    s.updatedAt = now;
    s.updatedBy = userId;
    syncEngine.saveToIDB('students', s);
  });

  try {
    db.goOnline();
    await db.ref().update(updates);
    
    // 3. Re-render UI
    renderStudentTable(cachedStudents);
    alertbox(`Updated class fee for ${selectedList.length} student(s) to ${newPrice}.`, "success");
    closeModal('bulkPriceModal');

  } catch (err) {
    alertbox("Failed to update prices: " + err.message, "error");
  } finally {
    db.goOffline();
  }
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}



async function openIdCardModalByKey(key, btnElement) {
  const student = cachedStudents.find(s => (s.id || s.key) === key);
  if (!student) return;

  // 1. Temporarily disable button & show loading state
  const originalContent = btnElement ? btnElement.innerHTML : "";
  if (btnElement) {
    btnElement.disabled = true;
    btnElement.innerHTML = `
    <svg class="loading-icon" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9"></circle>
    </svg>
`;
  }

  try {
    // 2. Await settings (returns instantly if already loaded, or waits if still fetching)
    const schoolDetails = await getSetting();

    const studentMap = MODULE_FIELD_MAPS.students;

    // 3. Static Front Header Elements
    document.getElementById('cardSchoolFront').innerText = schoolDetails.schoolName || 'SCHOOL';

    // TODO: Rest of your modal opening logic here...

 


  // 1. Static Front Header Elements
  document.getElementById('cardSchoolFront').innerText = schoolDetails.schoolName || 'SCHOOL';
  document.getElementById('cardPhoto').src = student.photoUrl ? getFullCloudinaryUrl(student.photoUrl)+'?c' : 'img/user.svg';
  document.getElementById('cardName').innerText = student.name || '';

  // 2. Get saved active fields from schoolDetails (with fallbacks if not yet saved)
  const frontFields = schoolDetails.frontFields || ['i', 'b', 'h'];  // default: admissionNo, dob, class
  const backFields = schoolDetails.backFields || ['e', 'f', 'd', 'g'];   // default: fatherName, motherName, contact, address

  // 3. Render Dynamic Front Details Grid
  const frontCardBody = document.getElementById('frontCardBody');
  if (frontCardBody) {
    frontCardBody.innerHTML = frontFields.map(shortKey => {
      const fieldName = studentMap[shortKey];
      if (!fieldName) return '';

      const label = formatLabel(fieldName);
      // Handles both long key (name) and short key ('a') fallback in student object
      const value = student[fieldName] ?? student[shortKey] ?? '-';

      return `
        <div class="info-row">
          <span class="label">${label}:</span>
          <span class="value">${value}</span>
        </div>
      `;
    }).join('');
  }

  // 4. Render Dynamic Back Details Grid
  const backCardBody = document.getElementById('backCardBody');
  if (backCardBody) {
    backCardBody.innerHTML = backFields.map(shortKey => {
      const fieldName = studentMap[shortKey];
      if (!fieldName) return '';

      const label = formatLabel(fieldName);
      const value = student[fieldName] ?? student[shortKey] ?? '-';

      return `
        <p><strong>${label}:</strong> <span>${value}</span></p>
      `;
    }).join('');
  }

  // 5. Generate QR Code
 
  // 1. Determine base URL (Custom if selected and provided, otherwise Default)
  let baseUrl = "https://digibook.edu.lk/edOS/";
  
  if (schoolDetails.qrType === 'custom' && schoolDetails.qrCustomUrl) {
    baseUrl = schoolDetails.qrCustomUrl.trim();
  }
  
  // 2. Clean trailing slash if present
  if (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
  }
  
  // 3. Construct full student page URL
  const qrData = `${baseUrl}/student.html?school=${encodeURIComponent(schoolId)}&id=${encodeURIComponent(key)}`;
  
  // 4. Render QR Code
  const qrElem = document.getElementById('qrcode');
  if (qrElem) {
    qrElem.innerHTML = "";
    new QRCode(qrElem, { 
      text: qrData, 
      width: 90, 
      height: 90 
    });
  }


  // 6. Display Modal
  document.getElementById('idCardModal').style.display = 'flex';
} catch (err) {
  console.error("Error fetching school details for modal:", err);
} finally {
  // 4. Restore original button state
  if (btnElement) {
    btnElement.disabled = false;
    btnElement.innerHTML = originalContent;
  }
}
document.querySelector('.print-btn').dataset.student = key;
}

async function confirmDelete(key, name) {
  if (!confirm(`Are you sure you want to delete ${name}?`)) return;

  // Get the up-to-date user instance directly from auth
  const user = firebase.auth().currentUser;

  if (!user) {
    alertbox("Session expired. Please log in again.", "error");
    return;
  }

  try {
    db.goOnline();
    const studentRef = db.ref(`schools/${schoolId}/students/${key}`);

    // Update metadata
    await studentRef.set({
      D: true, // isDeleted
      A: firebase.database.ServerValue.TIMESTAMP, // updatedAt
      B: user.uid // updatedBy
    });

    // Remove node
    //  await studentRef.remove();

    // Update local state and UI
    cachedStudents = cachedStudents.filter(s => (s.id || s.key) !== key);
    selectedStudentIds.delete(key);
    renderStudentTable(cachedStudents);
  } catch (err) {
    alertbox("Delete failed: " + err.message, "error");
  }finally{
    db.goOffline();
  }
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, match => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[match]));
}



initApp();


auth.onAuthStateChanged(user => {
  const isLoginPage = window.location.pathname.endsWith('admin.html');
  if (!user && navigator.onLine && !isLoginPage) {
    window.location.href = 'admin.html';
  }
});

function populateExamDropdowns(examsData) {
  const semesterSelect = document.getElementById("scoreSemesterSelect");
  const subjectSelect = document.getElementById("scoreSubjectSelect");

  // Clear existing options
  semesterSelect.innerHTML = '<option value="">Select Exam</option>';
  subjectSelect.innerHTML = '<option value="">Select Subject</option>';

  // 1. Populate Exam Types (using key as value)
  if (examsData && examsData.types) {
    Object.entries(examsData.types).forEach(([key, val]) => {
      const option = document.createElement("option");
      option.value = key;       // Using the key (e.g., "0", "1")
      option.textContent = val; // Using the value (e.g., "Semester 1")
      semesterSelect.appendChild(option);
    });
  }

  // 2. Populate Subjects / Topics (using key as value)
  if (examsData && examsData.subjects) {
    Object.entries(examsData.subjects).forEach(([key, val]) => {
      const option = document.createElement("option");
      option.value = key;       // Using the key (e.g., "0", "1")
      option.textContent = val; // Using the value (e.g., "maths")
      subjectSelect.appendChild(option);
    });
  }
}

function validateScore(input) {
  let value = parseFloat(input.value);
  
  // If the value is greater than 100, reset it to 100
  if (value > 100) {
      input.value = 100;
  }
  // If the value is less than 0, reset it to 0
  else if (value < 0) {
      input.value = 0;
  }
}