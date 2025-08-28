import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://omxdiviiahffcsmttprq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9teGRpdmlpYWhmZmNzbXR0cHJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMDEzOTAsImV4cCI6MjA3MTg3NzM5MH0.KTJdhZNbKQFh2XYpYugoj3uLCi8cJ14nEXSoQIjOPHQ';
const supabase = createClient(supabaseUrl, supabaseKey);

const generateBtn = document.getElementById('generate-code-btn');
const codeDisplay = document.getElementById('code-display');
const errorDisplay = document.getElementById('admin-error');

async function checkAdminStatus() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (error || !profile || profile.role !== 'admin') {
        console.log("Nicht als Admin eingeloggt");
        window.location.href = 'index.html';
    }
}

generateBtn.addEventListener('click', async () => {
    codeDisplay.textContent = 'Generiere...';
    errorDisplay.textContent = '';
    generateBtn.disabled = true;

    try {
        const { data, error } = await supabase.functions.invoke('generate-invitation-code');

        if (error) throw error;

        if (data.code) {
            codeDisplay.textContent = data.code;
        } else {
            throw new Error(data.error || 'Unbekannter Fehler beim Generieren.');
        }

    } catch (error) {
        codeDisplay.textContent = '';
        errorDisplay.textContent = error.message;
    } finally {
        generateBtn.disabled = false;
    }
});

checkAdminStatus();