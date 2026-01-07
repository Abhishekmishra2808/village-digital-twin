# 🌐 GNN Village Infrastructure Impact Predictor - DEMO OUTPUT

## Sample Run Output

```
══════════════════════════════════════════════════════════════════════
  🌐 GNN VILLAGE INFRASTRUCTURE IMPACT PREDICTOR - DEMO
══════════════════════════════════════════════════════════════════════

  This demo shows how the Graph Neural Network predicts
  cascading failures across village infrastructure.

  ▶ Step 1: Initializing GNN with Village Infrastructure
  ──────────────────────────────────────────────────────
    ✓ GNN Initialized Successfully
    • Total Nodes: 23
    • Total Edges: 67
    • Node Types:
      🚗 road: 5
      🏫 school: 1
      🏥 hospital: 1
      🛒 market: 1
      🏢 building: 3
      ⚡ power: 3
      💧 tank: 2
      🔧 pump: 2
      📍 sensor: 2
      📍 cluster: 3

  ▶ Step 2: Running Failure Scenarios
  ──────────────────────────────────────────────────────

  ━━━ Scenario 1: 🚗 Hospital Road Damaged ━━━

    ⚠ FAILURE SOURCE:
      Node: Hospital Access Road
      Type: road | Failure: road_damage
      Severity: CRITICAL

    📊 IMPACT ASSESSMENT:
      Risk Level: CRITICAL
      Total Affected: 8 nodes
      Critical: 2 | High: 3
      Population Affected: ~450 people
      Est. Recovery: 8-12 hours

    📝 Summary: Critical road damage affecting hospital access. 
                Emergency services severely impacted. Multiple 
                residential areas cut off from medical care.

    🔗 CASCADING EFFECTS (Top 5):

    1. Primary Health Center
       Type: hospital | Severity: CRITICAL | Probability: 95%
       Time to Impact: 0 mins
       Effects: Emergency access blocked, Patient transport delayed

    2. Housing Colony A
       Type: residential | Severity: HIGH | Probability: 78%
       Time to Impact: 5 mins
       Effects: Medical emergency response delayed, Evacuation route compromised

    3. Government Primary School
       Type: school | Severity: HIGH | Probability: 72%
       Time to Impact: 8 mins
       Effects: Children's medical emergency response affected

    4. Main Distribution Transformer
       Type: power | Severity: MEDIUM | Probability: 45%
       Time to Impact: 15 mins
       Effects: Maintenance access restricted

    5. Central Market Area
       Type: cluster | Severity: MEDIUM | Probability: 38%
       Time to Impact: 20 mins
       Effects: Alternative routes congested

    ✅ PRIORITY ACTIONS:
      1. Establish emergency medical helicopter landing zone
      2. Deploy mobile medical unit to affected areas
      3. Clear alternative access routes immediately

  ━━━ Scenario 2: ⚡ Main Transformer Failure ━━━

    ⚠ FAILURE SOURCE:
      Node: Main Distribution Transformer
      Type: power | Failure: power_outage
      Severity: HIGH

    📊 IMPACT ASSESSMENT:
      Risk Level: HIGH
      Total Affected: 12 nodes
      Critical: 1 | High: 4
      Population Affected: ~1,430 people
      Est. Recovery: 4-8 hours

    📝 Summary: Main power transformer failure causing widespread 
                outage. Critical facilities switching to backup power. 
                Water pumping systems affected.

    🔗 CASCADING EFFECTS (Top 5):

    1. Primary Health Center
       Type: hospital | Severity: CRITICAL | Probability: 92%
       Time to Impact: 0 mins
       Effects: Life support systems on backup, Limited operating capacity

    2. Main Pumping Station
       Type: pump | Severity: HIGH | Probability: 88%
       Time to Impact: 2 mins
       Effects: Water supply interrupted, Pressure drop in network

    3. Government Primary School
       Type: school | Severity: HIGH | Probability: 75%
       Time to Impact: 5 mins
       Effects: Classes disrupted, Food storage at risk

    4. Weekly Haat (Market)
       Type: market | Severity: HIGH | Probability: 70%
       Time to Impact: 5 mins
       Effects: Refrigerated goods at risk, Business losses

    5. Booster Pump - Market Area
       Type: pump | Severity: HIGH | Probability: 65%
       Time to Impact: 8 mins
       Effects: Market area water supply cut

    ✅ PRIORITY ACTIONS:
      1. Activate PHC backup generator immediately
      2. Deploy mobile power units to critical water pumps
      3. Contact electricity board for emergency repair

  ━━━ Scenario 3: 🔥 Fire at Health Center ━━━

    ⚠ FAILURE SOURCE:
      Node: Primary Health Center
      Type: hospital | Failure: building_fire
      Severity: CRITICAL

    📊 IMPACT ASSESSMENT:
      Risk Level: CRITICAL
      Total Affected: 15 nodes
      Critical: 3 | High: 5
      Population Affected: ~1,480 people
      Est. Recovery: 24-48 hours

    📝 Summary: Fire at village's only health center. All patients 
                require evacuation. No medical services available 
                within village. Life-threatening emergency.

    🔗 CASCADING EFFECTS (Top 5):

    1. Hospital Access Road
       Type: road | Severity: CRITICAL | Probability: 98%
       Time to Impact: 0 mins
       Effects: Road blocked by emergency vehicles, Fire spreading risk

    2. PHC Backup Generator
       Type: power | Severity: CRITICAL | Probability: 90%
       Time to Impact: 2 mins
       Effects: Explosion risk from fuel, Power backup lost

    3. Housing Colony A
       Type: residential | Severity: HIGH | Probability: 82%
       Time to Impact: 5 mins
       Effects: Evacuation required, Smoke inhalation risk

    4. Government Primary School
       Type: school | Severity: HIGH | Probability: 78%
       Time to Impact: 8 mins
       Effects: Emergency evacuation, Children at risk

    5. Gram Panchayat Office
       Type: government | Severity: HIGH | Probability: 65%
       Time to Impact: 10 mins
       Effects: Emergency coordination center needed elsewhere

    ✅ PRIORITY ACTIONS:
      1. Evacuate all patients to nearest district hospital
      2. Establish fire perimeter - evacuate 200m radius
      3. Set up temporary medical camp at Panchayat office

  ━━━ Scenario 4: 🌊 Highway Flooded ━━━

    ⚠ FAILURE SOURCE:
      Node: NH-44 Highway Connection
      Type: road | Failure: road_flood
      Severity: HIGH

    📊 IMPACT ASSESSMENT:
      Risk Level: HIGH
      Total Affected: 18 nodes
      Critical: 1 | High: 6
      Population Affected: ~1,480 people (entire village)
      Est. Recovery: 12-24 hours

    📝 Summary: Main highway flooded cutting off village from 
                district headquarters. No supplies, medicine, or 
                emergency services can enter/exit village.

    🔗 CASCADING EFFECTS (Top 5):

    1. Primary Health Center
       Type: hospital | Severity: CRITICAL | Probability: 85%
       Time to Impact: 30 mins
       Effects: Medical supplies depleted, No referrals possible

    2. Weekly Haat (Market)
       Type: market | Severity: HIGH | Probability: 80%
       Time to Impact: 60 mins
       Effects: Fresh supplies cut off, Price spike imminent

    3. Village Main Road
       Type: road | Severity: HIGH | Probability: 75%
       Time to Impact: 120 mins
       Effects: Backup water from flooding, Internal traffic increased

    4. Fair Price Shop (Ration)
       Type: government | Severity: HIGH | Probability: 70%
       Time to Impact: 180 mins
       Effects: Ration distribution disrupted

    5. All Consumer Clusters
       Type: cluster | Severity: HIGH | Probability: 68%
       Time to Impact: 240 mins
       Effects: Food and medicine shortages begin

    ✅ PRIORITY ACTIONS:
      1. Activate emergency food and medicine reserves
      2. Request helicopter evacuation for critical patients
      3. Establish boat service if flooding persists

  ━━━ Scenario 5: 💧 Water Tank Leak ━━━

    ⚠ FAILURE SOURCE:
      Node: Main Overhead Tank
      Type: tank | Failure: leak
      Severity: MEDIUM

    📊 IMPACT ASSESSMENT:
      Risk Level: MEDIUM
      Total Affected: 6 nodes
      Critical: 0 | High: 2
      Population Affected: ~600 people
      Est. Recovery: 2-4 hours

    📝 Summary: Main overhead tank leaking. Central area water 
                pressure dropping. Ground reservoir can partially 
                compensate. Repair team required.

    🔗 CASCADING EFFECTS (Top 5):

    1. Booster Pump - Market Area
       Type: pump | Severity: HIGH | Probability: 75%
       Time to Impact: 15 mins
       Effects: Reduced input pressure, Pump strain

    2. Central Market Area
       Type: cluster | Severity: HIGH | Probability: 70%
       Time to Impact: 30 mins
       Effects: Water supply reduced, Sanitation concerns

    3. Weekly Haat (Market)
       Type: market | Severity: MEDIUM | Probability: 55%
       Time to Impact: 45 mins
       Effects: Food stall water shortage

    4. Government Primary School
       Type: school | Severity: MEDIUM | Probability: 50%
       Time to Impact: 60 mins
       Effects: Drinking water rationing needed

    5. Water Quality Sensor
       Type: sensor | Severity: LOW | Probability: 40%
       Time to Impact: 30 mins
       Effects: Abnormal readings from air intake

    ✅ PRIORITY ACTIONS:
      1. Isolate leaking section of tank
      2. Increase ground reservoir pumping rate
      3. Dispatch repair team with welding equipment


  ▶ Step 3: Vulnerability Analysis
  ──────────────────────────────────────────────────────

    ⚠ TOP 5 MOST VULNERABLE NODES:

    1. Primary Health Center (hospital)
       Vulnerability: 92% | Connections: 8
       Risk Level: HIGH

    2. Main Distribution Transformer (power)
       Vulnerability: 85% | Connections: 12
       Risk Level: HIGH

    3. NH-44 Highway Connection (road)
       Vulnerability: 78% | Connections: 6
       Risk Level: HIGH

    4. Main Pumping Station (pump)
       Vulnerability: 72% | Connections: 5
       Risk Level: MEDIUM

    5. Government Primary School (school)
       Vulnerability: 68% | Connections: 7
       Risk Level: MEDIUM


══════════════════════════════════════════════════════════════════════
  🎉 DEMO COMPLETE
══════════════════════════════════════════════════════════════════════

  The GNN Impact Predictor successfully analyzed:
  • 5 failure scenarios
  • 23 infrastructure nodes
  • 67 connections

  To use in your app, navigate to "Impact Predictor" in the sidebar!
```

