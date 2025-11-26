import pdfParse from 'pdf-parse-new';
import pathwayClient from './pathwayClient.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Extract scheme details from PDF using Pathway RAG
 * Pathway indexes the PDF content and provides intelligent extraction
 */
export async function extractSchemeFromPDFWithPathway(pdfBuffer, pdfFileName) {
  try {
    // Step 1: Extract text from PDF
    const pdfData = await pdfParse(pdfBuffer);
    const pdfText = pdfData.text;

    console.log('📄 PDF Text Length:', pdfText.length, 'characters');
    console.log('🔍 Using Pathway RAG for intelligent extraction...');

    // Step 2: Use Pathway RAG to extract structured information
    // Send multiple targeted queries to Pathway to extract different fields
    const extractionQueries = [
      {
        field: 'name',
        query: `What is the exact official name or title of this government scheme or project? Extract only the scheme name, nothing else.`
      },
      {
        field: 'category',
        query: `What category does this scheme belong to? Options: Sanitation, Water Supply, Housing, Employment, Power, Roads, Healthcare, Education, Agriculture, or Other. Return only the category name.`
      },
      {
        field: 'description',
        query: `Provide a brief 2-3 sentence description of the scheme's objectives and purpose.`
      },
      {
        field: 'location',
        query: `What is the village name and district name for this scheme? Return in format: Village: [name], District: [name]`
      },
      {
        field: 'budget',
        query: `What is the total budget or project cost mentioned? Extract the amount and convert to rupees. If in lakhs, multiply by 100000. If in crores, multiply by 10000000. Return only the number.`
      },
      {
        field: 'timeline',
        query: `What are the start date and end date of this scheme? Return in format: Start: YYYY-MM-DD, End: YYYY-MM-DD`
      },
      {
        field: 'phases',
        query: `What are the different phases or stages of this scheme? List each phase with its timeline, budget, and planned work.`
      }
    ];

    // Build a comprehensive context document for Pathway
    const contextDocument = `
DOCUMENT: ${pdfFileName}
TYPE: Government Scheme/Project Document

FULL CONTENT:
${pdfText.substring(0, 20000)}

This is a government scheme document. Extract accurate information from the above text.
`;

    // Query Pathway for each field
    const extractionResults = {};
    
    for (const query of extractionQueries) {
      try {
        const ragResponse = await pathwayClient.callRag({
          question: `${query.query}\n\nContext:\n${contextDocument}`,
          max_citations: 3,
          return_snippets: true
        });
        
        extractionResults[query.field] = {
          answer: ragResponse.answer,
          citations: ragResponse.citations,
          confidence: ragResponse.citations.length > 0 ? 'high' : 'medium'
        };
        
        console.log(`✅ Extracted ${query.field}:`, ragResponse.answer.substring(0, 100));
      } catch (error) {
        console.error(`❌ Error extracting ${query.field}:`, error.message);
        extractionResults[query.field] = {
          answer: null,
          citations: [],
          confidence: 'low'
        };
      }
    }

    // Step 3: Parse and structure the extracted data
    const structuredData = parseExtractionResults(extractionResults, pdfText);

    // Step 4: Use Gemini as fallback/enhancement for missing fields
    if (!structuredData.name || !structuredData.totalBudget) {
      console.log('⚠️ Some fields missing, using Gemini AI for enhancement...');
      const geminiData = await extractWithGemini(pdfText);
      
      structuredData.name = structuredData.name || geminiData.name;
      structuredData.totalBudget = structuredData.totalBudget || geminiData.totalBudget;
      structuredData.category = structuredData.category || geminiData.category;
      structuredData.description = structuredData.description || geminiData.description;
      structuredData.phases = structuredData.phases.length > 0 ? structuredData.phases : geminiData.phases;
    }

    return {
      success: true,
      data: structuredData,
      rawText: pdfText.substring(0, 1000),
      extractionMethod: 'pathway_rag'
    };

  } catch (error) {
    console.error('❌ Pathway PDF Extraction Error:', error.message);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

/**
 * Parse extraction results into structured scheme data
 */
function parseExtractionResults(results, pdfText) {
  const structured = {
    name: 'Unnamed Scheme',
    category: 'Other',
    description: 'No description available',
    village: 'NA',
    district: 'NA',
    totalBudget: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
    phases: [],
    extractionConfidence: 'medium'
  };

  // Parse name
  if (results.name && results.name.answer) {
    structured.name = results.name.answer.trim().replace(/^(Scheme|Project):\s*/i, '');
  }

  // Parse category
  if (results.category && results.category.answer) {
    const categoryMap = {
      'sanitation': 'Sanitation',
      'water': 'Water Supply',
      'housing': 'Housing',
      'employment': 'Employment',
      'power': 'Power',
      'electricity': 'Power',
      'roads': 'Roads',
      'healthcare': 'Healthcare',
      'health': 'Healthcare',
      'education': 'Education',
      'agriculture': 'Agriculture',
      'farming': 'Agriculture'
    };
    
    const catLower = results.category.answer.toLowerCase();
    for (const [key, value] of Object.entries(categoryMap)) {
      if (catLower.includes(key)) {
        structured.category = value;
        break;
      }
    }
  }

  // Parse description
  if (results.description && results.description.answer) {
    structured.description = results.description.answer.trim();
  }

  // Parse location
  if (results.location && results.location.answer) {
    const locationText = results.location.answer;
    const villageMatch = locationText.match(/Village:\s*([^,\n]+)/i);
    const districtMatch = locationText.match(/District:\s*([^,\n]+)/i);
    
    if (villageMatch) structured.village = villageMatch[1].trim();
    if (districtMatch) structured.district = districtMatch[1].trim();
  }

  // Parse budget
  if (results.budget && results.budget.answer) {
    const budgetText = results.budget.answer;
    const numberMatch = budgetText.match(/(\d[\d,]*(?:\.\d+)?)/);
    if (numberMatch) {
      let amount = parseFloat(numberMatch[1].replace(/,/g, ''));
      
      // Check for crore/lakh
      if (budgetText.toLowerCase().includes('crore')) {
        amount *= 10000000;
      } else if (budgetText.toLowerCase().includes('lakh')) {
        amount *= 100000;
      }
      
      structured.totalBudget = Math.floor(amount);
    }
  }

  // Parse timeline
  if (results.timeline && results.timeline.answer) {
    const timelineText = results.timeline.answer;
    const startMatch = timelineText.match(/Start:\s*(\d{4}-\d{2}-\d{2})/i);
    const endMatch = timelineText.match(/End:\s*(\d{4}-\d{2}-\d{2})/i);
    
    if (startMatch) structured.startDate = startMatch[1];
    if (endMatch) structured.endDate = endMatch[1];
  }

  // Parse phases
  if (results.phases && results.phases.answer) {
    structured.phases = parsePhasesFromText(results.phases.answer);
  }

  // Set confidence based on citation counts
  const totalCitations = Object.values(results).reduce((sum, r) => sum + (r.citations?.length || 0), 0);
  structured.extractionConfidence = totalCitations > 10 ? 'high' : totalCitations > 5 ? 'medium' : 'low';

  return structured;
}

/**
 * Parse phases from text response
 */
function parsePhasesFromText(phasesText) {
  const phases = [];
  const phaseMatches = phasesText.match(/Phase\s+(\d+)[:\-]?\s*([^\n]{20,500})/gi);
  
  if (phaseMatches) {
    phaseMatches.forEach((match, index) => {
      const phaseNum = index + 1;
      const description = match.replace(/Phase\s+\d+[:\-]?\s*/i, '').trim();
      
      phases.push({
        id: phaseNum,
        name: `Phase ${phaseNum}`,
        plannedWork: description,
        milestones: [],
        deliverables: [],
        timeline: '',
        budget: 0,
        spent: 0,
        progress: 0,
        status: 'not-started',
        startDate: '',
        endDate: ''
      });
    });
  }

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
        spent: 0,
        progress: 0,
        status: 'not-started',
        startDate: '',
        endDate: ''
      });
    }
  }

  return phases;
}

