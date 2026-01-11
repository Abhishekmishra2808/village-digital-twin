import pdfParse from 'pdf-parse-new';
import pathwayClient from './pathwayClient.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import FormData from 'form-data';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Pathway Docker URL (the main RAG service)
const PATHWAY_DOCKER_URL = process.env.PATHWAY_MCP_URL?.replace('/v1/retrieve', '') || 'http://localhost:8000';

// Pathway Python API URL (for advanced extraction - optional)
const PATHWAY_EXTRACTOR_URL = process.env.PATHWAY_EXTRACTOR_URL || 'http://localhost:8080';

/**
 * Check if Pathway Docker RAG is available
 */
async function isPathwayDockerAvailable() {
  try {
    const response = await axios.post(`${PATHWAY_DOCKER_URL}/v1/retrieve`, {
      query: "test",
      k: 1
    }, { 
      timeout: 3000,
      headers: { 'Content-Type': 'application/json' }
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if Pathway Python API is available
 */
async function isPathwayExtractorAvailable() {
  try {
    const response = await axios.get(`${PATHWAY_EXTRACTOR_URL}/health`, { timeout: 2000 });
    return response.data?.status === 'healthy';
  } catch {
    return false;
  }
}

/**
 * Query Pathway Docker RAG with document context
 * This uses the vectorized index for accurate retrieval
 */
async function queryPathwayRAG(question, context = '') {
  try {
    // First retrieve relevant documents
    const retrieveResponse = await axios.post(`${PATHWAY_DOCKER_URL}/v1/retrieve`, {
      query: question,
      k: 5
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000
    });

    const documents = retrieveResponse.data || [];
    
    // Then get AI answer with context
    const fullPrompt = context 
      ? `Based on this document:\n${context}\n\nQuestion: ${question}`
      : question;
    
    const answerResponse = await axios.post(`${PATHWAY_DOCKER_URL}/v1/pw_ai_answer`, {
      prompt: fullPrompt
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    });

    return {
      answer: answerResponse.data?.response || answerResponse.data?.answer || '',
      documents: documents,
      success: true
    };
  } catch (error) {
    console.error('Pathway RAG query error:', error.message);
    return { answer: '', documents: [], success: false };
  }
}

/**
 * Extract scheme using Pathway Python API (preferred method)
 */
async function extractWithPathwayPython(pdfBuffer, pdfFileName) {
  const formData = new FormData();
  formData.append('file', pdfBuffer, {
    filename: pdfFileName || 'scheme.pdf',
    contentType: 'application/pdf'
  });

  const response = await axios.post(`${PATHWAY_EXTRACTOR_URL}/extract-scheme`, formData, {
    headers: formData.getHeaders(),
    timeout: 60000, // 60 second timeout for large PDFs
    maxContentLength: 50 * 1024 * 1024
  });

  return response.data;
}

/**
 * Analyze vendor report using Pathway Python API (preferred method)
 */
async function analyzeWithPathwayPython(pdfBuffer, pdfFileName, governmentPlan) {
  const formData = new FormData();
  formData.append('file', pdfBuffer, {
    filename: pdfFileName || 'vendor-report.pdf',
    contentType: 'application/pdf'
  });
  formData.append('government_plan', JSON.stringify(governmentPlan));

  const response = await axios.post(`${PATHWAY_EXTRACTOR_URL}/analyze-vendor-report`, formData, {
    headers: formData.getHeaders(),
    timeout: 90000, // 90 second timeout for analysis
    maxContentLength: 50 * 1024 * 1024
  });

  return response.data;
}

/**
 * Extract scheme details from PDF using Pathway RAG
 * Uses Pathway Docker's vectorization for accurate retrieval
 */
export async function extractSchemeFromPDFWithPathway(pdfBuffer, pdfFileName) {
  try {
    // Step 1: Extract text from PDF
    const pdfData = await pdfParse(pdfBuffer);
    const pdfText = pdfData.text;
    
    // Clean up the text - remove extra whitespace and newlines
    const cleanedText = pdfText
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();

    console.log('📄 PDF Text Length:', cleanedText.length, 'characters');
    console.log('📄 First 500 chars:', cleanedText.substring(0, 500));
    
    // Check if Pathway Docker RAG is available
    const pathwayDockerAvailable = await isPathwayDockerAvailable();
    console.log(`🔍 Pathway Docker available: ${pathwayDockerAvailable}`);

    if (pathwayDockerAvailable) {
      console.log('🚀 Using Pathway Docker RAG for intelligent extraction...');
      
      // Use the PDF text directly with Pathway RAG for each field
      const extractedData = await extractFieldsWithPathwayRAG(cleanedText, pdfFileName);
      
      if (extractedData) {
        // If budget is still 0, try Gemini enhancement
        if (!extractedData.totalBudget || extractedData.totalBudget === 0) {
          console.log('⚠️ Budget is 0, using Gemini AI to extract...');
          try {
            const geminiData = await extractWithGemini(cleanedText);
            if (geminiData.totalBudget && geminiData.totalBudget > 0) {
              extractedData.totalBudget = geminiData.totalBudget;
              console.log(`✅ Gemini extracted budget: ₹${geminiData.totalBudget}`);
            }
            // Also fill other missing fields
            if (!extractedData.description && geminiData.description) {
              extractedData.description = geminiData.description;
            }
            if (extractedData.phases.length === 0 && geminiData.phases?.length > 0) {
              extractedData.phases = geminiData.phases;
            }
          } catch (geminiError) {
            console.warn('⚠️ Gemini enhancement failed:', geminiError.message);
          }
        }
        
        return {
          success: true,
          data: extractedData,
          rawText: cleanedText.substring(0, 1000),
          extractionMethod: 'pathway_docker_rag'
        };
      }
    }

    // Fallback: Try Pathway Python API if available
    const pythonApiAvailable = await isPathwayExtractorAvailable();
    if (pythonApiAvailable) {
      console.log('🚀 Using Pathway Python API for extraction...');
      try {
        const result = await extractWithPathwayPython(pdfBuffer, pdfFileName);
        if (result.success) {
          const method = result.extractionMethod || result.data?.extraction_method || 'pathway_python';
          return {
            success: true,
            data: {
              name: result.data.name,
              category: result.data.category,
              description: result.data.description,
              village: result.data.village,
              district: result.data.district,
              totalBudget: result.data.total_budget,
              startDate: result.data.start_date,
              endDate: result.data.end_date,
              targetBeneficiaries: result.data.target_beneficiaries,
              beneficiaryCount: result.data.beneficiary_count,
              implementingAgency: result.data.implementing_agency,
              phases: result.data.phases || [],
              objectives: result.data.objectives || [],
              keyActivities: result.data.key_activities || [],
              fundingSource: result.data.funding_source,
              fundingPattern: result.data.funding_pattern,
              extractionConfidence: result.confidence > 0.8 ? 'High' : result.confidence > 0.5 ? 'Medium' : 'Low'
            },
            rawText: result.rawText,
            extractionMethod: method
          };
        }
      } catch (pyError) {
        console.warn('⚠️ Pathway Python API failed:', pyError.message);
      }
    }

    // Final fallback: Direct regex extraction
    console.log('⚠️ Using regex fallback extraction...');
    const regexData = extractWithRegex(cleanedText);
    
    return {
      success: true,
      data: regexData,
      rawText: cleanedText.substring(0, 1000),
      extractionMethod: 'regex_fallback'
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
 * Extract all fields using Pathway Docker RAG with vectorized retrieval
 */
async function extractFieldsWithPathwayRAG(pdfText, pdfFileName) {
  console.log('🔍 Extracting fields with Pathway RAG vectorization...');
  
  // Truncate text if too long (Pathway has limits)
  const contextText = pdfText.substring(0, 12000);
  
  const results = {
    name: '',
    category: 'Other',
    description: '',
    village: '',
    district: '',
    totalBudget: 0,
    startDate: '',
    endDate: '',
    targetBeneficiaries: '',
    beneficiaryCount: 0,
    implementingAgency: '',
    phases: [],
    objectives: [],
    keyActivities: [],
    fundingSource: '',
    fundingPattern: {},
    extractionConfidence: 'Medium'
  };

  try {
    // Query 1: Extract scheme name
    console.log('📝 Extracting scheme name...');
    const nameResult = await queryPathwayRAG(
      `Extract ONLY the official name/title of this government scheme. Return just the name, nothing else.`,
      contextText
    );
    if (nameResult.success && nameResult.answer) {
      results.name = cleanExtractedValue(nameResult.answer, 'name');
    }

    // Query 2: Extract category
    console.log('📝 Extracting category...');
    const categoryResult = await queryPathwayRAG(
      `What category does this scheme belong to? Answer with ONE word from: Sanitation, Water, Housing, Employment, Power, Roads, Healthcare, Education, Agriculture, Infrastructure, Welfare. Just the category name.`,
      contextText
    );
    if (categoryResult.success && categoryResult.answer) {
      results.category = mapCategory(categoryResult.answer);
    }

    // Query 3: Extract budget
    console.log('📝 Extracting budget...');
    const budgetResult = await queryPathwayRAG(
      `What is the total budget or project cost? Extract the amount in Indian Rupees. If in lakhs multiply by 100000, if in crores multiply by 10000000. Return ONLY the number.`,
      contextText
    );
    if (budgetResult.success && budgetResult.answer) {
      results.totalBudget = extractBudgetNumber(budgetResult.answer, contextText);
    }

    // Query 4: Extract location (village and district)
    console.log('📝 Extracting location...');
    const locationResult = await queryPathwayRAG(
      `What is the village name and district name mentioned? Answer in format: Village: [name], District: [name]`,
      contextText
    );
    if (locationResult.success && locationResult.answer) {
      const { village, district } = parseLocation(locationResult.answer, contextText);
      results.village = village;
      results.district = district;
    }

    // Query 5: Extract dates
    console.log('📝 Extracting timeline...');
    const dateResult = await queryPathwayRAG(
      `What are the start date and end date of this scheme? Answer in format: Start: YYYY-MM-DD, End: YYYY-MM-DD`,
      contextText
    );
    if (dateResult.success && dateResult.answer) {
      const { startDate, endDate } = parseDates(dateResult.answer, contextText);
      results.startDate = startDate;
      results.endDate = endDate;
    }

    // Query 6: Extract description
    console.log('📝 Extracting description...');
    const descResult = await queryPathwayRAG(
      `Provide a brief 2-3 sentence description of the scheme's main objectives and purpose.`,
      contextText
    );
    if (descResult.success && descResult.answer) {
      results.description = descResult.answer.substring(0, 500);
    }

    // Query 7: Extract phases
    console.log('📝 Extracting phases...');
    const phaseResult = await queryPathwayRAG(
      `List all phases of this scheme with their budget and timeline. Format: Phase 1: [name] - Budget: [amount] - Timeline: [dates]`,
      contextText
    );
    if (phaseResult.success && phaseResult.answer) {
      results.phases = parsePhases(phaseResult.answer, contextText);
    }

    // Query 8: Extract implementing agency
    console.log('📝 Extracting implementing agency...');
    const agencyResult = await queryPathwayRAG(
      `What is the implementing agency or department for this scheme? Return only the agency name.`,
      contextText
    );
    if (agencyResult.success && agencyResult.answer) {
      results.implementingAgency = cleanExtractedValue(agencyResult.answer, 'agency');
    }

    // Re-map category using scheme name for better accuracy
    if (results.name) {
      results.category = mapCategory(results.category, results.name);
    }

    // Validate and fill missing required fields
    const validatedResults = validateAndFillRequiredFields(results, contextText, pdfFileName);

    // Calculate confidence based on how many fields were successfully extracted
    const requiredFields = ['name', 'category', 'totalBudget', 'village', 'district', 'startDate', 'endDate'];
    const filledRequired = requiredFields.filter(f => {
      const val = validatedResults[f];
      return val && val !== 'NA' && val !== 'Other' && val !== 0 && val !== '';
    }).length;
    
    const confidence = filledRequired / requiredFields.length;
    validatedResults.extractionConfidence = confidence > 0.8 ? 'High' : confidence > 0.5 ? 'Medium' : 'Low';

    console.log(`✅ Pathway RAG extraction complete. Confidence: ${validatedResults.extractionConfidence}`);
    console.log(`   - Name: ${validatedResults.name}`);
    console.log(`   - Category: ${validatedResults.category}`);
    console.log(`   - Budget: ₹${validatedResults.totalBudget}`);
    console.log(`   - Location: ${validatedResults.village}, ${validatedResults.district}`);
    
    return validatedResults;

  } catch (error) {
    console.error('❌ Pathway RAG extraction error:', error.message);
    return null;
  }
}

/**
 * Validate and fill required fields with fallbacks
 */
function validateAndFillRequiredFields(data, pdfText, pdfFileName) {
  console.log('🔍 Validating required fields...');
  
  // Ensure scheme name exists
  if (!data.name || data.name === 'Unnamed Scheme' || data.name.length < 3) {
    // Try to extract from filename
    if (pdfFileName) {
      const nameFromFile = pdfFileName.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ').trim();
      if (nameFromFile.length > 5) {
        data.name = nameFromFile.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        console.log(`📝 Name from filename: ${data.name}`);
      }
    }
    // Try regex on text
    if (!data.name || data.name.length < 5) {
      const nameMatch = pdfText.match(/(?:scheme|project|programme?|mission|yojana|abhiyan)[:\s]+([^\n]{10,100})/i);
      if (nameMatch) data.name = nameMatch[1].trim();
    }
  }
  
  // Ensure budget is extracted
  if (!data.totalBudget || data.totalBudget === 0) {
    console.log('⚠️ Budget is 0, trying additional extraction...');
    data.totalBudget = extractBudgetNumber('', pdfText);
    
    // If still 0, try Gemini extraction later
    if (data.totalBudget === 0) {
      console.log('⚠️ Budget still 0, will need AI enhancement');
    }
  }
  
  // Ensure category matches scheme name (especially for Sanitation)
  if (data.name) {
    data.category = mapCategory(data.category || '', data.name);
  }
  
  // Ensure village and district have values
  if (!data.village || data.village === 'NA') {
    const villageMatch = pdfText.match(/(?:village|gram|gram panchayat|gp)[:\s]+([A-Za-z]+)/i);
    if (villageMatch) data.village = villageMatch[1].trim();
  }
  
  if (!data.district || data.district === 'NA') {
    const districtMatch = pdfText.match(/(?:district|zilla|jila)[:\s]+([A-Za-z]+)/i);
    if (districtMatch) data.district = districtMatch[1].trim();
  }
  
  // Ensure dates are valid
  const today = new Date();
  if (!data.startDate || !isValidDate(data.startDate)) {
    data.startDate = today.toISOString().split('T')[0];
  }
  if (!data.endDate || !isValidDate(data.endDate)) {
    const nextYear = new Date(today);
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    data.endDate = nextYear.toISOString().split('T')[0];
  }
  
  // Ensure phases exist
  if (!data.phases || data.phases.length === 0) {
    data.phases = createDefaultPhases(data.totalBudget, data.startDate, data.endDate);
  }
  
  console.log('✅ Validation complete');
  return data;
}

/**
 * Check if date string is valid
 */
function isValidDate(dateStr) {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

/**
 * Create default phases with budget distribution
 */
function createDefaultPhases(totalBudget, startDate, endDate) {
  const phases = [];
  const budgetPerPhase = Math.floor(totalBudget / 3);
  
  for (let i = 1; i <= 3; i++) {
    phases.push({
      id: i,
      name: `Phase ${i}`,
      plannedWork: `Phase ${i} implementation activities`,
      budget: budgetPerPhase,
      spent: 0,
      progress: 0,
      status: 'not-started',
      startDate: '',
      endDate: '',
      milestones: [],
      deliverables: []
    });
  }
  
  return phases;
}

/**
 * Clean extracted value based on field type
 */
function cleanExtractedValue(value, fieldType) {
  if (!value) return '';
  
  let cleaned = value.trim();
  
  // Remove common prefixes
  cleaned = cleaned.replace(/^(Scheme|Project|Name|Title|Answer):\s*/i, '');
  cleaned = cleaned.replace(/^(The scheme is called|The name is|It is called)\s*/i, '');
  
  // Remove quotes
  cleaned = cleaned.replace(/^["']|["']$/g, '');
  
  // Limit length
  if (fieldType === 'name' && cleaned.length > 200) {
    cleaned = cleaned.substring(0, 200);
  }
  
  return cleaned;
}

/**
 * Map category string to standard category - IMPROVED VERSION
 */
function mapCategory(categoryText, schemeName = '') {
  // Combine category text and scheme name for better matching
  const searchText = (categoryText + ' ' + schemeName).toLowerCase();
  
  // Priority order matters - check sanitation keywords FIRST
  const categoryPriority = [
    { keywords: ['sanitation', 'swachh', 'toilet', 'latrine', 'shauchalay', 'cleanliness', 'hygiene', 'odf', 'open defecation'], category: 'Sanitation' },
    { keywords: ['water supply', 'drinking water', 'jal jeevan', 'piped water', 'tap water', 'jaldhara'], category: 'Water Supply' },
    { keywords: ['water', 'jal', 'nadi', 'river', 'irrigation', 'watershed'], category: 'Water Supply' },
    { keywords: ['housing', 'awas', 'pradhan mantri awas', 'house', 'shelter', 'dwelling'], category: 'Housing' },
    { keywords: ['employment', 'rozgar', 'nrega', 'mnrega', 'job', 'skill', 'livelihood'], category: 'Employment' },
    { keywords: ['power', 'electricity', 'bijli', 'saubhagya', 'solar', 'energy'], category: 'Power' },
    { keywords: ['road', 'sadak', 'highway', 'pmgsy', 'path', 'connectivity'], category: 'Roads' },
    { keywords: ['health', 'swasthya', 'hospital', 'medical', 'ayushman', 'clinic', 'dispensary'], category: 'Healthcare' },
    { keywords: ['education', 'shiksha', 'school', 'vidyalaya', 'literacy', 'anganwadi', 'mid-day meal'], category: 'Education' },
    { keywords: ['agriculture', 'krishi', 'farming', 'kisan', 'farmer', 'crop', 'fertilizer'], category: 'Agriculture' },
    { keywords: ['infrastructure', 'construction', 'building', 'facility'], category: 'Infrastructure' },
    { keywords: ['welfare', 'pension', 'benefit', 'subsidy', 'scheme'], category: 'Welfare' },
    { keywords: ['rural', 'gram', 'village', 'panchayat'], category: 'Rural Development' }
  ];
  
  for (const { keywords, category } of categoryPriority) {
    for (const keyword of keywords) {
      if (searchText.includes(keyword)) {
        console.log(`✅ Category mapped: "${keyword}" -> ${category}`);
        return category;
      }
    }
  }
  
  return 'Other';
}

/**
 * Extract budget number from text - IMPROVED VERSION
 */
function extractBudgetNumber(answer, fullText) {
  // Combine answer and full text for comprehensive search
  const combinedText = (answer || '') + ' ' + (fullText || '').substring(0, 10000);
  
  console.log('🔍 Searching for budget in text...');
  
  // Budget-specific patterns (more specific first)
  const budgetPatterns = [
    // Match "Total Budget: Rs. 75,00,000" or "Budget: ₹75 lakhs"
    /(?:total\s*)?budget[:\s]+(?:Rs\.?|₹)?\s*(\d+(?:[,.]\d+)*)\s*(crore|cr|lakh|lac|lakhs)?/i,
    // Match "Project Cost: Rs. 75 lakhs"
    /(?:project|scheme)\s*cost[:\s]+(?:Rs\.?|₹)?\s*(\d+(?:[,.]\d+)*)\s*(crore|cr|lakh|lac|lakhs)?/i,
    // Match "Rs. 75,00,000" or "₹75,00,000"
    /(?:Rs\.?|₹)\s*(\d{1,3}(?:,\d{2,3})+)(?:\.\d+)?/,
    // Match "75 lakh rupees" or "7.5 crore"
    /(\d+(?:\.\d+)?)\s*(crore|cr|lakh|lac|lakhs)\s*(?:rupees)?/i,
    // Match "Allocation: 75,00,000"
    /(?:allocation|fund|amount)[:\s]+(?:Rs\.?|₹)?\s*(\d+(?:[,.]\d+)*)/i,
    // Match large numbers like "7500000" (lakhs range)
    /\b(\d{6,10})\b/
  ];
  
  for (const pattern of budgetPatterns) {
    const match = combinedText.match(pattern);
    if (match) {
      let amount = parseFloat(match[1].replace(/,/g, ''));
      const unit = match[2] || '';
      
      // Convert based on unit found
      if (/crore|cr/i.test(unit)) {
        amount *= 10000000;
        console.log(`✅ Found budget: ${match[1]} crore = ₹${amount}`);
      } else if (/lakh|lac/i.test(unit)) {
        amount *= 100000;
        console.log(`✅ Found budget: ${match[1]} lakh = ₹${amount}`);
      } else if (amount < 1000) {
        // Small number without unit - likely in lakhs
        amount *= 100000;
        console.log(`✅ Found budget: ${match[1]} (assumed lakh) = ₹${amount}`);
      } else {
        console.log(`✅ Found budget: ₹${amount}`);
      }
      
      // Sanity check - budget should be reasonable (1 lakh to 1000 crore)
      if (amount >= 100000 && amount <= 10000000000) {
        return Math.floor(amount);
      }
    }
  }
  
  // Try to find any large number that could be budget
  const largeNumbers = combinedText.match(/\b(\d{5,10})\b/g);
  if (largeNumbers && largeNumbers.length > 0) {
    // Take the largest reasonable number
    const amounts = largeNumbers.map(n => parseInt(n)).filter(n => n >= 100000 && n <= 10000000000);
    if (amounts.length > 0) {
      const budget = Math.max(...amounts);
      console.log(`✅ Found budget from large number: ₹${budget}`);
      return budget;
    }
  }
  
  console.log('⚠️ No budget found in text');
  return 0;
}

/**
 * Parse location from text
 */
function parseLocation(answer, fullText) {
  let village = '';
  let district = '';
  
  // Try answer first
  const villageMatch = answer.match(/village[:\s]+([^,\n]+)/i);
  const districtMatch = answer.match(/district[:\s]+([^,\n]+)/i);
  
  if (villageMatch) village = villageMatch[1].trim();
  if (districtMatch) district = districtMatch[1].trim();
  
  // If not found, search in full text
  if (!village || !district) {
    const textVillageMatch = fullText.match(/(?:gram|village|गाँव)[:\s]+([^\n,]+)/i);
    const textDistrictMatch = fullText.match(/(?:district|जिला|zila)[:\s]+([^\n,]+)/i);
    
    if (!village && textVillageMatch) village = textVillageMatch[1].trim();
    if (!district && textDistrictMatch) district = textDistrictMatch[1].trim();
  }
  
  return { village: village || 'NA', district: district || 'NA' };
}

/**
 * Parse dates from text
 */
function parseDates(answer, fullText) {
  const today = new Date();
  const nextYear = new Date(today);
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  
  let startDate = today.toISOString().split('T')[0];
  let endDate = nextYear.toISOString().split('T')[0];
  
  // Look for date patterns
  const datePatterns = [
    /(\d{4})-(\d{2})-(\d{2})/g,
    /(\d{2})[-/](\d{2})[-/](\d{4})/g,
    /(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{4})/gi
  ];
  
  const text = answer + ' ' + fullText.substring(0, 2000);
  const dates = [];
  
  for (const pattern of datePatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      try {
        let dateStr = match[0];
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          dates.push(date);
        }
      } catch {}
    }
  }
  
  if (dates.length >= 2) {
    dates.sort((a, b) => a - b);
    startDate = dates[0].toISOString().split('T')[0];
    endDate = dates[dates.length - 1].toISOString().split('T')[0];
  } else if (dates.length === 1) {
    startDate = dates[0].toISOString().split('T')[0];
  }
  
  return { startDate, endDate };
}

/**
 * Parse phases from text
 */
function parsePhases(answer, fullText) {
  const phases = [];
  
  // Look for phase patterns in answer
  const phasePatterns = [
    /phase\s*(\d+)[:\s]+([^.]+)/gi,
    /stage\s*(\d+)[:\s]+([^.]+)/gi,
    /(\d+)\.\s*phase[:\s]+([^.]+)/gi
  ];
  
  const text = answer + ' ' + fullText.substring(0, 5000);
  
  for (const pattern of phasePatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const phaseNum = parseInt(match[1]);
      const phaseName = match[2].trim();
      
      if (!phases.find(p => p.id === phaseNum)) {
        phases.push({
          id: phaseNum,
          name: `Phase ${phaseNum}`,
          plannedWork: phaseName.substring(0, 200),
          budget: 0,
          startDate: '',
          endDate: '',
          milestones: [],
          deliverables: []
        });
      }
    }
  }
  
  // If no phases found, create default phases
  if (phases.length === 0) {
    for (let i = 1; i <= 3; i++) {
      phases.push({
        id: i,
        name: `Phase ${i}`,
        plannedWork: `Phase ${i} activities`,
        budget: 0,
        startDate: '',
        endDate: '',
        milestones: [],
        deliverables: []
      });
    }
  }
  
  return phases;
}

/**
 * Regex-based extraction as final fallback
 */
function extractWithRegex(text) {
  const results = {
    name: 'Unnamed Scheme',
    category: 'Other',
    description: '',
    village: 'NA',
    district: 'NA',
    totalBudget: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
    phases: [],
    extractionConfidence: 'Low'
  };
  
  // Extract name
  const namePatterns = [
    /(?:scheme|project|programme?|mission|yojana|abhiyan)[:\s]+([^\n]{10,100})/i,
    /^([A-Z][A-Z\s]{10,80}(?:SCHEME|PROJECT|MISSION))/m
  ];
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match) {
      results.name = match[1].trim();
      break;
    }
  }
  
  // Extract budget
  results.totalBudget = extractBudgetNumber('', text);
  
  // Extract location
  const loc = parseLocation('', text);
  results.village = loc.village;
  results.district = loc.district;
  
  // Extract dates
  const dates = parseDates('', text);
  results.startDate = dates.startDate;
  results.endDate = dates.endDate;
  
  // Extract category
  results.category = mapCategory(text);
  
  return results;
}

/**
 * Gemini fallback for missing fields
 */
async function extractWithGemini(pdfText) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const prompt = `Extract key information from this government scheme document. Return ONLY valid JSON.

IMPORTANT: For totalBudget, extract the number in Rupees. If amount is in lakhs (lakh), multiply by 100000. If in crores, multiply by 10000000.
Example: "75 lakh" = 7500000, "1.5 crore" = 15000000

Document text:
${pdfText.substring(0, 15000)}

Return JSON:
{
  "name": "exact scheme name",
  "category": "Sanitation|Water Supply|Housing|Employment|Power|Roads|Healthcare|Education|Agriculture|Other",
  "description": "brief 2-3 sentence description",
  "totalBudget": 7500000,
  "village": "village name",
  "district": "district name",
  "phases": [{"id": 1, "name": "Phase 1", "plannedWork": "description", "budget": 2500000}]
}`;

    console.log('🤖 Calling Gemini for field extraction...');
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    let jsonText = text.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log(`✅ Gemini extracted: name="${parsed.name}", budget=₹${parsed.totalBudget}`);
      return parsed;
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
    // Check if Pathway Python API is available for enhanced analysis
    const pathwayAvailable = await isPathwayExtractorAvailable();
    
    if (pathwayAvailable) {
      console.log('🚀 Using Pathway Python API for enhanced vendor analysis...');
      try {
        const result = await analyzeWithPathwayPython(pdfBuffer, pdfFileName, governmentPlan);
        
        if (result.success) {
          const analysis = result.analysis;
          console.log(`✅ Pathway analysis complete:`);
          console.log(`   - Compliance: ${analysis.overallCompliance?.toFixed(1)}%`);
          console.log(`   - Discrepancies: ${analysis.discrepancies?.length || 0}`);
          console.log(`   - Risk Level: ${analysis.riskLevel}`);
          
          return {
            success: true,
            analysis: {
              overallCompliance: analysis.overallCompliance,
              budgetCompliance: analysis.budgetCompliance,
              timelineCompliance: analysis.timelineCompliance,
              scopeCompliance: analysis.scopeCompliance,
              qualityCompliance: analysis.qualityCompliance,
              vendorName: analysis.vendorName,
              reportDate: analysis.reportDate,
              phase: analysis.phase,
              workCompleted: analysis.workCompleted,
              expenseClaimed: analysis.expenseClaimed,
              expenseBreakdown: analysis.expenseBreakdown || {},
              matchingItems: analysis.matchingItems || [],
              discrepancies: analysis.discrepancies || [],
              overdueWork: analysis.overdueWork || [],
              riskLevel: analysis.riskLevel,
              budgetAnalysis: {
                plannedBudget: governmentPlan.totalBudget,
                claimedExpense: analysis.expenseClaimed,
                variance: analysis.expenseClaimed - governmentPlan.totalBudget,
                variancePercentage: ((analysis.expenseClaimed - governmentPlan.totalBudget) / governmentPlan.totalBudget * 100).toFixed(2)
              },
              aiSummary: analysis.aiSummary,
              recommendations: analysis.recommendations || [],
              aiProcessed: true
            },
            aiProcessed: true,
            analysisMethod: 'pathway_python'
          };
        }
      } catch (pyError) {
        console.warn('⚠️ Pathway Python API failed, falling back to Docker RAG:', pyError.message);
      }
    }

    // Fallback: Use Pathway Docker RAG-based analysis
    const pdfData = await pdfParse(pdfBuffer);
    const vendorReportText = pdfData.text;

    console.log('📄 Vendor Report PDF Length:', vendorReportText.length, 'characters');
    console.log('🔍 Using Pathway Docker RAG for discrepancy detection...');

    // Use Pathway Docker RAG for analysis
    const pathwayDockerAvailable = await isPathwayDockerAvailable();
    
    if (pathwayDockerAvailable) {
      const analysis = await analyzeWithPathwayDockerRAG(vendorReportText, governmentPlan);
      return {
        success: true,
        analysis: analysis,
        aiProcessed: true,
        analysisMethod: 'pathway_docker_rag'
      };
    }

    // Final fallback: Basic regex analysis
    const basicAnalysis = performBasicAnalysis(vendorReportText, governmentPlan);
    return {
      success: true,
      analysis: basicAnalysis,
      aiProcessed: false,
      analysisMethod: 'regex_fallback'
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
 * Analyze vendor report using Pathway Docker RAG
 */
async function analyzeWithPathwayDockerRAG(vendorText, govPlan) {
  const analysis = {
    overallCompliance: 70,
    budgetCompliance: 70,
    timelineCompliance: 70,
    scopeCompliance: 70,
    qualityCompliance: 70,
    vendorName: 'Unknown Vendor',
    reportDate: new Date().toISOString().split('T')[0],
    phase: 1,
    workCompleted: '',
    expenseClaimed: 0,
    expenseBreakdown: {},
    matchingItems: [],
    discrepancies: [],
    overdueWork: [],
    riskLevel: 'medium',
    budgetAnalysis: {
      plannedBudget: govPlan.totalBudget,
      claimedExpense: 0,
      variance: 0,
      variancePercentage: 0
    },
    aiSummary: '',
    recommendations: []
  };

  try {
    // Query for budget analysis
    const budgetResult = await queryPathwayRAG(
      `Compare the budget: Government planned ₹${govPlan.totalBudget}. What is the actual expense claimed in this report? Calculate variance.`,
      vendorText.substring(0, 8000)
    );
    
    if (budgetResult.success && budgetResult.answer) {
      analysis.expenseClaimed = extractBudgetNumber(budgetResult.answer, vendorText);
      analysis.budgetAnalysis.claimedExpense = analysis.expenseClaimed;
      analysis.budgetAnalysis.variance = analysis.expenseClaimed - govPlan.totalBudget;
      analysis.budgetAnalysis.variancePercentage = 
        govPlan.totalBudget > 0 ? ((analysis.budgetAnalysis.variance / govPlan.totalBudget) * 100).toFixed(2) : 0;
      
      // Budget compliance based on variance
      const varianceAbs = Math.abs(analysis.budgetAnalysis.variancePercentage);
      analysis.budgetCompliance = varianceAbs > 20 ? 50 : varianceAbs > 10 ? 70 : 90;
      
      if (varianceAbs > 10) {
        analysis.discrepancies.push({
          category: 'budget',
          severity: varianceAbs > 20 ? 'critical' : 'high',
          title: 'Budget Variance Detected',
          description: `Budget variance of ${analysis.budgetAnalysis.variancePercentage}% from planned amount`,
          plannedValue: `₹${govPlan.totalBudget.toLocaleString('en-IN')}`,
          actualValue: `₹${analysis.expenseClaimed.toLocaleString('en-IN')}`,
          recommendation: 'Review expense claims and verify with supporting documents'
        });
      }
    }

    // Query for timeline analysis
    const timelineResult = await queryPathwayRAG(
      `Are there any delays in the project timeline? Compare planned dates with actual progress. List any overdue tasks.`,
      vendorText.substring(0, 8000)
    );
    
    if (timelineResult.success && timelineResult.answer) {
      const hasDelay = timelineResult.answer.toLowerCase().includes('delay') || 
                       timelineResult.answer.toLowerCase().includes('behind');
      analysis.timelineCompliance = hasDelay ? 60 : 85;
      
      if (hasDelay) {
        analysis.discrepancies.push({
          category: 'timeline',
          severity: 'high',
          title: 'Timeline Delay Detected',
          description: timelineResult.answer.substring(0, 200),
          plannedValue: `End date: ${govPlan.endDate}`,
          actualValue: 'Behind schedule',
          recommendation: 'Develop catch-up plan and identify causes of delay'
        });
      }
    }

    // Query for quality issues
    const qualityResult = await queryPathwayRAG(
      `Are there any quality issues, failed inspections, or work that needed to be redone? List specific quality problems.`,
      vendorText.substring(0, 8000)
    );
    
    if (qualityResult.success && qualityResult.answer) {
      const hasQualityIssue = qualityResult.answer.toLowerCase().includes('failed') ||
                              qualityResult.answer.toLowerCase().includes('demolished') ||
                              qualityResult.answer.toLowerCase().includes('rework');
      analysis.qualityCompliance = hasQualityIssue ? 50 : 85;
      
      if (hasQualityIssue) {
        analysis.discrepancies.push({
          category: 'quality',
          severity: 'critical',
          title: 'Quality Issues Found',
          description: qualityResult.answer.substring(0, 200),
          plannedValue: 'Quality standards as per specification',
          actualValue: 'Quality issues identified',
          recommendation: 'Conduct quality audit and implement corrective actions'
        });
      }
    }

    // Query for work completed
    const workResult = await queryPathwayRAG(
      `What work has been completed according to this report? List the main accomplishments.`,
      vendorText.substring(0, 8000)
    );
    
    if (workResult.success && workResult.answer) {
      analysis.workCompleted = workResult.answer.substring(0, 500);
      analysis.scopeCompliance = 75; // Default, would need more analysis
    }

    // Calculate overall compliance
    analysis.overallCompliance = Math.round(
      (analysis.budgetCompliance * 0.35) +
      (analysis.timelineCompliance * 0.25) +
      (analysis.scopeCompliance * 0.25) +
      (analysis.qualityCompliance * 0.15)
    );

    // Determine risk level
    const criticalCount = analysis.discrepancies.filter(d => d.severity === 'critical').length;
    const highCount = analysis.discrepancies.filter(d => d.severity === 'high').length;
    
    if (criticalCount > 0) analysis.riskLevel = 'critical';
    else if (highCount >= 2) analysis.riskLevel = 'high';
    else if (highCount === 1 || analysis.discrepancies.length >= 3) analysis.riskLevel = 'medium';
    else analysis.riskLevel = 'low';

    // Generate summary
    analysis.aiSummary = `Compliance analysis complete. Overall score: ${analysis.overallCompliance}%. ` +
      `Found ${analysis.discrepancies.length} discrepancies. Risk level: ${analysis.riskLevel.toUpperCase()}. ` +
      `Budget variance: ${analysis.budgetAnalysis.variancePercentage}%.`;

    // Generate recommendations
    analysis.recommendations = analysis.discrepancies.map(d => `[${d.severity.toUpperCase()}] ${d.recommendation}`);

  } catch (error) {
    console.error('Pathway Docker RAG analysis error:', error.message);
  }

  return analysis;
}

/**
 * Basic regex-based analysis fallback
 */
function performBasicAnalysis(vendorText, govPlan) {
  const analysis = {
    overallCompliance: 50,
    budgetCompliance: 50,
    timelineCompliance: 50,
    scopeCompliance: 50,
    qualityCompliance: 50,
    vendorName: 'Unknown Vendor',
    reportDate: new Date().toISOString().split('T')[0],
    phase: 1,
    workCompleted: 'Manual review required',
    expenseClaimed: extractBudgetNumber('', vendorText),
    expenseBreakdown: {},
    matchingItems: [],
    discrepancies: [],
    overdueWork: [],
    riskLevel: 'medium',
    budgetAnalysis: {
      plannedBudget: govPlan.totalBudget,
      claimedExpense: 0,
      variance: 0,
      variancePercentage: 0
    },
    aiSummary: 'Basic analysis complete. AI-powered analysis unavailable. Manual review recommended.',
    recommendations: ['Conduct manual review of vendor report', 'Verify expense claims with supporting documents']
  };

  analysis.budgetAnalysis.claimedExpense = analysis.expenseClaimed;
  analysis.budgetAnalysis.variance = analysis.expenseClaimed - govPlan.totalBudget;
  analysis.budgetAnalysis.variancePercentage = 
    govPlan.totalBudget > 0 ? ((analysis.budgetAnalysis.variance / govPlan.totalBudget) * 100).toFixed(2) : 0;

  return analysis;
}
