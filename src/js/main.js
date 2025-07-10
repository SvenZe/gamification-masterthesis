// script.js

// Spielzustand
let earnedCredit = 0; // Verdientes Guthaben
let remainingBudget = 1000; // Verbleibendes Budget
let visitedDeliveryNodes = []; // Besuchte Zustellpunkte (nur die 10 Stationen)
let currentPositionNodeId = null; // Aktueller Standort des Spielers (ID des Knotens)
let activeTask = null; // Aktuell aktive Aufgabe
const totalDeliveryNodes = 10; // Gesamtzahl der Zustellpunkte, die besucht werden müssen
let gameStarted = false; // Flag, um den Spielstart zu verfolgen
let currentPathSegments = []; // Speichert die IDs der genutzten Straßensegmente

// DOM-Elemente
const earnedCreditDisplay = document.getElementById('earned-credit');
const remainingBudgetDisplay = document.getElementById('remaining-budget');
const visitedDeliveryNodesCountDisplay = document.getElementById('visited-delivery-nodes-count');
const totalDeliveryNodesCountDisplay = document.getElementById('total-delivery-nodes-count');
const gameMap = document.getElementById('game-map');
const resetGameBtn = document.getElementById('reset-game-btn');

const taskModal = document.getElementById('task-modal');
const closeModalBtn = document.getElementById('close-modal');
const modalTitle = document.getElementById('modal-title');
const modalDescription = document.getElementById('modal-description');
const taskOptions = document.getElementById('task-options');
const submitTaskBtn = document.getElementById('submit-task-btn');
const nextTaskBtn = document.getElementById('next-task-btn');
const feedbackMessage = document.getElementById('feedback-message');

const gameOverModal = document.getElementById('game-over-modal');
const finalScoreDisplay = document.getElementById('final-score');
const restartGameBtn = document.getElementById('restart-game-btn');

const startScreenOverlay = document.getElementById('start-screen-overlay');
const startGameBtn = document.getElementById('start-game-btn');

const messageField = document.getElementById('message-field'); // Meldungsfeld

// Definition der Knotenpunkte und ihrer Eigenschaften
const nodes = {
    'warehouse': { x: 400, y: 300, label: 'Lager', isWarehouse: true, taskId: 'task0' },
    'node-1': { x: 200, y: 100, label: 'Zustellpunkt 1', taskId: 'task1' },
    'node-2': { x: 600, y: 100, label: 'Zustellpunkt 2', taskId: 'task2' },
    'node-3': { x: 100, y: 200, label: 'Zustellpunkt 3', taskId: 'task3' },
    'node-4': { x: 700, y: 200, label: 'Zustellpunkt 4', taskId: 'task4' },
    'node-5': { x: 200, y: 400, label: 'Zustellpunkt 5', taskId: 'task5' },
    'node-6': { x: 600, y: 400, label: 'Zustellpunkt 6', taskId: 'task6' },
    'node-7': { x: 100, y: 500, label: 'Zustellpunkt 7', taskId: 'task7' },
    'node-8': { x: 400, y: 500, label: 'Zustellpunkt 8', taskId: 'task8' },
    'node-9': { x: 700, y: 500, label: 'Zustellpunkt 9', taskId: 'task9' },
    'node-10': { x: 500, y: 200, label: 'Zustellpunkt 10', taskId: 'task10' },
    // Zusätzliche Kreuzungspunkte im Raster, die keine Zustellpunkte sind, aber für die Routenführung wichtig sind
    'grid-100-100': { x: 100, y: 100, label: '', isIntersection: true },
    'grid-300-100': { x: 300, y: 100, label: '', isIntersection: true },
    'grid-400-100': { x: 400, y: 100, label: '', isIntersection: true },
    'grid-500-100': { x: 500, y: 100, label: '', isIntersection: true },
    'grid-700-100': { x: 700, y: 100, label: '', isIntersection: true },

    'grid-100-300': { x: 100, y: 300, label: '', isIntersection: true },
    'grid-200-300': { x: 200, y: 300, label: '', isIntersection: true },
    'grid-300-300': { x: 300, y: 300, label: '', isIntersection: true },
    'grid-500-300': { x: 500, y: 300, label: '', isIntersection: true },
    'grid-600-300': { x: 600, y: 300, label: '', isIntersection: true },
    'grid-700-300': { x: 700, y: 300, label: '', isIntersection: true },

    'grid-100-400': { x: 100, y: 400, label: '', isIntersection: true },
    'grid-300-400': { x: 300, y: 400, label: '', isIntersection: true },
    'grid-400-400': { x: 400, y: 400, label: '', isIntersection: true },
    'grid-500-400': { x: 500, y: 400, label: '', isIntersection: true },
    'grid-700-400': { x: 700, y: 400, label: '', isIntersection: true },
    
    'grid-200-200': { x: 200, y: 200, label: '', isIntersection: true },
    'grid-300-200': { x: 300, y: 200, label: '', isIntersection: true },
    'grid-400-200': { x: 400, y: 200, label: '', isIntersection: true },
    'grid-600-200': { x: 600, y: 200, label: '', isIntersection: true },

    'grid-200-500': { x: 200, y: 500, label: '', isIntersection: true },
    'grid-300-500': { x: 300, y: 500, label: '', isIntersection: true },
    'grid-500-500': { x: 500, y: 500, label: '', isIntersection: true },
    'grid-600-500': { x: 600, y: 500, label: '', isIntersection: true },
};

