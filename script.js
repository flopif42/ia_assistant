const chat = document.getElementById('chat');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');

let contratCreationStep = 0;

/*
creation steps :
1 : ask for nom fournisseur
2 : ask for num contrat
3 : confirmation
*/

const responseMessages = [
    "Je n'ai pas compris.",
    "D'accord je vais vous aider à créer un contrat. J'ai besoin des informations suivantes :\n• Nom du fournisseur\n• Numéro du contrat",
    "Veuillez saisir le nom du fournisseur:",
    "Veuillez saisir le numéro du contrat:",
    "Confirmez-vous ces informations:\nNom du fournisseur: NOM_FOURNISSEUR\nNuméro du contrat: NUM_CONTRAT ?",
    "Comment puis-je vous aider ?",
    "Je vais générer votre contrat."
];

let contratData = {
    nomFournisseur: null,
    numContrat: null,
    validated: false
}

// Utility: simulate typing effect
function typeMessage(text, className = 'ai', delay = 2) {
    return new Promise(resolve => {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${className}`;
        chat.appendChild(messageEl);
        let i = 0;

        function typeChar() {
            if (i < text.length) {
                messageEl.textContent += text[i++];
                setTimeout(typeChar, delay);
            } else {
                resolve();
                chat.scrollTop = chat.scrollHeight;
            }
        }

        typeChar();
    });
}

// Utility: delay
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

// Initial greeting with typing effect
window.addEventListener('DOMContentLoaded', async () => {
    await wait(500);
    await typeMessage("Bonjour, comment puis-je vous aider ?");
    chat.scrollTop = chat.scrollHeight;
});

userInput.addEventListener('input', () => {
    sendButton.disabled = userInput.value.trim() === '';
});

function isContratDataComplete() {
    return contratData.nomFournisseur && contratData.numContrat && contratData.validated;
}

function computeResponse(userRequest) {
    let AIResponse;

    console.log("step at begin of function : " + contratCreationStep);

    lowercaseUserRequest = userRequest.toLocaleLowerCase();

    if (contratCreationStep == 0) {
        if (lowercaseUserRequest.includes('contrat')) {
            AIResponse = responseMessages[1] + '\n' + responseMessages[2];
            contratCreationStep = 1;
        } else {
            AIResponse = responseMessages[0];
        }
    } else if (contratCreationStep == 1) {
        AIResponse = responseMessages[3];
        contratData.nomFournisseur = userRequest;
        contratCreationStep = 2;
    } else if (contratCreationStep == 2) {
        contratData.numContrat = userRequest;
        AIResponse = responseMessages[4].replace('NOM_FOURNISSEUR', contratData.nomFournisseur).replace('NUM_CONTRAT', contratData.numContrat);
        contratCreationStep = 3;
    } else if (contratCreationStep == 3) {
        if (lowercaseUserRequest.includes('oui') || lowercaseUserRequest.includes('ok')) {
            contratData.validated = true;
            AIResponse = responseMessages[6];
        } else {
            contratData.nomFournisseur = null;
            contratData.numContrat = null;
            contratData.validated = false;
            contratCreationStep = 0;
            AIResponse = responseMessages[5];
        }
    }
    console.log("step at end of function : " + contratCreationStep);
    return AIResponse;
}

async function handleUserInput() {
    const userInputText = userInput.value.trim();
    if (!userInputText) return;

    userInput.value = '';
    sendButton.disabled = true;

    // User message
    const userMsg = document.createElement('div');
    userMsg.className = 'message user';
    userMsg.textContent = userInputText;
    chat.appendChild(userMsg);
    chat.scrollTop = chat.scrollHeight;

    // AI message
    await wait(400); // short delay before bot responds
    const AIMsg = computeResponse(userInputText);
    await typeMessage(AIMsg);

    // if all info has been filled, generate contrat
    if (isContratDataComplete()) {
        const response = await fetch('https://raw.githubusercontent.com/flopif42/ia_assistant/main/template_contrat.docx');
        const content = await response.arrayBuffer();

        const zip = new PizZip(content);
        const doc = new window.docxtemplater().loadZip(zip);
        doc.setData({
            NOM_FOURNISSEUR: contratData.nomFournisseur,
            NUM_CONTRAT: contratData.numContrat
        });
        doc.render();
        const out = doc.getZip().generate({ type: 'blob' });

        // Show spinner
        const spinnerMessage = document.createElement('div');
        spinnerMessage.className = 'message ai';
        spinnerMessage.innerHTML = `
<div style="display: flex; align-items: center; gap: 10px;">
  <img src="spinner.gif" alt="Chargement..." width="24" height="24" />
  <span>Génération du document...</span>
</div>
`;
        spinnerMessage.id = 'spinner';
        chat.appendChild(spinnerMessage);
        chat.scrollTop = chat.scrollHeight;

        await wait(1800); 

        spinnerMessage.remove();

        msg = "Votre document est prêt à être téléchargé.";
        await typeMessage(msg);

        const documentDownload = document.createElement('div');
        documentDownload.innerHTML = 'Votre contrat est prêt :';

        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(out);
        downloadLink.download = 'contrat_generé.docx';
        downloadLink.textContent = '📄 Télécharger le contrat';
        downloadLink.style.display = 'inline-block';
        downloadLink.style.marginTop = '0.5em';
        downloadLink.style.textDecoration = 'none';
        downloadLink.style.color = '#0056d2';
        downloadLink.style.fontWeight = 'bold';

        const aiLinkMsg = document.createElement('div');
        aiLinkMsg.className = 'message ai';
        aiLinkMsg.appendChild(downloadLink);
        chat.appendChild(aiLinkMsg);
        chat.scrollTop = chat.scrollHeight;
    }
}

userInput.addEventListener('keydown', async function (e) {
    if (e.key === 'Enter') {
        handleUserInput();
    }
});

sendButton.addEventListener('click', handleUserInput);
