import type { Request, Response } from "express";
import axios from "axios";

export const listAvailableModels = async (req: Request, res: Response) => {
  try {
    const ollamaUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
    
    console.log("🔍 Fetching available models from Ollama:", ollamaUrl);
    
    // Call Ollama API to list models
    const response = await axios.get(`${ollamaUrl}/api/tags`, {
      timeout: 5000,
    });

    const models = response.data.models || [];
    
    console.log("✅ Found models:", models.length);
    
    // Map to our format with friendly names
    const availableModels = models.map((model: any) => {
      const name = model.name.toLowerCase();
      
      // Determine model type and friendly name
      let type = "llama";
      let displayName = model.name;
      
      if (name.includes("llama")) {
        type = "llama";
        displayName = `LLaMA ${model.name}`;
      } else if (name.includes("mistral")) {
        type = "mistral";
        displayName = `Mistral ${model.name}`;
      } else if (name.includes("deepseek")) {
        type = "deepseek";
        displayName = `DeepSeek ${model.name}`;
      } else if (name.includes("phi")) {
        type = "phi3";
        displayName = `Phi-3 ${model.name}`;
      } else if (name.includes("gemma")) {
        type = "gemma";
        displayName = `Gemma ${model.name}`;
      }
      
      return {
        id: model.name,
        type,
        name: displayName,
        size: model.size,
        modified: model.modified_at,
      };
    });

    res.json({
      models: availableModels,
      count: availableModels.length,
    });
  } catch (error) {
    console.error("❌ Error fetching models:", error);
    
    // Return default models if Ollama is not available
    res.json({
      models: [
        {
          id: "llama3:8b",
          type: "llama",
          name: "LLaMA 3 8B",
          size: 0,
          modified: new Date().toISOString(),
        },
        {
          id: "mistral:7b",
          type: "mistral",
          name: "Mistral 7B",
          size: 0,
          modified: new Date().toISOString(),
        },
        {
          id: "deepseek-r1:8b",
          type: "deepseek",
          name: "DeepSeek R1 8B",
          size: 0,
          modified: new Date().toISOString(),
        },
      ],
      count: 3,
      fallback: true,
    });
  }
};
