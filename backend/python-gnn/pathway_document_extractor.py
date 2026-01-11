"""
Pathway-based Document Extraction Service for Government Schemes

This module provides accurate, AI-powered extraction from complex government 
scheme documents and vendor reports using Pathway's document processing pipeline.

Key Features:
- Handles complex, multi-format government PDFs
- Structured field extraction with confidence scoring
- AI-powered discrepancy detection between govt plan and vendor reports
- Budget variance analysis with configurable thresholds
"""

import os
import json
import re
import sys
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, field, asdict
from datetime import datetime
from enum import Enum

# Try to import pathway, fallback to direct LLM if not available
try:
    import pathway as pw
    from pathway.xpacks.llm.parsers import UnstructuredParser
    from pathway.xpacks.llm.splitters import TokenCountSplitter
    from pathway.xpacks.llm.embedders import SentenceTransformerEmbedder
    PATHWAY_AVAILABLE = True
except ImportError:
    PATHWAY_AVAILABLE = False
    print("⚠️ Pathway not installed, using fallback extraction methods")

# Import Google's Generative AI for enhanced extraction
GEMINI_AVAILABLE = False
try:
    import google.generativeai as genai
    if os.getenv('GEMINI_API_KEY'):
        GEMINI_AVAILABLE = True
except ImportError:
    pass

# Import HuggingFace as alternative
HUGGINGFACE_AVAILABLE = False
try:
    from huggingface_hub import InferenceClient
    if os.getenv('HUGGINGFACE_API_KEY'):
        HUGGINGFACE_AVAILABLE = True
except ImportError:
    pass

if not GEMINI_AVAILABLE and not HUGGINGFACE_AVAILABLE:
    print("⚠️ No LLM API configured (need GEMINI_API_KEY or HUGGINGFACE_API_KEY)")

# PDF parsing
try:
    import pdfplumber
    PDFPLUMBER_AVAILABLE = True
except ImportError:
    PDFPLUMBER_AVAILABLE = False
    try:
        from PyPDF2 import PdfReader
        PYPDF2_AVAILABLE = True
    except ImportError:
        PYPDF2_AVAILABLE = False


class DiscrepancySeverity(Enum):
    """Severity levels for discrepancies"""
    CRITICAL = "critical"  # Immediate attention required
    HIGH = "high"          # Significant issue
    MEDIUM = "medium"      # Moderate concern
    LOW = "low"            # Minor deviation
    INFO = "info"          # Informational only


@dataclass
class ExtractedField:
    """Represents an extracted field with metadata"""
    value: Any
    confidence: float  # 0.0 to 1.0
    source: str  # 'pathway', 'llm', 'regex', 'fallback'
    raw_text: Optional[str] = None


@dataclass
class SchemeData:
    """Structured government scheme data"""
    name: str = "Unnamed Scheme"
    category: str = "Other"
    description: str = ""
    village: str = ""
    district: str = ""
    state: str = ""
    total_budget: float = 0.0
    budget_unit: str = "INR"  # INR, Lakhs, Crores
    start_date: str = ""
    end_date: str = ""
    duration_months: int = 0
    implementing_agency: str = ""
    nodal_officer: str = ""
    contact_details: str = ""
    target_beneficiaries: str = ""
    beneficiary_count: int = 0
    objectives: List[str] = field(default_factory=list)
    phases: List[Dict] = field(default_factory=list)
    milestones: List[Dict] = field(default_factory=list)
    deliverables: List[str] = field(default_factory=list)
    key_activities: List[str] = field(default_factory=list)
    funding_source: str = ""
    funding_pattern: Dict = field(default_factory=dict)  # Central, State, Local shares
    extraction_confidence: float = 0.0
    extraction_method: str = ""
    raw_text_sample: str = ""


@dataclass
class VendorReportData:
    """Structured vendor report data"""
    vendor_name: str = ""
    vendor_contact: str = ""
    report_date: str = ""
    report_period: str = ""
    phase_reported: int = 1
    work_completed: str = ""
    work_in_progress: str = ""
    work_pending: str = ""
    expense_claimed: float = 0.0
    expense_breakdown: Dict = field(default_factory=dict)
    materials_used: List[Dict] = field(default_factory=list)
    labor_details: Dict = field(default_factory=dict)
    milestones_achieved: List[str] = field(default_factory=list)
    issues_faced: List[str] = field(default_factory=list)
    quality_certifications: List[str] = field(default_factory=list)
    photos_attached: int = 0
    next_steps: str = ""
    expected_completion: str = ""
    extraction_confidence: float = 0.0


@dataclass
class Discrepancy:
    """Represents a detected discrepancy"""
    category: str  # budget, timeline, scope, quality, documentation
    severity: DiscrepancySeverity
    title: str
    description: str
    planned_value: str
    actual_value: str
    variance: Optional[float] = None
    variance_percentage: Optional[float] = None
    recommendation: str = ""
    evidence: List[str] = field(default_factory=list)


@dataclass
class ComplianceAnalysis:
    """Complete compliance analysis result"""
    overall_compliance: float = 0.0  # 0-100
    budget_compliance: float = 0.0
    timeline_compliance: float = 0.0
    scope_compliance: float = 0.0
    quality_compliance: float = 0.0
    discrepancies: List[Discrepancy] = field(default_factory=list)
    matching_items: List[str] = field(default_factory=list)
    overdue_work: List[Dict] = field(default_factory=list)
    risk_level: str = "low"
    ai_summary: str = ""
    recommendations: List[str] = field(default_factory=list)


