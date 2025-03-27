import localforage from 'localforage';

// Initialize IndexedDB storage
export const modelStorage = localforage.createInstance({
  name: 'evoweb-models'
});

export const contentStorage = localforage.createInstance({
  name: 'evoweb-content'
});

// Save generated content
export async function saveGeneratedContent(content) {
  return await contentStorage.setItem('latest-content', {
    content,
    timestamp: new Date().toISOString()
  });
}

// Get latest generated content
export async function getLatestContent() {
  return await contentStorage.getItem('latest-content');
}

// Track user visits
export function trackVisit() {
  const visits = parseInt(localStorage.getItem('visitCount') || '0');
  localStorage.setItem('visitCount', (visits + 1).toString());
  localStorage.setItem('lastVisit', new Date().toISOString());
}