// Definition der Straßensegmente (Verbindungen zwischen Knoten)
// Jedes Segment hat eine ID, die IDs der verbundenen Knoten und eine Kosteninformation
const roads = [
    // Horizontal roads
    { id: 'r_100_100-200_100', from: 'grid-100-100', to: 'node-1', cost: 10 },
    { id: 'r_200_100-300_100', from: 'node-1', to: 'grid-300-100', cost: 10 },
    { id: 'r_300_100-400_100', from: 'grid-300-100', to: 'grid-400-100', cost: 10 },
    { id: 'r_400_100-500_100', from: 'grid-400-100', to: 'node-10', cost: 10 },
    { id: 'r_500_100-600_100', from: 'node-10', to: 'node-2', cost: 10 },
    { id: 'r_600_100-700_100', from: 'node-2', to: 'grid-700-100', cost: 10 },

    { id: 'r_100_200-200_200', from: 'node-3', to: 'grid-200-200', cost: 10 },
    { id: 'r_200_200-300_200', from: 'grid-200-200', to: 'grid-300-200', cost: 10 },
    { id: 'r_300_200-400_200', from: 'grid-300-200', to: 'grid-400-200', cost: 10 },
    { id: 'r_400_200-500_200', from: 'grid-400-200', to: 'node-10', cost: 10 }, // Connects to node-10
    { id: 'r_500_200-600_200', from: 'node-10', to: 'grid-600-200', cost: 10 }, // Connects from node-10
    { id: 'r_600_200-700_200', from: 'grid-600-200', to: 'node-4', cost: 10 },

    { id: 'r_100_300-200_300', from: 'grid-100-300', to: 'grid-200-300', cost: 10 },
    { id: 'r_200_300-400_300', from: 'grid-200-300', to: 'warehouse', cost: 10 },
    { id: 'r_400_300-500_300', from: 'warehouse', to: 'grid-500-300', cost: 10 },
    { id: 'r_500_300-600_300', from: 'grid-500-300', to: 'grid-600-300', cost: 10 },
    { id: 'r_600_300-700_300', from: 'grid-600-300', to: 'grid-700-300', cost: 10 },

    { id: 'r_100_400-200_400', from: 'grid-100-400', to: 'node-5', cost: 10 },
    { id: 'r_200_400-300_400', from: 'node-5', to: 'grid-300-400', cost: 10 },
    { id: 'r_300_400-400_400', from: 'grid-300-400', to: 'grid-400-400', cost: 10 },
    { id: 'r_400_400-500_400', from: 'grid-400-400', to: 'grid-500-400', cost: 10 },
    { id: 'r_500_400-600_400', from: 'grid-500-400', to: 'node-6', cost: 10 },
    { id: 'r_600_400-700_400', from: 'node-6', to: 'grid-700-400', cost: 10 },

    { id: 'r_100_500-200_500', from: 'node-7', to: 'grid-200-500', cost: 10 },
    { id: 'r_200_500-300_500', from: 'grid-200-500', to: 'grid-300-500', cost: 10 },
    { id: 'r_300_500-400_500', from: 'grid-300-500', to: 'node-8', cost: 10 },
    { id: 'r_400_500-500_500', from: 'node-8', to: 'grid-500-500', cost: 10 },
    { id: 'r_500_500-600_500', from: 'grid-500-500', to: 'grid-600-500', cost: 10 },
    { id: 'r_600_500-700_500', from: 'grid-600-500', to: 'node-9', cost: 10 },

    // Vertical roads
    { id: 'r_100_100-100_200', from: 'grid-100-100', to: 'node-3', cost: 10 },
    { id: 'r_100_200-100_300', from: 'node-3', to: 'grid-100-300', cost: 10 },
    { id: 'r_100_300-100_400', from: 'grid-100-300', to: 'grid-100-400', cost: 10 },
    { id: 'r_100_400-100_500', from: 'grid-100-400', to: 'node-7', cost: 10 },

    { id: 'r_200_100-200_200', from: 'node-1', to: 'grid-200-200', cost: 10 },
    { id: 'r_200_200-200_300', from: 'grid-200-200', to: 'grid-200-300', cost: 10 },
    { id: 'r_200_300-200_400', from: 'grid-200-300', to: 'node-5', cost: 10 },
    { id: 'r_200_400-200_500', from: 'node-5', to: 'grid-200-500', cost: 10 },

    { id: 'r_300_100-300_200', from: 'grid-300-100', to: 'grid-300-200', cost: 10 },
    { id: 'r_300_200-300_300', from: 'grid-300-200', to: 'grid-300-300', cost: 10 },
    { id: 'r_300_300-300_400', from: 'grid-300-300', to: 'grid-300-400', cost: 10 },
    { id: 'r_300_400-300_500', from: 'grid-300-400', to: 'grid-300-500', cost: 10 },

    { id: 'r_400_100-400_200', from: 'grid-400-100', to: 'grid-400-200', cost: 10 },
    { id: 'r_400_200-400_300', from: 'grid-400-200', to: 'warehouse', cost: 10 },
    { id: 'r_400_300-400_400', from: 'warehouse', to: 'grid-400-400', cost: 10 },
    { id: 'r_400_400-400_500', from: 'grid-400-400', to: 'node-8', cost: 10 },

    { id: 'r_500_100-500_200', from: 'node-10', to: 'grid-500-300', cost: 10 }, // Connects node-10 to grid
    { id: 'r_500_200-500_300', from: 'grid-500-100', to: 'grid-500-300', cost: 10 }, // This was wrong, corrected to grid-500-100
    { id: 'r_500_300-500_400', from: 'grid-500-300', to: 'grid-500-400', cost: 10 },
    { id: 'r_500_400-500_500', from: 'grid-500-400', to: 'grid-500-500', cost: 10 },

    { id: 'r_600_100-600_200', from: 'node-2', to: 'grid-600-200', cost: 10 }, // Connects node-2 to grid
    { id: 'r_600_200-600_300', from: 'grid-600-200', to: 'grid-600-300', cost: 10 },
    { id: 'r_600_300-600_400', from: 'grid-600-300', to: 'node-6', cost: 10 },
    { id: 'r_600_400-600_500', from: 'node-6', to: 'grid-600-500', cost: 10 },

    { id: 'r_700_100-700_200', from: 'grid-700-100', to: 'node-4', cost: 10 }, // Connects grid-700-100 to node-4
    { id: 'r_700_200-700_300', from: 'node-4', to: 'grid-700-300', cost: 10 },
    { id: 'r_700_300-700_400', from: 'grid-700-300', to: 'grid-700-400', cost: 10 },
    { id: 'r_700_400-700_500', from: 'grid-700-400', to: 'node-9', cost: 10 }
];


