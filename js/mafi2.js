document.addEventListener('DOMContentLoaded', function(){
    const backBtn = document.querySelector('.back-to-hub-btn');
    if (backBtn) backBtn.addEventListener('click', () => { window.location.href = 'index.html'; });
    setupMafi2();
});

    const simpleMathParser = {
        parse: function(expr) {
            // Replace common math functions with Math.* equivalents
            let safeExpr = expr.replace(/sin/g, 'Math.sin')
                               .replace(/cos/g, 'Math.cos')
                               .replace(/exp/g, 'Math.exp')
                               .replace(/log/g, 'Math.log')
                               .replace(/\^/g, '**');

            try {
                // Use new Function for safer evaluation than eval()
                return new Function('x', 'y', `return ${safeExpr}`);
            } catch (e) {
                console.error("Parsing error in expression '" + expr + "':", e);
                // Return a function that returns NaN if parsing fails
                return () => NaN;
            }
        }
    };

const mafiNavButtons = document.querySelectorAll('.mafi-nav-button');
const mafiContentSections = document.querySelectorAll('.mafi-content-section');
const mafiCalculateDerivativeBtn = document.getElementById('mafi-calculate-derivative');
const taylorOrderSlider = document.getElementById('taylor-order-slider');
const taylorFunctionSelect = document.getElementById('taylor-function-select');
const bernsteinSlider = document.getElementById('bernstein-n-slider');
const analyzeExtremumBtn = document.getElementById('analyze-extremum-btn');
const generateExamBtn = document.getElementById('generate-exam-btn');
const analyzeLagrangeBtn = document.getElementById('analyze-lagrange-btn');
const eulerAngleSlider = document.getElementById('euler-angle-slider');
    
    function setupMafi2() {
        if (!document.getElementById('mafi2-app')) return;

        mafiNavButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetId = button.dataset.mafiTarget;
                mafiNavButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                mafiContentSections.forEach(section => {
                    section.classList.remove('active');
                    if (section.id === targetId) section.classList.add('active');
                });
                // After switching tab, re-render MathJax if needed
                if (window.MathJax) {
                    MathJax.typesetPromise();
                }
            });
        });

        if(mafiCalculateDerivativeBtn) {
            mafiCalculateDerivativeBtn.addEventListener('click', handleDerivativeCalculation);
            handleDerivativeCalculation();
        }
        if(taylorOrderSlider) {
            setupTaylorChart();
            taylorOrderSlider.addEventListener('input', updateTaylorChart);
            taylorFunctionSelect.addEventListener('change', updateTaylorChart);
        }
        if(bernsteinSlider) {
            setupBernsteinChart();
            bernsteinSlider.addEventListener('input', updateBernsteinChart);
        }
        if(eulerAngleSlider) {
            setupEulerVisualizer();
            eulerAngleSlider.addEventListener('input', updateEulerVisualizer);
        }
        if(analyzeExtremumBtn) {
             analyzeExtremumBtn.addEventListener('click', analyzeExtremum);
             analyzeExtremum();
        }
        if(generateExamBtn) {
            generateExamBtn.addEventListener('click', generateMafiExam);
        }
        if(analyzeLagrangeBtn) {
            analyzeLagrangeBtn.addEventListener('click', analyzeLagrange);
            analyzeLagrange();
        }
    }

    function handleDerivativeCalculation() {
        if(!document.getElementById('mafi-function-select')) return;
        const func = document.getElementById('mafi-function-select').value;
        const resultDiv = document.getElementById('mafi-derivative-result');
        let derivative = '';
        switch(func) {
            case 'sin(x)': derivative = '\\cos(x)'; break;
            case 'cos(x)': derivative = '-\\sin(x)'; break;
            case 'x^3': derivative = '3x^2'; break;
            case 'exp(x)': derivative = 'e^x'; break;
            case 'log(x)': derivative = '1/x'; break;
            case '1/(1-x)': derivative = '1/(1-x)^2'; break;
        }
        resultDiv.innerHTML = `\\( \\frac{d}{dx} [${func.replace('^3', '^3')}] = ${derivative} \\)`;
        if (window.MathJax) MathJax.typesetPromise([resultDiv]);
    }

    function setupTaylorChart() {
        if(!document.getElementById('taylorChart')) return;
        const ctx = document.getElementById('taylorChart').getContext('2d');
        taylorChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Original Function', data: [], borderColor: '#0891b2',
                        borderWidth: 3, pointRadius: 0,
                    },
                    {
                        label: 'Taylor Approximation', data: [], borderColor: '#f472b6',
                        borderWidth: 2, pointRadius: 0, borderDash: [5, 5]
                    }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: {
                    y: { grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#9ca3af' } },
                    x: { grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#9ca3af' } }
                },
                plugins: { legend: { labels: { color: '#e5e7eb' } } }
            }
        });
        updateTaylorChart();
    }
    
    function factorial(n) {
        if (n < 0) return NaN;
        if (n === 0) return 1;
        let res = 1;
        for (let i = 2; i <= n; i++) res *= i;
        return res;
    }

    function combinations(n, k) {
        if (k < 0 || k > n) return 0;
        if (k === 0 || k === n) return 1;
        if (k > n / 2) k = n - k;
        let res = 1;
        for (let i = 1; i <= k; i++) {
            res = res * (n - i + 1) / i;
        }
        return res;
    }

    function updateTaylorChart() {
        if(!taylorChart) return;
        const funcType = taylorFunctionSelect.value;
        const order = parseInt(taylorOrderSlider.value);
        document.getElementById('taylor-order-label').textContent = order;
        const labels = [], originalData = [], taylorData = [];
        for (let x = -5; x <= 5; x += 0.2) {
            labels.push(x.toFixed(1));
            let originalValue, taylorValue = 0;
            switch(funcType) {
                case 'sin':
                    originalValue = Math.sin(x);
                    for (let n = 0; n <= order; n++) if (n % 2 === 1) taylorValue += (Math.pow(-1, (n-1)/2) * Math.pow(x, n)) / factorial(n);
                    break;
                case 'cos':
                    originalValue = Math.cos(x);
                    for (let n = 0; n <= order; n++) if (n % 2 === 0) taylorValue += (Math.pow(-1, n/2) * Math.pow(x, n)) / factorial(n);
                    break;
                case 'exp':
                    originalValue = Math.exp(x);
                    for (let n = 0; n <= order; n++) taylorValue += Math.pow(x, n) / factorial(n);
                    break;
            }
            originalData.push(originalValue);
            taylorData.push(taylorValue);
        }
        taylorChart.data.labels = labels;
        taylorChart.data.datasets[0].data = originalData;
        taylorChart.data.datasets[1].data = taylorData;
        taylorChart.update();
    }

    function setupBernsteinChart() {
        if(!document.getElementById('bernsteinChart')) return;
        const ctx = document.getElementById('bernsteinChart').getContext('2d');
        bernsteinChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'f(x) = sin(2*pi*x)', data: [], borderColor: '#0891b2',
                        borderWidth: 3, pointRadius: 0,
                    },
                    {
                        label: 'Bernstein-Polynom p_n(x)', data: [], borderColor: '#f472b6',
                        borderWidth: 2, pointRadius: 0, borderDash: [5, 5]
                    }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: {
                    y: { min: -1.1, max: 1.1, grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#9ca3af' } },
                    x: { grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#9ca3af' } }
                },
                plugins: { legend: { labels: { color: '#e5e7eb' } } }
            }
        });
        updateBernsteinChart();
    }

    function updateBernsteinChart() {
        if(!bernsteinChart) return;
        const n = parseInt(bernsteinSlider.value);
        document.getElementById('bernstein-n-label').textContent = n;
        const originalFunc = x => Math.sin(2 * Math.PI * x);
        const bernsteinPoly = (x) => {
            let sum = 0;
            for (let k = 0; k <= n; k++) {
                const bernsteinBasis = combinations(n, k) * Math.pow(x, k) * Math.pow(1 - x, n - k);
                sum += originalFunc(k / n) * bernsteinBasis;
            }
            return sum;
        };
        const labels = [], originalData = [], bernsteinData = [];
        for (let i = 0; i <= 100; i++) {
            const x = i / 100;
            labels.push(x.toFixed(2));
            originalData.push(originalFunc(x));
            bernsteinData.push(bernsteinPoly(x));
        }
        bernsteinChart.data.labels = labels;
        bernsteinChart.data.datasets[0].data = originalData;
        bernsteinChart.data.datasets[1].data = bernsteinData;
        bernsteinChart.update();
    }

    function setupEulerVisualizer() {
        const canvas = document.getElementById('eulerCanvas');
        if (!canvas) return;
        updateEulerVisualizer();
    }

    function updateEulerVisualizer() {
        const canvas = document.getElementById('eulerCanvas');
        if(!canvas) return;
        const ctx = canvas.getContext('2d');
        const angleDegrees = document.getElementById('euler-angle-slider').value;
        document.getElementById('euler-angle-label').textContent = angleDegrees;
        const angleRadians = angleDegrees * Math.PI / 180;
        const width = canvas.width, height = canvas.height;
        const center = { x: width / 2, y: height / 2 };
        const radius = width * 0.4;
        ctx.clearRect(0, 0, width, height);
        ctx.strokeStyle = '#4b5563';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, center.y); ctx.lineTo(width, center.y); ctx.moveTo(center.x, 0); ctx.lineTo(center.x, height); ctx.stroke();
        ctx.fillStyle = '#9ca3af'; ctx.fillText('Re', width - 20, center.y - 5); ctx.fillText('Im', center.x + 5, 15);
        ctx.beginPath(); ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI); ctx.setLineDash([2, 4]); ctx.stroke(); ctx.setLineDash([]);
        const x = Math.cos(angleRadians), y = Math.sin(angleRadians);
        const pointX = center.x + radius * x, pointY = center.y - radius * y;
        ctx.beginPath(); ctx.moveTo(center.x, center.y); ctx.lineTo(pointX, pointY); ctx.strokeStyle = '#0891b2'; ctx.lineWidth = 3; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(center.x, pointY); ctx.lineTo(pointX, pointY); ctx.strokeStyle = '#f472b6'; ctx.lineWidth = 2; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(pointX, center.y); ctx.lineTo(pointX, pointY); ctx.strokeStyle = '#34d399'; ctx.lineWidth = 2; ctx.stroke();
        ctx.beginPath(); ctx.arc(pointX, pointY, 5, 0, 2 * Math.PI); ctx.fillStyle = '#0891b2'; ctx.fill();
        const outputDiv = document.getElementById('euler-output');
        outputDiv.innerHTML = `
            <div>cos(${angleDegrees}°) = <span class="text-pink-400">${x.toFixed(3)}</span></div>
            <div>sin(${angleDegrees}°) = <span class="text-emerald-400">${y.toFixed(3)}</span></div>
            <div class="mt-2">e<sup>i${angleDegrees}°</sup> = <span class="text-pink-400">${x.toFixed(3)}</span> + i(<span class="text-emerald-400">${y.toFixed(3)}</span>)</div>`;
    }

    function calculateEigen(matrix) {
        const [a, b, c, d] = [matrix[0][0], matrix[0][1], matrix[1][0], matrix[1][1]];
        // For a symmetric matrix, b = c
        const trace = a + d;
        const det = a * d - b * c;
        const discriminant = Math.sqrt(trace * trace - 4 * det);
        const eig1 = (trace + discriminant) / 2;
        const eig2 = (trace - discriminant) / 2;

        let vec1 = [b, eig1 - a];
        if (vec1[0] === 0 && vec1[1] === 0) vec1 = [eig1 - d, c];
        const norm1 = Math.sqrt(vec1[0] * vec1[0] + vec1[1] * vec1[1]);
        if (norm1 > 1e-9) { vec1[0] /= norm1; vec1[1] /= norm1; }

        let vec2 = [b, eig2 - a];
        if (vec2[0] === 0 && vec2[1] === 0) vec2 = [eig2 - d, c];
        const norm2 = Math.sqrt(vec2[0] * vec2[0] + vec2[1] * vec2[1]);
        if (norm2 > 1e-9) { vec2[0] /= norm2; vec2[1] /= norm2; }
        
        return {
            eigenvalues: [eig1, eig2],
            eigenvectors: [vec1, vec2]
        };
    }

    function analyzeExtremum() {
        if(!document.getElementById('2d-function-input')) return;
        const funcStr = document.getElementById('2d-function-input').value;
        const pointStr = document.getElementById('2d-point-input').value;
        const resultDiv = document.getElementById('extremum-result');
        try {
            const [x0, y0] = pointStr.split(',').map(s => parseFloat(s.trim()));
            if (isNaN(x0) || isNaN(y0)) throw new Error("Ungültiger Punkt. Bitte im Format 'x, y' eingeben.");
            const f = simpleMathParser.parse(funcStr);
            const h = 0.0001; // A small value for numerical differentiation
            
            // Numerical calculation of first derivatives (Gradient)
            const fx = (f(x0 + h, y0) - f(x0 - h, y0)) / (2 * h);
            const fy = (f(x0, y0 + h) - f(x0, y0 - h)) / (2 * h);
            const gradNorm = Math.sqrt(fx*fx + fy*fy);

            let resultHTML = `<p>Analyse am Punkt \\((${x0}, ${y0})\\):</p>`;
            resultHTML += `<p class="mt-2">Gradient \\( \\nabla f \\approx \\begin{pmatrix} ${fx.toFixed(3)} \\\\ ${fy.toFixed(3)} \\end{pmatrix} \\)</p>`;

            if (gradNorm > 1e-4) {
                 resultHTML += `<p class="text-amber-400 font-semibold mt-2">Kein kritischer Punkt, da \\( \\nabla f \\not\\approx 0 \\).</p>`;
                 resultDiv.innerHTML = resultHTML;
                 if (window.MathJax) MathJax.typesetPromise([resultDiv]);
                 return;
            }
            
            resultHTML += `<p class="text-green-400 font-semibold mt-2">Kritischer Punkt, da \\( \\nabla f \\approx 0 \\).</p>`;

            // Numerical calculation of second derivatives (Hesse-Matrix)
            const fxx = (f(x0 + h, y0) - 2 * f(x0, y0) + f(x0 - h, y0)) / (h * h);
            const fyy = (f(x0, y0 + h) - 2 * f(x0, y0) + f(x0, y0 - h)) / (h * h);
            const fxy = (f(x0 + h, y0 + h) - f(x0 + h, y0 - h) - f(x0 - h, y0 + h) + f(x0 - h, y0 - h)) / (4 * h * h);
            const hesseMatrix = [[fxx, fxy], [fxy, fyy]];

            resultHTML += `<p class="mt-4">Hesse-Matrix \\( H_f \\approx \\begin{pmatrix} ${fxx.toFixed(3)} & ${fxy.toFixed(3)} \\\\ ${fxy.toFixed(3)} & ${fyy.toFixed(3)} \\end{pmatrix} \\)</p>`;

            const { eigenvalues, eigenvectors } = calculateEigen(hesseMatrix);
            const [l1, l2] = eigenvalues;

            resultHTML += `<p class="mt-4">Eigenwerte: \\(\\lambda_1 \\approx ${l1.toFixed(3)}\\), \\(\\lambda_2 \\approx ${l2.toFixed(3)}\\)</p>`;
            resultHTML += `<p class="mt-2">Eigenvektoren (Hauptachsen):</p>
                         <ul class="list-disc list-inside ml-4">
                           <li>\\(v_1 \\approx \\begin{pmatrix} ${eigenvectors[0][0].toFixed(3)} \\\\ ${eigenvectors[0][1].toFixed(3)} \\end{pmatrix}\\)</li>
                           <li>\\(v_2 \\approx \\begin{pmatrix} ${eigenvectors[1][0].toFixed(3)} \\\\ ${eigenvectors[1][1].toFixed(3)} \\end{pmatrix}\\)</li>
                         </ul>`;

            resultHTML += `<h4 class="font-semibold mt-4">Klassifikation:</h4>`;
            if (Math.abs(l1) < 1e-6 || Math.abs(l2) < 1e-6) {
                resultHTML += `<p class="text-gray-500">⇒ Test nicht schlüssig (mindestens ein Eigenwert ist 0).</p>`;
            } else if (l1 > 0 && l2 > 0) {
                resultHTML += `<p class="text-cyan-400">⇒ Lokales Minimum (alle Eigenwerte sind positiv).</p>`;
            } else if (l1 < 0 && l2 < 0) {
                resultHTML += `<p class="text-purple-400">⇒ Lokales Maximum (alle Eigenwerte sind negativ).</p>`;
            } else {
                resultHTML += `<p class="text-orange-400">⇒ Sattelpunkt (Eigenwerte haben unterschiedliche Vorzeichen).</p>`;
                resultHTML += `<p class="text-sm text-gray-400 mt-1">Die Funktion verhält sich entlang des Eigenvektors zum positiven Eigenwert wie ein Minimum und entlang des Eigenvektors zum negativen Eigenwert wie ein Maximum.</p>`;
            }
            
            resultDiv.innerHTML = resultHTML;
            if (window.MathJax) MathJax.typesetPromise([resultDiv]);
        } catch(e) {
            resultDiv.innerHTML = `<p class="text-red-400">Fehler bei der Analyse: ${e.message}</p>`;
        }
    }
    
    function analyzeLagrange() {
        if(!document.getElementById('lagrange-f')) return;
        function getDerivative(funcStr, variable) {
            funcStr = funcStr.trim().replace(/\s/g, '');
            // Simple hardcoded derivatives for the example
            if (funcStr === 'x+y' || funcStr === 'y+x') return '1';
            if (funcStr === 'x^2+y^2-1' || funcStr === 'y^2+x^2-1') {
                return variable === 'x' ? '2x' : '2y';
            }
            // Fallback for more complex functions
            return `\\frac{\\partial}{\\partial ${variable}}(${funcStr})`;
        }
        const fStr = document.getElementById('lagrange-f').value;
        const gStr = document.getElementById('lagrange-g').value;
        const resultDiv = document.getElementById('lagrange-result');
        let resultHTML = `<h4 class="font-semibold mb-2 text-white">Notwendiges Gleichungssystem:</h4>`;
        resultHTML += `<p>1. \\( \\frac{\\partial \\mathcal{L}}{\\partial x} = 0 \\quad \\Rightarrow \\quad ${getDerivative(fStr, 'x')} + \\lambda \\cdot (${getDerivative(gStr, 'x')}) = 0 \\)</p>`;
        resultHTML += `<p>2. \\( \\frac{\\partial \\mathcal{L}}{\\partial y} = 0 \\quad \\Rightarrow \\quad ${getDerivative(fStr, 'y')} + \\lambda \\cdot (${getDerivative(gStr, 'y')}) = 0 \\)</p>`;
        resultHTML += `<p>3. \\( g(x, y) = 0 \\quad \\Rightarrow \\quad ${gStr} = 0 \\)</p>`;
        resultDiv.innerHTML = resultHTML;
        if (window.MathJax) MathJax.typesetPromise([resultDiv]);
    }

    const ExamGenerator = {
        getRandomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; },
        getRandomNonZeroInt(min, max) { let num; do { num = this.getRandomInt(min, max); } while (num === 0); return num; },
        getRandomElement(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
        generateTask1() {
            const pool = [
                { q: (a) => `Für alle reellen Zahlen \\(x > ${a}\\) gilt \\(\\sqrt{(x-${a})^2} = x-${a}\\).`, a: (a) => true, expl: (a) => `Die Wurzel aus einer quadrierten Zahl ist der Absolutbetrag. Da \\(x > ${a}\\) ist, ist \\(x-${a}\\) positiv, also \\(|x-${a}| = x-${a}\\).` },
                { q: () => `Jede differenzierbare Funktion ist auch stetig.`, a: () => true, expl: () => `Differenzierbarkeit ist eine stärkere Bedingung als Stetigkeit. Wenn eine Funktion eine Ableitung hat, kann sie keine Sprünge haben.` },
                { q: (a) => `Die Funktion \\(f(x) = |x - ${a}|\\) ist bei \\(x=${a}\\) nicht differenzierbar.`, a: () => true, expl: (a) => `Die Betragsfunktion hat an der Stelle \\(x=${a}\\) einen 'Knick', an dem die Steigung nicht eindeutig definiert ist.` },
                { q: (a, b) => `Der Vektor \\(\\begin{pmatrix}${a}\\\\${b}\\end{pmatrix}\\) ist ein Eigenvektor von \\(\\begin{pmatrix}${a+b}&${a}\\\\${b}&${a+b}\\end{pmatrix}\\).`, a: () => false, expl: (a, b) => `Ein Gegenbeispiel: Multiplikation der Matrix mit dem Vektor ergibt nicht ein skalares Vielfaches des Vektors.` },
                { q: () => `Wenn die Eigenwerte der Hesse-Matrix an einem kritischen Punkt gemischte Vorzeichen haben, liegt ein Sattelpunkt vor.`, a: () => true, expl: () => `Das ist die Definition eines Sattelpunktes nach dem Kriterium der zweiten Ableitung. Die Funktion krümmt sich in verschiedene Richtungen.` }
            ];
            let content = `<h3 class="text-2xl font-bold text-cyan-400 mb-4">Aufgabe 1: Richtig oder Falsch (10 Punkte)</h3><div class="space-y-4">`;
            const usedIndices = new Set();
            while(usedIndices.size < 5) usedIndices.add(this.getRandomInt(0, pool.length - 1));
            Array.from(usedIndices).forEach((idx, i) => {
                const item = pool[idx], a = this.getRandomInt(1, 5), b = this.getRandomInt(1, 5);
                content += `<div class="question-block"><p>${i+1}. ${item.q(a, b)}</p><div class="solution p-3 mt-2 rounded-md"><span class="font-semibold text-cyan-300">${item.a(a, b) ? 'Richtig' : 'Falsch'}.</span> ${item.expl(a, b)}</div></div>`;
            });
            return content + '</div>';
        },
        generateTask2() {
            const pool = [
                { q: (a,b) => `f(x) = \\sin(${a}x) e^{${b}x}`, sol: (a,b) => `Produkt- und Kettenregel: \\(f'(x) = ${a}\\cos(${a}x)e^{${b}x} + ${b}\\sin(${a}x)e^{${b}x}\\)` },
                { q: (a,b) => `f(x) = \\frac{x^${a}}{x^${b}+1}`, sol: (a,b) => `Quotientenregel: \\(f'(x) = \\frac{${a}x^{${a-1}}(x^{${b}}+1) - x^{${a}}(${b}x^{${b-1}})}{(x^{${b}}+1)^2}\\)`},
                { q: (a) => `f(x) = \\ln(x^2 + ${a})`, sol: (a) => `Kettenregel: \\(f'(x) = \\frac{2x}{x^2+${a}}\\)`}
            ];
            const item = this.getRandomElement(pool), a = this.getRandomInt(2, 4), b = this.getRandomInt(1, 3);
            return `<h3 class="text-2xl font-bold text-cyan-400 mb-4">Aufgabe 2: Differentialrechnung (10 Punkte)</h3><div class="question-block"><p class="mb-4">Berechnen Sie die erste Ableitung \\(f'(x)\\) der Funktion \\(${item.q(a,b)}\\).</p><div class="solution p-4 mt-2 rounded-md">${item.sol(a,b)}</div></div>`;
        },
        generateTask3() {
            const pool = [
                { q: (a) => `g(x) = \\cos(${a}x)`, sol: (a) => `\\(g(0)=1, g'(x)=-${a}\\sin(${a}x) \\Rightarrow g'(0)=0, g''(x)=-${a*a}\\cos(${a}x) \\Rightarrow g''(0)=-${a*a}\\). Daher: \\(T_2(x) = 1 - \\frac{${a*a}}{2}x^2\\)` },
                { q: (a) => `g(x) = \\frac{1}{1-${a}x}`, sol: (a) => `\\(g(0)=1, g'(x)=${a}(1-${a}x)^{-2} \\Rightarrow g'(0)=${a}, g''(x)=2${a*a}(1-${a}x)^{-3} \\Rightarrow g''(0)=2${a*a}\\). Daher: \\(T_2(x) = 1 + ${a}x + ${a*a}x^2\\)` }
            ];
            const item = this.getRandomElement(pool), a = this.getRandomInt(2, 3);
            return `<h3 class="text-2xl font-bold text-cyan-400 mb-4">Aufgabe 3: Taylor-Entwicklung (10 Punkte)</h3><div class="question-block"><p class="mb-4">Bestimmen Sie die Taylor-Entwicklung von \\(${item.q(a)}\\) bis zur zweiten Ordnung um den Entwicklungspunkt \\(x_0 = 0\\).</p><div class="solution p-4 mt-2 rounded-md">${item.sol(a)}</div></div>`;
        },
        generateTask4() {
            const a = this.getRandomInt(2, 4), b = this.getRandomInt(1, 3), c = this.getRandomNonZeroInt(-4, 4), d = this.getRandomNonZeroInt(-4, 4);
            const det = 4*a - b*b;
            let critX = 0, critY = 0;
            if (det !== 0) { critX = (b*d - 2*a*c) / det; critY = (b*c - 2*d) / det; }
            let type = '';
            if (det > 0) type = 'ein lokales Minimum (da \\(f_{xx}=2>0\\))';
            else if (det < 0) type = 'einen Sattelpunkt';
            else type = 'einen Punkt, über den keine Aussage getroffen werden kann';
            const func = `f(x,y) = x^2 + ${a}y^2 - ${b}xy + ${c}x + ${d}y`;
            const sol = `Gradient: \\(\\nabla f = \\begin{pmatrix} 2x - ${b}y + ${c} \\\\ ${2*a}y - ${b}x + ${d} \\end{pmatrix}\\). Nullsetzen ergibt den kritischen Punkt \\((${critX.toFixed(2)}, ${critY.toFixed(2)})\\). Hesse-Matrix: \\(H_f = \\begin{pmatrix} 2 & -${b} \\\\ -${b} & ${2*a} \\end{pmatrix}\\). Die Eigenwerte sind \\(\\lambda_{1,2} = \\frac{2+2a \\pm \\sqrt{(2-2a)^2+4b^2}}{2}\\). Ihre Vorzeichen bestimmen die Art des Extremums.`;
            return `<h3 class="text-2xl font-bold text-cyan-400 mb-4">Aufgabe 4: Mehrdimensionale Analysis (10 Punkte)</h3><div class="question-block"><p class="mb-4">Analysieren Sie die Funktion \\(${func}\\) auf lokale Extrema. Bestimmen Sie den kritischen Punkt und klassifizieren Sie ihn mittels der Eigenwerte der Hesse-Matrix.</p><div class="solution p-4 mt-2 rounded-md">${sol}</div></div>`;
        },
        generateTask5() {
            const pool = [
                { q: `Sei \\(f(x)\\) eine stetige Funktion auf \\([a,b]\\). Muss \\(f(x)\\) auf diesem Intervall ein Maximum annehmen? Begründen Sie.`, sol: `Ja. Dies ist der Satz vom Minimum und Maximum (oder Extremwertsatz). Er besagt, dass jede auf einem abgeschlossenen, beschränkten Intervall stetige Funktion dort ein globales Maximum und Minimum annimmt.`},
                { q: `Sei \\(f(x,y)\\) eine Funktion mit \\(\\nabla f(x_0, y_0) = 0\\) und alle Eigenwerte von \\(H_f(x_0, y_0)\\) sind positiv. Was können Sie über den Punkt \\((x_0, y_0)\\) aussagen?`, sol: `Der Punkt ist ein lokales Minimum. Da alle Eigenwerte positiv sind, ist die Hesse-Matrix positiv definit, was ein hinreichendes Kriterium für ein lokales Minimum ist.`},
                { q: `Was ist die geometrische Bedeutung des Gradienten \\(\\nabla f(x,y)\\)?`, sol: `Der Gradientenvektor \\(\\nabla f\\) an einem Punkt \\((x,y)\\) zeigt in die Richtung des steilsten Anstiegs der Funktion \\(f\\). Seine Länge entspricht der Größe dieser Steigung.`},
                { q: `Erklären Sie kurz die Idee hinter der Methode der Lagrange-Multiplikatoren.`, sol: `Die Methode sucht nach Punkten, an denen der Gradient der Funktion \\(f\\) parallel zum Gradienten der Nebenbedingungsfunktion \\(g\\) ist. An diesen Punkten berührt eine Niveaulinie von \\(f\\) die Kurve der Nebenbedingung, was auf ein Extremum hindeutet.`}
            ];
            const item = this.getRandomElement(pool);
            return `<h3 class="text-2xl font-bold text-cyan-400 mb-4">Aufgabe 5: Theorie (10 Punkte)</h3><div class="question-block"><p class="mb-4">${item.q}</p><div class="solution p-4 mt-2 rounded-md">${item.sol}</div></div>`;
        }
    };

    function generateMafiExam() {
        const container = document.getElementById('exam-container');
        if(!container) return;
        container.innerHTML = '';
        const tasks = [
            ExamGenerator.generateTask1(), ExamGenerator.generateTask2(),
            ExamGenerator.generateTask3(), ExamGenerator.generateTask4(),
            ExamGenerator.generateTask5()
        ];
        tasks.forEach(taskHTML => {
            const taskDiv = document.createElement('div');
            taskDiv.className = 'card p-6 rounded-2xl shadow-xl';
            taskDiv.innerHTML = taskHTML;
            taskDiv.innerHTML += `<button class="toggle-solution-btn mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors">Lösung anzeigen</button>`;
            container.appendChild(taskDiv);
        });
        
        // Add event listeners to the new buttons
        container.querySelectorAll('.toggle-solution-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Find all solution elements within the same task card
                const solutions = e.target.parentElement.querySelectorAll('.solution');
                if (solutions.length > 0) {
                    // Check visibility of the first solution to determine the action
                    const isVisible = solutions[0].style.display === 'block';
                    // Toggle all solutions
                    solutions.forEach(solution => {
                        solution.style.display = isVisible ? 'none' : 'block';
                    });
                    // Update button text
                    e.target.textContent = isVisible ? 'Lösung anzeigen' : 'Lösung verbergen';
                }
            });
        });

        if (window.MathJax) MathJax.typesetPromise([container]);
    }

