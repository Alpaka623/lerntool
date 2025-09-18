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
        
        // --- Interaktive Konsolen-Beispiele für Kontrollstrukturen ---
        const examplesContainer = document.getElementById('control-structure-examples');
        if (examplesContainer) {
            const examples = [
                 {
                    title: 'if-else Anweisung',
                    code: (val) => `int alter = ${val};
if (alter >= 18) {
    System.out.println("Volljährig");
} else {
    System.out.println("Minderjährig");
}`,
                    logic: (val, consoleEl) => {
                        consoleEl.innerHTML = `<p class="text-green-400">> ${val >= 18 ? "Volljährig" : "Minderjährig"}</p>`;
                    },
                    inputValue: 19,
                    label: "Alter:"
                },
                 {
                    title: 'switch Anweisung',
                    code: (val) => `int note = ${val};
String bewertung;
switch (note) {
    case 1: bewertung = "Sehr Gut"; break;
    case 2: bewertung = "Gut"; break;
    default: bewertung = "Andere Note"; break;
}
System.out.println(bewertung);`,
                    logic: (val, consoleEl) => {
                        let bewertung = "";
                        switch (parseInt(val)) {
                            case 1: bewertung = "Sehr Gut"; break;
                            case 2: bewertung = "Gut"; break;
                            default: bewertung = "Andere Note"; break;
                        }
                        consoleEl.innerHTML = `<p class="text-green-400">> ${bewertung}</p>`;
                    },
                    inputValue: 2,
                    label: "Note:"
                },
                {
                    title: 'for-Schleife',
                    code: (val) => `for (int i = 0; i < ${val}; i++) {
    System.out.println("Runde: " + i);
}`,
                    logic: (val, consoleEl) => {
                        let output = '';
                        if (val > 10) val = 10; 
                        for (let i = 0; i < val; i++) {
                            output += `> Runde: ${i}<br>`;
                        }
                        consoleEl.innerHTML = `<p class="text-green-400">${output || '> Schleife nicht betreten.'}</p>`;
                    },
                    inputValue: 4,
                    label: "Anzahl Runden:"
                },
                {
                    title: 'while-Schleife',
                    code: (val) => `int i = ${val};
while (i < 3) {
    System.out.println("Durchlauf: " + i);
    i++;
}`,
                    logic: (val, consoleEl) => {
                        let output = '';
                        let count = 0;
                        while (val < 3 && count < 10) {
                            output += `> Durchlauf: ${val}<br>`;
                            val++;
                            count++;
                        }
                        if (output === '') output = '> Schleife wurde nicht betreten.';
                        consoleEl.innerHTML = `<p class="text-green-400">${output}</p>`;
                    },
                    inputValue: 0,
                    label: "Startwert i:"
                },
                 {
                    title: 'do-while-Schleife',
                    code: (val) => `int i = ${val};
do {
    System.out.println("Zahl: " + i);
    i++;
} while (i < 3);`,
                    logic: (val, consoleEl) => {
                        let output = '';
                        let count = 0;
                        do {
                            output += `> Zahl: ${val}<br>`;
                            val++;
                            count++;
                        } while (val < 3 && count < 10);
                        consoleEl.innerHTML = `<p class="text-green-400">${output}</p>`;
                    },
                    inputValue: 1,
                    label: "Startwert i:"
                }
            ];

            examples.forEach((ex, index) => {
                const id = `console-example-${index}`;
                const div = document.createElement('div');
                div.className = 'p-4 border-t border-gray-700 first:border-t-0';
                div.innerHTML = `
                    <h4 class="text-lg font-semibold text-cyan-300 mb-2">${ex.title}</h4>
                    <div class="grid md:grid-cols-2 gap-6">
                        <div>
                             <div class="font-mono bg-gray-900/70 p-4 rounded-md text-sm"><pre id="${id}-code"><code></code></pre></div>
                        </div>
                        <div class="flex flex-col">
                            <div class="mb-2">
                                <label for="${id}-input">${ex.label}</label>
                                <input type="number" id="${id}-input" class="w-24 p-1 rounded-md ml-2" value="${ex.inputValue}">
                            </div>
                            <div class="bg-black p-4 rounded-md font-mono flex-grow text-gray-300 min-h-[100px]" id="${id}-console"></div>
                        </div>
                    </div>`;
                examplesContainer.appendChild(div);

                const consoleEl = document.getElementById(`${id}-console`);
                const inputEl = document.getElementById(`${id}-input`);
                const codeEl = document.getElementById(`${id}-code`);
                
                const update = () => {
                    const val = parseInt(inputEl.value);
                    if(isNaN(val)) return;
                    codeEl.innerHTML = `<code>${ex.code(val)}</code>`;
                    ex.logic(val, consoleEl);
                };
                
                if (inputEl) inputEl.addEventListener('input', update);
                update();
            });
        }


        // --- Array-Simulator ---
        const arraySizeInput = document.getElementById('array-size-input');
        const arrayValueInputsContainer = document.getElementById('array-value-inputs');
        const arrayVisContainer = document.getElementById('array-visualizer-container');
        const arrayCodeDisplay = document.getElementById('array-code-display');

        function setupArraySimulator() {
            if(!arraySizeInput || !arrayValueInputsContainer || !arrayVisContainer) return;

            const size = Math.min(8, Math.max(1, parseInt(arraySizeInput.value) || 1));
            arrayValueInputsContainer.innerHTML = '';
            let currentValues = [];

            for (let i = 0; i < size; i++) {
                const div = document.createElement('div');
                div.className = "flex items-center gap-2"
                div.innerHTML = `<label for="array-val-${i}" class="whitespace-nowrap">Index [${i}]:</label>
                                 <input type="number" id="array-val-${i}" class="w-full p-1 rounded-md" value="0">`;
                arrayValueInputsContainer.appendChild(div);
                currentValues.push(0);
            }
             renderArrayAndCode(currentValues);

            arrayValueInputsContainer.addEventListener('input', (e) => {
                if (e.target.tagName === 'INPUT') {
                    const updatedValues = [];
                    for (let i = 0; i < size; i++) {
                        const input = document.getElementById(`array-val-${i}`);
                        updatedValues.push(parseInt(input.value) || 0);
                    }
                    renderArrayAndCode(updatedValues);
                }
            });
        }
        
        function renderArrayAndCode(arr) {
            if (!arrayVisContainer || !arr) return;
            arrayVisContainer.innerHTML = '';
            arr.forEach((value, index) => {
                const cell = document.createElement('div');
                cell.className = 'border-2 border-cyan-500 p-2 bg-gray-800 text-center w-14';
                cell.innerHTML = `<div class="text-xs text-gray-400">[${index}]</div><div class="font-bold text-lg">${value}</div>`;
                arrayVisContainer.appendChild(cell);
            });
            
            let code = `// 1. Array deklarieren und erzeugen\nint[] meinArray = new int[${arr.length}];\n\n`;
            code += `// 2. Werte zuweisen\n`;
            arr.forEach((val, i) => {
                code += `meinArray[${i}] = ${val};\n`;
            });
             if(arrayCodeDisplay) arrayCodeDisplay.innerHTML = `<code>${code}</code>`;
        }

        if(arraySizeInput) {
            arraySizeInput.addEventListener('change', setupArraySimulator);
            setupArraySimulator();
        }
        
        // --- 2D-Array-Visualizer ---
        const array2dContainer = document.getElementById('2d-array-visualizer');
        const array2dCodeOutput = document.getElementById('2d-array-code-output');

        function setup2dArray() {
            if(!array2dContainer || !array2dCodeOutput) return;
            const rows = 3, cols = 4;
            array2dContainer.innerHTML = '';
            array2dContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
            
            for(let i=0; i<rows; i++) {
                for(let j=0; j<cols; j++) {
                    const cell = document.createElement('input');
                    cell.type = 'number';
                    cell.value = 0;
                    cell.className = 'w-full p-2 rounded-md text-center';
                    cell.dataset.row = i;
                    cell.dataset.col = j;
                    array2dContainer.appendChild(cell);
                }
            }
            
            const update2dCode = () => {
                let code = '';
                for(let i=0; i<rows; i++) {
                    for(let j=0; j<cols; j++) {
                        const val = document.querySelector(`input[data-row='${i}'][data-col='${j}']`).value;
                        code += `matrix[${i}][${j}] = ${val || 0};\n`;
                    }
                }
                array2dCodeOutput.textContent = code;
            };

            array2dContainer.addEventListener('input', update2dCode);
            update2dCode();
        }
        setup2dArray();

        // --- Selection Sort Visualizer ---
        const selectionSortContainer = document.getElementById('selection-sort-container');
        const selectionSortNextBtn = document.getElementById('selection-sort-next-btn');
        const selectionSortResetBtn = document.getElementById('selection-sort-reset-btn');
        const selectionSortExplanation = document.getElementById('selection-sort-explanation');
        const selectionSortCodeContainer = document.getElementById('selection-sort-code');
        const selectionSortVarsContainer = document.getElementById('selection-sort-vars');
        let sortState = {};

        const sortCodeLines = [
            'public static void selectionSort(int[] arr) {',          // 0
            '  for (int i = 0; i < arr.length - 1; i++) {',      // 1
            '    int minIdx = i;',                                 // 2
            '    for (int j = i + 1; j < arr.length; j++) {',  // 3
            '      if (arr[j] < arr[minIdx]) {',                 // 4
            '        minIdx = j;',                                 // 5
            '      }',                                             // 6
            '    }',                                                 // 7
            '    int temp = arr[minIdx];',                         // 8
            '    arr[minIdx] = arr[i];',                           // 9
            '    arr[i] = temp;',                                  // 10
            '  }',                                                 // 11
            '}'                                                     // 12
        ];
        
        function highlightCodeLine(lineNumber) {
            if(!selectionSortCodeContainer) return;
            selectionSortCodeContainer.innerHTML = sortCodeLines.map((line, index) => 
                `<div class="transition-all ${index === lineNumber ? 'bg-cyan-700 rounded' : ''}">${line.replace(/ /g, '&nbsp;')}</div>`
            ).join('');
        }
        
        function updateVarDisplay(vars) {
            if(!selectionSortVarsContainer) return;
            let html = '<h4>Variablen-Zustand:</h4>';
            Object.entries(vars).forEach(([key, value]) => {
                if(value !== undefined) {
                    html += `<div><span class="text-orange-400">${key}:</span> ${value}</div>`;
                }
            });
            selectionSortVarsContainer.innerHTML = html;
        }

        function* selectionSortGenerator(arr) {
            let vars = { i: undefined, j: undefined, minIdx: undefined, temp: undefined };
            updateVarDisplay(vars);
            highlightCodeLine(0); yield;

            for (let i = 0; i < arr.length - 1; i++) {
                vars.i = i;
                updateVarDisplay(vars);
                highlightCodeLine(1); yield;

                let minIdx = i;
                vars.minIdx = minIdx;
                updateVarDisplay(vars);
                highlightCodeLine(2);
                selectionSortExplanation.textContent = `Äußere Schleife (i=${i}): Suche Minimum im Bereich [${i}...${arr.length-1}]. Bisheriges Minimum ist ${arr[minIdx]} an Position ${minIdx}.`;
                drawSelectionSortBars(arr, { sortedIndex: i, minIndex: minIdx });
                yield;
                
                for (let j = i + 1; j < arr.length; j++) {
                     vars.j = j;
                     updateVarDisplay(vars);
                     highlightCodeLine(3);
                     selectionSortExplanation.textContent = `Innere Schleife (j=${j}): Vergleiche ${arr[j]} mit Minimum ${arr[minIdx]}.`;
                     drawSelectionSortBars(arr, { sortedIndex: i, currentIndex: j, minIndex: minIdx });
                     yield;

                     highlightCodeLine(4); yield;
                    if (arr[j] < arr[minIdx]) {
                        minIdx = j;
                        vars.minIdx = minIdx;
                        updateVarDisplay(vars);
                        highlightCodeLine(5);
                        selectionSortExplanation.textContent = `Neues Minimum gefunden: ${arr[minIdx]} an Position ${minIdx}.`;
                        drawSelectionSortBars(arr, { sortedIndex: i, currentIndex: j, minIndex: minIdx });
                        yield;
                    }
                }
                vars.j = undefined;
                updateVarDisplay(vars);
                 highlightCodeLine(7); yield;
                
                selectionSortExplanation.textContent = `Tausche Minimum (${arr[minIdx]}) mit erstem unsortierten Element (${arr[i]}).`;
                let temp = arr[minIdx];
                vars.temp = temp;
                updateVarDisplay(vars);
                highlightCodeLine(8); yield;

                arr[minIdx] = arr[i];
                highlightCodeLine(9); yield;

                arr[i] = temp;
                vars.temp = undefined;
                updateVarDisplay(vars);
                highlightCodeLine(10); yield;
                drawSelectionSortBars(arr, { sortedIndex: i + 1 });
            }
             vars.i = undefined;
             vars.minIdx = undefined;
             updateVarDisplay(vars);
             highlightCodeLine(12);
            
            selectionSortExplanation.textContent = 'Sortieren abgeschlossen!';
            drawSelectionSortBars(arr, { sortedIndex: arr.length });
            yield;
        }

        function resetSelectionSort() {
            let values = [];
            for (let i = 0; i < 8; i++) {
                values.push(Math.floor(Math.random() * 90) + 10);
            }
            sortState.array = values;
            sortState.generator = selectionSortGenerator(sortState.array);
            drawSelectionSortBars(sortState.array);
            selectionSortExplanation.textContent = 'Bereit. Klicke auf "Nächster Schritt", um zu beginnen.';
            highlightCodeLine(-1);
            updateVarDisplay({});
            if(selectionSortNextBtn) selectionSortNextBtn.disabled = false;
        }

        function drawSelectionSortBars(arr, { sortedIndex = -1, currentIndex = -1, minIndex = -1 } = {}) {
            if (!selectionSortContainer) return;
            selectionSortContainer.innerHTML = '';
            arr.forEach((val, i) => {
                const barWrapper = document.createElement('div');
                barWrapper.className = 'flex flex-col items-center h-full justify-end';
                barWrapper.style.width = `${100 / arr.length}%`;
                
                const bar = document.createElement('div');
                bar.style.height = `${val}%`;
                bar.classList.add('bar', 'w-3/4');
                
                const valueLabel = document.createElement('div');
                valueLabel.className = 'text-xs mt-1';
                valueLabel.textContent = val;
                
                if (i < sortedIndex) { bar.style.backgroundColor = '#2dd4bf'; }
                else if (i === minIndex) { bar.style.backgroundColor = '#facc15'; }
                else if (i === currentIndex) { bar.style.backgroundColor = '#fb923c'; }
                else { bar.style.backgroundColor = '#0891b2'; }

                barWrapper.appendChild(bar);
                barWrapper.appendChild(valueLabel);
                selectionSortContainer.appendChild(barWrapper);
            });
        }
        
        if (selectionSortNextBtn) {
            selectionSortNextBtn.addEventListener('click', () => {
                const result = sortState.generator.next();
                if (result.done) {
                    selectionSortNextBtn.disabled = true;
                }
            });
        }
        if(selectionSortResetBtn) selectionSortResetBtn.addEventListener('click', resetSelectionSort);
        
        resetSelectionSort();
        
        // --- OOP / Vererbungs-Simulator ---
        const oopObjectsContainer = document.getElementById('oop-objects-container');
        const addMitarbeiterBtn = document.getElementById('oop-add-mitarbeiter-btn');
        const addManagerBtn = document.getElementById('oop-add-manager-btn');
        const oopNameInput = document.getElementById('oop-name-input');
        const oopWorkBtn = document.getElementById('oop-work-btn');
        const oopLog = document.getElementById('oop-log');
        
        let mitarbeiterListe = [];
        let nextEmployeeId = 0;

        function logOop(message) {
            if(!oopLog) return;
            oopLog.innerHTML += `> ${message}\n`;
            oopLog.scrollTop = oopLog.scrollHeight;
        }

        function renderOopObjects() {
            if(!oopObjectsContainer) return;
            oopObjectsContainer.innerHTML = '';
            
            if (mitarbeiterListe.length === 0) {
                oopObjectsContainer.innerHTML = '<p class="text-gray-400">Noch keine Mitarbeiter-Objekte erstellt.</p>';
                return;
            }

            mitarbeiterListe.forEach(m => {
                 const div = document.createElement('div');
                 const type = m.isManager ? "Manager" : "Mitarbeiter";
                 const color = m.isManager ? "border-purple-500" : "border-blue-500";
                div.className = `p-4 bg-gray-800/50 rounded-lg border ${color}`;
                div.innerHTML = `<p class="font-semibold text-white">${type}-Objekt (ID: ${m.id})</p>
                                   <p class="text-sm"><span class="text-gray-400">name:</span> "${m.name}"</p>`;
                oopObjectsContainer.appendChild(div);
            });
        }

        function addMitarbeiter(isManager = false) {
             if(mitarbeiterListe.length >= 4) {
                logOop("Fehler: Maximal 4 Mitarbeiter erlaubt.");
                return;
            }
            const name = oopNameInput.value.trim() || `${isManager ? 'Manager' : 'Mitarbeiter'} ${nextEmployeeId}`;
            const newEmployee = {
                id: nextEmployeeId++,
                name: name,
                isManager: isManager
            };
            mitarbeiterListe.push(newEmployee);
            oopNameInput.value = '';
            logOop(`${isManager ? 'Manager' : 'Mitarbeiter'} ${name} (ID ${newEmployee.id}) eingestellt.`);
            renderOopObjects();
        }

        if(addMitarbeiterBtn) addMitarbeiterBtn.addEventListener('click', () => addMitarbeiter(false));
        if(addManagerBtn) addManagerBtn.addEventListener('click', () => addMitarbeiter(true));
        if(oopWorkBtn) oopWorkBtn.addEventListener('click', () => {
             logOop("--- Alle arbeiten lassen (Polymorphie) ---");
             if (mitarbeiterListe.length === 0) {
                 logOop("Keine Mitarbeiter vorhanden.");
                 return;
             }
             mitarbeiterListe.forEach(m => {
                 if (m.isManager) {
                     logOop(`${m.name} delegiert Aufgaben...`); // Überschriebene Methode
                 } else {
                     logOop(`${m.name} arbeitet...`); // Geerbte Methode
                 }
             });
        });
        
        renderOopObjects();
        logOop("Firmen-Simulator für Vererbung bereit.");

        // --- Assoziations-Simulator ---
        const assocAddBtn = document.getElementById('assoc-add-auftrag-btn');
        const assocRemoveBtn = document.getElementById('assoc-remove-auftrag-btn');
        const assocLog = document.getElementById('assoc-log');
        const assocContainer = document.getElementById('assoc-objects-container');
        let kunde = { id: 101, name: "KFZ-Zubehör GmbH", auftraege: [] };
        let nextAuftragId = 1;

        function logAssoc(message) {
            if(assocLog) {
                assocLog.innerHTML += `> ${message}\n`;
                assocLog.scrollTop = assocLog.scrollHeight;
            }
        }

        function renderAssocObjects() {
            if(!assocContainer) return;
            assocContainer.innerHTML = '';

            const kundeDiv = document.createElement('div');
            kundeDiv.className = 'p-3 bg-gray-800/50 rounded-lg border border-cyan-600';
            kundeDiv.innerHTML = `<p class="font-semibold text-white">Kunde-Objekt (ID: ${kunde.id})</p>
                                 <p class="text-sm"><span class="text-gray-400">name:</span> "${kunde.name}"</p>
                                 <p class="text-sm"><span class="text-gray-400">auftraege (Array):</span> [${kunde.auftraege.map(a => `Ref zu ID:${a.id}`).join(', ')}]</p>`;
            assocContainer.appendChild(kundeDiv);

            kunde.auftraege.forEach(a => {
                const div = document.createElement('div');
                div.className = 'p-3 bg-gray-800/50 rounded-lg border border-amber-500 ml-8';
                div.innerHTML = `<p class="font-semibold text-white">Auftrag-Objekt (ID: ${a.id})</p>
                                <p class="text-sm"><span class="text-gray-400">art:</span> "${a.art}"</p>`;
                assocContainer.appendChild(div);
            });
        }

        if(assocAddBtn) assocAddBtn.addEventListener('click', () => {
            if (kunde.auftraege.length >= 5) {
                logAssoc("Fehler: Maximal 5 Aufträge pro Kunde.");
                return;
            }
            const newAuftrag = { id: nextAuftragId++, art: "Beratung" };
            kunde.auftraege.push(newAuftrag);
            logAssoc(`Auftrag ${newAuftrag.id} für Kunde '${kunde.name}' erstellt und Referenz im Array hinzugefügt.`);
            renderAssocObjects();
        });

        if(assocRemoveBtn) assocRemoveBtn.addEventListener('click', () => {
            if(kunde.auftraege.length > 0) {
                const removed = kunde.auftraege.pop();
                logAssoc(`Referenz auf Auftrag ${removed.id} von Kunde '${kunde.name}' entfernt. (Das Auftrag-Objekt existiert noch, wird aber vom Garbage Collector abgeräumt, wenn es keine Referenzen mehr gibt).`);
                renderAssocObjects();
            } else {
                logAssoc("Keine Aufträge zum Entfernen vorhanden.");
            }
        });

        renderAssocObjects();
        logAssoc("Kunde-Objekt initialisiert.");

    }
})();