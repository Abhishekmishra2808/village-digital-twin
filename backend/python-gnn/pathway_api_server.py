"""
FastAPI Server for Pathway Document Extraction

This server provides REST API endpoints for document extraction and
discrepancy analysis using the Pathway-based extraction pipeline.

Endpoints:
- POST /extract-scheme: Extract scheme data from PDF
- POST /analyze-vendor-report: Analyze vendor report against government plan
- GET /health: Health check
"""

import os
import sys
import json
import asyncio
from typing import Dict, Optional
from datetime import datetime
from pathlib import Path

# Load environment variables from parent .env file
from dotenv import load_dotenv
env_path = Path(__file__).parent.parent / '.env'
if env_path.exists():
    load_dotenv(env_path)
    print(f"✅ Loaded environment from {env_path}")

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn

# Import our extractor
from pathway_document_extractor import (
    PathwayDocumentExtractor,
    extract_scheme_from_pdf_pathway,
    analyze_vendor_report_pathway,
    SchemeData,
    VendorReportData
)

# Create FastAPI app
app = FastAPI(
    title="Pathway Document Extraction API",
    description="AI-powered government scheme document extraction and vendor report analysis",
    version="1.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize extractor
extractor = PathwayDocumentExtractor()


class GovernmentPlanInput(BaseModel):
    """Input model for government plan"""
    name: str
    totalBudget: float
    startDate: Optional[str] = ""
    endDate: Optional[str] = ""
    phases: Optional[list] = []
    description: Optional[str] = ""
    village: Optional[str] = ""
    district: Optional[str] = ""


class ExtractionResponse(BaseModel):
    """Response model for extraction"""
    success: bool
    data: Optional[Dict] = None
    error: Optional[str] = None
    rawText: Optional[str] = None
    extractionMethod: Optional[str] = None
    confidence: Optional[float] = None


class AnalysisResponse(BaseModel):
    """Response model for vendor analysis"""
    success: bool
    analysis: Optional[Dict] = None
    error: Optional[str] = None
    aiProcessed: bool = False
    analysisMethod: Optional[str] = None


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Pathway Document Extraction API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "/extract-scheme": "POST - Extract scheme data from PDF",
            "/analyze-vendor-report": "POST - Analyze vendor report",
            "/health": "GET - Health check"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "llm_backend": extractor.llm_backend,
        "gemini_available": extractor.model is not None,
        "huggingface_available": extractor.hf_client is not None
    }


@app.post("/extract-scheme", response_model=ExtractionResponse)
async def extract_scheme(file: UploadFile = File(...)):
    """
    Extract structured scheme data from uploaded PDF.
    
    - **file**: PDF file containing government scheme document
    
    Returns extracted scheme data with confidence score.
    """
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    try:
        # Read PDF buffer
        pdf_buffer = await file.read()
        print(f"📄 Processing scheme PDF: {file.filename}, Size: {len(pdf_buffer)} bytes")
        
        # Extract using Pathway
        result = await extract_scheme_from_pdf_pathway(pdf_buffer)
        
        if result['success']:
            print(f"✅ Extraction successful, confidence: {result.get('confidence', 0):.2%}")
        else:
            print(f"❌ Extraction failed: {result.get('error')}")
        
        return ExtractionResponse(**result)
    
    except Exception as e:
        print(f"❌ Error processing PDF: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze-vendor-report", response_model=AnalysisResponse)
async def analyze_vendor_report(
    file: UploadFile = File(...),
    government_plan: str = Form(...)
):
    """
    Analyze vendor report against government plan and detect discrepancies.
    
    - **file**: PDF file containing vendor progress report
    - **government_plan**: JSON string of the government scheme plan
    
    Returns compliance analysis with discrepancies and recommendations.
    """
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    try:
        # Parse government plan JSON
        try:
            gov_plan = json.loads(government_plan)
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=400, detail=f"Invalid government_plan JSON: {e}")
        
        # Read PDF buffer
        pdf_buffer = await file.read()
        print(f"📊 Analyzing vendor report: {file.filename}, Size: {len(pdf_buffer)} bytes")
        print(f"📋 Government plan: {gov_plan.get('name', 'Unknown')}")
        
        # Analyze using Pathway
        result = await analyze_vendor_report_pathway(pdf_buffer, gov_plan)
        
        if result['success']:
            analysis = result['analysis']
            print(f"✅ Analysis complete:")
            print(f"   - Compliance: {analysis.get('overallCompliance', 0):.1f}%")
            print(f"   - Discrepancies: {len(analysis.get('discrepancies', []))}")
            print(f"   - Risk Level: {analysis.get('riskLevel', 'unknown')}")
        else:
            print(f"❌ Analysis failed: {result.get('error')}")
        
        return AnalysisResponse(**result)
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error analyzing report: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/extract-text")
async def extract_text(file: UploadFile = File(...)):
    """
    Extract raw text from PDF for debugging.
    
    - **file**: PDF file to extract text from
    
    Returns raw extracted text.
    """
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    try:
        pdf_buffer = await file.read()
        text = extractor.extract_text_from_buffer(pdf_buffer)
        
        return {
            "success": True,
            "text": text,
            "length": len(text),
            "filename": file.filename
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/batch-analyze")
async def batch_analyze(
    scheme_file: UploadFile = File(...),
    vendor_files: list[UploadFile] = File(...)
):
    """
    Batch analyze multiple vendor reports against a scheme.
    
    - **scheme_file**: Government scheme PDF
    - **vendor_files**: List of vendor report PDFs
    
    Returns aggregated analysis across all vendor reports.
    """
    try:
        # Extract scheme
        scheme_buffer = await scheme_file.read()
        scheme_result = await extract_scheme_from_pdf_pathway(scheme_buffer)
        
        if not scheme_result['success']:
            raise HTTPException(status_code=400, detail="Failed to extract scheme data")
        
        gov_plan = scheme_result['data']
        
        # Analyze each vendor report
        analyses = []
        for vf in vendor_files:
            vendor_buffer = await vf.read()
            analysis = await analyze_vendor_report_pathway(vendor_buffer, gov_plan)
            analyses.append({
                "filename": vf.filename,
                "success": analysis['success'],
                "analysis": analysis.get('analysis')
            })
        
        # Aggregate results
        total_compliance = sum(
            a['analysis']['overallCompliance'] 
            for a in analyses 
            if a['success'] and a['analysis']
        ) / len(analyses) if analyses else 0
        
        all_discrepancies = []
        for a in analyses:
            if a['success'] and a['analysis']:
                all_discrepancies.extend(a['analysis'].get('discrepancies', []))
        
        return {
            "success": True,
            "scheme": gov_plan,
            "vendorAnalyses": analyses,
            "aggregated": {
                "averageCompliance": total_compliance,
                "totalDiscrepancies": len(all_discrepancies),
                "criticalCount": sum(1 for d in all_discrepancies if d.get('severity') == 'critical'),
                "highCount": sum(1 for d in all_discrepancies if d.get('severity') == 'high')
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    port = int(os.getenv("PATHWAY_EXTRACTOR_PORT", "8080"))
    print(f"🚀 Starting Pathway Document Extraction API on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
