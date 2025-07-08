// script.js

// Spielzustand
let score = 0;
let completedNodes = [];
let currentNode = null;
let activeTask = null;
let nodesData = {}; // Speichert Informationen über alle Knoten
const totalNodes = 8; // Gesamtzahl der Knoten auf der Karte
let gameStarted = false; // Flag, um den Spielstart zu verfolgen

// DOM-Elemente
const scoreDisplay = document.getElementById('score');
const completedNodesCountDisplay = document.getElementById('completed-nodes-count');
const totalNodesCountDisplay = document.getElementById('total-nodes-count');
const gameMap = document.getElementById('game-map');
const nodesGroup = document.getElementById('nodes-group');
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

// Aufgaben-Definitionen
const tasks = {
    task1: {
        title: "Ladungssicherung: Grundlagen",
        description: "Sie müssen 5 Paletten auf einem LKW sichern. Welche Methode ist am effektivsten, um ein Verrutschen während der Fahrt zu verhindern?",
        options: [
            { text: "Nur Formschluss (bündiges Laden)", isCorrect: true },
            { text: "Nur Kraftschluss (Spanngurte über die Ladung)", isCorrect: false },
            { text: "Ladung nur auf die Ladefläche stellen", isCorrect: false }
        ],
        points: 100
    },
    task2: {
        title: "Gefahrgut: Kennzeichnung",
        description: "Ein LKW transportiert brennbare Flüssigkeiten. Welches Gefahrgutsymbol muss am Fahrzeug angebracht sein?",
        options: [
            { text: "Flamme (Klasse 3)", isCorrect: true },
            { text: "Totenkopf (Klasse 6.1)", isCorrect: false },
            { text: "Explodierende Bombe (Klasse 1)", isCorrect: false }
        ],
        points: 150
    },
    task3: {
        title: "Erste Hilfe: Unfall auf dem Betriebsgelände",
        description: "Ein Kollege hat sich bei der Arbeit am Arm verletzt und blutet stark. Was ist Ihre erste Maßnahme?",
        options: [
            { text: "Wunde mit Wasser reinigen", isCorrect: false },
            { text: "Druckverband anlegen", isCorrect: true },
            { text: "Auf den Rettungsdienst warten", isCorrect: false }
        ],
        points: 120
    },
    task4: {
        title: "Kundenkommunikation: Beschwerde",
        description: "Ein Kunde ruft verärgert an, weil seine Lieferung verspätet ist. Wie reagieren Sie am besten?",
        options: [
            { text: "Die Schuld auf den Fahrer schieben", isCorrect: false },
            { text: "Dem Kunden sofort eine Gutschrift anbieten", isCorrect: false },
            { text: "Empathie zeigen, Problem verstehen und Lösung anbieten", isCorrect: true }
        ],
        points: 130
    },
    task5: {
        title: "Routenoptimierung: Stau",
        description: "Auf Ihrer geplanten Route gibt es einen unerwarteten Stau. Was sollten Sie tun?",
        options: [
            { text: "Warten, bis der Stau sich auflöst", isCorrect: false },
            { text: "Eine alternative Route prüfen und ggf. umplanen", isCorrect: true },
            { text: "Die Lieferung abbrechen und zum Depot zurückkehren", isCorrect: false }
        ],
        points: 110
    },
    task6: {
        title: "Lagerlogistik: Kommissionierung",
        description: "Sie müssen mehrere Artikel für einen Kundenauftrag kommissionieren. Wie minimieren Sie die Wegstrecken im Lager?",
        options: [
            { text: "Artikel in zufälliger Reihenfolge entnehmen", isCorrect: false },
            { text: "Eine optimierte Kommissionierstrategie (z.B. S-Form) anwenden", isCorrect: true },
            { text: "Immer den kürzesten Weg zum nächsten Artikel wählen, egal wo er ist", isCorrect: false }
        ],
        points: 140
    },
    task7: {
        title: "Transportmanagement: Lenk- und Ruhezeiten",
        description: "Sie sind als LKW-Fahrer unterwegs und nähern sich dem Ende Ihrer maximalen Lenkzeit. Was ist die korrekte Vorgehensweise?",
        options: [
            { text: "Einfach weiterfahren, um die Lieferung pünktlich zu erreichen", isCorrect: false },
            { text: "Den nächstgelegenen sicheren Parkplatz anfahren und die vorgeschriebene Ruhezeit einhalten", isCorrect: true },
            { text: "Den Disponenten anrufen und um eine Ausnahmegenehmigung bitten", isCorrect: false }
        ],
        points: 160
    },
    task8: {
        title: "Nachhaltige Logistik: Kraftstoffverbrauch",
        description: "Welche Maßnahme trägt am effektivsten zur Reduzierung des Kraftstoffverbrauchs bei LKW bei?",
        options: [
            { text: "Häufiges Beschleunigen und Bremsen", isCorrect: false },
            { text: "Regelmäßige Wartung des Fahrzeugs und vorausschauende Fahrweise", isCorrect: true },
            { text: "Fahren mit maximaler Geschwindigkeit", isCorrect: false }
        ],
        points: 170
    }
};

