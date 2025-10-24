# akillisinavrehberi

Bu depo, çeşitli hukuk ve tarih konularında (Anayasa, İdare Hukuku, TSK Disiplin Kanunu vb.) sınavlara hazırlık amacıyla oluşturulmuş bir web tabanlı soru çözüm uygulamasının kaynak kodlarını içermektedir.

## Özellikler

- Konu seçimi ile derslere erişim.
- Anayasa için özel alt menü (Öğrenme Modu, Sınav, Favori Havuzu).
- Öğrenme Modunda soruyu çözme, doğru/yanlış cevabı görme ve açıklamayı okuma imkanı.
- JSON dosyaları ile yönetilen kolay güncellenebilir soru havuzu.

## Kullanılan Teknolojiler

- HTML5
- CSS3
- JavaScript (Vanilla JS)

## Dosya Yapısı

- `index.html`: Uygulamanın ana iskeleti ve tüm ekranları barındırır.
- `style.css`: Uygulamanın görsel stilini yönetir.
- `app.js`: Uygulama mantığını, ekranlar arası geçişleri ve soru yükleme/çözme işlevlerini içerir.
- `[konuadı].json`: Her bir dersin (anayasajson, disiplinkanunu.json, vb.) soru ve cevaplarını içeren veri dosyalarıdır.
