// Sistema di Internazionalizzazione (i18n) per Caduta Libera / Still Standing
// Supporta Italiano (IT), English (EN), Español (ES), Français (FR), Deutsch (DE)

export const TRANSLATIONS = {
  it: {
    langCode: "it-IT",
    logoTop: "CADUTA",
    logoBot: "LIBERA",
    modeTag: "IL GIOCO FINALE: LE 10 BOTOLE",
    jackpotLabel: "MONTEPREMI IN PALIO",
    btnRules: "📖 Regole",
    btnAudioOn: "🔊 Suono On",
    btnAudioOff: "🔇 Suono Off",
    btnVoiceOn: "🎙️ Voce On",
    btnVoiceOff: "🎙️ Voce Off",
    btnCamera: "🎥 Camera",
    
    // Status Banners
    bannerIntro: "ASCOLTA LA DOMANDA E SCEGLI 1 RISPOSTA TRA LE 10 BOTOLE",
    bannerPhase1: "FASE 1: HAI 90 SECONDI PER SALIRE SULLA BOTOLA CHE RITIENI ESATTA!",
    bannerChosen: "TI TROVI SULLA BOTOLA {num}: \"{text}\". PREMI CONFERMA PER BLOCCARE!",
    bannerPhase2: "FASE 2: IL PROGRAMMA ELIMINA 5 RISPOSTE SICURAMENTE ERRATE...",
    bannerPhase3: "FASE 3 (30s): MANTIENI LA TUA BOTOLA O CAMBIALA DIMEZZANDO IL MONTEPREMI!",
    bannerPhase3Confirmed: "SCELTA BLOCCATA! PREPARATI AL CONFRONTO DIRETTO...",
    bannerPhase4: "FASE 4: SEI SULLA BOTOLA {myId}. CLICCA SU UNA DELLE ALTRE {rem} BOTOLE PER CONFRONTARLA!",
    bannerConfronting: "CONFRONTO IN CORSO: BOTOLA {targetId} (\"{text}\") vs LA TUA BOTOLA {myId}!",
    bannerConfrontSafe: "OTTIMO! LA BOTOLA {targetId} È CADUTA! RESTANO {rem} BOTOLE DA CONFRONTARE!",
    confrontDuel: "DUELLO",

    // Buttons
    btnConfirmTitle: "CONFERMA E POSIZIONATI",
    btnConfirmSub: "BLOCCA LA BOTOLA INIZIALE",
    btnKeepTitle: "MANTIENI LA TUA BOTOLA",
    btnKeepSub: "CONSERVA {prize} (100%)",
    btnChangeTitle: "CAMBIA BOTOLA",
    btnChangeConfirm: "CONFERMA SULLA BOTOLA {num}",
    btnChangeSub: "DIMEZZA A {prize}",
    boardHeader: "LE 10 RISPOSTE (CLICCA PER SALIRE SULLA BOTOLA)",
    boardHeaderConfront: "CLICCA SU UNA DELLE BOTOLE ARANCIONI PER CONFRONTARLA CON LA TUA BOTOLA {myId}!",

    // Tile status
    tileOriginal: "BOTOLA ORIGINARIA",
    tileChampion: "★ LA TUA BOTOLA ★",
    tileConfront: "⚡ CLICCA PER CONFRONTARE",
    tileChallenging: "⚔️ IN CONFRONTO...",
    tileWaiting: "IN ATTESA",
    tileEliminated: "✕ RISPOSTA ERRATA (APERTA) ✕",
    tileCorrectReveal: "✔ QUESTA ERA LA RISPOSTA ESATTA!",

    // Rules Modal
    rulesSub: "GUIDA UFFICIALE DELLO SHOW",
    rulesTitle: "IL REGOLAMENTO DELLE 10 BOTOLE",
    rule1Title: "Scelta Iniziale (90 Secondi):",
    rule1Desc: "Ascolti la domanda con 10 risposte sulle 10 botole. Sali sulla botola che ritieni esatta e confermi.",
    rule2Title: "Eliminazione delle Prime 5 Botole:",
    rule2Desc: "Il programma apre subito 5 botole con risposte sicuramente errate, facendole precipitare nel vuoto!",
    rule3Title: "I 30 Secondi & Il Dimezzamento:",
    rule3Desc: "Hai 30 secondi per riflettere. Puoi mantenere la tua scelta o spostarti su un'altra botola dimezzando il montepremi!",
    rule4Title: "Il Confronto Diretto:",
    rule4Desc: "Scegli tu quale delle altre botole rimaste vuoi confrontare una ad una con la tua! Se la botola che sfidi è sbagliata, cade lei nel vuoto. Ma se sfidi quella giusta... cade la tua ed è Caduta Libera!",
    btnCloseRules: "HO CAPITO, GIOCHIAMO!",

    // End Modal
    victoryTitle: "CAMPIONE ASSOLUTO!",
    victoryDesc: "INCREDIBILE! Hai eliminato tutte le botole errate nel confronto diretto!<br>La botola numero <strong>{myId}</strong> era l'UNICA risposta esatta ed è rimasta chiusa sotto i tuoi piedi!<br>MONTEPREMI FINALE VINTO:<br><span class=\"jackpot-amount\">{prize}</span>",
    defeatTitle: "CADUTA LIBERA!",
    defeatDesc: "La botola sotto i tuoi piedi si è spalancata e sei precipitato nel vuoto!<br>Il montepremi di <strong>{prize}</strong> è andato perduto!",
    btnPlayAgain: "GIOCA UN'ALTRA FINALE",

    // Announcer lines
    spkIntro: "Siamo al gioco finale: Le Dieci Botole! In palio ci sono {prize}! Categoria {cat}. {q}",
    spkPhase1: "Hai novanta secondi di tempo: posizionati sulla botola che ritieni esatta e premi conferma!",
    spkLocked: "Scelta confermata sulla botola numero {id}: {text}!",
    spkPhase2: "Attenzione! Ora il programma elimina cinque risposte sicuramente sbagliate!",
    spkDropBotola: "Eliminiamo la botola numero {id}...",
    spkPhase3: "Cinque botole sono state aperte! Ora hai trenta secondi per riflettere: vuoi mantenere la tua botola o cambiare scelta dimezzando il montepremi?",
    spkKeepConfirm: "Confermi la tua botola numero {id}! Il montepremi resta intero a {prize}!",
    spkChangeConfirm: "Hai deciso di cambiare! Ti sposti sulla botola numero {id}! Il montepremi si dimezza a {prize}!",
    spkPhase4: "Scegli quale botola vuoi confrontare con la tua botola numero {id}!",
    spkConfronting: "Hai scelto di confrontare la botola numero {id}: {text}! Se questa botola è sbagliata... si apre!",
    spkConfrontSafe: "Risposta errata! La botola numero {id} cade nel vuoto! Sei salvo!",
    spkConfrontWrongChampion: "ATTENZIONE! La botola numero {id} ERA LA RISPOSTA ESATTA! Quindi la tua è sbagliata... CADUTA LIBERA!",
    spkVictory: "CAMPIONEEEE! Tutte le altre botole sono cadute! Hai vinto {prize}!"
  },

  en: {
    langCode: "en-US",
    logoTop: "STILL",
    logoBot: "STANDING",
    modeTag: "THE GRAND FINALE: 10 TRAPDOORS",
    jackpotLabel: "GRAND JACKPOT",
    btnRules: "📖 Rules",
    btnAudioOn: "🔊 Sound On",
    btnAudioOff: "🔇 Sound Off",
    btnVoiceOn: "🎙️ Host On",
    btnVoiceOff: "🎙️ Host Off",
    btnCamera: "🎥 Camera",

    bannerIntro: "LISTEN TO THE QUESTION AND PICK 1 ANSWER OUT OF 10 TRAPDOORS",
    bannerPhase1: "PHASE 1: YOU HAVE 90 SECONDS TO STEP ON YOUR CHOSEN TRAPDOOR!",
    bannerChosen: "YOU ARE ON TRAPDOOR {num}: \"{text}\". PRESS CONFIRM TO LOCK IN!",
    bannerPhase2: "PHASE 2: THE SYSTEM AUTOMATICALLY ELIMINATES 5 WRONG TRAPDOORS...",
    bannerPhase3: "PHASE 3 (30s): KEEP YOUR TRAPDOOR OR SWITCH AND CUT JACKPOT IN HALF!",
    bannerPhase3Confirmed: "CHOICE LOCKED! PREPARE FOR HEAD-TO-HEAD DUEL...",
    bannerPhase4: "PHASE 4: YOU'RE ON TRAPDOOR {myId}. CLICK ONE OF THE REMAINING {rem} TRAPDOORS TO CONFRONT!",
    bannerConfronting: "CONFRONTATION: TRAPDOOR {targetId} (\"{text}\") vs YOUR TRAPDOOR {myId}!",
    bannerConfrontSafe: "NICE! TRAPDOOR {targetId} WAS WRONG AND FELL! {rem} TRAPDOORS REMAIN!",
    confrontDuel: "DUEL",

    btnConfirmTitle: "CONFIRM & STEP IN",
    btnConfirmSub: "LOCK YOUR INITIAL TRAPDOOR",
    btnKeepTitle: "KEEP YOUR TRAPDOOR",
    btnKeepSub: "KEEP 100% JACKPOT ({prize})",
    btnChangeTitle: "SWITCH TRAPDOOR",
    btnChangeConfirm: "CONFIRM TRAPDOOR {num}",
    btnChangeSub: "CUT IN HALF TO {prize}",
    boardHeader: "THE 10 ANSWERS (CLICK TO STEP ONTO THE TRAPDOOR)",
    boardHeaderConfront: "CLICK AN ORANGE TRAPDOOR TO CONFRONT IT AGAINST YOUR TRAPDOOR {myId}!",

    tileOriginal: "ORIGINAL TRAPDOOR",
    tileChampion: "★ YOUR TRAPDOOR ★",
    tileConfront: "⚡ CLICK TO CONFRONT",
    tileChallenging: "⚔️ IN DUEL...",
    tileWaiting: "WAITING",
    tileEliminated: "✕ WRONG ANSWER (OPENED) ✕",
    tileCorrectReveal: "✔ THIS WAS THE CORRECT ANSWER!",

    rulesSub: "OFFICIAL SHOW GUIDE",
    rulesTitle: "THE 10 TRAPDOORS RULES",
    rule1Title: "Initial Choice (90s):",
    rule1Desc: "Listen to the grand question. Step on the trapdoor you think is correct and confirm.",
    rule2Title: "Automatic 5 Trapdoor Drop:",
    rule2Desc: "The system drops 5 definitely wrong trapdoors straight into the abyss!",
    rule3Title: "The 30s Decision & Prize Cut:",
    rule3Desc: "You have 30s to reflect. Keep your trapdoor (100% jackpot) or switch to another trapdoor cutting the jackpot in half!",
    rule4Title: "Head-to-Head Confrontation:",
    rule4Desc: "Pick remaining trapdoors one by one to confront! If it's wrong, it drops! If it's the correct answer, your own trapdoor opens and you fall!",
    btnCloseRules: "GOT IT, LET'S PLAY!",

    victoryTitle: "GRAND CHAMPION!",
    victoryDesc: "INCREDIBLE! You eliminated every wrong trapdoor in head-to-head confrontation!<br>Trapdoor <strong>{myId}</strong> was the ONLY correct answer and stayed solid beneath your feet!<br>FINAL JACKPOT WON:<br><span class=\"jackpot-amount\">{prize}</span>",
    defeatTitle: "STILL STANDING NO MORE!",
    defeatDesc: "The trapdoor opened beneath your feet and you plunged into the abyss!<br>The grand jackpot of <strong>{prize}</strong> was lost!",
    btnPlayAgain: "PLAY ANOTHER FINALE",

    spkIntro: "Welcome to the grand finale: The Ten Trapdoors! Playing for {prize}! Category: {cat}. {q}",
    spkPhase1: "You have ninety seconds: step onto the trapdoor you believe is correct and confirm!",
    spkLocked: "Choice confirmed on trapdoor number {id}: {text}!",
    spkPhase2: "Attention! The system will now eliminate five definitely wrong answers!",
    spkDropBotola: "Opening trapdoor number {id}...",
    spkPhase3: "Five trapdoors have dropped! You have thirty seconds: keep your trapdoor or switch and cut your jackpot in half?",
    spkKeepConfirm: "You confirmed trapdoor {id}! Your jackpot stays full at {prize}!",
    spkChangeConfirm: "You switched to trapdoor {id}! Your jackpot is cut in half to {prize}!",
    spkPhase4: "Now choose which trapdoor you want to confront against your trapdoor {id}!",
    spkConfronting: "You chose to confront trapdoor {id}: {text}! If it's wrong... it opens!",
    spkConfrontSafe: "Wrong answer! Trapdoor {id} plummets into the abyss! You are safe!",
    spkConfrontWrongChampion: "WATCH OUT! Trapdoor {id} WAS THE CORRECT ANSWER! Which means yours was wrong... DOWN YOU GO!",
    spkVictory: "CHAMPION! All other trapdoors have fallen! You won {prize}!"
  },

  es: {
    langCode: "es-ES",
    logoTop: "¡AHORA",
    logoBot: "CAIGO!",
    modeTag: "LA GRAN FINAL: 10 TRAMPILLAS",
    jackpotLabel: "BOTE ACUMULADO",
    btnRules: "📖 Reglas",
    btnAudioOn: "🔊 Sonido On",
    btnAudioOff: "🔇 Sonido Off",
    btnVoiceOn: "🎙️ Voz On",
    btnVoiceOff: "🎙️ Voz Off",
    btnCamera: "🎥 Cámara",

    bannerIntro: "ESCUCHA LA PREGUNTA Y ELIGE 1 RESPUESTA ENTRE LAS 10 TRAMPILLAS",
    bannerPhase1: "FASE 1: ¡TIENES 90 SEGUNDOS PARA SUBIRTE A TU TRAMPILLA!",
    bannerChosen: "ESTÁS EN LA TRAMPILLA {num}: \"{text}\". ¡PULSA CONFIRMAR!",
    bannerPhase2: "FASE 2: EL PROGRAMA ELIMINA 5 RESPUESTAS ERRÓNEAS...",
    bannerPhase3: "FASE 3 (30s): ¡MANTÉN TU TRAMPILLA O CÁMBIATE DIVIDIENDO EL BOTE!",
    bannerPhase3Confirmed: "¡ELECCIÓN BLOQUEADA! PREPÁRATE PARA EL DUELO DIRECTO...",
    bannerPhase4: "FASE 4: ESTÁS EN LA TRAMPILLA {myId}. ¡ELIGE CUÁL DE LAS OTRAS {rem} CONFRONTAR!",
    bannerConfronting: "CONFRONTANDO: TRAMPILLA {targetId} (\"{text}\") vs TU TRAMPILLA {myId}!",
    bannerConfrontSafe: "¡BIEN! ¡LA TRAMPILLA {targetId} ERA ERRÓNEA Y SE ABRIÓ! QUEDAN {rem}!",
    confrontDuel: "DUELO",

    btnConfirmTitle: "CONFIRMAR Y POSICIONARSE",
    btnConfirmSub: "BLOQUEA TU TRAMPILLA INICIAL",
    btnKeepTitle: "MANTÉN TU TRAMPILLA",
    btnKeepSub: "CONSERVA EL 100% ({prize})",
    btnChangeTitle: "CAMBIAR TRAMPILLA",
    btnChangeConfirm: "CONFIRMAR EN TRAMPILLA {num}",
    btnChangeSub: "DIVIDE EL BOTE A {prize}",
    boardHeader: "LAS 10 RESPUESTAS (CLIC PARA SUBIRTE A LA TRAMPILLA)",
    boardHeaderConfront: "¡CLIC EN UNA TRAMPILLA NARANJA PARA CONFRONTARLA CON LA TUYA {myId}!",

    tileOriginal: "TRAMPILLA ORIGINAL",
    tileChampion: "★ TU TRAMPILLA ★",
    tileConfront: "⚡ CLIC PARA CONFRONTAR",
    tileChallenging: "⚔️ EN DUELO...",
    tileWaiting: "EN ESPERA",
    tileEliminated: "✕ RESPUESTA ERRÓNEA (ABIERTA) ✕",
    tileCorrectReveal: "✔ ¡ESTA ERA LA RESPUESTA CORRECTA!",

    rulesSub: "GUÍA OFICIAL DEL PROGRAMA",
    rulesTitle: "REGLAMENTO DE LAS 10 TRAMPILLAS",
    rule1Title: "Elección Inicial (90 Segundos):",
    rule1Desc: "Escucha la pregunta final. Súbete a la trampilla que consideres correcta y confirma.",
    rule2Title: "Eliminación de las 5 Primeras:",
    rule2Desc: "El programa abre inmediatamente 5 trampillas con respuestas erróneas al vacío.",
    rule3Title: "Los 30 Segundos y el Bote a la Mitad:",
    rule3Desc: "Tienes 30s para reflexionar. Mantén tu trampilla (100% bote) o cámbiate a otra dividiendo el bote a la mitad.",
    rule4Title: "El Duelo de Confrontación:",
    rule4Desc: "Confronta las trampillas restantes una a una. Si la que retas es errónea, ¡cae al vacío! Si retas a la correcta, ¡se abre la tuya y caes tú!",
    btnCloseRules: "¡ENTENDIDO, A JUGAR!",

    victoryTitle: "¡GRAN CAMPEÓN!",
    victoryDesc: "¡INCREÍBLE! ¡Has eliminado todas las trampillas erróneas en el duelo directo!<br>La trampilla número <strong>{myId}</strong> era la ÚNICA correcta y se mantuvo firme bajo tus pies.<br>BOTE FINAL GANADO:<br><span class=\"jackpot-amount\">{prize}</span>",
    defeatTitle: "¡A LA TRAMPILLA!",
    defeatDesc: "¡La trampilla bajo tus pies se ha abierto de golpe y has caído al vacío!<br>El bote de <strong>{prize}</strong> se ha perdido.",
    btnPlayAgain: "JUGAR OTRA FINAL",

    spkIntro: "¡Estamos en la gran final de Las Diez Trampillas! ¡Jugamos por {prize}! Categoría: {cat}. {q}",
    spkPhase1: "Tienes noventa segundos: ¡posiciónate sobre la trampilla correcta y confirma!",
    spkLocked: "¡Elección confirmada en la trampilla número {id}: {text}!",
    spkPhase2: "¡Atención! ¡El programa elimina ahora cinco respuestas erróneas!",
    spkDropBotola: "Abriendo la trampilla número {id}...",
    spkPhase3: "¡Cinco trampillas han caído! Tienes treinta segundos: ¿mantienes tu trampilla o cambias dividiendo el premio?",
    spkKeepConfirm: "¡Confirmas tu trampilla {id}! ¡El bote se mantiene íntegro en {prize}!",
    spkChangeConfirm: "¡Decidiste cambiarte a la trampilla {id}! ¡El bote se divide a la mitad: {prize}!",
    spkPhase4: "¡Ahora elige qué trampilla quieres confrontar contra tu trampilla {id}!",
    spkConfronting: "¡Has elegido confrontar la trampilla {id}: {text}! Si es errónea... ¡se abre!",
    spkConfrontSafe: "¡Respuesta errónea! ¡La trampilla {id} cae al vacío! ¡Sigues a salvo!",
    spkConfrontWrongChampion: "¡CUIDADO! ¡La trampilla {id} ERA LA CORRECTA! Así que la tuya está mal... ¡AL VACÍO!",
    spkVictory: "¡CAMPEÓN ABSOLUTO! ¡Todas las demás trampillas han caído! ¡Has ganado {prize}!"
  },

  fr: {
    langCode: "fr-FR",
    logoTop: "LE GRAND",
    logoBot: "PIÈGE",
    modeTag: "LA FINALE : LES 10 TRAPPES",
    jackpotLabel: "CAGNOTTE EN JEU",
    btnRules: "📖 Règles",
    btnAudioOn: "🔊 Son On",
    btnAudioOff: "🔇 Son Off",
    btnVoiceOn: "🎙️ Voix On",
    btnVoiceOff: "🎙️ Voix Off",
    btnCamera: "🎥 Caméra",

    bannerIntro: "ÉCOUTEZ LA QUESTION ET CHOISISSEZ 1 RÉPONSE PARMI LES 10 TRAPPES",
    bannerPhase1: "PHASE 1 : VOUS AVEZ 90 SECONDES POUR MONTER SUR VOTRE TRAPPE !",
    bannerChosen: "VOUS ÊTES SUR LA TRAPPE {num}: \"{text}\". CONFIRMEZ POUR VERROUILLER !",
    bannerPhase2: "PHASE 2 : LE SYSTÈME ÉLIMINE 5 MAUVAISES RÉPONSES...",
    bannerPhase3: "PHASE 3 (30s) : GARDEZ VOTRE TRAPPE OU CHANGEZ EN DIVISANT LA CAGNOTTE !",
    bannerPhase3Confirmed: "CHOIX VERROUILLÉ ! PRÉPAREZ-VOUS POUR LE DUEL DIRECT...",
    bannerPhase4: "PHASE 4 : SUR LA TRAPPE {myId}. CLIQUEZ SUR UNE DES {rem} AUTRES TRAPPES !",
    bannerConfronting: "CONFRONTATION : TRAPPE {targetId} (\"{text}\") vs VOTRE TRAPPE {myId} !",
    bannerConfrontSafe: "BRAVO ! LA TRAPPE {targetId} S'OUVRE DANS LE VIDE ! IL EN RESTE {rem} !",
    confrontDuel: "DUEL",

    btnConfirmTitle: "CONFIRMER & ENTRER",
    btnConfirmSub: "VERROUILLER LA TRAPPE INITIALE",
    btnKeepTitle: "GARDER VOTRE TRAPPE",
    btnKeepSub: "CONSERVER 100% ({prize})",
    btnChangeTitle: "CHANGER DE TRAPPE",
    btnChangeConfirm: "CONFIRMER LA TRAPPE {num}",
    btnChangeSub: "DIVISER LA CAGNOTTE À {prize}",
    boardHeader: "LES 10 RÉPONSES (CLIQUEZ POUR MONTER SUR LA TRAPPE)",
    boardHeaderConfront: "CLIQUEZ SUR UNE TRAPPE ORANGE POUR LA CONFRONTER À VOTRE TRAPPE {myId} !",

    tileOriginal: "TRAPPE ORIGINALE",
    tileChampion: "★ VOTRE TRAPPE ★",
    tileConfront: "⚡ CLIQUER POUR CONFRONTER",
    tileChallenging: "⚔️ EN DUEL...",
    tileWaiting: "EN ATTENTE",
    tileEliminated: "✕ MAUVAISE RÉPONSE (OUVERTE) ✕",
    tileCorrectReveal: "✔ C'ÉTAIT LA BONNE RÉPONSE !",

    rulesSub: "GUIDE OFFICIEL DU JEU",
    rulesTitle: "RÈGLES DES 10 TRAPPES",
    rule1Title: "Choix Initial (90s) :",
    rule1Desc: "Écoutez la grande question. Placez-vous sur la trappe que vous pensez exacte et validez.",
    rule2Title: "Élimination des 5 Premières Trappes :",
    rule2Desc: "Le système ouvre immédiatement 5 trappes manifestement fausses dans le vide.",
    rule3Title: "Les 30s & La Cagnotte Divisée :",
    rule3Desc: "30s pour réfléchir. Gardez votre trappe (100%) ou changez en divisant la cagnotte par deux !",
    rule4Title: "La Confrontation Directe :",
    rule4Desc: "Confrontez les trappes restantes une par une. Si elle est fausse, elle tombe ! Si vous défiez la bonne, c'est votre propre trappe qui s'ouvre !",
    btnCloseRules: "COMPRIS, JOUONS !",

    victoryTitle: "GRAND CHAMPION !",
    victoryDesc: "EXTRAORDINAIRE ! Vous avez éliminé toutes les mauvaises trappes !<br>La trappe <strong>{myId}</strong> était la SEULE bonne réponse et est restée solide !<br>CAGNOTTE GAGNÉE :<br><span class=\"jackpot-amount\">{prize}</span>",
    defeatTitle: "CHUTE LIBRE !",
    defeatDesc: "La trappe sous vos pieds s'est ouverte et vous avez plongé dans le vide !<br>La cagnotte de <strong>{prize}</strong> est perdue !",
    btnPlayAgain: "REJOUER UNE FINALE",

    spkIntro: "Bienvenue dans la finale : Les Dix Trappes ! Nous jouons pour {prize} ! Catégorie : {cat}. {q}",
    spkPhase1: "Vous avez quatre-vingt-dix secondes : placez-vous sur la trappe exacte et confirmez !",
    spkLocked: "Choix confirmé sur la trappe numéro {id} : {text} !",
    spkPhase2: "Attention ! Le système élimine maintenant cinq mauvaises réponses !",
    spkDropBotola: "Ouverture de la trappe numéro {id}...",
    spkPhase3: "Cinq trappes sont tombées ! Trente secondes : gardez-vous votre trappe ou changez-vous en divisant le montant ?",
    spkKeepConfirm: "Vous gardez votre trappe {id} ! La cagnotte reste entière à {prize} !",
    spkChangeConfirm: "Vous avez changé pour la trappe {id} ! La cagnotte est divisée à {prize} !",
    spkPhase4: "Choisissez quelle trappe vous souhaitez confronter à votre trappe {id} !",
    spkConfronting: "Vous confrontez la trappe {id} : {text} ! Si elle est fausse... elle s'ouvre !",
    spkConfrontSafe: "Mauvaise réponse ! La trappe {id} s'ouvre dans le vide ! Vous êtes sauvé !",
    spkConfrontWrongChampion: "ATTENTION ! La trappe {id} ÉTAIT LA BONNE RÉPONSE ! Votre trappe était donc fausse... CHUTE LIBRE !",
    spkVictory: "CHAMPION ! Toutes les autres trappes sont tombées ! Vous remportez {prize} !"
  },

  de: {
    langCode: "de-DE",
    logoTop: "ABGE-",
    logoBot: "TAUCHT",
    modeTag: "DAS FINALE: DIE 10 FALLTÜREN",
    jackpotLabel: "JACKPOT",
    btnRules: "📖 Regeln",
    btnAudioOn: "🔊 Ton An",
    btnAudioOff: "🔇 Ton Aus",
    btnVoiceOn: "🎙️ Stimme An",
    btnVoiceOff: "🎙️ Stimme Aus",
    btnCamera: "🎥 Kamera",

    bannerIntro: "HÖRE DIE FRAGE UND WÄHLE 1 ANTWORT UNTER DEN 10 FALLTÜREN",
    bannerPhase1: "PHASE 1: DU HAST 90 SEKUNDEN, UM AUF DEINE FALLTÜR ZU TRETEN!",
    bannerChosen: "DU STEHST AUF FALLTÜR {num}: \"{text}\". BESTÄTIGEN ZUM FESTLEGEN!",
    bannerPhase2: "PHASE 2: DAS SYSTEM ÖFFNET 5 FALSCHE FALLTÜREN...",
    bannerPhase3: "PHASE 3 (30s): BEHALTE DEINE TÜR ODER WECHSLE BEI HALBIERTEM GEWINN!",
    bannerPhase3Confirmed: "WAHL FESTGELEGT! MACH DICH BEREIT FÜRS DUELL...",
    bannerPhase4: "PHASE 4: DU BIST AUF TÜR {myId}. WÄHLE EINE DER {rem} ANDEREN ZUM DUELL!",
    bannerConfronting: "DUELL: FALLTÜR {targetId} (\"{text}\") vs DEINE FALLTÜR {myId}!",
    bannerConfrontSafe: "SUPER! FALLTÜR {targetId} WAR FALSCH UND FIEL! NOCH {rem} TÜREN!",
    confrontDuel: "DUELL",

    btnConfirmTitle: "BESTÄTIGEN & AUFSTELLEN",
    btnConfirmSub: "ERSTE WAHL FESTLEGEN",
    btnKeepTitle: "DEINE TÜR BEHALTEN",
    btnKeepSub: "100% BEHALTEN ({prize})",
    btnChangeTitle: "FALLTÜR WECHSELN",
    btnChangeConfirm: "AUF TÜR {num} WECHSELN",
    btnChangeSub: "HALBIEREN AUF {prize}",
    boardHeader: "DIE 10 ANTWORTEN (KLICKEN ZUM BETRETEN DER FALLTÜR)",
    boardHeaderConfront: "KLICKE AUF EINE ORANGENE TÜR, UM SIE GEGEN DEINE TÜR {myId} ZU TESTEN!",

    tileOriginal: "URSPRÜNGLICHE TÜR",
    tileChampion: "★ DEINE FALLTÜR ★",
    tileConfront: "⚡ ZUM TESTEN KLICKEN",
    tileChallenging: "⚔️ IM DUELL...",
    tileWaiting: "WARTEND",
    tileEliminated: "✕ FALSCHE ANTWORT (GEÖFFNET) ✕",
    tileCorrectReveal: "✔ DAS WAR DIE RICHTIGE ANTWORT!",

    rulesSub: "OFFIZIELLER SHOW-LEITFADEN",
    rulesTitle: "DIE REGELN DER 10 FALLTÜREN",
    rule1Title: "Erste Wahl (90s):",
    rule1Desc: "Höre die Finalfrage. Tritt auf die Falltür, die du für richtig hältst, und bestätige.",
    rule2Title: "Automatische 5er-Eliminierung:",
    rule2Desc: "Das System öffnet sofort 5 definitiv falsche Falltüren in den Abgrund.",
    rule3Title: "30 Sekunden & Gewinn-Halbierung:",
    rule3Desc: "Du hast 30 Sekunden Bedenkzeit. Behalte deine Tür (100% Gewinn) oder wechsle bei halbiertem Jackpot!",
    rule4Title: "Das direkte Duell:",
    rule4Desc: "Wähle die restlichen Türen nacheinander aus. Ist die gewählte Tür falsch, fällt sie! Testest du die richtige Tür, öffnet sich deine eigene!",
    btnCloseRules: "VERSTANDEN, SPIELEN!",

    victoryTitle: "GRANDIOSER SIEGER!",
    victoryDesc: "UNGLAUBLICH! Du hast alle falschen Falltüren im Duell besiegt!<br>Falltür <strong>{myId}</strong> war die EINZIG richtige Antwort und hielt stand!<br>GEWONNENER JACKPOT:<br><span class=\"jackpot-amount\">{prize}</span>",
    defeatTitle: "ABSTURZ!",
    defeatDesc: "Die Falltür unter deinen Füßen hat sich geöffnet und du bist gestürzt!<br>Der Jackpot von <strong>{prize}</strong> ist verloren!",
    btnPlayAgain: "NEUES FINALE SPIELEN",

    spkIntro: "Willkommen im großen Finale: Die Zehn Falltüren! Wir spielen um {prize}! Kategorie: {cat}. {q}",
    spkPhase1: "Du hast neunzig Sekunden: Stell dich auf die richtige Falltür und bestätige!",
    spkLocked: "Wahl bestätigt auf Falltür {id}: {text}!",
    spkPhase2: "Achtung! Das System öffnet nun fünf falsche Falltüren!",
    spkDropBotola: "Öffne Falltür Nummer {id}...",
    spkPhase3: "Fünf Türen sind gefallen! 30 Sekunden: Behältst du deine Tür oder halbierst du den Jackpot?",
    spkKeepConfirm: "Du bleibst auf Tür {id}! Dein Jackpot bleibt bei {prize}!",
    spkChangeConfirm: "Du wechselst auf Falltür {id}! Der Jackpot halbiert sich auf {prize}!",
    spkPhase4: "Wähle nun, welche Falltür du gegen deine Tür {id} antreten lassen willst!",
    spkConfronting: "Du testest Falltür {id}: {text}! Ist sie falsch... öffnet sie sich!",
    spkConfrontSafe: "Falsche Antwort! Falltür {id} stürzt in die Tiefe! Du bist sicher!",
    spkConfrontWrongChampion: "ACHTUNG! Falltür {id} WAR DIE RICHTIGE ANTWORT! Deine Tür war falsch... ABSTURZ!",
    spkVictory: "CHAMPION! Alle anderen Falltüren sind gefallen! Du hast {prize} gewonnen!"
  }
};

class I18nManager {
  constructor() {
    this.currentLang = 'it';
    // Auto-detect browser language if available
    const browserLang = navigator.language ? navigator.language.slice(0, 2).toLowerCase() : 'it';
    if (TRANSLATIONS[browserLang]) {
      this.currentLang = browserLang;
    }
    this.listeners = [];
  }

  setLanguage(lang) {
    if (TRANSLATIONS[lang]) {
      this.currentLang = lang;
      this.notify();
    }
  }

  getLanguage() {
    return this.currentLang;
  }

  t(key, params = {}) {
    let str = TRANSLATIONS[this.currentLang]?.[key] || TRANSLATIONS['it'][key] || key;
    for (const [k, v] of Object.entries(params)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    }
    return str;
  }

  onLanguageChange(callback) {
    this.listeners.push(callback);
  }

  notify() {
    this.listeners.forEach(cb => cb(this.currentLang));
  }
}

export const i18n = new I18nManager();
