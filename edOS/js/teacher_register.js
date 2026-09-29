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
    alertbox("Missing 'school' parameter.","error");
    
    const form = document.querySelector('form');
    if (form) {
      form.querySelectorAll('input, select, textarea, button').forEach(el => el.disabled = true);
    }

    throw new Error("Initialization halted: Missing 'school' URL parameter.");
  }



  async function initApp() {
    try {
      await syncEngine.initIndexedDB();
    } catch (err) {
      console.error("Failed to initialize Sync Engine:", err);
    }
  }

  initApp();

 

  // 5. IMAGE SELECTION & CROPPER INITIALIZATION
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

  // 6. CLOUDINARY UPLOAD FUNCTION
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




// ==========================================
  // SUBMIT FORM & DIRECT TEACHER SIGN-UP
  // ==========================================
  document.getElementById('teacherForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerText = "Registering...";

    try {
      db.goOnline();
      const email = document.getElementById('signupEmail').value.trim().toLowerCase();
      const password = document.getElementById('signupPassword').value; // Make sure this input exists in your HTML

      if (!email || !password) {
        throw new Error("Email and Password are required.");
      }

      // 1. Handle image upload first
      const croppedBlob = await getCroppedBlob();
      const imageUrl = croppedBlob ? await uploadToCloudinary(croppedBlob) : "";

      // 2. Create Firebase Auth Account (Generates unique user.uid)
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // 3. Save schoolId into Firebase Auth profile displayName
      await user.updateProfile({
        displayName: schoolId
      });

      // 4. Prepare human-readable teacher data
      const teacherData = {
        fullName: document.getElementById('fullName').value,
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
        assignedClasses:document.getElementById('classes').value,
        email: email,
        photoUrl: imageUrl,
        role: 'teacher',
        school: schoolId,
        updatedBy: user.uid,
        updatedAt: firebase.database.ServerValue.TIMESTAMP
    };

      // 5. Compress keys to short format using your module map
      const compressedPayload = mapUserToFirebase(teacherData);

      // 6. Save directly under the user's Auth UID (Satisfies auth.uid === $uid rule)
      await db.ref(`schools/${schoolId}/users/${user.uid}`).set(compressedPayload);

      alertbox("Teacher registered successfully!", "success");

      // Optional: Redirect to dashboard after a brief delay
    
        location.href="teacher.html?school="+schoolId; 
     

    } catch (err) {
      console.error(err);
      alertbox("An error occurred during registration: " + err.message, "error");
    } finally {
      db.goOffline();
      submitBtn.disabled = false;
      submitBtn.innerText = "Register Teacher";
    }
  });

