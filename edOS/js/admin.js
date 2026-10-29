let currentUserData = null;
let instituteType;
document.getElementById('schoolHeaderTitle').innerText = "ADMIN PANEL";
document.getElementById('dashSchoolTitle').innerText = "ADMIN PANEL";

// 1. TAB SWITCHING LOGIC
function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

  if (tab === 'login') {
    document.querySelectorAll('.tab-btn')[0].classList.add('active');
    document.getElementById('loginTab').classList.add('active');
  } else {
    document.querySelectorAll('.tab-btn')[1].classList.add('active');
    document.getElementById('signupTab').classList.add('active');
  }
}

// 2. FETCH METRICS FROM INDEXEDDB
async function updateDashboardMetrics() {
  if (!syncEngine) return;

  try {
    const students = await syncEngine.getLocalData('students');
    const teachers = await syncEngine.getLocalData('users');
    const library = await syncEngine.getLocalData('library');

    document.getElementById('totalStudentsCount').innerText = students ? students.length : 0;
    document.getElementById('totalTeachersCount').innerText = teachers ? teachers.length : 0;
    document.getElementById('totalBooksCount').innerText = library ? library.length : 0;
  } catch (err) {
    console.error("Failed to read local metrics:", err);
  }
}

// 3. AUTH STATE LISTENER (SPA Router Core)
auth.onAuthStateChanged(async (user) => {
  const authView = document.getElementById('authView');
  const adminDashboard = document.getElementById('adminDashboard');
  const authLoading = document.getElementById('authLoading');

  authView.style.display = 'none';
  adminDashboard.style.display = 'none';
  authLoading.style.display = 'flex';

  if (user) {
    try {
      // 1. Retrieve schoolId directly from user's displayName
      schoolId =  user.displayName ? user.displayName.trim().toLowerCase() : null;
      // 2. Fallback check: Whitelisted buyers via REST fetch
      if (!schoolId && user.email) {
        const sanitizedEmailKey = user.email.toLowerCase().replace(/\./g, '_');
        const whitelistRes = await fetch(`${firebaseConfig.databaseURL}/whitelisted_buyers/${sanitizedEmailKey}.json`);
        
        if (whitelistRes.ok) {
          const buyerData = await whitelistRes.json();
          if (buyerData) {
            schoolId = (buyerData.schoolId || buyerData.k || '').trim().toLowerCase();

            if (schoolId) {
              // Permanently save to Firebase Auth profile for future logins
              await user.updateProfile({ displayName: schoolId });
              console.log("Updated displayName for existing user:", schoolId);
            }
          }
        }
      }

      if (!schoolId) {
        throw new Error("No school ID attached to this user account profile.");
      }

      // 3. Query specific user record via REST fetch
      const userRes = await fetch(`${firebaseConfig.databaseURL}/schools/${schoolId}/users/${user.uid}.json`);
      if (!userRes.ok) throw new Error(`HTTP error status: ${userRes.status}`);
      
      const userData = await userRes.json();
      
      instituteType = userData.instituteType || '';
      localStorage.setItem('instituteType', instituteType);
      if (instituteType === 'school') {
        // Selects both elements and hides them
        document.querySelectorAll('#timetableLink').forEach(el => {
            el.style.display = 'none';
        });
    } else if (instituteType === 'tuition') {
      document.querySelectorAll('#timetableLink,#teacherLink').forEach(el => {
        el.style.display = 'none';
    });
    }
 // Initialize Sync Engine with resolved school ID
 syncEngine = new SchoolSyncEngine(db, schoolId);
 await syncEngine.initIndexedDB();
 loadExamReportData()
      if (userData && userData.role === 'principal') {
        currentUserData = userData;
     
       

        document.getElementById('userWelcomeText').innerText =
          `Logged in as: ${userData.fullName}`;

        authLoading.style.display = 'none';
        adminDashboard.style.display = 'block';
      } else {
        location.href = 'teacher.html?school=' + schoolId;
      }
    } catch (err) {
      console.error("Authentication/authorization check failed:", err);

      // Offline fallback: serve dashboard from IDB if syncEngine is active
      if (syncEngine) {
        try {
          await syncEngine.initIndexedDB();
          authLoading.style.display = 'none';
          adminDashboard.style.display = 'block';
          return;
        } catch (idbErr) {
          console.error("IndexedDB fallback failed:", idbErr);
        }
      }

      authLoading.style.display = 'none';
      authView.style.display = 'block';
      adminDashboard.style.display = 'none';

      const loginError = document.getElementById('loginError');
      if (loginError) {
        loginError.innerText = "Unable to verify your account. Please try again.";
      }
    }
  } else {
    authLoading.style.display = 'none';
    authView.style.display = 'block';
    adminDashboard.style.display = 'none';
  }
});

