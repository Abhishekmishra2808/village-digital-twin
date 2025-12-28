# 🎮 User Guide - Sundarpur Digital Twin

## 🖱️ Map Controls

### Mouse Controls
- **Click + Drag**: Pan the map
- **Scroll Wheel**: Zoom in/out
- **Right Click + Drag**: Rotate camera bearing
- **Ctrl + Drag**: Change pitch (tilt angle)
- **Double Click**: Zoom in on location

### Marker Interactions
- **Hover**: Shows tooltip with name
- **Click**: Opens detail panel and flies to location
- **💧 Water Droplet**: Water tank
- **◆ Diamond**: Power transformer
- **● Circle**: IoT sensor
- **🏢 Square**: Building (extruded 3D)

## 🎛️ Interface Navigation

### Sidebar Menu
| Icon | View | Description |
|------|------|-------------|
| 🏠 | Dashboard | KPIs, charts, activity feed |
| 💧 | Water | Water tank infrastructure |
| ⚡ | Power | Electrical grid monitoring |
| 🛣️ | Roads | Road network status |
| 🗑️ | Waste | Waste management |
| 🌾 | Agriculture | Farm sensor data |
| 🚨 | Alerts | Critical notifications |
| 👥 | Reports | Citizen submissions |
| 📊 | Analytics | Data insights |
| ⚙️ | Settings | Configuration |

### Keyboard Shortcuts
- **ESC**: Close detail panel
- **F5**: Refresh page
- **F11**: Fullscreen mode
- **F12**: Open developer console
- **Ctrl + -/+**: Zoom page in/out
- **Ctrl + 0**: Reset zoom

## 📊 Dashboard Guide

### KPI Cards Explained

**Infrastructure Health (87%)**
- Overall health score of all infrastructure
- Green: >80%, Yellow: 60-80%, Red: <60%
- ↑/↓ arrows show trend vs last week

**Active Sensors (18/20)**
- Number of online IoT sensors
- ⚠️ shows count of offline sensors
- Click to view sensor map

**Citizen Reports (12)**
- Total community submissions
- 🔴 Number shows pending reviews
- Click to view all reports

**Avg Response Time (2.3 hrs)**
- Average time to address issues
- Lower is better
- ↓ indicates improvement

### Chart Interpretation

**Water Infrastructure Bar Chart**
- Each bar = one tank
- Height = current level (%)
- Colors match status (green/yellow/red)
- Hover for exact values

**Power Grid Line Chart**
- Blue line = current load
- Gray line = total capacity
- Shows all 12 transformers
- Peak hours visible (6-9 PM)

## 🔍 Asset Details Panel

### Water Tank Details
- **Status Badge**: Good/Warning/Critical
- **Level Indicator**: Visual gauge (0-100%)
- **Specifications**:
  - Capacity: Total liters
  - Current: Liters remaining
  - Flow Rate: L/hr consumption
  - Elevation: Meters above sea level
  - Last Refill: Days ago
  - Next Service: Scheduled date
- **Actions**:
  - View Full History: (Future feature)
  - Set Alert Threshold: (Future feature)
  - Schedule Maintenance: (Future feature)

### Building Details
- **Type**: school/temple/health/government/etc.
- **Height**: Meters
- **Floors**: Number of floors
- **Occupancy**: Current people count
- **Coordinates**: Lat/Long position

### Power Node Details
- **Status**: Based on load percentage
- **Capacity**: Max kW
- **Current Load**: Active kW usage
- **Voltage**: Operating voltage
- **Temperature**: Transformer heat (°C)
- **Load Bar**: Visual percentage indicator

### Sensor Details
- **Type**: soil_moisture, air_quality, weather, etc.
- **Current Reading**: Large display with unit
- **Status**: 🟢 Active or 🔴 Offline
- **Last Update**: Time since last reading
- **Additional Data**: Humidity, wind, TDS, etc.

## 🎛️ Admin Control Panel

### Opening the Panel
1. Click **⚙️ gear icon** (bottom-right corner)
2. Panel slides in from right
3. Click **X** to close

### Manual Sensor Controls

**Sliders Available:**
- Central Tank Level (0-100%)
- East Tank Level (0-100%)
- Main Transformer Load (0-500 kW)

**How to Use:**
1. Drag slider to desired value
2. Release to send update
3. Watch map marker update color
4. Check Activity Feed for confirmation

**Real-time Updates:**
- Changes broadcast to all viewers
- Map updates immediately
- Charts refresh within 5 seconds
- Activity Feed logs the change

### Scenario Simulations

**Water Crisis**
- Effect: All tank levels drop 30%
- Critical alerts triggered
- Red markers appear
- Activity Feed shows warning

**Power Outage**
- Effect: First 4 transformers go offline
- Load drops to 0
- Critical status applied
- Affected areas highlighted

**Heavy Rainfall**
- Effect: All tanks +25% level
- Flood sensor activates
- Rainfall gauge shows 45mm
- Info alerts in feed

**Use Cases:**
- Demonstrations
- Training scenarios
- Stress testing
- Emergency planning

## 📈 Activity Feed

### Reading Events
- **🔵 Blue Dot**: Informational event
- **🟡 Yellow Dot**: Warning event
- **🔴 Pulsing Red**: Critical alert
- **Icons**: 💧 Water, ⚡ Power, etc.
- **Time**: "X minutes/hours ago"

