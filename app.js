const subjectsConfig = [
  { name: 'Anayasa', file: 'anayasa.json' },
  // Yeni ders eklemek için: { name: 'Ders Adı', file: 'dersadı.json' }
];

const EXAM_DATE = new Date('2025-12-20T00:00:00');

let currentSubject = null;
let questions = [];
let currentQuestionIndex = 0;
let currentMode = '';
let userAnswers = [];
let selectedQuestions = [];

function startCountdown() {
  const timerElement = document.getElementById('timer');
  const updateTimer = () => {
    const now = new Date();
    const timeDiff = EXAM_DATE - now;
    if (timeDiff <= 0) {
      timerElement.textContent = 'Sınav Zamanı Geldi! Başarılar!';
      return;
    }
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    timerElement.textContent = `${days} Gün ${hours} Saat ${minutes} Dakika ${seconds} Saniye`;
  };
  updateTimer();
  setInterval(updateTimer, 1000);
}

function loadSubjects() {
  const subjectsDiv = document.getElementById('subjects');
  subjectsDiv.innerHTML = '';
  subjectsConfig.forEach(subject => {
    const button = document.createElement('button');
    button.textContent = subject.name;
    button.addEventListener('click', () => showSubjectMenu(subject));
    subjectsDiv.appendChild(button);
  });
}

function showSubjectMenu(subject) {
  currentSubject = subject;
  document.getElementById('home-screen').style.display = 'none';
  document.getElementById('subject-menu').style.display = 'block';
  document.getElementById('subject-title').textContent = subject.name;
}

function loadQuestions(file, callback) {
  fetch(file)
    .then(response => response.json())
    .then(data => {
      questions = data;
      callback();
    })
    .catch(error => console.error('Soru yükleme hatası:', error));
}

function startQuiz(mode) {
  currentMode = mode;
  currentQuestionIndex = 0;
  userAnswers = [];
  document.getElementById('subject-menu').style.display = 'none';
  document.getElementById('quiz-screen').style.display = 'block';
  document.getElementById('quiz-title').textContent = currentSubject.name;
  if (mode === 'test') {
    selectedQuestions = questions.sort(() => Math.random() - 0.5).slice(0, 20);
    document.getElementById('prev-question').style.display = 'none';
  } else {
    selectedQuestions = questions;
    const savedIndex = localStorage.getItem(`${currentSubject.name}_progress`);
    currentQuestionIndex = savedIndex ? parseInt(savedIndex) : 0;
    document.getElementById('prev-question').style.display = 'inline';
  }
  showQuestion();
}

function showQuestion() {
  const question = selectedQuestions[currentQuestionIndex];
  document.getElementById('question-number').textContent = `Soru ${currentQuestionIndex + 1}/${selectedQuestions.length}`;
  document.getElementById('question-text').textContent = question.question;
  const optionsDiv = document.getElementById('options');
  optionsDiv.innerHTML = '';
  question.options.forEach((option, index) => {
    const optionDiv = document.createElement('div');
    optionDiv.className = 'option';
    optionDiv.textContent = option;
    optionDiv.addEventListener('click', () => handleAnswer(index));
    optionsDiv.appendChild(optionDiv);
  });
  document.getElementById('feedback').textContent = '';
  document.getElementById('explanation').textContent = '';
  document.getElementById('next-question').textContent = currentQuestionIndex === selectedQuestions.length - 1 && currentMode === 'test' ? 'Sınavı Bitir' : 'İleri';
}

function handleAnswer(selectedIndex) {
  const question = selectedQuestions[currentQuestionIndex];
  const options = document.querySelectorAll('.option');
  const isCorrect = selectedIndex === question.correctAnswer;
  options[selectedIndex].classList.add(isCorrect ? 'correct' : 'wrong');
  if (currentMode === 'review') {
    options[question.correctAnswer].classList.add('correct');
    document.getElementById('feedback').textContent = isCorrect ? 'Doğru!' : 'Yanlış!';
    document.getElementById('explanation').textContent = question.explanation;
  } else {
    userAnswers.push({ questionIndex: currentQuestionIndex, selectedIndex, isCorrect });
  }
}

function nextQuestion() {
  if (currentMode === 'review') {
    localStorage.setItem(`${currentSubject.name}_progress`, currentQuestionIndex + 1);
  }
  if (currentQuestionIndex < selectedQuestions.length - 1) {
    currentQuestionIndex++;
    showQuestion();
  } else if (currentMode === 'test') {
    showResults();
  }
}

function prevQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    showQuestion();
  }
}

function showResults() {
  document.getElementById('quiz-screen').style.display = 'none';
  document.getElementById('result-screen').style.display = 'block';
  const correctCount = userAnswers.filter(answer => answer.isCorrect).length;
  document.getElementById('score').textContent = `${selectedQuestions.length} sorudan ${correctCount} doğru, ${selectedQuestions.length - correctCount} yanlış yaptınız.`;
  const wrongAnswersDiv = document.getElementById('wrong-answers');
  wrongAnswersDiv.innerHTML = '<h3>Yanlış Yanıtladığınız Sorular:</h3>';
  userAnswers.forEach(answer => {
    if (!answer.isCorrect) {
      const question = selectedQuestions[answer.questionIndex];
      const div = document.createElement('div');
      div.innerHTML = `<p><strong>Soru ${answer.questionIndex + 1}:</strong> ${question.question}<br><strong>Seçtiğiniz cevap:</strong> ${question.options[answer.selectedIndex]}<br><strong>Doğru cevap:</strong> ${question.options[question.correctAnswer]}</p>`;
      wrongAnswersDiv.appendChild(div);
    }
  });
}

document.getElementById('review-mode').addEventListener('click', () => startQuiz('review'));
document.getElementById('test-mode').addEventListener('click', () => startQuiz('test'));
document.getElementById('back-to-home').addEventListener('click', () => {
  document.getElementById('subject-menu').style.display = 'none';
  document.getElementById('home-screen').style.display = 'block';
});
document.getElementById('prev-question').addEventListener('click', prevQuestion);
document.getElementById('next-question').addEventListener('click', nextQuestion);
document.getElementById('restart-quiz').addEventListener('click', () => {
  document.getElementById('result-screen').style.display = 'none';
  startQuiz('test');
});
document.getElementById('back-to-subject').addEventListener('click', () => {
  document.getElementById('result-screen').style.display = 'none';
  document.getElementById('subject-menu').style.display = 'block';
});

document.addEventListener('DOMContentLoaded', () => {
  startCountdown();
  loadSubjects();
  loadQuestions(subjectsConfig[0].file, () => {});
});
