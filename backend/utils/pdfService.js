import { GoogleGenerativeAI } from '@google/generative-ai';
import pdfParse from 'pdf-parse-new';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyDeuF0wiOxFEJrkHJ8StvumGhN4l_Y7ocA');

/**
 * Extract structured data using regex patterns
 */
function extractWithRegex(text) {
  const extracted = {};

  // Scheme Name - look for common patterns
  const namePatterns = [
    /(?:scheme|project|program|mission|yojana|abhiyan)\s*[:\-]?\s*([^\n]{10,100})/i,
    /(?:name|title)\s*[:\-]\s*([^\n]{10,100})/i,
    /^([A-Z][^\n]{10,100}(?:Scheme|Project|Mission|Yojana|Abhiyan))/im,
  ];
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match) {
      extracted.name = match[1].trim();
      break;
    }
  }

  // Budget - look for currency amounts
  const budgetPatterns = [
    /(?:budget|cost|outlay|allocation|fund)\s*[:\-]?\s*(?:Rs\.?|₹|INR)?\s*([0-9,]+(?:\.[0-9]+)?)\s*(?:crore|cr|lakh|lakhs)?/i,
    /₹\s*([0-9,]+(?:\.[0-9]+)?)\s*(?:crore|cr|lakh|lakhs)/i,
    /(?:total|project)\s+(?:budget|cost)\s*[:\-]?\s*([0-9,]+)/i,
  ];
  for (const pattern of budgetPatterns) {
    const match = text.match(pattern);
    if (match) {
      let amount = parseFloat(match[1].replace(/,/g, ''));
      // Convert to rupees if in crores/lakhs
      if (text.toLowerCase().includes('crore')) amount *= 10000000;
      else if (text.toLowerCase().includes('lakh')) amount *= 100000;
      extracted.totalBudget = Math.floor(amount);
      break;
    }
  }

  // Dates - various formats
  const datePatterns = [
    /(?:start|commencement|from)\s+date\s*[:\-]?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i,
    /(?:end|completion|to)\s+date\s*[:\-]?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i,
    /(?:duration|period)\s*[:\-]?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})\s+to\s+(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i,
  ];
  
  const startMatch = text.match(/(?:start|commencement|from)\s+date\s*[:\-]?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i);
  if (startMatch) {
    extracted.startDate = parseDate(startMatch[1]);
  }
  
  const endMatch = text.match(/(?:end|completion|to)\s+date\s*[:\-]?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i);
  if (endMatch) {
    extracted.endDate = parseDate(endMatch[1]);
  }

  // Location - Village, District
  const villageMatch = text.match(/(?:village|gram|panchayat)\s*[:\-]?\s*([A-Z][a-zA-Z\s]{2,30})/i);
  if (villageMatch) {
    extracted.village = villageMatch[1].trim();
  }

  const districtMatch = text.match(/(?:district|dist\.?|zila)\s*[:\-]?\s*([A-Z][a-zA-Z\s]{2,30})/i);
  if (districtMatch) {
    extracted.district = districtMatch[1].trim();
  }

  // Category detection
  const categories = {
    'Sanitation': /(?:swachh|clean|sanitation|toilet|waste|garbage)/i,
    'Water Supply': /(?:water|jal|supply|pipeline|tank|drinking)/i,
    'Housing': /(?:housing|awas|shelter|home|dwelling)/i,
    'Employment': /(?:employment|rozgar|job|work|livelihood|mgnrega)/i,
    'Power': /(?:power|electricity|bijli|solar|energy)/i,
    'Roads': /(?:road|path|marg|highway|pmgsy)/i,
    'Healthcare': /(?:health|medical|hospital|clinic|ayushman)/i,
    'Education': /(?:education|school|shiksha|college|study)/i,
    'Agriculture': /(?:agriculture|farming|krishi|crop|irrigation)/i,
  };

  for (const [category, pattern] of Object.entries(categories)) {
    if (pattern.test(text)) {
      extracted.category = category;
      break;
    }
  }

  // Description - first substantial paragraph
  const descMatch = text.match(/(?:description|objective|purpose|about)\s*[:\-]?\s*([^\n]{50,500})/i);
  if (descMatch) {
    extracted.description = descMatch[1].trim();
  } else {
    // Fallback: get first long paragraph
    const paragraphs = text.split('\n').filter(p => p.trim().length > 50);
    if (paragraphs.length > 0) {
      extracted.description = paragraphs[0].trim().substring(0, 500);
    }
  }

  // Extract phases
  const phases = extractPhases(text);
  if (phases.length > 0) {
    extracted.phases = phases;
  }

  return extracted;
}

