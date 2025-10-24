document.addEventListener("DOMContentLoaded", () => {

    // --- DERSLERİN TANIMLANDIĞI YER ---
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
    let currentQuestionIndex = 0;
    let selectedSubject = null;
    let currentMode = ''; // 'learn' veya 'quiz'

    // Ekranlar ve Elementler
    const screenMainMenu = document.getElementById("screen-main-menu");
    const screenSubjectMenu = document.getElementById("screen-subject-menu");
    const screenQuiz = document.getElementById("screen-quiz");
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

    buildMainMenu();

    function showScreen(screenId) {
        document.querySelectorAll(".screen").forEach(screen => screen.classList.remove("active"));
        document.getElementById(screenId).classList.add("active");
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
        btnLearnMode.onclick = () => loadQuestionsAndStartQuiz("learn");
        btnQuizMode20.onclick = () => loadQuestionsAndStartQuiz("quiz", 20);
        showScreen("screen-subject-menu");
    }
    
    function loadQuestionsAndStartQuiz(mode, questionCount) {
        currentMode = mode;
        if (loadedQuestionsCache[selectedSubject.name]) {
            startQuiz(loadedQuestionsCache[selectedSubject.name], mode, questionCount);
            return;
        }

        fetch(selectedSubject.file)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP hatası! Durum: ${response.status}`);
                return response.json();
            })
            .then(data => {
                loadedQuestionsCache[selectedSubject.name] = data;
                startQuiz(data, mode, questionCount);
            })
            .catch(error => {
                console.error("Sorular yüklenirken hata oluştu:", error);
                alert(`'${selectedSubject.file}' dosyası yüklenemedi veya hatalı.`);
            });
    }

    function startQuiz(questions, mode, questionCount) {
        // Sınav modunda soruları karıştır ve 20 tane seç.
        if (mode === 'quiz') {
            currentQuizQuestions = shuffleArray([...questions]).slice(0, questionCount);
            currentQuestionIndex = 0;
        } 
        // Öğrenme modunda tüm soruları sırasıyla al.
        else {
            currentQuizQuestions = questions;
            // Kaydedilmiş ilerlemeyi kontrol et.
            const savedIndex = localStorage.getItem(`progress_${selectedSubject.name}`);
            currentQuestionIndex = savedIndex ? parseInt(savedIndex, 10) : 0;
        }
        
        if (currentQuizQuestions.length > 0) {
            showQuestion();
            showScreen("screen-quiz");
        } else {
            alert("Bu ders için henüz soru eklenmemiş veya dosya boş!");
        }
    }
    
    function showQuestion() {
        const question = currentQuizQuestions[currentQuestionIndex];
        questionCounter.innerText = `Soru: ${currentQuestionIndex + 1}/${currentQuizQuestions.length}`;
        questionText.innerText = question.soru_metni;
        optionsContainer.innerHTML = "";
        
        // --- YENİ: ŞIKLARI KARIŞTIRMA ---
        const correctAnswerText = question.secenekler[question.dogru_secenek];
        let options = Object.values(question.secenekler);
        const shuffledOptions = shuffleArray(options);

        shuffledOptions.forEach(optionText => {
            const button = document.createElement("button");
            button.className = "option-btn";
            button.innerText = optionText; // Şıklarda A) B) yazısını kaldırdık.
            button.onclick = () => handleOptionClick(button, optionText, correctAnswerText, question);
            optionsContainer.appendChild(button);
        });

        explanationBox.style.display = "none";
        btnPrev.disabled = currentQuestionIndex === 0;
        btnNext.disabled = currentQuestionIndex === currentQuizQuestions.length - 1;
    }

    function handleOptionClick(clickedButton, selectedText, correctText, question) {
        document.querySelectorAll(".option-btn").forEach(btn => {
            btn.disabled = true;
            // Doğru cevabı her zaman yeşil yap
            if (btn.innerText === correctText) {
                btn.classList.add("correct");
            }
        });
        
        // Eğer yanlış cevap seçildiyse, onu kırmızı yap
        if (selectedText !== correctText) {
            clickedButton.classList.add("incorrect");
        }
        
        // --- YENİ: UNDEFINED HATASI DÜZELTMESİ ---
        const aciklamaText = question.aciklama || "Bu soru için ek bir açıklama bulunmamaktadır.";
        explanationText.innerHTML = `<strong>Kanıt:</strong> ${question.kanit_cumlesi || 'Yok'}<br><br><strong>Açıklama:</strong> ${aciklamaText}`;
        explanationBox.style.display = "block";
    }

    function navigateQuestion(direction) {
        const newIndex = currentQuestionIndex + direction;
        if (newIndex >= 0 && newIndex < currentQuizQuestions.length) {
            currentQuestionIndex = newIndex;
            // --- YENİ: ÖĞRENME MODUNDA İLERLEMEYİ KAYDET ---
            if (currentMode === 'learn') {
                localStorage.setItem(`progress_${selectedSubject.name}`, currentQuestionIndex);
            }
            showQuestion();
        }
    }

    btnBackToMain.onclick = () => showScreen("screen-main-menu");
    btnPrev.onclick = () => navigateQuestion(-1);
    btnNext.onclick = () => navigateQuestion(1);
    btnBackToSubject.onclick = () => showScreen("screen-subject-menu");

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
});
