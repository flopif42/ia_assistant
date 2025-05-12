const chat = document.getElementById('chat');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');

const firstMsgDelayMs = 500;
const delayBeforeBotRespondsMs = 400;
const typingDelayMs = 8;
const docGenerationTimeMs = 1800;

let processStep = 0;
let frnsDataSubstep = 2; // commencer à 2
let contratData = {}
const d = new Date();
const DDYY_Date = d.getDate() + "" + (d.getFullYear() - 2000);

function initContratData() {
    contratData.numContrat = null;
    contratData.nomFrns = null;
    contratData.adresseFrns = null;
    contratData.codePostalFrns = null;
    contratData.villeFrns = null;
    contratData.raisonSociale = null;
    contratData.capitalFrns = null;
    contratData.villeImmat = null;
    contratData.numRCS = null;
    contratData.representantFrns = null;
    contratData.fonctionRepr = null;
    contratData.validated = false;
}

initContratData();

// Initial greeting with typing effect
window.addEventListener('DOMContentLoaded', async () => {
    await wait(firstMsgDelayMs);
    await typeMessage("Bonjour, comment puis-je vous aider ?");
    chat.scrollTop = chat.scrollHeight;
});

userInput.addEventListener('input', () => {
    sendButton.disabled = userInput.value.trim() === '';
});

function fillTemplate(template, data) {
    return Object.entries(data).reduce(
        (text, [key, val]) => text.replaceAll(key, val),
        template
    );
}

userInput.addEventListener('keydown', async function (e) {
    if (e.key === 'Enter') {
        handleUserInput();
    }
});

sendButton.addEventListener('click', handleUserInput);
