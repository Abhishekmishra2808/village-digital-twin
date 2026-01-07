# 🧠 GNN Impact Graph Visualization

Interactive force-directed graph visualization for infrastructure failure impact prediction powered by Graph Neural Networks (GNN).

## 📦 Installation

The required packages have already been installed:

```bash
npm install react-force-graph-2d d3-scale-chromatic
```

## 🎯 Features

- **🎨 Real-time Visualization**: Physics-based force-directed graph with smooth animations
- **⚡ Pulsing Epicenter**: Visual identification of failure source with breathing animation
- **🌊 Impact Flow Particles**: Animated particles showing cascading failure propagation
- **🎨 Color-Coded Severity**: Red (critical) → Orange (high) → Green (medium) → Gray (low)
- **🔍 Interactive**: Zoom, pan, hover for details, click nodes for actions
- **📊 Smart Highlighting**: Neighbor nodes and connections highlight on hover
- **🎯 Adaptive Sizing**: Node size reflects impact probability and criticality
- **📈 Performance Optimized**: Canvas-based rendering for smooth 60fps animations

## 🚀 Quick Start

### 1. Import and Use the Visualizer

```tsx
import ImpactGraphVisualizer from './components/ImpactGraphVisualizer';
import type { GraphVisualizationData } from './types/graph-visualization';

function MyApp() {
  const [graphData, setGraphData] = useState<GraphVisualizationData>({
    nodes: [
      {
        id: 'power-1',
        name: 'Main Substation',
        type: 'power',
        color: '#9F7AEA',
        size: 15,
        pulse: true,
        isEpicenter: true,
        probability: 100,
        severity: 'critical'
      },
      // ... more nodes
    ],
    links: [
      {
        source: 'power-1',
        target: 'pump-1',
        type: 'impact-flow',
        color: '#FC8181',
        width: 4,
        particles: 8,
        particleSpeed: 0.02
      },
      // ... more links
    ]
  });

  return (
    <ImpactGraphVisualizer
      visualizationData={graphData}
      height={700}
      showLegend={true}
      onNodeClick={(node) => console.log('Clicked:', node)}
    />
  );
}
```

### 2. Run the Demo Page

```tsx
// In your router or App.tsx
import GNNImpactDemo from './pages/GNNImpactDemo';

// Add route
<Route path="/gnn-demo" element={<GNNImpactDemo />} />
```

Or run directly:

```bash
# Make sure your backend is running on port 3001
cd backend
node demo-gnn.js

# In another terminal, start frontend
npm run dev
```

Then navigate to the demo page to see the full interactive experience!

## 📚 Data Structure

### Node Format

```typescript
interface GraphNode {
  id: string;              // Unique identifier
  name: string;            // Display name
  type: NodeType;          // 'power', 'water', 'road', etc.
  
  // Visual properties
  color?: string;          // Hex color (auto-calculated if omitted)
  size?: number;           // Radius in pixels (default: 5)
  
  // Impact analysis
  probability?: number;    // Impact probability 0-100
  severity?: SeverityLevel; // 'critical' | 'high' | 'medium' | 'low' | 'none'
  isEpicenter?: boolean;   // Is this the failure source?
  pulse?: boolean;         // Should node pulse/breathe?
}
```

### Link Format

```typescript
interface GraphLink {
  source: string;          // Source node ID
  target: string;          // Target node ID
  
  // Visual properties
  type?: 'physical' | 'impact-flow' | 'dependency';
  color?: string;          // Hex color
  width?: number;          // Line thickness
  
  // Particle animation (for impact-flow type)
  particles?: number;      // Number of particles (0-10)
  particleSpeed?: number;  // Speed 0.001-0.03 (faster = more urgent)
}
```

## 🔌 Backend Integration

### Connect to Your GNN Backend

```typescript
import { gnnService } from './services/gnnImpactService';

// Predict impact for a node failure
const result = await gnnService.predictImpact({
  nodeId: 'power-substation-1',
  severity: 0.8,
  timestamp: new Date(),
});

// The result includes ready-to-use visualization data
setGraphData(result.visualization);
```

### Backend API Expected Format

Your backend should return:

```json
{
  "status": "success",
  "impactedNodes": [
    {
      "id": "pump-main",
      "name": "Main Pump",
      "type": "pump",
      "probability": 87.5,
      "severity": "critical",
      "estimatedTime": 2.2
    }
  ],
  "visualization": {
    "nodes": [ /* GraphNode[] */ ],
    "links": [ /* GraphLink[] */ ]
  }
}
```

## 🎨 Customization

### Styling

```tsx
<ImpactGraphVisualizer
  visualizationData={data}
  height={800}
  width={1200}
  backgroundColor="#0f1419"  // Dark theme
  showLegend={false}         // Hide legend
  enableInteraction={true}   // Allow zoom/pan
/>
```

### Custom Node Rendering

The component already handles:
- ✅ Pulsing animations for epicenters
- ✅ Glowing effects for critical nodes
- ✅ Auto-sizing based on probability
- ✅ Labels with probability badges
- ✅ Hover info panels

