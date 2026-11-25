const baseRows = [
  "534678912",
  "672195348",
  "198342567",
  "859761423",
  "426853791",
  "713924856",
  "961537284",
  "287419635",
  "345286179"
];

let solution = [];
let puzzle = [];
let notes = [];
let selectedCell = null;
let notesMode = false;
let currentDifficulty = 'easy';

function showStartScreen() {
  document.getElementById('game-screen').classList.add('hidden');
  document.getElementById('start-screen').classList.remove('hidden');
}

function restartCurrentDifficulty() {
  startNewGame(currentDifficulty);
}

function toggleNotes() {
  notesMode = !notesMode;
  const btn = document.getElementById('btn-notes');
  btn.textContent = notesMode ? 'Notes: ON' : 'Notes: OFF';
  btn.classList.toggle('notes-on', notesMode);
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateBoard(difficulty) {
  // 1. Shuffle digits 1-9
  const nums = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  solution = baseRows.map(rowStr =>
    rowStr.split('').map(ch => nums[parseInt(ch, 10) - 1])
  );

  // 2. Shuffle rows within their 3-row bands
  for (let band = 0; band < 3; band++) {
    const order = shuffleArray([0, 1, 2]);
    const copy = solution.slice(band * 3, band * 3 + 3);
    order.forEach((r, idx) => {
      solution[band * 3 + idx] = copy[r];
    });
  }

  // 3. Poke holes based on difficulty and reset notes
  puzzle = solution.map(row => [...row]);
  notes = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set()));

  let holes = difficulty === 'easy' ? 32 : difficulty === 'medium' ? 44 : 54;
  while (holes > 0) {
    const r = Math.floor(Math.random() * 9);
    const c = Math.floor(Math.random() * 9);
    if (puzzle[r][c] !== 0) {
      puzzle[r][c] = 0;
      holes--;
    }
  }
}

function renderBoard() {
  const boardEl = document.getElementById('board');
  boardEl.innerHTML = '';

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.r = r;
      cell.dataset.c = c;

      const val = puzzle[r][c];
      if (val !== 0) {
        cell.textContent = val;
        cell.classList.add('fixed');
      } else {
        cell.classList.add('user');
      }

      cell.onclick = () => selectCell(r, c);
      boardEl.appendChild(cell);
    }
  }
}

function selectCell(r, c) {
  selectedCell = { r, c };
  document.querySelectorAll('.cell').forEach(cell => {
    cell.classList.remove('selected', 'highlight');
    const cr = parseInt(cell.dataset.r, 10);
    const cc = parseInt(cell.dataset.c, 10);

    if (cr === r && cc === c) cell.classList.add('selected');
    else if (cr === r || cc === c) cell.classList.add('highlight');
  });
}

function renderNotesInCell(cell, r, c) {
  cell.innerHTML = '';
  if (notes[r][c].size === 0) return;

  const grid = document.createElement('div');
  grid.className = 'notes-grid';
  for (let n = 1; n <= 9; n++) {
    const span = document.createElement('span');
    span.className = 'note-num';
    span.textContent = notes[r][c].has(n) ? n : '';
    grid.appendChild(span);
  }
  cell.appendChild(grid);
}

function clearMatchingNotes(r, c, num) {
  const boxStartRow = Math.floor(r / 3) * 3;
  const boxStartCol = Math.floor(c / 3) * 3;

  for (let i = 0; i < 9; i++) {
    if (notes[r][i].delete(num)) {
      const target = document.querySelector(`.cell[data-r="${r}"][data-c="${i}"]`);
      renderNotesInCell(target, r, i);
    }
    if (notes[i][c].delete(num)) {
      const target = document.querySelector(`.cell[data-r="${i}"][data-c="${c}"]`);
      renderNotesInCell(target, i, c);
    }
  }

  for (let br = boxStartRow; br < boxStartRow + 3; br++) {
    for (let bc = boxStartCol; bc < boxStartCol + 3; bc++) {
      if (notes[br][bc].delete(num)) {
        const target = document.querySelector(`.cell[data-r="${br}"][data-c="${bc}"]`);
        renderNotesInCell(target, br, bc);
      }
    }
  }
}

function inputNumber(num) {
  if (!selectedCell) return;
  const { r, c } = selectedCell;
  const cell = document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);

  if (cell.classList.contains('fixed')) return;

  if (num === 0) {
    cell.classList.remove('error');
    cell.innerHTML = '';
    notes[r][c].clear();
    return;
  }

  if (notesMode) {
    cell.classList.remove('error');
    if (notes[r][c].has(num)) notes[r][c].delete(num);
    else notes[r][c].add(num);

    renderNotesInCell(cell, r, c);
    return;
  }

  notes[r][c].clear();
  cell.classList.remove('error');
  cell.textContent = num;

  if (num !== solution[r][c]) {
    cell.classList.add('error');
  } else {
    clearMatchingNotes(r, c, num);
  }

  checkWin();
}

function checkWin() {
  const cells = document.querySelectorAll('.cell');
  for (let cell of cells) {
    if (cell.querySelector('.notes-grid')) return;
    const r = cell.dataset.r;
    const c = cell.dataset.c;
    if (parseInt(cell.textContent, 10) !== solution[r][c]) return;
  }
  document.getElementById('status').textContent = "Merry Christmas, Dad! You solved it!";
}

function startNewGame(difficulty) {
  currentDifficulty = difficulty;
  const label = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  document.getElementById('game-title').textContent = `Dad's Sudoku (${label})`;
  document.getElementById('status').textContent = '';
  selectedCell = null;

  document.getElementById('start-screen').classList.add('hidden');
  document.getElementById('game-screen').classList.remove('hidden');

  generateBoard(difficulty);
  renderBoard();
}
