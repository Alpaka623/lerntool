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

        // --- HANDELSKALKULATION ---
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
            if (!container) return;
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

            if (givenKeys.has(targetId)) givenKeys.delete(targetId);

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
                if (row.id === targetId) rowDiv.classList.add('target-row');
                container.appendChild(rowDiv);
                const labelDiv = document.createElement('div');
                labelDiv.className = 'calc-label';
                labelDiv.innerHTML = row.label;
                rowDiv.appendChild(labelDiv);
                let percentEl;
                if (row.percentId) {
                    const isGiven = givenKeys.has(row.percentId);
                    percentEl = document.createElement(isGiven ? 'div' : 'input');
                    percentEl.className = `calc-percent ${isGiven ? 'given' : 'input'}`;
                    percentEl.id = `field-${row.percentId}`;
                    if (isGiven) percentEl.textContent = solution[row.percentId].toFixed(2) + ' %';
                    else {
                        percentEl.type = 'number';
                        percentEl.step = '0.01';
                        percentEl.placeholder = '%';
                    }
                } else percentEl = document.createElement('div');
                rowDiv.appendChild(percentEl);
                let valueEl;
                if (row.valueId) {
                    const isGiven = givenKeys.has(row.valueId);
                    valueEl = document.createElement(isGiven ? 'div' : 'input');
                    valueEl.className = `calc-value ${isGiven ? 'given' : 'input'}`;
                    valueEl.id = `field-${row.valueId}`;
                    if (isGiven) valueEl.textContent = solution[row.valueId].toFixed(2) + ' €';
                    else {
                        valueEl.type = 'number';
                        valueEl.step = '0.01';
                        valueEl.placeholder = '€';
                    }
                } else valueEl = document.createElement('div');
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

        if (generateBtn) generateBtn.addEventListener('click', generateTask);
        if (solutionBtn) solutionBtn.addEventListener('click', showSolution);
        if (stepsBtn) stepsBtn.addEventListener('click', showCalculationSteps);
        if (container) generateTask();

        // --- PRODUKTIONSKALKULATION ---
        class ProductionCalculation {
            static roundNumber(value) { return Math.round(value * 100) / 100; }
            static getRandomValue(min, max, step = 1) {
                const tmp = min + Math.random() * (max - min);
                return Math.round(tmp / step) * step;
            }
            constructor() {
                this.materialEinzelkosten = ProductionCalculation.getRandomValue(10000, 50000, 100);
                this.materialGemeinkostenPercent = ProductionCalculation.getRandomValue(5, 20, 1);
                this.fertigungsEinzelkosten = ProductionCalculation.getRandomValue(20000, 80000, 100);
                this.fertigungsGemeinkostenPercent = ProductionCalculation.getRandomValue(20, 80, 5);
                this.verwaltungsGemeinkostenPercent = ProductionCalculation.getRandomValue(5, 25, 1);
                this.vertriebsGemeinkostenPercent = ProductionCalculation.getRandomValue(5, 20, 1);
                this.gewinnPercent = ProductionCalculation.getRandomValue(10, 50, 1);
                this.skontoPercent = ProductionCalculation.getRandomValue(1, 3, 0.5);
                this.rabattPercent = ProductionCalculation.getRandomValue(5, 25, 1);
                this.valueAddedTaxPercent = 19;
                this.calculate();
            }

            calculate() {
                this.materialGemeinkosten = ProductionCalculation.roundNumber(this.materialEinzelkosten * (this.materialGemeinkostenPercent / 100));
                this.materialkosten = ProductionCalculation.roundNumber(this.materialEinzelkosten + this.materialGemeinkosten);
                this.fertigungsGemeinkosten = ProductionCalculation.roundNumber(this.fertigungsEinzelkosten * (this.fertigungsGemeinkostenPercent / 100));
                this.fertigungskosten = ProductionCalculation.roundNumber(this.fertigungsEinzelkosten + this.fertigungsGemeinkosten);
                this.herstellkosten = ProductionCalculation.roundNumber(this.materialkosten + this.fertigungskosten);
                this.verwaltungsGemeinkosten = ProductionCalculation.roundNumber(this.herstellkosten * (this.verwaltungsGemeinkostenPercent / 100));
                this.vertriebsGemeinkosten = ProductionCalculation.roundNumber(this.herstellkosten * (this.vertriebsGemeinkostenPercent / 100));
                this.selbstkosten = ProductionCalculation.roundNumber(this.herstellkosten + this.verwaltungsGemeinkosten + this.vertriebsGemeinkosten);
                this.gewinn = ProductionCalculation.roundNumber(this.selbstkosten * (this.gewinnPercent / 100));
                this.barverkaufspreis = ProductionCalculation.roundNumber(this.selbstkosten + this.gewinn);
                this.zielverkaufspreis = ProductionCalculation.roundNumber(this.barverkaufspreis / (1 - this.skontoPercent / 100));
                this.listenverkaufspreisNetto = ProductionCalculation.roundNumber(this.zielverkaufspreis / (1 - this.rabattPercent / 100));
                this.listenverkaufspreisBrutto = ProductionCalculation.roundNumber(this.listenverkaufspreisNetto * (1 + this.valueAddedTaxPercent / 100));
            }
        }

        const prodContainer = document.getElementById('produktionskalkulation-container');
        const generateProdBtn = document.getElementById('generate-prod-task-btn');
        const solutionProdBtn = document.getElementById('show-prod-solution-btn');
        const stepsProdBtn = document.getElementById('show-prod-steps-btn');
        const stepsProdContainer = document.getElementById('prod-solution-steps');
        let prodSolution;

        const prodSchema = [
            { id: 'materialEinzelkosten', label: 'Materialeinzelkosten', valueId: 'materialEinzelkosten' },
            { id: 'materialGemeinkostenPercent', label: 'Materialgemeinkosten', percentId: 'materialGemeinkostenPercent', valueId: 'materialGemeinkosten' },
            { id: 'materialkosten', label: '<strong>Materialkosten</strong>', valueId: 'materialkosten' },
            { id: 'fertigungsEinzelkosten', label: 'Fertigungseinzelkosten (Löhne)', valueId: 'fertigungsEinzelkosten' },
            { id: 'fertigungsGemeinkostenPercent', label: 'Fertigungsgemeinkosten', percentId: 'fertigungsGemeinkostenPercent', valueId: 'fertigungsGemeinkosten' },
            { id: 'fertigungskosten', label: '<strong>Fertigungskosten</strong>', valueId: 'fertigungskosten' },
            { id: 'herstellkosten', label: '<strong>Herstellkosten</strong>', valueId: 'herstellkosten' },
            { isSeparator: true },
            { id: 'verwaltungsGemeinkostenPercent', label: 'Verwaltungsgemeinkosten', percentId: 'verwaltungsGemeinkostenPercent', valueId: 'verwaltungsGemeinkosten' },
            { id: 'vertriebsGemeinkostenPercent', label: 'Vertriebsgemeinkosten', percentId: 'vertriebsGemeinkostenPercent', valueId: 'vertriebsGemeinkosten' },
            { id: 'selbstkosten', label: '<strong>Selbstkosten</strong>', valueId: 'selbstkosten' },
            { isSeparator: true },
            { id: 'gewinnPercent', label: 'Gewinn', percentId: 'gewinnPercent', valueId: 'gewinn' },
            { id: 'barverkaufspreis', label: '<strong>Barverkaufspreis</strong>', valueId: 'barverkaufspreis' },
            { id: 'skontoPercent', label: 'Skonto', percentId: 'skontoPercent' },
            { id: 'zielverkaufspreis', label: '<strong>Zielverkaufspreis</strong>', valueId: 'zielverkaufspreis' },
            { id: 'rabattPercent', label: 'Rabatt', percentId: 'rabattPercent' },
            { id: 'listenverkaufspreisNetto', label: '<strong>Listenverkaufspreis (netto)</strong>', valueId: 'listenverkaufspreisNetto' },
            { isSeparator: true },
            { id: 'valueAddedTaxPercent', label: 'Mehrwertsteuer', percentId: 'valueAddedTaxPercent' },
            { id: 'listenverkaufspreisBrutto', label: '<strong>Listenverkaufspreis (brutto)</strong>', valueId: 'listenverkaufspreisBrutto' },
        ];

        function generateProdTask() {
            if (!prodContainer) return;
            prodSolution = new ProductionCalculation();
            prodContainer.innerHTML = '';
            stepsProdContainer.style.display = 'none';

            const givenKeys = new Set([
                'materialEinzelkosten',
                'materialGemeinkostenPercent',
                'fertigungsEinzelkosten',
                'fertigungsGemeinkostenPercent',
                'verwaltungsGemeinkostenPercent',
                'vertriebsGemeinkostenPercent',
                'gewinnPercent',
                'skontoPercent',
                'rabattPercent',
                'valueAddedTaxPercent'
            ]);

            const instructionDiv = document.createElement('div');
            instructionDiv.className = 'calc-instruction';
            instructionDiv.innerHTML = `Berechnen Sie das gesamte Kalkulationsschema und tragen Sie alle fehlenden Werte ein. 
            <br><strong>Wichtiger Hinweis:</strong> Auf der Original-Webseite (siehe unten) und in der Klausur wird in der Regel ein bestimmter Wert gesucht. Schauen Sie sich das zur Vorbereitung unbedingt an!`;
            prodContainer.appendChild(instructionDiv);

            prodSchema.forEach(row => {
                if (row.isSeparator) {
                    const separator = document.createElement('div');
                    separator.className = 'calc-separator';
                    prodContainer.appendChild(separator);
                    return;
                }
                const rowDiv = document.createElement('div');
                rowDiv.className = 'calc-row';
                prodContainer.appendChild(rowDiv);

                const labelDiv = document.createElement('div');
                labelDiv.className = 'calc-label';
                labelDiv.innerHTML = row.label;
                rowDiv.appendChild(labelDiv);

                let percentEl = document.createElement('div');
                if (row.percentId) {
                    const isGiven = givenKeys.has(row.percentId);
                    percentEl = document.createElement(isGiven ? 'div' : 'input');
                    percentEl.className = `calc-percent ${isGiven ? 'given' : 'input'}`;
                    percentEl.id = `prod-field-${row.percentId}`;
                    if (isGiven) percentEl.textContent = prodSolution[row.percentId].toFixed(2) + ' %';
                    else { percentEl.type = 'number'; percentEl.step = '0.01'; percentEl.placeholder = '%'; }
                }
                rowDiv.appendChild(percentEl);

                let valueEl = document.createElement('div');
                if (row.valueId) {
                    const isGiven = givenKeys.has(row.valueId);
                    valueEl = document.createElement(isGiven ? 'div' : 'input');
                    valueEl.className = `calc-value ${isGiven ? 'given' : 'input'}`;
                    valueEl.id = `prod-field-${row.valueId}`;
                    if(isGiven) valueEl.textContent = prodSolution[row.valueId].toFixed(2) + ' €';
                    else { valueEl.type = 'number'; valueEl.step = '0.01'; valueEl.placeholder = '€'; }
                }
                rowDiv.appendChild(valueEl);
            });
        }

        function showProdSolution() {
            if (!prodSolution) return;
            prodSchema.forEach(row => {
                if (row.isSeparator) return;

                const checkAndMark = (id, correctValue) => {
                    const el = document.getElementById(`prod-field-${id}`);
                    if (el && el.tagName === 'INPUT') {
                        const userValue = parseFloat(el.value);
                        const isCorrect = !isNaN(userValue) && Math.abs(userValue - correctValue) < 0.02;
                        el.value = correctValue.toFixed(2);
                        el.classList.toggle('correct', isCorrect);
                        el.classList.toggle('incorrect', !isCorrect);
                    }
                };

                if (row.valueId) checkAndMark(row.valueId, prodSolution[row.valueId]);
                if (row.percentId) checkAndMark(row.percentId, prodSolution[row.percentId]);
            });
        }

        function showProdSteps() {
            if (!prodSolution) return;
            stepsProdContainer.style.display = 'block';
            let html = '<h3>Lösungsweg (Zuschlagskalkulation)</h3><ol>';
            const s = prodSolution;
            html += `<li><b>Materialgemeinkosten:</b> <code>${s.materialEinzelkosten.toFixed(2)} € * ${s.materialGemeinkostenPercent / 100} = ${s.materialGemeinkosten.toFixed(2)} €</code></li>`;
            html += `<li><b>Materialkosten:</b> <code>${s.materialEinzelkosten.toFixed(2)} € + ${s.materialGemeinkosten.toFixed(2)} € = ${s.materialkosten.toFixed(2)} €</code></li>`;
            html += `<li><b>Fertigungsgemeinkosten:</b> <code>${s.fertigungsEinzelkosten.toFixed(2)} € * ${s.fertigungsGemeinkostenPercent / 100} = ${s.fertigungsGemeinkosten.toFixed(2)} €</code></li>`;
            html += `<li><b>Fertigungskosten:</b> <code>${s.fertigungsEinzelkosten.toFixed(2)} € + ${s.fertigungsGemeinkosten.toFixed(2)} € = ${s.fertigungskosten.toFixed(2)} €</code></li>`;
            html += `<li><b>Herstellkosten:</b> <code>${s.materialkosten.toFixed(2)} € + ${s.fertigungskosten.toFixed(2)} € = ${s.herstellkosten.toFixed(2)} €</code></li>`;
            html += `<li><b>Verwaltungs-/Vertriebsgemeinkosten:</b> <code>(${s.verwaltungsGemeinkostenPercent}% VwG + ${s.vertriebsGemeinkostenPercent}% VtG) * ${s.herstellkosten.toFixed(2)}€ = ${s.verwaltungsGemeinkosten.toFixed(2)}€ + ${s.vertriebsGemeinkosten.toFixed(2)}€</code></li>`;
            html += `<li><b>Selbstkosten:</b> <code>${s.herstellkosten.toFixed(2)}€ + ${s.verwaltungsGemeinkosten.toFixed(2)}€ + ${s.vertriebsGemeinkosten.toFixed(2)}€ = ${s.selbstkosten.toFixed(2)}€</code></li>`;
            html += `<li><b>Gewinn:</b> <code>${s.selbstkosten.toFixed(2)}€ * ${s.gewinnPercent/100} = ${s.gewinn.toFixed(2)}€</code></li>`;
            html += `<li><b>Barverkaufspreis:</b> <code>${s.selbstkosten.toFixed(2)}€ + ${s.gewinn.toFixed(2)}€ = ${s.barverkaufspreis.toFixed(2)}€</code></li>`;
            html += `<li><b>Zielverkaufspreis (im Hundert):</b> <code>${s.barverkaufspreis.toFixed(2)}€ / (1 - ${s.skontoPercent/100}) = ${s.zielverkaufspreis.toFixed(2)}€</code></li>`;
            html += `<li><b>Listenverkaufspreis Netto (im Hundert):</b> <code>${s.zielverkaufspreis.toFixed(2)}€ / (1 - ${s.rabattPercent/100}) = ${s.listenverkaufspreisNetto.toFixed(2)}€</code></li>`;
            html += `<li><b>Listenverkaufspreis Brutto:</b> <code>${s.listenverkaufspreisNetto.toFixed(2)}€ * 1,19 = ${s.listenverkaufspreisBrutto.toFixed(2)}€</code></li>`;
            html += '</ol>';
            stepsProdContainer.innerHTML = html;
        }

        if (generateProdBtn) generateProdBtn.addEventListener('click', generateProdTask);
        if (solutionProdBtn) solutionProdBtn.addEventListener('click', showProdSolution);
        if (stepsProdBtn) stepsProdBtn.addEventListener('click', showProdSteps);
        if(prodContainer) generateProdTask();

        // --- BETRIEBSABRECHNUNGSBOGEN (NEU/AKTUALISIERT) ---
        if (document.getElementById('bwl-bab')) {
            setupBab();
        }

        function setupBab() {
            function getRnd(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
            function getRnd500(min, max) {
                const min500 = min / 500;
                const max500 = max / 500;
                return (Math.floor(Math.random() * (max500 - min500) + 1) + min500) * 500;
            }
            function getSplitting(parts) {
                let tmp = 0;
                const splitting = [];
                for (let i = 0; i < 3; i++) {
                    const rnd = getRnd(0, Math.floor(parts / 3));
                    tmp += rnd;
                    splitting.push(rnd);
                }
                splitting.push(parts - tmp);
                return splitting;
            }

            class Gemeinkostenart {
                static berechneKostenstellenBetraege(kostenstellenAnteile, gesamtkosten) {
                    const anteilSumme = kostenstellenAnteile.reduce((a, b) => a + b, 0);
                    if (anteilSumme === 0) return [0, 0, 0, 0];
                    return kostenstellenAnteile.map((v) => (gesamtkosten / anteilSumme) * v);
                }
                constructor(name, gesamtkosten, kostenstellenAnteile) {
                    this.name = name;
                    this.gesamtkosten = gesamtkosten;
                    this.kostenstellenAnteile = kostenstellenAnteile;
                    this.kostenstellenBetraege = Gemeinkostenart.berechneKostenstellenBetraege(kostenstellenAnteile, gesamtkosten);
                }
            }

            class Betriebsabrechnungsbogen {
                static initGemeinkosten() {
                    const gemeinkostenarten = [];
                    for (let i = 1; i <= 6; i++) {
                        const share = getRnd500(500, 3000);
                        const splitting = getSplitting(getRnd(11, 18));
                        let sum = 0;
                        splitting.forEach((split) => sum += (share * split));
                        gemeinkostenarten.push(new Gemeinkostenart(`Kostenart ${i}`, sum, splitting));
                    }
                    return gemeinkostenarten;
                }

                constructor() {
                    this.materialEinzelkosten = getRnd500(10000, 40000);
                    this.fertigungsEinzelkosten = getRnd500(10000, 40000);
                    this.lagerMehrbestaende = getRnd500(10000, 40000);
                    this.lagerMinderbestaende = getRnd500(10000, 40000);
                    this.gemeinkostenarten = Betriebsabrechnungsbogen.initGemeinkosten();
                    this.gemeinKosten = [];
                }

                berechneGemeinkosten() {
                    this.gemeinKosten = [0, 0, 0, 0]; // Material, Fertigung, Verwaltung, Vertrieb
                    for (const kostenArt of this.gemeinkostenarten) {
                        for (const [index, betrag] of kostenArt.kostenstellenBetraege.entries()) {
                            this.gemeinKosten[index] += betrag;
                        }
                    }
                    return this.gemeinKosten;
                }

                get materialGemeinkosten() { return this.gemeinKosten[0] || 0; }
                get fertigungsGemeinkosten() { return this.gemeinKosten[1] || 0; }
                get verwaltungsGemeinkosten() { return this.gemeinKosten[2] || 0; }
                get vertriebsGemeinkosten() { return this.gemeinKosten[3] || 0; }

                berechneHerstellkostenProduktion() { return this.materialEinzelkosten + this.materialGemeinkosten + this.fertigungsEinzelkosten + this.fertigungsGemeinkosten; }
                berechneHerstellkostenUmsatz() { return this.berechneHerstellkostenProduktion() + this.lagerMinderbestaende - this.lagerMehrbestaende; }
                berechneMGKZuschlagssatz() { return this.materialEinzelkosten === 0 ? 0 : this.materialGemeinkosten * 100 / this.materialEinzelkosten; }
                berechneFGKZuschlagssatz() { return this.fertigungsEinzelkosten === 0 ? 0 : this.fertigungsGemeinkosten * 100 / this.fertigungsEinzelkosten; }
                berechneVerwGKZuschlagssatz() { const hku = this.berechneHerstellkostenUmsatz(); return hku === 0 ? 0 : this.verwaltungsGemeinkosten * 100 / hku; }
                berechneVertGKZuschlagssatz() { const hku = this.berechneHerstellkostenUmsatz(); return hku === 0 ? 0 : this.vertriebsGemeinkosten * 100 / hku; }
                berechneSelbstkostenProduktion() {
                    let selbstkostenProduktion = this.materialEinzelkosten + this.fertigungsEinzelkosten;
                    this.gemeinkostenarten.forEach(art => selbstkostenProduktion += art.gesamtkosten);
                    return selbstkostenProduktion;
                }
            }

            const tableContainer = document.getElementById('bab-table-container');
            const inputsContainer = document.getElementById('bab-inputs-container');
            const generateBabBtn = document.getElementById('generate-bab-task-btn');
            const solutionBabBtn = document.getElementById('show-bab-solution-btn');
            const stepsBabBtn = document.getElementById('show-bab-steps-btn');
            const stepsBabContainer = document.getElementById('bab-solution-steps');
            let currentBab;

            const formatCurrency = (val) => val.toFixed(2).replace('.', ',') + ' €';
            const formatCurrencyShort = (val) => val.toFixed(0).replace('.', ',');
            const formatInteger = (val) => Math.round(val).toString();

            function generateBabTask() {
                currentBab = new Betriebsabrechnungsbogen();
                if(stepsBabContainer) {
                    stepsBabContainer.style.display = 'none';
                    stepsBabContainer.innerHTML = '';
                };

                let tableHTML = `<table class="w-full text-left text-sm">
                    <thead class="text-gray-300">
                        <tr>
                            <th class="p-2 w-1/3">Kostenarten</th>
                            <th class="p-2 text-right">Gesamtkosten aus Buchhaltung</th>
                            <th class="p-2 text-right">Material</th>
                            <th class="p-2 text-right">Fertigung</th>
                            <th class="p-2 text-right">Verwaltung</th>
                            <th class="p-2 text-right">Vertrieb</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="border-t border-b border-gray-600"><td colspan="6" class="p-2 font-bold text-gray-400">Einzelkosten</td></tr>
                        <tr><td class="p-2">Materialverbrauch</td><td class="p-2 font-mono text-right">${formatCurrency(currentBab.materialEinzelkosten)}</td><td class="p-2 font-mono text-right">${formatCurrency(currentBab.materialEinzelkosten)}</td><td></td><td></td><td></td></tr>
                        <tr><td class="p-2">Fertigungslöhne</td><td class="p-2 font-mono text-right">${formatCurrency(currentBab.fertigungsEinzelkosten)}</td><td></td><td class="p-2 font-mono text-right">${formatCurrency(currentBab.fertigungsEinzelkosten)}</td><td></td><td></td></tr>
                        <tr class="border-t border-b border-gray-600"><td colspan="6" class="p-2 font-bold text-gray-400">Gemeinkosten</td></tr>`;

                currentBab.gemeinkostenarten.forEach(art => {
                    tableHTML += `<tr class="border-t border-gray-700">
                        <td class="p-2">${art.name}</td>
                        <td class="p-2 font-mono text-right">${formatCurrency(art.gesamtkosten)}</td>
                        <td class="p-2 font-mono text-right">${formatInteger(art.kostenstellenAnteile[0])}</td>
                        <td class="p-2 font-mono text-right">${formatInteger(art.kostenstellenAnteile[1])}</td>
                        <td class="p-2 font-mono text-right">${formatInteger(art.kostenstellenAnteile[2])}</td>
                        <td class="p-2 font-mono text-right">${formatInteger(art.kostenstellenAnteile[3])}</td>
                    </tr>`;
                });
                tableHTML += `</tbody></table>`;
                tableContainer.innerHTML = tableHTML;

                inputsContainer.innerHTML = `
                    <div class="space-y-2">
                        <h4 class="text-lg font-semibold text-cyan-300">1. Herstellkosten des Umsatzes</h4>
                        <p class="text-gray-400 text-sm">Berechnen Sie die Herstellkosten des Umsatzes. Sie wissen, dass die Lager-Mehrbestände ${formatCurrency(currentBab.lagerMehrbestaende)} und die Lager-Minderbestände ${formatCurrency(currentBab.lagerMinderbestaende)} betragen.</p>
                        <input type="number" step="0.01" class="calc-value input w-full" id="bab-input-hku" placeholder="Herstellkosten des Umsatzes in €">
                    </div>
                    <div class="space-y-2">
                        <h4 class="text-lg font-semibold text-cyan-300">2. Summe der Gemeinkosten</h4>
                        <p class="text-gray-400 text-sm">Tragen Sie die Summen der Gemeinkosten für die vier Kostenstellen in die Felder ein.</p>
                        <div class="grid md:grid-cols-2 gap-4">
                             <input type="number" step="0.01" class="calc-value input w-full" id="bab-input-mgk" placeholder="Materialgemeinkosten in €">
                             <input type="number" step="0.01" class="calc-value input w-full" id="bab-input-fgk" placeholder="Fertigungsgemeinkosten in €">
                             <input type="number" step="0.01" class="calc-value input w-full" id="bab-input-verwgk" placeholder="Verwaltungsgemeinkosten in €">
                             <input type="number" step="0.01" class="calc-value input w-full" id="bab-input-vertgk" placeholder="Vertriebsgemeinkosten in €">
                        </div>
                    </div>
                    <div class="space-y-2">
                        <h4 class="text-lg font-semibold text-cyan-300">3. Gemeinkostenzuschlagssätze</h4>
                        <p class="text-gray-400 text-sm">Berechnen Sie die vier Gemeinkostenzuschlagssätze und tragen Sie diese in die Felder ein.</p>
                         <div class="grid md:grid-cols-2 gap-4">
                             <input type="number" step="0.01" class="calc-value input w-full" id="bab-input-mgk-satz" placeholder="Materialgemeinkostenzuschlag in %">
                             <input type="number" step="0.01" class="calc-value input w-full" id="bab-input-fgk-satz" placeholder="Fertigungsgemeinkostenzuschlag in %">
                             <input type="number" step="0.01" class="calc-value input w-full" id="bab-input-verwgk-satz" placeholder="Verwaltungsgemeinkostenzuschlag in %">
                             <input type="number" step="0.01" class="calc-value input w-full" id="bab-input-vertgk-satz" placeholder="Vertriebsgemeinkostenzuschlag in %">
                        </div>
                    </div>
                     <div class="space-y-2">
                        <h4 class="text-lg font-semibold text-cyan-300">4. Selbstkosten der Produktion</h4>
                        <p class="text-gray-400 text-sm">Tragen Sie die Selbstkosten der Produktion des Unternehmens in das Feld ein.</p>
                        <input type="number" step="0.01" class="calc-value input w-full" id="bab-input-skp" placeholder="Selbstkosten der Produktion in €">
                    </div>
                `;
            }

            function showBabSolution() {
                if (!currentBab) return;

                currentBab.berechneGemeinkosten();
                const solutions = {
                    hku: currentBab.berechneHerstellkostenUmsatz(),
                    mgk: currentBab.materialGemeinkosten,
                    fgk: currentBab.fertigungsGemeinkosten,
                    verwgk: currentBab.verwaltungsGemeinkosten,
                    vertgk: currentBab.vertriebsGemeinkosten,
                    mgkSatz: currentBab.berechneMGKZuschlagssatz(),
                    fgkSatz: currentBab.berechneFGKZuschlagssatz(),
                    verwgkSatz: currentBab.berechneVerwGKZuschlagssatz(),
                    vertgkSatz: currentBab.berechneVertGKZuschlagssatz(),
                    skp: currentBab.berechneSelbstkostenProduktion()
                };

                const checkAndMark = (inputId, correctValue) => {
                    const inputEl = document.getElementById(inputId);
                    if (!inputEl) return;
                    const userValue = parseFloat(inputEl.value);
                    const isCorrect = !isNaN(userValue) && Math.abs(userValue - correctValue) < 0.02;
                    inputEl.value = correctValue.toFixed(2);
                    inputEl.classList.toggle('correct', isCorrect);
                    inputEl.classList.toggle('incorrect', !isCorrect);
                };

                checkAndMark('bab-input-hku', solutions.hku);
                checkAndMark('bab-input-mgk', solutions.mgk);
                checkAndMark('bab-input-fgk', solutions.fgk);
                checkAndMark('bab-input-verwgk', solutions.verwgk);
                checkAndMark('bab-input-vertgk', solutions.vertgk);
                checkAndMark('bab-input-mgk-satz', solutions.mgkSatz);
                checkAndMark('bab-input-fgk-satz', solutions.fgkSatz);
                checkAndMark('bab-input-verwgk-satz', solutions.verwgkSatz);
                checkAndMark('bab-input-vertgk-satz', solutions.vertgkSatz);
                checkAndMark('bab-input-skp', solutions.skp);
            }

            function showBabSteps() {
                if (!currentBab) return;
                stepsBabContainer.style.display = 'block';

                currentBab.berechneGemeinkosten();
                const hku = currentBab.berechneHerstellkostenUmsatz();

                let html = '<h3>Detaillierter Lösungsweg</h3><ol class="space-y-4">';

                // Änderung: Detaillierte Berechnung für Gemeinkosten
                const mgk_details = currentBab.gemeinkostenarten.map(art => formatCurrencyShort(art.kostenstellenBetraege[0])).join(' + ');
                const fgk_details = currentBab.gemeinkostenarten.map(art => formatCurrencyShort(art.kostenstellenBetraege[1])).join(' + ');
                const verwgk_details = currentBab.gemeinkostenarten.map(art => formatCurrencyShort(art.kostenstellenBetraege[2])).join(' + ');
                const vertgk_details = currentBab.gemeinkostenarten.map(art => formatCurrencyShort(art.kostenstellenBetraege[3])).join(' + ');

                html += `<li><b>1. Herstellkosten der Produktion (HKP) berechnen:</b><br>
                           <span class="text-sm text-gray-400">Summe aus Material- und Fertigungskosten (Einzel + Gemein).</span><br>
                           <code>HKP = MEK + MGK + FEK + FGK</code><br>
                           <code>HKP = ${formatCurrency(currentBab.materialEinzelkosten)} + ${formatCurrency(currentBab.materialGemeinkosten)} + ${formatCurrency(currentBab.fertigungsEinzelkosten)} + ${formatCurrency(currentBab.fertigungsGemeinkosten)} = ${formatCurrency(currentBab.berechneHerstellkostenProduktion())}</code></li>`;

                html += `<li><b>2. Herstellkosten des Umsatzes (HKU) berechnen:</b><br>
                           <span class="text-sm text-gray-400">Die Herstellkosten der Produktion werden um Bestandsveränderungen korrigiert.</span><br>
                           <code>HKU = HKP + Lager-Minderbestand - Lager-Mehrbestand</code><br>
                           <code>HKU = ${formatCurrency(currentBab.berechneHerstellkostenProduktion())} + ${formatCurrency(currentBab.lagerMinderbestaende)} - ${formatCurrency(currentBab.lagerMehrbestaende)} = ${formatCurrency(hku)}</code></li>`;

                html += `<li><b>3. Gemeinkosten je Kostenstelle berechnen und summieren:</b><br>
                           <span class="text-sm text-gray-400">Für jede Kostenart wird der Betrag pro Kostenstelle berechnet: (Gesamtkosten / Summe der Anteile) * Anteil. Anschließend werden die Ergebnisse pro Spalte addiert.</span><br>
                           <code class="block text-xs overflow-x-auto">MGK = ${mgk_details} = <b>${formatCurrency(currentBab.materialGemeinkosten)}</b></code>
                           <code class="block text-xs overflow-x-auto">FGK = ${fgk_details} = <b>${formatCurrency(currentBab.fertigungsGemeinkosten)}</b></code>
                           <code class="block text-xs overflow-x-auto">VerwGK = ${verwgk_details} = <b>${formatCurrency(currentBab.verwaltungsGemeinkosten)}</b></code>
                           <code class="block text-xs overflow-x-auto">VertGK = ${vertgk_details} = <b>${formatCurrency(currentBab.vertriebsGemeinkosten)}</b></code></li>`;

                html += `<li><b>4. Gemeinkostenzuschlagssätze berechnen:</b><br>
                           <span class="text-sm text-gray-400">Die Gemeinkosten werden ins Verhältnis zu ihrer Bezugsbasis gesetzt.</span><br>
                           <code>MGK-Satz = (MGK / MEK) * 100 = <b>${currentBab.berechneMGKZuschlagssatz().toFixed(2)}%</b></code><br>
                           <code>FGK-Satz = (FGK / FEK) * 100 = <b>${currentBab.berechneFGKZuschlagssatz().toFixed(2)}%</b></code><br>
                           <code>VerwGK-Satz = (VerwGK / HKU) * 100 = <b>${currentBab.berechneVerwGKZuschlagssatz().toFixed(2)}%</b></code><br>
                           <code>VertGK-Satz = (VertGK / HKU) * 100 = <b>${currentBab.berechneVertGKZuschlagssatz().toFixed(2)}%</b></code></li>`;

                html += `<li><b>5. Selbstkosten der Produktion berechnen:</b><br>
                           <span class="text-sm text-gray-400">Summe aller Einzel- und Gemeinkosten.</span><br>
                           <code>Selbstkosten = MEK + FEK + MGK + FGK + VerwGK + VertGK</code><br>
                           <code>Selbstkosten = ${formatCurrency(currentBab.berechneSelbstkostenProduktion())}</code></li>`;

                html += '</ol>';
                stepsBabContainer.innerHTML = html;
            }

            generateBabBtn.addEventListener('click', generateBabTask);
            solutionBabBtn.addEventListener('click', showBabSolution);
            if(stepsBabBtn) stepsBabBtn.addEventListener('click', showBabSteps);

            generateBabTask();
        }

        // --- RICHTIG/FALSCH FRAGEN ---
        const startContainer = document.getElementById('bwl-quiz-start-container');
        const questionContainer = document.getElementById('bwl-quiz-question-container');
        const shuffleCheckbox = document.getElementById('bwl-quiz-shuffle-checkbox');
        const startBtn = document.getElementById('bwl-quiz-start-btn');
        const endBtn = document.getElementById('bwl-quiz-end-btn');
        const nextBtn = document.getElementById('bwl-quiz-next-btn');
        const progressIndicator = document.getElementById('bwl-quiz-progress');
        const quizCard = document.getElementById('bwl-quiz-card');

        const BwlQuizManager = {
            questions: [],
            currentQuestionIndex: 0,
            totalQuestions: 0,

            start: function(shuffle) {
                if (typeof bwlFragen === 'undefined' || bwlFragen.length === 0) {
                    alert("Fehler: Fragen konnten nicht geladen werden.");
                    return;
                }
                this.questions = [...bwlFragen];
                this.totalQuestions = this.questions.length;
                if (shuffle) {
                    this.questions.sort(() => 0.5 - Math.random());
                }
                this.currentQuestionIndex = 0;
                this.showQuestion();
                startContainer.classList.add('hidden');
                questionContainer.classList.remove('hidden');
            },

            end: function() {
                startContainer.classList.remove('hidden');
                questionContainer.classList.add('hidden');
            },

            next: function() {
                this.currentQuestionIndex++;
                this.showQuestion();
            },

            showQuestion: function() {
                nextBtn.classList.add('hidden');

                if (this.currentQuestionIndex >= this.totalQuestions) {
                    quizCard.innerHTML = `<h4 class="font-bold text-green-400 text-center text-xl">Super!</h4>
                                          <p class="text-gray-300 text-center mt-2">Du hast alle Fragen durchgearbeitet.</p>`;
                    progressIndicator.textContent = `Runde beendet`;
                    endBtn.textContent = 'Neue Runde';
                    return;
                }

                endBtn.textContent = 'Runde beenden';
                progressIndicator.textContent = `Frage ${this.currentQuestionIndex + 1} / ${this.totalQuestions}`;
                const task = this.questions[this.currentQuestionIndex];

                quizCard.innerHTML = `
                    <p class="text-gray-300 mb-4">${task.q}</p>
                    <div class="flex gap-4">
                        <button class="check-answer-btn flex-1 py-2 rounded-lg bg-gray-700 hover:bg-gray-600" data-answer="true">Richtig</button>
                        <button class="check-answer-btn flex-1 py-2 rounded-lg bg-gray-700 hover:bg-gray-600" data-answer="false">Falsch</button>
                    </div>
                    <div class="solution p-4 mt-4 rounded-md" style="display: none;">
                        <p><b>Antwort:</b> ${task.a ? 'Richtig' : 'Falsch'}.</p>
                    </div>
                `;
                this.attachAnswerListeners(task);
            },

            attachAnswerListeners: function(task) {
                quizCard.querySelectorAll('.check-answer-btn').forEach(button => {
                    button.addEventListener('click', (e) => {
                        const selectedAnswer = e.target.dataset.answer === 'true';
                        const correctAnswer = task.a;

                        quizCard.querySelectorAll('.check-answer-btn').forEach(btn => {
                            btn.disabled = true;
                            btn.classList.remove('hover:bg-gray-600');
                        });

                        if (correctAnswer) {
                            quizCard.querySelector('[data-answer="true"]').classList.add('bg-green-700');
                        } else {
                            quizCard.querySelector('[data-answer="false"]').classList.add('bg-green-700');
                        }

                        if (selectedAnswer !== correctAnswer) {
                            e.target.classList.add('bg-red-700');
                        }

                        const solutionDiv = quizCard.querySelector('.solution');
                        solutionDiv.innerHTML = `<p><b>Antwort:</b> ${task.a ? 'Richtig' : 'Falsch'}.</p>
                                                 <p class="mt-2">${task.e || 'Keine Erklärung verfügbar.'}</p>`;
                        solutionDiv.style.display = 'block';

                        nextBtn.classList.remove('hidden');
                    });
                });
            }
        };

        if (startBtn) startBtn.addEventListener('click', () => BwlQuizManager.start(shuffleCheckbox.checked));
        if (endBtn) endBtn.addEventListener('click', () => BwlQuizManager.end());
        if (nextBtn) nextBtn.addEventListener('click', () => BwlQuizManager.next());
    }
})();