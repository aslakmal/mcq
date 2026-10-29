let cachedTeachers = [];
const multiSelectStates = {}; 
let pressTimer = null;
let changed=false;
async function initApp() {
    try {
        await syncEngine.initIndexedDB();
        if (navigator.onLine) {
            await syncEngine.syncUsers();
        }
    } catch (err) {
        console.error("Initialization error:", err);
    }

}
initApp();

// Helper to fetch and normalize teachers and workloads cleanly
async function getTimetableContextData() {
    const schoolData = typeof getSetting === 'function' ? await getSetting() : {};
    const subjectListSource = schoolData?.exams?.subjects;
    const subjectList = Array.isArray(subjectListSource) ? subjectListSource : Object.keys(subjectListSource || {});

    const rawTeachersCache = typeof syncEngine !== 'undefined' ? await syncEngine.getLocalUsersByRole('teacher') : [];
    const selectedDay = document.getElementById("daySelect").value;
    const selectedClass = document.getElementById("classInput").value.trim().toUpperCase();

    const teachersArray = rawTeachersCache.map(teacher => {
        const teacherId = teacher.id || teacher.uid;
        const fullName = teacher.fullName || teacher.name || teacherId;
        const photoUrl = teacher.photoUrl || "img/user.svg";

        let assignedPeriods = [];
        if (teacher.timetable && teacher.timetable[selectedDay]) {
            Object.entries(teacher.timetable[selectedDay]).forEach(([periodKey, slotData]) => {
                const periodNum = parseInt(periodKey, 10);
                if (!isNaN(periodNum) && periodNum > 0 && slotData !== null && typeof slotData === 'object') {
                    assignedPeriods.push(periodNum);
                }
            });
        }
        assignedPeriods.sort((a, b) => a - b);

        return {
            id: teacherId,
            fullName: fullName,
            photoUrl: photoUrl,
            dailyLoad: assignedPeriods.join(', ') || '0',
            subjects: teacher.subjects || teacher.subject || "",
            timetable: teacher.timetable || {}
        };
    });

    const subjectWorkloadMap = {};
    teachersArray.forEach(teacher => {
        for (const dayKey in teacher.timetable) {
            for (const periodKey in teacher.timetable[dayKey]) {
                const slotData = teacher.timetable[dayKey][periodKey];
                if (slotData && String(slotData.c).trim().toUpperCase() === selectedClass && slotData.s) {
                    subjectWorkloadMap[slotData.s] = (subjectWorkloadMap[slotData.s] || 0) + 1;
                }
            }
        }
    });

    return { subjectList, teachersArray, subjectWorkloadMap, selectedDay, selectedClass };
}

