import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import CitizenReport from '../models/CitizenReport.js';

const router = express.Router();

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/reports');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    cb(null, 'report-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit per file
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// Get all citizen reports
router.get('/', async (req, res) => {
  try {
    const reports = await CitizenReport.find().sort({ createdAt: -1 });
    res.json({ reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Get single report
router.get('/:id', async (req, res) => {
  try {
    const report = await CitizenReport.findOne({ id: req.params.id });
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json({ report });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// Create new citizen report (with image upload)
router.post('/', upload.array('photos', 5), async (req, res) => {
  try {
    console.log('📝 Creating new citizen report:', req.body);
    console.log('📸 Uploaded files:', req.files?.length || 0);

    const {
      category,
      title,
      description,
      coords, // Should be JSON string: "[73.8567, 18.5204]"
      location,
      priority,
      createdBy
    } = req.body;

    // Validate required fields
    if (!category || !title || !description || !coords) {
      return res.status(400).json({ 
        error: 'Missing required fields: category, title, description, and coords are required' 
      });
    }

    // Parse coordinates
    let coordsArray;
    try {
      coordsArray = JSON.parse(coords);
      if (!Array.isArray(coordsArray) || coordsArray.length !== 2) {
        throw new Error('Invalid coordinates format');
      }
    } catch (err) {
      return res.status(400).json({ 
        error: 'Invalid coords format. Expected: [longitude, latitude]' 
      });
    }

    // Generate unique ID
    const reportId = `REPORT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Get uploaded file paths
    const photoPaths = req.files ? req.files.map(file => `/uploads/reports/${file.filename}`) : [];

    // Create new report
    const newReport = new CitizenReport({
      id: reportId,
      category,
      title,
      description,
      coords: coordsArray,
      location: location || '',
      priority: priority || 'medium',
      status: 'pending',
      photos: photoPaths,
      photoCount: photoPaths.length,
      createdBy: createdBy || 'Citizen',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const savedReport = await newReport.save();
    console.log('✅ Report created successfully:', savedReport.id);

    // Broadcast to all connected clients
    const broadcast = req.app.get('broadcast');
    if (broadcast) {
      const allReports = await CitizenReport.find().sort({ createdAt: -1 });
      broadcast({
        type: 'report_added',
        report: savedReport,
        allReports: allReports,
        timestamp: new Date().toISOString()
      });
      console.log('📡 Broadcasted new report to all clients');
    }

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      report: savedReport
    });
  } catch (error) {
    console.error('❌ Error creating report:', error);
    res.status(500).json({ 
      error: 'Failed to create report', 
      details: error.message 
    });
  }
});

// Update report status (field worker/admin only)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, assignedTo } = req.body;

    const report = await CitizenReport.findOne({ id: req.params.id });
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    if (status) {
      report.status = status;
    }
    if (assignedTo !== undefined) {
      report.assignedTo = assignedTo;
    }

    await report.save();
    console.log(`✅ Report ${report.id} updated - Status: ${report.status}, Assigned: ${report.assignedTo}`);

    // Broadcast update
    const broadcast = req.app.get('broadcast');
    if (broadcast) {
      const allReports = await CitizenReport.find().sort({ createdAt: -1 });
      broadcast({
        type: 'report_updated',
        reportId: report.id,
        allReports: allReports,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: 'Report updated successfully',
      report
    });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ error: 'Failed to update report' });
  }
});

// Delete report (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const report = await CitizenReport.findOne({ id: req.params.id });
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Delete associated images
    if (report.photos && report.photos.length > 0) {
      report.photos.forEach(photoPath => {
        const fullPath = path.join(__dirname, '..', photoPath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });
    }

    await CitizenReport.findOneAndDelete({ id: req.params.id });
    console.log(`✅ Report ${req.params.id} deleted`);

    // Broadcast update
    const broadcast = req.app.get('broadcast');
    if (broadcast) {
      const allReports = await CitizenReport.find().sort({ createdAt: -1 });
      broadcast({
        type: 'report_deleted',
        reportId: req.params.id,
        allReports: allReports,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: 'Report deleted successfully',
      reportId: req.params.id
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ error: 'Failed to delete report' });
  }
});

export default router;
