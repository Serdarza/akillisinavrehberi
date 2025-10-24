// DOM Hazır Olduğunda Başla
document.addEventListener("DOMContentLoaded", () => {

    // Global Değişkenler
    let allQuestions = []; // Tüm soruları tutacak dizi
    let currentQuizQuestions = []; // Mevcut sınavdaki sorular
    let currentQuestionIndex = 0; // Mevcut soru indeksi
    let selectedSubject = ""; // Seçilen ders

    // Ekranlar
    const screenMainMenu = document.getElementById("screen-main-menu");
    const screenSubjectMenu = document.getElementById("screen-subject-menu");
    const screenQuiz = document.getElementById("screen-quiz");

    // Ana Menü Elementleri
    const mainMenuButtonsContainer = document.getElementById("main-menu-buttons");

    // Ders Menüsü Elementleri
    const subjectMenuTitle = document.getElementById("subject-menu-title");
    const btnBackToMain = document.getElementById("btn-back-to-main");
    const btnLearnMode = document.getElementById("btn-learn-mode");
    const btnQuizMode20 = document.getElementById("btn-quiz-mode-20");

    // Sınav Ekranı Elementleri
    const btnBackToSubject = document.getElementById("btn-back-to-subject");
    const questionCounter = document.getElementById("question-counter");
    const questionText = document.getElementById("question-text");
    const optionsContainer = document.getElementById("options-container");
    const explanationBox = document.getElementById("explanation-box");
    const explanationText = document.getElementById("explanation-text");
    const btnPrev = document.getElementById("btn-prev");
    const btnNext = document.getElementById("btn-next");

    // --- UYGULAMA BAŞLANGICI ---
    
    // 1. Soruları JSON dosyasından yükle
    fetch("sorular.json")
        .then(response => response.json())
        .then(data => {
            allQuestions = data;
            // 2. Ana menüyü oluştur
            buildMainMenu();
        })
        .catch(error => {
            console.error("Sorular yüklenirken hata oluştu:", error);
            mainMenuButtonsContainer.innerHTML = "<p>Sorular yüklenemedi. Lütfen dosyayı kontrol edin.</p>";
        });

    // --- EKRAN YÖNETİMİ ---

    function showScreen(screenId) {
        // Tüm ekranları gizle
        document.querySelectorAll(".screen").forEach(screen => {
            screen.classList.remove("active");
        });
        // İstenen ekranı göster
        document.getElementById(screenId).classList.add("active");
    }

    // --- ANA MENÜ İŞLEVLERİ ---

    function buildMainMenu() {
        // JSON'daki benzersiz dersleri bul
        const subjects = [...new Set(allQuestions.map(q => q.ders))];
        
        mainMenuButtonsContainer.innerHTML = ""; // Menüyü temizle
        
        subjects.forEach(subject => {
            const button = document.createElement("button");
            button.className = "menu-button";
            button.innerText = subject;
            button.onclick = () => showSubjectMenu(subject);
            mainMenuButtonsContainer.appendChild(button);
        });
    }

    // --- DERS MENÜSÜ İŞLEVLERİ ---

    function showSubjectMenu(subject) {
        selectedSubject = subject; // Dersi global değişkene ata
        subjectMenuTitle.innerText = subject; // Başlığı güncelle
        showScreen("screen-subject-menu"); // Ders menüsünü göster
    }

    // Ders menüsündeki butonlara tıklama olayları
    btnBackToMain.onclick = () => showScreen("screen-main-menu");
    btnLearnMode.onclick = () => startQuiz("learn");
    btnQuizMode20.onclick = () => startQuiz("quiz", 20);

    // --- SINAV İŞLEVLERİ ---

    function startQuiz(mode, questionCount) {
        // Derse göre soruları filtrele
        let questionsForSubject = allQuestions.filter(q => q.ders === selectedSubject);
        
        if (mode === "quiz") {
            // Soruları karıştır ve istenen sayıda al (Fisher-Yates Shuffle)
            currentQuizQuestions = shuffleArray(questionsForSubject).slice(0, questionCount);
        } else {
            // Öğrenme modu (Tüm sorular, karıştırma)
            currentQuizQuestions = questionsForSubject;
        }

        currentQuestionIndex = 0;
        showQuestion(); // İlk soruyu göster
        showScreen("screen-quiz"); // Sınav ekranını göster
    }
    
    function showQuestion() {
        // Mevcut soruyu al
        const question = currentQuizQuestions[currentQuestionIndex];
        
        // Soru sayacını güncelle
        questionCounter.innerText = `Soru: ${currentQuestionIndex + 1}/${currentQuizQuestions.length}`;
        
        // Soru metnini güncelle
        questionText.innerText = question.soru_metni;
        
        // Seçenekleri temizle
        optionsContainer.innerHTML = "";
        
        // Seçenekleri oluştur (A, B, C, D, E)
        const optionKeys = Object.keys(question.secenekler); // ['a', 'b', 'c', 'd', 'e']
        optionKeys.forEach(key => {
            const button = document.createElement("button");
            button.className = "option-btn";
            // "a" -> "A) " şeklinde formatla
            button.innerHTML = `<strong>${key.toUpperCase()})</strong> ${question.secenekler[key]}`;
            button.dataset.key = key; // Hangi seçeneğe tıklandığını bilmek için
            button.onclick = () => handleOptionClick(button, key, question.dogru_secenek);
            optionsContainer.appendChild(button);
        });

        // Açıklama kutusunu gizle
        explanationBox.style.display = "none";

        // Navigasyon butonlarını ayarla
        btnPrev.disabled = currentQuestionIndex === 0;
        btnNext.disabled = currentQuestionIndex === currentQuizQuestions.length - 1;
    }

    function handleOptionClick(clickedButton, selectedKey, correctKey) {
        // Tüm seçenekleri pasif hale getir
        document.querySelectorAll(".option-btn").forEach(btn => {
            btn.disabled = true;
        });

        const isCorrect = selectedKey === correctKey;

        if (isCorrect) {
            clickedButton.classList.add("correct"); // Tıklanana yeşil sınıfı ekle
        } else {
            clickedButton.classList.add("incorrect"); // Tıklanana kırmızı sınıfı ekle
            
            // Doğru olanı bul ve yeşil yap
            const correctButton = optionsContainer.querySelector(`[data-key="${correctKey}"]`);
            if (correctButton) {
                correctButton.classList.add("correct");
            }
        }
        
        // Açıklamayı göster
        const question = currentQuizQuestions[currentQuestionIndex];
        explanationText.innerHTML = `<strong>Kanıt Cümlesi:</strong> ${question.kanit_cumlesi || 'Yok'}<br><br><strong>Açıklama:</strong> ${question.aciklama}`;
        explanationBox.style.display = "block";
    }

    // Sınav navigasyon butonları
    btnPrev.onclick = () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            showQuestion();
        }
    };
    
    btnNext.onclick = () => {
        if (currentQuestionIndex < currentQuizQuestions.length - 1) {
            currentQuestionIndex++;
            showQuestion();
        }
    };

    // Sınavdan ders menüsüne dön
    btnBackToSubject.onclick = () => showScreen("screen-subject-menu");

    // --- YARDIMCI FONKSİYONLAR ---
    
    // Fisher-Yates (aka Knuth) Shuffle Algoritması
    function shuffleArray(array) {
        let currentIndex = array.length, randomIndex;
        
        while (currentIndex != 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    }

});
