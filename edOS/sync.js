// Dictionary Mappings (Short Key <-> Long Key)
const MODULE_FIELD_MAPS = {
  students: {
    a: "name",
    b: "dob",
    c: "gender",
    d: "studentContact",
    e: "fatherName",
    f: "motherName",
    g: "address",
    h: "class",
    i: "admissionNo",
    j: "birthCertNo",
    k: "admissionYear",
    l: "admissionGrade",
    m: "positionsHeld",
    n: "discipline",
    o: "medical",
    p: "fatherNic",
    q: "motherNic",
    r: "guardianName",
    s: "guardianNic",
    t: "gnDivision",
    u: "dsDivision",
    v: "lowIncome",
    w: "aswesuma",
    x: "siblings",
    y: "photoUrl",
    z: "exam",
    A: "updatedAt",
    B: "updatedBy",
    D: "isDeleted",
    C: "classFee",
    E: "attendance",
    F: "isPaid",
    G: "paidAt"
  
  }
  // You can easily add maps for users, library, etc. here
};
const MODULE_FIELD_MAPS_USERS = {
  a: "name",
  b: "dob",
  c: "gender",
  d: "contact",
  e: "qualification",
  f: "subject",
  g: "address",
  h: "photoUrl",
  i: "role",
  j: "claimed",
  k: "school",
  l: "email",
  m: "arrivalDate",
  n: "firstAppointmentDate",
  o: "nic",
  p: "previousSchool",
  q: "salaryCode",
  r: "assignedClasses",
  A: "updatedAt",
  B: "updatedBy",
  D: "isDeleted"
};

// Merged into your main engine dictionary map:
MODULE_FIELD_MAPS.users = MODULE_FIELD_MAPS_USERS;
// Build reverse map once for quick lookup (name -> a)
const USER_REVERSE_MAP = {};
for (const shortKey in MODULE_FIELD_MAPS_USERS) {
  USER_REVERSE_MAP[MODULE_FIELD_MAPS_USERS[shortKey]] = shortKey;
}

/**
 * 1. Map: Convert readable user data -> Firebase short keys
 * e.g., { name: "John", role: "teacher" } -> { a: "John", i: "teacher" }
 */
function mapUserToFirebase(readableData) {
  if (!readableData || typeof readableData !== 'object') return readableData;

  const shortData = {};
  for (const key in readableData) {
    const shortKey = USER_REVERSE_MAP[key] || key;
    shortData[shortKey] = readableData[key];
  }
  return shortData;
}

/**
 * 2. Unmap: Convert Firebase short keys -> readable user data
 * e.g., { a: "John", i: "teacher" } -> { name: "John", role: "teacher" }
 */
function unmapUserFromFirebase(firebaseData) {
  if (!firebaseData || typeof firebaseData !== 'object') return firebaseData;

  const readableData = {};
  for (const key in firebaseData) {
    const readableKey = MODULE_FIELD_MAPS_USERS[key] || key;
    readableData[readableKey] = firebaseData[key];
  }
  return readableData;
}

class SchoolSyncEngine {
  constructor(firebaseDb, schoolId) {
    this.db = firebaseDb;
    this.schoolId = schoolId;
    this.idbName = `SIS_${this.schoolId}`;
    this.idbVersion = 3;
    this.idb = null;

    this.modules = ['students', 'users', 'library', 'timetables', 'student_progress', 'schoolDetails'];
  }

  // 1. Unmap: Convert short Firebase object { a: "John", A: 1772... } -> { name: "John", updatedAt: 1772... }
  unmapFromFirebase(moduleName, firebaseData) {
    if (!firebaseData || typeof firebaseData !== 'object') return firebaseData;
    const map = MODULE_FIELD_MAPS[moduleName];
    if (!map) return firebaseData; // Fallback if no map exists

    const readableData = {};
    for (const key in firebaseData) {
      const readableKey = map[key] || key; // Use long key if mapped, otherwise leave key as is
      readableData[readableKey] = firebaseData[key];
    }
    return readableData;
  }

