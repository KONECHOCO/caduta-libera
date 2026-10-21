# Trap10 Quiz

Quiz 3D (Three.js) con 10 risposte su 10 botole e una sola giusta. Conduttore virtuale **Leo** (Web Speech API),
audio sintetizzato con Web Audio, 5 lingue: italiano, inglese, spagnolo, francese, tedesco.

Gioco originale: non è affiliato a nessun programma televisivo.

## Come si gioca

1. **Scelta (90 s)**: sali sulla botola che ritieni esatta e conferma.
2. **Eliminazione**: si aprono 5 botole con risposte sbagliate.
3. **Decisione (30 s)**: tieni la tua botola oppure cambiala, ma il montepremi si dimezza.
4. **Confronto**: scegli una alla volta le botole rimaste. Se quella sfidata è sbagliata cade lei; se era la giusta, si apre la tua.

## Domande

Le domande vengono generate a ogni manche da `js/questions.js`, partendo da archivi di dati verificati
(elementi chimici, capitali e latitudini, superfici dei paesi, continenti, montagne, eventi storici, libri, premi Oscar, animali).
Si estraggono 10 voci a caso e l'ordine delle botole viene mescolato. Nelle domande a classifica la risposta esatta deve staccare
la seconda di un margine minimo, così i dati controversi non creano due risposte giuste. Le ultime 80 domande non si ripetono.

## Avvio locale

```bash
python -m http.server 8080
```

Poi apri `http://localhost:8080`.
