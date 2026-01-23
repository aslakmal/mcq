
let skd = '<div style="position: absolute;width: 62px;height: 42px;transform: rotate(329deg);top: -10px;left: 36px;border: 2px solid #d2d2d2;border-radius: 50%;box-sizing: border-box;border-color: #d8d8d8 #d6d6d6 transparent transparent;"></div>' +
  '<div style="position: absolute;width: 98px;height: 71px;transform: rotate(329deg);top: -23px;left: 34px;border: 2px solid black;border-radius: 50%;box-sizing: border-box;border-color: #eaeaea #ffffff transparent transparent"></div>' +
  '<div style="position: absolute;width: 20px;height: 23px;transform: rotate(317deg);top: 35px;left: 67px;border: 2px solid black;border-radius: 50%;box-sizing: border-box;border-color: transparent transparent #ffffff #ffffff"></div>' +
  '<div style="position: absolute;width: 52px;height: 56px;transform: rotate(317deg);top: 17px;left: 67px;border: 2px solid black;border-radius: 50%;box-sizing: border-box;border-color: transparent transparent #ffffff #ffffff"></div>' +
  '<div style="position: absolute;top: -4px;left: 85px;width: 20px;height: 20px;background: #fafafa;color: #000000;text-align: center;line-height: 14px;font-size: 12px;transform: rotate(361deg);clip-path: polygon(50% 100%, 0 0, 100% 0)">1</div>' +
  '<div style="position: absolute;top: -4px;left: 116px;width: 20px;height: 20px;background: #fafafa;color: #000000;text-align: center;line-height: 14px;font-size: 12px;transform: rotate(361deg);clip-path: polygon(50% 100%, 0 0, 100% 0)">2</div>' +
  '<div style="position: absolute;top: 34px;left: 77px;width: 20px;height: 20px;background: #fafafa;color: #000000;text-align: center;line-height: 24px;font-size: 12px;transform: rotate(28deg);clip-path: polygon(50% 0%, 0 100%, 100% 100%)">3</div>' +
  '<div style="position: absolute;top: 36px;left: 109px;width: 20px;height: 20px;background: #fafafa;color: #000000;text-align: center;line-height: 24px;font-size: 12px;transform: rotate(10deg);clip-path: polygon(50% 0%, 0 100%, 100% 100%)">4</div>';
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
//let skd = '';
var catid = '';
const popup = document.getElementById('explanation-popup');

let allQuestions = [];
let currentQuestionIndex = 0;
let selectedAnswerIndex = null;
let stats = {};
let currentTopic = null;
let currentFileNumber = 0;
let isExam = false;

