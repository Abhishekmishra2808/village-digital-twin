# ✅ GNN Visualization - Setup Checklist

Use this checklist to get your visualization up and running!

## 📦 Step 1: Installation
- [x] ✅ Run `npm install react-force-graph-2d d3-scale-chromatic`
- [x] ✅ Packages installed (715 added)

## 📁 Step 2: Files Created
- [x] ✅ `src/components/ImpactGraphVisualizer.tsx` - Main component
- [x] ✅ `src/pages/GNNImpactDemo.tsx` - Demo page
- [x] ✅ `src/services/gnnImpactService.ts` - API client
- [x] ✅ `src/types/graph-visualization.ts` - TypeScript types
- [x] ✅ `src/utils/graphVisualizationUtils.ts` - Helper functions
- [x] ✅ `src/test/VisualizerTest.tsx` - Test component
- [x] ✅ `src/gnn-visualization.ts` - Main export file
- [x] ✅ Documentation files in `docs/`

## 🧪 Step 3: Quick Test (Choose One)

### Option A: Standalone Test Component
```bash
# 1. Add route or import in your App.tsx
import VisualizerTest from './test/VisualizerTest';

# 2. Render it
<VisualizerTest />

# 3. Should see: Pulsing purple node, red particles, interactive graph
```

### Option B: Full Demo Page
```bash
# 1. Add route or import in your App.tsx
import GNNImpactDemo from './pages/GNNImpactDemo';

# 2. Render it
<GNNImpactDemo />

# 3. Click scenario buttons to test different failures
```

### Option C: Quick Import Test
```tsx
// In any component:
import { ImpactGraphVisualizer } from './gnn-visualization';

const mockData = {
  nodes: [
    { id: '1', name: 'Test', type: 'power', color: '#9F7AEA', 
      size: 10, pulse: true, probability: 100, severity: 'critical' }
  ],
  links: []
};

<ImpactGraphVisualizer visualizationData={mockData} height={400} />
```

## 🔌 Step 4: Backend Connection (Optional - Mock Data Works Too!)

### If Using Real Backend:
- [ ] 🔧 Start your backend GNN service
  ```bash
  cd backend
  node demo-gnn.js  # or your actual server
  ```

- [ ] 🔧 Update API URL if needed
  ```tsx
  // src/services/gnnImpactService.ts
  constructor(baseUrl: string = 'http://localhost:YOUR_PORT') {
  ```

- [ ] 🔧 Test API connection
  ```tsx
  import { gnnService } from './gnn-visualization';
  
  const result = await gnnService.predictImpact({
    nodeId: 'power-1',
    severity: 0.8
  });
  ```

### If Using Mock Data:
- [x] ✅ Mock data already included in demo
- [x] ✅ Toggle "Use Mock Data" checkbox in demo page
- [x] ✅ No backend needed to see it work!

## 🎨 Step 5: Integration (Choose Your Path)

### Path 1: Add to Existing Navigation
```tsx
// In your App.tsx or navigation config:
import GNNImpactDemo from './pages/GNNImpactDemo';

// Add to your route/view system:
case 'gnn-impact':
  return <GNNImpactDemo />;

// Add nav item:
{ id: 'gnn-impact', name: 'Impact Brain', icon: '🧠' }
```

### Path 2: Embed in Existing View
```tsx
// In your ImpactPredictorView or similar:
import { ImpactGraphVisualizer } from './gnn-visualization';
import { useState } from 'react';

const [graphData, setGraphData] = useState(null);

// After prediction:
setGraphData(result.visualization);

// Render:
{graphData && <ImpactGraphVisualizer visualizationData={graphData} />}
```

### Path 3: Custom Implementation
```tsx
// Build your own using the utilities:
import {
  ImpactGraphVisualizer,
  transformGNNResultToVisualization,
  calculateGraphStats
} from './gnn-visualization';

// Your custom logic here...
```

## ✅ Step 6: Verification

Open your app and check:
- [ ] 🎯 Graph renders without errors
- [ ] 🎯 Purple node pulses (breathing animation)
- [ ] 🎯 Particles flow along links
- [ ] 🎯 Hover shows node details
- [ ] 🎯 Click centers view on node
- [ ] 🎯 Zoom with mouse wheel works
- [ ] 🎯 Legend displays correctly
- [ ] 🎯 Colors match severity (red=critical, orange=high, etc.)

## 🎉 Success Indicators

You've successfully integrated when you can:
- ✅ See a force-directed graph with your infrastructure nodes
- ✅ Watch particles flow from failed node to affected nodes
- ✅ See the epicenter pulse with a breathing animation
- ✅ Hover over nodes to see impact probability
- ✅ Click scenario buttons and see graph update
- ✅ Zoom and pan smoothly with mouse

## 🐛 If Something's Wrong

| Problem | Check This |
|---------|-----------|
| Blank screen | Open browser console for errors |
| TypeScript errors | Run `npm run build` to see details |
| No particles | Check link `type: 'impact-flow'` and `particles > 0` |
| Backend fails | Toggle "Use Mock Data" to test without backend |
| Slow performance | Reduce particle count or node count |

## 📚 Need Help?

Check these docs in `docs/` folder:
1. **GNN_VISUALIZATION_SUMMARY.md** - Complete overview (start here!)
2. **GNN_VISUALIZATION_GUIDE.md** - Detailed API documentation
3. **INTEGRATION_QUICKSTART.md** - Step-by-step integration
4. Look at **VisualizerTest.tsx** for working example code

## 🚀 Next Steps After Basic Setup

Once it's working, enhance it:
- [ ] 🎨 Customize colors to match your theme
- [ ] 📊 Add real-time updates via WebSocket
- [ ] 🗺️ Use real geographic coordinates if available
- [ ] 📈 Add analytics dashboard showing stats
- [ ] 🎬 Create time-lapse replay of past failures
- [ ] 🔔 Add alerts when critical nodes are affected
- [ ] 📱 Make it responsive for mobile devices
- [ ] 🎮 Add keyboard shortcuts for power users

## 💡 Pro Tips

1. **Start with mock data** - Get the visuals working first
2. **Test with VisualizerTest.tsx** - Fastest way to verify it works
3. **Console log everything** - Use browser DevTools to debug
4. **Check network tab** - If backend calls are failing
5. **Read the code** - The components are well-commented!

---

## ✅ Final Checklist

Before considering it "done":
- [ ] ✅ Installation complete
- [ ] ✅ At least one test renders successfully
- [ ] ✅ Animations are smooth (pulsing + particles)
- [ ] ✅ Interactivity works (hover, click, zoom)
- [ ] ✅ Integrated into your app navigation OR
- [ ] ✅ Standalone demo page accessible

**When all checked** → 🎉 **YOU'RE READY TO VISUALIZE IMPACTS!**

---

## 🎓 What You Built

You now have:
- 🧠 A **Graph Neural Network backend** (already done) that predicts cascading failures
- 🎨 A **Beautiful visualization layer** (just created) that shows those predictions
- 🔥 An **Interactive experience** where users can explore impact scenarios
- 📊 **Production-ready code** with TypeScript, error handling, and docs

**This is a Digital Twin Brain Visualization** - congrats! 🚀✨