class PathwayDocumentExtractor:
    """
    Main class for Pathway-based document extraction with AI enhancement.
    
    Uses a multi-stage pipeline:
    1. PDF text extraction (pdfplumber/PyPDF2)
    2. Pathway document processing (if available)
    3. LLM-based structured extraction
    4. Confidence scoring and validation
    """
    
    def __init__(self, gemini_api_key: Optional[str] = None, huggingface_api_key: Optional[str] = None):
        """Initialize the extractor with optional API keys"""
        self.gemini_api_key = gemini_api_key or os.getenv('GEMINI_API_KEY')
        self.huggingface_api_key = huggingface_api_key or os.getenv('HUGGINGFACE_API_KEY')
        
        self.model = None
        self.hf_client = None
        self.llm_backend = None
        
        # Try Gemini first
        if GEMINI_AVAILABLE and self.gemini_api_key:
            genai.configure(api_key=self.gemini_api_key)
            self.model = genai.GenerativeModel('gemini-2.0-flash')
            self.llm_backend = 'gemini'
            print("✅ Gemini AI configured for document extraction")
        # Fallback to HuggingFace
        elif HUGGINGFACE_AVAILABLE and self.huggingface_api_key:
            self.hf_client = InferenceClient(token=self.huggingface_api_key)
            self.llm_backend = 'huggingface'
            print("✅ HuggingFace AI configured for document extraction")
        else:
            print("⚠️ No LLM configured, using regex-only extraction")
        
        # Extraction patterns for fallback
        self._compile_patterns()
    
    def _compile_patterns(self):
        """Compile regex patterns for fallback extraction"""
        self.patterns = {
            'name': [
                r'(?:scheme|project|programme?|mission|yojana|abhiyan)[\s:-]+([A-Z][^\n]{10,100})',
                r'^([A-Z][A-Z\s]{10,80}(?:SCHEME|PROJECT|MISSION|YOJANA|PROGRAMME))',
                r'(?:title|name)[\s:-]+([^\n]{10,100})',
            ],
            'budget': [
                r'(?:budget|cost|outlay|fund|amount|allocation)[\s:-]*(?:Rs\.?|₹|INR)?[\s]*([0-9,]+(?:\.[0-9]+)?)\s*(crore|cr|lakh|lakhs|million|billion)?',
                r'₹\s*([0-9,]+(?:\.[0-9]+)?)\s*(crore|cr|lakh|lakhs)?',
                r'(?:total|project)\s+(?:budget|cost)[\s:-]*([0-9,]+(?:\.[0-9]+)?)\s*(crore|cr|lakh|lakhs)?',
            ],
            'dates': [
                r'(?:start|commencement|from)\s+date[\s:-]+(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})',
                r'(?:end|completion|to)\s+date[\s:-]+(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})',
                r'(?:duration|period)[\s:-]+(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\s+to\s+(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})',
            ],
            'location': [
                r'(?:village|gram|panchayat)[\s:-]+([A-Za-z\s]{3,50})',
                r'(?:district|dist\.?|zila)[\s:-]+([A-Za-z\s]{3,50})',
                r'(?:state)[\s:-]+([A-Za-z\s]{3,30})',
            ],
            'vendor': [
                r'(?:vendor|contractor|agency|company|firm)[\s:-]+([A-Za-z\s&\.]+(?:Ltd|Pvt|Inc|LLC)?)',
                r'(?:M/s\.?|Messrs\.?)[\s]+([A-Za-z\s&\.]+)',
            ],
            'expense': [
                r'(?:expense|expenditure|spent|claimed|utilized)[\s:-]*(?:Rs\.?|₹)?[\s]*([0-9,]+(?:\.[0-9]+)?)',
                r'(?:amount\s+claimed)[\s:-]*(?:Rs\.?|₹)?[\s]*([0-9,]+(?:\.[0-9]+)?)',
            ],
        }
        
        # Compile all patterns
        self.compiled_patterns = {}
        for category, patterns in self.patterns.items():
            self.compiled_patterns[category] = [
                re.compile(p, re.IGNORECASE | re.MULTILINE) 
                for p in patterns
            ]
    
    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extract text from PDF file"""
        text = ""
        
        if PDFPLUMBER_AVAILABLE:
            try:
                with pdfplumber.open(pdf_path) as pdf:
                    for page in pdf.pages:
                        page_text = page.extract_text() or ""
                        text += page_text + "\n\n"
                        
                        # Also extract tables
                        tables = page.extract_tables()
                        for table in tables:
                            for row in table:
                                if row:
                                    text += " | ".join(str(cell) if cell else "" for cell in row) + "\n"
                print(f"✅ Extracted {len(text)} chars using pdfplumber")
                return text
            except Exception as e:
                print(f"⚠️ pdfplumber error: {e}")
        
        if PYPDF2_AVAILABLE:
            try:
                reader = PdfReader(pdf_path)
                for page in reader.pages:
                    text += page.extract_text() or ""
                print(f"✅ Extracted {len(text)} chars using PyPDF2")
                return text
            except Exception as e:
                print(f"⚠️ PyPDF2 error: {e}")
        
        raise RuntimeError("No PDF extraction library available")
    
    def extract_text_from_buffer(self, pdf_buffer: bytes) -> str:
        """Extract text from PDF buffer"""
        import tempfile
        
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as tmp:
            tmp.write(pdf_buffer)
            tmp_path = tmp.name
        
        try:
            text = self.extract_text_from_pdf(tmp_path)
        finally:
            os.unlink(tmp_path)
        
        return text
    
    async def extract_scheme_data(self, pdf_text: str) -> SchemeData:
        """
        Extract structured scheme data from PDF text using multi-stage pipeline.
        
        Stage 1: Regex-based extraction for structured fields
        Stage 2: LLM-based extraction for complex/unstructured data
        Stage 3: Validation and confidence scoring
        """
        scheme = SchemeData()
        scheme.raw_text_sample = pdf_text[:2000]
        
        # Stage 1: Regex extraction
        regex_data = self._extract_with_regex(pdf_text)
        
        # Stage 2: LLM extraction (if available)
        if self.llm_backend:
            try:
                llm_data = await self._extract_with_llm(pdf_text)
                scheme = self._merge_extractions(regex_data, llm_data)
                scheme.extraction_method = "pathway_llm"
            except Exception as e:
                print(f"⚠️ LLM extraction failed: {e}")
                scheme = self._apply_regex_data(scheme, regex_data)
                scheme.extraction_method = "regex_fallback"
        else:
            scheme = self._apply_regex_data(scheme, regex_data)
            scheme.extraction_method = "regex_only"
        
        # Stage 3: Validate and score confidence
        scheme.extraction_confidence = self._calculate_confidence(scheme)
        
        return scheme
    
    def _extract_with_regex(self, text: str) -> Dict[str, ExtractedField]:
        """Stage 1: Extract fields using regex patterns"""
        extracted = {}
        
        # Extract name
        for pattern in self.compiled_patterns['name']:
            match = pattern.search(text)
            if match:
                name = match.group(1).strip()
                name = re.sub(r'\s+', ' ', name)
                if len(name) >= 10 and not name.lower().startswith(('page', 'chapter', 'section')):
                    extracted['name'] = ExtractedField(
                        value=name,
                        confidence=0.7,
                        source='regex',
                        raw_text=match.group(0)
                    )
                    break
        
        # Extract budget
        for pattern in self.compiled_patterns['budget']:
            match = pattern.search(text)
            if match:
                amount = float(match.group(1).replace(',', ''))
                unit = match.group(2).lower() if len(match.groups()) > 1 and match.group(2) else ''
                
                # Convert to INR
                if 'crore' in unit or 'cr' in unit:
                    amount *= 10_000_000
                elif 'lakh' in unit:
                    amount *= 100_000
                elif 'million' in unit:
                    amount *= 1_000_000
                elif 'billion' in unit:
                    amount *= 1_000_000_000
                
                if amount > 10000:  # Minimum sensible budget
                    extracted['budget'] = ExtractedField(
                        value=amount,
                        confidence=0.8,
                        source='regex',
                        raw_text=match.group(0)
                    )
                    break
        
        # Extract location
        for loc_type in ['village', 'district', 'state']:
            patterns = self.compiled_patterns.get('location', [])
            for pattern in patterns:
                if loc_type in pattern.pattern.lower():
                    match = pattern.search(text)
                    if match:
                        extracted[loc_type] = ExtractedField(
                            value=match.group(1).strip(),
                            confidence=0.7,
                            source='regex',
                            raw_text=match.group(0)
                        )
                        break
        
        # Extract dates
        date_patterns = self.compiled_patterns.get('dates', [])
        for pattern in date_patterns:
            match = pattern.search(text)
            if match:
                if 'start' in pattern.pattern.lower():
                    extracted['start_date'] = ExtractedField(
                        value=self._parse_date(match.group(1)),
                        confidence=0.75,
                        source='regex',
                        raw_text=match.group(0)
                    )
                elif 'end' in pattern.pattern.lower() or 'completion' in pattern.pattern.lower():
                    extracted['end_date'] = ExtractedField(
                        value=self._parse_date(match.group(1)),
                        confidence=0.75,
                        source='regex',
                        raw_text=match.group(0)
                    )
        
        # Detect category based on keywords
        category = self._detect_category(text)
        if category:
            extracted['category'] = ExtractedField(
                value=category,
                confidence=0.8,
                source='regex'
            )
        
        return extracted
    
    async def _extract_with_llm(self, text: str) -> Dict[str, ExtractedField]:
        """Stage 2: Extract using LLM (Gemini or HuggingFace) for complex data"""
        prompt = f"""You are an expert government document analyzer. Extract ALL available information from this government scheme document.