/* =========================
COOKIE HELPERS
========================= */
function setCookie(name, value, days = 365) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))}; expires=${expires}; path=/`;
}

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? JSON.parse(decodeURIComponent(match[2])) : null;
}
/* =========================
IndexedDB helper
========================= */

const DB_NAME = "mathsExamDB";
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
    const response = await fetch(jsonFilePath+'.json');

    // Check if the network request actually succeeded
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    allQuestions = await response.json();
    allQuestions.forEach(item => {
      item.catID = +jsonFilePath.split('.')[0];
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
    console.error("Detailed Error:", error); // This helps you debug in the F12 console
    document.getElementById('questions-container').innerHTML =
      `<p style="color:red;">Error loading questions: ${error.message}</p>
 <button onclick="loadQuestions('${jsonFilePath}')">Retry</button>`;
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
  const container = document.getElementById('questions-container');

  let optionsHtml = '';
  let x = 0;
  question.options.forEach((option, index) => {
    x++;
    if (index == question.answerIndex) {
      cc = 'cc'
    } else {
      cc = ''
    }
    optionsHtml += `<li data-index="${index}" class="${cc}">${x}) ${option}</li>`;
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
    document.getElementById('explain-btn').style.display = 'block';
  }

  html += `</div>`;
  container.innerHTML = html;

  selectedAnswerIndex = null;

  /* graph logic preserved */
  if (question.catID == '35' || question.catID == '36') {
    const parentElement = document.querySelector('.question');
    const newContainer = document.createElement('div');
    newContainer.className = 'graph-container';
    parentElement.appendChild(newContainer);
    createGraphSVG('.graph-container');
    updateGraph(document.querySelector('.question .hidden')?.innerHTML, true);
  }

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

  if (window.MathJax) {
    MathJax.typesetClear();
    MathJax.typesetPromise([container]);
  }
}



/* =========================
NAVIGATION
========================= */
function showNextQuestion() {
  if (currentQuestionIndex < allQuestions.length - 1) {
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
  document.getElementById('explanation-quiz').innerHTML = quiz;
  document.getElementById('explanation-text').innerHTML =
    '<h4>විසඳුම:</h4>' + explanation.replace(/<br\s*\/?>/gi, '<div class="divider"></div>');

  popup.classList.add('show');

  if (window.MathJax) {
    MathJax.typesetClear([popup]);
    MathJax.typesetPromise([popup]);
  }

  if (catid == '11') {
    document.querySelectorAll('#explanation-text .sadk').forEach(el => {
      el.insertAdjacentHTML('beforeend', skd);
    });
  }

  if (catid == '1') {
    const parentElement = document.getElementById('explanation-text');
    const newContainer = document.createElement('div');
    newContainer.className = 'line-container';
    parentElement.appendChild(newContainer);
    visualizeOperation(quiz.replace(/\$\$/g, "").trim(), "line-container");
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
  if (selectedAnswerIndex === null) return;
  const correct = selectedAnswerIndex === question.answerIndex;
  if (isExam && question._topic) {
    currentExamTopicResults[question._topic] = correct ? 1 : 0;
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
  examStats.scores.push(score);
  if (examStats.scores.length > 10) {
    examStats.scores.shift();
  }

  // save topic-wise results
  Object.entries(currentExamTopicResults).forEach(([topic, val]) => {
    if (!examStats.topics[topic]) {
      examStats.topics[topic] = [];
    }

    examStats.topics[topic].push(val);

    if (examStats.topics[topic].length > 10) {
      examStats.topics[topic].shift();
    }
  });

  await saveExamStats(examStats);
  renderScoreCharts();
 // showFinalScorePopup(score);
}



/* =========================
FINAL SCORE POPUP
========================= */
function showFinalScorePopup() {
  const total = Object.keys(currentExamTopicResults).length;
  const percent = ((currentExamScore / total) * 100).toFixed(1);

  let weak = '';
  Object.entries(currentExamTopicResults).forEach(([t, v]) => {
    if (v === 0) weak += `<li>Topic ${t}</li>`;
  });

  document.getElementById('explanation-quiz').innerHTML = "📊 Exam Result";
  document.getElementById('explanation-text').innerHTML = `
<p><b>Score:</b> ${currentExamScore} / ${total}</p>
<p><b>Success:</b> ${percent}%</p>
<h4>Weak Topics</h4>
<ul>${weak || '<li>None 🎉</li>'}</ul>
<button class="start-exam-btn" onclick="closePopup()">Close</button>
`;
  popup.classList.add('show');
}

/* =========================
LIVE EXAM CONFIRM POPUP
========================= */
function showLiveExamPopup() {
  document.getElementById('explanation-quiz').innerHTML = "";
  document.getElementById('explanation-text').innerHTML = `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; border: 2px solid #4A90E2; border-radius: 10px; padding: 20px; max-width: 400px; ">
<ul style="list-style-type: none; padding: 0; line-height: 1.8;">
  <li>📝 මෙය කෙටි ප්‍රශ්න 40ක විභාගයකි</li>  
  <li>✅ ලබා දී ඇති විකල්ප 4න් නිවැරදි පිලිතුර තෝරන්න</li>
  <li>⏱️ කාලය කළමනාකරණය ගැන සැලකිලිමත් වන්න</li>
  <li>🧠 ප්‍රශ්න සියල්ල හොඳින් කියවා අවබෝධ කරගන්න</li>
</ul>
<div style="margin-top: 20px; text-align: center; font-weight: bold; ">
  සාර්ථකව විභාගයට මුහුණ දීමට සුභ පතමු!
