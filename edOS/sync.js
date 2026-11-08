const MODULE_FIELD_MAPS={students:{a:"name",b:"dob",c:"gender",d:"studentContact",e:"fatherName",f:"motherName",g:"address",h:"class",i:"admissionNo",j:"birthCertNo",k:"admissionYear",l:"admissionGrade",m:"positionsHeld",n:"discipline",o:"medical",p:"fatherNic",q:"motherNic",r:"guardianName",s:"guardianNic",t:"gnDivision",u:"dsDivision",v:"lowIncome",w:"aswesuma",x:"siblings",y:"photoUrl",z:"exam",A:"updatedAt",B:"updatedBy",D:"isDeleted",C:"classFee",E:"attendance",F:"isPaid",G:"paidAt"}},MODULE_FIELD_MAPS_USERS={a:"name",b:"dob",c:"gender",d:"contact",e:"qualification",f:"subject",g:"address",h:"photoUrl",i:"role",j:"claimed",k:"school",l:"email",m:"arrivalDate",n:"firstAppointmentDate",o:"nic",p:"previousSchool",q:"salaryCode",r:"assignedClasses",A:"updatedAt",B:"updatedBy",D:"isDeleted"},USER_REVERSE_MAP=(MODULE_FIELD_MAPS.users=MODULE_FIELD_MAPS_USERS,{});for(const a in MODULE_FIELD_MAPS_USERS)USER_REVERSE_MAP[MODULE_FIELD_MAPS_USERS[a]]=a;function mapUserToFirebase(e){if(!e||"object"!=typeof e)return e;var t={};for(const r in e)t[USER_REVERSE_MAP[r]||r]=e[r];return t}function unmapUserFromFirebase(e){if(!e||"object"!=typeof e)return e;var t={};for(const r in e)t[MODULE_FIELD_MAPS_USERS[r]||r]=e[r];return t}class SchoolSyncEngine{constructor(e,t){this.db=e,this.schoolId=t,this.idbName="SIS_"+this.schoolId,this.idbVersion=3,this.idb=null,this.modules=["students","users","library","timetables","student_progress","schoolDetails"]}unmapFromFirebase(e,t){if(!t||"object"!=typeof t)return t;var r=MODULE_FIELD_MAPS[e];if(!r)return t;var a={};for(const o in t)a[r[o]||o]=t[o];return a}mapToFirebase(e,t){if(!t||"object"!=typeof t)return t;var r=MODULE_FIELD_MAPS[e];if(!r)return t;var a={};for(const s in r)a[r[s]]=s;var o={};for(const n in t)o[a[n]||n]=t[n];return o}async getDB(){return this.idb||await this.initIndexedDB(),this.idb}async transaction(t,r="readonly"){var e=await this.getDB();try{return e.transaction(t,r)}catch(e){if("InvalidStateError"===e.name||e.message.includes("closing"))return console.warn("[IndexedDB] Connection was closing. Retrying connection..."),this.idb=null,(await this.getDB()).transaction(t,r);throw e}}async initIndexedDB(){return new Promise((t,r)=>{var e=indexedDB.open(this.idbName,this.idbVersion);e.onupgradeneeded=e=>{const r=e.target.result;this.modules.forEach(e=>{var t;r.objectStoreNames.contains(e)||(t=r.createObjectStore(e,{keyPath:"id"}),"users"===e&&t.createIndex("role","role",{unique:!1}))})},e.onsuccess=e=>{this.idb=e.target.result,this.idb.onclose=()=>{console.warn("[IndexedDB] Connection closed unexpectedly."),this.idb=null},this.idb.onversionchange=()=>{console.warn("[IndexedDB] Connection closing due to version change in another tab."),this.idb.close(),this.idb=null},t(this.idb)},e.onerror=e=>r(e.target.error)})}async saveToIDB(a,o){const s=await this.transaction(a,"readwrite");return new Promise((e,t)=>{const r=s.objectStore(a).put(o);r.onsuccess=()=>e(),r.onerror=()=>t(r.error)})}async removeFromIDB(a,o){const s=await this.transaction(a,"readwrite");return new Promise((e,t)=>{const r=s.objectStore(a).delete(o);r.onsuccess=()=>e(),r.onerror=()=>t(r.error)})}async clearIDBStore(a){if(!this.idb)try{await this.initIndexedDB()}catch(e){return resolve()}const o=await this.transaction(a,"readwrite");return new Promise((e,t)=>{const r=o.objectStore(a).clear();r.onsuccess=()=>e(),r.onerror=()=>t(r.error)})}async _syncModule(a){if(navigator.onLine){var e=`lastSync_${this.schoolId}_`+a,t=parseInt(localStorage.getItem(e)||"0",10);try{var r=await this.getLocalData(a);if(!r||0===r.length||0===t)await this._fullFetchModule(a);else{var o=t+1,s=`${firebaseConfig.databaseURL}/schools/${this.schoolId}/${a}.json?orderBy=%22A%22&startAt=`+o,n=await fetch(s);if(!n.ok)throw new Error("HTTP error! status: "+n.status);const i=await n.json();if(i){let r=t;await Promise.all(Object.keys(i).map(async e=>{var t=i[e];t&&(t.d&&(t.d=await this.decryptField(t.d)),t.g&&(t.g=await this.decryptField(t.g)),(t=this.unmapFromFirebase(a,t)).updatedAt&&t.updatedAt>r&&(r=t.updatedAt),t.isDeleted?this.removeFromIDB(a,e):(e={id:e,...t},this.saveToIDB(a,e)))})),localStorage.setItem(e,r)}}}catch(e){console.error(`[SyncEngine] Error syncing ${a}:`,e)}}}async _fullFetchModule(a){var e=`lastSync_${this.schoolId}_`+a;try{var t=`${firebaseConfig.databaseURL}/schools/${this.schoolId}/${a}.json`,o=await fetch(t);if(!o.ok)throw new Error("HTTP error! status: "+o.status);const s=await o.json()||{};await this.clearIDBStore(a);let r=0;await Promise.all(Object.keys(s).map(async e=>{var t=s[e];t&&(t.d=await this.decryptField(t.d),t.g=await this.decryptField(t.g),(t=this.unmapFromFirebase(a,t)).isDeleted||(e={id:e,...t},this.saveToIDB(a,e)),t.updatedAt)&&t.updatedAt>r&&(r=t.updatedAt)})),0<r&&localStorage.setItem(e,r)}catch(e){console.error(`[SyncEngine] Error during full fetch for ${a}:`,e)}}async syncStudents(){await this._syncModule("students")}async syncUsers(){await this._syncModule("users")}async syncLibrary(){await this._syncModule("library")}async syncTimetables(){await this._syncModule("timetables")}async syncStudent_progress(){await this._syncModule("student_progress")}async getLocalData(a){const o=await this.transaction(a,"readonly");return new Promise((e,t)=>{const r=o.objectStore(a).getAll();r.onsuccess=()=>e(r.result),r.onerror=()=>t(r.error)})}async getLocalRecord(a,o){const s=await this.transaction(a,"readonly");return new Promise((e,t)=>{const r=s.objectStore(a).get(o);r.onsuccess=()=>e(r.result),r.onerror=()=>t(r.error)})}async getLocalUsersByRole(a){const o=await this.transaction("users","readonly");return new Promise((e,t)=>{const r=o.objectStore("users").index("role").getAll(a);r.onsuccess=()=>e(r.result),r.onerror=()=>t(r.error)})}async getSchoolDetails(){try{var e=`${firebaseConfig.databaseURL}/schools/${this.schoolId}/details.json`,t=await fetch(e);if(!t.ok)throw new Error("HTTP error! status: "+t.status);var r,a=await t.json();if(a)return r={id:"info",...a},this.saveToIDB("schoolDetails",r),r}catch(e){console.error("[SyncEngine] Firebase fetch failed:",e)}return null}async getExams(){try{var e=`${firebaseConfig.databaseURL}/schools/${this.schoolId}/details/exams.json`,t=await fetch(e);if(!t.ok)throw new Error("HTTP error! status: "+t.status);var r=await t.json();if(r)return r}catch(e){console.error("[SyncEngine] Firebase fetch failed:",e)}return null}async getAESKey(){var e=new TextEncoder;return await window.crypto.subtle.importKey("raw",e.encode(domain.padEnd(32).slice(0,32)),{name:"AES-GCM"},!1,["encrypt","decrypt"])}async decryptField(t){if(!t||"string"!=typeof t)return"";try{var e=Uint8Array.from(atob(t),e=>e.charCodeAt(0)),r=e.slice(0,12),a=e.slice(12),o=await this.getAESKey(),s=await window.crypto.subtle.decrypt({name:"AES-GCM",iv:r},o,a);return(new TextDecoder).decode(s)}catch(e){return t}}}function alertbox(e,t="success"){let r=document.getElementById("alertbox-container");r||((r=document.createElement("div")).id="alertbox-container",(o=document.createElement("style")).textContent=`
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
      `,document.head.appendChild(o),document.body.appendChild(r));const a=document.createElement("div");a.className="alertbox "+t;a.innerHTML=`
      <div class="alertbox-icon">${"success"===t?"✓":"!"}</div>
      <div class="alertbox-message">${e}</div>
      <button class="alertbox-close">&times;</button>
  `,r.appendChild(a);var o=()=>{a.classList.contains("closing")||(a.classList.add("closing"),setTimeout(()=>{a.remove()},250))};a.querySelector(".alertbox-close").onclick=o,setTimeout(o,4e3)}const STUDENT_FIELD_MAP={a:"Name",b:"Date of Birth",c:"Gender",d:"Student Contact",e:"Father's Full Name",f:"Mother's Full Name",g:"Home Address",h:"Current Class",i:"Admission Number",j:"Birth Certificate Number",k:"Year of Admission",l:"Grade of Admission",m:"Positions Held",n:"Discipline & Conduct",o:"Medical Conditions",p:"Father's NIC",q:"Mother's NIC",r:"Guardian's Full Name",s:"Guardian's NIC",t:"Grama Niladhari Division",u:"Divisional Secretariat Division",v:"Low-Income Status",w:"Aswesuma Beneficiary",x:"Siblings in School",y:"Photo URL",C:"Class Fee",D:"Attendance",B:"Updated By",A:"Updated At",z:"exam"};function getFullCloudinaryUrl(e){return e?e.startsWith("http")?e:"https://res.cloudinary.com/vmorkfqp/image/upload/"+e:""}function getCloudinaryPath(e){var t,r;return e?URL.canParse(e)&&-1!==(r=(t=new URL(e).pathname.split("/")).indexOf("upload"))?t.slice(r+1).join("/"):e:""}const firebaseConfig={apiKey:"AIzaSyBTq5fuuBh9Ye5r7exiJFtLjJpQ-9vIY2U",authDomain:"school-62c45.firebaseapp.com",databaseURL:"https://school-62c45-default-rtdb.asia-southeast1.firebasedatabase.app",projectId:"school-62c45",storageBucket:"school-62c45.firebasestorage.app",messagingSenderId:"213099404706",appId:"1:213099404706:web:d65d7ec257c1119f3966fb",measurementId:"G-8QG01WT32P"};let userID=null;firebase.initializeApp(firebaseConfig);const auth=firebase.auth(),db=firebase.database();db.goOffline(),auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);let schoolId,syncEngine=null;const urlParams=new URLSearchParams(window.location.search),CLOUDINARY_UPLOAD_PRESET=((schoolId=urlParams.get("school")?.trim().toLowerCase())&&(syncEngine=new SchoolSyncEngine(db,schoolId)),"school"),CLOUDINARY_CLOUD_NAME="vmorkfqp",domain=(auth.onAuthStateChanged(async e=>{e&&(userID=e.uid)}),"digibook");async function getKey(){var e=new TextEncoder;return await window.crypto.subtle.importKey("raw",e.encode(domain.padEnd(32).slice(0,32)),{name:"AES-GCM"},!1,["encrypt","decrypt"])}async function encryptField(e){var t,r,a;return e?(a=new TextEncoder,t=window.crypto.getRandomValues(new Uint8Array(12)),r=await getKey(),r=await window.crypto.subtle.encrypt({name:"AES-GCM",iv:t},r,a.encode(e)),(a=new Uint8Array(t.length+new Uint8Array(r).length)).set(t),a.set(new Uint8Array(r),t.length),btoa(String.fromCharCode.apply(null,a))):""}const DEFAULT_TEMPLATE="tpl-modern",DEFAULT_COLOR="blue";let settingsPromise=null;function getSetting(){return settingsPromise=settingsPromise||(async()=>{if(schoolId)try{var e=`${firebaseConfig.databaseURL}/schools/${schoolId}/details.json`,t=await fetch(e);if(!t.ok)throw new Error("HTTP error! status: "+t.status);var r=await t.json();if(r)return r}catch(e){console.error("Failed to fetch settings:",e)}return{template:DEFAULT_TEMPLATE,color:DEFAULT_COLOR}})()}
