document.addEventListener("DOMContentLoaded", () => {

    const subjectsConfig = [
        { name: "Anayasa", file: "anayasa.json" },
        { name: "Disiplin Kanunu", file: "disiplinkanunu.json" },
        { name: "İç Hizmet Kanunu", file: "ichizmetkanunu.json" },
        { name: "İç Hizmet Yönetmeliği", file: "ichizmetyonetmeligi.json" },
        { name: "Siyasi Tarih", file: "siyasitarih.json" },
        { name: "Türkiye Cumhuriyeti Tarihi", file: "tctarihi.json" },
        { name: "Basında Güncel Olaylar", file: "guncelolaylar.json" },
        { name: "Uluslararası Hukuk", file: "uluslararasihukuk.json" },
        { name: "MSB Yazışma Usulleri", file: "msbyazisma.json" },
        { name: "İdare Hukuku", file: "idarehukuku.json" }
    ];

    const loadedQuestionsCache = {};
    let currentQuizQuestions = [];
    let userAnswers = [];
    let currentQuestionIndex = 0;
    let selectedSubject = null;
    let currentMode = '';

    const screens = {
        mainMenu: document.getElementById("screen-main-menu"),
        subjectMenu: document.getElementById("screen-subject-menu"),
        quiz: document.getElementById("screen-quiz"),
        results: document.getElementById("screen-results")
    };

    const mainMenuButtonsContainer = document.getElementById("main-menu-buttons");
    const subjectMenuTitle = document.getElementById("subject-menu-title");
    const btnBackToMain = document.getElementById("btn-back-to-main");
    const btnLearnMode = document.getElementById("btn-learn-mode");
    const btnQuizMode20 = document.getElementById("btn-quiz-mode-20");
    const btnBackToSubject = document.getElementById("btn-back-to-subject");
    const questionCounter = document.getElementById("question-counter");
    const questionText = document.getElementById("question-text");
    const optionsContainer = document.getElementById("options-container");
    const explanationBox = document.getElementById("explanation-box");
    const explanationText = document.getElementById("explanation-text");
    const btnPrev = document.getElementById("btn-prev");
    const btnNext = document.getElementById("btn-next");
    const resultsScore = document.getElementById("results-score");
    const wrongAnswersList = document.getElementById("wrong-answers-list");
    const btnRestartQuiz = document.getElementById("btn-restart-quiz");
    const btnResultsToMenu = document.getElementById("btn-results-to-menu");

    buildMainMenu();
    startCountdown(); 

    function showScreen(screenName) {
        Object.values(screens).forEach(screen => screen.classList.remove("active"));
        screens[screenName].classList.add("active");
    }

    function buildMainMenu() {
        mainMenuButtonsContainer.innerHTML = "";
        subjectsConfig.forEach(subject => {
            const button = document.createElement("button");
            button.className = "menu-button";
            button.innerText = subject.name;
            button.onclick = () => showSubjectMenu(subject);
            mainMenuButtonsContainer.appendChild(button);
        });
    }

    function showSubjectMenu(subject) {
        selectedSubject = subject;
        subjectMenuTitle.innerText = subject.name;
        showScreen("subjectMenu");
    }
    
    function loadQuestionsAndStartQuiz(mode, questionCount) {
        currentMode = mode;
        if (loadedQuestionsCache[selectedSubject.name]) {
            startQuiz(loadedQuestionsCache[selectedSubject.name], questionCount);
            return;
        }
        fetch(selectedSubject.file)
            .then(response => response.json())
            .then(data => {
                loadedQuestionsCache[selectedSubject.name] = data;
                startQuiz(data, questionCount);
            })
            .catch(error => alert(`'${selectedSubject.file}' dosyası yüklenemedi veya hatalı.`));
    }

    function startQuiz(questions, questionCount) {
        userAnswers = new Array(questionCount); 
        if (currentMode === 'quiz') {
            currentQuizQuestions = shuffleArray([...questions]).slice(0, questionCount);
            currentQuestionIndex = 0;
            btnPrev.style.display = 'none';
            btnNext.style.display = 'block';
        } else {
            currentQuizQuestions = questions;
            const savedIndex = localStorage.getItem(`progress_${selectedSubject.name}`);
            currentQuestionIndex = savedIndex ? parseInt(savedIndex, 10) : 0;
            btnPrev.style.display = 'block';
            btnNext.style.display = 'block';
        }
        
        if (currentQuizQuestions.length > 0) {
            showQuestion();
            showScreen("quiz");
        } else {
            alert("Bu ders için soru bulunamadı!");
        }
    }
    
    function showQuestion() {
        if (currentMode === 'quiz' && currentQuestionIndex === currentQuizQuestions.length - 1) {
            btnNext.innerText = "Sınavı Bitir";
        } else {
            btnNext.innerText = "İleri";
        }

        const question = currentQuizQuestions[currentQuestionIndex];
        questionCounter.innerText = `Soru: ${currentQuestionIndex + 1}/${currentQuizQuestions.length}`;
        questionText.innerText = question.soru_metni;
        optionsContainer.innerHTML = "";
        
        const correctAnswerText = question.secenekler[question.dogru_secenek];
        const shuffledOptions = shuffleArray(Object.values(question.secenekler));

        shuffledOptions.forEach(optionText => {
            const button = document.createElement("button");
            button.className = "option-btn";
            button.innerText = optionText;
            button.onclick = () => handleOptionClick(button, optionText, correctAnswerText, question);
            optionsContainer.appendChild(button);
        });

        explanationBox.style.display = "none";
        btnPrev.disabled = currentQuestionIndex === 0;
        btnNext.disabled = false;
    }

    function handleOptionClick(clickedButton, selectedText, correctText, question) {
        document.querySelectorAll(".option-btn").forEach(btn => btn.disabled = true);
        const isCorrect = selectedText === correctText;

        if (currentMode === 'learn') {
            document.querySelectorAll(".option-btn").forEach(btn => {
                if (btn.innerText === correctText) btn.classList.add("correct");
            });
            if (!isCorrect) clickedButton.classList.add("incorrect");
            
            const aciklamaText = question.aciklama || "Bu soru için ek bir açıklama bulunmamaktadır.";
            explanationText.innerHTML = `<strong>Kanıt:</strong> ${question.kanit_cumlesi || 'Yok'}<br><br><strong>Açıklama:</strong> ${aciklamaText}`;
            explanationBox.style.display = "block";
        } else {
            clickedButton.classList.add(isCorrect ? "correct" : "incorrect");
            userAnswers[currentQuestionIndex] = { question, selectedText, correctText, isCorrect };
        }
    }

    function navigateQuestion(direction) {
        if (currentMode === 'quiz' && currentQuestionIndex === currentQuizQuestions.length - 1 && direction === 1) {
            showResults();
            return;
        }
        const newIndex = currentQuestionIndex + direction;
        if (newIndex >= 0 && newIndex < currentQuizQuestions.length) {
            currentQuestionIndex = newIndex;
            if (currentMode === 'learn') {
                localStorage.setItem(`progress_${selectedSubject.name}`, currentQuestionIndex);
            }
            showQuestion();
        }
    }

    function showResults() {
        const correctCount = userAnswers.filter(answer => answer && answer.isCorrect).length;
        const totalCount = currentQuizQuestions.length;
        resultsScore.innerText = `${totalCount} sorudan ${correctCount} doğru, ${totalCount - correctCount} yanlış yaptınız.`;
        
        wrongAnswersList.innerHTML = "";
        userAnswers.forEach(answer => {
            if (answer && !answer.isCorrect) {
                const li = document.createElement("li");
                li.innerHTML = `<p class="question-text">${answer.question.soru_metni}</p><p class="correct-answer">Doğru Cevap: ${answer.correctText}</p>`;
                wrongAnswersList.appendChild(li);
            }
        });
        showScreen("results");
    }
    
    // Tüm Buton Olayları
    btnBackToMain.onclick = () => showScreen("mainMenu");
    btnLearnMode.onclick = () => loadQuestionsAndStartQuiz('learn');
    btnQuizMode20.onclick = () => loadQuestionsAndStartQuiz('quiz', 20);
    btnPrev.onclick = () => navigateQuestion(-1);
    btnNext.onclick = () => navigateQuestion(1);
    btnBackToSubject.onclick = () => showScreen("subjectMenu");
    btnResultsToMenu.onclick = () => showScreen("subjectMenu");
    btnRestartQuiz.onclick = () => loadQuestionsAndStartQuiz('quiz', 20);

    // Yardımcı Fonksiyonlar
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function startCountdown() {
        const countdownDate = new Date("December 20, 2025 00:00:00").getTime();

        const countdownFunction = setInterval(() => {
            const now = new Date().getTime();
            const distance = countdownDate - now;

            if (distance < 0) {
                clearInterval(countdownFunction);
                document.getElementById("countdown-container").innerHTML = "<h2>Sınav Zamanı Geldi! Başarılar!</h2>";
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            document.getElementById("days").innerText = String(days).padStart(2, '0');
            document.getElementById("hours").innerText = String(hours).padStart(2, '0');
            document.getElementById("minutes").innerText = String(minutes).padStart(2, '0');
            document.getElementById("seconds").innerText = String(seconds).padStart(2, '0');

        }, 1000);
    }
});
