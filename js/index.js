document.addEventListener('DOMContentLoaded', function() {
    const examDates = {
        'ccn': new Date(2025, 7, 4),
        'mafi2': new Date(2025, 7, 7),
        'insi': new Date(2025, 7, 22),
        'aud': new Date(2025, 7, 14)
    };

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

    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');
    const loginView = document.getElementById('login-view');
    const subjectHub = document.getElementById('subject-hub');

    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            if (username === 'nhani' && password === 'jenin') {
                loginView.classList.remove('active');
                subjectHub.classList.add('active');
                if (loginError) loginError.classList.add('hidden');
                loginForm.reset();
            } else {
                if (loginError) loginError.classList.remove('hidden');
                document.getElementById('password').value = '';
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            subjectHub.classList.remove('active');
            loginView.classList.add('active');
        });
    }

    document.body.addEventListener('click', function(event) {
        const card = event.target.closest('.subject-card');
        if (card && card.dataset.link) {
            window.location.href = card.dataset.link;
        }
    });
});