</div>
<button class="start-exam-btn" onclick="closePopup();loadLiveExamQuestions()" 
style="background: linear-gradient(112deg, #009688, #009688, #43A047);
padding: 10px;
border: none;
border-radius: 5px;
color: #fff;cursor:pointer"
>ආරම්භ කරන්න</button>
</div>
`;
  popup.classList.add('show');
}

/* =========================
MENU / UI (UNCHANGED)
========================= */
function closePopup() {
  popup.classList.remove('show');
}

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
  if (firstTopic) loadQuestions(firstTopic.dataset.file.split('.')[0]);

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

  document.getElementById('next-btn').onclick = showNextQuestion;
  document.getElementById('prev-btn').onclick = showPreviousQuestion;
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
document.getElementById("scores").addEventListener("click", () => {
  renderScoreCharts();
});
let examChart = null;
let topicChart = null;

async function renderScoreCharts() {
  document.getElementById('scores-panel').style.display = 'block';
  document.getElementById('tutes-panel').style.display = 'none';
  const examStats = await getExamStats();

  if (!examStats) return;

  renderExamLineChart(
    document.getElementById("examChartWrapper"),
    examStats.scores
  );

  renderTopicBarChart(
    document.getElementById("topicChartWrapper"),
    examStats.topics
  );

}
function renderExamLineChart(wrapperEl, scores) {
  const canvas = wrapperEl.querySelector("canvas");
  const emptyState = wrapperEl.querySelector(".chart-empty");
 
  if (!scores || scores.length === 0) {
    emptyState.style.display = "flex";
    if (examChart) examChart.destroy();
    return;
  }

  canvas.style.display = "block";
  emptyState.style.display = "none";

  const ctx = canvas.getContext("2d");
console.log(scores.length)
  if (examChart) {
    examChart.data.labels.length = 0;
    examChart.data.datasets[0].data.length = 0;

    examChart.data.labels.push(...labels);
    examChart.data.datasets[0].data.push(...values);

    examChart.update();
    return;
  }

  examChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: scores.map((_, i) => `Exam ${i + 1}`),
      datasets: [{
        // label: "Exam Score",
        data: scores,
        borderWidth: 2,
        tension: 0.3,
        //  fill: false
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          min: 0,
          max: 42,

        }
      }, plugins: {
        legend: {
          display: false
        }
      }
    }
  });
}
function renderTopicBarChart(wrapper, topics) {
  const canvas = document.getElementById("topicChart");
  const ctx = canvas.getContext("2d");
  //const wrapper = document.getElementById("topicChartWrapper");
  const emptyState = wrapper.querySelector(".chart-empty");

  if (!topics || Object.keys(topics).length === 0) {
    emptyState.style.display = "flex";
    return;
  }

  canvas.style.display = "block";
  emptyState.style.display = "none";
  if (topicChart) topicChart.destroy();

  const labels = [];
  const values = [];

  Object.entries(topics).forEach(([topic, results]) => {
    if (topic_list[topic]) {
      const topicName = topic_list[topic];
      labels.push(wrapLabel(topicName, 25));
      values.push(results.reduce((a, b) => a + b, 0));
    }
  });

  // keep original values
  const rawValues = [...values];

  // replace 0 with 0.2 only for display
  const displayValues = rawValues.map(v => v === 0 ? 0.1 : v);

  // red for zero, blue for others
  const barColors = rawValues.map(v =>
    v === 0 ? "rgba(255, 0, 0, 0.7)" : "rgba(54, 162, 235, 0.8)"
  );


  // ✅ increase vertical space
  const minHeightPerBar = 35;
  wrapper.style.height = `${values.length * minHeightPerBar}px`;
  if (topicChart) {
    topicChart.data.labels = labels;
    topicChart.data.datasets[0].data = values;
    topicChart.update();
    return;
  }
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
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      //type: 'linear',    
      scales: {
        x: {
          beginAtZero: true,
          min: 0,
          max: 10,          // 👈 force full range
          ticks: {
            autoSkip: false // show all labels
          }
        },
        y: {
          ticks: { autoSkip: false }
        }
      }
      ,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
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

