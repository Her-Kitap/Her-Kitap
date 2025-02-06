document.addEventListener('DOMContentLoaded', () => { //Sayfa yüklendiğinde gerçekleşecek olaylar
    const newUsername = document.getElementById('newUsername'); // Html de tanımladığımız newUsername id'li ögeyi seç.
    const newEmail = document.getElementById('newEmail'); // Html de tanımladığımız newEmail id'li ögeyi seç.
    const newPassword = document.getElementById('newPassword'); // Html de tanımladığımız newPasswor id'li ögeyi seç.
    const submitButton = document.querySelector('.submit-button'); // Html de tanımladığımız submit-button sınıfını seç.

    // Enter tuşu ile alanlar arasında geçiş
    [newUsername, newEmail, newPassword].forEach((input, index, inputs) => {
        input.addEventListener('keydown', (event) => { // Enter tuşuna basıldığında çalışır.
            if (event.key === 'Enter') {
                event.preventDefault(); // Varsayılan davranışı (form gönderme) engelle.
                if (index < inputs.length - 1) { //Son alana gelene kadar
                    inputs[index + 1].focus(); //Bir sonraki alana odaklan
                } else {
                    submitButton.click(); // Son alanda Enter ile (submit-button tıklama olayı gerçekleşir) kayıt ol
                }
            }
        });
    });

    submitButton.addEventListener('click', async (e) => {
        e.preventDefault(); // Varsayılan form gönderme işlemini engelle.

        const username = newUsername.value.trim(); // newUsername değeri al, boşlukları temizle ve username adlı bir değişkene ata.
        const email = newEmail.value.trim(); // newEmail değeri al, boşlukları temizle ve email adlı bir değişkene ata.
        const password = newPassword.value.trim(); // newPassword değeri al, boşlukları temizle ve password adlı bir değişkene ata.
        
        // Form doğrulama
        if (username.length < 5) { // Kullanıcı adı 5 karakterden kısa ise:
            alert('Kullanıcı adı en az 5 karakter uzunluğunda olmalıdır.'); // Kullanıcıya sayfada uyarı göster.
            return;
        }

        if (!email.endsWith('@gmail.com') && !email.endsWith('@hotmail.com')) { // E-posta yalnızca belirli alan adları ile bitmediyse:
            alert('E-posta yalnızca "@gmail.com" veya "@hotmail.com" ile bitmelidir.');
            return;
        }

        if (password.length < 5) {
            alert('Şifre en az 5 karakter uzunluğunda olmalıdır.');
            return;
        }

        if (username === password) {
            alert('Kullanıcı adı ve şifre aynı olamaz.');
            return;
        }

        if (!username || !email || !password) {  // Herhangi bir alan boş bırakılmışsa:
            alert('Lütfen tüm alanları doldurun.');
            return;
        }

        try { // Kayıt bilgilerini sunucuya gönder
            const response = await fetch('/register', {
                method: 'POST', // HTTP POST yöntemi kullanılır.
                headers: { 'Content-Type': 'application/json' }, // Gönderilen verinin JSON formatında olduğunu belirt.
                body: JSON.stringify({ user_name: username, e_mail: email, password }) // Kullanıcı adı, e-posta ve şifreyi JSON formatında gönder.
            });
            const result = await response.json(); // Sunucudan dönen yanıtı JSON formatında al.

            if (result.success) { // Eğer kayıt başarılıysa:
                window.location.href = 'kitaplikx.html'; // Kullanıcıyı belirtilen sayfaya yönlendir.
            } else {
                alert(result.message); // Kayıt başarısızsa sunucudan gelen mesajı sayfada göster.
            }
        } catch (error) { // Hata oluştuğunda konsola hata mesajı yazdır.
            console.error('Kayıt sırasında bir hata oluştu:', error);
        }
    });
});