# Last Tile: Trivia Temple

Avventura a quiz in 3D (Three.js): una spedizione scende in un tempio di 10 sale. In ogni sala un enigma con 10 risposte
incise su 10 lastre di pietra, e una sola regge. Guida virtuale **Kira** (Web Speech API), suoni sintetizzati con Web Audio,
5 lingue: italiano, inglese, spagnolo, francese, tedesco.

## Come si gioca

1. **Esplorazione** (da 45 a 25 secondi, più breve nelle sale profonde): sali sulla lastra che ritieni giusta e conferma.
   Le **torce** fanno crollare una lastra sbagliata: una all'inizio, una in più nelle sale 3, 6 e 9 (più una per sala con Pro
   o una con un video premio).
2. **Crollo**: la sala trema e le lastre cadono finché ne restano due, la tua e un'altra.
3. **Ultime due** (15 secondi): resti o salti sull'altra con la **corda** (una per spedizione).
4. **Esito**: se la lastra regge, il tesoro della sala va nel bottino; puoi **uscire** e tenerlo o **scendere** nella sala
   successiva. Se cadi perdi il tesoro della spedizione. Superando tutte le 10 sale il tesoro raddoppia.

## Enigmi

Gli enigmi vengono generati a ogni sala da `js/questions.js`, partendo da archivi di dati verificati
(elementi chimici, capitali e latitudini, superfici dei paesi, continenti, montagne, eventi storici, libri, premi Oscar, animali).
Si estraggono 10 voci a caso e l'ordine delle lastre viene mescolato. Nelle domande a classifica la risposta esatta deve staccare
la seconda di un margine minimo, così i dati controversi non creano due risposte giuste. Gli ultimi 80 enigmi non si ripetono.

## Avvio locale

```bash
npx vite --port 5193
```

Poi apri `http://localhost:5193`.
