// Not: Bu örnekte ders listesi doğrudan koda yazılmıştır.
// JSON'dan çekme kısmı, sadece web arayüzü kullanıldığı için basitleştirilmiştir.
const dersler = [
    { "id": "anayasa", "ad": "Anayasa" }
    // Buraya başka dersler de ekleyebilirsiniz.
    // { "id": "tarih", "ad": "Tarih" }
];

let tumSorular = [];
let mevcutSorular = [];
let mevcutSoruIndex = 0;
let secilenDersId = '';

// Ekranlar
const ekranDersler = document.getElementById('ekran-dersler');
const ekranModlar = document.getElementById('ekran-modlar');
const ekranSinav = document.getElementById('ekran-sinav');

document.addEventListener('DOMContentLoaded', dersleriYukle);

function dersleriYukle() {
    const dersListesiDiv = document.getElementById('ders-listesi');
    dersListesiDiv.innerHTML = '';
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
        tumSorular = await response.json();
    } catch (error) {
        console.error("Sorular yüklenemedi:", error);
        alert("Bu dersin soruları yüklenemedi. 'data' klasöründe doğru JSON dosyası olduğundan emin olun.");
        tumSorular = [];
    }
}

document.querySelectorAll('.mod-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        const mod = e.target.dataset.mod;
        if (tumSorular.length === 0) {
            alert("Önce soruların yüklenmesi bekleniyor veya soru dosyası boş.");
            return;
        }
        if (mod === 'sinav') {
            mevcutSorular = [...tumSorular].sort(() => Math.random() - 0.5).slice(0, 20);
        } else if (mod === 'ogrenme') {
            mevcutSorular = [...tumSorular];
        }
        if (mevcutSorular.length > 0) sinaviBaslat();
    });
});

function sinaviBaslat() {
    mevcutSoruIndex = 0;
    ekranGecisi('ekran-sinav');
    soruyuGoster();
}

function soruyuGoster() {
    if (mevcutSoruIndex >= mevcutSorular.length) {
        alert("Sınav bitti!");
        ekranGecisi('ekran-modlar');
        return;
    }
    const soru = mevcutSorular[mevcutSoruIndex];
    document.getElementById('soru-sayac').innerText = `Soru: ${mevcutSoruIndex + 1}/${mevcutSorular.length}`;
    document.getElementById('soru-metni').innerText = soru.soru;
    const seceneklerKonteyeri = document.getElementById('secenekler-konteyeri');
    seceneklerKonteyeri.innerHTML = '';
    soru.secenekler.forEach((secenek, index) => {
        const button = document.createElement('button');
        button.innerText = secenek;
        button.classList.add('secenek-btn');
        button.onclick = () => cevapKontrol(index, soru.dogruCevapIndex);
        seceneklerKonteyeri.appendChild(button);
    });
    document.getElementById('aciklama-konteyeri').classList.add('gizli');
}

function cevapKontrol(secilenIndex, dogruIndex) {
    const secenekButonlari = document.querySelectorAll('.secenek-btn');
    secenekButonlari.forEach((button, index) => {
        if (index === dogruIndex) button.classList.add('dogru');
        else if (index === secilenIndex) button.classList.add('yanlis');
        button.disabled = true;
    });
    document.getElementById('aciklama-metni').innerText = mevcutSorular[mevcutSoruIndex].aciklama;
    document.getElementById('aciklama-konteyeri').classList.remove('gizli');
}

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

function ekranGecisi(gosterilecekEkranId) {
    document.querySelectorAll('.ekran').forEach(ekran => ekran.classList.remove('aktif'));
    document.getElementById(gosterilecekEkranId).classList.add('aktif');
}
