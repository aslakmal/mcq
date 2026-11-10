schoolId||alertbox("Missing school ID in URL","error"),document.getElementById("addStudentBtn").href="student_register.html?school="+schoolId;const instituteType=localStorage.getItem("instituteType")||"";"tuition"===instituteType&&(document.querySelector(".btn-bulk-price").style.display="block");let cachedStudents=[],selectedStudentIds=new Set,currentPage=1,pageSize=50,searchDebounceTimer=null;function generateClassOptions(){var e=document.getElementById("classList"),t=["A","B","C","D","E"];let n="";for(let e=1;e<=11;e++)for(const a of t)n+=`<option value="${e}${a}"></option>`;e.innerHTML=n}function restoreSearchState(){var e=sessionStorage.getItem("search_"+schoolId)||"",t=sessionStorage.getItem("class_"+schoolId)||"";document.getElementById("searchInput").value=e,document.getElementById("classInput").value=t}async function initApp(){generateClassOptions(),restoreSearchState();try{await syncEngine.initIndexedDB(),await syncEngine.syncStudents(),await loadFromIndexedDBDirect()}catch(e){console.warn("Network / Sync init skipped (Offline Mode):",e)}}function loadFromIndexedDBDirect(){return new Promise(t=>{syncEngine.getLocalData("students").then(e=>{e&&0<e.length&&((cachedStudents=e).forEach(e=>selectedStudentIds.add(e.id||e.key)),renderStudentTable(cachedStudents)),t()}).catch(()=>t())})}async function renderStudentTable(e){var t=document.getElementById("studentTableBody");const s=document.getElementById("searchInput").value.toLowerCase().trim(),l=document.getElementById("classInput").value.toLowerCase().trim();var n,a,o,d,e=e.filter(e=>{var t,n=!s||e.name&&e.name.toLowerCase().includes(s)||e.id&&e.id.toLowerCase().includes(s);let a=!0;return l&&(t=l.toLowerCase().trim(),e=(e.class||"").toLowerCase().trim(),a="1"===t?/(^|\D)1(\D|$)/.test(e):e.includes(t)),n&&a});0===e.length?(t.innerHTML=`<tr><td colspan="6" class="empty-state">${s||l?"No matching students found.":"No students registered yet."}</td></tr>`,renderPagination(0,0),updateSelectionCounter()):(n=e.length,a=Math.ceil(n/pageSize),o=((currentPage=(currentPage=currentPage>a?a:currentPage)<1?1:currentPage)-1)*pageSize,d=Math.min(o+pageSize,n),e=e.slice(o,d),t.innerHTML=e.map(e=>{var t=e.photoUrl?getFullCloudinaryUrl(e.photoUrl):"img/user.svg",n=e.id||e.key,a=selectedStudentIds.has(n)?"checked":"";return`
        <tr id="${n}">
          <!--<td class="checkbox-col" data-label="Select">
            <input type="checkbox" class="custom-checkbox student-checkbox" value="${n}" ${a} onchange="toggleStudentSelection('${n}', this.checked)">
          </td>-->
          <td data-label="Student">
            <div class="student-info" onclick="openDetails('${n}','${schoolId}')">
              <img src="${t}" class="avatar" alt="${escapeHtml(e.name)}">
              <div>
                <strong>${escapeHtml(e.name)}</strong>
              </div>
            </div>
          </td>
          <td data-label="ID"><span class="badge-id">${escapeHtml(e.id||"N/A")}</span></td>
          <td data-label="Class">${escapeHtml(e.class||"N/A")}</td>
         <!-- <td data-label="Contact">${escapeHtml(e.studentContact||"N/A")}</td>-->
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

    <button onclick="confirmDelete('${n}', '${escapeHtml(e.name)}')"
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
      `}).join(""),renderPagination(n,a,1+o,d),updateSelectionCounter(e))}function toggleStudentSelection(e,t){t?selectedStudentIds.add(e):selectedStudentIds.delete(e);t=Array.from(document.querySelectorAll(".student-checkbox")),0<t.length&&t.every(e=>e.checked),e=t.filter(e=>e.checked).length;document.getElementById("selectedCountText").innerText=e+" student(s) selected"}function toggleSelectAll(e){const t=e.checked;e=document.querySelectorAll(".student-checkbox"),e.forEach(e=>{e.checked=t;e=e.value;t?selectedStudentIds.add(e):selectedStudentIds.delete(e)}),e=t?e.length:0;document.getElementById("selectedCountText").innerText=e+" student(s) selected"}function syncSelectAllCheckboxState(e=[]){var t=document.getElementById("selectAllCheckbox");0===e.length?t.checked=!1:(e=e.every(e=>selectedStudentIds.has(e.id||e.key)),t.checked=e)}function updateSelectionCounter(e=[]){e=e.filter(e=>selectedStudentIds.has(e.id||e.key)).length;document.getElementById("selectedCountText").innerText=e+" student(s) selected"}function renderPagination(e,n,a,s){var l=document.getElementById("paginationInfo"),o=document.getElementById("paginationControls");if(0===e)l.innerText="Showing 0 of 0 students",o.innerHTML="";else{l.innerText=`Showing ${a}-${s} of ${e} students`;let t=`<button class="page-btn" ${1===currentPage?"disabled":""} onclick="goToPage(${currentPage-1})">Prev</button>`;for(let e=1;e<=n;e++)1===e||e===n||e>=currentPage-1&&e<=currentPage+1?t+=`<button class="page-btn ${e===currentPage?"active":""}" onclick="goToPage(${e})">${e}</button>`:e!==currentPage-2&&e!==currentPage+2||(t+='<span style="padding: 0 4px; color: #a0aec0;">...</span>');t+=`<button class="page-btn" ${currentPage===n?"disabled":""} onclick="goToPage(${currentPage+1})">Next</button>`,o.innerHTML=t}}function goToPage(e){currentPage=e,renderStudentTable(cachedStudents)}function handleSearchInput(){clearTimeout(searchDebounceTimer),searchDebounceTimer=setTimeout(()=>{var e=document.getElementById("searchInput").value,t=document.getElementById("classInput").value;sessionStorage.setItem("search_"+schoolId,e),sessionStorage.setItem("class_"+schoolId,t),currentPage=1,renderStudentTable(cachedStudents)},200)}function getSelectedStudents(){var e=Array.from(document.querySelectorAll(".student-checkbox:checked"));const t=new Set(e.map(e=>e.value));return cachedStudents.filter(e=>t.has(e.id||e.key))}function getStudentFromIDB(a){return new Promise(n=>{var e="SIS_"+schoolId,e=indexedDB.open(e);e.onsuccess=e=>{e=e.target.result;if(e.objectStoreNames.contains("students")){const t=e.transaction("students","readonly").objectStore("students").get(a);t.onsuccess=()=>n(t.result||null),t.onerror=()=>n(null)}else n(null)},e.onerror=()=>n(null)})}async function openBulkScoreModal(){document.getElementById("bulkScoreModal").style.display="flex";var e=await getSetting(),e=(e&&populateExamDropdowns(e.exams),getSelectedStudents());0===e.length?alertbox("Please select at least one student to add or edit exam scores.","error"):(document.getElementById("bulkScoreStudentList").innerHTML=e.map(e=>{var t=e.id||e.key;return`
    <div class="score-list-item" data-id="${t}">
      <div class="score-student-detail">
        <img src="${e.photoUrl?getFullCloudinaryUrl(e.photoUrl):"img/user.svg"}" class="avatar" alt="${escapeHtml(e.name)}">
        <div>
          <strong>${escapeHtml(e.name)}</strong>
          <div style="font-size: 0.78rem; color: #718096;">ID: ${escapeHtml(e.id||"N/A")}</div>
        </div>
      </div>
      <div>
        <input type="number" min="0" max="100" class="score-input student-score-field" disabled placeholder="Score" data-id="${t}" oninput="validateScore(this)">
      </div>
    </div>
  `}).join(""),await fetchAndUpdateModalScores())}document.getElementById("searchInput").addEventListener("input",handleSearchInput),document.getElementById("classInput").addEventListener("input",handleSearchInput),document.getElementById("pageSizeSelect").addEventListener("change",e=>{pageSize=parseInt(e.target.value,10),currentPage=1,renderStudentTable(cachedStudents)});let bulkProgressChartInstance=null;async function openBulkProgressModal(){document.getElementById("bulkProgressModal").style.display="flex";var e,t=await getSetting(),t=(t&&populateExamDropdowns(t.exams),getSelectedStudents());0===t.length?alertbox("Please select at least one student to view progress.","error"):(t=Math.max(300,35*t.length),(e=document.getElementById("chartWrapper"))&&(e.style.height=t+"px"),await updateChart())}async function updateChart(){var t=getActiveModalSelect("scoreSemesterSelect").value,n=getActiveModalSelect("scoreSubjectSelect").value,e=getSelectedStudents();if(0!==e.length){var a=[],s=[];for(const d of e){const c=d.id||d.key;a.push(d.name||"Unknown");let e=null;var l=await getStudentFromIDB(c);null===(e=l&&l.exam&&l.exam[t]&&void 0!==l.exam[t][n]?l.exam[t][n]:e)&&(l=cachedStudents.find(e=>(e.id||e.key)===c))&&l.exam&&l.exam[t]&&void 0!==l.exam[t][n]&&(e=l.exam[t][n]),s.push(null!==e?Number(e):0)}var o,e=document.getElementById("bulkProgressChart");e&&((e=(o=e.getContext("2d")).createLinearGradient(0,0,e.width,0)).addColorStop(0,"#5dd8e8"),e.addColorStop(1,"#5576fa"),bulkProgressChartInstance?(bulkProgressChartInstance.data.labels=a,bulkProgressChartInstance.data.datasets[0].data=s,bulkProgressChartInstance.update()):bulkProgressChartInstance=new Chart(o,{type:"bar",data:{labels:a,datasets:[{label:"Score",data:s,backgroundColor:e,borderRadius:4,barPercentage:.75,categoryPercentage:.85}]},options:{indexAxis:"y",responsive:!0,maintainAspectRatio:!1,scales:{x:{beginAtZero:!0,max:100},y:{ticks:{callback:function(e){e=this.getLabelForValue(e);return 18<e.length?e.substring(0,10)+"...":e}}}},plugins:{legend:{display:!1},tooltip:{callbacks:{title:function(e){return e[0].label},label:function(e){return" Score: "+e.raw}}}}}}))}}async function checkOptions(){var e=getActiveModalSelect("scoreSemesterSelect"),t=getActiveModalSelect("scoreSubjectSelect");(e.options.length<=1||t.options.length<=1)&&alertbox("Should add exams and subjects in principal dashboard","error")}async function fetchAndUpdateModalScores(){var t=getActiveModalSelect("scoreSemesterSelect").value,n=getActiveModalSelect("scoreSubjectSelect").value,a=""!==t&&""!==n;for(const l of document.querySelectorAll(".student-score-field")){l.disabled=!a;const o=l.getAttribute("data-id");let e=null;var s=await getStudentFromIDB(o);null===(e=s&&s.exam&&s.exam[""+t]&&void 0!==s.exam[""+t][n]?s.exam[""+t][n]:e)&&(s=cachedStudents.find(e=>(e.id||e.key)===o))&&s.exam&&s.exam[""+t]&&void 0!==s.exam[""+t][n]&&(e=s.exam[""+t][n]),l.value=null!==e?e:""}}function getActiveModalSelect(e){var t=Array.from(document.querySelectorAll(".modal-overlay")).find(e=>{e=window.getComputedStyle(e).display;return"flex"===e||"block"===e});return t?t.querySelector("."+e):null}async function submitBulkScores(){const a=getActiveModalSelect("scoreSemesterSelect").value,s=getActiveModalSelect("scoreSubjectSelect").value;var e=document.querySelectorAll(".student-score-field");const l={};let o=0;const d=Date.now(),c=firebase.auth().currentUser?firebase.auth().currentUser.uid:"system";if(e.forEach(e=>{const t=e.getAttribute("data-id");var n,e=e.value.trim();""!==e&&(e=Number(e),n=`schools/${schoolId}/students/`+t,l[n+`/z/${a}/`+s]=e,l[n+"/A"]=firebase.database.ServerValue.TIMESTAMP,l[n+"/B"]=c,(n=cachedStudents.find(e=>(e.id||e.key)===t))&&(n.exam||(n.exam={}),n.exam[""+a]||(n.exam[""+a]={}),n.exam[""+a][s]=e,n.updatedAt=d,n.updatedBy=c,syncEngine.saveToIDB("students",n)),o++)}),0===o)alertbox("Please enter a score for at least one student.","error");else try{db.goOnline(),await db.ref().update(l),alertbox(`Successfully saved/updated scores for ${o} student(s).`,"success")}catch(e){alertbox("Failed to save scores: "+e.message,"error")}finally{db.goOffline()}}function openBulkClassModal(){0===getSelectedStudents().length?alertbox("Please select at least one student to change class.","error"):(document.getElementById("newClassInput").value="",document.getElementById("bulkClassModal").style.display="flex")}async function submitBulkClassChange(){const n=document.getElementById("newClassInput").value.trim().toUpperCase();if(n){var e=getSelectedStudents();if(0===e.length)alertbox("No students selected.","error");else{const a={},s=Date.now(),l=firebase.auth().currentUser?firebase.auth().currentUser.uid:"system";e.forEach(e=>{var t=e.id||e.key,t=`schools/${schoolId}/students/`+t;a[t+"/h"]=n,a[t+"/A"]=firebase.database.ServerValue.TIMESTAMP,a[t+"/B"]=l,e.class=n,e.updatedAt=s,e.updatedBy=l,syncEngine.saveToIDB("students",e)});try{db.goOnline(),await db.ref().update(a),renderStudentTable(cachedStudents),alertbox(`Updated ${e.length} student(s) to Class ${n}.`,"success"),closeModal("bulkClassModal")}catch(e){alertbox("Failed to update classes: "+e.message,"error")}finally{db.goOffline()}}}else alertbox("Please enter a valid class name.","error")}function openBulkPriceModal(){0===getSelectedStudents().length?alertbox("Please select at least one student to change class.","error"):(document.getElementById("newClassInput").value="",document.getElementById("bulkPriceModal").style.display="flex")}async function submitBulkPriceChange(){var e=document.getElementById("newPriceInput").value.trim();const n=parseFloat(e);if(isNaN(n)||n<0)alertbox("Please enter a valid price.","error");else{e=getSelectedStudents();if(0===e.length)alertbox("No students selected.","error");else{const a={},s=Date.now(),l=firebase.auth().currentUser?firebase.auth().currentUser.uid:"system";e.forEach(e=>{var t=e.id||e.key,t=`schools/${schoolId}/students/`+t;a[t+"/C"]=n,a[t+"/A"]=firebase.database.ServerValue.TIMESTAMP,a[t+"/B"]=l,e.classFee=n,e.updatedAt=s,e.updatedBy=l,syncEngine.saveToIDB("students",e)});try{db.goOnline(),await db.ref().update(a),renderStudentTable(cachedStudents),alertbox(`Updated class fee for ${e.length} student(s) to ${n}.`,"success"),closeModal("bulkPriceModal")}catch(e){alertbox("Failed to update prices: "+e.message,"error")}finally{db.goOffline()}}}}function closeModal(e){document.getElementById(e).style.display="none"}async function openIdCardModalByKey(t,e){const n=cachedStudents.find(e=>(e.id||e.key)===t);if(n){var a=e?e.innerHTML:"";e&&(e.disabled=!0,e.innerHTML=`
    <svg class="loading-icon" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9"></circle>
    </svg>
`);try{var s=await getSetting();const p=MODULE_FIELD_MAPS.students;document.getElementById("cardSchoolFront").innerText=s.schoolName||"SCHOOL",document.getElementById("cardPhoto").src=n.photoUrl?getFullCloudinaryUrl(n.photoUrl)+"?c":"img/user.svg",document.getElementById("cardName").innerText=n.name||"";var l=s.frontFields||["i","b","h"],o=s.backFields||["e","f","d","g"],d=s.sideType||"double",c=document.getElementById("backCard"),r=document.getElementById("qrcode"),i=document.getElementById("frontCardBody"),u=document.querySelector(".qr-container"),g=("single"===d?(c&&(c.style.display="none"),r&&i&&i.appendChild(r)):(c&&(c.style.display=""),r&&u&&u.appendChild(r)),i&&"double"===d&&(i.innerHTML=l.map(e=>{var t=p[e];return t?`
          <div class="info-row">
            <span class="label">${formatLabel(t)}:</span>
            <span class="value">${n[t]??n[e]??"-"}</span>
          </div>
        `:""}).join("")),document.getElementById("backCardBody"));g&&(g.innerHTML=o.map(e=>{var t=p[e];return t?`
          <p><strong>${formatLabel(t)}:</strong> <span>${n[t]??n[e]??"-"}</span></p>
        `:""}).join(""));let e="https://digibook.edu.lk/edOS/";var m=`${e=(e="custom"===s.qrType&&s.qrCustomUrl?s.qrCustomUrl.trim():e).endsWith("/")?e.slice(0,-1):e}/student.html?school=${encodeURIComponent(schoolId)}&id=`+encodeURIComponent(t),h=document.getElementById("qrcode");h&&(h.innerHTML="",new QRCode(h,{text:m,width:150,height:150})),document.getElementById("idCardModal").style.display="flex"}catch(e){console.error("Error fetching school details for modal:",e)}finally{e&&(e.disabled=!1,e.innerHTML=a)}document.querySelector(".print-btn").dataset.student=t}}async function confirmDelete(t,e){if(confirm(`Are you sure you want to delete ${e}?`)){e=firebase.auth().currentUser;if(e)try{db.goOnline(),await db.ref(`schools/${schoolId}/students/`+t).set({D:!0,A:firebase.database.ServerValue.TIMESTAMP,B:e.uid}),cachedStudents=cachedStudents.filter(e=>(e.id||e.key)!==t),selectedStudentIds.delete(t),renderStudentTable(cachedStudents)}catch(e){alertbox("Delete failed: "+e.message,"error")}finally{db.goOffline()}else alertbox("Session expired. Please log in again.","error")}}function escapeHtml(e){return String(e||"").replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e])}function populateExamDropdowns(e){const a=getActiveModalSelect("scoreSemesterSelect"),s=getActiveModalSelect("scoreSubjectSelect");a&&s&&(a.innerHTML='<option value="">Select Exam</option>',s.innerHTML='<option value="">Select Subject</option>',e&&e.types&&(Object.entries(e.types).forEach(([e,t])=>{var n=document.createElement("option");n.value=e,n.textContent=t,a.appendChild(n)}),1<a.options.length)&&(a.selectedIndex=1),e)&&e.subjects&&(Object.entries(e.subjects).forEach(([e,t])=>{var n=document.createElement("option");n.value=e,n.textContent=t,s.appendChild(n)}),1<s.options.length)&&(s.selectedIndex=1)}function validateScore(e){var t=parseFloat(e.value);100<t?e.value=100:t<0&&(e.value=0)}initApp(),auth.onAuthStateChanged(e=>{var t=window.location.pathname.endsWith("admin.html");e||!navigator.onLine||t||(window.location.href="admin.html")});
