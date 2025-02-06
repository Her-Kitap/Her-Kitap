document.addEventListener('DOMContentLoaded', () => { //Sayfa yüklendiğinde gerçekleşecek olaylar
    const emailInput = document.getElementById('email'); // Html de tanımladığımız email id'li ögeyi seç.
    const passwordInput = document.getElementById('password'); // Html de tanımladığımız password id'li ögeyi seç.
    const loginButton = document.querySelector('.login-button'); // Html de tanımladığımız login-button sınıfını seç.

    // Enter tuşu ile alanlar arasında geçiş
    [emailInput, passwordInput].forEach((input, index, inputs) => {
        input.addEventListener('keydown', (event) => { // Enter tuşuna basıldığında çalışır.
            if (event.key === 'Enter') {
                event.preventDefault(); // Varsayılan davranışı (form gönderme) engelle.
                if (index < inputs.length - 1) { //Son alana gelene kadar
                    inputs[index + 1].focus(); //Bir sonraki alana odaklan
                } else {
                    loginButton.click(); // Son alanda Enter ile (login-button tıklama olayı gerçekleşir) giriş yap
                }
            }
        });
    });

    loginButton.addEventListener('click', async (e) => {
        e.preventDefault(); // Varsayılan form gönderme işlemini engelle.

        const email = emailInput.value.trim(); // emailInput değeri al, boşlukları temizle ve email adlı bir değişkene ata.
        const password = passwordInput.value.trim(); // passwordInput değeri al, boşlukları temizle ve password adlı bir değişkene ata.

        // Form doğrulama
        if (!email || !password) {  // Eğer email veya şifre boş ise:
            alert('Lütfen tüm alanları doldurun.'); // Kullanıcıya sayfada uyarı göster.
            return; // İşlemi sonlandır.
        }
        try {
            const response = await fetch('/login', { // Giriş bilgilerini sunucuya gönder
                method: 'POST',  // HTTP POST yöntemi kullanılır.
                headers: { 'Content-Type': 'application/json' }, // Gönderilen verinin JSON formatında olduğunu belirt.
                body: JSON.stringify({ e_mail: email, password })  // Email ve şifreyi JSON formatında gönder.
            });
            const result = await response.json(); // Sunucudan dönen yanıtı JSON formatında al.

            if (result.success) { // Eğer giriş başarılıysa:
                window.location.href = result.redirectUrl; // Kullanıcıyı belirtilen sayfaya yönlendir.
            } else {
                alert(result.message);  // Giriş başarısızsa sunucudan gelen mesajı göster.
            }
        } catch (error) {
            console.error('Giriş sırasında bir hata oluştu:', error); // Hata oluştuğunda konsola hata mesajı yazdır.
        }
    });
});
