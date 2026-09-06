const MODULE_FIELD_MAPS={students:{a:"fullName",b:"dob",c:"gender",d:"studentContact",e:"fatherName",f:"motherName",g:"address",h:"class",i:"admissionNo",j:"birthCertNo",k:"admissionYear",l:"admissionGrade",m:"positionsHeld",n:"discipline",o:"medical",p:"fatherNic",q:"motherNic",r:"guardianName",s:"guardianNic",t:"gnDivision",u:"dsDivision",v:"lowIncome",w:"aswesuma",x:"siblings",y:"photoUrl",z:"exam",A:"updatedAt",B:"updatedBy",D:"isDeleted"}},MODULE_FIELD_MAPS_USERS={a:"fullName",b:"dob",c:"gender",d:"subject",e:"qualification",f:"contact",g:"address",h:"photoUrl",i:"role",j:"claimed",A:"updatedAt",B:"updatedBy",D:"isDeleted"},USER_REVERSE_MAP=(MODULE_FIELD_MAPS.users=MODULE_FIELD_MAPS_USERS,{});for(const a in MODULE_FIELD_MAPS_USERS)USER_REVERSE_MAP[MODULE_FIELD_MAPS_USERS[a]]=a;function mapUserToFirebase(e){if(!e||"object"!=typeof e)return e;var t={};for(const i in e)t[USER_REVERSE_MAP[i]||i]=e[i];return t}function unmapUserFromFirebase(e){if(!e||"object"!=typeof e)return e;var t={};for(const i in e)t[MODULE_FIELD_MAPS_USERS[i]||i]=e[i];return t}class SchoolSyncEngine{constructor(e,t){this.db=e,this.schoolId=t,this.idbName="SIS_"+this.schoolId,this.idbVersion=3,this.idb=null,this.modules=["students","users","library","timetables","student_progress"]}unmapFromFirebase(e,t){if(!t||"object"!=typeof t)return t;var i=MODULE_FIELD_MAPS[e];if(!i)return t;var o={};for(const a in t)o[i[a]||a]=t[a];return o}mapToFirebase(e,t){if(!t||"object"!=typeof t)return t;var i=MODULE_FIELD_MAPS[e];if(!i)return t;var o={};for(const r in i)o[i[r]]=r;var a={};for(const s in t)a[o[s]||s]=t[s];return a}async initIndexedDB(){return new Promise((t,i)=>{var e=indexedDB.open(this.idbName,this.idbVersion);e.onupgradeneeded=e=>{const i=e.target.result;this.modules.forEach(e=>{var t;i.objectStoreNames.contains(e)||(t=i.createObjectStore(e,{keyPath:"id"}),"users"===e&&t.createIndex("role","role",{unique:!1}))})},e.onsuccess=e=>{this.idb=e.target.result,console.log("[IndexedDB] Connected: "+this.idbName),t(this.idb)},e.onerror=e=>i(e.target.error)})}saveToIDB(e,t){this.idb&&this.idb.transaction(e,"readwrite").objectStore(e).put(t)}removeFromIDB(e,t){this.idb&&this.idb.transaction(e,"readwrite").objectStore(e).delete(t)}async clearIDBStore(o){return new Promise((e,t)=>{if(!this.idb)return e();const i=this.idb.transaction(o,"readwrite").objectStore(o).clear();i.onsuccess=()=>e(),i.onerror=()=>t(i.error)})}async _syncModule(o){if(navigator.onLine){var e=`lastSync_${this.schoolId}_`+o,t=parseInt(localStorage.getItem(e)||"0",10),i=this.db.ref(`schools/${this.schoolId}/`+o);console.log(t);try{var a=await this.getLocalData(o);if(!a||0===a.length||0===t)await this._fullFetchModule(o);else{const r=(await i.orderByChild("A").startAt(t+1).once("value")).val();if(r){let i=t;Object.keys(r).forEach(e=>{console.log(e);var t=r[e],t=this.unmapFromFirebase(o,t);t.updatedAt&&t.updatedAt>i&&(i=t.updatedAt),t.isDeleted?this.removeFromIDB(o,e):(e={id:e,...t},this.saveToIDB(o,e))}),localStorage.setItem(e,i)}}}catch(e){console.error(`[SyncEngine] Error syncing ${o}:`,e)}}}async _fullFetchModule(i){const o=(await this.db.ref(`schools/${this.schoolId}/`+i).once("value")).val()||{};await this.clearIDBStore(i);let a=0;Object.keys(o).forEach(e=>{var t=this.unmapFromFirebase(i,o[e]);t.isDeleted||(e={id:e,...t},this.saveToIDB(i,e)),t.updatedAt&&t.updatedAt>a&&(a=t.updatedAt)}),0<a&&localStorage.setItem(lastSyncKey,a)}async syncStudents(){await this._syncModule("students")}async syncUsers(){await this._syncModule("users")}async syncLibrary(){await this._syncModule("library")}async syncTimetables(){await this._syncModule("timetables")}async syncStudent_progress(){await this._syncModule("student_progress")}async getLocalData(o){return new Promise((e,t)=>{if(!this.idb)return t("IDB not initialized");const i=this.idb.transaction(o,"readonly").objectStore(o).getAll();i.onsuccess=()=>e(i.result),i.onerror=()=>t(i.error)})}async getLocalRecord(o,a){return new Promise((e,t)=>{if(!this.idb)return t("IDB not initialized");const i=this.idb.transaction(o,"readonly").objectStore(o).get(a);i.onsuccess=()=>e(i.result),i.onerror=()=>t(i.error)})}async getLocalUsersByRole(o){return new Promise((e,t)=>{if(!this.idb)return t("IDB not initialized");const i=this.idb.transaction("users","readonly").objectStore("users").index("role").getAll(o);i.onsuccess=()=>e(i.result),i.onerror=()=>t(i.error)})}}function alertbox(e,t="success"){let i=document.getElementById("alertbox-container");i||((i=document.createElement("div")).id="alertbox-container",(a=document.createElement("style")).textContent=`
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
      `,document.head.appendChild(a),document.body.appendChild(i));const o=document.createElement("div");o.className="alertbox "+t;o.innerHTML=`
      <div class="alertbox-icon">${"success"===t?"✓":"!"}</div>
      <div class="alertbox-message">${e}</div>
      <button class="alertbox-close">&times;</button>
  `,i.appendChild(o);var a=()=>{o.classList.contains("closing")||(o.classList.add("closing"),setTimeout(()=>{o.remove()},250))};o.querySelector(".alertbox-close").onclick=a,setTimeout(a,4e3)}const STUDENT_FIELD_MAP={a:"Full Name",b:"Date of Birth",c:"Gender",d:"Student Contact",e:"Father's Full Name",f:"Mother's Full Name",g:"Home Address",h:"Current Class",i:"Admission Number",j:"Birth Certificate Number",k:"Year of Admission",l:"Grade of Admission",m:"Positions Held",n:"Discipline & Conduct",o:"Medical Conditions",p:"Father's NIC",q:"Mother's NIC",r:"Guardian's Full Name",s:"Guardian's NIC",t:"Grama Niladhari Division",u:"Divisional Secretariat Division",v:"Low-Income Status",w:"Aswesuma Beneficiary",x:"Siblings in School",y:"Photo URL",B:"Updated By",A:"Updated At",z:"exam"};function getFullCloudinaryUrl(e){return e?e.startsWith("http")?e:"https://res.cloudinary.com/vmorkfqp/image/upload/"+e:""}function getCloudinaryPath(e){var t,i;return e?URL.canParse(e)&&-1!==(i=(t=new URL(e).pathname.split("/")).indexOf("upload"))?t.slice(i+1).join("/"):e:""}const subjectData=[{category:"Primary Education",subjects:{1:"First Language (Sinhala)",2:"First Language (Tamil)",3:"English Language",4:"Mathematics",5:"Environmental Related Activities (ERA)",6:"Religion (Buddhism)",7:"Religion (Hinduism)",8:"Religion (Islam)",9:"Religion (Catholicism / Christianity)",10:"Primary Aesthetic Studies"}},{category:"Junior Secondary",subjects:{11:"Civic Education",12:"Practical & Technical Skills",13:"Health & Physical Education",14:"Second Language (Sinhala)",15:"Second Language (Tamil)"}},{category:"G.C.E. O/L - Core Subjects",subjects:{16:"Mathematics",17:"Science",18:"English Language",19:"History",20:"Sinhala Language & Literature",21:"Tamil Language & Literature",22:"Buddhism",23:"Saivanery (Hinduism)",24:"Islam",25:"Catholicism / Christianity"}},{category:"G.C.E. O/L - Category I Electives",subjects:{26:"Business & Accounting Studies",27:"Geography",28:"Entrepreneurship Studies",29:"Second Language (Sinhala)",30:"Second Language (Tamil)",31:"Pali",32:"Sanskrit",33:"French",34:"German",35:"Hindi",36:"Japanese",37:"Arabic",38:"Korean",39:"Chinese",40:"Russian"}},{category:"G.C.E. O/L - Category II Electives",subjects:{41:"Art",42:"Music (Oriental)",43:"Music (Western)",44:"Music (Carnatic)",45:"Dancing (Oriental)",46:"Dancing (Bharata)",47:"Drama & Theatre (Sinhala)",48:"Drama & Theatre (Tamil)",49:"Drama & Theatre (English)",50:"Appreciation of English Literary Texts",51:"Appreciation of Sinhala Literary Texts",52:"Appreciation of Tamil Literary Texts",53:"Appreciation of Arabic Literary Texts"}},{category:"G.C.E. O/L - Category III Electives",subjects:{54:"Information & Communication Technology (ICT)",55:"Agriculture & Food Technology",56:"Aquatic Bio-resources Technology",57:"Arts & Crafts",58:"Home Economics",59:"Health & Physical Education",60:"Communication & Media Studies",61:"Design & Construction Technology",62:"Design & Mechanical Technology",63:"Design, Electrical & Electronic Technology",64:"Electronic Writing & Shorthand"}},{category:"G.C.E. A/L - Science & Math Streams",subjects:{65:"Combined Mathematics",66:"Physics",67:"Chemistry",68:"Biology",69:"Agricultural Science",70:"Higher Mathematics"}},{category:"G.C.E. A/L - Commerce Stream",subjects:{71:"Accounting",72:"Business Studies",73:"Economics",74:"Business Statistics"}},{category:"G.C.E. A/L - Technology Stream",subjects:{75:"Engineering Technology",76:"Bio-Systems Technology",77:"Science for Technology"}},{category:"G.C.E. A/L - Arts & Humanities Stream",subjects:{78:"Political Science",79:"Logic & Scientific Method",80:"Sociology",81:"Psychology",82:"Buddhist Civilization",83:"Hindu Civilization",84:"Islam Civilization",85:"Christian Culture",86:"Greek & Roman Civilization",87:"Home Economics (A/L)"}},{category:"G.C.E. A/L - Compulsory Subjects",subjects:{88:"General English",89:"General Information Technology (GIT)",90:"Common General Test"}}];function generateSelectOptions(e,t){const i=document.getElementById(t);i&&(i.innerHTML="",e.forEach(e=>{const o=document.createElement("optgroup");o.label=e.category,Object.entries(e.subjects).forEach(([e,t])=>{var i=document.createElement("option");i.value=e,i.textContent=t,o.appendChild(i)}),i.appendChild(o)}))}
