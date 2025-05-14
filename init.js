const chat = document.getElementById('chat');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');

const firstMsgDelayMs = 500;
const delayBeforeBotRespondsMs = 400;
const typingDelayMs = 1;
const docGenerationTimeMs = 1800;

let processStep = 0;
let entityCreationSubstep = 2; // commencer à 2

let contrat = {}
let entity;

const d = new Date();
const DDYY_Date = d.getDate() + "" + (d.getFullYear() - 2000);

function initContrat() {
    contrat.numContrat = null;
    contrat.fournisseur = null;
    contrat.emetteur = null;
    contrat.validated = false;
}

function initEntity() {
    entity = null;
    /*
    entity.nom = null;
    entity.adresse = null;
    entity.codePostal = null;
    entity.ville = null;
    entity.raisonSociale = null;
    entity.capital = null;
    entity.villeImmat = null;
    entity.numSIREN = null;
    entity.representant = null;
    entity.fonctionRepr = null;
    */
}

function fillTemplate(template, data) {
    return Object.entries(data).reduce(
        (text, [key, val]) => text.replaceAll(key, val),
        template
    );
}

function initAll() {
    initEntity();
    initContrat();
}

userInput.focus();
