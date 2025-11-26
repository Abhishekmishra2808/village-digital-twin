import pdfParse from 'pdf-parse-new';
import { extractSchemeWithLLM, analyzeVendorReport as analyzeWithHF } from './huggingfaceService.js';

/**
 * Extract structured data using improved regex patterns
 */
function extractWithRegex(text) {
  const extracted = {};

  // Preprocess text: normalize whitespace but keep line breaks
  text = text.replace(/\r\n/g, '\n').replace(/\t/g, ' ');

  // Scheme Name - multiple enhanced patterns
  const namePatterns = [
    // Pattern 1: Scheme/Project/Yojana followed by name
    /(?:scheme|project|program|mission|yojana|abhiyan)(?:\s+name)?\s*[:\-]?\s*([A-Z][^\n]{10,120})/i,
    // Pattern 2: Title or Name field
    /(?:^|\n)(?:name|title|scheme|project)\s*[:\-]\s*([A-Z][^\n]{10,120})/im,
    // Pattern 3: All caps title at start (like "PRADHAN MANTRI AWAS YOJANA")
    /^([A-Z][A-Z\s]{10,100}(?:SCHEME|PROJECT|MISSION|YOJANA|ABHIYAN|PROGRAM))/m,
    // Pattern 4: Mixed case with scheme keywords
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Scheme|Project|Mission|Yojana|Abhiyan|Programme))/,
    // Pattern 5: First substantial line with caps
    /^\s*([A-Z][A-Za-z\s]{15,100})$/m
  ];
  
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match) {
      let name = match[1].trim();
      // Clean up extracted name
      name = name.replace(/[\n\r]+/g, ' ').replace(/\s+/g, ' ').trim();
      // Skip if it looks like a header or generic text
      if (name.length >= 10 && !name.match(/^(page|chapter|section|document|report)/i)) {
        extracted.name = name;
        break;
      }
    }
  }

  // Budget - enhanced currency extraction with better unit handling
  const budgetPatterns = [
    // Pattern 1: Explicit budget with amount and unit
    /(?:budget|cost|outlay|allocation|fund|amount)\s*[:\-]?\s*(?:Rs\.?|₹|INR)?\s*([0-9,]+(?:\.[0-9]+)?)\s*(crore|crores|cr|lakh|lakhs|million|billion)?/i,
    // Pattern 2: Currency symbol with amount
    /₹\s*([0-9,]+(?:\.[0-9]+)?)\s*(crore|crores|cr|lakh|lakhs)?/i,
    // Pattern 3: Total/Project cost
    /(?:total|project|scheme)\s+(?:budget|cost|amount|outlay)\s*[:\-]?\s*(?:Rs\.?|₹|INR)?\s*([0-9,]+(?:\.[0-9]+)?)\s*(crore|crores|cr|lakh|lakhs)?/i,
    // Pattern 4: Amount in words
    /(?:Rs\.?|₹|INR)?\s*([0-9,]+(?:\.[0-9]+)?)\s*(crore|crores|lakh|lakhs)\s*(?:rupees)?/i
  ];
  
  for (const pattern of budgetPatterns) {
    const match = text.match(pattern);
    if (match) {
      let amount = parseFloat(match[1].replace(/,/g, ''));
      const unit = match[2] ? match[2].toLowerCase() : '';
      
      // Convert to rupees based on unit
      if (unit.includes('crore') || unit.includes('cr')) {
        amount *= 10000000;  // 1 crore = 10 million
      } else if (unit.includes('lakh')) {
        amount *= 100000;    // 1 lakh = 100 thousand
      } else if (unit.includes('million')) {
        amount *= 1000000;
      } else if (unit.includes('billion')) {
        amount *= 1000000000;
      }
      
      // Only accept reasonable amounts (> 1000 rupees)
      if (amount > 1000) {
        extracted.totalBudget = Math.floor(amount);
        break;
      }
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

  // Category detection with keyword frequency scoring
  const categories = {
    'Sanitation': ['swachh', 'sanitation', 'toilet', 'waste', 'garbage', 'sewage', 'hygiene', 'cleanliness'],
    'Water Supply': ['water', 'jal', 'supply', 'pipeline', 'tank', 'drinking', 'tap', 'handpump', 'bore'],
    'Housing': ['housing', 'awas', 'shelter', 'home', 'dwelling', 'construction', 'residence'],
    'Employment': ['employment', 'rozgar', 'job', 'work', 'livelihood', 'mgnrega', 'wages', 'skill'],
    'Power': ['power', 'electricity', 'bijli', 'solar', 'energy', 'grid', 'electrification'],
    'Roads': ['road', 'path', 'marg', 'highway', 'pmgsy', 'street', 'connectivity', 'infrastructure'],
    'Healthcare': ['health', 'medical', 'hospital', 'clinic', 'ayushman', 'doctor', 'medicine', 'treatment'],
    'Education': ['education', 'school', 'shiksha', 'college', 'study', 'student', 'learning', 'teacher'],
    'Agriculture': ['agriculture', 'farming', 'krishi', 'crop', 'irrigation', 'farmer', 'cultivation', 'seed'],
    'Infrastructure': ['infrastructure', 'development', 'construction', 'building', 'project'],
    'Welfare': ['welfare', 'social', 'pension', 'benefit', 'assistance', 'subsidy']
  };

  // Score each category based on keyword frequency
  const categoryScores = {};
  const lowerText = text.toLowerCase();
  
  for (const [category, keywords] of Object.entries(categories)) {
    let score = 0;
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) score += matches.length;
    }
    categoryScores[category] = score;
  }

  // Select category with highest score
  const maxScore = Math.max(...Object.values(categoryScores));
  if (maxScore > 0) {
    extracted.category = Object.keys(categoryScores).find(cat => categoryScores[cat] === maxScore);
  }

  // Description - multiple extraction strategies
  let description = null;
  
  // Strategy 1: Look for explicit description/objective fields
  const descPatterns = [
    /(?:description|objective|purpose|about|aim|goal)\s*[:\-]\s*([^\n]{50,600})/i,
    /(?:scheme|project)\s+(?:aims|objectives?)\s*[:\-]?\s*([^\n]{50,600})/i,
    /(?:this|the)\s+(?:scheme|project|program)\s+(?:aims|provides|ensures|focuses)\s+([^.]{50,600})/i
  ];
  
  for (const pattern of descPatterns) {
    const match = text.match(pattern);
    if (match) {
      description = match[1].trim();
      break;
    }
  }
  
  // Strategy 2: Extract from first few meaningful sentences
  if (!description) {
    const sentences = text.split(/[.!?]\n/).filter(s => s.trim().length > 40);
    if (sentences.length > 0) {
      // Take first 2-3 sentences that aren't headers
      const meaningful = sentences.filter(s => 
        !s.match(/^(chapter|section|page|table of contents|index)/i) &&
        s.split(' ').length > 8  // At least 8 words
      );
      if (meaningful.length > 0) {
        description = meaningful.slice(0, 2).join('. ').trim();
      }
    }
  }
  
  if (description) {
    // Clean up and limit length
    description = description
      .replace(/\s+/g, ' ')
      .replace(/[\n\r]+/g, ' ')
      .substring(0, 500)
      .trim();
    extracted.description = description;
  }

  // Extract phases
  const phases = extractPhases(text);
  if (phases.length > 0) {
    extracted.phases = phases;
  }

  return extracted;
}

