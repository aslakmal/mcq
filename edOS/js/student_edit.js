  // Safe polyfill for URL.canParse
if (!URL.canParse) {
  URL.canParse = (url, base) => {
    try {
      new URL(url, base);
      return true;
    } catch {
      return false;
    }
  };
}
const studentKey = urlParams.get('id');

  if (!schoolId || !studentKey) {
    alertbox('Missing required school or student ID in URL parameters.','error');
    throw new Error("Missing parameters");
  }

  document.getElementById('backBtn').href = `students.html?school=${schoolId}`;

  let cropper = null;
  let newImageBlob = null;
  let currentStudentData = null;

  async function initPage() {
    // 1. Fetch instantly from IndexedDB first
    setFormDisabled(true)
    await loadFromFirebaseDirect();

    // 2. Fetch fresh copy from Firebase if online
    if (navigator.onLine) {
   //   fetchFromFirebase();
    }
  }

  function loadFromFirebaseDirect() {
    return new Promise((resolve) => {
      console.log("Fetching student directly from Firebase...");
      
      // Bring database online just for this fetch
      db.goOnline();

      db.ref(`schools/${schoolId}/students/${studentKey}`)
        .once('value')
        .then((snapshot) => {
          const rawFirebaseData = snapshot.val();
          if (rawFirebaseData) {
            // Unmap short keys back to long keys so populateForm() can read them correctly
            const decodedData = syncEngine.unmapFromFirebase('students', rawFirebaseData);
            populateForm(decodedData);
            resolve(decodedData);
          } else {
            console.warn("Student not found in Firebase.");
            resolve(null);
          }
        })
        .catch((error) => {
          console.error("Error fetching student from Firebase:", error);
          resolve(null);
        })
        .finally(() => {
          // Go offline immediately after fetch to reduce simultaneous connections
          db.goOffline();
        });
    });
  }



 async function populateForm(data) { 
    setFormDisabled(false)
if (!data){ 
  alert('no data 2');
  return;
}
currentStudentData=data;
document.getElementById('fullName').value = data.fullName || '';
document.getElementById('dob').value = data.dob || '';

// Gender Radio Button (mapped from key: 'gender')
if (data.gender) {
  const genderRadio = document.querySelector(`input[name="gender"][value="${data.gender}"]`);
  if (genderRadio) genderRadio.checked = true;
}

document.getElementById('studentContact').value = await syncEngine.decryptField(data.studentContact) || '';
document.getElementById('fatherName').value = data.fatherName || '';
document.getElementById('motherName').value = data.motherName || '';
document.getElementById('address').value = await syncEngine.decryptField(data.address) || '';
document.getElementById('class').value = data.class || '';
document.getElementById('admissionNo').value = data.admissionNo || '';
document.getElementById('birthCertificateNo').value = data.birthCertNo || '';
document.getElementById('yearOfAdmission').value = data.admissionYear || '';
document.getElementById('gradeOfAdmission').value = data.admissionGrade || '';
document.getElementById('positionsHeld').value = data.positionsHeld || '';
document.getElementById('disciplineBehavior').value = data.discipline || '';
document.getElementById('medicalConditions').value = data.medical || '';
document.getElementById('fatherNic').value = data.fatherNic || '';
document.getElementById('motherNic').value = data.motherNic || '';
document.getElementById('guardianName').value = data.guardianName || '';
document.getElementById('guardianNic').value = data.guardianNic || '';
document.getElementById('gnDivision').value = data.gnDivision || '';
document.getElementById('dsDivision').value = data.dsDivision || '';
document.getElementById('lowIncomeStatus').value = data.lowIncome || '';

// Aswesuma Beneficiary Radio Button (mapped from key: 'aswesuma')
if (data.aswesuma) {
  const aswesumaRadio = document.querySelector(`input[name="aswesumaBeneficiary"][value="${data.aswesuma}"]`);
  if (aswesumaRadio) aswesumaRadio.checked = true;
}

// Other Siblings (mapped from key: 'siblings')
document.getElementById('otherSiblingsInSchool').value = data.siblings ?? 0;

// Profile Image Preview (mapped from key: 'photoUrl')
if (data.photoUrl) {
  document.getElementById('currentPhoto').src = getFullCloudinaryUrl(data.photoUrl);
}
}

  // Cropper.js Initialization on File Selection
  document.getElementById('photoInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const cropImg = document.getElementById('cropImage');
      cropImg.src = evt.target.result;
      document.getElementById('cropWrapper').style.display = 'block';

      if (cropper) cropper.destroy();
      cropper = new Cropper(cropImg, {
        aspectRatio: 1,
        viewMode: 1
      });
    };
    reader.readAsDataURL(file);
  });

  // Form Submit Handler (Sync Logic)
  document.getElementById('editStudentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentUser = auth.currentUser;
  if (!currentUser) {
    alertbox("Session expired. Please log in again.","error");
    return;
  }
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerText = "Saving Changes...";

    try {
      db.goOnline();
        console.log(currentStudentData)
      let photoUrl = currentStudentData ? currentStudentData.photoUrl : '';

      // Handle Image Crop & Cloudinary upload if a new file was chosen
      if (cropper) {
        const canvas = cropper.getCroppedCanvas({ width: 300, height: 300 });
        newImageBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85));
        
        if (navigator.onLine) {
          photoUrl = await uploadToCloudinary(newImageBlob);
        } else {
          // Offline
          alertbox('Please check internet connection and try again','error');
        }
      }

   // Helper to safely extract and trim values
