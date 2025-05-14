const promptEmetteurData = [
    "Merci de saisir le <strong>nom</strong> 🏦 du entity :" // 0
];

const promptentityData = [
    "Merci de saisir le <strong>nom</strong> 🏦 du entity :", // 0
    "Merci de saisir le <strong>numéro du contrat</strong> 📝 :", // 1
    "Merci de saisir le <strong>code postal</strong> du entity :", // 2
    "Merci de saisir la <strong>ville</strong> du entity :", // 3
    "Merci de saisir l'<strong>adresse</strong> 📍 du entity :", // 4
    "Merci de saisir la <strong>raison sociale</strong> 🏢 du entity :", // 5
    "Merci de saisir le <strong>capital</strong> 💶 du entity :", // 6
    "Merci de saisir la <strong>ville d'immatriculation</strong> du entity :", // 7
    "Merci de saisir le <strong>numéro SIREN</strong> du entity :", // 8
    "Merci de saisir le <strong>nom du représentant</strong> 👨‍💼 du entity :", // 9
    "Merci de saisir la <strong>fonction</strong> du représentant du entity :" // 10
];

const infosRecap = "<strong>NOM_ENTITY</strong>\n" +
    "📍 ADR_ENTITY\n" +
    "CP_ENTITY VILLE_ENTITY\n" +
    "🏢 RS_ENTITY au capital de CAPITAL_ENTITY euros\n" +
    "n° RCS : RCS IMMAT_ENTITY SIREN_ENTITY\n" +
    "Représentée par REPR_ENTITY, FCT_REP_ENTITY\n";

const responseMessages = [
    "Je n'ai pas compris ta demande.", // 0

    "J'ai compris que tu souhaites créer un <strong>contrat</strong>. Afin de pouvoir t'assister, j'aurais besoin des informations suivantes :\n" + // 1
    "<strong><strong>1.</strong></strong> Quelle est l’entité émettrice du contrat ?",

    "📝 <strong>N° du contrat</strong> : NUM_CONTRAT de type <strong>Prestation de services</strong> entre d'une part :\n\n" + // 2
    "INFOS_FOURNISSEUR\n" +
    "Et d'autre part :\n\n" +
    "INFOS_EMETTEUR\n" +
    "Confirmes-tu l'exactitude de ces informations ?",

    "Comment puis-je t'aider ?", // 3
    "Très bien, je vais générer ton contrat.", // 4
    "Désires-tu générer un autre contrat ?", // 5

    "L'entité <strong>NOM_ENTITY</strong> a été trouvée dans la base avec les informations suivantes :\n" + // 6
    infosRecap + "\n" +
    "Souhaites-tu utiliser cette entité pour ROLE_ENTITY ?",

    "Je n’ai pas pu trouver de ville pour ce code postal. Merci de saisir le nom de la ville manuellement :", // 7
    "La création du contrat a été annulée.\nComment puis-je t'aider ?", //8
    "❌ Cela ne semble pas être un code postal valide.", //9
    "❌ Cela ne semble pas être une raison sociale valide. Les différents types sont SA, SNC, SARL, EURL, SAS et SASU.", // 10
    "❌ Le montant saisi ne semble pas correct.", // 11
    "❌ Le numéro SIREN doit être composé de 9 chiffres.", // 12
    "❌ Cela ne semble pas être un nom de ville valide.", //13
    "📝 Le dernier contrat avec ce fournisseur porte le numéro <strong>MAX_NUM_CONTRAT</strong>. Souhaites-tu utiliser le numéro <strong>NUM_CONTRAT_PLUS_UN</strong> pour ce nouveau contrat ?", // 14
    "✅ Très bien, je vais créer le nouveau contrat avec le numéro NUM_CONTRAT_PLUS_UN.", // 15
    "🤷 Je n'ai pas trouvé l'entité <strong>NOM_ENTITY</strong> dans la base. Veux-tu créer une nouvelle entité ?", // 16
    "🎯 CODE_POSTAL correspond à la commune de <strong>GUESSED_CITY</strong>. Souhaites-tu utiliser cette donnée ?", // 17
    "Je suis ton agent IA qui te permet de rédiger tes contrats, en quoi puis-je t'aider ?", // 18

    "<strong><strong>2.</strong></strong> De quel <strong>type de contrat</strong> 📝 s'agit-il ? Les différents types sont :\n" + // 19
    "<strong>1.</strong> Prestation de services\n" +
    "<strong>2.</strong> Contrat cadre\n" +
    "<strong>3.</strong> Contrat d’abonnement\n" +
    "<strong>4.</strong> Contrat de collaboration ou de partenariat",

    "❌ Je suis navré mais ce type de contrat n'est pas encore pris en charge.", // 20
    "<strong><strong>3.</strong></strong> Quelle est l’entité fournisseur du contrat ?" // 21
];

