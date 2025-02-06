const addBookButton = document.querySelector('#add-book-button');
const deleteBookButton = document.querySelector('#delete-book-button');
const addAuthorButton = document.querySelector('#add-author-button');
const deleteAuthorButton = document.querySelector('#delete-author-button');

// Hakkımızda Güncelleme
function updateHakkimizda() {
 const hakkimizda = document.getElementById('hakkimizda').value.trim();
 if (hakkimizda) {
     fetch('/update-hakkimizda', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ hakkimizda })
     })
     .then(response => response.json())
     .then(result => {
         alert(result.message);
     })
     .catch(error => {
         console.error('Hakkımızda güncellenirken bir hata oluştu:', error);
     });
 } else {
     alert('Lütfen hakkımızda metni girin.');
 }
}

// İletişim Bilgilerini Güncelleme
function updateIletisim() {
    const email = document.getElementById('email').value.trim();
    const telefon = document.getElementById('telefon').value.trim();
    const instagram = document.getElementById('instagram').value.trim();
    const x = document.getElementById('x').value.trim();
    const facebook = document.getElementById('facebook').value.trim();

    if (email && telefon && instagram && x && facebook) {
        fetch('/update-iletisim', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, telefon, instagram, x, facebook })
        })
        .then(response => response.json())
        .then(result => {
            alert(result.message);
        })
        .catch(error => {
            console.error('İletişim bilgileri güncellenirken bir hata oluştu:', error);
        });
    } else {
        alert('Lütfen tüm iletişim bilgilerini girin.');
    }
}

// Yazarlar verisini tutacak bir dizi
let yazarlar = [];