DOCUMENT TEXT:
{text[:15000]}

Extract and return ONLY valid JSON with these exact fields (use null for missing data):
{{
    "name": "exact official scheme/project name",
    "category": "one of: Sanitation|Water Supply|Housing|Employment|Power|Roads|Healthcare|Education|Agriculture|Rural Development|Infrastructure|Welfare|Other",
    "description": "2-3 sentence objective description",
    "village": "village name if mentioned",
    "district": "district name",
    "state": "state name",
    "total_budget": 7500000,
    "budget_unit": "INR",
    "start_date": "YYYY-MM-DD format",
    "end_date": "YYYY-MM-DD format",
    "duration_months": 24,
    "implementing_agency": "agency name",
    "nodal_officer": "officer name",
    "target_beneficiaries": "who benefits",
    "beneficiary_count": 5000,
    "objectives": ["objective 1", "objective 2"],
    "phases": [
        {{
            "id": 1,
            "name": "Phase 1",
            "budget": 2500000,
            "start_date": "YYYY-MM-DD",
            "end_date": "YYYY-MM-DD",
            "planned_work": "description of work",
            "milestones": ["milestone 1"],
            "deliverables": ["deliverable 1"]
        }}
    ],
    "key_activities": ["activity 1", "activity 2"],
    "funding_source": "Central/State/Mixed",
    "funding_pattern": {{
        "central_share": 60,
        "state_share": 30,
        "local_share": 10
    }}
}}

