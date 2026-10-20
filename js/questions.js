// Database Multilingue delle Domande per "LE DIECI BOTOLE" / "STILL STANDING"
// Domande localizzate e ricche per Italiano (IT), English (EN), Español (ES), Français (FR), Deutsch (DE)

export const QUESTIONS_BY_LANG = {
  it: [
    {
      id: 1,
      category: "LETTERATURA",
      prize: "€ 100.000",
      prizeValue: 100000,
      question: "Quale tra questi celebri capolavori della letteratura italiana è stato pubblicato per PRIMO?",
      options: [
        { id: 1, text: "I Promessi Sposi (Manzoni)", isCorrect: true, detail: "1827 (prima edizione 'ventisettana')" },
        { id: 2, text: "I Malavoglia (Verga)", isCorrect: false, detail: "Pubblicato nel 1881" },
        { id: 3, text: "Il fu Mattia Pascal (Pirandello)", isCorrect: false, detail: "Pubblicato nel 1904" },
        { id: 4, text: "La coscienza di Zeno (Svevo)", isCorrect: false, detail: "Pubblicato nel 1923" },
        { id: 5, text: "Uno, nessuno e centomila (Pirandello)", isCorrect: false, detail: "Pubblicato nel 1926" },
        { id: 6, text: "Il Gattopardo (Tomasi di Lampedusa)", isCorrect: false, detail: "Pubblicato nel 1958" },
        { id: 7, text: "Se questo è un uomo (Levi)", isCorrect: false, detail: "Pubblicato nel 1947" },
        { id: 8, text: "Cuore (De Amicis)", isCorrect: false, detail: "Pubblicato nel 1886" },
        { id: 9, text: "Il piacere (D'Annunzio)", isCorrect: false, detail: "Pubblicato nel 1889" },
        { id: 10, text: "Mastro-don Gesualdo (Verga)", isCorrect: false, detail: "Pubblicato nel 1889" }
      ],
      hint: "Pensa ai padri del romanzo storico ottocentesco all'inizio del XIX secolo."
    },
    {
      id: 2,
      category: "CINEMA & OSCAR",
      prize: "€ 150.000",
      prizeValue: 150000,
      question: "Quale tra questi celebri film ha vinto il MAGGIOR NUMERO di Premi Oscar in assoluto?",
      options: [
        { id: 1, text: "Titanic (James Cameron)", isCorrect: true, detail: "Ha vinto ben 11 Premi Oscar (record storico)" },
        { id: 2, text: "La La Land (Chazelle)", isCorrect: false, detail: "Ha vinto 6 Premi Oscar" },
        { id: 3, text: "Il Gladiatore (Ridley Scott)", isCorrect: false, detail: "Ha vinto 5 Premi Oscar" },
        { id: 4, text: "Forrest Gump (Zemeckis)", isCorrect: false, detail: "Ha vinto 6 Premi Oscar" },
        { id: 5, text: "Il Padrino (Coppola)", isCorrect: false, detail: "Ha vinto 3 Premi Oscar" },
        { id: 6, text: "Schindler's List (Spielberg)", isCorrect: false, detail: "Ha vinto 7 Premi Oscar" },
        { id: 7, text: "Avatar (James Cameron)", isCorrect: false, detail: "Ha vinto 3 Premi Oscar" },
        { id: 8, text: "Braveheart (Mel Gibson)", isCorrect: false, detail: "Ha vinto 5 Premi Oscar" },
        { id: 9, text: "La vita è bella (Benigni)", isCorrect: false, detail: "Ha vinto 3 Premi Oscar" },
        { id: 10, text: "Oppenheimer (Nolan)", isCorrect: false, detail: "Ha vinto 7 Premi Oscar" }
      ],
      hint: "Condivide il record storico di 11 statuette con Ben-Hur e Il Signore degli Anelli."
    },
    {
      id: 3,
      category: "GEOGRAFIA",
      prize: "€ 120.000",
      prizeValue: 120000,
      question: "Quale tra queste capitali europee si trova più a NORD (latitudine più alta)?",
      options: [
        { id: 1, text: "Parigi (Francia)", isCorrect: false, detail: "Latitudine 48.8° N" },
        { id: 2, text: "Berlino (Germania)", isCorrect: false, detail: "Latitudine 52.5° N" },
        { id: 3, text: "Reykjavík (Islanda)", isCorrect: true, detail: "Latitudine 64.1° N (la più a nord del mondo)" },
        { id: 4, text: "Dublino (Irlanda)", isCorrect: false, detail: "Latitudine 53.3° N" },
        { id: 5, text: "Vienna (Austria)", isCorrect: false, detail: "Latitudine 48.2° N" },
        { id: 6, text: "Varsavia (Polonia)", isCorrect: false, detail: "Latitudine 52.2° N" },
        { id: 7, text: "Praga (Repubblica Ceca)", isCorrect: false, detail: "Latitudine 50.0° N" },
        { id: 8, text: "Berna (Svizzera)", isCorrect: false, detail: "Latitudine 46.9° N" },
        { id: 9, text: "Bruxelles (Belgio)", isCorrect: false, detail: "Latitudine 50.8° N" },
        { id: 10, text: "Amsterdam (Paesi Bassi)", isCorrect: false, detail: "Latitudine 52.3° N" }
      ],
      hint: "È situata su un'isola vulcanica a ridosso del circolo polare artico."
    },
    {
      id: 4,
      category: "STORIA",
      prize: "€ 200.000",
      prizeValue: 200000,
      question: "Quale tra questi storici eventi mondiali è avvenuto nel corso del XX SECOLO (tra il 1901 e il 2000)?",
      options: [
        { id: 1, text: "La presa della Bastiglia a Parigi", isCorrect: false, detail: "Avvenuta nel 1789 (XVIII secolo)" },
        { id: 2, text: "La scoperta dell'America di Colombo", isCorrect: false, detail: "Avvenuta nel 1492 (XV secolo)" },
        { id: 3, text: "Il primo allunaggio umano dell'Apollo 11", isCorrect: true, detail: "Avvenuto nel 1969 (XX secolo)" },
        { id: 4, text: "L'Unità d'Italia proclamata a Torino", isCorrect: false, detail: "Avvenuta nel 1861 (XIX secolo)" },
        { id: 5, text: "La battaglia di Waterloo di Napoleone", isCorrect: false, detail: "Avvenuta nel 1815 (XIX secolo)" },
        { id: 6, text: "La stesura della Costituzione degli USA", isCorrect: false, detail: "Avvenuta nel 1787 (XVIII secolo)" },
        { id: 7, text: "L'inizio della Rivoluzione Francese", isCorrect: false, detail: "Avvenuta nel 1789 (XVIII secolo)" },
        { id: 8, text: "La pubblicazione della Bibbia di Gutenberg", isCorrect: false, detail: "Avvenuta nel 1455 (XV secolo)" },
        { id: 9, text: "La spedizione dei Mille di Garibaldi", isCorrect: false, detail: "Avvenuta nel 1860 (XIX secolo)" },
        { id: 10, text: "La firma della Magna Charta inglese", isCorrect: false, detail: "Avvenuta nel 1215 (XIII secolo)" }
      ],
      hint: "Ha rappresentato 'un piccolo passo per un uomo, un grande balzo per l'umanità'."
    }
  ],

  en: [
    {
      id: 101,
      category: "LITERATURE",
      prize: "$ 100,000",
      prizeValue: 100000,
      question: "Which of these famous literary classics was published FIRST?",
      options: [
        { id: 1, text: "Pride and Prejudice (Jane Austen)", isCorrect: true, detail: "Published in 1813" },
        { id: 2, text: "Moby-Dick (Herman Melville)", isCorrect: false, detail: "Published in 1851" },
        { id: 3, text: "The Great Gatsby (F. Scott Fitzgerald)", isCorrect: false, detail: "Published in 1925" },
        { id: 4, text: "Jane Eyre (Charlotte Brontë)", isCorrect: false, detail: "Published in 1847" },
        { id: 5, text: "1984 (George Orwell)", isCorrect: false, detail: "Published in 1949" },
        { id: 6, text: "To Kill a Mockingbird (Harper Lee)", isCorrect: false, detail: "Published in 1960" },
        { id: 7, text: "Great Expectations (Charles Dickens)", isCorrect: false, detail: "Published in 1861" },
        { id: 8, text: "The Catcher in the Rye (J.D. Salinger)", isCorrect: false, detail: "Published in 1951" },
        { id: 9, text: "Dracula (Bram Stoker)", isCorrect: false, detail: "Published in 1897" },
        { id: 10, text: "Brave New World (Aldous Huxley)", isCorrect: false, detail: "Published in 1932" }
      ],
      hint: "Think of the Georgian and Regency era in early 19th-century England."
    },
    {
      id: 102,
      category: "CINEMA & MOVIES",
      prize: "$ 150,000",
      prizeValue: 150000,
      question: "Which of these movies won the MOST Academy Awards (Oscars) in history?",
      options: [
        { id: 1, text: "Titanic (James Cameron)", isCorrect: true, detail: "Won an all-time record of 11 Oscars" },
        { id: 2, text: "La La Land (Damien Chazelle)", isCorrect: false, detail: "Won 6 Oscars" },
        { id: 3, text: "Gladiator (Ridley Scott)", isCorrect: false, detail: "Won 5 Oscars" },
        { id: 4, text: "Forrest Gump (Robert Zemeckis)", isCorrect: false, detail: "Won 6 Oscars" },
        { id: 5, text: "The Godfather (Francis Ford Coppola)", isCorrect: false, detail: "Won 3 Oscars" },
        { id: 6, text: "Schindler's List (Steven Spielberg)", isCorrect: false, detail: "Won 7 Oscars" },
        { id: 7, text: "Avatar (James Cameron)", isCorrect: false, detail: "Won 3 Oscars" },
        { id: 8, text: "Braveheart (Mel Gibson)", isCorrect: false, detail: "Won 5 Oscars" },
        { id: 9, text: "Inception (Christopher Nolan)", isCorrect: false, detail: "Won 4 Oscars" },
        { id: 10, text: "Oppenheimer (Christopher Nolan)", isCorrect: false, detail: "Won 7 Oscars" }
      ],
      hint: "Tied at 11 Academy Awards along with Ben-Hur and Return of the King."
    },
    {
      id: 103,
      category: "GEOGRAPHY",
      prize: "$ 120,000",
      prizeValue: 120000,
      question: "Which of these world capital cities is located furthest NORTH (highest latitude)?",
      options: [
        { id: 1, text: "Paris (France)", isCorrect: false, detail: "Latitude 48.8° N" },
        { id: 2, text: "Berlin (Germany)", isCorrect: false, detail: "Latitude 52.5° N" },
        { id: 3, text: "Reykjavík (Iceland)", isCorrect: true, detail: "Latitude 64.1° N (World's northernmost capital)" },
        { id: 4, text: "Dublin (Ireland)", isCorrect: false, detail: "Latitude 53.3° N" },
        { id: 5, text: "Vienna (Austria)", isCorrect: false, detail: "Latitude 48.2° N" },
        { id: 6, text: "Warsaw (Poland)", isCorrect: false, detail: "Latitude 52.2° N" },
        { id: 7, text: "Prague (Czech Republic)", isCorrect: false, detail: "Latitude 50.0° N" },
        { id: 8, text: "Bern (Switzerland)", isCorrect: false, detail: "Latitude 46.9° N" },
        { id: 9, text: "Brussels (Belgium)", isCorrect: false, detail: "Latitude 50.8° N" },
        { id: 10, text: "Amsterdam (Netherlands)", isCorrect: false, detail: "Latitude 52.3° N" }
      ],
      hint: "Located on a volcanic island close to the Arctic Circle."
    },
    {
      id: 104,
      category: "SCIENCE & ELEMENTS",
      prize: "$ 200,000",
      prizeValue: 200000,
      question: "Which of these chemical elements has the LOWEST atomic number (Z) on the periodic table?",
      options: [
        { id: 1, text: "Hydrogen (H)", isCorrect: true, detail: "Atomic number Z = 1 (the first element)" },
        { id: 2, text: "Carbon (C)", isCorrect: false, detail: "Atomic number Z = 6" },
        { id: 3, text: "Oxygen (O)", isCorrect: false, detail: "Atomic number Z = 8" },
        { id: 4, text: "Gold (Au)", isCorrect: false, detail: "Atomic number Z = 79" },
        { id: 5, text: "Iron (Fe)", isCorrect: false, detail: "Atomic number Z = 26" },
        { id: 6, text: "Nitrogen (N)", isCorrect: false, detail: "Atomic number Z = 7" },
        { id: 7, text: "Calcium (Ca)", isCorrect: false, detail: "Atomic number Z = 20" },
        { id: 8, text: "Silver (Ag)", isCorrect: false, detail: "Atomic number Z = 47" },
        { id: 9, text: "Helium (He)", isCorrect: false, detail: "Atomic number Z = 2" },
        { id: 10, text: "Copper (Cu)", isCorrect: false, detail: "Atomic number Z = 29" }
      ],
      hint: "The most abundant cosmic gas, containing just a single proton."
    }
  ],

  es: [
    {
      id: 201,
      category: "LITERATURA",
      prize: "100.000 €",
      prizeValue: 100000,
      question: "¿Cuál de estas célebres obras maestras de la literatura fue publicada PRIMERO?",
      options: [
        { id: 1, text: "Don Quijote de la Mancha (Cervantes)", isCorrect: true, detail: "Publicado en 1605" },
        { id: 2, text: "Cien años de soledad (García Márquez)", isCorrect: false, detail: "Publicado en 1967" },
        { id: 3, text: "Rayuela (Julio Cortázar)", isCorrect: false, detail: "Publicado en 1963" },
        { id: 4, text: "La colmena (Camilo José Cela)", isCorrect: false, detail: "Publicado en 1951" },
        { id: 5, text: "La casa de Bernarda Alba (Lorca)", isCorrect: false, detail: "Escrita en 1936, publicada en 1945" },
        { id: 6, text: "Fortunata y Jacinta (Galdós)", isCorrect: false, detail: "Publicado en 1887" },
        { id: 7, text: "Niebla (Miguel de Unamuno)", isCorrect: false, detail: "Publicado en 1914" },
        { id: 8, text: "La sombra del viento (Zafón)", isCorrect: false, detail: "Publicado en 2001" },
        { id: 9, text: "Los santos inocentes (Delibes)", isCorrect: false, detail: "Publicado en 1981" },
        { id: 10, text: "Crónica de una muerte anunciada", isCorrect: false, detail: "Publicado en 1981" }
      ],
      hint: "La cumbre de la literatura en español en pleno Siglo de Oro."
    },
    {
      id: 202,
      category: "CINE & PREMIOS",
      prize: "150.000 €",
      prizeValue: 150000,
      question: "¿Cuál de estas famosas películas ganó el MAYOR NÚMERO de Premios Oscar?",
      options: [
        { id: 1, text: "Titanic (James Cameron)", isCorrect: true, detail: "Ganó 11 Premios Oscar (récord histórico)" },
        { id: 2, text: "La La Land (Damien Chazelle)", isCorrect: false, detail: "Ganó 6 Premios Oscar" },
        { id: 3, text: "Gladiator (Ridley Scott)", isCorrect: false, detail: "Ganó 5 Premios Oscar" },
        { id: 4, text: "Forrest Gump (Robert Zemeckis)", isCorrect: false, detail: "Ganó 6 Premios Oscar" },
        { id: 5, text: "El Padrino (Francis Ford Coppola)", isCorrect: false, detail: "Ganó 3 Premios Oscar" },
        { id: 6, text: "La lista de Schindler (Spielberg)", isCorrect: false, detail: "Ganó 7 Premios Oscar" },
        { id: 7, text: "Avatar (James Cameron)", isCorrect: false, detail: "Ganó 3 Premios Oscar" },
        { id: 8, text: "Braveheart (Mel Gibson)", isCorrect: false, detail: "Ganó 5 Premios Oscar" },
        { id: 9, text: "Todo sobre mi madre (Almodóvar)", isCorrect: false, detail: "Ganó 1 Premio Oscar" },
        { id: 10, text: "Oppenheimer (Christopher Nolan)", isCorrect: false, detail: "Ganó 7 Premios Oscar" }
      ],
      hint: "Comparte el récord histórico de 11 estatuillas con Ben-Hur y El Retorno del Rey."
    }
  ],

  fr: [
    {
      id: 301,
      category: "LITTÉRATURE",
      prize: "100 000 €",
      prizeValue: 100000,
      question: "Laquelle de ces célèbres œuvres littéraires françaises a été publiée EN PREMIER ?",
      options: [
        { id: 1, text: "Les Misérables (Victor Hugo)", isCorrect: true, detail: "Publié en 1862" },
        { id: 2, text: "Le Petit Prince (Saint-Exupéry)", isCorrect: false, detail: "Publié en 1943" },
        { id: 3, text: "L'Étranger (Albert Camus)", isCorrect: false, detail: "Publié en 1942" },
        { id: 4, text: "Du côté de chez Swann (Proust)", isCorrect: false, detail: "Publié en 1913" },
        { id: 5, text: "Voyage au bout de la nuit (Céline)", isCorrect: false, detail: "Publié en 1932" },
        { id: 6, text: "Germinal (Émile Zola)", isCorrect: false, detail: "Publié en 1885" },
        { id: 7, text: "Madame Bovary (Gustave Flaubert)", isCorrect: false, detail: "Publié en 1857 (hors choix)" },
        { id: 8, text: "Bel-Ami (Guy de Maupassant)", isCorrect: false, detail: "Publié en 1885" },
        { id: 9, text: "La Peste (Albert Camus)", isCorrect: false, detail: "Publié en 1947" },
        { id: 10, text: "La Nausée (Jean-Paul Sartre)", isCorrect: false, detail: "Publié en 1938" }
      ],
      hint: "Le chef-d'œuvre humaniste de Victor Hugo sur Jean Valjean et Cosette."
    }
  ],

  de: [
    {
      id: 401,
      category: "LITERATUR",
      prize: "100.000 €",
      prizeValue: 100000,
      question: "Welches dieser Meisterwerke der Literatur erschien ZUERST?",
      options: [
        { id: 1, text: "Faust: Eine Tragödie (Goethe)", isCorrect: true, detail: "Erschienen 1808 (Faust I)" },
        { id: 2, text: "Die Verwandlung (Franz Kafka)", isCorrect: false, detail: "Erschienen 1915" },
        { id: 3, text: "Der Steppenwolf (Hermann Hesse)", isCorrect: false, detail: "Erschienen 1927" },
        { id: 4, text: "Buddenbrooks (Thomas Mann)", isCorrect: false, detail: "Erschienen 1901" },
        { id: 5, text: "Im Westen nichts Neues (Remarque)", isCorrect: false, detail: "Erschienen 1929" },
        { id: 6, text: "Die Blechtrommel (Günter Grass)", isCorrect: false, detail: "Erschienen 1959" },
        { id: 7, text: "Effi Briest (Theodor Fontane)", isCorrect: false, detail: "Erschienen 1895" },
        { id: 8, text: "Der Zauberberg (Thomas Mann)", isCorrect: false, detail: "Erschienen 1924" },
        { id: 9, text: "Siddhartha (Hermann Hesse)", isCorrect: false, detail: "Erschienen 1922" },
        { id: 10, text: "Schachnovelle (Stefan Zweig)", isCorrect: false, detail: "Erschienen 1942" }
      ],
      hint: "Das weltberühmte Werk der Weimarer Klassik von Johann Wolfgang von Goethe."
    }
  ]
};

// Retrocompatibilità
export const BOTOLE_OPPONENTS = [];
export const QUESTIONS_DB = [];
export const FINALE_QUESTIONS = QUESTIONS_BY_LANG.it;
