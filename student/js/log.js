function openTab(evt, sectionName) {
    let content = document.getElementsByClassName("content");
    for (let i = 0; i < content.length; i++) content[i].style.display = "none";
    let tablinks = document.getElementsByClassName("tab-btn");
    for (let i = 0; i < tablinks.length; i++) tablinks[i].className = tablinks[i].className.replace(" active", "");
    document.getElementById(sectionName).style.display = "block";
    evt.currentTarget.className += " active";
}

function fmt4(n) { return String(n).padStart(4, '0'); }

function mantissaInt(x) {
    const lg = Math.log10(x);
    const mant = lg - Math.floor(lg);
    return Math.round(mant * 10000);
}

// --- LOGARITHM RENDER ---
function renderLog() {
    const out = document.getElementById('logOutput');
    const v = parseFloat(document.getElementById('logInput').value);
    if (!v || v <= 0) { alert('ධන අංකයක් ඇතුළු කරන්න'); return; }

    const exp = Math.floor(Math.log10(v));
    const mantNum = v / Math.pow(10, exp);
    const digits = mantNum.toFixed(3).replace('.', '');
    const row = parseInt(digits.substring(0, 2));
    const col = parseInt(digits[2]);
    const diffCol = parseInt(digits[3]);

    let mainV = mantissaInt(row / 10 + col / 100);
    let diffV = (diffCol > 0) ? (mantissaInt(row / 10 + col / 100 + diffCol / 1000) - mainV) : 0;

    let html = `<h5>1.පූර්ණාංශය සෙවීම</h5><p>විද්‍යාත්මක ආකාරය: ${v} = ${mantNum.toFixed(3)} × 10<sup>${exp}</sup></p>`;
    html += `<pre>මෙතන දහයේ බලය(${exp}) තමයි ලඝු අංකයේ පූර්ණාංශය.</pre>`
    html += `<h5>2.දශමාංශය සෙවීම</h5><p>අපේ ඉලක්කම ${v} ට අනුව ලඝු වගුවේ <b>${row}</b> පේළිය සහ <b>${col}</b>`
        if (diffCol > 0) { 
        html += ` සහ අන්තර මධ්‍යය(අ.ම) <b>${diffCol}</b>`
    } 
        html += ` තීරුව බලන්න.</p>`;

    html += buildTableHTML(row, col, diffCol, true);

    html += `<div class="calc-box">
වගුවේ අගය &nbsp;: ${fmt4(mainV)}<br>`
    if (diffCol > 0) {
        html += `අන්තර මධ්‍යය &nbsp;:&nbsp; ${diffV}<br>`
    }
    html += `මුළු දශම අංශය &nbsp;&nbsp;&nbsp;&nbsp;:${fmt4(mainV)} + ${diffV} = <b>${fmt4(mainV + diffV)}</b>
</div>`;

    // --- ව්‍යුත්ති (Bar) ලකුණ සැකසීම ---
    let displayAns;
    if (exp < 0) {
        // සෘණ නම්, සෘණ ලකුණ ඉවත් කර ඉලක්කමට උඩින් ඉරක් (Bar) එක් කරයි
        displayAns = `<b>${Math.abs(exp)}̅.${fmt4(mainV + diffV)}</b>`;
    } else {
        // ධන නම් සාමාන්‍ය පරිදි පෙන්වයි
        displayAns = `<b>${exp}.${fmt4(mainV + diffV)}</b>`;
    }

    html += `<div class="note"><b>අවසාන පිළිතුර ≈ ${displayAns}</b></div>`;
    out.innerHTML = html;
    
}

