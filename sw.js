// Tazkiyatun Nafs — Service Worker with Firebase Cloud Messaging
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyC750OwSieHCHjH6slz-8mrXy4wBZS_OrU",
  authDomain: "tazkiyatun-nafs.firebaseapp.com",
  projectId: "tazkiyatun-nafs",
  storageBucket: "tazkiyatun-nafs.firebasestorage.app",
  messagingSenderId: "918766852792",
  appId: "1:918766852792:web:40e91da7f429a17d08b24d"
});

const messaging = firebase.messaging();

// Handle background FCM messages
messaging.onBackgroundMessage(payload => {
  const { title, body, tag } = payload.notification || {};
  self.registration.showNotification(title || '⏰ Tazkiyatun Nafs', {
    body: body || '',
    tag: tag || 'reminder',
    icon: 'https://nurnabi05.github.io/tazkiyatun-nafs/icon.png',
    badge: 'https://nurnabi05.github.io/tazkiyatun-nafs/icon.png',
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 200]
  });
});

// Handle local scheduled reminders (from main thread via postMessage)
let scheduledTimers = {};

self.addEventListener('message', event => {
  if (!event.data) return;

  if (event.data.type === 'SCHEDULE_REMINDER') {
    const { id, text, delayMs } = event.data;
    clearTimeout(scheduledTimers[id]);
    if (delayMs <= 0) return;
    scheduledTimers[id] = setTimeout(() => {
      self.registration.showNotification('⏰ Tazkiyatun Nafs Reminder', {
        body: text,
        tag: 'todo-' + id,
        requireInteraction: true,
        vibrate: [200, 100, 200],
        icon: 'https://nurnabi05.github.io/tazkiyatun-nafs/icon.png',
        data: { id }
      });
      delete scheduledTimers[id];
    }, delayMs);
  }

  if (event.data.type === 'CANCEL_REMINDER') {
    const { id } = event.data;
    clearTimeout(scheduledTimers[id]);
    delete scheduledTimers[id];
  }
});

// Open app when notification is clicked
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.includes('tazkiyatun-nafs') && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow('https://nurnabi05.github.io/tazkiyatun-nafs/');
    })
  );
});

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});
