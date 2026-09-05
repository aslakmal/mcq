// Subject Lookup Table (Numeric Key -> Label)
const SUBJECT_MAP = {
    1: "First Language (Sinhala)",
    2: "First Language (Tamil)",
    3: "English Language",
    4: "Mathematics",
    5: "Science",
    6: "History",
    7: "Geography"
  };
  
  let detailsChartInstance = null;
  
  // Custom Chart.js inline label plugin (Disables tooltips & draws values directly)
  const inlineScorePlugin = {
    id: 'inlineScorePlugin',
    afterDatasetsDraw(chart) {
      const { ctx } = chart;
      chart.data.datasets.forEach((dataset, datasetIndex) => {
        const meta = chart.getDatasetMeta(datasetIndex);
        if (meta.hidden) return;
  
        meta.data.forEach((element, index) => {
          const score = dataset.data[index];
          if (score === null || score === undefined) return;
  
          const { x, y } = element;
          const text = String(score);
  
          ctx.save();
          ctx.font = 'bold 11px sans-serif';
          ctx.textBaseline = 'middle';
  
          // Display outside for scores < 10, inside for scores >= 10
          if (score < 10) {
            ctx.fillStyle = '#2d3748';
            ctx.textAlign = 'left';
            ctx.fillText(text, x + 6, y);
          } else {
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'right';
            ctx.fillText(text, x - 8, y);
          }
  
          ctx.restore();
        });
      });
    }
  };
  
  /**
   * Triggered by <button onclick="openDetails('${key}')">
   */
  async function openDetails(studentId) {
    const popup = document.getElementById('detailsPopup');
    if (!popup) {
      console.error("Popup element #detailsPopup not found.");
      return;
    }
  
    // Show modal
    popup.classList.add('active');
  
    try {
      // Read from IndexedDB using the school sync engine instance or direct IDB connection
      const schoolId = window.schoolSyncEngine?.schoolId || localStorage.getItem('currentSchoolId') || 'choola';
      const student = await fetchStudentFromIDB(schoolId, studentId);
  
      if (student) {
        renderPersonalData(student);
        renderExamChart(student.exam || {});
      } else {
        alert("Student record not found in local storage.");
        closeDetails();
      }
    } catch (err) {
      console.error("Error opening student details:", err);
    }
  }
  
  function closeDetails() {
    const popup = document.getElementById('detailsPopup');
    if (popup) {
      popup.classList.remove('active');
    }
  }
  
  // Read student record directly from IndexedDB
  function fetchStudentFromIDB(school, id) {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(`SIS_${school}`);
      req.onsuccess = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('students')) return resolve(null);
        const tx = db.transaction('students', 'readonly');
        const store = tx.objectStore('students');
        const getReq = store.get(id);
        getReq.onsuccess = () => resolve(getReq.result);
        getReq.onerror = () => reject(getReq.error);
      };
      req.onerror = () => reject(req.error);
    });
  }
  
// Helper to convert camelCase keys (e.g., "fullName", "fatherNic") to Title Case ("Full Name", "Father Nic")
function camelToTitle(str) {
    return str
      // Insert a space before capital letters
      .replace(/([A-Z])/g, ' $1')
      // Capitalize the first character
      .replace(/^./, (match) => match.toUpperCase())
      // Clean up specific abbreviations if needed
      .replace(/\bNic\b/gi, 'NIC')
      .replace(/\bNo\b/gi, 'No.');
  }
  
  // Dynamic Personal Data Renderer
  function renderPersonalData(data) {
    const container = document.getElementById('popupGridContainer');
    if (!container) return;
  
    // Fields to explicitly ignore in the info-card grid
    const skipFields = new Set(['photoUrl', 'exam', 'updatedAt', 'updatedBy', 'isDeleted', 'id','key']);
  
    // 1. Handle Profile Photo separately
    const avatarImg = document.getElementById('popupAvatar');
    if (avatarImg) {
      if (data.photoUrl && data.photoUrl.trim() !== '') {
        avatarImg.src = getFullCloudinaryUrl(data.photoUrl);
        avatarImg.style.display = 'block';
      } 
    }
  
    // 2. Clear old dynamic cards
    container.innerHTML = '';
  
    // 3. Dynamically generate cards for all non-empty fields
    Object.keys(data).forEach(key => {
      // Skip internal/ignored keys
      if (skipFields.has(key)) return;
  
      const value = data[key];
  
      // Check for non-empty, non-null values
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        const formattedLabel = camelToTitle(key);
  
        // Construct info-card element
        const cardHtml = `
          <div class="info-card">
            <label>${formattedLabel}</label>
            <span>${value}</span>
          </div>
        `;
        container.insertAdjacentHTML('beforeend', cardHtml);
      }
    });
  }
  
  // Build and render Chart.js horizontal bar graph
  function renderExamChart(examData = {}) {
    const subjectIdsSet = new Set();
  
    ['s1', 's2', 's3'].forEach(semKey => {
      const semesterObj = examData[semKey];
      if (semesterObj && typeof semesterObj === 'object') {
        Object.keys(semesterObj).forEach(subId => {
          subjectIdsSet.add(String(subId));
        });
      }
    });
  
    const subjectList = Array.from(subjectIdsSet);
    const labels = subjectList.map(id => SUBJECT_MAP[id] || `Subject ${id}`);
  
    const getScore = (semKey, subId) => {
      if (!examData || !examData[semKey]) return 0;
      const score = examData[semKey][subId] ?? examData[semKey][Number(subId)];
      return score !== undefined && score !== null ? Number(score) : 0;
    };
  
    const sem1Scores = subjectList.map(id => getScore('s1', id));
    const sem2Scores = subjectList.map(id => getScore('s2', id));
    const sem3Scores = subjectList.map(id => getScore('s3', id));
  
    const ctx = document.getElementById('popupScoresChart').getContext('2d');
  
    if (detailsChartInstance) {
      detailsChartInstance.destroy();
    }
  
    detailsChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Semester 1',
            data: sem1Scores,
            backgroundColor: '#4299e1',
            borderColor: '#3182ce',
            borderWidth: 1
          },
          {
            label: 'Semester 2',
            data: sem2Scores,
            backgroundColor: '#48bb78',
            borderColor: '#38a169',
            borderWidth: 1
          },
          {
            label: 'Semester 3',
            data: sem3Scores,
            backgroundColor: '#ed8936',
            borderColor: '#dd6b20',
            borderWidth: 1
          }
        ]
      },
      plugins: [inlineScorePlugin],
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            beginAtZero: true,
            max: 105,
            title: { display: true, text: 'Marks / Score' }
          },
          y: {
            title: { display: true, text: 'Subjects' }
          }
        },
        plugins: {
          legend: { position: 'top' },
          tooltip: { enabled: false }
        }
      }
    });
  }