// --- ANTILOG RENDER (Reverse Search) ---
function renderAntilog() {
    const out = document.getElementById('antiOutput');
    let raw = document.getElementById('antiInput').value.trim();
    let charac, mantissa;

    // Handling Bar and Negative
    if (raw.startsWith('-') || raw.includes('bar') || raw.includes('̅')) {
        let clean = raw.replace('-', '').replace('bar', '').replace('̅', '');
        let parts = clean.split('.');
        charac = -parseInt(parts[0]);
        mantissa = parseFloat("0." + (parts[1] || "0"));
    } else {
        let val = parseFloat(raw);
        charac = Math.floor(val);
        mantissa = val - charac;
    }

    const targetM = Math.round(mantissa * 10000);
    let row = 10, col = 0, mainV = 0, diffCol = 0, diffV = 0;

    // 1. Find the closest lower value in log table
    let found = false;
    for (let r = 10; r <= 99; r++) {
        for (let c = 0; c <= 9; c++) {
            let cur = mantissaInt(r / 10 + c / 100);
            if (cur <= targetM) {
                row = r; col = c; mainV = cur;
            } else { found = true; break; }
        }
        if (found) break;
    }

    // 2. Find Mean Difference
    let rem = targetM - mainV;
    if (rem > 0) {
        let bestD = 999;
        for (let d = 1; d <= 9; d++) {
            let dVal = mantissaInt(row / 10 + col / 100 + d / 1000) - mainV;
            if (Math.abs(dVal - rem) < bestD) {
                bestD = Math.abs(dVal - rem);
                diffCol = d; diffV = dVal;
            }
        }
    }

    let html = `<p>පූර්ණ අංශය: <b>${charac < 0 ? Math.abs(charac) + '̅' : charac}</b>, දශම අංශය: <b>.${fmt4(targetM)}</b></p>`;
    html += `<p>ලඝු වගුවේ අගයන් අතර <b>.${fmt4(targetM)}</b> හෝ <b>.${fmt4(targetM)}</b> ට කුඩාම ළඟම අගය සොයන්න.</p>`;

    html += buildTableHTML(row, col, diffCol, true);

    const digits = (row * 100) + (col * 10) + diffCol;
    const ans = (digits / 1000) * Math.pow(10, charac);

    html += `<div class="calc-box">
    ළඟම අගය ${fmt4(mainV)} හමුවන්නේ: <b>${row}</b> පේළිය සහ <b>${col}</b> තීරුවෙන්.<br>
    අවශ්‍ය ඉතිරිය: ${targetM} - ${mainV} = <b>${targetM - mainV}</b><br>
    එම අගයට ළඟම අන්තර මධ්‍යය: <b>${diffV}</b> (තීරුව <b>${diffCol}</b>)<br><br>
    ලැබෙන ඉලක්කම්: ${row} | ${col} | ${diffCol} &nbsp;➔ &nbsp;<b>${digits}</b>
</div>`;

    html += `<h3>දශමස්ථානය තැබීම</h3>`;
    html += `<div class="note">විද්‍යාත්මක ආකාරය: ${digits / 1000} × 10<sup>${charac}</sup><br>
         <b>අවසාන පිළිතුර ≈ ${ans.toPrecision(5)}</b></div>`;
    out.innerHTML = html;
    
}

// Common function to draw the Log Table snippet
function buildTableHTML(targetRow, targetCol, targetDiff, isLogTable) {
    let html = `<div class="arrow-wrapper">
<button class="scroll-btn left fade">&larr;</button>  <button class="scroll-btn right">&rarr;</button></div>
<div class="tablediv" id="tableScroll"><table><thead><tr><th>N</th>`;
    for (let c = 0; c < 10; c++) html += `<th class="${c === targetCol ? 'thead-highlight' : ''}">${c}</th>`;
    for (let d = 1; d <= 9; d++) html += `<th class="${d === targetDiff ? 'thead-highlight' : ''} small">අ.ම. ${d}</th>`;
    html += `</tr></thead><tbody>`;

    for (let r = targetRow - 2; r <= targetRow + 2; r++) {
        if (r < 10 || r > 99) continue;
        let isR = (r === targetRow);
        html += `<tr class="${isR ? 'row-highlight' : ''}"><td><b>${r}</b></td>`;
        for (let c = 0; c < 10; c++) {
            let v = mantissaInt(r / 10 + c / 100);
            let cls = (isR && c === targetCol) ? 'dark-highlight' : '';
            html += `<td class="${cls}">${fmt4(v)}</td>`;
        }
        for (let d = 1; d <= 9; d++) {
            let base = mantissaInt(r / 10 + targetCol / 100);
            let dv = mantissaInt(r / 10 + targetCol / 100 + d / 1000) - base;
            let cls = (isR && d === targetDiff) ? 'dark-highlight' : '';
            html += `<td class="${cls}">${dv}</td>`;
        }
        html += `</tr>`;
    }
    html += `</tbody></table></div>`;
    return html;
   
}

renderLog();
renderAntilog();

document.addEventListener("click", e => {
const btn = e.target.closest(".scroll-btn");
if (!btn) return;

const arrowWrapper = btn.closest(".arrow-wrapper");
if (!arrowWrapper) return;

// find the tablediv that belongs to THIS arrow set
const tableDiv = arrowWrapper.nextElementSibling;

if (!tableDiv || !tableDiv.classList.contains("tablediv")) return;

const scrollAmount = tableDiv.clientWidth * 0.8;
const dir = btn.classList.contains("left") ? -1 : 1;

tableDiv.scrollBy({
left: dir * scrollAmount,
behavior: "smooth"
});
});
document.querySelectorAll(".tablediv").forEach(tableDiv => {
tableDiv.addEventListener("scroll", e => {
const tableDiv = e.target.closest(".tablediv");
if (!tableDiv) return;

const arrowWrapper = tableDiv.previousElementSibling;
if (!arrowWrapper || !arrowWrapper.classList.contains("arrow-wrapper")) return;

const leftBtn = arrowWrapper.querySelector(".scroll-btn.left");
const rightBtn = arrowWrapper.querySelector(".scroll-btn.right");

const maxScroll = tableDiv.scrollWidth - tableDiv.clientWidth;

leftBtn.classList.toggle("fade", tableDiv.scrollLeft <= 0);
rightBtn.classList.toggle("fade", tableDiv.scrollLeft >= maxScroll - 1);
}, true);

})

