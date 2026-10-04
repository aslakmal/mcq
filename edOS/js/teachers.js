let cachedTeachers=[],currentPage=1,pageSize=50;async function initApp(){try{await syncEngine.initIndexedDB(),navigator.onLine&&(await syncEngine.syncUsers(),await refreshTeacherList())}catch(e){console.error("Initialization error:",e)}}async function refreshTeacherList(){renderTeacherTable(cachedTeachers=await syncEngine.getLocalUsersByRole("teacher"))}function renderTeacherTable(e){var t=document.getElementById("teacherTableBody");const n=document.getElementById("searchInput").value.toLowerCase().trim();var a,c,o,r,e=e.filter(e=>e.fullName&&e.fullName.toLowerCase().includes(n)||e.subject&&e.subject.toLowerCase().includes(n)||e.classes&&e.classes.toLowerCase().includes(n));0===e.length?t.innerHTML=`<tr><td colspan="5" class="empty-state">${n?"No matching teachers found.":"No teachers registered yet."}</td></tr>`:(a=e.length,c=Math.ceil(a/pageSize),o=((currentPage=(currentPage=currentPage>c?c:currentPage)<1?1:currentPage)-1)*pageSize,r=Math.min(o+pageSize,a),e=e.slice(o,r),t.innerHTML=e.map(e=>{var t=e.photoUrl||"img/user.svg",n=e.id||e.key;return`
      <tr>
        <td data-label="Teacher">
          <div class="teacher-info">
            <img src="${t}" class="avatar" alt="${e.fullName}">
            <div>
              <strong>${escapeHtml(e.fullName)}</strong><br>
              <small style="color: #718096;">${escapeHtml(e.qualification||"")}</small>
            </div>
          </div>
        </td>
        <td data-label="Classes"><span class="badge-id">${escapeHtml(e.classes||"N/A")}</span></td>
        <td data-label="Subject">${escapeHtml(e.subject||"N/A")}</td>
        <td data-label="Contact">${escapeHtml(e.contact||"N/A")}</td>
        <td data-label="Actions">
          <div class="actions">
   <!--  <button onclick="openIdCardModalByKey('${n}', this)"
            class="action-btn view"
            title="View ID">
        <svg viewBox="0 0 24 24">
            <rect x="3" y="5" width="18" height="14" rx="2"/>
            <circle cx="8" cy="11" r="2"/>
            <path d="M12 10h6M12 14h4"/>
        </svg>
    </button>-->

    <button onclick="openDetailsModalByKey('${n}','${schoolId}')"
            class="action-btn details"
            title="Details">
        <svg viewBox="0 0 24 24">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/>
            <circle cx="12" cy="12" r="3"/>
        </svg>
    </button>

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
    `}).join(""),renderPagination(a,c,1+o,r))}function renderPagination(e,n,a,c){var o=document.getElementById("paginationInfo"),r=document.getElementById("paginationControls");if(0===e)o.innerText="Showing 0 of 0 students",r.innerHTML="";else{o.innerText=`Showing ${a}-${c} of ${e} students`;let t=`<button class="page-btn" ${1===currentPage?"disabled":""} onclick="goToPage(${currentPage-1})">Prev</button>`;for(let e=1;e<=n;e++)1===e||e===n||e>=currentPage-1&&e<=currentPage+1?t+=`<button class="page-btn ${e===currentPage?"active":""}" onclick="goToPage(${e})">${e}</button>`:e!==currentPage-2&&e!==currentPage+2||(t+='<span style="padding: 0 4px; color: #a0aec0;">...</span>');t+=`<button class="page-btn" ${currentPage===n?"disabled":""} onclick="goToPage(${currentPage+1})">Next</button>`,r.innerHTML=t}}function goToPage(e){currentPage=e,renderTeacherTable(cachedTeachers)}function openIdCardModalByKey(t){var e=cachedTeachers.find(e=>(e.id||e.key)===t);e&&(document.getElementById("cardSchoolFront").innerText=schoolId.toUpperCase(),document.getElementById("cardPhoto").src=e.photoUrl||"img/user.svg",document.getElementById("cardName").innerText=e.fullName||"",document.getElementById("cardSubject").innerText=e.subject||"",document.getElementById("cardTeacherId").innerText=e.teacherId||"",document.getElementById("cardQualification").innerText=e.qualification||"-",document.getElementById("cardContact").innerText=e.contact||"-",document.getElementById("cardDob").innerText=e.dob||"-",document.getElementById("cardAddress").innerText=e.address||"-",e=`${window.location.origin}/sis/${schoolId}/teacher.html?id=`+t,document.getElementById("qrcode").innerHTML="",new QRCode(document.getElementById("qrcode"),{text:e,width:75,height:75}),document.getElementById("idCardModal").style.display="flex")}function closeIdCardModal(){document.getElementById("idCardModal").style.display="none"}function openDetailsModalByKey(t){var e=cachedTeachers.find(e=>(e.id||e.key)===t);e&&(renderPersonalData(e),document.getElementById("detailsModal").style.display="flex")}function renderPersonalData(n){const a=document.getElementById("popupGridContainer");if(a){const c=new Set(["photoUrl","exam","updatedAt","updatedBy","isDeleted","id","key","school"]);var e=document.getElementById("popupAvatar");e&&n.photoUrl&&""!==n.photoUrl.trim()&&(e.src=getFullCloudinaryUrl(n.photoUrl),e.style.display="block"),a.innerHTML="",Object.keys(n).forEach(e=>{var t;c.has(e)||null!=(t=n[e])&&""!==String(t).trim()&&(e=`
          <div class="info-card">
            <label>${camelToTitle(e)}</label>
            <span>${t}</span>
          </div>
        `,a.insertAdjacentHTML("beforeend",e))})}}function camelToTitle(e){return e.replace(/([A-Z])/g," $1").replace(/^./,e=>e.toUpperCase()).replace(/\bNic\b/gi,"NIC").replace(/\bNo\b/gi,"No.")}function closeDetailsModal(){document.getElementById("detailsModal").style.display="none"}async function confirmDelete(t,e){if(confirm(`Are you sure you want to delete ${e}?`))try{db.goOnline();var n=db.ref(`schools/${schoolId}/users/`+t),a=firebase.auth().currentUser;await n.update({D:!0,A:firebase.database.ServerValue.TIMESTAMP,B:a.uid}),alertbox(e+" deleted successfully!","success"),renderTeacherTable(cachedTeachers=cachedTeachers.filter(e=>(e.id||e.key)!==t))}catch(e){console.error("Delete error:",e),alertbox("Delete failed: "+e.message,"error")}finally{db.goOffline()}}function escapeHtml(e){return String(e||"").replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e])}function copyInviteLink(){var e=document.getElementById("inviteLinkInput");const t=document.querySelector(".copy-btn"),n=document.getElementById("copyIcon"),a=document.getElementById("checkIcon"),c=document.getElementById("copyText");navigator.clipboard.writeText(e.value).then(()=>{n.style.display="none",a.style.display="block",c.textContent="Copied!",t.style.background="#16a34a",setTimeout(()=>{n.style.display="block",a.style.display="none",c.textContent="Copy",t.style.background="#2563eb"},2e3)}).catch(e=>{console.error("Failed to copy text: ",e)})}window.addEventListener("idb_updated_users",async()=>{await refreshTeacherList()}),document.getElementById("searchInput").addEventListener("input",()=>{renderTeacherTable(cachedTeachers)}),auth.onAuthStateChanged(e=>{e||(window.location.href="admin.html?school="+schoolId)}),initApp(),document.getElementById("inviteLinkInput").value="https://digibook.edu.lk/edOS/teacher_register.html?school="+schoolId;
