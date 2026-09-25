const MODULE_FIELD_MAPS={students:{a:"fullName",b:"dob",c:"gender",d:"studentContact",e:"fatherName",f:"motherName",g:"address",h:"class",i:"admissionNo",j:"birthCertNo",k:"admissionYear",l:"admissionGrade",m:"positionsHeld",n:"discipline",o:"medical",p:"fatherNic",q:"motherNic",r:"guardianName",s:"guardianNic",t:"gnDivision",u:"dsDivision",v:"lowIncome",w:"aswesuma",x:"siblings",y:"photoUrl",z:"exam",A:"updatedAt",B:"updatedBy",D:"isDeleted"}},MODULE_FIELD_MAPS_USERS={a:"fullName",b:"dob",c:"gender",d:"subject",e:"qualification",f:"contact",g:"address",h:"photoUrl",i:"role",j:"claimed",k:"school",l:"email",m:"arrivalDate",n:"firstAppointmentDate",o:"nic",p:"previousSchool",q:"salaryCode",r:"assignedClasses",A:"updatedAt",B:"updatedBy",D:"isDeleted"},USER_REVERSE_MAP=(MODULE_FIELD_MAPS.users=MODULE_FIELD_MAPS_USERS,{});for(const a in MODULE_FIELD_MAPS_USERS)USER_REVERSE_MAP[MODULE_FIELD_MAPS_USERS[a]]=a;function mapUserToFirebase(e){if(!e||"object"!=typeof e)return e;var t={};for(const a in e)t[USER_REVERSE_MAP[a]||a]=e[a];return t}function unmapUserFromFirebase(e){if(!e||"object"!=typeof e)return e;var t={};for(const a in e)t[MODULE_FIELD_MAPS_USERS[a]||a]=e[a];return t}class SchoolSyncEngine{constructor(e,t){this.db=e,this.schoolId=t,this.idbName="SIS_"+this.schoolId,this.idbVersion=3,this.idb=null,this.modules=["students","users","library","timetables","student_progress","schoolDetails"]}unmapFromFirebase(e,t){if(!t||"object"!=typeof t)return t;var a=MODULE_FIELD_MAPS[e];if(!a)return t;var i={};for(const o in t)i[a[o]||o]=t[o];return i}mapToFirebase(e,t){if(!t||"object"!=typeof t)return t;var a=MODULE_FIELD_MAPS[e];if(!a)return t;var i={};for(const s in a)i[a[s]]=s;var o={};for(const r in t)o[i[r]||r]=t[r];return o}async initIndexedDB(){return new Promise((t,a)=>{var e=indexedDB.open(this.idbName,this.idbVersion);e.onupgradeneeded=e=>{const a=e.target.result;this.modules.forEach(e=>{var t;a.objectStoreNames.contains(e)||(t=a.createObjectStore(e,{keyPath:"id"}),"users"===e&&t.createIndex("role","role",{unique:!1}))})},e.onsuccess=e=>{this.idb=e.target.result,console.log("[IndexedDB] Connected: "+this.idbName),t(this.idb)},e.onerror=e=>a(e.target.error)})}saveToIDB(e,t){this.idb&&this.idb.transaction(e,"readwrite").objectStore(e).put(t)}removeFromIDB(e,t){this.idb&&this.idb.transaction(e,"readwrite").objectStore(e).delete(t)}async clearIDBStore(i){return new Promise((e,t)=>{if(!this.idb)return e();const a=this.idb.transaction(i,"readwrite").objectStore(i).clear();a.onsuccess=()=>e(),a.onerror=()=>t(a.error)})}async _syncModule(i){if(navigator.onLine){var e=`lastSync_${this.schoolId}_`+i,t=parseInt(localStorage.getItem(e)||"0",10),a=this.db.ref(`schools/${this.schoolId}/`+i);console.log(t);try{var o=await this.getLocalData(i);if(!o||0===o.length||0===t)await this._fullFetchModule(i);else{const s=(await a.orderByChild("A").startAt(t+1).once("value")).val();if(s){let a=t;Object.keys(s).forEach(e=>{console.log(e);var t=s[e],t=this.unmapFromFirebase(i,t);t.updatedAt&&t.updatedAt>a&&(a=t.updatedAt),t.isDeleted?this.removeFromIDB(i,e):(e={id:e,...t},this.saveToIDB(i,e))}),localStorage.setItem(e,a)}}}catch(e){console.error(`[SyncEngine] Error syncing ${i}:`,e)}}}async _fullFetchModule(a){var e=`lastSync_${this.schoolId}_`+a;const i=(await this.db.ref(`schools/${this.schoolId}/`+a).once("value")).val()||{};await this.clearIDBStore(a);let o=0;Object.keys(i).forEach(e=>{var t=this.unmapFromFirebase(a,i[e]);t.isDeleted||(e={id:e,...t},this.saveToIDB(a,e)),t.updatedAt&&t.updatedAt>o&&(o=t.updatedAt)}),0<o&&localStorage.setItem(e,o)}async syncStudents(){await this._syncModule("students")}async syncUsers(){await this._syncModule("users")}async syncLibrary(){await this._syncModule("library")}async syncTimetables(){await this._syncModule("timetables")}async syncStudent_progress(){await this._syncModule("student_progress")}async getLocalData(i){return new Promise((e,t)=>{if(!this.idb)return t("IDB not initialized");const a=this.idb.transaction(i,"readonly").objectStore(i).getAll();a.onsuccess=()=>e(a.result),a.onerror=()=>t(a.error)})}async getLocalRecord(i,o){return new Promise((e,t)=>{if(!this.idb)return t("IDB not initialized");const a=this.idb.transaction(i,"readonly").objectStore(i).get(o);a.onsuccess=()=>e(a.result),a.onerror=()=>t(a.error)})}async getLocalUsersByRole(i){return new Promise((e,t)=>{if(!this.idb)return t("IDB not initialized");const a=this.idb.transaction("users","readonly").objectStore("users").index("role").getAll(i);a.onsuccess=()=>e(a.result),a.onerror=()=>t(a.error)})}async getSchoolDetails(){try{var e=await this.getLocalData("schoolDetails");if(e&&0<e.length)return e[0]}catch(e){console.warn("[SyncEngine] Local IDB fetch failed, falling back to Firebase:",e)}try{var t,a=(await this.db.ref(`schools/${this.schoolId}/details`).once("value")).val();if(a)return t={id:"info",...a},this.saveToIDB("schoolDetails",t),t}catch(e){console.error("[SyncEngine] Firebase fetch failed:",e)}return null}}function alertbox(e,t="success"){let a=document.getElementById("alertbox-container");a||((a=document.createElement("div")).id="alertbox-container",(o=document.createElement("style")).textContent=`
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
      `,document.head.appendChild(o),document.body.appendChild(a));const i=document.createElement("div");i.className="alertbox "+t;i.innerHTML=`
      <div class="alertbox-icon">${"success"===t?"✓":"!"}</div>
      <div class="alertbox-message">${e}</div>
      <button class="alertbox-close">&times;</button>
  `,a.appendChild(i);var o=()=>{i.classList.contains("closing")||(i.classList.add("closing"),setTimeout(()=>{i.remove()},250))};i.querySelector(".alertbox-close").onclick=o,setTimeout(o,4e3)}const STUDENT_FIELD_MAP={a:"Full Name",b:"Date of Birth",c:"Gender",d:"Student Contact",e:"Father's Full Name",f:"Mother's Full Name",g:"Home Address",h:"Current Class",i:"Admission Number",j:"Birth Certificate Number",k:"Year of Admission",l:"Grade of Admission",m:"Positions Held",n:"Discipline & Conduct",o:"Medical Conditions",p:"Father's NIC",q:"Mother's NIC",r:"Guardian's Full Name",s:"Guardian's NIC",t:"Grama Niladhari Division",u:"Divisional Secretariat Division",v:"Low-Income Status",w:"Aswesuma Beneficiary",x:"Siblings in School",y:"Photo URL",B:"Updated By",A:"Updated At",z:"exam"};function getFullCloudinaryUrl(e){return e?e.startsWith("http")?e:"https://res.cloudinary.com/vmorkfqp/image/upload/"+e:""}function getCloudinaryPath(e){var t,a;return e?URL.canParse(e)&&-1!==(a=(t=new URL(e).pathname.split("/")).indexOf("upload"))?t.slice(a+1).join("/"):e:""}const subjectData=[{category:"Primary Education",subjects:{1:"First Language (Sinhala)",2:"First Language (Tamil)",3:"English Language",4:"Mathematics",5:"Environmental Related Activities (ERA)",6:"Religion (Buddhism)",7:"Religion (Hinduism)",8:"Religion (Islam)",9:"Religion (Catholicism / Christianity)",10:"Primary Aesthetic Studies"}},{category:"Junior Secondary",subjects:{11:"Civic Education",12:"Practical & Technical Skills",13:"Health & Physical Education",14:"Second Language (Sinhala)",15:"Second Language (Tamil)"}},{category:"G.C.E. O/L - Core Subjects",subjects:{16:"Mathematics",17:"Science",18:"English Language",19:"History",20:"Sinhala Language & Literature",21:"Tamil Language & Literature",22:"Buddhism",23:"Saivanery (Hinduism)",24:"Islam",25:"Catholicism / Christianity"}},{category:"G.C.E. O/L - Category I Electives",subjects:{26:"Business & Accounting Studies",27:"Geography",28:"Entrepreneurship Studies",29:"Second Language (Sinhala)",30:"Second Language (Tamil)",31:"Pali",32:"Sanskrit",33:"French",34:"German",35:"Hindi",36:"Japanese",37:"Arabic",38:"Korean",39:"Chinese",40:"Russian"}},{category:"G.C.E. O/L - Category II Electives",subjects:{41:"Art",42:"Music (Oriental)",43:"Music (Western)",44:"Music (Carnatic)",45:"Dancing (Oriental)",46:"Dancing (Bharata)",47:"Drama & Theatre (Sinhala)",48:"Drama & Theatre (Tamil)",49:"Drama & Theatre (English)",50:"Appreciation of English Literary Texts",51:"Appreciation of Sinhala Literary Texts",52:"Appreciation of Tamil Literary Texts",53:"Appreciation of Arabic Literary Texts"}},{category:"G.C.E. O/L - Category III Electives",subjects:{54:"Information & Communication Technology (ICT)",55:"Agriculture & Food Technology",56:"Aquatic Bio-resources Technology",57:"Arts & Crafts",58:"Home Economics",59:"Health & Physical Education",60:"Communication & Media Studies",61:"Design & Construction Technology",62:"Design & Mechanical Technology",63:"Design, Electrical & Electronic Technology",64:"Electronic Writing & Shorthand"}},{category:"G.C.E. A/L - Science & Math Streams",subjects:{65:"Combined Mathematics",66:"Physics",67:"Chemistry",68:"Biology",69:"Agricultural Science",70:"Higher Mathematics"}},{category:"G.C.E. A/L - Commerce Stream",subjects:{71:"Accounting",72:"Business Studies",73:"Economics",74:"Business Statistics"}},{category:"G.C.E. A/L - Technology Stream",subjects:{75:"Engineering Technology",76:"Bio-Systems Technology",77:"Science for Technology"}},{category:"G.C.E. A/L - Arts & Humanities Stream",subjects:{78:"Political Science",79:"Logic & Scientific Method",80:"Sociology",81:"Psychology",82:"Buddhist Civilization",83:"Hindu Civilization",84:"Islam Civilization",85:"Christian Culture",86:"Greek & Roman Civilization",87:"Home Economics (A/L)"}},{category:"G.C.E. A/L - Compulsory Subjects",subjects:{88:"General English",89:"General Information Technology (GIT)",90:"Common General Test"}}];function generateSelectOptions(e,t){const a=document.getElementById(t);a&&(a.innerHTML="",e.forEach(e=>{const i=document.createElement("optgroup");i.label=e.category,Object.entries(e.subjects).forEach(([e,t])=>{var a=document.createElement("option");a.value=e,a.textContent=t,i.appendChild(a)}),a.appendChild(i)}))}const firebaseConfig={apiKey:"AIzaSyBTq5fuuBh9Ye5r7exiJFtLjJpQ-9vIY2U",authDomain:"school-62c45.firebaseapp.com",databaseURL:"https://school-62c45-default-rtdb.asia-southeast1.firebasedatabase.app",projectId:"school-62c45",storageBucket:"school-62c45.firebasestorage.app",messagingSenderId:"213099404706",appId:"1:213099404706:web:d65d7ec257c1119f3966fb",measurementId:"G-8QG01WT32P"};let userID=null;firebase.initializeApp(firebaseConfig);const auth=firebase.auth(),db=firebase.database();auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);let schoolId,syncEngine=null;const urlParams=new URLSearchParams(window.location.search),CLOUDINARY_UPLOAD_PRESET=((schoolId=urlParams.get("school")?.trim().toLowerCase())&&(syncEngine=new SchoolSyncEngine(db,schoolId)),"school"),CLOUDINARY_CLOUD_NAME="vmorkfqp";auth.onAuthStateChanged(async e=>{e&&(userID=e.uid)});
