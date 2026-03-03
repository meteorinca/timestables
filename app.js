/**
 * ✖️ TIMES TABLES - INTERACTIVE PRACTICE
 * 5 activity modes: Sort, True/False, Numpad, Order, Link
 * Touch-compatible, with star tracking and dark mode.
 */

// ============================================
// APP STATE
// ============================================

let currentMode = 'sort';
let currentTable = 3;
let currentQuestion = 0;
let totalQuestions = 10;
let starsEarned = 0;
let questionAnswered = false;

const MODES = ['sort', 'truefalse', 'input', 'order', 'link'];
const MODE_LABELS = {
    sort: 'Sort',
    truefalse: 'True / False',
    input: 'Numpad',
    order: 'Order',
    link: 'Link'
};

// Per-mode question data
let questionData = [];

// ============================================
// UTILITIES
// ============================================

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isInTable(num, table) {
    return num > 0 && num % table === 0 && num <= table * 12;
}

// ============================================
// QUESTION GENERATORS
// ============================================

function generateSortQuestions() {
    const questions = [];
    for (let q = 0; q < totalQuestions; q++) {
        // Pick some numbers in the table and some not
        const inTable = [];
        const notInTable = [];

        // Generate 3-4 numbers in the table
        const inCount = randInt(3, 4);
        const usedMultiples = new Set();
        while (inTable.length < inCount) {
            const m = randInt(1, 12);
            if (!usedMultiples.has(m)) {
                usedMultiples.add(m);
                inTable.push(currentTable * m);
            }
        }

        // Generate 3-4 numbers NOT in the table
        const outCount = 8 - inCount;
        while (notInTable.length < outCount) {
            const n = randInt(1, currentTable * 12 + 10);
            if (!isInTable(n, currentTable) && !notInTable.includes(n) && !inTable.includes(n)) {
                notInTable.push(n);
            }
        }

        const allNumbers = shuffle([...inTable, ...notInTable]);
        questions.push({ allNumbers, inTable, notInTable });
    }
    return questions;
}

function generateTrueFalseQuestions() {
    const questions = [];
    for (let q = 0; q < totalQuestions; q++) {
        const type = randInt(0, 3);
        let statement, answer;

        if (type === 0) {
            // "A × B = C" true or false
            const a = randInt(1, 12);
            const b = currentTable;
            const correct = a * b;
            const isTrue = Math.random() > 0.4;
            const shown = isTrue ? correct : correct + randInt(1, 5) * (Math.random() > 0.5 ? 1 : -1);
            statement = `${a} × ${b} = ${shown === 0 ? correct + 1 : shown}`;
            answer = isTrue || shown === correct;
            // Ensure consistency
            if (shown === correct) answer = true;
            else answer = false;
        } else if (type === 1) {
            // "X lots of Y is the same as Y lots of X"
            const a = randInt(2, 12);
            const b = currentTable;
            statement = `${a} lots of ${b} is the same as ${b} lots of ${a}.`;
            answer = true;
        } else if (type === 2) {
            // "X is in the Ntimes table"
            const multiplier = randInt(1, 12);
            const isTrue = Math.random() > 0.4;
            let num;
            if (isTrue) {
                num = currentTable * multiplier;
            } else {
                num = currentTable * multiplier + randInt(1, currentTable - 1);
                if (num % currentTable === 0) num++;
            }
            statement = `${num} is in the ${currentTable}× table.`;
            answer = num % currentTable === 0 && num > 0 && num <= currentTable * 12;
        } else {
            // "A × B is greater/less than C × D"
            const a = randInt(1, 12);
            const c = randInt(1, 12);
            const prodA = a * currentTable;
            const prodC = c * currentTable;
            if (prodA === prodC) {
                statement = `${a} × ${currentTable} is equal to ${c} × ${currentTable}.`;
                answer = true;
            } else {
                const greaterLabel = prodA > prodC ? 'greater' : 'less';
                statement = `${a} × ${currentTable} is ${greaterLabel} than ${c} × ${currentTable}.`;
                answer = true;
            }
        }

        questions.push({ statement, answer });
    }
    return questions;
}

function generateInputQuestions() {
    const questions = [];
    const usedPairs = new Set();
    for (let q = 0; q < totalQuestions; q++) {
        let a, b;
        do {
            a = randInt(1, 12);
            b = currentTable;
        } while (usedPairs.has(`${a}x${b}`));
        usedPairs.add(`${a}x${b}`);
        questions.push({ a, b, answer: a * b });
    }
    return questions;
}

