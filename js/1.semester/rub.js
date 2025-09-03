(() => {
    sessionStorage.setItem('selectedSemester', '1');
    const backBtn = document.querySelector('.back-to-hub-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('navigate-back'));
        });
    }

    if (document.getElementById('rub-app')) {
        setupRub();
    }

    function setupRub() {
        // --- Navigation ---
        const navButtons = document.querySelectorAll('.rub-nav-button');
        const contentSections = document.querySelectorAll('.rub-content-section');

        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetId = button.dataset.rubTarget;
                navButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                contentSections.forEach(section => {
                    section.classList.remove('active');
                    if (section.id === targetId) {
                        section.classList.add('active');
                    }
                });
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
                    result += `1. Betrag der Zahl (${posVal}) binär: ${posBin}<br>`;
                    
                    const inverted = posBin.split('').map(bit => bit === '1' ? '0' : '1').join('');
                    result += `2. Alle Bits invertieren (Einerkomplement): ${inverted}<br>`;
                    
                    const twos = (parseInt(inverted, 2) + 1).toString(2).padStart(8, '0');
                    result += `3. 1 addieren (Ergebnis):<br><b>${twos}</b>`;
                }
                twosComplementResult.innerHTML = result;
            });
             twosComplementInput.dispatchEvent(new Event('input'));
        }

        // --- Carry-Ripple-Addierer ---
        const adderAInput = document.getElementById('adder-a');
        const adderBInput = document.getElementById('adder-b');
        const adderVisContainer = document.getElementById('adder-visualization');

        function updateAdder() {
            if (!adderVisContainer) return;
            let aStr = adderAInput.value.replace(/[^01]/g, '').padStart(4, '0');
            let bStr = adderBInput.value.replace(/[^01]/g, '').padStart(4, '0');
            let a = aStr.split('').map(Number);
            let b = bStr.split('').map(Number);
            
            let carries = [0, 0, 0, 0, 0];
            let sums = [0, 0, 0, 0];
            let carry = 0;

            for (let i = 3; i >= 0; i--) {
                const sum_val = a[i] + b[i] + carry;
                sums[i] = sum_val % 2;
                carry = Math.floor(sum_val / 2);
                carries[i] = carry;
            }

            // Visualisierung erstellen
            let html = `
                <div class="font-mono text-lg tracking-widest grid grid-cols-5 gap-2 w-64 text-center">
                    <div class="text-gray-400 self-end text-sm">Übertrag:</div>
                    <div class="text-amber-400">${carries[0]}</div>
                    <div class="text-amber-400">${carries[1]}</div>
                    <div class="text-amber-400">${carries[2]}</div>
                    <div class="text-amber-400">${carries[3]}</div>
                    <div class="text-gray-400 self-end">A:</div>
                    <div>${a[0]}</div><div>${a[1]}</div><div>${a[2]}</div><div>${a[3]}</div>
                    <div class="text-gray-400 self-end">B:</div>
                    <div>${b[0]}</div><div>${b[1]}</div><div>${b[2]}</div><div>${b[3]}</div>
                    <div class="col-span-5 border-t border-gray-600 my-1"></div>
                    <div class="text-gray-400 self-end">Summe:</div>
                    <div class="text-cyan-400 font-bold">${sums[0]}</div>
                    <div class="text-cyan-400 font-bold">${sums[1]}</div>
                    <div class="text-cyan-400 font-bold">${sums[2]}</div>
                    <div class="text-cyan-400 font-bold">${sums[3]}</div>
                </div>
                <div class="mt-4 text-center font-mono">
                    Ergebnis: <b>${carries[0]}${sums.join('')}</b> (binär) = <b>${parseInt(carries[0] + sums.join(''), 2)}</b> (dezimal)
                </div>`;
            adderVisContainer.innerHTML = html;
        }

        if (adderAInput && adderBInput) {
            adderAInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^01]/g, '');
                updateAdder();
            });
            adderBInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^01]/g, '');
                updateAdder();
            });
            updateAdder();
        }
    }
})();