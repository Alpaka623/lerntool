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

    function displayAbbildung(type) {
        if (!abbVis || !abbErkl) return;
        const data = abbData[type];

        const a_count = data.a_size;
        const b_count = data.b_size;

        let svgHTML = `<svg width="100%" height="100%" viewBox="0 0 150 120">`;
        svgHTML += `<text x="20" y="10" class="font-bold fill-current text-cyan-200">A</text>`;
        svgHTML += `<text x="125" y="10" class="font-bold fill-current text-pink-200">B</text>`;

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
            if (result < 0) result += n;

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
        handleModCalculation();
    }

    // --- Komplexe Zahlen ---
    const calculateCompBtn = document.getElementById('calculate-comp-btn');

    function handleCompCalculation() {
        if (!document.getElementById('comp-a1')) return;
        try {
            const a1 = parseFloat(document.getElementById('comp-a1').value);
            const b1 = parseFloat(document.getElementById('comp-b1').value);
            const a2 = parseFloat(document.getElementById('comp-a2').value);
            const b2 = parseFloat(document.getElementById('comp-b2').value);
            const op = document.getElementById('comp-op').value;

            let res_a, res_b;

            switch(op) {
                case '+': res_a = a1 + a2; res_b = b1 + b2; break;
                case '-': res_a = a1 - a2; res_b = b1 - b2; break;
                case '*': res_a = a1*a2 - b1*b2; res_b = a1*b2 + b1*a2; break;
                case '/':
                    const nenner = a2*a2 + b2*b2;
                    if (nenner === 0) throw new Error("Division durch Null.");
                    res_a = (a1*a2 + b1*b2) / nenner;
                    res_b = (b1*a2 - a1*b2) / nenner;
                    break;
            }

            document.getElementById('comp-result').textContent = `${res_a.toFixed(2)} + ${res_b.toFixed(2)}i`;

        } catch(e) {
            document.getElementById('comp-result').textContent = "Fehler: " + e.message;
        }
    }

    if (calculateCompBtn) {
        const compInputs = ['comp-a1', 'comp-b1', 'comp-a2', 'comp-b2', 'comp-op'];
        compInputs.forEach(id => {
            const el = document.getElementById(id);
            if(el) el.addEventListener('input', handleCompCalculation);
        });
        calculateCompBtn.addEventListener('click', handleCompCalculation);
        handleCompCalculation();
    }

    // --- Winkel zwischen Vektoren ---
    const winkelInputs = ['vec-v1', 'vec-v2', 'vec-w1', 'vec-w2'];
    function handleWinkelCalculation() {
        if (!document.getElementById('vec-v1')) return;
        try {
            const v1 = parseFloat(document.getElementById('vec-v1').value);
            const v2 = parseFloat(document.getElementById('vec-v2').value);
            const w1 = parseFloat(document.getElementById('vec-w1').value);
            const w2 = parseFloat(document.getElementById('vec-w2').value);

            const skalarprodukt = v1 * w1 + v2 * w2;
            const normV = Math.sqrt(v1*v1 + v2*v2);
            const normW = Math.sqrt(w1*w1 + w2*w2);

            if (normV === 0 || normW === 0) {
                document.getElementById('winkel-result').textContent = "Winkel nicht definiert für Nullvektor.";
                return;
            }

            const cosAlpha = skalarprodukt / (normV * normW);
            const alphaRad = Math.acos(Math.max(-1, Math.min(1, cosAlpha)));
            const alphaGrad = alphaRad * 180 / Math.PI;

            document.getElementById('winkel-result').innerHTML = `
                <p>Skalarprodukt: ${skalarprodukt.toFixed(2)}</p>
                <p>||v||: ${normV.toFixed(2)}, ||w||: ${normW.toFixed(2)}</p>
                <p class="font-bold mt-2">Winkel: ${alphaGrad.toFixed(2)}°</p>
            `;

        } catch(e) {
            document.getElementById('winkel-result').textContent = "Fehler bei der Berechnung.";
        }
    }
    winkelInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', handleWinkelCalculation);
    });
    if (document.getElementById('vec-v1')) handleWinkelCalculation();


    // --- Matrix Operationen ---
    const matrixOpBtns = document.querySelectorAll('.matrix-op-btn');
    const matrixOpContainer = document.getElementById('matrix-op-container');
    const matrixOpExplanation = document.getElementById('matrix-op-explanation');

    const opExplanations = {
        add: "<strong>Addition:</strong> Matrizen gleicher Dimension werden addiert, indem ihre entsprechenden Elemente addiert werden.",
        multiply: "<strong>Multiplikation:</strong> Das Element in Zeile i, Spalte j der Ergebnismatrix ist das Skalarprodukt der i-ten Zeile der ersten Matrix mit der j-ten Spalte der zweiten Matrix.",
        transpose: "<strong>Transposition:</strong> Die transponierte Matrix \(A^T\) entsteht durch Vertauschen der Zeilen und Spalten der ursprünglichen Matrix A.",
        scalar: "<strong>Skalarmultiplikation:</strong> Eine Matrix wird mit einem Skalar (einer Zahl) multipliziert, indem jedes Element der Matrix mit diesem Skalar multipliziert wird."
    };

    function displayMatrixOperation(op) {
        if (!matrixOpContainer || !matrixOpExplanation) return;

        matrixOpExplanation.innerHTML = opExplanations[op];
        let html = '';
        switch(op) {
            case 'add':
                html = `
                    <div class="matrix-container"><div class="grid grid-cols-2 gap-1">${genMatrixInputs('m1', [[1,2],[3,4]])}</div></div>
                    <span class="text-2xl font-bold">+</span>
                    <div class="matrix-container"><div class="grid grid-cols-2 gap-1">${genMatrixInputs('m2', [[5,6],[7,8]])}</div></div>
                    <span class="text-2xl font-bold">=</span>
                    <div class="matrix-container"><div id="matrix-result-add" class="grid grid-cols-2 gap-1 p-2 bg-gray-900/70"></div></div>`;
                break;
            case 'multiply':
                html = `
                    <div class="matrix-container"><div class="grid grid-cols-2 gap-1">${genMatrixInputs('m1_mul', [[1,2],[3,4]])}</div></div>
                    <span class="text-2xl font-bold">⋅</span>
                    <div class="matrix-container"><div class="grid grid-cols-2 gap-1">${genMatrixInputs('m2_mul', [[5,6],[7,8]])}</div></div>
                    <span class="text-2xl font-bold">=</span>
                    <div class="matrix-container"><div id="matrix-result-mul" class="grid grid-cols-2 gap-1 p-2 bg-gray-900/70"></div></div>`;
                break;
            case 'transpose':
                html = `
                    <div class="matrix-container"><div class="grid grid-cols-2 gap-1">${genMatrixInputs('m_trans', [[1,2],[3,4]])}</div></div>
                    <sup class="text-2xl font-bold">T</sup>
                    <span class="text-2xl font-bold mx-2">=</span>
                    <div class="matrix-container"><div id="matrix-result-trans" class="grid grid-cols-2 gap-1 p-2 bg-gray-900/70"></div></div>`;
                break;
            case 'scalar':
                html = `
                    <input type="number" class="matrix-input w-16 text-center p-1 rounded" id="scalar_val" value="3">
                    <span class="text-2xl font-bold">⋅</span>
                    <div class="matrix-container"><div class="grid grid-cols-2 gap-1">${genMatrixInputs('m_scalar', [[1,2],[3,4]])}</div></div>
                    <span class="text-2xl font-bold">=</span>
                    <div class="matrix-container"><div id="matrix-result-scalar" class="grid grid-cols-2 gap-1 p-2 bg-gray-900/70"></div></div>`;
                break;
        }
        matrixOpContainer.innerHTML = html;
        attachMatrixHandlers(op);
    }

    function genMatrixInputs(prefix, values) {
        return `
            <input type="number" class="matrix-input w-12 text-center p-1 rounded" id="${prefix}_11" value="${values[0][0]}">
            <input type="number" class="matrix-input w-12 text-center p-1 rounded" id="${prefix}_12" value="${values[0][1]}">
            <input type="number" class="matrix-input w-12 text-center p-1 rounded" id="${prefix}_21" value="${values[1][0]}">
            <input type="number" class="matrix-input w-12 text-center p-1 rounded" id="${prefix}_22" value="${values[1][1]}">`;
    }

    function genMatrixResult(res) {
        return `
            <div class="w-16 text-center p-2">${res.a.toFixed(2)}</div><div class="w-16 text-center p-2">${res.b.toFixed(2)}</div>
            <div class="w-16 text-center p-2">${res.c.toFixed(2)}</div><div class="w-16 text-center p-2">${res.d.toFixed(2)}</div>`;
    }

    function attachMatrixHandlers(op) {
        const inputs = matrixOpContainer.querySelectorAll('input');
        const handler = () => calculateMatrix(op);
        inputs.forEach(input => input.addEventListener('input', handler));
        handler();
    }

    function calculateMatrix(op) {
        const getMatrix = (prefix) => ({
            a: parseFloat(document.getElementById(`${prefix}_11`).value), b: parseFloat(document.getElementById(`${prefix}_12`).value),
            c: parseFloat(document.getElementById(`${prefix}_21`).value), d: parseFloat(document.getElementById(`${prefix}_22`).value)
        });

        let res, resultContainer;

        switch(op) {
            case 'add':
                const m1_add = getMatrix('m1');
                const m2_add = getMatrix('m2');
                res = { a: m1_add.a + m2_add.a, b: m1_add.b + m2_add.b, c: m1_add.c + m2_add.c, d: m1_add.d + m2_add.d };
                resultContainer = document.getElementById('matrix-result-add');
                break;
            case 'multiply':
                const m1_mul = getMatrix('m1_mul');
                const m2_mul = getMatrix('m2_mul');
                res = { a: m1_mul.a * m2_mul.a + m1_mul.b * m2_mul.c, b: m1_mul.a * m2_mul.b + m1_mul.b * m2_mul.d,
                    c: m1_mul.c * m2_mul.a + m1_mul.d * m2_mul.c, d: m1_mul.c * m2_mul.b + m1_mul.d * m2_mul.d };
                resultContainer = document.getElementById('matrix-result-mul');
                break;
            case 'transpose':
                const m_trans = getMatrix('m_trans');
                res = { a: m_trans.a, b: m_trans.c, c: m_trans.b, d: m_trans.d };
                resultContainer = document.getElementById('matrix-result-trans');
                break;
            case 'scalar':
                const m_scalar = getMatrix('m_scalar');
                const scalar = parseFloat(document.getElementById('scalar_val').value);
                res = { a: m_scalar.a * scalar, b: m_scalar.b * scalar, c: m_scalar.c * scalar, d: m_scalar.d * scalar };
                resultContainer = document.getElementById('matrix-result-scalar');
                break;
        }

        if (resultContainer) {
            resultContainer.innerHTML = genMatrixResult(res);
        }
    }

    matrixOpBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            matrixOpBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            displayMatrixOperation(btn.dataset.op);
        });
    });
    if (matrixOpBtns.length > 0) matrixOpBtns[0].click();

})();