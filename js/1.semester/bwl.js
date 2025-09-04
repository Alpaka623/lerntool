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
            { id: 'grossPurchasePrice', label: 'Bruttoeinkaufspreis', type: 'value' },
            { id: 'netPurchasePrice', label: 'Nettobekaufspreis', type: 'value' },
            { id: 'deliveryDiscountPercent', label: 'Lieferantenrabatt', type: 'percent' },
            { id: 'targetPurchasePrice', label: '<strong>Zieleinkaufspreis</strong>', type: 'value' },
            { id: 'deliveryAccountPercent', label: 'Lieferantenskonto', type: 'percent' },
            { id: 'cashPurchasePrice', label: '<strong>Bareinkaufspreis</strong>', type: 'value' },
            { id: 'purchasingCosts', label: 'Bezugskosten', type: 'value' },
            { id: 'costPrice', label: '<strong>Bezugspreis</strong>', type: 'value' },
            { isSeparator: true },
            { id: 'businessCosts', label: 'Gemeinkostenzuschlag', type: 'percent' },
            { id: 'primaryCosts', label: '<strong>Selbstkostenpreis</strong>', type: 'value' },
            { id: 'profitPercent', label: 'Gewinnaufschlag', type: 'percent' },
            { id: 'cashSalePrice', label: '<strong>Barverkaufspreis</strong>', type: 'value' },
            { isSeparator: true },
            { id: 'customerCashDiscountPercent', label: 'Kundenskonto', type: 'percent' },
            { id: 'agentCommissionPercent', label: 'Vertreterprovision', type: 'percent' },
            { id: 'targetSalePrice', label: '<strong>Zielverkaufspreis</strong>', type: 'value' },
            { id: 'customerDiscountPercent', label: 'Kundenrabatt', type: 'percent' },
            { id: 'listSalePrice', label: '<strong>Listenpreis</strong>', type: 'value' },
            { isSeparator: true },
            { id: 'valueAddedTaxPercent', label: 'Mehrwertsteuer', type: 'percent' },
            { id: 'grossSalePrice', label: '<strong>Bruttoverkaufspreis</strong>', type: 'value' },
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

            const instructionTargetText = targetField.label.replace(/<[^>]*>/g, '') + (targetField.type === 'percent' ? ' in %' : ' in €');

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

                // Spalte 1: Bezeichnung (Label)
                const labelDiv = document.createElement('div');
                labelDiv.className = 'calc-label';
                labelDiv.innerHTML = row.label;
                rowDiv.appendChild(labelDiv);

                // Spalte 2: Prozentsatz
                const percentCell = document.createElement('div');
                if (row.type === 'percent') {
                    const isGiven = givenKeys.has(row.id);
                    if (isGiven) {
                        percentCell.className = 'calc-percent given';
                        percentCell.textContent = solution[row.id].toFixed(2) + ' %';
                    } else {
                        percentCell.innerHTML = `<input type="number" step="0.01" class="calc-percent input" id="field-${row.id}" placeholder="%">`;
                    }
                }
                rowDiv.appendChild(percentCell);

                // Spalte 3: Wert
                const valueCell = document.createElement('div');
                if (row.type === 'value') {
                    const isGiven = givenKeys.has(row.id);
                    if (isGiven) {
                        valueCell.className = 'calc-value given';
                        valueCell.textContent = solution[row.id].toFixed(2) + ' €';
                    } else {
                        valueCell.innerHTML = `<input type="number" step="0.01" class="calc-value input" id="field-${row.id}" placeholder="€">`;
                    }
                }
                rowDiv.appendChild(valueCell);

                container.appendChild(rowDiv);
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

            let html = '<h3>Lösungsweg</h3><ol>';

            html += `<li><b>Nettobekaufspreis:</b> <code>${solution.grossPurchasePrice.toFixed(2)} € / 1,19 = ${solution.netPurchasePrice.toFixed(2)} €</code></li>`;
            html += `<li><b>Zieleinkaufspreis:</b> <code>${solution.netPurchasePrice.toFixed(2)} € * (1 - ${solution.deliveryDiscountPercent / 100}) = ${solution.targetPurchasePrice.toFixed(2)} €</code></li>`;
            html += `<li><b>Bareinkaufspreis:</b> <code>${solution.targetPurchasePrice.toFixed(2)} € * (1 - ${solution.deliveryAccountPercent / 100}) = ${solution.cashPurchasePrice.toFixed(2)} €</code></li>`;
            html += `<li><b>Bezugspreis:</b> <code>${solution.cashPurchasePrice.toFixed(2)} € + ${solution.purchasingCosts.toFixed(2)} € = ${solution.costPrice.toFixed(2)} €</code></li>`;
            html += `<li><b>Selbstkostenpreis:</b> <code>${solution.costPrice.toFixed(2)} € * (1 + ${solution.businessCosts / 100}) = ${solution.primaryCosts.toFixed(2)} €</code></li>`;
            html += `<li><b>Barverkaufspreis:</b> <code>${solution.primaryCosts.toFixed(2)} € * (1 + ${solution.profitPercent / 100}) = ${solution.cashSalePrice.toFixed(2)} €</code></li>`;
            const skontoProvProzent = solution.customerCashDiscountPercent + solution.agentCommissionPercent;
            html += `<li><b>Zielverkaufspreis:</b> <code>${solution.cashSalePrice.toFixed(2)} € / (1 - ${skontoProvProzent / 100}) = ${solution.targetSalePrice.toFixed(2)} €</code></li>`;
            html += `<li><b>Listenpreis (netto):</b> <code>${solution.targetSalePrice.toFixed(2)} € / (1 - ${solution.customerDiscountPercent / 100}) = ${solution.listSalePrice.toFixed(2)} €</code></li>`;
            html += `<li><b>Bruttoverkaufspreis:</b> <code>${solution.listSalePrice.toFixed(2)} € * 1,19 = ${solution.grossSalePrice.toFixed(2)} €</code></li>`;

            html += '</ol>';
            stepsContainer.innerHTML = html;
        }

        generateBtn.addEventListener('click', generateTask);
        solutionBtn.addEventListener('click', showSolution);
        stepsBtn.addEventListener('click', showCalculationSteps);

        generateTask();
    }
})();