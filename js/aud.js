document.addEventListener('DOMContentLoaded', function() {
    const backBtn = document.querySelector('.back-to-hub-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
});
