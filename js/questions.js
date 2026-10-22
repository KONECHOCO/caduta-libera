// Generatore degli enigmi di Last Tile
// Ogni domanda viene costruita al momento da archivi di dati verificati (IT, EN, ES, FR, DE):
// si estraggono 10 voci a caso, se ne ricava l'unica risposta esatta e l'ordine delle lastre è sempre mescolato.

export const LANGS = ['it', 'en', 'es', 'fr', 'de'];

// Testo localizzato: le lingue non indicate prendono il valore inglese (o italiano)
const L = (it, en = it, es = en, fr = en, de = en) => ({ it, en, es, fr, de });

const LOCALES = { it: 'it-IT', en: 'en-US', es: 'es-ES', fr: 'fr-FR', de: 'de-DE' };
const num = (v, lang, digits = 0) =>
  v.toLocaleString(LOCALES[lang], { maximumFractionDigits: digits, minimumFractionDigits: digits });

// =========================================================================
// ARCHIVI DATI
// =========================================================================

// Numero atomico (Z): valore esatto
const ELEMENTS = [
  [L('Idrogeno', 'Hydrogen', 'Hidrógeno', 'Hydrogène', 'Wasserstoff'), 'H', 1],
  [L('Elio', 'Helium', 'Helio', 'Hélium', 'Helium'), 'He', 2],
  [L('Litio', 'Lithium', 'Litio', 'Lithium', 'Lithium'), 'Li', 3],
  [L('Carbonio', 'Carbon', 'Carbono', 'Carbone', 'Kohlenstoff'), 'C', 6],
  [L('Azoto', 'Nitrogen', 'Nitrógeno', 'Azote', 'Stickstoff'), 'N', 7],
  [L('Ossigeno', 'Oxygen', 'Oxígeno', 'Oxygène', 'Sauerstoff'), 'O', 8],
  [L('Neon', 'Neon', 'Neón', 'Néon', 'Neon'), 'Ne', 10],
  [L('Sodio', 'Sodium', 'Sodio', 'Sodium', 'Natrium'), 'Na', 11],
  [L('Magnesio', 'Magnesium', 'Magnesio', 'Magnésium', 'Magnesium'), 'Mg', 12],
  [L('Alluminio', 'Aluminium', 'Aluminio', 'Aluminium', 'Aluminium'), 'Al', 13],
  [L('Silicio', 'Silicon', 'Silicio', 'Silicium', 'Silicium'), 'Si', 14],
  [L('Fosforo', 'Phosphorus', 'Fósforo', 'Phosphore', 'Phosphor'), 'P', 15],
  [L('Zolfo', 'Sulfur', 'Azufre', 'Soufre', 'Schwefel'), 'S', 16],
  [L('Cloro', 'Chlorine', 'Cloro', 'Chlore', 'Chlor'), 'Cl', 17],
  [L('Potassio', 'Potassium', 'Potasio', 'Potassium', 'Kalium'), 'K', 19],
  [L('Calcio', 'Calcium', 'Calcio', 'Calcium', 'Calcium'), 'Ca', 20],
  [L('Ferro', 'Iron', 'Hierro', 'Fer', 'Eisen'), 'Fe', 26],
  [L('Nichel', 'Nickel', 'Níquel', 'Nickel', 'Nickel'), 'Ni', 28],
  [L('Rame', 'Copper', 'Cobre', 'Cuivre', 'Kupfer'), 'Cu', 29],
  [L('Zinco', 'Zinc', 'Zinc', 'Zinc', 'Zink'), 'Zn', 30],
  [L('Argento', 'Silver', 'Plata', 'Argent', 'Silber'), 'Ag', 47],
  [L('Stagno', 'Tin', 'Estaño', 'Étain', 'Zinn'), 'Sn', 50],
  [L('Iodio', 'Iodine', 'Yodo', 'Iode', 'Iod'), 'I', 53],
  [L('Platino', 'Platinum', 'Platino', 'Platine', 'Platin'), 'Pt', 78],
  [L('Oro', 'Gold', 'Oro', 'Or', 'Gold'), 'Au', 79],
  [L('Mercurio', 'Mercury', 'Mercurio', 'Mercure', 'Quecksilber'), 'Hg', 80],
  [L('Piombo', 'Lead', 'Plomo', 'Plomb', 'Blei'), 'Pb', 82],
  [L('Uranio', 'Uranium', 'Uranio', 'Uranium', 'Uran'), 'U', 92]
].map(([name, sym, z]) => ({ key: sym, name: mapL(name, n => `${n} (${sym})`), value: z }));

// Capitali con latitudine in gradi (negativa = emisfero sud)
const CAPITALS_LAT = [
  [L('Reykjavík'), 64.15], [L('Helsinki'), 60.17], [L('Oslo'), 59.91],
  [L('Stoccolma', 'Stockholm', 'Estocolmo', 'Stockholm', 'Stockholm'), 59.33],
  [L('Tallinn'), 59.44], [L('Riga'), 56.95],
  [L('Mosca', 'Moscow', 'Moscú', 'Moscou', 'Moskau'), 55.76],
  [L('Copenaghen', 'Copenhagen', 'Copenhague', 'Copenhague', 'Kopenhagen'), 55.68],
  [L('Vilnius'), 54.69],
  [L('Dublino', 'Dublin', 'Dublín', 'Dublin', 'Dublin'), 53.35],
  [L('Berlino', 'Berlin', 'Berlín', 'Berlin', 'Berlin'), 52.52],
  [L('Amsterdam', 'Amsterdam', 'Ámsterdam', 'Amsterdam', 'Amsterdam'), 52.37],
  [L('Varsavia', 'Warsaw', 'Varsovia', 'Varsovie', 'Warschau'), 52.23],
  [L('Londra', 'London', 'Londres', 'Londres', 'London'), 51.51],
  [L('Bruxelles', 'Brussels', 'Bruselas', 'Bruxelles', 'Brüssel'), 50.85],
  [L('Kiev', 'Kyiv', 'Kiev', 'Kyiv', 'Kyjiw'), 50.45],
  [L('Praga', 'Prague', 'Praga', 'Prague', 'Prag'), 50.08],
  [L('Parigi', 'Paris', 'París', 'Paris', 'Paris'), 48.86],
  [L('Vienna', 'Vienna', 'Viena', 'Vienne', 'Wien'), 48.21],
  [L('Budapest'), 47.50],
  [L('Ottawa'), 45.42],
  [L('Roma', 'Rome', 'Roma', 'Rome', 'Rom'), 41.90],
  [L('Madrid'), 40.42],
  [L('Pechino', 'Beijing', 'Pekín', 'Pékin', 'Peking'), 39.90],
  [L('Ankara'), 39.93],
  [L('Washington'), 38.91],
  [L('Lisbona', 'Lisbon', 'Lisboa', 'Lisbonne', 'Lissabon'), 38.72],
  [L('Atene', 'Athens', 'Atenas', 'Athènes', 'Athen'), 37.98],
  [L('Seul', 'Seoul', 'Seúl', 'Séoul', 'Seoul'), 37.57],
  [L('Tokyo', 'Tokyo', 'Tokio', 'Tokyo', 'Tokio'), 35.68],
  [L('Il Cairo', 'Cairo', 'El Cairo', 'Le Caire', 'Kairo'), 30.04],
  [L('Nuova Delhi', 'New Delhi', 'Nueva Delhi', 'New Delhi', 'Neu-Delhi'), 28.61],
  [L('Città del Messico', 'Mexico City', 'Ciudad de México', 'Mexico', 'Mexiko-Stadt'), 19.43],
  [L('Dakar'), 14.69], [L('Bangkok'), 13.76],
  [L('Quito'), -0.18], [L('Nairobi'), -1.29], [L('Lima'), -12.05],
  [L('Brasilia', 'Brasília', 'Brasilia', 'Brasilia', 'Brasília'), -15.79],
  [L('Pretoria'), -25.75],
  [L('Santiago del Cile', 'Santiago', 'Santiago de Chile', 'Santiago du Chili', 'Santiago de Chile'), -33.45],
  [L('Buenos Aires'), -34.60], [L('Montevideo'), -34.90], [L('Canberra'), -35.28],
  [L('Wellington'), -41.29]
].map(([name, lat], i) => ({ key: `lat${i}`, name, value: lat }));

