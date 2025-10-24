document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elementleri ---
    const konuSecimEkrani = document.getElementById('konuSecimEkrani');
    const altMenu = document.getElementById('altMenu'); 
    const soruEkrani = document.getElementById('soruEkrani');
    const altMenuBaslik = document.getElementById('altMenuBaslik');

    const soruNumarasiSpan = document.getElementById('soruNumarasi');
    const gosterilenSoruMetni = document.getElementById('gosterilenSoruMetni');
    const seceneklerContainer = document.getElementById('seceneklerContainer');
    const aciklamaKutusu = document.getElementById('aciklamaKutusu');
    const aciklamaMetni = document.getElementById('aciklamaMetni');
    const kanitMetni = document.getElementById('kanitMetni');
    const paylasIcon = document.getElementById('paylasIcon');
    
    // Navigasyon Butonları
    const anaSayfaButton = document.getElementById('anaSayfaButton'); 
    const geriButton = document.getElementById('geriButton');
    const ileriButton = document.getElementById('ileriButton');
    
    // Geri Sayım Elementleri
    const countdownContainer = document.getElementById('countdownContainer');
    const daysSpan = document.getElementById('days');
    const hoursSpan = document.getElementById('hours');
    const minutesSpan = document.getElementById('minutes');
    const secondsSpan = document.getElementById('seconds');
    const countdownHeader = document.querySelector('.countdown-header');
    
    // Modal Elementleri
    const motivationModal = document.getElementById('motivationModal');
    const closeModal = document.getElementById('closeModal');
    const quoteText = document.getElementById('quoteText');
    const quoteAuthor = document.getElementById('quoteAuthor');
    
    // Soru Listesi Modal Elementleri
    const questionListModal = document.getElementById('questionListModal');
    const closeQuestionListModal = document.getElementById('closeQuestionListModal');
    const questionListContainer = document.getElementById('questionList');
    
    // Motivasyon Sözleri Havuzu
    const quotes = [
        { text: "Çalışmadan, yorulmadan, üretmeden rahat yaşamak isteyen toplumlar; önce haysiyetlerini, sonra hürriyetlerini ve daha sonra da istikballerini kaybetmeye mahkumdurlar.", author: "Mustafa Kemal Atatürk" },
        { text: "Herkesin dehasına inandığı bir bilim dalı yoktur, herkesin dehasına inandığı tek şey çalışmadır.", author: "Louis Pasteur" },
        { text: "Büyük işleri başarmak sadece güç gerektirmez, azim de gerektirir.", author: "Samuel Johnson" },
        { text: "Kendime ait olan tek şey, azmimdir. Başarımın nedeni budur.", author: "Thomas Edison" },
        { text: "Eğitim, okulda öğrenilen her şeyi unuttuğunda geriye kalandır.", author: "Albert Einstein" },
        { text: "İnsan aklının ulaştığı en yüksek mertebe, ilimdir.", author: "Sokrates" },
        { text: "En değerli hazine, ilimdir. En kötü yoksulluk ise cehalettir.", author: "Hz. Ali" },
        { text: "Hayatta başarılı olmak istiyorsanız, azminizi rutin hale getirin.", author: "Confucius" },
        { text: "Yarınlar yorgun ve bezgin oturanlara değil, rahatı terk edebilen gayretli insanlara aittir.", author: "Cicero" },
        { text: "En büyük tehlike, büyük hedefler koyup onlara ulaşamamak değil, küçük hedefler koyup onlara ulaşmaktır.", author: "Michelangelo" },
        { text: "Bilgi, denenmiş ve doğrulanmış inançtır.", author: "Francis Bacon" },
        { text: "Bir eylem için en iyi zaman, dündü. İkinci en iyi zaman ise şimdi.", author: "Çin Atasözü" },
        { text: "Çok bilen, az konuşur. Bilgisizler ise her şeyi bilir.", author: "William Shakespeare" },
        { text: "Hiç kimse, başarı merdivenlerini elleri cebinde tırmanmamıştır.", author: "K. K. Varma" },
        { text: "Öğrenme, rüzgara karşı kürek çekmeye benzer. İlerleyemediğiniz an, gerilemeye başlarsınız.", author: "Benjamin Britten" },
        { text: "İlimsiz geçen her gün, kayıp edilmiş bir hayat parçasıdır.", author: "Mevlana" },
        { text: "Zorluklar, başarının değerini artıran süslerdir.", author: "Molière" },
        { text: "Başlamak için en mükemmel anı beklersen, hiçbir zaman başlayamazsın.", author: "John Wanamaker" },
        { text: "Zafer, ben yapabilirim diyebilenindir.", author: "Virgil" },
        { text: "Büyük düşünürler fikirleri, ortalama insanlar olayları, küçük insanlar ise kişileri tartışır.", author: "Eleanor Roosevelt" }
    ];

    // --- Uygulama Durumu (State) ---
    let tumSorular = []; 
    let mevcutSoruIndex = 0;
    let aktifKonuDosyasi = '';
    let aktifMod = ''; 
    let sinavCevaplari = {}; 
    let ogrenmeModuSorulari = []; 
    const HARFLER = ['A', 'B', 'C', 'D', 'E'];

    // --- Pop-up Yönetimi ---
    const showMotivationQuote = () => {
        // Pop-up'ın sadece tarayıcı kapatılıp açılınca bir kez gösterilmesi için Session Storage kullanılır
        const isQuoteShown = sessionStorage.getItem('motivationQuoteShown');
        if (isQuoteShown) return;

        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        quoteText.textContent = `"${randomQuote.text}"`;
        quoteAuthor.textContent = `- ${randomQuote.author}`;
        
        motivationModal.classList.remove('hidden');
        
        sessionStorage.setItem('motivationQuoteShown', 'true');
    };

    closeModal.addEventListener('click', () => {
        motivationModal.classList.add('hidden');
    });

    // --- Geri Sayım Fonksiyonu ---
    const startCountdown = () => {
        const sinavTarihi = new Date('2025-12-20T00:00:00'); 
        
        const updateCountdown = () => {
            const now = new Date();
            const distance = sinavTarihi - now;

            if (distance < 0) {
                clearInterval(interval);
                countdownHeader.textContent = "SINAV BAŞLADI! BAŞARILAR DİLERİZ.";
                daysSpan.textContent = hoursSpan.textContent = minutesSpan.textContent = secondsSpan.textContent = "00";
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            daysSpan.textContent = String(days).padStart(2, '0');
            hoursSpan.textContent = String(hours).padStart(2, '0');
            minutesSpan.textContent = String(minutes).padStart(2, '0');
            secondsSpan.textContent = String(seconds).padStart(2, '0');
        };

        const interval = setInterval(updateCountdown, 1000);
        updateCountdown(); 
    };

    // --- Yardımcı Fonksiyonlar ---
    const gosterEkrani = (ekran) => {
        [konuSecimEkrani, altMenu, soruEkrani].forEach(e => e.classList.add('hidden'));
        ekran.classList.remove('hidden');

        // Sayaç Yönetimi: Sadece Ana Sayfada göster
        if (ekran === konuSecimEkrani) {
            countdownContainer.classList.remove('hidden');
        } else {
            countdownContainer.classList.add('hidden');
        }
    };

    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    // --- Local Storage Yönetimi (Öğrenme Modu Durumu) ---
    const loadLastIndex = (dosyaAdi) => {
        const lastIndex = localStorage.getItem(`lastIndex_${dosyaAdi}`);
        return lastIndex ? parseInt(lastIndex) : 0;
    };

    const saveLastIndex = (dosyaAdi, index) => {
        localStorage.setItem(`lastIndex_${dosyaAdi}`, index);
    };

    // --- Soru Listesi Modal Yönetimi ---
    const populateQuestionList = () => {
        questionListContainer.innerHTML = '';
        tumSorular.forEach((soru, index) => {
            const listItem = document.createElement('div');
            listItem.className = 'question-list-item';
            // Soru metni yoksa konu adını kullan
            const soruBasligi = soru.soru_metni ? soru.soru_metni.substring(0, 50) + '...' : soru.konu || 'Başlıksız Soru';
            listItem.textContent = `${index + 1}. ${soruBasligi}`; 
            listItem.setAttribute('data-index', index);
            
            listItem.addEventListener('click', (e) => {
                const targetIndex = parseInt(e.target.getAttribute('data-index'));
                mevcutSoruIndex = targetIndex;
                saveLastIndex(aktifKonuDosyasi, mevcutSoruIndex); // Kalınan yeri güncelle
                renderSoru(mevcutSoruIndex);
                questionListModal.classList.add('hidden'); // Modal'ı kapat
            });
            questionListContainer.appendChild(listItem);
        });
        questionListModal.classList.remove('hidden');
    };

    closeQuestionListModal.addEventListener('click', () => {
        questionListModal.classList.add('hidden');
    });

    soruNumarasiSpan.addEventListener('click', () => {
        if (aktifMod === 'ogrenme') {
            populateQuestionList();
        }
    });
    // --- Paylaşma Fonksiyonu ---
    const shareScreenshot = async () => { /* ... fonksiyon içeriği önceki yanıttan korunur ... */ };
    paylasIcon.addEventListener('click', shareScreenshot);


    // --- Konu Seçimi ve Alt Menü İşlemleri ---
    document.querySelectorAll('#konuButonlari .menu-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const konuDosyasi = e.target.getAttribute('data-konu');
            const konuAdi = e.target.textContent;
            aktifKonuDosyasi = konuDosyasi;
            altMenuBaslik.textContent = konuAdi;
            
            gosterEkrani(altMenu);
        });
    });

    // Alt Menü Aksiyonları (Mod seçimi)
    altMenu.querySelectorAll('.menu-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const action = e.target.getAttribute('data-action');
            if (action === 'geri') {
                gosterEkrani(konuSecimEkrani);
            } else {
                const konuAdi = altMenuBaslik.textContent;
                loadQuestions(aktifKonuDosyasi, action, konuAdi);
            }
        });
    });

    // --- Soru Yükleme ve Yönlendirme ---
    const loadQuestions = async (dosyaAdi, mod, konuAdi) => {
        try {
            const response = await fetch(`${dosyaAdi}.json`);
            if (!response.ok) {
                 console.warn(`Uyarı: Dosya bulunamadı veya boş. ${dosyaAdi}.json`);
                 tumSorular = []; 
            } else {
                let data = await response.json();
            
                if (!Array.isArray(data)) {
                    if (data && data.soru_metni) {
                         data = [data];
                    } else {
                         data = []; 
                    }
                }
                tumSorular = data;
            }

            if (tumSorular.length > 0) {
                aktifMod = mod;
                ogrenmeModuSorulari = [...tumSorular]; 
                
                // NAVİGASYON BUTONLARINI YÖNET
                if (mod === 'sinav') {
                    // Test Çözüm Aşaması: Geri/İleri Gizle, Anasayfa Göster
                    geriButton.classList.add('hidden-nav-button');
                    ileriButton.classList.add('hidden-nav-button');
                    anaSayfaButton.classList.remove('hidden-nav-button'); // Anasayfa kalsın
                    soruNumarasiSpan.classList.remove('clickable-soru-numarasi'); // Tıklanabilirliği kaldır

                    const sinavBoyutu = Math.min(20, tumSorular.length);
                    tumSorular = shuffleArray(tumSorular).slice(0, sinavBoyutu); 
                    mevcutSoruIndex = 0;
                    sinavCevaplari = {}; 
                } else {
                    // Öğrenme Modu/İnceleme: Tüm butonları göster 
                    geriButton.classList.remove('hidden-nav-button');
                    ileriButton.classList.remove('hidden-nav-button');
                    anaSayfaButton.classList.remove('hidden-nav-button');
                    soruNumarasiSpan.classList.add('clickable-soru-numarasi'); 
                    
                    // Öğrenme Modu: Son kalınan sorudan devam et
                    mevcutSoruIndex = loadLastIndex(aktifKonuDosyasi);
                    if (mevcutSoruIndex >= tumSorular.length) mevcutSoruIndex = 0; 
                }
                
                gosterEkrani(soruEkrani);
                renderSoru(mevcutSoruIndex);
            } else {
                alert(`Bu konuda (${konuAdi}) hiç soru bulunamadı. Lütfen JSON dosyasını doldurun.`);
                gosterEkrani(altMenu);
            }

        } catch (error) {
            console.error('Sorular yüklenirken genel hata oluştu:', error);
            alert(`Sorular yüklenemedi. JSON dosya yapısını kontrol edin. Hata: ${error.message}`);
            gosterEkrani(altMenu); 
        }
    };


    // --- Soru Render Etme (Şıkları Karıştırma Dahil) ---

    const renderSoru = (index) => {
        const soru = tumSorular[index];
        if (!soru) return;

        // Ekranı temizle/resetle
        seceneklerContainer.innerHTML = '';
        seceneklerContainer.classList.remove('cevaplandi');
        aciklamaKutusu.classList.add('hidden');
        
        // Soru numarasını güncelle
        soruNumarasiSpan.textContent = `Soru: ${index + 1}/${tumSorular.length}`;
        gosterilenSoruMetni.textContent = soru.soru_metni;

        // Şıkları Karıştır
        let karistirilmisSecenekler = Object.keys(soru.secenekler).map(key => ({
            key: key, 
            value: soru.secenekler[key]
        }));
        karistirilmisSecenekler = shuffleArray(karistirilmisSecenekler);

        // Seçenekleri oluştur
        karistirilmisSecenekler.forEach((secenek, i) => {
            const button = document.createElement('button');
            button.className = 'option-button';
            button.setAttribute('data-orijinal-cevap', secenek.key); 
            
            const secenekMetni = `${HARFLER[i]}) ${secenek.value}`;
            button.textContent = secenekMetni;

            button.addEventListener('click', (e) => {
                cevapKontrol(e.target, soru);
            });

            seceneklerContainer.appendChild(button);
        });

        // Yanlışları Gözden Geçirme Modunda ise (Sınav bitiminden sonra) hemen renklendir ve açıklamayı göster
        if (aktifMod === 'ogrenme' && soru.kullanici_cevabi) {
             cevapKontrol(null, soru); 
        }
    };

    // --- Cevap Kontrolü ve Renklendirme ---

    const cevapKontrol = (tiklananButton, soru) => {
        const isAlreadyAnswered = seceneklerContainer.classList.contains('cevaplandi');
        
        if (tiklananButton && isAlreadyAnswered) return;
        seceneklerContainer.classList.add('cevaplandi');

        let kullaniciOrijinalCevap;
        if (tiklananButton) {
             kullaniciOrijinalCevap = tiklananButton.getAttribute('data-orijinal-cevap');
        } else if (soru.kullanici_cevabi) {
             kullaniciOrijinalCevap = soru.kullanici_cevabi; 
        }

        if (aktifMod === 'sinav' && tiklananButton) {
            sinavCevaplari[soru.soru_id] = kullaniciOrijinalCevap;
        }

        // Renklendirmeyi yap
        renklendirCevaplar(soru, kullaniciOrijinalCevap);
        
        // Açıklamayı sadece Öğrenme Modunda göster
        if (aktifMod === 'ogrenme') {
            const aciklamaMetniContent = soru.aciklama || soru.aclama || 'Açıklama metni JSON verisinde bulunmamaktadır.';
            const kanitMetniContent = soru.kanit_cumlesi || 'Kanıt cümlesi JSON verisinde bulunmamaktadır.';

            aciklamaMetni.innerHTML = aciklamaMetniContent;
            kanitMetni.innerHTML = kanitMetniContent;
            aciklamaKutusu.classList.remove('hidden');
            
        } else {
             aciklamaKutusu.classList.add('hidden');

             // Sınav modunda işaretlemeden sonra 1 saniye bekle ve otomatik sonraki soruya geç
             if (tiklananButton) {
                 setTimeout(() => {
                     if (mevcutSoruIndex < tumSorular.length - 1) {
                         mevcutSoruIndex++;
                         renderSoru(mevcutSoruIndex);
                     } else {
                         gosterSinavSonucu();
                     }
                 }, 1000); // 1 saniye bekleme süresi
             }
        }
    };

    const renklendirCevaplar = (soru, kullaniciOrijinalCevap) => {
        const dogruOrijinalCevap = soru.dogru_secenek;

        seceneklerContainer.querySelectorAll('.option-button').forEach(btn => {
            btn.disabled = true;

            if (btn.getAttribute('data-orijinal-cevap') === dogruOrijinalCevap) {
                btn.classList.add('dogru');
            } else if (btn.getAttribute('data-orijinal-cevap') === kullaniciOrijinalCevap) {
                btn.classList.add('yanlis');
            }
        });
    };

    // --- Navigasyon ve Sınav Sonu ---

    ileriButton.addEventListener('click', () => {
        // Test modunda otomatik geçiş devredeyken manuel ileriye engeli (sadece inceleme/öğrenme hariç)
        if (aktifMod === 'sinav' && !seceneklerContainer.classList.contains('cevaplandi')) return; 

        if (mevcutSoruIndex < tumSorular.length - 1) {
            mevcutSoruIndex++;
            if(aktifMod === 'ogrenme') {
                saveLastIndex(aktifKonuDosyasi, mevcutSoruIndex); 
            }
            renderSoru(mevcutSoruIndex);
        } else {
            if (aktifMod === 'sinav') {
                gosterSinavSonucu();
            } else {
                saveLastIndex(aktifKonuDosyasi, 0); 
                gosterEkrani(altMenu); 
            }
        }
    });

    geriButton.addEventListener('click', () => {
        if (mevcutSoruIndex > 0) {
            mevcutSoruIndex--;
            if(aktifMod === 'ogrenme') {
                saveLastIndex(aktifKonuDosyasi, mevcutSoruIndex); 
            }
            renderSoru(mevcutSoruIndex);
        } else {
            gosterEkrani(altMenu); 
        }
    });

    // Anasayfa Butonu dinleyicisi
    anaSayfaButton.addEventListener('click', () => {
        gosterEkrani(konuSecimEkrani);
    });

    const gosterSinavSonucu = () => {
        let dogruSayisi = 0;
        let yanlisSorular = [];

        tumSorular.forEach(soru => {
            const kullaniciCevabi = sinavCevaplari[soru.soru_id];
            if (kullaniciCevabi === soru.dogru_secenek) {
                dogruSayisi++;
            } else {
                const orjinalSoru = ogrenmeModuSorulari.find(q => q.soru_id === soru.soru_id);
                if (orjinalSoru) {
                    orjinalSoru.kullanici_cevabi = kullaniciCevabi; 
                    yanlisSorular.push(orjinalSoru);
                }
            }
        });

        let sonucMetni = `Sınav Tamamlandı! Doğru Sayısı: ${dogruSayisi} / ${tumSorular.length}`;
        alert(sonucMetni);

        if (yanlisSorular.length > 0) {
            // İNCELEME AŞAMASI BAŞLANGICI
            tumSorular = yanlisSorular;
            mevcutSoruIndex = 0;
            aktifMod = 'ogrenme'; // İnceleme için öğrenme modu mantığı kullanılır
            
            // İnceleme aşamasında (ogrenme modu) butonları göster
            geriButton.classList.remove('hidden-nav-button');
            ileriButton.classList.remove('hidden-nav-button');
            anaSayfaButton.classList.remove('hidden-nav-button'); 
            soruNumarasiSpan.classList.add('clickable-soru-numarasi'); 

            alert(`Yanlış yaptığınız ${yanlisSorular.length} soru, cevap ve açıklamalarıyla gösteriliyor.`);
            renderSoru(mevcutSoruIndex);
        } else {
            gosterEkrani(altMenu);
        }
    };


    // --- Başlangıç Fonksiyonları ---
    startCountdown(); 
    gosterEkrani(konuSecimEkrani);
    showMotivationQuote(); 

    // Paylaşma İkonu dinleyicisi
    paylasIcon.addEventListener('click', shareScreenshot);

});
