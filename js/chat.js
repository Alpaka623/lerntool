document.addEventListener('DOMContentLoaded', () => {
    const chatWidget = document.getElementById('chat-widget-container');
    const toggleBtn = document.getElementById('chat-toggle-btn');
    const messagesContainer = document.getElementById('chat-messages');
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send-btn');
    const closeBtn = document.getElementById('chat-close-btn');

    let chatHistory = [];

    if (!chatWidget) return;

    toggleBtn.addEventListener('click', () => {
        chatWidget.classList.toggle('open');
    });

    const sendMessage = async () => {
        const message = input.value.trim();
        if (!message) return;

        addMessage(message, 'user');
        chatHistory.push({ role: 'user', parts: [{ text: message }] });

        input.value = '';
        input.disabled = true;
        sendBtn.disabled = true;
        sendBtn.classList.add('loading');

        const mainContentElement = document.querySelector('main section.active, main section.content-section.active');
        let pageContext = "Allgemeine Übersichtsseite des Lerntools.";
        if (mainContentElement) {
            pageContext = mainContentElement.innerText;
        }

        // NEU: Anweisung für die KI, auch allgemeines Wissen zu nutzen
        const instruction = "Du bist ein KI-Lernassistent. Beantworte die Fragen des Nutzers. Wenn die Frage sich auf den aktuellen Seiteninhalt bezieht, nutze den bereitgestellten Kontext. Wenn die Frage allgemeiner Natur ist, beantworte sie direkt. Erwähne nicht, ob du den Kontext benutzt oder nicht, sondern gib einfach die bestmögliche Antwort.\n\nHier ist der Kontext der aktuellen Seite:\n";
        const augmentedContext = instruction + pageContext;

        try {
            const apiUrl = 'https://lerntool-api-proxy.vercel.app/api/chat';

            const historyToSend = chatHistory.slice(-5, -1);

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: message,
                    context: augmentedContext, // Sendet den erweiterten Kontext
                    history: historyToSend
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Netzwerkantwort war nicht OK: ${errorText}`);
            }

            const data = await response.json();
            addMessage(data.reply, 'bot');
            chatHistory.push({ role: 'model', parts: [{ text: data.reply }] });

        } catch (error) {
            console.error('Fehler beim Senden der Nachricht:', error);
            addMessage('Entschuldigung, es gab einen Fehler. Bitte versuche es später erneut.', 'bot');
        } finally {
            sendBtn.classList.remove('loading');
            sendBtn.classList.add('cooldown');
            setTimeout(() => {
                input.disabled = false;
                sendBtn.disabled = false;
                sendBtn.classList.remove('cooldown');
                input.focus();
            }, 10000);
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