/**
 * Gemini fallback for missing fields
 */
async function extractWithGemini(pdfText) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `Extract key information from this government scheme document. Return ONLY valid JSON:

${pdfText.substring(0, 15000)}

Format:
{
  "name": "scheme name",
  "category": "Sanitation|Water Supply|Housing|Employment|Power|Roads|Healthcare|Education|Agriculture|Other",
  "description": "brief description",
  "totalBudget": 7500000,
  "phases": [{"id": 1, "name": "Phase 1", "plannedWork": "description"}]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    let jsonText = text.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('❌ Gemini fallback error:', error.message);
  }
  
  return { name: null, category: null, description: null, totalBudget: null, phases: [] };
}

/**
 * Analyze vendor report against government plan using Pathway RAG
 */
export async function analyzeVendorReportWithPathway(pdfBuffer, pdfFileName, governmentPlan) {
  try {
    // Step 1: Extract text from vendor report
    const pdfData = await pdfParse(pdfBuffer);
    const vendorReportText = pdfData.text;

    console.log('📄 Vendor Report PDF Length:', vendorReportText.length, 'characters');
    console.log('🔍 Using Pathway RAG for intelligent discrepancy detection...');

    // Step 2: Build comprehensive context for Pathway
    const contextDocument = `
DOCUMENT: ${pdfFileName}
TYPE: Vendor Progress Report