IMPORTANT:
- Convert ALL budget figures to INR (rupees). If in Lakhs multiply by 100000, if in Crores multiply by 10000000
- Use ISO date format YYYY-MM-DD
- Extract ALL phases mentioned in the document
- Return ONLY the JSON, no explanations"""

        try:
            response_text = ""
            
            if self.llm_backend == 'gemini' and self.model:
                response = self.model.generate_content(prompt)
                response_text = response.text.strip()
            elif self.llm_backend == 'huggingface' and self.hf_client:
                # Use HuggingFace Inference API
                response = self.hf_client.chat.completions.create(
                    model="mistralai/Mistral-7B-Instruct-v0.3",
                    messages=[
                        {"role": "system", "content": "You are a document extraction expert. Always respond with valid JSON only."},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=4000,
                    temperature=0.1
                )
                response_text = response.choices[0].message.content.strip()
            else:
                return {}
            
            # Clean up response
            response_text = re.sub(r'^```json\s*', '', response_text)
            response_text = re.sub(r'\s*```$', '', response_text)
            
            # Find JSON in response
            json_match = re.search(r'\{[\s\S]*\}', response_text)
            if json_match:
                data = json.loads(json_match.group())
                
                # Convert to ExtractedField format
                extracted = {}
                for key, value in data.items():
                    if value is not None:
                        extracted[key] = ExtractedField(
                            value=value,
                            confidence=0.85,
                            source='llm'
                        )
                return extracted
        except Exception as e:
            print(f"⚠️ LLM extraction error: {e}")
        
        return {}
    
    def _merge_extractions(self, regex_data: Dict, llm_data: Dict) -> SchemeData:
        """Merge regex and LLM extractions, preferring higher confidence"""
        scheme = SchemeData()
        
        # Merge function preferring higher confidence
        def get_best(field: str, default=None):
            regex_field = regex_data.get(field)
            llm_field = llm_data.get(field)
            
            if regex_field and llm_field:
                # Prefer LLM for text fields, regex for numbers
                if isinstance(regex_field.value, (int, float)):
                    return regex_field.value if regex_field.confidence >= llm_field.confidence else llm_field.value
                return llm_field.value if llm_field.confidence >= regex_field.confidence else regex_field.value
            elif regex_field:
                return regex_field.value
            elif llm_field:
                return llm_field.value
            return default
        
        # Apply merged values
        scheme.name = get_best('name', 'Unnamed Scheme')
        scheme.category = get_best('category', 'Other')
        scheme.description = get_best('description', '')
        scheme.village = get_best('village', '')
        scheme.district = get_best('district', '')
        scheme.state = get_best('state', '')
        scheme.total_budget = float(get_best('total_budget', 0) or 0)
        scheme.budget_unit = get_best('budget_unit', 'INR')
        scheme.start_date = get_best('start_date', '')
        scheme.end_date = get_best('end_date', '')
        scheme.duration_months = int(get_best('duration_months', 0) or 0)
        scheme.implementing_agency = get_best('implementing_agency', '')
        scheme.nodal_officer = get_best('nodal_officer', '')
        scheme.target_beneficiaries = get_best('target_beneficiaries', '')
        scheme.beneficiary_count = int(get_best('beneficiary_count', 0) or 0)
        scheme.objectives = get_best('objectives', [])
        scheme.phases = get_best('phases', [])
        scheme.key_activities = get_best('key_activities', [])
        scheme.funding_source = get_best('funding_source', '')
        scheme.funding_pattern = get_best('funding_pattern', {})
        
        return scheme
    
    def _apply_regex_data(self, scheme: SchemeData, regex_data: Dict) -> SchemeData:
        """Apply regex-extracted data to scheme object"""
        if 'name' in regex_data:
            scheme.name = regex_data['name'].value
        if 'budget' in regex_data:
            scheme.total_budget = regex_data['budget'].value
        if 'category' in regex_data:
            scheme.category = regex_data['category'].value
        if 'village' in regex_data:
            scheme.village = regex_data['village'].value
        if 'district' in regex_data:
            scheme.district = regex_data['district'].value
        if 'start_date' in regex_data:
            scheme.start_date = regex_data['start_date'].value
        if 'end_date' in regex_data:
            scheme.end_date = regex_data['end_date'].value
        return scheme
    
    def _detect_category(self, text: str) -> str:
        """Detect scheme category based on keyword frequency"""
        categories = {
            'Sanitation': ['swachh', 'sanitation', 'toilet', 'waste', 'garbage', 'sewage', 'hygiene'],
            'Water Supply': ['water', 'jal', 'supply', 'pipeline', 'tank', 'drinking', 'tap', 'bore'],
            'Housing': ['housing', 'awas', 'shelter', 'home', 'dwelling', 'construction'],
            'Employment': ['employment', 'rozgar', 'job', 'work', 'livelihood', 'mgnrega', 'skill'],
            'Power': ['power', 'electricity', 'bijli', 'solar', 'energy', 'grid', 'electrification'],
            'Roads': ['road', 'path', 'marg', 'highway', 'pmgsy', 'connectivity'],
            'Healthcare': ['health', 'medical', 'hospital', 'clinic', 'ayushman', 'doctor'],
            'Education': ['education', 'school', 'shiksha', 'college', 'student', 'learning'],
            'Agriculture': ['agriculture', 'farming', 'krishi', 'crop', 'irrigation', 'farmer'],
            'Rural Development': ['rural', 'gram', 'panchayat', 'village', 'development'],
        }
        
        text_lower = text.lower()
        scores = {}
        
        for category, keywords in categories.items():
            score = sum(text_lower.count(kw) for kw in keywords)
            if score > 0:
                scores[category] = score
        
        if scores:
            return max(scores, key=scores.get)
        return 'Other'
    
    def _parse_date(self, date_str: str) -> str:
        """Parse date string to YYYY-MM-DD format"""
        parts = re.split(r'[-/]', date_str)
        if len(parts) == 3:
            day, month, year = int(parts[0]), int(parts[1]), int(parts[2])
            if year < 100:
                year += 2000 if year < 50 else 1900
            return f"{year:04d}-{month:02d}-{day:02d}"
        return date_str
    
    def _calculate_confidence(self, scheme: SchemeData) -> float:
        """Calculate overall extraction confidence"""
        score = 0.0
        
        if scheme.name and scheme.name != 'Unnamed Scheme':
            score += 0.2
        if scheme.total_budget > 10000:
            score += 0.2
        if scheme.description and len(scheme.description) > 50:
            score += 0.15
        if scheme.category != 'Other':
            score += 0.1
        if scheme.start_date:
            score += 0.1
        if scheme.end_date:
            score += 0.1
        if scheme.phases and len(scheme.phases) > 0:
            score += 0.15
        
        return min(1.0, score)
    
    async def extract_vendor_report(self, pdf_text: str) -> VendorReportData:
        """Extract structured data from vendor progress report"""
        report = VendorReportData()
        
        # Regex extraction
        regex_data = self._extract_vendor_with_regex(pdf_text)
        
        # LLM extraction
        if self.llm_backend:
            try:
                llm_data = await self._extract_vendor_with_llm(pdf_text)
                report = self._merge_vendor_extractions(regex_data, llm_data)
            except Exception as e:
                print(f"⚠️ Vendor LLM extraction failed: {e}")
                report = self._apply_vendor_regex_data(report, regex_data)
        else:
            report = self._apply_vendor_regex_data(report, regex_data)
        
        report.extraction_confidence = self._calculate_vendor_confidence(report)
        return report
    
    def _extract_vendor_with_regex(self, text: str) -> Dict[str, ExtractedField]:
        """Extract vendor report fields with regex"""
        extracted = {}
        
        # Vendor name
        for pattern in self.compiled_patterns.get('vendor', []):
            match = pattern.search(text)
            if match:
                extracted['vendor_name'] = ExtractedField(
                    value=match.group(1).strip(),
                    confidence=0.7,
                    source='regex'
                )
                break
        
        # Expense claimed
        for pattern in self.compiled_patterns.get('expense', []):
            match = pattern.search(text)
            if match:
                amount = float(match.group(1).replace(',', ''))
                extracted['expense_claimed'] = ExtractedField(
                    value=amount,
                    confidence=0.75,
                    source='regex'
                )
                break
        
        # Phase number
        phase_match = re.search(r'phase[\s:-]*(\d+)', text, re.IGNORECASE)
        if phase_match:
            extracted['phase'] = ExtractedField(
                value=int(phase_match.group(1)),
                confidence=0.8,
                source='regex'
            )
        
        # Report date
        date_match = re.search(r'(?:date|submitted|report\s+date)[\s:-]+(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})', text, re.IGNORECASE)
        if date_match:
            extracted['report_date'] = ExtractedField(
                value=self._parse_date(date_match.group(1)),
                confidence=0.75,
                source='regex'
            )
        
        return extracted
    
    async def _extract_vendor_with_llm(self, text: str) -> Dict[str, ExtractedField]:
        """Extract vendor report using LLM"""
        prompt = f"""Analyze this vendor progress report and extract all details.

