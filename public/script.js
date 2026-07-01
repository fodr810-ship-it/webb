const socket = io();
let myRoomId = '';
let myUsername = '';
let isHost = false;

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function joinRoom() {
    myUsername = document.getElementById('username').value;
    myRoomId = document.getElementById('roomId').value || Math.random().toString(36).substring(2, 8).toUpperCase();
    
    if (!myUsername) return alert('تكفى اكتب اسمك!');
    
    socket.emit('joinRoom', { username: myUsername, roomId: myRoomId });
    document.getElementById('displayRoomId').innerText = myRoomId;
    showScreen('lobbyScreen');
}

socket.on('isHost', () => {
    isHost = true;
    document.getElementById('hostControls').style.display = 'block';
    document.getElementById('gameHostControls').style.display = 'block';
});

socket.on('updatePlayers', (players) => {
    const list = document.getElementById('playersList');
    const gameList = document.getElementById('gamePlayersList');
    
    list.innerHTML = '';
    if(gameList) gameList.innerHTML = '';

    players.forEach(p => {
        list.innerHTML += `<div class="player-tag">${p.name}</div>`;
        if(gameList) {
            gameList.innerHTML += `<div class="player-tag game-player-tag" data-name="${p.name}">${p.name}</div>`;
        }
    });
});

function startGame() {
    const category = document.getElementById('categorySelect').value;
    socket.emit('startGame', { roomId: myRoomId, category });
}

socket.on('gameStarted', (data) => {
    document.getElementById('secretWord').innerText = data.word;
    // إذا كان المندس (تطلع له العبارة بالأحمر)
    if(data.word === 'أنت برا السالفة!') {
        document.getElementById('secretWord').style.color = '#ef4444';
    } else {
        document.getElementById('secretWord').style.color = '#10b981';
    }
    showScreen('gameScreen');
});

socket.on('nextTurn', (playerName) => {
    document.getElementById('currentTurn').innerText = playerName;
    
    if (playerName === myUsername) {
        document.getElementById('nextTurnBtn').style.display = 'block';
    } else {
        document.getElementById('nextTurnBtn').style.display = 'none';
    }

    document.querySelectorAll('.game-player-tag').forEach(tag => {
        if (tag.getAttribute('data-name') === playerName) {
            tag.classList.add('active-turn');
        } else {
            tag.classList.remove('active-turn');
        }
    });
});

function passTurn() {
    socket.emit('passTurn', myRoomId);
    document.getElementById('nextTurnBtn').style.display = 'none';
}

function startVote() { socket.emit('startVote', myRoomId); }

socket.on('votingStarted', (players) => {
    const options = document.getElementById('voteOptions');
    options.innerHTML = '';
    players.forEach(p => {
        options.innerHTML += `<button onclick="submitVote('${p.id}')">${p.name}</button>`;
    });
    showScreen('voteScreen');
});

function submitVote(votedId) {
    socket.emit('submitVote', { roomId: myRoomId, votedId });
    document.getElementById('voteOptions').innerHTML = '<h3>تم تسجيل تصويتك، ننتظر الباقين...</h3>';
}

socket.on('imposterCaught', (wordsArray) => {
    const options = document.getElementById('guessOptions');
    options.innerHTML = '';
    wordsArray.forEach(word => {
        options.innerHTML += `<button onclick="guessWord('${word}')">${word}</button>`;
    });
    showScreen('guessScreen');
});

function guessWord(guess) {
    socket.emit('guessWord', { roomId: myRoomId, guess });
}

socket.on('gameOver', (data) => {
    // الإصلاح هنا: حافظنا على id="resultMessage" عشان ما يعلق المتصفح بالجولة اللي بعدها
    document.getElementById('resultScreen').innerHTML = `
        <h1 id="resultMessage">${data.message}</h1>
        <button onclick="restartGame()">لعب دور جديد في نفس الغرفة</button>
    `;
    showScreen('resultScreen');
});

// في ملف script.js
function restartGame() {
    // إرسال أمر تصفير الغرفة
    socket.emit('resetRoom', myRoomId); 
    showScreen('lobbyScreen');
}

// استقبال أمر انتظار المندس
socket.on('waitingForGuess', (data) => {
    // اللي مو مندس تطلع له شاشة انتظار
    const guessScreen = document.getElementById('guessScreen');
    if (guessScreen.classList.contains('active')) return; // إذا كان هو المندس لا تغطي عليه
    
    // إصلاح إضافي: نتأكد إن العنصر موجود قبل نعدل عليه لتفادي أي كراش
    let msgElement = document.getElementById('resultMessage');
    if (msgElement) {
        msgElement.innerText = data.message;
    } else {
        document.getElementById('resultScreen').innerHTML = `<h1 id="resultMessage">${data.message}</h1>`;
    }
    showScreen('resultScreen');
});