GOVERNMENT'S ORIGINAL PLAN:
Scheme Name: ${governmentPlan.name}
Total Budget: ₹${governmentPlan.totalBudget}
Timeline: ${governmentPlan.startDate} to ${governmentPlan.endDate}

PHASE-WISE PLAN:
${governmentPlan.phases.map(phase => `
Phase ${phase.id}: ${phase.name}
- Budget: ₹${phase.budget}
- Timeline: ${phase.startDate} to ${phase.endDate}
- Planned Work: ${phase.plannedWork || 'Not specified'}
- Milestones: ${phase.milestones?.join(', ') || 'None'}
`).join('\n')}

VENDOR'S SUBMITTED REPORT:
${vendorReportText.substring(0, 20000)}

Analyze the vendor report against the government plan to identify discrepancies, delays, and compliance issues.
`;

    // Step 3: Query Pathway for analysis
    const analysisQueries = [
      {
        field: 'compliance',
        query: `Analyze the overall compliance of the vendor report with the government plan. Rate the compliance from 0-100 based on budget adherence, timeline compliance, work quality, and deliverables. Explain your rating.`
      },
      {
        field: 'budget_discrepancy',
        query: `Compare the planned budget with the actual expenses claimed in the vendor report. Identify any budget overruns or underutilization. Provide specific numbers.`
      },
      {
        field: 'timeline_discrepancy',
        query: `Compare the planned timeline with the actual progress timeline in the vendor report. Identify any delays or schedule deviations. Calculate delay in days.`
      },
      {
        field: 'quality_issues',
        query: `Identify any quality issues, failed inspections, demolitions, or rework mentioned in the vendor report. List specific problems.`
      },
      {
        field: 'scope_discrepancy',
        query: `Compare the planned work scope with the actual work completed according to the vendor report. Identify any missing deliverables or scope changes.`
      },
      {
        field: 'overdue_work',
        query: `List all tasks or milestones that are overdue or delayed according to the vendor report. Include task name, planned date, current status, and delay in days.`
      }
    ];

    const analysisResults = {};
    
    for (const query of analysisQueries) {
      try {
        const ragResponse = await pathwayClient.callRag({
          question: `${query.query}\n\nContext:\n${contextDocument}`,
          max_citations: 5,
          return_snippets: true
        });
        
        analysisResults[query.field] = {
          answer: ragResponse.answer,
          citations: ragResponse.citations,
          confidence: ragResponse.citations.length > 0 ? 'high' : 'medium'
        };
        
        console.log(`✅ Analyzed ${query.field}`);
      } catch (error) {
        console.error(`❌ Error analyzing ${query.field}:`, error.message);
        analysisResults[query.field] = {
          answer: null,
          citations: [],
          confidence: 'low'
        };
      }
    }

    // Step 4: Structure the analysis results
    const structuredAnalysis = parseAnalysisResults(analysisResults, vendorReportText, governmentPlan);

    // Step 5: Use Gemini for final summary and missing fields
    console.log('🤖 Using Gemini AI for comprehensive summary...');
    const geminiSummary = await generateAnalysisSummaryWithGemini(vendorReportText, governmentPlan, structuredAnalysis);
    
    structuredAnalysis.aiSummary = geminiSummary;

    return {
      success: true,
      analysis: structuredAnalysis,
      aiProcessed: true,
      analysisMethod: 'pathway_rag'
    };

  } catch (error) {
    console.error('❌ Pathway Vendor Analysis Error:', error.message);
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

/**
 * Parse analysis results into structured format
 */
function parseAnalysisResults(results, vendorText, govPlan) {
  const analysis = {
    overallCompliance: 0,
    vendorName: 'Unknown Vendor',
    reportDate: new Date().toISOString().split('T')[0],
    phase: 1,
    workCompleted: 'Not specified',
    expenseClaimed: 0,
    matchingItems: [],
    discrepancies: [],
    overdueWork: [],
    budgetAnalysis: {
      plannedBudget: govPlan.totalBudget,
      claimedExpense: 0,
      variance: 0,
      variancePercentage: 0
    }
  };

  // Parse compliance score
  if (results.compliance && results.compliance.answer) {
    const complianceMatch = results.compliance.answer.match(/(\d+)%?/);
    if (complianceMatch) {
      analysis.overallCompliance = parseInt(complianceMatch[1]);
    }
  }

  // Parse budget discrepancies
  if (results.budget_discrepancy && results.budget_discrepancy.answer) {
    const budgetText = results.budget_discrepancy.answer;
    
    // Extract claimed expense
    const expenseMatch = budgetText.match(/claimed|expenses?|spent[:\s]+₹?\s*(\d[\d,]*(?:\.\d+)?)\s*(lakh|crore)?/i);
    if (expenseMatch) {
      let amount = parseFloat(expenseMatch[1].replace(/,/g, ''));
      if (expenseMatch[2]) {
        if (expenseMatch[2].toLowerCase().includes('crore')) amount *= 10000000;
        else if (expenseMatch[2].toLowerCase().includes('lakh')) amount *= 100000;
      }
      analysis.expenseClaimed = Math.floor(amount);
      analysis.budgetAnalysis.claimedExpense = Math.floor(amount);
    }

    // Create budget discrepancy entry
    if (budgetText.toLowerCase().includes('overrun') || budgetText.toLowerCase().includes('exceeded')) {
      analysis.discrepancies.push({
        category: 'budget',
        severity: 'high',
        description: budgetText.substring(0, 200),
        plannedValue: `₹${govPlan.totalBudget.toLocaleString('en-IN')}`,
        actualValue: `₹${analysis.expenseClaimed.toLocaleString('en-IN')}`
      });
    }
  }

  // Calculate budget variance
  if (analysis.expenseClaimed > 0) {
    analysis.budgetAnalysis.variance = analysis.expenseClaimed - govPlan.totalBudget;
    analysis.budgetAnalysis.variancePercentage = 
      ((analysis.budgetAnalysis.variance / govPlan.totalBudget) * 100).toFixed(2);
  }

  // Parse timeline discrepancies
  if (results.timeline_discrepancy && results.timeline_discrepancy.answer) {
    const timelineText = results.timeline_discrepancy.answer;
    
    if (timelineText.toLowerCase().includes('delay') || timelineText.toLowerCase().includes('behind')) {
      const delayMatch = timelineText.match(/(\d+)\s*days?/i);
      const delayDays = delayMatch ? parseInt(delayMatch[1]) : 0;
      
      analysis.discrepancies.push({
        category: 'timeline',
        severity: delayDays > 60 ? 'critical' : delayDays > 30 ? 'high' : 'medium',
        description: timelineText.substring(0, 200),
        plannedValue: govPlan.endDate,
        actualValue: `Delayed by ${delayDays} days`
      });
    }
  }

  // Parse quality issues
  if (results.quality_issues && results.quality_issues.answer) {
    const qualityText = results.quality_issues.answer;
    
    if (!qualityText.toLowerCase().includes('no issue') && !qualityText.toLowerCase().includes('none')) {
      analysis.discrepancies.push({
        category: 'quality',
        severity: qualityText.toLowerCase().includes('demolished') || 
                  qualityText.toLowerCase().includes('failed') ? 'critical' : 'high',
        description: qualityText.substring(0, 200),
        plannedValue: 'Quality standards as per plan',
        actualValue: 'Quality issues identified'
      });
    }
  }

  // Parse scope discrepancies
  if (results.scope_discrepancy && results.scope_discrepancy.answer) {
    const scopeText = results.scope_discrepancy.answer;
    
    if (scopeText.toLowerCase().includes('missing') || scopeText.toLowerCase().includes('incomplete')) {
      analysis.discrepancies.push({
        category: 'scope',
        severity: 'medium',
        description: scopeText.substring(0, 200),
        plannedValue: 'All planned deliverables',
        actualValue: 'Some deliverables missing'
      });
    } else {
      // Extract matching items
      const deliverables = scopeText.split(/[,.\n]/).filter(s => s.trim().length > 10);
      analysis.matchingItems = deliverables.slice(0, 5).map(d => d.trim());
    }
  }

  // Parse overdue work
  if (results.overdue_work && results.overdue_work.answer) {
    const overdueText = results.overdue_work.answer;
    
    // Try to extract structured overdue tasks
    const taskMatches = overdueText.match(/[-•]\s*([^\n]{10,100})/g);
    if (taskMatches) {
      taskMatches.forEach(taskText => {
        const delayMatch = taskText.match(/(\d+)\s*days?/i);
        const delayDays = delayMatch ? parseInt(delayMatch[1]) : 30;
        
        analysis.overdueWork.push({
          task: taskText.replace(/[-•]\s*/, '').substring(0, 100),
          plannedDate: govPlan.endDate,
          currentStatus: 'delayed',
          delayDays: delayDays
        });
      });
    }
  }

  // Extract vendor name from text
  const vendorMatch = vendorText.match(/(?:vendor|contractor|company)[:\s]+([A-Z][a-zA-Z\s&]+(?:Ltd|Pvt|Inc)?)/i);
  if (vendorMatch) {
    analysis.vendorName = vendorMatch[1].trim();
  }

  // Extract report date
  const dateMatch = vendorText.match(/(?:date|submitted|report date)[:\s]+(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i);
  if (dateMatch) {
    analysis.reportDate = parseDate(dateMatch[1]);
  }

  return analysis;
}

/**
 * Generate comprehensive summary using Gemini
 */
async function generateAnalysisSummaryWithGemini(vendorText, govPlan, structuredAnalysis) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `You are a government compliance auditor. Provide a comprehensive executive summary of this vendor report analysis.

