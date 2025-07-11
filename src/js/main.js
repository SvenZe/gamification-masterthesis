// main.js

// Debugging: Bestätigen, dass das Skript geladen wird
console.log("main.js wird geladen und ausgeführt.");

// Spielzustand
let earnedCredit = 0; // Verdientes Guthaben (wird im Hintergrund berechnet)
let remainingBudget = 20000; // Verbleibendes Budget, initial 20000 € wie im HTML
let visitedDeliveryNodes = []; // Besuchte Zustellpunkte (nur die 10 Stationen)
let currentPositionNodeId = null; // Aktueller Standort des Spielers (ID des Knotens)
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

// Task Modal Elemente (wurden aus HTML entfernt, Referenzen hier zur Sicherheit auskommentiert/entfernt)
// Da das task-modal nicht mehr im HTML ist, müssen diese Referenzen entfernt werden,
// da sie sonst zu Fehlern führen, wenn das Skript versucht, auf nicht-existente Elemente zuzugreifen.
// const taskModal = document.getElementById('task-modal'); // ENTFERNT
// const closeModalBtn = document.getElementById('close-modal'); // ENTFERNT
// const modalTitle = document.getElementById('modal-title'); // ENTFERNT
// const modalDescription = document.getElementById('modal-description'); // ENTFERNT
// const taskOptions = document.getElementById('task-options'); // ENTFERNT
// const submitTaskBtn = document.getElementById('submit-task-btn'); // ENTFERNT
// const nextTaskBtn = document.getElementById('next-task-btn'); // ENTFERNT
// const feedbackMessage = document.getElementById('feedback-message'); // ENTFERNT

const gameOverModal = document.getElementById('game-over-modal');
const finalScoreDisplay = document.getElementById('final-score');
const restartGameBtn = document.getElementById('restart-game-btn');

const startScreenOverlay = document.getElementById('start-screen-overlay');
const startGameBtn = document.getElementById('start-game-btn');

const messageField = document.getElementById('message-field');

// Chatbot DOM-Elemente
const openChatBtn = document.getElementById('open-chat-btn');
const chatModal = document.getElementById('chat-modal');
const closeChatModalBtn = document.getElementById('close-chat-modal');
const chatHistoryElement = document.getElementById('chat-history');
const chatInput = document.getElementById('chat-input');
const sendChatBtn = document.getElementById('send-chat-btn');
const chatLoading = document.getElementById('chat-loading');


// Definition der Knotenpunkte und ihrer Eigenschaften
const nodes = {
    'warehouse': { x: 400, y: 300, label: 'Lager', isWarehouse: true },
    'node-1': { x: 200, y: 100, label: 'Zustellpunkt 1' },
    'node-2': { x: 600, y: 100, label: 'Zustellpunkt 2' },
    'node-3': { x: 100, y: 200, label: 'Zustellpunkt 3' },
    'node-4': { x: 700, y: 200, label: 'Zustellpunkt 4' },
    'node-5': { x: 200, y: 400, label: 'Zustellpunkt 5' },
    'node-6': { x: 600, y: 400, label: 'Zustellpunkt 6' },
    'node-7': { x: 100, y: 500, label: 'Zustellpunkt 7' },
    'node-8': { x: 400, y: 500, label: 'Zustellpunkt 8' },
    'node-9': { x: 700, y: 500, label: 'Zustellpunkt 9' },
    'node-10': { x: 500, y: 200, label: 'Zustellpunkt 10' },
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
    { id: 'r_400_200-500_200', from: 'grid-400-200', to: 'node-10', cost: 10 },
    { id: 'r_500_200-600_200', from: 'node-10', to: 'grid-600-200', cost: 10 },
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

    { id: 'r_500_100-500_200', from: 'node-10', to: 'grid-500-300', cost: 10 },
    { id: 'r_500_200-500_300', from: 'grid-500-100', to: 'grid-500-300', cost: 10 },
    { id: 'r_500_300-500_400', from: 'grid-500-300', to: 'grid-500-400', cost: 10 },
    { id: 'r_500_400-500_500', from: 'grid-500-400', to: 'grid-500-500', cost: 10 },

    { id: 'r_600_100-600_200', from: 'node-2', to: 'grid-600-200', cost: 10 },
    { id: 'r_600_200-600_300', from: 'grid-600-200', to: 'grid-600-300', cost: 10 },
    { id: 'r_600_300-600_400', from: 'grid-600-300', to: 'node-6', cost: 10 },
    { id: 'r_600_400-600_500', from: 'node-6', to: 'grid-600-500', cost: 10 },

    { id: 'r_700_100-700_200', from: 'grid-700-100', to: 'node-4', cost: 10 },
    { id: 'r_700_200-700_300', from: 'node-4', to: 'grid-700-300', cost: 10 },
    { id: 'r_700_300-700_400', from: 'grid-700-300', to: 'grid-700-400', cost: 10 },
    { id: 'r_700_400-700_500', from: 'grid-700-400', to: 'node-9', cost: 10 }
];


