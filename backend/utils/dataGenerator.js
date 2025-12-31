// Realistic data generation for Sundarpur Village Digital Twin

export function generateVillageData() {
  return {
    waterTanks: [
      { id: 'wt001', name: 'Central Water Tank', coords: [73.8567, 18.5204], elevation: 665, capacity: 50000, currentLevel: 85.5, status: 'good', flowRate: -125, lastRefill: '2024-10-08', nextService: '2024-10-25' },
      { id: 'wt002', name: 'North Tank', coords: [73.8577, 18.5224], elevation: 670, capacity: 30000, currentLevel: 67.2, status: 'warning', flowRate: -98, lastRefill: '2024-10-07', nextService: '2024-10-22' },
      { id: 'wt003', name: 'South Tank', coords: [73.8557, 18.5184], elevation: 655, capacity: 40000, currentLevel: 92.1, status: 'good', flowRate: -110, lastRefill: '2024-10-09', nextService: '2024-10-26' },
      { id: 'wt004', name: 'East Tank', coords: [73.8597, 18.5204], elevation: 660, capacity: 25000, currentLevel: 45.8, status: 'critical', flowRate: -85, lastRefill: '2024-10-05', nextService: '2024-10-20' },
      { id: 'wt005', name: 'West Tank', coords: [73.8537, 18.5204], elevation: 675, capacity: 35000, currentLevel: 78.3, status: 'good', flowRate: -105, lastRefill: '2024-10-08', nextService: '2024-10-24' }
    ],
    
    buildings: [
      { id: 'b001', name: 'Sundarpur Primary School', type: 'school', coords: [73.8567, 18.5214], height: 8.5, floors: 2, color: '#3b82f6', occupancy: 245 },
      { id: 'b002', name: 'Village Temple', type: 'temple', coords: [73.8577, 18.5194], height: 15.2, floors: 1, color: '#f97316', occupancy: 0 },
      { id: 'b003', name: 'Primary Health Center', type: 'health', coords: [73.8587, 18.5204], height: 6.0, floors: 1, color: '#10b981', occupancy: 18 },
      { id: 'b004', name: 'Gram Panchayat Office', type: 'government', coords: [73.8562, 18.5209], height: 7.5, floors: 2, color: '#8b5cf6', occupancy: 12 },
      { id: 'b005', name: 'Community Hall', type: 'community', coords: [73.8572, 18.5199], height: 5.0, floors: 1, color: '#06b6d4', occupancy: 0 },
      { id: 'b006', name: 'Anganwadi Center', type: 'childcare', coords: [73.8582, 18.5189], height: 4.5, floors: 1, color: '#ec4899', occupancy: 32 },
      { id: 'b007', name: 'Post Office', type: 'service', coords: [73.8552, 18.5214], height: 5.5, floors: 1, color: '#eab308', occupancy: 5 },
      { id: 'b008', name: 'Farmers Cooperative', type: 'agriculture', coords: [73.8592, 18.5219], height: 6.5, floors: 1, color: '#84cc16', occupancy: 28 }
    ],
    
    powerNodes: [
      { id: 'pt001', name: 'Main Transformer', coords: [73.8567, 18.5204], capacity: 500, currentLoad: 425, status: 'good', voltage: 11000, temperature: 42 },
      { id: 'pt002', name: 'North Transformer', coords: [73.8577, 18.5224], capacity: 250, currentLoad: 215, status: 'warning', voltage: 11000, temperature: 58 },
      { id: 'pt003', name: 'South Transformer', coords: [73.8557, 18.5184], capacity: 300, currentLoad: 245, status: 'good', voltage: 11000, temperature: 45 },
      { id: 'pt004', name: 'East Transformer', coords: [73.8597, 18.5204], capacity: 200, currentLoad: 165, status: 'good', voltage: 11000, temperature: 38 },
      { id: 'pt005', name: 'West Transformer', coords: [73.8537, 18.5204], capacity: 350, currentLoad: 298, status: 'good', voltage: 11000, temperature: 48 },
      { id: 'pt006', name: 'School Transformer', coords: [73.8567, 18.5214], capacity: 150, currentLoad: 128, status: 'good', voltage: 11000, temperature: 40 },
      { id: 'pt007', name: 'Market Transformer', coords: [73.8587, 18.5194], capacity: 400, currentLoad: 368, status: 'warning', voltage: 11000, temperature: 55 },
      { id: 'pt008', name: 'Temple Transformer', coords: [73.8577, 18.5194], capacity: 100, currentLoad: 45, status: 'good', voltage: 11000, temperature: 35 },
      { id: 'pt009', name: 'Health Center Transformer', coords: [73.8587, 18.5204], capacity: 180, currentLoad: 152, status: 'good', voltage: 11000, temperature: 43 },
      { id: 'pt010', name: 'Residential Block A', coords: [73.8547, 18.5214], capacity: 250, currentLoad: 198, status: 'good', voltage: 11000, temperature: 46 },
      { id: 'pt011', name: 'Residential Block B', coords: [73.8572, 18.5189], capacity: 250, currentLoad: 212, status: 'good', voltage: 11000, temperature: 47 },
      { id: 'pt012', name: 'Agricultural Pump', coords: [73.8592, 18.5219], capacity: 120, currentLoad: 98, status: 'good', voltage: 11000, temperature: 41 }
    ],
    
    roads: [
      { id: 'r001', name: 'Main Street', path: [[73.8550, 18.5190], [73.8580, 18.5190]], width: 8, condition: 'good', potholes: 0, lastMaintenance: '2024-08-15' },
      { id: 'r002', name: 'School Road', path: [[73.8567, 18.5204], [73.8567, 18.5214]], width: 6, condition: 'fair', potholes: 3, lastMaintenance: '2024-06-20' },
      { id: 'r003', name: 'Temple Road', path: [[73.8567, 18.5204], [73.8577, 18.5194]], width: 7, condition: 'good', potholes: 0, lastMaintenance: '2024-09-10' },
      { id: 'r004', name: 'Health Center Road', path: [[73.8567, 18.5204], [73.8587, 18.5204]], width: 6, condition: 'good', potholes: 1, lastMaintenance: '2024-07-25' },
      { id: 'r005', name: 'Village Circle', path: [[73.8562, 18.5209], [73.8572, 18.5209], [73.8572, 18.5199], [73.8562, 18.5199], [73.8562, 18.5209]], width: 8, condition: 'fair', potholes: 2, lastMaintenance: '2024-05-12' },
      { id: 'r006', name: 'Farm Access Road', path: [[73.8580, 18.5190], [73.8592, 18.5219]], width: 5, condition: 'poor', potholes: 7, lastMaintenance: '2024-03-08' }
    ],
    
    sensors: [
      { id: 's001', type: 'soil_moisture', name: 'Field Sensor 1', coords: [73.8560, 18.5200], value: 68, unit: '%', status: 'active', lastUpdate: new Date().toISOString() },
      { id: 's002', type: 'air_quality', name: 'AQI Monitor Central', coords: [73.8570, 18.5210], value: 42, unit: 'AQI', status: 'active', lastUpdate: new Date().toISOString() },
      { id: 's003', type: 'weather', name: 'Weather Station', coords: [73.8567, 18.5204], value: 28.5, unit: '°C', status: 'active', lastUpdate: new Date().toISOString(), humidity: 65, windSpeed: 12 },
      { id: 's004', type: 'water_quality', name: 'Water Quality Monitor', coords: [73.8567, 18.5204], value: 7.2, unit: 'pH', status: 'active', lastUpdate: new Date().toISOString(), tds: 245 },
      { id: 's005', type: 'soil_moisture', name: 'Field Sensor 2', coords: [73.8580, 18.5195], value: 72, unit: '%', status: 'active', lastUpdate: new Date().toISOString() },
      { id: 's006', type: 'soil_moisture', name: 'Field Sensor 3', coords: [73.8575, 18.5215], value: 65, unit: '%', status: 'active', lastUpdate: new Date().toISOString() },
      { id: 's007', type: 'air_quality', name: 'AQI Monitor North', coords: [73.8577, 18.5224], value: 38, unit: 'AQI', status: 'active', lastUpdate: new Date().toISOString() },
      { id: 's008', type: 'air_quality', name: 'AQI Monitor South', coords: [73.8557, 18.5184], value: 45, unit: 'AQI', status: 'active', lastUpdate: new Date().toISOString() },
      { id: 's011', type: 'noise', name: 'Noise Monitor Market', coords: [73.8587, 18.5194], value: 68, unit: 'dB', status: 'active', lastUpdate: new Date().toISOString() },
      { id: 's012', type: 'rainfall', name: 'Rain Gauge', coords: [73.8567, 18.5204], value: 0, unit: 'mm', status: 'active', lastUpdate: new Date().toISOString() },
      { id: 's013', type: 'flood', name: 'Water Level Sensor', coords: [73.8555, 18.5185], value: 0.2, unit: 'm', status: 'active', lastUpdate: new Date().toISOString() },
      { id: 's014', type: 'soil_moisture', name: 'Field Sensor 4', coords: [73.8590, 18.5220], value: 71, unit: '%', status: 'active', lastUpdate: new Date().toISOString() },
      { id: 's015', type: 'temperature', name: 'Temp Sensor School', coords: [73.8567, 18.5214], value: 27.8, unit: '°C', status: 'active', lastUpdate: new Date().toISOString() },
      { id: 's016', type: 'temperature', name: 'Temp Sensor Health Center', coords: [73.8587, 18.5204], value: 26.5, unit: '°C', status: 'active', lastUpdate: new Date().toISOString() },
      { id: 's017', type: 'parking', name: 'Parking Occupancy', coords: [73.8572, 18.5199], value: 12, unit: 'spaces', status: 'active', lastUpdate: new Date().toISOString() },
      { id: 's018', type: 'street_light', name: 'Street Light Monitor', coords: [73.8570, 18.5195], value: 100, unit: '%', status: 'active', lastUpdate: new Date().toISOString() },
      // NEW SENSORS - Adding more for innovation
      { id: 's019', type: 'soil_moisture', name: 'Field Sensor 5 (West)', coords: [73.8540, 18.5210], value: 69, unit: '%', status: 'active', lastUpdate: new Date().toISOString() },
      { id: 's020', type: 'soil_moisture', name: 'Field Sensor 6 (East)', coords: [73.8595, 18.5195], value: 74, unit: '%', status: 'active', lastUpdate: new Date().toISOString() },
      { id: 's021', type: 'air_quality', name: 'AQI Monitor East', coords: [73.8597, 18.5204], value: 40, unit: 'AQI', status: 'active', lastUpdate: new Date().toISOString() },
      { id: 's022', type: 'air_quality', name: 'AQI Monitor West', coords: [73.8537, 18.5204], value: 43, unit: 'AQI', status: 'active', lastUpdate: new Date().toISOString() },
      { id: 's023', type: 'water_quality', name: 'Water Quality Sensor 2', coords: [73.8577, 18.5224], value: 7.1, unit: 'pH', status: 'active', lastUpdate: new Date().toISOString(), tds: 238 },
      { id: 's024', type: 'water_quality', name: 'Water Quality Sensor 3', coords: [73.8557, 18.5184], value: 7.3, unit: 'pH', status: 'active', lastUpdate: new Date().toISOString(), tds: 251 },
      { id: 's027', type: 'noise', name: 'Noise Monitor School', coords: [73.8567, 18.5214], value: 65, unit: 'dB', status: 'active', lastUpdate: new Date().toISOString() },
      { id: 's028', type: 'noise', name: 'Noise Monitor Residential', coords: [73.8547, 18.5214], value: 52, unit: 'dB', status: 'active', lastUpdate: new Date().toISOString() },
      { id: 's029', type: 'temperature', name: 'Temp Sensor Temple', coords: [73.8577, 18.5194], value: 28.2, unit: '°C', status: 'active', lastUpdate: new Date().toISOString() },
      { id: 's030', type: 'temperature', name: 'Temp Sensor Market', coords: [73.8587, 18.5194], value: 29.1, unit: '°C', status: 'active', lastUpdate: new Date().toISOString() },
      { id: 's031', type: 'street_light', name: 'Street Light Zone 2', coords: [73.8565, 18.5200], value: 100, unit: '%', status: 'active', lastUpdate: new Date().toISOString() },
      { id: 's032', type: 'street_light', name: 'Street Light Zone 3', coords: [73.8575, 18.5190], value: 85, unit: '%', status: 'active', lastUpdate: new Date().toISOString() },
      { id: 's033', type: 'parking', name: 'Temple Parking', coords: [73.8577, 18.5196], value: 8, unit: 'spaces', status: 'active', lastUpdate: new Date().toISOString() },
      { id: 's034', type: 'parking', name: 'Market Parking', coords: [73.8587, 18.5192], value: 15, unit: 'spaces', status: 'active', lastUpdate: new Date().toISOString() },
      { id: 's035', type: 'flood', name: 'Flood Sensor North', coords: [73.8577, 18.5226], value: 0.15, unit: 'm', status: 'active', lastUpdate: new Date().toISOString() },
      { id: 's036', type: 'flood', name: 'Flood Sensor South', coords: [73.8555, 18.5182], value: 0.22, unit: 'm', status: 'active', lastUpdate: new Date().toISOString() },
      // Smart Infrastructure Sensors
      { id: 's037', type: 'energy', name: 'Solar Panel Monitor 1', coords: [73.8567, 18.5206], value: 8.5, unit: 'kW', status: 'active', lastUpdate: new Date().toISOString() },
      { id: 's038', type: 'energy', name: 'Solar Panel Monitor 2', coords: [73.8567, 18.5212], value: 12.2, unit: 'kW', status: 'active', lastUpdate: new Date().toISOString() },
      { id: 's039', type: 'vibration', name: 'Bridge Health Sensor', coords: [73.8560, 18.5188], value: 2.1, unit: 'mm/s', status: 'active', lastUpdate: new Date().toISOString() },
      { id: 's040', type: 'pressure', name: 'Water Pressure Sensor 1', coords: [73.8565, 18.5205], value: 3.2, unit: 'bar', status: 'active', lastUpdate: new Date().toISOString() },
      { id: 's041', type: 'pressure', name: 'Water Pressure Sensor 2', coords: [73.8575, 18.5198], value: 3.5, unit: 'bar', status: 'active', lastUpdate: new Date().toISOString() },
      { id: 's042', type: 'waste', name: 'Smart Bin Sensor 1', coords: [73.8570, 18.5208], value: 35, unit: '% full', status: 'active', lastUpdate: new Date().toISOString() },
      { id: 's043', type: 'waste', name: 'Smart Bin Sensor 2', coords: [73.8565, 18.5192], value: 72, unit: '% full', status: 'active', lastUpdate: new Date().toISOString() },
      { id: 's044', type: 'waste', name: 'Smart Bin Sensor 3', coords: [73.8585, 18.5196], value: 88, unit: '% full', status: 'active', lastUpdate: new Date().toISOString() },
      { id: 's045', type: 'radiation', name: 'UV Index Sensor', coords: [73.8567, 18.5204], value: 5.2, unit: 'UV', status: 'active', lastUpdate: new Date().toISOString() },
    ],
    
    citizenReports: [
      { id: 'cr001', category: 'road', title: 'Large pothole on School Road', coords: [73.8567, 18.5210], status: 'in_progress', priority: 'high', createdAt: '2024-10-08T10:30:00Z', assignedTo: 'Field Worker #12', photos: 2, description: 'Large pothole causing vehicle damage near school entrance' },
      { id: 'cr002', category: 'water', title: 'Water leakage near temple', coords: [73.8575, 18.5194], status: 'pending', priority: 'medium', createdAt: '2024-10-09T14:15:00Z', assignedTo: null, photos: 1, description: 'Continuous water leakage from pipeline' },
      { id: 'cr003', category: 'power', title: 'Street light not working', coords: [73.8555, 18.5200], status: 'completed', priority: 'low', createdAt: '2024-10-07T19:45:00Z', assignedTo: 'Electrician #5', photos: 0, description: 'Street light pole #23 not functioning' },
      { id: 'cr004', category: 'waste', title: 'Garbage accumulation', coords: [73.8580, 18.5190], status: 'pending', priority: 'high', createdAt: '2024-10-09T08:20:00Z', assignedTo: null, photos: 3, description: 'Garbage not collected for 3 days' },
      { id: 'cr005', category: 'road', title: 'Road markings faded', coords: [73.8565, 18.5209], status: 'pending', priority: 'low', createdAt: '2024-10-08T16:00:00Z', assignedTo: null, photos: 1, description: 'Road markings need repainting at village circle' }
    ],
    
    schemes: [
      {
        id: 'sch001',
        name: 'Swachh Bharat Abhiyan - Phase 2',
        category: 'Sanitation',
        village: 'Sundarpur',
        district: 'Pune',
        totalBudget: 2500000,
        budgetUtilized: 1875000,
        startDate: '2024-01-15',
        endDate: '2024-12-31',
        overallProgress: 75,
        status: 'on-track',
        description: 'Construction of community toilets and solid waste management infrastructure',
        phases: [
          { id: 1, name: 'Site Survey & Planning', progress: 100, status: 'completed', startDate: '2024-01-15', endDate: '2024-02-15', budget: 250000, spent: 245000 },
          { id: 2, name: 'Toilet Construction', progress: 90, status: 'on-track', startDate: '2024-02-16', endDate: '2024-06-30', budget: 1500000, spent: 1350000 },
          { id: 3, name: 'Waste Management Setup', progress: 55, status: 'on-track', startDate: '2024-05-01', endDate: '2024-10-31', budget: 500000, spent: 275000 },
          { id: 4, name: 'Awareness Campaign', progress: 40, status: 'delayed', startDate: '2024-08-01', endDate: '2024-12-31', budget: 250000, spent: 5000 }
        ],
        vendorReports: [
          { id: 1, vendorName: 'Green Build Contractors', submittedDate: '2024-09-15', phase: 2, workCompleted: 'Construction of 12 toilet units', expenseClaimed: 450000, verificationStatus: 'verified', documents: ['progress-report.pdf', 'bills.pdf'] },
          { id: 2, vendorName: 'EcoWaste Solutions', submittedDate: '2024-09-10', phase: 3, workCompleted: 'Installation of 5 waste segregation units', expenseClaimed: 125000, verificationStatus: 'pending', documents: ['invoice.pdf'] }
        ],
        discrepancies: [],
        citizenRating: 4.2,
        feedbackCount: 28,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'sch002',
        name: 'Jal Jeevan Mission - Pipeline Extension',
        category: 'Water Supply',
        village: 'Sundarpur',
        district: 'Pune',
        totalBudget: 4200000,
        budgetUtilized: 2940000,
        startDate: '2023-11-01',
        endDate: '2024-11-30',
        overallProgress: 70,
        status: 'delayed',
        description: 'Extension of water pipeline network to ensure tap water connection for every household',
        phases: [
          { id: 1, name: 'Pipeline Procurement', progress: 100, status: 'completed', startDate: '2023-11-01', endDate: '2024-01-31', budget: 1200000, spent: 1180000 },
          { id: 2, name: 'Excavation & Laying', progress: 85, status: 'delayed', startDate: '2024-02-01', endDate: '2024-07-31', budget: 2000000, spent: 1700000 },
          { id: 3, name: 'Household Connections', progress: 35, status: 'delayed', startDate: '2024-06-01', endDate: '2024-11-30', budget: 1000000, spent: 60000 }
        ],
        vendorReports: [
          { id: 1, vendorName: 'AquaTech Infrastructure', submittedDate: '2024-09-20', phase: 2, workCompleted: '3.2 km pipeline laid', expenseClaimed: 850000, verificationStatus: 'verified', documents: ['progress-photos.pdf', 'material-bills.pdf'] },
          { id: 2, vendorName: 'AquaTech Infrastructure', submittedDate: '2024-08-15', phase: 2, workCompleted: '2.1 km pipeline laid', expenseClaimed: 650000, verificationStatus: 'rejected', documents: ['invoice.pdf'] }
        ],
        discrepancies: [
          { type: 'budget-overrun', severity: 'medium', description: 'Phase 2 showing 15% higher material costs than estimated', reportedDate: '2024-09-01' }
        ],
        citizenRating: 3.8,
        feedbackCount: 45,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'sch003',
        name: 'PMAY - Affordable Housing',
        category: 'Housing',
        village: 'Sundarpur',
        district: 'Pune',
        totalBudget: 8500000,
        budgetUtilized: 7225000,
        startDate: '2023-06-01',
        endDate: '2024-10-31',
        overallProgress: 85,
        status: 'on-track',
        description: 'Construction of 25 pucca houses for economically weaker sections under Pradhan Mantri Awas Yojana',
        phases: [
          { id: 1, name: 'Beneficiary Selection', progress: 100, status: 'completed', startDate: '2023-06-01', endDate: '2023-07-31', budget: 100000, spent: 95000 },
          { id: 2, name: 'Land Allocation', progress: 100, status: 'completed', startDate: '2023-08-01', endDate: '2023-09-30', budget: 300000, spent: 280000 },
          { id: 3, name: 'House Construction', progress: 88, status: 'on-track', startDate: '2023-10-01', endDate: '2024-09-30', budget: 7500000, spent: 6600000 },
          { id: 4, name: 'Handover & Documentation', progress: 60, status: 'on-track', startDate: '2024-09-01', endDate: '2024-10-31', budget: 600000, spent: 250000 }
        ],
        vendorReports: [
          { id: 1, vendorName: 'Shree Constructions', submittedDate: '2024-09-25', phase: 3, workCompleted: '22 houses at finishing stage', expenseClaimed: 2200000, verificationStatus: 'verified', documents: ['completion-report.pdf', 'quality-cert.pdf'] }
        ],
        discrepancies: [],
        citizenRating: 4.6,
        feedbackCount: 52,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'sch004',
        name: 'MGNREGA - Rural Road Development',
        category: 'Employment',
        village: 'Sundarpur',
        district: 'Pune',
        totalBudget: 1800000,
        budgetUtilized: 540000,
        startDate: '2024-06-01',
        endDate: '2025-03-31',
        overallProgress: 30,
        status: 'on-track',
        description: 'Rural road construction and maintenance providing employment to 150 households',
        phases: [
          { id: 1, name: 'Worker Registration', progress: 100, status: 'completed', startDate: '2024-06-01', endDate: '2024-06-30', budget: 50000, spent: 48000 },
          { id: 2, name: 'Road Survey & Marking', progress: 100, status: 'completed', startDate: '2024-07-01', endDate: '2024-07-31', budget: 100000, spent: 95000 },
          { id: 3, name: 'Road Construction Phase 1', progress: 45, status: 'on-track', startDate: '2024-08-01', endDate: '2024-12-31', budget: 900000, spent: 397000 },
          { id: 4, name: 'Road Construction Phase 2', progress: 0, status: 'not-started', startDate: '2025-01-01', endDate: '2025-03-31', budget: 750000, spent: 0 }
        ],
        vendorReports: [
          { id: 1, vendorName: 'Village Panchayat (Self)', submittedDate: '2024-09-30', phase: 3, workCompleted: '1.8 km road constructed, 145 workers employed', expenseClaimed: 350000, verificationStatus: 'verified', documents: ['attendance-sheets.pdf', 'wage-disbursement.pdf'] }
        ],
        discrepancies: [],
        citizenRating: 4.1,
        feedbackCount: 34,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'sch005',
        name: 'Village Electrification - Solar Street Lights',
        category: 'Power',
        village: 'Sundarpur',
        district: 'Pune',
        totalBudget: 1500000,
        budgetUtilized: 1650000,
        startDate: '2024-03-01',
        endDate: '2024-09-30',
        overallProgress: 95,
        status: 'discrepant',
        description: 'Installation of 75 solar-powered LED street lights across the village',
        phases: [
          { id: 1, name: 'Site Identification', progress: 100, status: 'completed', startDate: '2024-03-01', endDate: '2024-03-31', budget: 100000, spent: 95000 },
          { id: 2, name: 'Equipment Procurement', progress: 100, status: 'completed', startDate: '2024-04-01', endDate: '2024-05-31', budget: 900000, spent: 1050000 },
          { id: 3, name: 'Installation & Testing', progress: 100, status: 'completed', startDate: '2024-06-01', endDate: '2024-09-15', budget: 500000, spent: 505000 }
        ],
        vendorReports: [
          { id: 1, vendorName: 'SolarBright Systems', submittedDate: '2024-09-18', phase: 2, workCompleted: '75 solar light units delivered', expenseClaimed: 1050000, verificationStatus: 'under-review', documents: ['purchase-order.pdf', 'delivery-challan.pdf'] },
          { id: 2, vendorName: 'ElectroTech Services', submittedDate: '2024-09-20', phase: 3, workCompleted: '75 lights installed and commissioned', expenseClaimed: 505000, verificationStatus: 'verified', documents: ['installation-report.pdf', 'testing-cert.pdf'] }
        ],
        discrepancies: [
          { type: 'budget-exceeded', severity: 'high', description: 'Total expenditure exceeded approved budget by ₹1.5 Lakh', reportedDate: '2024-09-22' },
          { type: 'procurement-irregularity', severity: 'high', description: 'Equipment purchased at 16% higher cost than market rate', reportedDate: '2024-09-25' }
        ],
        citizenRating: 3.5,
        feedbackCount: 61,
        lastUpdated: new Date().toISOString()
      }
    ],
    
    alerts: [],
    
    kpis: {
      infrastructureHealth: 87,
      activeSensors: 18,
      offlineSensors: 2,
      pendingReports: 3,
      avgResponseTime: 2.3
    }
  };
}

