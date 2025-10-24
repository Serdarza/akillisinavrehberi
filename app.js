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
    const geriButton = document.getElementById('geriButton');
    const ileriButton = document.getElementById('ileriButton');
    
    // Geri Sayım Elementleri
    const countdownContainer = document.getElementById('countdownContainer');
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
    let sinavCevaplari = {}; 
    let ogrenmeModuSorulari = []; 
    const HARFLER = ['A', 'B', 'C', 'D', 'E'];

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

    // --- Ekran Görünürlüğü Fonksiyonları ---

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

    // --- Paylaşma Fonksiyonu ---
    const shareScreenshot = async () => {
        if (!html2canvas) {
            alert('Ekran görüntüsü alma kütüphanesi yüklenemedi. Lütfen internet bağlantınızı kontrol edin.');
            return;
        }
        
        const elementToCapture = document.getElementById('soruEkrani'); 
        if (!elementToCapture || elementToCapture.classList.contains('hidden')) {
             alert('Paylaşılacak bir soru ekranı bulunmamaktadır.');
             return;
        }

        try {
            const canvas = await html2canvas(elementToCapture, {
                useCORS: true, 
                allowTaint: true, 
                scrollX: -window.scrollX, 
                scrollY: -window.scrollY,
                windowWidth: elementToCapture.offsetWidth, 
                windowHeight: elementToCapture.offsetHeight
            });

            const base64image = canvas.toDataURL('image/png');

            if (navigator.share) {
                const blob = await (await fetch(base64image)).blob();
                const file = new File([blob], 'Soru_Ekranı.png', { type: 'image/png' });
                
                await navigator.share({
                    files: [file],
                    title: 'Akıllı Sınav Rehberi Soru Paylaşımı',
                    text: 'Bilgini test et!',
                });
            } else {
                const link = document.createElement('a');
                link.download = 'soru_ekrani.png';
                link.href = base64image;
                link.click();
                alert('Paylaşım API\'si desteklenmediği için ekran görüntüsü indirildi.');
            }

        } catch (error) {
            console.error('Ekran görüntüsü alma veya paylaşma hatası:', error);
            alert('Paylaşım sırasında bir hata oluştu. Lütfen konsolu kontrol edin.');
        }
    };


    // --- Konu Seçimi ve Alt Menü İşlemleri ---

    document.querySelectorAll('#konuButonlari .menu-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const konuDosyasi = e.target.getAttribute('data-konu');
            const konuAdi = e.target.textContent;
            aktifKonuDosyasi = konuDosyasi;
            altMenuBaslik.textContent = konuAdi;
            
            // Tüm dersler artık alt menüye yönlendirilir
            gosterEkrani(altMenu);
        });
    });

    // Alt Menü Aksiyonları (Alt Menü'deki tüm butonları yakalar)
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
                alert(`Bu konuda (${konuAdi}) hiç soru bulunamadı. Lütfen JSON dosyasını doldurun.`);
                gosterEkrani(altMenu);
            }

        } catch (error) {
            console.error('Sorular yüklenirken genel hata oluştu:', error);
            alert(`Sorular yüklenemedi. JSON dosya yapısını kontrol edin. Hata: ${error.message}`);
            gosterEkrani(altMenu); // Hata durumunda alt menüye geri dön
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

        // Yanlışları Gözden Geçirme Modunda Açıklamayı Hemen Göster (Renklendirme ve Açıklama)
        if (aktifMod === 'ogrenme' && soru.kullanici_cevabi) {
             // Sınavdan gelen yanlışsa cevabını renklendir ve açıklamayı göster
             cevapKontrol(null, soru); 
        }
    };

    // --- Cevap Kontrolü ve Renklendirme (Açıklama Gösterme Garantisi) ---

    const cevapKontrol = (tiklananButton, soru) => {
        const isAlreadyAnswered = seceneklerContainer.classList.contains('cevaplandi');
        
        // Yanlışları gözden geçirme modundan gelmiyorsa (tiklananButton === null) ve zaten cevaplanmışsa çık
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
        
        // Açıklamayı sadece Öğrenme Modunda (veya sınav sonrası yanlışları incelerken) göster
        if (aktifMod === 'ogrenme') {
            // Açıklama ve Kanıt Cümlesi garantisi: Alanlar boş gelirse varsayılan metni yazdır.
            aciklamaMetni.innerHTML = soru.aciklama || 'Açıklama metni JSON verisinde bulunmamaktadır.';
            kanitMetni.innerHTML = soru.kanit_cumlesi || 'Kanıt cümlesi JSON verisinde bulunmamaktadır.';
            aciklamaKutusu.classList.remove('hidden');
        } else {
             // Sınav modu için açıklama kutusunu gizle
             aciklamaKutusu.classList.add('hidden');
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
                gosterEkrani(altMenu); // Alt menüye dön
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
            gosterEkrani(altMenu); // Alt menüye dön
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
                    orjinalSoru.kullanici_cevabi = kullaniciCevabi; 
                    yanlisSorular.push(orjinalSoru);
                }
            }
        });

        let sonucMetni = `Sınav Tamamlandı! Doğru Sayısı: ${dogruSayisi} / ${tumSorular.length}`;
        alert(sonucMetni);

        if (yanlisSorular.length > 0) {
            tumSorular = yanlisSorular;
            mevcutSoruIndex = 0;
            aktifMod = 'ogrenme'; 
            
            alert(`Yanlış yaptığınız ${yanlisSorular.length} soru, cevap ve açıklamalarıyla gösteriliyor.`);
            renderSoru(mevcutSoruIndex);
        } else {
            gosterEkrani(altMenu);
        }
    };


    // --- Event Listenerlar (Başlangıç ve Paylaşma) ---
    startCountdown(); 
    gosterEkrani(konuSecimEkrani);

    // Paylaşma İkonu dinleyicisi
    paylasIcon.addEventListener('click', shareScreenshot);

});
