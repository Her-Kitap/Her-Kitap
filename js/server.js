const express = require('express'); // Express framework'ünü kullanmak için yükler.
const bcrypt = require('bcrypt'); // Şifreleri hashlemek ve doğrulamak için bcrypt kütüphanesi.
const { MongoClient } = require('mongodb'); // MongoDB bağlantısı için MongoDB istemcisi
const path = require('path'); // Dosya ve dizin yollarını işlemek için Node.js path modülü.
const multer = require('multer');
const fs = require('fs');
const { ObjectId } = require('mongodb');

const app = express(); // Express uygulaması oluştur.
const mongoUri = 'mongodb://localhost:27017/herKitap'; // MongoDB bağlantı URI'si.

// MongoDB bağlantısı
const client = new MongoClient(mongoUri); // MongoDB istemcisi oluştur.
let db;
client.connect().then(() => { 
    db = client.db('herKitap'); // MongoDB'ye bağlan ve veritabanını herKitap olarak ayarla.
});

// Middleware
app.use(express.json()); // JSON formatındaki veri gövdesini çözümle.
app.use(express.urlencoded({ extended: true })); // Form verilerini çözümle.
app.use('/css', express.static(path.join(__dirname, '../css'))); // CSS dosyalarını statik olarak sun.
app.use('/js', express.static(path.join(__dirname, '../js'))); // JS dosyalarını statik olarak sun.
app.use('/images', express.static(path.join(__dirname, '../images'))); // Resim dosyalarını statik olarak sun.
app.use(express.static(path.join(__dirname, '../html'))); // HTML dosyalarını statik olarak sun.


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const imagesDir = path.join(__dirname, '../images');
        if (!fs.existsSync(imagesDir)) {
            try {
                fs.mkdirSync(imagesDir, { recursive: true });
                console.log(`'images' klasörü oluşturuldu: ${imagesDir}`);
            } catch (err) {
                console.error(`'images' klasörü oluşturulurken hata: ${err.message}`);
                return cb(err);
            }
        }
        cb(null, imagesDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        const newFileName = file.fieldname + '-' + uniqueSuffix + extension;
        console.log(`Dosya adı oluşturuldu: ${newFileName}`);
        cb(null, newFileName);
    }
});

const upload = multer({ storage: storage });

// Ana sayfa yönlendirmesi
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../html/index.html')); // Ana sayfa olarak html klasöründeki index.js yi aç.
});

