// Extract all cookies from browser
export function getAllCookies() {
    return document.cookie.split(';')
      .map(cookie => cookie.trim().split('='))
      .reduce((acc, [key, value]) => {
        if (key && value) acc[key] = decodeURIComponent(value);
        return acc;
      }, {});
  }
  
  // Extract local storage data
  export function getLocalStorageData() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      data[key] = localStorage.getItem(key);
    }
    return data;
  }
  
  // Analyze and extract meaningful information
  export function extractUserPreferences(cookies, localData) {
    // This is where you'd implement logic to interpret the cookie/storage data
    // For now we'll start with a simple implementation
    
    // Detect possible interests from cookie names and values
    const possibleInterests = [];
    
    // Look for common shopping interests
    if (Object.keys(cookies).some(key => key.includes('shop') || key.includes('cart'))) {
      possibleInterests.push('shopping');
    }
    
    // Look for content preferences
    if (Object.keys(cookies).some(key => key.includes('article') || key.includes('blog'))) {
      possibleInterests.push('reading');
    }
    
    // Look for tech interests
    if (Object.keys(cookies).some(key => key.includes('tech') || key.includes('gadget'))) {
      possibleInterests.push('technology');
    }
    
    return {
      visitCount: cookies.visitCount || 1,
      lastVisit: cookies.lastVisit || new Date().toISOString(),
      interests: possibleInterests,
      rawCookies: cookies,
      rawLocalData: localData
    };
  }