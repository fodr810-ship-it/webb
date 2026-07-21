const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const categories = {
    "أكل": ["بيتزا", "شاورما", "برجر", "سوشي", "كبسة", "مندي", "باستا", "مضغوط", "حنيذ", "مظبي", "مثلوثة", "جريش", "قرصان", "مرقوق", "سليق", "مطازيز", "عصيدة", "عريكة", "معصوب", "حيسة", "مقلوبة", "مطبق", "كابلي", "بخاري", "زربيان", "مجبوس", "هريس", "ثريد", "مضروبة", "برياني", "دجاج بالزبدة", "تيكا مسالا", "كاري لحم", "كاري دجاج", "تندوري", "دال", "حمص", "متبل", "بابا غنوج", "فلافل", "تبولة", "فتوش", "ورق عنب", "محشي كوسا", "محشي باذنجان", "محشي كرنب", "ممبار", "كشري", "ملوخية", "بامية", "فاصوليا", "لوبيا", "بسلة باللحم", "طاجن بامية", "مسقعة", "كفتة داوود باشا", "حواوشي", "رقاق باللحم", "مكرونة بالبشاميل", "كباب", "شيش طاووق", "أوصال", "ريش مشوية", "عرايس", "كبة مقلية", "كبة لبنية", "كبة نية", "كبة بالصينية", "شيش برك", "منسف", "مسخن", "صفيحة", "مناقيش", "شاورما عربي", "طعمية", "فول مدمس", "كبدة إسكندراني", "كبدة غنم", "مقلقل لحم", "مقلقل دجاج", "سمبوسة", "سبرينج رول", "بطاطس مقلية", "بطاطا حرة", "ودجز", "هاش براون", "ناجتس", "زنجر", "بروستد", "هوت دوج", "تاكو", "بوريتو", "فاهيتا", "كاساديا", "نودلز", "رامن", "أودون", "دجاج كانتون", "دجاج ترياكي", "لحم منغولي", "دجاج حامض حلو", "ديم سم", "باد تاي", "توم يام", "لازانيا", "رافيولي", "فيتوتشيني", "سباغيتي", "ماك أند تشيز", "ريزوتو", "ستيك", "بيف ستروجانوف", "كوردون بلو", "إسكالوب", "روست بيف", "سمك مشوي", "سمك مقلي", "صيادية", "ربيان مشوي", "ربيان مقلي", "ديناميت شريمب", "استاكوزا", "كابوريا", "كالاماري", "محار", "طاجن سمك", "كسكسي", "طاجين دجاج", "طاجين لحم", "حريرة", "بسطيلة", "لبلابي", "شكشوكة", "أومليت", "بيض مسلوق", "بيض عيون", "شوربة عدس", "شوربة فطر", "شوربة دجاج", "شوربة بصل", "شوربة سي فود", "سلطة سيزر", "سلطة يونانية", "سلطة جرجير", "سلطة تونة", "جوانح دجاج", "حلقات بصل", "أصابع الموزاريلا", "بيكاتا", "تشيلي كون كارني"],
    "دول": ["السعودية", "اليابان", "إيطاليا", "البرازيل", "مصر", "إسبانيا", "الصين", "المغرب", "الجزائر", "تونس", "ليبيا", "السودان", "الأردن", "لبنان", "سوريا", "العراق", "الكويت", "الإمارات", "البحرين", "قطر", "عمان", "اليمن", "فلسطين", "تركيا", "إيران", "الهند", "باكستان", "إندونيسيا", "ماليزيا", "كوريا الجنوبية", "أستراليا", "نيوزيلندا", "كندا", "الولايات المتحدة", "المكسيك", "الأرجنتين", "تشيلي", "كولومبيا", "بيرو", "المملكة المتحدة", "فرنسا", "ألمانيا", "روسيا", "السويد", "النرويج", "سويسرا", "هولندا", "بلجيكا", "اليونان", "جنوب أفريقيا"],
    "أماكن":["مدرسة", "مستشفى", "مطار", "ملعب", "سينما", "حديقة", "مطعم", "مسجد", "جامعة", "مكتبة", "فندق", "بنك", "متحف", "مركز شرطة", "محطة قطار", "محطة وقود", "صالة رياضية", "مسرح", "مول", "مقهى", "صيدلية", "مخبز", "ميناء", "مصنع", "عيادة", "بقالة", "مزرعة", "قصر", "شاطئ", "مدينة ملاهي"],
    "أجهزة":["آيفون", "آيباد", "ماك بوك", "بلايستيشن", "إكس بوكس", "نينتندو سويتش", "جالكسي", "أبل واتش", "إيربودز", "راوتر", "مودم", "رسيفر", "شاشة ذكية", "كيندل", "جوبرو", "طائرة درون", "أليكسا", "جوجل هوم", "أبل تي في", "كروم كاست", "ماوس لاسلكي", "كيبورد ميكانيكي", "طابعة ليزر", "ماسح ضوئي", "بروجكتر", "لابتوب", "تابلت", "كاميرا احترافية", "رينج لايت", "مايكروفون", "سماعات محيطية", "شاحن لاسلكي", "باور بانك", "داش كام", "كاميرا مراقبة", "قفل ذكي", "مكنسة روبوت", "قلاية هوائية", "صانعة إسبريسو", "مطحنة قهوة", "عجانة", "محضرة طعام", "ميزان ذكي", "جهاز مساج", "فرشاة أسنان كهربائية", "جهاز تنقية الهواء", "موزع إنترنت", "سكوتر كهربائي", "نظارة واقع افتراضي", "جهاز تتبع"]
};

