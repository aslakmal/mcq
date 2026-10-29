// ==========================================
    // 1. URL PARAMETER VALIDATION
    // ==========================================

    const rawTeacherId = urlParams.get('id');
    const teacherId = rawTeacherId && rawTeacherId.trim() !== '' ? rawTeacherId.trim() : null;

    if (schoolId) {
      const headerTitle = document.getElementById('schoolHeaderTitle');
      const dashTitle = document.getElementById('dashSchoolTitle');
      if (headerTitle) headerTitle.innerText = "PORTAL";
      if (dashTitle) dashTitle.innerText = "TEACHER PANEL";
    }

    // ==========================================
    // 2. DYNAMIC TAB VISIBILITY BASED ON TEACHER ID
    // ==========================================
    const tabHeader = document.querySelector('.tab-header');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const signupTabBtn = tabButtons[1];

    if (teacherId) {
      const teacherIdInput = document.getElementById('signupTeacherId');
      if (teacherIdInput) teacherIdInput.value = teacherId;
    } else if (signupTabBtn) {
      signupTabBtn.style.display = 'none';
      if (tabHeader) {
        tabHeader.style.gridTemplateColumns = '1fr';
      }
    }

    let pendingTeacherData = null;

    // ==========================================
    // 3. TAB SWITCHING LOGIC
    // ==========================================
    function switchTab(tab) {
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

      if (tab === 'login' || !teacherId) {
        if (tabButtons[0]) tabButtons[0].classList.add('active');
        document.getElementById('loginTab').classList.add('active');
      } else {
        if (tabButtons[1]) tabButtons[1].classList.add('active');
        document.getElementById('signupTab').classList.add('active');
        verifyAndFetchTeacherRecord();
      }
    }

    // Pre-fetch teacher record when clicking Sign Up tab
    async function verifyAndFetchTeacherRecord() {
      if (!teacherId || !schoolId) return;

      const nameInput = document.getElementById('signupName');
      const emailInput = document.getElementById('signupEmail');
      const errorDiv = document.getElementById('signupError');
      if (errorDiv) errorDiv.innerText = '';

      try {
        db.goOnline();
        const teacherRef = db.ref(`schools/${schoolId}/users/${teacherId}`);
        const snapshot = await teacherRef.once('value');

        if (!snapshot.exists()) {
          throw new Error("Invalid Teacher ID. No record found for this school.");
        }

        pendingTeacherData = unmapUserFromFirebase(snapshot.val());

        if (pendingTeacherData.role !== 'teacher') {
          throw new Error("This ID is not registered as a teacher account.");
        }

        if (pendingTeacherData.claimed === true) {
          throw new Error("This teacher account has already been activated. Please log in.");
        }

        if (nameInput) nameInput.value = pendingTeacherData.fullName || "Teacher";
        if (emailInput && pendingTeacherData.email) {
          emailInput.value = pendingTeacherData.email;
        }
      } catch (err) {
        if (errorDiv) errorDiv.innerText = err.message;
      }finally{
        db.goOffline();
      }
    }

    // ==========================================
    // 4. AUTH STATE LISTENER (SPA Router Core)
    // ==========================================
    auth.onAuthStateChanged(async (user) => {
      const authView = document.getElementById('authView');
      const teacherDashboard = document.getElementById('teacherDashboard');
      const authLoading = document.getElementById('authLoading');

      authView.style.display = 'none';
      teacherDashboard.style.display = 'none';
      authLoading.style.display = 'flex';

      if (user) {
        try {
          db.goOnline(); 

          let activeSchoolId = user.displayName ? user.displayName.trim().toLowerCase() : schoolId;

          if (!user.displayName && activeSchoolId) {
            await user.updateProfile({ displayName: activeSchoolId });
          }

          schoolId = activeSchoolId;

          if (!schoolId) {
            throw new Error("No school ID attached to this user profile or URL.");
          }

          const headerTitle = document.getElementById('schoolHeaderTitle');
          const dashTitle = document.getElementById('dashSchoolTitle');
          if (headerTitle) headerTitle.innerText = "PORTAL";
          if (dashTitle) dashTitle.innerText = "TEACHER PANEL";

          // Query user by authUid index instead of direct path lookup
          const userRef = db.ref(`schools/${schoolId}/users/${user.uid}`);
          const snapshot = await userRef.once('value');

          const userData = unmapUserFromFirebase(snapshot.val());

          if (userData && userData.role === 'teacher') {
            if (typeof SchoolSyncEngine !== 'undefined') {
              await syncEngine.initIndexedDB();
            }

            document.getElementById('userWelcomeText').innerText =
              `Logged in as: ${userData.fullName} (Teacher)`;

            authLoading.style.display = 'none';
            teacherDashboard.style.display = 'block';
          } else {
            alertbox("Unauthorized access. This account is not registered as a Teacher for " + schoolId, "error");
            await auth.signOut();

            authLoading.style.display = 'none';
            authView.style.display = 'block';
          }
        } catch (err) {
          console.error("Authentication check failed:", err);

          authLoading.style.display = 'none';
          authView.style.display = 'block';
          teacherDashboard.style.display = 'none';

          const loginError = document.getElementById('loginError');
          if (loginError) {
            loginError.innerText = "Unable to verify your account. Please try again.";
          }
        }finally{
          db.goOffline();
        }
      } else {
        authLoading.style.display = 'none';
        authView.style.display = 'block';
        teacherDashboard.style.display = 'none';
      }
    });

 // ==========================================
    // 5. SIGN UP LOGIC (ACCOUNT CLAIMING)
    // ==========================================
    const signupForm = document.getElementById('signupForm');

    if (signupForm) {
      signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!teacherId || !schoolId) return;

        const email = document.getElementById('signupEmail').value.trim().toLowerCase();
        const password = document.getElementById('signupPassword').value;
        const errorDiv = document.getElementById('signupError');
        const btn = document.getElementById('signupBtn');

        if (errorDiv) errorDiv.innerText = '';
        btn.disabled = true;

        try {
          db.goOnline();
          const teacherRef = db.ref(`schools/${schoolId}/users/${teacherId}`);
          const snapshot = await teacherRef.once('value');

          if (!snapshot.exists()) {
            throw new Error("Invalid Teacher ID. Record does not exist.");
          }

          const teacherRecord = unmapUserFromFirebase(snapshot.val());
          if (teacherRecord.role !== 'teacher') {
            throw new Error("Selected account is not a teacher account.");
          }
          if (teacherRecord.claimed === true) {
            throw new Error("This account has already been claimed. Please use the Login tab.");
          }

          // 1. Create Firebase Auth User (automatically logs them in and generates user.uid)
          const userCredential = await auth.createUserWithEmailAndPassword(email, password);
          const user = userCredential.user;

          await user.updateProfile({
            displayName: schoolId
          });

          const readableUpdates = {
            email: email,
            claimed: true,
            updatedAt: Date.now()
          };

          // 2. Merge old teacher record with updates
          const fullReadableData = { ...teacherRecord, ...readableUpdates };
          const fullShortData = mapUserToFirebase(fullReadableData);
          
          // 3. Save data under the new Auth UID node (Allowed because auth.uid === $uid)
          await db.ref(`schools/${schoolId}/users/${user.uid}`).set(fullShortData);
          
          // 4. Remove the old numeric placeholder record (e.g., "15")
          await teacherRef.remove();

          alertbox("Teacher Account Activated Successfully!", "success");

        } catch (err) {
          if (errorDiv) errorDiv.innerText = err.message;
          btn.disabled = false;
        }finally{
          db.goOffline();
        }
      });
    }

    // ==========================================
    // 6. LOGIN LOGIC
    // ==========================================
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      const errorDiv = document.getElementById('loginError');
      const btn = document.getElementById('loginBtn');

      if (errorDiv) errorDiv.innerText = '';
      btn.disabled = true;

      try {
        await auth.signInWithEmailAndPassword(email, password);
      } catch (err) {
        if (errorDiv) errorDiv.innerText = err.message;
      } finally {
        btn.disabled = false;
      }
    });

    // ==========================================
    // 7. BFCACHE RECOVERY & LOGOUT
    // ==========================================
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

    function logout() {
      auth.signOut();
    }