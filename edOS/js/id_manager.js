/* =========================================================
   ID CARD MANAGER 
   ========================================================= */

 const firebaseConfig = {
  apiKey: "AIzaSyBTq5fuuBh9Ye5r7exiJFtLjJpQ-9vIY2U",
  authDomain: "school-62c45.firebaseapp.com",
  databaseURL: "https://school-62c45-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "school-62c45",
  storageBucket: "school-62c45.firebasestorage.app",
  messagingSenderId: "213099404706",
  appId: "1:213099404706:web:d65d7ec257c1119f3966fb",
  measurementId: "G-8QG01WT32P"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.database();

const urlParams = new URLSearchParams(window.location.search);
const rawSchoolId = urlParams.get('school');

// Set persistence (LOCAL keeps the user logged in across tab/browser restarts)
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  .then(() => {
    // Wait for auth state to be restored
    auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        console.log("No user signed in.");
      }
    });
  })
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });

  const DEFAULT_TEMPLATE = 'tpl-modern';
  const DEFAULT_COLOR = 'blue';
  
  /**
   * Helper function to retrieve the active School ID.
   * Replace or adapt this method according to your app's session state.
   */
  function getSchoolId() {
    const urlParams = new URLSearchParams(window.location.search);
    const paramId = urlParams.get("school");
    if (paramId) return paramId;
  
    return false;
  }
  
  // Fetch settings from Firebase
  async function getSetting() {
    const schoolId = getSchoolId();
    if (!schoolId) return { template: DEFAULT_TEMPLATE, color: DEFAULT_COLOR };
  
    try {
      const snapshot = await db.ref(`schools/${schoolId}/idData`).once("value");
      const data = snapshot.val();
  
      if (data) {
        return {
          template: data.template || DEFAULT_TEMPLATE,
          color: data.color || DEFAULT_COLOR
        };
      }
    } catch (err) {
      console.error("Failed to fetch settings from Firebase:", err);
    }
  
    return { template: DEFAULT_TEMPLATE, color: DEFAULT_COLOR };
  }
  
  // Save settings to Firebase under schools/${schoolId}/idData
  async function saveSetting() {
    const schoolId = getSchoolId();
    if (!schoolId) {
      console.error("School ID missing!");
      return;
    }
  
    // Get current active values from DOM
    const frontCard = document.getElementById('frontCard');
    const selectElem = document.getElementById('templateSelect');
  
    const color = frontCard ? frontCard.getAttribute('data-color') || DEFAULT_COLOR : DEFAULT_COLOR;
    const template = selectElem ? selectElem.value || DEFAULT_TEMPLATE : DEFAULT_TEMPLATE;
  
    const payload = {
      template: template,
      color: color
      };
  
    try {
      await db.ref(`schools/${schoolId}/idData`).update(payload);
      console.log("Settings successfully saved to Firebase under schools/" + schoolId + "/idData");
      alertbox("Settings saved successfully!","success");
    } catch (err) {
      console.error("Failed to save settings to Firebase:", err);
      alert("Error saving settings to Firebase.","error");
    }
  }
  
  // Apply Color Theme to DOM
  function applyColorToCard(colorName) {
    const frontCard = document.getElementById('frontCard');
    const backCard = document.getElementById('backCard');
    
    if (frontCard) frontCard.setAttribute('data-color', colorName);
    if (backCard) backCard.setAttribute('data-color', colorName);
  
    // Update Active Swatch UI
    document.querySelectorAll('.color-box').forEach(btn => {
      btn.classList.toggle('active', btn.classList.contains(`color-${colorName}`));
    });
  }
  
  // Apply Template Theme to DOM
  function applyTemplateToCard(templateId) {
    const frontCard = document.getElementById('frontCard');
    const backCard = document.getElementById('backCard');
    const selectElem = document.getElementById('templateSelect');
  
    const cleanClasses = (el) => {
      el.className = el.className.replace(/\btpl-\S+/g, '').trim();
      el.classList.add(templateId);
    };
  
    if (frontCard) cleanClasses(frontCard);
    if (backCard) cleanClasses(backCard);
    if (selectElem) selectElem.value = templateId;
  }
  
  // Handlers for UI Events (Applies locally; click saveSetting() button to sync to Firebase)
  function applyAndSaveColor(colorName) {
    applyColorToCard(colorName);
  }
  
  function applyAndSaveTemplate(templateId) {
    applyTemplateToCard(templateId);
  }
  
  // Boot setup
  document.addEventListener("DOMContentLoaded", async () => {
    const settings = await getSetting();
    
    applyTemplateToCard(settings.template);
    applyColorToCard(settings.color);
  });