# Government Scheme Management Workflow

## Complete 4-Step Process

### ✅ STEP 1: Government Uploads Scheme PDF
**Location:** Admin Dashboard → SchemesView → "Add New Scheme" button

**Process:**
1. Admin clicks "Add New Scheme"
2. Uploads PDF of government scheme/mission document
3. **Backend Processing** (`backend/routes/schemes.js` → `POST /api/schemes/extract-from-pdf`):
   - Extracts text from PDF using `pdf-parse-new`
   - **Regex Extraction** (Fast & Reliable):
     - Scheme Name
     - Budget (crores/lakhs → converted to rupees)
     - Start/End Dates
     - Village/District
     - Category (Sanitation, Water, Housing, etc.)
     - Description
     - **Phase-wise Plans** (Phase 1, 2, 3, 4 with planned work)
   - **LLM (Gemini AI)** fills missing fields if regex fails
   - Combines both for best accuracy

**Output:**
```json
{
  "name": "Swachh Bharat Abhiyan - Village Sanitation",
  "category": "Sanitation",
  "totalBudget": 5000000,
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "phases": [
    {
      "id": 1,
      "name": "Phase 1",
      "plannedWork": "Construction of 50 toilets",
      "budget": 1250000,
      "milestones": ["Site survey", "Foundation work"],
      "deliverables": ["50 toilet units"]
    }
  ]
}
```

4. Admin reviews extracted data
5. Admin clicks "Submit" → Scheme saved to MongoDB

---

### ✅ STEP 2: Vendor Uploads Progress Report PDF
**Location:** Admin Dashboard → SchemesView → Scheme Details → "Vendor Reports" tab

**Process:**
1. Admin/Vendor uploads vendor's progress report PDF
2. **Backend Processing** (`backend/routes/schemes.js` → `POST /api/schemes/:id/vendor-report`):
   - Extracts text from vendor PDF
   - Retrieves original government plan from database
   - **LLM Analysis** (`backend/utils/pdfService.js` → `analyzeVendorReport`):
     - Compares vendor report against government plan
     - Analyzes phase-wise compliance
     - Calculates overall compliance score (0-100%)

---

### ✅ STEP 3: AI Compares & Detects Discrepancies
**Automated by LLM (Gemini AI)**

**Comparison Points:**
1. **Budget Analysis:**
   - Planned Budget vs Claimed Expense
   - Variance calculation
   - Identifies overruns

2. **Timeline Analysis:**
   - Planned completion dates vs Actual
   - Calculates delay in days
   - Flags overdue work

3. **Scope/Quality Analysis:**
   - Planned work vs Completed work
   - Quality standards compliance
   - Deliverables matching

4. **Discrepancy Detection:**
   - Category: budget, timeline, quality, scope
   - Severity: critical, high, medium, low
   - Detailed description with planned vs actual values

**Output Structure:**
```json
{
  "overallCompliance": 75,
  "vendorName": "ABC Contractors",
  "phase": 1,
  "workCompleted": "40 toilets constructed, foundation laid for 10 more",
  "expenseClaimed": 1500000,
  "matchingItems": [
    "Quality of construction meets standards",
    "Materials used as per specifications"
  ],
  "discrepancies": [
    {
      "category": "budget",
      "severity": "high",
      "description": "Budget overrun in cement procurement",
      "plannedValue": "₹300,000",
      "actualValue": "₹450,000"
    },
    {
      "category": "timeline",
      "severity": "medium",
      "description": "Toilet construction behind schedule",
      "plannedValue": "50 units by Oct 15",
      "actualValue": "40 units completed"
    }
  ],
  "overdueWork": [
    {
      "task": "Complete 10 remaining toilet units",
      "plannedDate": "2024-10-15",
      "currentStatus": "Foundation only",
      "delayDays": 20
    }
  ],
  "budgetAnalysis": {
    "plannedBudget": 1250000,
    "claimedExpense": 1500000,
    "variance": 250000,
    "variancePercentage": 20
  },
  "aiSummary": "Vendor has completed 80% of Phase 1 work with moderate delays and budget overruns. Quality standards are being met but timeline needs attention."
}
```