// Paesi: nome, superficie totale in km² (null = dato controverso, escluso dalle domande sulla superficie),
// continente (null = paese transcontinentale, escluso dalle domande sui continenti)
const COUNTRIES = [
  [L('Russia', 'Russia', 'Rusia', 'Russie', 'Russland'), 17098246, null],
  [L('Canada', 'Canada', 'Canadá', 'Canada', 'Kanada'), 9984670, 'NA'],
  [L('Stati Uniti', 'United States', 'Estados Unidos', 'États-Unis', 'Vereinigte Staaten'), 9833520, 'NA'],
  [L('Cina', 'China', 'China', 'Chine', 'China'), 9596961, 'AS'],
  [L('Brasile', 'Brazil', 'Brasil', 'Brésil', 'Brasilien'), 8515767, 'SA'],
  [L('Australia', 'Australia', 'Australia', 'Australie', 'Australien'), 7692024, 'OC'],
  [L('India', 'India', 'India', 'Inde', 'Indien'), 3287263, 'AS'],
  [L('Argentina', 'Argentina', 'Argentina', 'Argentine', 'Argentinien'), 2780400, 'SA'],
  [L('Algeria', 'Algeria', 'Argelia', 'Algérie', 'Algerien'), 2381741, 'AF'],
  [L('Rep. Dem. del Congo', 'DR Congo', 'R. D. del Congo', 'RD Congo', 'DR Kongo'), 2344858, 'AF'],
  [L('Arabia Saudita', 'Saudi Arabia', 'Arabia Saudí', 'Arabie saoudite', 'Saudi-Arabien'), 2149690, 'AS'],
  [L('Messico', 'Mexico', 'México', 'Mexique', 'Mexiko'), 1964375, 'NA'],
  [L('Mongolia', 'Mongolia', 'Mongolia', 'Mongolie', 'Mongolei'), 1564116, 'AS'],
  [L('Perù', 'Peru', 'Perú', 'Pérou', 'Peru'), 1285216, 'SA'],
  [L('Colombia', 'Colombia', 'Colombia', 'Colombie', 'Kolumbien'), 1141748, 'SA'],
  [L('Etiopia', 'Ethiopia', 'Etiopía', 'Éthiopie', 'Äthiopien'), 1104300, 'AF'],
  [L('Nigeria'), 923768, 'AF'],
  [L('Cile', 'Chile', 'Chile', 'Chili', 'Chile'), 756102, 'SA'],
  [L('Francia', 'France', 'Francia', 'France', 'Frankreich'), 643801, 'EU'],
  [L('Ucraina', 'Ukraine', 'Ucrania', 'Ukraine', 'Ukraine'), 603550, 'EU'],
  [L('Kenya', 'Kenya', 'Kenia', 'Kenya', 'Kenia'), 580367, 'AF'],
  [L('Thailandia', 'Thailand', 'Tailandia', 'Thaïlande', 'Thailand'), 513120, 'AS'],
  [L('Spagna', 'Spain', 'España', 'Espagne', 'Spanien'), 505990, 'EU'],
  [L('Papua Nuova Guinea', 'Papua New Guinea', 'Papúa Nueva Guinea', 'Papouasie-Nouvelle-Guinée', 'Papua-Neuguinea'), 462840, 'OC'],
  [L('Svezia', 'Sweden', 'Suecia', 'Suède', 'Schweden'), 450295, 'EU'],
  [L('Marocco', 'Morocco', 'Marruecos', 'Maroc', 'Marokko'), null, 'AF'],
  [L('Giappone', 'Japan', 'Japón', 'Japon', 'Japan'), 377975, 'AS'],
  [L('Germania', 'Germany', 'Alemania', 'Allemagne', 'Deutschland'), 357592, 'EU'],
  [L('Norvegia', 'Norway', 'Noruega', 'Norvège', 'Norwegen'), null, 'EU'],
  [L('Vietnam', 'Vietnam', 'Vietnam', 'Viêt Nam', 'Vietnam'), 331212, 'AS'],
  [L("Costa d'Avorio", 'Ivory Coast', 'Costa de Marfil', "Côte d'Ivoire", 'Elfenbeinküste'), 322463, 'AF'],
  [L('Italia', 'Italy', 'Italia', 'Italie', 'Italien'), 302073, 'EU'],
  [L('Nuova Zelanda', 'New Zealand', 'Nueva Zelanda', 'Nouvelle-Zélande', 'Neuseeland'), 268021, 'OC'],
  [L('Regno Unito', 'United Kingdom', 'Reino Unido', 'Royaume-Uni', 'Vereinigtes Königreich'), 242495, 'EU'],
  [L('Ghana'), 238533, 'AF'],
  [L('Senegal', 'Senegal', 'Senegal', 'Sénégal', 'Senegal'), 196722, 'AF'],
  [L('Uruguay'), 176215, 'SA'],
  [L('Nepal', 'Nepal', 'Nepal', 'Népal', 'Nepal'), 147516, 'AS'],
  [L('Grecia', 'Greece', 'Grecia', 'Grèce', 'Griechenland'), 131957, 'EU'],
  [L('Cuba'), 109884, 'NA'],
  [L('Islanda', 'Iceland', 'Islandia', 'Islande', 'Island'), 103000, 'EU'],
  [L('Corea del Sud', 'South Korea', 'Corea del Sur', 'Corée du Sud', 'Südkorea'), 100210, 'AS'],
  [L('Portogallo', 'Portugal', 'Portugal', 'Portugal', 'Portugal'), 92212, 'EU'],
  [L('Austria', 'Austria', 'Austria', 'Autriche', 'Österreich'), 83879, 'EU'],
  [L('Svizzera', 'Switzerland', 'Suiza', 'Suisse', 'Schweiz'), 41285, 'EU'],
  [L('Belgio', 'Belgium', 'Bélgica', 'Belgique', 'Belgien'), 30689, 'EU'],
  [L('Figi', 'Fiji', 'Fiyi', 'Fidji', 'Fidschi'), 18274, 'OC'],
  [L('Giamaica', 'Jamaica', 'Jamaica', 'Jamaïque', 'Jamaika'), 10991, 'NA'],
  [L('Samoa'), 2842, 'OC'],
  [L('Lussemburgo', 'Luxembourg', 'Luxemburgo', 'Luxembourg', 'Luxemburg'), 2586, 'EU'],
  [L('Andorra', 'Andorra', 'Andorra', 'Andorre', 'Andorra'), 468, 'EU'],
  [L('Malta', 'Malta', 'Malta', 'Malte', 'Malta'), 316, 'EU'],
  [L('Liechtenstein'), 160, 'EU'],
  [L('San Marino'), 61, 'EU'],
  [L('Monaco', 'Monaco', 'Mónaco', 'Monaco', 'Monaco'), 2.02, 'EU'],
  [L('Città del Vaticano', 'Vatican City', 'Ciudad del Vaticano', 'Vatican', 'Vatikanstadt'), 0.44, 'EU']
].map(([name, area, cont], i) => ({ key: `c${i}`, name, area, cont }));

