// Dictionary Mappings (Short Key <-> Long Key)
const MODULE_FIELD_MAPS = {
  students: {
    a: "fullName",
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
    D: "isDeleted"
  }
  // You can easily add maps for users, library, etc. here
};
const MODULE_FIELD_MAPS_USERS = {
  a: "fullName",
  b: "dob",
  c: "gender",
  d: "subject",
  e: "qualification",
  f: "contact",
  g: "address",
  h: "photoUrl",
  i: "role",
  j: "claimed",
  k: "school",
  l: "email",
  m:"arrivalDate",
  n:"firstAppointmentDate",
  o:"nic",
  p:"previousSchool",
  q:"salaryCode",
  r:"assignedClasses",
  A: "updatedAt",
  B: "updatedBy",
  D: "isDeleted"
};

// Merged into your main engine dictionary map:
MODULE_FIELD_MAPS.users = MODULE_FIELD_MAPS_USERS;
// Build reverse map once for quick lookup (fullName -> a)
const USER_REVERSE_MAP = {};
for (const shortKey in MODULE_FIELD_MAPS_USERS) {
  USER_REVERSE_MAP[MODULE_FIELD_MAPS_USERS[shortKey]] = shortKey;
}

/**
 * 1. Map: Convert readable user data -> Firebase short keys
 * e.g., { fullName: "John", role: "teacher" } -> { a: "John", i: "teacher" }
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
 * e.g., { a: "John", i: "teacher" } -> { fullName: "John", role: "teacher" }
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

    this.modules = ['students', 'users', 'library', 'timetables', 'student_progress','schoolDetails'];
  }

  // 1. Unmap: Convert short Firebase object { a: "John", A: 1772... } -> { fullName: "John", updatedAt: 1772... }
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

  // 2. Map: Convert long object { fullName: "John", updatedAt: 1772... } -> { a: "John", A: 1772... }
  mapToFirebase(moduleName, readableData) {
    if (!readableData || typeof readableData !== 'object') return readableData;
    const map = MODULE_FIELD_MAPS[moduleName];
    if (!map) return readableData;

    // Build reverse map (fullName -> a)
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
        console.log(`[IndexedDB] Connected: ${this.idbName}`);
        resolve(this.idb);
      };

      request.onerror = (event) => reject(event.target.error);
    });
  }

  // IDB Helpers
  saveToIDB(storeName, data) {
    if (!this.idb) return;
    const tx = this.idb.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).put(data);
  }

  removeFromIDB(storeName, key) {
    if (!this.idb) return;
    const tx = this.idb.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).delete(key);
  }

  async clearIDBStore(storeName) {
    return new Promise((resolve, reject) => {
      if (!this.idb) return resolve();
      const tx = this.idb.transaction(storeName, 'readwrite');
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
      console.log(1);
      const localRecords = await this.getLocalData(moduleName);
      const isLocalDBEmpty = !localRecords || localRecords.length === 0;

      // 1. Initial Load Fallback
      if (isLocalDBEmpty || lastSyncTime === 0) {
        await this._fullFetchModule(moduleName);
        return;
      }

      // 2. Query Firebase using REST API with orderBy and startAt parameters
      const databaseURL = "https://school-62c45-default-rtdb.asia-southeast1.firebasedatabase.app";
      const nextSyncTime = lastSyncTime + 1;
      const url = `${databaseURL}/schools/${this.schoolId}/${moduleName}.json?orderBy=%22A%22&startAt=${nextSyncTime}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      console.log(data);
      if (!data) return;

      console.log(5);
      let highestUpdatedAt = lastSyncTime;

      await Promise.all(
        Object.keys(data).map(async (key) => {
          const rawItem = data[key];
          if (!rawItem) return; // Skip empty nodes
      
          // Await decryption for both sensitive fields
          rawItem.d = await this.decryptField(rawItem.d);
          rawItem.g = await this.decryptField(rawItem.g);
          
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
      console.log(6);
      const databaseURL = "https://school-62c45-default-rtdb.asia-southeast1.firebasedatabase.app";
      const url = `${databaseURL}/schools/${this.schoolId}/${moduleName}.json`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json() || {};
      console.log(7);

      await this.clearIDBStore(moduleName);
      let maxServerTimestamp = 0;
      
      await Promise.all(
        Object.keys(data).map(async (key) => {
          const rawItem = data[key];
          if (!rawItem) return; // Skip empty nodes
      
          // Await both decryption fields safely
          rawItem.d = await this.decryptField(rawItem.d);
          rawItem.g = await this.decryptField(rawItem.g);
          
          console.log(rawItem);
          
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
    return new Promise((resolve, reject) => {
      if (!this.idb) return reject('IDB not initialized');
      const tx = this.idb.transaction(moduleName, 'readonly');
      const request = tx.objectStore(moduleName).getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getLocalRecord(moduleName, key) {
    return new Promise((resolve, reject) => {
      if (!this.idb) return reject('IDB not initialized');
      const tx = this.idb.transaction(moduleName, 'readonly');
      const request = tx.objectStore(moduleName).get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getLocalUsersByRole(roleName) {
    return new Promise((resolve, reject) => {
      if (!this.idb) return reject('IDB not initialized');
      const tx = this.idb.transaction('users', 'readonly');
      const index = tx.objectStore('users').index('role');
      const request = index.getAll(roleName);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getSchoolDetails() {
    try {
      const records = await this.getLocalData('schoolDetails');
      if (records && records.length > 0) {
        return records[0];
      }
    } catch (err) {
      console.warn("[SyncEngine] Local IDB fetch failed, falling back to Firebase:", err);
    }

    try {
      const databaseURL = "https://school-62c45-default-rtdb.asia-southeast1.firebasedatabase.app";
      const url = `${databaseURL}/schools/${this.schoolId}/details.json`;

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


  async getAESKey() {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      enc.encode(ENCRYPTION_SECRET.padEnd(32).slice(0, 32)), // Ensures 256-bit length
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
          }
  
          .alertbox-close:hover {
              color: #222;
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
  a: "Full Name",
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
  B: "Updated By",
  A: "Updated At",
  z:"exam"
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
    
    const subjectData = [
      {
        category: "Primary Education",
        subjects: {
          "1": "First Language (Sinhala)",
          "2": "First Language (Tamil)",
          "3": "English Language",
          "4": "Mathematics",
          "5": "Environmental Related Activities (ERA)",
          "6": "Religion (Buddhism)",
          "7": "Religion (Hinduism)",
          "8": "Religion (Islam)",
          "9": "Religion (Catholicism / Christianity)",
          "10": "Primary Aesthetic Studies"
        }
      },
      {
        category: "Junior Secondary",
        subjects: {
          "11": "Civic Education",
          "12": "Practical & Technical Skills",
          "13": "Health & Physical Education",
          "14": "Second Language (Sinhala)",
          "15": "Second Language (Tamil)"
        }
      },
      {
        category: "G.C.E. O/L - Core Subjects",
        subjects: {
          "16": "Mathematics",
          "17": "Science",
          "18": "English Language",
          "19": "History",
          "20": "Sinhala Language & Literature",
          "21": "Tamil Language & Literature",
          "22": "Buddhism",
          "23": "Saivanery (Hinduism)",
          "24": "Islam",
          "25": "Catholicism / Christianity"
        }
      },
      {
        category: "G.C.E. O/L - Category I Electives",
        subjects: {
          "26": "Business & Accounting Studies",
          "27": "Geography",
          "28": "Entrepreneurship Studies",
          "29": "Second Language (Sinhala)",
          "30": "Second Language (Tamil)",
          "31": "Pali",
          "32": "Sanskrit",
          "33": "French",
          "34": "German",
          "35": "Hindi",
          "36": "Japanese",
          "37": "Arabic",
          "38": "Korean",
          "39": "Chinese",
          "40": "Russian"
        }
      },
      {
        category: "G.C.E. O/L - Category II Electives",
        subjects: {
          "41": "Art",
          "42": "Music (Oriental)",
          "43": "Music (Western)",
          "44": "Music (Carnatic)",
          "45": "Dancing (Oriental)",
          "46": "Dancing (Bharata)",
          "47": "Drama & Theatre (Sinhala)",
          "48": "Drama & Theatre (Tamil)",
          "49": "Drama & Theatre (English)",
          "50": "Appreciation of English Literary Texts",
          "51": "Appreciation of Sinhala Literary Texts",
          "52": "Appreciation of Tamil Literary Texts",
          "53": "Appreciation of Arabic Literary Texts"
        }
      },
      {
        category: "G.C.E. O/L - Category III Electives",
        subjects: {
          "54": "Information & Communication Technology (ICT)",
          "55": "Agriculture & Food Technology",
          "56": "Aquatic Bio-resources Technology",
          "57": "Arts & Crafts",
          "58": "Home Economics",
          "59": "Health & Physical Education",
          "60": "Communication & Media Studies",
          "61": "Design & Construction Technology",
          "62": "Design & Mechanical Technology",
          "63": "Design, Electrical & Electronic Technology",
          "64": "Electronic Writing & Shorthand"
        }
      },
      {
        category: "G.C.E. A/L - Science & Math Streams",
        subjects: {
          "65": "Combined Mathematics",
          "66": "Physics",
          "67": "Chemistry",
          "68": "Biology",
          "69": "Agricultural Science",
          "70": "Higher Mathematics"
        }
      },
      {
        category: "G.C.E. A/L - Commerce Stream",
        subjects: {
          "71": "Accounting",
          "72": "Business Studies",
          "73": "Economics",
          "74": "Business Statistics"
        }
      },
      {
        category: "G.C.E. A/L - Technology Stream",
        subjects: {
          "75": "Engineering Technology",
          "76": "Bio-Systems Technology",
          "77": "Science for Technology"
        }
      },
      {
        category: "G.C.E. A/L - Arts & Humanities Stream",
        subjects: {
          "78": "Political Science",
          "79": "Logic & Scientific Method",
          "80": "Sociology",
          "81": "Psychology",
          "82": "Buddhist Civilization",
          "83": "Hindu Civilization",
          "84": "Islam Civilization",
          "85": "Christian Culture",
          "86": "Greek & Roman Civilization",
          "87": "Home Economics (A/L)"
        }
      },
      {
        category: "G.C.E. A/L - Compulsory Subjects",
        subjects: {
          "88": "General English",
          "89": "General Information Technology (GIT)",
          "90": "Common General Test"
        }
      }
    ];

    function generateSelectOptions(data, selectId) {
      const selectElement = document.getElementById(selectId);
      if (!selectElement) return;
    
      // Clear existing options
      selectElement.innerHTML = "";
    
      data.forEach((group) => {
        const optgroup = document.createElement("optgroup");
        optgroup.label = group.category;
    
        Object.entries(group.subjects).forEach(([id, name]) => {
          const option = document.createElement("option");
          option.value = id;
          option.textContent = name;
          optgroup.appendChild(option);
        });
    
        selectElement.appendChild(optgroup);
      });
    }
    const databaseURL = "https://school-62c45-default-rtdb.asia-southeast1.firebasedatabase.app";
         
   
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
let userID=null;
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.database();
db.goOffline();
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
let schoolId,syncEngine = null;
const urlParams = new URLSearchParams(window.location.search);
 schoolId = urlParams.get('school')?.trim().toLowerCase();
if (schoolId) {
   syncEngine = new SchoolSyncEngine(db, schoolId);
 }

const CLOUDINARY_UPLOAD_PRESET = "school";
const CLOUDINARY_CLOUD_NAME = "vmorkfqp";
auth.onAuthStateChanged(async (user) => {
if(user){
  console.log(user.uid)
  userID=user.uid;
}
})


const ENCRYPTION_SECRET = "digibook";

async function getKey() {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(ENCRYPTION_SECRET.padEnd(32).slice(0, 32)), // Ensure 256-bit
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