// Aufgaben-Definitionen (unverändert)
const tasks = {
    task0: { // Aufgabe für das Lager (Warehouse)
        title: "Lager: Start der Tour",
        description: "Willkommen im Lager! Ihre heutige Tour beginnt hier. Überprüfen Sie Ihr Fahrzeug und Ihre Ladung, bevor Sie losfahren.",
        options: [
            { text: "Fahrzeugcheck und Ladungssicherung prüfen", isCorrect: true },
            { text: "Sofort losfahren, keine Zeit verlieren", isCorrect: false }
        ],
        points: 50,
        isDeliveryNode: false // Dies ist kein Zustellpunkt
    },
    task1: {
        title: "Ladungssicherung: Grundlagen",
        description: "Sie müssen 5 Paletten auf einem LKW sichern. Welche Methode ist am effektivsten, um ein Verrutschen während der Fahrt zu verhindern?",
        options: [
            { text: "Nur Formschluss (bündiges Laden)", isCorrect: true },
            { text: "Nur Kraftschluss (Spanngurte über die Ladung)", isCorrect: false },
            { text: "Ladung nur auf die Ladefläche stellen", isCorrect: false }
        ],
        points: 100,
        isDeliveryNode: true
    },
    task2: {
        title: "Gefahrgut: Kennzeichnung",
        description: "Ein LKW transportiert brennbare Flüssigkeiten. Welches Gefahrgutsymbol muss am Fahrzeug angebracht sein?",
        options: [
            { text: "Flamme (Klasse 3)", isCorrect: true },
            { text: "Totenkopf (Klasse 6.1)", isCorrect: false },
            { text: "Explodierende Bombe (Klasse 1)", isCorrect: false }
        ],
        points: 150,
        isDeliveryNode: true
    },
    task3: {
        title: "Erste Hilfe: Unfall auf dem Betriebsgelände",
        description: "Ein Kollege hat sich bei der Arbeit am Arm verletzt und blutet stark. Was ist Ihre erste Maßnahme?",
        options: [
            { text: "Wunde mit Wasser reinigen", isCorrect: false },
            { text: "Druckverband anlegen", isCorrect: true },
            { text: "Auf den Rettungsdienst warten", isCorrect: false }
        ],
        points: 120,
        isDeliveryNode: true
    },
    task4: {
        title: "Kundenkommunikation: Beschwerde",
        description: "Ein Kunde ruft verärgert an, weil seine Lieferung verspätet ist. Wie reagieren Sie am besten?",
        options: [
            { text: "Die Schuld auf den Fahrer schieben", isCorrect: false },
            { text: "Dem Kunden sofort eine Gutschrift anbieten", isCorrect: false },
            { text: "Empathie zeigen, Problem verstehen und Lösung anbieten", isCorrect: true }
        ],
        points: 130,
        isDeliveryNode: true
    },
    task5: {
        title: "Routenoptimierung: Stau",
        description: "Auf Ihrer geplanten Route gibt es einen unerwarteten Stau. Was sollten Sie tun?",
        options: [
            { text: "Warten, bis der Stau sich auflöst", isCorrect: false },
            { text: "Eine alternative Route prüfen und ggf. umplanen", isCorrect: true },
            { text: "Die Lieferung abbrechen und zum Depot zurückkehren", isCorrect: false }
        ],
        points: 110,
        isDeliveryNode: true
    },
    task6: {
        title: "Lagerlogistik: Kommissionierung",
        description: "Sie müssen mehrere Artikel für einen Kundenauftrag kommissionieren. Wie minimieren Sie die Wegstrecken im Lager?",
        options: [
            { text: "Artikel in zufälliger Reihenfolge entnehmen", isCorrect: false },
            { text: "Eine optimierte Kommissionierstrategie (z.B. S-Form) anwenden", isCorrect: true },
            { text: "Immer den kürzesten Weg zum nächsten Artikel wählen, egal wo er ist", isCorrect: false }
        ],
        points: 140,
        isDeliveryNode: true
    },
    task7: {
        title: "Transportmanagement: Lenk- und Ruhezeiten",
        description: "Sie sind als LKW-Fahrer unterwegs und nähern sich dem Ende Ihrer maximalen Lenkzeit. Was ist die korrekte Vorgehensweise?",
        options: [
            { text: "Einfach weiterfahren, um die Lieferung pünktlich zu erreichen", isCorrect: false },
            { text: "Den nächstgelegenen sicheren Parkplatz anfahren und die vorgeschriebene Ruhezeit einhalten", isCorrect: true },
            { text: "Den Disponenten anrufen und um eine Ausnahmegenehmigung bitten", isCorrect: false }
        ],
        points: 160,
        isDeliveryNode: true
    },
    task8: {
        title: "Nachhaltige Logistik: Kraftstoffverbrauch",
        description: "Welche Maßnahme trägt am effektivsten zur Reduzierung des Kraftstoffverbrauchs bei LKW bei?",
        options: [
            { text: "Häufiges Beschleunigen und Bremsen", isCorrect: false },
            { text: "Regelmäßige Wartung des Fahrzeugs und vorausschauende Fahrweise", isCorrect: true },
            { text: "Fahren mit maximaler Geschwindigkeit", isCorrect: false }
        ],
        points: 170,
        isDeliveryNode: true
    },
    task9: {
        title: "Bestandsmanagement: Überprüfung",
        description: "Ein unerwarteter Anstieg der Nachfrage erfordert eine schnelle Bestandsprüfung. Wie stellen Sie sicher, dass die Daten aktuell sind?",
        options: [
            { text: "Manuelle Zählung aller Artikel", isCorrect: false },
            { text: "Nutzung des Lagerverwaltungssystems (LVS) für Echtzeitdaten", isCorrect: true },
            { text: "Schätzung basierend auf Verkaufszahlen der letzten Woche", isCorrect: false }
        ],
        points: 115,
        isDeliveryNode: true
    },
    task10: {
        title: "Supply Chain Transparenz: Sendungsverfolgung",
        description: "Ein wichtiger Kunde fragt nach dem genauen Standort seiner Sendung. Wie können Sie ihm schnell und präzise Auskunft geben?",
        options: [
            { text: "Den Fahrer anrufen und fragen", isCorrect: false },
            { text: "Die Sendungsverfolgung (Tracking & Tracing) im System nutzen", isCorrect: true },
            { text: "Dem Kunden sagen, dass die Sendung 'unterwegs' ist", isCorrect: false }
        ],
        points: 125,
        isDeliveryNode: true
    }
};