const CONTINENTS = {
  EU: L('Europa', 'Europe', 'Europa', 'Europe', 'Europa'),
  AF: L('Africa', 'Africa', 'África', 'Afrique', 'Afrika'),
  AS: L('Asia', 'Asia', 'Asia', 'Asie', 'Asien'),
  SA: L('Sud America', 'South America', 'América del Sur', 'Amérique du Sud', 'Südamerika'),
  NA: L('Nord America', 'North America', 'América del Norte', 'Amérique du Nord', 'Nordamerika'),
  OC: L('Oceania', 'Oceania', 'Oceanía', 'Océanie', 'Ozeanien')
};

// Altitudine in metri
const MOUNTAINS = [
  [L('Everest'), 8849], [L('K2'), 8611], [L('Kangchenjunga'), 8586], [L('Lhotse'), 8516],
  [L('Makalu'), 8485], [L('Cho Oyu'), 8188], [L('Dhaulagiri'), 8167], [L('Nanga Parbat'), 8126],
  [L('Annapurna'), 8091], [L('Aconcagua'), 6961], [L('Denali'), 6190], [L('Kilimangiaro', 'Kilimanjaro', 'Kilimanjaro', 'Kilimandjaro', 'Kilimandscharo'), 5895],
  [L('Elbrus'), 5642],
  [L('Monte Vinson', 'Mount Vinson', 'Macizo Vinson', 'Mont Vinson', 'Mount Vinson'), 4892],
  [L('Monte Bianco', 'Mont Blanc', 'Mont Blanc', 'Mont Blanc', 'Montblanc'), 4806],
  [L('Monte Rosa', 'Monte Rosa', 'Monte Rosa', 'Mont Rose', 'Monte Rosa'), 4634],
  [L('Cervino', 'Matterhorn', 'Cervino', 'Cervin', 'Matterhorn'), 4478],
  [L('Grossglockner', 'Grossglockner', 'Grossglockner', 'Grossglockner', 'Großglockner'), 3798],
  [L('Monte Fuji', 'Mount Fuji', 'Monte Fuji', 'Mont Fuji', 'Fuji'), 3776],
  [L('Teide', 'Teide', 'Pico del Teide', 'Teide', 'Teide'), 3715],
  [L('Etna', 'Etna', 'Etna', 'Etna', 'Ätna'), 3357],
  [L('Monte Olimpo', 'Mount Olympus', 'Monte Olimpo', 'Mont Olympe', 'Olymp'), 2918],
  [L('Zugspitze'), 2962],
  [L('Ben Nevis'), 1345]
].map(([name, h], i) => ({ key: `m${i}`, name, value: h }));

// Anno dell'evento (negativo = avanti Cristo)
const EVENTS = [
  [L('Morte di Giulio Cesare', 'Death of Julius Caesar', 'Muerte de Julio César', 'Mort de Jules César', 'Tod von Julius Caesar'), -44],
  [L("Caduta dell'Impero romano d'Occidente", 'Fall of the Western Roman Empire', 'Caída del Imperio romano de Occidente', "Chute de l'Empire romain d'Occident", 'Untergang des Weströmischen Reiches'), 476],
  [L('Incoronazione di Carlo Magno', 'Coronation of Charlemagne', 'Coronación de Carlomagno', 'Couronnement de Charlemagne', 'Kaiserkrönung Karls des Großen'), 800],
  [L('Firma della Magna Carta', 'Signing of Magna Carta', 'Firma de la Carta Magna', 'Signature de la Grande Charte', 'Unterzeichnung der Magna Carta'), 1215],
  [L("Arrivo di Colombo in America", "Columbus reaches the Americas", 'Llegada de Colón a América', 'Arrivée de Colomb en Amérique', 'Kolumbus erreicht Amerika'), 1492],
  [L("Dichiarazione d'indipendenza degli USA", 'US Declaration of Independence', 'Declaración de Independencia de EE. UU.', "Déclaration d'indépendance des États-Unis", 'Unabhängigkeitserklärung der USA'), 1776],
  [L('Presa della Bastiglia', 'Storming of the Bastille', 'Toma de la Bastilla', 'Prise de la Bastille', 'Sturm auf die Bastille'), 1789],
  [L('Battaglia di Waterloo', 'Battle of Waterloo', 'Batalla de Waterloo', 'Bataille de Waterloo', 'Schlacht bei Waterloo'), 1815],
  [L("Proclamazione del Regno d'Italia", 'Proclamation of the Kingdom of Italy', 'Proclamación del Reino de Italia', "Proclamation du royaume d'Italie", 'Ausrufung des Königreichs Italien'), 1861],
  [L('Apertura del Canale di Suez', 'Opening of the Suez Canal', 'Apertura del Canal de Suez', 'Ouverture du canal de Suez', 'Eröffnung des Suezkanals'), 1869],
  [L('Inaugurazione della Torre Eiffel', 'Eiffel Tower opens', 'Inauguración de la Torre Eiffel', 'Inauguration de la tour Eiffel', 'Eröffnung des Eiffelturms'), 1889],
  [L('Prime Olimpiadi moderne ad Atene', 'First modern Olympics in Athens', 'Primeros Juegos Olímpicos modernos en Atenas', 'Premiers Jeux olympiques modernes à Athènes', 'Erste moderne Olympische Spiele in Athen'), 1896],
  [L('Primo volo dei fratelli Wright', "Wright brothers' first flight", 'Primer vuelo de los hermanos Wright', 'Premier vol des frères Wright', 'Erster Motorflug der Brüder Wright'), 1903],
  [L('Affondamento del Titanic', 'Sinking of the Titanic', 'Hundimiento del Titanic', 'Naufrage du Titanic', 'Untergang der Titanic'), 1912],
  [L('Inizio della Prima guerra mondiale', 'Start of World War I', 'Inicio de la Primera Guerra Mundial', 'Début de la Première Guerre mondiale', 'Beginn des Ersten Weltkriegs'), 1914],
  [L('Scoperta della penicillina', 'Discovery of penicillin', 'Descubrimiento de la penicilina', 'Découverte de la pénicilline', 'Entdeckung des Penicillins'), 1928],
  [L('Fine della Seconda guerra mondiale', 'End of World War II', 'Fin de la Segunda Guerra Mundial', 'Fin de la Seconde Guerre mondiale', 'Ende des Zweiten Weltkriegs'), 1945],
  [L('Lancio dello Sputnik 1', 'Launch of Sputnik 1', 'Lanzamiento del Sputnik 1', 'Lancement de Spoutnik 1', 'Start von Sputnik 1'), 1957],
  [L('Primo uomo sulla Luna', 'First human on the Moon', 'Primer hombre en la Luna', 'Premier homme sur la Lune', 'Erster Mensch auf dem Mond'), 1969],
  [L('Incidente di Chernobyl', 'Chernobyl disaster', 'Accidente de Chernóbil', 'Catastrophe de Tchernobyl', 'Katastrophe von Tschernobyl'), 1986],
  [L('Caduta del Muro di Berlino', 'Fall of the Berlin Wall', 'Caída del Muro de Berlín', 'Chute du mur de Berlin', 'Fall der Berliner Mauer'), 1989],
  [L("Arrivo delle monete e banconote in euro", 'Euro coins and notes enter circulation', 'Llegada de las monedas y billetes de euro', "Mise en circulation des pièces et billets en euros", 'Einführung des Euro-Bargelds'), 2002],
  [L('Presentazione del primo iPhone', 'First iPhone unveiled', 'Presentación del primer iPhone', 'Présentation du premier iPhone', 'Vorstellung des ersten iPhone'), 2007]
].map(([name, y], i) => ({ key: `e${i}`, name, value: y }));

