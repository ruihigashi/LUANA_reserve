import { initializeApp } from 'firebase/app';
import { getMessaging }  from 'firebase/messaging';

/* 1. Vite の環境変数で初期化 */
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

/* 2. デバッグ用：値が入っているか確認（任意で削除OK） */
console.table({
  apiKey:    firebaseConfig.apiKey,
  projectId: firebaseConfig.projectId,
  senderId:  firebaseConfig.messagingSenderId,
  appId:     firebaseConfig.appId,
});
