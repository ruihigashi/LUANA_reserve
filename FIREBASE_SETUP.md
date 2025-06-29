# Firebase 通知機能セットアップ

## 概要
このプロジェクトでは、予約確定時に管理者のスマートフォンにプッシュ通知を送信する機能を実装しています。

## セットアップ手順

### 1. Firebase Consoleでの設定

#### 1.1 VAPIDキーの取得
1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. プロジェクト `luana-b337b` を選択
3. 左メニューから「プロジェクトの設定」をクリック
4. 「Cloud Messaging」タブを選択
5. 「Web プッシュ証明書」セクションで「キーペアを生成」をクリック
6. 生成されたVAPIDキーをコピー

#### 1.2 サービスアカウントキーの取得
1. Firebase Consoleの「プロジェクトの設定」で「サービスアカウント」タブを選択
2. 「新しい秘密鍵の生成」をクリック
3. ダウンロードされたJSONファイルから以下の情報を取得：
   - `client_email`
   - `private_key`

### 2. 環境変数の設定

#### 2.1 Netlify環境変数
Netlifyのダッシュボードで以下の環境変数を設定：

```
FIREBASE_CLIENT_EMAIL=your-service-account-email@luana-b337b.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

#### 2.2 VAPIDキーの更新
`src/lib/firebase.ts` の `VAPID_KEY` を実際の値に更新：

```typescript
const VAPID_KEY = 'your-actual-vapid-key';
```

### 3. Supabaseテーブルの設定

#### 3.1 fcm_tokensテーブルの作成
以下のSQLをSupabaseで実行：

```sql
CREATE TABLE fcm_tokens (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX idx_fcm_tokens_user_id ON fcm_tokens(user_id);
CREATE INDEX idx_fcm_tokens_admin ON fcm_tokens(user_id, is_admin);

-- 重複トークンの防止
CREATE UNIQUE INDEX idx_fcm_tokens_unique ON fcm_tokens(user_id, token);
```

### 4. 管理者トークンの登録

#### 4.1 管理者ページへのアクセス
管理者のスマートフォンで以下のURLにアクセス：
```
https://your-domain.com/admin/token-registration
```

#### 4.2 通知許可の設定
1. ブラウザで通知許可を許可
2. 「管理者通知を有効にする」ボタンをクリック
3. 成功メッセージが表示されれば完了

### 5. 動作確認

#### 5.1 テスト予約の作成
1. 顧客として予約フォームを完了
2. 管理者のスマートフォンに通知が届くことを確認

#### 5.2 通知内容
通知には以下の情報が含まれます：
- 予約日時
- 顧客名
- 選択されたサービス
- 予約ID

## トラブルシューティング

### 通知が届かない場合
1. 管理者トークンが正しく登録されているか確認
2. Firebase ConsoleでCloud Messagingが有効になっているか確認
3. ブラウザの通知許可が有効になっているか確認
4. Netlify Functionsのログを確認

### エラーログの確認
1. Netlify Functionsのログを確認
2. ブラウザの開発者ツールでコンソールエラーを確認
3. Supabaseのログを確認

## 注意事項

- VAPIDキーは公開しても問題ありませんが、サービスアカウントキーは絶対に公開しないでください
- 管理者トークンは定期的に更新することを推奨します
- 通知の頻度が高い場合は、Firebaseの制限に注意してください 