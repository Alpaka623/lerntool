import { getUser, signOut, getUserRole } from './auth.js';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://omxdiviiahffcsmttprq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9teGRpdmlpYWhmZmNzbXR0cHJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMDEzOTAsImV4cCI6MjA3MTg3NzM5MH0.KTJdhZNbKQFh2XYpYugoj3uLCi8cJ14nEXSoQIjOPHQ';
const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', async function() {

    const user = await getUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    const userEmailElement = document.getElementById('user-email');
    if (userEmailElement) userEmailElement.textContent = user.email;

    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) logoutButton.addEventListener('click', () => signOut());

    const userRole = await getUserRole();
    const adminButton = document.getElementById('admin-button');
    if (userRole === 'admin' && adminButton) {
        adminButton.classList.remove('hidden');
        adminButton.addEventListener('click', () => { window.location.href = 'admin.html'; });
    }

    checkFirstVisit();
    const defaultExamDates = {
        'ccn': null, 'mafi2': null, 'insi': null, 'aud': null
    };
    let userExamDates = {};

    const semesterHub = document.getElementById('semester-hub');
    const subjectHub1 = document.getElementById('subject-hub-1');
    const subjectHub2 = document.getElementById('subject-hub-2');
    const comingSoon = document.getElementById('coming-soon');
    const dynamicContent = document.getElementById('dynamic-content');
    const closeDialogButton = document.getElementById('close-dialog-btn');
    if (closeDialogButton) closeDialogButton.addEventListener('click', closeFirstVisitDialog);

    async function loadUserExamDates() {
        const { data, error } = await supabase
            .from('exam_dates')
            .select('subject_id, exam_date')
            .eq('user_id', user.id);

        if (error) {
            console.error("Fehler beim Laden der Prüfungsdaten:", error);
            return;
        }
        userExamDates = Object.fromEntries(data.map(d => [d.subject_id, d.exam_date]));
        updateAllCountdowns();
    }

    function updateAllCountdowns() {
        const countdownElements = document.querySelectorAll('.exam-countdown');
        countdownElements.forEach(el => {
            const subjectId = el.dataset.subjectId;
            const userDate = userExamDates[subjectId];
            const examDate = userDate ? new Date(userDate + 'T00:00:00') : defaultExamDates[subjectId];

            el.classList.remove('text-red-500', 'font-bold');

            if (examDate) {
                examDate.setUTCHours(12, 0, 0, 0);
                const today = new Date();
                today.setUTCHours(0, 0, 0, 0);

                const diffTime = examDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays < 0) el.textContent = 'Prüfung vorbei';
                else if (diffDays === 0) { el.textContent = 'Heute!'; el.classList.add('text-red-500', 'font-bold'); }
                else if (diffDays === 1) { el.textContent = 'Morgen!'; el.classList.add('text-red-500', 'font-bold'); }
                else {
                    el.textContent = `${diffDays} Tage verbleibend`;
                    if (diffDays <= 7) el.classList.add('text-red-500', 'font-bold');
                }
            } else {
                el.textContent = 'Datum setzen';
            }
        });
    }

    async function saveExamDate(subjectId, date) {
        const { error } = await supabase
            .from('exam_dates')
            .upsert({
                user_id: user.id,
                subject_id: subjectId,
                exam_date: date
            }, { onConflict: 'user_id, subject_id' });

        if (error) {
            console.error("Fehler beim Speichern des Datums:", error);
        } else {
            await loadUserExamDates();
        }
    }

    function openDateDialog(subjectId) {
        const dialog = document.getElementById('requestDateDialog');
        dialog.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        document.getElementById('request-subject').textContent = subjectId.toUpperCase();
        const dateInput = document.getElementById('request-date-input');
        dateInput.value = userExamDates[subjectId] || '';

        const sendButton = document.getElementById('request-date-send');
        sendButton.onclick = () => {
            if (dateInput.value) {
                saveExamDate(subjectId, dateInput.value);
            }
            closeDateDialog();
        };
    }

    function closeDateDialog() {
        document.getElementById('requestDateDialog').classList.add('hidden');
        document.body.style.overflow = '';
    }

    const cancelBtn = document.getElementById('request-date-cancel');
    if (cancelBtn) cancelBtn.addEventListener('click', closeDateDialog);

    function showView(view) {
        [semesterHub, subjectHub1, subjectHub2, comingSoon, dynamicContent].forEach(v => {
            if(v) v.classList.remove('active');
        });
        if(view) view.classList.add('active');
    }

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
                    if(s.id) newScript.id = s.id;
                    if(s.type) newScript.type = s.type;
                    newScript.async = false;
                    if(s.src) {
                        newScript.src = s.src;
                        newScript.onload = () => loadScriptsSequentially(index + 1);
                        newScript.onerror = () => loadScriptsSequentially(index + 1);
                        document.body.appendChild(newScript);
                    } else {
                        newScript.textContent = s.textContent;
                        document.body.appendChild(newScript);
                        loadScriptsSequentially(index + 1);
                    }
                }
                loadScriptsSequentially();
            })
            .catch(err => console.error('Fehler beim Laden der Seite:', err));
    }

    window.addEventListener('navigate-back', () => {
        dynamicContent.innerHTML = '';
        const lastSemester = sessionStorage.getItem('selectedSemester');
        if (lastSemester === '1') showView(subjectHub1);
        else if (lastSemester === '2') showView(subjectHub2);
        else showView(semesterHub);
    });

    document.body.addEventListener('click', function(event) {
        const semesterCard = event.target.closest('.semester-card');
        if (semesterCard) {
            const semester = semesterCard.dataset.semester;
            sessionStorage.setItem('selectedSemester', semester);
            if (semester === '1') showView(subjectHub1);
            else if (semester === '2') showView(subjectHub2);
            else showView(comingSoon);
            return;
        }

        if (event.target.closest('.back-button')) {
            sessionStorage.removeItem('selectedSemester');
            showView(semesterHub);
            return;
        }

        const requestBtn = event.target.closest('.request-date-button');
        if (requestBtn) {
            openDateDialog(requestBtn.dataset.subjectId);
            return;
        }

        const card = event.target.closest('.subject-card');
        if (card && card.dataset.link) {
            loadPage(card.dataset.link);
        }
    });

    await loadUserExamDates();
    const storedSemester = sessionStorage.getItem('selectedSemester');
    if (storedSemester === '1') showView(subjectHub1);
    else if (storedSemester === '2') showView(subjectHub2);
    else showView(semesterHub);
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
    const dialog = document.getElementById('firstVisitDialog');
    if (dialog && !getCookie('lerntool_warning_shown')) {
        dialog.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function closeFirstVisitDialog() {
    setCookie('lerntool_warning_shown', 'true', 365);
    const dialog = document.getElementById('firstVisitDialog');
    if (dialog) dialog.classList.add('hidden');
    document.body.style.overflow = '';
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const firstDialog = document.getElementById('firstVisitDialog');
        if (firstDialog && !firstDialog.classList.contains('hidden')) {
            closeFirstVisitDialog();
        }
        const requestDialog = document.getElementById('requestDateDialog');
        if (requestDialog && !requestDialog.classList.contains('hidden')) {
            requestDialog.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }
});