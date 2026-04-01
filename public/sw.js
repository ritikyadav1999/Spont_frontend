const CACHE_VERSION = "spont-pwa-v1";
const APP_SHELL_CACHE = `${CACHE_VERSION}-app-shell`;
const PAGE_CACHE = `${CACHE_VERSION}-pages`;
const ASSET_CACHE = `${CACHE_VERSION}-assets`;
const OFFLINE_URL = "/offline";
const DEFAULT_ICON_URL = "/icon";
const DEFAULT_BADGE_URL = "/icon-maskable";
const APP_SHELL_URLS = [
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/icon",
  "/icon-maskable",
  "/apple-icon",
  "/pwa-screenshot",
  "/pwa-screenshot-wide",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL_URLS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => ![APP_SHELL_CACHE, PAGE_CACHE, ASSET_CACHE].includes(key))
          .map((key) => caches.delete(key)),
      ),
    ).then(() => self.clients.claim()),
  );
});

const isNavigationRequest = (request) => request.mode === "navigate";
const isCacheableAsset = (request) => ["style", "script", "font", "image"].includes(request.destination);
const isSameOrigin = (url) => url.origin === self.location.origin;

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (!isSameOrigin(url)) {
    return;
  }

  if (isNavigationRequest(request)) {
    event.respondWith(networkFirstPage(request));
    return;
  }

  if (isCacheableAsset(request)) {
    event.respondWith(staleWhileRevalidateAsset(request));
  }
});

self.addEventListener("push", (event) => {
  const payload = parsePushPayload(event);

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon || DEFAULT_ICON_URL,
      badge: payload.badge || DEFAULT_BADGE_URL,
      tag: payload.tag || "spont-notification",
      data: {
        url: payload.url || "/notifications",
      },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/notifications";

  event.waitUntil(focusOrOpenClient(targetUrl));
});

async function networkFirstPage(request) {
  const cache = await caches.open(PAGE_CACHE);

  try {
    const response = await fetch(request);

    if (response && response.ok) {
      cache.put(request, response.clone());
    }

    return response;
  } catch {
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    const offlineResponse = await caches.match(OFFLINE_URL);
    return offlineResponse || Response.error();
  }
}

async function staleWhileRevalidateAsset(request) {
  const cache = await caches.open(ASSET_CACHE);
  const cachedResponse = await cache.match(request);

  const networkResponsePromise = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone());
      }

      return response;
    })
    .catch(() => undefined);

  return cachedResponse || networkResponsePromise || Response.error();
}

function parsePushPayload(event) {
  if (!event.data) {
    return {
      title: "Spont",
      body: "You have a new notification.",
      url: "/notifications",
    };
  }

  try {
    const data = event.data.json();

    return {
      title: data.title || "Spont",
      body: data.body || data.message || "You have a new notification.",
      icon: data.icon || DEFAULT_ICON_URL,
      badge: data.badge || DEFAULT_BADGE_URL,
      tag: data.tag,
      url: data.url || data.deepLink || "/notifications",
    };
  } catch {
    return {
      title: "Spont",
      body: event.data.text() || "You have a new notification.",
      url: "/notifications",
    };
  }
}

async function focusOrOpenClient(targetUrl) {
  const clients = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });

  for (const client of clients) {
    const currentUrl = new URL(client.url);

    if (currentUrl.origin === self.location.origin) {
      await client.focus();
      if ("navigate" in client) {
        return client.navigate(targetUrl);
      }

      return client;
    }
  }

  return self.clients.openWindow(targetUrl);
}
