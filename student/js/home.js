
function getTopicList() {
  var topic_list = {};
  var listItems = document.querySelectorAll('#mcq-list li');

  listItems.forEach(function (li) {
    // Extract the number from "1.json", "2.json", etc.
    var fileName = li.getAttribute('data-file');
    var fileNumber = fileName.replace('.json', '');

    // Map the number to the Sinhala text
    topic_list[fileNumber] = li.textContent.trim();
  });

  return topic_list;
}

var topic_list = getTopicList();

/* =========================
GLOBALS
========================= */

var catid = '';
const popup = document.getElementById('explanation-popup');

let allQuestions = [];
let currentQuestionIndex = 0;
let selectedAnswerIndex = null;
let stats = {};
let currentTopic = null;
let isExam = false;
let studentName;
let examID;
let examCat;
let examClass;
/* =========================
IndexedDB helper
========================= */

const DB_NAME = "examDB";
const DB_VERSION = 1;
const STORE_NAME = "examStats";

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function getExamStats() {
  const db = await openDB();
  return new Promise(resolve => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.get("stats");

    req.onsuccess = () => {
      resolve(req.result || {
        scores: [],
        topics: {}
      });
    };
  });
}
async function saveExamStats(stats) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  tx.objectStore(STORE_NAME).put(stats, "stats");

}




let currentExamTopicResults = {};
let currentExamScore = 0;

/* =========================
NORMAL QUIZ LOAD
========================= */
async function loadQuestions(jsonFilePath) {
  catid = jsonFilePath;
  isExam = false;


  try {
    const response = await fetch(jsonFilePath + '.json');

    // Check if the network request actually succeeded
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    allQuestions = await response.json();
    allQuestions.forEach(item => {
      item.catID = +jsonFilePath;
    });
    // Ensure we actually got an array back
    if (!Array.isArray(allQuestions)) {
      throw new Error("JSON data is not an array");
    }

    shuffleArray(allQuestions);
    currentQuestionIndex = 0;
    showQuestion(allQuestions[currentQuestionIndex]);
    updateStatsDisplay();

  } catch (error) {
    console.error("Detailed Error:", error);

    setTimeout(() => {
      // loadQuestions(jsonFilePath);
    }, 500);

  }
}

/* =========================
SHUFFLE
========================= */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/* =========================
SHOW QUESTION
========================= */
function showQuestion(question) {
  document.getElementById('scores-panel').style.display = 'none';
  document.getElementById('tutes-panel').style.display = 'block';
  document.getElementById('tutes-panel').innerHTML = `<div id="questions-container">
  </div>
  <div id="prvnxt">
    <button id="prev-btn">Previous</button>
    <button id="next-btn">Next</button>
<button id="explain-btn">answer</button>
  </div>`
  const container = document.getElementById('questions-container');
  let optionsHtml = '';
  let x = 0;
  let cc;
  question.options.forEach((option, index) => {
    x++;
    if (index == question.answerIndex) {
      cc = 'cc'
    } else {
      cc = ''
    }
    optionsHtml += `<li data-index="${index}">${x}) ${option}</li>`;
  });

  let html = `
<div class="question-container">
<div class="question">${question.question}</div>
`;

  if (isExam) {
    html += `
<div class="options">
  <ul>${optionsHtml}</ul>
</div>`;
    document.getElementById('explain-btn').style.display = 'none';
  } else {
    html += `
    <div class="disabledoptions">
      <ul>${optionsHtml}</ul>
    </div>`;
    document.getElementById('explain-btn').style.display = 'block';
  }


  html += `</div>`;
  container.innerHTML = html;

  selectedAnswerIndex = null;


  const optionElements = container.querySelectorAll('.options li');
  optionElements.forEach(li => {
    li.addEventListener('click', () => {
      optionElements.forEach(o => o.classList.remove('selected'));
      li.classList.add('selected');
      selectedAnswerIndex = parseInt(li.dataset.index, 10);
      checkAnswer(question);

    });
  });

  document.getElementById('explain-btn').onclick = () => {
    showExplanation(question.explanation, question.question);
  };

  if (window.MathJax && window.MathJax.typesetPromise) {
    if (typeof MathJax.typesetClear === 'function') {
      MathJax.typesetClear([container]);
    }

    MathJax.typesetPromise([container]).catch((err) => {
      console.warn("MathJax typeset failed:", err.message);
    });
  }
}



