![Node.js](https://img.shields.io/badge/Node_JS-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express_JS-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

# 📚 Her Kitap

Kitapları, yazarları ve yayınevlerini tek bir çatı altında toplayan sade ve işlevsel bir okuma platformu.

Kullanıcılar **"Ne Okusam?"** özelliği ile yeni kitaplar keşfedebilir, detaylı arşivde gezinebilir ve üye olarak kendi kişisel **Kitaplık** alanlarını yönetebilirler.

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
- **Hakkımızda**, **İletişim** metinleri ve ana sayfa slayt görsellerinin panel üzerinden güncellenmesi

---

## 🛠️ Teknoloji yığını

| Alan | Teknolojiler |
| :--- | :--- |
| **Backend** | Node.js, Express |
| **Veritabanı** | PostgreSQL |
| **Güvenlik** | bcrypt, çerez tabanlı oturum |
| **Diğer** | Multer, dotenv, EJS |
| **Ön yüz** | Vanilla JavaScript, CSS3, Font Awesome |

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

## 📌 Lisans ve kullanım

Bu depo özel veya eğitim amaçlı kullanım için geliştirilebilir. Ticari kullanım için önceden izin alınması gerekir.

## 📬 İletişim ve katkı

Geri bildirim ve teknik konular için GitHub üzerinden issue açılabilir.

**E-posta:** alikacardev@gmail.com
