let cachedStudents; 
let currentStudent = null;
let html5QrCode = null;
let activeTab = 'login';
let isProcessingScan = false;
let lastScannedId = null;
let isInitialized = false;
let currentUserRole = null;

setAppBusy(true, "");
function setAppBusy(isBusy, text = "Loading...") {
  const overlay = document.getElementById('loading-overlay');
  const loadingText = document.getElementById('loading-text');
  if (isBusy) {
    loadingText.textContent = text;
    overlay.classList.remove('hidden');
  } else {
    overlay.classList.add('hidden');
  }
}

saveAttendance = saveAttendance || function(studentId, isPresent) {
  console.log(`[saveAttendance] Student: ${studentId}, Status: ${isPresent ? 'Present' : 'Absent'}`);
};

savePayment = savePayment || function(studentId, isPaid) {
  console.log(`[savePayment] Student: ${studentId}, Status: ${isPaid ? 'Paid' : 'Unpaid'}`);
};

const instituteIdFromUrl = urlParams.get('id');

const authSection = document.getElementById('auth-section');
const dashboardSection = document.getElementById('dashboard-section');
const tabLoginBtn = document.getElementById('tab-login-btn');
const tabSignupBtn = document.getElementById('tab-signup-btn');
const nameGroup = document.getElementById('name-group');
const signupIdGroup = document.getElementById('signup-id-group');
const manualInstituteIdInput = document.getElementById('manual-institute-id');
const submitBtn = document.getElementById('submit-btn');
const signupNotice = document.getElementById('signup-notice');

const autoSaveToggle = document.getElementById('auto-save-toggle');
const attendanceChk = document.getElementById('attendance-chk');

const manualSaveBtn = document.getElementById('manual-save-btn');

// Bottom dock & card references
const toggleScanBtn = document.getElementById('toggle-scan-btn');
const toggleText = document.getElementById('toggle-text');
const toggleIcon = document.getElementById('toggle-icon');
const scannerCard = document.getElementById('scanner-card');
const studentResultCard = document.getElementById('student-result');

if (instituteIdFromUrl) {
  switchTab('signup');
  signupNotice.classList.remove('hidden');
}

tabLoginBtn.addEventListener('click', () => switchTab('login'));
tabSignupBtn.addEventListener('click', () => switchTab('signup'));

function switchTab(tab) {
  activeTab = tab;
  if (tab === 'login') {
    tabLoginBtn.classList.add('active');
    tabSignupBtn.classList.remove('active');
    nameGroup.classList.add('hidden');
    signupIdGroup.classList.add('hidden');
    submitBtn.textContent = "Login";
  } else {
    tabSignupBtn.classList.add('active');
    tabLoginBtn.classList.remove('active');
    nameGroup.classList.remove('hidden');
    submitBtn.textContent = "Sign Up";
    if (!instituteIdFromUrl) {
      signupIdGroup.classList.remove('hidden');
    }
  }
}

// --- AUTH SUBMIT HANDLER ---
document.getElementById('auth-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('user-email').value.trim();
  const password = document.getElementById('user-password').value;
  const name = document.getElementById('user-name').value.trim();
  const targetInstituteId = instituteIdFromUrl || manualInstituteIdInput.value.trim();

  try {
    setAppBusy(true, activeTab === 'signup' ? "Creating account..." : "Authenticating...");
    db.goOnline();

    if (activeTab === 'signup') {
      if (!targetInstituteId) {
        setAppBusy(false);
        db.goOffline();
        alertbox("Institute ID is required for sign up.", "error");
        return;
      }

      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      await user.updateProfile({ displayName: targetInstituteId });
      
      await db.ref(`schools/${targetInstituteId}/checker/${user.uid}`).set({
        email, name, claim: false
      });

      db.goOffline();
      setAppBusy(false);
      alertbox("Sign up successful! Please contact your teacher to approve your account access.", "success");
      auth.signOut();
      switchTab('login');
    } else {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      await verifyUserRoleAndInit(userCredential.user, true);
    }
  } catch (err) {
    db.goOffline();
    setAppBusy(false);
    alertbox(err.message, "error");
  }
});