---

### ✅ STEP 4: Reflect in Admin Portal
**Location:** Admin Dashboard → SchemesView

**Visual Indicators:**

1. **Scheme Cards:**
   - Status badge: "DISCREPANT" (red) if critical issues found
   - Quick alerts showing vendor discrepancies
   - Overdue work count
   - Compliance percentage badge

2. **Scheme Details Modal → Overview Tab:**
   - Critical Discrepancies section (red alert box)
   - Shows all discrepancies with severity
   - Links to vendor report

3. **Scheme Details Modal → Vendor Reports Tab:**
   - List of all vendor reports
   - Compliance Score (color-coded: green >80%, yellow 60-80%, red <60%)
   - Verification Status badge
   - **AI Analysis Summary** (blue box)
   - **Matching Items** (green, checkmarks)
   - **Discrepancies Found** (red, with severity badges)
   - **Overdue Work** (orange, with delay days)
   - **Budget Analysis** (charts showing planned vs actual)

4. **KPI Dashboard:**
   - Total schemes with discrepancies count
   - Alert system for critical issues
   - Real-time WebSocket updates when new reports uploaded

---

## File Structure

### Backend
```
backend/
├── routes/schemes.js
│   ├── POST /api/schemes/extract-from-pdf  # Step 1: Extract govt scheme
│   ├── POST /api/schemes/:id/vendor-report # Step 2: Upload vendor report
│   └── DELETE /api/schemes/:id             # Admin: Delete scheme
├── utils/
│   ├── pdfService.js
│   │   ├── extractSchemeFromPDF()          # Regex + LLM extraction
│   │   └── analyzeVendorReport()           # AI comparison & analysis
│   └── geminiService.js                    # LLM processing
└── models/Scheme.js                        # MongoDB schema
```

### Frontend
```
src/
├── components/Views/SchemesView.tsx
│   ├── AddSchemeModal                      # Step 1: Upload govt PDF
│   ├── SchemeDetailsModal                  # Step 4: View results
│   └── VendorReportsTab                    # Step 2 & 4: Upload & view vendor reports
└── store/villageStore.ts                   # State management
```

---

## API Endpoints

### 1. Extract Government Scheme from PDF
```
POST /api/schemes/extract-from-pdf
Content-Type: multipart/form-data
Body: { pdf: <file> }

Response:
{
  "success": true,
  "data": { name, category, budget, phases, ... },
  "message": "Scheme data extracted successfully"
}
```

### 2. Create New Scheme
```
POST /api/schemes
Content-Type: application/json
Body: { name, description, totalBudget, phases, ... }

Response:
{
  "success": true,
  "scheme": { id, name, ... }
}
```

### 3. Upload Vendor Report
```
POST /api/schemes/:id/vendor-report
Content-Type: multipart/form-data
Body: { pdf: <file> }

Response:
{
  "success": true,
  "report": {
    id, vendorName, complianceAnalysis: {
      overallCompliance, discrepancies, overdueWork, ...
    }
  }
}
```

### 4. Get All Schemes
```
GET /api/schemes

Response:
{
  "schemes": [
    { id, name, vendorReports, discrepancies, ... }
  ]
}
```

### 5. Delete Scheme (Admin Only)
```
DELETE /api/schemes/:id

Response:
{
  "success": true,
  "message": "Scheme deleted successfully"
}
```

---

## AI/LLM Integration

### Models Used:
- **Gemini 2.5 Flash** (Fast, cost-effective for document analysis)

### Key Features:
1. **Regex-First Approach:** Fast extraction of structured data
2. **LLM Fallback:** Fills gaps where regex fails
3. **Comprehensive Comparison:** Phase-wise, budget, timeline, quality
4. **Severity Classification:** Critical/High/Medium/Low for prioritization
5. **Anonymized Feedback:** Citizen feedback processed with privacy protection

---