/* =========================
NAVIGATION
========================= */
function showNextQuestion() {
  if (currentQuestionIndex < allQuestions.length - 18) {
    currentQuestionIndex++;
    showQuestion(allQuestions[currentQuestionIndex]);
  } else {
    if (isExam) finishExam();
    else {
      shuffleArray(allQuestions);
      currentQuestionIndex = 0;
      showQuestion(allQuestions[currentQuestionIndex]);
    }
  }
}

function showPreviousQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    showQuestion(allQuestions[currentQuestionIndex]);
  }
}

/* =========================
EXPLANATION POPUP
========================= */
function showExplanation(explanation, quiz) {
  console.log(explanation)
  document.getElementById('explanation-quiz').innerHTML = quiz;
  document.getElementById('explanation-text').innerHTML =
    '<h4>answer:</h4>' + explanation.replace(/<br\s*\/?>/gi, '<div class="divider"></div>');

  popup.classList.add('show');

  if (window.MathJax) {
    MathJax.typesetClear([popup]);
    MathJax.typesetPromise([popup]);
  }
}

/* =========================
STATS DISPLAY
========================= */
function updateStatsDisplay() {
  const statsBox = document.getElementById('stats-box');
  if (!statsBox) return;
  const s = stats[currentTopic] || { correct: 0, wrong: 0 };
  statsBox.innerHTML = `✅ Correct: ${s.correct} | ❌ Wrong: ${s.wrong}`;
}

/* =========================
LIVE EXAM LOAD
========================= */
async function loadLiveExamQuestions() {
  isExam = true;
  currentExamTopicResults = {};
  currentExamScore = 0;

  const promises = [];

  Object.keys(topic_list).forEach(topicId => {
    const file = `${topicId}.json`;

    promises.push(
      fetch(file)
        .then(r => r.ok ? r.json() : [])
        .then(arr => {
          if (!Array.isArray(arr) || arr.length === 0) return null;

          const q = arr[Math.floor(Math.random() * arr.length)];
          q._topic = topicId.toString();
          q.catID = +topicId;
          return q;
        })
        .catch(err => {
          console.warn(`Failed to load ${file}`, err);
          return null;
        })
    );
  });

  const results = await Promise.all(promises);
  allQuestions = results.filter(Boolean);

  if (!allQuestions.length) {
    document.getElementById('questions-container').innerHTML =
      '<p style="color:red;">No exam questions available</p>';
    return;
  }

  shuffleArray(allQuestions);
  currentQuestionIndex = 0;

  showQuestion(allQuestions[0]);
}


/* =========================
ANSWER CHECK
========================= */
function checkAnswer(question) {
  console.log(question)
  if (selectedAnswerIndex === null) return;
  const correct = selectedAnswerIndex === question.answerIndex;
  if (isExam && question._topic) {
    //random exam
    //  currentExamTopicResults[question._topic] = correct ? 1 : 0;
    //category wise 
    currentExamTopicResults[question.id] = correct ? 1 : 0;
  }

}

/* =========================
FINISH EXAM
========================= */
async function finishExam() {
  let score = 0;

  Object.values(currentExamTopicResults).forEach(val => {
    if (val === 1) score++;
  });

  const examStats = await getExamStats();

  // save score
  /*
  examStats.scores.push(score);
  if (examStats.scores.length > 10) {
    examStats.scores.shift();
  }
*/

  // save topic-wise results for random quiz exam
  /*
  Object.entries(currentExamTopicResults).forEach(([topic, val]) => {
    if (!examStats.topics[topic]) {
      examStats.topics[topic] = [];
    }

    examStats.topics[topic].push(val);

    if (examStats.topics[topic].length > 10) {
      examStats.topics[topic].shift();
    }
  });*/
  //meka ain karanna random waladi
  if (!examStats.topics[examClass]) {
    examStats.topics[examClass] = {};
  }
  console.log(examClass)
  examStats.topics[examClass][examCat] = score;

  await saveExamStats(examStats);
  // renderScoreCharts();
  showFinalScorePopup(score);
}



