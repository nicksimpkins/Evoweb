// src/lib/model-service.js
import { CreateWebWorkerMLCEngine } from "@mlc-ai/web-llm";

let engineInstance = null;

export async function createModelEngine() {
  // Only create one instance of the engine
  if (engineInstance) {
    return engineInstance;
  }
  
  try {
    console.log("Creating worker...");
    
    // Create the worker engine
    const modelWorker = new Worker(
      new URL('../workers/model-worker.js', import.meta.url),
      { type: 'module' }
    );
    
    console.log("Worker created, initializing engine...");
    
    // Update the model ID to match the downloaded model
    const modelId = "phi-2-q4f16_1-MLC";
    
    console.log(`Loading model: ${modelId}`);
    
    // Create with minimal configuration to avoid TypeScript errors
    engineInstance = await CreateWebWorkerMLCEngine(
      modelWorker, 
      modelId
      // No config to avoid type errors
    );
    
    console.log("Engine initialized successfully");
    return engineInstance;
  } catch (error) {
    console.error("Failed to create model engine:", error);
    throw error;
  }
}

export async function generateContent(engine, userData) {
  try {
    console.log("Starting content generation...");
    
    // Extract relevant information from userData
    const { user, device } = userData;
    const visitCount = user.visitCount;
    const profile = user.profile;
    
    console.log("Preparing to send request to model...");
    
    try {
      console.log("Attempting to use chat.completions API...");
      
      // Format the JSON data for the prompt
      const jsonContent = JSON.stringify(userData, null, 2);
      
      // Create the prompt with JSON payload
      const prompt = `
      Create the main HTML component for my website based on this user data:
      
      ${jsonContent}
      
      NO PYTHON CODE. NO FLASK. NO JQUERY. ONLY FRONTEND CODE ONLY HTML CSS JAVASCRIPT.
      
      Start with this code:
      <div class="container">
      
      </div>
      `;
      
      const response = await engine.chat.completions.create({
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });
      
      console.log("Response received");
      const generatedContent = response.choices[0].message.content;
      
      // Return ONLY the header, AI content, and footer without the welcome and info boxes
      return `
        <div style="font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem;">
          <header style="margin-bottom: 2rem;">
            <h1 style="color: #4f46e5; font-size: 2.5rem;">${profile.primaryInterest.charAt(0).toUpperCase() + profile.primaryInterest.slice(1)} Enthusiast</h1>
            <p style="color: #6b7280; font-size: 1.25rem;">Visit #${visitCount}</p>
          </header>
          
          <div style="padding: 1.5rem; background-color: #fff; border-radius: 0.5rem; border: 1px solid #e5e7eb;">
            <h2 style="color: #000000; margin-top: 0;">AI-Generated Content</h2>
            <div id="ai-content" style="color: #000000;">
              ${generatedContent}
            </div>
          </div>
          
          <footer style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280;">
            <p>EvoWeb has successfully loaded a ${(visitCount > 10) ? 'familiar' : 'new'} user profile</p>
          </footer>
        </div>
      `;
    } catch (error) {
      console.error("Error with model request:", error);
      
      // Return a simplified fallback
      return `
        <div style="font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem;">
          <header style="margin-bottom: 2rem;">
            <h1 style="color: #4f46e5; font-size: 2.5rem;">${profile.primaryInterest.charAt(0).toUpperCase() + profile.primaryInterest.slice(1)} Enthusiast</h1>
            <p style="color: #6b7280; font-size: 1.25rem;">Visit #${visitCount}</p>
          </header>
          
          <div style="padding: 1.5rem; background-color: #fff; border-radius: 0.5rem; border: 1px solid #808080">
            <h2 style="color: #000000; margin-top: 0;">AI-Generated Content</h2>
            <div id="ai-content" style="color: #000000;">
              <p>The LLM model loaded successfully but content generation had issues.</p>
              <p>We found your interest in <strong>${profile.primaryInterest}</strong> and other interests like ${profile.otherInterests.join(', ')}.</p>
            </div>
          </div>
          
          <footer style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280;">
            <p>EvoWeb has successfully loaded a ${(visitCount > 10) ? 'familiar' : 'new'} user profile</p>
          </footer>
        </div>
      `;
    }
  } catch (error) {
    console.error("Final error:", error);
    
    // Return simplified fallback content
    return `
      <div style="font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem;">
        <header style="margin-bottom: 2rem;">
          <h1 style="color: #4f46e5; font-size: 2.5rem;">Technical Difficulties</h1>
          <p>Visit #${userData.user.visitCount}</p>
        </header>
        
        <div style="padding: 1.5rem; background-color: #fff; border-radius: 0.5rem; border: 1px solid #e5e7eb;">
          <h2 style="color: #000000; margin-top: 0;">Status</h2>
          <div id="ai-content" style="color: #000000;">
            <p>There was a technical issue generating content with the AI model.</p>
            <p>Please try again later.</p>
          </div>
        </div>
      </div>
    `;
  }
}