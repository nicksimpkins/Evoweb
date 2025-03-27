<script>
  import { onMount } from 'svelte';
  import { wrap } from 'comlink';
  import { getAllCookies, getLocalStorageData, extractUserPreferences } from './lib/cookie-parser';
  import { trackVisit, saveGeneratedContent, getLatestContent } from './lib/storage';
  
  let loading = true;
  let modelLoading = true;
  let contentGenerating = false;
  let generatedContent = "";
  let loadingStatus = "Initializing...";
  
  onMount(async () => {
    // Track this visit
    trackVisit();
    
    // Try to retrieve previous content while loading
    try {
      const lastContent = await getLatestContent();
      if (lastContent && lastContent.content) {
        generatedContent = lastContent.content;
        loading = false;
      }
    } catch (error) {
      console.log("No previous content found");
    }
    
    // Initialize Web Worker for model
    loadingStatus = "Loading AI model...";
    const worker = new Worker(new URL('./workers/model-worker.js', import.meta.url), { type: 'module' });
    const modelWorker = wrap(worker);
    
    try {
      // Load model
      await modelWorker.loadModel();
      modelLoading = false;
      
      // Only generate new content if we don't have cached content
      if (loading) {
        contentGenerating = true;
        loadingStatus = "Personalizing your experience...";
        
        // Get cookies and extract preferences
        const cookies = getAllCookies();
        const localData = getLocalStorageData();
        const userPreferences = extractUserPreferences(cookies, localData);
        
        // Generate personalized content
        generatedContent = await modelWorker.generateContent(userPreferences);
        
        // Save the generated content
        await saveGeneratedContent(generatedContent);
      }
      
    } catch (error) {
      console.error("Error:", error);
      generatedContent = `
        <div style="text-align: center; padding: 2rem;">
          <h1>Something went wrong</h1>
          <p>Sorry, there was an error generating your personalized content.</p>
          <p>Please try refreshing the page.</p>
        </div>
      `;
    } finally {
      loading = false;
      contentGenerating = false;
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