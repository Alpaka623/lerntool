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

        function updateFromDezimal() {
            const wert = parseInt(dezimalInput.value, 10);
            if (!isNaN(wert)) {
                binaerInput.value = wert.toString(2);
                hexInput.value = wert.toString(16).toUpperCase();
            } else {
                binaerInput.value = '';
                hexInput.value = '';
            }
        }
        function updateFromBinaer() {
            const wert = parseInt(binaerInput.value, 2);
            if (!isNaN(wert) && binaerInput.value.trim() !== '') {
                dezimalInput.value = wert;
                hexInput.value = wert.toString(16).toUpperCase();
            } else {
                dezimalInput.value = '';
                hexInput.value = '';
            }
        }
        function updateFromHex() {
            const wert = parseInt(hexInput.value, 16);
            if (!isNaN(wert) && hexInput.value.trim() !== '') {
                dezimalInput.value = wert;
                binaerInput.value = wert.toString(2);
            } else {
                dezimalInput.value = '';
                binaerInput.value = '';
            }
        }

        if(dezimalInput) dezimalInput.addEventListener('input', updateFromDezimal);
        if(binaerInput) binaerInput.addEventListener('input', updateFromBinaer);
        if(hexInput) hexInput.addEventListener('input', updateFromHex);

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