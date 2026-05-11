
document.addEventListener("click", e => {
    const btn = e.target.closest(".scroll-btn");
    if (!btn) return;
  
    const wrapper = btn.closest(".btn-wrapper");
    if (!wrapper) return;
  
    const input = wrapper.querySelector('input[type="number"]');
    if (!input) return;
  
    const step = input.step ? Number(input.step) : 1;
    const min = input.min !== "" ? Number(input.min) : -Infinity;
    const max = input.max !== "" ? Number(input.max) : Infinity;
  
    let value = Number(input.value) || 0;
  
    if (btn.classList.contains("left")) {
      value -= step;
    } else {
      value += step;
    }
  
    // clamp value
    value = Math.max(min, Math.min(max, value));
  
    input.value = value;
  
    // 🔥 trigger same logic as manual typing
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  
  
             createGraphSVG('.graph-container');
  
  
  
  const graphLine = document.getElementById('graphLine');
  const dotsGroup = document.getElementById('dotsGroup');
  const errorMessage = document.getElementById('errorMessage');
  const graphSVG = document.getElementById('graphSVG'); 
  
  
  const coefInput   = document.getElementById("coef"); // මේක a පදය (x^2 සංගුණකය)
  const bInput      = document.getElementById("bValue"); // අලුතින් එකතු කළ b පදය
  const constInput  = document.getElementById("constant"); // මේක c පදය
  const powerRadios = document.querySelectorAll("input[name='power']");
  const eqDisplay   = document.getElementById("equationDisplay");
  
  [coefInput, bInput, constInput].forEach(el => {
      el.addEventListener("input", renderEquation);
  });
  
  powerRadios.forEach(radio => {
      radio.addEventListener("change", renderEquation);
  });
  
  function renderEquation() {
      const a = parseFloat(coefInput.value) || 0;
      const b = parseFloat(bInput.value) || 0;
      const c = parseFloat(constInput.value) || 0;
      const power = document.querySelector("input[name='power']:checked").value;
      
      if(power=="2"){
          document.querySelector(".xvalue").style.display="flex";  
      }else{
          document.querySelector(".xvalue").style.display="none";  
      }
  
      let displayEq = "y = ";
      let rawEq = "y = ";
      let parts = [];
      let rawParts = [];
  
      // 1. x^2 හෝ x පදය (ප්‍රධාන සංගුණකය)
      if (a !== 0) {
          let term = (a === 1 ? "" : a === -1 ? "-" : a) + "x";
          let rawTerm = a + "x";
          if (power === "2") {
              term += "²";
              rawTerm += "^2";
          }
          parts.push(term);
          rawParts.push(rawTerm);
      }
  
      // 2. b පදය (x හි සංගුණකය) - මෙය පෙන්වන්නේ power එක 2 නම් පමණි
      if (power === "2" && b !== 0) {
          let term = (b === 1 ? "x" : b === -1 ? "-x" : b + "x");
          let rawTerm = b + "x";
          
          // ලකුණ හැසිරවීම (+ හෝ -)
          if (parts.length > 0 && b > 0) {
              parts.push("+ " + term);
              rawParts.push("+" + rawTerm);
          } else {
              parts.push(term);
              rawParts.push(rawTerm);
          }
      }
  
      // 3. නියතය (c)
      if (c !== 0) {
          if (parts.length > 0) {
              parts.push((c > 0 ? "+ " : "- ") + Math.abs(c));
              rawParts.push((c > 0 ? "+" : "") + c);
          } else {
              parts.push(c);
              rawParts.push(c);
          }
      }
  
      // කිසිවක් නැතිනම් 0 පෙන්වන්න
      if (parts.length === 0) {
          displayEq += "0";
          rawEq += "0";
      } else {
          displayEq += parts.join(" ");
          rawEq += rawParts.join("");
      }
  
      eqDisplay.innerHTML = displayEq;
      updateGraph(rawEq);
      analyzeQuadratic(rawEq)
      generateTable(rawEq)
     // analyzeRange(rawEq)
  }
  
  
  
  // initial render
  renderEquation();
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
  
  
  
  function analyzeQuadratic(equation) {
      const container = document.getElementById("graphData");
      let str = equation.replace(/\s+/g, '').replace('y=', '');
   // Helper function to create tooltip
   const info = (msg) => `<span class="info-icon" data-tip="${msg}">?</span>`;
  
      let a = 0, b = 0, c = 0;
      const x2Match = str.match(/([+-]?\d*)x\^2/);
      if (x2Match) {
          let val = x2Match[1];
          a = (val === "" || val === "+") ? 1 : (val === "-") ? -1 : parseFloat(val);
          str = str.replace(x2Match[0], ''); 
      }
      const xMatch = str.match(/([+-]?\d*)x(?!\^)/);
      if (xMatch) {
          let val = xMatch[1];
          b = (val === "" || val === "+") ? 1 : (val === "-") ? -1 : parseFloat(val);
          str = str.replace(xMatch[0], '');
      }
      const cMatch = str.match(/[+-]?\d+(\.\d+)?/);
      if (cMatch) { c = parseFloat(cMatch[0]); }
  
      if (a === 0) {
      // b යනු x හි සංගුණකය (අනුක්‍රමණය), c යනු නියතය (y-අන්තඃඛණ්ඩය)
      const gradient = b;
      const intercept = c;
      const root = gradient !== 0 ? (-intercept / gradient).toFixed(2) : "නැත";
  
      container.innerHTML = `
          <div style="font-family: sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 12px; background: #fff;">
              <h2 style="color: #27ae60; margin-top:0;">ප්‍රස්ථාර විශ්ලේෂණය</h2>
              
              <p><strong>1. අනුක්‍රමණය (m):</strong> ${gradient} ${info("සරල රේඛාවක ඇලවීම මෙලෙස හැඳින්වේ. මෙය ධන නම් රේඛාව ඉහළට යන අතර, සෘණ නම් පහළට යයි.")}</p>
              
              <p><strong>2. y-අන්තඃඛණ්ඩය (c):</strong> ${intercept} ${info("ප්‍රස්ථාරය y අක්ෂය ඡේදනය කරන ලක්ෂ්‍යයයි.")}</p>
              
              <p><strong>3. x-අන්තඃඛණ්ඩය (මූලය):</strong> ${root} ${info("ප්‍රස්ථාරය x අක්ෂය ඡේදනය කරන ලක්ෂ්‍යයයි. මෙය සෙවීමට y=0 ලෙස ආදේශ කරන්න.")}</p>
              
              <p><strong>4. ස්වභාවය:</strong> ${gradient > 0 ? "ඉහළට යන රේඛාවකි" : gradient < 0 ? "පහළට යන රේඛාවකි" : "තිරස් රේඛාවකි"}</p>
          </div>
      `;
      return;
  }
  
      const xSym = -b / (2 * a);
      const yVal = (a * xSym * xSym) + (b * xSym) + c;
      const type = a > 0 ? "අවම" : "උපරිම";
      const disc = (b * b) - (4 * a * c);
      
      let roots = "X අක්ෂය කපන්නේ නැති නිසා තාත්වික මූල නොමැත";
      if (disc >= 0) {
          let r1 = ((-b + Math.sqrt(disc)) / (2 * a)).toFixed(2);
          let r2 = ((-b - Math.sqrt(disc)) / (2 * a)).toFixed(2);
          roots = (r1 === r2) ? `x = ${r1}` : `x = ${r1} , x = ${r2}`;
      }
  
     
      container.innerHTML = `
          <div style="font-family: 'Segoe UI', sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 12px; background: #fff; max-width: 450px;">
              <h2 style="color: #27ae60; margin-top:0;">ප්‍රස්ථාර විශ්ලේෂණය</h2>
              
              <p><strong>1. ස්වභාවය:</strong> ${type} ${info("x² හි සංගුණකය ධන නම් ප්‍රස්ථාරය '∪' හැඩය ද, සෘණ නම් '⋂' හැඩය ද ලැබේ.")}</p>
              
              <p><strong>2. ශීර්ෂය:</strong> (${xSym.toFixed(2)}, ${yVal.toFixed(2)}) ${info("ප්‍රස්ථාරය හැරෙන ලක්ෂ්‍යය ශීර්ෂය ලෙස හැඳින්වේ.")}</p>
              
              <p><strong>3. සමමිතිය අක්ෂය:</strong> x = ${xSym.toFixed(2)} ${info("ප්‍රස්ථාරය හරියටම මැදින් දෙකට බෙදන සිරස් රේඛාව සමමිතිය අක්ෂය ලෙස හැඳින්වේ.")}</p>
              
              <p><strong>4. ${type} අගය:</strong> ${yVal.toFixed(2)} ${info("ශ්‍රිතයේ ඇති කුඩාම හෝ විශාලම y අගයයි.")}</p>
              
              <p><strong>5. y-අන්තඃඛණ්ඩය:</strong> ${c} ${info("ප්‍රස්ථාරය y අක්ෂය කපාගෙන යන ලක්ෂ්‍යයයි.")}</p>
              
              <p><strong>6. මූලයන්:</strong> <span style="color: #27ae60;">${roots}</span> ${info("ප්‍රස්ථාරය x අක්ෂය ඡේදනය කරන ලක්ෂ්‍යයන්හි x අගයන් මූලයන් ලෙස හැඳින්වේ.")}</p>
          </div>
      `;
  }
  
  function generateTable(equation) {
    const tableDiv = document.getElementById("valuetbl");
    let str = equation.replace(/\s+/g, '').replace('y=', '');

    let a = 0, b = 0, c = 0;
    
    // කලින් භාවිතා කළ Regex මගින් a, b, c වෙන් කර ගැනීම
    const x2Match = str.match(/([+-]?\d*)x\^2/);
    if (x2Match) {
        let val = x2Match[1];
        a = (val === "" || val === "+") ? 1 : (val === "-") ? -1 : parseFloat(val);
        str = str.replace(x2Match[0], ''); 
    }
    const xMatch = str.match(/([+-]?\d*)x(?!\^)/);
    if (xMatch) {
        let val = xMatch[1];
        b = (val === "" || val === "+") ? 1 : (val === "-") ? -1 : parseFloat(val);
        str = str.replace(xMatch[0], '');
    }
    const cMatch = str.match(/[+-]?\d+(\.\d+)?/);
    if (cMatch) { c = parseFloat(cMatch[0]); }

    // වගුව සඳහා x අගයන් පරාසය (-3 සිට 3 දක්වා)
    const xValues = [-3, -2, -1, 0, 1, 2, 3];
    
    let html = `
        <div style="margin-top: 20px; font-family: sans-serif;">
            <h4 style="color: #34495e;">ඛණ්ඩාංක වගුව (x, y අගයන්)</h4>
            <div style="overflow-x: auto;">
                <table border="1" style="width: 100%; border-collapse: collapse; text-align: center; background: white;">
                    <tr style="background: #ecf0f1;">
                        <th style="padding: 10px; border: 1px solid #bdc3c7;">x</th>
                        ${xValues.map(x => `<td style="padding: 10px; border: 1px solid #bdc3c7;">${x}</td>`).join('')}
                    </tr>
                    <tr>
                        <th style="padding: 10px; border: 1px solid #bdc3c7;">y</th>
                        ${xValues.map(x => {
                            // y = ax^2 + bx + c සූත්‍රයට අනුව y සෙවීම
                            let y = (a * x * x) + (b * x) + c;
                            return `<td style="padding: 10px; border: 1px solid #bdc3c7; font-weight: bold; color: #2980b9;">${y}</td>`;
                        }).join('')}
                    </tr>
                </table>
            </div>
         </div>
    `;

    tableDiv.innerHTML = html;
}
  
function analyzeRange(equation) {
    const rangeDiv = document.getElementById("rangeDetails");
    let str = equation.replace(/\s+/g, '').replace('y=', '');

    let a = 0, b = 0, c = 0;
    const x2Match = str.match(/([+-]?\d*)x\^2/);
    if (x2Match) {
        let val = x2Match[1];
        a = (val === "" || val === "+") ? 1 : (val === "-") ? -1 : parseFloat(val);
        str = str.replace(x2Match[0], ''); 
    }
    const xMatch = str.match(/([+-]?\d*)x(?!\^)/);
    if (xMatch) {
        let val = xMatch[1];
        b = (val === "" || val === "+") ? 1 : (val === "-") ? -1 : parseFloat(val);
        str = str.replace(xMatch[0], '');
    }
    const cMatch = str.match(/[+-]?\d+(\.\d+)?/);
    if (cMatch) { c = parseFloat(cMatch[0]); }

    const disc = (b * b) - (4 * a * c);
    if (disc <= 0) {
        rangeDiv.innerHTML = "<p>තාත්වික මූල පවතින ශ්‍රිතයක් ඇතුළත් කරන්න.</p>";
        return;
    }

    let r1 = ((-b + Math.sqrt(disc)) / (2 * a));
    let r2 = ((-b - Math.sqrt(disc)) / (2 * a));
    let low = Math.min(r1, r2).toFixed(1);
    let high = Math.max(r1, r2).toFixed(1);

    // සාධක ආකාරය (Signs adjusted for clarity)
    let s1 = low < 0 ? `(x + ${Math.abs(low)})` : `(x - ${low})`;
    let s2 = high < 0 ? `(x + ${Math.abs(high)})` : `(x - ${high})`;

    rangeDiv.innerHTML = `
        <div style="font-family: sans-serif; line-height: 1.6; color: #2c3e50;">
            <h3 style="color: #2980b9;">වීජීය ක්‍රමයට පරාසය සෙවීම (Algebraic Method)</h3>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #dee2e6;">
                <p><strong>පියවර 1: ශ්‍රිතය සාධක වලට වෙන් කරන්න.</strong><br>
                y = ${a !== 1 ? a : ''}${s1}${s2}</p>

                <p><strong>පියවර 2: ශ්‍රිතය ශුන්‍ය වන අගයන් (මූලයන්) සොයන්න.</strong><br>
                මෙහිදී x = ${low} සහ x = ${high} වේ.</p>

                <p><strong>පියවර 3: සංඛ්‍යා රේඛාව මත ලකුණු පරීක්ෂා කරන්න.</strong><br>
                අපි පරාස 3ක් සලකා බලමු:</p>
                <ul style="list-style: none; padding-left: 10px;">
                    <li>1. x < ${low} විට</li>
                    <li>2. ${low} < x < ${high} විට</li>
                    <li>3. x > ${high} විට</li>
                </ul>
            </div>

            <div style="margin-top: 15px; padding: 15px; background: #e8f4fd; border-radius: 8px;">
                <h4 style="margin-top: 0;">අවසාන නිගමනය:</h4>
                <p><b>y සෘණ වන පරාසය (y < 0):</b><br>
                සාධක දෙකේ ගුණිතය සෘණ විය යුතුය. <br>
                <span style="font-size: 18px; color: #e74c3c; font-weight: bold;">${a > 0 ? low + " < x < " + high : "x < " + low + " හෝ x > " + high}</span></p>

                <p><b>y ධන වන පරාසය (y > 0):</b><br>
                සාධක දෙකේ ගුණිතය ධන විය යුතුය. <br>
                <span style="font-size: 18px; color: #27ae60; font-weight: bold;">${a > 0 ? "x < " + low + " හෝ x > " + high : low + " < x < " + high}</span></p>
            </div>
        </div>
    `;
}