/**
 * Validate and merge LLM and regex results
 */
function validateAndMerge(field, llmValue, regexValue, fallback) {
  // For name and description, prefer longer, more detailed values
  if (field === 'name' || field === 'description') {
    if (llmValue && llmValue.length > 10 && !llmValue.includes('null')) return llmValue;
    if (regexValue && regexValue.length > 10) return regexValue;
    return fallback;
  }
  
  // For other fields, prefer LLM if valid, otherwise regex
  if (llmValue && llmValue !== 'NA' && llmValue !== 'null' && llmValue !== null) return llmValue;
  if (regexValue && regexValue !== 'NA') return regexValue;
  return fallback;
}

/**
 * Validate budget values
 */
function validateBudget(llmBudget, regexBudget) {
  const llm = parseFloat(llmBudget) || 0;
  const regex = parseFloat(regexBudget) || 0;
  
  // Both valid: prefer the more reasonable value (10k to 10000 crores)
  if (llm > 10000 && llm < 100000000000 && regex > 10000 && regex < 100000000000) {
    // If values are close (within 20%), average them
    if (Math.abs(llm - regex) / Math.max(llm, regex) < 0.2) {
      return Math.floor((llm + regex) / 2);
    }
    // Otherwise prefer LLM
    return llm;
  }
  
  // Return whichever is valid
  if (llm > 10000 && llm < 100000000000) return llm;
  if (regex > 10000 && regex < 100000000000) return regex;
  return 0;
}