export function updateSensorData(state) {
  const newState = JSON.parse(JSON.stringify(state)); // Deep clone
  const now = new Date();
  const hour = now.getHours();
  
  // Update water tanks - realistic consumption pattern
  newState.waterTanks.forEach(tank => {
    // Daily consumption pattern (higher during day)
    const hourlyConsumption = (hour >= 6 && hour <= 22) ? 0.15 : 0.05;
    tank.currentLevel -= hourlyConsumption + Math.random() * 0.1;
    
    // Random rainfall refill event (5% chance)
    if (Math.random() > 0.95) {
      tank.currentLevel += Math.random() * 8;
      newState.alerts.push({
        id: `alert-${Date.now()}-${tank.id}`,
        type: 'info',
        title: `${tank.name} refilled`,
        message: `Water level increased due to rainfall`,
        timestamp: new Date().toISOString(),
        category: 'water'
      });
    }
    
    tank.currentLevel = Math.max(10, Math.min(100, tank.currentLevel));
    
    // Update status based on level
    if (tank.currentLevel < 30) {
      tank.status = 'critical';
    } else if (tank.currentLevel < 50) {
      tank.status = 'warning';
    } else {
      tank.status = 'good';
    }
  });
  
  // Update power nodes - time-based load pattern
  newState.powerNodes.forEach(node => {
    const peakFactor = (hour >= 18 && hour <= 22) ? 1.2 : 
                       (hour >= 6 && hour <= 9) ? 1.1 : 0.75;
    const baseLoad = node.capacity * peakFactor * (0.65 + Math.random() * 0.15);
    node.currentLoad = Math.round(baseLoad);
    
    // Temperature increases with load
    node.temperature = 30 + (node.currentLoad / node.capacity) * 30 + Math.random() * 5;
    
    const loadPercentage = (node.currentLoad / node.capacity) * 100;
    node.status = loadPercentage > 95 ? 'critical' : loadPercentage > 80 ? 'warning' : 'good';
  });
  
  // Update sensors
  newState.sensors.forEach(sensor => {
    sensor.lastUpdate = new Date().toISOString();
    
    switch (sensor.type) {
      case 'soil_moisture':
        sensor.value += (Math.random() - 0.5) * 2;
        sensor.value = Math.max(20, Math.min(100, sensor.value));
        break;
        
      case 'air_quality':
        // Better air quality at night
        const baseAQI = (hour >= 0 && hour <= 6) ? 30 : 45;
        sensor.value = baseAQI + Math.random() * 20;
        break;
        
      case 'weather':
        // Diurnal temperature cycle
        const baseTemp = 25 + 8 * Math.sin((hour - 6) * Math.PI / 12);
        sensor.value = baseTemp + (Math.random() - 0.5) * 2;
        sensor.humidity = 60 + Math.random() * 20;
        sensor.windSpeed = 8 + Math.random() * 10;
        break;
        
      case 'temperature':
        // Similar to weather
        const temp = 25 + 8 * Math.sin((hour - 6) * Math.PI / 12);
        sensor.value = temp + (Math.random() - 0.5) * 3;
        break;
        
      case 'noise':
        const noiseFactor = (hour >= 6 && hour <= 22) ? 1.0 : 0.4;
        sensor.value = Math.round(50 * noiseFactor + Math.random() * 30);
        break;
        
      case 'water_quality':
        sensor.value += (Math.random() - 0.5) * 0.2;
        sensor.value = Math.max(6.5, Math.min(8.5, sensor.value));
        if (sensor.tds) {
          sensor.tds += (Math.random() - 0.5) * 10;
          sensor.tds = Math.max(150, Math.min(350, sensor.tds));
        }
        break;
        
      case 'rainfall':
        // Rain events are rare
        if (Math.random() > 0.98) {
          sensor.value = Math.random() * 15;
        } else {
          sensor.value = Math.max(0, sensor.value - 0.5);
        }
        break;
        
      case 'flood':
        sensor.value += (Math.random() - 0.5) * 0.05;
        sensor.value = Math.max(0, Math.min(2, sensor.value));
        break;
        
      case 'parking':
        sensor.value = Math.round(Math.random() * 20);
        break;
        
      case 'street_light':
        // On at night
        sensor.value = (hour >= 18 || hour <= 6) ? 100 : 0;
        break;
        
      case 'energy':
        // Solar panels - high during day
        const solarFactor = (hour >= 7 && hour <= 18) ? 
          Math.sin((hour - 7) * Math.PI / 11) : 0;
        sensor.value = solarFactor * 15 * (0.8 + Math.random() * 0.4);
        break;
        
      case 'vibration':
        sensor.value = 1 + Math.random() * 3;
        break;
        
      case 'pressure':
        sensor.value = 3 + (Math.random() - 0.5) * 1;
        sensor.value = Math.max(2, Math.min(5, sensor.value));
        break;
        
      case 'waste':
        // Bins slowly fill up
        sensor.value += Math.random() * 2;
        sensor.value = Math.min(100, sensor.value);
        // Reset if full
        if (sensor.value > 95 && Math.random() > 0.7) {
          sensor.value = 10;
        }
        break;
        
      case 'radiation':
        // UV index varies with sun
        const uvFactor = (hour >= 10 && hour <= 16) ? 
          8 + Math.random() * 3 : 
          Math.random() * 2;
        sensor.value = uvFactor;
        break;
        
      default:
        sensor.value += (Math.random() - 0.5) * 0.5;
    }
  });
  
  // Update government schemes - simulate progress and events
  newState.schemes.forEach(scheme => {
    scheme.lastUpdated = new Date().toISOString();
    
    // Randomly update progress (slow incremental changes)
    if (Math.random() > 0.7 && scheme.status !== 'completed') {
      scheme.phases.forEach(phase => {
        if (phase.status === 'on-track' || phase.status === 'delayed') {
          // Increase progress by 0.5-2%
          phase.progress = Math.min(100, phase.progress + Math.random() * 2);
          
          // Update spent amount proportionally
          const progressRatio = phase.progress / 100;
          phase.spent = Math.min(phase.budget, Math.round(phase.budget * progressRatio * (0.95 + Math.random() * 0.1)));
          
          // Mark as completed if progress reaches 100%
          if (phase.progress >= 100) {
            phase.status = 'completed';
          }
        }
      });
      
      // Recalculate overall progress
      const totalProgress = scheme.phases.reduce((sum, p) => sum + p.progress, 0);
      scheme.overallProgress = Math.round(totalProgress / scheme.phases.length);
      
      // Recalculate total budget utilized
      const totalSpent = scheme.phases.reduce((sum, p) => sum + p.spent, 0);
      scheme.budgetUtilized = totalSpent;
      
      // Update status based on budget and timeline
      const budgetOverrun = scheme.budgetUtilized > scheme.totalBudget;
      const hasDiscrepancies = scheme.discrepancies && scheme.discrepancies.length > 0;
      
      if (budgetOverrun || hasDiscrepancies) {
        scheme.status = 'discrepant';
      } else if (scheme.overallProgress >= 100) {
        scheme.status = 'completed';
      } else {
        // Check if any phase is delayed
        const hasDelayedPhase = scheme.phases.some(p => p.status === 'delayed');
        scheme.status = hasDelayedPhase ? 'delayed' : 'on-track';
      }
    }
    
    // Randomly add new vendor report (5% chance per update)
    if (Math.random() > 0.95 && scheme.status !== 'completed') {
      const ongoingPhases = scheme.phases.filter(p => p.status === 'on-track' || p.status === 'delayed');
      if (ongoingPhases.length > 0) {
        const randomPhase = ongoingPhases[Math.floor(Math.random() * ongoingPhases.length)];
        const newReportId = (scheme.vendorReports.length || 0) + 1;
        
        const vendors = ['Green Build Contractors', 'AquaTech Infrastructure', 'Shree Constructions', 'ElectroTech Services', 'Village Panchayat (Self)'];
        const randomVendor = vendors[Math.floor(Math.random() * vendors.length)];
        
        const expenseClaimed = Math.round(randomPhase.budget * 0.1 * (0.8 + Math.random() * 0.4));
        
        scheme.vendorReports.push({
          id: newReportId,
          vendorName: randomVendor,
          submittedDate: new Date().toISOString().split('T')[0],
          phase: randomPhase.id,
          workCompleted: `Progress update for ${randomPhase.name}`,
          expenseClaimed: expenseClaimed,
          verificationStatus: Math.random() > 0.7 ? 'verified' : 'pending',
          documents: ['progress-report.pdf']
        });
      }
    }
    
    // Randomly update citizen feedback (3% chance)
    if (Math.random() > 0.97) {
      scheme.feedbackCount += 1;
      // Recalculate average rating
      const newRating = 1 + Math.random() * 4; // Random rating between 1-5
      scheme.citizenRating = Number(((scheme.citizenRating * (scheme.feedbackCount - 1) + newRating) / scheme.feedbackCount).toFixed(1));
    }
  });
  
  // Keep only last 20 alerts
  if (newState.alerts.length > 20) {
    newState.alerts = newState.alerts.slice(-20);
  }
  
  return newState;
}

