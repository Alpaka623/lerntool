function initAnimations(root = document) {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    root.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', function() {
    const examDates = {
        'ccn': new Date(2025, 7, 4),
        'mafi2': new Date(2025, 7, 7),
        'insi': new Date(2025, 7, 22),
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

            if (examDate) {
                const diffTime = examDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays < 0) {
                    el.textContent = "Klausur vorbei";
                } else if (diffDays === 0) {
                    el.textContent = "Heute!";
                    el.classList.add('text-red-500', 'font-bold');
                } else if (diffDays === 1) {
                    el.textContent = "Morgen!";
                    el.classList.add('text-red-500', 'font-bold');
                } else {
                    el.textContent = `${diffDays} Tage verbleibend`;
                    if (diffDays <= 7) {
                        el.classList.add('text-red-500', 'font-bold');
                    } else {
                        el.classList.remove('text-red-500', 'font-bold');
                    }
                }
            }
        });
    }

    updateExamCountdowns();
    initAnimations();

    function loadPage(url) {
        fetch(url)
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const scripts = Array.from(doc.querySelectorAll('script'));
                scripts.forEach(s => s.parentNode.removeChild(s));
                dynamicContent.innerHTML = doc.body.innerHTML;
                initAnimations(dynamicContent);

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

        const card = event.target.closest('.subject-card');
        if (card && card.dataset.link) {
            loadPage(card.dataset.link);
        }
    });
});
