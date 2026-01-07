# 🎯 Quick Integration Guide - Add GNN Visualization to Your App

This guide shows how to integrate the GNN Impact Visualizer into your existing Village Digital Twin application.

## Option 1: Add as a New View (Recommended)

### Step 1: Add Route to Your App

In your `src/App.tsx`, add the GNN demo as a new view option:

```tsx
import GNNImpactDemo from './pages/GNNImpactDemo';

// In your view rendering logic, add:
case 'gnn-impact':
  return <GNNImpactDemo />;
```

### Step 2: Add Navigation Item

In your sidebar/navigation, add:

```tsx
{
  id: 'gnn-impact',
  name: 'Impact Predictor',
  icon: '🧠',
  path: '/gnn-impact'
}
```

### Step 3: Update Store (if using Zustand)

In `src/store/villageStore.ts`:

```tsx
activeView: 'dashboard' | 'water' | 'power' | 'gnn-impact' | ...,

setActiveView: (view) => set({ activeView: view })
```

## Option 2: Integrate into Existing ImpactPredictorView

If you already have an `ImpactPredictorView` component, enhance it:

```tsx
// src/components/Views/ImpactPredictorView.tsx
import { useState } from 'react';
import ImpactGraphVisualizer from '../ImpactGraphVisualizer';
import { gnnService } from '../../services/gnnImpactService';
import type { GraphVisualizationData } from '../../types/graph-visualization';

function ImpactPredictorView() {
  const [graphData, setGraphData] = useState<GraphVisualizationData | null>(null);

  const handlePredict = async (nodeId: string) => {
    const result = await gnnService.predictImpact({
      nodeId,
      severity: 0.8
    });
    setGraphData(result.visualization);
  };

  return (
    <div className="impact-predictor-view">
      {/* Your existing controls */}
      
      {/* Add the graph visualizer */}
      {graphData && (
        <ImpactGraphVisualizer
          visualizationData={graphData}
          height={600}
          onNodeClick={(node) => {
            console.log('Node clicked:', node);
            // Handle node selection
          }}
        />
      )}
    </div>
  );
}
```

## Option 3: Standalone Route with React Router

If using React Router:

```tsx
// src/main.tsx or src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GNNImpactDemo from './pages/GNNImpactDemo';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/gnn-impact" element={<GNNImpactDemo />} />
        {/* ... other routes */}
      </Routes>
    </BrowserRouter>
  );
}
```

## Quick Test

### 1. Start Backend
```bash
cd backend
node demo-gnn.js
```

### 2. Start Frontend
```bash
npm run dev
```

### 3. Navigate to Demo
- If using router: `http://localhost:5173/gnn-impact`
- If using view system: Click "Impact Predictor" in sidebar

## Simple Component Example

Minimal usage in any component:

```tsx
import { ImpactGraphVisualizer } from './gnn-visualization';

function MyComponent() {
  const mockData = {
    nodes: [
      { id: '1', name: 'Power Station', type: 'power', color: '#9F7AEA', 
        size: 15, pulse: true, isEpicenter: true, probability: 100, severity: 'critical' },
      { id: '2', name: 'Water Pump', type: 'pump', color: '#FC8181', 
        size: 10, probability: 85, severity: 'critical' }
    ],
    links: [
      { source: '1', target: '2', type: 'impact-flow', 
        color: '#FC8181', particles: 8, particleSpeed: 0.02 }
    ]
  };

  return <ImpactGraphVisualizer visualizationData={mockData} height={500} />;
}
```

## Connect to Real GNN Backend

Update the service URL if your backend runs on a different port:

```tsx
// src/services/gnnImpactService.ts
const gnnService = new GNNImpactService('http://localhost:YOUR_PORT');
```

## Next Steps

1. ✅ Components created
2. ✅ Types defined
3. ✅ Utilities ready
4. ✅ Demo page built
5. 🎯 **YOU**: Add to your app navigation
6. 🎯 **YOU**: Connect to your backend
7. 🎯 **YOU**: Customize styling to match your theme

That's it! Your GNN visualization is ready to use! 🎉