export function simulateScenario(state, scenario) {
  const newState = JSON.parse(JSON.stringify(state));
  
  switch (scenario) {
    case 'water_crisis':
      newState.waterTanks.forEach(tank => {
        tank.currentLevel = Math.max(10, tank.currentLevel - 30);
        tank.status = tank.currentLevel < 30 ? 'critical' : 'warning';
      });
      newState.alerts.push({
        id: `alert-${Date.now()}`,
        type: 'critical',
        title: 'Water Crisis Alert',
        message: 'Multiple tanks below critical level',
        timestamp: new Date().toISOString(),
        category: 'water'
      });
      break;
      
    case 'power_outage':
      newState.powerNodes.slice(0, 4).forEach(node => {
        node.currentLoad = 0;
        node.status = 'critical';
      });
      newState.alerts.push({
        id: `alert-${Date.now()}`,
        type: 'critical',
        title: 'Power Outage',
        message: 'Multiple transformers offline',
        timestamp: new Date().toISOString(),
        category: 'power'
      });
      break;
      
    case 'heavy_rain':
      newState.waterTanks.forEach(tank => {
        tank.currentLevel = Math.min(100, tank.currentLevel + 25);
        tank.status = 'good';
      });
      const rainSensor = newState.sensors.find(s => s.type === 'rainfall');
      if (rainSensor) rainSensor.value = 45;
      newState.alerts.push({
        id: `alert-${Date.now()}`,
        type: 'warning',
        title: 'Heavy Rainfall',
        message: 'Flood risk in low-lying areas',
        timestamp: new Date().toISOString(),
        category: 'weather'
      });
      break;
      
    default:
      break;
  }
  
  return newState;
}