  // 2. Map: Convert long object { name: "John", updatedAt: 1772... } -> { a: "John", A: 1772... }
  mapToFirebase(moduleName, readableData) {
    if (!readableData || typeof readableData !== 'object') return readableData;
    const map = MODULE_FIELD_MAPS[moduleName];
    if (!map) return readableData;

    // Build reverse map (name -> a)
    const reverseMap = {};
    for (const shortKey in map) {
      reverseMap[map[shortKey]] = shortKey;
    }

    const shortData = {};
    for (const key in readableData) {
      const shortKey = reverseMap[key] || key;
      shortData[shortKey] = readableData[key];
    }
    return shortData;
  }
  async getDB() {
    if (!this.idb) {
      await this.initIndexedDB();
    }
    return this.idb;
  }

  async transaction(storeName, mode = 'readonly') {
    const db = await this.getDB();
    try {
      return db.transaction(storeName, mode);
    } catch (error) {
      // If it failed because the connection was closing, force a reconnect and retry once
      if (error.name === 'InvalidStateError' || error.message.includes('closing')) {
        console.warn('[IndexedDB] Connection was closing. Retrying connection...');
        this.idb = null;
        const freshDb = await this.getDB();
        return freshDb.transaction(storeName, mode);
      }
      throw error;
    }
  }


