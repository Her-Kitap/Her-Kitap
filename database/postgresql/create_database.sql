-- PostgreSQL veritabani olusturma (superuser ile calistirin)
CREATE DATABASE herkitap
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'C'
    LC_CTYPE = 'C'
    TEMPLATE = template0;
