// Initial greeting with typing effect
window.addEventListener('DOMContentLoaded', async () => {
    await wait(firstMsgDelayMs);
    await typeMessage(responseMessages[18]); // bonjour
    chat.scrollTop = chat.scrollHeight;
});

userInput.addEventListener('input', () => {
    sendButton.disabled = userInput.value.trim() === '';
});

userInput.addEventListener('keydown', async function (e) {
    if (e.key === 'Enter') {
        handleUserInput();
    }
});

sendButton.addEventListener('click', handleUserInput);
