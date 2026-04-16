# PostgreSQL Kurulum Dosyalari

Bu klasor, `herkitap` veritabanini ve gerekli tablolari olusturmak icin hazirlandi.

## Olusan tablolar

- `hakkimizda`
- `iletisim`
- `kitaplar`
- `slidekitaplar`
- `"user"`
- `yayinevi`
- `yazar`

## Calistirma

> Not: `psql` araci PATH icinde olmali.

1) Veritabanini olustur:

```bash
psql -U postgres -f database/postgresql/create_database.sql
```

2) Sema (tablolar) kur:

```bash
psql -U postgres -d herkitap -f database/postgresql/schema.sql
```

## Dogrulama

```bash
psql -U postgres -d herkitap -c "\dt"
```

`"user"` tablo adi rezervli oldugu icin cift tirnakla kullanilir:

```sql
SELECT * FROM "user" LIMIT 5;
```

## MongoDB -> PostgreSQL veri aktarimi

Bu proje icin Mongo'daki mevcut koleksiyonlari PostgreSQL tablolara tasiyan script eklendi:

- `database/postgresql/migrate_from_mongo.js`

Calistirma:

```bash
npm run pg:migrate-from-mongo
```

Script varsayilan olarak:

- Mongo: `mongodb://localhost:27017/herKitap`
- Postgres: `localhost:5432 / database=herkitap / user=postgres`

Gerekirse ortam degiskenleri ile override edebilirsin:

- `MONGO_URI`
- `MONGO_DB_NAME`
- `PGHOST`
- `PGPORT`
- `PGUSER`
- `PGPASSWORD`
- `PGDATABASE`

## Uygulama baglanti degiskenleri

Backend icin ornek ortam degiskenleri proje kokundeki `.env.example` dosyasina eklendi.

Kullanim:

1. `.env.example` dosyasini `.env` olarak kopyala
2. Kendi PostgreSQL sifreni `PGPASSWORD` alanina yaz
3. Uygulamayi yeniden baslat