// Yazar ekleme fonksiyonu
function addYazar() {
    const yazarAdi = document.getElementById('yazar-adi').value.trim();
    const dogumYili = document.getElementById('dogum-yili').value.trim();
    const yazarAciklama = document.getElementById('yazar-aciklama').value.trim();
    const yazarResmi = document.getElementById('yazar-resmi').files[0];

    if (yazarAdi && dogumYili && yazarAciklama && yazarResmi) {
        const formData = new FormData();
        formData.append('yazarAdi', yazarAdi);
        formData.append('dogumYili', dogumYili);
        formData.append('yazarAciklama', yazarAciklama);
        formData.append('yazarResmi', yazarResmi);

        fetch('/add-yazar', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(result => {
            alert(result.message);
            if (result.success) {
                clearYazarFields();
                fetchYazarlar();
            }
        })
        .catch(error => {
            console.error('Yazar eklenirken bir hata oluştu:', error);
        });
    } else {
        alert('Lütfen tüm alanları doldurun.');
    }
}

// Yazar ekleme formunu temizleme
function clearYazarFields() {
 document.getElementById('yazar-adi').value = '';
 document.getElementById('dogum-yili').value = '';
 document.getElementById('yazar-aciklama').value = '';
 document.getElementById('yazar-resmi').value = '';
}


// Kitaplar verisini tutacak bir dizi
let kitaplar = [];

// Kitap ekleme işlemi
function addKitap() {
    const formData = new FormData();
    formData.append('adi', document.getElementById('kitap-adi').value);
    formData.append('yazari', document.getElementById('kitap-yazari').value);
    formData.append('aciklama', document.getElementById('kitap-aciklama').value);
    formData.append('kategori', document.getElementById('kitap-kategori').value);
    const kitapResmi = document.getElementById('kitap-resmi').files[0];
    if (kitapResmi) {
        formData.append('kitapresmi', kitapResmi);
    }

    fetch('/add-kitap', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(result => {
        alert(result.message);
        if (result.success) {
            fetchKitaplar(); // Yeni kitap eklendiğinde listeyi güncelle
            clearKitapInputFields(); // Metin kutularını temizle
        }
    })
    .catch(error => {
        console.error('Kitap eklenirken bir hata oluştu:', error);
    });
}

// Baş harfine göre ilgili harf grubuna kitap ekleme
function addKitapToLetterSection(kitap) {
 const kitapHarf = kitap.adi.charAt(0).toUpperCase(); // Baş harfi al
 const harfGrubu = document.getElementById(kitapHarf); // Baş harfine göre harf grubunu al
 
 if (harfGrubu) {
    const listItem = document.createElement('li');
    listItem.innerHTML = `
       <img src="${kitap.gorsel}" alt="${kitap.adi}" style="width: 50px; height: 50px;">
       <strong>${kitap.adi}</strong><br>
       <em>Yazar: ${kitap.yazari}</em><br>
       <strong>Yayın Yılı:</strong> ${kitap.yayinYili}<br>
       <strong>Tür:</strong> ${kitap.turu}<br>
       <em>${kitap.aciklama}</em>
    `;
    harfGrubu.appendChild(listItem);
 }
}

// Admin panelindeki kitap alanlarını temizleme
function clearKitapInputFields() {
    document.getElementById('kitap-adi').value = '';
    document.getElementById('kitap-yazari').value = '';
    document.getElementById('kitap-aciklama').value = '';
    document.getElementById('kitap-kategori').value = '';
    document.getElementById('kitap-resmi').value = ''; // Dosya yükleme alanını temizle
}


    if (addBookButton) {
        addBookButton.addEventListener('click', async () => {
            const adi = document.getElementById('kitap-adi').value.trim();
            const yazari = document.getElementById('kitap-yazari').value.trim();
            const yayinYili = document.getElementById('kitap-yayin-yili').value.trim();
            const aciklama = document.getElementById('kitap-aciklama').value.trim();
            const turu = document.getElementById('kitap-turu').value;

            if (adi && yazari && yayinYili && aciklama && turu) {
                try {
                    const response = await fetch('/add-book', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ adi, yazari, yayinYili, aciklama, turu })
                    });
                    const result = await response.json();
                    alert(result.message);
                } catch (error) {
                    console.error('Kitap eklenirken bir hata oluştu:', error);
                }
            } else {
                alert('Lütfen tüm alanları doldurun.');
            }
        });
    }

    if (deleteBookButton) {
        deleteBookButton.addEventListener('click', async () => {
            const adi = document.getElementById('kitap-adi').value.trim();

            if (adi) {
                try {
                    const response = await fetch('/delete-book', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ adi })
                    });
                    const result = await response.json();
                    alert(result.message);
                } catch (error) {
                    console.error('Kitap silinirken bir hata oluştu:', error);
                }
            } else {
                alert('Lütfen silinecek kitabın adını girin.');
            }
        });
    }

    if (addAuthorButton) {
        addAuthorButton.addEventListener('click', async () => {
            const adi = document.getElementById('yazar-adi').value.trim();
            const dogumYili = document.getElementById('yazar-dogum-yili').value.trim();
            const biyografi = document.getElementById('yazar-biyografi').value.trim();

            if (adi && dogumYili && biyografi) {
                try {
                    const response = await fetch('/add-author', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ adi, dogumYili, biyografi })
                    });
                    const result = await response.json();
                    alert(result.message);
                } catch (error) {
                    console.error('Yazar eklenirken bir hata oluştu:', error);
                }
            } else {
                alert('Lütfen tüm alanları doldurun.');
            }
        });
    }

    if (deleteAuthorButton) {
        deleteAuthorButton.addEventListener('click', async () => {
            const adi = document.getElementById('yazar-adi').value.trim();

            if (adi) {
                try {
                    const response = await fetch('/delete-author', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ adi })
                    });
                    const result = await response.json();
                    alert(result.message);
                } catch (error) {
                    console.error('Yazar silinirken bir hata oluştu:', error);
                }
            } else {
                alert('Lütfen silinecek yazarın adını girin.');
            }
        });
    }

    function fetchYazarlar() {
        fetch('/get-yazarlar')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const yazarListe = document.getElementById('yazar-liste');
                    yazarListe.innerHTML = '';
                    data.yazarlar.forEach(yazar => {
                        const option = document.createElement('option');
                        option.value = yazar.yazarAdi;
                        option.textContent = yazar.yazarAdi;
                        yazarListe.appendChild(option);
                    });
                } else {
                    console.error(data.message);
                }
            })
            .catch(error => {
                console.error('Yazarlar alınırken bir hata oluştu:', error);
            });
    }

    document.addEventListener('DOMContentLoaded', () => {
        fetchYazarlar();

        fetch('/get-users')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const usersTable = document.getElementById('users-table');
                    data.users.forEach(user => {
                        const row = usersTable.insertRow();
                        row.innerHTML = `
                            <td>${user.user_name}</td>
                            <td>${user.e_mail}</td>
                            <td>
                                <input type="text" value="${user.yetki}" data-email="${user.e_mail}" class="user-role-input">
                            </td>
                            <td>
                                <button class="update-role-button" data-email="${user.e_mail}">Güncelle</button>
                                <button class="delete-user-button" data-email="${user.e_mail}">Sil</button>
                            </td>
                        `;
                    });

                    document.querySelectorAll('.update-role-button').forEach(button => {
                        button.addEventListener('click', () => {
                            const e_mail = button.getAttribute('data-email');
                            const yetkiInput = document.querySelector(`.user-role-input[data-email="${e_mail}"]`);
                            const yetki = yetkiInput.value.trim();

                            fetch('/update-user-role', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ e_mail, yetki })
                            })
                            .then(response => response.json())
                            .then(result => {
                                alert(result.message);
                            })
                            .catch(error => {
                                console.error('Kullanıcı yetkisi güncellenirken bir hata oluştu:', error);
                            });
                        });
                    });

                    document.querySelectorAll('.delete-user-button').forEach(button => {
                        button.addEventListener('click', () => {
                            const e_mail = button.getAttribute('data-email');

                            fetch('/delete-user', {
                                method: 'DELETE',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ e_mail })
                            })
                            .then(response => response.json())
                            .then(result => {
                                alert(result.message);
                                if (result.success) {
                                    button.closest('tr').remove();
                                }
                            })
                            .catch(error => {
                                console.error('Kullanıcı silinirken bir hata oluştu:', error);
                            });
                        });
                    });
                } else {
                    console.error(data.message);
                }
            })
            .catch(error => {
                console.error('Kullanıcılar alınırken bir hata oluştu:', error);
            });
    });

    function removeYazar() {
        const yazarListe = document.getElementById('yazar-liste');
        const selectedYazar = yazarListe.value;

        if (selectedYazar) {
            fetch('/remove-yazar', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ yazarAdi: selectedYazar })
            })
            .then(response => response.json())
            .then(result => {
                alert(result.message);
                if (result.success) {
                    const optionToRemove = yazarListe.querySelector(`option[value="${selectedYazar}"]`);
                    if (optionToRemove) {
                        optionToRemove.remove();
                    }
                }
            })
            .catch(error => {
                console.error('Yazar silinirken bir hata oluştu:', error);
            });
        } else {
            alert('Lütfen silinecek bir yazar seçin.');
        }
    }

    function fetchKitapResimleri() {
        fetch('/get-kitapresimleri')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const kitapResimleriContainer = document.getElementById('kitap-resimleri-container');
                    kitapResimleriContainer.innerHTML = ''; // Mevcut içerikleri temizle

                    for (const [key, value] of Object.entries(data.kitapresimleri)) {
                        const div = document.createElement('div');
                        div.classList.add('kitap-resim-container');
                        div.innerHTML = `
                            <img src="../images/${value}" alt="${key}" class="kitap-resim">
                            <input type="file" data-key="${key}" class="kitap-resim-input">
                            <button class="update-kitap-button" data-key="${key}" style="width: 100px;">Güncelle</button>
                        `;
                        kitapResimleriContainer.appendChild(div);
                    }

                    document.querySelectorAll('.update-kitap-button').forEach(button => {
                        button.addEventListener('click', () => {
                            const key = button.getAttribute('data-key');
                            const input = document.querySelector(`.kitap-resim-input[data-key="${key}"]`);
                            const file = input.files[0];

                            if (file) {
                                updateKitapResmi(key, file);
                            } else {
                                alert('Lütfen bir resim seçin.');
                            }
                        });
                    });
                } else {
                    console.error(data.message);
                }
            })
            .catch(error => {
                console.error('Kitap resimleri alınırken bir hata oluştu:', error);
            });
    }

    function updateKitapResmi(key, file) {
        const formData = new FormData();
        formData.append('key', key);
        formData.append('kitapResmi', file);

        fetch('/update-kitapresim', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(result => {
            alert(result.message);
            if (result.success) {
                fetchKitapResimleri(); // Güncellenen resimleri yeniden yükle
            }
        })
        .catch(error => {
            console.error('Kitap resmi güncellenirken bir hata oluştu:', error);
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        fetchKitapResimleri();
    });

    function fetchYayinevleri() {
        fetch('/get-yayinevleri')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const yayineviContainer = document.getElementById('yayinevi-container');
                    yayineviContainer.innerHTML = ''; // Mevcut içerikleri temizle

                    data.yayinevleri.forEach(yayinevi => {
                        const div = document.createElement('div');
                        div.classList.add('yayinevi-card');
                        div.innerHTML = `
                            <h3>${yayinevi.yayineviadi}</h3>
                            <p>Kurucu: ${yayinevi.kurucu}</p>
                            <p>Ülke: ${yayinevi.ulke}</p>
                            <button class="edit-yayinevi-button" data-id="${yayinevi._id}">Düzenle</button>
                            <button class="delete-yayinevi-button" data-id="${yayinevi._id}">Sil</button>
                        `;
                        yayineviContainer.appendChild(div);
                    });

                    document.querySelectorAll('.edit-yayinevi-button').forEach(button => {
                        button.addEventListener('click', () => {
                            const id = button.getAttribute('data-id');
                            editYayinevi(id);
                        });
                    });

                    document.querySelectorAll('.delete-yayinevi-button').forEach(button => {
                        button.addEventListener('click', () => {
                            const id = button.getAttribute('data-id');
                            deleteYayinevi(id);
                        });
                    });
                } else {
                    console.error(data.message);
                }
            })
            .catch(error => {
                console.error('Yayınevleri yüklenirken bir hata oluştu:', error);
            });
    }

    function clearInputFields() {
        document.getElementById('yayineviadi').value = '';
        document.getElementById('anasirket').value = '';
        document.getElementById('durum').value = '';
        document.getElementById('kurulus').value = '';
        document.getElementById('kurucu').value = '';
        document.getElementById('ulke').value = '';
        document.getElementById('merkez').value = '';
        document.getElementById('yayinturleri').value = '';
        document.getElementById('yayinkonulari').value = '';
        document.getElementById('resmisite').value = '';
        document.getElementById('yayineviresmi').value = '';
    }

    function addYayinevi() {
        const formData = new FormData();
        formData.append('yayineviadi', document.getElementById('yayineviadi').value);
        formData.append('anasirket', document.getElementById('anasirket').value);
        formData.append('durum', document.getElementById('durum').value);
        formData.append('kurulus', document.getElementById('kurulus').value);
        formData.append('kurucu', document.getElementById('kurucu').value);
        formData.append('ulke', document.getElementById('ulke').value);
        formData.append('merkez', document.getElementById('merkez').value);
        formData.append('yayinturleri', document.getElementById('yayinturleri').value);
        formData.append('yayinkonulari', document.getElementById('yayinkonulari').value);
        formData.append('resmisite', document.getElementById('resmisite').value);
        const yayineviResmi = document.getElementById('yayineviresmi').files[0];
        if (yayineviResmi) {
            formData.append('yayineviresmi', yayineviResmi);
        }

        fetch('/add-yayinevi', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(result => {
            alert(result.message);
            if (result.success) {
                fetchYayinevleri(); // Yeni yayınevi eklendiğinde listeyi güncelle
                clearInputFields(); // Metin kutularını temizle
            }
        })
        .catch(error => {
            console.error('Yayınevi eklenirken bir hata oluştu:', error);
        });
    }

    function editYayinevi(id) {
        fetch(`/get-yayinevleri`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const yayinevi = data.yayinevleri.find(y => y._id === id);
                    if (yayinevi) {
                        document.getElementById('yayineviadi').value = yayinevi.yayineviadi;
                        document.getElementById('anasirket').value = yayinevi.anasirket;
                        document.getElementById('durum').value = yayinevi.durum;
                        document.getElementById('kurulus').value = yayinevi.kurulus;
                        document.getElementById('kurucu').value = yayinevi.kurucu;
                        document.getElementById('ulke').value = yayinevi.ulke;
                        document.getElementById('merkez').value = yayinevi.merkez;
                        document.getElementById('yayinturleri').value = yayinevi.yayinturleri;
                        document.getElementById('yayinkonulari').value = yayinevi.yayinkonulari;
                        document.getElementById('resmisite').value = yayinevi.resmisite;
                        document.getElementById('yayineviresmi').value = '';

                        document.getElementById('update-button').onclick = function() {
                            updateYayinevi(id);
                        };
                    }
                }
            })
            .catch(error => {
                console.error('Yayınevi bilgileri alınırken bir hata oluştu:', error);
            });
    }

    function updateYayinevi(id) {
        const formData = new FormData();
        formData.append('yayineviadi', document.getElementById('yayineviadi').value);
        formData.append('anasirket', document.getElementById('anasirket').value);
        formData.append('durum', document.getElementById('durum').value);
        formData.append('kurulus', document.getElementById('kurulus').value);
        formData.append('kurucu', document.getElementById('kurucu').value);
        formData.append('ulke', document.getElementById('ulke').value);
        formData.append('merkez', document.getElementById('merkez').value);
        formData.append('yayinturleri', document.getElementById('yayinturleri').value);
        formData.append('yayinkonulari', document.getElementById('yayinkonulari').value);
        formData.append('resmisite', document.getElementById('resmisite').value);
        const yayineviResmi = document.getElementById('yayineviresmi').files[0];
        if (yayineviResmi) {
            formData.append('yayineviresmi', yayineviResmi);
        }

        fetch(`/update-yayinevi/${id}`, {
            method: 'PUT',
            body: formData
        })
        .then(response => response.json())
        .then(result => {
            alert(result.message);
            if (result.success) {
                fetchYayinevleri(); // Yayınevi güncellendiğinde listeyi güncelle
                clearInputFields(); // Metin kutularını temizle
            }
        })
        .catch(error => {
            console.error('Yayınevi güncellenirken bir hata oluştu:', error);
        });
    }

    function deleteYayinevi(id) {
        fetch(`/delete-yayinevi/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(result => {
            alert(result.message);
            if (result.success) {
                fetchYayinevleri(); // Yayınevi silindiğinde listeyi güncelle
            }
        })
        .catch(error => {
            console.error('Yayınevi silinirken bir hata oluştu:', error);
        });
    }

    function fetchKitaplar() {
        fetch('/get-kitaplar')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const kitapContainer = document.getElementById('kitap-container');
                    kitapContainer.innerHTML = ''; // Mevcut içerikleri temizle

                    data.kitaplar.forEach(kitap => {
                        const div = document.createElement('div');
                        div.classList.add('kitap-card');
                        div.innerHTML = `
                            <h3>${kitap.adi}</h3>
                            <img src="../images/${kitap.kitapresmi}" alt="${kitap.adi}" style="width: 200px; height: 200px;">
                            <p>Yazar: ${kitap.yazari}</p>
                            <p>Kategori: ${kitap.kategori}</p>
                            <p>Açıklama: ${kitap.aciklama}</p>
                            <button class="delete-kitap-button" data-id="${kitap._id}" style="width: 200px; margin-bottom:10px">Sil</button>
                        `;
                        kitapContainer.appendChild(div);
                    });

                    document.querySelectorAll('.delete-kitap-button').forEach(button => {
                        button.addEventListener('click', () => {
                            const id = button.getAttribute('data-id');
                            deleteKitap(id);
                        });
                    });
                } else {
                    console.error(data.message);
                }
            })
            .catch(error => {
                console.error('Kitaplar yüklenirken bir hata oluştu:', error);
            });
    }

    function deleteKitap(id) {
        fetch(`/delete-kitap/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(result => {
            alert(result.message);
            if (result.success) {
                fetchKitaplar(); // Kitap silindiğinde listeyi güncelle
            }
        })
        .catch(error => {
            console.error('Kitap silinirken bir hata oluştu:', error);
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        fetchYayinevleri();
        fetchKitaplar();
    });

    

    
