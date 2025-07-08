// main.js - Ihr Haupteinstiegspunkt für JavaScript
console.log('Gamification Prototyp JavaScript geladen!');

// Hier werden später die Module für Karte, Simulation etc. importiert
// import { initializeMap } from './modules/map.js';
// import { startGame } from './modules/simulation.js';

// Beispiel-Funktion, die beim Laden der Seite aufgerufen wird
function initApp() {
    console.log('Anwendung wird initialisiert...');
    // initializeMap('map-id-from-html');
    // startGame();
}

// Führen Sie die Initialisierungsfunktion aus, wenn das DOM geladen ist
document.addEventListener('DOMContentLoaded', initApp);