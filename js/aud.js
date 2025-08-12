(() => {
// --- GENERAL SETUP ---
    sessionStorage.setItem('selectedSemester', '2');
    const backBtn = document.querySelector('.back-to-hub-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('navigate-back'));
        });
    }

    if (document.getElementById('aud-app')) {
        setupAud();
    }


    function setupAud() {
        // --- NAVIGATION ---
        const navButtons = document.querySelectorAll('.aud-nav-button');
        const contentSections = document.querySelectorAll('.aud-content-section');

        let graphInitialized = false;

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

                if (targetId === 'aud-graphen' && !graphInitialized) {
                    setupGraphVisualizer();
                    graphInitialized = true;
                }

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
            if(sortExplanation) sortExplanation.innerHTML = explanations[algoSelect.value] || '';
        }

        if(speedSlider) speedSlider.addEventListener('input', (e) => {
            sort_delay = e.target.value;
            if(speedLabel) speedLabel.textContent = `${sort_delay}`;
        });

        function resetSorter() {
            sort_values = [];
            if(sortContainer) sortContainer.innerHTML = '';
            const numBars = 30;
            for (let i = 0; i < numBars; i++) {
                sort_values.push(Math.floor(Math.random() * 95) + 5);
            }
            drawBars(sort_values);
            if(sortStartBtn) sortStartBtn.disabled = false;
            updateSortExplanation();
        }

        function drawBars(arr, comparing = [], sorted = [], pivot = -1) {
            if(!sortContainer) return;
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

        async function sleep(ms = 100) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        if (sortStartBtn) {
            sortStartBtn.addEventListener('click', async () => {
                sortStartBtn.disabled = true;
                const algo = algoSelect.value;
                const delay = document.getElementById('sort-speed-slider').value;

                const sleepSort = () => new Promise(resolve => setTimeout(resolve, delay));

                if (algo === 'bubble') {
                    let n = sort_values.length;
                    for (let i = 0; i < n - 1; i++) {
                        for (let j = 0; j < n - i - 1; j++) {
                            if (sort_values[j] > sort_values[j + 1]) {
                                [sort_values[j], sort_values[j + 1]] = [sort_values[j + 1], sort_values[j]];
                            }
                            drawBars(sort_values, [j, j + 1], Array.from({length: i}, (_, k) => n - 1 - k));
                            await sleepSort();
                        }
                    }
                } else if (algo === 'insertion') {
                    let n = sort_values.length;
                    for (let i = 1; i < n; i++) {
                        let key = sort_values[i];
                        let j = i - 1;
                        while (j >= 0 && sort_values[j] > key) {
                            sort_values[j + 1] = sort_values[j];
                            drawBars(sort_values, [j + 1, i], Array.from({length: i}, (_, k) => k));
                            await sleepSort();
                            j = j - 1;
                        }
                        sort_values[j + 1] = key;
                    }
                } else if (algo === 'selection') {
                    let n = sort_values.length;
                    for (let i = 0; i < n - 1; i++) {
                        let min_idx = i;
                        for (let j = i + 1; j < n; j++){
                            if (sort_values[j] < sort_values[min_idx]) min_idx = j;
                            drawBars(sort_values, [i, j, min_idx], Array.from({length: i}, (_, k) => k));
                            await sleepSort();
                        }
                        [sort_values[min_idx], sort_values[i]] = [sort_values[i], sort_values[min_idx]];
                    }
                } else if (algo === 'quicksort') {
                    async function partition(arr, low, high) {
                        let pivot = arr[high];
                        let i = low - 1;
                        for (let j = low; j < high; j++) {
                            drawBars(arr, [j, i], [], high);
                            await sleepSort();
                            if (arr[j] < pivot) {
                                i++;
                                [arr[i], arr[j]] = [arr[j], arr[i]];
                            }
                        }
                        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
                        return i + 1;
                    }
                    async function quickSort(arr, low, high) {
                        if (low < high) {
                            let pi = await partition(arr, low, high);
                            await quickSort(arr, low, pi - 1);
                            await quickSort(arr, pi + 1, high);
                        }
                    }
                    await quickSort(sort_values, 0, sort_values.length - 1);
                }
                drawBars(sort_values, [], Array.from(Array(sort_values.length).keys()));
            });
        }

        if(sortResetBtn) sortResetBtn.addEventListener('click', resetSorter);
        if(algoSelect) algoSelect.addEventListener('change', updateSortExplanation);
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
            if(!stackContainer) return;
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
            if(!queueContainer) return;
            queueContainer.innerHTML = '';
            queue.forEach(val => {
                const el = document.createElement('div');
                el.className = 'w-16 h-12 bg-cyan-600 text-white flex items-center justify-center rounded transition-all flex-shrink-0 animate-pulse';
                el.textContent = val;
                queueContainer.appendChild(el);
                setTimeout(()=> el.classList.remove('animate-pulse'), 200);
            });
        }

        if(stackPushBtn) stackPushBtn.addEventListener('click', () => {
            if (stackInput.value && stack.length < 5) {
                stack.push(stackInput.value);
                stackInput.value = '';
                updateStack();
            }
        });
        if(stackPopBtn) stackPopBtn.addEventListener('click', () => {
            if (stack.length > 0) {
                stack.pop();
                updateStack();
            }
        });

        if(queueEnqueueBtn) queueEnqueueBtn.addEventListener('click', () => {
            if (queueInput.value && queue.length < 5) {
                queue.push(queueInput.value);
                queueInput.value = '';
                updateQueue();
            }
        });
        if(queueDequeueBtn) queueDequeueBtn.addEventListener('click', () => {
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
                if(bstContainer) bstContainer.insertAdjacentHTML('beforeend', `<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-400 font-bold p-2 bg-gray-900 rounded">Nicht gefunden!</div>`);
                return false;
            }
            if(node.el) {
                node.el.classList.add('animate-ping', 'bg-yellow-500');
                await sleep();
                node.el.classList.remove('animate-ping', 'bg-yellow-500');
            }

            if (value === node.value) {
                if(node.el) node.el.classList.add('bg-green-500');
                return true;
            }
            if (value < node.value) return await searchBstNode(node.left, value);
            else return await searchBstNode(node.right, value);
        }

        function renderBst() {
            if(!bstContainer) return;
            bstContainer.innerHTML = '';
            if (!bstRoot) {
                bstContainer.innerHTML = '<p class="text-center text-gray-400">Füge Zahlen hinzu, um den Baum aufzubauen.</p>';
                return;
            }
            renderBstNodeRecursive(bstRoot, bstContainer, 50, 10, 0);
        }

        function createBstLine(container, x1_pct, y1_pct, x2_pct, y2_pct) {
            const line = document.createElement('div');
            line.className = 'absolute h-px bg-gray-500';
            line.style.zIndex = '0';

            const p1 = { x: (x1_pct / 100) * container.offsetWidth, y: (y1_pct / 100) * container.offsetHeight };
            const p2 = { x: (x2_pct / 100) * container.offsetWidth, y: (y2_pct / 100) * container.offsetHeight };

            const length = Math.hypot(p2.x - p1.x, p2.y - p1.y);
            const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);

            line.style.width = `${length}px`;
            line.style.left = `${p1.x}px`;
            line.style.top = `${p1.y}px`;
            line.style.transformOrigin = '0 0';
            line.style.transform = `rotate(${angle}deg)`;

            return line;
        }

        function renderBstNodeRecursive(node, container, x, y, level, isAvl = false) {
            if (!node || !container) return;

            const horizontalOffset = 50 / Math.pow(2, level + 1);
            const verticalOffset = 15;

            const nextY = y + verticalOffset;
            const nextLevel = level + 1;

            if (node.left) {
                const nextX = x - horizontalOffset;
                container.appendChild(createBstLine(container, x, y, nextX, nextY));
                renderBstNodeRecursive(node.left, container, nextX, nextY, nextLevel, isAvl);
            }

            if (node.right) {
                const nextX = x + horizontalOffset;
                container.appendChild(createBstLine(container, x, y, nextX, nextY));
                renderBstNodeRecursive(node.right, container, nextX, nextY, nextLevel, isAvl);
            }

            const nodeEl = document.createElement('div');
            nodeEl.className = 'absolute w-10 h-10 bg-cyan-600 rounded-full flex items-center justify-center text-white transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2';
            nodeEl.style.left = `${x}%`;
            nodeEl.style.top = `${y}%`;
            nodeEl.style.zIndex = '1';
            node.el = nodeEl;

            if (isAvl) {
                const balanceFactor = (node.height > 0) ? (getHeight(node.right) - getHeight(node.left)) : 0;
                nodeEl.innerHTML = `${node.key}<span class="absolute text-xs -bottom-4 text-amber-300">${balanceFactor}</span>`;
            } else {
                nodeEl.textContent = node.value;
            }

            container.appendChild(nodeEl);
        }

        if(bstInsertBtn) bstInsertBtn.addEventListener('click', () => {
            const val = parseInt(bstInput.value);
            if (!isNaN(val)) {
                bstRoot = insertBstNode(bstRoot, val);
                renderBst();
                bstInput.value = '';
            }
        });
        if(bstSearchBtn) bstSearchBtn.addEventListener('click', async () => {
            const val = parseInt(bstInput.value);
            if (!isNaN(val)) {
                renderBst();
                await searchBstNode(bstRoot, val);
                bstInput.value = '';
            }
        });

        if(bstResetBtn) bstResetBtn.addEventListener('click', () => {
            bstRoot = null;
            renderBst();
        });
        renderBst();

        const avlInput = document.getElementById('avl-input');
        const avlInsertBtn = document.getElementById('avl-insert-btn');
        const avlDeleteBtn = document.getElementById('avl-delete-btn');
        const avlResetBtn = document.getElementById('avl-reset-btn');
        const avlContainer = document.getElementById('avl-container');
        let avlRoot = null;

        class AvlNode {
            constructor(key) {
                this.key = key;
                this.left = null;
                this.right = null;
                this.height = 1;
            }
        }

        const getHeight = (node) => node ? node.height : 0;
        const getBalance = (node) => node ? getHeight(node.right) - getHeight(node.left) : 0;
        const updateHeight = (node) => {
            if(node) node.height = Math.max(getHeight(node.left), getHeight(node.right)) + 1;
        }

        function rotateRR(y) {
            let x = y.left;
            let T2 = x.right;
            x.right = y;
            y.left = T2;
            updateHeight(y);
            updateHeight(x);
            return x;
        }

        function rotateLL(x) {
            let y = x.right;
            let T2 = y.left;
            y.left = x;
            x.right = T2;
            updateHeight(x);
            updateHeight(y);
            return y;
        }

        function insertAvlNode(node, key) {
            if (!node) return new AvlNode(key);
            if (key < node.key) node.left = insertAvlNode(node.left, key);
            else if (key > node.key) node.right = insertAvlNode(node.right, key);
            else return node;

            updateHeight(node);
            let balance = getBalance(node);

            if (balance > 1 && key > node.right.key) return rotateLL(node);
            if (balance < -1 && key < node.left.key) return rotateRR(node);
            if (balance > 1 && key < node.right.key) {
                node.right = rotateRR(node.right);
                return rotateLL(node);
            }
            if (balance < -1 && key > node.left.key) {
                node.left = rotateLL(node.left);
                return rotateRR(node);
            }
            return node;
        }

        function deleteAvlNode(node, key) {
            if (!node) return node;

            if (key < node.key) {
                node.left = deleteAvlNode(node.left, key);
            } else if (key > node.key) {
                node.right = deleteAvlNode(node.right, key);
            } else {
                if (!node.left || !node.right) {
                    node = node.left || node.right;
                } else {
                    let temp = minValueNode(node.right);
                    node.key = temp.key;
                    node.right = deleteAvlNode(node.right, temp.key);
                }
            }

            if (!node) return node;

            updateHeight(node);
            let balance = getBalance(node);

            if (balance > 1) { // Right heavy
                if (getBalance(node.right) >= 0) {
                    return rotateLL(node);
                } else {
                    node.right = rotateRR(node.right);
                    return rotateLL(node);
                }
            }
            if (balance < -1) { // Left heavy
                if (getBalance(node.left) <= 0) {
                    return rotateRR(node);
                } else {
                    node.left = rotateLL(node.left);
                    return rotateRR(node);
                }
            }
            return node;
        }

        function minValueNode(node) {
            let current = node;
            while (current.left !== null) current = current.left;
            return current;
        }

        function renderAvl() {
            if(!avlContainer) return;
            avlContainer.innerHTML = '';
            if (!avlRoot) {
                avlContainer.innerHTML = '<p class="text-center text-gray-400">Füge Zahlen hinzu, um den Baum aufzubauen.</p>';
                return;
            }
            renderBstNodeRecursive(avlRoot, avlContainer, 50, 10, 0, true);
        }

        if(avlInsertBtn) avlInsertBtn.addEventListener('click', () => {
            const val = parseInt(avlInput.value);
            if (!isNaN(val)) {
                avlRoot = insertAvlNode(avlRoot, val);
                renderAvl();
                avlInput.value = '';
            }
        });

        if(avlDeleteBtn) avlDeleteBtn.addEventListener('click', () => {
            const val = parseInt(avlInput.value);
            if (!isNaN(val)) {
                avlRoot = deleteAvlNode(avlRoot, val);
                renderAvl();
                avlInput.value = '';
            }
        });

        if(avlResetBtn) avlResetBtn.addEventListener('click', () => {
            avlRoot = null;
            renderAvl();
        });
        renderAvl();

        // --- GRAPH VISUALIZER ---
        function setupGraphVisualizer() {
            const graphSvgContainer = document.getElementById('graph-svg-container');
            const graphTableContainer = document.getElementById('graph-table-container'); // NEU
            const graphAlgoSelect = document.getElementById('graph-algo-select');
            const dijkstraContainer = document.getElementById('dijkstra-start-node-container');
            const dijkstraStartNodeInput = document.getElementById('dijkstra-start-node');
            const graphNextStepBtn = document.getElementById('graph-next-step-btn');
            const graphResetBtn = document.getElementById('graph-reset-btn');
            const graphNewBtn = document.getElementById('graph-new-btn');
            const graphExplanation = document.getElementById('graph-explanation');

            let nodes = [], edges = [];
            let currentAlgorithmGenerator = null;

            function createGraph() {
                if (!graphSvgContainer) return;
                nodes = [];
                edges = [];
                const numNodes = 7;
                const width = graphSvgContainer.clientWidth;
                const height = graphSvgContainer.clientHeight;

                for (let i = 0; i < numNodes; i++) {
                    nodes.push({
                        id: String.fromCharCode(65 + i),
                        x: Math.random() * (width - 100) + 50,
                        y: Math.random() * (height - 100) + 50
                    });
                }

                for (let i = 0; i < numNodes; i++) {
                    for (let j = i + 1; j < numNodes; j++) {
                        if (Math.random() > 0.6) {
                            edges.push({
                                source: nodes[i].id,
                                target: nodes[j].id,
                                weight: Math.floor(Math.random() * 20) + 1
                            });
                        }
                    }
                }

                for(let i = 0; i < numNodes-1; i++){
                    if(!edges.some(e => (e.source === nodes[i].id && e.target === nodes[i+1].id) || (e.source === nodes[i+1].id && e.target === nodes[i].id))){
                        edges.push({ source: nodes[i].id, target: nodes[i+1].id, weight: Math.floor(Math.random() * 20) + 1});
                    }
                }

                setupAlgorithm();
            }

            function drawGraph() {
                if (!graphSvgContainer) return;
                graphSvgContainer.innerHTML = '';
                const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                svg.setAttribute('width', '100%');
                svg.setAttribute('height', '100%');

                edges.forEach(edge => {
                    const sourceNode = nodes.find(n => n.id === edge.source);
                    const targetNode = nodes.find(n => n.id === edge.target);
                    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                    line.setAttribute('x1', sourceNode.x);
                    line.setAttribute('y1', sourceNode.y);
                    line.setAttribute('x2', targetNode.x);
                    line.setAttribute('y2', targetNode.y);
                    line.classList.add('graph-edge');
                    edge.el = line;

                    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                    text.setAttribute('x', (sourceNode.x + targetNode.x) / 2 + 5);
                    text.setAttribute('y', (sourceNode.y + targetNode.y) / 2 - 5);
                    text.classList.add('edge-weight');
                    text.textContent = edge.weight;
                    edge.textEl = text;

                    svg.appendChild(line);
                    svg.appendChild(text);
                });

                nodes.forEach(node => {
                    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
                    g.classList.add('graph-node');

                    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                    circle.setAttribute('cx', node.x);
                    circle.setAttribute('cy', node.y);
                    circle.setAttribute('r', 15);
                    circle.setAttribute('fill', '#1f2937');
                    circle.setAttribute('stroke', '#0891b2');
                    circle.setAttribute('stroke-width', 2);

                    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                    text.setAttribute('x', node.x);
                    text.setAttribute('y', node.y + 5);
                    text.setAttribute('text-anchor', 'middle');
                    text.setAttribute('fill', '#e5e7eb');
                    text.setAttribute('font-size', '14');
                    text.setAttribute('font-weight', 'bold');
                    text.textContent = node.id;

                    g.appendChild(circle);
                    g.appendChild(text);
                    node.el = g;
                    svg.appendChild(g);
                });

                graphSvgContainer.appendChild(svg);
            }

            // GEÄNDERT: dijkstraGenerator erzeugt jetzt auch die Tabelle
            function* dijkstraGenerator(startNodeId, tableBody) {
                let dist = {};
                let prev = {};
                let pq = new Set(nodes.map(n => n.id));
                nodes.forEach(n => { dist[n.id] = Infinity; prev[n.id] = null; });
                dist[startNodeId] = 0;

                // Initialen Tabellenzustand schreiben
                let initialRow = `<tr><td class="p-2 border font-bold text-gray-400">-</td>`;
                nodes.forEach(n => {
                    initialRow += `<td class="p-2 border font-mono">${dist[n.id] === Infinity ? '∞' : dist[n.id]} / ${prev[n.id] || '-'}</td>`;
                });
                initialRow += `</tr>`;
                if (tableBody) tableBody.innerHTML = initialRow;


                graphExplanation.textContent = `Initialisierung: Distanz zum Startknoten ${startNodeId} ist 0, zu allen anderen ∞.`;
                yield;

                while (pq.size > 0) {
                    let u = [...pq].reduce((a, b) => dist[a] < dist[b] ? a : b);
                    pq.delete(u);

                    nodes.forEach(n => n.el.classList.remove('active'));
                    const uNode = nodes.find(n => n.id === u);
                    uNode.el.classList.add('active');

                    graphExplanation.textContent = `Wähle den unbesuchten Knoten mit der geringsten Distanz: ${u} (Distanz: ${dist[u]}). Markiere ihn als besucht.`;

                    // Neue Tabellenzeile hinzufügen
                    let rowHTML = `<tr><td class="p-2 border font-bold">${u}</td>`;
                    nodes.forEach(n => {
                        rowHTML += `<td class="p-2 border font-mono">${dist[n.id] === Infinity ? '∞' : dist[n.id]} / ${prev[n.id] || '-'}</td>`;
                    });
                    rowHTML += `</tr>`;
                    if (tableBody) tableBody.innerHTML += rowHTML;

                    yield;

                    uNode.el.classList.remove('active');
                    uNode.el.classList.add('visited');
                    if(prev[u]) {
                        const prevEdge = edges.find(e => (e.source === u && e.target === prev[u]) || (e.source === prev[u] && e.target === u));
                        if(prevEdge) prevEdge.el.classList.add('mst');
                    }

                    const neighbors = edges.filter(e => e.source === u || e.target === u)
                        .map(e => e.source === u ? e.target : e.source)
                        .filter(id => pq.has(id));

                    if (neighbors.length === 0) {
                        graphExplanation.textContent = `Knoten ${u} hat keine unbesuchten Nachbarn.`;
                        yield;
                    } else {
                        graphExplanation.textContent = `Untersuche alle Kanten von ${u} zu unbesuchten Nachbarn.`;
                        yield;
                    }

                    for(const v of neighbors){
                        const edge = edges.find(e => (e.source === u && e.target === v) || (e.source === v && e.target === u));
                        edge.el.classList.add('highlighted');
                        let alt = dist[u] + edge.weight;
                        graphExplanation.textContent = `Prüfe Nachbar ${v}: Aktuelle Distanz ist ${dist[v] === Infinity ? '∞' : dist[v]}. Weg über ${u} ist ${dist[u]} + ${edge.weight} = ${alt}.`;
                        yield;

                        if(alt < dist[v]){
                            dist[v] = alt;
                            prev[v] = u;
                            graphExplanation.textContent = `Update: Neuer, kürzerer Weg zu ${v} gefunden! Distanz ist jetzt ${alt}.`;

                            // Tabellenzeile aktualisieren, um den Fortschritt anzuzeigen
                            tableBody.lastChild.remove();
                            let updatedRowHTML = `<tr><td class="p-2 border font-bold">${u}</td>`;
                            nodes.forEach(n => {
                                updatedRowHTML += `<td class="p-2 border font-mono">${dist[n.id] === Infinity ? '∞' : dist[n.id]} / ${prev[n.id] || '-'}</td>`;
                            });
                            updatedRowHTML += `</tr>`;
                            if (tableBody) tableBody.innerHTML += updatedRowHTML;

                            yield;
                        } else {
                            graphExplanation.textContent = `Kein kürzerer Weg zu ${v} gefunden. Distanz bleibt bei ${dist[v]}.`;
                            yield;
                        }
                        edge.el.classList.remove('highlighted');
                    }
                }
                graphExplanation.textContent = "Dijkstra abgeschlossen. Alle kürzesten Wege vom Startknoten gefunden.";
            }

            function* kruskalGenerator() {
                let sortedEdges = [...edges].sort((a,b) => a.weight - b.weight);
                let mst = [];
                let parent = {};
                nodes.forEach(n => parent[n.id] = n.id);

                function find(i) {
                    if (parent[i] === i) return i;
                    return parent[i] = find(parent[i]);
                }
                function union(i, j) {
                    let rootI = find(i);
                    let rootJ = find(j);
                    if(rootI !== rootJ) parent[rootI] = rootJ;
                }

                graphExplanation.textContent = `Alle ${sortedEdges.length} Kanten wurden nach ihrem Gewicht sortiert.`;
                yield;

                for(const edge of sortedEdges){
                    edge.el.classList.add('highlighted');
                    edge.textEl.style.fontWeight = 'bold';
                    graphExplanation.textContent = `Prüfe Kante ${edge.source}-${edge.target} mit dem geringsten Gewicht ${edge.weight}.`;
                    yield;

                    const rootSource = find(edge.source);
                    const rootTarget = find(edge.target);

                    if(rootSource !== rootTarget){
                        union(edge.source, edge.target);
                        mst.push(edge);
                        edge.el.classList.remove('highlighted');
                        edge.el.classList.add('mst');
                        graphExplanation.textContent = `Kante ${edge.source}-${edge.target} verbindet zwei verschiedene Komponenten. Füge sie zum MST hinzu.`;
                        yield;
                    } else {
                        edge.el.classList.remove('highlighted');
                        edge.el.style.stroke = '#ef4444'; // red
                        graphExplanation.textContent = `Kante ${edge.source}-${edge.target} würde einen Zyklus erzeugen. Ignoriere sie.`;
                        yield;
                    }
                    edge.textEl.style.fontWeight = 'normal';
                }
                graphExplanation.textContent = `Kruskal abgeschlossen. Minimaler Spannbaum gefunden (Gesamtgewicht: ${mst.reduce((sum, e) => sum + e.weight, 0)}).`;
            }

            // GEÄNDERT: setupAlgorithm initialisiert jetzt auch die Tabelle
            function setupAlgorithm() {
                drawGraph();
                graphNextStepBtn.disabled = false;
                graphTableContainer.innerHTML = ''; // Tabelle bei jedem Reset/Neustart leeren

                if (graphAlgoSelect.value === 'dijkstra') {
                    const startNodeId = dijkstraStartNodeInput.value.toUpperCase();
                    if (!nodes.find(n => n.id === startNodeId)) {
                        graphExplanation.textContent = "Startknoten nicht gefunden!";
                        graphNextStepBtn.disabled = true;
                        currentAlgorithmGenerator = null;
                        return;
                    }

                    // Tabelle initialisieren
                    const table = document.createElement('table');
                    table.className = 'w-full text-left text-sm table-fixed';
                    table.innerHTML = `<thead><tr class="text-gray-300"><th class="p-2 border border-gray-600 w-1/5">Markiert</th>`
                        + nodes.map(n => `<th class="p-2 border border-gray-600">${n.id} <br><span class="font-normal text-xs">(L/V)</span></th>`).join('')
                        + `</tr></thead><tbody></tbody>`;
                    graphTableContainer.appendChild(table);

                    currentAlgorithmGenerator = dijkstraGenerator(startNodeId, table.querySelector('tbody'));
                    graphExplanation.textContent = `Dijkstra bereit. Startknoten: ${startNodeId}. Klicke auf "Nächster Schritt".`;

                } else { // Kruskal
                    currentAlgorithmGenerator = kruskalGenerator();
                    graphExplanation.textContent = `Kruskal bereit. Klicke auf "Nächster Schritt".`;
                }
            }

            graphNextStepBtn.addEventListener('click', () => {
                if (currentAlgorithmGenerator) {
                    const result = currentAlgorithmGenerator.next();
                    if (result.done) {
                        graphNextStepBtn.disabled = true;
                    }
                }
            });

            graphAlgoSelect.addEventListener('change', () => {
                dijkstraContainer.style.display = (graphAlgoSelect.value === 'dijkstra') ? 'block' : 'none';
                setupAlgorithm();
            });

            dijkstraStartNodeInput.addEventListener('change', () => {
                if (graphAlgoSelect.value === 'dijkstra') setupAlgorithm();
            });

            graphResetBtn.addEventListener('click', setupAlgorithm);
            graphNewBtn.addEventListener('click', createGraph);

            createGraph();
        }


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
                    },
                    {
                        q: "Welche zwei der folgenden Aussagen zum Suchverfahren auf Datenstrukturen treffen zu?",
                        options: [
                            { text: "Binäres Suchen hat bei geordneten Schlüsseln im Worst Case eine Komplexität von O(log n).", correct: true },
                            { text: "Lineares Suchen hat bei geordneten Schlüsseln im Worst Case eine Komplexität von O(n).", correct: true },
                            { text: "Lineares Suchen hat bei ungeordneten Schlüsseln im Average Case eine Komplexität von O(log n).", correct: false },
                            { text: "Interpolationssuche hat bei geordneten Schlüsseln im Worst Case eine Komplexität von O(n²).", correct: false }
                        ]
                    },
                    {
                        q: "Welche zwei der folgenden Aussagen charakterisieren Aspekte des Hash-Verfahrens korrekt?",
                        options: [
                            { text: "Für das Ablegen eines Datensatzes wird durch die Hash-Funktion für einen gegebenen Schlüssel eine Hash-Adresse berechnet.", correct: true },
                            { text: "Bei einer Adresskollision ist das Quadratische Sondieren eine mögliche Strategie, um einen passenden Platz zu ermitteln.", correct: true },
                            { text: "Bei einer Adresskollision ist die Verwendung eines Hash-Puffers eine mögliche Strategie.", correct: false, expl: "Ein Hash-Puffer ist keine Standardstrategie zur Kollisionsbehandlung. Gängige Methoden sind Sondieren oder Verkettung." },
                            { text: "Die Hash-Funktion führt eine binäre Suche durch.", correct: false, expl: "Eine Hash-Funktion berechnet direkt einen Index, sie führt keine Suche durch." }
                        ]
                    },
                    {
                        q: "Welche Aussage charakterisiert einen AVL-Baum korrekt? (Nur eine Antwort)",
                        options: [
                            { text: "Im AVL-Baum darf sich die Höhe der Teilbäume an jedem Knoten um maximal 1 unterscheiden.", correct: true },
                            { text: "Im AVL-Baum sind die Blätter von links nach rechts absteigend sortiert.", correct: false, expl: "In einem Suchbaum sind die Elemente aufsteigend sortiert (In-Order-Traversierung)." },
                            { text: "Ein AVL-Baum ist immer ein vollständiger Binärbaum.", correct: false, expl: "Ein AVL-Baum ist höhenbalanciert, aber nicht notwendigerweise vollständig." },
                            { text: "Rotationen sind im AVL-Baum nur beim Löschen von Knoten notwendig.", correct: false, expl: "Rotationen sind sowohl beim Einfügen als auch beim Löschen notwendig, um die Balance zu wahren." }
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
                    title: 'Aufgabe: Multiple Choice (Wissen)',
                    question: `<p class="mb-4">${item.q}</p><div class="space-y-2">${optionsHTML}</div>`,
                    solution
                };
            },

            createComplexityTask() {
                const functions = [
                    {
                        code: `static void proc(int n) {\\n  for (int a=0; a < n; a++) {\\n    for (int b=1; b < n; b++) {\\n      tuwas(n);\\n    }\\n  }\\n}`,
                        calls_n4: "4 * 3 = 12",
                        calls_n: "n * (n-1)",
                        complexity: "O(n²)"
                    },
                    {
                        code: `static void proc(int n) {\\n  if (n > 1) {\\n    tuwas(n);\\n    proc(n/2);\\n    proc(n/2);\\n  }\\n}`,
                        calls_n4: "1 (n=4) + 2*(n=2) + 4*(n=1) = 7", // korrigiert
                        calls_n: "2^log2(n) - 1 = n - 1",
                        complexity: "O(n)"
                    }
                ];
                const item = this.getRandomElement(functions);
                return {
                    title: 'Aufgabe: Komplexität & Rekursion',
                    question: `Bestimmen Sie für die folgende Prozedur (Annahme: \`tuwas()\` hat die Komplexität O(1)):
                           <div class="code-block my-4">${item.code.replace(/\\n/g, '\\n<br>')}</div>
                           Füllen Sie die folgende Tabelle aus:
                           <table class="w-full text-left mt-2"><thead><tr><th class="p-2 border">Anzahl Aufrufe für n=4</th><th class="p-2 border">Aufrufe als Funktion von n</th><th class="p-2 border">Zeitkomplexität</th></tr></thead>
                           <tbody><tr><td class="p-2 border">?</td><td class="p-2 border">?</td><td class="p-2 border">?</td></tr></tbody></table>`,
                    solution: `<table class="w-full text-left mt-2"><thead><tr><th class="p-2 border">Anzahl Aufrufe für n=4</th><th class="p-2 border">Aufrufe als Funktion von n</th><th class="p-2 border">Zeitkomplexität</th></tr></thead>
                           <tbody><tr><td class="p-2 border">${item.calls_n4}</td><td class="p-2 border">\\(${item.calls_n}\\)</td><td class="p-2 border">${item.complexity}</td></tr></tbody></table>`
                }
            },

            createCodeCompletionTasks() {
                return [
                    {
                        title: "Aufgabe: Listen",
                        question: `<p class="mb-2">Vervollständigen Sie die Methode \`enqueue\`, welche eine Person am Ende der Warteschlange (einfach verkettete Liste ohne \`ende\`-Zeiger) einfügt.</p><pre class="code-block">public void enqueue (Person p) {\\n  assert (p!= null);\\n  Link&lt;Person&gt; neu = new Link&lt;&gt;(p, null);\\n  // TODO: Fügen Sie hier Ihre Lösung ein\\n}</pre>`,
                        solution: `<pre class="solution-code">public void enqueue (Person p) {\\n  assert (p!= null);\\n  Link&lt;Person&gt; neu = new Link&lt;&gt;(p, null);\\n  if (anfang == null) {\\n    anfang = neu;\\n  } else {\\n    Link&lt;Person&gt; current = anfang;\\n    while (current.naechster != null) {\\n      current = current.naechster;\\n    }\\n    current.naechster = neu;\\n  }\\n}</pre>`
                    },
                    {
                        title: "Aufgabe: Binäre Suchbäume",
                        question: `<p class="mb-2">Vervollständigen Sie die Methode \`maximum\`, die iterativ den größten Schlüssel im Suchbaum bestimmt. Ist der Baum leer, soll -1 zurückgegeben werden.</p><pre class="code-block">public int maximum() {\\n  // TODO: Fügen Sie hier Ihre Lösung ein\\n}</pre>`,
                        solution: `<pre class="solution-code">public int maximum() {\\n  if (wurzel == null) {\\n    return -1;\\n  }\\n  Knoten current = wurzel;\\n  while (current.rechtesKind != null) {\\n    current = current.rechtesKind;\\n  }\\n  return current.schluessel;\\n}</pre>`
                    },
                    {
                        title: "Aufgabe: AVL-Bäume",
                        question: `<p class="mb-2">Vervollständigen Sie die Methode \`istAVL\`, die rekursiv prüft, ob ein Baum die AVL-Eigenschaft erfüllt. Sie soll die Höhe des Baumes zurückgeben, wenn er ein AVL-Baum ist, und -1, wenn nicht.</p><pre class="code-block">private int istAVL (Knoten k) {\\n  // TODO: Fügen Sie hier Ihre Lösung ein\\n}</pre>`,
                        solution: `<pre class="solution-code">private int istAVL (Knoten k) {\\n  if (k == null) {\\n    return 0; // Leerer Baum hat Höhe 0 und ist AVL\\n  }\\n\\n  int hoeheLinks = istAVL(k.linkesKind);\\n  if (hoeheLinks == -1) return -1;\\n\\n  int hoeheRechts = istAVL(k.rechtesKind);\\n  if (hoeheRechts == -1) return -1;\\n\\n  if (Math.abs(hoeheLinks - hoeheRechts) > 1) {\\n    return -1; // Verletzung der AVL-Bedingung\\n  }\\n\\n  return 1 + Math.max(hoeheLinks, hoeheRechts);\\n}</pre>`
                    }
                ];
            },

            createSortTraceTask() {
                const arr = Array.from({length: 5}, () => this.getRandomInt(10, 99));
                const initialArr = [...arr];
                let solutionHTML = `<table class="w-full text-left mt-2"><thead><tr><th class="p-2 border">Nach Iteration i</th><th class="p-2 border">Zustand des Feldes</th></tr></thead><tbody>`;
                solutionHTML += `<tr><td class="p-2 border">Start</td><td class="p-2 border font-mono">[${initialArr.join(', ')}]</td></tr>`;

                for (let i = 1; i < arr.length; i++) {
                    let key = arr[i];
                    let j = i - 1;
                    while (j >= 0 && arr[j] > key) {
                        arr[j + 1] = arr[j];
                        j = j - 1;
                    }
                    arr[j + 1] = key;
                    solutionHTML += `<tr><td class="p-2 border">${i}</td><td class="p-2 border font-mono">[<span class="text-cyan-400">${arr.slice(0, i + 1).join(', ')}</span> | ${initialArr.slice(i + 1).join(', ')}]</td></tr>`;
                }
                solutionHTML += `</tbody></table>`;

                return {
                    title: 'Aufgabe: Sortieren',
                    question: `<p class="mb-2">Wenden Sie <strong>Insertionsort</strong> auf das folgende Feld an. Geben Sie den Zustand des Feldes nach jeder Iteration der äußeren Schleife an.</p><div class="code-block my-4 text-center text-xl">${initialArr.join(' | ')}</div>`,
                    solution: solutionHTML
                }
            },

            createHashingTask() {
                const keys = Array.from({length: 4}, () => this.getRandomInt(1, 40));
                const tableSize = 7;
                const table = new Array(tableSize).fill(null);
                let solutionHTML = `<p>Hash-Funktion: \\(h(k) = k \\pmod{7}\\). Kollisionsstrategie: Quadratisches Sondieren \\( (h(k) + i^2) \\pmod{7} \\).</p><ol class="list-decimal list-inside mt-2">`;

                keys.forEach(key => {
                    let i = 0;
                    let index;
                    let steps = [];
                    while (true) {
                        index = (key % tableSize + i * i) % tableSize;
                        steps.push(`Versuch ${i+1}: \\((${key} + ${i*i}) \\pmod{7} = ${index}\\)`);
                        if (table[index] === null) {
                            table[index] = key;
                            break;
                        }
                        i++;
                    }
                    solutionHTML += `<li><b>Schlüssel ${key}:</b> ${steps.join(' → ')}. Platziert an Index ${index}.</li>`;
                });

                let tableHTML = `<div class="grid grid-cols-7 gap-1 mt-4 text-center">`;
                table.forEach((val, idx) => {
                    tableHTML += `<div class="bg-gray-900 p-2"><div class="text-xs text-gray-400">${idx}</div><div class="font-bold text-lg h-8">${val === null ? '' : val}</div></div>`;
                });
                tableHTML += `</div>`;
                solutionHTML += `</ol><h4 class="font-bold mt-4">Endzustand der Tabelle:</h4>${tableHTML}`;

                return {
                    title: 'Aufgabe: Hashing',
                    question: `<p class="mb-2">Fügen Sie nacheinander die Schlüssel <strong>${keys.join(', ')}</strong> in eine leere Hashtabelle der Größe 7 ein. Verwenden Sie die Hash-Funktion \\(h(k) = k \\pmod{7}\\) und als Kollisionsstrategie das <strong>Quadratische Sondieren</strong>.</p>`,
                    solution: solutionHTML
                }
            },

            createGraphTask() {
                const nodes = [
                    { id: 'A', x: 50, y: 50 },
                    { id: 'B', x: 200, y: 50 },
                    { id: 'C', x: 50, y: 150 },
                    { id: 'D', x: 200, y: 150 },
                    { id: 'E', x: 125, y: 220 }
                ];
                const nodeMap = new Map(nodes.map(n => [n.id, n]));

                const edges = [
                    {u: 'A', v: 'B', w: this.getRandomInt(1, 9)}, {u: 'A', v: 'C', w: this.getRandomInt(2, 7)},
                    {u: 'B', v: 'D', w: this.getRandomInt(1, 9)}, {u: 'C', v: 'D', w: this.getRandomInt(2, 8)},
                    {u: 'C', v: 'E', w: this.getRandomInt(3, 10)}, {u: 'D', v: 'E', w: this.getRandomInt(1, 6)}
                ];

                // Adjazenzliste für Dijkstra erstellen
                const adj = {};
                nodes.forEach(n => adj[n.id] = {});
                edges.forEach(edge => {
                    adj[edge.u][edge.v] = edge.w;
                    adj[edge.v][edge.u] = edge.w;
                });

                // SVG-Grafik des Graphen erstellen
                let svgHTML = `<svg width="250" height="270" class="bg-gray-900/50 rounded-md my-4">`;
                // Kanten zeichnen
                edges.forEach(edge => {
                    const n1 = nodeMap.get(edge.u);
                    const n2 = nodeMap.get(edge.v);
                    svgHTML += `<line x1="${n1.x}" y1="${n1.y}" x2="${n2.x}" y2="${n2.y}" class="graph-edge" style="stroke: #6b7280; stroke-width: 2;" />`;
                    svgHTML += `<text x="${(n1.x + n2.x)/2 + 5}" y="${(n1.y + n2.y)/2}" class="edge-weight" style="fill: #e5e7eb; font-size: 14px;">${edge.w}</text>`;
                });
                // Knoten zeichnen
                nodes.forEach(node => {
                    svgHTML += `<g class="graph-node">`;
                    svgHTML += `<circle cx="${node.x}" cy="${node.y}" r="15" style="stroke-width: 2px; stroke: #0891b2; fill: #1f2937;" />`;
                    svgHTML += `<text x="${node.x}" y="${node.y + 5}" text-anchor="middle" style="fill: #e5e7eb; font-size: 14px; font-weight: bold;">${node.id}</text>`;
                    svgHTML += `</g>`;
                });
                svgHTML += `</svg>`;

                const startNode = 'A';

                // --- Dijkstra's Algorithm zur Lösungsgenerierung ---
                const dist = {};
                const prev = {};
                const pq = new Set(nodes.map(n => n.id));
                nodes.forEach(n => { dist[n.id] = Infinity; prev[n] = null; });
                dist[startNode] = 0;

                let solutionHTML = `<table class="w-full text-left mt-2 text-sm"><thead><tr><th class="p-2 border">Markiert</th>`
                    + nodes.map(n => `<th class="p-2 border">${n.id} <br><span class="font-normal">(Länge/Vorg.)</span></th>`).join('')
                    + `</tr></thead><tbody>`;

                while(pq.size > 0) {
                    let u = null;
                    let minDistance = Infinity;
                    for (const node of pq) {
                        if (dist[node] < minDistance) {
                            minDistance = dist[node];
                            u = node;
                        }
                    }

                    if (u === null) break;

                    pq.delete(u);

                    let rowHTML = `<tr><td class="p-2 border font-bold">${u}</td>`;
                    nodes.forEach(n => {
                        rowHTML += `<td class="p-2 border font-mono">${dist[n.id] === Infinity ? '∞' : dist[n.id]} / ${prev[n.id] || '-'}</td>`;
                    });
                    rowHTML += `</tr>`;
                    solutionHTML += rowHTML;


                    for(const v in adj[u]) {
                        if (pq.has(v)) {
                            const weight = adj[u][v];
                            if (dist[u] + weight < dist[v]) {
                                dist[v] = dist[u] + weight;
                                prev[v] = u;
                            }
                        }
                    }
                }
                solutionHTML += `</tbody></table>`;

                return {
                    title: 'Aufgabe: Graphen (Dijkstra)',
                    question: `<p class="mb-2">Führen Sie den <strong>Algorithmus von Dijkstra</strong> auf dem folgenden Graphen aus, um die kürzesten Wege vom Startknoten <strong>A</strong> zu finden. Füllen Sie die Tabelle schrittweise aus.</p>${svgHTML}`,
                    solution: solutionHTML
                }
            }
        };

        function generateAudExercises() {
            if(!audExercisesContainer) return;
            audExercisesContainer.innerHTML = '';

            // --- Generate one of each type ---
            const codeTasks = AudExerciseGenerator.createCodeCompletionTasks();

            const tasks = [
                AudExerciseGenerator.createMultipleChoiceTask(),
                AudExerciseGenerator.createComplexityTask(),
                AudExerciseGenerator.createSortTraceTask(),
                AudExerciseGenerator.createHashingTask(),
                AudExerciseGenerator.createGraphTask(),
                codeTasks[0], // List task
                codeTasks[1], // BST task
                codeTasks[2], // AVL task
            ];

            tasks.forEach(task => {
                const card = document.createElement('div');
                card.className = 'card p-6 rounded-2xl shadow-xl';
                card.innerHTML = `
                <h3 class="text-xl font-bold text-cyan-400 mb-2">${task.title}</h3>
                <div class="text-gray-300">${task.question.replace(/\\n/g, '<br>')}</div>
                <button class="toggle-solution-btn mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors">Lösung anzeigen</button>
                <div class="solution p-4 mt-2 rounded-md">${task.solution.replace(/\\n/g, '<br>')}</div>`;
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

        if(generateAudExercisesBtn) generateAudExercisesBtn.addEventListener('click', generateAudExercises);
        generateAudExercises();
    }
})();