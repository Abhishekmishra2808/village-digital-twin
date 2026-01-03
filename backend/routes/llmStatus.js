import express from 'express';
import { checkLocalLLMStatus, ensureModelAvailable } from '../utils/localLLMService.js';

const router = express.Router();

// Check local LLM status
router.get('/status', async (req, res) => {
  try {
    const status = await checkLocalLLMStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({
      available: false,
      error: error.message
    });
  }
});

// Ensure model is downloaded
router.post('/setup', async (req, res) => {
  try {
    const { model } = req.body;
    const success = await ensureModelAvailable(model);
    
    if (success) {
      res.json({
        success: true,
        message: 'Model is ready',
        model: model || process.env.LOCAL_LLM_MODEL || 'llama3.2:3b'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to setup model'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