// 4. SIGN UP LOGIC (Fetches schoolId from whitelisted_buyers & attaches to Auth displayName)
document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('signupEmail').value.trim().toLowerCase();
  const password = document.getElementById('signupPassword').value;
  const fullName = document.getElementById('signupName').value.trim();
  
  // 1. Get the new type input value (e.g., 'school' or 'tuition')
  const instituteType = document.querySelector('input[name="signupType"]:checked').value;

  const errorDiv = document.getElementById('signupError');
  const btn = document.getElementById('signupBtn');

  errorDiv.innerText = '';
  btn.disabled = true;

  try {
    db.goOnline();
    const sanitizedEmailKey = email.replace(/\./g, '_');

    // Fetch buyer record to get schoolId
    const buyerRef = db.ref(`whitelisted_buyers/${sanitizedEmailKey}`);
    const snapshot = await buyerRef.once('value');

    if (!snapshot.exists()) {
      throw new Error("This email is not registered as an authorized buyer. Please contact support.");
    }

    const buyerData = snapshot.val();
    const fetchedSchoolId = (buyerData.schoolId || buyerData.k || '').trim().toLowerCase();

    if (!fetchedSchoolId) {
      throw new Error("Whitelisted buyer record is missing a valid school ID.");
    }

    // Create User in Firebase Auth
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Optional: Keep schoolId in displayName if other parts of your app rely on it
    await user.updateProfile({
      displayName: fetchedSchoolId
    });

    // 2. Save schoolId AND the new 'type' into Realtime Database under schools/$schoolId/users/$uid
    await db.ref(`schools/${fetchedSchoolId}/users/${user.uid}`).set({
      fullName: fullName,
      email: email,
      role: 'principal',
      schoolId: fetchedSchoolId,
      k: fetchedSchoolId,
      instituteType: instituteType, 
      createdAt: Date.now()
    });

    // Update buyer status
    await buyerRef.update({
      claimed: true,
      claimedUid: user.uid,
      claimedAt: Date.now()
    });

    alertbox("Account Created Successfully!", "success");

  } catch (err) {
    errorDiv.innerText = err.message;
  } finally {
    db.goOffline();
    btn.disabled = false;
  }
});

// 5. LOGIN LOGIC
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorDiv = document.getElementById('loginError');
  const btn = document.getElementById('loginBtn');

  errorDiv.innerText = '';
  btn.disabled = true;

  try {
    await auth.signInWithEmailAndPassword(email, password);
    // Success! Redirect or clear form here
  } catch (err) {
    // Map Firebase error codes to custom messages
    let friendlyMessage = 'An error occurred during sign in. Please try again.';

    switch (err.code) {
      // Handles both wrong password or unknown email due to security defaults
      case 'auth/invalid-login-credentials':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        friendlyMessage = 'Incorrect email or password. Please check your details.';
        break;
      case 'auth/invalid-email':
        friendlyMessage = 'Please enter a valid email address.';
        break;
      case 'auth/user-disabled':
        friendlyMessage = 'This account has been disabled.';
        break;
      case 'auth/too-many-requests':
        friendlyMessage = 'Access temporarily blocked due to many failed attempts. Try again later.';
        break;
      default:
        friendlyMessage = err.message; // Fallback to default if it's an unhandled code
    }

    errorDiv.innerText = friendlyMessage;
  } finally {
    btn.disabled = false;
  }
});

