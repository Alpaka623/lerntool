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
        if (dezimalInput) dezimalInput.addEventListener('input', updateFromDezimal);
        if (binaerInput) binaerInput.addEventListener('input', updateFromBinaer);
        if (hexInput) hexInput.addEventListener('input', updateFromHex);

        // --- Gatter-Explorer ---
        const gatterBtns = document.querySelectorAll('.gatter-btn');
        if (gatterBtns.length > 0) {
            const gateInputA = document.getElementById('gate-input-a');
            const gateInputBContainer = document.getElementById('gate-input-b-container');
            const gateInputB = document.getElementById('gate-input-b');
            const gateValueA = document.getElementById('gate-value-a');
            const gateValueB = document.getElementById('gate-value-b');
            const gateOutputY = document.getElementById('gate-output-y');
            const gateSymbol = document.getElementById('gate-symbol');
            const gateTruthTable = document.getElementById('gate-truth-table');

            const gateData = {
                AND: { symbol: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Logic-gate-and-de.svg', table: [['A','B','Y'],['0','0','0'],['0','1','0'],['1','0','0'],['1','1','1']], logic: (a,b) => a & b, inputs: 2 },
                OR: { symbol: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Or-gate-en.svg/1024px-Or-gate-en.svg.png', table: [['A','B','Y'],['0','0','0'],['0','1','1'],['1','0','1'],['1','1','1']], logic: (a,b) => a | b, inputs: 2 },
                NOT: { symbol: 'https://upload.wikimedia.org/wikipedia/commons/9/9f/Not-gate-en.svg', table: [['A','Y'],['0','1'],['1','0']], logic: a => a ? 0 : 1, inputs: 1 },
                XOR: { symbol: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Xor-gate-en.svg/1024px-Xor-gate-en.svg.png', table: [['A','B','Y'],['0','0','0'],['0','1','1'],['1','0','1'],['1','1','0']], logic: (a,b) => a ^ b, inputs: 2 },
                NAND: { symbol: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Nand-gate-en.svg/1280px-Nand-gate-en.svg.png', table: [['A','B','Y'],['0','0','1'],['0','1','1'],['1','0','1'],['1','1','0']], logic: (a,b) => (a & b) ? 0 : 1, inputs: 2 },
                NOR: { symbol: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/NOR_ANSI_Labelled.svg/1200px-NOR_ANSI_Labelled.svg.png', table: [['A','B','Y'],['0','0','1'],['0','1','0'],['1','0','0'],['1','1','0']], logic: (a,b) => (a | b) ? 0 : 1, inputs: 2 }
            };

            let activeGate = 'AND';

            const updateGate = () => {
                const data = gateData[activeGate];
                const a = gateInputA.checked ? 1 : 0;
                const b = gateInputB.checked ? 1 : 0;

                gateValueA.textContent = a;
                gateValueB.textContent = b;

                gateInputBContainer.style.display = data.inputs === 1 ? 'none' : 'flex';
                gateSymbol.src = data.symbol;

                let tableHTML = '<table class="w-full text-center"><thead><tr>';
                data.table[0].forEach(h => tableHTML += `<th class="p-1 border border-gray-600">${h}</th>`);
                tableHTML += '</tr></thead><tbody>';
                data.table.slice(1).forEach(row => {
                    tableHTML += '<tr>';
                    row.forEach(cell => tableHTML += `<td class="p-1 border border-gray-600 font-mono">${cell}</td>`);
                    tableHTML += '</tr>';
                });
                tableHTML += '</tbody></table>';
                gateTruthTable.innerHTML = tableHTML;

                gateOutputY.textContent = data.logic(a, b);
            };

            gatterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    gatterBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    activeGate = btn.dataset.type;
                    updateGate();
                });
            });

            gateInputA.addEventListener('change', updateGate);
            gateInputB.addEventListener('change', updateGate);
            gatterBtns[0].click();
        }

        // --- Addierer ---
        const haInputA = document.getElementById('ha-input-a');
        const haInputB = document.getElementById('ha-input-b');
        if(haInputA) {
            const updateHalfAdder = () => {
                const a = haInputA.checked ? 1 : 0;
                const b = haInputB.checked ? 1 : 0;
                const sum = a ^ b;
                const carry = a & b;
                document.getElementById('ha-output-s').textContent = sum;
                document.getElementById('ha-output-c').textContent = carry;
            };
            haInputA.addEventListener('change', updateHalfAdder);
            haInputB.addEventListener('change', updateHalfAdder);
            updateHalfAdder();
        }

        const faInputA = document.getElementById('fa-input-a');
        const faInputB = document.getElementById('fa-input-b');
        const faInputCin = document.getElementById('fa-input-cin');
        if(faInputA) {
            const updateFullAdder = () => {
                const a = faInputA.checked ? 1 : 0;
                const b = faInputB.checked ? 1 : 0;
                const cin = faInputCin.checked ? 1 : 0;

                const sum1 = a ^ b;
                const sum = sum1 ^ cin;

                const carry1 = a & b;
                const carry2 = sum1 & cin;
                const cout = carry1 | carry2;

                document.getElementById('fa-output-s').textContent = sum;
                document.getElementById('fa-output-cout').textContent = cout;
            };
            faInputA.addEventListener('change', updateFullAdder);
            faInputB.addEventListener('change', updateFullAdder);
            faInputCin.addEventListener('change', updateFullAdder);
            updateFullAdder();
        }
    }

    // Zusätzliches CSS für die interaktiven Switches
    const style = document.createElement('style');
    style.innerHTML = `
        .switch { position: relative; display: inline-block; width: 50px; height: 28px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #4b5563; transition: .4s; border-radius: 28px; }
        .slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
        input:checked + .slider { background-color: #0891b2; }
        input:checked + .slider:before { transform: translateX(22px); }
    `;
    document.head.appendChild(style);

})();