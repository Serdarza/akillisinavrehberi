document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elementleri ---
    const konuSecimEkrani = document.getElementById('konuSecimEkrani');
    const anayasaAltMenu = document.getElementById('anayasaAltMenu');
    const soruEkrani = document.getElementById('soruEkrani');
    const altMenuBaslik = document.getElementById('altMenuBaslik');

    const soruNumarasiSpan = document.getElementById('soruNumarasi');
    const gosterilenSoruMetni = document.getElementById('gosterilenSoruMetni');
    const seceneklerContainer = document.getElementById('seceneklerContainer');
    const aciklamaKutusu = document.getElementById('aciklamaKutusu');
    const aciklamaMetni = document.getElementById('aciklamaMetni');
    const kanitMetni = document.getElementById('kanitMetni');
    const favoriIcon = document.getElementById('favoriIcon');
    const geriButton = document.getElementById('geriButton');
    const ileriButton = document.getElementById('ileriButton');

    // Geri Sayım Elementleri
    const daysSpan = document.getElementById('days');
    const hoursSpan = document.getElementById('hours');
    const minutesSpan = document.getElementById('minutes');
    const secondsSpan = document.getElementById('seconds');
    const countdownHeader = document.querySelector('.countdown-header');


    // --- Uygulama Durumu (State) ---
    let tumSorular = []; 
    let mevcutSoruIndex = 0;
    let aktifKonuDosyasi = '';
    let aktifMod = ''; // 'ogrenme' veya 'sinav'
    let sinavCevaplari = {}; // Sınav modu için: {soru_id: 'orijinal_cevap_key', ...}
    let ogrenmeModuSorulari = []; 
    const HARFLER = ['A', 'B', 'C', 'D', 'E'];

    // --- Geri Sayım Fonksiyonu ---

    const startCountdown = () => {
        // Sınav Tarihi: 20 Aralık 2025
        const sinavTarihi = new Date('2025-12-20T00:00:00'); 
        
        const updateCountdown = () => {
            const now = new Date();
            const distance = sinavTarihi - now;

            if (distance < 0) {
                clearInterval(interval);
                countdownHeader.textContent = "Sınav Başladı!";
                daysSpan.textContent = hoursSpan.textContent = minutesSpan.textContent = secondsSpan.textContent = "00";
                return;
            }

            // Hesaplamalar
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // Değerleri DOM'a yazma (tek haneli ise önüne 0 ekle)
            daysSpan.textContent = String(days).padStart(2, '0');
            hoursSpan.textContent = String(hours).padStart(2, '0');
            minutesSpan.textContent = String(minutes).padStart(2, '0');
            secondsSpan.textContent = String(seconds).padStart(2, '0');
        };

        // Her saniye güncelle
        const interval = setInterval(updateCountdown, 1000);
        updateCountdown(); // Sayfa yüklenir yüklenmez ilk güncellemeyi yap
    };

    // --- Yardımcı Fonksiyonlar ---

    const gosterEkrani = (ekran) => {
        [konuSecimEkrani, anayasaAltMenu, soruEkrani].forEach(e => e.classList.add('hidden'));
        ekran.classList.remove('hidden');
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

    // --- Başlangıç/Navigasyon İşlemleri ---

    document.querySelectorAll('#konuButonlari .menu-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const konuDosyasi = e.target.getAttribute('data-konu');
            aktifKonuDosyasi = konuDosyasi;
            altMenuBaslik.textContent = e.target.textContent;
            
            if (konuDosyasi === 'anayasajson') {
                gosterEkrani(anayasaAltMenu);
            } else {
                loadQuestions(konuDosyasi, 'ogrenme', e.target.textContent);
            }
        });
    });

    anayasaAltMenu.querySelectorAll('.menu-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const action = e.target.getAttribute('data-action');
            if (action === 'geri') {
                gosterEkrani(konuSecimEkrani);
            } else {
                loadQuestions(aktifKonuDosyasi, action, altMenuBaslik.textContent);
            }
        });
    });

    // --- Soru Yükleme ve Yönlendirme ---

    const loadQuestions = async (dosyaAdi, mod, konuAdi) => {
        try {
            const response = await fetch(`${dosyaAdi}.json`);
            if (!response.ok) throw new Error(`Dosya bulunamadı: ${dosyaAdi}.json`);
            
            let data = await response.json();
            
            if (!Array.isArray(data)) {
                 if (data && data.soru_metni) data = [data]; 
                 else throw new Error("JSON formatı geçerli değil veya boş.");
            }

            tumSorular = data;

            if (tumSorular.length > 0) {
                aktifMod = mod;
                ogrenmeModuSorulari = [...data]; 

                if (mod === 'sinav') {
                    const sinavBoyutu = Math.min(20, tumSorular.length);
                    tumSorular = shuffleArray(tumSorular).slice(0, sinavBoyutu); 
                    mevcutSoruIndex = 0;
                    sinavCevaplari = {}; 
                    alert(`"${konuAdi}" konusu için ${sinavBoyutu} soruluk sınav başlatıldı.`);
                } else {
                    mevcutSoruIndex = loadLastIndex(aktifKonuDosyasi);
                    if (mevcutSoruIndex >= tumSorular.length) mevcutSoruIndex = 0; 
                    alert(`"${konuAdi}" konusu için Öğrenme Modu başlatıldı. Soru ${mevcutSoruIndex + 1}'den devam ediliyor.`);
                }
                
                gosterEkrani(soruEkrani);
                renderSoru(mevcutSoruIndex);
            } else {
                alert(`Bu konuda (${konuAdi}) hiç soru bulunamadı.`);
                gosterEkrani(aktifKonuDosyasi === 'anayasajson' ? anayasaAltMenu : konuSecimEkrani);
            }

        } catch (error) {
            console.error('Sorular yüklenirken hata oluştu:', error);
            alert(`Sorular yüklenemedi. Konsolu kontrol edin. Hata: ${error.message}`);
            gosterEkrani(konuSecimEkrani);
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
        favoriIcon.classList.remove('fas', 'far');
        favoriIcon.classList.add('far');
        
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

        // Sınav modunda önceden cevaplanmışsa renklendir ve göster
        if (aktifMod === 'sinav' && sinavCevaplari[soru.soru_id]) {
            renklendirCevaplar(soru, sinavCevaplari[soru.soru_id]);
        }
    };

    // --- Cevap Kontrolü ve Renklendirme ---

    const cevapKontrol = (tiklananButton, soru) => {
        if (seceneklerContainer.classList.contains('cevaplandi')) return;
        seceneklerContainer.classList.add('cevaplandi');

        const dogruOrijinalCevap = soru.dogru_secenek;
        const kullaniciOrijinalCevap = tiklananButton.getAttribute('data-orijinal-cevap');
        
        if (aktifMod === 'sinav') {
            sinavCevaplari[soru.soru_id] = kullaniciOrijinalCevap;
        }

        renklendirCevaplar(soru, kullaniciOrijinalCevap);
        
        // Açıklamayı sadece Öğrenme Modunda göster
        if (aktifMod === 'ogrenme') {
            aciklamaMetni.innerHTML = soru.aciklama || 'Açıklama metni bulunmamaktadır.';
            kanitMetni.innerHTML = soru.kanit_cumlesi || 'Kanıt cümlesi bulunmamaktadır.';
            aciklamaKutusu.classList.remove('hidden');
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
                alert('Tüm soruları tamamladınız. Öğrenme modu başlangıca döndürülüyor.');
                saveLastIndex(aktifKonuDosyasi, 0); 
                gosterEkrani(anayasaAltMenu);
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
            const oncekiEkran = aktifKonuDosyasi === 'anayasajson' ? anayasaAltMenu : konuSecimEkrani;
            gosterEkrani(oncekiEkran);
        }
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
                    // Kullanıcının yanlış cevabını da sorunun içine koy ki, gözden geçirirken hangi şıkkı işaretlediğini hatırlasın.
                    orjinalSoru.kullanici_cevabi = kullaniciCevabi; 
                    yanlisSorular.push(orjinalSoru);
                }
            }
        });

        let sonucMetni = `Sınav Tamamlandı! Doğru Sayısı: ${dogruSayisi} / ${tumSorular.length}`;
        alert(sonucMetni);

        if (yanlisSorular.length > 0) {
            // Yanlışları gözden geçirme modu
            tumSorular = yanlisSorular;
            mevcutSoruIndex = 0;
            aktifMod = 'ogrenme'; 
            
            alert(`Yanlış yaptığınız ${yanlisSorular.length} soru, cevap ve açıklamalarıyla gösteriliyor.`);
            renderSoru(mevcutSoruIndex);
        } else {
            gosterEkrani(anayasaAltMenu);
        }
    };


    // --- Başlangıç Fonksiyonları ---
    startCountdown(); // Geri sayımı başlat
    gosterEkrani(konuSecimEkrani); // Konu seçim ekranını göster

});