// 6. EDIT SCHOOL DETAILS MODAL
const modal = document.getElementById('schoolDetailsModal');
const editBtn = document.getElementById('editDetails');
const closeBtn = document.getElementById('closeModalBtn');
const cancelBtn = document.getElementById('cancelModalBtn');
const editForm = document.getElementById('editSchoolForm');

editBtn.addEventListener('click', async () => {
  if (!currentUserData || !syncEngine) return;

  document.getElementById('modalPrincipalName').value = currentUserData.fullName || '';
  
  // Reset pending blobs when opening modal
  pendingLogoBlob = null;
  pendingCoverBlob = null;

  const schoolDetails = await syncEngine.getSchoolDetails();
  if (schoolDetails) {
    document.getElementById('modalSchoolName').value = schoolDetails.schoolName || '';
    document.getElementById('modalSchoolAddress').value = schoolDetails.address || '';
    
    // Set existing URLs & Update previews dynamically
    currentLogoUrl = schoolDetails.logoUrl || '';
    currentCoverUrl = schoolDetails.coverUrl || '';

    logoPreview.src = currentLogoUrl || 'img/placeholder.svg';
    coverPreview.src = currentCoverUrl || 'img/placeholder.svg';
  }

  modal.style.display = 'flex';
});

const closeModal = () => { if (modal) modal.style.display = 'none'; };
if (closeBtn) closeBtn.addEventListener('click', closeModal);
if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

if (editForm) {
  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const schoolName = document.getElementById('modalSchoolName').value.trim();
    const address = document.getElementById('modalSchoolAddress').value.trim();
    const principalName = document.getElementById('modalPrincipalName').value.trim();
  
    const currentUid = auth.currentUser ? auth.currentUser.uid : null;
  
    if (!currentUid || !schoolId) {
      alertbox("Session expired or school ID missing. Please log in again.", "error");
      return;
    }
  
    const saveBtn = document.getElementById('saveSchoolBtn');
    saveBtn.disabled = true;
    saveBtn.innerText = "Saving...";
  
    try {
      db.goOnline();
      let logoUrl = currentLogoUrl;
      let coverUrl = currentCoverUrl;
  
      const timestamp = Date.now();

      // Upload new logo with schoolId and timestamp
      if (pendingLogoBlob) {
        logoUrl = await uploadToCloudinary(pendingLogoBlob, `${schoolId}_logo_${timestamp}`);
      }
  
      // Upload new cover image with schoolId and timestamp
      if (pendingCoverBlob) {
        coverUrl = await uploadToCloudinary(pendingCoverBlob, `${schoolId}_cover_${timestamp}`);
      }
      const updatedSchoolData = {
        id: 'info',
        schoolName: schoolName,
        address: address,
        principalName: principalName,
        logoUrl: logoUrl,
        coverUrl: coverUrl,
        updatedAt: Date.now()
      };
  
      // 1. Save school details to Realtime DB
      await db.ref(`schools/${schoolId}/details`).update({
        schoolName: schoolName,
        address: address,
        principalName: principalName,
        logoUrl: logoUrl,
        coverUrl: coverUrl,
        updatedAt: Date.now()
      });
  
      // 2. Update principal name in DB if changed
      if (principalName !== currentUserData.fullName) {
        await db.ref(`schools/${schoolId}/users/${currentUid}`).update({ fullName: principalName });
        currentUserData.fullName = principalName;
        document.getElementById('userWelcomeText').innerText = `Logged in as: ${principalName}`;
      }
  
      // 3. Save to local IndexedDB
      if (syncEngine) {
        syncEngine.saveToIDB("schoolDetails", updatedSchoolData);
      }
  
      alertbox("School details updated successfully!", "success");
    //  closeModal();
    } catch (error) {
      console.error("Save error:", error);
      alertbox("Failed to update school details: "+ error, "error");
    } finally {
      db.goOffline();
      saveBtn.disabled = false;
      saveBtn.innerText = "Save Changes";
    }
  });
}

