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

if (!schoolId) {
    alertbox('Missing required school in URL parameters.', "error");
    throw new Error("Missing parameters");
  }
  // Ensure user is authenticated before allowing interaction
  auth.onAuthStateChanged((user) => {
    if (!user) {
      // Redirect to login page if unauthenticated
      window.location.href = `admin.html?school=${schoolId}`;
    }
  });
  // 2. IMAGE SELECTION & CROPPER INITIALIZATION
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
          aspectRatio: 1, // 1:1 Square Ratio
          viewMode: 1,
          autoCropArea: 1
        });
      };
      reader.readAsDataURL(files[0]);
    }
  });

  // Helper to get 200x200 blob asynchronously during submission
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

  // ID CARD POPUP
  function openIdCardModal() {
    const modal = document.getElementById('idCardModal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeIdCardModal() {
    const modal = document.getElementById('idCardModal');
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  function startNewStudent() {
    closeIdCardModal();

    document.getElementById('studentForm').reset();
    document.querySelector('.img-container').style.display = 'none';

    if (cropper) {
      cropper.destroy();
      cropper = null;
    }

    document.getElementById('imageToCrop').src = '';
  }

  document.getElementById('idCardModal').addEventListener('click', (e) => {
    if (e.target.id === 'idCardModal') {
      closeIdCardModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeIdCardModal();
    }
  });

  // 4. SUBMIT FORM & AUTO-CROP
  document.getElementById('studentForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const currentUser = auth.currentUser;
    if (!currentUser) {
      alertbox("Session expired. Please log in again.", "error");
      return;
    }

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerText = "Uploading...";

    try {

      const croppedBlob = await getCroppedBlob();
      let imageUrl = "";

      if (croppedBlob) {
        imageUrl = await uploadToCloudinary(croppedBlob);
      }

      db.goOnline();
      const studentRef = db.ref(`schools/${schoolId}/students`);

      // 1. Fetch all existing keys in users
      const snapshot = await studentRef.once('value');

      let maxId = 0;

      // 2. Loop through existing users and find the highest numeric ID
      snapshot.forEach((child) => {
        const numericKey = parseInt(child.key, 10);
        if (!isNaN(numericKey) && numericKey > maxId) {
          maxId = numericKey;
        }
      });

      // 3. Increment by 1 and pad with zero (01 -> 02 -> 03)
      const nextId = maxId + 1;
      const studentId = String(nextId).padStart(4, '0');

      // Helper to safely get form values
      const getValue = (id) => document.getElementById(id)?.value?.trim() || '';
      imageUrl = getCloudinaryPath(imageUrl)


      // 1. Build student object using clean, human-readable keys
      const rawStudentData = {
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
        lowIncome: document.querySelector('input[name="lowIncomeStatus"]:checked')?.value || '',
        aswesuma: document.querySelector('input[name="aswesumaBeneficiary"]:checked')?.value || '',
        siblings: Number(getValue('otherSiblingsInSchool')) || 0,
        photoUrl: imageUrl || '',
        updatedBy: currentUser.uid,
        updatedAt: firebase.database.ServerValue.TIMESTAMP
      };

      // 2. Filter out all blank/empty values ('', null, undefined) to save database space
      const cleanStudentData = {};
      Object.keys(rawStudentData).forEach(key => {
        const val = rawStudentData[key];
        if (val !== '' && val !== null && val !== undefined) {
          cleanStudentData[key] = val;
        }
      });

      const firebasePayload = syncEngine.mapToFirebase('students', cleanStudentData);

      await studentRef.child(studentId).set(firebasePayload);

      if (window.syncEngine) {
        await syncEngine.saveToIDB('students', {
          id: studentId,
          ...cleanStudentData,
          updatedAt: Date.now()
        });
      }

      alertbox("Student registered successfully", "success")
      document.getElementById('studentForm').reset();
      document.querySelector('.img-container').style.display = 'none';

      if (cropper) {
        cropper.destroy();
        cropper = null;
      }

      document.getElementById('imageToCrop').src = '';


    } catch (err) {
      console.error(err);
      alertbox("Permission denied or database error: " + err.message, "error");
    } finally {
      db.goOffline();
      submitBtn.disabled = false;
      submitBtn.innerText = "Register Student";
    }
  });
  const daySelect = document.getElementById('dobDay');
  const monthSelect = document.getElementById('dobMonth');
  const yearSelect = document.getElementById('dobYear');
  const hiddenDob = document.getElementById('dob');

  // Dynamic year bounds relative to current year
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 20;
  const maxYear = currentYear - 4;

  // 1. Populate Years Dynamically
  for (let y = maxYear; y >= minYear; y--) {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    yearSelect.appendChild(opt);
  }

  // 2. Load ONLY Saved Year from sessionStorage
  const savedYear = sessionStorage.getItem('dob_year');
  if (savedYear && savedYear >= minYear && savedYear <= maxYear) {
    yearSelect.value = savedYear;
  }

  // 3. Dynamic Days Population
  function updateDays() {
    const selectedYear = parseInt(yearSelect.value);
    const selectedMonth = parseInt(monthSelect.value);
    const currentDay = daySelect.value;

    let daysInMonth = 31;
    if (selectedMonth) {
      const yearToUse = selectedYear || 2024; // Leap year reference if year not picked yet
      daysInMonth = new Date(yearToUse, selectedMonth, 0).getDate();
    }

    daySelect.innerHTML = '<option value="" disabled selected>Day</option>';

    for (let d = 1; d <= daysInMonth; d++) {
      const val = String(d).padStart(2, '0');
      const opt = document.createElement('option');
      opt.value = val;
      opt.textContent = d;
      if (val === currentDay) opt.selected = true;
      daySelect.appendChild(opt);
    }

    syncAndSave();
  }

  // 4. Update Hidden Input & Save ONLY Year to sessionStorage
  function syncAndSave() {
    if (yearSelect.value) {
      sessionStorage.setItem('dob_year', yearSelect.value);
    }

    if (yearSelect.value && monthSelect.value && daySelect.value) {
      hiddenDob.value = `${yearSelect.value}-${monthSelect.value}-${daySelect.value}`;
    } else {
      hiddenDob.value = '';
    }
  }

  // Event Listeners
  monthSelect.addEventListener('change', updateDays);
  yearSelect.addEventListener('change', updateDays);
  daySelect.addEventListener('change', syncAndSave);

  // Initial Run
  updateDays();
  auth.onAuthStateChanged(user => {
    const isLoginPage = window.location.pathname.endsWith('admin.html');
    if (!user && navigator.onLine && !isLoginPage) {
      window.location.href = 'admin.html';
    }
  });