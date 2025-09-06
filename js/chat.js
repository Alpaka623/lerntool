document.addEventListener('DOMContentLoaded', () => {
    const chatWidget = document.getElementById('chat-widget-container');
    const toggleBtn = document.getElementById('chat-toggle-btn');
    const messagesContainer = document.getElementById('chat-messages');
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send-btn');
    const closeBtn = document.getElementById('chat-close-btn');

    // NEU: Ein Array, um den Gesprächsverlauf zu speichern
    let chatHistory = [];

    if (!chatWidget) return;

    toggleBtn.addEventListener('click', () => {
        chatWidget.classList.toggle('open');
    });

    const sendMessage = async () => {
        const message = input.value.trim();
        if (!message) return;

        addMessage(message, 'user');
        // NEU: Füge die Nutzernachricht zum Verlauf hinzu
        chatHistory.push({ role: 'user', parts: [{ text: message }] });

        input.value = '';
        input.disabled = true;
        sendBtn.disabled = true;

        const mainContentElement = document.querySelector('main section.active, main section.content-section.active');
        let pageContext = "Allgemeine Übersichtsseite des Lerntools.";
        if (mainContentElement) {
            pageContext = mainContentElement.innerText;
        }

        try {
            const apiUrl = 'https://lerntool-api-proxy.vercel.app/api/chat';
            
            // NEU: Schicke den Verlauf mit. Wir begrenzen ihn auf die letzten 6 Nachrichten, um nicht zu viel zu senden.
            const historyToSend = chatHistory.slice(-7, -1); // Die letzten 6 Nachrichten (3 Runden)

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: message,      // Die aktuelle Nachricht
                    context: pageContext,  // Der Seiten-Kontext
                    history: historyToSend // Der bisherige Verlauf
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Netzwerkantwort war nicht OK: ${errorText}`);
            }

            const data = await response.json();
            addMessage(data.reply, 'bot');
            // NEU: Füge die Antwort des Bots zum Verlauf hinzu
            chatHistory.push({ role: 'model', parts: [{ text: data.reply }] });

        } catch (error) {
            console.error('Fehler beim Senden der Nachricht:', error);
            addMessage('Entschuldigung, es gab einen Fehler. Bitte versuche es später erneut.', 'bot');
        } finally {
            input.disabled = false;
            sendBtn.disabled = false;
            input.focus();
        }
    };

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    closeBtn.addEventListener('click', () => {
        chatWidget.classList.remove('open');
    });

    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}-message`;
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        messageDiv.innerHTML = text;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
});