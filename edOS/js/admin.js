let currentUserData = null;
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
      db.goOnline(); // Ensure WebSocket reconnects if restoring from bfcache

      // Retrieve schoolId directly from user's displayName in Firebase Auth
      schoolId = user.displayName ? user.displayName.trim().toLowerCase() : null;



      if (!schoolId && user.email) {
        const sanitizedEmailKey = user.email.toLowerCase().replace(/\./g, '_');
        const buyerSnap = await db.ref(`whitelisted_buyers/${sanitizedEmailKey}`).once('value');
  
        if (buyerSnap.exists()) {
          const buyerData = buyerSnap.val();
          schoolId = (buyerData.schoolId || buyerData.k || '').trim().toLowerCase();
  
          if (schoolId) {
            // Permanently save to Firebase Auth profile for future logins
            await user.updateProfile({ displayName: schoolId });
            console.log("Updated displayName for existing user:", schoolId);
          }
        }
      }


      if (!schoolId) {
        throw new Error("No school ID attached to this user account profile.");
      }
console.log(schoolId)
      // Query database at exact path: schools/$schoolId/users/$uid
      const userRef = db.ref(`schools/${schoolId}/users/${user.uid}`);
      const snapshot = await userRef.once('value');
      const userData = snapshot.val();

      if (userData && userData.role === 'principal') {
        currentUserData = userData;

        // Initialize Sync Engine with resolved school ID
        syncEngine = new SchoolSyncEngine(db, schoolId);
        await syncEngine.initIndexedDB();

        document.getElementById('userWelcomeText').innerText =
          `Logged in as: ${userData.fullName} (Principal)`;

        authLoading.style.display = 'none';
        adminDashboard.style.display = 'block';
      } else {
        alertbox("Unauthorized access. This account is not registered as a Principal for " + schoolId, "error");
        await auth.signOut();

        authLoading.style.display = 'none';
        authView.style.display = 'block';
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
  const errorDiv = document.getElementById('signupError');
  const btn = document.getElementById('signupBtn');

  errorDiv.innerText = '';
  btn.disabled = true;

  try {
    const sanitizedEmailKey = email.replace(/\./g, '_');

    // 1. Fetch buyer record to get schoolId / k
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

    // 2. Create User in Firebase Auth
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // 3. Save schoolId directly into Firebase Auth profile displayName
    await user.updateProfile({
      displayName: fetchedSchoolId
    });

    // 4. Store user data in Realtime Database under schools/$schoolId/users/$uid
    await db.ref(`schools/${fetchedSchoolId}/users/${user.uid}`).set({
      fullName: fullName,
      email: email,
      role: 'principal',
      schoolId: fetchedSchoolId,
      k: fetchedSchoolId,
      createdAt: Date.now()
    });

    // 5. Update buyer status
    await buyerRef.update({
      claimed: true,
      claimedUid: user.uid,
      claimedAt: Date.now()
    });

    alertbox("Principal Account Created Successfully!", "success");

  } catch (err) {
    errorDiv.innerText = err.message;
  } finally {
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
  } catch (err) {
    errorDiv.innerText = err.message;
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

    logoPreview.src = currentLogoUrl || 'placeholder.png';
    coverPreview.src = currentCoverUrl || 'placeholder.png';
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
        document.getElementById('userWelcomeText').innerText = `Logged in as: ${principalName} (Principal)`;
      }
  
      // 3. Save to local IndexedDB
      if (syncEngine) {
        syncEngine.saveToIDB("schoolDetails", updatedSchoolData);
      }
  
      alertbox("School details updated successfully!", "success");
      closeModal();
    } catch (error) {
      console.error("Save error:", error);
      alertbox("Failed to update school details.", "error");
    } finally {
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
        auth.signOut();
      });
    }
  }
});


const CLOUDINARY_UPLOAD_PRESET = "school";
const CLOUDINARY_CLOUD_NAME = "vmorkfqp";

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
