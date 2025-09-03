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
        // Navigation logic will be added here
        const navButtons = document.querySelectorAll('.bwl-nav-button');
        const contentSections = document.querySelectorAll('.bwl-content-section');

        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetId = button.dataset.bwlTarget;
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