let rooms = {};

io.on('connection', (socket) => {
    socket.on('joinRoom', ({ username, roomId }) => {
        socket.join(roomId);
        if (!rooms[roomId]) {
            rooms[roomId] = { players: [], host: socket.id, state: 'waiting', votes: {} };
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
            room.votes = {}; // تصفير الأصوات لبداية جولة جديدة
            
            let words = categories[category];
            let secretWordIndex = Math.floor(Math.random() * words.length);
            let secretWord = words[secretWordIndex];
            
            let fakeWordIndex = Math.floor(Math.random() * words.length);
            while(fakeWordIndex === secretWordIndex) {
                fakeWordIndex = Math.floor(Math.random() * words.length);
            }
            let fakeWord = words[fakeWordIndex];
            
            let imposterIndex = Math.floor(Math.random() * room.players.length);
            
            room.secretWord = secretWord;
            room.category = category;
            
            room.players.forEach((player, index) => {
                player.isImposter = (index === imposterIndex);
                if (player.isImposter) {
                    io.to(player.id).emit('gameStarted', { role: 'imposter', word: 'أنت برا السالفة!' });
                } else {
                    io.to(player.id).emit('gameStarted', { role: 'normal', word: secretWord });
                }
            });

            room.currentTurnIndex = Math.floor(Math.random() * room.players.length);
            io.to(roomId).emit('nextTurn', room.players[room.currentTurnIndex].name);
        }
    });

    socket.on('passTurn', (roomId) => {
        let room = rooms[roomId];
        if (room) {
            room.currentTurnIndex = (room.currentTurnIndex + 1) % room.players.length;
            io.to(roomId).emit('nextTurn', room.players[room.currentTurnIndex].name);
        }
    });

    socket.on('startVote', (roomId) => {
        io.to(roomId).emit('votingStarted', rooms[roomId].players);
    });

    socket.on('submitVote', ({ roomId, votedId }) => {
        let room = rooms[roomId];
        if (!room) return;
        
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
                io.to(roomId).emit('waitingForGuess', { message: 'تم كشف المندس، جاري الانتظار...' });
            } else {
                io.to(roomId).emit('gameOver', { message: `فاز المندس! السالفة كانت: ${room.secretWord}` });
            }
        }
    });

    socket.on('guessWord', ({ roomId, guess }) => {
        let room = rooms[roomId];
        if (room && guess === room.secretWord) {
            io.to(roomId).emit('gameOver', { message: 'المندس ذكي وجاب السالفة! فاز المندس!' });
        } else {
            io.to(roomId).emit('gameOver', { message: `المندس جاب العيد! السالفة كانت: ${room.secretWord}` });
        }
    });

    // إضافة الـ resetRoom داخل الـ connection
    socket.on('resetRoom', (roomId) => {
        if (rooms[roomId]) {
            rooms[roomId].votes = {}; 
            rooms[roomId].state = 'waiting';
            io.to(roomId).emit('updatePlayers', rooms[roomId].players);
        }
    });

    // الإصلاح المضاف لمعالجة خروج اللاعبين وتفادي التعليق
    socket.on('disconnect', () => {
        for (const roomId in rooms) {
            let room = rooms[roomId];
            let playerIndex = room.players.findIndex(p => p.id === socket.id);
            
            if (playerIndex !== -1) {
                // إزالة اللاعب من الغرفة
                room.players.splice(playerIndex, 1); 
                io.to(roomId).emit('updatePlayers', room.players);
                
                // تنظيف السيرفر: إذا خرج الجميع، احذف الغرفة بالكامل
                if (room.players.length === 0) {
                    delete rooms[roomId];
                }
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));