const getValue = (id) => document.getElementById(id)?.value?.trim() || '';
photoUrl = getCloudinaryPath(photoUrl);
// 1. Merge form input values using clean, human-readable keys
const rawUpdatedStudent = {
...(currentStudentData || {}),

fullName: getValue('fullName'),
dob: getValue('dob'),
gender: document.querySelector('input[name="gender"]:checked')?.value || '',
studentContact: await encryptField(getValue('studentContact')),
fatherName: getValue('fatherName'),
motherName: getValue('motherName'),
address: await encryptField(getValue('address')),
class: getValue('class'),
admissionNo: getValue('admissionNo'),
birthCertNo: getValue('birthCertificateNo'),
admissionYear: Number(getValue('yearOfAdmission')) || null,
admissionGrade: getValue('gradeOfAdmission'),
positionsHeld: getValue('positionsHeld'),
discipline: getValue('disciplineBehavior'),
medical: getValue('medicalConditions'),
fatherNic: getValue('fatherNic'),
motherNic: getValue('motherNic'),
guardianName: getValue('guardianName'),
guardianNic: getValue('guardianNic'),
gnDivision: getValue('gnDivision'),
dsDivision: getValue('dsDivision'),
lowIncome: getValue('lowIncomeStatus'),
aswesuma: document.querySelector('input[name="aswesumaBeneficiary"]:checked')?.value || '',
siblings: Number(getValue('otherSiblingsInSchool')) || 0,
photoUrl: photoUrl || (currentStudentData?.photoUrl || ''),
updatedBy: currentUser.uid,
updatedAt: firebase.database.ServerValue.TIMESTAMP
};

// 2. Filter out all blank/empty values ('', null, undefined) to save Firebase space
const cleanUpdatedStudent = {};
Object.keys(rawUpdatedStudent).forEach(key => {
const val = rawUpdatedStudent[key];
if (val !== '' && val !== null && val !== undefined) {
  cleanUpdatedStudent[key] = val;
}
});

// 3. Convert clean readable data to Firebase short keys ('a', 'b', 'A', 'B')
const firebasePayload = syncEngine.mapToFirebase('students', cleanUpdatedStudent);
console.log(cleanUpdatedStudent)
// 4. Update Firebase with short keys (overwrites cleanly)
await db.ref(`schools/${schoolId}/students/${studentKey}`).set(firebasePayload);

// 5. Update local IndexedDB with human-readable keys for instant UI update
//if (window.syncEngine) {
syncEngine.saveToIDB('students', {
  id: studentKey,
  ...cleanUpdatedStudent,
  updatedAt: Date.now() // Replace ServerValue placeholder for IndexedDB
});
//}
 
alertbox("Student updated successfully!","success");
      

    } catch (err) {
      console.error(err);
      alertbox( "Failed to update student: " + err.message,'error');
    } finally {
      db.goOffline();
      submitBtn.disabled = false;
      submitBtn.innerText = "Save Changes";
    }
  });



// 3. CLOUDINARY UPLOAD FUNCTION
async function uploadToCloudinary(blob) {
  const formData = new FormData();
  formData.append('file', blob);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) throw new Error('Cloudinary Upload Failed');
  const data = await response.json();
  return data.secure_url;
}

  function blobToDataURL(blob) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }
  function setFormDisabled(isDisabled) {
    const form = document.getElementById('editStudentForm');
    const elements = form.querySelectorAll('input, select, textarea, button');
    
    elements.forEach(el => {
      el.disabled = isDisabled;
    });
  }


  auth.onAuthStateChanged(user => {
    const isLoginPage = window.location.pathname.endsWith('admin.html');
    if (!user && navigator.onLine && !isLoginPage) {
      window.location.href = 'admin.html';
    }
  });

  initPage();