// --- STATE LISTENER ---
auth.onAuthStateChanged(async (user) => {
  if (user && !isInitialized && activeTab === 'login') {
    await verifyUserRoleAndInit(user, false);
  } else if (!user) {
    db.goOffline();
    setAppBusy(false);
    dashboardSection.classList.add('hidden');
    authSection.classList.remove('hidden');
  }
});

// --- MULTI-ROLE VERIFICATION LOGIC ---
async function verifyUserRoleAndInit(user, isExplicitLogin) {
  schoolId = user.displayName;
  
  if (!schoolId) {
    setAppBusy(false);
    db.goOffline();
    dashboardSection.classList.add('hidden');
    authSection.classList.remove('hidden');
    if (isExplicitLogin) {
      alertbox("No Associated ID found. Contact your administrator.", "error");
      auth.signOut();
    }
    return;
  }

  try {
    db.goOnline();

    // 1. Check Principal role
    const userRef = db.ref(`schools/${schoolId}/users/${user.uid}`);
    const userSnap = await userRef.once('value');

    if (userSnap.exists() && userSnap.val().role === "principal") {
      currentUserRole = "principal";
      await grantAccessAndInit(isExplicitLogin);
      return;
    }

    // 2. Check Checker claim status
    const checkerRef = db.ref(`schools/${schoolId}/checker/${user.uid}/claim`);
    const checkerSnap = await checkerRef.once('value');

    if (checkerSnap.exists() && checkerSnap.val() === true) {
      currentUserRole = "checker";
      await grantAccessAndInit(isExplicitLogin);
      return;
    }

    db.goOffline();
    setAppBusy(false);
    dashboardSection.classList.add('hidden');
    authSection.classList.remove('hidden');
    if (isExplicitLogin) {
      alertbox("Access denied. Your account is not authorized or claim is pending approval.", "error");
      auth.signOut();
    } else {
      auth.signOut();
    }

  } catch (err) {
    setAppBusy(false);
    db.goOffline();
    dashboardSection.classList.add('hidden');
    authSection.classList.remove('hidden');
    if (isExplicitLogin) {
      alertbox("Network error verifying permissions: " + err.message, "error");
    }
  }
}

// --- GRANT ACCESS, LOAD STUDENTS, & INIT UI ---
async function grantAccessAndInit(isExplicitLogin) {
  setAppBusy(true, "Loading student records...");

  try {
    await initApp();
  } catch (err) {
    console.warn("Could not load local student cache:", err);
  }

  setAppBusy(false);
  isInitialized = true;
  
  authSection.classList.add('hidden');
  dashboardSection.classList.remove('hidden');

  setTimeout(() => {
    initQrScanner();
  }, 50);


}

async function initApp() {
  try {
      syncEngine = new SchoolSyncEngine(db, schoolId);     
    if (typeof syncEngine !== 'undefined') {
      await syncEngine.initIndexedDB();
      await syncEngine.syncStudents();
    }
    await loadFromIndexedDBDirect();
  } catch (err) {
    console.warn("Offline mode active:", err);
    await loadFromIndexedDBDirect();
  }
}

function loadFromIndexedDBDirect() {
  return new Promise((resolve) => {
    if (typeof syncEngine !== 'undefined' && typeof syncEngine.getLocalData === 'function') {
      syncEngine.getLocalData('students').then((students) => {
        if (students && students.length > 0) cachedStudents = students;
        resolve();
      }).catch(() => resolve());
    } else {
      resolve();
    }
  });
}

