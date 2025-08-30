(() => {
    sessionStorage.setItem('selectedSemester', '1');
    const backBtn = document.querySelector('.back-to-hub-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('navigate-back'));
        });
    }

    if (document.getElementById('rub-app')) {
        setupRub();
    }

    function setupRub() {
        // Navigation logic will be added here
        const navButtons = document.querySelectorAll('.rub-nav-button');
        const contentSections = document.querySelectorAll('.rub-content-section');

        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetId = button.dataset.rubTarget;
                navButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                contentSections.forEach(section => {
                    section.classList.remove('active');
                    if (section.id === targetId) {
                        section.classList.add('active');
                    }
                });
            });
        });
    }
})();