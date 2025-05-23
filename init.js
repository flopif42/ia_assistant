const chat = document.getElementById('chat');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');

const firstMsgDelayMs = 500;
const docGenerationTimeMs = 1800;

// PROMPT = ask for an information
// CONFIRM = ask for confirmation (yes / no)
const Step = {
    BEGIN: 0,
    PROMPT_EMETTEUR_ENTITY: 1,
    CONFIRM_USE_EMETTEUR_ENTITY: 2,
    CONFIRM_CREATE_ENTITY: 3,
    PROMPT_CONTRAT_TYPE: 4,
    PROMPT_FOURNISSEUR_ENTITY: 5,
    CONFIRM_USE_FOURNISSEUR_ENTITY: 6,
    CONFIRM_CONTRAT_DATA: 7,
    CONFIRM_GENERATE_ANOTHER_CONTRAT: 8,
    CREATE_ENTITY: 9,
    PROMPT_REF_CONTRAT: 10,
    CONFIRM_USE_GENERATED_REF_CONTRAT: 11,
    CONFIRM_USE_SAME_EMETTEUR: 12
};

const SubStep = {
    PROMPT_NAME_ENTITY: 0,
    PROMPT_ADRESSE_ENTITY: 1,
    PROMPT_CP_ENTITY: 2,
    CONFIRM_GUESSED_CITY: 3,
    PROMPT_VILLE_ENTITY: 4,
    PROMPT_RAISON_SOC_ENTITY: 5,
    PROMPT_CAPITAL_ENTITY: 6,
    PROMPT_VILLE_IMMAT: 7,
    PROMPT_SIREN_ENTITY: 8,
    PROMPT_REPR_ENTITY: 9,
    PROMPT_FCT_REPR_ENTITY: 10,
    CONFIRM_ENTITY_DATA: 11,
    CONFIRM_USE_CP_VILLE: 12,
    CONFIRM_USE_PROPOSED_FCT_REP: 13,
    PROMPT_CIVILITE_REPR: 14,
    CONFIRM_USE_KEYWORD_AS_NAME_ENTITY: 15
};

let processStep = Step.BEGIN;
let previousStep = null;
let entityCreationSubstep = SubStep.PROMPT_NAME_ENTITY;

let contrat = {}
let entity;

const d = new Date();
const month = d.getMonth() + 1;
if (month < 10) {
    strMonth = "0" + month;
}
const MMYY_Date = strMonth + "" + (d.getFullYear() - 2000);
const dateSignature = new Date().toLocaleDateString('fr-FR');

function initContrat() {
    contrat.numContrat = null;
    contrat.refContrat = null;
    contrat.fournisseur = null;
    contrat.emetteur = null;
    contrat.validated = false;
}

function initEntity() {
    entity = null;
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
