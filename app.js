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
    
    // DERS NOTU ELEMENTLERİ
    const dersNotuEkrani = document.getElementById('dersNotuEkrani');
    const dersNotuBaslik = document.getElementById('dersNotuBaslik');
    const dersNotuIcerik = document.getElementById('dersNotuIcerik');
    const notGeriButton = document.getElementById('notGeriButton');
    const paylasNotButton = document.getElementById('paylasNotButton');

    // YENİ ARAMA ELEMENTLERİ
    const aramaInput = document.getElementById('aramaInput');
    const aramaIcon = document.getElementById('aramaIcon');
    
    // --- Uygulama Durumu (State) ---
    let tumSorular = []; 
    let mevcutSoruIndex = 0;
    let aktifKonuDosyasi = '';
    let aktifMod = ''; 
    let sinavCevaplari = {}; 
    let ogrenmeModuSorulari = []; 
    const HARFLER = ['A', 'B', 'C', 'D', 'E'];

    // --- DENEME TESTİ KOTALARI ---
    const DENEME_KOTALARI = {
        'anayasa': 3,
        'guncelolaylar': 2,
        'ichizmetyonetmeligi': 3,
        'ichizmetkanunu': 5,
        'disiplinkanunu': 5,
        'siyasitarih': 9,
        'tctarihi': 9,
        'uluslararasihukuk': 5,
        'idarehukuku': 3,
        'msbyazisma': 6
    };

    // --- Pop-up Yönetimi ---
    const showMotivationQuote = () => {
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

    // --- Geri Sayım Fonksiyonu (28 Aralık olarak güncellendi) ---
    const startCountdown = () => {
        const sinavTarihi = new Date('2025-12-28T00:00:00'); // Sınav tarihi 28 Aralık olarak ayarlandı
        
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
        [konuSecimEkrani, altMenu, soruEkrani, dersNotuEkrani].forEach(e => e.classList.add('hidden'));
        ekran.classList.remove('hidden');

        // Arama kutusunu her ekran değişiminde temizle
        if (aramaInput) aramaInput.value = '';
        if (dersNotuIcerik && dersNotuIcerik.originalContent) {
             dersNotuIcerik.innerHTML = dersNotuIcerik.originalContent;
        }

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
    // --- Paylaşma Fonksiyonu (Soru Ekranı İçin) ---
    const shareScreenshot = async () => { /* ... fonksiyon içeriği önceki yanıttan korunur ... */ };
    paylasIcon.addEventListener('click', shareScreenshot);


    // --- DERS NOTU YÖNETİMİ ---
    
    // Yeni: Arama ve Vurgulama Fonksiyonu
    const aramaVeVurgula = () => {
        const aramaTerimi = aramaInput.value.trim().toLowerCase();
        
        // Önce içeriği orijinal haline geri yükle
        if (dersNotuIcerik.originalContent) {
             dersNotuIcerik.innerHTML = dersNotuIcerik.originalContent;
        } else {
             return; 
        }
        
        if (!aramaTerimi) return;

        const regex = new RegExp(`(${aramaTerimi})`, 'gi');
        let icerik = dersNotuIcerik.innerHTML;
        let sayac = 0;

        // Vurgulamayı yap
        icerik = icerik.replace(regex, (match) => {
            sayac++;
            return `<span class="highlight">${match}</span>`;
        });
        
        dersNotuIcerik.innerHTML = icerik;
        
        // Sonucu kullanıcıya göster
        if (sayac === 0) {
            alert(`"${aramaTerimi}" ile ilgili bir sonuç bulunamadı.`);
        } else {
            // İlk vurgulanan öğeye kaydırma (opsiyonel)
            const ilkVurgu = dersNotuIcerik.querySelector('.highlight');
            if (ilkVurgu) {
                ilkVurgu.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    };
    
    // Yeni: Seçilen Metni Paylaşma Fonksiyonu
    const paylasSecilenNot = () => {
        const selection = window.getSelection().toString().trim();

        if (selection.length > 0) {
            if (navigator.share) {
                // Mobil Cihazlar için Yerel Paylaşım API'si
                navigator.share({
                    title: `${dersNotuBaslik.textContent} Notu`,
                    text: selection,
                    url: window.location.href, // Uygulama linki
                }).catch((error) => console.log('Paylaşım İptal Edildi', error));
            } else {
                // Masaüstü veya Share API'sini desteklemeyenler için kopyalama
                navigator.clipboard.writeText(selection).then(() => {
                    alert('Seçilen cümle panoya kopyalandı:\n\n' + selection);
                }).catch(err => {
                    alert('Seçilen metin kopyalanamadı.');
                });
            }
        } else {
            alert('Lütfen paylaşmak istediğiniz metni fare veya parmağınızla seçin.');
        }
    };
    
    const loadDersNotu = async (dosyaAdi, konuAdi) => {
        try {
            // Önce HTML dosyasını dene (Tercih edilen format)
            let response = await fetch(`${dosyaAdi}.html`);
            let notIcerigi;
            
            if (!response.ok) {
                // HTML bulunamazsa, TXT dosyasını dene (Geriye dönük uyumluluk)
                response = await fetch(`${dosyaAdi}.txt`);
                if (!response.ok) {
                    dersNotuIcerik.innerHTML = `<p style="color: red;">'${konuAdi}' dersi için not dosyası (${dosyaAdi}.html veya ${dosyaAdi}.txt) bulunamadı!</p>`;
                    gosterEkrani(dersNotuEkrani);
                    return;
                }
                notIcerigi = await response.text();
                // Düz metin ise HTML içine <p> ve <br> ekleyerek görselleştiriyoruz
                dersNotuIcerik.innerHTML = notIcerigi.replace(/\n\s*\n/g, '</p><p>').replace(/\n/g, '<br>');
            } else {
                // HTML dosyası varsa, içeriğini direkt yüklüyoruz
                notIcerigi = await response.text();
                dersNotuIcerik.innerHTML = notIcerigi;
            }
            
            dersNotuBaslik.textContent = `${konuAdi} Ders Notu`;
            gosterEkrani(dersNotuEkrani);
            
            // Orijinal içeriği kaydet (Arama sonrası geri yüklemek için)
            dersNotuIcerik.originalContent = dersNotuIcerik.innerHTML;
            
        } catch (error) {
            console.error('Ders Notu yüklenirken hata oluştu:', error);
            dersNotuIcerik.innerHTML = `<p style="color: red;">Not yüklenemedi: ${error.message}</p>`;
            gosterEkrani(dersNotuEkrani);
        }
    };
    
    // Dinleyiciler: Arama ve Paylaşma
    if (aramaIcon) {
        aramaIcon.addEventListener('click', aramaVeVurgula);
    }
    if (aramaInput) {
        aramaInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                aramaVeVurgula();
            }
        });
    }

    if (paylasNotButton) {
        paylasNotButton.addEventListener('click', paylasSecilenNot);
    }
    
    // Not Ekranından Geri Dön Butonu Dinleyicisi
    if (notGeriButton) {
        notGeriButton.addEventListener('click', () => {
            // Sadece geri dönme işlemi
            gosterEkrani(altMenu);
        });
    }


    // --- DENEME TESTİ YÜKLEME LOGİĞİ (YENİ) ---
    const loadDenemeTesti = async () => {
        const dosyaListesi = Object.keys(DENEME_KOTALARI);
        let tumDenemeSorulari = [];
        let basariliYuklemeSayisi = 0;
        const toplamSoruSayisi = Object.values(DENEME_KOTALARI).reduce((a, b) => a + b, 0);

        const yukleme promises = dosyaListesi.map(async (dosyaAdi) => {
            const kota = DENEME_KOTALARI[dosyaAdi];
            try {
                const response = await fetch(`${dosyaAdi}.json`);
                if (!response.ok) {
                    console.warn(`Uyarı: Deneme testi için dosya bulunamadı veya boş. ${dosyaAdi}.json`);
                    return [];
                }
                let data = await response.json();
                
                if (!Array.isArray(data)) {
                    data = [];
                }
                
                // Toplam soru sayısından az soru varsa, tamamını al
                const alinacakSoruSayisi = Math.min(kota, data.length);

                // Soruları karıştır ve kotası kadarını al
                const secilenSorular = shuffleArray(data).slice(0, alinacakSoruSayisi);
                if (secilenSorular.length > 0) {
                    basariliYuklemeSayisi++;
                }
                return secilenSorular;
                
            } catch (error) {
                console.error(`Deneme testi için ${dosyaAdi}.json yüklenirken hata oluştu:`, error);
                return [];
            }
        });

        // Tüm dosyaların yüklenmesini bekle ve sonuçları birleştir
        const tumSonuclar = await Promise.all(yukleme promises);
        tumDenemeSorulari = tumSonuclar.flat();
        
        // Toplanan tüm soruları yeniden karıştır (konular karışsın)
        tumSorular = shuffleArray(tumDenemeSorulari);

        if (tumSorular.length > 0) {
            aktifMod = 'sinav';
            mevcutSoruIndex = 0;
            sinavCevaplari = {}; 
            
            alert(`50 Soruluk Deneme Testi Başlatılıyor! Toplam ${tumSorular.length} soru yüklendi.`);
            
            gosterEkrani(soruEkrani);
            renderSoru(mevcutSoruIndex);
        } else {
            alert(`Deneme Testi için yeterli soru toplanamadı. Lütfen JSON dosyalarınızı (${basariliYuklemeSayisi}/${dosyaListesi.length} dosya yüklendi) kontrol edin.`);
            gosterEkrani(konuSecimEkrani);
        }
    };


    // --- Konu Seçimi ve Alt Menü İşlemleri ---
    document.querySelectorAll('#konuButonlari .menu-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const konuDosyasi = e.target.getAttribute('data-konu');
            const konuAdi = e.target.textContent;
            aktifKonuDosyasi = konuDosyasi;
            altMenuBaslik.textContent = konuAdi;
            
            if (konuDosyasi === 'deneme') {
                // Deneme testi için doğrudan yükleme fonksiyonunu çağır
                loadDenemeTesti();
            } else {
                gosterEkrani(altMenu);
            }
        });
    });

    // Alt Menü Aksiyonları (Mod seçimi)
    altMenu.querySelectorAll('.menu-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const action = e.target.getAttribute('data-action');
            const konuAdi = altMenuBaslik.textContent; // Konu adını burada yakala
            
            if (action === 'geri') {
                gosterEkrani(konuSecimEkrani);
            } else if (action === 'dersnotu') { // DERS NOTU AKSİYONU
                loadDersNotu(aktifKonuDosyasi, konuAdi);
            } else {
                // SINAV veya ÖĞRENME MODU
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


    // --- Soru Render Etme ---
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
