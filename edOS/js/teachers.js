
let cachedTeachers = [];
let currentPage = 1;
let pageSize = 50;
async function initApp() {
try {
// 1. Initialize IndexedDB
await syncEngine.initIndexedDB();

// 2. Load and render immediately from IndexedDB for instant display
//await refreshTeacherList();

// 3. If online, check for user delta logs and apply them to IndexedDB
if (navigator.onLine) {
  await syncEngine.syncUsers();

  // 4. Refresh UI table only if changes were pulled from Firebase
  await refreshTeacherList();
}
} catch (err) {
console.error("Initialization error:", err);
}
}

async function refreshTeacherList() {
cachedTeachers = await syncEngine.getLocalUsersByRole('teacher');
renderTeacherTable(cachedTeachers);
}

function renderTeacherTable(teachers) {
  const tbody = document.getElementById('teacherTableBody');
  const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();

  const filtered = teachers.filter(t => 
    (t.fullName && t.fullName.toLowerCase().includes(searchTerm)) ||
    (t.subject && t.subject.toLowerCase().includes(searchTerm)) ||
    (t.classes && t.classes.toLowerCase().includes(searchTerm))
  );

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty-state">${searchTerm ? 'No matching teachers found.' : 'No teachers registered yet.'}</td></tr>`;
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

  tbody.innerHTML = paginatedItems.map(t => {
    const photoUrl = t.photoUrl || 'img/user.svg';
    const key = t.id || t.key;

    return `
      <tr>
        <td data-label="Teacher">
          <div class="teacher-info">
            <img src="${photoUrl}" class="avatar" alt="${t.fullName}">
            <div>
              <strong>${escapeHtml(t.fullName)}</strong><br>
              <small style="color: #718096;">${escapeHtml(t.qualification || '')}</small>
            </div>
          </div>
        </td>
        <td data-label="Classes"><span class="badge-id">${escapeHtml(t.classes || 'N/A')}</span></td>
        <td data-label="Subject">${escapeHtml(t.subject || 'N/A')}</td>
        <td data-label="Contact">${escapeHtml(t.contact || 'N/A')}</td>
        <td data-label="Actions">
          <div class="actions">
   <!--  <button onclick="openIdCardModalByKey('${key}', this)"
            class="action-btn view"
            title="View ID">
        <svg viewBox="0 0 24 24">
            <rect x="3" y="5" width="18" height="14" rx="2"/>
            <circle cx="8" cy="11" r="2"/>
            <path d="M12 10h6M12 14h4"/>
        </svg>
    </button>-->

    <button onclick="openDetailsModalByKey('${key}','${schoolId}')"
            class="action-btn details"
            title="Details">
        <svg viewBox="0 0 24 24">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/>
            <circle cx="12" cy="12" r="3"/>
        </svg>
    </button>

    <button onclick="confirmDelete('${key}', '${escapeHtml(t.fullName)}')"
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
    renderTeacherTable(cachedTeachers);
  }
window.addEventListener('idb_updated_users', async () => {
  await refreshTeacherList();
});

document.getElementById('searchInput').addEventListener('input', () => {
  renderTeacherTable(cachedTeachers);
});

// POPUP HANDLERS FOR ID CARD
function openIdCardModalByKey(key) {
  const teacher = cachedTeachers.find(t => (t.id || t.key) === key);
  if (!teacher) return;

  document.getElementById('cardSchoolFront').innerText = schoolId.toUpperCase();
  document.getElementById('cardPhoto').src = teacher.photoUrl || 'img/user.svg';
  document.getElementById('cardName').innerText = teacher.fullName || '';
  document.getElementById('cardSubject').innerText = teacher.subject || '';
  document.getElementById('cardTeacherId').innerText = teacher.teacherId || '';

  document.getElementById('cardQualification').innerText = teacher.qualification || '-';
  document.getElementById('cardContact').innerText = teacher.contact || '-';
  document.getElementById('cardDob').innerText = teacher.dob || '-';
  document.getElementById('cardAddress').innerText = teacher.address || '-';

  const viewUrl = `${window.location.origin}/sis/${schoolId}/teacher.html?id=${key}`;
  document.getElementById('qrcode').innerHTML = "";
  new QRCode(document.getElementById('qrcode'), { text: viewUrl, width: 75, height: 75 });

  document.getElementById('idCardModal').style.display = 'flex';
}

function closeIdCardModal() {
  document.getElementById('idCardModal').style.display = 'none';
}

// POPUP HANDLERS FOR DETAILS
function openDetailsModalByKey(key) {
  const t = cachedTeachers.find(item => (item.id || item.key) === key);
  if (!t) return;
  renderPersonalData(t);
  document.getElementById('detailsModal').style.display = 'flex';
}
function renderPersonalData(data) {
    const container = document.getElementById('popupGridContainer');
    if (!container) return;
  
    // Fields to explicitly ignore in the info-card grid
    const skipFields = new Set(['photoUrl', 'exam', 'updatedAt', 'updatedBy', 'isDeleted', 'id','key','school','timetable', 'claimed' ]);
  
    // 1. Handle Profile Photo separately
    const avatarImg = document.getElementById('popupAvatar');
    if (avatarImg) {
      if (data.photoUrl && data.photoUrl.trim() !== '') {
        avatarImg.src = getFullCloudinaryUrl(data.photoUrl);
        avatarImg.style.display = 'block';
      } 
    }
  
    // 2. Clear old dynamic cards
    container.innerHTML = '';
  
    // 3. Dynamically generate cards for all non-empty fields
    Object.keys(data).forEach(key => {
      // Skip internal/ignored keys
      if (skipFields.has(key)) return;
  
      const value = data[key];
  
      // Check for non-empty, non-null values
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        const formattedLabel = camelToTitle(key);
  
        // Construct info-card element
        const cardHtml = `
          <div class="info-card">
            <label>${formattedLabel}</label>
            <span>${value}</span>
          </div>
        `;
        container.insertAdjacentHTML('beforeend', cardHtml);
      }
    });

    renderTimetable(data.timetable, document.getElementById("daysContainer"),document.getElementById("daySelector"))
  }
  function camelToTitle(str) {
    return str
      // Insert a space before capital letters
      .replace(/([A-Z])/g, ' $1')
      // Capitalize the first character
      .replace(/^./, (match) => match.toUpperCase())
      // Clean up specific abbreviations if needed
      .replace(/\bNic\b/gi, 'NIC')
      .replace(/\bNo\b/gi, 'No.');
  }
function closeDetailsModal() {
  document.getElementById('detailsModal').style.display = 'none';
}

async function confirmDelete(key, name) {
if (!confirm(`Are you sure you want to delete ${name}?`)) return;

try {
    db.goOnline();
const userRef = db.ref(`schools/${schoolId}/users/${key}`);
const user = firebase.auth().currentUser;
// Perform soft delete using short keys (D: isDeleted, A: updatedAt, B: updatedBy)
await userRef.update({
  D: true,
  A: firebase.database.ServerValue.TIMESTAMP,
  B: user.uid
});

alertbox(`${name} deleted successfully!`, "success");
cachedTeachers = cachedTeachers.filter(s => (s.id || s.key) !== key);
renderTeacherTable(cachedTeachers);
} catch (err) {
console.error("Delete error:", err);
alertbox("Delete failed: " + err.message, "error");
}finally{
    db.goOffline();
}
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, match => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[match]));
}

auth.onAuthStateChanged(user => {
  if (!user) window.location.href = `admin.html?school=${schoolId}`;
});

initApp();
document.getElementById('inviteLinkInput').value=`https://digibook.edu.lk/edOS/teacher_register.html?school=${schoolId}`
function copyInviteLink() {
    const linkInput = document.getElementById('inviteLinkInput');
    const copyBtn = document.querySelector('.copy-btn');
    const copyIcon = document.getElementById('copyIcon');
    const checkIcon = document.getElementById('checkIcon');
    const copyText = document.getElementById('copyText');

    // Copy text to clipboard
    navigator.clipboard.writeText(linkInput.value).then(() => {
        // Switch to success state
        copyIcon.style.display = 'none';
        checkIcon.style.display = 'block';
        copyText.textContent = 'Copied!';
        copyBtn.style.background = '#16a34a'; // Green success color

        // Revert back after 2 seconds
        setTimeout(() => {
            copyIcon.style.display = 'block';
            checkIcon.style.display = 'none';
            copyText.textContent = 'Copy';
            copyBtn.style.background = '#2563eb';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}