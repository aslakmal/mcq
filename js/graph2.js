document.addEventListener("click",t=>{t=t.target.closest(".scroll-btn");if(t){var a=t.closest(".btn-wrapper");if(a){a=a.querySelector('input[type="number"]');if(a){var r=a.step?Number(a.step):1,n=""!==a.min?Number(a.min):-1/0,o=""!==a.max?Number(a.max):1/0;let e=Number(a.value)||0;t.classList.contains("left")?e-=r:e+=r,e=Math.max(n,Math.min(o,e)),a.value=e,a.dispatchEvent(new Event("input",{bubbles:!0}))}}}}),createGraphSVG(".graph-container");const graphLine=document.getElementById("graphLine"),dotsGroup=document.getElementById("dotsGroup"),errorMessage=document.getElementById("errorMessage"),graphSVG=document.getElementById("graphSVG"),coefInput=document.getElementById("coef"),bInput=document.getElementById("bValue"),constInput=document.getElementById("constant"),powerRadios=document.querySelectorAll("input[name='power']"),eqDisplay=document.getElementById("equationDisplay");function renderEquation(){var a=parseFloat(coefInput.value)||0,e=parseFloat(bInput.value)||0,t=parseFloat(constInput.value)||0,r=document.querySelector("input[name='power']:checked").value;document.querySelector(".xvalue").style.display="2"==r?"flex":"none";let n="y = ",o="y = ";var s=[],l=[];if(0!==a){let e=(1===a?"":-1===a?"-":a)+"x",t=a+"x";"2"===r&&(e+="²",t+="^2"),s.push(e),l.push(t)}"2"===r&&0!==e&&(a=1===e?"x":-1===e?"-x":e+"x",r=e+"x",0<s.length&&0<e?(s.push("+ "+a),l.push("+"+r)):(s.push(a),l.push(r))),0!==t&&(0<s.length?(s.push((0<t?"+ ":"- ")+Math.abs(t)),l.push((0<t?"+":"")+t)):(s.push(t),l.push(t))),0===s.length?(n+="0",o+="0"):(n+=s.join(" "),o+=l.join("")),eqDisplay.innerHTML=n,updateGraph(o),analyzeQuadratic(o),generateTable(o)}function analyzeQuadratic(t){var a=document.getElementById("graphData");let e=t.replace(/\s+/g,"").replace("y=","");t=e=>`<span class="info-icon" data-tip="${e}">?</span>`;let r=0,n=0,o=0;var s=e.match(/([+-]?\d*)x\^2/),l=(s&&(l=s[1],r=""===l||"+"===l?1:"-"===l?-1:parseFloat(l),e=e.replace(s[0],"")),e.match(/([+-]?\d*)x(?!\^)/)),s=(l&&(s=l[1],n=""===s||"+"===s?1:"-"===s?-1:parseFloat(s),e=e.replace(l[0],"")),e.match(/[+-]?\d+(\.\d+)?/));if(s&&(o=parseFloat(s[0])),0===r)l=n,s=o,d=0!==l?(-s/l).toFixed(2):"නැත",a.innerHTML=`
          <div style="font-family: sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 12px; background: #fff;">
              <h2 style="color: #27ae60; margin-top:0;">ප්‍රස්ථාර විශ්ලේෂණය</h2>
              
              <p><strong>1. අනුක්‍රමණය (m):</strong> ${l} ${t("සරල රේඛාවක ඇලවීම මෙලෙස හැඳින්වේ. මෙය ධන නම් රේඛාව ඉහළට යන අතර, සෘණ නම් පහළට යයි.")}</p>
              
              <p><strong>2. y-අන්තඃඛණ්ඩය (c):</strong> ${s} ${t("ප්‍රස්ථාරය y අක්ෂය ඡේදනය කරන ලක්ෂ්‍යයයි.")}</p>
              
              <p><strong>3. x-අන්තඃඛණ්ඩය (මූලය):</strong> ${d} ${t("ප්‍රස්ථාරය x අක්ෂය ඡේදනය කරන ලක්ෂ්‍යයයි. මෙය සෙවීමට y=0 ලෙස ආදේශ කරන්න.")}</p>
              
              <p><strong>4. ස්වභාවය:</strong> ${0<l?"ඉහළට යන රේඛාවකි":l<0?"පහළට යන රේඛාවකි":"තිරස් රේඛාවකි"}</p>
          </div>
      `;else{var p,s=-n/(2*r),d=r*s*s+n*s+o,l=0<r?"අවම":"උපරිම",i=n*n-4*r*o;let e="X අක්ෂය කපන්නේ නැති නිසා තාත්වික මූල නොමැත";0<=i&&(p=((-n+Math.sqrt(i))/(2*r)).toFixed(2),i=((-n-Math.sqrt(i))/(2*r)).toFixed(2),e=p===i?"x = "+p:`x = ${p} , x = `+i),a.innerHTML=`
          <div style="font-family: 'Segoe UI', sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 12px; background: #fff; max-width: 450px;">
              <h2 style="color: #27ae60; margin-top:0;">ප්‍රස්ථාර විශ්ලේෂණය</h2>
              
              <p><strong>1. ස්වභාවය:</strong> ${l} ${t("x² හි සංගුණකය ධන නම් ප්‍රස්ථාරය '∪' හැඩය ද, සෘණ නම් '⋂' හැඩය ද ලැබේ.")}</p>
              
              <p><strong>2. ශීර්ෂය:</strong> (${s.toFixed(2)}, ${d.toFixed(2)}) ${t("ප්‍රස්ථාරය හැරෙන ලක්ෂ්‍යය ශීර්ෂය ලෙස හැඳින්වේ.")}</p>
              
              <p><strong>3. සමමිතිය අක්ෂය:</strong> x = ${s.toFixed(2)} ${t("ප්‍රස්ථාරය හරියටම මැදින් දෙකට බෙදන සිරස් රේඛාව සමමිතිය අක්ෂය ලෙස හැඳින්වේ.")}</p>
              
              <p><strong>4. ${l} අගය:</strong> ${d.toFixed(2)} ${t("ශ්‍රිතයේ ඇති කුඩාම හෝ විශාලම y අගයයි.")}</p>
              
              <p><strong>5. y-අන්තඃඛණ්ඩය:</strong> ${o} ${t("ප්‍රස්ථාරය y අක්ෂය කපාගෙන යන ලක්ෂ්‍යයයි.")}</p>
              
              <p><strong>6. මූලයන්:</strong> <span style="color: #27ae60;">${e}</span> ${t("ප්‍රස්ථාරය x අක්ෂය ඡේදනය කරන ලක්ෂ්‍යයන්හි x අගයන් මූලයන් ලෙස හැඳින්වේ.")}</p>
          </div>
      `}}function generateTable(e){var t=document.getElementById("valuetbl");let a=e.replace(/\s+/g,"").replace("y=",""),r=0,n=0,o=0;var e=a.match(/([+-]?\d*)x\^2/),s=(e&&(s=e[1],r=""===s||"+"===s?1:"-"===s?-1:parseFloat(s),a=a.replace(e[0],"")),a.match(/([+-]?\d*)x(?!\^)/)),e=(s&&(e=s[1],n=""===e||"+"===e?1:"-"===e?-1:parseFloat(e),a=a.replace(s[0],"")),a.match(/[+-]?\d+(\.\d+)?/)),s=(e&&(o=parseFloat(e[0])),[-3,-2,-1,0,1,2,3]),e=`
        <div style="margin-top: 20px; font-family: sans-serif;">
            <h4 style="color: #34495e;">ඛණ්ඩාංක වගුව (x, y අගයන්)</h4>
            <div style="overflow-x: auto;">
                <table border="1" style="width: 100%; border-collapse: collapse; text-align: center; background: white;">
                    <tr style="background: #ecf0f1;">
                        <th style="padding: 10px; border: 1px solid #bdc3c7;">x</th>
                        ${s.map(e=>`<td style="padding: 10px; border: 1px solid #bdc3c7;">${e}</td>`).join("")}
                    </tr>
                    <tr>
                        <th style="padding: 10px; border: 1px solid #bdc3c7;">y</th>
                        ${s.map(e=>{return`<td style="padding: 10px; border: 1px solid #bdc3c7; font-weight: bold; color: #2980b9;">${r*e*e+n*e+o}</td>`}).join("")}
                    </tr>
                </table>
            </div>
         </div>
    `;t.innerHTML=e}function analyzeRange(e){var t=document.getElementById("rangeDetails");let a=e.replace(/\s+/g,"").replace("y=",""),r=0,n=0,o=0;var s,l,e=a.match(/([+-]?\d*)x\^2/),p=(e&&(p=e[1],r=""===p||"+"===p?1:"-"===p?-1:parseFloat(p),a=a.replace(e[0],"")),a.match(/([+-]?\d*)x(?!\^)/)),e=(p&&(e=p[1],n=""===e||"+"===e?1:"-"===e?-1:parseFloat(e),a=a.replace(p[0],"")),a.match(/[+-]?\d+(\.\d+)?/)),p=(e&&(o=parseFloat(e[0])),n*n-4*r*o);p<=0?t.innerHTML="<p>තාත්වික මූල පවතින ශ්‍රිතයක් ඇතුළත් කරන්න.</p>":(e=(-n+Math.sqrt(p))/(2*r),p=(-n-Math.sqrt(p))/(2*r),s=Math.min(e,p).toFixed(1),e=Math.max(e,p).toFixed(1),p=s<0?`(x + ${Math.abs(s)})`:`(x - ${s})`,l=e<0?`(x + ${Math.abs(e)})`:`(x - ${e})`,t.innerHTML=`
        <div style="font-family: sans-serif; line-height: 1.6; color: #2c3e50;">
            <h3 style="color: #2980b9;">වීජීය ක්‍රමයට පරාසය සෙවීම (Algebraic Method)</h3>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #dee2e6;">
                <p><strong>පියවර 1: ශ්‍රිතය සාධක වලට වෙන් කරන්න.</strong><br>
                y = ${1!==r?r:""}${p}${l}</p>

                <p><strong>පියවර 2: ශ්‍රිතය ශුන්‍ය වන අගයන් (මූලයන්) සොයන්න.</strong><br>
                මෙහිදී x = ${s} සහ x = ${e} වේ.</p>

                <p><strong>පියවර 3: සංඛ්‍යා රේඛාව මත ලකුණු පරීක්ෂා කරන්න.</strong><br>
                අපි පරාස 3ක් සලකා බලමු:</p>
                <ul style="list-style: none; padding-left: 10px;">
                    <li>1. x < ${s} විට</li>
                    <li>2. ${s} < x < ${e} විට</li>
                    <li>3. x > ${e} විට</li>
                </ul>
            </div>

            <div style="margin-top: 15px; padding: 15px; background: #e8f4fd; border-radius: 8px;">
                <h4 style="margin-top: 0;">අවසාන නිගමනය:</h4>
                <p><b>y සෘණ වන පරාසය (y < 0):</b><br>
                සාධක දෙකේ ගුණිතය සෘණ විය යුතුය. <br>
                <span style="font-size: 18px; color: #e74c3c; font-weight: bold;">${0<r?s+" < x < "+e:"x < "+s+" හෝ x > "+e}</span></p>

                <p><b>y ධන වන පරාසය (y > 0):</b><br>
                සාධක දෙකේ ගුණිතය ධන විය යුතුය. <br>
                <span style="font-size: 18px; color: #27ae60; font-weight: bold;">${0<r?"x < "+s+" හෝ x > "+e:s+" < x < "+e}</span></p>
            </div>
        </div>
    `)}[coefInput,bInput,constInput].forEach(e=>{e.addEventListener("input",renderEquation)}),powerRadios.forEach(e=>{e.addEventListener("change",renderEquation)}),renderEquation(),document.querySelectorAll(".accordion > li").forEach(e=>{e.addEventListener("click",function(e){e.stopPropagation();var t,e=this.querySelector(":scope > .lcontent");e&&(t=this.classList.contains("active"),document.querySelectorAll(".accordion > li").forEach(e=>{e.classList.remove("active");e=e.querySelector(":scope > .lcontent");e&&(e.style.maxHeight=null)}),t||(this.classList.add("active"),e.style.maxHeight=e.scrollHeight+"px"))})});
