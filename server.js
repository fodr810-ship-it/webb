const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const categories = {
    "أكل": ["بيتزا", "شاورما", "برجر", "سوشي", "كبسة", "مندي", "باستا"],
    "دول": ["السعودية", "اليابان", "إيطاليا", "البرازيل", "مصر", "إسبانيا", "الصين"],
    "أماكن": ["مدرسة", "مستشفى", "مطار", "ملعب", "سينما", "حديقة", "مطعم"]
};

let rooms = {};

io.on('connection', (socket) => {
    socket.on('joinRoom', ({ username, roomId }) => {
        socket.join(roomId);
        if (!rooms[roomId]) {
            rooms[roomId] = { players: [], host: socket.id, state: 'waiting' };
        }
        rooms[roomId].players.push({ id: socket.id, name: username, isImposter: false });
        io.to(roomId).emit('updatePlayers', rooms[roomId].players);
        
        if (rooms[roomId].host === socket.id) {
            socket.emit('isHost');
        }
    });

    socket.on('startGame', ({ roomId, category }) => {
        let room = rooms[roomId];
        if (room && room.players.length > 2) {
            let words = categories[category];
            
            // اختيار كلمة للناس الطبيعيين
            let secretWordIndex = Math.floor(Math.random() * words.length);
            let secretWord = words[secretWordIndex];
            
            // اختيار كلمة مختلفة للمندس من نفس التصنيف
            let fakeWordIndex = Math.floor(Math.random() * words.length);
            while(fakeWordIndex === secretWordIndex) { // نتأكد إنها ما تكون نفس الكلمة
                fakeWordIndex = Math.floor(Math.random() * words.length);
            }
            let fakeWord = words[fakeWordIndex];
            
            let imposterIndex = Math.floor(Math.random() * room.players.length);
            
            room.secretWord = secretWord;
            room.category = category;
            room.votes = {};
            
            room.players.forEach((player, index) => {
                player.isImposter = (index === imposterIndex);
                if (player.isImposter) {
                    // نعطي المندس الكلمة المزيفة بدون ما نعلمه إنه المندس
                    io.to(player.id).emit('gameStarted', { role: 'imposter', word: fakeWord });
                } else {
                    io.to(player.id).emit('gameStarted', { role: 'normal', word: secretWord });
                }
            });

            // نظام الدور
            room.currentTurnIndex = Math.floor(Math.random() * room.players.length);
            io.to(roomId).emit('nextTurn', room.players[room.currentTurnIndex].name);
        }
    });

    // حدث جديد: زر انتقال الدور للي بعده
    socket.on('passTurn', (roomId) => {
        let room = rooms[roomId];
        if (room) {
            // ننتقل للاعب اللي بعده في القائمة
            room.currentTurnIndex = (room.currentTurnIndex + 1) % room.players.length;
            io.to(roomId).emit('nextTurn', room.players[room.currentTurnIndex].name);
        }
    });

    socket.on('startVote', (roomId) => {
        io.to(roomId).emit('votingStarted', rooms[roomId].players);
    });

    socket.on('submitVote', ({ roomId, votedId }) => {
        let room = rooms[roomId];
        room.votes[votedId] = (room.votes[votedId] || 0) + 1;
        
        let totalVotes = Object.values(room.votes).reduce((a, b) => a + b, 0);
        if (totalVotes === room.players.length) {
            let highestVotes = 0;
            let votedOut = null;
            for (let id in room.votes) {
                if (room.votes[id] > highestVotes) {
                    highestVotes = room.votes[id];
                    votedOut = id;
                }
            }
            
            let imposter = room.players.find(p => p.isImposter);
            if (votedOut === imposter.id) {
                io.to(imposter.id).emit('imposterCaught', categories[room.category]);
                socket.to(roomId).emit('gameOver', { message: 'تم كشف المندس! ننتظر تخمينه للسالفة...' });
            } else {
                io.to(roomId).emit('gameOver', { message: `فاز المندس! السالفة كانت: ${room.secretWord}` });
            }
        }
    });

    socket.on('guessWord', ({ roomId, guess }) => {
        let room = rooms[roomId];
        if (guess === room.secretWord) {
            io.to(roomId).emit('gameOver', { message: 'المندس ذكي وجاب السالفة! فاز المندس!' });
        } else {
            io.to(roomId).emit('gameOver', { message: `المندس جاب العيد! السالفة كانت: ${room.secretWord}` });
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));