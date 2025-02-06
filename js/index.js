document.addEventListener('DOMContentLoaded', async () => { //Sayfa yüklendiğinde gerçekleşecek olaylar
    try {
        const response = await fetch('/random-images'); //Sunucudan yani server.js den (/random-images endpoint'inden) rastgele resimler ister.
        const data = await response.json();  //Sunucudan dönen veriyi JSON formatında alır.

        if (data.images) {  // Eğer dönen veri içerisinde "images" adında bir dizi varsa:
            const slider = document.querySelector('.slider');  //Resimlerin gösterileceği ".slider" sınıf HTML elementini seç.
            slider.innerHTML = ''; // Mevcut resimleri temizle

            // Gelen resimlerin her biri için döngü oluştur:
            data.images.forEach(image => {
                const img = document.createElement('img'); // Yeni bir <img> HTML elementi oluştur.
                img.src = `../images/${image}`; // Resmin kaynağını (URL sini) gelen image bilgisiyle belirle.
                img.alt = 'Kitap Resmi'; // Resim açıklamasını "Kitap Resmi" olarak ayarla.
                slider.appendChild(img); // Yeni oluşturulan <img> öğesini slider içerisine ekle.
            });

            // Slider'ı güncelle
            updateSlider();
        }
    } catch (error) { // Eğer herhangi bir hata oluşursa hatanın detayını konsola yazdır
        console.error('Resimler yüklenirken bir hata oluştu:', error);
    }
});

function updateSlider() {
    const slider = document.querySelector('.slider');
    const images = document.querySelectorAll('.slider img');
    const totalSlides = images.length;
    let currentIndex = 0;

    function showSlide(index) {
        slider.style.transform = `translateX(${-index * 100}%)`;
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % totalSlides;
        showSlide(currentIndex);
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        showSlide(currentIndex);
    }

    document.querySelector('.prev').addEventListener('click', prevSlide);
    document.querySelector('.next').addEventListener('click', nextSlide);

    showSlide(currentIndex);
}