// Anno della prima pubblicazione in volume
const BOOKS = [
  [L('Don Chisciotte (Cervantes)', 'Don Quixote (Cervantes)', 'Don Quijote (Cervantes)', 'Don Quichotte (Cervantes)', 'Don Quijote (Cervantes)'), 1605],
  [L('Robinson Crusoe (Defoe)'), 1719],
  [L('I viaggi di Gulliver (Swift)', "Gulliver's Travels (Swift)", 'Los viajes de Gulliver (Swift)', 'Les Voyages de Gulliver (Swift)', 'Gullivers Reisen (Swift)'), 1726],
  [L('Orgoglio e pregiudizio (Austen)', 'Pride and Prejudice (Austen)', 'Orgullo y prejuicio (Austen)', 'Orgueil et Préjugés (Austen)', 'Stolz und Vorurteil (Austen)'), 1813],
  [L('Frankenstein (Shelley)'), 1818],
  [L('I promessi sposi (Manzoni)', 'The Betrothed (Manzoni)', 'Los novios (Manzoni)', 'Les Fiancés (Manzoni)', 'Die Brautleute (Manzoni)'), 1827],
  [L('Moby Dick (Melville)', 'Moby-Dick (Melville)', 'Moby Dick (Melville)', 'Moby Dick (Melville)', 'Moby-Dick (Melville)'), 1851],
  [L('Madame Bovary (Flaubert)'), 1857],
  [L('I miserabili (Hugo)', 'Les Misérables (Hugo)', 'Los miserables (Hugo)', 'Les Misérables (Hugo)', 'Die Elenden (Hugo)'), 1862],
  [L('Alice nel Paese delle Meraviglie (Carroll)', "Alice's Adventures in Wonderland (Carroll)", 'Alicia en el país de las maravillas (Carroll)', 'Alice au pays des merveilles (Carroll)', 'Alice im Wunderland (Carroll)'), 1865],
  [L('Delitto e castigo (Dostoevskij)', 'Crime and Punishment (Dostoevsky)', 'Crimen y castigo (Dostoyevski)', 'Crime et Châtiment (Dostoïevski)', 'Schuld und Sühne (Dostojewski)'), 1866],
  [L('Ventimila leghe sotto i mari (Verne)', 'Twenty Thousand Leagues Under the Seas (Verne)', 'Veinte mil leguas de viaje submarino (Verne)', 'Vingt Mille Lieues sous les mers (Verne)', '20.000 Meilen unter dem Meer (Verne)'), 1870],
  [L("L'isola del tesoro (Stevenson)", 'Treasure Island (Stevenson)', 'La isla del tesoro (Stevenson)', "L'Île au trésor (Stevenson)", 'Die Schatzinsel (Stevenson)'), 1883],
  [L('Il ritratto di Dorian Gray (Wilde)', 'The Picture of Dorian Gray (Wilde)', 'El retrato de Dorian Gray (Wilde)', 'Le Portrait de Dorian Gray (Wilde)', 'Das Bildnis des Dorian Gray (Wilde)'), 1890],
  [L('Dracula (Stoker)', 'Dracula (Stoker)', 'Drácula (Stoker)', 'Dracula (Stoker)', 'Dracula (Stoker)'), 1897],
  [L('Il grande Gatsby (Fitzgerald)', 'The Great Gatsby (Fitzgerald)', 'El gran Gatsby (Fitzgerald)', 'Gatsby le Magnifique (Fitzgerald)', 'Der große Gatsby (Fitzgerald)'), 1925],
  [L('Il piccolo principe (Saint-Exupéry)', 'The Little Prince (Saint-Exupéry)', 'El principito (Saint-Exupéry)', 'Le Petit Prince (Saint-Exupéry)', 'Der kleine Prinz (Saint-Exupéry)'), 1943],
  [L('1984 (Orwell)'), 1949],
  [L('Il vecchio e il mare (Hemingway)', 'The Old Man and the Sea (Hemingway)', 'El viejo y el mar (Hemingway)', 'Le Vieil Homme et la Mer (Hemingway)', 'Der alte Mann und das Meer (Hemingway)'), 1952],
  [L('Il Gattopardo (Tomasi di Lampedusa)', 'The Leopard (Tomasi di Lampedusa)', 'El gatopardo (Tomasi di Lampedusa)', 'Le Guépard (Tomasi di Lampedusa)', 'Der Leopard (Tomasi di Lampedusa)'), 1958],
  [L('Cent\'anni di solitudine (García Márquez)', 'One Hundred Years of Solitude (García Márquez)', 'Cien años de soledad (García Márquez)', 'Cent ans de solitude (García Márquez)', 'Hundert Jahre Einsamkeit (García Márquez)'), 1967],
  [L('Il nome della rosa (Eco)', 'The Name of the Rose (Eco)', 'El nombre de la rosa (Eco)', 'Le Nom de la rose (Eco)', 'Der Name der Rose (Eco)'), 1980],
  [L('Harry Potter e la pietra filosofale (Rowling)', "Harry Potter and the Philosopher's Stone (Rowling)", 'Harry Potter y la piedra filosofal (Rowling)', "Harry Potter à l'école des sorciers (Rowling)", 'Harry Potter und der Stein der Weisen (Rowling)'), 1997],
  [L('Il codice da Vinci (Brown)', 'The Da Vinci Code (Brown)', 'El código Da Vinci (Brown)', 'Da Vinci Code (Brown)', 'Sakrileg – The Da Vinci Code (Brown)'), 2003]
].map(([name, y], i) => ({ key: `b${i}`, name, value: y }));

// Premi Oscar vinti (statuette competitive)
const FILMS = [
  [L('Ben-Hur (1959)'), 11],
  [L('Titanic (1997)'), 11],
  [L('Il Signore degli Anelli: Il ritorno del re', 'The Lord of the Rings: The Return of the King', 'El Señor de los Anillos: El retorno del rey', 'Le Seigneur des anneaux : Le Retour du roi', 'Der Herr der Ringe: Die Rückkehr des Königs'), 11],
  [L('West Side Story (1961)'), 10],
  [L("Il paziente inglese", 'The English Patient', 'El paciente inglés', 'Le Patient anglais', 'Der englische Patient'), 9],
  [L("L'ultimo imperatore", 'The Last Emperor', 'El último emperador', 'Le Dernier Empereur', 'Der letzte Kaiser'), 9],
  [L('Gigi (1958)'), 9],
  [L('Amadeus'), 8],
  [L('Gandhi'), 8],
  [L('The Millionaire', 'Slumdog Millionaire', 'Slumdog Millionaire', 'Slumdog Millionaire', 'Slumdog Millionär'), 8],
  [L('My Fair Lady'), 8],
  [L('Cabaret'), 8],
  [L("Schindler's List"), 7],
  [L('Oppenheimer'), 7],
  [L('Everything Everywhere All at Once'), 7],
  [L('La mia Africa', 'Out of Africa', 'Memorias de África', 'Out of Africa', 'Jenseits von Afrika'), 7],
  [L('Balla coi lupi', 'Dances with Wolves', 'Bailando con lobos', 'Danse avec les loups', 'Der mit dem Wolf tanzt'), 7],
  [L('Shakespeare in Love'), 7],
  [L('Gravity'), 7],
  [L("Lawrence d'Arabia", 'Lawrence of Arabia', 'Lawrence de Arabia', "Lawrence d'Arabie", 'Lawrence von Arabien'), 7],
  [L('Forrest Gump'), 6],
  [L('La La Land'), 6],
  [L('Mad Max: Fury Road'), 6],
  [L('Il Padrino - Parte II', 'The Godfather Part II', 'El padrino II', 'Le Parrain 2', 'Der Pate – Teil II'), 6],
  [L('Il Gladiatore', 'Gladiator', 'Gladiator', 'Gladiator', 'Gladiator'), 5],
  [L('Braveheart'), 5],
  [L('Il silenzio degli innocenti', 'The Silence of the Lambs', 'El silencio de los corderos', 'Le Silence des agneaux', 'Das Schweigen der Lämmer'), 5],
  [L('Anora'), 5],
  [L('Parasite'), 4],
  [L('Inception'), 4],
  [L('Il Padrino', 'The Godfather', 'El padrino', 'Le Parrain', 'Der Pate'), 3],
  [L('Avatar (2009)'), 3],
  [L('La vita è bella', 'Life Is Beautiful', 'La vida es bella', 'La vie est belle', 'Das Leben ist schön'), 3]
].map(([name, n], i) => ({ key: `f${i}`, name, value: n }));