GOVERNMENT PLAN:
- Scheme: ${govPlan.name}
- Budget: ₹${govPlan.totalBudget.toLocaleString('en-IN')}
- Timeline: ${govPlan.startDate} to ${govPlan.endDate}

ANALYSIS RESULTS:
- Overall Compliance: ${structuredAnalysis.overallCompliance}%
- Expense Claimed: ₹${structuredAnalysis.expenseClaimed.toLocaleString('en-IN')}
- Discrepancies Found: ${structuredAnalysis.discrepancies.length}
- Overdue Tasks: ${structuredAnalysis.overdueWork.length}

VENDOR REPORT EXCERPT:
${vendorText.substring(0, 5000)}

Provide a 4-5 sentence executive summary covering:
1. Overall progress status
2. Major achievements
3. Critical issues/risks
4. Budget concerns
5. Recommendations

Be specific, factual, and actionable.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('❌ Gemini summary generation error:', error.message);
    return `Analysis complete. Compliance: ${structuredAnalysis.overallCompliance}%. Found ${structuredAnalysis.discrepancies.length} discrepancies and ${structuredAnalysis.overdueWork.length} overdue tasks. Manual review recommended.`;
  }
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
    
    if (year < 100) {
      year += year < 50 ? 2000 : 1900;
    }
    
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  return dateStr;
}
