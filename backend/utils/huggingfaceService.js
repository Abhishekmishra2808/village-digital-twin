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

IMPORTANT: Create a NEW anonymized summary based on the ORIGINAL FEEDBACK above, not the example text.

Return ONLY a JSON object with this exact structure:
{
  "summary": "Write the anonymized version of the actual feedback here, preserving the core message while removing any personal information",
  "sentiment": "Positive, Negative, or Neutral",
  "concerns": ["list of specific concerns mentioned in the feedback"],
  "categories": ["relevant categories like Budget, Quality, Timeline, Implementation, Communication"],
  "urgency": "Low, Medium, High, or Critical"
}

Rules for creating the anonymized summary:
- Replace actual names with [PERSON]
- Replace villages/locations with [VILLAGE] or [DISTRICT]
- Replace phone/ID numbers with [CONTACT] or [ID]
- Keep the core message and details intact
- Write in third person perspective
- Make it professional and clear`;

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

    // Clean and prepare text - focus on first 4000 chars for better context
    const cleanedText = pdfText
      .replace(/\s+/g, ' ')  // normalize whitespace
      .replace(/[^\x20-\x7E\n]/g, '')  // remove non-printable chars
      .trim();

    const prompt = `You are an expert government document analyzer. Extract scheme details with high precision.

DOCUMENT TEXT:
${cleanedText.substring(0, 4000)}

IMPORTANT INSTRUCTIONS:
1. READ THE ENTIRE TEXT CAREFULLY before extracting
2. For NAME: Find the official scheme/project/yojana title (usually at the top or in headers)
3. For BUDGET: Look for amounts in crores/lakhs/rupees - extract the NUMBER only
4. For CATEGORY: Choose ONE from: Sanitation, Water Supply, Housing, Employment, Power, Roads, Healthcare, Education, Agriculture, Infrastructure, Welfare
5. For DESCRIPTION: Summarize the main objective in 2-3 clear sentences
6. For DATES: Look for start/end dates, project duration, implementation timeline
7. For VILLAGE/DISTRICT: Extract exact location names mentioned
8. For TARGET BENEFICIARIES: Who will benefit? (e.g., "Rural households", "Farmers", "School children")

Return ONLY a valid JSON object (no markdown, no extra text):
{
  "name": "Full official scheme name from document",
  "category": "One of the categories listed above",
  "totalBudget": 0,
  "description": "Clear 2-3 sentence description of the scheme's purpose",
  "village": "Village name or NA",
  "district": "District name or NA",
  "targetBeneficiaries": "Who benefits from this scheme",
  "implementationArea": "Village/District/State/National",
  "startDate": "YYYY-MM-DD or null",
  "endDate": "YYYY-MM-DD or null"
}