  // 1. Initialize IndexedDB
  async initIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.idbName, this.idbVersion);

      request.onupgradeneeded = (event) => {
        const idb = event.target.result;
        this.modules.forEach(moduleName => {
          if (!idb.objectStoreNames.contains(moduleName)) {
            const store = idb.createObjectStore(moduleName, { keyPath: 'id' });
            if (moduleName === 'users') {
              store.createIndex('role', 'role', { unique: false });
            }
          }
        });
      };

      request.onsuccess = (event) => {
        this.idb = event.target.result;

        // Handle unexpected connection loss
        this.idb.onclose = () => {
          console.warn('[IndexedDB] Connection closed unexpectedly.');
          this.idb = null;
        };

        // Handle another tab trying to upgrade the database
        this.idb.onversionchange = () => {
          console.warn('[IndexedDB] Connection closing due to version change in another tab.');
          this.idb.close();
          this.idb = null;
        };

       
        resolve(this.idb);
      };

      request.onerror = (event) => reject(event.target.error);
    });
  }

  // IDB Helpers
  async saveToIDB(storeName, data) {
    const tx = await this.transaction(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const req = tx.objectStore(storeName).put(data);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async removeFromIDB(storeName, key) {
    const tx = await this.transaction(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const req = tx.objectStore(storeName).delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async clearIDBStore(storeName) {
    if (!this.idb) {
      try {
        await this.initIndexedDB();
      } catch (e) {
        return resolve();
      }
    }
    const tx = await this.transaction(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const req = tx.objectStore(storeName).clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async _syncModule(moduleName) {
    if (!navigator.onLine) return;
    const lastSyncKey = `lastSync_${this.schoolId}_${moduleName}`;
    const lastSyncTime = parseInt(localStorage.getItem(lastSyncKey) || '0', 10);

    try {
      const localRecords = await this.getLocalData(moduleName);
      const isLocalDBEmpty = !localRecords || localRecords.length === 0;

      // 1. Initial Load Fallback
      if (isLocalDBEmpty || lastSyncTime === 0) {
        await this._fullFetchModule(moduleName);
        return;
      }

      // 2. Query Firebase using REST API with orderBy and startAt parameters
      const nextSyncTime = lastSyncTime + 1;
      const url = `${firebaseConfig.databaseURL}/schools/${this.schoolId}/${moduleName}.json?orderBy=%22A%22&startAt=${nextSyncTime}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
    
      if (!data) return;


      let highestUpdatedAt = lastSyncTime;

      await Promise.all(
        Object.keys(data).map(async (key) => {
          const rawItem = data[key];
          if (!rawItem) return; // Skip empty nodes

          // Await decryption for both sensitive fields
          if (rawItem.d) rawItem.d = await this.decryptField(rawItem.d);
          if (rawItem.g) rawItem.g = await this.decryptField(rawItem.g);

          const item = this.unmapFromFirebase(moduleName, rawItem);

          if (item.updatedAt && item.updatedAt > highestUpdatedAt) {
            highestUpdatedAt = item.updatedAt;
          }

          if (item.isDeleted) {
            this.removeFromIDB(moduleName, key);
          } else {
            const record = { id: key, ...item };
            this.saveToIDB(moduleName, record);
          }
        })
      );

      localStorage.setItem(lastSyncKey, highestUpdatedAt);

    } catch (err) {
      console.error(`[SyncEngine] Error syncing ${moduleName}:`, err);
    }
  }

  async _fullFetchModule(moduleName) {
    const lastSyncKey = `lastSync_${this.schoolId}_${moduleName}`;

    try {
      const url = `${firebaseConfig.databaseURL}/schools/${this.schoolId}/${moduleName}.json`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json() || {};
    

      await this.clearIDBStore(moduleName);
      let maxServerTimestamp = 0;

      await Promise.all(
        Object.keys(data).map(async (key) => {
          const rawItem = data[key];
          if (!rawItem) return; // Skip empty nodes

          // Await both decryption fields safely
          rawItem.d = await this.decryptField(rawItem.d);
          rawItem.g = await this.decryptField(rawItem.g);


          const item = this.unmapFromFirebase(moduleName, rawItem);

          if (!item.isDeleted) {
            const record = { id: key, ...item };
            this.saveToIDB(moduleName, record);
          }

          if (item.updatedAt && item.updatedAt > maxServerTimestamp) {
            maxServerTimestamp = item.updatedAt;
          }
        })
      );

      if (maxServerTimestamp > 0) {
        localStorage.setItem(lastSyncKey, maxServerTimestamp);
      }

    } catch (err) {
      console.error(`[SyncEngine] Error during full fetch for ${moduleName}:`, err);
    }
  }



  // Section Sync Wrappers
  async syncStudents() { await this._syncModule('students'); }
  async syncUsers() { await this._syncModule('users'); }
  async syncLibrary() { await this._syncModule('library'); }
  async syncTimetables() { await this._syncModule('timetables'); }
  async syncStudent_progress() { await this._syncModule('student_progress'); }

  // Local IDB Reader Helpers
  async getLocalData(moduleName) {
    const tx = await this.transaction(moduleName, 'readonly');
    return new Promise((resolve, reject) => {
      const request = tx.objectStore(moduleName).getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getLocalRecord(moduleName, key) {
    const tx = await this.transaction(moduleName, 'readonly');
    return new Promise((resolve, reject) => {
      const request = tx.objectStore(moduleName).get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getLocalUsersByRole(roleName) {
    const tx = await this.transaction('users', 'readonly');
    return new Promise((resolve, reject) => {
      const index = tx.objectStore('users').index('role');
      const request = index.getAll(roleName);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getSchoolDetails() {
    try {
      const url = `${firebaseConfig.databaseURL}/schools/${this.schoolId}/details.json`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const remoteData = await response.json();
      if (remoteData) {
        const formattedData = { id: 'info', ...remoteData };
        this.saveToIDB('schoolDetails', formattedData);
        return formattedData;
      }
    } catch (err) {
      console.error("[SyncEngine] Firebase fetch failed:", err);
    }

    return null;
  }
  async getExams() {
    try {
      const url = `${firebaseConfig.databaseURL}/schools/${this.schoolId}/details/exams.json`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const remoteData = await response.json();
      if (remoteData) {
        return remoteData;
      }
    } catch (err) {
      console.error("[SyncEngine] Firebase fetch failed:", err);
    }

    return null;
  }


  async getAESKey() {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      enc.encode(domain.padEnd(32).slice(0, 32)), // Ensures 256-bit length
      { name: "AES-GCM" },
      false,
      ["encrypt", "decrypt"]
    );
    return keyMaterial;
  }

  // Decrypt sensitive fields (phone, address)
  async decryptField(base64Cipher) {
    if (!base64Cipher || typeof base64Cipher !== 'string') return "";

    try {
      // Convert Base64 back into raw byte array (combines IV + Ciphertext)
      const combined = Uint8Array.from(atob(base64Cipher), c => c.charCodeAt(0));

      // Extract the first 12 bytes which were used as the random IV
      const iv = combined.slice(0, 12);
      // Extract the remaining bytes as the actual ciphertext
      const data = combined.slice(12);

      const key = await this.getAESKey();

      // Decrypt using browser's built-in cryptographic engine
      const decrypted = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv },
        key,
        data
      );

      const dec = new TextDecoder();
      return dec.decode(decrypted);
    } catch (err) {
      // Fallback: If data wasn't encrypted yet (legacy/plain text), return it as-is instead of breaking
      return base64Cipher;
    }
  }
}

function alertbox(message, type = "success") {

  // Create container
  let container = document.getElementById("alertbox-container");

  if (!container) {
    container = document.createElement("div");
    container.id = "alertbox-container";

    const style = document.createElement("style");

    style.textContent = `
          #alertbox-container {
              position: fixed;
              top: 20px;
              right: 20px;
              z-index: 99999;
              display: flex;
              flex-direction: column;
              gap: 12px;
          }
  
          .alertbox {
              min-width: 300px;
              max-width: 420px;
              padding: 15px 16px;
              background: white;
              border-radius: 12px;
              box-shadow: 0 8px 30px rgba(0,0,0,.15);
              display: flex;
              align-items: center;
              gap: 12px;
              font-family: Arial, sans-serif;
              border-left: 5px solid;
              animation: alertboxIn .3s ease;
          }
  
          .alertbox.success {
              border-color: #22c55e;
          }
  
          .alertbox.error {
              border-color: #ef4444;
          }
  
          .alertbox-icon {
              width: 32px;
              height: 32px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 18px;
              font-weight: bold;
              flex-shrink: 0;
          }
  
          .alertbox.success .alertbox-icon {
              background: #dcfce7;
              color: #16a34a;
          }
  
          .alertbox.error .alertbox-icon {
              background: #fee2e2;
              color: #dc2626;
          }
  
          .alertbox-message {
              flex: 1;
              font-size: 15px;
              color: #333;
              line-height: 1.4;
          }
  
          .alertbox-close {
              border: none;
              background: none;
              color: #888;
              font-size: 22px;
              cursor: pointer;
              padding: 2px 5px;
              box-shadow:none;
          }
         
          .alertbox-close:hover {
              color: #222;
              box-shadow:none;
              background:none
          }
  
          .alertbox.closing {
              animation: alertboxOut .25s ease forwards;
          }
  
          @keyframes alertboxIn {
              from {
                  opacity: 0;
                  transform: translateX(50px);
              }
              to {
                  opacity: 1;
                  transform: translateX(0);
              }
          }
  
          @keyframes alertboxOut {
              from {
                  opacity: 1;
                  transform: translateX(0);
              }
              to {
                  opacity: 0;
                  transform: translateX(50px);
              }
          }
  
          @media (max-width: 500px) {
              #alertbox-container {
                  left: 15px;
                  right: 15px;
                  top: 15px;
              }
  
              .alertbox {
                  min-width: 0;
                  max-width: none;
              }
          }
      `;

    document.head.appendChild(style);
    document.body.appendChild(container);
  }

  // Create alert
  const alert = document.createElement("div");
  alert.className = `alertbox ${type}`;

  const icon = type === "success" ? "✓" : "!";

  alert.innerHTML = `
      <div class="alertbox-icon">${icon}</div>
      <div class="alertbox-message">${message}</div>
      <button class="alertbox-close">&times;</button>
  `;

  container.appendChild(alert);

  // Close function
  const close = () => {
    if (alert.classList.contains("closing")) return;

    alert.classList.add("closing");

    setTimeout(() => {
      alert.remove();
    }, 250);
  };

  // Close button
  alert.querySelector(".alertbox-close").onclick = close;

  // Auto close after 4 seconds
  setTimeout(close, 4000);
}

// Mapping of single-letter keys to their human-readable labels
const STUDENT_FIELD_MAP = {
  a: "Name",
  b: "Date of Birth",
  c: "Gender",
  d: "Student Contact",
  e: "Father's Full Name",
  f: "Mother's Full Name",
  g: "Home Address",
  h: "Current Class",
  i: "Admission Number",
  j: "Birth Certificate Number",
  k: "Year of Admission",
  l: "Grade of Admission",
  m: "Positions Held",
  n: "Discipline & Conduct",
  o: "Medical Conditions",
  p: "Father's NIC",
  q: "Mother's NIC",
  r: "Guardian's Full Name",
  s: "Guardian's NIC",
  t: "Grama Niladhari Division",
  u: "Divisional Secretariat Division",
  v: "Low-Income Status",
  w: "Aswesuma Beneficiary",
  x: "Siblings in School",
  y: "Photo URL",
  C: "Class Fee",
  D: "Attendance",
  B: "Updated By",
  A: "Updated At",
  z: "exam"
};
function getFullCloudinaryUrl(relativePath) {
  const CLOUDINARY_BASE = "https://res.cloudinary.com/vmorkfqp/image/upload/";
  if (!relativePath) return '';
  if (relativePath.startsWith('http')) return relativePath; // Fallback if full URL was passed

  return `${CLOUDINARY_BASE}${relativePath}`;
}
// Function to extract relative path
function getCloudinaryPath(fullUrl) {
  if (!fullUrl) return '';

  // If it's not a full valid URL, assume it's already a cropped path and return as-is
  if (!URL.canParse(fullUrl)) {
    return fullUrl;
  }

  const parsed = new URL(fullUrl);
  const pathSegments = parsed.pathname.split('/');
  const uploadIndex = pathSegments.indexOf('upload');

  if (uploadIndex !== -1) {
    return pathSegments.slice(uploadIndex + 1).join('/');
  }

  return fullUrl;
}





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
let userID = null;
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.database();
db.goOffline();
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
let schoolId, syncEngine = null;
const urlParams = new URLSearchParams(window.location.search);
schoolId = urlParams.get('school')?.trim().toLowerCase();
if (schoolId) {
  syncEngine = new SchoolSyncEngine(db, schoolId);
}

const CLOUDINARY_UPLOAD_PRESET = "school";
const CLOUDINARY_CLOUD_NAME = "vmorkfqp";
auth.onAuthStateChanged(async (user) => {
  if (user) {
    userID = user.uid;
  }
})


const domain = "digibook";

async function getKey() {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(domain.padEnd(32).slice(0, 32)), // Ensure 256-bit
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
  return keyMaterial;
}

async function encryptField(plainText) {
  if (!plainText) return "";
  const enc = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await getKey();

  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    enc.encode(plainText)
  );

  const combined = new Uint8Array(iv.length + new Uint8Array(encrypted).length);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  return btoa(String.fromCharCode.apply(null, combined));
}


const DEFAULT_TEMPLATE = 'tpl-modern';
const DEFAULT_COLOR = 'blue';
// Boot setup
// Variable to store the cached Promise
let settingsPromise = null;

function getSetting() {
  if (!settingsPromise) {
    settingsPromise = (async () => {
      if (!schoolId) return { template: DEFAULT_TEMPLATE, color: DEFAULT_COLOR };

      try {
        // Construct the REST API endpoint URL
        const url = `${firebaseConfig.databaseURL}/schools/${schoolId}/details.json`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data) {
          return data;
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      }

      return { template: DEFAULT_TEMPLATE, color: DEFAULT_COLOR };
    })();
  }
  return settingsPromise;
}
