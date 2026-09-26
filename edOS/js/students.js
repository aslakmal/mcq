schoolId||alertbox("Missing school ID in URL","error"),document.getElementById("addStudentBtn").href="student_register.html?school="+schoolId;let cachedStudents=[],selectedStudentIds=new Set,currentPage=1,pageSize=50,searchDebounceTimer=null;function generateClassOptions(){var e=document.getElementById("classList"),t=["A","B","C","D","E"];let n="";for(let e=1;e<=11;e++)for(const a of t)n+=`<option value="${e}${a}"></option>`;e.innerHTML=n}function restoreSearchState(){var e=sessionStorage.getItem("search_"+schoolId)||"",t=sessionStorage.getItem("class_"+schoolId)||"";document.getElementById("searchInput").value=e,document.getElementById("classInput").value=t}async function initApp(){generateClassOptions(),restoreSearchState();try{await syncEngine.initIndexedDB(),await loadFromIndexedDBDirect(),navigator.onLine&&(await syncEngine.syncStudents(),await loadFromIndexedDBDirect())}catch(e){console.warn("Network / Sync init skipped (Offline Mode):",e)}}function loadFromIndexedDBDirect(){return new Promise(t=>{syncEngine.getLocalData("students").then(e=>{e&&0<e.length&&((cachedStudents=e).forEach(e=>selectedStudentIds.add(e.id||e.key)),renderStudentTable(cachedStudents)),t()}).catch(()=>t())})}function renderStudentTable(e){var t=document.getElementById("studentTableBody");const n=document.getElementById("searchInput").value.toLowerCase().trim(),a=document.getElementById("classInput").value.toLowerCase().trim();var s,o,d,c,e=e.filter(e=>{var t=!n||e.fullName&&e.fullName.toLowerCase().includes(n)||e.id&&e.id.toLowerCase().includes(n),e=!a||e.class&&e.class.toLowerCase().includes(a);return t&&e});0===e.length?(t.innerHTML=`<tr><td colspan="6" class="empty-state">${n||a?"No matching students found.":"No students registered yet."}</td></tr>`,renderPagination(0,0),updateSelectionCounter()):(s=e.length,o=Math.ceil(s/pageSize),d=((currentPage=(currentPage=currentPage>o?o:currentPage)<1?1:currentPage)-1)*pageSize,c=Math.min(d+pageSize,s),e=e.slice(d,c),t.innerHTML=e.map(e=>{var t=e.photoUrl?getFullCloudinaryUrl(e.photoUrl):"img/user.svg",n=e.id||e.key,a=selectedStudentIds.has(n)?"checked":"";return`
        <tr id="${n}">
          <!--<td class="checkbox-col" data-label="Select">
            <input type="checkbox" class="custom-checkbox student-checkbox" value="${n}" ${a} onchange="toggleStudentSelection('${n}', this.checked)">
          </td>-->
          <td data-label="Student">
            <div class="student-info">
              <img src="${t}" class="avatar" alt="${escapeHtml(e.fullName)}">
              <div>
                <strong>${escapeHtml(e.fullName)}</strong>
              </div>
            </div>
          </td>
          <td data-label="ID"><span class="badge-id">${escapeHtml(e.id||"N/A")}</span></td>
          <td data-label="Class">${escapeHtml(e.class||"N/A")}</td>
          <td data-label="Contact">${escapeHtml(e.studentContact||"N/A")}</td>
          <td data-label="Actions">
          <div class="actions">
          <input type="checkbox"
          class="custom-checkbox student-checkbox"
          value="${n}"
          ${a}
          onchange="toggleStudentSelection('${n}', this.checked)"
          hidden>
   
   <button type="button"
           class="action-btn select-checkbox"
           title="Select"
           onclick="this.previousElementSibling.click()">
       <svg viewBox="0 0 24 24">
           <path d="M5 12.5l4 4L19 7.5"/>
       </svg>
   </button>
    <button onclick="openIdCardModalByKey('${n}', this)"
            class="action-btn view"
            title="View ID">
        <svg viewBox="0 0 24 24">
            <rect x="3" y="5" width="18" height="14" rx="2"/>
            <circle cx="8" cy="11" r="2"/>
            <path d="M12 10h6M12 14h4"/>
        </svg>
    </button>

    <button onclick="openDetails('${n}','${schoolId}')"
            class="action-btn details"
            title="Details">
        <svg viewBox="0 0 24 24">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/>
            <circle cx="12" cy="12" r="3"/>
        </svg>
    </button>

    <a href="student_edit.html?school=${schoolId}&id=${n}"
       class="action-btn edit"
       title="Edit">
        <svg viewBox="0 0 24 24">
            <path d="M4 20h4L19 9l-4-4L4 16v4z"/>
            <path d="M13.5 6.5l4 4"/>
        </svg>
    </a>

    <button onclick="confirmDelete('${n}', '${escapeHtml(e.fullName)}')"
            class="action-btn delete"
            title="Delete">
        <svg viewBox="0 0 24 24">
            <path d="M4 7h16"/>
            <path d="M9 7V4h6v3"/>
            <path d="M7 7l1 13h8l1-13"/>
            <path d="M10 11v5M14 11v5"/>
        </svg>
    </button>

</div>
          </td>
        </tr>
      `}).join(""),renderPagination(s,o,1+d,c),updateSelectionCounter(e))}function toggleStudentSelection(e,t){t?selectedStudentIds.add(e):selectedStudentIds.delete(e);t=Array.from(document.querySelectorAll(".student-checkbox")),0<t.length&&t.every(e=>e.checked),e=t.filter(e=>e.checked).length;document.getElementById("selectedCountText").innerText=e+" student(s) selected"}function toggleSelectAll(e){const t=e.checked;e=document.querySelectorAll(".student-checkbox"),e.forEach(e=>{e.checked=t;e=e.value;t?selectedStudentIds.add(e):selectedStudentIds.delete(e)}),e=t?e.length:0;document.getElementById("selectedCountText").innerText=e+" student(s) selected"}function syncSelectAllCheckboxState(e=[]){var t=document.getElementById("selectAllCheckbox");0===e.length?t.checked=!1:(e=e.every(e=>selectedStudentIds.has(e.id||e.key)),t.checked=e)}function updateSelectionCounter(e=[]){e=e.filter(e=>selectedStudentIds.has(e.id||e.key)).length;document.getElementById("selectedCountText").innerText=e+" student(s) selected"}function renderPagination(e,n,a,s){var o=document.getElementById("paginationInfo"),d=document.getElementById("paginationControls");if(0===e)o.innerText="Showing 0 of 0 students",d.innerHTML="";else{o.innerText=`Showing ${a}-${s} of ${e} students`;let t=`<button class="page-btn" ${1===currentPage?"disabled":""} onclick="goToPage(${currentPage-1})">Prev</button>`;for(let e=1;e<=n;e++)1===e||e===n||e>=currentPage-1&&e<=currentPage+1?t+=`<button class="page-btn ${e===currentPage?"active":""}" onclick="goToPage(${e})">${e}</button>`:e!==currentPage-2&&e!==currentPage+2||(t+='<span style="padding: 0 4px; color: #a0aec0;">...</span>');t+=`<button class="page-btn" ${currentPage===n?"disabled":""} onclick="goToPage(${currentPage+1})">Next</button>`,d.innerHTML=t}}function goToPage(e){currentPage=e,renderStudentTable(cachedStudents)}function handleSearchInput(){clearTimeout(searchDebounceTimer),searchDebounceTimer=setTimeout(()=>{var e=document.getElementById("searchInput").value,t=document.getElementById("classInput").value;sessionStorage.setItem("search_"+schoolId,e),sessionStorage.setItem("class_"+schoolId,t),currentPage=1,renderStudentTable(cachedStudents)},200)}function getSelectedStudents(){var e=Array.from(document.querySelectorAll(".student-checkbox:checked"));const t=new Set(e.map(e=>e.value));return cachedStudents.filter(e=>t.has(e.id||e.key))}function getStudentFromIDB(a){return new Promise(n=>{var e="SIS_"+schoolId,e=indexedDB.open(e);e.onsuccess=e=>{e=e.target.result;if(e.objectStoreNames.contains("students")){const t=e.transaction("students","readonly").objectStore("students").get(a);t.onsuccess=()=>n(t.result||null),t.onerror=()=>n(null)}else n(null)},e.onerror=()=>n(null)})}async function openBulkScoreModal(){var e=getSelectedStudents();console.log(e),0===e.length?alertbox("Please select at least one student to add or edit exam scores.","error"):(document.getElementById("bulkScoreStudentList").innerHTML=e.map(e=>{var t=e.id||e.key;return`
    <div class="score-list-item" data-id="${t}">
      <div class="score-student-detail">
        <img src="${e.photoUrl?getFullCloudinaryUrl(e.photoUrl):"img/user.svg"}" class="avatar" alt="${escapeHtml(e.fullName)}">
        <div>
          <strong>${escapeHtml(e.fullName)}</strong>
          <div style="font-size: 0.78rem; color: #718096;">ID: ${escapeHtml(e.id||"N/A")}</div>
        </div>
      </div>
      <div>
        <input type="number" min="0" max="100" class="score-input student-score-field" placeholder="Score" data-id="${t}">
      </div>
    </div>
  `}).join(""),document.getElementById("bulkScoreModal").style.display="flex",await fetchAndUpdateModalScores())}async function fetchAndUpdateModalScores(){var t=document.getElementById("scoreSemesterSelect").value,n=document.getElementById("scoreSubjectSelect").value;for(const s of document.querySelectorAll(".student-score-field")){const o=s.getAttribute("data-id");let e=null;var a=await getStudentFromIDB(o);null===(e=a&&a.exam&&a.exam["s"+t]&&void 0!==a.exam["s"+t][n]?a.exam["s"+t][n]:e)&&(a=cachedStudents.find(e=>(e.id||e.key)===o))&&a.exam&&a.exam["s"+t]&&void 0!==a.exam["s"+t][n]&&(e=a.exam["s"+t][n]),s.value=null!==e?e:""}}async function submitBulkScores(){const a=document.getElementById("scoreSemesterSelect").value,s=document.getElementById("scoreSubjectSelect").value;var e=document.querySelectorAll(".student-score-field");const o={};let d=0;const c=Date.now(),l=firebase.auth().currentUser?firebase.auth().currentUser.uid:"system";if(e.forEach(e=>{const t=e.getAttribute("data-id");var n,e=e.value.trim();""!==e&&(e=Number(e),n=`schools/${schoolId}/students/`+t,o[n+`/z/s${a}/`+s]=e,o[n+"/A"]=firebase.database.ServerValue.TIMESTAMP,o[n+"/B"]=l,(n=cachedStudents.find(e=>(e.id||e.key)===t))&&(n.exam||(n.exam={}),n.exam["s"+a]||(n.exam["s"+a]={}),n.exam["s"+a][s]=e,n.updatedAt=c,n.updatedBy=l,syncEngine.saveToIDB("students",n)),d++)}),0===d)alertbox("Please enter a score for at least one student.","error");else try{navigator.onLine&&await db.ref().update(o),alertbox(`Successfully saved/updated scores for ${d} student(s).`,"success"),closeModal("bulkScoreModal")}catch(e){alertbox("Failed to save scores: "+e.message,"error")}}function openBulkClassModal(){0===getSelectedStudents().length?alertbox("Please select at least one student to change class.","error"):(document.getElementById("newClassInput").value="",document.getElementById("bulkClassModal").style.display="flex")}async function submitBulkClassChange(){const n=document.getElementById("newClassInput").value.trim().toUpperCase();if(n){var e=getSelectedStudents();if(0===e.length)alertbox("No students selected.","error");else{const a={},s=Date.now(),o=firebase.auth().currentUser?firebase.auth().currentUser.uid:"system";e.forEach(e=>{var t=e.id||e.key,t=`schools/${schoolId}/students/`+t;a[t+"/h"]=n,a[t+"/A"]=firebase.database.ServerValue.TIMESTAMP,a[t+"/B"]=o,e.class=n,e.updatedAt=s,e.updatedBy=o,console.log(e),syncEngine.saveToIDB("students",e)});try{navigator.onLine&&await db.ref().update(a),renderStudentTable(cachedStudents),alertbox(`Updated ${e.length} student(s) to Class ${n}.`,"success"),closeModal("bulkClassModal")}catch(e){alertbox("Failed to update classes: "+e.message,"error")}}}else alertbox("Please enter a valid class name.","error")}function closeModal(e){document.getElementById(e).style.display="none"}async function openIdCardModalByKey(t,e){const n=cachedStudents.find(e=>(e.id||e.key)===t);if(n){var a=e?e.innerHTML:"";e&&(e.disabled=!0,e.innerHTML=`
    <svg class="loading-icon" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9"></circle>
    </svg>
`);try{var s=await getSetting();const i=MODULE_FIELD_MAPS.students;document.getElementById("cardSchoolFront").innerText=s.schoolName||"SCHOOL",document.getElementById("cardSchoolFront").innerText=s.schoolName||"SCHOOL",document.getElementById("cardPhoto").src=n.photoUrl?getFullCloudinaryUrl(n.photoUrl)+"?c":"img/user.svg",document.getElementById("cardName").innerText=n.fullName||"";var o=s.frontFields||["i","b","h"],d=s.backFields||["e","f","d","g"],c=document.getElementById("frontCardBody"),l=(c&&(c.innerHTML=o.map(e=>{var t=i[e];return t?`
        <div class="info-row">
          <span class="label">${formatLabel(t)}:</span>
          <span class="value">${n[t]??n[e]??"-"}</span>
        </div>
      `:""}).join("")),document.getElementById("backCardBody"));l&&(l.innerHTML=d.map(e=>{var t=i[e];return t?`
        <p><strong>${formatLabel(t)}:</strong> <span>${n[t]??n[e]??"-"}</span></p>
      `:""}).join(""));let e="https://digibook.edu.lk/edOS/";var r=`${e=(e="custom"===s.qrType&&s.qrCustomUrl?s.qrCustomUrl.trim():e).endsWith("/")?e.slice(0,-1):e}/student.html?school=${encodeURIComponent(schoolId)}&id=`+encodeURIComponent(t),u=document.getElementById("qrcode");u&&(u.innerHTML="",new QRCode(u,{text:r,width:90,height:90})),document.getElementById("idCardModal").style.display="flex"}catch(e){console.error("Error fetching school details for modal:",e)}finally{e&&(e.disabled=!1,e.innerHTML=a)}document.querySelector(".print-btn").dataset.student=t}}async function confirmDelete(t,e){if(confirm(`Are you sure you want to delete ${e}?`)){e=firebase.auth().currentUser;if(e)try{await db.ref(`schools/${schoolId}/students/`+t).set({D:!0,A:firebase.database.ServerValue.TIMESTAMP,B:e.uid}),cachedStudents=cachedStudents.filter(e=>(e.id||e.key)!==t),selectedStudentIds.delete(t),renderStudentTable(cachedStudents)}catch(e){alertbox("Delete failed: "+e.message,"error")}else alertbox("Session expired. Please log in again.","error")}}function escapeHtml(e){return String(e||"").replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e])}document.getElementById("searchInput").addEventListener("input",handleSearchInput),document.getElementById("classInput").addEventListener("input",handleSearchInput),document.getElementById("pageSizeSelect").addEventListener("change",e=>{pageSize=parseInt(e.target.value,10),currentPage=1,renderStudentTable(cachedStudents)}),initApp(),generateSelectOptions(subjectData,"scoreSubjectSelect"),auth.onAuthStateChanged(e=>{var t=window.location.pathname.endsWith("admin.html");e||!navigator.onLine||t||(window.location.href="admin.html")});