EXAMPLE (DO NOT COPY, extract from actual document):
If document says "Swachh Bharat Mission - Rs. 500 crore for building toilets in rural areas", return:
{
  "name": "Swachh Bharat Mission",
  "category": "Sanitation",
  "totalBudget": 5000000000,
  "description": "Initiative to construct household toilets in rural areas to improve sanitation and public health.",
  ...
}`;

    const response = await client.chatCompletion({
      model: "meta-llama/Llama-3.1-8B-Instruct",
      messages: [
        { role: "system", content: "You are a precise document extraction AI. Analyze carefully and return only valid JSON." },
        { role: "user", content: prompt }
      ],
      max_tokens: 800,
      temperature: 0.1  // Lower temperature for more deterministic/accurate extraction
    });

    const rawResponse = response.choices[0].message.content.trim();
    console.log('📄 LLM Raw Response Length:', rawResponse.length, 'chars');
    
    // Extract JSON from response (handle cases where model adds text before/after JSON)
    let jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? jsonMatch[0] : rawResponse;
    
    let schemeData;
    try {
      schemeData = JSON.parse(jsonText);
      console.log('✅ LLM parsed successfully:', {
        name: schemeData.name ? 'Found' : 'MISSING',
        budget: schemeData.totalBudget ? 'Found' : 'MISSING',
        category: schemeData.category ? 'Found' : 'MISSING'
      });
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError.message);
      console.log('📝 Failed JSON text:', jsonText.substring(0, 200));
      throw new Error('Failed to parse LLM response as JSON');
    }

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

Analyze the vendor report carefully and return ONLY a valid JSON object:
{
  "complianceScore": 0-100,
  "discrepancies": [
    {
      "category": "budget or timeline or quality or scope",
      "severity": "critical or high or medium or low",
      "description": "Clear description of the issue",
      "plannedValue": "What was planned",
      "actualValue": "What was reported"
    }
  ],
  "completionPercentage": 0-100,
  "redFlags": ["list of red flags"],
  "summary": "Brief 2-3 sentence summary of compliance",
  "phase": 1,
  "workCompleted": "Description of work completed",
  "expenseClaimed": 0,
  "overdueWork": [
    {
      "task": "Task name",
      "plannedDate": "YYYY-MM-DD",
      "currentStatus": "Status description",
      "delayDays": 0
    }
  ]
}

IMPORTANT:
- discrepancies MUST be an array of objects with all 5 fields
- If no discrepancies, return empty array: []
- Ensure all numbers are valid integers
- No markdown, no extra text, ONLY valid JSON`;

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
    console.log('📄 LLM Vendor Analysis Response Length:', rawResponse.length, 'chars');
    
    // Extract JSON from response
    let jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? jsonMatch[0] : rawResponse;
    
    let analysisResult;
    try {
      analysisResult = JSON.parse(jsonText);
      
      // Transform and validate the response to match schema
      const transformed = {
        overallCompliance: Math.min(100, Math.max(0, parseInt(analysisResult.complianceScore) || 0)),
        matchingItems: analysisResult.matchingItems || [],
        discrepancies: (analysisResult.discrepancies || []).map(d => {
          // If discrepancy is a string, convert to object
          if (typeof d === 'string') {
            return {
              category: 'scope',
              severity: 'medium',
              description: d,
              plannedValue: 'N/A',
              actualValue: 'N/A'
            };
          }
          // Ensure all required fields exist
          return {
            category: d.category || 'scope',
            severity: d.severity || 'medium',
            description: d.description || d.toString(),
            plannedValue: d.plannedValue || 'N/A',
            actualValue: d.actualValue || 'N/A'
          };
        }),
        overdueWork: (analysisResult.overdueWork || []).map(w => ({
          task: w.task || w.toString(),
          plannedDate: w.plannedDate || '',
          currentStatus: w.currentStatus || 'Unknown',
          delayDays: parseInt(w.delayDays) || 0
        })),
        budgetAnalysis: {
          plannedBudget: parseInt(analysisResult.plannedBudget) || 0,
          claimedExpense: parseInt(analysisResult.expenseClaimed) || 0,
          variance: 0,
          variancePercentage: 0
        },
        aiSummary: analysisResult.summary || 'Analysis completed',
        aiProcessed: true,
        // Additional fields for route handling
        phase: parseInt(analysisResult.phase) || 1,
        workCompleted: analysisResult.workCompleted || 'Work completed as reported',
        expenseClaimed: parseInt(analysisResult.expenseClaimed) || 0,
        completionPercentage: Math.min(100, Math.max(0, parseInt(analysisResult.completionPercentage) || 0))
      };
      
      // Calculate budget variance
      if (transformed.budgetAnalysis.plannedBudget > 0) {
        transformed.budgetAnalysis.variance = transformed.budgetAnalysis.claimedExpense - transformed.budgetAnalysis.plannedBudget;
        transformed.budgetAnalysis.variancePercentage = Math.round(
          (transformed.budgetAnalysis.variance / transformed.budgetAnalysis.plannedBudget) * 100
        );
      }
      
      console.log('✅ Vendor analysis transformed:', {
        compliance: transformed.overallCompliance,
        discrepancies: transformed.discrepancies.length,
        phase: transformed.phase
      });
      
      analysisResult = transformed;
      
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError.message);
      console.log('📝 Failed JSON text:', jsonText.substring(0, 200));
      throw new Error('Failed to parse vendor analysis response');
    }

    console.log('✅ Vendor report analysis completed using Llama 3.1-8B');
    
    return analysisResult;
  } catch (error) {
    console.error('❌ Error in analyzeVendorReport:', error.message);
    throw new Error(`Failed to analyze vendor report: ${error.message}`);
  }
}

/**
 * Anonymize citizen report and extract intent/problem using Llama 3.1-8B-Instruct
 * @param {string} title - Original report title
 * @param {string} description - Original report description
 * @param {string} category - Report category
 * @param {string} location - Location information
 * @returns {Promise<Object>} Anonymized report with extracted intent
 */