// 7. LOGOUT LOGIC
function logout() {
  auth.signOut();
}

// 8. BFCACHE RECOVERY
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    if (db && typeof db.goOnline === 'function') {
      db.goOnline();
    }
    if (auth.currentUser) {
      auth.currentUser.getIdToken(true).catch(() => {
        console.log(44444)
        auth.signOut();
      });
    }
  }
});



// Variables to hold pending cropped image Blobs & current Image URLs
let pendingLogoBlob = null;
let pendingCoverBlob = null;
let currentLogoUrl = "";
let currentCoverUrl = "";

// Cropper variables
let cropper = null;
let currentCropTarget = null; // 'logo' or 'cover'

async function uploadToCloudinary(blob, publicId) {
  const formData = new FormData();
  formData.append('file', blob);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  if (publicId) {
    formData.append('public_id', publicId);
  }

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) throw new Error('Cloudinary Upload Failed');
  const data = await response.json();
  return data.secure_url;
}


const cropperModal = document.getElementById('cropperModal');
const cropperImage = document.getElementById('cropperImage');
const logoInput = document.getElementById('modalSchoolLogo');
const coverInput = document.getElementById('modalSchoolCover');
const logoPreview = document.getElementById('logoPreview');
const coverPreview = document.getElementById('coverPreview');

function openCropper(file, target) {
  currentCropTarget = target;
  const reader = new FileReader();
  reader.onload = (e) => {
    cropperImage.src = e.target.result;
    cropperModal.style.display = 'flex';
    
    if (cropper) cropper.destroy();
    cropper = new Cropper(cropperImage, {
      aspectRatio: 1, // Both logo and cover are 1:1 ratio based on specs
      viewMode: 1,
      autoCropArea: 1,
    });
  };
  reader.readAsDataURL(file);
}

logoInput.addEventListener('change', (e) => {
  if (e.target.files && e.target.files[0]) {
    openCropper(e.target.files[0], 'logo');
  }
});

coverInput.addEventListener('change', (e) => {
  if (e.target.files && e.target.files[0]) {
    openCropper(e.target.files[0], 'cover');
  }
});

document.getElementById('applyCropBtn').addEventListener('click', () => {
  if (!cropper) return;

  const width = currentCropTarget === 'logo' ? 200 : 350;
  const height = currentCropTarget === 'logo' ? 200 : 350;

  const canvas = cropper.getCroppedCanvas({ width, height });
  
  canvas.toBlob((blob) => {
    const previewUrl = URL.createObjectURL(blob);
    
    if (currentCropTarget === 'logo') {
      pendingLogoBlob = blob;
      logoPreview.src = previewUrl;
    } else if (currentCropTarget === 'cover') {
      pendingCoverBlob = blob;
      coverPreview.src = previewUrl;
    }
    
    closeCropperModal();
  }, 'image/png');
});

document.getElementById('cancelCropBtn').addEventListener('click', closeCropperModal);

function closeCropperModal() {
  cropperModal.style.display = 'none';
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
  logoInput.value = '';
  coverInput.value = '';
}
auth.onAuthStateChanged(user => {
  const isLoginPage = window.location.pathname.endsWith('admin.html');
  if (!user && navigator.onLine && !isLoginPage) {
    window.location.href = 'admin.html';
  }
});




// State to hold current inputs
let examDataState = {
  types: [],
  subjects: []
};

// Unique variable names to avoid collisions with your existing code
const examsModal = document.getElementById("examsModal");
const openExamsModalBtn = document.getElementById("openExamsModal"); // Make sure your card button has this ID
const closeExamsModalBtn = document.getElementById("closeExamsModalBtn");
const cancelExamsModalBtn = document.getElementById("cancelExamsModalBtn");
const saveExamsModalBtn = document.getElementById("saveExamsModalBtn");