// Initialisiert das Spiel in den Startzustand
function initializeGame() {
    score = 0;
    completedNodes = [];
    currentNode = null;
    activeTask = null;
    gameStarted = false; // Spiel ist noch nicht gestartet

    // Setzt die Gesamtzahl der Knoten im Display
    totalNodesCountDisplay.textContent = Object.keys(tasks).length;

    // Setzt alle Knoten auf den Anfangszustand zurück
    document.querySelectorAll('.node').forEach(node => {
        node.classList.remove('completed', 'active');
        node.style.fill = '#ffffff'; // Setzt die Farbe zurück
    });

    // Entfernt alle dynamisch hinzugefügten Linien
    const existingLines = gameMap.querySelectorAll('line');
    existingLines.forEach(line => line.remove());

    // Deaktiviert die Karte bis zum Spielstart
    gameMap.classList.add('map-disabled');
    nodesGroup.style.pointerEvents = 'none'; // Deaktiviert Klicks auf Knoten

    updateScoreDisplay();
    updateCompletedNodesDisplay();
    gameOverModal.style.display = 'none';
    taskModal.style.display = 'none';
    startScreenOverlay.style.display = 'flex'; // Startbildschirm anzeigen
}

// Startet das eigentliche Spiel nach dem Klick auf "Spiel starten"
function startGame() {
    gameStarted = true;
    startScreenOverlay.style.display = 'none'; // Startbildschirm ausblenden
    gameMap.classList.remove('map-disabled');
    nodesGroup.style.pointerEvents = 'auto'; // Aktiviert Klicks auf Knoten

    // Setzt den ersten Knoten (Berlin) als aktiv
    const firstNodeElement = document.getElementById('node-berlin');
    firstNodeElement.classList.add('active');
    firstNodeElement.style.fill = '#ffc107'; // Gelb für den Startknoten
    currentNode = firstNodeElement.dataset.nodeId;
    
    // Zeigt direkt die Aufgabe für den Startknoten an
    showTaskModal(currentNode);
}

// Aktualisiert die Anzeige des Punktestands
function updateScoreDisplay() {
    scoreDisplay.textContent = score;
}

// Aktualisiert die Anzeige der abgeschlossenen Knoten
function updateCompletedNodesDisplay() {
    completedNodesCountDisplay.textContent = completedNodes.length;
}

// Zeigt das Aufgaben-Modal an
function showTaskModal(nodeId) {
    const taskId = document.getElementById(`node-${nodeId}`).dataset.taskId;
    activeTask = tasks[taskId];

    if (!activeTask) {
        console.error('Keine Aufgabe für diesen Knoten gefunden:', nodeId);
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
        score += activeTask.points;
        feedbackMessage.textContent = `Richtig! +${activeTask.points} Punkte.`;
        feedbackMessage.classList.remove('feedback-incorrect');
        feedbackMessage.classList.add('feedback-correct');

        // Markiere den Knoten als abgeschlossen
        const nodeElement = document.getElementById(`node-${currentNode}`);
        nodeElement.classList.remove('active');
        nodeElement.classList.add('completed');
        nodeElement.style.fill = '#28a745'; // Grün für abgeschlossen

        // Füge den abgeschlossenen Knoten zur Liste hinzu
        if (!completedNodes.includes(currentNode)) {
            completedNodes.push(currentNode);
        }
        updateScoreDisplay();
        updateCompletedNodesDisplay();

        submitTaskBtn.classList.add('hidden');
        nextTaskBtn.classList.remove('hidden');
    } else {
        feedbackMessage.textContent = 'Leider falsch. Versuchen Sie es noch einmal!';
        feedbackMessage.classList.remove('feedback-correct');
        feedbackMessage.classList.add('feedback-incorrect');
    }
}

