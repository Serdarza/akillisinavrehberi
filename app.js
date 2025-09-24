const dersler = [
    { "id": "anayasa", "ad": "Anayasa" }
    // Buraya daha fazla ders ekleyebilirsiniz: { "id": "hukuk", "ad": "Hukuk" }
];

let tumSorular = [];
let mevcutSorular = [];
let mevcutSoruIndex = 0;
let secilenDersId = '';

document.addEventListener('DOMContentLoaded', () => {
    dersleriYukle();
    // Diğer event listener'lar buraya eklenecek
});

function dersleriYukle() {
    const dersListesiDiv = document.getElementById('ders-listesi');
    dersListesiDiv.innerHTML = ''; // Temizle
    if (dersler.length === 0) {
        dersListesiDiv.innerHTML = '<p>Henüz ders eklenmemiş.</p>';
        return;
    }
    dersler.forEach(ders => {
        const button = document.createElement('button');
        button.innerText = ders.ad;
        button.onclick = () => dersSec(ders.id, ders.ad);
        dersListesiDiv.appendChild(button);
    });
}

async function dersSec(dersId, dersAdi) {
    secilenDersId = dersId;
    document.getElementById('secilen-ders-baslik').innerText = dersAdi;
    ekranGecisi('ekran-modlar');
    await sorulariYukle(dersId);
}

async function sorulariYukle(dersId) {
    try {
        const response = await fetch(`data/${dersId}.json`);
        if (!response.ok) throw new Error('Dosya bulunamadı');
        tumSorular = await response.json();
        console.log(`${dersAdi} için ${tumSorular.length} soru yüklendi.`);
    } catch (error) {
        console.error("Sorular yüklenemedi:", error);
        alert("Bu dersin soruları yüklenemedi. 'data' klasöründe doğru JSON dosyası olduğundan emin olun.");
        tumSorular = [];
    }
}

// Mod butonları event'leri
document.querySelectorAll('.mod-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        const mod = e.target.dataset.mod;
        if (tumSorular.length === 0) {
            alert("Bu dersin soruları yüklenemedi veya boş.");
            return;
        }
        if (mod === 'sinav') {
            // 20 rastgele soru
            mevcutSorular = [...tumSorular].sort(() => Math.random() - 0.5).slice(0, 20);
        } else if (mod === 'ogrenme') {
            // Tüm sorular
            mevcutSorular = [...tumSorular];
        }
        if (mevcutSorular.length > 0) {
            sinaviBaslat();
        } else {
            alert("Soru bulunamadı.");
        }
    });
});

function sinaviBaslat() {
    mevcutSoruIndex = 0;
    ekranGecisi('ekran-sinav');
    soruyuGoster();
}

function soruyuGoster() {
    if (mevcutSoruIndex >= mevcutSorular.length) {
        alert("Sınav/Öğrenme bitti!");
        ekranGecisi('ekran-modlar');
        return;
    }
    const soru = mevcutSorular[mevcutSoruIndex];
    document.getElementById('soru-sayac').innerText = `Soru: ${mevcutSoruIndex + 1}/${mevcutSorular.length}`;
    document.getElementById('soru-metni').innerText = soru.soru;
    const seceneklerKonteyeri = document.getElementById('secenekler-konteyeri');
    seceneklerKonteyeri.innerHTML = '';
    
    const secenekHarfleri = ['A) ', 'B) ', 'C) ', 'D) ', 'E) '];
    
    soru.secenekler.forEach((secenek, index) => {
        const button = document.createElement('button');
        button.innerText = secenekHarfleri[index] + secenek; // Harf ekle
        button.classList.add('secenek-btn');
        button.onclick = () => cevapKontrol(index, soru.dogruCevapIndex);
        seceneklerKonteyeri.appendChild(button);
    });
    document.getElementById('aciklama-konteyneri').classList.add('gizli');
}

function cevapKontrol(secilenIndex, dogruIndex) {
    const secenekButonlari = document.querySelectorAll('.secenek-btn');
    secenekButonlari.forEach((button, index) => {
        button.disabled = true;
        if (index === dogruIndex) {
            button.classList.add('dogru');
        } else if (index === secilenIndex && index !== dogruIndex) {
            button.classList.add('yanlis');
        }
    });
    document.getElementById('aciklama-metni').innerText = mevcutSorular[mevcutSoruIndex].aciklama || 'Açıklama yok.';
    document.getElementById('aciklama-konteyneri').classList.remove('gizli');
}

// Navigasyon butonları
document.getElementById('ileri-btn').addEventListener('click', () => {
    mevcutSoruIndex++;
    soruyuGoster();
});

document.getElementById('geri-btn').addEventListener('click', () => {
    if (mevcutSoruIndex > 0) {
        mevcutSoruIndex--;
        soruyuGoster();
    }
});

document.getElementById('derse-geri-don').addEventListener('click', () => ekranGecisi('ekran-dersler'));
document.getElementById('ana-menuye-don-btn').addEventListener('click', () => ekranGecisi('ekran-dersler'));

function ekranGecisi(gosterilecekEkranId) {
    document.querySelectorAll('.ekran').forEach(ekran => ekran.classList.remove('aktif'));
    document.getElementById(gosterilecekEkranId).classList.add('aktif');
}