// Animali e relativa classe
const ANIMALS = [
  [L('Delfino', 'Dolphin', 'Delfín', 'Dauphin', 'Delfin'), 'mammal'],
  [L('Balena', 'Whale', 'Ballena', 'Baleine', 'Wal'), 'mammal'],
  [L('Pipistrello', 'Bat', 'Murciélago', 'Chauve-souris', 'Fledermaus'), 'mammal'],
  [L('Ornitorinco', 'Platypus', 'Ornitorrinco', 'Ornithorynque', 'Schnabeltier'), 'mammal'],
  [L('Foca', 'Seal', 'Foca', 'Phoque', 'Robbe'), 'mammal'],
  [L('Pinguino', 'Penguin', 'Pingüino', 'Manchot', 'Pinguin'), 'bird'],
  [L('Struzzo', 'Ostrich', 'Avestruz', 'Autruche', 'Strauß'), 'bird'],
  [L('Kiwi'), 'bird'],
  [L('Colibrì', 'Hummingbird', 'Colibrí', 'Colibri', 'Kolibri'), 'bird'],
  [L('Squalo', 'Shark', 'Tiburón', 'Requin', 'Hai'), 'fish'],
  [L('Cavalluccio marino', 'Seahorse', 'Caballito de mar', 'Hippocampe', 'Seepferdchen'), 'fish'],
  [L('Anguilla', 'Eel', 'Anguila', 'Anguille', 'Aal'), 'fish'],
  [L('Coccodrillo', 'Crocodile', 'Cocodrilo', 'Crocodile', 'Krokodil'), 'reptile'],
  [L('Tartaruga', 'Turtle', 'Tortuga', 'Tortue', 'Schildkröte'), 'reptile'],
  [L('Camaleonte', 'Chameleon', 'Camaleón', 'Caméléon', 'Chamäleon'), 'reptile'],
  [L('Serpente', 'Snake', 'Serpiente', 'Serpent', 'Schlange'), 'reptile'],
  [L('Rana', 'Frog', 'Rana', 'Grenouille', 'Frosch'), 'amphibian'],
  [L('Salamandra', 'Salamander', 'Salamandra', 'Salamandre', 'Salamander'), 'amphibian'],
  [L('Polpo', 'Octopus', 'Pulpo', 'Pieuvre', 'Krake'), 'mollusc'],
  [L('Lumaca', 'Snail', 'Caracol', 'Escargot', 'Schnecke'), 'mollusc'],
  [L('Ape', 'Bee', 'Abeja', 'Abeille', 'Biene'), 'insect'],
  [L('Farfalla', 'Butterfly', 'Mariposa', 'Papillon', 'Schmetterling'), 'insect'],
  [L('Ragno', 'Spider', 'Araña', 'Araignée', 'Spinne'), 'arachnid'],
  [L('Scorpione', 'Scorpion', 'Escorpión', 'Scorpion', 'Skorpion'), 'arachnid'],
  [L('Granchio', 'Crab', 'Cangrejo', 'Crabe', 'Krabbe'), 'crustacean'],
  [L('Medusa', 'Jellyfish', 'Medusa', 'Méduse', 'Qualle'), 'cnidarian']
].map(([name, cls], i) => ({ key: `a${i}`, name, cls }));

const ANIMAL_CLASSES = {
  mammal: L('Mammifero', 'Mammal', 'Mamífero', 'Mammifère', 'Säugetier'),
  bird: L('Uccello', 'Bird', 'Ave', 'Oiseau', 'Vogel'),
  fish: L('Pesce', 'Fish', 'Pez', 'Poisson', 'Fisch'),
  reptile: L('Rettile', 'Reptile', 'Reptil', 'Reptile', 'Reptil'),
  amphibian: L('Anfibio', 'Amphibian', 'Anfibio', 'Amphibien', 'Amphibie'),
  mollusc: L('Mollusco', 'Mollusc', 'Molusco', 'Mollusque', 'Weichtier'),
  insect: L('Insetto', 'Insect', 'Insecto', 'Insecte', 'Insekt'),
  arachnid: L('Aracnide', 'Arachnid', 'Arácnido', 'Arachnide', 'Spinnentier'),
  crustacean: L('Crostaceo', 'Crustacean', 'Crustáceo', 'Crustacé', 'Krebstier'),
  cnidarian: L('Cnidario', 'Cnidarian', 'Cnidario', 'Cnidaire', 'Nesseltier')
};

