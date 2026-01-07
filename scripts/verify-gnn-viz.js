/**
 * Verification Script - Check GNN Visualization Setup
 * 
 * Run this to verify all files are in place and dependencies installed
 * 
 * Usage: node scripts/verify-gnn-viz.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🔍 Verifying GNN Visualization Setup...\n');

const checks = [];
let allPassed = true;

// Check package.json dependencies
function checkDependency(name) {
  try {
    const projectRoot = path.resolve(__dirname, '..');
    const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    if (deps[name]) {
      checks.push({ name: `📦 ${name}`, status: '✅', detail: `v${deps[name]}` });
      return true;
    } else {
      checks.push({ name: `📦 ${name}`, status: '❌', detail: 'NOT FOUND' });
      allPassed = false;
      return false;
    }
  } catch (err) {
    checks.push({ name: `📦 ${name}`, status: '❌', detail: err.message });
    allPassed = false;
    return false;
  }
}

// Check if file exists
function checkFile(filePath, label) {
  const projectRoot = path.resolve(__dirname, '..');
  const fullPath = path.join(projectRoot, filePath);
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    const sizeKB = (stats.size / 1024).toFixed(1);
    checks.push({ name: label, status: '✅', detail: `${sizeKB} KB` });
    return true;
  } else {
    checks.push({ name: label, status: '❌', detail: 'NOT FOUND' });
    allPassed = false;
    return false;
  }
}

// Run checks
console.log('Checking dependencies...\n');
checkDependency('react-force-graph-2d');
checkDependency('d3-scale-chromatic');
checkDependency('react');
checkDependency('typescript');

console.log('\nChecking core files...\n');
checkFile('src/components/ImpactGraphVisualizer.tsx', '🎨 ImpactGraphVisualizer');
checkFile('src/pages/GNNImpactDemo.tsx', '📄 GNNImpactDemo');
checkFile('src/services/gnnImpactService.ts', '🔌 gnnImpactService');
checkFile('src/types/graph-visualization.ts', '📘 graph-visualization types');
checkFile('src/utils/graphVisualizationUtils.ts', '🛠️  graphVisualizationUtils');
checkFile('src/test/VisualizerTest.tsx', '🧪 VisualizerTest');
checkFile('src/gnn-visualization.ts', '📦 Export index');

console.log('\nChecking documentation...\n');
checkFile('docs/GNN_VISUALIZATION_SUMMARY.md', '📚 Summary');
checkFile('docs/GNN_VISUALIZATION_GUIDE.md', '📚 Guide');
checkFile('docs/INTEGRATION_QUICKSTART.md', '📚 Quickstart');
checkFile('docs/SETUP_CHECKLIST.md', '📚 Checklist');

// Print results
console.log('\n' + '='.repeat(60));
console.log('VERIFICATION RESULTS');
console.log('='.repeat(60) + '\n');

checks.forEach(check => {
  const statusColor = check.status === '✅' ? '\x1b[32m' : '\x1b[31m';
  const resetColor = '\x1b[0m';
  console.log(`${statusColor}${check.status}${resetColor} ${check.name.padEnd(40)} ${check.detail}`);
});

console.log('\n' + '='.repeat(60));

if (allPassed) {
  console.log('\n✅ \x1b[32mALL CHECKS PASSED!\x1b[0m');
  console.log('\n🎉 Your GNN Visualization is ready to use!');
  console.log('\n📚 Next steps:');
  console.log('   1. Check docs/SETUP_CHECKLIST.md for integration steps');
  console.log('   2. Run demo: npm run dev (then navigate to demo page)');
  console.log('   3. Test component: Import VisualizerTest in your app');
  console.log('\n');
} else {
  console.log('\n❌ \x1b[31mSOME CHECKS FAILED\x1b[0m');
  console.log('\n🔧 Missing dependencies? Run:');
  console.log('   npm install react-force-graph-2d d3-scale-chromatic');
  console.log('\n📁 Missing files? They should have been created.');
  console.log('   Check if files exist in the locations listed above.');
  console.log('\n');
}

console.log('='.repeat(60) + '\n');

// Exit with appropriate code
process.exit(allPassed ? 0 : 1);