/**
 * Parse date string to YYYY-MM-DD format
 */
function parseDate(dateStr) {
  const parts = dateStr.split(/[-\/]/);
  if (parts.length === 3) {
    let day = parseInt(parts[0]);
    let month = parseInt(parts[1]);
    let year = parseInt(parts[2]);
    
    // Handle 2-digit years
    if (year < 100) {
      year += year < 50 ? 2000 : 1900;
    }
    
    // Return in YYYY-MM-DD format
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  return dateStr;
}

/**
 * Extract phase information
 */
function extractPhases(text) {
  const phases = [];
  
  // Look for phase patterns
  const phasePattern = /(?:phase|stage)\s+(\d+|I|II|III|IV|one|two|three|four)\s*[:\-]?\s*([^\n]{10,200})/gi;
  const matches = [...text.matchAll(phasePattern)];
  
  matches.forEach((match, index) => {
    const phaseNum = convertToNumber(match[1]);
    const description = match[2].trim();
    
    phases.push({
      id: phaseNum,
      name: `Phase ${phaseNum}`,
      plannedWork: description,
      milestones: [],
      deliverables: [],
      timeline: '',
      budget: 0,
      startDate: '',
      endDate: ''
    });
  });

  // If no phases found, create default 4 phases
  if (phases.length === 0) {
    for (let i = 1; i <= 4; i++) {
      phases.push({
        id: i,
        name: `Phase ${i}`,
        plannedWork: `Phase ${i} activities to be defined`,
        milestones: [],
        deliverables: [],
        timeline: '',
        budget: 0,
        startDate: '',
        endDate: ''
      });
    }
  }

  return phases;
}

/**
 * Convert phase numbers
 */
function convertToNumber(str) {
  const map = {
    'I': 1, 'II': 2, 'III': 3, 'IV': 4,
    'one': 1, 'two': 2, 'three': 3, 'four': 4
  };
  return map[str.toUpperCase()] || parseInt(str) || 1;
}

/**
 * Extract scheme details from government PDF document
 */
export async function extractSchemeFromPDF(pdfBuffer) {
  try {
    // Extract text from PDF
    const pdfData = await pdfParse(pdfBuffer);
    const pdfText = pdfData.text;

    console.log('📄 PDF Text Length:', pdfText.length, 'characters');

    // First: Extract using regex patterns (fast and reliable)
    const regexData = extractWithRegex(pdfText);
    console.log('📊 Regex Extracted:', Object.keys(regexData));

    // Second: Use LLM only for missing critical fields
    const missingFields = [];
    if (!regexData.name) missingFields.push('name');
    if (!regexData.description) missingFields.push('description');
    if (!regexData.totalBudget) missingFields.push('budget');

    let llmData = {};
    if (missingFields.length > 0) {
      console.log('🤖 Using LLM for missing fields:', missingFields);
      llmData = await extractWithLLM(pdfText, missingFields);
    }

    // Combine regex and LLM data (regex takes precedence)
    const combinedData = {
      name: regexData.name || llmData.name || 'Unnamed Scheme',
      category: regexData.category || llmData.category || 'Other',
      description: regexData.description || llmData.description || 'No description available',
      village: regexData.village || llmData.village || 'NA',
      district: regexData.district || llmData.district || 'NA',
      totalBudget: regexData.totalBudget || llmData.totalBudget || 0,
      startDate: regexData.startDate || llmData.startDate || new Date().toISOString().split('T')[0],
      endDate: regexData.endDate || llmData.endDate || new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
      phases: regexData.phases || llmData.phases || [],
      extractionConfidence: regexData.name ? 'High' : llmData.name ? 'Medium' : 'Low',
      missingFields: missingFields.filter(f => !regexData[f] && !llmData[f])
    };

    return {
      success: true,
      data: combinedData,
      rawText: pdfText.substring(0, 1000)
    };

  } catch (error) {
    console.error('❌ PDF Scheme Extraction Error:', error.message);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

/**
 * Use LLM only for missing fields
 */
async function extractWithLLM(pdfText, missingFields) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Extract ONLY these fields from the document: ${missingFields.join(', ')}

Document text (first 3000 chars):
${pdfText.substring(0, 3000)}

Return ONLY JSON with these fields:
{
  ${missingFields.includes('name') ? '"name": "scheme name",' : ''}
  ${missingFields.includes('description') ? '"description": "brief description",' : ''}
  ${missingFields.includes('budget') ? '"totalBudget": 0,' : ''}
  ${missingFields.includes('category') ? '"category": "category",' : ''}
  ${missingFields.includes('village') ? '"village": "village name",' : ''}
  ${missingFields.includes('district') ? '"district": "district name"' : ''}
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }

    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {};
  } catch (error) {
    console.error('❌ LLM Extraction Error:', error.message);
    return {};
  }
}

/**
 * Analyze vendor report against government plan
 */
export async function analyzeVendorReport(pdfBuffer, governmentPlan) {
  try {
    // Extract text from vendor report PDF
    const pdfData = await pdfParse(pdfBuffer);
    const vendorReportText = pdfData.text;

    console.log('📄 Vendor Report PDF Length:', vendorReportText.length, 'characters');

    // Use Gemini AI to compare and analyze
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are a government compliance auditor analyzing a vendor's progress report against the original government plan.

GOVERNMENT'S ORIGINAL PLAN:
Scheme: ${governmentPlan.name}
Total Budget: ₹${governmentPlan.totalBudget}
Timeline: ${governmentPlan.startDate} to ${governmentPlan.endDate}

PHASE-WISE PLAN:
${governmentPlan.phases.map((phase, idx) => `
Phase ${phase.id}: ${phase.name}
- Budget: ₹${phase.budget}
- Timeline: ${phase.startDate} to ${phase.endDate}
- Planned Work: ${phase.plannedWork || 'Not specified'}
- Milestones: ${phase.milestones?.join(', ') || 'None'}
- Deliverables: ${phase.deliverables?.join(', ') || 'None'}
`).join('\n')}

VENDOR'S SUBMITTED REPORT:
${vendorReportText.substring(0, 20000)}

Analyze the vendor report and provide:
1. Overall compliance score (0-100%)
2. What matches the plan (list specific items)
3. Discrepancies found (budget, timeline, quality, scope)
   - For each: category, severity (critical/high/medium/low), description, planned vs actual values
4. Overdue work (tasks not completed on time)
   - For each: task name, planned date, current status, delay in days
5. Budget analysis (planned vs claimed, variance)
6. Executive summary of compliance

Format your response as JSON:
{
  "overallCompliance": 85,
  "vendorName": "Extracted vendor name",
  "reportDate": "YYYY-MM-DD",
  "phase": 1,
  "workCompleted": "Summary of work vendor claims to have completed",
  "expenseClaimed": 1200000,
  "matchingItems": [
    "Item 1 completed as per plan",
    "Item 2 matches specifications"
  ],
  "discrepancies": [
    {
      "category": "budget",
      "severity": "high",
      "description": "Budget overrun in materials",
      "plannedValue": "₹500,000",
      "actualValue": "₹650,000"
    }
  ],
  "overdueWork": [
    {
      "task": "Foundation work",
      "plannedDate": "2024-10-15",
      "currentStatus": "In progress",
      "delayDays": 20
    }
  ],
  "budgetAnalysis": {
    "plannedBudget": 1000000,
    "claimedExpense": 1200000,
    "variance": 200000,
    "variancePercentage": 20
  },
  "aiSummary": "Detailed executive summary of compliance, issues found, and recommendations"
}

Be thorough, identify all discrepancies, and provide actionable insights.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('🤖 Gemini AI Response (Vendor Analysis):', text.substring(0, 500));

    // Extract JSON from response
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '').trim();
    }

    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysisData = JSON.parse(jsonMatch[0]);

      return {
        success: true,
        analysis: analysisData,
        aiProcessed: true
      };
    }

    throw new Error('Could not parse AI response');

  } catch (error) {
    console.error('❌ Vendor Report Analysis Error:', error.message);
    return {
      success: false,
      error: error.message,
      analysis: {
        overallCompliance: 0,
        matchingItems: [],
        discrepancies: [],
        overdueWork: [],
        aiSummary: 'AI analysis failed. Manual review required.',
        aiProcessed: false
      }
    };
  }
}