VENDOR REPORT TEXT:
{text[:15000]}

Return ONLY valid JSON:
{{
    "vendor_name": "company name",
    "vendor_contact": "contact details",
    "report_date": "YYYY-MM-DD",
    "report_period": "Month X to Month Y",
    "phase_reported": 1,
    "work_completed": "summary of completed work",
    "work_in_progress": "ongoing work",
    "work_pending": "remaining work",
    "expense_claimed": 2500000,
    "expense_breakdown": {{
        "materials": 1000000,
        "labor": 800000,
        "equipment": 500000,
        "overheads": 200000
    }},
    "materials_used": [
        {{"name": "cement", "quantity": "500 bags", "cost": 250000}},
        {{"name": "steel", "quantity": "5 tons", "cost": 400000}}
    ],
    "labor_details": {{
        "skilled": 20,
        "unskilled": 50,
        "total_mandays": 1500
    }},
    "milestones_achieved": ["milestone 1", "milestone 2"],
    "issues_faced": ["issue 1", "issue 2"],
    "quality_certifications": ["inspection passed on date"],
    "next_steps": "planned activities",
    "expected_completion": "YYYY-MM-DD"
}}

IMPORTANT:
- Convert ALL amounts to INR
- Be specific about quantities and costs
- List ALL issues and delays mentioned"""

        try:
            response_text = ""
            
            if self.llm_backend == 'gemini' and self.model:
                response = self.model.generate_content(prompt)
                response_text = response.text.strip()
            elif self.llm_backend == 'huggingface' and self.hf_client:
                response = self.hf_client.chat.completions.create(
                    model="mistralai/Mistral-7B-Instruct-v0.3",
                    messages=[
                        {"role": "system", "content": "You are a document extraction expert. Always respond with valid JSON only."},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=4000,
                    temperature=0.1
                )
                response_text = response.choices[0].message.content.strip()
            else:
                return {}
            
            response_text = re.sub(r'^```json\s*', '', response_text)
            response_text = re.sub(r'\s*```$', '', response_text)
            
            json_match = re.search(r'\{[\s\S]*\}', response_text)
            if json_match:
                data = json.loads(json_match.group())
                extracted = {}
                for key, value in data.items():
                    if value is not None:
                        extracted[key] = ExtractedField(
                            value=value,
                            confidence=0.85,
                            source='llm'
                        )
                return extracted
            
            json_match = re.search(r'\{[\s\S]*\}', response_text)
            if json_match:
                data = json.loads(json_match.group())
                extracted = {}
                for key, value in data.items():
                    if value is not None:
                        extracted[key] = ExtractedField(
                            value=value,
                            confidence=0.85,
                            source='llm'
                        )
                return extracted
        except Exception as e:
            print(f"⚠️ Vendor LLM error: {e}")
        
        return {}
    
    def _merge_vendor_extractions(self, regex_data: Dict, llm_data: Dict) -> VendorReportData:
        """Merge vendor extractions"""
        report = VendorReportData()
        
        def get_best(field, default=None):
            r = regex_data.get(field)
            l = llm_data.get(field)
            if r and l:
                return l.value if l.confidence >= r.confidence else r.value
            return (l.value if l else None) or (r.value if r else None) or default
        
        report.vendor_name = get_best('vendor_name', 'Unknown Vendor')
        report.vendor_contact = get_best('vendor_contact', '')
        report.report_date = get_best('report_date', datetime.now().strftime('%Y-%m-%d'))
        report.report_period = get_best('report_period', '')
        report.phase_reported = int(get_best('phase_reported', 1) or 1)
        report.work_completed = get_best('work_completed', '')
        report.work_in_progress = get_best('work_in_progress', '')
        report.work_pending = get_best('work_pending', '')
        report.expense_claimed = float(get_best('expense_claimed', 0) or 0)
        report.expense_breakdown = get_best('expense_breakdown', {})
        report.materials_used = get_best('materials_used', [])
        report.labor_details = get_best('labor_details', {})
        report.milestones_achieved = get_best('milestones_achieved', [])
        report.issues_faced = get_best('issues_faced', [])
        report.quality_certifications = get_best('quality_certifications', [])
        report.next_steps = get_best('next_steps', '')
        report.expected_completion = get_best('expected_completion', '')
        
        return report
    
    def _apply_vendor_regex_data(self, report: VendorReportData, data: Dict) -> VendorReportData:
        """Apply regex data to vendor report"""
        if 'vendor_name' in data:
            report.vendor_name = data['vendor_name'].value
        if 'expense_claimed' in data:
            report.expense_claimed = data['expense_claimed'].value
        if 'phase' in data:
            report.phase_reported = data['phase'].value
        if 'report_date' in data:
            report.report_date = data['report_date'].value
        return report
    
    def _calculate_vendor_confidence(self, report: VendorReportData) -> float:
        """Calculate vendor report extraction confidence"""
        score = 0.0
        if report.vendor_name and report.vendor_name != 'Unknown Vendor':
            score += 0.2
        if report.expense_claimed > 0:
            score += 0.25
        if report.work_completed:
            score += 0.2
        if report.milestones_achieved:
            score += 0.15
        if report.expense_breakdown:
            score += 0.2
        return min(1.0, score)
    
    async def analyze_discrepancies(
        self,
        scheme: SchemeData,
        vendor_report: VendorReportData,
        thresholds: Optional[Dict] = None
    ) -> ComplianceAnalysis:
        """
        AI-powered discrepancy detection between government plan and vendor report.
        
        Args:
            scheme: Extracted government scheme data
            vendor_report: Extracted vendor report data
            thresholds: Custom thresholds for flagging (default: 10% budget, 30 days delay)
        """
        thresholds = thresholds or {
            'budget_variance_critical': 20,  # >20% over budget = critical
            'budget_variance_high': 10,      # >10% over budget = high
            'budget_variance_medium': 5,     # >5% over budget = medium
            'timeline_delay_critical': 60,   # >60 days delay = critical
            'timeline_delay_high': 30,       # >30 days delay = high
            'timeline_delay_medium': 14,     # >14 days delay = medium
        }
        
        analysis = ComplianceAnalysis()
        discrepancies = []
        
        # 1. BUDGET ANALYSIS
        if scheme.total_budget > 0 and vendor_report.expense_claimed > 0:
            budget_variance = vendor_report.expense_claimed - scheme.total_budget
            variance_pct = (budget_variance / scheme.total_budget) * 100
            
            if variance_pct > thresholds['budget_variance_critical']:
                discrepancies.append(Discrepancy(
                    category='budget',
                    severity=DiscrepancySeverity.CRITICAL,
                    title='Critical Budget Overrun',
                    description=f"Vendor claimed ₹{vendor_report.expense_claimed:,.0f} which is {variance_pct:.1f}% over the allocated budget of ₹{scheme.total_budget:,.0f}",
                    planned_value=f"₹{scheme.total_budget:,.0f}",
                    actual_value=f"₹{vendor_report.expense_claimed:,.0f}",
                    variance=budget_variance,
                    variance_percentage=variance_pct,
                    recommendation="Immediate audit required. Verify all expense claims with supporting documents.",
                    evidence=[f"Budget allocated: ₹{scheme.total_budget:,.0f}", f"Amount claimed: ₹{vendor_report.expense_claimed:,.0f}"]
                ))
                analysis.budget_compliance = max(0, 100 - variance_pct)
            elif variance_pct > thresholds['budget_variance_high']:
                discrepancies.append(Discrepancy(
                    category='budget',
                    severity=DiscrepancySeverity.HIGH,
                    title='Significant Budget Overrun',
                    description=f"Expenses exceed budget by {variance_pct:.1f}%",
                    planned_value=f"₹{scheme.total_budget:,.0f}",
                    actual_value=f"₹{vendor_report.expense_claimed:,.0f}",
                    variance=budget_variance,
                    variance_percentage=variance_pct,
                    recommendation="Review expense breakdown and request detailed justification for overrun."
                ))
                analysis.budget_compliance = max(0, 100 - variance_pct)
            elif variance_pct > thresholds['budget_variance_medium']:
                discrepancies.append(Discrepancy(
                    category='budget',
                    severity=DiscrepancySeverity.MEDIUM,
                    title='Budget Variance Detected',
                    description=f"Expenses are {variance_pct:.1f}% over budget",
                    planned_value=f"₹{scheme.total_budget:,.0f}",
                    actual_value=f"₹{vendor_report.expense_claimed:,.0f}",
                    variance=budget_variance,
                    variance_percentage=variance_pct,
                    recommendation="Monitor closely. Request explanation if trend continues."
                ))
                analysis.budget_compliance = max(0, 100 - variance_pct)
            else:
                analysis.budget_compliance = 100 - abs(variance_pct)
                if variance_pct >= 0:
                    analysis.matching_items.append(f"Budget within acceptable limits ({variance_pct:.1f}% variance)")
        else:
            analysis.budget_compliance = 50  # Unknown
        
        # 2. TIMELINE ANALYSIS
        # Check for delays mentioned in issues
        delay_keywords = ['delay', 'late', 'behind schedule', 'overdue', 'pending', 'postpone']
        issues_text = ' '.join(vendor_report.issues_faced).lower()
        
        delay_detected = any(kw in issues_text for kw in delay_keywords)
        if delay_detected:
            # Try to extract delay days
            delay_match = re.search(r'(\d+)\s*(?:days?|weeks?|months?)', issues_text)
            delay_days = 0
            if delay_match:
                delay_value = int(delay_match.group(1))
                if 'week' in issues_text:
                    delay_days = delay_value * 7
                elif 'month' in issues_text:
                    delay_days = delay_value * 30
                else:
                    delay_days = delay_value
            else:
                delay_days = 30  # Assume moderate delay
            
            severity = (
                DiscrepancySeverity.CRITICAL if delay_days > thresholds['timeline_delay_critical']
                else DiscrepancySeverity.HIGH if delay_days > thresholds['timeline_delay_high']
                else DiscrepancySeverity.MEDIUM if delay_days > thresholds['timeline_delay_medium']
                else DiscrepancySeverity.LOW
            )
            
            discrepancies.append(Discrepancy(
                category='timeline',
                severity=severity,
                title='Project Timeline Delay',
                description=f"Project is delayed by approximately {delay_days} days",
                planned_value=scheme.end_date or 'As per schedule',
                actual_value=f"Delayed by {delay_days} days",
                variance=float(delay_days),
                recommendation="Review delay causes and create recovery plan."
            ))
            
            analysis.timeline_compliance = max(0, 100 - (delay_days / 3))  # 3 days = 1% penalty
            
            # Add to overdue work
            analysis.overdue_work.append({
                'task': 'Overall project timeline',
                'planned_date': scheme.end_date,
                'delay_days': delay_days,
                'status': 'delayed'
            })
        else:
            analysis.timeline_compliance = 90  # Assume mostly on track
            analysis.matching_items.append("No significant timeline delays reported")
        
        # 3. SCOPE/QUALITY ANALYSIS
        quality_issues = [
            issue for issue in vendor_report.issues_faced
            if any(kw in issue.lower() for kw in ['quality', 'defect', 'rework', 'fail', 'reject', 'demolish'])
        ]
        
        if quality_issues:
            severity = DiscrepancySeverity.CRITICAL if any(
                kw in ' '.join(quality_issues).lower() 
                for kw in ['demolish', 'reject', 'fail']
            ) else DiscrepancySeverity.HIGH
            
            discrepancies.append(Discrepancy(
                category='quality',
                severity=severity,
                title='Quality Issues Detected',
                description=f"Quality concerns reported: {', '.join(quality_issues[:3])}",
                planned_value='Quality standards as per specification',
                actual_value='Quality issues identified',
                recommendation="Conduct quality inspection and verification."
            ))
            analysis.quality_compliance = 60
        else:
            analysis.quality_compliance = 85
            if vendor_report.quality_certifications:
                analysis.matching_items.append(f"Quality certifications: {', '.join(vendor_report.quality_certifications[:2])}")
        
        # 4. SCOPE COMPLIANCE
        if vendor_report.milestones_achieved:
            analysis.matching_items.extend([f"✓ {m}" for m in vendor_report.milestones_achieved[:5]])
            analysis.scope_compliance = min(100, len(vendor_report.milestones_achieved) * 20)
        else:
            analysis.scope_compliance = 50
        
        # 5. CALCULATE OVERALL COMPLIANCE
        analysis.overall_compliance = (
            analysis.budget_compliance * 0.35 +
            analysis.timeline_compliance * 0.25 +
            analysis.scope_compliance * 0.25 +
            analysis.quality_compliance * 0.15
        )
        
        # 6. DETERMINE RISK LEVEL
        critical_count = sum(1 for d in discrepancies if d.severity == DiscrepancySeverity.CRITICAL)
        high_count = sum(1 for d in discrepancies if d.severity == DiscrepancySeverity.HIGH)
        
        if critical_count > 0:
            analysis.risk_level = 'critical'
        elif high_count >= 2:
            analysis.risk_level = 'high'
        elif high_count == 1 or len(discrepancies) >= 3:
            analysis.risk_level = 'medium'
        else:
            analysis.risk_level = 'low'
        
        analysis.discrepancies = discrepancies
        
        # 7. GENERATE AI SUMMARY (if available)
        if self.llm_backend:
            analysis.ai_summary = await self._generate_ai_summary(scheme, vendor_report, analysis)
            analysis.recommendations = await self._generate_recommendations(analysis)
        else:
            analysis.ai_summary = self._generate_basic_summary(analysis)
            analysis.recommendations = [d.recommendation for d in discrepancies if d.recommendation]
        
        return analysis
    
    async def _generate_ai_summary(
        self,
        scheme: SchemeData,
        report: VendorReportData,
        analysis: ComplianceAnalysis
    ) -> str:
        """Generate AI-powered executive summary"""
        prompt = f"""You are a government compliance auditor. Provide a concise executive summary (4-5 sentences).

