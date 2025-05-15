const raisonsSociales = [
    'sa', 'snc', 'sarl', 'eurl', 'sas', 'sasu'
];

const patternVille = /^[A-Za-zÉÈÎŒàâçéèëêïîôœûüÿ\-' ]+$/;
const patternCP = /^[0-9]{5}$/;
const patternCapital = /^[0-9]+$/;
const patternSiren = /^[0-9]{9}$/;
const patternNomRepr = /^(m|mr|monsieur|mme|madame|mlle|mle|mademoiselle)\s+([A-Za-zÉÈÎŒàâçéèëêïîôœûüÿ\-]+)\s+([A-Za-zÉÈÎŒàâçéèëêïîôœûüÿ\-]+)$/;
const patternAdresseComplete = /^(.*)([0-9]{5})\s+([A-Za-zÉÈÎŒàâçéèëêïîôœûüÿ\-' ]+)$/;

let adrCplCodePostal;
let adrCplVille;

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
        case Step.BEGIN:
            if (lowercaseUserRequest.includes('contrat')) {
                AIResponse = responseMessages[1] + responseMessages[25]; // entité émettrice ?
                processStep = Step.PROMPT_EMETTEUR_ENTITY;
            } else {
                AIResponse = responseMessages[0]; //  je n'ai pas compris
            }
            break;

        // demande du nom du entity émetteur
        case Step.PROMPT_EMETTEUR_ENTITY:
            previousStep = Step.PROMPT_EMETTEUR_ENTITY;
            entity = getEntity(userRequest);
            if (entity) {
                AIResponse = responseMessages[6] // entité trouvée, utiliser les données pour l'émetteur ?
                    .replaceAll('NOM_ENTITY', entity.nom)
                    .replace('ADR_ENTITY', entity.adresse)
                    .replace('CP_ENTITY', entity.codePostal)
                    .replace('VILLE_ENTITY', entity.ville)
                    .replace('RS_ENTITY', entity.raisonSociale)
                    .replace('CAPITAL_ENTITY', formatCapital(entity.capital))
                    .replace('IMMAT_ENTITY', entity.villeImmat)
                    .replace('SIREN_ENTITY', entity.numSIREN)
                    .replace('REPR_ENTITY', entity.representant)
                    .replace('FCT_REP_ENTITY', entity.fonctionRepr)
                    .replace('ROLE_ENTITY', "société émettrice")
                processStep = Step.CONFIRM_USE_EMETTEUR_ENTITY;
            } else { 
                AIResponse = responseMessages[16].replace('NOM_ENTITY', userRequest); // entité non trouvée, la créer ?
                processStep = Step.CONFIRM_CREATE_ENTITY;
            }
            break;

      // Le nom du entity est connu, demande si on veut utiliser les données existantes comme émetteur
      case Step.CONFIRM_USE_EMETTEUR_ENTITY:
        if (lowercaseUserRequest.includes('oui') || lowercaseUserRequest.includes('ok')) {
            contrat.emetteur = entity;
            AIResponse = responseMessages[19]
                .replace("NOM_ENTITY", entity.nom)
                .replace("ROLE_ENTITY", "émetteur") + "\n" + // confirme l'entity pour le role
                responseMessages[23] + " " +
                responseMessages[15] // demande le type de contrat
            processStep = Step.PROMPT_CONTRAT_TYPE;
        } else {
            AIResponse = responseMessages[24] + "\n" + responseMessages[25]; 
            processStep = Step.PROMPT_EMETTEUR_ENTITY;
        }
        break;
        
    // voulez vous creer une nouvelle entite ?
    case Step.CONFIRM_CREATE_ENTITY:
        if (lowercaseUserRequest.includes('oui') || lowercaseUserRequest.includes('ok')) {
            AIResponse = promptentityData[0] // demande le nom de l'entité
            processStep = Step.CREATE_ENTITY;
            entityCreationSubstep = SubStep.PROMPT_NAME_ENTITY;
        } else {
            let additionalMsg;
            if (previousStep == Step.PROMPT_EMETTEUR_ENTITY) {
                additionalMsg = responseMessages[25];
            } else {
                additionalMsg = responseMessages[27];
            }
            AIResponse = responseMessages[24] + "\n" + additionalMsg; // entité émettrice ou fournisseur ?
            processStep = previousStep;
        }
        break;

        // type de contrat
        case Step.PROMPT_CONTRAT_TYPE:
            if (userRequest.includes('1') || userRequest.includes('pres')) {
                AIResponse = responseMessages[21] // demande entité fournisseur
                processStep = Step.PROMPT_FOURNISSEUR_ENTITY;
            } else {
                AIResponse = responseMessages[20] + "\n" + responseMessages[15]  // désolé, type de contrat non pris en charge
            }
            break;

            // demande l'entité fournisseur
        case Step.PROMPT_FOURNISSEUR_ENTITY:
            previousStep = Step.PROMPT_FOURNISSEUR_ENTITY;
            entity = getEntity(userRequest);
            if (entity) {
                AIResponse = responseMessages[6] // entité trouvée, utiliser les données (pour le fournisseur) ?
                    .replaceAll('NOM_ENTITY', entity.nom)
                    .replace('ADR_ENTITY', entity.adresse)
                    .replace('CP_ENTITY', entity.codePostal)
                    .replace('VILLE_ENTITY', entity.ville)
                    .replace('RS_ENTITY', entity.raisonSociale)
                    .replace('CAPITAL_ENTITY', formatCapital(entity.capital))
                    .replace('IMMAT_ENTITY', entity.villeImmat)
                    .replace('SIREN_ENTITY', entity.numSIREN)
                    .replace('REPR_ENTITY', entity.representant)
                    .replace('FCT_REP_ENTITY', entity.fonctionRepr)
                    .replace('ROLE_ENTITY', "fournisseur")
                processStep = Step.CONFIRM_USE_FOURNISSEUR_ENTITY;
            } else {
                AIResponse = responseMessages[16].replace('NOM_ENTITY', userRequest); // entité non trouvée, la créer ?
                processStep = Step.CONFIRM_CREATE_ENTITY;
            }
            break;

         // confirmation : utiliser les données trouvées pour le fournisseur ?
        case Step.CONFIRM_USE_FOURNISSEUR_ENTITY:
            if (lowercaseUserRequest.includes('oui') || lowercaseUserRequest.includes('ok')) {
                contrat.fournisseur = entity;
                contrat.numContrat = entity.maxNumContrat + 1;
                contrat.refContrat = "CP-" + MMYY_Date + "-" + contrat.fournisseur.nom + "-" + contrat.numContrat;
                AIResponse = responseMessages[31].replace("REF_CONTRAT", contrat.refContrat); // utilise la ref contrat générée ?
                processStep = Step.CONFIRM_USE_GENERATED_REF_CONTRAT;
            } else {
                AIResponse = responseMessages[24] + "\n" + responseMessages[27]; 
                processStep = Step.PROMPT_FOURNISSEUR_ENTITY;
            }
            break;

        // demande de confirmation des infos
        case Step.CONFIRM_CONTRAT_DATA:
            if (lowercaseUserRequest.includes('oui') || lowercaseUserRequest.includes('ok')) {
                contrat.validated = true;
                AIResponse = responseMessages[4]
                processStep = Step.CONFIRM_GENERATE_ANOTHER_CONTRAT;
                entity.maxNumContrat = contrat.numContrat; // Mettre à jour la valeur du dernier num contrat
            } else {
                initAll();
                AIResponse = responseMessages[8]; // creation de contrat annulee, que puis-je faire ?
                processStep = Step.BEGIN;
            }
            break;

        // Générer un autre contrat ?
        case Step.CONFIRM_GENERATE_ANOTHER_CONTRAT:
            initAll();
            if (lowercaseUserRequest.includes('oui') || lowercaseUserRequest.includes('ok')) {
                AIResponse = responseMessages[25];
                processStep = Step.PROMPT_EMETTEUR_ENTITY;
            } else {
                AIResponse = responseMessages[3];
                processStep = Step.BEGIN;
            }
            break;

        // CREATION ENTITY
        case Step.CREATE_ENTITY:
            switch (entityCreationSubstep) {
                // nom
                case SubStep.PROMPT_NAME_ENTITY:
                    entity = {};
                    entity.nom = userRequest;
                    AIResponse = promptentityData[4]; // demande la rue
                    entityCreationSubstep = SubStep.PROMPT_ADRESSE_ENTITY
                    break;
    
                // rue
                case SubStep.PROMPT_ADRESSE_ENTITY:
                    let isAdresseCompleteOK = false;
                    adresseComplete = checkAdresseComplete(userRequest);
                    if (adresseComplete) {
                        entity.adresse = capitalize(adresseComplete[1].trim().replace(",", ""));
                        adrCplCodePostal = adresseComplete[2];
                        adrCplVille = adresseComplete[3];

                        // vérifier la concordance du CP et de la ville
                        const searchedCity = await getCityFromPostalCode(adrCplCodePostal);
                        if (searchedCity && searchedCity.toLocaleLowerCase() == adrCplVille.toLocaleLowerCase()) {
                            entity.codePostal = adrCplCodePostal;
                            entity.ville = capitalize(adrCplVille);
                            AIResponse = responseMessages[29] // validation cp + ville
                                .replace("CODE_POSTAL", adrCplCodePostal)
                                .replace("SEARCHED_CITY", searchedCity) + "\n" + promptentityData[5]; // demande la raison soc
                            entityCreationSubstep = SubStep.PROMPT_RAISON_SOC_ENTITY;
                        } else {
                            AIResponse = responseMessages[30] // cp + ville non conforme
                                .replace("CODE_POSTAL", adrCplCodePostal)
                                .replace("SEARCHED_CITY", capitalize(adrCplVille));
                            entityCreationSubstep = SubStep.CONFIRM_USE_CP_VILLE;
                        }
                    } else { // not adresse complète (only rue)
                        entity.adresse = capitalize(userRequest);
                        AIResponse = promptentityData[2]; // demande le code postal
                        entityCreationSubstep = SubStep.PROMPT_CP_ENTITY;
                    }
                    break;

                // confirmer l'utilisation de CP et Ville qui ne correspondent pas
                case SubStep.CONFIRM_USE_CP_VILLE:
                    if (lowercaseUserRequest.includes('oui') || lowercaseUserRequest.includes('ok')) {
                        entity.codePostal = adrCplCodePostal;
                        entity.ville = capitalize(adrCplVille);
                        AIResponse = promptentityData[5]; // demande raison sociale
                        entityCreationSubstep = SubStep.PROMPT_RAISON_SOC_ENTITY;
                    } else {
                        AIResponse = promptentityData[2]; // demande le code postal
                        entityCreationSubstep = SubStep.PROMPT_CP_ENTITY;
                    }
                    break;

                // code postal
                case SubStep.PROMPT_CP_ENTITY:
                    if (!patternCP.test(userRequest)) {
                        return responseMessages[9] + "\n" + promptentityData[2]; // "code postal invalide (syntaxe)"
                    }
                    entity.codePostal = userRequest;
                    const guessedCity = await getCityFromPostalCode(userRequest);
                    if (guessedCity) {
                        entity.ville = guessedCity;
                        AIResponse = responseMessages[17]  // ville trouvée, utiliser l'info ?
                            .replace("CODE_POSTAL", userRequest)
                            .replace("GUESSED_CITY", guessedCity);
                        entityCreationSubstep = SubStep.CONFIRM_GUESSED_CITY;
                    } else { // API ne trouve pas de ville pour ce CP
                        AIResponse = responseMessages[7]  // ville non trouvée, saisie manuelle
                        entityCreationSubstep = SubStep.PROMPT_VILLE_ENTITY;
                    }
                    break;
                
                // confirmer l'utilisation de la ville retournée par l'API du gouv
                case SubStep.CONFIRM_GUESSED_CITY:
                    if (lowercaseUserRequest.includes('oui') || lowercaseUserRequest.includes('ok')) {
                        AIResponse = promptentityData[5]; // demande raison sociale
                        entityCreationSubstep = SubStep.PROMPT_RAISON_SOC_ENTITY;
                    } else {
                        AIResponse = promptentityData[3]; // demande la ville
                        entityCreationSubstep = SubStep.PROMPT_VILLE_ENTITY;
                    }
                    break;

                // ville
                case SubStep.PROMPT_VILLE_ENTITY:
                    if (patternVille.test(userRequest) && await isValidFrenchCity(userRequest)) {
                        entity.ville = capitalize(userRequest);
                        AIResponse = promptentityData[5]; // demande la raison soc
                        entityCreationSubstep = SubStep.PROMPT_RAISON_SOC_ENTITY;
                    } else {
                        AIResponse = responseMessages[13] + "\n" + promptentityData[3]; // "nom de ville invalide"
                    }
                    break;
    
                // raison sociale
                case SubStep.PROMPT_RAISON_SOC_ENTITY:
                    if (raisonsSociales.indexOf(lowercaseUserRequest.replaceAll(".", "")) == -1) {
                        AIResponse = responseMessages[10] + "\n" + promptentityData[5]; // "raison sociale invalide"
                    } else {
                        entity.raisonSociale = userRequest.toLocaleUpperCase();
                        AIResponse = promptentityData[6]; // demande le capital
                        entityCreationSubstep = SubStep.PROMPT_CAPITAL_ENTITY;
                    }
                    break;
    
                // capital
                case SubStep.PROMPT_CAPITAL_ENTITY:
                    formattedCapital = userRequest.replaceAll(".", "").replaceAll(",", "");
                    if (patternCapital.test(formattedCapital) && (parseInt(formattedCapital) != NaN)) {
                        entity.capital = parseInt(formattedCapital);
                        AIResponse = promptentityData[7]; // demande la ville d'immat
                        entityCreationSubstep = SubStep.PROMPT_VILLE_IMMAT;
                    } else {
                        AIResponse = responseMessages[11] + "\n" + promptentityData[6]; // "capital (montant) invalide"
                    }
                    break;
    
                // ville d'immatriculation
                case SubStep.PROMPT_VILLE_IMMAT:
                    if (patternVille.test(userRequest) && await isValidFrenchCity(userRequest)) {
                        entity.villeImmat = capitalize(userRequest);
                        AIResponse = promptentityData[8]; // demande le num SIREN
                        entityCreationSubstep = SubStep.PROMPT_SIREN_ENTITY;
                    } else {
                        AIResponse = responseMessages[13] + "\n" + promptentityData[7]; // "nom de ville invalide"
                    }
                    break;
    
                // numéro Siren
                case SubStep.PROMPT_SIREN_ENTITY:
                    if (patternSiren.test(userRequest.replaceAll(" ", ""))) {
                        entity.numSIREN = userRequest.substring(0, 3) + " " + userRequest.substring(3, 6) + " " + userRequest.substring(6);
                        AIResponse = promptentityData[9].replace("NOM_ENTITY", entity.nom); // demande le nom du représentant
                        entityCreationSubstep = SubStep.PROMPT_REPR_ENTITY;
                    } else {
                        AIResponse = responseMessages[12] + "\n" + promptentityData[8]; // "num SIREN invalide"
                    }
                    break;
    
                // nom représentant
                case SubStep.PROMPT_REPR_ENTITY:
                    nomRepr = checkNomRepresentant(userRequest);
                    if (nomRepr) {
                        entity.representant = nomRepr;
                        AIResponse = promptentityData[10]; // demande fonction représentant
                        entityCreationSubstep = SubStep.PROMPT_FCT_REPR_ENTITY;
                    } else {
                        AIResponse = responseMessages[28] + "\n" + promptentityData[9]; // format nom représentant invalide
                    }
                    break;
    
                // fonction représentant
                case SubStep.PROMPT_FCT_REPR_ENTITY:
                    entity.fonctionRepr = capitalize(userRequest);
                    AIResponse = responseMessages[22]
                        .replaceAll('NOM_ENTITY', entity.nom)
                        .replace('ADR_ENTITY', entity.adresse)
                        .replace('CP_ENTITY', entity.codePostal)
                        .replace('VILLE_ENTITY', entity.ville)
                        .replace('RS_ENTITY', entity.raisonSociale)
                        .replace('CAPITAL_ENTITY', formatCapital(entity.capital))
                        .replace('IMMAT_ENTITY', entity.villeImmat)
                        .replace('SIREN_ENTITY', entity.numSIREN)
                        .replace('REPR_ENTITY', entity.representant)
                        .replace('FCT_REP_ENTITY', entity.fonctionRepr); // confirmer les infos pour la création de l'entité ?
                    entityCreationSubstep = SubStep.CONFIRM_ENTITY_DATA;
                    break;
    
                // confirmer les infos de la création de l'entity
                case SubStep.CONFIRM_ENTITY_DATA:
                    if (lowercaseUserRequest.includes('oui') || lowercaseUserRequest.includes('ok')) {
                        let roleEntity;
                        let additionalMsg;
                        let persistedEntity = structuredClone(entity);
                        entities.push(persistedEntity);
                        if (previousStep == Step.PROMPT_EMETTEUR_ENTITY) {
                            roleEntity = "émetteur";
                            contrat.emetteur = persistedEntity;
                            additionalMsg = responseMessages[23] + "\n" + responseMessages[15]; // demande le type de contrat
                            processStep = Step.PROMPT_CONTRAT_TYPE;
                        } else {
                            roleEntity = "fournisseur";
                            contrat.fournisseur = persistedEntity;
                            contrat.fournisseur.maxNumContrat = 1;

                            // generated REF contrat
                            contrat.refContrat = "CP-" + MMYY_Date + "-" + contrat.fournisseur.nom + "-" + "1";
                            additionalMsg = responseMessages[31].replace("REF_CONTRAT", contrat.refContrat); // utilise la ref contrat générée ?
                            processStep = Step.CONFIRM_USE_GENERATED_REF_CONTRAT;
                        }
                        AIResponse = responseMessages[19]
                            .replace("NOM_ENTITY", entity.nom)
                            .replace("ROLE_ENTITY", roleEntity) + "\n" + additionalMsg;
                    } else {
                        AIResponse = "Reprenons la création de l'entité.\n" + promptentityData[0]; // demande le nom;
                        entityCreationSubstep = SubStep.PROMPT_NAME_ENTITY;
                    }
                    break;

                // erreur (ne devrait pas arriver ici)
                default:
                    AIResponse = responseMessages[0]; // "Je n'ai pas compris."
                    processStep = 0;
                    entityCreationSubstep = 2;
                    break;
            }
            break;

        // confirme si utiliser la ref contrat générée ou saisie manuelle
        case Step.CONFIRM_USE_GENERATED_REF_CONTRAT:
            if (lowercaseUserRequest.includes('oui') || lowercaseUserRequest.includes('ok')) {
                AIResponse = getConfirmationMsg();
                processStep = Step.CONFIRM_CONTRAT_DATA;
            } else {
                AIResponse = promptentityData[1];
                processStep = Step.PROMPT_REF_CONTRAT;
            }
            break;
  
        // demande de la référence du contrat
        case Step.PROMPT_REF_CONTRAT:
            contrat.refContrat = userRequest;
            AIResponse = getConfirmationMsg();
            processStep = Step.CONFIRM_CONTRAT_DATA;
            break;

        default:
            AIResponse = responseMessages[0]; // "Je n'ai pas compris."
            processStep = Step.BEGIN;
            break;
    }
    return AIResponse;
}

function getConfirmationMsg() {
    let emetteur = contrat.emetteur;
    let infosEmetteur = fillTemplate(infosRecap, {
        NOM_ENTITY: emetteur.nom,
        ADR_ENTITY: emetteur.adresse,
        CP_ENTITY: emetteur.codePostal,
        VILLE_ENTITY: emetteur.ville,
        RS_ENTITY: emetteur.raisonSociale,
        CAPITAL_ENTITY: formatCapital(emetteur.capital),
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
        CAPITAL_ENTITY: formatCapital(fournisseur.capital),
        IMMAT_ENTITY: fournisseur.villeImmat,
        SIREN_ENTITY: fournisseur.numSIREN,
        REPR_ENTITY: fournisseur.representant,
        FCT_REP_ENTITY: fournisseur.fonctionRepr
    });

    return fillTemplate(responseMessages[2], {  // message de confirmation
        REF_CONTRAT: contrat.refContrat,
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

function formatCivilite(input) {
    switch (input) {
        case 'm':
        case 'mr':
        case 'monsieur':
            return "M.";

        case 'mme':
        case 'madame':
            return "Mme.";

        case 'mlle':
        case 'mle':
        case 'mademoiselle':
            return "Mlle.";

        default:
            return null;
    }
}

function capitalize(input) {
    let output = "";
    for (let i = 0; i < input.length; i++) {
        if (i == 0 || (i > 0 && (input[i - 1] == '-' || input[i - 1] == ' '))) {
            output += input[i].toLocaleUpperCase();
        } else {
            output += input[i].toLocaleLowerCase();;
        }
    }
    return output;
}

function checkNomRepresentant(userText) {
    matches = patternNomRepr.exec(userText.toLocaleLowerCase().replace(".", ""));
    if (!matches) {
        return null;
    }
    civ = formatCivilite(matches[1]);
    prenom = capitalize(matches[2]);
    nom = matches[3].toLocaleUpperCase();
    return civ + " " + prenom + " " + nom;
}

async function isValidFrenchCity(cityName) {
    const normalized = cityName;
    const response = await fetch(`https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(normalized)}&fields=nom&limit=5`);
    const data = await response.json();

    // check if ANY returned city's name matches exactly
    return data.some(commune =>
        commune.nom.toLowerCase() === cityName.trim().toLowerCase()
    );
}

function formatCapital(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function checkAdresseComplete(input) {
    matches = patternAdresseComplete.exec(input);
    return matches;
}
