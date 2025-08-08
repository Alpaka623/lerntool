sessionStorage.setItem('selectedSemester', '2');
const backBtn = document.querySelector('.back-to-hub-btn');
if (backBtn) backBtn.addEventListener('click', () => { window.dispatchEvent(new CustomEvent('navigate-back')); });

const insiNavButtons = document.querySelectorAll('.insi-nav-button');
const insiContentSections = document.querySelectorAll('.insi-content-section');
const entropyPasswordInput = document.getElementById('entropy-password');
const entropyResultDiv = document.getElementById('entropy-result');
const chmodUserDiv = document.getElementById('chmod-user');
const chmodGroupDiv = document.getElementById('chmod-group');
const chmodOtherDiv = document.getElementById('chmod-other');
const chmodResultDiv = document.getElementById('chmod-result');
const generateExercisesBtn = document.getElementById('generate-exercises-btn');
const exercisesContainer = document.getElementById('exercises-container');
    // --- INSI LOGIC ---
    function setupInsi() {
        if (!document.getElementById('insi-app')) return;

        insiNavButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetId = button.dataset.insiTarget;
                insiNavButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                insiContentSections.forEach(section => {
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

        if (entropyPasswordInput) {
            entropyPasswordInput.addEventListener('input', calculateEntropy);
            calculateEntropy();
        }

        if (chmodUserDiv && chmodGroupDiv && chmodOtherDiv) {
            [chmodUserDiv, chmodGroupDiv, chmodOtherDiv].forEach(div => {
                div.addEventListener('change', calculateChmod);
            });
            calculateChmod();
        }
        
        if(generateExercisesBtn) {
            generateExercisesBtn.addEventListener('click', generateAllExercises);
            generateAllExercises(); // Generate initial set of exercises
        }
    }

    function calculateEntropy() {
        if (!entropyPasswordInput || !entropyResultDiv) return;
        const password = entropyPasswordInput.value;
        if (password.length === 0) {
            entropyResultDiv.innerHTML = 'Geben Sie ein Passwort ein.';
            return;
        }

        let N = 0;
        if (/[a-z]/.test(password)) N += 26;
        if (/[A-Z]/.test(password)) N += 26;
        if (/[0-9]/.test(password)) N += 10;
        if (/[^a-zA-Z0-9]/.test(password)) N += 32;

        if (N === 0) {
             entropyResultDiv.innerHTML = 'Geben Sie ein Passwort ein.';
             return;
        }

        const L = password.length;
        const entropy = L * (Math.log(N) / Math.log(2));

        let strengthText = 'Sehr schwach';
        let strengthColor = 'text-red-500';
        if (entropy >= 100) {
            strengthText = 'Sehr stark';
            strengthColor = 'text-green-500';
        } else if (entropy >= 70) {
            strengthText = 'Stark';
            strengthColor = 'text-cyan-400';
        } else if (entropy >= 40) {
            strengthText = 'Mittel';
            strengthColor = 'text-yellow-400';
        } else if (entropy >= 20) {
            strengthText = 'Schwach';
            strengthColor = 'text-orange-400';
        }

        entropyResultDiv.innerHTML = `Entropie: ${entropy.toFixed(2)} Bits <span class="${strengthColor}">(${strengthText})</span>`;
    }

    function calculateChmod() {
        if (!chmodUserDiv || !chmodGroupDiv || !chmodOtherDiv || !chmodResultDiv) return;

        const getPermValue = (container) => {
            let value = 0;
            container.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
                value += parseInt(checkbox.dataset.value);
            });
            return value;
        };

        const userPerm = getPermValue(chmodUserDiv);
        const groupPerm = getPermValue(chmodGroupDiv);
        const otherPerm = getPermValue(chmodOtherDiv);

        chmodResultDiv.textContent = `chmod ${userPerm}${groupPerm}${otherPerm} dateiname`;
    }

    // --- DYNAMIC EXERCISE GENERATION (for INSI) ---
    const InsiExerciseGenerator = {
        getRandomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; },
        getRandomElement(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
        
        createCveTask() {
            const cves = [
                { id: 'CVE-2014-0160', name: 'Heartbleed', type: 'CWE-126: Buffer Over-read', baseScore: '7.5 HIGH', vector: 'AV:N/AC:L/Au:N/C:P/I:N/A:N' },
                { id: 'CVE-2021-44228', name: 'Log4Shell', type: 'CWE-502: Deserialization of Untrusted Data', baseScore: '10.0 CRITICAL', vector: 'AV:N/AC:L/Au:N/C:C/I:C/A:C' },
                { id: 'CVE-2017-5638', name: 'Apache Struts RCE', type: 'CWE-20: Improper Input Validation', baseScore: '10.0 CRITICAL', vector: 'AV:N/AC:L/Au:N/C:C/I:C/A:C' },
                { id: 'CVE-2024-3094', name: 'XZ Utils Backdoor', type: 'CWE-506: Embedded Malicious Code', baseScore: '10.0 CRITICAL', vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H'}
            ];
            const cve = this.getRandomElement(cves);
            const question = `Recherchieren Sie die Schwachstelle <b>${cve.name} (${cve.id})</b>. Was ist der zugehörige Schwachstellentyp (CWE) und wie lautet der CVSS v2 Vector String?`;
            const solution = `<p>Die Schwachstelle <b>${cve.name}</b> hat die ID <b>${cve.id}</b>.</p>
                              <ul class="list-disc list-inside mt-2">
                                <li><b>Schwachstellentyp:</b> ${cve.type}</li>
                                <li><b>CVSS v2 Base Score:</b> ${cve.baseScore}</li>
                                <li><b>CVSS v2 Vector:</b> ${cve.vector}</li>
                              </ul>`;
            return { title: 'Grundlagen: CVE-Analyse', question, solution };
        },

        createRsaTask() {
            const primes = [11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
            let p, q;
            do {
                p = this.getRandomElement(primes);
                q = this.getRandomElement(primes);
            } while (p === q);

            const n = p * q;
            const phi_n = (p - 1) * (q - 1);
            
            let e;
            do {
                e = this.getRandomElement([3, 5, 7, 11, 17]);
            } while (this.gcd(e, phi_n) !== 1 || e >= phi_n);

            const d = this.modInverse(e, phi_n);

            const question = `Für eine RSA-Verschlüsselung werden die Primzahlen <b>p = ${p}</b> und <b>q = ${q}</b> sowie der öffentliche Exponent <b>e = ${e}</b> gewählt. Berechnen Sie den öffentlichen Modul n und den privaten Exponenten d.`;
            const solution = `<p><b>1. Berechnung von n und φ(n):</b></p>
                              <p>\(n = p \\cdot q = ${p} \\cdot ${q} = ${n}\)</p>
                              <p>\(\\phi(n) = (p-1)(q-1) = ${p-1} \\cdot ${q-1} = ${phi_n}\)</p>
                              <p class="mt-2"><b>2. Überprüfung von e:</b></p>
                              <p>\(ggT(e, \\phi(n)) = ggT(${e}, ${phi_n}) = 1\). Der Exponent ist gültig.</p>
                              <p class="mt-2"><b>3. Berechnung von d (privater Exponent):</b></p>
                              <p>Wir suchen \(d \\equiv e^{-1} \\pmod{\\phi(n)}\), also \(d \\equiv ${e}^{-1} \\pmod{${phi_n}}\).<br>
                              Mithilfe des Erweiterten Euklidischen Algorithmus findet man: \(d = ${d}\).<br>
                              Der private Schlüssel ist daher \(K_{pr}=(${n}, ${d})\).</p>`;
            return { title: 'Krypto: RSA-Schlüsselerzeugung', question, solution };
        },
        
        createDsgvoTask() {
            const scenarios = [
                { scenario: "Ein Mitarbeiter verliert einen unverschlüsselten Firmenlaptop mit Kundendaten im Zug.", meldepflicht: "Ja", informationspflicht: "Ja, hohes Risiko", grund: "Verletzung der Vertraulichkeit. Da die Daten unverschlüsselt sind, besteht ein hohes Risiko für die Rechte und Freiheiten der Betroffenen (z.B. Identitätsdiebstahl)." },
                { scenario: "Ein Werbe-Newsletter wird versehentlich mit allen Empfängern im 'CC'-Feld statt im 'BCC'-Feld versendet.", meldepflicht: "Ja", informationspflicht: "In der Regel nicht", grund: "Verletzung der Vertraulichkeit (E-Mail-Adressen offengelegt). Das Risiko wird oft als nicht hoch eingeschätzt, daher ist eine Benachrichtigung der Betroffenen meist ausreichend, aber keine Meldung an die Behörde, es sei denn, es handelt sich um besonders sensible Adressaten." },
                { scenario: "Ein Server fällt wegen eines Hardwaredefekts für 2 Stunden aus. Es gibt Backups, aber die Daten sind in dieser Zeit nicht erreichbar.", meldepflicht: "Nein", informationspflicht: "Nein", grund: "Dies ist eine Verletzung der Verfügbarkeit, aber in der Regel keine meldepflichtige Verletzung des Schutzes personenbezogener Daten nach Art. 33 DSGVO, solange keine Daten verloren gehen oder offengelegt werden und der Ausfall temporär ist." },
                { scenario: "Ein Hacker verschlüsselt die Kundendatenbank mit Ransomware und fordert Lösegeld.", meldepflicht: "Ja", informationspflicht: "Ja, hohes Risiko", grund: "Verletzung der Verfügbarkeit und potenziell der Vertraulichkeit (falls Daten auch exfiltriert wurden). Da der Zugriff auf die Daten verwehrt wird und ein Datenabfluss nicht ausgeschlossen werden kann, besteht ein hohes Risiko." }
            ];
            const item = this.getRandomElement(scenarios);
            const question = `Bewerten Sie folgenden Vorfall im Kontext der DSGVO: <b>${item.scenario}</b> Ist der Vorfall gemäß Art. 33 DSGVO meldepflichtig und besteht eine Informationspflicht an die Betroffenen gemäß Art. 34 DSGVO? Begründen Sie.`;
            const solution = `<ul class="list-disc list-inside mt-2">
                                <li><b>Meldepflicht an die Aufsichtsbehörde?</b> ${item.meldepflicht}</li>
                                <li><b>Informationspflicht an Betroffene?</b> ${item.informationspflicht}</li>
                              </ul>
                              <p class="mt-2"><b>Begründung:</b> ${item.grund}</p>`;
            return { title: 'Recht: DSGVO-Fallstudie', question, solution };
        },

        createChmodTask() {
            const users = ['Alice', 'Bob', 'Dave', 'Eve'];
            const files = ['report.docx', 'run.sh', 'config.json', 'data.log'];
            const perms = [
                { text: 'lesen und ausführen', val: 5, str: 'r-x' },
                { text: 'lesen und schreiben', val: 6, str: 'rw-' },
                { text: 'volle Rechte', val: 7, str: 'rwx' },
                { text: 'nur lesen', val: 4, str: 'r--' },
                 { text: 'keine Rechte', val: 0, str: '---' },
            ];
            
            const user = this.getRandomElement(users);
            const file = this.getRandomElement(files);
            const userPerm = this.getRandomElement(perms);
            const groupPerm = this.getRandomElement(perms);
            const otherPerm = this.getRandomElement(perms);

            const question = `Der Benutzer <b>${user}</b> ist Besitzer der Datei <b>${file}</b>. Er selbst benötigt <b>${userPerm.text}</b>. Seine primäre Gruppe 'staff' benötigt <b>${groupPerm.text}</b>. Alle anderen Benutzer sollen <b>${otherPerm.text}</b> haben. Welchen oktalen \`chmod\`-Befehl muss ${user} ausführen?`;
            const solution = `<p>Die Berechtigungen werden wie folgt in Oktalzahlen umgerechnet:</p>
                              <ul class="list-disc list-inside mt-2">
                                <li>Besitzer (User): ${userPerm.text} = ${userPerm.str} = <b>${userPerm.val}</b></li>
                                <li>Gruppe (Group): ${groupPerm.text} = ${groupPerm.str} = <b>${groupPerm.val}</b></li>
                                <li>Andere (Other): ${otherPerm.text} = ${otherPerm.str} = <b>${otherPerm.val}</b></li>
                              </ul>
                              <p class="mt-2">Der korrekte Befehl lautet daher:</p>
                              <p class="font-mono bg-gray-900 p-2 rounded-md mt-1">chmod ${userPerm.val}${groupPerm.val}${otherPerm.val} ${file}</p>`;
            return { title: 'Zugriffskontrolle: chmod', question, solution };
        },
        
        createEntropyTask() {
            const length = this.getRandomInt(8, 12);
            const hasLower = Math.random() > 0.2;
            const hasUpper = Math.random() > 0.2;
            const hasDigit = Math.random() > 0.3;
            const hasSpecial = Math.random() > 0.4;

            let N = 0;
            let description = [];
            if(hasLower) { N += 26; description.push("Kleinbuchstaben (a-z)"); }
            if(hasUpper) { N += 26; description.push("Großbuchstaben (A-Z)"); }
            if(hasDigit) { N += 10; description.push("Ziffern (0-9)"); }
            if(hasSpecial) { N += 32; description.push("üblichen Sonderzeichen"); }
            if (N===0) { N=26; description.push("Kleinbuchstaben (a-z)"); }


            const entropy = length * (Math.log(N) / Math.log(2));

            const question = `Ein Passwort hat eine Länge von <b>${length}</b> Zeichen. Es wird zufällig aus einem Zeichenvorrat gebildet, der ${description.join(', ')} enthält. Berechnen Sie die Entropie dieses Passworts.`;
            const solution = `<p>Die Entropie H berechnet sich nach der Formel \(H = L \\cdot \\log_2(N)\).</p>
                              <ul class="list-disc list-inside mt-2">
                                <li><b>Länge (L):</b> ${length}</li>
                                <li><b>Größe des Zeichenvorrats (N):</b> ${N} (${description.join(' + ')})</li>
                                <li><b>Berechnung:</b> \(H = ${length} \\cdot \\log_2(${N}) \\approx ${length} \\cdot ${Math.log2(N).toFixed(2)} \\approx ${entropy.toFixed(2)}\) Bits.</li>
                              </ul>`;
            return { title: 'Authentifikation: Passwort-Entropie', question, solution };
        },

        gcd(a, b) {
            return b === 0 ? a : this.gcd(b, a % b);
        },
        modInverse(a, m) {
            for (let x = 1; x < m; x++) {
                if (((a % m) * (x % m)) % m === 1) {
                    return x;
                }
            }
            return 1;
        }
    };

    function generateAllExercises() {
        if (!exercisesContainer) return;
        exercisesContainer.innerHTML = '';

        const tasks = [
            InsiExerciseGenerator.createCveTask(),
            InsiExerciseGenerator.createRsaTask(),
            InsiExerciseGenerator.createEntropyTask(),
            InsiExerciseGenerator.createChmodTask(),
            InsiExerciseGenerator.createDsgvoTask(),
        ];

        tasks.forEach(task => {
            const card = document.createElement('div');
            card.className = 'card p-6 rounded-2xl shadow-xl';
            card.innerHTML = `
                <h3 class="text-xl font-bold text-cyan-400 mb-2">${task.title}</h3>
                <p class="text-gray-300">${task.question}</p>
                <button class="toggle-solution-btn mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors">Lösung anzeigen</button>
                <div class="solution p-4 mt-2 rounded-md">${task.solution}</div>
            `;
            exercisesContainer.appendChild(card);
        });

        exercisesContainer.querySelectorAll('.toggle-solution-btn').forEach(button => {
            button.addEventListener('click', () => {
                const solution = button.nextElementSibling;
                if (solution.style.display === "block") {
                    solution.style.display = "none";
                    button.textContent = "Lösung anzeigen";
                } else {
                    solution.style.display = "block";
                    button.textContent = "Lösung verbergen";
                    if (window.MathJax) {
                        MathJax.typesetPromise([solution]);
                    }
                }
            });
        });
        
        if (window.MathJax) {
            MathJax.typesetPromise(Array.from(exercisesContainer.children));
        }
    }

setupInsi();
    