// --- LOGOUT FUNCTION WITH CONFIRMATION ---
document.getElementById('logout-btn').addEventListener('click', async () => {
  const confirmed = window.confirm("Are you sure you want to log out?");
  if (!confirmed) return;

  setAppBusy(true, "Logging out...");
  try {
    await stopCamera();
  } catch (e) {}

  auth.signOut().then(() => {
    isInitialized = false;
    currentUserRole = null;
    html5QrCode = null;
    
    dashboardSection.classList.add('hidden');
    studentResultCard.classList.add('hidden');
    scannerCard.classList.remove('hidden');
    authSection.classList.remove('hidden');
    document.getElementById('auth-form').reset();
    currentStudent = null;
    isProcessingScan = false;
    lastScannedId = null;
    db.goOffline();
    setAppBusy(false);
    alertbox("Logged out successfully.", "success");
  }).catch((err) => {
    setAppBusy(false);
    alertbox("Error logging out: " + err.message, "error");
  });
});

// --- QR CODE SCANNER (Core Html5Qrcode API) ---
function initQrScanner() {
  if (html5QrCode) return;
  
  try {
    html5QrCode = new Html5Qrcode("reader");
    startCamera();
  } catch (err) {
    console.error("Scanner initialization error:", err);
  }
}

async function startCamera() {
  if (!html5QrCode) return;
  try {
    if (!html5QrCode.isScanning) {
      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const size = Math.floor(minEdge * 0.75);
            return { width: size, height: size };
          }
        },
        onScanSuccess,
        () => {} 
      );
      setScannerButtonState('pause');
    }
  } catch (err) {
    console.error("Unable to start scanning:", err);
  }
}

async function stopCamera() {
  if (html5QrCode && html5QrCode.isScanning) {
    try {
      await html5QrCode.stop();
    } catch (err) {
      console.error("Failed to stop scanner:", err);
    }
  }
}

function setScannerButtonState(state) {
  if (state === 'pause') {
    toggleScanBtn.className = 'action-btn stop';
    toggleText.textContent = 'Pause';
    toggleIcon.innerHTML = '<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>';
  } else {
    toggleScanBtn.className = 'action-btn start';
    toggleText.textContent = 'Start';
    toggleIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
  }
}

// Toggle button click behavior (Start / Pause)
toggleScanBtn.addEventListener('click', async () => {
  if (html5QrCode && html5QrCode.isScanning) {
    await stopCamera();
    setScannerButtonState('start');
  } else {
    studentResultCard.classList.add('hidden');
    scannerCard.classList.remove('hidden');
    currentStudent = null;
    isProcessingScan = false;
    lastScannedId = null;
    await startCamera();
  }
});

async function onScanSuccess(decodedText) {
  if (isProcessingScan) return;

  let studentId = null;
  try {
    if (decodedText.includes('?')) {
      const parsedUrl = new URL(decodedText);
      studentId = parsedUrl.searchParams.get('id');
      
      // Check if school matches
      if (schoolId !== parsedUrl.searchParams.get('school')) {
        isProcessingScan = true; // Lock scanning immediately to prevent spam
        await stopCamera();      // Stop the camera feed
        setScannerButtonState('start');
        
        alertbox("Something went wrong!", "error");
        
        // Reset processing lock after 2 seconds so the user can try scanning again
        setTimeout(() => {
          isProcessingScan = false;
        }, 2000);
        return;
      }
    } else {
      studentId = decodedText;
    }
  } catch (e) {
    studentId = decodedText;
  }

  if (studentId) {
    if (studentId === lastScannedId) return;

    isProcessingScan = true;
    lastScannedId = studentId;

    await stopCamera();
    setScannerButtonState('start');

    scannerCard.classList.add('hidden');
    handleStudentScan(studentId);
  }
}

