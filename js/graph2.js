document.addEventListener("click",t=>{t=t.target.closest(".scroll-btn");if(t){var n=t.closest(".btn-wrapper");if(n){n=n.querySelector('input[type="number"]');if(n){var a=n.step?Number(n.step):1,o=""!==n.min?Number(n.min):-1/0,r=""!==n.max?Number(n.max):1/0;let e=Number(n.value)||0;t.classList.contains("left")?e-=a:e+=a,e=Math.max(o,Math.min(r,e)),n.value=e,n.dispatchEvent(new Event("input",{bubbles:!0}))}}}}),createGraphSVG(".graph-container");const graphLine=document.getElementById("graphLine"),dotsGroup=document.getElementById("dotsGroup"),errorMessage=document.getElementById("errorMessage"),graphSVG=document.getElementById("graphSVG"),coefInput=document.getElementById("coef"),bInput=document.getElementById("bValue"),constInput=document.getElementById("constant"),powerRadios=document.querySelectorAll("input[name='power']"),eqDisplay=document.getElementById("equationDisplay");function renderEquation(){var n=parseFloat(coefInput.value)||0,e=parseFloat(bInput.value)||0,t=parseFloat(constInput.value)||0,a=document.querySelector("input[name='power']:checked").value;document.querySelector(".xvalue").style.display="2"==a?"flex":"none";let o="y = ",r="y = ";var s=[],p=[];if(0!==n){let e=(1===n?"":-1===n?"-":n)+"x",t=n+"x";"2"===a&&(e+="²",t+="^2"),s.push(e),p.push(t)}"2"===a&&0!==e&&(n=1===e?"x":-1===e?"-x":e+"x",a=e+"x",0<s.length&&0<e?(s.push("+ "+n),p.push("+"+a)):(s.push(n),p.push(a))),0!==t&&(0<s.length?(s.push((0<t?"+ ":"- ")+Math.abs(t)),p.push((0<t?"+":"")+t)):(s.push(t),p.push(t))),0===s.length?(o+="0",r+="0"):(o+=s.join(" "),r+=p.join("")),eqDisplay.innerHTML=o,updateGraph(r),analyzeQuadratic(r)}function analyzeQuadratic(t){var n=document.getElementById("graphData");let e=t.replace(/\s+/g,"").replace("y=","");t=e=>`<span class="info-icon" data-tip="${e}">?</span>`;let a=0,o=0,r=0;var s=e.match(/([+-]?\d*)x\^2/),p=(s&&(p=s[1],a=""===p||"+"===p?1:"-"===p?-1:parseFloat(p),e=e.replace(s[0],"")),e.match(/([+-]?\d*)x(?!\^)/)),s=(p&&(s=p[1],o=""===s||"+"===s?1:"-"===s?-1:parseFloat(s),e=e.replace(p[0],"")),e.match(/[+-]?\d+(\.\d+)?/));if(s&&(r=parseFloat(s[0])),0===a)p=o,s=r,i=0!==p?(-s/p).toFixed(2):"නැත",n.innerHTML=`
          <div style="font-family: sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 12px; background: #fff;">
              <h2 style="color: #27ae60; margin-top:0;">ප්‍රස්ථාර විශ්ලේෂණය</h2>
              
              <p><strong>1. අනුක්‍රමණය (m):</strong> ${p} ${t("සරල රේඛාවක ඇලවීම මෙලෙස හැඳින්වේ. මෙය ධන නම් රේඛාව ඉහළට යන අතර, සෘණ නම් පහළට යයි.")}</p>
              
              <p><strong>2. y-අන්තඃඛණ්ඩය (c):</strong> ${s} ${t("ප්‍රස්ථාරය y අක්ෂය ඡේදනය කරන ලක්ෂ්‍යයයි.")}</p>
              
              <p><strong>3. x-අන්තඃඛණ්ඩය (මූලය):</strong> ${i} ${t("ප්‍රස්ථාරය x අක්ෂය ඡේදනය කරන ලක්ෂ්‍යයයි. මෙය සෙවීමට y=0 ලෙස ආදේශ කරන්න.")}</p>
              
              <p><strong>4. ස්වභාවය:</strong> ${0<p?"ඉහළට යන රේඛාවකි":p<0?"පහළට යන රේඛාවකි":"තිරස් රේඛාවකි"}</p>
          </div>
      `;else{var l,s=-o/(2*a),i=a*s*s+o*s+r,p=0<a?"අවම":"උපරිම",c=o*o-4*a*r;let e="X අක්ෂය කපන්නේ නැති නිසා තාත්වික මූල නොමැත";0<=c&&(l=((-o+Math.sqrt(c))/(2*a)).toFixed(2),c=((-o-Math.sqrt(c))/(2*a)).toFixed(2),e=l===c?"x = "+l:`x = ${l} , x = `+c),n.innerHTML=`
          <div style="font-family: 'Segoe UI', sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 12px; background: #fff; max-width: 450px;">
              <h2 style="color: #27ae60; margin-top:0;">ප්‍රස්ථාර විශ්ලේෂණය</h2>
              
              <p><strong>1. ස්වභාවය:</strong> ${p} ${t("x² හි සංගුණකය ධන නම් ප්‍රස්ථාරය '∪' හැඩය ද, සෘණ නම් '⋂' හැඩය ද ලැබේ.")}</p>
              
              <p><strong>2. ශීර්ෂය:</strong> (${s.toFixed(2)}, ${i.toFixed(2)}) ${t("ප්‍රස්ථාරය හැරෙන ලක්ෂ්‍යය ශීර්ෂය ලෙස හැඳින්වේ.")}</p>
              
              <p><strong>3. සමමිතිය අක්ෂය:</strong> x = ${s.toFixed(2)} ${t("ප්‍රස්ථාරය හරියටම මැදින් දෙකට බෙදන සිරස් රේඛාව සමමිතිය අක්ෂය ලෙස හැඳින්වේ.")}</p>
              
              <p><strong>4. ${p} අගය:</strong> ${i.toFixed(2)} ${t("ශ්‍රිතයේ ඇති කුඩාම හෝ විශාලම y අගයයි.")}</p>
              
              <p><strong>5. y-අන්තඃඛණ්ඩය:</strong> ${r} ${t("ප්‍රස්ථාරය y අක්ෂය කපාගෙන යන ලක්ෂ්‍යයයි.")}</p>
              
              <p><strong>6. මූලයන්:</strong> <span style="color: #27ae60;">${e}</span> ${t("ප්‍රස්ථාරය x අක්ෂය ඡේදනය කරන ලක්ෂ්‍යයන්හි x අගයන් මූලයන් ලෙස හැඳින්වේ.")}</p>
          </div>
      `}}[coefInput,bInput,constInput].forEach(e=>{e.addEventListener("input",renderEquation)}),powerRadios.forEach(e=>{e.addEventListener("change",renderEquation)}),renderEquation(),document.querySelectorAll(".accordion > li").forEach(e=>{e.addEventListener("click",function(e){e.stopPropagation();var t,e=this.querySelector(":scope > .lcontent");e&&(t=this.classList.contains("active"),document.querySelectorAll(".accordion > li").forEach(e=>{e.classList.remove("active");e=e.querySelector(":scope > .lcontent");e&&(e.style.maxHeight=null)}),t||(this.classList.add("active"),e.style.maxHeight=e.scrollHeight+"px"))})});
