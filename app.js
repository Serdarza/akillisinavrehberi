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

    let tumSorular = []; 
    let mevcutSoruIndex = 0;
    let aktifKonuDosyasi = '';
    let aktifMod = 'ogrenme'; // Varsayılan: Öğrenme Modu

    // --- Ekran Görünürlüğü Fonksiyonları ---

    const gosterEkrani = (ekran) => {
        [konuSecimEkrani, anayasaAltMenu, soruEkrani].forEach(e => e.classList.add('hidden'));
        ekran.classList.remove('hidden');
    };

    // --- Konu Seçimi ve Alt Menü İşlemleri ---

    document.querySelectorAll('#konuButonlari .menu-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const konuDosyasi = e.target.getAttribute('data-konu');
            const konuAdi = e.target.textContent;

            if (konuDosyasi) {
                aktifKonuDosyasi = konuDosyasi;
                
                if (konuDosyasi === 'anayasajson') {
                    altMenuBaslik.textContent = konuAdi;
                    gosterEkrani(anayasaAltMenu);
                } else {
                    // Diğer konular için doğrudan Öğrenme Modunu yükle
                    loadQuestions(konuDosyasi, 'ogrenme', konuAdi);
                }
            }
        });
    });

    // Anayasa Alt Menü Aksiyonları
    anayasaAltMenu.querySelectorAll('.menu-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const action = e.target.getAttribute('data-action');
            if (action === 'geri') {
                gosterEkrani(konuSecimEkrani);
            } else {
                // Öğrenme veya Sınav Modunu yükle
                const konuAdi = altMenuBaslik.textContent;
                loadQuestions(aktifKonuDosyasi, action, konuAdi);
            }
        });
    });


    // --- Soru Yükleme ve Gösterme İşlemleri ---

    const loadQuestions = async (dosyaAdi, mod, konuAdi) => {
        try {
            // JSON yükleme düzeltmesi: Dosya adının sonuna '.json' ekleniyor.
            const response = await fetch(`${dosyaAdi}.json`);
            
            if (!response.ok) {
                // Hata mesajını daha anlaşılır hale getir
                throw new Error(`Dosya bulunamadı veya yüklenemedi: ${dosyaAdi}.json (HTTP Hata: ${response.status})`);
            }
            
            const data = await response.json();
            
            // Veriyi dizi olarak işleme (Tüm json dosyaları dizi bekler)
            if (Array.isArray(data)) {
                tumSorular = data;
            } else if (data && data.soru_metni) {
                 // Eğer tek bir soru JSON'u ise (örneğin TSKDK_004)
                 tumSorular = [data]; 
            } else {
                throw new Error("JSON formatı geçerli değil veya boş.");
            }

            if (tumSorular.length > 0) {
                aktifMod = mod;
                mevcutSoruIndex = 0;
                
                if (mod === 'sinav') {
                    // Sınav modu için sadece 20 soru seç ve karıştır
                    alert(`"${konuAdi}" konusu için 20 soruluk sınav başlatıldı.`);
                    tumSorular = tumSorular.sort(() => 0.5 - Math.random()).slice(0, 20);
                } else {
                    alert(`"${konuAdi}" konusu için Öğrenme Modu başlatıldı.`);
                }
                
                gosterEkrani(soruEkrani);
                renderSoru(mevcutSoruIndex);
            } else {
                alert(`Bu konuda (${konuAdi}) hiç soru bulunamadı.`);
                // Anayasadan geliyorsa alt menüye, diğerlerinden geliyorsa ana menüye dön
                gosterEkrani(aktifKonuDosyasi === 'anayasajson' ? anayasaAltMenu : konuSecimEkrani);
            }

        } catch (error) {
            console.error('Sorular yüklenirken hata oluştu:', error);
            alert(`Sorular yüklenemedi. Detaylar için konsolu kontrol edin. Hata: ${error.message}`);
            gosterEkrani(konuSecimEkrani);
        }
    };


    const renderSoru = (index) => {
        const soru = tumSorular[index];
        if (!soru) return;

        // Ekranı temizle/resetle
        seceneklerContainer.innerHTML = '';
        aciklamaKutusu.classList.add('hidden');
        // Cevap durumlarını kaldır
        seceneklerContainer.classList.remove('cevaplandi'); 
        favoriIcon.classList.remove('fas', 'far');
        favoriIcon.classList.add('far'); // Favori değil (içi boş kalp)

        // Soru numarasını güncelle
        soruNumarasiSpan.textContent = `Soru: ${index + 1}/${tumSorular.length}`;
        gosterilenSoruMetni.textContent = soru.soru_metni;

        // Seçenekleri oluştur
        const harfler = ['a', 'b', 'c', 'd', 'e'];
        harfler.forEach(key => {
            if (soru.secenekler[key] !== undefined) {
                const button = document.createElement('button');
                button.className = 'option-button';
                button.setAttribute('data-cevap', key);
                
                const secenekMetni = `${key.toUpperCase()}) ${soru.secenekler[key]}`;
                button.textContent = secenekMetni;

                button.addEventListener('click', () => {
                    // Sınav modunda veya öğrenme modunda cevap kontrolü
                    cevapKontrol(button, soru);
                });

                seceneklerContainer.appendChild(button);
            }
        });
    };

    const cevapKontrol = (tiklananButton, soru) => {
        // Zaten cevaplanmışsa bir daha cevaplama
        if (seceneklerContainer.classList.contains('cevaplandi')) return;
        seceneklerContainer.classList.add('cevaplandi');


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

        // Açıklamayı sadece Öğrenme Modunda göster
        if (aktifMod === 'ogrenme' && soru.aciklama) {
            aciklamaMetni.textContent = soru.aciklama;
            aciklamaKutusu.classList.remove('hidden');
        }
        
        // Sınav modu için skor takibi burada yapılabilir. (Şu an sadece görsel feedback veriyor.)
    };

    // --- Navigasyon (Geri/İleri) ---

    ileriButton.addEventListener('click', () => {
        if (mevcutSoruIndex < tumSorular.length - 1) {
            mevcutSoruIndex++;
            renderSoru(mevcutSoruIndex);
        } else {
            alert('Son soruya ulaştınız. Sınavı tamamla veya ana menüye dön.');
        }
    });

    geriButton.addEventListener('click', () => {
        if (mevcutSoruIndex > 0) {
            mevcutSoruIndex--;
            renderSoru(mevcutSoruIndex);
        } else {
             // Soru 1'deyken geri basılırsa bir önceki ekrana dön
            const oncekiEkran = (aktifKonuDosyasi === 'anayasajson' || aktifKonuDosyasi === '') ? anayasaAltMenu : konuSecimEkrani;
            gosterEkrani(oncekiEkran);
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

});
