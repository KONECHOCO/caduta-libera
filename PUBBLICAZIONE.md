# Trap10 Quiz — pubblicazione sugli store

- Bundle id / package: `com.ikonet.trap10`
- Versione: 1.0.0 (il numero di build lo imposta Codemagic)
- Categoria: Giochi › Quiz (secondaria: Giochi › Giochi da tavolo/famiglia), età 4+
- Monetizzazione: gratis con AdMob + **Trap10 Pro** non consumabile `trap10_pro`, 2,99 € (territorio base ITA)
- Lingue: it, en-US, fr-FR, es-ES, de-DE

## Già pronto nel repository

| Cosa | Dove |
|---|---|
| Web app (Vite) | `index.html`, `js/`, `style.css`, `public/` |
| Monetizzazione (UMP → ATT → AdMob, Pro, Jolly con video premio) | `js/monetization.js` |
| Progetti nativi | `ios/`, `android/` |
| CI | `codemagic.yaml` (iOS con profilo in `ios/profiles/trap10_appstore.mobileprovision`, Android con keystore `trap10_android`) |
| Schede store | `store-assets/listing.json` (verifica: `npm run check:listing`) |
| Descrizioni acquisto Pro | `store-assets/iap.json` |
| Screenshot | `store-assets/screenshots/<lingua>/` (iPhone 1320×2868, iPad 2064×2752, Android 1080×1920) |
| Grafiche Play | `store-assets/play/` |
| Sito (privacy, supporto, app-ads.txt) | `deploy/site/` |
| Controllo domande | `npm run check:questions` |

Rigenerare gli screenshot: `npx vite --port 5193` e poi
`node scripts/capture-store-screenshots.mjs <iphone|ipad|android> <it|en|fr|es|de>`.

## Da fare

1. **Sito**: pubblicare `deploy/site/` sul marketing URL (con `app-ads.txt` alla radice del dominio).
2. **App Store Connect → New App** (dal sito): iOS, nome `Trap10 Quiz: 10 Botole`, lingua principale Italiano,
   bundle id `com.ikonet.trap10`, SKU `trap10`, Full Access.
3. **AdMob**: app "Trap10 Quiz iOS" e "Trap10 Quiz Android" con 4 unità ciascuna (banner, interstitial, con premio, apertura app).
   Gli ID vanno in `.env.production` (`VITE_ADMOB_*`), l'App ID iOS in `ios/App/App/Info.plist` (`GADApplicationIdentifier`)
   e quello Android in `android/app/build.gradle` (`admobAppId`). Ora ci sono gli ID di test di Google.
   Messaggio GDPR: aggiungere le 2 app con l'URL della privacy.
4. Script `ikonet_asc.py`: `bundle-profile`, `codemagic-add`, `metadata`, `screenshots`, `price-free`, `iap`.
5. **App Privacy** (tutto "non collegato all'identità"): Device ID, Interazioni con il prodotto, Dati pubblicitari → Pubblicità di terze parti (tracciamento sì);
   Crash/Prestazioni/Altri diagnostici → Analisi; Cronologia acquisti → Funzionalità. Nessuna posizione.
6. Commit + push → build Codemagic → `attach-build` → primo IAP "Add for Review" → `submit --send`.
7. Android: keystore `trap10_android` caricato dall'utente su Codemagic → AAB → Play Console.

## Note per App Review

Il montepremi è virtuale. Il gioco è originale: nessun riferimento a programmi televisivi esistenti.
Il pulsante 👑 in alto apre la schermata Pro con "Ripristina acquisti".
