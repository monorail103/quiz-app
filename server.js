const express = require('express');
const bodyParser = require('body-parser');
const csv = require('csv-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

let questions = [];

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/upload', upload.single('csvFile'), (req, res) => {
    questions = [];

    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (row) => {
            questions.push(row);
        })
        .on('end', () => {
            fs.unlinkSync(req.file.path);
            res.redirect('/quiz');
        });
});

app.get('/quiz', (req, res) => {
    if (questions.length === 0) {
        return res.redirect('/');
    }
    res.render('quiz', { question: questions[0], result: null, isCorrect: null });
});

app.post('/submit', (req, res) => {
    const userAnswer = req.body.answer;
    const unknown = req.body.unknown;
    const correctAnswer = questions[0].答え;
    const isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
    const result = isCorrect ? '正解！' : `不正解！正解は ${correctAnswer} です。`;

    questions.shift();

    if (questions.length === 0) {
        return res.render('result', { result: '全ての問題に答えました！' });
    }

    res.render('quiz', { question: questions[0], result, isCorrect });
});

// 途中で終了する場合
app.post('/quit', (req, res) => {
    questions = [];
    res.redirect('/');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});