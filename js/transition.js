document.addEventListener('DOMContentLoaded', () => {
    // fade in on load and hide loading overlay
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
        overlay.addEventListener('transitionend', () => overlay.remove());
    }
    document.body.classList.add('loaded');

    // handle forward navigation via data-link
    document.querySelectorAll('[data-link]').forEach(el => {
        el.addEventListener('click', e => {
            const url = el.getAttribute('data-link');
            if (url) {
                e.preventDefault();
                document.body.classList.add('fade-out');
                setTimeout(() => {
                    window.location.href = url;
                }, 300);
            }
        });
    });

    // handle back button to hub
    const backBtn = document.querySelector('.back-to-hub-btn');
    if (backBtn) {
        backBtn.addEventListener('click', e => {
            e.preventDefault();
            document.body.classList.add('fade-out');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 300);
        });
    }
});
