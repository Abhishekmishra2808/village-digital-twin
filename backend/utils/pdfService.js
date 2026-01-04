import pdfParse from 'pdf-parse-new';
import { extractSchemeWithLLM, analyzeVendorReport as analyzeWithHF } from './huggingfaceService.js';

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
    console.log('🤖 Using LLM (Hugging Face Llama 3.1-8B) for comprehensive extraction...');
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

// Removed - now using Hugging Face Llama 3.1-8B in huggingfaceService.js

/**
 * Analyze vendor report against government plan using Hugging Face Llama
 */
export async function analyzeVendorReport(pdfBuffer, governmentPlan) {
  try {
    // Extract text from vendor report PDF
    const pdfData = await pdfParse(pdfBuffer);
    const vendorReportText = pdfData.text;

    console.log('📄 Vendor Report PDF Length:', vendorReportText.length, 'characters');

    // Use Hugging Face Llama 3.1-8B for analysis
    const analysisData = await analyzeWithHF(vendorReportText, governmentPlan);

    return {
      success: true,
      analysis: analysisData,
      aiProcessed: true
    };

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
