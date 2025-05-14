const promptentityData = [
    "Merci de saisir le <strong>nom</strong> 🏦 de l'entité :", // 0
    "Merci de saisir le <strong>numéro de référence</strong> pour le premier contrat avec ce fournisseur 📝 :", // 1
    "Merci de saisir le <strong>code postal</strong> de l'entité :", // 2
    "Merci de saisir la <strong>ville</strong> de l'entité :", // 3
    "Merci de saisir l'<strong>adresse</strong> 📍 de l'entité :", // 4
    "Merci de saisir la <strong>raison sociale</strong> 🏢 de l'entité :", // 5
    "Merci de saisir le <strong>capital</strong> 💶 de l'entité en euros :", // 6
    "Merci de saisir la <strong>ville d'immatriculation</strong> de l'entité :", // 7
    "Merci de saisir le <strong>numéro SIREN</strong> de l'entité :", // 8
    "Merci de saisir le <strong>représentant</strong> 👨‍💼 de l'entité (civilité prénom NOM, par exemple : M. Jean MARTIN) :", // 9
    "Merci de saisir la <strong>fonction</strong> du représentant de l'entité :" // 10
];

const infosRecap = "<strong>NOM_ENTITY</strong>\n" +
    "📍 ADR_ENTITY\n" +
    "CP_ENTITY VILLE_ENTITY\n\n" +
    "🏢 RS_ENTITY au capital de CAPITAL_ENTITY euros\n" +
    "n° RCS : RCS IMMAT_ENTITY SIREN_ENTITY\n" +
    "Représentée par REPR_ENTITY, FCT_REP_ENTITY\n";

const responseMessages = [
    "Je n'ai pas compris ta demande.", // 0

    "J'ai compris que tu souhaites créer un <strong>contrat</strong>. Afin de pouvoir t'assister, j'aurais besoin des informations suivantes :\n", // 1
    
    "📝 <strong>N° du contrat</strong> : NUM_CONTRAT de type Prestation de services entre d'une part :\n\n" + // 2
    "INFOS_FOURNISSEUR\n" +
    "Et d'autre part :\n\n" +
    "INFOS_EMETTEUR\n" +
    "Confirmes-tu l'exactitude de ces informations ?",

    "Comment puis-je t'aider ?", // 3
    "Très bien, je vais générer ton contrat.", // 4
    "Désires-tu générer un autre contrat ?", // 5

    "L'entité NOM_ENTITY a été trouvée dans la base avec les informations suivantes :\n\n" + // 6
    infosRecap + "\n" +
    "Souhaites-tu l'utiliser en tant que ROLE_ENTITY ?",

    "Je n’ai pas pu trouver de ville pour ce code postal. Merci de saisir le nom de la ville manuellement :", // 7
    "La création du contrat a été annulée.\nComment puis-je t'aider ?", //8
    "❌ Cela ne semble pas être un code postal valide.", //9
    "❌ Cela ne semble pas être une raison sociale valide. Les différents types sont SA, SNC, SARL, EURL, SAS et SASU.", // 10
    "❌ Le montant saisi ne semble pas correct.", // 11
    "❌ Le numéro SIREN doit être composé de 9 chiffres.", // 12
    "❌ Cela ne semble pas être un nom de ville valide.", //13
    "📝 Le dernier contrat avec ce fournisseur porte le numéro <strong>MAX_NUM_CONTRAT</strong>." +// 14
    "Je vais créer le nouveau contrat avec le numéro <strong>NUM_CONTRAT_PLUS_UN</strong> et les données suivantes :\n", 

    "Les différents types de contrat sont :\n\n" +  // 15
    "<strong>1.</strong> Prestation de services\n" +
    "<strong>2.</strong> Contrat cadre\n" +
    "<strong>3.</strong> Contrat d’abonnement\n" +
    "<strong>4.</strong> Contrat de collaboration ou de partenariat\n\n" +
    "Quel type souhaites-tu utiliser ?",

    "🤷 Je n'ai pas trouvé l'entité <strong>NOM_ENTITY</strong> dans la base. Veux-tu créer une nouvelle entité ?", // 16
    "🎯 Le code postal CODE_POSTAL correspond à la commune de <strong>GUESSED_CITY</strong>. Souhaites-tu utiliser cette donnée ?", // 17
    "Je suis ton agent IA qui te permet de rédiger tes contrats, en quoi puis-je t'aider ?", // 18

    "✅ Nous allons utiliser l'entité <strong>NOM_ENTITY</strong> comme ROLE_ENTITY du contrat.", // 19

    "❌ Je suis navré mais ce type de contrat n'est pas encore pris en charge.", // 20
    "<strong><strong>3.</strong></strong> Quelle est l’entité fournisseur du contrat ?", // 21

    "Je m'apprête à créer une nouvelle entité avec les données suivantes :\n" + // 22
    infosRecap + "\n" +
    "Confirmes-tu l'exactitude de ces informations ?",

    "<strong><strong>2. </strong></strong>Maintenant nous allons passer au <strong>type de contrat</strong> 📝.", // 23
    "Tu dois dois utiliser une entité existante pour pouvoir créer un contrat.", // 24
    "<strong><strong>1. </strong></strong> Quelle est l’entité émettrice du contrat ?", // 25
    "❌ Ce numéro de contrat ne semble pas correct.", // 26
    "<strong><strong>3. </strong></strong> Quelle est l’entité fournisseur du contrat ?", // 27
];

