import { Ollama } from 'ollama';

// Initialize Ollama client
const ollama = new Ollama({ host: process.env.OLLAMA_HOST || 'http://localhost:11434' });

// Default model - can be changed via environment variable
const DEFAULT_MODEL = process.env.LOCAL_LLM_MODEL || 'llama3.2:3b';

/**
 * Process citizen feedback using local LLM (Ollama)
 * This ensures complete privacy - no data leaves the local machine
 * 
 * @param {string} rawComment - The raw citizen feedback
 * @param {number} rating - Rating given by citizen (1-5)
 * @param {string} schemeName - Name of the scheme
 * @returns {Promise<Object>} Analysis result with anonymized summary
 */
export async function processFeedbackWithLocalLLM(rawComment, rating, schemeName) {
  try {
    console.log(`🤖 Processing feedback with LOCAL LLM (${DEFAULT_MODEL}) for: ${schemeName}`);
    
    const prompt = `You are analyzing citizen feedback for a government scheme. The citizen has rated the scheme ${rating}/5 stars and provided this comment:

"${rawComment}"

Scheme Name: ${schemeName}

CRITICAL: You must completely anonymize this feedback by:
- Removing ALL names (first names, last names, nicknames)
- Removing ALL addresses (house numbers, street names, localities)
- Removing ALL personal identifiers
- Making the language neutral and professional
- Converting "I" or personal pronouns to third-person descriptions

Please analyze this feedback and provide:
1. A professional, anonymized summary (remove any identifying information like names, personal details, or writing style markers)
2. Main concerns or issues mentioned (as bullet points)
3. Sentiment classification (Positive/Neutral/Negative/Critical)
4. Issue categories (select all that apply: Quality, Delay, Budget, Vendor, Communication, Accessibility, Other)
5. Urgency level (Low/Medium/High/Critical)

Format your response as JSON:
{
  "summary": "Brief professional summary in 2-3 sentences - MUST BE FULLY ANONYMIZED",
  "concerns": ["concern 1", "concern 2", "concern 3"],
  "sentiment": "Positive/Neutral/Negative/Critical",
  "categories": ["Quality", "Delay"],
  "urgency": "Low/Medium/High/Critical",
  "suggestedRating": 3
}

Important:
- NEVER include any names, addresses, or personal identifiers in your response
- Replace specific people with general terms like "contractor", "resident", "neighbor"
- Make the summary professional and objective
- Focus on actionable issues
- If the comment is in a language other than English, translate to English
- Suggested rating should align with the sentiment (1-5 scale)

Example:
Input: "My name is John from house 45. Contractor Mr. Smith is doing bad work."
Output: "Resident reported concerns about contractor work quality requiring attention."

Respond ONLY with the JSON object, no additional text.`;

    // Call local Ollama API
    const response = await ollama.generate({
      model: DEFAULT_MODEL,
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.3, // Low temperature for consistent, factual output
        top_p: 0.9,
        top_k: 40,
      }
    });

    const text = response.response.trim();
    console.log('🤖 Local LLM Response:', text);

    // Extract JSON from response (remove markdown code blocks if present)
    let jsonText = text;
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '').trim();
    }

    // Try to find JSON object in the response
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const aiAnalysis = JSON.parse(jsonMatch[0]);
      
      // Verify that we have required fields
      if (!aiAnalysis.summary || !aiAnalysis.concerns || !aiAnalysis.sentiment) {
        throw new Error('Missing required fields in LLM response');
      }

      console.log('✅ Local LLM Anonymized Summary:', aiAnalysis.summary);
      
      return {
        success: true,
        analysis: {
          summary: aiAnalysis.summary,
          concerns: aiAnalysis.concerns || [],
          sentiment: aiAnalysis.sentiment || 'Neutral',
          categories: aiAnalysis.categories || ['Other'],
          urgency: aiAnalysis.urgency || 'Medium',
          suggestedRating: aiAnalysis.suggestedRating || rating
        }
      };
    }

    throw new Error('Could not parse Local LLM response as JSON');

  } catch (error) {
    console.error('❌ Local LLM Error:', error.message || error);
    
    // Fallback to basic processing - NEVER expose raw comment
    return {
      success: false,
      analysis: {
        summary: `Feedback received with ${rating}/5 rating. Local LLM processing temporarily unavailable. General ${rating >= 4 ? 'positive' : rating >= 3 ? 'neutral' : 'negative'} sentiment detected.`,
        concerns: ['Local LLM processing unavailable', 'Manual review required'],
        sentiment: rating >= 4 ? 'Positive' : rating >= 3 ? 'Neutral' : 'Negative',
        categories: ['Other'],
        urgency: rating <= 2 ? 'High' : 'Medium',
        suggestedRating: rating
      }
    };
  }
}

/**
 * Check if Ollama is running and the model is available
 * @returns {Promise<Object>} Status information
 */
export async function checkLocalLLMStatus() {
  try {
    const models = await ollama.list();
    const hasModel = models.models.some(m => m.name.includes(DEFAULT_MODEL.split(':')[0]));
    
    return {
      available: true,
      host: process.env.OLLAMA_HOST || 'http://localhost:11434',
      model: DEFAULT_MODEL,
      modelInstalled: hasModel,
      totalModels: models.models.length
    };
  } catch (error) {
    return {
      available: false,
      error: error.message,
      host: process.env.OLLAMA_HOST || 'http://localhost:11434',
      model: DEFAULT_MODEL
    };
  }
}

/**
 * Download/pull a model if not available
 * @param {string} modelName - Name of the model to pull
 * @returns {Promise<boolean>} Success status
 */
export async function ensureModelAvailable(modelName = DEFAULT_MODEL) {
  try {
    console.log(`📥 Checking if model ${modelName} is available...`);
    
    const models = await ollama.list();
    const hasModel = models.models.some(m => m.name.includes(modelName.split(':')[0]));
    
    if (hasModel) {
      console.log(`✅ Model ${modelName} is already available`);
      return true;
    }
    
    console.log(`📥 Pulling model ${modelName}... This may take a while.`);
    await ollama.pull({ model: modelName, stream: false });
    console.log(`✅ Model ${modelName} successfully downloaded`);
    
    return true;
  } catch (error) {
    console.error(`❌ Failed to ensure model availability:`, error.message);
    return false;
  }
}
