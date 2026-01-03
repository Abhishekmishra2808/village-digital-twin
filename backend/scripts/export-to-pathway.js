/**
 * Export MongoDB Collections to Pathway Data Format
 * 
 * This script exports schemes, vendor reports, citizen reports, and sensor data
 * from MongoDB to text files that Pathway can index for RAG queries.
 * 
 * Run: node backend/scripts/export-to-pathway.js
 */

import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

// Import models
import Scheme from '../models/Scheme.js';
import CitizenReport from '../models/CitizenReport.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

// Output directory for Pathway
const OUTPUT_DIR = path.join(__dirname, '../../llm-app/templates/question_answering_rag/data');

/**
 * Convert scheme to searchable text document
 */
function schemeToDocument(scheme) {
  let text = `# Scheme: ${scheme.name}\n\n`;
  text += `**ID:** ${scheme.id}\n`;
  text += `**Category:** ${scheme.category}\n`;
  text += `**Village:** ${scheme.village}\n`;
  text += `**District:** ${scheme.district}\n`;
  text += `**Status:** ${scheme.status}\n\n`;
  
  text += `## Description\n${scheme.description}\n\n`;
  
  text += `## Progress & Budget\n`;
  text += `- Overall Progress: ${scheme.overallProgress}%\n`;
  text += `- Total Budget: ₹${scheme.totalBudget?.toLocaleString('en-IN') || 0}\n`;
  text += `- Budget Utilized: ₹${scheme.budgetUtilized?.toLocaleString('en-IN') || 0}\n`;
  text += `- Start Date: ${new Date(scheme.startDate).toLocaleDateString()}\n`;
  text += `- End Date: ${new Date(scheme.endDate).toLocaleDateString()}\n\n`;
  
  text += `## Citizen Feedback\n`;
  text += `- Rating: ${scheme.citizenRating}/5\n`;
  text += `- Feedback Count: ${scheme.feedbackCount}\n\n`;
  
  // Phases
  if (scheme.phases && scheme.phases.length > 0) {
    text += `## Implementation Phases\n\n`;
    scheme.phases.forEach((phase, i) => {
      text += `### Phase ${i + 1}: ${phase.name}\n`;
      text += `- Status: ${phase.status}\n`;
      text += `- Progress: ${phase.progress}%\n`;
      text += `- Budget: ₹${phase.budget?.toLocaleString('en-IN') || 0}\n`;
      text += `- Duration: ${new Date(phase.startDate).toLocaleDateString()} to ${new Date(phase.endDate).toLocaleDateString()}\n\n`;
    });
  }
  
  // Discrepancies
  if (scheme.discrepancies && scheme.discrepancies.length > 0) {
    text += `## Issues & Discrepancies\n\n`;
    scheme.discrepancies.forEach((disc, i) => {
      text += `**Issue ${i + 1}:** ${disc.type} (${disc.severity})\n`;
      text += `- Description: ${disc.description}\n`;
      text += `- Detected: ${new Date(disc.detectedDate).toLocaleDateString()}\n`;
      if (disc.resolvedDate) {
        text += `- Status: Resolved on ${new Date(disc.resolvedDate).toLocaleDateString()}\n`;
      } else {
        text += `- Status: Open\n`;
      }
      text += `\n`;
    });
  }
  
  // Vendor Reports
  if (scheme.vendorReports && scheme.vendorReports.length > 0) {
    text += `## Vendor Reports\n\n`;
    scheme.vendorReports.forEach((report, i) => {
      text += `### Report ${i + 1} by ${report.vendorName}\n`;
      text += `- Phase: ${report.phase}\n`;
      text += `- Status: ${report.verificationStatus}\n`;
      text += `- Work Completed: ${report.workCompleted}\n`;
      text += `- Expense Claimed: ₹${report.expenseClaimed?.toLocaleString('en-IN') || 0}\n`;
      text += `- Submitted: ${new Date(report.submittedDate).toLocaleDateString()}\n`;
      
      if (report.complianceAnalysis) {
        const analysis = report.complianceAnalysis;
        text += `\n**AI Compliance Analysis:**\n`;
        text += `- Overall Compliance: ${analysis.overallCompliance}%\n`;
        text += `- Summary: ${analysis.aiSummary}\n`;
        
        if (analysis.discrepancies && analysis.discrepancies.length > 0) {
          text += `\n**Discrepancies Found:**\n`;
          analysis.discrepancies.forEach(disc => {
            text += `- ${disc.description} (${disc.severity})\n`;
            text += `  Planned: ${disc.plannedValue}, Actual: ${disc.actualValue}\n`;
          });
        }
        
        if (analysis.overdueWork && analysis.overdueWork.length > 0) {
          text += `\n**Overdue Tasks:**\n`;
          analysis.overdueWork.forEach(task => {
            text += `- ${task.task}: ${task.delayDays} days late\n`;
          });
        }
      }
      text += `\n`;
    });
  }
  
  return text;
}

/**
 * Convert citizen report to searchable text
 */
