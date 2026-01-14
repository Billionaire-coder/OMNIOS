
import { ProjectState } from "@/types/designer";

/**
 * Generates a Web App Manifest JSON for PWA.
 */
export const generateManifest = (project: ProjectState) => {
  return JSON.stringify({
    name: project.name || "Untitled App",
    short_name: project.name || "App",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#00E0FF",
    icons: [
      {
        src: "/icon-192.png", // In a real app, this would be user-uploaded
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ]
  }, null, 2);
};

/**
 * Generates a Service Worker script for offline capabilities.
 */
export const generateServiceWorker = () => {
  return `
const CACHE_NAME = 'omnios-pwa-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
`;
};

/**
 * Simulates the PWA Export process.
 */
export const downloadPWA = async (project: ProjectState) => {
  // 1. Generate Manifest
  const manifestBlob = new Blob([generateManifest(project)], { type: "application/json" });
  const manifestUrl = URL.createObjectURL(manifestBlob);

  // 2. Generate Service Worker
  const swBlob = new Blob([generateServiceWorker()], { type: "text/javascript" });
  const swUrl = URL.createObjectURL(swBlob);

  // 3. Trigger Download (for MVP demo, we just download the manifest)
  const link = document.createElement("a");
  link.href = manifestUrl;
  link.download = "manifest.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  console.log("[PWA Export] Generated Assets:", { manifestUrl, swUrl });
  alert("PWA Assets Generated! (manifest.json downloaded)");
};