// Initialisiert das Spiel in den Startzustand
function initializeGame() {
    earnedCredit = 0;
    remainingBudget = 1000; // Startbudget
    visitedDeliveryNodes = [];
    currentPositionNodeId = null;
    activeTask = null;
    gameStarted = false;
    currentPathSegments = []; // Zurücksetzen der genutzten Segmente

    earnedCreditDisplay.textContent = earnedCredit;
    remainingBudgetDisplay.textContent = remainingBudget;
    visitedDeliveryNodesCountDisplay.textContent = visitedDeliveryNodes.length;
    totalDeliveryNodesCountDisplay.textContent = totalDeliveryNodes;

    // Entfernt alle dynamisch hinzugefügten Elemente (Straßen und Knoten)
    gameMap.innerHTML = '<rect x="0" y="0" width="800" height="600" fill="#007bff" rx="24"></rect>'; // Hintergrund beibehalten

    drawMapElements(); // Zeichnet Straßen und Knoten neu

    // Setzt den Lager-Knoten als aktive Startposition zurück
    const warehouseNodeCircle = document.getElementById('node-circle-warehouse');
    if (warehouseNodeCircle) {
        warehouseNodeCircle.classList.remove('current-position', 'visited');
        warehouseNodeCircle.classList.add('warehouse-node-circle'); // Stellt sicher, dass die Lagerfarbe wieder da ist
    }

    gameMap.classList.add('map-disabled');
    disableMapInteractions(); // Deaktiviert Klicks auf Karte und Linien

    gameOverModal.style.display = 'none';
    taskModal.style.display = 'none';
    startScreenOverlay.style.display = 'flex';
    hideMessage(); // Meldungsfeld beim Start ausblenden
}

