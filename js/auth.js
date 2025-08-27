import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
const supabaseUrl = 'https://omxdiviiahffcsmttprq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9teGRpdmlpYWhmZmNzbXR0cHJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMDEzOTAsImV4cCI6MjA3MTg3NzM5MH0.KTJdhZNbKQFh2XYpYugoj3uLCi8cJ14nEXSoQIjOPHQ';
const supabaseClient = createClient(supabaseUrl, supabaseKey);

const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.textContent = '';
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
        });

        if (error) {
            errorMessage.textContent = 'Fehler: ' + error.message;
        } else {
            alert('Registrierung erfolgreich! Bitte prüfe dein Postfach, um deine E-Mail-Adresse zu bestätigen.');
            window.location.href = 'login.html';
        }
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.textContent = '';
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            errorMessage.textContent = 'Fehler: ' + error.message;
        } else {
            window.location.href = 'index.html';
        }
    });
}

export async function getUser() {
    // Benutze hier den korrekten Client: supabaseClient
    const { data: { user } } = await supabaseClient.auth.getUser();
    return user;
}

export async function signOut() {
    const { error } = await supabaseClient.auth.signOut();
    if (!error) {
        window.location.href = 'login.html';
    } else {
        console.error('Fehler beim Abmelden:', error);
    }
}