const entities = [
    {
        nom: 'Groupe Alliance',
        adresse: '7 rue Scribe',
        codePostal: '75009',
        ville: 'Paris',
        raisonSociale: 'SAS',
        capital: '500.000',
        villeImmat: 'Nanterre',
        numSIREN: '504 729 286',
        representant: 'Michael MALKA',
        fonctionRepr: 'Président',
        maxNumContrat: 41
    },
    {
        nom: 'Capgemini',
        adresse: '145-151 Quai du Président Roosevelt',
        codePostal: '92130',
        ville: 'Issy-les-Moulineaux',
        raisonSociale: 'SARL',
        capital: '30.000.000.000',
        villeImmat: 'Nanterre',
        numSIREN: '328 781 786',
        representant: 'Aiman Ezzat',
        fonctionRepr: 'Directeur général',
        maxNumContrat: 85419
    },
    {
        nom: 'Spirica',
        adresse: '31 rue Falguière',
        codePostal: '75015',
        ville: 'Paris',
        raisonSociale: 'SA',
        capital: '56.000.000',
        villeImmat: 'Paris',
        numSIREN: '487 739 963',
        representant: 'Daniel COLLIGNON',
        fonctionRepr: 'Directeur général',
        maxNumContrat: 1390
    }
];

const raisonsSociales = [
    'sa', 'snc', 'sarl', 'eurl', 'sas', 'sasu'
];