SCHEME: {scheme.name}
- Budget: ₹{scheme.total_budget:,.0f}
- Timeline: {scheme.start_date} to {scheme.end_date}

VENDOR REPORT:
- Vendor: {report.vendor_name}
- Phase: {report.phase_reported}
- Expense Claimed: ₹{report.expense_claimed:,.0f}
- Work Completed: {report.work_completed}

ANALYSIS:
- Overall Compliance: {analysis.overall_compliance:.1f}%
- Budget Compliance: {analysis.budget_compliance:.1f}%
- Timeline Compliance: {analysis.timeline_compliance:.1f}%
- Discrepancies Found: {len(analysis.discrepancies)}
- Risk Level: {analysis.risk_level.upper()}

Discrepancy Details:
{chr(10).join(f"- [{d.severity.value.upper()}] {d.title}: {d.description}" for d in analysis.discrepancies[:5])}

Write a professional executive summary covering:
1. Overall project status
2. Major achievements
3. Critical concerns
4. Budget status
5. Recommended next steps

Be specific and actionable."""

        try:
            response_text = ""
            
            if self.llm_backend == 'gemini' and self.model:
                response = self.model.generate_content(prompt)
                response_text = response.text.strip()
            elif self.llm_backend == 'huggingface' and self.hf_client:
                response = self.hf_client.chat.completions.create(
                    model="mistralai/Mistral-7B-Instruct-v0.3",
                    messages=[
                        {"role": "system", "content": "You are a professional government compliance auditor."},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=1000,
                    temperature=0.3
                )
                response_text = response.choices[0].message.content.strip()
            else:
                return self._generate_basic_summary(analysis)
            
            return response_text
        except Exception as e:
            return self._generate_basic_summary(analysis)
    
    async def _generate_recommendations(self, analysis: ComplianceAnalysis) -> List[str]:
        """Generate prioritized recommendations"""
        recommendations = []
        
        # Priority: Critical -> High -> Medium -> Low
        for severity in [DiscrepancySeverity.CRITICAL, DiscrepancySeverity.HIGH, 
                        DiscrepancySeverity.MEDIUM, DiscrepancySeverity.LOW]:
            for d in analysis.discrepancies:
                if d.severity == severity and d.recommendation:
                    recommendations.append(f"[{severity.value.upper()}] {d.recommendation}")
        
        return recommendations[:5]  # Top 5 recommendations
    
    def _generate_basic_summary(self, analysis: ComplianceAnalysis) -> str:
        """Generate basic summary without AI"""
        status = "satisfactory" if analysis.overall_compliance >= 80 else \
                 "requires attention" if analysis.overall_compliance >= 60 else \
                 "critical review needed"
        
        return f"""Compliance Analysis Complete. 