/**
 * Validate date format
 */
function validateDate(llmDate, regexDate) {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (llmDate && dateRegex.test(llmDate)) return llmDate;
  if (regexDate && dateRegex.test(regexDate)) return regexDate;
  return null;
}

/**
 * Calculate extraction confidence
 */
function calculateConfidence(llmData, regexData) {
  let score = 0;
  
  // Score based on key fields
  if (llmData.name && llmData.name.length > 10) score += 25;
  if (llmData.totalBudget > 10000) score += 25;
  if (llmData.description && llmData.description.length > 50) score += 20;
  if (llmData.category && llmData.category !== 'null') score += 15;
  if (llmData.startDate || llmData.endDate) score += 15;
  
  if (score >= 80) return 'High';
  if (score >= 50) return 'Medium';
  return 'Low';
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

    // Always run both extraction methods for best results
    console.log('🤖 Using LLM (Hugging Face Llama 3.1-8B) for comprehensive extraction...');
    let llmData = {};
    try {
      llmData = await extractSchemeWithLLM(pdfText);
    } catch (llmError) {
      console.warn('⚠️ LLM extraction failed:', llmError.message);
      llmData = {}; // Empty object for fallback
    }
    
    console.log('🔍 Running regex extraction for validation/fallback...');
    const regexData = extractWithRegex(pdfText);

    // Smart merge: combine LLM and regex results with validation
    const finalData = {
      name: validateAndMerge('name', llmData.name, regexData.name, 'Unnamed Scheme'),
      category: validateAndMerge('category', llmData.category, regexData.category, 'Infrastructure'),
      description: validateAndMerge('description', llmData.description, regexData.description, 'Government scheme details to be updated'),
      village: validateAndMerge('village', llmData.village, regexData.village, 'NA'),
      district: validateAndMerge('district', llmData.district, regexData.district, 'NA'),
      totalBudget: validateBudget(llmData.totalBudget, regexData.totalBudget),
      targetBeneficiaries: llmData.targetBeneficiaries || regexData.targetBeneficiaries || 'Citizens',
      implementationArea: llmData.implementationArea || regexData.implementationArea || 'District',
      startDate: validateDate(llmData.startDate, regexData.startDate) || new Date().toISOString().split('T')[0],
      endDate: validateDate(llmData.endDate, regexData.endDate) || new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
      phases: regexData.phases || [],
      extractionConfidence: calculateConfidence(llmData, regexData)
    };
    
    const llmFields = Object.keys(llmData).filter(k => llmData[k]).length;
    const regexFields = Object.keys(regexData).filter(k => regexData[k]).length;
    console.log(`📊 Extraction stats - LLM: ${llmFields} fields, Regex: ${regexFields} fields, Confidence: ${finalData.extractionConfidence}`);

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