/* =========================
FINAL SCORE POPUP
========================= */
async function showFinalScorePopup(score) {
  const total = Object.keys(currentExamTopicResults).length;
  const percent = ((score / total) * 100).toFixed(1);


  try {
    const scoreRef = ref(db, 'liveExams/' + examID + '/scores/' + studentName);

    await set(scoreRef, score);
    console.log("Score saved successfully");

  } catch (error) {
    console.error("Error saving score:", error);
  }


  document.getElementById('explanation-quiz').innerHTML = "📊 Exam Result";
  document.getElementById('explanation-text').innerHTML = `
<p><b>Score:</b> ${score} / ${total} (${percent}%)</p>
`;
  /*
  let weak = '';
  Object.entries(currentExamTopicResults).forEach(([t, v]) => {
    if (v === 0) weak += `<li>Topic ${t}</li>`;
  });
  `<h4>Weak Topics</h4>
  <ul>${weak || '<li>None 🎉</li>'}</ul>
  <button class="start-exam-btn" onclick="closePopup()">Close</button>
  `
  */
  popup.classList.add('show');

}

/* =========================
LIVE EXAM CONFIRM POPUP
========================= */
async function showLiveExamPopup() {
  document.getElementById('explanation-quiz').innerHTML = "";
  document.getElementById('explanation-text').innerHTML = `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; border: 2px solid #4A90E2; border-radius: 10px; padding: 20px; max-width: 400px; ">
<ul style="list-style-type: none; padding: 0; line-height: 1.8;">
  <li>📝 This is an exam consisting of 20 short questions</li>  
  <li>⏱️ Be mindful of your time managemen</li>
  <li>⚠️ Stay on this screen until you finish the exam</li>
  <li>✅ At the end, the teacher will see your name and scores in their app</li>
  </ul><div id="studentData">
 <input id="studentName" placeholder="Your Name">
 <input id="examID"  placeholder="exam ID">
 <button class="start-exam-btn" id="startBtn" onclick="startExam()" 
style="background: linear-gradient(112deg, #009688, #009688, #43A047);
padding: 10px;
border: none;
border-radius: 5px;
color: #fff;cursor:pointer"
>Start</button>
</div>
</div>
`;
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);

  const nameReq = store.get("studentName");

  nameReq.onsuccess = () => {
    if (nameReq.result) {
      document.getElementById("studentName").value = nameReq.result;
    }
  };
  popup.classList.add('show');
}

/* =========================
MENU / UI (UNCHANGED)
========================= */
function closePopup() {
  popup.classList.remove('show');
}
document.getElementById('topic-list').classList.toggle('open');

document.getElementById('menu-toggle').addEventListener('click', () => {
  document.getElementById('topic-list').classList.toggle('open');
});

const menuToggle = document.getElementById('menu-toggle');
const topicList = document.getElementById('topic-list');

document.addEventListener('click', (e) => {
  if (menuToggle.contains(e.target)) return;
  if (topicList.contains(e.target)) return;
  topicList.classList.remove('open');
});

topicList.addEventListener('click', (e) => {
  if (e.target.closest('#topic-list ul ul li') || e.target.closest('#mcq-list li')) {
    topicList.classList.remove('open');
  }
  if (!e.target.closest('#topic-list li')?.querySelector(':scope > ul')) {
    topicList.classList.remove('open');
  }
});

