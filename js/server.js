const express = require('express');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config();

const app = express();

const pgPool = new Pool({
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT || 5432),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '',
    database: process.env.PGDATABASE || 'herkitap',
    max: 10,
    idleTimeoutMillis: 30000
});
const sessions = new Map();

async function testPostgresConnection() {
    await pgPool.query('SELECT 1');
}

function isUuid(value) {
    return typeof value === 'string' &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function mapKitapRow(row) {
    return {
        _id: row.id,
        adi: row.adi,
        yazari: row.yazari,
        kategori: row.kategori,
        aciklama: row.aciklama,
        kitapresmi: row.kitapresmi
    };
}

function mapYayineviRow(row) {
    return {
        _id: row.id,
        yayineviadi: row.yayineviadi,
        anasirket: row.anasirket,
        durum: row.durum,
        kurulus: row.kurulus,
        kurucu: row.kurucu,
        ulke: row.ulke,
        merkez: row.merkez,
        yayinturleri: row.yayinturleri,
        yayinkonulari: row.yayinkonulari,
        resmisite: row.resmisite,
        yayineviresmi: row.yayineviresmi
    };
}

function mapYazarRow(row) {
    return {
        yazarAdi: row.yazaradi,
        dogumYili: row.dogumyili,
        yazarAciklama: row.yazaraciklama,
        yazarResmi: row.yazarresmi
    };
}

function parseCookies(cookieHeader = '') {
    return cookieHeader
        .split(';')
        .map(part => part.trim())
        .filter(Boolean)
        .reduce((acc, part) => {
            const [key, ...rest] = part.split('=');
            acc[key] = decodeURIComponent(rest.join('=') || '');
            return acc;
        }, {});
}

function createSession(user) {
    const sessionId = crypto.randomUUID();
    sessions.set(sessionId, {
        e_mail: user.e_mail,
        yetki: user.yetki
    });
    return sessionId;
}

function getSession(req) {
    const cookies = parseCookies(req.headers.cookie);
    const sessionId = cookies.sessionId;
    if (!sessionId) return null;
    return sessions.get(sessionId) || null;
}

function isAdmin(req) {
    const session = getSession(req);
    return !!session && session.yetki === 'admin';
}

function requireAdmin(req, res, next) {
    if (!isAdmin(req)) {
        return res.status(403).json({ success: false, message: 'Bu işlem için admin yetkisi gerekli.' });
    }
    next();
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/css', express.static(path.join(__dirname, '../css')));
app.use('/js', express.static(path.join(__dirname, '../js')));
app.use('/images', express.static(path.join(__dirname, '../images')));
app.use((req, res, next) => {
    if (req.path === '/admin.html' && !isAdmin(req)) {
        return res.redirect('/girisyapx.html');
    }
    next();
});
app.use(express.static(path.join(__dirname, '../html')));

app.get('/health/db', async (req, res) => {
    try {
        await pgPool.query('SELECT 1');
        return res.json({ success: true, status: { postgres: true } });
    } catch (error) {
        return res.status(500).json({ success: false, status: { postgres: false }, message: error.message });
    }
});

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

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../html/index.html'));
});

app.post('/register', async (req, res) => {
    const { user_name, e_mail, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pgPool.query(
            `INSERT INTO "user" (user_name, e_mail, password, yetki)
             VALUES ($1, $2, $3, 'user')`,
            [user_name, e_mail, hashedPassword]
        );
        res.json({ success: true });
    } catch (error) {
        if (error.code === '23505') {
            return res.json({ success: false, message: 'Bu e-posta ile zaten bir hesap oluşturulmuş.' });
        }
        console.error('Kayıt sırasında bir hata oluştu:', error);
        res.json({ success: false, message: 'Kayıt sırasında bir hata oluştu.' });
    }
});

