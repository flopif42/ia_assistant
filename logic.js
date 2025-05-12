const promptFournisseurData = [
    "Veuillez saisir le nom du fournisseur :", // 0
    "Veuillez saisir le numéro du contrat :", // 1
    "Veuillez saisir le code postal du fournisseur :", // 2
    "Veuillez saisir la ville du fournisseur :", // 3
    "Veuillez saisir l'adresse du fournisseur :", // 4
    "Veuillez saisir la raison sociale du fournisseur :", // 5
    "Veuillez saisir le capital du fournisseur :", // 6
    "Veuillez saisir la ville d'immatriculation du fournisseur :", // 7
    "Veuillez saisir le numéro RCS du fournisseur :", // 8
    "Veuillez saisir le nom du représentant du fournisseur :", // 9
    "Veuillez saisir la fonction du représentant du fournisseur :" // 10
];

const responseMessages = [
    "Je n'ai pas compris votre demande.", // 0

    "J'ai compris que vous souhaitez créer un contrat. Afin de pouvoir vous assister, j'aurais besoin des informations suivantes :\n" + // 1
    "• Nom du fournisseur\n" +
    "• Numéro du contrat\n\n" +
    "Dans le cas d'un nouveau fournisseur:\n" +
    "• Adresse du fournisseur (code postal, ville, rue)\n" +
    "• Les informations juridiques (raison sociale, capital, numéro RCS et ville d'immatriculation)\n" +
    "• Les informations du représentant de la société (nom et fonction)\n",

    "Confirmez-vous les informations suivantes ?\n" + // 2
    "• Numéro du contrat : NUM_CONTRAT\n" +
    "• Nom du fournisseur : NOM_FOURNISSEUR\n" +
    "• Adresse : ADR_FOURNISSEUR\n" +
    "• Code postal : CP_FOURNISSEUR\n" +
    "• Ville : VILLE_FOURNISSEUR\n" +
    "• Raison sociale : RS_FOURNISSEUR\n" +
    "• Capital : CAPITAL_FOURNISSEUR\n" +
    "• Ville immatriculation : IMMAT_FOURNISSEUR\n" +
    "• Numéro RCS : RCS_FOURNISSEUR\n" +
    "• Représentant : REPR_FOURNISSEUR\n" +
    "• Fonction du représentant : FCT_REP_FOURNISSEUR\n",

    "Comment puis-je vous aider ?", // 3
    "Très bien, je vais générer votre contrat.", // 4
    "Désirez-vous générer un autre contrat ?", // 5

    "Le fournisseur NOM_FOURNISSEUR a été trouvé dans la base, souhaitez-vous utiliser les données suivantes ?\n" + // 6
    "• Nom : NOM_FOURNISSEUR\n" +
    "• Adresse : ADR_FOURNISSEUR\n" +
    "• Code postal : CP_FOURNISSEUR\n" +
    "• Ville : VILLE_FOURNISSEUR\n" +
    "• Raison sociale : RS_FOURNISSEUR\n" +
    "• Numéro RCS : NUMRCS_FOURNISSEUR\n"
];

const dataAlliance = {
    nomFrns: 'Groupe Alliance',
    adresseFrns: '7 rue Scribe',
    codePostalFrns: '75009',
    villeFrns: 'PARIS',
    raisonSociale: 'SAS',
    capitalFrns: '500.000',
    villeImmat: 'Nanterre',
    numRCS: '504 729 286',
    representantFrns: 'M. Michael MALKA',
    fonctionRepr: 'Président'
}

async function getCityFromPostalCode(cp) {
    try {
        const response = await fetch(`https://geo.api.gouv.fr/communes?codePostal=${cp}&fields=nom&format=json`);
        const data = await response.json();
        if (data.length > 0) {
            return data[0].nom; // assume first one (works in most cases)
        }
    } catch (err) {
        console.error("Erreur lors de la récupération de la ville :", err);
    }
    return null;
}

async function computeResponse(userRequest) {
    let AIResponse;
    let lowercaseUserRequest = userRequest.toLocaleLowerCase();
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
                    .replace('NUMRCS_FOURNISSEUR', dataAlliance.numRCS);
                processStep = 3;
            } else {
                AIResponse = promptFournisseurData[2]; // demande le code postal
                processStep = 2;
            }
            break;

        case 2: // saisie infos fournisseur (substeps 2 à 10)
            switch (frnsDataSubstep) {
                // code postal
                case 2:
                    contratData.codePostalFrns = userRequest;
                    const guessedCity = await getCityFromPostalCode(userRequest);
                    if (guessedCity) {
                        contratData.villeFrns = guessedCity;
                        AIResponse = `${userRequest} correspond à la commune de ${guessedCity}. Souhaitez-vous utiliser cette donnée ?`;
                        processStep = 99; // use a temporary step for city confirmation
                    } else {
                        AIResponse = "Je n’ai pas pu trouver de ville pour ce code postal. Veuillez la saisir manuellement :";
                        frnsDataSubstep = 3;
                    }
                    break;

                // ville
                case 3:
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
                    contratData.raisonSociale = userRequest;
                    AIResponse = promptFournisseurData[6]; // demande le capital
                    frnsDataSubstep = 6;
                    break;

                // capital
                case 6:
                    contratData.capitalFrns = userRequest;
                    AIResponse = promptFournisseurData[7]; // demande la ville d'immat
                    frnsDataSubstep = 7;
                    break;

                // ville d'immatriculation
                case 7:
                    contratData.villeImmat = userRequest;
                    AIResponse = promptFournisseurData[8]; // demande le num RCS
                    frnsDataSubstep = 8;
                    break;

                // numéro RCS
                case 8:
                    contratData.numRCS = userRequest;
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
                AIResponse = promptFournisseurData[1];
                processStep = 4;
            } else {
                AIResponse = promptFournisseurData[2];
                processStep = 2;
            }
            break;

        // demande du numéro de contrat
        case 4:
            contratData.numContrat = userRequest;
            AIResponse = fillTemplate(responseMessages[2], {
                NUM_CONTRAT: contratData.numContrat,
                NOM_FOURNISSEUR: contratData.nomFrns,
                ADR_FOURNISSEUR: contratData.adresseFrns,
                CP_FOURNISSEUR: contratData.codePostalFrns,
                VILLE_FOURNISSEUR: contratData.villeFrns,
                RS_FOURNISSEUR: contratData.raisonSociale,
                CAPITAL_FOURNISSEUR: contratData.capitalFrns,
                IMMAT_FOURNISSEUR: contratData.villeImmat,
                RCS_FOURNISSEUR: contratData.numRCS,
                REPR_FOURNISSEUR: contratData.representantFrns,
                FCT_REP_FOURNISSEUR: contratData.fonctionRepr
            });
            processStep = 5;
            break;

        // demande de confirmation des infos
        case 5:
            if (lowercaseUserRequest.includes('oui') || lowercaseUserRequest.includes('ok')) {
                contratData.validated = true;
                AIResponse = responseMessages[4]
                processStep = 6;
            } else {
                initContratData();
                AIResponse = "La création du contrat a été annulée.\n" + responseMessages[3];
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
