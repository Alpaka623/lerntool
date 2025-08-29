(() => {
    sessionStorage.setItem('selectedSemester', '1');
    const backBtn = document.querySelector('.back-to-hub-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('navigate-back'));
        });
    }

    if (!document.getElementById('mafi1-app')) return;

    const navButtons = document.querySelectorAll('.mafi-nav-button');
    const contentSections = document.querySelectorAll('.mafi-content-section');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.dataset.mafiTarget;
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            contentSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) section.classList.add('active');
            });
            if (window.MathJax) {
                MathJax.typesetPromise();
            }
        });
    });

    // --- Aussagenlogik ---
    const wahrheitstabelleContainer = document.getElementById('wahrheitstabelle-container');
    const verknüpfungBtns = document.querySelectorAll('.verknüpfung-btn');

    const wahrheitstabellen = {
        and: {
            headers: ['A', 'B', 'A ∧ B'],
            rows: [
                ['w', 'w', 'w'], ['w', 'f', 'f'],
                ['f', 'w', 'f'], ['f', 'f', 'f']
            ]
        },
        or: {
            headers: ['A', 'B', 'A ∨ B'],
            rows: [
                ['w', 'w', 'w'], ['w', 'f', 'w'],
                ['f', 'w', 'w'], ['f', 'f', 'f']
            ]
        },
        implies: {
            headers: ['A', 'B', 'A ⇒ B'],
            rows: [
                ['w', 'w', 'w'], ['w', 'f', 'f'],
                ['f', 'w', 'w'], ['f', 'f', 'w']
            ]
        },
        iff: {
            headers: ['A', 'B', 'A ⇔ B'],
            rows: [
                ['w', 'w', 'w'], ['w', 'f', 'f'],
                ['f', 'w', 'f'], ['f', 'f', 'w']
            ]
        }
    };

    function displayWahrheitstabelle(op) {
        if (!wahrheitstabelleContainer) return;
        const data = wahrheitstabellen[op];
        let tableHTML = '<table class="w-full text-center math-table"><thead><tr>';
        data.headers.forEach(h => tableHTML += `<th class="table-header">${h}</th>`);
        tableHTML += '</tr></thead><tbody>';
        data.rows.forEach(row => {
            tableHTML += '<tr class="hover:bg-gray-700/50">';
            row.forEach(cell => {
                const isTrue = cell === 'w';
                tableHTML += `<td class="table-cell ${isTrue ? 'text-green-400' : 'text-red-400'}">${isTrue ? 'wahr' : 'falsch'}</td>`;
            });
            tableHTML += '</tr>';
        });
        tableHTML += '</tbody></table>';
        wahrheitstabelleContainer.innerHTML = tableHTML;
    }

    verknüpfungBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            verknüpfungBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            displayWahrheitstabelle(btn.dataset.op);
        });
    });

    if (verknüpfungBtns.length > 0) {
        verknüpfungBtns[0].click();
    }


    // --- Mengenlehre ---
    const mengenOpBtns = document.querySelectorAll('.mengen-op-btn');
    const vennSvg = document.getElementById('venn-svg');

    function updateVennDiagram(op) {
        if (!vennSvg) return;
        const circleA = { cx: 80, cy: 75, r: 50 };
        const circleB = { cx: 120, cy: 75, r: 50 };

        vennSvg.innerHTML = `
            <defs>
                <mask id="maskA"><circle cx="${circleA.cx}" cy="${circleA.cy}" r="${circleA.r}" fill="white" /></mask>
                <mask id="maskB"><circle cx="${circleB.cx}" cy="${circleB.cy}" r="${circleB.r}" fill="white" /></mask>
            </defs>
            <circle cx="${circleA.cx}" cy="${circleA.cy}" r="${circleA.r}" fill="rgba(8, 145, 178, 0.3)" stroke="#0891b2" stroke-width="2"/>
            <circle cx="${circleB.cx}" cy="${circleB.cy}" r="${circleB.r}" fill="rgba(244, 114, 182, 0.3)" stroke="#f472b6" stroke-width="2"/>
            <text x="50" y="75" class="font-bold fill-current text-cyan-200">A</text>
            <text x="150" y="75" class="font-bold fill-current text-pink-200">B</text>
        `;

        let resultShape = '';
        switch(op) {
            case 'union':
                resultShape = `<g>
                    <circle cx="${circleA.cx}" cy="${circleA.cy}" r="${circleA.r}" fill="#2dd4bf" />
                    <circle cx="${circleB.cx}" cy="${circleB.cy}" r="${circleB.r}" fill="#2dd4bf" />
                </g>`;
                break;
            case 'intersection':
                resultShape = `<g mask="url(#maskA)">
                    <circle cx="${circleB.cx}" cy="${circleB.cy}" r="${circleB.r}" fill="#2dd4bf" />
                </g>`;
                break;
            case 'diff_ab':
                resultShape = `<g mask="url(#maskA)">
                    <rect x="0" y="0" width="200" height="150" fill="#2dd4bf" />
                    <circle cx="${circleB.cx}" cy="${circleB.cy}" r="${circleB.r}" fill="black" />
                </g>`;
                break;
            case 'diff_ba':
                resultShape = `<g mask="url(#maskB)">
                    <rect x="0" y="0" width="200" height="150" fill="#2dd4bf" />
                    <circle cx="${circleA.cx}" cy="${circleA.cy}" r="${circleA.r}" fill="black" />
                </g>`;
                break;
        }
        vennSvg.insertAdjacentHTML('beforeend', `<g style="opacity:0.7">${resultShape}</g>`);
    }
    mengenOpBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            mengenOpBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateVennDiagram(btn.dataset.op);
        });
    });

    if (mengenOpBtns.length > 0) {
        mengenOpBtns[0].click();
    }

    // --- Abbildungen ---
    const abbBtns = document.querySelectorAll('.abb-btn');
    const abbVis = document.getElementById('abbildung-visualisierung');
    const abbErkl = document.getElementById('abbildung-erklaerung');

    // KORRIGIERTE DATENSTRUKTUR
    const abbData = {
        injektiv: {
            def: "<strong>Injektiv:</strong> Jedes Element der Wertemenge wird <strong>höchstens einmal</strong> getroffen. Verschiedene Elemente aus A werden immer auf verschiedene Elemente in B abgebildet.",
            a_size: 3,
            b_size: 4,
            map: [[0,0], [1,1], [2,3]]
        },
        surjektiv: {
            def: "<strong>Surjektiv:</strong> Jedes Element der Wertemenge wird <strong>mindestens einmal</strong> getroffen. Das Bild der Funktion ist also die gesamte Wertemenge.",
            a_size: 4,
            b_size: 3,
            map: [[0,0], [1,1], [2,2], [3,0]]
        },
        bijektiv: {
            def: "<strong>Bijektiv:</strong> Jedes Element der Wertemenge wird <strong>genau einmal</strong> getroffen. Die Abbildung ist sowohl injektiv als auch surjektiv.",
            a_size: 3,
            b_size: 3,
            map: [[0,0], [1,2], [2,1]]
        },
        nichts: {
            def: "<strong>Allgemeine Abbildung:</strong> Weder injektiv (y=0 wird doppelt getroffen) noch surjektiv (y=3 wird nicht getroffen).",
            a_size: 4,
            b_size: 4,
            map: [[0,0], [1,1], [2,2], [3,0]]
        }
    };

    // KORRIGIERTE FUNKTION
    function displayAbbildung(type) {
        if (!abbVis || !abbErkl) return;
        const data = abbData[type];

        const a_count = data.a_size;
        const b_count = data.b_size;

        let svgHTML = `<svg width="100%" height="100%" viewBox="0 0 150 120">`;
        svgHTML += `<text x="20" y="10" class="font-bold fill-current text-cyan-200">A</text>`;
        svgHTML += `<text x="125" y="11" class="font-bold fill-current text-pink-200">B</text>`;

        // Dynamische Positionierung der Punkte
        const y_offset_a = 100 / (a_count + 1);
        const y_offset_b = 100 / (b_count + 1);

        for (let i = 0; i < a_count; i++) {
            svgHTML += `<circle cx="20" cy="${15 + y_offset_a * i}" r="5" class="fill-current text-cyan-400"/>`;
        }
        for (let i = 0; i < b_count; i++) {
            svgHTML += `<circle cx="130" cy="${15 + y_offset_b * i}" r="5" class="fill-current text-pink-400"/>`;
        }

        data.map.forEach(([from, to]) => {
            svgHTML += `<line x1="25" y1="${15 + y_offset_a * from}" x2="125" y2="${15 + y_offset_b * to}" stroke="#9ca3af" stroke-width="1"/>`;
        });

        svgHTML += `</svg>`;
        abbVis.innerHTML = svgHTML;
        abbErkl.innerHTML = data.def;
    }

    abbBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            abbBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            displayAbbildung(btn.dataset.type);
        });
    });
    if (abbBtns.length > 0) {
        abbBtns[0].click();
    }

    // --- Modulare Arithmetik ---
    const calculateModBtn = document.getElementById('calculate-mod-btn');

    function handleModCalculation() {
        if (!document.getElementById('mod-a')) return;
        try {
            const a = parseInt(document.getElementById('mod-a').value);
            const b = parseInt(document.getElementById('mod-b').value);
            const n = parseInt(document.getElementById('mod-n').value);
            const op = document.getElementById('mod-op').value;
            if (isNaN(a) || isNaN(b) || isNaN(n) || n <= 0) {
                document.getElementById('mod-result').textContent = "Bitte gültige ganze Zahlen eingeben (n > 0).";
                return;
            }

            let result;
            switch(op) {
                case '+': result = (a + b) % n; break;
                case '-': result = (a - b) % n; break;
                case '*': result = (a * b) % n; break;
            }
            if (result < 0) result += n; // Stelle sicher, dass das Ergebnis positiv ist

            document.getElementById('mod-result').textContent = `${a} ${op} ${b} ≡ ${result} (mod ${n})`;
        } catch(e) {
            document.getElementById('mod-result').textContent = "Fehler bei der Berechnung.";
        }
    }

    if(calculateModBtn) {
        const modInputs = ['mod-a', 'mod-b', 'mod-n', 'mod-op'];
        modInputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.addEventListener('input', handleModCalculation);
        });

        calculateModBtn.addEventListener('click', handleModCalculation);
        handleModCalculation(); // Initiale Berechnung
    }

})();