function handleStudentScan(studentId) {
  currentStudent = cachedStudents.find(s => String(s.id) === String(studentId));

  if (!currentStudent) {
    alertbox(`Student ID "${studentId}" not found`, "error");
    scannerCard.classList.remove('hidden');
    setScannerButtonState('pause');
    startCamera();
    return;
  }

  const studentKey = currentStudent.id || currentStudent.key;
  currentSelectedStudentId = studentKey;
  refreshScanPaymentLabels();

  const labelInput = document.getElementById('scan-payment-label');
  currentPaymentLabel = labelInput ? labelInput.value.trim() : "";
  syncPaymentButtonsFromStudent();
  renderStudentRecentPayments(currentStudent);

  const latestPaidAt = getLatestPaidTimestamp(currentStudent);
  document.getElementById('st-paidat').textContent = latestPaidAt ? new Date(Number(latestPaidAt)).toLocaleDateString() : 'N/A';



  document.getElementById('st-photo').src = currentStudent.photoUrl ? getFullCloudinaryUrl(currentStudent.photoUrl) : 'img/user.svg';
  document.getElementById('st-name').textContent = currentStudent.fullName;
  document.getElementById('st-id').textContent = currentStudent.id;
  //document.getElementById('st-paidat').textContent =currentStudent?.paidAt ? new Date(currentStudent.paidAt).toLocaleDateString() : 'N/A';
  document.getElementById('st-fee').textContent = currentStudent.classFee || '0';

  attendanceChk.checked = true; 


  studentResultCard.classList.remove('hidden');

  if (autoSaveToggle.checked) {
    db.goOnline();
    saveAttendance(currentStudent.id, true, currentStudent.class);
  
  }
}

autoSaveToggle.addEventListener('change', updateManualSaveButtonVisibility);

function updateManualSaveButtonVisibility() {
  if (!autoSaveToggle.checked && currentStudent) {
    manualSaveBtn.classList.remove('hidden');
  } else {
    manualSaveBtn.classList.add('hidden');
  }
}

attendanceChk.addEventListener('change', () => {
  if (autoSaveToggle.checked && currentStudent) {
    db.goOnline();
    saveAttendance(currentStudent.id, attendanceChk.checked, currentStudent.class);
  }
});



manualSaveBtn.addEventListener('click', async () => {
  if (!currentStudent) return;
  const studentKey = currentStudent.id || currentStudent.key;
  db.goOnline();
  await saveAttendance(currentStudent, attendanceChk.checked, currentStudent.class);
  if (currentPaymentLabel) {
    await savePayment(studentKey, selectedPaymentStatus, currentPaymentLabel);
  }
  alertbox(`Successfully saved record for ${currentStudent.fullName || currentStudent.name}!`, "success");
});

