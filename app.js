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

    // --- Uygulama Durumu (State) ---
    let tumSorular = []; 
    let mevcutSoruIndex = 0;
    let aktifKonuDosyasi = '';
    let aktifMod = ''; // 'ogrenme' veya 'sinav'
    let sinavCevaplari = {}; // Sınav modu için: {soru_id: 'orijinal_cevap_key', ...}
    let ogrenmeModuSorulari = []; // Sınav bitiminde yanlışları göstermek için kullanılır
    const HARFLER = ['A', 'B', 'C', 'D', 'E'];

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
                // Diğer konular için varsayılan olarak Öğrenme Modunu yükle
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
            
            // Eğer JSON tek bir obje ise diziye dönüştür
            if (!Array.isArray(data)) {
                 if (data && data.soru_metni) data = [data]; 
                 else throw new Error("JSON formatı geçerli değil veya boş.");
            }

            tumSorular = data;

            if (tumSorular.length > 0) {
                aktifMod = mod;
                ogrenmeModuSorulari = [...data]; // Orijinal tam soru listesini yedekle

                if (mod === 'sinav') {
                    // 20 Soruluk Test Modu
                    const sinavBoyutu = Math.min(20, tumSorular.length);
                    tumSorular = shuffleArray(tumSorular).slice(0, sinavBoyutu); // Rastgele 20 soru seç
                    mevcutSoruIndex = 0;
                    sinavCevaplari = {}; // Sınav cevaplarını sıfırla
                    alert(`"${konuAdi}" konusu için ${sinavBoyutu} soruluk sınav başlatıldı.`);
                } else {
                    // Öğrenme Modu: En son kalınan soruyu getir
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
            alert(`Sorular yüklenemedi: ${error.message}`);
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
            key: key, // Orijinal cevap anahtarı (a, b, c, d, e)
            value: soru.secenekler[key] // Seçenek metni
        }));
        karistirilmisSecenekler = shuffleArray(karistirilmisSecenekler);

        // Seçenekleri oluştur
        karistirilmisSecenekler.forEach((secenek, i) => {
            const button = document.createElement('button');
            button.className = 'option-button';
            button.setAttribute('data-orijinal-cevap', secenek.key); 
            
            // Seçenek metnini formatla (A) B) gibi)
            const secenekMetni = `${HARFLER[i]}) ${secenek.value}`;
            button.textContent = secenekMetni;

            // Öğrenme modunda veya sınav modunda tıklama dinleyicisi
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
        // Zaten cevaplanmışsa bir daha kontrol etme
        if (seceneklerContainer.classList.contains('cevaplandi')) return;
        seceneklerContainer.classList.add('cevaplandi');

        const dogruOrijinalCevap = soru.dogru_secenek;
        const kullaniciOrijinalCevap = tiklananButton.getAttribute('data-orijinal-cevap');
        
        // Sınav Modu Cevap Kaydı
        if (aktifMod === 'sinav') {
            sinavCevaplari[soru.soru_id] = kullaniciOrijinalCevap;
        }

        // Renklendirmeyi yap
        renklendirCevaplar(soru, kullaniciOrijinalCevap);
        
        // Açıklamayı sadece Öğrenme Modunda göster
        if (aktifMod === 'ogrenme') {
            aciklamaMetni.innerHTML = soru.aciklama || 'Açıklama metni bulunmamaktadır.';
            // Kanıt cümlesi zorunlu olmasa da varsa göster
            kanitMetni.innerHTML = soru.kanit_cumlesi || 'Kanıt cümlesi bulunmamaktadır.';
            aciklamaKutusu.classList.remove('hidden');
        }
    };

    const renklendirCevaplar = (soru, kullaniciOrijinalCevap) => {
        const dogruOrijinalCevap = soru.dogru_secenek;

        seceneklerContainer.querySelectorAll('.option-button').forEach(btn => {
            btn.disabled = true;

            if (btn.getAttribute('data-orijinal-cevap') === dogruOrijinalCevap) {
                btn.classList.add('dogru'); // Doğru şık her zaman yeşil
            } else if (btn.getAttribute('data-orijinal-cevap') === kullaniciOrijinalCevap) {
                // Kullanıcının yanlış cevabı kırmızı
                btn.classList.add('yanlis');
            }
        });
    };

    // --- Navigasyon ve Sınav Sonu ---

    ileriButton.addEventListener('click', () => {
        if (mevcutSoruIndex < tumSorular.length - 1) {
            mevcutSoruIndex++;
            if(aktifMod === 'ogrenme') {
                saveLastIndex(aktifKonuDosyasi, mevcutSoruIndex); // Öğrenme modunda kaydet
            }
            renderSoru(mevcutSoruIndex);
        } else {
            // Son soruya ulaşıldı
            if (aktifMod === 'sinav') {
                gosterSinavSonucu();
            } else {
                alert('Tüm soruları tamamladınız.');
                saveLastIndex(aktifKonuDosyasi, 0); // Başlangıca dön
                gosterEkrani(anayasaAltMenu);
            }
        }
    });

    geriButton.addEventListener('click', () => {
        if (mevcutSoruIndex > 0) {
            mevcutSoruIndex--;
            if(aktifMod === 'ogrenme') {
                saveLastIndex(aktifKonuDosyasi, mevcutSoruIndex); // Öğrenme modunda kaydet
            }
            renderSoru(mevcutSoruIndex);
        } else {
            // Soru 1'deyken geri basılırsa bir önceki ekrana dön
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
                // Yanlış veya boş bırakılan soruları orijinal soru listesinden bul ve ekle
                const orjinalSoru = ogrenmeModuSorulari.find(q => q.soru_id === soru.soru_id);
                if (orjinalSoru) {
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
            aktifMod = 'ogrenme'; // Yanlışları öğrenme modunda göster
            
            alert(`Yanlış yaptığınız ${yanlisSorular.length} soru, cevap ve açıklamalarıyla gösteriliyor.`);
            renderSoru(mevcutSoruIndex);
        } else {
            // Hiç yanlış yoksa ana menüye dön
            gosterEkrani(anayasaAltMenu);
        }
    };


    // --- Ekstra Fonksiyonlar ---
    favoriIcon.addEventListener('click', () => {
        favoriIcon.classList.toggle('far');
        favoriIcon.classList.toggle('fas');
        alert('Soru favorilere eklendi/kaldırıldı.');
    });

    gosterEkrani(konuSecimEkrani);

});
