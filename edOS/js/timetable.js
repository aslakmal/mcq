let cachedTeachers=[];const multiSelectStates={};let pressTimer=null;async function initApp(){try{await syncEngine.initIndexedDB(),navigator.onLine&&await syncEngine.syncUsers()}catch(e){console.error("Initialization error:",e)}}async function getTimetableContextData(){var e=("function"==typeof getSetting?await getSetting():{})?.exams?.subjects,e=Array.isArray(e)?e:Object.keys(e||{}),t="undefined"!=typeof syncEngine?await syncEngine.getLocalUsersByRole("teacher"):[];const n=document.getElementById("daySelect").value,i=document.getElementById("classInput").value.trim().toUpperCase();t=t.map(e=>{var t=e.id||e.uid,s=e.fullName||e.name||t,a=e.photoUrl||"img/user.svg";let i=[];return e.timetable&&e.timetable[n]&&Object.entries(e.timetable[n]).forEach(([e,t])=>{e=parseInt(e,10);!isNaN(e)&&0<e&&null!==t&&"object"==typeof t&&i.push(e)}),i.sort((e,t)=>e-t),{id:t,fullName:s,photoUrl:a,dailyLoad:i.join(", ")||"0",subjects:e.subjects||e.subject||"",timetable:e.timetable||{}}});const c={};return t.forEach(e=>{for(const s in e.timetable)for(const a in e.timetable[s]){var t=e.timetable[s][a];t&&String(t.c).trim().toUpperCase()===i&&t.s&&(c[t.s]=(c[t.s]||0)+1)}}),{subjectList:e,teachersArray:t,subjectWorkloadMap:c,selectedDay:n,selectedClass:i}}async function loadTimetableInterface(){let{subjectList:e,teachersArray:o,subjectWorkloadMap:a,selectedDay:l,selectedClass:r}=await getTimetableContextData();var t=parseInt(document.getElementById("totalPeriods").value)||8,s=document.getElementById("timetableGrid");s.innerHTML="";const i={};o.forEach(e=>{if(e.timetable&&e.timetable[l])for(const a in e.timetable[l]){var t,s=parseInt(a,10);isNaN(s)||s<=0||(t=e.timetable[l][a])&&"object"==typeof t&&t.c&&String(t.c).trim().toUpperCase()===r&&(i[s]||(i[s]=[]),i[s].push({teacherId:e.id,subject:t.s}))}});for(let c=1;c<=t;c++){var d=i[c]&&0<i[c].length?i[c]:[{teacherId:"",subject:""}],p=[...new Set(d.map(e=>e.subject).filter(Boolean))],d=d.map(e=>e.teacherId);multiSelectStates[c]={active:1<p.length,subjects:0<p.length?p:[""],teachers:0<d.length?d:[""]};const m=multiSelectStates[c];var p=document.createElement("div"),d=(p.className="period-box",p.id="period-box-"+c,p.style.animationDelay=70*(c-1)+"ms",1===m.subjects.length&&m.subjects[0]?m.subjects[0]:1<m.subjects.length?m.subjects.length+" Subjects Selected":"-- Select Subject --"),u=m.active?"multi-select-active border-primary":"";let n=`
            <h4>Period ${c}</h4>
            
            <div class="slot-group">
                <label>Subject</label>
                <div class="custom-dropdown ${u}" id="subject-dropdown-${c}">
                    <div class="dropdown-selected" onclick="toggleDropdown('subject_${c}', 0)">
                        <span id="subject-selected-text-${c}">${d}</span>
                        <span>▼</span>
                    </div>
                    <div class="dropdown-options" id="subject_${c}-options-0" style="display:none;">
                        <div class="dropdown-option" onclick="selectSubjectOption(${c}, '')">
                            <div class="option-info"><span class="option-title">-- None --</span></div>
                        </div>
                        ${e.map(e=>{var t=a[e]||0,s=m.subjects.includes(e);return`
                                <div class="dropdown-option" 
                                     onmousedown="startLongPress(${c}, event)" 
                                     onmouseup="cancelLongPress()" 
                                     ontouchstart="startLongPress(${c}, event)" 
                                     ontouchend="cancelLongPress()" 
                                     onclick="selectSubjectOption(${c}, '${e}')">
                                    <div class="option-infoS">
                                    ${m.active?`<input type="checkbox" ${s?"checked":""} style="pointer-events: none;" />`:""}
                                    <div>
                                            <span class="option-title">${e}</span>
                                            <span class="option-sub">${t} periods learning(week)</span>
                                        </div>
                                    </div>
                                </div>
                            `}).join("")}
                    </div>
                </div>
            </div>

            <div id="teacher-slots-container-${c}">
        `;m.subjects.forEach((e,t)=>{const s=m.teachers[t]||"";var a=o.find(e=>e.id===s),i=a?a.fullName:"-- Select Teacher --",a=a?a.photoUrl:"img/user.svg";n+=`
                <div class="slot-row-item" data-sub-index="${t}" style="margin-top: 8px; padding-top: 8px;">
                    <label>Teacher ${m.active?"for "+(e||"Selection "+(t+1)):""}</label>
                    <div class="custom-dropdown" id="teacher-dropdown-${c}-${t}" data-selected-id="${s}">
                        <div class="dropdown-selected" onclick="toggleDropdown('teacher_${c}', ${t})">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <img id="teacher-selected-img-${c}-${t}" src="${a}" alt="">
                                <span id="teacher-selected-text-${c}-${t}">${i}</span>
                            </div>
                            <span>▼</span>
                        </div>
                        <div class="dropdown-options" id="teacher_${c}-options-${t}" style="display:none;">
                            <div class="dropdown-option" onclick="selectTeacher(${c}, ${t}, '', '-- Select Teacher--', 'img/user.svg')">
                                <div class="option-info"><span class="option-title">-- None --</span></div>
                            </div>
                            ${renderTeacherOptionsMarkup(o,l,c,s,r,e,m.teachers,t)}
                        </div>
                    </div>
                </div>
            `}),n+="</div>",p.innerHTML=n,s.appendChild(p)}}function startLongPress(e,t){pressTimer=setTimeout(()=>{toggleMultiSelectMode(e)},600)}function cancelLongPress(){pressTimer&&(clearTimeout(pressTimer),pressTimer=null)}async function toggleMultiSelectMode(e){multiSelectStates[e]||(multiSelectStates[e]={active:!1,subjects:[""],teachers:[""]});var t=multiSelectStates[e];t.active=!t.active,t.active||0<t.subjects.length&&(t.subjects=[t.subjects[0]],t.teachers=[t.teachers[0]||""]),await updateSinglePeriodDOM(e)}async function selectSubjectOption(e,t){multiSelectStates[e]||(multiSelectStates[e]={active:!1,subjects:[""],teachers:[""]});var s,a=multiSelectStates[e];a.active?""===t?(a.subjects=[""],a.teachers=[""]):a.subjects.includes(t)?(s=a.subjects.indexOf(t),a.subjects.splice(s,1),a.teachers.splice(s,1),0===a.subjects.length&&(a.subjects=[""],a.teachers=[""])):(a.subjects=a.subjects.filter(e=>""!==e),a.teachers=a.teachers.filter(e=>""!==e),a.subjects.push(t),a.teachers.push("")):(a.subjects=[t],a.teachers||(a.teachers=[""]),(s=document.getElementById(`subject_${e}-options-0`))&&(s.style.display="none")),await updateSinglePeriodDOM(e)}async function updateSinglePeriodDOM(c){let{subjectList:e,teachersArray:o,subjectWorkloadMap:a,selectedDay:l,selectedClass:r}=await getTimetableContextData();const d=multiSelectStates[c];var t=1===d.subjects.length&&d.subjects[0]?d.subjects[0]:1<d.subjects.length?d.subjects.length+" Subjects Selected":"-- Select Subject --",s=document.getElementById("subject-selected-text-"+c),s=(s&&(s.innerText=t),document.getElementById("subject-dropdown-"+c)),t=(s&&(d.active?s.classList.add("multi-select-active","border-primary"):s.classList.remove("multi-select-active","border-primary")),document.getElementById(`subject_${c}-options-0`)),s=(t&&(t.innerHTML=`
            <div class="dropdown-option" onclick="selectSubjectOption(${c}, '')">
                <div class="option-info"><span class="option-title">-- None --</span></div>
            </div>
            ${e.map(e=>{var t=a[e]||0,s=d.subjects.includes(e);return`
                    <div class="dropdown-option" 
                         onmousedown="startLongPress(${c}, event)" 
                         onmouseup="cancelLongPress()" 
                         ontouchstart="startLongPress(${c}, event)" 
                         ontouchend="cancelLongPress()" 
                         onclick="selectSubjectOption(${c}, '${e}')">
                        <div class="option-infoS">
                        ${d.active?`<input type="checkbox" ${s?"checked":""} style="pointer-events: none;" />`:""}
                        <div>
                                <span class="option-title">${e}</span>
                                <span class="option-sub">${t} periods learning(week)</span>
                            </div>
                        </div>
                    </div>
                `}).join("")}
        `),document.getElementById("teacher-slots-container-"+c));if(s){let n="";d.subjects.forEach((e,t)=>{const s=d.teachers[t]||"";var a=o.find(e=>e.id===s),i=a?a.fullName:"-- Select Teacher --",a=a?a.photoUrl:"img/user.svg";n+=`
            <div class="slot-row-item" data-sub-index="${t}" style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed #e0e0e0;">
                <label>Teacher ${d.active?"for "+(e||"Selection "+(t+1)):""}</label>
                <div class="custom-dropdown" id="teacher-dropdown-${c}-${t}" data-selected-id="${s}">
                    <div class="dropdown-selected" onclick="toggleDropdown('teacher_${c}', ${t})">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <img id="teacher-selected-img-${c}-${t}" src="${a}" alt="">
                            <span id="teacher-selected-text-${c}-${t}">${i}</span>
                        </div>
                        <span>▼</span>
                    </div>
                    <div class="dropdown-options" id="teacher_${c}-options-${t}" style="display:none;">
                        <div class="dropdown-option" onclick="selectTeacher(${c}, ${t}, '', '-- Select Teacher--', 'img/user.svg')">
                            <div class="option-infoT"><span class="option-title">-- None --</span></div>
                        </div>
                        ${renderTeacherOptionsMarkup(o,l,c,s,r,e,d.teachers,t)}
                    </div>
                </div>
            </div>
        `}),s.innerHTML=n}}function renderTeacherOptionsMarkup(e,s,a,i,n,t,c=[],o=0){const l=new Set,r=(e.forEach(e=>{var t;e.timetable[s]&&e.timetable[s][a]&&(t=e.timetable[s][a]).c&&String(t.c).trim().toUpperCase()!==n&&l.add(e.id)}),c.forEach((e,t)=>{e&&t!==o&&l.add(e)}),t&&!t.startsWith("--")?t.trim().toLowerCase():"");return[...e].sort((e,t)=>{return r?(e=(e.subjects||e.subject||"").split(",").map(e=>e.trim().toLowerCase()),t=(t.subjects||t.subject||"").split(",").map(e=>e.trim().toLowerCase()),e=e.includes(r),t=t.includes(r),e&&!t?-1:!e&&t?1:0):0}).map(e=>{var t=l.has(e.id),s=e.id===i;return t&&!s?"":(t=r&&(e.subjects||e.subject||"").toLowerCase().includes(r)?" ⭐":"",`
            <div class="dropdown-option" data-teacher-id="${e.id}" onclick="selectTeacher(${a}, this.closest('.slot-row-item').getAttribute('data-sub-index'), '${e.id}', '${e.fullName.replace(/'/g,"\\'")}', '${e.photoUrl}')">
                <img src="${e.photoUrl}" alt="">
                <div class="option-infoT">
                    <span class="option-title">${e.fullName}${t}</span>
                    <span class="option-sub">${e.dailyLoad} period(s) teaching(today)</span>
                </div>
            </div>
        `)}).join("")}function toggleDropdown(e,t){const s=e+"-options-"+t;document.querySelectorAll(".dropdown-options").forEach(e=>{e.id!==s&&(e.style.display="none")});e=document.getElementById(s);e&&(e.style.display="block"===e.style.display?"none":"block")}async function selectTeacher(e,t,s,a,i){multiSelectStates[e]||(multiSelectStates[e]={active:!1,subjects:[""],teachers:[""]}),multiSelectStates[e].teachers[t]=s,document.getElementById(`teacher-selected-text-${e}-`+t).innerText=a,document.getElementById(`teacher-selected-img-${e}-`+t).src=i,document.getElementById(`teacher-dropdown-${e}-`+t).setAttribute("data-selected-id",s);a=document.getElementById(`teacher_${e}-options-`+t);a&&(a.style.display="none"),await updateSinglePeriodDOM(e)}async function saveCompleteTimetable(){const o=document.getElementById("daySelect").value,l=document.getElementById("classInput").value.trim().toUpperCase();var e=parseInt(document.getElementById("totalPeriods").value)||8;const r={};for(let s=1;s<=e;s++){const a=multiSelectStates[s]||{subjects:[""],teachers:[""]};a.subjects.forEach((e,t)=>{e&&!e.startsWith("--")&&(t=a.teachers&&a.teachers[t]?a.teachers[t]:"")&&(r[t]||(r[t]={}),r[t][s]={c:l,s:e})})}let d="";if("undefined"!=typeof firebase&&firebase.auth&&firebase.auth().currentUser?d=await firebase.auth().currentUser.getIdToken():window.firebaseAuthToken&&(d=window.firebaseAuthToken),d){const p="undefined"!=typeof firebaseConfig?firebaseConfig.databaseURL:"";if(p)try{var t=("undefined"!=typeof syncEngine?await syncEngine.getLocalUsersByRole("teacher"):[]).map(async e=>{var t=e.id||e.uid,e=e.timetable?JSON.parse(JSON.stringify(e.timetable)):{},s=e[o]?{...e[o]}:{};for(const c in s)s[c]&&String(s[c].c).trim().toUpperCase()===l&&delete s[c];if(r[t])for(var[a,i]of Object.entries(r[t]))s[a]=i;0===Object.keys(s).length?delete e[o]:e[o]=s;var n=`${p}/schools/${schoolId}/users/${t}.json?auth=`+d;if(!(await fetch(n,{method:"PATCH",body:JSON.stringify({timetable:e,A:{".sv":"timestamp"}})})).ok)throw new Error("Failed to save for teacher "+t)});await Promise.all(t),"undefined"!=typeof syncEngine&&syncEngine.syncUsers&&await syncEngine.syncUsers(),alertbox("Timetable successfully saved!","success"),loadTimetableInterface()}catch(e){console.error("Error saving timetable:",e),alertbox("Failed to save timetable: "+e,"error")}else alertbox("Database URL is not configured.","error")}else alertbox("Authentication error: You must be logged in to save the timetable.","error")}initApp(),window.onclick=function(e){e.target.closest(".custom-dropdown")||document.querySelectorAll(".dropdown-options").forEach(e=>{e.style.display="none"})};