Overall compliance score: {analysis.overall_compliance:.1f}% ({status}).
{len(analysis.discrepancies)} discrepancies identified.
Risk level: {analysis.risk_level.upper()}.
{len(analysis.matching_items)} items verified successfully."""


# ============= API Functions for Backend Integration =============

async def extract_scheme_from_pdf_pathway(pdf_buffer: bytes) -> Dict:
    """API function to extract scheme from PDF buffer"""
    extractor = PathwayDocumentExtractor()
    
    try:
        pdf_text = extractor.extract_text_from_buffer(pdf_buffer)
        scheme = await extractor.extract_scheme_data(pdf_text)
        
        return {
            'success': True,
            'data': asdict(scheme),
            'rawText': pdf_text[:1000],
            'extractionMethod': scheme.extraction_method,
            'confidence': scheme.extraction_confidence
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'data': None
        }


async def analyze_vendor_report_pathway(
    pdf_buffer: bytes,
    government_plan: Dict
) -> Dict:
    """API function to analyze vendor report against government plan"""
    extractor = PathwayDocumentExtractor()
    
    try:
        pdf_text = extractor.extract_text_from_buffer(pdf_buffer)
        vendor_report = await extractor.extract_vendor_report(pdf_text)
        
        # Convert government plan dict to SchemeData
        scheme = SchemeData(
            name=government_plan.get('name', ''),
            total_budget=float(government_plan.get('totalBudget', 0)),
            start_date=government_plan.get('startDate', ''),
            end_date=government_plan.get('endDate', ''),
            phases=government_plan.get('phases', [])
        )
        
        analysis = await extractor.analyze_discrepancies(scheme, vendor_report)
        
        # Convert to JSON-serializable format
        discrepancies_dict = []
        for d in analysis.discrepancies:
            discrepancies_dict.append({
                'category': d.category,
                'severity': d.severity.value,
                'title': d.title,
                'description': d.description,
                'plannedValue': d.planned_value,
                'actualValue': d.actual_value,
                'variance': d.variance,
                'variancePercentage': d.variance_percentage,
                'recommendation': d.recommendation,
                'evidence': d.evidence
            })
        
        return {
            'success': True,
            'analysis': {
                'overallCompliance': analysis.overall_compliance,
                'budgetCompliance': analysis.budget_compliance,
                'timelineCompliance': analysis.timeline_compliance,
                'scopeCompliance': analysis.scope_compliance,
                'qualityCompliance': analysis.quality_compliance,
                'vendorName': vendor_report.vendor_name,
                'reportDate': vendor_report.report_date,
                'phase': vendor_report.phase_reported,
                'workCompleted': vendor_report.work_completed,
                'expenseClaimed': vendor_report.expense_claimed,
                'expenseBreakdown': vendor_report.expense_breakdown,
                'matchingItems': analysis.matching_items,
                'discrepancies': discrepancies_dict,
                'overdueWork': analysis.overdue_work,
                'riskLevel': analysis.risk_level,
                'aiSummary': analysis.ai_summary,
                'recommendations': analysis.recommendations
            },
            'aiProcessed': True,
            'analysisMethod': 'pathway_ai'
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {
            'success': False,
            'error': str(e),
            'analysis': {
                'overallCompliance': 0,
                'matchingItems': [],
                'discrepancies': [],
                'overdueWork': [],
                'aiSummary': 'Analysis failed. Manual review required.',
                'aiProcessed': False
            }
        }


# CLI for testing
if __name__ == "__main__":
    import asyncio
    
    async def test():
        extractor = PathwayDocumentExtractor()
        
        # Test with sample text
        sample_text = """
        PRADHAN MANTRI GRAM SADAK YOJANA (PMGSY)
        Phase III Implementation Plan
        
        Project: Rural Road Connectivity - Rampur Village
        District: Varanasi
        State: Uttar Pradesh
        
        Total Project Budget: Rs. 75.50 Lakhs
        Duration: 24 months
        Start Date: 01-04-2025
        End Date: 31-03-2027
        
        Implementing Agency: Public Works Department
        Nodal Officer: Shri Rajesh Kumar
        
        Objectives:
        1. Construct 5 km all-weather road
        2. Connect Rampur village to district headquarters
        3. Benefit 5000 villagers
        
        Phase 1 (Month 1-6): Survey and Design - Budget Rs. 5 Lakhs
        Phase 2 (Month 7-18): Road Construction - Budget Rs. 60 Lakhs
        Phase 3 (Month 19-24): Finishing and Handover - Budget Rs. 10.50 Lakhs
        """
        
        print("Testing scheme extraction...")
        scheme = await extractor.extract_scheme_data(sample_text)
        print(f"Extracted scheme: {scheme.name}")
        print(f"Budget: ₹{scheme.total_budget:,.0f}")
        print(f"Confidence: {scheme.extraction_confidence:.2%}")
    
    asyncio.run(test())
