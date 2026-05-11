let leftExpr = "", rightExpr = "";
let targetX = 5;
let activeOp = '+';
let _history = [];
let redoStack = []; // New array to store undone states

function check_historyStatus() {
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');

    // Undo button status
    undoBtn.disabled = _history.length === 1;
    undoBtn.style.opacity = _history.length === 1 ? "0.5" : "1";

    // Redo button status
    redoBtn.disabled = redoStack.length === 0;
    redoBtn.style.opacity = redoStack.length === 0 ? "0.5" : "1";
}

function save_history() {
    // Whenever the user performs a NEW action, the Redo path is cleared
    _history.push({ left: leftExpr, right: rightExpr });
    redoStack = [];
    if (_history.length > 20) _history.shift();
    check_historyStatus();
}

function undo() {
    if (_history.length > 0) {
        // Save current state to redoStack before going back
        redoStack.push({ left: leftExpr, right: rightExpr });

        let lastState = _history.pop();
        leftExpr = lastState.left;
        rightExpr = lastState.right;

        updateDisplay();
        check_historyStatus();
    }
}

function redo() {
    if (redoStack.length > 0) {
        // Save current state to _history before going forward
        _history.push({ left: leftExpr, right: rightExpr });

        let nextState = redoStack.pop();
        leftExpr = nextState.left;
        rightExpr = nextState.right;

        updateDisplay();
        check_historyStatus();
    }
}



const sinhalaLabels = {
    '+': "ක් එකතු කරන්න", '-': "ක් අඩු කරන්න",
    '*': "න් ගුණ කරන්න", '/': "න් බෙදන්න",
    '^': "වන බලයට නංවන්න", 'sqrt': "වන මූලය ගන්න"
};

const sinhalaButtonLabels = {
    '+': { left: "වමට", right: "දකුණට" },
    '-': { left: "වමින්", right: "දකුණින්" },
    'sqrt': { left: "වමෙහි", right: "දකුණෙහි" },
    '*': { left: "වම", right: "දකුණ" },
    '/': { left: "වම", right: "දකුණ" },
    '^': { left: "වම", right: "දකුණ" }
};

// Switch between +, -, *, /, etc.
function setTab(op, btn) {
    activeOp = op;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('prompt-text').innerText = sinhalaLabels[op];
    document.getElementById('op-value').value = (op === 'sqrt' || op === '^' || op === '*' || op === '/') ? "2" : "1";
    const labels = sinhalaButtonLabels[op] || { left: "වම", right: "දකුණ" };
    document.querySelector('.btn-left').innerText = labels.left;
    document.querySelector('.btn-right').innerText = labels.right;
}

function initGame() {
    _history = [];
    redoStack = []; // Reset both on new game
    save_history();
    //checkUndoStatus();
    check_historyStatus();
    // 1. Pick a base number (2-6)
    const base = Math.floor(Math.random() * 5) + 2;
    const a = Math.floor(Math.random() * 3) + 2; // Divisor/Multiplier (2-4)
    const b = Math.floor(Math.random() * 10) + 1; // Constant (1-10)

    const templateType = Math.floor(Math.random() * 5);

    switch (templateType) {
        case 0: // ax - b = c
            targetX = base + 5;
            leftExpr = `${a}x - ${b}`;
            break;

        case 1: // ax^2 - b = c
            targetX = base;
            leftExpr = `${a}x^2 - ${b}`;
            break;

        case 2: // x/a + b = c
            // IMPORTANT: targetX must be a multiple of 'a' for a round result
            targetX = base * a;
            leftExpr = `x/${a} + ${b}`;
            break;

        case 3: // x/a - b = c
            targetX = base * a;
            leftExpr = `x/${a} - ${b}`;
            break;

        default: // ax + b = c
            targetX = base;
            leftExpr = `${a}x + ${b}`;
    }

    // Clean up "1x"
    leftExpr = leftExpr.replace(/\b1x/g, 'x');

    // 2. Calculate the Right Side using the safe targetX
    try {
        const scope = { x: targetX };
        // evaluate the math and force it to be a clean integer
        const result = math.evaluate(leftExpr, scope);
        rightExpr = Math.round(result).toString();
    } catch (e) {
        rightExpr = "20";
    }

    updateDisplay();
}

