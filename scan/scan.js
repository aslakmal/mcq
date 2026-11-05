let cachedStudents; 
let currentStudent = null;
let html5QrCode = null;
let activeTab = 'login';
let isProcessingScan = false;
let lastScannedId = null;
let isInitialized = false;
let currentUserRole = null;

if (typeof window.alertbox !== 'function') {
  window.alertbox = function(msg, type) {
    alert(`[${type.toUpperCase()}] ${msg}`);
  };
}

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
const paymentChk = document.getElementById('payment-chk');
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
  }
});

// --- MULTI-ROLE VERIFICATION LOGIC ---
async function verifyUserRoleAndInit(user, isExplicitLogin) {
  schoolId = user.displayName;
  
  if (!schoolId) {
    setAppBusy(false);
    db.goOffline();
    if (isExplicitLogin) {
      alertbox("No Associated School ID found. Contact your administrator.", "error");
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
    if (isExplicitLogin) {
      alertbox("Access denied. Your account is not authorized or claim is pending approval.", "error");
      auth.signOut();
    } else {
      auth.signOut();
    }

  } catch (err) {
    setAppBusy(false);
    db.goOffline();
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

  if (isExplicitLogin) {
    alertbox(`Login successful (${currentUserRole.toUpperCase()})! Loaded ${cachedStudents.length} students.`, "success");
  }
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

  document.getElementById('st-photo').src = currentStudent.photoUrl ? getFullCloudinaryUrl(currentStudent.photoUrl) : 'img/user.svg';
  document.getElementById('st-name').textContent = currentStudent.fullName;
  document.getElementById('st-id').textContent = currentStudent.id;
  document.getElementById('st-paidat').textContent = currentStudent.paidAt || 'N/A';
  document.getElementById('st-fee').textContent = currentStudent.classFee || '0';

  attendanceChk.checked = true; 
  paymentChk.checked = Number(currentStudent.isPaid) === 1; 

  studentResultCard.classList.remove('hidden');

  if (autoSaveToggle.checked) {
    db.goOnline();
    saveAttendance(currentStudent.id, true, currentStudent.class);
    if (paymentChk.checked) {
    //  savePayment(currentStudent.id, true);
    }
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

paymentChk.addEventListener('change', () => {
  if (autoSaveToggle.checked && currentStudent) {
    db.goOnline();
    savePayment(currentStudent.id, paymentChk.checked);
  }
});

manualSaveBtn.addEventListener('click', () => {
  if (!currentStudent) return;
  db.goOnline();
  saveAttendance(currentStudent.id, attendanceChk.checked, currentStudent.class);
  savePayment(currentStudent.id, paymentChk.checked);
  alertbox(`Successfully saved record for ${currentStudent.fullName}!`, "success");
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

async function savePayment(studentId, checked) {
  const newFeeStatus = checked ? 1 : 0;
  setAppBusy(true, "Saving payment status...");

  try {
      db.goOnline();
      await db.ref(`schools/${schoolId}/students/${studentId}`).update({
          F: newFeeStatus,
          G: newFeeStatus === 1 ? firebase.database.ServerValue.TIMESTAMP : null,
          A: firebase.database.ServerValue.TIMESTAMP
      });
      db.goOffline();
      const student = cachedStudents.find(s => (s.id) === studentId);
      if (student) {
          student.isPaid = newFeeStatus;
          if (typeof syncEngine !== 'undefined' && syncEngine.saveToIDB) {
              syncEngine.saveToIDB('students', student);
              console.log(student)
          }
      }
      setAppBusy(false);
      alertbox("Payment status saved!", "success");
  } catch (err) {
      db.goOffline();
      setAppBusy(false);
      alertbox("Failed to update fee: " + err.message, "error");
  }
}