// Zeichnet alle Knoten und Straßen basierend auf den definierten Daten
function drawMapElements() {
    // Gruppe für Straßen
    const roadsGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    roadsGroup.id = "roads-group";
    gameMap.appendChild(roadsGroup);

    // Gruppe für Knoten und Labels
    const nodesGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    nodesGroup.id = "nodes-group";
    gameMap.appendChild(nodesGroup);

    // Zeichne Straßen
    roads.forEach(road => {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute('x1', nodes[road.from].x);
        line.setAttribute('y1', nodes[road.from].y);
        line.setAttribute('x2', nodes[road.to].x);
        line.setAttribute('y2', nodes[road.to].y);
        line.setAttribute('id', `road-line-${road.id}`);
        line.classList.add('road-segment');
        line.dataset.roadId = road.id;
        line.dataset.fromNode = road.from;
        line.dataset.toNode = road.to;
        roadsGroup.appendChild(line);

        // Füge Event Listener direkt zu den Linien hinzu
        line.addEventListener('click', handleRoadClick);
    });

    // Zeichne Knoten und Labels
    for (const nodeId in nodes) {
        const node = nodes[nodeId];
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute('cx', node.x);
        circle.setAttribute('cy', node.y);
        circle.setAttribute('r', node.isWarehouse ? 20 : (node.isIntersection ? 5 : 15)); // Größer für Lager, kleiner für Kreuzungen
        circle.setAttribute('id', `node-circle-${nodeId}`);
        circle.classList.add('node-circle');
        if (node.isWarehouse) {
            circle.classList.add('warehouse-node-circle');
        }
        // Kreuzungspunkte sollen nicht direkt anklickbar sein, nur über Straßen
        if (node.isIntersection) {
            circle.style.pointerEvents = 'none';
            circle.style.fill = '#0056b3'; // Farbe für Kreuzungspunkte
            circle.style.stroke = '#0056b3';
        } else {
            circle.addEventListener('click', handleNodeClick); // Nur Zustellpunkte und Lager sind direkt klickbar
        }
        nodesGroup.appendChild(circle);

        if (node.label) {
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute('x', node.x);
            text.setAttribute('y', node.y + (node.isWarehouse ? 30 : 25)); // Label unter dem Knoten
            text.classList.add('node-label');
            text.textContent = node.label;
            nodesGroup.appendChild(text);
        }
    }
}

// Aktiviert/Deaktiviert Klicks auf Straßen und Knoten
function enableMapInteractions() {
    gameMap.classList.remove('map-disabled');
    document.querySelectorAll('.road-segment').forEach(line => {
        line.style.pointerEvents = 'auto';
    });
    // Nur Zustellpunkte und Lager sollen direkt klickbar sein, Kreuzungen nicht
    for (const nodeId in nodes) {
        const node = nodes[nodeId];
        if (!node.isIntersection) {
            document.getElementById(`node-circle-${nodeId}`).style.pointerEvents = 'auto';
        }
    }
}

