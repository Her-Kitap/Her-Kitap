-- herkitap veritabani tablolari
-- Not: "user" PostgreSQL'de reserved keyword oldugu icin quoted kullanildi.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS "user" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_name VARCHAR(120) NOT NULL,
    e_mail VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    yetki VARCHAR(20) NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kitaplar (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    adi VARCHAR(255) NOT NULL,
    yazari VARCHAR(255),
    kategori VARCHAR(100),
    aciklama TEXT,
    kitapresmi VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS yazar (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    yazaradi VARCHAR(255) NOT NULL,
    dogumyili VARCHAR(50),
    yazaraciklama TEXT,
    yazarresmi VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS yayinevi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    yayineviadi VARCHAR(255) NOT NULL,
    anasirket VARCHAR(255),
    durum VARCHAR(100),
    kurulus VARCHAR(100),
    kurucu VARCHAR(255),
    ulke VARCHAR(100),
    merkez VARCHAR(255),
    yayinturleri TEXT,
    yayinkonulari TEXT,
    resmisite VARCHAR(255),
    yayineviresmi VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hakkimizda (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metin TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS iletisim (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255),
    telefon VARCHAR(100),
    instagram VARCHAR(255),
    x VARCHAR(255),
    facebook VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS slidekitaplar (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kitapadi VARCHAR(255) NOT NULL,
    yazar VARCHAR(255),
    aciklama TEXT,
    gorsel VARCHAR(255),
    siralama INTEGER NOT NULL DEFAULT 0,
    aktif BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kitaplar_kategori ON kitaplar(kategori);
CREATE INDEX IF NOT EXISTS idx_yayinevi_adi ON yayinevi(yayineviadi);
CREATE INDEX IF NOT EXISTS idx_yazar_adi ON yazar(yazaradi);