// Open Modal & Fetch Data via REST API
openExamsModalBtn.addEventListener("click", async () => {
  examsModal.style.display = "flex";
  await fetchExamStructureData();
});

// Close Modal Handlers
[closeExamsModalBtn, cancelExamsModalBtn].forEach(btn => {
  btn.addEventListener("click", () => {
    examsModal.style.display = "none";
  });
});

// Fetch data using REST API GET
async function fetchExamStructureData() {
  try {
    const response = await fetch(`${firebaseConfig.databaseURL}/schools/${schoolId}/details/exams.json`);
    const data = await response.json();
    
    examDataState.types = data && data.types ? data.types : [];
    examDataState.subjects = data && data.subjects ? data.subjects : [];
    
    renderExamTags();
  } catch (error) {
    console.error("Error fetching exam structure:", error);
    alertbox("Failed to load exam structure.","error");
  }
}

// Render options as pill buttons with remove icons
function renderExamTags() {
  const typesContainer = document.getElementById("examTypesContainer");
  const subjectsContainer = document.getElementById("subjectsContainer");

  typesContainer.innerHTML = "";
  subjectsContainer.innerHTML = "";

  examDataState.types.forEach((type, index) => {
    typesContainer.appendChild(createExamTagElement(type, index, 'types'));
  });

  examDataState.subjects.forEach((subject, index) => {
    subjectsContainer.appendChild(createExamTagElement(subject, index, 'subjects'));
  });
}

function createExamTagElement(text, index, category) {
  const pill = document.createElement("div");
  pill.className = "tag-pill";
  pill.innerHTML = `
    <span>${text}</span>
    <button type="button" class="remove-tag" data-index="${index}" data-category="${category}">&times;</button>
  `;
  
  pill.querySelector(".remove-tag").addEventListener("click", (e) => {
    const idx = parseInt(e.target.getAttribute("data-index"));
    const cat = e.target.getAttribute("data-category");
    examDataState[cat].splice(idx, 1);
    renderExamTags();
  });

  return pill;
}

// Add Type Handler
document.getElementById("addExamTypeBtn").addEventListener("click", () => {
  const input = document.getElementById("examTypeInput");
  const val = input.value.trim();
  if (val && !examDataState.types.includes(val)) {
    examDataState.types.push(val);
    input.value = "";
    renderExamTags();
  }
});

// Add Subject Handler
document.getElementById("addSubBtn").addEventListener("click", () => {
  const input = document.getElementById("subjectInput");
  const val = input.value.trim();
  if (val && !examDataState.subjects.includes(val)) {
    examDataState.subjects.push(val);
    input.value = "";
    renderExamTags();
  }
});