// Initialisiert das Spiel in den Startzustand
function initializeGame() {
    console.log("initializeGame() wird aufgerufen."); // Debug-Log
    earnedCredit = 0;
    remainingBudget = 20000; // Startbudget, initial 20000 € wie im HTML
    visitedDeliveryNodes = [];
    currentPositionNodeId = null;
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

    // Setzt alle Knotenfarben zurück, falls sie zuvor geändert wurden
    for (const nodeId in nodes) {
        const node = nodes[nodeId];
        const circle = document.getElementById(`node-circle-${nodeId}`);
        if (circle) {
            circle.classList.remove('current-position', 'visited');
            if (node.isWarehouse) {
                circle.style.fill = '#dc3545'; // Lagerfarbe
            } else if (node.isIntersection) {
                circle.style.fill = '#0056b3'; // Kreuzungspunkte
            } else {
                circle.style.fill = '#ffffff'; // Zustellpunkte
            }
        }
    }


    gameMap.classList.add('map-disabled');
    disableMapInteractions(); // Deaktiviert Klicks auf Karte und Linien

    gameOverModal.style.display = 'none';
    // taskModal.style.display = 'none'; // Taskmodal wurde entfernt
    chatModal.style.display = 'none'; // Chatmodal beim Start ausblenden
    startScreenOverlay.style.display = 'flex';
    messageField.classList.add('hidden'); // Meldungsfeld beim Start ausblenden
}

// Zeichnet alle Knoten und Straßen basierend auf den definierten Daten
function drawMapElements() {
    console.log("drawMapElements() wird aufgerufen."); // Debug-Log
    // Gruppe für Straßen
    const roadsGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    roadsGroup.id = "roads-group";
    gameMap.appendChild(roadsGroup);
    console.log("Roads group hinzugefügt:", roadsGroup); // Debug-Log

    // Gruppe für Knoten und Labels
    const nodesGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    nodesGroup.id = "nodes-group";
    gameMap.appendChild(nodesGroup);
    console.log("Nodes group hinzugefügt:", nodesGroup); // Debug-Log

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
    console.log("Alle Straßen gezeichnet."); // Debug-Log

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
        
        // Kreuzungspunkte sollen nicht direkt anklickbar sein
        if (node.isIntersection) {
            circle.style.pointerEvents = 'none'; // Deaktiviert Klicks auf Kreuzungen
            circle.style.fill = '#0056b3'; // Farbe für Kreuzungspunkte
            circle.style.stroke = '#0056b3';
        } else {
            // Zustellpunkte und Lager sind direkt anklickbar (für Info-Modal)
            circle.addEventListener('click', handleNodeClick);
        }
        nodesGroup.appendChild(circle);

        if (node.label) {
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute('x', node.x);
            text.setAttribute('y', node.y + (node.isWarehouse ? 30 : (node.isIntersection ? 0 : 25))); // Label unter dem Knoten, Kreuzungen kein Label
            text.classList.add('node-label');
            text.textContent = node.label;
            nodesGroup.appendChild(text);
        }
        // console.log("Knoten gezeichnet:", nodeId); // Debug-Log für jeden Knoten
    }
    console.log("Alle Knoten gezeichnet."); // Debug-Log
}

// Aktiviert/Deaktiviert Klicks auf Straßen und Knoten
function enableMapInteractions() {
    console.log("enableMapInteractions() wird aufgerufen."); // Debug-Log
    gameMap.classList.remove('map-disabled');
    document.querySelectorAll('.road-segment').forEach(line => {
        line.style.pointerEvents = 'auto'; // Straßen anklickbar machen
    });
    // Zustellpunkte und Lager sind direkt anklickbar (für Aufgaben/Info)
    for (const nodeId in nodes) {
        const node = nodes[nodeId];
        const circle = document.getElementById(`node-circle-${nodeId}`);
        if (circle && !node.isIntersection) { // Wenn es kein Kreuzungspunkt ist
            circle.style.pointerEvents = 'auto'; // Knoten anklickbar machen
        }
    }
}