const patternVille = /^[A-Za-zÉÈÎŒàâçéèëêïîôœûüÿ\-' ]+$/;
const patternCP = /^[0-9]{5}$/;
const patternCapital = /^[0-9]+$/;
const patternSiren = /^[0-9]{9}$/;

function getConfirmationMsg() {
    let emetteur = contrat.emetteur;
    let infosEmetteur = fillTemplate(infosRecap, {
        NOM_ENTITY: emetteur.nom,
        ADR_ENTITY: emetteur.adresse,
        CP_ENTITY: emetteur.codePostal,
        VILLE_ENTITY: emetteur.ville,
        RS_ENTITY: emetteur.raisonSociale,
        CAPITAL_ENTITY: emetteur.capital,
        IMMAT_ENTITY: emetteur.villeImmat,
        SIREN_ENTITY: emetteur.numSIREN,
        REPR_ENTITY: emetteur.representant,
        FCT_REP_ENTITY: emetteur.fonctionRepr
    });

    let fournisseur = contrat.fournisseur;
    let infosFournisseur = fillTemplate(infosRecap, {
        NOM_ENTITY: fournisseur.nom,
        ADR_ENTITY: fournisseur.adresse,
        CP_ENTITY: fournisseur.codePostal,
        VILLE_ENTITY: fournisseur.ville,
        RS_ENTITY: fournisseur.raisonSociale,
        CAPITAL_ENTITY: fournisseur.capital,
        IMMAT_ENTITY: fournisseur.villeImmat,
        SIREN_ENTITY: fournisseur.numSIREN,
        REPR_ENTITY: fournisseur.representant,
        FCT_REP_ENTITY: fournisseur.fonctionRepr
    });

    return fillTemplate(responseMessages[2], {  // message de confirmation
        NUM_CONTRAT: contrat.numContrat,
        INFOS_EMETTEUR: infosEmetteur,
        INFOS_FOURNISSEUR: infosFournisseur
    })
}


function getEntity(keyword) {
    keyword = keyword.toLowerCase();
    return entities.find(entity => entity.nom.toLowerCase().includes(keyword));
}

async function getCityFromPostalCode(cp) {
    try {
        const response = await fetch(`https://geo.api.gouv.fr/communes?codePostal=${cp}&fields=nom&format=json`);
        const data = await response.json();
        if (data.length > 0) {
            return data[0].nom;
        }
    } catch (err) {
        console.error("Erreur lors de la récupération de la ville :", err);
    }
    return null;
}

async function computeResponse(userRequest) {
    let AIResponse;
    let lowercaseUserRequest = userRequest.toLocaleLowerCase();

    // Pour annuler la saisie en cours
    if (lowercaseUserRequest.includes('annul')) {
        initAll();
        AIResponse = responseMessages[8];
        processStep = 0;
        entityCreationSubstep = 2;
        return AIResponse;
    }

    switch (processStep) {
        case 0:
            if (lowercaseUserRequest.includes('contrat')) {
                AIResponse = responseMessages[1]; // entité émettrice ?
                processStep = 1;
            } else {
                AIResponse = responseMessages[0];
            }
            break;

        // demande du nom du entity émetteur
        case 1:
            // entity.nom = userRequest;
            entity = getEntity(userRequest);
            if (entity) {
                AIResponse = responseMessages[6] // entité trouvée, utiliser les données pour l'émetteur ?
                    .replaceAll('NOM_ENTITY', entity.nom)
                    .replace('ADR_ENTITY', entity.adresse)
                    .replace('CP_ENTITY', entity.codePostal)
                    .replace('VILLE_ENTITY', entity.ville)
                    .replace('RS_ENTITY', entity.raisonSociale)
                    .replace('CAPITAL_ENTITY', entity.capital)
                    .replace('IMMAT_ENTITY', entity.villeImmat)
                    .replace('SIREN_ENTITY', entity.numSIREN)
                    .replace('REPR_ENTITY', entity.representant)
                    .replace('FCT_REP_ENTITY', entity.fonctionRepr)
                    .replace('ROLE_ENTITY', "l'émetteur")
                processStep = 3;
            } else {
                AIResponse = responseMessages[16].replace('NOM_ENTITY', userRequest) + "\n" + promptentityData[2]; // demande le code postal
                processStep = 2;
            }
            break;

        case 2: // saisie infos entity (substeps 2 à 10)
            switch (entityCreationSubstep) {
                // code postal
                case 2:
                    if (!patternCP.test(userRequest)) {
                        return responseMessages[9] + "\n" + promptentityData[2]; // "code postal invalide (syntaxe)"
                    }
                    entity.codePostal = userRequest;
                    const guessedCity = await getCityFromPostalCode(userRequest);
                    if (guessedCity) {
                        entity.villeFrns = guessedCity;
                        AIResponse = responseMessages[17]  // ville trouvée, utiliser l'info ?
                            .replace("CODE_POSTAL", userRequest)
                            .replace("GUESSED_CITY", guessedCity)
                            ; 
                        processStep = 99; 
                    } else {
                        AIResponse = responseMessages[7]; // demande la ville
                        entityCreationSubstep = 3;
                    }
                    break;

                // ville
                case 3:
                    if (!patternVille.test(userRequest)) {
                        return responseMessages[13] + "\n" + promptentityData[3]; // "nom de ville invalide"
                    }
                    entity.ville = userRequest;
                    AIResponse = promptentityData[4]; // demande la rue
                    entityCreationSubstep = 4;
                    break;

                // rue
                case 4:
                    entity.adresse = userRequest;
                    AIResponse = promptentityData[5]; // demande la raison sociale
                    entityCreationSubstep = 5;
                    break;

                // raison sociale
                case 5:
                    if (raisonsSociales.indexOf(lowercaseUserRequest.replaceAll(".", "")) == -1) {
                        return responseMessages[10] + "\n" + promptentityData[5]; // "raison sociale invalide"
                    }
                    entity.raisonSociale = userRequest;
                    AIResponse = promptentityData[6]; // demande le capital
                    entityCreationSubstep = 6;
                    break;

                // capital
                case 6:
                    if (!patternCapital.test(userRequest.replaceAll(".", "").replaceAll(",", ""))) {
                        return responseMessages[11] + "\n" + promptentityData[6]; // "capital (montant) invalide"
                    }
                    entity.capital = userRequest;
                    AIResponse = promptentityData[7]; // demande la ville d'immat
                    entityCreationSubstep = 7;
                    break;

                // ville d'immatriculation
                case 7:
                    if (!patternVille.test(userRequest)) {
                        return responseMessages[13] + "\n" + promptentityData[7]; // "nom de ville invalide"
                    }
                    entity.villeImmat = userRequest;
                    AIResponse = promptentityData[8]; // demande le num SIREN
                    entityCreationSubstep = 8;
                    break;

                // numéro Siren
                case 8:
                    if (!patternSiren.test(userRequest.replaceAll(" ", ""))) {
                        return responseMessages[12] + "\n" + promptentityData[8]; // "num SIREN invalide"
                    }
                    entity.numSIREN = userRequest.substring(0, 3) + " " + userRequest.substring(3, 6) + " " + userRequest.substring(6);
                    AIResponse = promptentityData[9]; // demande le nom du représentant
                    entityCreationSubstep = 9;
                    break;

                // nom représentant
                case 9:
                    entity.representant = userRequest;
                    AIResponse = promptentityData[10]; // demande fonction représentant
                    entityCreationSubstep = 10;
                    break;

                // fonction représentant
                case 10:
                    entity.fonctionRepr = userRequest;
                    AIResponse = promptentityData[1]; // demande le numéro du contrat
                    processStep = 4;
                    entityCreationSubstep = 2;
                    break;

                default:
                    AIResponse = responseMessages[0]; // "Je n'ai pas compris."
                    processStep = 0;
                    entityCreationSubstep = 2;
                    break;
            }
            break;

        // Le nom du entity est connu, demande si on veut utiliser les données existantes comme émetteur
        case 3:
            if (lowercaseUserRequest.includes('oui') || lowercaseUserRequest.includes('ok')) {
                contrat.emetteur = entity;

                AIResponse = responseMessages[19] // demande le type de contrat
                processStep = 10;
            } else {
                AIResponse = promptentityData[2];
                processStep = 2;
            }
            break;

        // type de contrat
        case 10:
            if (userRequest.includes('1') || userRequest.includes('pres')) {
                AIResponse = responseMessages[21] // demande entité fournisseur
                processStep = 11;
            } else {
                AIResponse = responseMessages[20] + "\n" + responseMessages[19]  // désolé, type de contrat non pris en charge
            }
            break;

        // demande l'entité fournisseur
        case 11:
            //entity.nom = userRequest;
            entity = getEntity(userRequest);
            if (entity) {
                AIResponse = responseMessages[6] // entité trouvée, utiliser les données (pour le fournisseur) ?
                    .replaceAll('NOM_ENTITY', entity.nom)
                    .replace('ADR_ENTITY', entity.adresse)
                    .replace('CP_ENTITY', entity.codePostal)
                    .replace('VILLE_ENTITY', entity.ville)
                    .replace('RS_ENTITY', entity.raisonSociale)
                    .replace('CAPITAL_ENTITY', entity.capital)
                    .replace('IMMAT_ENTITY', entity.villeImmat)
                    .replace('SIREN_ENTITY', entity.numSIREN)
                    .replace('REPR_ENTITY', entity.representant)
                    .replace('FCT_REP_ENTITY', entity.fonctionRepr)
                    .replace('ROLE_ENTITY', "le fournisseur")
                processStep = 12;
            }
            break;

        // confirmation : utiliser les données trouvées pour le fournisseur ?
        case 12:
            if (lowercaseUserRequest.includes('oui') || lowercaseUserRequest.includes('ok')) {
                contrat.fournisseur = entity;
                // dans le cas d'un entity existant, demander si on veut utiliser maxNumContrat +1 comme numéro de contrat
                AIResponse = responseMessages[14]
                    .replace("MAX_NUM_CONTRAT", entity.maxNumContrat)
                    .replace("NUM_CONTRAT_PLUS_UN", entity.maxNumContrat + 1);
                processStep = 31;
            }
            break;

        // confirmation : utiliser le num contrat +1
        case 31:
            if (lowercaseUserRequest.includes('oui') || lowercaseUserRequest.includes('ok')) {
                AIResponse = responseMessages[15].replace("NUM_CONTRAT_PLUS_UN", entity.maxNumContrat + 1);
                contrat.numContrat = entity.maxNumContrat + 1;
                // Confirmation des informations avant génération
                AIResponse = AIResponse + "\n" + getConfirmationMsg();
                processStep = 5;
            } else {
                AIResponse = promptentityData[1]; // demande le num contrat
                processStep = 4;
            }
            break;

        // demande du numéro de contrat
        case 4:
            if (!isNaN(userRequest)) {
                userRequest = parseInt(userRequest);
            }
            contrat.numContrat = userRequest;
            AIResponse = getConfirmationMsg();
            processStep = 5;
            break;

        // demande de confirmation des infos
        case 5:
            if (lowercaseUserRequest.includes('oui') || lowercaseUserRequest.includes('ok')) {
                contrat.validated = true;
                AIResponse = responseMessages[4]
                processStep = 6;
                // Mettre à jour la valeur du dernier num contrat
                entity.maxNumContrat = contrat.numContrat;
            } else {
                initAll();
                AIResponse = responseMessages[8];
                processStep = 0;
                entityCreationSubstep = 2;
            }
            break;

        // Générer un autre contrat ?
        case 6:
            if (lowercaseUserRequest.includes('oui') || lowercaseUserRequest.includes('ok')) {
                AIResponse = promptentityData[0]
                processStep = 1;
            } else {
                AIResponse = responseMessages[3];
                processStep = 0;
                entityCreationSubstep = 2;
            }
            break;

        // confirmer l'utilisation de la ville retournée par l'API du gouv
        case 99:
            processStep = 2;
            if (lowercaseUserRequest.includes('oui') || lowercaseUserRequest.includes('ok')) {
                AIResponse = promptentityData[4]; // demande adresse
                entityCreationSubstep = 4;
            } else {
                AIResponse = promptentityData[3];
                entityCreationSubstep = 3;
            }
            break;

        default:
            AIResponse = responseMessages[0]; // "Je n'ai pas compris."
            processStep = 0;
            entityCreationSubstep = 2;
            break;
    }
    return AIResponse;
}

