const MODULE_FIELD_MAPS={students:{a:"fullName",b:"dob",c:"gender",d:"studentContact",e:"fatherName",f:"motherName",g:"address",h:"class",i:"admissionNo",j:"birthCertNo",k:"admissionYear",l:"admissionGrade",m:"positionsHeld",n:"discipline",o:"medical",p:"fatherNic",q:"motherNic",r:"guardianName",s:"guardianNic",t:"gnDivision",u:"dsDivision",v:"lowIncome",w:"aswesuma",x:"siblings",y:"photoUrl",z:"exam",A:"updatedAt",B:"updatedBy",D:"isDeleted"}},MODULE_FIELD_MAPS_USERS={a:"fullName",b:"dob",c:"gender",d:"contact",e:"qualification",f:"subject",g:"address",h:"photoUrl",i:"role",j:"claimed",k:"school",l:"email",m:"arrivalDate",n:"firstAppointmentDate",o:"nic",p:"previousSchool",q:"salaryCode",r:"assignedClasses",A:"updatedAt",B:"updatedBy",D:"isDeleted"},USER_REVERSE_MAP=(MODULE_FIELD_MAPS.users=MODULE_FIELD_MAPS_USERS,{});for(const a in MODULE_FIELD_MAPS_USERS)USER_REVERSE_MAP[MODULE_FIELD_MAPS_USERS[a]]=a;function mapUserToFirebase(e){if(!e||"object"!=typeof e)return e;var t={};for(const r in e)t[USER_REVERSE_MAP[r]||r]=e[r];return t}function unmapUserFromFirebase(e){if(!e||"object"!=typeof e)return e;var t={};for(const r in e)t[MODULE_FIELD_MAPS_USERS[r]||r]=e[r];return t}class SchoolSyncEngine{constructor(e,t){this.db=e,this.schoolId=t,this.idbName="SIS_"+this.schoolId,this.idbVersion=3,this.idb=null,this.modules=["students","users","library","timetables","student_progress","schoolDetails"]}unmapFromFirebase(e,t){if(!t||"object"!=typeof t)return t;var r=MODULE_FIELD_MAPS[e];if(!r)return t;var o={};for(const a in t)o[r[a]||a]=t[a];return o}mapToFirebase(e,t){if(!t||"object"!=typeof t)return t;var r=MODULE_FIELD_MAPS[e];if(!r)return t;var o={};for(const s in r)o[r[s]]=s;var a={};for(const i in t)a[o[i]||i]=t[i];return a}async initIndexedDB(){return new Promise((t,r)=>{var e=indexedDB.open(this.idbName,this.idbVersion);e.onupgradeneeded=e=>{const r=e.target.result;this.modules.forEach(e=>{var t;r.objectStoreNames.contains(e)||(t=r.createObjectStore(e,{keyPath:"id"}),"users"===e&&t.createIndex("role","role",{unique:!1}))})},e.onsuccess=e=>{this.idb=e.target.result,console.log("[IndexedDB] Connected: "+this.idbName),t(this.idb)},e.onerror=e=>r(e.target.error)})}saveToIDB(e,t){this.idb&&this.idb.transaction(e,"readwrite").objectStore(e).put(t)}removeFromIDB(e,t){this.idb&&this.idb.transaction(e,"readwrite").objectStore(e).delete(t)}async clearIDBStore(o){return new Promise((e,t)=>{if(!this.idb)return e();const r=this.idb.transaction(o,"readwrite").objectStore(o).clear();r.onsuccess=()=>e(),r.onerror=()=>t(r.error)})}async _syncModule(o){if(navigator.onLine){var e=`lastSync_${this.schoolId}_`+o,t=parseInt(localStorage.getItem(e)||"0",10);try{var r=await this.getLocalData(o);if(!r||0===r.length||0===t)await this._fullFetchModule(o);else{var a=t+1,s=`${firebaseConfig.databaseURL}/schools/${this.schoolId}/${o}.json?orderBy=%22A%22&startAt=`+a,i=await fetch(s);if(!i.ok)throw new Error("HTTP error! status: "+i.status);const n=await i.json();if(console.log(n),n){console.log(5);let r=t;await Promise.all(Object.keys(n).map(async e=>{var t=n[e];t&&(t.d&&(t.d=await this.decryptField(t.d)),t.g&&(t.g=await this.decryptField(t.g)),(t=this.unmapFromFirebase(o,t)).updatedAt&&t.updatedAt>r&&(r=t.updatedAt),t.isDeleted?this.removeFromIDB(o,e):(e={id:e,...t},this.saveToIDB(o,e)))})),localStorage.setItem(e,r)}}}catch(e){console.error(`[SyncEngine] Error syncing ${o}:`,e)}}}async _fullFetchModule(o){var e=`lastSync_${this.schoolId}_`+o;try{var t=`${firebaseConfig.databaseURL}/schools/${this.schoolId}/${o}.json`,a=await fetch(t);if(!a.ok)throw new Error("HTTP error! status: "+a.status);const s=await a.json()||{};console.log(7),await this.clearIDBStore(o);let r=0;await Promise.all(Object.keys(s).map(async e=>{var t=s[e];t&&(t.d=await this.decryptField(t.d),t.g=await this.decryptField(t.g),console.log(t),(t=this.unmapFromFirebase(o,t)).isDeleted||(e={id:e,...t},this.saveToIDB(o,e)),t.updatedAt)&&t.updatedAt>r&&(r=t.updatedAt)})),0<r&&localStorage.setItem(e,r)}catch(e){console.error(`[SyncEngine] Error during full fetch for ${o}:`,e)}}async syncStudents(){await this._syncModule("students")}async syncUsers(){await this._syncModule("users")}async syncLibrary(){await this._syncModule("library")}async syncTimetables(){await this._syncModule("timetables")}async syncStudent_progress(){await this._syncModule("student_progress")}async getLocalData(o){return new Promise((e,t)=>{if(!this.idb)return t("IDB not initialized");const r=this.idb.transaction(o,"readonly").objectStore(o).getAll();r.onsuccess=()=>e(r.result),r.onerror=()=>t(r.error)})}async getLocalRecord(o,a){return new Promise((e,t)=>{if(!this.idb)return t("IDB not initialized");const r=this.idb.transaction(o,"readonly").objectStore(o).get(a);r.onsuccess=()=>e(r.result),r.onerror=()=>t(r.error)})}async getLocalUsersByRole(o){return new Promise((e,t)=>{if(!this.idb)return t("IDB not initialized");const r=this.idb.transaction("users","readonly").objectStore("users").index("role").getAll(o);r.onsuccess=()=>e(r.result),r.onerror=()=>t(r.error)})}async getSchoolDetails(){try{var e=`${firebaseConfig.databaseURL}/schools/${this.schoolId}/details.json`,t=await fetch(e);if(!t.ok)throw new Error("HTTP error! status: "+t.status);var r,o=await t.json();if(o)return r={id:"info",...o},this.saveToIDB("schoolDetails",r),r}catch(e){console.error("[SyncEngine] Firebase fetch failed:",e)}return null}async getExams(){try{var e=`${firebaseConfig.databaseURL}/schools/${this.schoolId}/details/exams.json`,t=await fetch(e);if(!t.ok)throw new Error("HTTP error! status: "+t.status);var r=await t.json();if(r)return r}catch(e){console.error("[SyncEngine] Firebase fetch failed:",e)}return null}async getAESKey(){var e=new TextEncoder;return await window.crypto.subtle.importKey("raw",e.encode(domain.padEnd(32).slice(0,32)),{name:"AES-GCM"},!1,["encrypt","decrypt"])}async decryptField(t){if(!t||"string"!=typeof t)return"";try{var e=Uint8Array.from(atob(t),e=>e.charCodeAt(0)),r=e.slice(0,12),o=e.slice(12),a=await this.getAESKey(),s=await window.crypto.subtle.decrypt({name:"AES-GCM",iv:r},a,o);return(new TextDecoder).decode(s)}catch(e){return t}}}function alertbox(e,t="success"){let r=document.getElementById("alertbox-container");r||((r=document.createElement("div")).id="alertbox-container",(a=document.createElement("style")).textContent=`
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
      `,document.head.appendChild(a),document.body.appendChild(r));const o=document.createElement("div");o.className="alertbox "+t;o.innerHTML=`
      <div class="alertbox-icon">${"success"===t?"✓":"!"}</div>
      <div class="alertbox-message">${e}</div>
      <button class="alertbox-close">&times;</button>
  `,r.appendChild(o);var a=()=>{o.classList.contains("closing")||(o.classList.add("closing"),setTimeout(()=>{o.remove()},250))};o.querySelector(".alertbox-close").onclick=a,setTimeout(a,4e3)}const STUDENT_FIELD_MAP={a:"Full Name",b:"Date of Birth",c:"Gender",d:"Student Contact",e:"Father's Full Name",f:"Mother's Full Name",g:"Home Address",h:"Current Class",i:"Admission Number",j:"Birth Certificate Number",k:"Year of Admission",l:"Grade of Admission",m:"Positions Held",n:"Discipline & Conduct",o:"Medical Conditions",p:"Father's NIC",q:"Mother's NIC",r:"Guardian's Full Name",s:"Guardian's NIC",t:"Grama Niladhari Division",u:"Divisional Secretariat Division",v:"Low-Income Status",w:"Aswesuma Beneficiary",x:"Siblings in School",y:"Photo URL",B:"Updated By",A:"Updated At",z:"exam"};function getFullCloudinaryUrl(e){return e?e.startsWith("http")?e:"https://res.cloudinary.com/vmorkfqp/image/upload/"+e:""}function getCloudinaryPath(e){var t,r;return e?URL.canParse(e)&&-1!==(r=(t=new URL(e).pathname.split("/")).indexOf("upload"))?t.slice(r+1).join("/"):e:""}const firebaseConfig={apiKey:"AIzaSyBTq5fuuBh9Ye5r7exiJFtLjJpQ-9vIY2U",authDomain:"school-62c45.firebaseapp.com",databaseURL:"https://school-62c45-default-rtdb.asia-southeast1.firebasedatabase.app",projectId:"school-62c45",storageBucket:"school-62c45.firebasestorage.app",messagingSenderId:"213099404706",appId:"1:213099404706:web:d65d7ec257c1119f3966fb",measurementId:"G-8QG01WT32P"};let userID=null;firebase.initializeApp(firebaseConfig);const auth=firebase.auth(),db=firebase.database();db.goOffline(),auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);let schoolId,syncEngine=null;const urlParams=new URLSearchParams(window.location.search),CLOUDINARY_UPLOAD_PRESET=((schoolId=urlParams.get("school")?.trim().toLowerCase())&&(syncEngine=new SchoolSyncEngine(db,schoolId)),"school"),CLOUDINARY_CLOUD_NAME="vmorkfqp",domain=(auth.onAuthStateChanged(async e=>{e&&(console.log(e.uid),userID=e.uid)}),"digibook");async function getKey(){var e=new TextEncoder;return await window.crypto.subtle.importKey("raw",e.encode(domain.padEnd(32).slice(0,32)),{name:"AES-GCM"},!1,["encrypt","decrypt"])}async function encryptField(e){var t,r,o;return e?(o=new TextEncoder,t=window.crypto.getRandomValues(new Uint8Array(12)),r=await getKey(),r=await window.crypto.subtle.encrypt({name:"AES-GCM",iv:t},r,o.encode(e)),(o=new Uint8Array(t.length+new Uint8Array(r).length)).set(t),o.set(new Uint8Array(r),t.length),btoa(String.fromCharCode.apply(null,o))):""}const DEFAULT_TEMPLATE="tpl-modern",DEFAULT_COLOR="blue";let settingsPromise=null;function getSetting(){return settingsPromise=settingsPromise||(async()=>{if(schoolId)try{var e=`${firebaseConfig.databaseURL}/schools/${schoolId}/details.json`,t=await fetch(e);if(!t.ok)throw new Error("HTTP error! status: "+t.status);var r=await t.json();if(r)return r}catch(e){console.error("Failed to fetch settings:",e)}return{template:DEFAULT_TEMPLATE,color:DEFAULT_COLOR}})()}
