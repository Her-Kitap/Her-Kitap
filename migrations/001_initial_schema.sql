-- Her Kitap — ilk şema
-- PostgreSQL 13+ önerilir (gen_random_uuid). Daha eski sürümler için uuid-ossp eklentisini kullanın.

CREATE TABLE "user" (
    id SERIAL PRIMARY KEY,
    user_name TEXT NOT NULL,
    e_mail TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    yetki TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE kitaplar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    adi TEXT NOT NULL,
    yazari TEXT,
    kategori TEXT,
    aciklama TEXT,
    kitapresmi TEXT
);

CREATE TABLE yazar (
    id SERIAL PRIMARY KEY,
    yazaradi TEXT NOT NULL UNIQUE,
    dogumyili TEXT,
    yazaraciklama TEXT,
    yazarresmi TEXT
);

CREATE TABLE yayinevi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    yayineviadi TEXT,
    anasirket TEXT,
    durum TEXT,
    kurulus TEXT,
    kurucu TEXT,
    ulke TEXT,
    merkez TEXT,
    yayinturleri TEXT,
    yayinkonulari TEXT,
    resmisite TEXT,
    yayineviresmi TEXT
);

CREATE TABLE hakkimizda (
    id SERIAL PRIMARY KEY,
    metin TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE TABLE iletisim (
    id SERIAL PRIMARY KEY,
    email TEXT,
    telefon TEXT,
    instagram TEXT,
    x TEXT,
    facebook TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE TABLE slidekitaplar (
    id SERIAL PRIMARY KEY,
    kitapadi TEXT NOT NULL UNIQUE,
    gorsel TEXT,
    aktif BOOLEAN NOT NULL DEFAULT TRUE,
    siralama INTEGER NOT NULL DEFAULT 0
);