function disableMapInteractions() {
    gameMap.classList.add('map-disabled');
    document.querySelectorAll('.road-segment').forEach(line => {
        line.style.pointerEvents = 'none';
    });
    document.querySelectorAll('.node-circle').forEach(circle => {
        circle.style.pointerEvents = 'none';
    });
}

// Startet das eigentliche Spiel nach dem Klick auf "Spiel starten"
function startGame() {
    gameStarted = true;
    startScreenOverlay.style.display = 'none';
    enableMapInteractions();

    // Setzt den Lager-Knoten als aktive Startposition
    currentPositionNodeId = 'warehouse';
    const warehouseNodeCircle = document.getElementById('node-circle-warehouse');
    warehouseNodeCircle.classList.add('current-position');
    
    showMessage("Ihre Tour beginnt im Lager. Wählen Sie ein verbundenes Straßensegment, um zu starten.", "info");
    // Zeigt die Aufgabe für das Lager direkt an
    showTaskModal(currentPositionNodeId); 
}

// Behandelt den Klick auf ein Straßensegment
function handleRoadClick(event) {
    if (!gameStarted) return;

    const clickedRoadLine = event.target;
    const roadId = clickedRoadLine.dataset.roadId;
    const fromNodeId = clickedRoadLine.dataset.fromNode;
    const toNodeId = clickedRoadLine.dataset.toNode;

    // Überprüfen, ob das geklickte Segment mit der aktuellen Position verbunden ist
    let nextNodeId = null;
    if (fromNodeId === currentPositionNodeId) {
        nextNodeId = toNodeId;
    } else if (toNodeId === currentPositionNodeId) {
        nextNodeId = fromNodeId;
    } else {
        showMessage("Bitte wählen Sie ein Straßensegment, das mit Ihrem aktuellen Standort verbunden ist.", "error");
        return;
    }

    // Prüfen, ob das Segment bereits Teil des aktuellen Pfades ist (keine Rückwärtsbewegung auf demselben Segment)
    // Dies ist eine einfache Prüfung, komplexere Routenplanung würde dies anders handhaben
    if (currentPathSegments.includes(roadId)) {
        showMessage("Dieses Straßensegment wurde bereits befahren. Wählen Sie ein neues Segment.", "error");
        return;
    }

    // Wenn alle Zustellpunkte besucht sind, muss der nächste Klick das Lager sein
    if (visitedDeliveryNodes.length === totalDeliveryNodes && nextNodeId !== 'warehouse') {
        showMessage("Alle Zustellpunkte wurden besucht! Sie müssen nun zum Lager zurückkehren, um die Tour abzuschließen.", "error");
        return;
    }

    // Segment als Teil des Pfades markieren
    clickedRoadLine.classList.add('active-path');
    currentPathSegments.push(roadId);

    // Kosten des Segments vom Budget abziehen
    const roadCost = roads.find(r => r.id === roadId).cost;
    remainingBudget -= roadCost;
    updateRemainingBudgetDisplay();

    // Aktuelle Position aktualisieren
    const prevNodeCircle = document.getElementById(`node-circle-${currentPositionNodeId}`);
    if (prevNodeCircle) {
        prevNodeCircle.classList.remove('current-position');
        // Vorheriger Knoten bleibt besucht, wenn er ein Zustellpunkt war
        if (nodes[currentPositionNodeId] && nodes[currentPositionNodeId].isDeliveryNode && !visitedDeliveryNodes.includes(currentPositionNodeId)) {
             // Dies wird jetzt im handleSubmitTask() gemacht, wenn die Aufgabe gelöst wird
        }
    }

    currentPositionNodeId = nextNodeId;
    const nextNodeCircle = document.getElementById(`node-circle-${currentPositionNodeId}`);
    if (nextNodeCircle) {
        nextNodeCircle.classList.add('current-position');
    }

    showMessage(`Sie sind nach ${nodes[currentPositionNodeId].label || 'einer Kreuzung'} gefahren. Kosten: ${roadCost}€`, "info");

    // Wenn der neue Knoten ein Zustellpunkt oder das Lager ist, Aufgabe anzeigen
    if (nodes[currentPositionNodeId] && nodes[currentPositionNodeId].taskId) {
        // Nur wenn der Knoten ein Zustellpunkt ist und noch nicht besucht wurde, oder es das Lager ist
        if (nodes[currentPositionNodeId].isDeliveryNode && !document.getElementById(`node-circle-${currentPositionNodeId}`).classList.contains('visited')) {
            showTaskModal(currentPositionNodeId);
        } else if (nodes[currentPositionNodeId].isWarehouse && visitedDeliveryNodes.length === totalDeliveryNodes) {
            // Lager als Endpunkt der Tour
            showTaskModal(currentPositionNodeId);
        } else if (nodes[currentPositionNodeId].isWarehouse && visitedDeliveryNodes.length < totalDeliveryNodes) {
            // Lager besucht, aber nicht alle Zustellpunkte, Spieler muss weiterfahren
            showMessage("Sie sind zum Lager zurückgekehrt, aber es gibt noch unbesuchte Zustellpunkte!", "error");
            // Hier könnte man eine Strafe verhängen
        } else {
            // Knoten ist bereits besuchter Zustellpunkt oder Kreuzung ohne Aufgabe
            showMessage("Wählen Sie das nächste Straßensegment.", "info");
        }
    } else {
        // Knoten ist eine reine Kreuzung ohne Aufgabe
        showMessage("Sie sind an einer Kreuzung. Wählen Sie das nächste Straßensegment.", "info");
    }
    updateVisitedNodesDisplay(); // Aktualisiere die Anzeige der besuchten Zustellpunkte
}