async function saveAttendance(student, checked, currentClass) {
  if (!currentClass) {
      alertbox("Class is required to save attendance.", "error");
      return;
  }

  // Define active date variables inside the function
  const now = new Date();
  const activeYear = now.getFullYear();
  const activeMonth = String(now.getMonth() + 1);
  const activeDay = String(now.getDate());
  const dateKey = `${activeMonth}:${activeDay}`;

  setAppBusy(true, "Saving attendace...");

  const userId = firebase.auth().currentUser ? firebase.auth().currentUser.uid : 'system';

  // Resolve student ID and local cache object
  const studentId = (typeof student === 'object' && student !== null) ? (student.id || student.key) : student;
  const studentObj = (typeof student === 'object' && student !== null) ? student : cachedStudents.find(s => (s.id || s.key) === studentId);

  if (!studentId) {
      setAppBusy(false);
      alertbox("Invalid student identifier.", "error");
      return;
  }

  try {
      db.goOnline();

      // Initialize local class attendance dates cache to reduce Firebase connections
      if (typeof window.classAttendanceDatesCache === 'undefined') {
          window.classAttendanceDatesCache = {};
      }

      // Check if attendanceDatesArray is already cached for this class, otherwise fetch from Firebase
      let attendanceDatesArray = window.classAttendanceDatesCache[currentClass];
      if (!attendanceDatesArray) {
          const snapshot = await db.ref(`schools/${schoolId}/attendanceDates/${activeYear}/${currentClass}`).once('value');
          attendanceDatesArray = snapshot.val() || [];
          window.classAttendanceDatesCache[currentClass] = attendanceDatesArray;
      }

      // Check if today's dateKey already exists in attendanceDatesArray
      let dateIndex = attendanceDatesArray.indexOf(dateKey);
      let isNewDate = dateIndex === -1;

      if (isNewDate) {
          attendanceDatesArray.push(dateKey);
          dateIndex = attendanceDatesArray.length - 1;
      }

      // Default to an empty string if attendance doesn't exist yet
      let attendanceStr = (studentObj && typeof studentObj.attendance === 'string') ? studentObj.attendance : '';

      // Ensure attendance string length matches or covers dateIndex by padding with '0'
      while (attendanceStr.length <= dateIndex) {
          attendanceStr += '0';
      }

      // Convert boolean checked value to 1 or 0
      const attendanceVal = checked ? 1 : 0;

      // Replace/update the character at dateIndex (e.g., updating the 3rd date or appending new)
      attendanceStr = attendanceStr.substring(0, dateIndex) + attendanceVal + attendanceStr.substring(dateIndex + 1);
      const currentTimestamp = Date.now();
      // Update local student cache so UI reflects changes correctly
      if (studentObj) {
          studentObj.attendance = attendanceStr;
      }

      const updates = {};

      // Update attendanceDates array in Firebase only if it's a new date entry
      if (isNewDate) {
          updates[`schools/${schoolId}/attendanceDates/${activeYear}/${currentClass}`] = attendanceDatesArray;
      }

      const basePath = `schools/${schoolId}/students/${studentId}`;
      updates[`${basePath}/E`] = attendanceStr; // Saved as full attendance string like "10111"
      updates[`${basePath}/A`] = firebase.database.ServerValue.TIMESTAMP;
      updates[`${basePath}/B`] = userId;
      updates[`${basePath}/H`] = `${dateKey}[${currentTimestamp}:${currentClass}]`;
      await db.ref().update(updates);
      db.goOffline();

      if (typeof renderCalendarGrid === 'function') {
          renderCalendarGrid();
      }

      setAppBusy(false);
  } catch (err) {
      db.goOffline();
      setAppBusy(false);
      alertbox("Failed to save attendance: " + err.message, "error");
  }
}

// Keep track of currently active student in the payment modal/view
let currentSelectedStudentId = null;

async function savePayment(studentId, newStatus, labelOverride) {
  currentSelectedStudentId = studentId;
  const label = (labelOverride ?? document.getElementById('scan-payment-label')?.value ?? "").trim();
  if (!label) {
    document.getElementById('scan-payment-label').focus()
    return;
  }
  currentPaymentLabel = label;
  setSessionCookie(SCAN_PAYMENT_LABEL_COOKIE, label);

  const student = (cachedStudents || []).find(s => String(s.id || s.key) === String(studentId));
  if (!student) return;

  const prevPayments = getStudentPayments(student).map(item => [...item]);
  let nextPayments = prevPayments.map(item => [...item]);
  const existingIdx = nextPayments.findIndex(([lbl]) => lbl.toLowerCase() === label.toLowerCase());

  if (existingIdx >= 0) {
    if (newStatus === null) {
      nextPayments.splice(existingIdx, 1);
    } else {
      const existingPaidAt = nextPayments[existingIdx][2];
      nextPayments[existingIdx] = [
        label,
        newStatus,
        newStatus === 'paid' ? (existingPaidAt || Date.now()) : null
      ];
    }
  } else if (newStatus !== null) {
    nextPayments.push([
      label,
      newStatus,
      newStatus === 'paid' ? Date.now() : null
    ]);
    while (nextPayments.length > MAX_PAYMENTS_PER_STUDENT) {
      nextPayments.shift();
    }
  }

  student.payments = nextPayments;
  if (typeof syncEngine !== 'undefined' && typeof syncEngine.saveToIDB === 'function') {
    syncEngine.saveToIDB('students', student);
  }
  refreshScanPaymentLabels();
  renderStudentRecentPayments(student);

  setAppBusy(true, "Saving payment status...");
  try {
    db.goOnline();
    await db.ref(`schools/${schoolId}/students/${studentId}`).update({
      payments: nextPayments,
      A: firebase.database.ServerValue.TIMESTAMP
    });
    db.goOffline();
    setAppBusy(false);

    const latestPaidAt = getLatestPaidTimestamp(student);
    const paidAtEl = document.getElementById('st-paidat');
    if (paidAtEl) {
      paidAtEl.textContent = latestPaidAt ? new Date(Number(latestPaidAt)).toLocaleDateString() : 'N/A';
    }
    alertbox("Payment status saved!", "success");
  } catch (err) {
    db.goOffline();
    setAppBusy(false);

    student.payments = prevPayments;
    if (typeof syncEngine !== 'undefined' && typeof syncEngine.saveToIDB === 'function') {
      syncEngine.saveToIDB('students', student);
    }
    syncPaymentButtonsFromStudent();
    renderStudentRecentPayments(student);
    alertbox("Failed to update fee: " + err.message, "error");
  }
}
// -------------------------------------------------------------
// RECEIPT & PRINTING ACTION HANDLERS
// -------------------------------------------------------------

