const MODULE_FIELD_MAPS={students:{a:"fullName",b:"dob",c:"gender",d:"studentContact",e:"fatherName",f:"motherName",g:"address",h:"class",i:"admissionNo",j:"birthCertNo",k:"admissionYear",l:"admissionGrade",m:"positionsHeld",n:"discipline",o:"medical",p:"fatherNic",q:"motherNic",r:"guardianName",s:"guardianNic",t:"gnDivision",u:"dsDivision",v:"lowIncome",w:"aswesuma",x:"siblings",y:"photoUrl",z:"exam",A:"updatedAt",B:"updatedBy",D:"isDeleted"}},MODULE_FIELD_MAPS_USERS={a:"fullName",b:"dob",c:"gender",d:"contact",e:"qualification",f:"subject",g:"address",h:"photoUrl",i:"role",j:"claimed",k:"school",l:"email",m:"arrivalDate",n:"firstAppointmentDate",o:"nic",p:"previousSchool",q:"salaryCode",r:"assignedClasses",A:"updatedAt",B:"updatedBy",D:"isDeleted"},USER_REVERSE_MAP=(MODULE_FIELD_MAPS.users=MODULE_FIELD_MAPS_USERS,{});for(const a in MODULE_FIELD_MAPS_USERS)USER_REVERSE_MAP[MODULE_FIELD_MAPS_USERS[a]]=a;function mapUserToFirebase(e){if(!e||"object"!=typeof e)return e;var t={};for(const o in e)t[USER_REVERSE_MAP[o]||o]=e[o];return t}function unmapUserFromFirebase(e){if(!e||"object"!=typeof e)return e;var t={};for(const o in e)t[MODULE_FIELD_MAPS_USERS[o]||o]=e[o];return t}class SchoolSyncEngine{constructor(e,t){this.db=e,this.schoolId=t,this.idbName="SIS_"+this.schoolId,this.idbVersion=3,this.idb=null,this.modules=["students","users","library","timetables","student_progress","schoolDetails"]}unmapFromFirebase(e,t){if(!t||"object"!=typeof t)return t;var o=MODULE_FIELD_MAPS[e];if(!o)return t;var r={};for(const a in t)r[o[a]||a]=t[a];return r}mapToFirebase(e,t){if(!t||"object"!=typeof t)return t;var o=MODULE_FIELD_MAPS[e];if(!o)return t;var r={};for(const s in o)r[o[s]]=s;var a={};for(const n in t)a[r[n]||n]=t[n];return a}async getDB(){return this.idb||(console.log("[IndexedDB] Reconnecting..."),await this.initIndexedDB()),this.idb}async transaction(t,o="readonly"){var e=await this.getDB();try{return e.transaction(t,o)}catch(e){if("InvalidStateError"===e.name||e.message.includes("closing"))return console.warn("[IndexedDB] Connection was closing. Retrying connection..."),this.idb=null,(await this.getDB()).transaction(t,o);throw e}}async initIndexedDB(){return new Promise((t,o)=>{var e=indexedDB.open(this.idbName,this.idbVersion);e.onupgradeneeded=e=>{const o=e.target.result;this.modules.forEach(e=>{var t;o.objectStoreNames.contains(e)||(t=o.createObjectStore(e,{keyPath:"id"}),"users"===e&&t.createIndex("role","role",{unique:!1}))})},e.onsuccess=e=>{this.idb=e.target.result,this.idb.onclose=()=>{console.warn("[IndexedDB] Connection closed unexpectedly."),this.idb=null},this.idb.onversionchange=()=>{console.warn("[IndexedDB] Connection closing due to version change in another tab."),this.idb.close(),this.idb=null},console.log("[IndexedDB] Connected: "+this.idbName),t(this.idb)},e.onerror=e=>o(e.target.error)})}async saveToIDB(r,a){const s=await this.transaction(r,"readwrite");return new Promise((e,t)=>{const o=s.objectStore(r).put(a);o.onsuccess=()=>e(),o.onerror=()=>t(o.error)})}async removeFromIDB(r,a){const s=await this.transaction(r,"readwrite");return new Promise((e,t)=>{const o=s.objectStore(r).delete(a);o.onsuccess=()=>e(),o.onerror=()=>t(o.error)})}async clearIDBStore(r){if(!this.idb)try{await this.initIndexedDB()}catch(e){return resolve()}const a=await this.transaction(r,"readwrite");return new Promise((e,t)=>{const o=a.objectStore(r).clear();o.onsuccess=()=>e(),o.onerror=()=>t(o.error)})}async _syncModule(r){if(navigator.onLine){var e=`lastSync_${this.schoolId}_`+r,t=parseInt(localStorage.getItem(e)||"0",10);try{var o=await this.getLocalData(r);if(!o||0===o.length||0===t)await this._fullFetchModule(r);else{var a=t+1,s=`${firebaseConfig.databaseURL}/schools/${this.schoolId}/${r}.json?orderBy=%22A%22&startAt=`+a,n=await fetch(s);if(!n.ok)throw new Error("HTTP error! status: "+n.status);const i=await n.json();if(console.log(i),i){console.log(5);let o=t;await Promise.all(Object.keys(i).map(async e=>{var t=i[e];t&&(t.d&&(t.d=await this.decryptField(t.d)),t.g&&(t.g=await this.decryptField(t.g)),(t=this.unmapFromFirebase(r,t)).updatedAt&&t.updatedAt>o&&(o=t.updatedAt),t.isDeleted?this.removeFromIDB(r,e):(e={id:e,...t},this.saveToIDB(r,e)))})),localStorage.setItem(e,o)}}}catch(e){console.error(`[SyncEngine] Error syncing ${r}:`,e)}}}async _fullFetchModule(r){var e=`lastSync_${this.schoolId}_`+r;try{var t=`${firebaseConfig.databaseURL}/schools/${this.schoolId}/${r}.json`,a=await fetch(t);if(!a.ok)throw new Error("HTTP error! status: "+a.status);const s=await a.json()||{};console.log(7),await this.clearIDBStore(r);let o=0;await Promise.all(Object.keys(s).map(async e=>{var t=s[e];t&&(t.d=await this.decryptField(t.d),t.g=await this.decryptField(t.g),console.log(t),(t=this.unmapFromFirebase(r,t)).isDeleted||(e={id:e,...t},this.saveToIDB(r,e)),t.updatedAt)&&t.updatedAt>o&&(o=t.updatedAt)})),0<o&&localStorage.setItem(e,o)}catch(e){console.error(`[SyncEngine] Error during full fetch for ${r}:`,e)}}async syncStudents(){await this._syncModule("students")}async syncUsers(){await this._syncModule("users")}async syncLibrary(){await this._syncModule("library")}async syncTimetables(){await this._syncModule("timetables")}async syncStudent_progress(){await this._syncModule("student_progress")}async getLocalData(r){const a=await this.transaction(r,"readonly");return new Promise((e,t)=>{const o=a.objectStore(r).getAll();o.onsuccess=()=>e(o.result),o.onerror=()=>t(o.error)})}async getLocalRecord(r,a){const s=await this.transaction(r,"readonly");return new Promise((e,t)=>{const o=s.objectStore(r).get(a);o.onsuccess=()=>e(o.result),o.onerror=()=>t(o.error)})}async getLocalUsersByRole(r){const a=await this.transaction("users","readonly");return new Promise((e,t)=>{const o=a.objectStore("users").index("role").getAll(r);o.onsuccess=()=>e(o.result),o.onerror=()=>t(o.error)})}async getSchoolDetails(){try{var e=`${firebaseConfig.databaseURL}/schools/${this.schoolId}/details.json`,t=await fetch(e);if(!t.ok)throw new Error("HTTP error! status: "+t.status);var o,r=await t.json();if(r)return o={id:"info",...r},this.saveToIDB("schoolDetails",o),o}catch(e){console.error("[SyncEngine] Firebase fetch failed:",e)}return null}async getExams(){try{var e=`${firebaseConfig.databaseURL}/schools/${this.schoolId}/details/exams.json`,t=await fetch(e);if(!t.ok)throw new Error("HTTP error! status: "+t.status);var o=await t.json();if(o)return o}catch(e){console.error("[SyncEngine] Firebase fetch failed:",e)}return null}async getAESKey(){var e=new TextEncoder;return await window.crypto.subtle.importKey("raw",e.encode(domain.padEnd(32).slice(0,32)),{name:"AES-GCM"},!1,["encrypt","decrypt"])}async decryptField(t){if(!t||"string"!=typeof t)return"";try{var e=Uint8Array.from(atob(t),e=>e.charCodeAt(0)),o=e.slice(0,12),r=e.slice(12),a=await this.getAESKey(),s=await window.crypto.subtle.decrypt({name:"AES-GCM",iv:o},a,r);return(new TextDecoder).decode(s)}catch(e){return t}}}function alertbox(e,t="success"){let o=document.getElementById("alertbox-container");o||((o=document.createElement("div")).id="alertbox-container",(a=document.createElement("style")).textContent=`
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
      `,document.head.appendChild(a),document.body.appendChild(o));const r=document.createElement("div");r.className="alertbox "+t;r.innerHTML=`
      <div class="alertbox-icon">${"success"===t?"✓":"!"}</div>
      <div class="alertbox-message">${e}</div>
      <button class="alertbox-close">&times;</button>
  `,o.appendChild(r);var a=()=>{r.classList.contains("closing")||(r.classList.add("closing"),setTimeout(()=>{r.remove()},250))};r.querySelector(".alertbox-close").onclick=a,setTimeout(a,4e3)}const STUDENT_FIELD_MAP={a:"Full Name",b:"Date of Birth",c:"Gender",d:"Student Contact",e:"Father's Full Name",f:"Mother's Full Name",g:"Home Address",h:"Current Class",i:"Admission Number",j:"Birth Certificate Number",k:"Year of Admission",l:"Grade of Admission",m:"Positions Held",n:"Discipline & Conduct",o:"Medical Conditions",p:"Father's NIC",q:"Mother's NIC",r:"Guardian's Full Name",s:"Guardian's NIC",t:"Grama Niladhari Division",u:"Divisional Secretariat Division",v:"Low-Income Status",w:"Aswesuma Beneficiary",x:"Siblings in School",y:"Photo URL",B:"Updated By",A:"Updated At",z:"exam"};function getFullCloudinaryUrl(e){return e?e.startsWith("http")?e:"https://res.cloudinary.com/vmorkfqp/image/upload/"+e:""}function getCloudinaryPath(e){var t,o;return e?URL.canParse(e)&&-1!==(o=(t=new URL(e).pathname.split("/")).indexOf("upload"))?t.slice(o+1).join("/"):e:""}const firebaseConfig={apiKey:"AIzaSyBTq5fuuBh9Ye5r7exiJFtLjJpQ-9vIY2U",authDomain:"school-62c45.firebaseapp.com",databaseURL:"https://school-62c45-default-rtdb.asia-southeast1.firebasedatabase.app",projectId:"school-62c45",storageBucket:"school-62c45.firebasestorage.app",messagingSenderId:"213099404706",appId:"1:213099404706:web:d65d7ec257c1119f3966fb",measurementId:"G-8QG01WT32P"};let userID=null;firebase.initializeApp(firebaseConfig);const auth=firebase.auth(),db=firebase.database();db.goOffline(),auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);let schoolId,syncEngine=null;const urlParams=new URLSearchParams(window.location.search),CLOUDINARY_UPLOAD_PRESET=((schoolId=urlParams.get("school")?.trim().toLowerCase())&&(syncEngine=new SchoolSyncEngine(db,schoolId)),"school"),CLOUDINARY_CLOUD_NAME="vmorkfqp",domain=(auth.onAuthStateChanged(async e=>{e&&(console.log(e.uid),userID=e.uid)}),"digibook");async function getKey(){var e=new TextEncoder;return await window.crypto.subtle.importKey("raw",e.encode(domain.padEnd(32).slice(0,32)),{name:"AES-GCM"},!1,["encrypt","decrypt"])}async function encryptField(e){var t,o,r;return e?(r=new TextEncoder,t=window.crypto.getRandomValues(new Uint8Array(12)),o=await getKey(),o=await window.crypto.subtle.encrypt({name:"AES-GCM",iv:t},o,r.encode(e)),(r=new Uint8Array(t.length+new Uint8Array(o).length)).set(t),r.set(new Uint8Array(o),t.length),btoa(String.fromCharCode.apply(null,r))):""}const DEFAULT_TEMPLATE="tpl-modern",DEFAULT_COLOR="blue";let settingsPromise=null;function getSetting(){return settingsPromise=settingsPromise||(async()=>{if(schoolId)try{var e=`${firebaseConfig.databaseURL}/schools/${schoolId}/details.json`,t=await fetch(e);if(!t.ok)throw new Error("HTTP error! status: "+t.status);var o=await t.json();if(o)return o}catch(e){console.error("Failed to fetch settings:",e)}return{template:DEFAULT_TEMPLATE,color:DEFAULT_COLOR}})()}
