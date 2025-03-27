<script>
  import { onMount } from 'svelte';
  import { getAllCookies, getLocalStorageData, extractUserPreferences } from './lib/cookie-parser';
  import { trackVisit, saveGeneratedContent, getLatestContent } from './lib/storage';
  import { createModelEngine, generateContent } from './lib/model-service';
  
  let loading = true;
  let modelLoading = true;
  let contentGenerating = false;
  let generatedContent = "";
  let loadingStatus = "Initializing...";
  let forceNewContent = false;
  
  // Add these for cookie debugging
  let availableCookies = {};
  let localStorageData = {};
  let showDebugInfo = false;
  
  function toggleDebugInfo() {
    showDebugInfo = !showDebugInfo;
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
      
      // Get cookies and extract preferences
      availableCookies = getAllCookies();
      localStorageData = getLocalStorageData();
      const userPreferences = extractUserPreferences(availableCookies, localStorageData);
      
      // Update the prompt to generate more interesting content
      loadingStatus = "Personalizing your experience...";
      generatedContent = await generateContent(engine, userPreferences);
      
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
    
    // Fetch available cookies and local storage data for debugging
    availableCookies = getAllCookies();
    localStorageData = getLocalStorageData();
    
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
      
      {#if showDebugInfo}
        <div style="margin-top: 2rem; padding: 1rem; background-color: #f3f4f6; border-radius: 0.5rem; font-family: monospace;">
          <h3>Available Cookies:</h3>
          <pre>{JSON.stringify(availableCookies, null, 2)}</pre>
          
          <h3>LocalStorage Data:</h3>
          <pre>{JSON.stringify(localStorageData, null, 2)}</pre>
          
          <h3>Extracted Preferences:</h3>
          <pre>{JSON.stringify(extractUserPreferences(availableCookies, localStorageData), null, 2)}</pre>
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