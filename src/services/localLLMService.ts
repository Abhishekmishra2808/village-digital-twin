import { registerPlugin } from '@capacitor/core';

interface LocalLLMPlugin {
  anonymizeFeedback(options: { feedback: string }): Promise<{ anonymizedFeedback: string; success: boolean }>;
  checkStatus(): Promise<{ 
    isAvailable: boolean; 
    totalModels: number; 
    downloadedModels: number;
    modelName: string;
  }>;
  downloadModel(options: { modelId: string }): Promise<{ success: boolean; message: string }>;
  loadModel(options: { modelId: string }): Promise<{ success: boolean; message: string }>;
}

const LocalLLM = registerPlugin<LocalLLMPlugin>('LocalLLM');

export class LocalLLMService {
  private static modelLoaded = false;

  /**
   * Anonymize feedback text using the on-device local LLM
   */
  static async anonymizeFeedback(feedback: string): Promise<string> {
    try {
      // Check if the model is available
      const status = await LocalLLM.checkStatus();
      
      if (!status.isAvailable) {
        console.warn('Local LLM not available, using fallback anonymization');
        return this.fallbackAnonymization(feedback);
      }

      // Ensure model is loaded
      if (!this.modelLoaded) {
        await this.ensureModelReady();
      }

      // Anonymize using the local LLM
      const result = await LocalLLM.anonymizeFeedback({ feedback });
      
      if (result.success) {
        return result.anonymizedFeedback;
      } else {
        return this.fallbackAnonymization(feedback);
      }
    } catch (error) {
      console.error('Local LLM anonymization failed:', error);
      return this.fallbackAnonymization(feedback);
    }
  }

  /**
   * Check if the local LLM is available and ready
   */
  static async checkStatus() {
    try {
      return await LocalLLM.checkStatus();
    } catch (error) {
      console.error('Failed to check LLM status:', error);
      return { 
        isAvailable: false, 
        totalModels: 0, 
        downloadedModels: 0,
        modelName: 'None'
      };
    }
  }

  /**
   * Download the LLM model for local inference
   */
  static async downloadModel(modelId: string = 'smollm2-360m-q8_0'): Promise<boolean> {
    try {
      const result = await LocalLLM.downloadModel({ modelId });
      return result.success;
    } catch (error) {
      console.error('Failed to download model:', error);
      return false;
    }
  }

  /**
   * Load the model into memory
   */
  static async loadModel(modelId: string = 'smollm2-360m-q8_0'): Promise<boolean> {
    try {
      const result = await LocalLLM.loadModel({ modelId });
      if (result.success) {
        this.modelLoaded = true;
      }
      return result.success;
    } catch (error) {
      console.error('Failed to load model:', error);
      return false;
    }
  }

  /**
   * Ensure the model is downloaded and loaded
   */
  private static async ensureModelReady(): Promise<void> {
    const status = await this.checkStatus();
    
    if (status.downloadedModels === 0) {
      console.log('Downloading model...');
      await this.downloadModel();
    }
    
    console.log('Loading model into memory...');
    await this.loadModel();
  }

  /**
   * Fallback anonymization using basic regex patterns
   */
  private static fallbackAnonymization(text: string): string {
    let anonymized = text;
    
    // Replace names (basic pattern)
    anonymized = anonymized.replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[NAME]');
    
    // Replace phone numbers
    anonymized = anonymized.replace(/\b\d{10}\b/g, '[PHONE]');
    anonymized = anonymized.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]');
    
    // Replace email addresses
    anonymized = anonymized.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]');
    
    // Replace Aadhaar numbers (Indian ID)
    anonymized = anonymized.replace(/\b\d{4}\s?\d{4}\s?\d{4}\b/g, '[ID]');
    
    return anonymized;
  }
}

export default LocalLLMService;