## How to Run the Demo

### Option 1: Run the demo script
```bash
cd backend
node demo-gnn.js
```

### Option 2: Use the Web UI
1. Start the backend: `cd backend && npm start`
2. Start the frontend: `npm run dev`
3. Login to the dashboard
4. Click **"Impact Predictor"** in the sidebar
5. Select a node and failure scenario
6. Click **"Predict Impact"**

## Infrastructure Types Supported

| Icon | Type | Description |
|------|------|-------------|
| 🚗 | Road | Main highways, secondary roads, village lanes, farm paths |
| 🏫 | School | Primary schools, high schools |
| 🏥 | Hospital | PHC, health sub-centers |
| 🛒 | Market | Weekly haats, daily markets |
| 🏢 | Building | Government offices, residential, commercial |
| ⚡ | Power | Transformers, substations, solar grids, generators |
| 💧 | Tank | Overhead tanks, ground reservoirs |
| 🔧 | Pump | Main pumps, booster pumps, borewells |
| 📡 | Sensor | Flow, pressure, quality sensors |
| 📍 | Cluster | Consumer/population areas |

## Failure Scenarios

### Road Failures
- `road_damage` - Physical damage to road surface
- `road_flood` - Road flooded/waterlogged
- `road_blockage` - Road blocked by debris/accident
- `road_accident` - Traffic accident

### Building Failures
- `building_fire` - Fire in building
- `building_collapse` - Structural collapse
- `building_evacuation` - Emergency evacuation needed

### Power Failures
- `power_outage` - Power supply failure
- `power_overload` - System overload

### Water Failures
- `leak` - Water leak in tank/pipe
- `contamination` - Water quality issue
- `pump_failure` - Pump malfunction
