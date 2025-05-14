const promptFournisseurData = [
    "Veuillez saisir le <strong>nom</strong> 🏦 du fournisseur :", // 0
    "Veuillez saisir le <strong>numéro du contrat</strong> 📝 :", // 1
    "Veuillez saisir le <strong>code postal</strong> du fournisseur :", // 2
    "Veuillez saisir la <strong>ville</strong> du fournisseur :", // 3
    "Veuillez saisir l'<strong>adresse</strong> 📍 du fournisseur :", // 4
    "Veuillez saisir la <strong>raison sociale</strong> 🏢 du fournisseur :", // 5
    "Veuillez saisir le <strong>capital</strong> 💶 du fournisseur :", // 6
    "Veuillez saisir la <strong>ville d'immatriculation</strong> du fournisseur :", // 7
    "Veuillez saisir le <strong>numéro SIREN</strong> du fournisseur :", // 8
    "Veuillez saisir le <strong>nom du représentant</strong> du fournisseur :", // 9
    "Veuillez saisir la <strong>fonction</strong> du représentant 👨‍💼 du fournisseur :" // 10
];

const infosRecap = "<strong>NOM_FOURNISSEUR</strong>\n" +
    "📍 ADR_FOURNISSEUR\n" +
    "CP_FOURNISSEUR VILLE_FOURNISSEUR\n" +
    "\n" +
    "🏢 RS_FOURNISSEUR au capital de CAPITAL_FOURNISSEUR euros\n" +
    "<strong>Numéro RCS</strong> : RCS IMMAT_FOURNISSEUR SIREN_FOURNISSEUR\n" +
    "<strong>Représentant</strong> : REPR_FOURNISSEUR, FCT_REP_FOURNISSEUR";

const responseMessages = [
    "Je n'ai pas compris votre demande.", // 0

    "J'ai compris que vous souhaitez créer un <strong>contrat</strong>. Afin de pouvoir vous assister, j'aurais besoin des informations suivantes :\n" + // 1
        "🏦 Le <strong>nom</strong> du fournisseur\n" +
        "📝 Le n° du <strong>contrat</strong>\n" +
        "\n" + 
        "S'il s'agit d'un nouveau fournisseur :\n" +
        "📍 L'<strong>adresse</strong> (code postal, ville, rue)\n" +
        "🏢 Les informations <strong>juridiques</strong> (raison sociale, capital, numéro SIREN et ville d'immatriculation)\n" +
        "👨‍💼 Les informations du <strong>représentant</strong> de la société (nom et fonction)\n",

    "Confirmez-vous les informations suivantes ?\n" + // 2
        "📝 <strong>N° du contrat</strong> : NUM_CONTRAT\n" +
        "\n" +
        infosRecap,

    "Comment puis-je vous aider ?", // 3
    "Très bien, je vais générer votre contrat.", // 4
    "Désirez-vous générer un autre contrat ?", // 5

    "Le fournisseur <strong>NOM_FOURNISSEUR</strong> a été trouvé dans la base, souhaitez-vous utiliser les données suivantes ?\n" + // 6
        infosRecap,

    "Je n’ai pas pu trouver de ville pour ce code postal. Veuillez saisir le nom de la ville manuellement :", // 7
    "La création du contrat a été annulée.\nComment puis-je vous aider ?", //8
    "❌ Cela ne semble pas être un code postal valide.", //9
    "❌ Cela ne semble pas être une raison sociale valide. Les différents types sont SA, SNC, SARL, EURL, SAS et SASU.", // 10
    "❌ Le montant saisi ne semble pas correct.", // 11
    "❌ Le numéro SIREN doit être composé de 9 chiffres.", // 12
    "❌ Cela ne semble pas être un nom de ville valide.", //13
    "📝 Le dernier contrat avec ce fournisseur porte le numéro <strong>MAX_NUM_CONTRAT</strong>. Souhaitez-vous utiliser le numéro <strong>NUM_CONTRAT_PLUS_UN</strong> pour ce nouveau contrat ?", // 14
    "✅ Très bien, je vais créer le nouveau contrat avec le numéro NUM_CONTRAT_PLUS_UN", // 15
    "🤷 Je n'ai pas trouvé le fournisseur <strong>NOM_FOURNISSEUR</strong> dans la base. Nous allons donc enregistrer ce nouveau fournisseur.", // 16
    "🎯 CODE_POSTAL correspond à la commune de <strong>GUESSED_CITY</strong>. Souhaitez-vous utiliser cette donnée ?" // 17
];

const dataAlliance = {
    nomFrns: 'Groupe Alliance',
    adresseFrns: '7 rue Scribe',
    codePostalFrns: '75009',
    villeFrns: 'PARIS',
    raisonSociale: 'SAS',
    capitalFrns: '500.000',
    villeImmat: 'Nanterre',
    numSIREN: '504 729 286',
    representantFrns: 'M. Michael MALKA',
    fonctionRepr: 'Président',
    maxNumContrat: 41
}

