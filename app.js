document.addEventListener("DOMContentLoaded", () => {

    // --- YENİ YAPI: DERSLERİN TANIMLANMASI ---
    // Ana menüde görünecek dersleri ve hangi dosyadan yükleneceklerini burada tanımlıyoruz.
    const subjectsConfig = [
        { name: "Anayasa", file: "anayasa.json" },
        { name: "İç Hizmet Kanunu", file: "ichizmetkanunu.json" },
        { name: "İç Hizmet Yönetmeliği", file: "ichizmetyonetmeligi.json" },
        { name: "Disiplin Kanunu", file: "disiplinkanunu.json" },
        { name: "Siyasi Tarih", file: "siyasitarih.json" },
        { name: "Türkiye Cumhuriyeti Tarihi", file: "tctarihi.json" },
        { name: "Basında Güncel Olaylar", file: "guncelolaylar.json" },
        { name: "Uluslararası Hukuk", file: "uluslararasihukuk.json" },
        { name: "MSB Yazışma Usulleri", file: "msbyazisma.json" },
        { name: "İdare Hukuku", file: "idarehukuku.json" }
    ];

    // Yüklenen soruları hafızada tutmak için bir obje (cache)
    const loadedQuestionsCache = {};

    // Global Değişkenler
    let currentQuizQuestions = [];
    let currentQuestionIndex = 0;
    let selectedSubjectName = "";

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

    // --- UYGULAMA BAŞLANGICI ---
    buildMainMenu();

    function showScreen(screenId) {
        document.querySelectorAll(".screen").forEach(screen => screen.classList.remove("active"));
        document.getElementById(screenId).classList.add("active");
    }

    // Ana menüyü `subjectsConfig` dizisinden oluşturur
    function buildMainMenu() {
        mainMenuButtonsContainer.innerHTML = "";
        subjectsConfig.forEach(subject => {
            const button = document.createElement("button");
            button.className = "menu-button";
            button.innerText = subject.name;
            button.onclick = () => showSubjectMenu(subject.name, subject.file);
            mainMenuButtonsContainer.appendChild(button);
        });
    }

    // Ders menüsünü gösterir ve soruları yüklemeye hazırlanır
    function showSubjectMenu(subjectName, subjectFile) {
        selectedSubjectName = subjectName;
        subjectMenuTitle.innerText = subjectName;

        // Tıklama olaylarını dersin dosyasına bağla
        btnLearnMode.onclick = () => loadQuestionsAndStartQuiz(subjectName, subjectFile, "learn");
        btnQuizMode20.onclick = () => loadQuestionsAnd