// Geht zur nächsten Aufgabe oder schließt das Modal
function handleNextTask() {
    taskModal.style.display = 'none'; // Modal schließen
    activeTask = null; // Aktive Aufgabe zurücksetzen

    // Überprüfen, ob alle Knoten abgeschlossen sind
    if (completedNodes.length === totalNodes) {
        showGameOverModal();
    }
}

// Zeigt das Spielende-Modal an
function showGameOverModal() {
    gameOverModal.style.display = 'flex';
    finalScoreDisplay.textContent = score;
}

// Event Listener für Knoten-Klicks
nodesGroup.addEventListener('click', (event) => {
    if (!gameStarted) return; // Karte ist nicht aktiv, wenn das Spiel nicht gestartet ist

    const target = event.target;
    if (target.tagName === 'CIRCLE' && target.classList.contains('node')) {
        const nodeId = target.dataset.nodeId;

        // Nur wenn der Knoten noch nicht abgeschlossen ist
        if (!target.classList.contains('completed')) {
            // Wenn es nicht der erste Knoten ist, muss eine Route gezeichnet werden
            if (currentNode && nodeId !== currentNode) {
                const prevNodeElement = document.getElementById(`node-${currentNode}`);
                const prevX = prevNodeElement.cx.baseVal.value;
                const prevY = prevNodeElement.cy.baseVal.value;
                const newX = target.cx.baseVal.value;
                const newY = target.cy.baseVal.value;

                // Linie zeichnen
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', prevX);
                line.setAttribute('y1', prevY);
                line.setAttribute('x2', newX);
                line.setAttribute('y2', newY);
                line.setAttribute('stroke', '#ffc107'); // Gelbe Linie
                line.setAttribute('stroke-width', '5');
                gameMap.insertBefore(line, nodesGroup); // Fügt die Linie unter den Knoten ein

                // Aktualisiere den aktiven Knoten
                prevNodeElement.classList.remove('active');
                prevNodeElement.style.fill = '#ffffff'; // Setzt die Farbe des vorherigen Knotens zurück
                target.classList.add('active');
                target.style.fill = '#ffc107'; // Gelb für den aktiven Knoten
                currentNode = nodeId;

                showTaskModal(nodeId);
            } else if (!currentNode) { // Erster Klick im Spiel, wenn noch kein Knoten aktiv ist (nach Reset)
                target.classList.add('active');
                target.style.fill = '#ffc107';
                currentNode = nodeId;
                showTaskModal(nodeId);
            } else if (nodeId === currentNode) { // Klick auf den bereits aktiven Knoten
                showTaskModal(nodeId);
            }
        } else {
            // Optional: Zeige eine Nachricht, dass der Knoten bereits abgeschlossen ist
            // Stattdessen ein kleines Modal oder eine temporäre Nachricht anzeigen
            const tempMessage = document.createElement('div');
            tempMessage.textContent = 'Diese Station wurde bereits abgeschlossen!';
            tempMessage.className = 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg';
            document.body.appendChild(tempMessage);
            setTimeout(() => tempMessage.remove(), 2000);
        }
    }
});

// Event Listener für Modal-Buttons
closeModalBtn.addEventListener('click', handleNextTask);
submitTaskBtn.addEventListener('click', handleSubmitTask);
nextTaskBtn.addEventListener('click', handleNextTask);

// Event Listener für Spiel zurücksetzen
resetGameBtn.addEventListener('click', initializeGame);
restartGameBtn.addEventListener('click', initializeGame);

// Event Listener für den Start-Button
startGameBtn.addEventListener('click', startGame);

// Initialisiert das Spiel beim Laden der Seite
document.addEventListener('DOMContentLoaded', initializeGame);