function disableMapInteractions() {
    console.log("disableMapInteractions() wird aufgerufen."); // Debug-Log
    gameMap.classList.add('map-disabled');
    document.querySelectorAll('.road-segment').forEach(line => {
        line.style.pointerEvents = 'none'; // Straßen nicht anklickbar machen
    });
    document.querySelectorAll('.node-circle').forEach(circle => {
        circle.style.pointerEvents = 'none'; // Alle Knoten nicht anklickbar machen
    });
}

// Startet das eigentliche Spiel nach dem Klick auf "Spiel starten"
function startGame() {
    console.log("startGame() wird aufgerufen."); // Debug-Log
    gameStarted = true;
    startScreenOverlay.style.display = 'none';
    enableMapInteractions();

    // Setzt den Lager-Knoten als aktive Startposition
    currentPositionNodeId = 'warehouse';
    const warehouseNodeCircle = document.getElementById('node-circle-warehouse');
    warehouseNodeCircle.classList.add('current-position');
    
    showMessage("Ihre Tour beginnt im Lager. Wählen Sie ein verbundenes Straßensegment, um zu starten.", "info");
    // Kein Modal mehr beim Start, nur Nachricht
    // showArrivalModal(currentPositionNodeId); // ENTFERNT
}

// Behandelt den Klick auf ein Straßensegment
function handleRoadClick(event) {
    console.log("handleRoadClick() wird aufgerufen."); // Debug-Log
    if (!gameStarted) return;

    const clickedRoadLine = event.target;
    const roadId = clickedRoadLine.dataset.roadId;
    const fromNodeId = clickedRoadLine.dataset.fromNode;
    const toNodeId = clicked_RoadLine.dataset.toNode; // Korrektur: to_NodeId -> toNodeId

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
    }

    currentPositionNodeId = nextNodeId;
    const nextNodeCircle = document.getElementById(`node-circle-${currentPositionNodeId}`);
    if (nextNodeCircle) {
        nextNodeCircle.classList.add('current-position');
    }

    showMessage(`Sie sind nach ${nodes[currentPositionNodeId].label || 'einer Kreuzung'} gefahren. Kosten: ${roadCost}€`, "info");

    // Wenn der neue Knoten ein Zustellpunkt oder das Lager ist
    if (nodes[currentPositionNodeId] && (nodes[currentPositionNodeId].isDeliveryNode || nodes[currentPositionNodeId].isWarehouse)) {
        // Markiere Zustellpunkte als besucht
        if (nodes[currentPositionNodeId].isDeliveryNode && !visitedDeliveryNodes.includes(currentPositionNodeId)) {
            visitedDeliveryNodes.push(currentPositionNodeId);
            const visitedNodeCircle = document.getElementById(`node-circle-${currentPositionNodeId}`);
            if (visitedNodeCircle) {
                visitedNodeCircle.classList.add('visited');
                visitedNodeCircle.style.fill = '#28a745'; // Grün für besuchte Zustellpunkte
            }
            updateVisitedNodesDisplay();
            showMessage(`Zustellpunkt ${nodes[currentPositionNodeId].label} besucht!`, "success");
        } else if (nodes[currentPositionNodeId].isWarehouse && visitedDeliveryNodes.length === totalDeliveryNodes) {
            // Lager als Endpunkt der Tour
            const visitedNodeCircle = document.getElementById(`node-circle-${currentPositionNodeId}`);
            if (visitedNodeCircle) {
                visitedNodeCircle.classList.add('visited');
                visitedNodeCircle.style.fill = '#28a745'; // Grün für das Lager, wenn Tour beendet
            }
            updateVisitedNodesDisplay();
            showGameOverModal(); // Spiel beenden
        } else if (nodes[currentPositionNodeId].isWarehouse && visitedDeliveryNodes.length < totalDeliveryNodes) {
            // Lager besucht, aber nicht alle Zustellpunkte
            showMessage("Sie sind zum Lager zurückgekehrt, aber es gibt noch unbesuchte Zustellpunkte! Fahren Sie fort.", "error");
        } else {
            // Knoten ist bereits besuchter Zustellpunkt
            showMessage("Sie haben diesen Zustellpunkt bereits besucht. Wählen Sie das nächste Straßensegment.", "info");
        }
    } else {
        // Knoten ist eine reine Kreuzung ohne Aufgabe
        showMessage("Sie sind an einer Kreuzung. Wählen Sie das nächste Straßensegment.", "info");
    }
}