function citizenReportToDocument(report) {
  let text = `# Citizen Report: ${report.type}\n\n`;
  text += `**Report ID:** ${report.reportId}\n`;
  text += `**Status:** ${report.status}\n`;
  text += `**Priority:** ${report.priority}\n`;
  text += `**Location:** ${report.location}\n`;
  text += `**Reported by:** ${report.reportedBy || 'Anonymous'}\n`;
  text += `**Date:** ${new Date(report.reportedAt).toLocaleString()}\n\n`;
  
  text += `## Description\n${report.description}\n\n`;
  
  if (report.coordinates) {
    text += `**Coordinates:** Lat ${report.coordinates.lat}, Lng ${report.coordinates.lng}\n\n`;
  }
  
  if (report.aiAnalysis) {
    text += `## AI Analysis\n`;
    text += `${report.aiAnalysis}\n\n`;
  }
  
  return text;
}

/**
 * Convert sensor data to searchable text
 */
function sensorToDocument(sensor) {
  let text = `# Sensor: ${sensor.type}\n\n`;
  text += `**Sensor ID:** ${sensor.sensorId}\n`;
  text += `**Location:** ${sensor.location}\n`;
  text += `**Status:** ${sensor.status}\n\n`;
  
  text += `## Latest Reading\n`;
  text += `- Value: ${sensor.value} ${sensor.unit || ''}\n`;
  text += `- Timestamp: ${new Date(sensor.timestamp).toLocaleString()}\n\n`;
  
  if (sensor.alert && sensor.alert !== 'No alert') {
    text += `**⚠️ Alert:** ${sensor.alert}\n\n`;
  }
  
  if (sensor.coordinates) {
    text += `**Coordinates:** Lat ${sensor.coordinates.lat}, Lng ${sensor.coordinates.lng}\n\n`;
  }
  
  return text;
}

/**
 * Main export function
 */
async function exportToPathway() {
  try {
    console.log('🚀 Starting MongoDB to Pathway export...\n');
    
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Create output directory
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    console.log(`📁 Output directory: ${OUTPUT_DIR}\n`);
    
    // Export Schemes
    console.log('📊 Exporting schemes...');
    const schemes = await Scheme.find();
    console.log(`   Found ${schemes.length} schemes`);
    
    for (const scheme of schemes) {
      const filename = `scheme-${scheme.id}.txt`;
      const filepath = path.join(OUTPUT_DIR, filename);
      const content = schemeToDocument(scheme);
      await fs.writeFile(filepath, content, 'utf8');
    }
    console.log(`   ✅ Exported ${schemes.length} schemes\n`);
    
    // Export Citizen Reports
    console.log('📝 Exporting citizen reports...');
    const reports = await CitizenReport.find();
    console.log(`   Found ${reports.length} reports`);
    
    for (const report of reports) {
      const filename = `citizen-report-${report.reportId}.txt`;
      const filepath = path.join(OUTPUT_DIR, filename);
      const content = citizenReportToDocument(report);
      await fs.writeFile(filepath, content, 'utf8');
    }
    console.log(`   ✅ Exported ${reports.length} citizen reports\n`);
    
    // Export Sensor Data (from embedded data in schemes if available)
    console.log('📡 Exporting sensor data...');
    let sensorCount = 0;
    
    // Check if any schemes have sensor data
    for (const scheme of schemes) {
      if (scheme.sensorData && scheme.sensorData.length > 0) {
        for (const sensor of scheme.sensorData) {
          const filename = `sensor-${sensor.sensorId || 'unknown'}-${Date.now()}.txt`;
          const filepath = path.join(OUTPUT_DIR, filename);
          const content = sensorToDocument(sensor);
          await fs.writeFile(filepath, content, 'utf8');
          sensorCount++;
        }
      }
    }
    
    console.log(`   ✅ Exported ${sensorCount} sensor readings\n`);
    
    // Create summary file
    const summary = `# RuraLens Knowledge Base Export
Generated: ${new Date().toLocaleString()}

## Statistics
- Schemes: ${schemes.length}
- Citizen Reports: ${reports.length}
- Sensor Readings: ${sensorCount}
- Total Documents: ${schemes.length + reports.length + sensorCount}

## Usage
These documents are indexed by Pathway RAG system to answer questions about:
- Scheme status, progress, and issues
- Vendor report compliance and discrepancies
- Citizen feedback and reports
- Real-time sensor data and alerts

## Next Steps
1. Run Pathway server in WSL2: cd llm-app/templates/question_answering_rag && python app.py
2. Pathway will automatically index these documents
3. Backend will query Pathway at http://localhost:8000/v1/pw_ai_answer
`;
    
    await fs.writeFile(path.join(OUTPUT_DIR, 'README.md'), summary, 'utf8');
    
    console.log('🎉 Export completed successfully!');
    console.log(`📚 Total documents: ${schemes.length + reports.length + sensorCount}`);
    console.log('\n💡 Next steps:');
    console.log('   1. Run: wsl -d Ubuntu');
    console.log('   2. Run: cd /mnt/c/Users/abhis/Desktop/Projects/vilage\\ twin/llm-app/templates/question_answering_rag');
    console.log('   3. Run: python app.py');
    console.log('   4. Pathway will index these documents automatically\n');
    
  } catch (error) {
    console.error('❌ Export failed:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('👋 MongoDB connection closed');
  }
}

// Run export
exportToPathway()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

export { exportToPathway };
