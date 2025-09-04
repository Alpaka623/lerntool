(() => {
    sessionStorage.setItem('selectedSemester', '1');
    const backBtn = document.querySelector('.back-to-hub-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('navigate-back'));
        });
    }

    if (document.getElementById('bwl-app')) {
        setupBwl();
    }

    function setupBwl() {
        const navButtons = document.querySelectorAll('.bwl-nav-button');
        const contentSections = document.querySelectorAll('.bwl-content-section');
        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetId = button.dataset.bwlTarget;
                navButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                contentSections.forEach(section => {
                    section.classList.remove('active');
                    if (section.id === targetId) section.classList.add('active');
                });
            });
        });

        class Calculation {
            static roundNumber(value, step = 0.01) {
                if (step === null) step = 1.0;
                const inv = 1.0 / step;
                return Math.round(value * inv) / inv;
            }
            static getRandomValue(min, max, step = 0.01) {
                const tmp = min + Math.random() * (max - min);
                return this.roundNumber(tmp, step);
            }
            constructor() {
                this.grossPurchasePrice = Calculation.getRandomValue(1000, 50000, 0.01);
                this.deliveryDiscountPercent = Calculation.getRandomValue(0, 30, 0.5);
                this.deliveryAccountPercent = Calculation.getRandomValue(0, 4, 0.5);
                this.purchasingCosts = Calculation.getRandomValue(0, 1000, 0.01);
                this.businessCosts = Calculation.getRandomValue(0, 200, 0.01);
                this.profitPercent = Calculation.getRandomValue(0, 200, 0.01);
                this.customerCashDiscountPercent = Calculation.getRandomValue(0, 4, 0.5);
                this.agentCommissionPercent = Calculation.getRandomValue(0, 2, 0.5);
                this.customerDiscountPercent = Calculation.getRandomValue(0, 30, 0.5);
                this.valueAddedTaxPercent = 19;
                this.calculateValues();
            }
            calculateValues() {
                this.netPurchasePrice = Calculation.roundNumber(this.grossPurchasePrice / (1 + this.valueAddedTaxPercent / 100));
                this.targetPurchasePrice = Calculation.roundNumber(this.netPurchasePrice * (1 - this.deliveryDiscountPercent / 100));
                this.cashPurchasePrice = Calculation.roundNumber(this.targetPurchasePrice * (1 - this.deliveryAccountPercent / 100));
                this.costPrice = Calculation.roundNumber(this.cashPurchasePrice + this.purchasingCosts);
                this.primaryCosts = Calculation.roundNumber(this.costPrice * (1 + this.businessCosts / 100));
                this.cashSalePrice = Calculation.roundNumber(this.primaryCosts * (1 + this.profitPercent / 100));
                this.targetSalePrice = Calculation.roundNumber(this.cashSalePrice / (1 - (this.customerCashDiscountPercent + this.agentCommissionPercent) / 100));
                this.listSalePrice = Calculation.roundNumber(this.targetSalePrice / (1 - this.customerDiscountPercent / 100));
                this.grossSalePrice = Calculation.roundNumber(this.listSalePrice * (1 + this.valueAddedTaxPercent / 100));
            }
        }

        const container = document.getElementById('kalkulation-container');
        const generateBtn = document.getElementById('generate-task-btn');
        const solutionBtn = document.getElementById('show-solution-btn');
        const stepsBtn = document.getElementById('show-steps-btn');
        const stepsContainer = document.getElementById('solution-steps');
        let solution;

        const schema = [
            { id: 'grossPurchasePrice', label: 'Bruttoeinkaufspreis', valueId: 'grossPurchasePrice' },
            { id: 'netPurchasePrice', label: 'Nettobekaufspreis', valueId: 'netPurchasePrice' },
            { id: 'deliveryDiscountPercent', label: 'Lieferantenrabatt', percentId: 'deliveryDiscountPercent' },
            { id: 'targetPurchasePrice', label: '<strong>Zieleinkaufspreis</strong>', valueId: 'targetPurchasePrice' },
            { id: 'deliveryAccountPercent', label: 'Lieferantenskonto', percentId: 'deliveryAccountPercent' },
            { id: 'cashPurchasePrice', label: '<strong>Bareinkaufspreis</strong>', valueId: 'cashPurchasePrice' },
            { id: 'purchasingCosts', label: 'Bezugskosten', valueId: 'purchasingCosts' },
            { id: 'costPrice', label: '<strong>Bezugspreis</strong>', valueId: 'costPrice' },
            { isSeparator: true },
            { id: 'businessCosts', label: 'Gemeinkostenzuschlag', percentId: 'businessCosts' },
            { id: 'primaryCosts', label: '<strong>Selbstkostenpreis</strong>', valueId: 'primaryCosts' },
            { id: 'profitPercent', label: 'Gewinnaufschlag', percentId: 'profitPercent' },
            { id: 'cashSalePrice', label: '<strong>Barverkaufspreis</strong>', valueId: 'cashSalePrice' },
            { isSeparator: true },
            { id: 'customerCashDiscountPercent', label: 'Kundenskonto', percentId: 'customerCashDiscountPercent' },
            { id: 'agentCommissionPercent', label: 'Vertreterprovision', percentId: 'agentCommissionPercent' },
            { id: 'targetSalePrice', label: '<strong>Zielverkaufspreis</strong>', valueId: 'targetSalePrice' },
            { id: 'customerDiscountPercent', label: 'Kundenrabatt', percentId: 'customerDiscountPercent' },
            { id: 'listSalePrice', label: '<strong>Listenpreis</strong>', valueId: 'listSalePrice' },
            { isSeparator: true },
            { id: 'valueAddedTaxPercent', label: 'Mehrwertsteuer', percentId: 'valueAddedTaxPercent' },
            { id: 'grossSalePrice', label: '<strong>Bruttoverkaufspreis</strong>', valueId: 'grossSalePrice' },
        ];

        function generateTask() {
            solution = new Calculation();
            container.innerHTML = '';
            stepsContainer.style.display = 'none';

            const allPossibleFields = schema.filter(row => !row.isSeparator);
            const targetField = allPossibleFields[Math.floor(Math.random() * allPossibleFields.length)];
            const targetId = targetField.id;

            const givenKeys = new Set([
                'grossPurchasePrice', 'grossSalePrice', 'deliveryDiscountPercent', 'deliveryAccountPercent',
                'purchasingCosts', 'businessCosts', 'profitPercent', 'customerCashDiscountPercent',
                'agentCommissionPercent', 'customerDiscountPercent', 'valueAddedTaxPercent'
            ]);

            if (givenKeys.has(targetId)) {
                givenKeys.delete(targetId);
            }

            const instructionTargetText = targetField.label.replace(/<[^>]*>/g, '') + (targetField.percentId ? ' in %' : ' in €');

            const instructionDiv = document.createElement('div');
            instructionDiv.className = 'calc-instruction';
            instructionDiv.innerHTML = `Berechnen Sie den <strong>${instructionTargetText}</strong> und tragen Sie alle Zwischenwerte in die leeren Felder ein.`;
            container.appendChild(instructionDiv);

            schema.forEach(row => {
                if (row.isSeparator) {
                    const separator = document.createElement('div');
                    separator.className = 'calc-separator';
                    container.appendChild(separator);
                    return;
                }

                const rowDiv = document.createElement('div');
                rowDiv.className = 'calc-row';
                if (row.id === targetId) {
                    rowDiv.classList.add('target-row');
                }
                container.appendChild(rowDiv);

                // Spalte 1: Bezeichnung
                const labelDiv = document.createElement('div');
                labelDiv.className = 'calc-label';
                labelDiv.innerHTML = row.label;
                rowDiv.appendChild(labelDiv);

                // Spalte 2: Prozentsatz
                let percentEl;
                if (row.percentId) {
                    const isGiven = givenKeys.has(row.percentId);
                    percentEl = document.createElement(isGiven ? 'div' : 'input');
                    percentEl.className = `calc-percent ${isGiven ? 'given' : 'input'}`;
                    percentEl.id = `field-${row.percentId}`;
                    if (isGiven) {
                        percentEl.textContent = solution[row.percentId].toFixed(2) + ' %';
                    } else {
                        percentEl.type = 'number';
                        percentEl.step = '0.01';
                        percentEl.placeholder = '%';
                    }
                } else {
                    percentEl = document.createElement('div'); // Leerer Platzhalter
                }
                rowDiv.appendChild(percentEl);

                // Spalte 3: Wert
                let valueEl;
                if (row.valueId) {
                    const isGiven = givenKeys.has(row.valueId);
                    valueEl = document.createElement(isGiven ? 'div' : 'input');
                    valueEl.className = `calc-value ${isGiven ? 'given' : 'input'}`;
                    valueEl.id = `field-${row.valueId}`;
                    if (isGiven) {
                        valueEl.textContent = solution[row.valueId].toFixed(2) + ' €';
                    } else {
                        valueEl.type = 'number';
                        valueEl.step = '0.01';
                        valueEl.placeholder = '€';
                    }
                } else {
                    valueEl = document.createElement('div'); // Leerer Platzhalter
                }
                rowDiv.appendChild(valueEl);
            });
        }

        function showSolution() {
            if (!solution) return;

            schema.forEach(row => {
                if (row.isSeparator) return;
                const fieldId = row.id;
                if (!fieldId) return;

                const correctValue = solution[fieldId];
                const inputEl = document.getElementById(`field-${fieldId}`);

                if (inputEl && inputEl.tagName === 'INPUT') {
                    const userValue = parseFloat(inputEl.value);
                    const isCorrect = !isNaN(userValue) && Math.abs(userValue - correctValue) < 0.02;

                    inputEl.value = correctValue.toFixed(2);
                    inputEl.classList.toggle('correct', isCorrect);
                    inputEl.classList.toggle('incorrect', !isCorrect);
                }
            });
        }

        function showCalculationSteps() {
            if (!solution) return;
            stepsContainer.style.display = 'block';

            let html = '<h3>Lösungsweg mit Erklärungen</h3><ol>';
            const s = solution;

            html += `<li><b>Nettobekaufspreis (Rückwärts):</b> <span class="explanation">Der Bruttopreis enthält 119% des Nettopreises. Um zum Nettopreis (100%) zu gelangen, teilen wir durch 1,19. </span><code>${s.grossPurchasePrice.toFixed(2)} € / 1,19 = ${s.netPurchasePrice.toFixed(2)} €</code></li>`;
            html += `<li><b>Zieleinkaufspreis (Vorwärts, "vom Hundert"):</b> <span class="explanation">Vom Nettopreis (Grundwert) wird ein Rabatt abgezogen. Wir rechnen 'vom Hundert' und multiplizieren. </span><code>${s.netPurchasePrice.toFixed(2)} € * (1 - ${s.deliveryDiscountPercent / 100}) = ${s.targetPurchasePrice.toFixed(2)} €</code></li>`;
            html += `<li><b>Bareinkaufspreis (Vorwärts, "vom Hundert"):</b> <span class="explanation">Vom Zieleinkaufspreis wird Skonto abgezogen. </span><code>${s.targetPurchasePrice.toFixed(2)} € * (1 - ${s.deliveryAccountPercent / 100}) = ${s.cashPurchasePrice.toFixed(2)} €</code></li>`;
            html += `<li><b>Bezugspreis:</b> <span class="explanation">Die Bezugskosten werden einfach auf den Bareinkaufspreis addiert. </span><code>${s.cashPurchasePrice.toFixed(2)} € + ${s.purchasingCosts.toFixed(2)} € = ${s.costPrice.toFixed(2)} €</code></li>`;
            html += `<li><b>Selbstkostenpreis (Vorwärts, "auf Hundert"):</b> <span class="explanation">Auf den Bezugspreis (Grundwert) werden die Gemeinkosten aufgeschlagen. </span><code>${s.costPrice.toFixed(2)} € * (1 + ${s.businessCosts / 100}) = ${s.primaryCosts.toFixed(2)} €</code></li>`;
            html += `<li><b>Barverkaufspreis (Vorwärts, "auf Hundert"):</b> <span class="explanation">Auf die Selbstkosten wird der Gewinn aufgeschlagen. </span><code>${s.primaryCosts.toFixed(2)} € * (1 + ${s.profitPercent / 100}) = ${s.cashSalePrice.toFixed(2)} €</code></li>`;
            const skontoProvProzent = s.customerCashDiscountPercent + s.agentCommissionPercent;
            html += `<li><b>Zielverkaufspreis (Rückwärts, "im Hundert"):</b> <span class="explanation">Der Barverkaufspreis ist der verminderte Wert (z.B. 98%). Um den Grundwert (100%) zu finden, müssen wir teilen. </span><code>${s.cashSalePrice.toFixed(2)} € / (1 - ${skontoProvProzent / 100}) = ${s.targetSalePrice.toFixed(2)} €</code></li>`;
            html += `<li><b>Listenpreis (Rückwärts, "im Hundert"):</b> <span class="explanation">Der Zielverkaufspreis ist der verminderte Wert nach Kundenrabatt. Wir teilen erneut, um den Grundwert zu finden. </span><code>${s.targetSalePrice.toFixed(2)} € / (1 - ${s.customerDiscountPercent / 100}) = ${s.listSalePrice.toFixed(2)} €</code></li>`;
            html += `<li><b>Bruttoverkaufspreis (Vorwärts):</b> <span class="explanation">Auf den Netto-Listenpreis (Grundwert) wird die MwSt. aufgeschlagen. </span><code>${s.listSalePrice.toFixed(2)} € * 1,19 = ${s.grossSalePrice.toFixed(2)} €</code></li>`;

            html += '</ol>';
            stepsContainer.innerHTML = html;
        }

        generateBtn.addEventListener('click', generateTask);
        solutionBtn.addEventListener('click', showSolution);
        stepsBtn.addEventListener('click', showCalculationSteps);

        generateTask();
    }
})();