function generateOrderQuestions() {
    const questions = [];
    for (let q = 0; q < totalQuestions; q++) {
        // Pick a starting multiplier and generate 5 consecutive multiples
        const startMult = randInt(1, 8);
        const sequence = [];
        for (let i = 0; i < 5; i++) {
            sequence.push(currentTable * (startMult + i));
        }
        // Give some as pre-placed and rest as choices
        const prePlacedCount = randInt(1, 2);
        const prePlacedIndices = new Set();
        while (prePlacedIndices.size < prePlacedCount) {
            prePlacedIndices.add(randInt(0, 4));
        }

        const slots = sequence.map((val, idx) => ({
            value: val,
            prePlaced: prePlacedIndices.has(idx)
        }));

        const choices = slots.filter(s => !s.prePlaced).map(s => s.value);

        questions.push({ sequence, slots, choices: shuffle(choices) });
    }
    return questions;
}

function generateLinkQuestions() {
    const questions = [];
    for (let q = 0; q < totalQuestions; q++) {
        // Generate 4 multiplication facts and their answers
        const usedMults = new Set();
        const facts = [];
        while (facts.length < 4) {
            const m = randInt(1, 12);
            if (!usedMults.has(m)) {
                usedMults.add(m);
                facts.push({
                    expression: `${m}×${currentTable}`,
                    answer: m * currentTable,
                    multiplier: m
                });
            }
        }

        const expressions = facts.map(f => f.expression);
        const answers = shuffle(facts.map(f => f.answer));
        const correctMap = {};
        facts.forEach(f => {
            correctMap[f.expression] = f.answer;
        });

        questions.push({ expressions, answers, correctMap });
    }
    return questions;
}

// ============================================
// RENDERING
// ============================================

function renderStars() {
    const container = document.getElementById('starsContainer');
    const countEl = document.getElementById('starCount');
    container.innerHTML = '';

    for (let i = 0; i < totalQuestions; i++) {
        const star = document.createElement('div');
        star.className = 'star-item' + (i < starsEarned ? ' earned' : '');
        star.textContent = '⭐';
        container.appendChild(star);
    }
    countEl.textContent = starsEarned;
}

function updateNavButtons() {
    document.getElementById('btnPrev').disabled = currentQuestion <= 0;
    document.getElementById('btnNext').textContent =
        currentQuestion >= totalQuestions - 1 ? 'Finish →' : 'Next →';
}

function updateQuestionBadge() {
    document.getElementById('questionBadge').textContent = `Q${currentQuestion + 1}`;
}

function renderCurrentQuestion() {
    questionAnswered = false;
    updateQuestionBadge();
    updateNavButtons();

    const content = document.getElementById('activityContent');
    content.innerHTML = '';

    const data = questionData[currentQuestion];
    if (!data) return;

    switch (currentMode) {
        case 'sort':
            renderSortQuestion(data);
            break;
        case 'truefalse':
            renderTrueFalseQuestion(data);
            break;
        case 'input':
            renderInputQuestion(data);
            break;
        case 'order':
            renderOrderQuestion(data);
            break;
        case 'link':
            renderLinkQuestion(data);
            break;
    }
}

// ============================================
// SORT ACTIVITY
// ============================================

let sortState = {};

