importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

/* 1. Firebase 初期化（キーはそのままで OK） */
firebase.initializeApp({
  apiKey:            'AIzaSyBV-LH2wxWi0qdDk97QPmdaW-BcmhO-Gkk',
  projectId:         'luana-b337b',
  messagingSenderId: '702933620606',
  appId:             '1:702933620606:web:4f6e1b3dfa86140c6e452f',
});

const messaging = firebase.messaging();

/* 2. バックグラウンドで通知を受信して表示 */
messaging.onBackgroundMessage((payload) => {
  /* Edge Function 側で data.url を付与している想定 */
  const { title, body } = payload.notification ?? {};
  const url = payload.data?.url || '/';

  self.registration.showNotification(title ?? '通知', {
    body: body ?? '',
    /* data に URL を渡しておくと click で拾える */
    data: { url: 'https://luana-administer.netlify.app'},
  });
});

/* 3. 通知クリックで指定 URL を開く（同オリジン推奨） */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';

  event.waitUntil(
    /* すでに同じタブがあればフォーカス、なければ新規 */
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windows) => {
        for (const w of windows) {
          if (w.url.includes(url) && 'focus' in w) {
            return w.focus();
          }
        }
        /* openWindow はブラウザによっては Promise を返さないことがある */
        return clients.openWindow ? clients.openWindow(url) : undefined;
      })
  );
});
