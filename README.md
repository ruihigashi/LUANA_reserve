<div id="top"></div>

## プロジェクト名

Luana予約システム


## 目次

1. [プロジェクトについて](#プロジェクトについて)
2. [開発環境](#開発環境)
3. [ディレクトリ構成](#ディレクトリ構成)
4. [開発環境構築](#開発環境構築)

## プロジェクトについて

母が個人で営む美容室の予約を行えるウェブサイト
<img width="1920" height="7303" alt="screencapture-luana-reserve-netlify-app-reservation-2025-10-28-13_52_31" src="https://github.com/user-attachments/assets/9bf4d634-b8c5-41fa-8476-3f6e50639993" />


## サイトリンク
https://luana-reserve.netlify.app/reservation

<br/>

## 使用技術一覧

<p style="display: inline">
  <img src="https://img.shields.io/badge/-React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB">
  <img src="https://img.shields.io/badge/-Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white">
  <img src="https://img.shields.io/badge/-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
  <img src="https://img.shields.io/badge/-TailwindCSS-000000.svg?logo=tailwindcss&style=for-the-badge">
  <img src="https://img.shields.io/badge/-Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black">
  <img src="https://img.shields.io/badge/-Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white">
  <img src="https://img.shields.io/badge/-Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white">
</p>

<br />

<p align="right">(<a href="#top">トップへ</a>)</p>

## 開発環境

| 言語・フレームワーク | バージョン |
| -------------------- | ---------- |
| React                | ^18.3.1    |
| Vite                 | ^5.4.19    |
| TypeScript           | ^5.5.3     |
| Tailwind CSS         | ^3.4.17    |
| Firebase             | ^11.9.1    |
| Supabase             | ^2.50.0    |
| Node.js              | 20.x       |

その他のパッケージのバージョンは package.json を参照してください

<p align="right">(<a href="#top">トップへ</a>)</p>

## ディレクトリ構成

```
.
├── FIREBASE_SETUP.md
├── README.md
├── _redirects
├── dist/
├── eslint.config.js
├── index.html
├── netlify/
├── netlify.toml
├── node_modules/
├── package-lock.json
├── package.json
├── postcss.config.js
├── public/
├── src/
├── supabase/
├── supabase_2.24.3_linux_amd64.deb
├── supabase_2.24.3_linux_amd64.tar.gz
├── supabase_2.24.3.tar.gz
├── tailwind.config.js
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

<p align="right">(<a href="#top">トップへ</a>)</p>

## 開発環境構築

### 1. パッケージのインストール

```bash
npm install
```

### 2. 開発サーバーの起動

```bash
npm run dev
```

### 3. デプロイ

https://luana-reserve.netlify.app/reservation