function renderSortQuestion(data) {
    const qText = document.getElementById('questionText');
    qText.textContent = `Sort these numbers:`;

    // Initialize sort state if not exists
    if (!sortState[currentQuestion]) {
        sortState[currentQuestion] = {
            pool: [...data.allNumbers],
            yesZone: [],
            noZone: [],
            checked: false
        };
    }

    const state = sortState[currentQuestion];
    const content = document.getElementById('activityContent');

    content.innerHTML = `
    <div class="sort-container">
      <div class="sort-numbers" id="sortPool">
        ${state.pool.map(n => `<div class="number-card" draggable="true" data-value="${n}">${n}</div>`).join('')}
      </div>
      <div class="sort-zones">
        <div class="sort-zone zone-yes" id="zoneYes">
          <div class="sort-zone-label">in the ${currentTable}× table</div>
          <div class="sort-zone-cards" id="zoneYesCards">
            ${state.yesZone.map(n => `<div class="number-card" draggable="true" data-value="${n}">${n}</div>`).join('')}
          </div>
        </div>
        <div class="sort-zone zone-no" id="zoneNo">
          <div class="sort-zone-label">not in the ${currentTable}× table</div>
          <div class="sort-zone-cards" id="zoneNoCards">
            ${state.noZone.map(n => `<div class="number-card" draggable="true" data-value="${n}">${n}</div>`).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

    setupSortDragDrop();
}

function setupSortDragDrop() {
    const containers = [
        document.getElementById('sortPool'),
        document.getElementById('zoneYesCards'),
        document.getElementById('zoneNoCards')
    ];

    let draggedEl = null;
    let touchClone = null;
    let sourceContainer = null;

    // Mouse/Pointer drag
    containers.forEach(container => {
        container.addEventListener('dragover', e => {
            e.preventDefault();
            container.closest('.sort-zone, .sort-numbers')?.classList.add('drag-over');
        });

        container.addEventListener('dragleave', e => {
            container.closest('.sort-zone, .sort-numbers')?.classList.remove('drag-over');
        });

        container.addEventListener('drop', e => {
            e.preventDefault();
            container.closest('.sort-zone, .sort-numbers')?.classList.remove('drag-over');
            if (draggedEl && container !== sourceContainer) {
                container.appendChild(draggedEl);
                draggedEl.classList.remove('dragging');
                updateSortState();
            }
        });
    });

    // Apply drag events to all number cards
    document.querySelectorAll('.sort-container .number-card').forEach(card => {
        // Mouse/keyboard drag
        card.addEventListener('dragstart', e => {
            draggedEl = card;
            sourceContainer = card.parentElement;
            card.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });

        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
            document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
        });

        // Touch drag
        card.addEventListener('touchstart', e => {
            e.preventDefault();
            draggedEl = card;
            sourceContainer = card.parentElement;

            const touch = e.touches[0];
            touchClone = card.cloneNode(true);
            touchClone.style.position = 'fixed';
            touchClone.style.zIndex = '9999';
            touchClone.style.pointerEvents = 'none';
            touchClone.style.opacity = '0.8';
            touchClone.style.width = card.offsetWidth + 'px';
            touchClone.style.height = card.offsetHeight + 'px';
            touchClone.style.left = (touch.clientX - card.offsetWidth / 2) + 'px';
            touchClone.style.top = (touch.clientY - card.offsetHeight / 2) + 'px';
            document.body.appendChild(touchClone);
            card.classList.add('dragging');
        }, { passive: false });

        card.addEventListener('touchmove', e => {
            e.preventDefault();
            if (!touchClone) return;
            const touch = e.touches[0];
            touchClone.style.left = (touch.clientX - touchClone.offsetWidth / 2) + 'px';
            touchClone.style.top = (touch.clientY - touchClone.offsetHeight / 2) + 'px';

            // Highlight drop target
            document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
            const target = document.elementFromPoint(touch.clientX, touch.clientY);
            if (target) {
                const zone = target.closest('.sort-zone-cards') || target.closest('.sort-numbers');
                if (zone) {
                    (zone.closest('.sort-zone') || zone).classList.add('drag-over');
                }
            }
        }, { passive: false });

        card.addEventListener('touchend', e => {
            if (touchClone) {
                const touch = e.changedTouches[0];
                touchClone.remove();
                touchClone = null;

                const target = document.elementFromPoint(touch.clientX, touch.clientY);
                if (target) {
                    const dropZone = target.closest('.sort-zone-cards') || target.closest('.sort-numbers');
                    if (dropZone && dropZone !== sourceContainer) {
                        const actualTarget = dropZone.id === 'sortPool' ? dropZone :
                            dropZone.classList.contains('sort-zone-cards') ? dropZone :
                                dropZone.querySelector('.sort-zone-cards') || dropZone;
                        actualTarget.appendChild(draggedEl);
                    }
                }

                draggedEl.classList.remove('dragging');
                document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
                updateSortState();
            }
        });
    });
}

function updateSortState() {
    const state = sortState[currentQuestion];
    const pool = document.getElementById('sortPool');
    const yesCards = document.getElementById('zoneYesCards');
    const noCards = document.getElementById('zoneNoCards');

    state.pool = [...pool.querySelectorAll('.number-card')].map(c => parseInt(c.dataset.value));
    state.yesZone = [...yesCards.querySelectorAll('.number-card')].map(c => parseInt(c.dataset.value));
    state.noZone = [...noCards.querySelectorAll('.number-card')].map(c => parseInt(c.dataset.value));
}

function checkSortAnswer() {
    const data = questionData[currentQuestion];
    const state = sortState[currentQuestion];

    if (state.pool.length > 0) {
        // Not all sorted yet
        return false;
    }

    let allCorrect = true;

    // Check yes zone
    const yesCards = document.getElementById('zoneYesCards');
    yesCards.querySelectorAll('.number-card').forEach(card => {
        const val = parseInt(card.dataset.value);
        if (data.inTable.includes(val)) {
            card.classList.add('correct-card');
        } else {
            card.classList.add('wrong-card');
            allCorrect = false;
        }
    });

    // Check no zone
    const noCards = document.getElementById('zoneNoCards');
    noCards.querySelectorAll('.number-card').forEach(card => {
        const val = parseInt(card.dataset.value);
        if (data.notInTable.includes(val)) {
            card.classList.add('correct-card');
        } else {
            card.classList.add('wrong-card');
            allCorrect = false;
        }
    });

    return allCorrect;
}

// ============================================
// TRUE/FALSE ACTIVITY
// ============================================

let tfState = {};

function renderTrueFalseQuestion(data) {
    const qText = document.getElementById('questionText');
    qText.textContent = '';

    if (!tfState[currentQuestion]) {
        tfState[currentQuestion] = { answered: false, correct: false, selected: null };
    }

    const state = tfState[currentQuestion];
    const content = document.getElementById('activityContent');

    content.innerHTML = `
    <div class="tf-container">
      <div class="tf-statement">${data.statement}</div>
      <div class="tf-buttons">
        <button class="tf-btn btn-true ${state.selected === true ? 'selected' : ''}" id="tfTrue">
          ✓ True
        </button>
        <button class="tf-btn btn-false ${state.selected === false ? 'selected' : ''}" id="tfFalse">
          ✗ False
        </button>
      </div>
      <div class="tf-feedback" id="tfFeedback">${state.answered ? (state.correct ? '✅ Correct!' : '❌ Not quite!') : ''}</div>
    </div>
  `;

    if (!state.answered) {
        document.getElementById('tfTrue').onclick = () => selectTF(true);
        document.getElementById('tfFalse').onclick = () => selectTF(false);
    } else {
        applyTFStyles(state);
    }
}

function selectTF(value) {
    const state = tfState[currentQuestion];
    state.selected = value;

    document.querySelectorAll('.tf-btn').forEach(b => b.classList.remove('selected'));
    if (value === true) {
        document.getElementById('tfTrue').classList.add('selected');
    } else {
        document.getElementById('tfFalse').classList.add('selected');
    }
}

function checkTrueFalseAnswer() {
    const state = tfState[currentQuestion];
    const data = questionData[currentQuestion];

    if (state.selected === null) return false;

    state.answered = true;
    state.correct = state.selected === data.answer;

    applyTFStyles(state);

    const feedback = document.getElementById('tfFeedback');
    if (state.correct) {
        feedback.textContent = '✅ Correct!';
        feedback.style.color = 'var(--success)';
    } else {
        feedback.textContent = `❌ The answer was ${data.answer ? 'True' : 'False'}.`;
        feedback.style.color = 'var(--error)';
    }

    return state.correct;
}

function applyTFStyles(state) {
    const data = questionData[currentQuestion];
    const trueBtn = document.getElementById('tfTrue');
    const falseBtn = document.getElementById('tfFalse');

    if (state.answered) {
        trueBtn.onclick = null;
        falseBtn.onclick = null;
        trueBtn.style.pointerEvents = 'none';
        falseBtn.style.pointerEvents = 'none';

        if (data.answer === true) {
            trueBtn.classList.add('correct-answer');
            if (state.selected === false) falseBtn.classList.add('wrong-answer');
        } else {
            falseBtn.classList.add('correct-answer');
            if (state.selected === true) trueBtn.classList.add('wrong-answer');
        }
    }
}

// ============================================
// NUMPAD ACTIVITY
// ============================================

let inputState = {};

function renderInputQuestion(data) {
    const qText = document.getElementById('questionText');
    qText.textContent = `What is ${data.a} × ${data.b}?`;

    if (!inputState[currentQuestion]) {
        inputState[currentQuestion] = { value: '', answered: false, correct: false };
    }

    const state = inputState[currentQuestion];
    const content = document.getElementById('activityContent');

    content.innerHTML = `
    <div class="numpad-container">
      <div class="numpad-grid">
        <button class="numpad-btn" data-num="7">7</button>
        <button class="numpad-btn" data-num="8">8</button>
        <button class="numpad-btn" data-num="9">9</button>
        <button class="numpad-btn" data-num="4">4</button>
        <button class="numpad-btn" data-num="5">5</button>
        <button class="numpad-btn" data-num="6">6</button>
        <button class="numpad-btn" data-num="1">1</button>
        <button class="numpad-btn" data-num="2">2</button>
        <button class="numpad-btn" data-num="3">3</button>
        <button class="numpad-btn" data-num=".">.</button>
        <button class="numpad-btn" data-num="0">0</button>
        <button class="numpad-btn del-btn" data-num="del">del</button>
      </div>
      <div class="numpad-output">
        <div class="numpad-display" id="numpadDisplay">${state.value || ''}</div>
        <button class="numpad-done" id="numpadDone">✓ Done</button>
        <div class="numpad-feedback" id="numpadFeedback">${state.answered ? (state.correct ? '✅ Correct!' : `❌ Answer: ${data.answer}`) : ''}</div>
      </div>
    </div>
  `;

    if (!state.answered) {
        document.querySelectorAll('.numpad-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const num = btn.dataset.num;
                if (num === 'del') {
                    state.value = state.value.slice(0, -1);
                } else {
                    if (state.value.length < 4) {
                        state.value += num;
                    }
                }
                document.getElementById('numpadDisplay').textContent = state.value;
            });
        });

        document.getElementById('numpadDone').onclick = () => {
            checkAnswer();
        };
    }
}

function checkInputAnswer() {
    const state = inputState[currentQuestion];
    const data = questionData[currentQuestion];

    if (!state.value) return false;

    state.answered = true;
    state.correct = parseInt(state.value) === data.answer;

    const feedback = document.getElementById('numpadFeedback');
    const display = document.getElementById('numpadDisplay');

    if (state.correct) {
        feedback.textContent = '✅ Correct!';
        feedback.style.color = 'var(--success)';
        display.style.borderColor = 'var(--success)';
        display.style.background = '#ecfdf5';
    } else {
        feedback.textContent = `❌ Answer: ${data.answer}`;
        feedback.style.color = 'var(--error)';
        display.style.borderColor = 'var(--error)';
        display.style.background = '#fef2f2';
    }

    // Disable numpad
    document.querySelectorAll('.numpad-btn').forEach(b => {
        b.style.pointerEvents = 'none';
        b.style.opacity = '0.5';
    });

    return state.correct;
}

// ============================================
// ORDER ACTIVITY
// ============================================

let orderState = {};

function renderOrderQuestion(data) {
    const qText = document.getElementById('questionText');
    qText.textContent = `Put these in order so you are counting in ${currentTable}s:`;

    if (!orderState[currentQuestion]) {
        orderState[currentQuestion] = {
            slots: data.slots.map(s => ({
                value: s.prePlaced ? s.value : null,
                prePlaced: s.prePlaced,
                correctValue: s.value
            })),
            choices: [...data.choices],
            checked: false
        };
    }

    const state = orderState[currentQuestion];
    const content = document.getElementById('activityContent');

    content.innerHTML = `
    <div class="order-container">
      <div class="order-slots" id="orderSlots">
        ${state.slots.map((s, i) => `
          <div class="order-slot ${s.value !== null ? 'filled' : ''} ${s.prePlaced ? 'correct-slot' : ''}" 
               data-index="${i}" 
               ${!s.prePlaced ? 'data-droppable="true"' : ''}>
            ${s.value !== null ? s.value : ''}
          </div>
        `).join('')}
      </div>
      <div class="order-choices" id="orderChoices">
        ${state.choices.map(v => {
        const placed = state.slots.some(s => !s.prePlaced && s.value === v);
        return `<div class="order-card ${placed ? 'placed' : ''}" draggable="true" data-value="${v}">${v}</div>`;
    }).join('')}
      </div>
    </div>
  `;

    setupOrderDragDrop();
}

function setupOrderDragDrop() {
    let draggedCard = null;
    let touchClone = null;

    const cards = document.querySelectorAll('.order-card:not(.placed)');
    const slots = document.querySelectorAll('.order-slot[data-droppable]');

    cards.forEach(card => {
        card.addEventListener('dragstart', e => {
            draggedCard = card;
            card.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });

        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
            document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
        });

        // Touch events
        card.addEventListener('touchstart', e => {
            e.preventDefault();
            draggedCard = card;
            const touch = e.touches[0];
            touchClone = card.cloneNode(true);
            touchClone.style.position = 'fixed';
            touchClone.style.zIndex = '9999';
            touchClone.style.pointerEvents = 'none';
            touchClone.style.opacity = '0.8';
            touchClone.style.width = card.offsetWidth + 'px';
            touchClone.style.height = card.offsetHeight + 'px';
            touchClone.style.left = (touch.clientX - card.offsetWidth / 2) + 'px';
            touchClone.style.top = (touch.clientY - card.offsetHeight / 2) + 'px';
            document.body.appendChild(touchClone);
            card.classList.add('dragging');
        }, { passive: false });

        card.addEventListener('touchmove', e => {
            e.preventDefault();
            if (!touchClone) return;
            const touch = e.touches[0];
            touchClone.style.left = (touch.clientX - touchClone.offsetWidth / 2) + 'px';
            touchClone.style.top = (touch.clientY - touchClone.offsetHeight / 2) + 'px';

            document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
            const target = document.elementFromPoint(touch.clientX, touch.clientY);
            if (target) {
                const slot = target.closest('.order-slot[data-droppable]');
                if (slot && !slot.classList.contains('filled')) {
                    slot.classList.add('drag-over');
                }
            }
        }, { passive: false });

        card.addEventListener('touchend', e => {
            if (touchClone) {
                const touch = e.changedTouches[0];
                touchClone.remove();
                touchClone = null;

                const target = document.elementFromPoint(touch.clientX, touch.clientY);
                if (target) {
                    const slot = target.closest('.order-slot[data-droppable]');
                    if (slot && !slot.classList.contains('filled')) {
                        placeOrderCard(draggedCard, slot);
                    }
                }

                draggedCard.classList.remove('dragging');
                document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
            }
        });
    });

    slots.forEach(slot => {
        slot.addEventListener('dragover', e => {
            e.preventDefault();
            if (!slot.classList.contains('filled')) {
                slot.classList.add('drag-over');
            }
        });

        slot.addEventListener('dragleave', () => {
            slot.classList.remove('drag-over');
        });

        slot.addEventListener('drop', e => {
            e.preventDefault();
            slot.classList.remove('drag-over');
            if (draggedCard && !slot.classList.contains('filled')) {
                placeOrderCard(draggedCard, slot);
            }
        });

        // Tap to remove
        slot.addEventListener('click', () => {
            if (slot.classList.contains('filled') && !slot.dataset.prePlaced) {
                const state = orderState[currentQuestion];
                const idx = parseInt(slot.dataset.index);
                if (!state.slots[idx].prePlaced && state.slots[idx].value !== null) {
                    state.slots[idx].value = null;
                    renderCurrentQuestion();
                }
            }
        });
    });
}

function placeOrderCard(card, slot) {
    const val = parseInt(card.dataset.value);
    const idx = parseInt(slot.dataset.index);
    const state = orderState[currentQuestion];

    state.slots[idx].value = val;
    renderCurrentQuestion();
}

function checkOrderAnswer() {
    const state = orderState[currentQuestion];

    // Check if all slots filled
    if (state.slots.some(s => s.value === null)) return false;

    let allCorrect = true;
    const slots = document.querySelectorAll('.order-slot');
    state.slots.forEach((s, i) => {
        if (s.value === s.correctValue) {
            slots[i].classList.add('correct-slot');
        } else {
            slots[i].classList.add('wrong-slot');
            allCorrect = false;
        }
    });

    state.checked = true;
    return allCorrect;
}

// ============================================
// LINK / MATCH ACTIVITY
// ============================================

let linkState = {};
let selectedLinkItem = null;

function renderLinkQuestion(data) {
    const qText = document.getElementById('questionText');
    qText.textContent = `Link these times tables facts:`;

    if (!linkState[currentQuestion]) {
        linkState[currentQuestion] = {
            matches: {}, // expression -> answer
            checked: false
        };
    }

    const state = linkState[currentQuestion];
    const content = document.getElementById('activityContent');

    content.innerHTML = `
    <div class="link-container">
      <div class="link-row" id="linkExpressions">
        ${data.expressions.map(expr => {
        const matched = Object.keys(state.matches).includes(expr);
        return `
            <div class="link-item ${matched ? 'matched' : ''}" data-type="expr" data-value="${expr}">
              <div class="link-box">${expr}</div>
              <div class="link-dot"></div>
            </div>
          `;
    }).join('')}
      </div>
      <div class="link-row" id="linkAnswers">
        ${data.answers.map(ans => {
        const matched = Object.values(state.matches).includes(ans);
        return `
            <div class="link-item ${matched ? 'matched' : ''}" data-type="ans" data-value="${ans}">
              <div class="link-dot"></div>
              <div class="link-box">${ans}</div>
            </div>
          `;
    }).join('')}
      </div>
      <button class="link-reset-btn" id="linkReset">🔄 Reset</button>
    </div>
  `;

    // Draw existing lines
    requestAnimationFrame(() => drawLinkLines());

    // Event listeners
    document.querySelectorAll('.link-item').forEach(item => {
        item.addEventListener('click', () => handleLinkClick(item));
    });

    document.getElementById('linkReset').addEventListener('click', () => {
        linkState[currentQuestion] = { matches: {}, checked: false };
        selectedLinkItem = null;
        clearLinkLines();
        renderCurrentQuestion();
    });
}

function handleLinkClick(item) {
    const state = linkState[currentQuestion];
    if (state.checked) return;

    const type = item.dataset.type;
    const value = item.dataset.value;

    if (item.classList.contains('matched')) return;

    if (!selectedLinkItem) {
        // First selection
        selectedLinkItem = { type, value, element: item };
        item.classList.add('selected');
    } else {
        // Second selection - must be different type
        if (type === selectedLinkItem.type) {
            // Same type - switch selection
            selectedLinkItem.element.classList.remove('selected');
            selectedLinkItem = { type, value, element: item };
            item.classList.add('selected');
        } else {
            // Different type - create match
            let expr, ans;
            if (type === 'expr') {
                expr = value;
                ans = parseInt(selectedLinkItem.value);
            } else {
                expr = selectedLinkItem.value;
                ans = parseInt(value);
            }

            state.matches[expr] = ans;
            selectedLinkItem.element.classList.remove('selected');
            selectedLinkItem.element.classList.add('matched');
            item.classList.add('matched');
            selectedLinkItem = null;

            drawLinkLines();
        }
    }
}

function drawLinkLines() {
    const svg = document.getElementById('linkSvg');
    svg.innerHTML = '';

    const state = linkState[currentQuestion];
    if (!state) return;

    Object.entries(state.matches).forEach(([expr, ans]) => {
        const exprEl = document.querySelector(`.link-item[data-type="expr"][data-value="${expr}"] .link-dot`);
        const ansEl = document.querySelector(`.link-item[data-type="ans"][data-value="${ans}"] .link-dot`);

        if (exprEl && ansEl) {
            const r1 = exprEl.getBoundingClientRect();
            const r2 = ansEl.getBoundingClientRect();

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', r1.left + r1.width / 2);
            line.setAttribute('y1', r1.top + r1.height / 2);
            line.setAttribute('x2', r2.left + r2.width / 2);
            line.setAttribute('y2', r2.top + r2.height / 2);
            line.classList.add('link-line');

            if (state.checked) {
                const data = questionData[currentQuestion];
                if (data.correctMap[expr] === ans) {
                    line.classList.add('confirmed');
                }
            }

            svg.appendChild(line);
        }
    });
}

function clearLinkLines() {
    document.getElementById('linkSvg').innerHTML = '';
}

function checkLinkAnswer() {
    const state = linkState[currentQuestion];
    const data = questionData[currentQuestion];

    if (Object.keys(state.matches).length < data.expressions.length) return false;

    let allCorrect = true;
    state.checked = true;

    Object.entries(state.matches).forEach(([expr, ans]) => {
        if (data.correctMap[expr] !== ans) {
            allCorrect = false;
        }
    });

    drawLinkLines();
    return allCorrect;
}

// ============================================
// CHECK ANSWER (Main dispatcher)
// ============================================

function checkAnswer() {
    if (questionAnswered) return;

    let correct = false;

    switch (currentMode) {
        case 'sort':
            correct = checkSortAnswer();
            break;
        case 'truefalse':
            correct = checkTrueFalseAnswer();
            break;
        case 'input':
            correct = checkInputAnswer();
            break;
        case 'order':
            correct = checkOrderAnswer();
            break;
        case 'link':
            correct = checkLinkAnswer();
            break;
    }

    if (correct) {
        starsEarned++;
        renderStars();
    }

    questionAnswered = true;

    // Check if all done
    if (currentQuestion === totalQuestions - 1 && correct) {
        setTimeout(() => {
            if (starsEarned === totalQuestions) {
                showFireworks();
            }
        }, 600);
    }
}

// ============================================
// NAVIGATION
// ============================================

function nextQuestion() {
    if (currentQuestion < totalQuestions - 1) {
        currentQuestion++;
        renderCurrentQuestion();
    } else {
        // Finished - show summary
        if (starsEarned === totalQuestions) {
            showFireworks();
        } else {
            const content = document.getElementById('activityContent');
            const qText = document.getElementById('questionText');
            qText.textContent = 'Activity Complete!';
            document.getElementById('questionBadge').textContent = '🏁';
            content.innerHTML = `
        <div style="text-align:center; padding: 40px 0;">
          <div style="font-size: 3rem; margin-bottom: 16px;">🎉</div>
          <div style="font-size: 1.4rem; font-weight: 800; color: var(--text-primary); margin-bottom: 8px;">
            You scored ${starsEarned} out of ${totalQuestions}!
          </div>
          <div style="color: var(--text-muted); font-weight: 600;">
            ${starsEarned >= 8 ? 'Amazing job! 🌟' : starsEarned >= 5 ? 'Good effort! Keep practising! 💪' : 'Keep trying, you\'ll get there! 🚀'}
          </div>
        </div>
      `;
        }
    }
}

function prevQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        renderCurrentQuestion();
    }
}

// ============================================
// MODE SWITCHING
// ============================================

function updateMode(mode) {
    currentMode = mode;
    currentQuestion = 0;
    starsEarned = 0;
    questionAnswered = false;

    // Reset all states
    sortState = {};
    tfState = {};
    inputState = {};
    orderState = {};
    linkState = {};
    selectedLinkItem = null;
    clearLinkLines();

    // Update tabs
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    // Update hash
    window.location.hash = mode;

    // Generate questions
    generateQuestions();

    renderStars();
    renderCurrentQuestion();
}

function generateQuestions() {
    switch (currentMode) {
        case 'sort':
            questionData = generateSortQuestions();
            break;
        case 'truefalse':
            questionData = generateTrueFalseQuestions();
            break;
        case 'input':
            questionData = generateInputQuestions();
            break;
        case 'order':
            questionData = generateOrderQuestions();
            break;
        case 'link':
            questionData = generateLinkQuestions();
            break;
    }
}

// ============================================
// DARK MODE
// ============================================

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const btn = document.getElementById('darkModeToggle');
    btn.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
    localStorage.setItem('tt-dark-mode', document.body.classList.contains('dark-mode'));
}

// ============================================
// FIREWORKS
// ============================================

function showFireworks() {
    const overlay = document.getElementById('fireworksOverlay');
    overlay.style.display = 'flex';
    startFireworks();
}

function startFireworks() {
    const canvas = document.getElementById('fireworksCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const overlay = document.getElementById('fireworksOverlay');

    let particles = [];
    const colors = ['#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444'];

    class Particle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.color = color;
            this.velocity = {
                x: (Math.random() - 0.5) * 10,
                y: (Math.random() - 0.5) * 10
            };
            this.alpha = 1;
            this.friction = 0.95;
        }
        draw() {
            ctx.globalAlpha = this.alpha;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
        update() {
            this.velocity.x *= this.friction;
            this.velocity.y *= this.friction;
            this.velocity.y += 0.1; // gravity
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            this.alpha -= 0.008;
        }
    }

    function animate() {
        if (overlay.style.display === 'none') return;
        requestAnimationFrame(animate);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (Math.random() < 0.12) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height * 0.6;
            const color = colors[Math.floor(Math.random() * colors.length)];
            for (let i = 0; i < 40; i++) {
                particles.push(new Particle(x, y, color));
            }
        }

        particles.forEach((p, i) => {
            if (p.alpha <= 0) {
                particles.splice(i, 1);
            } else {
                p.update();
                p.draw();
            }
        });
    }
    animate();
}

// ============================================
// INITIALIZATION
// ============================================

// Table selector
document.getElementById('timesTableSelect').addEventListener('change', e => {
    currentTable = parseInt(e.target.value);
    updateMode(currentMode);
});

// Mode buttons
document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.onclick = () => updateMode(btn.dataset.mode);
});

// Navigation
document.getElementById('btnNext').onclick = nextQuestion;
document.getElementById('btnPrev').onclick = prevQuestion;
document.getElementById('btnCheckAnswer').onclick = checkAnswer;

// Dark mode
document.getElementById('darkModeToggle').onclick = toggleDarkMode;

// Restore dark mode preference
if (localStorage.getItem('tt-dark-mode') === 'true') {
    document.body.classList.add('dark-mode');
    document.getElementById('darkModeToggle').textContent = '☀️';
}

// Fireworks close
document.getElementById('fireworksClose').onclick = () => {
    document.getElementById('fireworksOverlay').style.display = 'none';
    // Move to next mode
    const currentIndex = MODES.indexOf(currentMode);
    const nextIndex = (currentIndex + 1) % MODES.length;
    updateMode(MODES[nextIndex]);
};

// Handle deep linking
window.onhashchange = () => {
    const hash = window.location.hash.slice(1);
    if (MODES.includes(hash)) updateMode(hash);
};

// Redraw link lines on scroll/resize
window.addEventListener('scroll', () => {
    if (currentMode === 'link') drawLinkLines();
});
window.addEventListener('resize', () => {
    if (currentMode === 'link') drawLinkLines();
});

// Initialize
const initialHash = window.location.hash.slice(1);
if (MODES.includes(initialHash)) {
    updateMode(initialHash);
} else {
    updateMode('sort');
}
