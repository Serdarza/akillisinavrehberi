document.addEventListener('DOMContentLoaded', () => {
    const konuSecimEkrani = document.getElementById('konuSecimEkrani');
    const anayasaAltMenu = document.getElementById('anayasaAltMenu');
    const soruEkrani = document.getElementById('soruEkrani');
    const altMenuBaslik = document.getElementById('altMenuBaslik');

    // Soru Ekranı Elementleri
    const soruNumarasiSpan = document.getElementById('soruNumarasi');
    const gosterilenSoruMetni = document.getElementById('gosterilenSoruMetni');
    const seceneklerContainer = document.getElementById('seceneklerContainer');
    const aciklamaKutusu = document.getElementById('aciklamaKutusu');
    const aciklamaMetni = document.getElementById('aciklamaMetni');
    const favoriIcon = document.getElementById('favoriIcon');
    const geriButton = document.getElementById('geriButton');
    const ileriButton = document.getElementById('ileriButton');

    let tumSorular = []; // Seçilen konuya ait tüm soruları tutar
    let mevcutSoruIndex = 0;
    let aktifKonuDosyasi = '';

    // --- Ekran Görünürlüğü Fonksiyonları ---

    const gosterEkrani = (ekran) => {
        [konuSecimEkrani, anayasaAltMenu, soruEkrani].forEach(e => e.classList.add('hidden'));
        ekran.classList.remove('hidden');
    };

    // --- Konu Seçimi ve Alt Menü İşlemleri ---

    document.querySelectorAll('.menu-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const konuDosyasi = e.target.getAttribute('data-konu');

            if (konuDosyasi) {
                if (konuDosyasi === 'anayasajson') {
                    aktifKonuDosyasi = konuDosyasi;
                    altMenuBaslik.textContent = e.target.textContent;
                    gosterEkrani(anayasaAltMenu);
                } else {
                    // Diğer konular için doğrudan soru yükleme (Şimdilik sadece Anayasa'yı açıyoruz)
                    aktifKonuDosyasi = konuDosyasi;
                    alert(`${e.target.textContent} konusu seçildi. Sorular yükleniyor...`);
                    // loadQuestions(konuDosyasi);
                }
            } else if (e.target.getAttribute('data-action') === 'geri') {
                gosterEkrani(konuSecimEkrani);
            }
        });
    });

    // Anayasa Alt Menü Aksiyonları
    anayasaAltMenu.querySelectorAll('.purple-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const action = e.target.getAttribute('data-action');
            if (action === 'ogrenme') {
                loadQuestions(aktifKonuDosyasi, 'ogrenme');
            } else {
                alert(`Şu an sadece "Tüm Soruları Gözden Geçir (Öğrenme Modu)" aktiftir.`);
            }
        });
    });


    // --- Soru Yükleme ve Gösterme İşlemleri ---

    const loadQuestions = async (dosyaAdi, mod) => {
        try {
            // Gerçek projede JSON dosyalarının adını .json olarak kullanırsınız.
            const response = await fetch(`${dosyaAdi}.json`);
            if (!response.ok) throw new Error(`Dosya bulunamadı: ${dosyaAdi}.json`);
            
            const data = await response.json();
            
            // JSON yapısı bir dizi (Array) bekliyor.
            if (Array.isArray(data)) {
                tumSorular = data;
            } else if (data && data.soru_metni) {
                 // Eğer tek bir soru JSON'u ise (örneğin TSKDK_004)
                 tumSorular = [data]; 
            } else {
                throw new Error("JSON formatı geçerli değil.");
            }

            if (tumSorular.length > 0) {
                mevcutSoruIndex = 0;
                gosterEkrani(soruEkrani);
                renderSoru(mevcutSoruIndex, mod === 'ogrenme');
            } else {
                alert('Bu konuda hiç soru bulunamadı.');
                gosterEkrani(konuSecimEkrani);
            }

        } catch (error) {
            console.error('Sorular yüklenirken hata oluştu:', error);
            alert('Sorular yüklenemedi. Konsolu kontrol edin.');
            gosterEkrani(konuSecimEkrani);
        }
    };


    const renderSoru = (index, ogrenmeModu = true) => {
        const soru = tumSorular[index];
        if (!soru) return;

        // Ekranı temizle/resetle
        seceneklerContainer.innerHTML = '';
        aciklamaKutusu.classList.add('hidden');
        favoriIcon.classList.remove('fas', 'far');
        favoriIcon.classList.add('far'); // Favori değil (içi boş kalp)

        // Soru numarasını güncelle
        soruNumarasiSpan.textContent = `Soru: ${index + 1}/${tumSorular.length}`;
        gosterilenSoruMetni.textContent = soru.soru_metni;

        // Seçenekleri oluştur
        Object.keys(soru.secenekler).forEach(key => {
            const button = document.createElement('button');
            button.className = 'option-button';
            button.setAttribute('data-cevap', key);
            
            // Seçenek metnini formatla (A) B) gibi)
            const secenekMetni = `${key.toUpperCase()}) ${soru.secenekler[key]}`;
            button.textContent = secenekMetni;

            // Öğrenme modunda cevap kontrolü ekle
            if (ogrenmeModu) {
                button.addEventListener('click', () => {
                    cevapKontrol(button, soru, ogrenmeModu);
                });
            }

            seceneklerContainer.appendChild(button);
        });

        // Öğrenme modunda ise doğru cevabı göstermeden sadece tıklama beklenir.
    };

    const cevapKontrol = (tiklananButton, soru, ogrenmeModu) => {
        // Tıklama sonrası diğer butonların tıklamasını engelle
        seceneklerContainer.querySelectorAll('.option-button').forEach(btn => {
            btn.disabled = true;
        });

        const dogruCevap = soru.dogru_secenek;
        const kullaniciCevabi = tiklananButton.getAttribute('data-cevap');
        
        // Tüm butonları kontrol et ve renklendir
        seceneklerContainer.querySelectorAll('.option-button').forEach(btn => {
            if (btn.getAttribute('data-cevap') === dogruCevap) {
                btn.classList.add('dogru');
            } else if (btn.getAttribute('data-cevap') === kullaniciCevabi) {
                btn.classList.add('yanlis');
            }
        });

        // Açıklamayı göster
        if (ogrenmeModu && soru.aciklama) {
            aciklamaMetni.textContent = soru.aciklama;
            aciklamaKutusu.classList.remove('hidden');
        }
    };

    // --- Navigasyon (Geri/İleri) ---

    ileriButton.addEventListener('click', () => {
        if (mevcutSoruIndex < tumSorular.length - 1) {
            mevcutSoruIndex++;
            renderSoru(mevcutSoruIndex, true); // Öğrenme Modunda Kal
        } else {
            alert('Son soruya ulaştınız.');
        }
    });

    geriButton.addEventListener('click', () => {
        if (mevcutSoruIndex > 0) {
            mevcutSoruIndex--;
            renderSoru(mevcutSoruIndex, true); // Öğrenme Modunda Kal
        } else {
            // Soru 1'deyken geri basılırsa ana menüye dön
            gosterEkrani(anayasaAltMenu);
        }
    });

    // --- Ekstra Fonksiyonlar ---

    // Favori Butonu Toggle
    favoriIcon.addEventListener('click', () => {
        favoriIcon.classList.toggle('far');
        favoriIcon.classList.toggle('fas');
        alert('Soru favorilere eklendi/kaldırıldı.');
    });


    // Sayfa yüklendiğinde Konu Seçim Ekranı görünür.
    gosterEkrani(konuSecimEkrani);

    // İlk JSON örneğini yüklemek için (Test amaçlı, TSKDK_004'ü yükler)
    // loadQuestions('ornek', 'ogrenme'); 
});