// 1. RawBT Bluetooth Thermal Printer Integration
function printRawBTReceipt() {
  const student = cachedStudents.find(s => s.id === currentSelectedStudentId);
  if (!student) {
    alertbox("Please select a student first.", "error");
    return;
  }

  const dateStr = new Date().toLocaleDateString();
  const feeAmount = document.getElementById("st-fee") ? document.getElementById("st-fee").innerText : "0";
  const studentName = student.name || student.n || "Student";
  const className = student.className || "Tuition Class";

  // Build compact 58mm text receipt format
  const receiptText = 
    "  CLASS FEE RECEIPT\n" +
    "--------------------------------\n" +
    `Date   : ${dateStr}\n` +
    `Student: ${studentName}\n` +
    `Class  : ${className}\n` +
    `Status : PAID\n` +
    `Amount : LKR ${feeAmount}\n` +
    "--------------------------------\n" +
    "     Thank you!\n\n\n";

  // Encode to Base64 and trigger RawBT app scheme
  const base64Data = btoa(unescape(encodeURIComponent(receiptText)));
  window.location.href = `rawbt:base64,${base64Data}`;
}

// 2. Direct WhatsApp via `wa.me` (Uses teacher's WhatsApp app instantly for free)
function sendWhatsAppReceiptDirect() {
  const student = cachedStudents.find(s => s.id === currentSelectedStudentId);
  if (!student) {
    alertbox("Please select a student first.", "error");
    return;
  }

  // Assumes your student object stores parent phone as parentPhone or p
  const parentPhone = student.parentPhone || student.phone || student.p;
  if (!parentPhone) {
    alertbox("Parent phone number not found for this student.", "error");
    return;
  }

  const phoneFormatted = String(parentPhone).replace(/^0/, "94").replace(/\+/g, "");
  const feeAmount = document.getElementById("st-fee") ? document.getElementById("st-fee").innerText : "0";
  const studentName = student.name || student.n || "Student";
  const dateStr = new Date().toLocaleDateString();

  const message = 
    `*FEES RECEIPT*\n` +
    `Student: ${studentName}\n` +
    `Date: ${dateStr}\n` +
    `Amount: LKR ${feeAmount}\n` +
    `Status: *PAID ✅*\n\n` +
    `Thank you!`;

  window.open(`https://wa.me/${phoneFormatted}?text=${encodeURIComponent(message)}`, "_blank");
}