const raisonsSociales = [
    'sa', 'snc', 'sarl', 'eurl', 'sas', 'sasu'
];

const patternVille = /^[A-Za-zÉÈÎŒàâçéèëêïîôœûüÿ\-' ]+$/;
const patternCP = /^[0-9]{5}$/;
const patternCapital = /^[0-9]+$/;
const patternSiren = /^[0-9]{9}$/;

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

    if (lowercaseUserRequest.includes('annul')) {
        initContratData();
        AIResponse = responseMessages[8];
        processStep = 0;
        frnsDataSubstep = 2;
        return AIResponse;
    }

    switch (processStep) {
        case 0:
            if (lowercaseUserRequest.includes('contrat')) {
                AIResponse = responseMessages[1] + '\n' + promptFournisseurData[0];
                processStep = 1;
            } else {
                AIResponse = responseMessages[0];
            }
            break;

        // demande du nom du fournisseur
        case 1:
            contratData.nomFrns = userRequest;
            if (lowercaseUserRequest.includes('alliance')) {
                AIResponse = responseMessages[6]
                    .replaceAll('NOM_FOURNISSEUR', dataAlliance.nomFrns)
                    .replace('ADR_FOURNISSEUR', dataAlliance.adresseFrns)
                    .replace('CP_FOURNISSEUR', dataAlliance.codePostalFrns)
                    .replace('VILLE_FOURNISSEUR', dataAlliance.villeFrns)
                    .replace('RS_FOURNISSEUR', dataAlliance.raisonSociale)
                    .replace('CAPITAL_FOURNISSEUR', dataAlliance.capitalFrns)
                    .replace('IMMAT_FOURNISSEUR', dataAlliance.villeImmat)
                    .replace('SIREN_FOURNISSEUR', dataAlliance.numSIREN)
                    .replace('REPR_FOURNISSEUR', dataAlliance.representantFrns)
                    .replace('FCT_REP_FOURNISSEUR', dataAlliance.fonctionRepr)
                processStep = 3;
            } else {
                AIResponse = responseMessages[16].replace('NOM_FOURNISSEUR', userRequest) + "\n" + promptFournisseurData[2]; // demande le code postal
                processStep = 2;
            }
            break;

        case 2: // saisie infos fournisseur (substeps 2 à 10)
            switch (frnsDataSubstep) {
                // code postal
                case 2:
                    if (!patternCP.test(userRequest)) {
                        return responseMessages[9] + "\n" + promptFournisseurData[2]; // "code postal invalide (syntaxe)"
                    }
                    contratData.codePostalFrns = userRequest;
                    const guessedCity = await getCityFromPostalCode(userRequest);
                    if (guessedCity) {
                        contratData.villeFrns = guessedCity;
                        AIResponse = responseMessages[17]  // ville trouvée, utiliser l'info ?
                            .replace("CODE_POSTAL", userRequest)
                            .replace("GUESSED_CITY", guessedCity)
                            ; 
                        processStep = 99; 
                    } else {
                        AIResponse = responseMessages[7]; // demande la ville
                        frnsDataSubstep = 3;
                    }
                    break;

                // ville
                case 3:
                    if (!patternVille.test(userRequest)) {
                        return responseMessages[13] + "\n" + promptFournisseurData[3]; // "nom de ville invalide"
                    }
                    contratData.villeFrns = userRequest;
                    AIResponse = promptFournisseurData[4]; // demande la rue
                    frnsDataSubstep = 4;
                    break;

                // rue
                case 4:
                    contratData.adresseFrns = userRequest;
                    AIResponse = promptFournisseurData[5]; // demande la raison sociale
                    frnsDataSubstep = 5;
                    break;

                // raison sociale
                case 5:
                    if (raisonsSociales.indexOf(lowercaseUserRequest.replaceAll(".", "")) == -1) {
                        return responseMessages[10] + "\n" + promptFournisseurData[5]; // "raison sociale invalide"
                    }
                    contratData.raisonSociale = userRequest;
                    AIResponse = promptFournisseurData[6]; // demande le capital
                    frnsDataSubstep = 6;
                    break;

                // capital
                case 6:
                    if (!patternCapital.test(userRequest.replaceAll(".", "").replaceAll(",", ""))) {
                        return responseMessages[11] + "\n" + promptFournisseurData[6]; // "capital (montant) invalide"
                    }
                    contratData.capitalFrns = userRequest;
                    AIResponse = promptFournisseurData[7]; // demande la ville d'immat
                    frnsDataSubstep = 7;
                    break;

                // ville d'immatriculation
                case 7:
                    if (!patternVille.test(userRequest)) {
                        return responseMessages[13] + "\n" + promptFournisseurData[7]; // "nom de ville invalide"
                    }
                    contratData.villeImmat = userRequest;
                    AIResponse = promptFournisseurData[8]; // demande le num SIREN
                    frnsDataSubstep = 8;
                    break;

                // numéro Siren
                case 8:
                    if (!patternSiren.test(userRequest.replaceAll(" ", ""))) {
                        return responseMessages[12] + "\n" + promptFournisseurData[8]; // "num SIREN invalide"
                    }
                    contratData.numSIREN = userRequest;
                    AIResponse = promptFournisseurData[9]; // demande le nom du représentant
                    frnsDataSubstep = 9;
                    break;

                // nom représentant
                case 9:
                    contratData.representantFrns = userRequest;
                    AIResponse = promptFournisseurData[10]; // demande fonction représentant
                    frnsDataSubstep = 10;
                    break;

                // fonction représentant
                case 10:
                    contratData.fonctionRepr = userRequest;
                    AIResponse = promptFournisseurData[1]; // demande le numéro du contrat
                    processStep = 4;
                    frnsDataSubstep = 2;
                    break;

                default:
                    AIResponse = responseMessages[0]; // "Je n'ai pas compris."
                    processStep = 0;
                    frnsDataSubstep = 2;
                    break;
            }
            break;

        // Le nom du fournisseur est connu, demande si on veut utiliser les données existantes
        case 3:
            if (lowercaseUserRequest.includes('oui') || lowercaseUserRequest.includes('ok')) {
                contratData = structuredClone(dataAlliance);
                // dans le cas d'un fournisseur existant, demander si on veut utiliser maxNumContrat +1 comme numéro de contrat
                AIResponse = responseMessages[14]
                    .replace("MAX_NUM_CONTRAT", contratData.maxNumContrat)
                    .replace("NUM_CONTRAT_PLUS_UN", contratData.maxNumContrat + 1);
                processStep = 31;
            } else {
                AIResponse = promptFournisseurData[2];
                processStep = 2;
            }
            break;

        // confirmation : utiliser le num contrat +1
        case 31:
            if (lowercaseUserRequest.includes('oui') || lowercaseUserRequest.includes('ok')) {
                AIResponse = responseMessages[15].replace("NUM_CONTRAT_PLUS_UN", contratData.maxNumContrat + 1);
                contratData.numContrat = contratData.maxNumContrat + 1;

                // Confirmation des informations avant génération
                AIResponse = AIResponse + "\n" + getConfirmationMsg();
                processStep = 5;
            } else {
                AIResponse = promptFournisseurData[1]; // demande le num contrat
                processStep = 4;
            }
            break;

        // demande du numéro de contrat
        case 4:
            if (!isNaN(userRequest)) {
                userRequest = parseInt(userRequest);
            }
            contratData.numContrat = userRequest;
            AIResponse = getConfirmationMsg();
            processStep = 5;
            break;

        // demande de confirmation des infos
        case 5:
            if (lowercaseUserRequest.includes('oui') || lowercaseUserRequest.includes('ok')) {
                contratData.validated = true;
                AIResponse = responseMessages[4]
                processStep = 6;
                // Mettre à jour la valeur du dernier num contrat
                dataAlliance.maxNumContrat = contratData.numContrat;
            } else {
                initContratData();
                AIResponse = responseMessages[8];
                processStep = 0;
                frnsDataSubstep = 2;
            }
            break;

        // Générer un autre contrat ?
        case 6:
            if (lowercaseUserRequest.includes('oui') || lowercaseUserRequest.includes('ok')) {
                AIResponse = promptFournisseurData[0]
                processStep = 1;
            } else {
                AIResponse = responseMessages[3];
                processStep = 0;
                frnsDataSubstep = 2;
            }
            break;

        // confirmer l'utilisation de la ville retournée par l'API du gouv
        case 99:
            processStep = 2;
            if (lowercaseUserRequest.includes('oui') || lowercaseUserRequest.includes('ok')) {
                AIResponse = promptFournisseurData[4]; // demande adresse
                frnsDataSubstep = 4;
            } else {
                AIResponse = promptFournisseurData[3];
                frnsDataSubstep = 3;
            }
            break;

        default:
            AIResponse = responseMessages[0]; // "Je n'ai pas compris."
            processStep = 0;
            frnsDataSubstep = 2;
            break;
    }
    return AIResponse;
}

function getConfirmationMsg() {
    return fillTemplate(responseMessages[2], {  // message de confirmation
        NUM_CONTRAT: contratData.numContrat,
        NOM_FOURNISSEUR: contratData.nomFrns,
        ADR_FOURNISSEUR: contratData.adresseFrns,
        CP_FOURNISSEUR: contratData.codePostalFrns,
        VILLE_FOURNISSEUR: contratData.villeFrns,
        RS_FOURNISSEUR: contratData.raisonSociale,
        CAPITAL_FOURNISSEUR: contratData.capitalFrns,
        IMMAT_FOURNISSEUR: contratData.villeImmat,
        SIREN_FOURNISSEUR: contratData.numSIREN,
        REPR_FOURNISSEUR: contratData.representantFrns,
        FCT_REP_FOURNISSEUR: contratData.fonctionRepr
    })
}
