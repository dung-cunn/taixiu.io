// === BIẾN TOÀN CỤC ===
let balance = 1000000;
let betAmount = 10000;
let historyList = [];
let isRolling = false;
let lastResult = null;

// Số liệu thống kê
let stats = { total: 0, tai: 0, xiu: 0, triple: 0 };

// Đếm cầu
let cauCounts = {
    'cau-tai': 0,
    'cau-xiu': 0,
    'cau-dao': 0,
    'cau-chan': 0,
    'cau-le': 0,
    'cau-tron': 0
};

// DOM Elements
const balanceEl = document.getElementById('balance');
const betAmountEl = document.getElementById('betAmount');
const resultEl = document.getElementById('resultDisplay');
const dice1El = document.getElementById('dice1');
const dice2El = document.getElementById('dice2');
const dice3El = document.getElementById('dice3');
const historyListEl = document.getElementById('historyList');
const controlsEl = document.getElementById('controls');
const newRoundBtn = document.getElementById('newRoundBtn');
const totalGamesEl = document.getElementById('totalGames');
const taiCountEl = document.getElementById('taiCount');
const xiuCountEl = document.getElementById('xiuCount');
const tripleCountEl = document.getElementById('tripleCount');

// Format tiền
function formatMoney(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Lấy emoji xúc xắc
function getDiceEmoji(n) {
    return ['⚀','⚁','⚂','⚃','⚄','⚅'][n-1];
}

// === HÀM LẮC ===
function rollDice() {
    let d1 = Math.floor(Math.random() * 6) + 1;
    let d2 = Math.floor(Math.random() * 6) + 1;
    let d3 = Math.floor(Math.random() * 6) + 1;
    return { d1, d2, d3, total: d1 + d2 + d3 };
}

// === HÀM CHƠI ===
function play(choice) {
    if (isRolling) return;
    
    betAmount = parseInt(betAmountEl.value) || 0;
    if (betAmount <= 0 || isNaN(betAmount)) {
        alert('Nhập tiền cược hợp lệ!');
        return;
    }
    if (betAmount > balance) {
        alert('Không đủ tiền!');
        return;
    }

    isRolling = true;
    balance -= betAmount;
    balanceEl.innerText = formatMoney(balance);
    
    // Ẩn nút cũ, hiện loading
    controlsEl.style.display = 'none';
    newRoundBtn.classList.remove('show');
    resultEl.className = 'result-display wait';
    resultEl.innerHTML = '🎲 Đang lắc...';
    
    // Animation lắc xúc xắc
    dice1El.classList.add('shake');
    dice2El.classList.add('shake');
    dice3El.classList.add('shake');
    
    // Hiệu ứng lắc liên tục
    let shuffleCount = 0;
    let shuffleInterval = setInterval(() => {
        let temp = rollDice();
        dice1El.innerText = getDiceEmoji(temp.d1);
        dice2El.innerText = getDiceEmoji(temp.d2);
        dice3El.innerText = getDiceEmoji(temp.d3);
        shuffleCount++;
    }, 100);
    
    // Sau 1 giây thì hiện kết quả
    setTimeout(() => {
        clearInterval(shuffleInterval);
        
        let result = rollDice();
        
        // Hiển thị kết quả cuối cùng
        dice1El.innerText = getDiceEmoji(result.d1);
        dice2El.innerText = getDiceEmoji(result.d2);
        dice3El.innerText = getDiceEmoji(result.d3);
        
        dice1El.classList.remove('shake');
        dice2El.classList.remove('shake');
        dice3El.classList.remove('shake');
        
        // Xác định kết quả
        let isTriple = (result.d1 === result.d2 && result.d2 === result.d3);
        let resultType = '';
        let resultText = '';
        
        if (isTriple) {
            resultType = 'triple';
            resultText = '🔒 TAM HOA! (' + result.total + ')';
        } else if (result.total >= 11 && result.total <= 17) {
            resultType = 'tai';
            resultText = 'TÀI (' + result.total + ')';
        } else {
            resultType = 'xiu';
            resultText = 'XỈU (' + result.total + ')';
        }
        
        // Kiểm tra thắng/thua
        let win = false;
        let displayText = '';
        
        if (isTriple) {
            displayText = '💰 ' + resultText + ' - Nhà cái thắng!';
            resultEl.className = 'result-display triple';
        } else if (choice === resultType) {
            win = true;
            balance += betAmount * 2;
            displayText = '🎉 THẮNG! ' + resultText;
            resultEl.className = 'result-display ' + resultType;
        } else {
            displayText = '💀 THUA! ' + resultText;
            resultEl.className = 'result-display ' + resultType;
        }
        
        resultEl.innerHTML = displayText;
        balanceEl.innerText = formatMoney(balance);
        
        // Lưu kết quả
        lastResult = resultType;
        
        // Cập nhật lịch sử
        addHistory(resultType, result.total);
        
        // Cập nhật thống kê
        updateStats(resultType);
        
        // Cập nhật cầu
        updateCau(resultType, result.total);
        
        // Hiện nút ván mới
        isRolling = false;
        newRoundBtn.classList.add('show');
        
        // Kiểm tra hết tiền
        if (balance <= 0) {
            setTimeout(() => {
                alert('😢 Hết tiền! Reset lại...');
                resetGame();
            }, 500);
        }
        
    }, 1000);
}

// === VÁN MỚI ===
function newRound() {
    newRoundBtn.classList.remove('show');
    controlsEl.style.display = 'flex';
    resultEl.className = 'result-display wait';
    resultEl.innerHTML = '➖ Chọn Tài hoặc Xỉu!';
}

// === THÊM LỊCH SỬ ===
function addHistory(type, total) {
    let label = type === 'tai' ? 'T' : (type === 'xiu' ? 'X' : 'TH');
    
    historyList.unshift({ type: type, total: total, label: label });
    
    // Giữ 15 ván gần nhất
    if (historyList.length > 15) {
        historyList.pop();
    }
    
    // Hiển thị
    historyListEl.innerHTML = historyList.map(item => 
        '<div class="history-item ' + item.type + '">' + item.label + '</div>'
    ).join('');
}

// === CẬP NHẬT THỐNG KÊ ===
function updateStats(resultType) {
    stats.total++;
    
    if (resultType === 'tai') stats.tai++;
    else if (resultType === 'xiu') stats.xiu++;
    else if (resultType === 'triple') stats.triple++;
    
    totalGamesEl.innerText = stats.total;
    taiCountEl.innerText = stats.tai;
    xiuCountEl.innerText = stats.xiu;
    tripleCountEl.innerText = stats.triple;
}

// === CẬP NHẬT CẦU ===
function updateCau(resultType, total) {
    // Cầu Tài / Xỉu liên tiếp
    if (resultType === 'tai') {
        cauCounts['cau-tai']++;
        cauCounts['cau-xiu'] = 0;
    } else if (resultType === 'xiu') {
        cauCounts['cau-xiu']++;
        cauCounts['cau-tai'] = 0;
    } else if (resultType === 'triple') {
        cauCounts['cau-tai'] = 0;
        cauCounts['cau-xiu'] = 0;
        cauCounts['cau-tron']++;
    }
    
    // Cầu Chẵn / Lẻ
    if (resultType !== 'triple') {
        if (total % 2 === 0) {
            cauCounts['cau-chan']++;
            cauCounts['cau-le'] = 0;
        } else {
            cauCounts['cau-le']++;
            cauCounts['cau-chan'] = 0;
        }
        
        // Cầu Tròn (tổng = 10 hoặc 11)
        if (total === 10 || total === 11) {
            cauCounts['cau-tron']++;
        } else {
            cauCounts['cau-tron'] = 0;
        }
    }
    
    // Cầu Đảo (T-X-T-X hoặc X-T-X-T)
    if (historyList.length >= 2) {
        let last2 = historyList[0].type;
        let last1 = historyList[1].type;
        
        if ((last1 === 'tai' && last2 === 'xiu') || 
            (last1 === 'xiu' && last2 === 'tai')) {
            cauCounts['cau-dao']++;
        } else {
            cauCounts['cau-dao'] = 0;
        }
    }
    
    // Hiển thị cầu
    document.getElementById('cau-tai').innerText = cauCounts['cau-tai'];
    document.getElementById('cau-xiu').innerText = cauCounts['cau-xiu'];
    document.getElementById('cau-chan').innerText = cauCounts['cau-chan'];
    document.getElementById('cau-le').innerText = cauCounts['cau-le'];
    document.getElementById('cau-tron').innerText = cauCounts['cau-tron'];
    document.getElementById('cau-dao').innerText = cauCounts['cau-dao'];
    
    // Highlight cầu đang "nóng"
    let maxCau = Math.max(
        cauCounts['cau-tai'], 
        cauCounts['cau-xiu'], 
        cauCounts['cau-chan'],
        cauCounts['cau-le']
    );
    
    // Bỏ highlight cũ
    document.querySelectorAll('.cau-item').forEach(el => el.classList.remove('hot'));
    
    // Highlight cầu cao nhất
    if (maxCau >= 2) {
        if (cauCounts['cau-tai'] === maxCau) {
            document.querySelector('[data-cau="cau-tai"]').classList.add('hot');
        }
        if (cauCounts['cau-xiu'] === maxCau) {
            document.querySelector('[data-cau="cau-xiu"]').classList.add('hot');
        }
        if (cauCounts['cau-chan'] === maxCau) {
            document.querySelector('[data-cau="cau-chan"]').classList.add('hot');
        }
        if (cauCounts['cau-le'] === maxCau) {
            document.querySelector('[data-cau="cau-le"]').classList.add('hot');
        }
    }
}

// === RESET GAME ===
function resetGame() {
    balance = 1000000;
    historyList = [];
    lastResult = null;
    
    stats = { total: 0, tai: 0, xiu: 0, triple: 0 };
    cauCounts = {
        'cau-tai': 0, 'cau-xiu': 0, 'cau-dao': 0,
        'cau-chan': 0, 'cau-le': 0, 'cau-tron': 0
    };
    
    balanceEl.innerText = formatMoney(balance);
    
    historyListEl.innerHTML = '<span style="color: #666; font-size: 12px;">Chưa có ván nào</span>';
    
    totalGamesEl.innerText = '0';
    taiCountEl.innerText = '0';
    xiuCountEl.innerText = '0';
    tripleCountEl.innerText = '0';
    
    document.getElementById('cau-tai').innerText = '0';
    document.getElementById('cau-xiu').innerText = '0';
    document.getElementById('cau-chan').innerText = '0';
    document.getElementById('cau-le').innerText = '0';
    document.getElementById('cau-tron').innerText = '0';
    document.getElementById('cau-dao').innerText = '0';
    
    newRoundBtn.classList.remove('show');
    controlsEl.style.display = 'flex';
    resultEl.className = 'result-display wait';
    resultEl.innerHTML = '🎮 Game mới! Đặt cược đi!';
    
    dice1El.innerText = '🎲';
    dice2El.innerText = '🎲';
    dice3El.innerText = '🎲';
}

// Khởi tạo
balanceEl.innerText = formatMoney(balance);
betAmountEl.value = betAmount;