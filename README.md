![Node.js](https://img.shields.io/badge/Node_JS-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express_JS-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

# 📚 Her Kitap 

Kitapları, yazarları ve yayınevlerini tek bir çatı altında toplayan sade ve işlevsel bir okuma platformu.

Kullanıcılar **"Ne Okusam?"** özelliği ile yeni kitaplar keşfedebilir, detaylı arşivde gezinebilir ve üye olarak kendi kişisel **Kitaplık** alanlarını yönetebilirler.

## 📸 Ekran Görüntüleri

<details>
<summary><b>Uygulama Görsellerini İncelemek İçin Tıklayın</b></summary>
<br>

| Ana Sayfa | Akış | Keşfet |
| :---: | :---: | :---: |
| <img src="Her%20Kitap%20görüntüler/1.png" width="250"> | <img src="Her%20Kitap%20görüntüler/2.png" width="250"> | <img src="Her%20Kitap%20görüntüler/3.png" width="250"> |
| **Ne Okusam** | **Yazarlar** | **Yayın Evleri** |
| <img src="Her%20Kitap%20görüntüler/4.png" width="250"> | <img src="Her%20Kitap%20görüntüler/5.png" width="250"> | <img src="Her%20Kitap%20görüntüler/6.png" width="250"> |
| **Kitaplık** | **Hakkımızda** | **İletişim** |
| <img src="Her%20Kitap%20görüntüler/7.png" width="250"> | <img src="Her%20Kitap%20görüntüler/8.png" width="250"> | <img src="Her%20Kitap%20görüntüler/9.png" width="250"> |
| **Giriş Yap** | **Kaydol** | **İletişim - Hakkımızda Düzenleme** |
| <img src="Her%20Kitap%20görüntüler/login-10.png" width="250"> | <img src="Her%20Kitap%20görüntüler/register-11.png" width="250"> | <img src="Her%20Kitap%20görüntüler/admin-1.png" width="250"> |
| **Yazar Yönetimi** | **Kitap Yönetimi** | **Yayın Evi Yönetimi** |
| <img src="Her%20Kitap%20görüntüler/admin-2.png" width="250"> | <img src="Her%20Kitap%20görüntüler/admin-3.png" width="250"> | <img src="Her%20Kitap%20görüntüler/admin-4.png" width="250"> |

</details>

## Ne sunuyor?

**Keşif ve içerik**

- **Ana sayfa:** kitap slaytı, haftanın sözü ve konu başlıkları
- **Akış** — öne çıkan kitaplar ve yorum alanı
- **Keşfet** — popüler kitaplar; yazar ve yayınevi vitrinleri
- **Ne okusam** — kategori veya tüm arşive göre rastgele öneri
- **Yazarlar** ve **yayınevleri:** biyografi, görseller, kurumsal bilgiler ve listeler

**Üyelik ve kitaplık**

- E-posta ile hızlı kayıt ve güvenli giriş
- Kitaplığına yeni kitap ekle, favorilerini yönet

**Yönetim (admin)**

- Kitap, yazar ve yayınevi için ekleme, güncelleme ve silme
- Kullanıcı rolleri ve hesap yönetimi
- Hakkımızda ve iletişim metinlerinini güncelleme 
- Ana sayfa görsel ögelerinin güncellenmesi

---

## 🛠️ Teknoloji yığını

| Alan | Teknolojiler |
| :--- | :--- |
| **Backend** | Node.js, Express |
| **Veritabanı** | PostgreSQL |
| **Güvenlik** | bcrypt, cookies |
| **Diğer** | Multer, dotenv, EJS |
| **Ön yüz** | Vanilla JavaScript, CSS3, Font Awesome |

### 🗄️ Veritabanı Şeması

<div align="center">
  <img src="Her%20Kitap%20görüntüler/tables.png" alt="Veritabanı Tabloları" width="500">
</div>

---

## 🚀 Kurulum

**1. Depoyu klonlayın**

```bash
git clone [repo-url]
cd Her-Kitap
```

**2. Bağımlılıkları yükleyin**

```bash
npm install
```

**3. Ortam değişkenlerini ayarlayın**

Proje kökünde `.env` oluşturun (örnek: `.env.example`):

```env
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=
PGDATABASE=herkitap
```

**4. Veritabanını oluşturun ve migration çalıştırın**

PostgreSQL’de boş bir veritabanı oluşturun (ör. `createdb herkitap` veya arayüzden `herkitap` adıyla). `.env` içindeki `PGDATABASE` bu veritabanına işaret etmeli.

```bash
npm run migrate
```

Bu komut `migrations/` altındaki `NNN_*.sql` dosyalarını sırayla uygular; işlenen sürümler `schema_migrations` tablosunda tutulur, tekrar çalıştırılmaz.

**5. Uygulamayı başlatın**

```bash
npm start
```

Varsayılan adres: **http://localhost:3000** (`node js/server.js` ile de başlatılabilir)

---

## 📬 İletişim ve katkı

Geri bildirim ve teknik konular için GitHub üzerinden issue açılabilir.

**E-posta:** alikacardev@gmail.com
