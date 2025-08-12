document.addEventListener('DOMContentLoaded', function() {
    const chatContainer = document.getElementById('chat-container');
    // Exemplo de mensagem de boas-vindas
    const welcomeMsg = document.createElement('p');
    welcomeMsg.textContent = 'Olá! Como posso ajudar você hoje?';
    chatContainer.appendChild(welcomeMsg);
    // Aqui você pode adicionar mais funcionalidades do chat
});