function applyOp(side) {
    save_history();

    const val = document.getElementById('op-value').value;
    if (!val) return;

    let current = (side === 'left') ? leftExpr : rightExpr;
    let rawNewExpr = "";

    // 1. Build the raw expression
    if (activeOp === 'sqrt') {
        rawNewExpr = `nthRoot((${current}), ${val})`;
    } else if (activeOp === '^') {
        rawNewExpr = `(${current}) ^ ${val}`;
    } else if (activeOp === '*') {
        // Putting val first helps Math.js group coefficients correctly
        rawNewExpr = `(${val}) * (${current})`;
    } else {
        rawNewExpr = `(${current}) ${activeOp} (${val})`;
    }

    try {
        // 2. Define your special cancellation rules
        const customRules = [
            { l: 'nthRoot(n1^n2, n2)', r: 'n1' },
            { l: 'sqrt(n1^2)', r: 'n1' },
            { l: 'nthRoot(n1, n2)^n2', r: 'n1' }
        ];

        // 3. SIMPLIFY
        let step1 = math.simplify(rawNewExpr);
        let finalNode = math.simplify(step1, customRules);

        // 4. THE FIX: Save the raw string WITH operators for the next math step
        let resultStr = finalNode.toString();

        if (side === 'left') leftExpr = resultStr;
        else rightExpr = resultStr;

        // 5. Update the visual scale
        updateDisplay();

    } catch (e) {
        console.error(e);
        alert("ගණිතමය දෝෂයකි.");
    }
}

function cleanAlgebra(str) {
    return str
        .replace(/\s/g, '')               // Remove spaces
        .replace(/\*/g, '')               // Remove stars
        .replace(/\./g, '')               // Remove dots (the . in x.3)
        .replace(/([a-zA-Z])([0-9]+)/g, '$2$1') // SWAP: x3 -> 3x, x27 -> 27x
        .replace(/\b1([a-zA-Z])/g, '$1'); // 1x -> x
}
function updateDisplay() {
    const toLaTeX = (str) => {
        try {
            // 1. Parse the string
            let node = math.parse(str);

            // 2. Convert to TeX with specific options
            // 'implicit: hide' tells MathJax not to draw the multiplication symbol
            let tex = node.toTex({
                parenthesis: 'keep',
                implicit: 'hide'
            });

            // 3. CLEAN UP: Manually remove any leftover LaTeX dots (\cdot) 
            // and fix any x6 -> 6x issues
            tex = tex.replace(/\\cdot/g, ''); // Removes the actual LaTeX dot symbol
            tex = tex.replace(/\s+/g, '');    // Removes extra spaces

            // 4. Force Coefficient-First: swap x6 to 6x
            tex = tex.replace(/([a-zA-Z])([0-9]+)/g, '$2$1');

            return tex;
        } catch (e) {
            return str;
        }
    };

    document.getElementById('left-pan').innerHTML = `\\( ${toLaTeX(leftExpr)} \\)`;
    document.getElementById('right-pan').innerHTML = `\\( ${toLaTeX(rightExpr)} \\)`;

    if (window.MathJax) MathJax.typesetPromise();

    try {
        const scope = { x: targetX };
        const lVal = math.evaluate(leftExpr, scope);
        const rVal = math.evaluate(rightExpr, scope);

        const diff = lVal - rVal;
        const pivot = document.querySelector('.pivot');

        // Check if the difference is essentially zero
        // We use a very small number (0.001) to handle tiny computer rounding errors
        if (Math.abs(diff) < 0.001) {
            pivot.innerText = "=";
            pivot.style.color = "#27ae60"; // Green for equal
        } else {
            pivot.innerText = "≠";
            pivot.style.color = "#e74c3c"; // Red for not equal
        }

        const angle = Math.max(Math.min(diff * -0.6, 18), -18);

        // 1. Rotate the beam
        const beam = document.getElementById('beam');
        beam.style.transform = `rotate(${angle}deg)`;

        // 2. Counter-rotate the pan assemblies so they hang straight down
        const assemblies = document.querySelectorAll('.pan-assembly');
        assemblies.forEach(pan => {
            pan.style.transform = `rotate(${-angle}deg)`;
        });

    } catch (e) { }
}
function checkUndoStatus() {
    const undoBtn = document.getElementById('undo-btn');
    if (_history.length > 1) {
        undoBtn.disabled = false;
        undoBtn.style.opacity = "1";
        undoBtn.style.cursor = "pointer";
    } else {
        undoBtn.disabled = true;
        undoBtn.style.opacity = "0.5"; // Make it look faded
        undoBtn.style.cursor = "not-allowed";
    }
}
function formatForPan(str) {
    try {
        // 1. Parse the string into a Math.js node
        let node = math.parse(str);

        // 2. Convert to TeX (MathJax format)
        // MathJax is usually smart enough to turn "x * 3" into "3x"
        let tex = node.toTex({ parenthesis: 'keep', implicit: 'hide' });

        // 3. Fallback: If Math.js outputs "x \cdot 3", we swap it manually
        // This regex looks for "x" followed by a number and swaps them
        tex = tex.replace(/x \cdot ([0-9]+)/g, '$1x');
        tex = tex.replace(/x([0-9]+)/g, '$1x');

        return tex;
    } catch (e) {
        return str;
    }
}
initGame()

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