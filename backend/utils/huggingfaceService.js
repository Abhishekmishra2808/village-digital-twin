import { HfInference } from '@huggingface/inference';

let hfClient = null;

/**
 * Initialize Hugging Face client with lazy initialization
 * @returns {HfInference} Hugging Face inference client
 */
function getHfClient() {
  if (!hfClient) {
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
      throw new Error('🚨 HUGGINGFACE_API_KEY not found in environment variables');
    }
    console.log(`🔑 Hugging Face API Key loaded: ${apiKey.substring(0, 4)}...${apiKey.slice(-4)}`);
    hfClient = new HfInference(apiKey);
  }
  return hfClient;
}

/**
 * Process feedback text with anonymization and analysis using Llama 3.1-8B-Instruct
 * @param {string} rawComment - Original feedback text
 * @param {number} rating - User rating (1-5)
 * @param {string} schemeName - Name of the government scheme
 * @returns {Promise<Object>} Anonymized feedback with analysis
 */
export async function processFeedbackWithAI(rawComment, rating, schemeName) {
  try {
    const client = getHfClient();
    
    const prompt = `You are an AI analyst processing citizen feedback about government schemes. Your task is to:
1. Anonymize the feedback by removing ALL personal information (names, phone numbers, addresses, emails, IDs)
2. Analyze the feedback to extract sentiment, concerns, categories, and urgency

SCHEME: ${schemeName}
RATING: ${rating}/5 stars
ORIGINAL FEEDBACK: ${rawComment}

Return ONLY a JSON object with this structure (no additional text):
{
  "summary": "Anonymized version of the feedback with PII removed",
  "sentiment": "Positive, Negative, or Neutral",
  "concerns": ["list of specific concerns mentioned"],
  "categories": ["relevant categories like Budget, Quality, Timeline, Implementation"],
  "urgency": "Low, Medium, High, or Critical"
}

Rules for anonymization:
- Replace names with [PERSON]
- Replace villages/locations with [VILLAGE]/[DISTRICT]
- Replace phone/ID numbers with [CONTACT]/[ID]
- Keep the core message intact`;

    const response = await client.chatCompletion({
      model: "meta-llama/Llama-3.1-8B-Instruct",
      messages: [
        { role: "system", content: "You are a feedback analysis assistant. Return only valid JSON with no additional text." },
        { role: "user", content: prompt }
      ],
      max_tokens: 600,
      temperature: 0.3
    });

    const rawResponse = response.choices[0].message.content.trim();
    
    // Extract JSON from response
    let jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? jsonMatch[0] : rawResponse;
    
    let analysis;
    try {
      analysis = JSON.parse(jsonText);
    } catch (parseError) {
      console.warn('⚠️ Failed to parse LLM response, using fallback');
      analysis = {
        summary: rawComment.replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[PERSON]')
                          .replace(/\b\d{10}\b/g, '[CONTACT]')
                          .replace(/\b\d{12}\b/g, '[ID]'),
        sentiment: rating >= 4 ? 'Positive' : rating <= 2 ? 'Negative' : 'Neutral',
        concerns: ['General feedback provided'],
        categories: ['General'],
        urgency: rating <= 2 ? 'High' : 'Medium'
      };
    }

    console.log('✅ Feedback processed successfully using Llama 3.1-8B');
    
    return {
      success: true,
      analysis,
      model: 'meta-llama/Llama-3.1-8B-Instruct',
      processingTime: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Error in processFeedbackWithAI:', error.message);
    throw new Error(`Failed to process feedback: ${error.message}`);
  }
}

/**
 * Extract scheme details from PDF text using Llama 3.1-8B-Instruct
 * @param {string} pdfText - Extracted text from PDF
 * @returns {Promise<Object>} Structured scheme data
 */
export async function extractSchemeWithLLM(pdfText) {
  try {
    const client = getHfClient();

    const prompt = `You are a document analysis AI specialized in extracting government scheme details from official documents.

Extract the following information from this government scheme document:

DOCUMENT TEXT:
${pdfText.substring(0, 3000)}

Extract and return ONLY a JSON object with these fields (no additional text):
{
  "name": "scheme name",
  "category": "category (agriculture/education/healthcare/infrastructure/welfare)",
  "budget": "budget amount in crores",
  "description": "brief description (2-3 sentences)",
  "targetBeneficiaries": "who is eligible",
  "implementationArea": "state/district/national",
  "startDate": "YYYY-MM-DD or null",
  "endDate": "YYYY-MM-DD or null"
}

If any field is not found, use null. Ensure valid JSON format.`;

    const response = await client.chatCompletion({
      model: "meta-llama/Llama-3.1-8B-Instruct",
      messages: [
        { role: "system", content: "You are a document extraction assistant. Return only valid JSON with no additional text." },
        { role: "user", content: prompt }
      ],
      max_tokens: 600,
      temperature: 0.2
    });

    const rawResponse = response.choices[0].message.content.trim();
    
    // Extract JSON from response (handle cases where model adds text before/after JSON)
    let jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? jsonMatch[0] : rawResponse;
    
    const schemeData = JSON.parse(jsonText);

    console.log('✅ PDF scheme extraction completed using Llama 3.1-8B');
    
    return schemeData;
  } catch (error) {
    console.error('❌ Error in extractSchemeWithLLM:', error.message);
    throw new Error(`Failed to extract scheme data: ${error.message}`);
  }
}

/**
 * Analyze vendor report against government plan using Llama 3.1-8B-Instruct
 * @param {string} vendorReportText - Extracted vendor report text
 * @param {Object} governmentPlan - Parsed government plan data
 * @returns {Promise<Object>} Analysis results
 */
export async function analyzeVendorReport(vendorReportText, governmentPlan) {
  try {
    const client = getHfClient();

    const prompt = `You are an auditing AI that compares vendor progress reports against official government plans.

GOVERNMENT PLAN:
- Scheme: ${governmentPlan.name || 'N/A'}
- Category: ${governmentPlan.category || 'N/A'}
- Budget: ${governmentPlan.budget || 'N/A'}
- Target Beneficiaries: ${governmentPlan.targetBeneficiaries || 'N/A'}
- Implementation Area: ${governmentPlan.implementationArea || 'N/A'}

VENDOR REPORT:
${vendorReportText.substring(0, 2500)}

Analyze the vendor report and return ONLY a JSON object with:
{
  "complianceScore": 0-100,
  "discrepancies": ["list of discrepancies found"],
  "completionPercentage": 0-100,
  "redFlags": ["list of red flags or concerns"],
  "summary": "brief 2-3 sentence summary"
}

Ensure valid JSON format with no additional text.`;

    const response = await client.chatCompletion({
      model: "meta-llama/Llama-3.1-8B-Instruct",
      messages: [
        { role: "system", content: "You are an auditing assistant. Return only valid JSON with no additional text." },
        { role: "user", content: prompt }
      ],
      max_tokens: 700,
      temperature: 0.3
    });

    const rawResponse = response.choices[0].message.content.trim();
    
    // Extract JSON from response
    let jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? jsonMatch[0] : rawResponse;
    
    const analysisResult = JSON.parse(jsonText);

    console.log('✅ Vendor report analysis completed using Llama 3.1-8B');
    
    return analysisResult;
  } catch (error) {
    console.error('❌ Error in analyzeVendorReport:', error.message);
    throw new Error(`Failed to analyze vendor report: ${error.message}`);
  }
}
