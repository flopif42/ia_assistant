const minBotDelayMs = 200;
const maxBotDelayMs = 1000;
const typingDelayMs = 5;

function typeMessage(html, className = 'ai', delay = typingDelayMs) {
    return new Promise(resolve => {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${className}`;
        chat.appendChild(messageEl);
        chat.scrollTop = chat.scrollHeight;

        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = html;

        async function typeNode(node, container) {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent;
                for (let i = 0; i < text.length; i++) {
                    container.append(text[i]);
                    await wait(delay);
                    chat.scrollTop = chat.scrollHeight;
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const el = document.createElement(node.tagName);
                // Copy attributes like <strong class="..."> if needed
                for (let attr of node.attributes) {
                    el.setAttribute(attr.name, attr.value);
                }
                container.appendChild(el);
                for (let child of node.childNodes) {
                    await typeNode(child, el);
                }
            }
        }

        (async () => {
            for (let child of tempContainer.childNodes) {
                await typeNode(child, messageEl);
            }
            resolve();
        })();
    });
}



// Utility: simulate typing effect
function oldtypeMessage(text, className = 'ai', delay = typingDelayMs) {
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
    /*
    // AI message
    await wait(delayBeforeBotRespondsMs); // short delay before bot responds
    const AIMsg = await computeResponse(userInputText);
    await typeMessage(AIMsg);
    */

    const stopThinking = showThinkingDots(); // show animation
    const AIMsg = await computeResponse(userInputText); // now it's async!
    await wait(getRandomBotDelay() + getSmartBotDelay(AIMsg));     // simulate thinking delay
    stopThinking();                           // remove animation
    await typeMessage(AIMsg);                 // display actual message

    // if all info has been filled, generate contrat
    if (contrat.validated) {
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
        emetteur = contrat.emetteur;
        fournisseur = contrat.fournisseur;

        doc.setData({
            DDYY: DDYY_Date,
            NUM_CONTRAT: contrat.numContrat,
            DATE_SIGNATURE: dateSignature,

            // infos fournisseur
            NOM_FOURNISSEUR: fournisseur.nom,
            ADR_FOURNISSEUR: fournisseur.adresse,
            CP_FOURNISSEUR: fournisseur.codePostal,
            VILLE_FOURNISSEUR: fournisseur.ville,
            RS_FOURNISSEUR: fournisseur.raisonSociale,
            CAPITAL_FOURNISSEUR: formatCapital(fournisseur.capital),
            IMMAT_FOURNISSEUR: fournisseur.villeImmat,
            RCS_FOURNISSEUR: "RCS " + fournisseur.villeImmat + " " + fournisseur.numSIREN,
            REP_FOURNISSEUR: fournisseur.representant,
            FCT_REP_FOURNISSEUR: fournisseur.fonctionRepr,

            // infos émetteur
            NOM_EMETTEUR: emetteur.nom,
            ADR_EMETTEUR: emetteur.adresse,
            CP_EMETTEUR: emetteur.codePostal,
            VILLE_EMETTEUR: emetteur.ville,
            RS_EMETTEUR: emetteur.raisonSociale,
            CAPITAL_EMETTEUR: formatCapital(emetteur.capital),
            IMMAT_EMETTEUR: emetteur.villeImmat,
            RCS_EMETTEUR: "RCS " + emetteur.villeImmat + " " + emetteur.numSIREN,
            REP_EMETTEUR: emetteur.representant,
            FCT_REP_EMETTEUR: emetteur.fonctionRepr
        });
        doc.render();
        const out = doc.getZip().generate({ type: 'blob' });

        // fake some waiting
        await wait(docGenerationTimeMs); 
        spinnerMessage.remove();

        // display result
        msg = "✅ Ton document est prêt à être téléchargé.";
        await typeMessage(msg);

        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(out);
        downloadLink.download = 'contrat_' + contrat.fournisseur.nom + '_' + contrat.numContrat + '.docx';
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
        initAll();
        await typeMessage(responseMessages[5]);  // "générer un autre contrat ?"
    }
}

function getRandomBotDelay(min = minBotDelayMs, max = maxBotDelayMs) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getSmartBotDelay(message) {
    const base = message.length * 5; // ~5ms per char
    return Math.min(Math.max(base, 300), 1500); // clamp between 300–1500ms
}

function showThinkingDots() {
    const dotsMessage = document.createElement('div');
    dotsMessage.className = 'dots';
    dotsMessage.id = 'thinkingDots';

    const dotSpan = document.createElement('span');
    dotSpan.className = 'typing-dots';
    dotsMessage.appendChild(dotSpan);

    chat.appendChild(dotsMessage);
    chat.scrollTop = chat.scrollHeight;

    let dotCount = 0;
    const interval = setInterval(() => {
        dotCount = (dotCount + 1) % 4; // 0–3 dots
        dotSpan.textContent = '●'.repeat(dotCount);
    }, 400);

    return () => {
        clearInterval(interval);
        dotsMessage.remove();
    };
}
