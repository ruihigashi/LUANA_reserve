import { initializeApp } from 'firebase/app';
import { getMessaging }  from 'firebase/messaging';

/* 1. Vite の環境変数で初期化 */
const firebaseConfig = {
  apiKey:            'AIzaSyBV-LH2wxWi0qdDk97QPmdaW-BcmhO-Gkk',
  projectId:         'luana-b337b',
  messagingSenderId: '702933620606',
  appId:             '1:702933620606:web:4f6e1b3dfa86140c6e452f',
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