// Capitali "trabocchetto": capitale vera + grandi città dello stesso paese
const TRICK_CAPITALS = [
  [L('Australia', 'Australia', 'Australia', 'Australie', 'Australien'), L('Canberra'),
    [L('Sydney', 'Sydney', 'Sídney', 'Sydney', 'Sydney'), L('Melbourne'), L('Brisbane'), L('Perth'), L('Adelaide', 'Adelaide', 'Adelaida', 'Adélaïde', 'Adelaide'), L('Darwin')]],
  [L('Canada', 'Canada', 'Canadá', 'Canada', 'Kanada'), L('Ottawa'),
    [L('Toronto'), L('Montréal', 'Montreal', 'Montreal', 'Montréal', 'Montreal'), L('Vancouver'), L('Québec', 'Quebec City', 'Quebec', 'Québec', 'Québec'), L('Calgary')]],
  [L('Brasile', 'Brazil', 'Brasil', 'Brésil', 'Brasilien'), L('Brasilia', 'Brasília', 'Brasilia', 'Brasilia', 'Brasília'),
    [L('Rio de Janeiro', 'Rio de Janeiro', 'Río de Janeiro', 'Rio de Janeiro', 'Rio de Janeiro'), L('San Paolo', 'São Paulo', 'São Paulo', 'São Paulo', 'São Paulo'), L('Salvador'), L('Belo Horizonte'), L('Recife')]],
  [L('Turchia', 'Turkey', 'Turquía', 'Turquie', 'Türkei'), L('Ankara'),
    [L('Istanbul', 'Istanbul', 'Estambul', 'Istanbul', 'Istanbul'), L('Smirne', 'Izmir', 'Esmirna', 'Izmir', 'Izmir'), L('Antalya'), L('Bursa')]],
  [L('Nuova Zelanda', 'New Zealand', 'Nueva Zelanda', 'Nouvelle-Zélande', 'Neuseeland'), L('Wellington'),
    [L('Auckland'), L('Christchurch'), L('Queenstown'), L('Hamilton')]],
  [L('Marocco', 'Morocco', 'Marruecos', 'Maroc', 'Marokko'), L('Rabat'),
    [L('Casablanca'), L('Marrakech', 'Marrakesh', 'Marrakech', 'Marrakech', 'Marrakesch'), L('Fès', 'Fez', 'Fez', 'Fès', 'Fès'), L('Tangeri', 'Tangier', 'Tánger', 'Tanger', 'Tanger')]],
  [L('Nigeria', 'Nigeria', 'Nigeria', 'Nigeria', 'Nigeria'), L('Abuja'),
    [L('Lagos'), L('Kano'), L('Ibadan'), L('Port Harcourt')]],
  [L('Pakistan', 'Pakistan', 'Pakistán', 'Pakistan', 'Pakistan'), L('Islamabad'),
    [L('Karachi'), L('Lahore'), L('Peshawar')]],
  [L('Vietnam', 'Vietnam', 'Vietnam', 'Viêt Nam', 'Vietnam'), L('Hanoi', 'Hanoi', 'Hanói', 'Hanoï', 'Hanoi'),
    [L('Ho Chi Minh'), L('Da Nang', 'Da Nang', 'Da Nang', 'Đà Nẵng', 'Đà Nẵng'), L('Huế')]],
  [L('Stati Uniti', 'United States', 'Estados Unidos', 'États-Unis', 'USA'), L('Washington'),
    [L('New York', 'New York', 'Nueva York', 'New York', 'New York'), L('Los Angeles'), L('Chicago'), L('San Francisco'), L('Boston'), L('Filadelfia', 'Philadelphia', 'Filadelfia', 'Philadelphie', 'Philadelphia')]],
  [L('India', 'India', 'India', 'Inde', 'Indien'), L('Nuova Delhi', 'New Delhi', 'Nueva Delhi', 'New Delhi', 'Neu-Delhi'),
    [L('Mumbai', 'Mumbai', 'Bombay', 'Bombay', 'Mumbai'), L('Calcutta', 'Kolkata', 'Calcuta', 'Calcutta', 'Kalkutta'), L('Bangalore', 'Bengaluru', 'Bangalore', 'Bangalore', 'Bangalore'), L('Chennai')]],
  [L('Germania', 'Germany', 'Alemania', 'Allemagne', 'Deutschland'), L('Berlino', 'Berlin', 'Berlín', 'Berlin', 'Berlin'),
    [L('Bonn'), L('Monaco di Baviera', 'Munich', 'Múnich', 'Munich', 'München'), L('Francoforte', 'Frankfurt', 'Fráncfort', 'Francfort', 'Frankfurt'), L('Amburgo', 'Hamburg', 'Hamburgo', 'Hambourg', 'Hamburg')]],
  [L('Cina', 'China', 'China', 'Chine', 'China'), L('Pechino', 'Beijing', 'Pekín', 'Pékin', 'Peking'),
    [L('Shanghai', 'Shanghai', 'Shanghái', 'Shanghai', 'Shanghai'), L('Hong Kong'), L('Canton', 'Guangzhou', 'Cantón', 'Canton', 'Kanton'), L('Shenzhen')]],
  [L('Giappone', 'Japan', 'Japón', 'Japon', 'Japan'), L('Tokyo', 'Tokyo', 'Tokio', 'Tokyo', 'Tokio'),
    [L('Kyoto', 'Kyoto', 'Kioto', 'Kyoto', 'Kyoto'), L('Osaka'), L('Yokohama'), L('Hiroshima')]],
  [L('Colombia', 'Colombia', 'Colombia', 'Colombie', 'Kolumbien'), L('Bogotà', 'Bogotá', 'Bogotá', 'Bogota', 'Bogotá'),
    [L('Medellín'), L('Cali'), L('Cartagena', 'Cartagena', 'Cartagena de Indias', 'Carthagène', 'Cartagena')]],
  [L('Spagna', 'Spain', 'España', 'Espagne', 'Spanien'), L('Madrid'),
    [L('Barcellona', 'Barcelona', 'Barcelona', 'Barcelone', 'Barcelona'), L('Siviglia', 'Seville', 'Sevilla', 'Séville', 'Sevilla'), L('Valencia', 'Valencia', 'Valencia', 'Valence', 'Valencia'), L('Bilbao')]]
];

// =========================================================================
// TESTI DELLE DOMANDE
// =========================================================================

const CAT = {
  chem: L('CHIMICA', 'CHEMISTRY', 'QUÍMICA', 'CHIMIE', 'CHEMIE'),
  geo: L('GEOGRAFIA', 'GEOGRAPHY', 'GEOGRAFÍA', 'GÉOGRAPHIE', 'GEOGRAFIE'),
  nature: L('NATURA', 'NATURE', 'NATURALEZA', 'NATURE', 'NATUR'),
  hist: L('STORIA', 'HISTORY', 'HISTORIA', 'HISTOIRE', 'GESCHICHTE'),
  lit: L('LETTERATURA', 'LITERATURE', 'LITERATURA', 'LITTÉRATURE', 'LITERATUR'),
  cinema: L('CINEMA', 'MOVIES', 'CINE', 'CINÉMA', 'KINO'),
  animals: L('ANIMALI', 'ANIMALS', 'ANIMALES', 'ANIMAUX', 'TIERE')
};

const BC = L('a.C.', 'BC', 'a. C.', 'av. J.-C.', 'v. Chr.');
const yearStr = (y, lang) => (y < 0 ? `${-y} ${BC[lang]}` : `${y}`);

