//document.addEventListener('DOMContentLoaded', () => {
    let tooltipDiv = null;
    let currentGraphPoints = [];
let highlightedLabels = []; 
    function getOrCreateTooltip() {
        if (!tooltipDiv) {
            tooltipDiv = document.createElement('div');
            tooltipDiv.id = 'tooltip';
            tooltipDiv.style.cssText = `
                position: absolute;
                background-color: rgba(51, 51, 51, 0.9);
                color: #fff;
                padding: 0.25rem 0.5rem;
                border-radius: 0.25rem;
                font-size: 0.75rem;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.2s;
                z-index: 1000;
                white-space: nowrap;
            `;
            document.body.appendChild(tooltipDiv);
        }
        return tooltipDiv;
    }

    function showTooltip(event, x_val, y_val) {
        const tooltip = getOrCreateTooltip();
        tooltip.innerHTML = `ඛණ්ඩාංක: (${Math.round(x_val)}, ${Math.round(y_val)})<br>x=${Math.round(x_val)} වනවිට y=${Math.round(y_val)}`;
        if(Math.round(x_val)==0){
            tooltip.innerHTML +=`<br> අණ්තඃඛණ්ඩය: ${Math.round(y_val)}`
        }
        tooltip.style.left = `${event.pageX + 10}px`;
        tooltip.style.top = `${event.pageY + 10}px`;
        tooltip.style.opacity = 1;

        // Highlight axis labels
        highlightAxisLabels(Math.round(x_val), Math.round(y_val));
    }

    function hideTooltip() {
        const tooltip = getOrCreateTooltip();
        tooltip.style.opacity = 0;
        // Remove highlighting from axis labels
        clearAxisHighlights();
    }

    /**
     * Highlights the X and Y axis labels corresponding to the given rounded coordinates.
     * @param {number} roundedX The rounded X-coordinate of the point.
     * @param {number} roundedY The rounded Y-coordinate of the point.
     */
    function highlightAxisLabels(roundedX, roundedY) {
        clearAxisHighlights(); // Clear any existing highlights first

        // Select all text elements in the SVG
        const allTextElements = graphSVG.querySelectorAll('text');

        allTextElements.forEach(textElement => {
            const textContent = parseInt(textElement.textContent);
             if (textContent === roundedX && textElement.id.startsWith("x-")) { // Matches X-axis value
                    textElement.classList.add('highlight-axis-label');
                    highlightedLabels.push(textElement);
                }
                  if (textContent === roundedY && textElement.id.startsWith("y-")) { // Matches Y-axis value
                    textElement.classList.add('highlight-axis-label');
                    highlightedLabels.push(textElement);
                }
        });
    }

    /**
     * Removes highlighting from all currently highlighted axis labels.
     */
    function clearAxisHighlights() {
        highlightedLabels.forEach(label => {
            label.classList.remove('highlight-axis-label');
        });
        highlightedLabels = []; // Clear the array
    }


    function parseEquation(equationString) {
        let a = 0;
        let m = 0;
        let c = 0;
        let type = 'linear';
        let valid = true;

        let cleaned = equationString.toLowerCase().replace(/\s/g, '');
        if (cleaned.startsWith('y=')) {
            cleaned = cleaned.substring(2);
        }

        if (cleaned === '') {
            return { a: 0, m: 0, c: 0, type: 'linear', valid: true };
        }

        let remaining = cleaned;

        const getCoeff = (sign, numStr) => {
            let val = parseFloat(numStr || '1');
            if (isNaN(val)) return 0;
            return sign === '-' ? -val : val;
        };

        const x2Regex = /^([+\-]?)(\d*\.?\d*)x\^2/;
        let match = remaining.match(x2Regex);
        if (match) {
            a = getCoeff(match[1], match[2]);
            remaining = remaining.substring(match[0].length);
            type = 'quadratic';
        }

        const xRegex = /^([+\-]?)(\d*\.?\d*)x(?!\d)/;
        match = remaining.match(xRegex);
        if (match) {
            m = getCoeff(match[1], match[2]);
            remaining = remaining.substring(match[0].length);
        }

        const constantRegex = /^([+\-]?)(\d*\.?\d+)$/;
        match = remaining.match(constantRegex);
        if (match) {
            c = getCoeff(match[1], match[2]);
            remaining = remaining.substring(match[0].length);
        }

        if (remaining.length > 0 || isNaN(a) || isNaN(m) || isNaN(c)) {
            valid = false;
        }

        if (cleaned === '0') {
            return { a: 0, m: 0, c: 0, type: 'linear', valid: true };
        }

        return { a, m, c, type, valid };
    }

    function interpolatePoints(startPoints, endPoints, progress) {
        const interpolated = [];
        const numPoints = Math.min(startPoints.length, endPoints.length);

        for (let i = 0; i < numPoints; i++) {
            const startX = startPoints[i] ? startPoints[i][0] : endPoints[i][0];
            const startY = startPoints[i] ? startPoints[i][1] : endPoints[i][1];

            const endX = endPoints[i][0];
            const endY = endPoints[i][1];

            const currentX = startX + (endX - startX) * progress;
            const currentY = startY + (endY - startY) * progress;
            interpolated.push(`${currentX},${currentY}`);
        }
        return interpolated.join(' ');
    }

    function animateLine(element, startXYArrays, endXYArrays, duration, onCompleteCallback) {
        const startTime = performance.now();

        function frame() {
            const elapsed = performance.now() - startTime;
            let progress = Math.min(elapsed / duration, 1);

            progress = 1 - Math.pow(1 - progress, 2);

            const interpolatedPointsString = interpolatePoints(startXYArrays, endXYArrays, progress);
            element.setAttribute('points', interpolatedPointsString);

            if (progress < 1) {
                requestAnimationFrame(frame);
            } else {
                if (onCompleteCallback) {
                    onCompleteCallback();
                }
            }
        }
        requestAnimationFrame(frame);
    }

    function renderDots(dotData,fixed=false) {
        dotsGroup.innerHTML = '';
        const dotRadius = 0.15;

        dotData.forEach(dot => {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', dot.x_svg);
            circle.setAttribute('cy', dot.y_svg);
            circle.setAttribute('r', dotRadius);
            circle.setAttribute('fill', '#2563eb');
            circle.style.cursor = 'pointer';

            circle.dataset.xVal = dot.x_math.toString();
            circle.dataset.yVal = dot.y_math.toString();
            if(!fixed){
            circle.addEventListener('mouseover', (e) => showTooltip(e, parseFloat(e.target.dataset.xVal), parseFloat(e.target.dataset.yVal)));
              }
             circle.addEventListener('mouseout', hideTooltip);

            dotsGroup.appendChild(circle);
        });
    }


    function updateGraph(equationString,fixed=false) {
const { a, m, c, type, valid } = parseEquation(equationString);


     /*   if (!valid) {
            errorMessage.classList.remove('hidden');
            graphLine.setAttribute('points', '');
            dotsGroup.innerHTML = '';
            currentGraphPoints = [];
            hideTooltip();
            clearAxisHighlights(); // Clear highlights on error
            return;
        } else {
            errorMessage.classList.add('hidden');
        }*/

        const newSvgPlotPoints = [];
        const newDotData = [];

        const polylineStep = 0.1;
        const dotStep = 1;
        const minX = -10;
        const maxX = 10;
        const dotRadius = 0.15;

        for (let x_math = minX; x_math <= maxX; x_math += polylineStep) {
            let y_math;
            if (type === 'linear') {
                y_math = m * x_math + c;
            } else if (type === 'quadratic') {
                y_math = a * x_math * x_math + m * x_math + c;
            }

            const y_svg = -y_math;
            newSvgPlotPoints.push([x_math, y_svg]);
        }

        for (let x_dot = Math.floor(minX); x_dot <= Math.ceil(maxX); x_dot += dotStep) {
            let y_math_dot;
            if (type === 'linear') {
                y_math_dot = m * x_dot + c;
            } else if (type === 'quadratic') {
                y_math_dot = a * x_dot * x_dot + m * x_dot + c;
            }

            const y_svg_dot = -y_math_dot;

            newDotData.push({
                x_math: x_dot,
                y_math: y_math_dot,
                x_svg: x_dot,
                y_svg: y_svg_dot
            });
        }

        let startPointsXYForAnimation = [];
        const currentPointsString = graphLine.getAttribute('points');
        if (currentPointsString) {
            startPointsXYForAnimation = currentPointsString.split(' ').map(p => p.split(',').map(Number));
        }

        dotsGroup.innerHTML = '';
        hideTooltip();
        clearAxisHighlights(); // Clear highlights before animation starts

        if (startPointsXYForAnimation.length === 0 || startPointsXYForAnimation.length !== newSvgPlotPoints.length) {
            graphLine.setAttribute('points', newSvgPlotPoints.map(p => `${p[0]},${p[1]}`).join(' '));
            renderDots(newDotData,fixed);
        } else {
            animateLine(graphLine, startPointsXYForAnimation, newSvgPlotPoints, 500, () => {
                renderDots(newDotData,fixed);
            });
        }

        currentGraphPoints = newSvgPlotPoints;
    }




    function createGraphSVG(selector) {
        const SVG_NS = 'http://www.w3.org/2000/svg';
        const container = document.querySelector(selector);
        if (!container) {
            console.error(`Container element not found with selector: ${selector}`);
            return;
        }
    
        // --- Helper function to create SVG elements ---
        function createElement(name, attributes, textContent = null) {
            const el = document.createElementNS(SVG_NS, name);
            for (const key in attributes) {
                if (attributes.hasOwnProperty(key)) {
                    el.setAttribute(key, attributes[key]);
                }
            }
            if (textContent !== null) {
                el.textContent = textContent;
            }
            return el;
        }
    
        // --- Main SVG element (Viewport: -10 to 10 on both axes) ---
        const svg = createElement('svg', {
            id: 'graphSVG',
            viewBox: '-10 -10 20 20'
        });
    
        // --- defs and clipPath ---
        const defs = createElement('defs');
        const clipPath = createElement('clipPath', { id: 'graphAreaClip' });
        const rect = createElement('rect', { x: '-10', y: '-10', width: '20', height: '20' });
    
        clipPath.appendChild(rect);
        defs.appendChild(clipPath);
        svg.appendChild(defs);
    
        // --- Grid Lines (Automated) ---
        const gridColor = '#e0e0e0';
        const gridWidth = '0.02';
    
        // Horizontal grid lines (y = -9 to 9, skipping y=0)
        for (let y = -9; y <= 9; y++) {
            if (y === 0) continue;
            const line = createElement('line', {
                x1: '-10', y1: y, x2: '10', y2: y,
                stroke: gridColor, 'stroke-width': gridWidth
            });
            svg.appendChild(line);
        }
    
        // Vertical grid lines (x = -9 to 9, skipping x=0)
        for (let x = -9; x <= 9; x++) {
            if (x === 0) continue;
            const line = createElement('line', {
                x1: x, y1: '-10', x2: x, y2: '10',
                stroke: gridColor, 'stroke-width': gridWidth
            });
            svg.appendChild(line);
        }
        
        // ----------------------------------------------------------------
        // --- AXES AND ARROWS (Restored to match your original coordinates) ---
        // ----------------------------------------------------------------
        const axisWidth = '0.06';
        const axisColor = 'black';
    
        // X-Axis Line
        svg.appendChild(createElement('line', { x1: '-10', y1: '0', x2: '10', y2: '0', stroke: axisColor, 'stroke-width': axisWidth }));
        // X-Axis Arrow
        svg.appendChild(createElement('polygon', { points: '9.7 0.3, 10 0, 9.7 -0.3', fill: axisColor }));
        // X-Axis Label 'x'
        svg.appendChild(createElement('text', { x: '9.5', y: '-0.8', 'font-size': '0.8', 'text-anchor': 'middle', fill: axisColor }, 'x'));
    
        // Y-Axis Line
        svg.appendChild(createElement('line', { x1: '0', y1: '-10', x2: '0', y2: '10', stroke: axisColor, 'stroke-width': axisWidth }));
        // Y-Axis Arrow
        svg.appendChild(createElement('polygon', { points: '0.3 -9.7, 0 -10, -0.3 -9.7', fill: axisColor }));
        // Y-Axis Label 'y' (Adjusted position to match your SVG: x="-1" y="-9.5")
        svg.appendChild(createElement('text', { x: '-1', y: '-9.5', 'font-size': '0.8', 'text-anchor': 'middle', fill: axisColor }, 'y')); 
        
        // Origin Label '0'
        svg.appendChild(createElement('text', { x: '-0.5', y: '0.7', 'font-size': '0.5', fill: axisColor }, '0'));
    
        // --- Line and Dots Placeholder Groups ---
        svg.appendChild(createElement('polyline', { 
            id: 'graphLine', fill: 'none', stroke: '#4CAF50', 
            'stroke-width': '0.06', class: 'line-shadow', 
            'clip-path': 'url(#graphAreaClip)' 
        }));
        svg.appendChild(createElement('g', { 
            id: 'dotsGroup', 'clip-path': 'url(#graphAreaClip)' 
        }));
    
        // ----------------------------------------------------------------
        // --- TICK LABELS (Automated with required IDs) ---
        // ----------------------------------------------------------------
        const tickFontSize = '0.5';
        const tickColor = 'gray';
    
        // X-Axis Ticks
        for (let i = 1; i <= 9; i++) {
            // Positive X
            svg.appendChild(createElement('text', {
                id: `x-${i}`, x: i, y: '0.7', 'font-size': tickFontSize,
                'text-anchor': 'middle', fill: tickColor
            }, i.toString()));
            // Negative X
            svg.appendChild(createElement('text', {
                id: `x-minus-${i}`, x: -i, y: '0.7', 'font-size': tickFontSize,
                'text-anchor': 'middle', fill: tickColor
            }, `-${i}`));
        }
    
        // Y-Axis Ticks (SVG Y-axis is inverted: positive Y is DOWN)
        for (let i = 1; i <= 9; i++) {
            // Positive Y values (appear above the axis line)
            svg.appendChild(createElement('text', {
                id: `y-${i}`, x: '-0.7', y: -i, 'font-size': tickFontSize,
                'text-anchor': 'start', fill: tickColor
            }, i.toString()));
            
            // Negative Y values (appear below the axis line)
            svg.appendChild(createElement('text', {
                id: `y-minus-${i}`, x: '-0.7', y: i, 'font-size': tickFontSize,
                'text-anchor': 'start', fill: tickColor
            }, `-${i}`));
        }
        
        // Clear container and add the new SVG
        container.innerHTML = ''; 
        container.appendChild(svg);
        
        return svg;
    }