const raisonsSociales = [
    'sa', 'snc', 'sarl', 'eurl', 'sas', 'sasu'
];

const patternVille = /^[A-Za-zÉÈÎŒàâçéèëêïîôœûüÿ\-' ]+$/;
const patternCP = /^[0-9]{5}$/;
const patternCapital = /^[0-9]+$/;
const patternSiren = /^[0-9]{9}$/;

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
                    .replace('CAPITAL_ENTITY', entity.capital)
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
                responseMessages[23] + 
                responseMessages[15] // demande le type de contrat
            processStep = Step.PROMPT_CONTRAT_TYPE;
        } else {

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
                    .replace('CAPITAL_ENTITY', entity.capital)
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
                // Confirmation des informations avant génération
                AIResponse = responseMessages[14]        // dans le cas d'un entity existant, utiliser maxNumContrat +1 comme numéro de contrat
                    .replace("NUM_CONTRAT_PLUS_UN", entity.maxNumContrat + 1)
                    .replace("MAX_NUM_CONTRAT", entity.maxNumContrat) + "\n" +
                    getConfirmationMsg();
                processStep = Step.CONFIRM_CONTRAT_DATA;
            } else {

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
                    entity.adresse = userRequest;
                    AIResponse = promptentityData[2]; // demande le code postal
                    entityCreationSubstep = SubStep.PROMPT_CP_ENTITY;
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
                    if (patternVille.test(userRequest)) {
                        entity.ville = userRequest;
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
                        entity.raisonSociale = userRequest;
                        AIResponse = promptentityData[6]; // demande le capital
                        entityCreationSubstep = SubStep.PROMPT_CAPITAL_ENTITY;
                    }
                    break;
    
                // capital
                case SubStep.PROMPT_CAPITAL_ENTITY:
                    if (patternCapital.test(userRequest.replaceAll(".", "").replaceAll(",", ""))) {
                        entity.capital = userRequest;
                        AIResponse = promptentityData[7]; // demande la ville d'immat
                        entityCreationSubstep = SubStep.PROMPT_VILLE_IMMAT;
                    } else {
                        AIResponse = responseMessages[11] + "\n" + promptentityData[6]; // "capital (montant) invalide"
                    }
                    break;
    
                // ville d'immatriculation
                case SubStep.PROMPT_VILLE_IMMAT:
                    if (patternVille.test(userRequest)) {
                        entity.villeImmat = userRequest;
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
                        AIResponse = promptentityData[9]; // demande le nom du représentant
                        entityCreationSubstep = SubStep.PROMPT_REPR_ENTITY;
                    } else {
                        AIResponse = responseMessages[12] + "\n" + promptentityData[8]; // "num SIREN invalide"
                    }
                    break;
    
                // nom représentant
                case SubStep.PROMPT_REPR_ENTITY:
                    entity.representant = userRequest;
                    AIResponse = promptentityData[10]; // demande fonction représentant
                    entityCreationSubstep = SubStep.PROMPT_FCT_REPR_ENTITY;
                    break;
    
                // fonction représentant
                case SubStep.PROMPT_FCT_REPR_ENTITY:
                    entity.fonctionRepr = userRequest;
                    AIResponse = responseMessages[22]
                        .replaceAll('NOM_ENTITY', entity.nom)
                        .replace('ADR_ENTITY', entity.adresse)
                        .replace('CP_ENTITY', entity.codePostal)
                        .replace('VILLE_ENTITY', entity.ville)
                        .replace('RS_ENTITY', entity.raisonSociale)
                        .replace('CAPITAL_ENTITY', entity.capital)
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
                            additionalMsg = promptentityData[1];
                            processStep = Step.PROMPT_NUM_CONTRAT;
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
  
        // demande du numéro de contrat
        case Step.PROMPT_NUM_CONTRAT:
            if (isNaN(userRequest)) {
                AIResponse = responseMessages[26]; // "num contrat invalide"
            } else {
                userRequest = parseInt(userRequest);
                contrat.numContrat = userRequest;
                contrat.fournisseur.maxNumContrat = contrat.numContrat;
                AIResponse = getConfirmationMsg();
                processStep = Step.CONFIRM_CONTRAT_DATA;
            }
            break;

        default:
            AIResponse = responseMessages[0]; // "Je n'ai pas compris."
            processStep = Step.BEGIN;
            break;
    }
    console.log("current step : " + processStep + ", previous step : " + previousStep);
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