// Save Changes using REST API PUT
saveExamsModalBtn.addEventListener("click", async () => {
  saveExamsModalBtn.disabled = true;
  saveExamsModalBtn.textContent = "Saving...";

  try {
    // Get the current logged-in user's Firebase ID token
    const currentUser = firebase.auth().currentUser;
    if (!currentUser) {
      alertbox("You must be logged in as an admin to save changes.","error");
      return;
    }
    const token = await currentUser.getIdToken();

    // Pass the token via the ?auth= parameter in the REST URL
    const response = await fetch(`${firebaseConfig.databaseURL}/schools/${schoolId}/details/exams.json?auth=${token}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(examDataState)
    });

    if (response.ok) {
      alertbox("Exam structure saved successfully!","success");
     // examsModal.style.display = "none";
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to save to database");
    }
  } catch (error) {
    console.error("Error saving exam structure:", error);
    alertbox("Error saving changes: " + error.message,"error");
  } finally {
    saveExamsModalBtn.disabled = false;
    saveExamsModalBtn.textContent = "Save Changes";
  }
});

// Track what item is currently pending deletion
let pendingDelete = { index: null, category: null };

const deleteWarningModal = document.getElementById("deleteWarningModal");
const deleteWarningText = document.getElementById("deleteWarningText");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

// Modify your createExamTagElement to trigger the eye-catching modal
function createExamTagElement(text, index, category) {
  const pill = document.createElement("div");
  pill.className = "tag-pill";
  pill.innerHTML = `
    <span>${text}</span>
    <button type="button" class="remove-tag" data-index="${index}" data-category="${category}">&times;</button>
  `;
  
  pill.querySelector(".remove-tag").addEventListener("click", (e) => {
    pendingDelete.index = parseInt(e.target.getAttribute("data-index"));
    pendingDelete.category = e.target.getAttribute("data-category");
    
    // Set customized warning message text
    const itemTypeLabel = pendingDelete.category === 'types' ? 'exam' : 'subject';
    deleteWarningText.innerHTML = `Are you sure you want to delete <b>"${text}"</b>?<br><br><span style="font-weight: 500;">Already saved student scores mapped to this ${itemTypeLabel} may lost.</span>`;
    
    // Show custom warning modal
    deleteWarningModal.style.display = "flex";
  });

  return pill;
}

// Cancel deletion handler
cancelDeleteBtn.addEventListener("click", () => {
  deleteWarningModal.style.display = "none";
  pendingDelete = { index: null, category: null };
});

// Confirm deletion handler
confirmDeleteBtn.addEventListener("click", () => {
  if (pendingDelete.index !== null && pendingDelete.category !== null) {
    // Perform the deletion from state array
    examDataState[pendingDelete.category].splice(pendingDelete.index, 1);
    renderExamTags();
  }
  
  // Close warning modal and reset tracking
  deleteWarningModal.style.display = "none";
  pendingDelete = { index: null, category: null };
});





/*** AVERAGE CHART ***/
let currentView = 'grade';
let processedData = { grades: {}, multiClassGrades: [] };
let myChart = null; // Store chart instance

async function loadExamReportData() {
    try {
        await syncEngine.syncStudents();
        const students = await loadFromIndexedDBDirect(); 
        if (!students || students.length === 0) return;

        processedData = processStudentData(students);
        
        const hasMultipleClasses = processedData.multiClassGrades.length > 0;
        const btnByClass = document.getElementById('btnByClass');
        
        if (hasMultipleClasses) {
            btnByClass.style.display = 'inline-block';
            populateGradeDropdown(processedData.multiClassGrades);
        } else {
            btnByClass.style.display = 'none';
            // Ensure wrapper hides if multi-class condition is lost
            document.getElementById('gradeSelectorWrapper').classList.remove('visible');
        }

        updateChart();
    } catch (err) {
        console.error("Error loading exam report data:", err);
    }
}

function loadFromIndexedDBDirect() {
    return new Promise((resolve) => {
        syncEngine.getLocalData('students').then((students) => {
            if (students && students.length > 0) {
                resolve(students); 
            } else {
                resolve([]); 
            }
        }).catch((err) => {
            console.error("Error loading student data:", err);
            resolve([]); 
        });
    });
}

function processStudentData(students) {
  let gradesMap = {};

  students.forEach(student => {
      if (!student.exam || !Array.isArray(student.exam) || student.exam.length === 0) return;

      // 1. Calculate student's average score across all exams/subjects
      let studentTotalScore = 0;
      let studentTotalSubjects = 0;
      student.exam.forEach(examScores => {
          if (Array.isArray(examScores)) {
              examScores.forEach(score => {
                  studentTotalScore += Number(score) || 0;
                  studentTotalSubjects++;
              });
          }
      });

      if (studentTotalSubjects === 0) return;
      const studentAverage = studentTotalScore / studentTotalSubjects;

      // 2. Robust Class & Grade Normalization
      const rawClass = (student.class || "General").toString().trim();
      
      // Clean up: remove "grade" (case-insensitive), remove spaces and hyphens, uppercase
      // e.g., "Grade 4 A" -> "4A", "4-b" -> "4B", "6" -> "6"
      let cleanClass = rawClass.replace(/^(grade\s*)/i, '').replace(/[\s-]/g, '').toUpperCase();
      
      // Extract leading digits as grade, rest as class section
      const match = cleanClass.match(/^(\d+)([A-Z]*)$/);
      const grade = match ? match[1] : cleanClass;
      const className = cleanClass || rawClass;

      // 3. Initialize grade bucket
      if (!gradesMap[grade]) {
          gradesMap[grade] = {
              totalScoreSum: 0,
              studentCount: 0,
              classes: {}
          };
      }

      gradesMap[grade].totalScoreSum += studentAverage;
      gradesMap[grade].studentCount += 1;

      // 4. Initialize class bucket within grade
      if (!gradesMap[grade].classes[className]) {
          gradesMap[grade].classes[className] = {
              totalScoreSum: 0,
              studentCount: 0
          };
      }

      gradesMap[grade].classes[className].totalScoreSum += studentAverage;
      gradesMap[grade].classes[className].studentCount += 1;
  });

  // 5. Determine which grades have multiple distinct classes (Sorted numerically)
  let multiClassGrades = [];
  Object.keys(gradesMap).forEach(grade => {
      const classKeys = Object.keys(gradesMap[grade].classes);
      if (classKeys.length > 1) {
          multiClassGrades.push(grade);
      }
  });

  // Sort grades numerically (e.g., 4, 5, 6, 10, 11)
  multiClassGrades.sort((a, b) => Number(a) - Number(b));

  return { grades: gradesMap, multiClassGrades };
}

function switchView(view) {
  currentView = view;
  document.getElementById('btnByGrade').classList.toggle('active', view === 'grade');
  document.getElementById('btnByClass').classList.toggle('active', view === 'class');
  
  const wrapper = document.getElementById('gradeSelectorWrapper');
  if (view === 'class') {
      wrapper.classList.add('visible');
  } else {
      wrapper.classList.remove('visible');
  }
  
  updateChart();
}

function populateGradeDropdown(gradesList) {
    const select = document.getElementById('gradeSelect');
    select.innerHTML = '';
    gradesList.forEach(grade => {
        const opt = document.createElement('option');
        opt.value = grade;
        opt.textContent = `${grade}`;
        select.appendChild(opt);
    });
}

function updateChart() {
  let labels = [];
  let dataValues = [];

  if (currentView === 'grade') {
      // Sort grades numerically
      Object.keys(processedData.grades).sort((a, b) => Number(a) - Number(b)).forEach(grade => {
          const gData = processedData.grades[grade];
          const avg = gData.studentCount > 0 ? (gData.totalScoreSum / gData.studentCount) : 0;
          labels.push(`Grade ${grade}`);
          dataValues.push(Number(avg.toFixed(1)));
      });
  } else {
      const selectedGrade = document.getElementById('gradeSelect').value;
      const gData = processedData.grades[selectedGrade];
      if (gData && gData.classes) {
          // Sort classes alphabetically (e.g., 4A, 4B, 4C)
          Object.keys(gData.classes).sort().forEach(className => {
              const cData = gData.classes[className];
              const avg = cData.studentCount > 0 ? (cData.totalScoreSum / cData.studentCount) : 0;
              labels.push(`Class ${className}`);
              dataValues.push(Number(avg.toFixed(1)));
          });
      }
  }

  renderChartJS(labels, dataValues);
}

function renderChartJS(labels, dataValues) {
    const ctx = document.getElementById('examPerformanceChart').getContext('2d');

    // Create the linear gradient matching your request: linear-gradient(to top, #5576fa, #5dd8e8)
    // Canvas gradients need coordinates (x0, y0, x1, y1). Since it's 'to top', y goes from bottom (300) to top (0).
    const gradient = ctx.createLinearGradient(0, 300, 0, 0);
    gradient.addColorStop(0, '#5576fa');
    gradient.addColorStop(1, '#5dd8e8');

    // Destroy existing chart instance to prevent overlay bugs on re-render
    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Average Score',
                data: dataValues,
                backgroundColor: gradient,
                borderRadius: 6,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: '#e9ecef' }
                },
                x: {
                    grid: { display: false }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

//document.addEventListener('DOMContentLoaded', loadExamReportData);