import { GoogleGenerativeAI } from '@google/generative-ai';
import pdfParse from 'pdf-parse-new';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

    // Use LLM as PRIMARY method for accurate extraction
    console.log('🤖 Using LLM (Gemini AI) for comprehensive extraction...');
    const llmData = await extractSchemeWithLLM(pdfText);

    // Fallback: Use regex only if LLM fails
    let finalData = llmData;
    if (!llmData.name || !llmData.totalBudget) {
      console.log('⚠️ LLM extraction incomplete, using regex fallback...');
      const regexData = extractWithRegex(pdfText);
      
      finalData = {
        name: llmData.name || regexData.name || 'Unnamed Scheme',
        category: llmData.category || regexData.category || 'Other',
        description: llmData.description || regexData.description || 'No description available',
        village: llmData.village || regexData.village || 'NA',
        district: llmData.district || regexData.district || 'NA',
        totalBudget: llmData.totalBudget || regexData.totalBudget || 0,
        startDate: llmData.startDate || regexData.startDate || new Date().toISOString().split('T')[0],
        endDate: llmData.endDate || regexData.endDate || new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
        phases: llmData.phases || regexData.phases || [],
        extractionConfidence: llmData.name ? 'High' : 'Medium'
      };
    }

    return {
      success: true,
      data: finalData,
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
 * Use LLM to extract ALL scheme details accurately
 */
async function extractSchemeWithLLM(pdfText) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are a government document analyzer. Extract COMPLETE and ACCURATE details from this scheme document.

CRITICAL INSTRUCTIONS FOR BUDGET:
- Look for "Total Budget", "Total Allocation", "Project Cost", "Outlay"
- Budget format: "Rs. 75,00,000" or "₹75 lakh" or "75 lakhs" or "7.5 crore"
- Convert ALL amounts to RUPEES (multiply lakhs by 100000, crores by 10000000)
- Return ONLY the final rupee amount as a NUMBER (no commas, no text)
- Example: "Rs. 75,00,000" → return 7500000
- Example: "75 lakh rupees" → return 7500000
- Example: "7.5 crore" → return 75000000

CRITICAL INSTRUCTIONS FOR SCHEME NAME:
- Extract the EXACT official scheme name
- Usually appears near the top as "SCHEME NAME:", "PROJECT:", "SCHEME:"
- Do NOT extract descriptions, summaries, or lines with "=====" symbols
- Should be a proper title, typically 3-15 words

CRITICAL INSTRUCTIONS FOR PHASES:
- Look for "PHASE 1", "PHASE 2", "Phase-wise", "Implementation Plan"
- Extract phase number, timeline, budget, and planned work/activities
- Each phase should have: id, name, timeline, budget, plannedWork

Document Text:
${pdfText.substring(0, 15000)}

Return ONLY valid JSON in this EXACT format (no additional text):
{
  "name": "Full exact scheme name from document",
  "category": "One of: Sanitation, Water Supply, Housing, Employment, Power, Roads, Healthcare, Education, Agriculture, Other",
  "description": "Brief 2-3 sentence description of the scheme objectives",
  "village": "Village name",
  "district": "District name",
  "totalBudget": 7500000,
  "startDate": "2025-01-01",
  "endDate": "2025-12-31",
  "phases": [
    {
      "id": 1,
      "name": "Phase 1",
      "timeline": "Jan-Mar 2025",
      "budget": 2000000,
      "plannedWork": "Detailed description of Phase 1 activities, deliverables, milestones",
      "startDate": "2025-01-01",
      "endDate": "2025-03-31"
    }
  ]
}

IMPORTANT:
- totalBudget MUST be a pure number in rupees (no commas, no text)
- Dates in YYYY-MM-DD format
- If budget is in lakhs/crores, convert to rupees
- Extract ALL phases mentioned in document
- Be accurate, don't make up information`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('🤖 LLM Raw Response:', text.substring(0, 500));

    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '').trim();
    }

    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const extracted = JSON.parse(jsonMatch[0]);
      
      // Ensure totalBudget is a number
      if (extracted.totalBudget && typeof extracted.totalBudget === 'string') {
        extracted.totalBudget = parseInt(extracted.totalBudget.replace(/,/g, ''));
      }
      
      // Ensure phase budgets are numbers
      if (extracted.phases && Array.isArray(extracted.phases)) {
        extracted.phases = extracted.phases.map(phase => ({
          ...phase,
          budget: typeof phase.budget === 'string' ? 
                  parseInt(phase.budget.replace(/,/g, '')) : phase.budget,
          spent: 0,
          progress: 0,
          status: 'not-started'
        }));
      }

      console.log('✅ LLM Extracted - Name:', extracted.name, '| Budget:', extracted.totalBudget);
      return extracted;
    }

    throw new Error('Could not parse LLM response');
  } catch (error) {
    console.error('❌ LLM Extraction Error:', error.message);
    return {
      name: null,
      category: null,
      description: null,
      village: null,
      district: null,
      totalBudget: null,
      startDate: null,
      endDate: null,
      phases: []
    };
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

CRITICAL ANALYSIS INSTRUCTIONS:

1. BUDGET PARSING:
   - Look for "Total Expenses", "Amount Claimed", "Budget Utilized", "Actual Spending"
   - Convert lakhs/crores to rupees: 1 lakh = 100,000, 1 crore = 10,000,000
   - Return pure numbers (no commas, no text)
   - Example: "Rs. 8,50,000" → 850000
   - Example: "29.80 lakh" → 2980000

2. COMPLIANCE SCORING:
   - 90-100%: Excellent compliance, minor/no issues
   - 70-89%: Good compliance, some delays/issues
   - 50-69%: Moderate compliance, significant issues
   - Below 50%: Poor compliance, major problems

3. DISCREPANCY DETECTION:
   - Compare planned vs actual for: budget, timeline, quality, scope
   - Severity: critical (project risk), high (major concern), medium (notable), low (minor)
   - Be specific with numbers and dates

4. OVERDUE WORK:
   - Calculate actual delay in days from planned date
   - Current status: completed, in-progress, not-started, delayed

Analyze thoroughly and provide COMPLETE JSON (no additional text):

{
  "overallCompliance": 75,
  "vendorName": "Exact vendor name from report",
  "reportDate": "YYYY-MM-DD",
  "phase": 1,
  "workCompleted": "Detailed summary of what vendor claims completed",
  "expenseClaimed": 2980000,
  "matchingItems": [
    "Specific item/task completed as per plan",
    "Another matching deliverable"
  ],
  "discrepancies": [
    {
      "category": "budget",
      "severity": "high",
      "description": "Clear description of budget issue",
      "plannedValue": "₹25,00,000",
      "actualValue": "₹29,80,000"
    },
    {
      "category": "timeline",
      "severity": "medium",
      "description": "Delay in completion",
      "plannedValue": "June 30, 2025",
      "actualValue": "August 15, 2025 (45 days delay)"
    },
    {
      "category": "quality",
      "severity": "critical",
      "description": "Units failed inspection",
      "plannedValue": "100% pass rate",
      "actualValue": "3 units demolished due to quality issues"
    }
  ],
  "overdueWork": [
    {
      "task": "Specific task name",
      "plannedDate": "2025-06-15",
      "currentStatus": "in-progress",
      "delayDays": 30
    }
  ],
  "budgetAnalysis": {
    "plannedBudget": 2500000,
    "claimedExpense": 2980000,
    "variance": 480000,
    "variancePercentage": 19.2
  },
  "aiSummary": "Comprehensive executive summary covering: 1) Overall progress status 2) Major achievements 3) Critical issues/risks 4) Budget concerns 5) Recommendations"
}

IMPORTANT:
- All budget amounts as NUMBERS in rupees (no commas)
- Dates in YYYY-MM-DD format
- Be thorough - identify ALL discrepancies mentioned
- Compare actual vs planned carefully
- Provide actionable insights`;

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