// 3. Cloud Gateway WhatsApp (Pushes to your Cloudflare Worker / Cloud Function queue)
function sendWhatsAppReceiptAPI() {
  const student = cachedStudents.find(s => s.id === currentSelectedStudentId);
  if (!student) {
    alertbox("Please select a student first.", "error");
    return;
  }

  const parentPhone = student.parentPhone || student.phone || student.p;
  if (!parentPhone) {
    alertbox("Parent phone number not found.", "error");
    return;
  }

  setAppBusy(true, "Sending WhatsApp alert...");

  // Example pushing to your Firebase queue for background processing
  db.goOnline();
  db.ref(`schools/${schoolId}/whatsapp_queue`).push({
    to: parentPhone,
    message: `Fees received for ${(student.name || student.n)}. Status: PAID ✅`,
    createdAt: firebase.database.ServerValue.TIMESTAMP
  }).then(() => {
    db.goOffline();
    setAppBusy(false);
    alertbox("WhatsApp message queued successfully!", "success");
  }).catch((err) => {
    db.goOffline();
    setAppBusy(false);
    alertbox("Failed to queue WhatsApp: " + err.message, "error");
  });
}





const MAX_PAYMENTS_PER_STUDENT = 12;
const VISIBLE_RECENT_PAYMENTS = 5;

let currentPaymentLabel = "";
let selectedPaymentStatus = null; // null | 'pending' | 'paid'
let savedScanPaymentLabels = [];

function getStudentPayments(student) {
  if (!student || !Array.isArray(student.payments)) return [];
  return student.payments
    .filter(item => Array.isArray(item) && item[0])
    .slice(-MAX_PAYMENTS_PER_STUDENT)
    .map(item => [
      String(item[0]),
      item[1] === 'paid' || item[1] === 'pending' ? item[1] : null,
      item[1] === 'paid' && item[2] ? Number(item[2]) : null
    ]);
}

function getStatusForLabel(student, label) {
  if (!student || !label) return null;
  const found = getStudentPayments(student).find(
    ([lbl]) => lbl.toLowerCase() === label.trim().toLowerCase()
  );
  return found ? found[1] : null;
}

function getLatestPaidTimestamp(student) {
  const paidTimes = getStudentPayments(student)
    .filter(([, st, ts]) => st === 'paid' && ts)
    .map(([, , ts]) => Number(ts));
  if (paidTimes.length === 0) return student?.paidAt || student?.G || null;
  return Math.max(...paidTimes);
}

function refreshScanPaymentLabels() {
  const set = new Set();
  (cachedStudents || []).forEach(s => {
    getStudentPayments(s).forEach(([lbl]) => {
      if (lbl && lbl.trim()) set.add(lbl.trim());
    });
  });
  savedScanPaymentLabels = Array.from(set);
  renderScanPaymentDropdown();
}

function renderScanPaymentDropdown() {
  const dd = document.getElementById('scan-payment-dropdown');
  if (!dd) return;

  if (savedScanPaymentLabels.length === 0) {
    dd.innerHTML = `<div style="padding: 10px 12px; color: var(--muted); font-size: 12px;">No previous items</div>`;
    return;
  }

  dd.innerHTML = savedScanPaymentLabels.map(lbl => `
    <button
      type="button"
      onmousedown="selectScanPaymentLabel('${String(lbl).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}')"
      style="display: block; width: 100%; text-align: left; padding: 10px 12px; border: 0; border-bottom: 1px solid var(--border); background: transparent; cursor: pointer; font-size: 13px; color: var(--text);"
    >${lbl}</button>
  `).join('');
}

function showScanPaymentDropdown() {
  renderScanPaymentDropdown();
  const dd = document.getElementById('scan-payment-dropdown');
  if (dd) dd.classList.remove('hidden');
}

function hideScanPaymentDropdown() {
  const dd = document.getElementById('scan-payment-dropdown');
  if (dd) dd.classList.add('hidden');
}