app.post('/login', async (req, res) => {
    const { e_mail, password } = req.body;

    try {
        const { rows } = await pgPool.query(
            'SELECT id, user_name, e_mail, password, yetki FROM "user" WHERE e_mail = $1',
            [e_mail]
        );
        const user = rows[0];
        if (!user) {
            console.log(e_mail);
            return res.json({ success: false, message: 'Kullanıcı bulunamadı.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.json({ success: false, message: 'Şifre yanlış.' });
        }

        const sessionUser = { e_mail: user.e_mail, yetki: user.yetki };
        const sessionId = createSession(sessionUser);
        res.setHeader('Set-Cookie', `sessionId=${encodeURIComponent(sessionId)}; HttpOnly; Path=/; SameSite=Lax`);

        if (user.yetki === 'admin') {
            res.json({ success: true, redirectUrl: 'admin.html' });
        } else {
            res.json({ success: true, redirectUrl: 'kitaplikx.html' });
        }
    } catch (error) {
        console.error('Giriş sırasında bir hata oluştu:', error);
        res.json({ success: false, message: 'Giriş sırasında bir hata oluştu.' });
    }
});

app.get('/random-images', async (req, res) => {
    try {
        const { rows } = await pgPool.query(
            `SELECT gorsel FROM slidekitaplar
             WHERE aktif = true AND gorsel IS NOT NULL AND gorsel <> ''
             ORDER BY RANDOM() LIMIT 5`
        );
        const images = rows.map(r => r.gorsel);
        res.json({ images });
    } catch (error) {
        console.error('Rastgele resimler alınırken hata oluştu:', error);
        res.status(500).json({ error: 'Bir hata oluştu.' });
    }
});

app.get('/random-kitaplar', async (req, res) => {
    try {
        const { rows } = await pgPool.query(
            `SELECT id, adi, yazari, kategori, aciklama, kitapresmi
             FROM kitaplar ORDER BY RANDOM() LIMIT 6`
        );
        res.json({ success: true, kitaplar: rows.map(mapKitapRow) });
    } catch (error) {
        console.error('Kitapları çekerken hata oluştu:', error);
        res.status(500).json({ success: false, message: 'Kitaplar getirilemedi' });
    }
});

app.post('/add-book', async (req, res) => {
    const { adi, yazari, yayinYili, aciklama, turu } = req.body;
    console.log('Kitap eklendi (legacy /add-book)');

    try {
        const parts = [];
        if (aciklama) parts.push(String(aciklama));
        if (yayinYili) parts.push(`Yayın yılı: ${yayinYili}`);
        if (turu) parts.push(`Tür: ${turu}`);
        const aciklamaBirlesik = parts.join('\n') || null;
        const kategori = turu ? String(turu) : null;

        await pgPool.query(
            `INSERT INTO kitaplar (adi, yazari, kategori, aciklama)
             VALUES ($1, $2, $3, $4)`,
            [adi, yazari, kategori, aciklamaBirlesik]
        );
        res.json({ success: true, message: 'Kitap başarıyla eklendi.' });
    } catch (error) {
        console.error('Kitap eklenirken bir hata oluştu:', error);
        res.json({ success: false, message: 'Kitap eklenirken bir hata oluştu.' });
    }
});

app.delete('/delete-book', async (req, res) => {
    const { adi } = req.body;

    try {
        await pgPool.query('DELETE FROM kitaplar WHERE adi = $1', [adi]);
        res.json({ success: true, message: 'Kitap başarıyla silindi.' });
    } catch (error) {
        console.error('Kitap silinirken bir hata oluştu:', error);
        res.json({ success: false, message: 'Kitap silinirken bir hata oluştu.' });
    }
});

app.get('/get-books', async (req, res) => {
    try {
        const { rows } = await pgPool.query(
            'SELECT id, adi, yazari, kategori, aciklama, kitapresmi FROM kitaplar ORDER BY adi'
        );
        res.json({ success: true, kitaplar: rows.map(mapKitapRow) });
    } catch (error) {
        console.error('Kitaplar alınırken bir hata oluştu:', error);
        res.json({ success: false, message: 'Kitaplar alınırken bir hata oluştu.' });
    }
});

app.get('/kitaplari-getir', async (req, res) => {
    try {
        const kategori = req.query.kategori;
        const useFilter = kategori && kategori !== 'hepsi';

        const { rows } = await pgPool.query(
            `SELECT id, adi, yazari, kategori, aciklama, kitapresmi
             FROM kitaplar
             WHERE ($1::boolean = false OR kategori = $2)
             ORDER BY adi
             LIMIT 6`,
            [useFilter, useFilter ? kategori : null]
        );
        res.json({ success: true, kitaplar: rows.map(mapKitapRow) });
    } catch (error) {
        console.error('Kitapları çekerken hata oluştu:', error);
        res.status(500).json({ success: false, message: 'Kitaplar getirilemedi' });
    }
});

app.get('/rastgele-kitap', async (req, res) => {
    try {
        const kategori = req.query.kategori;
        const useFilter = kategori && kategori !== 'hepsi';

        const { rows } = await pgPool.query(
            `SELECT id, adi, yazari, kategori, aciklama, kitapresmi
             FROM kitaplar
             WHERE ($1::boolean = false OR kategori = $2)
             ORDER BY RANDOM()
             LIMIT 6`,
            [useFilter, useFilter ? kategori : null]
        );

        if (rows.length > 0) {
            res.json({ success: true, kitaplar: rows.map(mapKitapRow) });
        } else {
            res.json({ success: false, message: 'Bu kategoride uygun kitap bulunamadı' });
        }
    } catch (error) {
        console.error('Rastgele kitaplar getirilirken hata oluştu:', error);
        res.status(500).json({ success: false, message: 'Kitaplar getirilemedi' });
    }
});

app.post('/update-hakkimizda', requireAdmin, async (req, res) => {
    const { hakkimizda } = req.body;

    try {
        const upd = await pgPool.query(
            `UPDATE hakkimizda SET metin = $1, updated_at = NOW()
             WHERE id = (SELECT id FROM hakkimizda ORDER BY created_at LIMIT 1)`
            , [hakkimizda]
        );
        if (upd.rowCount === 0) {
            await pgPool.query('INSERT INTO hakkimizda (metin) VALUES ($1)', [hakkimizda]);
        }
        res.json({ success: true, message: 'Hakkımızda bilgisi başarıyla güncellendi.' });
    } catch (error) {
        console.error('Hakkımızda güncellenirken bir hata oluştu:', error);
        res.json({ success: false, message: 'Hakkımızda güncellenirken bir hata oluştu.' });
    }
});

app.get('/get-hakkimizda', async (req, res) => {
    try {
        const { rows } = await pgPool.query(
            'SELECT metin FROM hakkimizda ORDER BY created_at LIMIT 1'
        );
        const row = rows[0];
        if (row) {
            res.json({ success: true, metin: row.metin });
        } else {
            res.json({ success: false, message: 'Hakkımızda bilgisi bulunamadı.' });
        }
    } catch (error) {
        console.error('Hakkımızda bilgisi alınırken bir hata oluştu:', error);
        res.json({ success: false, message: 'Hakkımızda bilgisi alınırken bir hata oluştu.' });
    }
});

app.post('/update-iletisim', requireAdmin, async (req, res) => {
    const { email, telefon, instagram, x, facebook } = req.body;

    try {
        const upd = await pgPool.query(
            `UPDATE iletisim SET email = $1, telefon = $2, instagram = $3, x = $4, facebook = $5, updated_at = NOW()
             WHERE id = (SELECT id FROM iletisim ORDER BY created_at LIMIT 1)`
            , [email, telefon, instagram, x, facebook]
        );
        if (upd.rowCount === 0) {
            await pgPool.query(
                `INSERT INTO iletisim (email, telefon, instagram, x, facebook)
                 VALUES ($1, $2, $3, $4, $5)`,
                [email, telefon, instagram, x, facebook]
            );
        }
        res.json({ success: true, message: 'İletişim bilgileri başarıyla güncellendi.' });
    } catch (error) {
        console.error('İletişim bilgileri güncellenirken bir hata oluştu:', error);
        res.json({ success: false, message: 'İletişim bilgileri güncellenirken bir hata oluştu.' });
    }
});

app.get('/get-iletisim', async (req, res) => {
    try {
        const { rows } = await pgPool.query(
            'SELECT email, telefon, instagram, x, facebook FROM iletisim ORDER BY created_at LIMIT 1'
        );
        const row = rows[0];
        if (row) {
            res.json({ success: true, iletisim: row });
        } else {
            res.json({ success: false, message: 'İletişim bilgileri bulunamadı.' });
        }
    } catch (error) {
        console.error('İletişim bilgileri alınırken bir hata oluştu:', error);
        res.json({ success: false, message: 'İletişim bilgileri alınırken bir hata oluştu.' });
    }
});

app.get('/get-users', requireAdmin, async (req, res) => {
    try {
        const { rows } = await pgPool.query(
            `SELECT id, user_name, e_mail, yetki, created_at FROM "user" ORDER BY created_at`
        );
        res.json({ success: true, users: rows });
    } catch (error) {
        console.error('Kullanıcılar alınırken bir hata oluştu:', error);
        res.json({ success: false, message: 'Kullanıcılar alınırken bir hata oluştu.' });
    }
});

app.post('/update-user-role', requireAdmin, async (req, res) => {
    const { e_mail, yetki } = req.body;

    try {
        await pgPool.query('UPDATE "user" SET yetki = $1 WHERE e_mail = $2', [yetki, e_mail]);
        res.json({ success: true, message: 'Kullanıcı yetkisi başarıyla güncellendi.' });
    } catch (error) {
        console.error('Kullanıcı yetkisi güncellenirken bir hata oluştu:', error);
        res.json({ success: false, message: 'Kullanıcı yetkisi güncellenirken bir hata oluştu.' });
    }
});

app.delete('/delete-user', requireAdmin, async (req, res) => {
    const { e_mail } = req.body;

    try {
        await pgPool.query('DELETE FROM "user" WHERE e_mail = $1', [e_mail]);
        res.json({ success: true, message: 'Kullanıcı başarıyla silindi.' });
    } catch (error) {
        console.error('Kullanıcı silinirken bir hata oluştu:', error);
        res.json({ success: false, message: 'Kullanıcı silinirken bir hata oluştu.' });
    }
});

app.post('/add-yazar', requireAdmin, upload.single('yazarResmi'), async (req, res) => {
    const { yazarAdi, dogumYili, yazarAciklama } = req.body;
    const yazarResmi = req.file;

    if (!yazarResmi) {
        console.error('Yazar resmi yüklenemedi.');
        return res.json({ success: false, message: 'Yazar resmi yüklenemedi.' });
    }

    console.log(`Yazar resmi başarıyla yüklendi: ${yazarResmi.filename}`);

    try {
        const existing = await pgPool.query('SELECT id FROM yazar WHERE yazaradi = $1', [yazarAdi]);
        if (existing.rows.length) {
            await pgPool.query(
                `UPDATE yazar SET dogumyili = $1, yazaraciklama = $2, yazarresmi = $3 WHERE id = $4`,
                [dogumYili, yazarAciklama, yazarResmi.filename, existing.rows[0].id]
            );
        } else {
            await pgPool.query(
                `INSERT INTO yazar (yazaradi, dogumyili, yazaraciklama, yazarresmi)
                 VALUES ($1, $2, $3, $4)`,
                [yazarAdi, dogumYili, yazarAciklama, yazarResmi.filename]
            );
        }
        console.log('Yazar bilgileri veritabanına kaydedildi.');
        res.json({ success: true, message: 'Yazar başarıyla eklendi.' });
    } catch (error) {
        console.error('Yazar eklenirken bir hata oluştu:', error);
        res.json({ success: false, message: 'Yazar eklenirken bir hata oluştu.' });
    }
});

app.get('/get-yazarlar', async (req, res) => {
    try {
        const { rows } = await pgPool.query(
            'SELECT yazaradi, dogumyili, yazaraciklama, yazarresmi FROM yazar ORDER BY yazaradi'
        );
        res.json({ success: true, yazarlar: rows.map(mapYazarRow) });
    } catch (error) {
        console.error('Yazarlar alınırken bir hata oluştu:', error);
        res.status(500).json({ error: 'Bir hata oluştu.' });
    }
});

app.delete('/remove-yazar', requireAdmin, async (req, res) => {
    const { yazarAdi } = req.body;
    try {
        await pgPool.query('DELETE FROM yazar WHERE yazaradi = $1', [yazarAdi]);
        res.json({ success: true, message: 'Yazar başarıyla silindi.' });
    } catch (error) {
        console.error('Yazar silinirken bir hata oluştu:', error);
        res.json({ success: false, message: 'Yazar silinirken bir hata oluştu.' });
    }
});

app.get('/get-kitapresimleri', async (req, res) => {
    try {
        const { rows } = await pgPool.query(
            'SELECT kitapadi, gorsel FROM slidekitaplar WHERE aktif = true ORDER BY siralama, kitapadi'
        );
        if (!rows.length) {
            return res.json({ success: false, message: 'Kitap resimleri bulunamadı.' });
        }
        const kitapresimleri = {};
        for (const r of rows) {
            if (r.kitapadi && r.gorsel) {
                kitapresimleri[r.kitapadi] = r.gorsel;
            }
        }
        res.json({ success: true, kitapresimleri });
    } catch (error) {
        console.error('Kitap resimleri alınırken hata oluştu:', error);
        res.status(500).json({ error: 'Bir hata oluştu.' });
    }
});

app.post('/update-kitapresim', requireAdmin, upload.single('kitapResmi'), async (req, res) => {
    const { key } = req.body;
    const kitapResmi = req.file;

    if (!kitapResmi) {
        return res.json({ success: false, message: 'Kitap resmi yüklenemedi.' });
    }

    try {
        const upd = await pgPool.query(
            'UPDATE slidekitaplar SET gorsel = $1 WHERE kitapadi = $2',
            [kitapResmi.filename, key]
        );
        if (upd.rowCount === 0) {
            return res.json({ success: false, message: 'Bu anahtar için slide kaydı bulunamadı.' });
        }
        res.json({ success: true, message: 'Kitap resmi başarıyla güncellendi.' });
    } catch (error) {
        console.error('Kitap resmi güncellenirken hata oluştu:', error);
        res.status(500).json({ error: 'Bir hata oluştu.' });
    }
});

app.get('/random-yazarlar', async (req, res) => {
    try {
        const { rows } = await pgPool.query(
            'SELECT yazaradi, dogumyili, yazaraciklama, yazarresmi FROM yazar ORDER BY RANDOM() LIMIT 3'
        );
        res.json({ success: true, yazarlar: rows.map(mapYazarRow) });
    } catch (error) {
        console.error('Rastgele yazarlar alınırken bir hata oluştu:', error);
        res.status(500).json({ error: 'Bir hata oluştu.' });
    }
});

app.get('/random-yayinevi', async (req, res) => {
    try {
        const { rows } = await pgPool.query(
            `SELECT id, yayineviadi, anasirket, durum, kurulus, kurucu, ulke, merkez, yayinturleri, yayinkonulari, resmisite, yayineviresmi
             FROM yayinevi ORDER BY RANDOM() LIMIT 3`
        );
        res.json({ success: true, yayinevleri: rows.map(mapYayineviRow) });
    } catch (error) {
        console.error('Rastgele yayinevi alınırken bir hata oluştu:', error);
        res.status(500).json({ error: 'Bir hata oluştu.' });
    }
});

app.get('/get-yayinevleri', async (req, res) => {
    try {
        const { rows } = await pgPool.query(
            `SELECT id, yayineviadi, anasirket, durum, kurulus, kurucu, ulke, merkez, yayinturleri, yayinkonulari, resmisite, yayineviresmi
             FROM yayinevi ORDER BY yayineviadi`
        );
        res.json({ success: true, yayinevleri: rows.map(mapYayineviRow) });
    } catch (error) {
        console.error('Yayınevleri alınırken bir hata oluştu:', error);
        res.status(500).json({ error: 'Bir hata oluştu.' });
    }
});

app.post('/add-yayinevi', requireAdmin, upload.single('yayineviresmi'), async (req, res) => {
    const b = req.body;
    const yayineviresmi = req.file ? req.file.filename : null;
    try {
        await pgPool.query(
            `INSERT INTO yayinevi
              (yayineviadi, anasirket, durum, kurulus, kurucu, ulke, merkez, yayinturleri, yayinkonulari, resmisite, yayineviresmi)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [
                b.yayineviadi,
                b.anasirket,
                b.durum,
                b.kurulus,
                b.kurucu,
                b.ulke,
                b.merkez,
                b.yayinturleri,
                b.yayinkonulari,
                b.resmisite,
                yayineviresmi
            ]
        );
        res.json({ success: true, message: 'Yayınevi başarıyla eklendi.' });
    } catch (error) {
        console.error('Yayınevi eklenirken bir hata oluştu:', error);
        res.status(500).json({ error: 'Bir hata oluştu.' });
    }
});

app.put('/update-yayinevi/:id', requireAdmin, upload.single('yayineviresmi'), async (req, res) => {
    const yayineviId = req.params.id;
    const b = req.body;
    if (!isUuid(yayineviId)) {
        return res.status(400).json({ error: 'Geçersiz yayınevi kimliği.' });
    }
    try {
        const fields = {
            yayineviadi: b.yayineviadi,
            anasirket: b.anasirket,
            durum: b.durum,
            kurulus: b.kurulus,
            kurucu: b.kurucu,
            ulke: b.ulke,
            merkez: b.merkez,
            yayinturleri: b.yayinturleri,
            yayinkonulari: b.yayinkonulari,
            resmisite: b.resmisite
        };
        if (req.file) {
            fields.yayineviresmi = req.file.filename;
        }
        const keys = Object.keys(fields);
        const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
        const vals = keys.map(k => fields[k]);
        vals.push(yayineviId);
        const q = `UPDATE yayinevi SET ${sets} WHERE id = $${vals.length}::uuid`;
        const upd = await pgPool.query(q, vals);
        if (upd.rowCount === 0) {
            return res.status(404).json({ error: 'Yayınevi bulunamadı.' });
        }
        res.json({ success: true, message: 'Yayınevi başarıyla güncellendi.' });
    } catch (error) {
        console.error('Yayınevi güncellenirken bir hata oluştu:', error);
        res.status(500).json({ error: 'Bir hata oluştu.' });
    }
});

app.delete('/delete-yayinevi/:id', requireAdmin, async (req, res) => {
    const yayineviId = req.params.id;
    if (!isUuid(yayineviId)) {
        return res.status(400).json({ error: 'Geçersiz yayınevi kimliği.' });
    }
    try {
        const del = await pgPool.query('DELETE FROM yayinevi WHERE id = $1::uuid', [yayineviId]);
        if (del.rowCount === 0) {
            return res.status(404).json({ error: 'Yayınevi bulunamadı.' });
        }
        res.json({ success: true, message: 'Yayınevi başarıyla silindi.' });
    } catch (error) {
        console.error('Yayınevi silinirken bir hata oluştu:', error);
        res.status(500).json({ error: 'Bir hata oluştu.' });
    }
});

app.get('/get-kitaplar', async (req, res) => {
    try {
        const { rows } = await pgPool.query(
            'SELECT id, adi, yazari, kategori, aciklama, kitapresmi FROM kitaplar ORDER BY adi'
        );
        res.json({ success: true, kitaplar: rows.map(mapKitapRow) });
    } catch (error) {
        console.error('Kitaplar alınırken bir hata oluştu:', error);
        res.status(500).json({ error: 'Bir hata oluştu.' });
    }
});

app.post('/add-kitap', requireAdmin, upload.single('kitapresmi'), async (req, res) => {
    const yeniKitap = req.body;
    if (req.file) {
        yeniKitap.kitapresmi = req.file.filename;
    }
    try {
        await pgPool.query(
            `INSERT INTO kitaplar (adi, yazari, kategori, aciklama, kitapresmi)
             VALUES ($1, $2, $3, $4, $5)`,
            [
                yeniKitap.adi,
                yeniKitap.yazari,
                yeniKitap.kategori,
                yeniKitap.aciklama,
                yeniKitap.kitapresmi || null
            ]
        );
        res.json({ success: true, message: 'Kitap başarıyla eklendi.' });
    } catch (error) {
        console.error('Kitap eklenirken bir hata oluştu:', error);
        res.status(500).json({ error: 'Bir hata oluştu.' });
    }
});

app.delete('/delete-kitap/:id', requireAdmin, async (req, res) => {
    const kitapId = req.params.id;
    if (!isUuid(kitapId)) {
        return res.status(400).json({ error: 'Geçersiz kitap kimliği.' });
    }
    try {
        const del = await pgPool.query('DELETE FROM kitaplar WHERE id = $1::uuid', [kitapId]);
        if (del.rowCount === 0) {
            return res.status(404).json({ error: 'Kitap bulunamadı.' });
        }
        res.json({ success: true, message: 'Kitap başarıyla silindi.' });
    } catch (error) {
        console.error('Kitap silinirken bir hata oluştu:', error);
        res.status(500).json({ error: 'Bir hata oluştu.' });
    }
});

async function startServer() {
    try {
        await testPostgresConnection();
        console.log(`PostgreSQL bağlantısı hazır: ${process.env.PGDATABASE || 'herkitap'}`);
        app.listen(3000, () => {
            console.log('Sunucu http://localhost:3000 üzerinde çalışıyor.');
        });
    } catch (error) {
        console.error('Veritabanı bağlantısı kurulamadı, sunucu başlatılamadı:', error);
        process.exit(1);
    }
}

startServer();