document.getElementById('mcq-list').addEventListener('click', (e) => {
  if (e.target.tagName === 'LI') {
    document.getElementById('mcq-list').classList.remove('open');
    popup.classList.remove('show');
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const firstTopic = document.querySelector('#mcq-list li[data-file]');
  const keys = Object.keys(topic_list);
  let randcat = keys[Math.floor(Math.random() * keys.length)];

  /* if (firstTopic) loadQuestions(randcat);
 
   document.querySelectorAll("li").forEach(li => {
     li.classList.remove("active");
   });
 
   // Select the matching li using data-file
   const activeLi = document.querySelector(
     `li[data-file="${randcat}.json"]`
   );
 
   if (activeLi) {
     activeLi.classList.add("active");
   }
 */
  var topicList = document.getElementById('mcq-list');

  topicList.addEventListener('click', event => {
    const li = event.target.closest('li');

    if (!li || li.parentElement !== topicList) return;

    topicList.querySelectorAll('li').forEach(item => {
      item.classList.remove('active');
    });

    li.classList.add('active');

    const file = li.dataset.file.split('.')[0];
    loadQuestions(file);
  });

  document.addEventListener("click", (e) => {
    if (e.target.id === "next-btn") {
      showNextQuestion();
    }

    if (e.target.id === "prev-btn") {
      showPreviousQuestion();
    }
  });

  document.addEventListener('click', e => {
    const el = e.target.closest('.live_test');
    if (!el) return;
    e.preventDefault();
    showLiveExamPopup();
  });

});
document.addEventListener("DOMContentLoaded", () => {
  const parentItems = document.querySelectorAll("#topic-list > li");

  parentItems.forEach(li => {
    const childUl = li.querySelector(":scope > ul");
    if (!childUl) return;
    li.addEventListener("click", (e) => {
      if (e.target.closest("ul") !== li.querySelector(":scope > ul")) {
        e.stopPropagation();
        li.classList.toggle("open");
      }
    });
  });
});
document.getElementById("scores").addEventListener("click", (event) => {
  // Find the closest 'li' that has a 'data-id' attribute
  const targetLi = event.target.closest("li[data-id]");

  // If a child li with a data-id was clicked
  if (targetLi) {
    const scoreId = targetLi.getAttribute("data-id");
    
    // Pass the data-id to your function
    renderScoreCharts(scoreId);
  }
});
let examChart = null;
let topicChart = null;

async function renderScoreCharts(scoreId) {
  document.getElementById('scores-panel').style.display = 'block';
  document.getElementById('tutes-panel').style.display = 'none';
  const examStats = await getExamStats();

  if (!examStats) return;

  //renderExamLineChart(document.getElementById("examChartWrapper"),examStats.scores);

  renderTopicBarChart(
    document.getElementById("topicChartWrapper"),
    examStats.topics[scoreId]
  );

}

function renderExamLineChart(wrapperEl, scores) {
  const canvas = wrapperEl.querySelector("canvas");
  const emptyState = wrapperEl.querySelector(".chart-empty");
  const ctx = canvas.getContext("2d");

  if (!Array.isArray(scores) || scores.length === 0) {
    emptyState.style.display = "flex";
    canvas.style.display = "none";

    if (examChart) {
      examChart.destroy();
      examChart = null;
    }
    return;
  }

  emptyState.style.display = "none";
  canvas.style.display = "block";

  // ✅ DEFINE labels once
  const labels = scores.map((_, i) => `Exam ${i + 1}`);

  // 🔁 UPDATE EXISTING CHART
  if (examChart) {
    examChart.data.labels = labels;
    examChart.data.datasets[0].data = scores;
    examChart.update();
    return;
  }

  // 🆕 CREATE CHART ONCE
  examChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        data: scores,
        borderWidth: 2,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          min: 0,
          max: 42
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}



function renderTopicBarChart(wrapper, topics) {
  const canvas = document.getElementById("topicChart");
  const ctx = canvas.getContext("2d");
  const emptyState = wrapper.querySelector(".chart-empty");
  console.log(topics)
  if (!topics || Object.keys(topics).length === 0) {
    emptyState.style.display = "flex";
    canvas.style.display = "none";

    if (topicChart) {
      topicChart.destroy();
      topicChart = null;
    }
    return;
  }

  emptyState.style.display = "none";
  canvas.style.display = "block";

  const labels = [];
  const rawValues = [];

  Object.entries(topics).forEach(([topic, results]) => {
    if (topic_list[topic]) {
      const topicName = topic_list[topic];
      labels.push(wrapLabel(topicName, 25));

      rawValues.push(results);

      //get total for random quiz exams
      // rawValues.push(results.reduce((a, b) => a + b, 0));
    }
  });

  // display values (avoid zero-height bars)
  const displayValues = rawValues.map(v => v === 0 ? 0.1 : v);

  const barColors = rawValues.map(v =>
    v === 0 ? "rgba(255, 0, 0, 0.7)" : "rgba(54, 162, 235, 0.8)"
  );

  // dynamic height
  const minHeightPerBar = 55;
  wrapper.style.height = `${labels.length * minHeightPerBar}px`;

  // 🔁 UPDATE EXISTING CHART
  if (topicChart) {
    topicChart.data.labels = labels;
    topicChart.data.datasets[0].data = displayValues;
    topicChart.data.datasets[0].backgroundColor = barColors;
    topicChart.update();
    return;
  }

  // 🆕 CREATE ONCE
  topicChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        data: displayValues,
        backgroundColor: barColors,
        barThickness: 30,
        categoryPercentage: 0.5,
        barPercentage: 0.9
      }]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          beginAtZero: true,
          min: 0,
          max: 20,
          ticks: { autoSkip: false }
        },
        y: {
          ticks: { autoSkip: false }
        }
      },
      plugins: {
        legend: { display: false },
        //  tooltip: { enabled: false }
      }
    }
  });
}


