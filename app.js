document.addEventListener("DOMContentLoaded", () => {

    // --- DERSLERİN TANIMLANDIĞI YER ---
    // Ana menü bu listeye göre otomatik olarak oluşturulur.
    // 'name': Ekranda görünecek ders adı.
    // 'file': O derse ait soruların bulunduğu dosyanın adı.
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
        // Buraya yeni dersler ekleyebilirsiniz...
        // { name: "Yeni Ders", file: "yeniders.json" },
    ];

    const loadedQuestionsCache = {};
    let currentQuizQuestions = [];
    let currentQuestionIndex = 0;

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
        subjectMenuTitle.innerText = subject.name;
        btnLearnMode.onclick = () => loadQuestionsAndStartQuiz(subject, "learn");
        btnQuizMode20.onclick = () => loadQuestionsAndStartQuiz(subject, "quiz", 20);
        showScreen("screen-subject-menu");
    }
    
    function loadQuestionsAndStartQuiz(subject, mode, questionCount) {
        if (loadedQuestionsCache[subject.name]) {
            startQuiz(loadedQuestionsCache[subject.name], mode, questionCount);
            return;
        }

        fetch(subject.file)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP hatası! Durum: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                loadedQuestionsCache[subject.name] = data;
                startQuiz(data, mode, questionCount);
            })
            .catch(error => {
                console.error("Sorular yüklenirken hata oluştu:", error);
                alert(`'${subject.file}' dosyası yüklenemedi veya hatalı.\n\nDosyanın var olduğundan ve geçerli bir JSON formatında olduğundan emin olun.`);
            });
    }

    function startQuiz(questions, mode, questionCount) {
        let questionsForSubject = [...questions];
        if (mode === "quiz") {
            currentQuizQuestions = shuffleArray(questionsForSubject).slice(0, questionCount);
        } else {
            currentQuizQuestions = questionsForSubject;
        }
        
        currentQuestionIndex = 0;
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
        
        Object.keys(question.secenekler).forEach(key => {
            const button = document.createElement("button");
            button.className = "option-btn";
            button.innerHTML = `<strong>${key.toUpperCase()})</strong> ${question.secenekler[key]}`;
            button.dataset.key = key;
            button.onclick = () => handleOptionClick(button, key, question.dogru_secenek);
            optionsContainer.appendChild(button);
        });

        explanationBox.style.display = "none";
        btnPrev.disabled = currentQuestionIndex === 0;
        btnNext.disabled = currentQuestionIndex === currentQuizQuestions.length - 1;
    }

    function handleOptionClick(clickedButton, selectedKey, correctKey) {
        document.querySelectorAll(".option-btn").forEach(btn => btn.disabled = true);
        if (selectedKey === correctKey) {
            clickedButton.classList.add("correct");
        } else {
            clickedButton.classList.add("incorrect");
            const correctButton = optionsContainer.querySelector(`[data-key="${correctKey}"]`);
            if (correctButton) correctButton.classList.add("correct");
        }
        const question = currentQuizQuestions[currentQuestionIndex];
        explanationText.innerHTML = `<strong>Kanıt:</strong> ${question.kanit_cumlesi || 'Yok'}<br><br><strong>Açıklama:</strong> ${question.aciklama}`;
        explanationBox.style.display = "block";
    }

    btnBackToMain.onclick = () => showScreen("screen-main-menu");
    btnPrev.onclick = () => { if (currentQuestionIndex > 0) { currentQuestionIndex--; showQuestion(); } };
    btnNext.onclick = () => { if (currentQuestionIndex < currentQuizQuestions.length - 1) { currentQuestionIndex++; showQuestion(); } };
    btnBackToSubject.onclick = () => showScreen("screen-subject-menu");

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
});