// Select only the top-level list items of the accordion
document.querySelectorAll('.accordion > li').forEach(item => {
item.addEventListener('click', function(e) {
// Prevent the click from affecting parent menus if nested
e.stopPropagation();

const lcontent = this.querySelector(':scope > .lcontent');
if (!lcontent) return; // Exit if this specific LI has no content div

const isOpen = this.classList.contains('active');

// Close other top-level items
document.querySelectorAll('.accordion > li').forEach(el => {
el.classList.remove('active');
const childContent = el.querySelector(':scope > .lcontent');
if (childContent) childContent.style.maxHeight = null;
});

// Open this item
if (!isOpen) {
this.classList.add('active');
lcontent.style.maxHeight = lcontent.scrollHeight + "px";
}
});
});

function generate() {
    const types = ['mul', 'div', 'pow', 'sqrt'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    let n1 = Math.floor(Math.random() * 89) + 11;
    let n2 = Math.floor(Math.random() * 8) + 2;
    let eqHtml = "";
    let direct = 0;
    let steps = [];

    const log1 = Math.log10(n1);

    if (type === 'mul') {
        eqHtml = `${n1} × ${n2}`;
        direct = n1 * n2;
        const log2 = Math.log10(n2);
        steps = [
            { t: "ලඝු පොතෙන් ඉලක්කම් වල ලඝු අංක හොයමු", m: `log(${n1})=${log1.toFixed(4)} <br> log(${n2})=${log2.toFixed(4)}` },
            { t: "ගුණ කිරීමක් නිසා ලඝු අංක එකතු කරමු", m: `${log1.toFixed(4)} + ${log2.toFixed(4)} = ${(log1+log2).toFixed(4)}` },
            { t: "ලඝුපොතෙන් ප්‍රතිලඝු හොයමු", m: `antilog(${(log1+log2).toFixed(4)}) ≈ ${direct.toFixed(2)}` }
        ];
    } else if (type === 'div') {
        eqHtml = `${n1} ÷ ${n2}`;
        direct = n1 / n2;
        const log2 = Math.log10(n2);
        steps = [
            { t: "ලඝු පොතෙන් ඉලක්කම් වල ලඝු අංක හොයමු", m: `log(${n1})=${log1.toFixed(4)}, log(${n2})=${log2.toFixed(4)}` },
            { t: "බෙදීමක් නිසා ලඝු අංක අඩු කරමු", m: `${log1.toFixed(4)} - ${log2.toFixed(4)} = ${(log1-log2).toFixed(4)}` },
            { t: "ලඝුපොතෙන් ප්‍රතිලඝු හොයමු", m: `antilog(${(log1-log2).toFixed(4)}) ≈ ${direct.toFixed(2)}` }
        ];
    } else if (type === 'pow') {
        const p = Math.floor(Math.random() * 3) + 2;
        eqHtml = `${n1}<sup>${p}</sup>`;
        direct = Math.pow(n1, p);
        steps = [
            { t: "ලඝු පොතෙන් ඉලක්කම් වල ලඝු අංක හොයමු", m: `log(${n1}) = ${log1.toFixed(4)}` },
            { t: "බලයක් නිසා ලඝු අංකය බලයෙන් ගුණ කරමු", m: `${log1.toFixed(4)} × ${p} = ${(log1*p).toFixed(4)}` },
            { t: "ලඝුපොතෙන් ප්‍රතිලඝු හොයමු", m: `antilog(${(log1*p).toFixed(4)}) ≈ ${direct.toFixed(0)}` }
        ];
    } else {
        eqHtml = `√${n1}`;
        direct = Math.sqrt(n1);
        steps = [
            { t: "ලඝු පොතෙන් ඉලක්කම් වල ලඝු අංක හොයමු", m: `log(${n1}) = ${log1.toFixed(4)}` },
            { t: "වර්ගමූලය නිසා ලඝු අංකය 2න් බෙදමු", m: `${log1.toFixed(4)} ÷ 2 = ${(log1/2).toFixed(4)}` },
            { t: "ලඝුපොතෙන් ප්‍රතිලඝු හොයමු", m: `antilog(${(log1/2).toFixed(4)}) ≈ ${direct.toFixed(3)}` }
        ];
    }

    document.getElementById('equation').innerHTML = eqHtml;
    document.getElementById('directAnswer').innerText = direct.toLocaleString(undefined, {maximumFractionDigits: 2});
    
    let html = "";
    steps.forEach(s => {
        html += `<div class="step-block">
                    <span class="step-title">${s.t}</span>
                    <div class="step-math">${s.m}</div>
                 </div>`;
    });
    document.getElementById('stepsInner').innerHTML = html;
}


generate();