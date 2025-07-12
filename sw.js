// キャッシュ名。アプリのバージョン管理に使います。
const CACHE_NAME = 'gomoku-v1'; 
// キャッシュするアセットのリスト。これらのファイルはオフラインでも利用可能になります。
const urlsToCache = [
    './', // アプリケーションのルートパス
    'index.html',
    'style.css',
    'app.js', // ファイル名を変更したため、ここも 'app.js' に更新
    // マニフェストファイルで指定したアイコンのパスも忘れずに含めます
    'icons/icon-72x72.png',
    'icons/icon-96x96.png',
    'icons/icon-128x128.png',
    'icons/icon-144x144.png',
    'icons/icon-152x152.png',
    'icons/icon-192x192.png',
    'icons/icon-384x384.png',
    'icons/icon-512x512.png'
];

// サービスワーカーのインストールイベント
// アプリケーションの初期起動時に必要なファイルをキャッシュします。
self.addEventListener('install', event => {
    console.log('Service Worker: Install Event');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching App Shell');
                return cache.addAll(urlsToCache); // 指定されたすべてのファイルをキャッシュに追加
            })
            .catch(error => {
                console.error('Service Worker: Cache addAll failed', error);
            })
    );
});

// サービスワーカーのフェッチイベント
// ブラウザからのリクエストをインターセプトし、キャッシュからリソースを提供します。
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // キャッシュにリクエストされたリソースがあれば、それを返す
                if (response) {
                    console.log('Service Worker: Serving from cache:', event.request.url);
                    return response;
                }
                // キャッシュになければ、ネットワークから取得を試みる
                console.log('Service Worker: Fetching from network:', event.request.url);
                return fetch(event.request);
            })
            .catch(error => {
                console.error('Service Worker: Fetch failed:', error);
                // オフライン時に表示する代替コンテンツ（例: オフラインページ）を返すことも検討できます
                // return caches.match('/offline.html'); 
            })
    );
});

// サービスワーカーのアクティベートイベント
// 古いキャッシュをクリアし、新しいサービスワーカーが有効になったときにクリーンアップを行います。
self.addEventListener('activate', event => {
    console.log('Service Worker: Activate Event');
    const cacheWhitelist = [CACHE_NAME]; // 現在アクティブにしたいキャッシュのリスト
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // 現在のホワイトリストに含まれていないキャッシュを削除
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
