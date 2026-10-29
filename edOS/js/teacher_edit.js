const teacherKey = urlParams.get('id');

if (!schoolId || !teacherKey) {
  document.getElementById('missingSchoolAlert').style.display = 'block';
  document.getElementById('editTeacherForm').style.display = 'none';
  throw new Error("Initialization halted: Missing 'school' or 'id' URL parameter.");
}


let existingPhotoUrl = "";

async function initApp() {
try {
// 1. Connect to IndexedDB & start real-time sync listeners
await syncEngine.initIndexedDB();

// 2. Fetch using Cache-First strategy with automatic Firebase fallback
setFormDisabled(true);
loadFromFirebaseDirect();



} catch (err) {
console.error("Error loading teacher profile:", err);
}
}

initApp();
function populateForm(teacherData){
  setFormDisabled(false);
 // 3. Handle missing record (doesn't exist in IndexedDB or Firebase)
 if (!teacherData) {
  alertbox("Teacher record not found.","error");
  window.location.href = `teachers.html?school=${schoolId}`;
  return;
}

// 4. Auto-populate form fields

document.getElementById('name').value = teacherData.name || '';
document.getElementById('dob').value = teacherData.dob || '';
document.getElementById('gender').value = teacherData.gender || '';
document.getElementById('subject').value = teacherData.subject || '';
document.getElementById('qualification').value = teacherData.qualification || '';
document.getElementById('contact').value = teacherData.contact || '';
document.getElementById('address').value = teacherData.address || '';
document.getElementById('classes').value = teacherData.classes || '';

document.getElementById('nic').value = teacherData.nic || '';
document.getElementById('firstAppointmentDate').value = teacherData.firstAppointmentDate || '';
document.getElementById('arrivalDate').value = teacherData.arrivalDate || '';
document.getElementById('salaryCode').value = teacherData.salaryCode || '';
document.getElementById('previousSchool').value = teacherData.previousSchool || '';

document.getElementById('signupEmail').value = teacherData.email || '';

if (teacherData.photoUrl) {
  existingPhotoUrl = teacherData.photoUrl;
  document.getElementById('currentPhotoPreview').src = teacherData.photoUrl;
}
}
// 4. AUTHENTICATION & ROLE VERIFICATION
let currentUser = null;
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    alertbox("Session expired. Redirecting to login...","error");
    window.location.href = `admin.html?school=${schoolId}`;
    return;
  }
  currentUser = user;

});

// 5. CROPPER ENGINE FOR OPTIONAL NEW PHOTO
let cropper;
const imageInput = document.getElementById('imageInput');
const imageToCrop = document.getElementById('imageToCrop');
const imgContainer = document.querySelector('.img-container');

imageInput.addEventListener('change', (e) => {
  const files = e.target.files;
  if (files && files.length > 0) {
    const reader = new FileReader();
    reader.onload = (event) => {
      imageToCrop.src = event.target.result;
      imgContainer.style.display = 'block';

      if (cropper) cropper.destroy();
      cropper = new Cropper(imageToCrop, {
        aspectRatio: 1,
        viewMode: 1,
        autoCropArea: 1
      });
    };
    reader.readAsDataURL(files[0]);
  }
});

function getCroppedBlob() {
  return new Promise((resolve) => {
    if (!cropper) {
      resolve(null);
      return;
    }
    const canvas = cropper.getCroppedCanvas({ width: 200, height: 200 });
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg');
  });
}

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

// 6. FORM SUBMISSION & FIREBASE UPDATE
document.getElementById('editTeacherForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!currentUser) {
    alertbox("Authenticating... Please try again in a moment.","error");
    return;
  }

  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.innerText = "Saving Changes...";

  try {
    db.goOnline();
    const newEmail = document.getElementById('signupEmail').value;
    console.log(newEmail)
    console.log(currentUser.email)
    if (currentUser && newEmail && newEmail !== currentUser.email) {
    await currentUser.updateEmail(newEmail);
    console.log("Auth email updated successfully");
  }
    let finalPhotoUrl = existingPhotoUrl;

    // Process image upload only if a new photo was chosen
    const croppedBlob = await getCroppedBlob();
    if (croppedBlob) {
      finalPhotoUrl = await uploadToCloudinary(croppedBlob);
    }

    const updatedData = {
      name: document.getElementById('name').value,
      dob: document.getElementById('dob').value,
      gender: document.getElementById('gender').value,
      nic: document.getElementById('nic').value,                        
      subject: document.getElementById('subject').value,
      firstAppointmentDate: document.getElementById('firstAppointmentDate').value, 
      arrivalDate: document.getElementById('arrivalDate').value,         
      salaryCode: document.getElementById('salaryCode').value,          
      previousSchool: document.getElementById('previousSchool').value,  
      qualification: document.getElementById('qualification').value,
      contact: document.getElementById('contact').value,
      address: document.getElementById('address').value,
      classes: document.getElementById('classes').value,
      email: newEmail,                                                 
      photoUrl: finalPhotoUrl,
      updatedAt: firebase.database.ServerValue.TIMESTAMP,
      updatedBy: currentUser.uid,
      school: schoolId
    };

// Map human-readable long keys to Firebase short keys (e.g., name -> a, updatedAt -> A)
const shortPayload = mapUserToFirebase(updatedData);
// Update Firebase with short keys
await db.ref(`schools/${schoolId}/users/${teacherKey}`).update(shortPayload);

alertbox("Teacher profile updated successfully!", "success");
window.location.href = `teacher.html?school=${schoolId}`;
  } catch (err) {
    console.error(err);
    alertbox("An error occurred during update: " + err.message,"error");
  } finally {
    db.goOffline();
    submitBtn.disabled = false;
    submitBtn.innerText = "Save Changes";
  }
});


function loadFromFirebaseDirect() {
  setFormDisabled(true);
  
  return new Promise(async (resolve) => {
    
    // Bring database online just for this fetch
  

    try {
      db.goOnline();
      const snapshot = await db.ref(`schools/${schoolId}/users/${teacherKey}`).once('value');
      const rawFirebaseData = snapshot.val();
      
      if (rawFirebaseData) {
        // Unmap short keys back to long keys so populateForm() can read them correctly
        const decodedData = unmapUserFromFirebase(rawFirebaseData);
        populateForm(decodedData);
        resolve(decodedData);
      } else {
        console.warn("User not found in DB.");
        resolve(null);
      }
    } catch (error) {
      console.error("Error fetching from DB:", error);
      resolve(null);
    } finally {
      // Go offline immediately after fetch to reduce simultaneous connections
      db.goOffline();
    }
  });
}
function setFormDisabled(isDisabled) {
  const form = document.getElementById('editTeacherForm');
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