document.addEventListener('DOMContentLoaded', function() {
    checkFirstVisit();
    const examDates = {
        'ccn': new Date(2025, 7, 4),
        'mafi2': new Date(2025, 7, 7),
        'insi': null,
        'aud': new Date(2025, 7, 14)
    };

    const semesterHub = document.getElementById('semester-hub');
    const subjectHub = document.getElementById('subject-hub');
    const comingSoon = document.getElementById('coming-soon');
    const dynamicContent = document.getElementById('dynamic-content');

    function showView(view) {
        [semesterHub, subjectHub, comingSoon, dynamicContent].forEach(v => v.classList.remove('active'));
        view.classList.add('active');
    }

    const storedSemester = sessionStorage.getItem('selectedSemester');
    if (storedSemester === '2') {
        showView(subjectHub);
    } else if (storedSemester && storedSemester !== '2') {
        showView(comingSoon);
    }

    function updateExamCountdowns() {
        const countdownElements = document.querySelectorAll('.exam-countdown');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        countdownElements.forEach(el => {
            const subjectId = el.dataset.subjectId;
            const examDate = examDates[subjectId];

            el.classList.remove('text-red-500', 'font-bold');

            if (examDate) {
                const diffTime = examDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays < 0) {
                    el.textContent = 'Klausur vorbei';
                } else if (diffDays === 0) {
                    el.textContent = 'Heute!';
                    el.classList.add('text-red-500', 'font-bold');
                } else if (diffDays === 1) {
                    el.textContent = 'Morgen!';
                    el.classList.add('text-red-500', 'font-bold');
                } else {
                    el.textContent = `${diffDays} Tage verbleibend`;
                    if (diffDays <= 7) {
                        el.classList.add('text-red-500', 'font-bold');
                    }
                }
            } else {
                el.textContent = 'kein datum angegeben';
            }
        });
    }

    updateExamCountdowns();

    function openRequestDateDialog(subjectId) {
        const dialog = document.getElementById('requestDateDialog');
        dialog.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        dialog.dataset.subjectId = subjectId;
        document.getElementById('request-subject').textContent = subjectId.toUpperCase();
        document.getElementById('request-date-input').value = '';
    }

    function closeRequestDateDialog() {
        document.getElementById('requestDateDialog').classList.add('hidden');
        document.body.style.overflow = '';
    }

    document.getElementById('request-date-send').addEventListener('click', function() {
        const dialog = document.getElementById('requestDateDialog');
        const subjectId = dialog.dataset.subjectId;
        const desiredDate = document.getElementById('request-date-input').value;
        console.log(`Anfrage für ${subjectId}: ${desiredDate}`);
        // TODO: Mail an Admin mit gewünschtem Datum senden
        closeRequestDateDialog();
    });

    document.getElementById('request-date-cancel').addEventListener('click', closeRequestDateDialog);

    document.getElementById('requestDateDialog').addEventListener('click', function(e) {
        if (e.target === this) {
            closeRequestDateDialog();
        }
    });

    function loadPage(url) {
        fetch(url)
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const scripts = Array.from(doc.querySelectorAll('script'));
                scripts.forEach(s => s.parentNode.removeChild(s));
                dynamicContent.innerHTML = doc.body.innerHTML;

                function loadScriptsSequentially(index = 0) {
                    if (index >= scripts.length) {
                        showView(dynamicContent);
                        return;
                    }

                    const s = scripts[index];
                    const newScript = document.createElement('script');
                    if (s.id) newScript.id = s.id;
                    if (s.type) newScript.type = s.type;
                    newScript.async = false;

                    if (s.src) {
                        newScript.src = s.src;
                        newScript.onload = () => loadScriptsSequentially(index + 1);
                        newScript.onerror = () => loadScriptsSequentially(index + 1);
                        dynamicContent.appendChild(newScript);
                    } else {
                        newScript.textContent = s.textContent;
                        dynamicContent.appendChild(newScript);
                        loadScriptsSequentially(index + 1);
                    }
                }

                loadScriptsSequentially();
            })
            .catch(err => console.error('Fehler beim Laden der Seite:', err));
    }

    window.addEventListener('navigate-back', () => {
        dynamicContent.innerHTML = '';
        showView(subjectHub);
    });

    document.body.addEventListener('click', function(event) {
        const semesterCard = event.target.closest('.semester-card');
        if (semesterCard) {
            const semester = semesterCard.dataset.semester;
            sessionStorage.setItem('selectedSemester', semester);
            if (semester === '2') {
                showView(subjectHub);
            } else {
                showView(comingSoon);
            }
            return;
        }

        if (event.target.closest('.back-button')) {
            sessionStorage.removeItem('selectedSemester');
            showView(semesterHub);
            return;
        }

        const requestBtn = event.target.closest('.request-date-button');
        if (requestBtn) {
            openRequestDateDialog(requestBtn.dataset.subjectId);
            return;
        }

        const card = event.target.closest('.subject-card');
        if (card && card.dataset.link) {
            loadPage(card.dataset.link);
        }
    });
});

function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function checkFirstVisit() {
    if (!getCookie('lerntool_warning_shown')) {
        document.getElementById('firstVisitDialog').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function closeFirstVisitDialog() {
    setCookie('lerntool_warning_shown', 'true', 365);

    document.getElementById('firstVisitDialog').classList.add('hidden');

    document.body.style.overflow = '';
}

document.getElementById('firstVisitDialog').addEventListener('click', function(e) {
    if (e.target === this) {
        closeFirstVisitDialog();
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        if (!document.getElementById('firstVisitDialog').classList.contains('hidden')) {
            closeFirstVisitDialog();
        }
        if (!document.getElementById('requestDateDialog').classList.contains('hidden')) {
            closeRequestDateDialog();
        }
    }
});