function wrapLabel(text, maxLength = 30) {
  if (text.length <= maxLength) return text;

  const words = text.split(" ");
  let line1 = "";
  let line2 = "";

  for (const word of words) {
    if ((line1 + word).length <= maxLength) {
      line1 += (line1 ? " " : "") + word;
    } else {
      line2 += (line2 ? " " : "") + word;
    }
  }

  return [line1, line2];
}





// 1. Setup a clean way to get the DB instance
const dbPromise = new Promise((resolve, reject) => {
  const request = indexedDB.open("DigiBookDB", 1);

  request.onupgradeneeded = (e) => {
    const db = e.target.result;
    if (!db.objectStoreNames.contains("liveState")) {
      db.createObjectStore("liveState", { keyPath: "file" });
    }
  };

  request.onsuccess = (e) => resolve(e.target.result);
  request.onerror = (e) => reject(e.target.error);
});

// 2. A clean, async save function
async function saveLocalState(file, uid, status) {
  try {
    const db = await dbPromise; // Wait for DB to be ready
    const tx = db.transaction("liveState", "readwrite");
    const store = tx.objectStore("liveState");

    return new Promise((resolve, reject) => {
      const request = store.put({ file, uid, status });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("IndexedDB Save Error:", err);
  }
}

// 3. A clean, async remove function
async function removeLocalState(file) {
  try {
    const db = await dbPromise; // Wait for DB to be ready
    const tx = db.transaction("liveState", "readwrite");
    const store = tx.objectStore("liveState");

    return new Promise((resolve, reject) => {
      // Use the .delete() method with the key (file)
      const request = store.delete(file);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("IndexedDB Remove Error:", err);
  }
}


// 1. Select all list items in the MCQ list
const mcqItems = document.querySelectorAll('#mcq-list li');

mcqItems.forEach(item => {
  // 2. Create the Share button element
  const shareBtn = document.createElement('button');
  shareBtn.innerText = 'Share Live Exam';
  shareBtn.className = 'share-btn'; // Add a class for CSS styling

  // 3. Handle the click event
  shareBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    const fileName = item.getAttribute('data-file');
    // Pass 'this' (the button) to the function

    initiateLiveExam(this, fileName);
  });
  // 4. Append the button to the list item
  item.appendChild(shareBtn);
});

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get, set, push } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Your existing config
const firebaseConfig = {
  apiKey: "AIzaSyAbnUDbULQE5NW5uRiu9VU5QqP3reOOQH0",
  authDomain: "stable-synapse-241016.firebaseapp.com",
  databaseURL: "https://stable-synapse-241016-default-rtdb.firebaseio.com",
  projectId: "stable-synapse-241016",
  storageBucket: "stable-synapse-241016.firebasestorage.app",
  messagingSenderId: "311188310788",
  appId: "1:311188310788:web:888512a24236ba39c45e51",
  measurementId: "G-SY83EZT9J1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);


async function liveScores(examID) {
  try {
    const scoresRef = ref(db, 'liveExams/' + examID + '/scores');
    const snapshot = await get(scoresRef);

    const data = snapshot.exists() ? snapshot.val() : {};

    // save to IndexedDB
    await cachedScores(examID, data);

    // render
    renderScores(data);

  } catch (err) {
    console.error("Firebase fetch error:", err);
  }
}

function renderScores(scores) {
  const container = document.getElementById("score-list");

  if (!scores || Object.keys(scores).length === 0) {
    container.innerHTML = "<p>No scores yet</p>";
    return;
  }

  let html = "<ul>";

  for (let name in scores) {
    html += `<li>${name}: ${scores[name]}</li>`;
  }

  html += "</ul>";

  container.innerHTML = html;
}

async function initiateLiveExam(btn, file) {
  const popup = document.getElementById("explanation-popup");
  const textField = document.getElementById("explanation-text");
  document.getElementById("explanation-quiz").innerHTML = ''

  // Check if exam is already running or paused
  if (btn.classList.contains('active') || btn.classList.contains('paused')) {
    const uid = btn.dataset.uid;
    const currentStatus = btn.classList.contains('active') ? "RUNNING" : "PAUSED";

    textField.innerHTML = `
      <div style="text-align:center;">
          <p>Exam <strong>${uid}</strong> is currently ${currentStatus}</p>
          <hr>
    
          <button 
            onclick="updateStatus('${uid}', 'active')" 
            class="control-btn play"
            ${currentStatus === "RUNNING" ? "disabled" : ""}
          >Run</button>
    
          <button 
            onclick="updateStatus('${uid}', 'paused')" 
            class="control-btn pause"
            ${currentStatus === "PAUSED" ? "disabled" : ""}
          >Pause</button>
    
          <button 
            onclick="stopExam('${uid}')" 
            class="control-btn stop">Delete</button>
      </div>
    
      <h5>Scores</h5>
    
      <div id="score-list">
        <div class="loading">
          <span class="spinner"></span>
        </div>
      </div>
    
      <button onclick="refreshScores('${uid}')" class="control-btn refresh">
        Refresh
      </button>
    `;
    popup.classList.add("show");
    cachedScores(uid).then(data => {
      if (data) {
        renderScores(data);
      } else {
        liveScores(uid);
      }
    });
    return;
  }
  btn.innerHTML = `<i class="spinner"></i> Sharing...`;
  // --- NEW EXAM LOGIC ---
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let uniqueID = '';
  for (let i = 0; i < 5; i++) {
    uniqueID += chars.charAt(Math.floor(Math.random() * chars.length));
  }


  const categoryNumber = file.replace('.json', '');

  try {
    const examRef = ref(db, 'liveExams/' + uniqueID);
    await set(examRef, {
      category: categoryNumber,
      status: "active",
      timestamp: Date.now()
    });

    // Update button state
    btn.classList.add('active');
    btn.dataset.uid = uniqueID;
    btn.innerText = "Manage Exam";
    await saveLocalState(file, uniqueID, "active");

    textField.innerHTML = `
          <div style="text-align:center;">
              <h3 style="color:#4CAF50;">Exam Started!</h3>
              <p>Share this ID:</p>
<div style="font-size: 28px; font-weight: bold; margin: 10px;">${uniqueID}</div>
<p>with your students. They can access the exam using this ID.</p>
<p>The teacher can then view each student's scores.</p>
          </div>
      `;
    popup.classList.add("show");

  } catch (e) { alertbox("Error starting exam"); }
}

async function cachedScores(examID, newData = null) {
  const db = await openDB();
  const key = "scores_" + examID;

  return new Promise(resolve => {
    const tx = db.transaction(STORE_NAME, newData ? "readwrite" : "readonly");
    const store = tx.objectStore(STORE_NAME);

    // Save mode
    if (newData) {
      store.put(newData, key);
      resolve(newData);
      return;
    }

    // Get mode
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => resolve(null);
  });
}
window.refreshScores = async (examID) => {

  const container = document.getElementById("score-list");

  // optional loading state
  container.innerHTML = '<div class="loading"><span class="spinner"></span></div>';

  try {
    const scoresRef = ref(db, 'liveExams/' + examID + '/scores');
    const snapshot = await get(scoresRef);

    const data = snapshot.exists() ? snapshot.val() : {};

    // ✅ update cache
    await cachedScores(examID, data);
    console.log(data)
    // ✅ update UI
    renderScores(data);

  } catch (err) {
    console.error("Refresh error:", err);
    container.innerHTML = "<p>Error loading scores</p>";
  }
}


// Change Status (Play/Pause)
window.updateStatus = async (uid, newStatus) => {
  try {
    const examRef = ref(db, `liveExams/${uid}/status`);
    await set(examRef, newStatus);

    // Update the button in the list
    const btn = document.querySelector(`[data-uid="${uid}"]`);
    btn.className = 'share-btn ' + newStatus; // Sets class to 'active' or 'paused'
    const fileName = btn.closest('li').dataset.file;
    await saveLocalState(fileName, uid, newStatus);

    closePopup(); // Close after action
  } catch (e) { console.error(e); }
};

// Stop and Remove
window.stopExam = async (uid) => {
  if (!confirm("Are you sure you want to end this exam?")) return;

  try {
    const examRef = ref(db, 'liveExams/' + uid);
    await set(examRef, null); // Removes the record from Firebase

    // Reset the button
    const btn = document.querySelector(`[data-uid="${uid}"]`);
    btn.classList.remove('active', 'paused');
    btn.removeAttribute('data-uid');
    btn.innerText = "Share";
    const fileName = btn.closest('li').dataset.file;
    await removeLocalState(fileName);


    closePopup();
  } catch (e) { console.error(e); }
};

window.closePopup = function () {
  document.getElementById("explanation-popup").classList.remove("show");
};
window.addEventListener('DOMContentLoaded', async () => {
  const db = await new Promise(res => {
    const req = indexedDB.open("DigiBookDB", 1);
    req.onsuccess = (e) => res(e.target.result);
  });

  const tx = db.transaction("liveState", "readonly");
  const store = tx.objectStore("liveState");
  const request = store.getAll();

  request.onsuccess = () => {
    const savedExams = request.result; // Array of {file, uid, status}

    savedExams.forEach(exam => {
      // Find the <li> that matches the saved filename
      const li = document.querySelector(`li[data-file="${exam.file}"]`);
      if (li) {
        const btn = li.querySelector('.share-btn');
        btn.classList.add(exam.status);
        btn.dataset.uid = exam.uid;
        btn.innerText = "Manage Exam";
      }
    });
  };
});

let wakeLock = null;

async function requestWakeLock() {
  try {
    // Request the screen wake lock
    wakeLock = await navigator.wakeLock.request('screen');

    console.log('Screen Wake Lock is active. Device will not sleep.');

    // If the student switches apps and comes back, we need to re-request it
    wakeLock.addEventListener('release', () => {
      console.log('Wake Lock was released');
    });

  } catch (err) {
    console.error(`${err.name}, ${err.message}`);
  }
}

// 2. Re-request when the app becomes visible again
document.addEventListener('visibilitychange', async () => {
  if (wakeLock !== null && document.visibilityState === 'visible') {
    await requestWakeLock();
  }
});

window.startExam = async () => {
  const btn = document.getElementById("startBtn");


  try {
    const inputField = document.getElementById("examID");
    examID = inputField.value.trim();
    studentName = document.getElementById("studentName").value;

    if (examID == '') {
      alertbox("Please enter an Exam ID.");
      return;
    }

    if (studentName == '') {
      alertbox("Please enter your Name.");
      return;
    }
  // 🔄 show loading
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span> Starting...`;

    const idb = await openDB();
    const tx = idb.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put(studentName, "studentName");

    const examRef = ref(db, 'liveExams/' + examID);
    const snapshot = await get(examRef);

    if (snapshot.exists()) {
      const examData = snapshot.val();

      if (examData.status === "active") {
        closePopup();
        examCat = examData.file.split('/').slice(1).join('/');;

        const liitem = document.querySelector(`li[data-file="${examCat}.json"]`);
        if (liitem) {
          const section = liitem.closest("section");
          examClass = [...section.classList].find(c => c !== "grade");
        }
        loadliveQuestions(examData.category);
        return;
      } else if (examData.status === "paused") {
        alertbox("This exam is currently paused.");
      } else {
        alertbox("Exam ended.");
      }
    } else {
      alertbox("Invalid Exam ID.");
    }

  } catch (error) {
    console.error(error);
    alertbox("Connection error.");
  }

  // 🔁 restore button (only if not redirected)
  btn.disabled = false;
  btn.innerHTML = "Start";
};

window.alertbox = function (message, type = 'success') {
  const overlay = document.getElementById("custom-alert");
  const content = document.querySelector(".alert-content");
  const messageField = document.getElementById("alert-message");
  const iconField = document.getElementById("alert-icon");
  const btn = document.querySelector(".alert-ok-btn");

  // Set Message
  messageField.innerText = message;

  // Reset classes
  content.classList.remove('alert-success', 'alert-error', 'alert-warning');

  // Configure style based on type
  if (type === 'error') {
    content.classList.add('alert-error');
    iconField.innerHTML = '<span style="font-size:40px;">⚠️</span>';
    btn.style.background = "#f44336";
  } else if (type === 'warning') {
    content.classList.add('alert-warning');
    iconField.innerHTML = '<span style="font-size:40px;">⏳</span>';
    btn.style.background = "#ff9800";
  } else {
    content.classList.add('alert-success');
    iconField.innerHTML = '<span style="font-size:40px;">✅</span>';
    btn.style.background = "#4CAF50";
  }

  overlay.style.display = "flex";
};

window.closeAlert = function () {
  document.getElementById("custom-alert").style.display = "none";
};

async function loadliveQuestions(jsonFilePath) {
  catid = jsonFilePath.split('/').slice(1).join('/');;
  isExam = true;

  try {
    const response = await fetch("../"+jsonFilePath + '.json');

    // Check if the network request actually succeeded
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    allQuestions = await response.json();
    allQuestions.forEach(item => {
      item.catID = +catid;
      item._topic = catid.toString();
    });
    // Ensure we actually got an array back
    if (!Array.isArray(allQuestions)) {
      throw new Error("JSON data is not an array");
    }

     shuffleArray(allQuestions);
    currentQuestionIndex = 0;
    showQuestion(allQuestions[currentQuestionIndex]);
    updateStatsDisplay();

  } catch (error) {
    console.error("Detailed Error:", error);

    setTimeout(() => {
      // loadQuestions(jsonFilePath);
    }, 500);

  }
}

/*

async function loadLiveExamQuestions() {
  isExam = true;
  currentExamTopicResults = {};
  currentExamScore = 0;

  const promises = [];

  Object.keys(topic_list).forEach(topicId => {
    const file = `${topicId}.json`;

    promises.push(
      fetch(file)
        .then(r => r.ok ? r.json() : [])
        .then(arr => {
          if (!Array.isArray(arr) || arr.length === 0) return null;

          const q = arr[Math.floor(Math.random() * arr.length)];
          q._topic = topicId.toString();
          q.catID = +topicId;
          return q;
        })
        .catch(err => {
          console.warn(`Failed to load ${file}`, err);
          return null;
        })
    );
  });

  const results = await Promise.all(promises);
  allQuestions = results.filter(Boolean);

  if (!allQuestions.length) {
    document.getElementById('questions-container').innerHTML =
      '<p style="color:red;">No exam questions available</p>';
    return;
  }

  shuffleArray(allQuestions);
  currentQuestionIndex = 0;

  showQuestion(allQuestions[0]);
}*/