### Event Types
1. Sensor readings (normal operation)
2. Threshold warnings
3. Critical alerts
4. Manual overrides
5. Scenario triggers
6. System status changes

### Auto-Scroll
- Newest events at top
- Max 20 events shown
- Older events removed
- Updates every 5 seconds

## 🌐 Status Bar (Bottom)

### Left Side
- **WebSocket Status**:
  - 🟢 Green: Connected
  - 🔴 Red: Disconnected
- **Active Sensors**: Count online
- **Offline Sensors**: Count in red

### Right Side
- **Last Update**: "X seconds ago"
- **Coordinates**: 18.5204°N, 73.8567°E

## 🎨 Color Coding System

### Infrastructure Status
| Color | Status | Meaning |
|-------|--------|---------|
| 🟢 Green | Good | Operating normally |
| 🟡 Yellow | Warning | Approaching threshold |
| 🔴 Red | Critical | Immediate attention needed |
| ⚫ Gray | Offline | No connection |

### Thresholds

**Water Tanks:**
- Good: >50% full
- Warning: 30-50% full
- Critical: <30% full

**Power Nodes:**
- Good: <80% load
- Warning: 80-95% load
- Critical: >95% load

## 🔔 Alert Priorities

### Info (Blue)
- Normal operations
- Sensor updates
- Routine events

### Warning (Yellow)
- Threshold approaching
- Non-critical issues
- Scheduled maintenance

### Critical (Red, Pulsing)
- Emergency situations
- System failures
- Immediate action required

## 💡 Pro Tips

### Performance
1. Close detail panel when not needed
2. Reduce map pitch for smoother rendering
3. Use Dashboard view for overview
4. Limit admin panel usage during demos

### Demo Presentation
1. Start with Dashboard (shows all KPIs)
2. Click "Water Infrastructure" to show 3D map
3. Click a critical tank to show details
4. Open Admin Controls
5. Simulate "Water Crisis" scenario
6. Watch Activity Feed update
7. Show charts updating in real-time

### Troubleshooting
1. **No data updating?** Check WebSocket status (top-right)
2. **Slow loading?** Wait for OpenStreetMap tiles
3. **Markers not visible?** Zoom in closer
4. **Panel stuck open?** Click X or press ESC
5. **Chart not showing?** Refresh page (F5)

## 📱 Mobile Usage

### Gestures
- **Pinch**: Zoom in/out
- **Two-finger drag**: Pan map
- **Single tap**: Select marker
- **Double tap**: Zoom in

### Layout Differences
- Sidebar auto-collapses on mobile
- Detail panel becomes bottom sheet
- Charts stack vertically
- Smaller KPI cards

## 🎯 Common Tasks

### "I want to check water levels"
1. Click 💧 Water Infrastructure (sidebar)
2. View tank markers on map
3. Green = good, Yellow = warning, Red = critical
4. Click any tank for detailed info

### "I need to see power consumption"
1. Click ⚡ Power Grid (sidebar)
2. View diamond markers
3. Check color (green/yellow/red)
4. Or view Dashboard → Power Chart

### "I want to simulate an emergency"
1. Click ⚙️ gear icon (bottom-right)
2. Scroll to "Scenario Simulations"
3. Click desired scenario button
4. Watch effects on map and charts

### "I need to export data"
1. (Future feature - coming soon)
2. Currently: Open browser console (F12)
3. View WebSocket messages
4. Copy data manually

## 📊 Understanding the Data

### Update Frequency
- Sensor data: Every 5 seconds
- Charts: Auto-refresh on data update
- Activity Feed: Real-time stream
- KPIs: Calculated on each update

### Data Simulation
All data is **realistically simulated**:
- Water consumption follows daily patterns
- Power usage peaks at 6-9 PM
- Temperature follows day/night cycles
- Traffic higher at rush hours (7-9 AM, 5-7 PM)
- Air quality better at night

### Realistic Patterns
- Tanks slowly deplete (consumption)
- Random rainfall refills tanks
- Power load varies by time of day
- Sensors occasionally go offline
- Events trigger based on thresholds

## 🎓 Training Guide

### For Village Administrators
1. Monitor infrastructure health daily
2. Check critical alerts first (red dots)
3. Review pending citizen reports
4. Schedule maintenance proactively
5. Track response time trends

### For Technical Staff
1. Use Admin Controls for testing
2. Monitor sensor status regularly
3. Investigate offline sensors
4. Validate data accuracy
5. Export reports (future feature)

### For Decision Makers
1. Review Dashboard KPIs
2. Analyze trend arrows (↑↓)
3. Compare with previous periods
4. Identify problem areas
5. Plan infrastructure upgrades

## 🚀 Advanced Features

### Coming Soon
- [ ] Historical data analysis
- [ ] Predictive analytics
- [ ] User authentication
- [ ] Report submission form
- [ ] Data export/import
- [ ] Email/SMS alerts
- [ ] Mobile app
- [ ] Voice notifications
- [ ] Multi-language support
- [ ] Offline mode

---

**Need Help?** Check README.md or open browser console (F12) for technical details.

**Enjoying the app?** Give feedback through GitHub issues!
