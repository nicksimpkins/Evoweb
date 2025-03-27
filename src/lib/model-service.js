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
    
    // Create the engine with minimal configuration
    engineInstance = await CreateWebWorkerMLCEngine(
      modelWorker,
      modelId
    );
    
    console.log("Engine initialized successfully");
    return engineInstance;
  } catch (error) {
    console.error("Failed to create model engine:", error);
    throw error;
  }
}

export async function generateContent(engine, userPreferences) {
  try {
    console.log("Starting content generation...");
    
    // Build messages for the model
    const systemMessage = {
      role: "system",
      content: `Create a personalized HTML webpage with inline CSS.`
    };
    
    // Build user message based on preferences
    const interests = userPreferences.interests || [];
    const visitCount = parseInt(userPreferences.visitCount) || 1;
    
    let interestsText = interests.length > 0 
      ? `The user has shown interest in: ${interests.join(', ')}. ` 
      : `The user has no specific detected interests yet. Provide general appealing content. `;
      
    const userMessage = {
      role: "user",
      content: `Create a personalized webpage for a user with:
      - Visit count: ${visitCount}
      - Interests: ${interestsText}
      
      Make a clean, attractive website with a header, content sections, and footer.
      Return only HTML with inline CSS.`
    };

    console.log("Preparing to send request to model...");
    
    // Add a timeout mechanism
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Model generation timed out after 30 seconds")), 30000);
    });
    
    // Try the correct API structure based on our findings
    let response;
    try {
      // From your console log, this API structure worked the first time
      response = await Promise.race([
        engine.chat.completions.create({
          messages: [systemMessage, userMessage],
          temperature: 0.7,
          max_tokens: 1000
        }),
        timeoutPromise
      ]);
      
      console.log("Response received");
      
      let generatedContent = response.choices[0].message.content;
      return extractHTML(generatedContent);
    } catch (error) {
      console.error("Error generating content:", error);
      throw error;
    }
  } catch (error) {
    console.error("Final error:", error);
    
    // Return fallback content
    return `
      <div style="font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem;">
        <header style="margin-bottom: 2rem;">
          <h1 style="color: #2a4365; font-size: 2.5rem;">Welcome to Your EvoWeb</h1>
          <p>You've visited this site ${userPreferences.visitCount} times!</p>
        </header>
        <main>
          <div style="padding: 1rem; background-color: #f3f4f6; border-radius: 0.5rem; margin-bottom: 1rem;">
            <h2 style="color: #4a5568;">Personalized Experience</h2>
            <p>As you browse more sites, we'll customize your experience based on your interests.</p>
          </div>
          <div style="padding: 1rem; background-color: #f3f4f6; border-radius: 0.5rem;">
            <h2 style="color: #4a5568;">Today's Recommendations</h2>
            <p>Explore new content that might interest you!</p>
          </div>
        </main>
        <footer style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; text-align: center;">
          <p>This content was dynamically generated for you by EvoWeb.</p>
        </footer>
      </div>
    `;
  }
}

// Helper function to extract HTML from model response
function extractHTML(text) {
  // If the response is wrapped in markdown code blocks, extract just the HTML
  const htmlRegex = /```(?:html)?([\s\S]*?)```/;
  const match = text.match(htmlRegex);
  
  if (match && match[1]) {
    return match[1].trim();
  }
  
  // If no code blocks found, return the original text
  return text;
}