/**
 * Stitches a coordinate system onto the village nodes
 * 
 * Layout Strategy:
 * - Spine: Main Roads at X=0 (central north-south axis)
 * - East Cluster: Buildings (schools, hospitals, markets) at X > 0
 * - West Cluster: Power infrastructure and sensors at X < 0
 * - North Cluster: Water infrastructure (tanks, pumps, pipes) at top
 * 
 * This creates realistic spatial relationships for proximity-based edge building.
 */

function stitchVillageCoordinates(villageState) {
  let roadIndex = 0;
  let buildingIndex = 0;
  let powerIndex = 0;
  let waterIndex = 0;
  let clusterIndex = 0;

  // Process roads - central spine
  if (villageState.roads) {
    villageState.roads.forEach((node) => {
      if (!node.coords && !node.path) {
        // Roads form a vertical spine at X=0, spaced 100m apart
        node.coords = [0, roadIndex * 0.001]; // ~100m spacing in lat/lng
        roadIndex++;
      }
    });
  }

  // Process buildings - East side cluster
  if (villageState.buildings) {
    villageState.buildings.forEach((node) => {
      if (!node.coords) {
        // Buildings on East side, staggered pattern
        const row = Math.floor(buildingIndex / 2);
        const col = buildingIndex % 2;
        node.coords = [0.003 + (col * 0.002), row * 0.0015]; // 300-500m East
        buildingIndex++;
      }
    });
  }

  // Process power infrastructure - West side
  if (villageState.powerNodes) {
    villageState.powerNodes.forEach((node) => {
      if (!node.coords) {
        // Power nodes on West side, linear distribution
        node.coords = [-0.004, powerIndex * 0.002]; // 400m West, 200m spacing
        powerIndex++;
      }
    });
  }

  // Process sensors - Near power nodes
  if (villageState.sensors) {
    villageState.sensors.forEach((node) => {
      if (!node.coords) {
        // Sensors near power infrastructure
        node.coords = [-0.0035, powerIndex * 0.0025]; // Close to power nodes
        powerIndex++;
      }
    });
  }

  // Process water infrastructure - North cluster
  if (villageState.waterTanks || villageState.tanks) {
    const tanks = villageState.waterTanks || villageState.tanks || [];
    tanks.forEach((node) => {
      if (!node.coords) {
        // Water tanks at the North end, elevated positions
        node.coords = [-0.002, 0.01 + (waterIndex * 0.0008)]; // North, 80m spacing
        waterIndex++;
      }
    });
  }

  if (villageState.pumps) {
    villageState.pumps.forEach((node) => {
      if (!node.coords) {
        // Pumps near tanks
        node.coords = [-0.0025, 0.01 + (waterIndex * 0.0008)];
        waterIndex++;
      }
    });
  }

  if (villageState.pipes) {
    villageState.pipes.forEach((node) => {
      if (!node.coords && !node.fromNode) {
        // Standalone pipes in water cluster
        node.coords = [-0.003, 0.01 + (waterIndex * 0.0008)];
        waterIndex++;
      }
    });
  }

  // Process consumer clusters - scattered around buildings
  if (villageState.clusters) {
    villageState.clusters.forEach((node) => {
      if (!node.coords && !node.geo) {
        // Clusters scattered near buildings, slight offset
        const row = Math.floor(clusterIndex / 2);
        const col = clusterIndex % 2;
        node.coords = [0.0045 + (col * 0.0015), row * 0.002]; // Near buildings
        clusterIndex++;
      }
    });
  }

  return villageState;
}

/**
 * Add hard-coded critical infrastructure dependencies
 * These override proximity-based connections with logical dependencies
 */
function addCriticalDependencies(graph, villageState) {
  const dependencies = [];

  // Power → Pumps (critical dependency)
  if (villageState.powerNodes && villageState.pumps) {
    villageState.powerNodes.forEach((power, pIdx) => {
      villageState.pumps.forEach((pump, pmIdx) => {
        if (pIdx === pmIdx) { // Match by index for demo
          dependencies.push({
            from: power.id,
            to: pump.pumpId || pump.id,
            weight: 1.0,
            type: 'power-supply',
            relationship: 'critical-dependency',
            bidirectional: false
          });
        }
      });
    });
  }

  // Power → Buildings (high priority)
  if (villageState.powerNodes && villageState.buildings) {
    const mainPower = villageState.powerNodes[0]; // Main transformer
    if (mainPower) {
      villageState.buildings.forEach((building) => {
        dependencies.push({
          from: mainPower.id,
          to: building.id,
          weight: 0.9,
          type: 'power-supply',
          relationship: 'powers',
          bidirectional: false
        });
      });
    }
  }

  // Tanks → Pumps → Clusters (water flow)
  if (villageState.tanks && villageState.pumps && villageState.clusters) {
    if (villageState.tanks[0] && villageState.pumps[0]) {
      dependencies.push({
        from: villageState.tanks[0].tankId || villageState.tanks[0].id,
        to: villageState.pumps[0].pumpId || villageState.pumps[0].id,
        weight: 0.95,
        type: 'water-flow',
        relationship: 'supplies',
        bidirectional: false
      });
    }

    if (villageState.pumps[0] && villageState.clusters[0]) {
      dependencies.push({
        from: villageState.pumps[0].pumpId || villageState.pumps[0].id,
        to: villageState.clusters[0].clusterId || villageState.clusters[0].id,
        weight: 0.9,
        type: 'water-flow',
        relationship: 'supplies',
        bidirectional: false
      });
    }
  }

  // Apply dependencies to graph
  dependencies.forEach(dep => {
    if (graph.nodes.has(dep.from) && graph.nodes.has(dep.to)) {
      graph.addEdge(dep.from, dep.to, dep.weight, dep.type, dep.relationship, !dep.bidirectional);
      console.log(`   ✓ Added critical dependency: ${dep.from} → ${dep.to} (${dep.relationship})`);
    }
  });

  return dependencies.length;
}

export { stitchVillageCoordinates, addCriticalDependencies };
