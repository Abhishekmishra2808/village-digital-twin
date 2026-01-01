import { GoogleGenerativeAI } from '@google/generative-ai';
import pdfParse from 'pdf-parse-new';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyDeuF0wiOxFEJrkHJ8StvumGhN4l_Y7ocA');

/**
 * Extract scheme details from government PDF document
 */
export async function extractSchemeFromPDF(pdfBuffer) {
  try {
    // Extract text from PDF
    const pdfData = await pdfParse(pdfBuffer);
    const pdfText = pdfData.text;

    console.log('📄 PDF Text Length:', pdfText.length, 'characters');

    // Use Gemini AI to extract structured data
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are analyzing a government scheme document. Extract all relevant information and structure it as JSON.

PDF CONTENT:
${pdfText.substring(0, 30000)} 

Extract the following information:
1. Scheme name and category (Sanitation, Water Supply, Housing, Employment, Power, Roads, Healthcare, Education, Agriculture, Other)
2. Description and objectives
3. Location details (village, district, state)
4. Budget information (total budget, phase-wise allocation)
5. Timeline (start date, end date, phase durations)
6. Phase-wise implementation plan (Phase 1, 2, 3, 4 if mentioned)
   - For each phase: name, milestones, deliverables, planned work, timeline, budget
7. Key deliverables and milestones
8. Any other important details

Format your response as JSON with this exact structure:
{
  "name": "Scheme name",
  "category": "One of: Sanitation/Water Supply/Housing/Employment/Power/Roads/Healthcare/Education/Agriculture/Other",
  "description": "Full description",
  "village": "Village name or NA",
  "district": "District name",
  "totalBudget": 5000000,
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "phases": [
    {
      "id": 1,
      "name": "Phase 1: Initial Setup",
      "milestones": ["Milestone 1", "Milestone 2"],
      "deliverables": ["Deliverable 1", "Deliverable 2"],
      "plannedWork": "Description of work planned in this phase",
      "timeline": "3 months",
      "budget": 1250000,
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD"
    }
  ],
  "extractionConfidence": "High/Medium/Low",
  "missingFields": ["field1", "field2"]
}

IMPORTANT:
- Extract dates in YYYY-MM-DD format
- Budget values as numbers (no currency symbols)
- Create 4 phases if not explicitly mentioned, distribute work logically
- If information is missing, use "NA" or reasonable defaults
- Be thorough in extracting milestones and deliverables
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('🤖 Gemini AI Response (Scheme Extraction):', text.substring(0, 500));

    // Extract JSON from response
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '').trim();
    }

    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const extractedData = JSON.parse(jsonMatch[0]);

      return {
        success: true,
        data: extractedData,
        rawText: pdfText.substring(0, 1000) // For debugging
      };
    }

    throw new Error('Could not parse AI response');

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