// Behandelt den Klick auf einen Knoten (nur für Zustellpunkte und Lager)
function handleNodeClick(event) {
    if (!gameStarted) return;

    const clickedNodeCircle = event.target;
    const nodeId = clickedNodeCircle.dataset.nodeId;

    // Wenn es der aktuelle Knoten ist, zeige die Aufgabe erneut an
    if (nodeId === currentPositionNodeId) {
        showTaskModal(nodeId);
    } else {
        // Wenn ein anderer Knoten direkt angeklickt wird, aber nicht über eine Straße
        showMessage("Bitte wählen Sie ein Straßensegment, um sich zu bewegen, oder klicken Sie auf Ihren aktuellen Standort für die Aufgabe.", "error");
    }
}


// Aktualisiert die Anzeige des Verdienten Guthabens
function updateEarnedCreditDisplay() {
    earnedCreditDisplay.textContent = earnedCredit;
}

// Aktualisiert die Anzeige des Verbleibenden Budgets
function updateRemainingBudgetDisplay() {
    remainingBudgetDisplay.textContent = remainingBudget;
}

// Aktualisiert die Anzeige der besuchten Zustellpunkte
function updateVisitedNodesDisplay() {
    visitedDeliveryNodesCountDisplay.textContent = visitedDeliveryNodes.length;
}

// Zeigt eine Nachricht im Meldungsfeld an
function showMessage(msg, type = "info") {
    messageField.textContent = msg;
    messageField.classList.remove('hidden', 'bg-red-100', 'border-red-300', 'text-red-800', 'bg-green-100', 'border-green-300', 'text-green-800', 'bg-blue-100', 'border-blue-300', 'text-blue-800');
    if (type === "error") {
        messageField.classList.add('bg-red-100', 'border-red-300', 'text-red-800');
    } else if (type === "success") {
        messageField.classList.add('bg-green-100', 'border-green-300', 'text-green-800');
    } else {
        messageField.classList.add('bg-blue-100', 'border-blue-300', 'text-blue-800');
    }
    // Nachricht nach 5 Sekunden ausblenden
    setTimeout(hideMessage, 5000);
}

// Blendet die Nachricht aus dem Meldungsfeld aus
function hideMessage() {
    messageField.classList.add('hidden');
}

// Zeigt das Aufgaben-Modal an
function showTaskModal(nodeId) {
    const nodeData = nodes[nodeId];
    const taskId = nodeData.taskId;
    activeTask = tasks[taskId];

    if (!activeTask) {
        console.error('Keine Aufgabe für diesen Knoten gefunden:', nodeId);
        showMessage("Fehler: Keine Aufgabe für diesen Knoten definiert.", "error");
        return;
    }

    modalTitle.textContent = activeTask.title;
    modalDescription.textContent = activeTask.description;
    taskOptions.innerHTML = ''; // Alte Optionen entfernen
    feedbackMessage.textContent = '';
    feedbackMessage.classList.remove('feedback-correct', 'feedback-incorrect');
    submitTaskBtn.classList.remove('hidden');
    nextTaskBtn.classList.add('hidden');

    activeTask.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'flex items-center p-3 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors';
        optionDiv.innerHTML = `
            <input type="radio" id="option${index}" name="taskOption" value="${index}" class="form-radio h-5 w-5 text-blue-600">
            <label for="option${index}" class="ml-3 text-gray-700 text-base">${option.text}</label>
        `;
        taskOptions.appendChild(optionDiv);
    });

    taskModal.style.display = 'flex'; // Modal anzeigen
}