function selectScanPaymentLabel(lbl) {
  const clean = String(lbl ?? '').trim();
  const input = document.getElementById('scan-payment-label');
  if (input) input.value = clean;
  currentPaymentLabel = clean;
  setSessionCookie(SCAN_PAYMENT_LABEL_COOKIE, clean);
  hideScanPaymentDropdown();
  syncPaymentButtonsFromStudent();
}

function onScanPaymentLabelInput() {
  const input = document.getElementById('scan-payment-label');
  currentPaymentLabel = input ? input.value.trim() : "";
  setSessionCookie(SCAN_PAYMENT_LABEL_COOKIE, currentPaymentLabel);
  showScanPaymentDropdown();
  syncPaymentButtonsFromStudent();
}

document.addEventListener('click', (e) => {
  const wrap = document.getElementById('scan-payment-item-wrap');
  if (wrap && !wrap.contains(e.target)) {
    hideScanPaymentDropdown();
  }
});

function highlightPaymentButtons(status) {
  const btnNull = document.getElementById('btn-pay-null');
  const btnPending = document.getElementById('btn-pay-pending');
  const btnPaid = document.getElementById('btn-pay-paid');
  if (!btnNull || !btnPending || !btnPaid) return;

  [btnNull, btnPending, btnPaid].forEach(b => {
    b.style.background = '#eef2f7';
    b.style.color = '#43516a';
    b.style.boxShadow = 'none';
  });

  if (status === null) {
    btnNull.style.background = '#64748b';
    btnNull.style.color = '#ffffff';
  } else if (status === 'pending') {
    btnPending.style.background = '#d97706';
    btnPending.style.color = '#ffffff';
  } else if (status === 'paid') {
    btnPaid.style.background = '#16a34a';
    btnPaid.style.color = '#ffffff';
  }
}

function syncPaymentButtonsFromStudent() {
  selectedPaymentStatus = getStatusForLabel(currentStudent, currentPaymentLabel);
  highlightPaymentButtons(selectedPaymentStatus);
}

function renderStudentRecentPayments(student) {
  const el = document.getElementById('st-recent-payments');
  if (!el) return;
  const recent = getStudentPayments(student).slice(-VISIBLE_RECENT_PAYMENTS);
  if (recent.length === 0) {
    el.textContent = "Recent payments: none";
    return;
  }
  el.textContent = "Recent payments: " + recent.map(([lbl, st]) => `${lbl} (${st ?? 'null'})`).join(' · ');
}

async function onSelectPaymentStatus(status) {
  if (!currentStudent) return;

  const input = document.getElementById('scan-payment-label');
  const label = input ? input.value.trim() : "";
  if (!label) {
    alertbox("Please enter or select a Payment Item first.", "error");
    return;
  }

  currentPaymentLabel = label;
  selectedPaymentStatus = status; // null | 'pending' | 'paid'
  highlightPaymentButtons(selectedPaymentStatus);

  if (autoSaveToggle && autoSaveToggle.checked) {
    await savePayment(currentStudent.id || currentStudent.key, selectedPaymentStatus, currentPaymentLabel);
  }
}

const SCAN_PAYMENT_LABEL_COOKIE = 'scan_last_payment_label';

function setSessionCookie(name, value) {
  const encoded = encodeURIComponent(String(value ?? ''));
  document.cookie = `${name}=${encoded}; path=/; SameSite=Lax`;
}

function getSessionCookie(name) {
  const prefix = `${name}=`;
  const parts = document.cookie ? document.cookie.split(';') : [];
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    if (part.startsWith(prefix)) {
      return decodeURIComponent(part.slice(prefix.length));
    }
  }
  return '';
}

function applySavedScanPaymentLabel() {
  const savedLabel = getSessionCookie(SCAN_PAYMENT_LABEL_COOKIE).trim();
  const input = document.getElementById('scan-payment-label');
  if (!input) return;

  if (savedLabel && !input.value.trim()) {
    input.value = savedLabel;
  }
  currentPaymentLabel = input.value.trim();
}
