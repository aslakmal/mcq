function visualizeOperation(expression, elementClassName) {
    // 1. Robustly Parse the expression (Handles a + b, a - b, a + (-b), a - (-b))
    const match = expression.match(/(-?\d+)\s*([+\-])\s*(\(?\s*(-?\d+)\s*\)?)/);
    
    if (!match) {
        console.error("Invalid expression format. Expected 'a [+/-] b = ?'");
        return;
    }

    const start = parseInt(match[1], 10);
    const operator = match[2];
    const secondTerm = parseInt(match[4], 10); // This is the value inside the parentheses or the second number

    let end;
    let magnitude;
    let movementDirection; // 'right' for positive movement, 'left' for negative movement

    // Determine the result (end) and the movement properties
    if (operator === '+') {
        end = start + secondTerm;
        magnitude = Math.abs(secondTerm);
        movementDirection = secondTerm >= 0 ? 'right' : 'left';
    } else { // operator === '-'
        end = start - secondTerm;
        magnitude = Math.abs(secondTerm);
        // Subtraction moves left if secondTerm is positive (e.g., 5 - 3)
        // Subtraction moves right if secondTerm is negative (e.g., 5 - (-3))
        movementDirection = secondTerm >= 0 ? 'left' : 'right';
    }

    // Determine the range for the number line
    const minVal = Math.min(start, end, 0) - 2;
    const maxVal = Math.max(start, end, 0) + 2;

    const container = document.querySelector(`.${elementClassName}`);
    if (!container) {
        console.error(`Element with class '${elementClassName}' not found.`);
        return;
    }

    // Clear previous content and set container style
    container.innerHTML = '';
    container.style.padding = '20px 0';
    container.style.overflowX = 'auto';

    // 2. Create the Number Line Container
    const numberLine = document.createElement('div');
    numberLine.className = 'number-line-visualization';
    numberLine.style.position = 'relative';
    numberLine.style.height = '60px';
    numberLine.style.width = '100%';
    numberLine.style.paddingTop = '10px';
    container.appendChild(numberLine);

    // 3. Draw the main line
    const mainLine = document.createElement('div');
    mainLine.style.position = 'absolute';
    mainLine.style.top = '30px';
    mainLine.style.left = '5%';
    mainLine.style.right = '5%';
    mainLine.style.height = '2px';
    mainLine.style.backgroundColor = '#fff';
    numberLine.appendChild(mainLine);

    // Helper to convert value to percentage position on the line
    const getPosition = (value) => {
        return ((value - minVal) / (maxVal - minVal)) * 90 + 5; // 5% offset from edges
    };

    // 4. Draw ticks and labels
    for (let i = minVal; i <= maxVal; i++) {
        const pos = getPosition(i);

        // Tick mark
        const tick = document.createElement('div');
        tick.style.position = 'absolute';
        tick.style.left = `${pos}%`;
        tick.style.top = '25px';
        tick.style.width = '2px';
        tick.style.height = '10px';
        tick.style.backgroundColor = '#fff';
        numberLine.appendChild(tick);

        // Label
        const label = document.createElement('div');
        label.innerText = i;
        label.style.position = 'absolute';
        label.style.left = `${pos}%`;
        label.style.top = '40px';
        label.style.transform = 'translateX(-50%)';
        label.style.fontSize = '12px';
        label.style.color = '#fff';
        numberLine.appendChild(label);
    }

    // 5. Draw the Movement Line and Arrow
    const startPos = getPosition(start);
    const endPos = getPosition(end);
    const leftPos = Math.min(startPos, endPos);
    const width = Math.abs(startPos - endPos);

    // Line representing the move
    const movementLine = document.createElement('div');
    movementLine.style.position = 'absolute';
    movementLine.style.top = '30px';
    movementLine.style.left = `${leftPos}%`;
    movementLine.style.width = `${width}%`;
    movementLine.style.height = '3px';
    movementLine.style.backgroundColor = '#009688';
    movementLine.style.zIndex = '10';
    numberLine.appendChild(movementLine);

    // Arrowhead (simple triangle)
    const arrowHead = document.createElement('div');
    arrowHead.style.position = 'absolute';
    arrowHead.style.top = '25px';
    arrowHead.style.width = '0';
    arrowHead.style.height = '0';
    arrowHead.style.borderTop = '7px solid transparent';
    arrowHead.style.borderBottom = '5px solid transparent';
    
    if (movementDirection === 'right') {
        // Arrow points to the right (at endPos)
        arrowHead.style.left = `${endPos-1}%`;
        arrowHead.style.borderLeft = '20px solid #009688';
        arrowHead.style.transform = 'translateX(-50%)'; 
    } else {
        // Arrow points to the left (at endPos)
        arrowHead.style.left = `${endPos+1}%`;
        arrowHead.style.borderRight = '20px solid #009688';
        arrowHead.style.transform = 'translateX(-50%)'; 
    }
    numberLine.appendChild(arrowHead);

    // Start and End Point Markers
    const createMarker = (pos, color, title) => {
        const marker = document.createElement('div');
        marker.style.position = 'absolute';
        marker.style.left = `${pos}%`;
        marker.style.top = '25px';
        marker.style.width = '10px';
        marker.style.height = '10px';
        marker.style.borderRadius = '50%';
        marker.style.backgroundColor = color;
        marker.style.transform = 'translate(-50%, -50%)';
        marker.title = title;
        numberLine.appendChild(marker);
    };

    //createMarker(startPos, 'blue', `Start at ${start}`);
    //createMarker(endPos, 'green', `End at ${end} (Result)`);
}