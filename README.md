# Evoweb

**Evoweb** is an innovative web application that dynamically generates personalized content using client-side LLMs that analyze browser cookies and cache data.

## 🚀 Overview

PersonaWeb creates unique, tailored websites for each user without sending any data to servers. The entire content generation process happens locally in the user's browser using lightweight Large Language Models and browser-based machine learning.

Instead of building static websites with predefined content, Evoweb generates the entire UI and content based on what it learns about the user through their browser data, creating truly personalized web experiences.

## 🔑 Key Features

- **Complete Client-Side Processing**: All user data stays on the user's device
- **Cookie & Cache Analysis**: Analyzes browser data to understand user preferences
- **Dynamic Content Generation**: Generates personalized web experiences in real-time
- **Containerized Deployment**: Easy to deploy and scale using containers
- **Efficient Resource Usage**: Optimized for performance even with client-side ML

## 🛠️ Technology Stack

### LLM Platform
- **WebLLM** / **Transformers.js** - Running transformer models directly in browser
- **Llama-2-7B** - Quantized for browser execution

### Performance Optimization
- **WebGPU** / **WebGL** - Hardware acceleration for model inference
- **Web Workers** - Non-blocking model execution

### Storage
- **IndexedDB** - For model weights and generated content
- **LocalStorage** - For user preferences
- **CacheStorage** - For offline capabilities

### Frontend
- **Svelte** - Lightweight reactive UI framework
- **Tailwind CSS** - Utility-first styling
- **Vite** - Fast build tool and development server

## 🏗️ Architecture

PersonaWeb follows a "shell architecture" where the application shell loads quickly while the ML components progressively load in the background:

1. **Initial Load**: Lightweight shell application with loading indicators
2. **Model Loading**: Progressive loading of quantized LLM
3. **Data Analysis**: Private analysis of browser cookies and local data
4. **Content Generation**: LLM generates personalized UI and content
5. **Rendering**: Dynamic rendering of generated content

## 📋 Implementation Steps

1. **Setup Svelte with Vite**
   - Configure for optimal performance
   - Implement progressive loading patterns

2. **Integrate WebLLM/Transformers.js**
   - Setup model loading pipeline
   - Configure Web Workers for non-blocking execution

3. **Implement Cookie/Cache Analysis**
   - Create privacy-preserving data collection utilities
   - Build preference extraction pipeline

4. **Design Content Generation System**
   - Create prompts for the LLM to generate website components
   - Implement rendering system for LLM-generated content

5. **Optimize Performance**
   - Implement chunked loading of model weights
   - Setup IndexedDB for caching generated content
   - Configure WebGPU/WebGL acceleration

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/nicksimpkins/evoweb.git

# Navigate to project directory
cd evoweb

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run containerized version
docker-compose up
```

## 🔒 Privacy Considerations

PersonaWeb is designed with privacy as a core principle:
- No data leaves the user's device
- All processing happens locally
- Clear user consent flows are implemented
- Easy opt-out mechanisms are available

## 🧩 Use Cases

- **E-commerce**: Personalized shopping experiences
- **Content Platforms**: Tailored reading/viewing experiences
- **Documentation Sites**: Customized learning paths
- **Dashboards**: User-specific information layouts

## 📝 License

This project uses a dual licensing model:

- **For individuals and non-commercial use**: [MIT License](LICENSE-MIT.md)
- **For commercial use**: Please contact for licensing terms at nsimpkins@hawk.iit.edu

Any use of this software in a commercial setting or by a commercial entity requires a paid commercial license.

---

*Evoweb, the next step in web evolution*