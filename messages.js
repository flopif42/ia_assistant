const promptentityData = [
    "Merci de saisir le <strong>nom complet</strong> 🏦 de l'entité :", // 0
    "Merci de saisir la <strong>référence</strong> du contrat 📝 :", // 1
    "Merci de saisir le <strong>code postal</strong> de l'entité :", // 2
    "Merci de saisir la <strong>ville</strong> de l'entité :", // 3
    "Merci de saisir l'<strong>adresse</strong> 📍 de l'entité :", // 4
    "Merci de saisir le <strong>type d'entreprise</strong> 🏢 de l'entité <i>(SA, SARL, SAS, etc.)</i> :", // 5
    "Merci de saisir le <strong>capital</strong> 💶 de l'entité en euros :", // 6
    "Merci de saisir la <strong>ville d'immatriculation au RCS</strong> de l'entité :", // 7
    "Merci de saisir le <strong>numéro SIREN</strong> de l'entité :", // 8
    "Merci de saisir les informations du <strong>représentant</strong> 👨‍💼 de l'entité NOM_ENTITY <i>(M., Mme ou Mlle prénom NOM)</i> :", // 9
    "Quelle est la <strong>fonction</strong> de NOM_REPR ?" // 10
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

    "🏃 On y est presque ! Il ne reste plus qu'une dernière vérification avant la génération de ton document.\n" + // 2
    "📝 N° du contrat : <strong>REF_CONTRAT</strong> de type Prestation de services entre d'une part:\n\n" + 
    "INFOS_FOURNISSEUR\n" +
    "Et d'autre part :\n\n" +
    "INFOS_EMETTEUR\n" +
    "Confirmes-tu l'exactitude de ces informations ?",

    "Comment puis-je t'aider ?", // 3
    "✅ Parfait, je vais maintenant générer ton contrat.", // 4
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

    "📝 Le dernier contrat avec ce fournisseur porte le numéro <strong>MAX_NUM_CONTRAT</strong>. " +// 14
    "Je vais créer le nouveau contrat avec le numéro <strong>NUM_CONTRAT_PLUS_UN</strong> et les données suivantes :\n",

    "Les différents types de contrat sont:\n\n" +  // 15
    "<strong>1:</strong> Prestation de services\n" +
    "<strong>2:</strong> Contrat cadre <i>(non disponible)</i>\n" +
    "<strong>3:</strong> Contrat d’abonnement <i>(non disponible)</i>\n" +
    "<strong>4:</strong> Contrat de collaboration ou de partenariat <i>(non disponible)</i>\n\n" +
    "Merci de saisir <strong>le numéro</strong> correspondant au type de contrat que tu souhaites générer :",

    "🤷 Je n'ai pas trouvé l'entité <strong>NOM_ENTITY</strong> dans la base. Veux-tu créer une nouvelle entité ?", // 16
    "🎯 Le code postal CODE_POSTAL correspond à la commune de <strong>GUESSED_CITY</strong>. Souhaites-tu utiliser cette donnée ?", // 17
    "Je suis ton agent IA qui te permet de rédiger tes contrats, en quoi puis-je t'aider ?", // 18
    "✅ OK, nous allons utiliser l'entité <strong>NOM_ENTITY</strong> comme ROLE_ENTITY du contrat.", // 19
    "❌ Je suis navré mais ce type de contrat n'est pas encore pris en charge.", // 20
    "<strong><strong>3.</strong></strong> Quelle est l’entité fournisseur du contrat ?", // 21

    "Je m'apprête à créer une nouvelle entité avec les données suivantes :\n" + // 22
    infosRecap + "\n" +
    "Confirmes-tu l'exactitude de ces informations ?",

    "<strong><strong>2. </strong></strong>Passons maintenant au <strong>type de contrat</strong> 📝.", // 23
    "Tu dois utiliser une entité existante pour pouvoir créer un contrat.", // 24
    "<strong><strong>1. </strong></strong> Quelle est l’entité émettrice du contrat ?", // 25
    "❌ Ce numéro de contrat ne semble pas correct.", // 26
    "<strong><strong>3. </strong></strong> Quelle est l’entité fournisseur du contrat ?", // 27
    "❌ Le nom du représentant ne correspond pas au format attendu : civilité (M., Mme ou Mlle suivi du prénom et du nom de famille, par exemple : M. Jean MARTIN).", // 28
    "✅ Le code postal <strong>CODE_POSTAL</strong> correspond bien à la ville de <strong>SEARCHED_CITY</strong>.", // 29

    "❌ Je n'ai pas pu valider la correspondance entre le code postal <strong>CODE_POSTAL</strong> " + // 30
    "et la ville de <strong>SEARCHED_CITY</strong>. Veux-tu tout de même utiliser ces informations ?",

    "Souhaites-tu utiliser ce numéro pour le contrat : <strong>REF_CONTRAT</strong> ?", // 31
    "Est-ce que REPR_ENTITY agit en qualité de <strong>PROPOSED_FCT</strong> ?", // 32

    "🏙️ J'ai trouvé cette adresse dans les villes suivantes :\n" + // 33
    "LIST_CITIES" +
    "<strong>NUM_CHOIX_SAISIE_MANUELLE</strong>: Saisir manuellement le code postal\n\n" +
    "Merci de saisir <strong>le numéro</strong> correspondant à ton choix :",

    "Très bien. Si tu as besoin d’autres contrats, n’hésite pas à me solliciter.", // 34
    "Souhaites-tu utiliser la même entité <strong>SAME_ENTITY</strong> comme émetteur pour le nouveau contrat ?", // 35
    "Peux-tu me préciser la <strong>civilité</strong> de PRENOM_REPR NOM_REPR <i>(M., Mme ou Mlle)</i> ?", // 36
    "❌ Cela ne semble pas être une adresse valide.", // 37
    "Est-ce que tu veux utiliser <strong>NOM_ENTITY</strong> comme nom pour la nouvelle entité ?" // 38
];
