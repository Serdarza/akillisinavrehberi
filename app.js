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
    const kanitMetni = document.getElementById('kanitMetni'); // Yeni Kanıt Cümlesi alanı
    const paylasIcon = document.getElementById('paylasIcon'); // Yeni Paylaşma İkonu
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
    let sinavCevaplari = {}; 
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

    // --- Paylaşma Fonksiyonu ---
    const shareScreenshot = async () => {
        if (!html2canvas) {
            alert('Ekran görüntüsü alma kütüphanesi yüklenemedi.');
            return;
        }
        
        // Sadece soru ekranını yakala
        const elementToCapture = document.getElementById('soruEkrani'); 
        if (!elementToCapture || elementToCapture.classList.contains('hidden')) {
             alert('Paylaşılacak bir soru ekranı bulunmamaktadır.');
             return;
        }

        try {
            // html2canvas ile DOM elementini tuval (canvas) üzerine çiz
            const canvas = await html2canvas(elementToCapture, {
                useCORS: true, // CORS ile ilgili sorunları çözmek için
                allowTaint: true, // İçeriği güvenilir olmayan kaynaklardan yüklemeye izin ver (dikkatli kullanılmalı)
                scrollX: -window.scrollX, // Kaydırma konumunu düzelt
                scrollY: -window.scrollY,
                windowWidth: document.documentElement.offsetWidth,
                windowHeight: document.documentElement.offsetHeight
            });

            const base64image = canvas.toDataURL('image/png');

            if (navigator.share) {
                // Tarayıcı yerel paylaşım API'si (Android/iOS)
                const blob = await (await fetch(base64image)).blob();
                const file = new File([blob], 'Soru_Ekranı.png', { type: 'image/png' });
                
                await navigator.share({
                    files: [file],
                    title: 'Akıllı Sınav Rehberi Soru Paylaşımı',
                    text: 'Anayasa sorusu çözüyorum, bilgini test et!',
                });
            } else {
                // Paylaşım API'si yoksa: Sadece resmi indir veya pop-up ile göster (Alternatif)
                const link = document.createElement('a');
                link.download = 'soru_ekrani.png';
                link.href = base64image;
                link.click();
                alert('Paylaşım API\'si desteklenmediği için ekran görüntüsü indirildi.');
            }

        } catch (error) {
            console.error('Ekran görüntüsü alma veya paylaşma hatası:', error);
            alert('Paylaşım sırasında bir hata oluştu. (Hata: Konsolu kontrol edin)');
        }
    };


    // --- Konu Seçimi ve Alt Menü İşlemleri ---

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
            // JSON dosya adını kontrol et (anayasajson.json, disiplinkanunu.json vb.)
            const response = await fetch(`${dosyaAdi}.json`);
            if (!response.ok) {
                 // Eğer dosya bulunamazsa boş bir dizi ile devam et (Diğer dersler için)
                 console.warn(`Uyarı: Dosya bulunamadı veya boş. ${dosyaAdi}.json`);
                 tumSorular = []; 
            } else {
                let data = await response.json();
            
                // JSON dizisi beklenir (Tek obje ise diziye dönüştürür)
                if (!Array.isArray(data)) {
                    if (data && data.soru_metni) data = [data]; 
                    else data = []; // Boş JSON
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
                gosterEkrani(aktifKonuDosyasi === 'anayasajson' ? anayasaAltMenu : konuSecimEkrani);
            }

        } catch (error) {
            console.error('Sorular yüklenirken genel hata oluştu:', error);
            alert(`Sorular yüklenemedi. JSON dosya yapısını kontrol edin. Hata: ${error.message}`);
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

        // Sınav modunda önceden cevaplanmışsa renklendir (Açıklama sınavda gösterilmez)
        if (aktifMod === 'sinav' && sinavCevaplari[soru.soru_id]) {
            renklendirCevaplar(soru, sinavCevaplari[soru.soru_id]);
        } 
        
        // Yanlışları Gözden Geçirme Modunda Açıklamayı Hemen Göster
        if (aktifMod === 'ogrenme' && soru.kullanici_cevabi) {
             cevapKontrol(null, soru); // Cevap kontrolünü tetikle, ancak butona tıklama
             renklendirCevaplar(soru, soru.kullanici_cevabi); // Yanlışını renklendir
        }
    };

    // --- Cevap Kontrolü ve Renklendirme ---

    const cevapKontrol = (tiklananButton, soru) => {
        if (tiklananButton && seceneklerContainer.classList.contains('cevaplandi')) return;
        seceneklerContainer.classList.add('cevaplandi');

        const dogruOrijinalCevap = soru.dogru_secenek;
        let kullaniciOrijinalCevap;

        if (tiklananButton) {
             kullaniciOrijinalCevap = tiklananButton.getAttribute('data-orijinal-cevap');
        } else if (aktifMod === 'ogrenme' && soru.kullanici_cevabi) {
             // Yanlışları gözden geçirme modu için kullanıcının önceki cevabını al
             kullaniciOrijinalCevap = soru.kullanici_cevabi; 
        }

        if (aktifMod === 'sinav' && tiklananButton) {
            sinavCevaplari[soru.soru_id] = kullaniciOrijinalCevap;
        }

        // Renklendirmeyi yap
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
            gosterEkrani(anayasaAltMenu);
        }
    };


    // --- Event Listenerlar (Başlangıç ve Paylaşma) ---
    startCountdown(); 
    gosterEkrani(konuSecimEkrani);

    // Paylaşma İkonu dinleyicisi
    paylasIcon.addEventListener('click', shareScreenshot);

});