// Kayıt işlemi
app.post('/register', async (req, res) => {
    const { user_name, e_mail, password } = req.body; // İstemciden gelen kullanıcı adı, email ve şifre verilerini al.
    const usersCollection = db.collection('user'); // Veritabanındaki "user" koleksiyonuna eriş.

    try {
        const existingUser = await usersCollection.findOne({ e_mail });  // Bu e-posta ile bir kullanıcı kaydı olup olmadığını kontrol et.
        if (existingUser) { //Eğer kullanıcı kayıtlıysa false ve mesaj geri dönder.
            return res.json({ success: false, message: 'Bu e-posta ile zaten bir hesap oluşturulmuş.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10); // Şifreyi hashle.
        await usersCollection.insertOne({ 
            user_name, 
            e_mail, 
            password: hashedPassword,
            yetki: "user" // Yeni kullanıcıya "user" yetkisi ekle.
        }); // Yeni kullanıcıyı user koleksiyonuna ekle.
        res.json({ success: true }); // Başarılı mesajını döndür.

    } catch (error) {
        console.error('Kayıt sırasında bir hata oluştu:', error); // Hata durumunda konsola yazdır.
        res.json({ success: false, message: 'Kayıt sırasında bir hata oluştu.' }); // İstemciye hata mesajını döndür.
    }
});

// Giriş işlemi
app.post('/login', async (req, res) => {
    const { e_mail, password } = req.body; // İstemciden gelen email ve şifre verilerini al.
    const usersCollection = db.collection('user'); // Veritabanındaki "user" koleksiyonuna eriş.

    try {
        const user = await usersCollection.findOne({ e_mail }); // Bu eposta ile bir kayıt olup olmadığını kontrol et.
        if (!user) { //Hiç bir kayıt bulunamazsa false ve mesaj dönder.
            console.log(e_mail);
            return res.json({ success: false, message: 'Kullanıcı bulunamadı.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password); // Gelen şifre ile veritabananındaki şifreyi karşılaştır.
        if (!isPasswordValid) { // Şifre yanlışsa hata mesajı döndür.
            return res.json({ success: false, message: 'Şifre yanlış.' });
        }

        // Kullanıcının yetkisine göre yönlendirme yap
        if (user.yetki === 'admin') {
            res.json({ success: true, redirectUrl: 'admin.html' }); // Admin yetkisi varsa admin.html sayfasına yönlendir.
        } else {
            res.json({ success: true, redirectUrl: 'kitaplikx.html' }); // User yetkisi varsa kitaplikx.html sayfasına yönlendir.
        }

    } catch (error) {
        console.error('Giriş sırasında bir hata oluştu:', error); // Hata durumunda konsola yazdır.
        res.json({ success: false, message: 'Giriş sırasında bir hata oluştu.' }); // İstemciye hata mesajını döndür.
    }
});

app.get('/random-images', async (req, res) => {
    try {
        const kitaplikCollection = db.collection('slidekitaplar');
        const randomDoc = await kitaplikCollection.aggregate([{ $sample: { size: 1 } }]).toArray();
        
        if (randomDoc.length > 0) {
            const kitapresimleri = randomDoc[0].kitapresimleri;
            const imageKeys = Object.keys(kitapresimleri);
            const randomImages = [];

            while (randomImages.length < 5 && imageKeys.length > 0) {
                const randomIndex = Math.floor(Math.random() * imageKeys.length);
                const selectedKey = imageKeys.splice(randomIndex, 1)[0];
                randomImages.push(kitapresimleri[selectedKey]);
            }

            res.json({ images: randomImages });
        } else {
            res.json({ images: [] });
        }
    } catch (error) {
        console.error('Rastgele resimler alınırken hata oluştu:', error);
        res.status(500).json({ error: 'Bir hata oluştu.' });
    }
});

app.get('/random-kitaplar', async (req, res) => {
    try {
        const kitaplar = await db.collection('kitaplar').aggregate([{ $sample: { size: 6 } }]).toArray();
        res.json({ success: true, kitaplar });
    } catch (error) {
        console.error('Kitapları çekerken hata oluştu:', error);
        res.status(500).json({ success: false, message: 'Kitaplar getirilemedi' });
    }
});


// Kitap ekleme
app.post('/add-book', async (req, res) => {
    const { adi, yazari, yayinYili, aciklama, turu } = req.body;
    const kitaplarCollection = db.collection('kitaplar');
    console.log('Kitap eklendi');

    try {
        await kitaplarCollection.insertOne({ adi, yazari, yayinYili, aciklama, turu });
        res.json({ success: true, message: 'Kitap başarıyla eklendi.' });
    } catch (error) {
        console.error('Kitap eklenirken bir hata oluştu:', error);
        res.json({ success: false, message: 'Kitap eklenirken bir hata oluştu.' });
    }
});

// Kitap silme
app.delete('/delete-book', async (req, res) => {
    const { adi } = req.body;
    const kitaplarCollection = db.collection('kitaplar');

    try {
        await kitaplarCollection.deleteOne({ adi });
        res.json({ success: true, message: 'Kitap başarıyla silindi.' });
    } catch (error) {
        console.error('Kitap silinirken bir hata oluştu:', error);
        res.json({ success: false, message: 'Kitap silinirken bir hata oluştu.' });
    }
});

// Kitapları getirme
app.get('/get-books', async (req, res) => {
    const kitaplarCollection = db.collection('kitaplar');

    try {
        const kitaplar = await kitaplarCollection.find().toArray();
        res.json({ success: true, kitaplar });
    } catch (error) {
        console.error('Kitaplar alınırken bir hata oluştu:', error);
        res.json({ success: false, message: 'Kitaplar alınırken bir hata oluştu.' });
    }
});
app.get('/kitaplari-getir', async (req, res) => {
    try {
        const kategori = req.query.kategori; // İstekten kategori bilgisini al
        let filter = {};

        if (kategori && kategori !== 'hepsi') {
            filter = { kategori: kategori }; // Eğer 'hepsi' değilse kategoriye göre filtrele
        }

        const kitaplar = await db.collection('kitaplar').find(filter).limit(6).toArray();
        res.json({ success: true, kitaplar });
    } catch (error) {
        console.error('Kitapları çekerken hata oluştu:', error);
        res.status(500).json({ success: false, message: 'Kitaplar getirilemedi' });
    }
});

app.get('/rastgele-kitap', async (req, res) => {
    try {
        const kategori = req.query.kategori; // İstekten kategori bilgisini al
        let filter = {};

        if (kategori && kategori !== 'hepsi') {
            filter = { kategori: kategori }; // Eğer 'hepsi' değilse kategoriye göre filtrele
        }

        const kitaplar = await db.collection('kitaplar').aggregate([
            { $match: filter }, // Filtre uygula
            { $sample: { size: 6 } } // En fazla 6 tane rastgele kitap seç
        ]).toArray();

        if (kitaplar.length > 0) {
            res.json({ success: true, kitaplar });
        } else {
            res.json({ success: false, message: 'Bu kategoride uygun kitap bulunamadı' });
        }
    } catch (error) {
        console.error('Rastgele kitaplar getirilirken hata oluştu:', error);
        res.status(500).json({ success: false, message: 'Kitaplar getirilemedi' });
    }
});


// Hakkımızda güncelleme
app.post('/update-hakkimizda', async (req, res) => {
    const { hakkimizda } = req.body; // İstemciden gelen hakkımızda metnini al.
    const hakkimizdaCollection = db.collection('hakkımızda'); // Veritabanındaki "hakkımızda" koleksiyonuna eriş.

    try {
        // İlk dokümanı güncelle veya ekle
        await hakkimizdaCollection.updateOne(
            {}, // Tüm dokümanları hedefle
            { $set: { metin: hakkimizda } }, // Metni güncelle
            { upsert: true } // Eğer doküman yoksa ekle
        );
        res.json({ success: true, message: 'Hakkımızda bilgisi başarıyla güncellendi.' });
    } catch (error) {
        console.error('Hakkımızda güncellenirken bir hata oluştu:', error);
        res.json({ success: false, message: 'Hakkımızda güncellenirken bir hata oluştu.' });
    }
});

// Hakkımızda bilgisi alma
app.get('/get-hakkimizda', async (req, res) => {
    const hakkimizdaCollection = db.collection('hakkımızda'); // Veritabanındaki "hakkımızda" koleksiyonuna eriş.

    try {
        const document = await hakkimizdaCollection.findOne({}); // İlk dokümanı al.
        if (document) {
            res.json({ success: true, metin: document.metin }); // Metni JSON formatında döndür.
        } else {
            res.json({ success: false, message: 'Hakkımızda bilgisi bulunamadı.' });
        }
    } catch (error) {
        console.error('Hakkımızda bilgisi alınırken bir hata oluştu:', error);
        res.json({ success: false, message: 'Hakkımızda bilgisi alınırken bir hata oluştu.' });
    }
});

// İletişim bilgilerini güncelleme
app.post('/update-iletisim', async (req, res) => {
    const { email, telefon, instagram, x, facebook } = req.body; // İstemciden gelen iletişim bilgilerini al.
    const iletisimCollection = db.collection('iletisim'); // Veritabanındaki "iletisim" koleksiyonuna eriş.

    try {
        // İlk dokümanı güncelle veya ekle
        await iletisimCollection.updateOne(
            {}, // Tüm dokümanları hedefle
            { $set: { email, telefon, instagram, x, facebook } }, // İletişim bilgilerini güncelle
            { upsert: true } // Eğer doküman yoksa ekle
        );
        res.json({ success: true, message: 'İletişim bilgileri başarıyla güncellendi.' });
    } catch (error) {
        console.error('İletişim bilgileri güncellenirken bir hata oluştu:', error);
        res.json({ success: false, message: 'İletişim bilgileri güncellenirken bir hata oluştu.' });
    }
});

// İletişim bilgilerini alma
app.get('/get-iletisim', async (req, res) => {
    const iletisimCollection = db.collection('iletisim'); // Veritabanındaki "iletisim" koleksiyonuna eriş.

    try {
        const document = await iletisimCollection.findOne({}); // İlk dokümanı al.
        if (document) {
            res.json({ success: true, iletisim: document }); // İletişim bilgilerini JSON formatında döndür.
        } else {
            res.json({ success: false, message: 'İletişim bilgileri bulunamadı.' });
        }
    } catch (error) {
        console.error('İletişim bilgileri alınırken bir hata oluştu:', error);
        res.json({ success: false, message: 'İletişim bilgileri alınırken bir hata oluştu.' });
    }
});

// Kullanıcıları getirme
app.get('/get-users', async (req, res) => {
    const usersCollection = db.collection('user'); // Veritabanındaki "user" koleksiyonuna eriş.

    try {
        const users = await usersCollection.find().toArray(); // Tüm kullanıcıları al.
        res.json({ success: true, users });
    } catch (error) {
        console.error('Kullanıcılar alınırken bir hata oluştu:', error);
        res.json({ success: false, message: 'Kullanıcılar alınırken bir hata oluştu.' });
    }
});

// Kullanıcı yetkisi güncelleme
app.post('/update-user-role', async (req, res) => {
    const { e_mail, yetki } = req.body; // İstemciden gelen e-posta ve yetki bilgilerini al.
    const usersCollection = db.collection('user'); // Veritabanındaki "user" koleksiyonuna eriş.

    try {
        await usersCollection.updateOne({ e_mail }, { $set: { yetki } }); // Kullanıcının yetkisini güncelle.
        res.json({ success: true, message: 'Kullanıcı yetkisi başarıyla güncellendi.' });
    } catch (error) {
        console.error('Kullanıcı yetkisi güncellenirken bir hata oluştu:', error);
        res.json({ success: false, message: 'Kullanıcı yetkisi güncellenirken bir hata oluştu.' });
    }
});

// Kullanıcı silme
app.delete('/delete-user', async (req, res) => {
    const { e_mail } = req.body; // İstemciden gelen e-posta bilgisini al.
    const usersCollection = db.collection('user'); // Veritabanındaki "user" koleksiyonuna eriş.

    try {
        await usersCollection.deleteOne({ e_mail }); // Kullanıcıyı sil.
        res.json({ success: true, message: 'Kullanıcı başarıyla silindi.' });
    } catch (error) {
        console.error('Kullanıcı silinirken bir hata oluştu:', error);
        res.json({ success: false, message: 'Kullanıcı silinirken bir hata oluştu.' });
    }
});

app.post('/add-yazar', upload.single('yazarResmi'), async (req, res) => {
    const { yazarAdi, dogumYili, yazarAciklama } = req.body;
    const yazarResmi = req.file;

    if (!yazarResmi) {
        console.error('Yazar resmi yüklenemedi.');
        return res.json({ success: false, message: 'Yazar resmi yüklenemedi.' });
    }

    console.log(`Yazar resmi başarıyla yüklendi: ${yazarResmi.filename}`);

    const yazarCollection = db.collection('yazar');
    try {
        await yazarCollection.updateOne(
            { yazarAdi },
            { $set: { yazarAdi, dogumYili, yazarAciklama, yazarResmi: yazarResmi.filename } },
            { upsert: true }
        );
        console.log('Yazar bilgileri veritabanına kaydedildi.');
        res.json({ success: true, message: 'Yazar başarıyla eklendi.' });
    } catch (error) {
        console.error('Yazar eklenirken bir hata oluştu:', error);
        res.json({ success: false, message: 'Yazar eklenirken bir hata oluştu.' });
    }
});

app.get('/get-yazarlar', async (req, res) => {
    try {
        const yazarCollection = db.collection('yazar');
        const yazarlar = await yazarCollection.find().sort({ yazarAdi: 1 }).toArray();
        res.json({ success: true, yazarlar });
    } catch (error) {
        console.error('Yazarlar alınırken bir hata oluştu:', error);
        res.status(500).json({ error: 'Bir hata oluştu.' });
    }
});

app.delete('/remove-yazar', async (req, res) => {
    const { yazarAdi } = req.body;
    const yazarCollection = db.collection('yazar');
    try {
        await yazarCollection.deleteOne({ yazarAdi });
        res.json({ success: true, message: 'Yazar başarıyla silindi.' });
    } catch (error) {
        console.error('Yazar silinirken bir hata oluştu:', error);
        res.json({ success: false, message: 'Yazar silinirken bir hata oluştu.' });
    }
});

app.get('/get-kitapresimleri', async (req, res) => {
    try {
        const kitaplikCollection = db.collection('slidekitaplar');
        const doc = await kitaplikCollection.findOne({});
        
        if (doc && doc.kitapresimleri) {
            res.json({ success: true, kitapresimleri: doc.kitapresimleri });
        } else {
            res.json({ success: false, message: 'Kitap resimleri bulunamadı.' });
        }
    } catch (error) {
        console.error('Kitap resimleri alınırken hata oluştu:', error);
        res.status(500).json({ error: 'Bir hata oluştu.' });
    }
});

app.post('/update-kitapresim', upload.single('kitapResmi'), async (req, res) => {
    const { key } = req.body;
    const kitapResmi = req.file;

    if (!kitapResmi) {
        return res.json({ success: false, message: 'Kitap resmi yüklenemedi.' });
    }

    try {
        const kitaplikCollection = db.collection('slidekitaplar');
        const updateField = `kitapresimleri.${key}`;
        await kitaplikCollection.updateOne({}, { $set: { [updateField]: kitapResmi.filename } });
        res.json({ success: true, message: 'Kitap resmi başarıyla güncellendi.' });
    } catch (error) {
        console.error('Kitap resmi güncellenirken hata oluştu:', error);
        res.status(500).json({ error: 'Bir hata oluştu.' });
    }
});

app.get('/random-yazarlar', async (req, res) => {
    try {
        const yazarCollection = db.collection('yazar');
        const randomYazarlar = await yazarCollection.aggregate([{ $sample: { size: 3 } }]).toArray();
        res.json({ success: true, yazarlar: randomYazarlar });
    } catch (error) {
        console.error('Rastgele yazarlar alınırken bir hata oluştu:', error);
        res.status(500).json({ error: 'Bir hata oluştu.' });
    }
});
app.get('/random-yayinevi', async (req, res) => {
    try {
        const yazarCollection = db.collection('yayinevi');
        const randomYayinevi = await yazarCollection.aggregate([{ $sample: { size: 3 } }]).toArray();
        res.json({ success: true, yayinevleri: randomYayinevi });
    } catch (error) {
        console.error('Rastgele yayinevi alınırken bir hata oluştu:', error);
        res.status(500).json({ error: 'Bir hata oluştu.' });
    }
});
app.get('/get-yayinevleri', async (req, res) => {
    try {
        const yayineviCollection = db.collection('yayinevi');
        const yayinevleri = await yayineviCollection.find().toArray();
        res.json({ success: true, yayinevleri });
    } catch (error) {
        console.error('Yayınevleri alınırken bir hata oluştu:', error);
        res.status(500).json({ error: 'Bir hata oluştu.' });
    }
});

app.post('/add-yayinevi', upload.single('yayineviresmi'), async (req, res) => {
    const yeniYayinevi = req.body;
    if (req.file) {
        yeniYayinevi.yayineviresmi = req.file.filename;
    }
    try {
        const yayineviCollection = db.collection('yayinevi');
        await yayineviCollection.insertOne(yeniYayinevi);
        res.json({ success: true, message: 'Yayınevi başarıyla eklendi.' });
    } catch (error) {
        console.error('Yayınevi eklenirken bir hata oluştu:', error);
        res.status(500).json({ error: 'Bir hata oluştu.' });
    }
});

app.put('/update-yayinevi/:id', upload.single('yayineviresmi'), async (req, res) => {
    const yayineviId = req.params.id;
    const updatedYayinevi = req.body;
    if (req.file) {
        updatedYayinevi.yayineviresmi = req.file.filename;
    }
    try {
        const yayineviCollection = db.collection('yayinevi');
        await yayineviCollection.updateOne({ _id: new ObjectId(yayineviId) }, { $set: updatedYayinevi });
        res.json({ success: true, message: 'Yayınevi başarıyla güncellendi.' });
    } catch (error) {
        console.error('Yayınevi güncellenirken bir hata oluştu:', error);
        res.status(500).json({ error: 'Bir hata oluştu.' });
    }
});

app.delete('/delete-yayinevi/:id', async (req, res) => {
    const yayineviId = req.params.id;
    try {
        const yayineviCollection = db.collection('yayinevi');
        await yayineviCollection.deleteOne({ _id: new ObjectId(yayineviId) });
        res.json({ success: true, message: 'Yayınevi başarıyla silindi.' });
    } catch (error) {
        console.error('Yayınevi silinirken bir hata oluştu:', error);
        res.status(500).json({ error: 'Bir hata oluştu.' });
    }
});

app.get('/get-kitaplar', async (req, res) => {
    try {
        const kitapCollection = db.collection('kitaplar');
        const kitaplar = await kitapCollection.find().sort({ adi: 1 }).toArray();
        res.json({ success: true, kitaplar });
    } catch (error) {
        console.error('Kitaplar alınırken bir hata oluştu:', error);
        res.status(500).json({ error: 'Bir hata oluştu.' });
    }
});

app.post('/add-kitap', upload.single('kitapresmi'), async (req, res) => {
    const yeniKitap = req.body;
    if (req.file) {
        yeniKitap.kitapresmi = req.file.filename;
    }
    try {
        const kitapCollection = db.collection('kitaplar');
        await kitapCollection.insertOne(yeniKitap);
        res.json({ success: true, message: 'Kitap başarıyla eklendi.' });
    } catch (error) {
        console.error('Kitap eklenirken bir hata oluştu:', error);
        res.status(500).json({ error: 'Bir hata oluştu.' });
    }
});

app.delete('/delete-kitap/:id', async (req, res) => {
    const kitapId = req.params.id;
    try {
        const kitapCollection = db.collection('kitaplar');
        await kitapCollection.deleteOne({ _id: new ObjectId(kitapId) });
        res.json({ success: true, message: 'Kitap başarıyla silindi.' });
    } catch (error) {
        console.error('Kitap silinirken bir hata oluştu:', error);
        res.status(500).json({ error: 'Bir hata oluştu.' });
    }
});

// Sunucuyu localhost:3000 üzerinde başlat
app.listen(3000, () => {
    console.log('Sunucu http://localhost:3000 üzerinde çalışıyor.'); 
    // Başlatıldığında konsola bilgi yazdır.
});