// Main interface loader (Called on page load, Submit button click, and after saving to Firebase)
async function loadTimetableInterface() {
    const { subjectList, teachersArray, subjectWorkloadMap, selectedDay, selectedClass } = await getTimetableContextData();
    const totalPeriodsCount = parseInt(document.getElementById("totalPeriods").value) || 8;
    const gridContainer = document.getElementById("timetableGrid");

    gridContainer.innerHTML = "";

    // Clear or reset multiSelectStates when loading a new class/day to prevent stale cache!
    // (Alternatively, you can clear it completely: Object.keys(multiSelectStates).forEach(k => delete multiSelectStates[k]);)
    
    const currentClassAssignments = {}; 
    teachersArray.forEach(teacher => {
        if (teacher.timetable && teacher.timetable[selectedDay]) {
            for (const periodKey in teacher.timetable[selectedDay]) {
                const periodNum = parseInt(periodKey, 10);
                if (isNaN(periodNum) || periodNum <= 0) continue;

                const slotData = teacher.timetable[selectedDay][periodKey];
                if (slotData && typeof slotData === 'object' && slotData.c) {
                    const slotClassNormalized = String(slotData.c).trim().toUpperCase();
                    if (slotClassNormalized === selectedClass) {
                        if (!currentClassAssignments[periodNum]) {
                            currentClassAssignments[periodNum] = [];
                        }
                        currentClassAssignments[periodNum].push({
                            teacherId: teacher.id,
                            subject: slotData.s
                        });
                    }
                }
            }
        }
    });

    for (let periodIndex = 1; periodIndex <= totalPeriodsCount; periodIndex++) {
        const assignments = (currentClassAssignments[periodIndex] && currentClassAssignments[periodIndex].length > 0) 
            ? currentClassAssignments[periodIndex] 
            : [{ teacherId: "", subject: "" }];

        // Force reset state for this period based on the newly selected class/day assignments
        const initialSubjects = [...new Set(assignments.map(a => a.subject).filter(Boolean))];
        const initialTeachers = assignments.map(a => a.teacherId);
        
        multiSelectStates[periodIndex] = {
            active: initialSubjects.length > 1,
            subjects: initialSubjects.length > 0 ? initialSubjects : [""],
            teachers: initialTeachers.length > 0 ? initialTeachers : [""]
        };

        const state = multiSelectStates[periodIndex];

        const periodBox = document.createElement("div");
        periodBox.className = "period-box";
        periodBox.id = `period-box-${periodIndex}`;
        periodBox.style.animationDelay = `${(periodIndex - 1) * 70}ms`;

        const primarySubjectText = state.subjects.length === 1 && state.subjects[0] ? state.subjects[0] : (state.subjects.length > 1 ? `${state.subjects.length} Subjects Selected` : "-- Select Subject --");
        const multiSelectClass = state.active ? 'multi-select-active border-primary' : '';

        let periodHtml = `
            <h4>Period ${periodIndex}</h4>
            
            <div class="slot-group">
                <label>Subject</label>
                <div class="custom-dropdown ${multiSelectClass}" id="subject-dropdown-${periodIndex}">
                    <div class="dropdown-selected" onclick="toggleDropdown('subject_${periodIndex}', 0)">
                        <span id="subject-selected-text-${periodIndex}">${primarySubjectText}</span>
                        <span>▼</span>
                    </div>
                    <div class="dropdown-options" id="subject_${periodIndex}-options-0" style="display:none;">
                        <div class="dropdown-option" onclick="selectSubjectOption(${periodIndex}, '')">
                            <div class="option-info"><span class="option-title">-- None --</span></div>
                        </div>
                        ${subjectList.map(subjectName => {
                            const weeklyCount = subjectWorkloadMap[subjectName] || 0;
                            const isChecked = state.subjects.includes(subjectName);
                            return `
                                <div class="dropdown-option" 
                                     onmousedown="startLongPress(${periodIndex}, event)" 
                                     onmouseup="cancelLongPress()" 
                                     ontouchstart="startLongPress(${periodIndex}, event)" 
                                     ontouchend="cancelLongPress()" 
                                     onclick="selectSubjectOption(${periodIndex}, '${subjectName}')">
                                    <div class="option-infoS">
                                    ${state.active ? `<input type="checkbox" ${isChecked ? 'checked' : ''} style="pointer-events: none;" />` : ''}
                                    <div>
                                            <span class="option-title">${subjectName}</span>
                                            <span class="option-sub">${weeklyCount} periods learning(week)</span>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>

            <div id="teacher-slots-container-${periodIndex}">
        `;

        state.subjects.forEach((subj, subIndex) => {
            const currentAssignedTeacherId = state.teachers[subIndex] || "";
            const assignedTeacherObj = teachersArray.find(t => t.id === currentAssignedTeacherId);
            const displayTeacherName = assignedTeacherObj ? assignedTeacherObj.fullName : "-- Select Teacher --";
            const displayTeacherAvatar = assignedTeacherObj ? assignedTeacherObj.photoUrl : "img/user.svg";

            periodHtml += `
                <div class="slot-row-item" data-sub-index="${subIndex}" style="margin-top: 8px; padding-top: 8px;">
                    <label>Teacher ${state.active ? `for ${subj || 'Selection ' + (subIndex + 1)}` : ''}</label>
                    <div class="custom-dropdown" id="teacher-dropdown-${periodIndex}-${subIndex}" data-selected-id="${currentAssignedTeacherId}">
                        <div class="dropdown-selected" onclick="toggleDropdown('teacher_${periodIndex}', ${subIndex})">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <img id="teacher-selected-img-${periodIndex}-${subIndex}" src="${displayTeacherAvatar}" alt="">
                                <span id="teacher-selected-text-${periodIndex}-${subIndex}">${displayTeacherName}</span>
                            </div>
                            <span>▼</span>
                        </div>
                        <div class="dropdown-options" id="teacher_${periodIndex}-options-${subIndex}" style="display:none;">
                            <div class="dropdown-option" onclick="selectTeacher(${periodIndex}, ${subIndex}, '', '-- Select Teacher--', 'img/user.svg')">
                                <div class="option-info"><span class="option-title">-- None --</span></div>
                            </div>
                            ${renderTeacherOptionsMarkup(teachersArray, selectedDay, periodIndex, currentAssignedTeacherId, selectedClass, subj, state.teachers, subIndex)}
                        </div>
                    </div>
                </div>
            `;
        });

        periodHtml += `</div>`;
        periodBox.innerHTML = periodHtml;
        gridContainer.appendChild(periodBox);
    }
}

// Long-press handlers
function startLongPress(periodIndex, event) {
    pressTimer = setTimeout(() => {
        toggleMultiSelectMode(periodIndex);
    }, 600);
}

function cancelLongPress() {
    if (pressTimer) {
        clearTimeout(pressTimer);
        pressTimer = null;
    }
}

// Granular toggle for multi-select mode without full grid reload
async function toggleMultiSelectMode(periodIndex) {
    if (!multiSelectStates[periodIndex]) {
        multiSelectStates[periodIndex] = { active: false, subjects: [""], teachers: [""] };
    }
    const state = multiSelectStates[periodIndex];
    state.active = !state.active;
    
    if (state.active) {
    //    alertbox(`Multi-select mode activated for Period ${periodIndex}. Select multiple subjects.`, "info");
    } else {
        if (state.subjects.length > 0) {
            state.subjects = [state.subjects[0]];
            state.teachers = [state.teachers[0] || ""];
        }
    }
    await updateSinglePeriodDOM(periodIndex);
}

// Granular Subject Selection Handler
async function selectSubjectOption(periodIndex, subjectName) {
    if (!multiSelectStates[periodIndex]) {
        multiSelectStates[periodIndex] = { active: false, subjects: [""], teachers: [""] };
    }
    const state = multiSelectStates[periodIndex];
    changed=true;
    if (state.active) {
        if (subjectName === "") {
            state.subjects = [""];
            state.teachers = [""];
        } else {
            if (state.subjects.includes(subjectName)) {
                const idx = state.subjects.indexOf(subjectName);
                state.subjects.splice(idx, 1);
                state.teachers.splice(idx, 1);
                if (state.subjects.length === 0) {
                    state.subjects = [""];
                    state.teachers = [""];
                }
            } else {
                state.subjects = state.subjects.filter(s => s !== "");
                state.teachers = state.teachers.filter(t => t !== "");
                state.subjects.push(subjectName);
                state.teachers.push(""); 
            }
        }
    } else {
        state.subjects = [subjectName];
        if (!state.teachers) state.teachers = [""];
        
        // Collapse options dropdown immediately on single selection
        const targetOptions = document.getElementById(`subject_${periodIndex}-options-0`);
        if (targetOptions) targetOptions.style.display = 'none';
    }

    await updateSinglePeriodDOM(periodIndex);
}

// Granularly updates just the specific period box elements without resetting container animations
async function updateSinglePeriodDOM(periodIndex) {
    const { subjectList, teachersArray, subjectWorkloadMap, selectedDay, selectedClass } = await getTimetableContextData();
    const state = multiSelectStates[periodIndex];

    // 1. Update header label
    const primarySubjectText = state.subjects.length === 1 && state.subjects[0] ? state.subjects[0] : (state.subjects.length > 1 ? `${state.subjects.length} Subjects Selected` : "-- Select Subject --");
    const textSpan = document.getElementById(`subject-selected-text-${periodIndex}`);
    if (textSpan) textSpan.innerText = primarySubjectText;

    // 2. Update multi-select class styling
    const dropdownEl = document.getElementById(`subject-dropdown-${periodIndex}`);
    if (dropdownEl) {
        if (state.active) {
            dropdownEl.classList.add('multi-select-active', 'border-primary');
        } else {
            dropdownEl.classList.remove('multi-select-active', 'border-primary');
        }
    }

    // 3. Update options container and checkboxes
    const optionsContainer = document.getElementById(`subject_${periodIndex}-options-0`);
    if (optionsContainer) {
        optionsContainer.innerHTML = `
            <div class="dropdown-option" onclick="selectSubjectOption(${periodIndex}, '')">
                <div class="option-info"><span class="option-title">-- None --</span></div>
            </div>
            ${subjectList.map(subjectName => {
                const weeklyCount = subjectWorkloadMap[subjectName] || 0;
                const isChecked = state.subjects.includes(subjectName);
                return `
                    <div class="dropdown-option" 
                         onmousedown="startLongPress(${periodIndex}, event)" 
                         onmouseup="cancelLongPress()" 
                         ontouchstart="startLongPress(${periodIndex}, event)" 
                         ontouchend="cancelLongPress()" 
                         onclick="selectSubjectOption(${periodIndex}, '${subjectName}')">
                        <div class="option-infoS">
                        ${state.active ? `<input type="checkbox" ${isChecked ? 'checked' : ''} style="pointer-events: none;" />` : ''}
                        <div>
                                <span class="option-title">${subjectName}</span>
                                <span class="option-sub">${weeklyCount} periods learning(week)</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        `;
    }

    // 4. Update teacher sub-slots container
    const container = document.getElementById(`teacher-slots-container-${periodIndex}`);
    if (!container) return;

    let html = '';
    state.subjects.forEach((subj, subIndex) => {
        const currentAssignedTeacherId = state.teachers[subIndex] || "";
        const assignedTeacherObj = teachersArray.find(t => t.id === currentAssignedTeacherId);
        const displayTeacherName = assignedTeacherObj ? assignedTeacherObj.fullName : "-- Select Teacher --";
        const displayTeacherAvatar = assignedTeacherObj ? assignedTeacherObj.photoUrl : "img/user.svg";

        html += `
            <div class="slot-row-item" data-sub-index="${subIndex}" style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed #e0e0e0;">
                <label>Teacher ${state.active ? `for ${subj || 'Selection ' + (subIndex + 1)}` : ''}</label>
                <div class="custom-dropdown" id="teacher-dropdown-${periodIndex}-${subIndex}" data-selected-id="${currentAssignedTeacherId}">
                    <div class="dropdown-selected" onclick="toggleDropdown('teacher_${periodIndex}', ${subIndex})">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <img id="teacher-selected-img-${periodIndex}-${subIndex}" src="${displayTeacherAvatar}" alt="">
                            <span id="teacher-selected-text-${periodIndex}-${subIndex}">${displayTeacherName}</span>
                        </div>
                        <span>▼</span>
                    </div>
                    <div class="dropdown-options" id="teacher_${periodIndex}-options-${subIndex}" style="display:none;">
                        <div class="dropdown-option" onclick="selectTeacher(${periodIndex}, ${subIndex}, '', '-- Select Teacher--', 'img/user.svg')">
                            <div class="option-infoT"><span class="option-title">-- None --</span></div>
                        </div>
                        ${renderTeacherOptionsMarkup(teachersArray, selectedDay, periodIndex, currentAssignedTeacherId, selectedClass, subj, state.teachers, subIndex)}
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Teacher options markup renderer with cross-subslot busy checking
function renderTeacherOptionsMarkup(teachersArray, dayKey, periodIndex, currentTeacherId, selectedClass, selectedSubject, periodAssignedTeachers = [], currentSubIndex = 0) {
    const busyTeacherIds = new Set();
    
    // Check external classes workload during this period
    teachersArray.forEach(teacher => {
        if (teacher.timetable[dayKey] && teacher.timetable[dayKey][periodIndex]) {
            const slot = teacher.timetable[dayKey][periodIndex];
            if (slot.c && String(slot.c).trim().toUpperCase() !== selectedClass) {
                busyTeacherIds.add(teacher.id);
            }
        }
    });

    // Check local selections in other concurrent sub-slots for this period box
    periodAssignedTeachers.forEach((tId, idx) => {
        if (tId && idx !== currentSubIndex) {
            busyTeacherIds.add(tId);
        }
    });

    const activeSubject = selectedSubject && !selectedSubject.startsWith("--") ? selectedSubject.trim().toLowerCase() : "";

    const sortedTeachers = [...teachersArray].sort((teacherA, teacherB) => {
        if (!activeSubject) return 0;
        const listA = (teacherA.subjects || teacherA.subject || "").split(',').map(s => s.trim().toLowerCase());
        const listB = (teacherB.subjects || teacherB.subject || "").split(',').map(s => s.trim().toLowerCase());
        const isSpecialistA = listA.includes(activeSubject);
        const isSpecialistB = listB.includes(activeSubject);
        if (isSpecialistA && !isSpecialistB) return -1;
        if (!isSpecialistA && isSpecialistB) return 1;
        return 0;
    });

    return sortedTeachers.map(teacher => {
        const isBusy = busyTeacherIds.has(teacher.id);
        const isSelected = teacher.id === currentTeacherId;
        if (isBusy && !isSelected) return '';

        const isSpecialist = activeSubject && (teacher.subjects || teacher.subject || "").toLowerCase().includes(activeSubject);
        const specialistBadge = isSpecialist ? ' ⭐' : '';
        return `
            <div class="dropdown-option" data-teacher-id="${teacher.id}" onclick="selectTeacher(${periodIndex}, this.closest('.slot-row-item').getAttribute('data-sub-index'), '${teacher.id}', '${teacher.fullName.replace(/'/g, "\\'")}', '${teacher.photoUrl}')">
                <img src="${teacher.photoUrl}" alt="">
                <div class="option-infoT">
                    <span class="option-title">${teacher.fullName}${specialistBadge}</span>
                    <span class="option-sub">${teacher.dailyLoad} period(s) teaching(today)</span>
                </div>
            </div>
        `;
    }).join('');
}

function toggleDropdown(type, index) {
    const targetId = `${type}-options-${index}`;
    document.querySelectorAll('.dropdown-options').forEach(element => {
        if (element.id !== targetId) element.style.display = 'none';
    });
    const targetOptions = document.getElementById(targetId);
    if (targetOptions) {
        targetOptions.style.display = targetOptions.style.display === 'block' ? 'none' : 'block';
    }
}

window.onclick = function (event) {
    if (!event.target.closest('.custom-dropdown')) {
        document.querySelectorAll('.dropdown-options').forEach(element => {
            element.style.display = 'none';
        });
    }
}

async function selectTeacher(periodIndex, subIndex, teacherId, teacherName, teacherPhotoUrl) {
    if (!multiSelectStates[periodIndex]) {
        multiSelectStates[periodIndex] = { active: false, subjects: [""], teachers: [""] };
    }
    changed=true;
    // Update state memory
    multiSelectStates[periodIndex].teachers[subIndex] = teacherId;

    document.getElementById(`teacher-selected-text-${periodIndex}-${subIndex}`).innerText = teacherName;
    document.getElementById(`teacher-selected-img-${periodIndex}-${subIndex}`).src = teacherPhotoUrl;
    document.getElementById(`teacher-dropdown-${periodIndex}-${subIndex}`).setAttribute('data-selected-id', teacherId);
    
    const tOpts = document.getElementById(`teacher_${periodIndex}-options-${subIndex}`);
    if (tOpts) tOpts.style.display = 'none';

    // Re-render sub-slots so other dropdowns in this period immediately hide this selected teacher
    await updateSinglePeriodDOM(periodIndex);
}

// Saving Timetable Data to Firebase
async function saveCompleteTimetable() {
    const selectedDay = document.getElementById("daySelect").value;
    const selectedClass = document.getElementById("classInput").value.trim().toUpperCase();
    const totalPeriodsCount = parseInt(document.getElementById("totalPeriods").value) || 8;
if(changed==false){
    alertbox("please make changes before save","warning");
    return;
}
    const teacherNewSchedules = {};

    for (let periodIndex = 1; periodIndex <= totalPeriodsCount; periodIndex++) {
        const state = multiSelectStates[periodIndex] || { subjects: [""], teachers: [""] };
        state.subjects.forEach((subjectText, subIndex) => {
            if (subjectText && !subjectText.startsWith("--")) {
                const teacherId = state.teachers && state.teachers[subIndex] ? state.teachers[subIndex] : "";

                if (teacherId) {
                    if (!teacherNewSchedules[teacherId]) teacherNewSchedules[teacherId] = {};
                    teacherNewSchedules[teacherId][periodIndex] = {
                        c: selectedClass,
                        s: subjectText
                    };
                }
            }
        });
    }

    let authToken = "";
    if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) {
        authToken = await firebase.auth().currentUser.getIdToken();
    } else if (window.firebaseAuthToken) {
        authToken = window.firebaseAuthToken;
    }

    if (!authToken) {
        alertbox("Authentication error: You must be logged in to save the timetable.", "error");
        return;
    }

    const databaseBaseURL = typeof firebaseConfig !== 'undefined' ? firebaseConfig.databaseURL : "";
    if (!databaseBaseURL) {
        alertbox("Database URL is not configured.", "error");
        return;
    }

    try {
        const rawTeachersCache = typeof syncEngine !== 'undefined' ? await syncEngine.getLocalUsersByRole('teacher') : [];

        const savePromises = rawTeachersCache.map(async (teacher) => {
            const teacherId = teacher.id || teacher.uid;
            let teacherTimetable = teacher.timetable ? JSON.parse(JSON.stringify(teacher.timetable)) : {};
            let daySchedule = teacherTimetable[selectedDay] ? { ...teacherTimetable[selectedDay] } : {};

            for (const pKey in daySchedule) {
                if (daySchedule[pKey] && String(daySchedule[pKey].c).trim().toUpperCase() === selectedClass) {
                    delete daySchedule[pKey];
                }
            }

            if (teacherNewSchedules[teacherId]) {
                for (const [pIndex, slotContent] of Object.entries(teacherNewSchedules[teacherId])) {
                    daySchedule[pIndex] = slotContent;
                }
            }

            if (Object.keys(daySchedule).length === 0) {
                delete teacherTimetable[selectedDay];
            } else {
                teacherTimetable[selectedDay] = daySchedule;
            }

            const restUrl = `${databaseBaseURL}/schools/${schoolId}/users/${teacherId}.json?auth=${authToken}`;
            const patchPayload = {
                timetable: teacherTimetable,
                A: { ".sv": "timestamp" }
            };

            const response = await fetch(restUrl, {
                method: 'PATCH',
                body: JSON.stringify(patchPayload)
            });

            if (!response.ok) {
                throw new Error(`Failed to save for teacher ${teacherId}`);
            }
        });

        await Promise.all(savePromises);

        if (typeof syncEngine !== 'undefined' && syncEngine.syncUsers) {
            await syncEngine.syncUsers();
        }

        alertbox("Timetable successfully saved!", "success");
        loadTimetableInterface();

    } catch (error) {
        console.error("Error saving timetable:", error);
        alertbox("Failed to save timetable: " + error, "error");
    }
}