### Particle Flow Tuning

```typescript
// Fast, urgent impact (critical)
{
  particles: 8,
  particleSpeed: 0.02,
  color: '#FC8181'
}

// Slow, minor impact (low)
{
  particles: 2,
  particleSpeed: 0.005,
  color: '#68D391'
}
```

## 🛠️ Utility Functions

```typescript
import {
  getSeverityFromProbability,
  calculateParticleSpeed,
  transformGNNResultToVisualization,
  filterGraphBySeverity,
  calculateGraphStats
} from './utils/graphVisualizationUtils';

// Auto-calculate severity from probability
const severity = getSeverityFromProbability(87.5); // 'critical'

// Transform raw backend data
const vizData = transformGNNResultToVisualization(backendResponse);

// Filter to show only critical/high
const filtered = filterGraphBySeverity(nodes, links, 'high');

// Get statistics
const stats = calculateGraphStats(nodes, links);
console.log(`${stats.affectedNodes} of ${stats.totalNodes} nodes affected`);
```

## 📊 Visual Elements Explained

### Colors
- **Purple Pulse (🟣)**: Failure epicenter - the original failure point
- **Red (🔴)**: Critical impact >75% - immediate action required
- **Orange (🟠)**: High impact 50-75% - significant disruption
- **Green (🟢)**: Medium impact 25-50% - moderate concern
- **Blue (🔵)**: Low impact <25% - minor effect
- **Gray (⚪)**: No impact - operating normally

### Animations
- **Breathing/Pulsing**: The failure source node expands/contracts
- **Particle Flows**: Dots moving along links show impact propagation direction and speed
- **Glowing Rings**: Critical nodes have glowing halos
- **Highlight on Hover**: Node + all neighbors light up

## 🎯 Real-World Usage Example

```typescript
// When user reports a power failure
const handlePowerFailure = async (substationId: string) => {
  try {
    // Call your GNN backend
    const prediction = await gnnService.predictImpact({
      nodeId: substationId,
      severity: 1.0, // Full failure
      timestamp: new Date()
    });

    // Update visualization
    setGraphData(prediction.visualization);

    // Show alerts for critical impacts
    const critical = prediction.impactedNodes.filter(
      n => n.severity === 'critical'
    );

    if (critical.length > 0) {
      alert(`⚠️ ${critical.length} critical systems affected!`);
      // Dispatch emergency response...
    }
  } catch (error) {
    console.error('Impact prediction failed:', error);
  }
};
```

## 🔧 Troubleshooting

### Graph Not Showing
- ✅ Check that `graphData.nodes` and `graphData.links` are not empty
- ✅ Ensure node IDs in links match actual node IDs
- ✅ Verify `height` prop is set (default 600px)

### Particles Not Animating
- ✅ Set `type: 'impact-flow'` on links
- ✅ Ensure `particles` > 0 (try 4-8)
- ✅ Check `particleSpeed` is reasonable (0.005-0.02)

### Performance Issues
- ✅ Limit to <100 nodes for smooth 60fps
- ✅ Reduce `particles` count on links (try 2-4)
- ✅ Set `cooldownTicks` higher (200+) to settle faster

### Backend Connection Failed
- ✅ Verify backend is running (`node demo-gnn.js`)
- ✅ Check CORS settings if frontend/backend on different ports
- ✅ Toggle "Use Mock Data" in demo to test without backend

## 📁 File Structure

```
src/
├── components/
│   └── ImpactGraphVisualizer.tsx    # Main visualization component
├── pages/
│   └── GNNImpactDemo.tsx            # Full demo page with controls
├── services/
│   └── gnnImpactService.ts          # Backend API client
├── types/
│   └── graph-visualization.ts       # TypeScript interfaces
└── utils/
    └── graphVisualizationUtils.ts   # Helper functions
```

## 🚀 Next Steps

1. **Connect to Real Backend**: Update `baseUrl` in `gnnImpactService.ts`
2. **Add to Your App**: Import `ImpactGraphVisualizer` into your dashboard
3. **Customize Styling**: Adjust colors, sizes, and particle effects
4. **Add Actions**: Implement `onNodeClick` to show details or trigger responses
5. **Real-time Updates**: Connect to WebSocket for live failure monitoring

## 🎉 What You Get

With this visualization, you can now:

- 👀 **See the village "breathe"** as the graph updates in real-time
- 🌊 **Watch cascading failures** propagate through infrastructure
- 🎯 **Identify critical nodes** at a glance with color coding
- ⚡ **Measure impact speed** by observing particle animation speeds
- 🔍 **Explore relationships** by hovering and clicking nodes
- 📊 **Make informed decisions** with visual impact probability data

This is your **Digital Twin's Brain Visualization** - where abstract GNN predictions become tangible, interactive insights!

---

**Built with**: React + TypeScript + react-force-graph-2d + Your amazing GNN backend 🧠✨