// Template a classifica: tra 10 voci estratte a caso vince il valore estremo,
// separato dal secondo almeno di `gap` (assoluto) o `relGap` (relativo) per evitare ambiguità sui dati.
const RANKED = [
  {
    id: 'elem-min', cat: 'chem', items: ELEMENTS, pick: 'min', gap: 1,
    q: L('Quale di questi elementi chimici ha il numero atomico più BASSO?', 'Which of these chemical elements has the LOWEST atomic number?', '¿Cuál de estos elementos químicos tiene el número atómico más BAJO?', 'Lequel de ces éléments chimiques a le numéro atomique le plus PETIT ?', 'Welches dieser chemischen Elemente hat die NIEDRIGSTE Ordnungszahl?'),
    hint: L('Il numero atomico è il numero di protoni nel nucleo.', 'The atomic number is the number of protons in the nucleus.', 'El número atómico es la cantidad de protones del núcleo.', 'Le numéro atomique est le nombre de protons du noyau.', 'Die Ordnungszahl ist die Zahl der Protonen im Kern.'),
    detail: (v) => `Z = ${v}`
  },
  {
    id: 'elem-max', cat: 'chem', items: ELEMENTS, pick: 'max', gap: 1,
    q: L('Quale di questi elementi chimici ha il numero atomico più ALTO?', 'Which of these chemical elements has the HIGHEST atomic number?', '¿Cuál de estos elementos químicos tiene el número atómico más ALTO?', 'Lequel de ces éléments chimiques a le numéro atomique le plus GRAND ?', 'Welches dieser chemischen Elemente hat die HÖCHSTE Ordnungszahl?'),
    hint: L('Gli elementi più pesanti hanno più protoni.', 'Heavier elements have more protons.', 'Los elementos más pesados tienen más protones.', 'Les éléments les plus lourds ont plus de protons.', 'Schwerere Elemente haben mehr Protonen.'),
    detail: (v) => `Z = ${v}`
  },
  {
    id: 'lat-north', cat: 'geo', items: CAPITALS_LAT, pick: 'max', gap: 0.5,
    q: L('Quale di queste capitali si trova più a NORD?', 'Which of these capital cities lies furthest NORTH?', '¿Cuál de estas capitales está más al NORTE?', 'Laquelle de ces capitales est située le plus au NORD ?', 'Welche dieser Hauptstädte liegt am weitesten im NORDEN?'),
    hint: L('Conta la latitudine, non la distanza da casa tua.', 'Latitude is what counts.', 'Lo que cuenta es la latitud.', "C'est la latitude qui compte.", 'Es zählt der Breitengrad.'),
    detail: (v, lang) => `${num(Math.abs(v), lang, 1)}° ${v >= 0 ? 'N' : 'S'}`
  },
  {
    id: 'lat-south', cat: 'geo', items: CAPITALS_LAT, pick: 'min', gap: 0.5,
    q: L('Quale di queste capitali si trova più a SUD?', 'Which of these capital cities lies furthest SOUTH?', '¿Cuál de estas capitales está más al SUR?', 'Laquelle de ces capitales est située le plus au SUD ?', 'Welche dieser Hauptstädte liegt am weitesten im SÜDEN?'),
    hint: L("Pensa a quali città stanno sotto l'equatore.", 'Think about which cities are below the equator.', 'Piensa en qué ciudades están bajo el ecuador.', "Pensez aux villes situées sous l'équateur.", 'Welche Städte liegen südlich des Äquators?'),
    detail: (v, lang) => `${num(Math.abs(v), lang, 1)}° ${v >= 0 ? 'N' : 'S'}`
  },
  {
    id: 'area-max', cat: 'geo', items: COUNTRIES.filter(c => c.area).map(c => ({ ...c, value: c.area })), pick: 'max', relGap: 0.1,
    q: L('Quale di questi paesi ha la superficie più GRANDE?', 'Which of these countries has the LARGEST area?', '¿Cuál de estos países tiene la MAYOR superficie?', 'Lequel de ces pays a la PLUS GRANDE superficie ?', 'Welches dieser Länder hat die GRÖSSTE Fläche?'),
    hint: L('Si conta la superficie totale, acque interne comprese.', 'Total area, inland water included.', 'Cuenta la superficie total, aguas interiores incluidas.', 'Superficie totale, eaux intérieures comprises.', 'Gesamtfläche inklusive Binnengewässer.'),
    detail: (v, lang) => `${num(v, lang, v < 10 ? 2 : 0)} km²`
  },
  {
    id: 'area-min', cat: 'geo', items: COUNTRIES.filter(c => c.area).map(c => ({ ...c, value: c.area })), pick: 'min', relGap: 0.15,
    q: L('Quale di questi paesi ha la superficie più PICCOLA?', 'Which of these countries has the SMALLEST area?', '¿Cuál de estos países tiene la MENOR superficie?', 'Lequel de ces pays a la PLUS PETITE superficie ?', 'Welches dieser Länder hat die KLEINSTE Fläche?'),
    hint: L('Attenzione ai micro-stati!', 'Watch out for the micro-states!', '¡Cuidado con los microestados!', 'Attention aux micro-États !', 'Achtung vor den Zwergstaaten!'),
    detail: (v, lang) => `${num(v, lang, v < 10 ? 2 : 0)} km²`
  },
  {
    id: 'mount-max', cat: 'nature', items: MOUNTAINS, pick: 'max', gap: 100,
    q: L('Quale di queste montagne è la più ALTA?', 'Which of these mountains is the HIGHEST?', '¿Cuál de estas montañas es la más ALTA?', 'Laquelle de ces montagnes est la plus HAUTE ?', 'Welcher dieser Berge ist der HÖCHSTE?'),
    hint: L("Le vette oltre 8.000 m sono tutte in Asia.", 'All peaks above 8,000 m are in Asia.', 'Todas las cumbres de más de 8.000 m están en Asia.', 'Tous les sommets de plus de 8 000 m sont en Asie.', 'Alle Gipfel über 8.000 m liegen in Asien.'),
    detail: (v, lang) => `${num(v, lang)} m`
  },
  {
    id: 'mount-min', cat: 'nature', items: MOUNTAINS, pick: 'min', gap: 100,
    q: L('Quale di queste montagne è la più BASSA?', 'Which of these mountains is the LOWEST?', '¿Cuál de estas montañas es la más BAJA?', 'Laquelle de ces montagnes est la moins HAUTE ?', 'Welcher dieser Berge ist der NIEDRIGSTE?'),
    hint: L('Non tutte le montagne famose sono giganti.', 'Not every famous mountain is a giant.', 'No todas las montañas famosas son gigantes.', 'Toutes les montagnes célèbres ne sont pas des géantes.', 'Nicht jeder berühmte Berg ist ein Riese.'),
    detail: (v, lang) => `${num(v, lang)} m`
  },
  {
    id: 'event-first', cat: 'hist', items: EVENTS, pick: 'min', gap: 1,
    q: L('Quale di questi eventi storici è avvenuto per PRIMO?', 'Which of these historical events happened FIRST?', '¿Cuál de estos acontecimientos históricos ocurrió PRIMERO?', 'Lequel de ces événements historiques a eu lieu EN PREMIER ?', 'Welches dieser historischen Ereignisse geschah ZUERST?'),
    hint: L('Metti in fila i secoli prima degli anni.', 'Sort the centuries before the years.', 'Ordena primero los siglos.', "Classez d'abord les siècles.", 'Sortiere zuerst die Jahrhunderte.'),
    detail: (v, lang) => yearStr(v, lang)
  },
  {
    id: 'event-last', cat: 'hist', items: EVENTS, pick: 'max', gap: 1,
    q: L('Quale di questi eventi storici è il più RECENTE?', 'Which of these historical events is the most RECENT?', '¿Cuál de estos acontecimientos históricos es el más RECIENTE?', 'Lequel de ces événements historiques est le plus RÉCENT ?', 'Welches dieser historischen Ereignisse ist das JÜNGSTE?'),
    hint: L('Pensa a cosa ricordano ancora i tuoi genitori.', 'Think about what your parents still remember.', 'Piensa en lo que aún recuerdan tus padres.', 'Pensez à ce dont vos parents se souviennent encore.', 'Woran erinnern sich deine Eltern noch?'),
    detail: (v, lang) => yearStr(v, lang)
  },
  {
    id: 'book-first', cat: 'lit', items: BOOKS, pick: 'min', gap: 3,
    q: L('Quale di questi libri è stato pubblicato per PRIMO?', 'Which of these books was published FIRST?', '¿Cuál de estos libros se publicó PRIMERO?', 'Lequel de ces livres a été publié EN PREMIER ?', 'Welches dieser Bücher erschien ZUERST?'),
    hint: L("Conta la prima edizione in volume.", 'The first edition in book form counts.', 'Cuenta la primera edición en libro.', "C'est la première édition en volume qui compte.", 'Es zählt die erste Buchausgabe.'),
    detail: (v) => `${v}`
  },
  {
    id: 'book-last', cat: 'lit', items: BOOKS, pick: 'max', gap: 3,
    q: L('Quale di questi libri è stato pubblicato più di RECENTE?', 'Which of these books was published most RECENTLY?', '¿Cuál de estos libros se publicó más RECIENTEMENTE?', 'Lequel de ces livres a été publié le plus RÉCEMMENT ?', 'Welches dieser Bücher erschien als LETZTES?'),
    hint: L("Conta la prima edizione in volume.", 'The first edition in book form counts.', 'Cuenta la primera edición en libro.', "C'est la première édition en volume qui compte.", 'Es zählt die erste Buchausgabe.'),
    detail: (v) => `${v}`
  },
  {
    id: 'oscar-max', cat: 'cinema', items: FILMS, pick: 'max', gap: 1,
    q: L('Quale di questi film ha vinto PIÙ premi Oscar?', 'Which of these films won the MOST Academy Awards?', '¿Cuál de estas películas ganó MÁS premios Óscar?', 'Lequel de ces films a remporté le PLUS d\'Oscars ?', 'Welcher dieser Filme gewann die MEISTEN Oscars?'),
    hint: L('Il record assoluto è 11 statuette, condiviso da tre film.', 'The all-time record is 11, shared by three films.', 'El récord absoluto es 11, compartido por tres películas.', 'Le record absolu est de 11, partagé par trois films.', 'Der Rekord liegt bei 11, geteilt von drei Filmen.'),
    detail: (v) => `${v} Oscar`
  }
];

