// HTML要素の取得
const canvas = document.getElementById('gobanCanvas');
const ctx = canvas.getContext('2d'); // 2D描画コンテキスト
const statusMessage = document.getElementById('status-message');
const resetButton = document.getElementById('resetButton');

// ゲーム設定
const BOARD_SIZE = 15; // 盤のサイズ (15x15)
const CELL_SIZE = 25;  // 1マスのピクセルサイズ

const STONE_RADIUS = CELL_SIZE / 2 - 2; // 石の半径
const LINE_COLOR = '#333'; // 線の色
const BOARD_COLOR = '#DEB887'; // 盤の色

let board = []; // 盤面の状態を保持する2次元配列 (0:なし, 1:黒, 2:白)
let currentPlayer = 1; // 1:黒 (先手), 2:白 (後手)
let gameOver = false;

// キャンバスのサイズ設定
canvas.width = CELL_SIZE * BOARD_SIZE;
canvas.height = CELL_SIZE * BOARD_SIZE;

// --- ゲームの初期化 ---
function initializeGame() {
    board = Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(0));
    currentPlayer = 1; // 黒から開始
    gameOver = false;
    statusMessage.textContent = '黒のターンです';
    statusMessage.style.color = '#4CAF50'; // デフォルトの色
    drawBoard(); // 盤面を再描画
}

// --- 盤面の描画 ---
function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // キャンバスをクリア
    ctx.fillStyle = BOARD_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height); // 盤の背景色

    ctx.strokeStyle = LINE_COLOR;
    ctx.lineWidth = 1;

    // 縦線と横線を描画
    for (let i = 0; i < BOARD_SIZE; i++) {
        // 縦線
        ctx.beginPath();
        ctx.moveTo(i * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 2);
        ctx.lineTo(i * CELL_SIZE + CELL_SIZE / 2, canvas.height - CELL_SIZE / 2);
        ctx.stroke();
        // 横線
        ctx.beginPath();
        ctx.moveTo(CELL_SIZE / 2, i * CELL_SIZE + CELL_SIZE / 2);
        ctx.lineTo(canvas.width - CELL_SIZE / 2, i * CELL_SIZE + CELL_SIZE / 2);
        ctx.stroke();
    }

    // 石を描画
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            if (board[y][x] !== 0) {
                drawStone(x, y, board[y][x]);
            }
        }
    }
}

// --- 石の描画 ---
function drawStone(x, y, player) {
    const pixelX = x * CELL_SIZE + CELL_SIZE / 2;
    const pixelY = y * CELL_SIZE + CELL_SIZE / 2;

    ctx.beginPath();
    ctx.arc(pixelX, pixelY, STONE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = (player === 1) ? 'black' : 'white'; // 黒石か白石か
    ctx.fill();
    ctx.closePath();

    // 石の縁を描画 (立体感を出すため)
    ctx.strokeStyle = (player === 1) ? '#555' : '#AAA';
    ctx.lineWidth = 1;
    ctx.stroke();
}

// --- クリック/タップイベントハンドラ ---
function handleInput(event) {
    if (gameOver) return; // ゲーム終了時は操作不可

    let rect = canvas.getBoundingClientRect(); // キャンバスの画面上の位置とサイズ
    let clientX, clientY;

    if (event.type === 'mousedown') {
        clientX = event.clientX;
        clientY = event.clientY;
    } else if (event.type === 'touchstart') {
        event.preventDefault(); // スマートフォンのデフォルトスクロールなどを防止
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    } else {
        return; // 未対応のイベントタイプ
    }

    // キャンバス内での相対座標を計算
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // クリックされた座標から碁盤のマス目を計算
    const gridX = Math.floor(x / CELL_SIZE);
    const gridY = Math.floor(y / CELL_SIZE);

    // 有効なマス目か、かつすでに石が置かれていないかチェック
    if (gridX >= 0 && gridX < BOARD_SIZE &&
        gridY >= 0 && gridY < BOARD_SIZE &&
        board[gridY][gridX] === 0) {
        
        placeStone(gridX, gridY);
    }
}

// --- 石を置く処理 ---
function placeStone(x, y) {
    board[y][x] = currentPlayer; // 石を置く
    drawBoard(); // 盤面を再描画

    if (checkWin(x, y, currentPlayer)) {
        statusMessage.textContent = (currentPlayer === 1 ? '黒' : '白') + 'の勝ちです！';
        statusMessage.style.color = 'red';
        gameOver = true;
    } else if (checkDraw()) {
        statusMessage.textContent = '引き分けです！';
        statusMessage.style.color = 'orange';
        gameOver = true;
    } else {
        currentPlayer = (currentPlayer === 1) ? 2 : 1; // ターンを交代
        statusMessage.textContent = (currentPlayer === 1 ? '黒' : '白') + 'のターンです';
        statusMessage.style.color = '#4CAF50'; // ターン交代メッセージの色
    }
}

// --- 勝敗判定 ---
function checkWin(x, y, player) {
    // 8方向 (横、縦、斜め2方向) をチェック
    const directions = [
        { dx: 1, dy: 0 },  // 右
        { dx: 0, dy: 1 },  // 下
        { dx: 1, dy: 1 },  // 右下
        { dx: 1, dy: -1 }  // 右上
    ];

    for (let dir of directions) {
        let count = 1; // 現在置いた石も含む
        // 正方向
        for (let i = 1; i < 5; i++) {
            const nx = x + dir.dx * i;
            const ny = y + dir.dy * i;
            if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE && board[ny][nx] === player) {
                count++;
            } else {
                break;
            }
        }
        // 逆方向
        for (let i = 1; i < 5; i++) {
            const nx = x - dir.dx * i;
            const ny = y - dir.dy * i;
            if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE && board[ny][nx] === player) {
                count++;
            } else {
                break;
            }
        }
        if (count >= 5) {
            return true; // 5つ以上並んだら勝ち
        }
    }
    return false;
}

// --- 引き分け判定 ---
function checkDraw() {
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            if (board[y][x] === 0) {
                return false; // 空きマスがあれば引き分けではない
            }
        }
    }
    return true; // 全てのマスが埋まったら引き分け
}

// --- イベントリスナー ---
canvas.addEventListener('mousedown', handleInput);
canvas.addEventListener('touchstart', handleInput);
resetButton.addEventListener('click', initializeGame);

// --- 初期化 ---
initializeGame(); // ページ読み込み時にゲームを初期化
