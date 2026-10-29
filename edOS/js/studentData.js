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
  async function openDetails(studentId,schoolId,local = true) {
    const popup = document.getElementById('detailsPopup');
    if (!popup) {
      console.error("Popup element #detailsPopup not found.");
      return;
    }
  
    // Show modal
    popup.classList.add('active');
    //popup.style.display = 'flex';
    try {
      if (!schoolId) {
        alertbox("Missing 'school' parameter.", "error");
        return;
      }
    
      let student = null;
  
      if (local) {
        // Read from IndexedDB using the school sync engine instance or direct IDB connection
        student = await fetchStudentFromIDB(schoolId, studentId);
        console.log(JSON.stringify(student.exam, null, 2));
      } else {  
        const path = `schools/${schoolId}/students/${studentId}`;
        const studentRef = db.ref(path);   
        try {
          db.goOnline(); 
          const snapshot = await studentRef.once('value');
          student = snapshot.val();         
          if (student) {
            student.d= await syncEngine.decryptField(student.d)
            student.g= await syncEngine.decryptField(student.g)
            student = syncEngine.unmapFromFirebase('students', student);
          }
        } catch (err) {
          console.error("Error fetching single student from Firebase:", err);
        } finally {
          db.goOffline();
        }
      }
        if (student) {

          renderPersonalData(student);
          renderExamChart(student.exam || {});
        } else {
          alert("Student record not found.");
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
    const skipFields = new Set(['photoUrl', 'exam', 'updatedAt', 'updatedBy', 'isDeleted', 'id','key','isPaid','classFee','paidAt']);
  
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
  
  async function renderExamChart(examData = {}) {
    const subjectIdsSet = new Set();
    const schoolData = await getSetting();
    
    // Safety check for exams types
    const examTypes = schoolData?.exams?.types || {};
    const examSubjects = schoolData?.exams?.subjects || {}; 
    
    // 1. Collect all unique subject IDs across all dynamic exam types
    Object.keys(examTypes).forEach(semKey => {
      const semesterObj = examData[semKey];
      if (semesterObj && typeof semesterObj === 'object') {
        Object.keys(semesterObj).forEach(subId => {
          subjectIdsSet.add(String(subId));
        });
      }
    });
  
    const subjectList = Array.from(subjectIdsSet);
    const labels = subjectList.map(id => examSubjects[id] || `Subject ${id}`);
  
    const getScore = (semKey, subId) => {
      if (!examData || !examData[semKey]) return '';
      const score = examData[semKey][subId] ?? examData[semKey][Number(subId)];
      return score !== undefined && score !== null ? Number(score) : "";
    };
  
    const ctx = document.getElementById('popupScoresChart').getContext('2d');

    // Helper function to create a horizontal linear gradient
    const createGradient = (colorStart, colorEnd) => {
      const gradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
      gradient.addColorStop(0, colorStart);
      gradient.addColorStop(1, colorEnd);
      return gradient;
    };

    // Predefined gradient color pairs (start color -> end color)
    const colorPalette = [
      { start: '#3b82f6', end: '#1d4ed8' },
      { start: '#22c55e', end: '#15803d' },
      { start: '#a855f7', end: '#7e22ce' },
      { start: '#ef4444', end: '#b91c1c' },
      { start: '#14b8a6', end: '#0f766e' },
      { start: '#f97316', end: '#c2410c' },
      { start: '#ec4899', end: '#be185d' },
      { start: '#1e3a8a', end: '#0f172a' },
      { start: '#78716c', end: '#44403c' },
      { start: '#831843', end: '#500724' }
    ];

    // 2. Dynamically build datasets (automatically skipping empty exam types)
    const datasets = [];
    let colorIndex = 0;

    Object.entries(examTypes).forEach(([semKey, semLabel]) => {
      const scores = subjectList.map(id => getScore(semKey, id));
      
      // Check if this exam type has at least one valid score
      const hasScores = scores.some(score => score !== "");
      
      // Skip this exam type if there are no scores recorded
      if (!hasScores) return;

      const palette = colorPalette[colorIndex % colorPalette.length];
      const barGradient = createGradient(palette.start, palette.end);

      datasets.push({
        label: semLabel,
        data: scores,
        backgroundColor: barGradient,
        borderRadius: 5,        // 5px rounded corners
        borderSkipped: false    // Rounds all corners evenly
      });

      colorIndex++;
    });
  
    if (detailsChartInstance) {
      detailsChartInstance.destroy();
    }
  
    detailsChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: datasets
      },
      plugins: [inlineScorePlugin],
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            beginAtZero: true,
            max: 100,
            title: { display: true, text: 'Marks' }
          },
          y: {
            categoryPercentage: 1.0,
            barPercentage: 0.9,
            ticks: {
              autoSkip: false,
              font: {
                size: 11
              },
              callback: function(value, index) {
                let label = this.getLabelForValue(value);
                if (label.length > 6) {
                  let mid = Math.floor(label.length / 2);
                  return [label.substring(0, mid), label.substring(mid)];
                }
                return label;
              }
            },
            grid: {
              display: true,
              drawBorder: false,
              color: 'rgba(200, 200, 200)'
            }
          }
        },
        plugins: {
          legend: { 
            position: 'top',
            labels: {
              boxWidth: 15,
              padding: 15,
              font: {
                size: 12,
                weight: 'bold'
              }
            },
            onHover: (e, legendItem, legend) => {
              legend.chart.canvas.style.cursor = 'pointer';
            },
            onLeave: (e, legendItem, legend) => {
              legend.chart.canvas.style.cursor = 'default';
            }
          },
          tooltip: { 
            enabled: true,
            callbacks: {
              title: (context) => {
                const index = context[0].dataIndex;
                return subjectList.map(id => examSubjects[id] || `Subject ${id}`)[index];
              }
            }
          }
        }
      }
    });
}