// Template "trova l'intruso giusto": 1 voce del gruppo richiesto + 9 voci di altri gruppi
const CONTINENT_KEYS = ['EU', 'AF', 'AS', 'SA', 'OC'];
const CONTINENT_Q = L('Quale di questi paesi si trova in {g}?', 'Which of these countries is in {g}?', '¿Cuál de estos países está en {g}?', 'Lequel de ces pays se trouve en {g} ?', 'Welches dieser Länder liegt in {g}?');
const ANIMAL_Q = L('Quale di questi animali è un {g}?', 'Which of these animals is {g}?', '¿Cuál de estos animales es un {g}?', 'Lequel de ces animaux est un {g} ?', 'Welches dieser Tiere ist {g}?');
// Classe con articolo indeterminativo dove serve (EN a/an, DE ein/eine)
const animalClassPhrase = (cls, lang) => {
  const n = ANIMAL_CLASSES[cls][lang];
  if (lang === 'de') return `${cls === 'amphibian' ? 'eine' : 'ein'} ${n}`;
  if (lang === 'en') return `${/^[aeiou]/i.test(n) ? 'an' : 'a'} ${n.toLowerCase()}`;
  return n.toLowerCase();
};
const CAPITAL_Q = L('Paese: {g}. Qual è la sua capitale?', 'Country: {g}. What is its capital?', 'País: {g}. ¿Cuál es su capital?', 'Pays : {g}. Quelle est sa capitale ?', 'Land: {g}. Wie heißt die Hauptstadt?');
const CAPITAL_DETAIL_OK = L('Capitale', 'Capital', 'Capital', 'Capitale', 'Hauptstadt');
const CAPITAL_DETAIL_NO = L('Non è la capitale ({g})', 'Not the capital ({g})', 'No es la capital ({g})', "Pas la capitale ({g})", 'Nicht die Hauptstadt ({g})');

// =========================================================================
// MOTORE DI GENERAZIONE
// =========================================================================

function mapL(l, fn) {
  const out = {};
  for (const k of LANGS) out[k] = fn(l[k]);
  return out;
}

function shuffle(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildRanked(t, lang, rng) {
  for (let attempt = 0; attempt < 60; attempt++) {
    const picked = shuffle(t.items, rng).slice(0, 10);
    const sorted = picked.slice().sort((a, b) => (t.pick === 'max' ? b.value - a.value : a.value - b.value));
    const best = sorted[0].value;
    const second = sorted[1].value;
    const diff = Math.abs(best - second);
    const okAbs = t.gap === undefined || diff >= t.gap;
    const okRel = t.relGap === undefined || diff / Math.max(Math.abs(best), Math.abs(second)) >= t.relGap;
    if (!okAbs || !okRel) continue;
    return {
      sig: `${t.id}:${sorted[0].key}`,
      category: CAT[t.cat][lang],
      question: t.q[lang],
      hint: t.hint[lang],
      options: picked.map(it => ({
        text: it.name[lang],
        isCorrect: it === sorted[0],
        detail: t.detail(it.value, lang)
      }))
    };
  }
  return null;
}

function buildContinent(lang, rng) {
  const cont = CONTINENT_KEYS[Math.floor(rng() * CONTINENT_KEYS.length)];
  const pool = COUNTRIES.filter(c => c.cont);
  const right = shuffle(pool.filter(c => c.cont === cont), rng)[0];
  const wrong = shuffle(pool.filter(c => c.cont !== cont), rng).slice(0, 9);
  const g = CONTINENTS[cont][lang];
  return {
    sig: `cont:${right.key}`,
    category: CAT.geo[lang],
    question: CONTINENT_Q[lang].replace('{g}', g),
    hint: '',
    options: [right, ...wrong].map(c => ({
      text: c.name[lang],
      isCorrect: c === right,
      detail: CONTINENTS[c.cont][lang]
    }))
  };
}

function buildAnimal(lang, rng) {
  const classes = Object.keys(ANIMAL_CLASSES).filter(k => ['mammal', 'bird', 'fish', 'reptile', 'amphibian', 'insect'].includes(k));
  const cls = classes[Math.floor(rng() * classes.length)];
  const right = shuffle(ANIMALS.filter(a => a.cls === cls), rng)[0];
  const wrong = shuffle(ANIMALS.filter(a => a.cls !== cls), rng).slice(0, 9);
  return {
    sig: `animal:${right.key}`,
    category: CAT.animals[lang],
    question: ANIMAL_Q[lang].replace('{g}', animalClassPhrase(cls, lang)),
    hint: '',
    options: [right, ...wrong].map(a => ({
      text: a.name[lang],
      isCorrect: a === right,
      detail: ANIMAL_CLASSES[a.cls][lang]
    }))
  };
}

function buildCapital(lang, rng) {
  const idx = Math.floor(rng() * TRICK_CAPITALS.length);
  const [country, capital, cities] = TRICK_CAPITALS[idx];
  // Riempie fino a 10 con capitali di altri paesi (sicuramente sbagliate)
  const otherCaps = shuffle(TRICK_CAPITALS.filter((_, i) => i !== idx).map(t => t[1]), rng);
  const wrong = [...shuffle(cities, rng), ...otherCaps].slice(0, 9);
  const g = country[lang];
  return {
    sig: `cap:${idx}`,
    category: CAT.geo[lang],
    question: CAPITAL_Q[lang].replace('{g}', g),
    hint: '',
    options: [capital, ...wrong].map(c => ({
      text: c[lang],
      isCorrect: c === capital,
      detail: c === capital ? CAPITAL_DETAIL_OK[lang] : CAPITAL_DETAIL_NO[lang].replace('{g}', g)
    }))
  };
}

const BUILDERS = [
  ...RANKED.map(t => ({ cat: t.cat, build: (lang, rng) => buildRanked(t, lang, rng) })),
  { cat: 'geo', build: buildContinent },
  { cat: 'animals', build: buildAnimal },
  { cat: 'geo', build: buildCapital }
];

const PRIZES = [100000, 150000, 200000, 250000, 300000, 500000];

/**
 * Crea una nuova domanda nella lingua indicata.
 * @param {string} lang
 * @param {{recentSigs?: string[], recentCats?: string[], rng?: () => number}} opts
 *   recentSigs: domande già viste (non vengono ripetute), recentCats: categorie delle ultime sale (vengono evitate)
 */
export function generateQuestion(lang, { recentSigs = [], recentCats = [], rng = Math.random } = {}) {
  if (!LANGS.includes(lang)) lang = 'it';
  const seen = new Set(recentSigs);
  const freshCats = BUILDERS.filter(b => !recentCats.includes(b.cat));
  const pool = freshCats.length ? freshCats : BUILDERS;

  let q = null;
  for (let attempt = 0; attempt < 40; attempt++) {
    const b = pool[Math.floor(rng() * pool.length)];
    const candidate = b.build(lang, rng);
    if (!candidate) continue;
    candidate.catKey = b.cat;
    q = candidate;
    if (!seen.has(candidate.sig)) break;
  }

  const options = shuffle(q.options, rng).map((o, i) => ({ ...o, id: i + 1 }));
  return {
    ...q,
    options,
    prizeValue: PRIZES[Math.floor(rng() * PRIZES.length)]
  };
}

// Esposto per i test sui dati
export const _data = { RANKED, BUILDERS, COUNTRIES, ANIMALS, TRICK_CAPITALS };