export async function anonymizeAndExtractIntent(title, description, category, location) {
  try {
    const client = getHfClient();
    
    const prompt = `You are an AI system that processes citizen grievance reports for a village governance system. Your tasks are:

1. ANONYMIZE: Remove ALL personally identifiable information (PII):
   - Names of people (replace with [CITIZEN], [OFFICIAL], etc.)
   - Phone numbers (replace with [PHONE])
   - Email addresses (replace with [EMAIL])
   - Specific addresses/house numbers (replace with [ADDRESS])
   - Aadhaar/ID numbers (replace with [ID])
   - Bank account details (replace with [BANK_INFO])
   - Any identifying personal details

2. EXTRACT: Identify the core problem and intent:
   - What is the main issue?
   - What action is being requested?
   - Who/what is affected?
   - What is the urgency level?

3. CATEGORIZE: Determine the problem category and severity

ORIGINAL REPORT:
Title: ${title}
Category: ${category}
Location: ${location}
Description: ${description}

Return ONLY a valid JSON object with this structure:
{
  "anonymizedTitle": "Title with all PII removed, keeping the core issue",
  "anonymizedDescription": "Full description with all PII removed",
  "extractedIntent": "Clear 1-2 sentence summary of what the citizen wants/needs",
  "problemSummary": "Brief summary of the core problem",
  "problemCategory": "One of: road, water, power, waste, healthcare, education, corruption, safety, other",
  "severity": "One of: low, medium, high, critical",
  "affectedArea": "General area description (anonymized)",
  "keywords": ["list", "of", "relevant", "keywords"],
  "actionRequired": "What action needs to be taken",
  "piiRemoved": ["list of types of PII that were removed, e.g., 'name', 'phone'"],
  "confidence": 0.0-1.0
}

Rules:
- Preserve the meaning and urgency of the report
- Keep location at area/village level, not specific addresses
- Ensure the anonymized version still provides enough detail for officials to act
- Be conservative - if unsure if something is PII, remove it`;

    const response = await client.chatCompletion({
      model: "meta-llama/Llama-3.1-8B-Instruct",
      messages: [
        { role: "system", content: "You are a privacy-focused AI assistant that anonymizes citizen reports while preserving essential information. Return only valid JSON." },
        { role: "user", content: prompt }
      ],
      max_tokens: 800,
      temperature: 0.2 // Low temperature for consistent anonymization
    });

    const rawResponse = response.choices[0].message.content.trim();
    
    // Extract JSON from response
    let jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? jsonMatch[0] : rawResponse;
    
    let result;
    try {
      result = JSON.parse(jsonText);
    } catch (parseError) {
      console.warn('⚠️ Failed to parse anonymization response, using fallback');
      // Fallback: Basic regex-based anonymization
      const anonymizedDesc = description
        .replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[CITIZEN]')
        .replace(/\b\d{10}\b/g, '[PHONE]')
        .replace(/\b\d{12}\b/g, '[ID]')
        .replace(/\b[\w.-]+@[\w.-]+\.\w+\b/g, '[EMAIL]')
        .replace(/house\s*(?:no\.?|number)?\s*\d+/gi, '[ADDRESS]');
      
      result = {
        anonymizedTitle: title.replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[CITIZEN]'),
        anonymizedDescription: anonymizedDesc,
        extractedIntent: `Citizen reports issue related to ${category}`,
        problemSummary: description.substring(0, 100),
        problemCategory: category || 'other',
        severity: 'medium',
        affectedArea: location || 'Unknown area',
        keywords: [category],
        actionRequired: 'Review and address citizen concern',
        piiRemoved: ['potential_names'],
        confidence: 0.5
      };
    }

    console.log('✅ Report anonymized successfully using Llama 3.1-8B');
    
    return {
      success: true,
      ...result,
      model: 'meta-llama/Llama-3.1-8B-Instruct',
      processedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Error in anonymizeAndExtractIntent:', error.message);
    throw new Error(`Failed to anonymize report: ${error.message}`);
  }
}

/**
 * Verify if a report is legitimate based on content analysis
 * @param {string} description - Report description
 * @returns {Promise<Object>} Legitimacy analysis
 */
export async function analyzeReportLegitimacy(description) {
  try {
    const client = getHfClient();
    
    const prompt = `Analyze this citizen grievance report for legitimacy indicators.

REPORT: ${description}

Evaluate:
1. Does it describe a real, actionable issue?
2. Is there enough detail to investigate?
3. Are there signs of spam, abuse, or false reporting?
4. Is the language appropriate and coherent?

Return ONLY a valid JSON object:
{
  "isLegitimate": true/false,
  "legitimacyScore": 0-100,
  "concerns": ["list of any concerns about the report"],
  "hasActionableContent": true/false,
  "hasEnoughDetail": true/false,
  "flaggedReasons": ["reasons if flagged as potentially false"],
  "recommendation": "approve, review, or reject"
}`;

    const response = await client.chatCompletion({
      model: "meta-llama/Llama-3.1-8B-Instruct",
      messages: [
        { role: "system", content: "You are a content moderation AI. Analyze reports objectively. Return only valid JSON." },
        { role: "user", content: prompt }
      ],
      max_tokens: 400,
      temperature: 0.3
    });

    const rawResponse = response.choices[0].message.content.trim();
    let jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? jsonMatch[0] : rawResponse;
    
    let result;
    try {
      result = JSON.parse(jsonText);
    } catch (parseError) {
      result = {
        isLegitimate: true,
        legitimacyScore: 70,
        concerns: [],
        hasActionableContent: true,
        hasEnoughDetail: description.length > 50,
        flaggedReasons: [],
        recommendation: 'approve'
      };
    }

    return {
      success: true,
      ...result,
      model: 'meta-llama/Llama-3.1-8B-Instruct'
    };
  } catch (error) {
    console.error('❌ Error in analyzeReportLegitimacy:', error.message);
    // Default to legitimate to avoid blocking valid reports
    return {
      success: false,
      isLegitimate: true,
      legitimacyScore: 60,
      concerns: ['AI analysis failed'],
      recommendation: 'review'
    };
  }
}
