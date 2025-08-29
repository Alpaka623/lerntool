(() => {
    sessionStorage.setItem('selectedSemester', '1');
    const backBtn = document.querySelector('.back-to-hub-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('navigate-back'));
        });
    }

    if (document.getElementById('eidp-app')) {
        setupEidp();
    }

    function setupEidp() {
        // --- Navigation ---
        const navButtons = document.querySelectorAll('.eidp-nav-button');
        const contentSections = document.querySelectorAll('.eidp-content-section');

        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetId = button.dataset.eidpTarget;
                navButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                contentSections.forEach(section => {
                    section.classList.remove('active');
                    if (section.id === targetId) {
                        section.classList.add('active');
                    }
                });
                if (window.MathJax) {
                    MathJax.typesetPromise();
                }
            });
        });

        // --- Zahlensystem-Umrechner ---
        const dezimalInput = document.getElementById('dezimal-input');
        const binaerInput = document.getElementById('binaer-input');
        const hexInput = document.getElementById('hex-input');

        if(dezimalInput) dezimalInput.addEventListener('input', () => {
            const wert = parseInt(dezimalInput.value, 10);
            if (!isNaN(wert)) {
                binaerInput.value = wert.toString(2);
                hexInput.value = wert.toString(16).toUpperCase();
            } else {
                binaerInput.value = '';
                hexInput.value = '';
            }
        });
        if(binaerInput) binaerInput.addEventListener('input', () => {
            const wert = parseInt(binaerInput.value, 2);
            if (!isNaN(wert) && binaerInput.value.trim() !== '') {
                dezimalInput.value = wert;
                hexInput.value = wert.toString(16).toUpperCase();
            } else {
                dezimalInput.value = '';
                hexInput.value = '';
            }
        });
        if(hexInput) hexInput.addEventListener('input', () => {
            const wert = parseInt(hexInput.value, 16);
            if (!isNaN(wert) && hexInput.value.trim() !== '') {
                dezimalInput.value = wert;
                binaerInput.value = wert.toString(2);
            } else {
                dezimalInput.value = '';
                binaerInput.value = '';
            }
        });

        // --- Token-Quiz ---
        const tokenSpans = document.querySelectorAll('#token-quiz-code span');
        const tokenResultDiv = document.getElementById('token-quiz-result');

        if (tokenSpans.length > 0 && tokenResultDiv) {
            tokenSpans.forEach(span => {
                span.addEventListener('click', () => {
                    const type = span.dataset.tokenType;
                    const desc = span.dataset.tokenDesc;
                    tokenResultDiv.innerHTML = `<strong class="text-cyan-400">${type}:</strong> ${desc}`;
                    tokenSpans.forEach(s => s.classList.remove('bg-cyan-700', 'rounded', 'p-1'));
                    span.classList.add('bg-cyan-700', 'rounded', 'p-1');
                });
            });
        }
        
        // --- Zweierkomplement-Rechner ---
        const twosComplementInput = document.getElementById('twos-complement-input');
        const twosComplementResult = document.getElementById('twos-complement-result');
        if (twosComplementInput) {
            twosComplementInput.addEventListener('input', () => {
                const num = parseInt(twosComplementInput.value);
                if (isNaN(num) || num < -128 || num > 127) {
                    twosComplementResult.textContent = 'Bitte eine Zahl zwischen -128 und 127 eingeben.';
                    return;
                }
                
                let result = '';
                if (num >= 0) {
                    const bin = num.toString(2).padStart(8, '0');
                    result = `Positive Zahl: Direkte Binärdarstellung<br><b>${bin}</b>`;
                } else {
                    const posVal = -num;
                    const posBin = posVal.toString(2).padStart(8, '0');
                    result += `1. Positive Zahl (${posVal}) binär: ${posBin}<br>`;
                    
                    const inverted = posBin.split('').map(bit => bit === '1' ? '0' : '1').join('');
                    result += `2. Alle Bits invertieren (Einerkomplement): ${inverted}<br>`;
                    
                    const twos = (parseInt(inverted, 2) + 1).toString(2).padStart(8, '0');
                    result += `3. 1 addieren:<br><b>${twos}</b>`;
                }
                twosComplementResult.innerHTML = result;
            });
        }

        // --- Expression Visualizer ---
        const expressionInput = document.getElementById('expression-input');
        const expressionResult = document.getElementById('expression-result');
        if (expressionInput) {
            expressionInput.addEventListener('input', () => {
                const expr = expressionInput.value;
                // Simple logic for visualization based on precedence
                let result = expr.replace(/([a-zA-Z0-9]+)\s*([\*\/])\s*([a-zA-Z0-9]+)/g, '($1 $2 $3)');
                result = result.replace(/([a-zA-Z0-9\(\)\s\*\/\"]+)\s*([\+\-])\s*([a-zA-Z0-9\(\)\s\*\/\"]+)/g, '($1 $2 $3)');
                 result = result.replace(/\s*(=)\s*/g, ' $1 ');

                expressionResult.textContent = result;
            });
        }

        // --- Ein-/Ausgabe Beispiel ---
        const runCodeBtn = document.getElementById('run-code-btn');
        const userInputName = document.getElementById('user-input-name');
        const konsole = document.getElementById('eingabe-konsole');

        function runCode() {
             const name = userInputName.value.trim();
                if (name && konsole) {
                    const oldOutput = konsole.querySelector('.output');
                    if(oldOutput) oldOutput.remove();

                    const output = document.createElement('p');
                    output.className = 'output text-green-400';
                    output.textContent = `> Hallo, ${name}!`;
                    konsole.appendChild(output);
                    userInputName.value = ''; 
                }
        }

        if (runCodeBtn && userInputName) {
            runCodeBtn.addEventListener('click', runCode);
            userInputName.addEventListener('keypress', (e) => {
                if(e.key === 'Enter') {
                    runCode();
                }
            });
        }
    }
})();