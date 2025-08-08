document.addEventListener('DOMContentLoaded', function() {
    // --- GENERAL SETUP ---
    const backBtn = document.querySelector('.back-to-hub-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    if (document.getElementById('aud-app')) {
        setupAud();
    }
});


function setupAud() {
    // --- NAVIGATION ---
    const navButtons = document.querySelectorAll('.aud-nav-button');
    const contentSections = document.querySelectorAll('.aud-content-section');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.dataset.audTarget;
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            contentSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                }
            });
            if (window.MathJax) MathJax.typesetPromise();
        });
    });

    // --- SORTING VISUALIZER ---
    const sortContainer = document.getElementById('sort-container');
    const sortStartBtn = document.getElementById('sort-start-btn');
    const sortResetBtn = document.getElementById('sort-reset-btn');
    const algoSelect = document.getElementById('sort-algo-select');
    const speedSlider = document.getElementById('sort-speed-slider');
    const speedLabel = document.getElementById('sort-speed-label');
    const sortExplanation = document.getElementById('sort-explanation');
    let sort_values = [];
    let sort_delay = 100;

    const explanations = {
        bubble: "<b>Bubblesort O(n²):</b> Vergleicht Paare benachbarter Elemente und tauscht sie, wenn sie in der falschen Reihenfolge sind. Nach jedem Durchlauf 'blubbert' das größte Element ans Ende. Einfach, aber ineffizient.",
        insertion: "<b>Insertionsort O(n²):</b> Baut die sortierte Liste Element für Element auf. Es nimmt ein Element aus dem unsortierten Teil und fügt es an der korrekten Stelle im bereits sortierten Teil ein.",
        selection: "<b>Selectionsort O(n²):</b> Findet in jedem Durchlauf das kleinste Element im unsortierten Teil und tauscht es an den Anfang des unsortierten Teils.",
        quicksort: "<b>Quicksort O(n log n) avg.:</b> Ein 'Teile-und-Herrsche'-Algorithmus. Wählt ein Pivotelement, teilt das Array in zwei Teillisten (kleiner und größer als Pivot) und sortiert diese rekursiv. Sehr schnell im Durchschnitt, aber O(n²) im Worst-Case."
    };

    function updateSortExplanation() {
        sortExplanation.innerHTML = explanations[algoSelect.value] || '';
    }

    speedSlider.addEventListener('input', (e) => {
        sort_delay = e.target.value;
        speedLabel.textContent = `${sort_delay}`;
    });

    function resetSorter() {
        sort_values = [];
        sortContainer.innerHTML = '';
        const numBars = 30;
        for (let i = 0; i < numBars; i++) {
            sort_values.push(Math.floor(Math.random() * 95) + 5);
        }
        drawBars(sort_values);
        sortStartBtn.disabled = false;
        updateSortExplanation();
    }

    function drawBars(arr, comparing = [], sorted = [], pivot = -1) {
        sortContainer.innerHTML = '';
        arr.forEach((val, i) => {
            const bar = document.createElement('div');
            bar.style.height = `${val}%`;
            bar.style.width = `${100 / arr.length}%`;
            bar.classList.add('bar');
            if (i === pivot) bar.style.backgroundColor = '#facc15'; // yellow
            else if (sorted.includes(i)) bar.style.backgroundColor = '#2dd4bf'; // teal
            else if (comparing.includes(i)) bar.style.backgroundColor = '#fb923c'; // orange
            else bar.style.backgroundColor = '#0891b2'; // cyan
            sortContainer.appendChild(bar);
        });
    }

    async function sleep() {
        return new Promise(resolve => setTimeout(resolve, sort_delay));
    }

    async function bubbleSort(arr) {
        let n = arr.length;
        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                }
                drawBars(arr, [j, j + 1], Array.from({length: i}, (_, k) => n - 1 - k));
                await sleep();
            }
        }
        drawBars(arr, [], Array.from(Array(n).keys()));
    }

    async function insertionSort(arr) {
        let n = arr.length;
        for (let i = 1; i < n; i++) {
            let key = arr[i];
            let j = i - 1;
            while (j >= 0 && arr[j] > key) {
                arr[j + 1] = arr[j];
                drawBars(arr, [j, j+1], []);
                await sleep();
                j = j - 1;
            }
            arr[j + 1] = key;
        }
        drawBars(arr, [], Array.from(Array(n).keys()));
    }

    async function selectionSort(arr) {
        let n = arr.length;
        for (let i = 0; i < n - 1; i++) {
            let min_idx = i;
            for (let j = i + 1; j < n; j++){
                if (arr[j] < arr[min_idx]) min_idx = j;
                drawBars(arr, [i, j, min_idx], Array.from({length: i}, (_, k) => k));
                await sleep();
            }
            [arr[min_idx], arr[i]] = [arr[i], arr[min_idx]];
        }
        drawBars(arr, [], Array.from(Array(n).keys()));
    }

    async function quickSort(arr, low, high) {
        if (low < high) {
            let pi = await partition(arr, low, high);
            await quickSort(arr, low, pi - 1);
            await quickSort(arr, pi + 1, high);
        }
    }
    async function partition(arr, low, high) {
        let pivot = arr[high];
        let i = low - 1;
        for (let j = low; j < high; j++) {
            drawBars(arr, [j, i], [], high);
            await sleep();
            if (arr[j] < pivot) {
                i++;
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
        }
        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        return i + 1;
    }


    sortStartBtn.addEventListener('click', async () => {
        sortStartBtn.disabled = true;
        const algo = algoSelect.value;
        if (algo === 'bubble') await bubbleSort(sort_values);
        else if (algo === 'insertion') await insertionSort(sort_values);
        else if (algo === 'selection') await selectionSort(sort_values);
        else if (algo === 'quicksort') {
            await quickSort(sort_values, 0, sort_values.length - 1);
            drawBars(sort_values, [], Array.from(Array(sort_values.length).keys()));
        }
    });
    sortResetBtn.addEventListener('click', resetSorter);
    algoSelect.addEventListener('change', updateSortExplanation);
    resetSorter();


    // --- STACK & QUEUE ---
    const stackInput = document.getElementById('stack-input');
    const stackPushBtn = document.getElementById('stack-push-btn');
    const stackPopBtn = document.getElementById('stack-pop-btn');
    const stackContainer = document.getElementById('stack-container');
    let stack = [];

    const queueInput = document.getElementById('queue-input');
    const queueEnqueueBtn = document.getElementById('queue-enqueue-btn');
    const queueDequeueBtn = document.getElementById('queue-dequeue-btn');
    const queueContainer = document.getElementById('queue-container');
    let queue = [];

    function updateStack() {
        stackContainer.innerHTML = '';
        stack.forEach(val => {
            const el = document.createElement('div');
            el.className = 'w-3/4 bg-cyan-600 text-white text-center p-1 rounded transition-all animate-pulse';
            el.textContent = val;
            stackContainer.appendChild(el);
            setTimeout(()=> el.classList.remove('animate-pulse'), 200);
        });
    }

    function updateQueue() {
        queueContainer.innerHTML = '';
        queue.forEach(val => {
            const el = document.createElement('div');
            el.className = 'w-16 h-12 bg-cyan-600 text-white flex items-center justify-center rounded transition-all flex-shrink-0 animate-pulse';
            el.textContent = val;
            queueContainer.appendChild(el);
            setTimeout(()=> el.classList.remove('animate-pulse'), 200);
        });
    }

    stackPushBtn.addEventListener('click', () => {
        if (stackInput.value && stack.length < 5) {
            stack.push(stackInput.value);
            stackInput.value = '';
            updateStack();
        }
    });
    stackPopBtn.addEventListener('click', () => {
        if (stack.length > 0) {
            stack.pop();
            updateStack();
        }
    });

    queueEnqueueBtn.addEventListener('click', () => {
        if (queueInput.value && queue.length < 5) {
            queue.push(queueInput.value);
            queueInput.value = '';
            updateQueue();
        }
    });
    queueDequeueBtn.addEventListener('click', () => {
        if (queue.length > 0) {
            queue.shift();
            updateQueue();
        }
    });
    updateStack();
    updateQueue();

    // --- BINARY SEARCH TREE ---
    const bstInput = document.getElementById('bst-input');
    const bstInsertBtn = document.getElementById('bst-insert-btn');
    const bstSearchBtn = document.getElementById('bst-search-btn');
    const bstResetBtn = document.getElementById('bst-reset-btn');
    const bstContainer = document.getElementById('bst-container');
    let bstRoot = null;

    function createBstNode(value) { return { value, left: null, right: null, el: null }; }

    function insertBstNode(node, value) {
        if (!node) return createBstNode(value);
        if (value < node.value) node.left = insertBstNode(node.left, value);
        else if (value > node.value) node.right = insertBstNode(node.right, value);
        return node;
    }

    async function searchBstNode(node, value) {
        if (!node) {
            bstContainer.insertAdjacentHTML('beforeend', `<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-400 font-bold p-2 bg-gray-900 rounded">Nicht gefunden!</div>`);
            return false;
        }
        node.el.classList.add('animate-ping', 'bg-yellow-500');
        await sleep();
        node.el.classList.remove('animate-ping', 'bg-yellow-500');

        if (value === node.value) {
            node.el.classList.add('bg-green-500');
            return true;
        }
        if (value < node.value) return await searchBstNode(node.left, value);
        else return await searchBstNode(node.right, value);
    }

    function renderBst() {
        bstContainer.innerHTML = '';
        if (!bstRoot) {
            bstContainer.innerHTML = '<p class="text-center text-gray-400">Füge Zahlen hinzu, um den Baum aufzubauen.</p>';
            return;
        }
        renderBstNode(bstRoot, bstContainer, 50, 5, true);
    }

    function renderBstNode(node, container, x, y, isRoot) {
        if (!node) return;

        const nodeEl = document.createElement('div');
        nodeEl.className = 'absolute w-10 h-10 bg-cyan-600 rounded-full flex items-center justify-center text-white transition-all duration-300';
        nodeEl.style.left = `${x}%`;
        nodeEl.style.top = `${y}%`;
        nodeEl.textContent = node.value;
        node.el = nodeEl;
        container.appendChild(nodeEl);

        const levelGap = 25; // How much horizontal space per level
        const nextY = y + 15;

        if (node.left) {
            const nextX = x - (levelGap / ((y/15)+1));
            const line = document.createElement('div');
            line.className = 'absolute h-0.5 bg-gray-500 origin-top-right';
            const dx = (x-nextX), dy = nextY-y;
            const length = Math.hypot(dx,dy) * (container.offsetWidth/100);
            const angle = -Math.atan2(dy,dx) * (180/Math.PI);
            line.style.width = `${length}px`;
            line.style.left = `${x}%`;
            line.style.top = `${y+5}%`;
            line.style.transform = `rotate(${angle}deg)`;
            container.appendChild(line);
            renderBstNode(node.left, container, nextX, nextY, false);
        }
        if (node.right) {
            const nextX = x + (levelGap / ((y/15)+1));
            const line = document.createElement('div');
            line.className = 'absolute h-0.5 bg-gray-500 origin-top-left';
            const dx = (nextX-x), dy = nextY-y;
            const length = Math.hypot(dx,dy) * (container.offsetWidth/100);
            const angle = Math.atan2(dy,dx) * (180/Math.PI);
            line.style.width = `${length}px`;
            line.style.left = `${x}%`;
            line.style.top = `${y+5}%`;
            line.style.transform = `rotate(${angle}deg)`;
            container.appendChild(line);
            renderBstNode(node.right, container, nextX, nextY, false);
        }
    }

    bstInsertBtn.addEventListener('click', () => {
        const val = parseInt(bstInput.value);
        if (!isNaN(val)) {
            bstRoot = insertBstNode(bstRoot, val);
            renderBst();
            bstInput.value = '';
        }
    });
    bstSearchBtn.addEventListener('click', async () => {
        const val = parseInt(bstInput.value);
        if (!isNaN(val)) {
            renderBst(); // Reset colors
            await searchBstNode(bstRoot, val);
            bstInput.value = '';
        }
    });

    bstResetBtn.addEventListener('click', () => {
        bstRoot = null;
        renderBst();
    });

    // --- EXERCISE GENERATOR ---
    const generateAudExercisesBtn = document.getElementById('generate-aud-exercises-btn');
    const audExercisesContainer = document.getElementById('aud-exercises-container');

    const AudExerciseGenerator = {
        getRandomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
        getRandomElement: (arr) => arr[Math.floor(Math.random() * arr.length)],

        createMultipleChoiceTask() {
            const questions = [
                {
                    q: "Welche zwei Aussagen charakterisieren den Begriff 'Algorithmus' am besten?",
                    options: [
                        { text: "Ein Algorithmus löst ein allgemeines Problem (eine Problemklasse).", correct: true },
                        { text: "Ein Algorithmus beschreibt die Lösung in einer konkreten Programmiersprache.", correct: false },
                        { text: "Ein Algorithmus muss für jede zulässige Eingabe nach endlich vielen Schritten terminieren.", correct: true },
                        { text: "Ein Algorithmus muss immer die schnellste Lösung sein.", correct: false }
                    ]
                },
                {
                    q: "Welche zwei Aussagen zur Komplexität von Sortieralgorithmen treffen zu?",
                    options: [
                        { text: "Im Worst-Case sind Quicksort und Bubblesort gleich schnell.", correct: true, expl: "Beide haben eine Komplexität von O(n²)." },
                        { text: "Im Average-Case ist Bubblesort schneller als Mergesort.", correct: false, expl: "Mergesort (O(n log n)) ist deutlich schneller als Bubblesort (O(n²))." },
                        { text: "Im Worst-Case sind Heapsort und Mergesort gleich schnell.", correct: true, expl: "Beide haben eine garantierte Laufzeit von O(n log n)." },
                        { text: "Im Average-Case ist Insertionsort langsamer als Bubblesort.", correct: false, expl: "Insertionsort ist im Schnitt schneller als Bubblesort." }
                    ]
                }
            ];
            const item = this.getRandomElement(questions);
            let optionsHTML = '';
            item.options.forEach((opt, idx) => {
                optionsHTML += `<label class="block p-2 border border-gray-600 rounded hover:bg-gray-700"><input type="checkbox" class="mr-2" data-correct="${opt.correct}"> ${opt.text}</label>`;
            });
            const solution = "Die korrekten Antworten sind markiert. " + (item.options.find(o=>o.expl)?.expl || '');

            return {
                title: 'Aufgabe 1: Multiple Choice (Wissen)',
                question: `<p class="mb-4">${item.q}</p><div class="space-y-2">${optionsHTML}</div>`,
                solution
            };
        },

        createComplexityTask() {
            const functions = [
                {
                    code: `static void proc(int n) {\n  for (int a=0; a < n; a++) {\n    for (int b=1; b < n; b++) {\n      tuwas(n);\n    }\n  }\n}`,
                    calls_n4: "4 * 3 = 12",
                    calls_n: "n * (n-1)",
                    complexity: "O(n² * n) = O(n³)"
                },
                {
                    code: `static void proc(int n) {\n  if (n > 1) {\n    tuwas(n);\n    proc(n/2);\n    proc(n/2);\n  }\n}`,
                    calls_n4: "1 (n=4) + 2*(n=2) = 3",
                    calls_n: "n - 1",
                    complexity: "O(n * n) = O(n²)"
                }
            ];
            const item = this.getRandomElement(functions);
            return {
                title: 'Aufgabe 2: Komplexität & Rekursion',
                question: `Bestimmen Sie für die folgende Prozedur (Annahme: \`tuwas(n)\` hat die Komplexität O(n)):
                           <div class="code-block my-4">${item.code}</div>
                           Füllen Sie die folgende Tabelle aus:
                           <table class="w-full text-left mt-2"><thead><tr><th class="p-2 border">Anzahl Aufrufe für n=4</th><th class="p-2 border">Aufrufe als Funktion von n</th><th class="p-2 border">Zeitkomplexität</th></tr></thead>
                           <tbody><tr><td class="p-2 border">?</td><td class="p-2 border">?</td><td class="p-2 border">?</td></tr></tbody></table>`,
                solution: `<table class="w-full text-left mt-2"><thead><tr><th class="p-2 border">Anzahl Aufrufe für n=4</th><th class="p-2 border">Aufrufe als Funktion von n</th><th class="p-2 border">Zeitkomplexität</th></tr></thead>
                           <tbody><tr><td class="p-2 border">${item.calls_n4}</td><td class="p-2 border">\\(${item.calls_n}\\)</td><td class="p-2 border">${item.complexity}</td></tr></tbody></table>`
            }
        },

        createCodeCompletionTask() {
            const tasks = [
                {
                    title: "Aufgabe 3: Listen",
                    description: "Vervollständigen Sie die Methode `enqueue`, welche eine Person am Ende der Warteschlange (einfach verkettete Liste ohne `ende`-Zeiger) einfügt.",
                    code: `public void enqueue (Person p) {\n  assert (p!= null);\n  Link<Person> neu = new Link<>(p, null);\n  // TODO: Fügen Sie hier Ihre Lösung ein\n}`,
                    solution: `public void enqueue (Person p) {\n  assert (p!= null);\n  Link<Person> neu = new Link<>(p, null);\n  if (anfang == null) {\n    anfang = neu;\n  } else {\n    Link<Person> current = anfang;\n    while (current.naechster != null) {\n      current = current.naechster;\n    }\n    current.naechster = neu;\n  }\n}`
                },
                {
                    title: "Aufgabe 4: Binäre Suchbäume",
                    description: "Vervollständigen Sie die Methode `maximum`, die iterativ den größten Schlüssel im Suchbaum bestimmt. Ist der Baum leer, soll -1 zurückgegeben werden.",
                    code: `public int maximum() {\n  // TODO: Fügen Sie hier Ihre Lösung ein\n}`,
                    solution: `public int maximum() {\n  if (wurzel == null) {\n    return -1;\n  }\n  Knoten current = wurzel;\n  while (current.rechtesKind != null) {\n    current = current.rechtesKind;\n  }\n  return current.schluessel;\n}`
                }
            ];
            const item = this.getRandomElement(tasks);
            return {
                title: item.title,
                question: `<p class="mb-2">${item.description}</p><div class="code-block">${item.code}</div>`,
                solution: `<div class="solution-code">${item.solution}</div>`
            }
        }
    };

    function generateAudExercises() {
        audExercisesContainer.innerHTML = '';
        const tasks = [
            AudExerciseGenerator.createMultipleChoiceTask(),
            AudExerciseGenerator.createComplexityTask(),
            AudExerciseGenerator.createCodeCompletionTask()
        ];

        tasks.forEach(task => {
            const card = document.createElement('div');
            card.className = 'card p-6 rounded-2xl shadow-xl';
            card.innerHTML = `
                <h3 class="text-xl font-bold text-cyan-400 mb-2">${task.title}</h3>
                <div class="text-gray-300">${task.question}</div>
                <button class="toggle-solution-btn mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors">Lösung anzeigen</button>
                <div class="solution p-4 mt-2 rounded-md">${task.solution}</div>`;
            audExercisesContainer.appendChild(card);
        });

        audExercisesContainer.querySelectorAll('.toggle-solution-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const solution = e.target.nextElementSibling;
                const isVisible = solution.style.display === "block";
                solution.style.display = isVisible ? "none" : "block";
                e.target.textContent = isVisible ? "Lösung anzeigen" : "Lösung verbergen";
                if (window.MathJax) MathJax.typesetPromise();
            });
        });

        // MC Check Logic
        audExercisesContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const parent = e.target.parentElement;
                parent.classList.remove('bg-green-800/50', 'bg-red-800/50');
                if(e.target.checked) {
                    parent.classList.add(e.target.dataset.correct === 'true' ? 'bg-green-800/50' : 'bg-red-800/50');
                }
            });
        });

        if (window.MathJax) MathJax.typesetPromise();
    }

    generateAudExercisesBtn.addEventListener('click', generateAudExercises);
    generateAudExercises();
}