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

    function showView(view) {
        [semesterHub, subjectHub, comingSoon].forEach(v => v.classList.remove('active'));
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

    });
});