// Überprüft die ausgewählte Antwort
function handleSubmitTask() {
    const selectedOption = document.querySelector('input[name="taskOption"]:checked');
    if (!selectedOption) {
        feedbackMessage.textContent = 'Bitte wählen Sie eine Antwort aus.';
        feedbackMessage.classList.add('feedback-incorrect');
        return;
    }

    const selectedIndex = parseInt(selectedOption.value);
    if (activeTask.options[selectedIndex].isCorrect) {
        earnedCredit += activeTask.points;
        feedbackMessage.textContent = `Richtig! +${activeTask.points} Punkte.`;
        feedbackMessage.classList.remove('feedback-incorrect');
        feedbackMessage.classList.add('feedback-correct');

        // Markiere den Knoten als besucht
        const nodeCircle = document.getElementById(`node-circle-${currentPositionNodeId}`);
        nodeCircle.classList.remove('current-position'); // Nicht mehr die aktuelle Position
        nodeCircle.classList.add('visited'); // Als besucht markieren
        
        // Lagerknoten behält seine spezielle Farbe, wenn er besucht ist, Zustellpunkte werden grün
        if (nodes[currentPositionNodeId].isWarehouse) {
            nodeCircle.style.fill = '#dc3545'; // Lagerfarbe beibehalten, wenn besucht
        } else {
            nodeCircle.style.fill = '#28a745'; // Grün für besuchte Zustellpunkte
        }

        // Füge den abgeschlossenen Zustellpunkt zur Liste hinzu, wenn es kein Lager ist
        if (activeTask.isDeliveryNode && !visitedDeliveryNodes.includes(currentPositionNodeId)) {
            visitedDeliveryNodes.push(currentPositionNodeId);
        }
        updateEarnedCreditDisplay();
        updateVisitedNodesDisplay();

        submitTaskBtn.classList.add('hidden');
        nextTaskBtn.classList.remove('hidden');
        showMessage("Aufgabe erfolgreich abgeschlossen!", "success");

        // Nach erfolgreicher Aufgabe, den Spieler zum nächsten Schritt anleiten
        if (nodes[currentPositionNodeId].isWarehouse && visitedDeliveryNodes.length === totalDeliveryNodes) {
            // Tour beendet
            nextTaskBtn.textContent = "Tour abschließen";
            showMessage("Alle Zustellpunkte wurden besucht! Kehren Sie zum Lager zurück, um die Tour abzuschließen.", "info");
        } else if (nodes[currentPositionNodeId].isWarehouse && visitedDeliveryNodes.length < totalDeliveryNodes) {
            // Lager besucht, aber nicht alle Zustellpunkte, Spieler muss weiterfahren
            nextTaskBtn.textContent = "Nächste Aufgabe";
            showMessage("Sie haben das Lager besucht, aber es gibt noch unbesuchte Zustellpunkte. Fahren Sie fort!", "info");
        } else {
            nextTaskBtn.textContent = "Nächste Aufgabe";
            showMessage("Wählen Sie das nächste Straßensegment.", "info");
        }

    } else {
        // Bei falscher Antwort
        feedbackMessage.textContent = 'Leider falsch. Versuchen Sie es noch einmal!';
        feedbackMessage.classList.remove('feedback-correct');
        feedbackMessage.classList.add('feedback-incorrect');
        showMessage("Antwort ist leider falsch. Versuchen Sie es erneut.", "error");
    }
}

// Geht zur nächsten Aufgabe oder schließt das Modal
function handleNextTask() {
    taskModal.style.display = 'none'; // Modal schließen
    activeTask = null; // Aktive Aufgabe zurücksetzen

    // Überprüfen, ob alle Zustellpunkte besucht und die Tour im Lager beendet wurde
    if (nodes[currentPositionNodeId].isWarehouse && visitedDeliveryNodes.length === totalDeliveryNodes) {
        showGameOverModal();
    }
}

// Zeigt das Spielende-Modal an
function showGameOverModal() {
    gameOverModal.style.display = 'flex';
    finalScoreDisplay.textContent = earnedCredit;
    showMessage("Tour erfolgreich abgeschlossen! Spiel beendet.", "success");
}


// Event Listener für Spiel zurücksetzen
resetGameBtn.addEventListener('click', initializeGame);
restartGameBtn.addEventListener('click', initializeGame);

// Event Listener für den Start-Button
startGameBtn.addEventListener('click', startGame);

// Initialisiert das Spiel beim Laden der Seite
document.addEventListener('DOMContentLoaded', initializeGame);