## Workflow Summary

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Government Uploads PDF                              │
│ ┌─────────┐  Regex  ┌──────┐  LLM    ┌──────────┐          │
│ │ Govt PDF├────────►│Parsed├────────►│Structured│          │
│ └─────────┘         └──────┘         └────┬─────┘          │
│                                            │                 │
│                                            ▼                 │
│                                    ┌──────────────┐          │
│                                    │ MongoDB      │          │
│                                    │ Scheme Saved │          │
│                                    └──────┬───────┘          │
└───────────────────────────────────────────┼──────────────────┘
                                            │
┌───────────────────────────────────────────┼──────────────────┐
│ STEP 2: Vendor Uploads Progress PDF      │                  │
│ ┌─────────────┐                           │                  │
│ │ Vendor PDF  │                           ▼                  │
│ └──────┬──────┘                  ┌─────────────┐            │
│        │                         │ Fetch Govt  │            │
│        │                         │ Plan from DB│            │
│        │                         └──────┬──────┘            │
│        └────────────────┬───────────────┘                   │
└─────────────────────────┼──────────────────────────────────┘
                          │
┌─────────────────────────┼──────────────────────────────────┐
│ STEP 3: AI Comparison   ▼                                   │
│            ┌────────────────────────┐                       │
│            │ Gemini AI Analyzes:    │                       │
│            │ - Budget vs Claimed    │                       │
│            │ - Timeline vs Actual   │                       │
│            │ - Scope vs Completed   │                       │
│            │ - Quality Standards    │                       │
│            └──────────┬─────────────┘                       │
│                       │                                      │
│                       ▼                                      │
│            ┌────────────────────────┐                       │
│            │ Output:                │                       │
│            │ - Compliance Score     │                       │
│            │ - Discrepancies List   │                       │
│            │ - Overdue Work         │                       │
│            │ - Budget Analysis      │                       │
│            └──────────┬─────────────┘                       │
└───────────────────────┼──────────────────────────────────┘
                        │
┌───────────────────────┼──────────────────────────────────┐
│ STEP 4: Admin Portal  ▼                                   │
│     ┌────────────────────────────────────┐               │
│     │ Real-time Dashboard Updates:       │               │
│     │ ✓ Discrepancy Alerts (Red Badges) │               │
│     │ ✓ Compliance Scores               │               │
│     │ ✓ Overdue Work Count              │               │
│     │ ✓ Detailed Analysis Report        │               │
│     │ ✓ Budget Variance Charts          │               │
│     │ ✓ Severity Classification         │               │
│     └────────────────────────────────────┘               │
└──────────────────────────────────────────────────────────┘
```

---

## Current Status: ✅ FULLY IMPLEMENTED

All 4 steps are working:
1. ✅ Government PDF upload with AI/Regex extraction
2. ✅ Vendor PDF upload
3. ✅ AI-powered comparison & discrepancy detection
4. ✅ Real-time display in admin portal with visual indicators

## Additional Features Implemented:
- ✅ Phase-wise tracking
- ✅ Budget variance analysis
- ✅ Timeline delay calculation
- ✅ Compliance scoring (0-100%)
- ✅ Severity classification (Critical/High/Medium/Low)
- ✅ Admin delete scheme option
- ✅ WebSocket real-time updates
- ✅ Responsive mobile UI
- ✅ Citizen feedback with AI anonymization

---

## Next Steps (Optional Enhancements):

1. **Email Alerts:** Send notifications to admins when critical discrepancies detected
2. **Export Reports:** Download compliance reports as PDF/Excel
3. **Trend Analysis:** Track vendor performance over time
4. **Photo Upload:** Allow vendors to upload work progress photos
5. **Approval Workflow:** Multi-level approval for vendor reports
6. **Payment Integration:** Auto-calculate payments based on work completed
7. **Mobile App:** Field officers can upload reports from mobile
8. **OCR Enhancement:** Better handling of scanned/handwritten documents

---

**Last Updated:** November 5, 2025
**Status:** Production Ready ✅
