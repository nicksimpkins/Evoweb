<script>
  import { onMount } from 'svelte';
  import { generateUserDataPayload } from './lib/user-data-service';
  import { trackVisit, saveGeneratedContent, getLatestContent } from './lib/storage';
  import { createModelEngine, generateContent } from './lib/model-service';
  
  let loading = true;
  let modelLoading = true;
  let contentGenerating = false;
  let generatedContent = "";
  let loadingStatus = "Initializing...";
  let forceNewContent = false;
  
  // For user profile selection and debugging
  let userProfiles = ['outdoor-enthusiast', 'tech-professional', 'wellness-enthusiast'];
  let selectedProfile = null;
  let visitCount = 1;
  let userData = {};
  let showDebugInfo = false;
  
  function toggleDebugInfo() {
    showDebugInfo = !showDebugInfo;
  }
  
  function selectProfile(profileId) {
    selectedProfile = profileId;
    forceNewContent = true;
    handleRegenerateContent();
  }
  
  // Function to generate content with the engine
  async function handleRegenerateContent() {
    forceNewContent = true;
    loading = true;
    contentGenerating = true;
    loadingStatus = "Generating new content...";
    generateNewContent();
  }
  
  async function generateNewContent() {
    try {
      const engine = await createModelEngine();
      
      // Get visit count from localStorage
      visitCount = parseInt(localStorage.getItem('visitCount') || '1');
      
      // Generate user data payload
      userData = generateUserDataPayload(visitCount, selectedProfile);
      
      // Update loading status
      loadingStatus = "Personalizing your experience...";
      
      // Generate content using the user data
      generatedContent = await generateContent(engine, userData);
      
      // Save the generated content
      await saveGeneratedContent(generatedContent);
    } catch (error) {
      console.error("Error generating content:", error);
      generatedContent = `
        <div style="text-align: center; padding: 2rem;">
          <h1>Something went wrong</h1>
          <p>Sorry, there was an error generating your personalized content.</p>
          <p>Error details: ${error.message || "Unknown error"}</p>
        </div>
      `;
    } finally {
      loading = false;
      contentGenerating = false;
    }
  }
  
  onMount(async () => {
    // Track this visit
    trackVisit();
    
    // Get visit count from localStorage
    visitCount = parseInt(localStorage.getItem('visitCount') || '1');
    
    // Generate initial user data
    userData = generateUserDataPayload(visitCount);
    
    // Try to retrieve previous content while loading
    if (!forceNewContent) {
      try {
        const lastContent = await getLatestContent();
        if (lastContent && lastContent.content) {
          generatedContent = lastContent.content;
          loading = false;
        }
      } catch (error) {
        console.log("No previous content found");
      }
    }
    
    // Initialize LLM engine
    if (loading || forceNewContent) {
      loadingStatus = "Loading AI model...";
      await generateNewContent();
    }
  });
</script>

<main>
  {#if loading || contentGenerating}
    <div class="loading-container">
      <h1>EvoWeb</h1>
      <p>{loadingStatus}</p>
      <div class="loading-spinner"></div>
    </div>
  {:else}
    <div class="generated-content">
      {@html generatedContent}
      
      <div style="text-align: center; margin-top: 2rem; padding: 1rem;">
        <button 
          on:click={handleRegenerateContent}
          style="background: linear-gradient(135deg, #6366f1, #a855f7); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; font-weight: bold; margin-right: 1rem;"
        >
          Generate New Content
        </button>
        
        <button 
          on:click={toggleDebugInfo}
          style="background: #e5e7eb; color: #374151; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; font-weight: bold;"
        >
          {showDebugInfo ? 'Hide Debug Info' : 'Show Debug Info'}
        </button>
      </div>
      
      <!-- Profile selector -->
      <div style="text-align: center; margin-top: 1rem; padding: 1rem; background-color: #f3f4f6; border-radius: 0.5rem;">
        <h3 style="margin-top: 0;">Select User Profile</h3>
        <div style="display: flex; justify-content: center; gap: 0.5rem;">
          {#each userProfiles as profile}
            <button 
              on:click={() => selectProfile(profile)}
              style={`
                background: ${selectedProfile === profile ? '#3b82f6' : '#e5e7eb'}; 
                color: ${selectedProfile === profile ? 'white' : '#374151'}; 
                border: none; 
                padding: 0.5rem 1rem; 
                border-radius: 0.5rem; 
                cursor: pointer;
              `}
            >
              {profile.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </button>
          {/each}
        </div>
      </div>
      
      {#if showDebugInfo}
        <div style="margin-top: 2rem; padding: 1rem; background-color: #f3f4f6; border-radius: 0.5rem; font-family: monospace;">
          <h3>User Data JSON:</h3>
          <pre>{JSON.stringify(userData, null, 2)}</pre>
          
          <h3>Visit Count:</h3>
          <pre>{visitCount}</pre>
        </div>
      {/if}
    </div>
  {/if}
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
  
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    text-align: center;
    background: linear-gradient(135deg, #6366f1, #a855f7);
    color: white;
  }
  
  h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
  }
  
  .loading-spinner {
    width: 50px;
    height: 50px;
    margin-top: 2rem;
    border: 5px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s ease-in-out infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .generated-content {
    min-height: 100vh;
  }
</style>