// Behandelt den Klick auf einen Knoten (für Info, nicht für Bewegung)
function handleNodeClick(event) {
    console.log("handleNodeClick() wird aufgerufen."); // Debug-Log
    const clickedNodeCircle = event.target;
    const nodeId = clickedNodeCircle.dataset.nodeId;

    // Zeige eine Info-Nachricht, wenn ein Zustellpunkt oder das Lager direkt angeklickt wird
    if (nodes[nodeId] && (nodes[nodeId].isDeliveryNode || nodes[nodeId].isWarehouse)) {
        if (nodeId === currentPositionNodeId) {
            showMessage(`Sie befinden sich am ${nodes[nodeId].label}.`, "info");
        } else if (visitedDeliveryNodes.includes(nodeId)) {
            showMessage(`Sie haben ${nodes[nodeId].label} bereits besucht.`, "info");
        } else {
            showMessage(`Sie müssen sich über die Straßen zu diesem Zustellpunkt bewegen.`, "info");
        }
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
    messageField.classList.remove('hidden'); // Sicherstellen, dass es sichtbar ist

    if (type === "error") {
        messageField.classList.add('bg-red-100', 'border-red-300', 'text-red-800');
    } else if (type === "success") {
        messageField.classList.add('bg-green-100', 'border-green-300', 'text-green-800');
    } else {
        messageField.classList.add('bg-blue-100', 'border-blue-300', 'text-blue-800');
    }
    clearTimeout(messageField.dataset.timeoutId);
    messageField.dataset.timeoutId = setTimeout(hideMessage, 5000);
}

// Blendet die Nachricht aus dem Meldungsfeld aus
function hideMessage() {
    messageField.classList.add('hidden');
}


// Zeigt das Spielende-Modal an
function showGameOverModal() {
    gameOverModal.style.display = 'flex';
    finalScoreDisplay.textContent = earnedCredit;
    showMessage("Tour erfolgreich abgeschlossen! Spiel beendet.", "success");
}

// --- Gemini API Integration (Logistik-Experte Chatbot) ---

let chatHistory = [];

async function sendChatMessage() {
    const userMessage = chatInput.value.trim();
    if (userMessage === "") return;

    appendMessage(userMessage, 'user');
    chatInput.value = '';
    chatLoading.classList.remove('hidden');

    const prompt = `Beantworte die folgende Frage zum Thema Logistik oder Supply Chain Management: ${userMessage}`;

    try {
        const currentChatContent = chatHistory.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        const payload = { contents: currentChatContent };
        const apiKey = "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            const aiResponse = result.candidates[0].content.parts[0].text;
            appendMessage(aiResponse, 'ai');
            chatHistory.push({ sender: 'ai', text: aiResponse });
        } else {
            appendMessage("Entschuldigung, ich konnte keine Antwort generieren. Bitte versuchen Sie es später noch einmal.", 'ai');
        }
    } catch (error) {
        console.error('Fehler beim Aufruf der Gemini API:', error);
        appendMessage("Entschuldigung, es gab ein Problem beim Verbinden mit dem Logistik-Experten. Bitte versuchen Sie es später noch einmal.", 'ai');
    } finally {
        chatLoading.classList.add('hidden');
        chatHistoryElement.scrollTop = chatHistoryElement.scrollHeight;
    }
}

function appendMessage(text, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', sender);
    messageElement.textContent = text;
    chatHistoryElement.appendChild(messageElement);
    chatHistoryElement.scrollTop = chatHistoryElement.scrollHeight;
    if (sender === 'user') {
        chatHistory.push({ sender: 'user', text: text });
    }
}


// --- Event Listener ---

resetGameBtn.addEventListener('click', initializeGame);
restartGameBtn.addEventListener('click', initializeGame);
startGameBtn.addEventListener('click', startGame);
openChatBtn.addEventListener('click', () => {
    chatModal.style.display = 'flex';
    chatInput.focus();
});
closeChatModalBtn.addEventListener('click', () => {
    chatModal.style.display = 'none';
});
sendChatBtn.addEventListener('click', sendChatMessage);
chatInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed. Initializing game.");
    initializeGame();
});