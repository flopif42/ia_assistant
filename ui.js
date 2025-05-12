// Utility: simulate typing effect
function typeMessage(text, className = 'ai', delay = typingDelayMs) {
    return new Promise(resolve => {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${className}`;
        chat.appendChild(messageEl);
        chat.scrollTop = chat.scrollHeight;
        let i = 0;

        function typeChar() {
            if (i < text.length) {
                messageEl.textContent += text[i++];
                if (text[i] == '\n') {
                    chat.scrollTop = chat.scrollHeight;
                }
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
    await wait(delayBeforeBotRespondsMs); // short delay before bot responds
    const AIMsg = await computeResponse(userInputText);
    await typeMessage(AIMsg);

    // if all info has been filled, generate contrat
    if (contratData.validated) {
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

        // get template file
        const response = await fetch('https://raw.githubusercontent.com/flopif42/ia_assistant/main/template_contrat.docx');
        const content = await response.arrayBuffer();
        const zip = new PizZip(content);
        const doc = new window.docxtemplater().loadZip(zip);

        // replace variable in template with user input
        doc.setData({
            DDYY: DDYY_Date,
            NOM_FOURNISSEUR: contratData.nomFrns,
            NUM_CONTRAT: contratData.numContrat,
            ADR_FOURNISSEUR: contratData.adresseFrns,
            CP_FOURNISSEUR: contratData.codePostalFrns,
            VILLE_FOURNISSEUR: contratData.villeFrns,
            RS_FOURNISSEUR: contratData.raisonSociale,
            CAPITAL_FOURNISSEUR: contratData.capitalFrns,
            IMMAT_FOURNISSEUR: contratData.villeImmat,
            RCS_FOURNISSEUR: contratData.numRCS,
            REP_FOURNISSEUR: contratData.representantFrns,
            FCT_REP_FOURNISSEUR: contratData.fonctionRepr
        });
        doc.render();
        const out = doc.getZip().generate({ type: 'blob' });

        // fake some waiting
        await wait(docGenerationTimeMs); 
        spinnerMessage.remove();

        // display result
        msg = "Votre document est prêt à être téléchargé.";
        await typeMessage(msg);

        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(out);
        downloadLink.download = 'contrat_' + contratData.nomFrns + '.docx';
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

        // reinitialize data
        initContratData();
        await typeMessage(responseMessages[5]);  // "générer un autre contrat ?"
    }
}
