# 🎪 Caduta Libera - Le Dieci Botole (Still Standing Finale)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![WebGL](https://img.shields.io/badge/WebGL-Three.js-orange.svg)](https://threejs.org/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-green.svg)](manifest.json)
[![Languages](https://img.shields.io/badge/i18n-IT%20%7C%20EN%20%7C%20ES%20%7C%20FR%20%7C%20DE-blueviolet.svg)](js/i18n.js)

Un'esperienza interattiva in 3D WebGL che ricrea fedelmente l'emozionante **gioco finale delle 10 botole** del celebre quiz televisivo **Caduta Libera** (*Still Standing*).

Il gioco riproduce alla perfezione la scenografia dello studio TV, il sistema di illuminazione dinamico, la colonna sonora e gli effetti audio autentici sintetizzati in Web Audio API, il conduttore vocale (Web Speech API) e le 4 fasi di gioco ufficiali del format.

---

## 📺 Le 4 Fasi del Gioco Ufficiale

1. **Fase 1: La Scelta Iniziale (90 Secondi)**
   - Il campione ascolta la domanda del finale con 10 possibili risposte distribuite sulle 10 botole numerate.
   - Ha 90 secondi per salire fisicamente sulla botola che ritiene corretta e confermare la scelta.

2. **Fase 2: L'Eliminazione Automatica delle 5 Botole**
   - Il sistema apre in sequenza scenografica 5 botole con risposte sicuramente errate, facendole precipitare nel vuoto tra fumo e luci stroboscopiche.

3. **Fase 3: I 30 Secondi di Riflessione & Il Dimezzamento**
   - Con solo 5 botole superstiti, il campione ha 30 secondi per decidere:
     - **Mantenere la botola scelta**: conserva il 100% del montepremi.
     - **Cambiare botola**: si sposta su una delle altre botole aperte, ma il montepremi viene **dimezzato**.

4. **Fase 4: Il Confronto Diretto Botola per Botola**
   - Il campione sceglie quale delle botole avversarie rimaste vuole confrontare con la propria.
   - Se la botola sfidata è **errata**, la botola si apre e precipita nel vuoto (il campione è salvo!).
   - Se la botola sfidata era la **risposta esatta**, si spalanca la botola sotto i piedi del campione: **CADUTA LIBERA!**
   - Se il campione elimina tutte le botole errate, la sua botola rimane intatta e si aggiudica l'intero montepremi!

---

## 🌍 Supporto Multilingua (i18n)

L'applicazione supporta 5 lingue complete con domande localizzate, grafica TV e voce del conduttore:
- 🇮🇹 **Italiano** (*Caduta Libera*)
- 🇬🇧 / 🇺🇸 **English** (*Still Standing*)
- 🇪🇸 **Español** (*¡Ahora Caigo!*)
- 🇫🇷 **Français** (*Le Grand Piège*)
- 🇩🇪 **Deutsch** (*Abgetaucht*)

---

## 🚀 Caratteristiche Tecniche

- **Motore 3D**: Three.js r128 (arena studio circolare, fari spot semoventi, fumo particellare, pedane apribili a battente, personaggio 3D semovente).
- **Audio Engine**: Sintetizzatore Web Audio personalizzato (battiti cardiaci a BPM dinamici, ticchettio del timer, sirena di caduta botola, accordi di tensione, applausi e trionfo).
- **Speech Announcer**: Annunciatore TV basato su Web Speech API con selezione automatica delle voci maschili televisive per ciascuna lingua.
- **Mobile Store Ready**: Configurato con `manifest.json`, icone scalate per PWA e predisposizione Capacitor (`capacitor.config.json`) per build su Android Studio e Xcode.

---

## 💻 Come Eseguire Localmente

Basta avviare un qualsiasi server HTTP statico nella cartella di progetto:

### Con Python:
```bash
python -m http.server 8080
```
Apri poi il browser all'indirizzo: `http://localhost:8080`

### Con Node.js (npx serve):
```bash
npx serve .
```

---

## 📱 Build Mobile (Android / iOS con Capacitor)

Il progetto include già `capacitor.config.json`:
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npx cap add android
npx cap add ios
npx cap copy
npx cap open android
```

---

## 📄 Licenza
Rilasciato sotto licenza MIT.
