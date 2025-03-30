// MOCK DATA - INTEGRATE THROUGH PROFILE API LATER
const SAMPLE_USER_PROFILES = [
    {
      id: 'outdoor-enthusiast',
      primaryInterest: 'hiking',
      otherInterests: ['camping', 'photography', 'travel'],
      devicePreferences: {
        prefersDarkMode: true,
        prefersReducedMotion: false
      },
      contentPreferences: {
        readingLevel: 'intermediate',
        contentLength: 'medium',
        mediaPreference: 'image-heavy'
      }
    },
    {
      id: 'tech-professional',
      primaryInterest: 'programming',
      otherInterests: ['artificial intelligence', 'data science', 'gadgets'],
      devicePreferences: {
        prefersDarkMode: true,
        prefersReducedMotion: false
      },
      contentPreferences: {
        readingLevel: 'advanced',
        contentLength: 'long',
        mediaPreference: 'code-samples'
      }
    },
    {
      id: 'wellness-enthusiast',
      primaryInterest: 'yoga',
      otherInterests: ['meditation', 'nutrition', 'mindfulness'],
      devicePreferences: {
        prefersDarkMode: false,
        prefersReducedMotion: true
      },
      contentPreferences: {
        readingLevel: 'beginner',
        contentLength: 'medium',
        mediaPreference: 'video'
      }
    }
  ];
  
  // Get browser and device information 
  export function getDeviceInfo() {
    const userAgent = navigator.userAgent;
    
    // Simple browser detection
    let browser = 'Unknown';
    if (userAgent.indexOf('Chrome') !== -1) browser = 'Chrome';
    else if (userAgent.indexOf('Firefox') !== -1) browser = 'Firefox';
    else if (userAgent.indexOf('Safari') !== -1) browser = 'Safari';
    else if (userAgent.indexOf('Edge') !== -1) browser = 'Edge';
    
    // Simple device detection
    let deviceType = 'Desktop';
    if (/Mobi|Android/i.test(userAgent)) deviceType = 'Mobile';
    else if (/iPad|Tablet/i.test(userAgent)) deviceType = 'Tablet';
    
    // Language preference
    const language = navigator.language || 'en-US';
    
    // Color scheme preference
    const prefersDarkMode = window.matchMedia && 
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    return {
      browser,
      deviceType,
      language,
      prefersDarkMode,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight
    };
  }
  
  // Get a user profile based on visit count or other parameters
  export function getUserProfile(visitCount = 1, profileId = null) {
    // If a specific profile ID is provided, return that profile
    if (profileId && SAMPLE_USER_PROFILES.some(p => p.id === profileId)) {
      return SAMPLE_USER_PROFILES.find(p => p.id === profileId);
    }
    
    // Otherwise select a profile based on visit count
    // This is just a simple rotation for demonstration
    const index = (visitCount - 1) % SAMPLE_USER_PROFILES.length;
    return SAMPLE_USER_PROFILES[index];
  }
  
  // Generate the complete JSON payload for the LLM
  export function generateUserDataPayload(visitCount = 1, profileId = null) {
    const deviceInfo = getDeviceInfo();
    const userProfile = getUserProfile(visitCount, profileId);
    
    return {
      user: {
        visitCount: visitCount,
        profile: userProfile
      },
      device: deviceInfo,
      timestamp: new Date().toISOString()
    };
  }