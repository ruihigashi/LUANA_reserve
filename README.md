<div id="top"></div>

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

## 目次

1. [プロジェクトについて](#プロジェクトについて)
2. [開発環境](#開発環境)
3. [ディレクトリ構成](#ディレクトリ構成)
4. [開発環境構築](#開発環境構築)

<br />

## プロジェクト名

Luana Reserve

## プロジェクトについて

美容室の予約管理アプリ

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

### 3. Firebase / Supabase の設定

本プロジェクトはバックエンドに Firebase と Supabase を使用しています。
詳細な設定方法は、以下のドキュメントを参照してください。

- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

<p align="right">(<a href="#top">トップへ</a>)</p>

